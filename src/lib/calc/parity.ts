// The parity scans: at which monthly distances electric costs no more than gasoline, to run and in
// total. Numbers only, and cached, because one calculator answer asks for them hundreds of times.
//
// Each scan looks at 500 distances (10 to 5,000 km a month, step 10). The cost curves are not
// monotonic in km (allowance plans and fair-use limits add kinks, maintenance switches from the
// owner average to the schedule), so a bisection or a closed form could miss an interval; the
// scan is kept, but each point is now a handful of multiplications on plain numbers (amount ×
// months active) instead of a full itemised, bilingual result. Where that closed form puts a
// point within TIE of a tie, the point is recomputed with exactly the month-by-month additions the
// full result uses (running.ts typicalTotal), so every interval is the same as before to the
// kilometre.
//
// What repeats is cached: the gasoline totals depend only on the gasoline model, the horizon and
// the dataset, so every electric option in a ranking shares them; the electric totals depend on
// the model, plan, date, horizon and off-window share, not on the buyer's household or old
// scooter, so the "what would change it" re-runs reuse them. Caches are per dataset object.

import type { EconDataset, EnergyPlan, EvModel, GasModel } from '../../data/econ/types.ts';
import { electricSchedule, gasolineParts, typicalTotal, type RawItem } from './running.ts';

export const SCAN_STEP = 10;
export const SCAN_MAX_KM = 5000;
const POINTS = SCAN_MAX_KM / SCAN_STEP;
const MAX_ENTRIES = 400;

/** Cached totals at every scan distance, with the exact recomputation for any point near a tie. */
export interface Totals {
  /** Closed-form total at each distance (index i is (i + 1) × SCAN_STEP km). */
  fast: Float64Array;
  /** The same total by the full month-by-month addition (what the itemised result uses). */
  exact: (km: number) => number;
}

/** Months an entry is active within the horizon. */
function activeMonths(it: RawItem, horizon: number): number {
  const start = it.startMonth ?? 1;
  const end = it.months === undefined ? horizon : Math.min(horizon, start + it.months - 1);
  return Math.max(0, end - start + 1);
}

/**
 * The horizon total as amount × months per entry. It differs from the month-by-month sum only by
 * floating-point rounding: at most a few hundred additions of amounts under NT$1 million, so far
 * below NT$0.000001 (see TIE).
 */
export function closedTotal(items: RawItem[], horizon: number): number {
  let total = 0;
  for (const it of items) total += it.monthly.typical * activeMonths(it, horizon);
  return total;
}

/**
 * A point whose closed-form difference is this close to zero is recomputed exactly before its
 * sign is used, so a tie is decided the same way as the itemised result decides it.
 */
export const TIE = 0.01;

type Cache = Map<string, Totals>;
const caches = new WeakMap<EconDataset, Cache>();

function cacheFor(data: EconDataset): Cache {
  let c = caches.get(data);
  if (!c) {
    c = new Map();
    caches.set(data, c);
  }
  if (c.size > MAX_ENTRIES) c.clear();
  return c;
}

/** Forget every cached scan (only needed if a dataset object is changed in place). */
export function clearParityCache(data?: EconDataset): void {
  if (data) caches.delete(data);
}

function totals(key: string, data: EconDataset, rawAt: (km: number) => RawItem[], horizon: number): Totals {
  const cache = cacheFor(data);
  let out = cache.get(key);
  if (!out) {
    const fast = new Float64Array(POINTS);
    for (let i = 0; i < POINTS; i++) fast[i] = closedTotal(rawAt((i + 1) * SCAN_STEP), horizon);
    out = { fast, exact: (km: number) => typicalTotal(rawAt(km), horizon) };
    cache.set(key, out);
  }
  return out;
}

/** Typical electric running total over the horizon (setup fee at month 0 excluded) at each scan distance. */
export function electricTotals(model: EvModel, plan: EnergyPlan, on: string, data: EconDataset, horizon: number, offWindowShare: number): Totals {
  const key = `e|${model.id}|${plan.id}|${on}|${horizon}|${offWindowShare}`;
  const hit = cacheFor(data).get(key);
  if (hit) return hit;
  const sched = electricSchedule(model, plan, on, data, horizon, offWindowShare);
  return totals(key, data, (km) => sched.at(km).raw, horizon);
}

/** Typical gasoline running total over the horizon at each scan distance, at the current pump price. */
export function gasolineTotals(model: GasModel, data: EconDataset, horizon: number): Totals {
  const price = data.fuel.petrol95.value;
  return totals(`g|${model.id}|${horizon}`, data, (km) => gasolineParts(model, km, price, data).raw, horizon);
}

/**
 * f(km) = combine(electric total, gasoline total) at each scan distance, from the closed form,
 * falling back to the exact month-by-month totals where the result is within TIE of zero.
 */
export function parityFunction(e: Totals, g: Totals, combine: (eTotal: number, gTotal: number) => number): (km: number) => number {
  return (km) => {
    const i = km / SCAN_STEP - 1;
    const v = combine(e.fast[i], g.fast[i]);
    return Math.abs(v) > TIE ? v : combine(e.exact(km), g.exact(km));
  };
}
