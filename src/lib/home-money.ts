// The money of home screens 12 and 13, the film's money beat and the /electric/ hand-off
// (brief 3.2 screens 12–13, 3.3 slots money.*, 7.7 dates). Every figure comes from the
// calculator engine (src/lib/calc); nothing is typed here except the reading rules the brief
// fixes (the four distances, the 1,000 元 "about the same" band, ten years for "paid back").
//
// One module, two places:
//   - build time (Astro frontmatter, Node):  homeMoney() for today, homeMoneyTimeline() for every
//     coming date on which a sum changes, so a cached page can show the variant true on the
//     reader's day (pick it with pickPeriod(), or with periodScript() before first paint);
//   - the browser: buyCase(), monthCase(), breakevenCase() for the reader's own county, scrapping
//     answer and distance, evaluated for today in Taiwan.
// Pure TypeScript with relative imports (no Astro, no DOM, no '@/').
//
//   import { homeMoney, stripText } from '../../lib/home-money.ts';
//   const m = homeMoney();                       // today in Taiwan
//   m.buy['new-taipei'].yes.difference           // electric − petrol, after subsidies (negative = electric cheaper)
//   m.month[300].home.typical                    // { lo, hi } 元 a month charging at home
//   stripText(m.strip, 'zh-TW')                  // 補助到 12 月 31 日。燃油機車的促銷到 11 月 30 日。
//
// What the words mean (so copy says no more than this):
//   - "electric" on screen 12 is the cheapest GREEN-PLATE (light-class) electric scooter by price
//     paid after every subsidy the engine counts, against the cheapest 125 cc petrol scooter by
//     price paid; `buyWhite` is the same with the cheapest white-plate (heavy-class) electric.
//   - "scrap: yes" is a four-stroke 125 cc scooter built in December of the year eleven years
//     before the date: at least ten full years old on every day of that year (defaultScrap()).
//   - month figures are what it costs to fuel or power the scooter, per month, ongoing: petrol =
//     the fuel item; home charging = the electricity item; a swap plan = plan fee + usage beyond
//     the allowance + the setup fee spread over its contract. Temporary plan credits are left out.
//     Maintenance, insurance and fees are not in the month figures (they are in the break-even).
//   - break-even compares the cheapest scooter that can be CHARGED AT HOME with the same petrol
//     scooter, over ten years, with every running cost the engine counts. It carries its own
//     price gap, which is not screen 12's difference (that model is a swap scooter).

import { econData } from '../data/econ/index.ts';
import type { EconDataset, JurisdictionId, L10n, PlateClass, Quota, SourceId, VerificationStatus } from '../data/econ/types.ts';
import { evaluate, purchaseLedger, rankingPairs, boundaryDates, todayInTaiwan, compareDates as cmp } from './calc/index.ts';
import type { BreakEven, Bounds, Confidence, Evaluation, LedgerLine, Message, OldScooter, Situation } from './calc/index.ts';
import { formatDate, moneyPhase, moneySnapshot, type MoneyPhase } from './site-state.ts';
import money from '../i18n/pages/money.ts';
import { fill, type Locale } from '../i18n/pages/_copy.ts';

// ---------------------------------------------------------------------------------------------
// reading rules fixed by the brief (inputs, not results)

/** The distance switch on screen 13 (km a month). */
export const HOME_KM = [150, 300, 500, 800] as const;
export type HomeKm = (typeof HOME_KM)[number];
/** Screens 12 and 13 open on this case (brief 3.2, 7.7). */
export const DEFAULTS = { county: 'new-taipei' as JurisdictionId, scrap: 'yes' as ScrapKey, km: 300 as HomeKm };
/** Within this many 元 either way, the two prices are "about the same" (screen 12 headline rule). */
export const ABOUT_SAME_NTD = 1000;
/** "Not paid back within ten years" (screen 13 line rule). */
export const PAYBACK_HORIZON_MONTHS = 120;

export type ScrapKey = 'yes' | 'no';
export const SCRAP_KEYS: readonly ScrapKey[] = ['yes', 'no'];
export type Plate = Extract<PlateClass, 'light' | 'heavy'>;

/** The old scooter "scrap: yes" stands for: a four-stroke 125 cc built in December, eleven years before `date`'s year. */
export function defaultScrap(date: string): OldScooter {
  return { engine: 'four-stroke', builtOn: `${Number(date.slice(0, 4)) - 11}-12`, displacementCc: 125 };
}

// ---------------------------------------------------------------------------------------------
// types

