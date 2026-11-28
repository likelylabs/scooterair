/**
 * The simulation's charts as data (/estimate/#simulation; SimCompare also on home screen 5):
 *
 *   simCompareModel()   (b) like with like: 15-minute carbon monoxide averages against the WHO
 *                           15-minute value, one linear ppm axis
 *   simSecondsModel()   (a) bursts: two one-second series, each sorted from most to least, on one
 *                           shared axis, with each panel's own average over the red. No guideline
 *   simAboveModel()     (c) two small charts, never merged: the share of the red you can smell it,
 *                           and benzene for people who stay an hour against California's 1-hour value
 *
 * Every figure is read from src/data/simulation.ts (generated from research/simulation); nothing is
 * typed here. Rules the models keep (research/simulation/statements.json):
 *   - every estimate is a band (a range); its middle is never marked
 *   - one statistic per chart, named in its table
 *   - no 1-second, 10-second or 90-second value on chart (b); no guideline on chart (a)
 *   - no number above the WHO value for the pushchair row of (b): its high end is an arrow and words
 *   - nothing ranks carbon monoxide, benzene and particles
 */
import { formatEstNumber, formatEstimate } from '../../../data/estimate.ts';
import { sim, simAbove, simRange, simSeries, simSmell, type SimSlot } from '../../../data/simulation.ts';
import { facts } from '../../../data/facts.ts';
import { chartText, fill } from '../strings.ts';
import type { ChartTable } from './shared.ts';
import type { Loc } from './html.ts';

const num = (v: number, locale: Loc) => formatEstNumber(v, 'as-given', locale);
const paren = (a: string, b: string, locale: Loc) => (locale === 'en' ? `${a} (${b})` : `${a}（${b}）`);
const ppm = (v: number, locale: Loc) => `${num(v, locale)} ppm`;

/** A round number at or above v on a 1-2-5 × 10ⁿ ladder, for an axis end. */
export function niceTop(v: number): number {
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v - 1e-9) return +(m * p).toPrecision(3);
  return 10 * p;
}

/** Evenly spaced ticks from 0 to max, about `n` of them, on round steps. */
export function ticksTo(max: number, n = 5): number[] {
  const raw = max / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw - 1e-9) ?? 10 * p;
  const out: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toPrecision(6));
  return out;
}

// ---------------------------------------------------------------------------------------------
// (b) like with like: 15-minute averages
// ---------------------------------------------------------------------------------------------

export interface SimCompareRow {
  id: 'one-red' | 'stay' | 'pushchair';
  label: string;
  sub: string;
  /** as printed, without the unit: 「約 0.1 到 4」 (the pushchair row starts with 中間的情形) */
  value: string;
  unit: string;
  slot: SimSlot;
  band: { lo: number; hi: number };
  /** the pushchair row only: an arrow from the band's end to the axis end, with its words */
  over?: string;
  /** a lower-confidence row is drawn lighter AND says 信心低 in its sub, never by colour alone */
  lowConfidence?: boolean;
}

export interface SimCompareModel {
  /** the compact form's words (home screen 5): shorter labels, one caption */
  short: { rows: { label: string; sub?: string; over?: string }[]; whoLine: string; whoNote: string; caption: string };
  title: string;
  axis: { max: number; ticks: number[]; label: string };
  who: { value: number; line: string; note: string };
  rows: SimCompareRow[];
  caption: string[];
  summary: string;
  table: ChartTable;
}

