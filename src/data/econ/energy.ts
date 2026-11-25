// Energy: battery plans, plan credits, pump prices (with the temporary smoothing) and household
// electricity tiers.
//
// Gogoro plans are confirmed from Gogoro Network's own support pages (second research round):
// allowance plans (自由省 / 高用量自由省) are modelled as an included number of Ah with NT$2.3 per Ah
// beyond it. Gogoro's dynamic discount (up to 20% off at some stations) is not counted.

import { t } from '../types.ts';
import type { ElectricityPrices, EnergyPlan, FuelPrices, PlanCredit } from './types.ts';

const GOGORO_488 = ['gogoro-488-888-promo', 'kingautos-2025-04-gogoro-488'] as const;
const WINDOWS = t('每日00:00–06:00、10:00–16:00、22:00–24:00換電免費', 'Free swaps daily 00:00–06:00, 10:00–16:00 and 22:00–24:00');
const IONEX = ['ionex-plans'] as const;
const IONEX_TERMS = t(
  '月租基本費即使不騎也照收；額度內電池使用費以折抵金扣抵，超量每度52元（2026年9月1日起）；提前解約須付未到期月數乘以折扣前基本費的50%。Ionex在2026年調漲資費，兩年約滿後須重新簽約。',
  'The base fee is charged even at zero km; usage is paid from the included credit, then NT$52 per kWh (from 1 September 2026); early exit costs 50% of the pre-discount base fee for each remaining month. Ionex raised prices in 2026 and requires re-signing after two-year terms.',
);

// The plan's credit buys battery use at NT$52 per kWh when swapping: credit / 52 kWh. The higher
// figures on the plan page (e.g. 6.8 kWh on the 318 plan) apply only in charge mode on plug-and-swap
// models, which earn NT$15 per kWh back (credit / 37) and pay household electricity on top. No
// model offered these plans in the calculator is verified as able to charge at home, so every
// bound uses the swap figure: the honest cost for a swap rider, never an optimistic one.
const ionexAllowance = (credit: number) => {
  const kwh = Math.round((credit / 52) * 10) / 10;
  return {
    low: kwh,
    typical: kwh,
    high: kwh,
    typicalBasis: t(
      `換電時折抵金每度扣52元，${credit}元約可用${kwh}度；官方頁較高的度數只適用充換合一車款的充電模式（每度回饋15元），試算的車款都沒有查證可在家充電。`,
      `Swapping uses the NT$${credit} credit at NT$52 per kWh, about ${kwh} kWh; the higher figures on the plan page apply only in charge mode on plug-and-swap models (NT$15 per kWh back), and no model offered here is verified as able to charge at home.`,
    ),
    sources: [...IONEX],
    confidence: 'verified' as const,
    research: ['running-costs#ionex-plans-single', 'home-charge-evs-r2#ionex-home-charge-plan', 'home-charge-evs-r2#ionex-which-models-charge'],
  };
};

const ionexPlan = (id: string, fee: number, batteries: 1 | 2, credit: number, research: string): EnergyPlan => ({
  id,
  operator: 'ionex',
  system: 'ionex',
  name: t(`Ionex ${batteries === 1 ? '單電池' : '雙電池'}${fee}方案`, `Ionex ${batteries === 1 ? 'single' : 'dual'}-battery plan ${fee}`),
  batteries,
  unit: 'kWh',
  monthlyFee: fee,
  usage: { kind: 'credit', creditNtd: credit, allowance: ionexAllowance(credit), overageRate: 52 },
  terms: IONEX_TERMS,
  sources: [...IONEX],
  confidence: 'verified',
  research: [research, 'running-costs#ionex-price-risk'],
  calculator: true,
});

