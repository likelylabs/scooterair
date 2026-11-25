// Shape an Evaluation for the existing UI components (no imports from src/components, so this
// stays usable at build time and in the browser):
//   WaterfallChart / renderWaterfall  ← toWaterfall(evaluation, locale)
//   Ledger                            ← toLedgerRows(evaluation, locale)
//   BreakEvenChart / renderBreakEven  ← toBreakEven(evaluation, locale)

import type { Locale } from '../../data/types.ts';
import { ntdText, t, ui } from './text.ts';
import type { L10n } from './text.ts';
import type { BreakEven, Evaluation, PurchaseLedger } from './types.ts';

const pick = (v: L10n, locale: Locale) => v[locale];

/** Ledger line label for display: adds "(up to)" to maximums. */
export function lineLabel(line: PurchaseLedger['lines'][number], locale: Locale): string {
  return line.label[locale] + (line.isMaximum ? ui.upTo[locale] : '');
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
  const money = (v: number) => `NT$ ${Math.round(Math.abs(v)).toLocaleString(locale === 'en' ? 'en-US' : 'zh-TW')}`;
  const gap = ledger.net.value - other.net.value;
  return [
    { id: 'list', label: pick(side === 'electric' ? ui.list : ui.listGas, locale), amount: money(ledger.listPrice.value), ...(ledger.listPrice.note ? { note: pick(ledger.listPrice.note, locale) } : {}) },
    ...ledger.lines.map((l) => ({
      id: l.id,
      label: lineLabel(l, locale),
      amount: money(l.amount),
      kind: 'minus' as const,
      note: pick(l.conditionText, locale),
    })),
    { id: 'net', label: pick(ui.net, locale), amount: money(ledger.net.value), kind: 'total' as const, ...(ledger.net.high !== ledger.net.value ? { note: `${money(ledger.net.value)} – ${money(ledger.net.high)}` } : {}) },
    { id: 'compare', label: pick(side === 'electric' ? ui.netGas : ui.netElectric, locale), amount: money(other.net.value), kind: 'compare' as const },
    { id: 'gap', label: pick(ui.gap, locale), amount: `${gap < 0 ? '−' : '+'}${money(gap)}`, kind: 'gap' as const },
  ];
}

export function breakEvenText(b: BreakEven, locale: Locale): string {
  switch (b.kind) {
    case 'ev-ahead':
      return pick(ui.ahead, locale);
    case 'breaks-even':
      return pick(ui.even, locale).replace('{n}', String(b.month));
    case 'no-break-even':
      return pick(ui.never, locale);
    case 'gas-catches-up':
      return pick(ui.catchesUp, locale).replace('{n}', String(b.month));
  }
}

/**
 * Props for BreakEvenChart (minus the label functions, which a page supplies from `labels`).
 * The chart draws straight lines, so `monthly` is the average over the horizon including setup
 * fees and temporary credits: the end points match the engine's cumulative totals exactly, but
 * the chart's own crossing can differ from `breakEven` by a month or two when costs vary over
 * time (credits, setup fees). Show `breakEven` (exact) as the text answer.
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
  // The component wants the option with the higher purchase price first.
  const [a, b] = evLine.upfront >= gasLine.upfront ? [evLine, gasLine] : [gasLine, evLine];
  return {
    locale,
    a,
    b,
    months: H,
    breakEven: e.comparison.breakEven,
    breakEvenText: breakEvenText(e.comparison.breakEven, locale),
    labels: {
      purchase: pick(ui.purchase, locale),
      year: pick(ui.year, locale),
      even: pick(ui.even, locale),
      never: pick(ui.never, locale),
      ahead: pick(ui.ahead, locale),
      month: pick(ui.month, locale),
    },
  };
}

/** Format a localized NTD amount (e.g. for result panels). */
export const formatNtd = (v: number, locale: Locale): string => ntdText(v, locale);
export const label = (v: L10n, locale: Locale): string => pick(v, locale);
export { t };
