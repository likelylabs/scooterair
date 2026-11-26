import type { Locale } from '@/i18n';
import { type ChartRender, type Marker, type Tone, esc, fmt, fmtCompact, marker, niceMax, niceTicks, px, text, withUnit, wrapLabel, tip } from './shared';

export interface CostLine {
  label: string;
  tone: Tone;
  /** cost at month 0 (what you pay to buy it) */
  upfront: number;
  /** running cost per month */
  monthly: number;
}

export interface BreakEvenProps {
  locale: Locale;
  /** horizon in months (default 60) */
  months?: number;
  /** the two options; put the one with the higher upfront cost first */
  a: CostLine;
  b: CostLine;
  /** currency prefix (default 'NT$') */
  prefix?: string;
  /** x-axis tick text for a month count, e.g. (m) => `${m / 12} 年` */
  tickLabel: (month: number) => string;
  /** label at the crossing, e.g. (m) => `第 ${m} 個月打平` */
  breakEvenLabel: (month: number) => string;
  /** shown instead when `a` costs more and never catches up inside the horizon */
  noBreakEvenLabel: string;
  /** shown instead when `a` is already cheaper to buy and to run: there is nothing to pay back */
  aheadLabel: string;
  /** plot height in px (default 230) */
  height?: number;
  /** data-table header for the month column */
  xLabel: string;
  /**
   * Optional: the real cumulative totals, month 0..months (e.g. toBreakEven(e).series from the
   * calculator engine, mapped to a and b). When given, the lines follow these values instead of
   * straight lines from `upfront` and `monthly` (which are still used for the legend), so setup-fee
   * renewals and temporary credits show where they happen and the chart cannot disagree with
   * the engine.
   */
  series?: { a: number[]; b: number[] };
  /**
   * Optional, with `series`: the month the engine says the lines cross for good (toBreakEven's
   * crossMonth), or null when it says they do not. The chart marks this month and never works
   * out a crossing of its own.
   */
  crossMonth?: number | null;
  /**
   * Optional: one text for the reference label whichever branch is drawn (toBreakEven's
   * chartLabels.breakEvenLabel, which is the engine's own answer).
   */
  answer?: string;
}

/** space above the plot for the answer label, with one line of it */
const TOP1 = 34;
/** each further line of the answer label */
const REF_LINE = 15;
const BOTTOM = 28;
/** the narrowest plot this chart is laid out for: a 320px phone, less its gutters and value labels */
const NARROW = 196;

/** The month at which cumulative costs are equal, or null if never within reach. */
export function breakEvenMonth(a: CostLine, b: CostLine): number | null {
  const d = b.monthly - a.monthly;
  if (d === 0) return null;
  const m = (a.upfront - b.upfront) / d;
  return m > 0 && Number.isFinite(m) ? m : null;
}

