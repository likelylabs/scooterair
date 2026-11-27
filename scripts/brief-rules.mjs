// The redesign brief's wording rules as data, shared by scripts/check-copy.mjs (over the copy
// modules in src/i18n) and scripts/check-site.mjs (over the built pages in dist/).
//
// Source: docs/redesign-brief.md — section 4.6 (fair and unfair comparisons), 7.1 (the K
// sentences, the only "not yet measured / not yet known" wording allowed), and acceptance
// checks 1 to 3 in section 9.3. Amendment 12.2 adds the masks must-not-say list
// (research/masks/VERIFIED.json → mustNotSay).
//
// Plain ES module, no imports: Node and the browser-free checks load it as is.
//
// Each rule: { id, check, locale, re, rule, instead?, scope? }
//   id      stable id; an allow-list entry in src/i18n/copy-allowlist.json names it
//   check   1 = banned string (check 1), 3 = banned claim listed in check 3, 46 = the other rows
//           of section 4.6 (check-copy only: those are prompts that need a reader's judgement)
//   locale  'zh-TW' | 'en'
//   re      RegExp (no g flag)
//   scope   'headline' = applies to headlines only (h1–h3 on a page; copy ids naming a headline
//           or title in check-copy)
//
// If src/data/claims-policy.ts (lane A) defines a claim rule with the same id as one here, the
// registry rule wins and this one is skipped by check-copy, so the two never fire twice.

const zh = 'zh-TW';
const en = 'en';

// ---- check 1: strings that appear nowhere -------------------------------------------------
export const bannedStrings = {
  [zh]: ['沒人量過', '多濃沒人量過', '無資料', '待確認', '待補', '示意數據', '示意文字', '樣稿', '原型', '數字待換', '倒數暫停'],
  [en]: ['sample data', 'placeholder', 'prototype', 'to be confirmed', 'no data', 'lorem', 'TODO'],
};
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bannedRe = (s, locale) => (locale === en ? new RegExp(s === 'TODO' ? '\\bTODO\\b' : `\\b${escapeRe(s)}\\b`, s === 'TODO' ? '' : 'i') : new RegExp(escapeRe(s)));

// ---- check 2: the K sentences (section 7.1) -----------------------------------------------
// The trigger phrases may appear only inside one of these sentences, only on the pages listed.
export const kTriggers = {
  [zh]: ['沒有人量過', '還沒有人', '沒有人證明過', '算不出來'],
  [en]: ['not measured', 'never been measured', 'nobody has measured', 'nobody has shown'],
};
/**
 * pages: locale-neutral routes. 'sheet' = also allowed inside any sheet ([data-sheet]) on any page.
 * The texts are the brief's; lane B's shared strings (src/i18n/ui.ts) are loaded beside them by
 * the checks when they exist, so a small wording change there does not break the match.
 */
export const kSentences = [
  {
    id: 'K1',
    text: {
      [zh]: ['紅燈時站在機車旁邊的人吸到多少，還沒有人直接量過；最接近的，是運研所在行人等候區的量測。'],
      [en]: ["Nobody has yet measured directly what a person beside the scooters breathes at a red light. The closest is the Institute of Transportation's readings in pedestrian waiting areas."],
    },
    pages: ['/estimate/', '/about/', '/act/', '/print/brief/'],
  },
  {
    id: 'K2',
    text: { [zh]: ['苯和超細微粒，台灣還沒有人在紅燈路邊量過。'], [en]: ['Benzene and ultrafine particles have not yet been measured at a Taiwanese red light.'] },
    pages: ['/estimate/', '/evidence/'],
  },
  {
    id: 'K3',
    text: { [zh]: ['這排機車又加了多少超細微粒，現有的資料還算不出來。'], [en]: ['How many ultrafine particles the pack adds cannot be worked out from the data that exist.'] },
    pages: ['/estimate/'],
  },
  {
    id: 'K4',
    text: { [zh]: ['矮的地方，廢氣一樣多或更多；多多少，還算不出來。'], [en]: ['Lower down, the exhaust is the same or more. How much more cannot yet be worked out.'] },
    pages: ['/', '/questions/my-child/', '/estimate/'],
  },
  {
    id: 'K5',
    text: {
      [zh]: ['等一個紅燈就會生病嗎？沒有人證明過。', '等一個紅燈就生病？沒有人證明過'],
      [en]: ['Does one red light make you ill? Nobody has shown that.', 'One red light making you ill? Nobody has shown that'],
    },
    pages: ['/', '/90/', '/questions/one-red-light/', '/evidence/', 'sheet'],
  },
  {
    id: 'K6',
    text: { [zh]: ['綠燈起步那一陣有多大，還沒有人量過，所以本站不印倍數。'], [en]: ['Nobody has measured how big the burst at green is, so this site prints no multiplier.'] },
    pages: ['/estimate/', '/90/'],
  },
];
/** At most this many K-family occurrences across the whole site, per language (check 2). */
export const kBudget = 25;

