// New Taipei City 2026 (EPD plan id=1132). research/econ/new-taipei.json

import type { Programme } from '../types.ts';
import { age, builtBetween, builtBy, fixed, heavy, lightOrSmall, lowIncome, notPreviouslySubsidised, quota, residency, rocNational, scrap, scrapAge, t } from './helpers.ts';

const PAYER = t('新北市政府環境保護局', 'New Taipei City Environmental Protection Department');
const STATUS_2027 = t('截至2026年11月25日未公布116年計畫；金額每年不同。', 'No 2027 plan published as of 25 November 2026; amounts change every year.');
const APPLY = t('第一階段線上申請至115年12月31日，第二階段補件至116年1月10日；逾期不受理。', 'Stage 1 online by 31 December 2026, stage 2 documents by 10 January 2027; late applications are not accepted.');

const general = [residency(1), age(18), notPreviouslySubsidised, rocNational];
const GENERAL = '設籍新北市滿1年（以發票日為準）、年滿18歲的中華民國國民，向新北市登記的經銷商購車並在新北市領牌；曾受環保局補助者不得再申請，補助總額不超過購車金額。';
const GENERAL_EN =
  'An ROC national aged 18+ registered in New Taipei for at least a year at the invoice date, buying from a New Taipei-registered dealer and plating the scooter in New Taipei; anyone who has had a bureau subsidy before is excluded, and payouts never exceed the purchase price.';
const OLD = '舊車為新北市籍、民國104年12月31日以前出廠且滿10年的燃油機車，於補助年度內報廢並回收。';
const OLD_EN = 'The old scooter is a New Taipei-registered gasoline scooter built by 31 December 2015 and at least 10 years old, scrapped and recycled within the year.';
const oldScooter = [scrap, scrapAge(10), builtBy('2015-12-31'), { kind: 'scrap-registered-locally' as const }];

const newSlots = quota('limited', '2026-11-25', t('新購限額7,000名；首頁顯示剩餘6,604（標示為加碼剩餘名額，是否即基本名額未說明）。', '7,000 new-purchase places; the home page shows 6,604 left (labelled as add-on places; whether this is the base quota is not stated).'), {
  total: 7000,
  remaining: 6604,
  sources: ['ntpc-motor-home'],
});
const replaceSlots = quota('limited', '2026-11-25', t('換購限額8,000名；首頁各類別顯示剩餘3,358（標示為加碼剩餘名額）。', '8,000 replacement places; the home page shows 3,358 left per category (labelled as add-on places).'), {
  total: 8000,
  remaining: 3358,
  sources: ['ntpc-motor-home'],
});

const p = (x: Partial<Programme> & Pick<Programme, 'id' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'quota' | 'research'>): Programme => ({
  jurisdiction: 'new-taipei',
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
  sources: ['ntpc-motor-2026-plan', 'ntpc-motor-deadlines'],
  confidence: 'verified',
  calculator: true,
  ...x,
});

const replaceRow = (id: string, cls: 'heavy' | 'light', phase: [string, string], built: ReturnType<typeof builtBy>, value: number, research: string) =>
  p({
    id,
    name: t(`新北市淘汰${phase[0]}機車換購電動（${cls === 'heavy' ? '重型' : '輕（小）型'}）`, `New Taipei scrap ${phase[1]} scooter and buy electric (${cls === 'heavy' ? 'heavy' : 'light/small'})`),
    amount: fixed(value),
    conditions: [...general, cls === 'heavy' ? heavy : lightOrSmall, ...oldScooter, built],
    conditionText: t(`${GENERAL}${OLD}`, `${GENERAL_EN} ${OLD_EN}`),
    exclusiveGroups: ['ntpc-base'],
    quota: replaceSlots,
    research: [`new-taipei#${research}`, 'new-taipei#ntpc-old-scooter-age', 'new-taipei#ntpc-cap-purchase-price'],
  });

const P13: [string, string] = ['一至三期（92年12月31日前出廠）', 'phase 1–3 (built by 2003-12-31)'];
const P4: [string, string] = ['四期（93年1月1日至96年6月30日出廠）', 'phase 4 (built 2004-01-01 to 2007-06-30)'];
const P5: [string, string] = ['五期（96年7月1日至104年12月31日出廠）', 'phase 5 (built 2007-07-01 to 2015-12-31)'];

