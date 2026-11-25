// Chart-ready datasets, with the same source / confidence / evidence metadata as facts.
//
// Shape: a series has `categories` (the x-axis keys, with labels) and one or more `datasets`
// (one per bar colour / line). Each dataset has `points` with `x` (a category key, a year or
// an ISO date) and `y` (null = no verified figure: draw a gap, never interpolate).
//
// - Never merge different studies into one series: each commute study has its own series.
// - Per-point `flags` must be visible in charts ('outlier', 'derived', 'model-check-failed' ...).
// - Dataset- or point-level `confidence` / `evidence` override the series-level values; the
//   series-level values describe the series as a whole.
// - `requiresCaveat: true` means a chart must render its caveat beside it.
//
// Usage:
//   import { getSeries, localizeSeries } from '@/data';
//   const s = localizeSeries('teds13-motorcycle-share', locale);

import type { ChainLink, Confidence, Evidence, L10n, Locale, ResearchRef, Unit } from './types.ts';
import { confidenceLabels, evidenceLabels, t } from './types.ts';
import type { SourceId } from './sources.ts';
import { formatCitation, shortCitation, sourceUrl } from './sources.ts';
import type { FactId, LocalizedCitation, Topic } from './facts.ts';
import { redlightSeries } from './series-redlight.ts';

export const pointFlags = [
  'derived', // our arithmetic
  'approx', // the source says "about"
  'outlier', // flagged as an outlier by the source itself
  'model-check-failed', // failed the source's model-performance evaluation (IOT "#")
  'significant', // statistically significant at 95% per the source (IOT "*")
  'upper-bound', // the source gives "below X" / "X or fewer"
  'lower-bound', // the source gives "more than X"
  'target', // a policy target, not an observation
  'maximum', // the source gives "up to": the largest value across conditions, not typical
  'not-significant', // the source reports the difference as not statistically significant
  'chart-reading', // read off a figure in the source, not a printed number
] as const;
export type PointFlag = (typeof pointFlags)[number];

export const pointFlagLabels: Record<PointFlag, L10n> = {
  derived: t('本站計算', 'our calculation'),
  approx: t('約略值', 'approximate'),
  outlier: t('離群值（來源自行標示）', 'outlier (flagged by the source)'),
  'model-check-failed': t('未通過模式效能檢核', 'failed the model-performance check'),
  significant: t('統計顯著（95%）', 'statistically significant (95%)'),
  'upper-bound': t('上限值（「以下」）', 'upper bound ("or fewer")'),
  'lower-bound': t('下限值（「超過」）', 'lower bound ("more than")'),
  target: t('政策目標', 'policy target'),
  maximum: t('最大值（「最多」）', 'maximum ("up to")'),
  'not-significant': t('統計上不顯著', 'not statistically significant'),
  'chart-reading': t('從圖上讀取的約略值', 'read off a chart (approximate)'),
};

export interface SeriesPoint {
  x: string | number;
  y: number | null;
  low?: number;
  high?: number;
  sd?: number;
  flags?: PointFlag[];
  note?: L10n;
  confidence?: Confidence;
  sources?: SourceId[];
}

export interface Dataset {
  key: string;
  label: L10n;
  points: SeriesPoint[];
  /** 'reference' = a benchmark line (e.g. a standard), 'target' = policy target. */
  kind?: 'observed' | 'modelled' | 'target' | 'reference';
  unit?: Unit;
  confidence?: Confidence;
  evidence?: Evidence;
  note?: L10n;
}

export interface Category {
  key: string;
  label: L10n;
  note?: L10n;
}

export type ChartHint = 'bar' | 'grouped-bar' | 'stacked-bar' | 'line' | 'range' | 'dot-range' | 'timeline';

export interface SeriesInput {
  topic: Topic;
  title: L10n;
  description: L10n;
  chart: ChartHint;
  unit: Unit;
  categories?: Category[];
  xLabel?: L10n;
  yLabel?: L10n;
  datasets: Dataset[];
  period: L10n;
  place: L10n;
  sources: SourceId[];
  confidence: Confidence;
  evidence: Evidence;
  /** Reader-facing limit of the evidence; pages print it. Never address editors here. */
  caveat?: L10n;
  /** Internal note for editors and chart builders (English). Never rendered. */
  editorNote?: string;
  requiresCaveat?: boolean;
  relatedFacts?: FactId[];
  locator?: string;
  research: ResearchRef;
  /** Link of the chain of evidence (1-7) or null for context. Required unless the topic has a default. */
  chainLink?: ChainLink | null;
  alsoLinks?: ChainLink[];
}

/** Topics whose series may omit `chainLink` (economics, owned elsewhere). Mirrors facts.ts. */
export const seriesTopicDefaultChainLink: Partial<Record<Topic, ChainLink | null>> = { economics: 7 };

const TW = t('台灣（全國）', 'Taiwan (national)');
const TAIPEI = t('台北市', 'Taipei City');
const TEDS_PERIOD = t('基準年2023年（TEDS 13.0）', 'Base year 2023 (TEDS 13.0)');
const TEDS_CAVEAT = t(
  '排放清冊只計國內直接排放的原生性污染物；排放占比不等於對空氣中濃度的貢獻。「合計」是清冊中二行程與四行程兩列相加。',
  'The inventory counts only primary pollutants emitted directly by domestic sources; an emissions share is not a share of what people breathe. "Combined" is the sum of the inventory\'s two-stroke and four-stroke rows.',
);
const IOT_CAVEAT = t(
  '模式模擬結果，不是實測；報告封面註明結論不代表交通部意見。',
  'Model output, not measurements; the report cover states its conclusions do not represent the Ministry\'s views.',
);
const POLLUTANTS: Category[] = [
  { key: 'pm25', label: t('細懸浮微粒 PM2.5', 'PM2.5') },
  { key: 'pm10', label: t('懸浮微粒 PM10', 'PM10') },
  { key: 'nox', label: t('氮氧化物 NOx', 'Nitrogen oxides (NOx)') },
  { key: 'nmhc', label: t('非甲烷碳氫化合物 NMHC', 'Non-methane hydrocarbons (NMHC)') },
  { key: 'thc', label: t('總碳氫化合物 THC', 'Total hydrocarbons (THC)') },
  { key: 'co', label: t('一氧化碳 CO', 'Carbon monoxide (CO)') },
];
const SIM_DAYS: Category[] = [1, 2, 3, 4].map((d) => ({ key: `day${d}`, label: t(`第${d}模擬日`, `Simulated day ${d}`) }));
const iot = (y: number, mark: '' | '*' | '#' = '', extra: PointFlag[] = []): SeriesPoint => ({
  x: '',
  y,
  flags: [...(mark === '*' ? (['significant'] as PointFlag[]) : mark === '#' ? (['model-check-failed'] as PointFlag[]) : []), ...extra],
});
const days = (...pts: SeriesPoint[]): SeriesPoint[] => pts.map((p, i) => ({ ...p, x: `day${i + 1}` }));

