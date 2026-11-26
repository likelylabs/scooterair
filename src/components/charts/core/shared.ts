/**
 * Chart core — shared types and helpers.
 *
 * Every chart is a pure function `render*(props) → ChartRender` (no DOM, no
 * Astro), so the same code draws the chart at build time and can redraw it in
 * the browser when a calculator changes (see client.ts). `chartHtml()` turns a
 * ChartRender into the final markup: legend, SVG, hover data, data table.
 *
 * Layout principle: the SVG has NO viewBox. Heights are in px, horizontal
 * positions are percentages, text is real px text. The chart therefore reflows
 * to any width from a 320px phone up with crisp, constant-size type, and never needs a
 * mobile variant. Space for labels beside the plot is reserved with padding on
 * the wrapper and the SVG is `overflow: visible`.
 */

import type { Locale } from '@/i18n';

/** Colour roles for marks. Slot order is fixed; never assign by rank. */
export type Tone = 'exhaust' | 'clean' | 'blue' | 'lime' | 'magenta' | 'violet' | 'neutral' | 'ink' | 'signal';

export interface ChartTable {
  caption?: string;
  head: string[];
  rows: string[][];
}

export interface LegendItem {
  label: string;
  tone: Tone;
  /**
   * rect = bars/areas, line = lines, dot = points, light = a pale tint with an outline (things
   * not counted), dash = a dashed line, ring = hollow points (targets), hollow = an outlined
   * empty square (cells drawn hollow), slash / dotted = a filled square with a surface-coloured
   * stroke or dot in it (the second and third parts of a waffle, told apart without colour)
   */
  shape?: 'rect' | 'line' | 'dot' | 'light' | 'dash' | 'ring' | 'hollow' | 'slash' | 'dotted';
  /** with shape 'line' or 'dash': the marker drawn on the line's points, so series differ by shape as well as colour */
  marker?: Marker;
}

/**
 * Point markers. Charts with more than one series give each series its own, in this order,
 * so no series is told apart by colour alone (in greyscale print, for colour-blind readers,
 * in forced-colours mode), and the legend key repeats the marker.
 */
export type Marker = 'circle' | 'square' | 'triangle' | 'diamond';
export const MARKERS: Marker[] = ['circle', 'square', 'triangle', 'diamond'];

/**
 * A marker centred on (x, y); x may be a percentage. `r` is the radius of the equivalent
 * circle: the other shapes are sized to look the same weight.
 */
export function marker(shape: Marker, cls: string, x: string | number, y: number, r: number): string {
  if (shape === 'circle') return `<circle class="${cls}" cx="${x}" cy="${r2(y)}" r="${r}"/>`;
  const s = r2(r * 0.9);
  const t = r2(r * 1.25);
  const d =
    shape === 'square'
      ? `M${-s},${-s}H${s}V${s}H${-s}Z`
      : shape === 'triangle'
        ? `M0,${-t}L${r2(t * 1.05)},${r2(t * 0.8)}H${r2(-t * 1.05)}Z`
        : `M0,${-t}L${t},0L0,${t}L${-t},0Z`;
  return `<svg x="${x}" y="${r2(y)}" width="1" height="1" overflow="visible"><path class="${cls}" d="${d}"/></svg>`;
}

export interface ChartRender {
  kind: string;
  /** SVG children (no <svg> wrapper) */
  body: string;
  height: number;
  /** set only by charts that scale as a picture (waffle, pictogram) */
  viewBox?: string;
  /** css max-width for viewBox charts */
  maxWidth?: string;
  /** px reserved beside the plot for labels that hang outside it */
  padLeft?: number;
  padRight?: number;
  /** px reserved on the right on wide charts, where series names follow the end values (.c-endname) */
  padRightWide?: number;
  legend?: LegendItem[];
  table: ChartTable;
  /** crosshair data for line-type charts: x positions in % and one text per position */
  hover?: { xs: number[]; rows: string[] };
}

