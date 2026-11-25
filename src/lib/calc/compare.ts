// Cumulative cost series, break-even and the parity mileages.

import type { BreakEven, Bounds, RunningCosts } from './types.ts';

/** Cumulative cost at months 0..H: purchase + upfront fees at 0, then each month's running cost. */
export function cumulative(upfront: number, monthly: number[]): number[] {
  const out = [upfront];
  for (const m of monthly) out.push(out[out.length - 1] + m);
  return out;
}

/** Classify how the electric line (e) compares with the gasoline line (g), both cumulative from month 0. */
export function breakEven(e: number[], g: number[]): BreakEven {
  const H = e.length - 1;
  if (e[0] > g[0]) {
    for (let m = 1; m <= H; m++) if (e[m] <= g[m]) return { kind: 'breaks-even', month: m };
    return { kind: 'no-break-even', gapAtHorizon: Math.round(e[H] - g[H]) };
  }
  for (let m = 1; m <= H; m++) if (e[m] > g[m]) return { kind: 'gas-catches-up', month: m };
  return { kind: 'ev-ahead' };
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
 * Scan monthly km (step 10, up to 5,000) for the first interval where `f(km) <= 0`.
 * Returns null if there is none.
 */
export function scanInterval(f: (km: number) => number, maxKm = 5000, step = 10): { fromKm: number; toKm: number | null } | null {
  let from: number | null = null;
  for (let km = step; km <= maxKm; km += step) {
    const ok = f(km) <= 0;
    if (ok && from === null) from = km;
    if (!ok && from !== null) return { fromKm: from, toKm: km - step };
  }
  return from === null ? null : { fromKm: from, toKm: null };
}
