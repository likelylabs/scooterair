// Cumulative cost series, break-even and the parity mileages.

import type { BreakEven, Bounds, RunningCosts } from './types.ts';

/** Cumulative cost at months 0..H: purchase + upfront fees at 0, then each month's running cost. */
export function cumulative(upfront: number, monthly: number[]): number[] {
  const out = [upfront];
  for (const m of monthly) out.push(out[out.length - 1] + m);
  return out;
}

/**
 * Classify how the electric line (e) compares with the gasoline line (g), both cumulative from
 * month 0. The answer is decided by where the lines stand at the horizon, not by the first time
 * they touch: a setup-fee renewal can push electric back above gasoline after an early crossing,
 * and the lines can cross back the other way too. `month` is the last crossing, after which the
 * order holds to the horizon; `crossings` lists every month in which the order changed.
 */
export function breakEven(e: number[], g: number[]): BreakEven {
  const H = e.length - 1;
  const above = (m: number) => e[m] > g[m];
  const crossings: number[] = [];
  for (let m = 1; m <= H; m++) if (above(m) !== above(m - 1)) crossings.push(m);
  const gapAtHorizon = Math.round(e[H] - g[H]);
  const detail = { gapAtHorizon, crossings, horizonMonths: H };
  const last = crossings[crossings.length - 1];
  if (above(0)) {
    if (!above(H)) return { kind: 'breaks-even', month: last, ...detail };
    return { kind: 'no-break-even', ...detail };
  }
  if (above(H)) return { kind: 'gas-catches-up', month: last, ...detail };
  return { kind: 'ev-ahead', runningCheaper: e[H] - e[0] <= g[H] - g[0], ...detail };
}

export function series(purchaseEv: { value: number; high: number }, purchaseGas: number, ev: RunningCosts, gas: RunningCosts) {
  const H = ev.schedule.typical.length;
  const e = {
    low: cumulative(purchaseEv.value + ev.upfront, ev.schedule.low),
    typical: cumulative(purchaseEv.value + ev.upfront, ev.schedule.typical),
    high: cumulative(purchaseEv.high + ev.upfront, ev.schedule.high),
  };
  const g = {
    low: cumulative(purchaseGas + gas.upfront, gas.schedule.low),
    typical: cumulative(purchaseGas + gas.upfront, gas.schedule.typical),
    high: cumulative(purchaseGas + gas.upfront, gas.schedule.high),
  };
  const months = Array.from({ length: H + 1 }, (_, i) => i);
  const pick = (x: { low: number[]; typical: number[]; high: number[] }): Bounds[] =>
    months.map((i) => ({ low: Math.round(x.low[i]), typical: Math.round(x.typical[i]), high: Math.round(x.high[i]) }));
  return {
    months,
    electric: pick(e),
    gasoline: pick(g),
    breakEven: breakEven(e.typical, g.typical),
    best: breakEven(e.low, g.high),
    worst: breakEven(e.high, g.low),
    raw: { e, g },
  };
}

/**
 * Scan monthly km (step 10, up to 5,000) for every interval where `f(km) <= 0`, in order. The
 * cost curves are not always monotonic in km (allowance plans, fair-use thresholds), so there can
 * be more than one.
 */
export function scanIntervals(f: (km: number) => number, maxKm = 5000, step = 10): { fromKm: number; toKm: number | null }[] {
  const out: { fromKm: number; toKm: number | null }[] = [];
  let from: number | null = null;
  for (let km = step; km <= maxKm; km += step) {
    const ok = f(km) <= 0;
    if (ok && from === null) from = km;
    if (!ok && from !== null) {
      out.push({ fromKm: from, toKm: km - step });
      from = null;
    }
  }
  if (from !== null) out.push({ fromKm: from, toKm: null });
  return out;
}

/** The first interval of `scanIntervals`, or null if there is none. */
export function scanInterval(f: (km: number) => number, maxKm = 5000, step = 10): { fromKm: number; toKm: number | null } | null {
  return scanIntervals(f, maxKm, step)[0] ?? null;
}
