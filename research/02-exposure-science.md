# 02 - Exposure science: pedestrian and street-level exposure (Taiwan)

Researcher status as of 2026-11-25: **INCOMPLETE VERIFICATION.** In this session WebFetch could not resolve ANY host
(taipeitimes.com, mdpi.com, scholars.lib.ntu.edu.tw, pubmed.ncbi.nlm.nih.gov all returned DNS failure "outside allowed
network domains"). Only WebSearch worked, and it returns summarised snippets. Therefore NOTHING below is tagged VERIFIED
(= I opened the source). Tags used: SECONDARY (reported by search-result summaries of a real, named page) or UNVERIFIED.
Every number must be re-checked against the primary source before publication. No DOIs are given because I did not see any;
none were invented. To finish: allow taipeitimes.com, mdpi.com, sciencedirect.com, doi.org, iot.gov.tw, moenv.gov.tw,
scholars.lib.ntu.edu.tw, pubmed.ncbi.nlm.nih.gov in the session network settings and re-run.

## 1. IOT scramble-crossing study (the "94%")

- Source found: Taipei Times, 2025-04-07, https://www.taipeitimes.com/News/taiwan/archives/2025/04/07/2003834753
  (URL appeared in search results; page text not opened by me). Confidence: SECONDARY (via search summary).
- What the report is said to say (paraphrase from search summary, not verbatim from the page): Institute of Transportation
  (Ministry of Transportation and Communications) found pedestrian scramble crossings and widened sidewalks helped reduce
  pedestrians' exposure to PM2.5 "by up to 94" and carbon monoxide "by up to 11 percent"; study covered intersections in
  Taipei, New Taipei and Kaohsiung; effect strongest at intersections with relatively complex traffic; widening sidewalks
  by 0.5 m reduced PM2.5 exposure by "nearly 2%"; signal-timing optimisation and crosswalk setbacks helped less.
- Exact meaning of 94%: **NOT DETERMINED.** The wording is "up to", i.e. a best-case/maximum, not an average. Unknown:
  whether measured or modelled/simulated, which comparison (scramble vs ordinary phasing for the pedestrian), which
  intersection, whether it is PM2.5 concentration or personal dose. The attribution of the 94% to scramble alone vs
  scramble+widened sidewalk is ambiguous in the snippet ("scramble crossings and widened sidewalks ... up to 94").
  The site must NOT present 94% as a typical or average effect, and should not tie it to scooter exhaust specifically.
- No IOT report (iot.gov.tw), CNA, UDN, LTN or Focus Taiwan item found; a Chinese-language search returned none. Only one
  news source seen -> treat the figure as UNVERIFIED at primary level. Action: find the IOT research report (title likely
  includes 行人專用時相 / 空氣污染 / 暴露) and read the methods.
- Possible relevant primary context (not the IOT study): arXiv 2011.09286 (2020 preprint) pedestrian PM exposure at an urban
  intersection, crosswalk vs curb waiting; search summary also cited a study finding PM10/PM2.5 exposure at a four-way
  intersection 7.3x / 1.2x higher under congested than free-flow conditions (source not identified; UNVERIFIED).

## 2. Wu et al. - bicycle and electric-scooter commuters in Taipei

- Real paper (located via search, abstract text summarised by search tool): "Exposures and health impact for bicycle and
  electric scooter commuters in Taipei", Transportation Research Part D, vol. 91 (2021; Feb 2021 per BL catalogue).
  First-name initials, DOI and page number NOT seen -> UNVERIFIED. Listed at eld.bl.uk/catalog/100121175818_0x000001 and
  NTU scholars hub (scholars.lib.ntu.edu.tw/handle/123456789/601780).
- Design (from abstract summary): BTEXs and PM2.5 measured along four routes during rush and non-rush hours by cyclists and
  motorcyclists in Taipei; also health-impact modelling.
- Numbers (SECONDARY, via abstract summary): bicycle commuters 20.07 ppb BTEX and 23.27 ug/m3 PM2.5; motorcyclists
  33.96 ppb BTEX and 27.65 ug/m3 PM2.5. Grok's "~34 ppb" and "27.65" match. Abstract: "Due to their ubiquity, scooters
  contributed the most to PM2.5"; alternative route gave lower exposure; single-pollutant health modelling may
  underestimate.
- Corrections: the title says "electric scooter" commuters, but the measured group appears to be "motorcyclists"; check the
  paper to see whether the scooters were gasoline or electric (Grok's "reduce the number of gasoline scooters" conclusion is
  NOT visible in the abstract summary -> UNVERIFIED). Also 27.65 is a rider-in-traffic mean on measured routes, not
  pedestrian exposure, and only ~4 ug/m3 above cyclists -> do not oversell.

## 3. Taipei commuting-mode personal exposure

A. Wang et al.(first author per search summary; initials unverified), "Identification of High Personal PM2.5 Exposure during
   Real Time Commuting in the Taipei Metropolitan Area", Atmosphere (MDPI) 12(3), 396, March 2021.
   https://mdpi.com/2073-4433/12/3/396 (DOAJ: doaj.org/article/9d908932fc744525b708b17b0d21c312). DOI not seen.
   Design: volunteers carried portable PM2.5 monitors across modes. SECONDARY numbers (search summary): median PM2.5
   walking along streets 40 ug/m3; bus 35; car 15; underground MRT stations/trains ~80; elevated MRT ~28-33. Riding
   motorcycle "associated with high PM2.5 exposure compared with walking" (numbers not seen). Grok's "walking median ~40,
   range 10-275" : the 40 matches; the 10-275 range and "scooter 50-75" are UNVERIFIED (not seen).
   Caveat: real-time portable monitors (likely light-scattering) - accuracy/RH bias; sample size not seen.
B. Cardiovascular commuter study (120 commuters; TMU hub, "Traffic related PM2.5 exposure and its cardiovascular effect",
   hub.tmu.edu.tw/en/publications/traffic-related-pmsub25sub-exposure-and-its-cardiovascular-effect/): PM2.5 scooter mode
   53.6 +/- 26.1 ug/m3; subway 21.7 +/- 5.8 ug/m3. SECONDARY (search summary only; authors/journal/year not captured).
C. Older 2004-2005 sampling study reported by Taipei Times (2007-05-04): scooter riders highest, MRT lower. SECONDARY, weak.

## 4. Hotspots, UFP, black carbon, low-cost sensors

- NTU team, 3D modelling of traffic ultrafine particles (<100 nm) in a 1.2 km square in Zhonghe, New Taipei; Journal of
  Hazardous Materials, 2026 (per labspotlight.ntu.edu.tw/focus/278). Finds curbside zones near ground-level roads most
  intense; hotspots around street canyons/intersections. MODELLED, not measured; authors say for comparing scenarios not
  predicting cancer cases. SECONDARY; citation details not seen.
- 2018 mobile-platform study, 1,744 profiles: UFP peaked within 30 m of intersection centres (stop/accelerate); suggested bus
  stops 40-50 m past intersection (agris.fao.org/search/zh/records/65df72f30f3e94b9e5d88121). Location of this study not
  confirmed as Taiwan; UNVERIFIED for Taiwan.
- NCU thesis (etd.lib.ncu.edu.tw/detail/c91edbfde257e7a8cbd0f93b961ccb10): mobile UFP and black carbon on northern Taiwan
  roads linked to cars and motorcycles. SECONDARY; thesis, not peer-reviewed.
- Northern Taiwan roadside particle study: UFP mostly soot coated with condensables (NTU scholars record 7ca9ed91-...).
- AirBox / Academia Sinica, arcades (騎樓), curb gradients vs nearest station: NOTHING found. UNVERIFIED / gap.

## 5. Motorcycle emission factors (Taiwan)

- Ting et al. 2023, Taipei urban tunnel, Environmental Research (per search summary; PubMed 37429395): EFs for PM2.5, eBC,
  CO, CO2; CO EF higher than previous studies, attributed to larger motorcycle fraction. No PAH, no 2-stroke/4-stroke split.
  SECONDARY; full citation not seen. Check at www.pubmed.gov/37429395.
- Tsai et al. 1998 Kaohsiung Chung-Cheng tunnel: CO, NOx, NMHC 6.25, 1.51, 1.02 g/veh-km (whole fleet; conference report).
- NYCU: "Characterizing emission factors and oxidative potential of motorcycle ..." (scholar.nycu.edu.tw) - exists, content
  not seen. Atmosphere 14(6), 916 (2023) "Airborne Air Pollutant Emission Characteristics of Mobile Vehicles in Taiwan"
  (mdpi.com/2073-4433/14/6/916) - exists, content not seen.
- AAQR: Tsai et al. 2018 "fuel economy and VOC exhaust emission for motorcycles with various running mileages" - seen only in
  a reference list; UNVERIFIED. Per-km scooter vs car ratios, cold-start, 2- vs 4-stroke: NOT obtained.

## 6. Exhaust height / waiting zones / vertical gradient

- No Taiwan study on scooter waiting-box or tailpipe-height emissions found. A pedestrian-exposure paper (arXiv 2011.09286)
  describes idling at red then intensified emissions on acceleration; international/general. A Tehran study found small
  child-vs-adult-height PM2.5 difference (children slightly higher) - not Taiwan, not verified. Mark all UNVERIFIED; the
  site should not claim tailpipe-height effects without a source.

## 7. E-scooter adoption and air quality

- The "county-level analysis: more e-scooters -> lower PM10, CO, SO2, NO2" paper was NOT found. Nearest: Hsieh et al. 2018
  system-dynamics model of emissions in e-scooter transition (modelling, not monitored data); NCCU theses on YouBike/WeMo
  (city panel, 63 city-years, pollutants not seen); bikeshare study with 19 Taipei/New Taipei stations (PMC8352669) - U-bike,
  not scooters. Treat the Grok claim as UNVERIFIED/possibly fabricated.

## 8. Benchmarks

- WHO 2021 AQG: PM2.5 annual 5, 24-h 15 ug/m3 (from my background knowledge, not re-opened this session; verify at who.int).
- Taiwan (via search summary of MOENV news; SECONDARY): PM2.5 standard tightened from annual 15 / 24-h 35 to annual 12 /
  24-h 30 ug/m3; AQI thresholds adjusted from 2025-01-01 (114 year); MOENV targets <=10 by 2030, <=8 by 2035.
  Effective date of the amended standard not confirmed. National annual mean PM2.5 12.6 ug/m3 for 2025 (to 3 Dec) vs 16.2 in
  2019 (udn.com/news/story/7266/9237319, SECONDARY). Taipei-area ambient/roadside station annual means: NOT obtained.

## Corrections to the handover
1. 94%: only "up to", from one news report; pollutant PM2.5 but basis (measured/modelled, comparison) unknown. Not an average.
   Possibly combined scramble + wider sidewalk. CO figure is "up to 11%".
2. Wu et al.: real paper, numbers match, but title refers to e-scooters; "gasoline scooters conclusion" unconfirmed.
3. "Scooter 50-75 ug/m3" and "10-275 range" unconfirmed; the one scooter figure seen is 53.6 +/- 26.1 (120-commuter study).
4. County-level e-scooter pollutant-reduction paper: not found.
5. Taiwan 24-h PM2.5 standard is now 30 (not 35); WHO 24-h is 15 - do not conflate.

## Chart-ready data (all SECONDARY; re-verify)
| Mode | PM2.5 ug/m3 | Statistic | Source |
|---|---|---|---|
| Walking (street) | 40 | median | Atmosphere 12(3):396 (2021) |
| Bus | 35 | median | same |
| Car | 15 | median | same |
| MRT underground | ~80 | approx | same |
| MRT elevated | 28-33 | range | same |
| Scooter | 53.6 (SD 26.1) | mean | 120-commuter TMU study |
| Subway | 21.7 (SD 5.8) | mean | same |
| Cyclist (4 routes) | 23.27 | mean | Wu et al. TR-D 91 (2021) |
| Motorcyclist | 27.65 | mean | same |

| Pollutant | Cyclist | Motorcyclist | Source |
|---|---|---|---|
| BTEX ppb | 20.07 | 33.96 | Wu et al. 2021 |

| Benchmark | Annual | 24-h | Source |
|---|---|---|---|
| WHO 2021 | 5 | 15 | WHO (unverified here) |
| Taiwan old | 15 | 35 | MOENV via news |
| Taiwan new | 12 | 30 | MOENV via news |
