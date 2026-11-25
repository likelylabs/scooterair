// The claims registry. Every number or factual claim a page shows must come from here.
//
// How to use (in an .astro page):
//   import { fact, localizeFact } from '@/data';
//   const f = localizeFact('teds13-mc-co-share', locale);
//   // f.display, f.statement, f.caveat, f.badges, f.citations ...
//
// Rules for editors
// - Values are transcribed exactly as the research files give them (research/01-03). The
//   `research` field points at the section; `locator` quotes where in the source it is.
// - Nothing tagged UNVERIFIED in the research goes in. SECONDARY items say in their caveat
//   what they rest on.
// - `statement` is worded exactly as strongly as the evidence allows. Taiwanese health studies
//   show associations (「與…有關」), never 「導致」.
// - `requiresCaveat: true` means a page must render the caveat next to the number, not in a footnote.
// - `data` holds raw numbers for charts; `display` is the headline string a page shows.
//
// Extending (economics / idling sweeps): add a new group object below (or in a new
// facts-<topic>.ts file that exports one), register it in `factGroups` and `topicLabels`,
// and run `npm run check`. Ids must be unique across all groups.

import type { Confidence, Datum, Evidence, L10n, Locale, ResearchRef } from './types.ts';
import { confidenceLabels, evidenceLabels, t, v } from './types.ts';
import type { SourceId } from './sources.ts';
import { formatCitation, shortCitation, sourceUrl } from './sources.ts';
import { economics } from './facts-economics.ts';

export interface FactInput {
  /** Raw values for charts and calculations. May be empty for qualitative facts (e.g. an IARC group). */
  data: Record<string, Datum>;
  /** Headline display string, e.g. '1,466 萬輛' / '14.66 million'. */
  display: L10n;
  /** One sentence, worded exactly as strongly as the evidence allows. */
  statement: L10n;
  /** What time the figure refers to. */
  period: L10n;
  /** What place the figure refers to. */
  place: L10n;
  sources: SourceId[];
  /** Where in the source (table, page, verbatim quote). Internal; for reviewers. */
  locator?: string;
  confidence: Confidence;
  evidence: Evidence;
  /** What the reader must know to avoid being misled. */
  caveat?: L10n;
  /** If true, a page must show the caveat right next to the number. */
  requiresCaveat?: boolean;
  /** For evidence 'derived': the facts whose numbers the arithmetic uses. */
  derivedFrom?: string[];
  research: ResearchRef;
}

// ---------------------------------------------------------------------------
// Shared places, periods and caveats
// ---------------------------------------------------------------------------

const TW = t('臺灣（全國）', 'Taiwan (national)');
const TAIPEI = t('臺北市', 'Taipei City');
const TAIPEI_METRO = t('大臺北地區', 'Taipei metropolitan area');
const SIX_CITIES = t('六都', "Taiwan's six special municipalities");
const GLOBAL = t('全球', 'Global');
const NOT_PLACE = t('不限地區（危害分類）', 'Not place-specific (hazard classification)');

const TEDS_PERIOD = t('基準年2023年（民國112年），TEDS 13.0版，2026年1月發布', 'Base year 2023 (TEDS 13.0, published January 2026)');
const TEDS_SCOPE = t(
  '排放清冊只計算國內來源直接排放的原生性污染物，不含境外傳輸，也不含在空氣中二次生成的微粒；排放量占比不等於對空氣中濃度的貢獻，環境部也明確提醒不可如此解讀。',
  'The inventory counts only primary pollutants emitted directly by domestic sources; it excludes transboundary pollution and particles formed later in the air. An emissions share is not a share of what people breathe, and MOENV explicitly warns against reading it that way.',
);
const TEDS_COMBINED = t(
  '「燃油機車合計」是本站將清冊中二行程與四行程機車兩列相加的結果；兩列本身為環境部官方數字。',
  'The "gasoline scooters combined" figure is our sum of the inventory\'s two-stroke and four-stroke rows; each row is an official MOENV figure.',
);
const IOT_CAVEAT = t(
  '運研所以實測資料驅動擴散模式，模擬「有／無」改善措施的情境，並非在同一路口實際前後量測；報告封面註明結論不代表交通部意見。',
  'The Institute of Transportation used field data to drive a dispersion model and simulate scenarios with and without each measure; nothing was measured before and after at the same intersection. The report cover states its conclusions do not represent the Ministry\'s views.',
);
const ASSOCIATION_TW = t(
  '觀察性研究只能顯示關聯，不能證明因果；研究測量的是所有來源的PM2.5或交通相關污染，並未單獨區分機車廢氣。',
  'Observational research shows association, not proof of cause; it measured PM2.5 from all sources or traffic-related pollution and did not isolate scooter exhaust.',
);
const MEDIA_MOTC = t(
  '數字出自媒體轉述的交通部統計；我們未能直接開啟交通部的原始統計表。',
  'From a media report of MOTC statistics; we could not open the underlying MOTC table directly.',
);
const ABSTRACT_ONLY = t('僅依論文摘要。', 'Based on the paper\'s abstract only.');

// ---------------------------------------------------------------------------
// fleet: how many scooters, who rides them, for what
// ---------------------------------------------------------------------------

const fleet = {
  'fleet-registered-2024': {
    data: { total: v(14.66, 'million-vehicles'), total2023: v(14.55, 'million-vehicles') },
    display: t('1,466 萬輛', '14.66 million'),
    statement: t(
      '2024年臺灣登記的機車達1,466萬輛，仍逐年增加。',
      'Taiwan had 14.66 million registered motorcycles in 2024, and the number was still rising year on year.',
    ),
    period: t('2024年（民國113年）', '2024'),
    place: TW,
    sources: ['moenv-air-review-2024', 'moenv-air-review-2023'],
    locator: '113年度總檢討: 「機車，維持逐年成長，113 年已達 1,466 萬輛」; 112年度: 「112 年已達 1,455 萬輛」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '登記數涵蓋所有領有牌照的機車（含電動機車與大型重型機車），不只速克達。',
      'The count covers all licensed motorcycles (including electric and large heavy motorcycles), not only scooters.',
    ),
    research: '01 §1',
  },
  'fleet-electric-registered-2024': {
    data: { electric2024: v(770000, 'vehicles'), electric2023: v(700000, 'vehicles'), electric2018: v(190000, 'vehicles', { bound: 'gt' }) },
    display: t('77 萬輛', '770,000'),
    statement: t(
      '電動機車設籍數從2018年的逾19萬輛增加到2024年的77萬輛。',
      'Registered electric motorcycles grew from more than 190,000 in 2018 to 770,000 in 2024.',
    ),
    period: t('2018–2024年', '2018–2024'),
    place: TW,
    sources: ['moenv-air-review-2024', 'moenv-air-review-2023'],
    locator: '「107 年設籍數超過 19 萬輛，113 年已成長至 77 萬輛」',
    confidence: 'verified',
    evidence: 'official-tw',
    research: '01 §1',
  },
  'fleet-electric-share-of-stock-2024': {
    data: { share: v(5.3, 'percent', { approx: true, derived: true, note: '770,000 / 14.66 million = 5.25%' }) },
    display: t('約 5.3%', 'about 5.3%'),
    statement: t(
      '2024年電動機車約占全部登記機車的5.3%。',
      'Electric motorcycles were about 5.3% of all registered motorcycles in 2024.',
    ),
    period: t('2024年', '2024'),
    place: TW,
    sources: ['moenv-air-review-2024'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['fleet-registered-2024', 'fleet-electric-registered-2024'],
    research: '01 Corrections #2',
  },
  'fleet-fuel-mix-may-2026': {
    data: { total: v(14.67, 'million-vehicles'), gasolineShare: v(94, 'percent'), electricShare: v(5.5, 'percent') },
    display: t('94% 加汽油', '94% gasoline'),
    statement: t(
      '截至2026年5月底，全國約有1,467萬輛機車，其中94%使用汽油，電動機車只占5.5%。',
      'At the end of May 2026 Taiwan had about 14.67 million motorcycles; 94% ran on gasoline and only 5.5% were electric.',
    ),
    period: t('2026年5月底', 'End of May 2026'),
    place: TW,
    sources: ['pts-2026-07-scooter-fleet'],
    locator: '「2026年截至5月底，全國有1467萬台機車，有94%都是加汽油、電動機車只占5.5%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: MEDIA_MOTC,
    research: '01 §1',
  },
  'fleet-density-per-100': {
    data: { perHundred: v(62.7, 'per-100-people'), stock: v(14.662, 'million-vehicles') },
    display: t('每百人約 63 輛', 'about 63 per 100 people'),
    statement: t(
      '依媒體引述的交通部統計，臺灣平均每100人擁有約63輛機車（62.7輛）。',
      'According to MOTC figures reported in the media, Taiwan has about 63 registered motorcycles per 100 people (62.7).',
    ),
    period: t('2025年初（當年前兩個月）', 'Early 2025 (first two months)'),
    place: TW,
    sources: ['tvbs-2025-scooter-density'],
    locator: '「國內每一百位民眾，平均擁有62.7輛機車」; stock 1466.2萬輛',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自TVBS轉述的交通部統計；我們未取得內政部人口數，無法獨立驗算。',
      'From a TVBS report of an MOTC statistic; we did not obtain the population denominator to check it independently.',
    ),
    research: '01 §2',
  },
  'fleet-regional-ranking': {
    data: { taiwan: v(60, 'per-100-people'), vietnam: v(57, 'per-100-people'), malaysia: v(44, 'per-100-people') },
    display: t('名列前茅', 'among the highest'),
    statement: t(
      '在一份區域排名中，臺灣（每百人60輛）位居受比較國家之首，略高於越南（57輛）與馬來西亞（44輛），屬機車密度最高的國家之一。',
      'In one regional ranking Taiwan (60 motorcycles per 100 people) topped the countries compared, narrowly ahead of Vietnam (57) and Malaysia (44), placing it among the countries with the highest motorcycle density.',
    ),
    period: t('排名未註明年份', 'Ranking undated'),
    place: t('臺灣與東南亞國家', 'Taiwan and Southeast Asian countries'),
    sources: ['tvbs-cars-vehicle-registrations-ranking'],
    locator: '「冠軍為平均每百人就持有60輛機車的台灣，排名第二、三則是機車大國越南 (57輛) 與馬來西亞 (44輛)」',
    confidence: 'secondary',
    evidence: 'international',
    caveat: t(
      '這份排名出自TVBS引述的Seasia Stats，非官方且未註明年份；臺灣與越南只差3輛，在混用登記數與估計值的情況下差距不具意義，因此不能說臺灣是「世界最高」。60與交通部的62.7不同，是定義與時間差異。',
      'The ranking is Seasia Stats as cited by TVBS: unofficial and undated. The 3-point gap to Vietnam is within the uncertainty of mixing registered counts with estimates, so Taiwan cannot be called "the world\'s highest". The 60 differs from MOTC\'s 62.7 because of definition and date.',
    ),
    requiresCaveat: true,
    research: '01 §2',
  },
  'fleet-taipei-power-source-2024': {
    data: { fuel: v(90.6, 'percent'), batterySwap: v(8.4, 'percent'), plugIn: v(1.0, 'percent') },
    display: t('燃油 90.6%', '90.6% fuel-powered'),
    statement: t(
      '2024年底臺北市的機車以燃油為主（90.6%），電池交換式占8.4%，充電式占1.0%。',
      'At the end of 2024, 90.6% of motorcycles in Taipei City were fuel-powered, 8.4% were battery-swap electric and 1.0% plug-in electric.',
    ),
    period: t('2024年底', 'End of 2024'),
    place: TAIPEI,
    sources: ['taipei-dbas-bulletin-1364'],
    locator: '「機車動力來源以燃油占90.6%為主，電池交換式占8.4%居次」, charging 1.0%',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '數字來自交通部「機車及自用小客車使用狀況調查」，經臺北市主計處轉載，是調查結果而非登記數。',
      'From the MOTC motorcycle and private-car usage survey as relayed by the Taipei City statistics office: a survey result, not a registration count.',
    ),
    research: '01 §3',
  },
  'fleet-six-cities-ev-2025': {
    data: {
      salesShare: v(7.5, 'percent'),
      penetration: v(6.1, 'percent'),
      taipeiSalesShare: v(22.1, 'percent'),
      taipeiPenetration: v(10, 'percent'),
    },
    display: t('臺北市 22.1%', 'Taipei 22.1%'),
    statement: t(
      '2025年六都電動機車市售比為7.5%、普及率6.1%；臺北市最高，市售比22.1%、普及率10%。',
      'In 2025 electric models were 7.5% of new motorcycle sales across the six special municipalities, with a 6.1% penetration rate; Taipei led with a 22.1% sales share and 10% penetration.',
    ),
    period: t('2025年', '2025'),
    place: SIX_CITIES,
    sources: ['ctee-2026-04-six-cities-ev'],
    locator: '「2025年六都電動機車市售比為7.5％、電動機車的普及率為6.1％。六都中以台北市的市售比22.1％最高…普及率也以10％領跑六都」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自工商時報報導，引用機車產業團體（SMAT）整理的公路局資料；未能查核原始數據。',
      'From a Commercial Times report quoting an industry association (SMAT) citing Highway Bureau data; not checked against the original figures.',
    ),
    research: '01 §3',
  },
  'scooter-commuting-purpose-2024': {
    data: {
      national: v(58.4, 'percent'),
      taipei: v(63.3, 'percent'),
      newTaipei: v(61.2, 'percent'),
      taoyuan: v(60.4, 'percent'),
      taichung: v(61.1, 'percent'),
      tainan: v(60.7, 'percent'),
      kaohsiung: v(57.2, 'percent'),
    },
    display: t('58.4% 用於通勤', '58.4% for commuting'),
    statement: t(
      '2024年全國機車的主要用途有58.4%為通勤；六都介於高雄市57.2%到臺北市63.3%之間。',
      'In 2024 commuting was the main purpose of motorcycle use for 58.4% nationally; across the six special municipalities it ranged from 57.2% (Kaohsiung) to 63.3% (Taipei).',
    ),
    period: t('2024年（民國113年）', '2024'),
    place: TW,
    sources: ['taipei-dbas-bulletin-1364'],
    locator: 'table 「全國 58.4 …臺北市 63.3 …新北市 61.2 …」',
    confidence: 'verified',
    evidence: 'official-tw',
    research: '01 §9',
  },
  'mode-share-national-2022': {
    data: { scooter: v(45.8, 'percent'), publicTransport: v(14.3, 'percent'), taipeiPublicTransport: v(37.2, 'percent') },
    display: t('45.8%', '45.8%'),
    statement: t(
      '依2022年統計，機車是全國最主要的運具，市占率45.8%；公共運輸市占率只有14.3%。',
      'In 2022 motorcycles were Taiwan\'s most used mode of transport, with a 45.8% share; public transport had 14.3%.',
    ),
    period: t('2022年（民國111年）', '2022'),
    place: TW,
    sources: ['tvbs-2022-mode-share'],
    locator: '「仍然以機車為最大宗，市占率45.8%最高」「公共運輸市占率為14.3%…台北市最高達到37.2%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自TVBS轉述的交通部運具調查；我們找不到2024年的全國數字。',
      'From a TVBS report of the MOTC transport-mode survey; we found no 2024 national figure.',
    ),
    research: '01 §9',
  },
  'mode-share-taipei-2024': {
    data: {
      scooter2024: v(20.1, 'percent'),
      scooter2022: v(22.2, 'percent'),
      car2024: v(16.3, 'percent'),
      car2022: v(15.9, 'percent'),
      publicTransport2024: v(38.3, 'percent'),
      walking2024: v(20.8, 'percent'),
    },
    display: t('機車 20.1%', '20.1% by motorcycle'),
    statement: t(
      '2024年臺北市平日旅次中，機車占20.1%（2022年為22.2%），公共運輸占38.3%，步行占20.8%。',
      'On weekdays in 2024, 20.1% of trips in Taipei City were by motorcycle (22.2% in 2022), 38.3% by public transport and 20.8% on foot.',
    ),
    period: t('2024年9至12月平日（2022年同期比較）', 'Weekdays, Sept–Dec 2024 (compared with 2022)'),
    place: TAIPEI,
    sources: ['taipei-dbas-bulletin-1341'],
    locator: 'row 「113 年 63.0 38.3 16.0 13.7 24.7 20.8 3.8 37.0 20.1 16.3 44.2…」',
    confidence: 'verified',
    evidence: 'official-tw',
    research: '01 §9',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// electric: electric share of new registrations
// ---------------------------------------------------------------------------

const REGISTRATIONS_NOTE = t(
  '新領牌數出自媒體轉述的交通部或產業統計，各來源對分母（是否含重型機車）的處理略有不同。',
  'New-registration figures come from media reports of MOTC or industry statistics; sources differ slightly in their denominator (e.g. whether heavy motorcycles are included).',
);

const electric = {
  'ev-share-2019': {
    data: {
      share: v(18.7, 'percent'),
      electric: v(168542, 'vehicles'),
      gasoline: v(733760, 'vehicles'),
      total: v(902302, 'vehicles'),
    },
    display: t('18.7%', '18.7%'),
    statement: t(
      '2019年新領牌機車中，電動機車占18.7%（168,542輛），是現有資料年份中的最高點。',
      'In 2019 electric models made up 18.7% of new motorcycle registrations (168,542 of 902,302), the highest share in the years for which we have figures.',
    ),
    period: t('2019年', '2019'),
    place: TW,
    sources: ['cnyes-2019-registrations'],
    locator: '「2019 年度環保燃油車 733,760 台 (81.3%) 大勝電動車 168,542 台 (18.7%)」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自鉅亨網引述的交通部統計。2015至2018年與2020年的數字未能查證，因此只能說是「現有資料中」的高點。',
      'From an Anue (cnyes) report citing MOTC statistics. Figures for 2015–2018 and 2020 could not be verified, so this is the peak only among the years we have.',
    ),
    research: '01 §7',
  },
  'ev-share-2021': {
    data: {
      share: v(11.6, 'percent', { derived: true }),
      electric: v(94000, 'vehicles', { approx: true, derived: true, note: '809,196 − 715,197' }),
      gasoline: v(715197, 'vehicles'),
      total: v(809196, 'vehicles'),
    },
    display: t('約 11.6%', 'about 11.6%'),
    statement: t(
      '2021年電動機車約占新售機車的11.6%，由當年機車總銷量與燃油機車銷量推算。',
      'In 2021 electric models were about 11.6% of new motorcycle sales, calculated from that year\'s total and gasoline sales.',
    ),
    period: t('2021年', '2021'),
    place: TW,
    sources: ['chinatimes-2022-gogoro-briefing'],
    locator: '「全體機車市場年度總銷量為80萬9196輛…燃油機車市場71萬5,197輛」',
    confidence: 'secondary',
    evidence: 'derived',
    caveat: t(
      '總銷量與燃油機車銷量出自工商時報報導的Gogoro說明會（企業資料），電動機車數與比例為本站推算。',
      'Total and gasoline sales are from a Commercial Times report of a Gogoro press briefing (company figures); the electric count and share are our calculation.',
    ),
    research: '01 §7',
  },
  'ev-share-2022': {
    data: { share: v(11.9, 'percent') },
    display: t('11.9%', '11.9%'),
    statement: t('2022年電動機車市售比為11.9%。', 'In 2022 electric models were 11.9% of new motorcycle sales.'),
    period: t('2022年', '2022'),
    place: TW,
    sources: ['pts-2026-04-ev-share'],
    locator: '「2022年電動機車市售比11.9%」 (SMAT via PTS)',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自公視新聞網引述的產業團體數字；當年的總領牌數未能取得。',
      'From PTS News quoting an industry association figure; the total registrations for that year were not obtained.',
    ),
    research: '01 §7',
  },
  'ev-share-2023': {
    data: { share: v(9.14, 'percent'), electric: v(79584, 'vehicles'), total: v(870620, 'vehicles') },
    display: t('9.14%', '9.14%'),
    statement: t(
      '2023年電動機車掛牌79,584輛，占機車總市場的9.14%。',
      'In 2023, 79,584 electric motorcycles were registered, 9.14% of the motorcycle market.',
    ),
    period: t('2023年', '2023'),
    place: TW,
    sources: ['ucar-ev-sales-2023', 'tvbs-cars-2024-market-total'],
    locator: 'U-CAR: 79,584 「佔機車總市場 9.141%」; TVBS: total 870,620',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: REGISTRATIONS_NOTE,
    research: '01 §7',
  },
  'ev-share-2024': {
    data: {
      share: v(10.46, 'percent'),
      shareAlt: v(10.38, 'percent', { note: 'U-CAR; denominator difference' }),
      electric: v(78757, 'vehicles'),
      total: v(752643, 'vehicles'),
      gasoline: v(673886, 'vehicles', { derived: true, note: '752,643 − 78,757' }),
    },
    display: t('10.46%', '10.46%'),
    statement: t(
      '2024年全國機車掛牌752,643輛，其中電動機車78,757輛，占10.46%。',
      'Of 752,643 motorcycles registered in 2024, 78,757 were electric, a share of 10.46%.',
    ),
    period: t('2024年', '2024'),
    place: TW,
    sources: ['tvbs-cars-2024-market-total', 'tvbs-cars-2024-ev-share', 'ucar-ev-sales-2024'],
    locator: 'TVBS 「2024年台灣機車總市場的掛牌數來到752,643輛」「78,757」「10.46」; U-CAR 10.38%',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      'U-CAR報導的比例為10.38%，與TVBS相差0.08個百分點，來自分母定義不同。' + REGISTRATIONS_NOTE['zh-TW'],
      'U-CAR reports 10.38%, 0.08 points lower than TVBS, because of a different denominator. ' + REGISTRATIONS_NOTE.en,
    ),
    research: '01 §7',
  },
  'ev-share-2025': {
    data: {
      share: v(6.94, 'percent'),
      electric: v(49128, 'vehicles'),
      total: v(708000, 'vehicles', { approx: true, derived: true, note: '49,128 / 6.94%' }),
      gasoline: v(659000, 'vehicles', { approx: true, derived: true }),
    },
    display: t('6.94%', '6.94%'),
    statement: t(
      '2025年電動機車新領牌49,128輛，市售比只有6.94%。',
      'In 2025 only 49,128 new electric motorcycles were registered, a 6.94% share of new sales.',
    ),
    period: t('2025年', '2025'),
    place: TW,
    sources: ['tvbs-cars-2025-12-ev-sales', 'pts-2026-07-scooter-fleet'],
    locator: 'TVBS table total 「49,128」; PTS 「2025年只有6.94%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '總領牌數約70.8萬輛是本站由49,128輛與6.94%推算，未見於原始報導。' + REGISTRATIONS_NOTE['zh-TW'],
      'The total of about 708,000 is our back-calculation from 49,128 and 6.94%; it does not appear in the reports. ' + REGISTRATIONS_NOTE.en,
    ),
    research: '01 §7',
  },
  'ev-registrations-decline-2019-2025': {
    data: {
      electric2019: v(168542, 'vehicles'),
      electric2025: v(49128, 'vehicles'),
      dropPercent: v(71, 'percent', { approx: true, derived: true, note: '(168,542 − 49,128) / 168,542 = 70.85%' }),
    },
    display: t('減少約七成', 'down about 71%'),
    statement: t(
      '新領牌電動機車從2019年的168,542輛降到2025年的49,128輛，減少約七成。',
      'New electric motorcycle registrations fell from 168,542 in 2019 to 49,128 in 2025, a drop of about 71%.',
    ),
    period: t('2019–2025年', '2019–2025'),
    place: TW,
    sources: ['cnyes-2019-registrations', 'tvbs-cars-2025-12-ev-sales'],
    confidence: 'secondary',
    evidence: 'derived',
    derivedFrom: ['ev-share-2019', 'ev-share-2025'],
    caveat: t(
      '媒體將下滑歸因於2019年後補助減少、Gogoro於2022年取消電池吃到飽方案，以及2025年燃油機車貨物稅減徵等；這些原因未經本站查證。',
      'Media attribute the fall to subsidy cuts after 2019, Gogoro ending its unlimited battery plan in 2022 and the 2025 excise-tax cut on gasoline scooters; we have not verified these causes.',
    ),
    research: '01 §7',
  },
  'ev-share-may-2026': {
    data: {
      share: v(6.9, 'percent', { approx: true, derived: true, note: '4,273 / 61,541 = 6.94%' }),
      electric: v(4273, 'vehicles'),
      total: v(61541, 'vehicles'),
    },
    display: t('約 7%（單月）', 'about 7% (one month)'),
    statement: t(
      '2026年5月全臺機車銷量61,541輛，其中電動機車4,273輛，約占7%。',
      'In May 2026, 4,273 of the 61,541 motorcycles sold in Taiwan were electric, about 7%.',
    ),
    period: t('2026年5月（單月）', 'May 2026 (single month)'),
    place: TW,
    sources: ['ctee-2026-06-may-sales'],
    locator: '「5月全台總銷量達6萬1541輛…5月整體銷量為4273輛」',
    confidence: 'secondary',
    evidence: 'derived',
    caveat: t(
      '單月數字，比例由本站計算；2026年其他月份未能查證，不可當作全年數字。',
      'A single month, with the share calculated by us; other 2026 months could not be verified, so do not treat it as an annual figure.',
    ),
    research: '01 §7',
  },
  'gas-scooter-excise-cut-2025': {
    data: { maxCut: v(2000, 'ntd'), maxDisplacement: v(125, 'cc') },
    display: t('最多減 2,000 元', 'up to NT$2,000 off'),
    statement: t(
      '自2025年8月29日起，購買125cc以下新燃油機車可減徵貨物稅，最多新臺幣2,000元。',
      'Since 29 August 2025, new gasoline scooters of up to 125cc qualify for an excise-tax cut of up to NT$2,000.',
    ),
    period: t('2025年8月29日起', 'From 29 August 2025'),
    place: TW,
    sources: ['tvbs-cars-2025-12-ev-sales'],
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自TVBS報導；財政部稅務入口網寫的實施日期是2025年9月7日（至2030年底），另有汰舊換新最高4,000元的減徵（見「價格、補助與使用成本」）。媒體認為這是電動機車銷量疲弱的原因之一，但本站未查證其效果。',
      'From a TVBS report; the MOF tax portal gives the start date as 7 September 2025 (running to the end of 2030) and lists a further scrap-and-replace cut of up to NT$4,000 (see "Prices, subsidies and running costs"). Media cite it as one reason for weak electric sales, which we have not verified.',
    ),
    research: '01 §7',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// policy: targets, standards phases, scrappage
