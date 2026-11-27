// Shape an Evaluation for the existing UI components (no imports from src/components, so this
// stays usable at build time and in the browser):
//   WaterfallChart / renderWaterfall  ← toWaterfall(evaluation, locale)
//   Ledger                            ← toLedgerRows(evaluation, locale)
//   BreakEvenChart / renderBreakEven  ← toBreakEven(evaluation, locale)

import type { Locale } from '../../data/types.ts';
import { horizonText, ntdText, t, ui } from './text.ts';
import type { L10n } from './text.ts';
import type { BreakEven, Evaluation, PurchaseLedger } from './types.ts';

const pick = (v: L10n, locale: Locale) => v[locale];
// Built once (a formatter per call is slow; see text.ts).
const MONEY = { en: new Intl.NumberFormat('en-US'), 'zh-TW': new Intl.NumberFormat('zh-TW') } as const;

/** Ledger line label for display: adds "(up to)" to maximums (once, even if the label already says so). */
export function lineLabel(line: PurchaseLedger['lines'][number], locale: Locale): string {
  const label = line.label[locale];
  if (!line.isMaximum) return label;
  const already = /（最高）$|\((up to|maximum)\)$/.test(label);
  return already ? label : label + ui.upTo[locale];
}

/** Props for WaterfallChart: list price → each line → net, compared with the gasoline net price. */
export function toWaterfall(e: Evaluation, locale: Locale, side: 'electric' | 'gasoline' = 'electric') {
  const ledger = side === 'electric' ? e.electric.purchase : e.gasoline.purchase;
  const other = side === 'electric' ? e.gasoline.purchase : e.electric.purchase;
  return {
    locale,
    start: { label: pick(side === 'electric' ? ui.list : ui.listGas, locale), value: ledger.listPrice.value },
    steps: ledger.lines.map((l) => ({ label: lineLabel(l, locale), value: l.amount })),
    totalLabel: pick(side === 'electric' ? ui.netElectric : ui.netGas, locale),
    compare: { label: pick(side === 'electric' ? ui.netGas : ui.netElectric, locale), value: other.net.value },
    gapLabel: pick(ui.gap, locale),
    categoryLabel: pick(ui.item, locale),
    valueLabel: pick(ui.amount, locale),
  };
}

type Kind = 'base' | 'minus' | 'plus' | 'total' | 'compare' | 'gap';
export interface LedgerRow {
  id?: string;
  label: string;
  amount: string;
  kind?: Kind;
  note?: string;
}

/**
 * Rows for <Ledger>: amounts are pre-formatted without a sign (the kind adds − / +),
 * except the gap row, which carries its own sign as the styleguide does.
 */
export function toLedgerRows(e: Evaluation, locale: Locale, side: 'electric' | 'gasoline' = 'electric'): LedgerRow[] {
  const ledger = side === 'electric' ? e.electric.purchase : e.gasoline.purchase;
  const other = side === 'electric' ? e.gasoline.purchase : e.electric.purchase;
  const money = (v: number) => `NT$ ${MONEY[locale === 'en' ? 'en' : 'zh-TW'].format(Math.round(Math.abs(v)))}`;
  const gap = ledger.net.value - other.net.value;
  return [
    { id: 'list', label: pick(side === 'electric' ? ui.list : ui.listGas, locale), amount: money(ledger.listPrice.value), ...(ledger.listPrice.note ? { note: pick(ledger.listPrice.note, locale) } : {}) },
    ...ledger.lines.map((l) => ({
      id: l.id,
      label: lineLabel(l, locale),
      amount: money(l.amount),
      kind: 'minus' as const,
      // The conditions, then the line's own note (caveats, and the cap note when a cap reduced it).
      note: [pick(l.conditionText, locale), l.note ? pick(l.note, locale) : ''].filter(Boolean).join(locale === 'en' ? ' ' : ''),
    })),
    { id: 'net', label: pick(ui.net, locale), amount: money(ledger.net.value), kind: 'total' as const, ...(ledger.net.high !== ledger.net.value ? { note: `${money(ledger.net.value)} – ${money(ledger.net.high)}` } : {}) },
    { id: 'compare', label: pick(side === 'electric' ? ui.netGas : ui.netElectric, locale), amount: money(other.net.value), kind: 'compare' as const },
    { id: 'gap', label: pick(ui.gap, locale), amount: `${gap < 0 ? '−' : '+'}${money(gap)}`, kind: 'gap' as const },
  ];
}

/**
 * The break-even answer as a short label. Uses the horizon carried by `b` (or `horizonMonths`,
 * default 60), and says so when the lines cross back: an early crossing that does not hold to the
 * horizon is reported as what happens at the horizon.
 */
