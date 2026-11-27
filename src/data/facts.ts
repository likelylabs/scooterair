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
import { simulation } from './facts-simulation.ts';

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

const TEDS_PERIOD = t('基準年 2023 年（民國 112 年），TEDS 13.0 版，2026 年 1 月發布', 'Base year 2023 (TEDS 13.0, published January 2026)');
const TEDS_SCOPE = t(
  '排放清冊只算台灣境內直接排出來的污染。從國外飄來的不算，在空氣裡後來才形成的微粒也不算。排放量占多少，不等於你吸進去的空氣裡占多少。環境部也特別提醒，這是兩回事。',
  'The inventory counts only pollution given off directly inside Taiwan. It leaves out pollution blown in from abroad, and particles that form later in the air. A share of emissions is not a share of what people breathe. The environment ministry itself points out that the two are different things.',
);
const TEDS_COMBINED = t(
  '這是環境部排放清冊的官方數字。清冊把燃油機車分成二行程、四行程兩行。「燃油機車合計」是這兩行加起來。',
  'These are official figures from the environment ministry\'s emissions inventory. It lists petrol scooters in two rows, two-stroke and four-stroke. The total for petrol scooters adds the two together.',
);
const IOT_CAVEAT = t(
  '這是電腦推算的結果。運研所把路口量到的資料，放進電腦模式。然後比較有這個做法和沒有的兩種情形。這不是在路口真的改了以後，前後各量一次。報告封面寫著，結論不代表交通部的意見。',
  'This was worked out on a computer. The Institute of Transportation put its junction readings into a computer model and compared the situation with and without the change. It is not a before-and-after reading at a real junction. The report\'s cover says its conclusions are not the transport ministry\'s view.',
);
const ASSOCIATION_TW = t(
  '這類研究只能看出兩件事「有關」，不能證明是因果。它量的是所有來源或所有車輛的污染，沒有把機車廢氣分出來。',
  'Studies like this can show a link, not prove cause and effect. They measured pollution from all sources or all traffic, and did not pick out scooter exhaust.',
);
const MEDIA_MOTC = t(
  '數字出自媒體轉述的交通部統計；交通部原本的統計表，我們沒能直接打開。',
  'From a media report of transport-ministry statistics; we could not open the ministry\'s own table.',
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
      '2024 年台灣登記的機車達 1,466 萬輛，仍逐年增加。',
      'Taiwan had 14.66 million registered motorcycles in 2024, and the number was still rising year on year.',
    ),
    period: t('2024年（民國113年）', '2024'),
    place: TW,
    sources: ['moenv-air-review-2024', 'moenv-air-review-2023'],
    locator: '113年度總檢討: 「機車，維持逐年成長，113 年已達 1,466 萬輛」; 112年度: 「112 年已達 1,455 萬輛」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '登記數包括所有掛牌的機車（也包括電動機車和大型重機），不只速克達。',
      'The count covers all licensed motorcycles (including electric and large heavy motorcycles), not only scooters.',
    ),
    chainLink: 1,
    research: '01 §1',
  },
  'fleet-electric-registered-2024': {
    data: { electric2024: v(770000, 'vehicles'), electric2023: v(700000, 'vehicles'), electric2018: v(190000, 'vehicles', { bound: 'gt' }) },
    display: t('77 萬輛', '770,000'),
    statement: t(
      '登記的電動機車，從 2018 年的 19 萬多輛，增加到 2024 年的 77 萬輛。',
      'Registered electric motorcycles grew from more than 190,000 in 2018 to 770,000 in 2024.',
    ),
    period: t('2018–2024年', '2018–2024'),
    place: TW,
    sources: ['moenv-air-review-2024', 'moenv-air-review-2023'],
    locator: '「107 年設籍數超過 19 萬輛，113 年已成長至 77 萬輛」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '這些是登記的數量，不是路上真的在騎的車；環境部的報告只給大約的數字（「超過 19 萬輛」「77 萬輛」）。',
      'These are registered scooters, not the ones actually ridden; the environment ministry\'s report gives only rounded figures ("more than 190,000", "770,000").',
    ),
    chainLink: 7,
    research: '01 §1',
  },
  'fleet-electric-share-of-stock-2024': {
    data: { share: v(5.3, 'percent', { approx: true, derived: true, note: '770,000 / 14.66 million = 5.25%' }) },
    display: t('約 5.3%', 'about 5.3%'),
    statement: t(
      '2024 年電動機車約占全部登記機車的 5.3%。',
      'Electric motorcycles were about 5.3% of all registered motorcycles in 2024.',
    ),
    period: t('2024年', '2024'),
    place: TW,
    sources: ['moenv-air-review-2024'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['fleet-registered-2024', 'fleet-electric-registered-2024'],
    caveat: t(
      '本站用環境部報告的 77 萬輛，除以同一份報告的 1,466 萬輛登記機車算的；兩個都是登記數，也包括很少騎的車。',
      'Our arithmetic: 770,000 divided by the 14.66 million registered motorcycles in the same MOENV review. Both are registrations, which include scooters rarely ridden.',
    ),
    chainLink: 7,
    research: '01 Corrections #2',
  },
  'fleet-fuel-mix-may-2026': {
    data: { total: v(14.67, 'million-vehicles'), gasolineShare: v(94, 'percent'), electricShare: v(5.5, 'percent') },
    display: t('94% 加汽油', '94% petrol'),
    statement: t(
      '截至 2026 年 5 月底，全國約有 1,467 萬輛機車，其中 94% 使用汽油，電動機車只占 5.5%。',
      'At the end of May 2026 Taiwan had about 14.67 million motorcycles; 94% ran on petrol and only 5.5% were electric.',
    ),
    period: t('2026 年 5 月底', 'End of May 2026'),
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
      '照媒體引述的交通部統計，台灣平均每 100 人有約 63 輛機車（62.7 輛）。',
      'According to MOTC figures reported in the media, Taiwan has about 63 registered motorcycles per 100 people (62.7).',
    ),
    period: t('2025 年初（當年前兩個月）', 'Early 2025 (first two months)'),
    place: TW,
    sources: ['tvbs-2025-scooter-density'],
    locator: '「國內每一百位民眾，平均擁有62.7輛機車」; stock 1466.2萬輛',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自 TVBS 轉述的交通部統計；我們沒有拿到內政部的人口數，沒辦法自己再算一次。',
      'From a TVBS report of a transport-ministry statistic; we did not get the population figure to check it ourselves.',
    ),
    chainLink: 1,
    research: '01 §2',
  },
  'fleet-regional-ranking': {
    data: { taiwan: v(60, 'per-100-people'), vietnam: v(57, 'per-100-people'), malaysia: v(44, 'per-100-people') },
    display: t('機車密度：名列前茅', 'motorcycle density: among the highest'),
    statement: t(
      '在一份非官方的區域排名裡，台灣每百人有 60 輛機車，排第一。越南是 57 輛，馬來西亞是 44 輛，台灣比它們高一點，是機車最多的國家之一。',
      'In one unofficial regional ranking, Taiwan came first with 60 motorcycles per 100 people. That is just ahead of Vietnam (57) and Malaysia (44): one of the countries with the most motorcycles per person.',
    ),
    period: t('排名未註明年份', 'Ranking undated'),
    place: t('台灣與東南亞國家', 'Taiwan and Southeast Asian countries'),
    sources: ['tvbs-cars-vehicle-registrations-ranking'],
    locator: '「冠軍為平均每百人就持有60輛機車的台灣，排名第二、三則是機車大國越南 (57輛) 與馬來西亞 (44輛)」',
    confidence: 'secondary',
    evidence: 'international',
    caveat: t(
      '這份排名是 TVBS 引述的 Seasia Stats，不是官方的，也沒寫年份。台灣和越南只差 3 輛。它又把登記的數字和推估的數字混在一起用。差距這麼小，說明不了什麼。這份排名，撐不起台灣是「世界最高」的說法。60 和交通部的 62.7 不一樣，是因為算法和時間不同。',
      'The ranking is Seasia Stats as quoted by TVBS: not official and with no year. Taiwan is only 3 ahead of Vietnam. The ranking also mixes registration counts with estimates. A gap that small means little, so Taiwan cannot be called "the world\'s highest". The 60 differs from the transport ministry\'s 62.7 because they are counted differently and at different times.',
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
      '2024 年底台北市的機車以燃油為主（90.6%），電池交換式占 8.4%，充電式占 1.0%。',
      'At the end of 2024, 90.6% of motorcycles in Taipei City were fuel-powered, 8.4% were battery-swap electric and 1.0% plug-in electric.',
    ),
    period: t('2024 年底', 'End of 2024'),
    place: TAIPEI,
    sources: ['taipei-dbas-bulletin-1364'],
    locator: '「機車動力來源以燃油占90.6%為主，電池交換式占8.4%居次」, charging 1.0%',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '數字來自交通部的「機車及自用小客車使用狀況調查」。台北市主計處轉載了它。這是問卷調查的結果，不是登記數。',
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
      '2025 年六都新賣出的機車裡，電動的占 7.5%；路上全部機車裡，電動的占 6.1%。台北市最高：新車裡占 22.1%，全部機車裡占 10%。',
      'In 2025, electric models were 7.5% of new motorcycles sold in the six largest cities, and 6.1% of all motorcycles there; Taipei led, at 22.1% of new sales and 10% of all motorcycles.',
    ),
    period: t('2025年', '2025'),
    place: SIX_CITIES,
    sources: ['ctee-2026-04-six-cities-ev'],
    locator: '「2025年六都電動機車市售比為7.5％、電動機車的普及率為6.1％。六都中以台北市的市售比22.1％最高…普及率也以10％領跑六都」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自工商時報的報導，引用機車業界團體（SMAT）整理的公路局資料；原始資料我們沒有核對。',
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
      '2024 年全台騎機車的人，58.4% 主要是用來上下班、上下學；六都在高雄市的 57.2% 到台北市的 63.3% 之間。',
      'In 2024, 58.4% of motorcycle users across Taiwan said getting to work or school was their main use. In the six largest cities it ranged from 57.2% (Kaohsiung) to 63.3% (Taipei).',
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
      '照 2022 年的統計，機車是全台最常用的交通工具，占 45.8%；大眾運輸只占 14.3%。',
      'In 2022 motorcycles were the most used way of getting around Taiwan, at 45.8%; public transport was 14.3%.',
    ),
    period: t('2022 年（民國 111 年）', '2022'),
    place: TW,
    sources: ['tvbs-2022-mode-share'],
    locator: '「仍然以機車為最大宗，市占率45.8%最高」「公共運輸市占率為14.3%…台北市最高達到37.2%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自 TVBS 轉述的交通部運具調查；我們找不到 2024 年的全國數字。',
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
      '2024 年台北市平日的出門行程裡，機車占 20.1%（2022 年是 22.2%），大眾運輸占 38.3%，走路占 20.8%。',
      'On weekdays in 2024, 20.1% of trips in Taipei City were by motorcycle (22.2% in 2022), 38.3% by public transport and 20.8% on foot.',
    ),
    period: t('2024 年 9 至 12 月平日（2022 年同期比較）', 'Weekdays, Sept–Dec 2024 (compared with 2022)'),
    place: TAIPEI,
    sources: ['taipei-dbas-bulletin-1341'],
    locator: 'row 「113 年 63.0 38.3 16.0 13.7 24.7 20.8 3.8 37.0 20.1 16.3 44.2…」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '這只是台北市平日、9 到 12 月的抽樣調查，不算 500 公尺以下的行程。台北的捷運和公車比其他城市多。其他五都和全國 2024 年的同類數字，我們沒有找到。',
      'A sample survey of Taipei City weekdays from September to December only, not counting trips under 500 m. Taipei has far more metro and bus service than other cities. We did not find comparable 2024 figures for the other five municipalities or for Taiwan as a whole.',
    ),
    chainLink: null,
    research: '01 §9',
  },
} satisfies Record<string, FactInput>;

// ---------------------------------------------------------------------------
// electric: electric share of new registrations
// ---------------------------------------------------------------------------

