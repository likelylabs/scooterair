import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmt, niceMax, pctN, px, text, LABEL_LINES, wrapLabel, withUnit, tip } from './shared';

export interface BeforeAfterProps {
  locale: Locale;
  data: { label: string; before: number; after: number }[];
  /** names of the two states, e.g. '一般行人時相' / '行人專用時相' */
  beforeLabel: string;
  afterLabel: string;
  beforeTone?: Tone;
  afterTone?: Tone;
  unit?: string;
  max?: number;
  decimals?: number;
  categoryLabel: string;
}

const LINE = 19;

export function renderBeforeAfter(p: BeforeAfterProps): ChartRender {
  const { locale, data, unit, decimals = 0, beforeTone = 'exhaust', afterTone = 'clean' } = p;
  const max = p.max ?? niceMax(Math.max(...data.flatMap((d) => [d.before, d.after])));
  const f = (v: number) => fmt(locale, v, decimals);
  const o: string[] = [];
  let y = unit ? 24 : 2;
  if (unit) o.push(text('c-tick', '100%', 13, unit, 'text-anchor="end"'));

  data.forEach((d) => {
    const pair = `${f(d.before)} → ${f(d.after)}`;
    const lines = wrapLabel(d.label, (MIN_W - px(pair, 15) - 14) / 14, LABEL_LINES);
    const labelH = lines.length * LINE;
    const cy = y + labelH + 13;
    const a = pctN(d.before, max);
    const b = pctN(d.after, max);
    let g = `<g class="c-row" data-tip="${esc(tip(locale, d.label, `${p.beforeLabel} ${f(d.before)} → ${p.afterLabel} ${f(d.after)}`, unit))}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${labelH + 28}"/>`;
    lines.forEach((ln, k) => (g += text('c-label', 0, y + 14 + k * LINE, ln)));
    g += text('c-value', '100%', y + 14, pair, 'text-anchor="end"');
    g += `<line class="c-grid" x1="0" x2="100%" y1="${cy}" y2="${cy}"/>`;
    g += `<line class="c-link" x1="${a}%" x2="${b}%" y1="${cy}" y2="${cy}"/>`;
    g += `<circle class="c-dot c-fill-${beforeTone} c-mark" cx="${a}%" cy="${cy}" r="6.5"/>`;
    g += `<circle class="c-dot c-fill-${afterTone} c-mark" cx="${b}%" cy="${cy}" r="6.5"/>`;
    o.push(g + '</g>');
    y += labelH + 13 + 12 + 14;
  });
  const height = y - 10;

  return {
    kind: 'before-after',
    body: o.join(''),
    height,
    legend: [
      { label: p.beforeLabel, tone: beforeTone, shape: 'dot' },
      { label: p.afterLabel, tone: afterTone, shape: 'dot' },
    ],
    table: {
      head: [p.categoryLabel, p.beforeLabel, p.afterLabel].map((h, i) => (i ? withUnit(locale, h, unit) : h)),
      rows: data.map((d) => [d.label, f(d.before), f(d.after)]),
    },
  };
}
