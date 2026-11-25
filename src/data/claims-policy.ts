// Editorial guard rails as data: the "do not claim" statements, required qualifiers and
// corrections from the research files, in both languages.
//
// Uses:
// - Page builders and reviewers: read the rules for the topic you are writing about.
// - `flagCopy(text, locale)` returns the rules whose trigger patterns match a piece of copy.
//   A match is a prompt to check the copy against the rule, not proof of an error (e.g. "94%"
//   is fine when it carries its context).
// - An "about this evidence" page can list `claimRules` grouped by topic.
//
// kinds:
//   'do-not-claim' : never publish this claim.
//   'qualifier'    : you may say it, but only with the stated qualifier/context.
//   'correction'   : a widely circulated figure or wording that is wrong; use the corrected one.

import type { L10n, Locale } from './types.ts';
import { t } from './types.ts';
import type { SourceId } from './sources.ts';
import type { FactId, Topic } from './facts.ts';

export type ClaimRuleKind = 'do-not-claim' | 'qualifier' | 'correction';

export interface ClaimRule {
  kind: ClaimRuleKind;
  topic: Topic;
  /** The instruction, phrased as a rule. */
  rule: L10n;
  /** What to say instead, when there is a safe alternative. */
  instead?: L10n;
  /** Why (one or two sentences, for the evidence page and for reviewers). */
  why: L10n;
  /** Case-insensitive regex sources that flag copy for review against this rule. */
  patterns?: { 'zh-TW'?: string[]; en?: string[] };
  facts?: FactId[];
  sources?: SourceId[];
  /** Research file and section the rule comes from. */
  research: string;
}