export function simCompareModel(locale: Loc): SimCompareModel {
  const T = chartText.sim.compare;
  const who = sim.who15min_ppm;
  const whoText = ppm(who, locale);
  const f = (slot: SimSlot) => formatEstimate(simRange(slot), locale);
  const one = f('sim.co.oneRed15');
  const stay = f('sim.co.stay15');
  const mid = f('sim.co.pushchairMiddle');
  const middleWord = T.pushchair.middle[locale];
  const rows: SimCompareRow[] = [
    { id: 'one-red', label: T.oneRed.label[locale], sub: fill(T.oneRed.sub, locale, { near: num(sim.co.nearTailpipeAbout, locale) }), value: one.textNoUnit, unit: one.unit, slot: 'sim.co.oneRed15', band: { lo: sim.co.oneRed15.lo, hi: sim.co.oneRed15.hi } },
    { id: 'stay', label: T.stay.label[locale], sub: T.stay.sub[locale], value: stay.textNoUnit, unit: stay.unit, slot: 'sim.co.stay15', band: { lo: sim.co.stay15.lo, hi: sim.co.stay15.hi } },
    {
      id: 'pushchair',
      label: T.pushchair.label[locale],
      sub: T.pushchair.sub[locale],
      value: `${middleWord}${locale === 'en' ? ' ' : ''}${mid.textNoUnit}`,
      unit: mid.unit,
      slot: 'sim.co.pushchairMiddle',
      band: { lo: sim.co.pushchairMiddle.lo, hi: sim.co.pushchairMiddle.hi },
      over: fill(T.pushchair.over, locale, { who: whoText }),
      lowConfidence: true,
    },
  ];
  // the axis runs past the WHO value so the arrow can cross it; its end is a round number
  const max = niceTop(who * 1.12);
  const est = locale === 'en' ? 'Estimate' : '推估';
  const table: ChartTable = {
    head: T.tableHead.map((h) => h[locale]),
    rows: [
      [paren(rows[0].label, rows[0].sub, locale), paren(one.text, est, locale)],
      [paren(rows[1].label, rows[1].sub, locale), paren(stay.text, est, locale)],
      [paren(rows[2].label, rows[2].sub, locale), paren(fill(T.tableOver, locale, { middle: `${middleWord}${locale === 'en' ? ' ' : ''}${mid.text}`, who: whoText }), locale === 'en' ? 'Estimate, low confidence' : '推估，信心低', locale)],
      [T.tableWho[locale], paren(locale === 'en' ? `about ${whoText}` : `約 ${whoText}`, locale === 'en' ? 'Official' : '官方', locale)],
    ],
  };
  const K = T.short;
  return {
    short: {
      rows: [{ label: K.oneRed[locale], sub: fill(K.oneRedSub, locale, { near: num(sim.co.nearTailpipeAbout, locale) }) }, { label: K.stay[locale], sub: K.staySub[locale] }, { label: K.pushchair[locale], sub: K.pushchairSub[locale], over: fill(K.over, locale, { who: whoText }) }],
      whoLine: fill(K.whoLine, locale, { who: whoText }),
      whoNote: K.whoNote[locale],
      caption: K.caption[locale],
    },
    title: T.title[locale],
    axis: { max, ticks: ticksTo(max, 5).filter((v) => v <= max), label: T.axis[locale] },
    who: { value: who, line: fill(T.whoLine, locale, { who: whoText }), note: T.whoNote[locale] },
    rows,
    caption: [T.caption[locale], T.captionSpread[locale]],
    summary: fill(T.sum, locale, { who: whoText }),
    table,
  };
}

// ---------------------------------------------------------------------------------------------
// (a) bursts: one-second series, sorted
// ---------------------------------------------------------------------------------------------

export interface SimSecondsPanel {
  id: 'adult' | 'pushchair';
  label: string;
  /** every second's value, sorted from most to least (one emission draw; never labelled) */
  sorted: number[];
  mean: number;
}

export interface SimSecondsModel {
  title: string;
  sub: string;
  panels: SimSecondsPanel[];
  /** shared y axis from 0 */
  axis: { max: number; ticks: number[]; label: string };
  meanLabel: string;
  xLabel: string;
  caption: string;
  summary: string;
  table: ChartTable;
}

export function simSecondsModel(locale: Loc): SimSecondsModel {
  const T = chartText.sim.seconds;
  const mk = (id: 'adult' | 'pushchair'): SimSecondsPanel => {
    const s = simSeries[id];
    return { id, label: fill(T[id], locale, { s: s.seconds }), sorted: [...s.values].sort((a, b) => b - a), mean: s.mean };
  };
  const panels = [mk('adult'), mk('pushchair')];
  const top = Math.max(...panels.flatMap((p) => p.sorted));
  const max = niceTop(top);
  return {
    title: T.title[locale],
    sub: T.sub[locale],
    panels,
    axis: { max, ticks: ticksTo(max, 3).filter((v) => v <= max), label: T.yAxis[locale] },
    meanLabel: T.mean[locale],
    xLabel: T.xAxis[locale],
    caption: T.caption[locale],
    summary: T.sum[locale],
    table: {
      head: T.tableHead.map((h) => h[locale]),
      rows: [
        [panels[0].label, T.tableAdult[locale]],
        [panels[1].label, T.tablePushchair[locale]],
      ],
    },
  };
}

