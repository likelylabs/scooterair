// Energy: battery plans, plan credits, pump prices (with the temporary smoothing) and household
// electricity tiers.
//
// Gogoro's allowance plans (自由省 319/519/529/819) are NOT here: their 2026 terms come only from
// JavaScript-loaded support pages and an older article, and verified alternatives exist (488/888
// and the NT$1.1/Ah pay-per-use rate), so by the dataset rules they are left out.

import { t } from '../types.ts';
import type { ElectricityPrices, EnergyPlan, FuelPrices, PlanCredit } from './types.ts';

const GOGORO_488 = ['gogoro-488-888-promo', 'kingautos-2025-04-gogoro-488'] as const;
const WINDOWS = t('每日00:00–06:00、10:00–16:00、22:00–24:00換電免費', 'Free swaps daily 00:00–06:00, 10:00–16:00 and 22:00–24:00');
const IONEX = ['ionex-plans'] as const;
const IONEX_TERMS = t(
  '月租基本費即使不騎也照收；額度內電池使用費以折抵金扣抵，超量每度52元（2026年9月1日起）；提前解約須付未到期月數乘以折扣前基本費的50%。Ionex在2026年調漲資費，兩年約滿後須重新簽約。',
  'The base fee is charged even at zero km; usage is paid from the included credit, then NT$52 per kWh (from 1 September 2026); early exit costs 50% of the pre-discount base fee for each remaining month. Ionex raised prices in 2026 and requires re-signing after two-year terms.',
);

const ionexAllowance = (low: number, high: number) => ({
  low,
  typical: Math.round(((low + high) / 2) * 10) / 10,
  high,
  typicalBasis: t('官方資費頁的額度範圍（實際可用度數依換電時段而異）取中間值。', 'Midpoint of the allowance range on the official plan page (the usable kWh depends on when you swap).'),
  sources: [...IONEX],
  confidence: 'verified' as const,
  research: ['other-ev-brands#ionex-plan-single-318', 'running-costs#ionex-plans-single'],
});

const ionexPlan = (id: string, fee: number, batteries: 1 | 2, credit: number, low: number, high: number, research: string): EnergyPlan => ({
  id,
  operator: 'ionex',
  system: 'ionex',
  name: t(`Ionex ${batteries === 1 ? '單電池' : '雙電池'}${fee}方案`, `Ionex ${batteries === 1 ? 'single' : 'dual'}-battery plan ${fee}`),
  batteries,
  unit: 'kWh',
  monthlyFee: fee,
  usage: { kind: 'credit', creditNtd: credit, allowance: ionexAllowance(low, high), overageRate: 52 },
  terms: IONEX_TERMS,
  sources: [...IONEX],
  confidence: 'verified',
  research: [research, 'running-costs#ionex-price-risk'],
  calculator: true,
});

