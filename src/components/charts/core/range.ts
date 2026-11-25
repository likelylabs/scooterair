import type { Locale } from '@/i18n';
import { MIN_W, type ChartRender, type Tone, esc, fmt, niceMax, pctN, px, text, wrapLabel } from './shared';

export interface RangeDatum {
  label: string;
  min: number;
  max: number;
  /** the central value: median (or mean; say which in `labels.mid`) */
  mid: number;
  tone?: Tone;
}

export interface RangePlotProps {
  locale: Locale;
  data: RangeDatum[];
  unit?: string;
  /** axis end */
  max?: number;
  tone?: Tone;
  reference?: { value: number; label: string };
  decimals?: number;
  /** words for the three numbers, e.g. { min: '最小值', mid: '中位數', max: '最大值' } */
  labels: { min: string; mid: string; max: string };
  categoryLabel: string;
}

const LINE = 19;

export function renderRange(p: RangePlotProps): ChartRender {
  const { locale, data, unit, tone = 'exhaust', reference, decimals = 0, labels } = p;
  const max = p.max ?? niceMax(Math.max(...data.map((d) => d.max), reference?.value ?? 0));
  const f = (v: number) => fmt(locale, v, decimals);
  const valueW = Math.max(...data.map((d) => px(f(d.mid), 15)));
  const o: string[] = [];
  const head = 26;
  // column header for the value on the right: the mid label (+ unit)
  o.push(text('c-tick', '100%', 13, unit ? `${labels.mid} · ${unit}` : labels.mid, 'text-anchor="end"'));
  let y = head;
  const rows: string[] = [];

  data.forEach((d) => {
    const lines = wrapLabel(d.label, (MIN_W - valueW - 14) / 14);
    const labelH = lines.length * LINE;
    const cy = y + labelH + 13;
    const t = d.tone ?? tone;
    const a = pctN(d.min, max);
    const b = pctN(d.max, max);
    const m = pctN(d.mid, max);
    let g = `<g class="c-row" data-tip="${esc(`${d.label}: ${labels.mid} ${f(d.mid)}, ${labels.min} ${f(d.min)}, ${labels.max} ${f(d.max)}${unit ? ' ' + unit : ''}`)}">`;
    g += `<rect class="c-hit" x="0" y="${y}" width="100%" height="${labelH + 44}"/>`;
    lines.forEach((ln, k) => (g += text('c-label', 0, y + 14 + k * LINE, ln)));
    g += text('c-value', '100%', y + 14, f(d.mid), 'text-anchor="end"');
    // the span, its end caps, then the mid dot with a surface ring
    g += `<line class="c-span c-stroke-${t}" x1="${a}%" x2="${b}%" y1="${cy}" y2="${cy}"/>`;
    g += `<line class="c-cap c-stroke-${t}" x1="${a}%" x2="${a}%" y1="${cy - 6}" y2="${cy + 6}"/><line class="c-cap c-stroke-${t}" x1="${b}%" x2="${b}%" y1="${cy - 6}" y2="${cy + 6}"/>`;
    g += `<circle class="c-dot c-fill-${t} c-mark" cx="${m}%" cy="${cy}" r="6.5"/>`;
    // min / max under the ends; one combined label when they would collide
    const minT = f(d.min);
    const maxT = f(d.max);
    const gapPx = ((b - a) / 100) * MIN_W;
    if (gapPx < (px(minT, 12) + px(maxT, 12)) / 2 + 10) {
      const mid = (a + b) / 2;
      g += text('c-tick', `${mid}%`, cy + 22, `${minT}–${maxT}`, `text-anchor="${mid < 12 ? 'start' : mid > 88 ? 'end' : 'middle'}"`);
    } else {
      g += text('c-tick', `${a}%`, cy + 22, minT, `text-anchor="${a < 6 ? 'start' : 'middle'}"`);
      g += text('c-tick', `${b}%`, cy + 22, maxT, `text-anchor="${b > 94 ? 'end' : 'middle'}"`);
    }
    rows.push(g + '</g>');
    y += labelH + 13 + 26 + 16;
  });
  const height = y - 12;
  if (reference) {
    const rp = pctN(reference.value, max);
    const left = rp >= 45;
    o.push(`<line class="c-ref-line" x1="${rp}%" x2="${rp}%" y1="18" y2="${height}"/>`);
    // the right-hand corner already holds the column header, so the label goes left of the line when it can
    o.push(text('c-ref', `${rp}%`, 13, reference.label, `text-anchor="${left ? 'end' : 'start'}" dx="${left ? -5 : 5}"`));
  }
  o.push(...rows);

  return {
    kind: 'range',
    body: o.join(''),
    height,
    table: {
      head: [p.categoryLabel, labels.min, labels.mid, labels.max].map((h, i) => (i && unit ? `${h} (${unit})` : h)),
      rows: data.map((d) => [d.label, f(d.min), f(d.mid), f(d.max)]),
    },
  };
}
