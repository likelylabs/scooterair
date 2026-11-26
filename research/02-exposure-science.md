# 02 - Exposure science: pedestrian and street-level exposure (Taiwan)

Status 2026-11-25 (second pass, network partly open). Tags: VERIFIED = I opened the primary document/abstract text myself in this
session and saw the quoted text; SECONDARY = only via search-tool summary or a reputable third-party page I did not open;
UNVERIFIED = could not confirm. Publisher pages (mdpi.com, sciencedirect.com, taipeitimes.com, LTN, iot.gov.tw HTML) blocked
WebFetch or returned 403; I used curl for the IOT PDF itself, Crossref (citation metadata), Semantic Scholar API (abstract text as
deposited by the publishers) and MOENV/Taipei EPD documents. "VERIFIED (abstract)" = abstract text seen, full text not read.
Not read in full: all journal papers below (abstract only). The IOT report was read at the table/summary level (402 pp, pdftotext).

---------------------------------------------------------------------------------------------------------------------------
## 1. IOT scramble-crossing study and the "94%"

### 1a. The primary report (VERIFIED, opened PDF)
- Citation: 洪珮瑜 (PI, 景丰科技股份有限公司 / Environmental Simulation Co. Ltd.), 陳冠男, 蘇淳太, 葉富豪, 林映君, 王思懿, 陳瀚禮; IOT
  division: 朱珮芸, 鄔德傳, 黃士騰, 楊家銘. 《路口交通環境特性對空氣品質影響及改善指引之研訂(2/2)－資料分析與指引研訂》
  (English: "The Impact of Traffic Environmental Characteristics at Intersections on Air Quality and the Development of Improvement
  Guidelines (Data Analysis and Develop Guidelines)"). 交通部運輸研究所, 114年12月 (Dec 2025), 402 pp. IOT serial 114-084-6228,
  project 113-TB006 (research period Mar-Dec 2024), ISBN 978-986-531-730-0, GPN 1011401545. No DOI.
  URL: https://www.iot.gov.tw/uploads/column_entry_file/file/697879c4085777f955e15ddf/路口交通環境特性對空氣品質影響及改善指引之研訂_2.2_.pdf
  (URL-encoded in the search result; downloads fine with curl -4). Note the Taipei Times story is dated 2025-04-07, i.e. before
  this Dec 2025 publication; an earlier IOT release/press summary may differ slightly from the final PDF (not found).
- Disclaimer on the cover: 「本研究之結論與建議不代表交通部之意見。」(conclusions do not represent the Ministry's views).
- Design (VERIFIED): 2-year project; 10 intersections surveyed (4 in 2023, 6 in 2024), 48 h each (480 h total) in Taipei, New Taipei
  and Kaohsiung. Fixed micro-sensors (PM2.5, CO) beside the crosswalk, inlet 1.2-1.5 m above ground "to simulate actual human breathing
  height"; sensors checked by ITRI lab and against MOENV stations. Field data were then used to drive a microscale dispersion model
  (GRAL V24.04) to simulate "with / without" traffic-management scenarios, because "現實狀況無法在同一路口進行交通管理策略之改動"
  (in reality the strategy cannot be changed at the same intersection) -> the strategy effects are MODELLED, not measured before/after.
  Emission sources set at 0.5 m height ("高度參考汽車、機車排氣管的離地高度設定為 0.5m"); emissions from TEDS 12.0 national average
  emission factors per vehicle class, with red-light idling at the 5 km/h factor. Model results carry significance (paired t-test) and
  performance-evaluation flags (# = failed the model-performance check).
- WHERE THE 94% COMES FROM (VERIFIED): Table 4.3.2-30 "一般路口特性複雜背景源案例分析" (general intersection, complex background
  source = the Kaohsiung site 高鐵路/重信路, 左營, a 3-leg intersection beside HSR Zuoying station with an all-day exclusive pedestrian
  phase 09:00-21:00). Percent change in modelled PM2.5 after introducing the measure, by survey/simulation day:
  | Measure | Day1 | Day2 | Day3 | Day4 |
  | Scramble, all day (07-19) | -17.79%* | -94.86%* | -16.22%# | -12.00%# |
  | Scramble, peak only (07-09, 17-19) | -7.87% | -94.43%* | -9.54%# | -2.92%# |
  (* significant at 95%; # failed model-performance evaluation.) Site-level Table 4.3.2-4 (pedestrian waiting area) shows Day 2
  at -91.8% to -98.0% in every hour 07-19 (both all-day and peak-only scenarios), versus roughly -13% to -21% on other days.
  The report itself flags this as an outlier: 「其中以無專用時相的第 2 天模擬結果最具有差異性，明顯高於其他模擬值。…實施全天時段行人專用時相下，
  相對可有效減少受體點位平均之 PM2.5 濃度，於行人等候區增減幅度為-21.40%至-2.58%」 (the no-exclusive-phase Day-2 simulation is the most
  different, clearly higher than the other simulated values; ... with all-day exclusive phase the pedestrian-waiting-area change is
  -21.40% to -2.58%) (p. 4-28, which excludes Day 2).
  => PRECISE MEANING: "up to 94%" = a MODELLED percentage reduction in PM2.5 concentration at the pedestrian waiting-area receptor,
  comparing an all-day exclusive-phase scenario with a no-exclusive-phase scenario, on ONE simulation day (Day 2) at ONE Kaohsiung
  intersection with complex (industrial+traffic) background, where the no-phase baseline simulation was anomalously high. The same
  intersection's other days give about -12% to -18%. It is a best-case outlier, not typical, not measured, and NOT a scooter-specific
  result. (My inference: the report does not explain why Day 2 baseline is so high; I could not determine the cause.)
- Other scenario results (VERIFIED, Tables 4.3.2-29 to -32, PM2.5 % change, Day1-Day4): general single-source (Taipei/New Taipei sites)
  all-day scramble -7.51, -10.23*, +10.22#, -4.38#; its CO change was positive (+18.33*, +7.54*, +7.45, +39.62) - i.e. scramble raised
  modelled CO there. Bus-heavy single-source peak-only scramble PM2.5 -20.03*, -23.95*, -1.76#, +0.09#. Sidewalk widening 0.5 m PM2.5:
  general single -1.64#, -0.19, -1.39*, -1.16*; general complex -0.31, +4.05, +3.64, +5.34# (increases); bus-heavy single -0.55, -1.08*,
  -1.46#, +0.73#; bus-heavy complex -1.88*, -1.70*, -0.51#, +0.40#. So the press "~2% for 0.5 m widening" matches the best case
  (-1.88%), and the sign is not consistent. Conclusion text (p. 6-2): 0.5 m widening is the "較佳" measure across background types.
- "CO ~11%": I could not locate an 11% CO figure as a headline in the report (nearest table value: -11.28% CO, bus-heavy single-source
  peak-only scramble, Day 1). Treat as UNVERIFIED mapping.
- Report's own cautions (VERIFIED): field data at the scramble site were "相當不穩定" (quite unstable) around phase start/stop, attributed to
  weather and queueing; at the pedestrian-setback site PM2.5 after setback was "略微上升" (slightly higher). Summary p.1-6.
- Measured background (VERIFIED, July 2024): intersection fixed-sensor PM2.5 mostly 4-14 ug/m3 at 高鐵路/重信路 (daily means ~5.9-8.7
  by humidity class); 縣民大道/民權路 pedestrian waiting area 4-10 ug/m3 vs median-strip sensor up to ~16; nearby MOENV stations'
  hourly PM2.5 2-20 ug/m3 (板橋 2-13, 左營 4-18, 愛國國小 1-20). In summer 2024 the intersections were NOT dramatically above the stations.
- Year-1 measured setback result (VERIFIED, p.1-6/附1-4): moving the pedestrian waiting area away from the scooter waiting box
  (機車待轉區) reduced average PM2.5 at the waiting area by 0.46 and 0.94 ug/m3 (e.g. 重慶北路/酒泉街 0.94). Peak hours only; small absolute.
- Report also states the EV opportunity (p.6-3, VERIFIED): electric vehicles emit far less, so higher EV share "may" reduce concentrations;
  recommends counting EVs separately next time. No EV scenario was modelled.

### 1b. Press coverage (SECONDARY - search-tool summaries; pages not opened)
- Taipei Times 2025-04-07 https://www.taipeitimes.com/News/taiwan/archives/2025/04/07/2003834753 (403 to curl; search summary: scramble
  crossings and widened sidewalks "reduce pedestrians' exposure to PM2.5 by up to 94 and carbon monoxide by up to 11 percent"; 0.5 m widening
  "nearly 2%"; Taipei, New Taipei, Kaohsiung). 自由時報 https://news.ltn.com.tw/news/life/paper/1700267 ("行人專用時相 尖峰時少吸9成廢氣";
  summary: max reduction, not general; effect smaller at bus-heavy intersections; first IOT study from the pedestrian perspective).
  Both overstate versus the report: "up to" is a single-day model outlier, and the LTN "尖峰時少吸9成" headline implies a typical peak-hour effect.
  Verbatim quotes from these pages are NOT available to me.

---------------------------------------------------------------------------------------------------------------------------
## 2. Wu et al. 2021, Transportation Research Part D  (VERIFIED abstract)
- Citation: Wu, T.-G., Chang, J.-C., Huang, S.-H., Lin, W.-Y., Chan, C.-C., Wu, C.-F. (2021). Exposures and health impact for bicycle and
  electric scooter commuters in Taipei. Transportation Research Part D: Transport and Environment 91, 102696 (Feb 2021).
  DOI 10.1016/j.trd.2021.102696 (Crossref). (Tzong-Gang Wu, Jung-Chi Chang, Sheng-Hsiu Huang, Wan-Yu Lin, Chang-Chuan Chan, Chang-Fu Wu - NTU.)
- Design: BTEX and PM2.5 measured along four routes, rush and non-rush hours, by cyclists and motorcyclists in Taipei; plus health-impact modelling.
  Sample size/route lengths not in abstract.
- Numbers: total BTEX / PM2.5 mean = 20.07 ppb / 23.27 ug/m3 (cyclists); 33.96 ppb / 27.65 ug/m3 (motorcyclists).
- Quote: "Scooters could contribute more to PM2.5 exposure than buses/trucks and passenger cars." and "In conclusion, the number of scooters in
  traffic should be reduced, and commuters should be encouraged to shift from gasoline scooters to bicycles to reduce air pollution."
- Resolved: the conclusion is about GASOLINE scooters; "electric scooter" in the title is the Taiwanese-English term for scooters.
  Grok's wording ("scooters contributed most to local PM2.5 ... reduce gasoline scooters") is essentially right but the "most" claim is only
  "more than buses/trucks and passenger cars"; its 27.65 and ~34 ppb numbers are riders' route-average exposure, not pedestrian exposure.
- Caveats: rider-in-traffic exposure; only ~4.4 ug/m3 PM2.5 above cyclists; "alternative route" lowered exposure; single-pollutant HIM underestimates.

---------------------------------------------------------------------------------------------------------------------------
## 3. Taipei commuting-mode personal exposure

### 3a. Wang et al. 2021 (VERIFIED abstract; open access)
- Wang, C.-Y., Lim, B.-S., Wang, Y.-H., Huang, Y.-C. (2021). Identification of High Personal PM2.5 Exposure during Real Time Commuting in the
  Taipei Metropolitan Area. Atmosphere 12(3), 396. DOI 10.3390/atmos12030396. (Cardinal Tien Hospital, Fu-Jen Catholic Univ.; Duke.)
- Design: volunteers measured PM2.5 while commuting with a portable PM2.5 detector. Sample size/instrument not in abstract.
- Numbers, median (range) ug/m3: walking along streets 40 (10-275); bus 35 (13-65); car 15 (8-80); underground MRT stations 80 (30-210);
  MRT cars in underground sections 80 (55-185); elevated MRT stations 33 (15-35); elevated MRT cars 28 (13-68); riding motorcycle 75 (60-105),
  p<0.0001 vs walking; near temples 588 +/- 271; night-market underground food court 405 +/- 238.
- Quote: "Exposure to PM2.5 (median (range)) was higher when walking along the streets (40 (10-275) ug/m3) compared to riding the buses (35 (13-65)
  ug/m3) and the cars (15 (8-80) ug/m3)." "Riding motorcycle also was associated with high PM2.5 exposure (75 (60-105 ug/m3)".
- Grok's walking 40 (10-275) is CORRECT; motorcycle 75 (60-105) correct (the "50-75" range blends this with Chuang 53.6).
- Caveats: low-cost portable monitor (light-scattering, no gravimetric calibration stated in abstract); motorcycle range narrow (small n?);
  cooking/incense and MRT results are not traffic; a median walking value includes non-traffic sources.

### 3b. Chuang et al. 2020 (VERIFIED abstract)
- Chuang, K.-J., Lin, L.-Y., Ho, K.-F., Su, C.-T. (2020). Traffic-related PM2.5 exposure and its cardiovascular effects among healthy commuters in
  Taipei, Taiwan. Atmospheric Environment: X 7, 100084 (Oct 2020). DOI 10.1016/j.aeaoa.2020.100084. Open access (CC BY-NC-ND).
- Design: 120 healthy adults; six commute modes (electric subway, gasoline bus, gasoline car, gasoline scooter, walking, walking with facemask);
  six repeated measurements each, 09:00-10:00; mixed-effects models.
- Numbers: PM2.5 mean +/- SD highest scooter 53.6 +/- 26.1 ug/m3, lowest subway 21.7 +/- 5.8. Other modes' means not in abstract.
  Quote: "The PM2.5 level (Mean ± SD) was the highest in the scooter mode (53.6 ± 26.1 μg/m3) but the lowest in the subway mode (21.7 ± 5.8 μg/m3)."
  Scooter and walking modes associated with higher SBP (+7.9%, +6.5%), HR, urinary 8-OHdG. Recommends transit over scooters in rush hour.
- Caveat: single morning hour; walking and scooter both higher than subway; association, small effects, not causal proof.

---------------------------------------------------------------------------------------------------------------------------
## 4. Hotspots, UFP, black carbon, sensors, station comparison
- NTU modelling study (VERIFIED abstract): Chang, P.-K., Hsiao, T.-C. (2026). Evaluation of spatial distribution of cancer risk induced by
  traffic-related ultrafine particles within an urban microenvironment in New Taipei City, Taiwan. J. Hazardous Materials 502, 141024.
  DOI 10.1016/j.jhazmat.2026.141024. CFD (1.2 x 1.2 km, ~5 m resolution), 20-100 nm particles, four line-source classes. Quote: "Ground-level urban roads
  create narrow near-road bands with SAUFP maxima of about 40 μm2/cm3"; peak adult ELCR ~2.2e-4 (winter) to 3.0e-4 (summer); children (9 y) up to ~6.5e-4.
  Caveat: pure model, no motorcycle-specific source, cancer risk is a modelled index.
- Taipei City fixed stations, traffic vs general (VERIFIED, 臺北市政府環境保護局 113年空氣品質監測年報, Table 3-2-7, automatic PM2.5, ug/m3):
  general / traffic stations: 2017 14.6/18.2; 2018 15.7/20.5; 2019 14.1/19.2; 2020 12.6/16.2; 2021 13.2/16.5; 2022 11.0/12.6; 2023 10.6/12.7;
  2024 11.1/11.2 (9 general, 3 traffic stations). Report text: 「歷年交通測站…濃度皆高於一般測站」. Caveat: the report's section 2.4 text
  (13.2 / 16.5 for 2024) copies 2021 values and conflicts with its own station table; I used Table 3-2-7. Station list 2024 (Table 2-4-1):
  中正 11.0, 大直 10.6, 信義 11.7, 南港 11.5, 內湖 11.1, 木柵 10.2, 大安 12.2, 天母 11.3, 延平 10.0; traffic 承德 10.6, 中北 9.0, 向陽 14.0.
  URL https://www.tldep.gov.taipei/Public/DownLoad/AnnualReport/113.pdf (data "not adjusted for transboundary/special weather").
- Intersection vs station: only the IOT 2024 field data above (summer, low concentrations). No Taiwan study quantifying arcade (騎樓) vs station,
  no AirBox/Academia Sinica sidewalk-vs-station study found. UNVERIFIED / gap.
- Mobile UFP across intersections (VERIFIED abstract, NOT Taiwan): Choi, Ranasinghe, DeShazo, Kim, Paulson (2018) "Where to locate transit stops:
  Cross-intersection profiles of ultrafine particles and implications for pedestrian exposure" (agris.fao.org record 65df72f30f3e94b9e5d88121; the
  Paulson group is UCLA; the earlier "Taiwan" attribution is wrong/unconfirmed). 1744 profiles, 10 signalized intersections, breathing height 1.5 m.
- New Taipei camera study (VERIFIED abstract via DOAJ): Tsai, I-C., Lin, C.-W., Su, S.-H., Chang, C.-W., Su, C.-W., Lung, S.-C.C. (2024). Spatial and
  temporal analysis of scooter-induced traffic patterns and their environmental implications. Atmospheric Environment: X 23, 100291.
  DOI 10.1016/j.aeaoa.2024.100291. Sedans+scooters ~90% of vehicles (Sep 2021-Jun 2023, YOLOv4); "current emission inventories may underestimate the
  impact of scooters and buses on air quality while overestimating the trucks' contribution". Correlational.
- Tsai, I-C., Lee, C.-Y., Lung, S.-C., Su, C.-W. (2021) Sci. Total Environ. 782, 146571, DOI 10.1016/j.scitotenv.2021.146571 (VERIFIED abstract):
  vehicle emissions contribute >90% of CO, 80% NOx, ~50% PM2.5 in downtown Taipei (CMAQ sensitivity).
- Not found: Taiwan black-carbon/UFP at traffic lights with scooters (an NCU thesis exists, unopened).

---------------------------------------------------------------------------------------------------------------------------
## 5. Motorcycle emission factors (Taiwan)
- Ting, Y.-C., Chang, P.-K., Hung, P.-C., Chi, K.-H., Hsiao, T.-C. et al. (2023). Characterizing emission factors and oxidative potential of motorcycle
  emissions in a real-world tunnel environment. Environmental Research 234, 116601. DOI 10.1016/j.envres.2023.116601 (VERIFIED abstract; author list
  per Semantic Scholar: Y. Ting, Po-Kai Chang, Po-Chang Hung, C. Charles, Kai-Hsien Chi, T. Hsiao). Taipei urban tunnel; PM2.5, eBC, CO, CO2 EFs by
  regression for HDV, LDV, MC. Quote: "HDVs dominated PM2.5 and eBC concentrations, while LDVs and MCs influenced CO and CO2 levels. The CO emission factor
  ... was found to be higher than those in previous studies, likely owing to the increased fraction of MCs, which generally emit higher CO levels."
  Numeric EFs not in abstract (full text needed). No PAH/2-stroke split.
- Tsai, J.-H., Chen, J.-Y., Chiang, H.L. (2023). Airborne Air Pollutant Emission Characteristics of Mobile Vehicles in Taiwan. Atmosphere 14(6), 916.
  DOI 10.3390/atmos14060916 (VERIFIED abstract). Four-stroke motorcycles = 32.6% of road vehicle-km (2021), gasoline cars 42.6%. EF order: PM2.5 diesel >
  gasoline > motorcycle; NOx diesel > gasoline > motorcycle; HC motorcycle > gasoline vehicles; benzene motorcycle > gasoline >= diesel; formaldehyde
  diesel > motorcycle >= gasoline. HONEST NOTE: per vehicle-km, motorcycle PM2.5 EF is the LOWEST of these classes; scooter harm is HC/benzene/CO,
  fleet size, proximity. Modelled/inventory EFs (MOVES), not roadside measurements.
- Tsai, J.-H., Yao, Y.C., Huang, P.-L., Chiang, H.L. (2018). Fuel Economy and VOC Exhaust Emission for Motorcycles with Various Running Mileages. Aerosol
  Air Qual. Res. 18. DOI 10.4209/aaqr.2018.07.0264 (VERIFIED abstract). Chassis dyno. Regulation phase V: CO 84.3 +/- 40.9, HC 29.4 +/- 13.1, NOx 8.0, CO2 2098 g/L fuel;
  fuel economy 34.7 km/L (phase V), 32.6 (IV), 29.5 (III); vs phase V, phases III/IV: CO +156%/+48%, HC +84%/+9%; VOC EF 25.2 g/L (5,231 km) -> 47.1 g/L (47,617 km);
  aromatics 38-48% of VOC; benzene among main species. (Old vs new, mileage effect VERIFIED. Cold start / 2-stroke: not in abstract.)
- Lin, Y.-C., Chou, F.-C., Li, Y.-C., Jhang, S.-R., Shangdiar, S. (2019). J. Hazardous Materials 365, 771-777, DOI 10.1016/j.jhazmat.2018.11.056 (VERIFIED abstract): ten in-use
  motorcycles; total p-PAH EF 67.6 +/- 13.6 ug/km; high-mileage (30,001-50,000 km) carcinogenic toxic equivalent ~4.67x / 1.99x the low / mid-mileage.
- Tsai, Huang, Chiang (2017) Atmos. Environ. 153, DOI 10.1016/j.atmosenv.2017.01.019 - exists (Crossref), abstract withheld; Hwa et al. 2002 Atmos. Environ. 36
  (Taipei tunnel VOCs), DOI 10.1016/S1352-2310(02)00148-6 - abstract withheld. Not used.
- NOT obtained: scooter-vs-car per-km ratios for CO from a single Taiwan source, 2-stroke vs 4-stroke, cold-start effect, scooter share of roadside benzene/UFP.
- Idling at red lights: modelling assumption in IOT report (5 km/h EF); no measured Taiwan idling data found.

---------------------------------------------------------------------------------------------------------------------------
## 6. Exhaust height, scooter boxes, vertical gradient
- Exhaust height: only the IOT model assumption (0.5 m source height, quoted above) - an assumption, not a measurement. IOT field sensors at 1.2-1.5 m.
- Waiting box: measured setback result (0.46 / 0.94 ug/m3 average PM2.5 reduction; section 1a). Modelled setback 6 m / 10 m results in Tables 4.3.2-29..32 (mostly within +/-3%).
- Child vs adult height (NOT Taiwan; VERIFIED abstract): Harr, L., Sinsel, T., Simon, H., Konter, O., Dreiseitl, D., Schulz, P., Esper, J. (2022). PM2.5 exposure
  differences between children and adults. Urban Climate 44, 101198. DOI 10.1016/j.uclim.2022.101198. Mainz, Germany, 5.5 km route, Nov 2019, 8 days, OPC-N3 low-cost
  sensors at 1.0 m and 1.6 m: children "exposed to > 20% higher concentrations on six days (p < 0.01)", one day > 80%; strongest height differences near high-traffic streets.
  Cite as international/low-cost sensor evidence only. (The IOT report cites this paper.)

---------------------------------------------------------------------------------------------------------------------------
## 7. E-scooter adoption and air quality
- The claimed "county-level analysis: more e-scooters -> lower ambient PM10, CO, SO2, NO2" paper was NOT found despite targeted searches (Crossref, Semantic Scholar, web).
  Mark the Grok claim UNVERIFIED / likely unsupported. Nearest real items: an NCCU master's thesis (YouBike/WeMo panel, AQI outcome, unpublished; SECONDARY via search);
  Hsieh, Chang, Yu, Wu (2018), IOP Conf. Ser.: Earth Environ. Sci. 191, 012136, DOI 10.1088/1755-1315/191/1/012136 (VERIFIED abstract).
- Hsieh et al. 2018 (modelling, heavy-duty scooters, energy-flow + system dynamics): per-km EF of electric vs gasoline scooters in 2016: TSP -14.8%, NOx -97.4%, VOCs -100%, CO2e -76.8%;
  SOx 2.4x higher for electric (gap narrowing to +22.2% by 2025). Quote: "the EF of TSP, NOx, VOCs, and CO2e for ESH reduce by, respectively, 14.8%, 97.4%, 100%, and 76.8% per kilometer travelled in 2016".
  Caveat: life-cycle/grid emissions counted at power plants; tailpipe CO not in abstract; conference paper.

---------------------------------------------------------------------------------------------------------------------------
## 8. Benchmarks
- Taiwan (VERIFIED, opened https://airtw.moenv.gov.tw/CHT/Information/Standard/Rules.aspx): 空氣品質標準, 中華民國113年9月30日環境部空字第1131062467號令修正發布.
  PM2.5: 24-hour value 30 ug/m3; annual 12 ug/m3. PM10: daily 75, annual 30. NO2: hourly 0.100 ppm, annual 0.021 ppm. SO2 hourly 0.065 ppm, annual 0.008 ppm. CO 1-h 31 ppm, 8-h 9 ppm.
  O3 1-h 0.100 ppm, 8-h 0.060 ppm. (Page header does not state the effective date; news summaries say AQI thresholds changed from 1 Jan 2025 - SECONDARY.)
  Old values 15 / 35 (per news summaries; SECONDARY). MOENV targets <=10 (2030), <=8 (2035) (news summary, SECONDARY).
- WHO 2021: PM2.5 annual 5, 24-h 15 ug/m3 (my background knowledge; who.int pages opened did not show the table and NCBI Bookshelf was behind a captcha) - UNVERIFIED this
  session; confirm from WHO "Global air quality guidelines" (2021), Table 0.1. WHO interim target 1 for PM2.5 annual is 35 (confirmed in WHO fact sheet text opened).
- National annual mean PM2.5: UDN https://udn.com/news/story/7266/9237319 (SECONDARY): 16.2 (2019) -> 12.8 (2025, "114年") ug/m3, 21% improvement; one earlier summary gave 12.6 to 3 Dec. Not verified at MOENV.
- Taipei station annual means: see Section 4 (Taipei EPD report, VERIFIED). MOENV station-level data not retrieved.

---------------------------------------------------------------------------------------------------------------------------
## Corrections to the handover
1. 94%: not a measured or typical value. It is a MODELLED PM2.5 reduction at a pedestrian waiting area in an exclusive-phase vs no-exclusive-phase simulation, on one day (Day 2) at one
   Kaohsiung intersection (高鐵路/重信路), flagged by the report itself as an outlier ("明顯高於其他模擬值"). Other days at that site -12% to -21%; at Taipei/New Taipei single-source sites -4% to -10%
   (some days positive) and modelled CO often rose. The headline must not read as "scramble crossings cut exposure 94%". Safer: "in the IOT model, exclusive pedestrian phases lowered PM2.5 at
   pedestrian waiting areas by roughly 3-21% on typical simulated days, with one simulated day showing 94%."
2. IOT = Institute of Transportation, a government think-tank; its cover says views do not represent MOTC. Sidewalk widening ~2% is the best case of mixed-sign model results.
3. Wu et al.: correct paper and numbers, DOI 10.1016/j.trd.2021.102696; conclusion is about gasoline scooters (verified). "Most" = more than buses/trucks/cars.
4. Walking median 40 (10-275) and motorcycle 75 (60-105) are from Wang et al. 2021 (correct); the scooter 53.6 +/- 26.1 is Chuang et al. 2020 (different study); do not merge into "50-75".
5. "Choi 2018 UFP intersections" and "arXiv 2011.09286" are not Taiwan studies; do not attribute to Taiwan.
6. County-level e-scooter pollutant-reduction paper: not found - drop or mark unverified.
7. Scooter PM2.5 per vehicle-km is lower than cars/diesel in Taiwan inventories (Tsai 2023); the case rests on HC/benzene/CO, fleet size, proximity and rider exposure.
8. Taipei City EPD 2024 report's own text (13.2/16.5) is stale/inconsistent; use Table 3-2-7 (11.1 vs 11.2).
9. Taiwan 24-h PM2.5 standard is 30 (not 35); WHO 24-h is 15; annual 12 vs WHO 5.

## Chart-ready data
Table A - PM2.5 by commute mode, Taipei (median, ug/m3) - source: Wang et al. 2021, Atmosphere 12(3):396, VERIFIED abstract
| Mode | Median | Range |
| Walking along streets | 40 | 10-275 |
| Bus | 35 | 13-65 |
| Car | 15 | 8-80 |
| Motorcycle | 75 | 60-105 |
| MRT elevated (cars) | 28 | 13-68 |
| MRT underground (cars) | 80 | 55-185 |
Table B - PM2.5 by mode (mean +/- SD) - source: Chuang et al. 2020, Atmos. Environ. X 7:100084, VERIFIED abstract (only these two modes reported in abstract)
| Scooter | 53.6 +/- 26.1 | Subway | 21.7 +/- 5.8 |
Table C - Rider route-mean exposure - source: Wu et al. 2021, TR-D 91:102696, VERIFIED abstract
| Group | PM2.5 ug/m3 | BTEX ppb |
| Cyclists | 23.27 | 20.07 |
| Motorcyclists | 27.65 | 33.96 |
Table D - Traffic vs general station PM2.5 (annual mean ug/m3), Taipei City 9 general / 3 traffic stations - source: Taipei EPD 113年報 Table 3-2-7, VERIFIED
| Year | General | Traffic |
| 2017 | 14.6 | 18.2 |
| 2018 | 15.7 | 20.5 |
| 2019 | 14.1 | 19.2 |
| 2020 | 12.6 | 16.2 |
| 2021 | 13.2 | 16.5 |
| 2022 | 11.0 | 12.6 |
| 2023 | 10.6 | 12.7 |
| 2024 | 11.1 | 11.2 |
Table E - IOT modelled PM2.5 change from all-day scramble, by simulation day (%), source: IOT 114-084-6228 Tables 4.3.2-29/-30, VERIFIED (model output; # = failed model check)
| Case | Day1 | Day2 | Day3 | Day4 |
| General, single source (Taipei/New Taipei) | -7.51 | -10.23 | +10.22# | -4.38# |
| General, complex source (Kaohsiung 高鐵路/重信路) | -17.79 | -94.86 | -16.22# | -12.00# |
Table F - IOT modelled PM2.5 change from 0.5 m sidewalk widening (%), Tables 4.3.2-29..32
| Case | Day1 | Day2 | Day3 | Day4 |
| General, single | -1.64# | -0.19 | -1.39 | -1.16 |
| General, complex | -0.31 | +4.05 | +3.64 | +5.34# |
| Bus-heavy, single | -0.55 | -1.08 | -1.46# | +0.73# |
| Bus-heavy, complex | -1.88 | -1.70 | -0.51# | +0.40# |
Table G - Standards (ug/m3 PM2.5): Taiwan annual 12, 24-h 30 (VERIFIED, MOENV 113.9.30 order); WHO 2021 annual 5, 24-h 15 (UNVERIFIED this session)
Table H - Motorcycle phase effect (Tsai et al. 2018 AAQR 18, VERIFIED abstract): CO vs phase V +156% (III), +48% (IV); HC +84% (III), +9% (IV); fuel economy 29.5 / 32.6 / 34.7 km/L (III/IV/V)
