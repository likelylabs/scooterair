// Tainan City 2026 (EPB programme PDF, announced 2025-12-22 and amended). research/econ/tainan.json
// Columns 一般民眾 / 偏遠地區 / 中(低)收入戶 replace one another (group tn-base); the battery-fee
// money and one support project are added on top. The city pays only what is left after MOEA and
// MOENV money so that the total never exceeds the invoice.

import type { Condition, Programme } from '../types.ts';
import { age, builtBy, fixed, flag, heavy, lightOrSmall, lowIncome, quota, scrap, t } from './helpers.ts';

const PAYER = t('臺南市政府環境保護局', 'Tainan City Environmental Protection Bureau');
const SRC = ['tainan-epb-2026-programme'] as const;
const STATUS_2027 = t('方案至115年12月31日（受理至116年1月10日），未見116年方案。', 'The programme ends on 31 December 2026 (claims to 10 January 2027); no 2027 programme seen.');
const APPLY = t('購車與舊車報廢須在115年12月31日前完成，新車領牌與舊車回收、線上申請至116年1月10日；領牌3年內不得過戶或遷出臺南市。', 'Buy and cancel the old plate by 31 December 2026; register the new scooter, recycle the old one and apply online by 10 January 2027. No transfer or move out of Tainan for 3 years after registration.');
const budget = quota('unknown', '2026-11-25', t('總預算5,830萬500元，用罄即停止；是否已用完無法查證。', 'Total budget NT$58,300,500, stopped when used up; whether it has run out could not be checked.'), { total: 58300500 });

const resident: Condition = { kind: 'residency' };
const oldLocal: Condition = { kind: 'scrap-registered-locally' };
const GENERAL = '車籍與戶籍都在臺南市且未遷出；租賃或共享用途、公部門與車商不適用。';
const GENERAL_EN = 'Vehicle and household registration both in Tainan with no move-out; rental or sharing use, public bodies and dealers are excluded.';
const OLD = '舊車為民國104年12月31日以前出廠的燃油機車，須先在環境部媒合平臺申請臺南市減碳獎勵金（臺南市額度用完時可直接申請）。';
const OLD_EN = 'The old scooter is a gasoline scooter built by 31 December 2015; first apply on the MOENV platform for the Tainan carbon reward (if Tainan\'s allocation is used up you may apply directly).';
const REMOTE = '偏遠地區（左鎮區、楠西區、南化區、龍崎區）：車籍與戶籍在114年7月1日以前即設於該區且未變更。';
const REMOTE_EN = 'Remote districts (Zuozhen, Nanxi, Nanhua, Longqi): vehicle and household registered there since 1 July 2025 or earlier.';
const LOW = '檢附列有全戶成員、申請日有效的中（低）收入戶證明。';
const LOW_EN = 'With a (middle-)low income certificate listing all household members, valid on the application date.';

const p = (x: Partial<Programme> & Pick<Programme, 'id' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'research'>): Programme => ({
  jurisdiction: 'tainan',
  payer: 'local',
  payerName: PAYER,
  kind: 'purchase-subsidy',
  side: 'electric',
  cap: 'all-government-at-most-price',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  applicationDeadline: '2027-01-10',
  applicationNote: APPLY,
  status2027: STATUS_2027,
  quota: budget,
  sources: [...SRC],
  confidence: 'verified',
  calculator: true,
  ...x,
});

const requiresCarbon: Programme['requires'] = {
  anyOf: ['moenv-carbon-tainan'],
  waivedIfUnavailable: true,
  text: t('須先在環境部媒合平臺選擇臺南市減碳獎勵金；臺南市額度用完時可直接申請。', 'You must first choose the Tainan carbon reward on the MOENV platform; if Tainan\'s allocation is used up you may apply directly.'),
};

type Column = 'general' | 'remote' | 'low';
const columnConds: Record<Column, Condition[]> = {
  general: [],
  remote: [flag('remoteDistrict'), { kind: 'residency', registeredBy: '2025-07-01' }],
  low: [lowIncome(['low', 'middle-low'])],
};
const columnText: Record<Column, [string, string]> = { general: ['', ''], remote: [REMOTE, REMOTE_EN], low: [LOW, LOW_EN] };
const columnLabel: Record<Column, [string, string]> = { general: ['一般民眾', 'general'], remote: ['偏遠地區', 'remote district'], low: ['中低收入戶', 'low income'] };

const row = (purchase: 'scrap' | 'new', column: Column, cls: 'heavy' | 'light', value: number, research: string) => {
  const scrapRow = purchase === 'scrap';
  const clsLabel = cls === 'heavy' ? ['重型', 'heavy'] : ['輕型／小型', 'light/small'];
  return p({
    id: `tn-${purchase}-${column}-${cls}`,
    name: t(
      `臺南市${scrapRow ? '淘汰換購' : '新購'}電動機車（${clsLabel[0]}，${columnLabel[column][0]}）`,
      `Tainan ${scrapRow ? 'scrap-and-replace' : 'new purchase'} (${clsLabel[1]}, ${columnLabel[column][1]})`,
    ),
    amount: fixed(value),
    conditions: [resident, cls === 'heavy' ? heavy : lightOrSmall, ...(scrapRow ? [scrap, builtBy('2015-12-31'), oldLocal] : []), ...columnConds[column]],
    conditionText: t(`${GENERAL}${scrapRow ? OLD : ''}${columnText[column][0]}`, [GENERAL_EN, scrapRow ? OLD_EN : '', columnText[column][1]].filter(Boolean).join(' ')),
    exclusiveGroups: ['tn-base'],
    ...(scrapRow ? { requires: requiresCarbon } : {}),
    research: [`tainan#${research}`, 'tainan#tn-stacking-central', 'tainan#tn-deadline-rules'],
  });
};

