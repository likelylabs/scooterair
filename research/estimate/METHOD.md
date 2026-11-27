# What a pedestrian breathes beside idling scooters at a red light: the published estimate

**Status: ESTIMATE (推估), not a measurement.** Signed 2026-11-26. **Amended 2026-11-27** after the signed 3-D simulation (`research/simulation/METHOD.md` §8): the 90-second figures are unchanged; the statements in §1 (heights, the upper tail), §8 (heights, second-by-second peaks) and §9 (fair comparisons) are amended as marked. Nobody has measured what a person standing at a Taiwanese kerb beside a pack of idling scooters breathes during one red light. This document explains how we estimated it, how far it can be trusted, and what it cannot say.

- Model: `research/estimate/model.mjs`. It is dependency-free. Run it with `node model.mjs`, which takes about 10 s; `node model.mjs --write` does the full run and writes `results.json`.
- Complete record: `research/estimate/results.json` holds every scenario, the exact `estimate()` call that reproduces it, the validation runs, the sensitivity runs and the test cases. A text copy of the full run is in `results.txt`.
- Sources: `research/estimate/sources.json`.

## 1. The answer

All values below are **increments above the air the street already holds**. Each is the mean over a 90-second red, for an adult nose at 1.5 m, standing on the kerb beside the scooter stop box. The three numbers are the 5th / 50th / 95th percentile across modelled reds. They cover weather, queue and which scooters are present, together with our uncertainty in the inputs.

| Scooters queued beside you | CO (ppm) | Benzene (ppb) | PM2.5 (µg/m³) | Ultrafine particle number | Child/pushchair height |
|---|---|---|---|---|---|
| A few (2–5), nearest 2–4 m | 0.007 / **0.06** / 0.3 | 0.01 / **0.1** / 0.8 | 0.02 / **0.2** / 2 | not estimated | see §8 (amended) |
| A dozen or so (8–20), nearest 0.7–3 m | 0.05 / **0.3** / 1 | 0.09 / **0.6** / 3 | 0.09 / **0.9** / 7 | not estimated | see §8 (amended) |
| A full stop box (25–45), nearest 0.3–1.5 m | 0.1 / **0.5** / 2 | 0.2 / **1** / 5 | 0.2 / **2** / 10 | not estimated | see §8 (amended) |

Values are rounded to one significant figure, which is how they may be published. Unrounded values are in `results.json`.

*Amended 2026-11-27 (simulation, `research/simulation/METHOD.md` §8).* The P95 is **the upper end of typical reds, not the worst red**. With the wind held from the pack for a whole red, kerb 90-second means at 0.5–4 m are 3–12 ppm (simulation case S1-from), 3–11 times the median here and above its P95; at 0.5 m directly downwind of one tailpipe in near-calm air the window mean is 30–54 ppm at pushchair height (NF1-fine). Child/pushchair height column: about the same or higher; up to about twice when the wind blows from the scooters to you, and many times higher right behind a tailpipe in near-calm air; not in every wind (see §8).

What the street already holds:

| Pollutant | Background | Source |
|---|---|---|
| CO | 0.24 ppm at general stations and 0.54 ppm at traffic stations (2025 annual means) | MOENV, verified |
| Benzene | Roughly 0.5–4 ppb | Secondary, see §4 |
| PM2.5 | About 13 µg/m³ | MOENV, verified |

So CO and benzene from the pack are **of the same order as the city's own background**. PM2.5 from the pack is **small next to background** in most reds.

Totals including background (dozen scenario, CO): 0.3 / 0.7 / 1.6 ppm. That is about the annual mean at a Taiwanese roadside traffic station.

## 2. Method of record, and why

**Chosen method.** The method is the source-and-dispersion Monte Carlo of `model-source-dispersion`, with seven corrections (§5). Two other models served as cross-checks:

- a ventilated-box model (`model-mass-balance-box`);
- an empirical scaling of measurements (`model-empirical-scaling`).

