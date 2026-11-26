// Kaohsiung City 2026 (notice 2026-03-30). research/econ/kaohsiung.json
// The whole NT$80 million budget was used up on 2026-08-11: every line carries an 'exhausted'
// quota, so the engine excludes them for purchases on or after that date and says why.

import type { Condition, Programme } from '../types.ts';
import { age, fixed, flag, heavy, lightOrSmall, lowIncome, notPreviouslySubsidised, quota, residency, scrap, scrapAge, t, twoStroke } from './helpers.ts';

const PAYER = t('高雄市政府環境保護局', 'Kaohsiung City Environmental Protection Bureau');
const SRC = ['kaohsiung-epb-2026-programme', 'kaohsiung-epb-2026-budget-status'] as const;
const STATUS_2027 = t('截至2026年11月25日未見116年方案。', 'No 2027 programme found as of 25 November 2026.');
const APPLY = t('補助期間至115年12月31日，申請至116年1月10日；超過預算的申請以公開抽籤決定，未中籤者不予補助。', 'Purchases to 31 December 2026, applications to 10 January 2027; applications beyond the budget are drawn by public lottery and those not drawn get nothing.');
const exhausted = quota('exhausted', '2026-08-11', t('環保局網頁顯示補助金額已於2026年8月11日用罄，剩餘0元（申請總額約8,139萬元，預算8,000萬元）。', 'The bureau\'s page shows the money ran out on 11 August 2026 with NT$0 left (about NT$81.4 million applied for against NT$80 million).'), {
  total: 80000000,
  remaining: 0,
  sources: ['kaohsiung-epb-2026-budget-status'],
});

const general: Condition[] = [residency(), age(18), notPreviouslySubsidised];
const GENERAL = '年滿18歲、申請時設籍高雄市；新車115年1月1日後在高雄市領牌，1年內（領加碼者3年）不得過戶或遷出；115年1月1日前申請過環保局相關補助者不適用。';
const GENERAL_EN = 'Aged 18+ and registered in Kaohsiung when applying; the new scooter is plated in Kaohsiung after 1 January 2026 and may not be transferred or moved out for 1 year (3 years with a top-up); anyone who applied for a bureau scooter subsidy before 2026 is excluded.';
const OLD = '舊車為出廠滿10年以上的燃油機車，設籍高雄市連續1年以上，115年內報廢回收。';
const OLD_EN = 'The old scooter is a gasoline scooter at least 10 years old, registered in Kaohsiung for at least a year, scrapped and recycled in 2026.';
const oldScooter: Condition[] = [scrap, scrapAge(10), { kind: 'scrap-registered-locally', minYears: 1 }];
const PROJECT = '青年、醫護、家長專案僅可擇一，須同時符合汰舊換購或新購資格。';
const PROJECT_EN = 'Only one of the youth, medical-staff and parent schemes; you must also qualify for a replacement or new-purchase subsidy.';

const p = (x: Partial<Programme> & Pick<Programme, 'id' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'research'>): Programme => ({
  jurisdiction: 'kaohsiung',
  payer: 'local',
  payerName: PAYER,
  kind: 'purchase-subsidy',
  side: 'electric',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  applicationDeadline: '2027-01-10',
  applicationNote: APPLY,
  status2027: STATUS_2027,
  quota: exhausted,
  sources: [...SRC],
  confidence: 'verified',
  note: t('高雄市公告沒有說明能否與中央補助併領。', 'The Kaohsiung notice does not say whether its money stacks with central subsidies.'),
  calculator: true,
  ...x,
});

const base = (id: string, scrapRow: boolean, low: boolean, cls: 'heavy' | 'light', value: number, research: string) =>
  p({
    id,
    name: t(
      `高雄市${scrapRow ? '汰舊換購' : '新購'}電動機車（${cls === 'heavy' ? '重型' : '輕型／小型'}${low ? '，低收入戶' : ''}）`,
      `Kaohsiung ${scrapRow ? 'scrap-and-replace' : 'new purchase'} (${cls === 'heavy' ? 'heavy' : 'light/small'}${low ? ', low income' : ''})`,
    ),
    amount: fixed(value),
    conditions: [...general, cls === 'heavy' ? heavy : lightOrSmall, ...(scrapRow ? oldScooter : []), ...(low ? [lowIncome(['low'])] : [])],
    conditionText: t(`${GENERAL}${scrapRow ? OLD : ''}${low ? '檢附區公所低收入戶證明（中低收入戶不適用）。' : ''}`, [GENERAL_EN, scrapRow ? OLD_EN : '', low ? 'With a district-office low-income certificate (middle-low income does not qualify).' : ''].filter(Boolean).join(' ')),
    exclusiveGroups: scrapRow ? ['khh-base', 'khh-old-scooter-use'] : ['khh-base'],
    research: [`kaohsiung#${research}`, 'kaohsiung#khh-budget-exhausted'],
  });

const project = (id: string, cls: 'heavy' | 'light', name: [string, string], conds: Condition[], text: [string, string], research: string) =>
  p({
    id,
    name: t(`${name[0]}（${cls === 'heavy' ? '重型' : '輕型／小型'}）`, `${name[1]} (${cls === 'heavy' ? 'heavy' : 'light/small'})`),
    kind: 'top-up',
    amount: fixed(cls === 'heavy' ? 20000 : 10000),
    conditions: [...general, cls === 'heavy' ? heavy : lightOrSmall, ...conds],
    conditionText: t(`${PROJECT}${text[0]}`, `${PROJECT_EN} ${text[1]}`),
    exclusiveGroups: ['khh-project'],
    research: [`kaohsiung#${research}`, 'kaohsiung#khh-budget-exhausted'],
  });

