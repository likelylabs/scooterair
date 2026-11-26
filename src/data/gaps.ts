// Evidence gaps as first-class entries. The site treats "nobody has measured this" as part of
// its argument: a gap is stated in the active voice, carries the searches behind it, and says
// what would close it and who could do the measuring.
//
//   import { gapsForLink, localizeGap } from '@/data';
//   gapsForLink(3).map((g) => localizeGap(g, locale));
//
// Rules: a gap must come from a `gaps` list or a "not found" verdict in a research file
// (`research` names it); `searchedOn` is the date of the search; `closest` points at the
// nearest evidence the registry does hold, so a page can show what we have next to what we
// do not. scripts/check-data.mjs validates every entry.

import type { ChainLink, L10n, Locale } from './types.ts';
import { chainLinkLabels, t } from './types.ts';
import type { SourceId } from './sources.ts';
import type { FactId } from './facts.ts';
import type { SeriesId } from './series.ts';

export interface EvidenceGapInput {
  chainLink: ChainLink;
  /** Short title for a list. */
  title: L10n;
  /** The gap, in the active voice: who has not measured what. */
  statement: L10n;
  /** Why the chain needs this link measured. */
  whyItMatters: L10n;
  /** What study would close it. */
  wouldClose: L10n;
  /**
   * Who could do the measuring, and with what: always our proposal, worded as one ("我們提議…" /
   * "We propose…"). Pages print it after the gap.
   */
  whoCouldMeasure: L10n;
  /** Internal note for editors (English). Never rendered. */
  editorNote?: string;
  /** Nearest evidence the registry holds. */
  closest?: { facts?: FactId[]; series?: SeriesId[] };
  /** Sources whose own limitations sections document the absence. */
  sources?: SourceId[];
  /** ISO date of the search behind the gap. */
  searchedOn: string;
  /** Research file and the gap list or finding the gap comes from. */
  research: string;
}

/** Reader-facing badge for a gap (the site voice, not a registry evidence type). */
export const gapBadge = t('沒人量過', 'Nobody has measured this');

/** Label for the "who could measure it" line: every entry is a proposal by the site. */
export const whoCouldMeasureLabel = t('誰量得出來（本站提議）', 'Who could measure it (our proposal)');

const SEARCHED = '2026-11-25';

