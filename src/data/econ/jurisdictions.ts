// The 22 cities and counties, each with how far its 2026 programme could be checked and the
// official page a reader should open. Only 'verified' and 'partly-verified' jurisdictions have
// local programmes in ./programmes/; central programmes apply everywhere.

import { t } from '../types.ts';
import type { EconMeta, Jurisdiction, JurisdictionId } from './types.ts';

const CHECKED = '2026-11-25';
const MEID = 'https://meid.nat.gov.tw/lev/subsidy/city';
const meidLink = { label: t('經濟部產業發展署：中央及各縣市補助資訊', 'MOEA: central and local subsidy information'), url: MEID };

export const econMeta: EconMeta = {
  checkedOn: CHECKED,
  programmeYearEnd: '2026-12-31',
  nextYear: t(
    '截至2026年11月25日，中央與各縣市都尚未公布2027年（民國116年）的電動機車補助；桃園市表示正以問卷研擬116年方案。',
    'As of 25 November 2026 no central or local electric scooter subsidy for 2027 had been announced; Taoyuan said it was drafting a 2027 programme using a survey.',
  ),
  horizonMonths: 60,
};

const notVerified = (
  id: JurisdictionId,
  name: Jurisdiction['name'],
  kind: Jurisdiction['kind'],
  statusNote: Jurisdiction['statusNote'],
  research: string[],
  extraLinks: Jurisdiction['officialLinks'] = [],
): Jurisdiction => ({
  id,
  name,
  kind,
  status: 'not-verified',
  statusNote,
  officialLinks: [...extraLinks, meidLink],
  checkedOn: CHECKED,
  research,
});

