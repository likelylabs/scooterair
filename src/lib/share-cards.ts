// Share cards (brief 7.9, 8.3): the list of cards, where their images live, and what each one
// says. One module for both sides: scripts/build-share-cards.mjs renders the PNGs (it
// screenshots the card pages /print/card/<id>/, built only for it); Base.astro points og:image
// at shareCard(). Loadable by plain Node: relative imports only.
//
//   npm run share-cards             build the card pages, render public/share/{zh,en}/<id>.png and <id>-sq.png
//   npm run share-cards -- --check  verify the committed PNGs match the current copy and pictures
//                                   (part of `npm run check`)
//
// One picture and one line per card. A card that prints an estimated number carries 推估 and
// the range inside the image; every number is filled here from src/data/estimate.ts, the
// registry or the money engine, never typed.

import share from '../i18n/pages/share.ts';
import { illustration, site } from '../i18n/ui.ts';
import { art } from '../i18n/art.ts';
import { est, formatEstimate, hoursPerYear } from '../data/estimate.ts';
import { homeMoney } from './home-money.ts';

type Locale = 'zh-TW' | 'en';
type L10n = Record<Locale, string>;

/** Question pages with a card (brief 7.5). `how-much` and `electric` are redirect pages whose old shares must still show a picture. */
export const questionSlugs = ['smell', 'my-child', 'app', 'one-red-light', 'rider', 'beside-me', 'mask', 'how-much', 'electric'] as const;
export type QuestionSlug = (typeof questionSlugs)[number];
export type ShareCardId = 'home' | 'brief' | 'act' | 'film' | 'money' | QuestionSlug;
export const shareCardIds: ShareCardId[] = ['home', 'brief', 'act', 'film', 'money', ...questionSlugs];

/**
 * The picture a card draws. 'kerb' and 'kerb-electric' and 'heights' are drawn by lane J's
 * Picture.astro (lane C's KerbScene / HeightsScene when they exist); the others are lane C's
 * scenes, with the kerb as the stand-in until they exist (see the card page).
 */
export type CardPicture = 'kerb' | 'kerb-electric' | 'heights' | 'smell' | 'mask' | 'rider' | 'body' | 'film';

/** The chip on a card's line (brief 4.1 ids). */
export type CardChip = 'measured' | 'estimate' | 'official' | 'study' | 'derived';

export interface ShareCardContent {
  id: ShareCardId;
  picture: CardPicture;
  kicker: string;
  /** May contain '|' phrase marks. */
  title: string;
  /** The one line. With `estimate`, the words that name what the number is the amount of. */
  line: string;
  /** An estimated number printed under the line, with its 推估 chip: 約 0.05 到 1 ppm. */
  estimate?: { text: string; slot: string };
  /** The chip for the line when it carries a number that is not an estimate. */
  chip?: CardChip;
  /** The small print under the line. */
  caveat: string;
}

const dir = (locale: Locale) => (locale === 'en' ? 'en' : 'zh');
const plain = (s: string) => s.replaceAll('|', '');
const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_m, k: string) => {
    if (vars[k] === undefined) throw new Error(`[share cards] no value for {${k}} in: ${s}`);
    return String(vars[k]);
  });
const L = (v: L10n, locale: Locale) => v[locale];
const ntd = (n: number, locale: Locale) => (locale === 'en' ? `NT$${new Intl.NumberFormat('en').format(n)}` : `${new Intl.NumberFormat('zh-TW').format(n)} 元`);
const readerDate = (iso: string, locale: Locale) => {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return locale === 'en' ? `${d} ${months[m - 1]} ${y}` : `${y} 年 ${m} 月 ${d} 日`;
};

/** The estimate's caveat for any card that shows the kerb picture or an estimated number. */
const estimateCaveat = (locale: Locale) => L(share.film.caveat, locale);

/**
 * The money card's line, chosen by rule from the money engine (screen 12's rule): the default
 * case first, then the least favourable case, so the unfavourable figure always travels with
 * the favourable one. Uses the prices' check date, not today's, so the card only changes when
 * the prices are re-checked (the money tables change on fixed dates; the card names its date).
 */
function moneyLine(locale: Locale): { line: string; caveat: string } {
  const m = homeMoney(homeMoney().checkedOn);
  const c = m.buy[m.defaults.county][m.defaults.scrap];
  const county = L(c.countyName as L10n, locale);
  const t = share.money;
  const first = c.verdict === 'cheaper' ? fill(L(t.cheaper, locale), { county, amount: ntd(-c.difference, locale) }) : c.verdict === 'dearer' ? fill(L(t.dearer, locale), { county, amount: ntd(c.difference, locale) }) : fill(L(t.same, locale), { county });
  const worst = m.worst.difference > 0 ? fill(L(t.worst, locale), { amount: ntd(m.worst.difference, locale) }) : '';
  return { line: [first, worst].filter(Boolean).join(locale === 'en' ? ' ' : ''), caveat: fill(L(t.caveat, locale), { date: readerDate(m.checkedOn, locale) }) };
}

