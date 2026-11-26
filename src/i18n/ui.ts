// Shared interface strings, in both languages.
// The site names live here and nowhere else: change them once, everything follows.

// Loadable by plain Node (scripts/check-copy.mjs, scripts/build-share-cards.mjs): keep every
// runtime import relative, with its .ts extension, and never import ./index at runtime
// (it reads import.meta.env).

import type { L10n, Locale } from './index';
import { confidenceLabels, evidenceLabels, evidenceTypes, type Evidence } from '../data/types.ts';
import { facts } from '../data/facts.ts';

/**
 * Reader-facing Chinese writes 台灣 / 台北; the registry writes 臺. Pass any registry string
 * that reaches a reader through this (labels, jurisdiction names, quota text).
 */
export const readerText = (s: string): string => s.replaceAll('臺', '台');
const reader = (v: L10n): L10n => ({ 'zh-TW': readerText(v['zh-TW']), en: v.en });

export const site = {
  /** Wordmark. Chinese is the primary name; English is the secondary lockup. */
  name: { 'zh-TW': '行人呼吸', en: 'ScooterAir' } as L10n,
  /** The other-language name, shown small beside the primary one. */
  altName: { 'zh-TW': 'ScooterAir', en: '行人呼吸' } as L10n,
  tagline: {
    'zh-TW': '等紅燈的時候，我們吸進了什麼',
    en: 'What we breathe at the red light',
  } as L10n,
  description: {
    'zh-TW':
      '機車的排氣管離地不到一公尺，就在斑馬線旁邊。行人在路口到底吸進什麼，台灣還沒有人量過。這裡整理已經知道的、還不知道的，以及換電動機車實際要花多少。',
    en: 'A scooter’s tailpipe sits under a metre off the ground, beside the crosswalk. What pedestrians actually breathe at the crossing has not been measured in Taiwan. Here is what is known, what is not, and what going electric really costs.',
  } as L10n,
} as const;

export interface NavItem {
  /** Locale-neutral path, passed through href(). */
  path: string;
  label: L10n;
}

/** Primary navigation, in order (blueprint 4.1). Home is reached through the wordmark. */
export const nav: NavItem[] = [
  { path: '/questions/', label: { 'zh-TW': '問題', en: 'Questions' } },
  { path: '/evidence/', label: { 'zh-TW': '證據', en: 'Evidence' } },
  { path: '/unmeasured/', label: { 'zh-TW': '沒人量過', en: 'Not yet measured' } },
  { path: '/electric/', label: { 'zh-TW': '換電動', en: 'Going electric' } },
  { path: '/act/', label: { 'zh-TW': '行動', en: 'Take action' } },
];

/** Footer-only navigation. The corrections log is a section of /about/. */
export const footerNav: NavItem[] = [
  { path: '/sources/', label: { 'zh-TW': '資料來源', en: 'Sources' } },
  { path: '/about/', label: { 'zh-TW': '關於', en: 'About' } },
  { path: '/about/#corrections', label: { 'zh-TW': '修改紀錄', en: 'Corrections' } },
];

/**
 * A registry value for a shared string: the number is read from src/data when this module
 * loads, so a corrected fact corrects every strip, page and share card that prints the line.
 * Throws on a fact or key the registry does not hold. Marked pure so a client bundle that only
 * wants `readerText` or a type does not pull the registry in.
 */
const registryNumber = (id: keyof typeof facts, key: string, scale = 1): L10n => {
  const d = facts[id]?.data[key];
  if (!d) throw new Error(`[ui strings] fact ${id} has no data.${key}`);
  const v = +(d.value * scale).toFixed(6);
  return { 'zh-TW': new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(v), en: new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(v) };
};
/** Fill {tokens} in both languages. Throws on a token with no value, so a typo cannot ship. */
const filled = (l: L10n, vars: Record<string, L10n>): L10n => {
  const f = (loc: Locale) =>
    l[loc].replace(/\{(\w+)\}/g, (_m, k: string) => {
      if (!vars[k]) throw new Error(`[ui strings] no value for {${k}} in: ${l[loc]}`);
      return vars[k][loc];
    });
  return { 'zh-TW': f('zh-TW'), en: f('en') };
};
/** Minimum gap between the turn box and the crosswalk, in centimetres (MOTC marking rules). */
const turnBoxGapCm = /* @__PURE__ */ registryNumber('marking-rules-turn-box', 'turnBoxGap', 100);

