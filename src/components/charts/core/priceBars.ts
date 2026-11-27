/**
 * G12 — price bars (docs/redesign-brief.md 3.2 screen 12, 5.2).
 *
 * Two bars to one scale: what you pay for the 125 cc petrol scooter and for the electric one.
 * The part of the list price that comes off (subsidies, the maker's discounts, tax cuts) is
 * drawn as a dashed extension out to the list price, on whichever scooter has one. One bracket
 * between the bars carries the difference: green when the electric scooter costs less, ochre
 * when it costs more, ink when the two are within `sameBand` of each other.
 *
 * Pure: the same function draws at build time and redraws in the browser when the reader
 * changes county or the scrapping answer.
 *
 *   import { priceBarsFromCase, renderPriceBars } from '@/components/charts/core/priceBars';
 *   const html = renderPriceBars(priceBarsFromCase(buyCase('kaohsiung', 'no'), locale, plateName(c.plate, locale)));
 */
import { chartText, fill, yuan } from '../strings.ts';
import type { ChartTable } from './shared.ts';
import { esc, htmlChart, pc, type Loc } from './html.ts';

export interface PriceSide {
  /** the row's name: 「125cc 燃油機車・實付」. Defaults to the chart's own words */
  label?: string;
  /** the model, for the table and the text alternative: 「Jog 125（2026 年式，前後鼓煞）」 */
  name?: string;
  /** what the buyer pays, NT$ */
  net: number;
  /** the list price, NT$ (≥ net) */
  list: number;
  /** what the difference is made of, in words: 「補助」「車廠折扣和減稅」 (see offWords). Left out, the chart prints the amount only */
  offWhat?: string;
}

export interface PriceBarsProps {
  locale: Loc;
  petrol: PriceSide;
  electric: PriceSide;
  /** the electric scooter's plate class in words (綠牌 / green plate), for its default label */
  plate?: string;
  /** a difference up to this many NT$ reads "about the same" (home-money ABOUT_SAME_NTD) */
  sameBand?: number;
  /** print the data table toggle (default true) */
  table?: boolean;
}

export type PriceVerdict = 'cheaper' | 'about-same' | 'dearer';

/** electric.net − petrol.net and what it means, by the brief's 1,000 元 rule. */
export function priceVerdict(p: Pick<PriceBarsProps, 'petrol' | 'electric' | 'sameBand'>): { difference: number; verdict: PriceVerdict } {
  const difference = Math.round(p.electric.net - p.petrol.net);
  const band = p.sameBand ?? 1000;
  return { difference, verdict: difference <= -band ? 'cheaper' : difference > band ? 'dearer' : 'about-same' };
}

/** A minimal view of lane I's `MoneySide` / `BuyCase` (src/lib/home-money.ts): only what the bars read. */
export interface MoneySideLike {
  name: { 'zh-TW': string; en: string };
  listPrice: number;
  net: number;
  lines: { kind: string; amount: number }[];
}
export interface BuyCaseLike {
  electric: MoneySideLike;
  gasoline: MoneySideLike;
}

/**
 * What came off a list price, in words, from the kinds of its lines:
 * 補助 (subsidy, recycling, scrap-only) · 車廠折扣 (dealer) · 減稅 (tax).
 */
export function offWords(lines: { kind: string; amount: number }[], locale: Loc): string {
  const w = chartText.price.what;
  const has = (kinds: string[]) => lines.some((l) => l.amount > 0 && kinds.includes(l.kind));
  const parts = [has(['subsidy', 'recycling', 'scrap-only']) && w.subsidy[locale], has(['dealer']) && w.dealer[locale], has(['tax']) && w.tax[locale]].filter(Boolean) as string[];
  if (parts.length <= 1) return parts[0] ?? w.subsidy[locale];
  return parts.slice(0, -1).join(chartText.price.comma[locale]) + chartText.price.and[locale] + parts[parts.length - 1];
}

/** PriceBars props from one of lane I's buy cases. `plate` is plateName(case.plate, locale). */
export function priceBarsFromCase(c: BuyCaseLike, locale: Loc, plate?: string, extra: Partial<PriceBarsProps> = {}): PriceBarsProps {
  const side = (s: MoneySideLike): PriceSide => ({ name: s.name[locale], net: s.net, list: s.listPrice, offWhat: offWords(s.lines, locale) });
  return { locale, petrol: side(c.gasoline), electric: side(c.electric), plate, ...extra };
}

export const priceBarsTitle = (locale: Loc): string => chartText.price.title[locale];

const BAR = 28;

function bar(tone: 'exhaust' | 'clean', netPct: number, listPct: number, series: string): string {
  const off = listPct - netPct;
  // the dashed extension: what the list price was before the deductions
  const ext =
    off > 0.4
      ? `<rect class="hc-off hc-off--${tone} hc-p" data-mark="${series}-list" x="${pc(netPct)}" y="1.5" width="${pc(off)}" height="${BAR - 3}" rx="3"/>`
      : '';
  const solid = `<rect class="c-fill-${tone} hc-g" data-mark="${series}" x="0" y="0" width="${pc(netPct)}" height="${BAR}" rx="3"/><rect class="c-fill-${tone} hc-g" x="0" y="0" width="3" height="${BAR}"/>`;
  return `<svg class="hc-plot hc-plot--flush" width="100%" height="${BAR}" aria-hidden="true" focusable="false">${ext}${solid}<line class="hc-base" x1="0" x2="0" y1="-3" y2="${BAR + 3}"/></svg>`;
}

