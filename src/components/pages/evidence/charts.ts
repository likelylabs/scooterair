// Chart shapes /evidence/ needs that the shared chart set does not draw: signed values around
// zero, intervals around a reference, spans without a central value, a true time axis, and a
// log axis for odour thresholds. Each is a pure function returning the same ChartRender every
// shared chart returns, so <EvChart> hands it to the shared ChartShell (title, description,
// hover readout, data table) and it behaves like every other chart on the site.
//
// Same layout rules as src/components/charts/core: no viewBox, x in percent, real px text,
// one design from 300px up. Values come from the registry via figures.ts; nothing is typed here.

import type { Locale } from '@/i18n';
import { type ChartRender, type LegendItem, type Tone, MIN_W, esc, fmt, fmtCompact, niceMax, px, text, wrapLabel } from '@/components/charts/core/shared';

const r2 = (v: number) => +v.toFixed(2);
const LINE = 19;
const MINUS = '−';

/** A text line with a block of the surface colour behind it, so a reference line never runs through it. */
function bgText(cls: string, x: '0' | '100%', y: number, content: string, size = 14): string {
  const w = Math.ceil(px(content, size + 0.5)) + 8;
  const rx = x === '0' ? `x="-2"` : `x="100%" transform="translate(${-w + 2} 0)"`;
  return `<rect class="evc-bg" ${rx} y="${r2(y - size)}" width="${w}" height="${size + 6}"/>` + text(cls, x, y, content, x === '100%' ? 'text-anchor="end"' : '');
}

/** Signed number with a typographic minus. */
export function sgn(locale: Locale, v: number, d = 1): string {
  const s = fmt(locale, Math.abs(v), d).replace(/\.0+$/, '');
  return (v < 0 ? MINUS : v > 0 ? '+' : '') + s;
}
/** Number with up to d decimals, trailing zeros dropped. */
/**
 * A table whose last column holds notes: kept only when every row has one. Otherwise the column is
 * dropped and each note goes in brackets after its row's label, so no cell is left empty.
 */
function noteColumn(head: string[], rows: string[][], locale: Locale): { head: string[]; rows: string[][] } {
  const last = head.length - 1;
  if (rows.every((r) => r[last])) return { head, rows };
  const [o, c] = locale === 'en' ? [' (', ')'] : ['（', '）'];
  return { head: head.slice(0, last), rows: rows.map((r) => [r[0] + (r[last] ? `${o}${r[last]}${c}` : ''), ...r.slice(1, last)]) };
}

export const nf = (locale: Locale, v: number, d = 2) => new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'zh-TW', { maximumFractionDigits: d }).format(v);

