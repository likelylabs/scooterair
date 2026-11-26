// Build-time data for /electric/: the worked examples, the running-cost tables, the city
// details and the citation map, all computed from the calculator engine and the registry.
// The page layout (src/pages/[...lang]/electric.astro) only places what this returns.
//
// No number is typed here. Example situations are inputs (a place, a build date relative to
// the build day, a distance), never results; every result comes from evaluate().

import { econData } from '@/data/econ';
import type { JurisdictionId, Programme } from '@/data/econ/types';
import { fact, localizeFact, localizeSeries, seriesMatrix, shortCitation, sourceUrl, type FactId, type SeriesId, type SourceId } from '@/data';
import { DEFAULT_OFF_WINDOW_SHARE, electricRunning, evaluate, gasolineRunning, type Evaluation, type RunningCosts, type Situation } from '@/lib/calc';
import { cityMoney, formatDate, moneyPhase, snapshot, todayInTaipei } from '@/lib/site-state.data';
import { href, type Locale } from '@/i18n';
import { readerText, ui } from '@/i18n/ui';
import electric from '@/i18n/pages/electric';
import { fill, localize } from '@/i18n/pages/_copy';
import { choose, money, planKind, rankGas, renderResult, type Answers, type Rendered, type RenderCtx } from './model';

export const data = econData;
export const today = todayInTaipei();
export const yearEnd = data.meta.programmeYearEnd;
const nextDay = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
/** The first day after the 2026 purchase window (or today, if later). */
export const afterDate = today > yearEnd ? today : nextDay(yearEnd);

// ---------------------------------------------------------------------------------------------
// citations: every source the dataset cites, as a short label and a link

function collectSources(v: unknown, out: Set<string>, seen = new Set<unknown>()) {
  if (!v || typeof v !== 'object' || seen.has(v)) return;
  seen.add(v);
  if (Array.isArray(v)) return v.forEach((x) => collectSources(x, out, seen));
  for (const [k, x] of Object.entries(v)) {
    if (k === 'sources' && Array.isArray(x)) x.forEach((id) => typeof id === 'string' && out.add(id));
    else collectSources(x, out, seen);
  }
}

const citeCache = new Map<Locale, Record<string, { short: string; url: string }>>();
export function citeMap(locale: Locale): Record<string, { short: string; url: string }> {
  const hit = citeCache.get(locale);
  if (hit) return hit;
  const ids = new Set<string>();
  collectSources(data, ids);
  const out: Record<string, { short: string; url: string }> = {};
  for (const id of ids) {
    try {
      out[id] = { short: readerText(shortCitation(id as SourceId, locale)), url: sourceUrl(id as SourceId) };
    } catch {
      /* a source without a link is shown without one */
    }
  }
  citeCache.set(locale, out);
  return out;
}

export function renderCtx(locale: Locale, id: string): RenderCtx {
  const cites = citeMap(locale);
  return {
    locale,
    data,
    cite: (sid) => cites[sid] ?? null,
    id,
    tableLabel: ui.dataTable[locale],
    links: pageLinks(locale),
  };
}

export const pageLinks = (locale: Locale) => ({
  checklist: href('/electric/#checklist', locale),
  notYet: href('/electric/#not-yet', locale),
  closer: href('/electric/#closer', locale),
  noSocket: href('/electric/#no-socket', locale),
  act: href('/act/', locale),
  actKeep: href('/act/#ride', locale),
  actPolicy: href('/act/#policy', locale),
});

// ---------------------------------------------------------------------------------------------
// worked examples (V36 / V37 / V38 for fixed people), each rendered before and after the deadline

const [Y, M] = today.split('-').map(Number);
const ym = (years: number, monthShift = 0) => {
  const t = Y * 12 + (M - 1) - years * 12 + monthShift;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
};
/** The oldest build date any programme in the data still treats as a two-stroke era scooter. */
const twoStrokeYear = Math.min(...data.programmes.flatMap((p) => p.conditions.flatMap((c) => (c.kind === 'scrap-built' && c.onOrBefore ? [Number(c.onOrBefore.slice(0, 4))] : [])))) - 1;

