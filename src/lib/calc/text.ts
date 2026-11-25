// Localized text the engine generates: number and date formatting, condition explanations,
// exclusion reasons and message templates. Traditional Chinese uses full-width punctuation;
// __tests__/text.test.ts checks every generated string against the same rules as check-data.

import { t } from '../../data/types.ts';
import type { L10n, Locale } from '../../data/types.ts';
import type { ExclusionReason } from './types.ts';

export { t };
export type { L10n, Locale };

/** 12,345 in both languages (zh-TW also groups with commas). */
export const n = (v: number): string => Math.round(v).toLocaleString('en-US');
/** NT$ amounts. */
export const ntd = (v: number): L10n => t(`${n(v)}元`, `NT$${n(v)}`);
export const ntdText = (v: number, locale: Locale): string => ntd(v)[locale];

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function date(d: string): L10n {
  const [y, m, day] = d.split('-').map(Number);
  return t(`${y}年${m}月${day}日`, `${day} ${MONTHS_EN[m - 1]} ${y}`);
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

/** "Label: detail" in both languages. */
export const detail = (label: L10n, more: L10n): L10n => t(`${label['zh-TW']}：${more['zh-TW']}`, `${label.en}: ${more.en}`);

export const reasonText: Record<ExclusionReason, L10n> = {
  'not-eligible': t('不符合資格', 'Not eligible'),
  'mutually-exclusive': t('與金額較高的項目擇一', 'Either/or with a larger item'),
  expired: t('已過申請期限', 'Programme has ended'),
  'not-yet-valid': t('尚未開始', 'Not yet open'),
  unconfirmed: t('公告期限較長，但上位辦法只確認到2026年底', 'Listed as running longer, but its umbrella rule is confirmed only to the end of 2026'),
  'quota-exhausted': t('名額或經費已用完', 'Quota or budget used up'),
  unverified: t('未能查證', 'Not verified'),
  'not-published': t('官方未公布金額', 'Amount not published'),
  'secondary-only': t('只見於新聞稿或媒體報導', 'Only in a press release or media report'),
  ambiguous: t('規定不明確，未計入', 'Rule unclear, not counted'),
  'requirement-not-met': t('須先申請另一項目', 'Requires another item first'),
  'model-unknown': t('車款資料不足', 'Model details unknown'),
};

export const ui = {
  list: t('建議售價', 'List price'),
  listGas: t('建議售價（不含牌險）', 'List price (ex plate and insurance)'),
  net: t('實付價格', 'What you pay'),
  netElectric: t('電動機車實付價格', 'Electric scooter: what you pay'),
  netGas: t('燃油機車實付價格', 'Gasoline scooter: what you pay'),
  gap: t('和燃油機車的差距', 'Gap to the gasoline scooter'),
  upTo: t('（最高）', ' (up to)'),
  electric: t('電動機車', 'Electric scooter'),
  gasoline: t('燃油機車', 'Gasoline scooter'),
  item: t('項目', 'Item'),
  amount: t('金額', 'Amount'),
  month: t('時間', 'Time'),
  purchase: t('購買時', 'Purchase'),
  year: t('第 {n} 年', 'Year {n}'),
  even: t('第 {n} 個月打平', 'Even at month {n}'),
  never: t('五年內不會打平', 'No break-even within five years'),
  ahead: t('買和騎都比較便宜', 'Cheaper to buy and to run'),
  catchesUp: t('買時較便宜，但第 {n} 個月起總花費超過燃油機車', 'Cheaper to buy, but total cost passes the gasoline scooter at month {n}'),
};
