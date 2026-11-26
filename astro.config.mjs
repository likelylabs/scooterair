import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SKIP, coveredChars, scanDist } from './scripts/display-font.mjs';

// SITE_URL / BASE_PATH let the same build serve a custom domain (default)
// or a GitHub Pages project path (BASE_PATH=/scooterair).
// Every absolute URL the site prints (canonical, og:url, og:image, hreflang, sitemap) is built
// from `site`, and the site is only served over HTTPS. GitHub's configure-pages step reports
// an http:// origin for a custom domain, so the scheme is forced here, for any caller.
const site = (process.env.SITE_URL || 'https://scooterair.tw').replace(/^http:\/\//i, 'https://').replace(/\/+$/, '');
const base = process.env.BASE_PATH || '/';

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
          `${missing.size} headline character(s) are not in the subset yet: ${[...missing].join('')}. They are drawn from the sliced font (extra downloads on those pages). Fix: \`npm run headline-font\` (needs \`pip install fonttools brotli\` once), then commit src/styles/fonts/.`,
        );
    },
  },
};

/**
 * robots.txt, pointing crawlers at the sitemap. Written after the build because the sitemap's
 * address depends on SITE_URL and BASE_PATH. Crawlers only read robots.txt at the root of a
 * host, so under a project path (likelylabs.com/scooterair/) this file is ignored and the
 * sitemap has to be submitted in Search Console by hand; on its own domain it takes effect.
 */
const robots = {
  name: 'scooterair:robots',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const sitemapUrl = new URL(`${base.replace(/\/?$/, '/')}sitemap-index.xml`, `${site}/`).href;
      writeFileSync(new URL('robots.txt', dir), `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
    },
  },
};

/** The sitemap's language code for Chinese is the one the pages declare (src/i18n htmlLang). */
const ZH = 'zh-Hant-TW';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  // scoped styles mark elements with a short class instead of a data-astro-cid-* attribute:
  // the same specificity, and tens of kilobytes less HTML on the longest pages
  scopedStyleStrategy: 'class',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'zh-TW', locales: { 'zh-TW': ZH, en: 'en' } },
      // the same x-default as each page's <link rel="alternate" hreflang="x-default">: the Chinese page
      serialize: (item) => {
        const zh = item.links?.find((l) => l.lang === ZH);
        if (zh && !item.links.some((l) => l.lang === 'x-default')) item.links.push({ lang: 'x-default', url: zh.url });
        return item;
      },
      // out of the sitemap: utility pages, the /problem/ → /questions/ redirect, and the
      // print sheets under /print/, which are noindex (a sitemap must not list those)
      filter: (page) => !/\/(styleguide(-[a-z]+)?|problem|print\/[^/]+)\/$/.test(page),
    }),
    headlineFont,
    robots,
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