export const ui = {
  skipToContent: { 'zh-TW': '跳到主要內容', en: 'Skip to content' },
  home: { 'zh-TW': '首頁', en: 'Home' },
  primaryNav: { 'zh-TW': '主選單', en: 'Primary' },
  footerNav: { 'zh-TW': '頁尾選單', en: 'Footer' },
  menu: { 'zh-TW': '選單', en: 'Menu' },
  closeMenu: { 'zh-TW': '關閉選單', en: 'Close menu' },
  /** Label of the language switch = the language you would switch TO. */
  switchLanguage: { 'zh-TW': 'English', en: '中文' },
  switchLanguageShort: { 'zh-TW': 'EN', en: '中文' },
  switchLanguageHint: { 'zh-TW': 'Read this page in English', en: '以中文閱讀本頁' },
  themeToggle: { 'zh-TW': '切換深色/淺色', en: 'Switch light / dark theme' },
  themeLight: { 'zh-TW': '淺色', en: 'Light' },
  themeDark: { 'zh-TW': '深色', en: 'Dark' },
  aboutData: {
    'zh-TW': '本站每一個數字都附上來源。只用來示範版面的圖表，會清楚標示「示意數據」。',
    en: 'Every figure on this site links to its source. Charts that only demonstrate a layout are clearly labelled “sample data”.',
  },
  aboutDataTitle: { 'zh-TW': '關於這些數據', en: 'About this data' },
  credits: { 'zh-TW': '製作', en: 'Credits' },
  sources: { 'zh-TW': '資料來源', en: 'Sources' },
  source: { 'zh-TW': '來源', en: 'Source' },
  sourceN: { 'zh-TW': '來源 {n}', en: 'Source {n}' },
  sampleData: { 'zh-TW': '示意數據', en: 'Sample data' },
  sampleDataLong: {
    'zh-TW': '示意數據，非真實量測',
    en: 'Sample data, not real measurements',
  },
  illustrative: { 'zh-TW': '示意圖，未依實際比例或量測繪製', en: 'Illustrative, not drawn from measurements' },
  noData: { 'zh-TW': '無資料', en: 'No data' },
  figure: { 'zh-TW': '圖', en: 'Fig.' },
  dataTable: { 'zh-TW': '查看資料表', en: 'View data table' },
  externalLink: { 'zh-TW': '(另開新視窗)', en: '(opens in a new tab)' },
  backToTop: { 'zh-TW': '回到頁首', en: 'Back to top' },
  note: { 'zh-TW': '說明', en: 'Note' },
  phaseRed: { 'zh-TW': '紅燈', en: 'Red phase' },
  phaseGreen: { 'zh-TW': '綠燈', en: 'Green phase' },
  seconds: { 'zh-TW': '秒', en: 's' },
  // Chart vocabulary
  chart: {
    category: { 'zh-TW': '項目', en: 'Category' },
    value: { 'zh-TW': '數值', en: 'Value' },
    min: { 'zh-TW': '最小值', en: 'Min' },
    median: { 'zh-TW': '中位數', en: 'Median' },
    max: { 'zh-TW': '最大值', en: 'Max' },
    before: { 'zh-TW': '之前', en: 'Before' },
    after: { 'zh-TW': '之後', en: 'After' },
    share: { 'zh-TW': '占比', en: 'Share' },
    total: { 'zh-TW': '合計', en: 'Total' },
    of: { 'zh-TW': '每 {total} 中有 {n}', en: '{n} in {total}' },
    month: { 'zh-TW': '月', en: 'Month' },
    months: { 'zh-TW': '個月', en: 'months' },
    year: { 'zh-TW': '年', en: 'yr' },
  },
  // Street scene
  scene: {
    red: { 'zh-TW': '燃油機車', en: 'Gasoline' },
    clean: { 'zh-TW': '電動機車', en: 'Electric' },
    compareLegend: { 'zh-TW': '同一個路口，同一個紅燈', en: 'Same crossing, same red light' },
    adult: { 'zh-TW': '成人口鼻', en: 'Adult' },
    child: { 'zh-TW': '孩童口鼻', en: 'Child' },
    stroller: { 'zh-TW': '嬰兒車', en: 'Stroller' },
    tailpipe: { 'zh-TW': '排氣管', en: 'Tailpipe' },
    heightUnit: { 'zh-TW': '公分', en: 'cm' },
    altRed: {
      'zh-TW':
        '路口側面示意圖：一排燃油機車在停止線後和待轉區裡怠速等紅燈，行人從車陣前走過斑馬線，轉角有一個戴黃帽的小學生和一位長者在等同一個綠燈。地面附近用斜線標出一層：有廢氣，多濃沒人量過。',
      en: 'Side view of a crossing: a row of gasoline scooters idles behind the stop line and in the turn box at a red light. People cross in front of them; on the corner a schoolchild in a yellow cap and an older woman wait for the same green. Hatching near the ground marks a layer where exhaust is present and its density has not been measured.',
    },
    altClean: {
      'zh-TW': '同一個路口：等紅燈的換成電動機車，車陣沒有排氣管，地面附近不再畫那一層斜線。遠處的汽車還在。',
      en: 'The same crossing: the scooters at the red light are electric, the pack has no tailpipes, and the hatched layer near the ground is no longer drawn. A car further off is still there.',
    },
  },
  // Pollutant vocabulary (how each is drawn)
  pollutant: {
    odorTitle: { 'zh-TW': '聞得到的', en: 'What you smell' },
    odorBody: {
      'zh-TW': '廢氣裡聞得到的部分；是哪幾種成分，還沒有人鑑定過。畫成排氣管口的暖色波紋。',
      en: 'The part of exhaust you can smell; which compounds, nobody has identified. Drawn as warm ribbons at the tailpipe.',
    },
    coTitle: { 'zh-TW': '聞不到的氣體', en: 'The gas you can’t smell' },
    coBody: {
      'zh-TW': '一氧化碳，無色無味。畫成空心圓圈。',
      en: 'Carbon monoxide: no colour, no smell. Drawn as hollow rings.',
    },
    ufpTitle: { 'zh-TW': '看不到的微粒', en: 'The particles you can’t see' },
    ufpBody: {
      'zh-TW': '車流裡的超細微粒，不只來自機車。畫成針尖大小的細點。',
      en: 'Ultrafine particles from traffic as a whole, not scooters alone. Drawn as pin-point stipple.',
    },
  },
} as const;

