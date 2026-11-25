// Four small charts the question pages need that the shared chart set does not draw
// (blueprint V17, V25, V27, V29). Each is a pure render function returning the same
// ChartRender every shared chart returns, so <QChart> can hand it to the shared ChartShell
// (title, description, hover, data table) and it behaves like every other chart on the site.
//
// Same layout rules as src/components/charts/core: no viewBox, x in percent, real px text,
// one design from 300px up. Values come from the registry via the page; nothing is typed here.

import type { Locale } from '@/i18n';
import { type ChartRender, type Tone, MIN_W, esc, fmt, px, text, wrapLabel } from '@/components/charts/core/shared';

const r2 = (v: number) => +v.toFixed(2);
const at = (v: number, min: number, max: number) => r2(((v - min) / (max - min)) * 100);
const LINE = 19;

// ---------------------------------------------------------------------------------------
// V25 — range of correlation coefficients, no central value (there is none to show)
// ---------------------------------------------------------------------------------------
export interface CorrelationProps {
  locale: Locale;
  rows: { label: string; low: number; high: number; tone?: Tone }[];
  /** axis ends, e.g. −0.2 and 1 */
  min: number;
  max: number;
  /** words under 0 and 1 */
  zeroLabel: string;
  oneLabel: string;
  categoryLabel: string;
  lowLabel: string;
  highLabel: string;
}

export function renderCorrelation(p: CorrelationProps): ChartRender {
  const { locale, rows, min, max } = p;
  const f = (v: number) => fmt(locale, v, 2);
  const o: string[] = [];
  const body: string[] = [];
  let y = 8;
  rows.forEach((r) => {
    const tone = r.tone ?? 'exhaust';
    const value = `${f(r.low)} – ${f(r.high)}`;
    const lines = wrapLabel(r.label, (MIN_W - px(value, 15) - 14) / 14);
    const cy = y + lines.length * LINE + 16;
    let g = `<g class="c-row" data-tip="${esc(`${r.label}: ${value}`)}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${lines.length * LINE + 32}"/>`;
    lines.forEach((ln, k) => (g += text('c-label', 0, y + 14 + k * LINE, ln)));
    g += text('c-value', '100%', y + 14, value, 'text-anchor="end"');
    g += `<rect class="c-track" x="0" y="${cy - 5}" width="100%" height="10" rx="5"/>`;
    const a = at(r.low, min, max);
    const b = at(r.high, min, max);
    g += `<rect class="c-fill-${tone} c-mark" x="${a}%" y="${cy - 7}" width="${r2(Math.max(b - a, 0.8))}%" height="14" rx="3"/>`;
    g += '</g>';
    body.push(g);
    y = cy + 26;
  });
  const axisY = y - 4;
  const z = at(0, min, max);
  const one = at(1, min, max);
  o.push(`<line class="c-grid" x1="${z}%" x2="${z}%" y1="4" y2="${axisY}" stroke-dasharray="3 4"/>`);
  o.push(`<line class="c-grid" x1="${one}%" x2="${one}%" y1="4" y2="${axisY}" stroke-dasharray="3 4"/>`);
  o.push(...body);
  o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
  o.push(text('c-tick', `${z}%`, axisY + 17, `0 ${p.zeroLabel}`, `text-anchor="start" dx="-4"`));
  o.push(text('c-tick', `${one}%`, axisY + 17, `1 ${p.oneLabel}`, 'text-anchor="end" dx="4"'));
  return {
    kind: 'range',
    body: o.join(''),
    height: axisY + 26,
    table: { head: [p.categoryLabel, p.lowLabel, p.highLabel], rows: rows.map((r) => [r.label, f(r.low), f(r.high)]) },
  };
}

// ---------------------------------------------------------------------------------------
// V27 — odour thresholds as bands on a log axis (orders of magnitude, never single values)
// ---------------------------------------------------------------------------------------
export interface OdourProps {
  locale: Locale;
  bands: { label: string; low: number; high: number; tone?: Tone }[];
  /** a row with no band: a compound that has no smell at all */
  none?: { label: string; text: string };
  unit: string;
  ppbLabel: string;
  ppmLabel: string;
  categoryLabel: string;
  rangeLabel: string;
  noneValue: string;
}

