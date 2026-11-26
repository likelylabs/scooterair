// The answers we have now for the thirteen questions that used to be listed as evidence gaps
// (brief section 7.2 #answers, as corrected in section 7). Replaces gaps.ts for the redesigned
// pages: gaps.ts keeps exporting until phase 3, when nothing imports it any more.
//
//   import { answerList, localizeAnswer } from '@/data';
//   const a = localizeAnswer('answer-idle-emission-rate', 'zh-TW');
//   a.answer   // '每輛機車怠速，每小時約排 15 公克一氧化碳（8 到 27 公克）…'
//   a.chips    // [{ kind: 'estimate', text: '推估' }]
//   a.caveat   // one or two sentences; print it on the card
//   a.kSentence // 'K4' → print ui.kSentences.K4[locale] beside it
//
// Rules
// - Numbers in `answer` must match their slot or fact; `slots` and `facts` list them and
//   scripts/check-data.mjs checks every id. Estimated numbers keep 約, a range and the 推估 chip.
// - `chips` is what AnswerCard shows (brief 4.1). Empty only where the brief gives none (—), and
//   then `kSentence` names the true sentence of brief 7.1 that stands in its place.
// - Wording follows brief 6.6 (no 沒人量過, no 最髒, no 違規/合法 about idling).

import type { ChainLink, L10n, Locale, ReaderKind } from './types.ts';
import { chainLinkLabels, readerKindLabels, readerPlaceLabels, t, type ReaderPlace } from './types.ts';
import type { SourceId } from './sources.ts';
import type { FactId } from './facts.ts';
import type { GapId } from './gaps.ts';
import type { EstimateAnchor, EstimateRangeSlot } from './estimate.ts';

/**
 * Ids of the true "not yet measured / not yet known" sentences of brief 7.1. Their words are
 * shared strings owned by lane B: print them from `kSentences` in src/i18n/ui.ts.
 */
export const kSentenceIds = ['K1', 'K2', 'K3', 'K4', 'K5', 'K5film', 'K6'] as const;
export type KSentenceId = (typeof kSentenceIds)[number];

/** Where each K sentence may appear (brief 7.1), for the site check's allow-list. */
export const kSentencePlaces: Record<KSentenceId, string[]> = {
  K1: ['/estimate/', '/estimate/#measure', '/about/', '/act/', '/print/brief/'],
  K2: ['/estimate/', '/evidence/#link-3'],
  K3: ['/estimate/'],
  K4: ['/', '/questions/my-child/', '/estimate/'],
  K5: ['/', '/90/', '/questions/one-red-light/', '/evidence/#link-5'],
  K5film: ['/90/'],
  K6: ['/estimate/#answers', '/90/'],
};

export interface AnswerChip {
  kind: ReaderKind;
  /** Optional place after the chip: 實測・國外, 研究・台灣模式. */
  place?: ReaderPlace;
}

export interface AnswerInput {
  /** The gap this answer replaces (gaps.ts id). */
  formerGap: GapId;
  chainLink: ChainLink;
  /** The question, as a reader would ask it. */
  question: L10n;
  /** The answer we have now: one or two sentences, as strong as the evidence allows. */
  answer: L10n;
  /** What it rests on, in one line. */
  basis: L10n;
  /** Its limit, in plain words. Print it on the card. */
  caveat: L10n;
  /** The chip(s) the card shows. Empty only with `kSentence`. */
  chips: AnswerChip[];
  /** The K sentence of brief 7.1 that belongs with this answer, if any. */
  kSentence?: KSentenceId;
  /** Registry facts whose numbers or claims the answer uses. */
  facts: FactId[];
  /** Estimate slots whose numbers the answer prints (estimate.ts). */
  slots?: EstimateRangeSlot[];
  /** Sources beyond those of `facts` (for the reference list). */
  sources?: SourceId[];
  /** /estimate/#… that holds the working, for estimates. */
  anchor?: EstimateAnchor;
  /** Internal note for editors (English). Never rendered. */
  editorNote?: string;
  /** Research file and entry behind the answer. */
  research: string;
}

const est = (place?: ReaderPlace): AnswerChip => ({ kind: 'estimate', ...(place ? { place } : {}) });
const chip = (kind: ReaderKind, place?: ReaderPlace): AnswerChip => ({ kind, ...(place ? { place } : {}) });

