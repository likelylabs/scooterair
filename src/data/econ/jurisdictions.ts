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
      '已查閱環保局 2026 年公告（2026 年 11 月 26 日再次核對）：換購最高15,000元、新購最高4,000元，一般補助共6,000名，2027 年 1 月 10 日前申請。公告只寫「最高」金額，所以試算把它當上限。還剩多少名額、能不能和中央補助一起領，請上線上申請系統或打電話問環保局。',
      'We read the Department of Environmental Protection\'s 2026 notice (checked again on 26 November 2026): up to NT$15,000 to scrap and replace, up to NT$4,000 for a new scooter, 6,000 general places, apply by 10 January 2027. The notice gives only maximums, so the calculator shows them as ceilings. For places left and whether it stacks with central money, use the online system or phone the bureau.',
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
    status: 'verified',
    statusNote: t(
      '已查閱環保局 2026 年補助計畫原文（2026 年 11 月 26 日）。買車、掛牌和報廢都要在 2026 年 11 月 30 日前完成，12 月 15 日前把文件寄到環保局。每年名額只有個位數到一百多名，還剩多少沒有公布，可能已經用完；買車前請先打 02-24660327 問。另一個公益青年免費電動機車方案自 2026 年 1 月起暫停。',
      'We read the bureau\'s 2026 plan itself (26 November 2026). Buying, plating and scrapping must all be done by 30 November 2026, and the papers must reach the bureau by 15 December. There are only a handful to about 130 places a year and how many are left is not published, so they may be gone; phone (02) 2466-0327 before you buy. The separate free scooter scheme for young volunteers has been suspended since January 2026.',
    ),
    officialLinks: [
      { label: t('基隆市 2026 年電動機車補助計畫（PDF）', 'Keelung 2026 electric scooter subsidy plan (PDF)'), url: 'https://www.klepb.klcg.gov.tw/wSite/public/Attachment/02605/f1771897904865.pdf' },
      { label: t('基隆市環保局官網', 'Keelung EPB website'), url: 'https://www.klepb.klcg.gov.tw/' },
      meidLink,
    ],
    checkedOn: '2026-11-26',
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
    statusNote: t('金額取自經濟部縣市補助表（2026 年 7 月 21 日版）；縣環保局的網站我們打不開，沒能從那裡再確認。每年名額有限，還剩多少請打電話問新竹縣環保局：03-5519345 轉 5209。', 'Amounts come from the MOEA county table (21 July 2026); the county bureau\'s own site would not open for us, so we could not confirm them there. Places are limited each year; to ask how many are left, phone the Hsinchu County EPB on 03-5519345 ext. 5209.'),
    officialLinks: [meidLink],
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
    status: 'verified',
    statusNote: t('已查閱環保局 2026 年補助計畫原文（2026 年 11 月 26 日）：換購12,000元、新購5,000元，報廢、買車和掛牌都要在 2026 年內完成，2027 年 1 月 10 日前申請。沒有寫名額，照申請先後發，預算用完就停。', 'We read the bureau\'s 2026 plan itself (26 November 2026): NT$12,000 to scrap and replace, NT$5,000 for a new scooter; scrap, buy and plate within 2026 and apply by 10 January 2027. No number of places is set: money is paid in order of application until the budget runs out.'),
    officialLinks: [
      { label: t('彰化縣 2026 年補助計畫（PDF）', 'Changhua 2026 subsidy plan (PDF)'), url: 'https://www.chepb.gov.tw/GetFile.ashx?ID=5172896083492455725' },
      { label: t('彰化縣環保局', 'Changhua EPB'), url: 'https://www.chepb.gov.tw' },
    ],
    checkedOn: '2026-11-26',
    research: ['counties-north-central-r2'],
  },
  nantou: {
    id: 'nantou',
    name: t('南投縣', 'Nantou County'),
    kind: 'county',
    status: 'partly-verified',
    statusNote: t('換購16,000元、新購5,000元、單純報廢2,500元，取自環保局 2026 年 4 月 8 日的新聞和經濟部縣市補助表。單純報廢的機車須是 2007 年 6 月 30 日以前出廠的燃油機車。環保局沒有公布申請期限和名額，申請前請打補助專線問：049-2238573（總機 049-2237530）。', 'NT$16,000 to scrap and replace, NT$5,000 for a new scooter and NT$2,500 to scrap only, from the bureau\'s news item of 8 April 2026 and the MOEA county table. To scrap only, the scooter must be a petrol one built by 30 June 2007. The bureau has not published a deadline or number of places; phone its subsidy line, (049) 223-8573 (switchboard (049) 223-7530), before you apply.'),
    officialLinks: [
      { label: t('南投縣環保局：2026 年補助新聞', 'Nantou EPB: 2026 subsidy news'), url: 'https://www.ntepb.gov.tw/news/Details.aspx?Parser=9,3,19,,,,15939' },
      meidLink,
    ],
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
      '換購12,000元、新購8,000元取自經濟部產業發展署的縣市補助表。市府 2026 年 2 月 23 日的新聞稿說，加碼到 2026 年 12 月 31 日或經費用完為止；中低收入戶和「學生家庭」可以多領，但新聞稿只寫加總後的金額，所以試算沒有算進去，符合的人請向市府環保局問清楚。',
      'Scrap-and-replace NT$12,000 and new purchase NT$8,000 come from the MOEA\'s county table. The city\'s press release of 23 February 2026 says the money runs to 31 December 2026 or until it is used up; low-income and student households can get more, but the release gives only totals, so the calculator leaves that out. If you qualify, ask the city\'s Environmental Protection Bureau.',
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
      '換購14,000元、新購8,000元取自經濟部產業發展署的縣市補助表。中央社 2026 年 4 月 13 日報導縣府說明：受理到 2027 年 1 月 8 日，要報廢的機車須在 2026 年 12 月 31 日前完成報廢，經費有限。縣府網站我們打不開。縣府沒有公布中低收入戶另外的金額；中低收入戶不必線上預約。想知道有沒有多的錢，請打 05-3622234 問。',
      'Scrap-and-replace NT$14,000 and new purchase NT$8,000 come from the MOEA\'s county table. CNA reported the county\'s release on 13 April 2026: claims until 8 January 2027, the scooter you scrap must be scrapped by 31 December 2026, money limited. The county site would not open for us. The county has not published a separate amount for low-income households; they need not book online. To ask whether there is more money, phone 05-3622234.',
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
      '換購6,000元、新購3,000元取自經濟部產業發展署的縣市補助表（媒體另報新購4,000元，試算採較低的官方表列金額）。偏遠鄉鎮可以多領，但 2026 年的鄉鎮名單我們沒找到，所以沒有算進去；住在山區或離島鄉鎮的人，請打補助專線 08-7352068 問。',
      'Scrap-and-replace NT$6,000 and new purchase NT$3,000 come from the MOEA\'s county table (a news report says NT$4,000 for new purchases; we use the lower official figure). Remote townships can get more, but we could not find the 2026 list of townships, so it is not counted; if you live in a mountain or island township, phone the subsidy line on 08-7352068.',
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
      '我們找不到花蓮縣 2026 年的機車補助：環保局網站和經濟部的表上，最新的都是 2025 年的（已經結束）。這不代表一定沒有。中央的補助全國都能領，試算已經算進去；縣裡有沒有加碼，請打電話問花蓮縣環保局：03-8239935。',
      'We could not find a Hualien County scooter subsidy for 2026: on the bureau\'s site and the MOEA table the newest one is for 2025, which has ended. That does not prove there is none. Central money can be claimed anywhere and the calculator counts it; to ask about county money, phone the Hualien County EPB on 03-8239935.',
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
    t('我們找不到台東縣 2026 年的機車補助：經濟部的縣市補助表沒有列，台東縣環保局的網站我們也打不開。這不代表一定沒有。中央的補助全國都能領，試算已經算進去；縣裡有沒有加碼，請打電話或上官網問台東縣環保局。', 'We could not find a Taitung County scooter subsidy for 2026: the MOEA county table does not list one, and the bureau\'s site would not open for us. That does not prove there is none. Central money can be claimed anywhere and the calculator counts it; to ask about county money, phone or visit the website of the Taitung County Environmental Protection Bureau.'),
    ['counties-south-east-islands', 'counties-remaining-r2'],
    [{ label: t('台東縣環保局官網', 'Taitung EPB website'), url: 'https://ttepb.taitung.gov.tw/' }],
  ),
  penghu: notVerified(
    'penghu',
    t('澎湖縣', 'Penghu County'),
    'county',
    t('我們找不到澎湖縣 2026 年的機車補助：經濟部的縣市補助表沒有列，澎湖縣環保局的網站我們也打不開。這不代表一定沒有。中央的補助全國都能領，試算已經算進去；縣裡有沒有加碼，請打電話或上官網問澎湖縣環保局。', 'We could not find a Penghu County scooter subsidy for 2026: the MOEA county table does not list one, and the bureau\'s site would not open for us. That does not prove there is none. Central money can be claimed anywhere and the calculator counts it; to ask about county money, phone or visit the website of the Penghu County Environmental Protection Bureau.'),
    ['counties-south-east-islands', 'counties-remaining-r2'],
    [{ label: t('澎湖縣環保局官網', 'Penghu EPB website'), url: 'https://www.phepb.gov.tw/' }],
  ),
  kinmen: {
    id: 'kinmen',
    name: t('金門縣', 'Kinmen County'),
    kind: 'county',
    status: 'verified',
    statusNote: t(
      '已查閱環保局 2026 年補助要點與附表。購車與報廢須在 2026 年 11 月 30 日前完成；要點排除曾申請環境部相關補助者，所以能不能同時領環境部的獎勵，要點沒有寫清楚；申請前請打 082-336823 問環保局。',
      'We read the Environmental Protection Bureau\'s 2026 guidelines and schedule. Purchase and scrapping must be completed by 30 November 2026; the guidelines exclude anyone who has applied for related MOENV subsidies, so the guidelines do not make clear whether the MOENV reward can be claimed as well; phone the bureau on 082-336823 before you apply.',
    ),
    officialLinks: [{ label: t('金門縣環保局：2026 年補助要點', 'Kinmen EPB: 2026 guidelines'), url: 'https://kepb.kinmen.gov.tw/cp.aspx?n=D39D1B9DF3A45294' }],
    checkedOn: CHECKED,
    research: ['counties-south-east-islands'],
  },
  lienchiang: notVerified(
    'lienchiang',
    t('連江縣', 'Lienchiang County (Matsu)'),
    'county',
    t('我們找不到連江縣 2026 年的機車補助：經濟部的縣市補助表沒有列，連江縣政府的網站我們也打不開。這不代表一定沒有。中央的補助全國都能領，試算已經算進去；縣裡有沒有加碼，請打電話或上官網問連江縣政府。', 'We could not find a Lienchiang County scooter subsidy for 2026: the MOEA county table does not list one, and the county government\'s site would not open for us. That does not prove there is none. Central money can be claimed anywhere and the calculator counts it; to ask about county money, phone or visit the website of the Lienchiang County Government.'),
    ['counties-south-east-islands', 'counties-remaining-r2'],
    [{ label: t('連江縣政府官網', 'Lienchiang County Government website'), url: 'https://www.matsu.gov.tw/' }],
  ),
};
