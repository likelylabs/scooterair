// The two money screens of the home page (docs/redesign-brief.md 3.2, screens 13 and 14 after
// amendment 12.2) as text and HTML, from the calculator's own tables.
//
// One set of functions, used twice: at build time (the page prints the default case: 新北市, a
// scooter to scrap, 300 km a month) and in the browser (./home.client.ts redraws when the
// reader picks a county, a scrapping answer or a distance). Pure TypeScript, no DOM.
//
// THE FIGURES ARE LANE I'S. `OpenData` is the table behind the opening of /electric/
// (src/components/pages/electric/opening-data.ts, built from src/lib/home-money.ts, i.e. the
// calculator engine), one table per period on which a sum changes. The headline rules of
// screens 13 and 14 are lane I's `buyHeadline`, `monthHeadline` and `monthLine`, so the home
// page and /electric/ can never word the same case differently. Nothing here types a figure.

import { buyHeadline, monthLine, num, yuan, type OpenCase, type OpenData, type OpenMonth, type OpenTable, type OpenText, type Scrap } from '../electric/opening-view.ts';
import type { MonthlyBarsProps } from '../../charts/core/monthlyBars.ts';
import type { PriceBarsProps } from '../../charts/core/priceBars.ts';

/** What the reader chose on screens 13 and 14. */
export interface HomeChoice {
  county: string;
  scrap: Scrap;
  km: number;
}

/** The home page's own words for these two screens (home.ts → s13, s14, common), localised. */
export interface HomeMoneyText {
  bodyClass: string;
  bodyKm: string;
  swapDearer: string;
  swapCheaper: string;
  sheetElectric: string;
  sheetPetrol: string;
  sheetList: string;
  sheetPaid: string;
  sheetNone: string;
  sheetUpTo: string;
  /** before the big figure: 電動機車 (少付 2,120 元) */
  figWho: string;
  /** 價格和補助 11 月 25 日查: the day the prices were checked, already filled in */
  checked: string;
  /** screen 14's headline: 在家充電|{home}，|加油約 {petrol} */
  monthHead: string;
}

/** Everything the browser needs, printed once as JSON. */
export interface HomeMoneyPayload {
  D: OpenData;
  /** lane I's open.* strings (the rule-chosen headlines and sentences) */
  T: OpenText;
  H: HomeMoneyText;
  /** the calculator's address in this language, without a query */
  calc: string;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));
/** Two sentences side by side: no space in Chinese, one in English. */
const join = (loc: OpenData['locale'], ...s: string[]) => s.filter(Boolean).map((x) => x.trim()).join(loc === 'en' ? ' ' : '');

/** A headline's phrases as ui/Phrased.astro prints them ('|' marks where a line may break). */
export function phrasedHtml(text: string): string {
  const parts = text.split('|');
  return parts
    .map((p, i) => {
      const spaceAfter = /\s$/.test(p) || (i < parts.length - 1 && /^\s/.test(parts[i + 1]));
      return `<span class="phrase">${esc(p.trim())}</span>${spaceAfter ? ' ' : ''}`;
    })
    .join('');
}

/**
 * A headline's phrase marks for its language. Chinese keeps them (it has no spaces to break at).
 * English drops them: it breaks between words by itself, and a long English phrase kept whole
 * would take a line of its own (each phrase is an inline block).
 */
export const headlineMarks = (text: string, locale: string): string => (locale === 'en' ? text.replace(/\s*\|\s*/g, (m) => (/\s/.test(m) ? ' ' : '')) : text);

export const caseOf =(t: OpenTable, c: HomeChoice): OpenCase => {
  const row = t.buy[c.county]?.[c.scrap];
  if (!row) throw new Error(`home money: no price for ${c.county} / ${c.scrap}`);
  return row;
};
export const monthOf = (t: OpenTable, km: number): OpenMonth => {
  const m = t.month[km];
  if (!m) throw new Error(`home money: no monthly cost at ${km} km`);
  return m;
};

