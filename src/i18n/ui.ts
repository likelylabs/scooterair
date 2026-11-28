// Shared interface strings, in both languages.
// The site names live here and nowhere else: change them once, everything follows.

// Loadable by plain Node (scripts/check-copy.mjs, scripts/build-share-cards.mjs): keep every
// runtime import relative, with its .ts extension, and never import ./index at runtime
// (it reads import.meta.env).

import type { L10n, Locale } from './index';
import { confidenceLabels, evidenceLabels, evidenceTypes, readerKind, readerKindLabels, readerKinds, readerPlaceLabels, type Evidence, type ReaderKind } from '../data/types.ts';
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
  /** Site description (brief 7.10): says 空氣污染 and 廢氣, so a search for either finds the site. */
  description: {
    'zh-TW': '台灣路口的機車廢氣和空氣污染。等紅燈時，旁邊機車的廢氣有多少？對身體有什麼影響？換電動機車要多少錢？',
    en: 'Scooter exhaust and air pollution at Taiwan’s junctions. How much exhaust do the scooters beside you add at a red light? What does it do to the body, and what does an electric scooter cost?',
  } as L10n,
  /**
   * The one sentence a reader should be able to repeat (brief section 1). The home page, the film,
   * the poster and the share cards all end on it: print it from here, never retype it.
   */
  sentence: {
    'zh-TW': '等紅燈的時候，旁邊機車的排氣管，離小孩只有一兩步、不到一公尺高；換一輛電動的，就少一根排氣管。',
    en: 'At a red light, the tailpipes of the scooters beside you are a step or two from a child and less than a metre off the ground. Every electric scooter is one tailpipe fewer.',
  } as L10n,
} as const;

export interface NavItem {
  /** Locale-neutral path, passed through href(). */
  path: string;
  label: L10n;
}

/** The main menu, five items, in order (brief section 2). Home is reached through the wordmark. */
export const nav: NavItem[] = [
  { path: '/90/', label: { 'zh-TW': '短片', en: 'Film' } },
  { path: '/questions/', label: { 'zh-TW': '問題', en: 'Questions' } },
  { path: '/estimate/', label: { 'zh-TW': '怎麼算的', en: 'How we worked it out' } },
  { path: '/electric/', label: { 'zh-TW': '換電動', en: 'Go electric' } },
  { path: '/act/', label: { 'zh-TW': '行動', en: 'What I can do' } },
];

