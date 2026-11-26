// Locale plumbing shared by every page.
// zh-TW is the primary language and lives at the site root; English lives under /en/.

export const locales = ['zh-TW', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-TW';

/** A string (or any value) provided in both languages. */
export type L10n<T = string> = { 'zh-TW': T; en: T };

/** Pick the right language out of an L10n value. */
export function pick<T>(value: L10n<T>, locale: Locale): T {
  return value[locale];
}

/** `[...lang]` route param -> Locale. Root (undefined) is zh-TW. */
export function localeFromParam(lang: string | undefined): Locale {
  return lang === 'en' ? 'en' : 'zh-TW';
}

/** getStaticPaths() body for every `src/pages/[...lang]/*.astro` page. */
export function localeStaticPaths() {
  return [{ params: { lang: undefined } }, { params: { lang: 'en' } }];
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Build an internal href for a locale. `path` is the locale-neutral path,
 * e.g. '/', '/problem/', '/electric/#calculator'.
 */
export function href(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const prefix = locale === 'en' ? '/en' : '';
  return `${base}${prefix}${clean}`;
}

/** Href for a file in /public (never locale-prefixed). */
export function asset(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

/** The same page in the other language, given the current URL pathname. */
export function switchLocalePath(pathname: string, to: Locale): string {
  let p = pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/';
  p = p.replace(/^\/en(?=\/|$)/, '') || '/';
  return href(p, to);
}

export const htmlLang: Record<Locale, string> = { 'zh-TW': 'zh-Hant-TW', en: 'en' };
