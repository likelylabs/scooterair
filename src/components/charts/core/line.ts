import type { Locale } from '@/i18n';
import { type ChartRender, type Tone, esc, fmt, niceMax, niceTicks, px, text } from './shared';

export interface LineSeries {
  label: string;
  tone: Tone;
  /** one value per x position; null = no data (the line breaks) */
  values: (number | null)[];
}

export interface LineChartProps {
  locale: Locale;
  /** x positions, evenly spaced: years, months… */
  x: (string | number)[];
  series: LineSeries[];
  unit?: string;
  /** y axis end (starts at 0 unless yMin is given) */
  yMax?: number;
  yMin?: number;
  /** fill under the line; default true for a single series, false otherwise */
  area?: boolean;
  /** horizontal reference line */
  reference?: { value: number; label: string };
  /** plot height in px (default 220) */
  height?: number;
  decimals?: number;
  /** data-table header for the x column, e.g. '年' */
  xLabel: string;
}

const TOP = 18;
const BOTTOM = 28;

export function renderLine(p: LineChartProps): ChartRender {
  const { locale, x, series, unit, decimals = 0, reference } = p;
  const H = p.height ?? 220;
  const area = p.area ?? series.length === 1;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const yMin = p.yMin ?? 0;
  const yMax = p.yMax ?? niceMax(Math.max(...all, reference?.value ?? 0));
  const f = (v: number) => fmt(locale, v, decimals);
  const n = x.length;
  const xp = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const yp = (v: number) => TOP + H - ((v - yMin) / (yMax - yMin)) * H;
  const o: string[] = [];

  // grid + y ticks: the label sits on its gridline, at the left edge
  const ticks = niceTicks(yMax - yMin, 4).map((t) => t + yMin);
  ticks.forEach((t, i) => {
    const y = yp(t);
    o.push(`<line class="${i === 0 ? 'c-axis' : 'c-grid'}" x1="0" x2="100%" y1="${y}" y2="${y}"/>`);
    if (i > 0) o.push(text('c-tick', 0, y - 5, i === ticks.length - 1 && unit ? `${f(t)} ${unit}` : f(t)));
  });
  // x labels: first, last, and up to three in between
  const step = Math.max(1, Math.ceil((n - 1) / 4));
  for (let i = 0; i < n - 1; i += step) {
    if (n - 1 - i < step * 0.6) break;
    o.push(text('c-tick', `${xp(i)}%`, TOP + H + 18, String(x[i]), `text-anchor="${i === 0 ? 'start' : 'middle'}"`));
  }
  o.push(text('c-tick', '100%', TOP + H + 18, String(x[n - 1]), 'text-anchor="end"'));

  if (reference) {
    const y = yp(reference.value);
    o.push(`<line class="c-ref-line" x1="0" x2="100%" y1="${y}" y2="${y}"/>`);
    o.push(text('c-ref', '100%', y - 6, reference.label, 'text-anchor="end"'));
  }

  // lines and areas live in a stretched inner SVG so paths can use plain numbers
  let paths = '';
  series.forEach((s) => {
    let d = '';
    let pen = false;
    let first = -1;
    let last = -1;
    s.values.forEach((v, i) => {
      if (v === null) return void (pen = false);
      d += `${pen ? 'L' : 'M'}${(xp(i) * 10).toFixed(1)},${yp(v).toFixed(1)}`;
      pen = true;
      if (first < 0) first = i;
      last = i;
    });
    if (area && first >= 0) paths += `<path class="c-area c-fill-${s.tone}" d="${d}L${(xp(last) * 10).toFixed(1)},${TOP + H}L${(xp(first) * 10).toFixed(1)},${TOP + H}Z"/>`;
    paths += `<path class="c-line c-stroke-${s.tone}" d="${d}" vector-effect="non-scaling-stroke"/>`;
  });
  o.push(`<svg class="c-stretch" x="0" y="0" width="100%" height="${TOP + H}" viewBox="0 0 1000 ${TOP + H}" preserveAspectRatio="none">${paths}</svg>`);

  // end dots + direct labels (value, then the series name where there is room)
  const ends = series
    .map((s, si) => {
      let last = -1;
      s.values.forEach((v, i) => v !== null && (last = i));
      return last < 0 ? null : { si, i: last, v: s.values[last] as number, y: yp(s.values[last] as number) };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => a.y - b.y);
  // keep end labels at least 16px apart
  const ly = ends.map((e) => e.y);
  for (let k = 1; k < ly.length; k++) if (ly[k] - ly[k - 1] < 16) ly[k] = ly[k - 1] + 16;
  let padRight = 14;
  ends.forEach((e, k) => {
    const s = series[e.si];
    o.push(`<circle class="c-dot c-fill-${s.tone}" cx="${xp(e.i)}%" cy="${e.y}" r="5"/>`);
    if (e.i === n - 1) {
      const val = f(e.v);
      const named = series.length > 1;
      o.push(`<text class="c-value c-value--sm" x="100%" y="${ly[k] + 4.5}" dx="10">${esc(val)}${named ? `<tspan class="c-note c-endname" dx="6">${esc(s.label)}</tspan>` : ''}</text>`);
      padRight = Math.max(padRight, 14 + px(val, 13));
    }
  });
  o.push(`<line class="c-cross" x1="0" x2="0" y1="${TOP}" y2="${TOP + H}" visibility="hidden"/>`);

  return {
    kind: 'line',
    body: o.join(''),
    height: TOP + H + BOTTOM,
    padRight: Math.ceil(padRight),
    legend: series.length > 1 ? series.map((s) => ({ label: s.label, tone: s.tone, shape: 'line' })) : undefined,
    hover: {
      xs: x.map((_, i) => +xp(i).toFixed(2)),
      rows: x.map((xv, i) => `${xv}\n` + series.map((s) => `${series.length > 1 ? s.label + ': ' : ''}${s.values[i] === null ? '–' : f(s.values[i] as number)}${unit ? ' ' + unit : ''}`).join('\n')),
    },
    table: {
      head: [p.xLabel, ...series.map((s) => (unit ? `${s.label} (${unit})` : s.label))],
      rows: x.map((xv, i) => [String(xv), ...series.map((s) => (s.values[i] === null ? '–' : f(s.values[i] as number)))]),
    },
  };
}
