/**
 * The estimate's charts as data (docs/redesign-brief.md 3.2 screen 5, 4.4, 7.2):
 *
 *   mveModel()        G5: measured beside estimated, carbon monoxide, one linear ppm axis
 *   bandsModel()      the range bands for /estimate/: one pollutant, three scenarios, a log axis
 *   estimateTable()   the numbers table of /estimate/#numbers, also as rows for CSV and JSON
 *
 * Every figure is read from src/data/estimate.ts (`est`, `formatEstimate`); nothing is typed
 * here. The Astro components MeasuredVsEstimate, EstimateBands and EstimateTable draw these
 * models; a print page or a script can use the same models for its own drawing.
 *
 * Rules these models keep (brief 4.2, 4.4):
 *   - an estimate is a range that starts with 約; its middle value is never printed or marked
 *   - measured rows come first, estimated rows after; nothing joins them
 *   - what the pack adds is always called 多出來 / added; a total says 含街上原本就有的
 *   - no ultrafine-particle panel and no height panel exist: the page says those in sentences
 */
import {
  chartMaxPpm,
  checkRule,
  est,
  estimateText,
  farBelowWho,
  formatEstNumber,
  formatEstimate,
  formatReference,
  scenarioKeys,
  type EstRange,
  type EstimateRangeSlot,
  type Pollutant,
  type ScenarioKey,
} from '../../../data/estimate.ts';
import { readerKindLabels, type ReaderKind } from '../../../data/types.ts';
import { about, chartText, fill } from '../strings.ts';
import type { ChartTable } from './shared.ts';
import type { Loc } from './html.ts';

const yearOf = (factId: string | undefined): string => {
  const m = /(\d{4})$/.exec(factId ?? '');
  if (!m) throw new Error(`[charts] cannot read the year of "${factId}"`);
  return m[1];
};
const num = (v: number, locale: Loc, dp?: number) =>
  dp === undefined ? formatEstNumber(v, 'as-given', locale) : new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(v);
const list = (parts: string[], locale: Loc) => parts.join(locale === 'en' ? ', ' : '、');

/** A chip's word, for tables and text alternatives: 實測 / Measured. */
export const chipWord = (kind: ReaderKind, locale: Loc): string => readerKindLabels[kind].label[locale];


// ---------------------------------------------------------------------------------------------
// G5 · measured beside estimated
// ---------------------------------------------------------------------------------------------

export interface MveRow {
  id: 'roadside' | 'waiting' | 'estimate';
  kind: ReaderKind;
  label: string;
  /** who, where, when (a measurement) or where it applies (the estimate) */
  sub: string;
  /** the value as printed, without its unit: 「0.5」「0.5 · 0.6 · 1.3」「約 0.3 到 1.6」 */
  value: string;
  unit: string;
  /** measured: the readings, ppm (dots) */
  dots?: number[];
  /** estimate: the band's ends, ppm */
  band?: { lo: number; hi: number };
  /** registry fact a measured row prints (data-fact; its caveat belongs in the page's sheet) */
  factId?: string;
  /** estimate: the slot the row prints */
  slot?: EstimateRangeSlot;
}

export interface MveModel {
  title: string;
  rows: MveRow[];
  /** linear axis from 0 */
  axis: { max: number; ticks: number[]; unit: string };
  /** the zoom-out strip: the whole axis against the WHO 15-minute value */
  who: { value: number; text: string; label: string; here: string; share: number };
  legend: { measured: string; estimated: string };
  table: ChartTable;
  /** the text alternative: every row in words, then the finding chosen by rule */
  summary: string;
}

