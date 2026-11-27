/**
 * The five reader chips, as drawing data (brief 4.1): five shapes, so a chip is told apart by
 * its word and its shape, never by colour alone. KindChip, the charts' legends, the share-card
 * generator and the film all draw these same glyphs.
 * Plain data, no Astro: loadable from Node scripts.
 *
 *   measured    實測      solid dot
 *   estimate    推估      hatched dot with a dashed outline
 *   official    官方      solid square
 *   study       研究      open book
 *   derived     本站計算   plus sign
 *   market      業者公布   price tag (money pages only)
 *
 * Glyphs are drawn on a 16 × 16 grid in `currentColor`.
 */
import type { ChipKind } from '../../i18n/ui.ts';

export const chipGlyphs: Record<ChipKind, string> = {
  measured: '<circle cx="8" cy="8" r="5.2" fill="currentColor"/>',
  estimate:
    '<circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.3 1.95"/>' +
    '<path d="M3.5 9.6 9.6 3.5M4.6 11.4l6.8-6.8M6.4 12.5l6.1-6.1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  official: '<rect x="3" y="3" width="10" height="10" fill="currentColor"/>',
  study:
    '<path d="M8 4.3C6.4 3.2 4.4 2.9 2 3.1v9.1c2.4-.2 4.4.1 6 1.2 1.6-1.1 3.6-1.4 6-1.2V3.1c-2.4-.2-4.4.1-6 1.2zM8 4.3v9.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>',
  derived: '<path d="M8 2.6v10.8M2.6 8h10.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  market:
    '<path d="M2.4 8.4V2.8h5.4l6 6-5.4 5.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="5.5" cy="5.9" r="1" fill="currentColor"/>',
};

/** A complete inline <svg> for a chip's glyph (decorative: always pair it with the chip's word). */
export function chipGlyphSvg(kind: ChipKind, size = '1em'): string {
  return `<svg class="chip-glyph" viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true" focusable="false">${chipGlyphs[kind]}</svg>`;
}