/**
 * The evidence chain: the site's argument, one link at a time. Titles live
 * here so the overview, the chapter markers, the rail and the nav always agree.
 * `n` is 1-based. The last link is the one the reader can act on.
 */
export const chain = {
  name: { 'zh-TW': '證據鏈', en: 'Evidence chain' } as L10n,
  linkOf: { 'zh-TW': '第 {n} 環，共 {total} 環', en: 'Link {n} of {total}' } as L10n,
  linkN: { 'zh-TW': '第 {n} 環', en: 'Link {n}' } as L10n,
  breakable: { 'zh-TW': '這一環，你可以切斷', en: 'The link you can break' } as L10n,
  links: [
    { 'zh-TW': '排氣管排出什麼', en: 'What leaves the tailpipe' },
    { 'zh-TW': '排在哪裡', en: 'Where it comes out' },
    { 'zh-TW': '人因此吸進什麼', en: 'What people then breathe' },
    { 'zh-TW': '這些物質會做什麼', en: 'What those compounds do' },
    { 'zh-TW': '長期吸廢氣的人怎麼了', en: 'What happens to people who breathe it' },
    { 'zh-TW': '誰離得最近', en: 'Who is closest to it' },
    { 'zh-TW': '哪一環可以切斷', en: 'Which link you can break' },
  ] as L10n[],
  /**
   * Chapter anchors, by convention. The home page and /evidence/ both use
   * `link-1` … `link-7`; the rail's jump menu and ChainStrip link to them.
   */
  anchor: (n: number): string => `link-${n}`,
  anchors: { top: 'top', brief: 'brief', green: 'green', connect: 'connect', money: 'money', next: 'next' },
  /**
   * The seven-line 懶人包 (blueprint 3.2). ONE source for ChainStrip, question
   * pages, share cards and the film: never retype these lines in a page.
   * `badges` are EvidenceKind ids; line 7 is a fact of the machine and has none.
   * `pip` is how the link is drawn on the rail and on any chain line:
   * filled = Taiwan data, outline = modelled or international, open = the gap, go = the way out.
   */
  summary: [
    {
      text: { 'zh-TW': '論排放量，機車的粉塵很少，油氣和一氧化碳很多。', en: 'By emissions, scooters put out little dust and a lot of fumes and carbon monoxide.' },
      badges: ['official-tw'],
      pip: 'filled',
    },
    {
      // {cm} is the registry's marking-rule minimum (facts['marking-rules-turn-box'].data.turnBoxGap), never typed here
      text: /* @__PURE__ */ filled(
        { 'zh-TW': '排氣管離地不到一公尺；標線規則只要求待轉區離斑馬線 {cm} 公分。', en: 'The tailpipe is under a metre off the ground; the marking rules ask for {cm} cm between the turn box and the crosswalk.' },
        { cm: turnBoxGapCm },
      ),
      badges: ['international', 'official-tw'],
      pip: 'filled',
    },
    {
      text: { 'zh-TW': '站在旁邊的人吸進多少，台灣沒有人量過。', en: 'How much the person standing beside it breathes, nobody in Taiwan has measured.' },
      badges: ['gap'],
      pip: 'open',
    },
    {
      // What the evidence supports (facts 'co-odourless', 'odour-thresholds'): carbon monoxide has no smell;
      // benzene is smellable only at parts per million, so at roadside levels it is unlikely to be smelled.
      // Never "cannot": nobody has measured benzene at a Taiwanese kerb.
      text: {
        'zh-TW': '聞到味道，代表你站在廢氣裡；裡面的一氧化碳沒有味道，路邊那種濃度的苯也不太可能聞得出來。',
        en: 'If you can smell it, you are standing in exhaust; the carbon monoxide in it has no smell, and at roadside levels you are unlikely to smell the benzene.',
      },
      badges: ['international'],
      pip: 'outline',
    },
    {
      text: { 'zh-TW': '長年吸車流廢氣，和心臟病、肺癌、氣喘有關；一個紅燈會怎樣，沒有研究。', en: 'Years of breathing traffic exhaust are associated with heart disease, lung cancer and asthma; what one red light does, no study says.' },
      badges: ['international', 'gap'],
      pip: 'outline',
    },
    {
      text: { 'zh-TW': '台北的研究裡，騎機車通勤的人吸到的 PM2.5 最高；小孩呼吸比大人快。', en: 'In a Taipei study, scooter commuters breathed the most PM2.5; children breathe faster than adults.' },
      badges: ['measured-tw', 'international'],
      pip: 'filled',
    },
    {
      text: { 'zh-TW': '電動機車沒有排氣管。', en: 'An electric scooter has no tailpipe.' },
      badges: [],
      pip: 'go',
    },
  ] as { text: L10n; badges: EvidenceKind[]; pip: ChainPip }[],
  summaryTitle: { 'zh-TW': '30 秒懶人包：|七件事', en: 'The 30-second version: |seven things' } as L10n,
  summaryShort: { 'zh-TW': '七件事', en: 'Seven things' } as L10n,
  summaryOf: { 'zh-TW': '七件事的第 {n} 件', en: 'Thing {n} of seven' } as L10n,
  summaryExpand: { 'zh-TW': '看全部七件', en: 'Show all seven' } as L10n,
  summaryUnder: {
    'zh-TW': '六件有出處，一件沒人量過。怎麼接起來，往下看。想直接問的，點這裡：',
    en: 'Six have sources; one has never been measured. Scroll to see how they join. Or go straight to your question:',
  } as L10n,
  /** Footer of the collapsed strip on question pages. */
  summaryFooter: { 'zh-TW': '怎麼接起來，你自己判斷。', en: 'How they join is yours to judge.' } as L10n,
  summaryFooterLink: { 'zh-TW': '看我們怎麼接', en: 'See how we join them' } as L10n,
  noBadge: { 'zh-TW': '機器本身的事實', en: 'A fact of the machine' } as L10n,
  /**
   * Countdown allocation (blueprint 3.0): [from, to] seconds shown on the rail
   * while each chapter scrolls past. Link 5 is paused; link 7 resets to 90.
   */
  countdown: {
    prologue: [90, 90],
    links: [
      [90, 78],
      [78, 64],
      [64, 50],
      [50, 38],
      [38, 38],
      [38, 5],
      [90, 90],
    ],
    green: [5, 0],
    connect: [0, 0],
  } as { prologue: [number, number]; links: [number, number][]; green: [number, number]; connect: [number, number] },
  /** Kicker text that prints the count in each chapter, so it reads without JavaScript. */
  kickerRed: { 'zh-TW': '紅燈 · 剩 {n} 秒', en: 'Red light · {n} seconds left' } as L10n,
  kickerPaused: { 'zh-TW': '倒數暫停 · 鏡頭拉遠', en: 'Countdown paused · pulling back' } as L10n,
  kickerReset: { 'zh-TW': '紅燈 · 倒數回到 {n}', en: 'Red light · back to {n}' } as L10n,
  kickerGreen: { 'zh-TW': '綠燈', en: 'Green light' } as L10n,
} as const;

