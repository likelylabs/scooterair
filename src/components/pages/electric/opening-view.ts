// The opening of /electric/ as HTML strings (brief 7.7, in the form of home screens 12 and 13):
// the price on the day you buy, then what it costs each month. One set of functions, used twice:
// at build time (the page prints the default county, every scrapping answer, distance and
// charging answer as variants that work without JavaScript) and in the browser (the county
// select redraws the variants from the same table). Pure TypeScript: no imports, no DOM.
//
// Headline rules (brief 3.2, screens 12 and 13) are applied here, from the figures; the copy is
// open.* in src/i18n/pages/electric.ts, passed in already localised.

export type Verdict = 'cheaper' | 'about-same' | 'dearer';
export type Scrap = 'yes' | 'no';
export type Charge = 'yes' | 'no';
export type BeKind = 'cheaper-on-day' | 'pays-back' | 'not-in-ten-years' | 'petrol-catches-up';

/** One county × scrapping answer: the cheapest green-plate electric against the cheapest 125 cc petrol, by price paid. */
export interface OpenCase {
  /** electric: price paid, list price; petrol: price paid, list price (元) */
  e: number;
  el: number;
  g: number;
  gl: number;
  /** e − g (negative = electric cheaper) and the headline verdict (1,000 元 band) */
  d: number;
  v: Verdict;
  /** word ids: electric model, petrol model, plate name */
  en: number;
  gn: number;
  p: number;
  /** whether any subsidy or recycling line is counted */
  sub: boolean;
  /** [label word id, amount, 1 = "up to"] for each line off the list price */
  eLines: [number, number, 0 | 1][];
  gLines: [number, number, 0 | 1][];
  /** word id of the deadline strip for this case */
  strip: number;
}
export interface OpenBe {
  k: BeKind;
  m?: number;
  gap: number;
  save: number;
  /** word id of the home-charging scooter compared */
  n: number;
}
export interface OpenMonth {
  petrol: number;
  homeLo: number;
  homeHi: number;
  plan: number;
  payg: number;
}
export interface OpenTable {
  buy: Record<string, Record<Scrap, OpenCase>>;
  be: Record<string, Record<Scrap, Record<number, OpenBe>>>;
  month: Record<number, OpenMonth>;
  worst: { county: string; scrap: Scrap; plate: number; d: number };
  /** the day prices were checked, formatted */
  checked: string;
}
export interface OpenData {
  locale: 'zh-TW' | 'en';
  /** the build day (Taiwan) */
  built: string;
  defaults: { county: string; scrap: Scrap; km: number; charge: Charge };
  km: number[];
  counties: { id: string; name: string }[];
  /** each period's first day and the index of its table */
  periods: { from: string; t: number }[];
  tables: OpenTable[];
  words: string[];
}

/** The open.* strings, localised (see src/i18n/pages/electric.ts). */
export type OpenText = Record<string, string> & {
  [k: string]: string;
};

