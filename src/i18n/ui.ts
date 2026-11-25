// Shared interface strings, in both languages.
// The site names live here and nowhere else: change them once, everything follows.

import type { L10n, Locale } from './index';

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
      '機車廢氣排在膝蓋的高度，直接進到路口行人的呼吸裡。這個網站整理街道層級的空氣污染證據，以及換成電動機車的實際做法。',
    en: 'Scooter exhaust leaves the tailpipe at knee height, straight into the air people breathe at the crossing. The street-level evidence from Taiwan, and the practical case for going electric.',
  } as L10n,
} as const;

export interface NavItem {
  /** Locale-neutral path, passed through href(). */
  path: string;
  label: L10n;
}

/** Primary navigation, in order. Home is reached through the wordmark. */
export const nav: NavItem[] = [
  { path: '/problem/', label: { 'zh-TW': '問題', en: 'The problem' } },
  { path: '/evidence/', label: { 'zh-TW': '證據', en: 'Evidence' } },
  { path: '/electric/', label: { 'zh-TW': '換電動', en: 'Going electric' } },
  { path: '/act/', label: { 'zh-TW': '行動', en: 'Take action' } },
  { path: '/sources/', label: { 'zh-TW': '資料來源', en: 'Sources' } },
  { path: '/about/', label: { 'zh-TW': '關於', en: 'About' } },
];

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
        '路口側面示意圖：一大群燃油機車在停止線後怠速等紅燈，廢氣貼著地面堆積，愈靠近地面愈濃。行人正從車陣前走過斑馬線：嬰兒車裡的嬰兒和戴黃帽的小學生，口鼻都在最濃的那一層；成人和長者的頭則高出一些。',
      en: 'Side view of a crossing: a large pack of gasoline scooters idles behind the stop line at a red light. Exhaust pools along the ground, densest at the bottom. Pedestrians cross in front of the pack: the baby in the stroller and the schoolchild in a yellow cap breathe inside the densest layer; the adults’ heads are a little above it.',
    },
    altClean: {
      'zh-TW':
        '同一個路口的側面示意圖：停止線後等紅燈的換成了電動機車，地面附近沒有廢氣層，行人走過斑馬線時空氣是清的。',
      en: 'The same crossing, side view: the scooters waiting at the red light are electric. There is no exhaust layer near the ground, and the air the pedestrians cross through is clear.',
    },
  },
  // Pollutant vocabulary (how each is drawn)
  pollutant: {
    odorTitle: { 'zh-TW': '聞得到的', en: 'What you smell' },
    odorBody: {
      'zh-TW': '沒燒完的油氣。畫成貼地的暖色霧層。',
      en: 'Unburnt fuel vapours. Drawn as a warm haze that hugs the ground.',
    },
    coTitle: { 'zh-TW': '聞不到的氣體', en: 'The gas you can’t smell' },
    coBody: {
      'zh-TW': '一氧化碳，無色無味。畫成空心圓圈。',
      en: 'Carbon monoxide: no colour, no smell. Drawn as hollow rings.',
    },
    ufpTitle: { 'zh-TW': '看不到的微粒', en: 'The particles you can’t see' },
    ufpBody: {
      'zh-TW': '超細懸浮微粒。畫成針尖大小的細點，飄得比霧層更高。',
      en: 'Ultrafine particles. Drawn as pin-point stipple that drifts higher than the haze.',
    },
  },
} as const;

/**
 * The evidence chain: the site's argument, one link at a time. Titles live
 * here so the overview, the chapter markers and the nav always agree.
 * `n` is 1-based. The last link is the one the reader can act on.
 */
export const chain = {
  name: { 'zh-TW': '證據鏈', en: 'Evidence chain' } as L10n,
  linkOf: { 'zh-TW': '第 {n} 環，共 {total} 環', en: 'Link {n} of {total}' } as L10n,
  breakable: { 'zh-TW': '這一環，你可以切斷', en: 'The link you can break' } as L10n,
  links: [
    { 'zh-TW': '排氣管排出什麼', en: 'What leaves the tailpipe' },
    { 'zh-TW': '排在哪裡', en: 'Where it comes out' },
    { 'zh-TW': '人因此吸進什麼', en: 'What people then breathe' },
    { 'zh-TW': '這些物質會做什麼', en: 'What those compounds do' },
    { 'zh-TW': '長期吸廢氣的人怎麼了', en: 'What happens to people who breathe it' },
    { 'zh-TW': '誰吸得最多', en: 'Who gets the highest dose' },
    { 'zh-TW': '哪一環可以切斷', en: 'Which link you can break' },
  ] as L10n[],
} as const;

/** How strong the evidence behind a claim is. Order = strongest first. */
export const evidence = {
  heading: { 'zh-TW': '證據強度', en: 'Evidence strength' } as L10n,
  levels: {
    measured: {
      label: { 'zh-TW': '在台灣量測到', en: 'Measured in Taiwan' } as L10n,
      help: { 'zh-TW': '有在台灣街頭實際量測的研究。', en: 'Backed by measurements taken on Taiwanese streets.' } as L10n,
    },
    established: {
      label: { 'zh-TW': '國際上已確立', en: 'Established internationally' } as L10n,
      help: { 'zh-TW': '國際機構或大型文獻回顧的共識。', en: 'The consensus of international bodies or large reviews.' } as L10n,
    },
    inference: {
      label: { 'zh-TW': '我們的推論', en: 'Our inference' } as L10n,
      help: { 'zh-TW': '由前面幾環合理推得，但沒有直接量測。', en: 'Follows reasonably from the links before it, but not measured directly.' } as L10n,
    },
    gap: {
      label: { 'zh-TW': '尚未證實', en: 'Not yet shown' } as L10n,
      help: { 'zh-TW': '目前沒有研究直接回答這一點。', en: 'No study has answered this directly yet.' } as L10n,
    },
  },
} as const;
export type EvidenceLevel = keyof typeof evidence.levels;

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
