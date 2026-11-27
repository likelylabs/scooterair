// The signed 3-D simulation (推估, 2026-11-27) as typed slots a page can read.
//
// Source of truth: research/simulation/statements.json (what the site may say, with its rounded
// ranges) and results-simulation.json (the numbers behind them). The numbers are not typed here:
// they come from ./simulation-data.ts, which scripts/build-simulation-data.mjs generates from those
// files and scripts/check-data.mjs re-generates and compares on every `npm run check`.
//
//   import { sim, simRange, simStamp } from '@/data/simulation';
//   <EstimateValue locale={locale} slotId="sim.co.oneRed15" value={simRange('sim.co.oneRed15')} />
//   formatEstimate(simRange('sim.co.oneRed15'), 'zh-TW').text   // '約 0.1 到 4 ppm'
//
// Rules this module keeps (statements.json, and the hard rules of the job that put it on the site):
// - Every value is an estimate and prints as a range with 約 / about. The one single value,
//   `nearTailpipeAbout`, is printed in statement 1's own words, 「最多約 5」 / "up to about 5"
//   (it equals the middle case of #37), always beside the 0.1–4 range.
// - The one-second ranges (`burst1s`, `burst1sHeld`) are never printed beside the WHO 15-minute
//   or 1-hour value; the 15-minute slots are the only ones a page may set against 87 ppm.
// - Nothing here ranks carbon monoxide, benzene and particles, and nothing says anything about
//   health from one red light.

import type { EstRange } from './estimate.ts';
import type { L10n } from './types.ts';
import { t } from './types.ts';
import { simData } from './simulation-data.ts';

const S = simData.statements;

const range = (lo: number, hi: number, unit: EstRange['unit'], anchor: EstRange['anchor'] = 'simulation'): EstRange => ({ lo, hi, unit, kind: 'estimate', rounding: 'as-given', anchor });
const SC = simData.smellChemicals;

export const simMeta = {
  signed: simData.signed,
  /** Printed on every simulation sheet in place of the 90-second estimate's stamp. */
  stamp: t(`推估・電腦算的一個紅燈・${simData.signed}`, `Estimate · one red light, simulated · ${simData.signed}`),
  files: {
    answer: 'research/simulation/ANSWER.md',
    method: 'research/simulation/METHOD.md',
    results: 'research/simulation/results-simulation.json',
    statements: 'research/simulation/statements.json',
    extract: 'research/simulation/site-extract.json',
  },
} as const;

export const sim = {
  meta: simMeta,
  /** WHO 15-minute carbon monoxide value as the results file names it (87 ppm). */
  who15min_ppm: simData.who15min_ppm,
  co: {
    /** Statement 1: one red light, as a 15-minute average, open street, kerb (0.1–4 ppm). */
    oneRed15: range(S.oneRed15.lo, S.oneRed15.hi, 'ppm'),
    /** Statement 1's add-on: "up to about 5 directly behind a tailpipe in near-calm air" (= #37's middle case). */
    nearTailpipeAbout: S.oneRed15.nearTailpipeAbout,
    /** Statement 2: every red for 15 minutes, wind held from the scooters (3–16 ppm). */
    stay15: range(S.stay15.lo, S.stay15.hi, 'ppm'),
    /** Statement 3: the pushchair exception, middle cases only (35–56 ppm). */
    pushchairMiddle: range(S.pushchair.medianLo, S.pushchair.medianHi, 'ppm'),
    /** Statement 3: "1 in 10 to 1 in 5 such 15-minute periods" pass 87 ppm. */
    pushchairOneIn: { lo: S.pushchair.oneInLo, hi: S.pushchair.oneInHi },
    /** Statement 3: the height where it happens (about 0.6 m, low in the pushchair). */
    pushchairHeight_m: S.pushchair.height_m,
    /** Statement 4: highest one second at half a metre, usually (5–30 ppm). Never beside a guideline. */
    burst1s: range(S.bursts.usualLo, S.bursts.usualHi, 'ppm'),
    /** Statement 4: the same with the wind from the scooters or near-still air (100–300 ppm). */
    burst1sHeld: range(S.bursts.heldLo, S.bursts.heldHi, 'ppm'),
    /** Statement 4: one-second values uncertain about this many times. */
    burstUncertainTimes: S.bursts.uncertainTimes,
  },
  benzene: {
    /** Statement 8: an hour at the kerb, wind from the scooters, times California's 1-hour reference (1–4). */
    stay1hTimes: range(S.benzeneStay.timesLo, S.benzeneStay.timesHi, 'ratio'),
    reference_ppb: S.benzeneStay.reference_ppb,
    referenceBasis_h: S.benzeneStay.referenceBasis_h,
    emissionUncertain: { lo: S.benzeneStay.emissionUncertainLo, hi: S.benzeneStay.emissionUncertainHi },
  },
  height: {
    /** Statement 5: pushchair height against an adult's nose, wind from the scooters (about the same to twice). */
    ratio: range(S.height.ratioLo, S.height.ratioHi, 'ratio'),
    pushchair_m: S.height.height_m,
  },
  arcade: {
    /** Statement 10: 1–3 m inside an arcade, one light-wind red (1–4 ppm). */
    inside: range(S.arcade.lo, S.arcade.hi, 'ppm'),
  },
  /**
   * The smell-chemicals step (research/simulation/smell-chemicals, statements-smell.json). Seconds-long
   * levels only: never printed beside a 30-minute, 1-hour or yearly value (must-not 3), always with
   * the share of seconds, the number of runs and the condition (must-not 7).
   */
  smell: {
    /** how-much-just-smellable: the two smell tests' typical values, 「約 2 到 15 ppb」 (full range 0.4–60 in words). */
    benzeneJust: range(SC.just.wordsLo, SC.just.wordsHi, 'ppb', 'smell'),
    /** level-in-smellable-seconds: the full range, 「約 2 到 360 ppb」, printed after 「大約 30」. */
    benzeneSeconds: range(SC.seconds.wordsRangeLo, SC.seconds.wordsRangeHi, 'ppb', 'smell'),
  },
} as const;

