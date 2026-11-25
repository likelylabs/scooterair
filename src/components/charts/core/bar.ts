import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmt, hbar, niceMax, pctN, px, text, wrapLabel } from './shared';

export interface BarDatum {
  label: string;
  value: number;
  /** override the chart tone for this bar (colour follows the entity) */
  tone?: Tone;
  /** with `emphasis`: this is the bar the story is about */
  highlight?: boolean;
}

export interface BarChartProps {
  locale: Locale;
  data: BarDatum[];
  /** unit, shown once above the values and in the data table header */
  unit?: string;
  /** axis end; defaults to a clean number above the largest value / reference */
  max?: number;
  /** tone for all bars (default 'exhaust') */
  tone?: Tone;
  /** grey out every bar that is not `highlight` */
  emphasis?: boolean;
  /** a vertical reference line, e.g. a guideline value */
  reference?: { value: number; label: string };
  decimals?: number;
  /** data-table headers */
  categoryLabel: string;
  valueLabel: string;
}

const LINE = 19;
const BAR = 14;

export function renderBar(p: BarChartProps): ChartRender {
  const { locale, data, unit, tone = 'exhaust', emphasis = false, reference, decimals = 0 } = p;
  const max = p.max ?? niceMax(Math.max(...data.map((d) => d.value), reference?.value ?? 0));
  const values = data.map((d) => fmt(locale, d.value, decimals));
  const valueW = Math.max(...values.map((v) => px(v, 15)));
  const labelEm = (MIN_W - valueW - 14) / 14;
  const head = reference || unit ? 26 : 2;
  const o: string[] = [];
  let y = head;
  const rows: string[] = [];

  data.forEach((d, i) => {
    const lines = wrapLabel(d.label, labelEm);
    const labelH = lines.length * LINE;
    const barY = y + labelH + 4;
    const rowH = labelH + 4 + BAR + 16;
    const t: Tone = emphasis && !d.highlight ? 'neutral' : (d.tone ?? tone);
    const strong = !emphasis || d.highlight;
    let g = `<g class="c-row" data-tip="${esc(`${d.label}: ${values[i]}${unit ? ' ' + unit : ''}`)}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${rowH - 6}"/>`;
    lines.forEach((ln, k) => (g += text(strong ? 'c-label' : 'c-label c-dim', 0, y + 14 + k * LINE, ln)));
    g += text(strong ? 'c-value' : 'c-value c-dim', '100%', y + 14, values[i], 'text-anchor="end"');
    g += hbar(t, pctN(d.value, max), barY, BAR, 'c-mark');
    rows.push(g + '</g>');
    y += rowH;
  });
  const height = y - 6;

  // the reference line sits behind the rows
  let unitOnLeft = false;
  if (reference) {
    const rp = pctN(reference.value, max);
    const left = rp >= 50;
    unitOnLeft = left;
    o.push(`<line class="c-ref-line" x1="${rp}%" x2="${rp}%" y1="18" y2="${height}"/>`);
    o.push(text('c-ref', `${rp}%`, 13, reference.label, `text-anchor="${left ? 'end' : 'start'}" dx="${left ? 3 : -3}"`));
  }
  if (unit && !(reference && unitOnLeft)) o.push(text('c-tick', '100%', 13, unit, 'text-anchor="end"'));
  o.push(...rows);

  return {
    kind: 'bar',
    body: o.join(''),
    height,
    table: {
      head: [p.categoryLabel, unit ? `${p.valueLabel} (${unit})` : p.valueLabel],
      rows: [...data.map((d, i) => [d.label, values[i]]), ...(reference ? [[reference.label, fmt(locale, reference.value, decimals)]] : [])],
    },
  };
}