export type ExampleKey = 'judge' | 'ntpc' | 'taitung' | 'low' | 'close' | 'parent' | 'delivery';
interface Spec {
  key: ExampleKey;
  answers: Omit<Answers, 'date'>;
  charge: boolean;
  /** tokens for the person's description */
  who: Record<string, string | number>;
}

const specs: Spec[] = [
  // the blueprint's rider judge: a nine-year-old 125cc, about 400 km, nowhere to charge
  { key: 'judge', answers: { jurisdiction: 'kaohsiung', scrap: { engine: 'four-stroke', builtOn: ym(10, 3) }, household: {}, monthlyKm: 400, plate: 'heavy', power: 'subscription' }, charge: false, who: { year: ym(10, 3).slice(0, 4), km: 400 } },
  { key: 'ntpc', answers: { jurisdiction: 'new-taipei', scrap: null, household: {}, monthlyKm: 300, plate: 'heavy', power: 'subscription' }, charge: false, who: { km: 300 } },
  { key: 'taitung', answers: { jurisdiction: 'taitung', scrap: null, household: {}, monthlyKm: 500, plate: 'heavy', power: 'subscription' }, charge: false, who: { km: 500 } },
  { key: 'low', answers: { jurisdiction: 'taipei', scrap: { engine: 'four-stroke', builtOn: ym(14, -6) }, household: {}, monthlyKm: 200, plate: 'heavy', power: 'subscription' }, charge: false, who: { year: ym(14, -6).slice(0, 4), km: 200 } },
  { key: 'close', answers: { jurisdiction: 'taipei', scrap: null, household: {}, monthlyKm: 500, plate: 'heavy', power: 'subscription' }, charge: false, who: { km: 500 } },
  { key: 'parent', answers: { jurisdiction: 'taipei', scrap: { engine: 'two-stroke', builtOn: `${twoStrokeYear}-06` }, household: { childUnder12: true }, monthlyKm: 500, plate: 'heavy', power: 'subscription' }, charge: false, who: { year: twoStrokeYear, km: 500 } },
  { key: 'delivery', answers: { jurisdiction: 'tainan', scrap: null, household: { deliveryRider: true }, monthlyKm: 1500, plate: 'heavy', power: 'subscription' }, charge: false, who: { km: 1500 } },
];

export interface Example {
  key: ExampleKey;
  answers: Omit<Answers, 'date'>;
  charge: boolean;
  tab: string;
  who: string;
  before: { rendered: Rendered; e: Evaluation } | null;
  after: { rendered: Rendered; e: Evaluation };
}

function runAt(spec: Spec, date: string, locale: Locale, id: string) {
  const a: Answers = { ...spec.answers, date };
  const c = choose(a, data);
  const e = evaluate(c.situation, data);
  const rendered = renderResult(e, { ...c, plate: a.plate, power: a.power }, renderCtx(locale, id));
  return { rendered, e };
}

export function examples(locale: Locale): Example[] {
  const T = localize(electric, locale).examples;
  const list = specs.map((spec) => ({
    key: spec.key,
    answers: spec.answers,
    charge: spec.charge,
    tab: T.people[spec.key].tab,
    who: fill(T.people[spec.key].who, spec.who),
    before: today <= yearEnd ? runAt(spec, today, locale, `ex-${spec.key}-a`) : null,
    after: runAt(spec, afterDate, locale, `ex-${spec.key}-c`),
  }));
  // the ones where it does not add up first (rider judge: worst case first)
  const rank = (x: Example) => ({ C: 0, B: 1, A: 2 })[(x.before ?? x.after).rendered.verdict];
  return list.sort((a, b) => rank(a) - rank(b));
}

// ---------------------------------------------------------------------------------------------
// running costs (#monthly): every figure from the engine at the reader's distances

export const DISTANCES = [150, 300, 500, 800, 1000, 1500];