export type ChainPip = 'filled' | 'outline' | 'open' | 'go';

/** The countdown rail under the header (V2). */
export const rail = {
  label: { 'zh-TW': '紅燈倒數與章節選單', en: 'Countdown and chapter menu' } as L10n,
  jump: { 'zh-TW': '跳到', en: 'Jump to' } as L10n,
  /** The strip's label when no chapter is current: without JavaScript, and above the first chapter. */
  menu: { 'zh-TW': '跳到章節', en: 'Jump to a chapter' } as L10n,
  idle: { 'zh-TW': '一個紅燈，90 秒', en: 'One red light, ninety seconds' } as L10n,
  secondsLeft: { 'zh-TW': '紅燈剩 {n} 秒', en: '{n} seconds of red left' } as L10n,
  paused: { 'zh-TW': '倒數暫停', en: 'Countdown paused' } as L10n,
  green: { 'zh-TW': '綠燈亮的那一秒', en: 'The second it turns green' } as L10n,
  connect: { 'zh-TW': '接起來', en: 'Joining it up' } as L10n,
  money: { 'zh-TW': '算錢', en: 'The money' } as L10n,
  act: { 'zh-TW': '行動', en: 'Take action' } as L10n,
  /** Pip legend, printed once at the foot of the jump menu. */
  pips: {
    filled: { 'zh-TW': '台灣的資料', en: 'Taiwan data' },
    outline: { 'zh-TW': '推估或國際證據', en: 'Modelled or international' },
    open: { 'zh-TW': '沒人量過', en: 'Not measured' },
    go: { 'zh-TW': '可以切斷', en: 'Can be broken' },
  } as Record<ChainPip, L10n>,
} as const;