const gogoroAllowance = (id: string, fee: number, batteries: 1 | 2, ah: number, lockIn: number | undefined, research: string): EnergyPlan => ({
  id,
  operator: 'gogoro',
  system: 'gogoro',
  name: t(`Gogoro ${fee >= 529 && batteries === 1 ? '高用量自由省' : fee === 1269 ? '高用量自由省' : '自由省'}${fee}（${batteries === 1 ? '單電池' : '雙電池'}）`, `Gogoro ${fee >= 529 && batteries === 1 ? 'high-usage ' : fee === 1269 ? 'high-usage ' : ''}plan ${fee} (${batteries === 1 ? 'single battery' : 'two batteries'})`),
  batteries,
  unit: 'Ah',
  monthlyFee: fee,
  usage: {
    kind: 'credit',
    creditNtd: Math.round(ah * 2.3),
    allowance: {
      low: ah,
      typical: ah,
      high: ah,
      typicalBasis: t(`官方支援頁：每月含${ah}安時，超過每安時2.3元。`, `Official support page: ${ah} Ah included each month, NT$2.3 per Ah beyond.`),
      sources: ['gogoro-network-plan-pages'],
      confidence: 'verified',
      research: [research],
    },
    overageRate: 2.3,
  },
  ...(lockIn ? { lockInMonths: lockIn } : {}),
  terms: lockIn
    ? t(`綁約${lockIn}個月（提前解約須付違約金，按剩餘天數比例計）；未用完的額度不累積；超量每安時2.3元；Gogoro可不另行通知調整方案。`, `${lockIn}-month contract (early-exit penalty scaled by remaining days); unused allowance does not carry over; NT$2.3 per Ah beyond it; Gogoro may change plans without individual notice.`)
    : t('官方頁面沒有寫綁約期；未用完的額度不累積；超量每安時2.3元；Gogoro可不另行通知調整方案。', 'No contract term is stated on the official pages; unused allowance does not carry over; NT$2.3 per Ah beyond it; Gogoro may change plans without individual notice.'),
  sources: ['gogoro-network-plan-pages', 'gogoro-488-888-promo'],
  confidence: 'verified',
  research: [research, 'gogoro-official-r2#plan-table-2025-07'],
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
    usage: { kind: 'time-window', offWindowRate: 2.3, windows: WINDOWS, fairUseUnits: 1600 },
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
    usage: { kind: 'time-window', offWindowRate: 2.3, windows: WINDOWS, fairUseUnits: 1600 },
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
      sources: ['gogoro-network-payg-page', 'tvbs-2025-07-gogoro-setup-fee'],
      confidence: 'verified',
      research: ['gogoro-official-r2#gogoro-payg-plan', 'maintenance-fees#battery-sub-setup-fee'],
      note: t('設定費不是預付電池費；部分車款或刷卡優惠可減免。24個月後續約須再付一次。', 'The setup fee is not prepaid battery credit; some models or card offers waive part of it. Renewing after 24 months needs a new setup fee.'),
    },
    setupFeeRenews: true,
    lockInMonths: 24,
    terms: t('綁約24個月，無月租費，每安時1.1元，開通時收一次性設定費（續約須再付）；提前解約須付4,800元乘以剩餘比例，設定費按比例退還。', '24-month contract, no monthly fee, NT$1.1 per Ah, one-off setup fee at activation (again on renewal); early exit costs NT$4,800 × the remaining share, with the setup fee refunded pro rata.'),
    sources: ['gogoro-network-payg-page', 'gogoro-2025-07-payg-press'],
    confidence: 'verified',
    research: ['gogoro-official-r2#gogoro-payg-plan', 'running-costs#gogoro-zero-monthly'],
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
      sources: ['gogoro-network-payg-page', 'tvbs-2025-07-gogoro-setup-fee'],
      confidence: 'verified',
      research: ['gogoro-official-r2#gogoro-payg-plan', 'maintenance-fees#battery-sub-setup-fee'],
      note: t('24個月後續約須再付一次設定費。', 'Renewing after 24 months needs a new setup fee.'),
    },
    setupFeeRenews: true,
    lockInMonths: 24,
    terms: t('綁約24個月，無月租費，每安時1.1元，開通時收一次性設定費（續約須再付）；提前解約須付7,200元乘以剩餘比例。', '24-month contract, no monthly fee, NT$1.1 per Ah, one-off setup fee at activation (again on renewal); early exit costs NT$7,200 × the remaining share.'),
    sources: ['gogoro-network-payg-page', 'gogoro-2025-07-payg-press'],
    confidence: 'verified',
    research: ['gogoro-official-r2#gogoro-payg-plan', 'running-costs#gogoro-zero-monthly'],
    calculator: true,
  },
  gogoroAllowance('gogoro-319-single', 319, 1, 87, undefined, 'gogoro-official-r2#gogoro-official-tariff-plans'),
  gogoroAllowance('gogoro-529-single', 529, 1, 565.2, 18, 'gogoro-official-r2#gogoro-official-tariff-plans'),
  gogoroAllowance('gogoro-319-dual', 319, 2, 87, undefined, 'gogoro-official-r2#gogoro-official-tariff-plans'),
  gogoroAllowance('gogoro-519-dual', 519, 2, 260.9, undefined, 'gogoro-official-r2#gogoro-official-tariff-plans'),
  gogoroAllowance('gogoro-819-dual', 819, 2, 521.7, undefined, 'gogoro-official-r2#gogoro-official-tariff-plans'),
  gogoroAllowance('gogoro-1269-dual', 1269, 2, 1304.3, 18, 'gogoro-official-r2#gogoro-official-tariff-plans'),
  ionexPlan('ionex-318-single', 318, 1, 250, 'other-ev-brands#ionex-plan-single-318'),
  ionexPlan('ionex-518-single', 518, 1, 650, 'other-ev-brands#ionex-plan-single-518'),
  ionexPlan('ionex-518-dual', 518, 2, 650, 'other-ev-brands#ionex-plan-dual'),
  ionexPlan('ionex-818-dual', 818, 2, 1050, 'other-ev-brands#ionex-plan-dual'),
  ionexPlan('ionex-1218-dual', 1218, 2, 1550, 'other-ev-brands#ionex-plan-dual'),
  ionexPlan('ionex-2018-dual', 2018, 2, 2550, 'other-ev-brands#ionex-plan-dual'),
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
        low: 1.78,
        typical: 2.36,
        high: 5.14,
        typicalBasis: t(
          '住宅非時間電價依全戶用電量累進，機車充電以全戶邊際級距計價：低值為最低級距1.78元，中間值為121至330度級距的全年平均2.36元（8個非夏月2.26元、4個夏月2.55元），高值為夏月501至700度的5.14元（2026年4月起費率，媒體轉述）。',
          'Residential tiered tariffs are cumulative, so charging is billed at the household\'s marginal tier: low is the first tier (1.78), middle the 121–330 kWh tier averaged over the year (2.36: eight non-summer months at 2.26 and four summer months at 2.55), high the summer 501–700 kWh tier (5.14) (rates from April 2026, as reported by the media).',
        ),
        sources: ['tvbs-2026-electricity-tariff'],
        confidence: 'secondary',
        research: ['energy-prices-r2#tariff-nonsummer-2026', 'energy-prices-r2#tariff-summer-2026'],
      },
      losses: {
        low: 1.1,
        typical: 1.1,
        high: 1.15,
        basis: t('另加計充電損耗：低值與中間值10%、高值15%（常見估計，未查證）。', 'Charging losses are added: 10% for the low and middle values, 15% for the high one (a common estimate, not verified).'),
      },
    },
    terms: t('只適用可插電充電的車款；充電損耗以常見估計的10%至15%計入（未查證）。', 'Only for plug-in models; charging losses are counted at the commonly estimated 10–15% (unverified).'),
    sources: ['tvbs-2026-electricity-tariff', 'wantrich-2026-09-tariff-freeze'],
    confidence: 'secondary',
    research: ['energy-prices-r2#calc-home-charge-per-km', 'running-costs#tariff-freeze'],
    calculator: true,
  },
];