const runSituation = (km: number, electricModel: string, energyPlan: string, gasolineModel: string): Situation => ({
  jurisdiction: 'taipei',
  scrap: null,
  household: {},
  monthlyKm: km,
  electricModel,
  energyPlan,
  gasolineModel,
  date: today,
});

/** Battery or fuel cost a month: energy, plan fee and setup fee spread over the contract (no temporary credits). */
function energyOf(r: RunningCosts): { low: number; typical: number; high: number } {
  const items = r.items.filter((i) => ['energy', 'plan-fee', 'setup-fee'].includes(i.id));
  return items.reduce((a, i) => ({ low: a.low + i.monthly.low, typical: a.typical + i.monthly.typical, high: a.high + i.monthly.high }), { low: 0, typical: 0, high: 0 });
}

const swapModels = () => data.evModels.filter((m) => m.calculator === true && m.plateClass === 'heavy' && m.battery.system !== 'home');
const homeModels = () => data.evModels.filter((m) => m.calculator === true && m.battery.system === 'home');

export function runningTables(locale: Locale) {
  const T = localize(electric, locale).monthly;
  const gas = rankGas({ jurisdiction: 'taipei', scrap: null, household: {}, monthlyKm: 500, plate: 'heavy', power: 'subscription', date: today }, data)[0].id;
  const gasModel = data.gasModels.find((m) => m.id === gas)!;
  const anyEv = swapModels()[0];
  const pairs = (kind: 'subscription' | 'payg') => swapModels().flatMap((m) => m.plans.filter((p) => planKind(data, p) === kind).map((p) => ({ m: m.id, p })));
  const H = data.meta.horizonMonths;
  const evRun = (km: number, m: string, p: string) => electricRunning(runSituation(km, m, p, gas), data, H, DEFAULT_OFF_WINDOW_SHARE);
  const cheapest = (km: number, kind: 'subscription' | 'payg') =>
    pairs(kind)
      .map(({ m, p }) => ({ m, p, cost: energyOf(evRun(km, m, p)) }))
      .sort((a, b) => a.cost.typical - b.cost.typical)[0];
  const petrolAt = (km: number) => energyOf(gasolineRunning(runSituation(km, anyEv.id, anyEv.plans[0], gas), data, H));

  const rows = DISTANCES.map((km) => {
    const petrol = petrolAt(km);
    const sub = cheapest(km, 'subscription');
    const payg = cheapest(km, 'payg');
    const home = homeModels().map((m) => ({ m: m.id, cost: energyOf(evRun(km, m.id, m.plans[0])) }));
    return { km, petrol, sub, payg, home };
  });

  // from which distance the cheapest subscription costs no more than petrol (scan in the engine's step)
  let suitsFrom: number | null = null;
  const MAX = 3000;
  for (let km = 50; km <= MAX; km += 50) {
    if (cheapest(km, 'subscription').cost.typical <= petrolAt(km).typical) {
      suitsFrom = km;
      break;
    }
  }
  // the blueprint's band (300 to 500 km), confirmed against the engine
  const bandLow = 300;
  const bandHigh = suitsFrom !== null ? Math.min(500, suitsFrom - 50) : 500;
  const bandHolds = rows.filter((r) => r.km >= bandLow && r.km <= bandHigh).every((r) => r.sub.cost.typical > r.petrol.typical);

  const planName = (id: string) => readerText(data.plans.find((p) => p.id === id)!.name[locale]);
  const modelName = (id: string) => readerText(data.evModels.find((m) => m.id === id)!.name[locale]);

  // fixed costs per year and the smoothing delta at a reference distance
  const REF = 500;
  const refEv = cheapest(REF, 'subscription');
  const ref = evaluate(runSituation(REF, refEv.m, refEv.p, gas), data);
  const fixedIds = ['maintenance', 'road-fee', 'licence-tax', 'insurance', 'inspection'] as const;
  const fixed = fixedIds.map((id) => {
    const a = ref.electric.running.items.find((i) => i.id === id);
    const g = ref.gasoline.running.items.find((i) => i.id === id);
    return {
      id,
      label: readerText((a ?? g)!.label[locale]),
      ev: a?.annual.typical ?? 0,
      gas: g?.annual.typical ?? 0,
      secondary: a?.confidence === 'secondary' || g?.confidence === 'secondary',
      note: [a?.note, g?.note].filter(Boolean).map((n) => readerText(n![locale])).filter((x, i, all) => all.indexOf(x) === i),
      sources: [...new Set([...(a?.sources ?? []), ...(g?.sources ?? [])])],
    };
  });
  const smoothingDelta = Math.max(0, ref.comparison.withoutSmoothing.gasolineMonthly - ref.gasoline.running.monthly.typical);

  // cost per km bands at the reference distance (V40)
  const perKm = (b: { low: number; typical: number; high: number }) => ({ min: b.low / REF, mid: b.typical / REF, max: b.high / REF });
  const refPayg = cheapest(REF, 'payg');
  const range = [
    { label: `${T.rows.home} · ${readerText(homeModels()[0].name[locale])}`, ...perKm(energyOf(evRun(REF, homeModels()[0].id, homeModels()[0].plans[0]))), tone: 'clean' as const },
    { label: fill(T.rows.petrol, { model: readerText(gasModel.name[locale]) }), ...perKm(petrolAt(REF)), tone: 'exhaust' as const },
    { label: T.rows.payg, ...perKm(refPayg.cost), tone: 'neutral' as const },
    { label: T.rows.sub, ...perKm(refEv.cost), tone: 'neutral' as const },
  ];

  return {
    gasModelName: readerText(gasModel.name[locale]),
    rows,
    suitsFrom,
    maxScan: MAX,
    band: bandHolds ? { low: bandLow, high: bandHigh } : null,
    planName,
    modelName,
    REF,
    fixed,
    smoothingDelta,
    range,
    plans: data.plans.filter((p) => p.calculator === true),
    homeModels: homeModels(),
    electricityNote: readerText(data.electricity.reviewNote[locale]),
    smoothingMechanism: readerText(data.fuel.smoothing.mechanism[locale]),
    smoothingSources: data.fuel.smoothing.sources,
  };
}

