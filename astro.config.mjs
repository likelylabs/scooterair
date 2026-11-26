import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SKIP, coveredChars, scanDist } from './scripts/display-font.mjs';

// SITE_URL / BASE_PATH let the same build serve a custom domain (default)
// or a GitHub Pages project path (BASE_PATH=/scooterair).
const site = process.env.SITE_URL ?? 'https://scooterair.tw';
const base = process.env.BASE_PATH ?? '/';

/**
 * The CJK display face (@fontsource/noto-sans-tc, weight 900) lists a .woff
 * fallback beside every .woff2 slice. Every browser we support reads woff2,
 * so drop the fallbacks instead of shipping ~100 extra files.
 * See src/styles/fonts.css for the whole font strategy.
 */
const woff2Only = {
  name: 'scooterair:woff2-only',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@fontsource/noto-sans-tc') || !id.includes('.css')) return null;
    return { code: code.replace(/,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g, ''), map: null };
  },
};

/**
 * The Chinese headline font is one small subset with the package's sliced font behind it
 * (scripts/display-font.mjs explains the scheme). After each build: on every Chinese page
 * whose headline characters the subset covers, drop the link to the slice list, which that
 * page would never draw from; where it does not cover them, leave the link and say which
 * characters are missing. A page is never left without a glyph.
 */
const headlineFont = {
  name: 'scooterair:headline-font',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const dist = fileURLToPath(dir).replace(/[\\/]$/, '');
      const covered = coveredChars();
      const missing = new Set();
      let trimmed = 0;
      for (const page of scanDist(dist)) {
        const lacks = [...page.chars].filter((c) => !covered.has(c));
        const counted = !SKIP.test(page.route.slice(1));
        if (lacks.length || page.dynamic) {
          if (counted) lacks.forEach((c) => missing.add(c));
          continue;
        }
        const html = readFileSync(page.file, 'utf8');
        const out = html.replace(/<link\b[^>]*\bdata-cjk-slices\b[^>]*>/g, '').replace(/<noscript\b[^>]*\bdata-cjk-slices\b[^>]*>[\s\S]*?<\/noscript>/g, '');
        if (out !== html) {
          writeFileSync(page.file, out);
          trimmed++;
        }
      }
      logger.info(`headline subset covers ${trimmed} Chinese page(s); the sliced font stays linked on the rest.`);
      if (missing.size)
        logger.warn(
          `${missing.size} headline character(s) are not in the subset yet: ${[...missing].join('')}. They are drawn from the sliced font (extra downloads on those pages). Run \`node scripts/build-display-font.mjs\`, build again and commit src/styles/fonts/.`,
        );
    },
  },
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'zh-TW', locales: { 'zh-TW': 'zh-TW', en: 'en' } },
      // out of the sitemap: utility pages, the /problem/ → /questions/ redirect, and the
      // print sheets under /print/, which are noindex (a sitemap must not list those)
      filter: (page) => !/\/(styleguide(-[a-z]+)?|problem|print\/[^/]+)\/$/.test(page),
    }),
    headlineFont,
  ],
  vite: {
    plugins: [woff2Only],
    build: {
      rolldownOptions: {
        // The data registry (src/data) and the string modules (src/i18n) only declare values:
        // importing one for its side effects means nothing. Saying so lets a browser bundle
        // that needs one helper from ui.ts (readerText, in the calculator) leave out the fact
        // registry that ui.ts reads its numbers from, which would otherwise double the script.
        treeshake: { moduleSideEffects: [{ test: /[\\/]src[\\/](data|i18n)[\\/]/, sideEffects: false }] },
      },
    },
  },
});