const baseSeries = {
  // -------------------------------------------------------------------------
  // emissions
  // -------------------------------------------------------------------------
  'teds13-motorcycle-share': {
    topic: 'emissions',
    title: t('燃油機車占全國排放的比例', 'Gasoline scooters\' share of national emissions'),
    description: t(
      '機車的PM2.5占比很小，但一氧化碳與碳氫化合物占比很大：問題在聞得到的廢氣，不在粉塵。',
      'Scooters\' share of PM2.5 is small, but their shares of carbon monoxide and hydrocarbons are large: the problem is fumes you can smell, not dust.',
    ),
    chart: 'grouped-bar',
    unit: 'percent',
    categories: POLLUTANTS,
    yLabel: t('占全國排放（%）', 'Share of national emissions (%)'),
    datasets: [
      {
        key: 'twoStroke',
        label: t('二行程機車', 'Two-stroke'),
        points: [
          { x: 'pm25', y: 0.29 },
          { x: 'pm10', y: 0.09 },
          { x: 'nox', y: 0.02 },
          { x: 'nmhc', y: 0.56 },
          { x: 'thc', y: 0.49 },
          { x: 'co', y: 0.54 },
        ],
      },
      {
        key: 'fourStroke',
        label: t('四行程機車', 'Four-stroke'),
        points: [
          { x: 'pm25', y: 1.02 },
          { x: 'pm10', y: 0.45 },
          { x: 'nox', y: 2.17 },
          { x: 'nmhc', y: 9.44 },
          { x: 'thc', y: 8.11 },
          { x: 'co', y: 15.05 },
        ],
      },
      {
        key: 'combined',
        label: t('燃油機車合計', 'Combined'),
        points: [
          { x: 'pm25', y: 1.31 },
          { x: 'pm10', y: 0.54 },
          { x: 'nox', y: 2.19 },
          { x: 'nmhc', y: 9.99 },
          { x: 'thc', y: 8.6 },
          { x: 'co', y: 15.59 },
        ],
      },
    ],
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_CAVEAT,
    relatedFacts: ['teds13-mc-pm25-share', 'teds13-mc-nmhc-share', 'teds13-mc-co-share', 'teds13-mc-gas-vs-particle-contrast'],
    locator: 'Workbook sheet 全國: share cells of 二行程機車 / 四行程機車 rows; combined = our sums of tonnes / 總排放量',
    chainLink: 1,
    research: '01 §4, Chart C',
  },
  'teds13-motorcycle-tonnes': {
    topic: 'emissions',
    title: t('機車排放量（公噸／年）', 'Scooter emissions (tonnes per year)'),
    description: t('TEDS 13.0各類機車的年排放量與全國總量。', 'Annual emissions by scooter type and the national total, TEDS 13.0.'),
    chart: 'grouped-bar',
    unit: 'tonnes-per-year',
    categories: POLLUTANTS,
    datasets: [
      {
        key: 'twoStroke',
        label: t('二行程機車', 'Two-stroke'),
        points: [
          { x: 'pm25', y: 98.1 },
          { x: 'pm10', y: 100.0 },
          { x: 'nox', y: 41.6 },
          { x: 'nmhc', y: 1972.9 },
          { x: 'thc', y: 2133.2 },
          { x: 'co', y: 2604.1 },
        ],
      },
      {
        key: 'fourStroke',
        label: t('四行程機車', 'Four-stroke'),
        points: [
          { x: 'pm25', y: 343.6 },
          { x: 'pm10', y: 491.6 },
          { x: 'nox', y: 4406.5 },
          { x: 'nmhc', y: 33513.2 },
          { x: 'thc', y: 35147.6 },
          { x: 'co', y: 71935.9 },
        ],
      },
      {
        key: 'combined',
        label: t('燃油機車合計', 'Gasoline combined'),
        points: [
          { x: 'pm25', y: 441.7 },
          { x: 'pm10', y: 591.6 },
          { x: 'nox', y: 4448.1 },
          { x: 'nmhc', y: 35486.1 },
          { x: 'thc', y: 37280.8 },
          {
            x: 'co',
            y: 74540.1,
            note: t('研究資料的合計值；四捨五入後的兩列相加為74,540.0。', 'Research-file sum; the two rounded rows add to 74,540.0.'),
          },
        ],
      },
      {
        key: 'electric',
        label: t('電動機車（非排氣）', 'Electric (non-exhaust)'),
        points: [
          { x: 'pm25', y: 6.5 },
          { x: 'pm10', y: 13.2 },
          { x: 'nox', y: 0 },
          { x: 'nmhc', y: 0 },
          { x: 'thc', y: 0 },
          { x: 'co', y: 0 },
        ],
      },
      {
        key: 'nationalTotal',
        label: t('全國總排放量', 'National total'),
        kind: 'reference',
        points: [
          { x: 'pm25', y: 33731.0 },
          { x: 'pm10', y: 108956.1 },
          { x: 'nox', y: 202776.2 },
          { x: 'nmhc', y: 355082.6 },
          { x: 'thc', y: 433280.2 },
          { x: 'co', y: 478024.4 },
        ],
      },
    ],
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_CAVEAT,
    chainLink: 1,
    research: '01 §4',
  },
  'teds13-road-vs-power': {
    topic: 'emissions',
    title: t('道路車輛與電力業的原生排放', 'Primary emissions: road vehicles vs power sector'),
    description: t('排放量比較，不是空氣中濃度的貢獻比較。', 'A comparison of emissions, not of contributions to air concentrations.'),
    chart: 'grouped-bar',
    unit: 'tonnes-per-year',
    categories: [POLLUTANTS[0], POLLUTANTS[2]],
    datasets: [
      { key: 'road', label: t('所有道路車輛', 'All road vehicles'), points: [{ x: 'pm25', y: 4522.9 }, { x: 'nox', y: 83276.4 }] },
      {
        key: 'power',
        label: t('電力業', 'Power sector'),
        points: [
          { x: 'pm25', y: 874.6, flags: ['derived'], note: t('燃燒排放791.0加未分類83.6。', 'Combustion 791.0 plus unclassified 83.6.') },
          { x: 'nox', y: 33278.0 },
        ],
      },
    ],
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook', 'moenv-news-2025-power-sector'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '環境部明確反對把排放量占比當成空氣污染貢獻比率；電力業約占空氣中PM2.5的2.3%。',
      'MOENV explicitly rejects treating emission shares as contributions to air pollution; the power sector contributes about 2.3% of ambient PM2.5.',
    ),
    requiresCaveat: true,
    relatedFacts: ['teds13-road-vs-power', 'ambient-pm25-power-share'],
    chainLink: 1,
    research: '01 §4, Chart D',
  },
  'ambient-pm25-apportionment-2020': {
    topic: 'emissions',
    title: t('空氣中PM2.5的來源（模式推估）', 'Where the PM2.5 in the air comes from (modelled)'),
    description: t(
      '兩組數字的分母不同：第一組是全部PM2.5，第二組只是國內來源的部分。',
      'The two datasets have different denominators: the first is all PM2.5, the second only the domestic part.',
    ),
    chart: 'bar',
    unit: 'percent',
    categories: [
      { key: 'transboundary', label: t('境外傳輸', 'Transboundary') },
      { key: 'domestic', label: t('國內來源', 'Domestic') },
      { key: 'industry', label: t('工業源', 'Industry') },
      { key: 'mobile', label: t('移動源（車輛）', 'Mobile (vehicles)') },
      { key: 'fugitive', label: t('逸散源（揚塵等）', 'Fugitive (dust etc.)') },
    ],
    datasets: [
      {
        key: 'ofTotal',
        label: t('占全部PM2.5', 'Share of all PM2.5'),
        points: [
          { x: 'transboundary', y: 35.1, low: 29.0, high: 41.0 },
          { x: 'domestic', y: 64.9, low: 59.0, high: 71.0 },
        ],
      },
      {
        key: 'ofDomestic',
        label: t('占國內來源PM2.5', 'Share of domestic PM2.5'),
        points: [
          { x: 'industry', y: 27.5, low: 18.7, high: 35.4 },
          { x: 'mobile', y: 27.5, low: 8.8, high: 31.3 },
          { x: 'fugitive', y: 45.0, low: 38.6, high: 72.5 },
        ],
      },
    ],
    period: t('2020年方案，使用TEDS 9.0（2013年基準）', '2020 plan, using TEDS 9.0 (2013 base)'),
    place: TW,
    sources: ['moenv-air-plan-2020'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '舊版清冊的模式結果，年代較久；範圍為各空品區的差異。',
      'A model result using an old inventory; ranges show variation across air basins.',
    ),
    requiresCaveat: true,
    relatedFacts: ['ambient-pm25-origin-2020-plan', 'ambient-pm25-domestic-sources-2020-plan'],
    chainLink: 3,
    research: '01 §5, Chart I',
  },
  'tsai2018-older-phase-excess': {
    topic: 'emissions',
    title: t('舊期別機車多排放多少', 'How much more older-phase scooters emit'),
    description: t('相對於第五期機車，每公升燃油多排放的比例（實驗室測試）。', 'Excess emissions per litre of fuel relative to Phase 5 machines (lab tests).'),
    chart: 'grouped-bar',
    unit: 'percent',
    categories: [
      { key: 'phase3', label: t('第三期', 'Phase 3') },
      { key: 'phase4', label: t('第四期', 'Phase 4') },
    ],
    datasets: [
      { key: 'co', label: t('一氧化碳', 'Carbon monoxide'), points: [{ x: 'phase3', y: 156 }, { x: 'phase4', y: 48 }] },
      {
        key: 'hc',
        label: t('碳氫化合物', 'Hydrocarbons'),
        points: [
          { x: 'phase3', y: 84 },
          { x: 'phase4', y: 9, flags: ['not-significant'], note: t('第四期與第五期的差異不顯著。', 'Phase 4 vs Phase 5 not significant.') },
        ],
      },
      {
        key: 'nox',
        label: t('氮氧化物', 'Nitrogen oxides'),
        points: [{ x: 'phase3', y: -30 }, { x: 'phase4', y: -17 }],
        note: t('舊車的氮氧化物反而較低。', 'Older machines emitted less NOx.'),
      },
    ],
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '以每公升燃油計，不是每公里；43輛使用中四行程機車（第三期7輛、第四期16輛、第五期20輛）的底盤動力計測試，期別、車齡與里程互相混雜。',
      'Per litre of fuel, not per km; chassis-dynamometer tests of 43 in-use four-stroke motorcycles (7 Phase 3, 16 Phase 4, 20 Phase 5), with phase, age and mileage confounded.',
    ),
    requiresCaveat: true,
    relatedFacts: ['ef-older-phase-tsai2018'],
    chainLink: 1,
    research: 'papers/tsai-2018-aaqr#table1-co-by-phase; papers/tsai-2018-aaqr#table1-hc-by-phase; papers/tsai-2018-aaqr#table1-nox-co2',
  },

  // -------------------------------------------------------------------------
  // fleet, electric, policy
  // -------------------------------------------------------------------------
  'fleet-stock': {
    topic: 'fleet',
    title: t('登記機車數與電動機車數', 'Registered motorcycles and electric motorcycles'),
    description: t('總數約1,460萬輛，電動機車仍只占約5%。', 'About 14.6 million in total; electric still only about 5%.'),
    chart: 'grouped-bar',
    unit: 'million-vehicles',
    categories: [
      { key: '2018', label: t('2018年', '2018') },
      { key: '2023', label: t('2023年', '2023') },
      { key: '2024', label: t('2024年', '2024') },
      { key: '2026-05', label: t('2026年5月', 'May 2026') },
    ],
    datasets: [
      {
        key: 'total',
        label: t('全部機車', 'All motorcycles'),
        points: [
          { x: '2018', y: null, note: t('2018年總數未取得。', 'No 2018 total in our sources.') },
          { x: '2023', y: 14.55 },
          { x: '2024', y: 14.66 },
          { x: '2026-05', y: 14.67, confidence: 'secondary', sources: ['pts-2026-07-scooter-fleet'] },
        ],
      },
      {
        key: 'electric',
        label: t('電動機車', 'Electric'),
        points: [
          { x: '2018', y: 0.19, flags: ['lower-bound'] },
          { x: '2023', y: 0.7 },
          { x: '2024', y: 0.77 },
          {
            x: '2026-05',
            y: 0.81,
            flags: ['derived', 'approx'],
            confidence: 'secondary',
            sources: ['pts-2026-07-scooter-fleet'],
            note: t('由1,467萬輛乘以5.5%推算。', '14.67 million × 5.5%.'),
          },
        ],
      },
    ],
    period: t('2018–2026年', '2018–2026'),
    place: TW,
    sources: ['moenv-air-review-2023', 'moenv-air-review-2024', 'pts-2026-07-scooter-fleet', 'datagov-14208-motorcycle-registrations'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '2026年數字出自媒體轉述（次級來源）。登記數在2013年因老舊機車切結報廢而出現斷層，所以2013年前後的數字不能直接比較。',
      'The 2026 figures come from a media report (secondary). The registration series has a break in 2013 from sworn scrappage of old scooters, so counts before and after 2013 are not directly comparable.',
    ),
    relatedFacts: ['fleet-registered-2024', 'fleet-electric-registered-2024', 'fleet-fuel-mix-may-2026'],
    chainLink: 1,
    research: '01 §1, Chart E',
  },
  'two-stroke-remaining': {
    topic: 'policy',
    title: t('二行程機車剩餘數量', 'Two-stroke scooters remaining'),
    description: t('環境部數字為「以下」的上限值。', 'MOENV gives these as upper bounds ("or fewer").'),
    chart: 'bar',
    unit: 'million-vehicles',
    categories: [
      { key: '2018', label: t('2018年', '2018') },
      { key: '2023', label: t('2023年', '2023') },
      { key: '2024', label: t('2024年', '2024') },
    ],
    datasets: [
      {
        key: 'twoStroke',
        label: t('二行程機車', 'Two-stroke scooters'),
        points: [
          { x: '2018', y: 1.0, flags: ['upper-bound'] },
          { x: '2023', y: 0.33, flags: ['upper-bound', 'approx'] },
          { x: '2024', y: 0.28, flags: ['upper-bound', 'approx'] },
        ],
      },
    ],
    period: t('2018–2024年', '2018–2024'),
    place: TW,
    sources: ['moenv-air-review-2023', 'moenv-air-review-2024'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '環境部報告用的是「以下」的概數，不是精確的登記數；登記在案的二行程機車不一定都還在路上騎。',
      'The MOENV reviews give rounded "or fewer" figures, not exact counts; not every registered two-stroke is still being ridden.',
    ),
    relatedFacts: ['two-stroke-remaining'],
    chainLink: 1,
    research: '01 §6, Chart F',
  },
  'ev-share-new-registrations': {
    topic: 'electric',
    title: t('電動機車占新領牌機車的比例與政策目標', 'Electric share of new motorcycle registrations vs policy targets'),
    description: t(
      '2019年後下滑，2025年只有6.94%，遠低於20%的目標。',
      'Falling since 2019; just 6.94% in 2025, far below the 20% target.',
    ),
    chart: 'line',
    unit: 'percent',
    xLabel: t('年份', 'Year'),
    yLabel: t('市售比（%）', 'Share of new registrations (%)'),
    datasets: [
      {
        key: 'actual',
        label: t('實際市售比', 'Actual share'),
        kind: 'observed',
        points: [
          { x: 2019, y: 18.7, sources: ['cnyes-2019-registrations'] },
          { x: 2020, y: null, note: t('無可查證的數字。', 'No verified figure.') },
          {
            x: 2021,
            y: 11.6,
            flags: ['derived'],
            sources: ['chinatimes-2022-gogoro-briefing'],
            note: t('由總銷量與燃油機車銷量推算。', 'Calculated from total and gasoline sales.'),
          },
          { x: 2022, y: 11.9, sources: ['pts-2026-04-ev-share'] },
          { x: 2023, y: 9.14, sources: ['ucar-ev-sales-2023', 'tvbs-cars-2024-market-total'] },
          {
            x: 2024,
            y: 10.46,
            sources: ['tvbs-cars-2024-ev-share', 'ucar-ev-sales-2024'],
            note: t('U-CAR報導為10.38%（分母不同）。', 'U-CAR reports 10.38% (different denominator).'),
          },
          { x: 2025, y: 6.94, sources: ['tvbs-cars-2025-12-ev-sales', 'pts-2026-07-scooter-fleet'] },
        ],
      },
      {
        key: 'target',
        label: t('淨零路徑目標', 'Net-zero pathway target'),
        kind: 'target',
        points: [
          { x: 2025, y: 20, flags: ['target'] },
          { x: 2030, y: 35, flags: ['target'] },
          { x: 2035, y: 70, flags: ['target'] },
          { x: 2040, y: 100, flags: ['target'] },
        ],
      },
    ],
    period: t('2019–2025年（目標至2040年）', '2019–2025 (targets to 2040)'),
    place: TW,
    sources: [
      'cnyes-2019-registrations',
      'chinatimes-2022-gogoro-briefing',
      'pts-2026-04-ev-share',
      'ucar-ev-sales-2023',
      'tvbs-cars-2024-market-total',
      'tvbs-cars-2024-ev-share',
      'ucar-ev-sales-2024',
      'tvbs-cars-2025-12-ev-sales',
      'pts-2026-07-scooter-fleet',
    ],
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '所有年度數字都出自媒體轉述的交通部或產業統計；2015至2018年與2020年無可查證的數字，圖上應留白而非連線。目標出自公視對淨零路徑的描述，國發會原始文件未能開啟。',
      'Every annual figure comes from media reports of MOTC or industry statistics; 2015–2018 and 2020 have no verified figures, so those years are shown as gaps, not joined by a line. Targets are from PTS\'s description of the net-zero pathway; the NDC original could not be opened.',
    ),
    requiresCaveat: true,
    relatedFacts: ['ev-share-2019', 'ev-share-2025', 'netzero-ev-sales-targets', 'netzero-2025-gap'],
    chainLink: 7,
    editorNote: 'Leave unverified years as gaps; never interpolate.',
    research: '01 §7, §8, Charts A and G',
  },
  'new-registrations-electric-vs-gasoline': {
    topic: 'electric',
    title: t('新領牌機車：電動與燃油', 'New motorcycle registrations: electric vs gasoline'),
    description: t('電動機車新領牌數從2019年的168,542輛降到2025年的49,128輛。', 'New electric registrations fell from 168,542 in 2019 to 49,128 in 2025.'),
    chart: 'stacked-bar',
    unit: 'vehicles',
    categories: [2019, 2021, 2023, 2024, 2025].map((y) => ({ key: String(y), label: t(`${y}年`, String(y)) })),
    datasets: [
      {
        key: 'electric',
        label: t('電動機車', 'Electric'),
        points: [
          { x: '2019', y: 168542 },
          { x: '2021', y: 94000, flags: ['derived', 'approx'] },
          { x: '2023', y: 79584 },
          { x: '2024', y: 78757 },
          { x: '2025', y: 49128 },
        ],
      },
      {
        key: 'gasoline',
        label: t('燃油機車', 'Gasoline'),
        points: [
          { x: '2019', y: 733760 },
          { x: '2021', y: 715197 },
          { x: '2023', y: 791036, flags: ['derived'], note: t('870,620減79,584。', '870,620 minus 79,584.') },
          { x: '2024', y: 673886, flags: ['derived'] },
          { x: '2025', y: 659000, flags: ['derived', 'approx'] },
        ],
      },
    ],
    period: t('2019–2025年（缺2020、2022年）', '2019–2025 (2020 and 2022 missing)'),
    place: TW,
    sources: [
      'cnyes-2019-registrations',
      'chinatimes-2022-gogoro-briefing',
      'ucar-ev-sales-2023',
      'tvbs-cars-2024-market-total',
      'tvbs-cars-2024-ev-share',
      'tvbs-cars-2025-12-ev-sales',
    ],
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自媒體轉述的統計；2021年為企業（Gogoro）公布的銷量；標示「本站計算」的數字為相減或回推所得，2025年燃油機車數為約略值。',
      'From media reports of statistics; 2021 figures are company (Gogoro) sales data; points marked as our calculation are subtractions or back-calculations, and the 2025 gasoline figure is approximate.',
    ),
    chainLink: 7,
    research: '01 §7, Chart B',
  },
  'taipei-mode-share': {
    topic: 'fleet',
    title: t('台北市平日運具分配', 'Taipei weekday trips by mode'),
    description: t('機車占台北市旅次約兩成。', 'Motorcycles carry about a fifth of Taipei trips.'),
    chart: 'grouped-bar',
    unit: 'percent',
    categories: [
      { key: 'scooter', label: t('機車', 'Motorcycle') },
      { key: 'car', label: t('自用小客車', 'Private car') },
      { key: 'publicTransport', label: t('公共運輸', 'Public transport') },
      { key: 'walking', label: t('步行', 'Walking') },
    ],
    datasets: [
      {
        key: '2022',
        label: t('2022年', '2022'),
        points: [
          { x: 'scooter', y: 22.2 },
          { x: 'car', y: 15.9 },
          { x: 'publicTransport', y: 37.2 },
          { x: 'walking', y: 18.6 },
        ],
      },
      {
        key: '2024',
        label: t('2024年', '2024'),
        points: [
          { x: 'scooter', y: 20.1 },
          { x: 'car', y: 16.3 },
          { x: 'publicTransport', y: 38.3 },
          { x: 'walking', y: 20.8 },
        ],
      },
    ],
    period: t('2022與2024年9至12月平日', 'Weekdays, Sept–Dec 2022 and 2024'),
    place: TAIPEI,
    sources: ['taipei-dbas-bulletin-1341'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '只限台北市平日、9至12月的抽樣調查；台北的捷運與公車比其他城市多，不能代表全國。2022年的公共運輸與步行數字取自研究整理的圖表資料。',
      'A sample survey of Taipei City weekdays from September to December only; Taipei has far more metro and bus service than other cities, so it does not stand for Taiwan as a whole. The 2022 public-transport and walking figures come from our research notes\' chart data.',
    ),
    relatedFacts: ['mode-share-taipei-2024'],
    locator: '2022 public transport (37.2) and walking (18.6) appear only in research Chart H, not in the quoted table row',
    chainLink: null,
    research: '01 §9, Chart H',
  },
  'scooter-emission-standard-phases': {
    topic: 'policy',
    title: t('機車排放標準分期', 'Scooter emission-standard phases'),
    description: t('第二、三期的實施日期未見於研究資料。', 'Start dates for Phases 2 and 3 are not in our research notes.'),
    chart: 'timeline',
    unit: 'phase',
    datasets: [
      {
        key: 'phases',
        label: t('實施日期', 'Start date'),
        points: [
          { x: '1988-01-01', y: 1, note: t('第一期。', 'Phase 1.') },
          { x: '2004-01-01', y: 4, note: t('第四期，增加冷車啟動測試。', 'Phase 4: adds a cold-start test.') },
          { x: '2007-07-01', y: 5, note: t('第五期。', 'Phase 5.') },
          { x: '2017-01-01', y: 6, note: t('第六期，約相當於歐盟第4期，採WMTC測試循環。', 'Phase 6: roughly Euro 4, WMTC test cycle.') },
          { x: '2021-01-01', y: 7, note: t('第七期，為直噴引擎增訂粒狀物限值。', 'Phase 7: adds a particulate limit for direct-injection engines.') },
        ],
      },
    ],
    period: t('1988–2021年', '1988–2021'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '這些是新車開始適用各期標準的日期；已在路上的機車仍依出廠時的標準，所以同一時間路上同時有好幾期的車。',
      'These are the dates from which new scooters had to meet each phase; scooters already on the road stay on the standard they were built to, so several phases are on the road at once.',
    ),
    relatedFacts: ['scooter-emission-standard-phases'],
    chainLink: 1,
    research: '01 §8',
  },

  // -------------------------------------------------------------------------
  // exposure: one series per study, never merged
  // -------------------------------------------------------------------------
  'commute-pm25-wang2021': {
    topic: 'exposure',
    title: t('大台北各通勤方式的PM2.5暴露（Wang 等，2021）', 'PM2.5 exposure by commuting mode, Taipei area (Wang et al., 2021)'),
    description: t('中位數與範圍。沿街步行高於公車與汽車；機車只在停等時量測。', 'Median and range. Walking along streets is above bus and car; motorcycle readings were taken only while stopped.'),
    chart: 'dot-range',
    unit: 'ug/m3',
    categories: [
      { key: 'walking', label: t('沿街步行', 'Walking along streets') },
      { key: 'bus', label: t('公車', 'Bus') },
      { key: 'car', label: t('汽車', 'Car') },
      { key: 'motorcycle', label: t('機車停等時（3趟）', 'Motorcycle, while stopped (3 trips)') },
      { key: 'mrtElevatedStation', label: t('高架捷運站', 'Elevated MRT station') },
      { key: 'mrtElevatedCar', label: t('高架段捷運車廂', 'Elevated MRT carriage') },
      { key: 'mrtUndergroundStation', label: t('地下捷運站', 'Underground MRT station') },
      { key: 'mrtUndergroundCar', label: t('地下段捷運車廂', 'Underground MRT carriage') },
    ],
    datasets: [
      {
        key: 'median',
        label: t('中位數（範圍）', 'Median (range)'),
        points: [
          { x: 'walking', y: 40, low: 10, high: 275, note: t('216筆讀數。', '216 readings.') },
          { x: 'bus', y: 35, low: 13, high: 65 },
          { x: 'car', y: 15, low: 8, high: 80 },
          { x: 'motorcycle', y: 75, low: 60, high: 105, note: t('只在停等時量測，21筆讀數。', 'Measured only while stopped; 21 readings.') },
          { x: 'mrtElevatedStation', y: 33, low: 15, high: 35 },
          { x: 'mrtElevatedCar', y: 20, low: 13, high: 68, note: t('內文為20，摘要為28。', 'Results text 20; abstract 28.') },
          { x: 'mrtUndergroundStation', y: 75, low: 30, high: 210, note: t('內文為75，摘要為80。', 'Results text 75; abstract 80.') },
          { x: 'mrtUndergroundCar', y: 80, low: 53, high: 185, note: t('內文下限53，摘要55。', 'Results text lower bound 53; abstract 55.') },
        ],
      },
    ],
    period: t('2019年4–7月', 'April–July 2019'),
    place: t('大台北地區', 'Taipei metropolitan area'),
    sources: ['wang-2021-atmosphere'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '五位志願者、一台未校正的低價感測器，作者推論約偏高30%（未調整）；步行數值包含所有來源，有標明來源的最高值來自焚香與烹飪。地下捷運的微粒來自輪軌磨耗。本站採用內文數字。這和Chuang 等（2020）是不同的研究，兩者的數字不是同一組量測。',
      'Five volunteers with one uncalibrated low-cost sensor that by the authors\' reasoning reads about 30% high (unadjusted); the walking value includes every source, and the highest named peaks were incense and cooking. Underground MRT particles come from rail wear. We use the Results text. It is a separate study from Chuang et al. (2020), and the two sets of numbers are not one measurement.',
    ),
    requiresCaveat: true,
    relatedFacts: ['commute-walking-wang2021', 'idle-motorcycle-pm25-wang2021', 'commute-mrt-underground-wang2021'],
    chainLink: 3,
    editorNote: 'R15: never merge with Chuang 2020 into one range or one chart series.',
    research: 'papers/wang-2021-atmosphere#walking-street-stats; papers/wang-2021-atmosphere#motorcycle-stats; papers/wang-2021-atmosphere#underground-mrt-stats; papers/wang-2021-atmosphere#elevated-mrt-stats',
  },
  'commute-pm25-chuang2020': {
    topic: 'exposure',
    title: t('六種通勤方式的PM2.5暴露（Chuang 等，2020）', 'PM2.5 exposure by commuting mode (Chuang et al., 2020)'),
    description: t(
      '平均值±標準差。步行與騎機車都高於捷運與汽車，但兩者之間及與公車的差異不顯著。',
      'Mean ± SD. Walking and scooter are both above subway and car, but not significantly different from each other or from the bus.',
    ),
    chart: 'dot-range',
    unit: 'ug/m3',
    categories: [
      { key: 'subway', label: t('捷運（電動）', 'Subway (electric)') },
      { key: 'car', label: t('汽車', 'Car') },
      { key: 'bus', label: t('公車', 'Bus') },
      { key: 'walking', label: t('步行', 'Walking') },
      { key: 'walkingMask', label: t('戴口罩步行', 'Walking with a respirator'), note: t('感測器在口罩外。', 'Monitor outside the mask.') },
      { key: 'scooter', label: t('騎燃油機車', 'Gasoline scooter') },
    ],
    datasets: [
      {
        key: 'mean',
        label: t('平均值（±標準差）', 'Mean (± SD)'),
        points: [
          { x: 'subway', y: 21.7, sd: 5.8 },
          { x: 'car', y: 26.2, sd: 12.5 },
          { x: 'bus', y: 34.7, sd: 15.1 },
          { x: 'walking', y: 42.7, sd: 22.6 },
          { x: 'walkingMask', y: 43.1, sd: 20.7 },
          { x: 'scooter', y: 53.6, sd: 26.1 },
        ],
      },
    ],
    period: t('上午9至10點；2017年2月至2019年12月', '09:00–10:00; February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '120位健康年輕成人，只量早上一小時，只量PM2.5；騎機車是騎士自己的暴露，不是行人。這和Wang 等（2021）是不同的研究，兩者的數字不是同一組量測。',
      '120 healthy young adults, one morning hour, PM2.5 only; the scooter value is riders\' own exposure, not pedestrians\'. It is a separate study from Wang et al. (2021), and the two sets of numbers are not one measurement.',
    ),
    relatedFacts: ['commute-scooter-vs-subway-chuang2020'],
    chainLink: 3,
    editorNote: 'R15: never merge with Wang 2021 into one range or one chart series.',
    research: 'papers/chuang-2020-aex#pm-scooter; papers/chuang-2020-aex#pm-walking; papers/chuang-2020-aex#pm-bus-car; papers/chuang-2020-aex#pm-subway; papers/chuang-2020-aex#pm-facemask',
  },
  'scooter-lane-vs-cyclist-wu2021': {
    topic: 'exposure',
    title: t('機車道上的電動機車騎士與自行車騎士（Wu 等，2021）', 'Electric-scooter riders in the traffic lane vs cyclists (Wu et al., 2021)'),
    description: t('未調整平均值。PM2.5差距不大，苯系物（BTEX）差距明顯。', 'Unadjusted means. PM2.5 differs little; BTEX differs a lot.'),
    chart: 'grouped-bar',
    unit: 'ug/m3',
    categories: [
      { key: 'cyclists', label: t('自行車騎士', 'Cyclists') },
      { key: 'scooterLane', label: t('電動機車騎士（機車道）', 'Electric-scooter riders (traffic lane)') },
    ],
    datasets: [
      {
        key: 'pm25',
        label: t('PM2.5（µg/m³）', 'PM2.5 (µg/m³)'),
        unit: 'ug/m3',
        points: [
          { x: 'cyclists', y: 23.27 },
          { x: 'scooterLane', y: 27.65, flags: ['not-significant'], note: t('調整後與自行車的差異不顯著。', 'Difference from cyclists not significant after adjustment.') },
        ],
      },
      {
        key: 'btex',
        label: t('苯系物 BTEX（ppb）', 'BTEX (ppb)'),
        unit: 'ppb',
        points: [
          { x: 'cyclists', y: 20.07 },
          { x: 'scooterLane', y: 33.96, note: t('論文圖2的平均標記約28.5，論文未解釋。', 'The paper\'s Fig. 2 mean marker reads about 28.5, unexplained.') },
        ],
      },
    ],
    period: t('2017年11月至2018年4月', 'November 2017 to April 2018'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '兩組數據的單位不同，不能放在同一個刻度上比較。騎士騎的是電動機車，量到的是周圍車流的廢氣；這是通勤騎士在行進中的暴露，不是行人，也不是燃油與電動機車的比較。',
      'The two datasets are in different units and cannot be read against one scale. The riders used electric scooters, so this is surrounding traffic\'s exhaust; it is commuters riding, not pedestrians, and not a gasoline-versus-electric comparison.',
    ),
    requiresCaveat: true,
    relatedFacts: ['scooter-lane-btex-wu2021', 'cyclist-vs-scooter-lane-benzene-wu2021'],
    chainLink: 3,
    editorNote: 'The two datasets must not share a value axis.',
    research: 'papers/wu-2021-trd#mean-exposure-bike-vs-scooter; papers/wu-2021-trd#scooter-is-electric; papers/wu-2021-trd#pm25-mode-diff-not-significant',
  },
  'taipei-traffic-vs-general-stations': {
    topic: 'exposure',
    title: t('台北市交通測站與一般測站的PM2.5年平均值', 'Taipei annual PM2.5: traffic vs general monitoring stations'),
    description: t('交通測站歷年都較高，但差距已縮小。', 'Traffic stations are higher every year, but the gap has narrowed.'),
    chart: 'line',
    unit: 'ug/m3',
    xLabel: t('年份', 'Year'),
    yLabel: t('PM2.5年平均（µg/m³）', 'Annual mean PM2.5 (µg/m³)'),
    datasets: [
      {
        key: 'general',
        label: t('一般測站（9站）', 'General stations (9)'),
        points: [
          { x: 2017, y: 14.6 },
          { x: 2018, y: 15.7 },
          { x: 2019, y: 14.1 },
          { x: 2020, y: 12.6 },
          { x: 2021, y: 13.2 },
          { x: 2022, y: 11.0 },
          { x: 2023, y: 10.6 },
          { x: 2024, y: 11.1 },
        ],
      },
      {
        key: 'traffic',
        label: t('交通測站（3站）', 'Traffic stations (3)'),
        points: [
          { x: 2017, y: 18.2 },
          { x: 2018, y: 20.5 },
          { x: 2019, y: 19.2 },
          { x: 2020, y: 16.2 },
          { x: 2021, y: 16.5 },
          { x: 2022, y: 12.6 },
          { x: 2023, y: 12.7 },
          { x: 2024, y: 11.2 },
        ],
      },
    ],
    period: t('2017–2024年', '2017–2024'),
    place: TAIPEI,
    sources: ['taipei-epd-air-report-2024'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '數據未扣除境外傳輸或特殊天氣影響。年報內文的2024年數字（13.2／16.5）誤植為2021年數值，本圖採用表3-2-7。',
      'Not adjusted for transboundary pollution or unusual weather. The report\'s own text gives 13.2/16.5 for 2024, which repeats the 2021 values; this chart uses its Table 3-2-7.',
    ),
    relatedFacts: ['taipei-traffic-station-gap'],
    locator: 'Table 3-2-7, automatic PM2.5',
    chainLink: 3,
    research: '02 §4, Table D',
  },
  'iot-scramble-summary': {
    topic: 'exposure',
    title: t('行人專用時相的模擬效果：一般日與離群日', 'Modelled effect of a scramble phase: typical days vs the outlier day'),
    description: t(
      '一般模擬日降低約3%至21%；「94%」只出現在高雄一處路口的單一模擬日。',
      'Typical simulated days: about 3–21% lower. The "94%" comes from one simulated day at one Kaohsiung intersection.',
    ),
    chart: 'range',
    unit: 'percent',
    categories: [
      { key: 'typical', label: t('一般模擬日（範圍）', 'Typical simulated days (range)') },
      { key: 'outlier', label: t('第2模擬日（離群值）', 'Simulated day 2 (outlier)') },
    ],
    yLabel: t('行人等候區PM2.5變化（%）', 'Change in PM2.5 at the pedestrian waiting area (%)'),
    datasets: [
      {
        key: 'allDayScramble',
        label: t('全天行人專用時相（模擬）', 'All-day scramble phase (modelled)'),
        kind: 'modelled',
        points: [
          {
            x: 'typical',
            y: null,
            low: -21.4,
            high: -2.58,
            note: t('報告第4-28頁，排除第2模擬日。', 'Report p.4-28, excluding simulated day 2.'),
          },
          {
            x: 'outlier',
            y: -94.86,
            flags: ['outlier', 'significant'],
            note: t(
              '報告指出此日「明顯高於其他模擬值」，基準值異常偏高，原因未說明。',
              'The report says this day is "clearly higher than the other simulated values"; the baseline was anomalously high, cause unexplained.',
            ),
          },
        ],
      },
    ],
    period: t('2024年量測資料驅動的模擬', 'Simulation driven by 2024 field data'),
    place: t('高雄市左營區高鐵路／重信路口', 'Gaotie Rd / Chongxin Rd intersection, Zuoying, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '兩者都是模式模擬，不是實測，也不是機車專屬結果；94%只出自一個基準值異常偏高的模擬日，單看它會誤導。' + IOT_CAVEAT['zh-TW'],
      'Both are model results, not measurements, and not scooter-specific; the 94% comes from one simulated day with an anomalously high baseline and is misleading on its own. ' + IOT_CAVEAT.en,
    ),
    requiresCaveat: true,
    relatedFacts: ['iot-scramble-typical-range', 'iot-scramble-outlier-day'],
    locator: 'p.4-28 range −21.40% to −2.58%; Table 4.3.2-30 Day 2 −94.86%*',
    chainLink: 3,
    editorNote: 'Never show the 94% on its own.',
    research: '02 §1a, Corrections #1',
  },
  'iot-scramble-by-day': {
    topic: 'exposure',
    title: t('行人專用時相的模擬PM2.5變化（逐日）', 'Modelled PM2.5 change from scramble phases, by simulated day'),
    description: t(
      '各情境各模擬日的完整結果，含未通過模式檢核的日子。',
      'Full results for each scenario and simulated day, including days that failed the model check.',
    ),
    chart: 'grouped-bar',
    unit: 'percent',
    categories: SIM_DAYS,
    yLabel: t('PM2.5變化（%）', 'Change in PM2.5 (%)'),
    datasets: [
      {
        key: 'generalSingleAllDay',
        label: t('一般路口、單一背景源（台北／新北），全天', 'General, single background source (Taipei / New Taipei), all day'),
        kind: 'modelled',
        points: days(iot(-7.51), iot(-10.23, '*'), iot(10.22, '#'), iot(-4.38, '#')),
      },
      {
        key: 'generalComplexAllDay',
        label: t('一般路口、複雜背景源（高雄），全天', 'General, complex background source (Kaohsiung), all day'),
        kind: 'modelled',
        points: days(iot(-17.79, '*'), iot(-94.86, '*', ['outlier']), iot(-16.22, '#'), iot(-12.0, '#')),
      },
      {
        key: 'generalComplexPeak',
        label: t('一般路口、複雜背景源（高雄），僅尖峰', 'General, complex background source (Kaohsiung), peak hours only'),
        kind: 'modelled',
        points: days(iot(-7.87), iot(-94.43, '*', ['outlier']), iot(-9.54, '#'), iot(-2.92, '#')),
      },
      {
        key: 'busSinglePeak',
        label: t('公車密集路口、單一背景源，僅尖峰', 'Bus-heavy, single background source, peak hours only'),
        kind: 'modelled',
        points: days(iot(-20.03, '*'), iot(-23.95, '*'), iot(-1.76, '#'), iot(0.09, '#')),
      },
    ],
    period: t('2024年量測資料驅動的模擬', 'Simulation driven by 2024 field data'),
    place: t('台北市、新北市、高雄市路口', 'Intersections in Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '受體點位平均的模擬結果；標示「未通過模式效能檢核」的數值可信度較低。高雄第2模擬日為報告自行標示的離群值。' + IOT_CAVEAT['zh-TW'],
      'Modelled receptor averages; values that failed the model-performance check are less reliable. Kaohsiung day 2 is an outlier flagged by the report itself. ' + IOT_CAVEAT.en,
    ),
    requiresCaveat: true,
    locator: 'Tables 4.3.2-29 to 4.3.2-32 (* significant at 95%; # failed model-performance evaluation)',
    chainLink: 3,
    research: '02 §1a, Table E',
  },
  'iot-scramble-co-single-source': {
    topic: 'exposure',
    title: t('行人專用時相的模擬一氧化碳變化（台北／新北）', 'Modelled CO change from an all-day scramble phase (Taipei / New Taipei)'),
    description: t('在這些路口，模擬的一氧化碳反而上升。', 'At these intersections, modelled carbon monoxide rose.'),
    chart: 'bar',
    unit: 'percent',
    categories: SIM_DAYS,
    datasets: [
      {
        key: 'co',
        label: t('一氧化碳變化', 'Change in CO'),
        kind: 'modelled',
        points: days(iot(18.33, '*'), iot(7.54, '*'), iot(7.45), iot(39.62)),
      },
    ],
    period: t('2024年量測資料驅動的模擬', 'Simulation driven by 2024 field data'),
    place: t('台北市、新北市路口（一般路口、單一背景源）', 'Taipei and New Taipei intersections (general, single background source)'),
    sources: ['iot-2025-intersection-air-quality'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: IOT_CAVEAT,
    relatedFacts: ['iot-scramble-co-rise'],
    locator: 'Table 4.3.2-29, CO',
    chainLink: 3,
    research: '02 §1a',
  },
  'iot-sidewalk-widening-by-day': {
    topic: 'exposure',
    title: t('人行道拓寬0.5公尺的模擬PM2.5變化', 'Modelled PM2.5 change from widening the sidewalk by 0.5 m'),
    description: t('變化很小，方向也不一致。', 'Small changes with no consistent direction.'),
    chart: 'grouped-bar',
    unit: 'percent',
    categories: SIM_DAYS,
    datasets: [
      {
        key: 'generalSingle',
        label: t('一般路口、單一背景源', 'General, single source'),
        kind: 'modelled',
        points: days(iot(-1.64, '#'), iot(-0.19), iot(-1.39, '*'), iot(-1.16, '*')),
      },
      {
        key: 'generalComplex',
        label: t('一般路口、複雜背景源', 'General, complex source'),
        kind: 'modelled',
        points: days(iot(-0.31), iot(4.05), iot(3.64), iot(5.34, '#')),
      },
      {
        key: 'busSingle',
        label: t('公車密集路口、單一背景源', 'Bus-heavy, single source'),
        kind: 'modelled',
        points: days(iot(-0.55), iot(-1.08, '*'), iot(-1.46, '#'), iot(0.73, '#')),
      },
      {
        key: 'busComplex',
        label: t('公車密集路口、複雜背景源', 'Bus-heavy, complex source'),
        kind: 'modelled',
        points: days(iot(-1.88, '*'), iot(-1.7, '*'), iot(-0.51, '#'), iot(0.4, '#')),
      },
    ],
    period: t('2024年量測資料驅動的模擬', 'Simulation driven by 2024 field data'),
    place: t('台北市、新北市、高雄市路口', 'Intersections in Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '媒體報導的「約2%」是最佳情況（−1.88%）。' + IOT_CAVEAT['zh-TW'],
      'The "about 2%" in press reports is the best case (−1.88%). ' + IOT_CAVEAT.en,
    ),
    relatedFacts: ['iot-sidewalk-widening'],
    locator: 'Tables 4.3.2-29 to 4.3.2-32, sidewalk +0.5 m. Significance marks per research file §1a text.',
    chainLink: 3,
    research: '02 §1a, Table F',
  },

  // -------------------------------------------------------------------------
  // standards
  // -------------------------------------------------------------------------
  'pm25-standards-who-vs-taiwan': {
    topic: 'standards',
    title: t('PM2.5標準：WHO指引與台灣法規', 'PM2.5: WHO guideline vs Taiwan\'s legal standard'),
    description: t(
      '台灣的年平均標準（12）是WHO指引（5）的兩倍多，介於WHO第三與第四階段過渡目標之間。',
      'Taiwan\'s annual standard (12) is more than double the WHO guideline (5), between WHO interim targets 3 and 4.',
    ),
    chart: 'grouped-bar',
    unit: 'ug/m3',
    categories: [
      { key: 'annual', label: t('年平均', 'Annual') },
      { key: 'daily', label: t('24小時', '24-hour') },
    ],
    datasets: [
      {
        key: 'taiwan',
        label: t('台灣空氣品質標準（2024年修正）', 'Taiwan standard (amended 2024)'),
        kind: 'reference',
        evidence: 'official-tw',
        points: [
          { x: 'annual', y: 12, sources: ['moenv-air-quality-standards'] },
          { x: 'daily', y: 30, sources: ['moenv-air-quality-standards'] },
        ],
      },
      {
        key: 'whoAqg',
        label: t('WHO指引值（2021）', 'WHO guideline (2021)'),
        kind: 'reference',
        evidence: 'international',
        points: [
          { x: 'annual', y: 5, sources: ['who-2021-aqg'] },
          { x: 'daily', y: 15, sources: ['who-2021-aqg'] },
        ],
      },
      { key: 'whoIt1', label: t('WHO過渡目標1', 'WHO interim target 1'), kind: 'reference', evidence: 'international', points: [{ x: 'annual', y: 35 }, { x: 'daily', y: 75 }] },
      { key: 'whoIt2', label: t('WHO過渡目標2', 'WHO interim target 2'), kind: 'reference', evidence: 'international', points: [{ x: 'annual', y: 25 }, { x: 'daily', y: 50 }] },
      { key: 'whoIt3', label: t('WHO過渡目標3', 'WHO interim target 3'), kind: 'reference', evidence: 'international', points: [{ x: 'annual', y: 15 }, { x: 'daily', y: 37.5 }] },
      { key: 'whoIt4', label: t('WHO過渡目標4', 'WHO interim target 4'), kind: 'reference', evidence: 'international', points: [{ x: 'annual', y: 10 }, { x: 'daily', y: 25 }] },
    ],
    period: t('WHO 2021年；台灣2024年9月30日修正', 'WHO 2021; Taiwan as amended 30 September 2024'),
    place: t('台灣與全球', 'Taiwan and global'),
    sources: ['moenv-air-quality-standards', 'who-2021-aqg'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      'WHO指引是建議值，台灣標準是法規；WHO的24小時值為第99百分位數（每年可超過3至4天）。',
      'WHO guidelines are recommendations; Taiwan\'s standard is law. WHO 24-hour values are 99th percentiles (3–4 exceedance days a year).',
    ),
    relatedFacts: ['tw-pm25-standard', 'who-pm25-guideline', 'who-pm25-interim-targets'],
    chainLink: 3,
    research: '02 §8 Table G; 03 §2 Table 0.1',
  },

  // -------------------------------------------------------------------------
  // health
  // -------------------------------------------------------------------------
  'hei-sr23-outcomes': {
    topic: 'health',
    title: t('交通相關空氣污染與健康結果的關聯（HEI，2022）', 'Traffic-related air pollution and health outcomes (HEI, 2022)'),
    description: t(
      '彙整相對風險（RR）與95%信賴區間；類別說明為HEI的整體信心等級。',
      'Summary relative risks with 95% confidence intervals; category notes give HEI\'s overall confidence rating.',
    ),
    chart: 'dot-range',
    unit: 'relative-risk',
    categories: [
      { key: 'asthmaChildren', label: t('兒童氣喘發病', 'Asthma onset, children'), note: t('中至高', 'Moderate to high') },
      { key: 'asthmaAdults', label: t('成人氣喘發病', 'Asthma onset, adults'), note: t('中至高', 'Moderate to high') },
      { key: 'alriChildren', label: t('兒童急性下呼吸道感染', 'Acute lower respiratory infection, children'), note: t('中至高', 'Moderate to high') },
      { key: 'allCause', label: t('全死因死亡', 'All-cause mortality'), note: t('高', 'High') },
      { key: 'circulatory', label: t('循環系統疾病死亡', 'Circulatory mortality'), note: t('高', 'High') },
      { key: 'ihd', label: t('缺血性心臟病死亡', 'Ischaemic heart disease mortality'), note: t('高', 'High') },
      { key: 'lungCancer', label: t('肺癌死亡', 'Lung cancer mortality'), note: t('中至高', 'Moderate to high') },
      { key: 'termLbw', label: t('足月低出生體重', 'Term low birth weight'), note: t('中', 'Moderate') },
      { key: 'sga', label: t('小於妊娠年齡', 'Small for gestational age'), note: t('中', 'Moderate') },
    ],
    datasets: [
      {
        key: 'no2',
        label: t('二氧化氮，每增加10 µg/m³', 'NO₂, per 10 µg/m³'),
        points: [
          { x: 'asthmaChildren', y: 1.05, low: 0.99, high: 1.12 },
          { x: 'asthmaAdults', y: 1.1, low: 1.01, high: 1.21 },
          { x: 'alriChildren', y: 1.09, low: 1.03, high: 1.16 },
          { x: 'allCause', y: 1.04, low: 1.01, high: 1.06 },
          { x: 'circulatory', y: 1.04, low: 1.0, high: 1.09 },
          { x: 'ihd', y: 1.05, low: 1.03, high: 1.08 },
          { x: 'lungCancer', y: 1.04, low: 1.01, high: 1.07 },
        ],
      },
      {
        key: 'pm25',
        label: t('PM2.5，每增加5 µg/m³', 'PM2.5, per 5 µg/m³'),
        points: [
          { x: 'asthmaChildren', y: 1.11, low: 0.94, high: 1.31 },
          { x: 'allCause', y: 1.02, low: 1.0, high: 1.04 },
          { x: 'termLbw', y: 1.11, low: 1.03, high: 1.2 },
          { x: 'sga', y: 1.09, low: 1.04, high: 1.14 },
        ],
      },
      {
        key: 'ec',
        label: t('元素碳，每增加1 µg/m³', 'Elemental carbon, per 1 µg/m³'),
        points: [{ x: 'allCause', y: 1.03, low: 1.01, high: 1.05 }],
      },
    ],
    period: t('2022年（10月14日更新）', '2022 (updated 14 October)'),
    place: t('國際（以歐洲與北美研究為主）', 'International (mostly European and North American studies)'),
    sources: ['hei-sr23-2022'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這些是「關聯」的彙整估計，HEI明言未評估因果；研究多在暴露水準較高的年代與地區進行。未列出的組合表示執行摘要中沒有該數字。',
      'These are pooled estimates of association; HEI states it did not assess causality, and most studies come from places and times with higher exposure. Missing combinations are not in the executive summary.',
    ),
    requiresCaveat: true,
    relatedFacts: ['hei-sr23-trap-associations'],
    chainLink: 5,
    research: '03 §6',
  },

  // -------------------------------------------------------------------------
  // economics (values computed with the calculator dataset; the engine tests
  // check that they still match src/data/econ, so a data edit that changes
  // them fails `npm run check` until this table is updated)
  // -------------------------------------------------------------------------
  'econ-monthly-energy-cost-by-mileage': {
    topic: 'economics',
    title: t('每月騎多遠，油錢與電池費各要多少', 'Monthly fuel or battery cost by distance ridden'),
    description: t(
      '騎得少時，換電月租比油錢貴；按用量計費的方案較接近油錢；能在家充電的車款最便宜。',
      'At low mileage a swap subscription costs more than fuel; pay-per-use plans come closer to fuel; a model you can charge at home is cheapest.',
    ),
    chart: 'line',
    unit: 'ntd-per-month',
    categories: [
      { key: '300', label: t('300公里', '300 km') },
      { key: '500', label: t('500公里', '500 km') },
      { key: '800', label: t('800公里', '800 km') },
      { key: '1000', label: t('1,000公里', '1,000 km') },
      { key: '1500', label: t('1,500公里', '1,500 km') },
    ],
    xLabel: t('每月里程', 'Distance per month'),
    yLabel: t('每月花費（元）', 'Monthly cost (NT$)'),
    datasets: [
      {
        key: 'petrolOfficial',
        label: t('汽油：官方油耗（每公升61.5公里）', 'Petrol at the official 61.5 km/L'),
        points: [
          { x: '300', y: 160 },
          { x: '500', y: 266 },
          { x: '800', y: 425 },
          { x: '1000', y: 532 },
          { x: '1500', y: 798 },
        ],
        note: t('光陽新豪邁125，95無鉛每公升32.7元。', 'KYMCO New Haomai 125 at NT$32.7 a litre (95 unleaded).'),
      },
      {
        key: 'petrolRealWorld',
        label: t('汽油：實際騎乘（每公升45公里）', 'Petrol at a real-world 45 km/L'),
        confidence: 'secondary',
        points: [
          { x: '300', y: 218 },
          { x: '500', y: 363 },
          { x: '800', y: 581 },
          { x: '1000', y: 727 },
          { x: '1500', y: 1090 },
        ],
      },
      {
        key: 'gogoro488Free',
        label: t('Gogoro 488（全部在免費時段換電）', 'Gogoro 488 (every swap in a free window)'),
        kind: 'reference',
        points: [
          { x: '300', y: 488 },
          { x: '500', y: 488 },
          { x: '800', y: 488 },
          { x: '1000', y: 488 },
          { x: '1500', y: 488 },
        ],
        note: t('最理想情況；時段外換電每安時2.3元。', 'The best case; swaps outside the windows cost NT$2.3 per Ah.'),
      },
      {
        key: 'gogoro488Half',
        label: t('Gogoro 488（一半在時段外）', 'Gogoro 488 (half the swaps outside the windows)'),
        points: [
          { x: '300', y: 753 },
          { x: '500', y: 930 },
          { x: '800', y: 1196 },
          { x: '1000', y: 1373 },
          { x: '1500', y: 1815 },
        ],
        note: t('EZZY單電池，以交通部調查平均每安時1.3公里計。', 'EZZY single battery at the MOTC survey average of 1.3 km per Ah.'),
      },
      {
        key: 'gogoro319',
        label: t('Gogoro 自由省319（含87安時）', 'Gogoro plan 319 (87 Ah included)'),
        points: [
          { x: '300', y: 650 },
          { x: '500', y: 1004 },
          { x: '800', y: 1534 },
          { x: '1000', y: 1888 },
          { x: '1500', y: 2773 },
        ],
        note: t('超過87安時每安時2.3元；EZZY新車前24個月每月可折151元（未計入此圖）。', 'NT$2.3 per Ah beyond 87 Ah; new EZZY buyers get NT$151 a month off for 24 months (not shown).'),
      },
      {
        key: 'gogoroPayg',
        label: t('Gogoro 0月租（每安時1.1元，不含設定費）', 'Gogoro pay-per-use (NT$1.1/Ah, excluding setup fee)'),
        points: [
          { x: '300', y: 254 },
          { x: '500', y: 423 },
          { x: '800', y: 677 },
          { x: '1000', y: 846 },
          { x: '1500', y: 1269 },
        ],
        note: t('另有一次性設定費（單電池6,000元，每24個月續約再付）。', 'Plus a one-off setup fee (NT$6,000 single battery, again at each 24-month renewal).'),
      },
      {
        key: 'ionex318',
        label: t('Ionex 318方案', 'Ionex plan 318'),
        points: [
          { x: '300', y: 567 },
          { x: '500', y: 899 },
          { x: '800', y: 1397 },
          { x: '1000', y: 1730 },
          { x: '1500', y: 2560 },
        ],
        note: t('CoolOne換電版，每度31.3公里；月租內含的折抵金換電時每度扣52元（318方案約4.8度、518方案約12.5度），超量每度52元。', 'CoolOne (swap version) at 31.3 km/kWh; the credit in the plan buys swap energy at NT$52 per kWh (about 4.8 kWh on the 318 plan, 12.5 kWh on the 518), then NT$52 per kWh beyond it.'),
      },
      {
        key: 'ionex518',
        label: t('Ionex 518方案（單電池）', 'Ionex plan 518 (single battery)'),
        points: [
          { x: '300', y: 518 },
          { x: '500', y: 699 },
          { x: '800', y: 1197 },
          { x: '1000', y: 1529 },
          { x: '1500', y: 2360 },
        ],
      },
      {
        key: 'homeCharging',
        label: t('在家充電：ZAU ES-1000（每度約2.36元，含充電損耗）', 'Home charging: ZAU ES-1000 (about NT$2.36/kWh, with charging losses)'),
        confidence: 'secondary',
        evidence: 'derived',
        points: [
          { x: '300', y: 22 },
          { x: '500', y: 36 },
          { x: '800', y: 58 },
          { x: '1000', y: 73 },
          { x: '1500', y: 109 },
        ],
        note: t('每度約35.8公里（無官方數字，取推估範圍中點）；電價取121至330度級距的全年平均2.36元，另加一成充電損耗。這款車極速53 km/h，不是125cc的同級車。', 'About 35.8 km per kWh (no official figure; midpoint of the estimate); electricity at the 121–330 kWh tier averaged over the year (NT$2.36) plus 10% charging losses. This model tops out at 53 km/h and is not a 125cc equivalent.'),
      },
    ],
    period: t('2026年11月價格', 'November 2026 prices'),
    place: TW,
    sources: ['cpc-price-history', 'tvbs-cars-2026-06-fuel-ranking', 'kikinote-fuel-cost-assumption', 'gogoro-488-888-promo', 'gogoro-network-plan-pages', 'gogoro-network-payg-page', 'motc-2024-scooter-survey', 'ionex-plans', 'ionex-coolone-product', 'zau-es1000-spec', 'tvbs-2026-electricity-tariff'],
    confidence: 'verified',
    evidence: 'derived',
    caveat: t(
      '只比較能源費用（含月租），不含保養與規費。換電方案都要綁約24個月；實際油耗、換電時段與家中電價級距因人而異。實際騎乘每公升45公里與在家充電電價屬次級資料。',
      'Energy only (including plan fees), excluding maintenance and fees. Swap plans carry 24-month contracts; real fuel economy, swap timing and household tariff tier vary. The 45 km/L real-world figure and home tariffs are secondary data.',
    ),
    requiresCaveat: true,
    relatedFacts: ['econ-petrol-cost-per-km', 'econ-swap-vs-petrol-low-mileage', 'econ-home-charging-cost-per-km'],
    research: 'econ/running-costs#gogoro-ride-all-you-want',
  },
  'econ-motc-spend-by-class': {
    topic: 'economics',
    title: t('每輛機車一年的油電、保養與停車支出', 'Yearly spend per scooter on energy, maintenance and parking'),
    description: t('電動機車車主花在充電或租電池的錢，比普通重型燃油機車車主的油錢多；保養費只差一點。', 'Electric owners spend more on charging or battery rental than heavy-class gasoline owners spend on fuel; maintenance differs only slightly.'),
    chart: 'stacked-bar',
    unit: 'ntd-per-year',
    categories: [
      { key: 'electric', label: t('電動機車', 'Electric') },
      { key: 'gasolineHeavy', label: t('普通重型燃油機車', 'Heavy-class gasoline') },
      { key: 'gasolineLight', label: t('輕型燃油機車', 'Light-class gasoline') },
    ],
    yLabel: t('每年（元）', 'Per year (NT$)'),
    datasets: [
      {
        key: 'energy',
        label: t('油耗、充電或租用電池', 'Fuel, charging or battery rental'),
        points: [
          { x: 'electric', y: 7717 },
          { x: 'gasolineHeavy', y: 5502 },
          { x: 'gasolineLight', y: 3775 },
        ],
      },
      {
        key: 'maintenance',
        label: t('保養維修', 'Maintenance and repairs'),
        points: [
          { x: 'electric', y: 1947 },
          { x: 'gasolineHeavy', y: 2070 },
          { x: 'gasolineLight', y: 1311 },
        ],
      },
      {
        key: 'parking',
        label: t('停車', 'Parking'),
        points: [
          { x: 'electric', y: 842 },
          { x: 'gasolineHeavy', y: 817 },
          { x: 'gasolineLight', y: 499 },
        ],
      },
    ],
    period: t('2024年（民國113年）', '2024'),
    place: TW,
    sources: ['motc-2024-scooter-survey'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t('車主自報的平均值，混合不同里程、城市與換電或插電車主，不是同條件的成本比較。', 'Owner-reported averages mixing mileages, cities and swap or plug-in owners; not a like-for-like cost comparison.'),
    requiresCaveat: true,
    relatedFacts: ['econ-motc-annual-spend'],
    research: 'econ/running-costs#spend-electric-vs-gas',
  },
  'econ-ev-brand-share-2026-07': {
    topic: 'economics',
    title: t('2026年7月電動機車新掛牌：各品牌', 'New electric scooter registrations by brand, July 2026'),
    description: t('幾乎每一輛新電動機車都用Gogoro的換電網路。', 'Almost every new electric scooter uses Gogoro\'s swap network.'),
    chart: 'bar',
    unit: 'vehicles',
    categories: [
      { key: 'gogoro', label: t('Gogoro（睿能）', 'Gogoro') },
      { key: 'yamaha', label: t('山葉（Yamaha）', 'Yamaha') },
      { key: 'kymco', label: t('光陽', 'KYMCO') },
      { key: 'aeon', label: t('宏佳騰', 'Aeon') },
      { key: 'emoving', label: t('中華eMOVING', 'eMOVING') },
    ],
    datasets: [
      {
        key: 'registrations',
        label: t('新掛牌數', 'New registrations'),
        points: [
          { x: 'gogoro', y: 3183 },
          { x: 'yamaha', y: 144 },
          { x: 'kymco', y: 113 },
          { x: 'aeon', y: 92 },
          { x: 'emoving', y: 53 },
        ],
      },
    ],
    period: t('2026年7月（單月）', 'July 2026 (single month)'),
    place: TW,
    sources: ['tvbs-cars-2026-07-ev-sales'],
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t('TVBS依監理站掛牌資料整理；全月合計3,657輛，其餘品牌未列出。', 'A TVBS tally of registration data; 3,657 in total that month, other brands not shown.'),
    relatedFacts: ['econ-ev-brand-share-2026-07'],
    research: 'econ/other-ev-brands#share-2026-jul',
  },
} satisfies Record<string, SeriesInput>;

export const series = { ...baseSeries, ...redlightSeries } satisfies Record<string, SeriesInput>;

export type SeriesId = keyof typeof series;
export type Series = Omit<SeriesInput, 'chainLink'> & { id: SeriesId; chainLink: ChainLink | null };

const resolve = (id: SeriesId, s: SeriesInput): Series => ({
  ...s,
  id,
  chainLink: s.chainLink !== undefined ? s.chainLink : (seriesTopicDefaultChainLink[s.topic] ?? null),
});

export const seriesList: Series[] = (Object.entries(series) as [SeriesId, SeriesInput][]).map(([id, s]) => resolve(id, s));

/** Look up a series. Throws on an unknown id so a typo fails the build. */
export function getSeries(id: SeriesId): Series {
  const s = (series as Record<string, SeriesInput>)[id];
  if (!s) throw new Error(`[data] Unknown series id "${id}"`);
  return resolve(id, s);
}

export function seriesByTopic(topic: Topic): Series[] {
  return seriesList.filter((s) => s.topic === topic);
}

export interface LocalizedSeries {
  id: SeriesId;
  topic: Topic;
  chainLink: ChainLink | null;
  alsoLinks: ChainLink[];
  title: string;
  description: string;
  chart: ChartHint;
  unit: Unit;
  xLabel?: string;
  yLabel?: string;
  categories: { key: string; label: string; note?: string }[];
  datasets: {
    key: string;
    label: string;
    kind: NonNullable<Dataset['kind']>;
    unit: Unit;
    confidence: Confidence;
    evidence: Evidence;
    note?: string;
    points: (Omit<SeriesPoint, 'note'> & { note?: string; flagLabels: string[]; confidence: Confidence })[];
  }[];
  period: string;
  place: string;
  caveat?: string;
  requiresCaveat: boolean;
  confidence: Confidence;
  evidence: Evidence;
  badges: { confidence: string; evidence: string };
  citations: LocalizedCitation[];
}

/** Everything a chart component needs, in one language. */
export function localizeSeries(idOrSeries: SeriesId | Series, locale: Locale): LocalizedSeries {
  const s = typeof idOrSeries === 'string' ? getSeries(idOrSeries) : idOrSeries;
  return {
    id: s.id,
    topic: s.topic,
    chainLink: s.chainLink,
    alsoLinks: s.alsoLinks ?? [],
    title: s.title[locale],
    description: s.description[locale],
    chart: s.chart,
    unit: s.unit,
    xLabel: s.xLabel?.[locale],
    yLabel: s.yLabel?.[locale],
    categories: (s.categories ?? []).map((c) => ({ key: c.key, label: c.label[locale], note: c.note?.[locale] })),
    datasets: s.datasets.map((d) => {
      const dConf = d.confidence ?? s.confidence;
      return {
        key: d.key,
        label: d.label[locale],
        kind: d.kind ?? 'observed',
        unit: d.unit ?? s.unit,
        confidence: dConf,
        evidence: d.evidence ?? s.evidence,
        note: d.note?.[locale],
        points: d.points.map((p) => ({
          ...p,
          note: p.note?.[locale],
          flagLabels: (p.flags ?? []).map((f) => pointFlagLabels[f][locale]),
          confidence: p.confidence ?? dConf,
        })),
      };
    }),
    period: s.period[locale],
    place: s.place[locale],
    caveat: s.caveat?.[locale],
    requiresCaveat: s.requiresCaveat ?? false,
    confidence: s.confidence,
    evidence: s.evidence,
    badges: { confidence: confidenceLabels[s.confidence].label[locale], evidence: evidenceLabels[s.evidence].label[locale] },
    citations: s.sources.map((id) => ({ id, short: shortCitation(id, locale), full: formatCitation(id, locale), url: sourceUrl(id) })),
  };
}

/**
 * Pivot a localized series into a category × dataset matrix, the shape grouped/stacked bar
 * and line components want: rows follow `categories` (or the union of x values, in order),
 * columns follow `datasets`. Missing points are null (draw a gap). Example for GroupedBarChart:
 *   const m = seriesMatrix(localizeSeries('teds13-motorcycle-share', locale));
 *   groups = m.rows.map((r) => ({ label: r.label, values: r.values }))
 *   series = m.columns.map((c) => ({ label: c.label, tone: ... }))
 */
export function seriesMatrix(s: LocalizedSeries): {
  columns: { key: string; label: string }[];
  rows: { key: string; label: string; values: (number | null)[] }[];
} {
  const keys: { key: string; label: string }[] = s.categories.length
    ? s.categories.map((c) => ({ key: c.key, label: c.label }))
    : [...new Set(s.datasets.flatMap((d) => d.points.map((p) => String(p.x))))].map((k) => ({ key: k, label: k }));
  return {
    columns: s.datasets.map((d) => ({ key: d.key, label: d.label })),
    rows: keys.map(({ key, label }) => ({
      key,
      label,
      values: s.datasets.map((d) => d.points.find((p) => String(p.x) === key)?.y ?? null),
    })),
  };
}