/** One line of money off a price, as the sheet lists it. */
export interface MoneyLine {
  id: string;
  kind: LedgerLine['kind'];
  label: L10n;
  payer: L10n;
  /** 元 deducted (after any cap). */
  amount: number;
  /** "Up to": a ceiling, never an expected value. */
  isMaximum: boolean;
  /** The condition, in the programme's or offer's own terms. */
  condition: L10n;
  /** At the shop, or paid into the buyer's account after approval. */
  paid: 'at-purchase' | 'after-approval';
  /** The date that decides this line (the earlier of its end and the date it is confirmed to). */
  deadline: string;
  /** What must be done by `deadline`. */
  deadlineRule?: L10n;
  quota?: Quota;
  sources: SourceId[];
  confidence: Confidence;
}

export interface MoneySide {
  model: string;
  name: L10n;
  brand: L10n;
  /** Electric only. */
  plateClass?: Plate;
  /** Starting price before any line (petrol: ex plate and insurance). */
  listPrice: number;
  /** Price paid, every line at its stated amount. */
  net: number;
  /** Price paid if every "up to" line paid nothing (= net when there are none). */
  netHigh: number;
  lines: MoneyLine[];
  /** Part of the deductions refunded after purchase (the buyer pays it first). */
  paidLater: number;
  sources: SourceId[];
}

/** Screen 12's headline rule: electric at least 1,000 元 cheaper / within 1,000 元 / dearer. */
export type BuyVerdict = 'cheaper' | 'about-same' | 'dearer';

export interface Deadlines {
  /** Counted electric subsidy and recycling lines: the first and the last day they accept a purchase. Null when none is counted. */
  subsidy: { first: string; last: string } | null;
  /** Last day of the petrol scooter's dealer offers in this case. Null when none is counted. */
  promo: string | null;
  /** Last day of the electric scooter's dealer offers in this case. Null when none is counted. */
  electricPromo: string | null;
}

export interface BuyCase {
  county: JurisdictionId;
  countyName: L10n;
  /** 'not-verified': no local money was counted (we could not check it); central money still is. */
  countyStatus: VerificationStatus;
  scrap: ScrapKey;
  /** The old scooter assumed when scrap is 'yes'. */
  scrapScooter: OldScooter | null;
  plate: Plate;
  /** Evaluation date (Taiwan) and the day the price research was checked. */
  date: string;
  checkedOn: string;
  electric: MoneySide;
  gasoline: MoneySide;
  /** electric.net − gasoline.net (negative = electric costs less on the day). The engine's purchaseGap. */
  difference: number;
  /** The same with every "up to" electric line at 0. */
  differenceHigh: number;
  verdict: BuyVerdict;
  /** Whether the electric model stands in for a 125 cc, with the engine's note. */
  likeForLike: Evaluation['comparison']['likeForLike'];
  deadlines: Deadlines;
  /** The electric model can only swap batteries (no home charging): it comes with a monthly battery plan. */
  swapOnly: boolean;
  /**
   * When the electric model counts no subsidy but another calculator model of the same plate class
   * does on these terms: the last day those subsidies accept a purchase. Null otherwise.
   */
  otherSubsidy: string | null;
  /**
   * The engine's messages for this case, most severe first: deadlines, quotas, the "check first"
   * ambiguities (the carbon reward stacked on the air subsidy), payout timing, like-for-like...
   * Empty in a slim table (slimHomeMoney).
   */
  messages: Message[];
}

export interface MonthOption {
  model: string;
  name: L10n;
  plan: string;
  planName: L10n;
  /** The contract in one phrase (the plan's own terms). */
  contract: L10n;
  /** 元 a month (low / typical / high). */
  monthly: Bounds;
}

export interface MonthCase {
  km: number;
  date: string;
  /** Petrol for the 125 cc of the default buy case. */
  petrol: { model: string; name: L10n; monthly: Bounds };
  /**
   * Charging at home. `typical` is the range of the typical figure across the scooters that can be
   * charged at home (what to print: 約 lo 到 hi 元); `bounds` is the widest low–high of the tariffs.
   */
  home: { typical: { lo: number; hi: number }; bounds: { low: number; high: number }; options: MonthOption[] };
  /** The cheapest battery-swap plan with a monthly fee, by its typical monthly cost. */
  swapPlan: MonthOption;
  /** The cheapest pay-as-you-go swap plan (no monthly fee; setup fee spread over the contract). */
  swapPayg: MonthOption;
}

export type BreakevenKind =
  /** Cheaper on the day of purchase and still ahead after ten years. */
  | 'cheaper-on-day'
  /** Dearer on the day; paid back by home charging in `months`. */
  | 'pays-back'
  /** Dearer on the day and still dearer after ten years. */
  | 'not-in-ten-years'
  /** Cheaper on the day, but running costs more: petrol catches up in `months`. */
  | 'petrol-catches-up';