export const plans: EnergyPlan[] = [
  {
    id: 'gogoro-488',
    operator: 'gogoro',
    system: 'gogoro',
    name: t('Gogoro 488騎到飽（單電池）', 'Gogoro 488 ride-all-you-want (single battery)'),
    batteries: 1,
    unit: 'Ah',
    monthlyFee: 488,
    usage: { kind: 'time-window', offWindowRate: 2.3, windows: WINDOWS },
    lockInMonths: 24,
    terms: t(
      '綁約24個月；指定時段外換電每安時2.3元；提前解約須付2,400元乘以剩餘天數除以730；連續兩個月超過1,600安時可能被視為商業使用。',
      '24-month contract; swaps outside the free windows cost NT$2.3 per Ah; early exit costs NT$2,400 × remaining days / 730; over 1,600 Ah two months running may be treated as commercial use.',
    ),
    sources: [...GOGORO_488],
    confidence: 'verified',
    research: ['gogoro#plan-488', 'running-costs#gogoro-ride-all-you-want'],
    calculator: true,
  },
  {
    id: 'gogoro-888',
    operator: 'gogoro',
    system: 'gogoro',
    name: t('Gogoro 888騎到飽（雙電池）', 'Gogoro 888 ride-all-you-want (two batteries)'),
    batteries: 2,
    unit: 'Ah',
    monthlyFee: 888,
    usage: { kind: 'time-window', offWindowRate: 2.3, windows: WINDOWS },
    lockInMonths: 24,
    terms: t('綁約24個月；指定時段外換電每安時2.3元；提前解約須付7,200元乘以剩餘天數除以730。', '24-month contract; swaps outside the free windows cost NT$2.3 per Ah; early exit costs NT$7,200 × remaining days / 730.'),
    sources: [...GOGORO_488],
    confidence: 'verified',
    research: ['gogoro#plan-488', 'running-costs#gogoro-ride-all-you-want'],
    calculator: true,
  },
  {
    id: 'gogoro-payg-single',
    operator: 'gogoro',
    system: 'gogoro',
    name: t('Gogoro 0月租（單電池）', 'Gogoro zero-monthly-fee plan (single battery)'),
    batteries: 1,
    unit: 'Ah',
    monthlyFee: 0,
    usage: { kind: 'per-unit', rate: 1.1 },
    setupFee: {
      value: 6000,
      sources: ['tvbs-2025-07-gogoro-setup-fee'],
      confidence: 'secondary',
      research: ['maintenance-fees#battery-sub-setup-fee', 'running-costs#gogoro-zero-monthly'],
      note: t('設定費金額取自2025年7月上市時的報導，Gogoro新聞稿沒有寫金額，2026年條件未能查證。', 'The setup fee is from July 2025 launch coverage; Gogoro\'s press release gives no amount and 2026 terms could not be checked.'),
    },
    lockInMonths: 24,
    terms: t('綁約24個月，無月租費，每安時1.1元，開通時收一次性設定費。', '24-month contract, no monthly fee, NT$1.1 per Ah, one-off setup fee at activation.'),
    sources: ['gogoro-2025-07-payg-press'],
    confidence: 'verified',
    research: ['running-costs#gogoro-zero-monthly', 'gogoro#plan-payg'],
    calculator: true,
  },
  {
    id: 'gogoro-payg-dual',
    operator: 'gogoro',
    system: 'gogoro',
    name: t('Gogoro 0月租（雙電池）', 'Gogoro zero-monthly-fee plan (two batteries)'),
    batteries: 2,
    unit: 'Ah',
    monthlyFee: 0,
    usage: { kind: 'per-unit', rate: 1.1 },
    setupFee: {
      value: 9000,
      sources: ['tvbs-2025-07-gogoro-setup-fee'],
      confidence: 'secondary',
      research: ['maintenance-fees#battery-sub-setup-fee', 'running-costs#gogoro-zero-monthly'],
      note: t('設定費金額取自2025年7月上市時的報導，2026年條件未能查證。', 'The setup fee is from July 2025 launch coverage; 2026 terms could not be checked.'),
    },
    lockInMonths: 24,
    terms: t('綁約24個月，無月租費，每安時1.1元，開通時收一次性設定費。', '24-month contract, no monthly fee, NT$1.1 per Ah, one-off setup fee at activation.'),
    sources: ['gogoro-2025-07-payg-press'],
    confidence: 'verified',
    research: ['running-costs#gogoro-zero-monthly'],
    calculator: true,
  },
  ionexPlan('ionex-318-single', 318, 1, 250, 4.8, 6.8, 'other-ev-brands#ionex-plan-single-318'),
  ionexPlan('ionex-518-single', 518, 1, 650, 12.5, 17.6, 'other-ev-brands#ionex-plan-single-518'),
  ionexPlan('ionex-518-dual', 518, 2, 650, 12.5, 17.6, 'other-ev-brands#ionex-plan-dual'),
  ionexPlan('ionex-818-dual', 818, 2, 1050, 20.2, 28.4, 'other-ev-brands#ionex-plan-dual'),
  ionexPlan('ionex-1218-dual', 1218, 2, 1550, 29.8, 41.9, 'other-ev-brands#ionex-plan-dual'),
  ionexPlan('ionex-2018-dual', 2018, 2, 2550, 49, 68.9, 'other-ev-brands#ionex-plan-dual'),
  {
    id: 'home-charging',
    operator: 'household',
    system: 'home',
    name: t('在家充電（住宅電價）', 'Charging at home (residential tariff)'),
    batteries: 'any',
    unit: 'kWh',
    monthlyFee: 0,
    usage: {
      kind: 'tariff',
      rate: {
        low: 1.68,
        typical: 3.03,
        high: 5.04,
        typicalBasis: t(
          '住宅非時間電價依全戶用電量累進，機車充電以全戶邊際級距計價：低值為最低級距1.68元，中間值為非夏月331至500度的3.03元，高值為夏月501至700度的5.04元。',
          'Residential tiered tariffs are cumulative, so charging is billed at the household\'s marginal tier: low is the first tier (1.68), middle the non-summer 331–500 kWh tier (3.03), high the summer 501–700 kWh tier (5.04).',
        ),
        sources: ['kikinote-2026-05-electricity-tariff'],
        confidence: 'secondary',
        research: ['running-costs#tariff-summer-tiers', 'running-costs#tariff-nonsummer-tiers'],
      },
    },
    terms: t('只適用可插電充電的車款；充電器損耗（常見估計10%至15%）未查證，未計入。', 'Only for plug-in models; charger losses (often put at 10–15%) are unverified and not counted.'),
    sources: ['kikinote-2026-05-electricity-tariff', 'wantrich-2026-09-tariff-freeze'],
    confidence: 'secondary',
    research: ['running-costs#home-charge-cost-per-km', 'running-costs#tariff-freeze'],
    calculator: true,
  },
];

