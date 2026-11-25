// Either/or groups. A programme lists the groups it belongs to; the engine counts at most one
// programme per group and picks the combination worth the most to the buyer.
// `conservative: true` marks our cautious reading of an ambiguous rule: the engine also works
// out what the buyer would get under the generous reading and reports the difference.

import { t } from '../types.ts';
import type { ExclusiveGroup } from './types.ts';

const g = (id: string, zh: string, en: string, extra: Partial<ExclusiveGroup> = {}): ExclusiveGroup => ({ id, label: t(zh, en), ...extra });

export const groups: Record<string, ExclusiveGroup> = Object.fromEntries(
  [
    // Central
    g('moea-base', '經濟部新購補助（依車種等級擇一）', 'MOEA new-purchase subsidy (one amount by class)'),
    g('moenv-carbon', '環境部減碳獎勵（四擇一）', 'MOENV carbon-reduction reward (choose one of four)', { sources: ['meid-lev-2026-subsidy-table'] }),
    g('moenv-air', '環境部空污補助（六擇一）', 'MOENV air-pollution subsidy (choose one of six)', { sources: ['meid-lev-2026-subsidy-table'] }),
    g('moenv-one-stream', '環境部減碳獎勵與空污補助只計一項（保守解讀）', 'Only one MOENV payment counted: carbon or air (conservative reading)', {
      conservative: true,
      ambiguity: t(
        '環境部的減碳獎勵與空污補助能否同時領取，官方表格沒有寫明：TVBS 2025年報導說不能併領，今周刊2026年報導則把兩者相加。試算只算一項；若兩項都能領，最多可再多領下列金額。',
        'Whether the MOENV carbon reward and air subsidy can both be claimed is not stated in the official table: a 2025 TVBS report says no, a 2026 Business Today report adds them together. We count only one; if both can be claimed you could receive up to the amount below in addition.',
      ),
      sources: ['meid-lev-2026-subsidy-table', 'businesstoday-2026-01-subsidy-guide'],
    }),
    g('gas-goods-tax-new', '貨物稅新購減徵', 'Goods-tax cut for a new purchase'),
    // Taipei
    g('tpe-base', '臺北市基本補助（新購或汰購擇一）', 'Taipei base subsidy (new purchase or scrap-and-replace, one only)'),
    g('tpe-old-scooter-use', '臺北市：同一輛舊車只能換購電動機車、TPASS或汰舊獎勵金擇一', 'Taipei: one old scooter, one claim (electric replacement, TPASS or scrap bonus)'),
    // New Taipei
    g('ntpc-base', '新北市基本補助（新購或換購擇一）', 'New Taipei base subsidy (new purchase or replacement, one only)'),
    g('ntpc-lowincome-vs-addons', '新北市：中低收入戶加碼與早鳥／雙汰舊加碼只計一項（保守解讀）', 'New Taipei: low-income top-up or early-bird/double-scrap add-on, one only (conservative reading)', {
      conservative: true,
      ambiguity: t(
        '新北市計畫沒有寫明早鳥或雙汰舊加碼能否疊加在中低收入戶金額上。試算只算金額較高的一項；若可疊加，最多可再多領下列金額。',
        'The New Taipei plan does not say whether the early-bird or double-scrap add-ons stack on the low-income amount. We count the larger one; if they stack you could receive up to the amount below in addition.',
      ),
      sources: ['ntpc-motor-2026-plan'],
    }),
    // Taoyuan
    g('ty-base', '桃園市基本補助（新購或汰換擇一）', 'Taoyuan base subsidy (new purchase or scrap-and-replace, one only)'),
    g('ty-age', '桃園市年齡專案（依年齡擇一）', 'Taoyuan age-band scheme (one by age)'),
    // Tainan
    g('tn-base', '臺南市基本補助（一般、偏遠或中低收入戶擇一）', 'Tainan base subsidy (general, remote or low-income column, one only)'),
    g('tn-project', '臺南市貼心專案（僅可擇一）', 'Tainan support project (one only)', { sources: ['tainan-epb-2026-programme'] }),
    // Kaohsiung
    g('khh-base', '高雄市基本補助（一般或低收入戶擇一）', 'Kaohsiung base subsidy (general or low-income, one only)'),
    g('khh-project', '高雄市加碼專案：青年、醫護、家長擇一', 'Kaohsiung top-up: youth, medical staff or parent, one only'),
    g('khh-old-scooter-use', '高雄市：同一輛舊車只能申請純淘汰或汰舊換購擇一', 'Kaohsiung: one old scooter, scrap-only or scrap-and-replace'),
    // Counties
    g('kinmen-base', '金門縣補助（換購或新購擇一）', 'Kinmen subsidy (replacement or new purchase, one only)'),
    g('kinmen-vs-moenv', '金門縣補助與環境部獎勵只計一項（保守解讀）', 'Kinmen subsidy or MOENV payments, one only (conservative reading)', {
      conservative: true,
      ambiguity: t(
        '金門縣補助要點排除「曾向環境部申請機車汰舊換新相關補助者」，同一次購車領環境部獎勵是否會被排除，要點沒有寫明，環保局也未回覆。試算只算金額較高的一方；若可併領，最多可再多領下列金額。',
        'Kinmen\'s guidelines exclude anyone who "has applied to MOENV for related scrap-and-replace subsidies"; whether claiming the MOENV reward for the same purchase disqualifies you is not stated. We count only the larger side; if both can be claimed you could receive up to the amount below in addition.',
      ),
      sources: ['kinmen-epb-2026-guidelines'],
    }),
    g('chiayi-city-base', '嘉義市補助（換購或新購擇一）', 'Chiayi City subsidy (replacement or new purchase, one only)'),
    g('chiayi-county-base', '嘉義縣補助（換購或新購擇一）', 'Chiayi County subsidy (replacement or new purchase, one only)'),
    g('pingtung-base', '屏東縣補助（換購或新購擇一）', 'Pingtung subsidy (replacement or new purchase, one only)'),
    g('county-scrap-only', '單純淘汰補助（依車齡擇一）', 'Scrap-only payment (one by age)'),
  ].map((x) => [x.id, x]),
);