**Why this one.**

1. It is the only one of the three that the critiques did not break. The box model's own check against the Taiwanese kerb sensors used a queue about 12 times too small. With the right queue, its *median* red is already above the highest minute those sensors recorded in two days. The empirical model's two routes disagree by 5 times. Its leave-one-out test has no skill, and three of its four anchor sites show no resolvable increment.
2. It agrees with the one Taiwanese anchor within its uncertainty once the sensor's real position and wind are used (§6).
3. It is the simplest model that can do all of the following:
   - give a finite answer in calm air;
   - lose exhaust sideways when the wind blows across or away;
   - conserve mass.

   The box model can do none of these. The empirical model can do none of them at the metre scale.

**How far apart the three are**, as typical-scene CO medians at about 1.5 m:

| Model | Median CO | Notes |
|---|---|---|
| Method of record (dozen) | 0.29 ppm | — |
| Method of record (full box) | 0.54 ppm | — |
| Box model, critic-adjusted | 0.3–0.4 ppm | Down from 0.82 as published; an upper bound only |
| Empirical route A (IOT sensors, 35 queued) | 0.20 ppm | — |
| Empirical route B (traffic stations) | 1.1 ppm | Built from three assumed multipliers, so not used |

After correction, every defensible central falls inside our dozen to full-box P5–P95 band of 0.05–2 ppm. The published range covers the disagreement.

## 3. How it works, in plain language

1. **Place the scooters.** Each idling scooter is a small chimney 0.3–0.5 m above the road.
   - They fill the stop box from the stop line backwards, at 2.2–3.2 m² each.
   - Overflow queues in the kerb-side lanes.
   - You stand on the kerb beside the box.
2. **Give each scooter an emission rate.**
   - **CO.** Idle CO is drawn from the 9.07 million idle-CO readings of Taiwan's 2025 scooter inspection. Scooters under 5 years old are not inspected, so they get an assumed cleaner range. The reading becomes grams per gram of fuel by carbon balance, then grams per hour by multiplying by an idle fuel flow.
   - **Other pollutants.** Hydrocarbons, benzene and PM2.5 come from fuel-based factors, with a small share of two-strokes and smokers.
3. **Carry the exhaust to the nose.**
   - Each plume drifts downwind and widens with the air's turbulence.
   - In light wind its direction wanders. AERMOD's low-wind "meander" construction spreads part of every plume in all directions.
   - The ground reflects the plume.
4. **Let the queue build.**
   - 10–40% of the queue is already stopped when the light turns red.
   - The rest arrive through the red.
   - Each plume reaches you after its scooter stops plus a short travel time.
5. **Repeat 30,000 times per scenario.** Every uncertain input is redrawn each time, including wind speed and direction. In two of every three reds the wind does not blow from the pack to you.

## 4. Equations and inputs

**Emission per scooter.**

- e_CO = (0.86/12.011) × (x_CO / S) × 28.01 g CO per g fuel, where x_CO is the inspection %CO and S is CO+CO2 in the sample, 11.5–12.5%.
- Q_CO = F × e_CO / 3.6 mg/s, with F the fuel flow in g/h.
- Q_THC = F × e_THC / 3.6.
- Q_benzene = Q_THC × f_bz.
- Q_PM = F × PM_kg / 3.6 µg/s, with PM_kg in g per kg of fuel.

**Turbulence and transport** (AERMOD, EPA-454/B-26-003 §5.4, eqs 69–73).

- U is the scalar wind speed.
- σ_v = √((i_v U)² + σ_v0²) and σ_w = √((i_w U)² + σ_w0²).
- Transport speed u_e = max(U, √2 σ_v).
- Random-plume fraction f_r = min(1, 2σ_v²/u_e²).

**Coherent plume**, at downwind distance s > 0 and crosswind offset n, with t = s/u_e:

