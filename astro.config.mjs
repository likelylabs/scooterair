import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  vite: { plugins: [woff2Only] },
});
