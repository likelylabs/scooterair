/**
 * G13 — monthly bars (docs/redesign-brief.md 3.2 screen 13, 5.2).
 *
 * Two thick filled bars, petrol against charging at home: the picture's largest marks. Under a
 * divider that says "if you cannot charge at home", two thin outlined bars for battery swapping
 * (the cheapest monthly plan, and pay-as-you-go). All four to one scale, each with its amount
 * beside its name. Filled against outlined, thick against thin: the two groups differ by shape,
 * not by colour alone.
 *
 * Pure: draws at build time and redraws in the browser when the reader changes the distance.
 *
 *   import { monthlyBarsFromCase, renderMonthlyBars } from '@/components/charts/core/monthlyBars';
 *   const html = renderMonthlyBars(monthlyBarsFromCase(homeMoney().month[300], locale));
 */
import { about, chartText, fill, yuan, yuanRange } from '../strings.ts';
import type { ChartTable } from './shared.ts';
import { esc, htmlChart, pc, type Loc } from './html.ts';

export interface MonthBar {
  /** NT$ a month. A single figure has lo === hi */
  lo: number;
  hi: number;
  /** the row's name; defaults to the chart's own words */
  label?: string;
  /** which scooter or plan, for the table: 「Ionex 518」 */
  note?: string;
  /** false prints the figure without 約 (a fixed fee). Default true */
  about?: boolean;
}

export interface MonthlyBarsProps {
  locale: Loc;
  /** km a month, for the chart's name */
  km: number;
  petrol: MonthBar;
  home: MonthBar;
  swapPlan: MonthBar;
  swapPayg: MonthBar;
  /** axis end, NT$: pass one value to several charts to draw them to the same scale. Default: this chart's largest figure */
  max?: number;
  /** print the data table toggle (default true) */
  table?: boolean;
}

/** A minimal view of lane I's `MonthCase` (src/lib/home-money.ts). */
type L = { 'zh-TW': string; en: string };
interface OptionLike {
  name: L;
  planName?: L;
  monthly: { low: number; typical: number; high: number };
}
export interface MonthCaseLike {
  km: number;
  petrol: { name: L; monthly: { low: number; typical: number; high: number } };
  home: { typical: { lo: number; hi: number } };
  swapPlan: OptionLike;
  swapPayg: OptionLike;
}

/** MonthlyBars props from one of lane I's month cases (the `typical` figures, as the page prints them). */
export function monthlyBarsFromCase(m: MonthCaseLike, locale: Loc, extra: Partial<MonthlyBarsProps> = {}): MonthlyBarsProps {
  const one = (o: OptionLike): MonthBar => ({ lo: o.monthly.typical, hi: o.monthly.typical, note: [o.name[locale], o.planName?.[locale]].filter(Boolean).join(locale === 'en' ? ', ' : '・') });
  return {
    locale,
    km: m.km,
    petrol: { lo: m.petrol.monthly.typical, hi: m.petrol.monthly.typical, note: m.petrol.name[locale] },
    home: { lo: m.home.typical.lo, hi: m.home.typical.hi },
    swapPlan: one(m.swapPlan),
    swapPayg: one(m.swapPayg),
    ...extra,
  };
}

export const monthlyBarsTitle = (locale: Loc, km: number): string => fill(chartText.month.title, locale, { km });

/** The largest figure a set of month cases draws: a shared axis end for the four distances. */
export const monthlyBarsMax = (cases: MonthlyBarsProps[]): number => Math.max(1, ...cases.flatMap((c) => [c.petrol.hi, c.home.hi, c.swapPlan.hi, c.swapPayg.hi]));

const THICK = 28;
const THIN = 14;

export function renderMonthlyBars(p: MonthlyBarsProps): string {
  const { locale } = p;
  const T = chartText.month;
  const max = p.max ?? Math.max(1, p.petrol.hi, p.home.hi, p.swapPlan.hi, p.swapPayg.hi);
  const x = (v: number) => Math.min(100, (v / max) * 100);
  const amount = (b: MonthBar) => {
    const s = yuanRange(b.lo, b.hi, locale);
    return b.about === false ? s : about(s, locale);
  };
  const rows = [
    { key: 'petrol', b: p.petrol, label: p.petrol.label ?? T.petrol[locale], tone: 'exhaust', thick: true },
    { key: 'home', b: p.home, label: p.home.label ?? T.home[locale], tone: 'clean', thick: true },
    { key: 'swap-plan', b: p.swapPlan, label: p.swapPlan.label ?? T.swapPlan[locale], tone: 'clean', thick: false },
    { key: 'swap-payg', b: p.swapPayg, label: p.swapPayg.label ?? T.swapPayg[locale], tone: 'clean', thick: false },
  ];
  const row = (r: (typeof rows)[number]) => {
    const w = x(r.b.hi);
    const h = r.thick ? THICK : THIN;
    // a 4px block at the baseline squares off the rounded start and keeps a very short bar
    // findable: NT$12 beside NT$700 still shows
    const mark = r.thick
      ? `<rect class="c-fill-${r.tone} hc-g" data-mark="${r.key}" x="0" y="0" width="${pc(w)}" height="${h}" rx="3"/><rect class="c-fill-${r.tone} hc-g" x="0" y="0" width="4" height="${h}"/>`
      : `<rect class="hc-outline hc-outline--${r.tone} hc-g" data-mark="${r.key}" x="1" y="1" width="${pc(w)}" height="${h - 2}" rx="2"/>`;
    return (
      `<div class="hc-row${r.thick ? '' : ' hc-row--thin'}" data-series="${r.key}">` +
      `<div class="hc-row__head"><span class="hc-row__label">${esc(r.label)}</span><span class="hc-row__value">${esc(amount(r.b))}</span></div>` +
      `<svg class="hc-plot hc-plot--flush" width="100%" height="${h}" aria-hidden="true" focusable="false">${mark}<line class="hc-base" x1="0" x2="0" y1="-3" y2="${h + 3}"/></svg></div>`
    );
  };
  const body =
    `<div class="hc-month" data-km="${p.km}">` +
    row(rows[0]) +
    row(rows[1]) +
    `<p class="hc-divider"><span>${esc(T.divider[locale])}</span></p>` +
    row(rows[2]) +
    row(rows[3]) +
    `</div>`;

  const summary = fill(T.sum, locale, { km: p.km, rows: rows.map((r) => fill(T.sumRow, locale, { label: r.label, v: amount(r.b) })).join(T.sumJoin[locale]) });
  const hasNotes = rows.some((r) => r.b.note);
  const num = (b: MonthBar) => (Math.round(b.lo) === Math.round(b.hi) ? yuan(b.lo, locale) : yuanRange(b.lo, b.hi, locale));
  const table: ChartTable = {
    head: [T.tableWhat[locale], T.tableValue[locale], ...(hasNotes ? [T.tableNote[locale]] : [])],
    rows: rows.map((r) => [r.key.startsWith('swap') ? `${T.divider[locale]}${locale === 'en' ? ': ' : '：'}${r.label}` : r.label, num(r.b), ...(hasNotes ? [r.b.note ?? ''] : [])]),
  };
  return htmlChart({ summary, body, table: p.table === false ? undefined : table, title: monthlyBarsTitle(locale, p.km), locale });
}
