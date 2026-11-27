/**
 * Shared drawing data for the FINER registry badges (/evidence/ and /sources/ only), so
 * EvidenceBadge, the chain components and the share-card generator all draw the same glyphs.
 * The five reader chips every other page uses are in ./kinds.ts (brief 4.1).
 * Plain data, no Astro: loadable from Node scripts.
 *
 * Icons are 16 × 16, stroke-only, `currentColor`. Each kind has its own
 * silhouette so it reads at 13px without colour:
 *   measured-tw    crosshair            official-tw   columned building
 *   modelled-tw    a curve on two axes  international globe
 *   market-tw      price tag            derived       + − × = (sums)
 *   inference      dashed arrow         gap           two hollow ends (deprecated)
 *   estimate       hatched, dashed dot
 */
import type { EvidenceKind } from '../../i18n/ui.ts';

export const evidenceIcons: Record<EvidenceKind, string> = {
  'measured-tw': '<circle cx="8" cy="8" r="4"/><path d="M8 1v4M8 11v4M1 8h4M11 8h4"/>',
  'official-tw': '<path d="M2 6.6 8 2.6l6 4M2.5 13.6h11M4.4 7.4v4.8M8 7.4v4.8M11.6 7.4v4.8"/>',
  'modelled-tw': '<path d="M2.2 2v11.8H14"/><path d="M4.4 11.2c2.3 0 2.8-6.2 5.2-6.2 1.7 0 1.9 2.2 4 2.2"/>',
  international: '<circle cx="8" cy="8" r="6.2"/><ellipse cx="8" cy="8" rx="2.7" ry="6.2"/><path d="M1.8 8h12.4"/>',
  'market-tw': '<path d="M2.4 8.4V2.8h5.4l6 6-5.4 5.4z"/><circle cx="5.5" cy="5.9" r="0.9"/>',
  derived: '<path d="M2.6 4.8h4M4.6 2.8v4M9.6 4.8h4M2.6 11.6h4M9.6 10.4h4M9.6 12.8h4"/>',
  // the site's own estimate: the hatched, dashed dot of the 推估 chip (kinds.ts), as strokes
  estimate: '<circle cx="8" cy="8" r="6.2" stroke-dasharray="2.3 1.95"/><path d="M3.5 9.6 9.6 3.5M4.6 11.4l6.8-6.8M6.4 12.5l6.1-6.1" stroke-width="1.3"/>',
  inference: '<path stroke-dasharray="2.2 2.4" d="M1.5 8h9"/><path d="M9.5 4.5 13.5 8l-4 3.5"/>',
  gap: '<circle cx="3.5" cy="8" r="2.3"/><circle cx="12.5" cy="8" r="2.3"/>',
};

/** A complete inline <svg> for a kind (decorative: pair it with the label). */
export function evidenceIconSvg(kind: EvidenceKind, size = '1.15em'): string {
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${evidenceIcons[kind]}</svg>`;
}
