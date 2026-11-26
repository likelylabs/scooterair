import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmtSigned, hbar, hbarFrom, niceMax, niceScale, pctN, px, text, LABEL_LINES, wrapLabel } from './shared';

export interface GroupedBarProps {
  locale: Locale;
  /** the things being compared within each group, in fixed order (2–4) */
  series: { label: string; tone: Tone }[];
  /** one group per category; `values` in series order. Values may be negative. */
  groups: { label: string; values: number[] }[];
  unit?: string;
  max?: number;
  /** axis start when values go below zero (default: a clean number below the lowest). Never above zero: bars are measured from zero. */
  min?: number;
  decimals?: number;
  categoryLabel: string;
}

const LINE = 19;
const BAR = 12;
const GAP = 4;

export function renderGrouped(p: GroupedBarProps): ChartRender {
  const { locale, series, groups, unit, decimals = 0 } = p;
  const all = groups.flatMap((g) => g.values);
  const lowest = Math.min(0, ...all);
  const signedAxis = lowest < 0;
  let min = 0;
  let max: number;
  if (signedAxis) {
    const sc = niceScale(Math.min(lowest, p.min ?? 0), p.max ?? Math.max(0, ...all), 4);
    min = Math.min(p.min ?? sc.min, 0);
    max = p.max ?? Math.max(sc.max, 0);
  } else max = p.max ?? niceMax(Math.max(...all));
  const f = (v: number) => fmtSigned(locale, v, decimals);
  const valueW = Math.max(...all.map((v) => px(f(v), 13))) + 12;
  // leave room after the longest bar for its value, and before the lowest negative bar for its
  const scale = Math.max(55, 100 - (valueW / MIN_W) * 100);
  const inset = signedAxis ? Math.min(22, (valueW / MIN_W) * 100) : 0;
  const pos = (v: number) => inset + (pctN(v, max, min) * (scale - inset)) / 100;
  const zero = pos(0);
  const o: string[] = [];
  const body: string[] = [];
  let y = unit ? 22 : 2;
  if (unit) o.push(text('c-tick', '100%', 12, unit, 'text-anchor="end"'));

  groups.forEach((g, gi) => {
    const lines = wrapLabel(g.label, MIN_W / 14, LABEL_LINES);
    lines.forEach((ln, k) => body.push(text('c-label', 0, y + 14 + k * LINE, ln)));
    y += lines.length * LINE + 5;
    g.values.forEach((v, si) => {
      const s = series[si];
      const end = pos(v);
      const val = f(v);
      // direct-label the first group with the series names where they fit
      const room = MIN_W * (1 - end / 100) - 12;
      const name = gi === 0 && v >= 0 && px(`${val}  ${s.label}`, 13) < room ? s.label : '';
      const label =
        v < 0
          ? `<text class="c-value c-value--sm" x="${end.toFixed(2)}%" y="${y + 10.5}" dx="-7" text-anchor="end">${esc(val)}</text>`
          : `<text class="c-value c-value--sm" x="${end.toFixed(2)}%" y="${y + 10.5}" dx="7">${esc(val)}${name ? `<tspan class="c-note" dx="8">${esc(name)}</tspan>` : ''}</text>`;
      body.push(
        `<g class="c-row" data-tip="${esc(`${g.label} · ${s.label}: ${val}${unit ? ' ' + unit : ''}`)}">` +
          `<rect class="c-hit" x="0" y="${y - 2}" width="100%" height="${BAR + GAP}"/>` +
          (signedAxis ? hbarFrom(s.tone, zero, end, y, BAR, 'c-mark') : hbar(s.tone, end, y, BAR, 'c-mark')) +
          label +
          '</g>',
      );
      y += BAR + GAP;
    });
    y += 16;
  });
  let height = y - 16;
  if (signedAxis) {
    // zero is labelled once, under the last group (each bar carries its own zero tick)
    o.push(text('c-tick', `${zero.toFixed(2)}%`, height + 18, '0', 'text-anchor="middle"'));
    height += 22;
  }
  o.push(...body);

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