export interface Breakeven {
  county: JurisdictionId;
  scrap: ScrapKey;
  km: number;
  date: string;
  kind: BreakevenKind;
  months?: number;
  /** The home-charging scooter compared (cheapest by price paid). */
  model: string;
  name: L10n;
  plateClass: Plate;
  /** Its price paid − the petrol scooter's (its own gap, not screen 12's). */
  purchaseGap: number;
  /** Petrol's average monthly running cost − the home-charging scooter's, all running costs, over ten years (元). */
  monthlySaving: number;
  /** The engine's own classification, for the sheet. */
  engine: BreakEven;
}

export type StripKind = 'subsidy-and-promo' | 'subsidy' | 'nothing-confirmed' | 'next-programme' | 'no-subsidy' | 'other-subsidy' | 'other-subsidy-and-promo';
export interface Strip {
  kind: StripKind;
  date: string;
  subsidy: string | null;
  promo: string | null;
}

export interface HomeMoney {
  date: string;
  phase: MoneyPhase;
  checkedOn: string;
  /** Last day of the 2026 programmes (dataset meta). */
  programmeYearEnd: string;
  defaults: typeof DEFAULTS;
  counties: { id: JurisdictionId; name: L10n; status: VerificationStatus }[];
  /** money.buy[county][scrap]: cheapest green-plate electric against the cheapest 125 cc petrol. */
  buy: Record<JurisdictionId, Record<ScrapKey, BuyCase>>;
  /** The same with the cheapest white-plate electric. */
  buyWhite: Record<JurisdictionId, Record<ScrapKey, BuyCase>>;
  /** money.worst: the least favourable case across buy and buyWhite, verified and partly verified counties only. */
  worst: BuyCase;
  /** money.month[km], for the default buy case's petrol scooter. */
  month: Record<HomeKm, MonthCase>;
  /** money.breakeven[county][scrap][km]. */
  breakeven: Record<JurisdictionId, Record<ScrapKey, Record<HomeKm, Breakeven>>>;
  /** money.deadline.subsidy / .promo, for the default case. */
  deadline: { subsidy: string | null; promo: string | null };
  strip: Strip;
}

// ---------------------------------------------------------------------------------------------
// helpers

const taiwanDay = (date?: string): string => {
  if (!date) return todayInTaiwan();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`[home-money] date must be YYYY-MM-DD, got "${date}"`);
  return date;
};
/** Reader-facing Chinese writes 台, never 臺 (same rule as readerText in src/i18n/ui.ts). */
const rz = (v: L10n): L10n => ({ 'zh-TW': v['zh-TW'].replaceAll('臺', '台'), en: v.en });
const rzMsg = (m: Message): Message => ({ ...m, text: rz(m.text), ...(m.items ? { items: m.items.map(rz) } : {}), ...(m.links ? { links: m.links.map((l) => ({ ...l, label: rz(l.label) })) } : {}) });

const maxDate = (ds: string[]) => (ds.length ? ds.reduce((a, b) => (cmp(a, b) >= 0 ? a : b)) : null);
const minDate = (ds: string[]) => (ds.length ? ds.reduce((a, b) => (cmp(a, b) <= 0 ? a : b)) : null);

function baseSituation(county: JurisdictionId, scrap: ScrapKey, date: string, km: number) {
  return { jurisdiction: county, scrap: scrap === 'yes' ? defaultScrap(date) : null, household: {}, monthlyKm: km, date };
}

/** Petrol models by price paid in this case, cheapest first (the calculator page's rankGas rule). */
function cheapestGas(base: ReturnType<typeof baseSituation>, data: EconDataset): string {
  const firstEv = rankingPairs(data)[0];
  let best: { id: string; net: number } | null = null;
  for (const m of data.gasModels) {
    if (m.calculator !== true) continue;
    const s = { ...base, gasolineModel: m.id, electricModel: firstEv.model.id, energyPlan: firstEv.plan.id } as Situation;
    const net = purchaseLedger('gasoline', s, data).ledger.net.value;
    if (!best || net < best.net) best = { id: m.id, net };
  }
  if (!best) throw new Error('[home-money] no petrol scooter is available in the calculator');
  return best.id;
}

/** The cheapest electric model + plan of a plate class (or able to charge at home), by price paid. */
function cheapestEv(base: ReturnType<typeof baseSituation>, gasolineModel: string, data: EconDataset, keep: (m: EconDataset['evModels'][number], planSystem: string) => boolean) {
  let best: { model: string; plan: string; net: number; high: number } | null = null;
  for (const { model, plan } of rankingPairs(data)) {
    if (!keep(model, plan.system)) continue;
    const s = { ...base, gasolineModel, electricModel: model.id, energyPlan: plan.id } as Situation;
    const l = purchaseLedger('electric', s, data).ledger;
    if (!best || l.net.value < best.net || (l.net.value === best.net && l.net.high < best.high)) best = { model: model.id, plan: plan.id, net: l.net.value, high: l.net.high };
  }
  return best;
}

