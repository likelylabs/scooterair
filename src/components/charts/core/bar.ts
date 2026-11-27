import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmtSigned, hbar, hbarFrom, niceMax, niceScale, pctN, px, text, LABEL_LINES, wrapLabel, withUnit, tip } from './shared';

export interface BarDatum {
  label: string;
  /** may be negative: the bar then grows left from the zero line */
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
  /**
   * axis start, for charts with negative values (default: a clean number below the lowest).
   * Never above zero: a bar's length is always measured from zero. For values far from zero
   * that need a cut axis, use RangePlot or LineChart, which draw the axis break.
   */
  min?: number;
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

/** A vertical line from y1 to y2 that stops wherever a label would sit on it. */
export function brokenVLine(cls: string, xPct: number, y1: number, y2: number, gaps: [number, number][]): string {
  const sorted = gaps.filter(([a, b]) => b > y1 && a < y2).sort((a, b) => a[0] - b[0]);
  let out = '';
  let from = y1;
  for (const [a, b] of sorted) {
    if (a - from > 3) out += `<line class="${cls}" x1="${xPct}%" x2="${xPct}%" y1="${from}" y2="${a}"/>`;
    from = Math.max(from, b);
  }
  if (y2 - from > 3) out += `<line class="${cls}" x1="${xPct}%" x2="${xPct}%" y1="${from}" y2="${y2}"/>`;
  return out;
}

export function renderBar(p: BarChartProps): ChartRender {
  const { locale, data, unit, tone = 'exhaust', emphasis = false, reference, decimals = 0 } = p;
  const lowest = Math.min(0, ...data.map((d) => d.value), reference?.value ?? 0);
  const highest = Math.max(0, ...data.map((d) => d.value), reference?.value ?? 0);
  const signedAxis = lowest < 0;
  let min = 0;
  let max: number;
  if (signedAxis) {
    const sc = niceScale(Math.min(lowest, p.min ?? 0), p.max ?? highest, 4);
    min = Math.min(p.min ?? sc.min, 0);
    max = p.max ?? Math.max(sc.max, 0);
  } else max = p.max ?? niceMax(highest);
  const zero = pctN(0, max, min);
  const values = data.map((d) => fmtSigned(locale, d.value, decimals));
  const valueW = Math.max(...values.map((v) => px(v, 15)));
  const labelEm = (MIN_W - valueW - 14) / 14;
  const head = reference || unit ? 26 : 2;
  const o: string[] = [];
  let y = head;
  const rows: string[] = [];
  /** where text sits, as [x0, x1, y0, y1] in px at the narrowest width: a reference line keeps clear of these */
  const boxes: [number, number, number, number][] = [];

  data.forEach((d, i) => {
    const lines = wrapLabel(d.label, labelEm, LABEL_LINES);
    const labelH = lines.length * LINE;
    const barY = y + labelH + 4;
    const rowH = labelH + 4 + BAR + 16;
    const t: Tone = emphasis && !d.highlight ? 'neutral' : (d.tone ?? tone);
    const strong = !emphasis || d.highlight;
    let g = `<g class="c-row" data-tip="${esc(tip(locale, d.label, values[i], unit))}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${rowH - 6}"/>`;
    lines.forEach((ln, k) => {
      g += text(strong ? 'c-label' : 'c-label c-dim', 0, y + 14 + k * LINE, ln);
      boxes.push([0, px(ln, 14), y + k * LINE, y + (k + 1) * LINE]);
    });
    g += text(strong ? 'c-value' : 'c-value c-dim', '100%', y + 14, values[i], 'text-anchor="end"');
    boxes.push([MIN_W - px(values[i], 15), MIN_W, y, y + LINE]);
    g += signedAxis ? hbarFrom(t, zero, pctN(d.value, max, min), barY, BAR, 'c-mark') : hbar(t, pctN(d.value, max), barY, BAR, 'c-mark');
    rows.push(g + '</g>');
    y += rowH;
  });
  let height = y - 6;

  // a chart with negative values says where zero is, once, under the rows (each bar carries its own zero tick)
  if (signedAxis) {
    o.push(text('c-tick', `${zero}%`, height + 18, '0', `text-anchor="${zero < 4 ? 'start' : zero > 96 ? 'end' : 'middle'}"`));
    height += 22;
  }

  // the reference line sits behind the rows and stops short of any label or value it would cross
  let unitOnLeft = false;
  if (reference) {
    const rp = pctN(reference.value, max, min);
    const left = rp >= 50;
    unitOnLeft = left;
    const rx = (rp / 100) * MIN_W;
    const gaps = boxes.filter(([x0, x1]) => rx > x0 - 6 && rx < x1 + 6).map(([, , y0, y1]) => [y0 - 1, y1 + 1] as [number, number]);
    o.push(brokenVLine('c-ref-line', rp, 18, signedAxis ? height - 22 : height, gaps));
    o.push(text('c-ref', `${rp}%`, 13, reference.label, `text-anchor="${left ? 'end' : 'start'}" dx="${left ? 3 : -3}"`));
  }
  // the unit sits in the top right corner unless the reference label needs that corner
  const refEnd = reference ? (pctN(reference.value, max, min) / 100) * MIN_W + 3 : 0;
  if (unit && (!(reference && unitOnLeft) || MIN_W - refEnd > px(unit, 14) + 14)) o.push(text('c-tick', '100%', 13, unit, 'text-anchor="end"'));
  o.push(...rows);

  return {
    kind: 'bar',
    body: o.join(''),
    height,
    table: {
      head: [p.categoryLabel, withUnit(locale, p.valueLabel, unit)],
      rows: [...data.map((d, i) => [d.label, values[i]]), ...(reference ? [[reference.label, fmtSigned(locale, reference.value, decimals)]] : [])],
    },
  };
}