export const jurisdictions: Record<JurisdictionId, Jurisdiction> = {
  taipei: {
    id: 'taipei',
    name: t('臺北市', 'Taipei City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '已查閱環保局115年補助計畫（115年6月1日修正）、QA及11月20日新聞稿；即時剩餘名額取自線上申辦系統。小型輕型的市府金額未公布。',
      'We read the Environmental Protection Department\'s 2026 plan (amended 1 June 2026), its Q&A and the 20 November press release; remaining slots come from the online application system. The city amount for small-light (小型輕型) scooters is not published.',
    ),
    officialLinks: [
      { label: t('臺北市環保局：113年至115年電動機車補助', 'Taipei DEP: electric scooter subsidy 2024–2026'), url: 'https://www.dep.gov.taipei/News_Content.aspx?n=CE8746C01243996C&sms=18E59B21BD8494A1&s=9B373391D9A680F0' },
      { label: t('線上申辦系統（115年12月31日起改為 www.subsidy.gov.taipei）', 'Online application (moves to www.subsidy.gov.taipei from 31 December 2026)'), url: 'https://www.envimac.com.tw/MotorSubsidy/' },
    ],
    checkedOn: CHECKED,
    research: ['taipei'],
  },
  'new-taipei': {
    id: 'new-taipei',
    name: t('新北市', 'New Taipei City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '已查閱環保局115年補助金額一覽表與首頁剩餘名額。早鳥加碼已額滿；早鳥、雙汰舊加碼能否與中低收入戶金額併領，計畫未寫明。',
      'We read the Environmental Protection Department\'s 2026 amount table and the remaining-slot counters on its home page. The early-bird add-on is full; the plan does not say whether the add-ons stack with the low-income amounts.',
    ),
    officialLinks: [
      { label: t('新北市機車汰舊換新補助網：115年補助金額', 'New Taipei subsidy site: 2026 amounts'), url: 'https://motor.ntpc.gov.tw/Home/News?id=1132' },
      { label: t('新北市機車汰舊換新補助網（申請）', 'New Taipei subsidy site (apply)'), url: 'https://motor.ntpc.gov.tw/' },
    ],
    checkedOn: CHECKED,
    research: ['new-taipei'],
  },
  taoyuan: {
    id: 'taoyuan',
    name: t('桃園市', 'Taoyuan City'),
    kind: 'special-municipality',
    status: 'partly-verified',
    statusNote: t(
      '已查閱環保局115年公告，但基本補助只寫「最高」金額，也未依車種分級；名額是否用完、能否與中央補助併領都無法確認。',
      'We read the Department of Environmental Protection\'s 2026 notice, but base amounts are given only as maximums and are not split by vehicle class; whether places remain and whether the money stacks with central subsidies could not be confirmed.',
    ),
    officialLinks: [
      { label: t('桃園市環保局：115年電動機車補助公告', 'Taoyuan DEP: 2026 electric scooter subsidy notice'), url: 'https://recycle.tyoem.gov.tw/A_news_Page.aspx?id=368' },
      { label: t('桃園市線上申請系統', 'Taoyuan online application system'), url: 'https://tydeposs.cc/' },
    ],
    remoteDistricts: t('復興區', 'Fuxing District'),
    checkedOn: CHECKED,
    research: ['taoyuan'],
  },
  taichung: notVerified(
    'taichung',
    t('臺中市', 'Taichung City'),
    'special-municipality',
    t(
      '環保局網站與相關報導都無法連上，115年補助金額未能查證；在官方計畫讀到之前，試算不列入任何臺中市地方補助。',
      'The Environmental Protection Bureau site and the press reports could not be reached, so 2026 amounts are unverified; no Taichung local money is counted until the official plan is read.',
    ),
    ['taichung'],
    [{ label: t('臺中市環保局', 'Taichung Environmental Protection Bureau'), url: 'https://www.epb.taichung.gov.tw/' }],
  ),
  tainan: {
    id: 'tainan',
    name: t('臺南市', 'Tainan City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '已查閱環保局115年補助方案PDF（含修正對照表）。預算5,830萬500元是否已用完無法查證；市府申請網站網址未能確認。',
      'We read the Environmental Protection Bureau\'s 2026 programme PDF (with its amendment table). Whether the NT$58,300,500 budget has run out could not be checked, and the city\'s claim website could not be confirmed.',
    ),
    officialLinks: [
      { label: t('臺南市115年補助方案（PDF）', 'Tainan 2026 programme (PDF)'), url: 'https://w3fs.tainan.gov.tw/002/FS01/82/relfile/11857/8827147/c5ee4820-89d6-483d-8b2b-79b9d415ea30.pdf' },
      meidLink,
    ],
    remoteDistricts: t('左鎮區、楠西區、南化區、龍崎區', 'Zuozhen, Nanxi, Nanhua and Longqi districts'),
    checkedOn: CHECKED,
    research: ['tainan', 'other-levers'],
  },
  kaohsiung: {
    id: 'kaohsiung',
    name: t('高雄市', 'Kaohsiung City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '已查閱環保局115年公告與附表；環保局網頁顯示補助金額已於2026年8月11日用罄，剩餘0元。',
      'We read the Environmental Protection Bureau\'s 2026 notice and schedule; its web page shows the money ran out on 11 August 2026 with NT$0 left.',
    ),
    officialLinks: [
      { label: t('高雄市環保局：115年補助申請數量（已用罄）', 'Kaohsiung EPB: 2026 application totals (money used up)'), url: 'https://khepa.kcg.gov.tw/01_news_page.asp?news=20260413172251989' },
      { label: t('高雄市115年補助方案公告（PDF）', 'Kaohsiung 2026 programme notice (PDF)'), url: 'https://khepa.kcg.gov.tw/upload/Case120260331101942.pdf' },
    ],
    checkedOn: CHECKED,
    research: ['kaohsiung'],
  },
  keelung: notVerified(
    'keelung',
    t('基隆市', 'Keelung City'),
    'provincial-city',
    t('115年一般補助未能查到，相關報導也無法開啟；不列入任何地方補助。', 'No 2026 general programme could be found and the press reports could not be opened; no local money is counted.'),
    ['counties-north-central'],
  ),
  'hsinchu-city': notVerified(
    'hsinchu-city',
    t('新竹市', 'Hsinchu City'),
    'provincial-city',
    t('報導中的金額無法開啟查證，也不清楚是否已含中央補助；不列入任何地方補助。', 'The reported amounts could not be opened and it is unclear whether they include central money; no local money is counted.'),
    ['counties-north-central'],
  ),
  'hsinchu-county': notVerified(
    'hsinchu-county',
    t('新竹縣', 'Hsinchu County'),
    'county',
    t('只有第三方整理的金額，無法查證；不列入任何地方補助。', 'Only a third-party table was found and it could not be checked; no local money is counted.'),
    ['counties-north-central'],
  ),
  miaoli: notVerified(
    'miaoli',
    t('苗栗縣', 'Miaoli County'),
    'county',
    t('加碼報導無法開啟查證；不列入任何地方補助。', 'The top-up report could not be opened; no local money is counted.'),
    ['counties-north-central'],
  ),
  changhua: notVerified(
    'changhua',
    t('彰化縣', 'Changhua County'),
    'county',
    t('報導中的縣府加碼無法開啟查證；不列入任何地方補助。', 'The reported county top-up could not be opened; no local money is counted.'),
    ['counties-north-central'],
  ),
  nantou: notVerified(
    'nantou',
    t('南投縣', 'Nantou County'),
    'county',
    t('報導中的縣府補助無法開啟查證；不列入任何地方補助。', 'The reported county subsidy could not be opened; no local money is counted.'),
    ['counties-north-central'],
  ),
  yunlin: notVerified(
    'yunlin',
    t('雲林縣', 'Yunlin County'),
    'county',
    t('環保局網站無法連上，金額未能查證；不列入任何地方補助。', 'The Environmental Protection Bureau site could not be reached, so amounts are unverified; no local money is counted.'),
    ['counties-north-central'],
    [{ label: t('雲林縣環保局', 'Yunlin Environmental Protection Bureau'), url: 'https://www.ylepb.gov.tw/latestevent/index-1.asp?Parser=9%2C3%2C16%2C%2C%2C%2C1946' }],
  ),
  'chiayi-city': {
    id: 'chiayi-city',
    name: t('嘉義市', 'Chiayi City'),
    kind: 'provincial-city',
    status: 'partly-verified',
    statusNote: t(
      '換購12,000元、新購8,000元取自經濟部產業發展署的縣市補助表；中低收入戶與「學生家庭」加碼只見於新聞稿合計，未列入試算。',
      'Scrap-and-replace NT$12,000 and new purchase NT$8,000 come from the MOEA\'s county table; the low-income and student-household top-ups appear only as totals in a press release and are not counted.',
    ),
    officialLinks: [meidLink],
    checkedOn: CHECKED,
    research: ['counties-south-east-islands'],
  },
  'chiayi-county': {
    id: 'chiayi-county',
    name: t('嘉義縣', 'Chiayi County'),
    kind: 'county',
    status: 'partly-verified',
    statusNote: t(
      '換購14,000元、新購8,000元取自經濟部產業發展署的縣市補助表；縣府網站無法連上，中低收入戶金額未公布。',
      'Scrap-and-replace NT$14,000 and new purchase NT$8,000 come from the MOEA\'s county table; the county site could not be reached and low-income amounts are not published.',
    ),
    officialLinks: [meidLink],
    checkedOn: CHECKED,
    research: ['counties-south-east-islands'],
  },
  pingtung: {
    id: 'pingtung',
    name: t('屏東縣', 'Pingtung County'),
    kind: 'county',
    status: 'partly-verified',
    statusNote: t(
      '換購6,000元、新購3,000元取自經濟部產業發展署的縣市補助表（媒體另報新購4,000元，試算採較低的官方表列金額）；偏鄉加碼的鄉鎮名單不明，未列入。',
      'Scrap-and-replace NT$6,000 and new purchase NT$3,000 come from the MOEA\'s county table (a news report says NT$4,000 for new purchases; we use the lower official figure); the remote-area top-up is left out because the list of townships is unknown.',
    ),
    officialLinks: [meidLink],
    checkedOn: CHECKED,
    research: ['counties-south-east-islands'],
  },
  yilan: notVerified(
    'yilan',
    t('宜蘭縣', 'Yilan County'),
    'county',
    t('報導中的金額無法開啟查證，縣府與中央的分攤也不清楚；不列入任何地方補助。', 'The reported amounts could not be opened and the county/central split is unclear; no local money is counted.'),
    ['counties-north-central'],
  ),
  hualien: notVerified(
    'hualien',
    t('花蓮縣', 'Hualien County'),
    'county',
    t(
      '環保局網站最新的是114年度注意事項（已過期），未找到115年方案，但也不能證明沒有；不列入任何地方補助。',
      'The newest notice on the Environmental Protection Bureau site is for 2025 (expired); no 2026 programme was found, which does not prove there is none. No local money is counted.',
    ),
    ['counties-south-east-islands'],
    [{ label: t('花蓮縣環保局：表格下載', 'Hualien EPB: forms'), url: 'https://www.hlepb.gov.tw/cht/index.php?code=list&ids=131' }],
  ),
  taitung: notVerified(
    'taitung',
    t('臺東縣', 'Taitung County'),
    'county',
    t('縣府與環保局網站都無法連上，經濟部的縣市表也未列；不列入任何地方補助。', 'The county and bureau sites could not be reached and the MOEA county table does not list it; no local money is counted.'),
    ['counties-south-east-islands'],
  ),
  penghu: notVerified(
    'penghu',
    t('澎湖縣', 'Penghu County'),
    'county',
    t('縣府與環保局網站都無法連上，經濟部的縣市表也未列；不列入任何地方補助。', 'The county and bureau sites could not be reached and the MOEA county table does not list it; no local money is counted.'),
    ['counties-south-east-islands'],
  ),
  kinmen: {
    id: 'kinmen',
    name: t('金門縣', 'Kinmen County'),
    kind: 'county',
    status: 'verified',
    statusNote: t(
      '已查閱環保局115年補助要點與附表。購車與報廢須在2026年11月30日前完成；要點排除曾申請環境部相關補助者，能否與環境部獎勵併領不明。',
      'We read the Environmental Protection Bureau\'s 2026 guidelines and schedule. Purchase and scrapping must be completed by 30 November 2026; the guidelines exclude anyone who has applied for related MOENV subsidies, so stacking with the MOENV reward is unclear.',
    ),
    officialLinks: [{ label: t('金門縣環保局：115年補助要點', 'Kinmen EPB: 2026 guidelines'), url: 'https://kepb.kinmen.gov.tw/cp.aspx?n=D39D1B9DF3A45294' }],
    checkedOn: CHECKED,
    research: ['counties-south-east-islands'],
  },
  lienchiang: notVerified(
    'lienchiang',
    t('連江縣', 'Lienchiang County (Matsu)'),
    'county',
    t('縣府網站無法連上，經濟部的縣市表也未列；不列入任何地方補助。', 'The county site could not be reached and the MOEA county table does not list it; no local money is counted.'),
    ['counties-south-east-islands'],
  ),
};