export function renderOdour(p: OdourProps): ChartRender {
  const { locale, bands } = p;
  const LO = -3; // 0.001 ppm = 1 ppb
  const HI = 2; // 100 ppm
  const xp = (v: number) => at(Math.log10(v), LO, HI);
  const f = (v: number) => fmt(locale, v, v < 0.01 ? 4 : v < 1 ? 2 : 0);
  const o: string[] = [];
  const body: string[] = [];
  let y = 30;
  // the two regions named in words, above the plot
  o.push(`<rect class="c-track" x="0" y="0" width="${xp(0.01)}%" height="20" rx="3"/>`);
  o.push(text('c-tick', `${xp(0.001)}%`, 14, p.ppbLabel, 'dx="6"'));
  o.push(`<rect class="c-track" x="${xp(1)}%" y="0" width="${r2(100 - xp(1))}%" height="20" rx="3"/>`);
  o.push(text('c-tick', `${xp(1)}%`, 14, p.ppmLabel, 'dx="6"'));
  bands.forEach((b) => {
    const tone = b.tone ?? 'exhaust';
    const lines = wrapLabel(b.label, MIN_W / 14);
    const cy = y + lines.length * LINE + 14;
    let g = `<g class="c-row" data-tip="${esc(`${b.label}: ${f(b.low)}–${f(b.high)} ${p.unit}`)}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${lines.length * LINE + 30}"/>`;
    lines.forEach((ln, k) => (g += text('c-label', 0, y + 14 + k * LINE, ln)));
    const a = xp(b.low);
    const w = Math.max(xp(b.high) - a, 1.2);
    g += `<rect class="c-fill-${tone} c-mark" x="${a}%" y="${cy - 8}" width="${r2(w)}%" height="16" rx="3"/>`;
    g += '</g>';
    body.push(g);
    y = cy + 24;
  });
  if (p.none) {
    const lines = wrapLabel(p.none.label, MIN_W / 14);
    lines.forEach((ln, k) => body.push(text('c-label', 0, y + 14 + k * LINE, ln)));
    y += lines.length * LINE + 6;
    body.push(text('c-tick', 0, y + 12, p.none.text));
    y += 30;
  }
  const axisY = y;
  [0.001, 0.01, 0.1, 1, 10, 100].forEach((t, i, arr) => {
    const x = xp(t);
    o.push(`<line class="c-grid" x1="${x}%" x2="${x}%" y1="24" y2="${axisY}"/>`);
    o.push(text('c-tick', `${x}%`, axisY + 17, new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: 3 }).format(t), `text-anchor="${i === 0 ? 'start' : i === arr.length - 1 ? 'end' : 'middle'}"`));
  });
  o.push(...body);
  o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
  o.push(text('c-tick', '100%', axisY + 34, p.unit, 'text-anchor="end"'));
  return {
    kind: 'range',
    body: o.join(''),
    height: axisY + 40,
    table: {
      head: [p.categoryLabel, p.rangeLabel],
      rows: [...bands.map((b) => [b.label, `${f(b.low)} – ${f(b.high)}`]), ...(p.none ? [[p.none.label, p.noneValue]] : [])],
    },
  };
}

// ---------------------------------------------------------------------------------------
// V29 — stroller height against adult height, one study per row
// ---------------------------------------------------------------------------------------
export interface StrollerProps {
  locale: Locale;
  rows: { label: string; value: number | null; low?: number; high?: number; upTo?: boolean; text?: string }[];
  /** the "most studies" band */
  band: { low: number; high: number; label: string };
  zeroLabel: string;
  upToLabel: string;
  noDiffLabel: string;
  /** final line, e.g. "Taiwan: no studies" */
  footLabel: string;
  categoryLabel: string;
  valueLabel: string;
}

