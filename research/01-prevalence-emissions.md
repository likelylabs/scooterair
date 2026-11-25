# 01 - Scooter prevalence, national emissions inventory, policy context

Research date: 2026-11-25. Track: prevalence / TEDS / policy.

## READ THIS FIRST: verification status

In this session every outbound page fetch failed. WebFetch returned getaddrinfo ENOTFOUND for data.gov.tw, stat.motc.gov.tw, news.pts.org.tw, epb.taichung.gov.tw and focustaiwan.tw. curl through the proxy got HTTP 403 for www.moenv.gov.tw and en.wikipedia.org. Only WebSearch worked. WebSearch returns an AI-written summary plus a link list, not page text.

Consequences:
- **No source below was opened by me.** Nothing qualifies as VERIFIED.
- I have no verbatim quotes. The "locator" column holds the search tool's paraphrase, and it is labelled as such. Do not publish it as a quote.
- Tags used: SECONDARY = a search summary attributed the figure to a reputable page, whose URL appeared in the results but which I did not open; UNVERIFIED = no usable figure found.
- Before publishing, someone with network access to the official hosts must open each URL and confirm the number. Hosts needed: stat.motc.gov.tw, stat.thb.gov.tw, data.gov.tw, moenv.gov.tw, ncsd.ndc.gov.tw, epb.taichung.gov.tw.

## 1. Registered motorcycles and electric motorcycles

| Fact | Value | Period | Source (as surfaced) | URL | Locator (search paraphrase, not a quote) | Tag |
|---|---|---|---|---|---|---|
| Total registered motorcycles | about 14.67 million (1,467萬輛) | end of 2025 | TVBS/other media citing 交通監理 data | https://cars.tvbs.com.tw/life/304521 (appeared in results; attribution of the figure to this URL not confirmed) | "2025年底機車登記數已達1,467萬輛" | SECONDARY |
| Official monthly dataset exists | 機車登記數, monthly, split 重型/輕型 | updated monthly | 公路局/交通部 via data.gov.tw | https://data.gov.tw/dataset/14208 | dataset not opened | UNVERIFIED (figure not read) |
| Electric motorcycle registered stock | not found | n/a | n/a | n/a | n/a | UNVERIFIED |
| Plate-class split (重型/輕型/電動 stock) | not found | n/a | n/a | n/a | n/a | UNVERIFIED |

Assessment: the Grok "14.6-14.7 million" is consistent with the one secondary figure. The latest month (2026) and the electric stock are not obtained. Action: read the 公路局 monthly table at https://stat.thb.gov.tw/hb01/webMain.aspx?sys=100&funid=defjsp (URL appeared in a search summary only).

## 2. Scooters per 100 people; "world's highest"

| Fact | Value | Period | Source | URL | Locator (paraphrase) | Tag |
|---|---|---|---|---|---|---|
| Per 100 people (MOTC-attributed) | 62.7 | reported Apr 2025 | media citing 交通部 | https://udn.com/news/story/7266/9201605 (in results; not confirmed as origin) | "每一百位民眾,平均擁有62.7輛機車" | SECONDARY |
| Per 100 people (Seasia Stats via TVBS) | Taiwan 60, Vietnam 57, Malaysia 44 | not stated | TVBS citing Seasia Stats | https://cars.tvbs.com.tw/life/304521 (probable; unconfirmed) | "台灣排名第一,越南(57輛)、馬來西亞(44輛)" | SECONDARY |

Arithmetic check (mine, not sourced): 14.67 million / 100 = 146,700 per 1 million; with population about 23.4 million (UNVERIFIED, I did not look up the MOI figure) this gives about 62.7 per 100. So the Grok 60-63 range is plausible. The "world's highest" claim rests only on one Seasia Stats ranking; no official Vietnamese count was found, so I would not state "highest in the world" without that. Safer wording: "among the highest density in the world".

## 3. City-level counts / density

UNVERIFIED. No city table was found. Tried one general query. Action: use 公路局 monthly table by 縣市 plus MOI population.

## 4. TEDS (national inventory) and motorcycle share