const REGISTRATIONS_NOTE = t(
  '新領牌的數字，出自媒體轉述的交通部或業界統計。各家算總數的方法略有不同（例如有沒有包括重型機車）。',
  'New-registration figures come from media reports of transport-ministry or industry statistics. Each counts the total slightly differently (for example, whether heavy motorcycles are included).',
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
      '2019 年新領牌機車中，電動機車占 18.7%（168,542 輛），是現有資料年份中的最高點。',
      'In 2019 electric models made up 18.7% of new motorcycle registrations (168,542 of 902,302), the highest share in the years for which we have figures.',
    ),
    period: t('2019 年', '2019'),
    place: TW,
    sources: ['cnyes-2019-registrations'],
    locator: '「2019 年度環保燃油車 733,760 台 (81.3%) 大勝電動車 168,542 台 (18.7%)」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自鉅亨網引述的交通部統計。2015 到 2018 年和 2020 年的數字沒能查證，所以它只是我們有資料的年份裡最高的。',
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
      '2021 年電動機車約占新賣機車的 11.6%。這是用那一年機車總銷量和燃油機車銷量推算的。',
      'In 2021 electric models were about 11.6% of new motorcycle sales, calculated from that year\'s total and petrol sales.',
    ),
    period: t('2021年', '2021'),
    place: TW,
    sources: ['chinatimes-2022-gogoro-briefing'],
    locator: '「全體機車市場年度總銷量為80萬9196輛…燃油機車市場71萬5,197輛」',
    confidence: 'secondary',
    evidence: 'derived',
    caveat: t(
      '總銷量和燃油機車銷量，出自工商時報報導的 Gogoro 說明會（公司自己的資料）；電動機車的數量和比例是本站算的。',
      'Total and petrol sales are from a Commercial Times report of a Gogoro press briefing (company figures); the electric count and share are our calculation.',
    ),
    chainLink: 7,
    research: '01 §7',
  },
  'ev-share-2022': {
    data: { share: v(11.9, 'percent') },
    display: t('11.9%', '11.9%'),
    statement: t('2022 年電動機車市售比為 11.9%。', 'In 2022 electric models were 11.9% of new motorcycle sales.'),
    period: t('2022年', '2022'),
    place: TW,
    sources: ['pts-2026-04-ev-share'],
    locator: '「2022年電動機車市售比11.9%」 (SMAT via PTS)',
    confidence: 'secondary',
    evidence: 'market-tw',
    caveat: t(
      '出自公視新聞網引述的業界團體數字；那一年總共掛牌多少輛，我們沒能拿到。',
      'From PTS News quoting an industry association figure; the total registrations for that year were not obtained.',
    ),
    chainLink: 7,
    research: '01 §7',
  },
  'ev-share-2023': {
    data: { share: v(9.14, 'percent'), electric: v(79584, 'vehicles'), total: v(870620, 'vehicles') },
    display: t('9.14%', '9.14%'),
    statement: t(
      '2023 年電動機車掛牌 79,584 輛，占機車總市場的 9.14%。',
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
      '2024 年全國機車掛牌 752,643 輛，其中電動機車 78,757 輛，占 10.46%。',
      'Of 752,643 motorcycles registered in 2024, 78,757 were electric, a share of 10.46%.',
    ),
    period: t('2024年', '2024'),
    place: TW,
    sources: ['tvbs-cars-2024-market-total', 'tvbs-cars-2024-ev-share', 'ucar-ev-sales-2024'],
    locator: 'TVBS 「2024年台灣機車總市場的掛牌數來到752,643輛」「78,757」「10.46」; U-CAR 10.38%',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      'U-CAR 報導的比例是 10.38%，和 TVBS 差 0.08 個百分點，因為兩家算總數的方法不同。' + REGISTRATIONS_NOTE['zh-TW'],
      'U-CAR reports 10.38%, 0.08 points lower than TVBS, because they count the total differently. ' + REGISTRATIONS_NOTE.en,
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
      '2025 年電動機車新領牌 49,128 輛，市售比只有 6.94%。',
      'In 2025 only 49,128 new electric motorcycles were registered, a 6.94% share of new sales.',
    ),
    period: t('2025年', '2025'),
    place: TW,
    sources: ['tvbs-cars-2025-12-ev-sales', 'pts-2026-07-scooter-fleet'],
    locator: 'TVBS table total 「49,128」; PTS 「2025年只有6.94%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '總領牌數約 70.8 萬輛，是本站用 49,128 輛和 6.94% 推算的，原始報導裡沒有。' + REGISTRATIONS_NOTE['zh-TW'],
      'The total of about 708,000 is our own back-calculation from 49,128 and 6.94%; it is not in the reports. ' + REGISTRATIONS_NOTE.en,
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
      '新領牌電動機車從 2019 年的 168,542 輛降到 2025 年的 49,128 輛，減少約七成。',
      'New electric motorcycle registrations fell from 168,542 in 2019 to 49,128 in 2025, a drop of about 71%.',
    ),
    period: t('2019–2025 年', '2019–2025'),
    place: TW,
    sources: ['cnyes-2019-registrations', 'tvbs-cars-2025-12-ev-sales'],
    confidence: 'secondary',
    evidence: 'derived',
    derivedFrom: ['ev-share-2019', 'ev-share-2025'],
    caveat: t(
      '媒體認為下滑有幾個原因。一是 2019 年後補助變少，二是 Gogoro 在 2022 年取消電池吃到飽方案。三是 2025 年燃油機車減徵貨物稅等。這些原因本站沒有查證。',
      'The media put the fall down to smaller subsidies after 2019, Gogoro ending its unlimited battery plan in 2022, and the 2025 tax cut on petrol scooters. We have not checked these reasons.',
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
      '2026 年 5 月全台機車銷量 61,541 輛，其中電動機車 4,273 輛，約占 7%。',
      'In May 2026, 4,273 of the 61,541 motorcycles sold in Taiwan were electric, about 7%.',
    ),
    period: t('2026 年 5 月（單月）', 'May 2026 (single month)'),
    place: TW,
    sources: ['ctee-2026-06-may-sales'],
    locator: '「5月全台總銷量達6萬1541輛…5月整體銷量為4273輛」',
    confidence: 'secondary',
    evidence: 'derived',
    caveat: t(
      '只有一個月的數字，比例是本站算的；2026 年其他月份沒能查證，這個數字不代表整年。',
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
      '從 2025 年 9 月 7 日到 2030 年底，有一項燃油機車減稅。新買 150cc 以下的燃油機車（不是電動的），並且新掛牌，每輛少繳 2,000 元貨物稅。',
      'From 7 September 2025 to the end of 2030, anyone who buys and newly registers a petrol (not electric) scooter of 150cc or less pays NT$2,000 less goods tax.',
    ),
    period: t('2025 年 9 月 7 日至 2030 年 12 月 31 日', '7 September 2025 to 31 December 2030'),
    place: TW,
    sources: ['etax-goods-tax-scooter-cut', 'tvbs-cars-2025-12-ev-sales'],
    locator: 'MOF etax: 「自114年9月7日起至119年12月31日止，購買…汽缸排氣量150cc以下機車並完成新領牌照登記，購入非電動車之車輛為限」; 新購部分 「機車每輛減徵2千元」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '財政部稅務入口網另外列了汰舊換新的減稅。報廢 150cc 以下、出廠滿 4 年的舊車，每輛少繳 4,000 元。早先 TVBS 的報導寫的是「8 月 29 日起、125cc 以下、最多 2,000 元」。這和財政部網頁不一樣，這裡以財政部為準。媒體認為，減稅是電動機車賣不好的原因之一。這一點我們沒有查證。',
      'The finance ministry\'s tax site also lists a trade-in cut: NT$4,000 less when you scrap a scooter of 150cc or less that is at least 4 years old. An earlier TVBS report said "from 29 August, up to 125cc, up to NT$2,000". That differs from the ministry\'s page; we follow the ministry. The media see the tax cut as one reason electric scooters are selling badly. We have not checked that.',
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
      '台灣 2050 淨零排放路徑，規劃電動機車在新車裡的比例：2025 年 20%、2030 年 35%、2035 年 70%、2040 年 100%。',
      'Taiwan\'s 2050 net-zero plan sets targets for electric models as a share of new motorcycles: 20% in 2025, 35% in 2030, 70% in 2035 and 100% in 2040.',
    ),
    period: t('2025–2040 年目標', 'Targets for 2025–2040'),
    place: TW,
    sources: ['pts-2026-07-scooter-fleet', 'pts-2026-04-ev-share'],
    locator: '「規劃電動機車的市售比在2025年要達到20%、2030年35%、2035年70%、2040年達到100%」',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '出自公視新聞網對淨零路徑的報導；國家發展委員會的原始文件我們沒有讀到。新車比例的目標，不等於禁止賣燃油機車；我們找不到任何正式的禁售規定。',
      'From Public Television Service (PTS) News reporting on the net-zero plan; we have not read the National Development Council\'s own document. A target for the share of new sales is not a ban on petrol scooters, and we found no formal ban.',
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
      '2025 年新車裡電動機車的比例是 6.94%，比淨零路徑訂的 20% 目標低很多。',
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
      '實際賣出的比例，出自媒體轉述的統計。目標出自公視對淨零路徑的報導，國發會的原始文件我們沒有讀到。差距是本站算的。',
      'The actual share comes from media reports of statistics. The target comes from Public Television Service (PTS) News reporting on the net-zero pathway; we have not read the National Development Council\'s original. The gap is our calculation.',
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
      '機車的排氣標準從 1988 年第一期開始，一期比一期嚴。2017 年的第六期，大約等於歐盟第 4 期。2021 年的第七期，另外替直噴引擎加了微粒的上限。',
      'Taiwan\'s scooter exhaust standards have got stricter step by step since Phase 1 in 1988. Phase 6 (2017) is about the same as Euro 4, and Phase 7 (2021) added a limit on particles for direct-injection engines.',
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
      '二行程機車大多已經淘汰：2018 年降到 100 萬輛以下，2024 年再降到約 28 萬輛以下。',
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
      '2019 年全台有 474 萬輛老舊機車；2020 到 2023 年一共淘汰了 219.4 萬輛（少了 46%），達到 190 萬輛的目標。',
      'Of 4.74 million old scooters in 2019, 2.194 million (46%) were retired between 2020 and 2023, meeting the cumulative target of 1.9 million.',
    ),
    period: t('2019–2023 年', '2019–2023'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    locator: '「108 年 474 萬輛老舊機車中，109 年至 112 年全國累計已淘汰 219.4 萬輛，減少 46%，並達成 112 年 190 萬輛之累積目標」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '「老舊機車」指 2007 年 6 月 30 日以前出廠的機車；2024 年以後淘汰了多少，我們沒有查到。',
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
      '把 2020 到 2023 年淘汰的扣掉，2007 年中以前出廠的老舊機車，最多大約還剩 255 萬輛；因為別的原因報廢的沒有扣，實際應該更少。',
      'Subtracting the 2020–2023 retirements leaves at most about 2.55 million scooters built before mid-2007; scrapping for other reasons is not subtracted, so the real number is lower.',
    ),
    period: t('2023 年底（推算）', 'End of 2023 (estimate)'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['old-scooters-retired-2020-2023'],
    caveat: t(
      '這是本站用 2019 年的數量減掉淘汰數算的，不是官方數字。因為別的原因報廢的車，也沒有扣掉。',
      'Our subtraction of cumulative retirements from the 2019 stock: not an official figure. It ignores scooters scrapped for other reasons.',
    ),
    chainLink: 1,
    research: '01 §6',
  },
  'scrappage-subsidy-scope': {
    data: {},
    display: t('2007年6月30日前出廠', 'built before 30 June 2007'),
    statement: t(
      '環境部從 2020 年起，擴大了汰舊補助的對象。原本只補二行程機車，後來 2007 年 6 月 30 日以前出廠的老舊機車也能補。',
      'Since 2020 the environment ministry has extended its scrappage subsidy from two-stroke scooters to all scooters built before 30 June 2007.',
    ),
    period: t('2020 年起', 'From 2020'),
    place: TW,
    sources: ['moenv-air-review-2023'],
    locator: '「環境部自 109 年擴大汰舊補助對象至 96 年 6 月 30 日前出廠之老舊機車」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '這是 2020 年的規定。2026 年汰舊補助的條件已經不一樣。現在的各種方案，列在「這一環，你可以切斷」的補助資料裡。',
      'This is the 2020 rule; the conditions for 2026 are different. Today\'s schemes are listed with the subsidy figures under "The link you can break".',
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
      '台灣最新的空氣污染排放清冊是 TEDS 13.0，以 2023 年為基準年，2026 年 1 月公布。',
      'Taiwan\'s latest official list of air-pollution emissions is TEDS 13.0. Its base year is 2023, and it came out in January 2026.',
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds-page'],
    locator: '「TEDS13.0以民國112年為基準年…為目前台灣空氣污染排放清冊最新版本」「已於115年1月發布」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '不同版本的清冊（例如 TEDS 11.0、12.0）不能直接比；本站所有的排放占比，都只用 13.0 版。',
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
      '依 TEDS 13.0，2023 年全台直接排出的細懸浮微粒（PM2.5）約 33,731 公噸。揮發性有機物（油氣這一類的氣體）約 355,083 公噸，不算植物排的。',
      'Per TEDS 13.0, in 2023 Taiwan gave off about 33,731 tonnes of PM2.5 directly. It gave off about 355,083 tonnes of volatile organic compounds (fuel vapour and similar gases), not counting those from plants.',
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
      '燃油機車（二行程加四行程）排出的 PM2.5，只占全台灣直接排放 PM2.5 的 1.31%（每年 441.7 公噸）。',
      'Petrol scooters (two-stroke and four-stroke together) give off only 1.31% of the PM2.5 released directly in Taiwan (441.7 tonnes a year).',
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
      '燃油機車排出的非甲烷碳氫化合物（NMHC，大多是油氣），大約占全台灣的一成。這是 9.99%，每年 35,486.1 公噸。',
      'Petrol scooters give off about a tenth of Taiwan\'s non-methane hydrocarbons, mostly fuel vapour (9.99%, 35,486.1 tonnes a year).',
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
      '燃油機車排出的一氧化碳，占全台灣排放量的 15.59%（每年 74,540.1 公噸），超過七分之一。',
      'Petrol scooters give off 15.59% of Taiwan\'s carbon monoxide (74,540.1 tonnes a year): more than one-seventh.',
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
      '燃油機車排出的碳氫化合物（油氣這一類的氣體），總量占全台灣的 8.60%。這是每年 37,280.8 公噸。',
      'Petrol scooters give off 8.60% of Taiwan\'s total hydrocarbons (fuel vapour and similar gases): 37,280.8 tonnes a year.',
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
      '燃油機車排出的氮氧化物，占全台灣的 2.19%（每年 4,448.1 公噸）。',
      'Petrol scooters give off 2.19% of Taiwan\'s nitrogen oxides (4,448.1 tonnes a year).',
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
      '燃油機車排出的 PM10，只占全台灣的 0.54%（每年 591.6 公噸）。',
      'Petrol scooters give off only 0.54% of Taiwan\'s PM10 (591.6 tonnes a year).',
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
      '看占全台灣排放的比例：燃油機車的一氧化碳占 15.59%，大約是它 PM2.5 占比（1.31%）的 12 倍。碳氫化合物（大多是油氣）占 9.99%，大約是 7.6 倍。機車排得多的是氣體（一氧化碳和油氣），不是微粒。',
      'Looking at shares of Taiwan\'s emissions: petrol scooters\' share of carbon monoxide (15.59%) is about 12 times their share of PM2.5 (1.31%). Their share of hydrocarbons, mostly fuel vapour (9.99%), is about 7.6 times. What scooters give off a lot of is gas (carbon monoxide and fuel vapour), not particles.',
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
      '機車排的氣體，幾乎都來自四行程機車。四行程占全台灣一氧化碳排放的 15.05%，二行程只占 0.54%。不過機車排的 PM2.5，大約兩成還是來自二行程（441.7 公噸裡的 98.1 公噸）。',
      'Almost all the gas from scooters now comes from four-stroke engines: four-strokes give off 15.05% of Taiwan\'s carbon monoxide, two-strokes only 0.54%. But about a fifth of scooter PM2.5 (98.1 of 441.7 tonnes) still comes from two-strokes.',
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
      '電動機車沒有排氣管的廢氣，但還是有輪胎、煞車和路上揚起的粉塵。TEDS 13.0 推估，這些 PM2.5 每年 6.5 公噸（0.02%）。',
      'Electric scooters give off no tailpipe exhaust, but there is still dust from tyres, brakes and the road. TEDS 13.0 puts this PM2.5 at 6.5 tonnes a year (0.02%).',
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
      '所有在路上跑的車加起來，排出全台灣 49.1% 的一氧化碳、41.1% 的氮氧化物。還有 24.5% 的非甲烷碳氫化合物（大多是油氣），和 13.4% 直接排出的 PM2.5。',
      'All road vehicles together give off 49.1% of Taiwan\'s carbon monoxide and 41.1% of its nitrogen oxides. They also give off 24.5% of its non-methane hydrocarbons (mostly fuel vapour) and 13.4% of the PM2.5 released directly.',
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
      '依 TEDS 13.0，路上的車直接排出的 PM2.5（4,522.9 公噸）和氮氧化物（83,276.4 公噸），都比發電廠（874.6 和 33,278.0 公噸）多很多。',
      'Per TEDS 13.0, road vehicles give off far more PM2.5 directly (4,522.9 tonnes) and far more nitrogen oxides (83,276.4 tonnes) than power stations (874.6 and 33,278.0 tonnes).',
    ),
    period: TEDS_PERIOD,
    place: TW,
    sources: ['moenv-teds13-workbook', 'moenv-news-2025-power-sector'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '發電業的 PM2.5，是燃燒排的 791.0 公噸，加上沒分類的 83.6 公噸。這是比排放量，不是比空氣裡有多少。環境部明白反對把兩者混在一起。',
      'Power-station PM2.5 is 791.0 t from burning plus 83.6 t not classified. This compares amounts given off, not shares of the air. The environment ministry clearly says the two must be kept apart.',
    ),
    requiresCaveat: true,
    chainLink: 1,
    research: '01 §4, §5',
  },
  'teds13-dust-share': {
    data: { share: v(50.4, 'percent') },
    display: t('50.4%', '50.4%'),
    statement: t(
      '工地和道路的揚塵，占全台灣直接排出 PM2.5 的 50.4%，超過一半。',
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
      '環境部用電腦模式推估台灣空氣裡的 PM2.5 從哪裡來。平均約 35.1% 從國外飄來，約 64.9% 來自台灣自己。各地區不一樣。',
      'The environment ministry\'s computer model estimated that, on average, about 35.1% of the PM2.5 in Taiwan\'s air blows in from abroad. About 64.9% comes from Taiwan itself, and it differs from region to region.',
    ),
    period: t('2020年方案，使用TEDS 9.0（2013年基準）', '2020 plan, using TEDS 9.0 (2013 base)'),
    place: TW,
    sources: ['moenv-air-plan-2020'],
    locator: 'p.15: 「境外污染源平均約35.1%（各空品區29.0%~41.0%）、境內約64.9%（各空品區59.0%~71.0%）」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是用舊版清冊（TEDS 9.0）跑的模式結果，年代比較久；2020 年以後的全台推估，我們沒有找到。',
      'A model run on an old inventory (TEDS 9.0), so it is dated; we found no estimate for all of Taiwan published after 2020.',
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
      '台灣自己產生的 PM2.5 從哪裡來？電腦模式推估：工廠約占 27.5%。車輛這類移動的來源，約占 27.5%。揚塵這類飄散的來源，約占 45.0%。',
      'Of the PM2.5 made in Taiwan itself, the model put factories at about 27.5% and moving sources such as vehicles at about 27.5%. Dust and other loose sources made up about 45.0%.',
    ),
    period: t('2020年方案，使用TEDS 9.0（2013年基準）', '2020 plan, using TEDS 9.0 (2013 base)'),
    place: TW,
    sources: ['moenv-air-plan-2020'],
    locator: '「工業源影響比率平均約占27.5%」「移動源影響比率平均約占27.5%（各空品區8.8%~31.3%）」「逸散源影響比率平均約占45.0%」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這些比例是以「台灣自己產生的」為總數，不是全部的 PM2.5；而且是舊版清冊的模式結果。「移動源」是環境部的分類，報告沒說它只算路上的車，也沒有把機車分出來。',
      'These shares are of the PM2.5 made in Taiwan, not of all PM2.5, and they come from a model run on an old inventory. "Moving sources" is the environment ministry\'s group; the report does not say it covers only road vehicles, and it does not pick out scooters.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    research: '01 §5',
  },
  'ambient-pm25-power-share': {
    data: { share: v(2.3, 'percent', { approx: true }), nationalMean: v(13, 'ug/m3', { approx: true }) },
    display: t('約 2.3%', 'about 2.3%'),
    statement: t(
      '環境部說，台灣空氣裡 PM2.5 的一年平均（每立方公尺約 13 微克），約 2.3% 來自發電廠。',
      'The environment ministry says about 2.3% of the yearly average PM2.5 in Taiwan\'s air (about 13 µg/m³) comes from power stations.',
    ),
    period: t('2025 年 6 月環境部說明', 'MOENV statement, June 2025'),
    place: TW,
    sources: ['moenv-news-2025-power-sector'],
    locator: '「我國大氣中PM2.5約2.3%來自於電力業，這是指電力業對我國大氣中PM2.5年平均值約為13微克／立方公尺的貢獻比率」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是環境部說明的電腦模式推估。它指的是發電廠占全台灣 PM2.5 一年平均的多少，總數包括所有來源。這不是哪一個地方、哪一個時間的比例。它也不能直接和機車的排放量占比比。',
      'A model estimate given by the environment ministry: the power stations\' part of Taiwan\'s yearly average PM2.5, out of all sources. It is not the share at any one place or time. It cannot be compared directly with scooters\' share of emissions.',
    ),
    chainLink: 3,
    research: '01 §5',
  },
  'ambient-pm25-mobile-share-derived': {
    data: { share: v(18, 'percent', { approx: true, derived: true, note: '27.5% × 64.9% = 17.8%' }) },
    display: t('約 18%（推算）', 'about 18% (our estimate)'),
    statement: t(
      '移動的來源，占台灣自己產生的 PM2.5 的 27.5%；台灣自己產生的，占空氣裡的 64.9%。兩個相乘，移動的來源大約占台灣空氣裡 PM2.5 的 18%。這比發電廠的約 2.3% 多很多。',
      'Moving sources make 27.5% of the PM2.5 made in Taiwan, and Taiwan makes 64.9% of what is in its air. Multiplying the two suggests moving sources give roughly 18% of the PM2.5 in Taiwan\'s air. That is far more than the power stations\' roughly 2.3%.',
    ),
    period: t('混合年份（2020 年方案與 2025 年說明）', 'Mixed dates (2020 plan and 2025 statement)'),
    place: TW,
    sources: ['moenv-air-plan-2020', 'moenv-news-2025-power-sector'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['ambient-pm25-origin-2020-plan', 'ambient-pm25-domestic-sources-2020-plan', 'ambient-pm25-power-share'],
    caveat: t(
      '這是本站算的，不是環境部說的。18% 來自舊版清冊（TEDS 9.0）的模式結果，2.3% 是比較新的說明。兩個數字的年代和算法不同，只能大概比一比。「移動源」是環境部的分類。報告沒說它只算路上的車，也沒有把機車分出來。',
      'Our own arithmetic, not the environment ministry\'s. The 18% rests on an older model run (TEDS 9.0) and the 2.3% on a newer statement; they differ in date and method, so this is only a rough comparison. "Moving sources" is the ministry\'s group; the report does not say it covers only road vehicles, and it does not pick out scooters.',
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
      '一項研究用電腦模式，推估台灣各種車的排放。它把各種車每公里排多少，排了順序。機車的 PM2.5 和氮氧化物，比汽油車、柴油車少。機車的碳氫化合物（大多是油氣）比汽油車多，苯則排第一。論文只列順序，沒有列數字。',
      'A study used a computer model to estimate the emissions of Taiwan\'s road vehicles, and ranked how much each kind gives off per kilometre. Scooters give off less PM2.5 and nitrogen oxides than petrol and diesel vehicles. They give off more hydrocarbons (mostly fuel vapour) than petrol cars, and the most benzene of all. The paper gives only the order, not the numbers.',
    ),
    period: t('排序未註明年份（研究涵蓋 2013–2021 年）', 'Year of the ranking not stated (study covers 2013–2021)'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    locator: 'Abstract p.1 and Sec 4 p.18: PM2.5 and NOx diesel > gasoline > motorcycle; HC motorcycle > gasoline; benzene motorcycle > gasoline >= diesel. Fig 1 p.3 has an EF box with no values. VKT shares 42.6% / 32.6% in the abstract, year not stated.',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '排放係數來自美國的電腦模式（MOVES、MOBILE6.2）和實驗室資料，不是在路邊量的。全文沒有任何每公里的數字，所以算不出機車是汽車的幾倍。這個苯的順序，也很難和同一篇論文的一年總量對起來。2021 年汽油車排的苯（545 公噸），約是機車（286 公噸）的兩倍，論文沒有解釋。PM2.5 也算進了輪胎和煞車的磨損。四行程機車約占路上車輛行駛里程的 32.6%（摘要沒寫年份）。',
      'The factors come from US models (MOVES, MOBILE6.2) and laboratory data, not roadside readings. The paper has no per-kilometre numbers, so it cannot tell you how many times a car a scooter gives off. The benzene order is also hard to square with the same paper\'s yearly totals. In 2021 petrol cars gave off about twice as much benzene (545 t) as scooters (286 t), and the paper does not explain why. The PM2.5 figure includes tyre and brake wear. Four-stroke scooters made up about 32.6% of the distance driven on the roads (the abstract gives no year).',
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
      '一項研究用電腦模式推估：2021 年機車排了約 37,000 公噸碳氫化合物（大多是油氣）。這比汽油小客車和輕型車加起來的 39,000 公噸少一點。機車的量比 2013 年的 68,000 公噸，少了約 46%。',
      'A study using a computer model estimated that scooters gave off about 37,000 tonnes of hydrocarbons (mostly fuel vapour) in 2021. That is a little less than petrol cars and light vans together (39,000 t). The scooter figure had fallen about 46% from 68,000 t in 2013.',
    ),
    period: t('2013–2021 年（四個年度）', '2013–2021 (four years)'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    locator: 'Sec 3.1.1 (3) pp.9-10: motorcycles 68,000/48,000/38,000/37,000 t; gasoline 23,000/30,000/40,000/39,000 t; diesel 8,073/9,881/9,438/9,211 t (2013/2016/2019/2021)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是學者用電腦模式推估的，不是環境部的 TEDS 清冊，也不是空氣裡有多少。這裡的碳氫化合物（油氣這一類的氣體）是總量，也算進了推估的油氣蒸發。機車只有在 2013 和 2016 年排最多。論文結論寫「大多數碳氫化合物來自機車」，和它自己 2019、2021 年的數字對不起來。46% 是本站用論文的數字算的。',
      'A researchers\' model estimate, not the environment ministry\'s TEDS inventory, and not what is in the air. "Hydrocarbons" here means the total of fuel vapour and similar gases, including estimated fuel evaporation. Scooters gave off the most only in 2013 and 2016. The paper\'s conclusion that "most hydrocarbons came from motorcycles" does not match its own 2019 and 2021 figures. The 46% is our arithmetic on the paper\'s numbers.',
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
      '一項研究用電腦模式推估台灣的車輛排放（Tsai 等，2023）。2021 年機車排了約 286 公噸苯，汽油小客車和輕型車加起來排了 545 公噸。機車的苯比 2013 年的 1,048 公噸少了約 73%。作者認為，這是因為二行程機車淘汰、標準變嚴。',
      'A study used a computer model to estimate the emissions of Taiwan\'s road vehicles (Tsai et al., 2023). Scooters gave off about 286 tonnes of benzene in 2021, against 545 t from petrol cars and light vans. Scooter benzene had fallen about 73% from 1,048 t in 2013. The authors put this down to two-strokes leaving the road and stricter standards.',
    ),
    period: t('2013–2021 年（四個年度）', '2013–2021 (four years)'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    locator: 'Sec 3.2.1 (1) pp.12-13: motorcycles 1,048/571/344/286 t; gasoline 721/721/683/545 t; diesel 95/119/115/113 t',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '照論文印出的總量，機車只有在 2013 年排的苯最多。從 2016 年起，汽油小客車和輕型車排得比較多。所以這項推估，不支持「交通排的苯主要來自機車」。這是電腦模式算的全台灣排放量，不是走路的人吸到多少。73% 是本站用論文的數字算的。',
      'By the totals the paper prints, scooters gave off the most benzene only in 2013. From 2016 petrol cars and light vans gave off more. So this estimate does not back up calling scooters the main source of benzene from traffic. It is a modelled total for Taiwan, not what people on foot breathe. The 73% is our arithmetic on the paper\'s numbers.',
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
    display: t('苯 −73%、油氣這類碳氫 −46%', 'benzene −73%, fuel vapour and similar gases −46%'),
    statement: t(
      '一項研究用電腦模式推估台灣的車輛排放（Tsai 等，2023）。用它的數字算，機車排的苯從 2013 年到 2021 年少了約 73%。碳氫化合物（大多是油氣）少了約 46%。作者認為，這是因為二行程機車淘汰、標準變嚴。',
      'Worked out from a study that used a computer model of Taiwan\'s road vehicles (Tsai et al., 2023). Scooter benzene fell about 73% from 2013 to 2021, and hydrocarbons (mostly fuel vapour) about 46%. The authors put this down to two-strokes leaving the road and stricter standards.',
    ),
    period: t('2013–2021 年', '2013–2021'),
    place: TW,
    sources: ['tsai-2023-atmosphere'],
    confidence: 'verified',
    evidence: 'derived',
    derivedFrom: ['tsai2023-benzene-tonnes-2021', 'tsai2023-hc-tonnes-2021'],
    caveat: t(
      '百分比是本站用論文印出的總量算的，論文自己沒有印；論文也只算了四個年份。',
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
      '台灣在實驗室測了 43 輛騎過的四行程機車。每燒一公升油，第三期機車的一氧化碳比第五期多 156%。碳氫化合物（大多是油氣）多 84%。第四期的一氧化碳多 48%。第四期的碳氫化合物和第五期差不多。差別可能只是巧合（統計上不顯著）。氮氧化物反而是舊車比較少。',
      'In laboratory tests of 43 used four-stroke scooters in Taiwan, Phase 3 machines gave off 156% more carbon monoxide per litre of fuel than Phase 5. They gave off 84% more hydrocarbons (mostly fuel vapour). Phase 4 gave off 48% more carbon monoxide. Its hydrocarbons were about the same as Phase 5: the difference could be chance (not statistically significant). Older machines actually gave off less nitrogen oxides.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    locator: 'Table 1 p.4 (journal 3059): CO 216/125/84.3, HC 54.0/32.1/29.4, NOx 5.57/6.64/7.96 g/L (III/IV/V); n = 7/16/20; IV vs V HC p>0.05',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '數字是每公升油算的，不是每公里。第三期只有 7 輛，平均 15 年、約 45,600 公里。第五期有 20 輛，平均 4 年、約 12,200 公里。所以期別、車齡和里程混在一起，分不開。這是實驗室的滾筒測試，不是在路上量的，也沒有另外量怠速。論文沒寫測的車裡有幾輛是速克達。',
      'Figures are per litre of fuel, not per kilometre. Phase 3 had only 7 machines, 15 years old and about 45,600 km on average. Phase 5 had 20, 4 years old and about 12,200 km. So phase, age and mileage are mixed up. These were laboratory roller tests, not readings on the road, with no separate idling figure. The paper does not say how many of the machines were scooters.',
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
      '台灣在實驗室測了 43 輛騎過的機車（Tsai 等，2018），比較里程不同的車排的揮發性有機物（油氣這一類的氣體）。里程低的（約 5,231 公里），每公升油排 25.2 克。里程最高的一組（約 47,617 公里），排 47.1 克。不過只有 4 萬公里以上那一組，差別才不太像是巧合（統計上顯著）。苯、甲苯、二甲苯這類芳香烴，占揮發性有機物重量的 38% 到 48%。',
      'In laboratory tests of 43 used Taiwanese scooters (Tsai et al., 2018) compared VOCs (fuel vapour and similar gases) across mileage groups. At low mileage (about 5,231 km) they were 25.2 g per litre of fuel. In the highest-mileage group (about 47,617 km) they were 47.1 g. But only the group over 40,000 km differed from the lowest by more than chance would explain (statistically significant). Aromatics such as benzene, toluene and xylenes made up 38–48% of the VOCs by weight.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    locator: 'Abstract; Fig. 4 p.7; text p.3061-3063; group composition text p.3061',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '論文裡的數字前後不一致。摘要和圖 4 寫低里程是 25.2，內文寫 19.1；本站用和圖一樣的 25.2。4 萬公里以下的增加，可能只是巧合（統計上不顯著）。中間還有一組反而比較低。數字是每公升油算的。百分比只算了分析的 67 種物質，論文沒有列苯自己排多少。',
      'The paper\'s numbers disagree: the abstract and Fig. 4 give 25.2 at low mileage, the text gives 19.1. We use 25.2, which matches the figure. The rise below 40,000 km could be chance (not statistically significant), and one middle group was lower. Figures are per litre of fuel. The percentages cover only the 67 substances analysed, and the paper gives no figure for benzene itself.',
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
      '同一批 43 輛騎過的機車，在台灣做實驗室測試（Tsai 等，2018）。比較里程最低和最高的兩組：每公升油的一氧化碳，從 61 克增加到 203 克，約 3.3 倍。碳氫化合物（大多是油氣）從 27 克增加到 47 克；3 萬公里以上，差別才不太像是巧合（統計上顯著）。氮氧化物則從 9.1 克降到 5.4 克。',
      'In the same laboratory tests of 43 used Taiwanese scooters (Tsai et al., 2018), the lowest- and highest-mileage groups were compared. Carbon monoxide rose from 61 to 203 g per litre of fuel, about 3.3 times. Hydrocarbons (mostly fuel vapour) rose from 27 to 47 g; only above 30,000 km was the difference more than chance would explain (statistically significant). Nitrogen oxides fell from 9.1 to 5.4 g.',
    ),
    period: t('2018年發表', 'Published 2018'),
    place: TW,
    sources: ['tsai-2018-aaqr'],
    locator: 'Text PDF p.5 (journal 3060); Fig. 3(a)-(c) PDF p.6',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是比較不同的車，不是同一輛車追蹤好幾年；里程、車齡和期別混在一起。各組的平均不是一路往上，有一組中里程的反而比較低。數字是每公升油算的，不是每公里。',
      'This compares different machines, not the same scooters followed over the years; mileage, age and phase are mixed up. The group averages do not rise steadily: one middle group was lower. Figures are per litre of fuel, not per kilometre.',
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
      '一項研究測了 10 輛騎過的機車排出的微粒。微粒上帶有多環芳香烴（一類化學物質）。里程高的車（30,001 到 50,000 公里），這些物質的致癌毒性，約是里程低的 4.67 倍、中里程的 1.99 倍。',
      'A test of ten used scooters looked at the PAHs (a family of chemicals) carried on their exhaust particles. From high-mileage machines (30,001–50,000 km) they were about 4.67 times as cancer-causing as from low-mileage machines, and 1.99 times those from mid-mileage ones.',
    ),
    period: t('2019年發表', 'Published 2019'),
    place: TW,
    sources: ['lin-2019-jhm'],
    locator: 'Abstract: total p-PAH EF 67.6 ± 13.6 µg/km; high-mileage TEQ ~4.67× / 1.99× low / mid',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只測了 10 輛。引用它的隧道研究（Ting 等，2023）說，這是實驗室的滾筒測試。不是在路上或怠速時量的。' + ABSTRACT_ONLY['zh-TW'],
      'Only ten scooters; according to the tunnel study that cites it (Ting et al., 2023), these were laboratory roller tests, not readings on the road or at idle. ' + ABSTRACT_ONLY.en,
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
      '在台北自強隧道裡量：平日大約一半的車是機車（51.8%）。隧道裡的一氧化碳，跟著機車的多少一起起伏（相關係數 0.96，越接近 1 越一致）。同一個隧道的 PM2.5 和黑碳，則主要跟著大型車變。',
      'In measurements inside Taipei\'s Ziqiang Tunnel, about half the weekday traffic was scooters (51.8%). Carbon monoxide rose and fell with the number of scooters (correlation 0.96, where 1 means they move exactly together). PM2.5 and black carbon in the same tunnel followed the big vehicles instead.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道（819 公尺）', 'Ziqiang Tunnel, Taipei (819 m)'),
    sources: ['ting-2023-envres'],
    locator: 'Sec 3.1.1 p.4 (fleet shares); Sec 3.1.3 p.5 (MC vs CO r = 0.96; LDV vs CO2 r = 0.95); Sec 3.1.2 and 3.1.4 (PM2.5 and eBC with HDV)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '一起起伏，不代表就是機車排的；機車和汽車本來也會一起變多變少。一氧化碳是用自己做的便宜感測器量的，內文沒寫怎麼校正。這是隧道裡行駛中的車，論文沒寫車速。這不是路口怠速，也不是行人站的位置。電動、二行程和四行程機車也沒有分開。',
      'Rising and falling together does not prove one causes the other, and scooter and car numbers go up and down together anyway. Carbon monoxide was measured with home-made low-cost sensors, and the main text does not say how they were checked. This is moving traffic in a tunnel, and the speeds are not given. It is not idling at a junction or where people on foot stand. Electric, two-stroke and four-stroke scooters are not told apart.',
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
      '這是用台北自強隧道量到的資料推算的。機車每燒一公斤油，排 0.209 公斤一氧化碳；小客車是 0.022 公斤。用每公里算，是 4.33 克對 2.06 克，大約兩倍。',
      'Worked out from readings in Taipei\'s Ziqiang Tunnel: a scooter gives off 0.209 kg of carbon monoxide per kg of fuel burned, a car 0.022 kg. Per kilometre it is 4.33 g against 2.06 g, about twice as much.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道', 'Ziqiang Tunnel, Taipei'),
    sources: ['ting-2023-envres'],
    locator: 'Table 3 (FCEF) and Table 4 (VKEF), Ziqiang CO rows, p.7',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '各種車的數字，是從車流比例推算出來的；論文沒說「±」是標準差還是標準誤。小客車每公斤油的誤差範圍，幾乎和數字本身一樣大，所以「約 10 倍」很不準；倍數是本站算的。機車假設全部燒汽油，油耗用的是 2018 年新車的規格。同一張表裡，比較早在台灣路上量的機車一氧化碳是每公里 7.65 克。',
      'Each vehicle type\'s figure is worked back from the traffic mix, and the paper does not say whether "±" is a standard deviation or a standard error. For cars the uncertainty per kg of fuel is almost as big as the number itself, so "about 10 times" is very rough; the ratios are our arithmetic. All scooters were assumed to burn petrol, with fuel use taken from 2018 new-scooter specifications. An older on-road Taiwanese figure in the same table is 7.65 g of carbon monoxide per km for scooters.',
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
      '在台北自強隧道量了三類車。研究推估，機車每公里排的 PM2.5 和黑碳最少，小到和零分不出來。PM2.5 的增加，主要跟大型車有關（相關係數 0.78，越接近 1 越一致）。這項研究不支持「燃油機車是微粒的主要來源」。',
      'In measurements in Taipei\'s Ziqiang Tunnel, scooters had the lowest estimated PM2.5 and black carbon per kilometre of the three vehicle types, too small to tell from zero. The rise in PM2.5 went with the big vehicles (correlation 0.78, where 1 means they move exactly together). This study does not back up calling petrol scooters a main source of particles.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道', 'Ziqiang Tunnel, Taipei'),
    sources: ['ting-2023-envres'],
    locator: 'Table 4 p.7 (VKEF eBC and PM2.5 by class); Sec 3.1.2 p.4-5 (r = 0.78)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '研究推估機車 PM2.5 時，誤差範圍大約是數字本身的 70 倍。「大型車」沒有把小貨車分出來，研究者猜其中約七成可能是小貨車。隧道裡的數字，也可能包括輪胎、煞車磨下來的粉塵和揚塵。',
      'The uncertainty on the scooter PM2.5 estimate is about 70 times the estimate itself. The "big vehicle" count did not separate out vans, which the researchers think may be about 70% of it. The tunnel figures may also include tyre and brake wear and road dust.',
    ),
    chainLink: 1,
    research: 'papers/ting-2023-envres#mc-pm-ebc-low; papers/ting-2023-envres#pm25-hdv-correlation; papers/ting-2023-envres#hdv-ratios; papers/ting-2023-envres#nonexhaust-note',
  },
  'tunnel-fresh-particles-op-ting2023': {
    data: {},
    display: t('新鮮微粒每微克氧化潛勢較低', 'fresh particles less potent per microgram'),
    statement: t(
      '台北自強隧道的研究（Ting 等，2023），也在實驗室用試劑（DTT）測微粒。測的是「氧化潛勢」，也就是微粒引起氧化反應的能力。同樣重的微粒，隧道出口剛排出來的，一般比入口比較舊的微粒低。出口每立方公尺空氣的氧化潛勢比較高，是因為微粒比較多。',
      'The Ziqiang Tunnel study in Taipei (Ting et al., 2023) also tested the particles\' "oxidative potential" with a laboratory test (DTT): how strongly they set off oxidation. Microgram for microgram, the fresh particles at the tunnel exit were generally less potent than the older particles at the entrance. Each cubic metre of air at the exit scored higher only because it held more particles.',
    ),
    period: t('2020年3月14–23日', '14–23 March 2020'),
    place: t('台北市自強隧道', 'Ziqiang Tunnel, Taipei'),
    sources: ['ting-2023-envres'],
    locator: 'Sec 3.3 p.8; Fig. 5; Table 5 (OPv 0.15-0.46 nmol/min/m3)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '氧化潛勢是實驗室裡的替代指標，不是健康結果；作者講的原因只是猜想，沒有量微粒的成分，也沒有做統計檢定。這個結果，讓「剛排出來的廢氣微粒特別毒」的說法站不太住。',
      'Oxidative potential is a laboratory stand-in, not a health outcome; the authors\' explanation is a guess, with no measurement of what the particles were made of and no statistical test. The result undercuts the idea that fresh exhaust particles are especially toxic.',
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
      '一項研究用電腦模式推估台北市中心的空氣。超過 90% 的一氧化碳、80% 的氮氧化物，和大約一半的 PM2.5，來自車子的排放。',
      'A study used a computer model of the air in central Taipei. It estimated that vehicles give more than 90% of the carbon monoxide, 80% of the nitrogen oxides and about half the PM2.5 there.',
    ),
    period: t('2021年發表', 'Published 2021'),
    place: t('台北市中心', 'Downtown Taipei'),
    sources: ['tsai-2021-stoten'],
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '說的是所有車子，不只機車。這是用電腦模式（CMAQ）跑出來的結果。' + ABSTRACT_ONLY['zh-TW'],
      'All vehicles, not just scooters, and a run of a computer model (CMAQ). ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 3,
    research: '02 §4',
  },
  'traffic-mix-new-taipei-tsai2024': {
    data: { sedansAndScooters: v(90, 'percent', { approx: true }) },
    display: t('約九成', 'about 90%'),
    statement: t(
      '用攝影機分析新北市的道路，小客車和機車加起來約占九成的車。研究者認為，現在的排放清冊可能低估了機車和公車對空氣的影響。',
      'Camera analysis of New Taipei roads found cars and scooters made up about 90% of vehicles. The researchers think today\'s emissions inventories may underestimate how much scooters and buses affect the air.',
    ),
    period: t('2021 年 9 月至 2023 年 6 月', 'September 2021 – June 2023'),
    place: t('新北市', 'New Taipei City'),
    sources: ['tsai-2024-aeax'],
    locator: 'Abstract: "current emission inventories may underestimate the impact of scooters and buses on air quality while overestimating the trucks\' contribution"',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('這是看兩件事有沒有一起變，「可能低估」只是研究者的推論。' + ABSTRACT_ONLY['zh-TW'], 'It looks at what goes up and down together; the possible underestimate is the researchers\' own guess. ' + ABSTRACT_ONLY.en),
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
    display: t('油氣這類有機氣體 −100%', 'VOCs (fuel vapour and similar gases) −100%'),
    statement: t(
      '一項研究用電腦模式推估 2016 年的排放。電動重型機車每公里排的油氣這一類氣體（揮發性有機物），比燃油機車少 100%。氮氧化物少 97.4%，溫室氣體少 76.8%。但硫氧化物大約是 2.4 倍。',
      'A modelling study estimated emissions in 2016. Electric scooters (Taiwan\'s ordinary white-plate class) gave off 100% less VOCs (fuel vapour and similar gases) per kilometre than petrol scooters. They gave off 97.4% less nitrogen oxides and 76.8% less greenhouse gas, but about 2.4 times the sulphur oxides.',
    ),
    period: t('2016 年（推估）', '2016 (modelled)'),
    place: TW,
    sources: ['hsieh-2018-iop'],
    locator: 'Abstract: "the EF of TSP, NOx, VOCs, and CO2e for ESH reduce by, respectively, 14.8%, 97.4%, 100%, and 76.8% per kilometer travelled in 2016"',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是研討會論文的模式推估；電動機車的排放算在發電廠（會隨發電方式改變），不是街上的排放；摘要沒有一氧化碳的數字。',
      'A model in a conference paper; the electric scooters\' pollution is counted at the power stations (and changes with how the power is made), not on the street. The abstract gives no carbon monoxide figure.',
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
    display: t('10 處路口', '10 junctions'),
    statement: t(
      '交通部運輸研究所，在台北、新北和高雄的 10 個路口量空氣。他們在斑馬線旁邊放固定的感測器，量 PM2.5 和一氧化碳，每個路口連續量 48 小時。吸空氣的口離地 1.2 到 1.5 公尺，大約是呼吸的高度。各種改善做法的效果，則用電腦模式去推算。',
      'The transport ministry\'s Institute of Transportation measured the air at 10 junctions in Taipei, New Taipei and Kaohsiung. Fixed sensors beside the crossing measured PM2.5 and carbon monoxide for 48 hours at each. The air inlet was 1.2–1.5 m up, about where people breathe. The effects of changes to the street were then worked out with a computer model.',
    ),
    period: t('2023–2024 年量測，2025 年 12 月出版', 'Measured 2023–2024, published December 2025'),
    place: t('台北市、新北市、高雄市', 'Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: '02 §1a: 「Fixed micro-sensors (PM2.5, CO) beside the crosswalk, inlet 1.2-1.5 m above ground」; 10 intersections (4 in 2023, 6 in 2024), 48 h each',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '感測器是固定在路口的小型感測器，不是戴在行人身上。它只量 PM2.5 和一氧化碳，沒有量苯或超細微粒。改善做法的效果是電腦推算的，不是改了以後前後量的。報告封面寫著，結論不代表交通部的意見。',
      'The sensors were small ones fixed at the junction, not worn by people. They measured only PM2.5 and carbon monoxide, not benzene or ultrafine particles. The effects of the changes were worked out on a computer; nobody took readings before and after a real change. The report\'s cover says its conclusions are not the transport ministry\'s view.',
    ),
    editorNote: 'Split from the modelled scenario facts: the design sentence is mostly measurement, so evidence is measured-tw; the dispersion-model part is stated in the caveat. The red-light sweep (redlight/intersection-peaks) could not re-open the PDF; figures rest on the first, verified reading (research/02 §1a). iot.gov.tw also reset the connection when tried again on 2026-11-26.',
    chainLink: 3,
    research: '02 §1a',
  },
  'iot-scramble-typical-range': {
    data: { reductionLow: v(-2.58, 'percent'), reductionHigh: v(-21.4, 'percent') },
    display: t('約 3%～21%', 'about 3–21%'),
    statement: t(
      '運研所用電腦模式，推算高雄這個路口整天實施行人專用時相。行人專用時相，就是所有車都停，行人往各方向走。報告文字寫，行人等候區的 PM2.5 少約 3% 到 21%。這不算不正常的第 2 個推算日。',
      'The Institute of Transportation modelled an all-day scramble crossing at this Kaohsiung junction (all traffic stops while people cross every way). The report\'s text says it lowered PM2.5 in the pedestrian waiting area by roughly 3% to 21%. That leaves out the odd computed Day 2.',
    ),
    period: t('用 2024 年實測資料，由電腦推算', 'Simulation using 2024 field data'),
    place: t('高雄市左營區高鐵路／重信路口', 'Gaotie Rd / Chongxin Rd junction, Zuoying, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'p.4-28: 「實施全天時段行人專用時相下…於行人等候區增減幅度為-21.40%至-2.58%」 (excludes the outlier Day 2)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是報告第 4-28 頁的描述。說的是等候區各計算點的平均，不是每個推算日的數字。這個路口各推算日的全天平均，少約 12% 到 18%。其中第 3、4 天的推算，沒有通過報告的模式檢查。台北和新北的路口少得更少，約 4% 到 10%。有一個推算日 PM2.5 反而多了約 10%，那一天沒有通過模式檢查。推算的一氧化碳也常變多。' + IOT_CAVEAT['zh-TW'],
      'This is the report\'s description (p.4-28) of the average over the points it calculated in the waiting area, not a set of daily results. The all-day averages for each computed day at this junction fell by about 12% to 18%. Days 3 and 4 failed the report\'s check on the model. At the Taipei and New Taipei junctions the falls were smaller, about 4–10%. PM2.5 rose by about 10% on one computed day, a day that failed the check. Computed carbon monoxide often rose. ' + IOT_CAVEAT.en,
    ),
    editorNote: 'Two ranges for one site: 3-21% is the p.4-28 text (受體點位平均, waiting area, excl. Day 2); 12-18% is Table 4.3.2-30 per-day all-day values (-17.79*, -16.22#, -12.00#). Never call 3-21% "typical simulated days". Never generalise beyond this Kaohsiung intersection.',
    requiresCaveat: true,
    chainLink: 3,
    research: '02 §1a, Corrections #1',
  },
  'iot-scramble-outlier-day': {
    data: { allDay: v(-94.86, 'percent'), peakOnly: v(-94.43, 'percent') },
    display: t('94%（只有一個推算日，而且特別高）', '94% (one outlier simulated day)'),
    statement: t(
      '常被引用的「少 94%」，只出現在高雄一個路口、電腦推算的一天。報告自己說，這一天的結果明顯比其他推算值高。同一個路口另外三個推算日，全天平均少約 12% 到 18%。其中兩天的推算，沒有通過模式檢查。',
      'The often-quoted "94% less" comes from one day worked out by computer at one Kaohsiung junction. The report itself says that day\'s result was clearly higher than its others. On the other three computed days at the same junction the all-day average fell by about 12% to 18%. Two of those days failed the check on the model.',
    ),
    period: t('電腦推算的第 2 天（2024 年資料）', 'Simulation Day 2 (2024 data)'),
    place: t('高雄市左營區高鐵路／重信路口', 'Gaotie Rd / Chongxin Rd junction, Zuoying, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Table 4.3.2-30: all-day −17.79*, −94.86*, −16.22#, −12.00#; peak-only −7.87, −94.43*, −9.54#, −2.92#. Text: 「第 2 天模擬結果最具有差異性，明顯高於其他模擬值」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是電腦算出來的值，不是量的。它比的是行人等候區「有」和「沒有」專用時相兩種情形，不是只看機車。那一天「沒有專用時相」的基準值高得不正常，報告沒說為什麼。同一個路口第 3、4 天的推算，沒有通過模式檢查。這一天的 94%，不代表行人專用時相一般的效果。',
      'A computer-model value, not a reading. It compares the waiting area with and without a scramble phase, and is not about scooters in particular. On that day the "without" starting value was unusually high, and the report does not say why. Days 3 and 4 at the same junction failed the check on the model. The 94% is not what a scramble crossing usually does.',
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
      '在台北和新北的路口，電腦模式推算了整天實施行人專用時相。結果一氧化碳反而多了約 7% 到 40%。',
      'At the Taipei and New Taipei junctions, the model showed simulated carbon monoxide going up by about 7% to 40% with an all-day scramble crossing.',
    ),
    period: t('用 2024 年實測資料，由電腦推算', 'Simulation using 2024 field data'),
    place: t('台北市、新北市路口（一般路口、單一背景源）', 'Taipei and New Taipei junctions (general, single background source)'),
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
      '在模式裡把人行道加寬 0.5 公尺，PM2.5 的變化從少 1.88% 到多 5.34% 都有，方向不一致；媒體報的「約 2%」是最好的情況。',
      'In the model, widening the pavement by 0.5 m changed PM2.5 by anything from 1.88% less to 5.34% more, with no steady direction. The "about 2%" in news reports is the best case.',
    ),
    period: t('用 2024 年實測資料，由電腦推算', 'Simulation using 2024 field data'),
    place: t('台北市、新北市、高雄市路口', 'Junctions in Taipei, New Taipei and Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Tables 4.3.2-29..32, sidewalk +0.5 m. Report conclusion (p.6-2) still calls it the 較佳 measure across background types.',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '報告的結論還是認為，在各種路口裡，加寬 0.5 公尺是比較好的做法。' + IOT_CAVEAT['zh-TW'],
      'The report still concludes that widening by 0.5 m is the better choice across types of junction. ' + IOT_CAVEAT.en,
    ),
    chainLink: 3,
    research: '02 §1a',
  },
  'iot-setback-measured': {
    data: { reductionA: v(0.46, 'ug/m3'), reductionB: v(0.94, 'ug/m3', { note: '重慶北路/酒泉街' }) },
    display: t('降低 0.46 與 0.94 µg/m³', '0.46 and 0.94 µg/m³ lower'),
    statement: t(
      '第一年在路口實測：把行人等候區移開，離機車待轉區遠一點。之後尖峰時段等候區的 PM2.5，平均少了 0.46 和 0.94 µg/m³，少得很少。',
      'In the first year of field measurements, the pedestrian waiting area was moved away from the scooters\' two-stage turn box. Average PM2.5 there in rush hour then fell by 0.46 and 0.94 µg/m³: very small changes.',
    ),
    period: t('第一年（2023 年）尖峰時段實測', 'Year-one (2023) peak-hour measurements'),
    place: t('量測路口（例如重慶北路／酒泉街路口）', 'Measured junctions (e.g. Chongqing N. Rd / Jiuquan St)'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'p.1-6 / 附1-4: reductions 0.46 and 0.94 µg/m³ (重慶北路/酒泉街 0.94)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '報告摘要（第 1–6 頁）也寫到兩件事。有一個等候區往後移的路口，移了以後 PM2.5 反而略高一點。另一個行人專用時相的路口，號誌切換前後的資料很不穩定。所以站遠一點有沒有用，量不出明顯的差別。',
      'The report\'s summary (p.1-6) also says two things. At the junction where the waiting area was moved back, PM2.5 was slightly higher afterwards. At the scramble-crossing junction the readings were very unsteady around each change of signal. So no clear difference from standing further back could be measured.',
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
      '2024 年 7 月在路口量到的 PM2.5，大多在 4 到 14 µg/m³之間，和附近環境部測站每小時的 2 到 20 µg/m³差不多。',
      'In July 2024 the PM2.5 measured at the junctions was mostly 4–14 µg/m³, about the same as the 2–20 µg/m³ an hour at nearby environment-ministry stations.',
    ),
    period: t('2024 年 7 月', 'July 2024'),
    place: t('高雄市高鐵路／重信路口等量測路口', 'Measured junctions incl. Gaotie Rd / Chongxin Rd, Kaohsiung'),
    sources: ['iot-2025-intersection-air-quality'],
    locator: 'Fixed-sensor PM2.5 mostly 4–14 µg/m³ at 高鐵路/重信路; MOENV stations 2–20 (板橋 2–13, 左營 4–18, 愛國國小 1–20)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '夏天空氣裡的污染本來就少。感測器只量 PM2.5 和一氧化碳，沒有量油氣或苯。',
      'Summer levels are low anyway. The sensors measured only PM2.5 and carbon monoxide, not fuel vapour or benzene.',
    ),
    chainLink: 3,
    research: '02 §1a',
  },
  'iot-exhaust-height-assumption': {
    data: { exhaustHeight: v(0.5, 'metres'), sensorHeightLow: v(1.2, 'metres'), sensorHeightHigh: v(1.5, 'metres') },
    display: t('0.5 公尺（模式假設）', '0.5 m (model assumption)'),
    statement: t(
      '運研所的電腦模式，把汽機車排氣管設在離地 0.5 公尺。這是模式的假設，不是量到的。',
      'The Institute of Transportation\'s computer model puts car and scooter exhaust at 0.5 m above the ground. This is an assumption of the model, not a measurement.',
    ),
    period: t('2025 年報告', '2025 report'),
    place: TW,
    sources: ['iot-2025-intersection-air-quality'],
    locator: '「高度參考汽車、機車排氣管的離地高度設定為 0.5m」',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '0.5 公尺是模式裡設的一個高度，不是量到的；真正的排氣管高度，每種車不一樣。同一份報告裡，現場的感測器放在 1.2 到 1.5 公尺高。',
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
      '大台北一項研究，請五位志願者拿手持的便宜感測器去量。沿街走路時，PM2.5 的中位數（讀數排好後正中間那一個）是 40 µg/m³，共 216 筆讀數。這比開冷氣的公車（35）和關窗開冷氣的汽車（15）高。同一段時間，政府測站的中位數是 14。',
      'In a Taipei-area study, five volunteers carried a cheap hand-held sensor. Walking along streets, the middle PM2.5 reading was 40 µg/m³ (216 readings). That is above air-conditioned buses (35) and cars with windows shut and air conditioning on (15). Government stations read 14 over the same period.',
    ),
    period: t('2019 年 4–7 月（北台灣 PM2.5 最低的季節）', 'April–July 2019 (the lowest-PM2.5 season in northern Taiwan)'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Results p.5, p.8-9; Fig. 8 p.10; station values p.4',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '感測器沒有校正過；作者從廠商的測試推想，讀數大約偏高 30%，但所有結果都沒有調整。走路（40）和公車（35）差得不多；這些讀數是同一趟路上重複量的，不是各自獨立的樣本。走路的數字包括所有來源，論文沒有把交通和別的來源分開。',
      'The sensor was not checked against a standard; from a maker\'s test, the authors think it reads about 30% high, but none of the results were adjusted. Walking (40) and the bus (35) are close, and the readings are repeats on the same trips, not separate samples. The walking figure includes every source; the paper does not split traffic from the rest.',
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
      '大台北一項手持感測器的研究（Wang 等，2021），量騎士的 PM2.5。只在機車停下來時量，例如等紅燈。三趟一共 21 筆讀數，中位數（正中間那一個）是 75 µg/m³，大約是走路中位數的兩倍。這是騎士停下來時的數字，不是騎車時，也不是行人。',
      'A Taipei-area study with a hand-held sensor (Wang et al., 2021) measured riders\' PM2.5 only while the scooter was stopped, for example at a red light. The middle value of 21 readings over three trips was 75 µg/m³, about twice the walking figure. These are riders at a stop, not riding along, and not people on foot.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Methods 2.4 p.4 (idle only); Results p.8; Discussion p.11',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只有三趟、21 筆讀數，同一趟裡的讀數也不是各自獨立的；論文沒說機車是不是燒汽油。感測器大約偏高 30%（沒有調整）。作者猜騎車時吸到的「可能」比較少，但沒有量。另一項研究量到的 53.6，對象和方法都不同，兩個數字不是同一個範圍的兩頭。',
      'Only three trips and 21 readings, and readings on the same trip are not separate samples; the paper does not say whether the scooter ran on petrol. The sensor reads about 30% high (not adjusted). The authors think riders "probably" breathe less while moving, but did not measure it. Another study\'s 53.6 comes from different people and methods; the two are not the two ends of one range.',
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
      '大台北一項手持感測器的研究（Wang 等，2021），也量了捷運。地下段捷運車站和車廂，PM2.5 中位數是 75 到 80 µg/m³。這和機車停下來時差不多。高架段只有 20 到 33。所以吸到很多，不只在街上。作者認為，地下段的微粒來自車輪和鐵軌的磨損、通風不好，不是排氣管。',
      'In the Taipei-area hand-held sensor study (Wang et al., 2021), underground MRT stations and carriages had middle PM2.5 readings of 75–80 µg/m³. That is about the same as scooters at a stop; raised sections read 20–33. So high levels are not only found on the street. The authors put the underground particles down to wheel and rail wear and poor air flow, not tailpipes.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Results p.6 and p.8; Discussion p.10, p.12',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '摘要和內文的數字對不起來：車站 80 對 75，高架車廂 28 對 20。本站用內文的。捷運是用電的軌道，這個結果和電動機車無關。它不能拿來支持或反對電動機車。',
      'The abstract and the main text disagree (stations 80 vs 75; raised carriages 28 vs 20); we use the main text. The MRT runs on electricity on rails; this says nothing for or against electric scooters.',
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
      '大台北一項手持感測器的研究（Wang 等，2021），在測站附近同時量了 24 次。街上的讀數比測站高，但兩者的關係很弱（R² = 0.275，越接近 1 越一致）。也就是說，測站的數字不能準確代表在街上走路的人吸到的空氣。',
      'A Taipei-area hand-held sensor study (Wang et al., 2021) took 24 readings at the same time near air stations. The street read higher than the station, but only loosely related to it (R² = 0.275, where 1 means they match exactly). So station figures cannot stand in for what someone walking down the street breathes.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Fig. 2 p.5: S = 0.958 M + 23.353, R2 = 0.275, p = 0.006, 24 pairs, five stations',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '作者認為，差距來自測站的高度、儀器原理不同和感測器偏高。他們沒有算交通占多少。同一研究在室內的讀數也常比測站高。所以街上和測站的差距，不全是交通來的。',
      'The authors put the gap down to station height, different instruments and the sensor reading high. They did not work out how much is traffic. Indoor readings in the same study were often above the station too. So the street-station gap is not all down to traffic.',
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
      '大台北一項手持感測器的研究（Wang 等，2021）裡，有寫出來源的最高讀數不是交通。一個是廟裡燒香（平均 588 µg/m³），一個是地下美食街煮東西（405）。人行道上最高的 275，沒有寫來源。',
      'In a Taipei-area hand-held sensor study (Wang et al., 2021), the highest readings with a named source were not traffic. They came from temple incense (588 µg/m³ on average) and cooking in an underground food court (405). The highest pavement reading, 275, has no stated source.',
    ),
    period: t('2019年4–7月', 'April–July 2019'),
    place: TAIPEI_METRO,
    sources: ['wang-2021-atmosphere'],
    locator: 'Section 3 p.6; Table 3; Discussion p.11; Fig. 8 outliers',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這些高值都不是來自機車。所以街上偶爾量到的極端高值，說明不了機車廢氣。人行道最高的 275，研究沒有說來自哪裡，所以也不能算在廟宇或交通頭上。',
      'None of these peaks came from scooters, so extreme street readings say nothing about scooter exhaust. The study does not say where the 275 came from, so it cannot be put down to temples or traffic either.',
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
      '台北一項研究找了 120 位健康的年輕人，量他們早上通勤一小時身上的 PM2.5。平均值：走路 42.7 µg/m³，騎燃油機車 53.6，搭捷運只有 21.7。走路和騎機車，都明顯比搭捷運、開車高。但走路和騎機車互相比，或和搭公車比，差別可能只是巧合（統計上不顯著）。',
      'A Taipei study measured the PM2.5 on 120 healthy young adults during a one-hour morning commute. On average: 42.7 µg/m³ walking, 53.6 on a petrol scooter, and only 21.7 on the metro. Walking and scooter riding were higher than the metro and the car by more than chance would explain. But the gaps between walking and riding, and between them and the bus, could be chance (not statistically significant).',
    ),
    period: t('上午9至10點；2017年2月至2019年12月', '09:00–10:00; February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 1 p.3, PM2.5 rows; Scheffe pairs Sc/S, Sc/C, W/S, W/C, WM/S, WM/C',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只量了早上一小時，論文沒寫路線和車流。騎士的數字是騎士自己吸到的，不是站在機車旁邊的行人。只量 PM2.5，沒有量一氧化碳或苯。論文表 1 寫每種方式 20 人，和「每人六種方式各量一次」對不起來，論文沒有解釋。另一項研究量到的 75，對象和方法都不同，兩個數字不是同一個範圍的兩頭。',
      'Only one morning hour, and the paper does not describe the routes or the traffic. A rider\'s value is what the rider breathed, not a pedestrian beside the scooters. Only PM2.5 was measured: no carbon monoxide or benzene. Table 1 lists 20 people per mode, which does not match "six measurements per participant", and the paper does not explain. Another study\'s 75 comes from different people and methods; the two are not the two ends of one range.',
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
      '環保署 2017 年用小型感測器，做了台北通勤調查。騎機車的 PM2.5 平均最高（32.1 µg/m³），開冷氣的汽車最低（7.6）。環保署也建議民眾避開要等很久的路口。',
      'The EPA\'s 2017 Taipei commuting survey with small sensors found the highest average PM2.5 on scooters (32.1 µg/m³). The lowest was in air-conditioned cars (7.6). The EPA advised people to avoid junctions with long waits.',
    ),
    period: t('2017 年 4 月 10、12、13、14 日與 5 月 4 日；2018 年 5 月 31 日發布', '10, 12, 13, 14 April and 4 May 2017; released 31 May 2018'),
    place: TAIPEI_METRO,
    sources: ['moenv-2018-taipei-commute-press'],
    locator: 'Press release: car 7.6, MRT 21.9, bus 23.5, motorcycle 32.1 µg/m3; 機動車輛近距離排氣加成',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '量的是騎士和乘客，不是路口的行人；新聞稿沒寫量了幾個人，也沒有每個路口的資料。',
      'It measured riders and passengers, not people waiting at crossings; the press release gives no number of people and no figures for individual junctions.',
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
      '在台北四條路線上，研究助理騎租來的電動機車，在車道上和汽機車一起走。所以他們吸到的是旁邊車子的廢氣，不是自己的。苯這一類（BTEX：苯、甲苯、乙苯、二甲苯）平均 33.96 ppb。在同一路線騎腳踏車的，是 20.07 ppb。PM2.5 則是 27.65 對 23.27 µg/m³。',
      'On four Taipei routes, research assistants rode rented electric scooters in the traffic lane. So they breathed the exhaust of the traffic around them, not their own. They averaged 33.96 ppb of the benzene family (BTEX: benzene, toluene, ethylbenzene, xylenes). Cyclists on the same routes averaged 20.07 ppb. PM2.5 was 27.65 against 23.27 µg/m³.',
    ),
    period: t('2017 年 11 月至 2018 年 4 月，尖峰與離峰時段', 'November 2017 to April 2018, rush and non-rush hours'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Abstract; Section 3.1 p.5; design p.3 (WeMo electric scooters "to prevent self-pollution"); Fig. 2 p.4',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是騎士在車陣裡吸到的，不是行人；騎士騎的是電動機車，研究沒有量燃油機車騎士，也沒有比燃油和電動。這裡用的是沒調整的平均；論文自己的圖 2 上，平均的記號看起來比較低（苯這一類約 28.5），論文沒有解釋。各組量了多少人，論文沒有列。',
      'This is what riders in traffic breathed, not people on foot. The riders were on electric scooters; no petrol-scooter rider was measured and petrol and electric were not compared. These are unadjusted averages; the paper\'s own Fig. 2 seems to show lower averages (the benzene family at about 28.5), which it does not explain, and it does not say how many were measured in each group.',
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
      '先扣掉街上本來就有的污染和風速的影響。比較尖峰時段吸到的苯：騎腳踏車的人，比在車道上騎電動機車的人少約 40%（−39.99%）。苯這一類加起來，少 33%。PM2.5 的差別可能只是巧合（統計上不顯著）。',
      'After allowing for the pollution already in the street and for wind, cyclists breathed about 40% less benzene (−39.99%) in rush hour than electric-scooter riders in the traffic lane. They breathed 33% less of the benzene family in total. The difference in PM2.5 could be chance (not statistically significant).',
    ),
    period: t('2017年11月至2018年4月', 'November 2017 to April 2018'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Table 1 p.6, commuting-tool rows; Section 3.5 p.8',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '比的是騎車途中吸到的，沒有量在路口等的人。作者認為，腳踏車可以走人行道或自行車道，也能在人行道上等燈。機車只能夾在車陣裡，所以有差別。但這沒有證明。兩種車的速度也不同，每小時 10–15 對 25–30 公里。也不是隨機分組。研究沒有說苯來自機車。',
      'It compares riders on the move; nobody waiting at a crossing was measured. The authors think the gap is because cyclists can use pavements or cycle lanes and wait on the pavement, while scooter riders are hemmed in by traffic. They did not test this. The speeds were different (10–15 vs 25–30 km/h), and riders were not assigned at random. The study does not say the benzene came from scooters.',
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
      '台北一項研究（Wu 等，2021）量了騎腳踏車和電動機車的人。騎士吸到的 PM2.5，和附近測站相當一致。相關係數是 0.67 到 0.86，越接近 1 越一致。但苯這一類（BTEX）幾乎對不上（−0.01 到 0.38）。作者提醒，用測站的資料來估通勤者吸到的苯，「可能會有偏差」。',
      'In a Taipei study of people riding bicycles and electric scooters (Wu et al., 2021), riders\' PM2.5 followed nearby stations closely (correlation 0.67–0.86, where 1 means they move exactly together). But their benzene family (BTEX) hardly matched the station at all (−0.01 to 0.38). The authors warn that using station data for commuters\' benzene "might result in biased results".',
    ),
    period: t('2017年11月至2018年4月', 'November 2017 to April 2018'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Section 3.2, p.5 and p.7',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '苯這一類只和萬華一個測站比，PM2.5 和四個一般測站比。論文沒有列測站量到多少，所以說不出街上的苯比測站高多少。',
      'The benzene family was compared with a single station (Wanhua) and PM2.5 with four. The paper does not print the stations\' levels, so it cannot say how much higher the benzene on the street was.',
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
      '台北一項研究（Wu 等，2021）量了騎腳踏車和電動機車的人。同一天，早上尖峰吸到的每一種污染，都明顯比下午離峰多。倍數在 1.26 到 1.87 之間。從圖上讀，苯約 1.9 倍，PM2.5 約 1.3 倍。',
      'A Taipei study (Wu et al., 2021) measured people riding bicycles and electric scooters. Riders breathed clearly more of every pollutant in the morning rush hour than in the quieter afternoon of the same day. It was 1.26 to 1.87 times as much. Read from the figure, benzene was about 1.9 times and PM2.5 about 1.3 times.',
    ),
    period: t('2017 年 11 月至 2018 年 4 月（26 組同日配對）', 'November 2017 to April 2018 (26 same-day pairs)'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Section 3.3 p.7; Fig. 3 p.5',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '苯和 PM2.5 各自的倍數是從圖上讀的，不是論文印的數字；這是吸到的量的倍數，騎腳踏車和電動機車的人合在一起算。',
      'The figures for benzene and PM2.5 are read off the chart, not printed in the paper; they compare what riders breathed, with cyclists and electric-scooter riders counted together.',
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
      '台北一項研究（Wu 等，2021）量騎腳踏車和電動機車的人。尖峰時段走車比較少的巷弄小路，吸到的苯比走大馬路少 33%（−33.20%），PM2.5 少 28%（−27.7%）。這已經扣掉街上本來就有的污染和風速的影響。',
      'A Taipei study (Wu et al., 2021) measured people riding bicycles and electric scooters. In rush hour, a quieter route through side streets and alleys gave 33% less benzene (−33.20%) and 28% less PM2.5 (−27.7%) than the main road. That is after allowing for the pollution already in the street and for wind.',
    ),
    period: t('2017 年 11 月至 2018 年 4 月，尖峰時段', 'November 2017 to April 2018, rush hour'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Table 1 p.6, Route C rush hour; Section 3.4 p.8',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '離峰時段，苯和 PM2.5 的差別可能只是巧合（統計上不顯著）。另一條路線街道窄、有高架橋，車雖然比較少，有些讀數反而比較高。作者認為街道的形狀也有影響。量的是騎車的人，不是行人。',
      'Off-peak, the differences in benzene and PM2.5 could be chance (not statistically significant). Another route, with narrow streets and an overpass, had less traffic but higher readings on some measures. The authors think the shape of the street played a part. Riders were measured, not pedestrians.',
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
      '台北一項騎腳踏車和電動機車的研究（Wu 等，2021），用錄影數車。每多一輛公車或貨車經過，騎士的 PM2.5 增加的量，大約是每多一輛機車的 8 到 10 倍。但機車多很多，每分鐘約 8.56 輛對 0.35 輛。所以在模型裡，機車加起來貢獻最大，約 0.28 µg/m³。這和平均約 25 µg/m³比起來很小。',
      'A Taipei study of people riding bicycles and electric scooters (Wu et al., 2021) counted traffic on video. Each extra bus or lorry added roughly 8–10 times as much to riders\' PM2.5 as each extra scooter. But there were far more scooters, about 8.56 against 0.35 a minute. So in the model scooters added the most in total: about 0.28 µg/m³. That is small next to the average of about 25 µg/m³.',
    ),
    period: t('2017年11月至2018年4月', 'November 2017 to April 2018'),
    place: TAIPEI,
    sources: ['wu-2021-trd'],
    locator: 'Section 3.6 p.9: separate models 0.41/0.04/0.05, joint 0.29/0.01/0.03 µg/m3 per vehicle per minute; counts 0.35/7.2/8.56; contributions 0.10/0.10/0.28',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這個按車種分的計算只做了 PM2.5，沒有做苯或苯這一類。所以這項研究沒有說苯來自機車。數到的機車沒有分燃油或電動。摘要說，機車「可能」比公車、貨車和小客車貢獻更多。那是因為機車數量多，不是每輛排得比較多。',
      'This split by vehicle type was done for PM2.5 only, not for benzene, so the study does not say the benzene came from scooters. Counted scooters were not split into petrol and electric. When the abstract says scooters "could contribute more" than buses, lorries and cars, that is because there are more of them, not because each gives off more.',
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
      '台北市交通測站的 PM2.5 一年平均，每年都比一般測站高；差得最多的是 2019 年（5.1 µg/m³），2022 年起明顯變小，2024 年只差 0.1 µg/m³。',
      'Every year, Taipei City\'s roadside (traffic) stations have recorded higher yearly PM2.5 than its general stations. The gap was biggest in 2019 (5.1 µg/m³), shrank a lot from 2022, and was 0.1 µg/m³ in 2024.',
    ),
    period: t('2017–2024年', '2017–2024'),
    place: TAIPEI,
    sources: ['taipei-epd-air-report-2024'],
    locator: 'Table 3-2-7 (automatic PM2.5): 2017 14.6/18.2 … 2024 11.1/11.2; text 「歷年交通測站…濃度皆高於一般測站」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '一般測站 9 站、交通測站 3 站，這些數字沒有扣掉國外飄來或特殊天氣的影響。年報內文寫的 2024 年數字（13.2／16.5），其實是抄錯了 2021 年的數字，本站用表 3-2-7 的。',
      'Nine general and three traffic stations; the figures are not adjusted for pollution blown in from abroad or unusual weather. The report\'s own text gives 13.2/16.5 for 2024, which are really the 2021 figures copied by mistake; we use its Table 3-2-7.',
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
      '一項研究用電腦推算新北市中和的空氣。平面道路上的車，會在路邊和人行道形成一條窄窄的帶子。帶子裡的超細微粒特別多。這條帶子約 40 µm²/cm³（肺部沉積表面積，算微粒進到肺裡多少的單位）。往外幾十公尺，就很快變淡。整個 1.2 公里見方的範圍，尖峰時段平均是 15（冬天）到 31（夏天）。最高的 65 到 80，出現在高架道路下面的路邊。',
      'A computer model of Zhonghe, New Taipei found that traffic on ground-level roads makes a narrow band of ultrafine particles along the kerb and pavement. The band is about 40 µm²/cm³ (lung-deposited surface area, a measure of how much reaches the lungs). It thins out quickly within a few tens of metres. Across the whole 1.2 km square the rush-hour average was 15 (winter) to 31 (summer). The highest values, 65–80, were beside roads under elevated expressways.',
    ),
    period: t('2026 年發表（模式情境：冬季與夏季的尖峰與離峰）', 'Published 2026 (modelled winter and summer, peak and off-peak)'),
    place: t('新北市中和區（1.2 × 1.2 公里的推算範圍）', 'Zhonghe, New Taipei City (1.2 × 1.2 km model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Abstract; Section 3.2 p.8 (about 40 from urban roads); Section 3.3 p.8 (means 15/31, maxima 65/80)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這完全是電腦推算，沒有新的量測。機車只是三類車之一，沒有只看機車的結果。排放數字來自隧道實驗，也算進了輪胎、煞車的粉塵。模式裡車子排放是平均的，沒有紅綠燈、停等或怠速。算出的微粒多少跟實際對不對得上，內文只用文字描述。「約 40」只是平面道路自己的值，最高值還加上了高架道路。',
      'Entirely a computer model, with no new measurements. Scooters are one of three vehicle types, with no result for scooters alone. The emission figures come from tunnel tests that include tyre and brake dust. In the model traffic gives off pollution evenly: no signals, queues or idling. The main text checks the particle levels against reality only in words. "About 40" is for ground-level roads alone; the highest values include the elevated roads.',
    ),
    requiresCaveat: true,
    chainLink: 2,
    research: 'papers/chang-hsiao-2026-jhm#source-height-ground-roads; papers/chang-hsiao-2026-jhm#domain-mean-and-max-sa; papers/chang-hsiao-2026-jhm#emission-inputs-vehicle-classes; papers/chang-hsiao-2026-jhm#ef-exhaust-and-nonexhaust',
  },
  'ufp-intersection-hotspots-chang2026': {
    data: {},
    display: t('路口廢氣匯在一起的熱點（模式）', 'junction hot spots (modelled)'),
    statement: t(
      '一項研究用電腦推算新北市中和的超細微粒（Chang 與 Hsiao，2026）。兩條路的廢氣在大路口碰在一起，形成明顯的熱點。這是道路的配置帶來的。模式並沒有算紅燈停等或怠速。',
      'A study worked out ultrafine particles in Zhonghe, New Taipei, by computer (Chang and Hsiao, 2026). The exhaust from two crossing streets meets at big junctions and makes clear hot spots. This comes from how the streets are laid out. The model does not include queues at red lights or idling.',
    ),
    period: t('2026年發表', 'Published 2026'),
    place: t('新北市中和區（電腦推算的範圍）', 'Zhonghe, New Taipei City (model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Section 3.2 p.8; Eq. 15 (uniform line-source flux)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '內文沒有單獨列出路口空氣裡有多少。在一個熱鬧的 T 字路口，模式顯示主要來源是平面道路本身。在高架道路下面的街道，模式算的風險，大約一半以上來自高架道路。這是從論文的圖上讀出來的大約值。',
      'The main text gives no separate figure for junctions. At one busy T-junction the model shows the street itself as the main source. In streets under overpasses, roughly half or more of the modelled risk came from the overpass. This is read off the paper\'s figure, so it is approximate.',
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
    display: t('9 歲小孩約為大人的 2 倍（模式指標）', '9-year-olds about 2× adults (modelled indicator)'),
    statement: t(
      '一項研究用電腦推算新北市中和的超細微粒（Chang 與 Hsiao，2026）。在超細微粒最多的地方，算出 9 歲小孩一輩子多出來的致癌風險指標。它大約是大人的兩倍。冬天約是萬分之 4.5 對萬分之 2.2。原因是模式的假設。小孩每公斤體重吸進比較多空氣，留在肺裡的微粒也比較多。作者說，這是「可能的風險」指標，不是預測會有多少人得病。',
      'A study worked out ultrafine particles in Zhonghe, New Taipei, by computer (Chang and Hsiao, 2026). At the worst spots, a 9-year-old had about twice the adult indicator of extra lifetime cancer risk. In winter it was about 4.5 against 2.2 in 10,000. That is because the model assumes children breathe more air for their weight and keep more particles in their lungs. The authors call it an indicator of possible risk, not a forecast of how many will fall ill.',
    ),
    period: t('2026 年發表（模式情境）', 'Published 2026 (modelled scenarios)'),
    place: t('新北市中和區（電腦推算的範圍）', 'Zhonghe, New Taipei City (model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Section 3.4 p.11; Fig. 8; Section 4 p.13 (authors\' caveat)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這些是推算範圍裡少數熱點的最大值，沒有誤差範圍；大多數地方低很多。致癌強度的數字，來自同一個團隊研究台北微粒金屬成分的結果。作者自己也說，超細微粒有多會致癌，科學上還不確定。小孩的倍數來自對身體的假設，不是觀察到的健康結果。它也不是哪一個孩子的風險。',
      'These are the highest values, at a few hot spots in the modelled area, with no uncertainty ranges; most places are far lower. The cancer-strength figure comes from the same team\'s study of metals in Taipei particles. The authors say themselves that how strongly ultrafine particles cause cancer is still uncertain. The child multiple comes from assumptions about the body, not from health outcomes anyone observed. It is not any particular child\'s risk.',
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
    display: t('排放少 28%，平均吸到的少 32%（模式）', '28% less given off, 32% less breathed on average (modelled)'),
    statement: t(
      '一項研究用電腦推算新北市中和的超細微粒（Chang 與 Hsiao，2026），比較尖峰和離峰。交通排放平均少約 28% 時，整個範圍吸到的超細微粒平均少約 32%。大馬路旁邊，可以少 35% 到 40% 以上。這是不同時段車子多寡的差別，不是換電動的情境。',
      'A study worked out ultrafine particles in Zhonghe, New Taipei, by computer (Chang and Hsiao, 2026), comparing rush hour with quieter hours. When traffic gave off about 28% less, ultrafine particles breathed across the area fell by about 32% on average. Beside main roads they fell by more than 35–40%. This is the difference between busy and quiet times, not a switch to electric.',
    ),
    period: t('2026 年發表（模式情境）', 'Published 2026 (modelled scenarios)'),
    place: t('新北市中和區（電腦推算的範圍）', 'Zhonghe, New Taipei City (model domain)'),
    sources: ['chang-hsiao-2026-jhm'],
    locator: 'Section 3.3 p.8 (32%); p.10 (28%, 35-40%)',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '論文沒有推算換電動，也沒有改變路上各種車的比例。它更沒有提到電動機車。推算的排放也包括輪胎、煞車的粉塵，換電動不會全部消失。',
      'The paper does not model a switch to electric or a change in the mix of vehicles, nor does it mention electric scooters. The modelled pollution includes tyre and brake dust, which going electric would not remove.',
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
      '聯合新聞網報導了環境部的初步統計。全國空氣裡的 PM2.5，2019 年一年平均是 16.2 µg/m³。2025 年（統計到 12 月 3 日）降到 12.6 µg/m³。',
      'A United Daily News report gave the environment ministry\'s preliminary statistics. Taiwan\'s national annual mean PM2.5 was 16.2 µg/m³ in 2019. It was 12.6 µg/m³ in 2025 (data to 3 December).',
    ),
    period: t('2019 年與 2025 年（初步統計，至 12 月 3 日）', '2019 and 2025 (preliminary, to 3 December)'),
    place: TW,
    sources: ['udn-national-pm25-trend'],
    locator: '「全國細懸浮微粒（PM2.5）年平均濃度已降至12.6 μg/m3（統計至12月3日），相較2019年的16.2 μg/m3顯著改善」 (UDN, 2025-12-31)',
    confidence: 'secondary',
    evidence: 'official-tw',
    caveat: t(
      '數字出自媒體轉述的環境部初步統計，2025 年只統計到 12 月 3 日。我們沒有核對環境部的原始統計。這是全國所有來源的 PM2.5 平均，不是路口或路邊空氣裡有多少。',
      'From a media report of MOENV\'s preliminary statistics; the 2025 figure runs only to 3 December. We have not checked it against MOENV\'s own release. It is the national average of PM2.5 from all sources, not the level at a crossing or the kerb.',
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
      '台灣的空氣品質標準：PM2.5 一年平均 12 µg/m³，24 小時平均 30 µg/m³。',
      "Taiwan's legal air quality standard for PM2.5 is 12 µg/m³ as an annual average and 30 µg/m³ over 24 hours.",
    ),
    period: t('2024 年 9 月 30 日修正發布', 'As amended 30 September 2024'),
    place: TW,
    sources: ['moenv-air-quality-standards'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '這是一般空氣的法定標準，用測站長時間的平均來判斷。它不是用來看在路口那幾秒、幾分鐘的空氣。世界衛生組織的一年平均指引值更低，是 5 µg/m³。',
      'This is the legal standard for outdoor air, judged on long averages at air stations; it is not meant for the seconds or minutes spent at a crossing. The WHO\'s yearly guideline is lower, at 5 µg/m³.',
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
      '台灣的一氧化碳標準是 1 小時 31 ppm、8 小時 9 ppm；二氧化氮是 1 小時 0.100 ppm、一年平均 0.021 ppm。',
      "Taiwan's carbon monoxide standard is 31 ppm over 1 hour and 9 ppm over 8 hours; for nitrogen dioxide it is 0.100 ppm hourly and 0.021 ppm annually.",
    ),
    period: t('2024 年 9 月 30 日修正發布', 'As amended 30 September 2024'),
    place: TW,
    sources: ['moenv-air-quality-standards'],
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '台灣標準的氣體用 ppm 表示，世界衛生組織用 µg/m³或 mg/m³。單位不同，數字不能直接比大小。',
      'Taiwan states gas standards in ppm while WHO uses µg/m³ or mg/m³; the units differ, so the numbers cannot be compared directly.',
    ),
    chainLink: 3,
    research: '02 §8',
  },
  'who-pm25-guideline': {
    data: { annual: v(5, 'ug/m3'), daily: v(15, 'ug/m3') },
    display: t('年平均 5、24小時 15 µg/m³', 'annual 5, 24-hour 15 µg/m³'),
    statement: t(
      '世界衛生組織 2021 年的指引建議：PM2.5 一年平均不超過 5 µg/m³，24 小時平均不超過 15 µg/m³。',
      "The WHO's 2021 guideline for PM2.5 is 5 µg/m³ as a yearly average and 15 µg/m³ as a 24-hour average.",
    ),
    period: t('2021 年 9 月 22 日發布', 'Published 22 September 2021'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: 'Table 0.1, AQG level column',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '世界衛生組織的指引是建議，不是法律；24 小時的值是一年裡第 99 百分位的那一天（一年可以超過 3 到 4 天）。',
      'WHO guidelines are advice, not law; the 24-hour value is the 99th percentile, so it may be exceeded on 3–4 days a year.',
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
      '世界衛生組織替 PM2.5 的一年平均訂了四個中途目標：35、25、15、10 µg/m³，最後的指引值是 5 µg/m³。',
      'The WHO sets four in-between targets for yearly PM2.5 (35, 25, 15 and 10 µg/m³) on the way to its 5 µg/m³ guideline.',
    ),
    period: t('2021年', '2021'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: 'Table 0.1, interim targets 1–4',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '中途目標是給污染比較重的地方一步一步改善用的，不是安全值；世界衛生組織的指引值是 5 µg/m³。',
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
      '世界衛生組織 2021 年的指引建議：二氧化氮一年平均 10 µg/m³、24 小時平均 25 µg/m³；一氧化碳 24 小時平均 4 mg/m³。',
      'The WHO\'s 2021 guidelines recommend 10 µg/m³ for nitrogen dioxide over a year and 25 µg/m³ over 24 hours, and 4 mg/m³ for carbon monoxide over 24 hours.',
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
      '一氧化碳的 8 小時、1 小時和 15 分鐘指引值（10、35、100 mg/m³）沿用舊版，2021 年沒有重新評估。',
      'The 8-hour, 1-hour and 15-minute carbon monoxide values (10, 35 and 100 mg/m³) carry over from the older guidelines; they were not looked at again in 2021.',
    ),
    chainLink: 3,
    editorNote: 'Lane A check of the 15-minute value (brief section 11), 2026-11-26: the value 100 mg/m3 rests on two WHO texts read at the primary source by earlier verifiers, the 2021 guidelines Table 0.2 (research/03-health.md §2, file 03 opened the IRIS PDF) and the 2010 indoor-air guidelines (research/redlight/smell-chemistry.json#who-co-benzene, PDF opened, CO values listed: 100 mg/m3 15 min, 35 mg/m3 1 h, 10 mg/m3 8 h). Re-opening both today was blocked (IRIS returns a JavaScript shell, NCBI Bookshelf a reCAPTCHA, the afro.who.int mirror HTTP 502), so the confidence rests on those recorded readings. Slot who.co15min_ppm = 100 / 1.146 = 87.3, printed 87.',
    research: '03 §2; redlight/smell-chemistry#who-co-benzene',
  },
  'who-ufp-good-practice': {
    data: { lowPnc: v(1000, 'particles/cm3', { bound: 'lt' }), highPnc: v(10000, 'particles/cm3', { bound: 'gt' }) },
    display: t('無指引數值', 'no guideline value'),
    statement: t(
      '世界衛生組織因為證據不夠，沒有替超細微粒和黑碳訂指引數值。它只給了「良好作法」的建議。例如 24 小時平均超過每立方公分 10,000 個微粒，就算多。',
      'Because the evidence was not strong enough, the WHO set no guideline values for ultrafine particles or black carbon. It gave only good-practice advice, such as treating a 24-hour average above 10,000 particles per cm³ as high.',
    ),
    period: t('2021年', '2021'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: '"Low PNC can be considered < 1 000 particles/cm3 (24-hour mean). High PNC can be considered > 10 000 particles/cm3 (24-hour mean)"',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '每立方公分 10,000 個，是世界衛生組織用來分高低的建議，不是健康指引值；世界衛生組織說，證據還不夠訂數值。',
      'The 10,000 particles/cm³ line is a WHO good-practice statement for telling high levels from low ones, not a health guideline. WHO says the evidence is too thin to set a value.',
    ),
    chainLink: 4,
    research: '03 §1b, §2',
  },
  'who-road-noise-guideline': {
    data: { lden: v(53, 'dB'), lnight: v(45, 'dB') },
    display: t('53 dB（全日）、45 dB（夜間）', '53 dB (day-evening-night), 45 dB (night)'),
    statement: t(
      '世界衛生組織歐洲區的指引強烈建議：道路交通噪音要降低。全天平均要在 53 分貝以下（Lden），晚上要在 45 分貝以下（Lnight）。',
      'The WHO\'s European guidelines strongly recommend keeping road traffic noise below 53 dB averaged over the day (Lden) and 45 dB at night (Lnight).',
    ),
    period: t('2018年', '2018'),
    place: t('歐洲（WHO 歐洲區）', 'Europe (WHO European Region)'),
    sources: ['who-europe-2018-noise'],
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '這是以歐洲研究為主的地區指引，講的是所有道路交通，不是機車。台灣一項幼兒園的研究裡，道路噪音和得氣喘的比例，看不出明顯有關。',
      'A European guideline built mostly on European studies, about all road traffic rather than scooters. In one Taiwanese kindergarten study, road noise had no clear link with how many children had asthma.',
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
      '國際癌症研究機構（IARC）把汽油引擎的廢氣，列為「可能對人類致癌」（第 2B 級）。從 1989 年評估到現在，都沒變。',
      'The International Agency for Research on Cancer (IARC) lists petrol-engine exhaust as "possibly carcinogenic to humans" (Group 2B), unchanged since it was assessed in 1989.',
    ),
    period: t('2012 年重新評估（專論第 105 卷）', 'Re-evaluated 2012 (Monographs Vol. 105)'),
    place: NOT_PLACE,
    sources: ['iarc-pr213-2012', 'lancet-onc-2012-exhausts'],
    locator: 'PR 213: "The Working Group concluded that gasoline exhaust was possibly carcinogenic to humans (Group 2B), a finding unchanged from the previous evaluation in 1989."',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '第 2B 級比柴油廢氣的第 1 級弱；柴油廢氣的分級，不能套在燃油機車（汽油引擎）的廢氣上。IARC 分的是「會不會致癌」，不是平常吸到的量有多危險。',
      'Group 2B is weaker than diesel exhaust\'s Group 1, and the diesel grade does not apply to exhaust from petrol scooters. IARC rates whether something can cause cancer, not how risky everyday amounts are.',
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
      'IARC 把柴油引擎的廢氣，列為「對人類致癌」（第 1 級）。因為有足夠的證據顯示，吸柴油廢氣和得肺癌的風險變高有關。',
      'IARC lists diesel-engine exhaust as "carcinogenic to humans" (Group 1), because there is enough evidence that breathing it is linked to a higher risk of lung cancer.',
    ),
    period: t('2012 年（專論第 105 卷）', '2012 (Monographs Vol. 105)'),
    place: NOT_PLACE,
    sources: ['iarc-pr213-2012', 'lancet-onc-2012-exhausts'],
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '這一列只是拿來對照。台灣的機車幾乎都是汽油引擎，柴油的分級不適用機車廢氣。',
      'For contrast only: Taiwan\'s scooters are almost all petrol-engined, so the diesel classification does not apply to scooter exhaust.',
    ),
    requiresCaveat: true,
    chainLink: 4,
    research: '03 §1a',
  },
  'iarc-outdoor-air-pollution-group1': {
    data: {},
    display: t('第 1 級', 'Group 1'),
    statement: t(
      'IARC 把室外的空氣污染和裡面的懸浮微粒，列為「對人類致癌」（第 1 級）。因為有足夠的證據顯示，它會讓人得肺癌。',
      'IARC lists outdoor air pollution, and the particles in it, as "carcinogenic to humans" (Group 1), because there is enough evidence that it causes lung cancer.',
    ),
    period: t('2013 年（專論第 109 卷）', '2013 (Monographs Vol. 109)'),
    place: NOT_PLACE,
    sources: ['iarc-pr221-2013', 'lancet-onc-2013-outdoor-air'],
    locator: 'PR 221: "there is sufficient evidence that exposure to outdoor air pollution causes lung cancer (Group 1)"; PM "was also classified as carcinogenic to humans (Group 1)"',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '這是 IARC 對一般室外空氣污染的結論；機車廢氣是其中一個來源，但 IARC 沒有算機車占多少。',
      'This is IARC\'s conclusion about outdoor air pollution in general; scooter exhaust is one contributing source, but IARC does not quantify its share.',
    ),
    chainLink: 4,
    research: '03 §1a',
  },
  'iarc-benzene-group1': {
    data: {},
    display: t('第 1 級', 'Group 1'),
    statement: t(
      '國際癌症研究機構（IARC）把苯列為「對人類致癌」（第 1 級）。苯會讓大人得急性骨髓性白血病。汽油和汽油引擎的廢氣裡都有苯。',
      'The International Agency for Research on Cancer (IARC) lists benzene as "carcinogenic to humans" (Group 1); it causes acute myeloid leukaemia in adults. Benzene is in petrol and in petrol-engine exhaust.',
    ),
    period: t('2017 年評估，2018 年出版（專論第 120 卷）', 'Evaluated 2017, published 2018 (Monographs Vol. 120)'),
    place: NOT_PLACE,
    sources: ['iarc-vol120-benzene', 'lancet-onc-2017-benzene'],
    locator: 'Vol. 120 §6: "Benzene is carcinogenic to humans (Group 1)." "Benzene causes acute myeloid leukaemia in adults."',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      'IARC 分的是「會不會致癌」，不是平常吸到的量有多危險；它也沒有算機車廢氣裡的苯有多少風險。',
      'IARC rates whether something can cause cancer, not how risky everyday amounts are, and it gives no figure for the risk from benzene in scooter exhaust.',
    ),
    chainLink: 4,
    research: '03 §1a; 03 safe claim #2',
  },
  'who-pm25-bloodstream': {
    data: {},
    display: t('可進入血液', 'can enter the bloodstream'),
    statement: t(
      '世界衛生組織說，PM2.5 和 PM10 能深入肺部，PM2.5 甚至能進到血液裡。主要影響的是心臟、血管和呼吸。',
      'The WHO says PM2.5 and PM10 can get deep into the lungs, and PM2.5 can even get into the blood, mainly affecting the heart, blood vessels and breathing.',
    ),
    period: t('2021年指引問答', '2021 guidelines Q&A'),
    place: GLOBAL,
    sources: ['who-aqg-qa'],
    locator: '"PM2.5 and PM10 are capable of penetrating deep into the lungs and PM2.5 can even enter the bloodstream, primarily resulting in cardiovascular and respiratory impacts."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '世界衛生組織說的是一般 PM2.5 的作用，不是專指機車廢氣。它也沒有說要吸多少才會有影響。',
      'The WHO is describing what PM2.5 in general can do; it is not about scooter exhaust in particular, and it does not say how much it takes.',
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
      '美國健康效應研究所（HEI）2022 年整理了 353 篇研究。長年吸進交通排出的空氣污染，和好幾種死亡有關。包括各種原因的死亡、心臟和血管疾病的死亡。還有缺血性心臟病（心臟血管塞住）的死亡、肺癌的死亡。它也和小孩、大人開始得氣喘有關，以及小孩的急性下呼吸道感染。HEI 對這些「有關」的信心是「高」或「中高」。',
      'In 2022 the Health Effects Institute (HEI) reviewed 353 studies. Breathing traffic pollution for years is linked to death from any cause, from heart and blood-vessel disease, from ischaemic heart disease and from lung cancer. It is also linked to asthma starting in children and adults, and to chest infections in children. HEI\'s confidence in these links is high or moderate-to-high.',
    ),
    period: t('2022年（10月14日更新）', '2022 (updated 14 October)'),
    place: t('國際（以歐洲與北美研究為主）', 'International (mostly European and North American studies)'),
    sources: ['hei-sr23-2022'],
    locator: 'Executive summary: "The Panel found a high or moderate-to-high level of confidence in an association between long-term exposure to TRAP and..."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      'HEI 評的是這些「有關」有多可信；它明白說，沒有評估是不是因果。研究大多在歐洲和北美，亞洲只有 41 篇。很多是在空氣比現在髒的年代做的。肺功能不在它評的項目裡。這一項我們依 HEI 的摘要，沒有讀完整份報告。',
      'HEI rated how sure we can be of each link; it says it did not judge cause and effect. Most studies were from Europe or North America (41 from Asia), many from years when the air was dirtier than today. Lung function was not among the things it rated. We used HEI\'s executive summary; we did not read the full report.',
    ),
    chainLink: 5,
    research: '03 §6',
  },
  'hei-sr17-asthma-exacerbation': {
    data: {},
    display: t('小孩氣喘惡化：證據充分', 'childhood asthma attacks: sufficient'),
    statement: t(
      '照 HEI 自己的說法，它 2010 年做過回顧。回顧發現，有足夠的證據說明：交通排出的空氣污染，會讓小孩的氣喘變嚴重。至於會不會讓小孩開始得氣喘，證據只算「有跡象」。',
      'As HEI itself puts it, its 2010 review found enough evidence that traffic pollution makes children\'s asthma worse. The evidence that it makes children start to have asthma was only "suggestive".',
    ),
    period: t('2010 年（HEI 特別報告 17）', '2010 (HEI Special Report 17)'),
    place: t('國際', 'International'),
    sources: ['hei-sr23-2022'],
    locator: 'SR23 exec summary on SR17: "The Panel concluded that the evidence was sufficient to support a causal relationship between exposure to TRAP and exacerbation of asthma in children."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是依 HEI 在第 23 號報告裡的轉述，第 17 號報告的原文我們沒有直接打開。',
      'Based on HEI\'s own account in Special Report 23; we did not open Special Report 17 itself.',
    ),
    chainLink: 5,
    alsoLinks: [6],
    research: '03 §6',
  },
  'ats-2020-childhood-asthma': {
    data: {},
    display: t('小孩氣喘：病因之一', 'childhood asthma: a cause'),
    statement: t(
      '美國胸腔學會的工作坊報告認為，長年吸空氣污染，是小孩得氣喘的原因之一。但對大人的氣喘或慢性阻塞性肺病，證據還不夠。',
      'An American Thoracic Society workshop concluded that breathing polluted air for years is one of the causes of asthma in children. But the evidence for adult asthma or COPD is not yet strong enough.',
    ),
    period: t('2020 年', '2020'),
    place: t('國際', 'International'),
    sources: ['thurston-2020-annats'],
    locator: 'Abstract: "Available evidence indicates that long-term exposure to air pollution is a cause of childhood asthma, but the evidence for a similar determination for adult asthma or COPD remains insufficient."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是對一般空氣污染的結論，不是專指機車。它特別看二氧化氮、黑碳這些和交通有關的指標。它也不代表哪一個孩子的氣喘是機車害的。' + ABSTRACT_ONLY['zh-TW'],
      'A conclusion about air pollution in general (especially traffic markers such as NO₂ and black carbon), not scooters. It does not mean any one child\'s asthma was caused by scooters. ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 5,
    alsoLinks: [6],
    research: '03 §6',
  },
  'aha-2010-pm25-cardiovascular': {
    data: {},
    display: t('數小時至數週', 'hours to weeks'),
    statement: t(
      '美國心臟學會發表了科學聲明。吸 PM2.5（所有來源）幾小時到幾星期，就可能引發心臟血管的急症。整體證據符合「PM2.5 會引發心血管疾病」的因果解釋。',
      'The American Heart Association concluded that breathing PM2.5 (from all sources) for a few hours to a few weeks can set off heart and blood-vessel emergencies. It found that the evidence as a whole fits PM2.5 causing heart disease and death.',
    ),
    period: t('2010年', '2010'),
    place: t('國際（以美國研究為主）', 'International (mostly US studies)'),
    sources: ['brook-2010-circulation'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '講的是一般空氣裡的 PM2.5，不是專指機車廢氣，也不包括幾分鐘的短暫高峰；「幾小時到幾星期」是聲明裡講到的最短時間。' + ABSTRACT_ONLY['zh-TW'],
      'About PM2.5 in the air in general, not scooter exhaust, and not about peaks lasting minutes; "hours to weeks" is the shortest time the statement covers. ' + ABSTRACT_ONLY.en,
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
      '世界衛生組織 2021 年的空氣品質指引，引用一個比較早（2018 年）的推估。全世界每年約 700 萬人的死亡，可以算在室外和室內空氣污染加起來的頭上。只算室外的推估，在 400 萬到 900 萬之間。',
      'The WHO\'s 2021 air quality guidelines quote an earlier (2018) estimate. About 7 million deaths a year worldwide can be put down to outdoor and indoor air pollution together. Estimates for outdoor air alone range from 4 million to 9 million.',
    ),
    period: t('2021 年指引引用的推估', 'Estimates cited in the 2021 guidelines'),
    place: GLOBAL,
    sources: ['who-2021-aqg'],
    locator: '§1.3.3: "around 7 million deaths ... attributable to the joint effects of ambient and household air pollution (WHO, 2018)"; "between 4 million and 9 million deaths annually"',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '700 萬是室外加室內（家裡）空氣污染的總數，不是只有室外。這是世界衛生組織引用的 2018 年推估。世界衛生組織比較新的資料（2024 年），寫的總數是約 670 萬人。',
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
      '台北一項研究，量了 120 位健康年輕人的通勤（Chuang 等，2020）。研究用 24.4 µg/m³ 當一段增加量（叫一個四分位距）。走路時身上的 PM2.5（所有來源）每多一段，同一小時裡有三種變化。收縮壓高 6.5%，心跳快 3.4%。尿液裡一種 DNA 受損的指標（8-OHdG）高 8.1%。這三項都不太像是巧合（有統計意義）。搭捷運時，看不出明顯有關。',
      'A Taipei study measured 120 healthy young commuters (Chuang et al., 2020). While walking, each extra 24.4 µg/m³ of PM2.5 from all sources (the study\'s step, one interquartile range) went with three changes in the same hour. Systolic blood pressure was 6.5% higher and the heart beat 3.4% faster. A urine marker of DNA damage (8-OHdG) was 8.1% higher. All three were more than chance would explain (statistically significant). On the metro there was no clear link.',
    ),
    period: t('上午9至10點；2017年2月至2019年12月', '09:00–10:00; February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 2 p.3, Model 6 (walking) and Model 2 (subway); IQR from Table 1',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '120 位健康的年輕人，早上一小時。走路花的力氣沒有量，也沒有調整，作者自己說這會干擾結果。把六種通勤方式合起來算，只有一項有統計上的差別。那是尿液裡的 8-OHdG，一種氧化壓力的指標。心跳和 8-OHdG，研究估的範圍（信賴區間）前後不對稱，可能是印錯。舒張壓的變化是反方向的，作者沒有標出來，也沒有討論。這些是短暫的身體變化，不是生病。戴口罩走路時，血壓和心跳看不出明顯有關，但 8-OHdG 還是有（+2.3%）。' + ASSOCIATION_TW['zh-TW'],
      '120 healthy young adults, one morning hour. How hard people were working while walking was neither measured nor allowed for, which the authors say muddies the results. With all six ways of travelling counted together, only urinary 8-OHdG (a marker of oxidative stress) differed by more than chance would explain. The study\'s ranges (confidence intervals) for heart rate and 8-OHdG are lopsided, possibly a misprint. Diastolic pressure went the other way, which the authors neither marked nor discussed. These are short-lived changes in the body, not illness. Walking with a respirator mask, blood pressure and heart rate showed no clear link, but 8-OHdG did (+2.3%). ' + ASSOCIATION_TW.en,
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
      '台北一項研究，量了 120 位健康年輕人的通勤（Chuang 等，2020）。騎燃油機車的人，用自己的一段增加量：41.7 µg/m³。身上的 PM2.5 每多一段，同一小時裡收縮壓高 7.9%，心跳快 6.4%。8-OHdG（氧化壓力指標）高 8.9%。舒張壓看不出明顯有關。這是騎士，不是行人。',
      'A Taipei study measured 120 healthy young commuters (Chuang et al., 2020). For people riding petrol scooters the study\'s step was 41.7 µg/m³ (their own interquartile range). Each extra step of PM2.5 went with 7.9% higher systolic pressure and a 6.4% faster heart rate in the same hour. 8-OHdG (a marker of oxidative stress) was 8.9% higher. Diastolic pressure showed no clear link. These are riders, not people on foot.',
    ),
    period: t('上午9至10點；2017年2月至2019年12月', '09:00–10:00; February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 2 p.3, Model 5',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '每種通勤方式用的增加量不一樣：騎機車 41.7，走路 24.4。所以百分比不能互相比，也不是「每 1 µg/m³」或「每 10 µg/m³」。收縮壓的範圍下限是 0.9，很接近零。騎車花的力氣和噪音（騎機車平均 89.3 分貝），都會干擾結果。' + ASSOCIATION_TW['zh-TW'],
      'Each way of travelling has its own step (scooter 41.7, walking 24.4). So the percentages cannot be compared with each other, and they are not "per 1" or "per 10 µg/m³". The lower end of the systolic range (0.9) is close to zero. Effort and noise (89.3 dBA on average on scooters) muddy the results. ' + ASSOCIATION_TW.en,
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
    display: t('六種方式合起來看：只有 8-OHdG 不像巧合', 'all modes pooled: only 8-OHdG beyond chance'),
    statement: t(
      '台北一項研究，量了 120 位健康年輕人的通勤（Chuang 等，2020）。把六種通勤方式的 720 次量測合起來分析，PM2.5 只和 8-OHdG（氧化壓力指標）明顯有關（+4.7%）。和血壓、心跳，都看不出明顯有關。',
      'A Taipei study measured 120 healthy young commuters (Chuang et al., 2020). When all 720 measurements from the six ways of travelling were put together, PM2.5 was clearly linked only with 8-OHdG (a marker of oxidative stress, +4.7%). It showed no clear link with blood pressure or heart rate.',
    ),
    period: t('2017 年 2 月至 2019 年 12 月', 'February 2017 to December 2019'),
    place: TAIPEI,
    sources: ['chuang-2020-aeax'],
    locator: 'Table 2 p.3, Model 1',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t('論文沒寫合起來算時用的增加量是多少；摘要也沒有提到這個結果。8-OHdG 只是氧化壓力的指標，不是生病。', 'The paper does not give the step used when everything was counted together, and the abstract does not report this result. 8-OHdG is a marker of oxidative stress, not illness.'),
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
      '一項研究追蹤了 24,544 位台灣小孩、青少年和年輕人。兩年平均的 PM2.5（所有來源）每多 10 µg/m³，肺功能指標大約低 2% 到 3%。',
      'A study followed 24,544 Taiwanese children, teenagers and young adults. Each extra 10 µg/m³ of PM2.5 (from all sources), averaged over two years, went with about 2–3% lower lung function.',
    ),
    period: t('2000–2014 年', '2000–2014'),
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
      '一項研究看了彰化工業區附近 4,736 位學童。長年吸到比較多 PM2.5（所有來源）的，醫師診斷的氣喘比較多。他們呼氣裡的一氧化氮也比較高，這是呼吸道發炎的指標。',
      'A study looked at 4,736 schoolchildren near industrial areas in Changhua. More long-term PM2.5 (from all sources) went with more asthma diagnosed by doctors. It also went with more nitric oxide in the breath, a sign of inflamed airways.',
    ),
    period: t('2025 年發表（2024 年 1 月線上刊出）', 'Published 2025 (online January 2024)'),
    place: t('彰化縣燃煤電廠等工業區附近六鄉鎮', 'Six townships near industrial areas (incl. coal-fired power plants), Changhua'),
    sources: ['tsai-2025-pedres'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只看某一個時間點，背景是工廠和燃煤電廠，不是機車。勝算比（比較機會大小的數字，1 代表沒有差別）是 1.595。摘要沒寫這是 PM2.5 多多少時的數字，所以它不是「每 1 µg/m³」的數字。' + ASSOCIATION_TW['zh-TW'] + ABSTRACT_ONLY['zh-TW'],
      'Looked at once rather than over time, in a setting of factories and coal power, not scooters. The odds ratio (a way of comparing chances, where 1 means no difference) is 1.595. The abstract does not say what rise in PM2.5 it refers to, so it is not a "per 1 µg/m³" figure. ' + ASSOCIATION_TW.en + ' ' + ABSTRACT_ONLY.en,
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
      '一項全台 32,672 位學童的研究發現，小孩的氣喘和一氧化碳、臭氧有關。一氧化碳每多 100 ppb，勝算比是 1.045（比較機會大小的數字，1 代表沒有差別）。和氮氧化物的關係，可能只是巧合（統計上不顯著）。PM10 反而是反方向。',
      'A nationwide study of 32,672 schoolchildren found childhood asthma linked with carbon monoxide and ozone. For each 100 ppb of carbon monoxide the odds ratio was 1.045 (a way of comparing chances, where 1 means no difference). The link with nitrogen oxides could be chance (not statistically significant). PM10 went the opposite way.',
    ),
    period: t('2001 年調查；2005 年發表', 'Surveyed 2001; published 2005'),
    place: TW,
    sources: ['hwang-2005-thorax'],
    locator: 'Abstract: O3 OR 1.138 (1.001–1.293) per 10 ppb; CO 1.045 (1.017–1.074) per 100 ppb; NOx 1.005 (0.954–1.117); PM10 0.934 (0.909–0.960)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只看某一個時間點，用的是測站資料，污染程度是 2000 到 2001 年的。作者的結論說得比數字強：氮氧化物其實可能只是巧合（統計上不顯著）。所以這裡看的是實際數字，不是標題。研究量的是一氧化碳、臭氧、氮氧化物和 PM10，不是 PM2.5。測站的污染來自所有來源，沒有把機車廢氣分出來。' + ABSTRACT_ONLY['zh-TW'],
      'Looked at once, using air-station data from 2000–2001. The authors\' conclusion is stronger than their numbers: nitrogen oxides could have been chance (not statistically significant). So what counts here is the numbers, not the headline. It used carbon monoxide, ozone, nitrogen oxides and PM10, not PM2.5. Station pollution comes from every source and does not pick out scooter exhaust. ' + ABSTRACT_ONLY.en,
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
      '一項研究看了新北市 11 所幼兒園的 3,246 位小朋友。PM2.5 和 PM10（所有來源）比較高的地方，氣喘的小朋友比較多。二氧化氮和道路噪音，則看不出明顯有關。',
      'A study of 3,246 children at 11 kindergartens in New Taipei found more asthma where PM2.5 and PM10 (from all sources) were higher. Nitrogen dioxide and road noise showed no clear link.',
    ),
    period: t('2023 年發表', 'Published 2023'),
    place: t('新北市', 'New Taipei City'),
    sources: ['cho-2023-chemosphere'],
    locator: 'Abstract: IQR PM2.5 (1.17 µg/m3) 1.34-fold (1.05–1.70); PM10 (10.69) 1.17-fold (1.01–1.36)',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是在同一個時間點，看多少小朋友有氣喘的研究。摘要用了「caused」這個詞，但這種研究設計只能看出「有關」。' + ASSOCIATION_TW['zh-TW'] + ABSTRACT_ONLY['zh-TW'],
      'A study of how many children had asthma at one point in time. The abstract says "caused", but this design can only show that two things go together. ' + ASSOCIATION_TW.en + ' ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 6,
    research: '03 §3a',
  },
  'lin2024-asthma-lung-function': {
    data: { patients: v(675, 'people') },
    display: t('675 名氣喘患者', '675 asthma patients'),
    statement: t(
      '台灣一家醫學中心研究了 675 位氣喘病人。有些人很小就開始氣喘。他們之中，吸到比較多 PM10、PM2.5 和二氧化氮（所有來源）的，肺功能比較差。',
      'A Taiwanese medical centre studied 675 asthma patients. Among those whose asthma began early in life, breathing more PM10, PM2.5 and NO₂ (from all sources) went with poorer lung function.',
    ),
    period: t('2024 年發表', 'Published 2024'),
    place: t('台灣一所醫學中心', 'One medical centre, Taiwan'),
    sources: ['lin-2024-jaa'],
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '只在一家醫學中心、看某一個時間點的大人病人。' + ASSOCIATION_TW['zh-TW'] + ABSTRACT_ONLY['zh-TW'],
      'Adult patients at one medical centre, looked at once rather than over time. ' + ASSOCIATION_TW.en + ' ' + ABSTRACT_ONLY.en,
    ),
    chainLink: 5,
    research: '03 §3a',
  },
  'yang2003-preterm-freeway': {
    data: { births: v(6251, 'count'), preTermOR: v(1.3, 'odds-ratio', { low: 1.03, high: 1.65 }) },
    display: t('OR 1.30', 'OR 1.30'),
    statement: t(
      '高雄一項研究，看住在高速公路 500 公尺內的媽媽。她們生早產兒的勝算比（調整後）是 1.30。勝算比是比較機會大小的數字，1 代表沒有差別。',
      'A Kaohsiung study looked at mothers living within 500 m of a motorway. Their adjusted odds ratio for giving birth early was 1.30. An odds ratio compares chances: 1 means no difference.',
    ),
    period: t('1992–1997 年出生；2003 年發表', 'Births 1992–1997; published 2003'),
    place: t('高雄市高速公路沿線 1,500 公尺範圍', 'A 1,500 m zone along a Kaohsiung freeway'),
    sources: ['yang-2003-aeh'],
    locator: 'Abstract: "The adjusted odds ratio was 1.30 (95% confidence interval = 1.03, 1.65) ... within 500 m of the freeway."',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '研究很舊，只看一條高速公路，只用距離來代表吸到多少，沒有量污染；國際回顧（HEI）對早產這件事的證據信心是「低」。' + ABSTRACT_ONLY['zh-TW'],
      'An old study of one motorway that used distance alone, with no pollution measured; the international HEI review gives low confidence to the evidence on early birth. ' + ABSTRACT_ONLY.en,
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
      '在台灣，肺癌是死亡人數最多的癌症；2025 年肺癌的死亡率是每十萬人 46.4 人，男性和女性都是肺癌排第一。',
      'Lung cancer kills more people in Taiwan than any other cancer. In 2025 the lung cancer death rate was 46.4 per 100,000 people, and it was the top cancer killer for both men and women.',
    ),
    period: t('2025 年（民國 114 年），2026 年 6 月公布', '2025, released June 2026'),
    place: TW,
    sources: ['mohw-cause-of-death-2025'],
    locator: '「（1）氣管、支氣管和肺癌死亡46.4人」「男、女性癌症死因首位均為肺癌」「癌症自71年起已連續44年居國人死因首位」',
    confidence: 'verified',
    evidence: 'official-tw',
    caveat: t(
      '肺癌是「癌症」裡排第一，不是所有死因裡排第一。癌症整體，已經連續 44 年是死因第一。這項統計和空氣污染、機車都沒有關係。',
      'Lung cancer is the leading cancer killer, not the leading cause of all deaths (cancer as a whole has been the top cause of death for 44 years). These figures say nothing about air pollution or scooters.',
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
      '一項研究分析了 371,084 位台灣肺癌病人，發現 53% 從來沒有吸菸。1995 到 2015 年，曾經吸菸的成年男性從 59.4% 降到 29.9%。肺腺癌卻變多：男性每十萬人從 9.06 升到 23.25，女性從 7.05 升到 24.22。研究者還在查，空氣污染是不是原因之一。',
      'An analysis of 371,084 Taiwanese lung cancer patients found that 53% had never smoked. Between 1995 and 2015 the share of adult men who had ever smoked fell from 59.4% to 29.9%. Lung adenocarcinoma became more common: men 9.06 to 23.25, women 7.05 to 24.22 per 100,000. Researchers are still looking into whether air pollution is one of the reasons.',
    ),
    period: t('1995–2015 年', '1995–2015'),
    place: TW,
    sources: ['tseng-2019-jto'],
    locator: 'Abstract: "53% patients with LC had never smoked."; AdLC incidence males 9.06→23.25, females 7.05→24.22 per 100,000',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '這是比較地區的研究，用「能見度」代替空氣品質。它不能證明某個人的癌症是 PM2.5 引起的，也沒有排除其他原因。它說明不了空氣污染是不吸菸者得肺癌的原因，也算不出占多少。' + ABSTRACT_ONLY['zh-TW'],
      'A comparison between areas that uses visibility in place of air quality. It cannot show that PM2.5 caused anyone\'s cancer, and it does not rule out other causes. It cannot show that air pollution is why never-smokers get lung cancer, or how much of it. ' + ABSTRACT_ONLY.en,
    ),
    requiresCaveat: true,
    chainLink: 5,
    editorNote: 'R14: only on /evidence/#not-used. Never say air pollution is "the cause" of never-smokers\' lung cancer or give a share.',
    research: '03 §3c',
  },
  'hill2023-egfr-ecological': {
    data: { egfrCases: v(32957, 'count') },
    display: t('台灣資料：明顯有關，不像巧合', 'a link beyond chance in Taiwan data'),
    statement: t(
      '一篇《自然》期刊的研究，用了包括台灣在內的地區資料。PM2.5（所有來源）越高的地方，EGFR 突變型肺癌越多，兩者明顯有關。研究也用小鼠實驗，提出空氣污染可能怎麼促成腫瘤（讓腫瘤開始長出來）。',
      'A study in the journal Nature used data for areas including Taiwan. Places with more PM2.5 (from all sources) had clearly more EGFR-mutant lung cancer. It also used experiments on mice to suggest how air pollution may help tumours start to grow.',
    ),
    period: t('台灣資料 2011–2017 年；2023 年發表', 'Taiwan data 2011–2017; published 2023'),
    place: t('英國、南韓、台灣（台灣為長庚研究資料庫九縣市）', 'England, South Korea and Taiwan (Taiwan: Chang Gung Research Database, nine counties)'),
    sources: ['hill-2023-nature'],
    locator: 'Abstract: "significant association between PM2.5 levels and the incidence of lung cancer for 32,957 EGFR-driven lung cancer cases in four within-country cohorts"',
    confidence: 'verified',
    evidence: 'measured-tw',
    caveat: t(
      '人的資料是用縣市平均的 PM2.5 去比，論文自己也說沒辦法考慮人搬家。機制的證據來自小鼠和少量的組織樣本。PM2.5 是所有來源的，不是只有機車。',
      'The human data compare county averages of PM2.5, and the paper says it could not allow for people moving house. The evidence for how it works comes from mice and a few tissue samples. The PM2.5 is from all sources, not scooters.',
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
      '一項研究用電腦模式推估 2014 年的台灣。約 6,300 人（6,282 人）的死亡，可以算在空氣裡的 PM2.5（所有來源）頭上。死因是心臟病、中風、肺癌和慢性阻塞性肺病。',
      'A model estimate put about 6,300 (6,282) deaths in Taiwan in 2014 from heart disease, stroke, lung cancer and COPD down to PM2.5 in the air (from all sources).',
    ),
    period: t('2014 年', '2014'),
    place: TW,
    sources: ['lo-2017-jfma'],
    locator: 'Abstract: "In 2014, PM2.5 accounted for 6282 deaths [95% CI, 5716-6847]... population attributable mortality fraction ... 18.6%"',
    confidence: 'verified',
    evidence: 'modelled-tw',
    caveat: t(
      '這是用 2014 年監測資料的模式推估，年代比較久，後來台灣的 PM2.5 已經下降；PM2.5 是所有來源的，這些不是「機車害死的人」。我們找不到更新的台灣推估。' + ABSTRACT_ONLY['zh-TW'],
      'A model estimate from 2014 readings; PM2.5 in Taiwan has fallen since. The PM2.5 is from all sources, so these are not "deaths from scooters". We found no newer Taiwanese estimate. ' + ABSTRACT_ONLY.en,
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
      '世界衛生組織說，小孩呼吸比大人快，會吸進比較多空氣和污染；小孩也比較靠近地面，而有些污染在靠近地面的地方最濃。',
      'The WHO says children breathe faster than adults, so they take in more air and more pollution; they are also closer to the ground, where some pollutants are thickest.',
    ),
    period: t('2018年', '2018'),
    place: GLOBAL,
    sources: ['who-2018-child-health'],
    locator: '"They breathe faster than adults, taking in more air and, with it, more pollutants. Children live closer to the ground, where some pollutants reach peak concentrations."',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '世界衛生組織說的是所有小孩和一般的空氣污染。它不是專指台灣或機車廢氣。它也沒有說，小孩在路口比大人多吸多少。',
      'The WHO is talking about all children and air pollution in general, not Taiwan or scooter exhaust. It gives no figure for how much more a child breathes at a crossing.',
    ),
    chainLink: 6,
    research: '03 §5',
  },
  'pram-height-sharma2020': {
    data: { fineParticlesUpTo: v(44, 'percent', { bound: 'lte' }), coverReduction: v(39, 'percent', { bound: 'lte' }) },
    display: t('最多高 44%（英國）', 'up to 44% higher (UK)'),
    statement: t(
      '英國一項實驗比較了兩個高度。在嬰兒車裡嬰兒的高度，細微粒最多比大人呼吸的高度多 44%。',
      'A UK experiment found up to 44% more fine particles at the height of a baby in a stroller than at the height where adults breathe.',
    ),
    period: t('2020 年發表', 'Published 2020'),
    place: t('英國吉爾福德（2.1 公里路線）', 'Guildford, UK (2.1 km route)'),
    sources: ['sharma-kumar-2020-envint'],
    locator: 'Abstract: "The average in-pram concentration of fine particles was always higher by up to 44% compared with adult breathing height"',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'measured',
    caveat: t(
      '「最多 44%」是各種情況裡最高的那一個，不是平均，而且只有細微粒。它不代表「小孩比大人多吸 44% 的污染」。其他研究的結果不一致。有的發現嬰兒車高度反而比較低，或沒差（見文獻回顧）。台灣沒有在小孩高度量過的研究。' + ABSTRACT_ONLY['zh-TW'],
      '"Up to 44%" is the highest result across all the conditions, not an average, and only for fine particles; it does not mean children breathe 44% more pollution. Other studies disagree, some finding stroller height lower or no different (see the review). Taiwan has no measurements at a child\'s height. ' + ABSTRACT_ONLY.en,
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
      '英國學者寫了一篇文獻回顧，研究都在英國、西班牙和美國，沒有台灣。裡面有四項研究，比較嬰兒車和大人呼吸的高度。它們大多發現，嬰兒車的高度多約 5% 到 15%。最高的 59%，是美國一項路邊 PM2.5 的研究。英國一項研究的早上時段，嬰兒的高度反而少 5%。另一項愛丁堡研究（Galea 2014）不在這四項裡。它發現有幾天反而是大人的高度多 17% 到 51%。有一天小孩的高度多 16%，其餘幾天沒有差別。',
      'UK researchers wrote a review of studies in the UK, Spain and the US; none were in Taiwan. Four studies in it compared stroller height with adult breathing height. They mostly found about 5–15% more at stroller height. The highest, 59%, was PM2.5 in one US roadside study. A UK study found 5% less at baby height in the morning. Another study in Edinburgh (Galea 2014) is not one of the four. It found adult height 17–51% higher on some days, child height 16% higher on one day, and no difference on the rest.',
    ),
    period: t('原始研究 2009–2017 年；回顧 2018 年發表', 'Original studies 2009–2017; review published 2018'),
    place: t('英國、西班牙、美國', 'UK, Spain, USA'),
    sources: ['sharma-kumar-2018-envint'],
    locator: 'Table 3 p.267; Section 3 p.266 (Galea 2014); Table 1',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '每項研究量的污染（PM2.5、二氧化氮、超細微粒）不一樣，高度、儀器和時間也不一樣。它們也沒有列出估的範圍（信賴區間），所以不能合成一個數字。最高的 59% 只來自一項研究。這些數字是文獻回顧轉述的，原始論文我們沒有一篇一篇去查。回顧的作者，和一家做嬰兒車空氣淨化產品的公司有合作。論文沒有利益衝突聲明。上小學的孩子，口鼻比嬰兒車高。對他們來說，確定的只有小孩呼吸比較快。',
      'The studies measured different pollutants (PM2.5, NO2, ultrafine particles) at different heights, with different instruments and over different times. They give no ranges for their results (confidence intervals), so they cannot be combined into one number. The 59% comes from a single study. The figures are as the review reports them; we did not check each original study. The review\'s authors work with a company that makes a stroller air purifier, and the paper has no conflict-of-interest statement. A school-age child\'s nose and mouth are above stroller height. What is certain for them is that they breathe faster.',
    ),
    requiresCaveat: true,
    chainLink: 6,
    research: 'papers/sharma-kumar-2018-envint#overall-up-to-60; papers/sharma-kumar-2018-envint#buzzard2009-pm25; papers/sharma-kumar-2018-envint#kenagy2016-no2; papers/sharma-kumar-2018-envint#garciaalgar2015-ufp; papers/sharma-kumar-2018-envint#kumar2017-baby-vs-adult; papers/sharma-kumar-2018-envint#galea2014-no-difference',
  },
  'child-breathing-per-bodyweight': {
    data: { ratio: v(2, 'ratio', { approx: true }) },
    display: t('每公斤體重呼吸約為大人兩倍', 'about twice the breathing per kilogram'),
    statement: t(
      '英國學者有一篇講嬰兒車的文獻回顧（Sharma 與 Kumar，2018）。它引用的研究說：照每公斤體重算，小孩呼吸的速度一般約是大人的兩倍。所以和肺的大小、體重比起來，小孩吸進的微粒比較多。',
      'A UK review of babies in strollers (Sharma and Kumar, 2018) quotes a study on breathing. For each kilogram of body weight, children generally breathe about twice as fast as adults. So they take in more particles for the size of their lungs and bodies.',
    ),
    period: t('回顧 2018 年發表（引用 Ginsberg 等 2005 年）', 'Review published 2018 (citing Ginsberg et al. 2005)'),
    place: t('不限地區', 'Not place-specific'),
    sources: ['sharma-kumar-2018-envint'],
    locator: 'Section 1 p.263, reason (i)',
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '這是回顧轉述的數字，原始研究我們沒有讀到；也沒有分年齡，或寫出實際吸多少空氣。',
      'A figure as the review reports it; we did not read the original study, and it gives no age groups or actual amounts of air breathed.',
    ),
    chainLink: 6,
    research: 'papers/sharma-kumar-2018-envint#physio-dose-per-bodyweight',
  },
  'child-height-harr2022': {
    data: { higherOnDays: v(6, 'count'), totalDays: v(8, 'count'), higherBy: v(20, 'percent', { bound: 'gt' }) },
    display: t('小孩高度的 PM2.5：8 天中 6 天多 20% 以上（德國）', 'PM2.5 at child height: >20% higher on 6 of 8 days (Germany)'),
    statement: t(
      '德國美因茲一項研究，用便宜的感測器在 1.0 和 1.6 公尺兩個高度量。8 天裡有 6 天，小孩高度的 PM2.5 多了 20% 以上。靠近車多的街道時，差得最多。',
      'A study in Mainz, Germany used cheap sensors at 1.0 m and 1.6 m. PM2.5 was more than 20% higher at child height on six of eight days. The biggest differences were near busy streets.',
    ),
    period: t('2019 年 11 月；2022 年發表', 'November 2019; published 2022'),
    place: t('德國美因茲（5.5 公里路線）', 'Mainz, Germany (5.5 km route)'),
    sources: ['harr-2022-uclim'],
    locator: 'Abstract: children "exposed to > 20% higher concentrations on six days (p < 0.01)", one day > 80%',
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'measured',
    caveat: t(
      '只有一項國外研究，用便宜的感測器，只有 8 天；摘要沒說兩個高度是不是同時量的。台灣沒有在小孩高度量過的研究。' + ABSTRACT_ONLY['zh-TW'],
      'One study abroad, with cheap sensors, over eight days; the abstract does not say whether the two heights were measured at the same time. Taiwan has no measurements at a child\'s height. ' + ABSTRACT_ONLY.en,
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
  simulation,
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
  exposure: t('在街上吸到的', 'What people breathe on the street'),
  standards: t('空氣品質標準與指引', 'Air quality standards and guidelines'),
  hazard: t('危害分類', 'Hazard classifications'),
  health: t('健康證據', 'Health evidence'),
  children: t('小孩', 'Children'),
  economics: t('價格、補助與使用成本', 'Prices, subsidies and running costs'),
  inspection: t('怠速檢驗與排放標準', 'Idle tests and emission standards'),
  intersection: t('路口與街道配置', 'Junctions and street layout'),
  smell: t('氣味與廢氣成分', 'Smell and what exhaust contains'),
  acute: t('短時間吸到，和健康', 'Breathing it briefly, and health'),
  longterm: t('長年吸到，和健康', 'Breathing it for years, and health'),
  vulnerable: t('吸得比較多、身體比較弱的人', 'People who take in more, and people more at risk'),
  levers: t('政策工具', 'Policy levers'),
  kerb: t('路邊的空氣與參考值', 'Kerbside air and reference values'),
  masks: t('口罩擋得住什麼', 'What masks do and do not stop'),
  simulation: t('電腦算的一個紅燈', 'One red light, simulated'),
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
  ...simulation,
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