- σ_y = √(σ_y0² + (σ_v t)²) and σ_z = √(σ_z0² + (σ_w t)²).
- C_c/Q = exp(−n²/2σ_y²) · [exp(−(z−h)²/2σ_z²) + exp(−(z+h)²/2σ_z²)] / (2π u_e σ_y σ_z).

**Random plume** at radius r ≥ 0.3 m:

- C_r/Q = [the same vertical term at σ_z(r/u_e)] / (√(2π) σ_z · 2π r u_e).

**Total.**

- C = Σ_i Q_i [(1−f_r) C_c,i + f_r C_r,i] / Q × (90 − t_on,i)/90.
- Units: mg/s ÷ (m/s · m · m) = mg/m³.
- At 25 °C: 1 ppm CO = 1.146 mg/m³; 1 ppb benzene = 3.195 µg/m³.

**Inputs.** The full table is at the top of `model.mjs` and copied into `results.json`. Status codes: V = we opened the source and found the figure; S = secondary; A = assumption, with its basis given.

| Input | Range (P5 / central / P95 or uniform) | Status | Source |
|---|---|---|---|
| Idle CO distribution, scooters ≥ 5 y | 9,067,160 tests, 1% bins | V | MOENV 2025 inspection CO table |
| Mean within the 0–1% bin | 0.3–0.7% | A | No finer split exists |
| Share of kerb fleet < 5 y; their CO | 0.25–0.45; 0.05–0.6% CO | D/A | Phase 7 ≈ 27% of the fleet; no reading exists |
| CO+CO2 in the analyser sample | 11.5–12.5% | V | Cheng 2017, Yilan 12.0–12.2% |
| **Idle fuel flow** | 80 / 120 / 200 g/h | S | Nguyen 2025 (84–101, abstract); Nguyen 2021 (180, abstract) |
| THC per g fuel (FID-equivalent) | 0.008 / 0.025 / 0.06 | D/V/S | NDIR inspection 0.006–0.027; Yao 2008 bench 0.040–0.043 (V) |
| HC high emitters | 2-strokes 1–3% + 0.2–1% of 4-strokes, at 0.10–0.22 g/g | V/A | MOENV 2025: 0.15% of tests fail HC |
| **Benzene share of THC** | 1.2 / 2.7 / 5% (triangular); 2-strokes 1–3% | V/S/A | Yao 2008 idle 2.5–3% (V); Tsai 2018 ~2–3% (S) |
| PM2.5 per kg fuel | 0.05 / 0.25 / 1.3 g/kg; smokers 1–4% at 2–9 g/kg | A/V | Jayarathne 2018 Nepal 0.71 / 8.81 g/kg (V); Euro 3 0.03–0.10 |
| Stop-box depth / width | 2.5–6 m (V, art. 174-2) / 6–10 m (A) | V/A | Road-marking regulations |
| Space per scooter | 2.2–3.2 m² | S | Chang & Chang 2014 |
| Engines off; present at red onset; arrival window | 0–20%; 10–40%; 45–85 s | A | No observation exists |
| **Kerb wind (scalar, about 1.5 m)** | 0.3 / 0.8 / 2.0 m/s; direction uniform | A | 0.2–0.6 × CWA station means (V); IOT on-site 0.4–3.6 m/s (V) |
| σ_v/U; σ_v floor | 0.3–0.6; 0.2–0.5 m/s | V/A | CAL3QHC 25° default; AERMOD minimum 0.2 m/s |
| σ_w/U; σ_w floor | 0.2–0.35; 0.1–0.3 m/s | A | — |
| Initial spreads σ_y0 / σ_z0 | 0.3–1.0 / 0.2–0.8 m | A | Size of scooter and rider; no wake (CAL3QHC) |
| Background CO | 0.15 / 0.35 / 0.9 ppm | V | MOENV 2025 |
| Background benzene | 0.5 / 1.5 / 4 ppb | S | Taiwan HAP national mean ~0.5 ppb (NCKU thesis excerpt); Bangkok kerb 2–3 ppb; deliberately wide. *Wu 2021's 2.54 ppb is a commuter median × 0.9, not ambient, and is no longer used.* |
| Background PM2.5 | 6 / 14 / 35 µg/m³ | V | MOENV 2025 |