// ---------------------------------------------------------------------------------------------
// (c) above their own line: smell (share of the red) and benzene for people who stay
// ---------------------------------------------------------------------------------------------

export interface SimBandRow {
  label: string;
  sub: string;
  lo: number;
  hi: number;
  /** as printed with 約 and the unit */
  value: string;
}

export interface SimAboveModel {
  smell: { title: string; axis: { max: number; ticks: number[]; label: string }; rows: SimBandRow[]; caption: string; summary: string };
  benzene: { title: string; axis: { max: number; ticks: number[]; label: string }; rows: SimBandRow[]; ref: { value: number; label: string }; caption: string; summary: string };
  table: ChartTable;
}

/** The height of a benzene row's probe, from its `at` ('kerb 0.5 m, 0.7 m' → 0.7). */
export function aboveHeight(at: string): number {
  const m = /,\s*([\d.]+)\s*m\s*$/.exec(at);
  if (!m) throw new Error(`simAboveModel: no height in "${at}"`);
  return Number(m[1]);
}

/** `only` keeps one of the two charts in the table (home screen 5's sheet shows the benzene chart alone). */
export function simAboveModel(locale: Loc, only?: 'smell' | 'benzene'): SimAboveModel {
  const T = chartText.sim.above;
  const pct = (x: number) => Math.round(x * 100);
  const range = (lo: number, hi: number, unit: string) => (locale === 'en' ? `about ${num(lo, locale)} to ${num(hi, locale)}${unit === '%' ? '' : ' '}${unit}` : `約 ${num(lo, locale)} 到 ${num(hi, locale)}${unit === '%' ? '' : ' '}${unit}`);
  const [s1967, s1970] = simAbove.smell;
  const smellRows: SimBandRow[] = [
    { label: T.smell1967[locale], sub: T.smellSub[locale], lo: pct(s1967.low), hi: pct(s1967.high), value: range(pct(s1967.low), pct(s1967.high), '%') },
    { label: T.smell1970[locale], sub: T.smellSub[locale], lo: pct(s1970.low), hi: pct(s1970.high), value: range(pct(s1970.low), pct(s1970.high), '%') },
  ];
  const [bKerb, bBack] = simAbove.benzene;
  const benzeneRows: SimBandRow[] = [
    { label: fill(T.benzeneKerb, locale, { h: num(aboveHeight(bKerb.at), locale) }), sub: T.benzeneSub[locale], lo: bKerb.lo, hi: bKerb.hi, value: range(bKerb.lo, bKerb.hi, 'ppb') },
    { label: fill(T.benzeneBack, locale, { h: num(aboveHeight(bBack.at), locale) }), sub: T.benzeneSub[locale], lo: bBack.lo, hi: bBack.hi, value: range(bBack.lo, bBack.hi, 'ppb') },
  ];
  const ref = sim.benzene.reference_ppb;
  const refLabel = fill(T.benzeneRef, locale, { ref: `${num(ref, locale)} ppb`, h: sim.benzene.referenceBasis_h });
  const bMax = niceTop(Math.max(...benzeneRows.map((r) => r.hi)) * 1.1);
  const times = formatEstimate(simRange('sim.benzene.stay1hTimes'), locale).text;
  const est = locale === 'en' ? 'Estimate' : '推估';
  return {
    smell: { title: T.smellTitle[locale], axis: { max: 100, ticks: ticksTo(100, 4), label: T.smellAxis[locale] }, rows: smellRows, caption: T.smellCaption[locale], summary: T.smellSum[locale] },
    benzene: {
      title: T.benzeneTitle[locale],
      axis: { max: bMax, ticks: ticksTo(bMax, 4).filter((v) => v <= bMax), label: T.benzeneAxis[locale] },
      rows: benzeneRows,
      ref: { value: ref, label: refLabel },
      caption: fill(T.benzeneCaption, locale, { lo: sim.benzene.emissionUncertain.lo, hi: sim.benzene.emissionUncertain.hi }),
      summary: fill(T.benzeneSum, locale, { times }),
    },
    table: {
      caption: T.tableStat[locale],
      head: T.tableHead.map((h) => h[locale]),
      rows: [
        ...(only === 'benzene' ? [] : smellRows.map((r) => [paren(r.label, r.sub, locale), paren(r.value, est, locale)])),
        ...(only === 'smell' ? [] : benzeneRows.map((r) => [paren(r.label, r.sub, locale), paren(r.value, est, locale)])),
        ...(only === 'smell' ? [] : [[refLabel, locale === 'en' ? 'Official' : '官方']]),
      ],
    },
  };
}

