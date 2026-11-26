// /electric/ calculator: everything between the reader's answers and the HTML of a result.
//
// One module, used twice: at build time (Astro frontmatter renders the worked examples) and in
// the browser (the interactive calculator), so a pre-rendered result and a live one are the same
// markup from the same engine. Pure TypeScript with relative imports: no Astro, no DOM.
//
// Rules it keeps:
//   - every number comes from the engine (evaluate / bestOptions / purchaseLedger) or from the
//     dataset the engine reads; nothing is typed here;
//   - every reader-facing word comes from src/i18n/pages/electric.ts (or the engine's own L10n
//     text, passed through readerText for 台);
//   - the verdict is derived from the engine's break-even classification, never re-computed.

import {
  bestOptions,
  breakEvenText,
  evaluate,
  horizonText,
  lineLabel,
  purchaseLedger,
  toBreakEven,
  toWaterfall,
  validateSituation,
  type BestOptions,
  type Evaluation,
  type Household,
  type InputIssue,
  type Message,
  type Situation,
} from '../../../lib/calc/index.ts';
import { daysBetween, fullYears, normalise } from '../../../lib/calc/dates.ts';
import type { EconDataset, Engine, JurisdictionId, Programme } from '../../../data/econ/types.ts';
import { formatDate } from '../../../lib/site-state.ts';
import { renderWaterfall } from '../../charts/core/waterfall.ts';
import { renderBreakEven } from '../../charts/core/breakeven.ts';
import { chartHtml, type ChartRender } from '../../charts/core/shared.ts';
import { readerText } from '../../../i18n/ui.ts';
import electric from '../../../i18n/pages/electric.ts';
import { fill, localize, type Locale } from '../../../i18n/pages/_copy.ts';

export type Plate = 'heavy' | 'any';
export type Power = 'subscription' | 'payg' | 'home';

/** What the reader told us, before any model is chosen. */
export interface Answers {
  jurisdiction: JurisdictionId;
  scrap: { engine: Engine; builtOn: string } | null;
  household: Household;
  monthlyKm: number;
  plate: Plate;
  power: Power;
  /** 'model::plan' chosen by the reader, or null for our suggestion. */
  ev?: string | null;
  /** gasoline model id chosen by the reader, or null for our suggestion. */
  gas?: string | null;
  /** evaluation date (defaults to today in Taiwan inside the engine). */
  date?: string;
}

export interface Choice {
  situation: Situation;
  evAuto: boolean;
  gasAuto: boolean;
  /** the ranking that produced the suggestion (null when the reader chose the model) */
  best: BestOptions | null;
  /** the reader asked for home charging but no model fits: we fell back to swapping */
  fellBack: boolean;
}

// ---------------------------------------------------------------------------------------------
// choosing the two scooters

export function planKind(data: EconDataset, planId: string): Power {
  const p = data.plans.find((x) => x.id === planId);
  if (!p) return 'subscription';
  if (p.system === 'home') return 'home';
  return p.monthlyFee > 0 ? 'subscription' : 'payg';
}

const baseOf = (a: Answers) => ({
  jurisdiction: a.jurisdiction,
  scrap: a.scrap ? { engine: a.scrap.engine, builtOn: a.scrap.builtOn } : null,
  household: a.household,
  monthlyKm: a.monthlyKm,
  ...(a.date ? { date: a.date } : {}),
});

/** Gasoline models ranked by what the reader would pay (cheapest first). */
export function rankGas(a: Answers, data: EconDataset): { id: string; net: number }[] {
  const firstEv = data.evModels.find((m) => m.calculator === true)!;
  return data.gasModels
    .filter((m) => m.calculator === true)
    .map((m) => {
      const s = { ...baseOf(a), gasolineModel: m.id, electricModel: firstEv.id, energyPlan: firstEv.plans[0] } as Situation;
      return { id: m.id, net: purchaseLedger('gasoline', s, data).ledger.net.value };
    })
    .sort((x, y) => x.net - y.net);
}

/** Issues with the answers alone (before models are chosen). */
export function answerIssues(a: Answers, data: EconDataset): InputIssue[] {
  const gas = data.gasModels.find((m) => m.calculator === true)!;
  return validateSituation({ ...baseOf(a), gasolineModel: gas.id } as Situation, data).filter((i) => !['electricModel', 'energyPlan'].includes(i.field));
}

/** Pick the two scooters: the reader's own choice, or bestOptions' lowest five-year total that fits the answers. */
export function choose(a: Answers, data: EconDataset): Choice {
  const gasAuto = !a.gas || !data.gasModels.some((m) => m.id === a.gas && m.calculator === true);
  const gasolineModel = gasAuto ? rankGas(a, data)[0].id : (a.gas as string);
  const base = { ...baseOf(a), gasolineModel };
  const [evM, evP] = (a.ev ?? '').split('::');
  const own = data.evModels.find((m) => m.id === evM && m.calculator === true && m.plans.includes(evP));
  if (own) return { situation: { ...base, electricModel: evM, energyPlan: evP } as Situation, evAuto: false, gasAuto, best: null, fellBack: false };
  const best = bestOptions(base as Omit<Situation, 'electricModel' | 'energyPlan'>, data);
  const fits = (power: Power) => best.byFiveYearTotal.find((o) => (a.plate === 'any' || o.plateClass === 'heavy') && planKind(data, o.energyPlan) === power);
  let pick = fits(a.power);
  let fellBack = false;
  if (!pick) {
    pick = fits('subscription') ?? best.byFiveYearTotal[0];
    fellBack = true;
  }
  return { situation: { ...base, electricModel: pick!.electricModel, energyPlan: pick!.energyPlan } as Situation, evAuto: true, gasAuto, best, fellBack };
}

// ---------------------------------------------------------------------------------------------
// the verdict (blueprint 4.3, V36), from the engine's own answers

export type VerdictKind = 'parity' | 'month' | 'b' | 'c' | 'c-slow' | 'c-briefly';
export interface VerdictInfo {
  verdict: 'A' | 'B' | 'C';
  kind: VerdictKind;
  /** electric − gasoline at purchase, setup fees included (cumulative month 0) */
  upfrontGap: number;
  /** electric − gasoline net price (the engine's purchaseGap) */
  purchaseGap: number;
  /** electric − gasoline average monthly cost over the horizon (setup fees and credits spread) */
  monthlyGap: number;
  month?: number;
}