const lineOf = (l: LedgerLine): MoneyLine => ({
  id: l.id,
  kind: l.kind,
  label: rz(l.label),
  payer: rz(l.payer),
  amount: l.amount,
  isMaximum: l.isMaximum,
  condition: rz(l.conditionText),
  paid: l.paid,
  deadline: l.deadline?.date ?? l.validTo,
  ...(l.deadline?.rule ? { deadlineRule: rz(l.deadline.rule) } : {}),
  ...(l.quota ? { quota: { ...l.quota, text: rz(l.quota.text) } } : {}),
  sources: l.sources,
  confidence: l.confidence,
});

function sideOf(e: Evaluation, side: 'electric' | 'gasoline', data: EconDataset): MoneySide {
  const p = e[side].purchase;
  const ev = side === 'electric' ? data.evModels.find((m) => m.id === p.model.id) : undefined;
  return {
    model: p.model.id,
    name: rz(p.model.name),
    brand: rz(p.model.brand),
    ...(ev ? { plateClass: ev.plateClass as Plate } : {}),
    listPrice: p.listPrice.value,
    net: p.net.value,
    netHigh: p.net.high,
    lines: p.lines.map(lineOf),
    paidLater: p.paidLater,
    sources: p.listPrice.sources,
  };
}

export function verdictOf(difference: number): BuyVerdict {
  if (difference <= -ABOUT_SAME_NTD) return 'cheaper';
  if (difference <= ABOUT_SAME_NTD) return 'about-same';
  return 'dearer';
}

function deadlinesOf(electric: MoneySide, gasoline: MoneySide): Deadlines {
  const subs = electric.lines.filter((l) => l.kind === 'subsidy' || l.kind === 'recycling').map((l) => l.deadline);
  const first = minDate(subs);
  const last = maxDate(subs);
  return {
    subsidy: first && last ? { first, last } : null,
    promo: maxDate(gasoline.lines.filter((l) => l.kind === 'dealer').map((l) => l.deadline)),
    electricPromo: maxDate(electric.lines.filter((l) => l.kind === 'dealer').map((l) => l.deadline)),
  };
}

// ---------------------------------------------------------------------------------------------
// money.buy

/**
 * One cell of money.buy (or buyWhite with plate 'heavy'): the cheapest electric of that plate class
 * against the cheapest 125 cc petrol scooter, both by price paid, for the county and scrapping
 * answer, on `date` (default: today in Taiwan). Throws if no model of that class is available.
 */
export function buyCase(county: JurisdictionId, scrap: ScrapKey, opts: { date?: string; plate?: Plate } = {}, data: EconDataset = econData): BuyCase {
  const date = taiwanDay(opts.date);
  const plate = opts.plate ?? 'light';
  const j = data.jurisdictions[county];
  if (!j) throw new Error(`[home-money] unknown county "${county}"`);
  const base = baseSituation(county, scrap, date, DEFAULTS.km);
  const gasolineModel = cheapestGas(base, data);
  const ev = cheapestEv(base, gasolineModel, data, (m) => m.plateClass === plate);
  if (!ev) throw new Error(`[home-money] no ${plate} electric scooter is available in the calculator`);
  const e = evaluate({ ...base, gasolineModel, electricModel: ev.model, energyPlan: ev.plan }, data);
  const electric = sideOf(e, 'electric', data);
  const gasoline = sideOf(e, 'gasoline', data);
  const evModel = data.evModels.find((m) => m.id === ev.model);
  const counted = (l: { kind: string }) => l.kind === 'subsidy' || l.kind === 'recycling';
  let otherSubsidy: string | null = null;
  if (!electric.lines.some(counted)) {
    const ends: string[] = [];
    for (const { model, plan } of rankingPairs(data)) {
      if (model.plateClass !== plate || model.id === ev.model) continue;
      const l = purchaseLedger('electric', { ...base, gasolineModel, electricModel: model.id, energyPlan: plan.id } as Situation, data).ledger;
      for (const x of l.lines) if (counted(x)) ends.push(x.deadline?.date ?? x.validTo);
    }
    otherSubsidy = maxDate(ends);
  }
  return {
    county,
    countyName: rz(e.jurisdiction.name),
    countyStatus: j.status,
    scrap,
    scrapScooter: base.scrap,
    plate,
    date,
    checkedOn: e.dataCheckedOn,
    electric,
    gasoline,
    difference: e.comparison.purchaseGap,
    differenceHigh: e.comparison.purchaseGapHigh,
    verdict: verdictOf(e.comparison.purchaseGap),
    likeForLike: { verdict: e.comparison.likeForLike.verdict, note: rz(e.comparison.likeForLike.note) },
    deadlines: deadlinesOf(electric, gasoline),
    swapOnly: !!evModel && evModel.battery.system !== 'home',
    otherSubsidy,
    messages: e.messages.map(rzMsg),
  };
}

