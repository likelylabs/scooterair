/**
 * scene.ts — small helpers every scene component shares.
 */
import type { Locale } from '../../i18n/index.ts';
import type { AirScenario, Box } from './air.ts';
import { art } from '../../i18n/art.ts';

const pct = (v: number) => `${+(v * 100).toFixed(3)}%`;

/** CSS that puts an HTML label at the drawing's point (x, y). See SceneLabel.astro. */
export function labelStyle(box: Box, x: number, y: number, max?: number): string {
  return `left:${pct((x - box.x) / box.w)};top:${pct((y - box.y) / box.h)}` + (max ? `;max-inline-size:${max}%` : '');
}

/** The same point as fractions of the picture (0 to 1), for scripts that position things themselves. */
export const at = (box: Box, x: number, y: number): { left: number; top: number } => ({ left: (x - box.x) / box.w, top: (y - box.y) / box.h });

/** Every scene's description must say it is an illustration (acceptance check 17). */
export function assertSceneAlt(alt: string, locale: Locale): void {
  const ok = locale === 'en' ? /illustration/i.test(alt) : alt.includes('示意圖');
  if (!ok) throw new Error(`A scene's alt text must say it is an illustration (${locale === 'en' ? '"illustration"' : '示意圖'}). Got: "${alt.slice(0, 60)}…". Build it with sceneAlt().`);
}

/**
 * Build a scene's alt text the way brief 5.1 asks: what the picture shows,
 * then which scenario it draws, then the shared sentence that says the amount
 * where people stand follows the estimate and the dark patches are for the eye.
 *
 *   sceneAlt(locale, t.alt.kerb, { scenario: 'dozen', count: est.scn.dozen.count })
 *
 * `kind`:
 *   'pack'      (default) a scene with petrol scooters: ends with the estimate sentence
 *   'electric'  an electric or green-light scene: ends with the "street's own air" sentence
 *   'plain'     a drawing with no street air in it (the body, the mask, the can): only says it is an illustration
 */
export function sceneAlt(
  locale: Locale,
  what: string,
  o: { scenario?: AirScenario; count?: { lo: number; hi: number }; kind?: 'pack' | 'electric' | 'plain' } = {},
): string {
  const kind = o.kind ?? 'pack';
  const parts = [what.trim()];
  if (o.scenario && o.count) parts.push(art.alt2.scenario[o.scenario][locale].replace('{lo}', String(o.count.lo)).replace('{hi}', String(o.count.hi)));
  parts.push(art.alt2[kind][locale]);
  return parts.join(locale === 'en' ? ' ' : '');
}

/**
 * Screen-reader users should hear the long closing sentence of sceneAlt() (what is estimated and
 * what is drawn for the eye, or the street's own air) once per page, not on every scene. This
 * returns which closing sentence an alt ends with and the same alt ending with the short
 * 「這是示意圖。」 / "This is an illustration." instead (so it still says it is an illustration:
 * acceptance check 17), or null for an alt with no long closing sentence. SceneFrame prints both;
 * ./alt-once.client.ts keeps the long one on the first scene of the page, in document order, and
 * gives the later scenes the short one. Without JavaScript every scene keeps the long one.
 */
export function shortSceneAlt(alt: string, locale: Locale): { note: 'pack' | 'electric'; short: string } | null {
  for (const note of ['pack', 'electric'] as const) {
    const long = art.alt2[note][locale];
    if (alt.endsWith(long)) return { note, short: alt.slice(0, alt.length - long.length) + art.alt2.plain[locale] };
  }
  return null;
}

/**
 * A thin leader line from a label (x0, y0) into the fume (x1, y1), in drawing units, for a
 * <SceneLabel> that names what the fume holds. `upp` is drawing units per screen pixel at 360 px
 * (unitsPerPx(box.w)), so the line is about 1.5 px wide on a phone. A paper-coloured edge under it
 * keeps it visible over the darkest plume. Drawn in the SVG, above the fume and below the label.
 */
export function leader(x0: number, y0: number, x1: number, y1: number, upp: number): string {
  const d = `M${+x0.toFixed(1)},${+y0.toFixed(1)}L${+x1.toFixed(1)},${+y1.toFixed(1)}`;
  return `<g class="fume-lead"><path class="fume-lead__edge" stroke-width="${+(4 * upp).toFixed(2)}" d="${d}"/><path class="fume-lead__line" stroke-width="${+(1.6 * upp).toFixed(2)}" d="${d}"/></g>`;
}
