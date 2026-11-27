// Counties with verified 2026 base amounts: Kinmen (own guidelines), Chiayi City, Chiayi County
// and Pingtung (MOEA portal county table). research/econ/counties-south-east-islands.json
// Lines that rest only on press releases (low-income, student households, Pingtung remote areas)
// are listed with `calculator: { excluded }` so a reader sees why they are not counted.

import type { Condition, Programme } from '../types.ts';
import { notSubsidisedInWindow, age, builtBetween, builtBy, fixed, flag, heavyOrLight, lowIncome, quota, residency, scrap, small, t } from './helpers.ts';

const MEID = ['meid-lev-subsidy-portal', 'meid-lev-2026-subsidy-table'] as const;
const ANNUAL_2027 = t('年度方案，未見 2027 年公告。', 'An annual programme; no 2027 announcement seen.');
const untilUsed = (asOf: string) => quota('unknown', asOf, t('依申請順序核定，經費用完為止；還剩多少沒有公布，申請前請先打電話問環保局。', 'Approved in order of application until the money runs out; what is left is not published, so phone the bureau before you apply.'));

// ---------------------------------------------------------------- Kinmen
const KINMEN = t('金門縣環境保護局', 'Kinmen County Environmental Protection Bureau');
// kinmen-swap-heavy: 歷年未受環境部與本縣環保局電動二輪車補助者; kinmen-stacking: 曾向環境部或本縣環保局
// 申請…相關補助者，不予補助. The assumption names MOENV as well as the county.
const KINMEN_NEVER = t('假設你從未申請過環境部或金門縣環保局的電動二輪車或汰舊換新補助', 'Assumes you have never applied for an MOENV or Kinmen EPB electric-scooter or scrap-and-replace subsidy');
const kinmenNotSubsidised: Condition = {
  kind: 'household',
  flag: 'previousLocalSubsidy',
  value: false,
  assumption: KINMEN_NEVER,
  why:t('金門縣不補助以前申請過環境部或金門縣環保局相關補助的人（新購和單純淘汰沒有例外）', 'Kinmen does not pay anyone who has applied before for a related MOENV or Kinmen EPB subsidy (no exception for new purchases or scrap-only)'),
};
// kinmen-stacking: …但若曾依本補助要點提出申請，且與前次申請日相距已逾5年者，仍得以淘汰老舊機車換購電動二輪車方式申請.
const kinmenSwapNotSubsidised: Condition = notSubsidisedInWindow(
  KINMEN_NEVER,
  t('金門縣不補助以前申請過相關補助的人，但有一個例外：以前是依金門這份補助要點申請、而且距離上次申請已超過5年，仍可以用「淘汰老舊機車換購」申請；請先打電話問環保局（082-336823）', 'Kinmen does not pay anyone who has applied before for a related subsidy, with one exception: if your earlier application was under these Kinmen guidelines and more than 5 years ago, you can still apply on the scrap-and-replace route; phone the bureau first (082-336823)'),
);
// kinmen-swap-heavy: 年滿18歲設籍金門(外籍須設籍滿1年). An ROC national passes on the first route;
// a foreign national needs a year's registration (assumed, and said, when the date is not given).
const kinmenResident: Condition = {
  kind: 'any-of',
  conditions: [{ kind: 'household', flag: 'foreignNational', value: false }, residency(1)],
};
const kinmenGeneral: Condition[] = [residency(), age(18), kinmenResident, kinmenNotSubsidised];
const kinmenSwapGeneral: Condition[] = [residency(), age(18), kinmenResident, kinmenSwapNotSubsidised];
const KG = '年滿18歲、設籍金門縣（外籍人士須設籍滿1年），新車經濟部認證並登記於金門縣；每人限1輛；曾向環境部或金門縣環保局申請相關補助者不予補助。';
const KG_SWAP = '例外：以前依這份金門要點申請、而且距離上次申請已超過5年的人，仍可以用淘汰老舊機車換購的方式申請。';
const KG_SWAP_EN = 'Exception: someone whose earlier application was under these Kinmen guidelines and more than 5 years ago may still apply on this scrap-and-replace route.';
const KG_EN = 'Aged 18+ and registered in Kinmen (foreign nationals for at least a year); the new scooter is MOEA-certified and registered in Kinmen; one per person; anyone who has applied to MOENV or the county for related subsidies is excluded.';
const KOLD = '要報廢的機車須是 2007 年（民國 96 年）6 月 30 日以前出廠、2024 年 12 月 31 日前設籍金門縣的燃油機車，於 2026 年 11 月 30 日前報廢回收。';
const KOLD_EN = 'The scooter you scrap must be a gasoline scooter built by 30 June 2007 and registered in Kinmen by 31 December 2024, scrapped and recycled by 30 November 2026.';
const kinmenApply = t('購車與報廢須在 2026 年 11 月 30 日前完成，2026 年 12 月 15 日前送件（以收件章戳為準），由經銷商彙整或親送。', 'Buy and scrap by 30 November 2026 and submit by 15 December 2026 (date stamp on receipt), through the dealer or in person.');
const kinmenBudget = (text: [string, string]) => quota('unknown', '2026-11-25', t(text[0], text[1]));

