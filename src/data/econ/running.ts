// Running-cost inputs other than energy: maintenance (as ranges), fixed yearly fees, and the
// MOTC owner survey used as a reference point.
//
// Tyres and brake pads are left out of both sides: the research found no sourced difference
// between gasoline and electric, and prices are the same.

import { t } from './l10n.ts';
import type { FixedFees, MaintenanceProfile, SpendReference } from './types.ts';

export const maintenance: MaintenanceProfile[] = [
  {
    id: 'gas-125',
    label: t('125cc燃油機車定期保養', 'Scheduled maintenance, 125cc gasoline scooter'),
    kind: 'per-km',
    perKm: {
      low: 0.42,
      typical: 0.68,
      high: 0.94,
      typicalBasis: t(
        '依原廠保養表（機油每1,000公里等）與車行零件價格推算：每年5,000公里約2,100至4,700元、10,000公里約4,200至9,200元，換算每公里0.42至0.94元，取中間值；不含輪胎、工資加價與電瓶。',
        'Worked out from the manufacturers\' schedules (oil every 1,000 km and so on) and dealer parts prices: about NT$2,100–4,700 a year at 5,000 km and NT$4,200–9,200 at 10,000 km, i.e. NT$0.42–0.94 per km; the middle value is the midpoint. Excludes tyres, extra labour and the battery.',
      ),
      sources: ['2motor-maintenance-prices', 'sym-maintenance-schedule-2022'],
      confidence: 'secondary',
      research: ['maintenance-fees#derived-gas-5k', 'maintenance-fees#derived-gas-10k', 'maintenance-fees#price-oil', 'maintenance-fees#sched-sym-oil'],
      note: t('「照表保養」的估計，很多車主換機油的頻率較低。', 'A "by the book" estimate; many riders change oil less often.'),
    },
    ownerAverage: {
      value: 2070,
      sources: ['motc-2024-scooter-survey'],
      confidence: 'verified',
      research: ['running-costs#spend-electric-vs-gas', 'running-costs#maintenance-estimates'],
      note: t('交通部調查普通重型燃油機車車主自報的平均每年保養維修費。', 'MOTC survey: heavy-class gasoline owners\' reported average yearly maintenance and repair spend.'),
    },
  },
  {
    id: 'ev-gogoro-hub',
    label: t('Gogoro輪轂／輕保養馬達車款定期保養', 'Scheduled maintenance, Gogoro hub-motor / light-service models'),
    kind: 'visits',
    intervalKm: 5000,
    minVisitsPerYear: 2,
    intervalBasis: {
      text: t('Gogoro Care：輪轂馬達、輕保養勁速馬達車款每5,000公里或6個月保養一次，以先到者為準。', 'Gogoro Care: hub-motor and light-service models every 5,000 km or 6 months, whichever comes first.'),
      sources: ['gogoro-care-intervals'],
      confidence: 'verified',
      research: ['maintenance-fees#sched-gogoro-intervals', 'gogoro-official-r2#service-warranty-secondary'],
    },
    perVisit: {
      low: 385,
      typical: 433,
      high: 587,
      typicalBasis: t('Gogoro Care官方價格資料：EZZY每5,000公里一次、到4萬公里共8次3,460元，平均每次約433元；EZZY 500平均約385元；高值取 2020 年舊款發票的587元，因為耗材另計。', 'Gogoro Care price data: EZZY visits every 5,000 km cost NT$3,460 over eight visits to 40,000 km, about NT$433 each; EZZY 500 about NT$385; the high end uses an older 2020 invoice (NT$587) because consumables are extra.'),
      sources: ['gogoro-care-maintenance-prices', 'pixnet-2020-gogoro2-service'],
      confidence: 'verified',
      research: ['gogoro-official-r2#gogoro-maintenance-official-prices'],
    },
    ownerAverage: {
      value: 1947,
      sources: ['motc-2024-scooter-survey'],
      confidence: 'verified',
      research: ['running-costs#spend-electric-vs-gas', 'running-costs#maintenance-estimates'],
      note: t('交通部調查電動機車車主自報的平均每年保養維修費。', 'MOTC survey: electric owners\' reported average yearly maintenance and repair spend.'),
    },
  },
  {
    id: 'ev-generic',
    label: t('電動機車定期保養（其他品牌，以Gogoro舊款發票估計）', 'Scheduled maintenance, other electric scooters (estimated from older Gogoro invoices)'),
    kind: 'visits',
    intervalKm: 3000,
    minVisitsPerYear: 2,
    intervalBasis: {
      text: t('Gogoro官方：每3,000公里或6個月保養一次（輪轂馬達車款5,000公里），以先到者為準。', 'Gogoro: service every 3,000 km or 6 months, whichever comes first (5,000 km for hub-motor models).'),
      sources: ['gogoro-care-intervals'],
      confidence: 'verified',
      research: ['maintenance-fees#sched-gogoro-intervals'],
    },
    perVisit: {
      low: 427,
      typical: 507,
      high: 587,
      typicalBasis: t('2020 年Gogoro 2保養發票每次427至587元，取中間值；2026 年價格可能更高，視為下限參考。', 'Gogoro 2 service invoices from 2020 of NT$427–587 per visit; the middle value is the midpoint. 2026 prices are probably higher, so treat it as a floor.'),
      sources: ['pixnet-2020-gogoro2-service'],
      confidence: 'secondary',
      research: ['maintenance-fees#price-gogoro2-invoice', 'maintenance-fees#derived-gogoro-5k10k'],
      note: t('其他品牌沒有公開價格，也套用這組數字。', 'Other brands publish no prices, so the same figures are used.'),
    },
    ownerAverage: {
      value: 1947,
      sources: ['motc-2024-scooter-survey'],
      confidence: 'verified',
      research: ['running-costs#spend-electric-vs-gas', 'running-costs#maintenance-estimates'],
      note: t('交通部調查電動機車車主自報的平均每年保養維修費。', 'MOTC survey: electric owners\' reported average yearly maintenance and repair spend.'),
    },
  },
];