// ---------------------------------------------------------------------------------------------
// registry facts the page states, with citations

export const factIds = ['econ-petrol-price-smoothing', 'econ-petrol-cost-per-km', 'econ-swap-vs-petrol-low-mileage', 'econ-home-charging-cost-per-km', 'econ-motc-annual-spend', 'econ-fixed-fees', 'econ-gogoro-network', 'econ-gogoro-finances-2026', 'econ-ev-brand-share-2026-07', 'econ-no-2027-programme', 'econ-ev-entry-prices', 'econ-gas-cheapest-125', 'econ-central-subsidy-2026', 'econ-moenv-scrap-reward-2026', 'econ-kaohsiung-budget-exhausted'] as const satisfies readonly FactId[];
export const seriesIds = ['econ-monthly-energy-cost-by-mileage', 'econ-motc-spend-by-class'] as const satisfies readonly SeriesId[];

export const F = (id: (typeof factIds)[number], locale: Locale) => {
  const f = localizeFact(id, locale);
  return { ...f, statement: readerText(f.statement), caveat: f.caveat ? readerText(f.caveat) : undefined, display: readerText(f.display) };
};
export const factValue = (id: (typeof factIds)[number], key: string) => fact(id).data[key]?.value;

export function surveyChart(locale: Locale) {
  const s = localizeSeries('econ-motc-spend-by-class', locale);
  const m = seriesMatrix(s);
  return { s, m };
}

// ---------------------------------------------------------------------------------------------
// cities (#cities, V41): what each place's own programmes pay, with check dates

const amountText = (p: Programme, locale: Locale) => {
  const C = localize(electric, locale).cities;
  const a = p.amount;
  if (a.kind === 'fixed') return a.isMaximum ? fill(C.upTo, { amount: money(locale, a.value) }) : money(locale, a.value);
  if (a.kind === 'per-battery') return fill(C.perBattery, { single: money(locale, a.single), double: money(locale, a.double) });
  return fill(C.goodsTax, { amount: money(locale, a.max) });
};

