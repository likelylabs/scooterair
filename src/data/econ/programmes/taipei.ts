// Taipei City 2026 (plan amended 2026-06-01; press release 2026-11-20). research/econ/taipei.json

import type { Programme } from '../types.ts';
import { age, builtBy, fixed, flag, heavy, heavyOrLight, light, lowIncome, quota, residency, scrap, scrapAge, small, t, twoStroke } from './helpers.ts';

const PAYER = t('臺北市政府環境保護局', 'Taipei City Department of Environmental Protection');
const PLAN = ['taipei-dep-ev-subsidy-plan'] as const;
const LIVE = 'taipei-envimac-application-system' as const;
const STATUS_2027 = t('計畫期間至115年12月31日，未見116年計畫。', 'The plan ends on 31 December 2026; no 2027 plan seen.');
const APPLY = t('購車、領牌、報廢都須在115年12月31日前完成，116年1月10日前線上申請（115年12月31日起網址改為 www.subsidy.gov.taipei）。', 'Buy, register and scrap by 31 December 2026 and apply online by 10 January 2027 (the site moves to www.subsidy.gov.taipei from 31 December 2026).');

const general = [residency(1), age(18)];
const GENERAL_TEXT =
  '年滿18歲、設籍臺北市滿1年（以發票日為準），購買經濟部認可的國產電動機車並在臺北市首次領牌；每人限1輛，依申請順序核撥至預算用罄，補助總額不超過購車金額。';
const GENERAL_TEXT_EN =
  'Aged 18+, registered in Taipei for at least a year at the invoice date, buying an MOEA-approved domestic model first plated in Taipei; one per person, paid in order until the budget runs out, never more than the purchase price.';
const OLD_TEXT = '舊車為出廠滿10年以上的燃油機車，114年12月31日前已設籍臺北市且115年未遷出，並於115年內報廢回收。';
const OLD_TEXT_EN = 'The old scooter is a gasoline scooter at least 10 years old, registered in Taipei by 31 December 2025 with no move-out in 2026, and scrapped and recycled in 2026.';
const TWO_TEXT = '舊車為民國92年12月31日以前出廠的二行程機車，設籍與報廢規定同上。';
const TWO_TEXT_EN = 'The old scooter is a two-stroke built on or before 31 December 2003, with the same registration and scrapping rules.';
const oldReg = { kind: 'scrap-registered-locally' as const, byDate: '2025-12-31' };

const slots = (remaining: number, label: [string, string]) =>
  quota(
    remaining < 300 ? 'nearly-exhausted' : 'limited',
    '2026-11-25',
    t(`2026年11月25日線上系統顯示${label[0]}剩餘${remaining.toLocaleString('en')}個名額（個人申請）。`, `On 25 November 2026 the online system showed ${remaining.toLocaleString('en')} ${label[1]} places left (individual applicants).`),
    { remaining, sources: [LIVE] },
  );

const base = (p: Partial<Programme> & Pick<Programme, 'id' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'quota' | 'research'>): Programme => ({
  jurisdiction: 'taipei',
  payer: 'local',
  payerName: PAYER,
  kind: 'purchase-subsidy',
  side: 'electric',
  cap: 'local-total-at-most-price',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  applicationDeadline: '2027-01-10',
  applicationNote: APPLY,
  status2027: STATUS_2027,
  sources: [...PLAN],
  confidence: 'verified',
  calculator: true,
  ...p,
});

const notPrinted = {
  excluded: t('計畫將小型輕型列為補助對象，申辦系統也有小型名額，但附件二沒有印出小型輕型的市府金額；試算不假設任何金額。', 'The plan lists small-light scooters as eligible and the system has a small-class quota, but the amount table prints no city amount for them; we do not assume one.'),
  reason: 'not-published' as const,
};

