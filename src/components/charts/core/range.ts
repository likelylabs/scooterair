import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, axisBreak, esc, fmtSigned, niceMax, niceScale, pctN, px, text, LABEL_LINES, wrapLabel, withUnit } from './shared';
import { brokenVLine } from './bar';

export interface RangeDatum {
  label: string;
  min: number;
  max: number;
  /**
   * The central value: median (or mean; say which in `labels.mid`). Leave it out when the
   * source gives only a span: no dot is drawn and the row prints the span itself, so the
   * chart never invents a centre.
   */
  mid?: number;
  tone?: Tone;
}

export interface RangePlotProps {
  locale: Locale;
  data: RangeDatum[];
  unit?: string;
  /** axis end */
  max?: number;
  /**
   * Axis start (default 0, or a clean number below the lowest value when one is negative).
   * A range plot shows position, not length, so the axis may start above zero: the chart
   * then draws a ruled axis with its ticks and an axis-break mark where zero was cut off.
   */
  min?: number;
  /** draw the ruled axis with ticks even on a zero-based scale (it is always drawn when the axis is cut or crosses zero) */
  axis?: boolean;
  tone?: Tone;
  reference?: { value: number; label: string };
  decimals?: number;
  /** words for the three numbers, e.g. { min: '最小值', mid: '中位數', max: '最大值' }. `mid` may be left out when no row has one. */
  labels: { min: string; mid?: string; max: string };
  categoryLabel: string;
}

const LINE = 19;
/** % of the width given to the axis-break mark when the axis starts above zero */
const INSET = 7;

