// Bibliography: one entry per source the registry actually uses.
//
// Rules
// - Ids are stable kebab-case. Never rename one; facts, series and the claims policy point at them.
// - `title` is in the source's own language. When the research notes give no title (some news
//   pages), `titleIsDescriptive: true` marks a bracketed description written by us.
// - `readLevel` records honestly how far the research agent got into the source.
// - Every source needs a `url` or a `doi`. scripts/check-data.mjs enforces this and checks that
//   every source here is cited at least once.
// - All sources were accessed on 2026-11-25 (the research date).

import type { L10n, Locale } from './types.ts';
import { t } from './types.ts';

export const sourceKinds = [
  'journal',
  'government',
  'intergovernmental',
  'report',
  'news',
  'dataset',
  'conference',
] as const;
export type SourceKind = (typeof sourceKinds)[number];

export const readLevels = [
  'official-document-read',
  'official-page-read',
  'dataset-read',
  'dataset-metadata-only',
  'press-release-read',
  'executive-summary-read',
  'section-read',
  'full-text-read',
  'abstract-only',
  'bibliographic-record-only',
  'media-report-read',
  'search-summary-only',
] as const;
export type ReadLevel = (typeof readLevels)[number];

export const readLevelLabels: Record<ReadLevel, L10n> = {
  'official-document-read': t('已閱讀官方文件原文', 'Official document read'),
  'official-page-read': t('已閱讀官方網頁', 'Official web page read'),
  'dataset-read': t('已下載並讀取原始資料', 'Original dataset downloaded and read'),
  'dataset-metadata-only': t('僅讀取資料集說明（未取得數據）', 'Dataset description only (no data rows)'),
  'press-release-read': t('已閱讀官方新聞稿', 'Official press release read'),
  'executive-summary-read': t('已閱讀執行摘要（未讀全文）', 'Executive summary read (not the full report)'),
  'section-read': t('已閱讀相關章節', 'Relevant section read'),
  'full-text-read': t('已閱讀全文', 'Full text read'),
  'abstract-only': t('僅閱讀摘要', 'Abstract only'),
  'bibliographic-record-only': t('僅核對書目資料', 'Bibliographic record only'),
  'media-report-read': t('已閱讀媒體報導（轉述官方數字）', 'Media report read (quoting an official figure)'),
  'search-summary-only': t('僅見於搜尋摘要，未開啟原頁', 'Seen only in a search summary; page not opened'),
};

export const sourceKindLabels: Record<SourceKind, L10n> = {
  journal: t('期刊論文', 'Journal article'),
  government: t('政府文件', 'Government publication'),
  intergovernmental: t('國際組織文件', 'Intergovernmental publication'),
  report: t('研究報告', 'Research report'),
  news: t('新聞報導', 'News report'),
  dataset: t('資料集', 'Dataset'),
  conference: t('研討會論文', 'Conference paper'),
};

export interface SourceInput {
  kind: SourceKind;
  /** Personal authors as published ("Chuang K-J" or "洪珮瑜"). */
  authors?: string[];
  /** True when the research notes list only the first author(s). */
  etAl?: boolean;
  /** Corporate author, publisher or news outlet, in both languages. */
  org?: L10n;
  /** Publication year, only when the research notes give it. */
  year?: number;
  /** ISO date (yyyy-mm or yyyy-mm-dd) when known. */
  date?: string;
  title: string;
  titleIsDescriptive?: boolean;
  /** Title in the other language. */
  titleTranslated?: string;
  /** The translated title is the publisher's own (otherwise it is ours). */
  titleTranslationOfficial?: boolean;
  /** Journal or series name. */
  container?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  reportNumber?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  accessed: string;
  language: Locale;
  readLevel: ReadLevel;
  /** Internal note for editors (English): how it was read, quirks, limits. */
  readNote?: string;
}

const ACCESSED = '2026-11-25';
const MOENV = t('環境部', 'Ministry of Environment (MOENV)');
const TVBS = t('TVBS新聞網', 'TVBS News');
const PTS = t('公視新聞網', 'PTS News');
const CTEE = t('工商時報', 'Commercial Times (CTEE)');
const UCAR = t('U-CAR', 'U-CAR');
const TAIPEI_DBAS = t('臺北市政府主計處', 'Department of Budget, Accounting and Statistics, Taipei City Government');
const IARC = t('國際癌症研究機構（IARC）', 'International Agency for Research on Cancer (IARC)');
const WHO = t('世界衛生組織（WHO）', 'World Health Organization (WHO)');