// ---------------------------------------------------------------------------------------------
// SmellBenzene: benzene in the seconds you can smell it (statements-smell how-much-just-smellable,
// level-in-smellable-seconds). Seconds-long values ONLY: no 15-minute, 30-minute, 1-hour or yearly
// value, no health or reference line, no other chemical, no near-calm single-tailpipe case.
// The one line is benzene's own LOWEST published odour threshold (registry odour-thresholds).
// ---------------------------------------------------------------------------------------------

export interface SmellBenzeneModel {
  title: string;
  /** ticks: a guide line each decade; labelled: the ticks that print a number (every other decade, so a 320 px 特大 axis never overlaps) */
  axis: { min: number; max: number; ticks: number[]; labelled: number[]; label: string };
  rows: SimBandRow[];
  odour: { value: number; label: string };
  caption: string;
  summary: string;
  table: ChartTable;
}

/** value → percent along a log axis from min to max */
export const logX = (min: number, max: number) => (v: number) => ((Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100;

export function smellBenzeneModel(locale: Loc): SmellBenzeneModel {
  const T = chartText.sim.smellBenzene;
  const J = simSmell.just;
  const S = simSmell.seconds;
  const pct = (x: number) => Math.round(x * 100);
  const justText = formatEstimate(simRange('sim.smell.benzeneJust'), locale).text;
  const secText = formatEstimate(simRange('sim.smell.benzeneSeconds'), locale).text;
  const lowest = fill(T.lowest, locale, { lo: num(J.wordsRangeLo, locale), hi: num(J.wordsRangeHi, locale) });
  const rows: SimBandRow[] = [
    { label: T.just[locale], sub: T.justSub[locale], lo: J.lo, hi: J.hi, value: paren(justText, lowest, locale) },
    { label: T.seconds[locale], sub: T.secondsSub[locale], lo: S.lo, hi: S.hi, value: fill(T.aboutRange, locale, { about: num(S.wordsAbout, locale), range: secText }) },
  ];
  // benzene's own odour threshold: the lowest published value (registry odour-thresholds, ppm → ppb)
  const od = (facts['odour-thresholds'].data as Record<string, { value: number; unit: string }>).benzeneEpaLow;
  if (od.unit !== 'ppm') throw new Error('[smellBenzeneModel] odour-thresholds benzeneEpaLow is no longer in ppm');
  const odour = od.value * 1000;
  const est = locale === 'en' ? 'Estimate' : '推估';
  return {
    title: T.title[locale],
    axis: { min: 0.1, max: 10000, ticks: [0.1, 1, 10, 100, 1000, 10000], labelled: [0.1, 10, 1000], label: T.axis[locale] },
    rows,
    odour: { value: odour, label: T.odour[locale] },
    caption: fill(T.caption, locale, { a: pct(simSmell.share800.c), b: pct(simSmell.share6800.c), nj: num(J.n, locale), ns: num(S.n, locale) }),
    summary: fill(T.summary, locale, { just: justText, about: num(S.wordsAbout, locale), seconds: secText }),
    table: {
      caption: T.tableStat[locale],
      head: T.tableHead.map((h) => h[locale]),
      rows: rows.map((r) => [paren(r.label, r.sub, locale), paren(r.value, est, locale)]),
    },
  };
}
