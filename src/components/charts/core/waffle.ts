import type { Locale } from '@/i18n';
import { type ChartRender, type Tone, fmt } from './shared';

export interface WaffleProps {
  locale: Locale;
  /** the counted parts, in order. One part = a plain "N in 100". */
  parts: { value: number; label: string; tone: Tone }[];
  /** what the uncounted cells are, e.g. '其他' */
  restLabel: string;
  /** number of cells (default 100) and columns (default 10) */
  total?: number;
  cols?: number;
  categoryLabel: string;
  valueLabel: string;
}

const CELL = 10;
const GAP = 2;

/**
 * Unit chart: one cell per unit, filled from the bottom row upward (the low
 * layer, again), left to right.
 */
export function renderWaffle(p: WaffleProps): ChartRender {
  const { locale, parts, total = 100, cols = 10 } = p;
  const rowsN = Math.ceil(total / cols);
  const size = (k: number) => k * CELL + (k - 1) * GAP;
  const tones: (Tone | null)[] = [];
  parts.forEach((part) => {
    for (let i = 0; i < Math.round(part.value) && tones.length < total; i++) tones.push(part.tone);
  });
  const counted = tones.length;
  while (tones.length < total) tones.push(null);
  // which part each cell belongs to: the first part is a plain fill, the second carries a
  // surface-coloured stroke, the third a dot, so the parts differ by more than hue (two tones
  // of equal lightness merge in greyscale). The uncounted cells are drawn hollow.
  const partOf: number[] = [];
  parts.forEach((part, pi) => {
    for (let i = 0; i < Math.round(part.value) && partOf.length < total; i++) partOf.push(pi);
  });
  const CUTS = ['rect', 'slash', 'dotted'] as const;
  let body = '';
  tones.forEach((t, i) => {
    const col = i % cols;
    const row = rowsN - 1 - Math.floor(i / cols);
    const x = col * (CELL + GAP);
    const y = row * (CELL + GAP);
    if (!t) {
      // inset by half the outline, so the hollow cell is the same size as a filled one
      body += `<rect class="c-hollow" x="${x + 0.5}" y="${y + 0.5}" width="${CELL - 1}" height="${CELL - 1}" rx="1" vector-effect="non-scaling-stroke"/>`;
      return;
    }
    body += `<rect class="c-fill-${t}" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="1.2"/>`;
    const cut = CUTS[partOf[i]] ?? 'rect';
    if (cut === 'slash') body += `<path class="c-cut" d="M${x + 2},${y + 2}L${x + CELL - 2},${y + CELL - 2}"/>`;
    if (cut === 'dotted') body += `<circle class="c-cut--dot" cx="${x + CELL / 2}" cy="${y + CELL / 2}" r="1.8"/>`;
  });
  const f = (v: number) => fmt(locale, v, 0);
  return {
    kind: 'waffle',
    body,
    height: size(rowsN),
    viewBox: `0 0 ${size(cols)} ${size(rowsN)}`,
    maxWidth: `${Math.min(20, cols * 1.9)}rem`,
    legend: [
      ...parts.map((part, pi) => ({ label: `${f(part.value)} · ${part.label}`, tone: part.tone, shape: CUTS[pi] ?? ('rect' as const) })),
      ...(total - counted > 0 ? [{ label: `${f(total - counted)} · ${p.restLabel}`, tone: 'neutral' as Tone, shape: 'hollow' as const }] : []),
    ],
    table: {
      head: [p.categoryLabel, p.valueLabel],
      rows: [...parts.map((part) => [part.label, f(part.value)]), [p.restLabel, f(total - counted)]],
    },
  };
}
