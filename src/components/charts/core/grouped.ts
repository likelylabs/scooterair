import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmt, hbar, niceMax, pctN, px, text, wrapLabel } from './shared';

export interface GroupedBarProps {
  locale: Locale;
  /** the things being compared within each group, in fixed order (2–4) */
  series: { label: string; tone: Tone }[];
  /** one group per category; `values` in series order */
  groups: { label: string; values: number[] }[];
  unit?: string;
  max?: number;
  decimals?: number;
  categoryLabel: string;
}

const LINE = 19;
const BAR = 12;
const GAP = 4;

export function renderGrouped(p: GroupedBarProps): ChartRender {
  const { locale, series, groups, unit, decimals = 0 } = p;
  const max = p.max ?? niceMax(Math.max(...groups.flatMap((g) => g.values)));
  const f = (v: number) => fmt(locale, v, decimals);
  const valueW = Math.max(...groups.flatMap((g) => g.values.map((v) => px(f(v), 13)))) + 12;
  // leave room after the longest bar for its value
  const scale = Math.max(55, 100 - (valueW / MIN_W) * 100);
  const o: string[] = [];
  let y = unit ? 22 : 2;
  if (unit) o.push(text('c-tick', '100%', 12, unit, 'text-anchor="end"'));
  const top = y;

  groups.forEach((g, gi) => {
    const lines = wrapLabel(g.label, MIN_W / 14);
    lines.forEach((ln, k) => o.push(text('c-label', 0, y + 14 + k * LINE, ln)));
    y += lines.length * LINE + 5;
    g.values.forEach((v, si) => {
      const s = series[si];
      const w = (pctN(v, max) * scale) / 100;
      const val = f(v);
      // direct-label the first group with the series names where they fit
      const room = MIN_W * (1 - w / 100) - 12;
      const name = gi === 0 && px(`${val}  ${s.label}`, 13) < room ? s.label : '';
      o.push(
        `<g class="c-row" data-tip="${esc(`${g.label} · ${s.label}: ${val}${unit ? ' ' + unit : ''}`)}">` +
          `<rect class="c-hit" x="0" y="${y - 2}" width="100%" height="${BAR + GAP}"/>` +
          hbar(s.tone, w, y, BAR, 'c-mark') +
          `<text class="c-value c-value--sm" x="${w.toFixed(2)}%" y="${y + 10.5}" dx="7">${esc(val)}${name ? `<tspan class="c-note" dx="8">${esc(name)}</tspan>` : ''}</text>` +
          '</g>',
      );
      y += BAR + GAP;
    });
    y += 16;
  });
  const height = y - 16;
  o.unshift(`<line class="c-axis" x1="0" x2="0" y1="${top}" y2="${height}"/>`);

  return {
    kind: 'grouped',
    body: o.join(''),
    height,
    legend: series.map((s) => ({ label: s.label, tone: s.tone, shape: 'rect' })),
    table: {
      head: [p.categoryLabel, ...series.map((s) => (unit ? `${s.label} (${unit})` : s.label))],
      rows: groups.map((g) => [g.label, ...g.values.map(f)]),
    },
  };
}