/**
 * The narrowest plot we lay out for: a 320px phone minus its two 16px gutters (288px), less
 * 8px of slack because text widths here are estimates. A chart inside a padded panel can be
 * narrower still; below 272px charts.css sets the type a step smaller, which keeps this
 * layout valid down to about 250px.
 */
export const MIN_W = 280;

export const esc = (s: string | number) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const r2 = (v: number) => +v.toFixed(2);
/** value → percentage string along an axis */
export const pct = (v: number, max: number, min = 0) => `${r2(((v - min) / (max - min || 1)) * 100)}%`;
export const pctN = (v: number, max: number, min = 0) => r2(((v - min) / (max - min || 1)) * 100);

export function fmt(locale: Locale, v: number, decimals = 0): string {
  return new Intl.NumberFormat(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

/** 50,000 → "5萬" / "50K": for axis ticks only, never for values. */
export function fmtCompact(locale: Locale, v: number): string {
  if (Math.abs(v) < 10000) return fmt(locale, v);
  return new Intl.NumberFormat(locale === 'zh-TW' ? 'zh-TW' : 'en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
}

/**
 * A data-table header with its unit: 「PM2.5（µg/m³）」, "PM2.5 (µg/m³)". Nothing is added when
 * the label already names the unit, so a header never reads 「一氧化碳（%） (%)」.
 */
export function withUnit(locale: Locale, label: string, unit?: string): string {
  if (!unit) return label;
  const u = unit.trim();
  if (!u || label.includes(`(${u})`) || label.includes(`（${u}）`) || label.endsWith(u)) return label;
  return locale === 'zh-TW' ? `${label}（${u}）` : `${label} (${u})`;
}

/** A typographic minus, not a hyphen. */
export const MINUS = '−';
export const signed = (locale: Locale, v: number, decimals = 0) => (v < 0 ? MINUS : v > 0 ? '+' : '') + fmt(locale, Math.abs(v), decimals);

/** Rough text width in em. CJK is full width; Latin averages about half. */
export function em(text: string): number {
  let w = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x2e80) w += 1;
    else if (ch === ' ') w += 0.27;
    else if (/[A-Z]/.test(ch)) w += 0.68;
    else if (/[0-9]/.test(ch)) w += 0.6;
    else if (/[.,:;'!|ilj]/.test(ch)) w += 0.3;
    else if (/[mwMW%]/.test(ch)) w += 0.85;
    else w += 0.56;
  }
  return w;
}
export const px = (text: string, size = 14) => em(text) * size;

const OPENERS = '（「『《〈【〔([“‘';
const CLOSERS = '，。、；：！？）」』》〉】〕％)]”’,.;:!?%';
const allIn = (s: string, set: string) => [...s].every((ch) => set.includes(ch));
const UNIT = /^(µg\/m³|mg\/m³|g\/km|g\/min|ppm|ppb|cc|cm|mm|km|kg|mg|kWh|kW|°C|m|g|s|t|L|%)$/;

/**
 * A label as unbreakable pieces. Latin words stay whole; CJK breaks between any two
 * characters, except that closing punctuation never starts a line and opening punctuation
 * never ends one, whatever script sits beside it: in 「一氧化碳（ppm）」 the brackets stay
 * with the unit.
 */
export function labelTokens(text: string): string[] {
  const atoms = text.match(/[⺀-￿]|[^\s⺀-￿]+|\s+/g) ?? [text];
  const out: string[] = [];
  let glue = false; // the previous atom was an opener: the next atom joins it
  for (const a of atoms) {
    const last = out.length - 1;
    if (/^\s+$/.test(a)) {
      if (last >= 0) out[last] += a;
      glue = false;
    } else if (last >= 0 && /\d\s*$/.test(out[last]) && UNIT.test(a.replace(/[)\]）,.;:]+$/, ''))) {
      // a figure keeps its unit: 24.4 µg/m³, 125 cc, 1.6 m
      out[last] += a;
      glue = false;
    } else if (last >= 0 && (glue || (allIn(a, CLOSERS) && !/\s$/.test(out[last])) || (/\d$/.test(out[last]) && /^[⺀-鿿]$/.test(a)))) {
      // …and a figure keeps the counter that follows it (7月, 31日, 5年)
      out[last] += a;
      glue = allIn(a, OPENERS);
    } else {
      out.push(a);
      glue = allIn(a, OPENERS);
    }
  }
  return out;
}

/** How many lines the shared charts let a label take before the rest stays on the last line. */
export const LABEL_LINES = 6;

/**
 * Break a label into lines that fit `maxEm`, at most `maxLines` of them (default 2, as it has
 * always been: with the default, whatever is left over stays on the last line, even if it runs
 * long). The shared charts pass LABEL_LINES, so a long label grows downward instead of running
 * off the edge or into the value beside it. Keep labels short enough for two lines.
 */

export function wrapLabel(text: string, maxEm: number, maxLines = 2): string[] {
  if (em(text) <= maxEm) return [text];
  const tokens = labelTokens(text);
  const fill = (width: number) => {
    const lines: string[] = [];
    let cur = '';
    for (const tok of tokens) {
      if (cur && em((cur + tok).trimEnd()) > width && lines.length < maxLines - 1) {
        lines.push(cur.trimEnd());
        cur = tok.trimStart();
      } else cur += tok;
    }
    if (cur.trim()) lines.push(cur.trimEnd());
    return lines;
  };
  const greedy = fill(maxEm);
  // Among the ways to set it in as few lines, prefer breaks that fall at punctuation (after a
  // comma or a closing bracket, before an opening one), then lines of even length, so a label
  // does not end in two stray characters or split a word a bracket would have kept whole.
  const score = (lines: string[]) => {
    const widths = lines.map(em);
    let good = 0;
    for (let i = 0; i < lines.length - 1; i++) if (allIn(lines[i].slice(-1), CLOSERS) || allIn([...lines[i + 1]][0] ?? '', OPENERS)) good++;
    return good * 6 - (Math.max(...widths) - Math.min(...widths));
  };
  let best = greedy;
  let bestScore = score(greedy);
  const lo = em(text) / greedy.length;
  for (let k = 0; k <= 12; k++) {
    const tried = fill(lo + ((maxEm - lo) * k) / 12);
    if (tried.length !== greedy.length || tried.some((l) => em(l) > maxEm)) continue;
    const s = score(tried);
    if (s > bestScore) {
      best = tried;
      bestScore = s;
    }
  }
  return best;
}

/** Round a maximum up to a clean axis end. */
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  const n = f <= 1 ? 1 : f <= 1.2 ? 1.2 : f <= 1.5 ? 1.5 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 3 ? 3 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 6 ? 6 : f <= 8 ? 8 : 10;
  return +(n * p).toPrecision(6);
}

