/**
 * glyphs.ts — the shop-sign characters as outlines. Build time only.
 *
 * SVG <text> under a zooming camera is laid out again on every frame, so the nineteen
 * characters on the arcade's signs are drawn as paths. The outlines come from the Noto Sans TC
 * the site already depends on, read with the font library that ships with Astro. If either is
 * missing the signs are blank plates: they are street furniture, not copy.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SIGNS } from './scene.ts';

export type Glyphs = Record<string, { d: string; adv: number }>;

let cached: Glyphs | undefined;

export async function signGlyphs(root: string = process.cwd()): Promise<Glyphs> {
  if (cached) return cached;
  const glyphs: Glyphs = {};
  try {
    const fk = (await import('fontkitten')) as unknown as { create: (b: Uint8Array) => any };
    const dir = join(root, 'node_modules/@fontsource/noto-sans-tc/files');
    if (!existsSync(dir)) throw new Error(`no font files at ${dir}`);
    const want = new Set(SIGNS.join(''));
    for (const f of readdirSync(dir).filter((n) => /-700-normal\.woff$/.test(n)).sort()) {
      if (!want.size) break;
      const font = fk.create(readFileSync(join(dir, f)));
      for (const ch of [...want]) {
        const cp = ch.codePointAt(0)!;
        if (!font.hasGlyphForCodePoint(cp)) continue;
        const g = font.glyphForCodePoint(cp);
        glyphs[ch] = { d: String(g.path.toSVG()).replace(/(\d+\.\d)\d+/g, '$1'), adv: (g.advanceWidth * 1000) / font.unitsPerEm };
        want.delete(ch);
      }
    }
    if (want.size) console.warn(`[film] no outline for the sign characters ${[...want].join('')}: those signs stay blank`);
  } catch (e) {
    console.warn(`[film] shop signs are drawn blank (${(e as Error).message})`);
  }
  cached = glyphs;
  return glyphs;
}