export interface OpenState {
  county: string;
  scrap: Scrap;
  km: number;
  charge: Charge;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

const FMT = { 'zh-TW': new Intl.NumberFormat('zh-TW'), en: new Intl.NumberFormat('en-GB') } as const;
/** 2,120 (the number alone) */
export const num = (loc: OpenData['locale'], n: number) => FMT[loc].format(Math.round(Math.abs(n)));
/** 2,120 元 / NT$2,120 */
export const yuan = (loc: OpenData['locale'], n: number) => (loc === 'en' ? `NT$${num(loc, n)}` : `${num(loc, n)} 元`);

/** The table true on `date` (YYYY-MM-DD); before the first period, the first. */
export function tableOn(d: OpenData, date: string): OpenTable {
  let t = d.periods[0].t;
  for (const p of d.periods) if (p.from <= date) t = p.t;
  return d.tables[t];
}

/** The nearest of the four distances (a home link carries one of them; anything else snaps). */
export const snapKm = (d: OpenData, km: number) => d.km.reduce((a, b) => (Math.abs(b - km) < Math.abs(a - km) ? b : a));

/** A model name without a trailing bracket that only repeats the plate: 「EZZY（綠牌）」 → 「EZZY」. */
export const shortName = (n: string) =>
  n
    .replace(/\s*[（(](綠牌|白牌|green plate|white plate)[)）]/g, '')
    .replace(/[，,]\s*(綠牌|白牌|green plate|white plate)/g, '')
    .trim();
/** Keep a figure and its unit, and a range, on one line: 「22 到 28 元」 never breaks inside. */
const glue = (s: string) => s.replace(/ /g, '\u00a0');

/** 新北市・有舊車可報廢・每月 300 公里 */
export function caseText(d: OpenData, T: OpenText, s: OpenState, withCharge = false): string {
  const name = d.counties.find((c) => c.id === s.county)?.name ?? s.county;
  const parts = [name, s.scrap === 'yes' ? T.caseScrapYes : T.caseScrapNo, fill(T.caseKm, { km: num(d.locale, s.km) })];
  if (withCharge) parts.push(s.charge === 'yes' ? T.caseChargeYes : T.caseChargeNo);
  return parts.join(d.locale === 'en' ? ', ' : '・');
}

// ---------------------------------------------------------------------------------------------
// the day you buy (home screen 12)

/** A headline whose '|' marks where it may break (each phrase stays whole in Chinese). */
export const headHtml = (text: string) =>
  text.includes('|')
    ? // Chinese phrases stay whole (.phrase, as ui/Phrased marks them); English wraps at its spaces
      `<h3 class="op-head op-head--phrased">${text.split('|').map((x) => `<span${/[\u4e00-\u9fff]/.test(text) ? ' class="phrase"' : ''}>${esc(x.trimEnd())}</span>${x.endsWith(' ') ? ' ' : ''}`).join('')}</h3>`
    : `<h3 class="op-head">${esc(text)}</h3>`;

/** Screen 12's headline rule, from the difference ('|' marks phrase breaks). */
export function buyHeadline(T: OpenText, c: OpenCase, scrap: Scrap): string {
  if (c.v === 'dearer') return T.headDearer;
  if (c.v === 'about-same') return c.sub ? T.headSame : T.headSameNoSub;
  if (!c.sub) return T.headCheaperNoSub;
  return scrap === 'yes' ? T.headCheaperScrap : T.headCheaper;
}

function bar(cls: string, label: string, paid: number, list: number, max: number, loc: OpenData['locale'], T: OpenText, showList: boolean) {
  const w = (v: number) => `${((100 * v) / max).toFixed(2)}%`;
  const off = list - paid;
  return `<div class="op-bar ${cls}">
<p class="op-bar__label">${esc(label)}</p>
<div class="op-bar__track" aria-hidden="true"><span class="op-bar__fill" style="inline-size:${w(paid)}"></span>${showList && off > 0 ? `<span class="op-bar__off" style="inline-size:${w(off)}"></span>` : ''}</div>
<p class="op-bar__value"><b>${esc(yuan(loc, paid))}</b>${showList && off > 0 ? ` <span>${esc(fill(T.barOff, { off: yuan(loc, off), list: yuan(loc, list) }))}</span>` : ''}</p>
</div>`;
}

/** The figure, the two bars, the body and the working, for one county and scrapping answer. */
export function buyHtml(d: OpenData, T: OpenText, t: OpenTable, county: string, scrap: Scrap): string {
  const loc = d.locale;
  const c = t.buy[county][scrap];
  const W = (i: number) => d.words[i];
  const cheaper = c.d < 0;
  const tone = c.v === 'cheaper' ? 'go' : c.v === 'dearer' ? 'dear' : 'even';
  const n = loc === 'en' ? `<b class="op-fig__n">NT$${esc(num(loc, c.d))}</b> ${esc(cheaper ? T.figLess : T.figMore)}` : `${esc(cheaper ? T.figLess : T.figMore)} <b class="op-fig__n">${esc(num(loc, c.d))}</b> 元`;
  const figure =
    c.d === 0
      ? `<p class="op-fig op-fig--even"><span class="op-fig__who">${esc(T.figWho)}</span><span class="op-fig__line">${esc(T.figSame)}</span></p>`
      : `<p class="op-fig op-fig--${tone}"><span class="op-fig__who">${esc(T.figWho)}</span><span class="op-fig__line">${n}</span></p>`;
  const max = Math.max(c.el, c.g);
  const bars = `<div class="op-bars" role="img" aria-label="${esc(fill(T.barsAlt, { petrol: yuan(loc, c.g), ev: yuan(loc, c.e), list: yuan(loc, c.el) }))}">
${bar('op-bar--petrol', T.barPetrol, c.g, c.gl, max, loc, T, false)}
${bar('op-bar--ev', fill(T.barEv, { plate: W(c.p) }), c.e, c.el, max, loc, T, true)}
</div>`;
  const w = t.worst;
  const worstName = d.counties.find((x) => x.id === w.county)?.name ?? w.county;
  const worst = w.d > 0 ? fill(T.worst, { scrap: w.scrap === 'yes' ? T.worstScrapYes : T.worstScrapNo, plate: d.words[w.plate], county: worstName, n: yuan(loc, w.d) }) : T.worstNone;
  const line = (l: [number, number, 0 | 1]) => `<li><span>${esc(W(l[0]))}${l[2] ? `<span class="op-upto">${esc(T.upTo)}</span>` : ''}</span><span class="op-amt">−${esc(yuan(loc, l[1]))}</span></li>`;
  const side = (title: string, model: string, list: number, lines: OpenCase['eLines'], paid: number) =>
    `<div class="op-work__side"><p class="op-work__title">${esc(title)}<span>${esc(model)}</span></p><ul class="op-work__lines"><li><span>${esc(T.workList)}</span><span class="op-amt">${esc(yuan(loc, list))}</span></li>${lines.map(line).join('')}${lines.length ? '' : `<li><span>${esc(T.workNone)}</span><span class="op-amt">−${esc(yuan(loc, 0))}</span></li>`}<li class="op-work__paid"><span>${esc(T.workPaid)}</span><span class="op-amt">${esc(yuan(loc, paid))}</span></li></ul></div>`;
  const working = `<details class="op-work"><summary>${esc(T.workSummary)}</summary><div class="op-work__body">${side(fill(T.barEv, { plate: W(c.p) }), W(c.en), c.el, c.eLines, c.e)}${side(T.barPetrol, W(c.gn), c.gl, c.gLines, c.g)}<p class="op-small">${esc(T.workNote)}</p></div></details>`;
  return `${headHtml(buyHeadline(T, c, scrap))}
${figure}
${bars}
<p class="op-body">${esc(fill(T.bodyClass, { model: shortName(W(c.en)) }))}${esc(worst)}</p>
${working}`;
}

// ---------------------------------------------------------------------------------------------
// each month (home screen 13)

/** Screen 13's headline, assembled from the figures ('|' marks phrase boundaries; strip them for plain text). */
export function monthHeadline(d: OpenData, T: OpenText, m: OpenMonth): string {
  const home = m.homeLo === m.homeHi ? fill(T.homeOne, { n: yuan(d.locale, m.homeLo) }) : fill(T.homeRange, { lo: d.locale === 'en' ? `NT$${num(d.locale, m.homeLo)}` : num(d.locale, m.homeLo), hi: yuan(d.locale, m.homeHi) });
  // Chinese keeps 「約 22 到 28 元」 whole; English breaks at its own spaces
  const g = d.locale === 'en' ? (x: string) => x : glue;
  return fill(T.monthHead, { home: g(home), petrol: g(yuan(d.locale, m.petrol)) });
}

export function monthHtml(d: OpenData, T: OpenText, t: OpenTable, km: number): string {
  const loc = d.locale;
  const m = t.month[km];
  const max = Math.max(m.petrol, m.homeHi, m.plan, m.payg);
  const w = (v: number) => `${Math.max(0.8, (100 * v) / max).toFixed(2)}%`;
  const row = (cls: string, label: string, v: number, text: string, extra = '') =>
    `<div class="op-mbar ${cls}"><p class="op-mbar__label">${esc(label)}</p><div class="op-mbar__track" aria-hidden="true"><span class="op-mbar__fill" style="inline-size:${w(v)}"></span>${extra}</div><p class="op-mbar__value"><b>${esc(text)}</b></p></div>`;
  const homeText = m.homeLo === m.homeHi ? yuan(loc, m.homeLo) : fill(T.rangeShort, { lo: loc === 'en' ? `NT$${num(loc, m.homeLo)}` : num(loc, m.homeLo), hi: yuan(loc, m.homeHi) });
  const homeExtra = m.homeHi > m.homeLo ? `<span class="op-mbar__more" style="inline-size:${((100 * (m.homeHi - m.homeLo)) / max).toFixed(2)}%"></span>` : '';
  return `${headHtml(monthHeadline(d, T, m))}
<div class="op-mbars" role="img" aria-label="${esc(fill(T.monthAlt, { km: num(loc, km), petrol: yuan(loc, m.petrol), home: homeText, plan: yuan(loc, m.plan), payg: yuan(loc, m.payg) }))}">
${row('op-mbar--petrol', T.mPetrol, m.petrol, yuan(loc, m.petrol))}
${row('op-mbar--home', T.mHome, m.homeLo, homeText, homeExtra)}
<p class="op-divider">${esc(T.mDivider)}</p>
${row('op-mbar--thin', T.mPlan, m.plan, yuan(loc, m.plan))}
${row('op-mbar--thin', T.mPayg, m.payg, yuan(loc, m.payg))}
</div>
<p class="op-small">${esc(fill(T.monthNote, { km: num(loc, km) }))}</p>`;
}

/** The line under the bars (screen 13's rule), for one county, scrapping answer, distance and charging answer. */
export function monthLine(d: OpenData, T: OpenText, t: OpenTable, s: OpenState): string {
  const loc = d.locale;
  const m = t.month[s.km];
  if (s.charge === 'no') {
    const swap = Math.min(m.plan, m.payg);
    const diff = swap - m.petrol;
    return fill(diff > 0 ? T.swapDearer : T.swapCheaper, { n: yuan(loc, swap), diff: yuan(loc, diff) });
  }
  const b = t.be[s.county][s.scrap][s.km];
  const model = d.words[b.n];
  const tpl = b.k === 'cheaper-on-day' ? T.beCheaper : b.k === 'pays-back' ? T.bePays : b.k === 'petrol-catches-up' ? T.beCatch : T.beNever;
  return fill(tpl, { model, save: yuan(loc, b.save), gap: yuan(loc, b.gap), m: b.m ?? 0 });
}