export const fees: FixedFees = {
  roadFeeGasoline: [
    {
      upToCc: 50,
      perYear: { value: 300, sources: ['businesstoday-2026-06-road-fee'], confidence: 'verified', research: ['maintenance-fees#fee-road-125'] },
    },
    {
      upToCc: 125,
      perYear: { value: 450, sources: ['moj-road-fee-regulation', 'businesstoday-2026-06-road-fee'], confidence: 'verified', research: ['gas-baseline-r2#r2-road-fee-official', 'maintenance-fees#fee-road-125'] },
    },
    {
      upToCc: 250,
      perYear: { value: 600, sources: ['businesstoday-2026-06-road-fee'], confidence: 'verified', research: ['maintenance-fees#fee-road-126-250'] },
    },
  ],
  roadFeeElectric: {
    value: 0,
    expectedFromYear: 2031,
    futureNote: t(
      '電動車現在不用繳燃料費（公路養管費）。交通部表示免繳延長到 2030 年底，之後才可能開始收，機車要收多少還沒有訂（法規條文只寫電動汽車，電動機車免繳是交通部的說法）。',
      'Electric vehicles pay no fuel-use fee (road maintenance fee) now. MOTC says the exemption runs to the end of 2030 and a fee could follow after that; no scooter rate has been set (the regulation names only electric cars; the scooter exemption rests on MOTC statements).',
    ),
    sources: ['udn-2026-road-fee-ev', 'businesstoday-2026-06-road-fee', 'moj-road-fee-regulation'],
    confidence: 'verified',
    research: ['outlook-2027-r2#s2-road-fee-ev', 'gas-baseline-r2#r2-road-fee-ev-exempt-text', 'maintenance-fees#fee-road-ev-exempt'],
  },
  licenceTax: {
    value: 0,
    sources: ['mof-licence-tax-act'],
    confidence: 'verified',
    research: ['central#licence-tax-schedules-zero', 'maintenance-fees#tax-license-gas', 'maintenance-fees#tax-license-ev-table'],
    note: t('150cc以下燃油機車與20.19馬力以下電動機車的使用牌照稅都是0元，電動車的免稅對125cc沒有省到錢。', 'Licence tax is zero for gasoline scooters of 150cc or less and for electric scooters up to 20.19 HP, so the electric exemption saves nothing against a 125cc.'),
  },
  compulsoryInsurance: {
    value: 658,
    sources: ['udn-2026-compulsory-insurance', 'money101-compulsory-insurance'],
    confidence: 'verified',
    research: ['gas-baseline-r2#r2-insurance-gas-2026'],
    note: t('重型機車一年約658元，2026 年 7 月起保費不變。電動機車的保費沒有官方說明，兩邊都以同一金額計入，所以不影響兩邊的差額。', 'About NT$658 a year for a heavy-class scooter, unchanged from July 2026. There is no official figure for electric scooters, so both sides are counted at the same amount and the difference is not affected.'),
  },
  inspection: {
    gasolineFromAgeYears: 5,
    fee: null,
    note: t('出廠滿5年的燃油機車每年須做排氣檢驗（逾期罰500元）；檢驗費100元由環境部空污基金支付，車主不用付錢。新車在五年試算期內不會用到。', 'Gasoline scooters 5+ years old need a yearly emission test (NT$500 fine if missed); the NT$100 fee is paid by MOENV\'s air-pollution fund, so owners pay nothing. A new scooter does not reach this within the five-year horizon.'),
    sources: ['moenv-motor-inspection', 'udn-2026-emission-test'],
    confidence: 'verified',
    research: ['gas-baseline-r2#r2-emis-fee-official', 'gas-baseline-r2#r2-emis-rules-official'],
  },
};

export const spendReference: SpendReference = {
  label: t('交通部 2024 年機車使用狀況調查：每輛機車每年變動支出', 'MOTC 2024 survey: yearly variable spend per scooter'),
  electric: 10506,
  gasolineHeavy: 8389,
  gasolineLight: 5585,
  all: 8610,
  breakdown: [
    { class: 'electric', energy: 7717, maintenance: 1947, parking: 842 },
    { class: 'gasoline-heavy', energy: 5502, maintenance: 2070, parking: 817 },
    { class: 'gasoline-light', energy: 3775, maintenance: 1311, parking: 499 },
  ],
  sources: ['motc-2024-scooter-survey'],
  confidence: 'verified',
  research: ['running-costs#spend-electric-vs-gas', 'running-costs#spend-all'],
  note: t('車主自報的平均值，混合了訂閱換電與插電車主、不同里程與城市，不是同條件的總持有成本比較。', 'Owner-reported averages that mix swap subscribers and plug-in owners, different mileages and cities; not a like-for-like total-cost comparison.'),
};