/** The least favourable case (largest difference) among cases; ties keep the first. Unverified counties are left out. */
export function worstOf(cases: BuyCase[]): BuyCase {
  const pool = cases.filter((c) => c.countyStatus !== 'not-verified');
  const list = pool.length ? pool : cases;
  if (!list.length) throw new Error('[home-money] worstOf() needs at least one case');
  return list.reduce((w, c) => (c.difference > w.difference ? c : w));
}

// ---------------------------------------------------------------------------------------------
// money.month

const ENERGY_ITEMS = new Set(['energy', 'plan-fee', 'setup-fee']);
const sumBounds = (items: { monthly: Bounds }[]): Bounds => items.reduce((a, i) => ({ low: a.low + i.monthly.low, typical: a.typical + i.monthly.typical, high: a.high + i.monthly.high }), { low: 0, typical: 0, high: 0 });

/**
 * money.month[km]: what fuel or power costs a month at `km` (default petrol scooter: the one of the
 * default buy case on that date). Any positive km works; the table uses HOME_KM.
 */
export function monthCase(km: number, opts: { date?: string; gasolineModel?: string; county?: JurisdictionId } = {}, data: EconDataset = econData): MonthCase {
  const date = taiwanDay(opts.date);
  const county = opts.county ?? DEFAULTS.county;
  const base = baseSituation(county, DEFAULTS.scrap, date, km);
  const gasolineModel = opts.gasolineModel ?? cheapestGas(base, data);
  const options: (MonthOption & { system: string; monthlyFee: number })[] = [];
  let petrol: MonthCase['petrol'] | null = null;
  for (const { model, plan } of rankingPairs(data)) {
    const e = evaluate({ ...base, gasolineModel, electricModel: model.id, energyPlan: plan.id }, data);
    if (!petrol) {
      const fuel = e.gasoline.running.items.filter((i) => i.id === 'energy');
      petrol = { model: gasolineModel, name: rz(e.gasoline.purchase.model.name), monthly: sumBounds(fuel) };
    }
    options.push({
      model: model.id,
      name: rz(model.name),
      plan: plan.id,
      planName: rz(plan.name),
      contract: rz(plan.contract),
      monthly: sumBounds(e.electric.running.items.filter((i) => ENERGY_ITEMS.has(i.id))),
      system: plan.system,
      monthlyFee: plan.monthlyFee,
    });
  }
  const strip = ({ system: _s, monthlyFee: _f, ...o }: (typeof options)[number]): MonthOption => o;
  const cheapest = (xs: typeof options) => {
    if (!xs.length) throw new Error('[home-money] no plan of this kind is available in the calculator');
    return strip(xs.reduce((a, b) => (b.monthly.typical < a.monthly.typical ? b : a)));
  };
  const home = options.filter((o) => o.system === 'home');
  if (!home.length) throw new Error('[home-money] no scooter that charges at home is available in the calculator');
  const typ = home.map((o) => o.monthly.typical);
  return {
    km,
    date,
    petrol: petrol!,
    home: {
      typical: { lo: Math.min(...typ), hi: Math.max(...typ) },
      bounds: { low: Math.min(...home.map((o) => o.monthly.low)), high: Math.max(...home.map((o) => o.monthly.high)) },
      options: home.map(strip),
    },
    swapPlan: cheapest(options.filter((o) => o.system !== 'home' && o.monthlyFee > 0)),
    swapPayg: cheapest(options.filter((o) => o.system !== 'home' && o.monthlyFee === 0)),
  };
}

// ---------------------------------------------------------------------------------------------
// money.breakeven

const kindOf = (b: BreakEven): BreakevenKind =>
  b.kind === 'ev-ahead' ? 'cheaper-on-day' : b.kind === 'breaks-even' ? 'pays-back' : b.kind === 'gas-catches-up' ? 'petrol-catches-up' : 'not-in-ten-years';

/**
 * money.breakeven[county][scrap][km]: the cheapest scooter that charges at home against the
 * cheapest 125 cc petrol scooter, over ten years, every running cost included.
 */
export function breakevenCase(county: JurisdictionId, scrap: ScrapKey, km: number, opts: { date?: string } = {}, data: EconDataset = econData): Breakeven {
  const date = taiwanDay(opts.date);
  const base = baseSituation(county, scrap, date, km);
  const gasolineModel = cheapestGas(base, data);
  const ev = cheapestEv(base, gasolineModel, data, (_m, system) => system === 'home');
  if (!ev) throw new Error('[home-money] no scooter that charges at home is available in the calculator');
  const e = evaluate({ ...base, gasolineModel, electricModel: ev.model, energyPlan: ev.plan, horizonMonths: PAYBACK_HORIZON_MONTHS }, data);
  const b = e.comparison.breakEven;
  const model = data.evModels.find((m) => m.id === ev.model)!;
  return {
    county,
    scrap,
    km,
    date,
    kind: kindOf(b),
    ...('month' in b ? { months: b.month } : {}),
    model: model.id,
    name: rz(model.name),
    plateClass: model.plateClass as Plate,
    purchaseGap: e.comparison.purchaseGap,
    monthlySaving: e.gasoline.running.averageMonthly.typical - e.electric.running.averageMonthly.typical,
    engine: b,
  };
}