/** Fixed labels inside a <Chapter> (blueprint 3.0, budget per chapter). */
export const chapterText = {
  caveat: { 'zh-TW': '這一段沒有說的事', en: 'What this does not say' } as L10n,
  action: { 'zh-TW': '你現在可以做的', en: 'What you can do now' } as L10n,
  more: { 'zh-TW': '看這一環的全部證據', en: 'See all the evidence for this link' } as L10n,
  paused: { 'zh-TW': '倒數暫停', en: 'Countdown paused' } as L10n,
} as const;

/**
 * Question chips (V4), in the reader's words, in blueprint order. `path` is
 * locale-neutral: pass it through href(). The last chip is not a question page.
 */
export const questions = {
  chips: [
    { slug: 'smell', path: '/questions/smell/', label: { 'zh-TW': '為什麼那麼臭？', en: 'Why does it smell so bad?' } },
    { slug: 'my-child', path: '/questions/my-child/', label: { 'zh-TW': '小孩吸得比我多嗎？', en: 'Does my child breathe more of it?' } },
    { slug: 'app', path: '/questions/app/', label: { 'zh-TW': 'App 說「良好」，是它錯了嗎？', en: 'The app says “Good”. Is it wrong?' } },
    { slug: 'one-red-light', path: '/questions/one-red-light/', label: { 'zh-TW': '只是等個紅燈，有差嗎？', en: 'It’s only a red light. Does it matter?' } },
    { slug: 'rider', path: '/questions/rider/', label: { 'zh-TW': '騎車的人自己呢？', en: 'What about the riders themselves?' } },
    { slug: 'afford', path: '/electric/', label: { 'zh-TW': '我換得起嗎？', en: 'Can I afford to switch?' } },
  ] as { slug: string; path: string; label: L10n }[],
  all: { 'zh-TW': '十題全部', en: 'All ten questions' } as L10n,
  allPath: '/questions/',
  label: { 'zh-TW': '直接問', en: 'Go straight to a question' } as L10n,
  askMeasure: { 'zh-TW': '誰來量？請環保局來量我家路口', en: 'Who will measure it? Ask the city to measure my crossing' } as L10n,
  askMeasurePath: '/unmeasured/#ask',
} as const;