export function mveModel(locale: Loc, scenario: ScenarioKey = 'dozen'): MveModel {
  const T = chartText.mve;
  const bg = est.bg.co.traffic;
  const peaks = est.meas.iot.co.peaks;
  const total = est.co[scenario].total;
  const f = formatEstimate(`co.${scenario}.total`, locale);
  const ppm = 'ppm';

  const roadSub = fill(T.roadside.sub, locale, { year: yearOf(bg.factId) });
  const waitSub = fill(T.waiting.sub, locale, { n: est.meas.iot.co.peakSites });
  const estSub = fill(T.estimate.sub, locale, { s: est.signal.redLength_s });
  const peakText = peaks.map((v) => num(v, locale));

  const rows: MveRow[] = [
    { id: 'roadside', kind: bg.kind, label: T.roadside.label[locale], sub: roadSub, value: num(bg.shown, locale), unit: ppm, dots: [bg.value], factId: bg.factId },
    { id: 'waiting', kind: 'measured', label: T.waiting.label[locale], sub: waitSub, value: peakText.join(' · '), unit: ppm, dots: [...peaks], factId: est.meas.iot.co.peaksFact },
    { id: 'estimate', kind: total.kind, label: T.estimate[scenario][locale], sub: estSub, value: f.textNoUnit, unit: f.unit, band: { lo: total.lo, hi: total.hi }, slot: `co.${scenario}.total` },
  ];

  // the brief's axis: linear, from 0 to 2 ppm today; it follows the data if the data change
  const top = Math.max(chartMaxPpm(), total.hi);
  const max = top <= 2 ? 2 : Math.ceil(top);
  const step = max <= 2 ? 0.5 : max <= 5 ? 1 : Math.ceil(max / 5);
  const ticks: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(2));

  const who = est.who.co15min_ppm;
  const whoText = formatReference(who.value, 'ppm', locale);

  const rule = checkRule();
  const summary = [
    fill(T.sumRoadside, locale, { sub: roadSub, v: num(bg.shown, locale) }),
    fill(T.sumWaiting, locale, { sub: waitSub, v: list(peakText, locale) }),
    fill(T.sumEstimate, locale, { label: T.estimate[scenario][locale], sub: estSub, v: f.textNoUnit }),
    T.sumRule[rule][locale],
    fill(farBelowWho(top) ? T.sumWhoFar : T.sumWho, locale, { who: whoText }),
  ].join(locale === 'en' ? ' ' : '');

  const paren = (a: string, b: string) => (locale === 'en' ? `${a} (${b})` : `${a}（${b}）`);
  // two columns, so the table fits a 320px phone: each figure is followed by what kind of figure it is
  const withKind = (v: string, k: ReaderKind) => paren(v, chipWord(k, locale));
  const table: ChartTable = {
    head: [T.tableWhere[locale], T.tableValue[locale]],
    rows: [
      [paren(rows[0].label, roadSub), withKind(num(bg.shown, locale), rows[0].kind)],
      // the table gives the readings as the report prints them
      [paren(rows[1].label, waitSub), withKind(list(peaks.map((v) => num(v, locale)), locale), 'measured')],
      [paren(rows[2].label, estSub), withKind(f.textNoUnit, total.kind)],
      [T.zoomWho[locale], withKind(about(num(who.value, locale), locale), who.kind)],
    ],
  };

  return {
    title: T.title[locale],
    rows,
    axis: { max, ticks, unit: ppm },
    who: { value: who.exact, text: whoText, label: T.zoomWho[locale], here: T.zoomHere[locale], share: (max / who.exact) * 100 },
    legend: { measured: estimateText.legendMeasured[locale], estimated: estimateText.legendEstimated[locale] },
    table,
    summary,
  };
}

// ---------------------------------------------------------------------------------------------
// Range bands on a log axis (/estimate/)
// ---------------------------------------------------------------------------------------------

export interface BandRow {
  id: string;
  /** 'compare' = a value to compare with (what the street holds, the WHO value) · 'added' = what the pack adds */
  group: 'compare' | 'added';
  kind: ReaderKind;
  label: string;
  sub?: string;
  /** as printed, with its unit: 「約 0.05 到 1 ppm」 */
  value: string;
  /** how the mark is drawn */
  mark: 'dot' | 'square' | 'bar' | 'band';
  /** positions on the axis, in the pollutant's unit: one value (dot, square) or two (bar, band) */
  at: [number] | [number, number];
  factId?: string;
  slot?: EstimateRangeSlot;
  /** carbon monoxide only: the total (added plus the street's own), as printed */
  total?: string;
}

export interface BandsModel {
  pollutant: Pollutant;
  name: string;
  unit: string;
  title: string;
  rows: BandRow[];
  /** log axis: ends, the decade ticks between them, and where to draw the street's own level in every row */
  axis: { lo: number; hi: number; ticks: number[]; guide?: [number] | [number, number] };
  /** value → percent along the log axis */
  x: (v: number) => number;
  confidence: { word: string; why: string };
  /** a sentence that must travel with the panel (PM2.5: much less than the street holds) */
  note?: string;
  logNote: string;
  summary: string;
  table: ChartTable;
}

