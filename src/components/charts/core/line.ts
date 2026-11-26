import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type LegendItem, type Tone, axisBreak, esc, fmtCompact, fmtSigned, niceMax, niceScale, niceTicks, px, text } from './shared';

export interface LineSeries {
  label: string;
  tone: Tone;
  /** one value per x position; null = no data (the line breaks) */
  values: (number | null)[];
  /** a dashed stroke: targets, projections, anything that is not an observation */
  dashed?: boolean;
  /**
   * Which points get a marker. 'end' (default): the last point. 'all': every point.
   * 'hollow': a hollow ring on every point, for targets, so a target never reads as a
   * measurement. 'none': no markers. Whatever is chosen, a point that stands alone between
   * gaps is always drawn, because a line cannot show it.
   */
  markers?: 'end' | 'all' | 'hollow' | 'none';
  /** join the line across null values instead of breaking it (a sparse series such as targets) */
  connectNulls?: boolean;
  /**
   * Which points carry their value. 'end' (default): the last one, beside the plot, when it
   * sits on the last x. 'ends': the first and the last, above the points. 'all': every point.
   * 'none'.
   */
  pointLabels?: 'end' | 'ends' | 'all' | 'none';
}

export interface LineChartProps {
  locale: Locale;
  /** x positions: years, months… Evenly spaced unless xScale is 'value'. */
  x: (string | number)[];
  series: LineSeries[];
  unit?: string;
  /** y axis end (starts at 0 unless yMin is given or a value is negative) */
  yMax?: number;
  /**
   * y axis start. Above zero, the chart draws an axis break under the plot and still shows
   * where zero is; the area fill is then off unless `area` is set.
   */
  yMin?: number;
  /** fill under the line; default true for a single series on an axis that starts at zero */
  area?: boolean;
  /** horizontal reference line */
  reference?: { value: number; label: string };
  /** plot height in px (default 220) */
  height?: number;
  decimals?: number;
  /** data-table header for the x column, e.g. '年' */
  xLabel: string;
  /**
   * 'even' (default): x steps are evenly spaced. 'value': x are numbers (real years) and
   * each sits where its value puts it, so 2013 → 2016 → 2019 → 2021 is drawn as it happened.
   */
  xScale?: 'even' | 'value';
  /** the x values to label under the axis; default: first, last and up to three in between */
  xTicks?: (string | number)[];
  /** how a value is written on labels, in the hover readout and in the table (default: `decimals`) */
  format?: (v: number) => string;
}

const TOP = 24;
const BOTTOM = 28;
/** extra px under the plot for the axis break, when the y axis does not start at zero */
const BREAK = 18;

