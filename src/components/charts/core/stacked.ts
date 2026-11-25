import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmt, px, text, LABEL_LINES, wrapLabel } from './shared';

export interface StackedBarProps {
  locale: Locale;
  /** the parts, in fixed order (≤ 6; fold the tail into an "other" in tone 'neutral') */
  series: { label: string; tone: Tone }[];
  /** one bar per row; `values` in series order. Each row is normalised to 100%. */
  rows: { label: string; values: number[] }[];
  /** decimals for the percentages (default 0) */
  decimals?: number;
  categoryLabel: string;
}

const LINE = 19;
const BAR = 22;
/** px between the bar and the first line of values, and between two lines of values */
const VALUE_LINE = 16;
/** colour chip before a value that does not sit under its own segment */
const CHIP = 8;

interface Lab {
  i: number;
  text: string;
  /** left edge and width of the segment, px at the narrowest width */
  seg: number;
  segW: number;
  w: number;
  x: number;
}

/**
 * Put one line of values under a bar: each starts under its own segment when it fits there,
 * otherwise as near as it can without touching its neighbours. Returns the values that found
 * no room, for the next line. Positions are px at the narrowest width; wider charts only gain room.
 */
function layoutLine(labs: Lab[], keyed: boolean): Lab[] {
  const GAP = 10;
  const width = (l: Lab) => l.w + (keyed ? CHIP + 4 : 0);
  let rest: Lab[] = [];
  let line = [...labs];
  for (;;) {
    // left to right, each at its segment or just after the one before
    let end = -GAP;
    line.forEach((l) => {
      l.x = Math.max(l.seg, end + GAP);
      end = l.x + width(l);
    });
    // then pull back from the right edge
    let next = MIN_W + GAP;
    for (let k = line.length - 1; k >= 0; k--) {
      const l = line[k];
      l.x = Math.min(l.x, next - GAP - width(l));
      next = l.x;
    }
    if (!line.length || line[0].x >= 0) break;
    // too many for one line: the value of the smallest segment waits for the next line
    const smallest = line.reduce((a, b) => (b.segW < a.segW ? b : a));
    line = line.filter((l) => l !== smallest);
    rest = [...rest, smallest].sort((a, b) => a.i - b.i);
  }
  labs.splice(0, labs.length, ...line);
  return rest;
}

export function renderStacked(p: StackedBarProps): ChartRender {
  const { locale, series, rows, decimals = 0 } = p;
  const o: string[] = [];
  let y = 2;
  const table: string[][] = [];
  const split = (row: { values: number[] }) => {
    const total = row.values.reduce((a, b) => a + b, 0) || 1;
    const shares = row.values.map((v) => (v / total) * 100);
    return { shares, labels: shares.map((s) => `${fmt(locale, s, decimals)}%`) };
  };
  // Every part is printed. Where each value fits under its own segment, that is where it
  // goes. Where one does not (a 1.3% sliver), every value in the chart gets a chip in its
  // segment's colour and the values are spaced out in order, on a second line if they need one.
  const keyed = rows.some((row) => {
    const { shares, labels } = split(row);
    return shares.some((s, i) => s > 0 && (s / 100) * MIN_W < px(labels[i], 12) + 8);
  });

  rows.forEach((row) => {
    const { shares, labels } = split(row);
    table.push([row.label, ...labels]);
    if (row.label) {
      const lines = wrapLabel(row.label, MIN_W / 14, LABEL_LINES);
      lines.forEach((ln, k) => o.push(text('c-label', 0, y + 14 + k * LINE, ln)));
      y += lines.length * LINE + 4;
    }
    // segments
    let x = 0;
    const labs: Lab[] = [];
    shares.forEach((s, i) => {
      if (s <= 0) return;
      const tip = esc(`${row.label ? row.label + ' · ' : ''}${series[i].label}: ${labels[i]}`);
      o.push(`<g class="c-row" data-tip="${tip}"><rect class="c-seg c-fill-${series[i].tone} c-mark" x="${x.toFixed(2)}%" y="${y}" width="${s.toFixed(2)}%" height="${BAR}" rx="2"/></g>`);
      labs.push({ i, text: labels[i], seg: (x / 100) * MIN_W, segW: (s / 100) * MIN_W, w: px(labels[i], 12), x: 0 });
      x += s;
    });
    const lines: Lab[][] = [];
    let pending = labs;
    while (pending.length && lines.length < 3) {
      const line = [...pending];
      pending = keyed ? layoutLine(line, true) : [];
      lines.push(line);
    }
    lines.forEach((line, k) => {
      const ty = y + BAR + VALUE_LINE + k * VALUE_LINE;
      line.forEach((l) => {
        if (!keyed) return void o.push(text('c-tick c-tick--strong', `${((l.seg / MIN_W) * 100).toFixed(2)}%`, ty, l.text, 'dx="1"'));
        const xp = ((l.x / MIN_W) * 100).toFixed(2);
        o.push(`<svg x="${xp}%" y="${ty - 9}" width="1" height="1" overflow="visible"><rect class="c-fill-${series[l.i].tone}" x="0" y="0" width="${CHIP}" height="${CHIP}" rx="1.5"/></svg>`);
        o.push(text('c-tick c-tick--strong', `${xp}%`, ty, l.text, `dx="${CHIP + 4}"`));
      });
    });
    y += BAR + 22 + Math.max(0, lines.length - 1) * VALUE_LINE + 16;
  });

  return {
    kind: 'stacked',
    body: o.join(''),
    height: y - 16,
    legend: series.map((s) => ({ label: s.label, tone: s.tone, shape: 'rect' })),
    table: { head: [p.categoryLabel, ...series.map((s) => s.label)], rows: table },
  };
}
