// The signed kerbside estimate (推估 v1, 2026-11-26), as typed slots a page can read.
//
// Source of truth: research/estimate/results.json and METHOD.md (signed 2026-11-26). Every value
// here is the published, rounded value; scripts/check-data.mjs re-reads results.json (and the
// registry, for the measured reference values) and fails if any slot here differs. This file is
// self-contained literals on purpose: client scripts can import it without pulling the 65 kB
// results file or the fact registry into a bundle.
//
//   import { est, estRange, formatEstimate, kerbSentence, checkHeadline } from '@/data/estimate';
//   est.co.dozen.add               // { lo: 0.05, mid: 0.3, hi: 1, unit: 'ppm', kind: 'estimate', ... }
//   formatEstimate('co.dozen.add', 'zh-TW').text   // '約 0.05 到 1 ppm'
//   kerbSentence('dozen', 'zh-TW')                 // '多出來的量，和街上原本就有的差不多。'
//
// Rules this module enforces (brief section 4.2):
// - An estimate is a range. `mid` exists only for drawing density (air.ts) and rule choices;
//   never print it.
// - What the pack adds is rounded to one significant figure, totals to one decimal place.
// - A value under 0.01 prints as 不到 0.01 / under 0.01.
// - Where it applies: an adult's nose at 1.5 m, a 90-second average, beside the pack.