| Fact | Value | Source | URL | Locator | Tag |
|---|---|---|---|---|---|
| TEDS 11.0 base year | 2019 | 中研院/NTU article (rsprc.ntu.edu.tw) | https://rsprc.ntu.edu.tw/zh-tw/m01-3/1672 | "TEDS 11.0以2019年為基準年" (paraphrase) | SECONDARY |
| Latest TEDS version | TEDS 12.0 exists (referenced in Taichung city charts); base year not found | Taichung EPB | https://www.epb.taichung.gov.tw/media/1221933/teds120與teds111固定-逸散-移污各種污染物環圈圖.pdf | n/a | SECONDARY for existence; base year UNVERIFIED. Note the dates look inconsistent with the 3-year cycle; possibly TEDS 12.0 = base 2022. Do not assume. |
| Taichung city (NOT national) PM2.5 | TEDS 11.1: total 4,858 t, mobile 1,814 t (37.4%). TEDS 12.0: total 4,688 t, mobile 754 t (16.1%) | Taichung EPB | same URL family as above | paraphrase | SECONDARY, local scope only |
| National power-sector PM2.5 | 931 t, 2.61% (base year 2021 inventory); power NOx 16.5%, SOx 40.4% | TVBS report | https://news.tvbs.com.tw/politics/2866082 | paraphrase | SECONDARY |
| 4-stroke motorcycle share of PM2.5 | 0.6% cited as in a MOENV chart for TEDS 12 | search summary only, source page unclear | n/a | n/a | UNVERIFIED (provenance unclear) |
| National motorcycle share of PM2.5 / NOx / NMHC / CO; 2-stroke vs 4-stroke | not found | n/a | n/a | n/a | UNVERIFIED |

Assessment: Grok's "<5% primary PM2.5 (~2,100 t/yr)", "NMHC 7-9%", "CO 10-20%" could not be confirmed or refuted. The 2,100 t figure is not supported by anything I saw: if national PM2.5 is a few tens of thousands of tonnes (power alone 931 t = 2.61% implies about 35,700 t total in the 2021 inventory, my arithmetic), then 2,100 t would be roughly 6%, not under 5%. This inconsistency should be checked against the TEDS tables.

## 5. Ambient PM2.5 source apportionment

UNVERIFIED. No MOENV statement on domestic vs transboundary share or on "traffic larger than power generation" was found. A search summary mentioned a MOENV chart saying "境內影響53%" and "交通影響大於工業" for a TEDS 12 context, but I could not locate the page. Treat the Grok claim as unsupported until the MOENV page is read. Note the TVBS power-sector figures above concern primary emissions, not ambient apportionment.

## 6. Old / high-emitting scooters; scrappage

| Fact | Value | Source | URL | Tag |
|---|---|---|---|---|
| Taichung cumulative 1-4期 scooters retired (local) | 60,931 units to end Dec 2021 (民國110), about 8.832 t/yr PM2.5 cut (TEDS 11.0 estimate) | Taichung EPB (via search summary) | https://www.epb.taichung.gov.tw/media/899813/ch4.pdf (in results; not confirmed as origin) | SECONDARY, local only |
| National count of 2-stroke and pre-2007 scooters remaining | not found | n/a | n/a | UNVERIFIED |

## 7. Electric share of new registrations

