// Counties verified in the second research round (research/econ/counties-north-central-r2.json):
// Keelung, Hsinchu City, Hsinchu County, Miaoli, Changhua, Nantou, Yunlin, Yilan.
// Amounts are COUNTY money only (central money is added separately by the engine). Most come
// from the MOEA county table (updated 2026-07-21); Yunlin and Yilan also from their own pages.
// Per-year places are small and remaining places were not checked, so every quota is 'unknown'
// or 'limited' with the published total. Several of these findings carry the verdict REFUTED
// because they refute a first-round "no programme found"; scripts/check-data.mjs allow-lists them.

import type { Condition, Programme } from '../types.ts';
import { notSubsidisedBefore, age, builtBy, fixed, flag, heavy, lightOrSmall, lowIncome, notPreviouslySubsidised, quota, residency, rocNational, scrap, scrapAge, t, twoStroke } from './helpers.ts';

const MEID = ['meid-lev-2026-subsidy-table'] as const;
const NONE_2027 = t('未見116年方案。', 'No 2027 programme seen.');
const slots = (total: number, asOf = '2026-07-21') =>
  quota('limited', asOf, t(`官方表列每年${total.toLocaleString('en')}輛，剩餘名額未查證，可能已用完。`, `The official table lists ${total.toLocaleString('en')} places a year; remaining places were not checked and may be gone.`), { total });
const unknownQuota = quota('unknown', '2026-07-21', t('名額與剩餘額度未公布。', 'Quota and remaining funds not published.'));

type Base = Partial<Programme> & Pick<Programme, 'id' | 'jurisdiction' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'research' | 'payerName'>;
const p = (x: Base): Programme => ({
  payer: 'local',
  kind: 'purchase-subsidy',
  side: 'electric',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  quota: unknownQuota,
  status2027: NONE_2027,
  sources: [...MEID],
  confidence: 'verified',
  calculator: true,
  ...x,
});
const r = (id: string) => `counties-north-central-r2#${id}`;

// ---------------------------------------------------------------- Keelung (to 2026-11-30)
const KL = t('基隆市環境保護局', 'Keelung City Environmental Protection Bureau');
const klGeneral: Condition[] = [residency(), rocNational];
const klOld: Condition[] = [scrap, builtBy('2007-06-30')];
const KL_TEXT = '設籍基隆市（外籍人士不適用）；補助期間至115年11月30日，名額很少。';
const KL_TEXT_EN = 'Registered in Keelung (foreign nationals excluded); runs to 30 November 2026 with very few places.';
const kl = (id: string, name: [string, string], value: number, conds: Condition[], total: number, research: string, old = true): Programme =>
  p({
    id,
    jurisdiction: 'keelung',
    payerName: KL,
    name: t(name[0], name[1]),
    amount: fixed(value),
    conditions: [...klGeneral, ...(old ? klOld : []), ...conds],
    conditionText: t(`${KL_TEXT}${old ? '舊車為96年6月30日以前出廠。' : ''}`, `${KL_TEXT_EN}${old ? ' The old scooter was built by 30 June 2007.' : ''}`),
    validTo: '2026-11-30',
    quota: slots(total),
    exclusiveGroups: ['keelung-base'],
    research: [r(research)],
  });

// ---------------------------------------------------------------- Hsinchu City (scrap-and-replace only)
const HC = t('新竹市環境保護局', 'Hsinchu City Environmental Protection Bureau');
const hcGeneral: Condition[] = [residency(undefined, '2025-12-31')];
const HC_TEXT = '114年底前設籍新竹市；金額含購車補助與2,000元電池資費補助（市府部分，中央補助另計）；每年名額只有數十至一百多名，可能已用完。';
const HC_TEXT_EN = 'Registered in Hsinchu City by the end of 2025; the amount combines the purchase subsidy and NT$2,000 battery-fee money (city part only; central money is separate); only a few dozen to about 150 places a year, which may be gone.';
const hc = (id: string, name: [string, string], value: number, conds: Condition[], total: number, research: string, oldText: [string, string]): Programme =>
  p({
    id,
    jurisdiction: 'hsinchu-city',
    payerName: HC,
    name: t(name[0], name[1]),
    amount: fixed(value),
    conditions: [...hcGeneral, scrap, ...conds],
    conditionText: t(`${HC_TEXT}${oldText[0]}`, `${HC_TEXT_EN} ${oldText[1]}`),
    quota: slots(total),
    exclusiveGroups: ['hsinchu-city-base'],
    sources: [...MEID, 'hsinchu-city-2026-press'],
    research: [r(research)],
  });