/** A clean step for ticks between min and max. */
function step(span: number, count = 4) {
  const raw = span / count;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
function ticks(min: number, max: number, count = 4) {
  const s = step(max - min, count);
  const out: number[] = [];
  for (let v = Math.ceil(min / s) * s; v <= max + s * 1e-6; v += s) out.push(+v.toPrecision(8));
  return out;
}

// ---------------------------------------------------------------------------------------
// Signed bars around zero, in groups (V22 phase excess, V29 stroller studies, V32 quiet
// route, the scenario model results). A hollow bar marks a point the source itself qualifies
// (not significant, or failed the model check); the legend says which.
// ---------------------------------------------------------------------------------------

export interface SignedRow {
  label: string;
  value: number | null;
  /** drawn as an outline: qualified by the source */
  hollow?: boolean;
  /** printed before the value ("up to", "more than") */
  prefix?: string;
  /** printed after the value ("*", "outlier") */
  suffix?: string;
  /** text shown instead of a bar when value is null */
  nullText?: string;
  tone?: Tone;
}
export interface SignedProps {
  locale: Locale;
  groups: { label?: string; rows: SignedRow[] }[];
  unit: string;
  decimals?: number;
  tone?: Tone;
  min?: number;
  max?: number;
  /** a shaded band behind the bars, e.g. "most studies: 5–15%" */
  band?: { low: number; high: number; label: string };
  /** words under the zero line */
  zeroLabel?: string;
  /** a closing line under the axis */
  foot?: string;
  legend?: LegendItem[];
  categoryLabel: string;
  valueLabel: string;
  noteLabel: string;
  /** per-row table note (flag labels) */
  notes?: string[][];
}

export function renderSigned(p: SignedProps): ChartRender {
  const { locale, groups, unit, decimals = 1 } = p;
  const all = groups.flatMap((g) => g.rows.map((r) => r.value)).filter((v): v is number => v !== null);
  const lo = Math.min(0, ...all, p.band?.low ?? 0);
  const hi = Math.max(0, ...all, p.band?.high ?? 0);
  const min = p.min ?? (lo < 0 ? -niceMax(-lo) : 0);
  const max = p.max ?? (hi > 0 ? niceMax(hi) : 0);
  const valueText = (r: SignedRow) =>
    r.value === null ? (r.nullText ?? '–') : `${r.prefix ? r.prefix + ' ' : ''}${sgn(locale, r.value, decimals)}${unit}${r.suffix ? ' ' + r.suffix : ''}`;
  const valW = Math.max(...groups.flatMap((g) => g.rows.map((r) => px(valueText(r), 14)))) + 10;
  const xp = (v: number) => r2(((v - min) / (max - min || 1)) * 100);
  const o: string[] = [];
  const body: string[] = [];
  let y = p.band ? 26 : 8;
  groups.forEach((g, gi) => {
    if (g.label) {
      const lines = wrapLabel(g.label, MIN_W / 14);
      lines.forEach((ln, k) => body.push(bgText('c-label c-strong', '0', y + 14 + k * LINE, ln)));
      y += lines.length * LINE + 6;
    }
    g.rows.forEach((r) => {
      const vt = valueText(r);
      const lines = wrapLabel(r.label, (MIN_W - valW - 8) / 14);
      const by = y + lines.length * LINE + 5;
      const tone = r.tone ?? p.tone ?? 'exhaust';
      let row = `<g class="c-row" data-tip="${esc(`${g.label ? g.label + ' · ' : ''}${r.label}: ${vt}`)}">`;
      row += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${lines.length * LINE + 26}"/>`;
      lines.forEach((ln, k) => (row += bgText('c-label', '0', y + 14 + k * LINE, ln)));
      row += bgText('c-value', '100%', y + 14, vt, 15);
      if (r.value === null) {
        row += `<line class="c-emptykey" x1="0" x2="100%" y1="${by + 6}" y2="${by + 6}"/>`;
      } else {
        const a = Math.min(xp(0), xp(r.value));
        const w = Math.max(Math.abs(xp(r.value) - xp(0)), 0.6);
        row += r.hollow
          ? `<rect class="evc-hollow c-stroke-${tone} c-mark" x="${a}%" y="${by}" width="${r2(w)}%" height="12" rx="2"/>`
          : `<rect class="c-fill-${tone} c-mark" x="${a}%" y="${by}" width="${r2(w)}%" height="12" rx="2"/>`;
      }
      body.push(row + '</g>');
      y = by + 12 + 14;
    });
    if (gi < groups.length - 1) y += 8;
  });
  const axisY = y;
  if (p.band) {
    const a = xp(p.band.low);
    const b = xp(p.band.high);
    o.push(`<rect class="c-fill-neutral c-light" x="${a}%" y="20" width="${r2(b - a)}%" height="${axisY - 20}"/>`);
    o.push(text('c-tick c-tick--strong', `${b}%`, 13, p.band.label, `text-anchor="${b > 60 ? 'end' : 'start'}" dx="${b > 60 ? -2 : 4}"`));
  }
  o.push(`<line class="c-ref-line" x1="${xp(0)}%" x2="${xp(0)}%" y1="${p.band ? 20 : 4}" y2="${axisY}"/>`);
  o.push(...body);
  o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
  const tk = ticks(min, max, 4);
  tk.forEach((t, i) => {
    const anchor = i === 0 && xp(t) < 4 ? 'start' : xp(t) > 96 ? 'end' : 'middle';
    o.push(text('c-tick', `${xp(t)}%`, axisY + 17, t === 0 ? '0' : `${sgn(locale, t, 0)}${unit}`, `text-anchor="${anchor}"`));
  });
  let h = axisY + 24;
  if (p.zeroLabel) {
    o.push(text('c-tick', 0, h + 12, p.zeroLabel));
    h += 20;
  }
  if (p.foot) {
    const lines = wrapLabel(p.foot, MIN_W / 14, 3);
    lines.forEach((ln, k) => o.push(text('c-label c-strong', 0, h + 18 + k * LINE, ln)));
    h += lines.length * LINE + 12;
  }
  const rows: string[][] = [];
  let i = 0;
  groups.forEach((g) =>
    g.rows.forEach((r) => {
      rows.push([g.label ? `${g.label} · ${r.label}` : r.label, valueText(r), (p.notes?.[i] ?? []).join(locale === 'en' ? ', ' : '、')]);
      i++;
    }),
  );
  return {
    kind: 'evc-signed',
    body: o.join(''),
    height: h + 4,
    legend: p.legend,
    table: noteColumn([p.categoryLabel, p.valueLabel, p.noteLabel], rows, locale),
  };
}

// ---------------------------------------------------------------------------------------
// Intervals: a central estimate with its 95% confidence interval, on an axis that need not
// start at zero, with a reference line at "no difference" (0% or a ratio of 1).
// ---------------------------------------------------------------------------------------

export interface IntervalRow {
  label: string;
  mid: number;
  low: number;
  high: number;
  strong?: boolean;
}
export interface IntervalProps {
  locale: Locale;
  groups: { label: string; rows: IntervalRow[] }[];
  reference: { value: number; label: string };
  unit?: string;
  decimals?: number;
  tone?: Tone;
  categoryLabel: string;
  midLabel: string;
  lowLabel: string;
  highLabel: string;
  legend?: LegendItem[];
}

export function renderIntervals(p: IntervalProps): ChartRender {
  const { locale, groups, reference, unit = '', decimals = 1 } = p;
  const vals = groups.flatMap((g) => g.rows.flatMap((r) => [r.low, r.high, r.mid]));
  const span = Math.max(...vals) - Math.min(...vals);
  const s = step(span || 1, 4);
  const min = Math.floor(Math.min(...vals, reference.value) / s) * s;
  const max = Math.ceil(Math.max(...vals, reference.value) / s) * s;
  const xp = (v: number) => r2(((v - min) / (max - min || 1)) * 100);
  const f = (v: number) => (v < 0 ? MINUS : '') + nf(locale, Math.abs(v), decimals);
  const vt = (r: IntervalRow) => `${f(r.mid)}${unit} (${f(r.low)} – ${f(r.high)})`;
  const valW = Math.max(...groups.flatMap((g) => g.rows.map((r) => px(vt(r), 14)))) + 10;
  const o: string[] = [];
  const body: string[] = [];
  let y = 26;
  groups.forEach((g) => {
    const lines = wrapLabel(g.label, MIN_W / 14);
    lines.forEach((ln, k) => body.push(bgText('c-label c-strong', '0', y + 14 + k * LINE, ln)));
    y += lines.length * LINE + 6;
    g.rows.forEach((r) => {
      const labLines = wrapLabel(r.label, (MIN_W - valW - 8) / 14);
      const cy = y + labLines.length * LINE + 10;
      const tone = p.tone ?? 'exhaust';
      const dim = r.strong === false;
      let row = `<g class="c-row" data-tip="${esc(`${g.label} · ${r.label}: ${vt(r)}`)}">`;
      row += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${labLines.length * LINE + 24}"/>`;
      labLines.forEach((ln, k) => (row += bgText(dim ? 'c-label c-dim' : 'c-label', '0', y + 14 + k * LINE, ln)));
      row += bgText(dim ? 'c-value c-dim' : 'c-value', '100%', y + 14, vt(r), 15);
      row += `<line class="c-span c-stroke-${dim ? 'neutral' : tone}" x1="${xp(r.low)}%" x2="${xp(r.high)}%" y1="${cy}" y2="${cy}"/>`;
      row += `<line class="c-cap c-stroke-${dim ? 'neutral' : tone}" x1="${xp(r.low)}%" x2="${xp(r.low)}%" y1="${cy - 5}" y2="${cy + 5}"/><line class="c-cap c-stroke-${dim ? 'neutral' : tone}" x1="${xp(r.high)}%" x2="${xp(r.high)}%" y1="${cy - 5}" y2="${cy + 5}"/>`;
      row += dim
        ? `<circle class="evc-hollow c-stroke-neutral c-mark" cx="${xp(r.mid)}%" cy="${cy}" r="5"/>`
        : `<circle class="c-dot c-fill-${tone} c-mark" cx="${xp(r.mid)}%" cy="${cy}" r="5.5"/>`;
      body.push(row + '</g>');
      y = cy + 18;
    });
    y += 8;
  });
  const axisY = y - 4;
  const rx = xp(reference.value);
  o.push(`<line class="c-ref-line" x1="${rx}%" x2="${rx}%" y1="18" y2="${axisY}"/>`);
  o.push(text('c-ref', `${rx}%`, 13, reference.label, `text-anchor="${rx > 50 ? 'end' : 'start'}" dx="${rx > 50 ? -4 : 4}"`));
  o.push(...body);
  o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
  ticks(min, max, 4).forEach((t) => {
    const x = xp(t);
    o.push(text('c-tick', `${x}%`, axisY + 17, `${fmt(locale, t, step(max - min) < 1 ? 1 : 0)}${unit}`, `text-anchor="${x < 3 ? 'start' : x > 97 ? 'end' : 'middle'}"`));
  });
  return {
    kind: 'evc-interval',
    body: o.join(''),
    height: axisY + 26,
    legend: p.legend,
    table: {
      head: [p.categoryLabel, p.midLabel, p.lowLabel, p.highLabel],
      rows: groups.flatMap((g) => g.rows.map((r) => [`${g.label} · ${r.label}`, `${f(r.mid)}${unit}`, `${f(r.low)}${unit}`, `${f(r.high)}${unit}`])),
    },
  };
}

// ---------------------------------------------------------------------------------------
// Spans and single values on one axis, no central value invented (V25 correlations, V31).
// ---------------------------------------------------------------------------------------

export interface SpanRow {
  label: string;
  low?: number;
  high?: number;
  value?: number;
  /** printed on the right instead of the computed text */
  valueText?: string;
  tone?: Tone;
  note?: string;
}
export interface SpanProps {
  locale: Locale;
  rows: SpanRow[];
  min: number;
  max: number;
  unit?: string;
  decimals?: number;
  /** labelled vertical lines, e.g. 0 and 1 for a correlation */
  marks?: { value: number; label: string }[];
  tickStep?: number;
  categoryLabel: string;
  valueLabel: string;
  noteLabel?: string;
}

export function renderSpans(p: SpanProps): ChartRender {
  const { locale, rows, min, max, unit = '', decimals = 2 } = p;
  const xp = (v: number) => r2(((v - min) / (max - min)) * 100);
  const f = (v: number) => (v < 0 ? MINUS : '') + nf(locale, Math.abs(v), decimals);
  const vt = (r: SpanRow) => r.valueText ?? (r.value !== undefined ? `${f(r.value)}${unit}` : `${f(r.low!)}${unit} – ${f(r.high!)}${unit}`);
  const valW = Math.max(...rows.map((r) => px(vt(r), 14))) + 10;
  const o: string[] = [];
  const body: string[] = [];
  let y = (p.marks?.length ?? 0) > 0 ? 24 : 6;
  rows.forEach((r) => {
    const lines = wrapLabel(r.label, (MIN_W - valW - 8) / 14, 4);
    const cy = y + lines.length * LINE + 12;
    const tone = r.tone ?? 'exhaust';
    let g = `<g class="c-row" data-tip="${esc(`${r.label}: ${vt(r)}`)}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${lines.length * LINE + 28}"/>`;
    lines.forEach((ln, k) => (g += bgText('c-label', '0', y + 14 + k * LINE, ln)));
    g += bgText('c-value', '100%', y + 14, vt(r), 15);
    g += `<rect class="c-track" x="0" y="${cy - 4}" width="100%" height="8" rx="4"/>`;
    if (r.value !== undefined) {
      g += `<circle class="c-dot c-fill-${tone} c-mark" cx="${xp(r.value)}%" cy="${cy}" r="7"/>`;
    } else {
      const a = xp(r.low!);
      const b = xp(r.high!);
      g += `<rect class="c-fill-${tone} c-mark" x="${Math.min(a, b)}%" y="${cy - 7}" width="${r2(Math.max(Math.abs(b - a), 0.8))}%" height="14" rx="3"/>`;
    }
    body.push(g + '</g>');
    y = cy + 24;
  });
  const axisY = y - 4;
  for (const m of p.marks ?? []) {
    const x = xp(m.value);
    o.push(`<line class="c-ref-line" x1="${x}%" x2="${x}%" y1="18" y2="${axisY}"/>`);
    o.push(text('c-ref', `${x}%`, 12, m.label, `text-anchor="${x > 60 ? 'end' : 'start'}" dx="${x > 60 ? -4 : 4}"`));
  }
  o.push(...body);
  o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
  const s = p.tickStep ?? step(max - min, 4);
  for (let t = Math.ceil(min / s) * s; t <= max + 1e-9; t += s) {
    const v = +t.toPrecision(8);
    const x = xp(v);
    o.push(text('c-tick', `${x}%`, axisY + 17, `${f(v)}${unit}`, `text-anchor="${x < 3 ? 'start' : x > 97 ? 'end' : 'middle'}"`));
  }
  return {
    kind: 'evc-span',
    body: o.join(''),
    height: axisY + 26,
    table: p.noteLabel
      ? noteColumn([p.categoryLabel, p.valueLabel, p.noteLabel], rows.map((r) => [r.label, vt(r), r.note ?? '']), locale)
      : { head: [p.categoryLabel, p.valueLabel], rows: rows.map((r) => [r.label, vt(r)]) },
  };
}

// ---------------------------------------------------------------------------------------
// A true time axis: observed series as solid lines (breaking where a year has no verified
// figure), each with its own point shape, targets as a dashed line through hollow points.
// Years are spaced by their value, not by their order, so 2013 → 2016 → 2019 → 2021 is drawn
// as it happened. (The shared renderLine now has a value x-scale too, but names its lines only
// in wide containers; this one keeps a key with the real marks at every width.)
// ---------------------------------------------------------------------------------------

export interface TimeSeries {
  label: string;
  tone: Tone;
  points: { x: number; y: number | null }[];
  target?: boolean;
  /** the point mark of an observed series; each series gets its own, so lines are told apart without colour */
  marker?: TimeMarker;
}
export type TimeMarker = 'circle' | 'square' | 'diamond' | 'triangle';
export const TIME_MARKERS: TimeMarker[] = ['circle', 'square', 'diamond', 'triangle'];

/** A point mark centred on (x, y), drawn in a zero-size nested svg so x can be a percentage. */
function timeMark(shape: TimeMarker | 'ring', tone: Tone, x: string | number, y: number): string {
  const inner =
    shape === 'ring'
      ? `<circle class="c-cap c-stroke-${tone}" r="5" fill="var(--here, var(--bg))"/>`
      : shape === 'square'
        ? `<rect class="c-fill-${tone}" x="-4.25" y="-4.25" width="8.5" height="8.5"/>`
        : shape === 'diamond'
          ? `<path class="c-fill-${tone}" d="M0,-6L6,0L0,6L-6,0Z"/>`
          : shape === 'triangle'
            ? `<path class="c-fill-${tone}" d="M0,-5.5L5.5,4.5L-5.5,4.5Z"/>`
            : `<circle class="c-dot c-fill-${tone}" r="4.5"/>`;
  return `<svg x="${x}" y="${r2(y)}" width="1" height="1" overflow="visible">${inner}</svg>`;
}
export interface TimeProps {
  locale: Locale;
  series: TimeSeries[];
  unit: string;
  yMax?: number;
  decimals?: number;
  xLabel: string;
  height?: number;
}

export function renderTime(p: TimeProps): ChartRender {
  const { locale, series, unit, decimals = 0 } = p;
  const TOP = 30;
  const H = p.height ?? 200;
  const xs = [...new Set(series.flatMap((s) => s.points.map((q) => q.x)))].sort((a, b) => a - b);
  const x0 = xs[0];
  const x1 = xs[xs.length - 1];
  const ys = series.flatMap((s) => s.points.map((q) => q.y)).filter((v): v is number => v !== null);
  const yMax = p.yMax ?? niceMax(Math.max(...ys) * 1.08);
  const xp = (x: number) => r2(((x - x0) / (x1 - x0 || 1)) * 100);
  const yp = (v: number) => TOP + H - (v / yMax) * H;
  const f = (v: number) => nf(locale, v, decimals);
  const tickF = (v: number) => (v >= 10000 ? fmtCompact(locale, v) : nf(locale, v, 1));
  const o: string[] = [];
  ticks(0, yMax, 4).forEach((t, i) => {
    o.push(`<line class="${i === 0 ? 'c-axis' : 'c-grid'}" x1="0" x2="100%" y1="${yp(t)}" y2="${yp(t)}"/>`);
    o.push(text('c-tick', 0, yp(t) + 4, tickF(t), 'text-anchor="end" dx="-8"'));
  });
  o.push(text('c-tick', '100%', 12, unit, 'text-anchor="end"'));
  // x ticks: every year that has a point, thinned to fit a phone
  // x ticks: the ends of the axis and of each series first, then any year that still fits.
  // A label needs about its own width between centres; the start- and end-anchored ones need more.
  const labelW = ((px('2000', 12) + 8) / (MIN_W - 46)) * 100;
  const ends = series.flatMap((sr) => {
    const shown = sr.points.filter((q) => q.y !== null).map((q) => q.x);
    return shown.length ? [shown[0], shown[shown.length - 1]] : [];
  });
  const order = [...new Set([x0, x1, ...ends, ...xs])];
  const kept: number[] = [];
  const need = (a: number, b: number) => labelW * ([a, b].some((v) => v === x0 || v === x1) ? 1.5 : 1);
  for (const x of order) if (kept.every((k) => Math.abs(xp(k) - xp(x)) >= need(k, x))) kept.push(x);
  kept.sort((a, b) => a - b).forEach((x) => {
    const pos = xp(x);
    o.push(text('c-tick', `${pos}%`, TOP + H + 18, String(x), `text-anchor="${x === x0 ? 'start' : x === x1 ? 'end' : 'middle'}"`));
  });
  const paths: string[] = [];
  series.forEach((s) => {
    let d = '';
    let pen = false;
    s.points.forEach((q) => {
      if (q.y === null) return void (pen = false);
      d += `${pen ? 'L' : 'M'}${(xp(q.x) * 10).toFixed(1)},${yp(q.y).toFixed(1)}`;
      pen = true;
    });
    paths.push(`<path class="c-line c-stroke-${s.tone}" d="${d}"${s.target ? ' stroke-dasharray="6 6"' : ''} vector-effect="non-scaling-stroke"/>`);
  });
  o.push(`<svg class="c-stretch" x="0" y="0" width="100%" height="${TOP + H}" viewBox="0 0 1000 ${TOP + H}" preserveAspectRatio="none">${paths.join('')}</svg>`);
  // points and end labels (pushed apart so they never collide)
  const endLabels: { y: number; text: string; x: number; anchor: string }[] = [];
  const shapeOf = (s: TimeSeries): TimeMarker | 'ring' => (s.target ? 'ring' : s.marker ?? 'circle');
  series.forEach((s) => {
    const shown = s.points.filter((q): q is { x: number; y: number } => q.y !== null);
    shown.forEach((q) => o.push(timeMark(shapeOf(s), s.tone, `${xp(q.x)}%`, yp(q.y))));
    if (s.target) {
      shown.forEach((q) => o.push(text('c-value c-value--sm', `${xp(q.x)}%`, yp(q.y) - 10, `${f(q.y)}`, `text-anchor="${xp(q.x) > 92 ? 'end' : 'middle'}"`)));
    } else if (shown.length) {
      const a = shown[0];
      const b = shown[shown.length - 1];
      endLabels.push({ y: yp(a.y), text: f(a.y), x: xp(a.x), anchor: 'start' });
      endLabels.push({ y: yp(b.y), text: f(b.y), x: xp(b.x), anchor: b.x === x1 ? 'end' : 'middle' });
    }
  });
  // de-collide labels that share an x
  const groupsByX = new Map<string, typeof endLabels>();
  endLabels.forEach((e) => groupsByX.set(`${e.x}|${e.anchor}`, [...(groupsByX.get(`${e.x}|${e.anchor}`) ?? []), e]));
  for (const g of groupsByX.values()) {
    g.sort((a, b) => a.y - b.y);
    g.forEach((e, i) => {
      e.y = e.y - 10;
      if (i > 0 && e.y - g[i - 1].y < 15) e.y = g[i - 1].y + 15;
    });
  }
  endLabels.forEach((e) => o.push(text('c-value c-value--sm', `${e.x}%`, e.y, e.text, `text-anchor="${e.anchor}" dx="${e.anchor === 'start' ? 2 : e.anchor === 'end' ? -2 : 0}"`)));
  // The key, drawn under the axis with the very marks the lines use (stroke, dash and point
  // shape), so each line can be told apart in greyscale and with red-green colour blindness.
  let keyY = TOP + H + 28 + 10;
  if (series.length > 1) {
    series.forEach((s) => {
      const lines = wrapLabel(s.label, (MIN_W - 46 - 36) / 14, 3);
      const cy = keyY + 9;
      o.push(`<line class="c-line c-stroke-${s.tone}" x1="0" x2="28" y1="${cy}" y2="${cy}"${s.target ? ' stroke-dasharray="6 4"' : ''}/>`);
      o.push(timeMark(shapeOf(s), s.tone, 14, cy));
      lines.forEach((ln, k) => o.push(text('c-label', 36, keyY + 14 + k * LINE, ln)));
      keyY += lines.length * LINE + 8;
    });
  }
  const head = [p.xLabel, ...series.map((s) => s.label)];
  // a year a line has no point for says why, in words, never a lone dash
  const zh = p.locale !== 'en';
  const lastSeen = (s: (typeof series)[number]) => Math.max(...s.points.filter((q) => q.y !== null && q.y !== undefined).map((q) => q.x));
  const blank = (s: (typeof series)[number], x: number) =>
    s.target ? (zh ? '這年沒有目標' : 'no target for this year') : x > lastSeen(s) ? (zh ? '還沒到這一年' : 'year not reached yet') : zh ? '這年沒有統計' : 'not counted that year';
  const rows = xs.map((x) => [String(x), ...series.map((s) => {
    const v = s.points.find((q) => q.x === x)?.y;
    return v === undefined || v === null ? blank(s, x) : f(v);
  })]);
  return {
    kind: 'evc-time',
    body: o.join(''),
    height: series.length > 1 ? keyY : TOP + H + 28,
    padLeft: 40,
    padRight: 6,
    // the key is in the drawing (above), with the real marks; a separate legend would repeat it with other glyphs
    legend: undefined,
    table: { head: head.map((h, i) => (i ? `${h} (${unit})` : h)), rows },
  };
}

// ---------------------------------------------------------------------------------------
// Odour thresholds on a log axis (orders of magnitude, never single values; R4)
// ---------------------------------------------------------------------------------------

export interface OdourRow {
  label: string;
  /** each source has its own mark shape as well as its colour (circle or square), matching its legend key */
  marks: { low: number; high?: number; source: string; tone: Tone; shape?: 'circle' | 'square' }[];
  none?: string;
}
export interface OdourProps {
  locale: Locale;
  rows: OdourRow[];
  unit: string;
  ppbLabel: string;
  ppmLabel: string;
  legend: LegendItem[];
  categoryLabel: string;
  valueLabel: string;
}

export function renderOdour(p: OdourProps): ChartRender {
  const { locale, rows } = p;
  const LO = -3;
  const HI = 2;
  const xp = (v: number) => r2(((Math.log10(v) - LO) / (HI - LO)) * 100);
  const f = (v: number) => nf(locale, v, v < 0.01 ? 4 : v < 1 ? 2 : 1);
  const o: string[] = [];
  const body: string[] = [];
  // a band label may carry '|' line breaks: the ppm band is only 40% of the width, and on a
  // 320 px phone at the largest text size one line of English does not fit in it
  const ppb = p.ppbLabel.split('|');
  const ppm = p.ppmLabel.split('|');
  const bandLines = Math.max(ppb.length, ppm.length);
  const trackH = 20 + (bandLines - 1) * 16;
  o.push(`<rect class="c-track" x="0" y="0" width="${xp(1)}%" height="${trackH}" rx="3"/>`);
  ppb.forEach((ln, k) => o.push(text('c-tick', 0, 14 + k * 16, ln, 'dx="6"')));
  o.push(`<rect class="c-track" x="${xp(1)}%" y="0" width="${r2(100 - xp(1))}%" height="${trackH}" rx="3"/>`);
  ppm.forEach((ln, k) => o.push(text('c-tick', `${xp(1)}%`, 14 + k * 16, ln, 'dx="6"')));
  let y = trackH + 10;
  rows.forEach((r) => {
    const lines = wrapLabel(r.label, MIN_W / 14);
    const cy = y + lines.length * LINE + 12;
    const tip = r.none ?? r.marks.map((m) => `${m.source}: ${f(m.low)}${m.high ? '–' + f(m.high) : ''} ${p.unit}`).join('; ');
    let g = `<g class="c-row" data-tip="${esc(`${r.label}: ${tip}`)}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${lines.length * LINE + 26}"/>`;
    lines.forEach((ln, k) => (g += text('c-label', 0, y + 14 + k * LINE, ln)));
    if (r.none) {
      g += text('c-value c-value--sm', '100%', y + 14, r.none, 'text-anchor="end"');
      g += `<line class="c-emptykey" x1="0" x2="100%" y1="${cy}" y2="${cy}"/>`;
    }
    r.marks.forEach((m, k) => {
      const dy = r.marks.length > 1 ? (k === 0 ? -4 : 4) : 0;
      const shape = m.shape ?? 'circle';
      if (m.high !== undefined && m.high > m.low) {
        g += `<rect class="c-fill-${m.tone} c-mark" x="${xp(m.low)}%" y="${cy + dy - 3}" width="${r2(xp(m.high) - xp(m.low))}%" height="6" rx="3"/>`;
        g += timeMark(shape, m.tone, `${xp(m.low)}%`, cy + dy);
        if (shape !== 'circle') g += timeMark(shape, m.tone, `${xp(m.high)}%`, cy + dy);
      } else {
        g += timeMark(shape, m.tone, `${xp(m.low)}%`, cy + dy);
      }
    });
    body.push(g + '</g>');
    y = cy + 18;
  });
  const axisY = y;
  [0.001, 0.01, 0.1, 1, 10, 100].forEach((t, i, arr) => {
    const x = xp(t);
    o.push(`<line class="c-grid" x1="${x}%" x2="${x}%" y1="${trackH + 4}" y2="${axisY}"/>`);
    o.push(text('c-tick', `${x}%`, axisY + 17, nf(locale, t, 3), `text-anchor="${i === 0 ? 'start' : i === arr.length - 1 ? 'end' : 'middle'}"`));
  });
  o.push(...body);
  o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
  o.push(text('c-tick', '100%', axisY + 34, p.unit, 'text-anchor="end"'));
  const tableRows: string[][] = [];
  rows.forEach((r) => {
    if (r.none) tableRows.push([r.label, r.none]);
    r.marks.forEach((m) => tableRows.push([`${r.label} · ${m.source}`, `${f(m.low)}${m.high !== undefined && m.high > m.low ? ' – ' + f(m.high) : ''} ${p.unit}`]));
  });
  return {
    kind: 'evc-odour',
    body: o.join(''),
    height: axisY + 40,
    legend: p.legend,
    table: { head: [p.categoryLabel, p.valueLabel], rows: tableRows },
  };
}

/** CSV of a chart's data table, as a data: URL a plain link can download without JavaScript. */
export function csvHref(table: { head: string[]; rows: string[][] }): string {
  const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const csv = '﻿' + [table.head, ...table.rows].map((r) => r.map(q).join(',')).join('\r\n');
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}