/** Everything that is drawn on a card, in one language. */
export function shareCardContent(id: ShareCardId, locale: Locale): ShareCardContent {
  const coAdd = { text: formatEstimate('co.dozen.add', locale).text, slot: 'co.dozen.add' };
  switch (id) {
    case 'home':
      return { id, picture: 'kerb', kicker: L(share.home.kicker, locale), title: L(share.home.title, locale), line: L(share.home.line, locale), estimate: coAdd, caveat: estimateCaveat(locale) };
    case 'brief':
      return { id, picture: 'heights', kicker: L(share.brief.kicker, locale), title: L(share.brief.title, locale), line: L(site.sentence, locale), caveat: L(illustration.tag, locale) };
    case 'act':
      return { id, picture: 'kerb-electric', kicker: L(share.act.kicker, locale), title: L(share.act.title, locale), line: L(share.act.line, locale), chip: 'official', caveat: L(illustration.tag, locale) };
    case 'film':
      return { id, picture: 'film', kicker: L(share.film.kicker, locale), title: L(share.film.title, locale), line: L(share.film.line, locale), caveat: L(share.film.caveat, locale) };
    case 'money':
    case 'electric': {
      const { line, caveat } = moneyLine(locale);
      return { id, picture: 'kerb-electric', kicker: L(share.money.kicker, locale), title: L(share.money.title, locale), line, chip: 'derived', caveat };
    }
  }
  const q = share.questions[id];
  const kicker = L(share.questionKicker, locale);
  switch (id) {
    case 'smell':
      return { id, picture: 'smell', kicker, title: L(q.title, locale), line: L(q.line, locale), chip: 'estimate', caveat: L(illustration.tag, locale) };
    case 'my-child': {
      const r = formatEstimate('child.airPerKg', locale);
      return { id, picture: 'heights', kicker, title: L(q.title, locale), line: fill(L(q.line, locale), { lo: r.lo, hi: r.hi }), chip: 'study', caveat: L(illustration.tag, locale) };
    }
    case 'app':
      return { id, picture: 'kerb', kicker, title: L(q.title, locale), line: fill(L(q.line, locale), { red: est.signal.redLength_s }), chip: 'official', caveat: estimateCaveat(locale) };
    case 'one-red-light': {
      const h = hoursPerYear(4);
      return { id, picture: 'body', kicker, title: L(q.title, locale), line: fill(L(q.line, locale), { lo: h.lo, hi: h.hi }), chip: 'derived', caveat: L(illustration.tag, locale) };
    }
    case 'rider':
      return { id, picture: 'rider', kicker, title: L(q.title, locale), line: L(q.line, locale), caveat: estimateCaveat(locale) };
    case 'beside-me':
      return { id, picture: 'kerb', kicker, title: L(q.title, locale), line: L(q.line, locale), caveat: estimateCaveat(locale) };
    case 'mask':
      return { id, picture: 'mask', kicker, title: L(q.title, locale), line: L(q.line, locale), chip: 'official', caveat: L(illustration.tag, locale) };
    default:
      // 'how-much'
      return { id, picture: 'kerb', kicker, title: L(q.title, locale), line: L(q.line, locale), estimate: coAdd, caveat: estimateCaveat(locale) };
  }
}

/** The alt text of a card (brief 5.1): what it says, its caveat, and that the picture is an illustration. */
export function shareCardAlt(c: ShareCardContent, locale: Locale): string {
  const en = locale === 'en';
  const title = plain(c.title);
  const stop = /[？?。.！]$/.test(title) ? '' : en ? '.' : '。';
  const line = c.estimate ? `${c.line}${en ? ': ' : '：'}${c.estimate.text}${en ? ' (estimate)' : '（推估）'}${en ? '.' : '。'}` : c.line;
  const note = c.picture === 'kerb-electric' ? L(art.alt2.electric, locale) : c.picture === 'body' || c.picture === 'mask' || c.picture === 'smell' ? L(art.alt2.plain, locale) : L(illustration.altNote, locale);
  return fill(L(share.alt, locale), { title: `${title}${stop}`, line, caveat: c.caveat, note });
}

/** Paths under /public (pass through asset()) and the alt text for a card. */
export function shareCard(id: ShareCardId, locale: Locale): { wide: string; square: string; alt: string } {
  const c = shareCardContent(id, locale);
  return { wide: `/share/${dir(locale)}/${id}.png`, square: `/share/${dir(locale)}/${id}-sq.png`, alt: shareCardAlt(c, locale) };
}