const OLD25: [string, string] = ['舊車為二行程機車或民國89年底以前出廠的四行程機車。', 'The old scooter is a two-stroke or a four-stroke built by the end of 2000.'];
const ANYAGE: [string, string] = ['舊車為四行程機車（不限車齡）。', 'The old scooter is a four-stroke of any age.'];
const old25: Condition = { kind: 'any-of', conditions: [twoStroke, builtBy('2000-12-31')] };
const fourStroke: Condition = { kind: 'scrap-engine', engines: ['four-stroke'] };

// ---------------------------------------------------------------- Hsinchu County
const HCC = t('新竹縣政府環境保護局', 'Hsinchu County Environmental Protection Bureau');

// ---------------------------------------------------------------- Changhua, Nantou, Miaoli, Yunlin, Yilan
const CH = t('彰化縣環境保護局', 'Changhua County Environmental Protection Bureau');
const NT = t('南投縣政府環境保護局', 'Nantou County Environmental Protection Bureau');
const ML = t('苗栗縣政府環境保護局', 'Miaoli County Environmental Protection Bureau');
const YL = t('雲林縣環境保護局', 'Yunlin County Environmental Protection Bureau');
const IL = t('宜蘭縣政府環境保護局', 'Yilan County Environmental Protection Bureau');

const ylGeneral: Condition[] = [residency(), notPreviouslySubsidised];
const YL_TEXT = '設籍雲林縣，過去3年未領過同類縣府補助；車籍遷出或過戶會被追回；各項目額滿即止。';
const YL_TEXT_EN = 'Registered in Yunlin with no county subsidy of this type in the past 3 years; moving the registration out or transferring the scooter means repayment; each item closes when full.';
const YL_2027 = t('115至117年計畫一併公告、金額逐年下降，116年金額未見。', 'The 2026–2028 plan was announced together with amounts falling each year; 2027 figures not seen.');

// yilan-swap-general-heavy-v3: none if received 環境部/county subsidy in 2023-2025.
const ilNotSubsidised: Condition = notSubsidisedBefore(t('假設你2023至2025年沒有領過環境部或宜蘭縣的機車補助', 'Assumes you received no MOENV or Yilan County scooter subsidy in 2023–2025'));
const ilGeneral: Condition[] = [residency(), age(18), ilNotSubsidised];
const IL_TEXT = '年滿18歲、設籍宜蘭縣，車款在經濟部認可名單；2023至2025年領過環境部或縣府補助者不適用；1年內不得過戶；預算用罄即止，116年1月10日前送達環保局。';
const IL_TEXT_EN = 'Aged 18+, registered in Yilan, an MOEA-listed model; anyone who received an MOENV or county subsidy in 2023–2025 is excluded; no transfer for a year; closes when the budget runs out; applications must reach the bureau by 10 January 2027.';
const IL_OLD = '舊車為103年底以前出廠、114年底前設籍宜蘭縣並持有的燃油機車。';
const IL_OLD_EN = 'The old scooter is a gasoline scooter built by the end of 2014, registered in Yilan and held by the end of 2025.';
const ilOld: Condition[] = [scrap, builtBy('2014-12-31'), { kind: 'scrap-registered-locally', byDate: '2025-12-31' }];
const ilPriority: Condition = { kind: 'any-of', conditions: [lowIncome(['low', 'middle-low']), flag('indigenous')] };
const ilBudget = quota('unknown', '2026-11-25', t('總預算1,000萬元（一般750萬元、專案100萬元、純淘汰150萬元），用罄即止；剩餘額度未查證。', 'Total budget NT$10 million (general 7.5m, special projects 1m, scrap-only 1.5m), closing when used up; remaining funds not checked.'));
const il = (id: string, name: [string, string], value: number, conds: Condition[], text: [string, string], research: string): Programme =>
  p({
    id,
    jurisdiction: 'yilan',
    payerName: IL,
    name: t(name[0], name[1]),
    amount: fixed(value),
    conditions: [...ilGeneral, ...conds],
    conditionText: t(`${IL_TEXT}${text[0]}`, `${IL_TEXT_EN} ${text[1]}`),
    applicationDeadline: '2027-01-10',
    quota: ilBudget,
    exclusiveGroups: ['yilan-base'],
    sources: ['yilan-epb-2026-plan'],
    research: [r(research)],
  });

