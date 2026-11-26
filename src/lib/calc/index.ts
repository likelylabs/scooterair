// Public API of the price-parity and running-cost calculator. Pure, dependency-free TypeScript:
// runs at build time (Astro frontmatter, Node) and in the browser.
//
//   import { evaluate, bestOptions, toWaterfall, toLedgerRows, toBreakEven } from '@/lib/calc';
//
//   const e = evaluate({
//     jurisdiction: 'taipei',
//     scrap: { engine: 'two-stroke', builtOn: '2002-06' },
//     household: { childUnder12: true, age: 38 },
//     electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', gasolineModel: 'kymco-new-haomai-125-drum',
//     monthlyKm: 500, date: '2026-11-25',
//   });
//   e.electric.purchase.lines      // each subsidy as its own line (amount, condition text, deadline, quota, sources)
//   e.electric.purchase.excluded   // what was considered and why it is not counted
//   e.comparison.purchaseGap       // electric net − gasoline net
//   e.comparison.breakEven         // { kind: 'breaks-even', month } | { kind: 'no-break-even', ... } | ...
//   e.messages                     // deadlines, exhausted quotas, ambiguities, secondary inputs (L10n)
//
// Dates are calendar dates in Taiwan (UTC+8). Omit `date` to evaluate for today in Taiwan, whatever
// the browser's time zone; todayInTaiwan() gives the same date for display. Invalid input (an
// unknown id, a bad date, NaN, Infinity, zero or negative km, a fractional horizon...) throws a
// CalcInputError whose `issues` name each field; validateSituation() returns the same list
// without throwing.
//
// Every function takes the dataset as an optional last argument (defaults to the published
// econData), so tests and previews can pass a fixture.

import { econData } from '../../data/econ/index.ts';
import type { EconDataset } from '../../data/econ/types.ts';
import { bestOptions as rank, bestOptionsInSlices as rankInSlices, changeDates as changes, evaluate as run, validateSituation as validate } from './evaluate.ts';
import type { BestOptions, Evaluation, InputIssue, Situation } from './types.ts';

export * from './types.ts';
export { toWaterfall, toLedgerRows, toBreakEven, breakEvenText, lineLabel, formatNtd, label } from './adapters.ts';
export { reasonText, ui as calcText, horizonText, daysLeftText } from './text.ts';
export { purchaseLedger, select, programmeDeadline, promoDeadline } from './purchase.ts';
export { electricRunning, gasolineRunning, evEnergy, gasFuel, maintenanceMonthly } from './running.ts';
export { breakEven, cumulative, scanInterval, scanIntervals } from './compare.ts';
export { clearParityCache } from './parity.ts';
export { boundaryDates, breakEvenPhrase, rankingPairs, DEFAULT_OFF_WINDOW_SHARE, SMALL_QUOTA, STALE_AFTER_DAYS } from './evaluate.ts';
export { todayInTaiwan, taiwanDate, evaluationDate, isCalendarDate, daysBetween, cmp as compareDates } from './dates.ts';

/** Evaluate one situation end to end. */
export function evaluate(situation: Situation, data: EconDataset = econData): Evaluation {
  return run(situation, data);
}

/** Every problem with a situation's input ([] when valid); evaluate() throws a CalcInputError with the same list. */
export function validateSituation(situation: Partial<Situation>, data: EconDataset = econData): InputIssue[] {
  return validate(situation, data);
}

/** Rank every available electric model and plan by net price and by total cost at the horizon. */
export function bestOptions(situation: Omit<Situation, 'electricModel' | 'energyPlan'>, data: EconDataset = econData): BestOptions {
  return rank(situation, data);
}

/**
 * bestOptions in slices that yield to the browser between them (same result), so a page can rank
 * every option without freezing input. Or run the engine in a worker: see ./worker.ts.
 */
export function bestOptionsInSlices(
  situation: Omit<Situation, 'electricModel' | 'energyPlan'>,
  data: EconDataset = econData,
  opts: { batch?: number; pause?: () => Promise<void>; signal?: AbortSignal } = {},
): Promise<BestOptions> {
  return rankInSlices(situation, data, opts);
}

/**
 * The later dates on which this situation's result changes (a local programme closing on
 * 30 November, the 2026 programmes ending on 31 December, an offer or credit ending...), each
 * with its evaluation, so a page built today can show the variant that is true on the reader's day.
 */
export function changeDates(situation: Situation, data: EconDataset = econData, until?: string): { date: string; evaluation: Evaluation }[] {
  return changes(situation, data, until);
}

/** Models, plans and jurisdictions available to the calculator (for building pickers). */
export function catalogue(data: EconDataset = econData) {
  return {
    jurisdictions: Object.values(data.jurisdictions).map((j) => ({ id: j.id, name: j.name, status: j.status })),
    electricModels: data.evModels.map((m) => ({
      id: m.id,
      brand: m.brand,
      name: m.name,
      plateClass: m.plateClass,
      plans: m.plans,
      available: m.calculator === true,
      ...(m.calculator !== true ? { why: m.calculator.excluded } : {}),
    })),
    gasolineModels: data.gasModels.map((m) => ({ id: m.id, brand: m.brand, name: m.name, available: m.calculator === true, ...(m.calculator !== true ? { why: m.calculator.excluded } : {}) })),
    plans: data.plans.map((p) => ({ id: p.id, name: p.name, available: p.calculator === true })),
    checkedOn: data.meta.checkedOn,
  };
}