// ---------------------------------------------------------------------------------------------
// screen 13 · the day you buy

/** The headline, chosen by rule from the difference (brief 3.2): '|' marks the phrases. */
export const buyHead = (p: Pick<HomeMoneyPayload, 'T'>, t: OpenTable, c: HomeChoice): string => buyHeadline(p.T, caseOf(t, c), c.scrap);

/** 少付 2,120 元 in green, 多付 N 元 in ochre: the reader's own figure. */
export function figureHtml(p: Pick<HomeMoneyPayload, 'D' | 'T' | 'H'>, t: OpenTable, c: HomeChoice): string {
  const { D, T } = p;
  const x = caseOf(t, c);
  const who = `<span class="h-fig__who">${esc(p.H.figWho)}</span>`;
  if (x.d === 0) return `${who}<span class="h-fig__line h-fig__line--even"><span class="h-fig__word">${esc(T.figSame)}</span></span>`;
  const less = x.d < 0;
  const n = `<b class="h-fig__n">${esc(num(D.locale, x.d))}</b>`;
  const word = `<span class="h-fig__word">${esc(less ? T.figLess : T.figMore)}</span>`;
  const line = D.locale === 'en' ? `<span class="h-fig__unit">NT$</span>${n} ${word}` : `${word} ${n} <span class="h-fig__unit">元</span>`;
  return `${who}<span class="h-fig__line h-fig__line--${less ? 'go' : 'dear'}">${line}</span>`;
}

/** The body: what kind of scooter this is, then the least favourable case in the table, whatever the reader chose. */
export function buyBody(p: HomeMoneyPayload, t: OpenTable): string {
  const { D, T, H } = p;
  const w = t.worst;
  const county = D.counties.find((x) => x.id === w.county)?.name ?? w.county;
  const worst = w.d > 0 ? fill(T.worst, { scrap: w.scrap === 'yes' ? T.worstScrapYes : T.worstScrapNo, plate: D.words[w.plate], county, n: yuan(D.locale, w.d) }) : T.worstNone;
  return join(D.locale, H.bodyClass, worst);
}

/** The deadline strip of the reader's case (brief 7.7). */
export const stripOf = (p: Pick<HomeMoneyPayload, 'D'>, t: OpenTable, c: HomeChoice): string => p.D.words[caseOf(t, c).strip];

/** 價格和補助 11 月 25 日查 */
export const checkedText = (p: Pick<HomeMoneyPayload, 'H'>): string => p.H.checked;

/** G12's two sides, for lane D's renderPriceBars(). */
export function priceBarsProps(p: Pick<HomeMoneyPayload, 'D'>, t: OpenTable, c: HomeChoice): PriceBarsProps {
  const { D } = p;
  const x = caseOf(t, c);
  return {
    locale: D.locale,
    plate: D.words[x.p],
    petrol: { net: x.g, list: x.gl, name: D.words[x.gn] },
    electric: { net: x.e, list: x.el, name: D.words[x.en] },
    table: false,
  };
}

/** The sheet's working: list price, each line that comes off, the price paid, for both scooters. */
export function buyLinesHtml(p: HomeMoneyPayload, t: OpenTable, c: HomeChoice): string {
  const { D, H } = p;
  const x = caseOf(t, c);
  const W = (i: number) => D.words[i];
  const row = (label: string, amount: string, cls = '') => `<li${cls ? ` class="${cls}"` : ''}><span>${label}</span><span class="h-work__amt">${amount}</span></li>`;
  const side = (title: string, model: string, list: number, lines: OpenCase['eLines'], paid: number) =>
    `<div class="h-work__side"><p class="h-work__title">${esc(title)}<span>${esc(model)}</span></p><ul class="h-work__lines">${row(esc(H.sheetList), esc(yuan(D.locale, list)))}${
      lines.length ? lines.map((l) => row(`${esc(W(l[0]))}${l[2] ? esc(H.sheetUpTo) : ''}`, `−${esc(yuan(D.locale, l[1]))}`)).join('') : row(esc(H.sheetNone), `−${esc(yuan(D.locale, 0))}`)
    }${row(esc(H.sheetPaid), esc(yuan(D.locale, paid)), 'h-work__paid')}</ul></div>`;
  return side(fill(H.sheetElectric, { plate: W(x.p) }), W(x.en), x.el, x.eLines, x.e) + side(H.sheetPetrol, W(x.gn), x.gl, x.gLines, x.g);
}

