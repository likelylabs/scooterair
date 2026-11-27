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
  /**
   * True for rules that govern only how pages are built or worded (layout, which page shows
   * what, link hygiene). They stay in the registry for flagCopy() and reviewers; public lists of
   * "what we will not say" should leave them out.
   */
  internal?: boolean;
}

export const claimRules = {
  // -------------------------------------------------------------------------
  // exposure: the IOT study and commuter studies
  // -------------------------------------------------------------------------
  'iot-94-percent-needs-context': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t(
      '「94%」只能連同其背景一起出現：這是高雄高鐵路／重信路口單一模擬日的模式值，報告自行標示為離群值。同一路口其他三個模擬日，等候區PM2.5的每日變化是降低12%至18%（其中兩天未通過模式效能檢核），逐時變化是降低約3%至21%；台北與新北路口約降低4%至10%，有一天反而上升。',
      'The 94% figure may only appear together with its context: a modelled value for one simulated day at the Gaotie Rd / Chongxin Rd intersection in Kaohsiung, flagged by the report itself as an outlier. On the same intersection\'s other three simulated days the daily change at the waiting area was a 12–18% reduction (two of those days failed the model-performance check), and hour by hour about 3–21%; at the Taipei and New Taipei intersections reductions were about 4–10%, and one day showed a rise.',
    ),
    instead: t(
      '在運研所的模式中，高雄高鐵路／重信路口全天實施行人專用時相，其他三個模擬日的等候區PM2.5每日降低約12%至18%（逐時約3%至21%）；台北與新北的路口約降低4%至10%，有的模擬日反而上升。只有一個模擬日出現94%，報告自己標示為離群值。',
      'In the Institute of Transportation\'s model, an all-day exclusive pedestrian phase at Gaotie Rd / Chongxin Rd in Kaohsiung lowered waiting-area PM2.5 by about 12–18% a day on the other three simulated days (about 3–21% hour by hour); at the Taipei and New Taipei intersections reductions were about 4–10%, and on some simulated days PM2.5 rose. Only one simulated day showed 94%, which the report itself flags as an outlier.',
    ),
    why: t(
      '媒體把單日離群的模擬值報導成「最多減少94%」或「尖峰時少吸9成廢氣」，讓讀者以為是一般或實測效果。',
      'Press coverage turned a single-day model outlier into "up to 94%" or "90% less exhaust at peak times", implying a typical or measured effect.',
    ),
    patterns: { 'zh-TW': ['9[45](\\.\\d+)?\\s*%', '九成', '9成'], en: ['\\b9[45](\\.\\d+)?\\s*(%|per\\s*cent)', 'ninety[- ]four'] },
    facts: ['iot-scramble-outlier-day', 'iot-scramble-typical-range'],
    sources: ['iot-2025-intersection-air-quality', 'taipeitimes-2025-04-07-scramble', 'ltn-scramble-90-percent'],
    research: '02 §1a, §1b, Corrections #1; IOT-113-TB006 Table 4.3.2-4 (hourly, waiting area: −21.40% to −2.58% on days 1, 3, 4), Table 4.3.2-30 (daily: −17.79*, −16.22#, −12.00#), Table 4.3.2-29 (Taipei/New Taipei: −7.51, −10.23*, +10.22#, −4.38#); PDF re-opened 2026-11-26',
  },
  'iot-results-are-modelled': {
    kind: 'qualifier',
    topic: 'exposure',
    rule: t(
      '運研所的行人專用時相、人行道拓寬與退縮情境效果是模式模擬，不是實地前後量測；唯一的實測是第一年兩處行人退縮前後的PM2.5（降低0.46與0.94 µg/m³，另一處略升）。路口行人等候區的PM2.5與一氧化碳讀數本身是實測。報告結論不代表交通部意見。',
      'The IOT effects of scramble phases, sidewalk widening and setbacks are modelled scenarios, not before-and-after measurements; the only measured effect is year one\'s PM2.5 before and after two pedestrian setbacks (0.46 and 0.94 µg/m³ lower, slightly higher at another site). The PM2.5 and carbon monoxide readings at the pedestrian waiting areas are themselves measurements. The report\'s conclusions do not represent MOTC\'s views.',
    ),
    why: t('報告說明現實中無法在同一路口改動策略，因此以實測資料驅動擴散模式模擬。', 'The report explains the strategies could not be changed at the same real intersection, so they were simulated with a dispersion model driven by field data.'),
    patterns: { 'zh-TW': ['運研所.{0,20}(實測|測得)', '交通部(表示|證實)'], en: ['IOT (measured|found that)', 'ministry (says|confirmed)'] },
    facts: ['iot-study-design', 'iot-setback-measured', 'iot-waiting-area-pm25-2024', 'iot-waiting-area-co-2024'],
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
      '報告裡找不到「一氧化碳減少11%」這個數字；在台北與新北路口，模擬的一氧化碳反而上升7%至40%。',
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
    instead: t('Wang 等（2021）：騎士在機車停下時（例如等紅燈）量到的PM2.5中位數是75 µg/m³；Chuang 等（2020）：騎機車通勤一小時的平均值是53.6 µg/m³。兩項研究分開看：一個是停等時的中位數，一個是整趟的平均值。', 'Wang et al. 2021: a median of 75 µg/m³ of PM2.5 for riders while the motorcycle was stopped (for example at red lights); Chuang et al. 2020: a mean of 53.6 µg/m³ over a one-hour scooter commute. They are two separate studies, one a median at stops and the other a mean over the whole trip.'),
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
      'Wu et al. 2021 is always "commuters on bicycles and scooters, Taipei", never pedestrians; its scooter group rode electric scooters and breathed surrounding traffic, the study did not compare petrol with electric, and it does not attribute benzene to scooters. Scooters "could contribute more" to PM2.5 only because there are more of them; per vehicle a bus or truck added about 8-10 times as much. Chuang et al. 2020\'s scooter mode is likewise the rider\'s own exposure.',
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
    why: t('這幾項研究常被誤說成台灣研究；它們都在國外做。', 'These studies are often wrongly described as Taiwanese; all were done abroad.'),
    facts: ['child-height-harr2022', 'pram-height-sharma2020'],
    sources: ['harr-2022-uclim', 'sharma-kumar-2020-envint'],
    research: '02 §4, §6, Corrections #5',
  },
  'no-taiwan-child-height-data': {
    kind: 'do-not-claim',
    topic: 'children',
    rule: t(
      '不可說兒童「比成人多吸44%污染」，不可引用任何台灣兒童高度的實測數字（我們沒有找到），也不可用數字說兒童「更靠近排氣管」。嬰兒車高度的數字要逐項寫：三項研究高約10%；59%是美國一項路邊PM2.5研究；44%是英國一項實驗的「最多」值；德國一項（1.0對1.6公尺）8天中有6天高逾20%；另有研究較低或沒有一致差異。',
      'Do not say children breathe "44% more pollution" than adults, cite any Taiwanese child-height measurement (we found none), or put a number on children being "closer to the tailpipe". Give stroller-height figures study by study: three studies about 10% higher; 59% is PM2.5 in one US roadside study; 44% is "up to" in one UK experiment; a German study (1.0 vs 1.6 m) found more than 20% higher on 6 of 8 days; other studies found lower or no consistent difference.',
    ),
    instead: t(
      'WHO指出兒童更接近地面，某些污染物在那裡濃度最高；英國一項實驗發現嬰兒車高度的細微粒最多高44%。',
      'WHO notes children live closer to the ground, where some pollutants peak; a UK experiment found fine particles up to 44% higher at stroller height.',
    ),
    why: t('44%是英國研究中各條件的最大值；59%只來自一項美國研究；學齡兒童的呼吸高度高於嬰兒車。', 'The 44% is a maximum across conditions in a UK study; the 59% rests on one US study; a school-age child breathes above stroller height.'),
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
    why: t('我們沒有找到台灣機車排氣管高度的實測。', 'We found no measurement of Taiwanese scooter tailpipe heights.'),
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
      '運研所的模式只是用時速5公里的排放係數代表怠速；我們沒有找到台灣機車怠速排放率的量測，唯一的怠速排放率來自越南河內。騎樓與測站的比較，我們也沒有找到。',
      'The IOT model only stands in for idling with the 5 km/h emission factor; we found no measured Taiwanese scooter idle emission rate, the only idle rates being from Hanoi. We found no arcade-versus-station comparison either.',
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
      'Do not present scooters as a major PM2.5 source: petrol scooters are 1.31% of primary PM2.5 emissions and emit less PM2.5 per km than cars or diesels. The case rests on hydrocarbons, benzene, CO, fleet size and proximity.',
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
    why: t('台中市的數字曾被當成全國數字引用。', 'Taichung\'s figures have been quoted as if they were national ones.'),
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
      '依交通部統計，台灣每百人約有63輛機車；在一份非官方的區域排名裡（台灣以每百人60輛計），台灣排第一。',
      'By MOTC figures Taiwan has about 63 registered motorcycles per 100 people; in one unofficial regional ranking (which puts Taiwan at 60 per 100), Taiwan came first.',
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
      'Do not say the government has banned (or announced a ban on) new petrol scooters; the net-zero path only sets a 100% electric sales-share target for 2040.',
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
      'Reasons for falling electric sales (subsidy cuts, Gogoro plan changes, the petrol excise-tax cut) may only be attributed to media reports, not stated as established causes.',
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
      'Do not say petrol (scooter) exhaust is an IARC Group 1 carcinogen or "as carcinogenic as diesel". Petrol engine exhaust is Group 2B; benzene and outdoor air pollution are Group 1.',
    ),
    instead: t(
      'IARC把汽油引擎廢氣列為「可能致癌」（2B級）；汽油廢氣中含有的苯，以及整體室外空氣污染，則被列為「對人類致癌」（1級）。',
      'IARC classifies petrol engine exhaust as "possibly carcinogenic" (Group 2B); benzene, which petrol exhaust contains, and outdoor air pollution as a whole are "carcinogenic to humans" (Group 1).',
    ),
    why: t('IARC 2012年重新評估後維持2B級；柴油廢氣是1級，不可混為一談。', 'IARC kept petrol exhaust at 2B in 2012; diesel exhaust is Group 1 and must not be conflated.'),
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
    internal: true,
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
      '高雄一項研究發現，5分鐘的PM2.5高峰之後，心率變異度會小幅下降；但一次短暫的接觸對健康有什麼後果，還沒有定論，也還沒有人在怠速機車旁研究過。',
      'A Kaohsiung study found small drops in heart rate variability after 5-minute PM2.5 peaks; but what one brief exposure does to health is not established, and nobody has yet studied it beside idling scooters.',
    ),
    why: t(
      '有量到身體變化的最短暴露是高雄研究的5分鐘PM2.5高峰（心率變異度小幅下降，是替代指標；摘要列出的高峰來源不包括交通）。其他證據是前1至4小時的微粒、一小時的通勤（Chuang 等），以及數小時至數週（美國心臟學會）。這些都不是在怠速機車旁的幾分鐘。',
      'The shortest exposure with a measured effect on the body is the 5-minute PM2.5 peaks of the Kaohsiung study (small HRV drops, a surrogate marker; the peak sources the abstract names do not include traffic). The rest covers the previous 1–4 hours, a one-hour commute (Chuang et al.) and hours to weeks (AHA). None of it is minutes beside idling scooters.',
    ),
    patterns: { 'zh-TW': ['幾分鐘.{0,15}(致病|傷害|生病)', '(怠速|紅燈).{0,15}(致病|致癌)'], en: ['(few|several) minutes.{0,40}(ill|harm|disease)', 'idling.{0,30}(cancer|illness)'] },
    facts: ['lung2025-peaks-hrv', 'chuang2005-hrv-taipei', 'aha-2010-pm25-cardiovascular', 'chuang2020-cardiovascular-association', 'mccreanor2007-london-walk'],
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
      '台灣過半肺癌患者從未吸菸，研究者還在查空氣污染是不是原因之一；現有證據屬生態學關聯與動物機制，尚非定論。',
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
      '不可依危害大小排序一氧化碳、苯與超細微粒，只能說一氧化碳沒有味道、微粒小到看不到；一氧化碳在路口是廢氣的指標，沒有證據顯示路口濃度會危害健康。',
      'Never rank carbon monoxide, benzene and ultrafine particles by harm; say only that carbon monoxide has no smell and particles are too small to see. At the kerb carbon monoxide is a marker of exhaust, not a demonstrated hazard.',
    ),
    why: t('路口的一氧化碳只有運研所在夏天幾天用微型感測器量到的讀數（遠低於WHO的短時間指引值）；沒有碳氧血紅素的量測，也沒有比較三者危害的研究。', 'Kerbside carbon monoxide has been measured only by the Institute of Transportation\'s micro-sensors on a few summer days (far below WHO\'s short-term values); there are no carboxyhaemoglobin measurements and no study comparing the three for harm.'),
    patterns: { 'zh-TW': ['(一氧化碳|苯|超細微粒).{0,10}(最毒|更毒|最危險|更危險|最致命)'], en: ['(carbon monoxide|benzene|ultrafine).{0,20}(most|more) (toxic|dangerous|harmful|deadly)'] },
    facts: ['co-odourless', 'who-benzene-no-safe-level', 'iot-waiting-area-co-2024'],
    research: 'docs/editorial-blueprint.md Part 2 R3; redlight/acute-health (doNotClaim 9); 02 §1a (IOT CO readings)',
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
    internal: true,
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
    internal: true,
  },
  'r11-no-concentration-surge-in-scene': {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t(
      '場景不可呈現濃度隨時間變化，也不可呈現機車專屬的起步暴增。',
      'The scene never shows a concentration changing over time, and never a scooter-specific pull-away surge.',
    ),
    why: t('台灣路口唯一的時間序列是運研所固定感測器每分鐘一筆的讀數，報告沒有依紅燈與綠燈分析；我們也沒有找到量化機車起步高峰的研究。', 'The only Taiwanese time series at a crossing is the Institute of Transportation\'s one-reading-a-minute fixed sensors, which the report does not analyse by red and green phase; we found no study quantifying a scooter pull-away spike.'),
    patterns: { 'zh-TW': ['起步.{0,10}(暴增|飆升|衝高)'], en: ['pull[- ]away (surge|spike|burst)'] },
    facts: ['signal-cycle-peaks-international'],
    research: 'redlight/idle-emissions (doNotClaim 3); docs/editorial-blueprint.md Part 2 R11',
    blueprintRule: 'R11',
    internal: true,
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
    internal: true,
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
      'Scooters\' emissions problem is carbon monoxide, hydrocarbons and benzene; in 2021 petrol cars emitted about twice as much benzene as scooters, and scooter benzene had fallen about 73% since 2013.',
    ),
    why: t('TEDS 13.0與Tsai 等（2023）把機車的PM2.5與氮氧化物排在最低；苯的年總量從2016年起汽油車較多。', 'TEDS 13.0 and Tsai et al. 2023 put scooters lowest for PM2.5 and NOx; from 2016 petrol vehicles emitted more benzene in total.'),
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
    why: t('我們沒有找到公開的台灣機車遙測研究或篩檢結果；Ko 與 Cho（2006）談的是一般車輛，Lin 等（2006）發現老車數量少。', 'We found no published remote-sensing study or screening results for Taiwanese scooters; Ko & Cho 2006 covers vehicles in general, and Lin et al. 2006 found old scooters few.'),
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
    why: t('測試的行車型態從ECE型態改為WMTC（車輛研究測試中心）。', 'The test cycle changed from ECE-type to WMTC (per ARTC).'),
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
    why: t('我們沒有找到台灣機車怠速排放率（克／小時）的量測；河內的車款、標準與里程都和台灣不同或沒有說明。', 'We found no measured Taiwanese idle emission rate in grams per hour; the Hanoi models, standards and mileage differ from Taiwan\'s or are not stated.'),
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
    why: t('我們只確認了這些研究的書目資料，沒有讀到摘要或全文，因此不知道它們實際寫了什麼。', 'We confirmed only the bibliographic details of these studies and could not read their abstracts or full texts, so we do not know what they actually report.'),
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
    instead: t('聞到味道，只代表你站在廢氣裡；它量不出裡面有哪些東西、各有多少。', 'The smell tells you that you are standing in exhaust; it cannot tell you what is in it or how much.'),
    why: t('嗅覺閾值相差數個數量級，與PM2.5或毒性劑量沒有對應關係。', 'Odour thresholds span orders of magnitude and do not map onto PM2.5 or toxic dose.'),
    patterns: { 'zh-TW': ['(聞到|氣味|臭味).{0,15}(代表|表示|等於|證明).{0,10}(危害|有毒|劑量|濃度|危險)'], en: ['(smell|odou?r).{0,30}(measures?|means|shows|proves).{0,20}(harm|dose|toxic|danger)'] },
    facts: ['co-odourless', 'odour-thresholds', 'formaldehyde-odour-not-harm'],
    research: 'redlight/smell-chemistry (doNotClaim 1); redlight/vulnerable-groups (doNotClaim 2); redlight/acute-health (doNotClaim 8); redlight/intersection-peaks (doNotClaim 9); digest must-not 4',
  },
  'benzene-not-the-smell': {
    kind: 'do-not-claim',
    topic: 'smell',
    rule: t(
      '不可說你聞到的是苯，也不可說聞到的是廢氣中含量最多的輕烷類（異戊烷、甲基戊烷）。',
      'Do not say benzene is what you smell, nor the light alkanes that dominate the exhaust (isopentane, methylpentanes).',
    ),
    why: t('苯要到百萬分之幾（依來源約1.5至97 ppm）才聞得到，異戊烷約1.3 ppm、甲基戊烷約7至9 ppm；沒有研究找出機車廢氣的味道主要來自哪些物質。', 'Benzene is smellable only at parts per million (about 1.5–97 ppm by source), isopentane at about 1.3 ppm and the methylpentanes at about 7–9 ppm; no study has identified the dominant odorants.'),
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
    why: t('我們沒有找到路口行人吸入苯或甲醛的量測。路口的一氧化碳只有運研所夏天幾天的微型感測器讀數，最高約1.3 ppm，遠低於WHO的短時間指引值；外送員的呼氣一氧化碳研究是職業暴露，不能與WHO環境值比較。', 'We found no measurement of benzene or formaldehyde breathed by pedestrians at crossings. Kerbside carbon monoxide has been measured only by the Institute of Transportation\'s micro-sensors on a few summer days, peaking at about 1.3 ppm, far below WHO\'s short-term values; the delivery-worker breath-CO study is occupational and not comparable with WHO ambient values.'),
    patterns: { 'zh-TW': ['(紅燈|路口).{0,20}(超過|超標).{0,10}(指引|標準)', '碳氧血紅素'], en: ['(red light|crossing).{0,40}(above|exceed).{0,20}guideline', 'carboxyh(a)?emoglobin'] },
    facts: ['iot-waiting-area-co-2024', 'li2025-delivery-workers-co'],
    research: 'redlight/smell-chemistry (doNotClaim 5); redlight/acute-health (doNotClaim 9); 02 §1a (IOT CO readings)',
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
      '這些數字出自WHO 2021年指引的表0.1與0.2（我們讀過原文）；7 mg/m³是2010年室內空氣指引的舊值。',
      'These figures come from Tables 0.1 and 0.2 of WHO\'s 2021 guidelines, which we read in the original; 7 mg/m³ is the older value from the 2010 indoor-air guidelines.',
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
    internal: true,
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
    why: t('我們沒有查到可以核對的官方數字。', 'We found no official figure we could check.'),
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
    why: t('依世界衛生組織2024年的資料頁（fact sheet）。', 'Per the WHO fact sheet of 2024.'),
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
    why: t('我們讀到的摘要裡，單位符號沒有正確顯示，所以無法確認單位。', 'In the abstract we read, the unit symbols did not display correctly, so the unit could not be confirmed.'),
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
    rule: t('不可寫出台灣機車的噪音分貝上限：我們沒有讀到標準的附表。', 'Do not print Taiwanese scooter dB limits: we have not read the standard\'s annex tables.'),
    why: t('我們只確認了噪音管制標準的本文與修正日期。', 'We confirmed only the body text and amendment date of the noise standard.'),
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
    why: t('這些「最高」金額是少數人才符合的最佳情況；新北的39,600元還需要兩輛舊車與已額滿的早鳥名額。', 'The research shows these totals are best cases few people meet; New Taipei\'s also needs two old scooters and an early-bird quota that is full.'),
    patterns: { 'zh-TW': ['4萬9,?300|49,?300', '3萬9,?600|39,?600', '4萬4|44,?000'], en: ['49,?300', '39,?600', '44,?000'] },
    facts: ['econ-taipei-max-subsidy'],
    sources: ['taipei-dep-2026-11-20-press', 'tvbs-health-2026-01-subsidy', 'taoyuan-epb-2026-programme'],
    research: 'econ/taipei#tpe-max-replace, econ/new-taipei#ntpc-best-case-total, econ/taoyuan#ty-max-total',
  },
  'econ-electric-not-always-cheaper-to-run': {
    kind: 'do-not-claim',
    topic: 'economics',
    rule: t('不可說電動機車「一定比較省」或「養車更便宜」：換電月租對騎得少的人比油錢貴。', 'Do not say electric scooters are always cheaper to run: for low-mileage riders a swap subscription costs more than fuel.'),
    instead: t(
      '能在家插電、不付電池月租的車，電費遠低於油錢，但我們查到的這類車只有一家廠商的兩款；主流車款多半要付換電月租，騎得少的人會比油錢貴。換電方案划不划算，要看里程與換電時段。',
      'A scooter you can plug in at home with no battery plan costs far less in electricity than fuel, but we found only two such models, from one maker; most mainstream models need a swap plan, which costs more than fuel for low-mileage riders. Whether a swap plan pays off depends on mileage and when you swap.',
    ),
    why: t('每月300公里時，新款125cc油錢約160至220元，而在這個里程最便宜的換電方案也要488元；交通部調查中，電動機車車主每年的油電支出也比燃油車主高。', 'At 300 km a month a modern 125cc uses about NT$160–220 of fuel, while the cheapest swap plan at that distance costs NT$488; in the MOTC survey electric owners also spent more a year on energy than petrol owners.'),
    patterns: { 'zh-TW': ['(電動|電車).{0,10}(一定|絕對|都)(比較)?(省|便宜)'], en: ['electric.{0,30}(always|definitely) cheaper to run'] },
    facts: ['econ-swap-vs-petrol-low-mileage', 'econ-home-charging-cost-per-km', 'econ-motc-annual-spend'],
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
  // -------------------------------------------------------------------------
  // The redesign brief's banned claims (section 4.6, check 3) and the masks' must-not-say list
  // (amendment 12.2). Ids and trigger patterns match scripts/brief-rules.mjs, so these registry
  // rules replace the integrator's copies in check-copy and appear in "what we will not say".
  // -------------------------------------------------------------------------
  "brief-no-buildup": {
    kind: 'do-not-claim',
    topic: 'kerb',
    rule: t("不說紅燈越久、廢氣積得越多，也不畫紅燈期間的變化曲線。", "Do not say that the longer the red, the more exhaust builds up, and draw no curve through the red."),
    instead: t("紅燈時，機車停在旁邊，廢氣就一直補上來。", "While the scooters sit beside you, the exhaust keeps coming."),
    why: t("推估只公布90秒的平均；模式裡的累積曲線取決於假設的到達方式，唯一量過的紅燈期間資料（上海）反而是一開始最高。", "The estimate publishes only a 90-second average; the modelled build-up follows an assumed arrival pattern, and the one measured red-phase series (Shanghai) is highest at the start."),
    patterns: { 'zh-TW': ["越久.{0,8}越多|愈久.{0,8}愈多|積得越多|越積越多|越等越多"], en: ["the longer (the|you) (red|wait|light|stand).{0,50}(more|build|worse)|builds? up (during|through|over) the red"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-child-height-number": {
    kind: 'do-not-claim',
    topic: 'children',
    rule: t("不印小孩高度的倍數（例如1.7到2.2倍）。", "Print no multiple for child height (such as 1.7 to 2.2 times)."),
    instead: t("照體重算，小孩吸進的空氣是大人的1.5到2倍；矮的地方，廢氣一樣多或更多。", "For their body weight, children breathe 1.5 to 2 times the air an adult does; lower down, the exhaust is the same or more."),
    why: t("1.7到2.2倍是把每公斤呼吸量乘上一個沒有公布的高度因子；推估沒有小孩或嬰兒車高度的數字。", "1.7–2.2 multiplied air per kilogram by an unpublished height factor; the estimate gives no number for child or pushchair height."),
    patterns: { 'zh-TW': ["(1\\.7|2\\.2)\\s*倍|1\\.7\\s*[到至–~\\-－]\\s*2\\.2"], en: ["(1\\.7|2\\.2)\\s*(times|×|x)\\b|1\\.7\\s*(–|-|to)\\s*2\\.2"] },
    facts: ["child-air-per-kg"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-riders-most": {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t("不說騎機車的人吸得最多。", "Do not say riders breathe the most."),
    instead: t("台北量過：騎機車和走路的人，吸到的PM2.5平均都比搭捷運的多。", "Measured in Taipei: people on scooters and people on foot both breathed more PM2.5, on average, than people on the metro."),
    why: t("台北的研究裡，騎機車和走路的PM2.5差異不顯著，而且是各種來源、早上一小時的平均。", "In the Taipei study scooter riders and walkers did not differ significantly, and the figures are all-source, one-morning-hour averages."),
    patterns: { 'zh-TW': ["吸得最多|吸最多|吸到最多"], en: ["breathes? (in )?the most|the most exposed"] },
    facts: ["commute-scooter-vs-subway-chuang2020"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-idling-legal": {
    kind: 'do-not-claim',
    topic: 'inspection',
    rule: t("不說等紅燈不熄火違規、違法或合法。", "Do not call idling at a red light illegal, unlawful or legal."),
    instead: t("怠速規定是停車等候超過三分鐘才要熄火，一般的紅燈比這短。", "The rule asks engines off after more than three minutes of waiting; a normal red light is shorter."),
    why: t("怠速規定管的是停車等候超過三分鐘的車；等紅燈算不算，沒有官方解釋。", "The idling rule covers vehicles waiting more than three minutes; no official interpretation says whether a red light counts."),
    patterns: { 'zh-TW': ["怠速.{0,20}(違規|違法|合法)|(違規|違法|合法).{0,20}怠速"], en: ["idl\\w*.{0,40}\\b(illegal|unlawful|legal|against the law)\\b|\\b(illegal|unlawful|legal)\\b.{0,40}\\bidl"] },
    facts: ["idling-regulation"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-vocab-chelius": {
    kind: 'correction',
    topic: 'emissions',
    rule: t("寫「車子的廢氣」，不寫「車流廢氣」。", "Write 車子的廢氣 (exhaust from traffic), not 車流廢氣."),
    instead: t("車子的廢氣", "exhaust from traffic"),
    why: t("讀者口語不說車流廢氣（用字表6.6）。", "Readers do not say 車流廢氣 (vocabulary list 6.6)."),
    patterns: { 'zh-TW': ["車流廢氣"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-vocab-chedui": {
    kind: 'correction',
    topic: 'emissions',
    rule: t("寫「一排機車」，不寫「車隊」。", "Write 一排機車 (a row of scooters), not 車隊."),
    instead: t("一排機車", "a row of scooters"),
    why: t("車隊指的是一家公司或一隊車，不是紅燈前停的一排機車。", "車隊 means a company fleet or a convoy, not the row of scooters at a light."),
    patterns: { 'zh-TW': ["車隊"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-vocab-zuizang": {
    kind: 'correction',
    topic: 'inspection',
    rule: t("寫「排最多的一成」，不寫「最髒的一成」。", "Write 排最多的一成 (the highest tenth), not 最髒."),
    instead: t("排最多的一成", "the highest tenth of readings"),
    why: t("算的是定檢讀數不是車，而且「髒」帶著責備。", "The figure counts inspection readings, not scooters, and 髒 carries blame."),
    patterns: { 'zh-TW': ["最髒"] },
    facts: ["inspection-top-tenth-co-share"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-vocab-yu": {
    kind: 'correction',
    topic: 'emissions',
    rule: t("寫「越…越…」，不寫「愈」。", "Write 越…越…, not 愈."),
    instead: t("越", "越"),
    why: t("台灣口語用越（用字表6.6）。", "Spoken Taiwan Mandarin uses 越 (vocabulary list 6.6)."),
    patterns: { 'zh-TW': ["愈"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-vocab-shuijian": {
    kind: 'correction',
    topic: 'economics',
    rule: t("寫「減稅」，不寫「稅減」。", "Write 減稅, not 稅減."),
    instead: t("減稅", "減稅"),
    why: t("稅減不是台灣的說法。", "稅減 is not how Taiwan says it."),
    patterns: { 'zh-TW': ["(?<!貨物)稅減"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-long-limits": {
    kind: 'do-not-claim',
    topic: 'standards',
    rule: t("不拿8小時、24小時或年平均的標準，或空氣品質指標的顏色，和90秒比。", "Do not set 8-hour, 24-hour or annual limits, or AQI colours, against 90 seconds."),
    instead: t("都比世界衛生組織的15分鐘指引值低很多。", "Both are far below the WHO 15-minute guideline."),
    why: t("平均時間不同，比了沒有意義；能比的只有世界衛生組織的一氧化碳15分鐘指引值，而且只說「低很多」。", "The averaging times differ, so the comparison means nothing; the only fair one is the WHO 15-minute carbon monoxide value, as \"far below\"."),
    patterns: { 'zh-TW': ["(8|八|24|二十四)\\s*小時.{0,4}(平均|標準|限值|指引)|年平均.{0,4}(標準|限值|指引)|空氣品質指標.{0,6}(顏色|燈號)|AQI.{0,6}(顏色|燈號|紅|紫)"], en: ["\\b(8|eight|24|twenty-four)[- ]hour (limit|standard|guideline|mean|average)|\\bannual (limit|standard|guideline)|\\bAQI colou?rs?"] },
    facts: ["who-no2-co-guideline"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-cigarettes": {
    kind: 'do-not-claim',
    topic: 'hazard',
    rule: t("不拿香菸來比。", "Do not compare with cigarettes."),
    why: t("香菸和路口廢氣的成分、量和吸入方式都不同。", "Cigarette smoke differs from kerbside exhaust in what it holds, how much and how it is breathed."),
    patterns: { 'zh-TW': ["香菸|抽菸|一根菸"], en: ["cigarettes?"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-cancer-risk": {
    kind: 'do-not-claim',
    topic: 'hazard',
    rule: t("不從90秒推算致癌風險。", "Compute no cancer risk from 90 seconds."),
    why: t("致癌風險是一輩子持續吸入的估計，不能拆成一個紅燈。", "Cancer unit risks describe lifelong exposure and cannot be split into one red light."),
    patterns: { 'zh-TW': ["致癌風險|罹癌風險|得癌症的機率"], en: ["cancer risk|risk of (getting )?cancer"] },
    facts: ["who-benzene-no-safe-level"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-poisoning": {
    kind: 'do-not-claim',
    topic: 'hazard',
    rule: t("不說路口的一氧化碳會中毒。", "Do not say kerbside carbon monoxide poisons anyone."),
    why: t("推估和實測都遠低於短時間的健康指引。", "The estimate and the readings are both far below short-term health guidelines."),
    patterns: { 'zh-TW': ["中毒"], en: ["poison"] },
    facts: ["route-co-blood"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-pullaway-multiplier": {
    kind: 'do-not-claim',
    topic: 'emissions',
    rule: t("綠燈起步那一陣，不印倍數。", "Print no multiplier for the pull-away at green."),
    instead: t("起步是只有幾秒鐘、很猛的一陣。", "A short, sharp burst lasting a few seconds."),
    why: t("機車起步的排放沒有公開的量測數字。", "No published measurement gives scooter emissions at pull-away."),
    patterns: { 'zh-TW': ["起步.{0,15}\\d+(\\.\\d+)?\\s*倍|\\d+(\\.\\d+)?\\s*倍.{0,15}起步"], en: ["(pull(s|ing)? away|at green|burst).{0,40}\\d+(\\.\\d+)?\\s*(times|×)"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-distance-rule": {
    kind: 'do-not-claim',
    topic: 'intersection',
    rule: t("不說「往後退幾公尺，就少吸多少」。", "Do not say \"step back N metres and breathe X less\"."),
    instead: t("離機車遠一點，別站在車陣正後方。", "Stand further from the scooters, not right behind the pack."),
    why: t("推估顯示風的影響最大，大人高度的距離效果沒有量過；只能說離機車遠一點。", "In the estimate wind matters most, and the effect of distance at adult height is unmeasured; say only \"stand further from the scooters\"."),
    patterns: { 'zh-TW': ["(退|站遠|離開|往後|遠離).{0,10}\\d+(\\.\\d+)?\\s*(公尺|米)|少吸.{0,6}(一半|\\d+\\s*%)"], en: ["step (back|away) \\d|\\d+(\\.\\d+)?\\s*(m|metres?|meters?) (back|away).{0,40}(less|lower|halve)|halves? (your )?(exposure|what you breathe)"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-child-height-plus": {
    kind: 'do-not-claim',
    topic: 'children',
    rule: t("不印小孩高度「多10%」這類數字。", "Print no \"+10%\" for child height."),
    why: t("國外研究的結果不一，不能合成一個數字。", "Studies abroad disagree and cannot be pooled into one figure."),
    patterns: { 'zh-TW': ["[+＋]\\s*10\\s*%"], en: ["\\+\\s*10\\s*%"] },
    facts: ["stroller-height-review"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-ultrafine-number": {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t("不印這排機車加了多少超細微粒，也不拿世界衛生組織的微粒數標記來比。", "Print no ultrafine-particle number for the pack, and do not use the WHO particle-number mark."),
    why: t("怠速小型四行程機車沒有微粒數排放的量測，模式只能給一個大小未知的下限。", "No idle particle-number emission rate exists for small four-strokes; the model gives only a lower bound of unknown size."),
    patterns: { 'zh-TW': ["(超細微粒|微粒數).{0,15}(?<![Pp][Mm][\\d.]*)\\d[\\d,.]*\\s*萬?\\s*(個|顆|\\/|每立方公分)|\\d[\\d,]*\\s*(個|顆)\\s*\\/\\s*(立方公分|cm3|cm³)"], en: ["(ultrafine|particle number).{0,30}(?<!PM[\\d.]*)\\b\\d[\\d,.]*\\s*(thousand|million|particles|\\/\\s*cm|per (cubic )?c(m|entimetre))|\\d[\\d,]*\\s*(particles)?\\s*(\\/|per)\\s*(cm3|cm³|cubic centimetre)"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-everything-rises": {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t("不說一氧化碳變多，所有污染物都變多。", "Do not say that when carbon monoxide rises, everything rises."),
    instead: t("一氧化碳多的地方，剛排出來的油氣和苯也多。", "Where there is more carbon monoxide, there is more fresh fuel vapour and benzene too."),
    why: t("跟著一氧化碳變多的只有剛排出來的油氣和苯；PM2.5幾乎不變。", "Only fresh fuel vapour and benzene rise with carbon monoxide; PM2.5 barely changes."),
    patterns: { 'zh-TW': ["一氧化碳.{0,10}(多|高|上升|增加).{0,12}(所有|全部|其他|每一種).{0,8}(污染|都)"], en: ["carbon monoxide (rises|goes up|is higher).{0,40}(everything|all (the )?(other )?pollutants|every pollutant)"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-never-measured-tw": {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t("不說台灣路口的一氧化碳或PM2.5沒有人量過。", "Do not say carbon monoxide or PM2.5 has never been measured at Taiwanese crossings."),
    instead: t("運研所在10個路口的行人等候區放了儀器。", "The Institute of Transportation put sensors where pedestrians wait at 10 junctions."),
    why: t("運研所在10處路口的行人等候區量過這兩種。", "The Institute of Transportation measured both in the pedestrian waiting areas of 10 junctions."),
    patterns: { 'zh-TW': ["(一氧化碳|PM2\\.5|細懸浮微粒).{0,20}(從來)?(沒有人|沒人|無人)(量|測)過"], en: ["(carbon monoxide|PM2\\.5).{0,40}(never been measured|has not been measured|have not been measured|nobody has measured)"] },
    facts: ["iot-waiting-area-co-2024", "iot-waiting-area-pm25-2024", "iot-study-design"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-no-rider-blame": {
    kind: 'do-not-claim',
    topic: 'exposure',
    rule: t("不怪騎士，不寫「騎士不熄火」。", "Never blame riders; do not write 騎士不熄火."),
    instead: t("引擎沒熄火。", "The engines stay on."),
    why: t("騎車的人也在同一團廢氣裡；說的是機車沒有熄火。", "Riders are in the same cloud; say the engines are running."),
    patterns: { 'zh-TW': ["騎士不熄火|騎士.{0,6}(害|污染了)"] },
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-masks-useless": {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t("不說口罩沒用。", "Do not say masks are useless."),
    instead: t("醫用口罩擋不住機車廢氣裡的氣體；口罩防感冒、流感還是有用。", "A surgical mask will not stop the gases in exhaust; it still helps against colds and flu."),
    why: t("口罩防感冒、流感有用，貼合的防塵口罩也能減少吸進的微粒。", "Masks help against colds and flu, and a well-fitted respirator does cut the particles breathed in."),
    patterns: { 'zh-TW': ["口罩.{0,8}(沒用|無用|完全沒效|一點用也沒有)"], en: ["masks? (are|is) (useless|pointless|no use)|masks? do(es)? nothing"] },
    facts: ["mask-respirator-benefit-langrish"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-masks-percent": {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t("不把濾材的百分比（例如醫用口罩過濾七、八成）當成戴在臉上的防護。", "Do not present a filter-material percentage (such as \"surgical masks filter 70–80%\") as protection as worn."),
    why: t("濾材的數字沒有算邊緣漏氣；真人戴著，醫用口罩只把細微粒降到約四分之一。", "Filter numbers ignore leaks at the edges; worn by real people, a surgical mask cut fine particles only to about a quarter."),
    patterns: { 'zh-TW': ["口罩.{0,20}(擋|過濾|濾掉).{0,10}\\d+\\s*%|7\\d\\s*[%到至–\\-]\\s*8\\d\\s*%"], en: ["masks?.{0,30}(filters?|blocks?|stops?).{0,15}\\d+\\s*%|7\\d\\s*(%|–|-|to)\\s*8\\d\\s*%"] },
    facts: ["mask-asworn-vandersande"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-masks-carbon-blocks": {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t("不說活性碳口罩擋得住廢氣、一氧化碳或毒氣。", "Do not say activated-carbon masks block exhaust, carbon monoxide or toxic gas."),
    why: t("活性碳抓不住一氧化碳，對溶劑蒸氣也只撐幾分鐘。", "Carbon does not hold carbon monoxide, and lasts only minutes against solvent vapour."),
    patterns: { 'zh-TW': ["活性碳.{0,12}(擋得住|可以擋|能擋|阻擋).{0,10}(廢氣|一氧化碳|毒氣)"], en: ["(activated[- ])?carbon masks?.{0,20}(block|stop|filter)s?.{0,20}(exhaust|carbon monoxide|toxic gas)"] },
    facts: ["mask-carbon-breakthrough", "mask-carbon-mol-2005"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },
  "brief-masks-n95-children": {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t("不建議小孩戴N95。", "Do not advise children to wear N95s."),
    why: t("本站沒有查證這項建議；小孩戴FFP2的效果比大人差很多。", "The site has not verified that advice, and children got much less protection from FFP2s."),
    patterns: { 'zh-TW': ["(小孩|兒童|孩子|寶寶).{0,10}(戴|配戴).{0,6}N95"], en: ["(children|kids?|child) (should )?wear (an )?N95"] },
    facts: ["mask-asworn-vandersande"],
    research: 'docs/redesign-brief.md §4.6, §6.6, §12.2; research/estimate/METHOD.md §8–§9; research/masks/VERIFIED.json mustNotSay',
  },

  'no-background-multiple-headline': {
    kind: 'do-not-claim',
    topic: 'kerb',
    rule: t('標題和大字，不寫「是街上原本的幾倍」。', 'No headline or big figure says the pack gives "N times" what the street already holds.'),
    instead: t('多出來的量，和街上原本就有的差不多。', 'What the scooters add is about as much as the street already holds.'),
    why: t(
      '倍數會把一個範圍很寬的推估說成一個確定的數字；主文用寫好的規則選「比較少、差不多、比較多」。這條規則只看標題，由 scripts/brief-rules.mjs 的 brief-no-multiple-headline 檢查。',
      'A multiple turns a wide estimate into one firm number; body text says less, about as much or more, chosen by a written rule. This rule applies to headlines only and is checked by brief-no-multiple-headline in scripts/brief-rules.mjs.',
    ),
    research: 'docs/redesign-brief.md §4.6; research/estimate/METHOD.md §9 (not fair: × background multipliers as a headline)',
  },
  'masks-carbon-not-nothing': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('不說活性碳口罩對任何蒸氣都沒有作用。', 'Do not say activated-carbon masks do nothing for any vapour.'),
    instead: t('活性碳口罩能短時間吸附一些溶劑蒸氣，但抓不住一氧化碳。', 'Activated-carbon masks soak up some solvent vapour briefly, but do not hold carbon monoxide.'),
    why: t('實驗室測試裡，經認證的活性碳口罩對丙酮可撐2到4小時；國民健康署也建議空氣很差時可用符合國家標準的活性碳口罩。', 'In laboratory tests an approved carbon mask lasted 2 to 4 hours on acetone, and Taiwan\'s Health Promotion Administration recommends carbon masks that meet the national standard on bad-air days.'),
    patterns: { 'zh-TW': ['活性碳口罩.{0,10}(完全)?(沒用|沒有作用|無效|沒效)'], en: ['carbon masks?.{0,15}(do nothing|are useless|have no effect)'] },
    facts: ['mask-carbon-breakthrough'],
    research: 'masks/VERIFIED#mask-carbon-breakthrough (mustNotSay 4)',
  },
  'masks-n95-not-gases': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('不說N95或FFP2擋得住廢氣裡的氣體、一氧化碳、氮氧化物或苯。', 'Do not say N95 or FFP2 masks protect against exhaust gases, carbon monoxide, NOx or benzene.'),
    instead: t('連N95都擋不住氣體；貼合的N95只能減少吸進的微粒。', 'Not even an N95 stops gases; a well-fitted N95 cuts only the particles breathed in.'),
    why: t('NIOSH說明，這類口罩只過濾微粒。', 'NIOSH states these respirators filter particles only.'),
    patterns: {
      'zh-TW': ['(N95|FFP2).{0,12}(擋得住|能擋|可以擋|擋住|過濾掉?|濾掉).{0,8}(一氧化碳|廢氣|氣體|苯|氮氧化物)'],
      en: ['(N95|FFP2).{0,30}(blocks?|stops?|filters?( out)?|protects? against).{0,20}(exhaust|carbon monoxide|gases|benzene|NOx)'],
    },
    facts: ['mask-niosh-no-gas'],
    research: 'masks/VERIFIED#mask-niosh-no-gas (mustNotSay 5)',
  },
  'masks-everyday-not-any-filter': {
    kind: 'correction',
    topic: 'masks',
    rule: t('不說「沒有任何濾材擋得住一氧化碳」；說「日常的口罩都擋不住」。', 'Do not say no filter of any kind can remove carbon monoxide; say no everyday mask can.'),
    instead: t('日常的口罩都擋不住一氧化碳。', 'No everyday mask stops carbon monoxide.'),
    why: t('工業用的全面罩防毒面具加濾罐可以處理一氧化碳。', 'Full-face gas masks with a canister do exist for carbon monoxide.'),
    patterns: { 'zh-TW': ['(任何|所有)(的)?(口罩|濾材|面具|過濾).{0,8}都擋不住一氧化碳'], en: ['no (filter|mask|respirator)s? (of any kind )?(can|will) (remove|stop|block|filter) carbon monoxide'] },
    facts: ['mask-niosh-no-gas'],
    research: 'masks/VERIFIED#mask-niosh-no-gas (mustNotSay 6)',
  },
  'masks-n95-not-95-percent': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('不說N95會擋掉你吸進的95%。', 'Do not say an N95 filters 95% of what you breathe.'),
    instead: t('95%是濾材的等級；戴在臉上擋多少，要看貼不貼合，耳掛式的很少貼合。', '95% is a rating of the filter material; what it stops on a face depends on the fit, and ear-loop N95s rarely seal.'),
    why: t('勞動部的測試裡，70人只有1人戴耳掛式N95能通過密合度測試。', 'In the labour ministry\'s test only 1 of 70 people got a seal with an ear-loop N95.'),
    patterns: { 'zh-TW': ['N95.{0,10}(擋|過濾|濾掉|擋掉).{0,6}95\\s*%'], en: ['N95.{0,30}(filters?|blocks?|stops?).{0,15}95\\s*(%|per\\s*cent)'] },
    facts: ['mask-ilosh-taiwan', 'mask-fit-cherrie'],
    research: 'masks/VERIFIED#mask-ilosh-taiwan (mustNotSay 7)',
  },
  'masks-no-measured-gas-through-mask': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('不印「二氧化氮或苯穿過口罩多少」的量測數字。', 'Print no measured figure for NO2 or benzene passing through a mask.'),
    why: t('查證時沒有找到量過市售口罩讓二氧化氮或苯穿透多少的研究；「擋不住氣體」靠的是濾材的性質和NIOSH的說明。', 'No verified study measured NO2 or benzene through a commercial mask; "does not stop gases" rests on what the filter is and on NIOSH\'s statement.'),
    patterns: { 'zh-TW': ['(苯|二氧化氮).{0,12}(穿透|透過|穿過).{0,8}口罩.{0,8}\\d+\\s*%'], en: ['(benzene|NO2|nitrogen dioxide).{0,30}(through|penetrat\\w*).{0,20}masks?.{0,15}\\d+\\s*%'] },
    facts: ['mask-niosh-no-gas'],
    research: 'masks/VERIFIED#mask-niosh-no-gas (mustNotSay 8; gaps 1)',
  },
  'masks-mol-2005-dated': {
    kind: 'qualifier',
    topic: 'masks',
    rule: t('勞動部那次「10款活性碳口罩沒有一款達標」的測試，一定寫出是2005年。', 'The labour ministry\'s "0 of 10 carbon masks met the standard" test always carries its year, 2005.'),
    why: t('新聞稿是2005年的，沒寫用哪種蒸氣；現在市售產品可能不同。', 'The press release is from 2005 and does not name the vapour; products on sale today may differ.'),
    patterns: { 'zh-TW': ['沒有一款.{0,12}(符合|達到).{0,6}(國家)?標準'], en: ['(none|0) of (the )?(10|ten).{0,30}(carbon )?masks?.{0,20}(met|passed)'] },
    facts: ['mask-carbon-mol-2005'],
    research: 'masks/VERIFIED#mask-carbon-mol-2005 (mustNotSay 9)',
  },
  'masks-ilosh-not-percent': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('勞安所的口罩分數（12.2、2.3…）不是百分比。', 'The institute\'s mask scores (12.2, 2.3 …) are not percentages.'),
    instead: t('醫用口罩2.3、頭帶式N95 12.2，只能拿來比較不同口罩。', 'Medical mask 2.3 against headband N95 12.2: a comparison between masks only.'),
    why: t('新聞稿沒有說明分數怎麼量。', 'The press release does not say how the score was measured.'),
    patterns: { 'zh-TW': ['(12\\.2|5\\.2|3\\.3|2\\.3|1\\.7)\\s*%.{0,10}口罩|口罩.{0,10}(12\\.2|2\\.3)\\s*%'], en: ['(12\\.2|2\\.3)\\s*(%|per\\s*cent).{0,20}mask|mask.{0,20}(12\\.2|2\\.3)\\s*(%|per\\s*cent)'] },
    facts: ['mask-ilosh-taiwan'],
    research: 'masks/VERIFIED#mask-ilosh-taiwan (mustNotSay 10)',
  },
  'masks-chuang-not-a-mask-test': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('不拿台北通勤研究（Chuang 等，2020）說口罩沒效。', 'Do not use the Taipei commuter study (Chuang et al., 2020) to say masks fail.'),
    why: t('那項研究的PM2.5儀器裝在口罩外面，量不到戴口罩的人實際吸進多少。', 'That study measured PM2.5 outside the mask, so it shows nothing about what the wearer breathed in.'),
    patterns: { 'zh-TW': ['(戴|配戴)(著)?口罩.{0,20}(沒有差|一樣高|沒用|也一樣)'], en: ['(wearing a mask|with a mask|masked walkers?).{0,40}(no difference|did not help|made no difference|just as (much|high))'] },
    facts: ['commute-scooter-vs-subway-chuang2020'],
    research: 'masks/VERIFIED rejected (Chuang 2020) (mustNotSay 11)',
  },
  'masks-no-khayan-97': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('不引用「活性碳口罩讓一氧化碳少97%」。', 'Do not cite the claim that carbon masks cut carbon monoxide by 97%.'),
    why: t('那項研究只有7人、方法不尋常，和活性碳幾乎抓不住一氧化碳的事實矛盾。', 'That study had 7 people and an unusual method, and contradicts the fact that carbon barely holds carbon monoxide.'),
    patterns: { 'zh-TW': ['活性碳.{0,20}9[0-9]\\s*%', '一氧化碳.{0,10}(少|降|減少).{0,4}9[0-9]\\s*%'], en: ['carbon.{0,30}9[0-9]\\s*(%|per\\s*cent)'] },
    facts: ['mask-carbon-breakthrough'],
    research: 'masks/VERIFIED rejected (Khayan 2019) (mustNotSay 12)',
  },
  'masks-no-harm-claim': {
    kind: 'do-not-claim',
    topic: 'masks',
    rule: t('不說戴口罩會傷身體，或讓人吸進更多廢氣。', 'Do not say masks harm health or increase exposure.'),
    why: t('沒有查證過的資料支持這種說法。', 'No verified source supports it.'),
    patterns: { 'zh-TW': ['口罩.{0,10}(傷害健康|傷身|有害健康|吸(進|到)更多)'], en: ['masks? (harm|damage|hurt)s? (your )?health|masks? (increase|raise)s? (your )?exposure'] },
    research: 'masks/VERIFIED mustNotSay 13',
  },

  // -------------------------------------------------------------------------
  // the 3-D simulation (research/simulation/statements.json, signed 2026-11-27). Each rule below is
  // one of the statements' must-not lines, or a statement that may be said only with its mustCarry.
  // A match is a prompt: every hit on the site has a reviewed allow-list entry naming what it carries.
  // -------------------------------------------------------------------------
  'sim-pushchair-exception-qualified': {
    kind: 'qualifier',
    topic: 'simulation',
    rule: t(
      '嬰兒車在排氣管正後方「可能超過指引值」，只能和這些一起說：推估、信心低、幾乎沒風而且風向不變（很少見）、剛好在排氣管正後方約半公尺、連續 15 分鐘每個紅燈都在、電腦裡的空氣比平常更靜、往旁邊移開半公尺就沒有了。「每十次約有一到兩次」說的是這樣的 15 分鐘，在約 0.6 公尺。',
      'That a pushchair right behind a tailpipe "can pass the guideline" may be said only with: Estimate, low confidence, near-still air that keeps its direction (rare), the exact spot about half a metre behind one tailpipe, every red for 15 minutes, the model\'s very still air, and that half a metre to the side removes it. "About 1 or 2 in 10" is of such 15-minute periods, at about 0.6 m.',
    ),
    why: t('statements.json 第 3 條的 mustCarry；這是唯一超過的情形，信心最低。', 'Statement 3\'s mustCarry in statements.json; it is the one case that passes, and the least certain.'),
    patterns: { 'zh-TW': ['嬰兒車[^。]{0,40}(超過|超標)', '超過\\s*87'], en: ['pushchair[^.]{0,90}\\b(can pass|passes|exceeds?|goes over|go over)\\b', '\\bpass(es)?\\s*87'] },
    facts: ['sim-co-pushchair-exception'],
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) may[2]',
  },
  'sim-heights-qualified': {
    kind: 'qualifier',
    topic: 'simulation',
    rule: t(
      '嬰兒車高度「和大人鼻子差不多到兩倍」，只能標推估，並說「風從機車吹來時」和「不是每種風都這樣」。不可說成每種風都一樣，也不可說小孩吸進的一氧化碳是兩倍。',
      'Pushchair height "between about the same as an adult\'s nose and about twice" only as an Estimate, with "with the wind from the scooters" and "not in every wind". Never as true in every wind, and never as children breathing twice the carbon monoxide.',
    ),
    why: t('statements.json 第 5 條的 mustCarry；在別的風裡，結果不一樣。', 'Statement 5\'s mustCarry in statements.json; in other winds the result differs.'),
    patterns: { 'zh-TW': ['嬰兒車(的)?高度[^。]{0,30}(兩倍|二倍)'], en: ['pushchair height[^.]{0,90}\\b(twice|two times|double)\\b'] },
    facts: ['sim-pushchair-height'],
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) may[4]',
  },
  'sim-stayers-benzene-qualified': {
    kind: 'qualifier',
    topic: 'simulation',
    rule: t(
      '加州 1 小時參考值只用在「在路口待上一小時的人」，而且要說：推估、1 到 4 倍、風一直從機車吹來、這個參考值是用 6 小時的資料訂的、機車廢氣裡的苯可能差到 5 到 10 倍、這不是在說等一個紅燈的人。不寫致癌風險。',
      'California\'s 1-hour reference only for people who stay an hour at a junction, and only with: Estimate, 1 to 4 times, the wind held from the scooters, the reference set from 6-hour data, a five- to ten-fold uncertainty in scooter benzene, and "not about someone waiting one red". No cancer-risk wording.',
    ),
    why: t('statements.json 第 8 條的 mustCarry。', 'Statement 8\'s mustCarry in statements.json.'),
    patterns: { 'zh-TW': ['加州[^。]{0,12}(參考值|1 小時|一小時)'], en: ['California[^.]{0,20}(1-hour|reference)'] },
    facts: ['sim-benzene-stayers-1h'],
    sources: ['scooterair-simulation-2026', 'arb-oehha-acute-rel-2025'],
    research: 'research/simulation/statements.json (signed 2026-11-27) may[7]',
  },
  'sim-no-far-below-for-bursts-stayers': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t(
      '「低很多」不可用在一秒一秒的一陣、在路邊待很久的人，或排氣管正後方、幾乎沒風的嬰兒車。',
      'Never "far below" for second-long bursts, for people who stay at the kerb, or for a pushchair right behind a tailpipe in near-still air.',
    ),
    instead: t('「低很多」只用在等一個紅燈，換算成 15 分鐘的平均以後。', '"Far below" only for one red light, once converted to a 15-minute average.'),
    why: t('statements.json 不可說的第 4 條。', 'Must-not 4 of statements.json.'),
    patterns: { 'zh-TW': ['(一秒|幾秒|一陣|站滿|待上|待一小時|嬰兒車)[^。]{0,40}低很多'], en: ['\\b(one-second|second-long|bursts?|people who stay|stay(s|ing)? (at|through)|pushchair)\\b[^.]{0,60}far below'] },
    facts: ['sim-co-bursts-1s', 'sim-co-stay-15min', 'sim-co-pushchair-exception'],
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[3]',
  },
  'sim-no-kerb-co-above-who': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不可說行人在路邊等紅燈時，一氧化碳超過世界衛生組織的指引值（任何說法）。', 'Never say kerb carbon monoxide is above the WHO guideline for a pedestrian waiting at a red light (in any wording).'),
    instead: t('推估：等一個紅燈，一氧化碳攤成 15 分鐘的平均，仍低於指引值。例外只有嬰兒車停在排氣管正後方、幾乎沒風、連續 15 分鐘每個紅燈都在。', 'Estimate: waiting one red light, the 15-minute carbon monoxide average stays below the guideline. The only exception is a pushchair right behind a tailpipe, in almost no wind, through every red for 15 minutes.'),
    why: t('statements.json 不可說的第 1 條。', 'Must-not 1 of statements.json.'),
    patterns: {
      'zh-TW': ['(行人|等紅燈|等一個紅燈|路邊|人行道)[^。嬰]{0,30}一氧化碳[^。嬰]{0,20}(?<!不代表|不是|沒有|不會)(超過|高於|超標)[^。]{0,10}(世界衛生組織|指引值|87)(?![^。]{0,6}嗎)'],
      en: ['\\b([Pp]edestrians?|[Ww]aiting (at|for|through) (a|one) red( light)?|[Aa]t the kerb)\\b[^.]{0,60}carbon monoxide[^.]{0,40}(?<!not |never )\\b(is above|goes above|rises above|is over|exceeds|passes) the (WHO )?(guideline|value|limit)'],
    },
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[0]',
  },
  'sim-smell-not-co-high': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不可說臭味代表一氧化碳很高、危險，或超過標準。', 'Never say the smell shows carbon monoxide is high, dangerous or above a standard.'),
    instead: t('一氧化碳沒有味道；很臭，不代表一氧化碳超過指引值。臭味告訴你，你正站在廢氣裡。', 'Carbon monoxide has no smell; a strong smell does not mean carbon monoxide is over the guideline. The smell tells you that you are standing in exhaust.'),
    why: t('statements.json 不可說的第 2 條。', 'Must-not 2 of statements.json.'),
    patterns: { 'zh-TW': ['(臭|味道)[^。]{0,25}(?<!不代表)一氧化碳[^。]{0,12}(很高|很多|超標|超過|危險)'], en: ['(smell|stink)[^.]{0,60}(?<!not mean )carbon monoxide[^.]{0,30}(is high|dangerous|above|over|exceed)'] },
    facts: ['smell-not-co-guideline'],
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[1]',
  },
  'sim-no-kaohsiung-validation': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不可說電腦算的一個紅燈，和高雄（運研所）的量測對得起來，或被它驗證。', 'Never say the simulation matches, or is validated by, the Kaohsiung (Institute of Transportation) readings.'),
    instead: t('電腦算的，沒有拿量到的來比對。', 'The simulation was not checked against readings.'),
    why: t('statements.json 不可說的第 5 條；方法報告的對照，兩個方向都沒有過。', 'Must-not 5 of statements.json; the method report\'s comparison failed in both directions.'),
    patterns: { 'zh-TW': ['(電腦|模擬)[^。]{0,30}(高雄|運研所|量到的)[^。]{0,20}(對得起來|吻合|一致|驗證|差不多)'], en: ['(simulation|simulated|computer)[^.]{0,60}(Kaohsiung|Institute of Transportation|readings)[^.]{0,40}\\b(match|agree|validat|confirm)'] },
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[4]',
  },
  'sim-no-odour-units': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不寫氣味單位的數字。', 'No odour-unit numbers.'),
    why: t('statements.json 不可說的第 9 條：門檻只來自 1960、70 年代的摘要。', 'Must-not 9 of statements.json: the thresholds rest on 1960s–70s abstracts only.'),
    patterns: { 'zh-TW': ['氣味單位', '\\d+\\s*OU\\b'], en: ['odou?r units?', '\\d+\\s*OU\\b'] },
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[8]',
  },
  'sim-no-workplace-ceiling': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不寫超過美國職業安全的上限（NIOSH），除非同時說：那是工作場所、幾秒、很少見的情形（最多約千分之一到千分之四的紅燈）。本站不寫。', 'No "exceeds the NIOSH limit" without "workplace ceiling, for seconds, in rare conditions (at most about 0.1–0.4 % of reds)". This site does not print it.'),
    why: t('statements.json 不可說的第 8 條。', 'Must-not 8 of statements.json.'),
    patterns: { 'zh-TW': ['NIOSH[^。]{0,30}(上限|一氧化碳|ppm)', '職業(安全|暴露)?上限'], en: ['NIOSH[^.]{0,60}(ceiling|limit|carbon monoxide|ppm)', 'workplace (ceiling|limit)'] },
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[7]',
  },
  'sim-no-children-twice-co': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不可說小孩吸進的一氧化碳是大人的兩倍。', 'Never say children breathe twice as much carbon monoxide.'),
    instead: t('推估：風從機車吹來時，嬰兒車高度的空氣和大人鼻子差不多到兩倍；不是每種風都這樣。', 'Estimate: with the wind from the scooters, the air at pushchair height gets between about the same as an adult\'s nose and about twice as much; not in every wind.'),
    why: t('statements.json 不可說的第 10 條。', 'Must-not 10 of statements.json.'),
    patterns: { 'zh-TW': ['(?<!不是說)小孩[^。]{0,15}一氧化碳[^。]{0,10}(兩倍|二倍)', '(?<!不是說)小孩[^。]{0,10}(兩倍|二倍)[^。]{0,8}一氧化碳'], en: ['(?<!claim that )children[^.]{0,30}(twice|two times)[^.]{0,20}carbon monoxide'] },
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[9]',
  },
  'sim-no-canyon-lower': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不可說兩邊有高樓的街，路邊吸到的比較少；也不可說機車越多、風越小，吸到的越少。', 'Never say streets between tall buildings lower kerb exposure, or that a bigger pack in calmer air gives less exposure.'),
    instead: t('兩邊有高樓的街，這次算得不準，不拿來下結論。', 'Streets between tall buildings were not settled this time; we draw no conclusion from them.'),
    why: t('statements.json 不可說的第 6 條：那幾次的進風方式讓數字可能低了 2 到 5 倍。', 'Must-not 6 of statements.json: how air was fed into those runs probably made them read 2 to 5 times low.'),
    patterns: { 'zh-TW': ['高樓[^。]{0,25}(比較少|較低|少吸|比較淡)'], en: ['(street canyons?|tall buildings)[^.]{0,50}\\b(lower|less)\\b'] },
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[5]',
  },
  'sim-no-arcade-trap-or-clean': {
    kind: 'do-not-claim',
    topic: 'simulation',
    rule: t('不可說騎樓會把廢氣困住，也不可說騎樓裡安全或乾淨。', 'Never say arcades trap exhaust, or that arcades are safe or clean.'),
    instead: t('推估：風從機車吹向騎樓時，走進騎樓 1 到 3 公尺，一氧化碳比路邊少，但不是乾淨的空氣；很多個紅燈連著會怎樣，沒有算。', 'Estimate: with the wind toward the arcade, 1 to 3 metres inside it there is less carbon monoxide than at the kerb, but the air is not clean; many reds in a row were not simulated.'),
    why: t('statements.json 不可說的第 7 條。', 'Must-not 7 of statements.json.'),
    patterns: { 'zh-TW': ['騎樓[^。]{0,12}(困住|悶住|積在|安全|很乾淨|是乾淨)'], en: ['arcades?[^.]{0,30}\\b(trap|safe|clean air)\\b'] },
    sources: ['scooterair-simulation-2026'],
    research: 'research/simulation/statements.json (signed 2026-11-27) mustNot[6]',
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