export function breakEvenText(b: BreakEven, locale: Locale, horizonMonths = 60): string {
  const h = pick(horizonText(b.horizonMonths ?? horizonMonths), locale);
  const fill = (s: L10n, vars: Record<string, string | number>) => Object.entries(vars).reduce((x, [k, v]) => x.replaceAll(`{${k}}`, String(v)), pick(s, locale));
  switch (b.kind) {
    case 'ev-ahead':
      if ((b.crossings?.length ?? 0) > 0) return fill(ui.aheadWithDip, { h });
      return b.runningCheaper === false ? fill(ui.aheadDearerToRun, { h }) : pick(ui.ahead, locale);
    case 'breaks-even':
      return fill(ui.even, { n: b.month });
    case 'no-break-even':
      return (b.crossings?.length ?? 0) > 0 ? fill(ui.evenThenBehind, { n: b.crossings![0], h, gap: ntdText(b.gapAtHorizon, locale) }) : fill(ui.neverIn, { h });
    case 'gas-catches-up':
      return fill(ui.catchesUp, { n: b.month });
  }
}

/**
 * Props for BreakEvenChart (minus the label functions, which a page supplies).
 *
 * The chart draws straight lines, so `monthly` is the average over the horizon including setup
 * fees and temporary credits: the end points match the engine's cumulative totals exactly, but
 * where two straight lines cross can be many months away from where the real cumulative costs
 * cross (setup-fee renewals and 24-month credits make them saw-toothed), and the lines can cross
 * more than once. So the chart's own crossing month is NOT the answer.
 *
 * To keep the chart's text in step with the engine, pass `chartLabels` to the component:
 *   breakEvenLabel: () => p.chartLabels.breakEvenLabel,
 *   noBreakEvenLabel: p.chartLabels.noBreakEvenLabel,
 *   aheadLabel: p.chartLabels.aheadLabel,
 * Each is the engine's own answer (`breakEvenText`), whichever branch the component takes.
 * `labels` keeps the raw templates for pages that build their own text; `labels.never` and
 * `labels.ahead` already hold the engine's answer when the engine reports no crossing.
 * `series` carries the real cumulative totals for a chart that can draw them.
 */
export function toBreakEven(e: Evaluation, locale: Locale) {
  const H = e.comparison.cumulative.months.length - 1;
  const evStart = e.comparison.cumulative.electric[0].typical;
  const gasStart = e.comparison.cumulative.gasoline[0].typical;
  const evLine = {
    label: pick(ui.electric, locale),
    tone: 'clean' as const,
    upfront: evStart,
    monthly: (e.comparison.cumulative.electric[H].typical - evStart) / H,
  };
  const gasLine = {
    label: pick(ui.gasoline, locale),
    tone: 'exhaust' as const,
    upfront: gasStart,
    monthly: (e.comparison.cumulative.gasoline[H].typical - gasStart) / H,
  };
  const be = e.comparison.breakEven;
  const verdict = breakEvenText(be, locale, H);
  // The component wants the option with the higher purchase price first, except that its "ahead"
  // label can only show when `a` is cheaper to buy and to run: then electric goes first.
  const evFirst = be.kind === 'ev-ahead' ? evLine.monthly <= gasLine.monthly : evLine.upfront >= gasLine.upfront;
  const [a, b] = evFirst ? [evLine, gasLine] : [gasLine, evLine];
  const noCrossing = be.kind === 'ev-ahead' || be.kind === 'no-break-even';
  return {
    locale,
    a,
    b,
    months: H,
    breakEven: be,
    breakEvenText: verdict,
    /** The engine's crossing month (null when the lines end where they started relative to each other). */
    crossMonth: be.kind === 'breaks-even' || be.kind === 'gas-catches-up' ? be.month : null,
    /** Pass these to the component so its text always matches `breakEvenText`. */
    chartLabels: { breakEvenLabel: verdict, noBreakEvenLabel: verdict, aheadLabel: verdict },
    /** The real cumulative totals (typical), month 0..H. */
    series: { electric: e.comparison.cumulative.electric.map((x) => x.typical), gasoline: e.comparison.cumulative.gasoline.map((x) => x.typical) },
    labels: {
      purchase: pick(ui.purchase, locale),
      year: pick(ui.year, locale),
      even: pick(ui.even, locale),
      never: noCrossing ? verdict : pick(ui.neverIn, locale).replace('{h}', pick(horizonText(H), locale)),
      ahead: be.kind === 'ev-ahead' ? verdict : pick(ui.ahead, locale),
      month: pick(ui.month, locale),
    },
  };
}

/** Format a localized NTD amount (e.g. for result panels). */
export const formatNtd = (v: number, locale: Locale): string => ntdText(v, locale);
export const label = (v: L10n, locale: Locale): string => pick(v, locale);
export { t };
