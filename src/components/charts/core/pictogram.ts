import type { Locale } from '@/i18n';
import { person, scooter } from '@/components/art/parts';
import { type ChartRender, type Tone, fmt } from './shared';

export interface PictogramProps {
  locale: Locale;
  /** how many of the icons are highlighted */
  count: number;
  /** how many icons in all (keep it ≤ 30; default 10) */
  total?: number;
  icon?: 'adult' | 'child' | 'scooter-gas' | 'scooter-electric';
  tone?: Tone;
  /** icons per row (default: all in one row up to 10) */
  cols?: number;
  /** legend text for the highlighted and the remaining icons */
  label: string;
  restLabel: string;
  categoryLabel: string;
  valueLabel: string;
}

const ICONS = {
  adult: { w: 54, h: 170, draw: () => `<g transform="translate(24 0)">${person('adult')}</g>` },
  child: { w: 44, h: 116, draw: () => `<g transform="translate(20 0)">${person('child')}</g>` },
  'scooter-gas': { w: 196, h: 142, draw: () => `<g transform="translate(4 0)">${scooter({ kind: 'gas', tail: false })}</g>` },
  'scooter-electric': { w: 196, h: 142, draw: () => `<g transform="translate(4 0)">${scooter({ kind: 'electric', tail: false })}</g>` },
};

/** A row (or grid) of figures for "N in M" statements, drawn with the site's own illustration parts. */
export function renderPictogram(p: PictogramProps): ChartRender {
  const { locale, count, total = 10, icon = 'adult', tone = 'exhaust' } = p;
  const cols = p.cols ?? Math.min(total, 10);
  const ic = ICONS[icon];
  const rowsN = Math.ceil(total / cols);
  const gapY = 16;
  let body = '';
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const on = i < count;
    body += `<g class="c-picto ${on ? `c-picto--on c-picto-${tone}` : 'c-picto--off'}" transform="translate(${col * ic.w} ${(row + 1) * ic.h + row * gapY})">${ic.draw()}</g>`;
  }
  const f = (v: number) => fmt(locale, v, 0);
  return {
    kind: 'pictogram',
    body,
    height: rowsN * ic.h,
    viewBox: `0 0 ${cols * ic.w} ${rowsN * ic.h + (rowsN - 1) * gapY + 4}`,
    maxWidth: `${Math.min(44, (cols * ic.w) / (icon.startsWith('scooter') ? 16 : 13))}rem`,
    legend: [
      { label: `${f(count)} · ${p.label}`, tone, shape: 'rect' },
      { label: `${f(total - count)} · ${p.restLabel}`, tone: 'neutral', shape: 'light' },
    ],
    table: { head: [p.categoryLabel, p.valueLabel], rows: [[p.label, f(count)], [p.restLabel, f(total - count)]] },
  };
}