// ---------------------------------------------------------------------------
// Evidence badges
// ---------------------------------------------------------------------------

/**
 * The eight reader-facing badges (blueprint Part 2): the registry's six
 * evidence types, in the registry's own words, plus two for the site's voice.
 * Order = the order of the legend.
 */
export const evidenceKinds = ['measured-tw', 'official-tw', 'modelled-tw', 'international', 'market-tw', 'derived', 'inference', 'gap'] as const;
export type EvidenceKind = (typeof evidenceKinds)[number];

/**
 * How a kind is drawn wherever the chain is a line (ChainLink rails, strip
 * markers): solid-filled · solid-outline · dashed · open (a break with hollow
 * ends) · none (never on the chain).
 */
export type EvidenceLine = 'solid-filled' | 'solid-outline' | 'dashed' | 'open' | 'none';

const registryLine: Record<Evidence, EvidenceLine> = {
  'measured-tw': 'solid-filled',
  'official-tw': 'solid-filled',
  'modelled-tw': 'solid-outline',
  international: 'solid-outline',
  'market-tw': 'none',
  derived: 'dashed',
};

const registryKinds = Object.fromEntries(
  evidenceTypes.map((k) => [k, { label: reader(evidenceLabels[k].label), help: reader(evidenceLabels[k].description), line: registryLine[k] }]),
) as Record<Evidence, { label: L10n; help: L10n; line: EvidenceLine }>;

export const evidence = {
  heading: { 'zh-TW': '證據類型', en: 'Kind of evidence' } as L10n,
  kinds: {
    ...registryKinds,
    inference: {
      label: { 'zh-TW': '我們的推論', en: 'Our inference' } as L10n,
      help: {
        'zh-TW': '我們自己接起來的一步：從有出處的事實推得，沒有人直接量過。全站最弱的一種。',
        en: 'A step we take ourselves: reasoned from sourced facts, measured directly by nobody. The weakest kind on this site.',
      } as L10n,
      line: 'dashed' as EvidenceLine,
    },
    gap: {
      label: { 'zh-TW': '沒人量過', en: 'Nobody has measured this' } as L10n,
      help: {
        'zh-TW': '我們找過了，找不到任何量測。不是量了沒事，是還沒有人去量。',
        en: 'We looked and found no measurement. Not measured and found fine. Not measured.',
      } as L10n,
      line: 'open' as EvidenceLine,
    },
  } as Record<EvidenceKind, { label: L10n; help: L10n; line: EvidenceLine }>,
  /** Small tag beside a badge when the fact's registry confidence is 'secondary'. */
  secondary: {
    label: reader(confidenceLabels.secondary.label),
    help: reader(confidenceLabels.secondary.description),
  },
  /** Legend key for the line styles. */
  lines: {
    'solid-filled': { 'zh-TW': '實線、實心：台灣的量測與官方資料', en: 'Solid, filled: measured or official Taiwan data' },
    'solid-outline': { 'zh-TW': '實線、空心：推估與國際證據', en: 'Solid, outlined: modelled or international' },
    dashed: { 'zh-TW': '虛線：本站的計算與推論', en: 'Dashed: our arithmetic and our inference' },
    open: { 'zh-TW': '斷開、兩端空心：沒人量過', en: 'Broken, hollow ends: nobody has measured it' },
    none: { 'zh-TW': '不畫在鏈上', en: 'Not drawn on the chain' },
  } as Record<EvidenceLine, L10n>,
  linesHeading: { 'zh-TW': '畫在證據鏈上的線', en: 'How each is drawn on the chain' } as L10n,
} as const;