export const sources = {
  // -------------------------------------------------------------------------
  // Taiwanese government: MOENV, MOTC/IOT, Taipei City, MOHW
  // -------------------------------------------------------------------------
  'moenv-air-review-2024': {
    kind: 'government',
    org: MOENV,
    title: '113年度空氣污染防制總檢討',
    titleTranslated: 'Air Pollution Control Review, 2024 (ROC year 113)',
    url: 'https://air.moenv.gov.tw/EnvDownload/AirQuality/92%E5%B9%B4%E8%87%B3105%E5%B9%B4%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E/113%E5%B9%B4%E5%BA%A6%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E.pdf',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
    readNote: 'PDF downloaded and converted with pdftotext; 機動車輛 section (~p.19). Publication year not recorded in the research notes.',
  },
  'moenv-air-review-2023': {
    kind: 'government',
    org: MOENV,
    title: '112年度空氣污染防制總檢討',
    titleTranslated: 'Air Pollution Control Review, 2023 (ROC year 112)',
    url: 'https://air.moenv.gov.tw/EnvDownload/AirQuality/92%E5%B9%B4%E8%87%B3105%E5%B9%B4%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E/112%E5%B9%B4%E5%BA%A6%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E.pdf',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
    readNote: 'PDF downloaded; includes the 機車排放標準 paragraph (phase dates) and scrappage figures.',
  },
  'moenv-teds-page': {
    kind: 'government',
    org: MOENV,
    title: '環境部空氣品質改善維護資訊網：空氣污染物排放清冊（TEDS）說明頁',
    titleIsDescriptive: true,
    titleTranslated: 'MOENV air-quality information site: emissions inventory (TEDS) page',
    url: 'https://air.moenv.gov.tw/envtopics/AirQuality_6.aspx',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-page-read',
    readNote: 'Version history, national totals and scope statement. Page footer dated 2026-11-26.',
  },
  'moenv-teds13-workbook': {
    kind: 'dataset',
    org: MOENV,
    year: 2026,
    date: '2026-01',
    title: '全國民國112年各污染源行業別排放量分類統計表（TEDS13.0_污染源版排放量分類統計表_全國.xlsx）',
    titleTranslated: 'National emissions by source category, base year 2023 (TEDS 13.0 workbook)',
    container: '空氣污染物排放量清冊TEDS13.0版相關文件',
    reportNumber: '[TEDS13.0] 20251030v1',
    url: 'https://air.moenv.gov.tw/EnvDownload/AirQuality/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E6%8E%92%E6%94%BE%E6%B8%85%E5%86%8A/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E7%89%A9%E6%8E%92%E6%94%BE%E9%87%8F%E6%B8%85%E5%86%8ATEDS13.0%E7%89%88%E7%9B%B8%E9%97%9C%E6%96%87%E4%BB%B6.zip',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'dataset-read',
    readNote: '22 MB zip; workbook in 污染源版排放量分類統計表/全國, sheet 全國, read with openpyxl. Sheet title says 行業別 while the file name says 污染源版 (labelling quirk). TEDS 13.0 published January 2026 per the TEDS page.',
  },
  'moenv-news-2025-power-sector': {
    kind: 'government',
    org: MOENV,
    year: 2025,
    date: '2025-06-30',
    title: '直接以排放量占比為空氣污染貢獻比率是錯誤論述',
    titleTranslated: 'Treating emission shares as contributions to air pollution is a mistaken argument',
    url: 'https://air.moenv.gov.tw/News/news.aspx?ID=6282',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'press-release-read',
  },
  'moenv-air-plan-2020': {
    kind: 'government',
    org: t('環境部（原行政院環境保護署）', 'Ministry of Environment (formerly EPA)'),
    title: '空氣污染防制方案（109-112）核定本',
    titleTranslated: 'Air Pollution Control Plan 2020–2023 (approved version)',
    url: 'https://air.moenv.gov.tw/EnvDownload/AirQuality/%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E4%BF%9D%E8%AD%B7%E6%94%BF%E7%AD%96%E8%A6%8F%E5%8A%83/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E6%96%B9%E6%A1%88109-112(%E6%A0%B8%E5%AE%9A%E6%9C%AC).pdf',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
    readNote: 'Apportionment on PDF p.15, modelled with the TEDS 9.0 inventory (2013 base). Dated.',
  },
  'moenv-air-quality-standards': {
    kind: 'government',
    org: MOENV,
    year: 2024,
    date: '2024-09-30',
    title: '空氣品質標準',
    titleTranslated: 'Air Quality Standards',
    reportNumber: '環境部空字第1131062467號令修正發布',
    url: 'https://airtw.moenv.gov.tw/CHT/Information/Standard/Rules.aspx',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-page-read',
    readNote: 'Amended 2024-09-30. The page header does not state the effective date.',
  },
  'datagov-14208-motorcycle-registrations': {
    kind: 'dataset',
    org: t('交通部公路局（政府資料開放平臺）', 'Highway Bureau, MOTC (via data.gov.tw)'),
    title: '政府資料開放平臺資料集14208詮釋資料：公路總局機動車輛登記數統計',
    titleIsDescriptive: true,
    titleTranslated: 'data.gov.tw dataset 14208 metadata: registered motor vehicles (Highway Bureau)',
    url: 'https://data.gov.tw/api/v2/rest/dataset/14208',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'dataset-metadata-only',
    readNote: 'Metadata only: definition and the 2013 sworn-scrappage break. Data rows (stat.thb.gov.tw) were unreachable.',
  },
  'taipei-dbas-bulletin-1364': {
    kind: 'government',
    org: TAIPEI_DBAS,
    title: '臺北市市政統計週報第1364號（機車及自用小客車使用狀況調查）',
    titleIsDescriptive: true,
    titleTranslated: 'Taipei City statistics weekly bulletin no. 1364 (motorcycle and private car usage survey)',
    reportNumber: '1364',
    url: 'https://www-ws.gov.taipei/001/Upload/367/relfile/46908/9517432/5897ecdf-046f-4f8c-85e1-9ce86a63bdc8.pdf',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
    readNote: 'Relays the MOTC 機車及自用小客車使用狀況調查 (2024).',
  },
  'taipei-dbas-bulletin-1341': {
    kind: 'government',
    org: TAIPEI_DBAS,
    title: '臺北市市政統計週報第1341號（民眾日常使用運具狀況調查）',
    titleIsDescriptive: true,
    titleTranslated: 'Taipei City statistics weekly bulletin no. 1341 (daily transport mode survey)',
    reportNumber: '1341',
    url: 'https://www-ws.gov.taipei/001/Upload/367/relfile/46908/9442607/0bbf97f1-faca-4f2c-b296-3013a137e3f0.pdf',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
    readNote: 'Relays the MOTC 民眾日常使用運具狀況調查; table column read by rendering the page.',
  },
  'taipei-epd-air-report-2024': {
    kind: 'government',
    org: t('臺北市政府環境保護局', 'Department of Environmental Protection, Taipei City Government'),
    title: '113年空氣品質監測年報',
    titleTranslated: 'Air Quality Monitoring Annual Report 2024 (ROC year 113)',
    url: 'https://www.tldep.gov.taipei/Public/DownLoad/AnnualReport/113.pdf',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
    readNote: 'Table 3-2-7 (traffic vs general stations) and Table 2-4-1 used. The report\'s own section 2.4 text repeats 2021 values (13.2/16.5) for 2024 and conflicts with its table; the table is used.',
  },
  'iot-2025-intersection-air-quality': {
    kind: 'government',
    authors: ['洪珮瑜', '陳冠男', '蘇淳太', '葉富豪', '林映君', '王思懿', '陳瀚禮', '朱珮芸', '鄔德傳', '黃士騰', '楊家銘'],
    org: t('交通部運輸研究所', 'Institute of Transportation, MOTC'),
    year: 2025,
    date: '2025-12',
    title: '路口交通環境特性對空氣品質影響及改善指引之研訂(2/2)－資料分析與指引研訂',
    titleTranslated:
      'The Impact of Traffic Environmental Characteristics at Intersections on Air Quality and the Development of Improvement Guidelines (Data Analysis and Develop Guidelines)',
    titleTranslationOfficial: true,
    reportNumber: 'IOT 114-084-6228 (project 113-TB006)',
    isbn: '978-986-531-730-0',
    url: 'https://www.iot.gov.tw/uploads/column_entry_file/file/697879c4085777f955e15ddf/%E8%B7%AF%E5%8F%A3%E4%BA%A4%E9%80%9A%E7%92%B0%E5%A2%83%E7%89%B9%E6%80%A7%E5%B0%8D%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E5%BD%B1%E9%9F%BF%E5%8F%8A%E6%94%B9%E5%96%84%E6%8C%87%E5%BC%95%E4%B9%8B%E7%A0%94%E8%A8%82_2.2_.pdf',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
    readNote: '402 pp; read at table/summary level via pdftotext. PI 洪珮瑜 (景丰科技); IOT staff 朱珮芸, 鄔德傳, 黃士騰, 楊家銘. GPN 1011401545. No DOI. Cover: 本研究之結論與建議不代表交通部之意見.',
  },
  'mohw-cause-of-death-2025': {
    kind: 'government',
    org: t('衛生福利部', 'Ministry of Health and Welfare (MOHW)'),
    year: 2026,
    date: '2026-06',
    title: '114年死因統計結果分析',
    titleTranslated: 'Analysis of cause-of-death statistics, 2025 (ROC year 114)',
    url: 'https://www.mohw.gov.tw/dl-100895-54a44151-2be8-48d7-a1b7-6914bb0ad75d.html',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'official-document-read',
  },

  // -------------------------------------------------------------------------
  // Taiwanese news reports of official / industry figures
  // -------------------------------------------------------------------------
  'pts-2026-07-scooter-fleet': {
    kind: 'news',
    org: PTS,
    year: 2026,
    date: '2026-07-15',
    title: '公視新聞網新聞實驗室報導：全國機車登記數、燃油與電動機車占比及淨零路徑目標',
    titleIsDescriptive: true,
    titleTranslated: 'PTS News Lab report on registered motorcycles, fuel/electric split and net-zero targets',
    url: 'https://news.pts.org.tw/article/817768',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Quotes MOTC stock (end May 2026) and the net-zero path targets; neither original (MOTC table, NDC PDF) could be opened.',
  },
  'pts-2026-04-ev-share': {
    kind: 'news',
    org: PTS,
    year: 2026,
    date: '2026-04-07',
    title: '公視新聞網報導：電動機車市售比與2030、2040年目標',
    titleIsDescriptive: true,
    titleTranslated: 'PTS News report on electric scooter sales share and the 2030/2040 targets',
    url: 'https://news.pts.org.tw/article/802600',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Gives the 2022 share (11.9%) per SMAT and restates the 2030/2040 targets.',
  },
  'tvbs-2025-scooter-density': {
    kind: 'news',
    org: TVBS,
    year: 2025,
    title: 'TVBS新聞網報導：交通部統計每百人擁有62.7輛機車',
    titleIsDescriptive: true,
    titleTranslated: 'TVBS News report: MOTC figures show 62.7 motorcycles per 100 people',
    url: 'https://news.tvbs.com.tw/life/2853869',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Refers to the first two months of 2025 (stock 14.662M).',
  },
  'tvbs-cars-vehicle-registrations-ranking': {
    kind: 'news',
    org: t('TVBS地球黃金線', 'TVBS (Earth Golden Line)'),
    title: 'TVBS地球黃金線報導：機動車輛登記數與機車持有率國際比較',
    titleIsDescriptive: true,
    titleTranslated: 'TVBS report on registered vehicles and an international motorcycle-ownership ranking',
    url: 'https://cars.tvbs.com.tw/life/304521',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Cites Seasia Stats for the ranking (Taiwan 60, Vietnam 57, Malaysia 44 per 100); Seasia Stats not opened; undated.',
  },
  'tvbs-2022-mode-share': {
    kind: 'news',
    org: TVBS,
    title: 'TVBS新聞網報導：111年運具市占率，機車45.8%最高',
    titleIsDescriptive: true,
    titleTranslated: 'TVBS News report on 2022 transport mode shares (motorcycles 45.8%)',
    url: 'https://news.tvbs.com.tw/life/2558146',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Also contains an unsupported "2040 ban" statement, which is NOT used (see claims policy).',
  },
  'ctee-2026-04-six-cities-ev': {
    kind: 'news',
    org: CTEE,
    year: 2026,
    date: '2026-04-16',
    title: '工商時報報導：2025年六都電動機車市售比與普及率',
    titleIsDescriptive: true,
    titleTranslated: 'Commercial Times report on 2025 electric scooter sales share and penetration in the six municipalities',
    url: 'https://www.ctee.com.tw/news/20260416701222-430503',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Industry association SMAT citing Highway Bureau figures.',
  },
  'ctee-2026-06-may-sales': {
    kind: 'news',
    org: CTEE,
    year: 2026,
    date: '2026-06-02',
    title: '工商時報報導：2026年5月機車銷量',
    titleIsDescriptive: true,
    titleTranslated: 'Commercial Times report on May 2026 motorcycle sales',
    url: 'https://www.ctee.com.tw/news/20260602700923-430503',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
  },
  'cnyes-2019-registrations': {
    kind: 'news',
    org: t('鉅亨網', 'Anue (cnyes.com)'),
    title: '鉅亨網報導：2019年度燃油機車與電動機車領牌數',
    titleIsDescriptive: true,
    titleTranslated: 'Anue report on 2019 gasoline vs electric motorcycle registrations',
    url: 'https://news.cnyes.com/news/id/4431598',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Cites 交通部統計.',
  },
  'chinatimes-2022-gogoro-briefing': {
    kind: 'news',
    org: t('工商時報（旺得富）', 'Commercial Times (Wantrich)'),
    year: 2022,
    date: '2022-01-11',
    title: '工商時報報導：Gogoro說明會公布2021年機車市場銷量',
    titleIsDescriptive: true,
    titleTranslated: 'Commercial Times report on 2021 motorcycle market sales (Gogoro press briefing)',
    url: 'https://wantrich.chinatimes.com/news/20220111900740-420101',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Date taken from the URL. Figures come from a company (Gogoro) briefing.',
  },
  'ucar-ev-sales-2023': {
    kind: 'news',
    org: UCAR,
    title: 'U-CAR報導：2023年電動機車掛牌數',
    titleIsDescriptive: true,
    titleTranslated: 'U-CAR report on 2023 electric motorcycle registrations',
    url: 'https://news.u-car.com.tw/collection/article/5965',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Gives 79,584 and 9.141% share; its "down 9.14% vs 2022" figure is not used (see conflicts note in series.ts).',
  },
  'ucar-ev-sales-2024': {
    kind: 'news',
    org: UCAR,
    title: 'U-CAR報導：2024年電動機車市售比',
    titleIsDescriptive: true,
    titleTranslated: 'U-CAR report on the 2024 electric motorcycle sales share',
    url: 'https://collection.u-car.com.tw/collection/article/6209',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
  },
  'tvbs-cars-2024-market-total': {
    kind: 'news',
    org: TVBS,
    title: 'TVBS報導：2024年台灣機車總市場掛牌數',
    titleIsDescriptive: true,
    titleTranslated: 'TVBS report on total 2024 motorcycle registrations in Taiwan',
    url: 'https://cars.tvbs.com.tw/car-news/234355',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Source of 752,643 (2024) and 870,620 (2023).',
  },
  'tvbs-cars-2024-ev-share': {
    kind: 'news',
    org: TVBS,
    title: 'TVBS報導：2024年電動機車掛牌數與市售比',
    titleIsDescriptive: true,
    titleTranslated: 'TVBS report on 2024 electric motorcycle registrations and sales share',
    url: 'https://cars.tvbs.com.tw/car-news/235023',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: '78,757 and 10.46%.',
  },
  'tvbs-cars-2025-12-ev-sales': {
    kind: 'news',
    org: TVBS,
    year: 2025,
    date: '2025-12',
    title: 'TVBS報導：2025年電動機車銷量與燃油機車貨物稅減徵',
    titleIsDescriptive: true,
    titleTranslated: 'TVBS report on 2025 electric scooter sales and the gasoline-scooter excise-tax cut',
    url: 'https://cars.tvbs.com.tw/car-news/301321',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'media-report-read',
    readNote: 'Table total cell 49,128; excise-tax cut from 2025-08-29.',
  },
  'udn-national-pm25-trend': {
    kind: 'news',
    org: t('聯合新聞網', 'United Daily News (udn.com)'),
    title: '聯合新聞網報導：全國PM2.5年平均濃度改善',
    titleIsDescriptive: true,
    titleTranslated: 'UDN report on the improvement in national annual mean PM2.5',
    url: 'https://udn.com/news/story/7266/9237319',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'search-summary-only',
    readNote: 'Research file 02 tags it SECONDARY under its definition (search summary / page not opened). Not checked against MOENV.',
  },
  'taipeitimes-2025-04-07-scramble': {
    kind: 'news',
    org: t('台北時報', 'Taipei Times'),
    year: 2025,
    date: '2025-04-07',
    title: 'Taipei Times report on IOT study of scramble crossings and sidewalk widening',
    titleIsDescriptive: true,
    titleTranslated: '台北時報報導運研所行人專用時相與人行道拓寬研究',
    url: 'https://www.taipeitimes.com/News/taiwan/archives/2025/04/07/2003834753',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'search-summary-only',
    readNote: 'HTTP 403; known only from a search summary. Cited ONLY in the claims policy as an example of overstated coverage, never for a fact.',
  },
  'ltn-scramble-90-percent': {
    kind: 'news',
    org: t('自由時報', 'Liberty Times'),
    title: '行人專用時相 尖峰時少吸9成廢氣',
    titleTranslated: 'Exclusive pedestrian phase: 90% less exhaust inhaled at peak times',
    url: 'https://news.ltn.com.tw/news/life/paper/1700267',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'search-summary-only',
    readNote: 'Headline known from search results only. Cited ONLY in the claims policy as an example of overstated coverage.',
  },
  'ltn-online-poll-old-vehicles': {
    kind: 'news',
    org: t('自由時報', 'Liberty Times'),
    title: '健康隱形殺手！近9成民眾對交通廢氣有感 盼加嚴管制老車',
    titleTranslated: 'Invisible health killer: nearly 90% of people notice traffic exhaust and want tighter controls on old vehicles',
    url: 'https://news.ltn.com.tw/news/life/breakingnews/5523704',
    accessed: ACCESSED,
    language: 'zh-TW',
    readLevel: 'search-summary-only',
    readNote: 'HTTP 403. Non-random online poll, sample unknown. Cited ONLY in the claims policy (do not publish as public opinion).',
  },

  // -------------------------------------------------------------------------
  // Peer-reviewed studies: exposure and emissions (Taiwan unless noted)
  // -------------------------------------------------------------------------
  'wu-2021-trd': {
    kind: 'journal',
    authors: ['Wu T-G', 'Chang J-C', 'Huang S-H', 'Lin W-Y', 'Chan C-C', 'Wu C-F'],
    year: 2021,
    title: 'Exposures and health impact for bicycle and electric scooter commuters in Taipei',
    titleTranslated: '臺北自行車與機車通勤者的暴露與健康影響',
    container: 'Transportation Research Part D: Transport and Environment',
    volume: '91',
    pages: '102696',
    doi: '10.1016/j.trd.2021.102696',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Abstract via Semantic Scholar (file 02). "Electric scooter" in the title is Taiwanese-English for scooter; the conclusion concerns gasoline scooters. File 03 could not retrieve the abstract and tagged it SECONDARY; file 02 is used.',
  },
  'wang-2021-atmosphere': {
    kind: 'journal',
    authors: ['Wang C-Y', 'Lim B-S', 'Wang Y-H', 'Huang Y-CT'],
    year: 2021,
    title: 'Identification of High Personal PM2.5 Exposure during Real Time Commuting in the Taipei Metropolitan Area',
    titleTranslated: '大臺北地區即時通勤過程中高個人PM2.5暴露之辨識',
    container: 'Atmosphere',
    volume: '12',
    issue: '3',
    pages: '396',
    doi: '10.3390/atmos12030396',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'chuang-2020-aeax': {
    kind: 'journal',
    authors: ['Chuang K-J', 'Lin L-Y', 'Ho K-F', 'Su C-T'],
    year: 2020,
    title: 'Traffic-related PM2.5 exposure and its cardiovascular effects among healthy commuters in Taipei, Taiwan',
    titleTranslated: '臺北健康通勤者的交通相關PM2.5暴露及其心血管影響',
    container: 'Atmospheric Environment: X',
    volume: '7',
    pages: '100084',
    doi: '10.1016/j.aeaoa.2020.100084',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Open access; abstract from OpenAlex and Semantic Scholar (identical). Full text not read, so the PM2.5 increment behind the % effects is unknown.',
  },
  'chang-hsiao-2026-jhm': {
    kind: 'journal',
    authors: ['Chang P-K', 'Hsiao T-C'],
    year: 2026,
    title:
      'Evaluation of spatial distribution of cancer risk induced by traffic-related ultrafine particles within an urban microenvironment in New Taipei City, Taiwan',
    container: 'Journal of Hazardous Materials',
    volume: '502',
    pages: '141024',
    doi: '10.1016/j.jhazmat.2026.141024',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'tsai-2024-aeax': {
    kind: 'journal',
    authors: ['Tsai I-C', 'Lin C-W', 'Su S-H', 'Chang C-W', 'Su C-W', 'Lung S-CC'],
    year: 2024,
    title: 'Spatial and temporal analysis of scooter-induced traffic patterns and their environmental implications',
    container: 'Atmospheric Environment: X',
    volume: '23',
    pages: '100291',
    doi: '10.1016/j.aeaoa.2024.100291',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Abstract via DOAJ.',
  },
  'tsai-2021-stoten': {
    kind: 'journal',
    authors: ['Tsai I-C', 'Lee C-Y', 'Lung S-C', 'Su C-W'],
    year: 2021,
    title: 'Air-quality model (CMAQ) sensitivity study of vehicle-emission contributions in downtown Taipei; exact title not recorded in our research notes',
    titleIsDescriptive: true,
    container: 'Science of the Total Environment',
    volume: '782',
    pages: '146571',
    doi: '10.1016/j.scitotenv.2021.146571',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Title missing from the research notes; resolve via the DOI before display. CMAQ sensitivity study, downtown Taipei.',
  },
  'ting-2023-envres': {
    kind: 'journal',
    authors: ['Ting Y-C', 'Chang P-K', 'Hung P-C', 'Chi K-H', 'Hsiao T-C'],
    etAl: true,
    year: 2023,
    title: 'Characterizing emission factors and oxidative potential of motorcycle emissions in a real-world tunnel environment',
    container: 'Environmental Research',
    volume: '234',
    pages: '116601',
    doi: '10.1016/j.envres.2023.116601',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'tsai-2023-atmosphere': {
    kind: 'journal',
    authors: ['Tsai J-H', 'Chen J-Y', 'Chiang H-L'],
    year: 2023,
    title: 'Airborne Air Pollutant Emission Characteristics of Mobile Vehicles in Taiwan',
    titleTranslated: '臺灣移動車輛的空氣污染物排放特性',
    container: 'Atmosphere',
    volume: '14',
    issue: '6',
    pages: '916',
    doi: '10.3390/atmos14060916',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'tsai-2018-aaqr': {
    kind: 'journal',
    authors: ['Tsai J-H', 'Yao Y-C', 'Huang P-L', 'Chiang H-L'],
    year: 2018,
    title: 'Fuel Economy and VOC Exhaust Emission for Motorcycles with Various Running Mileages',
    container: 'Aerosol and Air Quality Research',
    volume: '18',
    doi: '10.4209/aaqr.2018.07.0264',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'lin-2019-jhm': {
    kind: 'journal',
    authors: ['Lin Y-C', 'Chou F-C', 'Li Y-C', 'Jhang S-R', 'Shangdiar S'],
    year: 2019,
    title: 'Particulate PAH emissions from ten in-use motorcycles by running mileage; exact title not recorded in our research notes',
    titleIsDescriptive: true,
    container: 'Journal of Hazardous Materials',
    volume: '365',
    pages: '771-777',
    doi: '10.1016/j.jhazmat.2018.11.056',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Title missing from the research notes; resolve via the DOI before display. Ten in-use motorcycles, particulate PAHs.',
  },
  'hsieh-2018-iop': {
    kind: 'conference',
    authors: ['Hsieh', 'Chang', 'Yu', 'Wu'],
    year: 2018,
    title: 'Energy-flow and system-dynamics model of emission factors for electric vs gasoline heavy-duty scooters in Taiwan; exact title not recorded in our research notes',
    titleIsDescriptive: true,
    container: 'IOP Conference Series: Earth and Environmental Science',
    volume: '191',
    pages: '012136',
    doi: '10.1088/1755-1315/191/1/012136',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Author initials and title not in research notes. Energy-flow + system-dynamics model, heavy-duty electric vs gasoline scooters.',
  },
  'harr-2022-uclim': {
    kind: 'journal',
    authors: ['Harr L', 'Sinsel T', 'Simon H', 'Konter O', 'Dreiseitl D', 'Schulz P', 'Esper J'],
    year: 2022,
    title: 'PM2.5 exposure differences between children and adults',
    titleTranslated: '兒童與成人的PM2.5暴露差異',
    container: 'Urban Climate',
    volume: '44',
    pages: '101198',
    doi: '10.1016/j.uclim.2022.101198',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Mainz, Germany. Not a Taiwan study.',
  },

  // -------------------------------------------------------------------------
  // International bodies: IARC, WHO, HEI
  // -------------------------------------------------------------------------
  'iarc-pr213-2012': {
    kind: 'intergovernmental',
    org: IARC,
    year: 2012,
    date: '2012-06-12',
    title: 'IARC: Diesel engine exhaust carcinogenic',
    titleTranslated: '國際癌症研究機構：柴油引擎廢氣具致癌性',
    reportNumber: 'Press release No. 213',
    url: 'https://www.iarc.who.int/wp-content/uploads/2018/07/pr213_E.pdf',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'press-release-read',
    readNote: 'IARC Monographs Vol. 105 meeting, Lyon, 5–12 June 2012.',
  },
  'iarc-pr221-2013': {
    kind: 'intergovernmental',
    org: IARC,
    year: 2013,
    date: '2013-10-17',
    title: 'IARC press release No. 221 on the classification of outdoor air pollution (Monographs Vol. 109)',
    titleIsDescriptive: true,
    titleTranslated: '國際癌症研究機構第221號新聞稿：室外空氣污染之致癌性分類（專論第109卷）',
    reportNumber: 'Press release No. 221',
    url: 'https://www.iarc.who.int/wp-content/uploads/2018/07/pr221_E.pdf',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'press-release-read',
  },
  'iarc-vol120-benzene': {
    kind: 'intergovernmental',
    org: IARC,
    year: 2018,
    title: 'Benzene',
    titleTranslated: '苯',
    container: 'IARC Monographs on the Evaluation of Carcinogenic Risks to Humans',
    volume: '120',
    isbn: '978-92-832-0158-8',
    url: 'https://publications.iarc.who.int/download/120-12-Section6.pdf',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'section-read',
    readNote: 'Section 6 (Evaluation) read. Working Group met Lyon, 10–17 October 2017.',
  },
  'lancet-onc-2012-exhausts': {
    kind: 'journal',
    authors: ['Benbrahim-Tallaa L'],
    etAl: true,
    year: 2012,
    title: 'Carcinogenicity of diesel-engine and gasoline-engine exhausts and some nitroarenes',
    container: 'The Lancet Oncology',
    volume: '13',
    issue: '7',
    pages: '663-664',
    doi: '10.1016/s1470-2045(12)70280-2',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'bibliographic-record-only',
    readNote: 'PubMed record 22946126 opened; IARC Working Group summary of Vol. 105.',
  },
  'lancet-onc-2013-outdoor-air': {
    kind: 'journal',
    authors: ['Loomis D'],
    etAl: true,
    year: 2013,
    title: 'The carcinogenicity of outdoor air pollution',
    container: 'The Lancet Oncology',
    volume: '14',
    issue: '13',
    pages: '1262-1263',
    doi: '10.1016/s1470-2045(13)70487-x',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'bibliographic-record-only',
    readNote: 'PubMed record 25035875 opened; IARC Working Group summary of Vol. 109.',
  },
  'lancet-onc-2017-benzene': {
    kind: 'journal',
    authors: ['Loomis D'],
    etAl: true,
    year: 2017,
    title: 'Carcinogenicity of benzene',
    container: 'The Lancet Oncology',
    volume: '18',
    issue: '12',
    pages: '1574-1575',
    doi: '10.1016/S1470-2045(17)30832-X',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'bibliographic-record-only',
    readNote: 'PubMed record 29107678 opened.',
  },
  'who-2021-aqg': {
    kind: 'intergovernmental',
    org: WHO,
    year: 2021,
    date: '2021-09-22',
    title:
      'WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide',
    titleTranslated: '世界衛生組織全球空氣品質指引：懸浮微粒（PM2.5與PM10）、臭氧、二氧化氮、二氧化硫與一氧化碳',
    isbn: '9789240034228',
    url: 'https://www.who.int/publications/i/item/9789240034228',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'official-document-read',
    readNote: 'Full PDF via WHO IRIS (file 03). Table 0.1, Table 0.2, section 1.3.3. File 02 could not open it and tagged the values UNVERIFIED; file 03 is used.',
  },
  'who-aqg-qa': {
    kind: 'intergovernmental',
    org: WHO,
    title: 'WHO questions and answers: WHO global air quality guidelines',
    titleIsDescriptive: true,
    titleTranslated: '世界衛生組織問答：全球空氣品質指引',
    url: 'https://www.who.int/news-room/questions-and-answers/item/who-global-air-quality-guidelines',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'official-page-read',
  },
  'who-2018-child-health': {
    kind: 'intergovernmental',
    org: WHO,
    year: 2018,
    title: 'Air pollution and child health: prescribing clean air. Summary',
    titleTranslated: '空氣污染與兒童健康：開立乾淨空氣的處方（摘要版）',
    reportNumber: 'WHO/CED/PHE/18.01',
    url: 'https://www.who.int/publications/i/item/WHO-CED-PHE-18-01',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'executive-summary-read',
    readNote: 'The Summary document only; the full report was not opened.',
  },
  'who-europe-2018-noise': {
    kind: 'intergovernmental',
    org: t('世界衛生組織歐洲區署', 'WHO Regional Office for Europe'),
    year: 2018,
    title: 'Environmental noise guidelines for the European Region',
    titleTranslated: '歐洲區環境噪音指引',
    isbn: '9789289053563',
    url: 'https://www.who.int/europe/publications/i/item/9789289053563',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'official-document-read',
  },
  'hei-sr23-2022': {
    kind: 'report',
    org: t('美國健康效應研究所（HEI）', 'Health Effects Institute (HEI)'),
    authors: ['HEI Panel on the Health Effects of Long-Term Exposure to Traffic-Related Air Pollution'],
    year: 2022,
    title: 'Systematic Review and Meta-analysis of Selected Health Effects of Long-Term Exposure to Traffic-Related Air Pollution',
    titleTranslated: '長期暴露於交通相關空氣污染之特定健康效應：系統性回顧與統合分析',
    reportNumber: 'Special Report 23 (June 2022, updated 14 October 2022)',
    url: 'https://www.healtheffects.org/system/files/hei-special-report-23-executive-summary_1.pdf',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'executive-summary-read',
    readNote: 'Executive summary only. Also the source for HEI\'s own description of Special Report 17 (2010).',
  },

  // -------------------------------------------------------------------------
  // Peer-reviewed studies: health
  // -------------------------------------------------------------------------
  'thurston-2020-annats': {
    kind: 'journal',
    authors: ['Thurston GD', 'Balmes JR', 'Garcia E'],
    etAl: true,
    year: 2020,
    title: 'Outdoor Air Pollution and New-Onset Airway Disease. An Official American Thoracic Society Workshop Report',
    container: 'Annals of the American Thoracic Society',
    volume: '17',
    issue: '4',
    pages: '387-398',
    doi: '10.1513/AnnalsATS.202001-046ST',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'brook-2010-circulation': {
    kind: 'journal',
    authors: ['Brook RD', 'Rajagopalan S', 'Pope CA 3rd'],
    etAl: true,
    year: 2010,
    title: 'Particulate matter air pollution and cardiovascular disease: An update to the scientific statement from the American Heart Association',
    container: 'Circulation',
    volume: '121',
    issue: '21',
    pages: '2331-2378',
    doi: '10.1161/CIR.0b013e3181dbece1',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'guo-2019-ehp': {
    kind: 'journal',
    authors: ['Guo C', 'Hoek G', 'Chang LY', 'Bo Y', 'Lin C', 'Huang B', 'Chan TC', 'Tam T', 'Lau AKH', 'Lao XQ'],
    year: 2019,
    title:
      'Long-Term Exposure to Ambient Fine Particulate Matter (PM2.5) and Lung Function in Children, Adolescents, and Young Adults: A Longitudinal Cohort Study',
    container: 'Environmental Health Perspectives',
    volume: '127',
    issue: '12',
    doi: '10.1289/EHP5220',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'tsai-2025-pedres': {
    kind: 'journal',
    authors: ['Tsai YG', 'Chio CP', 'Yang KD', 'Lin CH', 'Yeh YP', 'Chang YJ', 'Chien JW', 'Wang SL', 'Huang SK', 'Chan CC'],
    year: 2025,
    title: 'Long-term PM2.5 exposure is associated with asthma prevalence and exhaled nitric oxide levels in children',
    container: 'Pediatric Research',
    volume: '97',
    issue: '1',
    pages: '370-377',
    doi: '10.1038/s41390-023-02977-5',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Epub January 2024; PMID 38263452.',
  },
  'hwang-2005-thorax': {
    kind: 'journal',
    authors: ['Hwang BF', 'Lee YL', 'Lin YC', 'Jaakkola JJ', 'Guo YL'],
    year: 2005,
    title: 'Traffic related air pollution as a determinant of asthma among Taiwanese school children',
    container: 'Thorax',
    volume: '60',
    issue: '6',
    pages: '467-473',
    doi: '10.1136/thx.2004.033977',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'cho-2023-chemosphere': {
    kind: 'journal',
    authors: ['Cho C-I', 'Chen J-J', 'Chuang K-J', 'Chuang H-C', 'Wang I-J', 'Chang T-Y'],
    year: 2023,
    title: 'Associations of particulate matter, gaseous pollutants, and road traffic noise with the prevalence of asthma in children',
    container: 'Chemosphere',
    volume: '338',
    pages: '139523',
    doi: '10.1016/j.chemosphere.2023.139523',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'lin-2024-jaa': {
    kind: 'journal',
    authors: ['Lin T-Y'],
    etAl: true,
    year: 2024,
    title: 'Different Impacts of Traffic-Related Air Pollution on Early-Onset and Late-Onset Asthma',
    container: 'Journal of Asthma and Allergy',
    volume: '17',
    pages: '195-208',
    doi: '10.2147/JAA.S451725',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'yang-2003-aeh': {
    kind: 'journal',
    authors: ['Yang CY', 'Chang CC', 'Chuang HY', 'Ho CK', 'Wu TN', 'Tsai SS'],
    year: 2003,
    title: 'Evidence for increased risks of preterm delivery in a population residing near a freeway in Taiwan',
    container: 'Archives of Environmental Health',
    volume: '58',
    issue: '10',
    pages: '649-654',
    doi: '10.3200/AEOH.58.10.649-654',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'jung-2015-jad': {
    kind: 'journal',
    authors: ['Jung CR', 'Lin YT', 'Hwang BF'],
    year: 2015,
    title: "Ozone, particulate matter, and newly diagnosed Alzheimer's disease: a population-based cohort study in Taiwan",
    container: "Journal of Alzheimer's Disease",
    volume: '44',
    issue: '2',
    pages: '573-584',
    doi: '10.3233/JAD-140855',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Cited ONLY in the claims policy: the abstract reports implausible magnitudes, so no numbers are used.',
  },
  'tseng-2019-jto': {
    kind: 'journal',
    authors: ['Tseng CH', 'Tsuang BJ', 'Chiang CJ', 'Ku KC', 'Tseng JS', 'Yang TY', 'Hsu KH', 'Chen KC', 'Yu SL', 'Lee WC', 'Liu TW', 'Chan CC', 'Chang GC'],
    year: 2019,
    title: 'The Relationship Between Air Pollution and Lung Cancer in Nonsmokers in Taiwan',
    container: 'Journal of Thoracic Oncology',
    volume: '14',
    issue: '5',
    pages: '784-792',
    doi: '10.1016/j.jtho.2018.12.033',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'hill-2023-nature': {
    kind: 'journal',
    authors: ['Hill W', 'Lim EL', 'Weeden CE'],
    etAl: true,
    year: 2023,
    title: 'Lung adenocarcinoma promotion by air pollutants',
    container: 'Nature',
    volume: '616',
    issue: '7955',
    pages: '159-167',
    doi: '10.1038/s41586-023-05874-3',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'full-text-read',
    readNote: 'PubMed abstract and Europe PMC full text (PMC7614604). Taiwan data: Chang Gung Research Database, 2011–2017, nine counties.',
  },
  'lo-2017-jfma': {
    kind: 'journal',
    authors: ['Lo WC', 'Shie RH', 'Chan CC', 'Lin HH'],
    year: 2017,
    title: 'Burden of disease attributable to ambient fine particulate matter exposure in Taiwan',
    container: 'Journal of the Formosan Medical Association',
    volume: '116',
    issue: '1',
    pages: '32-40',
    doi: '10.1016/j.jfma.2015.12.007',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
  },
  'sharma-kumar-2020-envint': {
    kind: 'journal',
    authors: ['Sharma A', 'Kumar P'],
    year: 2020,
    title: 'Quantification of air pollution exposure to in-pram babies and mitigation strategies',
    container: 'Environment International',
    volume: '139',
    pages: '105671',
    doi: '10.1016/j.envint.2020.105671',
    accessed: ACCESSED,
    language: 'en',
    readLevel: 'abstract-only',
    readNote: 'Guildford, UK. Not a Taiwan study.',
  },
} satisfies Record<string, SourceInput>;

export type SourceId = keyof typeof sources;
export type Source = SourceInput & { id: SourceId };

export const sourceIds = Object.keys(sources) as SourceId[];

/** Look up a source. Throws on an unknown id so a typo fails the build. */
export function getSource(id: SourceId): Source {
  const s = (sources as Record<string, SourceInput>)[id];
  if (!s) throw new Error(`[data] Unknown source id "${id}"`);
  return { id, ...s };
}

/** Best link for a source: its URL, else its DOI resolver link. */
export function sourceUrl(source: SourceId | Source): string {
  const s = typeof source === 'string' ? getSource(source) : source;
  if (s.url) return s.url;
  if (s.doi) return `https://doi.org/${s.doi}`;
  throw new Error(`[data] Source "${s.id}" has neither url nor doi`);
}

const isCjk = (s: string) => /[㐀-鿿]/.test(s);

function authorList(s: Source, locale: Locale, max = 3): string {
  const names = s.authors ?? [];
  if (names.length === 0) return s.org ? s.org[locale] : '';
  const cjk = names.every(isCjk);
  const shown = names.slice(0, max);
  const more = names.length > max || s.etAl;
  const sep = cjk ? '、' : ', ';
  const tail = more ? (locale === 'zh-TW' ? '等' : cjk ? ' et al.' : ', et al.') : '';
  return shown.join(sep) + tail;
}

/** Short in-text citation: "Chuang 等，2020" / "Chuang et al., 2020" / "環境部，2025". */
export function shortCitation(source: SourceId | Source, locale: Locale): string {
  const s = typeof source === 'string' ? getSource(source) : source;
  let who: string;
  if (s.authors && s.authors.length > 0 && s.kind !== 'government') {
    const first = s.authors[0];
    const family = isCjk(first) ? first : first.split(' ')[0];
    const several = s.authors.length > 2 || s.etAl;
    const two = s.authors.length === 2 && !s.etAl;
    const second = two ? (isCjk(s.authors[1]) ? s.authors[1] : s.authors[1].split(' ')[0]) : '';
    if (locale === 'zh-TW') who = several ? `${family}等` : two ? `${family}與${second}` : family;
    else who = several ? `${family} et al.` : two ? `${family} & ${second}` : family;
  } else {
    who = s.org ? s.org[locale] : s.title;
  }
  if (!s.year) return who;
  return locale === 'zh-TW' ? `${who}，${s.year}` : `${who}, ${s.year}`;
}

/** Full reference-list citation for a locale. */
export function formatCitation(source: SourceId | Source, locale: Locale): string {
  const s = typeof source === 'string' ? getSource(source) : source;
  const zh = locale === 'zh-TW';
  const who = authorList(s, locale);
  const year = s.year ? (zh ? `（${s.year}）` : ` (${s.year})`) : zh ? '（未載年份）' : ' (n.d.)';
  const rawTitle = s.titleIsDescriptive ? `[${s.title}]` : s.title;
  // Show the translation when the reader's language differs from the source's.
  const translated = s.titleTranslated && s.language !== locale ? s.titleTranslated : undefined;
  let title: string;
  if (zh) {
    const wrapped = isCjk(rawTitle) && !s.titleIsDescriptive ? (s.kind === 'journal' ? `〈${rawTitle}〉` : `《${rawTitle}》`) : rawTitle;
    title = translated ? `${wrapped}〔${translated}〕` : wrapped;
  } else {
    title = translated ? `${rawTitle} [${translated}]` : rawTitle;
  }
  const parts: string[] = [];
  if (s.container) {
    let c = s.container;
    if (s.volume) c += ` ${s.volume}`;
    if (s.issue) c += `(${s.issue})`;
    if (s.pages) c += `${zh ? '，' : ', '}${s.pages}`;
    parts.push(c);
  } else if (s.volume || s.pages) {
    parts.push([s.volume, s.pages].filter(Boolean).join(zh ? '，' : ', '));
  }
  // For organisations already used as the author, do not repeat the publisher.
  if (s.org && s.authors && s.authors.length > 0) parts.push(s.org[locale]);
  if (s.reportNumber) parts.push(s.reportNumber);
  if (s.date && s.kind === 'news') parts.push(s.date);
  const link = s.doi ? `https://doi.org/${s.doi}` : s.url;
  const accessed = zh ? `檢索日期：${s.accessed}` : `Accessed ${s.accessed}`;
  if (zh) {
    return `${who}${year}。${title}。${parts.length ? parts.join('，') + '。' : ''}${link ?? ''}（${accessed}）`;
  }
  return `${who}${year}. ${title}.${parts.length ? ' ' + parts.join('. ') + '.' : ''} ${link ?? ''} (${accessed}).`;
}