export function renderPriceBars(p: PriceBarsProps): string {
  const { locale } = p;
  const T = chartText.price;
  const { difference, verdict } = priceVerdict(p);
  const max = Math.max(p.petrol.list, p.electric.list, p.petrol.net, p.electric.net) || 1;
  const x = (v: number) => (v / max) * 100;
  const sides = [
    { key: 'petrol', tone: 'exhaust' as const, s: p.petrol, label: p.petrol.label ?? T.petrol[locale] },
    { key: 'electric', tone: 'clean' as const, s: p.electric, label: p.electric.label ?? (p.plate ? fill(T.electric, locale, { plate: p.plate }) : T.electric[locale].replace(/（\{plate\}）| \(\{plate\}\)/, '')) },
  ];
  const subOf = (s: PriceSide) => {
    const off = Math.round(s.list - s.net);
    if (off <= 0) return fill(T.listOnly, locale, { list: yuan(s.list, locale) });
    // without the words for what came off, the sentence does not guess: it gives the amount only
    return s.offWhat ? fill(T.listLess, locale, { list: yuan(s.list, locale), off: yuan(off, locale), what: s.offWhat }) : fill(T.listLessPlain, locale, { list: yuan(s.list, locale), off: yuan(off, locale) });
  };
  const head = (o: (typeof sides)[number]) =>
    `<div class="hc-row__head"><span class="hc-row__label">${esc(o.label)}</span><span class="hc-row__value">${esc(yuan(o.s.net, locale))}</span></div>` +
    `<p class="hc-row__sub">${o.s.list - o.s.net > 0 ? `<i class="hc-key hc-key--off hc-key--${o.tone}" aria-hidden="true"></i>` : ''}<span>${esc(subOf(o.s))}</span></p>`;

  // the bracket: a step from the end of the upper bar to the end of the lower one
  const a = x(Math.min(p.petrol.net, p.electric.net));
  const b = x(Math.max(p.petrol.net, p.electric.net));
  const pe = x(p.petrol.net);
  const el = x(p.electric.net);
  const abs = Math.abs(difference);
  const gapText = difference === 0 ? T.even[locale] : fill(verdict === 'about-same' ? T.same : difference < 0 ? T.less : T.more, locale, { n: yuan(abs, locale) });
  // the label sits on the roomier side of the bracket
  const left = a > 100 - b;
  const pos = left ? `margin-inline:0 calc(${pc(100 - a)} + 0.6rem);text-align:end` : `margin-inline:calc(${pc(b)} + 0.6rem) 0`;
  const gap =
    `<div class="hc-gap hc-gap--${verdict}"><svg class="hc-gap__svg" width="100%" height="100%" aria-hidden="true" focusable="false">` +
    `<line class="hc-bracket" x1="${pc(pe)}" x2="${pc(pe)}" y1="0" y2="50%"/><line class="hc-bracket" x1="${pc(el)}" x2="${pc(el)}" y1="50%" y2="100%"/>` +
    `<line class="hc-bracket" data-mark="difference" x1="${pc(a)}" x2="${pc(b)}" y1="50%" y2="50%"/></svg>` +
    `<p class="hc-gap__label" style="${pos}"><span>${esc(gapText)}</span></p></div>`;

  const body =
    `<div class="hc-price" data-verdict="${verdict}" data-difference="${difference}">` +
    `<div class="hc-row" data-series="petrol">${head(sides[0])}${bar('exhaust', x(p.petrol.net), x(p.petrol.list), 'petrol')}</div>` +
    gap +
    `<div class="hc-row" data-series="electric">${bar('clean', x(p.electric.net), x(p.electric.list), 'electric')}${head(sides[1])}</div>` +
    (p.petrol.list > p.petrol.net || p.electric.list > p.electric.net ? `<p class="hc-keyline"><i class="hc-key hc-key--off" aria-hidden="true"></i><span>${esc(T.key[locale])}</span></p>` : '') +
    `</div>`;

  const sumSide = (o: (typeof sides)[number]) => {
    const off = Math.round(o.s.list - o.s.net);
    const name = o.s.name ?? '';
    // a label that already names the model (「燃油機車：山葉 Jog 125」) keeps only its kind here, so the full name is said once
    const label = name ? o.label.split(/[:：]/)[0].trim() : o.label;
    const txt =
      off > 0
        ? fill(o.s.offWhat ? T.sumSide : T.sumSidePlain, locale, { label, name, list: yuan(o.s.list, locale), off: yuan(off, locale), what: o.s.offWhat ?? '', net: yuan(o.s.net, locale) })
        : fill(T.sumSideNoOff, locale, { label, name, net: yuan(o.s.net, locale) });
    // without a model name, drop the empty slot and its separator
    return name ? txt : txt.replace(/：，|: , /, locale === 'en' ? ': ' : '：');
  };
  const end = locale === 'en' ? '. ' : '。';
  const summary = `${sumSide(sides[0])}${locale === 'en' ? ' ' : ''}${sumSide(sides[1])}${locale === 'en' ? ' ' : ''}${gapText}${end.trim()}`;

  const short = (o: (typeof sides)[number]) => o.label.split(/[・:：]/)[0].trim();
  const table: ChartTable = {
    head: [T.tableWhat[locale], ...sides.map(short)],
    rows: [
      ...(sides.some((o) => o.s.name) ? [[T.tableModel[locale], ...sides.map((o) => o.s.name ?? '')]] : []),
      [T.tableList[locale], ...sides.map((o) => yuan(o.s.list, locale))],
      [T.tableOff[locale], ...sides.map((o) => yuan(Math.round(o.s.list - o.s.net), locale))],
      [T.tableNet[locale], ...sides.map((o) => yuan(o.s.net, locale))],
    ],
    caption: gapText,
  };
  return htmlChart({ summary, body, table: p.table === false ? undefined : table, title: T.title[locale], locale });
}