const kinmen = (x: Partial<Programme> & Pick<Programme, 'id' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'quota' | 'research'>): Programme => ({
  jurisdiction: 'kinmen',
  payer: 'local',
  payerName: KINMEN,
  kind: 'purchase-subsidy',
  side: 'electric',
  validFrom: '2026-01-01',
  validTo: '2026-11-30',
  validToRule: t('購車與要報廢機車的報廢回收都須在這天以前完成，2026 年 12 月 15 日前送件。', 'Buy, and scrap and recycle the scooter you scrap, by this date; submit by 15 December 2026.'),
  applicationDeadline: '2026-12-15',
  applicationNote: kinmenApply,
  status2027: ANNUAL_2027,
  sources: ['kinmen-epb-2026-guidelines'],
  confidence: 'verified',
  calculator: true,
  ...x,
});

// ---------------------------------------------------------------- Chiayi City / County, Pingtung
const table = (
  jurisdiction: Programme['jurisdiction'],
  payer: [string, string],
  id: string,
  name: [string, string],
  value: number,
  conds: Condition[],
  text: [string, string],
  research: string,
  extra: Partial<Programme> = {},
): Programme => ({
  id,
  jurisdiction,
  payer: 'local',
  payerName: t(payer[0], payer[1]),
  name: t(name[0], name[1]),
  kind: 'purchase-subsidy',
  side: 'electric',
  amount: fixed(value),
  conditions: conds,
  conditionText: t(text[0], text[1]),
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  quota: untilUsed('2026-10-07'),
  status2027: ANNUAL_2027,
  sources: [...MEID],
  confidence: 'verified',
  research: [`counties-south-east-islands#${research}`],
  note: t('金額取自經濟部產業發展署的縣市補助表；縣市環保局公告原文未能開啟。', 'Amount from the MOEA\'s county table; the county bureau\'s own notice could not be opened.'),
  calculator: true,
  ...extra,
});

const CYC: [string, string] = ['嘉義市政府環境保護局', 'Chiayi City Environmental Protection Bureau'];
const CYCO: [string, string] = ['嘉義縣環境保護局', 'Chiayi County Environmental Protection Bureau'];
const PT: [string, string] = ['屏東縣政府環境保護局', 'Pingtung County Environmental Protection Bureau'];