import type { L10n, Locale, ReaderKind } from './types.ts';
import { t } from './types.ts';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const estimateMeta = {
  version: 'v1',
  date: '2026-11-26',
  /** 推估 v1・2026-11-26 / Estimate v1 · 2026-11-26: print on every estimate sheet. */
  stamp: t('推估 v1・2026-11-26', 'Estimate v1 · 2026-11-26'),
  method: 'research/estimate/METHOD.md',
  results: 'research/estimate/results.json',
  model: 'research/estimate/model.mjs',
  /** Monte Carlo draws per scenario and the seed, as recorded in results.json. */
  runs: 30000,
  seed: 20261126,
  /** Where the numbers apply, said once in every sheet. */
  appliesTo: t(
    '大人鼻子的高度（1.5 公尺）、90 秒的平均、站在這排機車旁邊。',
    "An adult's nose (1.5 m), averaged over 90 seconds, standing beside the pack.",
  ),
  /** The first-use gloss (brief 4.2 rule 8). */
  gloss: t('這是算的，不是量的，所以給一個範圍。', 'This is worked out, not measured, so we give a range.'),
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScenarioKey = 'few' | 'dozen' | 'full';
export const scenarioKeys = ['few', 'dozen', 'full'] as const satisfies readonly ScenarioKey[];
/** The scenario every single-scenario picture, chart and film uses. */
export const defaultScenario: ScenarioKey = 'dozen';

export type EstUnit = 'ppm' | 'ppb' | 'ug/m3' | 'mg/m3' | 'g/h' | 'g' | 'L' | 'can' | 'm' | 'vehicles' | 's' | 'h' | 'percent' | 'ratio' | 'm/s' | 'count' | 'g/h-fuel' | 'mg/h';

export const estUnitLabels: Record<EstUnit, L10n> = {
  ppm: t('ppm', 'ppm'),
  ppb: t('ppb', 'ppb'),
  'ug/m3': t('微克／立方公尺', 'µg/m³'),
  'mg/m3': t('毫克／立方公尺', 'mg/m³'),
  'g/h': t('公克／小時', 'g an hour'),
  g: t('公克', 'g'),
  L: t('公升', 'litres'),
  can: t('罐', 'cans'),
  m: t('公尺', 'm'),
  vehicles: t('輛', 'scooters'),
  s: t('秒', 'seconds'),
  h: t('小時', 'hours'),
  percent: t('%', '%'),
  ratio: t('倍', 'times'),
  'm/s': t('公尺／秒', 'm/s'),
  count: t('個', ''),
  'g/h-fuel': t('公克燃油／小時', 'g of fuel an hour'),
  'mg/h': t('毫克／小時', 'mg an hour'),
};

/** Short unit symbol for beside a big number (ppm, ppb, µg/m³ stay symbols in both languages). */
export const estUnitSymbol: Partial<Record<EstUnit, L10n>> = {
  'ug/m3': t('µg/m³', 'µg/m³'),
  'mg/m3': t('mg/m³', 'mg/m³'),
};

/** A published range. `mid` is for drawing density and rules only: never print it. */
export interface EstRange {
  lo: number;
  mid?: number;
  hi: number;
  unit: EstUnit;
  /** The reader chip this value carries. */
  kind: ReaderKind;
  /** How it is rounded for print. */
  rounding: 'sf1' | 'dp1' | 'as-given' | 'integer' | 'half';
  /** Registry fact that backs a measured or official value (check-data compares them). */
  factId?: string;
  /** Anchor on /estimate/ that explains it (the sheet's 完整算法 button). */
  anchor?: EstimateAnchor;
}

export type EstimateAnchor = 'numbers' | 'recipe' | 'count' | 'check' | 'range' | 'drawing' | 'limits' | 'answers' | 'measure';

const est1 = (lo: number, mid: number, hi: number, unit: EstUnit, anchor: EstimateAnchor = 'numbers'): EstRange => ({ lo, mid, hi, unit, kind: 'estimate', rounding: 'sf1', anchor });
const tot1 = (lo: number, mid: number, hi: number): EstRange => ({ lo, mid, hi, unit: 'ppm', kind: 'estimate', rounding: 'dp1', anchor: 'numbers' });

// ---------------------------------------------------------------------------
// Scenarios (results.json → scenarios[].call)
// ---------------------------------------------------------------------------

export interface Scenario {
  key: ScenarioKey;
  /** results.json key ('fullbox' there). */
  resultsKey: 'few' | 'dozen' | 'fullbox';
  /** Scooters queued beside you. */
  count: { lo: number; hi: number };
  /** Scooters a picture draws (inside `count`; G1, G4 and the film draw the dozen). */
  drawn: number;
  /** Distance to the nearest tailpipe, metres (/estimate/ only). */
  nearest_m: { lo: number; hi: number };
  /** Switch label (brief 3.2 screen 4). */
  name: L10n;
  /** Name with its count, for tables and sheets: 十來輛（8 到 20 輛）. */
  longName: L10n;
  /** Where the counts come from, in one line (/estimate/#count). */
  basis: L10n;
}

export const scenarios: Record<ScenarioKey, Scenario> = {
  few: {
    key: 'few',
    resultsKey: 'few',
    count: { lo: 2, hi: 5 },
    drawn: 4,
    nearest_m: { lo: 2, hi: 4 },
    name: t('幾輛', 'A few'),
    longName: t('幾輛（2 到 5 輛）', 'A few (2 to 5 scooters)'),
    basis: t(
      '運研所量過最冷清的路口，一小時約 819 輛機車，一個紅燈每個方向約 3 到 10 輛。',
      "At the quietest junction the Institute of Transportation counted, about 819 scooters passed an hour: about 3 to 10 per direction per red.",
    ),
  },
  dozen: {
    key: 'dozen',
    resultsKey: 'dozen',
    count: { lo: 8, hi: 20 },
    drawn: 16,
    nearest_m: { lo: 0.7, hi: 3 },
    name: t('十來輛', 'A dozen or so'),
    longName: t('十來輛（8 到 20 輛）', 'A dozen or so (8 to 20 scooters)'),
    basis: t(
      '停等區停了一部分：離你 10 公尺內大約 8 輛（4 到 13 輛）。',
      'A partly filled stop box: about 8 scooters (4 to 13) within 10 metres of you.',
    ),
  },
  full: {
    key: 'full',
    resultsKey: 'fullbox',
    count: { lo: 25, hi: 45 },
    drawn: 35,
    nearest_m: { lo: 0.3, hi: 1.5 },
    name: t('停滿', 'Full box'),
    longName: t('停滿（25 到 45 輛）', 'A full stop box (25 to 45 scooters)'),
    basis: t(
      '最忙的路口：一個方向一小時約 1,500 輛機車，一個 83 秒的紅燈約停 34 輛。',
      'The busiest junction: about 1,500 scooters an hour in one direction, about 34 stopped through an 83-second red.',
    ),
  },
};

// ---------------------------------------------------------------------------
// The air slots
// ---------------------------------------------------------------------------

export type Pollutant = 'co' | 'benzene' | 'pm25';

/** What the pack adds, per scenario (results.json → scenarios[].publish, 1 s.f.). */
const add: Record<Pollutant, Record<ScenarioKey, EstRange>> = {
  co: {
    few: est1(0.007, 0.06, 0.3, 'ppm'),
    dozen: est1(0.05, 0.3, 1, 'ppm'),
    full: est1(0.1, 0.5, 2, 'ppm'),
  },
  benzene: {
    few: est1(0.01, 0.1, 0.8, 'ppb'),
    dozen: est1(0.09, 0.6, 3, 'ppb'),
    full: est1(0.2, 1, 5, 'ppb'),
  },
  pm25: {
    few: est1(0.02, 0.2, 2, 'ug/m3'),
    dozen: est1(0.09, 0.9, 7, 'ug/m3'),
    full: est1(0.2, 2, 10, 'ug/m3'),
  },
};

/** Carbon monoxide added plus what the street holds (results.json → co.total at 1.5 m, 1 d.p.). */
const coTotal: Record<ScenarioKey, EstRange> = {
  few: tot1(0.2, 0.4, 1.0),
  dozen: tot1(0.3, 0.7, 1.6),
  full: tot1(0.4, 1.0, 2.2),
};

const ref = (value: number, unit: EstUnit, kind: ReaderKind, factId?: string) => ({ value, unit, kind, factId });

/**
 * Every slot of brief section 3.3 that comes from the estimate or the reference values beside it.
 * Money slots live in src/lib/home-money.ts (lane I); `film.duration` in the film timeline.
 */
export const est = {
  meta: estimateMeta,
  scn: scenarios,
  co: {
    few: { add: add.co.few, total: coTotal.few },
    dozen: { add: add.co.dozen, total: coTotal.dozen },
    full: { add: add.co.full, total: coTotal.full },
  },
  benzene: {
    few: { add: add.benzene.few },
    dozen: { add: add.benzene.dozen },
    full: { add: add.benzene.full },
  },
  pm25: {
    few: { add: add.pm25.few },
    dozen: { add: add.pm25.dozen },
    full: { add: add.pm25.full },
  },
  /** What the street already holds. */
  bg: {
    co: {
      /** Traffic stations, 2025 annual mean, ppm. Printed as 0.5 (see `shown`). */
      traffic: { ...ref(0.54, 'ppm', 'measured', 'moenv-co-stations-2025'), shown: 0.5 },
      /** General stations, 2025 annual mean, ppm. */
      general: { ...ref(0.24, 'ppm', 'measured', 'moenv-co-stations-2025'), shown: 0.2 },
    },
    /** PM2.5 national annual mean 2025, µg/m³ (13.4; printed 13). */
    pm25: { ...ref(13.4, 'ug/m3', 'measured', 'moenv-co-stations-2025'), shown: 13 },
    /** Benzene, a deliberately wide secondary range, ppb. */
    benzene: { lo: 0.5, hi: 4, unit: 'ppb' as const, kind: 'measured' as ReaderKind, rounding: 'as-given' as const, confidence: 'secondary' as const },
  },
  /** How far to trust each (METHOD §11). */
  confidence: {
    co: { level: 'medium' as const, word: t('中', 'medium'), why: t('大小對了；中間那個數字可能差到三倍左右。', 'The size is right; the middle value could be off about three-fold.') },
    benzene: { level: 'low' as const, word: t('低', 'low'), why: t('可能差五到十倍；台灣機車廢氣裡的苯還沒有人量過。', 'Could be off five- to ten-fold; the benzene in Taiwanese scooter exhaust has not been measured.') },
    pm25: { level: 'low' as const, word: t('低', 'low'), why: t('數字本身不準；「比街上原本就有的少很多」這句話比較可靠。', 'The value itself is uncertain; "much less than the street already holds" is the reliable part.') },
  },
  /** One idling scooter (results.json → fleet.fleetMeanCO_gph, P5 / P50 / P95). */
  emit: {
    co: {
      gPerHour: { lo: 8, mid: 15, hi: 27, unit: 'g/h', kind: 'estimate', rounding: 'integer', anchor: 'recipe' } satisfies EstRange,
      /** Through one 90-second red: ÷ 40 (an hour holds forty 90-second reds). */
      perRed_g: { lo: 0.2, mid: 0.4, hi: 0.7, unit: 'g', kind: 'estimate', rounding: 'sf1', anchor: 'recipe' } satisfies EstRange,
      /** The same as gas at 25 °C and one atmosphere (× 24.45 L ÷ 28.01 g), litres, 2 s.f. */
      perRed_L: { lo: 0.18, mid: 0.34, hi: 0.59, unit: 'L', kind: 'estimate', rounding: 'as-given', anchor: 'recipe' } satisfies EstRange,
      /** In 330 mL drinks cans, to the nearest half can (signed off, brief 12.1). */
      perRed_can: { lo: 0.5, mid: 1, hi: 2, unit: 'can', kind: 'estimate', rounding: 'half', anchor: 'recipe' } satisfies EstRange,
      /** The can line as words (screen 2 chip). Exact cans: 0.55 / 1.02 / 1.79. */
      canWords: t('大約一罐（半罐到快兩罐）', 'about one can (half a can to nearly two)'),
      /** The sum, as the sheet draws it. */
      perRedSum: {
        reds: 40,
        canMl: 330,
        molarVolume_L: 24.45,
        molarMass_g: 28.01,
        exactCans: { lo: 0.55, mid: 1.02, hi: 1.79 },
      },
    },
    /** Benzene, mg an hour (fleet mean; /estimate/ only, with its caveat). */
    benzene_mgPerHour: { lo: 30, mid: 80, hi: 300, unit: 'mg/h', kind: 'estimate', rounding: 'sf1', anchor: 'recipe' } satisfies EstRange,
  },
  /** The one Taiwanese anchor (METHOD §6a; results.json → validation). */
  xcheck: {
    iot: {
      /** Rise seen at the one junction with a clear rise (Mingcheng), ppm. */
      observed: { lo: 0.8, hi: 1.2, unit: 'ppm', kind: 'measured', rounding: 'as-given', factId: 'iot-waiting-area-co-2024', anchor: 'check' } satisfies EstRange,
      /** The model run at that sensor's position and the site's wind (validation.both), ppm. */
      model: { lo: 0.4, mid: 0.8, hi: 1.8, unit: 'ppm', kind: 'estimate', rounding: 'as-given', anchor: 'check' } satisfies EstRange,
      /** With the pedestrian's own assumptions the model gives about this many times the observed. */
      pedestrianOverSensor: 2,
      sitesWithClearRise: 1,
      sitesCompared: 4,
    },
  },
  /** WHO 15-minute carbon monoxide guideline (2021 Table 0.2, retained; WHO 2010). */
  who: {
    co15min_mg: ref(100, 'mg/m3', 'official', 'who-no2-co-guideline'),
    /** 100 ÷ 1.146 = 87.3, printed 約 87. */
    co15min_ppm: { ...ref(87, 'ppm', 'official', 'who-no2-co-guideline'), exact: 87.3 },
    /** At 25 °C: 1 ppm CO = 1.146 mg/m³. */
    mgPerPpm: 1.146,
  },
  /** Measured reference values (registry facts; check-data compares). */
  meas: {
    iot: {
      sites: ref(10, 'count', 'measured', 'iot-study-design'),
      co: {
        /** Highest waiting-area minute at three junctions, ppm, in chart order. */
        peaks: [0.5, 0.62, 1.3] as const,
        peaksFact: 'iot-waiting-area-co-2024',
        peakSites: 3,
      },
      pm25: { lo: 4, hi: 14, unit: 'ug/m3', kind: 'measured', rounding: 'as-given', factId: 'iot-waiting-area-pm25-2024' } satisfies EstRange,
      /** What the pack adds to PM2.5 in the dozen scenario, said with the IOT range (METHOD §6c). */
      pm25PackAddsAbout: 1,
    },
    taipei: {
      co: { roadside: ref(0.8, 'ppm', 'measured', 'taipei-roadside-co-2024'), year: 2024 },
    },
  },
  signal: {
    /** How long pedestrians wait at the Institute's exclusive-phase junctions, seconds. */
    pedWait: { lo: 85, hi: 115, unit: 's', kind: 'official', rounding: 'as-given', factId: 'iot-pedestrian-wait' } satisfies EstRange,
    /** The red the estimate models. */
    redLength_s: 90,
  },
  child: {
    /** Air breathed per kilogram, child against adult. A breathing-rate fact, not an estimate. */
    airPerKg: { lo: 1.5, hi: 2, unit: 'ratio', kind: 'study', rounding: 'as-given', factId: 'child-air-per-kg' } satisfies EstRange,
  },
  commute: {
    /** Taipei, one morning hour, mean personal PM2.5, all sources (Chuang 2020). */
    pm25: { scooter: 53.6, walking: 42.7, bus: 34.7, car: 26.2, metro: 21.7, unit: 'ug/m3' as const, kind: 'measured' as ReaderKind, factId: 'commute-scooter-vs-subway-chuang2020' },
  },
  inspect: {
    /** Share of all inspection-reading carbon monoxide in the highest tenth of readings, %. */
    top10share: { lo: 30, hi: 45, unit: 'percent', kind: 'derived', rounding: 'as-given', factId: 'inspection-top-tenth-co-share' } satisfies EstRange,
  },
  /** The few counts the recipe sheet draws (/estimate/#recipe and #count). */
  recipe: {
    inspectionReadings: 9067160,
    fuelFlow_gph: { lo: 80, mid: 120, hi: 200, unit: 'g/h-fuel', kind: 'study', rounding: 'as-given' } satisfies EstRange,
    windSpeed_ms: { lo: 0.3, mid: 0.8, hi: 2, unit: 'm/s', kind: 'estimate', rounding: 'as-given' } satisfies EstRange,
    busiest: { perHourAllApproaches: 5974, perApproachHour: 1494, perApproachHourShown: 1500, redSeconds: 83, perRed: 34 },
    /** How much each input moves the dozen median (METHOD §7), × from its low end to its high end. */
    spread: { wind: 4.3, meander: 4, fuelFlow: 2.5, scooters: 2.1, nearest: 1.8 },
  },
} as const;

// ---------------------------------------------------------------------------
// Slot lookup by name (for components that take a slot id)
// ---------------------------------------------------------------------------

export type EstimateRangeSlot =
  | `co.${ScenarioKey}.add`
  | `co.${ScenarioKey}.total`
  | `benzene.${ScenarioKey}.add`
  | `pm25.${ScenarioKey}.add`
  | 'emit.co.gPerHour'
  | 'emit.co.perRed_g'
  | 'emit.co.perRed_L'
  | 'emit.co.perRed_can'
  | 'xcheck.iot.observed'
  | 'xcheck.iot.model'
  | 'meas.iot.pm25'
  | 'signal.pedWait'
  | 'child.airPerKg'
  | 'inspect.top10share'
  | `time.hoursPerYear.${RedsPerDay}`;

export const estimateRangeSlots: EstimateRangeSlot[] = [
  ...scenarioKeys.flatMap((s) => [`co.${s}.add`, `co.${s}.total`, `benzene.${s}.add`, `pm25.${s}.add`] as EstimateRangeSlot[]),
  'emit.co.gPerHour',
  'emit.co.perRed_g',
  'emit.co.perRed_L',
  'emit.co.perRed_can',
  'xcheck.iot.observed',
  'xcheck.iot.model',
  'meas.iot.pm25',
  'signal.pedWait',
  'child.airPerKg',
  'inspect.top10share',
  'time.hoursPerYear.2',
  'time.hoursPerYear.4',
  'time.hoursPerYear.6',
];

/** The range behind a slot id. Throws on an unknown slot, so a typo fails the build. */
export function estRange(slot: EstimateRangeSlot): EstRange {
  const parts = slot.split('.');
  if (parts[0] === 'time') return hoursPerYear(Number(parts[2]) as RedsPerDay);
  let node: unknown = est;
  for (const p of parts) node = (node as Record<string, unknown> | undefined)?.[p];
  const r = node as EstRange | undefined;
  if (!r || typeof r.lo !== 'number' || typeof r.hi !== 'number') throw new Error(`[estimate] Unknown or incomplete slot "${slot}"`);
  return r;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const UNDER = 0.01;

/** Format one number as published: no digit added, locale grouping, tabular-friendly. */
export function formatEstNumber(n: number, rounding: EstRange['rounding'], locale: Locale): string {
  const lc = locale === 'en' ? 'en' : 'zh-TW';
  if (rounding === 'dp1') return new Intl.NumberFormat(lc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
  if (rounding === 'integer') return new Intl.NumberFormat(lc, { maximumFractionDigits: 0 }).format(n);
  return new Intl.NumberFormat(lc, { maximumFractionDigits: 6 }).format(n);
}

export interface FormattedRange {
  /** '0.05' or '不到 0.01' / 'under 0.01'. */
  lo: string;
  hi: string;
  /** Unit as printed beside the number: 'ppm', '微克／立方公尺', 'µg/m³' … */
  unit: string;
  /** The full phrase with 約: '約 0.05 到 1 ppm' / 'about 0.05 to 1 ppm'. */
  text: string;
  /** The phrase without the unit: '約 0.05 到 1'. */
  textNoUnit: string;
  /** True when the low end printed as 不到 0.01. */
  loUnder: boolean;
  kind: ReaderKind;
  /** /estimate/#… for the sheet's 完整算法 button (estimates only). */
  anchor?: EstimateAnchor;
}

/**
 * A range as a reader sees it. Pass a slot id or an EstRange.
 *   formatEstimate('co.dozen.add', 'zh-TW').text   // '約 0.05 到 1 ppm'
 *   formatEstimate('co.few.add', 'en').text         // 'under 0.01 to about 0.3 ppm'
 * `unitStyle: 'symbol'` prints µg/m³ instead of 微克／立方公尺 (beside a big number).
 */
export function formatEstimate(
  slotOrRange: EstimateRangeSlot | EstRange,
  locale: Locale,
  opts: { unitStyle?: 'words' | 'symbol' } = {},
): FormattedRange {
  const r = typeof slotOrRange === 'string' ? estRange(slotOrRange) : slotOrRange;
  const zh = locale === 'zh-TW';
  const loUnder = r.lo < UNDER;
  const lo = loUnder ? (zh ? '不到 0.01' : 'under 0.01') : formatEstNumber(r.lo, r.rounding, locale);
  const hi = formatEstNumber(r.hi, r.rounding, locale);
  const unitL10n = (opts.unitStyle === 'symbol' && estUnitSymbol[r.unit]) || estUnitLabels[r.unit];
  const unit = unitL10n[locale];
  const sp = unit === '%' ? '' : ' ';
  let textNoUnit: string;
  if (zh) textNoUnit = loUnder ? `${lo} 到約 ${hi}` : `約 ${lo} 到 ${hi}`;
  else textNoUnit = loUnder ? `${lo} to about ${hi}` : `about ${lo} to ${hi}`;
  const text = unit ? `${textNoUnit}${sp}${unit}` : textNoUnit;
  return { lo, hi, unit, text, textNoUnit, loUnder, kind: r.kind, anchor: r.anchor };
}

/** A single reference value as printed: bg.co.traffic → '約 0.5 ppm'. */
export function formatReference(value: number, unit: EstUnit, locale: Locale, opts: { about?: boolean } = {}): string {
  const n = formatEstNumber(value, 'as-given', locale);
  const u = estUnitLabels[unit][locale];
  const about = opts.about ?? true;
  if (locale === 'zh-TW') return `${about ? '約 ' : ''}${n}${u === '%' ? '' : ' '}${u}`;
  return `${about ? 'about ' : ''}${n}${u === '%' ? '' : ' '}${u}`;
}

// ---------------------------------------------------------------------------
// Hours a year at red lights, and the dose arithmetic (本站計算)
// ---------------------------------------------------------------------------

export type RedsPerDay = 2 | 4 | 6;
export const redsPerDayOptions = [2, 4, 6] as const satisfies readonly RedsPerDay[];
export const defaultRedsPerDay: RedsPerDay = 4;
/** A red light's wait, seconds, for the year arithmetic. */
export const waitPerRed_s = { lo: 60, hi: 90 } as const;

/** Round half to even (36.5 → 36, 54.75 → 55), the rounding the brief's figures use. */
function roundHalfEven(x: number): number {
  const f = Math.floor(x);
  const d = x - f;
  if (Math.abs(d - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1;
  return Math.round(x);
}

/** Hours a year spent waiting at red lights: reds × 60–90 s × 365. */
export function hoursPerYear(reds: RedsPerDay): EstRange & { exact: { lo: number; hi: number }; days: { lo: number; hi: number } } {
  const exactLo = (reds * waitPerRed_s.lo * 365) / 3600;
  const exactHi = (reds * waitPerRed_s.hi * 365) / 3600;
  return {
    lo: roundHalfEven(exactLo),
    hi: roundHalfEven(exactHi),
    unit: 'h',
    kind: 'derived',
    rounding: 'integer',
    exact: { lo: exactLo, hi: exactHi },
    days: { lo: exactLo / 24, hi: exactHi / 24 },
  };
}

/** time.hoursPerYear[2|4|6] */
export const time = {
  hoursPerYear: { 2: hoursPerYear(2), 4: hoursPerYear(4), 6: hoursPerYear(6) } as Record<RedsPerDay, ReturnType<typeof hoursPerYear>>,
  /** The whole span the film and /questions/one-red-light/ quote: 12 to 55 hours. */
  span: { lo: hoursPerYear(2).lo, hi: hoursPerYear(6).hi },
};

/**
 * What four reds a day beside a dozen scooters add to a day's mean carbon monoxide (METHOD §9):
 * reds × 90 s × co.dozen.add.mid ÷ 86,400 s, as a share of the general-station background.
 */
export function doseDayShare(reds: RedsPerDay = 4) {
  const addedPpm24h = (reds * est.signal.redLength_s * (est.co.dozen.add.mid as number)) / 86400;
  const shareOfGeneralPct = (addedPpm24h / est.bg.co.general.value) * 100;
  const shareOfTrafficPct = (addedPpm24h / est.bg.co.traffic.value) * 100;
  return { reds, addedPpm24h, shareOfGeneralPct, shareOfTrafficPct, underPct: 1, kind: 'derived' as ReaderKind };
}
export const dose = { dayShare: doseDayShare(4) };

// ---------------------------------------------------------------------------
// The drawing rule (brief 5.1), so art, film and cards compute the same numbers
// ---------------------------------------------------------------------------

/** Rings and dots of the street's own air per 120 × 120 px reference patch. */
export const AIR_BASE_PER_PATCH = 6;

/** Extra rings per patch where people stand: round(6 × add ÷ bg.co.traffic), at least 1. */
export function extraRings(scn: ScenarioKey, which: 'lo' | 'mid' | 'hi' = 'mid'): number {
  const a = est.co[scn].add[which] as number;
  return Math.max(1, Math.round((AIR_BASE_PER_PATCH * a) / est.bg.co.traffic.value));
}

/** Rings in a patch beside the pack (base + extra): the dozen gives 7 / 9 / 17 for lo / mid / hi. */
export function ringsPerPatch(scn: ScenarioKey, which: 'lo' | 'mid' | 'hi' = 'mid'): number {
  return AIR_BASE_PER_PATCH + extraRings(scn, which);
}

/** add.mid ÷ bg.co.traffic, the ratio the screen 4 rule reads. Never print it. */
export function addOverBackground(scn: ScenarioKey): number {
  return (est.co[scn].add.mid as number) / est.bg.co.traffic.value;
}

// ---------------------------------------------------------------------------
// Rule-based sentences (brief 4.2 rule 7)
// ---------------------------------------------------------------------------

export type KerbRule = 'less' | 'similar' | 'more';

const kerbSentences: Record<KerbRule, L10n> = {
  less: t('多出來的量，比街上原本就有的少。', 'What the scooters add is less than the street already holds.'),
  similar: t('多出來的量，和街上原本就有的差不多。', 'What the scooters add is about as much as the street already holds.'),
  more: t('多出來的量，比街上原本就有的多。', 'What the scooters add is more than the street already holds.'),
};

/** Screen 4: under 0.3 → less; 0.3 to 3 → similar; over 3 → more. */
export function kerbRule(scn: ScenarioKey): KerbRule {
  const r = addOverBackground(scn);
  if (r < 0.3) return 'less';
  if (r > 3) return 'more';
  return 'similar';
}

/** Screen 4's second body sentence for a scenario. Today: few → less; dozen and full → similar. */
export function kerbSentence(scn: ScenarioKey, locale: Locale): string {
  return kerbSentences[kerbRule(scn)][locale];
}
export const kerbSentenceTable = kerbSentences;

export type CheckRule = 'overlap' | 'higher' | 'lower';

const checkHeadlines: Record<CheckRule, L10n> = {
  overlap: t('有人量過嗎？有，和我們算的差不多', 'Has anyone measured it? Yes, and it roughly matches our estimate'),
  higher: t('有人量過嗎？有，我們算的比較高', 'Has anyone measured it? Yes. Our estimate is higher'),
  lower: t('有人量過嗎？有，我們算的比較低', 'Has anyone measured it? Yes. Our estimate is lower'),
};

/** Screen 5: compare co.dozen.total with the lowest and highest measured peak. Today: overlap. */
export function checkRule(): CheckRule {
  const tot = est.co.dozen.total;
  const peaks = est.meas.iot.co.peaks;
  const pLo = Math.min(...peaks);
  const pHi = Math.max(...peaks);
  if (tot.lo > pHi) return 'higher';
  if (tot.hi < pLo) return 'lower';
  return 'overlap';
}
export function checkHeadline(locale: Locale): string {
  return checkHeadlines[checkRule()][locale];
}
export const checkHeadlineTable = checkHeadlines;

/** The highest value screen 5's chart draws (total hi, peaks, background), ppm. */
export function chartMaxPpm(): number {
  return Math.max(est.co.dozen.total.hi, ...est.meas.iot.co.peaks, est.bg.co.traffic.value);
}

/** Screen 5's "far below the WHO 15-minute value" sentence prints only while this is true. */
export function farBelowWho(maxPpm: number = chartMaxPpm()): boolean {
  return maxPpm < est.who.co15min_ppm.exact / 4;
}

// ---------------------------------------------------------------------------
// Fixed wording that travels with the numbers
// ---------------------------------------------------------------------------

export const estimateText = {
  /** Every estimate's amount word (brief 4.2 rule 5). */
  added: t('多出來', 'added'),
  alreadyThere: t('街上原本就有', 'Already in the street'),
  addedByPack: t('這排機車多出來', 'Added by these scooters'),
  /** Screen 4's ppm gloss. */
  ppmGloss: t('ppm＝一百萬份空氣裡有幾份', 'ppm = parts in a million parts of air'),
  /** Two-item legend under every measured-beside-estimated chart (4.4). */
  legendMeasured: t('量到的', 'measured'),
  legendEstimated: t('算出來的', 'worked out'),
  /** A 90-second level counts for one tenth of a 15-minute average (4.4). */
  whoAveraging: t(
    '90 秒的量，放進 15 分鐘的平均裡，只算十分之一。',
    'A 90-second level counts for one tenth of a 15-minute average.',
  ),
  /** PM2.5 sentence for /estimate/#numbers. */
  pm25Small: t('機車讓 PM2.5 多出來的量，比街上原本就有的少很多。', 'The PM2.5 the scooters add is much less than the street already holds.'),
  /** Screen 5 quiet line: limited to fresh fuel vapour and benzene. */
  coTracksVapour: t('一氧化碳多的地方，剛排出來的油氣和苯也多。', 'Where there is more carbon monoxide, there is more fresh fuel vapour and benzene too.'),
  /** The flow the recipe sheet draws (no operators: the kerb estimate is a simulation). */
  flow: [
    t('每輛每小時排約 15 公克（8 到 27）', 'Each scooter gives off about 15 g an hour (8 to 27)'),
    t('旁邊停 8 到 20 輛', '8 to 20 scooters beside you'),
    t('風和距離把它吹淡', 'Wind and distance thin it'),
    t('大人鼻子的高度，多出約 0.05 到 1 ppm', "At an adult's nose: about 0.05 to 1 ppm added"),
  ],
  /** The cross-check paragraph (4.5), worded truthfully. */
  crossCheck: t(
    '運研所量的路口裡，只有最忙的一個看得出機車讓一氧化碳變多：最高的一分鐘，多出約 0.8 到 1.2 ppm。把我們的算法放到那支儀器的位置和當時的風，算出來差不多。照行人站的位置算，大約是它的兩倍，所以我們的數字比較可能偏高，不是偏低。另外三個路口看不出差別。',
    "Of the junctions the Institute of Transportation measured, only the busiest shows scooters raising carbon monoxide: about 0.8 to 1.2 ppm more in the highest minute. Run at that sensor's position and that day's wind, our method gives about the same. At the spot where pedestrians stand it gives about twice that, so our figures are more likely too high than too low. The other three junctions show no difference.",
  ),
  /** What the estimate cannot say (METHOD §8), for /estimate/#limits. */
  limits: [
    t('只算大人鼻子的高度（1.5 公尺）。', "Only an adult's nose height (1.5 m)."),
    t('是 90 秒的平均，不是每一秒的最高點。', 'A 90-second average, not second-by-second peaks.'),
    t('只算機車，不算同一排的汽車、公車和貨車。', 'Scooters only, not the cars, buses and lorries in the same queue.'),
    t('不是哪一個特定的路口。', 'Not any particular junction.'),
    t('不是健康評估，也不代表會造成什麼健康影響。', 'Not a health assessment, and it shows no health effect.'),
  ],
} as const;

/** Every source the estimate's numbers rest on (sources.ts ids), for /estimate/ and /sources/. */
export const estimateSourceIds = [
  'iot-2025-intersection-air-quality',
  'moenv-co-inspection-2025',
  'moenv-hc-inspection-2025',
  'moenv-air-quality-annual-2025',
  'cheng-2017-niu-yilan-inspection',
  'nguyen-2021-ijus',
  'nguyen-2025-jcie',
  'yao-2008-atmosenv',
  'tsai-2018-aaqr',
  'tsai-2023-atmosphere',
  'stockwell-2016-acp',
  'jayarathne-2018-acp',
  'kontses-2020-envres',
  'chirico-2014-acpd',
  'chien-huang-2010-jesh',
  'epa-aermod-formulation-2026',
  'epa-cal3qhc-1995',
  'au-ospm-description',
  'cwa-climate-means-1991-2020',
  'moj-road-marking-rules',
  'lan-chang-2015-itsc',
  'kenagy-2016-aqah',
  'buzzard-2009-eh',
  'wang-2015-amt',
  'cheung-2013-acp',
  'abdillah-2024-aaqr',
  'wu-2021-trd',
  'ncku-thesis-hap-benzene',
  'who-2021-aqg',
  'saksena-2007-hanoi',
  'he-gao-2020-arxiv',
  'ting-2023-envres',
] as const;
