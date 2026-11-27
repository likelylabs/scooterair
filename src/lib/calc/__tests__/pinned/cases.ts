// A spread of situations whose numbers are pinned (pinned-outputs.json), so a change made for speed
// or tidiness cannot move any result by a dollar. Regenerate only for a deliberate data or rule
// change, and say which cases moved and why:   node src/lib/calc/__tests__/pinned/generate.ts

import { econData } from '../../../../data/econ/index.ts';
import type { EconDataset } from '../../../../data/econ/types.ts';
import { bestOptions, evaluate } from '../../index.ts';
import type { Bounds, Evaluation, Situation } from '../../types.ts';

const JURS = Object.keys(econData.jurisdictions) as Situation['jurisdiction'][];
const PAIRS: [string, string][] = [
  ['gogoro-ezzy', 'gogoro-488'],
  ['gogoro-ezzy', 'gogoro-payg-single'],
  ['gogoro-ezzy-500', 'gogoro-819-dual'],
  ['gogoro-ezzy-500', 'gogoro-1269-dual'],
  ['ionex-coolone', 'ionex-318-single'],
  ['ionex-ione-fly-techno', 'ionex-818-dual'],
  ['zau-es1000', 'home-charging'],
  ['gogoro-ezzy-500', 'gogoro-payg-dual'],
];
const GAS = ['kymco-new-haomai-125-drum', 'yamaha-jog-125', 'sym-duke-125-drum', 'kymco-k1-125'];
const SCRAPS: Situation['scrap'][] = [
  null,
  { engine: 'four-stroke', builtOn: '2008-05' },
  { engine: 'two-stroke', builtOn: '2002-06' },
  { engine: 'four-stroke', builtOn: '2017-02' },
  { engine: 'four-stroke', builtOn: '2014-03' },
];
const HOUSEHOLDS: Situation['household'][] = [{}, { childUnder12: true, age: 35 }, { income: 'low', age: 70 }, { age: 24, income: 'middle-low' }];
const KMS = [150, 300, 500, 1000, 1500, 3000];
const DATES = ['2026-11-26', '2026-11-30', '2026-12-01', '2026-12-31', '2027-01-05'];

/** Deterministic spread: every jurisdiction, each pair, scrap kind, household, distance and date appears. */
export function cases(): Situation[] {
  const out: Situation[] = [];
  let i = 0;
  for (const j of JURS) {
    for (let k = 0; k < 7; k++, i++) {
      const [electricModel, energyPlan] = PAIRS[(i * 3 + k) % PAIRS.length];
      out.push({
        jurisdiction: j,
        electricModel,
        energyPlan,
        gasolineModel: GAS[(i + k) % GAS.length],
        scrap: SCRAPS[(i * 7 + k) % SCRAPS.length],
        household: HOUSEHOLDS[(i + 2 * k) % HOUSEHOLDS.length],
        monthlyKm: KMS[(i * 5 + k) % KMS.length],
        date: DATES[k % DATES.length],
      });
    }
  }
  return out;
}

export function rankingCases(): Omit<Situation, 'electricModel' | 'energyPlan'>[] {
  return ['taipei', 'kaohsiung', 'kinmen', 'new-taipei', 'taitung', 'keelung', 'taichung'].map((j, i) => ({
    jurisdiction: j as Situation['jurisdiction'],
    gasolineModel: GAS[i % GAS.length],
    scrap: SCRAPS[i % SCRAPS.length],
    household: HOUSEHOLDS[i % HOUSEHOLDS.length],
    monthlyKm: KMS[(i * 2) % KMS.length],
    date: DATES[i % 3],
  }));
}

const bb = (x: Bounds) => [x.low, x.typical, x.high];

/** Every number a reader sees from an evaluation (texts are not pinned). */
export function fingerprint(e: Evaluation) {
  const c = e.comparison;
  const H = c.cumulative.months.length - 1;
  const side = (s: 'electric' | 'gasoline') => {
    const p = e[s].purchase;
    const r = e[s].running;
    return {
      list: p.listPrice.value,
      net: [p.net.value, p.net.high],
      lines: p.lines.map((l) => [l.id, l.amount, l.paid, l.deadline?.date ?? null]),
      excluded: p.excluded.map((x) => [x.id, x.reason, x.amount]),
      paidLater: p.paidLater,
      monthly: bb(r.monthly),
      avg: bb(r.averageMonthly),
      perKm: r.perKm ? bb(r.perKm) : null,
      upfront: r.upfront,
      items: r.items.map((it) => [it.id, ...bb(it.monthly)]),
      credits: r.planCredits.applied.map((x) => x.id),
      end: bb(c.cumulative[s][H]),
      m12: bb(c.cumulative[s][Math.min(12, H)]),
    };
  };
  return {
    electric: side('electric'),
    gasoline: side('gasoline'),
    purchaseGap: [c.purchaseGap, c.purchaseGapHigh],
    likeForLike: c.likeForLike.verdict,
    breakEven: c.breakEven,
    range: [c.breakEvenRange.best, c.breakEvenRange.worst],
    runningParity: c.runningParityIntervals,
    totalParity: c.totalParityIntervals,
    withoutSmoothing: [c.withoutSmoothing.gasolineMonthly, c.withoutSmoothing.gasolineMonthlyHigh, c.withoutSmoothing.breakEven],
  };
}

export function rankingFingerprint(b: ReturnType<typeof bestOptions>) {
  return {
    gasNet: b.gasolineNet,
    gasTotal: b.gasolineFiveYearTotal,
    byTotal: b.byFiveYearTotal.map((o) => [o.electricModel, o.energyPlan, o.netPrice, o.fiveYearTotal.typical, o.fiveYearGap]),
    byNet: b.byNetPrice.map((o) => `${o.electricModel}::${o.energyPlan}`),
    closest: [b.closestToParity?.energyPlan ?? null, b.closestToParityLikeForLike?.energyPlan ?? null, b.closestToParitySamePlateClass?.energyPlan ?? null],
  };
}

export function compute(data: EconDataset = econData) {
  return {
    evaluations: cases().map((s) => fingerprint(evaluate(s, data))),
    rankings: rankingCases().map((s) => rankingFingerprint(bestOptions(s, data))),
  };
}