const EZZY_WINDOW = t('須在2026年12月31日以前下訂、付清並開立發票，並開通電池服務。', 'Order, pay in full and be invoiced by 31 December 2026, and activate the battery service.');

export const planCredits: PlanCredit[] = [
  {
    id: 'gogoro-ezzy-151-2026',
    name: t('Gogoro EZZY新車資費每月折151元（24個月）', 'Gogoro EZZY new-scooter plan credit of NT$151 a month (24 months)'),
    perMonth: 151,
    months: 24,
    plans: ['gogoro-319-single', 'gogoro-529-single', 'gogoro-488'],
    models: ['gogoro-ezzy'],
    validFrom: '2026-09-08',
    validTo: '2026-12-31',
    sources: ['gogoro-2026-ezzy-promo'],
    confidence: 'verified',
    research: ['gogoro-official-r2#ezzy-plan-168', 'gogoro#promo-ezzy-151'],
    windowRule: EZZY_WINDOW,
    note: t('只折抵基本費；換方案、轉賣或過戶即失效；能否與其他含車價折扣的優惠併用由Gogoro決定。', 'Offsets the base fee only; lost if you change plan, sell or transfer the scooter; Gogoro decides whether it combines with other offers that include a price discount.'),
  },
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
    windowRule: t('新車須在2026年12月31日以前完成領牌（以領牌日為準）。', 'The scooter must be plated by 31 December 2026 (the plate-registration date counts).'),
  },
  {
    id: 'gogoro-819-320-2026',
    name: t('Gogoro雙電池新車819資費每月折320元（24個月）', 'Gogoro new two-battery scooter: NT$320 a month off the NT$819 plan (24 months)'),
    perMonth: 320,
    months: 24,
    plans: ['gogoro-819-dual'],
    models: ['gogoro-ezzy-500'],
    validFrom: '2026-09-01',
    validTo: '2026-12-31',
    sources: ['gogoro-2026-09-819-plan-offer'],
    confidence: 'verified',
    research: ['gogoro#promo-819-credit'],
    windowRule: t('活動期間為2026年9月1日至12月31日；官方頁沒有寫是以訂車、發票還是領牌日為準，請向門市確認。', 'The offer runs 1 September to 31 December 2026; the page does not say whether the order, invoice or plate date counts, so check with the store.'),
    note: t('只折抵基本費，未用完不累積。', 'Offsets the base fee only; unused credit does not carry over.'),
  },
];

