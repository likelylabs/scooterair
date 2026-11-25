/**
 * The seven pips of the evidence chain, drawn once for the countdown rail,
 * the in-chapter ChainMarker and the jump menu.
 *
 * Pip style encodes the evidence (chain.summary[i].pip in ui.ts):
 *   filled   Taiwan data                 — a solid dot
 *   outline  modelled or international   — a ring
 *   open     nobody has measured it      — the line breaks; two small hollow ends, nothing between
 *   go       the link you can break      — set apart after a cut, in signal green
 * "You are here" is a ring around the pip, so it never fights the fill.
 */
import { chain, type ChainPip } from '../../i18n/ui.ts';

const STEP = 17;
const PAD = 9;
const CUT = 7; // extra gap before the final pip

export const pipX = (i: number, total: number): number => PAD + i * STEP + (i === total - 1 ? CUT : 0);
export const pipsWidth = (total: number): number => pipX(total - 1, total) + PAD;

/** One pip glyph centred on (cx, 9). */
export function pipGlyph(kind: ChainPip, cx: number): string {
  if (kind === 'open') return `<circle class="pip__end" cx="${cx - 3.6}" cy="9" r="2.2"/><circle class="pip__end" cx="${cx + 3.6}" cy="9" r="2.2"/>`;
  return `<circle class="pip__dot" cx="${cx}" cy="9" r="4.2"/>`;
}

/**
 * SVG children for the row of pips. `current` (1-based) gets the "you are
 * here" ring; every pip carries data-pip so the rail script can move the ring.
 */
export function pipsBody(current?: number, kinds: ChainPip[] = chain.summary.map((l) => l.pip)): string {
  const total = kinds.length;
  const o: string[] = [];
  // rail segments: none into or out of an open pip, none across the cut
  for (let i = 0; i < total - 2; i++) {
    const a = pipX(i, total) + (kinds[i] === 'open' ? 7 : 4.2);
    const b = pipX(i + 1, total) - (kinds[i + 1] === 'open' ? 7 : 4.2);
    if (b > a) o.push(`<path class="pip__rail" d="M${a},9H${b}"/>`);
  }
  const c = pipX(total - 2, total) + 8;
  o.push(`<path class="pip__cut" d="M${c + 2},5l-3,8M${c + 6},5l-3,8"/>`);
  kinds.forEach((k, i) => {
    const cx = pipX(i, total);
    o.push(`<g class="pip pip--${k}" data-pip="${i + 1}"${current === i + 1 ? ' data-now' : ''}>${pipGlyph(k, cx)}<circle class="pip__ring" cx="${cx}" cy="9" r="${k === 'open' ? 8 : 7.2}"/></g>`);
  });
  return o.join('');
}

/** A single pip as its own tiny SVG (jump menu rows, legends). */
export function pipSvg(kind: ChainPip): string {
  return `<svg class="pips pips--one" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true" focusable="false"><g class="pip pip--${kind}">${pipGlyph(kind, 9)}</g></svg>`;
}
