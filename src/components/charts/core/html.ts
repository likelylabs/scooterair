/**
 * Chart core — helpers for the HTML charts (the redesign's G5, G12, G13, G15 and the estimate's
 * range bands).
 *
 * These charts are built differently from the older SVG ones in this folder:
 *
 *   - Every word and number is real HTML text sized in rem, so it wraps, never clips, and grows
 *     with the reader's 字大 setting (root 100 / 115 / 130%) and with browser zoom. Nothing is
 *     set under 14px (--fs-xs).
 *   - Only the marks are SVG: one small <svg> per row, no viewBox, x positions in percent and
 *     heights in px, so a mark never distorts and the chart reflows from 320px up.
 *   - Marks that carry meaning have `data-mark` (the acceptance check reads their paint for
 *     3:1 contrast) and are told apart by shape, never by colour alone:
 *       measured  solid ink dot or solid ink bar
 *       estimate  hatched band with a dashed edge (never a dot, never a line)
 *       official  solid ink square
 *   - The wrapper carries `data-chart` (so the checks know its numbers are a chart's own),
 *     `role="group"` with the chart's name, and starts with a visually hidden sentence that
 *     states the finding. A data table is the chart's twin.
 *   - Marks with class `hc-g` (bars, bands) grow once from the left when the chart scrolls into
 *     view, marks with class `hc-p` (dots) pop in; core/grow.ts starts it, charts.css draws it,
 *     and with reduced motion or the 動畫 switch off nothing moves.
 *
 * Everything here is a pure string function with no DOM and no registry import, so the same
 * code draws a chart at build time and redraws it in the browser.
 */
import { chipGlyphSvg } from '../../ui/kinds.ts';
import { readerKindLabels, type ReaderKind } from '../../../data/types.ts';
import { esc, tableHtml, type ChartTable } from './shared.ts';
import { chartText } from '../strings.ts';

export type Loc = 'zh-TW' | 'en';
export { esc };

/** A percentage for an SVG x or width, two decimals. */
export const pc = (v: number): string => `${+Math.max(0, v).toFixed(2)}%`;

/**
 * A reader chip as a string (the same five shapes and words as <KindChip>), for charts drawn
 * by a function. It prints `data-chip`, never `data-kind`.
 */
export function chipHtml(kind: ReaderKind, locale: Loc, where?: string): string {
  const label = readerKindLabels[kind].label[locale];
  const dot = locale === 'en' ? ' · ' : '・';
  return `<span class="c-chip c-chip--${kind}" data-chip="${kind}">${chipGlyphSvg(kind)}<span class="c-chip__t">${esc(label)}${where ? `<span class="c-chip__w">${esc(dot + where)}</span>` : ''}</span></span>`;
}

/**
 * The hatch an estimate is drawn with: ochre strokes at 45° on the ochre wash. Put it inside
 * the <svg> that uses it and fill with `url(#${id})`. Ids must be unique on the page.
 */
export function hatchDef(id: string): string {
  return `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><rect class="hc-hatch-bg" width="7" height="7"/><line class="hc-hatch-line" x1="1.5" y1="0" x2="1.5" y2="7"/></pattern></defs>`;
}

/** Thin vertical guides inside one row's plot, at the axis ticks (percent positions). */
export function guides(ticks: number[], h: number): string {
  return ticks.map((x) => `<line class="hc-grid" x1="${pc(x)}" x2="${pc(x)}" y1="0" y2="${h}"/>`).join('');
}

export interface HtmlChartParts {
  /** the finding in a sentence or two: the chart's text alternative, read first by a screen reader */
  summary: string;
  /** the chart itself */
  body: string;
  /** the data table; leave out to print none (the page shows it elsewhere, e.g. in its sheet) */
  table?: ChartTable;
  /** the chart's name, used to name the table toggle */
  title: string;
  locale: Loc;
}

/** The inner HTML of an HTML chart's wrapper: summary, chart, table toggle. */
export function htmlChart(p: HtmlChartParts): string {
  return `<p class="vh" data-chart-summary>${esc(p.summary)}</p>${p.body}${p.table ? tableHtml(p.table, { title: p.title, tableLabel: chartText.dataTable[p.locale] }) : ''}`;
}

/**
 * Redraw an HTML chart in the browser (a calculator changed). `el` is the wrapper a chart
 * component printed; pass the same render function's new output. The open state of the data
 * table is kept, and the chart does not grow again.
 *
 *   import { updateHtmlChart } from '@/components/charts/core/html';
 *   import { renderPriceBars } from '@/components/charts/core/priceBars';
 *   updateHtmlChart(document.querySelector('#price-bars')!, renderPriceBars({ … }));
 */
export function updateHtmlChart(el: Element, html: string): void {
  const root = el as HTMLElement;
  const open = root.querySelector<HTMLDetailsElement>('.chart__data')?.open ?? false;
  // a redraw is not an arrival: the marks appear at rest
  if (root.dataset.grow !== undefined) root.dataset.grow = 'done';
  root.innerHTML = html;
  const details = root.querySelector<HTMLDetailsElement>('.chart__data');
  if (details) details.open = open;
}
