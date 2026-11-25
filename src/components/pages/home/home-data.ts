// Everything the home page shows that is a number or a sourced claim, computed at build time
// from the fact registry (@/data) and the calculator engine (@/lib/calc). The page layout
// (src/pages/[...lang]/index.astro) only places what this returns.
//
// Rules this module enforces:
//   - no number is typed here: each value is read from a registry fact, series or the engine;
//   - citation numbers are assigned in page order, once per source, by `cites.of()`;
//   - a fact whose registry entry says `requiresCaveat` carries its caveat to the page (`notes`).

import {
  fact,
  gap,
  getSeries,
  localizeFact,
  localizeGap,
  localizeSeries,
  type EvidenceGap,
  type FactId,
  type GapId,
  type SeriesId,
  type SourceId,
} from '@/data';
import type { Locale } from '@/i18n';
import { evaluate, bestOptions, catalogue, toWaterfall, type Evaluation, type Situation } from '@/lib/calc';
import { formatDate, moneyState, snapshot, todayInTaipei } from '@/lib/site-state.data';
import type { JurisdictionId } from '@/data/econ/types';
import home from '@/i18n/pages/home';
import money from '@/i18n/pages/money';
import { fill, localize } from '@/i18n/pages/_copy';
import { readerText, type EvidenceKind } from '@/i18n/ui';

// ---------------------------------------------------------------------------------------------
// formatting

export const numberFormat = (locale: Locale, v: number, digits = 0) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'zh-TW', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);

const val = (id: FactId, key: string): number => {
  const d = fact(id).data[key];
  if (!d) throw new Error(`[home] fact ${id} has no data.${key}`);
  return d.value;
};

// ---------------------------------------------------------------------------------------------
// evidence references: badges, citation numbers, required caveats

export type RefId = FactId | GapId | SeriesId;
export interface Cite {
  id: SourceId;
  n: number;
}
export interface Evidence {
  badges: { kind: EvidenceKind; secondary: boolean }[];
  cites: Cite[];
  /** registry caveats that must sit beside the numbers (requiresCaveat) */
  notes: string[];
}

const isGap = (id: string): id is GapId => id.startsWith('gap-');
const isSeries = (id: string): id is SeriesId => {
  try {
    getSeries(id as SeriesId);
    return true;
  } catch {
    return false;
  }
};

class Citations {
  private map = new Map<SourceId, number>();
  number(id: SourceId): number {
    if (!this.map.has(id)) this.map.set(id, this.map.size + 1);
    return this.map.get(id)!;
  }
  /** Badges, citation markers and required caveats for registry items, in the order given. */
  of(locale: Locale, ...ids: RefId[]): Evidence {
    const badges: Evidence['badges'] = [];
    const cites: Cite[] = [];
    const notes: string[] = [];
    const addBadge = (kind: EvidenceKind, secondary: boolean) => {
      const same = badges.find((b) => b.kind === kind);
      if (same) same.secondary ||= secondary;
      else badges.push({ kind, secondary });
    };
    const addSources = (list: readonly SourceId[]) => list.forEach((s) => cites.find((c) => c.id === s) || cites.push({ id: s, n: this.number(s) }));
    for (const id of ids) {
      if (isGap(id)) {
        addBadge('gap', false);
        addSources(((gap(id) as EvidenceGap).sources ?? []) as SourceId[]);
      } else if (isSeries(id)) {
        const s = getSeries(id);
        addBadge(s.evidence, s.confidence === 'secondary');
        addSources(s.sources);
        const ls = localizeSeries(id, locale);
        if (ls.requiresCaveat && ls.caveat) notes.push(ls.caveat);
      } else {
        const f = localizeFact(id as FactId, locale);
        addBadge(f.evidence, f.confidence === 'secondary');
        addSources(f.citations.map((c) => c.id));
        if (f.requiresCaveat && f.caveat) notes.push(f.caveat);
      }
    }
    return { badges, cites: cites.sort((a, b) => a.n - b.n), notes: [...new Set(notes)] };
  }
  /** Citation markers for a plain list of sources (engine output). */
  sources(list: readonly SourceId[]): Cite[] {
    return [...new Set(list)].map((id) => ({ id, n: this.number(id) })).sort((a, b) => a.n - b.n);
  }
}