export const gaps = {
  'gap-pedestrian-red-light-exposure': {
    chainLink: 3,
    title: t('紅燈旁的行人吸進什麼', 'What pedestrians breathe beside a red-light pack'),
    statement: t(
      '沒有人量過在台灣的紅燈前，站在一群怠速機車旁的行人吸進了什麼：PM2.5、一氧化碳、苯都沒有。',
      'Nobody has measured what pedestrians breathe beside a pack of idling scooters at a Taiwanese red light: not PM2.5, not carbon monoxide, not benzene.',
    ),
    whyItMatters: t(
      '這是整條證據鏈中最關鍵的一環；現有的台灣研究量的是騎士、通勤者、測站或模式，沒有一項量到等紅燈的行人。',
      'It is the central link of the chain; existing Taiwanese studies measured riders, commuters, stations or models, and none measured pedestrians waiting at a light.',
    ),
    wouldClose: t(
      '讓行人在路口配戴個人監測器，同時量一氧化碳、苯系物、超細微粒與PM2.5，並分開紅燈與綠燈時段、停等區與斑馬線的位置。',
      'Personal monitors on pedestrians at Taiwanese crossings measuring CO, BTEX, ultrafine particles and PM2.5 together, split by red and green phase and by position relative to the stop box and crosswalk.',
    ),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局，或大學的公共衛生、環境工程團隊，在機車多的路口行人等候處，於嬰兒車高度與成人高度放置可攜式超細微粒計數器、一氧化碳分析儀與苯系物採樣器，逐秒記錄並對上紅燈與綠燈，另設一個遠離路口的對照點。',
      'We propose that a city environmental protection bureau, or a university public-health or environmental-engineering group, place portable ultrafine particle counters, carbon monoxide analysers and BTEX samplers where pedestrians wait at scooter-heavy crossings, at stroller and adult height, logging second by second against the red and green phases, with a control point away from the junction.',
    ),
    closest: {
      facts: ['wu2021-station-correlation', 'idle-motorcycle-pm25-wang2021', 'commute-walking-wang2021', 'iot-summer-background-2024', 'signal-cycle-peaks-international'],
      series: ['commute-pm25-wang2021', 'wu2021-station-correlation'],
    },
    sources: ['wu-2021-trd', 'wang-2021-atmosphere'],
    searchedOn: SEARCHED,
    research: 'redlight/intersection-peaks (gaps); redlight/vulnerable-groups (gaps); papers/wu-2021-trd (limitations: BTEX integrated over rides, red lights not evaluable)',
  },
  'gap-odorants': {
    chainLink: 4,
    title: t('機車廢氣聞起來是什麼', 'What makes scooter exhaust smell'),
    statement: t(
      '沒有人找出機車廢氣氣味的主要物質；醛類是可能的候選，但沒有研究證實。',
      'Nobody has identified the main odorants of scooter exhaust; aldehydes are plausible candidates, but no study confirms it.',
    ),
    whyItMatters: t('氣味是行人最直接的感受；但不知道聞到的是什麼，氣味就無法告訴你危害有多大。', 'The smell is what pedestrians notice first; without knowing what it is, the smell cannot be read as a measure of harm.'),
    wouldClose: t('對台灣機車的怠速廢氣做氣味分析（氣相層析搭配嗅覺偵測），並量測醛類、丙烯醛與1,3-丁二烯。', 'Odour analysis of Taiwanese scooter idle exhaust (gas chromatography with olfactometry), plus measurement of aldehydes, acrolein and 1,3-butadiene.'),
    whoCouldMeasure: t(
      '我們提議由具排放測試設備的大學實驗室或車輛研究測試中心，採集台灣常見機車的怠速廢氣，以氣相層析搭配嗅覺偵測找出主要氣味物質。',
      'We propose that a university emissions laboratory or the Automotive Research and Testing Center sample idle exhaust from common Taiwanese scooters and identify the main odorants by gas chromatography with olfactometry.',
    ),
    closest: { facts: ['odour-thresholds', 'scooter-exhaust-carbonyls', 'co-odourless'], series: ['odour-thresholds'] },
    searchedOn: SEARCHED,
    research: 'redlight/smell-chemistry (doNotClaim; gaps: Taiwanese scooter acrolein and 1,3-butadiene emission factors)',
  },
  'gap-idle-emission-rate': {
    chainLink: 2,
    title: t('台灣機車的怠速排放率', 'Idle emission rate of a Taiwanese scooter'),
    statement: t(
      '沒有人量過台灣機車怠速時每小時排放多少一氧化碳、碳氫化合物與氮氧化物；現有的怠速排放率來自越南河內的實驗室。',
      'Nobody has measured how much carbon monoxide, hydrocarbon and nitrogen oxide a Taiwanese scooter emits per hour at idle; the only idle rates come from a Hanoi laboratory.',
    ),
    whyItMatters: t('紅燈的場景就是一群機車在怠速；沒有台灣的怠速排放率，就無法估算路口排出多少。', 'The red-light scene is a pack of idling scooters; without a Taiwanese idle rate, how much a junction receives cannot be estimated.'),
    wouldClose: t('在底盤動力計上單獨量測台灣常見機車（第五至第七期）的怠速排放，以克／小時表示。', 'Separate idle measurements, in grams per hour, of common Taiwanese scooters (Phases 5–7) on a chassis dynamometer.'),
    whoCouldMeasure: t(
      '我們提議由環境部委託的檢測實驗室、車輛研究測試中心或大學實驗室，在底盤動力計上單獨量測台灣常見機車的怠速排放，以克／小時公布。',
      'We propose that a test laboratory commissioned by the environment ministry, the Automotive Research and Testing Center or a university laboratory measure the idle emissions of common Taiwanese scooters separately on a chassis dynamometer and publish them in grams per hour.',
    ),
    closest: { facts: ['idle-rate-hanoi-nguyen2021', 'idle-test-limits', 'idle-pn-chien-huang-2010'] },
    searchedOn: SEARCHED,
    research: 'redlight/idle-emissions (gaps: no Taiwanese per-scooter idle emission rate)',
  },
  'gap-pull-away-spike': {
    chainLink: 2,
    title: t('綠燈起步的排放高峰', 'The pull-away spike at green'),
    statement: t(
      '沒有人量化機車在綠燈起步時的排放高峰；國外研究的路口高峰來自汽車與柴油車。',
      'Nobody has quantified a scooter\'s emission spike when the light turns green; the junction peaks measured abroad come from cars and diesels.',
    ),
    whyItMatters: t('國外研究顯示路口最高峰出現在起步而非怠速，所以紅燈場景的重點可能在綠燈那一秒。', 'Studies abroad put the highest junction peaks at pull-away rather than idle, so the red-light scene may peak at the second it turns green.'),
    wouldClose: t('以車載排放量測系統或路邊快速儀器，記錄機車車陣在綠燈起步時的排放與濃度。', 'On-board emission measurement or fast roadside instruments recording a scooter pack\'s emissions and concentrations as it pulls away.'),
    whoCouldMeasure: t(
      '我們提議由環境部委託的車輛測試實驗室，以車載排放量測系統記錄機車起步時的排放；或由大學團隊在路口以快速反應的路邊儀器，記錄車陣在綠燈亮起後幾秒內的濃度變化。',
      'We propose that a vehicle-testing laboratory commissioned by the environment ministry record scooter emissions at pull-away with on-board measurement systems, or that a university group use fast-response roadside instruments to record how concentrations change in the seconds after a pack moves off at green.',
    ),
    closest: { facts: ['signal-cycle-peaks-international', 'idle-time-vs-acceleration-seedam2017'] },
    searchedOn: SEARCHED,
    research: 'redlight/idle-emissions (gaps: no quantitative green-light pull-away spike for scooters)',
  },
  'gap-scooters-per-red-light': {
    chainLink: 2,
    title: t('每個紅燈停多少機車', 'How many scooters queue per red light'),
    statement: t(
      '沒有公開資料記錄台灣路口每個紅燈停等多少機車，也沒有行人等候紅燈的時間。',
      'No published data record how many scooters queue at each red light at Taiwanese junctions, nor how long pedestrians wait.',
    ),
    whyItMatters: t('車陣的大小決定路口排出多少；沒有這個數字，我們畫的路口場景是示意圖，不是實際的車數。', 'The size of the pack sets how much a junction receives; without it, the scene can only be illustrative.'),
    wouldClose: t('在台北、新北、台中與高雄的代表性路口，以錄影計算每個號誌週期的停等機車數與行人等候時間。', 'Video counts of scooters queued per signal cycle and pedestrian waiting times at representative junctions in Taipei, New Taipei, Taichung and Kaohsiung.'),
    whoCouldMeasure: t(
      '我們提議由各縣市交通局或交通部運輸研究所，在代表性路口以錄影計算每個號誌週期的停等機車數與行人等候時間，並公開資料。',
      'We propose that city transport departments or the MOTC Institute of Transportation count scooters queued per signal cycle and pedestrian waiting times on video at representative junctions, and publish the data.',
    ),
    closest: { facts: ['marking-rules-turn-box', 'tunnel-motorcycles-co-ting2023'] },
    searchedOn: SEARCHED,
    research: 'redlight/intersection-peaks (gaps: scooters queued per red light and pedestrian red times unpublished)',
  },
  'gap-brief-exposure-harm': {
    chainLink: 5,
    title: t('在怠速機車旁幾分鐘的影響', 'Harm from a few minutes beside idling scooters'),
    statement: t(
      '沒有研究顯示在怠速機車旁站幾分鐘會造成健康傷害；現有證據是一小時的通勤或兩小時的步行。',
      'No study shows harm from a few minutes beside idling scooters; the existing evidence covers a one-hour commute or a two-hour walk.',
    ),
    whyItMatters: t('紅燈只有幾十秒到兩三分鐘；短暫暴露的後果不能從長時間的研究直接推論。', 'A red light lasts tens of seconds to a few minutes; the effect of brief exposure cannot be inferred directly from longer studies.'),
    wouldClose: t('以穿戴式感測器與心率變異度等指標，研究路口短暫高峰前後的即時生理變化。', 'Wearable-sensor studies of immediate physiological changes, such as heart rate variability, around short peaks at crossings.'),
    whoCouldMeasure: t(
      '我們提議由大學的公共衛生團隊做志願者研究：配戴穿戴式微粒與一氧化碳感測器，同時記錄心率變異度與血壓，比較在路口等紅燈前後幾分鐘的變化。',
      'We propose a volunteer study by a university public-health group: wearable particle and carbon monoxide sensors worn alongside heart rate variability and blood pressure recording, comparing the minutes before and after waiting at a red light.',
    ),
    closest: { facts: ['chuang2020-cardiovascular-association', 'lung2025-peaks-hrv', 'mccreanor2007-london-walk'] },
    searchedOn: SEARCHED,
    research: 'redlight/acute-health (doNotClaim; gaps)',
  },
  'gap-tw-health-isolating-scooters': {
    chainLink: 5,
    title: t('只看機車廢氣的台灣健康研究', 'A Taiwanese health study isolating scooter exhaust'),
    statement: t(
      '沒有任何台灣的健康研究把機車廢氣和其他交通或其他污染來源分開；所有研究用的都是測站、模式或所有來源的PM2.5。',
      'No Taiwanese health study separates scooter exhaust from other traffic or other sources; every one uses station, modelled or all-source PM2.5.',
    ),
    whyItMatters: t('所以現有的台灣研究看到的是「與交通污染有關」，還沒有一項研究看到「與機車廢氣有關」。', 'So Taiwanese studies so far show associations with traffic pollution as a whole; none has looked at scooter exhaust on its own.'),
    wouldClose: t('以機車流量或機車專屬的排放指標作為暴露，研究健康結果；或做來源解析，把機車與其他車種分開。', 'Health studies using scooter flow or scooter-specific emission markers as the exposure, or source apportionment that separates scooters from other vehicles.'),
    whoCouldMeasure: t(
      '我們提議由大學的公共衛生與流行病學團隊，把各地機車流量或環境部的來源解析結果當作暴露指標，與既有的台灣健康世代資料連結分析。',
      'We propose that university public-health and epidemiology groups use local scooter traffic counts, or the environment ministry\'s source-apportionment results, as the exposure measure and link them to existing Taiwanese health cohorts.',
    ),
    closest: { facts: ['guo1999-asthma-survey', 'mj-cohort-mortality-guo2021', 'pan2021-truck-traffic-cvd'] },
    searchedOn: SEARCHED,
    research: 'redlight/vulnerable-groups (summary and doNotClaim); redlight/long-term-traffic (gaps: no traffic or scooter share of PM2.5 deaths)',
  },
  'gap-tw-child-height': {
    chainLink: 6,
    title: t('台灣的兒童高度量測', 'Child-height measurement in Taiwan'),
    statement: t(
      '沒有人在台灣量過兒童或嬰兒推車高度的空氣；現有的研究都在英國、西班牙、德國與美國。',
      'Nobody has measured air at child or pram height in Taiwan; all existing studies are from the UK, Spain, Germany and the US.',
    ),
    whyItMatters: t('台灣的排氣管是機車，國外的結果主要來自汽車與柴油車，不能直接套用。', 'In Taiwan the tailpipes are scooters; results abroad come mostly from cars and diesels and cannot be transferred directly.'),
    wouldClose: t('在台灣路口與人行道同時量測0.6、1.0與1.6公尺高度的超細微粒、一氧化碳與苯系物。', 'Simultaneous measurements at 0.6, 1.0 and 1.6 m of ultrafine particles, CO and BTEX at Taiwanese crossings and pavements.'),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局或大學團隊，在台灣路口與人行道上，同時在0.6、1.0與1.6公尺高度放置超細微粒計數器、一氧化碳分析儀與苯系物採樣器。',
      'We propose that a city environmental protection bureau or a university group place ultrafine particle counters, carbon monoxide analysers and BTEX samplers at 0.6, 1.0 and 1.6 m at the same time at Taiwanese crossings and pavements.',
    ),
    closest: { facts: ['stroller-height-review', 'pram-height-sharma2020', 'child-height-harr2022', 'first-metre-sharma-kumar-2018'], series: ['stroller-height-studies'] },
    searchedOn: SEARCHED,
    research: 'redlight/vulnerable-groups (doNotClaim: children closer to the tailpipe with a number); 03 §5',
  },
  'gap-school-commute-pillion': {
    chainLink: 6,
    title: t('上學途中與機車後座的兒童', 'Children on the school run and on the pillion'),
    statement: t(
      '沒有人量過台灣兒童上學途中、在校門口或坐在機車後座時吸入的空氣。',
      'Nobody has measured what Taiwanese children breathe on the way to school, at the school gate or riding pillion on a scooter.',
    ),
    whyItMatters: t('國外研究顯示每分鐘劑量以交通途中最高；台灣許多孩子是坐機車上學。', 'Studies abroad find dose per minute highest in transport; many Taiwanese children ride to school on a scooter.'),
    wouldClose: t('為學童配戴個人監測器，記錄上學方式、時間與地點。', 'Personal monitors on schoolchildren with records of travel mode, time and place.'),
    whoCouldMeasure: t(
      '我們提議由大學的公共衛生團隊，和學校、家長會一起，讓學童在上學途中配戴個人監測器，並記錄上學方式、時間與地點，坐機車後座的孩子也包括在內。',
      'We propose that a university public-health group, working with schools and parents\' associations, give schoolchildren personal monitors for the journey to school and record travel mode, time and place, including children who ride pillion.',
    ),
    closest: { facts: ['boniardi2021-dose-share', 'who-children-vulnerable'] },
    searchedOn: SEARCHED,
    research: 'redlight/vulnerable-groups (gaps: school-gate and school-commute exposure in Taiwan not found)',
  },
  'gap-electrification-street-air': {
    chainLink: 7,
    title: t('電動化後的街道空氣', 'Street air after electrification'),
    statement: t(
      '沒有任何台灣研究量過機車電動化之後街道空氣變得多乾淨，也沒有找到台灣或亞洲的健康效益估計。',
      'No Taiwanese study has measured how much cleaner street air becomes after scooter electrification, and no Taiwanese or Asian health-benefit estimate was found.',
    ),
    whyItMatters: t('「電動機車沒有排氣管」是確定的；但對路口空氣與健康的實際好處還沒有人量過。', '"An electric scooter has no tailpipe" is settled; the actual benefit for crossing air and health has not been measured.'),
    wouldClose: t('在電動機車比例差異大的路口或時期，做前後或對照的路邊量測。', 'Before-and-after or matched roadside measurements at junctions or times with very different electric shares.'),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局與大學的環境工程團隊，在電動機車比例差異大的路口或時期，用同樣的路邊儀器量測超細微粒、一氧化碳與苯系物，做前後或對照比較。',
      'We propose that city environmental protection bureaus and university environmental-engineering groups measure ultrafine particles, carbon monoxide and BTEX with the same roadside instruments at junctions or times with very different electric shares, before and after or side by side.',
    ),
    closest: { facts: ['teds13-electric-mc-pm25', 'weiss2015-e2w-review', 'ufp-traffic-cut-chang2026'] },
    sources: ['wu-2021-trd', 'chang-hsiao-2026-jhm'],
    searchedOn: SEARCHED,
    research: 'redlight/long-term-traffic (gaps: no Taiwanese or Asian electrification health benefit estimate); papers/wu-2021-trd (no gasoline-vs-electric comparison)',
  },
  'gap-roadside-co-vs-who': {
    chainLink: 3,
    title: t('路邊一氧化碳與WHO短期值', 'Kerbside carbon monoxide against WHO short-term values'),
    statement: t(
      '沒有人量過台灣路口的一氧化碳，並與WHO的15分鐘或1小時指引值比較；也沒有路邊碳氧血紅素的資料。',
      'Nobody has measured carbon monoxide at Taiwanese crossings against WHO\'s 15-minute or 1-hour guideline values, and there are no kerbside carboxyhaemoglobin data.',
    ),
    whyItMatters: t('機車排放全國約15%的一氧化碳，但路口濃度是否接近危害程度沒有證據。', 'Scooters emit about 15% of the country\'s carbon monoxide, but there is no evidence on whether crossing concentrations come near harmful levels.'),
    wouldClose: t('在路口行人位置以校正過的儀器連續量測一氧化碳。', 'Continuous carbon monoxide measurement with calibrated instruments where pedestrians stand.'),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局或環境部，在路口行人位置以校正過的連續式一氧化碳分析儀量測，並以WHO的15分鐘與1小時指引值比較。',
      'We propose that city environmental protection bureaus or the environment ministry measure carbon monoxide continuously with calibrated analysers where pedestrians stand, and compare the results with WHO\'s 15-minute and 1-hour guideline values.',
    ),
    closest: { facts: ['teds13-mc-co-share', 'co-odourless', 'who-no2-co-guideline'] },
    searchedOn: SEARCHED,
    research: 'redlight/acute-health (gaps: Taiwan roadside CO vs WHO; carboxyhaemoglobin)',
  },
  'gap-high-emitter-share': {
    chainLink: 1,
    title: t('最髒的機車占多少排放', 'How much the dirtiest scooters emit'),
    statement: t(
      '沒有人用遙測量過台灣路上的機車，因此不知道最髒的一小部分機車占多少排放。',
      'Nobody has used roadside remote sensing on Taiwanese scooters, so the share of emissions from the dirtiest few is unknown.',
    ),
    whyItMatters: t('如果少數車占大部分排放，抓出高污染車會比全面汰換更有效。', 'If a few scooters emit most, finding high emitters could matter more than replacing everything.'),
    wouldClose: t('在路邊以遙測儀器量測大量行經的機車。', 'Roadside remote sensing of large numbers of passing scooters.'),
    whoCouldMeasure: t(
      '我們提議由環境部或各縣市環保局，在路邊以遙測設備量測大量行經的機車，找出最髒的一小部分機車占多少排放。',
      'We propose that the environment ministry or city environmental protection bureaus use roadside remote sensing on large numbers of passing scooters to find what share of emissions comes from the dirtiest few.',
    ),
    closest: { facts: ['inspection-2025', 'tsai2026-three-scooter-case'] },
    searchedOn: SEARCHED,
    research: 'redlight/idle-emissions (gaps: no Taiwanese scooter remote-sensing study)',
  },
  'gap-idling-rule-scooters': {
    chainLink: 2,
    title: t('怠速規定管不管機車', 'Whether the idling rule reaches scooters'),
    statement: t(
      '沒有找到官方解釋說明怠速規定是否適用於機車，或號誌停等是否算「停車怠速等候」。',
      'No official interpretation was found on whether the idling rule applies to scooters, or whether a signal wait counts as waiting while stopped.',
    ),
    whyItMatters: t('現行的怠速規定管的是停車等候超過三分鐘的車；一個普通的紅燈，不在它要管的範圍裡。這條規定是否適用於機車，沒有官方解釋可以回答。', 'The current idling rule covers vehicles waiting more than three minutes; an ordinary red light is not what it is written for. Whether it reaches scooters at all, no official interpretation says.'),
    wouldClose: t('環境部對機車與號誌停等的正式函釋。', 'A formal MOENV interpretation covering scooters and signal waits.'),
    whoCouldMeasure: t(
      '這一格要的不是量測，是一份正式解釋。我們提議由環境部發布函釋，說明怠速規定是否適用於機車，以及號誌停等是否算在內。',
      'This one needs a formal interpretation, not a measurement. We propose that the environment ministry issue a ruling on whether the idling rule covers scooters and whether waiting at a signal counts.',
    ),
    closest: { facts: ['idling-regulation', 'apca-idling-fine'] },
    searchedOn: SEARCHED,
    research: 'redlight/policy-idling#idling-regulation-text (caveats: interpretive, not resolved)',
  },
} satisfies Record<string, EvidenceGapInput>;