export const countyProgrammes: Programme[] = [
  // Kinmen
  kinmen({
    id: 'kinmen-swap',
    name: t('金門縣淘汰老舊機車換購電動機車', 'Kinmen: scrap a qualifying scooter and buy electric'),
    amount: fixed(20000),
    conditions: [...kinmenSwapGeneral, heavyOrLight, scrap, builtBy('2007-06-30'), { kind: 'scrap-registered-locally', byDate: '2024-12-31' }],
    conditionText: t(`${KG}${KG_SWAP}${KOLD}重型、輕型同為20,000元。`, `${KG_EN} ${KG_SWAP_EN} ${KOLD_EN} NT$20,000 for heavy and light alike.`),
    exclusiveGroups: ['kinmen-base', 'kinmen-vs-moenv'],
    quota: kinmenBudget(['換購預算320萬元（約160輛）；還剩多少沒有公布，請打 082-336823 問環保局。', 'Replacement budget NT$3.2 million (about 160 scooters); what is left is not published, so phone the bureau on 082-336823.']),
    research: ['counties-south-east-islands#kinmen-swap-heavy', 'counties-south-east-islands#kinmen-swap-light', 'counties-south-east-islands#kinmen-deadline-quota'],
  }),
  kinmen({
    id: 'kinmen-new',
    name: t('金門縣新購電動機車', 'Kinmen new electric scooter'),
    amount: fixed(10000),
    conditions: [...kinmenGeneral, heavyOrLight],
    conditionText: t(`${KG}重型、輕型同為10,000元。`, `${KG_EN} NT$10,000 for heavy and light alike.`),
    exclusiveGroups: ['kinmen-base', 'kinmen-vs-moenv'],
    quota: kinmenBudget(['新購與單純淘汰共用90萬元預算；還剩多少沒有公布，請打 082-336823 問環保局。', 'New purchases and scrap-only share a NT$900,000 budget; what is left is not published, so phone the bureau on 082-336823.']),
    research: ['counties-south-east-islands#kinmen-new-heavy', 'counties-south-east-islands#kinmen-new-light', 'counties-south-east-islands#kinmen-deadline-quota'],
  }),
  kinmen({
    id: 'kinmen-small',
    name: t('金門縣補助（小型輕型）', 'Kinmen subsidy (small-light)'),
    amount: fixed(0),
    conditions: [...kinmenGeneral, small],
    conditionText: t(KG, KG_EN),
    exclusiveGroups: ['kinmen-base'],
    quota: kinmenBudget(['同上。', 'As above.']),
    research: ['counties-south-east-islands#kinmen-swap-light'],
    calculator: { excluded: t('附表一只列重型與輕型，小型輕型未列金額。', 'Schedule 1 lists heavy and light only; no amount for small-light.'), reason: 'not-published' },
  }),
  {
    ...kinmen({
      id: 'kinmen-scrap-only',
      name: t('金門縣單純淘汰老舊機車', 'Kinmen: scrap a qualifying scooter only (no electric purchase)'),
      kind: 'scrap-only-bonus',
      amount: fixed(1000),
      conditions: [...kinmenGeneral, scrap, builtBy('2007-06-30'), { kind: 'scrap-registered-locally', byDate: '2024-12-31' }],
      conditionText: t(`${KOLD}直接向環保局申請。`, `${KOLD_EN} Apply directly to the bureau.`),
      exclusiveGroups: ['kinmen-vs-moenv'],
      quota: kinmenBudget(['與新購共用90萬元預算。', 'Shares the NT$900,000 budget with new purchases.']),
      research: ['counties-south-east-islands#kinmen-scrap-only'],
    }),
    side: 'gasoline',
  },

  // Chiayi City
  table('chiayi-city', CYC, 'chiayi-city-swap', ['嘉義市汰舊換購電動機車', 'Chiayi City scrap-and-replace'], 12000, [residency(), scrap, builtBy('2015-12-31')], ['要報廢的機車須是 2015 年（民國 104 年）12 月 31 日以前出廠的燃油機車；各車種同一金額；依申請順序核定，用罄為止。', 'The scooter you scrap must be a gasoline scooter built by 31 December 2015; one amount for all classes; approved in order until the money runs out.'], 'chiayi-city-swap', { exclusiveGroups: ['chiayi-city-base'] }),
  table('chiayi-city', CYC, 'chiayi-city-new', ['嘉義市新購電動機車', 'Chiayi City new electric scooter'], 8000, [residency()], ['設籍嘉義市；依申請順序核定，用罄為止。', 'Registered in Chiayi City; approved in order until the money runs out.'], 'chiayi-city-new', { exclusiveGroups: ['chiayi-city-base'] }),
  table('chiayi-city', CYC, 'chiayi-city-lowincome', ['嘉義市中低收入戶加碼', 'Chiayi City low-income top-up'], 0, [residency(), lowIncome(['low', 'middle-low'])], ['中低收入戶。', 'Low or lower-middle-income households.'], 'chiayi-city-press-swap-total', {
    kind: 'top-up',
    sources: ['chiayi-city-2026-press'],
    confidence: 'secondary',
    calculator: { excluded: t('只見於新聞稿的合計金額（換購最高37,300元、新購27,000元），加碼本身的金額與條件未公布。', 'Only press-release totals exist (up to NT$37,300 for replacement, NT$27,000 new); the top-up amount and conditions are not published.'), reason: 'secondary-only' },
  }),
  table('chiayi-city', CYC, 'chiayi-city-student', ['嘉義市低碳上學嘉市GO（學生家庭）', 'Chiayi City student-household scheme'], 0, [residency(), flag('schoolChild')], ['學生家庭。', 'Student households.'], 'chiayi-city-student', {
    kind: 'top-up',
    sources: ['chiayi-city-2026-press'],
    confidence: 'secondary',
    calculator: { excluded: t('新聞稿只給合計金額，「學生家庭」的定義與文件未能取得。', 'The press release gives only totals; the definition of a student household could not be found.'), reason: 'secondary-only' },
  }),
  {
    ...table('chiayi-city', CYC, 'chiayi-city-scrap-only', ['嘉義市單純淘汰老舊機車', 'Chiayi City: scrap a qualifying scooter only (no electric purchase)'], 1500, [residency(), scrap, builtBy('2015-12-31')], ['要報廢的機車須是 2015 年（民國 104 年）12 月 31 日以前出廠的燃油機車。', 'The scooter you scrap must be a gasoline scooter built by 31 December 2015.'], 'chiayi-city-scrap'),
    kind: 'scrap-only-bonus',
    side: 'gasoline',
  },

  // Chiayi County
  table('chiayi-county', CYCO, 'chiayi-county-swap', ['嘉義縣汰舊換購電動機車', 'Chiayi County scrap-and-replace'], 14000, [residency(), scrap, builtBy('2015-12-31'), { kind: 'scrap-registered-locally', byDate: '2025-12-31' }], ['要報廢的機車須是 2015 年（民國 104 年）12 月 31 日以前出廠、2025 年 12 月 31 日前設籍嘉義縣的燃油機車；新車戶籍與車籍都在嘉義縣；受理至 2027 年 1 月 8 日。', 'The scooter you scrap must be a gasoline scooter built by 31 December 2015 and registered in Chiayi County by 31 December 2025; household and new vehicle registered in the county; claims until 8 January 2027.'], 'chiayi-county-swap', {
    exclusiveGroups: ['chiayi-county-base'],
    applicationDeadline: '2027-01-08',
  }),
  table('chiayi-county', CYCO, 'chiayi-county-new', ['嘉義縣新購電動機車', 'Chiayi County new electric scooter'], 8000, [residency()], ['戶籍與車籍都在嘉義縣；受理至 2027 年 1 月 8 日。', 'Household and vehicle registered in Chiayi County; claims until 8 January 2027.'], 'chiayi-county-new', {
    exclusiveGroups: ['chiayi-county-base'],
    applicationDeadline: '2027-01-08',
  }),
  {
    ...table('chiayi-county', CYCO, 'chiayi-county-scrap-only-pre2004', ['嘉義縣單純淘汰老舊機車（2003 年底前出廠）', 'Chiayi County scrap only (built by 2003)'], 5000, [residency(), scrap, builtBy('2003-12-31')], ['要報廢的機車須是 2003 年（民國 92 年）12 月 31 日以前出廠。', 'The scooter you scrap must have been built by 31 December 2003.'], 'chiayi-county-scrap'),
    kind: 'scrap-only-bonus',
    side: 'gasoline',
    exclusiveGroups: ['county-scrap-only'],
  },
  {
    ...table('chiayi-county', CYCO, 'chiayi-county-scrap-only-2004-2015', ['嘉義縣單純淘汰老舊機車（2004 至 2015 年出廠）', 'Chiayi County scrap only (built 2004–2015)'], 2000, [residency(), scrap, builtBetween('2004-01-01', '2015-12-31')], ['要報廢的機車須是 2004 年（民國 93 年）1 月 1 日至 2015 年（民國 104 年）12 月 31 日出廠。', 'The scooter you scrap must have been built between 1 January 2004 and 31 December 2015.'], 'chiayi-county-scrap'),
    kind: 'scrap-only-bonus',
    side: 'gasoline',
    exclusiveGroups: ['county-scrap-only'],
  },

  // Pingtung
  table('pingtung', PT, 'pingtung-swap', ['屏東縣汰舊換購電動機車', 'Pingtung scrap-and-replace'], 6000, [residency(), scrap, builtBy('2007-06-30')], ['要報廢的機車須是 2007 年（民國 96 年）6 月 30 日以前出廠的燃油機車。', 'The scooter you scrap must be a gasoline scooter built by 30 June 2007.'], 'pingtung-swap', { exclusiveGroups: ['pingtung-base'] }),
  table('pingtung', PT, 'pingtung-new', ['屏東縣新購電動機車', 'Pingtung new electric scooter'], 3000, [residency()], ['設籍屏東縣。', 'Registered in Pingtung.'], 'pingtung-new', {
    exclusiveGroups: ['pingtung-base'],
    sources: [...MEID, 'nownews-2026-subsidy-roundup'],
    note: t('經濟部縣市補助表列3,000元，NOWnews引述縣府圖卡為4,000元；計算採較低的官方表列金額，請向環保局（08-7352068）確認。', 'The MOEA county table says NT$3,000; NOWnews, quoting a county graphic, says NT$4,000. We use the lower official figure; confirm with the bureau (08-7352068).'),
  }),
  table('pingtung', PT, 'pingtung-remote', ['屏東縣偏鄉地區換購加碼', 'Pingtung remote-area replacement'], 0, [residency(), scrap, flag('remoteDistrict')], ['偏鄉地區換購最高15,000元。', 'Up to NT$15,000 for replacement in remote areas.'], 'pingtung-remote', {
    exclusiveGroups: ['pingtung-base'],
    sources: ['nownews-2026-subsidy-roundup'],
    confidence: 'secondary',
    calculator: { excluded: t('只見於媒體引述的縣府圖卡；我們找不到哪些鄉鎮算偏鄉、要準備哪些文件，所以沒辦法算。住在偏遠鄉鎮的人，請打 08-7352068 問。', 'Seen only in a media report of a county graphic; we could not find which townships count as remote or which papers are needed, so it cannot be worked out here. If you live in a remote township, phone 08-7352068.'), reason: 'secondary-only' },
  }),
  {
    ...table('pingtung', PT, 'pingtung-scrap-only', ['屏東縣單純淘汰老舊機車', 'Pingtung: scrap a qualifying scooter only (no electric purchase)'], 1500, [residency(), scrap, builtBy('2007-06-30')], ['要報廢的機車須是 2007 年（民國 96 年）6 月 30 日以前出廠的1至4期燃油機車。', 'The scooter you scrap must be a phase 1–4 gasoline scooter built by 30 June 2007.'], 'pingtung-scrap', {
      note: t(
        '經濟部縣市補助表列1,500元，ETtoday引述縣府為最高2,300元，差額800元原因不明；計算採較低的官方表列金額，請向環保局（08-7352068）確認。',
        'The MOEA county table says NT$1,500; ETtoday, quoting the county, says up to NT$2,300, and the NT$800 gap is unexplained. We use the lower official figure; confirm with the bureau (08-7352068).',
      ),
    }),
    kind: 'scrap-only-bonus',
    side: 'gasoline',
  },
];
