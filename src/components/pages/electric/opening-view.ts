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
  /** word ids: the same two scooters in short, maker first (「Gogoro EZZY」「山葉 Jog 125」), for the bars */
  es: number;
  gs: number;
  p: number;
  /** whether any subsidy or recycling line is counted */
  sub: boolean;
  /** 1 = the electric model can only swap batteries (it needs a monthly battery plan) */
  sw: 0 | 1;
  /** [label word id, amount, 1 = "up to"] for each line off the list price */
  eLines: [number, number, 0 | 1][];
  gLines: [number, number, 0 | 1][];
  /** word id of the deadline strip for this case */
  strip: number;
  /** home screen 13: word ids of the strip's on-screen part and of the part moved into its sheet ('' when none) */
  ss: number;
  sf: number;
  /**
   * Which battery-swap plans the month card shows for this case: an index into OpenTable.swap
   * (the plans THIS scooter can use), or -1 when the scooter charges at home (the card then shows
   * the cheapest swap plans of any make, each named with its scooter).
   */
  sm: number;
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
  /** word ids: "scooter · plan" of the cheapest monthly plan and of the cheapest pay-as-you-go plan */
  planN: number;
  paygN: number;
}
/** One scooter's own cheapest swap plans at one distance: [元 a month, word id of "scooter · plan"]; null when its make has none of that kind. */
export interface OpenSwap {
  plan: [number, number] | null;
  payg: [number, number] | null;
}
export interface OpenTable {
  buy: Record<string, Record<Scrap, OpenCase>>;
  /** Per swap-only scooter shown in `buy` (OpenCase.sm): its own cheapest plans at each distance. */
  swap: { id: string; km: Record<number, OpenSwap> }[];
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
/**
 * A scooter's short name, maker first, for a bar label: 「Gogoro EZZY」
 * 「Ionex CoolOne」「Yamaha Jog 125」
 * 「光陽新豪邁125」 (no space between Han words). The maker is cut to its last Latin word when it has one
 * (「Gogoro睿能」→ Gogoro, 「KYMCO Ionex」→ Ionex); the name loses its bracket, anything after a
 * comma and a trailing brake, plate or version word. The full name stays in the working.
 */
export function shortModel(brand: string, name: string): string {
  const latin = brand.match(/[A-Za-z][A-Za-z0-9-]*/g);
  const b = latin ? latin[latin.length - 1] : brand.trim();
  let n = name.split(/[（(，,]/)[0].trim();
  for (let prev = ''; prev !== n; ) {
    prev = n;
    n = n.replace(/\s*(鼓煞|碟煞|綠牌|白牌|換電版|swap version|green plate|white plate)$/i, '').trim();
  }
  if (n.toLowerCase().startsWith(b.toLowerCase())) return n;
  // 「光陽新豪邁125」 (Chinese sets no space between Han words); 「山葉 Jog 125」 keeps its space
  return /[\u4e00-\u9fff]$/.test(b) && /^[\u4e00-\u9fff]/.test(n) ? `${b}${n}` : `${b} ${n}`;
}

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

/** 「燃油機車：山葉 Jog 125」 / 「Petrol scooter: Yamaha Jog 125」 */
const barLabel = (loc: OpenData['locale'], kind: string, short: string) => `${kind}${loc === 'en' ? ': ' : '：'}${short}`;

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
${bar('op-bar--petrol', barLabel(loc, T.barPetrolShort, W(c.gs)), c.g, c.gl, max, loc, T, false)}
${bar('op-bar--ev', barLabel(loc, fill(T.barEvShort, { plate: W(c.p) }), W(c.es)), c.e, c.el, max, loc, T, true)}
</div>`;
  const other = t.buy[county][scrap === 'yes' ? 'no' : 'yes'];
  const sideOf = (x: OpenCase): ScrapSide => ({ ev: { short: W(x.es), net: x.e }, gas: { short: W(x.gs), net: x.g } });
  const notes = scrapNotesHtml(scrapNotes(T, scrap, sideOf(scrap === 'yes' ? c : other), sideOf(scrap === 'yes' ? other : c), loc), loc);
  const line = (l: [number, number, 0 | 1]) => `<li><span>${esc(W(l[0]))}${l[2] ? `<span class="op-upto">${esc(T.upTo)}</span>` : ''}</span><span class="op-amt">−${esc(yuan(loc, l[1]))}</span></li>`;
  const side = (title: string, model: string, list: number, lines: OpenCase['eLines'], paid: number) =>
    `<div class="op-work__side"><p class="op-work__title">${esc(title)}<span>${esc(model)}</span></p><ul class="op-work__lines"><li><span>${esc(T.workList)}</span><span class="op-amt">${esc(yuan(loc, list))}</span></li>${lines.map(line).join('')}${lines.length ? '' : `<li><span>${esc(T.workNone)}</span><span class="op-amt">−${esc(yuan(loc, 0))}</span></li>`}<li class="op-work__paid"><span>${esc(T.workPaid)}</span><span class="op-amt">${esc(yuan(loc, paid))}</span></li></ul></div>`;
  const working = `<details class="op-work"><summary>${esc(T.workSummary)}</summary><div class="op-work__body">${side(fill(T.barEv, { plate: W(c.p) }), W(c.en), c.el, c.eLines, c.e)}${side(T.barPetrol, W(c.gn), c.gl, c.gLines, c.g)}<p class="op-small">${esc(T.workNote)}</p></div></details>`;
  // tells the month card which scooter's swap plans to show (CSS in ElectricOpening.astro)
  return `<span class="op-sm" data-op-shows="${c.sm}" hidden></span>${headHtml(buyHeadline(T, c, scrap))}
${figure}
${bars}
${notes}
<p class="op-body">${esc(fill(T.bodyClass, { model: W(c.es) }))}${c.sw ? esc(T.swapOnly) : ''}</p>
${working}
${worstFoldHtml(worstText(d, T, t), T)}`;
}

/** One side of a buy answer, as the scrap note reads it: the scooter (short name) and its price paid. */
export interface ScrapSide {
  ev: { short: string; net: number };
  gas: { short: string; net: number };
}

/**
 * What scrapping does, from the same county's two answers (the figures are the engine's prices
 * paid; nothing is added):
 *   1. the cheapest price on each side before and after scrapping (「從 49,812 元降到 44,580 元」).
 *      A drop from one price to another is true even when the cheapest model changes, which
 *      "N off this scooter" would not be; and it never reads as a second electric-versus-petrol
 *      gap beside the big figure. When petrol drops more, it says so and that the gap narrows;
 *   2. when the cheapest scooter is a different model in the two answers, which one it is in the
 *      other answer, and why (each model's scrapping deals differ).
 * On 「沒有」 it says what the cheapest prices and models would be with a scooter to scrap.
 * Empty when scrapping saves nothing on the electric side (the note would only confuse).
 */
export function scrapNotes(T: OpenText, scrap: Scrap, yes: ScrapSide, no: ScrapSide, loc: OpenData['locale']): string[] {
  const { save, change } = scrapNoteParts(T, scrap, yes, no, loc);
  return [save, change].filter((x): x is string => !!x);
}

/** The scrap note's two sentences apart (home screen 13 shows the first and keeps the second in its sheet). */
export function scrapNoteParts(T: OpenText, scrap: Scrap, yes: ScrapSide, no: ScrapSide, loc: OpenData['locale']): { save: string | null; change: string | null } {
  const out: { save: string | null; change: string | null } = { save: null, change: null };
  const ev = no.ev.net - yes.ev.net;
  const gas = no.gas.net - yes.gas.net;
  const y = (n: number) => glue(yuan(loc, n));
  // each figure with its unit: the price with nothing to scrap is named as such (「沒有機車可報廢時…49,812 元」)
  const v = { e0: y(no.ev.net), e1: y(yes.ev.net), g0: y(no.gas.net), g1: y(yes.gas.net) };
  if (ev > 0) {
    const tpl = scrap === 'yes' ? (gas > ev ? T.scrapSaveYesMore : gas > 0 ? T.scrapSaveYes : T.scrapSaveYesEv) : gas > 0 ? T.scrapSaveNo : T.scrapSaveNoEv;
    out.save = fill(tpl, v);
  }
  const evChanged = yes.ev.short !== no.ev.short;
  const gasChanged = yes.gas.short !== no.gas.short;
  if (evChanged || gasChanged) {
    // the other answer's scooters: the reader sees this answer's on the bars
    const other = scrap === 'yes' ? no : yes;
    const key = `change${scrap === 'yes' ? 'Yes' : 'No'}${evChanged && gasChanged ? 'Both' : evChanged ? 'Ev' : 'Gas'}`;
    // a name keeps its maker on one line
    out.change = fill(T[key], { ev: glue(other.ev.short), gas: glue(other.gas.short) });
  }
  // 「是 光陽新豪邁125」 → 「是光陽新豪邁125」: a space stays only beside Latin letters and digits
  const tidy = (x: string | null) => (x === null || loc === 'en' ? x : x.replace(/([\u4e00-\u9fff]) (?=[\u4e00-\u9fff])/g, '$1'));
  return { save: tidy(out.save), change: tidy(out.change) };
}

/** The scrap note as HTML (one paragraph; empty string when there is nothing to say). */
export const scrapNotesHtml = (lines: string[], loc: OpenData['locale'], cls = 'op-scrap'): string => (lines.length ? `<p class="${cls}">${lines.map(esc).join(loc === 'en' ? ' ' : '')}</p>` : '');

/**
 * The least favourable case of the table, folded behind one plain line (「有時候電動機車比較貴」):
 * it is another place's case, so it is never printed as if it were about the reader's answer.
 */
export function worstFoldHtml(text: string, T: OpenText, cls = 'op-worst'): string {
  // one inner span: the summary is a flex row, and the page's word-gluing spans must not each become a flex item
  // when no case in the table is dearer, the line says so plainly: a summary 「有時候電動機車比較貴」 would be false
  if (text === T.worstNone) return `<p class="${cls} ${cls}--none">${esc(text)}</p>`;
  return `<details class="${cls}"><summary><span>${esc(T.worstSummary)}</span></summary><p>${esc(text)}</p></details>`;
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

/** The swap rows of a month card: the scooter's own plans (group ≥ 0) or the cheapest of any make (−1). */
export function swapOf(t: OpenTable, group: number, km: number): OpenSwap {
  if (group >= 0) return t.swap[group].km[km];
  const m = t.month[km];
  return { plan: [m.plan, m.planN], payg: [m.payg, m.paygN] };
}

/** The swap group of a county and scrapping answer (see OpenCase.sm). */
export const swapGroup = (t: OpenTable, county: string, scrap: Scrap): number => t.buy[county]?.[scrap]?.sm ?? -1;

/**
 * Each month: the headline, then one set of bars per swap group (−1 and every index of t.swap);
 * the page shows the set whose group matches the scooter of the buy card on show (CSS reads the
 * buy card's `data-op-shows`), so the battery-swap rows are always plans that scooter can use.
 */
export function monthHtml(d: OpenData, T: OpenText, t: OpenTable, km: number): string {
  const loc = d.locale;
  const m = t.month[km];
  const sep = loc === 'en' ? '; ' : '；';
  const row = (cls: string, label: string, v: number, text: string, max: number, extra = '', sub = '') =>
    `<div class="op-mbar ${cls}"><p class="op-mbar__label">${esc(label)}${sub ? `<span class="op-mbar__sub">${esc(sub)}</span>` : ''}</p><div class="op-mbar__track" aria-hidden="true"><span class="op-mbar__fill" style="inline-size:${Math.max(0.8, (100 * v) / max).toFixed(2)}%"></span>${extra}</div><p class="op-mbar__value"><b>${esc(text)}</b></p></div>`;
  const homeText = m.homeLo === m.homeHi ? yuan(loc, m.homeLo) : fill(T.rangeShort, { lo: loc === 'en' ? `NT$${num(loc, m.homeLo)}` : num(loc, m.homeLo), hi: yuan(loc, m.homeHi) });
  const groups = [-1, ...t.swap.map((_, i) => i)];
  const sets = groups.map((g) => {
    const sw = swapOf(t, g, km);
    const max = Math.max(m.petrol, m.homeHi, sw.plan?.[0] ?? 0, sw.payg?.[0] ?? 0);
    const homeExtra = m.homeHi > m.homeLo ? `<span class="op-mbar__more" style="inline-size:${((100 * (m.homeHi - m.homeLo)) / max).toFixed(2)}%"></span>` : '';
    const swaps = [
      sw.plan && { label: g >= 0 ? T.mPlan : T.mPlanAny, v: sw.plan[0], n: d.words[sw.plan[1]] },
      sw.payg && { label: g >= 0 ? T.mPayg : T.mPaygAny, v: sw.payg[0], n: d.words[sw.payg[1]] },
    ].filter((x): x is { label: string; v: number; n: string } => !!x);
    // the alt names every bar with its own label, and each swap row with its scooter and plan
    const alt =
      `${fill(T.caseKm, { km: num(loc, km) })}${loc === 'en' ? ': ' : '：'}` +
      [`${T.mPetrol} ${yuan(loc, m.petrol)}`, `${T.mHome} ${homeText}`, ...swaps.map((x) => `${x.label}${loc === 'en' ? ` (${x.n})` : `（${x.n}）`} ${yuan(loc, x.v)}`)].join(sep) +
      (loc === 'en' ? '.' : '。');
    return `<div class="op-mbars op-swap" data-op-sm="${g}" role="img" aria-label="${esc(alt)}">
${row('op-mbar--petrol', T.mPetrol, m.petrol, yuan(loc, m.petrol), max)}
${row('op-mbar--home', T.mHome, m.homeLo, homeText, max, homeExtra)}
<p class="op-divider">${esc(T.mDivider)}</p>
${swaps.map((x) => row('op-mbar--swap', x.label, x.v, yuan(loc, x.v), max, '', x.n)).join('\n')}
</div>`;
  });
  return `${headHtml(monthHeadline(d, T, m))}
${sets.join('\n')}
<p class="op-small">${esc(fill(T.monthNote, { km: num(loc, km) }))}</p>`;
}

/** The line under the bars (screen 13's rule), for one county, scrapping answer, distance and charging answer. */
export function monthLine(d: OpenData, T: OpenText, t: OpenTable, s: OpenState): string {
  const loc = d.locale;
  const m = t.month[s.km];
  if (s.charge === 'no') {
    // the scooter on show: its own cheapest way to swap (or, for a home-charging scooter, any make's)
    const sw = swapOf(t, swapGroup(t, s.county, s.scrap), s.km);
    const swap = Math.min(...[sw.plan?.[0], sw.payg?.[0]].filter((x): x is number => x !== undefined));
    const diff = swap - m.petrol;
    return fill(diff > 0 ? T.swapDearer : T.swapCheaper, { n: yuan(loc, swap), diff: yuan(loc, diff) });
  }
  const b = t.be[s.county][s.scrap][s.km];
  const model = d.words[b.n];
  const tpl = b.k === 'cheaper-on-day' ? T.beCheaper : b.k === 'pays-back' ? T.bePays : b.k === 'petrol-catches-up' ? T.beCatch : T.beNever;
  return fill(tpl, { model, save: yuan(loc, b.save), gap: yuan(loc, b.gap), m: b.m ?? 0 });
}

// ---------------------------------------------------------------------------------------------
// the three answers (買的那天差多少 / 每個月差多少 / 幾年打平), one generator for the opening and
// the calculator's result, so the same answers print the same figures in both places. The figures
// are the calculator's own (model.ts ansOf(): choose() + evaluate() + classify()).

export type AnsKind = 'parity' | 'month' | 'b' | 'c' | 'c-slow' | 'c-briefly';
export interface Ans {
  /** electric − petrol on the day of purchase (元), a battery setup fee paid that day included */
  day: number;
  /** electric − petrol price paid (元), and the setup fee in `day` (0 = none) */
  car: number;
  fee: number;
  /** name: the full model name (the working); short: maker and model (the bars and the sentences, shortModel()) */
  ev: { name: string; short: string; net: number; list: number; plate: 'light' | 'heavy' | 'small'; swap: 0 | 1 };
  gas: { name: string; short: string; net: number; list: number };
  /** [label, amount, 1 = "up to"] taken off each side's list price */
  eLines: [string, number, 0 | 1][];
  gLines: [string, number, 0 | 1][];
  /** the battery plan's name ('' when charged at home) */
  plan: string;
  /** electric − petrol average monthly running cost over the horizon (元): the one monthly answer */
  avg: number;
  /** its parts: the monthly difference now, and after a new-scooter discount ends (null: none) */
  now: number;
  later: number | null;
  until: number;
  /** horizon in months (the chart's span) */
  h: number;
  kind: AnsKind;
  /** the month the totals cross (month, b with petrol catching up, c-briefly) */
  month?: number;
  /** 1 when petrol catches up (kind b) */
  catchUp?: 0 | 1;
  /** c-slow: the monthly distance from which it would even out over the horizon (null: none) */
  evenKm?: number | null;
  /** c-briefly: electric − petrol at the end of the horizon */
  gapH?: number;
}

/** 2,120 元 with a no-break space / NT$2,120: a figure never parts from its unit */
export const yuanNb = (loc: OpenData['locale'], n: number) => (loc === 'en' ? `NT$${num(loc, n)}` : `${num(loc, n)} 元`);

/** 「燃油的 山葉」 → 「燃油的山葉」: a space stays only beside Latin letters and digits */
const hanSpace = (x: string) => x.replace(/([一-鿿）」])[ ](?=[一-鿿（「])/g, '$1');

const yearsWords = (loc: OpenData['locale'], T: OpenText, months: number): string => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return '';
  const t = m === 0 ? fill(T.ansYears, { y }) : fill(T.ansYearsMonths, { y, m });
  return loc === 'en' ? t.replace(/\b1 years\b/, '1 year').replace(/\b1 months\b/, '1 month') : t;
};
/** 五年 / five years */
const horizonWords = (loc: OpenData['locale'], h: number): string => {
  const zh = ['', '一', '兩', '三', '四', '五', '六', '七', '八', '九', '十'];
  const en = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  if (h % 12 === 0 && h / 12 <= 10) return loc === 'en' ? `${en[h / 12]} year${h === 12 ? '' : 's'}` : `${zh[h / 12]}年`;
  return loc === 'en' ? `${h} months` : `${h} 個月`;
};

/** The headline figure of an answer: 「少付 <b>2,120</b> 元」 / 「<b>NT$2,120</b> less」. */
function figHtml(loc: OpenData['locale'], tpl: string, n: number): string {
  const b = loc === 'en' ? `<b class="ans-q__n">NT$${esc(num(loc, n))}</b>` : `<b class="ans-q__n">${esc(num(loc, n))}</b> 元`;
  const [a, z] = tpl.split('{n}');
  return `${esc(a)}${b}${esc(z ?? '')}`;
}

export interface AnsParts {
  day: { head: string; tone: 'go' | 'dear' | 'even'; parts: string[] };
  month: { head: string; tone: 'go' | 'dear' | 'even'; parts: string[] };
  pay: { head: string; tone: 'go' | 'dear' | 'even'; parts: string[] };
}

/** The three answers as words: each a headline (with {n} where its figure goes) and its labelled parts. */
export function ansParts(loc: OpenData['locale'], T: OpenText, a: Ans): AnsParts & { figs: { day: number; month: number } } {
  const Y = (n: number) => yuanNb(loc, n);
  const H = horizonWords(loc, a.h);
  // 1. the day you buy
  const dayHead = a.day < 0 ? T.ansDayLess : a.day > 0 ? T.ansDayMore : T.ansDaySame;
  const dayParts = [fill(T.ansDayPaid, { ev: a.ev.short, evNet: Y(a.ev.net), gas: a.gas.short, gasNet: Y(a.gas.net) }), T.ansDayIncl];
  if (a.fee > 0) dayParts.push(fill(a.car < 0 ? T.ansDayFeeLess : T.ansDayFeeMore, { fee: Y(a.fee), car: Y(a.car) }));
  // 2. each month: the average is the answer; now and later are its parts
  const avg = Math.round(a.avg);
  const monthHead = avg > 0 ? T.ansMonthMore : avg < 0 ? T.ansMonthLess : T.ansMonthSame;
  const monthParts = [fill(T.ansMonthAvg, { h: H })];
  const dir = (v: number) => (v > 0 ? T.ansMore : T.ansLess);
  if (a.later !== null && a.until > 0) monthParts.push(fill(T.ansMonthPhase, { n: a.until, dir1: dir(a.now), now: Y(a.now), dir2: dir(a.later), later: Y(a.later) }));
  if (a.plan) monthParts.push(fill(T.ansMonthPlan, { plan: a.plan }));
  monthParts.push(T.ansMonthIncl);
  // the five-year average spreads the battery setup fee too: say so, so it is not added twice
  if (a.fee > 0) monthParts.push(T.ansMonthFee);
  // 3. when it evens out
  let payHead = '';
  const payParts: string[] = [];
  let payTone: 'go' | 'dear' | 'even' = 'even';
  const yrs = (m: number) => yearsWords(loc, T, m);
  switch (a.kind) {
    case 'parity':
      payHead = T.ansPayParity;
      payTone = 'go';
      break;
    case 'month':
      payHead = fill(T.ansPayMonth, { n: a.month ?? 0, years: yrs(a.month ?? 0) ? fill(T.ansAbout, { t: yrs(a.month ?? 0) }) : '' });
      payParts.push(T.ansPayMonthWhy);
      payTone = 'go';
      break;
    case 'b':
      if (a.catchUp) {
        payHead = fill(T.ansPayCatch, { n: a.month ?? 0, years: yrs(a.month ?? 0) ? fill(T.ansAbout, { t: yrs(a.month ?? 0) }) : '' });
        payParts.push(T.ansPayCatchWhy);
        payTone = 'dear';
      } else {
        payHead = fill(T.ansPayAhead, { h: H });
        payParts.push(T.ansPayAheadWhy);
        payTone = 'go';
      }
      break;
    case 'c':
      payHead = fill(T.ansPayNever, { h: H });
      payParts.push(T.ansPayNeverWhy);
      payTone = 'dear';
      break;
    case 'c-slow':
      payHead = fill(T.ansPayNever, { h: H });
      payParts.push(a.evenKm ? fill(T.ansPaySlowKm, { km: num(loc, a.evenKm) }) : T.ansPaySlowNever);
      payTone = 'dear';
      break;
    case 'c-briefly':
      payHead = fill(T.ansPayNever, { h: H });
      payParts.push(fill(T.ansPayBriefly, { n: a.month ?? 0, h: H, gap: Y(a.gapH ?? 0) }));
      payTone = 'dear';
      break;
  }
  payParts.push(T.ansPayWhat);
  // a filled-in name may start with a Han character: no space between two Han characters
  const tidy = (xs: string[]) => (loc === 'en' ? xs : xs.map(hanSpace));
  dayParts.splice(0, dayParts.length, ...tidy(dayParts));
  monthParts.splice(0, monthParts.length, ...tidy(monthParts));
  payParts.splice(0, payParts.length, ...tidy(payParts));
  return {
    figs: { day: Math.abs(a.day), month: Math.abs(avg) },
    day: { head: dayHead, tone: a.day < 0 ? 'go' : a.day > 0 ? 'dear' : 'even', parts: dayParts },
    month: { head: monthHead, tone: avg < 0 ? 'go' : avg > 0 ? 'dear' : 'even', parts: monthParts },
    pay: { head: payHead, tone: payTone, parts: payParts },
  };
}

/** The three answers as plain text (a screen reader's summary, the calculator's `sentence`). */
export function answersText(loc: OpenData['locale'], T: OpenText, a: Ans): string {
  const p = ansParts(loc, T, a);
  const n = (tpl: string, v: number) => fill(tpl, { n: yuanNb(loc, v) });
  const sep = loc === 'en' ? ' ' : '';
  const stop = loc === 'en' ? '. ' : '。';
  return [
    `${T.ansDayQ}${loc === 'en' ? ': ' : '：'}${n(p.day.head, p.figs.day)}${stop}${p.day.parts.join(sep)}`,
    `${T.ansMonthQ}${loc === 'en' ? ': ' : '：'}${n(p.month.head, p.figs.month)}${stop}${p.month.parts.join(sep)}`,
    `${T.ansPayQ}${loc === 'en' ? ': ' : '：'}${p.pay.head}${stop}${p.pay.parts.join(sep)}`,
  ].join(sep);
}

/**
 * The three answers as HTML. `level`: heading level of each question. `bars`: draw the price bars
 * under the first answer (the opening's one chart). `working`: the line-by-line price working, folded.
 */
export function answersHtml(loc: OpenData['locale'], T: OpenText, a: Ans, opts: { level?: 2 | 3 | 4; bars?: boolean; working?: boolean; notes?: string[] } = {}): string {
  const p = ansParts(loc, T, a);
  const L = opts.level ?? 3;
  const plate = a.ev.plate === 'heavy' ? T.plateHeavy : a.ev.plate === 'small' ? T.plateSmall : T.plateLight;
  const q = (cls: string, title: string, head: string, tone: string, parts: string[], fig: number | null, extra = '') =>
    `<section class="ans-q ans-q--${cls} ans--${tone}"><h${L} class="ans-q__q">${esc(title)}</h${L}><p class="ans-q__a">${fig === null ? esc(head) : figHtml(loc, head, fig)}</p>${extra}${parts.map((x) => `<p class="ans-q__part">${esc(x)}</p>`).join('')}</section>`;
  let bars = '';
  if (opts.bars) {
    const max = Math.max(a.ev.list, a.gas.net);

    bars = `<div class="op-bars" role="img" aria-label="${esc(fill(T.barsAlt, { petrol: yuan(loc, a.gas.net), ev: yuan(loc, a.ev.net), list: yuan(loc, a.ev.list) }))}">
${bar('op-bar--petrol', barLabel(loc, T.barPetrolShort, a.gas.short), a.gas.net, a.gas.list, max, loc, T, false)}
${bar('op-bar--ev', barLabel(loc, fill(T.barEvShort, { plate }), a.ev.short), a.ev.net, a.ev.list, max, loc, T, true)}
</div>`;
  }
  let working = '';
  if (opts.working) {
    const line = (l: [string, number, 0 | 1]) => `<li><span>${esc(l[0])}${l[2] ? `<span class="op-upto">${esc(T.upTo)}</span>` : ''}</span><span class="op-amt">−${esc(yuan(loc, l[1]))}</span></li>`;
    const side = (title: string, model: string, list: number, lines: [string, number, 0 | 1][], paid: number) =>
      `<div class="op-work__side"><p class="op-work__title">${esc(title)}<span>${esc(model)}</span></p><ul class="op-work__lines"><li><span>${esc(T.workList)}</span><span class="op-amt">${esc(yuan(loc, list))}</span></li>${lines.map(line).join('')}${lines.length ? '' : `<li><span>${esc(T.workNone)}</span><span class="op-amt">−${esc(yuan(loc, 0))}</span></li>`}<li class="op-work__paid"><span>${esc(T.workPaid)}</span><span class="op-amt">${esc(yuan(loc, paid))}</span></li></ul></div>`;
    working = `<details class="op-work"><summary>${esc(T.workSummary)}</summary><div class="op-work__body">${side(fill(T.barEvShort, { plate }), a.ev.name, a.ev.list, a.eLines, a.ev.net)}${side(T.barPetrolShort, a.gas.name, a.gas.list, a.gLines, a.gas.net)}<p class="op-small">${esc(T.workNote)}</p></div></details>`;
  }
  const notes = opts.notes?.length ? scrapNotesHtml(opts.notes, loc) : '';
  return `<div class="ans" data-ans>${q('day', T.ansDayQ, p.day.head, p.day.tone, p.day.parts, p.figs.day === 0 ? null : p.figs.day, bars + notes + working)}${q('month', T.ansMonthQ, p.month.head, p.month.tone, p.month.parts, p.figs.month === 0 ? null : p.figs.month)}${q('pay', T.ansPayQ, p.pay.head, p.pay.tone, p.pay.parts, null)}</div>`;
}

/** Which scooters the answers compare, in plain words (the plate explained), for under the answers. */
export function ansWho(loc: OpenData['locale'], T: OpenText, a: Ans, auto = true): string {
  const plate = a.ev.plate === 'heavy' ? T.plateHeavy : a.ev.plate === 'small' ? T.plateSmall : T.plateLight;
  const parts = [fill(T.ansWho, { ev: a.ev.short, plate, gas: a.gas.short })];
  if (auto) parts.push(T.ansWhoAuto);
  parts.push(a.ev.plate === 'heavy' ? T.ansPlateHeavy : T.ansPlateLight);
  if (a.ev.swap) parts.push(T.ansSwapOnly);
  return loc === 'en' ? parts.join(' ') : hanSpace(parts.join(''));
}

/** HTML-escape a plain string (for callers that join these texts into HTML). */
export const escHtml = esc;

/** The scrap note of an answer, from the same case with the other scrapping answer (see scrapNotes). */
export const ansScrapNotes = (loc: OpenData['locale'], T: OpenText, scrap: Scrap, a: Ans, other: Ans): string[] => {
  const side = (x: Ans): ScrapSide => ({ ev: { short: x.ev.short, net: x.ev.net }, gas: { short: x.gas.short, net: x.gas.net } });
  return scrapNotes(T, scrap, side(scrap === 'yes' ? a : other), side(scrap === 'yes' ? other : a), loc);
};

/** The least favourable case, in words (the cheapest model each time; a dearer model widens the gap). */
export function worstText(d: OpenData, T: OpenText, t: OpenTable): string {
  const w = t.worst;
  const name = d.counties.find((x) => x.id === w.county)?.name ?? w.county;
  return w.d > 0 ? fill(T.worst, { scrap: w.scrap === 'yes' ? T.worstScrapYes : T.worstScrapNo, plate: d.words[w.plate], county: name, n: yuanNb(d.locale, w.d) }) : T.worstNone;
}
