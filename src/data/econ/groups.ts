// Either/or groups. A programme lists the groups it belongs to; the engine counts at most one
// programme per group and picks the combination worth the most to the buyer. A two-sided group
// (`sideA`) instead sets one set of programmes against the rest: members on the same side stack.
// Advisory groups are not either/or rules: every member counts and the amount at risk is reported.
// `conservative: true` marks our cautious reading of an ambiguous rule: the engine also works
// out what the buyer would get under the generous reading and reports the difference.

import { t } from './l10n.ts';
import type { ExclusiveGroup } from './types.ts';

const g = (id: string, zh: string, en: string, extra: Partial<ExclusiveGroup> = {}): ExclusiveGroup => ({ id, label: t(zh, en), ...extra });

export const groups: Record<string, ExclusiveGroup> = Object.fromEntries(
  [
    // Central
    g('moea-base', '經濟部新購補助（依車種等級擇一）', 'MOEA new-purchase subsidy (one amount by class)'),
    g('moenv-carbon', '環境部減碳獎勵（四擇一）', 'MOENV carbon-reduction reward (choose one of four)', { sources: ['meid-lev-2026-subsidy-table'] }),
    g('moenv-air', '環境部空污補助（六擇一）', 'MOENV air-pollution subsidy (choose one of six)', { sources: ['meid-lev-2026-subsidy-table'] }),
    g('moenv-carbon-and-air', '環境部減碳獎勵與空污補助兩項都計入（請先確認）', 'MOENV carbon reward and air subsidy both counted (confirm first)', {
      advisory: true,
      ambiguity: t(
        '計算同時計入環境部減碳獎勵與空污補助：媒合平臺說明兩者分別審核撥款，環境部 2026 年 2 月的新聞稿也說符合資格者可同步申請；但那句話出現在汽車段落，2025 年也有報導說不能併領。申請前請向平臺確認（減碳02-6630-8000分機437，空污02-2339-0129），若只能領一項，會少這筆金額。',
        'We count both the MOENV carbon reward and the air subsidy: the matching platform says the two are reviewed and paid separately, and a February 2026 MOENV release says qualifying people can apply for both; but that sentence sits in a paragraph about cars and a 2025 report said they could not be combined. Confirm with the platform before relying on it (carbon 02-6630-8000 ext. 437, air 02-2339-0129); if only one can be claimed you would get that amount less.',
      ),
      sources: ['moenv-platform-faq', 'tcnews-2026-02-moenv-release'],
    }),
    g('gas-goods-tax-new', '貨物稅新購減徵', 'Goods-tax cut for a new purchase'),
    g('gas-goods-tax-stacking', '燃油機車這邊的兩項貨物稅減徵都計入（新購與汰舊換新；財政部沒有確認可以相加）', 'both goods-tax cuts counted on the petrol side (new purchase and scrap-and-replace; the MOF has not confirmed they add up)', {
      advisory: true,
      secondaryStacking: true,
      ambiguity: t(
        '燃油機車這邊同時扣了新購2,000元與汰舊換新的貨物稅減徵：車廠官方優惠與台中市環保局的金額表都這樣算，但財政部網頁把兩者分開列，沒有寫可以相加。若不能相加，燃油機車會貴這筆金額，電動機車相對更划算。',
        'The petrol side deducts both the NT$2,000 new-purchase and the scrap-and-replace goods-tax cuts, as the manufacturers\' official offers and Taichung\'s EPB amount table do; but the MOF page lists them separately and does not say they add up. If they do not, the petrol scooter costs that amount more and electric looks better.',
      ),
      sources: ['etax-goods-tax-scooter-cut', 'kymco-goods-tax-models', 'taichung-epb-2026-amount-table'],
    }),
    // Taipei
    g('tpe-base', '台北市基本補助（新購或汰購擇一）', 'Taipei base subsidy (new purchase or scrap-and-replace, one only)'),
    g('tpe-lowincome-stacking', '台北市中低及低收入戶加碼疊加在其他加碼上（請先確認）', 'Taipei low-income top-up stacked on the other top-ups (confirm first)', {
      advisory: true,
      atRiskIds: ['tpe-lowincome-topup'],
      ambiguity: t(
        '計算把台北市中低及低收入戶加碼10,000元加在電池資費（與袋鼠方案）加碼之上：計畫把它列為獨立項目，但沒有寫可以疊加，只有Taiwan News引述環保局說可再加領。申請前請向台北市環保局確認；若不能疊加，會少領這筆金額。',
        'We count the Taipei low-income NT$10,000 on top of the battery-fee (and kangaroo) top-ups: the plan lists it as a separate line but does not say it stacks, and only a Taiwan News report quoting the bureau says it does. Confirm with the Department of Environmental Protection before relying on it; if it does not stack you would get that amount less.',
      ),
      sources: ['taipei-dep-ev-subsidy-plan', 'taiwannews-2026-04-taipei-subsidy'],
    }),
    g('tpe-old-scooter-use', '台北市：同一輛要報廢的機車只能換購電動機車、TPASS或汰舊獎勵金擇一', 'Taipei: one scrapped scooter, one claim (electric replacement, TPASS or scrap bonus)'),
    // New Taipei
    g('ntpc-base', '新北市基本補助（新購或換購擇一）', 'New Taipei base subsidy (new purchase or replacement, one only)'),
    // Kept for backward compatibility (no programme uses it any more): the low-income question is
    // now two groups, and early bird versus double-scrap is a separate question.
    g('ntpc-lowincome-vs-addons', '新北市：中低收入戶加碼與早鳥／雙汰舊加碼只計一項（保守解讀）', 'New Taipei: low-income top-up or early-bird/double-scrap add-on, one only (conservative reading)', {
      conservative: true,
      ambiguity: t(
        '新北市計畫沒有寫明早鳥或雙汰舊加碼能否疊加在中低收入戶金額上。計算只算金額較高的一項；若可疊加，最多可再多領這筆金額。',
        'The New Taipei plan does not say whether the early-bird or double-scrap add-ons stack on the low-income amount. We count the larger one; if they stack you could receive up to that amount in addition.',
      ),
      sources: ['ntpc-motor-2026-plan'],
    }),
    g('ntpc-lowincome-vs-earlybird', '新北市：中低收入戶加碼與早鳥加碼只計一項（保守解讀）', 'New Taipei: low-income top-up or early-bird add-on, one only (conservative reading)', {
      conservative: true,
      ambiguity: t(
        '新北市計畫沒有寫明早鳥加碼能否疊加在中低收入戶金額上。計算只算金額較高的一項；若可疊加，最多可再多領這筆金額。',
        'The New Taipei plan does not say whether the early-bird add-on stacks on the low-income amount. We count the larger one; if it stacks you could receive up to that amount in addition.',
      ),
      sources: ['ntpc-motor-2026-plan'],
    }),
    g('ntpc-lowincome-vs-double', '新北市：中低收入戶加碼與雙汰舊加碼只計一項（保守解讀）', 'New Taipei: low-income top-up or double-scrap add-on, one only (conservative reading)', {
      conservative: true,
      ambiguity: t(
        '新北市計畫沒有寫明雙汰舊加碼能否疊加在中低收入戶金額上。計算只算金額較高的一項；若可疊加，最多可再多領這筆金額。',
        'The New Taipei plan does not say whether the double-scrap add-on stacks on the low-income amount. We count the larger one; if it stacks you could receive up to that amount in addition.',
      ),
      sources: ['ntpc-motor-2026-plan'],
    }),
    g('ntpc-earlybird-vs-double', '新北市：早鳥加碼與雙汰舊加碼只計一項（保守解讀）', 'New Taipei: early-bird or double-scrap add-on, one only (conservative reading)', {
      conservative: true,
      ambiguity: t(
        '新北市計畫沒有寫明早鳥加碼與雙汰舊加碼可以同時領；只有一則新聞（TVBS的39,600元範例）把兩者相加。計算只算金額較高的一項；若可同時領，可再多領這筆金額。',
        'The New Taipei plan does not say the early-bird and double-scrap add-ons can both be claimed; only a news report (TVBS\'s NT$39,600 example) adds them together. We count the larger one; if they combine you could receive that amount in addition.',
      ),
      sources: ['ntpc-motor-2026-plan'],
    }),
    g('taichung-base', '台中市補助（新購或依要報廢機車的期別擇一）', 'Taichung subsidy (new purchase or scrap tier, one only)'),
    g('keelung-base', '基隆市補助（換購或新購擇一）', 'Keelung subsidy (replacement or new purchase, one only)'),
    g('hsinchu-city-base', '新竹市換購補助（依要報廢的機車擇一）', 'Hsinchu City replacement subsidy (one per scrapped scooter)'),
    g('hsinchu-county-base', '新竹縣新購補助（依車種擇一）', 'Hsinchu County new-purchase subsidy (one by class)'),
    g('changhua-base', '彰化縣補助（換購或新購擇一）', 'Changhua subsidy (replacement or new purchase, one only)'),
    g('nantou-base', '南投縣補助（換購或新購擇一）', 'Nantou subsidy (replacement or new purchase, one only)'),
    g('yunlin-base', '雲林縣補助（一般換購、中低收入戶換購或新購擇一）', 'Yunlin subsidy (general replacement, low-income replacement or new purchase, one only)'),
    g('yilan-base', '宜蘭縣補助（換購或新購、一般或優先身分擇一）', 'Yilan subsidy (replacement or new purchase, general or priority group, one only)'),
    // Taoyuan
    g('ty-base', '桃園市基本補助（新購或汰換擇一）', 'Taoyuan base subsidy (new purchase or scrap-and-replace, one only)'),
    g('ty-age', '桃園市年齡專案（依年齡擇一）', 'Taoyuan age-band scheme (one by age)'),
    // Tainan
    g('tn-base', '台南市基本補助（一般、偏遠或中低收入戶擇一）', 'Tainan base subsidy (general, remote or low-income column, one only)'),
    g('tn-project', '台南市貼心專案（僅可擇一）', 'Tainan support project (one only)', { sources: ['tainan-epb-2026-programme'] }),
    // Kaohsiung
    g('khh-base', '高雄市基本補助（一般或低收入戶擇一）', 'Kaohsiung base subsidy (general or low-income, one only)'),
    g('khh-project', '高雄市加碼專案：青年、醫護、家長擇一', 'Kaohsiung top-up: youth, medical staff or parent, one only'),
    g('khh-old-scooter-use', '高雄市：同一輛要報廢的機車只能申請純淘汰或汰舊換購擇一', 'Kaohsiung: one scrapped scooter, scrap-only or scrap-and-replace'),
    // Counties
    g('kinmen-base', '金門縣補助（換購或新購擇一）', 'Kinmen subsidy (replacement or new purchase, one only)'),
    g('kinmen-vs-moenv', '金門縣補助或環境部各項獎勵，只計其中一方（保守解讀）', 'Kinmen subsidy or the MOENV payments together, one side only (conservative reading)', {
      conservative: true,
      jurisdictions: ['kinmen'],
      // Two-sided: Kinmen money on one side, every MOENV payment (carbon, air, NT$300 recycling) on
      // the other. The MOENV payments still stack with each other under their own rules.
      sideA: ['kinmen-swap', 'kinmen-new', 'kinmen-small', 'kinmen-scrap-only'],
      ambiguity: t(
        '金門縣補助要點排除「曾向環境部申請機車汰舊換新相關補助者」，同一次購車領環境部獎勵（減碳、空污與300元回收獎勵金）是否會被排除，要點沒有寫明，環保局也未回覆。計算只算金額較高的一方；若可併領，最多可再多領這筆金額。',
        'Kinmen\'s guidelines exclude anyone who "has applied to MOENV for related scrap-and-replace subsidies"; whether claiming the MOENV payments (carbon, air and the NT$300 recycling payment) for the same purchase disqualifies you is not stated. We count only the larger side; if both can be claimed you could receive up to that amount in addition.',
      ),
      sources: ['kinmen-epb-2026-guidelines'],
    }),
    g('chiayi-city-base', '嘉義市補助（換購或新購擇一）', 'Chiayi City subsidy (replacement or new purchase, one only)'),
    g('chiayi-county-base', '嘉義縣補助（換購或新購擇一）', 'Chiayi County subsidy (replacement or new purchase, one only)'),
    g('pingtung-base', '屏東縣補助（換購或新購擇一）', 'Pingtung subsidy (replacement or new purchase, one only)'),
    g('county-scrap-only', '單純淘汰補助（依車齡擇一）', 'Scrap-only payment (one by age)'),
  ].map((x) => [x.id, x]),
);