/** About `count` evenly spaced clean ticks from 0 to max (inclusive). */
export function niceTicks(max: number, count = 4): number[] {
  const raw = max / count;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(+v.toPrecision(6));
  return out;
}

const niceStep = (raw: number): number => {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
};

/**
 * A clean axis for values that may be negative, or that need not start at zero: about
 * `count` ticks from a round number at or below `lo` to a round number at or above `hi`.
 */
export function niceScale(lo: number, hi: number, count = 4): { min: number; max: number; ticks: number[] } {
  if (!(hi > lo)) hi = lo + 1;
  const step = niceStep((hi - lo) / count);
  const min = +(Math.floor(lo / step + 1e-9) * step).toPrecision(6);
  const max = +(Math.ceil(hi / step - 1e-9) * step).toPrecision(6);
  const ticks: number[] = [];
  for (let v = min; v <= max + step * 0.001; v += step) ticks.push(+v.toPrecision(6));
  return { min, max, ticks };
}

/** A number with a typographic minus, for values that can be negative. */
export const fmtSigned = (locale: Locale, v: number, decimals = 0) => (v < 0 ? MINUS : '') + fmt(locale, Math.abs(v), decimals);

/**
 * The axis-break mark: two slanted strokes across an axis, where the scale stops short of
 * zero. `x` may be a percentage. `vertical` is for a break on a vertical axis. Every chart
 * whose axis does not start at zero draws one and prints the value the axis starts at.
 */
