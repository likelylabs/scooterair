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
 * to any width from 300px up with crisp, constant-size type, and never needs a
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
  /** rect = bars/areas, line = lines, dot = points, light = a tint of the tone */
  shape?: 'rect' | 'line' | 'dot' | 'light';
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
  legend?: LegendItem[];
  table: ChartTable;
  /** crosshair data for line-type charts: x positions in % and one text per position */
  hover?: { xs: number[]; rows: string[] };
}

/** The narrowest plot we lay out for: a 360px phone minus gutters. */
export const MIN_W = 300;

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

/** Break a label into at most `maxLines` lines that each fit `maxEm`. */
export function wrapLabel(text: string, maxEm: number, maxLines = 2): string[] {
  if (em(text) <= maxEm) return [text];
  // tokens: Latin words stay whole, CJK breaks anywhere except before closing punctuation
  const tokens = text.match(/[⺀-￿][，。、；：！？）」』》]*|[^\s⺀-￿]+\s*|\s+/g) ?? [text];
  const lines: string[] = [];
  let cur = '';
  for (const tok of tokens) {
    if (cur && em((cur + tok).trimEnd()) > maxEm && lines.length < maxLines - 1) {
      lines.push(cur.trimEnd());
      cur = tok.trimStart();
    } else cur += tok;
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  return lines;
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

/** <text> with optional attributes. Text always wears ink, never a series colour. */
export function text(cls: string, x: string | number, y: number, content: string, attrs = ''): string {
  return `<text class="${cls}" x="${x}" y="${r2(y)}"${attrs ? ' ' + attrs : ''}>${esc(content)}</text>`;
}

/**
 * A horizontal bar growing from x = 0: rounded at the data end, square at the
 * baseline (a second 3px rect squares off the rounded start).
 */
export function hbar(tone: Tone, widthPct: number, y: number, h: number, extraClass = ''): string {
  if (widthPct <= 0) return '';
  const cls = `c-fill-${tone}${extraClass ? ' ' + extraClass : ''}`;
  return `<rect class="${cls}" x="0" y="${y}" width="${r2(widthPct)}%" height="${h}" rx="3"/>${widthPct > 1.2 ? `<rect class="${cls}" x="0" y="${y}" width="3" height="${h}"/>` : ''}`;
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

/** The complete inner HTML of a chart: legend, plot, data table. */
export function chartHtml(r: ChartRender, o: ChartHtmlOptions): string {
  const legend = r.legend?.length
    ? `<ul class="chart__legend">${r.legend
        .map((l) => `<li><span class="chart__key chart__key--${l.shape ?? 'rect'} c-key-${l.tone}"></span>${esc(l.label)}</li>`)
        .join('')}</ul>`
    : '';
  const pad = `padding-inline:${r.padLeft ?? 0}px ${r.padRight ?? 0}px`;
  const size = r.viewBox
    ? `viewBox="${r.viewBox}" style="max-inline-size:${r.maxWidth ?? '100%'}"`
    : `width="100%" height="${r.height}"`;
  const hover = r.hover ? ` data-hover="${esc(JSON.stringify(r.hover))}"` : '';
  const labelled = `${o.id}-t${o.desc ? ` ${o.id}-d` : ''}`;
  const svg = `<svg class="chart__svg${r.viewBox ? ' chart__svg--picture' : ''}" ${size} role="img" aria-labelledby="${labelled}" focusable="false"><title id="${o.id}-t">${esc(o.title)}</title>${
    o.desc ? `<desc id="${o.id}-d">${esc(o.desc)}</desc>` : ''
  }${r.body}</svg>`;
  const t = r.table;
  const table = `<details class="chart__data"><summary>${TABLE_ICON}<span>${esc(o.tableLabel)}</span></summary><div class="chart__table"><table>${
    t.caption ? `<caption>${esc(t.caption)}</caption>` : ''
  }<thead><tr>${t.head.map((h, i) => `<th scope="col"${i ? ' class="num"' : ''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows
    .map((row) => `<tr>${row.map((c, i) => (i ? `<td class="num">${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('')}</tr>`)
    .join('')}</tbody></table></div></details>`;
  return `${legend}<div class="chart__plot" style="${pad}"${hover}>${svg}</div>${table}`;
}