const NICE = [1, 2, 5];
const niceBelow = (v: number) => {
  let best = 0;
  for (let k = -4; k <= 4; k++) for (const m of NICE) if (m * 10 ** k <= v + 1e-12) best = Math.max(best, m * 10 ** k);
  return +best.toPrecision(1);
};
const niceAbove = (v: number) => {
  let best = Infinity;
  for (let k = -4; k <= 4; k++) for (const m of NICE) if (m * 10 ** k >= v - 1e-12) best = Math.min(best, m * 10 ** k);
  return +best.toPrecision(1);
};

const unitSymbol: Record<Pollutant, string> = { co: 'ppm', benzene: 'ppb', pm25: 'µg/m³' };

export function bandsModel(pollutant: Pollutant, locale: Loc, opts: { zhuyin?: boolean } = {}): BandsModel {
  const T = chartText.bands;
  const unit = unitSymbol[pollutant];
  const fmt = (slot: EstimateRangeSlot | EstRange) => formatEstimate(slot, locale, { unitStyle: 'symbol' });
  const name = pollutant === 'benzene' && opts.zhuyin ? T.benzeneZhuyin[locale] : T.pollutant[pollutant][locale];
  const rows: BandRow[] = [];
  let guide: BandsModel['axis']['guide'];
  const street = estimateText.alreadyThere[locale];
  const one = (v: number) => `${about(num(v, locale), locale)} ${unit}`;

  if (pollutant === 'co') {
    const bg = est.bg.co.traffic;
    rows.push({ id: 'street', group: 'compare', kind: bg.kind, label: street, sub: fill(T.streetSub.co, locale, { year: yearOf(bg.factId) }), value: one(bg.shown), mark: 'dot', at: [bg.value], factId: bg.factId });
    const who = est.who.co15min_ppm;
    rows.push({ id: 'who', group: 'compare', kind: who.kind, label: T.who[locale], sub: T.whoSub[locale], value: one(who.value), mark: 'square', at: [who.exact], factId: who.factId });
    const rise = est.xcheck.iot.observed;
    rows.push({
      id: 'measured-rise',
      group: 'added',
      // the highest reading minus the station: our arithmetic on two measurements (本站計算)
      kind: 'derived',
      label: T.measuredRise.label[locale],
      sub: fill(T.measuredRise.sub, locale, { n: est.meas.iot.co.peakSites }),
      value: fmt(rise).text,
      mark: 'bar',
      at: [rise.lo, rise.hi],
      factId: rise.factId,
    });
    guide = [bg.value];
  } else if (pollutant === 'pm25') {
    const bg = est.bg.pm25;
    rows.push({ id: 'street', group: 'compare', kind: bg.kind, label: street, sub: fill(T.streetSub.pm25, locale, { year: yearOf(bg.factId) }), value: one(bg.shown), mark: 'dot', at: [bg.value], factId: bg.factId });
    guide = [bg.value];
  } else {
    const bg = est.bg.benzene;
    rows.push({ id: 'street', group: 'compare', kind: bg.kind, label: street, sub: T.streetSub.benzene[locale], value: fmt(bg as EstRange).text, mark: 'bar', at: [bg.lo, bg.hi] });
    guide = [bg.lo, bg.hi];
  }
  for (const s of scenarioKeys) {
    const slot = `${pollutant}.${s}.add` as EstimateRangeSlot;
    const r = est[pollutant][s].add;
    rows.push({
      id: s,
      group: 'added',
      kind: r.kind,
      label: est.scn[s].longName[locale],
      value: fmt(slot).text,
      mark: 'band',
      at: [r.lo, r.hi],
      slot,
      total: pollutant === 'co' ? fmt(`co.${s}.total`).text : undefined,
    });
  }

  const all = rows.flatMap((r) => r.at as number[]);
  const lo = niceBelow(Math.min(...all) * 0.8);
  const hi = niceAbove(Math.max(...all) * 1.1);
  const a = Math.log10(lo);
  const b = Math.log10(hi);
  const x = (v: number) => ((Math.log10(Math.max(v, lo)) - a) / (b - a)) * 100;
  const ticks: number[] = [];
  for (let k = Math.ceil(a - 1e-9); k <= Math.floor(b + 1e-9); k++) ticks.push(+(10 ** k).toPrecision(1));

  const c = est.confidence[pollutant];
  const sp = locale === 'en' ? ' ' : '';
  const summary = [
    ...rows
      .filter((r) => r.group === 'added' && r.mark === 'band')
      .map((r) => fill(T.sum, locale, { pollutant: name, scenario: r.label, v: r.value })),
    ...rows.filter((r) => r.id === 'measured-rise').map((r) => fill(T.sumRise, locale, { v: r.value })),
    ...rows.filter((r) => r.id === 'street').map((r) => fill(T.sumStreet, locale, { v: r.value })),
    ...rows.filter((r) => r.id === 'who').map((r) => fill(T.sumWho, locale, { v: r.value })),
  ].join(sp);

  const table: ChartTable = {
    head: [name, `${T.addedHead[locale]}${locale === 'en' ? ' / ' : '／'}${T.compare[locale]}`],
    rows: rows.map((r) => [r.sub ? (locale === 'en' ? `${r.label} (${r.sub})` : `${r.label}（${r.sub}）`) : r.label, locale === 'en' ? `${r.value} (${chipWord(r.kind, locale)})` : `${r.value}（${chipWord(r.kind, locale)}）`]),
  };

  return {
    pollutant,
    name,
    unit,
    title: fill(T.title, locale, { pollutant: name }),
    rows,
    axis: { lo, hi, ticks, guide },
    x,
    confidence: { word: c.word[locale], why: c.why[locale] },
    note: pollutant === 'pm25' ? estimateText.pm25Small[locale] : undefined,
    logNote: T.logNote[locale],
    summary,
    table,
  };
}

