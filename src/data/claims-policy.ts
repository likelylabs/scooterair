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
  /** Binding copy rule in docs/editorial-blueprint.md Part 2 (R1-R16) that this rule implements. */
  blueprintRule?: `R${number}`;
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
    patterns: { 'zh-TW': ['9[45](\\.\\d+)?\\s*%', '九成', '9成'], en: ['\\b9[45](\\.\\d+)?\\s*(%|per\\s*cent)', 'ninety[- ]four'] },
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
      '報告中找不到11%的一氧化碳標題數字；在台北與新北路口，模擬的一氧化碳反而上升7%至40%。',
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
      '不可把Wang 等（2021）的騎機車75 µg/m³與Chuang 等（2020）的53.6 µg/m³合併成「50至75」之類的範圍。',
      'Do not merge Wang et al. 2021 (riding 75 µg/m³) and Chuang et al. 2020 (scooter 53.6 µg/m³) into a range such as "50–75".',
    ),
    instead: t('分別引用兩項研究，並說明一個是中位數、一個是平均值。', 'Cite the two studies separately, noting one is a median and the other a mean.'),
    why: t('兩項研究的方法、樣本與統計量（中位數與平均值）都不同。', 'The studies differ in method, sample and statistic (median vs mean).'),
    patterns: { 'zh-TW': ['5\\d\\s*[-–~～至到]\\s*75'], en: ['5\\d\\s*(-|–|to)\\s*75'] },
    facts: ['idle-motorcycle-pm25-wang2021', 'commute-scooter-vs-subway-chuang2020'],
    sources: ['wang-2021-atmosphere', 'chuang-2020-aeax'],
    research: '02 Corrections #4; papers/wang-2021-atmosphere (motorcycle readings idle only)',
    blueprintRule: 'R15',
  },
  'rider-exposure-is-not-pedestrian': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t(
      'Wu 等（2021）一律寫成「台北騎自行車與機車的通勤者」，不可寫成行人；機車組騎的是電動機車，吸入的是周圍車流的廢氣，研究沒有比較燃油與電動機車，也沒有把苯歸因於機車。機車對PM2.5「可能貢獻較多」是因為數量多，每輛公車貨車的影響約為機車的8至10倍。Chuang 等（2020）的騎機車組也是騎士自己的暴露。',
      'Wu et al. 2021 is always "commuters on bicycles and scooters, Taipei", never pedestrians; its scooter group rode electric scooters and breathed surrounding traffic, the study did not compare gasoline with electric, and it does not attribute benzene to scooters. Scooters "could contribute more" to PM2.5 only because there are more of them; per vehicle a bus or truck added about 8-10 times as much. Chuang et al. 2020\'s scooter mode is likewise the rider\'s own exposure.',
    ),
    why: t(
      '全文顯示受測騎士是研究助理，騎租來的電動機車以免量到自己的廢氣；車種歸因只做了PM2.5。',
      'The full text shows the riders were research assistants on rented electric scooters, chosen so they would not measure their own exhaust; vehicle-type attribution covers PM2.5 only.',
    ),
    patterns: {
      'zh-TW': ['機車.{0,10}最主要(的)?來源', 'Wu.{0,20}行人', '燃油機車騎士.{0,10}(苯|BTEX)'],
      en: ['scooters? (are|is) the (main|biggest|largest) (source|contributor)', 'Wu.{0,40}pedestrian', 'gasoline[- ]scooter riders?.{0,20}(benzene|BTEX)', '\\bmotorcyclists?\\b'],
    },
    facts: ['scooter-lane-btex-wu2021', 'traffic-count-pm25-contribution-wu2021', 'cyclist-vs-scooter-lane-benzene-wu2021', 'commute-scooter-vs-subway-chuang2020'],
    sources: ['wu-2021-trd', 'chuang-2020-aeax'],
    research: 'papers/wu-2021-trd (correctionsToAbstractLevelNotes); 02 §2, Corrections #3',
    blueprintRule: 'R15',
  },
  'non-taiwan-studies': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可把國外研究說成台灣研究：Choi 等（2018）路口超細微粒研究（美國加州大學洛杉磯分校團隊）、arXiv 2011.09286、Harr 等（2022，德國），以及Sharma 與 Kumar（2018、2020）和Kumar 等（2017）的英國推車研究，都不是台灣研究。',
      'Do not present foreign studies as Taiwanese: Choi et al. 2018 (UCLA group, intersection ultrafine particles), arXiv 2011.09286, Harr et al. 2022 (Germany), Sharma & Kumar 2018 and 2020 and Kumar et al. 2017 (UK pram studies) are not Taiwan studies.',
    ),
    why: t('先前的資料把部分研究誤植為台灣研究。', 'Earlier notes wrongly attributed some of these to Taiwan.'),
    facts: ['child-height-harr2022', 'pram-height-sharma2020'],
    sources: ['harr-2022-uclim', 'sharma-kumar-2020-envint'],
    research: '02 §4, §6, Corrections #5',
  },
  'no-taiwan-child-height-data': {
    kind: 'do-not-claim',
    topic: 'children',
    rule: t(
      '不可說兒童「比成人多吸44%污染」，不可引用任何台灣兒童高度的實測數字（目前沒有），也不可用數字說兒童「更靠近排氣管」。推車高度的數字要寫成：通常高5%至15%；59%是美國一項路邊PM2.5研究；44%是英國一項實驗的「最多」值；另有研究較低或沒有一致差異。',
      'Do not say children breathe "44% more pollution" than adults, cite any Taiwanese child-height measurement (none exists), or put a number on children being "closer to the tailpipe". Write pram figures as: usually 5–15% higher; 59% is PM2.5 in one US roadside study; 44% is "up to" in one UK experiment; other studies found lower or no consistent difference.',
    ),
    instead: t(
      'WHO指出兒童更接近地面，某些污染物在那裡濃度最高；英國一項實驗發現推車高度的細微粒最多高44%。',
      'WHO notes children live closer to the ground, where some pollutants peak; a UK experiment found fine particles up to 44% higher at pram height.',
    ),
    why: t('44%是英國研究中各條件的最大值；「最多約60%」只來自一項美國研究；學齡兒童的呼吸高度高於推車。', 'The 44% is a maximum across conditions in a UK study; "up to about 60%" rests on one US study; a school-age child breathes above the pram band.'),
    patterns: { 'zh-TW': ['44\\s*%', '60\\s*%.{0,10}(推車|兒童)'], en: ['44\\s*(%|per\\s*cent)', '60\\s*%.{0,20}(pram|child)'] },
    facts: ['pram-height-sharma2020', 'who-children-vulnerable', 'child-height-harr2022', 'stroller-height-review'],
    sources: ['sharma-kumar-2020-envint', 'sharma-kumar-2018-envint'],
    research: '03 §5, (c); 02 §6; papers/sharma-kumar-2018-envint (correctionsToAbstractLevelNotes); redlight/vulnerable-groups (doNotClaim 6)',
    blueprintRule: 'R5',
  },
  'exhaust-height-is-assumption': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t('排氣管離地0.5公尺是運研所模式的假設，不是實測。', 'The 0.5 m exhaust height is an assumption in the IOT model, not a measurement.'),
    why: t('研究資料中沒有台灣機車排氣高度的實測。', 'Our research found no measurement of Taiwanese scooter exhaust height.'),
    patterns: { 'zh-TW': ['0\\.5\\s*公尺'], en: ['0\\.5\\s*m(etre)?s?\\b'] },
    facts: ['iot-exhaust-height-assumption'],
    sources: ['iot-2025-intersection-air-quality'],
    research: '02 §6',
  },
  'no-arcade-or-idling-measurements': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可引用台灣騎樓與測站的濃度比較或台灣紅燈怠速的排放實測數字，也不可說台灣的騎樓、街谷或逆溫會把廢氣困在行人高度：目前沒有任何台灣量測。',
      'Do not cite a Taiwanese arcade (騎樓)-versus-station comparison or a measured Taiwanese red-light idle emission rate, and do not claim arcades, street canyons or inversions trap exhaust at pedestrian height in Taiwan: no Taiwanese measurement exists.',
    ),
    why: t(
      '運研所只以時速5公里的排放係數假設怠速；紅燈專題調查也沒有找到台灣機車的怠速排放率，唯一的怠速排放率來自越南河內。',
      'The IOT model only assumes idling at the 5 km/h emission factor; the red-light sweep found no Taiwanese scooter idle emission rate, the only idle rates being from Hanoi.',
    ),
    patterns: { 'zh-TW': ['騎樓', '怠速'], en: ['arcade', 'idling'] },
    sources: ['iot-2025-intersection-air-quality'],
    research: '02 §4, §5',
  },
  'stations-use-table-not-text': {
    kind: 'correction',
    topic: 'exposure',
    rule: t(
      '台北市環保局113年年報內文的2024年數字（13.2／16.5）是誤植的2021年數值，請使用表3-2-7（11.1／11.2）。',
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
    why: t('依TEDS 13.0與台灣排放係數研究。', 'Per TEDS 13.0 and Taiwanese emission-factor studies.'),
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
      '台中市的清冊數字（例如移動源占PM2.5的37.4%或16.1%）是城市數字，不可當作全國數字。',
      'Taichung inventory figures (e.g. mobile sources 37.4% or 16.1% of PM2.5) are city figures and must not be used as national ones.',
    ),
    why: t('初版研究混入了台中市的數字。', 'The first research pass mixed in Taichung figures.'),
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
      '不可說台灣的機車密度「世界最高」，應說「名列前茅」或「最高的國家之一」。',
      'Do not say Taiwan has "the world\'s highest" scooter density; say it is "among the highest".',
    ),
    instead: t(
      '台灣每百人約有63輛機車，在一份區域排名中位居受比較國家之首。',
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
    blueprintRule: 'R16',
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
      '台灣的健康研究只顯示關聯，中文請寫「與…有關」，不可寫「導致」「造成」「引起」；英文寫 associated with。',
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
      '不可說台灣研究證明「機車廢氣」造成某種疾病，或說某人的氣喘、癌症、心臟病是機車造成的。',
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
      '不可說在怠速機車旁待幾分鐘、或等一個紅燈，會讓人（包括兒童與長者）罹患氣喘、心臟病、癌症或任何慢性病；短暫接觸的健康後果尚未確立，也不可把兒童氣喘的勝算比說成一個紅燈的效果。',
      'Do not claim that a few minutes beside idling scooters, or one red light, causes asthma, heart disease, cancer or any chronic disease in anyone, children and older people included; the consequences of brief encounters are not established, and child-asthma odds ratios are not the effect of one red light.',
    ),
    instead: t(
      '靠近車流處的高峰暴露量測得較高，但個別短暫接觸的健康後果尚未確立。',
      'Peak exposures near traffic are measured to be higher, but the health consequences of individual brief encounters are not established.',
    ),
    why: t('現有證據涵蓋的是數小時至數週（美國心臟學會）或一小時通勤（Chuang 等）。', 'The evidence covers hours to weeks (AHA) or a one-hour commute (Chuang et al.).'),
    patterns: { 'zh-TW': ['幾分鐘.{0,15}(致病|傷害|生病)', '(怠速|紅燈).{0,15}(致病|致癌)'], en: ['(few|several) minutes.{0,40}(ill|harm|disease)', 'idling.{0,30}(cancer|illness)'] },
    facts: ['aha-2010-pm25-cardiovascular', 'chuang2020-cardiovascular-association', 'mccreanor2007-london-walk'],
    sources: ['brook-2010-circulation', 'chuang-2020-aeax'],
    research: '03 §7, (c); redlight/acute-health (doNotClaim 1); redlight/intersection-peaks (doNotClaim 8); redlight/policy-idling (doNotClaim 8); digest must-not 1',
  },
  'never-smoker-lung-cancer-cause': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可說空氣污染是台灣不吸菸者肺癌的「原因」，或占某個百分比。',
      'Do not say air pollution is "the cause" of lung cancer in Taiwanese never-smokers, or give it any percentage share.',
    ),
    instead: t(
      '台灣過半肺癌患者從未吸菸，研究者正在探討空氣污染是否扮演角色；現有證據屬生態學關聯與動物機制，尚非定論。',
      'More than half of Taiwan\'s lung cancer patients never smoked, and researchers are investigating whether air pollution plays a part; the evidence is ecological association plus animal mechanism, not settled.',
    ),
    why: t('Tseng 2019與Hill 2023都是生態學或機制研究。', 'Tseng 2019 and Hill 2023 are ecological or mechanistic.'),
    patterns: { 'zh-TW': ['不吸菸.{0,15}肺癌.{0,15}(原因|因為|導致)'], en: ['never[- ]smokers?.{0,40}(caused by|because of)'] },
    facts: ['tseng2019-never-smokers', 'hill2023-egfr-ecological', 'huang2021-never-smoker-lung-cancer'],
    sources: ['tseng-2019-jto', 'hill-2023-nature'],
    research: '03 §3c, (c)',
    blueprintRule: 'R14',
  },
  'lung-cancer-leading-cancer-not-leading-death': {
    kind: 'correction',
    topic: 'health',
    rule: t(
      '肺癌是台灣「癌症」死因的首位，不是所有死因的首位（癌症整體才是死因首位）。',
      'Lung cancer is Taiwan\'s leading cause of cancer death, not the leading cause of death overall (cancer as a whole is).',
    ),
    why: t('依衛福部114年死因統計。', 'Per MOHW 2025 cause-of-death statistics.'),
    patterns: { 'zh-TW': ['肺癌.{0,6}(十大)?死因(第一|首位)'], en: ['lung cancer.{0,20}leading cause of death'] },
    facts: ['mohw-lung-cancer-2025'],
    sources: ['mohw-cause-of-death-2025'],
    research: '03 §3d, (a)#5',
  },
  'chuang-effect-sizes': {
    kind: 'qualifier',
    topic: 'health',
    rule: t(
      'Chuang 等（2020）的百分比是「每高一個四分位距」的變化：步行每24.4 µg/m³、騎機車每41.7 µg/m³；不可寫成「每1 µg/m³」或「每10 µg/m³」，不可跨方式比較，也不可把8-OHdG說成「DNA損傷導致疾病的證據」。引用時要說明是健康年輕成人、一小時、未調整體力活動，且所有方式合併時只有8-OHdG顯著。',
      'Chuang et al. 2020\'s percentages are per interquartile range: per 24.4 µg/m³ walking and 41.7 µg/m³ on a scooter; never write "per 1" or "per 10 µg/m³", never compare modes, and never present 8-OHdG as "proof of DNA damage causing disease". Say it was healthy young adults, one hour, exertion not adjusted, and that with all modes pooled only 8-OHdG was significant.',
    ),
    why: t('全文表2列出各方式的增量與信賴區間。', 'Table 2 of the full text gives each mode\'s increment and confidence interval.'),
    patterns: { 'zh-TW': ['7\\.9\\s*%', '6\\.5\\s*%', '6\\.4\\s*%', '8\\.9\\s*%', '8\\.1\\s*%'], en: ['7\\.9\\s*%', '6\\.5\\s*%', '6\\.4\\s*%', '8\\.9\\s*%', '8\\.1\\s*%'] },
    facts: ['chuang2020-cardiovascular-association', 'chuang2020-scooter-effect-per-iqr', 'chuang2020-pooled-model'],
    sources: ['chuang-2020-aeax'],
    research: 'papers/chuang-2020-aex (correctionsToAbstractLevelNotes); redlight/policy-idling (doNotClaim 5)',
  },
  'tsai2025-or-increment': {
    kind: 'qualifier',
    topic: 'health',
    rule: t(
      'Tsai 等（2025）的氣喘勝算比1.595沒有說明對應多少PM2.5增量，不可寫成「每1 µg/m³」；研究背景是工業區而非機車。',
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
      '不可說Hwang 等（2005）證明氮氧化物導致台灣兒童氣喘：氮氧化物的估計值不顯著，PM10甚至呈反向關聯。',
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
      '不可引用2014年以後的台灣PM2.5歸因死亡數，或任何「死於機車廢氣」的人數：都沒有可查證的來源。',
      'Do not cite Taiwanese PM2.5-attributable deaths for any year after 2014, or any number of deaths "from scooters": no verifiable source exists.',
    ),
    why: t('最新可查證的是Lo 等（2017）以2014年資料所做的模式推估。', 'The latest verifiable figure is Lo et al. 2017\'s modelled estimate for 2014.'),
    patterns: { 'zh-TW': ['(死於|因).{0,6}機車.{0,10}(死亡|喪命)'], en: ['deaths? (from|caused by) scooters?'] },
    facts: ['lo2017-pm25-deaths-2014'],
    sources: ['lo-2017-jfma'],
    research: '03 §3d, (c)',
  },
  'no-dementia-numbers': {
    kind: 'do-not-claim',
    topic: 'health',
    rule: t(
      '不可引用Jung 等（2015）的失智症數字；最多只能說「一項台灣世代研究曾報告關聯」。',
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
      '不可說多數台灣民眾因健康疑慮支持加嚴管制老舊車輛：找不到具代表性的民調。',
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

  // -------------------------------------------------------------------------
  // Blueprint copy rules (docs/editorial-blueprint.md Part 2, R1-R16) not covered above
  // -------------------------------------------------------------------------
  'r1-idling-legality': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t(
      '不可寫紅燈怠速「合法」「不違規」「違規」或「違法」。',
      'Never write that idling at a red light is legal, illegal, allowed or against the rules.',
    ),
    instead: t(
      '現行的怠速規定管的是停車等候超過三分鐘的車；一個普通的紅燈，不在它要管的範圍裡。',
      'The current idling rule covers vehicles stopped and waiting for more than three minutes; an ordinary red light is not what it is written for.',
    ),
    why: t(
      '規定排除交通管制造成的怠速、高溫與下雨天，而是否適用於機車、號誌停等是否屬於「停車怠速等候」，都沒有官方解釋。',
      'The rule exempts traffic-control idling, hot days and rain, and no official interpretation says whether it reaches scooters or whether a signal wait counts.',
    ),
    patterns: { 'zh-TW': ['(紅燈|怠速).{0,12}(合法|不違規|違規|違法)'], en: ['idl(e|ing).{0,40}\\b(legal|illegal|against the (law|rules)|breaks? the law)'] },
    facts: ['idling-regulation', 'apca-idling-fine'],
    sources: ['moj-idling-regulation'],
    research: 'redlight/policy-idling (doNotClaim 1); digest must-not 6',
    blueprintRule: 'R1',
  },
  'r2-pm25-health-all-sources': {
    kind: 'qualifier',
    topic: 'health',
    rule: t(
      '每一個PM2.5的健康結果，都要在同一句或下一句說明是「所有來源」或「整體交通」的污染。',
      'Every PM2.5 health result says "all sources" or "traffic as a whole" in the same sentence or the next.',
    ),
    why: t('沒有任何健康研究把機車廢氣單獨分出來。', 'No health study isolates scooter exhaust.'),
    patterns: { 'zh-TW': ['PM2\\.5.{0,30}(死亡|肺癌|氣喘|肺功能|血壓|失智|中風)'], en: ['PM2\\.5.{0,60}(death|mortality|lung cancer|asthma|lung function|blood pressure|dementia|stroke)'] },
    facts: ['mj-cohort-mortality-guo2021', 'guo2019-lung-function', 'chuang2020-cardiovascular-association'],
    research: 'docs/editorial-blueprint.md Part 2 R2; redlight/long-term-traffic (summary)',
    blueprintRule: 'R2',
  },
  'r3-no-harm-ranking': {
    kind: 'do-not-claim',
    topic: 'smell',
    rule: t(
      '不可依危害大小排序一氧化碳、苯與超細微粒，只能說它們聞不到；一氧化碳在路口是廢氣的指標，沒有證據顯示路口濃度會危害健康。',
      'Never rank carbon monoxide, benzene and ultrafine particles by harm; say only that they cannot be smelled. At the kerb carbon monoxide is a marker of exhaust, not a demonstrated hazard.',
    ),
    why: t('沒有路口的一氧化碳或碳氧血紅素量測，也沒有比較三者危害的研究。', 'There are no kerbside carbon monoxide or carboxyhaemoglobin measurements and no study comparing the three for harm.'),
    patterns: { 'zh-TW': ['(一氧化碳|苯|超細微粒).{0,10}(最毒|更毒|最危險|更危險|最致命)'], en: ['(carbon monoxide|benzene|ultrafine).{0,20}(most|more) (toxic|dangerous|harmful|deadly)'] },
    facts: ['co-odourless', 'who-benzene-no-safe-level'],
    research: 'docs/editorial-blueprint.md Part 2 R3; redlight/acute-health (doNotClaim 9)',
    blueprintRule: 'R3',
  },
  'r4-odour-thresholds-orders-of-magnitude': {
    kind: 'qualifier',
    topic: 'smell',
    rule: t(
      '嗅覺閾值只能寫成數量級（十億分之幾、百萬分之幾），不可寫成單一數值。',
      'Odour thresholds are orders of magnitude (parts per billion, parts per million), never single values.',
    ),
    why: t('不同來源的閾值相差一到兩個數量級（苯約1.5至97 ppm）。', 'Sources differ by one to two orders of magnitude (benzene about 1.5–97 ppm).'),
    patterns: { 'zh-TW': ['(嗅覺|氣味)閾值.{0,15}\\d'], en: ['odou?r threshold.{0,20}\\d'] },
    facts: ['odour-thresholds'],
    sources: ['nagata-odour-thresholds', 'us-epa-air-toxics-hazard-summaries'],
    research: 'redlight/smell-chemistry (doNotClaim 6)',
    blueprintRule: 'R4',
  },
  'r6-schoolchildren-survey-dated': {
    kind: 'qualifier',
    topic: 'vulnerable',
    rule: t(
      '1995至96年的國中生調查一律註明年份，並說明是測站資料。',
      'The 1995–96 schoolchildren survey is always dated and described as station data.',
    ),
    why: t('暴露是學校2公里內測站的資料，車隊與燃料都與現在不同。', 'Exposure came from stations within 2 km of schools, and the fleet and fuel differ from today\'s.'),
    patterns: { 'zh-TW': ['33萬', '331,?686'], en: ['331,?686'] },
    facts: ['guo1999-asthma-survey'],
    research: 'redlight/vulnerable-groups#guo1999-asthma-traffic',
    blueprintRule: 'R6',
  },
  'r7-emission-shares-labelled': {
    kind: 'qualifier',
    topic: 'emissions',
    rule: t(
      '排放占比一律標示為「排放量」，圖表一律以0至100%為刻度。',
      'Emission shares are labelled as emissions (排放量) and drawn on a 0–100% scale.',
    ),
    why: t('排放占比不等於空氣中濃度的貢獻，截斷的刻度會誇大差距。', 'An emissions share is not a share of what people breathe, and a truncated scale exaggerates differences.'),
    patterns: { 'zh-TW': ['1\\.3\\d?\\s*%', '15\\.(6|59)\\s*%', '(10\\.0|9\\.99)\\s*%'], en: ['1\\.3\\d?\\s*%', '15\\.(6|59)\\s*%', '(10\\.0|9\\.99)\\s*%'] },
    facts: ['teds13-mc-pm25-share', 'teds13-mc-co-share', 'teds13-mc-nmhc-share'],
    research: 'docs/editorial-blueprint.md Part 2 R7; 01 §4',
    blueprintRule: 'R7',
  },
  'r8-zero-only-own-exhaust': {
    kind: 'do-not-claim',
    topic: 'levers',
    rule: t(
      '「零」只能用在機車自己的排氣；路口永遠不是零污染，汽車、公車與背景污染都還在。',
      '"Zero" is used only for a scooter\'s own exhaust; the crossing is never zero, since cars, buses and background pollution remain.',
    ),
    why: t('電動機車仍有輪胎、煞車與揚塵微粒，路口還有其他車輛。', 'Electric scooters still produce tyre, brake and road-dust particles, and other vehicles remain.'),
    patterns: { 'zh-TW': ['零污染', '(路口|街道|空氣).{0,6}(零|沒有)污染'], en: ['zero[- ]pollution', 'zero[- ]emissions? (crossing|street|junction|air)'] },
    facts: ['teds13-electric-mc-pm25'],
    research: 'docs/editorial-blueprint.md Part 2 R8',
    blueprintRule: 'R8',
  },
  'r9-no-prices-in-chain': {
    kind: 'qualifier',
    topic: 'economics',
    rule: t(
      '第1至6環、綠燈段落與「接起來」段落不出現購買按鈕或價格。',
      'No purchase button or price appears in Links 1 to 6, the green beat or the joining-up section.',
    ),
    why: t('證據鏈與購買決定要分開，避免讀者覺得證據是為了推銷。', 'Keeps the evidence apart from the purchase decision, so it does not read as a sales pitch.'),
    patterns: { 'zh-TW': ['NT\\$\\s*\\d', '\\d[\\d,]*\\s*元'], en: ['NT\\$\\s*\\d'] },
    research: 'docs/editorial-blueprint.md Part 2 R9',
    blueprintRule: 'R9',
  },
  'r10-day-count-needs-city-status': {
    kind: 'qualifier',
    topic: 'economics',
    rule: t(
      '倒數天數只能在讀者所在縣市的狀態確定、而且結果是A類判定時才出現。',
      'A day count is shown only with the reader\'s city status, and only when the result is a verdict A.',
    ),
    why: t('各縣市的名額與期限不同，有的已經用完。', 'Quotas and deadlines differ by city, and some are already exhausted.'),
    patterns: { 'zh-TW': ['(還剩|剩下|倒數)\\s*\\d+\\s*天'], en: ['\\d+ days? (left|to go|remaining)'] },
    research: 'docs/editorial-blueprint.md Part 2 R10',
    blueprintRule: 'R10',
  },
  'r11-no-concentration-surge-in-scene': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t(
      '場景不可呈現濃度隨時間變化，也不可呈現機車專屬的起步暴增。',
      'The scene never shows a concentration changing over time, and never a scooter-specific pull-away surge.',
    ),
    why: t('沒有台灣路口的時間序列量測，也沒有任何研究量化機車的起步高峰。', 'There is no Taiwanese time-series measurement at a crossing, and no study quantifies a scooter pull-away spike.'),
    patterns: { 'zh-TW': ['起步.{0,10}(暴增|飆升|衝高)'], en: ['pull[- ]away (surge|spike|burst)'] },
    facts: ['signal-cycle-peaks-international'],
    research: 'redlight/idle-emissions (doNotClaim 3); docs/editorial-blueprint.md Part 2 R11',
    blueprintRule: 'R11',
  },
  'r12-scrap-age-wording': {
    kind: 'qualifier',
    topic: 'economics',
    rule: t(
      '講汰舊換新時不可只寫「舊車」，要寫「出廠滿10年的機車」，並由試算器套用各縣市自己的規定。',
      'Never write "old scooter" alone for scrappage; write "a scooter built 10 or more years ago" and let the calculator apply each city\'s rule.',
    ),
    why: t('各補助方案對可汰換機車的出廠日期或車齡規定不同。', 'Each programme defines the qualifying build date or age differently.'),
    patterns: { 'zh-TW': ['(?<!老)舊車(?!齡)'], en: ['\\bold scooters?\\b'] },
    research: 'docs/editorial-blueprint.md Part 2 R12; econ/central.json',
    blueprintRule: 'R12',
  },
  'r13-three-scooter-case-labelled': {
    kind: 'qualifier',
    topic: 'inspection',
    rule: t(
      '三台車的個案（14倍、32倍）只能出現在證據頁，標示為「三台車的個案」，放在獨立的區塊。',
      'The three-scooter case study (14 times, 32 times) appears only on the evidence page, labelled as a three-scooter case study, in a separate panel.',
    ),
    why: t('只有三台車，不是車隊平均。', 'Three vehicles, not a fleet average.'),
    patterns: { 'zh-TW': ['14(\\.0)?\\s*倍', '32(\\.1)?\\s*倍'], en: ['\\b14(\\.0)?\\s*(times|×)', '\\b32(\\.1)?\\s*(times|×)'] },
    facts: ['tsai2026-three-scooter-case'],
    sources: ['tsai-2026-rineng'],
    research: 'redlight/idle-emissions#tsai-2026-phase4-vs-7',
    blueprintRule: 'R13',
  },

  // -------------------------------------------------------------------------
  // Red-light sweep: doNotClaim lists (research/redlight/*.json) and digest must-nots
  // -------------------------------------------------------------------------
  'no-scooters-main-source': {
    kind: 'do-not-claim',
    topic: 'emissions',
    rule: t(
      '不可說機車是PM2.5或氮氧化物的主要來源、每公里排放比汽車多PM2.5或氮氧化物，也不可說機車是交通苯排放的主要來源。',
      'Do not say scooters are a major source of PM2.5 or NOx, emit more PM2.5 or NOx per km than cars, or are the main source of traffic benzene.',
    ),
    instead: t(
      '機車的排放問題在一氧化碳、碳氫化合物與苯；2021年汽油車排放的苯約為機車的兩倍，機車的苯排放自2013年下降約73%。',
      'Scooters\' emissions problem is carbon monoxide, hydrocarbons and benzene; in 2021 gasoline cars emitted about twice as much benzene as scooters, and scooter benzene had fallen about 73% since 2013.',
    ),
    why: t('TEDS 13.0與Tsai 等（2023）把機車的PM2.5與氮氧化物排在最低；苯的年總量從2016年起汽油車較多。', 'TEDS 13.0 and Tsai et al. 2023 put scooters lowest for PM2.5 and NOx; from 2016 gasoline vehicles emitted more benzene in total.'),
    patterns: {
      'zh-TW': ['機車.{0,10}(主要|最大)的?(苯|PM2\\.5|細懸浮微粒|氮氧化物|微粒)?(排放)?來源', '機車.{0,10}(苯|PM2\\.5).{0,10}(比汽車多|多於汽車)'],
      en: ['scooters?.{0,20}(main|largest|biggest|major) source of (traffic )?(benzene|PM2\\.5|fine particles|NOx)', 'scooters? emit more (PM2\\.5|NOx) than cars'],
    },
    facts: ['tsai2023-benzene-tonnes-2021', 'ef-vehicle-class-ranking-tsai2023', 'teds13-mc-pm25-share', 'tunnel-particles-heavy-vehicles-ting2023'],
    sources: ['tsai-2023-atmosphere', 'ting-2023-envres'],
    research: 'redlight/idle-emissions (doNotClaim 2); redlight/policy-idling (doNotClaim 3); papers/tsai-2023-atmosphere (complications); digest must-not 3',
  },
  'no-idle-emits-more': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t(
      '不可說機車怠速時排放的微粒比行駛時多、怠速是排放最高的時候，或路口濃度在紅燈怠速時最高。',
      'Do not say idling scooters emit more particles than moving ones, that idling is when emissions peak, or that crossing concentrations are highest while scooters idle at red.',
    ),
    instead: t('國外研究的路口高峰出現在車輛起步時；台灣唯一的怠速微粒數據略低於行駛時。', 'Studies abroad find junction peaks as vehicles pull away; the only Taiwanese idle particle datum is slightly below driving.'),
    why: t('Chien 與 Huang（2010）的怠速微粒數量略低於時速15與30公里；香港、上海與英國的高峰都在起步。', 'Chien & Huang 2010 found idle particle number slightly below 15 and 30 km/h; Hong Kong, Shanghai and UK peaks came at pull-away.'),
    patterns: { 'zh-TW': ['怠速.{0,12}(微粒|排放|濃度).{0,6}(最多|最高|更多|更高)'], en: ['idl(e|ing).{0,30}(more|most|highest) (particles|emissions|pollution)', 'peaks? (while|when) (scooters? )?idl'] },
    facts: ['idle-pn-chien-huang-2010', 'signal-cycle-peaks-international'],
    research: 'redlight/idle-emissions (doNotClaim 1); redlight/intersection-peaks (doNotClaim 5); redlight/smell-chemistry (doNotClaim 7); digest must-not 6',
  },
  'no-pull-away-spike-factor': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t('不可給出機車起步排放高峰的倍數。', 'Do not give a scooter pull-away spike factor.'),
    why: t('沒有找到量化機車起步高峰的研究；泰國的路上研究顯示重要的是怠速時間，不是急加速。', 'No study quantifying it was found; on-road evidence from Thailand points to idle time, not hard acceleration.'),
    patterns: { 'zh-TW': ['起步.{0,12}\\d+\\s*倍'], en: ['pull[- ]away.{0,30}\\d+\\s*(times|×)'] },
    facts: ['idle-time-vs-acceleration-seedam2017'],
    research: 'redlight/idle-emissions (doNotClaim 3)',
  },
  'no-high-emitter-share': {
    kind: 'do-not-claim',
    topic: 'inspection',
    rule: t('不可說最髒的10%至20%機車占多少排放。', 'Do not state the share of emissions from the dirtiest 10–20% of scooters.'),
    why: t('沒有台灣機車的遙測資料；Ko 與 Cho（2006）談的是一般車輛，Lin 等（2006）發現老車數量少。', 'No Taiwanese scooter remote-sensing data exist; Ko & Cho 2006 covers vehicles in general, and Lin et al. 2006 found old scooters few.'),
    patterns: { 'zh-TW': ['(最髒|高污染).{0,10}(1|2)0\\s*%'], en: ['dirtiest (10|20)\\s*%'] },
    facts: ['two-stroke-idle-hc-lin2006'],
    research: 'redlight/idle-emissions (doNotClaim 4)',
  },
  'idle-stop-not-proven': {
    kind: 'do-not-claim',
    topic: 'levers',
    rule: t('不可說路上的機車普遍有怠速熄火，或怠速熄火能減少污染。', 'Do not say idle-stop is widespread on the road or that it cuts pollutants.'),
    why: t('規定計算的是引擎族數；實測效果分歧（波蘭一氧化碳+57%、碳氫+4%、油耗−12%；工研院研究中重新啟動的排放可能抵銷節省）。', 'The mandate counts engine families; measured effects are mixed (Poland CO +57%, HC +4%, fuel −12%; in an ITRI study restart emissions could outweigh savings).'),
    patterns: { 'zh-TW': ['怠速熄火.{0,12}(減少|降低)(污染|排放)'], en: ['idle[- ]stop.{0,30}(cuts?|reduces?) (pollution|emissions)'] },
    facts: ['idle-stop-mandate', 'idle-stop-mixed-evidence'],
    research: 'redlight/idle-emissions (doNotClaim 5)',
  },
  'inspection-not-96-percent-clean': {
    kind: 'do-not-claim',
    topic: 'inspection',
    rule: t('不可說「96%的機車很乾淨」。', 'Do not say "96% of scooters are clean".'),
    why: t('3.78%至3.93%是到檢機車在寬鬆怠速測試的不合格率；沒到檢的機車沒有受測。', '3.78–3.93% is the failure rate among inspected scooters at a lenient idle test; non-attenders are untested.'),
    patterns: { 'zh-TW': ['96\\s*%'], en: ['96\\s*(%|per\\s*cent)'] },
    facts: ['inspection-2025', 'inspection-2025-per-100'],
    research: 'redlight/idle-emissions (doNotClaim 6)',
  },
  'gkm-limits-not-comparable': {
    kind: 'do-not-claim',
    topic: 'inspection',
    rule: t('不可把不同測試程序的每公里上限直接比較，例如2004年的7.0與2021年的1.0克，或1998年的3.5與2004年的7.0克。', 'Do not compare g/km limits across test procedures, such as 7.0 (2004) with 1.0 (2021) or 3.5 (1998) with 7.0 (2004).'),
    why: t('測試循環從ECE型態改為WMTC（車輛研究測試中心）。', 'The test cycle changed from ECE-type to WMTC (per ARTC).'),
    patterns: { 'zh-TW': ['7\\.0.{0,15}1\\.0'], en: ['7\\.0.{0,20}1\\.0\\s*g'] },
    facts: ['type-approval-limits-not-comparable'],
    research: 'redlight/idle-emissions (doNotClaim 7)',
  },
  'hc-nox-limit-correction': {
    kind: 'correction',
    topic: 'inspection',
    rule: t('1988至2003年的碳氫加氮氧化物上限不是每公里3.75至4.5克，而是4.4／5.5（1988年）、2.4／3.0（1991年）、1.75／2.0（1998–2003年）。', 'HC+NOx limits for 1988–2003 were not 3.75–4.5 g/km but 4.4/5.5 (1988), 2.4/3.0 (1991) and 1.75/2.0 (1998–2003).'),
    why: t('3.75與4.5是新車的怠速一氧化碳百分比，被誤讀為每公里排放。', 'The 3.75 and 4.5 are new-vehicle idle CO percentages, misread as g/km values.'),
    patterns: { 'zh-TW': ['3\\.75'], en: ['3\\.75'] },
    research: 'redlight/idle-emissions (doNotClaim 8)',
  },
  'inspection-age-not-monotonic': {
    kind: 'do-not-claim',
    topic: 'inspection',
    rule: t('不可說不合格率隨車齡逐年上升，或16年的機車有5%不合格。', 'Do not say the failure rate rises steadily with age, or that 16-year-old scooters fail at 5%.'),
    why: t('16年為3.57%，上升從17年開始。', 'Age 16 is 3.57%; the rise starts at 17.'),
    facts: ['inspection-failure-by-age-2025'],
    research: 'redlight/idle-emissions (doNotClaim 9)',
  },
  'hanoi-idle-rates-not-taiwan': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t('不可把河內的怠速排放率（每小時60.9克一氧化碳）當成台灣機車的數字。', 'Do not attribute Hanoi idle rates (60.9 g/h CO) to Taiwanese scooters.'),
    why: t('台灣沒有機車怠速排放率的量測。', 'No Taiwanese idle emission rate has been measured.'),
    patterns: { 'zh-TW': ['60\\.9'], en: ['60\\.9'] },
    facts: ['idle-rate-hanoi-nguyen2021'],
    research: 'redlight/idle-emissions (doNotClaim 10)',
  },
  'jou-2011-figures-inconsistent': {
    kind: 'do-not-claim',
    topic: 'levers',
    rule: t('不可引用Jou 等（2011）的每小時1,021公升汽油與0.56公噸二氧化碳。', 'Do not reuse Jou et al. 2011\'s 1,021 L and 0.56 t CO2 figures.'),
    why: t('這些是依意願調查推算的預測，兩個數字互相矛盾。', 'They are projections from stated preferences and inconsistent with each other.'),
    patterns: { 'zh-TW': ['1,?021\\s*公升'], en: ['1,?021\\s*(L|litres)'] },
    research: 'redlight/idle-emissions (doNotClaim 11)',
  },
  'unread-studies-no-numbers': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t(
      '下列研究的內容尚未讀到，不可引用任何結果：Dhital 等（2026，怠速熄火）、Jayaratne 等（2009）、Kuo 等（2000，台中通勤揮發性有機物）與2026年8月2日台北時報報導的民調（87.9%等）。',
      'Do not cite any result from studies whose content was not read: Dhital et al. 2026 (idle-stop), Jayaratne et al. 2009, Kuo et al. 2000 (Taichung commuter VOCs) and the poll in the Taipei Times of 2 August 2026 (87.9% and so on).',
    ),
    why: t('只確認了書目資料，摘要或全文無法開啟。', 'Only bibliographic data were confirmed; abstracts or full texts could not be opened.'),
    patterns: { 'zh-TW': ['87\\.9\\s*%', 'Dhital', 'Jayaratne'], en: ['87\\.9\\s*%', 'Dhital', 'Jayaratne', 'Brisbane'] },
    research: 'redlight/idle-emissions (doNotClaim 12); redlight/smell-chemistry (doNotClaim 9); redlight/policy-idling (doNotClaim 10, 13)',
  },
  'chen-lin-2013-itri': {
    kind: 'correction',
    topic: 'levers',
    rule: t('Chen 與 Lin（2013）怠速熄火研究的作者屬於工研院，不是車輛研究測試中心。', 'The authors of Chen & Lin 2013 (idle-stop) are ITRI staff, not ARTC.'),
    why: t('依Crossref的作者單位。', 'Per the Crossref affiliation.'),
    sources: ['chen-lin-2013-sae'],
    research: 'redlight/idle-emissions (doNotClaim 13)',
  },
  'smell-is-not-dose': {
    kind: 'do-not-claim',
    topic: 'smell',
    rule: t(
      '不可說聞到廢氣的臭味代表空氣有多危險或劑量有多高：一氧化碳無臭，超細微粒也不靠氣味判斷。',
      'Do not say the smell of exhaust measures how harmful the air is or what dose you get: carbon monoxide is odourless, and ultrafine particles are not judged by smell.',
    ),
    instead: t('氣味告訴你你站在廢氣煙流裡，但不能衡量裡面所有的東西。', 'The smell tells you that you are standing in the plume; it is not a measure of everything in it.'),
    why: t('嗅覺閾值相差數個數量級，與PM2.5或毒性劑量沒有對應關係。', 'Odour thresholds span orders of magnitude and do not map onto PM2.5 or toxic dose.'),
    patterns: { 'zh-TW': ['(聞到|氣味|臭味).{0,15}(代表|表示|等於|證明).{0,10}(危害|有毒|劑量|濃度|危險)'], en: ['(smell|odou?r).{0,30}(measures?|means|shows|proves).{0,20}(harm|dose|toxic|danger)'] },
    facts: ['co-odourless', 'odour-thresholds', 'formaldehyde-odour-not-harm'],
    research: 'redlight/smell-chemistry (doNotClaim 1); redlight/vulnerable-groups (doNotClaim 2); redlight/acute-health (doNotClaim 8); redlight/intersection-peaks (doNotClaim 9); digest must-not 4',
  },
  'benzene-not-the-smell': {
    kind: 'do-not-claim',
    topic: 'smell',
    rule: t(
      '不可說你聞到的是苯，也不可說聞到的是廢氣中最多的甲基戊烷。',
      'Do not say benzene is what you smell, nor the methylpentanes that dominate the exhaust.',
    ),
    why: t('苯要到百萬分之幾（依來源約1.5至97 ppm）才聞得到，甲基戊烷約7至9 ppm；沒有研究找出機車廢氣氣味的主要物質。', 'Benzene is smellable only at parts per million (about 1.5–97 ppm by source) and the methylpentanes at about 7–9 ppm; no study has identified the dominant odorants.'),
    patterns: { 'zh-TW': ['聞到.{0,6}苯', '苯的?(味道|臭味|氣味)'], en: ['smell(ing|s)? (the )?benzene', 'benzene (smell|odou?r)'] },
    facts: ['odour-thresholds'],
    research: 'redlight/smell-chemistry (doNotClaim 2, 3); digest must-not 4',
  },
  'no-above-guideline-at-red-light': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可說台灣紅燈前的行人吸入超過指引值的苯、甲醛或一氧化碳，或說路口的一氧化碳會讓碳氧血紅素達到令人擔心的程度。',
      'Do not say pedestrians at Taiwanese red lights breathe above-guideline benzene, formaldehyde or carbon monoxide, or that kerbside CO raises carboxyhaemoglobin to levels of concern.',
    ),
    why: t('沒有找到任何這類量測；外送員的呼氣一氧化碳研究是職業暴露，不能與WHO環境值比較。', 'No such measurement was found; the delivery-worker breath-CO study is occupational and not comparable with WHO ambient values.'),
    patterns: { 'zh-TW': ['(紅燈|路口).{0,20}(超過|超標).{0,10}(指引|標準)', '碳氧血紅素'], en: ['(red light|crossing).{0,40}(above|exceed).{0,20}guideline', 'carboxyh(a)?emoglobin'] },
    facts: ['li2025-delivery-workers-co'],
    research: 'redlight/smell-chemistry (doNotClaim 5); redlight/acute-health (doNotClaim 9)',
  },
  'two-stroke-not-todays-fleet': {
    kind: 'do-not-claim',
    topic: 'inspection',
    rule: t(
      '不可說二行程機車是今日車隊的主要部分，也不可把二行程的研究結果（Platt 2014、Lee 2005、Chan 1993）套用在今日的四行程車隊。',
      'Do not call two-stroke exhaust a major part of today\'s fleet, or apply two-stroke findings (Platt 2014, Lee 2005, Chan 1993) to today\'s four-stroke fleet.',
    ),
    why: t('2025年接到定檢通知的2004年以前二行程機車為24萬3,725輛，四行程為988萬輛。', 'In 2025, 243,725 two-strokes built in 2004 or earlier were notified for inspection, against 9.88 million four-strokes.'),
    patterns: { 'zh-TW': ['二行程.{0,10}(主要|多數|大部分)'], en: ['two[- ]strokes?.{0,30}(majority|most of|main part)'] },
    facts: ['inspection-2025', 'two-stroke-platt2014', 'two-stroke-remaining'],
    research: 'redlight/smell-chemistry (doNotClaim 8); redlight/policy-idling (doNotClaim 4); redlight/vulnerable-groups (doNotClaim 7)',
  },
  'odour-symptoms-not-established': {
    kind: 'do-not-claim',
    topic: 'smell',
    rule: t('不可把「廢氣氣味讓行人頭痛或噁心」當成已確立的事實。', 'Do not present exhaust odour causing headache or nausea in pedestrians as established.'),
    why: t('沒有找到相關研究；WHO也指出有氣味時，人們回報的不適可能偏高。', 'No study was found; WHO notes odour cues can inflate reported irritation.'),
    patterns: { 'zh-TW': ['(廢氣|氣味|臭味).{0,10}(頭痛|噁心|想吐)'], en: ['(exhaust|smell|odou?r).{0,30}(headache|nausea)'] },
    facts: ['formaldehyde-odour-not-harm', 'acute-effects-high-exposure-epa'],
    research: 'redlight/smell-chemistry (doNotClaim 10)',
  },
  'pahs-not-all-odourless': {
    kind: 'do-not-claim',
    topic: 'smell',
    rule: t('不可說多環芳香烴都沒有氣味：研究只量了附著在微粒上的部分。', 'Do not describe PAHs as odourless in general: only particle-bound PAHs were measured.'),
    why: t('氣態的萘有樟腦丸味（WHO）。', 'Gas-phase naphthalene has a mothball odour (WHO).'),
    research: 'redlight/smell-chemistry (doNotClaim 11)',
  },
  'who-values-from-registry': {
    kind: 'qualifier',
    topic: 'standards',
    rule: t(
      'WHO的指引數字（PM2.5、二氧化氮、一氧化碳、超細微粒良好作法、道路噪音）只能用登錄資料中的版本；一氧化碳24小時值是4 mg/m³，不是舊版的7 mg/m³。',
      'Use WHO guideline values (PM2.5, NO2, CO, ultrafine good practice, road noise) only as the registry gives them; the 24-hour CO value is 4 mg/m³, not the older 7 mg/m³.',
    ),
    why: t(
      '紅燈專題的查證者無法重新開啟WHO 2021年指引，但先前的研究已讀過原文並核對表0.1與0.2；7 mg/m³出自2010年的室內指引。',
      'The red-light verifiers could not re-open the WHO 2021 guidelines, but the earlier research read the PDF and checked Tables 0.1 and 0.2; the 7 mg/m³ comes from the 2010 indoor guidelines.',
    ),
    patterns: { 'zh-TW': ['7\\s*mg'], en: ['7\\s*mg'] },
    facts: ['who-no2-co-guideline', 'who-ufp-good-practice', 'who-pm25-guideline', 'who-road-noise-guideline'],
    sources: ['who-2021-aqg'],
    research: 'redlight/smell-chemistry (doNotClaim 12); redlight/acute-health (doNotClaim 7); redlight/long-term-traffic (doNotClaim 10); redlight/policy-idling (doNotClaim 9); 03 §2',
  },
  'no-tw-intersection-multiple': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t('不可說台灣的量測顯示路口空氣比路段中間或綠燈時差幾倍。', 'Do not say Taiwanese measurements show intersection air is X times worse than mid-block or the green phase.'),
    why: t('沒有找到這類台灣研究。', 'No such Taiwanese study was found.'),
    patterns: { 'zh-TW': ['路口.{0,15}\\d+(\\.\\d+)?\\s*倍'], en: ['(intersection|junction|crossing).{0,30}\\d+(\\.\\d+)?\\s*times (worse|higher)'] },
    research: 'redlight/intersection-peaks (doNotClaim 2)',
  },
  'international-junction-figures-not-scooters': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t(
      '不可把英國Goel 與 Kumar的29倍、2%時間占25%劑量或7倍，或香港5.4×10⁵的高峰，當成行人或機車的數字。',
      'Do not use Goel & Kumar\'s 29 times, 2%/25% or 7 times, or the Hong Kong 5.4 × 10⁵ peak, as pedestrian or scooter figures.',
    ),
    why: t('英國數字是2002年柴油測試車的車內高峰對平均，2%/25%只來自一趟；香港高峰是柴油公車。', 'The UK figures are peak-over-average inside a 2002 diesel test car, and 2%/25% comes from a single run; the Hong Kong peak was a diesel bus.'),
    patterns: { 'zh-TW': ['29\\s*倍', '25\\s*%.{0,10}劑量'], en: ['\\b29\\s*(times|×)', '2\\s*%.{0,30}25\\s*%'] },
    facts: ['signal-cycle-peaks-international'],
    research: 'redlight/intersection-peaks (doNotClaim 3, 4)',
  },
  'kumar-2017-pnc-not-ultrafine': {
    kind: 'correction',
    topic: 'children',
    rule: t('Kumar 等（2017）推車研究的微粒數量是0.2至1微米，不是超細微粒。', 'Kumar et al. 2017\'s pram particle number is 0.2–1 µm, not ultrafine.'),
    why: t('摘要寫「包括超細微粒」不精確。', 'The abstract\'s "including ultrafine particles" is loose.'),
    facts: ['traffic-near-school-kumar2017-pram'],
    research: 'redlight/intersection-peaks (doNotClaim 6)',
  },
  'wang-275-unattributed': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t('不可把Wang 等（2021）步行最高的275 µg/m³歸因於廟宇或交通。', 'Do not attribute Wang et al. 2021\'s 275 µg/m³ walking maximum to temples or traffic.'),
    why: t('論文沒有說明它的來源；有標明來源的最高值是焚香與烹飪。', 'The paper does not say where it came from; the highest named peaks were incense and cooking.'),
    patterns: { 'zh-TW': ['275'], en: ['275'] },
    facts: ['walking-peaks-incense-wang2021'],
    research: 'redlight/intersection-peaks (doNotClaim 10); papers/wang-2021-atmosphere#walking-peak-275-unattributed',
  },
  'chen-2024-solvents-not-traffic': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t('不可說Chen 等（2024）顯示擴散不良會讓路邊的交通廢氣升高。', 'Do not claim Chen et al. 2024 shows weak dilution raised traffic exhaust at roadsides.'),
    why: t('摘要指的是溶劑揮發等其他來源。', 'Its abstract points to solvent evaporation and other sources.'),
    research: 'redlight/intersection-peaks (doNotClaim 11)',
  },
  'no-typical-stop-box-distance': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t('不可說停等區到斑馬線的「一般距離」或行人紅燈的「一般時間」。', 'Do not state a typical stop-box-to-crosswalk distance or pedestrian red time.'),
    instead: t('規則只規定待轉區後緣距行人穿越道線至少50公分（可調整），停等區深2.5至6公尺。', 'The rules only set the turn box at least 50 cm from the crosswalk line (adjustable) and the stop box 2.5–6 m deep.'),
    why: t('查證過的來源都沒有記錄這兩個數字。', 'Neither is documented in verified sources.'),
    facts: ['marking-rules-turn-box'],
    research: 'redlight/intersection-peaks (doNotClaim 13)',
  },
  'london-walks-diesel': {
    kind: 'do-not-claim',
    topic: 'acute',
    rule: t('不可說倫敦的步行試驗（McCreanor 2007、Sinharay 2018）顯示的是機車廢氣的效果。', 'Do not say the London walking studies (McCreanor 2007; Sinharay 2018) show effects of scooter exhaust.'),
    why: t('那是以柴油車為主的街道，連續走兩小時。', 'They are diesel-dominated streets and two-hour walks.'),
    facts: ['mccreanor2007-london-walk', 'sinharay2018-london-walk'],
    research: 'redlight/acute-health (doNotClaim 2)',
  },
  'peters-2004-not-kerbside': {
    kind: 'do-not-claim',
    topic: 'acute',
    rule: t('不可說Peters 等（2004）的「在交通中」等同站在怠速機車旁。', 'Do not say Peters et al. 2004\'s traffic exposure is equivalent to standing near idling scooters.'),
    why: t('暴露是在車上的時間（多為汽車），包含壓力、噪音與體力。', 'Exposure was time in vehicles, mostly cars, with stress, noise and exertion.'),
    facts: ['peters2004-traffic-mi'],
    research: 'redlight/acute-health (doNotClaim 3)',
  },
  'no-per-vehicle-toxicity-ranking': {
    kind: 'do-not-claim',
    topic: 'acute',
    rule: t('不可說每輛機車比汽車或柴油公車更有害。', 'Do not say scooters are more harmful per vehicle than cars or diesel buses.'),
    why: t('查證過的研究都沒有比較每輛車排放的毒性；隧道研究中每輛公車貨車的PM2.5影響遠大於機車。', 'None of the verified studies compares toxicity per vehicle; in the tunnel and Wu studies a bus or truck added far more PM2.5 per vehicle.'),
    patterns: { 'zh-TW': ['每(一)?(輛|台)機車.{0,10}(更|比).{0,6}(有害|毒)'], en: ['per (vehicle|scooter).{0,30}more (harmful|toxic)'] },
    facts: ['traffic-count-pm25-contribution-wu2021', 'tunnel-particles-heavy-vehicles-ting2023'],
    research: 'redlight/acute-health (doNotClaim 4)',
  },
  'city-time-series-not-roadside': {
    kind: 'do-not-claim',
    topic: 'acute',
    rule: t('不可說台灣的急診或住院時間序列研究量測了路口暴露，或把事件歸因於機車。', 'Do not say Taiwanese ED or hospital time-series studies measure roadside red-light exposure or attribute events to scooters.'),
    why: t('它們用的是全市測站的每日濃度。', 'They use city-wide daily monitor concentrations.'),
    facts: ['tsai2013-copd-taipei', 'cheng2019-child-pneumonia-kaohsiung'],
    research: 'redlight/acute-health (doNotClaim 6)',
  },
  'small-panel-effects-not-population': {
    kind: 'do-not-claim',
    topic: 'acute',
    rule: t('不可把小型研究（7人、26人、55人、120人）的百分比變化當成一般人口的風險。', 'Do not present effect sizes from single small panels (7, 26, 55 or 120 people) as general-population risks.'),
    why: t('這些都是少數人的替代指標。', 'They are surrogate markers in a few people.'),
    facts: ['chuang2005-hrv-taipei', 'lung2025-peaks-hrv', 'chuang2020-cardiovascular-association'],
    research: 'redlight/acute-health (doNotClaim 10)',
  },
  'pan-2021-trucks-only': {
    kind: 'do-not-claim',
    topic: 'longterm',
    rule: t('不可說Pan 等（2021）顯示小客車或機車流量會提高心血管死亡。', 'Do not say Pan et al. 2021 shows small-car or scooter traffic raises cardiovascular mortality.'),
    why: t('只有貨車的風險比顯著；小型車不顯著，機車沒有分析。', 'Only the truck hazard ratio was significant; small cars were not, and scooters were not analysed.'),
    facts: ['pan2021-truck-traffic-cvd'],
    research: 'redlight/acute-health (doNotClaim 11)',
  },
  'lung-2025-sources': {
    kind: 'do-not-claim',
    topic: 'acute',
    rule: t('不可說Lung 等（2025）找出交通是高雄PM高峰的來源，也不可說它證明交通不是來源。', 'Do not say Lung et al. 2025 identifies traffic as the source of Kaohsiung PM peaks, nor that it shows traffic was not a source.'),
    why: t('摘要列出的是社區工廠、蚊香、燒稻草與焚香，沒有說交通被測試並排除。', 'The abstract names factories, mosquito coils, agricultural and incense burning, and does not say traffic was tested and excluded.'),
    facts: ['lung2025-peaks-hrv'],
    research: 'redlight/acute-health (doNotClaim 12); redlight/policy-idling (doNotClaim 12)',
  },
  'wrong-pubmed-links': {
    kind: 'correction',
    topic: 'acute',
    rule: t('McCreanor（2007）的PubMed編號是18057337，Tsai 等（2013）是24284359；早期草稿中的18032763與24217180指向無關的論文。', 'McCreanor 2007 is PMID 18057337 and Tsai et al. 2013 is PMID 24284359; the 18032763 and 24217180 in an early draft point to unrelated papers.'),
    why: t('查證者核對了PubMed。', 'Checked in PubMed by the verifier.'),
    patterns: { 'zh-TW': ['18032763', '24217180'], en: ['18032763', '24217180'] },
    sources: ['mccreanor-2007-nejm', 'tsai-2013-ijerph'],
    research: 'redlight/acute-health (doNotClaim 13)',
  },
  'no-tw-pedestrian-red-light-study': {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t(
      '不可說有任何台灣研究量過紅燈前、待轉區或停等區旁行人的暴露或健康影響。',
      'Do not say any Taiwanese study measured pedestrians\' exposure or health at a red light, beside a two-stage turn box or a stop box.',
    ),
    instead: t('不是量了沒事，是還沒有人去量。', 'Not measured and found fine. Not measured.'),
    why: t('所有紅燈專題的檔案都沒有找到這類研究。', 'None of the red-light files found such a study.'),
    patterns: { 'zh-TW': ['(研究|實測).{0,10}(量測|量到|測得|發現).{0,15}(紅燈|待轉區|停等區)'], en: ['(study|studies|measurements?).{0,30}(measured|found).{0,30}(red light|turn box|stop box)'] },
    research: 'redlight/vulnerable-groups (doNotClaim 1); redlight/policy-idling (doNotClaim 2); redlight/smell-chemistry (doNotClaim 5)',
  },
  'guo2019-is-regional-pm25': {
    kind: 'do-not-claim',
    topic: 'vulnerable',
    rule: t('不可說Guo 等（2019）的肺功能研究是交通或機車研究。', 'Do not say the 2019 lung-function paper (Guo et al.) is a traffic or scooter study.'),
    why: t('它用的是區域PM2.5。', 'It uses regional PM2.5.'),
    facts: ['guo2019-lung-function'],
    research: 'redlight/vulnerable-groups (doNotClaim 4)',
  },
  'asthma-trend-not-traffic': {
    kind: 'do-not-claim',
    topic: 'vulnerable',
    rule: t('不可說台灣兒童氣喘因交通而增加，也不可說所有污染物都會提高兒童氣喘。', 'Do not say child asthma in Taiwan is rising because of traffic, or that all pollutants raise child asthma.'),
    why: t('1995至2001年醫師診斷增加但症狀減少；Hwang（2005）中PM10呈反向關聯，二氧化硫不顯著。', 'From 1995 to 2001 diagnoses rose while symptoms fell; in Hwang 2005 PM10 was inversely associated and SO2 not associated.'),
    facts: ['hwang2005-asthma-co'],
    research: 'redlight/vulnerable-groups (doNotClaim 5, 11)',
  },
  'delivery-workers-not-poisoned': {
    kind: 'do-not-claim',
    topic: 'vulnerable',
    rule: t('不可說外送員「一氧化碳中毒」，也不可說研究中的外送員騎機車。', 'Do not say delivery workers are "poisoned by CO", or that the study\'s workers rode scooters.'),
    why: t('不吸菸者只差0.44 ppm，摘要沒有說明交通工具。', 'The non-smoker gap is 0.44 ppm and the abstract does not state the vehicle.'),
    patterns: { 'zh-TW': ['中毒'], en: ['poison'] },
    facts: ['li2025-delivery-workers-co'],
    research: 'redlight/vulnerable-groups (doNotClaim 8)',
  },
  'older-adult-ors-not-causal': {
    kind: 'do-not-claim',
    topic: 'vulnerable',
    rule: t('不可說PM2.5加二氧化硫的勝算比2.33或血管性失智的勝算比證明因果，或說二氧化硫與PM2.5的效果是交通造成的。', 'Do not say the combined PM2.5+SO2 odds ratio of 2.33 or the vascular-dementia odds ratios prove cause, or that SO2 and PM2.5 effects are traffic effects.'),
    why: t('都是觀察性研究，暴露來自測站。', 'All observational, with station-based exposure.'),
    patterns: { 'zh-TW': ['2\\.33'], en: ['2\\.33'] },
    facts: ['older-adults-associations'],
    research: 'redlight/vulnerable-groups (doNotClaim 9)',
  },
  'adhd-postnatal-increment': {
    kind: 'do-not-claim',
    topic: 'vulnerable',
    rule: t('不可把ADHD研究出生後的風險比1.40至1.87寫成「每10 µg/m³」。', 'Do not present the ADHD postnatal hazard ratios of 1.40–1.87 as per 10 µg/m³.'),
    why: t('摘要沒有說明增量。', 'The abstract gives no increment.'),
    patterns: { 'zh-TW': ['1\\.87'], en: ['1\\.87'] },
    research: 'redlight/vulnerable-groups (doNotClaim 10)',
  },
  'no-unverified-official-figures': {
    kind: 'do-not-claim',
    topic: 'vulnerable',
    rule: t('不可引用台灣65歲以上人口比例、兒童氣喘盛行率或交通部依年齡與收入的運具比例：都沒有查證過的數字。', 'Do not cite any official figure for Taiwan\'s 65+ share, child asthma prevalence or MOTC mode share by age or income: none was verified.'),
    why: t('搜尋額度用完，未能查證。', 'Not verified before the search budget ran out.'),
    research: 'redlight/vulnerable-groups (doNotClaim 12)',
  },
  'hei-ratings-limits': {
    kind: 'do-not-claim',
    topic: 'longterm',
    rule: t('不可說HEI對中風、慢性阻塞性肺病、早產或成人下呼吸道感染有高度信心，也不可說評估了失智症。', 'Do not claim HEI high confidence for stroke, COPD, preterm birth or adult lower respiratory infection, or that it rated dementia.'),
    why: t('中風低至中、慢性阻塞性肺病低、早產低、成人下呼吸道感染極低至低，失智症未評等。', 'Stroke is low to moderate, COPD low, preterm birth low, adult ALRI very low to low, and dementia not rated.'),
    facts: ['hei-sr23-trap-associations'],
    research: 'redlight/long-term-traffic (doNotClaim 5)',
  },
  'who-4-2-million-all-sources': {
    kind: 'qualifier',
    topic: 'longterm',
    rule: t('WHO的420萬人是所有來源的室外空氣污染，不可說成交通或機車造成，也不可與670萬（室內外合計）混用。', 'WHO\'s 4.2 million is outdoor air pollution from all sources; do not use it for traffic or scooters, or confuse it with 6.7 million (outdoor plus household).'),
    why: t('依WHO 2024年事實清單。', 'Per the WHO fact sheet of 2024.'),
    patterns: { 'zh-TW': ['420\\s*萬', '670\\s*萬'], en: ['4\\.2\\s*million', '6\\.7\\s*million'] },
    facts: ['who-ambient-deaths-2019'],
    research: 'redlight/long-term-traffic (doNotClaim 6)',
  },
  'hill-2023-relative-rates': {
    kind: 'do-not-claim',
    topic: 'longterm',
    rule: t('不可把Hill 等（2023）的「相對率」（台灣1.82、英格蘭0.63、南韓0.71）當成風險比，也不可說PM2.5造成EGFR突變。', 'Do not quote Hill et al. 2023\'s "relative rates" (1.82 Taiwan, 0.63 England, 0.71 Korea) as risk ratios, or say PM2.5 causes EGFR mutations.'),
    why: t('兩國小於1卻被稱為正相關，顯然不是一般的風險比；研究提出的是促進已有突變的細胞。', 'Two values below 1 are called positive associations, so they are not ordinary risk ratios; the study proposes promotion of cells that already carry mutations.'),
    patterns: { 'zh-TW': ['1\\.82'], en: ['1\\.82'] },
    facts: ['hill2023-egfr-ecological'],
    research: 'redlight/long-term-traffic (doNotClaim 7)',
  },
  'do-not-discourage-exercise': {
    kind: 'do-not-claim',
    topic: 'longterm',
    rule: t('不可根據MJ世代研究叫人不要走路或運動。', 'Do not tell people to avoid walking or exercise on the strength of the MJ cohort.'),
    why: t('在每一個PM2.5等級，規律運動都與較低的死亡風險有關。', 'Exercise was associated with lower risk in every PM2.5 stratum.'),
    patterns: { 'zh-TW': ['(不要|避免|別)(走路|運動|散步)'], en: ['(avoid|stop) (walking|exercis)'] },
    facts: ['mj-cohort-mortality-guo2021'],
    research: 'redlight/long-term-traffic (doNotClaim 8)',
  },
  'no-electrification-benefit-figure': {
    kind: 'do-not-claim',
    topic: 'levers',
    rule: t(
      '不可給出台灣機車電動化可以避免多少死亡或節省多少錢，也不可說低排放區或電動化已改善台灣行人的健康。',
      'Do not state any avoided-death or monetised figure for scooter electrification in Taiwan, or claim low-emission zones or electrification have improved pedestrian health in Taiwan.',
    ),
    why: t('沒有找到任何台灣或亞洲的估計或量測。', 'No Taiwanese or Asian estimate or measurement was found.'),
    patterns: { 'zh-TW': ['電動化.{0,20}(避免|減少|拯救).{0,10}(死亡|\\d+\\s*人)'], en: ['electrifi.{0,40}(avoid|save|prevent).{0,20}(deaths|lives)'] },
    research: 'redlight/long-term-traffic (doNotClaim 9); redlight/policy-idling (doNotClaim 7)',
  },
  'ckd-unit-unverified': {
    kind: 'do-not-claim',
    topic: 'longterm',
    rule: t('在核對全文前，不可寫出Chan 等（2018）慢性腎病研究的增量單位。', 'Do not state the per-increment unit of Chan et al. 2018 (kidney disease) until checked in the full paper.'),
    why: t('摘要中的單位符號無法顯示。', 'The unit symbols are not rendered in the abstract.'),
    research: 'redlight/long-term-traffic (doNotClaim 11)',
  },
  'no-measured-benefit-pedestrian-measures': {
    kind: 'do-not-claim',
    topic: 'levers',
    rule: t('不可說行人交通安全設施條例、行人專用時相或行人退縮已量到空氣品質改善。', 'Do not claim the Pedestrian Traffic Safety Facilities Act, scramble phases or setbacks have measured air-quality benefits.'),
    why: t('條例沒有提到空氣；運研所的效果是模式模擬，實測的退縮效果很小且不一致。', 'The Act never mentions air; the IOT effects are modelled, and the measured setback effects were small and inconsistent.'),
    facts: ['pedestrian-facilities-act-2024', 'iot-setback-measured', 'iot-scramble-typical-range'],
    research: 'redlight/policy-idling (doNotClaim 6)',
  },
  'no-scooter-noise-db': {
    kind: 'do-not-claim',
    topic: 'levers',
    rule: t('不可寫出台灣機車的噪音分貝上限：附表沒有讀過。', 'Do not print Taiwanese scooter dB limits: the annex tables were not read.'),
    why: t('只確認了噪音管制標準的本文與修正日期。', 'Only the body text and amendment date of the noise standard were confirmed.'),
    research: 'redlight/policy-idling (doNotClaim 9)',
  },
  'xiao-2024-ors': {
    kind: 'correction',
    topic: 'levers',
    rule: t('Xiao 等（2024）的勝算比是3.64與0.11，不是3.51與0.22；這是通學方式的結果，不是空氣品質結果。', 'Xiao et al. 2024\'s odds ratios are 3.64 and 0.11, not 3.51 and 0.22; it is a travel-mode result, not an air-quality outcome.'),
    why: t('依摘要。', 'Per the abstract.'),
    patterns: { 'zh-TW': ['3\\.51', '0\\.22'], en: ['3\\.51', '0\\.22'] },
    research: 'redlight/policy-idling (doNotClaim 11, 13)',
  },

  // -------------------------------------------------------------------------
  // economics
  // -------------------------------------------------------------------------
  'econ-headline-maximums-not-typical': {
    kind: 'qualifier',
    topic: 'economics',
    rule: t(
      '城市公布的「最高補助」（台北49,300元、新北39,600元、桃園44,000元等）只能連同條件一起出現：通常需要淘汰二行程機車、家中有幼兒或低收入，且名額有限。',
      'City "up to" totals (Taipei NT$49,300, New Taipei NT$39,600, Taoyuan NT$44,000 and so on) may appear only with their conditions: they usually need a two-stroke to scrap, a young child or low income, and places are limited.',
    ),
    instead: t('以試算器算出讀者自己的金額，或寫出一般情況（例如台北沒有孩子、汰換四行程約38,300元）。', 'Use the calculator for the reader\'s own amount, or give the ordinary case (for example about NT$38,300 in Taipei without a child, replacing a four-stroke).'),
    why: t('研究顯示這些合計是少數人才符合的最佳情況，新北的39,600元還需要兩輛舊車與已額滿的早鳥名額。', 'The research shows these totals are best cases few people meet; New Taipei\'s also needs two old scooters and an early-bird quota that is full.'),
    patterns: { 'zh-TW': ['4萬9,?300|49,?300', '3萬9,?600|39,?600', '4萬4|44,?000'], en: ['49,?300', '39,?600', '44,?000'] },
    facts: ['econ-taipei-max-subsidy'],
    sources: ['taipei-dep-2026-11-20-press', 'tvbs-health-2026-01-subsidy', 'taoyuan-epb-2026-programme'],
    research: 'econ/taipei#tpe-max-replace, econ/new-taipei#ntpc-best-case-total, econ/taoyuan#ty-max-total',
  },
  'econ-electric-not-always-cheaper-to-run': {
    kind: 'do-not-claim',
    topic: 'economics',
    rule: t('不可說電動機車「一定比較省」或「養車更便宜」：換電月租對騎得少的人比油錢貴。', 'Do not say electric scooters are always cheaper to run: for low-mileage riders a swap subscription costs more than fuel.'),
    instead: t('能在家充電的車款電費遠低於油錢；換電方案是否划算取決於里程與換電時段。', 'Home charging costs far less than fuel; whether a swap plan pays off depends on mileage and when you swap.'),
    why: t('每月300公里時新款125cc油錢約160至220元，換電月租488元起；交通部調查電動機車車主每年的油電支出也比燃油車主高。', 'At 300 km a month a modern 125cc uses about NT$160–220 of fuel while swap plans start at NT$488; in the MOTC survey electric owners also spend more a year on energy than gasoline owners.'),
    patterns: { 'zh-TW': ['(電動|電車).{0,10}(一定|絕對|都)(比較)?(省|便宜)'], en: ['electric.{0,30}(always|definitely) cheaper to run'] },
    facts: ['econ-swap-vs-petrol-low-mileage', 'econ-motc-annual-spend'],
    research: 'econ/running-costs#swap-vs-petrol-lowmileage',
  },
  'econ-domestic-cell-bonus-unproven': {
    kind: 'do-not-claim',
    topic: 'economics',
    rule: t('不可把經濟部國產電池芯加碼3,000元算進任何車款的補助：查不到任何車款被列為符合。', 'Do not count the MOEA NT$3,000 Taiwan-made cell bonus for any model: no model could be shown to qualify.'),
    why: t('經濟部表格列有這項加碼，但補助車款篩選結果為零，Gogoro自己的補助試算也沒有這一項。', 'The MOEA table lists the bonus, but the approved-model filter returns no qualifying model and Gogoro\'s own calculator omits it.'),
    patterns: { 'zh-TW': ['國產電池芯', '11,000元'], en: ['domestic(-| )cell', 'NT\\$11,000'] },
    facts: ['econ-central-subsidy-2026'],
    research: 'econ/gogoro-official-r2#moea-domestic-battery-bonus-gogoro',
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
