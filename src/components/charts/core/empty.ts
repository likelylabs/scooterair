import type { Locale } from '@/i18n';
import { type ChartRender, esc, px, text } from './shared';

/**
 * The empty chart (V8): a complete chart frame — panels, axes, ticks,
 * gridlines, a phase bar — with no marks, because the data does not exist.
 * No line, no dots, no placeholder shape, no invented scale: the y axis shows
 * only where zero would be.
 */
export interface EmptyChartProps {
  locale: Locale;
  /** Stacked panels, one per quantity nobody has measured. */
  panels: { label: string; unit?: string }[];
  /** The series each panel would have held (legend rows and data-table rows). */
  series: { label: string; icon?: 'stroller' | 'adult' }[];
  /** Heading of the legend, e.g. "The two heights nobody has measured". */
  seriesLabel?: string;
  /** The shared x axis. `from` > `to` counts down. */
  x: {
    from: number;
    to: number;
    step: number;
    label: string;
    /** A bar under the axis: `first` colour up to `changeAt`, `second` after it (red light, then green). */
    phase?: { changeAt: number; first: string; second: string };
  };
  /** Small text in the corner of each panel and in every table cell ("無資料" / "no data"). */
  noData: string;
  /** Data-table header for the series column. */
  seriesHeader: string;
  /** Panel height in px (default 84). */
  panelHeight?: number;
}

const ICONS = {
  adult: '<circle cx="8" cy="3" r="1.9"/><path d="M8 5.6v5M8 10.6l-2.3 4M8 10.6l2.3 4M4.9 7.8h6.2"/>',
  stroller: '<path d="M2.6 5.2h7a3.9 3.9 0 0 1-3.9 3.9h-.9a2.2 2.2 0 0 1-2.2-2.2z"/><path d="M9.6 5.2 12 2.4h1.6M5.3 9.1l-.6 1.7M8 8.6l.9 2.2"/><circle cx="4.5" cy="12.4" r="1.5"/><circle cx="9.3" cy="12.4" r="1.5"/>',
};

export function renderEmpty(p: EmptyChartProps): ChartRender {
  const PH = p.panelHeight ?? 84;
  const PAD = 26; // gutter for the "0" tick
  const o: string[] = [];
  let y = 0;

  // legend: what would have been drawn, each with an empty key
  if (p.seriesLabel) {
    o.push(text('c-tick c-tick--strong', 0, y + 12, p.seriesLabel, `dx="${-PAD}"`));
    y += 22;
  }
  p.series.forEach((s) => {
    const ix = -PAD;
    if (s.icon) o.push(`<svg class="c-icon" x="${ix}" y="${y}" width="18" height="18" viewBox="0 0 16 16" overflow="visible">${ICONS[s.icon]}</svg>`);
    o.push(`<line class="c-emptykey" x1="${ix + (s.icon ? 24 : 0)}" x2="${ix + (s.icon ? 24 : 0) + 22}" y1="${y + 9}" y2="${y + 9}"/>`);
    o.push(text('c-note', ix + (s.icon ? 24 : 0) + 28, y + 13, s.label));
    y += 22;
  });
  y += 8;

  const span = p.x.from - p.x.to || 1;
  const xp = (v: number) => +(((p.x.from - v) / span) * 100).toFixed(2);
  const ticks: number[] = [];
  for (let v = p.x.from; p.x.from > p.x.to ? v >= Math.max(p.x.to, p.x.phase?.changeAt ?? p.x.to) : v <= p.x.to; v += p.x.from > p.x.to ? -p.x.step : p.x.step) ticks.push(v);

  p.panels.forEach((panel) => {
    const title = panel.unit ? `${panel.label}（${panel.unit}）` : panel.label;
    o.push(text('c-value c-value--sm', 0, y + 13, p.locale === 'en' && panel.unit ? `${panel.label} (${panel.unit})` : title));
    o.push(text('c-note c-empty-note', '100%', y + 13, p.noData, 'text-anchor="end"'));
    y += 22;
    // gridlines: the top three are grid, the bottom one is the axis; faint verticals at each x tick
    for (let g = 0; g < 4; g++) {
      const gy = y + (PH * g) / 3;
      o.push(`<line class="${g === 3 ? 'c-axis' : 'c-grid'}" x1="0" x2="100%" y1="${gy}" y2="${gy}"/>`);
      o.push(`<line class="c-axis" x1="-5" x2="0" y1="${gy}" y2="${gy}"/>`);
    }
    ticks.forEach((t) => o.push(`<line class="c-grid" x1="${xp(t)}%" x2="${xp(t)}%" y1="${y}" y2="${y + PH}"/>`));
    o.push(`<line class="c-axis" x1="0" x2="0" y1="${y}" y2="${y + PH}"/>`);
    o.push(text('c-tick', 0, y + PH + 4, '0', 'text-anchor="end" dx="-9"'));
    y += PH + 18;
  });

  // shared x axis
  y -= 18;
  ticks.forEach((t, i) => {
    o.push(`<line class="c-axis" x1="${xp(t)}%" x2="${xp(t)}%" y1="${y}" y2="${y + 5}"/>`);
    o.push(text('c-tick', `${xp(t)}%`, y + 19, String(t), `text-anchor="${i === 0 ? 'start' : xp(t) > 97 ? 'end' : 'middle'}"`));
  });
  y += 28;
  if (p.x.phase) {
    const c = xp(p.x.phase.changeAt);
    o.push(`<rect class="c-fill-signal" x="0" y="${y}" width="${c}%" height="8"/>`);
    o.push(`<rect class="c-fill-clean" x="${c}%" y="${y}" width="${+(100 - c).toFixed(2)}%" height="8"/>`);
    o.push(`<line class="c-seg" x1="${c}%" x2="${c}%" y1="${y - 1}" y2="${y + 9}"/>`);
    o.push(text('c-tick c-tick--strong', 0, y + 23, p.x.phase.first));
    o.push(text('c-tick c-tick--strong', '100%', y + 23, p.x.phase.second, 'text-anchor="end"'));
    y += 30;
  }
  o.push(text('c-tick', '50%', y + 12, p.x.label, 'text-anchor="middle"'));
  y += 18;

  const head = (panel: { label: string; unit?: string }) => (panel.unit ? `${panel.label} (${panel.unit})` : panel.label);
  return {
    kind: 'empty',
    body: o.join(''),
    height: y,
    padLeft: PAD,
    padRight: Math.max(2, Math.ceil(px(p.x.phase?.second ?? '', 14) / 2) - 8),
    table: {
      head: [p.seriesHeader, ...p.panels.map(head)],
      rows: p.series.map((s) => [s.label, ...p.panels.map(() => p.noData)]),
    },
  };
}

/** Kept for callers that only need the marker class on the wrapper. */
export const EMPTY_KIND = 'empty';
export { esc };
