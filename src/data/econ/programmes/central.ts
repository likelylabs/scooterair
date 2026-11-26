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

const moeaQuota = quota('unknown', '2026-11-25', t('未公布名額；補助期間至 2026 年 12 月 31 日。', 'No quota published; the programme runs to 31 December 2026.'));
const MOEA_2027 = t('未見 2027 年方案；補助要點效期至 2026 年 12 月 31 日。', 'No 2027 programme found; the scheme runs to 31 December 2026.');
// The MOEA portal: "可適用於外籍人士 (請於115/12/10前提出申請)". A foreign national buying after
// 10 December can no longer apply; everyone else keeps the 31 December purchase window.
const foreignApplyBy: Programme['conditions'][number] = {
  kind: 'applicant-deadline',
  applicants: 'foreign-national',
  date: '2026-12-10',
  why: t('經濟部補助入口網要求外籍人士在 2026 年 12 月 10 日前提出申請', 'the MOEA portal requires foreign nationals to apply by 10 December 2026'),
};
const MOEA_APPLY = t(
  '通常由經銷商代為申請。補助入口網註明外籍人士請於 2026 年 12 月 10 日前提出申請；Gogoro也表示只代辦到 12 月 10 日，建議盡早送件。',
  'Usually filed by the dealer. The portal asks foreign nationals to apply by 10 December 2026, and Gogoro says it files applications only until 10 December, so file early.',
);

const moenvScrap = t(
  '淘汰出廠滿10年以上的燃油機車並新購電動機車；須在購車前到環境部媒合平臺登記並選擇收購者。',
  'Scrap a gasoline scooter at least 10 years old and buy an electric one; register on the MOENV matching platform and choose the buyer of the credit before you buy.',
);
const MOENV_DEADLINE = t('須先在環境部媒合平臺登記並選定收購者，再購車；購車須在這天以前完成。', 'Register on the MOENV matching platform and choose the buyer of the credit first, then buy, by this date.');
const MOENV_2027_SHORT = t('方案至 2026 年 12 月 31 日。', 'Runs to 31 December 2026.');
const MOENV_2027_LONG = t(
  '官方表列至 2027 年 12 月 31 日，但環境部汰舊換新補助辦法目前只確認延長至 2026 年底；2027 年是否續辦請再向平臺確認。',
  'Listed to 31 December 2027, but the MOENV scrap-and-replace rule is only confirmed to the end of 2026; check the platform before relying on it in 2027.',
);

// "Nearly exhausted" means a small share left (under 10%) or a small absolute number (500 or
// fewer), not a fixed count: 1,670 of 3,300 places is half the allocation, not "few".
const liveQuota = (remaining: number, total: number) =>
  quota(remaining === 0 ? 'exhausted' : remaining / total < 0.1 || remaining <= 500 ? 'nearly-exhausted' : 'limited', '2026-11-25', t(`環境部媒合平臺 2026 年 11 月 25 日顯示剩餘${remaining.toLocaleString('en')}輛（總名額${total.toLocaleString('en')}輛）；每天變動。`, `On 25 November 2026 the MOENV platform showed ${remaining.toLocaleString('en')} of ${total.toLocaleString('en')} places left; it changes daily.`), {
    total,
    remaining,
    sources: ['moenv-platform-buyers'],
  });

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
  exclusiveGroups: ['moenv-carbon', 'moenv-carbon-and-air', 'kinmen-vs-moenv'],
  validFrom: from,
  validTo: to,
  validToRule: MOENV_DEADLINE,
  ...(to > '2026-12-31' ? { confirmedThrough: '2026-12-31' } : {}),
  quota: quota('unknown', '2026-07-21', t(`總名額${quotaTotal.toLocaleString('en')}輛；剩餘名額未查證。`, `${quotaTotal.toLocaleString('en')} places in total; remaining places not checked.`), { total: quotaTotal }),
  status2027: to > '2026-12-31' ? MOENV_2027_LONG : MOENV_2027_SHORT,
  sources: [...PDF, 'moenv-platform-faq'],
  confidence: 'verified',
  research: [research, 'outlook-2027-r2#s2-moenv-carbon-air-separate-streams'],
  calculator: true,
});

