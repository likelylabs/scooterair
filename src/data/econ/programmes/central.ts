// Central government programmes: MOEA purchase subsidy, MOENV scrap rewards (carbon and air
// options from the MOEA portal's official July 2026 table), the MOENV recycling payment and the
// MOF goods-tax reductions for gasoline scooters.

import type { Programme } from '../types.ts';
import { fixed, quota, scrap, scrapAge, t } from './helpers.ts';

const MOEA = t('經濟部產業發展署', 'MOEA Administration for Industrial Development');
const MOENV = t('環境部（車輛汰舊換新抵換媒合平臺）', 'Ministry of Environment (vehicle replacement matching platform)');
const MOF = t('財政部（貨物稅）', 'Ministry of Finance (goods tax)');

const MOEA_SRC = ['meid-lev-subsidy-portal', 'meid-lev-2026-subsidy-table'] as const;
const PDF = ['meid-lev-2026-subsidy-table'] as const;

const moeaQuota = quota('unknown', '2026-11-25', t('未公布名額；補助期間至115年12月31日。', 'No quota published; the programme runs to 31 December 2026.'));
const MOEA_2027 = t('未見116年方案；補助要點效期至115年12月31日。', 'No 2027 programme found; the scheme runs to 31 December 2026.');
const MOEA_APPLY = t(
  '通常由經銷商代為申請。補助入口網註明外籍人士請於115年12月10日前提出申請；Gogoro也表示只代辦到12月10日，建議盡早送件。',
  'Usually filed by the dealer. The portal asks foreign nationals to apply by 10 December 2026, and Gogoro says it files applications only until 10 December, so file early.',
);

const moenvScrap = t(
  '淘汰出廠滿10年以上的燃油機車並新購電動機車；須在購車前到環境部媒合平臺登記並選擇收購者。',
  'Scrap a gasoline scooter at least 10 years old and buy an electric one; register on the MOENV matching platform and choose the buyer of the credit before you buy.',
);
const MOENV_2027_SHORT = t('方案至115年12月31日。', 'Runs to 31 December 2026.');
const MOENV_2027_LONG = t(
  '官方表列至116年12月31日，但環境部汰舊換新補助辦法目前只確認延長至115年底；116年是否續辦請再向平臺確認。',
  'Listed to 31 December 2027, but the MOENV scrap-and-replace rule is only confirmed to the end of 2026; check the platform before relying on it in 2027.',
);

const carbon = (id: string, name: [string, string], value: number, from: string, to: string, quotaTotal: number, region?: Programme['conditions'][number], research = 'central#moenv-carbon-reward-options'): Programme => ({
  id,
  jurisdiction: 'central',
  payer: 'sponsor',
  payerName: MOENV,
  name: t(name[0], name[1]),
  kind: 'scrap-bonus',
  side: 'electric',
  amount: fixed(value),
  conditions: [scrap, scrapAge(10), ...(region ? [region] : [])],
  conditionText: moenvScrap,
  exclusiveGroups: ['moenv-carbon', 'moenv-one-stream', 'kinmen-vs-moenv'],
  validFrom: from,
  validTo: to,
  ...(to > '2026-12-31' ? { confirmedThrough: '2026-12-31' } : {}),
  quota: quota('unknown', '2026-07-21', t(`總名額${quotaTotal.toLocaleString('en')}輛；剩餘名額未查證。`, `${quotaTotal.toLocaleString('en')} places in total; remaining places not checked.`), { total: quotaTotal }),
  status2027: to > '2026-12-31' ? MOENV_2027_LONG : MOENV_2027_SHORT,
  sources: [...PDF],
  confidence: 'verified',
  research: [research, 'central#stacking-central'],
  calculator: true,
});

const air = (id: string, name: [string, string], value: number, from: string, to: string, q: Programme['quota'], region?: Programme['conditions'][number]): Programme => ({
  ...carbon(id, name, value, from, to, 0, region, 'central#moenv-air-pollution-options'),
  exclusiveGroups: ['moenv-air', 'moenv-one-stream', 'kinmen-vs-moenv'],
  quota: q,
});

const airQuota = (total: number) =>
  quota('unknown', '2026-07-21', t(`總名額${total.toLocaleString('en')}輛；剩餘名額未查證。`, `${total.toLocaleString('en')} places in total; remaining places not checked.`), { total });