export const countyR2Programmes: Programme[] = [
  // Keelung
  kl('keelung-swap-two-stroke-heavy', ['基隆市淘汰二行程換購電動（重型）', 'Keelung scrap a two-stroke for electric (heavy)'], 12000, [twoStroke, heavy], 6, 'keelung-swap-2stroke-heavy-v3'),
  kl('keelung-swap-two-stroke-light', ['基隆市淘汰二行程換購電動（輕型／小型）', 'Keelung scrap a two-stroke for electric (light/small)'], 4000, [twoStroke, lightOrSmall], 3, 'keelung-swap-2stroke-light-v3'),
  kl('keelung-swap-four-stroke-heavy', ['基隆市淘汰四行程換購電動（重型）', 'Keelung scrap a four-stroke for electric (heavy)'], 6000, [fourStroke, heavy], 60, 'keelung-swap-4stroke-heavy-v3'),
  kl('keelung-swap-four-stroke-light', ['基隆市淘汰四行程換購電動（輕型／小型）', 'Keelung scrap a four-stroke for electric (light/small)'], 2000, [fourStroke, lightOrSmall], 12, 'keelung-swap-4stroke-light-v3'),
  kl('keelung-new-heavy', ['基隆市新購電動機車（重型）', 'Keelung new electric scooter (heavy)'], 4000, [heavy], 129, 'keelung-new-heavy-v3', false),
  kl('keelung-new-light', ['基隆市新購電動機車（輕型／小型）', 'Keelung new electric scooter (light/small)'], 1000, [lightOrSmall], 16, 'keelung-new-light-v3', false),

  // Hsinchu City
  hc('hsinchu-city-swap-old-heavy', ['新竹市汰換二行程或25年以上機車換購電動（重型）', 'Hsinchu City scrap a two-stroke or 25-year-old scooter for electric (heavy)'], 17000, [old25, heavy], 140, 'hsinchucity-general-2stroke-or-25yr-v3', OLD25),
  hc('hsinchu-city-swap-old-light', ['新竹市汰換二行程或25年以上機車換購電動（輕型）', 'Hsinchu City scrap a two-stroke or 25-year-old scooter for electric (light)'], 12000, [old25, { kind: 'ev-plate-class', classes: ['light'] }], 20, 'hsinchucity-general-2stroke-or-25yr-v3', OLD25),
  hc('hsinchu-city-swap-any-heavy', ['新竹市汰換四行程機車換購電動（重型）', 'Hsinchu City scrap a four-stroke for electric (heavy)'], 12000, [fourStroke, heavy], 150, 'hsinchucity-general-4stroke-anyage-v3', ANYAGE),
  hc('hsinchu-city-swap-any-light', ['新竹市汰換四行程機車換購電動（輕型）', 'Hsinchu City scrap a four-stroke for electric (light)'], 8000, [fourStroke, { kind: 'ev-plate-class', classes: ['light'] }], 50, 'hsinchucity-general-4stroke-anyage-v3', ANYAGE),
  {
    ...hc('hsinchu-city-lowincome', ['新竹市中低收入戶換購電動', 'Hsinchu City low-income replacement'], 0, [lowIncome(['low', 'middle-low'])], 0, 'hsinchucity-lowincome-v3', ['中低收入戶。', 'Low-income households.']),
    kind: 'top-up',
    quota: unknownQuota,
    sources: ['hsinchu-city-2026-press'],
    calculator: { excluded: t('新聞稿只給含中央補助的合計（36,600至50,500元），市府部分與8,000元電池資費的發放方式未公布。', 'The press release gives only totals including central money (NT$36,600–50,500); the city part and how the NT$8,000 battery money is paid are not published.'), reason: 'not-published' },
  },

  // Hsinchu County
  p({ id: 'hsinchu-county-new-heavy', jurisdiction: 'hsinchu-county', payerName: HCC, name: t('新竹縣新購電動機車（重型）', 'Hsinchu County new electric scooter (heavy)'), amount: fixed(5500), conditions: [residency(), heavy], conditionText: t('設籍新竹縣；新購或換購都可申請。', 'Registered in Hsinchu County; new purchase or replacement.'), quota: slots(440), exclusiveGroups: ['hsinchu-county-base'], research: [r('hsinchucounty-new-heavy-v3')] }),
  p({ id: 'hsinchu-county-new-light', jurisdiction: 'hsinchu-county', payerName: HCC, name: t('新竹縣新購電動機車（輕型／小型）', 'Hsinchu County new electric scooter (light/small)'), amount: fixed(2500), conditions: [residency(), lightOrSmall], conditionText: t('設籍新竹縣；新購或換購都可申請。', 'Registered in Hsinchu County; new purchase or replacement.'), quota: slots(228), exclusiveGroups: ['hsinchu-county-base'], research: [r('hsinchucounty-new-light-v3')] }),
  p({ id: 'hsinchu-county-swap-topup', jurisdiction: 'hsinchu-county', payerName: HCC, name: t('新竹縣同一車主汰舊換購加碼', 'Hsinchu County same-owner scrap-and-replace top-up'), kind: 'scrap-bonus', amount: fixed(2500), conditions: [residency(), scrap, builtBy('2015-12-31')], conditionText: t('同一車主淘汰104年底以前出廠的燃油機車並換購電動機車，加在新購補助之上。', 'The same owner scraps a gasoline scooter built by the end of 2015 and buys electric; added on top of the new-purchase amount.'), quota: slots(120), research: [r('hsinchucounty-swap-topup-v3')] }),
  { ...p({ id: 'hsinchu-county-scrap-only-pre2011', jurisdiction: 'hsinchu-county', payerName: HCC, name: t('新竹縣純淘汰老舊機車（99年底前出廠）', 'Hsinchu County scrap only (built by 2010)'), kind: 'scrap-only-bonus', amount: fixed(1500), conditions: [residency(), scrap, builtBy('2010-12-31')], conditionText: t('舊車為99年底以前出廠的燃油機車。', 'The old scooter is a gasoline scooter built by the end of 2010.'), quota: slots(1280), exclusiveGroups: ['county-scrap-only'], research: [r('hsinchucounty-scrap-only-v3')] }), side: 'gasoline' as const },
  { ...p({ id: 'hsinchu-county-scrap-only-pre2016', jurisdiction: 'hsinchu-county', payerName: HCC, name: t('新竹縣純淘汰老舊機車（104年底前出廠）', 'Hsinchu County scrap only (built by 2015)'), kind: 'scrap-only-bonus', amount: fixed(1000), conditions: [residency(), scrap, builtBy('2015-12-31')], conditionText: t('舊車為104年底以前出廠的燃油機車。', 'The old scooter is a gasoline scooter built by the end of 2015.'), quota: slots(790), exclusiveGroups: ['county-scrap-only'], research: [r('hsinchucounty-scrap-only-v3')] }), side: 'gasoline' as const },

  // Miaoli
  p({ id: 'miaoli-swap-topup', jurisdiction: 'miaoli', payerName: ML, name: t('苗栗縣汰舊換購加碼（海盛發電捐贈）', 'Miaoli scrap-and-replace top-up (donated by Hai Sheng)'), kind: 'scrap-bonus', amount: fixed(2500), conditions: [residency(), scrap, scrapAge(10)], conditionText: t('淘汰出廠滿10年的燃油機車並換購電動機車；中央補助另向環境部平臺申請。', 'Scrap a gasoline scooter at least 10 years old and buy electric; central money is claimed separately on the MOENV platform.'), quota: slots(400, '2026-07-09'), sources: [...MEID], research: [r('miaoli-topup-2500-v3')] }),

  // Changhua
  p({ id: 'changhua-swap', jurisdiction: 'changhua', payerName: CH, name: t('彰化縣汰舊換購電動機車', 'Changhua scrap-and-replace'), amount: fixed(12000), conditions: [residency(), scrap, builtBy('2016-12-31'), { kind: 'scrap-registered-locally', minYears: 1 }], conditionText: t('舊車為105年底以前出廠、設籍彰化縣滿1年的燃油機車；全程線上申請，116年1月10日前。', 'The old scooter is a gasoline scooter built by the end of 2016 and registered in Changhua for at least a year; online applications by 10 January 2027.'), applicationDeadline: '2027-01-10', exclusiveGroups: ['changhua-base'], research: [r('changhua-swap-v3')] }),
  p({ id: 'changhua-new', jurisdiction: 'changhua', payerName: CH, name: t('彰化縣新購電動機車', 'Changhua new electric scooter'), amount: fixed(5000), conditions: [residency()], conditionText: t('設籍彰化縣；116年1月10日前線上申請。', 'Registered in Changhua; apply online by 10 January 2027.'), applicationDeadline: '2027-01-10', exclusiveGroups: ['changhua-base'], research: [r('changhua-new-purchase-v3')] }),
  { ...p({ id: 'changhua-scrap-only-two-stroke', jurisdiction: 'changhua', payerName: CH, name: t('彰化縣純報廢二行程機車', 'Changhua scrap a two-stroke only'), kind: 'scrap-only-bonus', amount: fixed(3000), conditions: [residency(), scrap, twoStroke, builtBy('2003-12-31'), { kind: 'scrap-registered-locally', minYears: 1 }], conditionText: t('92年底以前出廠的二行程機車，設籍彰化縣滿1年。', 'A two-stroke built by the end of 2003, registered in Changhua for at least a year.'), exclusiveGroups: ['county-scrap-only'], research: [r('changhua-scrap-only-v3')] }), side: 'gasoline' as const },
  { ...p({ id: 'changhua-scrap-only', jurisdiction: 'changhua', payerName: CH, name: t('彰化縣純報廢老舊機車', 'Changhua scrap an old scooter only'), kind: 'scrap-only-bonus', amount: fixed(1500), conditions: [residency(), scrap, builtBy('2016-12-31'), { kind: 'scrap-registered-locally', minYears: 1 }], conditionText: t('105年底以前出廠的燃油機車，設籍彰化縣滿1年。', 'A gasoline scooter built by the end of 2016, registered in Changhua for at least a year.'), exclusiveGroups: ['county-scrap-only'], research: [r('changhua-scrap-only-v3')] }), side: 'gasoline' as const },

  // Nantou
  p({ id: 'nantou-swap', jurisdiction: 'nantou', payerName: NT, name: t('南投縣汰舊換購電動機車', 'Nantou scrap-and-replace'), amount: fixed(16000), conditions: [residency(), scrap, builtBy('2007-06-30')], conditionText: t('舊車為96年6月30日以前出廠的燃油機車；外籍人士可申請；申請期限與名額未查到。', 'The old scooter is a gasoline scooter built by 30 June 2007; foreign nationals may apply; deadline and quota not found.'), exclusiveGroups: ['nantou-base'], sources: [...MEID], research: [r('nantou-swap-v3')] }),
  p({ id: 'nantou-new', jurisdiction: 'nantou', payerName: NT, name: t('南投縣新購電動機車', 'Nantou new electric scooter'), amount: fixed(5000), conditions: [residency()], conditionText: t('設籍南投縣；申請期限與名額未查到。', 'Registered in Nantou; deadline and quota not found.'), exclusiveGroups: ['nantou-base'], research: [r('nantou-new-purchase-v3')] }),
  {
    // Listed, not counted: the MEID table gives the amount but no finding records the old-scooter
    // age limit or other conditions (nantou-swap-v3's 2007-06-30 cut-off covers scrap-and-replace only).
    ...p({
      id: 'nantou-scrap-only',
      jurisdiction: 'nantou',
      payerName: NT,
      name: t('南投縣純淘汰老舊機車', 'Nantou scrap an old scooter only'),
      kind: 'scrap-only-bonus',
      amount: fixed(2500),
      conditions: [residency(), scrap],
      conditionText: t('淘汰老舊機車、不換購電動機車；舊車車齡等條件未查到。', 'Scrap an old scooter without buying an electric one; the old-scooter age limit and other conditions were not found.'),
      exclusiveGroups: ['county-scrap-only'],
      research: [r('nantou-new-purchase-v3')],
      calculator: {
        excluded: t('經濟部產業發展署補助表列出南投縣純淘汰2,500元，但舊車車齡等條件未查到；請洽南投縣環保局049-2238573。', 'The MEID subsidy table lists a Nantou scrap-only payment of NT$2,500, but the old-scooter age limit and other conditions were not found; ask the Nantou EPB on 049-2238573.'),
        reason: 'not-published',
      },
    }),
    side: 'gasoline' as const,
  },

  // Yunlin
  p({ id: 'yunlin-swap', jurisdiction: 'yunlin', payerName: YL, name: t('雲林縣一般民眾換購電動機車', 'Yunlin scrap-and-replace (general)'), amount: fixed(15000), conditions: [...ylGeneral, scrap, builtBy('2015-12-31')], conditionText: t(`${YL_TEXT}舊車為104年底以前出廠。`, `${YL_TEXT_EN} The old scooter was built by the end of 2015.`), quota: slots(350), status2027: YL_2027, exclusiveGroups: ['yunlin-base'], sources: ['yunlin-epb-2026-scooter-subsidy', ...MEID], research: [r('yunlin-swap-general-v3')] }),
  p({ id: 'yunlin-swap-lowincome', jurisdiction: 'yunlin', payerName: YL, name: t('雲林縣中低收入戶換購電動機車', 'Yunlin scrap-and-replace (low income)'), amount: fixed(25000), conditions: [...ylGeneral, scrap, builtBy('2015-12-31'), lowIncome(['low', 'middle-low'])], conditionText: t(`${YL_TEXT}中低收入戶換購25,000元。`, `${YL_TEXT_EN} NT$25,000 for low-income households replacing a scooter.`), status2027: YL_2027, exclusiveGroups: ['yunlin-base'], sources: ['yunlin-epb-2026-scooter-subsidy'], research: [r('yunlin-lowincome-v3')] }),
  p({ id: 'yunlin-new', jurisdiction: 'yunlin', payerName: YL, name: t('雲林縣一般民眾新購電動機車', 'Yunlin new electric scooter'), amount: fixed(10000), conditions: [...ylGeneral], conditionText: t(`${YL_TEXT}不必汰舊。`, `${YL_TEXT_EN} No scrapping needed.`), quota: slots(370), status2027: YL_2027, exclusiveGroups: ['yunlin-base'], sources: ['yunlin-epb-2026-scooter-subsidy', ...MEID], research: [r('yunlin-new-general-v3')] }),
  { ...p({ id: 'yunlin-scrap-only-two-stroke', jurisdiction: 'yunlin', payerName: YL, name: t('雲林縣二行程機車回收報廢', 'Yunlin scrap a two-stroke only'), kind: 'scrap-only-bonus', amount: fixed(5000), conditions: [...ylGeneral, scrap, twoStroke, builtBy('2003-12-31')], conditionText: t('92年底以前出廠的二行程機車完成回收與報廢。', 'A two-stroke built by the end of 2003, recycled and scrapped.'), quota: slots(420), status2027: YL_2027, exclusiveGroups: ['county-scrap-only'], sources: ['yunlin-epb-2026-scooter-subsidy', ...MEID], research: [r('yunlin-micro-2stroke-v3')] }), side: 'gasoline' as const },
  {
    // MEID table row: 2,000 (5,400 a year) for any gasoline scooter built by 2015-12-31. Matching
    // the row to the scheme is the researcher's reading of the table layout, hence 'secondary'.
    ...p({
      id: 'yunlin-scrap-only-2015',
      jurisdiction: 'yunlin',
      payerName: YL,
      name: t('雲林縣燃油機車回收報廢（104年底前出廠）', 'Yunlin scrap a gasoline scooter only (built by 2015)'),
      kind: 'scrap-only-bonus',
      amount: fixed(2000),
      conditions: [...ylGeneral, scrap, builtBy('2015-12-31')],
      conditionText: t(
        '104年底以前出廠的燃油機車完成回收與報廢；每年5,400名。這一列與方案的對應是研究人員依經濟部表格版面判讀，縣府新聞稿沒有寫出。',
        'A gasoline scooter built by the end of 2015, recycled and scrapped; 5,400 places a year. Matching this table row to the scheme is the researcher\'s reading of the MEID table layout; the county\'s press release does not state it.',
      ),
      quota: slots(5400),
      status2027: YL_2027,
      exclusiveGroups: ['county-scrap-only'],
      sources: [...MEID],
      confidence: 'secondary',
      research: [r('yunlin-micro-2stroke-v3')],
    }),
    side: 'gasoline' as const,
  },

  // Yilan
  il('yilan-swap-heavy', ['宜蘭縣汰舊換購電動機車（重型）', 'Yilan scrap-and-replace (heavy)'], 10000, [...ilOld, heavy], [IL_OLD, IL_OLD_EN], 'yilan-swap-general-heavy-v3'),
  il('yilan-swap-light', ['宜蘭縣汰舊換購電動機車（輕型／小型）', 'Yilan scrap-and-replace (light/small)'], 8000, [...ilOld, lightOrSmall], [IL_OLD, IL_OLD_EN], 'yilan-swap-general-light-v3'),
  il('yilan-swap-heavy-priority', ['宜蘭縣汰舊換購電動機車（重型，中低收入戶或原住民）', 'Yilan scrap-and-replace (heavy, low income or indigenous)'], 16000, [...ilOld, heavy, ilPriority], [`${IL_OLD}中低收入戶、低收入戶或原住民。`, `${IL_OLD_EN} Low or middle-low income households, or indigenous.`], 'yilan-swap-lowincome-heavy-v3'),
  il('yilan-swap-light-priority', ['宜蘭縣汰舊換購電動機車（輕型／小型，中低收入戶或原住民）', 'Yilan scrap-and-replace (light/small, low income or indigenous)'], 14000, [...ilOld, lightOrSmall, ilPriority], [`${IL_OLD}中低收入戶、低收入戶或原住民。`, `${IL_OLD_EN} Low or middle-low income households, or indigenous.`], 'yilan-swap-lowincome-light-v3'),
  il('yilan-new-heavy', ['宜蘭縣新購電動機車（重型）', 'Yilan new electric scooter (heavy)'], 8000, [heavy], ['不必汰舊。', 'No scrapping needed.'], 'yilan-new-general-heavy-v3'),
  il('yilan-new-light', ['宜蘭縣新購電動機車（輕型／小型）', 'Yilan new electric scooter (light/small)'], 7000, [lightOrSmall], ['不必汰舊。', 'No scrapping needed.'], 'yilan-new-general-light-v3'),
  il('yilan-new-heavy-priority', ['宜蘭縣新購電動機車（重型，中低收入戶或原住民）', 'Yilan new electric scooter (heavy, low income or indigenous)'], 12000, [heavy, ilPriority], ['中低收入戶、低收入戶或原住民。', 'Low or middle-low income households, or indigenous.'], 'yilan-new-lowincome-heavy-v3'),
  il('yilan-new-light-priority', ['宜蘭縣新購電動機車（輕型／小型，中低收入戶或原住民）', 'Yilan new electric scooter (light/small, low income or indigenous)'], 11000, [lightOrSmall, ilPriority], ['中低收入戶、低收入戶或原住民。', 'Low or middle-low income households, or indigenous.'], 'yilan-new-lowincome-light-v3'),
  { ...il('yilan-scrap-only-two-stroke', ['宜蘭縣純淘汰二行程機車', 'Yilan scrap a two-stroke only'], 1500, [...ilOld, twoStroke], [IL_OLD, IL_OLD_EN], 'yilan-scrap-only-v3'), kind: 'scrap-only-bonus' as const, side: 'gasoline' as const, exclusiveGroups: ['county-scrap-only'] },
  { ...il('yilan-scrap-only-four-stroke', ['宜蘭縣純淘汰四行程機車', 'Yilan scrap a four-stroke only'], 800, [...ilOld, fourStroke], [IL_OLD, IL_OLD_EN], 'yilan-scrap-only-v3'), kind: 'scrap-only-bonus' as const, side: 'gasoline' as const, exclusiveGroups: ['county-scrap-only'] },
];
