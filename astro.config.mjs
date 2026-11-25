import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL / BASE_PATH let the same build serve a custom domain (default)
// or a GitHub Pages project path (BASE_PATH=/scooterair).
const site = process.env.SITE_URL ?? 'https://scooterair.tw';
const base = process.env.BASE_PATH ?? '/';

/**
 * Noto Sans TC ships as ~100 unicode-range slices with `font-display: swap`.
 * On a slow phone that means slices pop in one by one, long after first paint.
 * We rewrite it to `fallback`: ~100ms block, ~3s swap window, after which the
 * (very good) system CJK face stays for this page view and the web font is
 * simply cached for the next one. See src/styles/fonts.css for the Latin side.
 */
const cjkFontDisplay = {
  name: 'scooterair:cjk-font-display',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@fontsource-variable/noto-sans-tc') || !id.includes('.css')) return null;
    return { code: code.replaceAll('font-display: swap', 'font-display: fallback'), map: null };
  },
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'zh-TW', locales: { 'zh-TW': 'zh-TW', en: 'en' } },
      filter: (page) => !/\/styleguide\/$/.test(page),
    }),
  ],
  vite: { plugins: [cjkFontDisplay] },
});