export const taipeiProgrammes: Programme[] = [
  base({
    id: 'tpe-new-heavy',
    name: t('臺北市新購電動機車（重型）', 'Taipei new electric scooter (heavy)'),
    amount: fixed(10000),
    conditions: [...general, heavy],
    conditionText: t(GENERAL_TEXT, GENERAL_TEXT_EN),
    exclusiveGroups: ['tpe-base'],
    quota: slots(4943, ['新購重型', 'new-purchase heavy-class']),
    research: ['taipei#tpe-new-heavy', 'taipei#tpe-live-quota'],
  }),
  base({
    id: 'tpe-new-light',
    name: t('臺北市新購電動機車（輕型）', 'Taipei new electric scooter (light)'),
    amount: fixed(6000),
    conditions: [...general, light],
    conditionText: t(GENERAL_TEXT, GENERAL_TEXT_EN),
    exclusiveGroups: ['tpe-base'],
    quota: slots(2254, ['新購輕型', 'new-purchase light-class']),
    research: ['taipei#tpe-new-light', 'taipei#tpe-live-quota'],
  }),
  base({
    id: 'tpe-new-small',
    name: t('臺北市新購電動機車（小型輕型）', 'Taipei new electric scooter (small-light)'),
    amount: fixed(0),
    conditions: [...general, small],
    conditionText: t(GENERAL_TEXT, GENERAL_TEXT_EN),
    exclusiveGroups: ['tpe-base'],
    quota: slots(700, ['新購小型', 'new-purchase small-class']),
    research: ['taipei#tpe-new-light'],
    calculator: notPrinted,
  }),
  base({
    id: 'tpe-replace-old-heavy',
    name: t('臺北市汰購老舊機車換電動（重型）', 'Taipei scrap old scooter and buy electric (heavy)'),
    amount: fixed(19000),
    conditions: [...general, heavy, scrap, scrapAge(10), oldReg],
    conditionText: t(`${GENERAL_TEXT}${OLD_TEXT}`, `${GENERAL_TEXT_EN} ${OLD_TEXT_EN}`),
    exclusiveGroups: ['tpe-base', 'tpe-old-scooter-use'],
    quota: slots(194, ['老舊機車汰購重型', 'old-scooter replacement heavy-class']),
    research: ['taipei#tpe-replace-old-heavy', 'taipei#tpe-live-quota'],
  }),
  base({
    id: 'tpe-replace-old-light',
    name: t('臺北市汰購老舊機車換電動（輕型）', 'Taipei scrap old scooter and buy electric (light)'),
    amount: fixed(10000),
    conditions: [...general, light, scrap, scrapAge(10), oldReg],
    conditionText: t(`${GENERAL_TEXT}${OLD_TEXT}`, `${GENERAL_TEXT_EN} ${OLD_TEXT_EN}`),
    exclusiveGroups: ['tpe-base', 'tpe-old-scooter-use'],
    quota: slots(841, ['老舊機車汰購輕型', 'old-scooter replacement light-class']),
    research: ['taipei#tpe-replace-old-light', 'taipei#tpe-live-quota'],
  }),
  base({
    id: 'tpe-replace-2stroke-heavy',
    name: t('臺北市汰購二行程機車換電動（重型）', 'Taipei scrap two-stroke and buy electric (heavy)'),
    amount: fixed(22000),
    conditions: [...general, heavy, scrap, twoStroke, builtBy('2003-12-31'), oldReg],
    conditionText: t(`${GENERAL_TEXT}${TWO_TEXT}`, `${GENERAL_TEXT_EN} ${TWO_TEXT_EN}`),
    exclusiveGroups: ['tpe-base', 'tpe-old-scooter-use'],
    quota: slots(578, ['二行程汰購重型', 'two-stroke replacement heavy-class']),
    research: ['taipei#tpe-replace-2stroke-heavy', 'taipei#tpe-live-quota'],
  }),
  base({
    id: 'tpe-replace-2stroke-light',
    name: t('臺北市汰購二行程機車換電動（輕型）', 'Taipei scrap two-stroke and buy electric (light)'),
    amount: fixed(13000),
    conditions: [...general, light, scrap, twoStroke, builtBy('2003-12-31'), oldReg],
    conditionText: t(`${GENERAL_TEXT}${TWO_TEXT}`, `${GENERAL_TEXT_EN} ${TWO_TEXT_EN}`),
    exclusiveGroups: ['tpe-base', 'tpe-old-scooter-use'],
    quota: slots(117, ['二行程汰購輕型', 'two-stroke replacement light-class']),
    research: ['taipei#tpe-replace-2stroke-light', 'taipei#tpe-live-quota'],
  }),
  base({
    id: 'tpe-replace-small',
    name: t('臺北市汰購換電動（小型輕型）', 'Taipei scrap and buy electric (small-light)'),
    amount: fixed(0),
    conditions: [...general, small, scrap, scrapAge(10), oldReg],
    conditionText: t(`${GENERAL_TEXT}${OLD_TEXT}`, `${GENERAL_TEXT_EN} ${OLD_TEXT_EN}`),
    exclusiveGroups: ['tpe-base', 'tpe-old-scooter-use'],
    quota: slots(100, ['老舊機車汰購小型', 'old-scooter replacement small-class']),
    research: ['taipei#tpe-new-light'],
    calculator: notPrinted,
  }),
  base({
    id: 'tpe-battery-topup',
    name: t('臺北市電池資費加碼', 'Taipei battery-fee top-up'),
    kind: 'battery-credit',
    amount: fixed(8000),
    conditions: [...general, heavyOrLight],
    conditionText: t('115年新購或汰購電動機車（重型、輕型）都可加領，不限定用於電池月租。', 'Added to any 2026 new purchase or replacement (heavy or light); the plan does not require it to be spent on battery fees.'),
    quota: quota('limited', '2026-11-25', t('隨新購或汰購申請核撥，依申請順序至預算用罄。', 'Paid with the purchase claim, in order of application until the budget runs out.'), { sources: [LIVE] }),
    status2027: t('計畫文字限115年購車。', 'Limited by the plan text to 2026 purchases.'),
    research: ['taipei#tpe-battery-topup'],
  }),
  base({
    id: 'tpe-kangaroo',
    name: t('臺北市袋鼠方案加碼（育有12歲以下幼童）', 'Taipei "kangaroo" top-up (child aged 12 or under)'),
    kind: 'top-up',
    amount: fixed(8000),
    conditions: [...general, heavyOrLight, flag('childUnder12')],
    conditionText: t('申請人是設籍臺北市、民國103年1月1日以後出生幼童的法定代理人；一名幼童只能使用一次。', 'The applicant is the legal guardian of a Taipei-registered child born on or after 1 January 2014; each child can be used once.'),
    quota: quota('limited', '2026-11-25', t('隨新購或汰購申請核撥，依申請順序至預算用罄。', 'Paid with the purchase claim, in order of application until the budget runs out.'), { sources: [LIVE] }),
    status2027: t('計畫文字限115年購車。', 'Limited by the plan text to 2026 purchases.'),
    research: ['taipei#tpe-kangaroo'],
  }),
  base({
    id: 'tpe-lowincome-topup',
    name: t('臺北市中低及低收入戶加碼', 'Taipei low and middle-low income top-up'),
    kind: 'top-up',
    amount: fixed(10000),
    conditions: [...general, heavyOrLight, lowIncome(['low', 'middle-low'])],
    conditionText: t('檢附申請年度有效的區公所中低或低收入戶證明，限新購或汰購。', 'With a district-office low or middle-low income certificate valid in the application year; new purchase or replacement only.'),
    quota: quota('limited', '2026-11-25', t('依申請順序至預算用罄。', 'In order of application until the budget runs out.'), { sources: [LIVE] }),
    sources: [...PLAN, 'taiwannews-2026-04-taipei-subsidy'],
    note: t('計畫把這筆列為獨立項目但沒有寫可與其他加碼疊加；英文媒體Taiwan News引述環保局說可再加領。', 'The plan lists this as a separate line without saying it stacks; Taiwan News quotes the bureau saying it is paid on top.'),
    research: ['taipei#tpe-lowincome-topup', 'taipei#tpe-2025-baseline'],
  }),
  {
    ...base({
      id: 'tpe-scrap-only-bonus',
      name: t('臺北市淘汰老舊機車汰舊獎勵金', 'Taipei scrap bonus (no electric purchase)'),
      kind: 'scrap-only-bonus',
      amount: fixed(3600),
      conditions: [scrap, scrapAge(10), oldReg],
      conditionText: t(`${OLD_TEXT}不換購電動機車時可領，與換購電動機車、TPASS月票補助三擇一。`, `${OLD_TEXT_EN} Paid when you do not claim an electric replacement; one of electric replacement, TPASS or this bonus.`),
      exclusiveGroups: ['tpe-old-scooter-use'],
      quota: quota('unlimited', '2026-11-25', t('線上系統顯示不限名額。', 'Shown as unlimited on the online system.'), { sources: [LIVE] }),
      research: ['taipei#tpe-scrap-only-bonus', 'taipei#tpe-gas-subsidy'],
    }),
    side: 'gasoline',
    cap: undefined,
    note: t('改買燃油機車的人可以領這筆錢；也可改選最多14,400元的TPASS月票補助（不是現金，未列入）。', 'Someone buying a gasoline scooter can claim this; the alternative TPASS commuter-pass support (up to NT$14,400, not cash) is not counted.'),
  },
];
