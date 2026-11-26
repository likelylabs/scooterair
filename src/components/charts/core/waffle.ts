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
  let body = '';
  tones.forEach((t, i) => {
    const col = i % cols;
    const row = rowsN - 1 - Math.floor(i / cols);
    body += `<rect class="${t ? `c-fill-${t}` : 'c-track'}" x="${col * (CELL + GAP)}" y="${row * (CELL + GAP)}" width="${CELL}" height="${CELL}" rx="1.2"/>`;
  });
  const f = (v: number) => fmt(locale, v, 0);
  return {
    kind: 'waffle',
    body,
    height: size(rowsN),
    viewBox: `0 0 ${size(cols)} ${size(rowsN)}`,
    maxWidth: `${Math.min(20, cols * 1.9)}rem`,
    legend: [
      ...parts.map((part) => ({ label: `${f(part.value)} · ${part.label}`, tone: part.tone, shape: 'rect' as const })),
      { label: `${f(total - counted)} · ${p.restLabel}`, tone: 'neutral' as Tone, shape: 'light' as const },
    ],
    table: {
      head: [p.categoryLabel, p.valueLabel],
      rows: [...parts.map((part) => [part.label, f(part.value)]), [p.restLabel, f(total - counted)]],
    },
  };
}