export const fuel: FuelPrices = {
  petrol95: {
    value: 32.7,
    week: t('2026年11月23日至29日', '23–29 November 2026'),
    sources: ['cpc-price-history', 'kingautos-2026-11-fuel-price'],
    confidence: 'verified',
    research: ['energy-prices-r2#cpc-current-2026-11-23', 'energy-prices-r2#cpc-flat-since-oct-12'],
    note: t('中油95無鉛參考牌價，自10月12日起連續七週未調整；2026年1月時只有27.9元。', 'CPC 95 unleaded reference price, unchanged for seven weeks since 12 October; in January 2026 it was only NT$27.9.'),
  },
  petrol92: {
    value: 31.2,
    week: t('2026年11月23日至29日', '23–29 November 2026'),
    sources: ['cpc-price-history'],
    confidence: 'verified',
    research: ['energy-prices-r2#cpc-92-current-2026-11-23'],
  },
  smoothing: {
    low: 6.0,
    typical: 6.0,
    high: 11.6,
    typicalBasis: t(
      '2026年11月16日至22日吸收的金額（政府貨物稅3.7元加中油2.3元），是最近一週查得的數字；11月23日至29日的吸收金額未查到。11月初曾高達11.6元。',
      'The amount absorbed in the week of 16–22 November 2026 (3.7 goods-tax cut plus 2.3 from CPC), the latest week for which it was found; the figure for 23–29 November was not found. It was as high as 11.6 in early November.',
    ),
    mechanism: t(
      '政府擴大貨物稅減徵並由中油加碼吸收（專案平穩機制），自2026年2月底起實施；其中汽油貨物稅減徵預定2027年3月31日到期（除非延長），中油的部分逐週決定。取消後汽油每公升約貴6至12元。',
      'A wider goods-tax cut plus extra absorption by CPC (a special smoothing programme) since late February 2026; the gasoline goods-tax part is set to end on 31 March 2027 unless extended, and CPC\'s part is decided week by week. Without it petrol would cost about NT$6–12 more per litre.',
    ),
    scheduledEnd: '2027-03-31',
    mechanismAfterEnd: t(
      '試算用的油價（每公升32.7元）是2026年11月23日當週的價格，當時政府與中油的暫時平穩措施每公升壓低約6元；汽油貨物稅減徵預定2027年3月31日到期，這個日期已過，資料查證後是否延長、油價是否變動都未查證，請以目前油價為準。',
      'The fuel price used (NT$32.7 a litre) is the price for the week of 23 November 2026, when a temporary government and CPC smoothing programme held it down by about NT$6 a litre; its goods-tax part was set to end on 31 March 2027, which has passed, and whether it was extended or prices changed since the data was checked is not known, so use the current pump price.',
    ),
    sources: ['ey-2026-11-fuel-prices', 'ey-fuel-goods-tax-cut-round-18', 'cna-2026-10-fuel-smoothing'],
    confidence: 'verified',
    research: ['outlook-2027-r2#s2-petrol-absorbed-per-litre', 'outlook-2027-r2#s2-petrol-goods-tax-cut-expiry', 'running-costs#fuel-smoothing-mechanism'],
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
    { upToKwh: 120, rate: 1.78 },
    { upToKwh: 330, rate: 2.55 },
    { upToKwh: 500, rate: 3.8 },
    { upToKwh: 700, rate: 5.14 },
    { upToKwh: 1000, rate: 6.44 },
    { upToKwh: null, rate: 8.86 },
  ],
  nonSummer: [
    { upToKwh: 120, rate: 1.78 },
    { upToKwh: 330, rate: 2.26 },
    { upToKwh: 500, rate: 3.13 },
    { upToKwh: 700, rate: 4.24 },
    { upToKwh: 1000, rate: 5.27 },
    { upToKwh: null, rate: 7.03 },
  ],
  reviewNote: t('截至2026年11月25日：2026年9月電價審議會決議暫時凍漲，延至12月審議；2027年電價可能已經調整。', 'As of 25 November 2026: the September 2026 review froze tariffs and deferred the decision to December 2026, so 2027 tariffs may have changed.'),
  sources: ['tvbs-2026-electricity-tariff', 'wantrich-2026-09-tariff-freeze'],
  confidence: 'secondary',
  research: ['energy-prices-r2#tariff-nonsummer-2026', 'energy-prices-r2#tariff-summer-2026', 'running-costs#tariff-freeze'],
  note: t('2026年4月起的級距，取自兩家媒體報導；台電官網未能開啟。', 'Tiers from April 2026 as reported by two media outlets; the Taipower site could not be opened.'),
};