// ---------------------------------------------------------------------------------------------
// money.deadline and the strip (brief 7.7)

/** Which strip sentence is true on `date` for a buy case. */
export function stripOf(c: Pick<BuyCase, 'date' | 'deadlines'> & Partial<Pick<BuyCase, 'otherSubsidy'>>, data: EconDataset = econData): Strip {
  const { date, deadlines } = c;
  const before = cmp(date, data.meta.programmeYearEnd) <= 0;
  const own = deadlines.subsidy?.last ?? null;
  const other = !own && before && c.otherSubsidy && cmp(date, c.otherSubsidy) <= 0 ? c.otherSubsidy : null;
  const subsidy = own ?? other;
  const promo = deadlines.promo && cmp(date, deadlines.promo) <= 0 ? deadlines.promo : null;
  let kind: StripKind;
  // the cheapest model counts no subsidy, but other models do on these terms: say so, never "no subsidy"
  if (other) kind = promo ? 'other-subsidy-and-promo' : 'other-subsidy';
  else if (own) kind = !before ? 'next-programme' : promo ? 'subsidy-and-promo' : 'subsidy';
  else kind = before ? 'no-subsidy' : 'nothing-confirmed';
  return { kind, date, subsidy, promo: kind === 'subsidy-and-promo' || kind === 'other-subsidy-and-promo' ? promo : null };
}

/** The strip as one sentence. Dates carry their year when it is not the reader's year. */
export function stripText(s: Strip, locale: Locale): string {
  const y = s.date.slice(0, 4);
  const d = (x: string | null) => (x ? formatDate(x, locale, x.slice(0, 4) !== y) : '');
  return fill(money.home.strip[s.kind][locale], { subsidy: d(s.subsidy), promo: d(s.promo), year: y });
}

/** 綠牌 / green plate, 白牌 / white plate. */
export const plateName = (p: Plate, locale: Locale): string => money.home.plate[p][locale];

// ---------------------------------------------------------------------------------------------
// the whole table, for one date

const memo = new Map<string, HomeMoney>();

/**
 * Every money slot for one date (default today in Taiwan). About half a second: results for the
 * published dataset are memoised per date, so the two languages and every page share one run.
 */
export function homeMoney(date?: string, data: EconDataset = econData): HomeMoney {
  const d = taiwanDay(date);
  if (data === econData && memo.has(d)) return memo.get(d)!;
  const out = computeHomeMoney(d, data);
  if (data === econData) memo.set(d, out);
  return out;
}

function computeHomeMoney(d: string, data: EconDataset): HomeMoney {
  const ids = Object.keys(data.jurisdictions) as JurisdictionId[];
  const buy = {} as HomeMoney['buy'];
  const buyWhite = {} as HomeMoney['buyWhite'];
  const breakeven = {} as HomeMoney['breakeven'];
  for (const id of ids) {
    buy[id] = { yes: buyCase(id, 'yes', { date: d }, data), no: buyCase(id, 'no', { date: d }, data) };
    buyWhite[id] = { yes: buyCase(id, 'yes', { date: d, plate: 'heavy' }, data), no: buyCase(id, 'no', { date: d, plate: 'heavy' }, data) };
    breakeven[id] = { yes: {} as Record<HomeKm, Breakeven>, no: {} as Record<HomeKm, Breakeven> };
    for (const s of SCRAP_KEYS) for (const km of HOME_KM) breakeven[id][s][km] = breakevenCase(id, s, km, { date: d }, data);
  }
  const def = buy[DEFAULTS.county][DEFAULTS.scrap];
  const month = {} as HomeMoney['month'];
  for (const km of HOME_KM) month[km] = monthCase(km, { date: d, gasolineModel: def.gasoline.model }, data);
  const strip = stripOf(def, data);
  return {
    date: d,
    phase: moneyPhase(d, moneySnapshot(data, d)),
    checkedOn: data.meta.checkedOn,
    programmeYearEnd: data.meta.programmeYearEnd,
    defaults: DEFAULTS,
    counties: ids.map((id) => ({ id, name: buy[id].yes.countyName, status: data.jurisdictions[id].status })),
    buy,
    buyWhite,
    worst: worstOf(ids.flatMap((id) => [buy[id].yes, buy[id].no, buyWhite[id].yes, buyWhite[id].no])),
    month,
    breakeven,
    deadline: { subsidy: def.deadlines.subsidy?.last ?? null, promo: strip.promo },
    strip,
  };
}