export const answers = {
  'answer-pedestrian-red-light-exposure': {
    formerGap: 'gap-pedestrian-red-light-exposure',
    chainLink: 3,
    question: t('紅燈時站在機車旁邊，吸到多少？', 'At a red light, how much does the person beside the scooters breathe?'),
    answer: t(
      '旁邊停了十來輛機車時，大人鼻子高度的一氧化碳，90 秒平均多出約 0.05 到 1 ppm；街上原本就有約 0.5 ppm。運研所在行人等候區量到的最高一分鐘，是 0.5 到 1.3 ppm。',
      "With a dozen or so scooters beside you, the pack adds about 0.05 to 1 ppm of carbon monoxide at an adult's nose, averaged over 90 seconds; the street already holds about 0.5 ppm. The highest minute the Institute of Transportation recorded in pedestrian waiting areas was 0.5 to 1.3 ppm.",
    ),
    basis: t('本站的推估（模擬 3 萬次），放在運研所 3 個路口的實測旁邊。', "This site's estimate (30,000 simulated reds), beside the Institute of Transportation's readings at 3 junctions."),
    caveat: t(
      '推估是算的，不是量的；運研所的讀數是整天、所有來源的空氣，不是紅燈時機車旁邊那 90 秒。',
      'The estimate is worked out, not measured; the Institute\'s readings are all-source air over whole days, not the 90 seconds beside the scooters at a red.',
    ),
    chips: [est(), chip('measured', 'tw')],
    kSentence: 'K1',
    facts: ['iot-waiting-area-co-2024', 'moenv-co-stations-2025', 'iot-study-design'],
    slots: ['co.dozen.add'],
    anchor: 'numbers',
    research: 'estimate/METHOD §1, §6',
  },
  'answer-idle-emission-rate': {
    formerGap: 'gap-idle-emission-rate',
    chainLink: 1,
    question: t('一輛機車怠速，排多少？', 'How much does one idling scooter give off?'),
    answer: t(
      '每輛機車怠速，每小時約排 15 公克一氧化碳（8 到 27 公克）；等一個 90 秒的紅燈，約 0.2 到 0.7 公克，大約裝滿一個鋁罐。',
      'An idling scooter gives off about 15 g of carbon monoxide an hour (8 to 27 g); through one 90-second red that is about 0.2 to 0.7 g, roughly enough to fill one drinks can.',
    ),
    basis: t('2025 年 907 萬筆定檢讀數，乘上國外實驗室量的怠速耗油量。', "Taiwan's 9.07 million inspection readings from 2025, multiplied by idle fuel use measured in laboratories abroad."),
    caveat: t(
      '台灣沒有直接量每輛機車每小時排多少；河內實驗室量到 5 款常見機車約 61 公克，車款和方法都不同，只拿來比較。',
      'No Taiwanese test measures grams an hour per scooter directly; a Hanoi laboratory found about 61 g for five common models, a different fleet and method, shown only for comparison.',
    ),
    chips: [est()],
    facts: ['inspection-2025', 'idle-rate-hanoi-nguyen2021'],
    slots: ['emit.co.gPerHour', 'emit.co.perRed_g'],
    sources: ['moenv-co-inspection-2025', 'nguyen-2021-ijus', 'nguyen-2025-jcie'],
    anchor: 'recipe',
    editorNote: 'Never print "about 1 gram a minute" (that was the Hanoi 61 g/h). The Hanoi figure is a comparison, never Taiwan\'s rate.',
    research: 'estimate/METHOD §4; estimate/gap-answers-a#gap-idle-emission-rate (superseded by the signed fleet mean)',
  },
  'answer-scooters-per-red-light': {
    formerGap: 'gap-scooters-per-red-light',
    chainLink: 2,
    question: t('一個紅燈，旁邊停幾輛機車？', 'How many scooters stop at one red light?'),
    answer: t(
      '運研所量過最忙的路口，一個紅燈每個方向約停 34 輛；冷清的路口約 3 到 10 輛。本站用三種情況來算：幾輛（2 到 5）、十來輛（8 到 20）、停滿（25 到 45）。行人大約要等 85 到 115 秒。',
      'At the busiest junction the Institute of Transportation counted, about 34 scooters stop per direction through one red; at a quiet one, 3 to 10. This site works with three cases: a few (2 to 5), a dozen or so (8 to 20) and a full box (25 to 45). Pedestrians wait about 85 to 115 seconds.',
    ),
    basis: t('運研所的錄影車流計數和號誌時制；每小時約 1,500 輛 × 83 秒的紅燈 ÷ 3,600 秒 ≈ 34 輛。', "The Institute's video counts and signal plans: about 1,500 scooters an hour × an 83-second red ÷ 3,600 seconds ≈ 34."),
    caveat: t(
      '34 輛是把一小時的車流平均分到四個方向算的，不是數某一個紅燈；實際的路口會多也會少。',
      'The 34 spreads an hour of traffic evenly over four directions; it is not a count of one red, and real junctions vary.',
    ),
    chips: [est()],
    facts: ['iot-motorcycle-counts-2024', 'iot-pedestrian-wait'],
    slots: ['signal.pedWait'],
    anchor: 'count',
    research: 'estimate/METHOD §6a; estimate/gap-answers-a#gap-scooters-per-red-light',
  },
  'answer-electrification-street-air': {
    formerGap: 'gap-electrification-street-air',
    chainLink: 7,
    question: t('換成電動機車，街上的空氣會好多少？', 'What does going electric do to street air?'),
    answer: t(
      '一項台灣的全國模式研究（Liou 與 Wu，2021）估計，燃油機車換成電動的，每年可少掉約 10 億美元（約新台幣 300 億元）的空氣污染健康損失。在路口，電動機車沒有排氣管，換一輛就少一根。',
      'A national Taiwanese model (Liou and Wu, 2021) estimated that switching petrol scooters to electric would avoid about US$1 billion (about NT$30 billion) a year of health harm from air pollution. At the junction, an electric scooter has no tailpipe: every one is one tailpipe fewer.',
    ),
    basis: t('環境部的空氣品質模式（基準年 2016 年）加上健康效益的換算。', "Taiwan EPA's air-quality model (base year 2016) with a health-benefit valuation."),
    caveat: t(
      '這是全國平均的模式推算，不是在路邊量的；輪胎、煞車和路面的粉塵還在，旁邊的汽車也還在。',
      'A national model, not a kerbside measurement; tyre, brake and road dust remain, and so do the cars beside you.',
    ),
    chips: [chip('study', 'twModel')],
    facts: ['liou-wu-2021-electric-scooter-benefit'],
    research: 'estimate/gap-answers-c#gap-electrification-street-air',
  },
  'answer-tw-child-height': {
    formerGap: 'gap-tw-child-height',
    chainLink: 6,
    question: t('小孩高度的空氣，比較髒嗎？', 'Is the air at a child\'s height dirtier?'),
    answer: t(
      '照體重算，小孩吸進的空氣是大人的 1.5 到 2 倍。國外的量測大多發現，矮的地方廢氣一樣多或更多。',
      'For their body weight, children breathe 1.5 to 2 times the air an adult does. Measurements abroad mostly find the exhaust the same or higher lower down.',
    ),
    basis: t('美國環保署的呼吸量資料；英國、西班牙、美國、德國的高度比較研究。', "US EPA breathing-rate data; height comparisons from the UK, Spain, the US and Germany."),
    caveat: t('台灣沒有小孩高度的量測，各研究的結果也不一致，所以本站不印高度的倍數。', "There are no child-height measurements in Taiwan and the studies disagree, so this site prints no height multiple."),
    chips: [chip('study', 'international')],
    kSentence: 'K4',
    facts: ['child-air-per-kg', 'stroller-height-review', 'child-height-harr2022'],
    slots: ['child.airPerKg'],
    editorNote: 'Never print 1.7–2.2 or any child-height number.',
    research: 'estimate/gap-answers-b#gap-tw-child-height (corrected by brief 7.2)',
  },
  'answer-roadside-co-vs-who': {
    formerGap: 'gap-roadside-co-vs-who',
    chainLink: 3,
    question: t('路邊的一氧化碳，和世界衛生組織的指引比呢？', 'How does roadside carbon monoxide compare with WHO values?'),
    answer: t(
      '台北市 3 個路邊測站，2024 年一氧化碳平均 0.80 ppm；2014 到 2024 年，每小時和每 8 小時的值年年都符合空氣品質標準。世界衛生組織的 15 分鐘指引值約 87 ppm。',
      "Taipei's three roadside stations averaged 0.80 ppm of carbon monoxide in 2024, and their hourly and 8-hour values met the air-quality standards every year from 2014 to 2024. The WHO 15-minute guideline is about 87 ppm.",
    ),
    basis: t('台北市環保局 2024 年空氣品質年報；世界衛生組織 2021 年指引。', "Taipei's 2024 air-quality annual report; the WHO 2021 guidelines."),
    caveat: t(
      '測站進氣口在 2.5 到 3.5 公尺高，報的是一小時或一年的平均，說不出紅燈時機車旁邊那一兩分鐘。',
      'Station inlets sit 2.5 to 3.5 m up and report hourly or yearly averages; they cannot show the minute or two beside the scooters at a red.',
    ),
    chips: [chip('measured', 'tw')],
    facts: ['taipei-roadside-co-2024', 'who-no2-co-guideline'],
    research: 'estimate/gap-answers-c#gap-roadside-co-vs-who',
  },
  'answer-school-commute-pillion': {
    formerGap: 'gap-school-commute-pillion',
    chainLink: 6,
    question: t('小孩坐機車後座上學，吸到多少？', 'What does a child on the back seat breathe on the way to school?'),
    answer: t(
      '在印尼萬隆和尼泊爾加德滿都，孩子身上的感測器顯示，坐機車和走路的那一段 PM2.5 最高。坐在後座的孩子，可以當作吸到的和騎士差不多；在台北，騎機車的人一小時平均吸到的 PM2.5 是搭捷運的兩倍多。',
      'In Bandung and Kathmandu, sensors on children showed the scooter and walking legs had the highest PM2.5. A child on the back seat can be assumed to breathe what the rider breathes; in Taipei, people on scooters breathed more than twice the PM2.5 of metro riders over an hour, on average.',
    ),
    basis: t('萬隆、加德滿都的兒童個人量測；台北通勤者的量測（Chuang 等，2020）。', 'Personal measurements on children in Bandung and Kathmandu; Taipei commuters (Chuang et al., 2020).'),
    caveat: t('量到的孩子在國外，台北的數字是大人騎士；台灣小孩坐後座吸到多少，是推論出來的。', 'The children measured were abroad and the Taipei figures are adult riders, so what a Taiwanese child on the back seat breathes is inferred.'),
    chips: [chip('measured', 'abroad')],
    facts: ['child-commute-scooter-carson2026', 'commute-scooter-vs-subway-chuang2020'],
    editorNote: 'Never say riders breathe "the most": scooter and walking did not differ significantly in Chuang 2020. Ho Chi Minh City is left out (paper not opened).',
    research: 'estimate/gap-answers-b#gap-school-commute-pillion',
  },
  'answer-pull-away-spike': {
    formerGap: 'gap-pull-away-spike',
    chainLink: 1,
    question: t('綠燈一亮、機車起步那一陣，有多大？', 'How big is the burst when the pack pulls away at green?'),
    answer: t(
      '起步是只有幾秒鐘、很猛的一陣：油門一開，一氧化碳和油氣一下子變多。',
      'A short, sharp burst lasting a few seconds: as the throttles open, carbon monoxide and fuel vapour jump.',
    ),
    basis: t('義大利的機車隨車量測，看得到起步時一氧化碳和油氣變多，但沒有給數字。', 'On-board measurements of motorcycles in Italy show the rise at pull-away but give no rates.'),
    caveat: t('機車起步的排放沒有公開的量測數字，本站的推估也只算紅燈那 90 秒。', 'No published measurement gives scooter emissions at pull-away, and this site\'s estimate covers only the 90 seconds of red.'),
    chips: [],
    kSentence: 'K6',
    facts: [],
    sources: ['vojtisek-lom-2020-amt'],
    editorNote: 'Drop the old "idling emits about as much as cruising" comparison: it rested on the Hanoi figure. No multiplier anywhere.',
    research: 'estimate/gap-answers-a#gap-pull-away-spike',
  },
  'answer-brief-exposure-harm': {
    formerGap: 'gap-brief-exposure-harm',
    chainLink: 5,
    question: t('等一兩分鐘的紅燈，會傷身體嗎？', 'Can a minute or two at a red light do harm?'),
    answer: t(
      '高雄一項研究看到，細懸浮微粒升高後 5 分鐘內，心跳的節奏就小小變了一下；國外的實驗要在車多的路上待 1 到 2 小時，才看得到肺功能下降。一天等 2 到 6 個紅燈，一年加起來約 12 到 55 小時。',
      'A Kaohsiung study saw a small change in the heart\'s rhythm within 5 minutes of a rise in fine particles; experiments abroad needed 1 to 2 hours in heavy traffic before lung function fell. Two to six red lights a day add up to about 12 to 55 hours a year.',
    ),
    basis: t('Lung 等（2025）的高雄研究、倫敦的步行實驗，加上本站的時間計算。', "Lung et al. (2025) in Kaohsiung, the London walking experiment, and this site's arithmetic on time."),
    caveat: t(
      '5 分鐘的變化很小、很快就回復，不是生病；高雄的微粒大多來自工廠、蚊香、燃燒和燒香，不是只有機車。',
      'The five-minute change is small and passes, not an illness; most of the Kaohsiung particles came from factories, mosquito coils, burning and incense, not scooters alone.',
    ),
    chips: [chip('study', 'tw'), chip('derived')],
    kSentence: 'K5',
    facts: ['lung2025-peaks-hrv', 'mccreanor2007-london-walk'],
    slots: ['time.hoursPerYear.2', 'time.hoursPerYear.6'],
    editorNote: 'The five-minute study is never a headline or a big number.',
    research: 'estimate/gap-answers-b#gap-brief-exposure-harm',
  },
  'answer-odorants': {
    formerGap: 'gap-odorants',
    chainLink: 4,
    question: t('那個味道是什麼？', 'What is the smell?'),
    answer: t(
      '臭的是沒燒完的汽油和刺鼻的醛（ㄑㄩㄢˊ）類，最可能的主角是乙醛：大約十億分之 1.5 就聞得到。一氧化碳和微粒沒有味道。',
      'The smell is unburnt petrol and sharp aldehydes; the likeliest main contributor is acetaldehyde, noticeable at about 1.5 parts per billion. Carbon monoxide and particles have no smell.',
    ),
    basis: t('把台灣機車廢氣的成分，和日本量的嗅覺門檻放在一起比。', 'Taiwanese scooter-exhaust composition set against odour thresholds measured in Japan.'),
    caveat: t('這是用門檻排出來的順序，不是真的去聞廢氣的測試；真正的味道是混在一起的。', 'This is a ranking from thresholds, not a smell test of real exhaust; real smells are mixtures.'),
    chips: [est()],
    facts: ['odour-thresholds', 'scooter-exhaust-carbonyls', 'co-odourless'],
    anchor: 'answers',
    editorNote: 'English must not say more than the Chinese ("probably aldehydes" overreached). The 1.5 ppb belongs to acetaldehyde, not formaldehyde.',
    research: 'estimate/gap-answers-a#gap-odorants',
  },
  'answer-high-emitter-share': {
    formerGap: 'gap-high-emitter-share',
    chainLink: 1,
    question: t('排最多的那些機車，占多少？', 'How much do the highest-emitting scooters give off?'),
    answer: t(
      '2025 年定檢讀數裡，一氧化碳排最多的一成，占了全部的約 30% 到 45%，大約三分之一。',
      'In the 2025 inspection readings, the highest tenth for carbon monoxide account for about 30% to 45% of the total: about a third.',
    ),
    basis: t('環境部 2025 年全國定檢一氧化碳讀數的分組統計，本站加總。', "MOENV's 2025 national table of inspection carbon monoxide readings, summed by us."),
    caveat: t('算的是讀數不是車，而且只有來定檢、出廠滿 5 年的車。', 'It counts readings, not scooters, and only scooters five or more years old that came for inspection.'),
    chips: [chip('derived')],
    facts: ['inspection-top-tenth-co-share', 'inspection-2025'],
    slots: ['inspect.top10share'],
    editorNote: 'Write 排最多的一成, never 最髒.',
    research: 'estimate/gap-answers-c#gap-high-emitter-share',
  },
  'answer-tw-health-isolating-scooters': {
    formerGap: 'gap-tw-health-isolating-scooters',
    chainLink: 5,
    question: t('有沒有只看機車廢氣的健康研究？', 'Are there Taiwanese health studies of scooter exhaust alone?'),
    answer: t(
      '台灣的健康研究量的都是所有車輛的廢氣，不只機車。353 篇長期研究的結論是：長年吸車子的廢氣，和氣喘、心臟病、肺癌有關。',
      "Taiwan's health studies all measure exhaust from every kind of vehicle, not scooters alone. A review of 353 long-term studies found that years of breathing traffic exhaust are linked to asthma, heart disease and lung cancer.",
    ),
    basis: t('美國健康效應研究所（HEI）的文獻回顧，以及台灣的交通與健康研究。', "The Health Effects Institute's review, and Taiwanese studies of traffic and health."),
    caveat: t('所有車輛，不只機車；這是「有關」，研究沒有判定因果。', 'All traffic, not scooters alone; these are links, and the studies did not establish cause.'),
    chips: [chip('study', 'international')],
    facts: ['hei-sr23-trap-associations', 'pan2021-truck-traffic-cvd'],
    editorNote: 'The brief gives no chip (—) because the answer is folded into the caveat 所有車輛，不只機車; the card still names the review it rests on, so it carries 研究・國際. The 2022 northern-Taiwan roadside LDSA study (Chang et al., J Hazard Mater 427:128188) is entered as fact roadside-ldsa-traffic-share-chang2022 (chainLink 5, abstract opened 2026-11-26 on a second try); per the brief it goes under /evidence/#link-5 with its caveat, not on this card.',
    research: 'estimate/gap-answers-b#gap-tw-health-isolating-scooters',
  },
  'answer-idling-rule-scooters': {
    formerGap: 'gap-idling-rule-scooters',
    chainLink: 2,
    question: t('等紅燈不熄火，規定怎麼說？', 'What does the idling rule say about scooters at red lights?'),
    answer: t(
      '怠速規定是停車等候超過三分鐘才要熄火，一般的紅燈比這短；規定裡的「汽車」，依空氣污染防制法也包括機車。',
      'The idling rule asks engines off after more than three minutes of waiting, and an ordinary red light is shorter; under the Air Pollution Control Act, the rule\'s "汽車" (motor vehicles) includes motorcycles.',
    ),
    basis: t('汽車停車怠速管理辦法第 2 到 4 條，空氣污染防制法第 3 條。', 'The idling regulation, articles 2 to 4; the Air Pollution Control Act, article 3.'),
    caveat: t('這是我們讀條文的結果，不是官方解釋；等紅燈算不算「停車怠速等候」，沒有官方說明。', 'This is our reading of the text, not an official interpretation; no official statement says whether waiting at a signal counts.'),
    chips: [chip('official')],
    facts: ['idling-regulation'],
    editorNote: 'Never 違規, never 合法.',
    research: 'estimate/gap-answers-c#gap-idling-rule-scooters',
  },
} satisfies Record<string, AnswerInput>;

