// Shared vocabulary for the cited data layer (sources, facts, series, claims policy).
//
// Everything here is plain data + tiny helpers with no Astro/Vite dependencies, so
// scripts/check-data.mjs can import it directly with Node's built-in TypeScript
// type stripping. Keep it that way: only `import type` from outside src/data.

import type { L10n, Locale } from '../i18n/index.ts';

export type { L10n, Locale };

/** Build an L10n value. Traditional Chinese first, English second. */
export const t = (zh: string, en: string): L10n => ({ 'zh-TW': zh, en });

// ---------------------------------------------------------------------------
// Evidence labels
// ---------------------------------------------------------------------------

/**
 * How well the research agent was able to check the claim against its source.
 * Nothing tagged UNVERIFIED in the research files is allowed into the registry.
 *  - verified:  the researcher opened the primary document (or its abstract) and saw the figure.
 *  - secondary: rests on a media report of an official figure, a search summary, or our
 *               arithmetic on such figures. The caveat always says what it rests on.
 */
export const confidences = ['verified', 'secondary'] as const;
export type Confidence = (typeof confidences)[number];

/**
 * What kind of evidence it is: shown to readers as a badge.
 *  - measured-tw:   measured in Taiwan (field, lab or epidemiological study using Taiwanese data)
 *  - official-tw:   official Taiwanese statistics, inventories, standards or policy targets
 *  - modelled-tw:   modelled / simulated for Taiwan (dispersion models, emission-factor models, burden estimates)
 *  - international: evidence from outside Taiwan (WHO, IARC, HEI, and single non-Taiwan studies;
 *                   the statement wording says which, so a single study is never presented as consensus)
 *  - derived:       our own arithmetic on cited figures (the fact lists its inputs in `derivedFrom`)
 *  - market-tw:     prices and terms published by Taiwanese manufacturers, dealers or energy
 *                   operators (scooter prices, battery plans, pump prices)
 */
export const evidenceTypes = ['measured-tw', 'official-tw', 'modelled-tw', 'international', 'derived', 'market-tw'] as const;
export type Evidence = (typeof evidenceTypes)[number];

export const confidenceLabels: Record<Confidence, { label: L10n; description: L10n }> = {
  verified: {
    label: t('已查證', 'Verified'),
    description: t(
      '研究人員已直接查閱原始文件或摘要並核對數字。',
      'Our researchers opened the original document or abstract and checked the figure.',
    ),
  },
  secondary: {
    label: t('次級來源', 'Secondary'),
    description: t(
      '依據媒體轉述的官方數字或其他間接來源，尚未能直接核對原始文件；附註會說明依據為何。',
      'Based on a media report of an official figure or another indirect source that we could not check against the original; the note says what it rests on.',
    ),
  },
};

export const evidenceLabels: Record<Evidence, { label: L10n; description: L10n }> = {
  'measured-tw': {
    label: t('臺灣實測', 'Measured in Taiwan'),
    description: t('在臺灣實際量測或以臺灣資料進行的研究。', 'Measured in Taiwan, or a study using Taiwanese data.'),
  },
  'official-tw': {
    label: t('臺灣官方統計', 'Official Taiwan data'),
    description: t('臺灣政府公布的統計、排放清冊、標準或政策目標。', 'Statistics, inventories, standards or policy targets published by the Taiwanese government.'),
  },
  'modelled-tw': {
    label: t('臺灣模式推估', 'Modelled for Taiwan'),
    description: t('以電腦模式或推估方法針對臺灣計算，並非直接量測。', 'Calculated for Taiwan with a computer model or estimation method, not measured directly.'),
  },
  international: {
    label: t('國際證據', 'International evidence'),
    description: t('來自臺灣以外的證據，例如世界衛生組織、國際癌症研究機構或國外研究。', 'Evidence from outside Taiwan, such as the WHO, IARC or studies abroad.'),
  },
  derived: {
    label: t('本站計算', 'Our calculation'),
    description: t('由本站根據引用的數字自行計算，計算所用的數字均附出處。', 'Our own arithmetic on cited figures; every input is itself cited.'),
  },
  'market-tw': {
    label: t('市場價格', 'Market prices'),
    description: t('臺灣的車廠、經銷商或能源業者公布的售價、優惠與資費。', 'Prices, offers and plan terms published by Taiwanese manufacturers, dealers or energy operators.'),
  },
};

// ---------------------------------------------------------------------------
// The chain of evidence
// ---------------------------------------------------------------------------