/** The table without the engine's message texts and line conditions: small enough to print into a page (figures, names, dates). */
export function slimHomeMoney(m: HomeMoney): HomeMoney {
  const slim = (c: BuyCase): BuyCase => ({
    ...c,
    messages: [],
    likeForLike: { verdict: c.likeForLike.verdict, note: { 'zh-TW': '', en: '' } },
    electric: { ...c.electric, lines: c.electric.lines.map((l) => ({ ...l, condition: { 'zh-TW': '', en: '' }, deadlineRule: undefined, quota: undefined })) },
    gasoline: { ...c.gasoline, lines: c.gasoline.lines.map((l) => ({ ...l, condition: { 'zh-TW': '', en: '' }, deadlineRule: undefined, quota: undefined })) },
  });
  const map = (t: HomeMoney['buy']) => Object.fromEntries(Object.entries(t).map(([k, v]) => [k, { yes: slim(v.yes), no: slim(v.no) }])) as HomeMoney['buy'];
  return { ...m, buy: map(m.buy), buyWhite: map(m.buyWhite), worst: slim(m.worst) };
}

/** One buy cell as figures: what a page prints into its JSON for the county switch. */
export interface CompactBuy {
  /** electric model id, its price paid and the price if "up to" lines paid nothing */
  em: string;
  e: number;
  eh: number;
  /** petrol model id and its price paid */
  gm: string;
  g: number;
  /** difference (electric − petrol) and the headline verdict */
  d: number;
  v: BuyVerdict;
  p: Plate;
  /** last day of the counted subsidies, last day of the petrol offers */
  sub: string | null;
  promo: string | null;
}
export interface CompactHomeMoney {
  date: string;
  phase: MoneyPhase;
  checkedOn: string;
  strip: Strip;
  /** zh-TW and en strip sentences, ready to print */
  stripText: L10n;
  names: Record<string, L10n>;
  buy: Record<JurisdictionId, Record<ScrapKey, CompactBuy>>;
  buyWhite: Record<JurisdictionId, Record<ScrapKey, CompactBuy>>;
  worst: CompactBuy & { county: JurisdictionId; scrap: ScrapKey };
  month: Record<HomeKm, { petrol: number; home: { lo: number; hi: number }; plan: number; planId: string; payg: number; paygId: string }>;
  breakeven: Record<JurisdictionId, Record<ScrapKey, Record<HomeKm, { k: BreakevenKind; m?: number; gap: number; save: number; em: string }>>>;
}

/**
 * Figures only (about 30 kB as JSON, 3 kB gzipped): for a page that switches county, scrapping and distance
 * without running the engine. `names` holds every county and model name used (zh-TW and en).
 */
export function compactHomeMoney(m: HomeMoney): CompactHomeMoney {
  const names: Record<string, L10n> = {};
  for (const c of m.counties) names[c.id] = c.name;
  const cb = (c: BuyCase): CompactBuy => {
    names[c.electric.model] = c.electric.name;
    names[c.gasoline.model] = c.gasoline.name;
    return { em: c.electric.model, e: c.electric.net, eh: c.electric.netHigh, gm: c.gasoline.model, g: c.gasoline.net, d: c.difference, v: c.verdict, p: c.plate, sub: c.deadlines.subsidy?.last ?? null, promo: c.deadlines.promo };
  };
  const table = (t: HomeMoney['buy']) => Object.fromEntries(Object.entries(t).map(([k, v]) => [k, { yes: cb(v.yes), no: cb(v.no) }])) as CompactHomeMoney['buy'];
  const month = {} as CompactHomeMoney['month'];
  for (const km of HOME_KM) {
    const x = m.month[km];
    names[x.swapPlan.plan] = x.swapPlan.planName;
    names[x.swapPayg.plan] = x.swapPayg.planName;
    month[km] = { petrol: x.petrol.monthly.typical, home: x.home.typical, plan: x.swapPlan.monthly.typical, planId: x.swapPlan.plan, payg: x.swapPayg.monthly.typical, paygId: x.swapPayg.plan };
  }
  const breakeven = Object.fromEntries(
    Object.entries(m.breakeven).map(([k, v]) => [
      k,
      Object.fromEntries(
        SCRAP_KEYS.map((s) => [
          s,
          Object.fromEntries(
            HOME_KM.map((km) => {
              const b = v[s][km];
              names[b.model] = b.name;
              return [km, { k: b.kind, ...(b.months !== undefined ? { m: b.months } : {}), gap: b.purchaseGap, save: b.monthlySaving, em: b.model }];
            }),
          ),
        ]),
      ),
    ]),
  ) as CompactHomeMoney['breakeven'];
  return {
    date: m.date,
    phase: m.phase,
    checkedOn: m.checkedOn,
    strip: m.strip,
    stripText: { 'zh-TW': stripText(m.strip, 'zh-TW'), en: stripText(m.strip, 'en') },
    names,
    buy: table(m.buy),
    buyWhite: table(m.buyWhite),
    worst: { ...cb(m.worst), county: m.worst.county, scrap: m.worst.scrap },
    month,
    breakeven,
  };
}

