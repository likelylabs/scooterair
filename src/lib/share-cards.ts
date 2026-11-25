// Share cards (V44): the list of cards, where their images live, and what each one says.
// One module for both sides: scripts/build-share-cards.mjs renders the PNGs from
// shareCardContent(); Base.astro points og:image at shareCard(). Loadable by plain Node.
//
// Images are generated on demand and committed (no browser in CI):
//   npm run share-cards            render public/share/{zh,en}/<id>.png and <id>-sq.png
//   npm run share-cards -- --check verify the committed PNGs match the current copy
//                                  (part of `npm run check`)

import questions from '../i18n/pages/questions.ts';
import share from '../i18n/pages/share.ts';
import { chain, site, type EvidenceKind } from '../i18n/ui.ts';

type Locale = 'zh-TW' | 'en';
export type QuestionSlug = keyof typeof questions.items;
export type ShareCardId = 'home' | 'brief' | QuestionSlug;

export const questionSlugs = Object.keys(questions.items) as QuestionSlug[];
export const shareCardIds: ShareCardId[] = ['home', 'brief', ...questionSlugs];

const dir = (locale: Locale) => (locale === 'en' ? 'en' : 'zh');
const plain = (s: string) => s.replaceAll('|', '');

export interface ShareCardContent {
  id: ShareCardId;
  kind: 'home' | 'brief' | 'question';
  kicker: string;
  /** May contain '|' phrase marks. */
  title: string;
  answer: string;
  caveat: string;
  badges: EvidenceKind[];
  /** The seven lines, on the 'brief' card only. */
  lines?: { text: string; badges: EvidenceKind[] }[];
}

/** Everything that is drawn on a card, in one language. */
export function shareCardContent(id: ShareCardId, locale: Locale): ShareCardContent {
  if (id === 'home') {
    const h = share.home;
    return { id, kind: 'home', kicker: h.kicker[locale], title: h.title[locale], answer: h.answer[locale], caveat: h.caveat[locale], badges: ['gap'] };
  }
  if (id === 'brief') {
    return {
      id,
      kind: 'brief',
      kicker: site.name[locale],
      title: share.brief.title[locale],
      answer: '',
      caveat: share.brief.caveat[locale],
      badges: [],
      lines: chain.summary.map((l) => ({ text: l.text[locale], badges: l.badges })),
    };
  }
  const q = questions.items[id];
  return { id, kind: 'question', kicker: site.tagline[locale], title: q.q[locale], answer: q.answer[locale], caveat: q.caveat[locale], badges: q.badges };
}

/** Paths under /public (pass through asset()) and the alt text for a card. */
export function shareCard(id: ShareCardId, locale: Locale): { wide: string; square: string; alt: string } {
  const c = shareCardContent(id, locale);
  const alt =
    c.kind === 'brief'
      ? `${c.title}: ${c.lines!.map((l, i) => `${i + 1}. ${l.text}`).join(' ')} ${c.caveat}`
      : share.alt[locale].replace('{title}', plain(c.title)).replace('{answer}', c.answer).replace('{caveat}', c.caveat);
  return { wide: `/share/${dir(locale)}/${id}.png`, square: `/share/${dir(locale)}/${id}-sq.png`, alt };
}