| Year | Electric new registrations | Share | Source | Tag |
|---|---|---|---|---|
| 2025 | 49,128 (down 37.64% vs 2024) | about 6.9% (my computation 49,128/708,406 = 6.93%; a PTS report is also said to state 6.94%) | TVBS car news (https://cars.tvbs.com.tw/car-news/301321 and /289405 appear in results) | SECONDARY |
| 2025 total market | 708,406 (down about 5.88%) | n/a | same | SECONDARY |
| 2025 Oct / Dec monthly | 4,587 (about 7%) / 4,937 (7.77%) | n/a | TVBS | SECONDARY |
| 2026 May | total 4,273 per the search summary (the summary is ambiguous: this figure seems to be electric registrations, not total market; 4,273 vs Apr 3,887, +9.93%) | n/a | 工商時報 https://www.ctee.com.tw/news/20260602700923-430503 | SECONDARY, ambiguous |
| 2019-2024 yearly series, 2019 peak | not found | n/a | n/a | UNVERIFIED |

Back-calculation (mine): 2024 electric about 49,128 / (1-0.3764) = about 78,800. Not sourced; do not publish. Policy driver cited: 貨物稅條例 amendment passed 29 Aug 2025 (up to NT$2,000 excise relief for new gas scooters up to 125cc).

## 8. Policy targets

| Fact | Value | Source | URL | Tag |
|---|---|---|---|---|
| Electric scooter share of new sales | 35% in 2030, 70% in 2035, 100% in 2040 (the search summary says several sources give these; Grok said 2035 = 100%, which looks wrong) | NDC 2050 pathway; u-car; official 運具電動化 PDF | https://ncsd.ndc.gov.tw/_ofu/FileDatabase/f902ee8d-8d90-4481-be67-adff60e698e9/07_運具電動化及無碳化.pdf ; https://news.u-car.com.tw/news/article/69916 | SECONDARY (official PDF not opened) |
| Ban on gas scooter sales | NDC said no outright ban; subsidies to internalise external costs | The News Lens | https://www.thenewslens.com/article/166174 | SECONDARY |
| Emissions standard phases (七期 etc.) | not found | n/a | n/a | UNVERIFIED |

## 9. Scooter mode share

| Fact | Value | Source | URL | Tag |
|---|---|---|---|---|
| Taipei City 2024 (113年): green transport 63.0%, private motorised 37.0%, walking 20.8%, MRT 16.0% (motorcycle share not given in summary) | 113年 | 交通部統計處 survey via TVBS | https://news.tvbs.com.tw/life/2558146 (possible origin; unconfirmed) | SECONDARY |
| Taichung 2022 (111年): private motorised 80.7%, of which motorcycle 61.3% (the summary guessed the denominator) | 111年 | Taichung gov | https://www.dbas.taichung.gov.tw/media/998929/112-012-臺中市運具使用變化.pdf | SECONDARY, denominator unclear |
| National public transport share 14.3% (2022, record low) | 111年 | 交通部 | n/a | SECONDARY |
| National and other-city scooter mode shares | not found | n/a | UNVERIFIED |

## Corrections to the handover (Grok claims)

1. Net-zero target "2035 = 100% electric scooters": likely wrong. Sources point to 70% in 2035, 100% in 2040. Needs confirmation from the NDC PDF.
2. "World's highest density" is supported by only one non-official ranking (Seasia Stats: Taiwan 60, Vietnam 57). Soften or confirm.
3. "<5% PM2.5, about 2,100 t/yr": unsupported; internal arithmetic from the TVBS power figure suggests about 6% if true. Check TEDS tables.
4. "E-scooter share about 5-7% currently": 2025 share about 6.9% is consistent, but the 2019 peak and 2019-2024 series are unconfirmed.
5. "Traffic is a larger domestic source of ambient PM2.5 than power generation": no statement found; only primary-emission figures for power (2.61%) exist.
6. NMHC 7-9%, CO 10-20%: no source found.

## Chart-ready data (all SECONDARY; do not chart before verifying)

Electric share of new scooter registrations, 2025

| Item | Value |
|---|---|
| Electric registrations 2025 | 49,128 |
| Total registrations 2025 | 708,406 |
| Share (computed) | 6.9% |

Net-zero electric scooter sales targets (NDC; confirm)

| Year | Target share |
|---|---|
| 2030 | 35% |
| 2035 | 70% |
| 2040 | 100% |

Scooters per 100 people

| Source | Taiwan | Vietnam | Malaysia |
|---|---|---|---|
| Seasia Stats via TVBS | 60 | 57 | 44 |
| MOTC-attributed media | 62.7 | n/a | n/a |

## Not done / needs network access
Items 3, 5 and most of 4, 6, 7 (2019-2024), 8 (standards), 9 (national). Also unlocking the hosts listed at the top is required for any VERIFIED tag.
