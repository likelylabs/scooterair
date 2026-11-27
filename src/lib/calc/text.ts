// Localized text the engine generates: number and date formatting, condition explanations,
// exclusion reasons and message templates. Traditional Chinese uses full-width punctuation;
// __tests__/text.test.ts checks every generated string against the same rules as check-data.

import { t } from '../../data/econ/l10n.ts';
import type { L10n, Locale } from '../../data/types.ts';
import type { ExclusionReason } from './types.ts';

export { t };
export type { L10n, Locale };

// One formatter for the whole engine: Number.toLocaleString builds a new Intl.NumberFormat on
// every call, which made a single calculator answer spend seconds formatting numbers.
const GROUPED = new Intl.NumberFormat('en-US');
/** 12,345 in both languages (zh-TW also groups with commas). */
export const n = (v: number): string => GROUPED.format(Math.round(v));
/** NT$ amounts. */
export const ntd = (v: number): L10n => t(`${n(v)}元`, `NT$${n(v)}`);
export const ntdText = (v: number, locale: Locale): string => ntd(v)[locale];

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function date(d: string): L10n {
  const [y, m, day] = d.split('-').map(Number);
  // The page's own form (site-state formatDate): "2026 年 12 月 31 日".
  return t(`${y} 年 ${m} 月 ${day} 日`, `${day} ${MONTHS_EN[m - 1]} ${y}`);
}

/** Join localized fragments: zh with 、, en with commas. */
export function list(items: L10n[]): L10n {
  return t(items.map((i) => i['zh-TW']).join('、'), items.map((i) => i.en).join(', '));
}

export const join = (...parts: L10n[]): L10n =>
  t(
    parts.map((p) => p['zh-TW']).join(''),
    parts
      .map((p) => p.en)
      .filter(Boolean)
      .join(' '),
  );

const ZH_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
/** A horizon in words: 60 → 五年 / five years; 36 → 三年 / three years; 30 → 30個月 / 30 months. */
export function horizonText(months: number): L10n {
  if (months % 12 === 0) {
    const y = months / 12;
    return t(`${y <= 10 ? ZH_NUM[y] : y}年`, y === 1 ? 'one year' : `${y <= 10 ? EN_NUM[y] : y} years`);
  }
  return t(`${months}個月`, months === 1 ? 'one month' : `${months} months`);
}

/** "N days left" / "today is the last day" for a deadline. */
export function daysLeftText(days: number, on: string): L10n {
  const d = date(on);
  if (days <= 0) return t(`今天（${d['zh-TW']}）是最後一天`, `Today (${d.en}) is the last day`);
  return t(`距離 ${d['zh-TW']}還有${days}天`, `${days} day${days === 1 ? '' : 's'} left until ${d.en}`);
}

// Ordinary words that start the English fragments the engine and the data join after a colon or
// semicolon. Only these are lower-cased: names (Gogoro, New Taipei, MOEA…) keep their capital.
const ORDINARY_START = /^(The|This|These|That|A|An|Requires|Require|Must|Not|No|Only|Contract|Listed|Purchases|Purchase|Programme|Quota|Age|Ages|Either|Amount|Rule|Model|Offer|Order|Invoice|Buy|Low|Middle|Residents|Swap|Swaps|Battery|Household|Paid|Places|Remaining|Electric|Gasoline|Scrap|Scrapping|Living|Working|Having|Being|Registered|Built|From|Does|Could|We|You|Your|It|If|In|On|At|For|Each|Every|Free|Up|Its|One|Two|Both|Any|Some|Most|Lower|Middle-low|Low-income|Applicants?)\b/;

/** Lower-case the first letter of an English fragment that continues a sentence, unless it starts with a name. */
export function lowerFirst(s: string): string {
  return ORDINARY_START.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/** "Label: detail" in both languages (English: the detail continues the sentence, so it is not capitalised). */
export const detail = (label: L10n, more: L10n): L10n => t(`${label['zh-TW']}：${more['zh-TW']}`, `${label.en}: ${lowerFirst(more.en)}`);

export const reasonText: Record<ExclusionReason, L10n> = {
  'not-eligible': t('不符合資格', 'Not eligible'),
  'needs-answer': t('沒有算進去', 'Not counted'),
  'mutually-exclusive': t('與金額較高的項目擇一', 'Either/or with a larger item'),
  expired: t('已過購車期限', 'Programme has ended'),
  'not-yet-valid': t('尚未開始', 'Not yet open'),
  unconfirmed: t('公告的期限比較長，但它所依據的補助辦法只確定到 2026 年底', 'Listed as running longer, but the rule it rests on is confirmed only to the end of 2026'),
  'quota-exhausted': t('名額或經費已用完', 'Quota or budget used up'),
  unverified: t('沒有查證到', 'Not verified'),
  'not-published': t('官方未公布金額', 'Amount not published'),
  'secondary-only': t('只見於新聞稿或媒體報導', 'Only in a press release or media report'),
  ambiguous: t('規定不明確，未計入', 'Rule unclear, not counted'),
  'requirement-not-met': t('須先申請另一項目', 'Requires another item first'),
  'model-unknown': t('車款資料不足', 'Model details not confirmed'),
};

export const ui = {
  // Electric prices come from makers' sites, calculators and retail listings, not printed list
  // prices (each model's note says which), so the row is not called 建議售價.
  list: t('查到的售價', 'Price we found'),
  listGas: t('建議售價（不含牌險）', 'List price (ex plate and insurance)'),
  net: t('實付價格', 'What you pay'),
  netElectric: t('電動機車實付價格', 'Electric scooter: what you pay'),
  netGas: t('燃油機車實付價格', 'Petrol scooter: what you pay'),
  gap: t('和燃油機車的差距', 'Gap to the petrol scooter'),
  upTo: t('（最高）', ' (up to)'),
  electric: t('電動機車', 'Electric scooter'),
  gasoline: t('燃油機車', 'Petrol scooter'),
  item: t('項目', 'Item'),
  amount: t('金額', 'Amount'),
  month: t('時間', 'Time'),
  purchase: t('購買時', 'Purchase'),
  year: t('第 {n} 年', 'Year {n}'),
  even: t('第 {n} 個月打平', 'Even at month {n}'),
  never: t('五年內不會打平', 'No break-even within five years'),
  /** The same for any horizon: {h} is horizonText(). */
  neverIn: t('{h}內不會打平', 'No break-even within {h}'),
  /** Dearer to buy, briefly even, dearer again at the horizon. */
  evenThenBehind: t('第 {n} 個月曾一度打平，但{h}後仍貴 {gap}', 'Briefly even at month {n}, but {gap} dearer after {h}'),
  /** Cheaper to buy, costs more to run, still ahead at the horizon. */
  aheadDearerToRun: t('買時較便宜；騎起來較貴，但{h}內總花費仍較低', 'Cheaper to buy; costs more to run but still cheaper in total over {h}'),
  /** Cheaper to buy and at the horizon, but dearer for a while in between. */
  aheadWithDip: t('買時較便宜，{h}後總花費仍較低（中間有幾個月較貴）', 'Cheaper to buy and still cheaper in total after {h} (dearer for a few months in between)'),
  ahead: t('買和騎都比較便宜', 'Cheaper to buy and to run'),
  catchesUp: t('買時較便宜，但第 {n} 個月起總花費超過燃油機車', 'Cheaper to buy, but total cost passes the petrol scooter at month {n}'),
};