/** Pre-blueprint names, still accepted by the components. Prefer EvidenceKind. */
export const legacyEvidenceLevels = { measured: 'measured-tw', established: 'international' } as const;
export type EvidenceLevel = EvidenceKind | keyof typeof legacyEvidenceLevels;
export const toEvidenceKind = (level: EvidenceLevel): EvidenceKind =>
  level in legacyEvidenceLevels ? legacyEvidenceLevels[level as keyof typeof legacyEvidenceLevels] : (level as EvidenceKind);

/** Badge for a registry fact: `evidenceBadge(fact.evidence, fact.confidence)` → props for <EvidenceBadge>. */
export const evidenceBadge = (kind: Evidence, confidence?: 'verified' | 'secondary'): { kind: EvidenceKind; secondary: boolean } => ({
  kind,
  secondary: confidence === 'secondary',
});

// ---------------------------------------------------------------------------
// Component strings
// ---------------------------------------------------------------------------

/** The empty chart (V8) and every empty-data Figure. */
export const emptyData = {
  caption: { 'zh-TW': '這不是版面錯誤。這張圖的數據不存在。', en: 'This is not a layout error. The data for this chart does not exist.' } as L10n,
  where: { 'zh-TW': '來源', en: 'Source' } as L10n,
  none: { 'zh-TW': '沒有來源可以引用：我們找過了，沒有人量過。', en: 'There is no source to cite: we looked, and nobody has measured it.' } as L10n,
  who: { 'zh-TW': '誰量得出來', en: 'Who could measure it' } as L10n,
  /** Appended to the graphic's accessible description. */
  sr: { 'zh-TW': '這張圖是刻意留白的：座標軸和格線都在，但沒有任何資料點，因為沒有人量過。', en: 'This chart is empty on purpose: the axes and gridlines are drawn, and there are no data points, because nobody has measured this.' } as L10n,
  panel: { 'zh-TW': '無資料', en: 'no data' } as L10n,
  xLabel: { 'zh-TW': '紅燈倒數（秒）', en: 'Red-light countdown (seconds)' } as L10n,
  red: { 'zh-TW': '紅燈', en: 'Red' } as L10n,
  green: { 'zh-TW': '綠燈', en: 'Green' } as L10n,
  stroller: { 'zh-TW': '嬰兒車高度（約 0.6 公尺）', en: 'Stroller height (about 0.6 m)' } as L10n,
  adult: { 'zh-TW': '成人高度（約 1.5 公尺）', en: 'Adult height (about 1.5 m)' } as L10n,
  heights: { 'zh-TW': '還沒有人量過的兩個高度', en: 'The two heights nobody has measured' } as L10n,
  tableHeight: { 'zh-TW': '高度', en: 'Height' } as L10n,
  tablePanel: { 'zh-TW': '量什麼', en: 'What would be measured' } as L10n,
  tableValue: { 'zh-TW': '量測值', en: 'Measured value' } as L10n,
} as const;