**What the emission inputs produce.** The fleet-mean idle emission is 15 g CO/h per scooter (P5–P95 of the fleet mean 8–27), 3.1 g THC/h and 84 mg benzene/h. Benzene/CO is 0.56% by mass.

That benzene/CO ratio sits between the Taiwanese bench value (Yao 2008, 0.16%) and Hanoi (0.47%) at the low end and the speciation file's assumption (up to 1%) at the high end.

## 5. Corrections made to the source model, and their effect

Every correction below was confirmed by re-running the code. The effects are on the dozen-scenario median CO at 1.5 m.

| # | Correction | Raised by | Effect |
|---|---|---|---|
| C1 | The wind input is a scalar speed, so it is AERMOD's effective speed. The original added turbulence twice. | critic-physics | Medians ×1.5–1.7 (0.18 → 0.29 ppm). IOT check improves. |
| C2 | Carbon-balance denominator changed from 11.5–14.5% to 11.5–12.5%. Diluted readings were being treated as undiluted. | critic-inputs | CO +8% |
| C3 | HC high-emitter share from 2–5% to two-strokes + 0.2–1% (MOENV HC fail rate 0.15%). THC scatter mean-corrected. New scooters given ×0.3–1 THC. THC moved toward the FID basis on which the benzene share was measured. | critic-inputs | Benzene emission 134 → 84 mg/h, partly offset by the FID shift |
| C4 | Benzene share from 0.7/2.8/6% to 1.2/2.7/5%. Two-strokes use the fuel's benzene content. | critic-inputs | Small |
| C5 | Particle-number range widened to the source's own factor ~15 each way. Still a lower bound; not published. | critic-inputs | — |
| C6 | Benzene background re-sourced. | critic-inputs, critic-communication | Totals only |
| C7 | Fuel-flow P95 raised from 180 to 200 g/h, because the Hanoi set fails its own carbon balance. | critic-inputs | P95 slightly up |
| — | Validation: only Mingcheng is used. The Zhongzheng 0.5 ppm is the median-island sensor, and three sites show no increment over the station. Direction-persistence test added. | critic-inputs, critic-communication, critic-physics | §6 |

## 6. Validation against measured anchors

**(a) IOT-113-TB006 kerb sensors, Kaohsiung, July 2024.** This is the only Taiwanese measurement.

- **What was measured.**
  - One-minute electrochemical CO at waiting zones, inlet 1.2–1.5 m, 48 h per site.
  - Only the busiest junction (Mingcheng 1st/Minzu 1st, about 1,500 motorcycles per approach-hour, about 34 per red) shows a clear increment: about 1.3 ppm total at the highest minute, against a station at 0.1–0.5 ppm, so about 0.8–1.2 ppm above background.
  - At the other three sites the kerb maxima (0.5–0.62 ppm) are at or below the concurrent station level.
  - So the anchor bounds the model from above. It does not confirm a positive value at three of four sites.
- **What we simulated.** That sensor: 17–50 scooters per red, about 500 reds per campaign, 200 campaigns. The statistic is the 48-h maximum 1-minute increment (`results.json → validation`).

| Simulated sensor | Predicted 48-h max increment, P5 / P50 / P95 | Campaigns ≤ 1.2 ppm |
|---|---|---|
| Our scenario assumptions (wind median 0.8 m/s, sensor 1–3.5 m from pack) | 1.0 / 2.0 / 4.0 ppm | 10% |
| Site's measured wind (1.6 m/s median) | 0.8 / 1.5 / 3.1 | 30% |
| Sensor across the crosswalk (2–8 m ahead, 2.5–5 m lateral) | 0.5 / 1.0 / 1.9 | 69% |
| Both | 0.4 / 0.8 / 1.8 | 74% |
| Both, with wind direction persisting through the campaign | 0.4 / 0.8 / 1.7 | 80% |

