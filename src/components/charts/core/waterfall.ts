import type { Locale } from '@/i18n';
import { MIN_W, MINUS, type ChartRender, type Tone, esc, fmt, hbar, niceMax, pctN, px, text, wrapLabel } from './shared';

export interface WaterfallProps {
  locale: Locale;
  /** where the sum starts, e.g. the list price */
  start: { label: string; value: number };
  /** amounts taken off, in order (positive numbers). A negative value adds. */
  steps: { label: string; value: number }[];
  /** name of the result row, e.g. '實付價格' */
  totalLabel: string;
  /** optional comparison drawn as a reference line + its own row, e.g. a gasoline scooter */
  compare?: { label: string; value: number };
  /** name for the difference row (total − compare); omit to hide it */
  gapLabel?: string;
  /** currency or unit prefix (default 'NT$') */
  prefix?: string;
  startTone?: Tone;
  stepTone?: Tone;
  totalTone?: Tone;
  compareTone?: Tone;
  categoryLabel: string;
  valueLabel: string;
}

const LINE = 19;
const BAR = 16;

/**
 * Horizontal waterfall: list price → each deduction → what you pay.
 * Reads top to bottom like a receipt; every row carries its label and amount.
 */
export function renderWaterfall(p: WaterfallProps): ChartRender {
  const { locale, start, steps, compare, prefix = 'NT$', startTone = 'neutral', stepTone = 'clean', totalTone = 'ink', compareTone = 'exhaust' } = p;
  const money = (v: number) => `${prefix} ${fmt(locale, v)}`;
  const total = steps.reduce((acc, s) => acc - s.value, start.value);
  const max = niceMax(Math.max(start.value, total, compare?.value ?? 0));
  const o: string[] = [];
  const table: string[][] = [];
  let y = 4;

  const row = (label: string, amount: string, strong: boolean, draw: (barY: number) => string, tip: string) => {
    const lines = wrapLabel(label, (MIN_W - px(amount, 15) - 14) / 14);
    const labelH = lines.length * LINE;
    const barY = y + labelH + 4;
    let g = `<g class="c-row" data-tip="${esc(tip)}"><rect class="c-hit" x="0" y="${y}" width="100%" height="${labelH + BAR + 8}"/>`;
    lines.forEach((ln, k) => (g += text(strong ? 'c-label c-strong' : 'c-label', 0, y + 14 + k * LINE, ln)));
    g += text(strong ? 'c-value c-strong' : 'c-value', '100%', y + 14, amount, 'text-anchor="end"');
    g += draw(barY) + '</g>';
    o.push(g);
    y += labelH + 4 + BAR + 14;
    return barY;
  };

  // start
  let running = start.value;
  let prevBarY = row(start.label, money(start.value), false, (by) => hbar(startTone, pctN(start.value, max), by, BAR, 'c-mark'), `${start.label}: ${money(start.value)}`);
  table.push([start.label, money(start.value)]);

  // deductions: the removed slice floats at the end of what is left
  steps.forEach((s) => {
    const next = running - s.value;
    const a = pctN(Math.min(running, next), max);
    const w = pctN(Math.abs(s.value), max);
    const edge = pctN(running, max);
    const amount = `${s.value >= 0 ? MINUS : '+'}${money(Math.abs(s.value))}`;
    const from = prevBarY + BAR;
    prevBarY = row(
      s.label,
      amount,
      false,
      (by) =>
        `<line class="c-connector" x1="${edge}%" x2="${edge}%" y1="${from}" y2="${by + BAR}"/>` +
        `<rect class="c-fill-${stepTone} c-light c-mark" x="${a}%" y="${by}" width="${w}%" height="${BAR}" rx="2"/>`,
      `${s.label}: ${amount}`,
    );
    table.push([s.label, amount]);
    running = next;
  });

  // total
  const edge = pctN(running, max);
  const from = prevBarY + BAR;
  o.push(`<line class="c-rule" x1="0" x2="100%" y1="${y - 4}" y2="${y - 4}"/>`);
  y += 6;
  row(p.totalLabel, money(total), true, (by) => `<line class="c-connector" x1="${edge}%" x2="${edge}%" y1="${from}" y2="${by + BAR}"/>` + hbar(totalTone, pctN(total, max), by, BAR, 'c-mark'), `${p.totalLabel}: ${money(total)}`);
  table.push([p.totalLabel, money(total)]);

  // comparison + gap
  if (compare) {
    row(compare.label, money(compare.value), false, (by) => hbar(compareTone, pctN(compare.value, max), by, BAR, 'c-mark'), `${compare.label}: ${money(compare.value)}`);
    table.push([compare.label, money(compare.value)]);
    if (p.gapLabel) {
      const gap = total - compare.value;
      const amount = `${gap > 0 ? '+' : gap < 0 ? MINUS : ''}${money(Math.abs(gap))}`;
      const a = pctN(Math.min(total, compare.value), max);
      const b = pctN(Math.max(total, compare.value), max);
      row(
        p.gapLabel,
        amount,
        true,
        (by) =>
          `<line class="c-bracket" x1="${a}%" x2="${b}%" y1="${by + BAR / 2}" y2="${by + BAR / 2}"/>` +
          `<line class="c-bracket" x1="${a}%" x2="${a}%" y1="${by + 2}" y2="${by + BAR - 2}"/><line class="c-bracket" x1="${b}%" x2="${b}%" y1="${by + 2}" y2="${by + BAR - 2}"/>`,
        `${p.gapLabel}: ${amount}`,
      );
      table.push([p.gapLabel, amount]);
    }
  }
  const height = y - 10;

  return { kind: 'waterfall', body: o.join(''), height, table: { head: [p.categoryLabel, p.valueLabel], rows: table } };
}