export function renderStroller(p: StrollerProps): ChartRender {
  const { locale, rows, band } = p;
  const vals = rows.flatMap((r) => [r.value, r.high, r.low]).filter((v): v is number => typeof v === 'number');
  const min = Math.min(-10, Math.floor(Math.min(...vals) / 10) * 10);
  const max = Math.max(60, Math.ceil(Math.max(...vals) / 10) * 10);
  const xp = (v: number) => at(v, min, max);
  const sign = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(locale, Math.abs(v), 0) + '%';
  const valueText = (r: StrollerProps['rows'][number]) =>
    r.value === null ? (r.text ?? p.noDiffLabel) : r.low !== undefined && r.high !== undefined ? `${sign(r.low)} – ${sign(r.high)}` : `${r.upTo ? p.upToLabel + ' ' : ''}${sign(r.value)}`;
  const o: string[] = [];
  const body: string[] = [];
  let y = 28;
  rows.forEach((r) => {
    const vt = valueText(r);
    const lines = wrapLabel(r.label, (MIN_W - px(vt, 15) - 14) / 14);
    const cy = y + lines.length * LINE + 14;
    let g = `<g class="c-row" data-tip="${esc(`${r.label}: ${vt}`)}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${lines.length * LINE + 30}"/>`;
    lines.forEach((ln, k) => (g += text('c-label', 0, y + 14 + k * LINE, ln)));
    g += text('c-value', '100%', y + 14, vt, 'text-anchor="end"');
    if (r.value === null) {
      g += `<line class="c-emptykey" x1="${xp(min)}%" x2="${xp(max)}%" y1="${cy}" y2="${cy}"/>`;
    } else if (r.low !== undefined && r.high !== undefined) {
      g += `<line class="c-span c-stroke-exhaust" x1="${xp(r.low)}%" x2="${xp(r.high)}%" y1="${cy}" y2="${cy}"/>`;
      g += `<circle class="c-dot c-fill-exhaust c-mark" cx="${xp(r.value)}%" cy="${cy}" r="6"/>`;
    } else if (r.upTo) {
      g += `<circle class="c-cap c-stroke-exhaust" cx="${xp(r.value)}%" cy="${cy}" r="6" fill="none"/>`;
    } else {
      g += `<circle class="c-dot c-fill-exhaust c-mark" cx="${xp(r.value)}%" cy="${cy}" r="6"/>`;
    }
    g += '</g>';
    body.push(g);
    y = cy + 24;
  });
  const axisY = y;
  // the band where most studies fall, behind everything
  o.push(`<rect class="c-fill-neutral c-light" x="${xp(band.low)}%" y="20" width="${r2(xp(band.high) - xp(band.low))}%" height="${axisY - 20}"/>`);
  o.push(text('c-tick', `${xp(band.high)}%`, 13, band.label, 'dx="4"'));
  o.push(`<line class="c-ref-line" x1="${xp(0)}%" x2="${xp(0)}%" y1="20" y2="${axisY}"/>`);
  o.push(...body);
  o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
  for (let t = min; t <= max; t += 10) {
    if (t === 0) continue;
    o.push(text('c-tick', `${xp(t)}%`, axisY + 17, sign(t), `text-anchor="${t === min ? 'start' : t === max ? 'end' : 'middle'}"`));
  }
  o.push(text('c-tick', `${xp(0)}%`, axisY + 17, `0 ${p.zeroLabel}`, 'text-anchor="middle"'));
  o.push(text('c-label', 0, axisY + 46, p.footLabel));
  return {
    kind: 'range',
    body: o.join(''),
    height: axisY + 56,
    table: { head: [p.categoryLabel, p.valueLabel], rows: rows.map((r) => [r.label, valueText(r)]) },
  };
}

// ---------------------------------------------------------------------------------------
// V17 — electric share by year, with policy targets on a true time axis
// ---------------------------------------------------------------------------------------
export interface ShareLineProps {
  locale: Locale;
  actual: { x: number; y: number | null }[];
  targets: { x: number; y: number }[];
  actualLabel: string;
  targetLabel: string;
  yearLabel: string;
  unit: string;
}