/**
 * The site's argument is a chain the reader walks through link by link. Every fact, series
 * and evidence gap says which link it belongs to (`null` = context that sits outside the
 * chain, e.g. how people commute). Ask for a link with `evidenceForLink()` in chain.ts.
 *  1 what comes out of the tailpipe      5 what happens to people who breathe traffic exhaust
 *  2 where it comes out                  6 who gets the highest dose
 *  3 what people on the street breathe   7 the link you can break (cleaner or electric scooters)
 *  4 what those compounds do
 */
export const chainLinks = [1, 2, 3, 4, 5, 6, 7] as const;
export type ChainLink = (typeof chainLinks)[number];

export const chainLinkLabels: Record<ChainLink, { short: L10n; question: L10n }> = {
  1: { short: t('排氣管排出什麼', 'What comes out of the tailpipe'), question: t('燃油機車的排氣管排出哪些污染物？', 'What does a gasoline scooter\'s tailpipe emit?') },
  2: { short: t('在哪裡排出', 'Where it comes out'), question: t('廢氣在什麼高度、什麼位置排出，離行人多近？', 'At what height and where is it emitted, and how close to people on foot?') },
  3: { short: t('街上的人吸進什麼', 'What people on the street breathe'), question: t('走在街上、站在路口的人實際吸進了什麼？', 'What do people walking and waiting at the kerb actually breathe?') },
  4: { short: t('這些物質有什麼作用', 'What those compounds do'), question: t('廢氣中的物質對人體有什麼危害？聞得到又代表什麼？', 'What can these compounds do to the body, and what does the smell tell you?') },
  5: { short: t('吸入交通廢氣的人怎麼了', 'What happens to people who breathe traffic exhaust'), question: t('研究在吸入交通廢氣的人身上看到了什麼？', 'What have studies seen in people who breathe traffic exhaust?') },
  6: { short: t('誰吸得最多', 'Who gets the highest dose'), question: t('哪些人吸入最多，或最容易受到影響？', 'Who breathes the most, or is most susceptible?') },
  7: { short: t('可以斬斷的一環', 'The link you can break'), question: t('換成更乾淨的機車或電動機車，能斬斷哪一環？', 'What would cleaner or electric scooters remove from the chain?') },
};

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