export function axisBreak(x: string | number, y: number, vertical = false): string {
  const d = vertical ? 'M-5,2.5L5,-2.5M-5,-2.5L5,-7.5' : 'M-2.5,5L2.5,-5M2.5,5L7.5,-5';
  return `<svg class="c-break" x="${x}" y="${r2(y)}" width="1" height="1" overflow="visible"><path class="c-break__gap" d="${d}"/><path class="c-break__mark" d="${d}"/></svg>`;
}

/** <text> with optional attributes. Text always wears ink, never a series colour. */
export function text(cls: string, x: string | number, y: number, content: string, attrs = ''): string {
  return `<text class="${cls}" x="${x}" y="${r2(y)}"${attrs ? ' ' + attrs : ''}>${esc(content)}</text>`;
}

/**
 * A horizontal bar growing from x = 0: rounded at the data end, square at the
 * baseline (a second 3px rect squares off the rounded start), with a short
 * baseline tick so a zero-length bar still shows where zero is.
 */
export function hbar(tone: Tone, widthPct: number, y: number, h: number, extraClass = ''): string {
  const base = `<line class="c-axis" x1="0" x2="0" y1="${y - 3}" y2="${y + h + 3}"/>`;
  if (widthPct <= 0) return base;
  const cls = `c-fill-${tone}${extraClass ? ' ' + extraClass : ''}`;
  return `<rect class="${cls}" x="0" y="${y}" width="${r2(widthPct)}%" height="${h}" rx="3"/>${widthPct > 1.2 ? `<rect class="${cls}" x="0" y="${y}" width="3" height="${h}"/>` : ''}${base}`;
}

/**
 * A horizontal bar between zero and a value when zero is not at the left edge (charts with
 * negative values). Positions are percentages. Rounded at the data end, square at zero,
 * with the same short zero tick as hbar(), so a zero-length bar still shows where zero is.
 */
export function hbarFrom(tone: Tone, zeroPct: number, valuePct: number, y: number, h: number, extraClass = ''): string {
  const a = Math.min(zeroPct, valuePct);
  const w = Math.abs(valuePct - zeroPct);
  const base = `<line class="c-axis" x1="${r2(zeroPct)}%" x2="${r2(zeroPct)}%" y1="${y - 3}" y2="${y + h + 3}"/>`;
  if (w <= 0) return base;
  const cls = `c-fill-${tone}${extraClass ? ' ' + extraClass : ''}`;
  // a 3px rect squares off the rounded corners on the zero side
  const sq = w > 1.2 ? `<svg x="${r2(zeroPct)}%" y="${y}" width="1" height="${h}" overflow="visible"><rect class="${cls}" x="${valuePct < zeroPct ? -3 : 0}" y="0" width="3" height="${h}"/></svg>` : '';
  return `<rect class="${cls}" x="${r2(a)}%" y="${y}" width="${r2(w)}%" height="${h}" rx="3"/>${sq}${base}`;
}

const TABLE_ICON =
  '<svg class="chart__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="1"/><path d="M3.5 10h17M3.5 14.5h17M9.5 5v14"/></svg>';

export interface ChartHtmlOptions {
  /** accessible name of the graphic (the Figure's title usually says the finding; this says what the picture is) */
  title: string;
  /** longer description for screen readers: the takeaway in a sentence */
  desc?: string;
  /** label of the "view data table" toggle */
  tableLabel: string;
  /** unique id prefix */
  id: string;
}

/**
 * A table cell that holds a figure (a number, perhaps with a sign, currency, unit or a short
 * flag such as *), as opposed to words. Figures are right-aligned and never wrap; words (notes,
 * names, flags spelled out) wrap like any text.
 */