**Reading.** With the sensor where it actually was and the wind actually measured, the model matches the observed 0.8–1.2 ppm. With our pedestrian's assumptions (closer, calmer) it gives about twice the observed maximum. Two conclusions follow:

1. The model's upper tail is not too low.
2. If anything, the scenario values are more likely high than low, by up to about 2 times.

This is a check on the kernel at 2–8 m in moderate wind. It is **not** a validation of the 0.3–3 m near field, which nobody has measured.

**(b) Taiwanese traffic stations.** The dozen-scenario total median (0.7 ppm) is close to the national traffic-station annual mean (0.54 ppm, MOENV 2025). That is consistent with "beside a stop box is like a busy roadside".

**(c) PM2.5.** IOT kerb PM2.5 was 4–14 µg/m³ with no visible traffic signal. The model's median increment of about 1 µg/m³ is consistent with that.

**(d) Benzene.** The modelled totals for the dozen scenario are 0.9 / 2.4 / 5.9 ppb. Taipei on-road commuter means were about 2.6 ppb for cyclists and about 4.2 ppb for electric-scooter riders (Wu 2021, chart reading). This is a consistency check of scale only.

## 7. Sensitivity: what moves the answer most

Dozen scenario, median CO increment at 1.5 m, with one input pinned at its P5 and then its P95 (baseline 0.29 ppm):

| Input | At P5 | At P95 | Spread |
|---|---|---|---|
| **Wind speed** (0.3 → 2.0 m/s) | 0.47 | 0.11 | ×4.3 |
| **Meander construction** (removed) | 0.07 | — | ×4 (structural) |
| **Idle fuel flow** (80 → 200 g/h) | 0.19 | 0.48 | ×2.5 |
| Number of scooters (8 → 20) | 0.18 | 0.37 | ×2.1 |
| Nearest tailpipe (0.7 → 3 m) | 0.37 | 0.21 | ×1.8 |
| Wind blowing from the pack (vs any direction) | — | 0.40 | ×1.4 |
| Mean CO in the 0–1% inspection bin | 0.24 | 0.34 | ×1.4 |
| Share of new, uninspected scooters | 0.33 | 0.26 | ×1.3 |
| Initial spreads, turbulence ratios, buoyancy, carbon sum | — | — | < ×1.1 each |

- For **benzene**, the benzene share of THC (×4 across its range) and THC per gram of fuel (×7) are added on top of everything that moves CO. The benzene range is therefore about twice as wide as CO's.
- The single input most worth measuring is **the idle fuel (exhaust) flow of in-use Taiwanese scooters**, because it scales every pollutant. For benzene alone, it is the benzene share of idle exhaust hydrocarbons.

## 8. What it cannot say

- **Ultrafine particle number: not estimated.**
  - No idle particle-number emission rate exists for small four-strokes.
  - The volatile nucleation particles that dominate counts near fresh exhaust are not represented.
  - The model's number (a few hundred per cm³ for a dozen scooters) is a lower bound of unknown size.
  - The models disagree by about 200 times depending on route.
  - The chart shows ultrafine particles as **unmeasured and unestimated**.
- **Child or pushchair height: not estimated as a number here; simulated since (amended 2026-11-27).**
  - The model gives 0.6 m / 1.5 m ratios of 1.3–1.6 (P5–P95 1.1–3.3), but these rest on an assumed initial plume depth.
  - Borrowed measurements say the same or higher: +5–15% for NO2 at 0.8 m (Kenagy 2016) and about 1.6 times for a diesel tailpipe (Buzzard 2009).
  - ~~The publishable statement is: "probably the same or higher at a child's or pushchair's height; by how much is unknown."~~ Replaced by the simulation (`research/simulation/METHOD.md` §4.9, §8): "about the same or higher at a child's or pushchair's height; up to about twice when the wind blows from the scooters to you, and many times higher right behind a tailpipe in near-calm air". Not in every wind (the street-canyon cases, which are not settled, gave 0.6–0.7). Published only as statement 5 of `research/simulation/statements.json`, marked Estimate.
