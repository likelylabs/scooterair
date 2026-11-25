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
// Every function takes the dataset as an optional last argument (defaults to the published
// econData), so tests and previews can pass a fixture.

import { econData } from '../../data/econ/index.ts';
import type { EconDataset } from '../../data/econ/types.ts';
import { bestOptions as rank, evaluate as run } from './evaluate.ts';
import type { BestOptions, Evaluation, Situation } from './types.ts';

export * from './types.ts';
export { toWaterfall, toLedgerRows, toBreakEven, breakEvenText, lineLabel, formatNtd, label } from './adapters.ts';
export { reasonText, ui as calcText } from './text.ts';
export { purchaseLedger, select } from './purchase.ts';
export { electricRunning, gasolineRunning, evEnergy, gasFuel } from './running.ts';
export { breakEven, cumulative } from './compare.ts';

/** Evaluate one situation end to end. */
export function evaluate(situation: Situation, data: EconDataset = econData): Evaluation {
  return run(situation, data);
}

/** Rank every available electric model and plan by net price and by five-year total. */
export function bestOptions(situation: Omit<Situation, 'electricModel' | 'energyPlan'>, data: EconDataset = econData): BestOptions {
  return rank(situation, data);
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
