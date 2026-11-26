// The home page's numbers, read at build time from the three places a number may come from:
// the signed estimate (src/data/estimate.ts), the fact registry (src/data/facts.ts) and the
// film's timeline. Nothing here is typed in: a slot that is missing throws, and the build fails
// (docs/redesign-brief.md 3.3: "If a slot is missing the build fails").
//
// It also holds the guards for the two sentences whose words stand for a number
// (「一天到一天半」 on screen 7, 「三分之一左右」 on screen 12): if the arithmetic behind them
// moves, the build stops and the sentence has to be rewritten, instead of going stale.

import * as timeline from '../film/timeline.ts';
import { est, time, dose } from '../../../data/estimate.ts';
import { fact, type FactId } from '../../../data/facts.ts';
import type { Datum } from '../../../data/types.ts';

type Loc = 'zh-TW' | 'en';

/** A number in a registry fact's data, by key. Throws when it is not there. */
export function datum(id: FactId, key: string): number {
  const d = (fact(id).data as Record<string, Datum> | undefined)?.[key];
  if (!d || !Number.isFinite(d.value)) throw new Error(`home: the registry fact ${id} has no data.${key}`);
  return d.value;
}
/** A length the registry holds in metres, in whole centimetres. */
export const cm = (id: FactId, key: string): number => Math.round(datum(id, key) * 100);
/** A fact backs a sentence only while the registry marks it verified against its source. */
export const verified = (id: FactId): boolean => fact(id).confidence === 'verified';

/** film.duration: the film's length in seconds, from its timeline (never typed). */
export function filmSeconds(): number {
  const t = timeline as unknown as { DURATION?: number; duration?: number; T?: { total?: number } };
  const s = t.DURATION ?? t.duration ?? t.T?.total;
  if (typeof s !== 'number' || !Number.isFinite(s) || s <= 0) throw new Error('home: the film timeline exports no duration (film.duration); src/components/pages/film/timeline.ts must export DURATION in seconds.');
  return s;
}
/** The length in words, to the nearest half minute: 113 s → 「2 分鐘」, 95 s → 「1 分半」. */
export function filmLength(text: { minutes: string; minute: string; halfMinutes: string }, seconds = filmSeconds()): string {
  const halves = Math.max(2, Math.round(seconds / 30));
  const whole = Math.floor(halves / 2);
  if (halves % 2) return text.halfMinutes.replace('{n}', String(whole));
  return whole === 1 ? text.minute : text.minutes.replace('{n}', String(whole));
}

/** Screen 7: the day-words of the three body sentences, checked against the arithmetic. */
const DAY_WORDS: Record<2 | 4 | 6, { lo: number; hi: number }> = { 2: { lo: 12, hi: 18 }, 4: { lo: 24, hi: 36 }, 6: { lo: 36, hi: 55 } };
export function guardDayWords(): void {
  for (const n of [2, 4, 6] as const) {
    const h = time.hoursPerYear[n];
    if (h.lo !== DAY_WORDS[n].lo || h.hi !== DAY_WORDS[n].hi)
      throw new Error(`home screen 7: time.hoursPerYear[${n}] is now ${h.lo}–${h.hi} hours, but the sentence home.s7.body.${n} was written for ${DAY_WORDS[n].lo}–${DAY_WORDS[n].hi}. Rewrite the sentence and this table together.`);
  }
}
/** Screen 12: 「三分之一左右」 holds only while the published range sits around a third. */
export function guardThird(): void {
  const s = est.inspect.top10share;
  if (s.lo < 25 || s.hi > 45 || s.lo > 34 || s.hi < 33) throw new Error(`home screen 12: inspect.top10share is now ${s.lo}–${s.hi}%; 「三分之一左右」 / "about a third" in home.s12.body no longer describes it. Rewrite the sentence.`);
}

/** Every number the fifteen screens print that is not an EstimateValue or a money figure. */
export function homeFigures(locale: Loc) {
  guardDayWords();
  guardThird();
  const readings = est.recipe.inspectionReadings;
  const usdMillion = datum('liou-wu-2021-electric-scooter-benefit', 'healthUsdMillion');
  const peaks = est.meas.iot.co.peaks;
  return {
    red: est.signal.redLength_s,
    wait: est.signal.pedWait,
    drawn: est.scn.dozen.drawn,
    dozen: est.scn.dozen,
    /** 排氣管 50 公分 · 待轉區 50 公分以上 · 怠速 3 分鐘 */
    tailpipeCm: cm('iot-exhaust-height-assumption', 'exhaustHeight'),
    gapCm: cm('marking-rules-turn-box', 'turnBoxGap'),
    idleMinutes: datum('idling-regulation', 'minutes'),
    /** 907 萬 in Chinese, 9.07 million in English */
    readings: locale === 'en' ? (readings / 1e6).toFixed(2) : String(Math.round(readings / 1e4)),
    canMl: est.emit.co.perRedSum.canMl,
    sites: est.meas.iot.sites.value,
    peakSites: est.meas.iot.co.peakSites,
    peakLo: Math.min(...peaks),
    peakHi: Math.max(...peaks),
    studies: datum('hei-sr23-trap-associations', 'studies'),
    walkHours: datum('mccreanor2007-london-walk', 'exposureHours'),
    walkPeople: datum('mccreanor2007-london-walk', 'participants'),
    peakMinutes: datum('lung2025-peaks-hrv', 'peakMinutes'),
    peakPeople: datum('lung2025-peaks-hrv', 'participants'),
    dosePct: dose.dayShare.underPct,
    child: est.child.airPerKg,
    commute: est.commute.pm25,
    mask: {
      tested: datum('mask-carbon-mol-2005', 'tested'),
      passed: datum('mask-carbon-mol-2005', 'passed'),
      minutes: datum('mask-carbon-mol-2005', 'standardMinutes'),
      people: datum('mask-ilosh-taiwan', 'subjects'),
      n95: datum('mask-ilosh-taiwan', 'headbandN95'),
      medical: datum('mask-ilosh-taiwan', 'medical'),
    },
    /** about US$1 billion → 10 億美元 / 1 billion; at NT$30 to the dollar (the fact's own conversion) → 300 億 / 30 billion */
    national: {
      usd: locale === 'en' ? String(Math.round(usdMillion / 1000)) : String(Math.round(usdMillion / 100)),
      ntd: locale === 'en' ? String(Math.round((usdMillion * 30) / 1000)) : String(Math.round((usdMillion * 30) / 1000) * 10),
    },
  };
}