export const planCredits: PlanCredit[] = [
  {
    id: 'ionex-q4-2026-99',
    name: t('Ionex資費每月折99元（12個月）', 'Ionex NT$99 a month off the plan (12 months)'),
    perMonth: 99,
    months: 12,
    plans: 'any',
    models: ['ionex-ione-air'],
    validFrom: '2026-10-01',
    validTo: '2026-12-31',
    sources: ['ionex-event-261'],
    confidence: 'verified',
    research: ['other-ev-brands#ionex-promo-coolone-air'],
  },
];

export const fuel: FuelPrices = {
  petrol95: {
    value: 32.7,
    week: t('2026年11月16日至22日', '16–22 November 2026'),
    sources: ['kingautos-2026-11-fuel-price'],
    confidence: 'verified',
    research: ['running-costs#fuel-95-current'],
    note: t('中油95無鉛參考牌價；11月23日起的價格未能查到。', 'CPC 95 unleaded reference price; the price from 23 November could not be found.'),
  },
  petrol92: {
    value: 31.2,
    week: t('2026年11月16日至22日', '16–22 November 2026'),
    sources: ['kingautos-2026-11-fuel-price'],
    confidence: 'verified',
    research: ['running-costs#fuel-92-current'],
  },
  smoothing: {
    low: 6.0,
    typical: 6.0,
    high: 11.6,
    typicalBasis: t('採用油價那一週吸收的金額（政府貨物稅3.7元加中油2.3元）；11月初曾高達11.6元。', 'The amount absorbed in the week whose price we use (3.7 goods-tax cut plus 2.3 from CPC); it was as high as 11.6 in early November.'),
    mechanism: t(
      '政府擴大貨物稅減徵並由中油加碼吸收（專案平穩機制），自2026年2月底起實施，沒有公布結束日期；取消後汽油每公升約貴6至12元。',
      'A wider goods-tax cut plus extra absorption by CPC (a special smoothing programme) since late February 2026, with no published end date; without it petrol would cost about NT$6–12 more per litre.',
    ),
    sources: ['kingautos-2026-11-fuel-price', 'cna-2026-10-fuel-smoothing'],
    confidence: 'verified',
    research: ['running-costs#fuel-smoothing-mechanism'],
  },
  realWorldKmPerL: {
    value: 45,
    sources: ['kikinote-fuel-cost-assumption'],
    confidence: 'secondary',
    research: ['running-costs#fuelecon-realworld', 'running-costs#fuel-cost-per-km-derived'],
    note: t(
      '官方油耗是測試值，實際騎乘較低；高成本端採每公升45公里（常見估計，非實測）。交通部調查所有燃油機車車主自報平均只有24.7公里，但涵蓋舊車與大排氣量車。',
      'Official figures are test values and real riding is lower; the high-cost end uses 45 km/L (a common estimate, not a measurement). The MOTC owner survey average is only 24.7 km/L, but it covers old and large bikes too.',
    ),
  },
};

export const electricity: ElectricityPrices = {
  summer: [
    { upToKwh: 120, rate: 1.68 },
    { upToKwh: 330, rate: 2.45 },
    { upToKwh: 500, rate: 3.7 },
    { upToKwh: 700, rate: 5.04 },
    { upToKwh: 1000, rate: 6.24 },
    { upToKwh: null, rate: 8.46 },
  ],
  nonSummer: [
    { upToKwh: 120, rate: 1.68 },
    { upToKwh: 330, rate: 2.16 },
    { upToKwh: 500, rate: 3.03 },
    { upToKwh: 700, rate: 4.14 },
    { upToKwh: 1000, rate: 5.07 },
    { upToKwh: null, rate: 6.63 },
  ],
  reviewNote: t('2026年9月電價審議會決議暫時凍漲，延至12月審議；2027年電價可能調整。', 'The September 2026 review froze tariffs and deferred the decision to December; 2027 tariffs may change.'),
  sources: ['kikinote-2026-05-electricity-tariff', 'wantrich-2026-09-tariff-freeze'],
  confidence: 'secondary',
  research: ['running-costs#tariff-summer-tiers', 'running-costs#tariff-nonsummer-tiers', 'running-costs#tariff-freeze'],
  note: t('級距表取自部落格，台電官網當時無法開啟。', 'Tier table from a blog; the Taipower site could not be opened at the time.'),
};