const who = (id: GapId, locale: Locale) => localizeGap(id, locale).whoCouldMeasure;

// ---------------------------------------------------------------------------------------------
// the money chapter: two worked buyers, from the engine

const GAS_MODELS = () => catalogue().gasolineModels.filter((m) => m.available).map((m) => m.id);
/** Engine inputs that the persona text states (a household's situation, not facts about the world). */
const MONTHLY_KM = 500; // needed by the engine; the home page shows purchase prices only, not running costs
const SCRAP = { engine: 'four-stroke' as const, builtOn: '2014-06' };

interface PersonaSpec {
  city: JurisdictionId;
  scrap: Situation['scrap'];
  plate: 'heavy' | 'any';
}

function cheapest(spec: PersonaSpec, date: string) {
  let best: { e: Evaluation; plateClass: string } | null = null;
  for (const gasolineModel of GAS_MODELS()) {
    const base = { jurisdiction: spec.city, scrap: spec.scrap, household: {}, gasolineModel, monthlyKm: MONTHLY_KM, date };
    const ranked = bestOptions(base).byNetPrice.filter((o) => spec.plate === 'any' || o.plateClass === 'heavy');
    const o = ranked[0];
    if (!o) continue;
    const e = evaluate({ ...base, electricModel: o.electricModel, energyPlan: o.energyPlan });
    // compare against the cheapest gasoline 125cc for this buyer; keep the electric option fixed by price
    if (!best || e.gasoline.purchase.net.value < best.e.gasoline.purchase.net.value) best = { e, plateClass: o.plateClass };
  }
  return best;
}