// ---------------------------------------------------------------------------

const policy = {
  'netzero-ev-sales-targets': {
    data: {
      target2025: v(20, 'percent'),
      target2030: v(35, 'percent'),
      target2035: v(70, 'percent'),
      target2040: v(100, 'percent'),
    },
    display: t('2040年 100%', '100% by 2040'),
    statement: t(
      '臺灣2050淨零排放路徑規劃電動機車市售比在2025年達20%、2030年35%、2035年70%、2040年100%。',
      "Taiwan's 2050 net-zero pathway plans for electric models to reach 20% of new motorcycle sales in 2025, 35% in 2030, 70% in 2035 and 100% in 2040.",
    ),
    period: t('2025–2040年目標', 'Targets for 2025–2040'),
    place: TW,
    sources: ['pts-2026-07-scooter-fleet', 'pts-2026-04-ev-share'],
    locator: '「規劃電動機車的市售比在2025年要達到20%、2030年35%、2035年70%、2040年達到100%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自公視新聞網對淨零路徑的描述；國家發展委員會原始文件未能開啟。市售比目標不等於禁售燃油機車，我們找不到任何正式的禁售規定。',
      'From PTS News describing the net-zero pathway; the National Development Council original could not be opened. A sales-share target is not a ban on gasoline scooters, and we found no formal ban.',
    ),
    research: '01 §8',
  },
  'netzero-2025-gap': {
    data: {
      actual: v(6.94, 'percent'),
      target: v(20, 'percent'),
      gap: v(13.06, 'percentage-points', { derived: true }),
    },
    display: t('6.94% 對 20%', '6.94% vs 20%'),
    statement: t(
      '2025年電動機車市售比為6.94%，遠低於淨零路徑訂下的20%目標。',
      'In 2025 the electric share of new motorcycle sales was 6.94%, far below the 20% milestone in the net-zero pathway.',
    ),
    period: t('2025年', '2025'),
    place: TW,
    sources: ['pts-2026-07-scooter-fleet'],
    locator: '「離政府訂的淨零排放路徑20%目標、差了一大截」',
    confidence: 'secondary',
    evidence: 'derived',
    derivedFrom: ['ev-share-2025', 'netzero-ev-sales-targets'],
    caveat: t(
      '實際市售比出自媒體轉述的統計，目標出自公視對淨零路徑的描述（國發會原始文件未能開啟）；差距為本站計算。',
      'The actual share comes from media reports of statistics and the target from PTS\'s description of the net-zero pathway (the NDC original could not be opened); the gap is our calculation.',
    ),
    research: '01 §8',
  },
  'scooter-emission-standard-phases': {
    data: {
      phase1: v(1988, 'year'),
      phase4: v(2004, 'year'),
      phase5: v(2007, 'year'),
      phase6: v(2017, 'year'),
      phase7: v(2021, 'year'),
    },
    display: t('第七期（2021年起）', 'Phase 7 (since 2021)'),
    statement: t(
      '機車排放標準自1988年第一期起分期加嚴：2017年第六期約相當於歐盟第4期，2021年第七期另為直噴引擎增訂粒狀物限值。',
      "Taiwan's motorcycle emission standards have tightened in phases since Phase 1 in 1988; Phase 6 (2017) is roughly equivalent to Euro 4, and Phase 7 (2021) added a particulate limit for direct-injection engines.",
    ),
    period: t('1988–2021年', '1988–2021'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    locator: '「77 年 1 月 1 日起實施第一期」「93 年 1 月 1 日起實施第四期」「96 年 7 月 1 日起實施第五期」「106 年 1 月 1 日起實施第六期」「110 年 1 月 1 日起實施之第七期」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t('第二、三期的實施日期未見於研究資料。', 'Start dates for Phases 2 and 3 are not in our research notes.'),
    research: '01 §8',
  },
  'two-stroke-remaining': {
    data: {
      y2018: v(1000000, 'vehicles', { bound: 'lt' }),
      y2023: v(330000, 'vehicles', { approx: true, bound: 'lte' }),
      y2024: v(280000, 'vehicles', { approx: true, bound: 'lte' }),
    },
    display: t('約 28 萬輛以下', 'about 280,000 or fewer'),
    statement: t(
      '二行程機車已大幅淘汰：2018年降至100萬輛以下，2024年進一步降至約28萬輛以下。',
      'Two-stroke scooters have largely been retired: below 1 million by 2018 and down to about 280,000 or fewer by 2024.',
    ),
    period: t('2018–2024年', '2018–2024'),
    place: TW,
    sources: ['moenv-air-review-2023', 'moenv-air-review-2024'],
    locator: '「107 年已將機車數降至 100 萬輛以下，112 年進一步降至約 33 萬輛以下」「113 年進一步降至約 28 萬輛以下」',
    confidence: 'verified',
    evidence: 'official-tw',
    research: '01 §6',
  },
  'old-scooters-retired-2020-2023': {
    data: {
      stock2019: v(4.74, 'million-vehicles'),
      retired: v(2.194, 'million-vehicles'),
      retiredShare: v(46, 'percent'),
      target: v(1.9, 'million-vehicles'),
    },
    display: t('219.4 萬輛', '2.194 million'),
    statement: t(
      '2019年全國有474萬輛老舊機車，2020至2023年累計淘汰219.4萬輛（減少46%），達成190萬輛的累積目標。',
      'Of 4.74 million old scooters in 2019, 2.194 million (46%) were retired between 2020 and 2023, meeting the cumulative target of 1.9 million.',
    ),
    period: t('2019–2023年', '2019–2023'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    locator: '「108 年 474 萬輛老舊機車中，109 年至 112 年全國累計已淘汰 219.4 萬輛，減少 46%，並達成 112 年 190 萬輛之累積目標」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '「老舊機車」指2007年6月30日以前出廠的機車；2024年以後的淘汰成果未能查證。',
      '"Old" means built before 30 June 2007. Retirement results after 2023 could not be verified.',
    ),
    research: '01 §6',
  },
  'old-scooters-remaining-2023': {
    data: { remaining: v(2.55, 'million-vehicles', { approx: true, derived: true, note: '4.74M − 2.194M' }) },
    display: t('約 255 萬輛', 'about 2.55 million'),
    statement: t(
      '扣除2020至2023年的淘汰數，2007年中以前出廠的老舊機車約還剩255萬輛。',
      'Subtracting the 2020–2023 retirements leaves roughly 2.55 million scooters built before mid-2007.',
    ),
    period: t('2023年底（推算）', 'End of 2023 (estimate)'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    confidence: 'secondary',
    evidence: 'derived',
    derivedFrom: ['old-scooters-retired-2020-2023'],
    caveat: t(
      '本站以2019年存量減去累計淘汰數推算，非官方數字，也未扣除其他原因的報廢。',
      'Our subtraction of cumulative retirements from the 2019 stock: not an official figure, and it ignores scrapping for other reasons.',
    ),
    research: '01 §6',
  },
  'scrappage-subsidy-scope': {
    data: {},
    display: t('2007年6月30日前出廠', 'built before 30 June 2007'),
    statement: t(
      '環境部自2020年起，將汰舊補助對象從二行程機車擴大到2007年6月30日以前出廠的老舊機車。',
      'Since 2020 the environment ministry has extended its scrappage subsidy from two-stroke scooters to all scooters built before 30 June 2007.',
    ),
    period: t('2020年起', 'From 2020'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    locator: '「環境部自 109 年擴大汰舊補助對象至 96 年 6 月 30 日前出廠之老舊機車」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t('目前（2024年以後）的補助狀況未能查證。', 'The current (post-2023) subsidy status could not be verified.'),
    research: '01 §6',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// emissions: the TEDS 13.0 inventory, apportionment, emission-factor studies
// ---------------------------------------------------------------------------

const emissions = {
  'teds13-edition': {
    data: { baseYear: v(2023, 'year') },
    display: t('TEDS 13.0', 'TEDS 13.0'),
    statement: t(
      '臺灣最新版空氣污染物排放清冊為TEDS 13.0，以2023年為基準年，於2026年1月發布。',
      "Taiwan's latest official air-pollutant emissions inventory is TEDS 13.0, with base year 2023, published in January 2026.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds-page'],
    locator: '「TEDS13.0以民國112年為基準年…為目前台灣空氣污染排放清冊最新版本」「已於115年1月發布」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '不同版本的清冊（如TEDS 11.0、12.0）不能直接比較，本站所有排放占比都只用13.0版。',
      'Different editions (e.g. TEDS 11.0, 12.0) are not directly comparable; every emissions share on this site uses TEDS 13.0 only.',
    ),
    research: '01 §4',
  },
  'teds13-national-totals': {
    data: {
      pm25: v(33731, 'tonnes-per-year', { approx: true }),
      sox: v(40730, 'tonnes-per-year', { approx: true }),
      nox: v(202776, 'tonnes-per-year', { approx: true }),
      voc: v(355083, 'tonnes-per-year', { approx: true }),
    },
    display: t('PM2.5 約 33,731 公噸', 'about 33,731 t of PM2.5'),
    statement: t(
      '依TEDS 13.0，2023年全國原生細懸浮微粒（PM2.5）排放約33,731公噸，揮發性有機物約355,083公噸（不含生物源）。',
      'Per TEDS 13.0, Taiwan emitted about 33,731 tonnes of primary PM2.5 and about 355,083 tonnes of volatile organic compounds (excluding biogenic sources) in 2023.',
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds-page'],
    locator: '「112年全國細懸浮微粒總排放約為33,731公噸、硫氧化物約為40,730公噸、氮氧化物約為202,776公噸、揮發性有機物約為355,083公噸（不含生物源排放）」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_SCOPE,
    research: '01 §4',
  },
  'teds13-mc-pm25-share': {
    data: {
      combined: v(1.31, 'percent', { derived: true }),
      fourStroke: v(1.02, 'percent'),
      twoStroke: v(0.29, 'percent'),
      combinedTonnes: v(441.7, 'tonnes-per-year', { derived: true }),
    },
    display: t('1.31%', '1.31%'),
    statement: t(
      '燃油機車（二行程加四行程）排放的PM2.5只占全國原生PM2.5排放的1.31%（每年441.7公噸）。',
      "Gasoline scooters (two-stroke and four-stroke together) account for only 1.31% of Taiwan's primary PM2.5 emissions (441.7 tonnes a year).",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國: 二行程機車 PM2.5 98.1 t (0.29%); 四行程機車 343.6 t (1.02%); 總排放量 33,731.0',
    confidence: 'verified',
    evidence: 'derived',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    research: '01 §4',
  },
  'teds13-mc-nmhc-share': {
    data: {
      combined: v(9.99, 'percent', { derived: true }),
      fourStroke: v(9.44, 'percent'),
      twoStroke: v(0.56, 'percent'),
      combinedTonnes: v(35486.1, 'tonnes-per-year', { derived: true }),
    },
    display: t('約一成（9.99%）', 'about 10% (9.99%)'),
    statement: t(
      '燃油機車排放的非甲烷碳氫化合物（NMHC）約占全國排放量的一成（9.99%，每年35,486.1公噸）。',
      "Gasoline scooters emit about one-tenth of Taiwan's non-methane hydrocarbons (9.99%, 35,486.1 tonnes a year).",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國: NMHC 二行程 1,972.9 t (0.56%); 四行程 33,513.2 t (9.44%); 總排放量 355,082.6',
    confidence: 'verified',
    evidence: 'derived',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    research: '01 §4',
  },
  'teds13-mc-co-share': {
    data: {
      combined: v(15.59, 'percent', { derived: true }),
      fourStroke: v(15.05, 'percent'),
      twoStroke: v(0.54, 'percent'),
      combinedTonnes: v(74540.1, 'tonnes-per-year', { derived: true, note: 'Research file value; the rounded cells sum to 74,540.0' }),
    },
    display: t('15.59%', '15.59%'),
    statement: t(
      '燃油機車排放的一氧化碳占全國排放量的15.59%（每年74,540.1公噸），超過七分之一。',
      "Gasoline scooters emit 15.59% of Taiwan's carbon monoxide (74,540.1 tonnes a year), more than one-seventh.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國: CO 二行程 2,604.1 t (0.54%); 四行程 71,935.9 t (15.05%); 總排放量 478,024.4',
    confidence: 'verified',
    evidence: 'derived',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    research: '01 §4',
  },
  'teds13-mc-thc-share': {
    data: {
      combined: v(8.6, 'percent', { derived: true }),
      fourStroke: v(8.11, 'percent'),
      twoStroke: v(0.49, 'percent'),
      combinedTonnes: v(37280.8, 'tonnes-per-year', { derived: true }),
    },
    display: t('8.60%', '8.60%'),
    statement: t(
      '燃油機車排放的總碳氫化合物（THC）占全國排放量的8.60%（每年37,280.8公噸）。',
      "Gasoline scooters emit 8.60% of Taiwan's total hydrocarbons (37,280.8 tonnes a year).",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國: THC 二行程 2,133.2 t (0.49%); 四行程 35,147.6 t (8.11%); 總排放量 433,280.2',
    confidence: 'verified',
    evidence: 'derived',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    research: '01 §4',
  },
  'teds13-mc-nox-share': {
    data: {
      combined: v(2.19, 'percent', { derived: true }),
      fourStroke: v(2.17, 'percent'),
      twoStroke: v(0.02, 'percent'),
      combinedTonnes: v(4448.1, 'tonnes-per-year', { derived: true }),
    },
    display: t('2.19%', '2.19%'),
    statement: t(
      '燃油機車排放的氮氧化物占全國排放量的2.19%（每年4,448.1公噸）。',
      "Gasoline scooters emit 2.19% of Taiwan's nitrogen oxides (4,448.1 tonnes a year).",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國: NOx 二行程 41.6 t (0.02%); 四行程 4,406.5 t (2.17%); 總排放量 202,776.2',
    confidence: 'verified',
    evidence: 'derived',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    research: '01 §4',
  },
  'teds13-mc-pm10-share': {
    data: {
      combined: v(0.54, 'percent', { derived: true }),
      fourStroke: v(0.45, 'percent'),
      twoStroke: v(0.09, 'percent'),
      combinedTonnes: v(591.6, 'tonnes-per-year', { derived: true }),
    },
    display: t('0.54%', '0.54%'),
    statement: t(
      '燃油機車排放的PM10只占全國排放量的0.54%（每年591.6公噸）。',
      "Gasoline scooters emit only 0.54% of Taiwan's PM10 (591.6 tonnes a year).",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國: PM10 二行程 100.0 t (0.09%); 四行程 491.6 t (0.45%); 總排放量 108,956.1',
    confidence: 'verified',
    evidence: 'derived',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    research: '01 §4',
  },
  'teds13-mc-gas-vs-particle-contrast': {
    data: {
      coShare: v(15.59, 'percent'),
      nmhcShare: v(9.99, 'percent'),
      pm25Share: v(1.31, 'percent'),
      coToPm25: v(11.9, 'ratio', { derived: true, note: '15.59 / 1.31' }),
      nmhcToPm25: v(7.6, 'ratio', { derived: true, note: '9.99 / 1.31' }),
    },
    display: t('約 12 倍', 'about 12 times'),
    statement: t(
      '以占全國排放的比例來看，燃油機車的一氧化碳占比（15.59%）約是其PM2.5占比（1.31%）的12倍，碳氫化合物占比（9.99%）約是7.6倍：機車的問題主要在聞得到的廢氣，而不是粉塵。',
      "As a share of national emissions, gasoline scooters' share of carbon monoxide (15.59%) is about 12 times their share of PM2.5 (1.31%), and their hydrocarbon share (9.99%) about 7.6 times: the scooter problem is mainly the fumes you can smell, not dust.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['teds13-mc-co-share', 'teds13-mc-nmhc-share', 'teds13-mc-pm25-share'],
    caveat: t(
      '這是比較不同污染物各自占全國排放的比例，不是比較毒性或重量。' + TEDS_SCOPE['zh-TW'],
      'This compares each pollutant\'s share of its own national total; it is not a comparison of toxicity or tonnage. ' + TEDS_SCOPE.en,
    ),
    requiresCaveat: true,
    research: '01 §4',
  },
  'teds13-four-stroke-dominates': {
    data: {
      coFourStroke: v(15.05, 'percent'),
      coTwoStroke: v(0.54, 'percent'),
      nmhcFourStroke: v(9.44, 'percent'),
      nmhcTwoStroke: v(0.56, 'percent'),
    },
    display: t('四行程 15.05%', 'four-stroke 15.05%'),
    statement: t(
      '機車排放幾乎全部來自四行程機車：四行程機車占全國一氧化碳排放的15.05%，二行程只占0.54%。',
      "Almost all scooter emissions now come from four-stroke engines: four-stroke scooters emit 15.05% of Taiwan's carbon monoxide, two-strokes only 0.54%.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_SCOPE,
    research: '01 §4',
  },
  'teds13-electric-mc-pm25': {
    data: { pm25: v(6.5, 'tonnes-per-year'), pm25Share: v(0.02, 'percent'), pm10: v(13.2, 'tonnes-per-year') },
    display: t('6.5 公噸', '6.5 tonnes'),
    statement: t(
      '電動機車沒有排氣管廢氣，但仍有輪胎、煞車與道路揚塵等非排氣微粒；TEDS 13.0估計其PM2.5排放為每年6.5公噸（0.02%）。',
      'Electric scooters have no tailpipe exhaust but still produce non-exhaust particles from tyres, brakes and road dust; TEDS 13.0 puts their PM2.5 at 6.5 tonnes a year (0.02%).',
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國: 電動機車 PM2.5 6.5 (0.02%), PM10 13.2, NOx/NMHC/THC/CO 0',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_SCOPE,
    research: '01 §4',
  },
  'teds13-road-vehicles-share': {
    data: {
      pm25: v(13.4, 'percent'),
      pm25Tonnes: v(4522.9, 'tonnes-per-year'),
      nox: v(41.1, 'percent'),
      nmhc: v(24.5, 'percent'),
      co: v(49.1, 'percent'),
    },
    display: t('一氧化碳 49.1%', '49.1% of CO'),
    statement: t(
      '所有道路車輛合計排放全國49.1%的一氧化碳、41.1%的氮氧化物、24.5%的非甲烷碳氫化合物與13.4%的原生PM2.5。',
      "All road vehicles together emit 49.1% of Taiwan's carbon monoxide, 41.1% of its nitrogen oxides, 24.5% of its non-methane hydrocarbons and 13.4% of its primary PM2.5.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    locator: 'Sheet 全國, row 車輛: PM2.5 4,522.9 (13.4%), NOx 83,276.4 (41.1%), NMHC 87,074.7 (24.5%), CO 234,786.6 (49.1%)',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_SCOPE,
    research: '01 §4',
  },
  'teds13-road-vs-power': {
    data: {
      roadPm25: v(4522.9, 'tonnes-per-year'),
      powerPm25: v(874.6, 'tonnes-per-year', { note: 'combustion 791.0 + unclassified 83.6' }),
      roadNox: v(83276.4, 'tonnes-per-year'),
      powerNox: v(33278.0, 'tonnes-per-year'),
    },
    display: t('4,522.9 對 874.6 公噸', '4,522.9 t vs 874.6 t'),
    statement: t(
      '依TEDS 13.0，道路車輛的原生PM2.5排放（4,522.9公噸）與氮氧化物排放（83,276.4公噸）都遠多於電力業（874.6與33,278.0公噸）。',
      'Per TEDS 13.0, road vehicles emit far more primary PM2.5 (4,522.9 tonnes) and nitrogen oxides (83,276.4 tonnes) than the power sector (874.6 and 33,278.0 tonnes).',
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook', 'moenv-news-2025-power-sector'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '電力業PM2.5為燃燒排放791.0公噸加未分類83.6公噸。這是排放量比較，不是對空氣中濃度的貢獻比較，環境部明確反對把兩者混為一談。',
      'Power-sector PM2.5 is combustion (791.0 t) plus unclassified (83.6 t). This compares emissions, not contributions to air concentrations, and MOENV explicitly rejects conflating the two.',
    ),
    requiresCaveat: true,
    research: '01 §4, §5',
  },
  'teds13-dust-share': {
    data: { share: v(50.4, 'percent') },
    display: t('50.4%', '50.4%'),
    statement: t(
      '營建與道路揚塵占全國原生PM2.5排放的50.4%，超過一半。',
      "Construction and road dust make up 50.4% of Taiwan's primary PM2.5 emissions, more than half.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_SCOPE,
    research: '01 §4',
  },
  'ambient-pm25-origin-2020-plan': {
    data: {
      transboundary: v(35.1, 'percent', { low: 29.0, high: 41.0 }),
      domestic: v(64.9, 'percent', { low: 59.0, high: 71.0 }),
    },
    display: t('境外約 35.1%', 'about 35.1% from abroad'),
    statement: t(
      '環境部的模式推估顯示，臺灣空氣中的PM2.5平均約35.1%來自境外、約64.9%來自國內（各空品區不同）。',
      'MOENV modelling estimated that on average about 35.1% of the PM2.5 in Taiwan\'s air came from abroad and about 64.9% from domestic sources (varying by air basin).',
    ),
    period: t('2020年方案，使用TEDS 9.0（2013年基準）', '2020 plan, using TEDS 9.0 (2013 base)'),
    place: TW,
    sources: ['moenv-air-plan-2020'],
    locator: 'p.15: 「境外污染源平均約35.1%（各空品區29.0%~41.0%）、境內約64.9%（各空品區59.0%~71.0%）」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是使用舊版清冊（TEDS 9.0）的模式結果，年代較久；我們找不到2020年後的全國模式推估。',
      'A model result using an old inventory (TEDS 9.0); we found no national apportionment published after 2020.',
    ),
    research: '01 §5',
  },
  'ambient-pm25-domestic-sources-2020-plan': {
    data: {
      industry: v(27.5, 'percent', { low: 18.7, high: 35.4 }),
      mobile: v(27.5, 'percent', { low: 8.8, high: 31.3 }),
      fugitive: v(45.0, 'percent', { low: 38.6, high: 72.5 }),
    },
    display: t('移動源 27.5%', 'mobile sources 27.5%'),
    statement: t(
      '在國內來源造成的PM2.5中，模式推估工業源約占27.5%、移動源約占27.5%、逸散源約占45.0%。',
      'Of the PM2.5 attributed to domestic sources, the model put industry at about 27.5%, mobile sources (vehicles) at about 27.5% and fugitive sources (such as dust) at about 45.0%.',
    ),
    period: t('2020年方案，使用TEDS 9.0（2013年基準）', '2020 plan, using TEDS 9.0 (2013 base)'),
    place: TW,
    sources: ['moenv-air-plan-2020'],
    locator: '「工業源影響比率平均約占27.5%」「移動源影響比率平均約占27.5%（各空品區8.8%~31.3%）」「逸散源影響比率平均約占45.0%」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '比例的分母是「國內來源」而非全部PM2.5；且為舊版清冊的模式結果。',
      'The denominator is domestic sources only, not all PM2.5; and it is a model result from an old inventory.',
    ),
    requiresCaveat: true,
    research: '01 §5',
  },
  'ambient-pm25-power-share': {
    data: { share: v(2.3, 'percent', { approx: true }), nationalMean: v(13, 'ug/m3', { approx: true }) },
    display: t('約 2.3%', 'about 2.3%'),
    statement: t(
      '環境部表示，臺灣空氣中PM2.5年平均值（約每立方公尺13微克）約有2.3%來自電力業。',
      'MOENV states that about 2.3% of Taiwan\'s annual mean PM2.5 (about 13 µg/m³) comes from the power sector.',
    ),
    period: t('2025年6月環境部說明', 'MOENV statement, June 2025'),
    place: TW,
    sources: ['moenv-news-2025-power-sector'],
    locator: '「我國大氣中PM2.5約2.3%來自於電力業，這是指電力業對我國大氣中PM2.5年平均值約為13微克／立方公尺的貢獻比率」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    research: '01 §5',
  },
  'ambient-pm25-mobile-share-derived': {
    data: { share: v(18, 'percent', { approx: true, derived: true, note: '27.5% × 64.9% = 17.8%' }) },
    display: t('約 18%（推算）', 'about 18% (our estimate)'),
    statement: t(
      '把移動源占國內來源的27.5%乘上國內來源的64.9%，車輛約貢獻臺灣空氣中PM2.5的18%，遠高於電力業的約2.3%。',
      'Multiplying the mobile-source share of domestic PM2.5 (27.5%) by the domestic share (64.9%) suggests vehicles contribute roughly 18% of the PM2.5 in Taiwan\'s air, far more than the power sector\'s roughly 2.3%.',
    ),
    period: t('混合年份（2020年方案與2025年說明）', 'Mixed dates (2020 plan and 2025 statement)'),
    place: TW,
    sources: ['moenv-air-plan-2020', 'moenv-news-2025-power-sector'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['ambient-pm25-origin-2020-plan', 'ambient-pm25-domestic-sources-2020-plan', 'ambient-pm25-power-share'],
    caveat: t(
      '這是本站計算，不是環境部的說法；18%來自舊版清冊（TEDS 9.0）的模式結果，2.3%則是較新的說明，兩者年代與方法不同，只能作為大致比較。',
      'Our calculation, not an MOENV statement. The 18% rests on an older model run (TEDS 9.0) while the 2.3% is a newer statement; dates and methods differ, so treat it only as a rough comparison.',
    ),
    requiresCaveat: true,
    research: '01 §5',
  },
  'ef-vehicle-class-ranking-tsai2023': {
    data: { motorcycleVktShare: v(32.6, 'percent'), gasolineCarVktShare: v(42.6, 'percent') },
    display: t('苯：機車最高', 'benzene: motorcycles highest'),
    statement: t(
      '依臺灣車輛排放係數推估，每行駛一公里，機車的PM2.5與氮氧化物排放都低於汽油車與柴油車，但碳氫化合物高於汽油車，苯的排放更是各車種中最高。',
      'Per kilometre driven, Taiwanese emission-factor estimates put motorcycles below gasoline and diesel vehicles for PM2.5 and nitrogen oxides, but above gasoline cars for hydrocarbons and highest of all vehicle classes for benzene.',
    ),
    period: t('2021年車輛行駛里程', '2021 vehicle-kilometres'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    locator: 'Abstract: PM2.5 diesel > gasoline > motorcycle; NOx diesel > gasoline > motorcycle; HC motorcycle > gasoline; benzene motorcycle > gasoline >= diesel; four-stroke MC 32.6% of VKT (2021)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '排放係數以模式（MOVES）推估，不是路邊實測。' + ABSTRACT_ONLY['zh-TW'] + '四行程機車占2021年道路車輛行駛里程的32.6%。',
      'Emission factors are modelled (MOVES), not roadside measurements. ' + ABSTRACT_ONLY.en + ' Four-stroke motorcycles were 32.6% of road vehicle-kilometres in 2021.',
    ),
    research: '02 §5',
  },
  'ef-older-phase-tsai2018': {
    data: {
      coPhase3VsPhase5: v(156, 'percent'),
      coPhase4VsPhase5: v(48, 'percent'),
      hcPhase3VsPhase5: v(84, 'percent'),
      hcPhase4VsPhase5: v(9, 'percent'),
    },
    display: t('一氧化碳 +156%', 'CO +156%'),
    statement: t(
      '實驗室測試顯示，第三期機車的一氧化碳排放比第五期高156%、碳氫化合物高84%；第四期分別高48%與9%。',
      'In laboratory tests, Phase 3 motorcycles emitted 156% more carbon monoxide and 84% more hydrocarbons than Phase 5 models; Phase 4 models emitted 48% and 9% more.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    locator: 'Abstract: "vs phase V, phases III/IV: CO +156%/+48%, HC +84%/+9%"; phase V CO 84.3 ± 40.9, HC 29.4 ± 13.1 g/L fuel',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '底盤動力計實驗室測試，樣本車輛有限。' + ABSTRACT_ONLY['zh-TW'],
      'Chassis-dynamometer lab tests on a limited number of vehicles. ' + ABSTRACT_ONLY.en,
    ),
    research: '02 §5',
  },
  'ef-mileage-voc-tsai2018': {
    data: {
      vocLowMileage: v(25.2, 'g/L-fuel', { note: 'at 5,231 km' }),
      vocHighMileage: v(47.1, 'g/L-fuel', { note: 'at 47,617 km' }),
      aromaticsLow: v(38, 'percent'),
      aromaticsHigh: v(48, 'percent'),
    },
    display: t('25.2 → 47.1 克／公升', '25.2 → 47.1 g/L'),
    statement: t(
      '同一研究中，機車的揮發性有機物排放係數從里程5,231公里時的每公升燃油25.2克增加到47,617公里時的47.1克；芳香烴占揮發性有機物的38%至48%，苯是主要成分之一。',
      'In the same study, motorcycle VOC emissions rose from 25.2 g per litre of fuel at 5,231 km to 47.1 g at 47,617 km; aromatics made up 38–48% of the VOCs, with benzene among the main species.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: ABSTRACT_ONLY,
    research: '02 §5',
  },
  'ef-pah-mileage-lin2019': {
    data: {
      totalPPah: v(67.6, 'ug/km', { sd: 13.6 }),
      teqHighVsLow: v(4.67, 'ratio', { approx: true }),
      teqHighVsMid: v(1.99, 'ratio', { approx: true }),
    },
    display: t('約 4.67 倍', 'about 4.67 times'),
    statement: t(
      '一項測試10輛使用中機車的研究發現，高里程（30,001至50,000公里）機車排放微粒多環芳香烴的致癌毒性當量約為低里程機車的4.67倍、中里程的1.99倍。',
      'A test of ten in-use motorcycles found that high-mileage machines (30,001–50,000 km) emitted particulate PAHs with a carcinogenic toxic equivalent about 4.67 times that of low-mileage machines and 1.99 times that of mid-mileage ones.',
    ),
    period: t('2019年發表', 'Published 2019'),
    place: TW,
    sources: ['lin-2019-jhm'],
    locator: 'Abstract: total p-PAH EF 67.6 ± 13.6 µg/km; high-mileage TEQ ~4.67× / 1.99× low / mid',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('只測試10輛機車。' + ABSTRACT_ONLY['zh-TW'], 'Only ten motorcycles were tested. ' + ABSTRACT_ONLY.en),
    research: '02 §5',
  },
  'tunnel-motorcycles-co-ting2023': {
    data: {},
    display: t('機車影響一氧化碳', 'motorcycles drive CO'),
    statement: t(
      '臺北市區隧道實測發現，大型柴油車主導PM2.5與黑碳濃度，而小客車與機車主要影響一氧化碳與二氧化碳；研究者認為一氧化碳排放係數偏高可能與機車比例增加有關。',
      'Measurements in a Taipei road tunnel found heavy diesel vehicles dominated PM2.5 and black carbon, while cars and motorcycles drove carbon monoxide and CO₂; the authors suggest the higher-than-previously-reported CO emission factor is likely due to a larger share of motorcycles.',
    ),
    period: t('2023年發表', 'Published 2023'),
    place: TAIPEI,
    sources: ['ting-2023-envres'],
    locator: 'Abstract: "HDVs dominated PM2.5 and eBC concentrations, while LDVs and MCs influenced CO and CO2 levels..."',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('具體排放係數數值未見於摘要。' + ABSTRACT_ONLY['zh-TW'], 'Numeric emission factors are not in the abstract. ' + ABSTRACT_ONLY.en),
    research: '02 §5',
  },
  'downtown-taipei-vehicle-share-tsai2021': {
    data: {
      co: v(90, 'percent', { bound: 'gt' }),
      nox: v(80, 'percent'),
      pm25: v(50, 'percent', { approx: true }),
    },
    display: t('一氧化碳 >90%', 'CO >90%'),
    statement: t(
      '一項空氣品質模式研究估計，臺北市中心超過90%的一氧化碳、80%的氮氧化物與約一半的PM2.5來自車輛排放。',
      'An air-quality modelling study estimated that vehicle emissions account for more than 90% of carbon monoxide, 80% of nitrogen oxides and about half of PM2.5 in downtown Taipei.',
    ),
    period: t('2021年發表', 'Published 2021'),
    place: t('臺北市中心', 'Downtown Taipei'),
    sources: ['tsai-2021-stoten'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '指所有車輛，並非只有機車；為模式（CMAQ）敏感度分析結果。' + ABSTRACT_ONLY['zh-TW'],
      'Refers to all vehicles, not scooters alone, and is a model (CMAQ) sensitivity result. ' + ABSTRACT_ONLY.en,
    ),
    research: '02 §4',
  },
  'traffic-mix-new-taipei-tsai2024': {
    data: { sedansAndScooters: v(90, 'percent', { approx: true }) },
    display: t('約九成', 'about 90%'),
    statement: t(
      '新北市道路攝影分析顯示，小客車與機車合計約占車流的九成；研究指出現行排放清冊可能低估機車與公車對空氣品質的影響。',
      'Camera analysis of New Taipei traffic found sedans and scooters made up about 90% of vehicles; the authors suggest current emission inventories may underestimate the impact of scooters and buses on air quality.',
    ),
    period: t('2021年9月至2023年6月', 'September 2021 – June 2023'),
    place: t('新北市', 'New Taipei City'),
    sources: ['tsai-2024-aeax'],
    locator: 'Abstract: "current emission inventories may underestimate the impact of scooters and buses on air quality while overestimating the trucks\' contribution"',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('相關性分析，清冊可能低估只是研究者的推論。' + ABSTRACT_ONLY['zh-TW'], 'Correlational; the possible underestimate is the authors\' inference. ' + ABSTRACT_ONLY.en),
    research: '02 §4',
  },
  'ev-vs-gasoline-ef-hsieh2018': {
    data: {
      tsp: v(-14.8, 'percent'),
      nox: v(-97.4, 'percent'),
      voc: v(-100, 'percent'),
      co2e: v(-76.8, 'percent'),
      soxRatio: v(2.4, 'ratio', { note: 'electric higher; gap narrowing to +22.2% by 2025' }),
    },
    display: t('揮發性有機物 −100%', 'VOCs −100%'),
    statement: t(
      '一項模式研究估計，2016年電動重型機車每公里的揮發性有機物排放比燃油機車少100%、氮氧化物少97.4%、溫室氣體少76.8%，但硫氧化物約為2.4倍。',
      'A modelling study estimated that in 2016 heavy-duty electric scooters emitted 100% less VOCs, 97.4% less NOx and 76.8% less CO₂-equivalent per kilometre than gasoline scooters, but about 2.4 times the sulfur oxides.',
    ),
    period: t('2016年（推估）', '2016 (modelled)'),
    place: TW,
    sources: ['hsieh-2018-iop'],
    locator: 'Abstract: "the EF of TSP, NOx, VOCs, and CO2e for ESH reduce by, respectively, 14.8%, 97.4%, 100%, and 76.8% per kilometer travelled in 2016"',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '研討會論文的模式推估，電動機車的排放算在發電廠（隨電力結構改變），並非街道上的排放；摘要未提供一氧化碳數字。',
      'A conference-paper model; electric-scooter emissions are counted at power plants (and change with the grid mix), not on the street. Tailpipe CO is not in the abstract.',
    ),
    research: '02 §7',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// exposure: what people breathe on the street
// ---------------------------------------------------------------------------

const exposure = {
  'iot-study-design': {
    data: {
      intersections: v(10, 'count'),
      hoursEach: v(48, 'hours'),
      totalHours: v(480, 'hours'),
      sensorHeightLow: v(1.2, 'metres'),
      sensorHeightHigh: v(1.5, 'metres'),
    },
    display: t('10 處路口', '10 intersections'),
    statement: t(
      '交通部運輸研究所在臺北、新北與高雄的10處路口各連續量測48小時，感測器設在離地1.2至1.5公尺的呼吸高度；各項改善措施的效果則以擴散模式模擬。',
      'The MOTC Institute of Transportation measured air at 10 intersections in Taipei, New Taipei and Kaohsiung for 48 hours each, with sensors at breathing height (1.2–1.5 m); the effects of street measures were then simulated with a dispersion model.',
    ),
    period: t('2023–2024年量測，2025年12月出版', 'Measured 2023–2024, published December 2025'),
    place: t('臺北市、新北市、高雄市', 'Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: IOT_CAVEAT,
    research: '02 §1a',
  },
  'iot-scramble-typical-range': {
    data: { reductionLow: v(-2.58, 'percent'), reductionHigh: v(-21.4, 'percent') },
    display: t('約 3%～21%', 'about 3–21%'),
    statement: t(
      '在運研所的模式中，全天實施行人專用時相，於一般模擬日可使行人等候區的PM2.5濃度降低約3%至21%。',
      "In the Institute of Transportation's model, an all-day exclusive pedestrian phase (scramble crossing) lowered PM2.5 at the pedestrian waiting area by roughly 3% to 21% on typical simulated days.",
    ),
    period: t('2024年量測資料驅動的模擬', 'Simulation driven by 2024 field data'),
    place: t('高雄市左營區高鐵路／重信路口', 'Gaotie Rd / Chongxin Rd intersection, Zuoying, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'p.4-28: 「實施全天時段行人專用時相下…於行人等候區增減幅度為-21.40%至-2.58%」 (excludes the outlier Day 2)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '此範圍排除了離群的第2模擬日。臺北與新北的路口降幅較小（約4%至10%），有的模擬日反而上升，模擬的一氧化碳也常增加。' + IOT_CAVEAT['zh-TW'],
      'This range excludes the outlier Day 2. At the Taipei and New Taipei intersections the reductions were smaller (about 4–10%), some simulated days showed increases, and modelled carbon monoxide often rose. ' + IOT_CAVEAT.en,
    ),
    requiresCaveat: true,
    research: '02 §1a, Corrections #1',
  },
  'iot-scramble-outlier-day': {
    data: { allDay: v(-94.86, 'percent'), peakOnly: v(-94.43, 'percent') },
    display: t('94%（單一模擬日的離群值）', '94% (one outlier simulated day)'),
    statement: t(
      '常被引用的「降低94%」只出現在高雄一處路口的單一模擬日，報告本身指出該日結果明顯高於其他模擬值；同一路口其他模擬日約降低12%至18%。',
      'The widely quoted "94% reduction" comes from a single simulated day at one Kaohsiung intersection, which the report itself flags as clearly higher than its other simulated values; other simulated days at the same intersection showed reductions of about 12% to 18%.',
    ),
    period: t('第2模擬日（2024年資料）', 'Simulation Day 2 (2024 data)'),
    place: t('高雄市左營區高鐵路／重信路口', 'Gaotie Rd / Chongxin Rd intersection, Zuoying, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Table 4.3.2-30: all-day −17.79*, −94.86*, −16.22#, −12.00#; peak-only −7.87, −94.43*, −9.54#, −2.92#. Text: 「第 2 天模擬結果最具有差異性，明顯高於其他模擬值」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是模式模擬值，不是實測；是行人等候區有無專用時相的情境比較，不是機車專屬的結果。該日的無專用時相基準值異常偏高，報告未說明原因。同一路口第3、4天的模擬未通過模式效能檢核。不可寫成「行人專用時相可減少94%暴露」。',
      'A modelled value, not a measurement; it compares scenarios with and without an exclusive phase at the waiting area and is not scooter-specific. The no-phase baseline that day was anomalously high, and the report does not explain why. Days 3 and 4 at the same site failed the model-performance check. Never write "scramble crossings cut exposure by 94%".',
    ),
    requiresCaveat: true,
    research: '02 §1a, Corrections #1',
  },
  'iot-scramble-co-rise': {
    data: { coChangeLow: v(7.45, 'percent'), coChangeHigh: v(39.62, 'percent') },
    display: t('一氧化碳 +7%～+40%', 'CO +7% to +40%'),
    statement: t(
      '在臺北與新北的路口，模式顯示全天實施行人專用時相後，模擬的一氧化碳濃度反而上升約7%至40%。',
      'At the Taipei and New Taipei intersections, the model showed simulated carbon monoxide rising by about 7% to 40% under an all-day exclusive pedestrian phase.',
    ),
    period: t('2024年量測資料驅動的模擬', 'Simulation driven by 2024 field data'),
    place: t('臺北市、新北市路口（一般路口、單一背景源）', 'Taipei and New Taipei intersections (general, single background source)'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Table 4.3.2-29 CO change, all-day scramble: +18.33*, +7.54*, +7.45, +39.62',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: IOT_CAVEAT,
    research: '02 §1a',
  },
  'iot-sidewalk-widening': {
    data: { bestCase: v(-1.88, 'percent'), worstCase: v(5.34, 'percent') },
    display: t('−1.88%～+5.34%', '−1.88% to +5.34%'),
    statement: t(
      '在模式中將人行道拓寬0.5公尺，PM2.5的變化從降低1.88%到增加5.34%不等，方向並不一致；媒體報導的「約2%」是最佳情況。',
      'In the model, widening the sidewalk by 0.5 m changed PM2.5 by anything from a 1.88% decrease to a 5.34% increase, with no consistent direction; the "about 2%" in press reports is the best case.',
    ),
    period: t('2024年量測資料驅動的模擬', 'Simulation driven by 2024 field data'),
    place: t('臺北市、新北市、高雄市路口', 'Intersections in Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Tables 4.3.2-29..32, sidewalk +0.5 m. Report conclusion (p.6-2) still calls it the 較佳 measure across background types.',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '報告結論仍認為拓寬0.5公尺是各類路口中較佳的措施。' + IOT_CAVEAT['zh-TW'],
      'The report\'s conclusion still rates 0.5 m widening as the better measure across intersection types. ' + IOT_CAVEAT.en,
    ),
    research: '02 §1a',
  },
  'iot-setback-measured': {
    data: { reductionA: v(0.46, 'ug/m3'), reductionB: v(0.94, 'ug/m3', { note: '重慶北路/酒泉街' }) },
    display: t('降低 0.46 與 0.94 µg/m³', '0.46 and 0.94 µg/m³ lower'),
    statement: t(
      '第一年實測顯示，把行人等候區移離機車待轉區後，尖峰時段等候區的平均PM2.5降低0.46與0.94 µg/m³，絕對降幅很小。',
      'In first-year field measurements, moving the pedestrian waiting area away from the scooter waiting box lowered average PM2.5 there during peak hours by 0.46 and 0.94 µg/m³: small absolute changes.',
    ),
    period: t('第一年（2023年）尖峰時段實測', 'Year-one (2023) peak-hour measurements'),
    place: t('量測路口（例如重慶北路／酒泉街路口）', 'Measured intersections (e.g. Chongqing N. Rd / Jiuquan St)'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'p.1-6 / 附1-4: reductions 0.46 and 0.94 µg/m³ (重慶北路/酒泉街 0.94)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '報告也指出，另一處實施行人退縮的路口在退縮後PM2.5「略微上升」，且實測資料在時相切換前後相當不穩定。',
      'The report also notes that at another pedestrian-setback site PM2.5 was "slightly higher" after the setback, and that field data were quite unstable around phase changes.',
    ),
    requiresCaveat: true,
    research: '02 §1a',
  },
  'iot-summer-background-2024': {
    data: {
      intersectionLow: v(4, 'ug/m3'),
      intersectionHigh: v(14, 'ug/m3'),
      stationLow: v(2, 'ug/m3'),
      stationHigh: v(20, 'ug/m3'),
    },
    display: t('4～14 µg/m³', '4–14 µg/m³'),
    statement: t(
      '2024年7月的實測中，路口感測器量到的PM2.5多在4至14 µg/m³之間，與附近環境部測站每小時的2至20 µg/m³相差不大。',
      'In July 2024 field measurements, PM2.5 at the intersections was mostly 4–14 µg/m³, not dramatically above hourly readings of 2–20 µg/m³ at nearby MOENV stations.',
    ),
    period: t('2024年7月', 'July 2024'),
    place: t('高雄市高鐵路／重信路口等量測路口', 'Measured intersections incl. Gaotie Rd / Chongxin Rd, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Fixed-sensor PM2.5 mostly 4–14 µg/m³ at 高鐵路/重信路; MOENV stations 2–20 (板橋 2–13, 左營 4–18, 愛國國小 1–20)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '夏季濃度本來就低；感測器只量PM2.5與一氧化碳，沒有量測碳氫化合物或苯。',
      'Summer concentrations are low to begin with; the sensors measured only PM2.5 and CO, not hydrocarbons or benzene.',
    ),
    research: '02 §1a',
  },
  'iot-exhaust-height-assumption': {
    data: { exhaustHeight: v(0.5, 'metres'), sensorHeightLow: v(1.2, 'metres'), sensorHeightHigh: v(1.5, 'metres') },
    display: t('0.5 公尺（模式假設）', '0.5 m (model assumption)'),
    statement: t(
      '運研所的模式把汽機車排氣管的離地高度設為0.5公尺，這是模式假設而非實測。',
      "The Institute of Transportation's model places car and scooter exhaust at 0.5 m above the ground; this is a model assumption, not a measurement.",
    ),
    period: t('2025年報告', '2025 report'),
    place: TW,
    sources: ['iot-2025-intersection-air-quality'],
    locator: '「高度參考汽車、機車排氣管的離地高度設定為 0.5m」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    research: '02 §1a, §6',
  },
  'commute-walking-wang2021': {
    data: {
      walking: v(40, 'ug/m3', { low: 10, high: 275, note: 'median (range)' }),
      bus: v(35, 'ug/m3', { low: 13, high: 65 }),
      car: v(15, 'ug/m3', { low: 8, high: 80 }),
    },
    display: t('步行 40 µg/m³', 'walking 40 µg/m³'),
    statement: t(
      '一項大臺北通勤實測發現，沿街步行時的PM2.5暴露（中位數40 µg/m³）高於搭公車（35 µg/m³）與搭汽車（15 µg/m³）。',
      'A Taipei-area commuting study found median PM2.5 exposure was higher when walking along streets (40 µg/m³) than riding buses (35 µg/m³) or cars (15 µg/m³).',
    ),
    period: t('2021年發表', 'Published 2021'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Abstract: "walking along the streets (40 (10-275) ug/m3) compared to riding the buses (35 (13-65) ug/m3) and the cars (15 (8-80) ug/m3)"',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '志願者人數不多，使用攜帶式低價感測器；步行的數值也包含烹飪、焚香等非交通來源。' + ABSTRACT_ONLY['zh-TW'],
      'A small volunteer sample using portable low-cost monitors; the walking value also includes non-traffic sources such as cooking and incense. ' + ABSTRACT_ONLY.en,
    ),
    research: '02 §3a',
  },
  'commute-motorcycle-wang2021': {
    data: { motorcycle: v(75, 'ug/m3', { low: 60, high: 105, note: 'median (range); p<0.0001 vs walking' }) },
    display: t('騎機車 75 µg/m³', 'riding 75 µg/m³'),
    statement: t(
      '同一研究中，騎機車時的PM2.5暴露中位數為75 µg/m³，明顯高於步行。',
      'In the same study, median PM2.5 exposure while riding a motorcycle was 75 µg/m³, significantly higher than walking.',
    ),
    period: t('2021年發表', 'Published 2021'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Abstract: "Riding motorcycle also was associated with high PM2.5 exposure (75 (60-105 ug/m3), p < 0.0001 vs. walking)"',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是騎士本身的暴露，不是行人；機車的數值範圍窄，樣本可能很少。不可與另一研究的53.6合併成「50至75」。',
      'This is riders\' own exposure, not pedestrians\'; the narrow range suggests a small sample. Do not merge it with another study\'s 53.6 into "50–75".',
    ),
    research: '02 §3a',
  },
  'commute-mrt-underground-wang2021': {
    data: {
      undergroundStation: v(80, 'ug/m3', { low: 30, high: 210 }),
      undergroundCar: v(80, 'ug/m3', { low: 55, high: 185 }),
      elevatedStation: v(33, 'ug/m3', { low: 15, high: 35 }),
      elevatedCar: v(28, 'ug/m3', { low: 13, high: 68 }),
    },
    display: t('地下捷運 80 µg/m³', 'underground MRT 80 µg/m³'),
    statement: t(
      '同一研究中，地下段捷運車站與車廂的PM2.5中位數也達80 µg/m³，高架段則為28至33 µg/m³：高暴露不只出現在街道上。',
      'In the same study, underground MRT stations and carriages also had median PM2.5 of 80 µg/m³, against 28–33 µg/m³ on elevated sections: high exposure is not confined to the street.',
    ),
    period: t('2021年發表', 'Published 2021'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('地下捷運的微粒來源與街道交通不同。' + ABSTRACT_ONLY['zh-TW'], 'Underground MRT particles come from different sources than street traffic. ' + ABSTRACT_ONLY.en),
    research: '02 §3a',
  },
  'commute-scooter-vs-subway-chuang2020': {
    data: {
      scooter: v(53.6, 'ug/m3', { sd: 26.1, note: 'mean ± SD' }),
      subway: v(21.7, 'ug/m3', { sd: 5.8 }),
    },
    display: t('53.6 對 21.7 µg/m³', '53.6 vs 21.7 µg/m³'),
    statement: t(
      '在一項120位臺北健康成人的研究中，騎機車通勤者的個人PM2.5暴露平均為53.6 µg/m³，搭捷運者為21.7 µg/m³，分別是六種通勤方式中最高與最低。',
      'In a study of 120 healthy adults in Taipei, scooter commuters had average personal PM2.5 exposure of 53.6 µg/m³ and subway commuters 21.7 µg/m³, the highest and lowest of six commuting modes.',
    ),
    period: t('上午9至10點通勤時段；2020年發表', '09:00–10:00 commute; published 2020'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Abstract: "The PM2.5 level (Mean ± SD) was the highest in the scooter mode (53.6 ± 26.1 μg/m3) but the lowest in the subway mode (21.7 ± 5.8 μg/m3)."',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只量測早上一小時的通勤；騎士的數值包含自己身處車流中的暴露。其他通勤方式的平均值未見於摘要。不可與另一研究的75合併成「50至75」。',
      'Only one morning commute hour was measured, and riders\' values include their own immersion in traffic. Other modes\' means are not in the abstract. Do not merge with another study\'s 75 into "50–75".',
    ),
    research: '02 §3b; 03 §4',
  },
  'rider-exposure-wu2021': {
    data: {
      motorcyclistPm25: v(27.65, 'ug/m3'),
      cyclistPm25: v(23.27, 'ug/m3'),
      motorcyclistBtex: v(33.96, 'ppb'),
      cyclistBtex: v(20.07, 'ppb'),
    },
    display: t('BTEX 33.96 對 20.07 ppb', 'BTEX 33.96 vs 20.07 ppb'),
    statement: t(
      '在臺北四條路線的實測中，機車騎士的苯系物（BTEX）平均暴露為33.96 ppb、PM2.5為27.65 µg/m³，自行車騎士則為20.07 ppb與23.27 µg/m³。',
      'Along four Taipei routes, motorcyclists\' average exposure was 33.96 ppb of BTEX (benzene, toluene, ethylbenzene, xylenes) and 27.65 µg/m³ of PM2.5, against 20.07 ppb and 23.27 µg/m³ for cyclists.',
    ),
    period: t('尖峰與離峰時段；2021年發表', 'Rush and non-rush hours; published 2021'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Abstract: total BTEX / PM2.5 = 20.07 ppb / 23.27 µg/m3 (cyclists); 33.96 ppb / 27.65 µg/m3 (motorcyclists)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是騎士在車流中的路線平均暴露，不是行人暴露。兩組的PM2.5只差約4.4 µg/m³，差異主要在苯系物。' + ABSTRACT_ONLY['zh-TW'],
      'These are riders\' route-average exposures in traffic, not pedestrian exposures. PM2.5 differed by only about 4.4 µg/m³; the larger gap is in BTEX. ' + ABSTRACT_ONLY.en,
    ),
    research: '02 §2',
  },
  'rider-scooter-contribution-wu2021': {
    data: {},
    display: t('機車貢獻較大', 'scooters contribute more'),
    statement: t(
      '同一研究認為，機車對騎乘者PM2.5暴露的貢獻可能大於公車、貨車與小客車，並建議減少燃油機車數量、鼓勵改騎自行車。',
      'The same study concluded that scooters could contribute more to commuters\' PM2.5 exposure than buses, trucks and passenger cars, and recommended reducing gasoline scooter numbers and encouraging a shift to bicycles.',
    ),
    period: t('2021年發表', 'Published 2021'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Abstract: "Scooters could contribute more to PM2.5 exposure than buses/trucks and passenger cars." / "...shift from gasoline scooters to bicycles..."',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '原文是「可能大於」公車、貨車與小客車，不是「最主要來源」。論文標題中的「electric scooter」是臺灣英文對機車的稱呼，結論針對燃油機車。',
      'The paper says scooters "could contribute more" than buses, trucks and cars, not that they are the main source. "Electric scooter" in the paper\'s title is Taiwanese English for a scooter; the conclusion is about gasoline scooters.',
    ),
    research: '02 §2',
  },
  'taipei-traffic-station-gap': {
    data: {
      traffic2017: v(18.2, 'ug/m3'),
      general2017: v(14.6, 'ug/m3'),
      traffic2024: v(11.2, 'ug/m3'),
      general2024: v(11.1, 'ug/m3'),
      gap2017: v(3.6, 'ug/m3', { derived: true }),
      gap2024: v(0.1, 'ug/m3', { derived: true }),
    },
    display: t('差距 3.6 → 0.1 µg/m³', 'gap 3.6 → 0.1 µg/m³'),
    statement: t(
      '臺北市交通測站的PM2.5年平均值歷年都高於一般測站，但差距已從2017年的3.6 µg/m³縮小到2024年的0.1 µg/m³。',
      "Taipei City's roadside (traffic) monitoring stations have recorded higher annual PM2.5 than its general stations every year, but the gap narrowed from 3.6 µg/m³ in 2017 to 0.1 µg/m³ in 2024.",
    ),
    period: t('2017–2024年', '2017–2024'),
    place: TAIPEI,
    sources: ['taipei-epd-air-report-2024'],
    locator: 'Table 3-2-7 (automatic PM2.5): 2017 14.6/18.2 … 2024 11.1/11.2; text 「歷年交通測站…濃度皆高於一般測站」',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '一般測站9站、交通測站3站，數據未扣除境外傳輸或特殊天氣影響。年報內文的2024年數字（13.2／16.5）誤植為2021年數值，本站採用表3-2-7。',
      'Nine general and three traffic stations; data not adjusted for transboundary pollution or unusual weather. The report\'s own text gives 13.2/16.5 for 2024, which repeats the 2021 values; we use its Table 3-2-7.',
    ),
    research: '02 §4, Corrections #8',
  },
  'ufp-near-road-bands-chang2026': {
    data: { saufpMax: v(40, 'um2/cm3', { approx: true }) },
    display: t('道路旁狹窄高濃度帶', 'narrow near-road bands'),
    statement: t(
      '新北市一項計算流體力學模擬顯示，地面道路旁會形成狹窄的超細微粒高濃度帶。',
      'A computational fluid-dynamics simulation in New Taipei found that ground-level roads create narrow near-road bands of high ultrafine-particle concentration.',
    ),
    period: t('2026年發表', 'Published 2026'),
    place: t('新北市（1.2 × 1.2 公里模擬範圍）', 'New Taipei City (1.2 × 1.2 km model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Abstract: "Ground-level urban roads create narrow near-road bands with SAUFP maxima of about 40 μm2/cm3"',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '純模式研究，未單獨模擬機車來源。研究另估算的終身致癌風險是模式指標，本站不引用其數值。' + ABSTRACT_ONLY['zh-TW'],
      'A pure modelling study with no scooter-specific source. It also estimates lifetime cancer risk, a modelled index whose numbers we do not quote. ' + ABSTRACT_ONLY.en,
    ),
    research: '02 §4',
  },
  'national-pm25-trend': {
    data: { y2019: v(16.2, 'ug/m3'), y2025: v(12.8, 'ug/m3'), improvement: v(21, 'percent') },
    display: t('16.2 → 12.8 µg/m³', '16.2 → 12.8 µg/m³'),
    statement: t(
      '據媒體報導，全國PM2.5年平均濃度從2019年的16.2 µg/m³降到2025年的12.8 µg/m³，改善約21%。',
      'According to a news report, Taiwan\'s national annual mean PM2.5 fell from 16.2 µg/m³ in 2019 to 12.8 µg/m³ in 2025, an improvement of about 21%.',
    ),
    period: t('2019–2025年', '2019–2025'),
    place: TW,
    sources: ['udn-national-pm25-trend'],
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '只見於聯合新聞網報導的搜尋摘要，未經環境部資料查核；另一則摘要給的2025年數字是12.6（統計至12月3日）。',
      'Seen only in a search summary of a United Daily News report and not checked against MOENV data; another summary gave 12.6 for 2025 (data to 3 December).',
    ),
    requiresCaveat: true,
    research: '02 §8',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// standards: WHO guidelines vs Taiwan's legal standards
// ---------------------------------------------------------------------------

const standards = {
  'tw-pm25-standard': {
    data: { annual: v(12, 'ug/m3'), daily: v(30, 'ug/m3') },
    display: t('年平均 12、日平均 30 µg/m³', 'annual 12, 24-hour 30 µg/m³'),
    statement: t(
      '臺灣的空氣品質標準規定PM2.5年平均值為12 µg/m³、24小時值為30 µg/m³。',
      "Taiwan's legal air quality standard for PM2.5 is 12 µg/m³ as an annual average and 30 µg/m³ over 24 hours.",
    ),
    period: t('2024年9月30日修正發布', 'As amended 30 September 2024'),
    place: TW,
    sources: ['moenv-air-quality-standards'],
    confidence: 'verified',
    evidence: 'official-tw',
    research: '02 §8',
  },
  'tw-air-quality-standards-other': {
    data: {
      pm10Daily: v(75, 'ug/m3'),
      pm10Annual: v(30, 'ug/m3'),
      no2Hourly: v(0.1, 'ppm'),
      no2Annual: v(0.021, 'ppm'),
      so2Hourly: v(0.065, 'ppm'),
      so2Annual: v(0.008, 'ppm'),
      coHourly: v(31, 'ppm'),
      co8h: v(9, 'ppm'),
      o3Hourly: v(0.1, 'ppm'),
      o38h: v(0.06, 'ppm'),
    },
    display: t('一氧化碳 8小時 9 ppm', 'CO 8-hour 9 ppm'),
    statement: t(
      '臺灣的一氧化碳標準為1小時31 ppm、8小時9 ppm；二氧化氮為1小時0.100 ppm、年平均0.021 ppm。',
      "Taiwan's carbon monoxide standard is 31 ppm over 1 hour and 9 ppm over 8 hours; for nitrogen dioxide it is 0.100 ppm hourly and 0.021 ppm annually.",
    ),
    period: t('2024年9月30日修正發布', 'As amended 30 September 2024'),
    place: TW,
    sources: ['moenv-air-quality-standards'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '臺灣標準的氣體以ppm表示，WHO以µg/m³或mg/m³表示，單位不同，不能直接比大小。',
      'Taiwan states gas standards in ppm while WHO uses µg/m³ or mg/m³; the units differ, so the numbers cannot be compared directly.',
    ),
    research: '02 §8',
  },
  'who-pm25-guideline': {
    data: { annual: v(5, 'ug/m3'), daily: v(15, 'ug/m3') },
    display: t('年平均 5、24小時 15 µg/m³', 'annual 5, 24-hour 15 µg/m³'),
    statement: t(
      '世界衛生組織2021年的指引建議PM2.5年平均值不超過5 µg/m³、24小時值不超過15 µg/m³。',
      "The WHO's 2021 guideline for PM2.5 is 5 µg/m³ as a yearly average and 15 µg/m³ as a 24-hour average.",
    ),
    period: t('2021年9月22日發布', 'Published 22 September 2021'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: 'Table 0.1, AQG level column',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      'WHO指引是建議值，不具法律效力；24小時值是第99百分位數（每年可超過3至4天）。',
      'WHO guidelines are recommendations, not legal limits; the 24-hour value is a 99th percentile (3–4 exceedance days a year).',
    ),
    research: '03 §2',
  },
  'who-pm25-interim-targets': {
    data: {
      annualIT1: v(35, 'ug/m3'),
      annualIT2: v(25, 'ug/m3'),
      annualIT3: v(15, 'ug/m3'),
      annualIT4: v(10, 'ug/m3'),
      dailyIT1: v(75, 'ug/m3'),
      dailyIT2: v(50, 'ug/m3'),
      dailyIT3: v(37.5, 'ug/m3'),
      dailyIT4: v(25, 'ug/m3'),
    },
    display: t('過渡目標 35／25／15／10', 'interim targets 35 / 25 / 15 / 10'),
    statement: t(
      'WHO為PM2.5年平均值訂有四階段過渡目標：35、25、15、10 µg/m³，最終指引值為5 µg/m³。',
      'WHO sets four interim targets for annual PM2.5 (35, 25, 15 and 10 µg/m³) on the way to the 5 µg/m³ guideline.',
    ),
    period: t('2021年', '2021'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: 'Table 0.1, interim targets 1–4',
    confidence: 'verified',
    evidence: 'international',
    research: '03 §2',
  },
  'who-no2-co-guideline': {
    data: {
      no2Annual: v(10, 'ug/m3'),
      no2Daily: v(25, 'ug/m3'),
      coDaily: v(4, 'mg/m3'),
      co8h: v(10, 'mg/m3'),
      co1h: v(35, 'mg/m3'),
      co15min: v(100, 'mg/m3'),
    },
    display: t('一氧化碳 24小時 4 mg/m³', 'CO 24-hour 4 mg/m³'),
    statement: t(
      'WHO 2021年指引建議二氧化氮年平均值10 µg/m³、24小時值25 µg/m³，一氧化碳24小時值4 mg/m³。',
      "WHO's 2021 guidelines recommend 10 µg/m³ (annual) and 25 µg/m³ (24-hour) for nitrogen dioxide, and 4 mg/m³ over 24 hours for carbon monoxide.",
    ),
    period: t('2021年', '2021'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: 'Table 0.1 (NO2 10/25 µg/m3, CO 4 mg/m3 24-h); Table 0.2 (CO 8-h 10, 1-h 35, 15-min 100 mg/m3, not re-evaluated)',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '一氧化碳的8小時、1小時與15分鐘值（10、35、100 mg/m³）沿用舊版，2021年未重新評估。',
      'The 8-hour, 1-hour and 15-minute CO values (10, 35 and 100 mg/m³) carry over from earlier guidelines and were not re-evaluated in 2021.',
    ),
    research: '03 §2',
  },
  'who-ufp-good-practice': {
    data: { lowPnc: v(1000, 'particles/cm3', { bound: 'lt' }), highPnc: v(10000, 'particles/cm3', { bound: 'gt' }) },
    display: t('無指引數值', 'no guideline value'),
    statement: t(
      'WHO因證據不足，未替超細微粒與黑碳訂定指引數值，只提出良好作法建議，例如將24小時平均超過每立方公分10,000個微粒視為高濃度。',
      'Because the evidence was insufficient, WHO set no guideline values for ultrafine particles or black carbon, only good-practice statements, such as treating a 24-hour mean above 10,000 particles/cm³ as high.',
    ),
    period: t('2021年', '2021'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: '"Low PNC can be considered < 1 000 particles/cm3 (24-hour mean). High PNC can be considered > 10 000 particles/cm3 (24-hour mean)"',
    confidence: 'verified',
    evidence: 'international',
    research: '03 §1b, §2',
  },
  'who-road-noise-guideline': {
    data: { lden: v(53, 'dB'), lnight: v(45, 'dB') },
    display: t('53 dB（全日）、45 dB（夜間）', '53 dB (day-evening-night), 45 dB (night)'),
    statement: t(
      'WHO歐洲區指引強烈建議把道路交通噪音降到全日53分貝（Lden）與夜間45分貝（Lnight）以下。',
      "WHO Europe's guidelines strongly recommend keeping road traffic noise below 53 dB Lden on average and 45 dB Lnight at night.",
    ),
    period: t('2018年', '2018'),
    place: t('歐洲（WHO歐洲區）', 'Europe (WHO European Region)'),
    sources: ['who-europe-2018-noise'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是以歐洲研究為主的區域指引，針對所有道路交通而非機車；臺灣一項幼兒研究中，道路噪音與氣喘盛行率沒有顯著關聯。',
      'A European guideline built mostly on European studies, covering all road traffic rather than scooters; in one Taiwanese kindergarten study road noise was not significantly associated with asthma prevalence.',
    ),
    research: '03 §9',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// hazard: IARC classifications and what exhaust contains
// ---------------------------------------------------------------------------

const hazard = {
  'iarc-gasoline-exhaust-2b': {
    data: {},
    display: t('2B 級', 'Group 2B'),
    statement: t(
      '國際癌症研究機構（IARC）把汽油引擎廢氣列為「可能對人類致癌」（2B級），自1989年評估以來未變。',
      'The International Agency for Research on Cancer (IARC) classifies gasoline engine exhaust as "possibly carcinogenic to humans" (Group 2B), unchanged since its 1989 evaluation.',
    ),
    period: t('2012年重新評估（專論第105卷）', 'Re-evaluated 2012 (Monographs Vol. 105)'),
    place: NOT_PLACE,
    sources: ['iarc-pr213-2012', 'lancet-onc-2012-exhausts'],
    locator: 'PR 213: "The Working Group concluded that gasoline exhaust was possibly carcinogenic to humans (Group 2B), a finding unchanged from the previous evaluation in 1989."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '2B級比柴油廢氣的1級弱，不可把柴油的分類套用在機車上。IARC分類的是危害，不是日常暴露量下的風險。',
      'Group 2B is weaker than diesel exhaust\'s Group 1; diesel\'s classification must not be applied to scooters. IARC classifies hazard, not the risk at everyday doses.',
    ),
    requiresCaveat: true,
    research: '03 §1a',
  },
  'iarc-diesel-exhaust-group1': {
    data: {},
    display: t('1 級', 'Group 1'),
    statement: t(
      'IARC把柴油引擎廢氣列為「對人類致癌」（1級），依據是暴露與肺癌風險增加有關的充分證據。',
      'IARC classifies diesel engine exhaust as "carcinogenic to humans" (Group 1), based on sufficient evidence that exposure is associated with an increased risk of lung cancer.',
    ),
    period: t('2012年（專論第105卷）', '2012 (Monographs Vol. 105)'),
    place: NOT_PLACE,
    sources: ['iarc-pr213-2012', 'lancet-onc-2012-exhausts'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '僅作對照：臺灣的機車幾乎都是汽油引擎，柴油的分類不適用於機車廢氣。',
      'For contrast only: Taiwan\'s scooters are almost all gasoline-engined, so the diesel classification does not apply to scooter exhaust.',
    ),
    requiresCaveat: true,
    research: '03 §1a',
  },
  'iarc-outdoor-air-pollution-group1': {
    data: {},
    display: t('1 級', 'Group 1'),
    statement: t(
      'IARC把室外空氣污染及其中的懸浮微粒列為「對人類致癌」（1級），因為有充分證據顯示會導致肺癌。',
      'IARC classifies outdoor air pollution, and the particulate matter in it, as "carcinogenic to humans" (Group 1) because there is sufficient evidence that it causes lung cancer.',
    ),
    period: t('2013年（專論第109卷）', '2013 (Monographs Vol. 109)'),
    place: NOT_PLACE,
    sources: ['iarc-pr221-2013', 'lancet-onc-2013-outdoor-air'],
    locator: 'PR 221: "there is sufficient evidence that exposure to outdoor air pollution causes lung cancer (Group 1)"; PM "was also classified as carcinogenic to humans (Group 1)"',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是IARC對一般室外空氣污染的結論；機車廢氣是其中一部分來源，但IARC沒有量化機車的比例。',
      'This is IARC\'s conclusion about outdoor air pollution in general; scooter exhaust is one contributing source, but IARC does not quantify its share.',
    ),
    research: '03 §1a',
  },
  'iarc-benzene-group1': {
    data: {},
    display: t('1 級', 'Group 1'),
    statement: t(
      'IARC把苯列為「對人類致癌」（1級），苯會導致成人急性骨髓性白血病；苯存在於汽油與汽油引擎廢氣中。',
      'IARC classifies benzene, found in gasoline and gasoline exhaust, as "carcinogenic to humans" (Group 1); it causes acute myeloid leukaemia in adults.',
    ),
    period: t('2017年評估，2018年出版（專論第120卷）', 'Evaluated 2017, published 2018 (Monographs Vol. 120)'),
    place: NOT_PLACE,
    sources: ['iarc-vol120-benzene', 'lancet-onc-2017-benzene'],
    locator: 'Vol. 120 §6: "Benzene is carcinogenic to humans (Group 1)." "Benzene causes acute myeloid leukaemia in adults."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      'IARC分類的是危害，不是日常暴露量下的風險；也沒有量化機車廢氣中苯造成的風險。',
      'IARC classifies hazard, not the risk at everyday doses, and does not quantify the risk from benzene in scooter exhaust.',
    ),
    research: '03 §1a; 03 safe claim #2',
  },
  'who-pm25-bloodstream': {
    data: {},
    display: t('可進入血液', 'can enter the bloodstream'),
    statement: t(
      'WHO指出，PM2.5與PM10能深入肺部，PM2.5甚至能進入血液，主要影響心血管與呼吸系統。',
      'WHO states that PM2.5 and PM10 can penetrate deep into the lungs, and PM2.5 can even enter the bloodstream, primarily affecting the heart and lungs.',
    ),
    period: t('2021年指引問答', '2021 guidelines Q&A'),
    place: GLOBAL,
    sources: ['who-aqg-qa'],
    locator: '"PM2.5 and PM10 are capable of penetrating deep into the lungs and PM2.5 can even enter the bloodstream, primarily resulting in cardiovascular and respiratory impacts."',
    confidence: 'verified',
    evidence: 'international',
    research: '03 §1b',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// health: what the health evidence does and does not say
// ---------------------------------------------------------------------------

const health = {
  'hei-sr23-trap-associations': {
    data: { studies: v(353, 'count'), asiaStudies: v(41, 'count') },
    display: t('353 篇研究', '353 studies'),
    statement: t(
      '美國健康效應研究所（HEI）2022年回顧353篇研究，對長期暴露於交通相關空氣污染與全死因、循環系統疾病、缺血性心臟病及肺癌死亡，兒童與成人氣喘發病，以及兒童急性下呼吸道感染之間的關聯，有高或中高程度的信心。',
      'A 2022 Health Effects Institute review of 353 studies found high or moderate-to-high confidence that long-term exposure to traffic-related air pollution is associated with death from all causes, circulatory disease, ischaemic heart disease and lung cancer, with asthma onset in children and adults, and with acute lower respiratory infections in children.',
    ),
    period: t('2022年（10月14日更新）', '2022 (updated 14 October)'),
    place: t('國際（以歐洲與北美研究為主）', 'International (mostly European and North American studies)'),
    sources: ['hei-sr23-2022'],
    locator: 'Executive summary: "The Panel found a high or moderate-to-high level of confidence in an association between long-term exposure to TRAP and..."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是對「關聯」的信心評估，HEI明言未評估因果；研究多在歐美（亞洲只有41篇），且多在暴露水準比現今高的年代進行；肺功能不在評估結果之列。',
      'This rates confidence in association; HEI states it did not assess causality. Most studies were European or North American (41 from Asia), many from times of higher exposure than today, and lung function was not among the outcomes.',
    ),
    research: '03 §6',
  },
  'hei-sr17-asthma-exacerbation': {
    data: {},
    display: t('兒童氣喘惡化：證據充分', 'childhood asthma attacks: sufficient'),
    statement: t(
      '依HEI的說明，其2010年回顧認為有充分證據支持交通相關空氣污染與兒童氣喘惡化之間的因果關係；兒童氣喘發病則只有「提示性」證據。',
      "As HEI itself summarises, its 2010 review found sufficient evidence for a causal relationship between traffic-related air pollution and exacerbation of asthma in children; evidence for the onset of childhood asthma was only \"suggestive\".",
    ),
    period: t('2010年（HEI特別報告17）', '2010 (HEI Special Report 17)'),
    place: t('國際', 'International'),
    sources: ['hei-sr23-2022'],
    locator: 'SR23 exec summary on SR17: "The Panel concluded that the evidence was sufficient to support a causal relationship between exposure to TRAP and exacerbation of asthma in children."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '依HEI在第23號報告中的轉述，未直接查閱第17號報告原文。',
      'Based on HEI\'s own description in Special Report 23; Special Report 17 itself was not opened.',
    ),
    research: '03 §6',
  },
  'ats-2020-childhood-asthma': {
    data: {},
    display: t('兒童氣喘：病因之一', 'childhood asthma: a cause'),
    statement: t(
      '美國胸腔學會工作坊報告認為，長期暴露於空氣污染是兒童氣喘的病因之一，但對成人氣喘或慢性阻塞性肺病的證據仍不足。',
      'An American Thoracic Society workshop concluded that long-term exposure to air pollution is a cause of childhood asthma, while evidence for adult asthma or COPD remains insufficient.',
    ),
    period: t('2020年', '2020'),
    place: t('國際', 'International'),
    sources: ['thurston-2020-annats'],
    locator: 'Abstract: "Available evidence indicates that long-term exposure to air pollution is a cause of childhood asthma, but the evidence for a similar determination for adult asthma or COPD remains insufficient."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是一般空氣污染（特別是二氧化氮與黑碳等交通相關指標）的結論，並非針對機車；不能據此說某個孩子的氣喘是機車造成的。',
      'A conclusion about air pollution in general (especially traffic-related markers such as NO₂ and black carbon), not scooters; it does not mean any particular child\'s asthma was caused by scooters.',
    ),
    research: '03 §6',
  },
  'aha-2010-pm25-cardiovascular': {
    data: {},
    display: t('數小時至數週', 'hours to weeks'),
    statement: t(
      '美國心臟學會的科學聲明指出，暴露於PM2.5數小時至數週就可能誘發心血管事件，且整體證據與PM2.5和心血管疾病之間的因果關係一致。',
      'The American Heart Association concluded that PM2.5 exposure over a few hours to weeks can trigger cardiovascular events, and that the overall evidence is consistent with a causal relationship with cardiovascular illness and death.',
    ),
    period: t('2010年', '2010'),
    place: t('國際（以美國研究為主）', 'International (mostly US studies)'),
    sources: ['brook-2010-circulation'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '指一般環境PM2.5，不針對機車廢氣，也不涵蓋幾分鐘的短暫高峰；「數小時至數週」是聲明涵蓋的最短時間尺度。',
      'Refers to ambient PM2.5 in general, not scooter exhaust, and not to minutes-long peaks; "hours to weeks" is the shortest window the statement addresses.',
    ),
    research: '03 §7',
  },
  'who-7-million-deaths': {
    data: {
      combined: v(7, 'million-deaths', { approx: true, note: 'ambient + household combined' }),
      ambientLow: v(4, 'million-deaths'),
      ambientHigh: v(9, 'million-deaths'),
    },
    display: t('約 700 萬人', 'about 7 million'),
    statement: t(
      'WHO估計，全球每年約有700萬人的死亡可歸因於室外與室內空氣污染的共同影響；只計室外空氣污染的估計則在400萬至900萬之間。',
      'WHO estimates that around 7 million deaths a year worldwide are attributable to the combined effects of outdoor and household air pollution; estimates for outdoor air pollution alone range from 4 million to 9 million.',
    ),
    period: t('2021年指引引用的估計', 'Estimates cited in the 2021 guidelines'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: '§1.3.3: "around 7 million deaths ... attributable to the joint effects of ambient and household air pollution (WHO, 2018)"; "between 4 million and 9 million deaths annually"',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '700萬是室外加室內（家戶）空氣污染的合計，不是只有室外。',
      'The 7 million combines outdoor and household air pollution; it is not outdoor air alone.',
    ),
    requiresCaveat: true,
    research: '03 §2',
  },
  'chuang2020-cardiovascular-association': {
    data: { participants: v(120, 'people') },
    display: t('血壓、心率上升', 'higher blood pressure and heart rate'),
    statement: t(
      '同一項臺北研究發現，步行或騎機車通勤時，個人PM2.5暴露較高與收縮壓、心率及尿中氧化性DNA損傷指標（8-OHdG）較高有關；搭捷運時則沒有顯著關聯。',
      'The same Taipei study found that, when walking or riding a scooter, higher personal PM2.5 was associated with higher systolic blood pressure, heart rate and a urinary marker of oxidative DNA damage (8-OHdG); in the subway mode the association was not significant.',
    ),
    period: t('上午9至10點通勤時段；2020年發表', '09:00–10:00 commute; published 2020'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Abstract: "personal exposure to PM2.5 was associated with increased SBP (W: 6.5%; Sc: 7.9%), HR (W: 3.4%; Sc: 6.4%) and urinary 8-OHdG..."',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是健康成人在一小時通勤中的短暫生理變化，與疾病無關的證據；摘要未說明百分比是以多少PM2.5增量計算，因此本站不引用效果大小。戴口罩步行組沒有顯著關聯。' + ASSOCIATION_TW['zh-TW'],
      'These are small, transient physiological changes in healthy adults during a one-hour commute, not evidence of illness. The abstract does not state the PM2.5 increment behind its percentages, so we do not quote effect sizes. No significant association was seen when walking with a facemask. ' + ASSOCIATION_TW.en,
    ),
    requiresCaveat: true,
    research: '03 §4; 03 safe claim #10',
  },
  'guo2019-lung-function': {
    data: {
      participants: v(24544, 'people'),
      fvcChange: v(-2.22, 'percent', { low: -2.6, high: -1.85, note: 'per 10 µg/m3, 2-y average' }),
      fev1Change: v(-2.94, 'percent', { low: -3.36, high: -2.51 }),
      mmefChange: v(-2.79, 'percent', { low: -3.15, high: -2.41 }),
      poorLungFunctionOR: v(1.2, 'odds-ratio', { low: 1.12, high: 1.29 }),
    },
    display: t('每 10 µg/m³ 約低 2～3%', 'about 2–3% lower per 10 µg/m³'),
    statement: t(
      '一項追蹤24,544名臺灣兒童、青少年與年輕人的研究發現，兩年平均PM2.5每增加10 µg/m³，與肺功能指標約低2%至3%有關。',
      'A study of 24,544 Taiwanese children, adolescents and young adults found that each 10 µg/m³ increase in two-year average PM2.5 was associated with about 2–3% lower lung function.',
    ),
    period: t('2000–2014年', '2000–2014'),
    place: TW,
    sources: ['guo-2019-ehp'],
    locator: 'Abstract: "decreases of 2.22% [95% CI: -2.60, -1.85], 2.94 (95% CI: -3.36, -2.51), and 2.79% (95% CI: -3.15, -2.41) in the FVC, FEV1, and MMEF"; OR 1.20 (1.12, 1.29)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '摘要未說明是否屬於「臺灣兒童健康研究（TCHS）」世代，請勿如此稱呼。' + ASSOCIATION_TW['zh-TW'],
      'The abstract does not say this is the Taiwan Children Health Study cohort, so do not call it that. ' + ASSOCIATION_TW.en,
    ),
    research: '03 §3a',
  },
  'tsai2025-asthma-feno': {
    data: {
      children: v(4736, 'people'),
      asthmaOR: v(1.595, 'odds-ratio', { note: 'increment not stated in abstract' }),
      wheezeOR: v(1.726, 'odds-ratio'),
      fenoPerUg: v(1.0, 'percent', { note: 'per 1 µg/m3 PM2.5, adjusted for NO and SO2' }),
    },
    display: t('4,736 名學童', '4,736 schoolchildren'),
    statement: t(
      '一項針對彰化工業區附近4,736名學童的研究發現，長期PM2.5暴露較高與醫師診斷的氣喘較多、呼氣一氧化氮（呼吸道發炎指標）較高有關。',
      'A study of 4,736 schoolchildren near industrial areas in Changhua found that higher long-term PM2.5 exposure was associated with more physician-diagnosed asthma and higher exhaled nitric oxide, a marker of airway inflammation.',
    ),
    period: t('2025年發表（2024年1月線上刊出）', 'Published 2025 (online January 2024)'),
    place: t('彰化縣燃煤電廠等工業區附近六鄉鎮', 'Six townships near industrial areas (incl. coal-fired power plants), Changhua'),
    sources: ['tsai-2025-pedres'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '橫斷面研究，背景是工業與燃煤電廠而非機車；摘要未說明勝算比1.595對應的PM2.5增量，不可寫成「每1 µg/m³」。' + ASSOCIATION_TW['zh-TW'],
      'Cross-sectional, in an industrial and coal-power setting rather than a scooter one; the abstract does not state the PM2.5 increment behind the odds ratio of 1.595, so never present it as "per 1 µg/m³". ' + ASSOCIATION_TW.en,
    ),
    requiresCaveat: true,
    research: '03 §3a',
  },
  'hwang2005-asthma-co': {
    data: {
      children: v(32672, 'people'),
      coOR: v(1.045, 'odds-ratio', { low: 1.017, high: 1.074, note: 'per 100 ppb CO' }),
      o3OR: v(1.138, 'odds-ratio', { low: 1.001, high: 1.293, note: 'per 10 ppb O3' }),
      noxOR: v(1.005, 'odds-ratio', { low: 0.954, high: 1.117, note: 'not significant' }),
      pm10OR: v(0.934, 'odds-ratio', { low: 0.909, high: 0.96, note: 'inverse' }),
    },
    display: t('一氧化碳 OR 1.045', 'CO OR 1.045'),
    statement: t(
      '一項全國32,672名學童的研究發現，兒童氣喘與一氧化碳（每增加100 ppb，勝算比1.045）及臭氧有關；氮氧化物的關聯不顯著，PM10則呈反向關聯。',
      'A nationwide study of 32,672 schoolchildren found childhood asthma associated with carbon monoxide (odds ratio 1.045 per 100 ppb) and ozone; the association with nitrogen oxides was not significant, and PM10 was inversely associated.',
    ),
    period: t('2001年調查；2005年發表', 'Surveyed 2001; published 2005'),
    place: TW,
    sources: ['hwang-2005-thorax'],
    locator: 'Abstract: O3 OR 1.138 (1.001–1.293) per 10 ppb; CO 1.045 (1.017–1.074) per 100 ppb; NOx 1.005 (0.954–1.117); PM10 0.934 (0.909–0.960)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '橫斷面研究，使用測站資料，暴露水準是2000至2001年的；作者結論比數據強（氮氧化物不顯著），請引用實際數字而非標題。' + ASSOCIATION_TW['zh-TW'],
      'Cross-sectional, using monitoring-station data at 2000–2001 exposure levels; the authors\' conclusion is stronger than their data (NOx was not significant), so quote the numbers, not the headline. ' + ASSOCIATION_TW.en,
    ),
    requiresCaveat: true,
    research: '03 §3a',
  },
  'cho2023-kindergarten-asthma': {
    data: {
      children: v(3246, 'people'),
      pm25OR: v(1.34, 'odds-ratio', { low: 1.05, high: 1.7, note: 'per IQR 1.17 µg/m3' }),
      pm10OR: v(1.17, 'odds-ratio', { low: 1.01, high: 1.36, note: 'per IQR 10.69 µg/m3' }),
    },
    display: t('3,246 名幼兒', '3,246 young children'),
    statement: t(
      '新北市11所幼兒園3,246名幼兒的研究發現，PM2.5與PM10較高與氣喘盛行率較高有關；二氧化氮與道路噪音則沒有顯著關聯。',
      'A study of 3,246 children at 11 kindergartens in New Taipei found higher PM2.5 and PM10 associated with higher asthma prevalence; nitrogen dioxide and road traffic noise showed no significant association.',
    ),
    period: t('2023年發表', 'Published 2023'),
    place: t('新北市', 'New Taipei City'),
    sources: ['cho-2023-chemosphere'],
    locator: 'Abstract: IQR PM2.5 (1.17 µg/m3) 1.34-fold (1.05–1.70); PM10 (10.69) 1.17-fold (1.01–1.36)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '橫斷面的「盛行率」研究；摘要用了「caused」一詞，但研究設計只能顯示關聯。' + ASSOCIATION_TW['zh-TW'],
      'A cross-sectional prevalence study; the abstract says "caused", but the design can only show association. ' + ASSOCIATION_TW.en,
    ),
    research: '03 §3a',
  },
  'lin2024-asthma-lung-function': {
    data: { patients: v(675, 'people') },
    display: t('675 名氣喘患者', '675 asthma patients'),
    statement: t(
      '一項臺灣醫學中心675名氣喘患者的研究發現，PM10、PM2.5與二氧化氮暴露與早發型氣喘患者的肺功能較差有關。',
      'A study of 675 asthma patients at a Taiwanese medical centre found PM10, PM2.5 and NO₂ exposure associated with lower lung function in patients with early-onset asthma.',
    ),
    period: t('2024年發表', 'Published 2024'),
    place: TW,
    sources: ['lin-2024-jaa'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('單一醫學中心的成人患者橫斷面研究。' + ASSOCIATION_TW['zh-TW'], 'Cross-sectional, adult patients at one medical centre. ' + ASSOCIATION_TW.en),
    research: '03 §3a',
  },
  'yang2003-preterm-freeway': {
    data: { births: v(6251, 'count'), preTermOR: v(1.3, 'odds-ratio', { low: 1.03, high: 1.65 }) },
    display: t('OR 1.30', 'OR 1.30'),
    statement: t(
      '高雄一項研究發現，住在高速公路500公尺內的母親生下早產兒的調整後勝算比為1.30。',
      'A Kaohsiung study found mothers living within 500 m of a freeway had an adjusted odds ratio of 1.30 for preterm delivery.',
    ),
    period: t('1992–1997年出生；2003年發表', 'Births 1992–1997; published 2003'),
    place: t('高雄市高速公路沿線1,500公尺範圍', 'A 1,500 m zone along a Kaohsiung freeway'),
    sources: ['yang-2003-aeh'],
    locator: 'Abstract: "The adjusted odds ratio was 1.30 (95% confidence interval = 1.03, 1.65) ... within 500 m of the freeway."',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '研究年代久遠，只有一條高速公路，暴露只以距離衡量，沒有量測污染物；國際回顧（HEI）對早產的證據信心為「低」。',
      'An old study of one freeway, with exposure measured only by distance and no pollutant measurements; the international HEI review rates confidence for preterm birth as low.',
    ),
    requiresCaveat: true,
    research: '03 §3e',
  },
  'mohw-lung-cancer-2025': {
    data: {
      lungCancerRate: v(46.4, 'per-100k'),
      cancerDeaths: v(54838, 'deaths'),
      totalDeaths: v(199576, 'deaths'),
      cancerRate: v(234.9, 'per-100k'),
      yearsCancerFirst: v(44, 'count'),
    },
    display: t('每十萬人 46.4 人', '46.4 per 100,000'),
    statement: t(
      '肺癌是臺灣癌症死因的首位，2025年肺癌死亡率為每十萬人46.4人；男性與女性的癌症死因首位都是肺癌。',
      'Lung cancer is the leading cause of cancer death in Taiwan; in 2025 the lung cancer death rate was 46.4 per 100,000 people, and it was the top cancer killer for both men and women.',
    ),
    period: t('2025年（民國114年），2026年6月公布', '2025, released June 2026'),
    place: TW,
    sources: ['mohw-cause-of-death-2025'],
    locator: '「（1）氣管、支氣管和肺癌死亡46.4人」「男、女性癌症死因首位均為肺癌」「癌症自71年起已連續44年居國人死因首位」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '肺癌是「癌症」死因的首位，不是所有死因的首位（癌症整體已連續44年居死因首位）。這項統計不涉及空氣污染或機車。',
      'Lung cancer is the leading cause of cancer death, not of all deaths (cancer as a whole has been the top cause of death for 44 years). These statistics say nothing about air pollution or scooters.',
    ),
    research: '03 §3d',
  },
  'tseng2019-never-smokers': {
    data: {
      neverSmokedShare: v(53, 'percent'),
      patients: v(371084, 'people'),
      maleSmoking1995: v(59.4, 'percent'),
      maleSmoking2015: v(29.9, 'percent'),
      adenoMale1995: v(9.06, 'per-100k'),
      adenoMale2015: v(23.25, 'per-100k'),
      adenoFemale1995: v(7.05, 'per-100k'),
      adenoFemale2015: v(24.22, 'per-100k'),
    },
    display: t('53% 從未吸菸', '53% never smoked'),
    statement: t(
      '一項分析371,084名臺灣肺癌患者的研究發現，53%從未吸菸；1995至2015年間男性吸菸率從59.4%降到29.9%，肺腺癌發生率卻持續上升，研究者正探討空氣污染是否扮演角色。',
      'An analysis of 371,084 Taiwanese lung cancer patients found 53% had never smoked; between 1995 and 2015 the male smoking rate fell from 59.4% to 29.9% while lung adenocarcinoma incidence kept rising, and researchers are investigating whether air pollution plays a part.',
    ),
    period: t('1995–2015年', '1995–2015'),
    place: TW,
    sources: ['tseng-2019-jto'],
    locator: 'Abstract: "53% patients with LC had never smoked."; AdLC incidence males 9.06→23.25, females 7.05→24.22 per 100,000',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '生態學（區域比較）研究，以能見度作為空氣品質的替代指標，無法證明PM2.5導致個別病例，也未排除其他因素。不可說空氣污染是不吸菸者肺癌的「原因」或占某個比例。',
      'An ecological (regional) analysis using visibility as a proxy for air quality; it cannot show that PM2.5 caused individual cancers and does not rule out other factors. Do not say air pollution is "the cause" of never-smokers\' lung cancer, or any share of it.',
    ),
    requiresCaveat: true,
    research: '03 §3c',
  },
  'hill2023-egfr-ecological': {
    data: { egfrCases: v(32957, 'count') },
    display: t('臺灣資料呈顯著關聯', 'significant association in Taiwan data'),
    statement: t(
      '一篇《自然》期刊研究在包括臺灣在內的區域資料中，發現PM2.5濃度與EGFR突變型肺癌發生率顯著相關，並以小鼠實驗提出空氣污染物促進腫瘤的機制。',
      'A Nature study found a significant association between PM2.5 levels and the incidence of EGFR-mutant lung cancer in area-level data including Taiwan, and used mouse experiments to propose a mechanism by which air pollutants promote tumours.',
    ),
    period: t('臺灣資料2011–2017年；2023年發表', 'Taiwan data 2011–2017; published 2023'),
    place: t('英國、南韓、臺灣（臺灣為長庚研究資料庫九縣市）', 'England, South Korea and Taiwan (Taiwan: Chang Gung Research Database, nine counties)'),
    sources: ['hill-2023-nature'],
    locator: 'Abstract: "significant association between PM2.5 levels and the incidence of lung cancer for 32,957 EGFR-driven lung cancer cases in four within-country cohorts"',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '人類資料是以縣市平均PM2.5進行的生態學分析，論文自承無法考慮人口遷移；機制證據來自小鼠與少量組織樣本；PM2.5為所有來源，並非機車專屬。',
      'The human analyses are ecological (county-average PM2.5), and the paper notes it could not account for migration; the mechanism evidence comes from mice and small tissue samples; PM2.5 is from all sources, not scooters.',
    ),
    requiresCaveat: true,
    research: '03 §3c',
  },
  'lo2017-pm25-deaths-2014': {
    data: {
      deaths: v(6282, 'deaths', { low: 5716, high: 6847 }),
      ihd: v(2244, 'deaths'),
      stroke: v(2140, 'deaths'),
      lungCancer: v(1252, 'deaths', { low: 995, high: 1509 }),
      copd: v(645, 'deaths'),
      attributableFraction: v(18.6, 'percent', { low: 16.9, high: 20.3 }),
    },
    display: t('約 6,300 人（2014年推估）', 'about 6,300 (2014 estimate)'),
    statement: t(
      '一項模式推估把2014年臺灣約6,300人（6,282人）因心臟病、中風、肺癌與慢性阻塞性肺病的死亡歸因於環境PM2.5。',
      'A modelled estimate attributed about 6,300 (6,282) Taiwanese deaths in 2014 from heart disease, stroke, lung cancer and COPD to ambient PM2.5.',
    ),
    period: t('2014年', '2014'),
    place: TW,
    sources: ['lo-2017-jfma'],
    locator: 'Abstract: "In 2014, PM2.5 accounted for 6282 deaths [95% CI, 5716-6847]... population attributable mortality fraction ... 18.6%"',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是使用2014年監測資料的模式推估，年代較久，此後臺灣PM2.5已下降；PM2.5為所有來源，不能說是「機車造成的死亡」。我們找不到更新的臺灣推估。',
      'A modelled estimate from 2014 monitoring data; PM2.5 in Taiwan has fallen since. PM2.5 is from all sources, so these are not "deaths from scooters". We found no newer Taiwanese estimate.',
    ),
    requiresCaveat: true,
    research: '03 §3d',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// children: why children at kerb height may breathe more
// ---------------------------------------------------------------------------

const children = {
  'who-children-vulnerable': {
    data: {},
    display: t('呼吸較快、更接近地面', 'breathe faster, closer to the ground'),
    statement: t(
      'WHO指出，兒童呼吸比成人快，會吸入更多空氣與污染物，而且更接近地面，而某些污染物在接近地面處濃度最高。',
      'WHO says children breathe faster than adults, taking in more air and more pollutants, and live closer to the ground, where some pollutants reach peak concentrations.',
    ),
    period: t('2018年', '2018'),
    place: GLOBAL,
    sources: ['who-2018-child-health'],
    locator: '"They breathe faster than adults, taking in more air and, with it, more pollutants. Children live closer to the ground, where some pollutants reach peak concentrations."',
    confidence: 'verified',
    evidence: 'international',
    research: '03 §5',
  },
  'pram-height-sharma2020': {
    data: { fineParticlesUpTo: v(44, 'percent', { bound: 'lte' }), coverReduction: v(39, 'percent', { bound: 'lte' }) },
    display: t('最多高 44%（英國）', 'up to 44% higher (UK)'),
    statement: t(
      '英國一項實驗（非臺灣）發現，嬰兒推車高度的細微粒濃度比成人呼吸高度最多高44%。',
      'In a UK experiment (not in Taiwan), fine-particle concentrations at baby-in-pram height were up to 44% higher than at adult breathing height.',
    ),
    period: t('2020年發表', 'Published 2020'),
    place: t('英國吉爾福德（2.1公里路線）', 'Guildford, UK (2.1 km route)'),
    sources: ['sharma-kumar-2020-envint'],
    locator: 'Abstract: "The average in-pram concentration of fine particles was always higher by up to 44% compared with adult breathing height"',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '「最多44%」是各條件中的最大值，不是平均差異，且只針對細微粒；不可說「兒童比成人多吸44%污染」。臺灣沒有兒童高度的實測研究。',
      '"Up to 44%" is the maximum across conditions, not an average, and only for fine particles; never say "children breathe 44% more pollution". No child-height measurements exist for Taiwan.',
    ),
    requiresCaveat: true,
    research: '03 §5',
  },
  'child-height-harr2022': {
    data: { higherOnDays: v(6, 'count'), totalDays: v(8, 'count'), higherBy: v(20, 'percent', { bound: 'gt' }) },
    display: t('6 天高逾 20%（德國）', '>20% higher on 6 days (Germany)'),
    statement: t(
      '德國美因茲一項研究（非臺灣）以低價感測器在1.0與1.6公尺同時量測，8天中有6天兒童高度的PM2.5濃度高出20%以上，靠近車流量大的街道時差異最明顯。',
      'A study in Mainz, Germany (not Taiwan) measured simultaneously at 1.0 m and 1.6 m with low-cost sensors and found PM2.5 more than 20% higher at child height on six of eight days, with the biggest differences near busy streets.',
    ),
    period: t('2019年11月；2022年發表', 'November 2019; published 2022'),
    place: t('德國美因茲（5.5公里路線）', 'Mainz, Germany (5.5 km route)'),
    sources: ['harr-2022-uclim'],
    locator: 'Abstract: children "exposed to > 20% higher concentrations on six days (p < 0.01)", one day > 80%',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '單一國外研究，使用低價感測器，只有8天；臺灣沒有兒童高度的實測研究。',
      'A single study abroad using low-cost sensors over eight days; no child-height measurements exist for Taiwan.',
    ),
    requiresCaveat: true,
    research: '02 §6',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// Registry assembly
// ---------------------------------------------------------------------------

export const factGroups = { fleet, electric, policy, emissions, exposure, standards, hazard, health, children, economics };
export type Topic = keyof typeof factGroups;

export const topicLabels: Record<Topic, L10n> = {
  fleet: t('機車數量與使用', 'Scooter numbers and use'),
  electric: t('電動機車銷售', 'Electric scooter sales'),
  policy: t('政策、標準與汰舊', 'Policy, standards and scrappage'),
  emissions: t('排放來源', 'Where emissions come from'),
  exposure: t('街頭暴露', 'Street-level exposure'),
  standards: t('空氣品質標準與指引', 'Air quality standards and guidelines'),
  hazard: t('危害分類', 'Hazard classifications'),
  health: t('健康證據', 'Health evidence'),
  children: t('兒童', 'Children'),
  economics: t('價格、補助與使用成本', 'Prices, subsidies and running costs'),
};

const merged = { ...fleet, ...electric, ...policy, ...emissions, ...exposure, ...standards, ...hazard, ...health, ...children, ...economics };
export type FactId = keyof typeof merged;
export type Fact = FactInput & { id: FactId; topic: Topic };

function assemble(): Record<FactId, Fact> {
  const out: Record<string, Fact> = {};
  for (const [topic, group] of Object.entries(factGroups) as [Topic, Record<string, FactInput>][]) {
    for (const [id, f] of Object.entries(group)) {
      if (out[id]) throw new Error(`[data] Duplicate fact id "${id}" in topics "${out[id].topic}" and "${topic}"`);
      out[id] = { ...f, id: id as FactId, topic };
    }
  }
  return out as Record<FactId, Fact>;
}

export const facts: Record<FactId, Fact> = assemble();
export const factList: Fact[] = Object.values(facts);

/** Look up a fact. Throws on an unknown id so a typo fails the build. */
export function fact(id: FactId): Fact {
  const f = facts[id];
  if (!f) throw new Error(`[data] Unknown fact id "${id}"`);
  return f;
}

export function factsByTopic(topic: Topic): Fact[] {
  return factList.filter((f) => f.topic === topic);
}

export interface LocalizedCitation {
  id: SourceId;
  short: string;
  full: string;
  url: string;
}

export interface LocalizedFact {
  id: FactId;
  topic: Topic;
  display: string;
  statement: string;
  period: string;
  place: string;
  caveat?: string;
  requiresCaveat: boolean;
  confidence: Confidence;
  evidence: Evidence;
  badges: { confidence: string; evidence: string; confidenceDescription: string; evidenceDescription: string };
  citations: LocalizedCitation[];
  data: Record<string, Datum>;
}

/** Everything a page needs to render one fact in one language. */
export function localizeFact(idOrFact: FactId | Fact, locale: Locale): LocalizedFact {
  const f = typeof idOrFact === 'string' ? fact(idOrFact) : idOrFact;
  return {
    id: f.id,
    topic: f.topic,
    display: f.display[locale],
    statement: f.statement[locale],
    period: f.period[locale],
    place: f.place[locale],
    caveat: f.caveat?.[locale],
    requiresCaveat: f.requiresCaveat ?? false,
    confidence: f.confidence,
    evidence: f.evidence,
    badges: {
      confidence: confidenceLabels[f.confidence].label[locale],
      evidence: evidenceLabels[f.evidence].label[locale],
      confidenceDescription: confidenceLabels[f.confidence].description[locale],
      evidenceDescription: evidenceLabels[f.evidence].description[locale],
    },
    citations: f.sources.map((id) => ({
      id,
      short: shortCitation(id, locale),
      full: formatCitation(id, locale),
      url: sourceUrl(id),
    })),
    data: f.data,
  };
}