// ---------------------------------------------------------------------------------------------
// The numbers table (/estimate/#numbers)
// ---------------------------------------------------------------------------------------------

export interface EstimateTableGroup {
  pollutant: Pollutant;
  name: string;
  unit: string;
  /** what the street already holds, as printed, and its chip */
  street: { text: string; kind: ReaderKind; sub: string };
  confidence: { word: string; why: string };
  note?: string;
  rows: { scenario: ScenarioKey; label: string; name: string; count: string; added: string; total?: string; slot: EstimateRangeSlot }[];
}

/** Three scenarios × carbon monoxide, benzene, PM2.5: each 約 A 到 B with its unit, beside what the street holds. */
export function estimateTable(locale: Loc, opts: { zhuyin?: boolean } = {}): EstimateTableGroup[] {
  return (['co', 'benzene', 'pm25'] as Pollutant[]).map((p) => {
    const m = bandsModel(p, locale, opts);
    const street = m.rows.find((r) => r.id === 'street')!;
    return {
      pollutant: p,
      name: m.name,
      unit: m.unit,
      street: { text: street.value, kind: street.kind, sub: street.sub ?? '' },
      confidence: { word: m.confidence.word, why: m.confidence.why },
      note: m.note,
      rows: m.rows
        .filter((r) => r.mark === 'band')
        .map((r) => {
          const s = r.id as ScenarioKey;
          const c = est.scn[s].count;
          return { scenario: s, label: r.label, name: est.scn[s].name[locale], count: locale === 'en' ? `${c.lo} to ${c.hi} scooters` : `${c.lo} 到 ${c.hi} 輛`, added: r.value, total: r.total, slot: r.slot! };
        }),
    };
  });
}

/**
 * The same table as flat records, for the CSV and JSON downloads of /estimate/#numbers.
 * Numbers are the published, rounded values; `mid` is left out on purpose (never printed).
 */
export function estimateRecords(): { pollutant: Pollutant; unit: string; scenario: ScenarioKey; scootersLo: number; scootersHi: number; addedLo: number; addedHi: number; totalLo?: number; totalHi?: number; confidence: string }[] {
  return (['co', 'benzene', 'pm25'] as Pollutant[]).flatMap((p) =>
    scenarioKeys.map((s) => {
      const add = est[p][s].add;
      const tot = p === 'co' ? est.co[s].total : undefined;
      return {
        pollutant: p,
        unit: unitSymbol[p],
        scenario: s,
        scootersLo: est.scn[s].count.lo,
        scootersHi: est.scn[s].count.hi,
        addedLo: add.lo,
        addedHi: add.hi,
        ...(tot ? { totalLo: tot.lo, totalHi: tot.hi } : {}),
        confidence: est.confidence[p].level,
      };
    }),
  );
}
