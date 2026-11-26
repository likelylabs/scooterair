// Taichung City 2026 (plan amended 2026-06-29; amount table 附表1). research/econ/taichung-r2.json
// One city amount for every recognised electric class. Scrap-and-replace REPLACES the NT$3,000
// new-purchase amount (its own row, not added to it). The total of city + MOENV + MOEA money may
// not exceed the price; any excess comes off the city amount.

import type { Condition, Programme } from '../types.ts';
import { notSubsidisedBefore, age, builtBetween, builtBy, fixed, flag, lowIncome, quota, residency, scrap, scrapAge, t, twoStroke } from './helpers.ts';

const PAYER = t('臺中市政府環境保護局', 'Taichung City Environmental Protection Bureau');
const SRC = ['taichung-epb-2026-amount-table', 'taichung-epb-2026-announcement'] as const;
const STATUS_2027 = t('計畫只適用2026年，未見116年計畫。', 'The plan covers 2026 only; no 2027 plan seen.');
const APPLY = t('發票須為115年開立，舊車在115年內報廢回收，新車在116年1月10日前領牌，並於116年1月10日前線上申請（不受理紙本）；經費用罄得不予補助。', 'Invoice dated 2026, old scooter scrapped and recycled in 2026, new scooter plated and an online application made by 10 January 2027 (no paper applications); payments may stop when the budget runs out.');
const budget = quota('unknown', '2026-11-25', t('計畫沒有數量上限，依申請順序至當年度經費用罄；未見用罄公告，但未逐一查核。', 'No numeric quota; first come first served until the year\'s budget runs out. No exhaustion notice seen, but not checked in detail.'));

const notSubsidised: Condition = notSubsidisedBefore(t('假設你2016年起沒有領過台中市或環境部的機車補助', 'Assumes you have not received a Taichung or MOENV scooter subsidy since 2016'));
const general: Condition[] = [residency(), age(18), notSubsidised];
const GENERAL = '年滿18歲、申請時設籍台中市；新車首次領牌並登記於台中市；2016年起領過台中市或環境部機車補助者不適用；每人限1輛。';
const GENERAL_EN = 'Aged 18+ and registered in Taichung when applying; the new scooter is newly plated and registered in Taichung; anyone who has had a Taichung or MOENV scooter subsidy since 2016 is excluded; one per person.';
const OLD = '舊車為台中市籍燃油機車，115年1月1日後沒有外縣市過戶或車主戶籍遷出紀錄。';
const OLD_EN = 'The old scooter is a Taichung-plated gasoline scooter with no out-of-county transfer, and no out-of-county household move by its owner, since 1 January 2026.';
const oldLocal: Condition = { kind: 'scrap-registered-locally', byDate: '2026-01-01' };
// tc2-residency (2026-06-29 amendment): "老舊機車車主戶籍於115年1月1日以後不得有外縣市異動紀錄".
// The rule is about the old scooter's owner; we take the buyer to be that owner and say so.
const ownerNotMovedIn: Condition = {
  kind: 'residency',
  registeredBy: '2025-12-31',
  why: t('舊車車主（試算假設就是你）的戶籍在2026年1月1日以後有從外縣市遷入的紀錄，不能領汰舊換購金額', 'the old scooter\'s owner (taken to be you) moved household registration in from another county on or after 1 January 2026, which rules out the scrap tiers'),
  assumption: t('假設舊車車主就是你，而且你的戶籍在2026年1月1日以後沒有從外縣市遷入', 'Assumes you own the old scooter and your household registration has not moved in from another county since 1 January 2026'),
};
const BUY_SCRAP = t('發票須在這天以前開立，舊車須在這天以前報廢回收；新車可在2027年1月10日前領牌並線上申請。', 'Invoice by this date and scrap and recycle the old scooter by this date; the new scooter can be plated and the online application made by 10 January 2027.');

const p = (x: Partial<Programme> & Pick<Programme, 'id' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'research'>): Programme => ({
  jurisdiction: 'taichung',
  payer: 'local',
  payerName: PAYER,
  kind: 'purchase-subsidy',
  side: 'electric',
  cap: 'all-government-at-most-price',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  validToRule: t('發票須在這天以前開立；新車可在2027年1月10日前領牌並線上申請。', 'Invoice by this date; the new scooter can be plated and the online application made by 10 January 2027.'),
  applicationDeadline: '2027-01-10',
  applicationNote: APPLY,
  status2027: STATUS_2027,
  quota: budget,
  sources: [...SRC],
  confidence: 'verified',
  exclusiveGroups: ['taichung-base'],
  calculator: true,
  ...x,
});