export function classify(e: Evaluation): VerdictInfo {
  const c = e.comparison;
  const be = c.breakEven;
  const upfrontGap = c.cumulative.electric[0].typical - c.cumulative.gasoline[0].typical;
  const monthlyGap = e.electric.running.averageMonthly.typical - e.gasoline.running.averageMonthly.typical;
  const base = { upfrontGap, purchaseGap: c.purchaseGap, monthlyGap };
  switch (be.kind) {
    case 'ev-ahead':
      return be.runningCheaper !== false && monthlyGap <= 0 ? { verdict: 'A', kind: 'parity', ...base } : { verdict: 'B', kind: 'b', ...base };
    case 'breaks-even':
      return { verdict: 'A', kind: 'month', month: be.month, ...base };
    case 'gas-catches-up':
      return { verdict: 'B', kind: 'b', month: be.month, ...base };
    case 'no-break-even':
      if ((be.crossings?.length ?? 0) > 0) return { verdict: 'C', kind: 'c-briefly', month: be.crossings![0], ...base };
      return monthlyGap < 0 ? { verdict: 'C', kind: 'c-slow', ...base } : { verdict: 'C', kind: 'c', ...base };
  }
}

// ---------------------------------------------------------------------------------------------
// a scooter that is nearly old enough (R12: the engine applies each place's rule)

export interface NearMiss {
  years: number;
  /** the day it reaches `years` */
  on: string;
  months: number;
  /** programmes with a fixed build cut-off that the scooter misses */
  cutoffs: { name: string; date: string }[];
}