export const kaohsiungProgrammes: Programme[] = [
  base('khh-scrap-heavy', true, false, 'heavy', 7000, 'khh-scrap-replace-heavy-general'),
  base('khh-scrap-light', true, false, 'light', 5000, 'khh-scrap-replace-light-general'),
  base('khh-scrap-heavy-low', true, true, 'heavy', 12000, 'khh-scrap-replace-heavy-lowincome'),
  base('khh-scrap-light-low', true, true, 'light', 8000, 'khh-scrap-replace-light-lowincome'),
  base('khh-new-heavy', false, false, 'heavy', 4000, 'khh-newbuy-heavy-general'),
  base('khh-new-light', false, false, 'light', 2000, 'khh-newbuy-light-general'),
  base('khh-new-heavy-low', false, true, 'heavy', 10000, 'khh-newbuy-heavy-lowincome'),
  base('khh-new-light-low', false, true, 'light', 4000, 'khh-newbuy-light-lowincome'),
  project('khh-youth-heavy', 'heavy', ['高雄市青年專案（18至30歲）', 'Kaohsiung youth scheme (age 18–30)'], [age(18, 30)], ['申請人18至30歲。', 'Applicant aged 18–30.'], 'khh-topup-youth-heavy'),
  project('khh-youth-light', 'light', ['高雄市青年專案（18至30歲）', 'Kaohsiung youth scheme (age 18–30)'], [age(18, 30)], ['申請人18至30歲。', 'Applicant aged 18–30.'], 'khh-topup-youth-light'),
  project('khh-medical-heavy', 'heavy', ['高雄市醫護專案', 'Kaohsiung medical-staff scheme'], [flag('medicalWorker')], ['任職於高雄市立案醫療或護理機構，檢附在職證明。', 'Works at a registered medical or nursing institution in Kaohsiung, with an employment certificate.'], 'khh-topup-medical-heavy'),
  project('khh-medical-light', 'light', ['高雄市醫護專案', 'Kaohsiung medical-staff scheme'], [flag('medicalWorker')], ['任職於高雄市立案醫療或護理機構，檢附在職證明。', 'Works at a registered medical or nursing institution in Kaohsiung, with an employment certificate.'], 'khh-topup-medical-light'),
  project('khh-parent-heavy', 'heavy', ['高雄市家長專案', 'Kaohsiung parent scheme'], [flag('schoolChild')], ['子女就讀高雄市國小、國中、高中職（含五專前三年），檢附在學證明。', 'A child enrolled in a Kaohsiung elementary, junior or senior high school (including the first three years of a five-year college), with proof.'], 'khh-topup-parent-heavy'),
  project('khh-parent-light', 'light', ['高雄市家長專案', 'Kaohsiung parent scheme'], [flag('schoolChild')], ['子女就讀高雄市國小、國中、高中職（含五專前三年），檢附在學證明。', 'A child enrolled in a Kaohsiung elementary, junior or senior high school (including the first three years of a five-year college), with proof.'], 'khh-topup-parent-light'),
  p({
    id: 'khh-battery-rental',
    name: t('高雄市月租費補助專案', 'Kaohsiung battery-rental top-up'),
    kind: 'battery-credit',
    amount: { kind: 'per-battery', single: 3600, double: 7200 },
    conditions: [...general, { kind: 'battery-swap' }],
    conditionText: t('使用租賃電池的車款，單顆電池3,600元、雙顆7,200元，一次給付；可與青年、醫護、家長專案併領。', 'Swap-battery models: NT$3,600 for one battery, NT$7,200 for two, paid once; stacks with the youth, medical and parent schemes.'),
    research: ['kaohsiung#khh-topup-rental-single', 'kaohsiung#khh-topup-rental-double'],
  }),
  {
    ...p({
      id: 'khh-scrap-only-two-stroke',
      name: t('高雄市純淘汰二行程機車', 'Kaohsiung scrap a two-stroke (no electric purchase)'),
      kind: 'scrap-only-bonus',
      amount: fixed(1000),
      conditions: [...general, scrap, twoStroke, { kind: 'scrap-registered-locally', minYears: 1 }],
      conditionText: t('只限二行程機車；同一輛舊車只能申請純淘汰或汰舊換購擇一。', 'Two-strokes only; one old scooter can claim either scrap-only or scrap-and-replace.'),
      exclusiveGroups: ['khh-old-scooter-use'],
      research: ['kaohsiung#khh-scrap-two-stroke-general', 'kaohsiung#khh-budget-exhausted'],
    }),
    side: 'gasoline',
  },
  {
    // The same scrap-only payment at the low-income rate; one old scooter claims one of the two
    // (both are in khh-old-scooter-use), so a low-income owner gets 2,000, not 3,000.
    ...p({
      id: 'khh-scrap-only-two-stroke-low',
      name: t('高雄市純淘汰二行程機車（低收入戶）', 'Kaohsiung scrap a two-stroke, low income (no electric purchase)'),
      kind: 'scrap-only-bonus',
      amount: fixed(2000),
      conditions: [...general, scrap, twoStroke, { kind: 'scrap-registered-locally', minYears: 1 }, lowIncome(['low'])],
      conditionText: t(
        '只限二行程機車，檢附區公所低收入戶證明（中低收入戶不適用）；同一輛舊車只能申請純淘汰或汰舊換購擇一。',
        'Two-strokes only, with a district-office low-income certificate (middle-low income does not qualify); one old scooter can claim either scrap-only or scrap-and-replace.',
      ),
      exclusiveGroups: ['khh-old-scooter-use'],
      research: ['kaohsiung#khh-scrap-two-stroke-lowincome', 'kaohsiung#khh-budget-exhausted'],
    }),
    side: 'gasoline',
  },
];
