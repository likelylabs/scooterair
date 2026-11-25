import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmt, px, text, wrapLabel } from './shared';

export interface StackedBarProps {
  locale: Locale;
  /** the parts, in fixed order (≤ 6; fold the tail into an "other" in tone 'neutral') */
  series: { label: string; tone: Tone }[];
  /** one bar per row; `values` in series order. Each row is normalised to 100%. */
  rows: { label: string; values: number[] }[];
  /** decimals for the percentages (default 0) */
  decimals?: number;
  categoryLabel: string;
}

const LINE = 19;
const BAR = 22;

export function renderStacked(p: StackedBarProps): ChartRender {
  const { locale, series, rows, decimals = 0 } = p;
  const o: string[] = [];
  let y = 2;
  const table: string[][] = [];

  rows.forEach((row) => {
    const total = row.values.reduce((a, b) => a + b, 0) || 1;
    const shares = row.values.map((v) => (v / total) * 100);
    const labels = shares.map((s) => `${fmt(locale, s, decimals)}%`);
    table.push([row.label, ...labels]);
    if (row.label) {
      const lines = wrapLabel(row.label, MIN_W / 14);
      lines.forEach((ln, k) => o.push(text('c-label', 0, y + 14 + k * LINE, ln)));
      y += lines.length * LINE + 4;
    }
    let x = 0;
    shares.forEach((s, i) => {
      if (s <= 0) return;
      const tip = esc(`${row.label ? row.label + ' · ' : ''}${series[i].label}: ${labels[i]}`);
      o.push(`<g class="c-row" data-tip="${tip}"><rect class="c-seg c-fill-${series[i].tone} c-mark" x="${x.toFixed(2)}%" y="${y}" width="${s.toFixed(2)}%" height="${BAR}" rx="2"/>`);
      // value under the segment, only where it fits at the narrowest width
      if ((s / 100) * MIN_W >= px(labels[i], 12) + 8) o.push(text('c-tick c-tick--strong', `${x.toFixed(2)}%`, y + BAR + 16, labels[i], 'dx="1"'));
      o.push('</g>');
      x += s;
    });
    y += BAR + 22 + 16;
  });

  return {
    kind: 'stacked',
    body: o.join(''),
    height: y - 16,
    legend: series.map((s) => ({ label: s.label, tone: s.tone, shape: 'rect' })),
    table: { head: [p.categoryLabel, ...series.map((s) => s.label)], rows: table },
  };
}