export type AnswerId = keyof typeof answers;
export type Answer = AnswerInput & { id: AnswerId };

export const answerList: Answer[] = (Object.entries(answers) as [AnswerId, AnswerInput][]).map(([id, a]) => ({ id, ...a }));

/** Look up an answer. Throws on an unknown id so a typo fails the build. */
export function answer(id: AnswerId): Answer {
  const a = (answers as Record<string, AnswerInput>)[id];
  if (!a) throw new Error(`[data] Unknown answer id "${id}"`);
  return { id, ...a };
}

/** The answer that replaces a former gap. */
export function answerForGap(gapId: GapId): Answer | undefined {
  return answerList.find((a) => a.formerGap === gapId);
}

export function answersForLink(link: ChainLink): Answer[] {
  return answerList.filter((a) => a.chainLink === link);
}

export interface LocalizedAnswer {
  id: AnswerId;
  formerGap: GapId;
  chainLink: ChainLink;
  linkLabel: string;
  question: string;
  answer: string;
  basis: string;
  caveat: string;
  /** For KindChip: kind, the chip word and its text with place ('研究・台灣模式'). */
  chips: { kind: ReaderKind; label: string; text: string }[];
  /** The K sentence that goes with it (print `kSentences[id]` from src/i18n/ui.ts). */
  kSentence?: KSentenceId;
  facts: FactId[];
  slots: EstimateRangeSlot[];
  anchor?: EstimateAnchor;
}

export function localizeAnswer(idOrAnswer: AnswerId | Answer, locale: Locale): LocalizedAnswer {
  const a = typeof idOrAnswer === 'string' ? answer(idOrAnswer) : idOrAnswer;
  return {
    id: a.id,
    formerGap: a.formerGap,
    chainLink: a.chainLink,
    linkLabel: chainLinkLabels[a.chainLink].short[locale],
    question: a.question[locale],
    answer: a.answer[locale],
    basis: a.basis[locale],
    caveat: a.caveat[locale],
    chips: a.chips.map((c) => {
      const label = readerKindLabels[c.kind].label[locale];
      const text = c.place ? (locale === 'zh-TW' ? `${label}・${readerPlaceLabels[c.place][locale]}` : `${label} · ${readerPlaceLabels[c.place][locale]}`) : label;
      return { kind: c.kind, label, text };
    }),
    kSentence: a.kSentence,
    facts: a.facts,
    slots: a.slots ?? [],
    anchor: a.anchor,
  };
}
