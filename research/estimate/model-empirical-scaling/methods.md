# Kerb exposure during one 90-second red: empirical-scaling estimate

Key: `model-empirical-scaling`. Written 2026-11-26.
Script: `estimate.js` in this folder (`node estimate.js`, no dependencies, seeded Monte Carlo with 200,000 draws). Full printout: `output.txt`.
This is an **ESTIMATE, not a measurement.** All results are increments above the urban air-quality-station level unless a line says TOTAL.

## 1. Method in plain language

I used no dispersion model. I started from CO measured in Taiwan near where a pedestrian stands, and scaled it to the scene.

* **Route A (IOT kerb sensors).** In July 2024 the MOTC Institute of Transportation (IOT) ran micro-sensors at pedestrian waiting zones of four Kaohsiung junctions. Each logged one value a minute at 1.2–1.5 m height, 1.0–1.5 m from the crosswalk line. For each junction I took the reported 48-hour maximum minute and subtracted the concurrent hourly CO at the nearby station. I divided that excess by the number of scooters queued at the end of red on the approach, computed from IOT's own peak-hour motorcycle counts. That gives "ppm per queued scooter". I rescaled this to three queue sizes and applied four corrections:
  * a typical red against the worst minute of two days (fTyp);
  * the 90-second mean against the most loaded minute (a90);
  * standing at the kerb edge beside the stop box against the sensor's spot (prox);
  * the low-cost sensor's gain (sensorGain).
* **Route B (reference stations).** The MOENV traffic stations exceed the urban stations by 0.30 ppm CO as an annual mean. These are Horiba-class analysers. I scaled that excess to a peak hour (pkB), to breathing height (hgtB) and to the kerb beside a queue at a red light (isecB), then to queue size.
* **Combining the routes.** The two routes disagree by a factor of about 5 (section 5). I did not pick one. The reported CO is a 50/50 mixture of the two, so the disagreement shows up in the spread.
* **Other species from ratios to CO.**
  * Benzene and total hydrocarbons use mass ratios to CO from scooter exhaust.
  * Particle number and PM2.5 each get two routes:
    * "All local traffic" uses Taiwanese ambient ratios of the roadside excess to the CO excess. These ratios include diesel traffic and pull-away.
    * "Scooter exhaust only" uses emission ratios from scooter exhaust.

## 2. Equations

Route A calibration, for each anchor *i*. I drew the station background `bg_i`, the peak volume `V_i`, the approach share `s` and the red length `T` from the input ranges:

    Δ_i  = max(kerbMax_i − bg_i, 0.02 ppm)
    N_i  = V_i · s · T / 3600                    (scooters queued at end of red on the approach)
    k_i  = Δ_i / N_i^b ;   k = exp( Σ w_i ln k_i / Σ w_i )

