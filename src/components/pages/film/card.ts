// The film's share card (V44 conventions): what is drawn on it and where its images live.
// Loadable by plain Node (the generator imports it), so: relative imports with .ts extensions.
//
// The site's card list lives in src/lib/share-cards.ts. Until 'film' is added there, the film's
// card is rendered by ./build-film-card.mjs, which runs the site's own generator
// (scripts/build-share-cards.mjs, unmodified) with this card as its only job.

import film from '../../../i18n/pages/film.ts';
import share from '../../../i18n/pages/share.ts';

type Locale = 'zh-TW' | 'en';

/** The same shape as ShareCardContent in src/lib/share-cards.ts. */
export function filmCardContent(locale: Locale) {
  const c = film.share;
  return { id: 'film', kind: 'question' as const, kicker: c.kicker[locale], title: c.title[locale], answer: c.answer[locale], caveat: c.caveat[locale], badges: ['gap' as const] };
}

/** Paths under /public (pass through asset()) and the alt text. */
export function filmCard(locale: Locale): { wide: string; square: string; alt: string } {
  const c = filmCardContent(locale);
  const dir = locale === 'en' ? 'en' : 'zh';
  // the template joins title and answer directly, as it does for a question that ends in its own mark
  const title = c.title.replaceAll('|', '');
  const stop = /[。？.?]$/.test(title) ? '' : locale === 'en' ? '.' : '。';
  const alt = share.alt[locale].replace('{title}', title + stop).replace('{answer}', c.answer).replace('{caveat}', c.caveat);
  return { wide: `/share/${dir}/film.png`, square: `/share/${dir}/film-sq.png`, alt };
}