const tier = (id: string, name: [string, string], value: number, conds: Condition[], text: [string, string], research: string) =>
  p({
    id,
    name: t(name[0], name[1]),
    amount: fixed(value),
    conditions: [...general, scrap, oldLocal, ownerNotMovedIn, ...conds],
    validToRule: BUY_SCRAP,
    conditionText: t(`${GENERAL}${OLD}${text[0]}`, `${GENERAL_EN} ${OLD_EN} ${text[1]}`),
    research: [`taichung-r2#${research}`, 'taichung-r2#tc2-residency', 'taichung-r2#tc2-cap-clause'],
  });

export const taichungProgrammes: Programme[] = [
  p({
    id: 'tc-new',
    name: t('台中市新購電動機車', 'Taichung new electric scooter'),
    amount: fixed(3000),
    conditions: [...general],
    conditionText: t(`${GENERAL}各車種同一金額。`, `${GENERAL_EN} One amount for every class.`),
    research: ['taichung-r2#tc2-new-general', 'taichung-r2#tc2-residency'],
  }),
  p({
    id: 'tc-new-lowincome',
    name: t('台中市新購電動機車（中低收入戶）', 'Taichung new electric scooter (low income)'),
    amount: fixed(25000),
    conditions: [...general, lowIncome(['low', 'middle-low'])],
    conditionText: t(`${GENERAL}檢附區公所核發、115年內有效的（中）低收入戶證明。`, `${GENERAL_EN} With a district-office (middle-)low income certificate valid in 2026.`),
    research: ['taichung-r2#tc2-new-lowincome'],
  }),
  tier('tc-scrap-two-stroke', ['台中市淘汰二行程機車換購電動', 'Taichung scrap a two-stroke and buy electric'], 16000, [twoStroke, builtBy('2003-12-31')], ['舊車為92年12月31日以前出廠的二行程機車。', 'The old scooter is a two-stroke built by 31 December 2003.'], 'tc2-scrap-2stroke'),
  tier('tc-scrap-phase1to3', ['台中市淘汰1至3期機車換購電動', 'Taichung scrap a phase 1–3 scooter and buy electric'], 13000, [{ kind: 'scrap-engine', engines: ['four-stroke'] }, builtBy('2003-12-31')], ['舊車為92年12月31日以前出廠的1至3期四行程機車。', 'The old scooter is a phase 1–3 four-stroke built by 31 December 2003.'], 'tc2-scrap-1to3'),
  tier('tc-scrap-phase4', ['台中市淘汰4期機車換購電動', 'Taichung scrap a phase 4 scooter and buy electric'], 10000, [builtBetween('2004-01-01', '2007-06-30')], ['舊車為93年1月1日至96年6月30日出廠的4期機車。', 'The old scooter is a phase 4 scooter built 1 January 2004 to 30 June 2007.'], 'tc2-scrap-4th'),
  tier('tc-scrap-phase5', ['台中市淘汰5期機車換購電動', 'Taichung scrap a phase 5 scooter and buy electric'], 5000, [builtBetween('2007-07-01', '2015-12-31'), scrapAge(10)], ['舊車為96年7月1日至104年12月31日出廠的5期機車（只限出廠滿10年者）。', 'The old scooter is a phase 5 scooter built 1 July 2007 to 31 December 2015 (10 years or older only).'], 'tc2-scrap-5th'),
  tier('tc-scrap-lowincome', ['台中市汰購換電動（中低收入戶）', 'Taichung scrap and buy electric (low income)'], 30000, [builtBy('2015-12-31'), lowIncome(['low', 'middle-low'])], ['各期別舊車一律30,000元；須有115年內有效的（中）低收入戶證明。', 'NT$30,000 for every eligible old-scooter tier, with a (middle-)low income certificate valid in 2026.'], 'tc2-scrap-lowincome'),
  p({
    id: 'tc-child',
    name: t('台中市育兒加碼（12歲以下兒童）', 'Taichung child top-up (child aged 12 or under)'),
    kind: 'top-up',
    amount: fixed(3000),
    conditions: [...general, flag('childUnder12')],
    conditionText: t('申請人是設籍台中市12歲以下兒童的法定監護人（以發票日判定）；每名兒童一生只能加碼一次，新購與汰購都適用。', 'The applicant is the legal guardian of a Taichung-registered child aged 12 or under at the invoice date; each child can be used once ever; applies to new purchases and replacements.'),
    exclusiveGroups: [],
    research: ['taichung-r2#tc2-child-topup'],
  }),
];
