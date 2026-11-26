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
// - `chainLink` says which link of the site's chain of evidence the fact serves (1-7, see
//   types.ts) or null for context outside the chain. Every fact sets it explicitly, except
//   topics listed in `topicDefaultChainLink` (economics, owned elsewhere). `alsoLinks` lists
//   further links where the same fact is needed; chain.ts uses both.
// - `research` points at the research file, e.g. '02 §5' (research/02-*.md) or
//   'papers/wu-2021-trd#route-C-lower' / 'redlight/idle-emissions#moenv-inspection-2025'
//   (file#finding). scripts/check-data.mjs checks that each file#finding exists and has
//   verdict CONFIRMED, CORRECTED or ADDED.
//
// Extending: add a new group object below (or in a new facts-<topic>.ts file that exports
// one), register it in `factGroups` and `topicLabels`, and run `npm run check`. Ids must be
// unique across all groups. When a fact's meaning changes, give it a new id and delete the old
// one so stale references fail the type check.

import type { ChainLink, Confidence, Datum, Evidence, L10n, Locale, ReaderKind, ReaderPlace, ResearchRef } from './types.ts';
import { confidenceLabels, evidenceLabels, readerChipText, readerKind, t, v } from './types.ts';
import type { SourceId } from './sources.ts';
import { formatCitation, shortCitation, sourceUrl } from './sources.ts';
import { economics } from './facts-economics.ts';
import { inspection, intersection, smell, acute, longterm, vulnerable, levers } from './facts-redlight.ts';
import { kerb, masks } from './facts-air.ts';

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
  /**
   * What the reader must know to avoid being misled, stated as a limit of the evidence in plain
   * words ("this rule covers vehicles waiting more than three minutes"). Pages print it to
   * readers. Never address editors here: instructions go in `editorNote`.
   */
  caveat?: L10n;
  /**
   * Internal note for editors and page builders (English): how the fact may and may not be used.
   * Never rendered: localizeFact() does not return it. Binding wording rules belong in
   * claims-policy.ts as well.
   */
  editorNote?: string;
  /** If true, a page must show the caveat right next to the number. */
  requiresCaveat?: boolean;
  /** For evidence 'derived': the facts whose numbers the arithmetic uses. */
  derivedFrom?: string[];
  research: ResearchRef;
  /** Link of the chain of evidence (1-7) or null for context. Required unless the topic has a default. */
  chainLink?: ChainLink | null;
  /** Other links this fact is also needed for. */
  alsoLinks?: ChainLink[];
  /**
   * The reader chip when it differs from the default for `evidence` (types.ts evidenceReaderKind):
   * 'official' for WHO guideline values and other official statements abroad, 'measured' for
   * instrument readings abroad. Read it with readerKind(fact).
   */
  readerKind?: ReaderKind;
  /** The place after the chip when it differs from the default (null: no place). */
  readerPlace?: ReaderPlace | null;
}

// ---------------------------------------------------------------------------
// Shared places, periods and caveats
// ---------------------------------------------------------------------------

const TW = t('台灣（全國）', 'Taiwan (national)');
const TAIPEI = t('台北市', 'Taipei City');
const TAIPEI_METRO = t('大台北地區', 'Taipei metropolitan area');
const SIX_CITIES = t('六都', "Taiwan's six special municipalities");
const GLOBAL = t('全球', 'Global');
const NOT_PLACE = t('不限地區（危害分類）', 'Not place-specific (hazard classification)');

const TEDS_PERIOD = t('基準年2023年（民國112年），TEDS 13.0版，2026年1月發布', 'Base year 2023 (TEDS 13.0, published January 2026)');
const TEDS_SCOPE = t(
  '排放清冊只計算國內來源直接排放的原生性污染物，不含境外傳輸，也不含在空氣中二次生成的微粒；排放量占比不等於對空氣中濃度的貢獻，環境部也特別提醒兩者是不同的事。',
  'The inventory counts only primary pollutants emitted directly by domestic sources; it excludes transboundary pollution and particles formed later in the air. An emissions share is not a share of what people breathe, and MOENV itself points out that the two are different things.',
);
const TEDS_COMBINED = t(
  '這是環境部排放清冊的官方數字；清冊把燃油機車分成二行程與四行程兩列，「燃油機車合計」是這兩列相加。',
  'These are official MOENV inventory figures; the inventory lists gasoline scooters in two rows, two-stroke and four-stroke, and the combined share is the sum of those two rows.',
);
const IOT_CAVEAT = t(
  '這是模擬結果：運輸研究所把路口實測資料輸入擴散模式，比較「有」和「沒有」這項措施兩種情況，不是在路口實際改前改後量到的。報告封面註明結論不代表交通部意見。',
  'This is a simulation: the Institute of Transportation fed its field measurements into a dispersion model and compared the situation with and without the measure; it is not a before-and-after reading at a real intersection. The report cover states its conclusions do not represent the Ministry\'s views.',
);
const ASSOCIATION_TW = t(
  '觀察性研究只能顯示關聯，不能證明因果；研究量的是所有來源或整體交通的污染，沒有單獨區分機車廢氣。',
  'Observational research shows association, not proof of cause; the pollution measured came from all sources or from traffic as a whole, and scooter exhaust was not isolated.',
);
const MEDIA_MOTC = t(
  '數字出自媒體轉述的交通部統計；我們未能直接開啟交通部的原始統計表。',
  'From a media report of MOTC statistics; we could not open the underlying MOTC table directly.',
);
const ABSTRACT_ONLY = t('這一項我們只讀了論文摘要。', 'We read only the paper\'s abstract.');

// ---------------------------------------------------------------------------
// fleet: how many scooters, who rides them, for what
// ---------------------------------------------------------------------------

