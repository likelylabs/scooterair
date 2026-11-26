// The 22 cities and counties, each with how far its 2026 programme could be checked and the
// official page a reader should open. Only 'verified' and 'partly-verified' jurisdictions have
// local programmes in ./programmes/; central programmes apply everywhere.

import { t } from './l10n.ts';
import type { EconMeta, Jurisdiction, JurisdictionId } from './types.ts';

const CHECKED = '2026-11-25';
const MEID = 'https://meid.nat.gov.tw/lev/subsidy/city';
const meidLink = { label: t('經濟部產業發展署：中央及各縣市補助資訊', 'MOEA: central and local subsidy information'), url: MEID };

export const econMeta: EconMeta = {
  checkedOn: CHECKED,
  programmeYearEnd: '2026-12-31',
  nextYear: t(
    '截至 2026 年 11 月 25 日，經濟部購車補助沒有後續方案，各縣市也沒有公布 2027 年（民國 116 年）的金額；環境部 11 月 11 日預告草案擬將空污補助延長到 2030 年底（尚未定案），新北市與桃園市表示正在研擬。',
    'As of 25 November 2026 the MOEA purchase subsidy had no successor and no city or county had announced 2027 amounts; on 11 November MOENV pre-announced a draft extending its air subsidy to the end of 2030 (not final), and New Taipei and Taoyuan said they were drafting plans.',
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
    name: t('台北市', 'Taipei City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '已查閱環保局 2026 年補助計畫（2026 年 6 月 1 日修正）、QA及 11 月 20 日新聞稿；即時剩餘名額取自線上申辦系統。小型輕型的市府金額未公布。沒有算進去的：2023 年時，電動機車停在台北市的市有停車格免費（每次約省 20 元），現在是否還有請再確認。',
      'We read the Environmental Protection Department\'s 2026 plan (amended 1 June 2026), its Q&A and the 20 November press release; remaining places come from the online application system. The city amount for small light-class (小型輕型) scooters is not published. Not counted here: in 2023 Taipei let electric scooters park free in city-owned spaces (about NT$20 a time); check that it is still offered.',
    ),
    officialLinks: [
      { label: t('台北市環保局：2024 至 2026 年電動機車補助', 'Taipei DEP: electric scooter subsidy 2024–2026'), url: 'https://www.dep.gov.taipei/News_Content.aspx?n=CE8746C01243996C&sms=18E59B21BD8494A1&s=9B373391D9A680F0' },
      { label: t('線上申辦系統（2026 年 12 月 31 日起改為 www.subsidy.gov.taipei）', 'Online application (moves to www.subsidy.gov.taipei from 31 December 2026)'), url: 'https://www.envimac.com.tw/MotorSubsidy/' },
    ],
    checkedOn: CHECKED,
    research: ['taipei', 'maintenance-fees#parking-taipei'],
  },
  'new-taipei': {
    id: 'new-taipei',
    name: t('新北市', 'New Taipei City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '已查閱環保局 2026 年補助金額一覽表與首頁剩餘名額。早鳥加碼已額滿；早鳥、雙汰舊加碼能否與中低收入戶金額併領，計畫未寫明。',
      'We read the Environmental Protection Department\'s 2026 amount table and the remaining-slot counters on its home page. The early-bird add-on is full; the plan does not say whether the add-ons stack with the low-income amounts.',
    ),
    officialLinks: [
      { label: t('新北市機車汰舊換新補助網：2026 年補助金額', 'New Taipei subsidy site: 2026 amounts'), url: 'https://motor.ntpc.gov.tw/Home/News?id=1132' },
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
      '已查閱環保局 2026 年公告，但基本補助只寫「最高」金額，也未依車種分級；名額是否用完、能否與中央補助併領都無法確認。',
      'We read the Department of Environmental Protection\'s 2026 notice, but base amounts are given only as maximums and are not split by vehicle class; whether places remain and whether the money stacks with central subsidies could not be confirmed.',
    ),
    officialLinks: [
      { label: t('桃園市環保局：2026 年電動機車補助公告', 'Taoyuan DEP: 2026 electric scooter subsidy notice'), url: 'https://recycle.tyoem.gov.tw/A_news_Page.aspx?id=368' },
      { label: t('桃園市線上申請系統', 'Taoyuan online application system'), url: 'https://tydeposs.cc/' },
    ],
    remoteDistricts: t('復興區', 'Fuxing District'),
    checkedOn: CHECKED,
    research: ['taoyuan'],
  },
  taichung: {
    id: 'taichung',
    name: t('台中市', 'Taichung City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '第二輪已查閱環保局 2026 年計畫（6 月 29 日修正）與補助金額表。原始公告與是否已用罄未能確認；經費依申請順序核撥至用完。',
      'In the second round we read the bureau\'s 2026 plan (amended 29 June) and amount table. The original announcement and whether the budget has run out could not be checked; money is paid in order until it runs out.',
    ),
    officialLinks: [
      { label: t('台中市環保局補助網站：2026 年補助計畫修正公告', 'Taichung subsidy site: 2026 plan amendment notice'), url: 'https://green.epb.taichung.gov.tw/page/news/show.aspx?num=1865' },
      { label: t('台中市環保局補助網站（登入後線上申請；請留意預算用完的公告）', 'Taichung subsidy site (sign in to apply online; watch for notices that the budget has run out)'), url: 'https://green.epb.taichung.gov.tw/' },
      { label: t('台中市環保局：115 年度補助公告', 'Taichung EPB: 2026 subsidy notice'), url: 'https://www.epb.taichung.gov.tw/3218587/post' },
    ],
    checkedOn: CHECKED,
    research: ['taichung-r2'],
  },
  tainan: {
    id: 'tainan',
    name: t('台南市', 'Tainan City'),
    kind: 'special-municipality',
    status: 'verified',
    statusNote: t(
      '已查閱環保局 2026 年補助方案PDF（含修正對照表）。預算5,830萬500元是否已用完無法查證；市府申請網站網址未能確認。',
      'We read the Environmental Protection Bureau\'s 2026 programme PDF (with its amendment table). Whether the NT$58,300,500 budget has run out could not be checked, and the city\'s claim website could not be confirmed.',
    ),
    officialLinks: [
      { label: t('台南市 2026 年補助方案（PDF）', 'Tainan 2026 programme (PDF)'), url: 'https://w3fs.tainan.gov.tw/002/FS01/82/relfile/11857/8827147/c5ee4820-89d6-483d-8b2b-79b9d415ea30.pdf' },
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
      '已查閱環保局 2026 年公告與附表；環保局網頁顯示補助金額已於 2026 年 8 月 11 日用罄，剩餘0元。',
      'We read the Environmental Protection Bureau\'s 2026 notice and schedule; its web page shows the money ran out on 11 August 2026 with NT$0 left.',
    ),
    officialLinks: [
      { label: t('高雄市環保局：2026 年補助申請數量（已用罄）', 'Kaohsiung EPB: 2026 application totals (money used up)'), url: 'https://khepa.kcg.gov.tw/01_news_page.asp?news=20260413172251989' },
      { label: t('高雄市 2026 年補助方案公告（PDF）', 'Kaohsiung 2026 programme notice (PDF)'), url: 'https://khepa.kcg.gov.tw/upload/Case120260331101942.pdf' },
    ],
    checkedOn: CHECKED,
    research: ['kaohsiung'],
  },
  keelung: {
    id: 'keelung',
    name: t('基隆市', 'Keelung City'),
    kind: 'provincial-city',
    status: 'partly-verified',
    statusNote: t(
      '金額取自經濟部縣市補助表（2026 年 7 月 21 日版）；補助期間只到 2026 年 11 月 30 日，每年名額只有個位數到一百多名，剩餘名額未查證，可能已經用完。另一個公益青年免費電動機車方案自 2026 年 1 月起暫停。',
      'Amounts come from the MOEA county table (21 July 2026); the programme runs only to 30 November 2026 with a handful to about 130 places a year; remaining places were not checked and may already be used up. The separate free scooter scheme for young volunteers has been suspended since January 2026.',
    ),
    officialLinks: [{ label: t('基隆市環保局官網', 'Keelung EPB website'), url: 'https://www.klepb.gov.tw' }, meidLink],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
  'hsinchu-city': {
    id: 'hsinchu-city',
    name: t('新竹市', 'Hsinchu City'),
    kind: 'provincial-city',
    status: 'partly-verified',
    statusNote: t(
      '只有汰舊換購補助；市府金額取自經濟部縣市補助表。市府新聞稿寫的22,600至50,500元已經包含中央補助，試算另外加上中央補助，所以兩個數字不一樣。中低收入戶的市府金額沒有分開寫，沒有算進去；每年名額很少。',
      'Scrap-and-replace only; city amounts come from the MOEA county table. The NT$22,600–50,500 in the city\'s press release already includes central money; the calculator adds central money separately, so the two are not the same figure. The low-income city amount is not given separately and is not counted; places are few each year.',
    ),
    officialLinks: [{ label: t('新竹市政府官網', 'Hsinchu City Government website'), url: 'https://www.hccg.gov.tw' }, meidLink],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
  'hsinchu-county': {
    id: 'hsinchu-county',
    name: t('新竹縣', 'Hsinchu County'),
    kind: 'county',
    status: 'partly-verified',
    statusNote: t('金額取自經濟部縣市補助表；我們沒能從縣環保局網站確認。每年名額有限，剩下多少沒有查證。', 'Amounts come from the MOEA county table; we could not confirm them on the county bureau\'s own site. Places are limited each year and how many remain was not checked.'),
    officialLinks: [{ label: t('新竹縣環保局官網', 'Hsinchu County EPB website'), url: 'https://www.hccepb.gov.tw' }, meidLink],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
  miaoli: {
    id: 'miaoli',
    name: t('苗栗縣', 'Miaoli County'),
    kind: 'county',
    status: 'partly-verified',
    statusNote: t('經濟部縣市補助表只列一項：汰舊換購加碼2,500元（400名）；沒有新購補助。', 'The MOEA county table lists one item only: a NT$2,500 scrap-and-replace top-up (400 places); no new-purchase money.'),
    officialLinks: [{ label: t('苗栗縣環保局', 'Miaoli EPB'), url: 'https://www.mlepb.gov.tw' }, meidLink],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
  changhua: {
    id: 'changhua',
    name: t('彰化縣', 'Changhua County'),
    kind: 'county',
    status: 'partly-verified',
    statusNote: t('換購12,000元、新購5,000元取自經濟部縣市補助表並有媒體引述縣府；縣府公告與名額未找到。', 'Replacement NT$12,000 and new purchase NT$5,000 come from the MOEA county table, with media quoting the county; the county notice and quota were not found.'),
    officialLinks: [{ label: t('彰化縣環保局', 'Changhua EPB'), url: 'https://www.chepb.gov.tw' }, meidLink],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
  nantou: {
    id: 'nantou',
    name: t('南投縣', 'Nantou County'),
    kind: 'county',
    status: 'partly-verified',
    statusNote: t('換購16,000元、新購5,000元取自經濟部縣市補助表與聯合報；縣府公告、申請期限與名額未找到。', 'Replacement NT$16,000 and new purchase NT$5,000 come from the MOEA county table and UDN; the county notice, deadline and quota were not found.'),
    officialLinks: [{ label: t('南投縣環保局', 'Nantou EPB'), url: 'https://www.ntepb.gov.tw' }, meidLink],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
  yunlin: {
    id: 'yunlin',
    name: t('雲林縣', 'Yunlin County'),
    kind: 'county',
    status: 'verified',
    statusNote: t('已查閱環保局公告與經濟部縣市補助表；每年名額只有三百多名，剩下多少沒有查證；2026 至 2028 年的完整計畫放在申請網站上，我們沒能打開確認。', 'We read the bureau\'s notice and the MOEA county table; places are only about 350 a year and how many remain was not checked; the full 2026–2028 plan is on the application site, which we could not open to confirm.'),
    officialLinks: [
      { label: t('雲林縣環保局：2026 年機車補助', 'Yunlin EPB: 2026 scooter subsidies'), url: 'https://www.ylepb.gov.tw/latestevent/index-1.asp?Parser=9%2C3%2C16%2C%2C%2C%2C1946' },
      { label: t('雲林縣補助申請網站', 'Yunlin application site'), url: 'https://ylepb-rmei.easylife.net.tw/' },
    ],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
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
  yilan: {
    id: 'yilan',
    name: t('宜蘭縣', 'Yilan County'),
    kind: 'county',
    status: 'verified',
    statusNote: t('已查閱環保局 2026 年補助計畫PDF；新聞的27,300與19,000元是中低收入戶重型含中央補助的最佳情況。剩餘預算未查證。', 'We read the bureau\'s 2026 plan PDF; the press figures of NT$27,300 and 19,000 are the best case (low income, heavy class) including central money. Remaining budget not checked.'),
    officialLinks: [
      { label: t('宜蘭縣 2026 年補助計畫（PDF）', 'Yilan 2026 plan (PDF)'), url: 'https://www.ilepb.gov.tw/OpenAttch_id.ashx?guid=2d5c813f-06cb-41c7-a6a8-b86c74d7d1bf' },
      { label: t('宜蘭縣補助申請系統', 'Yilan application system'), url: 'https://ilepb-subsidy.easylife.net.tw' },
    ],
    checkedOn: CHECKED,
    research: ['counties-north-central-r2'],
  },
  hualien: notVerified(
    'hualien',
    t('花蓮縣', 'Hualien County'),
    'county',
    t(
      '環保局網站最新的是 2025 年注意事項（已過期），未找到 2026 年方案，但也不能證明沒有；不列入任何地方補助。',
      'The newest notice on the Environmental Protection Bureau site is for 2025 (expired); no 2026 programme was found, which does not prove there is none. No local money is counted.',
    ),
    ['counties-south-east-islands', 'counties-remaining-r2'],
    [
      { label: t('花蓮縣環保局：表格下載', 'Hualien EPB: forms'), url: 'https://www.hlepb.gov.tw/cht/index.php?code=list&ids=131' },
      { label: t('花蓮縣環保局首頁「重要業務→電動機車補助」（或電話03-8239935）', 'Hualien EPB home page, electric scooter subsidy section (or phone 03-8239935)'), url: 'https://www.hlepb.gov.tw/cht/index.php' },
    ],
  ),
  taitung: notVerified(
    'taitung',
    t('台東縣', 'Taitung County'),
    'county',
    t('我們在 2026 年 11 月 25 日查證時，沒辦法確認台東縣今年的補助，經濟部的縣市補助表也沒有列；所以這裡不算任何台東縣的錢。想知道有沒有，請打電話問台東縣環保局。', 'When we checked on 25 November 2026 we could not confirm a Taitung County subsidy for this year, and the MOEA county table does not list one, so no Taitung money is counted here. To find out, phone the Taitung County Environmental Protection Bureau.'),
    ['counties-south-east-islands', 'counties-remaining-r2'],
    [{ label: t('台東縣環保局官網', 'Taitung EPB website'), url: 'https://ttepb.taitung.gov.tw/' }],
  ),
  penghu: notVerified(
    'penghu',
    t('澎湖縣', 'Penghu County'),
    'county',
    t('我們在 2026 年 11 月 25 日查證時，沒辦法確認澎湖縣今年的補助，經濟部的縣市補助表也沒有列；所以這裡不算任何澎湖縣的錢。想知道有沒有，請打電話問澎湖縣環保局。', 'When we checked on 25 November 2026 we could not confirm a Penghu County subsidy for this year, and the MOEA county table does not list one, so no Penghu money is counted here. To find out, phone the Penghu County Environmental Protection Bureau.'),
    ['counties-south-east-islands', 'counties-remaining-r2'],
    [{ label: t('澎湖縣環保局官網', 'Penghu EPB website'), url: 'https://www.phepb.gov.tw/' }],
  ),
  kinmen: {
    id: 'kinmen',
    name: t('金門縣', 'Kinmen County'),
    kind: 'county',
    status: 'verified',
    statusNote: t(
      '已查閱環保局 2026 年補助要點與附表。購車與報廢須在 2026 年 11 月 30 日前完成；要點排除曾申請環境部相關補助者，能否與環境部獎勵併領不明。',
      'We read the Environmental Protection Bureau\'s 2026 guidelines and schedule. Purchase and scrapping must be completed by 30 November 2026; the guidelines exclude anyone who has applied for related MOENV subsidies, so stacking with the MOENV reward is unclear.',
    ),
    officialLinks: [{ label: t('金門縣環保局：2026 年補助要點', 'Kinmen EPB: 2026 guidelines'), url: 'https://kepb.kinmen.gov.tw/cp.aspx?n=D39D1B9DF3A45294' }],
    checkedOn: CHECKED,
    research: ['counties-south-east-islands'],
  },
  lienchiang: notVerified(
    'lienchiang',
    t('連江縣', 'Lienchiang County (Matsu)'),
    'county',
    t('我們在 2026 年 11 月 25 日查證時，沒辦法確認連江縣今年的補助，經濟部的縣市補助表也沒有列；所以這裡不算任何連江縣的錢。想知道有沒有，請打電話問連江縣政府。', 'When we checked on 25 November 2026 we could not confirm a Lienchiang County subsidy for this year, and the MOEA county table does not list one, so no Lienchiang money is counted here. To find out, phone the Lienchiang County Government.'),
    ['counties-south-east-islands', 'counties-remaining-r2'],
    [{ label: t('連江縣政府官網', 'Lienchiang County Government website'), url: 'https://www.matsu.gov.tw/' }],
  ),
};
