# 01 - Scooter prevalence, national emissions inventory, policy context

Research date: 2026-11-25. Track: prevalence / TEDS / policy. This file replaces the earlier version, which could not open any page.

## Method, tags, and access notes

How I got pages: the WebFetch tool still fails (ENOTFOUND) for every host, so all pages were fetched with `curl -sL` from Bash and converted to text; PDFs with `pdftotext`; the TEDS workbook with openpyxl. The figures below were read from the downloaded files, not from search snippets.

Tags:
- **VERIFIED** = official/primary document (MOENV, Taipei City statistics office relaying MOTC) that I downloaded and in which I saw the figure.
- **SECONDARY** = a media page I downloaded and read, quoting an official figure whose own source I could not open; or a figure I derived by arithmetic from such pages (marked "derived").
- **UNVERIFIED** = not found or seen only in a search summary (said so).

Hosts that remained unreachable: stat.motc.gov.tw (timeout), stat.thb.gov.tw (403), www.thb.gov.tw open-data CSV (returned an Incapsula bot challenge, so the MOTC registration table could not be downloaded), ncsd.ndc.gov.tw and www.ndc.gov.tw (403 Cloudflare), thenewslens.com and ctee.com.tw/news/policy (403), www.dbas.taichung.gov.tw (no resolve). Consequence: I never opened the MOTC monthly registration table or the NDC net-zero PDF. Anyone with a normal browser should open the MOTC table (https://stat.thb.gov.tw/hb01/webMain.aspx?sys=100&funid=defjsp, listed on data.gov.tw dataset 14208, which I did open) to confirm the latest registered stock.

Locators below are verbatim text from the downloaded page unless marked otherwise.

---

## 1. Registered motorcycles and electric motorcycles

| Fact | Value | Period | Source / publisher | URL | Verbatim locator | Tag |
|---|---|---|---|---|---|---|
| Total registered motorcycles (latest) | 14.67 million (1467萬); 94% gasoline, electric 5.5% | to end of May 2026 | 公視新聞 PNN, 新聞實驗室 (published 2026-07-15) | https://news.pts.org.tw/article/817768 | 「2026年截至5月底，全國有1467萬台機車，有94%都是加汽油、電動機車只占5.5%」 | SECONDARY (MOTC table not opened) |
| Electric stock implied | about 0.81 million | May 2026 | derived: 14.67M x 5.5% | n/a | n/a | SECONDARY (derived) |
| Total registered motorcycles | 14.66 million (1,466萬輛) | 2024 (民國113) | 環境部, 113年度空氣污染防制總檢討, section 機動車輛 (PDF text p.~19 of 113 report) | https://air.moenv.gov.tw/EnvDownload/AirQuality/92%E5%B9%B4%E8%87%B3105%E5%B9%B4%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E/113%E5%B9%B4%E5%BA%A6%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E.pdf | 「機車，維持逐年成長，113 年已達 1,466 萬輛」 | VERIFIED |
| Electric motorcycles registered | 770,000 (77萬輛) | 2024 | same | same | 「電動機車市場也開始出現爆炸性成長，107 年設籍數超過 19 萬輛，113 年已成長至 77 萬輛」 | VERIFIED |
| Total / electric | 14.55M / 700,000 (70萬) | 2023 | 環境部 112年度總檢討 | https://air.moenv.gov.tw/EnvDownload/AirQuality/92%E5%B9%B4%E8%87%B3105%E5%B9%B4%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E/112%E5%B9%B4%E5%BA%A6%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E7%B8%BD%E6%AA%A2%E8%A8%8E.pdf | 「112 年已達 1,455 萬輛」「112 年已成長至 70 萬輛」 | VERIFIED |
| Motorcycles, end Oct 2025 | 14.68 million (1468萬輛), +270,000 vs two years earlier | Oct 2025 | 聯合報 (dated 2025-12-14) citing 公路局 | https://udn.com/news/story/7266/9201605 | 「根據交通部公路局統計，截至今年十月底，自用小客車數量已達七一七萬輛、機車一四六八萬輛」 | SECONDARY |
| Motorcycles, May 2025 | 14.665 million of 23.357 million motor vehicles | May 2025 | TVBS 地球黃金線 | https://cars.tvbs.com.tw/life/304521 | 「機動車輛登記數達2,335.7萬輛，其中機車就佔了1,466.5萬輛」 | SECONDARY |
| Dataset definition | monthly count of plates at month end; excludes military and temporary plates; 2013 sworn-scrappage reduced counts | n/a | 公路總局 via data.gov.tw (dataset 14208, API JSON) | https://data.gov.tw/api/v2/rest/dataset/14208 | 「本表所列數字以各月(年)底領有統一牌照車輛為限…102年8月起實施逾10年老舊機車…切結報廢，致機車數量減少」 | VERIFIED (metadata only; no data rows) |
| Split by plate class (重型/輕型, 大型重型/普通重型/小型輕型) | fields exist in the dataset (機車重型, 大型重型550cc以上, 普通重型, 機車輕型, 小型輕型) but values not obtained | n/a | same | same | field list | UNVERIFIED (values) |
| Electric by plate class | not found | n/a | n/a | n/a | n/a | UNVERIFIED |

Note: the 2023-2025 figures are all about 14.55-14.68 million and consistent with each other. The series has a break in 2013 (sworn scrappage removed old plates, per the dataset note), so do not chart pre-2013 counts against later ones without that caveat.

## 2. Scooters per 100 people; "world's highest"

| Fact | Value | Period | Source | URL | Verbatim locator | Tag |
|---|---|---|---|---|---|---|
| MOTC-attributed density | 62.7 per 100 (reported as "about 63") | early 2025 (stock 14.662M, "今年前兩個月") | TVBS 新聞 | https://news.tvbs.com.tw/life/2853869 | 「交通部最新統計數字顯示，國內每一百位民眾，平均擁有62.7輛機車」; 「掛牌上路的機車數1466.2萬輛…平均每一百人，就擁有63輛機車」 | SECONDARY |
| International comparison | Taiwan 60, Vietnam 57, Malaysia 44 per 100 | not dated in the article | TVBS citing Seasia Stats | https://cars.tvbs.com.tw/life/304521 | 「冠軍為平均每百人就持有60輛機車的台灣，排名第二、三則是機車大國越南 (57輛) 與馬來西亞 (44輛)」 | SECONDARY (Seasia Stats not opened) |
| Population denominator (MOI) | not obtained | n/a | n/a | n/a | n/a | UNVERIFIED |

Arithmetic (derived): 62.7 per 100 with a 14.662M stock implies a population of about 23.4M (14.662M / 0.627). I did not obtain the MOI population figure, so this is a back-calculation, not a sourced number.

Honest wording for the site: "Taiwan has about 63 registered motorcycles per 100 people (MOTC-based media report) and ranks at or near the top of the countries compared in one regional ranking." The 3-point gap to Vietnam (57) is within the uncertainty of mixing registered counts with estimated fleets, and I found no official Vietnamese count, so do not state "world's highest" as fact. The 60-vs-63 difference is a definition/date difference (Seasia Stats vs MOTC).

## 3. City-level counts and density (six municipalities)

Registered scooter counts per city: UNVERIFIED (the MOTC table by 縣市 was unreachable).

What I did verify for electric penetration (SECONDARY, SMAT citing 公路局, 工商時報 2026-04-16, https://www.ctee.com.tw/news/20260416701222-430503): 「2025年六都電動機車市售比為7.5％、電動機車的普及率為6.1％。六都中以台北市的市售比22.1％最高，且台北市的電動機車普及率也以10％領跑六都」. Taipei 2024-end power source of scooters (VERIFIED, 臺北市政府主計處 weekly bulletin no.1364, relaying MOTC 機車及自用小客車使用狀況調查): 「機車動力來源以燃油占90.6%為主，電池交換式占8.4%居次」, charging-type 1.0%. URL: https://www-ws.gov.taipei/001/Upload/367/relfile/46908/9517432/5897ecdf-046f-4f8c-85e1-9ce86a63bdc8.pdf

## 4. TEDS: latest version, base year, motorcycle shares

Version history (VERIFIED, 環境部 空氣品質改善維護資訊網, page https://air.moenv.gov.tw/envtopics/AirQuality_6.aspx, page footer date 2026-11-26): 「TEDS 11.0版基準年為民國108年」「TEDS 12.0版基準年為民國110年」「TEDS13.0以民國112年為基準年…為目前台灣空氣污染排放清冊最新版本」「我國最新版空氣污染物排放量清冊（TEDS 13.0）已於115年1月發布」. So latest = TEDS 13.0, base year 2023 (民國112), published January 2026; update cycle now every 2 years. TEDS 11.0 = base 2019, TEDS 12.0 = base 2021.

National totals, TEDS 13.0 (VERIFIED, same page): 「112年全國細懸浮微粒總排放約為33,731公噸、硫氧化物約為40,730公噸、氮氧化物約為202,776公噸、揮發性有機物約為355,083公噸（不含生物源排放）」. Scope caveat (same page): 「只含境內來源所直接產生之排放量，不含境外來源，且污染物僅函原生性污染物，未計入衍生性」 (primary, domestic only; no secondary PM).

Motorcycle rows from the official workbook (VERIFIED): `TEDS13.0_污染源版排放量分類統計表_全國.xlsx`, sheet 全國, title 「全國民國112年各污染源行業別排放量分類統計表」, footer 「[TEDS13.0] 20251030v1」. Download: https://air.moenv.gov.tw/EnvDownload/AirQuality/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E6%8E%92%E6%94%BE%E6%B8%85%E5%86%8A/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E7%89%A9%E6%8E%92%E6%94%BE%E9%87%8F%E6%B8%85%E5%86%8ATEDS13.0%E7%89%88%E7%9B%B8%E9%97%9C%E6%96%87%E4%BB%B6.zip (the zip is a 22 MB archive; the workbook is in the folder 污染源版排放量分類統計表/全國). Cell values, tonnes per year, share of national total in brackets; the sheet's own 總排放量 row is the denominator.

| Pollutant (t/yr) | 2-stroke gasoline scooters (二行程機車) | 4-stroke (四行程機車) | Both combined (derived sum) | Electric motorcycles (電動機車) | National total |
|---|---|---|---|---|---|
| PM2.5 | 98.1 (0.29%) | 343.6 (1.02%) | 441.7 (1.31%) | 6.5 (0.02%) | 33,731.0 |
| PM10 | 100.0 (0.09%) | 491.6 (0.45%) | 591.6 (0.54%) | 13.2 | 108,956.1 |
| NOx | 41.6 (0.02%) | 4,406.5 (2.17%) | 4,448.1 (2.19%) | 0 | 202,776.2 |
| NMHC | 1,972.9 (0.56%) | 33,513.2 (9.44%) | 35,486.1 (9.99%) | 0 | 355,082.6 |
| THC | 2,133.2 (0.49%) | 35,147.6 (8.11%) | 37,280.8 (8.60%) | 0 | 433,280.2 |
| CO | 2,604.1 (0.54%) | 71,935.9 (15.05%) | 74,540.1 (15.59%) | 0 | 478,024.4 |

Percentages for 2-stroke and 4-stroke are the workbook's own share cells; the combined column and combined percentages are my sums. Electric motorcycle PM2.5 (6.5 t) is non-exhaust (tyre/brake/road-dust-type) only.

Context rows from the same workbook (national, tonnes/yr): road vehicles (車輛, all types) PM2.5 4,522.9 (13.4%), NOx 83,276.4 (41.1%), NMHC 87,074.7 (24.5%), CO 234,786.6 (49.1%); power sector combustion PM2.5 791.0 plus unclassified 83.6, NOx 33,278.0 (16.4%). Construction/road dust is 50.4% of PM2.5.

Verdict on the Grok figures:
- "motorcycles under 5% of primary PM2.5, about 2,100 t": direction right (it is under 5%), but the number is wrong: TEDS 13.0 gives about 442 t, 1.3%, not 2,100 t. Correct it.
- "NMHC 7-9%": TEDS 13.0 gives 10.0% (9.4% 4-stroke + 0.6% 2-stroke). Slightly low. THC is 8.6%.
- "CO 10-20%": 15.6%, within range.
- NOx: 2.2% (not claimed by Grok).
- 2-stroke versus 4-stroke: 2-stroke fleet is tiny (about 0.3% PM2.5, 0.6% NMHC) after scrappage; 4-stroke carries nearly all the load.

The workbook sheet title says 行業別 while the file name says 污染源版; the rows are by source type. Treat this as a labelling quirk in the MOENV file.

Cross-check, TEDS 12.0 (base 2021, VERIFIED, 環境部 news 2025-06-30): power sector shares of national emissions 「TSP…0.5%、1%、2.61%、16.5%及40.4%」 for TSP, PM10, PM2.5, NOx, SOx. URL: https://air.moenv.gov.tw/News/news.aspx?ID=6282

## 5. Source apportionment of ambient PM2.5

| Fact | Value | Source | URL | Verbatim locator | Tag |
|---|---|---|---|---|---|
| Domestic vs transboundary | foreign about 35.1% (29.0-41.0% by air basin), domestic about 64.9% (59.0-71.0%) | 環境部/環保署, 空氣污染防制方案 (109-112) 核定本, p.15 of PDF (modelling with TEDS 9.0 inventory) | https://air.moenv.gov.tw/EnvDownload/AirQuality/%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E4%BF%9D%E8%AD%B7%E6%94%BF%E7%AD%96%E8%A6%8F%E5%8A%83/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E5%88%B6%E6%96%B9%E6%A1%88109-112(%E6%A0%B8%E5%AE%9A%E6%9C%AC).pdf | 「境外污染源平均約35.1%（各空品區29.0%~41.0%）、境內約64.9%（各空品區59.0%~71.0%）」 | VERIFIED (dated; TEDS 9.0 era, 2013 base) |
| Domestic shares (domestic = 100%) | industry 27.5% (18.7-35.4%); mobile 27.5% (8.8-31.3%); fugitive 45.0% (38.6-72.5%) | same | same | 「工業源影響比率平均約占27.5%」「移動源影響比率平均約占27.5%（各空品區8.8%~31.3%）」「逸散源影響比率平均約占45.0%」 | VERIFIED (dated) |
| Power sector share of ambient PM2.5 | about 2.3% of the national annual mean (about 13 ug/m3) | 環境部 news 2025-06-30 | https://air.moenv.gov.tw/News/news.aspx?ID=6282 | 「彭部長說明我國大氣中PM2.5約2.3%來自於電力業，這是指電力業對我國大氣中PM2.5年平均值約為13微克／立方公尺的貢獻比率」 | VERIFIED |
| Same news item: emissions share is not a concentration share | MOENV explicitly rejects reading emission shares as contribution to air concentration | same | same | 「直接以排放量占比為空氣污染貢獻比率是錯誤論述」 (title) | VERIFIED |

Assessment of "traffic is a larger domestic source of ambient PM2.5 than power generation": consistent with the official figures but not stated in that form by MOENV. Power is about 2.3% of ambient PM2.5 (all-source denominator); mobile sources are about 27.5% of the domestic part (domestic-only denominator), which times about 65% domestic is about 18% of total (my derived, unofficial). The two denominators differ, so say it in this derived form and label it as derived. I did not find a recent (post-2020) MOENV modelled apportionment for the national level; the 2020 plan figures use an older inventory (TEDS 9.0). Primary-emission comparison from TEDS 13.0 (derived from workbook): all road vehicles emit 4,523 t of primary PM2.5 versus about 875 t from the power sector, and 83,276 t of NOx versus 33,278 t. Do not present emission shares as ambient shares (MOENV warns against it).

## 6. Old / high-emitting scooters and scrappage

| Fact | Value | Source | URL | Verbatim locator | Tag |
|---|---|---|---|---|---|
| 2-stroke scooters remaining | about 330,000 (below 33萬) in 2023; under 1,000,000 by 2018; about 280,000 (below 28萬) in 2024 | 環境部 112年 and 113年度總檢討 | 112 report URL in section 1; 113 report URL in section 1 | 「107 年已將機車數降至 100 萬輛以下，112 年進一步降至約 33 萬輛以下」; 「113 年進一步降至約 28 萬輛以下」 | VERIFIED |
| Old scooters (pre-mid-2007 build) | 4.74 million in 2019 (民國108) | same | same | 「108 年 474 萬輛老舊機車中，109 年至 112 年全國累計已淘汰 219.4 萬輛，減少 46%，並達成 112 年 190 萬輛之累積目標」 | VERIFIED |
| Scrappage subsidy scope | extended from 2-stroke to scooters built before 30 June 2007 (民國96年6月30日) | same | same | 「環境部自 109 年擴大汰舊補助對象至 96 年 6 月 30 日前出廠之老舊機車」 | VERIFIED |
| Remaining after 2020-2023 scrappage | about 2.55 million (4.74M minus 2.194M) | derived | n/a | n/a | SECONDARY (derived; unofficial) |
| Scrappage after 2023 (2024-2026), subsidy status | not found | n/a | n/a | n/a | UNVERIFIED |

Mapping note: the 1-4 phase labels used by Grok correspond to standards before the phase-5 start on 1 July 2007 (see section 8), consistent with the 96年6月30日 cut-off, but MOENV's text defines the subsidy target by build date, not by phase; the "pre-2007 / 1-4期" equivalence is my inference.

## 7. New registrations: gas vs electric, year by year

Definition note: these are new-plate registrations (領牌) of 機車, not stock. Sources differ in how they treat heavy motorcycles in the denominator.

| Year | Total new (all motorcycles) | Electric new | Electric share | Gas new | Source / tag |
|---|---|---|---|---|---|
| 2019 | 902,302 | 168,542 | 18.7% | 733,760 (81.3%) | 鉅亨網 citing 交通部統計 (https://news.cnyes.com/news/id/4431598): 「2019 年度環保燃油車 733,760 台 (81.3%) 大勝電動車 168,542 台 (18.7%)」; PTS says 「2019年曾經一度超過18%」. SECONDARY |
| 2020 | 1,035,823 | not obtained | not obtained | not obtained | total only via a search summary: UNVERIFIED |
| 2021 | 809,196 | about 94,000 (derived) | 11.6% | 715,197 | 工商時報 (Gogoro press briefing, https://wantrich.chinatimes.com/news/20220111900740-420101): 「全體機車市場年度總銷量為80萬9196輛，較2020年萎縮21.9%，其中，燃油機車市場71萬5,197輛，年減23.6%，創2016年以來的銷售新低」. SECONDARY. A TVBS search summary gave 12.07%, not opened: UNVERIFIED |
| 2022 | not obtained | about 87,588 (derived) | 11.9% | n/a | electric derived from 「較 2022 年度衰退 9.14%」 and 79,584 in 2023 (U-CAR, https://news.u-car.com.tw/collection/article/5965); share per SMAT via PTS (https://news.pts.org.tw/article/802600): 「2022年電動機車市售比11.9%」. SECONDARY |
| 2023 | 870,620 | 79,584 | 9.14% | n/a | 870,620 from TVBS 2024 report (https://cars.tvbs.com.tw/car-news/234355); 79,584 and 「佔機車總市場 9.141%」 from U-CAR (link above). SECONDARY |
| 2024 | 752,643 | 78,757 | 10.46% (TVBS) / 10.38% (U-CAR) | 673,886 (derived) | TVBS (https://cars.tvbs.com.tw/car-news/234355 and /235023): 「2024年台灣機車總市場的掛牌數來到752,643輛」「78,757」「10.46」; U-CAR https://collection.u-car.com.tw/collection/article/6209 gives 10.38%. The 0.08-point gap is a denominator difference. SECONDARY |
| 2025 | about 708,000 (derived) | 49,128 | 6.94% | about 659,000 (derived) | TVBS Dec 2025 report (https://cars.tvbs.com.tw/car-news/301321), table total cell 「49,128」; PTS: 「2025年只有6.94%」. The 708,406 total quoted in a search summary was not found on any page I opened, so I derive about 708,000 from 49,128 / 6.94%. SECONDARY |
| 2026 (Jan-Jun) | monthly only: May electric 4,273, total 61,541; Jun electric 4,686 | n/a | about 7% in May | n/a | May: 工商時報 (https://www.ctee.com.tw/news/20260602700923-430503) 「5月全台總銷量達6萬1541輛…電動機車市場同樣…5月整體銷量為4273輛」. Jun/Jan figures only in a search summary: UNVERIFIED |
| 2015-2018 | not obtained | n/a | n/a | n/a | UNVERIFIED |

The 2019 peak and later fall are real: share 18.7% (2019) fell to 11.6-11.9% (2021-22), 9.1% (2023), 10.4% (2024), 6.9% (2025). The drop is in both counts and share: electric new registrations went from 168,542 (2019) to 49,128 (2025). Stated causes (media, not primary): subsidy cuts after 2019, Gogoro ending the unlimited-battery plan in 2022 (PTS), and from 29 August 2025 an excise-tax cut of up to NT$2,000 on new gas scooters up to 125cc (TVBS 301321). The 2026 month-by-month totals are partial; do not chart them as a year.

## 8. Policy targets and emissions standards

| Fact | Value | Source | URL | Verbatim locator | Tag |
|---|---|---|---|---|---|
| Net-zero path: electric scooter share of new sales | 20% (2025), 35% (2030), 70% (2035), 100% (2040) | 公視 PNN describing 「台灣2050淨零排放路徑」 | https://news.pts.org.tw/article/817768 | 「規劃電動機車的市售比在2025年要達到20%、2030年35%、2035年70%、2040年達到100%」 | SECONDARY (NDC original not opened: ncsd.ndc.gov.tw returned 403) |
| Same 2030/2040 targets restated | 35% in 2030; 100% in 2040; electric cars 30% in 2030 | 公視 PNN (2026-04-07) | https://news.pts.org.tw/article/802600 | 「電動機車要達到35%；到了2040年，無論是電動小客車或電動機車，市售比都得達到100%」 | SECONDARY |
| Ban on new gas scooters | no formal ban found. PTS (2026) says only 「2040年電動機車市售比要達到100%」; a TVBS item says 「政府已經公告，2040年禁售燃油機車」, which conflicts with NDC statements reported elsewhere that it will not ban sales but use subsidies | PTS; TVBS (https://news.tvbs.com.tw/life/2558146) | n/a | n/a | UNVERIFIED (conflicting secondary statements; need NDC/MOTC primary) |
| Scooter emissions standard phases | Phase 1: 1 Jan 1988; Phase 4: 1 Jan 2004 (cold-start test); Phase 5: 1 Jul 2007; Phase 6: 1 Jan 2017 (about Euro 4, WMTC cycle); Phase 7: 1 Jan 2021 (adds PM limit for direct-injection engines) | 環境部 112年度總檢討, 機車排放標準 paragraph | 112 report URL in section 1 | 「機車最早於 77 年 1 月 1 日起實施第一期排放標準」「自 93 年 1 月 1 日起實施第四期」「96 年 7 月 1 日起實施第五期」「106 年 1 月 1 日起實施第六期」「110 年 1 月 1 日起實施之第七期排放標準」 | VERIFIED |
| Progress against 2025 target | 6.94% actual vs 20% target | PTS | https://news.pts.org.tw/article/817768 | 「離政府訂的淨零排放路徑20%目標、差了一大截」 | SECONDARY |

## 9. Mode share of scooters

| Fact | Value | Period | Source | URL | Verbatim locator | Tag |
|---|---|---|---|---|---|---|
| Taipei City: scooter share of trips | 20.1% (2024), 22.2% (2022); car 16.3% / 15.9%; private motorised total 37.0% / 38.9%; public transport 38.3%; walking 20.8% | 113年 and 111年, Sept-Dec survey, weekday trips | 臺北市政府主計處 市政統計週報 no.1341 (relaying 交通部統計處「民眾日常使用運具狀況調查」) | https://www-ws.gov.taipei/001/Upload/367/relfile/46908/9442607/0bbf97f1-faca-4f2c-b296-3013a137e3f0.pdf | table row 「113 年 63.0 38.3 16.0 13.7 24.7 20.8 3.8 37.0 20.1 16.3 44.2…」 (column 機車 = 20.1, 自用小客車 = 16.3, confirmed by rendering the page) | VERIFIED |
| National scooter share | 45.8%, the largest single mode (2022) | 111年 | TVBS 新聞 | https://news.tvbs.com.tw/life/2558146 | 「根據111年的統計，各類運輸工具當中，仍然以機車為最大宗，市占率45.8%最高」 | SECONDARY (2024 national figure not found) |
| National public-transport share | 14.3% (2022), 1.7 points below the previous survey; Taipei 37.2%; only Taipei, Keelung, New Taipei above 10% | 111年 | same | same | 「公共運輸市占率為14.3%…台北市最高達到37.2%」 | SECONDARY |
| Main purpose of scooter use | commuting 58.4% nationally; Taipei 63.3%, New Taipei 61.2%, Taoyuan 60.4%, Taichung 61.1%, Tainan 60.7%, Kaohsiung 57.2% | 2024 (113年) | 臺北市主計處 bulletin no.1364 | https://www-ws.gov.taipei/001/Upload/367/relfile/46908/9517432/5897ecdf-046f-4f8c-85e1-9ce86a63bdc8.pdf | table 「全國 58.4 …臺北市 63.3 …新北市 61.2 …」 | VERIFIED |
| Scooter mode share for other five cities, and 2024 national | not found | n/a | n/a | n/a | n/a | UNVERIFIED |

A Taichung 2022 figure (scooter 61.3% within private motorised, from a search summary) was not reopened and is excluded.

---

## Corrections to the handover (Grok claims)

1. Motorcycles in Taiwan about 14.6-14.7M: OK. Official 2024 figure 14.66M; end May 2026 about 14.67M (media).
2. Electric stock: official 770,000 in 2024 (5.3% of fleet); about 5.5% (about 0.8M) in May 2026 (media).
3. Scooters per 100: 62.7 per MOTC-attributed media; Grok's 60-63 range is OK. "World's highest" rests on one non-official ranking; soften.
4. Motorcycle share of primary PM2.5 "about 2,100 t, under 5%": the tonnage is wrong. TEDS 13.0 (base 2023): 442 t, 1.3%.
5. NMHC "7-9%": TEDS 13.0 gives 10.0% (4-stroke 9.4%, 2-stroke 0.6%).
6. CO "10-20%": 15.6%, within range.
7. TEDS version: if the handover cites TEDS 11.0/12.0, it is outdated. Latest is TEDS 13.0 (base 2023, published Jan 2026). Do not mix shares across versions: MOENV says different editions are not directly comparable.
8. "Traffic larger domestic source than power": not stated in those words by MOENV. The supportable statements are (a) power about 2.3% of ambient PM2.5, (b) mobile about 27.5% of the domestic share in the 2020 plan (older inventory), (c) road vehicles emit more primary PM2.5 and NOx than power per TEDS 13.0.
9. "Net-zero path 2035 = 100%": wrong if claimed; path is 35% (2030), 70% (2035), 100% (2040), with a 20% milestone in 2025.
10. "Ban on new gas scooters": no official ban found; sources conflict. Do not state a ban without an NDC/MOTC primary.
11. E-scooter share "5-7% now": 6.94% in 2025, about 7% in May 2026: OK. The 2019 peak is real (18.7%).
12. Taichung-only inventory numbers seen in the first pass (PM2.5 mobile 37.4% / 16.1%) are city figures and must not be used as national.

## Chart-ready data

All values from the sections above. Tag per row in the last column.

### A. Electric share of new motorcycle registrations (%)

| Year | Share | Tag |
|---|---|---|
| 2019 | 18.7 | SECONDARY |
| 2021 | 11.6 | SECONDARY |
| 2022 | 11.9 | SECONDARY |
| 2023 | 9.1 | SECONDARY |
| 2024 | 10.5 | SECONDARY |
| 2025 | 6.9 | SECONDARY |

2020 and 2015-2018 missing (unverified).

### B. New registrations, electric vs gas (vehicles)

| Year | Electric | Gas / other | Tag |
|---|---|---|---|
| 2019 | 168,542 | 733,760 | SECONDARY |
| 2021 | about 94,000 | 715,197 | SECONDARY (electric derived) |
| 2023 | 79,584 | about 791,000 (derived: 870,620 minus 79,584) | SECONDARY |
| 2024 | 78,757 | about 673,900 (derived) | SECONDARY |
| 2025 | 49,128 | about 659,000 (derived) | SECONDARY |

### C. Motorcycle share of national emissions, TEDS 13.0 (base 2023), %

| Pollutant | 2-stroke | 4-stroke | Combined | Tag |
|---|---|---|---|---|
| PM2.5 | 0.29 | 1.02 | 1.31 | VERIFIED (combined derived) |
| NOx | 0.02 | 2.17 | 2.19 | VERIFIED |
| NMHC | 0.56 | 9.44 | 9.99 | VERIFIED |
| CO | 0.54 | 15.05 | 15.59 | VERIFIED |

### D. Primary emissions, road vehicles vs power sector, TEDS 13.0 (t/yr)

| Pollutant | All road vehicles | Power sector (combustion + unclassified) | Tag |
|---|---|---|---|
| PM2.5 | 4,522.9 | 874.6 | VERIFIED |
| NOx | 83,276.4 | 33,278.0 | VERIFIED |

### E. Registered motorcycles and electric stock (millions)

| Year | Total | Electric | Tag |
|---|---|---|---|
| 2018 | n/a | more than 0.19 | VERIFIED (lower bound) |
| 2023 | 14.55 | 0.70 | VERIFIED |
| 2024 | 14.66 | 0.77 | VERIFIED |
| May 2026 | 14.67 | about 0.81 | SECONDARY |

### F. Old scooters and scrappage

| Item | Value | Tag |
|---|---|---|
| Pre-mid-2007 scooters in 2019 | 4.74 million | VERIFIED |
| Scrapped 2020-2023 | 2.194 million (46%) | VERIFIED |
| 2-stroke scooters: 2018 / 2023 / 2024 | under 1.00M / about 0.33M or less / about 0.28M or less | VERIFIED |

### G. Net-zero electric scooter sales targets (%)

| Year | Target | Tag |
|---|---|---|
| 2025 | 20 | SECONDARY |
| 2030 | 35 | SECONDARY |
| 2035 | 70 | SECONDARY |
| 2040 | 100 | SECONDARY |

### H. Taipei trip mode share (%)

| Mode | 2022 | 2024 | Tag |
|---|---|---|---|
| Scooter | 22.2 | 20.1 | VERIFIED |
| Car (private) | 15.9 | 16.3 | VERIFIED |
| Public transport | 37.2 | 38.3 | VERIFIED |
| Walking | 18.6 | 20.8 | VERIFIED |

### I. Ambient PM2.5 apportionment (dated, TEDS 9.0-era model)

| Part | Share | Tag |
|---|---|---|
| Transboundary | 35.1% | VERIFIED |
| Domestic | 64.9% | VERIFIED |
| Of domestic: fugitive / industry / mobile | 45.0 / 27.5 / 27.5 | VERIFIED |

## Still unverified (needs a browser with access to MOTC / NDC)

- Latest-month MOTC registered stock, electric stock, and plate-class split (items 1).
- Six-city registered scooter counts and density (item 3).
- MOI population for the per-100 arithmetic (item 2).
- Annual new-registration series for 2015-2018 and 2020; 2022 and 2025 totals from the original MOTC table.
- NDC net-zero PDF (target table) and whether any ban on new gas scooters is official.
- National 2024 scooter mode share and mode shares for five of the six cities.
- Post-2023 scrappage results and current subsidy status.
