// Evidence gaps as first-class entries. A gap says exactly what has been measured and what is
// still missing (never "nobody has measured" when something partly answers it), carries the
// searches behind it, and says what would close it and who could do the measuring.
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
  /** The gap: what has been measured (with the figures the registry holds) and what is still missing. */
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
export const gapBadge = t('證據缺口', 'Evidence gap');

/** Label for the "who could measure it" line: every entry is a proposal by the site. */
export const whoCouldMeasureLabel = t('誰量得出來（本站提議）', 'Who could measure it (our proposal)');

const SEARCHED = '2026-11-25';

export const gaps = {
  'gap-pedestrian-red-light-exposure': {
    chainLink: 3,
    title: t('紅燈旁的行人吸進什麼', 'What pedestrians breathe beside a red-light pack'),
    statement: t(
      '在台灣，行人等紅燈的地方已經量過PM2.5和一氧化碳：交通部運輸研究所在10處路口的行人等候區，把感測器裝在離地1.2至1.5公尺，每分鐘記錄一筆，每處48小時。2024年7月在其中6處，等候區的PM2.5大多不超過每立方公尺14微克，一氧化碳的最高值約0.5至1.3 ppm。還沒有公開的是：跟著紅燈和綠燈逐秒記錄、緊鄰一整排怠速機車的數據，機車在其中占多少，路邊的苯和超細微粒，以及嬰兒車高度的量測。',
      'PM2.5 and carbon monoxide have been measured where pedestrians wait in Taiwan: the transport ministry\'s Institute of Transportation put sensors at 1.2–1.5 m in the pedestrian waiting areas of 10 intersections, logging once a minute for 48 hours at each. At six of them in July 2024, waiting-area PM2.5 was mostly no higher than 14 µg/m³, and carbon monoxide peaked at about 0.5–1.3 ppm. What has not been published: a second-by-second record through the red and green phases right beside a queue of idling scooters, the scooters\' share of what is breathed there, kerbside benzene and ultrafine particles, and measurements at stroller height.',
    ),
    whyItMatters: t(
      '這是整條證據鏈中最關鍵的一環。運研所的感測器量的是整天、所有來源的空氣，而且是在夏天濃度偏低的時候；報告沒有把讀數分成紅燈與綠燈，也沒有分出機車的貢獻。其他台灣研究量的是騎士、通勤者、測站或模式。',
      'It is the central link of the chain. The Institute\'s sensors recorded all-source air over whole days, in summer when levels are low; the report does not split the readings by red and green phase or separate the scooters\' share. Other Taiwanese studies measured riders, commuters, stations or models.',
    ),
    wouldClose: t(
      '請行人在路口戴上個人監測器，同時量一氧化碳、苯類（BTEX）、超細微粒和PM2.5；紅燈和綠燈分開看，停等區旁和斑馬線旁也分開看。',
      'Personal monitors on pedestrians at Taiwanese crossings measuring CO, benzene-family compounds (BTEX), ultrafine particles and PM2.5 together, split by red and green phase and by position relative to the stop box and crosswalk.',
    ),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局，或大學的公衛、環工團隊來量。地點是機車多的路口、行人等紅燈的位置。嬰兒車和大人兩種高度各放一組可攜式儀器，量超細微粒、一氧化碳和苯類。逐秒記錄，對上紅燈和綠燈；另外在遠離路口的地方設一個對照點。',
      'We propose that a city environmental protection bureau, or a university public-health or environmental-engineering group, does the measuring. The place: where pedestrians wait at scooter-heavy crossings. At stroller height and adult height, one set of portable instruments each: an ultrafine particle counter, a carbon monoxide analyser and a BTEX sampler. Log second by second against the red and green phases, with a control point away from the junction.',
    ),
    editorNote: 'Rewritten 2026-11-26: PM2.5 and CO HAVE been measured at Taiwanese pedestrian waiting areas (IOT-113-TB006, PDF re-opened 2026-11-26, pp.2-24–2-26, 3-54–3-65; facts iot-waiting-area-pm25-2024, iot-waiting-area-co-2024). Never write "nobody has measured PM2.5 or CO" for this gap. An NCU thesis on black carbon and ultrafine particles at traffic lights with scooters exists but was not opened (02 §4). The red-light sweep could not open the IOT report (intersection-peaks gaps 0-1), so its "not found" on kerbside PM2.5/CO is superseded; its narrower finding (nothing by red vs green phase, no BTEX/UFP) stands.',
    closest: {
      facts: ['iot-waiting-area-pm25-2024', 'iot-waiting-area-co-2024', 'iot-study-design', 'iot-setback-measured', 'iot-summer-background-2024', 'wu2021-station-correlation', 'idle-motorcycle-pm25-wang2021', 'commute-walking-wang2021', 'signal-cycle-peaks-international'],
      series: ['commute-pm25-wang2021', 'wu2021-station-correlation'],
    },
    sources: ['iot-2025-intersection-air-quality', 'wu-2021-trd', 'wang-2021-atmosphere'],
    searchedOn: SEARCHED,
    research: '02 §1a (IOT-113-TB006 measured PM2.5 and CO at waiting areas; PDF re-opened 2026-11-26); redlight/intersection-peaks (gaps 2: nothing by red vs green phase, no BTEX/UFP at kerb); redlight/vulnerable-groups (gaps); papers/wu-2021-trd (limitations: BTEX integrated over rides, red lights not evaluable)',
  },
  'gap-odorants': {
    chainLink: 4,
    title: t('機車廢氣聞起來是什麼', 'What makes scooter exhaust smell'),
    statement: t(
      '機車廢氣裡有哪些成分，台灣已經量過：底盤動力計測試列出以異戊烷、甲基戊烷和甲苯為主的揮發性有機物，以及甲醛、乙醛等醛類。還沒有研究找出哪幾種是我們聞到的味道的主要來源；醛類只是依嗅覺門檻推出來的候選，台灣機車的丙烯醛與1,3-丁二烯排放也還沒有量過。',
      'What scooter exhaust contains has been measured in Taiwan: dynamometer tests list volatile organic compounds led by isopentane, methylpentanes and toluene, plus aldehydes such as formaldehyde and acetaldehyde. No study has yet identified which of them make the smell; aldehydes are only candidates inferred from odour thresholds, and acrolein and 1,3-butadiene emissions from Taiwanese scooters have not been measured.',
    ),
    whyItMatters: t('氣味是行人最直接的感受；但不知道聞到的是什麼，氣味就無法告訴你危害有多大。', 'The smell is what pedestrians notice first; without knowing what it is, the smell cannot be read as a measure of harm.'),
    wouldClose: t('對台灣機車的怠速廢氣做氣味分析（氣相層析搭配嗅覺偵測），並量測醛類、丙烯醛與1,3-丁二烯。', 'Odour analysis of Taiwanese scooter idle exhaust (gas chromatography with olfactometry), plus measurement of aldehydes, acrolein and 1,3-butadiene.'),
    whoCouldMeasure: t(
      '我們提議由有排放測試設備的大學實驗室，或車輛研究測試中心來做：採集台灣常見機車的怠速廢氣，用氣相層析搭配嗅覺偵測，找出主要的氣味物質。',
      'We propose that a university emissions laboratory or the Automotive Research and Testing Center sample idle exhaust from common Taiwanese scooters and identify the main odorants by gas chromatography with olfactometry.',
    ),
    editorNote: 'The 2003 speciation is of old Phase 3 machines over the whole driving cycle, with no idle-only data (redlight/smell-chemistry#tsai2003-speciation).',
    closest: { facts: ['scooter-exhaust-carbonyls', 'odour-thresholds', 'co-odourless'], series: ['odour-thresholds'] },
    searchedOn: SEARCHED,
    research: 'redlight/smell-chemistry (doNotClaim; gaps: Taiwanese scooter acrolein and 1,3-butadiene emission factors)',
  },
  'gap-idle-emission-rate': {
    chainLink: 2,
    title: t('台灣機車的怠速排放率', 'Idle emission rate of a Taiwanese scooter'),
    statement: t(
      '台灣有的是怠速排氣裡的濃度：定檢的怠速合格上限、中部1996至2002年的定檢紀錄、一項機車怠速微粒數量的測試；另外還有包含怠速段在內、整個行車型態的每公里排放。我們沒有找到台灣機車怠速時每小時排放多少一氧化碳、碳氫化合物與氮氧化物（克／小時）的量測；現有的怠速排放率來自越南河內的實驗室。',
      'What Taiwan has are concentrations in idle exhaust: the inspection pass limits at idle, central Taiwan\'s inspection records for 1996–2002 and one test of particle numbers at idle; there are also per-km emissions over whole driving cycles that include idle segments. We found no measured rate, in grams per hour, of the carbon monoxide, hydrocarbons and nitrogen oxides a Taiwanese scooter emits at idle; the only idle rates come from a Hanoi laboratory.',
    ),
    whyItMatters: t('紅燈的場景就是一群機車在怠速；沒有台灣的怠速排放率，就無法估算路口排出多少。', 'The red-light scene is a pack of idling scooters; without a Taiwanese idle rate, how much a junction receives cannot be estimated.'),
    wouldClose: t('在底盤動力計上單獨量測台灣常見機車（第五至第七期）的怠速排放，以克／小時表示。', 'Separate idle measurements, in grams per hour, of common Taiwanese scooters (Phases 5–7) on a chassis dynamometer.'),
    whoCouldMeasure: t(
      '我們提議由環境部委託的檢測實驗室、車輛研究測試中心或大學實驗室，在底盤動力計上單獨量測台灣常見機車的怠速排放，以克／小時表示並公開。',
      'We propose that a test laboratory commissioned by the environment ministry, the Automotive Research and Testing Center or a university laboratory measure the idle emissions of common Taiwanese scooters separately on a chassis dynamometer and publish them in grams per hour.',
    ),
    editorNote: 'Found-not, not proven absent: the full texts of the Taiwanese dynamometer papers (AAQR, JAWMA, Results in Engineering) were not opened, and their ECE/WMTC cycles include idle segments that may be reported there (redlight/idle-emissions gaps 0 and 7).',
    closest: { facts: ['idle-rate-hanoi-nguyen2021', 'idle-test-limits', 'two-stroke-idle-hc-lin2006', 'idle-pn-chien-huang-2010', 'phase-ratios-tsai2017'] },
    searchedOn: SEARCHED,
    research: 'redlight/idle-emissions (gaps: no Taiwanese per-scooter idle emission rate)',
  },
  'gap-pull-away-spike': {
    chainLink: 2,
    title: t('綠燈起步的排放高峰', 'The pull-away spike at green'),
    statement: t(
      '國外研究量到路口的濃度高峰出現在車輛起步時，但那些高峰來自汽車與柴油車。我們沒有找到量化機車在綠燈起步時排放高峰的研究。',
      'Studies abroad have measured junction peaks as vehicles pull away, but those peaks came from cars and diesels. We found no study that quantifies a scooter\'s emission spike when the light turns green.',
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
      '交通部運輸研究所在6處路口用錄影每分鐘計算各車種的車流，公布了每日12小時的機車數（約800至6,000輛，占車流42%至62%），也附上尖峰時段的號誌時制圖。但我們沒有找到任何公開資料，記錄台灣路口每個紅燈停等多少機車，也沒有各城市行人等紅燈時間的統計。',
      'The transport ministry\'s Institute of Transportation counted traffic by vehicle class on video, minute by minute, at six intersections, and published 12-hour scooter totals (about 800 to 6,000, or 42–62% of vehicles) along with peak-period signal timing diagrams. But we found no published data on how many scooters queue at each red light at Taiwanese junctions, and no city statistics on how long pedestrians wait at a red light.',
    ),
    whyItMatters: t('車陣的大小決定路口排出多少；沒有這個數字，我們畫的路口場景是示意圖，不是實際的車數。', 'The size of the pack sets how much a junction receives; without it, the scene can only be illustrative.'),
    wouldClose: t('在台北、新北、台中與高雄的代表性路口，以錄影計算每個號誌週期的停等機車數與行人等候時間。', 'Video counts of scooters queued per signal cycle and pedestrian waiting times at representative junctions in Taipei, New Taipei, Taichung and Kaohsiung.'),
    whoCouldMeasure: t(
      '我們提議由各縣市交通局或交通部運輸研究所，在代表性路口用錄影計算每個號誌週期停等的機車數和行人等候時間，並公開資料。運研所已有每分鐘的車流計數，可以從這裡開始。',
      'We propose that city transport departments or the transport ministry\'s Institute of Transportation count scooters queued per signal cycle and pedestrian waiting times on video at representative junctions, and publish the data. The Institute\'s existing minute-by-minute counts would be a place to start.',
    ),
    editorNote: 'Found-not wording on purpose: the IOT per-minute counts were not checked for per-cycle queues, its timing diagrams were not transcribed, and a New Taipei camera study of scooter traffic (Tsai et al. 2024, AE:X, YOLOv4) was not checked for per-cycle queues either (02 §4). Searches for this gap: intersection-peaks gaps 4 (no new searching in that check, gaps 1).',
    closest: { facts: ['iot-motorcycle-counts-2024', 'marking-rules-turn-box', 'tunnel-motorcycles-co-ting2023'] },
    searchedOn: SEARCHED,
    research: '02 §1a, §4; IOT-113-TB006 pp.2-20, 3-20–3-26, 3-66–3-67 (PDF re-opened 2026-11-26); redlight/intersection-peaks (gaps: scooters queued per red light and pedestrian red times unpublished in what was verified)',
  },
  'gap-brief-exposure-harm': {
    chainLink: 5,
    title: t('在怠速機車旁幾分鐘的影響', 'Harm from a few minutes beside idling scooters'),
    statement: t(
      '目前有量到身體變化的最短暴露是5分鐘：高雄一項穿戴式感測器研究發現，5分鐘的PM2.5高峰之後，心率變異度緊接著小幅下降；但它找出的主要高峰來源是社區工廠、蚊香、燒稻草與焚香，研究沒有在機車車陣旁量。其他台灣證據看的是前1至4小時的微粒（心臟病與高血壓患者）和一小時的通勤；國外則有發病前一小時曾在路上，以及兩小時的步行。還沒有研究看過在怠速機車旁等紅燈的那幾分鐘，對身體有沒有影響。',
      'The shortest exposure with a measured effect on the body is five minutes: a wearable-sensor study in Kaohsiung found small, immediate drops in heart rate variability after 5-minute PM2.5 peaks, but the main peak sources it identified were community factories, mosquito coils, and agricultural and incense burning, and nothing was measured beside a scooter queue. Other Taiwanese evidence covers particle exposure over the previous 1–4 hours (in heart and hypertensive patients) and a one-hour commute; abroad, there is the hour before a heart attack and two-hour walks. No study has yet looked at whether the minutes spent beside idling scooters at a red light affect the body.',
    ),
    whyItMatters: t('等紅燈是短暫的暴露。心率變異度的小幅變化是替代指標，不是疾病；短暫暴露的健康後果，不能從較長時間的研究直接推論。', 'Waiting at a light is a brief exposure. A small change in heart rate variability is a surrogate marker, not disease; the health effect of brief exposure cannot be inferred directly from longer studies.'),
    wouldClose: t('在路口、緊鄰怠速機車車陣的地方，以穿戴式感測器與心率變異度等指標，研究短暫高峰前後的即時生理變化，並確認高峰來自機車廢氣。', 'Wearable-sensor studies of immediate physiological changes, such as heart rate variability, around short peaks at crossings beside idling scooter queues, with the peaks traced to scooter exhaust.'),
    whoCouldMeasure: t(
      '我們提議由大學的公共衛生團隊招募受試者：配戴穿戴式微粒與一氧化碳感測器，同時記錄心率變異度與血壓，比較在路口等紅燈前後幾分鐘的變化。',
      'We propose a study with volunteer participants by a university public-health group: wearable particle and carbon monoxide sensors worn alongside heart rate variability and blood pressure recording, comparing the minutes before and after waiting at a red light.',
    ),
    editorNote: 'Never write that the Lung 2025 peaks were "not traffic": the abstract names other sources and does not say traffic was tested and excluded. Do not give a typical red-light duration (redlight/intersection-peaks doNotClaim 13).',
    closest: { facts: ['lung2025-peaks-hrv', 'chuang2005-hrv-taipei', 'chuang2020-cardiovascular-association', 'peters2004-traffic-mi', 'mccreanor2007-london-walk'] },
    searchedOn: SEARCHED,
    research: 'redlight/acute-health#lung-2025-kaohsiung-peaks-hrv (5-minute peaks); redlight/acute-health (doNotClaim; gaps)',
  },
  'gap-tw-health-isolating-scooters': {
    chainLink: 5,
    title: t('只看機車廢氣的台灣健康研究', 'A Taiwanese health study isolating scooter exhaust'),
    statement: t(
      '沒有任何台灣的人群健康研究把機車廢氣和其他交通或其他污染來源分開：研究用的是測站或模式推估的污染、所有來源的個人暴露（例如呼氣一氧化碳），或不含機車的車流量。',
      'No Taiwanese population health study separates scooter exhaust from other traffic or other sources: they use station or modelled pollution, personal all-source exposure (such as breath carbon monoxide), or traffic counts that leave scooters out.',
    ),
    whyItMatters: t('所以現有的台灣人群研究看到的是「與交通污染有關」，還沒有一項看到「與機車廢氣有關」；直接拿機車廢氣做實驗的，只有一項細胞研究（舊式二行程引擎的微粒）。', 'So Taiwanese population studies so far show associations with traffic pollution as a whole; none has looked at scooter exhaust on its own in people. The only test of scooter exhaust itself is a cell study using particles from old two-stroke engines.'),
    wouldClose: t('以機車流量或機車專屬的排放指標作為暴露，研究健康結果；或做來源解析，把機車與其他車種分開。', 'Health studies using scooter flow or scooter-specific emission markers as the exposure, or source apportionment that separates scooters from other vehicles.'),
    whoCouldMeasure: t(
      '我們提議由大學的公共衛生與流行病學團隊，把各地機車流量或環境部的來源解析結果當作暴露指標，與既有的台灣健康世代資料連結分析。',
      'We propose that university public-health and epidemiology groups use local scooter traffic counts, or the environment ministry\'s source-apportionment results, as the exposure measure and link them to existing Taiwanese health cohorts.',
    ),
    closest: { facts: ['guo1999-asthma-survey', 'mj-cohort-mortality-guo2021', 'pan2021-truck-traffic-cvd', 'lai2005-toll-workers', 'li2025-delivery-workers-co', 'lee2005-motorcycle-exhaust-cells'] },
    searchedOn: SEARCHED,
    research: 'redlight/vulnerable-groups (summary: station-based, modelled or traffic-density exposure, none isolates scooters; doNotClaim); redlight/vulnerable-groups#lee2005-motorcycle-exhaust-particles-invitro; redlight/long-term-traffic (gaps: no traffic or scooter share of PM2.5 deaths)',
  },
  'gap-tw-child-height': {
    chainLink: 6,
    title: t('台灣的兒童高度量測', 'Child-height measurement in Taiwan'),
    statement: t(
      '台灣路口量過的空氣，感測器都放在大人的呼吸高度（運研所的路口量測是離地1.2至1.5公尺）。我們沒有找到台灣在兒童或嬰兒車高度量空氣的研究；現有的這類研究都在英國、西班牙、德國與美國。',
      'The air measured at Taiwanese crossings was sampled at adult breathing height (1.2–1.5 m in the Institute of Transportation\'s intersection study). We found no Taiwanese study measuring air at child or stroller height; all such studies we found are from the UK, Spain, Germany and the US.',
    ),
    whyItMatters: t('台灣的排氣管是機車，國外的結果主要來自汽車與柴油車，不能直接套用。', 'In Taiwan the tailpipes are scooters; results abroad come mostly from cars and diesels and cannot be transferred directly.'),
    wouldClose: t('在台灣路口與人行道，同時在0.6、1.0與1.6公尺高度量超細微粒、一氧化碳與苯類（BTEX）。', 'Simultaneous measurements at 0.6, 1.0 and 1.6 m of ultrafine particles, CO and benzene-family compounds (BTEX) at Taiwanese crossings and sidewalks.'),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局或大學團隊來量：在台灣路口與人行道上，同時在0.6、1.0與1.6公尺三種高度放置超細微粒計數器、一氧化碳分析儀與苯類採樣器。',
      'We propose that a city environmental protection bureau or a university group place ultrafine particle counters, carbon monoxide analysers and BTEX samplers at 0.6, 1.0 and 1.6 m at the same time at Taiwanese crossings and sidewalks.',
    ),
    closest: { facts: ['stroller-height-review', 'pram-height-sharma2020', 'child-height-harr2022', 'first-metre-sharma-kumar-2018', 'iot-study-design'], series: ['stroller-height-studies'] },
    searchedOn: SEARCHED,
    research: '03 §5 (none found: any Taiwanese child-height measurement); 02 §6; 02 §1a (IOT inlet 1.2–1.5 m)',
  },
  'gap-school-commute-pillion': {
    chainLink: 6,
    title: t('上學途中與機車後座的兒童', 'Children on the school run and on the pillion'),
    statement: t(
      '1992年冬天，台北一項研究量過學生上學途中的揮發性有機物，坐機車時比搭公車高；那是三十多年前的車和燃料。之後，我們沒有找到台灣兒童上學途中、在校門口或坐在機車後座時吸入什麼的量測。',
      'In winter 1992 a Taipei study measured volatile organic compounds on students\' journeys to school and found more on motorcycles than in buses; that was a fleet and fuels of more than thirty years ago. Since then, we found no measurement of what Taiwanese children breathe on the way to school, at the school gate or riding pillion on a scooter.',
    ),
    whyItMatters: t('國外研究顯示每分鐘劑量以交通途中最高；在台灣，坐機車上下學的孩子有多少，我們也沒有找到官方統計。', 'Studies abroad find dose per minute highest in transport; we also found no official figure for how many Taiwanese children travel to school by scooter.'),
    wouldClose: t('為學童配戴個人監測器，記錄上學方式、時間與地點。', 'Personal monitors on schoolchildren with records of travel mode, time and place.'),
    whoCouldMeasure: t(
      '我們提議由大學的公共衛生團隊，和學校、家長會一起，讓學童在上學途中配戴個人監測器，並記錄上學方式、時間與地點，坐機車後座的孩子也包括在內。',
      'We propose that a university public-health group, working with schools and parents\' associations, give schoolchildren personal monitors for the journey to school and record travel mode, time and place, including children who ride pillion.',
    ),
    closest: { facts: ['chan1993-taipei-motorcycle-voc', 'boniardi2021-dose-share', 'who-children-vulnerable'] },
    sources: ['chan-1993-jawma'],
    editorNote: 'The vulnerable-groups search for this gap ran with the search budget exhausted (gaps 0), so "not found" is weaker than usual. The claim that many children ride to school by scooter was removed: no source holds it, and MOTC mode share by age was not verified (claims-policy no-unverified-official-figures).',
    searchedOn: SEARCHED,
    research: 'redlight/vulnerable-groups#chan1993-taipei-motorcycle-voc; redlight/vulnerable-groups (gaps: school-gate and school-commute exposure in Taiwan not found)',
  },
  'gap-electrification-street-air': {
    chainLink: 7,
    title: t('電動化後的街道空氣', 'Street air after electrification'),
    statement: t(
      '已知的是：電動機車沒有排氣管廢氣，環境部的排放清冊估計它的PM2.5（輪胎、煞車與揚塵）只占全國PM2.5排放的0.02%；新北一項模式研究也顯示交通排放少時，超細微粒暴露跟著下降，但那不是電動化情境。我們沒有找到台灣量過機車電動化之後街道空氣變化的研究，也沒有找到台灣或亞洲的健康效益估計。',
      'What is known: electric scooters have no tailpipe exhaust, and the environment ministry\'s inventory puts their PM2.5 (tyres, brakes and road dust) at 0.02% of national PM2.5 emissions; a New Taipei modelling study also shows ultrafine-particle exposure falling when traffic emissions fall, though not in an electrification scenario. We found no Taiwanese study that has measured how street air changes after scooter electrification, and no Taiwanese or Asian health-benefit estimate.',
    ),
    whyItMatters: t('「電動機車沒有排氣管」是確定的；但對路口空氣與健康的實際好處，還沒有量測。', '"An electric scooter has no tailpipe" is settled; the actual benefit for crossing air and health has not been measured.'),
    wouldClose: t('在電動機車比例差異大的路口或時期，做前後或對照的路邊量測。', 'Before-and-after or matched roadside measurements at junctions or times with very different electric shares.'),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局與大學的環境工程團隊，在電動機車比例差異大的路口或時期，用同樣的路邊儀器量超細微粒、一氧化碳與苯類（BTEX），做前後或對照比較。運研所的報告也建議下次調查把電動機車分開計數。',
      'We propose that city environmental protection bureaus and university environmental-engineering groups measure ultrafine particles, carbon monoxide and benzene-family compounds (BTEX) with the same roadside instruments at junctions or times with very different electric shares, before and after or side by side. The Institute of Transportation\'s report also recommends counting electric scooters separately in its next survey.',
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
      '台灣路口行人等候區的一氧化碳已經量過：交通部運輸研究所2024年7月用微型感測器量到的最高值約0.5至1.3 ppm。依本站換算約每立方公尺0.6至1.5毫克，遠低於WHO的1小時（35毫克）與15分鐘（100毫克）指引值。還沒有人做的是：用校正過的標準儀器，在車流最多、冬天或塞車的時候，於行人的位置連續量測，再與這些指引值比較；也沒有路邊碳氧血紅素的資料。',
      'Carbon monoxide has been measured in pedestrian waiting areas at Taiwanese crossings: the highest readings from the Institute of Transportation\'s micro-sensors in July 2024 were about 0.5–1.3 ppm. By our conversion that is about 0.6–1.5 mg/m³, far below WHO\'s 1-hour (35 mg/m³) and 15-minute (100 mg/m³) guideline values. What nobody has done: continuous measurement with calibrated reference analysers where pedestrians stand, at the busiest sites, in winter or in congestion, compared with those values; and there are no kerbside carboxyhaemoglobin data.',
    ),
    whyItMatters: t('機車排放全國約15%的一氧化碳。夏天幾天的低成本感測器讀數遠低於指引值，但車流最多、天氣最不利擴散的時候會到多高，還不知道。', 'Scooters emit about 15% of the country\'s carbon monoxide. A few summer days of low-cost sensor readings were far below the guideline values, but how high levels go at the busiest sites and in the weather least favourable to dispersion is not known.'),
    wouldClose: t('在路口行人位置以校正過的儀器連續量測一氧化碳，涵蓋不同季節與車流最多的路口。', 'Continuous carbon monoxide measurement with calibrated instruments where pedestrians stand, across seasons and at the busiest crossings.'),
    whoCouldMeasure: t(
      '我們提議由各縣市環保局或環境部，在路口行人位置用校正過的連續式一氧化碳分析儀量測，並和WHO的15分鐘與1小時指引值比較。',
      'We propose that city environmental protection bureaus or the environment ministry measure carbon monoxide continuously with calibrated analysers where pedestrians stand, and compare the results with WHO\'s 15-minute and 1-hour guideline values.',
    ),
    editorNote: 'The WHO comparison is our arithmetic (1 ppm CO = 1.145 mg/m³ at 25 °C) on the highest one-minute readings the IOT report gives; a 15-minute or 1-hour mean at those sensors cannot exceed them. It bounds those sensors on those summer days only. Never write that Taiwanese kerbside CO is "safe" in general.',
    closest: { facts: ['iot-waiting-area-co-2024', 'iot-study-design', 'who-no2-co-guideline', 'teds13-mc-co-share', 'co-odourless'] },
    sources: ['iot-2025-intersection-air-quality'],
    searchedOn: SEARCHED,
    research: '02 §1a; IOT-113-TB006 pp.3-44, 3-60–3-65 (PDF re-opened 2026-11-26); redlight/acute-health (gaps: Taiwan roadside CO vs WHO; carboxyhaemoglobin — searched without the IOT data)',
  },
  'gap-high-emitter-share': {
    chainLink: 1,
    title: t('排最多的機車占多少排放', 'How much the dirtiest scooters emit'),
    statement: t(
      '定檢告訴我們到檢機車中有多少不合格，而且車齡17年以上的不合格率較高。空氣污染防制法允許主管機關用遙測篩檢路上的車輛，但我們沒有找到公開的台灣機車遙測研究或篩檢結果，因此不知道排最多的一小部分機車占多少排放。',
      'Inspections tell us how many of the scooters that turn up fail, and failure rates are higher at 17 years and over. The Air Pollution Control Act lets officials screen vehicles on the road by remote sensing, but we found no published remote-sensing study or screening results for Taiwanese scooters, so the share of emissions from the dirtiest few is unknown.',
    ),
    whyItMatters: t('如果少數車占大部分排放，抓出高污染車會比全面汰換更有效。', 'If a few scooters emit most, finding high emitters could matter more than replacing everything.'),
    wouldClose: t('在路邊以遙測儀器量測大量行經的機車，並公布結果。', 'Roadside remote sensing of large numbers of passing scooters, with the results published.'),
    whoCouldMeasure: t(
      '我們提議由環境部或各縣市環保局公開既有的遙測篩檢資料；如果還沒有，就在路邊用遙測設備量大量行經的機車，找出排最多的一小部分機車占多少排放。',
      'We propose that the environment ministry or city environmental protection bureaus publish whatever remote-sensing screening data they hold, or, if there are none, use roadside remote sensing on large numbers of passing scooters to find what share of emissions comes from the dirtiest few.',
    ),
    editorNote: 'Found-not, not proven absent: the policy-idling check ran with the search budget exhausted and did not retrieve smoky-vehicle (烏賊車) or screening statistics (policy-idling gaps 0). APCA art. 46 allows remote-sensing screening (redlight/policy-idling#apca-inspection-and-reporting).',
    closest: { facts: ['inspection-2025', 'inspection-failure-by-age-2025', 'tsai2026-three-scooter-case', 'apca-inspection-and-reporting'] },
    searchedOn: SEARCHED,
    research: 'redlight/idle-emissions (gaps: no Taiwanese scooter remote-sensing study); redlight/policy-idling#apca-inspection-and-reporting',
  },
  'gap-idling-rule-scooters': {
    chainLink: 2,
    title: t('怠速規定管不管機車', 'Whether the idling rule reaches scooters'),
    statement: t(
      '怠速規定的條文是公開的：停車等候超過3分鐘要熄火，交通管制或壅塞造成的怠速不在此限。我們沒有找到官方解釋，說明這條規定是否適用於機車，或等紅燈是否算「停車怠速等候」。',
      'The idling rule itself is public: vehicles waiting more than three minutes must switch off, and idling caused by traffic control or congestion is exempt. We found no official interpretation of whether the rule applies to scooters, or whether waiting at a signal counts as waiting while stopped.',
    ),
    whyItMatters: t('現行的怠速規定管的是停車等候超過三分鐘的車；一個普通的紅燈，不在它要管的範圍裡。這條規定是否適用於機車，沒有官方解釋可以回答。', 'The current idling rule covers vehicles waiting more than three minutes; an ordinary red light is not what it is written for. Whether it reaches scooters at all, no official interpretation says.'),
    wouldClose: t('環境部對機車與號誌停等的正式函釋。', 'A formal MOENV interpretation covering scooters and signal waits.'),
    whoCouldMeasure: t(
      '這裡缺的不是量測，而是一份正式的解釋。我們提議由環境部發布書面解釋（函釋），說明怠速規定管不管機車，等紅燈算不算在內。',
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