/** Footer navigation: the adults' pages. The corrections log is a section of /about/. */
export const footerNav: NavItem[] = [
  { path: '/evidence/', label: { 'zh-TW': '證據', en: 'Evidence' } },
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
/** Minimum gap between the turn box and the crossing, in centimetres (MOTC marking rules). */
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
  themeToggle: { 'zh-TW': '切換深色／淺色', en: 'Switch light / dark theme' },
  /** The theme button's name: a toggle, pressed = dark (aria-pressed carries the state). */
  themeDarkToggle: { 'zh-TW': '深色模式', en: 'Dark theme' },
  themeLight: { 'zh-TW': '淺色', en: 'Light' },
  themeDark: { 'zh-TW': '深色', en: 'Dark' },
  aboutData: {
    'zh-TW': '本站每一個數字都有出處，或者附上算法。標著「推估」的，是我們自己算的。路口的圖是示意圖。',
    en: 'Every figure on this site has a source or shows its working. A figure marked “Estimate” is one we worked out ourselves. The street drawings are illustrations.',
  },
  aboutDataTitle: { 'zh-TW': '關於這些數字', en: 'About these figures' },
  credits: { 'zh-TW': '製作', en: 'Credits' },
  sources: { 'zh-TW': '資料來源', en: 'Sources' },
  source: { 'zh-TW': '來源', en: 'Source' },
  sourceN: { 'zh-TW': '來源 {n}', en: 'Source {n}' },
  /** @deprecated Style-guide demos only (the style guide is not in the production build). */
  sampleData: { 'zh-TW': '示範用的數字', en: 'Demo figures' },
  /** @deprecated Style-guide demos only. */
  sampleDataLong: {
    'zh-TW': '示範用的數字，不是真的量測',
    en: 'Demo figures, not real measurements',
  },
  /** @deprecated Use `illustration.tag`. */
  illustrative: { 'zh-TW': '示意圖，未依實際比例或量測繪製', en: 'Illustrative: not to scale and not drawn from measurements' },
  figure: { 'zh-TW': '圖', en: 'Fig.' },
  dataTable: { 'zh-TW': '查看資料表', en: 'View data table' },
  externalLink: { 'zh-TW': '（另開新分頁）', en: '(opens in a new tab)' },
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
    { 'zh-TW': '旁邊的人吸進什麼', en: 'What people beside it breathe' },
    { 'zh-TW': '這些成分對身體做什麼', en: 'What those compounds do' },
    { 'zh-TW': '吸廢氣的人怎麼了', en: 'What happens to people who breathe it' },
    { 'zh-TW': '誰離得最近', en: 'Who is closest to it' },
    // the same words as `breakable`: link 7 has one name everywhere
    { 'zh-TW': '這一環，你可以切斷', en: 'The link you can break' },
  ] as L10n[],
  /**
   * The same seven names, short enough for the countdown strip on a phone (under 30em the
   * strip has room for about 20 Latin characters). The jump menu always prints the full names.
   */
  linksShort: [
    { 'zh-TW': '排氣管排出什麼', en: 'What comes out' },
    { 'zh-TW': '排在哪裡', en: 'Where it comes out' },
    { 'zh-TW': '旁邊的人吸進什麼', en: 'What people breathe' },
    { 'zh-TW': '這些成分對身體做什麼', en: 'What it does' },
    { 'zh-TW': '吸廢氣的人怎麼了', en: 'People who breathe it' },
    { 'zh-TW': '誰離得最近', en: 'Who is closest' },
    { 'zh-TW': '這一環，你可以切斷', en: 'The link to break' },
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
   * `chips` are ChipKind ids (the five reader chips, brief 4.1); line 7 is a fact of the machine
   * and has none. `pip` is how the link is drawn on any chain line:
   * filled = Taiwan data, outline = an estimate, a model or international evidence, go = the way out.
   * No link is drawn as a break any more: link 3 is whole (measured waiting areas + our estimate).
   */
  summary: [
    {
      text: { 'zh-TW': '論排放量，機車排的 PM2.5（細懸浮微粒）很少，油氣和一氧化碳很多。', en: 'By emissions, scooters put out little PM2.5 (fine particles) and a lot of fuel vapour and carbon monoxide.' },
      badges: ['official-tw'],
      chips: ['official'],
      pip: 'filled',
    },
    {
      // {cm} is the registry's marking-rule minimum (facts['marking-rules-turn-box'].data.turnBoxGap), never typed here
      text: /* @__PURE__ */ filled(
        { 'zh-TW': '排氣管離地不到一公尺；待轉區和斑馬線之間，規定只要留 {cm} 公分以上。', en: 'The tailpipe is under a metre off the ground; the rules ask for at least {cm} cm between the turn box and the crossing.' },
        { cm: turnBoxGapCm },
      ),
      badges: ['international', 'official-tw'],
      chips: ['official'],
      pip: 'filled',
    },
    {
      // Link 3 is whole now (brief 7.3): the transport research institute measured the waiting areas
      // (facts iot-waiting-area-pm25-2024, iot-waiting-area-co-2024), and what the pack adds beside
      // the scooters is this site's signed estimate (src/data/estimate.ts).
      text: {
        'zh-TW': '街上的人吸進什麼：運研所量過等候區（實測）；機車旁邊，本站推估。',
        en: 'What people on the street breathe: the Institute of Transportation measured the waiting areas (measured); beside the scooters, this site gives an estimate.',
      },
      badges: ['measured-tw', 'estimate'],
      chips: ['measured', 'estimate'],
      pip: 'outline',
    },
    {
      // What the evidence supports (facts 'co-odourless', 'odour-thresholds'): carbon monoxide has no smell;
      // benzene is smellable only at parts per million, so at roadside levels it is unlikely to be smelled.
      text: {
        'zh-TW': '聞到味道，代表你站在廢氣裡；裡面的一氧化碳沒有味道，路邊那麼少的苯也不太聞得出來。',
        en: 'If you can smell it, you are standing in exhaust; the carbon monoxide in it has no smell, and at roadside levels you are unlikely to smell the benzene.',
      },
      badges: ['international'],
      chips: ['study'],
      pip: 'outline',
    },
    {
      // HEI's confidence covers asthma onset and deaths from heart disease and lung cancer (fact
      // hei-sr23-trap-associations); the precise wording is in the sheet. The second sentence is K5.
      text: {
        'zh-TW': '長年吸車子的廢氣，和氣喘、心臟病、肺癌有關。等一個紅燈就會生病嗎？沒有人證明過。',
        en: 'Years of breathing traffic exhaust are linked to asthma, heart disease and lung cancer. Does one red light make you ill? Nobody has shown that.',
      },
      badges: ['international'],
      chips: ['study'],
      pip: 'outline',
    },
    {
      // Chuang 2020 (fact commute-scooter-vs-subway-chuang2020): scooter and walking were both significantly
      // higher than the metro, and did not differ significantly from each other.
      // Never "the most": the ranking is of means and is not significant. PM2.5 here is from all sources.
      text: {
        'zh-TW': '台北量過：騎機車和走路的人，吸到的 PM2.5 平均都比搭捷運的多；小孩呼吸又比大人快。',
        en: 'Measured in Taipei: people on scooters and people on foot both breathed more PM2.5, on average, than people on the metro; and children breathe faster than adults.',
      },
      badges: ['measured-tw', 'international'],
      chips: ['measured', 'study'],
      pip: 'filled',
    },
    {
      text: { 'zh-TW': '電動機車沒有排氣管。', en: 'An electric scooter has no tailpipe.' },
      badges: [],
      chips: [],
      pip: 'go',
    },
  ] as { text: L10n; /** @deprecated registry-style ids for <EvidenceBadge>; use `chips` */ badges: EvidenceKind[]; chips: ChipKind[]; pip: ChainPip }[],
  summaryTitle: { 'zh-TW': '30 秒懶人包：|七件事', en: 'The 30-second version: |seven things' } as L10n,
  summaryShort: { 'zh-TW': '七件事', en: 'Seven things' } as L10n,
  summaryOf: { 'zh-TW': '七件事的第 {n} 件', en: 'Thing {n} of seven' } as L10n,
  summaryExpand: { 'zh-TW': '看全部七件', en: 'Show all seven' } as L10n,
  summaryUnder: {
    // lines 1–6 carry their chips; line 7 is a fact of the machine
    'zh-TW': '六件有出處或算法，一件是機器本身的事實。怎麼接起來，往下看。想直接問的，點這裡：',
    en: 'Six have a source or a working; one is a fact of the machine. Scroll to see how they join. Or go straight to your question:',
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
  /** @deprecated The page has no countdown any more (ScreenRail shows no seconds). */
  kickerPaused: { 'zh-TW': '紅燈 · 鏡頭拉遠', en: 'Red light · pulling back' } as L10n,
  kickerReset: { 'zh-TW': '紅燈 · 倒數回到 {n}', en: 'Red light · back to {n}' } as L10n,
  kickerGreen: { 'zh-TW': '綠燈', en: 'Green light' } as L10n,
} as const;

export type ChainPip = 'filled' | 'outline' | 'open' | 'go';




// ---------------------------------------------------------------------------
// Evidence badges
// ---------------------------------------------------------------------------

/**
 * The FINER registry types, for /evidence/ and /sources/ only, where they may sit beside a
 * reader chip (brief 4.1). Everywhere else a number carries one of the five chips: see
 * `chips` / <KindChip> below. `estimate` is the site's own kerbside estimate. `gap` is on
 * its way out (the old gap badge is gone): it stays only until the old pages are rebuilt.
 * Order = the order of the legend.
 */
export const evidenceKinds = ['measured-tw', 'official-tw', 'modelled-tw', 'international', 'market-tw', 'derived', 'estimate', 'inference', 'gap'] as const;
export type EvidenceKind = (typeof evidenceKinds)[number];

/**
 * How a kind is drawn wherever the chain is a line (ChainLink rails, strip
 * markers): solid-filled · solid-outline · dashed · open (a break with hollow
 * ends) · none (never on the chain).
 */
export type EvidenceLine = 'solid-filled' | 'solid-outline' | 'dashed' | 'open' | 'none';

// Keyed by string, not by Evidence: the registry may hold a kind this list does not know yet
// (it falls back to an outline), and this list may name one the registry adds later.
const registryLine: Record<string, EvidenceLine> = {
  'measured-tw': 'solid-filled',
  'official-tw': 'solid-filled',
  'modelled-tw': 'solid-outline',
  international: 'solid-outline',
  'market-tw': 'none',
  derived: 'dashed',
  estimate: 'dashed',
};

type KindText = { label: L10n; help: L10n; line: EvidenceLine };
const registryKinds = Object.fromEntries(
  (evidenceTypes as readonly string[]).map((k) => [
    k,
    { label: reader(evidenceLabels[k as Evidence].label), help: reader(evidenceLabels[k as Evidence].description), line: registryLine[k] ?? 'solid-outline' },
  ]),
) as Record<string, KindText>;

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
    // the site's own estimate: the registry's wording when it has the kind, this wording until then
    estimate: registryKinds.estimate ?? {
      label: { 'zh-TW': '推估', en: 'Estimate' } as L10n,
      help: { 'zh-TW': '我們算出來的。一定附範圍和算法。', en: 'Worked out by us. It always comes with a range and the working.' } as L10n,
      line: 'dashed' as EvidenceLine,
    },
    /** @deprecated The gap badge is gone (brief 4.1). Kept so pages not yet rebuilt still build. */
    gap: {
      label: { 'zh-TW': '證據缺口', en: 'Evidence gap' } as L10n,
      help: {
        'zh-TW': '這一點沒有實測可以直接回答；旁邊量過什麼、本站怎麼推估，會一起寫出來。',
        en: 'No measurement answers this point directly; what has been measured nearby, and how this site estimates it, are shown beside it.',
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
    'solid-outline': { 'zh-TW': '實線、空心：模式與國際證據', en: 'Solid, outlined: modelled or international' },
    dashed: { 'zh-TW': '虛線：本站的推估、計算與推論', en: 'Dashed: our estimate, our arithmetic and our inference' },
    open: { 'zh-TW': '斷開、兩端空心：證據缺口', en: 'Broken, hollow ends: an evidence gap' },
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
// The five reader chips (brief 4.1)
// ---------------------------------------------------------------------------

/**
 * Every number a reader sees carries exactly one of five chips. They differ by word and by
 * shape (src/components/ui/kinds.ts), never by colour alone:
 *   measured 實測 solid dot · estimate 推估 hatched dot, dashed edge · official 官方 solid square
 *   study 研究 open book · derived 本站計算 plus sign
 * The ids and the words are the registry's (`ReaderKind`, `readerKindLabels` in
 * src/data/types.ts). `market` (業者公布) is a sixth chip for a seller's own price, on money
 * pages only; pass it explicitly (the registry's market figures map to 本站計算 by default).
 * One word for the site's own air numbers: 推估. Long-term studies of people are 研究, never 實測.
 */
export const chipKinds = [...readerKinds, 'market'] as const;
export type ChipKind = ReaderKind | 'market';

export const chips: Record<ChipKind, { label: L10n; help: L10n }> = {
  ...(Object.fromEntries(readerKinds.map((k) => [k, { label: readerKindLabels[k].label, help: readerKindLabels[k].meaning }])) as Record<ReaderKind, { label: L10n; help: L10n }>),
  market: {
    label: { 'zh-TW': '業者公布', en: 'Seller’s figure' },
    help: { 'zh-TW': '車廠和能源業者自己公布的價格和資費，不是政府的統計。', en: 'Prices and plan fees published by the makers and energy companies themselves; not government statistics.' },
  },
};

/**
 * The words that follow a chip after a middle dot: 研究・台灣, 實測・國外 (brief 4.1, 4.3).
 * The four places are the registry's (`readerPlaceLabels`); for a fact, `readerPlace(fact)` picks one.
 */
export const chipWhere = {
  taiwan: readerPlaceLabels.tw,
  abroad: readerPlaceLabels.abroad,
  international: readerPlaceLabels.international,
  taiwanModel: readerPlaceLabels.twModel,
  /** Home screen 6: 研究（長期・所有車輛） */
  longTermAllTraffic: { 'zh-TW': '長期・所有車輛', en: 'long-term, all traffic' },
} satisfies Record<string, L10n>;

/**
 * The chip for a chip id, or for any registry evidence id (`fact.evidence`, through the
 * registry's own `readerKind`). Throws on anything else: the old gap and inference badges have
 * no chip, so a page that still asks for one fails the build.
 * `arithmetic` is accepted as another name for `derived` (本站計算): the first draft of this
 * lane's contract called the chip that, and the money lane's contract still does.
 */
export function chipKindOf(kind: string): ChipKind {
  if (kind === 'arithmetic') return 'derived';
  if ((chipKinds as readonly string[]).includes(kind)) return kind as ChipKind;
  if ((evidenceTypes as readonly string[]).includes(kind)) return readerKind(kind as Evidence);
  throw new Error(`[ui strings] "${kind}" has no reader chip (brief 4.1 has five: ${readerKinds.join(', ')}).`);
}

// ---------------------------------------------------------------------------
// Words around the estimate that are not the estimate's own
// ---------------------------------------------------------------------------
//
// The estimate's numbers, its scenario names, its fixed wording (多出來, 街上原本就有, the ppm
// gloss, the two-item legend, the first-use gloss, the version stamp, the confidence words) and
// its formatter all live in src/data/estimate.ts: `est`, `estimateText`, `formatEstimate`.
// Only what a shared component adds around them is here.

export const scenarioText = {
  /** The question above the scenario switch. */
  legend: { 'zh-TW': '旁邊停了幾輛？', en: 'How many beside you?' } as L10n,
  /** Under each scenario's name: "8–20 輛". Fill with range(lo, hi). A name never travels without its count. */
  count: { 'zh-TW': '{range} 輛', en: '{range} scooters' } as L10n,
} as const;

export const estText = {
  /** For a total drawn on the same axis as measurements (brief 4.2 rule 5, 4.4). */
  includingStreet: { 'zh-TW': '含街上原本就有的', en: 'including what the street already holds' } as L10n,
  /** Label before the confidence word in an estimate's sheet (rule 9): 可信程度：中. */
  confidence: { 'zh-TW': '可信程度', en: 'Confidence' } as L10n,
  /**
   * The one assumption behind every yearly red-light figure (time.hoursPerYear): home screen 7,
   * the film's daily cue. Fill with waitPerRed_s. Keep both places printing this same string.
   */
  redHours: { 'zh-TW': '每個紅燈算 {lo} 到 {hi} 秒', en: 'each light counted as {lo} to {hi} seconds' } as L10n,
} as const;

/** estText.redHours as a sentence of its own: home screen 7 and the film's transcript print exactly this. */
export const redHoursSentence = (locale: Locale, lo: number, hi: number): string => {
  const s = estText.redHours[locale].replace('{lo}', String(lo)).replace('{hi}', String(hi));
  return locale === 'en' ? `${s.charAt(0).toUpperCase()}${s.slice(1)}.` : `${s}。`;
};

/** The tag on every drawn scene, as HTML at 14 px or more (brief 5.1), and its relatives. */
export const illustration = {
  /** Under every street picture. Pictures draw only the scooters' exhaust, so the tag also says the street's own air is not drawn. */
  tag: { 'zh-TW': '示意圖｜廢氣大多看不見，街上本來的空氣沒有畫', en: 'Illustration: real exhaust is mostly invisible, and the street’s own air is not drawn' } as L10n,
  /** On the body picture. */
  body: { 'zh-TW': '示意圖・不是醫學圖', en: 'Illustration, not a medical drawing' } as L10n,
  /** The sentence every scene's alt text ends with. Name the scenario before it. */
  altNote: {
    'zh-TW': '這是示意圖：人站的地方畫了多少，照本站的推估；排氣管後面的深色只是讓你看清楚，不照比例。',
    en: 'This is an illustration: how much is drawn where the people stand follows this site’s estimate; the dark patches at the tailpipes are drawn for the eye.',
  } as L10n,
} as const;

/**
 * The few sentences of the old framing that stay (brief 7.1). These are the ONLY places where
 * "not yet measured / not yet known" wording may appear, and only on the pages listed there.
 * Print them from here; the acceptance check uses this list as its allow-list.
 */
export const kSentences = {
  /** /estimate/ (top and #measure), /about/, the measurement letter on /act/, the brief */
  K1: {
    'zh-TW': '紅燈時站在機車旁邊的人吸到多少，還沒有人直接量過；最接近的，是運研所在行人等候區的量測。',
    en: 'Nobody has yet measured directly what a person beside the scooters breathes at a red light. The closest is the Institute of Transportation’s readings in pedestrian waiting areas.',
  },
  /** /estimate/, /evidence/#link-3 */
  K2: { 'zh-TW': '苯和超細微粒，台灣還沒有人在紅燈路邊量過。', en: 'Benzene and ultrafine particles have not yet been measured at a Taiwanese red light.' },
  /** /estimate/ */
  K3: { 'zh-TW': '這排機車又加了多少超細微粒，現有的資料還算不出來。', en: 'How many ultrafine particles the pack adds cannot be worked out from the data that exist.' },
  /** Home screen 8, /questions/my-child/, /estimate/ */
  K4: { 'zh-TW': '矮的地方，廢氣一樣多或更多；多多少，還算不出來。', en: 'Lower down, the exhaust is the same or more. How much more cannot yet be worked out.' },
  /** Home screen 6, /questions/one-red-light/, /evidence/#link-5, sheets */
  K5: { 'zh-TW': '等一個紅燈就會生病嗎？沒有人證明過。', en: 'Does one red light make you ill? Nobody has shown that.' },
  /** The film's health beat (a quiet line, so it is shorter) */
  K5film: { 'zh-TW': '等一個紅燈就生病？沒有人證明過', en: 'One red light making you ill? Nobody has shown that' },
  /** /estimate/#answers, the film transcript */
  K6: { 'zh-TW': '綠燈起步那一陣有多大，還沒有人量過，所以本站不印倍數。', en: 'Nobody has measured how big the burst at green is, so this site prints no multiplier.' },
} satisfies Record<string, L10n>;

// ---------------------------------------------------------------------------
// The screen frame, the sheet, the reader's settings
// ---------------------------------------------------------------------------

/** <Screen> and <ScreenRail> (brief 3.1). The rail marks the place in the story; it shows no seconds. */
export const screenText = {
  // English is one word each: the rail has room for about 26 Latin characters on a 320 px phone
  red: { 'zh-TW': '紅燈', en: 'Red' } as L10n,
  green: { 'zh-TW': '綠燈', en: 'Green' } as L10n,
  /** "2 / 15" */
  position: { 'zh-TW': '{n} / {total}', en: '{n} / {total}' } as L10n,
  /** The same, said aloud. */
  positionSr: { 'zh-TW': '第 {n} 張，共 {total} 張', en: 'Screen {n} of {total}' } as L10n,
  railLabel: { 'zh-TW': '你看到哪裡了', en: 'Where you are' } as L10n,
} as const;

/** <HowSheet> and <HowButton>: the sheet behind 怎麼知道的？ (brief 4.5). */
export const how = {
  button: { 'zh-TW': '怎麼知道的？', en: 'How do we know?' } as L10n,
  close: { 'zh-TW': '關閉', en: 'Close' } as L10n,
  /** Block 1 of an estimate sheet whose first block says how the computer worked it out (the
   *  simulation sheets, `computed`), in place of 量到的: nothing in that block was measured. */
  computedHead: { 'zh-TW': '電腦算的，不是量的', en: 'Worked out on a computer, not a measurement' } as L10n,
  /** The three block headings, by the kind of number the sheet stands behind. */
  heads: {
    estimate: [
      { 'zh-TW': '量到的', en: 'What was measured' },
      { 'zh-TW': '我們算的', en: 'What we worked out' },
      { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
    ],
    measured: [
      { 'zh-TW': '誰量的', en: 'Who measured it' },
      { 'zh-TW': '量到什麼', en: 'What they found' },
      { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
    ],
    official: [
      { 'zh-TW': '誰說的', en: 'Who says so' },
      { 'zh-TW': '說了什麼', en: 'What it says' },
      { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
    ],
    study: [
      { 'zh-TW': '誰研究的', en: 'Who studied it' },
      { 'zh-TW': '發現什麼', en: 'What they found' },
      { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
    ],
    derived: [
      { 'zh-TW': '用了哪些數字', en: 'The figures we used' },
      { 'zh-TW': '怎麼算', en: 'The sum' },
      { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
    ],
    market: [
      { 'zh-TW': '誰公布的', en: 'Who published it' },
      { 'zh-TW': '公布什麼', en: 'What it says' },
      { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
    ],
  } as Record<ChipKind, [L10n, L10n, L10n]>,
  /** Buttons: at most two per sheet. */
  fullMethod: { 'zh-TW': '完整算法', en: 'The full working' } as L10n,
  toMeasure: { 'zh-TW': '把推估換成實測', en: 'Turn the estimate into a measurement' } as L10n,
  fullEvidence: { 'zh-TW': '看完整的證據', en: 'See the full evidence' } as L10n,
  myTerms: { 'zh-TW': '用我的條件算', en: 'Work it out for me' } as L10n,
} as const;

/** The reader's settings: 字大 in the header; text size, animation and theme in the menu. */
export const settings = {
  heading: { 'zh-TW': '閱讀設定', en: 'Reading settings' } as L10n,
  textSize: { 'zh-TW': '文字大小', en: 'Text size' } as L10n,
  /** The header button's two glyphs: a small one and a large one. */
  textSizeGlyphs: { 'zh-TW': '字大', en: 'AA' } as L10n,
  textSizes: {
    md: { 'zh-TW': '標準', en: 'Standard' },
    lg: { 'zh-TW': '大', en: 'Large' },
    xl: { 'zh-TW': '特大', en: 'Largest' },
  } as Record<'md' | 'lg' | 'xl', L10n>,
  /** The header button's name: what it is, and the size it is at now. */
  textSizeNow: { 'zh-TW': '文字大小：{size}', en: 'Text size: {size}' } as L10n,
  motion: { 'zh-TW': '動畫', en: 'Animation' } as L10n,
  theme: { 'zh-TW': '深色', en: 'Dark theme' } as L10n,
  on: { 'zh-TW': '開', en: 'On' } as L10n,
  off: { 'zh-TW': '關', en: 'Off' } as L10n,
} as const;

// ---------------------------------------------------------------------------
// Component strings
// ---------------------------------------------------------------------------



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
/**
 * Hard words, explained where a page first uses them (brief 6.6: a gloss at first use). A page
 * names the words it uses; <WordHelp> prints them as one short line under its title.
 */
export const words = {
  label: { 'zh-TW': '這頁的幾個字', en: 'A few words on this page' } as L10n,
  pm25: { 'zh-TW': 'PM2.5：細懸浮微粒，很小的灰，小到可以吸進肺的深處', en: 'PM2.5: fine particles, dust small enough to reach deep into the lungs' } as L10n,
  ufp: { 'zh-TW': '超細微粒：比 PM2.5 還小很多的微粒', en: 'Ultrafine particles: far smaller again than PM2.5' } as L10n,
  ec: { 'zh-TW': '元素碳：黑色的碳粒，就是煙灰', en: 'Elemental carbon: black specks of carbon, that is, soot' } as L10n,
  benzene: { 'zh-TW': '苯（ㄅㄣˇ）：廢氣裡的一種氣體', en: 'Benzene: a gas in exhaust' } as L10n,
  ppm: { 'zh-TW': 'ppm：一百萬份空氣裡有幾份', en: 'ppm: parts in a million parts of air' } as L10n,
  ppb: { 'zh-TW': 'ppb：十億份空氣裡有幾份', en: 'ppb: parts in a billion parts of air' } as L10n,
  ug: { 'zh-TW': '微克：一百萬分之一公克', en: 'Microgram (µg): a millionth of a gram' } as L10n,
} as const;
export type WordId = Exclude<keyof typeof words, 'label'>;

export const tiles = {
  label: { 'zh-TW': '各縣市電動機車補助狀態', en: 'Electric-scooter subsidy status by city and county' } as L10n,
  legend: { 'zh-TW': '圖例', en: 'Key' } as L10n,
  /** The one subsidy-status legend of brief 7.7, as short chips. */
  states: {
    available: { 'zh-TW': '還有名額', en: 'Places left' },
    restricted: { 'zh-TW': '有條件', en: 'With conditions' },
    unpublished: { 'zh-TW': '剩多少名額沒公布', en: 'Places left not published' },
    exhausted: { 'zh-TW': '已用完', en: 'Used up' },
    ended: { 'zh-TW': '已截止', en: 'Closed' },
    unknown: { 'zh-TW': '今年補助查不到，請打電話問', en: 'This year’s local money not found: please phone' },
  } as Record<'available' | 'restricted' | 'unpublished' | 'exhausted' | 'ended' | 'unknown', L10n>,
  /** A place whose official site could not be reached on the check date: the sums use central subsidies only. */
  unknownDetail: { 'zh-TW': '{date} 查不到這個縣市今年自己的補助；下面的金額只算中央的補助。', en: 'On {date} we could not find this place’s own programme for this year; the sums use central subsidies only.' } as L10n,
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


/** Convenience: translate a ui string, with optional {token} replacement. */
export function t(value: L10n, locale: Locale, vars?: Record<string, string | number>): string {
  let s = value[locale];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

// ---------------------------------------------------------------------------
// Typography: one convention, applied where shared components print text
// ---------------------------------------------------------------------------
//
// THE CONVENTION (both languages unless stated)
//   Spacing   zh: one ordinary space between a Han character and an adjacent Latin letter or
//             digit — 「第 3 環」「PM2.5 很少」「2024 年」「12 小時」. Never a space next to
//             full-width punctuation (「（PM2.5）」), and none inside a number or unit.
//   Colons    after a label: zh 「：」 (full width, no space), en ': '. Use `colon(locale)`.
//   Brackets  zh copy uses full-width （）「」 and ／ between Chinese words.
//   Numbers   grouped with commas (20,980). Decimals as the source prints them.
//   Money     zh 「20,980 元」 (a no-break space before 元), en 'NT$20,980' (no space after NT$).
//             Never 元 and NT$ in one language (brief 6.6). Use `money()`.
//   Ranges    two numbers joined by an en dash with no spaces: 4–14, 0.67–0.86 (`range()`).
//             zh prose may write 「4 到 14」 instead; never a hyphen.
//   Negatives a true minus sign (U+2212): −40%.
//   Dates     for readers: zh 「2026 年 11 月 25 日」, en '25 November 2026' (`readerDate()`).
//             ISO (2026-11-25) only in data and machine-readable attributes.
//
// HOW TO USE IT
//   Components: wrap plain-text props in `typeset(text, locale)` before printing them (never on
//   HTML: it is a text transform). Pages: print registry text through a shared component, or call
//   `typeset` on it; build numbers with `money` / `range` / `readerDate` instead of template strings.

const HAN = '\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF';
const LATIN = 'A-Za-z0-9';
const hanThenLatin = new RegExp(`([${HAN}])([${LATIN}])`, 'g');
const latinThenHan = new RegExp(`([${LATIN}%³²‰°])([${HAN}])`, 'g');

/** The label colon for a locale: 「：」 in Chinese, ': ' in English. */
export const colon = (locale: Locale): string => (locale === 'en' ? ': ' : '：');

/**
 * Apply the site's typography convention to a plain-text string (see above). Idempotent.
 * Chinese gets Han–Latin spacing; both languages get spaced en-dash ranges closed up
 * ("0.67 – 0.86" → "0.67–0.86") and a true minus before a bare negative number.
 */
export function typeset(s: string, locale: Locale): string {
  let out = s.replace(/(\d) ?[–] ?(?=\d)/g, '$1–').replace(/(^|[\s(（])-(?=\d)/g, '$1−');
  if (locale === 'zh-TW') out = out.replace(hanThenLatin, '$1 $2').replace(latinThenHan, '$1 $2');
  return out;
}

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hanRun = new RegExp(`[${HAN}][${HAN}\\u3000-\\u303F\\uFF01-\\uFF0F\\uFF1A-\\uFF20\\u00B7·]*`, 'g');

/**
 * Escaped HTML for a plain-text string, with any Chinese run inside English copy wrapped in
 * <span lang="zh-Hant-TW"> (待轉區, 行人呼吸), so screen readers switch voice and the browser
 * picks the CJK font. Chinese copy is returned escaped and unchanged: Latin terms in it
 * (PM2.5, App, NT$) read correctly in a Chinese voice and need no markup.
 * Use with set:html. Shared components use it for titles, captions and source lines.
 */
export function langHtml(s: string, locale: Locale): string {
  const e = escHtml(s);
  return locale === 'en' ? e.replace(hanRun, (m) => `<span lang="zh-Hant-TW">${m}</span>`) : e;
}

/** A number grouped by the convention (20,980). */
export const num = (n: number, locale: Locale, maxDecimals = 2): string =>
  new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: maxDecimals }).format(n).replace('-', '−');

/**
 * Money, one way per language (brief 6.6): 「20,980 元」 in Chinese, 'NT$20,980' in English; never
 * both in one language. The Chinese space is a no-break space, so the number and 元 stay on
 * one line (the same output as the calculator's own `money()` in pages/electric/model.ts).
 */
export const money = (n: number, locale: Locale): string => {
  const amount = num(Math.abs(n), locale, 0);
  return `${n < 0 ? '−' : ''}${locale === 'en' ? `${units.ntd}${amount}` : `${amount} 元`}`;
};

/** A numeric range: 4–14 (en dash, no spaces). */
export const range = (a: number | string, b: number | string, locale: Locale): string =>
  `${typeof a === 'number' ? num(a, locale) : a}–${typeof b === 'number' ? num(b, locale) : b}`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** An ISO date (2026-11-25) for readers: 「2026 年 11 月 25 日」 / '25 November 2026'. */
export function readerDate(iso: string, locale: Locale): string {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso);
  if (!m) return iso;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), m[3] ? Number(m[3]) : 0];
  if (locale === 'en') return d ? `${d} ${MONTHS[mo - 1]} ${y}` : `${MONTHS[mo - 1]} ${y}`;
  return d ? `${y} 年 ${mo} 月 ${d} 日` : `${y} 年 ${mo} 月`;
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