/**
 * Normalise text for K matching: no whitespace, no punctuation, lower case. Both the page text and
 * the K sentence go through it, so spacing, full-width or half-width punctuation and line breaks
 * between inline elements never decide a match.
 */
export const kNorm = (s) => s.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');

/**
 * Where trigger phrases occur in `text` that are NOT inside one of `sentences` (normalised).
 * Returns { stray: [{ trigger, at }], kHits: [{ id, at }] } in normalised positions.
 */
export function kScan(text, locale, sentences = kSentences) {
  const n = kNorm(text);
  const kHits = [];
  for (const k of sentences)
    for (const s of k.text[locale] ?? []) {
      const ks = kNorm(s);
      if (!ks) continue;
      for (let i = n.indexOf(ks); i >= 0; i = n.indexOf(ks, i + 1)) kHits.push({ id: k.id, at: i, end: i + ks.length });
    }
  const stray = [];
  for (const t of kTriggers[locale]) {
    const tn = kNorm(t);
    for (let i = n.indexOf(tn); i >= 0; i = n.indexOf(tn, i + 1)) {
      if (!kHits.some((h) => i >= h.at && i + tn.length <= h.end)) stray.push({ trigger: t, at: i });
    }
  }
  // one K sentence counts once even when it holds two triggers (K6 holds 沒有人量過 and 還沒有人)
  const seen = new Set();
  const uniqueK = kHits.filter((h) => {
    const key = `${h.at}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { stray, kHits: uniqueK, norm: n };
}

// ---- checks 3 and 4.6: banned claims and wording -----------------------------------------
const R = (id, check, locale, re, rule, extra = {}) => ({ id, check, locale, re, rule, ...extra });

export const claimRules = [
  // check 3, as listed in 9.3
  R('brief-no-multiple-headline', 3, zh, /(\d+(\.\d+)?|[兩二三四五六七八九十幾])\s*倍/, 'No multiple (N 倍) in a headline or big figure (4.6: never a multiple of background as a headline).', { scope: 'headline' }),
  R('brief-no-multiple-headline', 3, en, /\b\d+(\.\d+)?\s*(times|×|x)\b|\b(twice|double|triple|threefold|fourfold)\b/i, 'No multiple of background in a headline or big figure (4.6).', { scope: 'headline' }),
  R('brief-no-buildup', 3, zh, /越久.{0,8}越多|愈久.{0,8}愈多|積得越多|越積越多|越等越多/, 'No "the longer the red, the more builds up" (4.6, 5.1: nothing changes with time through the red).'),
  R('brief-no-buildup', 3, en, /the longer (the|you) (red|wait|light|stand).{0,50}(more|build|worse)|builds? up (during|through|over) the red/i, 'No "the longer the red, the more builds up" (4.6).'),
  R('brief-no-child-height-number', 3, zh, /(1\.7|2\.2)\s*倍|1\.7\s*[到至–~\-－]\s*2\.2/, 'No number for child height: never 1.7 or 2.2 倍 (4.6, screen 8). The breathing fact is 1.5 到 2 倍 per kilogram.'),
  R('brief-no-child-height-number', 3, en, /(1\.7|2\.2)\s*(times|×|x)\b|1\.7\s*(–|-|to)\s*2\.2/i, 'No number for child height: never 1.7 or 2.2 times (4.6).'),
  // research/simulation/statements.json must-not 3 (2026-11-27): a 1-, 10- or 90-second value never in the same
  // sentence as the WHO 15-minute (87 ppm) or 1-hour (31 ppm) value. Checked on the built pages, where the numbers are.
  R('brief-no-seconds-beside-guideline', 3, zh, /(?:^|[。；])(?=[^。；]*(?:\d+\s*秒|一秒|幾秒|每一秒))(?=[^。；]*(?:87|31)\s*ppm)(?=[^。；]*?(?<![\d.])(?!(?:87|31)\s*ppm)\d[\d,]*(?:\.\d+)?\s*(?:到\s*\d[\d,]*(?:\.\d+)?\s*)?ppm)/, 'No 1-, 10- or 90-second value in the same sentence as the WHO 15-minute (87 ppm) or 1-hour (31 ppm) value (simulation must-not 3). Convert to a 15-minute average first, or say it apart.'),
  R('brief-no-seconds-beside-guideline', 3, en, /(?:^|;|\.\s)(?=(?:[^;.]|\.(?=\d))*\b(?:seconds?|one-second|\d+-second)\b)(?=(?:[^;.]|\.(?=\d))*\b(?:87|31)\s*ppm)(?=(?:[^;.]|\.(?=\d))*?(?<![\d.])(?!(?:87|31)\s*ppm)\d[\d,]*(?:\.\d+)?\s*(?:(?:to|–|-)\s*\d[\d,]*(?:\.\d+)?\s*)?ppm)/i, 'No 1-, 10- or 90-second value in the same sentence as the WHO 15-minute (87 ppm) or 1-hour (31 ppm) value (simulation must-not 3).'),
  R('brief-no-riders-most', 3, zh, /吸得最多|吸最多|吸到最多/, 'Never that riders breathe "the most" (4.6, screen 9).'),
  R('brief-no-riders-most', 3, en, /breathes? (in )?the most|the most exposed/i, 'Never that riders breathe "the most" (4.6).'),
  R('brief-idling-legal', 3, zh, /怠速.{0,20}(違規|違法|合法)|(違規|違法|合法).{0,20}怠速/, 'No 違規 or 合法 about idling (3.2 screen 3, 6.6). Say what the rule asks: 停車等候超過三分鐘才要熄火.'),
  R('brief-idling-legal', 3, en, /idl\w*.{0,40}\b(illegal|unlawful|legal|against the law)\b|\b(illegal|unlawful|legal)\b.{0,40}\bidl/i, 'No "illegal" or "legal" about idling (6.6).'),
  R('brief-vocab-chelius', 3, zh, /車流廢氣/, 'Write 車子的廢氣, not 車流廢氣 (6.6).', { instead: '車子的廢氣' }),
  R('brief-vocab-chedui', 3, zh, /車隊/, 'Write 一排機車, not 車隊 (6.6).', { instead: '一排機車' }),
  R('brief-vocab-zuizang', 3, zh, /最髒/, 'Write 排最多的一成, not 最髒 (6.6).', { instead: '排最多的一成' }),
  R('brief-vocab-yu', 3, zh, /愈/, 'Write 越…越…, not 愈 (6.6).', { instead: '越' }),
  R('brief-vocab-shuijian', 3, zh, /(?<!貨物)稅減/, 'Write 減稅, not 稅減 (6.6, 7.7). The official 貨物稅減徵 / 貨物稅減免 are names, not this mistake.', { instead: '減稅' }),

  // the other rows of 4.6 (check-copy; a match is a prompt to read the copy against the rule)
  R('brief-no-long-limits', 46, zh, /(8|八|24|二十四)\s*小時.{0,4}(平均|標準|限值|指引)|年平均.{0,4}(標準|限值|指引)|空氣品質指標.{0,6}(顏色|燈號)|AQI.{0,6}(顏色|燈號|紅|紫)/, 'No 8-hour, 24-hour or yearly limit against 90 seconds, and no AQI colours (4.6). The one comparable value is the WHO 15-minute carbon monoxide guideline.'),
  R('brief-no-long-limits', 46, en, /\b(8|eight|24|twenty-four)[- ]hour (limit|standard|guideline|mean|average)|\bannual (limit|standard|guideline)|\bAQI colou?rs?/i, 'No 8-hour, 24-hour or annual limit against 90 seconds; no AQI colours (4.6).'),
  R('brief-no-cigarettes', 46, zh, /香菸|抽菸|一根菸/, 'No comparison with cigarettes (4.6).'),
  R('brief-no-cigarettes', 46, en, /cigarettes?/i, 'No comparison with cigarettes (4.6).'),
  R('brief-no-cancer-risk', 46, zh, /致癌風險|罹癌風險|得癌症的機率/, 'No cancer risk from 90 seconds (4.6). Benzene may be called a proven cause of cancer; no risk figure.'),
  R('brief-no-cancer-risk', 46, en, /cancer risk|risk of (getting )?cancer/i, 'No cancer risk from 90 seconds (4.6).'),
  R('brief-no-poisoning', 46, zh, /中毒/, 'No poisoning (4.6): the levels are far below short-term limits.'),
  R('brief-no-poisoning', 46, en, /poison/i, 'No poisoning (4.6).'),
  R('brief-no-pullaway-multiplier', 46, zh, /起步.{0,15}\d+(\.\d+)?\s*倍|\d+(\.\d+)?\s*倍.{0,15}起步/, 'No multiplier for the pull-away at green (4.6, K6).'),
  R('brief-no-pullaway-multiplier', 46, en, /(pull(s|ing)? away|at green|burst).{0,40}\d+(\.\d+)?\s*(times|×)/i, 'No multiplier for the pull-away at green (4.6, K6).'),
  R('brief-no-distance-rule', 46, zh, /(退|站遠|離開|往後|遠離).{0,10}\d+(\.\d+)?\s*(公尺|米)|少吸.{0,6}(一半|\d+\s*%)/, 'No "step back N metres and breathe X less" (4.6, 12.3): distance advice is qualitative only.'),
  R('brief-no-distance-rule', 46, en, /step (back|away) \d|\d+(\.\d+)?\s*(m|metres?|meters?) (back|away).{0,40}(less|lower|halve)|halves? (your )?(exposure|what you breathe)/i, 'No "step back N metres and breathe X less" (4.6, 12.3).'),
  R('brief-no-child-height-plus', 46, zh, /[+＋]\s*10\s*%/, 'No number for child height ("+10%") (4.6).'),
  R('brief-no-child-height-plus', 46, en, /\+\s*10\s*%/, 'No number for child height ("+10%") (4.6).'),
  R('brief-no-ultrafine-number', 46, zh, /(超細微粒|微粒數).{0,15}(?<![Pp][Mm][\d.]*)\d[\d,.]*\s*萬?\s*(個|顆|\/|每立方公分)|\d[\d,]*\s*(個|顆)\s*\/\s*(立方公分|cm3|cm³)/, 'No ultrafine-particle number for the pack, and no WHO particle-number mark (4.6, K2, K3).'),
  R('brief-no-ultrafine-number', 46, en, /(ultrafine|particle number).{0,30}(?<!PM[\d.]*)\b\d[\d,.]*\s*(thousand|million|particles|\/\s*cm|per (cubic )?c(m|entimetre))|\d[\d,]*\s*(particles)?\s*(\/|per)\s*(cm3|cm³|cubic centimetre)/i, 'No ultrafine-particle number for the pack, and no WHO particle-number mark (4.6).'),
  R('brief-no-everything-rises', 46, zh, /一氧化碳.{0,10}(多|高|上升|增加).{0,12}(所有|全部|其他|每一種).{0,8}(污染|都)/, 'Not "when carbon monoxide rises everything rises": only fresh fuel vapour and benzene (4.6, screen 5).'),
  R('brief-no-everything-rises', 46, en, /carbon monoxide (rises|goes up|is higher).{0,40}(everything|all (the )?(other )?pollutants|every pollutant)/i, 'Not "when carbon monoxide rises everything rises" (4.6).'),
  R('brief-no-never-measured-tw', 46, zh, /(一氧化碳|PM2\.5|細懸浮微粒).{0,20}(從來)?(沒有人|沒人|無人)(量|測)過/, 'Not that carbon monoxide or PM2.5 "has never been measured" at Taiwanese crossings: the Institute of Transportation measured both (4.6, 7.8).'),
  R('brief-no-never-measured-tw', 46, en, /(carbon monoxide|PM2\.5).{0,40}(never been measured|has not been measured|have not been measured|nobody has measured)/i, 'Not that carbon monoxide or PM2.5 "has never been measured" at Taiwanese crossings (4.6).'),
  R('brief-no-rider-blame', 46, zh, /騎士不熄火|騎士.{0,6}(害|污染了)/, 'Riders are never blamed: write 機車沒有熄火 or 引擎沒熄火 (6.6).', { instead: '引擎沒熄火' }),

  // masks (12.2, research/masks/VERIFIED.json mustNotSay)
  R('brief-masks-useless', 46, zh, /口罩.{0,8}(沒用|無用|完全沒效|一點用也沒有)/, 'Never "masks are useless" (12.2): they help against infection, and a fitted respirator cuts particles.'),
  R('brief-masks-useless', 46, en, /masks? (are|is) (useless|pointless|no use)|masks? do(es)? nothing/i, 'Never "masks are useless" (12.2).'),
  R('brief-masks-percent', 46, zh, /口罩.{0,20}(擋|過濾|濾掉).{0,10}\d+\s*%|7\d\s*[%到至–\-]\s*8\d\s*%/, 'No filter-material percentage presented as protection as worn; never the old 70–80% figure (12.2, 7.5).'),
  R('brief-masks-percent', 46, en, /masks?.{0,30}(filters?|blocks?|stops?).{0,15}\d+\s*%|7\d\s*(%|–|-|to)\s*8\d\s*%/i, 'No filter-material percentage presented as protection as worn (12.2).'),
  R('brief-masks-carbon-blocks', 46, zh, /活性碳.{0,12}(擋得住|可以擋|能擋|阻擋).{0,10}(廢氣|一氧化碳|毒氣)/, 'Never that activated-carbon masks block exhaust or carbon monoxide (12.2).'),
  R('brief-masks-carbon-blocks', 46, en, /(activated[- ])?carbon masks?.{0,20}(block|stop|filter)s?.{0,20}(exhaust|carbon monoxide|toxic gas)/i, 'Never that activated-carbon masks block exhaust or carbon monoxide (12.2).'),
  R('brief-masks-n95-children', 46, zh, /(小孩|兒童|孩子|寶寶).{0,10}(戴|配戴).{0,6}N95/, 'No advice to put N95s on children (12.2).'),
  R('brief-masks-n95-children', 46, en, /(children|kids?|child) (should )?wear (an )?N95/i, 'No advice to put N95s on children (12.2).'),
];

/** Rules of check 1, in the same shape as claimRules. */
export const bannedRules = Object.entries(bannedStrings).flatMap(([locale, list]) =>
  list.map((s) => R('brief-banned-string', 1, locale, bannedRe(s, locale), `"${s}" appears nowhere on the site (9.3 check 1).`)),
);

/**
 * Vocabulary of 6.6 (check-copy --vocab only; advice, never a failure: many of these words are
 * right in a sheet or on the adults' page).
 */
export const vocabAdvice = [
  [/摩托車|載具|機車族/, '機車、燃油機車、電動機車'],
  [/交通相關空氣污染/, '車子的廢氣'],
  [/碳氫化合物|揮發性有機物/, '油氣（沒燒完的汽油）; a sheet may add the technical word once'],
  [/粉塵/, '微粒 for exhaust; 粉塵 only for tyre, brake and road dust'],
  [/暴露/, '吸到、吸進'],
  [/濃度/, '多少、多濃 (outside sheets)'],
  [/關聯|導致/, '有關、比較多'],
  [/估計|估算|試算/, '推估 (the site\'s own air numbers); 算 as the verb'],
  [/兒童|孩童|成人|族群/, '小孩、大人、阿嬤、寶寶'],
  [/交叉口|行人穿越道/, '路口、斑馬線'],
  [/登錄表|次級來源/, '本站的資料、出處'],
  [/\d\s*台(機車|電動|燃油)|\d\s*部機車/, '輛'],
];