export function renderShareLine(p: ShareLineProps): ChartRender {
  const { locale, actual, targets } = p;
  const TOP = 26;
  const H = 200;
  const years = [...actual.map((a) => a.x), ...targets.map((t) => t.x)];
  const x0 = Math.min(...years);
  const x1 = Math.max(...years);
  const xp = (x: number) => at(x, x0, x1);
  const yp = (v: number) => TOP + H - (v / 100) * H;
  const pct = (v: number) => `${fmt(locale, v, v < 10 && v % 1 ? 1 : 0)}%`;
  const o: string[] = [];
  [0, 25, 50, 75, 100].forEach((t, i) => {
    o.push(`<line class="${i === 0 ? 'c-axis' : 'c-grid'}" x1="0" x2="100%" y1="${yp(t)}" y2="${yp(t)}"/>`);
    o.push(text('c-tick', 0, yp(t) + 4, `${t}`, 'text-anchor="end" dx="-8"'));
  });
  o.push(text('c-tick', 0, 10, p.unit, 'dx="-34"'));
  // x ticks: first observed year, last observed year, then each target year
  const lastObs = Math.max(...actual.filter((a) => a.y !== null).map((a) => a.x));
  const ticks = [...new Set([x0, lastObs, ...targets.map((t) => t.x)])].sort((a, b) => a - b);
  ticks.forEach((t) => o.push(text('c-tick', `${xp(t)}%`, TOP + H + 18, String(t), `text-anchor="${t === x0 ? 'start' : t === x1 ? 'end' : 'middle'}"`)));
  // targets: a dashed line joining hollow points
  let dT = '';
  targets.forEach((t, i) => (dT += `${i ? 'L' : 'M'}${(xp(t.x) * 10).toFixed(1)},${yp(t.y).toFixed(1)}`));
  // actual: a solid line that breaks where a year has no verified figure
  let dA = '';
  let pen = false;
  actual.forEach((a) => {
    if (a.y === null) return void (pen = false);
    dA += `${pen ? 'L' : 'M'}${(xp(a.x) * 10).toFixed(1)},${yp(a.y).toFixed(1)}`;
    pen = true;
  });
  o.push(
    `<svg class="c-stretch" x="0" y="0" width="100%" height="${TOP + H}" viewBox="0 0 1000 ${TOP + H}" preserveAspectRatio="none"><path class="c-line c-stroke-neutral" d="${dT}" stroke-dasharray="6 6" vector-effect="non-scaling-stroke"/><path class="c-line c-stroke-clean" d="${dA}" vector-effect="non-scaling-stroke"/></svg>`,
  );
  targets.forEach((t) => {
    o.push(`<circle class="c-cap c-stroke-ink" cx="${xp(t.x)}%" cy="${yp(t.y)}" r="5.5" fill="var(--here, var(--bg))"/>`);
    const right = xp(t.x) > 90;
    o.push(text('c-value c-value--sm', `${xp(t.x)}%`, yp(t.y) - 11, pct(t.y), `text-anchor="${right ? 'end' : 'middle'}"`));
  });
  const shown = actual.filter((a): a is { x: number; y: number } => a.y !== null);
  shown.forEach((a, i) => {
    o.push(`<circle class="c-dot c-fill-clean" cx="${xp(a.x)}%" cy="${yp(a.y)}" r="${i === 0 || i === shown.length - 1 ? 5 : 3.5}"/>`);
  });
  const first = shown[0];
  const last = shown[shown.length - 1];
  o.push(text('c-value c-value--sm', `${xp(first.x)}%`, yp(first.y) - 11, pct(first.y), 'text-anchor="start"'));
  o.push(text('c-value c-value--sm', `${xp(last.x)}%`, yp(last.y) + 22, pct(last.y), 'text-anchor="middle"'));
  const allX = [...new Set(years)].sort((a, b) => a - b);
  const valAt = (list: { x: number; y: number | null }[], x: number) => {
    const v = list.find((a) => a.x === x)?.y;
    return v === undefined || v === null ? '–' : pct(v);
  };
  return {
    kind: 'shareline',
    body: o.join(''),
    height: TOP + H + 28,
    padLeft: 34,
    padRight: 10,
    legend: [
      { label: p.actualLabel, tone: 'clean', shape: 'line' },
      { label: p.targetLabel, tone: 'neutral', shape: 'dot' },
    ],
    table: { head: [p.yearLabel, p.actualLabel, p.targetLabel], rows: allX.map((x) => [String(x), valAt(actual, x), valAt(targets, x)]) },
  };
}