// ---------------------------------------------------------------------------------------------
// dates on which the sums change

/** Reader-visible figures of a table: two tables with the same key read the same. */
export function figuresKey(m: HomeMoney): string {
  const c = (x: BuyCase) => [x.electric.model, x.electric.net, x.electric.netHigh, x.gasoline.model, x.gasoline.net, x.electric.lines.map((l) => [l.id, l.amount, l.deadline]), x.gasoline.lines.map((l) => [l.id, l.amount, l.deadline])];
  return JSON.stringify([
    Object.values(m.buy).map((v) => [c(v.yes), c(v.no)]),
    Object.values(m.buyWhite).map((v) => [c(v.yes), c(v.no)]),
    m.worst.county,
    m.worst.scrap,
    m.worst.plate,
    HOME_KM.map((km) => m.month[km]),
    Object.values(m.breakeven).map((v) => SCRAP_KEYS.map((s) => HOME_KM.map((km) => [v[s][km].model, v[s][km].kind, v[s][km].months, v[s][km].purchaseGap, v[s][km].monthlySaving]))),
    m.strip,
    m.phase,
  ]);
}

/**
 * Candidate dates after `from` (exclusive) and up to `until` on which a sum may change: every
 * boundary the engine knows (programme, offer and credit dates) and each 1 January (the
 * default old scooter is a year older).
 */
export function candidateDates(from: string, until: string, data: EconDataset = econData): string[] {
  const out = new Set(boundaryDates(data));
  for (let y = Number(from.slice(0, 4)) + 1; y <= Number(until.slice(0, 4)); y++) out.add(`${y}-01-01`);
  return [...out].filter((d) => cmp(d, from) > 0 && cmp(d, until) <= 0).sort(cmp);
}

export interface MoneyPeriod {
  /** First day this table is true (Taiwan). */
  from: string;
  /** Last day, or null for "from `from` on, as far as the data knows". */
  to: string | null;
  money: HomeMoney;
}

/**
 * The tables for `from` (default today in Taiwan) and for each later date up to `until` (default:
 * a year after the programme year ends) on which a figure, the strip or the phase changes.
 */
export function homeMoneyTimeline(opts: { from?: string; until?: string } = {}, data: EconDataset = econData): MoneyPeriod[] {
  const from = taiwanDay(opts.from);
  const until = opts.until ?? `${Number(data.meta.programmeYearEnd.slice(0, 4)) + 1}-12-31`;
  const periods: MoneyPeriod[] = [{ from, to: null, money: homeMoney(from, data) }];
  let key = figuresKey(periods[0].money);
  for (const d of candidateDates(from, until, data)) {
    const m = homeMoney(d, data);
    const k = figuresKey(m);
    if (k === key) continue;
    periods[periods.length - 1].to = new Date(Date.parse(`${d}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
    periods.push({ from: d, to: null, money: m });
    key = k;
  }
  return periods;
}

/** homeMoneyTimeline() with each table in compact form (what a page prints for the browser). */
export function compactTimeline(periods: MoneyPeriod[]): { from: string; to: string | null; money: CompactHomeMoney }[] {
  return periods.map((p) => ({ from: p.from, to: p.to, money: compactHomeMoney(p.money) }));
}

/** The period true on `date` (default today in Taiwan); before the first period, the first. */
export function pickPeriod<T extends { from: string }>(periods: T[], date?: string): T {
  const d = taiwanDay(date);
  let pick = periods[0];
  for (const p of periods) if (cmp(p.from, d) <= 0) pick = p;
  return pick;
}

/**
 * A pre-paint script that sets <html data-money-period="N"> to the index of the period true today
 * in Taiwan, so CSS can show the matching pre-rendered variant (mark each with
 * data-money-period-show="N"). Mirrors pickPeriod(). Without JavaScript nothing is set: print a
 * variant that is true whenever it is read, or the period of the build day.
 */
export function periodScript(periods: { from: string }[]): string {
  const starts = JSON.stringify(periods.map((p) => p.from));
  return `(function(){try{var t=new Date(Date.now()+288e5).toISOString().slice(0,10),s=${starts},i=0;for(var k=0;k<s.length;k++)if(s[k]<=t)i=k;document.documentElement.dataset.moneyPeriod=String(i)}catch(e){}})()`;
}