// ---------------------------------------------------------------------------------------------
// screen 14 · each month

/**
 * The headline, assembled from the figures: '|' marks the phrases. The amounts are worded with
 * lane I's own strings (約 22 到 28 元 / about NT$22 to 28), so both pages print them alike.
 */
export function monthHead(p: Pick<HomeMoneyPayload, 'D' | 'T' | 'H'>, t: OpenTable, km: number): string {
  const { D, T, H } = p;
  const m = monthOf(t, km);
  const en = D.locale === 'en';
  const home = m.homeLo === m.homeHi ? fill(T.homeOne, { n: yuan(D.locale, m.homeLo) }) : fill(T.homeRange, { lo: en ? `NT$${num(D.locale, m.homeLo)}` : num(D.locale, m.homeLo), hi: yuan(D.locale, m.homeHi) });
  // Chinese keeps 「約 22 到 28 元」 whole on its line; English breaks at its own spaces
  const glue = (x: string) => (en ? x : x.replace(/ /g, '\u00a0'));
  return fill(H.monthHead, { home: glue(home), petrol: glue(yuan(D.locale, m.petrol)) });
}

/** The body: the distance, then the battery-swap sentence chosen by rule (cheapest way to swap against the petrol bill). */
export function monthBody(p: HomeMoneyPayload, t: OpenTable, km: number): string {
  const { D, H } = p;
  const m = monthOf(t, km);
  const swap = Math.min(m.plan, m.payg);
  return join(D.locale, fill(H.bodyKm, { km: num(D.locale, km) }), fill(swap > m.petrol ? H.swapDearer : H.swapCheaper, { n: yuan(D.locale, swap) }));
}

/** The line under the bars, chosen by rule from the break-even of the cheapest scooter that charges at home. */
export const monthUnder = (p: Pick<HomeMoneyPayload, 'D' | 'T'>, t: OpenTable, c: HomeChoice): string => monthLine(p.D, p.T, t, { ...c, charge: 'yes' });

/** G13's four bars, for lane D's renderMonthlyBars(). */
export function monthlyBarsProps(p: Pick<HomeMoneyPayload, 'D'>, t: OpenTable, km: number): MonthlyBarsProps {
  const m = monthOf(t, km);
  return { locale: p.D.locale, km, petrol: m.petrol, home: { lo: m.homeLo, hi: m.homeHi }, swapPlan: m.plan, swapPayg: m.payg, table: false };
}

// ---------------------------------------------------------------------------------------------
// the hand-off to the calculator (lane I's contract, section 8)

/** /electric/?county=…&scrap=…&km=… — the calculator opens on this case and says 「你在首頁選的」. */
export const calcHref = (calc: string, c: HomeChoice): string => `${calc}?county=${encodeURIComponent(c.county)}&scrap=${c.scrap}&km=${c.km}`;

/** A stored or typed choice, made safe: an unknown county, answer or distance falls back to the default. */
export function cleanChoice(D: OpenData, raw: Partial<Record<keyof HomeChoice, unknown>> | null | undefined): HomeChoice {
  const d = D.defaults;
  const county = typeof raw?.county === 'string' && D.counties.some((x) => x.id === raw.county) ? raw.county : d.county;
  const scrap: Scrap = raw?.scrap === 'yes' || raw?.scrap === 'no' ? raw.scrap : d.scrap;
  const km = D.km.includes(Number(raw?.km)) ? Number(raw?.km) : d.km;
  return { county, scrap, km };
}