export const newTaipeiProgrammes: Programme[] = [
  p({
    id: 'ntpc-new-heavy',
    name: t('新北市新購電動機車（重型）', 'New Taipei new electric scooter (heavy)'),
    amount: fixed(4000),
    conditions: [...general, heavy],
    conditionText: t(GENERAL, GENERAL_EN),
    exclusiveGroups: ['ntpc-base'],
    quota: newSlots,
    research: ['new-taipei#ntpc-new-heavy-base', 'new-taipei#ntpc-eligibility'],
  }),
  p({
    id: 'ntpc-new-light',
    name: t('新北市新購電動機車（輕（小）型）', 'New Taipei new electric scooter (light/small)'),
    amount: fixed(2000),
    conditions: [...general, lightOrSmall],
    conditionText: t(GENERAL, GENERAL_EN),
    exclusiveGroups: ['ntpc-base'],
    quota: newSlots,
    research: ['new-taipei#ntpc-new-light-base', 'new-taipei#ntpc-eligibility'],
  }),
  replaceRow('ntpc-replace-p13-heavy', 'heavy', P13, builtBy('2003-12-31'), 10000, 'ntpc-replace-123-heavy-base'),
  replaceRow('ntpc-replace-p13-light', 'light', P13, builtBy('2003-12-31'), 6000, 'ntpc-replace-123-light-base'),
  replaceRow('ntpc-replace-p4-heavy', 'heavy', P4, builtBetween('2004-01-01', '2007-06-30'), 9000, 'ntpc-replace-4-heavy-base'),
  replaceRow('ntpc-replace-p4-light', 'light', P4, builtBetween('2004-01-01', '2007-06-30'), 5000, 'ntpc-replace-4-light-base'),
  replaceRow('ntpc-replace-p5-heavy', 'heavy', P5, builtBetween('2007-07-01', '2015-12-31'), 8000, 'ntpc-replace-5-heavy-base'),
  replaceRow('ntpc-replace-p5-light', 'light', P5, builtBetween('2007-07-01', '2015-12-31'), 4000, 'ntpc-replace-5-light-base'),
  p({
    id: 'ntpc-lowincome-topup',
    name: t('新北市中低收入戶加碼', 'New Taipei low-income top-up'),
    kind: 'top-up',
    amount: fixed(10000),
    conditions: [...general, lowIncome(['low', 'middle-low'])],
    conditionText: t('檢附區公所（中）低收入戶證明，發票日須在證明有效期間內；新購與換購都可加碼，不限名額。', 'With a district-office (middle-)low income certificate valid at the invoice date; for new purchase and replacement, no quota.'),
    exclusiveGroups: ['ntpc-lowincome-vs-addons'],
    quota: quota('unlimited', '2026-11-25', t('不限名額。', 'No quota.')),
    research: ['new-taipei#ntpc-new-heavy-lowincome', 'new-taipei#ntpc-replace-lowincome-topup'],
    note: t('計畫表列的是含基本補助的中低收入戶金額（例如新購重型14,000元），與一般金額相差10,000元，試算以加碼10,000元呈現。', 'The plan prints low-income amounts including the base (e.g. NT$14,000 for a new heavy scooter), NT$10,000 above the general rows; we show it as a NT$10,000 top-up.'),
  }),
  p({
    id: 'ntpc-earlybird-addon',
    name: t('新北市早鳥加碼', 'New Taipei early-bird add-on'),
    kind: 'top-up',
    amount: fixed(10000),
    conditions: [...general, ...oldScooter],
    conditionText: t('限換購電動機車，名額4,500名。', 'Replacement purchases only; 4,500 places.'),
    exclusiveGroups: ['ntpc-lowincome-vs-addons'],
    quota: quota('exhausted', '2026-10-29', t('2026年10月29日已全數額滿，僅能列入備取。', 'Fully subscribed on 29 October 2026; waiting list only.'), {
      total: 4500,
      remaining: 0,
      sources: ['ntpc-motor-earlybird-full', 'ntpc-motor-home'],
    }),
    sources: ['ntpc-motor-2026-plan', 'ntpc-motor-earlybird-full'],
    research: ['new-taipei#ntpc-earlybird-addon'],
  }),
  p({
    id: 'ntpc-double-scrap-addon',
    name: t('新北市雙汰舊加碼', 'New Taipei double-scrap add-on'),
    kind: 'top-up',
    amount: fixed(9000),
    conditions: [...general, ...oldScooter, { kind: 'scrap-second-scooter' }],
    conditionText: t('同一件換購申請再淘汰第二輛符合條件的新北市籍老舊機車；限量1,000名。', 'Scrap a second qualifying New Taipei-registered old scooter in the same replacement application; 1,000 places.'),
    exclusiveGroups: ['ntpc-lowincome-vs-addons'],
    quota: quota('nearly-exhausted', '2026-11-25', t('2026年11月25日首頁顯示剩餘187名（共1,000名）。', 'On 25 November 2026 the home page showed 187 of 1,000 places left.'), {
      total: 1000,
      remaining: 187,
      sources: ['ntpc-motor-home'],
    }),
    sources: ['ntpc-motor-2026-plan', 'ntpc-motor-home'],
    research: ['new-taipei#ntpc-double-scrap-addon', 'new-taipei#ntpc-quota-status'],
  }),
];