const air = (id: string, name: [string, string], value: number, from: string, to: string, q: Programme['quota'], region?: Programme['conditions'][number]): Programme => ({
  ...carbon(id, name, value, from, to, 0, region, 'central#moenv-air-pollution-options'),
  exclusiveGroups: ['moenv-air', 'moenv-carbon-and-air', 'kinmen-vs-moenv'],
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
    conditions: [{ kind: 'moea-class', classes: ['heavy-1-2', 'light-1'] }, foreignApplyBy],
    conditionText: t('補助車款清單上的普通重型第1、2級或普通輕型第1級電動機車，新購即可，不必汰舊。', 'A model on the approved list in the heavy class (white plate, 普通重型) at level 1 or 2, or the light class (green plate, 普通輕型) at level 1; buying new is enough, no scrapping needed.'),
    exclusiveGroups: ['moea-base'],
    validFrom: '2022-12-11',
    validTo: '2026-12-31',
    applicationNote: MOEA_APPLY,
    quota: moeaQuota,
    status2027: MOEA_2027,
    sources: [...MOEA_SRC, 'gogoro-2026-lastcall-promo', 'businesstoday-2026-01-subsidy-guide'],
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
    conditions: [{ kind: 'moea-class', classes: ['light-2', 'small', 'light-unknown'] }, foreignApplyBy],
    conditionText: t(
      '普通輕型（綠牌）第2級或小型輕型電動機車。綠牌車款如果無法確認是第1級還是第2級，試算先以5,100元計。',
      'A light-class (green plate, 普通輕型) model at level 2, or a small light-class (小型輕型) model. Where we cannot confirm whether a green-plate model is level 1 or 2, we count NT$5,100.',
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
    conditions: [{ kind: 'domestic-cells' }, foreignApplyBy],
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
    conditions: [scrap, scrapAge(10), foreignApplyBy],
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
  { ...carbon('moenv-carbon-moea', ['環境部減碳獎勵（經濟部買下減碳額度）', 'MOENV carbon-reduction reward (credits bought by MOEA)'], 2000, '2024-11-01', '2026-12-31', 69016), quota: liveQuota(36712, 69016), research: ['central#moenv-carbon-reward-options', 'outlook-2027-r2#s2-platform-quota-live'] },
  {
    ...carbon('moenv-carbon-park', ['環境部減碳獎勵（園管局買下減碳額度）', 'MOENV carbon-reduction reward (credits bought by the Industrial Park Administration)'], 2000, '2025-11-10', '2026-12-31', 546),
    calculator: {
      excluded: t('官方表格列出此選項，但研究資料未記下適用地區；金額與經濟部全國選項相同，試算不另計。', 'The official table lists this option but our research did not record its eligible area; it pays the same as the nationwide MOEA option, so it is not counted separately.'),
      reason: 'unverified',
    },
  },
  {
    ...carbon('moenv-carbon-tainan', ['環境部減碳獎勵（台南市買下減碳額度）', 'MOENV carbon-reduction reward (credits bought by Tainan City)'], 1500, '2026-01-12', '2026-12-31', 3300, { kind: 'region', jurisdictions: ['tainan'] }),
    quota: liveQuota(1670, 3300),
    research: ['central#moenv-carbon-reward-options', 'outlook-2027-r2#s2-platform-quota-live'],
  },
  {
    ...carbon('moenv-carbon-tsmc', ['環境部減碳獎勵（台積電買下減碳額度）', 'MOENV carbon-reduction reward (credits bought by TSMC)'], 2100, '2026-05-08', '2027-12-31', 54000),
    quota: liveQuota(43847, 54000),
    research: ['central#moenv-carbon-reward-options', 'outlook-2027-r2#s2-platform-quota-live'],
  },
  {
    ...carbon('moenv-carbon-tsmc-kaohsiung', ['環境部減碳獎勵（台積電買下減碳額度，限高雄市）', 'MOENV carbon-reduction reward (credits bought by TSMC, Kaohsiung only)'], 2100, '2026-05-08', '2027-12-31', 6000, {
      kind: 'region',
      jurisdictions: ['kaohsiung'],
    }),
    quota: liveQuota(4933, 6000),
    research: ['central#moenv-carbon-reward-options', 'outlook-2027-r2#s2-platform-quota-live'],
  },
  {
    // The research has only one reading of this option: 0 places in both lots on 2026-11-25. It
    // gives no programme dates and no evidence of places on any earlier day, so it is never
    // counted (validFrom/validTo below are placeholders for the calendar year, not sourced dates).
    ...carbon('moenv-carbon-nanshan', ['環境部減碳獎勵（南山人壽買下減碳額度）', 'MOENV carbon-reduction reward (credits bought by Nan Shan Life)'], 2500, '2026-01-01', '2026-12-31', 0),
    quota: quota('exhausted', '2026-11-25', t('環境部媒合平臺 2026 年 11 月 25 日顯示兩批名額都是0。', 'On 25 November 2026 the MOENV platform showed 0 places left in both lots.'), { remaining: 0, sources: ['moenv-platform-buyers'] }),
    status2027: t('方案期間未查到；平臺 2026 年 11 月 25 日顯示名額為0。', 'Programme dates not found; the platform showed 0 places on 25 November 2026.'),
    sources: ['moenv-platform-buyers'],
    research: ['outlook-2027-r2#s2-platform-quota-live'],
    calculator: {
      excluded: t(
        '研究資料只有一筆紀錄：環境部媒合平臺 2026 年 11 月 25 日顯示兩批名額都是0；方案期間與之前是否還有名額都未查到，所以任何日期都不計入。',
        'The research has a single reading: on 25 November 2026 the MOENV platform showed 0 places in both lots; the programme dates and whether places existed earlier were not found, so it is not counted on any date.',
      ),
      reason: 'unverified',
    },
  },

  // ---------------------------------------------------------------- MOENV air subsidy (choose one of six)
  {
    ...air('moenv-air-national', ['環境部空污補助（全國）', 'MOENV air-pollution subsidy (nationwide)'], 1000, '2023-01-01', '2026-12-31', quota('unlimited', '2026-07-21', t('不限名額。', 'No quota.'))),
    status2027: t(
      '環境部 2026 年 11 月 11 日預告草案，擬將空污補助延長至 2030 年底，但尚未定案，草案中的機車金額也未查證；試算不計入 2027 年。',
      'On 11 November 2026 MOENV pre-announced a draft extending the air subsidy to the end of 2030, but it is not final and the scooter amount in the draft was not verified; it is not counted for 2027.',
    ),
    sources: [...PDF, 'moenv-platform-faq', 'chinatimes-2026-11-moenv-draft'],
    research: ['central#moenv-air-pollution-options', 'outlook-2027-r2#s2-moenv-116-extension-draft'],
  },
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
    payerName: t('環境部', 'Ministry of Environment (MOENV)'),
    name: t('環境部廢機車回收獎勵金', 'MOENV recycling payment for a scrapped gasoline scooter'),
    kind: 'recycling-bonus',
    side: 'both',
    amount: fixed(300),
    conditions: [scrap, scrapAge(7)],
    conditionText: t(
      '要報廢的燃油機車交給合格的回收業者回收，就能領 300 元；買電動或燃油新車都可以領（台北市環保局的說明叫它「燃油機車回收獎勵金」）。車齡規定我們只查到台中市環保局寫的「出廠滿 7 年以上」，所以每個縣市都照 7 年算。',
      'Have the gasoline scooter you are replacing recycled by a licensed recycler and you get NT$300, whether the new scooter is electric or gasoline (Taipei\'s DEP calls it the gasoline scooter recycling payment). The only age rule we could confirm is Taichung EPB\'s "7 or more years old", so we apply that everywhere.',
    ),
    exclusiveGroups: ['kinmen-vs-moenv'],
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    validToRule: t('要報廢的機車須在這天以前完成報廢回收。', 'Scrap and recycle the scooter you are replacing by this date.'),
    quota: quota('unknown', '2026-06-01', t('未公布名額。', 'No quota published.')),
    status2027: t('2027 年是否續辦未查證。', 'Whether it continues in 2027 was not checked.'),
    sources: ['taipei-dep-ev-subsidy-plan', 'tvbs-health-2026-01-subsidy', 'tcnews-2026-02-moenv-release', 'taichung-epb-2026-amount-table'],
    confidence: 'verified',
    research: ['taipei#tpe-central-moenv', 'outlook-2027-r2#s2-recycling-300', 'taichung-r2#tc2-stacking'],
    note: t('有些報導把這筆錢視為回收業者付的回收金而非補助；無論如何都是車主實際拿到的錢，電動與燃油兩邊都計入。', 'Some reports treat this as the recycler\'s payment rather than a subsidy; either way the owner receives it, so it is counted on both sides.'),
    calculator: true,
  },
  {
    // new-taipei#ntpc-best-case-total (TVBS): 「採取雙汰舊方案者，因汰除兩輛老舊機車，可獲得兩份車體回收獎勵金」;
    // its 39,600 total adds the second 300.
    id: 'moenv-recycling-300-second',
    jurisdiction: 'central',
    payer: 'moenv',
    payerName: t('環境部', 'Ministry of Environment (MOENV)'),
    name: t('環境部廢機車回收獎勵金（第二台）', 'MOENV recycling payment for a second scrapped scooter'),
    kind: 'recycling-bonus',
    side: 'both',
    amount: fixed(300),
    conditions: [scrap, scrapAge(7), { kind: 'scrap-second-scooter' }],
    conditionText: t(
      '同一次申請再報廢第二台機車（例如新北市的「雙汰舊」）時，第二台也能領一份 300 元回收獎勵金。這一點只見於新聞報導，請向環境部或回收業者確認。',
      'When a second scooter is scrapped in the same application (New Taipei\'s double-scrap route, for example), the second one earns its own NT$300 recycling payment. Only a news report says so; check with MOENV or the recycler.',
    ),
    exclusiveGroups: ['kinmen-vs-moenv'],
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    validToRule: t('兩台要報廢的機車都須在這天以前完成報廢回收。', 'Scrap and recycle both scooters by this date.'),
    quota: quota('unknown', '2026-06-01', t('未公布名額。', 'No quota published.')),
    status2027: t('2027 年是否續辦未查證。', 'Whether it continues in 2027 was not checked.'),
    sources: ['tvbs-health-2026-01-subsidy'],
    confidence: 'secondary',
    research: ['new-taipei#ntpc-best-case-total', 'outlook-2027-r2#s2-recycling-300'],
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
    exclusiveGroups: ['gas-goods-tax-new', 'gas-goods-tax-stacking'],
    validFrom: '2025-09-07',
    validTo: '2030-12-31',
    quota: quota('unlimited', '2025-12-05', t('不限名額。', 'No quota.')),
    status2027: t('依財政部網頁實施至 2030 年 12 月 31 日。', 'In force to 31 December 2030 per the MOF page.'),
    sources: ['etax-goods-tax-scooter-cut', 'kymco-goods-tax-models', 'etax-goods-tax-ev-exemption'],
    confidence: 'verified',
    research: ['central#goods-tax-new-gasoline-2000', 'central#goods-tax-ev-exempt', 'gas-prices#kymco-gov-tax-table', 'outlook-2027-r2#s2-goods-tax-stack-gasoline', 'taichung-r2#tc2-stacking'],
    note: t('電動機車本來就免徵貨物稅（至 2030 年底），已反映在售價中，所以電動那邊沒有這一行。', 'Electric scooters are already exempt from goods tax (to the end of 2030), which is built into their price, so there is no matching line on the electric side.'),
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
    exclusiveGroups: ['gas-goods-tax-stacking'],
    conditionText: t(
      '報廢出廠滿4年、150cc以下的舊機車，並在新車登記前後6個月內完成；實際減徵金額依車款核定，最高4,000元，須經國稅局核定。',
      'Scrap a scooter of 150cc or less that is at least 4 years old within 6 months before or after registering the new one; the amount is set per model, at most NT$4,000, and needs tax-office approval.',
    ),
    validFrom: '2025-09-07',
    validTo: '2030-12-31',
    quota: quota('unlimited', '2025-12-05', t('不限名額。', 'No quota.')),
    status2027: t('依財政部網頁實施至 2030 年 12 月 31 日。', 'In force to 31 December 2030 per the MOF page.'),
    sources: ['etax-goods-tax-scooter-cut', 'kymco-goods-tax-models', 'sym-2026-11-offers'],
    confidence: 'verified',
    research: ['central#goods-tax-scrap-replace-4000', 'gas-prices#kymco-gov-tax-table', 'gas-prices#sym-duke125-nov-promo'],
    note: t(
      '財政部網頁把新購2,000元與汰舊4,000元分開列，沒有寫可以相加；光陽與三陽的11月官方優惠與台中市環保局的金額表則兩者都算。試算依車廠做法相加，這會讓燃油車看起來較便宜，對電動車的比較是保守的；但相加只有次級依據，財政部未確認。',
      'The MOF page lists the new-purchase NT$2,000 and scrap NT$4,000 separately and does not say they add up; KYMCO\'s and SYM\'s official November offers and Taichung\'s EPB amount table count both. We follow the manufacturers, which makes the gasoline scooter look cheaper and keeps the comparison conservative for electric; but the stacking rests on secondary evidence and the MOF has not confirmed it.',
    ),
    calculator: true,
  },
];