export type GapId = keyof typeof gaps;
export type EvidenceGap = EvidenceGapInput & { id: GapId };

export const gapList: EvidenceGap[] = (Object.entries(gaps) as [GapId, EvidenceGapInput][]).map(([id, g]) => ({ id, ...g }));

export function gap(id: GapId): EvidenceGap {
  const g = (gaps as Record<string, EvidenceGapInput>)[id];
  if (!g) throw new Error(`[data] Unknown gap id "${id}"`);
  return { id, ...g };
}

export function gapsForLink(link: ChainLink): EvidenceGap[] {
  return gapList.filter((g) => g.chainLink === link);
}

export interface LocalizedGap {
  id: GapId;
  chainLink: ChainLink;
  linkLabel: string;
  badge: string;
  title: string;
  statement: string;
  whyItMatters: string;
  wouldClose: string;
  /** Who could measure it: always the site's proposal (see `whoIsProposal`). */
  whoCouldMeasure: string;
  /** Always true: every "who could measure it" line is a proposal by the site, not a commitment by anyone named. */
  whoIsProposal: true;
  /** Label for the line, e.g. '誰量得出來（本站提議）'. */
  whoLabel: string;
  closest: { facts: FactId[]; series: SeriesId[] };
  searchedOn: string;
}

export function localizeGap(idOrGap: GapId | EvidenceGap, locale: Locale): LocalizedGap {
  const g = typeof idOrGap === 'string' ? gap(idOrGap) : idOrGap;
  return {
    id: g.id,
    chainLink: g.chainLink,
    linkLabel: chainLinkLabels[g.chainLink].short[locale],
    badge: gapBadge[locale],
    title: g.title[locale],
    statement: g.statement[locale],
    whyItMatters: g.whyItMatters[locale],
    wouldClose: g.wouldClose[locale],
    whoCouldMeasure: g.whoCouldMeasure[locale],
    whoIsProposal: true,
    whoLabel: whoCouldMeasureLabel[locale],
    closest: { facts: g.closest?.facts ?? [], series: g.closest?.series ?? [] },
    searchedOn: g.searchedOn,
  };
}