export const units = {
  vehicles: { short: t('輛', 'vehicles'), long: t('輛', 'vehicles') },
  'million-vehicles': { short: t('百萬輛', 'million'), long: t('百萬輛', 'million vehicles') },
  percent: { short: t('%', '%'), long: t('百分比', 'percent') },
  'percentage-points': { short: t('個百分點', 'pts'), long: t('個百分點', 'percentage points') },
  'per-100-people': { short: t('輛／每百人', 'per 100 people'), long: t('每百人擁有的機車數', 'motorcycles per 100 people') },
  'tonnes-per-year': { short: t('公噸／年', 't/yr'), long: t('公噸／年', 'tonnes per year') },
  'ug/m3': { short: t('µg/m³', 'µg/m³'), long: t('微克／立方公尺', 'micrograms per cubic metre') },
  'mg/m3': { short: t('mg/m³', 'mg/m³'), long: t('毫克／立方公尺', 'milligrams per cubic metre') },
  ppm: { short: t('ppm', 'ppm'), long: t('ppm（百萬分之一）', 'parts per million') },
  ppb: { short: t('ppb', 'ppb'), long: t('ppb（十億分之一）', 'parts per billion') },
  'um2/cm3': { short: t('µm²/cm³', 'µm²/cm³'), long: t('平方微米／立方公分（微粒表面積濃度）', 'square micrometres per cubic centimetre (particle surface area)') },
  'particles/cm3': { short: t('個／cm³', 'particles/cm³'), long: t('微粒數／立方公分', 'particles per cubic centimetre') },
  'g/L-fuel': { short: t('克／公升燃油', 'g/L fuel'), long: t('每公升燃油排放克數', 'grams per litre of fuel') },
  'km/L': { short: t('公里／公升', 'km/L'), long: t('公里／公升', 'kilometres per litre') },
  'ug/km': { short: t('µg/km', 'µg/km'), long: t('微克／公里', 'micrograms per kilometre') },
  'per-100k': { short: t('人／每十萬人', 'per 100,000'), long: t('每十萬人口', 'per 100,000 population') },
  deaths: { short: t('人', 'deaths'), long: t('死亡人數', 'deaths') },
  'million-deaths': { short: t('百萬人', 'million deaths'), long: t('百萬死亡人數', 'million deaths') },
  people: { short: t('人', 'people'), long: t('人', 'people') },
  count: { short: t('', ''), long: t('數量', 'count') },
  ratio: { short: t('倍', '×'), long: t('倍', 'times') },
  'odds-ratio': { short: t('OR', 'OR'), long: t('勝算比', 'odds ratio') },
  'relative-risk': { short: t('RR', 'RR'), long: t('相對風險', 'relative risk') },
  dB: { short: t('dB', 'dB'), long: t('分貝', 'decibels') },
  metres: { short: t('公尺', 'm'), long: t('公尺', 'metres') },
  hours: { short: t('小時', 'h'), long: t('小時', 'hours') },
  year: { short: t('年', ''), long: t('年份', 'year') },
  phase: { short: t('期', ''), long: t('排放標準期別', 'emission-standard phase') },
  ntd: { short: t('元', 'NT$'), long: t('新臺幣元', 'New Taiwan dollars') },
  'ntd-per-km': { short: t('元／公里', 'NT$/km'), long: t('每公里新臺幣元', 'New Taiwan dollars per kilometre') },
  'ntd-per-month': { short: t('元／月', 'NT$/month'), long: t('每月新臺幣元', 'New Taiwan dollars per month') },
  'ntd-per-year': { short: t('元／年', 'NT$/year'), long: t('每年新臺幣元', 'New Taiwan dollars per year') },
  'ntd-per-litre': { short: t('元／公升', 'NT$/L'), long: t('每公升新臺幣元', 'New Taiwan dollars per litre') },
  'km-per-month': { short: t('公里／月', 'km/month'), long: t('每月公里數', 'kilometres per month') },
  cc: { short: t('cc', 'cc'), long: t('排氣量（cc）', 'engine displacement (cc)') },
  'g/km': { short: t('克／公里', 'g/km'), long: t('每公里排放克數', 'grams per kilometre') },
  'mg/km': { short: t('毫克／公里', 'mg/km'), long: t('每公里排放毫克數', 'milligrams per kilometre') },
  'kg/kg-fuel': { short: t('公斤／公斤燃料', 'kg/kg fuel'), long: t('每公斤燃料排放的公斤數', 'kilograms per kilogram of fuel burned') },
  'g/h': { short: t('克／小時', 'g/h'), long: t('每小時排放克數', 'grams per hour') },
  'kg-per-year': { short: t('公斤／年', 'kg/yr'), long: t('公斤／年', 'kilograms per year') },
  'hazard-ratio': { short: t('HR', 'HR'), long: t('風險比', 'hazard ratio') },
  'ug/g-creatinine': { short: t('µg/g肌酸酐', 'µg/g creatinine'), long: t('每克肌酸酐的微克數（尿液指標）', 'micrograms per gram of creatinine (urine marker)') },
  seconds: { short: t('秒', 's'), long: t('秒', 'seconds') },
  minutes: { short: t('分鐘', 'min'), long: t('分鐘', 'minutes') },
  celsius: { short: t('°C', '°C'), long: t('攝氏度', 'degrees Celsius') },
  'lifetime-excess-risk': { short: t('', ''), long: t('終身超額致癌風險指標（無單位）', 'lifetime excess cancer risk indicator (dimensionless)') },
} as const satisfies Record<string, { short: L10n; long: L10n }>;

export type Unit = keyof typeof units;

export function unitLabel(unit: Unit, locale: Locale, form: 'short' | 'long' = 'short'): string {
  return units[unit][form][locale];
}

/** Locale-aware number formatting (no rounding beyond `maximumFractionDigits`, default: as given). */
export function formatNumber(n: number, locale: Locale, maximumFractionDigits = 4): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits }).format(n);
}

// ---------------------------------------------------------------------------
// Raw values
// ---------------------------------------------------------------------------

/**
 * One raw number, exactly as the research file gives it.
 * `approx` = the source says "about"; `bound` = the source gives only a bound
 * ("more than 190,000" -> bound 'gt'); `derived` = our arithmetic.
 */
export interface Datum {
  value: number;
  unit: Unit;
  low?: number;
  high?: number;
  sd?: number;
  approx?: boolean;
  bound?: 'lt' | 'lte' | 'gt' | 'gte';
  derived?: boolean;
  /** Internal note for editors (English). Not shown to readers. */
  note?: string;
}

/** Shorthand for a Datum. */
export const v = (value: number, unit: Unit, extra: Omit<Datum, 'value' | 'unit'> = {}): Datum => ({
  value,
  unit,
  ...extra,
});

/** Where a claim came from in our research notes, e.g. '01 §4' (research/01-prevalence-emissions.md, section 4). */
export type ResearchRef = string;