export function renderLine(p: LineChartProps): ChartRender {
  const { locale, x, series, unit, decimals = 0, reference } = p;
  const H = p.height ?? 220;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const lo = Math.min(...all, reference?.value ?? Infinity);
  const hi = Math.max(...all, reference?.value ?? 0);
  const negative = Number.isFinite(lo) && lo < 0;

  // y range. The common case (everything ≥ 0, no yMin) is exactly a zero-based axis.
  let yMin: number;
  let yMax: number;
  let ticks: number[];
  if (p.yMin === undefined && negative) {
    const sc = niceScale(lo, p.yMax ?? hi, 4);
    yMin = sc.min;
    yMax = p.yMax ?? sc.max;
    ticks = sc.ticks.filter((t) => t <= yMax);
  } else {
    yMin = p.yMin ?? 0;
    yMax = p.yMax ?? niceMax(hi);
    if (yMax <= yMin) yMax = yMin + 1;
    ticks = niceTicks(yMax - yMin, 4).map((t) => +(t + yMin).toPrecision(6));
  }
  /** the axis starts above zero: draw the break and say where zero is */
  const broken = yMin > 0;
  const area = p.area ?? (series.length === 1 && !broken);
  const f = p.format ?? ((v: number) => fmtSigned(locale, v, decimals));
  const n = x.length;
  const xv = x.map(Number);
  const numeric = p.xScale === 'value' && n > 1 && xv.every((v) => Number.isFinite(v));
  const x0 = Math.min(...xv);
  const x1 = Math.max(...xv);
  const xp = (i: number) => (n === 1 ? 50 : numeric ? ((xv[i] - x0) / (x1 - x0 || 1)) * 100 : (i / (n - 1)) * 100);
  const yp = (v: number) => TOP + H - ((v - yMin) / (yMax - yMin)) * H;
  const plotBottom = TOP + H;
  const axisY = plotBottom + (broken ? BREAK : 0);
  const o: string[] = [];

  // grid + y ticks: labels hang in a gutter left of the plot, so a line can start at the edge
  const tickText = ticks.map((t) => (decimals ? fmtSigned(locale, t, decimals) : t < 0 ? `−${fmtCompact(locale, -t)}` : fmtCompact(locale, t)));
  const padLeft = Math.ceil(Math.max(...tickText.map((t) => px(t, 12)), unit ? px(unit, 12) - 4 : 0)) + 10;
  ticks.forEach((t, i) => {
    const y = yp(t);
    // the axis line is at zero: the bottom of a zero-based plot, or wherever zero falls when values go negative
    const isAxis = broken ? false : negative || yMin < 0 ? t === 0 : i === 0;
    o.push(`<line class="${isAxis ? 'c-axis' : 'c-grid'}" x1="0" x2="100%" y1="${y}" y2="${y}"/>`);
    o.push(text('c-tick', 0, y + 4, tickText[i], 'text-anchor="end" dx="-8"'));
  });
  if (broken) {
    // zero, then the break, then the scale: the reader sees that the axis has been cut
    o.push(`<line class="c-axis" x1="0" x2="100%" y1="${axisY}" y2="${axisY}"/>`);
    o.push(`<line class="c-axis" x1="0" x2="0" y1="${plotBottom}" y2="${axisY}"/>`);
    o.push(axisBreak(0, plotBottom + BREAK / 2 + 2.5, true));
    o.push(text('c-tick', 0, axisY + 4, '0', 'text-anchor="end" dx="-8"'));
  }
  if (unit) o.push(text('c-tick', 0, 9, unit, `dx="${-padLeft}"`));

  // x labels
  const labelY = axisY + 18;
  const anchorAt = (pos: number) => (pos < 4 ? 'start' : pos > 96 ? 'end' : 'middle');
  if (p.xTicks) {
    const want = new Set(p.xTicks.map(String));
    x.forEach((xval, i) => want.has(String(xval)) && o.push(text('c-tick', `${+xp(i).toFixed(2)}%`, labelY, String(xval), `text-anchor="${anchorAt(xp(i))}"`)));
  } else if (numeric) {
    // first and last, then whatever fits between them at the narrowest width
    const kept: { pos: number; w: number }[] = [];
    const room = (pos: number, w: number) => kept.every((k) => Math.abs(k.pos - pos) * (MIN_W / 100) > (k.w + w) / 2 + 10);
    const place = (i: number) => {
      const label = String(x[i]);
      const w = px(label, 12);
      const pos = xp(i);
      if (!room(pos, w)) return;
      kept.push({ pos, w });
      o.push(text('c-tick', `${+pos.toFixed(2)}%`, labelY, label, `text-anchor="${anchorAt(pos)}"`));
    };
    const order = xv.map((_, i) => i).sort((a, b) => xv[a] - xv[b]);
    place(order[0]);
    place(order[n - 1]);
    order.slice(1, -1).forEach(place);
  } else {
    // first, last, and up to three in between
    const step = Math.max(1, Math.ceil((n - 1) / 4));
    for (let i = 0; i < n - 1; i += step) {
      if (n - 1 - i < step * 0.6) break;
      o.push(text('c-tick', `${xp(i)}%`, labelY, String(x[i]), `text-anchor="${i === 0 ? 'start' : 'middle'}"`));
    }
    o.push(text('c-tick', '100%', labelY, String(x[n - 1]), 'text-anchor="end"'));
  }

  if (reference) {
    const y = yp(reference.value);
    o.push(`<line class="c-ref-line" x1="0" x2="100%" y1="${y}" y2="${y}"/>`);
    o.push(text('c-ref', '100%', y - 6, reference.label, 'text-anchor="end"'));
  }

  // lines and areas live in a stretched inner SVG so paths can use plain numbers
  const areaBase = yMin < 0 && yMax > 0 ? yp(0) : plotBottom;
  let paths = '';
  /** points a line cannot show: nothing joins them to a neighbour */
  const lone: { si: number; i: number }[] = [];
  series.forEach((s, si) => {
    // runs of joined points
    const runs: number[][] = [];
    let run: number[] = [];
    s.values.forEach((v, i) => {
      if (v === null) {
        if (!s.connectNulls && run.length) (runs.push(run), (run = []));
        return;
      }
      run.push(i);
    });
    if (run.length) runs.push(run);
    let d = '';
    runs.forEach((r) => {
      if (r.length === 1) return void lone.push({ si, i: r[0] });
      const seg = r.map((i, k) => `${k ? 'L' : 'M'}${(xp(i) * 10).toFixed(1)},${yp(s.values[i] as number).toFixed(1)}`).join('');
      d += seg;
      if (area) paths += `<path class="c-area c-fill-${s.tone}" d="${seg}L${(xp(r[r.length - 1]) * 10).toFixed(1)},${areaBase.toFixed(1)}L${(xp(r[0]) * 10).toFixed(1)},${areaBase.toFixed(1)}Z"/>`;
    });
    if (d) paths += `<path class="c-line c-stroke-${s.tone}${s.dashed ? ' c-line--dashed' : ''}" d="${d}" vector-effect="non-scaling-stroke"/>`;
  });
  o.push(`<svg class="c-stretch" x="0" y="0" width="100%" height="${plotBottom}" viewBox="0 0 1000 ${plotBottom}" preserveAspectRatio="none">${paths}</svg>`);

  // markers
  const lastOf = (s: LineSeries) => {
    let last = -1;
    s.values.forEach((v, i) => v !== null && (last = i));
    return last;
  };
  const firstOf = (s: LineSeries) => s.values.findIndex((v) => v !== null);
  series.forEach((s, si) => {
    const mode = s.markers ?? 'end';
    const last = lastOf(s);
    s.values.forEach((v, i) => {
      if (v === null) return;
      const cx = `${+xp(i).toFixed(2)}%`;
      const cy = +yp(v).toFixed(1);
      if (mode === 'hollow') o.push(`<circle class="c-ring c-stroke-${s.tone}" cx="${cx}" cy="${cy}" r="5.5"/>`);
      else if (mode === 'all') o.push(`<circle class="c-dot c-fill-${s.tone}" cx="${cx}" cy="${cy}" r="${i === last ? 5 : 3.5}"/>`);
      else if (mode === 'end' && i === last) o.push(`<circle class="c-dot c-fill-${s.tone}" cx="${cx}" cy="${cy}" r="5"/>`);
      else if (lone.some((l) => l.si === si && l.i === i)) o.push(`<circle class="c-dot c-fill-${s.tone}" cx="${cx}" cy="${cy}" r="4"/>`);
    });
  });

  // direct labels. 'end' labels sit beside the plot; the others sit on their points.
  const ends = series
    .map((s, si) => {
      const last = lastOf(s);
      return last < 0 || (s.pointLabels ?? 'end') !== 'end' ? null : { si, i: last, v: s.values[last] as number, y: yp(s.values[last] as number) };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => a.y - b.y);
  // keep end labels at least 16px apart
  const ly = ends.map((e) => e.y);
  for (let k = 1; k < ly.length; k++) if (ly[k] - ly[k - 1] < 16) ly[k] = ly[k - 1] + 16;
  let padRight = 14;
  ends.forEach((e, k) => {
    const s = series[e.si];
    if (e.i === n - 1 || (numeric && xp(e.i) > 99.9)) {
      const val = f(e.v);
      const named = series.length > 1;
      o.push(`<text class="c-value c-value--sm" x="100%" y="${ly[k] + 4.5}" dx="10">${esc(val)}${named ? `<tspan class="c-note c-endname" dx="6">${esc(s.label)}</tspan>` : ''}</text>`);
      padRight = Math.max(padRight, 14 + px(val, 13));
    }
  });
  // labels on points: above the point, below it when the first choice would hit the top or another label
  const plotW = MIN_W - padLeft - 14;
  const placed: { x: number; y: number; w: number }[] = [];
  const hits = (bx: number, by: number, w: number) => placed.some((q) => Math.abs(q.y - by) < 15 && Math.abs(q.x - bx) < (q.w + w) / 2 + 4);
  series.forEach((s) => {
    const mode = s.pointLabels ?? 'end';
    if (mode === 'end' || mode === 'none') return;
    const first = firstOf(s);
    const last = lastOf(s);
    s.values.forEach((v, i) => {
      if (v === null || (mode === 'ends' && i !== first && i !== last)) return;
      const pos = xp(i);
      const label = f(v);
      const w = px(label, 13);
      const anchor = pos < 8 ? 'start' : pos > 92 ? 'end' : 'middle';
      const cxPx = (pos / 100) * plotW + (anchor === 'start' ? w / 2 : anchor === 'end' ? -w / 2 : 0);
      const above = yp(v) - 11;
      const below = yp(v) + 21;
      // the side away from the line: above a local high, below a local low
      let prev: number | null = null;
      let next: number | null = null;
      for (let k = i - 1; k >= 0 && prev === null; k--) prev = s.values[k];
      for (let k = i + 1; k < n && next === null; k++) next = s.values[k];
      const around = [prev, next].filter((q): q is number => q !== null);
      const high = !around.length || v >= around.reduce((a, c) => a + c, 0) / around.length;
      const okAbove = above >= 12 && !hits(cxPx, above, w);
      const okBelow = below <= plotBottom - 2 && !hits(cxPx, below, w);
      if (!okAbove && !okBelow) return; // no room either side: the table and the hover readout carry it
      const y = high ? (okAbove ? above : below) : okBelow ? below : above;
      placed.push({ x: cxPx, y, w });
      o.push(text('c-value c-value--sm', `${+pos.toFixed(2)}%`, y, label, `text-anchor="${anchor}"${anchor === 'end' ? ' dx="5"' : anchor === 'start' ? ' dx="-5"' : ''}`));
    });
  });
  o.push(`<line class="c-cross" x1="0" x2="0" y1="${TOP}" y2="${plotBottom}" visibility="hidden"/>`);

  const shapeOf = (s: LineSeries): LegendItem['shape'] => (s.markers === 'hollow' ? 'ring' : s.dashed ? 'dash' : 'line');
  const u = unit ? ' ' + unit : '';
  const cell = (s: LineSeries, i: number) => (s.values[i] === null ? '–' : f(s.values[i] as number));
  return {
    kind: 'line',
    body: o.join(''),
    height: axisY + BOTTOM,
    padLeft,
    padRight: Math.ceil(padRight),
    legend: series.length > 1 ? series.map((s) => ({ label: s.label, tone: s.tone, shape: shapeOf(s) })) : undefined,
    hover: {
      xs: x.map((_, i) => +xp(i).toFixed(2)),
      rows: x.map(
        (xval, i) =>
          `${xval}\n` +
          series
            // a sparse series (targets) is only read out where it has a value
            .filter((s) => !(s.connectNulls && s.values[i] === null))
            .map((s) => `${series.length > 1 ? s.label + ': ' : ''}${cell(s, i)}${s.values[i] === null || p.format ? '' : u}`)
            .join('\n'),
      ),
    },
    table: {
      head: [p.xLabel, ...series.map((s) => (unit ? `${s.label} (${unit})` : s.label))],
      rows: x.map((xval, i) => [String(xval), ...series.map((s) => cell(s, i))]),
    },
  };
}
