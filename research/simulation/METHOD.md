# What a pedestrian breathes beside idling scooters: the 3-D simulation

**Status: ESTIMATE (推估), not a measurement.** Signed 2026-11-27. This is a computer simulation of air flow and exhaust at a Taiwanese kerb during a red light. Nobody has measured what a person standing there breathes second by second. This document says what was simulated, how, what checks it passed and failed, what was corrected after three independent verifications, and what it cannot say. The one-page answer for the site's owner is `ANSWER.md`; the final numbers are in `results-simulation.json`.

- Plan, probes, statistics and acceptance checks were fixed before the first result: `PLAN.md` (sections 1-8). Every later change is logged with its time and reason in its section 9 (items 1-24).
- Runner: `run-scenario.sh <id>`; scenario registry: `scenarios.json`; per-case statistics: `results/<id>/stats.json`.
- Matrix detail (every case, every probe set): `results-matrix.json`. Final numbers only: `results-simulation.json`.
- Corrections step: `corrections/` (re-checks of the verifiers' findings, stay-through numbers, K tables).
- Inputs: `inputs-simulation.json`; sources: `sources.json` here and `../estimate/sources.json`. No new source was opened in the signed-report step.

## 1. The answer in one paragraph

**For a pedestrian waiting at a red light, kerb carbon monoxide is below the WHO 15-minute guideline (100 mg/m³, about 87 ppm) in every case we simulated**, once the averaging time is matched: one red adds roughly 0.1-1 ppm to a 15-minute average in ordinary conditions, about 1-4 ppm with the wind held from a dozen scooters to you, and up to about 5 ppm (P95 about 40 ppm) in the worst near-field case, 0.5 m directly downwind of a tailpipe at pushchair height in near-calm air. **For someone who stays at a fixed spot through every red for 15 minutes**, the pack cases stay below 87 ppm (about 3-16 ppm at child and pushchair height with the wind held from the pack, 33 ppm at most at 0.3 m). **The one realistic configuration that reaches it** is the fine-grid near-field case: a pushchair 0.5 m directly downwind of an idling scooter's tailpipe, near-calm air (about 0.4 m/s) holding its direction, every red for 15 minutes: 35-56 ppm at the median, above 87 ppm in 10-22 % of such periods at 0.6 m (2-4 % at 0.7 m); the 1-hour 31 ppm is exceeded in most such hours. That needs a held near-calm wind (light wind from that sector in about 1 % of reds; held for 15 minutes much more rarely), an exact position, and air turbulence a third of the usual floor, on a grid not shown to be converged: low confidence, upper-side. What the old 90-second estimate missed is real: close to tailpipes CO arrives in second-long hits of tens to hundreds of ppm; at pushchair height it is up to about twice, and in near-calm air many times, the adult-height value; the exhaust is above the level people can smell in most seconds of a red when you are downwind; and for people who stay an hour with the wind from the scooters, benzene reaches about 1-4 times California's 1-hour reference level. Only an enclosed space with dozens of idling engines and little fresh air could reach the WHO 15-minute CO value in general.

## 2. What was simulated

**Tool.** OpenFOAM v2506 (`buoyantPimpleFoam`), a compressible buoyant large-eddy simulation (WALE sub-grid model) on castellated meshes, run on this machine with at most 3 cores (`cfd-template/README.md` has the install steps). Exhaust is carried as unit tracers, one per group of tailpipes (the nearest kerb-lane scooter alone, the rest of the kerb-lane column, box row 1, box row 2, the second queue column). Nothing in the flow depends on an emission rate or on any threshold. Carbon monoxide, hydrocarbons (THC), benzene, dilution and odour units are applied afterwards, by linearity, from 1,000 emission draws per case taken from the published estimate's own distributions (`research/estimate/model.mjs`, `drawScooter`, unchanged).

**Scene** (PLAN section 2; `cfd/make_pack.py`).

- Each scooter is a 1.8 × 0.7 m body block to 1.1 m with a seated rider block to 1.6 m and an engine block under it.
- The muffler is on the kerb side. The tailpipe is 0.4 m above the road, pointing rearward and 10° up, at 250 °C, with 5.5 × 10⁻⁴ kg/s of exhaust (0.47 L/s at 25 °C).
- Each engine block puts 1 kW of heat into the air round it.
- Stop box rows are 2.0 m apart; queue scooters 2.2 m; lateral pitch 1.05 m. The kerb-lane tailpipes sit 0.3 m from the kerb face.
- Kerb 0.2 m, pavement 4 m. People stand on the pavement as columns.
- Optional street canyon (20 m between faces, 12 m buildings) or an arcade (騎樓: 0.5 m kerb strip, 3.5 m deep, 3.8 m clear, columns every 4 m).
- Wind enters as a time-varying field with large-scale gusts and direction wander plus convected small eddies ('rfm', PLAN 9.17), fixed seed.

**Where the "nose" is** (PLAN section 4). K probes at 0.5, 1, 2 and 4 m from the nearest kerb-lane tailpipe toward the pavement, at that tailpipe's position along the street and 1 m either side, at heights 0.3, 0.6, 0.7, 0.8 (pushchair), 1.1 (child), 1.5 (adult) and 1.8 m above the pavement. Also a kerb line every 1 m (KL), behind the last row (B), along the kerb edge (R), inside the arcade (AR), the Kaohsiung sensor area (I), vertical masts (V), 0.25 and 0.5 m behind traced tailpipes (SRC) and upstream wind probes (IN).

**Statistics** (PLAN section 5; `stats.py`). From time-weighted 1-second means over one red: the red-window mean, the highest 10-second running mean and the highest 1-second mean; seconds above set levels; dilution of raw exhaust; odour units; and their spread over the 1,000 emission draws as P5 / P50 / P95.

**Cases run** (wall times on this machine, 3 cores unless stated):

| Case | What | Red simulated | Cells | Wall time |
|---|---|---|---|---|
| S1 | 12 scooters, 20 m canyon, wind 0.8 m/s target, 45° from the pack | 90 s | 154k | mesh 18 s + solve 3,090 s |
| S2 | 30 scooters, same canyon, 0.3 m/s target | 90 s | 226k | 37 s + 2,857 s |
| S1-from | 12 scooters, open street, 0.8 m/s target held from the pack to the kerb | 90 s | 152k | 14 s + 2,086 s |
| A | Kaohsiung anchor: 34 scooters, open road, 1.6 m/s target toward the sensor area | 30 s only | 255k | 29 s + 5,416 s |
| S5-12 | 12 scooters, arcade, 0.5 m/s toward the building, domain top 15.2 m | 60 s | 179k | 31 s + 1,358 s |
| **S5-12b** | **S5-12 rerun after verification: domain top 60.8 m, 30 s spin-up, full red (2 cores)** | 90 s | 218k | mesh 34 s + solve 3,584 s |
| **NF1-fine / NF1-coarse / NF1-coarse-0kW** | **one scooter, 0.3 m/s toward the kerb; 2.5 cm and 10 cm tailpipe cells; no engine heat** | 30 s | 180k / 80k / 80k | fine: 3,700 s on 1 core (0-20.9 s) then 2,704 s on 2 cores; coarse: 6 s + 902 s; 0 kW: 6 s + 870 s (1 core each) |
| S4-* | post-processing: the nearest kerb-lane scooter forced to a 6.5 % CO, HC-rich emitter | as its base | — | about 1 min each |

Earlier build runs (S1-try3 at the 'fast' grade, G0-try3 at the 'coarse' grade, 34-46 s of red) are kept in `results/*-try3` as the grid look.

Not run: S3 (standing behind a queue along the wind), S6 deep canyon, S7 pull-away at green, S8 multi-cycle 15-minute stay-through, S9 a few scooters, S10 wind from the kerb, S11 enclosed underpass, the fine-grid repeat G of a pack (about 47 h). There is therefore no simulated pull-away burst, no simulated true 15-minute or 1-hour mean, and no simulated enclosure.

## 3. Inputs and their sources

All emission inputs are the published estimate's (`research/estimate/METHOD.md` §4), drawn per scooter. Status: V = opened and found; S = secondary; A = assumption.

| Input | Value used (range) | Status | Source id |
|---|---|---|---|
| Exhaust flow per scooter | 5.5 × 10⁻⁴ kg/s = 0.47 L/s at 25 °C (0.31-0.78) | V/S | vojtisek-lom-2020; nguyen-2021; nguyen-2025; yao-2008 |
| Exit temperature | 250 °C (150-350) | A | bounds from vojtisek-lom-2020, rungratanaubon-2007, ghafori-2016 |
| Exit height, angle, side | 0.4 m, 10° up, rear on the kerb side | V/A | iot-113-tb006 (0.5 m); ning-2005 (angle matters); angle assumed |
| Pipe diameter | not resolved: a 10 cm patch (2.5 cm in NF1-fine); mass, heat and buoyancy flux exact, momentum about 5 % of a 25 mm pipe | A | no source |
| Engine heat to air | 1,000 W per scooter | A | energy balance of 120 g/h fuel |
| Idle CO, THC, benzene per scooter | drawScooter: fleet mean about 16 g CO/h (median 9), raw CO in the flux-weighted mix about 0.8 % | V/S/A | moenv-co-2025, cheng-2017-niu, nguyen-2021/2025, yao-2008, tsai-2018, moenv-hc-2025 |
| High emitter (S4) | nearest scooter 6.5 % CO, THC 0.10-0.22 g per g fuel | V | moenv-co-2025 (phase IV deteriorated 6.4-6.9 %), moenv-hc-2025 |
| Background (totals only) | CO 0.15 / 0.35 / 0.9 ppm; benzene 0.5 / 1.5 / 4 ppb | V/S | moenv-annual-2025; ncku-thesis-hap |
| Odour of raw exhaust | dilution to threshold 800 and 6,800, kept apart; HC-rich scooters × 10 (× 1 column too) | S (abstracts) / A | epa-ap122-1973 (Fiala 1967; BIL-32 1970) |
| Petrol vapour odour | detection 0.47-0.58 ppm | V | api-1995-odour |
| Street, arcade, wind | as §2 | A | PLAN S1-S5; estimate wind inputs (cwa-climate, iot-113-tb006) |

Two independent checks of these inputs found no fault (reality verifier, `verify-reality/backofenvelope.txt`): engine arithmetic gives 0.35-0.62 L/s of exhaust; a carbon balance gives 0.83 % raw CO at the fleet-mean emission; benzene/CO of 0.56 % by mass gives about 16 ppm raw benzene, inside Bangkok's measured 11.7-32.9 ppm.

**Reference values** (with their averaging times; `inputs-simulation.json` references):

| Pollutant | Value | Averaging | Body | Use here |
|---|---|---|---|---|
| CO | 100 mg/m³ ≈ 87 ppm | 15 min | WHO 2010 / 2021 | against a 15-min value only |
| CO | 35 mg/m³ ≈ 31 ppm | 1 h | WHO | against a 1-h value only |
| CO | 31 ppm (2024 amendment as printed in the MOENV report; older files say 35) | 1 h | Taiwan ambient standard | against a 1-h value only |
| CO | 23 mg/m³ ≈ 20 ppm | 1 h | California OEHHA acute REL | against a 1-h value only |
| CO | 200 ppm ceiling | instantaneous | NIOSH (workplace) | against the highest 1-s value, labelled occupational |
| CO | AEGL-2 420 ppm | 10 min | US EPA (emergency) | only after converting to a 10-min average |
| Benzene | 27 µg/m³ ≈ 8.5 ppb | 1 h (derived on a 6-h basis) | California OEHHA | against a 1-h value, flagged |
| Benzene | 1 ppm | 15 min | NIOSH (workplace) | against a 15-min value |
| Acrolein | 2.5 µg/m³ | 1 h | California OEHHA | assumption-based row only |
| Formaldehyde | 100 µg/m³ | 30 min | WHO | assumption-based row only |
| Petrol vapour | 0.47-0.58 ppm detection | a sniff | API 1995 | against 1-s THC, labelled "vapour, not exhaust" |
| Exhaust odour | 1 odour unit = detection | a sniff | odour panels | against 1-s odour units |

Conversions: one red of W seconds adds (mean × W / 900) to a 15-minute mean and (mean × W / 3,600) to a 1-hour mean: /10 and /40 for a 90-s red, /15 and /60 for a 60-s red, /30 and /120 for a 30-s red.

## 4. Results (one simulated red per case; P5 / P50 / P95 over 1,000 emission draws)

CO is the increment above the street's own background. "Nearest share" is the part of the mean exposure that comes from the nearest tailpipe; the rest comes from the other scooters.

### 4.1 Open street, wind held from the pack to the kerb for the whole red (S1-from, 12 scooters, wind 0.93 m/s as run)

| Distance | Height | 90-s mean (ppm) | Highest 10 s | Highest 1 s | Benzene mean (ppb) | Nearest share |
|---|---|---|---|---|---|---|
| 0.5 m | 0.3 m | 5.5 / 18 / 90 | 44 / 196 (P50/P95) | 59 / 301 | 44 / 183 | 0.74 |
| 0.5 m | 0.7 m (pushchair) | 4.1 / 11.5 / 40 | 21 / 91 | 27 / 120 | 26 / 94 | 0.48 |
| 0.5 m | 1.1 m (child) | 3.4 / 8.8 / 29 | 20 / 64 | 29 / 120 | 20 / 67 | 0.32 |
| 0.5 m | 1.5 m (adult) | 2.4 / 6.3 / 18 | 15 / 41 | 23 / 77 | 14 / 45 | 0.15 |
| 1 m | 1.1 m | 2.6 / 6.6 / 21 | 14 / 51 | 21 / 76 | 15 / 50 | 0.37 |
| 2 m | 1.1 m | 2.0 / 5.0 / 15 | 9 / 31 | 15 / 53 | 11 / 37 | 0.37 |
| 4 m | 1.5 m | 1.4 / 3.3 / 8.6 | 7 / 18 | 10 / 29 | 7 / 22 | 0.23 |

Behind the last row, 0.5 m, 0.7 m high (wind across the queue): 90-s mean 2.2 / 6.5 / 20 ppm, highest 1 s 43 / 133 (P50 / P95).

**Condition and how often.** This is a red in which the wind blows from the scooters to the kerb and holds that direction, with only 5-s gusts, for the full 90 s. The wind sector and speed together occur in about 1 in 8 peak-hour reds; the share of those reds in which the direction also holds for 90 s is not known, so **1 in 8 is an upper bound**. With the low-frequency wander of real light winds the same red would be lower by about 2-4 times (the published estimate's meander alone changes its median about 4 times). The verifier's line-source check reproduces the 4 m value within 2 times. **Trust: about × 2 either way for this condition.**

### 4.2 Street canyon (S1, 12 scooters; S2, 30 scooters)

| Case, distance, height | 90-s mean (ppm) | Highest 1 s | Nearest share |
|---|---|---|---|
| S1, 0.5 m, 0.7 / 1.1 / 1.5 m | 0.69 / 1.4 / 1.2 (P50); P95 2.1-4.3 | 4.5 / 15 / 15 (P50); P95 14-48 | under 0.01 |
| S1, 1 m, 1.1 m | 0.24 / 0.70 / 2.2 | 8.4 / 26 | about 0 |
| S1, 2 m / 4 m, 1.1 m | 0.28 / 0.003 (P50) | 3.8 / 0.14 | 0 |
| S2, 0.5 m, 0.7 / 1.1 / 1.5 m | 0.37 / 0.37 / 0.50 (P50); P95 0.8-1.0 | 3.8 / 5.4 / 4.7; P95 10-17 | 0.30 / 0.03 / 0 |
| S2, 1 m, 1.1 m | 0.14 / 0.31 / 0.64 | 4.6 / 9.6 | 0 |

**These are kerb-lane pack plume values, not "distance from the nearest tailpipe" values.** The nearest scooter contributes almost nothing at the K probes; the exhaust is that of kerb-lane scooters several metres upstream, carried along the kerb.

**Correction after verification (blocker).** In both canyon cases the air at the kerb ran along the street at 0.6-1.3 m/s (S1) and 0.6-0.8 m/s (S2), about twice the speed at the upstream IN probe (0.46 and 0.33 m/s) that had been reported as "the wind". The cause is the boundary set-up: the canyon is fed end-on by a fixed-velocity inlet over its whole cross-section, so the along-street flow at the pavement is forced. In a real canyon in an oblique wind the along-street flow at street level is a fraction of the roof-level along-street wind. S2 was therefore never "calm" at the kerb, and the earlier statements "a bigger pack in calmer air gave less kerb exposure" and "canyons lower kerb levels" are **withdrawn** as artefacts. Concentration along the kerb scales roughly with 1/speed, and the canyon-vortex branch is untested, so these values are **probably low by about 2-5 times**; their stated ranges are widened upward by × 5. They also exclude exhaust built up over earlier reds and from other traffic: at 2-4 m they are lower bounds for one isolated red, not real kerb values (Taiwanese traffic stations average 0.5-1 ppm).

### 4.3 Kaohsiung anchor (case A, 34 scooters, wind 2.0 m/s from the pack, 30 s of red)

At the sensor positions (2-8 m ahead, 2.5-5 m to the side, 1.2-1.5 m high) the highest 30-s mean increment is 1.33 [0.67-2.55] ppm with no sensor lag; through the assumed 30-s sensor response it is 0.43 [0.22-0.83]. Observed: about 0.8-1.2 ppm, as the highest minute in 48 hours.

**Correction after verification (blocker).** The pre-registered test A2 needs at least a full red and a 1-minute mean through the sensor model, over 8 reds in all directions, compared with a 48-hour maximum. One 30-s red in the single most favourable direction cannot do that. **A2 is untested: the simulation is "not contradicted, not reproduced" by the Kaohsiung measurement.** Read the other way, the fact that the single favourable red already reaches the top of the observed 48-hour maximum suggests that reds with the wind held from the pack are rare at that site, or that the held-wind cases are high by up to about 2 times. Either reading supports treating S1-from and A as upper-side conditional cases.

At the K probes of case A: 90-s-equivalent means at 0.5 m of 5.5 / 3.2 / 1.3 ppm (0.7 / 1.1 / 1.5 m, P50; 30-s window).

### 4.4 Arcade (騎樓)

**S5-12 (first run) is withdrawn as not admissible**: its domain top at 15.2 m above a 12 m building spanning the whole domain forced an artificial stagnation zone (§5.1). The rerun **S5-12b** (domain top 60.8 m, 30 s spin-up, full 90-s red, 2 cores, mesh 34 s + solve 3,584 s) replaces it.

As run, the wind 1.5 m upstream of the pack turned along the street (-161°, 0.58 m/s; A6 fails on direction, σ_w 0.095 m/s just under the 0.1 floor); at the kerb the air moved from the pack toward the arcade at 0.25-0.33 m/s. So this is a light, held "wind from the scooters toward the arcade" red.

| Probe | 90-s mean (ppm) | Highest 1 s (P50 / P95) | Nearest share |
|---|---|---|---|
| Kerb edge 0.5 m, 0.3 m high | 5.3 / 28 / 191 | 84 / 473 | 0.95 |
| Kerb edge 0.5 m, 0.7 m (pushchair) | 2.0 / 7.5 / 39 | 47 / 282 | 0.77 |
| Kerb edge 0.5 m, 1.1 m (child) | 1.5 / 5.1 / 24 | 61 / 322 | 0.69 |
| Kerb edge 0.5 m, 1.5 m (adult) | 0.67 / 2.0 / 6.6 | 22 / 108 | 0.31 |
| 1 m, 1.1 m | 0.62 / 1.8 / 6.7 | 21 / 101 | 0.49 |
| 2 m (under the arcade roof), 1.1 m | 0.49 / 1.3 / 4.5 | 7.8 / 39 | 0.44 |
| 4 m (at the shopfront), 1.1 m | 0.23 / 0.59 / 1.8 | 2.4 / 8.9 | 0.40 |
| Inside the arcade, 1-3 m in, 0.7-1.5 m, nine positions | 0.6-3.6 (P50); P95 up to 10.5 | 3-14 / up to 57 | — |

- Air inside the arcade stays below the kerb edge, as the conservation bound requires for an arcade with no scooter idling in it, but it is not clean: 1-3 m inside it is about the level 1-2 m from the kerb (means of 0.6-3.6 ppm). Retention over several cycles was not simulated.
- With the 6.5 % emitter as the nearest scooter (S4-S5-12b): 90-s mean at 0.7 m 67 [39-127] ppm, highest 1 s 497 [P95 942]; at 0.3 m the 90-s mean is 338 [198-644] ppm; at 1.5 m 7.7 [4.5-15].
- Against the first run: the kerb-edge mean at 0.7 m fell from 10.2 to 7.5 ppm (P50) and the high-emitter mean from 121 to 67 ppm. The blockage had pushed values up by about 1.4-1.8 times; the conclusions of the first run about the NIOSH ceiling were too high.
- A4 for this case (same N, 0.5 m/s, wind from the pack): simulated / estimate median 2.1-3.0 at 2 and 4 m, inside the estimate's P5-P95; 3.3-7.2 at 0.5 m. At 2-8 m it agrees with the published model within its tolerance, on the high side.
- Condition: wind toward the facade within ±45° at 0.5 m/s or less in about 5 % of reds at arcade streets; held for the whole red: an upper bound.

### 4.5 A high emitter as your nearest neighbour (S4, post-processing)

The nearest kerb-lane scooter is forced to 6.5 % idle CO and HC-rich (MOENV deteriorated phase IV). The nearest kerb-side scooter is at or above 5 % CO in about 1.0 % of reds.

- In the canyon cases (S4-S1, S4-S2) its plume goes along the kerb lane away from the K probes: K values barely change; the highest single probe (0.3 m high) reaches a 1-s P50 of 108-178 ppm.
- With the wind held from the pack (S4-S1-from), at 0.5 m and 0.7 m height: 90-s mean 62 [36-117] ppm, highest 10 s 156 [P95 297], highest 1 s 207 [P95 392]; at 1.1 m 34 [20-63] mean, 1 s 206; at 1.5 m 15 [8-29] mean. At least one second above 200 ppm in 53 % of draws at 0.5 m, 0.7 m.
- Probability of that red: at most 1.0 % × 1/8 ≈ 0.1 % of peak-hour reds, an upper bound (independent shares; wind held for the whole red; a person 0.5 m from that tailpipe).

### 4.6 Hydrocarbons, benzene and dilution

- **Dilution of raw exhaust at the nose.** Mean over the red at 0.5 m: about 5,000-21,000 in the canyon cases (pack exhaust; probably too dilute by 2-5 times, §4.2); about 330-1,100 with the wind held from the pack (S1-from). Highest-1-s dilution 110-1,500 at 0.5 m. Raw idle exhaust is about 0.8 % CO for the fleet mix and 6.5 % for a deteriorated high emitter; it holds hundreds to a few thousand ppm of hydrocarbons and about 10-30 ppm of benzene. On the coarse grid no probe can see a dilution below about 50 (§5.3).
- **THC (exhaust hydrocarbons, as ppm carbon).** Highest 1 s at 0.5 m, P50: 2.0-7.0 ppmC (S1), 1.7-2.3 (S2), 10-13 (S1-from), 1.9-4.6 (A); P95 up to 50. With the high emitter 37-160. The petrol-vapour detection threshold of 0.47-0.58 ppm is about 2.1-3.5 ppmC (vapour averaging C4.5-C6). It is exceeded at P50 in S1 at 1.1-1.5 m, in A, and in S1-from; in S2 and at S1 pushchair height only at P95. That threshold is for vapour, not exhaust.
- **Benzene.** 90-s means at 0.5-1 m: 0.6-3 ppb in the canyon cases, 12-26 ppb (P95 up to 94, 183 at 0.3 m) with the wind held from the pack, 100 [44-217] ppb with the high emitter (S4-S1-from, 0.7 m).

### 4.7 Smell

Odour units at the nose are the raw exhaust's dilution-to-threshold divided by the dilution at the nose (1 = just detectable by half a panel). Two raw-exhaust values are kept apart: 800 (Fiala 1967) and 6,800 (Swedish BIL-32, 1970), both read from abstracts of car-engine studies. Shares are P50 over draws, at K 0.5 m.

| Case | Highest 1 s, OU (D/T 6,800) | Seconds ≥ 1 / ≥ 5 / ≥ 30 OU (D/T 6,800) | Highest 1 s (D/T 800) | Seconds ≥ 1 OU (D/T 800) |
|---|---|---|---|---|
| S1 canyon | 5-16 (P95 14-48) | 23-29 % / 0-10 % / 0 | 0.6-1.9 | 0-7 % |
| S2 canyon, 30 scooters | 4-5.5 (P95 9-14) | 11-20 % / 0-1 % / 0 | 0.5-0.6 | 0 % |
| S1-from, wind held from the pack | 24-32 (P95 73-99) | 76-97 % / 50-88 % / 0-1 % | 2.8-3.7 | 36-76 % |
| A, 34 scooters, 2 m/s | 5-11 | 53-100 % / 0-60 % / 0 | 0.5-1.3 | 0-13 % |

Downwind of a dozen idling scooters, exhaust is above the detection threshold in most seconds of the red, and above 5 times threshold ("distinct") in half or more, by the higher odour figure; by the lower figure it is near threshold, above it in about half the seconds. "Strong" whiffs (≥ 30 OU) are rare with ordinary scooters. In the canyon cases, including the 30-scooter pack, smell is occasional and faint (but see §4.2: those values are probably low). Next to a high emitter the odour units reach the hundreds, but that rests entirely on the assumed × 10 for HC-rich exhaust; Fiala 1967 found that adding air to exhaust lowered CO and HC yet made the smell stronger, which argues against odour scaling with HC. Odour-unit peaks inherit the grid filtering of §5.3. A rough check with acetaldehyde alone (comparisons verifier) gives raw-exhaust dilution-to-threshold of about 480-6,200, the same range.

**What this means.** The nose detects exhaust at dilutions of thousands, when CO is a fraction of a ppm. A horrible smell beside a large idling group is what the physics gives, especially downwind and at low height. It is not a sign that CO is near its guideline: CO has no smell.

### 4.8 Like-with-like comparisons

**One red, one pedestrian** (K 0.5 m, 0.7 m height, P50 [P95]; `corrections/stay_<case>.json`):

| Case | Adds to a 15-min mean (WHO 87 ppm) | Adds to a 1-h mean (WHO/Taiwan 31; OEHHA 20 ppm) | Benzene added to a 1-h mean (OEHHA 8.5 ppb) |
|---|---|---|---|
| S1 canyon | 0.07 [0.21] ppm | 0.02 [0.05] | 0.04 [0.13] ppb |
| S1-from | 1.1 [4.0] ppm | 0.29 [1.0] | 0.66 [2.4] ppb |
| A (30-s red) | 0.18 [0.49] ppm | 0.05 [0.12] | 0.09 [0.33] ppb |
| S4-S1-from (high emitter) | 6.2 [11.7] ppm | 1.5 [2.9] | 2.5 [5.4] ppb |
| S5-12b arcade street | 0.75 [3.9] ppm | 0.19 [0.97] | 0.45 [2.0] ppb |
| S4-S5-12b (high emitter) | 6.7 [13] ppm | 1.7 [3.2] | 2.6 [5.8] ppb |

**Standing through every red** (vendor, traffic police, crossing guard). Red is 45-65 % of the cycle; nothing is added during green (no green-phase traffic, no pull-away, no carry-over: ASSUMPTION); a fresh pack is drawn for every red (correction: earlier figures re-used one pack, which overstated the P95 by up to about 2 times); the flow is the same single simulated red each time. These are extrapolations; the multi-cycle case S8 was not run.

| Case, probe | 15-min CO (ppm), P50 at 45 % – P95 at 65 % | 1-h CO (ppm), same | 1-h benzene (ppb), same |
|---|---|---|---|
| S1 canyon, K 0.5 m, 1.5 m | 0.6 – 1.5 | 0.6 – 1.2 | 1.5 – 2.9 |
| S1 canyon, kerb edge (highest probe, 0.6 m) | 2.4 – 5.8 | 2.6 – 4.7 | 6 – 12 |
| S1-from, K 0.5 m, 0.7 m | 6.4 – 16 | 6.8 – 13 | 16 – 31 |
| S1-from, K 1 m, 1.1 m | 3.6 – 8.3 | 3.8 – 6.8 | 8.6 – 17 |
| S1-from, K 0.5 m, 0.3 m (highest probe) | 10 – 33 | 12 – 24 | 28 – 56 |
| A, K 0.5 m, 0.7 m | 2.7 – 6.3 | 2.9 – 5.2 | 6.6 – 13 |
| S4-S1-from (same high emitter every red), K 0.5 m, 0.7 m | 30 – 55 | 30 – 49 | 50 – 86 |
| S4-S1-from, K 0.5 m, 0.3 m | 73 – 137 | 75 – 121 | 121 – 206 |
| S5-12b arcade street, kerb edge 0.5 m, 0.7 m | 4.3 – 14 | 5 – 10 | 12 – 24 |
| S5-12b, kerb edge 0.5 m, 0.3 m | 17 – 66 | 21 – 46 | 49 – 100 |
| S4-S5-12b (same high emitter every red), 0.7 m | 32 – 59 | 32 – 52 | 52 – 89 |
| S4-S5-12b, 0.3 m | 160 – 300 | 160 – 270 | 260 – 450 |
| NF1-fine, one scooter, near-calm held wind, 0.5 m, 0.6 m | 35 – 140 (P50 at 65 %: 56) | 43 – 99 | 98 – 217 |
| NF1-fine, 0.5 m, 0.7 m | 20 – 80 | 25 – 57 | 56 – 125 |
| NF1-fine, 1 m, 1.1 m | 6 – 24 | 7 – 17 | 17 – 38 |

Read across:

- **WHO 15-min CO (87 ppm):** in the near-calm single-tailpipe case on the fine grid (NF1-fine), standing at 0.5 m directly downwind at 0.6 m height through every red for 15 minutes exceeds 87 ppm in 10 % (red 45 % of the cycle) to 22 % (65 %) of such periods; at 0.7 m in 2-4 %; at 1.1 m or 1 m away never. This is the only fleet-emission exceedance found, and it rests on held near-calm air with turbulence a third of PLAN's floor (§5.3). Otherwise not reached in any fleet case, even standing through every red with the wind held from the pack (at most about 33 ppm at 0.3 m height, P95; the earlier same-pack-every-red method gave 58). It is reached only at 0.3 m above the pavement, 0.5 m from a 6.5 % emitter that returns to the same spot every red for 15 minutes with the wind held toward you (73-137 ppm on the open street, 160-300 ppm on the arcade street; at 0.7 m the same cases give 30-59 ppm): a corner, not a situation. Fleet stay-through on the arcade street: 4-14 ppm at 0.7 m, 17-66 ppm at 0.3 m.
- **WHO / Taiwan 1-h CO (31 ppm):** exceeded in 83-99 % of hours in the NF1-fine stay-through at 0.5 m, 0.6 m (24-70 % at 0.7 m), with the same caveats. In the pack cases not reached at their central values (at most about 24 ppm at 0.3 m, P95). The upper end of the 0.3 m range, once the × 2 flow uncertainty of the held-wind case is added, reaches it (about 48 ppm): an extreme corner (knee height, an hour of wind held from the pack). Reached with the same high emitter every red.
- **OEHHA 1-h CO (20 ppm):** approached at 0.3 m height in S1-from (12-24 ppm); exceeded with the high emitter.
- **OEHHA 1-h benzene (8.5 ppb):** one red adds at most about 2.4 ppb (fleet, P95) or 5-7 ppb (high emitter, P95). For someone who stays an hour with the wind held from the scooters, it is reached or exceeded: about 1-2 times at P50 at 0.5-1 m, up to about 4 times at P95 (6-7 times at 0.3 m). The OEHHA value was derived on a 6-hour basis and the benzene emission share is uncertain by 5-10 times; this is the one place where a public 1-hour reference is plausibly reached by ordinary scooters, and only for people who stay.
- **NIOSH 200 ppm ceiling (instantaneous, workplace):** with ordinary scooters, at least one second above 200 ppm at 0.5 m and 0.7 m in about 1 % of draws of the held-wind red (S1-from), so about 0.1 % of peak reds at most, and in 8 % of draws on the arcade street (S5-12b), so about 0.4 % of reds at arcade streets at most; at the 0.3 m probe the 1-s P95 is 301 ppm. With the high emitter, in about half the draws (S4-S1-from) and in all draws on the arcade street (S4-S5-12b), so at most about 0.05-0.1 % of reds. These are seconds, a workplace value, and grid-limited.
- **AEGL-2 (420 ppm over 10 min):** the highest 10-s means (up to about 300 ppm with the high emitter at 0.7 m) contribute at most about 5 ppm to a 10-minute average. Far below.
- **Aldehydes (assumption-based, not assessed properly).** No idle aldehyde data exist for scooters. Taking aldehydes as 0.5-3 % of exhaust VOC mass, acrolein 3-10 % of them and formaldehyde 30-60 % (ASSUMPTIONS), the S1-from 90-s mean at 0.5 m (THC 5.5 ppmC) implies acrolein about 0.5-9 µg/m³ and formaldehyde about 5-55 µg/m³. One red adds 0.01-0.2 µg/m³ of acrolein to a 1-h mean (OEHHA 2.5). Standing through every red: about 0.2-6 µg/m³, so an acrolein exceedance for people who stay **cannot be ruled out**. Formaldehyde stays below WHO's 30-min 100 µg/m³ even then.

### 4.9 Heights

With the wind from the pack (S1-from), the 90-s mean at 0.5 m is 1.8 times higher at 0.7 m than at 1.5 m (11.5 against 6.3 ppm), and 2.9 times at 0.3 m. Measured kerbside ratios of pushchair to adult height are 1.1-1.8 (Buzzard 2009 about 1.6; Kenagy 2016 +9-15 %; Sharma & Kumar up to +44-60 %): S1-from sits at the top of that range. In the arcade case S5-12b it is 3.8 and in case A 4.3, above every measurement; in the canyon cases S1 and S2 it is 0.6-0.7, below every measurement. The engine-heat test (NF1-coarse with and without the 1 kW source) changes the 0.5 m values by up to 4 times but leaves the 0.7 / 1.5 m ratio near 3.6 in this single-scooter case, so the canyon-case inversion is not an engine-heat artefact alone; on the fine grid the single-scooter plume stays at 0.6-0.8 m (0.6 / 1.1 m ratio about 80 at 0.5 m). Height-resolved values are therefore uncertain by about 2 times either way. The publishable statement is: "about the same or higher at a child's or pushchair's height, up to about twice when the wind blows from the scooters to you".

## 5. Checks passed and failed

| Check (PLAN §6) | Result |
|---|---|
| A1 tracer mass balance (±3 %) | **Pass** in every case: 0.59-0.65 %, the excess being diffusive inflow at the tailpipe patches; emission matches the specified flow to 0.005 %. Independently re-integrated by the physics verifier (sample-and-hold 1-s bins): pipeline error under 5 %. |
| A2 Kaohsiung anchor | **Untested** (one 30-s red, one direction; §4.3). Not contradicted, not reproduced. |
| A3 grid sensitivity | **Fails** (coarse/fast 0.33-2.45 for window means at K, 0.29-3.2 for highest 1 s; build-step pair). Near-field check NF1-fine / NF1-coarse (§5.3): at pushchair height within 1 m the coarse grid reads 1-s peaks 3-4 times low and means up to 2 times low; 0.5 m away at 1.1-1.5 m it reads high; at 2 m means agree within about 20 %. |
| A4 agreement with the published estimate at 2-8 m | **Fails in both directions.** Canyon: 0.24-0.61 at 2 m, about 0 at 4 m (low; partly the end-fed inlet artefact). Open street with wind held from the pack: 8-11 times the estimate's median (S1-from), 3-5 times (A). Explained by held direction without meander, all scooters idling from red onset, the plume staying low, and buildings; nothing was tuned. |
| A5 analytical near-field checks | **Not run** (no still-air plume or Gaussian test). NF1-fine/coarse were run as a grid check instead (§5.3). |
| A6 inflow | **Fails in every case** on the mean speed, the direction or the turbulence floors at the IN probe; in the canyon cases the IN probe does not represent the kerb (§4.2). S5-12b: -161° upstream against a -90° target, σ_w 0.095 m/s (floor 0.1). |
| A7 statistical convergence over reds | **Not computed**: one red and one inflow realisation per case. |
| A8 numerics | Courant number up to 1.04; bounded scalar scheme; domain tracer not steady in A (+28-52 % over the last 20 s), S5-12 (+15-19 %), S2 (±12 %). S5-12b: Courant max 0.88; domain tracer change 5-12 % over the last 20 s (marginal fail). |

### 5.1 Corrections made after verification

Three verifiers tried to break the simulation (physics, reality, comparisons). Each finding was re-checked from the case files (`corrections/confirm_findings.py` and `.txt`). All were confirmed. What was done:

1. **Arcade domain blockage (blocker).** The 15.2 m domain top over a 12 m building spanning the whole domain (79 % blockage) is confirmed from the case files, as are the -128° wind direction and the near-laminar flow (σ_w 0.035 m/s). S5-12 and S4-S5-12 are now labelled "domain-blockage-affected, not admissible", and their numbers (60-s means of 121 ppm, NIOSH ceiling in 72-99 % of draws) are withdrawn. The case was rerun as S5-12b with a 60.8 m top and a full red (§4.4).
2. **Canyon end-fed inlet (blocker).** Confirmed (kerb air 0.6-1.3 m/s along the street against 0.33-0.46 m/s at the IN probe). Not rerun. "Calm" and "main surprise" withdrawn; values relabelled as kerb-lane pack plume and widened upward × 5 (§4.2).
3. **Kaohsiung anchor (blocker).** Confirmed (30-s window, 2.0 m/s against 1.6, tracer still rising). A2 restated as untested (§4.3).
4. **Grid filtering of 1-s and 10-s values within 1 m (should-fix).** Confirmed (10 cm source patch with about 5 % of the real jet momentum; 20 cm probe cells; highest exhaust fraction at any probe 0.010-0.019). NF1-fine/coarse run as the check (§5.3).
5. **S1-from is a conditional upper case (should-fix).** Labelled "wind held from the pack for the whole red"; its 1-in-8 likelihood is an upper bound.
6. **Likelihoods (should-fix).** All condition probabilities restated as products of independent shares and as upper bounds; S1 and S2 probabilities are not attached, because the wind they ran with is not their target wind.
7. **Heights (should-fix).** Literature ratio added as a check; engine-heat sensitivity run (§4.9).
8. **Highest probe and windows (should-fix).** The highest fleet-emission red mean at any probe is now quoted correctly (S1-from at 0.3 m: P95 90 ppm over 90 s; the withdrawn S5-12 had 116 ppm over 60 s); 60-s and 30-s reds use /15 and /30 for 15-min contributions.
9. **Benzene and 1-h stay-through (should-fix).** Added for CO and benzene, against WHO/Taiwan 1-h, OEHHA 1-h CO and OEHHA 1-h benzene (§4.8). The earlier "at most about 3 ppb" for one red now includes the high emitter (5-7 ppb at P95).
10. **Stay-through P95 (should-fix).** Recomputed with a fresh emission draw for every red (`stay_through.py`).
11. **Unconverted 60-s mean against 87 ppm (should-fix).** Removed. Every guideline comparison now uses a converted value.
12. **Smell wording (should-fix).** "Strong, frequent smell beside a big pack" replaced by what the pre-registered shares show (§4.7); ≥ 5 and ≥ 30 OU shares carried into the results.
13. **THC vapour threshold (should-fix).** "Exceeded in every case" corrected (§4.6); carbon number given as C4.5-C6.
14. **Aldehydes (should-fix).** Assumption-based row added (§4.8).
15. **NIOSH ceiling shares (should-fix).** Products with the case probability stated (§4.8).
16. **Figures (should-fix).** fig1 and fig2 no longer draw WHO lines over 1-s series or red means. fig3 now shows only converted 15-min and 1-h values against WHO lines, and 1-s peaks against the NIOSH ceiling only.
17. **Notes.** Taiwan 31-vs-35 ppm caveat kept visible. S1-from was reinstated (PLAN 9.23, 09:06) after S1, S2 and S5-12 results existed, for spare budget; it is now the case behind every "higher than the estimate" statement, and its timing is stated here. Engine heat (1 kW) is an unmeasured assumption whose buoyancy flux is 3-20 times the exhaust's.

### 5.2 Re-checked by the verifiers and found sound

Tailpipe mass flow (5.500 × 10⁻⁴ kg/s from the dictionaries, logged flux 5.4998 × 10⁻⁴); tracer balance; probe statistics (re-extracted independently, 1-s maxima within 4 %); emission inputs against engine arithmetic and inspection data; reference values and unit conversions; "no open-street case approaches the WHO 15-minute value" (robust to every correction above).

### 5.3 Grid and the first metre

Every pack case ran at the 'coarse' grade: a 10 cm tailpipe patch carrying about 5 % of a real 25 mm jet's momentum, and 20 cm cells at the K probes (heights 0.6 and 0.7 m share one cell; the 0.5 m probes are about 2 cells from the source, against the 5 that A3 asks). The verifiers showed that no probe in a pack case can see a dilution below about 50, and that peak-to-mean ratios at 0.5 m (2.3-3.5) are low for plume-core hits.

**The check run here (NF1-fine against NF1-coarse).** One scooter with its rider on open ground, light wind (as run 0.42 m/s at -109°, target 0.3 m/s at -90°) blowing from the scooter toward the kerb, 20 s spin-up and a 30-s window, identical except for the grid: 2.5 cm tailpipe patch and 5 cm cells out to the K 1 m probes (fine), against the matrix grade (coarse). Ratios coarse / fine of P50 values (`corrections/nf1_grid.txt`):

| K probe | Window mean | Highest 10 s | Highest 1 s |
|---|---|---|---|
| 0.5 m, 0.6 m | 0.44 | 0.32 | 0.23 |
| 0.5 m, 0.7 m | 0.77 | 0.53 | 0.31 |
| 0.5 m, 0.8 m | 1.5 | 0.79 | 0.33 |
| 0.5 m, 1.1 / 1.5 m | 26 / 11 | 12 / 8 | 3.4 / 2.9 |
| 1 m, 0.7 m | 1.3 | 1.2 | 0.26 |
| 1 m, 1.1 m | 0.61 | 0.61 | 0.30 |
| 2 m, 1.1 / 1.5 m | 0.81 / 0.88 | 0.96 / 1.1 | 0.55 / 0.83 |

**What it shows.** On the fine grid the plume from one tailpipe stays low and narrow. At 0.5-1 m and pushchair height (0.6-0.8 m) **the coarse grid reads the highest 1 s about 3-4 times too low** and the window mean up to about 2 times too low; at 1.1-1.5 m, 0.5 m away, it reads too high (the coarse grid smears the plume upward). At 2 m the grids agree within about 20 % for means. A3 still fails (the fine grid is not shown to be converged), but the direction is now known: matrix 1-s and 10-s values at pushchair height within 1 m are **probably low by about 3 times**; at adult height 0.5 m away they are probably high. Every odour-unit 1-s figure inherits this. The 90-s means at 2 m and beyond are not grid-limited to first order.

**What NF1-fine gives by itself** (one ordinary fleet scooter, P5 / P50 / P95 over emission draws; 30-s window):

| K probe | Window mean CO | Highest 1 s | ≥ 1 s above 200 ppm | Benzene mean |
|---|---|---|---|---|
| 0.5 m, 0.6 m | 8.7 / 54 / 380 ppm | 23 / 143 / 1,000 | 34 % of draws | 133 ppb (P50) |
| 0.5 m, 0.7 m | 5.0 / 31 / 217 | 17 / 104 / 734 | 24 % | 76 ppb |
| 0.5 m, 1.1 m | 0.11 / 0.69 / 4.8 | 1.3 / 7.7 / 54 | 0.1 % | — |
| 1 m, 1.1 m | 1.5 / 9.3 / 66 | — | — | 23 ppb |

Mean dilution of raw exhaust 0.5 m downwind at 0.6 m: about 90; highest-1-s dilution about 35. **This case has near-laminar air**: σ_w at the upstream probe was 0.031 m/s, a third of PLAN's floor of 0.1 m/s (A6 fails), so the plume stays coherent; real kerbside turbulence and direction wander would spread it more. It is an upper-side near-field case, not a typical one.

**Engine heat (NF1-coarse against NF1-coarse-0kW).** Removing the assumed 1 kW of engine heat lowers the 0.5 m window mean at 0.6-0.7 m from 24 to 6.4 ppm (P50) and at 1.1 m from 18 to 7.3; at 1 m, 1.1 m it leaves it unchanged (5.7). The heat is an unmeasured assumption, and near-field values depend on it by up to about 4 times.

## 6. What would have to be true for kerb CO to reach the WHO 15-minute value

87 ppm held for 15 minutes needs, in a well-mixed space, C = N × q / Q_air (PLAN §1; `bounds/bounds-results.txt`). With the fleet-mean 16 g CO/h per idling scooter:

- 12 idling scooters need the air passing the person to be 0.54 m³/s or less for the whole 15 minutes; 30 scooters 1.35 m³/s; 100 scooters 4.5 m³/s. A pack made entirely of 6.5 % emitters allows about 7 times more air.
- An open street exchanges tens to hundreds of m³/s. At kerb wind speeds of 0.3-2 m/s and turbulence of at least about 0.2 m/s, a pedestrian in the open does not get below that. In the simulation, the pack cases with the wind held from the pack fall 3-15 times short even for someone standing through every red. The exception is the very near field: at 0.5 m directly downwind of one tailpipe, at pushchair height, the plume core itself is the 'nearly sealed volume' (dilution about 90 on average, 35 for the highest second in NF1-fine), and if near-calm air holds its direction for 15 minutes the 15-minute mean there can pass 87 ppm (§4.8). A step of 0.5 m sideways or up to 1.1 m removes it.
- One red alone would need a 90-s mean of about 870 ppm (a 1-s puff of 79,000 ppm): not physical outdoors.
- **Enclosures can.** An underpass or covered waiting area 4.5 m × 3 m in cross-section holding 50 idling scooters with 0.1 m/s of air movement along it gives about 146 ppm; 100 scooters at 0.3 m/s about 97 ppm, reached after 6-17 minutes. Hong Kong underground car parks measured 15-min means of 39 ppm on average and up to 362 ppm (Chan, Burnett & Chow 1997). WHO names garages as the place of the highest non-accidental CO.
- **Taiwanese situations that could come close:** underground or covered scooter parks with engines idling at the ramps or exits; a scooter queue held inside an underpass or a covered waiting zone with little through-flow; a tunnel carrying scooters in slow traffic. None was simulated (S11 not run) and no Taiwanese measurement of any of them was found. An open arcade beside the road is not an enclosure unless scooters idle inside it (bounds: 5 scooters idling inside an arcade segment exchanged at 0.5 m³/s give about 39 ppm well mixed).
- In the two-stroke era the measured world was higher: Taipei roadside and arcade bag samples of 30-50 min in 1989-91 averaged 8.1 ppm with a maximum of 101 ppm, in mixed traffic with an older fleet that emitted several times more CO (Liu, Chan & Jeng 1994). Today the Kaohsiung 48-h maximum minute was about 1.3 ppm total, and traffic-station annual means are 0.54 ppm.

## 7. What it cannot say

- **The 1-s and 10-s values within about 1 m** are grid-limited (§5.3); they are order-of-magnitude values.
- **How often** each condition occurs: the wind persistence of real kerbs within a red was not measured; every probability here is an upper bound built from independent shares.
- **A typical red.** Each case is one realisation of one red in one chosen wind. There is no distribution over weather comparable to the published estimate's, so the simulation cannot replace the estimate's P5 / P50 / P95.
- **Street canyons.** The canyon cases are affected by the end-fed inlet and are probably low by 2-5 times; they exclude exhaust built up over earlier reds and from other traffic.
- **The pull-away burst at green, standing directly behind a queue with the wind along it, a true 15-minute or 1-hour mean, an enclosure, a deep canyon**: not simulated.
- **Smell** rests on two dilution-to-threshold figures for 1960s car exhaust, read from abstracts, applied to scooters. It is reliable as "smellable in many seconds downwind" and not as a number of odour units.
- **Aldehydes and other irritants**: no idle data; only an assumption-based row.
- **Engine heat, exit temperature, angle and pipe diameter** are assumptions.
- **Particles**: not simulated here.
- **Health**: this is not a health assessment and shows no health effect.

## 8. Should the published estimate (`research/estimate`) change?

**Its figures stand; three of its statements should change.**

- **The 90-s figures (0.06 / 0.3 / 0.5 ppm medians; P95 0.3 / 1 / 2 ppm) stand.** The simulation ran single conditional reds, not a distribution over weather, so it cannot replace those percentiles. Where it can be compared fairly it does not overturn them: at 2-4 m the arcade case is within 3 times of the estimate, and the Kaohsiung measurement (48-h maximum about 1 ppm at 2-8 m) argues that reds with the wind held from the pack are uncommon, as the estimate's meander assumes.
- **Its upper tail near the tailpipes is too narrow, and must not be read as a worst case.** With the wind held from the pack for a whole red, kerb 90-s means at 0.5-4 m are 3-12 ppm (S1-from), 3-11 times the estimate's median and above its P95; at 0.5 m directly downwind of one tailpipe in near-calm air the window mean is 30-54 ppm at pushchair height (NF1-fine). The estimate's P95 should be labelled "the upper end of typical reds, not the worst red".
- **Section 8, "Second-by-second peaks: not modelled".** Replace with the simulation's range: highest 1 s of about 5-30 ppm at 0.5 m in ordinary cases, 100-300 ppm in held or near-calm wind, probably higher at pushchair height (grid), always marked Estimate and never compared with a 15-minute guideline.
- **Section 8, "Child or pushchair height: not estimated as a number".** Replace with: "about the same or higher at a child's or pushchair's height; up to about twice when the wind blows from the scooters to you, and many times higher right behind a tailpipe in near-calm air".
- **Section 9's fair comparison "CO against the WHO 15-minute guideline … far below"** stays true for the published 90-s figures and for a pedestrian waiting one red. It must not be extended to brief peaks, to people who stay at the kerb, or to a pushchair parked directly behind a tailpipe in near-calm air.
- **Section 9 lists the OEHHA benzene 1-hour REL as "not fair"** for 90 s. That remains right for one red. For people who stay an hour the comparison is fair with its 6-hour-basis flag, and is reached (§4.8).