export function renderRange(p: RangePlotProps): ChartRender {
  const { locale, data, unit, tone = 'exhaust', reference, decimals = 0, labels } = p;
  const lowest = Math.min(...data.map((d) => d.min), reference?.value ?? Infinity);
  const highest = Math.max(...data.map((d) => d.max), reference?.value ?? 0);
  const f = (v: number) => fmtSigned(locale, v, decimals);

  // scale. The common case (min not given, nothing negative) is exactly the zero-based plot.
  let min = 0;
  let max: number;
  let ticks: number[] = [];
  const custom = p.min !== undefined || lowest < 0;
  if (custom) {
    const sc = niceScale(p.min ?? lowest, p.max ?? highest, 4);
    min = p.min ?? sc.min;
    max = p.max ?? sc.max;
    ticks = sc.ticks.filter((t) => t >= min && t <= max);
    if (ticks[0] !== min) ticks.unshift(min);
  } else {
    max = p.max ?? niceMax(highest);
    if (p.axis) ticks = niceScale(0, max, 4).ticks.filter((t) => t <= max);
  }
  const cut = min > 0;
  const ruled = custom || !!p.axis;
  const inset = cut ? INSET : 0;
  const at = (v: number) => +(inset + (pctN(v, max, min) * (100 - inset)) / 100).toFixed(2);

  const anyMid = data.some((d) => d.mid !== undefined);
  // a "range" whose two ends are the same figure is one value: it is printed once, as a dot
  const point = (d: RangeDatum) => f(d.min) === f(d.max);
  const spanText = (d: RangeDatum) => (point(d) ? f(d.min) : `${f(d.min)}–${f(d.max)}`);
  const valueText = (d: RangeDatum) => (d.mid !== undefined ? f(d.mid) : spanText(d));
  const valueW = Math.max(...data.map((d) => px(valueText(d), 15)));
  const o: string[] = [];
  const head = 26;
  // column header for the value on the right: what the bold number is (+ unit)
  const what = anyMid ? (labels.mid ?? '') : `${labels.min}–${labels.max}`;
  const headText = [what, unit].filter(Boolean).join(' · ');
  if (headText) o.push(text('c-tick', '100%', 13, headText, 'text-anchor="end"'));
  let y = head;
  const rows: string[] = [];
  /** where text sits, as [x0, x1, y0, y1] in px at the narrowest width: the reference line keeps clear of these */
  const boxes: [number, number, number, number][] = [];

  // min and max are printed under the ends of the span, or once as "min–max" under its middle
  // when any row's two would collide: one style for the whole chart, so no row looks different
  const combined = data.some((d) => {
    if (d.mid === undefined || f(d.min) === f(d.max)) return false;
    const gapPx = ((at(d.max) - at(d.min)) / 100) * MIN_W;
    return gapPx < (px(f(d.min), 12) + px(f(d.max), 12)) / 2 + 10;
  });
  data.forEach((d) => {
    const lines = wrapLabel(d.label, (MIN_W - valueW - 14) / 14, LABEL_LINES);
    const labelH = lines.length * LINE;
    const cy = y + labelH + 13;
    const t = d.tone ?? tone;
    const a = at(d.min);
    const b = at(d.max);
    const hasMid = d.mid !== undefined && !point(d);
    const tip = point(d) ? `${d.label}: ${valueText(d)}${unit ? ' ' + unit : ''}` : hasMid ? `${d.label}: ${labels.mid ?? ''} ${f(d.mid as number)}, ${labels.min} ${f(d.min)}, ${labels.max} ${f(d.max)}${unit ? ' ' + unit : ''}` : `${d.label}: ${labels.min} ${f(d.min)}, ${labels.max} ${f(d.max)}${unit ? ' ' + unit : ''}`;
    let g = `<g class="c-row" data-tip="${esc(tip.replace(/\s+/g, ' '))}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${labelH + (hasMid ? 44 : 30)}"/>`;
    lines.forEach((ln, k) => {
      g += text('c-label', 0, y + 14 + k * LINE, ln);
      boxes.push([0, px(ln, 14), y + k * LINE, y + (k + 1) * LINE]);
    });
    g += text('c-value', '100%', y + 14, valueText(d), 'text-anchor="end"');
    boxes.push([MIN_W - px(valueText(d), 15), MIN_W, y, y + LINE]);
    // the span and its end caps; then the mid dot with a surface ring, when there is a mid
    if (point(d)) g += `<circle class="c-dot c-fill-${t} c-mark" cx="${a}%" cy="${cy}" r="6.5"/>`;
    else {
      g += `<line class="c-span c-stroke-${t}" x1="${a}%" x2="${b}%" y1="${cy}" y2="${cy}"/>`;
      g += `<line class="c-cap c-stroke-${t}" x1="${a}%" x2="${a}%" y1="${cy - 6}" y2="${cy + 6}"/><line class="c-cap c-stroke-${t}" x1="${b}%" x2="${b}%" y1="${cy - 6}" y2="${cy + 6}"/>`;
    }
    if (hasMid) {
      g += `<circle class="c-dot c-fill-${t} c-mark" cx="${at(d.mid as number)}%" cy="${cy}" r="6.5"/>`;
      // min / max under the ends; one combined label when they would collide
      const minT = f(d.min);
      const maxT = f(d.max);
      const under = (pos: number, label: string, anchor: string) => {
        g += text('c-tick', `${pos}%`, cy + 22, label, `text-anchor="${anchor}"`);
        const w = px(label, 12);
        const x = (pos / 100) * MIN_W;
        boxes.push([anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2, anchor === 'start' ? x + w : anchor === 'end' ? x : x + w / 2, cy + 10, cy + 26]);
      };
      if (combined) {
        const mid = (a + b) / 2;
        under(mid, `${minT}–${maxT}`, mid < 12 ? 'start' : mid > 88 ? 'end' : 'middle');
      } else {
        under(a, minT, a < 6 ? 'start' : 'middle');
        under(b, maxT, b > 94 ? 'end' : 'middle');
      }
    }
    rows.push(g + '</g>');
    // a row without a mid already prints its span as the value: nothing is repeated under the ends
    y += labelH + 13 + (hasMid ? 26 : 12) + 16;
  });
  let height = y - 12;

  // the ruled axis: drawn whenever the scale is not the plain zero-based one
  if (ruled) {
    const axisY = height + 6;
    o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
    if (cut) o.push(axisBreak(`${INSET / 2}%`, axisY));
    const kept: { pos: number; w: number }[] = [];
    ticks.forEach((t, i) => {
      const pos = at(t);
      const label = f(t);
      const w = px(label, 12);
      // drop a tick that would run into its neighbour at the narrowest width (the last one always stays)
      if (i < ticks.length - 1 && kept.some((k) => Math.abs(k.pos - pos) * (MIN_W / 100) < (k.w + w) / 2 + 8)) return;
      kept.push({ pos, w });
      o.push(`<line class="${t === 0 ? 'c-axis' : 'c-grid'}" x1="${pos}%" x2="${pos}%" y1="${head - 4}" y2="${axisY}"/>`);
      o.push(`<line class="c-axis" x1="${pos}%" x2="${pos}%" y1="${axisY}" y2="${axisY + 5}"/>`);
      o.push(text('c-tick', `${pos}%`, axisY + 19, label, `text-anchor="${pos < 4 ? 'start' : pos > 96 ? 'end' : 'middle'}"`));
    });
    height = axisY + 26;
  }
  if (reference) {
    const rp = at(reference.value);
    const left = rp >= 45;
    const rx = (rp / 100) * MIN_W;
    const gaps = boxes.filter(([x0, x1]) => rx > x0 - 6 && rx < x1 + 6).map(([, , y0, y1]) => [y0 - 1, y1 + 1] as [number, number]);
    o.push(brokenVLine('c-ref-line', rp, 18, ruled ? height - 20 : height, gaps));
    // the right-hand corner already holds the column header, so the label goes left of the line when it can
    o.push(text('c-ref', `${rp}%`, 13, reference.label, `text-anchor="${left ? 'end' : 'start'}" dx="${left ? -5 : 5}"`));
  }
  o.push(...rows);

  const cols = anyMid ? [labels.min, labels.mid ?? '', labels.max] : [labels.min, labels.max];
  return {
    kind: 'range',
    body: o.join(''),
    height,
    table: {
      head: [p.categoryLabel, ...cols].map((h, i) => (i ? withUnit(locale, h, unit) : h)),
      rows: data.map((d) => (anyMid ? [d.label, f(d.min), d.mid !== undefined ? f(d.mid) : '–', f(d.max)] : [d.label, f(d.min), f(d.max)])),
    },
  };
}