export function cityDetails(locale: Locale) {
  const C = localize(electric, locale).cities;
  const ids = Object.keys(data.jurisdictions) as JurisdictionId[];
  const day = (iso: string) => formatDate(iso, locale, true);
  // the date a reader must act by, said for what it is: a purchase deadline, a scrapping deadline,
  // or a listed date the rule behind it is not confirmed for (nothing is confirmed after 2026)
  const when = (p: Programme): string => {
    const excluded = p.calculator !== true && p.calculator.reason === 'unverified';
    if (excluded) return ''; // its dates were never sourced
    if (p.kind === 'recycling-bonus') return fill(C.toScrap, { date: day(p.validTo) });
    if (p.confirmedThrough && p.confirmedThrough < p.validTo) return fill(C.toListed, { listed: day(p.validTo), confirmed: day(p.confirmedThrough) });
    return fill(C.to, { date: day(p.validTo) });
  };
  const line = (p: Programme) => ({
    name: readerText(p.name[locale]),
    amount: amountText(p, locale),
    side: p.side,
    quota: readerText(p.quota.text[locale]),
    to: day(p.validTo),
    when: when(p),
    counted: p.calculator === true,
    excluded: p.calculator === true ? '' : readerText(p.calculator.excluded[locale]),
    secondary: p.confidence === 'secondary',
    condition: readerText(p.conditionText[locale]),
  });
  const cities = Object.fromEntries(
    ids.map((id) => {
      const j = data.jurisdictions[id];
      const own = data.programmes.filter((p) => p.jurisdiction === id);
      const state = cityMoney(id, today, snapshot);
      return [
        id,
        {
          id,
          name: readerText(j.name[locale]),
          status: j.status,
          money: state.status,
          moneyAsOf: state.asOf,
          statusNote: readerText(j.statusNote[locale]),
          checked: formatDate(j.checkedOn, locale, true),
          title: fill(C.linesTitle, { city: readerText(j.name[locale]), date: formatDate(j.checkedOn, locale, true) }),
          lines: own.map(line),
          links: j.officialLinks.map((l) => ({ label: readerText(l.label[locale]), url: l.url })),
          kind: j.kind,
        },
      ];
    }),
  ) as Record<JurisdictionId, { id: JurisdictionId; name: string; status: string; money: string; moneyAsOf: string; statusNote: string; checked: string; title: string; lines: ReturnType<typeof line>[]; links: { label: string; url: string }[]; kind: string }>;
  const central = data.programmes.filter((p) => p.jurisdiction === 'central' && p.side !== 'gasoline').map(line);
  return { cities, central };
}

/** Household questions each place's programmes (plus the central ones) actually ask. */
export function flagsByCity(): Record<string, string[]> {
  const walk = (cs: Programme['conditions'], out: Set<string>) => {
    for (const c of cs) {
      if (c.kind === 'household') out.add(c.flag);
      if (c.kind === 'income') out.add('income');
      if (c.kind === 'age' && (c.max !== undefined || (c.min ?? 0) > 18)) out.add('age');
      if (c.kind === 'applicant-deadline') out.add('foreignNational');
      if (c.kind === 'any-of') walk(c.conditions, out);
    }
  };
  const out: Record<string, string[]> = {};
  const central = new Set<string>();
  // only programmes the calculator counts: a question that cannot change the result is not asked
  const counted = data.programmes.filter((p) => p.calculator === true);
  counted.filter((p) => p.jurisdiction === 'central').forEach((p) => walk(p.conditions, central));
  for (const id of Object.keys(data.jurisdictions) as JurisdictionId[]) {
    const s = new Set(central);
    counted.filter((p) => p.jurisdiction === id).forEach((p) => walk(p.conditions, s));
    // "I live in {district}" needs the district names
    if (!data.jurisdictions[id].remoteDistricts) s.delete('remoteDistrict');
    out[id] = [...s];
  }
  return out;
}

export const phaseNow = moneyPhase(today, snapshot);