/** The smell-chemicals numbers as generated (shares, draws, the detail table). Read-only. */
export const simSmell = SC;
/** The signed smell files the site serves as published (src/pages/research/smell-chemicals/); link them with asset(). */
export const smellFiles = {
  method: '/research/smell-chemicals/METHOD-SMELL.md',
  results: '/research/smell-chemicals/results-smell.json',
} as const;

export type SimSlot =
  | 'sim.co.oneRed15'
  | 'sim.co.stay15'
  | 'sim.co.pushchairMiddle'
  | 'sim.co.burst1s'
  | 'sim.co.burst1sHeld'
  | 'sim.benzene.stay1hTimes'
  | 'sim.height.ratio'
  | 'sim.arcade.inside'
  | 'sim.smell.benzeneJust'
  | 'sim.smell.benzeneSeconds';

export const simSlots: SimSlot[] = ['sim.co.oneRed15', 'sim.co.stay15', 'sim.co.pushchairMiddle', 'sim.co.burst1s', 'sim.co.burst1sHeld', 'sim.benzene.stay1hTimes', 'sim.height.ratio', 'sim.arcade.inside', 'sim.smell.benzeneJust', 'sim.smell.benzeneSeconds'];

/** The range behind a simulation slot. Throws on an unknown slot, so a typo fails the build. */
export function simRange(slot: SimSlot): EstRange {
  const parts = slot.split('.');
  if (parts[0] !== 'sim') throw new Error(`[simulation] "${slot}" is not a simulation slot`);
  let node: unknown = sim;
  for (const p of parts.slice(1)) node = (node as Record<string, unknown> | undefined)?.[p];
  const r = node as EstRange | undefined;
  if (!r || typeof r.lo !== 'number' || typeof r.hi !== 'number' || r.kind !== 'estimate') throw new Error(`[simulation] Unknown or incomplete slot "${slot}"`);
  return r;
}

/** The two one-second series of chart (a), as generated (one emission draw each, rounded to 0.1). */
export const simSeries = simData.series;

/** The rows of chart (c): smell shares (#20, #19) and benzene for people who stay (#7, #8). */
export const simAbove = {
  smell: S.smell.cases,
  benzene: S.benzeneStay.rows,
};

export const simStamp: L10n = simMeta.stamp;
/** The words after the 推估 chip wherever the simulation is shown beside the older 90-second estimate. */
export const simChipWhere: L10n = t('電腦算的一個紅燈', 'one red, simulated');

/**
 * Screen 5's `far` headline (「…等一個紅燈，仍低於指引值」) and the one-page brief's print only while
 * this holds: the 15-minute values of one red, of every red with the wind held, and of one red
 * right behind a tailpipe are all below the WHO 15-minute value. The pushchair exception is a
 * stay-through case and is printed beside the headline, never folded into it.
 */
export function simBelowWho(): boolean {
  const who = sim.who15min_ppm;
  return sim.co.oneRed15.hi < who && sim.co.stay15.hi < who && sim.co.nearTailpipeAbout < who;
}