export function isFigure(cell: string): boolean {
  const c = cell.trim();
  if (c === '' || /^[–—-]$/.test(c)) return true; // "no value" sits in the figure column
  if (!/\d/.test(c)) return false;
  // what is left once the figure itself is taken out: at most a short unit or flag
  const rest = [...c.replace(/(NT|US)?\$|[\d.,\s%‰+−\-–—~～×*≈<>≤≥()（）約]/g, '')];
  const cjk = rest.filter((ch) => ch.codePointAt(0)! >= 0x2e80).length;
  return cjk <= 2 && rest.length - cjk <= 6;
}

/** The complete inner HTML of a chart: legend, plot, data table. */
export function chartHtml(r: ChartRender, o: ChartHtmlOptions): string {
  const legend = r.legend?.length
    ? `<ul class="chart__legend">${r.legend
        .map((l) => `<li><span class="chart__key chart__key--${l.shape ?? 'rect'} c-key-${l.tone}"${l.marker ? ` data-marker="${l.marker}"` : ''}></span>${esc(l.label)}</li>`)
        .join('')}</ul>`
    : '';
  const pad = `padding-inline:${r.padLeft ?? 0}px ${r.padRight ?? 0}px${r.padRightWide ? `;--pad-wide:${Math.ceil(r.padRightWide)}px` : ''}`;
  const size = r.viewBox
    ? `viewBox="${r.viewBox}" style="max-inline-size:${r.maxWidth ?? '100%'}"`
    : `width="100%" height="${r.height}"`;
  const hover = r.hover ? ` data-hover="${esc(JSON.stringify(r.hover))}"` : '';
  const labelled = `${o.id}-t${o.desc ? ` ${o.id}-d` : ''}`;
  const svg = `<svg class="chart__svg${r.viewBox ? ' chart__svg--picture' : ''}" ${size} role="img" aria-labelledby="${labelled}" focusable="false"><title id="${o.id}-t">${esc(o.title)}</title>${
    o.desc ? `<desc id="${o.id}-d">${esc(o.desc)}</desc>` : ''
  }${r.body}</svg>`;
  const t = r.table;
  // a column of figures is right-aligned and never wraps; a column of words (notes) wraps
  const figureCol = t.head.map((_, i) => i > 0 && t.rows.filter((row) => isFigure(row[i] ?? '')).length * 2 >= t.rows.length);
  // Every toggle, table and scroll box is named after its chart: a screen-reader user moving by
  // table or by control hears which chart it belongs to, not 43 identical "view data table"s.
  // The box scrolls sideways on a phone, so it takes keyboard focus (Safari does not give it);
  // it is a named group, not a region, so a page of 40 charts does not get 40 landmarks.
  const name = o.title ? `${o.tableLabel}${/[⺀-￿]/.test(o.tableLabel) ? '：' : ': '}${o.title}` : o.tableLabel;
  const table = `<details class="chart__data"><summary>${TABLE_ICON}<span>${esc(o.tableLabel)}</span>${
    o.title ? `<span class="vh">${esc(name.slice(o.tableLabel.length))}</span>` : ''
  }</summary><div class="chart__table" tabindex="0" role="group" aria-label="${esc(name)}"><table>${
    t.caption || o.title ? `<caption class="${t.caption ? 'chart__caption' : 'vh'}">${esc(t.caption ?? o.title)}</caption>` : ''
  }<thead><tr>${t.head
    .map((h, i) => `<th scope="col"${figureCol[i] ? ' class="num"' : ''}>${esc(h)}</th>`)
    .join('')}</tr></thead><tbody>${t.rows
    .map((row) => `<tr>${row.map((c, i) => (i ? `<td${figureCol[i] && isFigure(c) ? ' class="num"' : ''}>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('')}</tr>`)
    .join('')}</tbody></table></div></details>`;
  return `${legend}<div class="chart__plot" style="${pad}"${hover}>${svg}</div>${table}`;
}
