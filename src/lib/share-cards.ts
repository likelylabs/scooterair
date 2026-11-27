// Share cards (brief 7.9, 8.3): the list of cards, where their images live, what each one
// shows and says, and the title and description a link preview prints under it. One module for
// both sides: scripts/build-share-cards.mjs renders the PNGs (it screenshots the card pages
// /print/card/<id>/, built only for it); Base.astro points og:image at shareCard(). Loadable by
// plain Node: relative imports only.
//
//   npm run share-cards             build the card pages, render public/share/{zh,en}/<id>.png
//   npm run share-cards -- --check  verify the committed PNGs match the current words and pictures
//                                   (part of `npm run check`)
//
// A card is a poster seen at thumbnail size (about 320 px wide in a chat): one picture that
// fills the 1200 × 630 card (src/components/art/card-art.ts), one short headline and the
// 示意圖 plate (no site name: in a preview it was a speck). No numbers, so no card needs a 推估 mark or a caveat: the
// page the link opens carries both. One image per page: a second og:image makes iMessage show
// a split collage, and LINE crops this one to its central square, where the headline and the
// people at the kerb are drawn.

import share from '../i18n/pages/share.ts';
import { est } from '../data/estimate.ts';
import type { CardArtKind } from '../components/art/card-art.ts';

type Locale = 'zh-TW' | 'en';

/** Question pages with a card (brief 7.5). `how-much` and `electric` are redirect pages whose old shares must still show a picture. */
export const questionSlugs = ['smell', 'my-child', 'app', 'one-red-light', 'rider', 'beside-me', 'mask', 'how-much', 'electric'] as const;
export type QuestionSlug = (typeof questionSlugs)[number];
export type ShareCardId = 'home' | 'brief' | 'act' | 'film' | 'money' | QuestionSlug;
export const shareCardIds: ShareCardId[] = ['home', 'brief', 'act', 'film', 'money', ...questionSlugs];

/** Each card's picture and the headline it carries (a key of share.title). */
const CARDS: Record<ShareCardId, { art: CardArtKind; title: keyof typeof share.title }> = {
  home: { art: 'kerb', title: 'home' },
  brief: { art: 'heights', title: 'brief' },
  act: { art: 'fix', title: 'act' },
  film: { art: 'film', title: 'film' },
  money: { art: 'electric', title: 'money' },
  electric: { art: 'electric', title: 'money' },
  smell: { art: 'smell', title: 'smell' },
  'my-child': { art: 'child', title: 'my-child' },
  app: { art: 'station', title: 'app' },
  'one-red-light': { art: 'signal', title: 'one-red-light' },
  rider: { art: 'rider', title: 'rider' },
  'beside-me': { art: 'distance', title: 'beside-me' },
  mask: { art: 'mask', title: 'mask' },
  'how-much': { art: 'pack', title: 'how-much' },
};

export interface ShareCardContent {
  id: ShareCardId;
  /** the picture: a composition of src/components/art/card-art.ts */
  art: CardArtKind;
  /** the headline; may contain '|' phrase marks */
  title: string;
  /** the small plate on the picture */
  tag: string;
  /** the image's alt text */
  alt: string;
}

const dir = (locale: Locale) => (locale === 'en' ? 'en' : 'zh');
const plain = (s: string) => s.replaceAll('|', '');
const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_m, k: string) => {
    if (vars[k] === undefined) throw new Error(`[share cards] no value for {${k}} in: ${s}`);
    return String(vars[k]);
  });

/** Everything that is drawn on a card, in one language. */
export function shareCardContent(id: ShareCardId, locale: Locale): ShareCardContent {
  const c = CARDS[id];
  const title = share.title[c.title][locale];
  const head = plain(title);
  const stop = /[？?。.！]$/.test(head) ? '' : locale === 'en' ? '.' : '。';
  const picture = fill(share.picture[c.art][locale], { red: est.signal.redLength_s });
  return { id, art: c.art, title, tag: share.tag[locale], alt: fill(share.alt[locale], { title: `${head}${stop}`, picture }) };
}

/** Path under /public (pass through asset()) and the alt text for a card. */
export function shareCard(id: ShareCardId, locale: Locale): { wide: string; alt: string } {
  return { wide: `/share/${dir(locale)}/${id}.png`, alt: shareCardContent(id, locale).alt };
}

export type OgPage = keyof typeof share.og;

/**
 * The title and one-sentence description a link preview prints for a page (og:title,
 * og:description), from its path without the base path or the /en prefix ('' for the home
 * page, 'evidence', 'questions/smell', '90'). Null for a page that names its own (a question
 * page's question and answer) or has none here.
 */
export function ogText(path: string, locale: Locale): { title: string; description: string } | null {
  const key = path.replace(/^\/+|\/+$/g, '');
  const page: OgPage | null = key === '' ? 'home' : key === '90' ? 'film' : key in share.og ? (key as OgPage) : null;
  if (!page) return null;
  const o = share.og[page];
  return { title: o.title[locale], description: o.description[locale] };
}