export const claimRules = {
  // -------------------------------------------------------------------------
  // exposure: the IOT study and commuter studies
  // -------------------------------------------------------------------------
  'iot-94-percent-needs-context': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t(
      '「94%」只能連同其背景一起出現：這是高雄一處路口單一模擬日的模式值，報告自行標示為離群值；一般模擬日約降低3%至21%。',
      'The 94% figure may only appear together with its context: a modelled value for one simulated day at one Kaohsiung intersection, flagged by the report itself as an outlier; typical simulated days showed reductions of roughly 3–21%.',
    ),
    instead: t(
      '在運研所的模式中，行人專用時相於一般模擬日可使行人等候區的PM2.5降低約3%至21%；只有一個模擬日出現94%。',
      'In the Institute of Transportation\'s model, exclusive pedestrian phases lowered PM2.5 at pedestrian waiting areas by roughly 3–21% on typical simulated days, with one simulated day showing 94%.',
    ),
    why: t(
      '媒體把單日離群的模擬值報導成「最多減少94%」或「尖峰時少吸9成廢氣」，讓讀者以為是一般或實測效果。',
      'Press coverage turned a single-day model outlier into "up to 94%" or "90% less exhaust at peak times", implying a typical or measured effect.',
    ),
    patterns: { 'zh-TW': ['9[45](\\.\\d+)?\\s*%', '九成', '9成'], en: ['9[45](\\.\\d+)?\\s*(%|per\\s*cent)', 'ninety'] },
    facts: ['iot-scramble-outlier-day', 'iot-scramble-typical-range'],
    sources: ['iot-2025-intersection-air-quality', 'taipeitimes-2025-04-07-scramble', 'ltn-scramble-90-percent'],
    research: '02 §1a, §1b, Corrections #1',
  },
  'iot-results-are-modelled': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t(
      '運研所的行人專用時相、人行道拓寬與退縮情境效果都是模式模擬，不是實地前後量測；報告結論不代表交通部意見。',
      'The IOT effects of scramble phases, sidewalk widening and setbacks are modelled scenarios, not before-and-after measurements, and the report\'s conclusions do not represent MOTC\'s views.',
    ),
    why: t('報告說明現實中無法在同一路口改動策略，因此以擴散模式模擬。', 'The report explains the strategies could not be changed at the same real intersection, so they were simulated.'),
    patterns: { 'zh-TW': ['運研所.{0,20}(實測|測得)', '交通部(表示|證實)'], en: ['IOT (measured|found that)', 'ministry (says|confirmed)'] },
    facts: ['iot-study-design'],
    sources: ['iot-2025-intersection-air-quality'],
    research: '02 §1a, Corrections #2',
  },
  'iot-co-not-reduced': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可說行人專用時相能減少一氧化碳暴露約11%或普遍降低一氧化碳。',
      'Do not claim scramble crossings cut carbon monoxide exposure by "about 11%" or reduce CO in general.',
    ),
    why: t(
      '報告中找不到11%的一氧化碳標題數字；在臺北與新北路口，模擬的一氧化碳反而上升7%至40%。',
      'No 11% CO headline exists in the report; at the Taipei and New Taipei intersections modelled CO actually rose by 7–40%.',
    ),
    patterns: { 'zh-TW': ['一氧化碳.{0,12}11\\s*%', '11\\s*%.{0,12}一氧化碳'], en: ['(carbon monoxide|CO).{0,20}11\\s*%', '11\\s*%.{0,20}(carbon monoxide|CO\\b)'] },
    facts: ['iot-scramble-co-rise'],
    sources: ['iot-2025-intersection-air-quality', 'taipeitimes-2025-04-07-scramble'],
    research: '02 §1a',
  },
  'iot-sidewalk-2-percent-best-case': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t(
      '人行道拓寬0.5公尺「約減少2%」只能說是最佳情況，且結果方向不一致（部分情境上升）。',
      'Sidewalk widening\'s "about 2%" may only be described as the best case of mixed-sign results (some scenarios increased).',
    ),
    why: t('模擬變化從降低1.88%到增加5.34%。', 'Modelled changes ranged from −1.88% to +5.34%.'),
    patterns: { 'zh-TW': ['人行道.{0,15}2\\s*%'], en: ['sidewalk.{0,30}2\\s*%'] },
    facts: ['iot-sidewalk-widening'],
    sources: ['iot-2025-intersection-air-quality'],
    research: '02 §1a',
  },
  'no-merging-commute-studies': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可把Wang等（2021）的騎機車75 µg/m³與Chuang等（2020）的53.6 µg/m³合併成「50至75」之類的範圍。',
      'Do not merge Wang et al. 2021 (riding 75 µg/m³) and Chuang et al. 2020 (scooter 53.6 µg/m³) into a range such as "50–75".',
    ),
    instead: t('分別引用兩項研究，並說明一個是中位數、一個是平均值。', 'Cite the two studies separately, noting one is a median and the other a mean.'),
    why: t('兩項研究的方法、樣本與統計量（中位數與平均值）都不同。', 'The studies differ in method, sample and statistic (median vs mean).'),
    patterns: { 'zh-TW': ['5\\d\\s*[-–~～至到]\\s*75'], en: ['5\\d\\s*(-|–|to)\\s*75'] },
    facts: ['commute-motorcycle-wang2021', 'commute-scooter-vs-subway-chuang2020'],
    sources: ['wang-2021-atmosphere', 'chuang-2020-aeax'],
    research: '02 Corrections #4',
  },
  'rider-exposure-is-not-pedestrian': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t(
      'Wu等（2021）的數字是騎士在車流中的暴露，不是行人暴露；研究說機車的貢獻「可能大於」公車、貨車與小客車，不是「最主要來源」。',
      'Wu et al. 2021 figures are riders\' exposures in traffic, not pedestrians\'; the paper says scooters "could contribute more" than buses, trucks and cars, not that they are the main source.',
    ),
    why: t('研究量測的是自行車與機車騎士沿路線的平均暴露。', 'The study measured route-average exposure of cyclists and motorcyclists.'),
    patterns: { 'zh-TW': ['機車.{0,10}最主要(的)?來源'], en: ['scooters? (are|is) the (main|biggest|largest) (source|contributor)'] },
    facts: ['rider-exposure-wu2021', 'rider-scooter-contribution-wu2021'],
    sources: ['wu-2021-trd'],
    research: '02 §2, Corrections #3',
  },
  'non-taiwan-studies': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可把國外研究說成臺灣研究：Choi等（2018）路口超細微粒研究（美國加州大學洛杉磯分校團隊）、arXiv 2011.09286、Harr等（2022，德國）與Sharma與Kumar（2020，英國）都不是臺灣研究。',
      'Do not present foreign studies as Taiwanese: Choi et al. 2018 (UCLA group, intersection ultrafine particles), arXiv 2011.09286, Harr et al. 2022 (Germany) and Sharma & Kumar 2020 (UK) are not Taiwan studies.',
    ),
    why: t('先前的資料把部分研究誤植為臺灣研究。', 'Earlier notes wrongly attributed some of these to Taiwan.'),
    facts: ['child-height-harr2022', 'pram-height-sharma2020'],
    sources: ['harr-2022-uclim', 'sharma-kumar-2020-envint'],
    research: '02 §4, §6, Corrections #5',
  },
  'no-taiwan-child-height-data': {
    kind: 'do-not-claim',
    topic: 'children',
    rule: t(
      '不可說兒童「比成人多吸44%污染」，也不可引用任何臺灣兒童高度的實測數字（目前沒有）；「推車高度多60%」未經查證。',
      'Do not say children breathe "44% more pollution" than adults, or cite any Taiwanese child-height measurement (none exists); the "60% more at pram height" figure is unverified.',
    ),
    instead: t(
      'WHO指出兒童更接近地面，某些污染物在那裡濃度最高；英國一項實驗發現推車高度的細微粒最多高44%。',
      'WHO notes children live closer to the ground, where some pollutants peak; a UK experiment found fine particles up to 44% higher at pram height.',
    ),
    why: t('44%是英國研究中各條件的最大值，只針對細微粒與嬰兒推車高度。', 'The 44% is a maximum across conditions in a UK study, for fine particles at pram height only.'),
    patterns: { 'zh-TW': ['44\\s*%', '60\\s*%.{0,10}(推車|兒童)'], en: ['44\\s*(%|per\\s*cent)', '60\\s*%.{0,20}(pram|child)'] },
    facts: ['pram-height-sharma2020', 'who-children-vulnerable', 'child-height-harr2022'],
    sources: ['sharma-kumar-2020-envint'],
    research: '03 §5, (c); 02 §6',
  },
  'exhaust-height-is-assumption': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t('排氣管離地0.5公尺是運研所模式的假設，不是實測。', 'The 0.5 m exhaust height is an assumption in the IOT model, not a measurement.'),
    why: t('研究資料中沒有臺灣機車排氣高度的實測。', 'Our research found no measurement of Taiwanese scooter exhaust height.'),
    patterns: { 'zh-TW': ['0\\.5\\s*公尺'], en: ['0\\.5\\s*m(etre)?s?\\b'] },
    facts: ['iot-exhaust-height-assumption'],
    sources: ['iot-2025-intersection-air-quality'],
    research: '02 §6',
  },
  'no-arcade-or-idling-measurements': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可引用臺灣騎樓與測站的濃度比較，或臺灣紅燈怠速廢氣的實測數字：目前研究資料中都沒有。',
      'Do not cite a Taiwanese arcade (騎樓)-versus-station comparison or measured red-light idling emissions for Taiwan: none is in our research.',
    ),
    why: t(
      '運研所只以時速5公里的排放係數假設怠速；怠速專題研究仍在進行中，完成後會另行加入。',
      'The IOT model only assumes idling at the 5 km/h emission factor; a separate idling research sweep is in progress and will be added when complete.',
    ),
    patterns: { 'zh-TW': ['騎樓', '怠速'], en: ['arcade', 'idling'] },
    sources: ['iot-2025-intersection-air-quality'],
    research: '02 §4, §5',
  },
  'stations-use-table-not-text': {
    kind: 'correction',
    topic: 'exposure',
    rule: t(
      '臺北市環保局113年年報內文的2024年數字（13.2／16.5）是誤植的2021年數值，請使用表3-2-7（11.1／11.2）。',
      'The 2024 figures in the Taipei EPD 2024 report\'s text (13.2/16.5) repeat the 2021 values; use Table 3-2-7 (11.1/11.2).',
    ),
    why: t('年報內文與其統計表互相矛盾。', 'The report\'s text contradicts its own table.'),
    patterns: { 'zh-TW': ['13\\.2.{0,6}16\\.5'], en: ['13\\.2.{0,10}16\\.5'] },
    facts: ['taipei-traffic-station-gap'],
    sources: ['taipei-epd-air-report-2024'],
    research: '02 §4, Corrections #8',
  },
  'no-county-level-ev-paper': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可引用「縣市層級分析顯示電動機車越多、PM10與一氧化碳等越低」的研究：經多方搜尋找不到。',
      'Do not cite a "county-level analysis showing more e-scooters means lower PM10, CO, SO2 and NO2": no such paper was found despite targeted searches.',
    ),
    why: t('最接近的只有未發表的碩士論文與一篇模式研討會論文。', 'The nearest items are an unpublished master\'s thesis and a modelling conference paper.'),
    patterns: { 'zh-TW': ['縣市.{0,15}電動機車.{0,20}(降低|減少)'], en: ['county-level.{0,40}(e-scooter|electric scooter)'] },
    research: '02 §7, Corrections #6',
  },

  // -------------------------------------------------------------------------
  // emissions
  // -------------------------------------------------------------------------
  'scooter-pm25-small-fumes-large': {
    kind: 'qualifier',
    topic: 'emissions',
    rule: t(
      '不可把機車說成PM2.5的主要來源：燃油機車只占全國原生PM2.5排放的1.31%，每公里PM2.5排放也低於汽柴油車。機車的問題在碳氫化合物、苯、一氧化碳、數量龐大與離人很近。',
      'Do not present scooters as a major PM2.5 source: gasoline scooters are 1.31% of primary PM2.5 emissions and emit less PM2.5 per km than cars or diesels. The case rests on hydrocarbons, benzene, CO, fleet size and proximity.',
    ),
    why: t('依TEDS 13.0與臺灣排放係數研究。', 'Per TEDS 13.0 and Taiwanese emission-factor studies.'),
    patterns: { 'zh-TW': ['機車.{0,12}(PM2\\.5|細懸浮微粒).{0,10}(主要|最大)來源'], en: ['scooters?.{0,30}(main|major|biggest|largest) source of (PM2\\.5|fine particles)'] },
    facts: ['teds13-mc-pm25-share', 'ef-vehicle-class-ranking-tsai2023', 'teds13-mc-gas-vs-particle-contrast'],
    sources: ['moenv-teds13-workbook', 'tsai-2023-atmosphere'],
    research: '01 §4; 02 §5, Corrections #7',
  },
  'teds-pm25-tonnage-correction': {
    kind: 'correction',
    topic: 'emissions',
    rule: t(
      '機車的原生PM2.5排放不是「約2,100公噸」，TEDS 13.0為441.7公噸（1.31%）；非甲烷碳氫化合物不是「7%至9%」，而是9.99%。',
      'Motorcycle primary PM2.5 is not "about 2,100 t": TEDS 13.0 gives 441.7 t (1.31%). NMHC is not "7–9%" but 9.99%.',
    ),
    why: t('先前流傳的數字與最新官方清冊不符。', 'Earlier circulating figures do not match the latest official inventory.'),
    patterns: { 'zh-TW': ['2,?100\\s*公噸', '7\\s*[-–~～至到]\\s*9\\s*%'], en: ['2,?100\\s*(t|tonnes)', '7\\s*(-|–|to)\\s*9\\s*%'] },
    facts: ['teds13-mc-pm25-share', 'teds13-mc-nmhc-share'],
    sources: ['moenv-teds13-workbook'],
    research: '01 §4, Corrections #4–#5',
  },
  'teds-editions-not-comparable': {
    kind: 'qualifier',
    topic: 'emissions',
    rule: t(
      '只使用TEDS 13.0（2023年基準）的排放占比，不可與11.0或12.0版的數字混用或比較趨勢。',
      'Use only TEDS 13.0 (base 2023) shares; do not mix or trend them against TEDS 11.0 or 12.0.',
    ),
    why: t('環境部表示不同版本的清冊不能直接比較。', 'MOENV says different editions are not directly comparable.'),
    patterns: { 'zh-TW': ['TEDS\\s*1[12]'], en: ['TEDS\\s*1[12]'] },
    facts: ['teds13-edition'],
    sources: ['moenv-teds-page'],
    research: '01 Corrections #7',
  },
  'emissions-are-not-concentrations': {
    kind: 'qualifier',
    topic: 'emissions',
    rule: t(
      '排放量占比不等於對空氣中濃度（人吸到的空氣）的貢獻；寫排放占比時要清楚標明是「排放」。',
      'An emissions share is not a contribution to air concentrations (what people breathe); label emission shares as emissions.',
    ),
    why: t('環境部明言「直接以排放量占比為空氣污染貢獻比率是錯誤論述」。', 'MOENV states that treating emission shares as contributions to air pollution is a mistaken argument.'),
    patterns: { 'zh-TW': ['(貢獻|造成).{0,8}空氣中.{0,8}\\d+(\\.\\d+)?\\s*%'], en: ['of the (PM2\\.5|pollution) (people breathe|in the air)'] },
    facts: ['teds13-road-vs-power', 'ambient-pm25-power-share'],
    sources: ['moenv-news-2025-power-sector'],
    research: '01 §5',
  },
  'traffic-vs-power-wording': {
    kind: 'qualifier',
    topic: 'emissions',
    rule: t(
      '「交通是比發電更大的國內PM2.5來源」不是環境部的說法；只能以三種可查證的形式表達：電力業約占空氣中PM2.5的2.3%；舊版模式中移動源約占國內來源的27.5%；道路車輛的原生PM2.5與氮氧化物排放多於電力業。',
      '"Traffic is a bigger domestic PM2.5 source than power" is not an MOENV statement; say it only in three supportable forms: power is about 2.3% of ambient PM2.5; mobile sources were about 27.5% of the domestic share in an older model; road vehicles emit more primary PM2.5 and NOx than power.',
    ),
    why: t('兩個比例的分母不同，合併計算（約18%）只能標示為本站推算。', 'The denominators differ; combining them (about 18%) must be labelled as our estimate.'),
    patterns: { 'zh-TW': ['(交通|車輛).{0,15}(大於|多於|超過).{0,6}(電力|發電|電廠)'], en: ['(traffic|vehicles).{0,30}(bigger|larger|more).{0,20}(power|electricity)'] },
    facts: ['ambient-pm25-power-share', 'ambient-pm25-domestic-sources-2020-plan', 'teds13-road-vs-power', 'ambient-pm25-mobile-share-derived'],
    sources: ['moenv-news-2025-power-sector', 'moenv-air-plan-2020', 'moenv-teds13-workbook'],
    research: '01 §5, Corrections #8',
  },
  'taichung-not-national': {
    kind: 'do-not-claim',
    topic: 'emissions',
    rule: t(
      '臺中市的清冊數字（例如移動源占PM2.5的37.4%或16.1%）是城市數字，不可當作全國數字。',
      'Taichung inventory figures (e.g. mobile sources 37.4% or 16.1% of PM2.5) are city figures and must not be used as national ones.',
    ),
    why: t('初版研究混入了臺中市的數字。', 'The first research pass mixed in Taichung figures.'),
    patterns: { 'zh-TW': ['37\\.4\\s*%', '16\\.1\\s*%'], en: ['37\\.4\\s*%', '16\\.1\\s*%'] },
    research: '01 Corrections #12',
  },
  'ev-emissions-not-zero': {
    kind: 'qualifier',
    topic: 'emissions',
    rule: t(
      '電動機車沒有排氣管廢氣，但不是「零污染」：仍有輪胎、煞車與道路揚塵等非排氣微粒，且發電端有排放。',
      'Electric scooters have no tailpipe exhaust but are not "zero pollution": they still produce non-exhaust particles, and power generation has emissions.',
    ),
    why: t('TEDS 13.0估計電動機車PM2.5為6.5公噸；生命週期研究顯示硫氧化物較高。', 'TEDS 13.0 puts electric scooters at 6.5 t of PM2.5; a life-cycle study found higher SOx.'),
    patterns: { 'zh-TW': ['零污染', '零排放'], en: ['zero[- ](pollution|emissions?)'] },
    facts: ['teds13-electric-mc-pm25', 'ev-vs-gasoline-ef-hsieh2018'],
    sources: ['moenv-teds13-workbook', 'hsieh-2018-iop'],
    research: '01 §4; 02 §7',
  },

  // -------------------------------------------------------------------------
  // fleet, electric, policy
  // -------------------------------------------------------------------------
  'not-worlds-highest': {
    kind: 'correction',
    topic: 'fleet',
    rule: t(
      '不可說臺灣的機車密度「世界最高」，應說「名列前茅」或「最高的國家之一」。',
      'Do not say Taiwan has "the world\'s highest" scooter density; say it is "among the highest".',
    ),
    instead: t(
      '臺灣每百人約有63輛機車，在一份區域排名中位居受比較國家之首。',
      'Taiwan has about 63 registered motorcycles per 100 people and topped the countries compared in one regional ranking.',
    ),
    why: t('依據只有一份非官方、未註明年份的排名，與越南只差3輛。', 'It rests on a single unofficial, undated ranking, with a 3-point gap to Vietnam.'),
    patterns: {
      'zh-TW': ['(世界|全球|全世界)(第一|最高|之冠|最密)', '密度(世界|全球)第一'],
      en: ["world'?s (highest|densest|most)", 'highest in the world', 'number one in the world'],
    },
    facts: ['fleet-regional-ranking', 'fleet-density-per-100'],
    sources: ['tvbs-cars-vehicle-registrations-ranking', 'tvbs-2025-scooter-density'],
    research: '01 §2, Corrections #3',
  },
  'no-gas-scooter-ban': {
    kind: 'do-not-claim',
    topic: 'policy',
    rule: t(
      '不可說政府已宣布禁售燃油機車；淨零路徑只有2040年電動機車市售比100%的目標。',
      'Do not say the government has banned (or announced a ban on) new gasoline scooters; the net-zero path only sets a 100% electric sales-share target for 2040.',
    ),
    why: t('媒體說法互相矛盾，找不到國發會或交通部的正式文件。', 'Media statements conflict, and no NDC or MOTC primary document was found.'),
    patterns: { 'zh-TW': ['禁售', '禁止(販售|銷售)燃油'], en: ['\\bban(s|ned)?\\b.{0,30}(gas|petrol|gasoline)', 'phase[- ]out law'] },
    facts: ['netzero-ev-sales-targets'],
    sources: ['tvbs-2022-mode-share', 'pts-2026-07-scooter-fleet'],
    research: '01 §8, Corrections #10',
  },
  'netzero-2035-is-70': {
    kind: 'correction',
    topic: 'policy',
    rule: t(
      '淨零路徑的電動機車市售比目標是2035年70%、2040年100%，不是2035年100%。',
      'The net-zero target is 70% of sales in 2035 and 100% in 2040, not 100% in 2035.',
    ),
    why: t('依公視對淨零路徑的描述。', 'Per PTS\'s description of the net-zero pathway.'),
    patterns: { 'zh-TW': ['2035.{0,10}100\\s*%'], en: ['2035.{0,20}100\\s*%'] },
    facts: ['netzero-ev-sales-targets'],
    sources: ['pts-2026-07-scooter-fleet'],
    research: '01 Corrections #9',
  },
  'registration-series-break-2013': {
    kind: 'qualifier',
    topic: 'fleet',
    rule: t(
      '機車登記數在2013年因老舊機車切結報廢而出現斷層，不可把2013年以前的數字與之後直接比較。',
      'The registration series breaks in 2013 (sworn scrappage of old scooters); do not compare pre-2013 counts directly with later ones.',
    ),
    why: t('依公路局資料集說明。', 'Per the Highway Bureau dataset definition.'),
    patterns: { 'zh-TW': ['20(0\\d|1[0-2])年.{0,20}(萬輛|登記)'], en: ['(in|since) 20(0\\d|1[0-2]).{0,40}registered'] },
    sources: ['datagov-14208-motorcycle-registrations'],
    research: '01 §1',
  },
  'monthly-2026-not-annual': {
    kind: 'qualifier',
    topic: 'electric',
    rule: t('2026年的單月銷量不可當作全年數字或畫成年度資料點。', 'Single-month 2026 sales must not be presented or charted as an annual figure.'),
    why: t('只查證到5月的數字。', 'Only the May figures were verified.'),
    facts: ['ev-share-may-2026'],
    sources: ['ctee-2026-06-may-sales'],
    research: '01 §7',
  },
  'ev-decline-causes-unverified': {
    kind: 'qualifier',
    topic: 'electric',
    rule: t(
      '電動機車銷量下滑的原因（補助減少、Gogoro方案調整、燃油機車貨物稅減徵）只能寫成「媒體報導認為」，不可寫成已證實的因果。',
      'Reasons for falling electric sales (subsidy cuts, Gogoro plan changes, the gasoline excise-tax cut) may only be attributed to media reports, not stated as established causes.',
    ),
    why: t('這些原因只見於媒體分析。', 'These causes appear only in media analysis.'),
    facts: ['ev-registrations-decline-2019-2025', 'gas-scooter-excise-cut-2025'],
    sources: ['tvbs-cars-2025-12-ev-sales'],
    research: '01 §7',
  },
  'old-scooter-phase-equivalence': {
    kind: 'qualifier',
    topic: 'policy',
    rule: t(
      '環境部以出廠日期（2007年6月30日前）定義汰舊補助對象；「老舊機車等於第一至四期」是推論，不是官方定義。',
      'MOENV defines subsidy-eligible old scooters by build date (before 30 June 2007); equating them with "Phases 1–4" is an inference, not the official definition.',
    ),
    why: t('第五期自2007年7月1日起實施，兩者時間吻合，但官方文字未如此定義。', 'Phase 5 began on 1 July 2007, so the dates match, but the official text does not define it that way.'),
    patterns: { 'zh-TW': ['[1一][-–~～至到][4四]期'], en: ['phases? 1\\s*(-|–|to)\\s*4'] },
    facts: ['scrappage-subsidy-scope', 'scooter-emission-standard-phases'],
    sources: ['moenv-air-review-2023'],
    research: '01 §6',
  },

  // -------------------------------------------------------------------------
  // hazard and health
  // -------------------------------------------------------------------------
  'gasoline-exhaust-is-2b': {
    kind: 'do-not-claim',
    topic: 'hazard',
    rule: t(
      '不可說汽油（機車）廢氣是IARC第1級致癌物，或「和柴油一樣致癌」。汽油引擎廢氣是2B級；苯與室外空氣污染才是1級。',
      'Do not say gasoline (scooter) exhaust is an IARC Group 1 carcinogen or "as carcinogenic as diesel". Gasoline engine exhaust is Group 2B; benzene and outdoor air pollution are Group 1.',
    ),
    instead: t(
      'IARC把汽油引擎廢氣列為「可能致癌」（2B級）；汽油廢氣中含有的苯，以及整體室外空氣污染，則被列為「對人類致癌」（1級）。',
      'IARC classifies gasoline engine exhaust as "possibly carcinogenic" (Group 2B); benzene, which gasoline exhaust contains, and outdoor air pollution as a whole are "carcinogenic to humans" (Group 1).',
    ),
    why: t('IARC 2012年重新評估後維持2B級；柴油廢氣是1級，不可混為一談。', 'IARC kept gasoline exhaust at 2B in 2012; diesel exhaust is Group 1 and must not be conflated.'),
    patterns: {
      'zh-TW': ['(汽油|機車).{0,10}(廢氣|排氣).{0,15}(第?一級|1\\s*級|一類|1\\s*類)', '(和|跟|與)柴油一樣'],
      en: ['(gasoline|petrol|scooter) (engine )?exhaust.{0,30}group 1\\b', 'as carcinogenic as diesel'],
    },
    facts: ['iarc-gasoline-exhaust-2b', 'iarc-diesel-exhaust-group1', 'iarc-benzene-group1', 'iarc-outdoor-air-pollution-group1'],
    sources: ['iarc-pr213-2012'],
    research: '03 §1a, (a)#1, (c)',
  },
  'iarc-hazard-not-risk': {
    kind: 'qualifier',
    topic: 'hazard',
    rule: t(
      'IARC分類的是「危害」（能不能致癌），不是日常暴露量下的「風險」，也沒有量化機車廢氣的貢獻。',
      'IARC classifies hazard (whether something can cause cancer), not the risk at everyday doses, and does not quantify scooter exhaust\'s contribution.',
    ),
    why: t('依IARC分類的性質。', 'This is what IARC classifications are.'),
    facts: ['iarc-benzene-group1', 'iarc-outdoor-air-pollution-group1'],
    sources: ['iarc-vol120-benzene', 'iarc-pr221-2013'],
    research: '03 §1a',
  },
  'associations-not-causes-tw': {
    kind: 'qualifier',
    topic: 'health',
    rule: t(
      '臺灣的健康研究只顯示關聯，中文請寫「與…有關」，不可寫「導致」「造成」「引起」；英文寫 associated with。',
      'Taiwanese health studies show associations: write "associated with", never "causes", "leads to" or "results in" (the zh-TW rule gives the Chinese equivalents).',
    ),
    why: t('這些多為橫斷面或生態學研究，量測的是所有來源的PM2.5或交通污染，並未單獨區分機車廢氣。', 'Most are cross-sectional or ecological, and they measure PM2.5 from all sources or traffic pollution without isolating scooter exhaust.'),
    patterns: { 'zh-TW': ['導致', '造成', '引起', '害.{0,4}(得|罹)'], en: ['\\bcaus(e|es|ed|ing)\\b', 'leads? to', 'results? in'] },
    facts: ['guo2019-lung-function', 'tsai2025-asthma-feno', 'hwang2005-asthma-co', 'cho2023-kindergarten-asthma', 'chuang2020-cardiovascular-association'],
    research: '03 (c)',
  },
  'studies-do-not-isolate-scooters': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可說臺灣研究證明「機車廢氣」造成某種疾病，或說某人的氣喘、癌症、心臟病是機車造成的。',
      'Do not claim Taiwanese studies show scooter exhaust causes a disease, or that scooter exhaust caused any specific person\'s asthma, cancer or heart disease.',
    ),
    why: t('沒有任何一項研究把健康效應單獨歸因於機車廢氣。', 'None of the studies attributes health effects specifically to scooter exhaust.'),
    patterns: { 'zh-TW': ['機車(廢氣|排氣).{0,10}(導致|造成|引起)'], en: ['scooter (exhaust|fumes).{0,20}caus'] },
    research: '03 (c)',
  },
  'brief-exposures-not-established': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可說在怠速機車後方待幾分鐘會致病；短暫接觸的健康後果尚未確立。',
      'Do not claim that a few minutes behind an idling scooter causes illness; the health consequences of brief encounters are not established.',
    ),
    instead: t(
      '靠近車流處的高峰暴露量測得較高，但個別短暫接觸的健康後果尚未確立。',
      'Peak exposures near traffic are measured to be higher, but the health consequences of individual brief encounters are not established.',
    ),
    why: t('現有證據涵蓋的是數小時至數週（美國心臟學會）或一小時通勤（Chuang等）。', 'The evidence covers hours to weeks (AHA) or a one-hour commute (Chuang et al.).'),
    patterns: { 'zh-TW': ['幾分鐘.{0,15}(致病|傷害|生病)', '(怠速|紅燈).{0,15}(致病|致癌)'], en: ['(few|several) minutes.{0,40}(ill|harm|disease)', 'idling.{0,30}(cancer|illness)'] },
    facts: ['aha-2010-pm25-cardiovascular', 'chuang2020-cardiovascular-association'],
    sources: ['brook-2010-circulation', 'chuang-2020-aeax'],
    research: '03 §7, (c)',
  },
  'never-smoker-lung-cancer-cause': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可說空氣污染是臺灣不吸菸者肺癌的「原因」，或占某個百分比。',
      'Do not say air pollution is "the cause" of lung cancer in Taiwanese never-smokers, or give it any percentage share.',
    ),
    instead: t(
      '臺灣過半肺癌患者從未吸菸，研究者正在探討空氣污染是否扮演角色；現有證據屬生態學關聯與動物機制，尚非定論。',
      'More than half of Taiwan\'s lung cancer patients never smoked, and researchers are investigating whether air pollution plays a part; the evidence is ecological association plus animal mechanism, not settled.',
    ),
    why: t('Tseng 2019與Hill 2023都是生態學或機制研究。', 'Tseng 2019 and Hill 2023 are ecological or mechanistic.'),
    patterns: { 'zh-TW': ['不吸菸.{0,15}肺癌.{0,15}(原因|因為|導致)'], en: ['never[- ]smokers?.{0,40}(caused by|because of)'] },
    facts: ['tseng2019-never-smokers', 'hill2023-egfr-ecological'],
    sources: ['tseng-2019-jto', 'hill-2023-nature'],
    research: '03 §3c, (c)',
  },
  'lung-cancer-leading-cancer-not-leading-death': {
    kind: 'correction',
    topic: 'health',
    rule: t(
      '肺癌是臺灣「癌症」死因的首位，不是所有死因的首位（癌症整體才是死因首位）。',
      'Lung cancer is Taiwan\'s leading cause of cancer death, not the leading cause of death overall (cancer as a whole is).',
    ),
    why: t('依衛福部114年死因統計。', 'Per MOHW 2025 cause-of-death statistics.'),
    patterns: { 'zh-TW': ['肺癌.{0,6}(十大)?死因(第一|首位)'], en: ['lung cancer.{0,20}leading cause of death'] },
    facts: ['mohw-lung-cancer-2025'],
    sources: ['mohw-cause-of-death-2025'],
    research: '03 §3d, (a)#5',
  },
  'chuang-effect-sizes': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可引用Chuang等（2020）的血壓、心率百分比作為「每1 µg/m³」的效果大小；也不可把8-OHdG說成「DNA損傷導致疾病的證據」。',
      'Do not quote Chuang et al. 2020\'s blood-pressure or heart-rate percentages as effects "per 1 µg/m³", or present 8-OHdG as "proof of DNA damage causing disease".',
    ),
    why: t('摘要未說明百分比對應的PM2.5增量；8-OHdG只是氧化壓力指標。', 'The abstract does not state the increment; 8-OHdG is only an oxidative-stress marker.'),
    patterns: { 'zh-TW': ['7\\.9\\s*%', '6\\.5\\s*%', '6\\.4\\s*%', '8\\.9\\s*%'], en: ['7\\.9\\s*%', '6\\.4\\s*%', '8\\.9\\s*%'] },
    facts: ['chuang2020-cardiovascular-association'],
    sources: ['chuang-2020-aeax'],
    research: '03 §4, (c)',
  },
  'tsai2025-or-increment': {
    kind: 'qualifier',
    topic: 'health',
    rule: t(
      'Tsai等（2025）的氣喘勝算比1.595沒有說明對應多少PM2.5增量，不可寫成「每1 µg/m³」；研究背景是工業區而非機車。',
      'Tsai et al. 2025\'s asthma odds ratio of 1.595 has no stated PM2.5 increment, so never write "per 1 µg/m³"; the setting is industrial, not scooter traffic.',
    ),
    why: t('摘要未說明增量單位。', 'The abstract does not state the increment.'),
    patterns: { 'zh-TW': ['1\\.595'], en: ['1\\.595'] },
    facts: ['tsai2025-asthma-feno'],
    sources: ['tsai-2025-pedres'],
    research: '03 §3a',
  },
  'hwang-nox-not-significant': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可說Hwang等（2005）證明氮氧化物導致臺灣兒童氣喘：氮氧化物的估計值不顯著，PM10甚至呈反向關聯。',
      'Do not say Hwang et al. 2005 shows NOx causes asthma in Taiwanese children: its NOx estimate was not significant and PM10 was inversely associated.',
    ),
    why: t('作者結論比數據強，應引用實際數字。', 'The authors\' conclusion is stronger than their data; quote the numbers.'),
    patterns: { 'zh-TW': ['氮氧化物.{0,10}(導致|造成).{0,6}氣喘'], en: ['NOx.{0,20}caus.{0,20}asthma'] },
    facts: ['hwang2005-asthma-co'],
    sources: ['hwang-2005-thorax'],
    research: '03 §3a, (c)',
  },
  'who-7-million-is-combined': {
    kind: 'qualifier',
    topic: 'health',
    rule: t(
      'WHO的「700萬人死亡」是室外加室內空氣污染的合計，不可說全部來自室外空氣污染；室外單獨的估計是400萬至900萬。',
      'WHO\'s "7 million deaths" combines outdoor and household air pollution; do not attribute it all to outdoor air. Outdoor alone is estimated at 4–9 million.',
    ),
    why: t('依WHO 2021年指引第1.3.3節。', 'Per WHO 2021 guidelines section 1.3.3.'),
    patterns: { 'zh-TW': ['700\\s*萬'], en: ['7\\s*million'] },
    facts: ['who-7-million-deaths'],
    sources: ['who-2021-aqg'],
    research: '03 §2, (a)#3, (c)',
  },
  'no-recent-tw-deaths-or-scooter-deaths': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可引用2014年以後的臺灣PM2.5歸因死亡數，或任何「死於機車廢氣」的人數：都沒有可查證的來源。',
      'Do not cite Taiwanese PM2.5-attributable deaths for any year after 2014, or any number of deaths "from scooters": no verifiable source exists.',
    ),
    why: t('最新可查證的是Lo等（2017）以2014年資料所做的模式推估。', 'The latest verifiable figure is Lo et al. 2017\'s modelled estimate for 2014.'),
    patterns: { 'zh-TW': ['(死於|因).{0,6}機車.{0,10}(死亡|喪命)'], en: ['deaths? (from|caused by) scooters?'] },
    facts: ['lo2017-pm25-deaths-2014'],
    sources: ['lo-2017-jfma'],
    research: '03 §3d, (c)',
  },
  'no-dementia-numbers': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可引用Jung等（2015）的失智症數字；最多只能說「一項臺灣世代研究曾報告關聯」。',
      'Do not cite Jung et al. 2015\'s dementia numbers; at most say "one Taiwanese cohort study reported an association".',
    ),
    why: t('摘要報告的風險數字大得不合理，且PM2.5是由PM10推估。', 'The abstract reports implausibly large risk figures, and PM2.5 was estimated from PM10.'),
    patterns: { 'zh-TW': ['失智.{0,15}\\d+\\s*%', '阿茲海默.{0,15}\\d+\\s*%'], en: ["(dementia|alzheimer'?s).{0,30}\\d+\\s*%"] },
    sources: ['jung-2015-jad'],
    research: '03 §3e, (c)',
  },
  'hei-is-association-no-lung-function': {
    kind: 'qualifier',
    topic: 'health',
    rule: t(
      'HEI第23號報告評估的是「關聯」的信心，明言未評估因果，也沒有涵蓋肺功能。',
      'HEI Special Report 23 rates confidence in association; it says it did not assess causality and does not cover lung function.',
    ),
    why: t('依HEI執行摘要。', 'Per the HEI executive summary.'),
    patterns: { 'zh-TW': ['HEI.{0,20}(證明|因果)'], en: ['HEI.{0,30}(prove|causal)'] },
    facts: ['hei-sr23-trap-associations'],
    sources: ['hei-sr23-2022'],
    research: '03 §6, (a)#6, (c)',
  },
  'no-public-opinion-poll': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可說多數臺灣民眾因健康疑慮支持加嚴管制老舊車輛：找不到具代表性的民調。',
      'Do not say a majority of Taiwanese support stricter controls on old vehicles because of health fears: no representative poll was found.',
    ),
    why: t('唯一找到的是抽樣方式不明的網路民調，且無法開啟原文。', 'The only item found is an online poll with unknown sampling, whose page could not be opened.'),
    patterns: { 'zh-TW': ['(民調|調查).{0,15}(近?[89]成|多數)', '87\\.7\\s*%'], en: ['(poll|survey).{0,30}(majority|most taiwanese)', '87\\.7\\s*%'] },
    sources: ['ltn-online-poll-old-vehicles'],
    research: '03 §10, (c)',
  },
  'who-93-percent-children': {
    kind: 'qualifier',
    topic: 'children',
    rule: t(
      'WHO「93%兒童生活在超過指引的空氣中」是依2021年以前的舊指引，對象為15歲以下兒童，引用前需說明。',
      'WHO\'s "93% of children live above the guidelines" refers to the pre-2021 guidelines and to children under 15; say so if it is used.',
    ),
    why: t('依WHO 2018年報告摘要的註記。', 'Per the note on the WHO 2018 summary.'),
    patterns: { 'zh-TW': ['93\\s*%'], en: ['93\\s*%'] },
    sources: ['who-2018-child-health'],
    research: '03 §5',
  },
} satisfies Record<string, ClaimRule>;