/** Cumulative cost over time for two options: two straight lines and where they cross. */
export function renderBreakEven(p: BreakEvenProps): ChartRender {
  const { locale, a, b, prefix = 'NT$' } = p;
  const months = p.months ?? 60;
  const H = p.height ?? 230;
  const real = p.series && p.series.a.length > months && p.series.b.length > months ? p.series : null;
  const at = (c: CostLine, m: number) => (real ? (c === a ? real.a : real.b)[Math.round(m)] : c.upfront + c.monthly * m);
  const peak = real ? Math.max(...real.a.slice(0, months + 1), ...real.b.slice(0, months + 1)) : Math.max(at(a, months), at(b, months));
  const yMax = niceMax(peak);
  const xp = (m: number) => (m / months) * 100;
  const f = (v: number) => fmt(locale, Math.round(v));
  const o: string[] = [];

  const ticks = niceTicks(yMax, 4);
  const tickText = ticks.map((t) => fmtCompact(locale, t));
  const padLeft = Math.ceil(Math.max(...tickText.map((t) => px(t, 14)), px(prefix, 14) - 4)) + 10;

  // The answer label above the plot: at the crossing when there is one, else top right. It is
  // set for the narrowest plot, wrapped into lines that fit the room on the side it hangs to, so
  // it never runs off the left edge of a phone; with too little room on that side for a few
  // words it starts at the left edge of the plot instead. The plot moves down for each line.
  const cross = real ? (p.crossMonth ?? null) : breakEvenMonth(a, b);
  const inside = cross !== null && (real ? cross <= months : cross < months);
  const ahead = real ? at(a, 0) <= at(b, 0) && at(a, months) <= at(b, months) : a.upfront <= b.upfront && a.monthly <= b.monthly;
  const refLabel = inside ? (p.answer ?? p.breakEvenLabel(Math.ceil(cross!))) : (p.answer ?? (ahead ? p.aheadLabel : p.noBreakEvenLabel));
  const refX = inside ? xp(cross!) : 100;
  let refAnchor: 'start' | 'middle' | 'end' = inside ? (refX < 30 ? 'start' : refX > 70 ? 'end' : 'middle') : 'end';
  const REF_EM = 12 * 1.08; // c-ref is 12px bold
  const roomFor = (anchor: typeof refAnchor) =>
    anchor === 'end' ? (refX / 100) * NARROW : anchor === 'start' ? ((100 - refX) / 100) * NARROW + 10 : (Math.min(refX, 100 - refX) / 100) * NARROW * 2;
  let room = roomFor(refAnchor);
  let refAt = `${refX}%`;
  if (px(refLabel, REF_EM) > room && room < 10 * REF_EM) {
    refAnchor = 'start';
    refAt = '0';
    room = NARROW + 10;
  }
  const refLines = wrapLabel(refLabel, room / REF_EM, 4);
  const TOP = TOP1 + (refLines.length - 1) * REF_LINE;
  const yp = (v: number) => TOP + H - (v / yMax) * H;
  ticks.forEach((t, i) => {
    const y = yp(t);
    o.push(`<line class="${i === 0 ? 'c-axis' : 'c-grid'}" x1="0" x2="100%" y1="${y}" y2="${y}"/>`);
    o.push(text('c-tick', 0, y + 4, tickText[i], 'text-anchor="end" dx="-8"'));
  });
  o.push(text('c-tick', 0, 9, prefix, `dx="${-padLeft}"`));
  const firstW = px(p.tickLabel(0), 14);
  // the plot inside a padded panel on a 320px phone: about 254px less the tick labels on the
  // left and the end values on the right (both set at the 14px floor)
  const tight = Math.max(120, 254 - padLeft - 14 - px(f(peak), 14));
  for (let m = 0; m <= months; m += 12) {
    // on narrow charts only every other year is labelled, and nothing crowds the first or the last label
    const clearOfFirst = m === 0 || (xp(m) / 100) * tight - px(p.tickLabel(m), 14) / 2 > firstW + 8;
    const always = m === 0 || m === months || (m % 24 === 0 && months - m >= 24 && clearOfFirst);
    o.push(text(always ? 'c-tick' : 'c-tick c-wideonly', `${xp(m)}%`, TOP + H + 18, p.tickLabel(m), `text-anchor="${m === 0 ? 'start' : m === months ? 'end' : 'middle'}"`));
    if (m > 0 && m < months) o.push(`<line class="c-axis" x1="${xp(m)}%" x2="${xp(m)}%" y1="${TOP + H}" y2="${TOP + H + 4}"/>`);
  }

  // The two lines are told apart by shape as well as colour (the two tones are equally light,
  // so they are the same grey in print): a round marker on `a`, a square one on `b`, repeated
  // in the legend; on wide charts the name is also printed beside each end value.
  const shapeOf = (c: CostLine): Marker => (c === a ? 'circle' : 'square');
  const ends2 = (c: CostLine, start: number) =>
    marker(shapeOf(c), `c-dot c-fill-${c.tone}`, 0, yp(start), 5) + marker(shapeOf(c), `c-dot c-fill-${c.tone}`, '100%', yp(at(c, months)), 5);
  if (inside && !real) {
    // shade the saving that opens up after the crossing
    const cx = xp(cross!) * 10;
    const cy = yp(at(a, cross!));
    o.push(
      `<svg class="c-stretch" x="0" y="0" width="100%" height="${TOP + H}" viewBox="0 0 1000 ${TOP + H}" preserveAspectRatio="none"><path class="c-area c-fill-${a.tone}" d="M${cx.toFixed(1)},${cy.toFixed(1)}L1000,${yp(at(a, months)).toFixed(1)}L1000,${yp(at(b, months)).toFixed(1)}Z"/></svg>`,
    );
  }
  if (real) {
    // the engine's month-by-month totals, in a stretched inner SVG so paths can use plain numbers
    const path = (vals: number[]) => vals.slice(0, months + 1).map((v, m) => `${m ? 'L' : 'M'}${(xp(m) * 10).toFixed(1)},${yp(v).toFixed(1)}`).join('');
    const paths = [b, a].map((c) => `<path class="c-line c-stroke-${c.tone}" d="${path(c === a ? real.a : real.b)}" vector-effect="non-scaling-stroke"/>`).join('');
    o.push(`<svg class="c-stretch" x="0" y="0" width="100%" height="${TOP + H}" viewBox="0 0 1000 ${TOP + H}" preserveAspectRatio="none">${paths}</svg>`);
    [b, a].forEach((c) => o.push(ends2(c, at(c, 0))));
  } else {
    [b, a].forEach((c) => {
      o.push(`<line class="c-line c-stroke-${c.tone}" x1="0" x2="100%" y1="${yp(c.upfront)}" y2="${yp(at(c, months))}"/>`);
      o.push(ends2(c, c.upfront));
    });
  }

  // end values on the right, kept apart
  const ends = [a, b].map((c) => ({ c, y: yp(at(c, months)) })).sort((u, v) => u.y - v.y);
  if (ends[1].y - ends[0].y < 16) ends[1].y = ends[0].y + 16;
  let padRight = 14;
  let padRightWide = 0;
  ends.forEach((e) => {
    const val = f(at(e.c, months));
    o.push(`<text class="c-value c-value--sm" x="100%" y="${e.y + 4.5}" dx="10">${esc(val)}<tspan class="c-note c-endname" dx="6">${esc(e.c.label)}</tspan></text>`);
    padRight = Math.max(padRight, 14 + px(val, 14));
    padRightWide = Math.max(padRightWide, 22 + px(val, 14) + px(e.c.label, 14));
  });

  if (inside) {
    const x = xp(cross!);
    const y = yp(at(a, cross!));
    o.push(`<line class="c-ref-line" x1="${x}%" x2="${x}%" y1="${TOP - 8}" y2="${TOP + H}"/>`);
    o.push(`<circle class="c-dot c-fill-ink" cx="${x}%" cy="${y}" r="6"/>`);
  }
  o.push(
    `<text class="c-ref" x="${refAt}" y="${TOP - 13 - (refLines.length - 1) * REF_LINE}" text-anchor="${refAnchor}">${refLines
      .map((ln, k) => (k ? `<tspan x="${refAt}" dy="${REF_LINE}">${esc(ln)}</tspan>` : esc(ln)))
      .join('')}</text>`,
  );
  o.push(`<line class="c-cross" x1="0" x2="0" y1="${TOP}" y2="${TOP + H}" visibility="hidden"/>`);

  const xs: number[] = [];
  const rows: string[] = [];
  const table: string[][] = [];
  for (let m = 0; m <= months; m += 6) {
    xs.push(+xp(m).toFixed(2));
    rows.push(`${p.tickLabel(m)}\n${tip(locale, a.label, `${prefix} ${f(at(a, m))}`)}\n${tip(locale, b.label, `${prefix} ${f(at(b, m))}`)}`);
    if (m % 12 === 0) table.push([p.tickLabel(m), f(at(a, m)), f(at(b, m))]);
  }

  return {
    kind: 'breakeven',
    body: o.join(''),
    height: TOP + H + BOTTOM,
    padLeft,
    padRight: Math.ceil(padRight),
    padRightWide,
    legend: [a, b].map((c) => ({ label: c.label, tone: c.tone, shape: 'line', marker: shapeOf(c) })),
    hover: { xs, rows },
    table: { head: [p.xLabel, withUnit(locale, a.label, prefix), withUnit(locale, b.label, prefix)], rows: table },
  };
}
