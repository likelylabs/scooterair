import type { Locale } from '@/i18n';
import { type ChartRender, type Tone, fmt, fmtCompact, niceMax, niceTicks, px, text } from './shared';

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
}

const TOP = 34;
const BOTTOM = 28;

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
  const at = (c: CostLine, m: number) => c.upfront + c.monthly * m;
  const yMax = niceMax(Math.max(at(a, months), at(b, months)));
  const yp = (v: number) => TOP + H - (v / yMax) * H;
  const xp = (m: number) => (m / months) * 100;
  const f = (v: number) => fmt(locale, Math.round(v));
  const o: string[] = [];

  const ticks = niceTicks(yMax, 4);
  const tickText = ticks.map((t) => fmtCompact(locale, t));
  const padLeft = Math.ceil(Math.max(...tickText.map((t) => px(t, 12)), px(prefix, 12) - 4)) + 10;
  ticks.forEach((t, i) => {
    const y = yp(t);
    o.push(`<line class="${i === 0 ? 'c-axis' : 'c-grid'}" x1="0" x2="100%" y1="${y}" y2="${y}"/>`);
    o.push(text('c-tick', 0, y + 4, tickText[i], 'text-anchor="end" dx="-8"'));
  });
  o.push(text('c-tick', 0, 9, prefix, `dx="${-padLeft}"`));
  for (let m = 0; m <= months; m += 12) {
    o.push(text('c-tick', `${xp(m)}%`, TOP + H + 18, p.tickLabel(m), `text-anchor="${m === 0 ? 'start' : m === months ? 'end' : 'middle'}"`));
    if (m > 0 && m < months) o.push(`<line class="c-axis" x1="${xp(m)}%" x2="${xp(m)}%" y1="${TOP + H}" y2="${TOP + H + 4}"/>`);
  }

  const cross = breakEvenMonth(a, b);
  const inside = cross !== null && cross < months;
  if (inside) {
    // shade the saving that opens up after the crossing
    const cx = xp(cross!) * 10;
    const cy = yp(at(a, cross!));
    o.push(
      `<svg class="c-stretch" x="0" y="0" width="100%" height="${TOP + H}" viewBox="0 0 1000 ${TOP + H}" preserveAspectRatio="none"><path class="c-area c-fill-${a.tone}" d="M${cx.toFixed(1)},${cy.toFixed(1)}L1000,${yp(at(a, months)).toFixed(1)}L1000,${yp(at(b, months)).toFixed(1)}Z"/></svg>`,
    );
  }
  [b, a].forEach((c) => {
    o.push(`<line class="c-line c-stroke-${c.tone}" x1="0" x2="100%" y1="${yp(c.upfront)}" y2="${yp(at(c, months))}"/>`);
    o.push(`<circle class="c-dot c-fill-${c.tone}" cx="0" cy="${yp(c.upfront)}" r="5"/><circle class="c-dot c-fill-${c.tone}" cx="100%" cy="${yp(at(c, months))}" r="5"/>`);
  });

  // end values on the right, kept apart
  const ends = [a, b].map((c) => ({ c, y: yp(at(c, months)) })).sort((u, v) => u.y - v.y);
  if (ends[1].y - ends[0].y < 16) ends[1].y = ends[0].y + 16;
  let padRight = 14;
  ends.forEach((e) => {
    const val = f(at(e.c, months));
    o.push(text('c-value c-value--sm', '100%', e.y + 4.5, val, 'dx="10"'));
    padRight = Math.max(padRight, 14 + px(val, 13));
  });

  if (inside) {
    const x = xp(cross!);
    const y = yp(at(a, cross!));
    const label = p.breakEvenLabel(Math.ceil(cross!));
    o.push(`<line class="c-ref-line" x1="${x}%" x2="${x}%" y1="${TOP - 8}" y2="${TOP + H}"/>`);
    o.push(`<circle class="c-dot c-fill-ink" cx="${x}%" cy="${y}" r="6"/>`);
    o.push(text('c-ref', `${x}%`, TOP - 13, label, `text-anchor="${x < 30 ? 'start' : x > 70 ? 'end' : 'middle'}"`));
  } else {
    const ahead = a.upfront <= b.upfront && a.monthly <= b.monthly;
    o.push(text('c-ref', '100%', TOP - 12, ahead ? p.aheadLabel : p.noBreakEvenLabel, 'text-anchor="end"'));
  }
  o.push(`<line class="c-cross" x1="0" x2="0" y1="${TOP}" y2="${TOP + H}" visibility="hidden"/>`);

  const xs: number[] = [];
  const rows: string[] = [];
  const table: string[][] = [];
  for (let m = 0; m <= months; m += 6) {
    xs.push(+xp(m).toFixed(2));
    rows.push(`${p.tickLabel(m)}\n${a.label}: ${prefix} ${f(at(a, m))}\n${b.label}: ${prefix} ${f(at(b, m))}`);
    if (m % 12 === 0) table.push([p.tickLabel(m), f(at(a, m)), f(at(b, m))]);
  }

  return {
    kind: 'breakeven',
    body: o.join(''),
    height: TOP + H + BOTTOM,
    padLeft,
    padRight: Math.ceil(padRight),
    legend: [a, b].map((c) => ({ label: c.label, tone: c.tone, shape: 'line' })),
    hover: { xs, rows },
    table: { head: [p.xLabel, `${a.label} (${prefix})`, `${b.label} (${prefix})`], rows: table },
  };
}