const project = (id: string, name: [string, string], conds: Condition[], text: [string, string], research: string) =>
  p({
    id,
    name: t(name[0], name[1]),
    kind: 'top-up',
    amount: fixed(3000),
    conditions: [resident, ...conds],
    conditionText: t(`貼心專案僅可擇一、不得疊加。${text[0]}`, `Only one support project may be claimed. ${text[1]}`),
    exclusiveGroups: ['tn-project'],
    research: [`tainan#${research}`, 'tainan#tn-topup-projects-3000'],
  });

export const tainanProgrammes: Programme[] = [
  row('scrap', 'general', 'heavy', 8000, 'tn-scrap-general-heavy'),
  row('scrap', 'general', 'light', 6500, 'tn-scrap-general-light'),
  row('scrap', 'remote', 'heavy', 9000, 'tn-scrap-remote-heavy'),
  row('scrap', 'remote', 'light', 10500, 'tn-scrap-remote-light'),
  row('scrap', 'low', 'heavy', 14000, 'tn-scrap-lowincome-heavy'),
  row('scrap', 'low', 'light', 16500, 'tn-scrap-lowincome-light'),
  row('new', 'general', 'heavy', 3000, 'tn-new-general-heavy'),
  row('new', 'general', 'light', 4500, 'tn-new-general-light'),
  row('new', 'remote', 'heavy', 6000, 'tn-new-remote'),
  row('new', 'remote', 'light', 7500, 'tn-new-remote'),
  row('new', 'low', 'heavy', 9000, 'tn-new-lowincome'),
  row('new', 'low', 'light', 12500, 'tn-new-lowincome'),
  p({
    id: 'tn-battery-heavy',
    name: t('臺南市月租費（電池資費）補助（重型）', 'Tainan battery-fee money (heavy)'),
    kind: 'battery-credit',
    amount: fixed(7200),
    conditions: [resident, heavy],
    conditionText: t('換購或新購電動機車一次給付，依車種分級；官方表格沒有限定換電車款。', 'Paid once for any replacement or new purchase, by class; the official table does not limit it to swap-battery models.'),
    research: ['tainan#tn-battery-rental-credit', 'other-levers#tainan-battery-plan-subsidy'],
    sources: [...SRC, 'tvbs-2026-02-tainan-subsidy'],
  }),
  p({
    id: 'tn-battery-light',
    name: t('臺南市月租費（電池資費）補助（輕型／小型）', 'Tainan battery-fee money (light/small)'),
    kind: 'battery-credit',
    amount: fixed(3600),
    conditions: [resident, lightOrSmall],
    conditionText: t('換購或新購電動機車一次給付，依車種分級；官方表格沒有限定換電車款。', 'Paid once for any replacement or new purchase, by class; the official table does not limit it to swap-battery models.'),
    research: ['tainan#tn-battery-rental-credit'],
    sources: [...SRC, 'tvbs-2026-02-tainan-subsidy'],
  }),
  project('tn-project-child', ['臺南市貼心專案：幼幼（12歲以下兒童）', 'Tainan support project: child aged 12 or under'], [flag('childUnder12')], ['申請人為設籍臺南市12歲以下兒童的直系血親。', 'The applicant is a direct relative of a Tainan-registered child aged 12 or under.'], 'tn-topup-projects-3000'),
  project('tn-project-youth', ['臺南市貼心專案：青年（18至30歲）', 'Tainan support project: age 18–30'], [age(18, 30)], ['設籍臺南市、18至30歲。', 'Registered in Tainan and aged 18–30.'], 'tn-topup-projects-3000'),
  project(
    'tn-project-delivery',
    ['臺南市貼心專案：外送員', 'Tainan support project: delivery rider'],
    [flag('deliveryRider')],
    ['自發票日往前1年起至115年12月31日止，完成外送接單至少100筆。', 'At least 100 completed delivery orders from one year before the invoice date to 31 December 2026.'],
    'tn-topup-projects-3000',
  ),
  project(
    'tn-project-disaster',
    ['臺南市貼心專案：天然災害災損戶', 'Tainan support project: disaster-affected household'],
    [flag('disasterAffected')],
    ['2025年起至方案結束符合天然災害救助資格並檢附證明；已申請機車維修補助者不適用。', 'Eligible for natural-disaster aid from 2025 to the end of the programme, with proof; not if a scooter-repair subsidy was claimed.'],
    'tn-topup-projects-3000',
  ),
];