export const centralProgrammes: Programme[] = [
  // ---------------------------------------------------------------- MOEA
  {
    id: 'moea-new-7000',
    jurisdiction: 'central',
    payer: 'moea',
    payerName: MOEA,
    name: t('經濟部新購電動機車補助', 'MOEA new electric scooter subsidy'),
    kind: 'purchase-subsidy',
    side: 'electric',
    amount: fixed(7000),
    conditions: [{ kind: 'moea-class', classes: ['heavy-1-2', 'light-1'] }],
    conditionText: t('補助車款清單上的普通重型第1、2級或普通輕型第1級電動機車，新購即可，不必汰舊。', 'A listed 普通重型 level 1–2 or 普通輕型 level 1 model; new purchase, no scrapping needed.'),
    exclusiveGroups: ['moea-base'],
    validFrom: '2022-12-11',
    validTo: '2026-12-31',
    applicationNote: MOEA_APPLY,
    quota: moeaQuota,
    status2027: MOEA_2027,
    sources: [...MOEA_SRC],
    confidence: 'verified',
    research: ['central#moea-new-purchase-heavy-light', 'central#moea-validity-applicant', 'central#added-moea-expiry-imminent'],
    calculator: true,
  },
  {
    id: 'moea-new-5100',
    jurisdiction: 'central',
    payer: 'moea',
    payerName: MOEA,
    name: t('經濟部新購電動機車補助', 'MOEA new electric scooter subsidy'),
    kind: 'purchase-subsidy',
    side: 'electric',
    amount: fixed(5100),
    conditions: [{ kind: 'moea-class', classes: ['light-2', 'small', 'light-unknown'] }],
    conditionText: t(
      '普通輕型第2級或小型輕型電動機車。綠牌車款若無法確認是第1級還是第2級，試算先以5,100元計。',
      'A 普通輕型 level 2 or 小型輕型 model. Where we cannot confirm whether a green-plate model is level 1 or 2, we count NT$5,100.',
    ),
    exclusiveGroups: ['moea-base'],
    validFrom: '2022-12-11',
    validTo: '2026-12-31',
    applicationNote: MOEA_APPLY,
    quota: moeaQuota,
    status2027: MOEA_2027,
    sources: [...MOEA_SRC],
    confidence: 'verified',
    research: ['central#moea-new-purchase-small-light'],
    calculator: true,
  },
  {
    id: 'moea-domestic-cells',
    jurisdiction: 'central',
    payer: 'moea',
    payerName: MOEA,
    name: t('經濟部國產電池芯加碼', 'MOEA Taiwan-made battery cell bonus'),
    kind: 'top-up',
    side: 'electric',
    amount: fixed(3000),
    conditions: [{ kind: 'domestic-cells' }],
    conditionText: t('車款使用經認定的國產電池芯；哪些車款符合未能查證。', 'The model uses certified Taiwan-made battery cells; which models qualify could not be checked.'),
    validFrom: '2022-12-11',
    validTo: '2026-12-31',
    applicationNote: MOEA_APPLY,
    quota: moeaQuota,
    status2027: MOEA_2027,
    sources: [...MOEA_SRC],
    confidence: 'verified',
    research: ['central#moea-domestic-cell-bonus'],
    calculator: true,
  },
  {
    id: 'moea-scrap-1000',
    jurisdiction: 'central',
    payer: 'moea',
    payerName: MOEA,
    name: t('經濟部汰舊並新購加碼', 'MOEA scrap-and-buy bonus'),
    kind: 'scrap-bonus',
    side: 'electric',
    amount: fixed(1000),
    conditions: [scrap, scrapAge(10)],
    conditionText: t('淘汰出廠滿10年以上的燃油機車並新購電動機車。', 'Scrap a gasoline scooter at least 10 years old and buy an electric one.'),
    validFrom: '2025-06-16',
    validTo: '2026-12-31',
    applicationNote: MOEA_APPLY,
    quota: moeaQuota,
    status2027: MOEA_2027,
    sources: [...MOEA_SRC],
    confidence: 'verified',
    research: ['central#moea-scrap-new-bonus'],
    calculator: true,
  },

  // ---------------------------------------------------------------- MOENV carbon reward (choose one of four)
  carbon('moenv-carbon-moea', ['環境部減碳獎勵（經濟部收購）', 'MOENV carbon reward (bought by MOEA)'], 2000, '2024-11-01', '2026-12-31', 69016),
  {
    ...carbon('moenv-carbon-park', ['環境部減碳獎勵（園管局收購）', 'MOENV carbon reward (bought by the Industrial Park Administration)'], 2000, '2025-11-10', '2026-12-31', 546),
    calculator: {
      excluded: t('官方表格列出此選項，但研究資料未記下適用地區；金額與經濟部全國選項相同，試算不另計。', 'The official table lists this option but our research did not record its eligible area; it pays the same as the nationwide MOEA option, so it is not counted separately.'),
      reason: 'unverified',
    },
  },
  carbon('moenv-carbon-tainan', ['環境部減碳獎勵（臺南市收購）', 'MOENV carbon reward (bought by Tainan City)'], 1500, '2026-01-12', '2026-12-31', 3300, { kind: 'region', jurisdictions: ['tainan'] }),
  carbon('moenv-carbon-tsmc', ['環境部減碳獎勵（台積電收購）', 'MOENV carbon reward (bought by TSMC)'], 2100, '2026-05-08', '2027-12-31', 54000),
  carbon('moenv-carbon-tsmc-kaohsiung', ['環境部減碳獎勵（台積電收購，限高雄市）', 'MOENV carbon reward (bought by TSMC, Kaohsiung only)'], 2100, '2026-05-08', '2027-12-31', 6000, {
    kind: 'region',
    jurisdictions: ['kaohsiung'],
  }),

  // ---------------------------------------------------------------- MOENV air subsidy (choose one of six)
  air('moenv-air-national', ['環境部空污補助（全國）', 'MOENV air-pollution subsidy (nationwide)'], 1000, '2023-01-01', '2026-12-31', quota('unlimited', '2026-07-21', t('不限名額。', 'No quota.'))),
  air('moenv-air-hsinchu-park', ['環境部空污補助（竹科管理局）', 'MOENV air-pollution subsidy (Hsinchu Science Park)'], 2200, '2026-01-01', '2026-12-31', airQuota(10129), {
    kind: 'region',
    jurisdictions: ['hsinchu-city', 'hsinchu-county', 'miaoli'],
  }),
  air('moenv-air-central-park', ['環境部空污補助（中科管理局）', 'MOENV air-pollution subsidy (Central Taiwan Science Park)'], 2200, '2025-11-01', '2027-12-31', airQuota(4500), {
    kind: 'region',
    jurisdictions: ['taichung', 'changhua', 'nantou'],
  }),
  air('moenv-air-moea-south', ['環境部空污補助（經濟部）', 'MOENV air-pollution subsidy (MOEA option)'], 2000, '2024-09-01', '2026-12-31', airQuota(68216), {
    kind: 'region',
    jurisdictions: ['yunlin', 'chiayi-county', 'chiayi-city', 'tainan'],
  }),
  air('moenv-air-southern-park', ['環境部空污補助（南科管理局）', 'MOENV air-pollution subsidy (Southern Taiwan Science Park)'], 2200, '2025-08-01', '2027-12-31', airQuota(3300), {
    kind: 'region',
    jurisdictions: ['yunlin', 'chiayi-county', 'chiayi-city', 'tainan'],
  }),
  air('moenv-air-caa', ['環境部空污補助（民航局，限高雄市）', 'MOENV air-pollution subsidy (Civil Aeronautics Administration, Kaohsiung)'], 2000, '2025-04-01', '2027-12-31', airQuota(351), {
    kind: 'region',
    jurisdictions: ['kaohsiung'],
  }),

  // ---------------------------------------------------------------- MOENV recycling payment (any scrapped gasoline scooter)
  {
    id: 'moenv-recycling-300',
    jurisdiction: 'central',
    payer: 'moenv',
    payerName: t('環境部（廢機車回收獎勵金）', 'Ministry of Environment (scooter recycling payment)'),
    name: t('環境部燃油機車回收獎勵金', 'MOENV recycling payment for a scrapped gasoline scooter'),
    kind: 'recycling-bonus',
    side: 'both',
    amount: fixed(300),
    conditions: [scrap],
    conditionText: t('舊燃油機車完成報廢並交由合格回收業者回收；買電動或燃油新車都可領。', 'The old gasoline scooter is scrapped and recycled by a licensed recycler; paid whether the new scooter is electric or gasoline.'),
    exclusiveGroups: ['kinmen-vs-moenv'],
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    quota: quota('unknown', '2026-06-01', t('未公布名額。', 'No quota published.')),
    status2027: t('2027年是否續辦未查證。', 'Whether it continues in 2027 was not checked.'),
    sources: ['taipei-dep-ev-subsidy-plan', 'tvbs-health-2026-01-subsidy'],
    confidence: 'verified',
    research: ['taipei#tpe-central-moenv', 'central#moenv-central-total-conflict'],
    note: t('有些報導把這筆錢視為回收業者付的回收金而非補助；無論如何都是車主實際拿到的錢，電動與燃油兩邊都計入。', 'Some reports treat this as the recycler\'s payment rather than a subsidy; either way the owner receives it, so it is counted on both sides.'),
    calculator: true,
  },

  // ---------------------------------------------------------------- MOF goods tax (gasoline only; electric is already exempt)
  {
    id: 'gas-goods-tax-new-2000',
    jurisdiction: 'central',
    payer: 'mof',
    payerName: MOF,
    name: t('新購機車貨物稅減徵', 'Goods-tax cut for a new scooter'),
    kind: 'tax-reduction',
    side: 'gasoline',
    amount: fixed(2000),
    conditions: [{ kind: 'gas-max-cc', cc: 150 }],
    conditionText: t('新購150cc以下非電動機車並完成新領牌照登記。', 'A new non-electric scooter of 150cc or less, newly registered.'),
    exclusiveGroups: ['gas-goods-tax-new'],
    validFrom: '2025-09-07',
    validTo: '2030-12-31',
    quota: quota('unlimited', '2025-12-05', t('不限名額。', 'No quota.')),
    status2027: t('依財政部網頁實施至119年12月31日。', 'In force to 31 December 2030 per the MOF page.'),
    sources: ['etax-goods-tax-scooter-cut', 'kymco-goods-tax-models'],
    confidence: 'verified',
    research: ['central#goods-tax-new-gasoline-2000', 'gas-prices#kymco-gov-tax-table'],
    note: t('電動機車本來就免徵貨物稅（至119年底），已反映在售價中，所以電動那邊沒有這一行。', 'Electric scooters are already exempt from goods tax (to the end of 2030), which is built into their price, so there is no matching line on the electric side.'),
    calculator: true,
  },
  {
    id: 'gas-goods-tax-scrap',
    jurisdiction: 'central',
    payer: 'mof',
    payerName: MOF,
    name: t('汰舊換新貨物稅減徵', 'Goods-tax cut for scrap-and-replace'),
    kind: 'tax-reduction',
    side: 'gasoline',
    amount: { kind: 'model-goods-tax-scrap', max: 4000 },
    conditions: [scrap, scrapAge(4), { kind: 'scrap-max-cc', cc: 150 }],
    conditionText: t(
      '報廢出廠滿4年、150cc以下的舊機車，並在新車登記前後6個月內完成；實際減徵金額依車款核定，最高4,000元，須經國稅局核定。',
      'Scrap a scooter of 150cc or less that is at least 4 years old within 6 months before or after registering the new one; the amount is set per model, at most NT$4,000, and needs tax-office approval.',
    ),
    validFrom: '2025-09-07',
    validTo: '2030-12-31',
    quota: quota('unlimited', '2025-12-05', t('不限名額。', 'No quota.')),
    status2027: t('依財政部網頁實施至119年12月31日。', 'In force to 31 December 2030 per the MOF page.'),
    sources: ['etax-goods-tax-scooter-cut', 'kymco-goods-tax-models', 'sym-2026-11-offers'],
    confidence: 'verified',
    research: ['central#goods-tax-scrap-replace-4000', 'gas-prices#kymco-gov-tax-table', 'gas-prices#sym-duke125-nov-promo'],
    note: t(
      '財政部網頁把新購2,000元與汰舊4,000元分開列，沒有寫可以相加；光陽與三陽的11月官方優惠則兩者都扣。試算依車廠做法相加，這會讓燃油車看起來較便宜，對電動車的比較是保守的。',
      'The MOF page lists the new-purchase NT$2,000 and scrap NT$4,000 separately and does not say they add up; KYMCO\'s and SYM\'s official November offers deduct both. We follow the manufacturers, which makes the gasoline scooter look cheaper and keeps the comparison conservative for electric.',
    ),
    calculator: true,
  },
];