The scenario estimates are then:

    CO_A   = k · N^b · fTyp · a90 · prox · sensorGain          [ppm]
    CO_B   = dTS · pkB · hgtB · isecB · (N / Nref)^b           [ppm]
    CO     = CO_A with probability 0.5, else CO_B
    CO_mg  = CO · 28.01 / 24.45                                [mg/m³, 25 °C]
    benzene µg/m³ = CO_mg · rBenz · 1000 ;  ppb = µg/m³ · 24.45 / 78.11
    THC µg/m³ = CO_mg · rTHC · 1000 ;  ppmC = µg/m³ / 13.86 · 24.45 / 1000   (CH1.85 basis)
    PN_all  = CO · rPNamb  [#/cm³] ;  PN_scooter = CO_mg·10⁻³ · rPNscoot / 10⁶  [#/cm³]
    PM_all  = CO · rPMamb  [µg/m³] ;  PM_scooter = CO_mg · rPMscoot · 1000     [µg/m³]
    TOTAL = increment + background (drawn independently)

Dimensions were checked in the script. 1 ppm CO = 1.146 mg/m³ and 1 ppb benzene = 3.195 µg/m³. For the scooter particle route: (g/m³) × (#/g) / (10⁶ cm³/m³) = #/cm³.

## 3. Inputs

Verification tags: v = I or the sister input agent opened the source and found the figure in it; s = secondary; A = my assumption.

| Input | Value (range) | Distribution | Source / basis | Tag |
|---|---|---|---|---|
| IOT kerb 1-min maxima | Mingcheng 1st/Minzu 1st 1.3; Qixian 1st/Minzu 2nd 0.62; Zhongzheng 2nd/Minzu 2nd 0.50; HSR Rd/Chongxin 0.50 ppm | fixed | Hung P-Y et al., *路口交通環境特性對空氣品質影響及改善指引之研訂(2/2)*, MOTC IOT, IOT-113-TB006, Dec 2025, sec 3.3.2 pp.3-60–3-65. Full text read (pdftotext). [PDF](https://www.iot.gov.tw/uploads/column_entry_file/file/697879c4085777f955e15ddf/%E8%B7%AF%E5%8F%A3%E4%BA%A4%E9%80%9A%E7%92%B0%E5%A2%83%E7%89%B9%E6%80%A7%E5%B0%8D%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E5%BD%B1%E9%9F%BF%E5%8F%8A%E6%94%B9%E5%96%84%E6%8C%87%E5%BC%95%E4%B9%8B%E7%A0%94%E8%A8%82_2.2_.pdf) | v |
| Concurrent station hourly CO | Aiguo 1–5 Jul 0.03–0.28, 8–11 Jul 0.08–0.52; Zuoying 0.09–0.56 ppm. Sampled 0.05–0.45 / 0.10–0.50 / 0.15–0.45 | uniform | IOT sec 3.2.1 p.3-44. The sec 3.3.2 text describes the Aiguo plot as "mostly 0.4–1 ppm", which contradicts sec 3.2.1, so I widened the range | v |
| Peak-hour motorcycles, whole junction | 8,194–9,572 / 6,138–6,338 / 5,875–6,431 / 1,620–1,640 per h | uniform | Report's motorcycle "PM2.5-weighted" peak values ÷ 0.025. 0.025 = 149.35/5,974.21, from the report's own 12-hour mean figures (my arithmetic). PCU/h of 6,784 confirms these are per-hour flows. **The scene input divided 5,974 by 12 and is wrong by 12×; gap-answers-a is right.** | v (counts), A (division) |
| Anchor weights | 0.40 / 0.25 / 0.20 / 0.15 | fixed | A. The busiest site has the largest signal-to-noise ratio; at the quiet site the excess is near sensor noise | A |
| Approach share s | 0.20–0.35 | uniform | 4-arm junction, main road somewhat above ¼ | A |
| Red length at anchors T | 83 (70–110) s | triangular | IOT Table 2.2.4-2: main road red 80–83 s, other approaches 95–130 s. Phase assignment inferred by the scene agent | s |
| Queue exponent b | 0.6–1.0 | uniform | C ∝ N^b. Scooters at the back of a long queue add less. The anchors (N about 10–60) do not pin b | A |
| fTyp | 0.5 (0.3–0.85) | lognormal | Typical peak-hour red ÷ 48-h maximum minute. The maximum is the top of about 100 peak-hour reds; a GSD of 1.5–2 gives max/median of 2–4 | A |
| a90 | 0.77 (0.55–1.0) | triangular | Uniform arrivals with C ∝ N(t)^b give 0.77 at b = 0.85. 1.0 if the queue is full from the start; 0.55 if the IOT maximum minute was a green pull-away | A |
| prox | 1.3 (1.0–2.2) | lognormal | exp(k·Δd), with k 0.02–0.4 /m (Kenagy et al. 2016, *Air Qual Atmos Health* 9:589, roadside NO₂, verified by the dispersion input agent) and Δd 0.5–2 m (A) | A |
| sensorGain | 1.0 (0.75–1.6) | lognormal | Low-cost electrochemical sensor near 0.5 ppm. Calibrated at ITRI per IOT; error not stated | A |
| dTS (route B) | 0.30 (0.20–0.40) ppm | uniform | MOENV *114年空氣品質監測年報*, Table 3-23: traffic stations 0.54, general stations 0.24 (2025). [Report](https://service.moenv.gov.tw/File/Get/moenv/zh-tw/VKuWKdIp1pJZHmU). Taipei City 2024: 0.80 traffic vs 0.49 general (gap-answers-c) | v |
| pkB | 2.0 (1.3–3.5) | lognormal | Peak-hour ÷ annual-mean road excess. Ting et al. 2023 (*Environ Res* 234:116601, doi:10.1016/j.envres.2023.116601) report a weekday peak of about 6,500 veh/h against 40,500 veh/day, i.e. 3.8× the mean hourly flow. Daytime mixing damps this | A |
| hgtB | 1.25 (1.0–1.6) | lognormal | Station inlet heights not obtained. Goel & Kumar 2016: particle number about 40% lower at 4.7 m than near the ground (repo, secondary) | A |
| isecB | 1.5 (1.0–2.5) | lognormal | Kerb beside a queue at red, against a station a few metres back. Kenagy decay over Δd 1–4 m; upper end set by the red/green UFP ratio of 3.5 (Wang et al. 2008, *JAWMA* 58:1449, abstract) | A |
| Nref (route B) | 35 (22–50) | lognormal | Traffic stations treated as a typical busy arterial | A |
| Route weight wA | 0.5 | fixed | See section 5 | A |
| rBenz (benzene/CO mass) | 0.35% (0.1–1.0%) | lognormal | 0.07/21 g/h = 0.33% (inputs-emission-rates; Yao et al. 2008, *Atmos Environ* 42:6560: benzene about 3% of THC, verified). 0.5% (0.06–1.0%) (inputs-speciation-particles). Low end: Taiwan inventory benzene = 0.77% of motorcycle HC (Tsai 2023, secondary) × HC/CO 0.11 | s |
| rTHC (THC/CO mass) | 0.12 (0.04–0.33) | lognormal | 2.4/21 (Yilan inspection plus bench, emission-rates file). 10.3/60.9 = 0.17 (Hanoi laboratory, Nguyen 2021, doi:10.1080/12265934.2020.1871059, abstract). Tsai 2018 cycle values 0.25–0.35 (abstract). The inspection analyser's HC basis is unverified | s |
| rPNamb | 5×10⁴ (2.5×10⁴–10⁵) #/cm³ per ppm | lognormal | (Taiwan roadside 25,000–38,000, Abdillah 2024 AAQR, abstract only, minus Taipei background 13,900, Cheung et al. 2013 *ACP* 13:8935, verified) ÷ 0.30 ppm (MOENV) = 3.7–8×10⁴ | s |
| rPNscoot | 2×10¹¹ (10¹⁰–6×10¹¹) # per g CO | lognormal | Kontses et al. 2020, *Environ Res* 182:109071 (doi:10.1016/j.envres.2019.109071): solid particles >23 nm, WMTC cycle, ×46.9 km/kg, ÷250 g CO/kg. High end raised to cover sub-23 nm particles (+25–67%) and 2% two-strokes (about 10× the particle number) | s |
| rPMamb | 6.7 (3–12) µg/m³ per ppm | lognormal | MOENV 2025: PM2.5 15.4 at traffic stations vs 13.4 at all stations, over 0.30 ppm CO | s |
| rPMscoot (PM2.5/CO mass) | 0.1% (0.01–0.8%) | lognormal | Nepal idle 0.089–1.14% (Jayarathne et al. 2018, *ACP* 18:2259, verified; old carburetted bikes, oil-dominated). Ting 2023 tunnel motorcycles 0.013 g/kg ÷ 209 g/kg = 0.006% | s |
| Background CO | 0.24–0.60 ppm | uniform | MOENV 2025 annual means (0.24 general, 0.54 traffic; 0.61 traffic in 2024) | v |
| Background benzene | 2.5 (1.2–4.5) ppb | lognormal | Taipei 2.54 ppb (Wu et al. 2021, *Transp Res D* 91:102696, repo extraction) | s |
| Background particle number | 13,900 (7,000–25,000) #/cm³ | lognormal | Cheung et al. 2013 | v |
| Background PM2.5 | 13.4 (6–30) µg/m³ | lognormal | MOENV 2025 annual mean | v |

**Scenarios.** Each is defined by the number of scooters queued at the end of red, across all lanes of the approach beside the pedestrian. That is the same definition used to calibrate the anchors.

| Scenario | Scooters queued, median (90% range) | Basis |
|---|---|---|
| Light | 5 (3–9) | IOT quiet junction: 819/h as a 12-hour mean, 1,620/h at peak |
| Typical busy arterial | 35 (22–50) | IOT busy junctions: 3,989–5,974/h as 12-hour means, 5,875–9,572/h at peak, giving 25–60 per approach per red. gap-answers-a gives 30–37 |
| Heavy | 70 (50–103) | Lan & Chang 2015, *IEEE T-ITS*, Table V: 103 queued at one red on a 4-lane approach, 16 of them in the box. Mingcheng evening peak gives about 60 |

In the typical scene roughly 10–15 of the 35 are within about 10 m of the pedestrian.

## 4. Results: increments above urban station level

Breathing height 1.2–1.5 m, mean over a 90-second red. Figures are P5 / P50 / P95.

| Quantity | Light | Typical busy arterial | Heavy (full box) |
|---|---|---|---|
| CO, ppm | 0.02 / **0.10** / 0.52 | 0.10 / **0.48** / 2.2 | 0.17 / **0.83** / 3.9 |
| CO, mg/m³ | 0.02 / 0.11 / 0.59 | 0.11 / 0.55 / 2.6 | 0.20 / 0.96 / 4.5 |
| (CO, route A only, ppm) | 0.04 | 0.20 (0.08–0.51) | 0.35 |
| (CO, route B only, ppm) | 0.23 | 1.1 (0.44–2.7) | 1.9 |
| CO, worst red in two days, ppm | 0.18 (0.04–1.1) | 0.83 (0.22–5.0) | 1.4 (0.39–8.7) |
| Benzene, µg/m³ | 0.05 / 0.40 / 3.1 | 0.26 / **1.9** / 14 | 0.45 / 3.3 / 24 |
| Benzene, ppb | 0.02 / 0.13 / 0.97 | 0.08 / **0.59** / 4.3 | 0.14 / 1.0 / 7.6 |
| THC, µg/m³ (low confidence) | 1.8 / 14 / 100 | 9 / 65 / 450 | 16 / 114 / 790 |
| THC, ppmC | 0.003 / 0.024 / 0.18 | 0.016 / 0.11 / 0.80 | 0.03 / 0.20 / 1.4 |
| Particle number, all local traffic, #/cm³ | 800 / 5,000 / 30,000 | 4,100 / **24,000** / 130,000 | 7,200 / 42,000 / 230,000 |
| Particle number, scooter exhaust only (solid), #/cm³ | 2 / 23 / 330 | 8 / 110 / 1,500 | 14 / 190 / 2,600 |
| PM2.5, all local traffic, µg/m³ | 0.1 / 0.7 / 4.1 | 0.5 / **3.2** / 18 | 1.0 / 5.5 / 32 |
| PM2.5, scooter exhaust only, µg/m³ | 0.007 / 0.12 / 1.9 | 0.03 / 0.54 / 8.5 | 0.06 / 0.95 / 15 |
| **TOTAL CO, ppm** | 0.32 / 0.56 / 0.97 | 0.45 / **0.91** / 2.7 | 0.55 / 1.3 / 4.3 |
| **TOTAL benzene, ppb** | 1.5 / 2.8 / 5.2 | 1.7 / **3.4** / 7.6 | 1.9 / 4.0 / 10.6 |
| **TOTAL particle number, #/cm³** | 11,000 / 21,000 / 48,000 | 16,000 / **40,000** / 150,000 | 20,000 / 57,000 / 250,000 |
| **TOTAL PM2.5, µg/m³** | 6.9 / 14.7 / 31 | 8.5 / **18.6** / 40 | 9.5 / 21.7 / 51 |

**Plain reading of the results**

* At a busy Taiwanese junction in the peak hour, the person at the kerb during one red breathes roughly **0.5 ppm more CO than the city station shows**, about **1 ppm in total**. The 90% range of the increment is 0.1–2 ppm.
* That is about the level of **a busy-road air-quality station, or two to four times urban background**. It is about **1/30 of Taiwan's 1-hour CO standard (31 ppm)** and **1/100 of the WHO 15-minute guideline (87 ppm)**, even before allowing for the fact that 90 s is far shorter than either averaging time.
* Benzene rises by about **0.6 ppb (2 µg/m³)** above a background of about 2.5 ppb. Particle number rises to about **40,000 /cm³**, which is busy-roadside level and above the WHO "high" 1-hour marker of 20,000. PM2.5 hardly moves (+3 µg/m³).
* A full stop box roughly doubles the typical figures. A quiet junction gives about a fifth of them.
* **The honest headline is "about the same as standing beside a busy road", not a hot-spot many times worse.**

## 5. Validation and the disagreement I had to resolve

1. **Leave-one-out against the IOT anchors.**
   * The table below gives each anchor's observed kerb maximum next to the maximum predicted from the other three.

     | Site | Observed max (ppm) | Predicted max (ppm) | Predicted ÷ observed |
     |---|---|---|---|
     | Mingcheng | 1.3 | 0.79 | 0.60 |
     | Qixian | 0.62 | 0.79 | 1.27 |
     | Zhongzheng | 0.50 | 0.82 | 1.64 |
     | HSR | 0.50 | 0.46 | 0.92 |

   * Every prediction is within a factor of 1.7, so route A is internally consistent.
   * The per-scooter excess is about 0.006–0.018 ppm per queued scooter at the worst minute.
2. **Route A against route B: a factor of about 5.**
   * Route A gives 0.20 ppm for the typical scene; route B gives 1.1 ppm. Route A is lower even than the annual-mean excess of traffic stations over urban stations (0.30 ppm). That is physically odd, because a peak-hour kerb beside a queue should not sit below an annual roadside mean.
   * At the quiet IOT site the kerb maximum (0.50) was lower than the station's hourly maximum (0.55). The sensors may resolve little above background, or their baseline may have been matched to the station.
   * The Kaohsiung arterials are wide (Minzu Rd) and probably better ventilated than the Taipei traffic-station streets.
   * I could not settle which route is right without the IOT minute series, which exist only as figures. So I mixed the two 50/50 rather than choose.
3. **Hanoi cross-check.**
   * Hanoi 2006 walking CO: geometric mean 5.1 ppm, mean 8.5 (Saksena et al., East-West Center WP 64, verified).
   * I subtracted a 1–2 ppm background (assumption) and divided by a fleet CO-per-km ratio of 2–4. Vietnam's 12.09 g/km and Taiwan's motorcycle 4.33 g/km (Ting 2023, Table 4) give 2.8.
   * The result is 1.8 (1.1–2.8) ppm in Taiwanese terms. Route B agrees within 1.6×; the mixture median is 3.7× lower.
   * The Hanoi figure is for walking in or beside a motorbike stream in narrow streets, with a 2006 carburetted fleet probably dirtier than the 2008 per-km value. It is an upper bound, and it argues against route A's low end.
4. **Near-field box model (the sister input file): 3 (1–13) ppm for 8 scooters within about 10 m.**
   * Like-for-like, the box model describes a red with the plume aimed at the kerb. That matches my "worst red" for the typical scene: 0.83 ppm in the mixture, 2.2 on route B. The box model is 1.4–3.6× higher.
   * Against route A alone (0.06 ppm for 8 queued scooters) it is about 50× higher. This is the largest disagreement in the exercise.
   * The box model puts the whole pack's exhaust into a 7 m wide × 2 m deep slab advected straight at the receptor at 0.8 m/s, with an effective ventilation of about 11 m³/s.
   * The measurements imply an effective ventilation of 60–2,300 m³/s (P50 380). A junction-scale U·W·H of (0.3–2 m/s) × (20–60 m) × (5–20 m) gives 30–2,400 m³/s, so the measurements are plausible.
   * The kerb plainly does not sit in the undiluted pack plume for a whole red, because of wind direction, meander and the turbulence of cross traffic. The box model is a worst-instant bound, not a 90-second mean.
5. **Exhaust and dilution check.**
   * Raw idle exhaust is 1.45% CO, or 14,500 ppm (Yilan phase-5 mean).
   * The 90-second increments imply that each of the nearest 12 scooters is diluted by about 10⁵–10⁶ on average.
   * A single direct plume hit at about 3 m is diluted only about 6,000× (Wang et al. 2015, AMT 8:3263, moving cars), giving about 2.4 ppm instantaneously.
   * So **second-scale spikes of a few ppm are expected inside a red whose mean is a few tenths of a ppm to about 1 ppm**.
6. **Mass balance.** In the typical scene, 35 scooters × 0.54 g = about 19 g of CO is emitted beside the pedestrian per red. The implied effective ventilation lies inside the physical range above.
7. **The other species.**
   * Benzene, typical increment +0.6 (0.08–4.3) ppb. Taipei scooter-lane commuters breathe +1.7 ppb over ambient (Wu 2021, secondary). Bangkok kerb totals are 2–3 ppb and Hanoi roadside 12.8 ppb with an older fleet. Same order.
   * Particle number, typical total 40,000 (16,000–150,000). Taiwanese roadside measurements are 25,000–38,000, a Texas junction mean is 66,000, and UK pull-away peaks are 70,000–540,000. Consistent.
   * PM2.5, typical increment +3 µg/m³. The IOT kerb readings of 4–14 µg/m³ show no visible traffic signal. An NTU thesis found 14.2 µg/m³ while stopped against 12.5 while moving. Consistent.
   * Nothing is off from its anchor by more than about 3×.

## 6. What dominates the uncertainty

* **Which CO route is right** (the factor-5 split between route A and route B). This is the biggest single term, and only the IOT minute series could settle it.
* **The typical red against the worst minute (fTyp) and the 90-second averaging (a90).** Both are assumptions; together they span a factor of about 3.
* **The particle number ratio.** The all-traffic route borrows ambient ratios that include diesel. The scooter-only route uses per-km solid-particle emission factors converted to idle, which no one has measured.
* **Benzene/CO ratio** (a factor of 10 across its range). The benzene share of scooter hydrocarbons has not been measured in any source I could open.
* **The proximity factor.** No metre-scale data exist beside an idling queue.

## 7. What the method cannot say

* **Height.** It cannot resolve child or pushchair height (0.6–1.0 m) from adult height. Every anchor is at 1.2–1.5 m or higher. Published kerb profiles suggest 0.8 m is 5–15% higher for NO₂ (Kenagy 2016), and in-pram particles up to about 44% higher (Sharma & Kumar 2020). Exhaust comes out at about 0.5 m, so the pushchair breathes at the source height. The method gives no number for that; at most "similar to about 1.5× adult" by borrowing.
* **Build-up across the 90 seconds.** It cannot give one. The anchors are 1-minute maxima and annual means. The script prints only a schematic from an assumed uniform arrival of scooters, C(t)/C(end) = (t/90)^0.8, with a mean over the red of 0.56 of the end value. Near-field contributions probably fill faster, because the first arrivals stop nearest the line. Pull-away at green probably adds a spike lasting seconds, which is unquantified. Shanghai and Texas data show particles depend on the signal phase but cannot be transferred to scooters.
* **Separating idling from other traffic.** It cannot separate idling scooters from cross traffic moving past during the same red. The CO excess is what the pedestrian breathes from all local traffic. Only the "scooter exhaust only" lines isolate scooters, and they rest on emission ratios.
* **Second-scale peaks and 1,3-butadiene or aldehydes.** It says nothing about either.
* **Other cities.** The CO anchors are Kaohsiung (route A) and the Taipei region (route B). Taichung's weaker wind (1.5 m/s) could make it higher.

## 8. Notes for the other workstreams

* **The scene input file divides IOT's 5,974 motorcycles by 12.** The figure is a 12-hour *mean per hour* (the report's PCU/h of 6,784 confirms it). The typical end-of-red queue is about 30–40 per approach, not 3, so the scene's typical "8 within 10 m" is probably low.
* **The IOT sensor text contradicts itself on Aiguo station CO.** Sec 3.2.1 gives 0.03–0.28 ppm; sec 3.3.2 says the plot is "mostly 0.4–1 ppm".

## needsManualFetch

* IOT-113-TB006: the 1-minute CO series in Figs 3.3.2-1 to -11 and any appendices. They need digitising or the raw data from IOT, and they are the single item that would cut the uncertainty most.
* MOENV hourly CO for the six traffic stations, with inlet heights and kerb distances: https://data.moenv.gov.tw/ (needs an API key).