export function nearMiss(e: Evaluation, data: EconDataset, locale: Locale): NearMiss | null {
  const s = e.situation;
  if (!s.scrap) return null;
  const built = normalise(s.scrap.builtOn);
  const ex = [...e.electric.purchase.excluded, ...e.gasoline.purchase.excluded];
  const prog = (id: string): Programme | undefined => data.programmes.find((p) => p.id === id);
  const fails = new Map<number, number>();
  const cutoffs: NearMiss['cutoffs'] = [];
  for (const x of ex) {
    if (x.failedCondition !== 'scrap-min-age' && x.failedCondition !== 'scrap-built') continue;
    const p = prog(x.id);
    if (!p) continue;
    for (const c of p.conditions) {
      if (c.kind === 'scrap-min-age' && x.failedCondition === 'scrap-min-age' && fullYears(built, s.date) < c.years) fails.set(c.years, (fails.get(c.years) ?? 0) + 1);
      // the cut-off this scooter actually fails (a programme can carry more than one build rule)
      if (c.kind === 'scrap-built' && x.failedCondition === 'scrap-built' && c.onOrBefore && built > c.onOrBefore) {
        const name = readerText(p.name[locale]);
        if (!cutoffs.some((k) => k.name === name)) cutoffs.push({ name, date: c.onOrBefore });
      }
    }
  }
  // the age rule most of the missed programmes use (the data says which: usually ten years)
  const years = [...fails.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? null;
  // A build-date cut-off alone is not a near miss: waiting never changes when a scooter was built,
  // and those programmes are already listed with their reason among what was not counted.
  if (years === null) return null;
  const [y, m, d] = built.split('-').map(Number);
  const on = `${y + years}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const [ty, tm] = s.date.split('-').map(Number);
  const months = Math.max(1, (y + years - ty) * 12 + (m - tm));
  return { years, on, months, cutoffs };
}

// ---------------------------------------------------------------------------------------------
// levers (#closer): what each change would be worth for this reader, from the engine

export interface Lever {
  key: 'scrapFour' | 'scrapTwo' | 'child' | 'lowIncome' | 'plate' | 'plan';
  /** electric net price saving at purchase (positive = cheaper) */
  amount: number;
  /** for 'plan': saving per month */
  monthly?: number;
}

export function levers(a: Answers, e: Evaluation, data: EconDataset): Lever[] {
  const s = e.situation;
  const net = e.electric.purchase.net.value;
  const out: Lever[] = [];
  const at = (over: Partial<Situation>) => {
    try {
      return evaluate({ ...s, ...over } as Situation, data);
    } catch {
      return null;
    }
  };
  const year = Number(s.date.slice(0, 4));
  const ageOf = (n: number) => `${year - n}${s.date.slice(4, 7)}`;
  if (!s.scrap || s.scrap.engine !== 'four-stroke') {
    // a four-stroke comfortably past every age rule in the data
    const oldest = Math.max(...data.programmes.flatMap((p) => p.conditions.flatMap((c) => (c.kind === 'scrap-min-age' ? [c.years] : [0])))) + 2;
    const r = at({ scrap: { engine: 'four-stroke', builtOn: ageOf(oldest) } });
    if (r && !s.scrap) out.push({ key: 'scrapFour', amount: net - r.electric.purchase.net.value });
  }
  if (!s.scrap || s.scrap.engine !== 'two-stroke') {
    const twoStrokeEra = data.programmes.flatMap((p) => p.conditions.flatMap((c) => (c.kind === 'scrap-built' && c.onOrBefore ? [Number(c.onOrBefore.slice(0, 4))] : []))).sort((x, y) => x - y)[0] ?? year - 25;
    const r = at({ scrap: { engine: 'two-stroke', builtOn: `${twoStrokeEra - 1}-06` } });
    if (r) out.push({ key: 'scrapTwo', amount: net - r.electric.purchase.net.value });
  }
  if (!s.household.childUnder12) {
    const r = at({ household: { ...s.household, childUnder12: true } });
    if (r) out.push({ key: 'child', amount: net - r.electric.purchase.net.value });
  }
  if (!s.household.income || s.household.income === 'none') {
    const best = (['middle-low', 'low'] as const).map((income) => at({ household: { ...s.household, income } })).filter((r): r is Evaluation => !!r);
    if (best.length) out.push({ key: 'lowIncome', amount: Math.max(...best.map((r) => net - r.electric.purchase.net.value)) });
  }
  if (a.plate === 'heavy' && !a.ev) {
    try {
      const c = choose({ ...a, plate: 'any' }, data);
      const r = evaluate(c.situation, data);
      out.push({ key: 'plate', amount: net - r.electric.purchase.net.value });
    } catch {
      /* no green-plate option */
    }
  }
  // the cheapest plan at this distance for the same model
  const model = data.evModels.find((m) => m.id === s.electricModel);
  if (model) {
    const now = e.electric.running.averageMonthly.typical;
    let bestPlan: number | null = null;
    for (const pid of model.plans) {
      if (pid === s.energyPlan) continue;
      const r = at({ energyPlan: pid });
      if (r) bestPlan = Math.max(bestPlan ?? -Infinity, now - r.electric.running.averageMonthly.typical);
    }
    if (bestPlan !== null) out.push({ key: 'plan', amount: 0, monthly: Math.round(bestPlan) });
  }
  return out.filter((l) => (l.key === 'plan' ? (l.monthly ?? 0) > 0 : l.amount > 0)).sort((x, y) => (y.amount || 0) - (x.amount || 0));
}

// ---------------------------------------------------------------------------------------------
// rendering

export interface Cite {
  short: string;
  url: string;
}

export interface RenderCtx {
  locale: Locale;
  data: EconDataset;
  /** source id → short citation and link (the page passes a map built from the registry) */
  cite: (id: string) => Cite | null;
  /** unique prefix for ids inside this result */
  id: string;
  /** label of the chart data-table toggle */
  tableLabel: string;
  /** href() of internal anchors on this page and the action page */
  links: { checklist: string; notYet: string; closer: string; noSocket: string; act: string; actKeep: string; actPolicy: string };
}

export interface Rendered {
  verdict: 'A' | 'B' | 'C';
  sentence: string;
  title: string;
  prefix: string;
  value: string;
  unit: string;
  /** the sentence a screen reader hears when this result appears */
  spoken: string;
  /** the answer in a few words, for the bar at the bottom of the screen */
  short: string;
  note: string;
  /** inside the verdict A deadline slot (day count filled in the browser, R10) */
  deadlineHtml: string;
  /** inside the verdict C next-steps slot */
  nextHtml: string;
  bodyHtml: string;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// formatters are built once per locale (building one per call was a large share of a result's time)
const fmt = (locale: Locale, digits: 0 | 1 | 2) => new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'zh-TW', { minimumFractionDigits: digits === 2 ? 2 : 0, maximumFractionDigits: digits });
const FMT = { 'zh-TW': [fmt('zh-TW', 0), fmt('zh-TW', 1), fmt('zh-TW', 2)], en: [fmt('en', 0), fmt('en', 1), fmt('en', 2)] } as const;
const nf = (locale: Locale, v: number) => FMT[locale][0].format(Math.round(v));
/** A distance as the reader typed it: whole kilometres, or one decimal when they gave one. */
const kmText = (locale: Locale, v: number) => (Number.isInteger(v) ? nf(locale, v) : FMT[locale][1].format(v));
// Chinese amounts in 元 (a no-break space keeps the number with its unit), English NT$20,980 (brief 6.6, 7.7)
export const money = (locale: Locale, v: number) => (locale === 'en' ? `NT$${nf(locale, Math.abs(v))}` : `${nf(locale, Math.abs(v))}\u00a0元`);
const signed = (locale: Locale, v: number) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${money(locale, v)}`;
const perKm = (locale: Locale, v: number) => (locale === 'en' ? `NT$${FMT[locale][2].format(v)}` : `${FMT[locale][2].format(v)}\u00a0元`);
/** A link that opens in a new tab, saying so to screen readers. */
const extLink = (url: string, text: string, locale: Locale) =>
  `<a href="${esc(url)}" rel="noopener" target="_blank">${esc(text)}<span class="vh">${esc(localize(electric, locale).result.newTab)}</span></a>`;
const day = (d: string, locale: Locale) => formatDate(d, locale, true);
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function chart(render: ChartRender, id: string, title: string, desc: string | undefined, tableLabel: string): string {
  return `<div class="chart chart--${render.kind}" data-id="${esc(id)}" data-title="${esc(title)}"${desc ? ` data-desc="${esc(desc)}"` : ''} data-table-label="${esc(tableLabel)}">${chartHtml(render, { id, title, desc, tableLabel })}</div>`;
}

function figure(title: string, subtitle: string, body: string, foot = ''): string {
  const t = esc(title.replaceAll('|', ''));
  return `<figure class="el-fig"><figcaption class="el-fig__head"><span class="el-fig__title">${t}</span><span class="el-fig__sub">${esc(subtitle)}</span></figcaption>${body}${foot}</figure>`;
}

const conf = (c: string, locale: Locale) => {
  const T = localize(electric, locale).result;
  return c === 'secondary' ? `<span class="el-tag el-tag--secondary">${esc(T.confidence.secondary)}</span>` : '';
};

function sourcesHtml(ids: readonly string[], ctx: RenderCtx): string {
  const items = [...new Set(ids)].map((id) => ctx.cite(id)).filter((c): c is Cite => !!c);
  if (!items.length) return '';
  const T = localize(electric, ctx.locale).result;
  return `<p class="el-src"><span>${esc(T.sourcesLabel)}</span>${items.map((c) => extLink(c.url, c.short, ctx.locale)).join('<span class="el-src__sep" aria-hidden="true">·</span>')}</p>`;
}

/** The model as the reader should see it: class, power, top speed, maker as a fact. */
export function describeEv(data: EconDataset, id: string, locale: Locale): string {
  const T = localize(electric, locale).result;
  const m = data.evModels.find((x) => x.id === id)!;
  return fill(T.model, {
    name: readerText(m.name[locale]),
    maker: readerText(m.brand[locale]),
    plate: T.plate[m.plateClass],
    power: T.power[m.battery.system],
    performance: readerText(m.performance.text[locale]),
  });
}

export function describeGas(data: EconDataset, id: string, locale: Locale): string {
  const T = localize(electric, locale).result;
  const m = data.gasModels.find((x) => x.id === id)!;
  return fill(T.gasModel, { name: readerText(m.name[locale]), maker: readerText(m.brand[locale]), cc: m.displacementCc });
}

function messageHtml(m: Message, ctx: RenderCtx): string {
  const T = localize(electric, ctx.locale).result;
  const links = m.links?.length
    ? `<span class="el-msg__links">${esc(T.officialLinks)}${m.links.map((l) => extLink(l.url, readerText(l.label[ctx.locale]), ctx.locale)).join('<span class="el-src__sep" aria-hidden="true">·</span>')}</span>`
    : '';
  // a message that is a list (one rule per deadline, for example) reads better as one
  let body = `<span class="el-msg__text">${esc(readerText(m.text[ctx.locale]))}</span>`;
  if (m.items?.length) {
    const whole = readerText(m.text[ctx.locale]);
    const items = m.items.map((x) => readerText(x[ctx.locale]));
    // the lead is the text before the first item (the engine keeps `text` as lead + items)
    const at = whole.indexOf(items[0]);
    const lead = at > 0 ? whole.slice(0, at).trim() : '';
    const rest = at >= 0 ? whole.slice(whole.indexOf(items[items.length - 1]) + items[items.length - 1].length).trim() : '';
    body = `${lead ? `<span class="el-msg__text">${esc(lead)}</span>` : ''}<ul class="el-msg__items">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${rest ? `<span class="el-msg__text">${esc(rest)}</span>` : ''}`;
    if (at < 0) body = `<span class="el-msg__text">${esc(whole)}</span>`;
  }
  return `<li class="el-msg el-msg--${m.severity}"><span class="el-msg__sev">${esc(T.severity[m.severity])}</span>${body}${links}${sourcesHtml(m.sources ?? [], ctx)}</li>`;
}

function ledgerHtml(e: Evaluation, side: 'electric' | 'gasoline', ctx: RenderCtx): string {
  const { locale } = ctx;
  const T = localize(electric, locale).result;
  const lg = side === 'electric' ? e.electric.purchase : e.gasoline.purchase;
  const other = side === 'electric' ? e.gasoline.purchase : e.electric.purchase;
  const head = side === 'electric' ? describeEv(ctx.data, lg.model.id, locale) : describeGas(ctx.data, lg.model.id, locale);
  const rows: string[] = [];
  rows.push(
    `<li class="el-row el-row--base"><div class="el-row__main"><span class="el-row__label">${esc(T.ledger.list)}${conf(lg.listPrice.confidence, locale)}</span><span class="el-row__amt">${money(locale, lg.listPrice.value)}</span></div>${
      lg.listPrice.note ? `<p class="el-row__meta">${esc(readerText(lg.listPrice.note[locale]))}</p>` : ''
    }${sourcesHtml(lg.listPrice.sources, ctx)}</li>`,
  );
  if (!lg.lines.length) rows.push(`<li class="el-row el-row--empty"><p class="el-row__meta">${esc(T.ledger.noLines)}</p></li>`);
  for (const l of lg.lines) {
    const meta: string[] = [];
    meta.push(`<span><b>${esc(T.ledger.condition)}</b> ${esc(readerText(l.conditionText[locale]))}${l.note ? ` ${esc(readerText(l.note[locale]))}` : ''}</span>`);
    if (l.deadline) {
      const when = l.deadline.lastDay ? fill(T.ledger.deadlineLast, { date: day(l.deadline.date, locale) }) : day(l.deadline.date, locale);
      meta.push(`<span><b>${esc(T.ledger.deadline)}</b> ${esc(when)}：${esc(readerText(l.deadline.rule[locale]))}${l.applicationDeadline ? ` ${esc(fill(T.ledger.application, { date: day(l.applicationDeadline, locale) }))}` : ''}</span>`.replace('：', locale === 'en' ? ': ' : '：'));
    }
    if (l.quota) meta.push(`<span><b>${esc(T.ledger.quota)}</b> ${esc(readerText(l.quota.text[locale]))}</span>`);
    meta.push(`<span><b>${esc(T.ledger.payer)}</b> ${esc(readerText(l.payer[locale]))}；${esc(l.paid === 'at-purchase' ? T.ledger.paidAt : T.ledger.paidLater)}</span>`.replace('；', locale === 'en' ? '; ' : '；'));
    const tags = [l.isMaximum ? `<span class="el-tag el-tag--upto">${esc(T.ledger.upTo)}</span>` : '', l.cappedFrom !== undefined ? `<span class="el-tag">${esc(T.ledger.capped)}</span>` : '', conf(l.confidence, locale)].join('');
    // the line's conditions, deadline, quota and payer sit behind one tap: the amounts stay readable
    rows.push(
      `<li class="el-row el-row--minus${l.isMaximum ? ' el-row--upto' : ''}"><div class="el-row__main"><span class="el-row__label">${esc(readerText(lineLabel(l, locale)))}</span><span class="el-row__amt"><span aria-hidden="true">− </span>${money(locale, l.amount)}</span></div>${tags ? `<p class="el-row__tags">${tags}</p>` : ''}<details class="el-row__more"><summary>${esc(T.ledger.more)}</summary><p class="el-row__meta">${meta.join('')}</p>${sourcesHtml(l.sources, ctx)}</details></li>`,
    );
  }
  const range = lg.net.high !== lg.net.value ? `<p class="el-row__meta">${esc(fill(T.ledger.netRange, { high: money(locale, lg.net.high) }))}</p>` : '';
  rows.push(`<li class="el-row el-row--total"><div class="el-row__main"><span class="el-row__label">${esc(side === 'electric' ? T.ledger.evNet : T.ledger.gasNet)}</span><span class="el-row__amt">${money(locale, lg.net.value)}</span></div>${range}</li>`);
  if (side === 'electric') {
    rows.push(`<li class="el-row el-row--compare"><div class="el-row__main"><span class="el-row__label">${esc(T.ledger.gasNet)}</span><span class="el-row__amt">${money(locale, other.net.value)}</span></div></li>`);
    const gap = lg.net.value - other.net.value;
    const setup = e.electric.running.upfront;
    rows.push(`<li class="el-row el-row--gap${gap > 0 && !setup ? ' el-row--short' : ''}"><div class="el-row__main"><span class="el-row__label">${esc(T.ledger.gap)}</span><span class="el-row__amt">${signed(locale, gap)}</span></div></li>`);
    if (setup > 0) {
      // a pay-per-use plan's setup fee is paid when the battery is switched on: part of what it costs to start
      const atStart = e.comparison.cumulative.electric[0].typical - e.comparison.cumulative.gasoline[0].typical;
      rows.push(`<li class="el-row el-row--compare"><div class="el-row__main"><span class="el-row__label">${esc(T.ledger.setupFee)}</span><span class="el-row__amt">+${money(locale, setup)}</span></div></li>`);
      rows.push(`<li class="el-row el-row--gap${atStart > 0 ? ' el-row--short' : ''}"><div class="el-row__main"><span class="el-row__label">${esc(T.ledger.gapAtStart)}</span><span class="el-row__amt">${signed(locale, atStart)}</span></div></li>`);
    }
  }
  return `<section class="el-ledger el-ledger--${side}"><h4 class="el-ledger__head">${esc(head)}</h4><ul class="el-rows">${rows.join('')}</ul></section>`;
}

function excludedHtml(e: Evaluation, ctx: RenderCtx): string {
  const { locale } = ctx;
  const T = localize(electric, locale).result;
  const noise = new Set(['ev-plate-class', 'region', 'moea-class', 'gas-max-cc', 'battery-swap']);
  const items = (['electric', 'gasoline'] as const).flatMap((side) =>
    (side === 'electric' ? e.electric.purchase : e.gasoline.purchase).excluded
      .filter((x) => !(x.reason === 'not-eligible' && noise.has(x.failedCondition ?? '')))
      .map((x) => ({ side, x })),
  );
  if (!items.length) return '';
  const sideName = (side: 'electric' | 'gasoline') => T.side[side];
  const li = items
    .map(
      ({ side, x }) =>
        `<li><span class="el-ex__label">${esc(readerText(x.label[locale]))}</span> <span class="el-ex__side">${esc(sideName(side))}</span>${
          x.amount ? ` <span class="el-ex__amt">${esc(fill(T.ledger.wouldPay, { amount: money(locale, x.amount) }))}</span>` : ''
        }<br /><span class="el-ex__why">${esc(readerText(x.reasonText[locale]))}</span>${conf(x.confidence, locale)}${
          x.links?.length ? ` ${x.links.map((k) => extLink(k.url, readerText(k.label[locale]), locale)).join('<span class="el-src__sep" aria-hidden="true">·</span>')}` : ''
        }</li>`,
    )
    .join('');
  return `<details class="el-ex"><summary>${esc(T.sections.excluded)} <span class="el-count">(${items.length})</span></summary><p class="el-small">${esc(T.sections.excludedLead)}</p><ul class="el-ex__list">${li}</ul></details>`;
}

function monthlyHtml(e: Evaluation, ctx: RenderCtx): string {
  const { locale, data } = ctx;
  const T = localize(electric, locale).result;
  const ev = e.electric.running;
  const gas = e.gasoline.running;
  const order = ['energy', 'plan-fee', 'setup-fee', 'plan-credit', 'maintenance', 'road-fee', 'licence-tax', 'insurance', 'inspection'] as const;
  // NT$ once per cell; the likely range sits under it as plain numbers, free to wrap
  const cell = (b?: { low: number; typical: number; high: number }) => {
    if (!b) return esc(T.monthlyTable.none);
    const sign = b.typical < 0 ? '−' : '';
    const mid = `${sign}${money(locale, b.typical)}`;
    return b.low !== b.high ? `${mid}<span class="el-range">${esc(fill(T.monthlyTable.range, { low: nf(locale, Math.abs(b.low)), high: nf(locale, Math.abs(b.high)) }))}</span>` : mid;
  };
  const MT = T.monthlyTable;
  const SIDE = [T.side.electric, T.side.gasoline];
  const rows: string[] = [];
  // the ongoing rows a reader can add up, for each side
  const sum = { ev: 0, gas: 0 };
  let k = 0;
  for (const id of order) {
    const a = ev.items.filter((i) => i.id === id);
    const g = gas.items.filter((i) => i.id === id);
    if (!a.length && !g.length) continue;
    const n = Math.max(a.length, g.length);
    for (let j = 0; j < n; j++) {
      const ai = a[j];
      const gi = g[j];
      sum.ev += ai?.monthly.typical ?? 0;
      sum.gas += gi?.monthly.typical ?? 0;
      // energy and maintenance mean different things on each side: a neutral name, then each side's own
      const shared = id === 'energy' || id === 'maintenance';
      const label = shared ? MT.rowLabel[id] : readerText((ai ?? gi).label[locale]);
      const what = shared
        ? `<span class="el-mt__what">${[ai && `${SIDE[0]}${locale === 'en' ? ': ' : '：'}${readerText(ai.label[locale])}`, gi && `${SIDE[1]}${locale === 'en' ? ': ' : '：'}${readerText(gi.label[locale])}`].filter(Boolean).map((x) => `<span>${esc(x as string)}</span>`).join('')}</span>`
        : '';
      const note = [ai?.note, gi?.note].filter(Boolean).map((x) => readerText(x![locale])).filter((x, i, all) => x && all.indexOf(x) === i);
      const months = ai?.months && !label.includes(String(ai.months)) ? ` <span class="el-small">(${esc(fill(T.monthsFor, { n: ai.months }))})</span>` : '';
      const tag = [ai, gi].some((x) => x?.confidence === 'secondary') ? conf('secondary', locale) : '';
      const noteId = `${ctx.id}-mt-${k++}`;
      // the note opens as its own full-width row under the item, not inside the narrow first column
      const toggle = note.length
        ? ` <button type="button" class="el-note" aria-expanded="false" aria-controls="${noteId}" data-el-note><span aria-hidden="true">?</span><span class="vh">${esc(fill(MT.aboutRow, { label }))}</span></button>`
        : '';
      rows.push(`<tr><th scope="row">${esc(label)}${months}${tag}${toggle}${what}</th><td class="num">${cell(ai?.monthly)}</td><td class="num">${cell(gi?.monthly)}</td></tr>`);
      // shown without JavaScript; the page script folds it behind the button
      if (note.length) rows.push(`<tr class="el-mt__note" id="${noteId}" data-el-noterow><td colspan="3"><p>${note.map(esc).join('</p><p>')}</p></td></tr>`);
    }
  }
  // Total = the rows above, so the column adds up. Credits and setup fees that stop or come back
  // later are then given in plain words, with the five-year average the verdict uses.
  rows.push(`<tr class="el-total"><th scope="row">${esc(MT.total)}</th><td class="num">${money(locale, sum.ev)}</td><td class="num">${money(locale, sum.gas)}</td></tr>`);
  const evChanges = ev.items.some((i) => i.months) || Math.abs(sum.ev - ev.averageMonthly.typical) >= 1;
  const gasChanges = Math.abs(sum.gas - gas.averageMonthly.typical) >= 5; // not rounding noise
  if (evChanges || gasChanges) rows.push(`<tr class="el-avg"><th scope="row">${esc(fill(MT.average, { h: horizonText(e.comparison.cumulative.months.length - 1)[locale] }))}</th><td class="num">${money(locale, ev.averageMonthly.typical)}</td><td class="num">${money(locale, gas.averageMonthly.typical)}</td></tr>`);
  if (ev.perKm && gas.perKm) rows.push(`<tr><th scope="row">${esc(MT.perKm)}</th><td class="num">${perKm(locale, ev.perKm.typical)}</td><td class="num">${perKm(locale, gas.perKm.typical)}</td></tr>`);
  const credit = ev.items.find((i) => i.id === 'plan-credit' && i.months);
  const setupItem = ev.items.find((i) => i.id === 'setup-fee');
  const explain: string[] = [];
  if (credit) explain.push(fill(MT.creditNote, { n: credit.months!, after: money(locale, sum.ev - credit.monthly.typical) }));
  if (setupItem && e.electric.running.upfront > 0) explain.push(fill(MT.setupNote, { fee: money(locale, e.electric.running.upfront), n: setupItem.months ?? data.plans.find((p) => p.id === e.situation.energyPlan)?.lockInMonths ?? 0 }));
  if (evChanges || gasChanges) explain.push(MT.averageNote);
  const plan = data.plans.find((p) => p.id === e.situation.energyPlan)!;
  const planLine = [
    fill(MT.plan, { plan: readerText(plan.name[locale]) }),
    // the contract phrase is the research's own: a length, "not stated", or none (home charging)
    readerText(plan.contract[locale]),
    plan.setupFee ? fill(MT.setupFee, { fee: money(locale, plan.setupFee.value) }) : MT.noSetupFee,
  ].join(locale === 'en' ? '; ' : '；');
  const ref = data.spendReference;
  const survey = fill(MT.survey, { ev: money(locale, ref.electric), gas: money(locale, ref.gasolineHeavy) });
  return `<div class="el-monthly"><p class="el-small">${esc(fill(T.sections.monthlyLead, { km: kmText(locale, e.situation.monthlyKm) }))}</p>
<div class="el-mt__wrap"><table class="el-mt"><caption class="vh">${esc(T.sections.monthly)}</caption><colgroup><col class="el-mt__c1" /><col /><col /></colgroup><thead><tr><th scope="col">${esc(MT.item)}</th><th scope="col" class="num">${esc(SIDE[0])}</th><th scope="col" class="num">${esc(SIDE[1])}</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
${explain.length ? `<p class="el-small">${esc(explain.join(locale === 'en' ? ' ' : ''))}</p>` : ''}
<p class="el-plan">${esc(planLine)}</p><p class="el-small"><b>${esc(MT.terms)}</b>${esc(readerText(plan.terms[locale]))}</p>${sourcesHtml(plan.sources, ctx)}
<p class="el-small">${esc(survey)}</p>${sourcesHtml(ref.sources, ctx)}</div>`;
}

function breakEvenHtml(e: Evaluation, ctx: RenderCtx): string {
  const { locale } = ctx;
  const T = localize(electric, locale).result;
  const b = toBreakEven(e, locale);
  const H = b.months;
  const aIsEv = b.a.tone === 'clean';
  const yearWord = (m: number) => (m === 0 ? b.labels.purchase : b.labels.year.replace('{n}', String(m / 12)));
  const render = renderBreakEven({
    locale,
    a: b.a,
    b: b.b,
    months: H,
    tickLabel: yearWord,
    breakEvenLabel: () => b.chartLabels.breakEvenLabel,
    noBreakEvenLabel: b.chartLabels.noBreakEvenLabel,
    aheadLabel: b.chartLabels.aheadLabel,
    xLabel: b.labels.month,
    series: { a: aIsEv ? b.series.electric : b.series.gasoline, b: aIsEv ? b.series.gasoline : b.series.electric },
    crossMonth: b.crossMonth,
    answer: b.breakEvenText,
  });
  const c = e.comparison;
  const answer = fill(T.sections.breakevenAnswer, { answer: b.breakEvenText });
  const range = fill(T.sections.breakevenRange, { best: breakEvenText(c.breakEvenRange.best, locale, H), worst: breakEvenText(c.breakEvenRange.worst, locale, H) });
  const cross = (c.breakEven.crossings?.length ?? 0) > 1 ? `<p class="el-small">${esc(fill(T.sections.breakevenCrossings, { months: c.breakEven.crossings!.join(locale === 'en' ? ', ' : '、') }))}</p>` : '';
  const ints = c.totalParityIntervals;
  const parity = ints.length
    ? ints
        .map((i) => (i.toKm === null ? fill(T.sections.parityKmOpen, { from: nf(locale, i.fromKm) }) : fill(T.sections.parityKm, { from: nf(locale, i.fromKm), to: nf(locale, i.toKm) })))
        .join(' ')
    : T.sections.parityKmNone;
  const body = chart(render, `${ctx.id}-be`, T.sections.breakeven.replaceAll('|', ''), b.breakEvenText, ctx.tableLabel);
  return figure(T.sections.breakeven, T.sections.breakevenSub, body, `<p class="el-answer">${esc(answer)}</p><p class="el-small">${esc(range)}</p>${cross}<p class="el-small">${esc(parity)}</p>`);
}

function waterfallHtml(e: Evaluation, ctx: RenderCtx): string {
  const { locale } = ctx;
  const T = localize(electric, locale).result;
  const w = toWaterfall(e, locale);
  const render = renderWaterfall({ ...w, start: { ...w.start, label: readerText(w.start.label) }, steps: w.steps.map((s) => ({ ...s, label: readerText(s.label) })) });
  const [colon, semi] = locale === 'zh-TW' ? ['：', '；'] : [': ', '; '];
  const desc = `${w.totalLabel}${colon}${money(locale, e.electric.purchase.net.value)}${semi}${w.compare.label}${colon}${money(locale, w.compare.value)}`;
  return figure(T.sections.waterfall, T.sections.waterfallSub, chart(render, `${ctx.id}-wf`, T.sections.waterfall.replaceAll('|', ''), desc, ctx.tableLabel));
}

/**
 * The monthly difference (electric − gasoline) a reader can check against the table: the running
 * items as they are now (a temporary plan credit included, the setup fee left out because it is
 * paid at the start), and the difference once that credit ends.
 */
export function monthlyPhases(e: Evaluation): { now: number; later: number | null; until: number } {
  const sumOf = (items: Evaluation['electric']['running']['items']) => items.filter((i) => i.id !== 'setup-fee').reduce((t, i) => t + i.monthly.typical, 0);
  const now = sumOf(e.electric.running.items) - sumOf(e.gasoline.running.items);
  const credit = e.electric.running.items.find((i) => i.id === 'plan-credit' && i.months && i.monthly.typical !== 0);
  return credit ? { now, later: now - credit.monthly.typical, until: credit.months! } : { now, later: null, until: 0 };
}

/** Everything a result shows, as HTML strings for the ResultPanel parts and slots. */
export function renderResult(e: Evaluation, choice: Pick<Choice, 'evAuto' | 'gasAuto' | 'fellBack'> & { plate?: Plate; power?: Power }, ctx: RenderCtx): Rendered {
  const { locale, data } = ctx;
  const T = localize(electric, locale).result;
  const v = classify(e);
  const s = e.situation;
  const H = e.comparison.cumulative.months.length - 1;
  const h = horizonText(H)[locale];
  const km = kmText(locale, s.monthlyKm);
  const plan = data.plans.find((p) => p.id === s.energyPlan)!;
  const planName = readerText(plan.name[locale]);
  const gasName = describeGas(data, s.gasolineModel, locale);
  const evModel = data.evModels.find((m) => m.id === s.electricModel)!;
  const maintEv = e.electric.running.items.find((i) => i.id === 'maintenance')?.monthly.typical ?? 0;
  const maintGas = e.gasoline.running.items.find((i) => i.id === 'maintenance')?.monthly.typical ?? 0;

  // the verdict sentence (blueprint wording, numbers from the engine)
  let sentence = '';
  let title = '';
  let prefix = 'NT$';
  let value = '';
  let unit = '';
  let spoken = '';
  let short = '';
  const SP = T.spoken;
  const BS = T.barShort;
  const sep = locale === 'en' ? ' ' : '';
  // What it costs to start: with a pay-per-use plan the battery setup fee is paid on day one, so the
  // gap at purchase is the price gap plus that fee, and the sentence says so (the ledger shows both).
  const setup = e.electric.running.upfront;
  const gapText = (gap: number) =>
    setup > 0
      ? fill(v.purchaseGap < 0 ? T.verdict.gapSetupLess : T.verdict.gapSetupMore, { gap: money(locale, gap), car: money(locale, v.purchaseGap), fee: money(locale, setup) })
      : money(locale, gap);
  // The monthly difference a reader can check: what it is now, and later if a credit ends.
  const ph = monthlyPhases(e);
  const monthlyNow = (more: boolean) => {
    const now = more ? ph.now : -ph.now;
    const later = ph.later === null ? null : more ? ph.later : -ph.later;
    // the difference changes sign when a credit ends: quote the average rather than a wrong direction
    if (now < 0 || (later !== null && later < 0)) return money(locale, v.monthlyGap);
    return later === null ? money(locale, now) : fill(T.verdict.monthlyThen, { now: money(locale, now), n: ph.until, later: money(locale, later) });
  };
  const crossings = e.comparison.breakEven.crossings ?? [];
  const crossTail = crossings.length > 1 ? fill(T.verdict.crossings, { months: crossings.join(locale === 'en' ? ', ' : '、') }) : '';
  switch (v.kind) {
    case 'parity':
      sentence = fill(T.verdict.parity, { gap: money(locale, -v.purchaseGap) });
      title = T.panel.parity;
      value = nf(locale, -v.purchaseGap);
      spoken = fill(SP.parity, { v: money(locale, -v.purchaseGap) });
      short = fill(BS.parity, { v: money(locale, -v.purchaseGap) });
      break;
    case 'month':
      sentence = [
        fill(T.verdict.month, {
          gap: setup > 0 ? fill(T.verdict.gapWithSetupShort, { gap: money(locale, v.upfrontGap) }) : money(locale, v.upfrontGap),
          monthly: monthlyNow(false),
          n: v.month!,
        }),
        crossTail,
      ].join(sep);
      title = T.panel.month;
      spoken = fill(SP.month, { n: v.month! });
      short = fill(BS.month, { n: v.month! });
      prefix = T.panel.monthPrefix;
      value = String(v.month);
      unit = locale === 'en' ? '' : T.panel.monthUnit;
      break;
    case 'b': {
      const same = Math.abs(v.purchaseGap) < 1;
      const head = fill(same ? T.verdict.bSame : T.verdict.bLess, { gap: money(locale, -v.purchaseGap), km, plan: planName, monthly: monthlyNow(true) });
      const tail = e.comparison.breakEven.kind === 'gas-catches-up' ? fill(T.verdict.bCatch, { n: v.month! }) : fill(T.verdict.bAhead, { h });
      const avg = ph.later !== null ? fill(T.verdict.bAverage, { h, monthly: money(locale, v.monthlyGap) }) : '';
      sentence = [head, avg, tail, maintEv < maintGas ? T.verdict.bBuysMaint : T.verdict.bBuys].filter(Boolean).join(sep);
      title = ph.later !== null ? fill(T.panel.bAverage, { h }) : T.panel.b;
      value = nf(locale, v.monthlyGap);
      spoken = fill(same ? SP.bSame : SP.bLess, { gap: money(locale, -v.purchaseGap), v: money(locale, v.monthlyGap) });
      short = fill(BS.b, { v: money(locale, v.monthlyGap) });
      break;
    }
    case 'c':
      sentence = fill(T.verdict.c, { gap: gapText(v.upfrontGap) });
      title = T.panel.c;
      value = nf(locale, v.upfrontGap);
      spoken = fill(SP.c, { v: money(locale, v.upfrontGap) });
      short = fill(BS.c, { v: money(locale, v.upfrontGap) });
      break;
    case 'c-slow': {
      const k = e.comparison.totalParityKm;
      const more = k && k.fromKm > s.monthlyKm ? fill(T.verdict.cSlowKm, { km: nf(locale, k.fromKm) }) : T.verdict.cSlowNever;
      sentence = fill(T.verdict.cSlow, { gap: gapText(v.upfrontGap), monthly: monthlyNow(false), h, more });
      title = T.panel.c;
      value = nf(locale, v.upfrontGap);
      spoken = fill(SP.c, { v: money(locale, v.upfrontGap) });
      short = fill(BS.c, { v: money(locale, v.upfrontGap) });
      break;
    }
    case 'c-briefly':
      sentence = fill(T.verdict.cBriefly, { n: v.month!, h, gap: money(locale, e.comparison.breakEven.gapAtHorizon ?? 0) });
      title = T.panel.c;
      value = nf(locale, v.upfrontGap);
      spoken = fill(SP.c, { v: money(locale, v.upfrontGap) });
      short = fill(BS.c, { v: money(locale, v.upfrontGap) });
      break;
  }
  const note = fill(T.panel.note, { km, plan: planName, gas: gasName });

  // deadline slot (verdict A only; the count is filled in the browser from today's date)
  const yearEnd = data.meta.programmeYearEnd;
  // the earliest last purchase day among the money counted (Keelung and Kinmen close on 30 November)
  const lineDays = e.electric.purchase.lines.filter((l) => l.kind !== 'dealer' && l.deadline?.date).map((l) => l.deadline!.date).sort();
  const deadline = lineDays.length && lineDays[0] < yearEnd ? lineDays[0] : yearEnd;
  // R10: a count only where this result rests on the city's own money; otherwise the date alone
  const cityMoneyCounted = e.electric.purchase.lines.some((l) => data.programmes.some((p) => p.id === l.id && p.jurisdiction === s.jurisdiction));
  const deadlineHtml =
    v.verdict === 'A' && s.date <= deadline && e.electric.purchase.lines.some((l) => l.kind !== 'dealer')
      ? cityMoneyCounted
        ? `<p class="el-daycount" data-el-daycount data-city="${esc(s.jurisdiction)}" data-deadline="${esc(deadline)}">${esc(fill(T.deadlineOnly, { deadline: day(deadline, locale) }))}</p>`
        : `<p class="el-daycount">${esc(fill(T.deadlineOnly, { deadline: day(deadline, locale) }))}</p>`
      : '';
  const nextHtml = `<ul>${T.nextC.map((x, i) => `<li>${i === 0 ? `<a href="${esc(ctx.links.closer)}">${esc(x)}</a>` : i === 3 ? `<a href="${esc(ctx.links.notYet)}">${esc(x)}</a>` : i === 2 ? `<a href="${esc(ctx.links.actPolicy)}">${esc(x)}</a>` : esc(x)}</li>`).join('')}</ul>`;

  // body
  const parts: string[] = [];
  const city = readerText(data.jurisdictions[s.jurisdiction].name[locale]);
  const scrapText = s.scrap
    ? fill(T.scrapYes, {
        year: s.scrap.builtOn.slice(0, 4),
        month: String(Number(s.scrap.builtOn.slice(5, 7))),
        monthName: MONTHS_EN[Number(s.scrap.builtOn.slice(5, 7)) - 1],
        engine: s.scrap.engine === 'two-stroke' ? localize(electric, locale).calc.q2.twoStroke : localize(electric, locale).calc.q2.fourStroke,
      }).replace(/(scrapping an?) ([A-Z])/, (_, a, b) => `${a} ${b.toLowerCase()}`)
    : T.scrapNo;
  // a short map of the long working below, with the way to a smaller gap first
  const jumps = [
    [`#${ctx.id}-buy`, T.jump.buy],
    [`#${ctx.id}-month`, T.jump.month],
    [`#${ctx.id}-warn`, T.jump.warn],
    [ctx.links.closer, T.closerLink],
  ] as const;
  parts.push(`<nav class="el-jump" aria-label="${esc(T.jump.label)}"><span>${esc(T.jump.label)}</span>${jumps.map(([h, t]) => `<a href="${esc(h)}">${esc(t)}</a>`).join('')}</nav>`);
  parts.push(`<p class="el-asof">${esc(fill(T.asOf, { date: day(s.date, locale), checked: day(e.dataCheckedOn, locale) }))}</p>`);
  parts.push(
    `<p class="el-summary">${esc(fill(T.summary, { city, scrap: scrapText, km, plan: planName, ev: readerText(evModel.name[locale]), gas: gasName }))}</p>`,
  );
  if (choice.evAuto || choice.gasAuto) {
    const why: string[] = [];
    if (choice.evAuto) why.push(fill(T.whyModel, { rule: fill(T.whyModelRule, { plate: choice.plate === 'any' ? T.plateAny : T.plate.heavy, power: T.powerInline[choice.power === 'payg' ? 'payg' : choice.power === 'home' ? 'home' : 'subscription'] }) }));
    if (choice.gasAuto) why.push(T.whyGasRule);
    parts.push(`<p class="el-small">${esc(why.join(locale === 'en' ? ' ' : ''))}</p>`);
  }
  if (choice.fellBack) parts.push(`<p class="el-small el-warn">${esc(T.fellBack)} <a href="${esc(ctx.links.noSocket)}">${esc(localize(electric, locale).calc.q5.noSocketLink)}</a></p>`);
  if (e.jurisdiction.status === 'not-verified') {
    const m = e.messages.find((x) => x.code === 'jurisdiction-not-verified');
    if (m) parts.push(`<ul class="el-msgs el-msgs--lead">${messageHtml(m, ctx)}</ul>`);
  }
  // a day longer than the scooter goes on one charge: said before any figure, not only in the list below
  const rangeMsg = e.messages.find((x) => x.code === 'range');
  if (rangeMsg) parts.push(`<ul class="el-msgs el-msgs--lead">${messageHtml(rangeMsg, ctx)}</ul>`);
  if (e.electric.purchase.net.high !== e.electric.purchase.net.value) parts.push(`<p class="el-small el-warn">${esc(fill(T.upToRange, { low: money(locale, e.electric.purchase.net.value), high: money(locale, e.electric.purchase.net.high) }))}</p>`);
  parts.push(`<p class="el-small"><b>${esc(T.likeForLike)}</b>${esc(readerText(e.comparison.likeForLike.note[locale]))}</p>`);

  const nm = nearMiss(e, data, locale);
  if (nm) {
    const lines: string[] = [];
    if (nm.years) lines.push(fill(T.nearMiss, { years: nm.years, date: day(nm.on, locale), n: nm.months, deadline: day(yearEnd, locale) }));
    for (const c of nm.cutoffs) lines.push(fill(T.nearMissCutoff, { name: c.name, date: day(c.date, locale) }));
    parts.push(`<div class="el-box el-box--exhaust"><h4>${esc(T.sections.nearMiss)}</h4>${lines.map((x) => `<p>${esc(x)}</p>`).join('')}</div>`);
  }

  parts.push(`<h4 class="el-h" id="${esc(ctx.id)}-buy">${esc(T.sections.purchase)}</h4><div class="el-ledgers">${ledgerHtml(e, 'electric', ctx)}${ledgerHtml(e, 'gasoline', ctx)}</div>`);
  parts.push(waterfallHtml(e, ctx));
  parts.push(excludedHtml(e, ctx));
  parts.push(`<h4 class="el-h" id="${esc(ctx.id)}-month">${esc(T.sections.monthly)}</h4>${monthlyHtml(e, ctx)}`);
  parts.push(breakEvenHtml(e, ctx));

  const sm = e.messages.find((m) => m.code === 'petrol-smoothing');
  const delta = Math.max(0, e.comparison.withoutSmoothing.gasolineMonthly - e.gasoline.running.monthly.typical);
  parts.push(
    `<div class="el-box"><h4>${esc(T.sections.smoothing)}</h4><p>${esc(fill(T.sections.smoothingLine, { delta: money(locale, delta), answer: breakEvenText(e.comparison.withoutSmoothing.breakEven, locale, H) }))}</p>${
      sm ? `<p class="el-small">${esc(readerText(sm.text[locale]))}</p>${sourcesHtml(sm.sources ?? [], ctx)}` : ''
    }</div>`,
  );

  const shown = e.messages.filter((m) => m.code !== 'petrol-smoothing' && m.code !== 'range' && !(m.code === 'jurisdiction-not-verified' && e.jurisdiction.status === 'not-verified'));
  parts.push(`<h4 class="el-h" id="${esc(ctx.id)}-warn">${esc(T.sections.warnings)}</h4><ul class="el-msgs">${shown.map((m) => messageHtml(m, ctx)).join('')}</ul>`);

  const nextText = v.verdict === 'A' ? T.nextA : v.verdict === 'B' ? T.nextB : '';
  const nextLinks =
    v.verdict === 'C'
      ? `<a href="${esc(ctx.links.closer)}">${esc(T.closerLink)}</a> · <a href="${esc(ctx.links.notYet)}">${esc(T.notYetLink)}</a>`
      : `<a href="${esc(ctx.links.checklist)}">${esc(T.checklistLink)}</a> · <a href="${esc(ctx.links.closer)}">${esc(T.closerLink)}</a> · <a href="${esc(ctx.links.notYet)}">${esc(T.notYetLink)}</a>`;
  parts.push(`<div class="el-next"><h4 class="el-h">${esc(T.sections.next)}</h4>${nextText ? `<p>${esc(nextText)}</p>` : ''}<p class="el-next__links">${nextLinks}</p></div>`);

  // Chinese: the amount reads 「227 元」, not 「NT$ 227」
  if (prefix === 'NT$' && locale === 'zh-TW') {
    prefix = '';
    unit = '元';
  }
  return { verdict: v.verdict, sentence, title, prefix, value, unit, spoken, short, note, deadlineHtml, nextHtml, bodyHtml: parts.filter(Boolean).join('\n') };
}

// ---------------------------------------------------------------------------------------------
// day counts (R10): only inside a verdict A result, with the city's status, from today's date

export interface DayCountState {
  mayShowDayCount: boolean;
  daysLeft: number;
  phase: string;
  city?: { name: { 'zh-TW': string; en: string }; asOf: string; status: string };
}

export function dayCountText(st: DayCountState, deadline: string, locale: Locale, statusWords: Record<string, string>): string | null {
  const T = localize(electric, locale).result;
  if (st.phase !== 'A' || !st.city) return null;
  const city = readerText(st.city.name[locale]);
  const date = formatDate(st.city.asOf, locale, true);
  if (st.mayShowDayCount) return st.daysLeft <= 0 ? fill(T.dayCountLast, { city, date }) : fill(T.dayCount, { city, date, deadline: formatDate(deadline, locale, true), n: st.daysLeft });
  return fill(T.dayCountNone, { city, date, deadline: formatDate(deadline, locale, true), status: statusWords[st.city.status] ?? '' });
}

export { daysBetween };