/** The chain board (V15): open link, reveal, stance boxes, struck-through list. */
export const board = {
  open: { 'zh-TW': '沒有接上的一環', en: 'The link that is not joined' } as L10n,
  reveal: { 'zh-TW': '看我們怎麼接', en: 'See how we join them' } as L10n,
  sources: { 'zh-TW': '看來源', en: 'See sources' } as L10n,
  notSaying: { 'zh-TW': '我們沒有說', en: 'What we are not saying' } as L10n,
  changeMind: { 'zh-TW': '什麼會讓我們改口', en: 'What would change our mind' } as L10n,
  notClaimed: { 'zh-TW': '我們不會說的話', en: 'What we will not say' } as L10n,
  notClaimedPrefix: { 'zh-TW': '我們不會說：', en: 'We will not say: ' } as L10n,
  why: { 'zh-TW': '為什麼：', en: 'Why: ' } as L10n,
} as const;

/** Calculator verdicts (V36). The sentence itself is page copy, built from engine output. */
export const verdict = {
  heading: { 'zh-TW': '結果', en: 'Verdict' } as L10n,
  labels: {
    A: { 'zh-TW': '打得平', en: 'It adds up' },
    B: { 'zh-TW': '買得起，但每個月多花一點', en: 'Affordable to buy, a little more each month' },
    C: { 'zh-TW': '以現在的條件，打不平', en: 'On today’s terms it does not add up' },
  } as Record<'A' | 'B' | 'C', L10n>,
  next: { 'zh-TW': '可以先做的事', en: 'What you can do first' } as L10n,
} as const;

/** Tile map of the 22 cities and counties (V41). */
export const tiles = {
  label: { 'zh-TW': '各縣市電動機車補助狀態', en: 'Electric-scooter subsidy status by city and county' } as L10n,
  legend: { 'zh-TW': '圖例', en: 'Key' } as L10n,
  states: {
    available: { 'zh-TW': '有名額', en: 'Places left' },
    restricted: { 'zh-TW': '只限汰舊或特定身分', en: 'Scrappage or certain groups only' },
    exhausted: { 'zh-TW': '已用完', en: 'Used up' },
    unknown: { 'zh-TW': '查不到', en: 'Could not be checked' },
  } as Record<'available' | 'restricted' | 'exhausted' | 'unknown', L10n>,
  unknownDetail: { 'zh-TW': '查不到，請洽環保局', en: 'We could not check this. Please ask the environmental bureau.' } as L10n,
  checked: { 'zh-TW': '{date}查', en: 'checked {date}' } as L10n,
  pick: { 'zh-TW': '點一個縣市，看金額和查證日期。', en: 'Choose a city or county for amounts and the date we checked.' } as L10n,
  official: { 'zh-TW': '官方頁面', en: 'Official page' } as L10n,
} as const;

/** Decision strip (V42). */
export const decision = {
  step: { 'zh-TW': '第 {n} 題', en: 'Question {n}' } as L10n,
  result: { 'zh-TW': '比較適合你的', en: 'What fits you better' } as L10n,
  pending: { 'zh-TW': '三題都選了，這裡會告訴你。', en: 'Answer all three and the result appears here.' } as L10n,
  all: { 'zh-TW': '所有可能的結果', en: 'Every possible result' } as L10n,
} as const;

/** Time ladder (V11). */
export const ladder = {
  label: { 'zh-TW': '時間的尺', en: 'The ruler of time' } as L10n,
  empty: { 'zh-TW': '沒有研究', en: 'No study' } as L10n,
  scopeTraffic: { 'zh-TW': '整體車流', en: 'Traffic as a whole' } as L10n,
  scopeAllSources: { 'zh-TW': '所有來源的 PM2.5', en: 'PM2.5 from all sources' } as L10n,
} as const;

/** Convenience: translate a ui string, with optional {token} replacement. */
export function t(value: L10n, locale: Locale, vars?: Record<string, string | number>): string {
  let s = value[locale];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/**
 * Units, typed once so every page uses the same code points.
 * Uses U+00B5 MICRO SIGN and U+00B3 SUPERSCRIPT THREE (both in the Latin font),
 * not Greek mu / a <sup>, so the unit stays one unbroken, well-drawn run.
 */
export const units = {
  ugm3: 'µg/m³',
  ppb: 'ppb',
  ppm: 'ppm',
  ntd: 'NT$',
  km: { 'zh-TW': '公里', en: 'km' } as L10n,
  perMonth: { 'zh-TW': '/月', en: '/mo' } as L10n,
} as const;