export function homeData(locale: Locale) {
  const t = localize(home, locale);
  const m = localize(money, locale);
  const c = new Citations();
  const n = (v: number, d = 0) => numberFormat(locale, v, d);

  // ---- link 1 --------------------------------------------------------------------------------
  const share = (id: FactId) => val(id, 'combined');
  const teds = localizeSeries('teds13-motorcycle-share', locale);
  const combined = teds.datasets.find((d) => d.key === 'combined')!;
  const rowKeys = ['pm25', 'nox', 'nmhc', 'co'] as const;
  const l1 = {
    pm25: n(share('teds13-mc-pm25-share'), 1),
    nox: n(share('teds13-mc-nox-share'), 1),
    nmhc: n(share('teds13-mc-nmhc-share'), 0),
    co: n(share('teds13-mc-co-share'), 1),
  };
  const link1 = {
    deck: fill(t.link1.deck, l1),
    deckEv: c.of(locale, 'teds13-mc-pm25-share', 'teds13-mc-nmhc-share', 'teds13-mc-co-share'),
    figure: {
      subtitle: fill(t.link1.figure.subtitle, { period: teds.period }),
      desc: fill(t.link1.figure.desc, l1),
      rows: rowKeys.map((k) => {
        const v = combined.points.find((p) => p.x === k)!.y!;
        return { label: readerText(teds.categories.find((cat) => cat.key === k)!.label), value: v };
      }),
      caption: teds.caveat ?? '',
      ev: c.of(locale, 'teds13-motorcycle-share'),
    },
    body: [
      { text: fill(t.link1.body[0], { share: n(val('tunnel-motorcycles-co-ting2023', 'weekdayMotorcycleShare'), 1) }), ev: c.of(locale, 'tunnel-motorcycles-co-ting2023', 'tunnel-particles-heavy-vehicles-ting2023') },
      {
        text: fill(t.link1.body[1], {
          period: localizeFact('tsai2023-trend-2013-2021', locale).period,
          benzene: n(val('tsai2023-trend-2013-2021', 'benzeneDrop')),
          hc: n(val('tsai2023-trend-2013-2021', 'hcDrop')),
        }),
        ev: c.of(locale, 'tsai2023-trend-2013-2021'),
      },
    ],
    caveat: fill(t.link1.caveat, {
      gas: n(val('tsai2023-benzene-tonnes-2021', 'gasoline2021')),
      mc: n(val('tsai2023-benzene-tonnes-2021', 'motorcycles2021')),
      benzene: n(val('tsai2023-trend-2013-2021', 'benzeneDrop')),
      hc: n(val('tsai2023-trend-2013-2021', 'hcDrop')),
    }),
    caveatEv: c.of(locale, 'tsai2023-benzene-tonnes-2021'),
    actionEv: c.of(locale, 'apca-inspection-and-reporting'),
  };

  // ---- link 2 --------------------------------------------------------------------------------
  const cm = n(val('marking-rules-turn-box', 'turnBoxGap') * 100);
  const link2 = {
    title: fill(t.link2.title, { cm }),
    deck: fill(t.link2.deck, { cm }),
    deckEv: c.of(locale, 'first-metre-sharma-kumar-2018', 'marking-rules-turn-box'),
    figure: { title: fill(t.link2.figure.title, { cm }), ev: c.of(locale, 'marking-rules-turn-box') },
    body: [
      { text: t.link2.body[0], ev: c.of(locale, 'marking-rules-turn-box') },
      { text: fill(t.link2.body[1], { min: n(val('idling-regulation', 'minutes')) }), ev: c.of(locale, 'idling-regulation') },
    ],
    caveatEv: c.of(locale, 'gap-idle-emission-rate', 'gap-scooters-per-red-light', 'first-metre-sharma-kumar-2018'),
    who: [who('gap-idle-emission-rate', locale), who('gap-scooters-per-red-light', locale)].filter(Boolean).join(locale === 'en' ? '; ' : '；'),
  };

  // ---- link 3 --------------------------------------------------------------------------------
  const stations = localizeSeries('taipei-traffic-vs-general-stations', locale);
  const xs = stations.datasets[0].points.map((p) => p.x);
  const [fromYear, toYear] = [xs[0], xs[xs.length - 1]];
  const at = (key: string, x: string | number) => stations.datasets.find((d) => d.key === key)!.points.find((p) => p.x === x)!.y!;
  const link3 = {
    gapEv: c.of(locale, 'gap-pedestrian-red-light-exposure'),
    who: who('gap-pedestrian-red-light-exposure', locale),
    body: [
      { text: fill(t.link3.body[0], { year: toYear, gap: n(val('taipei-traffic-station-gap', 'gap2024'), 1) }), ev: c.of(locale, 'taipei-traffic-station-gap') },
      { text: t.link3.body[1], ev: c.of(locale, 'wu2021-station-correlation') },
    ],
    small: {
      subtitle: fill(t.link3.small.subtitle, { unit: stations.unit === 'ug/m3' ? 'µg/m³' : stations.unit, from: fromYear, to: toYear }),
      desc: fill(t.link3.small.desc, { from: fromYear, to: toYear, gapFrom: n(val('taipei-traffic-station-gap', 'gap2017'), 1), gapTo: n(val('taipei-traffic-station-gap', 'gap2024'), 1) }),
      rows: stations.datasets
        .slice()
        .reverse()
        .map((d) => ({ label: readerText(d.label), before: at(d.key, fromYear), after: at(d.key, toYear) })),
      before: String(fromYear),
      after: String(toYear),
      caption: stations.caveat ?? '',
      ev: c.of(locale, 'taipei-traffic-vs-general-stations'),
    },
    caveatEv: c.of(locale, 'wu2021-station-correlation'),
  };

  // ---- link 4 --------------------------------------------------------------------------------
  const g1 = localizeFact('iarc-benzene-group1', locale).display;
  const g2b = localizeFact('iarc-gasoline-exhaust-2b', locale).display;
  const link4 = {
    body: [
      { text: t.link4.body[0], ev: c.of(locale, 'gap-odorants', 'odour-thresholds', 'scooter-exhaust-carbonyls') },
      { text: t.link4.body[1], ev: c.of(locale, 'co-odourless', 'odour-thresholds') },
      { text: fill(t.link4.body[2], { g1, g2b }), ev: c.of(locale, 'iarc-benzene-group1', 'who-benzene-no-safe-level', 'iarc-gasoline-exhaust-2b') },
    ],
    gapWho: who('gap-odorants', locale),
    markerEv: c.of(locale, 'tunnel-motorcycles-co-ting2023', 'gap-roadside-co-vs-who'),
    smellEv: c.of(locale, 'co-odourless', 'odour-thresholds'),
  };

  // ---- link 5 --------------------------------------------------------------------------------
  const hr = val('mj-cohort-mortality-guo2021', 'highVsLow');
  const link5 = {
    body: [{ text: fill(t.link5.body[0], { n: n(val('hei-sr23-trap-associations', 'studies')) }), ev: c.of(locale, 'hei-sr23-trap-associations') }],
    ladder: [
      { time: t.link5.ladder.t0, empty: true as const, ev: c.of(locale, 'gap-brief-exposure-harm') },
      { time: t.link5.ladder.t1, body: fill(t.link5.ladder.s1, { n: n(val('chuang2020-cardiovascular-association', 'participants')) }), ev: c.of(locale, 'chuang2020-cardiovascular-association'), scope: 'all-sources' },
      {
        time: fill(t.link5.ladder.t2, { h: n(val('mccreanor2007-london-walk', 'hours')) }),
        body: fill(t.link5.ladder.s2, { h: n(val('mccreanor2007-london-walk', 'hours')), fev1: n(val('mccreanor2007-london-walk', 'fev1Drop'), 1) }),
        ev: c.of(locale, 'mccreanor2007-london-walk'),
        scope: 'traffic',
      },
      {
        time: t.link5.ladder.t3,
        body: fill(t.link5.ladder.s3, { n: n(val('mj-cohort-mortality-guo2021', 'adults')), pct: n((hr - 1) * 100) }),
        ev: c.of(locale, 'mj-cohort-mortality-guo2021'),
        scope: 'all-sources',
      },
    ],
    gapEv: c.of(locale, 'gap-brief-exposure-harm', 'gap-tw-health-isolating-scooters'),
    walkEv: c.of(locale, 'mj-cohort-mortality-guo2021'),
    action: fill(t.link5.action, { benzene: n(Math.abs(val('wu2021-quiet-route', 'benzene'))), pm25: n(Math.abs(val('wu2021-quiet-route', 'pm25'))) }),
    actionEv: c.of(locale, 'wu2021-quiet-route'),
  };

  // ---- link 6 --------------------------------------------------------------------------------
  const chuang = localizeSeries('commute-pm25-chuang2020', locale);
  const mode = (k: string) => chuang.datasets[0].points.find((p) => p.x === k)!.y!;
  const ugm3 = 'µg/m³';
  const modes = { subway: n(mode('subway'), 1), walking: n(mode('walking'), 1), scooter: n(mode('scooter'), 1), unit: ugm3 };
  const link6 = {
    body: [
      { text: fill(t.link6.body[0], modes), ev: c.of(locale, 'commute-scooter-vs-subway-chuang2020') },
      {
        text: fill(t.link6.body[1], {
          lo: n(val('first-metre-sharma-kumar-2018', 'breathingLow') * 100),
          hi: n(val('first-metre-sharma-kumar-2018', 'breathingHigh') * 100),
          a: n(val('stroller-height-review', 'kenagy2016Low')),
          b: n(val('stroller-height-review', 'kenagy2016High')),
          max: n(val('stroller-height-review', 'buzzard2009')),
          uk: n(val('pram-height-sharma2020', 'fineParticlesUpTo')),
          am: n(Math.abs(val('stroller-height-review', 'kumar2017Morning'))),
        }),
        ev: c.of(locale, 'first-metre-sharma-kumar-2018', 'stroller-height-review', 'pram-height-sharma2020', 'gap-tw-child-height'),
      },
      { text: t.link6.body[2], ev: c.of(locale, 'who-children-vulnerable', 'gap-school-commute-pillion') },
    ],
    figure: {
      subtitle: fill(t.link6.figure.subtitle, { unit: ugm3 }),
      desc: fill(t.link6.figure.desc, modes),
      data: (['subway', 'walking', 'scooter'] as const).map((k) => ({ label: readerText(chuang.categories.find((cat) => cat.key === k)!.label), value: mode(k), highlight: k === 'scooter' })),
      caption: chuang.caveat ?? '',
      ev: c.of(locale, 'commute-pm25-chuang2020'),
    },
    caveatEv: c.of(locale, 'gap-tw-child-height', 'first-metre-sharma-kumar-2018'),
  };

  // ---- green ---------------------------------------------------------------------------------
  const green = {
    deckEv: c.of(locale, 'signal-cycle-peaks-international'),
    gapEv: c.of(locale, 'gap-pull-away-spike'),
  };

  // ---- connect -------------------------------------------------------------------------------
  const boardRefs: RefId[][] = [
    ['teds13-motorcycle-share'],
    ['first-metre-sharma-kumar-2018', 'marking-rules-turn-box'],
    ['wu2021-station-correlation'],
    ['iarc-benzene-group1', 'co-odourless'],
    ['hei-sr23-trap-associations', 'mj-cohort-mortality-guo2021'],
    ['who-children-vulnerable', 'first-metre-sharma-kumar-2018'],
  ];
  const connect = {
    links: t.connect.board.map((body, i) => {
      const ev = c.of(locale, ...boardRefs[i]);
      return { body: fill(body, { cm }), strength: ev.badges.map((b) => b.kind), secondary: ev.badges.some((b) => b.secondary), cites: ev.cites };
    }),
  };

  // ---- link 7 --------------------------------------------------------------------------------
  const ev = localizeSeries('ev-share-new-registrations', locale);
  const actual = ev.datasets.find((d) => d.kind !== 'target')!;
  const target = ev.datasets.find((d) => d.kind === 'target')!;
  const observed = actual.points.filter((p) => p.y !== null);
  const first = observed[0];
  const last = observed[observed.length - 1];
  const nextTarget = target.points.find((p) => Number(p.x) > Number(last.x))!;
  const years = [...new Set([...actual.points, ...target.points].map((p) => Number(p.x)))].sort((a, b) => a - b);
  const allYears: number[] = [];
  for (let y = years[0]; y <= years[years.length - 1]; y++) allYears.push(y);
  const pct = (v: number) => n(v, v % 1 ? 1 : 0);
  const futureTargets = target.points.filter((p) => Number(p.x) > Number(last.x));
  const link7 = {
    body: [
      { text: t.link7.body[0], ev: c.of(locale, 'teds13-electric-mc-pm25', 'gap-electrification-street-air') },
      { text: t.link7.body[1], ev: null },
      {
        text: fill(t.link7.body[2], { y1: first.x, s1: pct(first.y!), y2: last.x, s2: pct(last.y!), ty: nextTarget.x, t: pct(nextTarget.y!) }),
        ev: c.of(locale, 'ev-share-2019', 'ev-share-2025', 'netzero-ev-sales-targets'),
      },
      { text: t.link7.body[3], ev: null },
    ],
    chart: {
      years: allYears,
      actual: allYears.map((y) => actual.points.find((p) => Number(p.x) === y)?.y ?? null),
      targets: futureTargets.map((p) => ({ x: Number(p.x), y: p.y! })),
      labels: { first: { x: Number(first.x), y: first.y!, text: `${pct(first.y!)}%` }, last: { x: Number(last.x), y: last.y!, text: `${pct(last.y!)}%` } },
      fmt: (v: number) => `${pct(v)}%`,
    },
    figure: {
      subtitle: fill(t.link7.figure.subtitle, { period: ev.period }),
      desc: fill(t.link7.figure.desc, {
        y1: first.x,
        s1: pct(first.y!),
        y2: last.x,
        s2: pct(last.y!),
        targets: futureTargets.map((p) => (locale === 'en' ? `${pct(p.y!)}% by ${p.x}` : `${p.x} 年 ${pct(p.y!)}%`)).join(locale === 'en' ? ', ' : '、'),
      }),
      ev: c.of(locale, 'ev-share-new-registrations'),
    },
    caveatEv: c.of(locale, 'scooter-lane-btex-wu2021', 'gap-electrification-street-air'),
  };

  // ---- money ---------------------------------------------------------------------------------
  const today = todayInTaipei();
  const evalDate = today <= snapshot.yearEnd ? today : snapshot.yearEnd;
  const programmeYear = snapshot.yearEnd.slice(0, 4);
  const nextYear = String(Number(programmeYear) + 1);
  const state = moneyState(today, null, snapshot);
  const deadline = formatDate(snapshot.yearEnd, locale);
  const ntd = (v: number) => `NT$ ${n(Math.round(Math.abs(v)))}`;

  const persona = (spec: PersonaSpec) => {
    const found = cheapest(spec, evalDate);
    if (!found) return null;
    const { e, plateClass } = found;
    const gapValue = e.comparison.purchaseGap;
    const cityName = readerText(snapshot.cities[spec.city]?.name[locale] ?? e.jurisdiction.name[locale]);
    const cityState = moneyState(evalDate, spec.city, snapshot);
    const statusTemplate = (m.banner as Record<string, string>)[cityState.id];
    const status = cityState.city && statusTemplate ? fill(statusTemplate, { city: cityName, date: formatDate(cityState.city.asOf, locale) }) : '';
    const sources = [
      ...e.electric.purchase.listPrice.sources,
      ...e.electric.purchase.lines.flatMap((l) => l.sources),
      ...e.gasoline.purchase.listPrice.sources,
      ...e.gasoline.purchase.lines.flatMap((l) => l.sources),
    ] as SourceId[];
    return {
      parity: gapValue <= 0,
      title: fill(gapValue <= 0 ? t.money.verdictPass : t.money.verdictFail, { gap: ntd(gapValue) }),
      who: fill(t.money.who, {
        city: cityName,
        scrap: spec.scrap ? fill(t.money.withScrap, { year: spec.scrap.builtOn.slice(0, 4) }) : t.money.noScrap,
        model: plateClass === 'heavy' ? t.money.heavy : t.money.light,
      }),
      subtitle: fill(t.money.subtitle, { date: formatDate(evalDate, locale, true) }),
      caption: fill(t.money.caption, { city: cityName }),
      status,
      waterfall: (() => {
        const w = toWaterfall(e, locale);
        return { ...w, totalLabel: t.money.netEv, compare: { ...w.compare, label: t.money.netGas }, gapLabel: t.money.gapShort };
      })(),
      cites: c.sources(sources),
    };
  };
  const fail = persona({ city: 'kaohsiung', scrap: null, plate: 'heavy' });
  // the blueprint's New Taipei buyer; if a white plate does not reach parity, the nearest that does, labelled as such
  const candidates: PersonaSpec[] = [
    { city: 'new-taipei', scrap: SCRAP, plate: 'heavy' },
    { city: 'new-taipei', scrap: SCRAP, plate: 'any' },
    { city: 'taipei', scrap: SCRAP, plate: 'heavy' },
    { city: 'taipei', scrap: SCRAP, plate: 'any' },
  ];
  let pass: ReturnType<typeof persona> = null;
  for (const spec of candidates) {
    const p = persona(spec);
    if (p?.parity) {
      pass = p;
      break;
    }
  }
  const personas = [fail, pass].filter((p): p is NonNullable<typeof p> => !!p).sort((a, b) => Number(a.parity) - Number(b.parity));

  const moneyData = {
    title: fill(t.money.title, { deadline }),
    deck: fill(t.money.deck, { deadline, year: programmeYear }),
    deckEv: c.of(locale, 'econ-central-subsidy-2026', 'econ-kaohsiung-budget-exhausted'),
    body: fill(t.money.body, { fact: localizeFact('econ-swap-vs-petrol-low-mileage', locale).display }),
    bodyEv: c.of(locale, 'econ-swap-vs-petrol-low-mileage'),
    nothingConfirmed: state.nothingConfirmed,
    next2027: fill(t.money.next2027, { nextYear }),
    next2027Ev: c.of(locale, 'econ-no-2027-programme'),
    personas,
    pastNote: fill(t.money.pastNote, { year: programmeYear }),
    askPolicy: fill(t.money.askPolicy, { nextYear }),
    caveatEv: c.of(locale, 'econ-ev-entry-prices'),
    cityOptions: [{ value: '', label: t.money.cityNone }, ...Object.entries(snapshot.cities).map(([id, city]) => ({ value: id, label: readerText(city.name[locale]) }))],
    nextYear,
  };

  // ---- close ---------------------------------------------------------------------------------
  const next = {
    rideEv: c.of(locale, 'ef-older-phase-tsai2018', 'ef-mileage-co-tsai2018'),
    twoStrokeEv: c.of(locale, 'two-stroke-remaining'),
    policy: fill(t.next.roles.policy.a1, { nextYear }),
  };

  return { t, link1, link2, link3, link4, link5, link6, green, connect, link7, money: moneyData, next, cm };
}

export type HomeData = ReturnType<typeof homeData>;