const fleet = {
  'fleet-registered-2024': {
    data: { total: v(14.66, 'million-vehicles'), total2023: v(14.55, 'million-vehicles') },
    display: t('1,466 萬輛', '14.66 million'),
    statement: t(
      '2024年台灣登記的機車達1,466萬輛，仍逐年增加。',
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
    chainLink: 1,
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
    caveat: t(
      '這些是設籍數，不是路上實際在騎的車；環境部報告只給概數（「超過19萬輛」「77萬輛」）。',
      'These are registered vehicles, not the ones actually on the road; the MOENV review gives rounded figures only ("more than 190,000", "770,000").',
    ),
    chainLink: 7,
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
    caveat: t(
      '本站以環境部報告的77萬輛除以同一報告的1,466萬輛登記機車計算；兩者都是設籍數，包含已不常騎的車。',
      'Our arithmetic: 770,000 divided by the 14.66 million registered motorcycles in the same MOENV review. Both are registrations, which include scooters rarely ridden.',
    ),
    chainLink: 7,
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
    chainLink: 1,
    research: '01 §1',
  },
  'fleet-density-per-100': {
    data: { perHundred: v(62.7, 'per-100-people'), stock: v(14.662, 'million-vehicles') },
    display: t('每百人約 63 輛', 'about 63 per 100 people'),
    statement: t(
      '依媒體引述的交通部統計，台灣平均每100人擁有約63輛機車（62.7輛）。',
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
    chainLink: 1,
    research: '01 §2',
  },
  'fleet-regional-ranking': {
    data: { taiwan: v(60, 'per-100-people'), vietnam: v(57, 'per-100-people'), malaysia: v(44, 'per-100-people') },
    display: t('機車密度：名列前茅', 'motorcycle density: among the highest'),
    statement: t(
      '在一份非官方的區域排名中，台灣（每百人60輛）排第一，略高於越南（57輛）與馬來西亞（44輛），屬機車密度最高的國家之一。',
      'In one regional ranking Taiwan (60 motorcycles per 100 people) topped the countries compared, narrowly ahead of Vietnam (57) and Malaysia (44), placing it among the countries with the highest motorcycle density.',
    ),
    period: t('排名未註明年份', 'Ranking undated'),
    place: t('台灣與東南亞國家', 'Taiwan and Southeast Asian countries'),
    sources: ['tvbs-cars-vehicle-registrations-ranking'],
    locator: '「冠軍為平均每百人就持有60輛機車的台灣，排名第二、三則是機車大國越南 (57輛) 與馬來西亞 (44輛)」',
    confidence: 'secondary',
    evidence: 'international',
    caveat: t(
      '這份排名出自TVBS引述的Seasia Stats，非官方且未註明年份；台灣與越南只差3輛，在混用登記數與估計值的情況下差距不具意義，所以這份排名不足以說明台灣是「世界最高」。60與交通部的62.7不同，是定義與時間差異。',
      'The ranking is Seasia Stats as cited by TVBS: unofficial and undated. The 3-point gap to Vietnam is within the uncertainty of mixing registered counts with estimates, so Taiwan cannot be called "the world\'s highest". The 60 differs from MOTC\'s 62.7 because of definition and date.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    editorNote: 'Do not call Taiwan the highest in the world; the ranking is unofficial and the gap to Vietnam is within the uncertainty.',
    research: '01 §2',
  },
  'fleet-taipei-power-source-2024': {
    data: { fuel: v(90.6, 'percent'), batterySwap: v(8.4, 'percent'), plugIn: v(1.0, 'percent') },
    display: t('燃油 90.6%', '90.6% fuel-powered'),
    statement: t(
      '2024年底台北市的機車以燃油為主（90.6%），電池交換式占8.4%，充電式占1.0%。',
      'At the end of 2024, 90.6% of motorcycles in Taipei City were fuel-powered, 8.4% were battery-swap electric and 1.0% plug-in electric.',
    ),
    period: t('2024年底', 'End of 2024'),
    place: TAIPEI,
    sources: ['taipei-dbas-bulletin-1364'],
    locator: '「機車動力來源以燃油占90.6%為主，電池交換式占8.4%居次」, charging 1.0%',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '數字來自交通部「機車及自用小客車使用狀況調查」，經台北市主計處轉載，是調查結果而非登記數。',
      'From the MOTC motorcycle and private-car usage survey as relayed by the Taipei City statistics office: a survey result, not a registration count.',
    ),
    chainLink: 1,
    research: '01 §3',
  },
  'fleet-six-cities-ev-2025': {
    data: {
      salesShare: v(7.5, 'percent'),
      penetration: v(6.1, 'percent'),
      taipeiSalesShare: v(22.1, 'percent'),
      taipeiPenetration: v(10, 'percent'),
    },
    display: t('台北市 22.1%', 'Taipei 22.1%'),
    statement: t(
      '2025年六都電動機車市售比為7.5%、普及率6.1%；台北市最高，市售比22.1%、普及率10%。',
      'In 2025 electric models were 7.5% of new motorcycle sales across the six special municipalities, with a 6.1% penetration rate; Taipei led with a 22.1% sales share and 10% penetration.',
    ),
    period: t('2025年', '2025'),
    place: SIX_CITIES,
    sources: ['ctee-2026-04-six-cities-ev'],
    locator: '「2025年六都電動機車市售比為7.5％、電動機車的普及率為6.1％。六都中以台北市的市售比22.1％最高…普及率也以10％領跑六都」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自工商時報報導，引用機車產業團體（SMAT）整理的公路局資料；我們沒有核對原始資料。',
      'From a Commercial Times report quoting an industry association (SMAT) citing Highway Bureau data; not checked against the original figures.',
    ),
    chainLink: 7,
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
      '2024年全國機車的主要用途有58.4%為通勤；六都介於高雄市57.2%到台北市63.3%之間。',
      'In 2024 commuting was the main purpose of motorcycle use for 58.4% nationally; across the six special municipalities it ranged from 57.2% (Kaohsiung) to 63.3% (Taipei).',
    ),
    period: t('2024年（民國113年）', '2024'),
    place: TW,
    sources: ['taipei-dbas-bulletin-1364'],
    locator: 'table 「全國 58.4 …臺北市 63.3 …新北市 61.2 …」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '這是調查中機車使用者自己說的「主要用途」，不是旅次或里程的比例。',
      'This is the main purpose riders gave in a survey, not a share of trips or of distance ridden.',
    ),
    chainLink: null,
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
    chainLink: null,
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
      '2024年台北市平日旅次中，機車占20.1%（2022年為22.2%），公共運輸占38.3%，步行占20.8%。',
      'On weekdays in 2024, 20.1% of trips in Taipei City were by motorcycle (22.2% in 2022), 38.3% by public transport and 20.8% on foot.',
    ),
    period: t('2024年9至12月平日（2022年同期比較）', 'Weekdays, Sept–Dec 2024 (compared with 2022)'),
    place: TAIPEI,
    sources: ['taipei-dbas-bulletin-1341'],
    locator: 'row 「113 年 63.0 38.3 16.0 13.7 24.7 20.8 3.8 37.0 20.1 16.3 44.2…」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '只限台北市平日、9至12月的抽樣調查，不計500公尺以下的行程；台北的捷運與公車比其他城市多，其他五都與全國2024年的同類數字沒有找到。',
      'A sample survey of Taipei City weekdays from September to December only, not counting trips under 500 m; Taipei has far more metro and bus service than other cities, and comparable 2024 figures for the other five municipalities and for Taiwan as a whole were not found.',
    ),
    chainLink: null,
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
      '出自鉅亨網引述的交通部統計。2015至2018年與2020年的數字未能查證，所以它只是現有資料年份中的高點。',
      'From an Anue (cnyes) report citing MOTC statistics. Figures for 2015–2018 and 2020 could not be verified, so this is the peak only among the years we have.',
    ),
    chainLink: 7,
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
    chainLink: 7,
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
    evidence: 'market-tw',
    caveat: t(
      '出自公視新聞網引述的產業團體數字；當年的總領牌數未能取得。',
      'From PTS News quoting an industry association figure; the total registrations for that year were not obtained.',
    ),
    chainLink: 7,
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
    chainLink: 7,
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
    chainLink: 7,
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
    chainLink: 7,
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
    chainLink: 7,
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
      '2026年5月全台機車銷量61,541輛，其中電動機車4,273輛，約占7%。',
      'In May 2026, 4,273 of the 61,541 motorcycles sold in Taiwan were electric, about 7%.',
    ),
    period: t('2026年5月（單月）', 'May 2026 (single month)'),
    place: TW,
    sources: ['ctee-2026-06-may-sales'],
    locator: '「5月全台總銷量達6萬1541輛…5月整體銷量為4273輛」',
    confidence: 'secondary',
    evidence: 'derived',
    caveat: t(
      '單月數字，比例由本站計算；2026年其他月份未能查證，這個數字不代表全年。',
      'A single month, with the share calculated by us; other 2026 months could not be verified, so it does not stand for the whole year.',
    ),
    chainLink: 7,
    editorNote: 'Single month: never present as an annual share.',
    research: '01 §7',
  },
  'gas-scooter-excise-cut-2025': {
    data: { cut: v(2000, 'ntd'), maxDisplacement: v(150, 'cc') },
    display: t('每輛減 2,000 元', 'NT$2,000 off'),
    statement: t(
      '自2025年9月7日起至2030年底，新購150cc以下的燃油機車（非電動）並完成新領牌照，每輛減徵貨物稅2,000元。',
      'From 7 September 2025 to the end of 2030, a new non-electric scooter of 150cc or less that is newly registered qualifies for a flat NT$2,000 goods-tax cut.',
    ),
    period: t('2025年9月7日至2030年12月31日', '7 September 2025 to 31 December 2030'),
    place: TW,
    sources: ['etax-goods-tax-scooter-cut', 'tvbs-cars-2025-12-ev-sales'],
    locator: 'MOF etax: 「自114年9月7日起至119年12月31日止，購買…汽缸排氣量150cc以下機車並完成新領牌照登記，購入非電動車之車輛為限」; 新購部分 「機車每輛減徵2千元」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '財政部稅務入口網另列汰舊換新的減徵：報廢150cc以下、出廠滿4年的舊車，每輛減徵4,000元。早先的TVBS報導寫的是「8月29日起、125cc以下、最多2,000元」，與財政部網頁不同，這裡以財政部為準。媒體認為減稅是電動機車銷量疲弱的原因之一，這一點我們沒有查證。',
      'The MOF tax portal also lists a scrap-and-replace cut of NT$4,000 when a scooter of 150cc or less, at least 4 years old, is scrapped. An earlier TVBS report gave "from 29 August, up to 125cc, up to NT$2,000"; that differs from the MOF page, and we follow the MOF. Media cite the cut as one reason for weak electric sales; we have not checked that.',
    ),
    editorNote: 'Primary is the MOF etax page (research/econ/central.json goods-tax-new-gasoline-2000, VERIFIED/CONFIRMED). TVBS 301321 (125cc, 29 Aug, "up to") is kept only as the media version. Matches src/data/econ/programmes/central.ts gas-goods-tax-new-2000.',
    chainLink: 7,
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
      '台灣2050淨零排放路徑規劃電動機車市售比在2025年達20%、2030年35%、2035年70%、2040年100%。',
      "Taiwan's 2050 net-zero pathway plans for electric models to reach 20% of new motorcycle sales in 2025, 35% in 2030, 70% in 2035 and 100% in 2040.",
    ),
    period: t('2025–2040年目標', 'Targets for 2025–2040'),
    place: TW,
    sources: ['pts-2026-07-scooter-fleet', 'pts-2026-04-ev-share'],
    locator: '「規劃電動機車的市售比在2025年要達到20%、2030年35%、2035年70%、2040年達到100%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自公視新聞網對淨零路徑的報導；國家發展委員會的原始文件我們沒有讀到。市售比目標不等於禁售燃油機車，我們找不到任何正式的禁售規定。',
      'From Public Television Service (PTS) News reporting on the net-zero pathway; we have not read the National Development Council\'s original document. A sales-share target is not a ban on gasoline scooters, and we found no formal ban.',
    ),
    chainLink: 7,
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
      '實際市售比出自媒體轉述的統計，目標出自公視對淨零路徑的報導（國發會的原始文件我們沒有讀到）；差距為本站計算。',
      'The actual share comes from media reports of statistics and the target from Public Television Service (PTS) News reporting on the net-zero pathway (we have not read the National Development Council\'s original); the gap is our calculation.',
    ),
    chainLink: 7,
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
    caveat: t('第二、三期從哪一天開始實施，我們沒有查到。', 'We did not find the start dates for Phases 2 and 3.'),
    chainLink: 1,
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
    caveat: t(
      '環境部報告用的是「以下」的概數，不是精確的登記數；登記在案的二行程機車不一定都還在路上騎。',
      'The MOENV reviews give rounded "or fewer" figures, not exact counts; not every registered two-stroke is still being ridden.',
    ),
    chainLink: 1,
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
      '「老舊機車」指2007年6月30日以前出廠的機車；2024年以後淘汰了多少，我們沒有查到。',
      '"Old" means built before 30 June 2007. We did not find retirement results for 2024 onward.',
    ),
    chainLink: 1,
    alsoLinks: [7],
    research: '01 §6',
  },
  'old-scooters-remaining-2023': {
    data: { remaining: v(2.55, 'million-vehicles', { approx: true, derived: true, bound: 'lte', note: '4.74M − 2.194M; upper bound' }) },
    display: t('最多約 255 萬輛', 'at most about 2.55 million'),
    statement: t(
      '扣除2020至2023年的淘汰數，2007年中以前出廠的老舊機車最多約還剩255萬輛；其他原因的報廢沒有扣除，實際應該更少。',
      'Subtracting the 2020–2023 retirements leaves at most about 2.55 million scooters built before mid-2007; scrapping for other reasons is not subtracted, so the real number is lower.',
    ),
    period: t('2023年底（推算）', 'End of 2023 (estimate)'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['old-scooters-retired-2020-2023'],
    caveat: t(
      '本站以2019年存量減去累計淘汰數推算，非官方數字，也未扣除其他原因的報廢。',
      'Our subtraction of cumulative retirements from the 2019 stock: not an official figure, and it ignores scrapping for other reasons.',
    ),
    chainLink: 1,
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
    caveat: t(
      '這是2020年的規定；2026年的汰舊補助條件已經不同，各項現行方案列在「可以切斷的一環」的補助資料中。',
      'This is the 2020 rule; the 2026 scrappage conditions are different, and the current schemes are listed with the subsidy figures in "The link you can break".',
    ),
    chainLink: 7,
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
      '台灣最新版空氣污染物排放清冊為TEDS 13.0，以2023年為基準年，於2026年1月發布。',
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
    chainLink: 1,
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
    chainLink: 1,
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
    evidence: 'official-tw',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    chainLink: 1,
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
    evidence: 'official-tw',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    chainLink: 1,
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
    evidence: 'official-tw',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    chainLink: 1,
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
    evidence: 'official-tw',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    chainLink: 1,
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
    evidence: 'official-tw',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    chainLink: 1,
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
    evidence: 'official-tw',
    caveat: t(TEDS_COMBINED['zh-TW'] + TEDS_SCOPE['zh-TW'], TEDS_COMBINED.en + ' ' + TEDS_SCOPE.en),
    chainLink: 1,
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
      '以占全國排放的比例來看，燃油機車的一氧化碳占比（15.59%）約是其PM2.5占比（1.31%）的12倍，碳氫化合物占比（9.99%）約是7.6倍：機車排得多的是氣體（一氧化碳和碳氫化合物），不是微粒。',
      "As a share of national emissions, gasoline scooters' share of carbon monoxide (15.59%) is about 12 times their share of PM2.5 (1.31%), and their hydrocarbon share (9.99%) about 7.6 times: scooters' share is far larger for exhaust gases (carbon monoxide and hydrocarbons) than for particles.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['teds13-mc-co-share', 'teds13-mc-nmhc-share', 'teds13-mc-pm25-share'],
    caveat: t(
      '這是比較不同污染物各自占全國排放的比例，不是比較毒性或重量；一氧化碳沒有味道，所以這個比例也不代表聞得到的程度。' + TEDS_SCOPE['zh-TW'],
      'This compares each pollutant\'s share of its own national total; it is not a comparison of toxicity or tonnage. Carbon monoxide has no smell, so the ratio says nothing about how much you can smell. ' + TEDS_SCOPE.en,
    ),
    requiresCaveat: true,
    editorNote: 'Do not tie this ratio to smell: CO is odourless (redlight/smell-chemistry). The former wording "fumes you can smell" was removed for that reason.',
    chainLink: 1,
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
      '機車排放的氣體幾乎全部來自四行程機車：四行程機車占全國一氧化碳排放的15.05%，二行程只占0.54%；不過機車的PM2.5約有兩成（441.7公噸中的98.1公噸）仍來自二行程。',
      "Almost all scooter exhaust gases now come from four-stroke engines: four-stroke scooters emit 15.05% of Taiwan's carbon monoxide, two-strokes only 0.54%; but about a fifth of scooter PM2.5 (98.1 of 441.7 tonnes) still comes from two-strokes.",
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: TEDS_SCOPE,
    chainLink: 1,
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
    chainLink: 7,
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
    chainLink: 1,
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
    chainLink: 1,
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
    chainLink: 1,
    research: '01 §4',
  },
  'ambient-pm25-origin-2020-plan': {
    data: {
      transboundary: v(35.1, 'percent', { low: 29.0, high: 41.0 }),
      domestic: v(64.9, 'percent', { low: 59.0, high: 71.0 }),
    },
    display: t('境外約 35.1%', 'about 35.1% from abroad'),
    statement: t(
      '環境部的模式推估顯示，台灣空氣中的PM2.5平均約35.1%來自境外、約64.9%來自國內（各空品區不同）。',
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
    chainLink: 3,
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
      'Of the PM2.5 attributed to domestic sources, the model put industry at about 27.5%, mobile sources at about 27.5% and fugitive sources (such as dust) at about 45.0%.',
    ),
    period: t('2020年方案，使用TEDS 9.0（2013年基準）', '2020 plan, using TEDS 9.0 (2013 base)'),
    place: TW,
    sources: ['moenv-air-plan-2020'],
    locator: '「工業源影響比率平均約占27.5%」「移動源影響比率平均約占27.5%（各空品區8.8%~31.3%）」「逸散源影響比率平均約占45.0%」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '比例的分母是「國內來源」而非全部PM2.5；且為舊版清冊的模式結果。「移動源」是環境部的分類，報告沒有說它只算道路車輛，也沒有分出機車。',
      'The denominator is domestic sources only, not all PM2.5; and it is a model result from an old inventory. "Mobile sources" is MOENV\'s category; the report does not say it is limited to road vehicles, and it does not separate scooters.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    research: '01 §5',
  },
  'ambient-pm25-power-share': {
    data: { share: v(2.3, 'percent', { approx: true }), nationalMean: v(13, 'ug/m3', { approx: true }) },
    display: t('約 2.3%', 'about 2.3%'),
    statement: t(
      '環境部表示，台灣空氣中PM2.5年平均值（約每立方公尺13微克）約有2.3%來自電力業。',
      'MOENV states that about 2.3% of Taiwan\'s annual mean PM2.5 (about 13 µg/m³) comes from the power sector.',
    ),
    period: t('2025年6月環境部說明', 'MOENV statement, June 2025'),
    place: TW,
    sources: ['moenv-news-2025-power-sector'],
    locator: '「我國大氣中PM2.5約2.3%來自於電力業，這是指電力業對我國大氣中PM2.5年平均值約為13微克／立方公尺的貢獻比率」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是環境部說明的模式推估，指電力業對全國PM2.5年平均值的貢獻，分母包含所有來源；它不是任何一個地點或時段的比例，也不能直接和機車的排放量占比相比。',
      'A modelled estimate given by MOENV: the power sector\'s contribution to the national annual mean of PM2.5 from all sources. It is not the share at any one place or time, and it is not directly comparable with scooters\' share of emissions.',
    ),
    chainLink: 3,
    research: '01 §5',
  },
  'ambient-pm25-mobile-share-derived': {
    data: { share: v(18, 'percent', { approx: true, derived: true, note: '27.5% × 64.9% = 17.8%' }) },
    display: t('約 18%（推算）', 'about 18% (our estimate)'),
    statement: t(
      '把移動源占國內來源的27.5%乘上國內來源的64.9%，移動源約貢獻台灣空氣中PM2.5的18%，遠高於電力業的約2.3%。',
      'Multiplying the mobile-source share of domestic PM2.5 (27.5%) by the domestic share (64.9%) suggests mobile sources contribute roughly 18% of the PM2.5 in Taiwan\'s air, far more than the power sector\'s roughly 2.3%.',
    ),
    period: t('混合年份（2020年方案與2025年說明）', 'Mixed dates (2020 plan and 2025 statement)'),
    place: TW,
    sources: ['moenv-air-plan-2020', 'moenv-news-2025-power-sector'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['ambient-pm25-origin-2020-plan', 'ambient-pm25-domestic-sources-2020-plan', 'ambient-pm25-power-share'],
    caveat: t(
      '這是本站計算，不是環境部的說法；18%來自舊版清冊（TEDS 9.0）的模式結果，2.3%則是較新的說明，兩者年代與方法不同，只能作為大致比較。「移動源」是環境部的分類，報告沒有說它只算道路車輛，也沒有分出機車。',
      'Our calculation, not an MOENV statement. The 18% rests on an older model run (TEDS 9.0) while the 2.3% is a newer statement; dates and methods differ, so treat it only as a rough comparison. "Mobile sources" is MOENV\'s category; the report does not say it is limited to road vehicles, and it does not separate scooters.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    research: '01 §5',
  },
  'ef-vehicle-class-ranking-tsai2023': {
    data: {
      fourStrokeMotorcycleVktShare: v(32.6, 'percent', { note: 'four-stroke motorcycles only; year not stated in the abstract' }),
      gasolineCarVktShare: v(42.6, 'percent'),
    },
    display: t('苯：機車排序最高', 'benzene: motorcycles rank highest'),
    statement: t(
      '一項台灣車輛排放的模式推估把每公里排放係數排序：機車的PM2.5與氮氧化物低於汽油車與柴油車，碳氫化合物高於汽油車，苯則排在各車種之首；論文只列出排序，沒有列出數值。',
      'A modelled inventory of Taiwan\'s road vehicles ranks per-kilometre emission factors: motorcycles below gasoline and diesel vehicles for PM2.5 and nitrogen oxides, above gasoline cars for hydrocarbons, and first among vehicle classes for benzene; the paper prints only the ranking, not the values.',
    ),
    period: t('排序未註明年份（研究涵蓋2013–2021年）', 'Year of the ranking not stated (study covers 2013–2021)'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    locator: 'Abstract p.1 and Sec 4 p.18: PM2.5 and NOx diesel > gasoline > motorcycle; HC motorcycle > gasoline; benzene motorcycle > gasoline >= diesel. Fig 1 p.3 has an EF box with no values. VKT shares 42.6% / 32.6% in the abstract, year not stated.',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '排放係數來自美國模式（MOVES、MOBILE6.2）與底盤動力計資料，不是路邊實測；全文沒有任何每公里數值，因此不能算出機車是汽車的幾倍。這個苯的排序也很難與同一篇論文的年排放總量對上：2021年汽油車的苯總量（545公噸）約是機車（286公噸）的兩倍，論文沒有說明。PM2.5排放係數包含輪胎與煞車磨耗。四行程機車約占道路車輛行駛里程的32.6%（摘要未註明年份）。',
      'The factors come from US models (MOVES, MOBILE6.2) and dynamometer data, not roadside measurements; the full text has no per-km values, so no motorcycle-to-car ratio can be computed. The benzene ranking is also hard to square with the same paper\'s annual totals: in 2021 gasoline vehicles emitted about twice as much benzene (545 t) as motorcycles (286 t), which the paper does not explain. The PM2.5 factor includes tyre and brake wear. Four-stroke motorcycles were about 32.6% of road vehicle-kilometres (year not stated in the abstract).',
    ),
    requiresCaveat: true,
    chainLink: 1,
    research: 'papers/tsai-2023-atmosphere#ef-order-benzene-formaldehyde; papers/tsai-2023-atmosphere#ef-order-hc-pm-nox; papers/tsai-2023-atmosphere#benzene-conclusion-mismatch; papers/tsai-2023-atmosphere#vkt-total-and-shares',
  },
  'tsai2023-hc-tonnes-2021': {
    data: {
      motorcycles2013: v(68000, 'tonnes-per-year'),
      motorcycles2021: v(37000, 'tonnes-per-year'),
      gasoline2013: v(23000, 'tonnes-per-year'),
      gasoline2021: v(39000, 'tonnes-per-year'),
      diesel2021: v(9211, 'tonnes-per-year'),
      motorcycleDrop: v(46, 'percent', { approx: true, derived: true, note: '(68,000 − 37,000) / 68,000 = 45.6%' }),
    },
    display: t('37,000 對 39,000 公噸', '37,000 t vs 39,000 t'),
    statement: t(
      '依一項模式推估的台灣車輛排放清冊，2021年機車排放約37,000公噸碳氫化合物，略少於汽油小客車與輕型車合計的39,000公噸；機車的排放量自2013年的68,000公噸下降約46%。',
      'In a modelled inventory of Taiwan\'s road vehicles, motorcycles emitted about 37,000 tonnes of hydrocarbons in 2021, slightly less than gasoline cars and light-duty vehicles combined (39,000 t); motorcycle emissions had fallen about 46% from 68,000 t in 2013.',
    ),
    period: t('2013–2021年（四個年度）', '2013–2021 (four years)'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    locator: 'Sec 3.1.1 (3) pp.9-10: motorcycles 68,000/48,000/38,000/37,000 t; gasoline 23,000/30,000/40,000/39,000 t; diesel 8,073/9,881/9,438/9,211 t (2013/2016/2019/2021)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是學術研究的模式推估，不是環境部的TEDS清冊，也不是空氣中的濃度。「碳氫化合物」是總碳氫化合物，包含模式推估的油氣蒸發排放。機車只在2013與2016年是最大類別；論文結論寫「多數碳氫化合物來自機車」，與其2019、2021年的數字不符。46%為本站依論文數字計算。',
      'An academic modelled estimate, not the MOENV TEDS inventory, and not air concentrations. "Hydrocarbons" are total hydrocarbons including modelled evaporative emissions. Motorcycles were the largest class only in 2013 and 2016; the paper\'s conclusion that "most hydrocarbon emissions were from motorcycles" does not match its own 2019 and 2021 figures. The 46% is our arithmetic on the paper\'s totals.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    research: 'papers/tsai-2023-atmosphere#hc-totals; papers/tsai-2023-atmosphere#conclusion-hc-vs-totals',
  },
  'tsai2023-benzene-tonnes-2021': {
    data: {
      motorcycles2013: v(1048, 'tonnes-per-year'),
      motorcycles2021: v(286, 'tonnes-per-year'),
      gasoline2013: v(721, 'tonnes-per-year'),
      gasoline2021: v(545, 'tonnes-per-year'),
      diesel2021: v(113, 'tonnes-per-year'),
      motorcycleDrop: v(73, 'percent', { approx: true, derived: true, note: '(1,048 − 286) / 1,048 = 72.7%' }),
    },
    display: t('286 對 545 公噸', '286 t vs 545 t'),
    statement: t(
      '依一項台灣車輛排放的模式推估（Tsai 等，2023），2021年機車排放約286公噸苯，汽油小客車與輕型車合計545公噸；機車的苯排放自2013年的1,048公噸下降約73%，作者歸因於二行程機車淘汰與排放標準加嚴。',
      'In a modelled inventory of Taiwan\'s road vehicles (Tsai et al., 2023), motorcycles emitted about 286 tonnes of benzene in 2021 against 545 t from gasoline cars and light-duty vehicles; motorcycle benzene had fallen about 73% from 1,048 t in 2013, which the authors credit to the retirement of two-stroke machines and tighter standards.',
    ),
    period: t('2013–2021年（四個年度）', '2013–2021 (four years)'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    locator: 'Sec 3.2.1 (1) pp.12-13: motorcycles 1,048/571/344/286 t; gasoline 721/721/683/545 t; diesel 95/119/115/113 t',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '依論文印出的總量，機車只有在2013年是苯排放最大的類別；2016年起，汽油小客車與輕型車排得比較多。所以這項推估不支持「機車是交通苯排放的主要來源」的說法。這是模式推估的全國排放量，不是行人吸入的濃度。73%為本站依論文數字計算。',
      'By the totals the paper prints, motorcycles were the largest benzene class only in 2013; from 2016 gasoline cars and light-duty vehicles emitted more. So this estimate does not support calling scooters the main source of traffic benzene. This is a modelled national emissions estimate, not what pedestrians breathe. The 73% is our arithmetic on the paper\'s totals.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    research: 'papers/tsai-2023-atmosphere#benzene-totals; papers/tsai-2023-atmosphere#two-stroke-hc-benzene-decline',
  },
  'tsai2023-trend-2013-2021': {
    data: {
      benzeneDrop: v(73, 'percent', { approx: true, derived: true, note: '(1,048 − 286) / 1,048 = 72.7%' }),
      hcDrop: v(46, 'percent', { approx: true, derived: true, note: '(68,000 − 37,000) / 68,000 = 45.6%' }),
    },
    display: t('苯 −73%、碳氫 −46%', 'benzene −73%, hydrocarbons −46%'),
    statement: t(
      '依一項台灣車輛排放模式推估（Tsai 等，2023）的數字計算，機車的苯排放從2013年到2021年下降約73%，碳氫化合物下降約46%，研究者歸因於二行程機車淘汰與標準加嚴。',
      'Calculated from a modelled inventory of Taiwan\'s road vehicles (Tsai et al., 2023), motorcycle benzene emissions fell about 73% from 2013 to 2021 and hydrocarbons about 46%, which the authors credit to the retirement of two-strokes and tighter standards.',
    ),
    period: t('2013–2021年', '2013–2021'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['tsai2023-benzene-tonnes-2021', 'tsai2023-hc-tonnes-2021'],
    caveat: t(
      '百分比是本站依論文印出的總量計算，論文本身沒有印出；論文只推估了四個年度。',
      'The percentages are our arithmetic on the totals the paper prints, not printed in the paper; the paper models four years only.',
    ),
    chainLink: 1,
    research: 'papers/tsai-2023-atmosphere#benzene-totals; papers/tsai-2023-atmosphere#hc-totals; papers/tsai-2023-atmosphere#two-stroke-hc-benzene-decline',
  },
  'ef-older-phase-tsai2018': {
    data: {
      coPhase3VsPhase5: v(156, 'percent'),
      coPhase4VsPhase5: v(48, 'percent'),
      hcPhase3VsPhase5: v(84, 'percent'),
      hcPhase4VsPhase5: v(9, 'percent', { note: 'phase IV vs V not statistically significant (p>0.05)' }),
      noxPhase3VsPhase5: v(-30, 'percent'),
      coPhase5: v(84.3, 'g/L-fuel', { sd: 40.9 }),
      hcPhase5: v(29.4, 'g/L-fuel', { sd: 13.1 }),
    },
    display: t('一氧化碳 +156%（每公升燃油）', 'CO +156% (per litre of fuel)'),
    statement: t(
      '台灣43輛使用中四行程機車的實驗室測試顯示，以每公升燃油計，第三期機車的一氧化碳比第五期高156%、碳氫化合物高84%；第四期的一氧化碳高48%，碳氫化合物與第五期的差異不顯著；氮氧化物反而是舊車較低。',
      'In laboratory tests of 43 in-use four-stroke motorcycles in Taiwan, Phase 3 machines emitted 156% more carbon monoxide and 84% more hydrocarbons per litre of fuel than Phase 5; Phase 4 emitted 48% more carbon monoxide, and its hydrocarbon difference from Phase 5 was not significant; nitrogen oxides were lower in the older machines.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    locator: 'Table 1 p.4 (journal 3059): CO 216/125/84.3, HC 54.0/32.1/29.4, NOx 5.57/6.64/7.96 g/L (III/IV/V); n = 7/16/20; IV vs V HC p>0.05',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '數值以每公升燃油計，不是每公里；第三期只有7輛（平均15年、約45,600公里），第五期20輛（平均4年、約12,200公里），期別、車齡與里程互相混雜。底盤動力計測試，不是路上實測，也沒有單獨量測怠速。論文未說明受測車中速克達與打檔車的比例。',
      'Values are per litre of fuel, not per km; Phase 3 had only 7 machines (mean 15 years, about 45,600 km) and Phase 5 had 20 (mean 4 years, about 12,200 km), so phase, age and mileage are confounded. Chassis-dynamometer tests, not on-road measurements, with no separate idle figure. The paper does not say how many of the machines were scooters.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    research: 'papers/tsai-2018-aaqr#table1-co-by-phase; papers/tsai-2018-aaqr#table1-hc-by-phase; papers/tsai-2018-aaqr#table1-nox-co2; papers/tsai-2018-aaqr#design-fleet',
  },
  'ef-mileage-voc-tsai2018': {
    data: {
      vocLowMileage: v(25.2, 'g/L-fuel', { sd: 8.0, note: 'at 5,231 km; abstract and Fig. 4; body text prints 19.1 ± 9.7' }),
      vocHighMileage: v(47.1, 'g/L-fuel', { sd: 19.8, note: 'at 47,617 km; only the >40,000 km group differs significantly' }),
      aromaticsLow: v(38, 'percent'),
      aromaticsHigh: v(48, 'percent'),
    },
    display: t('25.2 → 47.1 克／公升', '25.2 → 47.1 g/L'),
    statement: t(
      '在台灣43輛使用中機車的實驗室測試（Tsai 等，2018）中，揮發性有機物排放從低里程（約5,231公里）的每公升燃油25.2克，增加到最高里程組（約47,617公里）的47.1克，但只有4萬公里以上的組別與低里程組差異顯著；芳香烴（苯、甲苯、二甲苯等）占揮發性有機物重量的38%至48%。',
      'In laboratory tests of 43 in-use Taiwanese motorcycles (Tsai et al., 2018), VOC emissions rose from 25.2 g per litre of fuel at low mileage (about 5,231 km) to 47.1 g in the highest-mileage group (about 47,617 km), but only the group above 40,000 km differed significantly from the lowest; aromatics (benzene, toluene, xylenes and others) made up 38–48% of the VOC mass.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    locator: 'Abstract; Fig. 4 p.7; text p.3061-3063; group composition text p.3061',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '論文內部數字不一致：摘要與圖4的低里程值為25.2，內文為19.1；本站採用與圖相符的25.2。4萬公里以下的上升並不顯著，且中間有一組反而較低。數值以每公升燃油計。百分比只涵蓋分析的67種物種，論文沒有列出苯的排放係數。',
      'The paper is internally inconsistent: the abstract and Fig. 4 give 25.2 at low mileage, the text 19.1; we use 25.2, which matches the figure. The rise below 40,000 km was not significant, and one mid-mileage group was lower. Values are per litre of fuel. Percentages cover only the 67 species analysed, and the paper prints no benzene emission factor.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    alsoLinks: [4],
    research: 'papers/tsai-2018-aaqr#voc-total-vs-mileage; papers/tsai-2018-aaqr#voc-group-composition; papers/tsai-2018-aaqr#dominant-species',
  },
  'ef-mileage-co-tsai2018': {
    data: {
      coLow: v(61, 'g/L-fuel', { sd: 30, note: 'at 5,231 ± 4,353 km' }),
      coHigh: v(203, 'g/L-fuel', { sd: 75, note: 'at 47,617 ± 8,568 km' }),
      coFold: v(3.3, 'ratio'),
      hcLow: v(27, 'g/L-fuel', { sd: 11 }),
      hcHigh: v(47, 'g/L-fuel', { sd: 19 }),
      noxLow: v(9.1, 'g/L-fuel', { sd: 2.5 }),
      noxHigh: v(5.4, 'g/L-fuel', { sd: 1.2 }),
    },
    display: t('一氧化碳約 3.3 倍', 'CO about 3.3-fold'),
    statement: t(
      '同樣在台灣43輛使用中機車的實驗室測試（Tsai 等，2018）中，比較最低與最高里程組，每公升燃油的一氧化碳從61克增加到203克（約3.3倍），碳氫化合物從27克增加到47克（3萬公里以上才顯著），氮氧化物則從9.1克降到5.4克。',
      'In the same laboratory tests of 43 in-use Taiwanese motorcycles (Tsai et al., 2018), comparing the lowest- and highest-mileage groups, carbon monoxide rose from 61 to 203 g per litre of fuel (about 3.3-fold) and hydrocarbons from 27 to 47 g (significant only above 30,000 km), while nitrogen oxides fell from 9.1 to 5.4 g.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    locator: 'Text PDF p.5 (journal 3060); Fig. 3(a)-(c) PDF p.6',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是不同機車之間的橫斷面比較，不是同一輛車追蹤多年；里程、車齡與期別混雜。各組平均並非逐步上升，有一組中里程反而較低。數值以每公升燃油計，不是每公里。',
      'A cross-sectional comparison of different machines, not the same vehicles tracked over time; mileage, age and phase are confounded. Group means do not rise steadily; one mid-mileage group was lower. Values are per litre of fuel, not per km.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    research: 'papers/tsai-2018-aaqr#mileage-co; papers/tsai-2018-aaqr#mileage-hc; papers/tsai-2018-aaqr#mileage-nox; papers/tsai-2018-aaqr#fig3-group-means-nonmonotonic',
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
    caveat: t(
      '只測試10輛機車；據引用它的隧道研究（Ting 等，2023），這是實驗室底盤動力計測試，不是路上或怠速實測。' + ABSTRACT_ONLY['zh-TW'],
      'Only ten motorcycles were tested; according to the tunnel study that cites it (Ting et al., 2023), these were laboratory dynamometer tests, not on-road or idle measurements. ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 1,
    research: '02 §5',
  },
  'tunnel-motorcycles-co-ting2023': {
    data: {
      coVsMotorcycleFlow: v(0.96, 'ratio', { note: 'correlation coefficient r, p<0.01' }),
      weekdayMotorcycleShare: v(51.8, 'percent'),
      weekendMotorcycleShare: v(43.1, 'percent'),
      rushHourMotorcycleShare: v(61.3, 'percent', { approx: true }),
    },
    display: t('一氧化碳與機車流量 r = 0.96', 'CO vs motorcycle flow r = 0.96'),
    statement: t(
      '台北自強隧道的實測中，平日約有一半車輛是機車（51.8%），隧道內的一氧化碳濃度隨機車流量起伏（相關係數0.96）；同一隧道的PM2.5與黑碳則主要隨大型車流量變化。',
      'In measurements in Taipei\'s Ziqiang Tunnel, about half the weekday traffic was motorcycles (51.8%), and carbon monoxide rose and fell with motorcycle flow (correlation 0.96); PM2.5 and black carbon in the same tunnel tracked heavy-duty vehicles instead.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道（819公尺）', 'Ziqiang Tunnel, Taipei (819 m)'),
    sources: ['ting-2023-envres'],
    locator: 'Sec 3.1.1 p.4 (fleet shares); Sec 3.1.3 p.5 (MC vs CO r = 0.96; LDV vs CO2 r = 0.95); Sec 3.1.2 and 3.1.4 (PM2.5 and eBC with HDV)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '相關不等於因果，機車與汽車的流量本身也互相連動；一氧化碳由自製低價感測器量測，正文未說明校正。這是隧道內行駛中的車流（論文沒有寫車速），不是路口怠速或行人位置，也沒有區分電動、二行程或四行程機車。',
      'Correlation is not causation, and motorcycle and car flows move together; CO came from custom low-cost sensors whose calibration the main text does not describe. This is moving traffic inside a tunnel (speeds not reported), not idling at a junction or where pedestrians stand, and electric, two-stroke and four-stroke motorcycles are not separated.',
    ),
    chainLink: 1,
    research: 'papers/ting-2023-envres#co-mc-correlation; papers/ting-2023-envres#fleet-composition-weekday; papers/ting-2023-envres#rush-hour-mc-share; papers/ting-2023-envres#pm25-hdv-correlation',
  },
  'tunnel-co-by-vehicle-class-ting2023': {
    data: {
      motorcyclePerFuel: v(0.209, 'kg/kg-fuel', { note: '± 0.018 as printed; ± undefined' }),
      carPerFuel: v(0.022, 'kg/kg-fuel', { note: '± 0.019' }),
      heavyPerFuel: v(0.014, 'kg/kg-fuel', { note: '± 0.127, indistinguishable from zero' }),
      motorcyclePerKm: v(4.33, 'g/km', { note: '± 0.42' }),
      carPerKm: v(2.06, 'g/km', { note: '± 0.47' }),
      heavyPerKm: v(1.23, 'g/km', { note: '± 4.31' }),
      perFuelRatio: v(9.5, 'ratio', { approx: true, derived: true, note: '0.209 / 0.022' }),
      perKmRatio: v(2.1, 'ratio', { approx: true, derived: true, note: '4.33 / 2.06' }),
    },
    display: t('每公里約 2 倍、每公斤燃料約 10 倍', 'about 2× per km, about 10× per kg of fuel'),
    statement: t(
      '以台北自強隧道實測資料的迴歸估計，機車每燃燒一公斤燃料排放0.209公斤一氧化碳，小客車為0.022公斤；以每公里計則是4.33克對2.06克，約為兩倍。',
      'Regression estimates from measurements in Taipei\'s Ziqiang Tunnel put motorcycle carbon monoxide at 0.209 kg per kg of fuel against 0.022 kg for cars; per kilometre it was 4.33 g against 2.06 g, about twice as much.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道', 'Ziqiang Tunnel, Taipei'),
    sources: ['ting-2023-envres'],
    locator: 'Table 3 (FCEF) and Table 4 (VKEF), Ziqiang CO rows, p.7',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '各車種數值是由車流比例迴歸推得，論文未說明「±」是標準差還是標準誤；小客車每公斤燃料的不確定範圍接近其數值本身，因此「約10倍」很不精確，倍數為本站計算。機車假設全部燒汽油，油耗採用2018年新車規格。同一表中較早的台灣路上實測機車一氧化碳為每公里7.65克。',
      'Vehicle-class values come from a regression on fleet shares, and the paper does not say whether "±" is a standard deviation or error; the car per-fuel uncertainty is nearly as large as the value, so "about 10 times" is imprecise, and the ratios are our arithmetic. All motorcycles were assumed gasoline, with fuel economy from 2018 new-vehicle specifications. An older Taiwanese on-road value in the same table is 7.65 g/km for motorcycle CO.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    research: 'papers/ting-2023-envres#mc-ldv-hdv-co-fcef; papers/ting-2023-envres#mc-ldv-hdv-co-vkef; papers/ting-2023-envres#uncertainty-undefined',
  },
  'tunnel-particles-heavy-vehicles-ting2023': {
    data: {
      motorcyclePm25: v(0.46, 'mg/km', { note: '± 31.20, indistinguishable from zero' }),
      carPm25: v(5.81, 'mg/km', { note: '± 12.30' }),
      heavyPm25: v(32.09, 'mg/km', { note: '± 292.28' }),
      motorcycleBc: v(0.16, 'mg/km', { note: '± 0.37' }),
      heavyBc: v(13.05, 'mg/km', { note: '± 3.00' }),
      pm25VsHeavyFlow: v(0.78, 'ratio', { note: 'r for the exit-minus-entrance PM2.5 increment vs HDV flow, p<0.01' }),
    },
    display: t('機車的微粒排放最低', 'motorcycles lowest for particles'),
    statement: t(
      '在台北自強隧道的實測中，機車每公里的PM2.5與黑碳排放估計是三類車輛中最低的，而且與零無法區分；PM2.5的增量主要與大型車流量相關（相關係數0.78）。這項研究不支持「燃油機車是主要微粒來源」。',
      'In measurements in Taipei\'s Ziqiang Tunnel, motorcycles had the lowest per-kilometre PM2.5 and black-carbon estimates of the three vehicle classes, indistinguishable from zero; the PM2.5 increment tracked heavy-vehicle flow (correlation 0.78). This study does not support calling gasoline scooters a major particle source.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道', 'Ziqiang Tunnel, Taipei'),
    sources: ['ting-2023-envres'],
    locator: 'Table 4 p.7 (VKEF eBC and PM2.5 by class); Sec 3.1.2 p.4-5 (r = 0.78)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '機車PM2.5估計的不確定範圍約為數值的70倍。「大型車」計數未區分輕型貨車，研究者推測其中約七成可能是輕型貨車。隧道排放係數也可能包含輪胎、煞車磨耗與揚塵。',
      'The motorcycle PM2.5 uncertainty is about 70 times the estimate. The "heavy-duty" count did not separate light trucks, which the authors think may be about 70% of it. Tunnel factors may also include tyre, brake and road-dust particles.',
    ),
    chainLink: 1,
    research: 'papers/ting-2023-envres#mc-pm-ebc-low; papers/ting-2023-envres#pm25-hdv-correlation; papers/ting-2023-envres#hdv-ratios; papers/ting-2023-envres#nonexhaust-note',
  },
  'tunnel-fresh-particles-op-ting2023': {
    data: {},
    display: t('新鮮微粒每微克氧化潛勢較低', 'fresh particles less potent per microgram'),
    statement: t(
      '台北自強隧道的研究（Ting 等，2023）也以實驗室試劑（DTT）量測微粒的「氧化潛勢」：隧道出口新排放的微粒，每微克的氧化潛勢一般低於入口處較老化的空氣微粒；出口每立方公尺空氣的氧化潛勢較高，是因為微粒較多。',
      'The Ziqiang Tunnel study in Taipei (Ting et al., 2023) also measured the particles\' "oxidative potential" with a laboratory assay (DTT): per microgram, freshly emitted particles at the tunnel exit were generally less potent than the aged particles at the entrance; per cubic metre of air the exit was higher because there were more particles.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道', 'Ziqiang Tunnel, Taipei'),
    sources: ['ting-2023-envres'],
    locator: 'Sec 3.3 p.8; Fig. 5; Table 5 (OPv 0.15-0.46 nmol/min/m3)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '氧化潛勢是實驗室替代指標，不是健康結果；作者對原因只是假設，沒有量測微粒成分，也沒有統計檢定。這項結果削弱「新鮮廢氣微粒每單位特別毒」的說法。',
      'Oxidative potential is a laboratory proxy, not a health outcome; the authors\' explanation is a hypothesis with no composition data and no statistical test. It weakens any claim that fresh exhaust particles are especially toxic per unit mass.',
    ),
    chainLink: 4,
    research: 'papers/ting-2023-envres#fresh-less-toxic; papers/ting-2023-envres#opv-range; papers/ting-2023-envres#op-meaning',
  },
  'downtown-taipei-vehicle-share-tsai2021': {
    data: {
      co: v(90, 'percent', { bound: 'gt' }),
      nox: v(80, 'percent'),
      pm25: v(50, 'percent', { approx: true }),
    },
    display: t('一氧化碳 >90%', 'CO >90%'),
    statement: t(
      '一項空氣品質模式研究估計，台北市中心超過90%的一氧化碳、80%的氮氧化物與約一半的PM2.5來自車輛排放。',
      'An air-quality modelling study estimated that vehicle emissions account for more than 90% of carbon monoxide, 80% of nitrogen oxides and about half of PM2.5 in downtown Taipei.',
    ),
    period: t('2021年發表', 'Published 2021'),
    place: t('台北市中心', 'Downtown Taipei'),
    sources: ['tsai-2021-stoten'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '指所有車輛，並非只有機車；為模式（CMAQ）敏感度分析結果。' + ABSTRACT_ONLY['zh-TW'],
      'Refers to all vehicles, not scooters alone, and is a model (CMAQ) sensitivity result. ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 3,
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
    chainLink: 2,
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
      'A modelling study estimated that in 2016 electric scooters (Taiwan\'s ordinary white-plate class) emitted 100% less VOCs, 97.4% less NOx and 76.8% less CO₂-equivalent per kilometre than gasoline scooters, but about 2.4 times the sulfur oxides.',
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
    chainLink: 7,
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
      '交通部運輸研究所在台北、新北與高雄的10處路口，於斑馬線旁設固定式感測器量測PM2.5與一氧化碳，每處連續48小時，進氣口在離地1.2至1.5公尺的呼吸高度；各項改善措施的效果則以擴散模式模擬。',
      'The transport ministry\'s Institute of Transportation measured PM2.5 and carbon monoxide with fixed sensors beside the crosswalk at 10 intersections in Taipei, New Taipei and Kaohsiung, for 48 hours each, with inlets at breathing height (1.2–1.5 m); the effects of street measures were then simulated with a dispersion model.',
    ),
    period: t('2023–2024年量測，2025年12月出版', 'Measured 2023–2024, published December 2025'),
    place: t('台北市、新北市、高雄市', 'Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: '02 §1a: 「Fixed micro-sensors (PM2.5, CO) beside the crosswalk, inlet 1.2-1.5 m above ground」; 10 intersections (4 in 2023, 6 in 2024), 48 h each',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '感測器是固定在路口的微型感測器，不是戴在行人身上；只量PM2.5與一氧化碳，沒有量苯或超細微粒。改善措施的效果是模擬，不是改前改後實測。報告封面註明結論不代表交通部意見。',
      'The sensors were fixed micro-sensors at the intersection, not worn by pedestrians; they measured only PM2.5 and carbon monoxide, not benzene or ultrafine particles. The effects of the measures were simulated, not read before and after a real change. The report cover states its conclusions do not represent the Ministry\'s views.',
    ),
    editorNote: 'Split from the modelled scenario facts: the design sentence is mostly measurement, so evidence is measured-tw; the dispersion-model part is stated in the caveat. The red-light sweep (redlight/intersection-peaks) could not re-open the PDF; figures rest on the first, verified reading (research/02 §1a). iot.gov.tw also reset the connection when tried again on 2026-11-26.',
    chainLink: 3,
    research: '02 §1a',
  },
  'iot-scramble-typical-range': {
    data: { reductionLow: v(-2.58, 'percent'), reductionHigh: v(-21.4, 'percent') },
    display: t('約 3%～21%', 'about 3–21%'),
    statement: t(
      '在運輸研究所的模式中，高雄這處路口全天實施行人專用時相，報告文字給出的行人等候區PM2.5變化是降低約3%至21%（不含離群的第2模擬日）。',
      "In the Institute of Transportation's model of this Kaohsiung intersection, the report's text gives the change in PM2.5 at the pedestrian waiting area under an all-day exclusive pedestrian phase (scramble crossing) as a fall of roughly 3% to 21% (leaving out the outlier simulated Day 2).",
    ),
    period: t('用2024年實測資料做的模擬', 'Simulation using 2024 field data'),
    place: t('高雄市左營區高鐵路／重信路口', 'Gaotie Rd / Chongxin Rd intersection, Zuoying, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'p.4-28: 「實施全天時段行人專用時相下…於行人等候區增減幅度為-21.40%至-2.58%」 (excludes the outlier Day 2)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是報告第4-28頁對等候區各計算點平均的描述，不是各模擬日的數字；同一路口各模擬日的全天平均降幅約12%至18%，其中第3、4天的模擬未通過報告的模式效能檢核。台北與新北的路口降幅較小（約4%至10%），有一個模擬日PM2.5反而上升約10%（該日未通過模式檢核），模擬的一氧化碳也常增加。' + IOT_CAVEAT['zh-TW'],
      'This is the report\'s description (p.4-28) of the average across calculation points in the waiting area, not a set of per-day results; the all-day averages for each simulated day at this intersection fell by about 12% to 18%, and Days 3 and 4 failed the report\'s model-performance check. At the Taipei and New Taipei intersections the reductions were smaller (about 4–10%), PM2.5 rose by about 10% on one simulated day (a day that failed the model check), and modelled carbon monoxide often rose. ' + IOT_CAVEAT.en,
    ),
    editorNote: 'Two ranges for one site: 3-21% is the p.4-28 text (受體點位平均, waiting area, excl. Day 2); 12-18% is Table 4.3.2-30 per-day all-day values (-17.79*, -16.22#, -12.00#). Never call 3-21% "typical simulated days". Never generalise beyond this Kaohsiung intersection.',
    requiresCaveat: true,
    chainLink: 3,
    research: '02 §1a, Corrections #1',
  },
  'iot-scramble-outlier-day': {
    data: { allDay: v(-94.86, 'percent'), peakOnly: v(-94.43, 'percent') },
    display: t('94%（單一模擬日的離群值）', '94% (one outlier simulated day)'),
    statement: t(
      '常被引用的「降低94%」只出現在高雄一處路口的單一模擬日，報告本身指出該日結果明顯高於其他模擬值；同一路口其他三個模擬日的全天平均約降低12%至18%，其中兩天的模擬未通過模式效能檢核。',
      'The widely quoted "94% reduction" comes from a single simulated day at one Kaohsiung intersection, which the report itself flags as clearly higher than its other simulated values; on the other three simulated days at the same intersection the all-day average fell by about 12% to 18%, and two of those days failed the model-performance check.',
    ),
    period: t('第2模擬日（2024年資料）', 'Simulation Day 2 (2024 data)'),
    place: t('高雄市左營區高鐵路／重信路口', 'Gaotie Rd / Chongxin Rd intersection, Zuoying, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Table 4.3.2-30: all-day −17.79*, −94.86*, −16.22#, −12.00#; peak-only −7.87, −94.43*, −9.54#, −2.92#. Text: 「第 2 天模擬結果最具有差異性，明顯高於其他模擬值」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是模式模擬值，不是實測；是行人等候區有無專用時相的情境比較，不是機車專屬的結果。該日的無專用時相基準值異常偏高，報告未說明原因。同一路口第3、4天的模擬未通過模式效能檢核。這一天的94%不代表行人專用時相的一般效果。',
      'A modelled value, not a measurement; it compares scenarios with and without an exclusive phase at the waiting area and is not scooter-specific. The no-phase baseline that day was anomalously high, and the report does not explain why. Days 3 and 4 at the same site failed the model-performance check. The 94% is not a typical effect of an exclusive pedestrian phase.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'Never write "scramble crossings cut exposure by 94%"; never show the 94% on its own (claims policy).',
    research: '02 §1a, Corrections #1',
  },
  'iot-scramble-co-rise': {
    data: { coChangeLow: v(7.45, 'percent'), coChangeHigh: v(39.62, 'percent') },
    display: t('一氧化碳 +7%～+40%', 'CO +7% to +40%'),
    statement: t(
      '在台北與新北的路口，模式顯示全天實施行人專用時相後，模擬的一氧化碳濃度反而上升約7%至40%。',
      'At the Taipei and New Taipei intersections, the model showed simulated carbon monoxide rising by about 7% to 40% under an all-day exclusive pedestrian phase.',
    ),
    period: t('用2024年實測資料做的模擬', 'Simulation using 2024 field data'),
    place: t('台北市、新北市路口（一般路口、單一背景源）', 'Taipei and New Taipei intersections (general, single background source)'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Table 4.3.2-29 CO change, all-day scramble: +18.33*, +7.54*, +7.45, +39.62',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: IOT_CAVEAT,
    chainLink: 3,
    research: '02 §1a',
  },
  'iot-sidewalk-widening': {
    data: { bestCase: v(-1.88, 'percent'), worstCase: v(5.34, 'percent') },
    display: t('−1.88%～+5.34%', '−1.88% to +5.34%'),
    statement: t(
      '在模式中將人行道拓寬0.5公尺，PM2.5的變化從降低1.88%到增加5.34%不等，方向並不一致；媒體報導的「約2%」是最佳情況。',
      'In the model, widening the sidewalk by 0.5 m changed PM2.5 by anything from a 1.88% decrease to a 5.34% increase, with no consistent direction; the "about 2%" in press reports is the best case.',
    ),
    period: t('用2024年實測資料做的模擬', 'Simulation using 2024 field data'),
    place: t('台北市、新北市、高雄市路口', 'Intersections in Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Tables 4.3.2-29..32, sidewalk +0.5 m. Report conclusion (p.6-2) still calls it the 較佳 measure across background types.',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '報告結論仍認為拓寬0.5公尺是各類路口中較佳的措施。' + IOT_CAVEAT['zh-TW'],
      'The report\'s conclusion still rates 0.5 m widening as the better measure across intersection types. ' + IOT_CAVEAT.en,
    ),
    chainLink: 3,
    research: '02 §1a',
  },
  'iot-setback-measured': {
    data: { reductionA: v(0.46, 'ug/m3'), reductionB: v(0.94, 'ug/m3', { note: '重慶北路/酒泉街' }) },
    display: t('降低 0.46 與 0.94 µg/m³', '0.46 and 0.94 µg/m³ lower'),
    statement: t(
      '第一年實測顯示，把行人等候區移離機車待轉區後，尖峰時段等候區的平均PM2.5降低0.46與0.94 µg/m³，絕對降幅很小。',
      'In first-year field measurements, moving the pedestrian waiting area away from the two-stage turn box for scooters lowered average PM2.5 there during peak hours by 0.46 and 0.94 µg/m³: small absolute changes.',
    ),
    period: t('第一年（2023年）尖峰時段實測', 'Year-one (2023) peak-hour measurements'),
    place: t('量測路口（例如重慶北路／酒泉街路口）', 'Measured intersections (e.g. Chongqing N. Rd / Jiuquan St)'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'p.1-6 / 附1-4: reductions 0.46 and 0.94 µg/m³ (重慶北路/酒泉街 0.94)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '報告摘要（第 1–6 頁）也寫到：有一個等候區往後移的路口，移了以後 PM2.5 反而略高一點；另一個行人專用時相的路口，號誌切換前後的資料很不穩定。所以站遠一點有沒有用，量不出明顯的差別。',
      'The report\'s summary (p.1-6) also records PM2.5 "slightly higher" at the pedestrian-setback site after the setback; separately, field data at the scramble-crossing site were quite unstable around phase changes.',
    ),
    editorNote: 'research/02 §1a does not say whether the 0.46/0.94 came from a real before/after change at the same site or from comparing positions, nor which site had the "略微上升" result. The IOT PDF could not be re-opened (connection reset, 2026-11-26); re-check p.1-6 and 附1-4 before strengthening either point.',
    requiresCaveat: true,
    chainLink: 3,
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
    chainLink: 3,
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
    caveat: t(
      '0.5公尺是模式設定的單一高度，不是量測值；實際排氣管高度因車款而不同。同一份報告的現場感測器放在1.2至1.5公尺。',
      'The 0.5 m is a single height set in the model, not a measurement; real tailpipe heights vary by model. The same report\'s field sensors stood at 1.2–1.5 m.',
    ),
    chainLink: 2,
    research: '02 §1a, §6',
  },
  'commute-walking-wang2021': {
    data: {
      walking: v(40, 'ug/m3', { low: 10, high: 275, note: 'median (range), n = 216 readings' }),
      bus: v(35, 'ug/m3', { low: 13, high: 65, note: 'n = 38, AC on' }),
      car: v(15, 'ug/m3', { low: 8, high: 80, note: 'n = 111, 5 trips, AC, windows closed' }),
      stationMedian: v(14, 'ug/m3', { low: 2, high: 38, note: 'government stations during the study' }),
    },
    display: t('步行 40 µg/m³', 'walking 40 µg/m³'),
    statement: t(
      '一項大台北研究由五位受試者攜帶手持式低價感測器量測，沿街步行時PM2.5的中位數為40 µg/m³（216筆讀數），高於開冷氣的公車（35）與關窗開冷氣的汽車（15）；同期政府測站的中位數為14。',
      'In a Taipei-area study in which five volunteers carried a hand-held low-cost sensor, median PM2.5 while walking along streets was 40 µg/m³ (216 readings), above air-conditioned buses (35) and closed, air-conditioned cars (15); government stations read a median of 14 in the same period.',
    ),
    period: t('2019年4–7月（北台灣PM2.5最低的季節）', 'April–July 2019 (the lowest-PM2.5 season in northern Taiwan)'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Results p.5, p.8-9; Fig. 8 p.10; station values p.4',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '感測器未經校正，作者依廠商測試推論讀數約偏高30%，但所有結果都未調整。步行（40）與公車（35）的差距不大；讀數是同一趟路線上的重複量測，不是獨立樣本。步行的數值包含所有來源，論文沒有把交通與其他來源分開。',
      'The sensor was not calibrated; by the authors\' reasoning from a manufacturer test it reads about 30% high, but no result was adjusted. The gap between walking (40) and the bus (35) is small, and readings are repeated within trips, not independent samples. The walking value includes every source; the paper does not separate traffic from others.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    research: 'papers/wang-2021-atmosphere#walking-street-stats; papers/wang-2021-atmosphere#bus-stats; papers/wang-2021-atmosphere#car-stats; papers/wang-2021-atmosphere#ambient-station-range',
  },
  'idle-motorcycle-pm25-wang2021': {
    data: {
      motorcycleIdle: v(75, 'ug/m3', { low: 60, high: 105, note: 'median (range); 21 readings from 3 trips; p = 0.0011 vs walking (Results text; abstract says p<0.0001)' }),
      walking: v(40, 'ug/m3'),
    },
    display: t('停等時 75 µg/m³（3趟）', '75 µg/m³ while stopped (3 trips)'),
    statement: t(
      '大台北一項手持感測器的研究（Wang 等，2021）只在機車停止時（例如等紅燈）量測騎士的PM2.5，三趟共21筆讀數的中位數為75 µg/m³，約為步行中位數的兩倍；這是騎士停等時的數值，不是行進中，也不是行人。',
      'A Taipei-area hand-held sensor study (Wang et al., 2021) measured riders\' PM2.5 only while the motorcycle was stopped (for example at red lights): the median of 21 readings over three trips was 75 µg/m³, about twice the walking median; these are riders at a stop, not riding in motion, and not pedestrians.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Methods 2.4 p.4 (idle only); Results p.8; Discussion p.11',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只有三趟、21筆讀數，且同一趟內的讀數並不獨立；論文沒有說明機車是否燒汽油。感測器約偏高30%（未調整）。作者推測行進中的暴露「可能」較低，但沒有量測。另一項研究量到的53.6，對象與方法都不同，兩者不是同一個範圍的兩端。',
      'Only three trips and 21 readings, not independent within a trip; the paper does not say whether the motorcycle was gasoline. The sensor reads about 30% high (unadjusted). The authors think exposure while moving is "probably" lower but did not measure it. Another study\'s 53.6 comes from different people and methods; the two are not the ends of one range.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'R15: never merge with Chuang 2020 (53.6) into "50–75".',
    research: 'papers/wang-2021-atmosphere#motorcycle-stats; papers/wang-2021-atmosphere#motorcycle-idle-only; papers/wang-2021-atmosphere#added-fuel-silence',
  },
  'commute-mrt-underground-wang2021': {
    data: {
      undergroundStation: v(75, 'ug/m3', { low: 30, high: 210, note: 'Results text; abstract says 80' }),
      undergroundCar: v(80, 'ug/m3', { low: 53, high: 185, note: 'Results text; abstract range 55-185' }),
      elevatedStation: v(33, 'ug/m3', { low: 15, high: 35 }),
      elevatedCar: v(20, 'ug/m3', { low: 13, high: 68, note: 'Results text; abstract says 28' }),
    },
    display: t('地下捷運 75～80 µg/m³', 'underground MRT 75–80 µg/m³'),
    statement: t(
      '在大台北一項手持感測器研究（Wang 等，2021）中，地下段捷運車站與車廂的PM2.5中位數為75至80 µg/m³，與機車停等時相近；高架段則只有20至33：高暴露不只出現在街道上，地下段的微粒來自輪軌磨耗與通風不良，不是排氣管。',
      'In the Taipei-area hand-held sensor study (Wang et al., 2021), underground MRT stations and carriages had median PM2.5 of 75–80 µg/m³, similar to motorcycles at a stop, against 20–33 on elevated sections: high exposure is not confined to the street, and the authors attribute underground particles to rail wear and poor ventilation, not tailpipes.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Results p.6 and p.8; Discussion p.10, p.12',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '摘要與內文的數字不一致（車站80對75、高架車廂28對20），本站採用內文。捷運是電動軌道運輸，這項結果與電動機車無關，不能用來支持或反對電動機車。',
      'The abstract and Results disagree (stations 80 vs 75; elevated carriages 28 vs 20); we use the Results text. The MRT is electric rail; this result says nothing for or against electric scooters.',
    ),
    chainLink: 3,
    research: 'papers/wang-2021-atmosphere#underground-mrt-stats; papers/wang-2021-atmosphere#elevated-mrt-stats; papers/wang-2021-atmosphere#mrt-ventilation-explanation',
  },
  'street-vs-station-wang2021': {
    data: {
      pairs: v(24, 'count'),
      slope: v(0.958, 'ratio'),
      intercept: v(23.353, 'ug/m3'),
      rSquared: v(0.275, 'ratio'),
    },
    display: t('R² = 0.275', 'R² = 0.275'),
    statement: t(
      '大台北一項手持感測器的研究（Wang 等，2021）在測站附近同時量測24次，街道上的讀數高於測站，但兩者的關係很弱（R² = 0.275）：測站數值無法準確代表在街上走路的人吸入的空氣。',
      'In 24 simultaneous measurements near monitoring stations, a Taipei-area hand-held sensor study (Wang et al., 2021) found street readings above station values, but only weakly related to them (R² = 0.275): station values cannot stand in for what someone walking along the street breathes.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Fig. 2 p.5: S = 0.958 M + 23.353, R2 = 0.275, p = 0.006, 24 pairs, five stations',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '作者把差距歸因於測站高度、儀器原理不同與感測器偏高，並沒有量化交通的貢獻；同一研究的室內讀數也常高於測站，因此街道與測站的差距不全是交通造成。',
      'The authors attribute the gap to station height, different instruments and sensor bias, without quantifying traffic; indoor readings in the same study were often above station values too, so the street-station gap is not all traffic.',
    ),
    chainLink: 3,
    research: 'papers/wang-2021-atmosphere#street-vs-station-regression; papers/wang-2021-atmosphere#added-indoor-baseline',
  },
  'walking-peaks-incense-wang2021': {
    data: {
      temple: v(588, 'ug/m3', { sd: 271, note: 'mean ± SD near a temple' }),
      foodCourt: v(405, 'ug/m3', { sd: 238, note: 'underground night-market food court' }),
      walkingMax: v(275, 'ug/m3', { note: 'sidewalk maximum; source not stated' }),
    },
    display: t('最高值來自焚香與烹飪', 'highest peaks: incense and cooking'),
    statement: t(
      '在大台北一項手持感測器研究（Wang 等，2021）中，有標明來源的最高讀數來自廟宇焚香（平均588 µg/m³）與地下美食街烹飪（405），不是交通；人行道最高的275則沒有說明來源。',
      'In a Taipei-area hand-held sensor study (Wang et al., 2021), the highest readings with a named source came from temple incense (mean 588 µg/m³) and cooking in an underground food court (405), not traffic; the sidewalk maximum of 275 has no stated source.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Section 3 p.6; Table 3; Discussion p.11; Fig. 8 outliers',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這些高值都不是來自機車，所以街上偶爾量到的極端高值，說明不了機車廢氣；人行道最高的275，研究沒有說來自哪裡，所以也不能算在廟宇或交通頭上。',
      'None of these peaks came from scooters, so extreme street readings say nothing about scooter exhaust; the study does not say where the 275 came from, so it cannot be put down to temples or traffic either.',
    ),
    chainLink: 3,
    editorNote: 'Do not attribute extreme street peaks to scooters, or the 275 to temples or traffic.',
    research: 'papers/wang-2021-atmosphere#walking-peak-temple-nightmarket; papers/wang-2021-atmosphere#walking-peak-275-unattributed',
  },
  'commute-scooter-vs-subway-chuang2020': {
    data: {
      exposureHours: v(1, 'hours', { note: 'duration of each measured exposure: a fixed one-hour commute window, 09:00-10:00' }),
      scooter: v(53.6, 'ug/m3', { sd: 26.1, low: 22.8, high: 92.3, note: 'mean ± SD (range); gasoline scooter riders' }),
      walking: v(42.7, 'ug/m3', { sd: 22.6, low: 19.2, high: 78.2 }),
      walkingMask: v(43.1, 'ug/m3', { sd: 20.7, low: 18.7, high: 81.4, note: 'monitor outside the mask' }),
      bus: v(34.7, 'ug/m3', { sd: 15.1, low: 2.2, high: 61.9 }),
      car: v(26.2, 'ug/m3', { sd: 12.5, low: 1.8, high: 56.2 }),
      subway: v(21.7, 'ug/m3', { sd: 5.8, low: 8.6, high: 32.5 }),
    },
    display: t('步行 42.7、騎機車 53.6 µg/m³', 'walking 42.7, scooter 53.6 µg/m³'),
    statement: t(
      '在一項120位台北健康年輕成人的研究中，早上通勤一小時的個人PM2.5平均值，步行為42.7 µg/m³、騎燃油機車為53.6，搭捷運只有21.7；步行與騎機車都顯著高於捷運與汽車，但兩者之間、以及與公車之間的差異並不顯著。',
      'In a study of 120 healthy young adults in Taipei, mean personal PM2.5 over a morning commute hour was 42.7 µg/m³ walking and 53.6 riding a gasoline scooter, against 21.7 on the subway; walking and scooter were significantly higher than subway and car, but did not differ significantly from each other or from the bus.',
    ),
    period: t('上午9至10點；2017年2月至2019年12月', '09:00–10:00; February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 1 p.3, PM2.5 rows; Scheffe pairs Sc/S, Sc/C, W/S, W/C, WM/S, WM/C',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只量測早上一小時，路線與車流沒有描述；騎士的數值是騎士自己的暴露，不是站在機車旁的行人。只量PM2.5，沒有一氧化碳或苯。表1列出每種方式20人，與「每人六種方式各量一次」的說法不一致，論文沒有說明。另一項研究量到的75，對象與方法都不同，兩者不是同一個範圍的兩端。',
      'Only one morning hour, with route and traffic not described; riders\' values are their own exposure, not a pedestrian standing beside scooters. Only PM2.5 was measured, no CO or benzene. Table 1 lists 20 people per mode, which the paper does not reconcile with "six measurements per participant". Another study\'s 75 comes from different people and methods; the two are not the ends of one range.',
    ),
    chainLink: 3,
    editorNote: 'R15: never merge with Wang 2021 (75) into "50–75".',
    research: 'papers/chuang-2020-aex#pm-scooter; papers/chuang-2020-aex#pm-walking; papers/chuang-2020-aex#pm-subway; papers/chuang-2020-aex#pm-bus-car; papers/chuang-2020-aex#add-pairwise-not-significant; papers/chuang-2020-aex#commute-duration-context',
  },
  'moenv-2017-taipei-commute': {
    data: {
      car: v(7.6, 'ug/m3'),
      mrt: v(21.9, 'ug/m3'),
      bus: v(23.5, 'ug/m3'),
      motorcycle: v(32.1, 'ug/m3'),
    },
    display: t('機車 32.1 對 汽車 7.6 µg/m³', 'motorcycle 32.1 vs car 7.6 µg/m³'),
    statement: t(
      '環保署2017年的台北通勤調查以微型感測器量測，騎機車的PM2.5平均最高（32.1 µg/m³），開冷氣的汽車最低（7.6），並建議民眾避開需要長時間等候的路口。',
      'The EPA\'s 2017 Taipei commuter survey, using micro-sensors, found the highest mean PM2.5 on motorcycles (32.1 µg/m³) and the lowest in air-conditioned cars (7.6), and advised people to avoid intersections with long waits.',
    ),
    period: t('2017年4月10、12、13、14日與5月4日；2018年5月31日發布', '10, 12, 13, 14 April and 4 May 2017; released 31 May 2018'),
    place: TAIPEI_METRO,
    sources: ['moenv-2018-taipei-commute-press'],
    locator: 'Press release: car 7.6, MRT 21.9, bus 23.5, motorcycle 32.1 µg/m3; 機動車輛近距離排氣加成',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '量測對象是騎士與乘客，不是路口的行人；新聞稿沒有樣本數，也沒有路口層級的資料。',
      'It measured riders and passengers, not pedestrians at a crossing; the release gives no sample size and no intersection-level data.',
    ),
    chainLink: 3,
    research: 'redlight/intersection-peaks#moenv-2018-taipei-commute',
  },
  'scooter-lane-btex-wu2021': {
    data: {
      scooterLaneBtex: v(33.96, 'ppb', { note: 'unadjusted mean; Fig. 2 mean marker reads about 28.5' }),
      cyclistBtex: v(20.07, 'ppb'),
      scooterLanePm25: v(27.65, 'ug/m3', { note: 'unadjusted mean; Fig. 2 marker about 26.5' }),
      cyclistPm25: v(23.27, 'ug/m3'),
    },
    display: t('苯類（BTEX）33.96 對 20.07 ppb', 'BTEX 33.96 vs 20.07 ppb'),
    statement: t(
      '在台北四條路線上，研究助理騎租來的電動機車，在車道上與汽機車混行（因此吸入的是周圍車流的廢氣，不是自己的），苯類（BTEX：苯、甲苯、乙苯、二甲苯）平均為33.96 ppb；在同一路線騎自行車者為20.07 ppb。PM2.5則是27.65對23.27 µg/m³。',
      'On four Taipei routes, research assistants riding rented electric scooters in the traffic lane (so breathing surrounding traffic\'s exhaust, not their own) averaged 33.96 ppb of BTEX (benzene, toluene, ethylbenzene, xylenes); cyclists on the same routes averaged 20.07 ppb. PM2.5 was 27.65 against 23.27 µg/m³.',
    ),
    period: t('2017年11月至2018年4月，尖峰與離峰時段', 'November 2017 to April 2018, rush and non-rush hours'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Abstract; Section 3.1 p.5; design p.3 (WeMo electric scooters "to prevent self-pollution"); Fig. 2 p.4',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是騎士在車流中的暴露，不是行人；騎士騎的是電動機車，研究沒有量測燃油機車騎士，也沒有比較燃油與電動機車。這裡用的是未調整的平均；論文自己的圖2上，平均的記號看起來比較低（苯類約28.5），論文沒有解釋。各組的樣本數，論文沒有列出。',
      'These are riders in traffic, not pedestrians; the riders used electric scooters, no gasoline-scooter rider was measured, and gasoline and electric were not compared. The values are unadjusted means; the paper\'s own Fig. 2 mean markers look lower (BTEX about 28.5), unexplained, and group sample sizes are not given.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    research: 'papers/wu-2021-trd#mean-exposure-bike-vs-scooter; papers/wu-2021-trd#scooter-is-electric; papers/wu-2021-trd#fig2-mean-markers-vs-text',
  },
  'cyclist-vs-scooter-lane-benzene-wu2021': {
    data: {
      benzeneRush: v(-39.99, 'percent', { note: 'cyclists vs electric-scooter riders, adjusted, P<0.001' }),
      btexRush: v(-33.33, 'percent', { note: 'P<0.001' }),
      pm25Rush: v(-18.3, 'percent', { note: 'not significant, P = 0.07' }),
      btexNonRush: v(-13.35, 'percent', { note: 'P<0.05' }),
      benzeneNonRush: v(-10.93, 'percent', { note: 'not significant' }),
    },
    display: t('苯低 40%（尖峰）', 'benzene 40% lower (rush hour)'),
    statement: t(
      '在調整背景濃度與風速後，尖峰時段自行車騎士的苯暴露比與汽機車混行的電動機車騎士低約40%（−39.99%），苯類合計低33%；PM2.5的差異則不顯著。',
      'After adjusting for background levels and wind, cyclists\' rush-hour benzene exposure was about 40% lower (−39.99%) than that of electric-scooter riders in the traffic lane, and total BTEX 33% lower; the PM2.5 difference was not significant.',
    ),
    period: t('2017年11月至2018年4月', 'November 2017 to April 2018'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Table 1 p.6, commuting-tool rows; Section 3.5 p.8',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '比較的是騎士在行進中的暴露，沒有量測在路口等候的人。作者把差異歸因於自行車可以走人行道或自行車道、在人行道上等燈，機車只能夾在車陣中，但沒有驗證；兩種車速不同（每小時10–15對25–30公里），也沒有隨機分配。研究沒有把苯歸因於機車。',
      'It compares riders on the move; nobody waiting at a crossing was measured. The authors attribute the gap to cyclists being able to use sidewalks or bike lanes and wait on the sidewalk while scooter riders are enclosed in traffic, but did not test it; speeds differed (10–15 vs 25–30 km/h) and modes were not randomised. The study does not attribute the benzene to scooters.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    research: 'papers/wu-2021-trd#bike-vs-scooter-btex; papers/wu-2021-trd#pm25-mode-diff-not-significant; papers/wu-2021-trd#no-btex-source-attribution',
  },
  'wu2021-station-correlation': {
    data: {
      pm25RLow: v(0.67, 'ratio', { note: 'correlation r, on-road vs station' }),
      pm25RHigh: v(0.86, 'ratio'),
      btexRLow: v(-0.01, 'ratio'),
      btexRHigh: v(0.38, 'ratio'),
    },
    display: t('苯類（BTEX）r = −0.01～0.38', 'BTEX r = −0.01 to 0.38'),
    statement: t(
      '在台北一項騎腳踏車與電動機車的研究（Wu 等，2021）中，騎士的PM2.5與附近測站相當一致（相關係數0.67至0.86），但苯類（BTEX）幾乎不相關（−0.01至0.38）；作者警告用測站資料評估通勤者的苯類暴露「可能造成偏差」。',
      'In a Taipei study of riders on bicycles and electric scooters (Wu et al., 2021), riders\' PM2.5 tracked nearby stations well (correlation 0.67–0.86) but their BTEX barely correlated with the station (−0.01 to 0.38); the authors warn that using station data for commuters\' BTEX exposure "might result in biased results".',
    ),
    period: t('2017年11月至2018年4月', 'November 2017 to April 2018'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Section 3.2, p.5 and p.7',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '苯類的比較只有萬華一座光化測站，PM2.5有四座一般測站；論文沒有列出測站的濃度，因此無法說街上的苯比測站高多少。',
      'BTEX was compared with a single photochemical station (Wanhua) and PM2.5 with four stations; the paper prints no station concentrations, so it cannot say how much higher street benzene is than at the station.',
    ),
    chainLink: 3,
    research: 'papers/wu-2021-trd#no-ambient-numbers',
  },
  'rush-hour-ratio-wu2021': {
    data: {
      ratioLow: v(1.26, 'ratio', { note: 'printed range of mean rush/non-rush ratios, 26 same-day pairs' }),
      ratioHigh: v(1.87, 'ratio'),
      benzene: v(1.87, 'ratio', { approx: true, note: 'Fig. 3 chart reading, 95% CI about 1.2-2.55' }),
      pm25: v(1.26, 'ratio', { approx: true, note: 'Fig. 3 chart reading, CI about 1.0-1.5' }),
    },
    display: t('苯約 1.9 倍（尖峰對離峰）', 'benzene about 1.9× (rush vs non-rush)'),
    statement: t(
      '在台北一項騎腳踏車與電動機車的研究（Wu 等，2021）中，同一天早上尖峰的污染暴露都顯著高於下午離峰，比值在1.26至1.87之間；從圖上讀取，苯約為1.9倍、PM2.5約1.3倍。',
      'In a Taipei study of riders on bicycles and electric scooters (Wu et al., 2021), morning rush-hour exposure was significantly higher than afternoon non-rush exposure on the same day for every pollutant, with ratios of 1.26 to 1.87; read from the figure, benzene was about 1.9 times and PM2.5 about 1.3 times.',
    ),
    period: t('2017年11月至2018年4月（26組同日配對）', 'November 2017 to April 2018 (26 same-day pairs)'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Section 3.3 p.7; Fig. 3 p.5',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '苯與PM2.5的個別倍數是從圖上讀取，不是論文印出的數字；比值是暴露的比值，自行車與電動機車騎士合併計算。',
      'The pollutant-specific ratios are read from the figure, not printed values; they are ratios of exposure, with cyclists and electric-scooter riders pooled.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    research: 'papers/wu-2021-trd#rush-vs-nonrush',
  },
  'wu2021-quiet-route': {
    data: {
      benzene: v(-33.2, 'percent', { note: 'Route C vs Route P, rush hour, adjusted, P<0.05' }),
      btex: v(-24.27, 'percent', { note: 'P<0.05' }),
      pm25: v(-27.7, 'percent', { note: 'P<0.05' }),
      pm25OneMinute: v(-28.1, 'percent', { note: 'P<0.001' }),
    },
    display: t('車少的巷弄路線：苯少 33%', 'side-street route: 33% less benzene'),
    statement: t(
      '在台北一項騎腳踏車與電動機車的研究（Wu 等，2021）中，走車流較少的巷弄路線，尖峰時段的苯暴露比主要幹道路線低33%（−33.20%）、PM2.5低28%（−27.7%），已調整背景濃度與風速。',
      'In a Taipei study of riders on bicycles and electric scooters (Wu et al., 2021), a quieter route along minor roads and alleys gave 33% less benzene (−33.20%) and 28% less PM2.5 (−27.7%) than the main-road route in rush hour, adjusted for background levels and wind.',
    ),
    period: t('2017年11月至2018年4月，尖峰時段', 'November 2017 to April 2018, rush hour'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Table 1 p.6, Route C rush hour; Section 3.4 p.8',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '離峰時段的苯與PM2.5差異不顯著。另一條街道狹窄、有高架橋的路線雖然車流較少，部分指標反而較高，作者認為街谷形狀也有影響。量測的是騎士，不是行人。',
      'Off-peak differences in benzene and PM2.5 were not significant. Another route with narrow streets and a viaduct had less traffic but higher readings on some measures, which the authors put down to street-canyon shape. Riders were measured, not pedestrians.',
    ),
    chainLink: 2,
    research: 'papers/wu-2021-trd#route-C-lower; papers/wu-2021-trd#route-B-A',
  },
  'traffic-count-pm25-contribution-wu2021': {
    data: {
      busTruckPerVehicle: v(0.29, 'ug/m3', { note: 'per vehicle per minute, joint model' }),
      carPerVehicle: v(0.01, 'ug/m3'),
      scooterPerVehicle: v(0.03, 'ug/m3'),
      busTruckContribution: v(0.1, 'ug/m3'),
      carContribution: v(0.1, 'ug/m3'),
      scooterContribution: v(0.28, 'ug/m3'),
      scootersPerMinute: v(8.56, 'count'),
      busTrucksPerMinute: v(0.35, 'count'),
    },
    display: t('每輛公車貨車的影響約為機車的 8～10 倍', 'per vehicle, buses and trucks 8–10× scooters'),
    statement: t(
      '台北一項騎腳踏車與電動機車的研究（Wu 等，2021）以錄影計算車流後發現，每多一輛公車或貨車經過，騎士的PM2.5增加量約為每多一輛機車的8至10倍；但機車數量多（每分鐘約8.56輛對0.35輛），在模型中合計貢獻最大，約0.28 µg/m³，相對於約25 µg/m³的平均暴露很小。',
      'Using video traffic counts, a Taipei study of riders on bicycles and electric scooters (Wu et al., 2021) found that each additional bus or truck raised riders\' PM2.5 roughly 8–10 times as much as each additional scooter; but scooters were far more numerous (about 8.56 against 0.35 per minute), so in the model they made the largest combined contribution, about 0.28 µg/m³, small against average exposure of about 25 µg/m³.',
    ),
    period: t('2017年11月至2018年4月', 'November 2017 to April 2018'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Section 3.6 p.9: separate models 0.41/0.04/0.05, joint 0.29/0.01/0.03 µg/m3 per vehicle per minute; counts 0.35/7.2/8.56; contributions 0.10/0.10/0.28',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這項車種歸因只做了PM2.5，沒有苯或苯類，所以這項研究沒有把苯歸因於機車。計數中的機車沒有區分燃油或電動。摘要說機車「可能」比公車貨車與小客車貢獻更多，是因為數量多，不是每輛排放較多。',
      'The vehicle-type attribution covers PM2.5 only, not benzene or BTEX, so the study does not attribute benzene to scooters. Counted scooters were not split into gasoline and electric. The abstract\'s "scooters could contribute more" than buses, trucks and cars is a matter of numbers, not of each scooter emitting more.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    alsoLinks: [1],
    research: 'papers/wu-2021-trd#per-vehicle-pm-increment; papers/wu-2021-trd#vehicle-contribution; papers/wu-2021-trd#no-btex-source-attribution',
  },
  'taipei-traffic-station-gap': {
    data: {
      traffic2017: v(18.2, 'ug/m3'),
      general2017: v(14.6, 'ug/m3'),
      traffic2024: v(11.2, 'ug/m3'),
      general2024: v(11.1, 'ug/m3'),
      gap2017: v(3.6, 'ug/m3', { derived: true }),
      gap2019: v(5.1, 'ug/m3', { derived: true, note: '19.2 − 14.1; largest gap 2017-2024' }),
      gap2024: v(0.1, 'ug/m3', { derived: true }),
    },
    display: t('差距 3.6 → 0.1 µg/m³', 'gap 3.6 → 0.1 µg/m³'),
    statement: t(
      '台北市交通測站的PM2.5年平均值歷年都高於一般測站；差距在2019年最大（5.1 µg/m³），2022年起明顯縮小，2024年只剩0.1 µg/m³。',
      "Taipei City's roadside (traffic) monitoring stations have recorded higher annual PM2.5 than its general stations every year; the gap was largest in 2019 (5.1 µg/m³), shrank markedly from 2022, and was 0.1 µg/m³ in 2024.",
    ),
    period: t('2017–2024年', '2017–2024'),
    place: TAIPEI,
    sources: ['taipei-epd-air-report-2024'],
    locator: 'Table 3-2-7 (automatic PM2.5): 2017 14.6/18.2 … 2024 11.1/11.2; text 「歷年交通測站…濃度皆高於一般測站」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '一般測站9站、交通測站3站，這些數字沒有扣除境外傳輸或特殊天氣的影響。年報內文的2024年數字（13.2／16.5）誤植為2021年數值，本站採用表3-2-7。',
      'Nine general and three traffic stations; data not adjusted for transboundary pollution or unusual weather. The report\'s own text gives 13.2/16.5 for 2024, which repeats the 2021 values; we use its Table 3-2-7.',
    ),
    chainLink: 3,
    research: '02 §4, Corrections #8',
  },
  'ufp-near-road-bands-chang2026': {
    data: {
      urbanRoadKerbside: v(40, 'um2/cm3', { approx: true, note: 'ground-level urban-road source alone, peak hours, 1.6 m' }),
      allSourceMaxWinter: v(65, 'um2/cm3', { note: 'near urban roads beneath expressways' }),
      allSourceMaxSummer: v(80, 'um2/cm3'),
      domainMeanWinter: v(15, 'um2/cm3'),
      domainMeanSummer: v(31, 'um2/cm3'),
    },
    display: t('路旁約 40 µm²/cm³（模式）', 'about 40 µm²/cm³ at the kerb (modelled)'),
    statement: t(
      '新北市中和一項計算流體力學模擬顯示，平面道路的車流在路緣與人行道形成狹窄的超細微粒高濃度帶（肺部沉積表面積約40 µm²/cm³），在數十公尺內迅速下降；整個1.2公里見方範圍的尖峰平均為15（冬）至31（夏），最高值65至80出現在高架道路下方的道路旁。',
      'A computational fluid-dynamics simulation of Zhonghe, New Taipei found that traffic on ground-level roads creates narrow kerbside and sidewalk bands of ultrafine particles (lung-deposited surface area about 40 µm²/cm³) that fall off within a few tens of metres; across the 1.2 km square the peak-hour average was 15 (winter) to 31 (summer), with maxima of 65–80 beside roads beneath elevated expressways.',
    ),
    period: t('2026年發表（模式情境：冬季與夏季的尖峰與離峰）', 'Published 2026 (modelled winter and summer, peak and off-peak)'),
    place: t('新北市中和區（1.2 × 1.2 公里模擬範圍）', 'Zhonghe, New Taipei City (1.2 × 1.2 km model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Abstract; Section 3.2 p.8 (about 40 from urban roads); Section 3.3 p.8 (means 15/31, maxima 65/80)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '純模式研究，沒有新的實測；機車只是三類車輛之一，沒有機車專屬的結果，排放係數來自隧道實驗，包含輪胎、煞車等非排氣微粒。模式中的排放是均勻的，沒有號誌、停等或怠速。微粒濃度的驗證在正文中只有定性描述。「約40」只是平面道路單一來源的值，最高值包含高架道路的貢獻。',
      'A pure modelling study with no new measurements; motorcycles are one of three vehicle classes with no motorcycle-specific result, and the tunnel-derived emission factors include non-exhaust particles. Emissions are uniform, with no signals, queues or idling. Particle validation is only qualitative in the main text. "About 40" is the ground-level road source alone; the maxima include elevated-road contributions.',
    ),
    requiresCaveat: true,
    chainLink: 2,
    research: 'papers/chang-hsiao-2026-jhm#source-height-ground-roads; papers/chang-hsiao-2026-jhm#domain-mean-and-max-sa; papers/chang-hsiao-2026-jhm#emission-inputs-vehicle-classes; papers/chang-hsiao-2026-jhm#ef-exhaust-and-nonexhaust',
  },
  'ufp-intersection-hotspots-chang2026': {
    data: {},
    display: t('路口匯流熱點（模式）', 'intersection hotspots (modelled)'),
    statement: t(
      '在新北市中和的超細微粒模擬（Chang 與 Hsiao，2026）中，兩條道路的廢氣在主要路口匯合，形成明顯的熱點；這來自道路配置，模式並沒有模擬紅燈停等或怠速。',
      'In a simulation of ultrafine particles in Zhonghe, New Taipei (Chang and Hsiao, 2026), exhaust plumes from two crossing streets converge at major intersections, creating pronounced hotspots; this comes from street layout, since the model does not simulate red-light queues or idling.',
    ),
    period: t('2026年發表', 'Published 2026'),
    place: t('新北市中和區（模擬範圍）', 'Zhonghe, New Taipei City (model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Section 3.2 p.8; Eq. 15 (uniform line-source flux)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '正文沒有單獨的路口濃度數值。在一處繁忙的T字路口，模式顯示平面道路是主要來源；在高架道路下方的街谷，約一半以上的模式風險來自高架道路（從論文的圖上讀出來的約略值）。',
      'The main text gives no separate intersection value. At one busy T-junction the model shows the street itself as the main source; in canyons beneath viaducts roughly half or more of the modelled risk came from the elevated road (figure reading, approximate).',
    ),
    chainLink: 2,
    research: 'papers/chang-hsiao-2026-jhm#intersection-hotspots; papers/chang-hsiao-2026-jhm#intersection-F-elcr; papers/chang-hsiao-2026-jhm#hotspot-urban-road-share-added',
  },
  'ufp-child-risk-indicator-chang2026': {
    data: {
      child9WinterMax: v(4.5e-4, 'lifetime-excess-risk', { approx: true }),
      child9SummerMax: v(6.5e-4, 'lifetime-excess-risk', { approx: true }),
      adultWinterMax: v(2.2e-4, 'lifetime-excess-risk', { approx: true }),
      adultSummerMax: v(3.0e-4, 'lifetime-excess-risk', { approx: true }),
      childToAdult: v(2.1, 'ratio', { approx: true, derived: true, note: '4.5/2.2 = 2.05; 6.5/3.0 = 2.17' }),
    },
    display: t('9歲兒童約為成人的 2 倍（模式指標）', '9-year-olds about 2× adults (modelled indicator)'),
    statement: t(
      '在新北市中和的超細微粒模擬（Chang 與 Hsiao，2026）中，濃度最高的地點，9歲兒童的終身超額致癌風險指標約為成人的兩倍（冬季約萬分之4.5對萬分之2.2），原因是模式假設兒童每公斤體重吸入較多空氣、肺部沉積率較高；作者稱之為潛在風險指標，不是發生率預測。',
      'In a simulation of ultrafine particles in Zhonghe, New Taipei (Chang and Hsiao, 2026), a 9-year-old at the worst locations had about twice the adult lifetime excess cancer risk indicator (winter about 4.5 against 2.2 in 10,000), because the model assumes children breathe more air per kilogram and deposit more particles in the lung; the authors call it a potential risk indicator, not a prediction of incidence.',
    ),
    period: t('2026年發表（模式情境）', 'Published 2026 (modelled scenarios)'),
    place: t('新北市中和區（模擬範圍）', 'Zhonghe, New Taipei City (model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Section 3.4 p.11; Fig. 8; Section 4 p.13 (authors\' caveat)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這些是模擬範圍中少數熱點的最大值，沒有不確定範圍；多數地點遠低於此。致癌斜率因子來自同一研究團隊的台北微粒金屬成分研究，作者自己也說超細微粒的致癌強度在科學上仍不確定。兒童的倍數來自生理假設，不是觀察到的健康結果，不是任何一個孩子的風險。',
      'These are maxima at a minority of hotspot locations, with no uncertainty ranges; most of the domain is far lower. The cancer slope factor comes from a Taipei trace-metal study by the same group, and the authors say the carcinogenic potency of ultrafine particles remains scientifically uncertain. The child multiple comes from physiological assumptions, not observed outcomes; it is not the risk of any particular child.',
    ),
    requiresCaveat: true,
    chainLink: 6,
    editorNote: 'Never present the child multiple as an individual child\'s risk.',
    research: 'papers/chang-hsiao-2026-jhm#child-elcr; papers/chang-hsiao-2026-jhm#child-mechanism; papers/chang-hsiao-2026-jhm#risk-method-slope-factor; papers/chang-hsiao-2026-jhm#authors-uncertainty-statement; papers/chang-hsiao-2026-jhm#fig8-distribution-added',
  },
  'ufp-traffic-cut-chang2026': {
    data: {
      emissionCut: v(28, 'percent', { approx: true }),
      domainMeanCut: v(32, 'percent', { approx: true }),
      nearRoadCut: v(35, 'percent', { bound: 'gt', note: 'local reductions can exceed 35-40% near major urban roads' }),
    },
    display: t('排放少 28%，平均暴露少 32%（模式）', '28% less emission, 32% less average exposure (modelled)'),
    statement: t(
      '新北市中和的超細微粒模擬（Chang 與 Hsiao，2026）比較尖峰與離峰：交通排放平均少約28%時，整個範圍的超細微粒暴露平均少約32%，主要道路旁可少35%至40%以上；這是車流量的時段差異，不是電動化情境。',
      'Comparing peak and off-peak hours in a simulation of ultrafine particles in Zhonghe, New Taipei (Chang and Hsiao, 2026), traffic emissions about 28% lower gave about 32% lower average ultrafine-particle exposure across the domain, and more than 35–40% lower beside major roads; this is a time-of-day traffic-volume difference, not an electrification scenario.',
    ),
    period: t('2026年發表（模式情境）', 'Published 2026 (modelled scenarios)'),
    place: t('新北市中和區（模擬範圍）', 'Zhonghe, New Taipei City (model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Section 3.3 p.8 (32%); p.10 (28%, 35-40%)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '論文沒有模擬電動化，也沒有改變路上各類車輛比例的情境，更沒有提到電動機車；模擬的排放包含非排氣微粒，電動化不會全部消除。',
      'The paper has no electrification or fleet-mix scenario and never mentions electric vehicles; the modelled emissions include non-exhaust particles that electrification would not remove.',
    ),
    chainLink: 7,
    research: 'papers/chang-hsiao-2026-jhm#peak-offpeak-reduction; papers/chang-hsiao-2026-jhm#mitigation-suggestions',
  },
  'national-pm25-trend': {
    data: {
      y2019: v(16.2, 'ug/m3'),
      y2025: v(12.6, 'ug/m3', { note: 'preliminary, data to 3 December 2025' }),
      improvement: v(22, 'percent', { approx: true, derived: true, note: '(16.2 − 12.6) / 16.2 = 22.2%' }),
    },
    display: t('16.2 → 12.6 µg/m³', '16.2 → 12.6 µg/m³'),
    statement: t(
      '據聯合新聞網報導的環境部初步統計，全國PM2.5年平均濃度2019年為16.2 µg/m³，2025年（統計至12月3日）降到12.6 µg/m³。',
      'According to a United Daily News report of the environment ministry\'s preliminary statistics, Taiwan\'s national annual mean PM2.5 was 16.2 µg/m³ in 2019 and 12.6 µg/m³ in 2025 (data to 3 December).',
    ),
    period: t('2019年與2025年（初步統計，至12月3日）', '2019 and 2025 (preliminary, to 3 December)'),
    place: TW,
    sources: ['udn-national-pm25-trend'],
    locator: '「全國細懸浮微粒（PM2.5）年平均濃度已降至12.6 μg/m3（統計至12月3日），相較2019年的16.2 μg/m3顯著改善」 (UDN, 2025-12-31)',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '數字出自媒體轉述的環境部初步統計，2025年只統計到12月3日；我們沒有核對環境部的原始統計。這是全國所有來源的PM2.5平均，不是路口或路邊的濃度。',
      'From a media report of MOENV\'s preliminary statistics; the 2025 figure runs only to 3 December, and we have not checked it against MOENV\'s own release. It is the national average of PM2.5 from all sources, not the level at a crossing or the kerb.',
    ),
    editorNote: 'Re-based 2026-11-26: the research held only a search summary (16.2 → 12.8, "21%"); the UDN article, opened, gives 12.6 to 3 Dec and no percentage. A ~22% fall is our arithmetic; do not print "21%".',
    requiresCaveat: true,
    chainLink: 3,
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
      '台灣的空氣品質標準規定PM2.5年平均值為12 µg/m³、24小時值為30 µg/m³。',
      "Taiwan's legal air quality standard for PM2.5 is 12 µg/m³ as an annual average and 30 µg/m³ over 24 hours.",
    ),
    period: t('2024年9月30日修正發布', 'As amended 30 September 2024'),
    place: TW,
    sources: ['moenv-air-quality-standards'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '這是環境空氣的法定標準，以測站的長時間平均來判斷，不是用來評估路口幾秒鐘或幾分鐘的濃度；WHO的年平均指引值更低，為5 µg/m³。',
      'This is the legal standard for ambient air, judged on long averages at monitoring stations; it is not a yardstick for the seconds or minutes spent at a crossing. WHO\'s annual guideline is lower, at 5 µg/m³.',
    ),
    chainLink: 3,
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
      '台灣的一氧化碳標準為1小時31 ppm、8小時9 ppm；二氧化氮為1小時0.100 ppm、年平均0.021 ppm。',
      "Taiwan's carbon monoxide standard is 31 ppm over 1 hour and 9 ppm over 8 hours; for nitrogen dioxide it is 0.100 ppm hourly and 0.021 ppm annually.",
    ),
    period: t('2024年9月30日修正發布', 'As amended 30 September 2024'),
    place: TW,
    sources: ['moenv-air-quality-standards'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '台灣標準的氣體以ppm表示，WHO以µg/m³或mg/m³表示，單位不同，不能直接比大小。',
      'Taiwan states gas standards in ppm while WHO uses µg/m³ or mg/m³; the units differ, so the numbers cannot be compared directly.',
    ),
    chainLink: 3,
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
    readerKind: 'official',
    caveat: t(
      'WHO指引是建議值，不具法律效力；24小時值是第99百分位數（每年可超過3至4天）。',
      'WHO guidelines are recommendations, not legal limits; the 24-hour value is a 99th percentile (3–4 exceedance days a year).',
    ),
    chainLink: 3,
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
    readerKind: 'official',
    caveat: t(
      '過渡目標是給污染較重的地方逐步改善用的階段目標，不是安全值；WHO的指引值是5 µg/m³。',
      'Interim targets are steps for places with heavier pollution to work towards, not safe levels; the WHO guideline itself is 5 µg/m³.',
    ),
    chainLink: 3,
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
    sources: ['who-2021-aqg', 'who-2010-indoor-air-guidelines'],
    locator: 'Table 0.1 (NO2 10/25 µg/m3, CO 4 mg/m3 24-h); Table 0.2 (CO 8-h 10, 1-h 35, 15-min 100 mg/m3, not re-evaluated)',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    readerPlace: 'international',
    caveat: t(
      '一氧化碳的8小時、1小時與15分鐘值（10、35、100 mg/m³）沿用舊版，2021年未重新評估。',
      'The 8-hour, 1-hour and 15-minute CO values (10, 35 and 100 mg/m³) carry over from earlier guidelines and were not re-evaluated in 2021.',
    ),
    chainLink: 3,
    editorNote: 'Lane A check of the 15-minute value (brief section 11), 2026-11-26: the value 100 mg/m3 rests on two WHO texts read at the primary source by earlier verifiers, the 2021 guidelines Table 0.2 (research/03-health.md §2, file 03 opened the IRIS PDF) and the 2010 indoor-air guidelines (research/redlight/smell-chemistry.json#who-co-benzene, PDF opened, CO values listed: 100 mg/m3 15 min, 35 mg/m3 1 h, 10 mg/m3 8 h). Re-opening both today was blocked (IRIS returns a JavaScript shell, NCBI Bookshelf a reCAPTCHA, the afro.who.int mirror HTTP 502), so the confidence rests on those recorded readings. Slot who.co15min_ppm = 100 / 1.146 = 87.3, printed 87.',
    research: '03 §2; redlight/smell-chemistry#who-co-benzene',
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
    readerKind: 'official',
    caveat: t(
      '每立方公分10,000個的界線是WHO用來區分高低濃度的良好作法說明，不是健康指引值；WHO表示證據不足以訂定數值。',
      'The 10,000 particles/cm³ line is a WHO good-practice statement for telling high from low concentrations, not a health guideline; WHO says the evidence is too thin to set a value.',
    ),
    chainLink: 4,
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
    readerKind: 'official',
    caveat: t(
      '這是以歐洲研究為主的區域指引，針對所有道路交通而非機車；台灣一項幼兒研究中，道路噪音與氣喘盛行率沒有顯著關聯。',
      'A European guideline built mostly on European studies, covering all road traffic rather than scooters; in one Taiwanese kindergarten study road noise was not significantly associated with asthma prevalence.',
    ),
    chainLink: null,
    research: '03 §9',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// hazard: IARC classifications and what exhaust contains
// ---------------------------------------------------------------------------

const hazard = {
  'iarc-gasoline-exhaust-2b': {
    data: {},
    display: t('第 2B 級', 'Group 2B'),
    statement: t(
      '國際癌症研究機構（IARC）把汽油引擎廢氣列為「可能對人類致癌」（第2B級），自1989年評估以來未變。',
      'The International Agency for Research on Cancer (IARC) classifies gasoline engine exhaust as "possibly carcinogenic to humans" (Group 2B), unchanged since its 1989 evaluation.',
    ),
    period: t('2012年重新評估（專論第105卷）', 'Re-evaluated 2012 (Monographs Vol. 105)'),
    place: NOT_PLACE,
    sources: ['iarc-pr213-2012', 'lancet-onc-2012-exhausts'],
    locator: 'PR 213: "The Working Group concluded that gasoline exhaust was possibly carcinogenic to humans (Group 2B), a finding unchanged from the previous evaluation in 1989."',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '第2B級比柴油廢氣的第1級弱；柴油廢氣的分級，不能套用在燃油機車（汽油引擎）的廢氣上。國際癌症研究機構分級的是危害，不是日常暴露量下的風險。',
      'Group 2B is weaker than diesel exhaust\'s Group 1; the diesel classification does not apply to gasoline scooter exhaust. IARC classifies hazard, not the risk at everyday doses.',
    ),
    requiresCaveat: true,
    chainLink: 4,
    editorNote: 'Never apply the diesel Group 1 classification to scooters.',
    research: '03 §1a',
  },
  'iarc-diesel-exhaust-group1': {
    data: {},
    display: t('第 1 級', 'Group 1'),
    statement: t(
      'IARC把柴油引擎廢氣列為「對人類致癌」（第1級），依據是暴露與肺癌風險增加有關的充分證據。',
      'IARC classifies diesel engine exhaust as "carcinogenic to humans" (Group 1), based on sufficient evidence that exposure is associated with an increased risk of lung cancer.',
    ),
    period: t('2012年（專論第105卷）', '2012 (Monographs Vol. 105)'),
    place: NOT_PLACE,
    sources: ['iarc-pr213-2012', 'lancet-onc-2012-exhausts'],
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '這一列只是對照：台灣的機車幾乎都是汽油引擎，柴油的分級不適用於機車廢氣。',
      'For contrast only: Taiwan\'s scooters are almost all gasoline-engined, so the diesel classification does not apply to scooter exhaust.',
    ),
    requiresCaveat: true,
    chainLink: 4,
    research: '03 §1a',
  },
  'iarc-outdoor-air-pollution-group1': {
    data: {},
    display: t('第 1 級', 'Group 1'),
    statement: t(
      'IARC把室外空氣污染及其中的懸浮微粒列為「對人類致癌」（第1級），因為有充分證據顯示會導致肺癌。',
      'IARC classifies outdoor air pollution, and the particulate matter in it, as "carcinogenic to humans" (Group 1) because there is sufficient evidence that it causes lung cancer.',
    ),
    period: t('2013年（專論第109卷）', '2013 (Monographs Vol. 109)'),
    place: NOT_PLACE,
    sources: ['iarc-pr221-2013', 'lancet-onc-2013-outdoor-air'],
    locator: 'PR 221: "there is sufficient evidence that exposure to outdoor air pollution causes lung cancer (Group 1)"; PM "was also classified as carcinogenic to humans (Group 1)"',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '這是IARC對一般室外空氣污染的結論；機車廢氣是其中一部分來源，但IARC沒有量化機車的比例。',
      'This is IARC\'s conclusion about outdoor air pollution in general; scooter exhaust is one contributing source, but IARC does not quantify its share.',
    ),
    chainLink: 4,
    research: '03 §1a',
  },
  'iarc-benzene-group1': {
    data: {},
    display: t('第 1 級', 'Group 1'),
    statement: t(
      'IARC把苯列為「對人類致癌」（第1級），苯會導致成人急性骨髓性白血病；苯存在於汽油與汽油引擎廢氣中。',
      'IARC classifies benzene, found in gasoline and gasoline exhaust, as "carcinogenic to humans" (Group 1); it causes acute myeloid leukaemia in adults.',
    ),
    period: t('2017年評估，2018年出版（專論第120卷）', 'Evaluated 2017, published 2018 (Monographs Vol. 120)'),
    place: NOT_PLACE,
    sources: ['iarc-vol120-benzene', 'lancet-onc-2017-benzene'],
    locator: 'Vol. 120 §6: "Benzene is carcinogenic to humans (Group 1)." "Benzene causes acute myeloid leukaemia in adults."',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      'IARC分類的是危害，不是日常暴露量下的風險；也沒有量化機車廢氣中苯造成的風險。',
      'IARC classifies hazard, not the risk at everyday doses, and does not quantify the risk from benzene in scooter exhaust.',
    ),
    chainLink: 4,
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
    caveat: t(
      'WHO說明的是一般PM2.5的作用，不是專指機車廢氣，也沒有說多少量才會產生影響。',
      'WHO describes what PM2.5 in general can do; it is not specific to scooter exhaust and does not say how much exposure it takes.',
    ),
    chainLink: 4,
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
      '美國健康效應研究所（HEI）2022年回顧了353篇研究。長期暴露在交通相關的空氣污染裡，與全死因死亡、循環系統疾病死亡、缺血性心臟病死亡、肺癌死亡、兒童和成人氣喘發病，以及兒童急性下呼吸道感染有關；HEI對這些關聯的信心是「高」或「中高」。',
      'A 2022 Health Effects Institute review of 353 studies found high or moderate-to-high confidence that long-term exposure to traffic-related air pollution is associated with death from all causes, circulatory disease, ischaemic heart disease and lung cancer, with asthma onset in children and adults, and with acute lower respiratory infections in children.',
    ),
    period: t('2022年（10月14日更新）', '2022 (updated 14 October)'),
    place: t('國際（以歐洲與北美研究為主）', 'International (mostly European and North American studies)'),
    sources: ['hei-sr23-2022'],
    locator: 'Executive summary: "The Panel found a high or moderate-to-high level of confidence in an association between long-term exposure to TRAP and..."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是對「關聯」的信心評估，HEI明言未評估因果；研究多在歐美（亞洲只有41篇），且多在暴露水準比現今高的年代進行；肺功能不在評估結果之列。這一項依HEI的執行摘要，我們沒有讀完整報告。',
      'This rates confidence in association; HEI states it did not assess causality. Most studies were European or North American (41 from Asia), many from times of higher exposure than today, and lung function was not among the outcomes. Based on HEI\'s executive summary; we did not read the full report.',
    ),
    chainLink: 5,
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
    chainLink: 5,
    alsoLinks: [6],
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
      '這是一般空氣污染（特別是二氧化氮與黑碳等交通相關指標）的結論，並非針對機車；它不代表某個孩子的氣喘是機車造成的。' + ABSTRACT_ONLY['zh-TW'],
      'A conclusion about air pollution in general (especially traffic-related markers such as NO₂ and black carbon), not scooters; it does not mean any particular child\'s asthma was caused by scooters. ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 5,
    alsoLinks: [6],
    research: '03 §6',
  },
  'aha-2010-pm25-cardiovascular': {
    data: {},
    display: t('數小時至數週', 'hours to weeks'),
    statement: t(
      '美國心臟學會的科學聲明指出，暴露於PM2.5（所有來源）數小時至數週就可能誘發心血管事件；整體證據符合「PM2.5會引發心血管疾病」的因果解釋。',
      'The American Heart Association concluded that exposure to PM2.5 (from all sources) over a few hours to weeks can trigger cardiovascular events, and that the overall evidence is consistent with a causal relationship with cardiovascular illness and death.',
    ),
    period: t('2010年', '2010'),
    place: t('國際（以美國研究為主）', 'International (mostly US studies)'),
    sources: ['brook-2010-circulation'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '指一般環境PM2.5，不針對機車廢氣，也不涵蓋幾分鐘的短暫高峰；「數小時至數週」是聲明涵蓋的最短時間尺度。' + ABSTRACT_ONLY['zh-TW'],
      'Refers to ambient PM2.5 in general, not scooter exhaust, and not to minutes-long peaks; "hours to weeks" is the shortest window the statement addresses. ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 5,
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
      'WHO 2021年的空氣品質指引引用一項較早（2018年）的估計：全球每年約有700萬人的死亡可歸因於室外與室內空氣污染的共同影響；只計室外空氣污染的估計則在400萬至900萬之間。',
      'WHO\'s 2021 air quality guidelines cite an earlier (2018) estimate that around 7 million deaths a year worldwide are attributable to the combined effects of outdoor and household air pollution; estimates for outdoor air pollution alone range from 4 million to 9 million.',
    ),
    period: t('2021年指引引用的估計', 'Estimates cited in the 2021 guidelines'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: '§1.3.3: "around 7 million deaths ... attributable to the joint effects of ambient and household air pollution (WHO, 2018)"; "between 4 million and 9 million deaths annually"',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '700萬是室外加室內（家戶）空氣污染的合計，不是只有室外；這是2018年的估計，WHO較新的資料頁（2024年）給的合計是約670萬人。',
      'The 7 million combines outdoor and household air pollution; it is not outdoor air alone. It is a 2018 estimate; WHO\'s newer fact sheet (2024) gives a combined figure of about 6.7 million.',
    ),
    editorNote: 'Prefer the newer WHO figure (facts-redlight who-ambient-deaths-2019: 4.2 million ambient, 6.7 million combined). Keep this row only as the figure the 2021 guidelines cite.',
    requiresCaveat: true,
    chainLink: 5,
    research: '03 §2',
  },
  'chuang2020-cardiovascular-association': {
    data: {
      exposureHours: v(1, 'hours', { note: 'duration of each measured exposure: a fixed one-hour commute window, 09:00-10:00' }),
      participants: v(120, 'people'),
      walkingIqr: v(24.4, 'ug/m3', { note: 'increment behind the walking estimates (IQR of walking PM2.5)' }),
      walkingSbp: v(6.5, 'percent', { low: 3.3, high: 9.7 }),
      walkingHr: v(3.4, 'percent', { low: 0.1, high: 3.5, note: 'CI as printed; asymmetric, possibly a typo' }),
      walking8ohdg: v(8.1, 'percent', { low: 0.7, high: 8.8, note: 'CI as printed; asymmetric' }),
      walkingDbp: v(-3.4, 'percent', { low: -5.2, high: -1.6, note: 'unstarred, not discussed by the authors' }),
    },
    display: t('步行：收縮壓 +6.5%（每 24.4 µg/m³）', 'walking: systolic +6.5% (per 24.4 µg/m³)'),
    statement: t(
      '在台北120位健康年輕人的通勤研究（Chuang 等，2020）中，步行時個人PM2.5（所有來源）每高出24.4 µg/m³（一個四分位距），同一小時內的收縮壓高6.5%、心跳高3.4%、尿中氧化性DNA損傷指標（8-OHdG）高8.1%，都有統計顯著；搭捷運時沒有顯著關聯。',
      'In a Taipei study of 120 healthy young commuters (Chuang et al., 2020), each 24.4 µg/m³ (one interquartile range) of higher personal PM2.5 from all sources while walking was associated, in the same hour, with 6.5% higher systolic blood pressure, 3.4% higher heart rate and 8.1% higher urinary 8-OHdG, a marker of oxidative DNA damage, all statistically significant; on the subway there was no significant association.',
    ),
    period: t('上午9至10點；2017年2月至2019年12月', '09:00–10:00; February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 2 p.3, Model 6 (walking) and Model 2 (subway); IQR from Table 1',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '120位健康年輕成人、早上一小時；走路時的體力活動沒有量測也沒有調整，作者自己說這會干擾結果。把六種通勤方式合在一起算，只有尿液裡的8-OHdG（一種氧化壓力指標）有統計上的差別。心跳與8-OHdG的信賴區間前後不對稱，可能是印刷錯誤；舒張壓的關聯是負的，作者沒有標示，也沒有討論。這是短暫的生理變化，不是疾病。戴口罩步行時，血壓與心跳沒有顯著關聯，但8-OHdG仍有（+2.3%）。' + ASSOCIATION_TW['zh-TW'],
      '120 healthy young adults, one morning hour; physical exertion was neither measured nor adjusted for, which the authors say confounds the results. With all six modes pooled, only urinary 8-OHdG (a marker of oxidative stress) differed significantly. The heart-rate and 8-OHdG intervals are lopsided, possibly a typo; diastolic pressure showed a negative association that the authors neither marked nor discussed. These are transient physiological changes, not disease. Walking with a respirator mask, blood pressure and heart rate showed no significant association, but 8-OHdG did (+2.3%). ' + ASSOCIATION_TW.en,
    ),
    requiresCaveat: true,
    chainLink: 5,
    research: 'papers/chuang-2020-aex#effect-walking; papers/chuang-2020-aex#effect-subway; papers/chuang-2020-aex#effect-facemask; papers/chuang-2020-aex#covariates; papers/chuang-2020-aex#commute-duration-context',
  },
  'chuang2020-scooter-effect-per-iqr': {
    data: {
      exposureHours: v(1, 'hours', { note: 'duration of each measured exposure: a fixed one-hour commute window, 09:00-10:00' }),
      scooterIqr: v(41.7, 'ug/m3'),
      sbp: v(7.9, 'percent', { low: 0.9, high: 14.9 }),
      hr: v(6.4, 'percent', { low: 2.6, high: 10.2 }),
      ohdg: v(8.9, 'percent', { low: 2.6, high: 15.2 }),
      dbp: v(0.6, 'percent', { low: -11.9, high: 13.1, note: 'not significant' }),
    },
    display: t('騎機車：收縮壓 +7.9%（每 41.7 µg/m³）', 'scooter: systolic +7.9% (per 41.7 µg/m³)'),
    statement: t(
      '在台北120位健康年輕人的通勤研究（Chuang 等，2020）中，騎燃油機車的人個人PM2.5每高出41.7 µg/m³（騎士自己的四分位距），同一小時內收縮壓高7.9%、心跳高6.4%、8-OHdG（氧化壓力指標）高8.9%；舒張壓沒有顯著關聯。這是騎士，不是行人。',
      'In a Taipei study of 120 healthy young commuters (Chuang et al., 2020), among gasoline-scooter riders each 41.7 µg/m³ (the riders\' own interquartile range) of higher personal PM2.5 was associated, in the same hour, with 7.9% higher systolic pressure, 6.4% higher heart rate and 8.9% higher 8-OHdG; diastolic pressure showed no significant association. These are riders, not pedestrians.',
    ),
    period: t('上午9至10點；2017年2月至2019年12月', '09:00–10:00; February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 2 p.3, Model 5',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '各方式的增量不同（騎機車41.7、步行24.4），不能把百分比拿來互相比較，也不是「每1 µg/m³」或「每10 µg/m³」。收縮壓的區間下限0.9很接近零；體力活動與噪音（騎機車平均89.3分貝）會干擾結果。' + ASSOCIATION_TW['zh-TW'],
      'Each mode has its own increment (scooter 41.7, walking 24.4), so the percentages cannot be compared across modes, and they are not "per 1" or "per 10 µg/m³". The systolic interval\'s lower bound (0.9) is close to zero; exertion and noise (mean 89.3 dBA on scooters) confound the results. ' + ASSOCIATION_TW.en,
    ),
    requiresCaveat: true,
    chainLink: 5,
    research: 'papers/chuang-2020-aex#effect-scooter; papers/chuang-2020-aex#noise; papers/chuang-2020-aex#commute-duration-context',
  },
  'chuang2020-pooled-model': {
    data: {
      ohdg: v(4.7, 'percent', { low: 3.7, high: 5.7 }),
      sbp: v(2.4, 'percent', { low: -2.9, high: 7.7 }),
      hr: v(0.9, 'percent', { low: -11.7, high: 13.5 }),
    },
    display: t('六種方式合併：只有 8-OHdG 顯著', 'all modes pooled: only 8-OHdG significant'),
    statement: t(
      '台北120位健康年輕人的通勤研究（Chuang 等，2020）把六種通勤方式的720次量測合併分析時，PM2.5只與8-OHdG（氧化壓力指標）顯著有關（+4.7%），與血壓及心跳的關聯都不顯著。',
      'When a Taipei study of 120 healthy young commuters (Chuang et al., 2020) pooled all 720 measurements across the six commuting modes, PM2.5 was significantly associated only with 8-OHdG (+4.7%), not with blood pressure or heart rate.',
    ),
    period: t('2017年2月至2019年12月', 'February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 2 p.3, Model 1',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('論文沒有說明合併模型用的增量；摘要沒有提到這個結果。8-OHdG只是氧化壓力指標，不是疾病。', 'The paper does not state the pooled model\'s increment, and the abstract does not report this result. 8-OHdG is an oxidative-stress marker, not disease.'),
    chainLink: 5,
    research: 'papers/chuang-2020-aex#effect-pooled; papers/chuang-2020-aex#dbp-no-effect',
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
      '一項追蹤24,544名台灣兒童、青少年與年輕人的研究發現，兩年平均PM2.5（所有來源）每增加10 µg/m³，與肺功能指標約低2%至3%有關。',
      'A study of 24,544 Taiwanese children, adolescents and young adults found that each 10 µg/m³ increase in two-year average PM2.5 (all sources) was associated with about 2–3% lower lung function.',
    ),
    period: t('2000–2014年', '2000–2014'),
    place: TW,
    sources: ['guo-2019-ehp'],
    locator: 'Abstract: "decreases of 2.22% [95% CI: -2.60, -1.85], 2.94 (95% CI: -3.36, -2.51), and 2.79% (95% CI: -3.15, -2.41) in the FVC, FEV1, and MMEF"; OR 1.20 (1.12, 1.29)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      ASSOCIATION_TW['zh-TW'] + ABSTRACT_ONLY['zh-TW'],
      ASSOCIATION_TW.en + ' ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 6,
    editorNote: 'Do not call this the Taiwan Children Health Study (TCHS) cohort.',
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
      '一項針對彰化工業區附近4,736名學童的研究發現，長期PM2.5（所有來源）暴露較高與醫師診斷的氣喘較多、呼氣一氧化氮（呼吸道發炎指標）較高有關。',
      'A study of 4,736 schoolchildren near industrial areas in Changhua found that higher long-term PM2.5 exposure (all sources) was associated with more physician-diagnosed asthma and higher exhaled nitric oxide, a marker of airway inflammation.',
    ),
    period: t('2025年發表（2024年1月線上刊出）', 'Published 2025 (online January 2024)'),
    place: t('彰化縣燃煤電廠等工業區附近六鄉鎮', 'Six townships near industrial areas (incl. coal-fired power plants), Changhua'),
    sources: ['tsai-2025-pedres'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '橫斷面研究，背景是工業與燃煤電廠而非機車；摘要沒有說明勝算比1.595對應多少PM2.5增量，所以它不是「每1 µg/m³」的數字。' + ASSOCIATION_TW['zh-TW'] + ABSTRACT_ONLY['zh-TW'],
      'Cross-sectional, in an industrial and coal-power setting rather than a scooter one; the abstract does not state the PM2.5 increment behind the odds ratio of 1.595, so it is not a "per 1 µg/m³" figure. ' + ASSOCIATION_TW.en + ' ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 6,
    editorNote: 'Never write the odds ratio as "per 1 µg/m³".',
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
      '橫斷面研究，使用測站資料，暴露水準是2000至2001年的；作者的結論說得比數字強（氮氧化物並不顯著），所以這裡看的是實際數字，不是標題。研究量的是一氧化碳、臭氧、氮氧化物與PM10，不是PM2.5；測站的污染來自所有來源，沒有單獨區分機車廢氣。' + ABSTRACT_ONLY['zh-TW'],
      'Cross-sectional, using monitoring-station data at 2000–2001 exposure levels; the authors\' conclusion is stronger than their data (NOx was not significant), so the numbers matter more than the headline. It used carbon monoxide, ozone, nitrogen oxides and PM10, not PM2.5; station pollution comes from all sources and does not isolate scooter exhaust. ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 6,
    editorNote: 'Quote the numbers, not the paper title.',
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
      '新北市11所幼兒園3,246名幼兒的研究發現，PM2.5與PM10（所有來源）較高與氣喘盛行率較高有關；二氧化氮與道路噪音則沒有顯著關聯。',
      'A study of 3,246 children at 11 kindergartens in New Taipei found higher PM2.5 and PM10 (all sources) associated with higher asthma prevalence; nitrogen dioxide and road traffic noise showed no significant association.',
    ),
    period: t('2023年發表', 'Published 2023'),
    place: t('新北市', 'New Taipei City'),
    sources: ['cho-2023-chemosphere'],
    locator: 'Abstract: IQR PM2.5 (1.17 µg/m3) 1.34-fold (1.05–1.70); PM10 (10.69) 1.17-fold (1.01–1.36)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '橫斷面的「盛行率」研究；摘要用了「caused」一詞，但研究設計只能顯示關聯。' + ASSOCIATION_TW['zh-TW'] + ABSTRACT_ONLY['zh-TW'],
      'A cross-sectional prevalence study; the abstract says "caused", but the design can only show association. ' + ASSOCIATION_TW.en + ' ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 6,
    research: '03 §3a',
  },
  'lin2024-asthma-lung-function': {
    data: { patients: v(675, 'people') },
    display: t('675 名氣喘患者', '675 asthma patients'),
    statement: t(
      '一項台灣醫學中心675名氣喘患者的研究發現，PM10、PM2.5與二氧化氮暴露（所有來源）與早發型氣喘患者的肺功能較差有關。',
      'A study of 675 asthma patients at a Taiwanese medical centre found PM10, PM2.5 and NO₂ exposure (all sources) associated with lower lung function in patients with early-onset asthma.',
    ),
    period: t('2024年發表', 'Published 2024'),
    place: t('台灣一所醫學中心', 'One medical centre, Taiwan'),
    sources: ['lin-2024-jaa'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '單一醫學中心的成人患者橫斷面研究。' + ASSOCIATION_TW['zh-TW'] + ABSTRACT_ONLY['zh-TW'],
      'Cross-sectional, adult patients at one medical centre. ' + ASSOCIATION_TW.en + ' ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 5,
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
      '研究年代久遠，只有一條高速公路，暴露只以距離衡量，沒有量測污染物；國際回顧（HEI）對早產的證據信心為「低」。' + ABSTRACT_ONLY['zh-TW'],
      'An old study of one freeway, with exposure measured only by distance and no pollutant measurements; the international HEI review rates confidence for preterm birth as low. ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 6,
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
      '肺癌是台灣癌症死因的首位，2025年肺癌死亡率為每十萬人46.4人；男性與女性的癌症死因首位都是肺癌。',
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
    chainLink: 5,
    research: '03 §3d',
  },
  'tseng2019-never-smokers': {
    data: {
      neverSmokedShare: v(53, 'percent'),
      patients: v(371084, 'people'),
      maleEverSmokers1995: v(59.4, 'percent', { note: 'proportion of male adult ever-smokers' }),
      maleEverSmokers2015: v(29.9, 'percent'),
      adenoMale1995: v(9.06, 'per-100k'),
      adenoMale2015: v(23.25, 'per-100k'),
      adenoFemale1995: v(7.05, 'per-100k'),
      adenoFemale2015: v(24.22, 'per-100k'),
    },
    display: t('53% 從未吸菸', '53% never smoked'),
    statement: t(
      '一項分析371,084名台灣肺癌患者的研究發現，53%從未吸菸；1995至2015年間，曾吸菸的成年男性比例從59.4%降到29.9%，肺腺癌發生率卻上升（男性每十萬人9.06升到23.25，女性7.05升到24.22），研究者還在查空氣污染是不是原因之一。',
      'An analysis of 371,084 Taiwanese lung cancer patients found 53% had never smoked; between 1995 and 2015 the proportion of adult men who had ever smoked fell from 59.4% to 29.9%, while lung adenocarcinoma incidence rose (men 9.06 to 23.25, women 7.05 to 24.22 per 100,000), and researchers are investigating whether air pollution is one of the reasons.',
    ),
    period: t('1995–2015年', '1995–2015'),
    place: TW,
    sources: ['tseng-2019-jto'],
    locator: 'Abstract: "53% patients with LC had never smoked."; AdLC incidence males 9.06→23.25, females 7.05→24.22 per 100,000',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '生態學（區域比較）研究，以能見度作為空氣品質的替代指標，無法證明PM2.5導致個別病例，也未排除其他因素。這項研究不能說明空氣污染是不吸菸者肺癌的原因，也算不出它占多少比例。' + ABSTRACT_ONLY['zh-TW'],
      'An ecological (regional) analysis using visibility as a proxy for air quality; it cannot show that PM2.5 caused individual cancers and does not rule out other factors. It cannot show that air pollution is the cause of never-smokers\' lung cancer, or what share of it. ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 5,
    editorNote: 'R14: only on /evidence/#not-used. Never say air pollution is "the cause" of never-smokers\' lung cancer or give a share.',
    research: '03 §3c',
  },
  'hill2023-egfr-ecological': {
    data: { egfrCases: v(32957, 'count') },
    display: t('台灣資料呈顯著關聯', 'significant association in Taiwan data'),
    statement: t(
      '一篇《自然》期刊研究在包括台灣在內的區域資料中，發現PM2.5（所有來源）濃度與EGFR突變型肺癌發生率顯著相關，並以小鼠實驗提出空氣污染物促進腫瘤的機制。',
      'A Nature study found a significant association between PM2.5 levels (all sources) and the incidence of EGFR-mutant lung cancer in area-level data including Taiwan, and used mouse experiments to propose a mechanism by which air pollutants promote tumours.',
    ),
    period: t('台灣資料2011–2017年；2023年發表', 'Taiwan data 2011–2017; published 2023'),
    place: t('英國、南韓、台灣（台灣為長庚研究資料庫九縣市）', 'England, South Korea and Taiwan (Taiwan: Chang Gung Research Database, nine counties)'),
    sources: ['hill-2023-nature'],
    locator: 'Abstract: "significant association between PM2.5 levels and the incidence of lung cancer for 32,957 EGFR-driven lung cancer cases in four within-country cohorts"',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '人類資料是以縣市平均PM2.5進行的生態學分析，論文自承無法考慮人口遷移；機制證據來自小鼠與少量組織樣本；PM2.5為所有來源，並非機車專屬。',
      'The human analyses are ecological (county-average PM2.5), and the paper notes it could not account for migration; the mechanism evidence comes from mice and small tissue samples; PM2.5 is from all sources, not scooters.',
    ),
    requiresCaveat: true,
    chainLink: 5,
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
      '一項模式推估把2014年台灣約6,300人（6,282人）因心臟病、中風、肺癌與慢性阻塞性肺病的死亡歸因於環境PM2.5（所有來源）。',
      'A modelled estimate attributed about 6,300 (6,282) Taiwanese deaths in 2014 from heart disease, stroke, lung cancer and COPD to ambient PM2.5 (all sources).',
    ),
    period: t('2014年', '2014'),
    place: TW,
    sources: ['lo-2017-jfma'],
    locator: 'Abstract: "In 2014, PM2.5 accounted for 6282 deaths [95% CI, 5716-6847]... population attributable mortality fraction ... 18.6%"',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是使用2014年監測資料的模式推估，年代較久，此後台灣PM2.5已下降；PM2.5為所有來源，這些不是「機車造成的死亡」。我們找不到更新的台灣推估。' + ABSTRACT_ONLY['zh-TW'],
      'A modelled estimate from 2014 monitoring data; PM2.5 in Taiwan has fallen since. PM2.5 is from all sources, so these are not "deaths from scooters". We found no newer Taiwanese estimate. ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 5,
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
    caveat: t(
      'WHO說的是所有兒童與一般空氣污染，不是專指台灣或機車廢氣；沒有提出兒童在路口比大人多吸多少的數字。',
      'WHO is describing children and air pollution in general, not Taiwan or scooter exhaust specifically, and gives no figure for how much more a child breathes at a crossing.',
    ),
    chainLink: 6,
    research: '03 §5',
  },
  'pram-height-sharma2020': {
    data: { fineParticlesUpTo: v(44, 'percent', { bound: 'lte' }), coverReduction: v(39, 'percent', { bound: 'lte' }) },
    display: t('最多高 44%（英國）', 'up to 44% higher (UK)'),
    statement: t(
      '英國一項實驗發現，嬰兒車裡嬰兒高度的細微粒濃度比成人呼吸高度最多高44%。',
      'In a UK experiment, fine-particle concentrations at the height of a baby in a stroller were up to 44% higher than at adult breathing height.',
    ),
    period: t('2020年發表', 'Published 2020'),
    place: t('英國吉爾福德（2.1公里路線）', 'Guildford, UK (2.1 km route)'),
    sources: ['sharma-kumar-2020-envint'],
    locator: 'Abstract: "The average in-pram concentration of fine particles was always higher by up to 44% compared with adult breathing height"',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'measured',
    caveat: t(
      '「最多44%」是各條件中的最大值，不是平均差異，且只針對細微粒；它不代表「兒童比成人多吸44%污染」。其他研究結果不一，有的發現嬰兒車高度反而較低或沒有差異（見文獻回顧）。台灣沒有兒童高度的實測研究。' + ABSTRACT_ONLY['zh-TW'],
      '"Up to 44%" is the maximum across conditions, not an average, and only for fine particles; it does not mean children breathe 44% more pollution. Other studies are mixed, some finding stroller height lower or no different (see the review). No child-height measurements exist for Taiwan. ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 6,
    editorNote: 'R5: "up to 44%", fine particles, one UK experiment; never "children breathe 44% more".',
    research: '03 §5',
  },
  'stroller-height-review': {
    data: {
      buzzard2009: v(59, 'percent', { note: 'PM2.5 199 vs 125 µg/m3, 0.85 vs 1.65 m, Morgantown USA' }),
      kenagy2016Low: v(5, 'percent', { note: 'NO2 at 0.8 vs 2.0 m, Edinburgh; 5-15% higher' }),
      kenagy2016High: v(15, 'percent'),
      garciaAlgar2015: v(10, 'percent', { note: 'ultrafine particles, 0.55 vs 1.70 m, Barcelona' }),
      kumar2017Afternoon: v(10, 'percent', { note: 'PM2.5, Guildford, afternoon' }),
      kumar2017Morning: v(-5, 'percent', { note: 'PM2.5, Guildford, morning: babies significantly LOWER' }),
    },
    display: t('通常高 5%～15%，結果不一', 'usually 5–15% higher; mixed'),
    statement: t(
      '一篇英國學者的文獻回顧（研究都在英國、西班牙與美國，沒有台灣）中，四項比較嬰兒車與成人呼吸高度的研究大多發現嬰兒車高度高約5%至15%；最高的59%是美國一項路邊PM2.5研究，而英國一項研究的早上時段嬰兒高度反而低5%。不在這四項之內的另一項愛丁堡研究（Galea 2014），則有幾天成人高度反而高17%至51%，有一天兒童高度高16%，其餘幾天沒有差異。',
      'In a review by UK researchers (studies from the UK, Spain and the US; none in Taiwan), four studies comparing stroller and adult breathing heights mostly found about 5–15% higher levels at stroller height; the highest, 59%, was PM2.5 in one US roadside study, while a UK study found babies 5% lower in the morning. A further Edinburgh study, not one of the four (Galea 2014), found adults\' PM2.5 17–51% higher on some days, children\'s 16% higher on one day, and no difference on the rest.',
    ),
    period: t('原始研究2009–2017年；回顧2018年發表', 'Original studies 2009–2017; review published 2018'),
    place: t('英國、西班牙、美國', 'UK, Spain, USA'),
    sources: ['sharma-kumar-2018-envint'],
    locator: 'Table 3 p.267; Section 3 p.266 (Galea 2014); Table 1',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '各研究的污染物（PM2.5、二氧化氮、超細微粒）、高度、儀器與時間都不同，沒有信賴區間，不能合併成一個數字。最高的59%只來自一項研究。這些數字是文獻回顧轉述的，原始論文我們沒有逐篇查閱。回顧作者和一家做嬰兒車空氣淨化產品的公司有合作，論文沒有利益衝突聲明。上小學的孩子口鼻比嬰兒車高；確定的只有小孩呼吸比較快。',
      'The studies differ in pollutant (PM2.5, NO2, ultrafine particles), height, instrument and averaging time, with no confidence intervals, so they cannot be pooled into one number. The 59% comes from a single study. Figures are as reported by the review; we did not read each original study. The authors acknowledge an industrial collaborator that makes a stroller air-purifier, with no conflict-of-interest statement. A school-age child breathes above stroller height; what is established for them is faster breathing.',
    ),
    requiresCaveat: true,
    chainLink: 6,
    research: 'papers/sharma-kumar-2018-envint#overall-up-to-60; papers/sharma-kumar-2018-envint#buzzard2009-pm25; papers/sharma-kumar-2018-envint#kenagy2016-no2; papers/sharma-kumar-2018-envint#garciaalgar2015-ufp; papers/sharma-kumar-2018-envint#kumar2017-baby-vs-adult; papers/sharma-kumar-2018-envint#galea2014-no-difference',
  },
  'child-breathing-per-bodyweight': {
    data: { ratio: v(2, 'ratio', { approx: true }) },
    display: t('每公斤體重呼吸約為成人兩倍', 'about twice the breathing per kilogram'),
    statement: t(
      '一篇英國學者的嬰兒車暴露文獻回顧（Sharma 與 Kumar，2018）引用的研究指出，以每公斤體重計，兒童的呼吸速率一般約為成人的兩倍，因此相對於肺的大小與體重，吸入的微粒劑量較高。',
      'A study cited by a UK review of babies\' exposure in strollers (Sharma and Kumar, 2018) states that, per kilogram of body weight, children\'s breathing rate is generally about twice an adult\'s, so they inhale a higher particle dose relative to lung size and body weight.',
    ),
    period: t('回顧2018年發表（引用Ginsberg 等2005年）', 'Review published 2018 (citing Ginsberg et al. 2005)'),
    place: t('不限地區', 'Not place-specific'),
    sources: ['sharma-kumar-2018-envint'],
    locator: 'Section 1 p.263, reason (i)',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是回顧轉述的數字，原始研究我們沒有讀到；也沒有分年齡，或給出實際的呼吸量。',
      'A figure as reported by the review; we did not read the original study, and it gives no age bands or absolute breathing rates.',
    ),
    chainLink: 6,
    research: 'papers/sharma-kumar-2018-envint#physio-dose-per-bodyweight',
  },
  'child-height-harr2022': {
    data: { higherOnDays: v(6, 'count'), totalDays: v(8, 'count'), higherBy: v(20, 'percent', { bound: 'gt' }) },
    display: t('兒童高度 PM2.5：8 天中 6 天高逾 20%（德國）', 'PM2.5 at child height: >20% higher on 6 of 8 days (Germany)'),
    statement: t(
      '德國美因茲一項研究以低價感測器在1.0與1.6公尺兩個高度量測，8天中有6天兒童高度的PM2.5濃度高出20%以上，靠近車流量大的街道時差異最明顯。',
      'A study in Mainz, Germany measured at 1.0 m and 1.6 m with low-cost sensors and found PM2.5 more than 20% higher at child height on six of eight days, with the biggest differences near busy streets.',
    ),
    period: t('2019年11月；2022年發表', 'November 2019; published 2022'),
    place: t('德國美因茲（5.5公里路線）', 'Mainz, Germany (5.5 km route)'),
    sources: ['harr-2022-uclim'],
    locator: 'Abstract: children "exposed to > 20% higher concentrations on six days (p < 0.01)", one day > 80%',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'measured',
    caveat: t(
      '單一國外研究，使用低價感測器，只有8天；摘要沒有說兩個高度是不是同時量的。台灣沒有兒童高度的實測研究。' + ABSTRACT_ONLY['zh-TW'],
      'A single study abroad using low-cost sensors over eight days; the abstract does not say whether the two heights were measured at the same time. No child-height measurements exist for Taiwan. ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 6,
    research: '02 §6',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// Registry assembly
// ---------------------------------------------------------------------------

export const factGroups = {
  fleet,
  electric,
  policy,
  emissions,
  exposure,
  standards,
  hazard,
  health,
  children,
  economics,
  inspection,
  intersection,
  smell,
  acute,
  longterm,
  vulnerable,
  levers,
  kerb,
  masks,
};
export type Topic = keyof typeof factGroups;

/** Topics whose facts may omit `chainLink`; they take this value instead. */
export const topicDefaultChainLink: Partial<Record<Topic, ChainLink | null>> = {
  economics: 7,
};

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
  inspection: t('怠速檢驗與排放標準', 'Idle tests and emission standards'),
  intersection: t('路口與街道配置', 'Intersections and street layout'),
  smell: t('氣味與廢氣成分', 'Smell and what exhaust contains'),
  acute: t('短期暴露與健康', 'Short-term exposure and health'),
  longterm: t('長期暴露與健康', 'Long-term exposure and health'),
  vulnerable: t('高暴露與易感族群', 'Most-exposed and susceptible groups'),
  levers: t('政策工具', 'Policy levers'),
  kerb: t('路邊的空氣與參考值', 'Kerbside air and reference values'),
  masks: t('口罩擋得住什麼', 'What masks do and do not stop'),
};

const merged = {
  ...fleet,
  ...electric,
  ...policy,
  ...emissions,
  ...exposure,
  ...standards,
  ...hazard,
  ...health,
  ...children,
  ...economics,
  ...inspection,
  ...intersection,
  ...smell,
  ...acute,
  ...longterm,
  ...vulnerable,
  ...levers,
  ...kerb,
  ...masks,
};
export type FactId = keyof typeof merged;
export type Fact = Omit<FactInput, 'chainLink'> & { id: FactId; topic: Topic; chainLink: ChainLink | null };

function assemble(): Record<FactId, Fact> {
  const out: Record<string, Fact> = {};
  for (const [topic, group] of Object.entries(factGroups) as [Topic, Record<string, FactInput>][]) {
    for (const [id, f] of Object.entries(group)) {
      if (out[id]) throw new Error(`[data] Duplicate fact id "${id}" in topics "${out[id].topic}" and "${topic}"`);
      const chainLink = f.chainLink !== undefined ? f.chainLink : (topicDefaultChainLink[topic] ?? null);
      out[id] = { ...f, id: id as FactId, topic, chainLink };
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
  chainLink: ChainLink | null;
  alsoLinks: ChainLink[];
  display: string;
  statement: string;
  period: string;
  place: string;
  caveat?: string;
  requiresCaveat: boolean;
  confidence: Confidence;
  evidence: Evidence;
  badges: { confidence: string; evidence: string; confidenceDescription: string; evidenceDescription: string };
  /** The reader chip (brief 4.1): kind for KindChip, and its text with place ('實測・台灣'). */
  chip: { kind: ReaderKind; text: string };
  citations: LocalizedCitation[];
  data: Record<string, Datum>;
}

/** Everything a page needs to render one fact in one language. */
export function localizeFact(idOrFact: FactId | Fact, locale: Locale): LocalizedFact {
  const f = typeof idOrFact === 'string' ? fact(idOrFact) : idOrFact;
  return {
    id: f.id,
    topic: f.topic,
    chainLink: f.chainLink,
    alsoLinks: f.alsoLinks ?? [],
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
    chip: { kind: readerKind(f), text: readerChipText(f, locale) },
    citations: f.sources.map((id) => ({
      id,
      short: shortCitation(id, locale),
      full: formatCitation(id, locale),
      url: sourceUrl(id),
    })),
    data: f.data,
  };
}

/**
 * How long each measured exposure lasted, in hours, for studies whose research file records it
 * (e.g. Chuang 2020: a one-hour commute; McCreanor 2007: a two-hour walk). Undefined when the
 * study took spot readings or the duration is not recorded: never guess a time label.
 */
export function exposureHours(id: FactId): number | undefined {
  return fact(id).data.exposureHours?.value;
}