- **The time course within the red: not published.** The modelled build-up is set by an assumed arrival law. The one measured red-phase series (Shanghai particles) falls through the red, because of the pull-away from the previous green. The pull-away burst at green is not modelled at all. *(2026-11-27: the simulation's one-second series show bursts, not a build-up; the pull-away is still not simulated.)*
- **Second-by-second peaks.** ~~These are not modelled: there are 90-s means only. Brief plume hits of a few ppm CO within a red are expected but not quantified.~~ *Amended 2026-11-27:* this model gives 90-s means only, but the simulation (`research/simulation/METHOD.md` §8) gives the highest 1 s as about 5–30 ppm at 0.5 m in ordinary cases and 100–300 ppm in held or near-calm wind, probably higher at pushchair height (grid). Always marked Estimate and never compared with a 15-minute or 1-hour guideline.
- **Other traffic.** Cars, buses and lorries in the same queue, and moving cross traffic, are excluded. These are scooter-only increments.
- **A particular junction.** The results are distributions over generic Taiwanese approaches.
- **Emissions of scooters under 5 years old.** These are assumed; no reading exists.
- **Health effects.** It is not a health assessment and shows no health effect.

## 9. Fair and unfair comparisons for a 90-second exposure

**Fair:**

- **CO against the WHO 15-minute guideline** (100 mg/m³, about 87 ppm). Even the full-box P95 (2 ppm) is about 1/40 of it, and the dozen median is about 1/300. Fair as "far below". *Amended 2026-11-27:* for the published 90-second figures and for a pedestrian waiting one red, after conversion (one 90-s red counts one tenth of a 15-minute mean). Not for brief peaks, not for people who stay at the kerb through every red, and not for a pushchair parked directly behind a tailpipe in near-calm air (`research/simulation/METHOD.md` §8).
- **CO against Taiwan's 1-hour standard** (31 ppm) and the WHO 1-hour value (35 mg/m³, about 30 ppm), as "far below". *Amended 2026-11-27:* for one red after conversion (one 90-s red counts 1/40 of an hour). For people who stay through every red with the wind held from the pack see `research/simulation/METHOD.md` §4.8; the exception is a pushchair 0.5 m behind one tailpipe in held near-calm air, which passes 31 ppm in most such hours (low confidence; not printed on the site, per `statements.json`).
- **CO and benzene against the city's own background.** Same order as the urban background.
- **The total against the annual mean at Taiwanese traffic stations** (0.54 ppm), as an order-of-magnitude analogy: "like a busy roadside".
- **Benzene against Taipei on-road commuter exposure**, as an analogy of scale: about 2.6 ppb for cyclists and about 4.2 ppb for electric-scooter riders (Wu 2021, chart reading).
- **Dose arithmetic.** Four reds a day at +0.3 ppm adds about 0.001 ppm to the 24-hour mean CO, under 1% of background. The red-light wait is a small, repeated, avoidable slice of exposure. For people who spend hours at the kerb, such as traffic police, vendors and crossing guards, repeated reds add up to a roadside-like exposure.

**Not fair:**

- 8-hour, 24-hour or annual standards (for example the WHO 24-h CO 4 mg/m³, or annual PM2.5).
- Cancer unit risks or lifetime risk from 90 seconds.
- The benzene OEHHA "1-hour REL", which is unverified and has an uncertain averaging time. *Amended 2026-11-27:* now verified (8.5 ppb, 1 h, derived on a 6-h basis; ARB table of 2025-07-18, opened for the simulation). Still not fair for one red. Fair for people who stay an hour, with its 6-hour flag, and reached in the simulation (`research/simulation/METHOD.md` §4.8).
- The ATSDR 14-day MRL.
- The WHO particle-number "high" marker.
- "× background" multipliers as a headline.
- Hanoi's 8.5 ppm pedestrian CO as like-for-like.
- The box model's "downwind whole red" or the empirical "worst red in two days" values as typical.

## 10. The critiques' objections and our answers

| Objection | Answer |
|---|---|
| The SD model double-counts turbulence in the wind speed (physics) | Accepted (C1). Medians rose ×1.5–1.7. |
| The upwind "initial cloud" term is ad hoc and outside the mass check (physics) | Kept. It only affects receptors within about σ_y0 (≤ 1 m) of a tailpipe. Disclosed. |
| Dilution comparison with Wang 2015 is not discriminating (physics) | Agreed. No longer quoted as support. |
| Meander: an hourly construction applied to 90 s; the median depends on it ×3–4 (physics, communication) | Accepted as a structural uncertainty. The no-meander median (0.07 ppm) lies inside the published band (0.05–1). Meander is physically real in light wind at a kerb, and the IOT check does not favour removing it. We publish the band, not the median alone, and say the central is uncertain by about 3 times. |
| 1.5 m sits on the plume's upper flank; nearer is not always more at adult height (physics) | True in the model and unmeasured. "Step back N metres to cut exposure by X" is banned wording. |
| Validation redraws direction every red (physics) | Tested. Persistent direction changes the result little (§6). |
| Bands mix variability and parameter uncertainty (physics) | Agreed. Bands are described as "modelled range", not "range across reds". |
| Carbon-sum denominator; THC inflation; benzene share; PN range (inputs) | Accepted (C2–C5). |
| Benzene background misread (inputs, communication) | Accepted (C6). Re-sourced, wide, secondary; needsManualFetch for PAMS data. |
| Fuel flow from Vietnamese abstracts; Hanoi set fails its carbon balance (inputs) | Accepted. P95 widened to 200. Disclosed as the input most in need of a Taiwanese measurement. |
| IOT anchor misread (Zhongzheng island sensor); three of four sites show no increment (inputs, communication) | Accepted. Only Mingcheng is used, and the anchor is described as an upper bound. |
| Box model: IOT queue wrong by ~12 times; mass check tautological; inconsistent with its own plume check (all) | Accepted. The box model is not used for values. It is an upper bound only, and its "agrees with IOT" and "mass balance closes" claims are withdrawn. |
| Empirical model: leave-one-out has no skill; a 50/50 mixture is not a probability interval; route B is assumption-driven (all) | Accepted. Only route A is used, as a cross-check. The mixture median is not used. |
| "Typical" means different things in different models (communication) | Scenarios are now named by queue size. |
| OEHHA REL comparison; WHO particle-number marker comparison (communication) | Removed. (OEHHA REL restored 2026-11-27 for people who stay an hour, see §9.) |

## 11. Confidence by pollutant

| Pollutant | Confidence | Basis |
|---|---|---|
| CO | Medium for the order of magnitude ("a few tenths of a ppm"); low for any single value | Central uncertain by about 3 times. Supported by the inspection distribution (V) and the one kerb anchor. |
| Benzene | Low | Uncertain by about 5–10 times. Derived from CO-linked emissions through an unmeasured idle benzene share. Publish only with that caveat. |
| THC | Low | Recorded in `results.json`, not charted. |
| PM2.5 | Low for the value; medium for the qualitative statement "small next to background in most reds" | Emission factor spans about 25 times; consistent with IOT kerb PM2.5. |
| Ultrafine particle number | None. Unestimated. | — |
| Height difference | None as a number. Qualitative statement only. | — |
| Build-up curve | Not published. | — |
