// Running-cost inputs other than energy: maintenance (as ranges), fixed yearly fees, and the
// MOTC owner survey used as a reference point.
//
// Tyres and brake pads are left out of both sides: the research found no sourced difference
// between gasoline and electric, and prices are the same.

import { t } from '../types.ts';
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
      note: t('「照表保養」的估計，很多車主換機油的頻率較低；交通部調查普通重型燃油機車車主自報平均每年保養維修2,070元。', 'A "by the book" estimate; many riders change oil less often. In the MOTC survey, heavy-class gasoline owners report NT$2,070 a year on maintenance and repairs on average.'),
    },
  },
  {
    id: 'ev-gogoro-type',
    label: t('電動機車定期保養（以Gogoro為例）', 'Scheduled maintenance, electric scooter (Gogoro as the example)'),
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
      typicalBasis: t('2020年Gogoro 2保養發票每次427至587元，取中間值；2026年價格可能更高，視為下限參考。', 'Gogoro 2 service invoices from 2020 of NT$427–587 per visit; the middle value is the midpoint. 2026 prices are probably higher, so treat it as a floor.'),
      sources: ['pixnet-2020-gogoro2-service'],
      confidence: 'secondary',
      research: ['maintenance-fees#price-gogoro2-invoice', 'maintenance-fees#derived-gogoro-5k10k'],
      note: t('其他品牌沒有公開價格，也套用這組數字；交通部調查電動機車車主自報平均每年保養維修1,947元。', 'Other brands publish no prices, so the same figures are used; in the MOTC survey electric owners report NT$1,947 a year on maintenance and repairs on average.'),
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
      perYear: { value: 450, sources: ['businesstoday-2026-06-road-fee'], confidence: 'verified', research: ['maintenance-fees#fee-road-125', 'central#fuel-fee-gasoline-51-125'] },
    },
    {
      upToCc: 250,
      perYear: { value: 600, sources: ['businesstoday-2026-06-road-fee'], confidence: 'verified', research: ['maintenance-fees#fee-road-126-250'] },
    },
  ],
  roadFeeElectric: {
    value: 0,
    expectedFromYear: 2030,
    futureNote: t(
      '電動車目前免繳公路養管費；公路局長表示預計2030年起也要徵收，並比照燃油車排氣量級距設計（尚未立法）。',
      'Electric vehicles are exempt from the road maintenance fee for now; the Highway Bureau director expects a levy from 2030, banded like gasoline displacement (not yet law).',
    ),
    sources: ['businesstoday-2026-06-road-fee'],
    confidence: 'verified',
    research: ['maintenance-fees#fee-road-ev-exempt', 'central#fuel-fee-ev-exempt'],
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
    sources: ['money101-compulsory-insurance'],
    confidence: 'secondary',
    research: ['maintenance-fees#ins-cls-125', 'gas-prices#fee-compulsory-insurance'],
    note: t('強制險依車種等級收費，沒有找到電動機車的不同費率；兩邊以同一金額計入，不影響差額。', 'Compulsory insurance is priced by class and no separate electric rate was found; it is counted equally on both sides, so it does not change the difference.'),
  },
  inspection: {
    gasolineFromAgeYears: 5,
    fee: null,
    note: t('出廠滿5年的燃油機車每年須做排氣檢驗（逾期罰500元）；檢驗費未查證。新車在五年試算期內不會用到。', 'Gasoline scooters 5+ years old need a yearly emission test (NT$500 fine if missed); the test fee was not verified. A new scooter does not reach this within the five-year horizon.'),
    sources: ['udn-2026-emission-test'],
    confidence: 'verified',
    research: ['maintenance-fees#emis-who-fine', 'maintenance-fees#emis-fee'],
  },
};

export const spendReference: SpendReference = {
  label: t('交通部113年機車使用狀況調查：每輛機車每年變動支出', 'MOTC 2024 survey: yearly variable spend per scooter'),
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
