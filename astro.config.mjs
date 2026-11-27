import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SKIP, coveredChars, scanDist } from './scripts/display-font.mjs';

// SITE_URL / BASE_PATH let the same build serve a custom domain (default)
// or a GitHub Pages project path (BASE_PATH=/scooterair).
// Every absolute URL the site prints (canonical, og:url, og:image, hreflang, sitemap) is built
// from `site`, and the site is only served over HTTPS. GitHub's configure-pages step reports
// an http:// origin for a custom domain, so the scheme is forced here, for any caller.
//
// The live address is https://likelylabs.com/scooterair/. A build with no SITE_URL (a local or
// check build, served from /) still prints that live address in every absolute URL: the origin
// defaults to likelylabs.com and PUBLIC_PREFIX puts /scooterair in front of each path. With
// SITE_URL set (the deploy workflow, or SITE_URL=… BASE_PATH=/scooterair by hand) the prefix
// is empty and the build's own base path is the public one.
const site = (process.env.SITE_URL || 'https://likelylabs.com').replace(/^http:\/\//i, 'https://').replace(/\/+$/, '');
const base = process.env.BASE_PATH || '/';
const publicPrefix = !process.env.SITE_URL && base.replace(/\/+$/, '') === '' ? '/scooterair' : '';
/** The base path as a URL path prefix with both slashes: '/' or '/scooterair/'. */
const basePrefix = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');

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
 * A closing mark never starts a line on its own (brief 9.3 check 13): in headings, buttons, links
 * styled as buttons, fold titles and the film transcript, a Chinese character and the closing
 * punctuation after it are kept together in <span class="nobr"> (white-space: nowrap, global.css).
 * Done once over the built HTML, text only: tags, attributes, <svg>, <script> and <style> are
 * left alone. Phrased and the home page's phrasedHtml() do the same for text drawn in the browser.
 */
const ZHUYIN = /[\u3400-\u9fff]（[\u3100-\u312f\u02c7\u02ca\u02cb\u02d9]+）[，。？！；：、]?/g;
const GLUE_MARKS = /([\u3400-\u9fff])([，。？！；：、）」』〉》…]+)/g;
const GLUE_IN = /(<(h[1-4]|button|summary|figcaption|li|a)\b[^>]*>)([\s\S]*?)(<\/\2>)/g;
function glueText(inner) {
  if (/<(svg|script|style|textarea)\b/.test(inner)) return inner.replace(/(<(svg|script|style|textarea)\b[\s\S]*?<\/\2>)|(<[^>]*>)|([^<]+)/g, (m, keep, _t, tag, text) => (keep || tag ? m : text.replace(GLUE_MARKS, '<span class="nobr">$1$2</span>')));
  return inner.split(/(<[^>]+>)/).map((x) => (x.startsWith('<') ? x : x.replace(GLUE_MARKS, '<span class="nobr">$1$2</span>'))).join('');
}
function walkHtml(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walkHtml(f, out);
    else if (e.name.endsWith('.html')) out.push(f);
  }
  return out;
}
const gluePunctuation = {
  name: 'scooterair:glue-punctuation',
  hooks: {
    'astro:build:done': ({ dir }) => {
      for (const file of walkHtml(fileURLToPath(dir))) {
        const html = readFileSync(file, 'utf8');
        const body = html.indexOf('<body');
        if (body < 0) continue;
        const head = html.slice(0, body);
        const rest = html
          .slice(body)
          .replace(GLUE_IN, (m, open, _tag, inner, close) => open + glueText(inner) + close)
          // a character and its 注音 never part: 「苯（ㄅㄣˇ）」 stays on one line, anywhere in the body
          .replace(/(<(svg|script|style|textarea)\b[\s\S]*?<\/\2>)|(<[^>]*>)|([^<]+)/g, (m, keep, _t, tag, text) => (keep || tag ? m : text.replace(ZHUYIN, '<span class="nobr">$&</span>')))
          // text a component already glued (Phrased) is not wrapped twice
          .replace(/<span class="nobr"><span class="nobr">([^<]*)<\/span><\/span>/g, '<span class="nobr">$1</span>');
        if (head + rest !== html) writeFileSync(file, head + rest);
      }
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
      const sitemapUrl = new URL(`${publicPrefix}${base.replace(/\/?$/, '/')}sitemap-index.xml`, `${site}/`).href;
      writeFileSync(new URL('robots.txt', dir), `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
      // the sitemap index of a build with no SITE_URL points at the live address too
      if (publicPrefix) {
        const index = new URL('sitemap-index.xml', dir);
        try {
          const xml = readFileSync(index, 'utf8');
          writeFileSync(index, xml.replaceAll(`<loc>${site}/`, `<loc>${site}${publicPrefix}/`));
        } catch {
          /* no sitemap in this build */
        }
      }
    },
  },
};

/**
 * Which built pages stay out of the sitemap. A sitemap must list only pages that may be indexed,
 * so anything that tells crawlers `noindex` is left out: every redirect page (src/layouts/Redirect.astro,
 * e.g. /problem/, /unmeasured/, /questions/how-much/, /questions/electric/) and the print sheets.
 * The decision is read from the built HTML itself, so a page that becomes a redirect leaves the
 * sitemap without anyone editing this file. The builders' style guides are not built in production
 * at all (their getStaticPaths returns nothing), and are named here as well so a dev-mode build
 * cannot list them either.
 */
let outDir = null;
const noindexPages = {
  name: 'scooterair:noindex-pages',
  hooks: {
    'astro:config:done': ({ config }) => {
      outDir = fileURLToPath(config.outDir);
    },
  },
};
const UTILITY = /^(en\/)?(styleguide(-[a-z]+)?|print\/[^/]+)\/$/;
function indexable(pageUrl) {
  const path = new URL(pageUrl).pathname;
  const rel = decodeURIComponent(path.startsWith(basePrefix) ? path.slice(basePrefix.length) : path.replace(/^\//, ''));
  if (UTILITY.test(rel)) return false;
  if (!outDir) return true;
  try {
    const head = readFileSync(join(outDir, rel, 'index.html'), 'utf8').slice(0, 8000);
    return !/<meta\b[^>]*name=["']?robots["']?[^>]*content=["'][^"']*noindex/i.test(head) && !/<meta\b[^>]*http-equiv=["']?refresh/i.test(head);
  } catch {
    return true;
  }
}

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
        // a build with no SITE_URL lists the live address (see publicPrefix above)
        if (publicPrefix) {
          const live = (u) => u.replace(`${site}/`, `${site}${publicPrefix}/`);
          item.url = live(item.url);
          if (item.links) item.links = item.links.map((l) => ({ ...l, url: live(l.url) }));
        }
        const zh = item.links?.find((l) => l.lang === ZH);
        if (zh && !item.links.some((l) => l.lang === 'x-default')) item.links.push({ lang: 'x-default', url: zh.url });
        return item;
      },
      // out of the sitemap: every noindex page (redirects, print sheets) and the style guides
      filter: indexable,
    }),
    noindexPages,
    gluePunctuation,
    headlineFont,
    robots,
  ],
  vite: {
    plugins: [woff2Only],
    define: { 'import.meta.env.PUBLIC_PREFIX': JSON.stringify(publicPrefix) },
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