export type ClaimRuleId = keyof typeof claimRules;
export const claimRuleList = (Object.entries(claimRules) as [ClaimRuleId, ClaimRule][]).map(([id, r]) => ({ id, ...r }));

export const claimRuleKindLabels: Record<ClaimRuleKind, L10n> = {
  'do-not-claim': t('不可宣稱', 'Do not claim'),
  qualifier: t('必須附帶說明', 'Needs a qualifier'),
  correction: t('更正', 'Correction'),
};

export function claimRulesByTopic(topic: Topic) {
  return claimRuleList.filter((r) => r.topic === topic);
}

export interface CopyFlag {
  id: ClaimRuleId;
  kind: ClaimRuleKind;
  match: string;
  rule: string;
  instead?: string;
}

/**
 * Check a piece of copy against the claims policy. Returns every rule whose trigger
 * patterns match, with the rule text in the copy's language. A match means "check this",
 * not "this is wrong".
 */
export function flagCopy(text: string, locale: Locale): CopyFlag[] {
  const out: CopyFlag[] = [];
  for (const r of claimRuleList) {
    for (const src of r.patterns?.[locale] ?? []) {
      const m = new RegExp(src, 'i').exec(text);
      if (m) {
        out.push({ id: r.id, kind: r.kind, match: m[0], rule: r.rule[locale], instead: r.instead?.[locale] });
        break;
      }
    }
  }
  return out;
}
