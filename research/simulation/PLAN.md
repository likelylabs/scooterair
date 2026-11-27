# Kerbside near-field simulation: bounds, scenario plan, probes, statistics and acceptance checks

**Status: pre-registration.** This was written on 2026-11-27, before any 3-D simulation result existed. It fixes four things in advance, so that nobody can pick a statistic or a case after seeing the numbers:

- which cases are run;
- where the probes are;
- which statistics are extracted;
- which checks a result must pass before anyone believes it.

Any change after results exist goes in §9 *Amendments*, with its date and reason. The change applies to every case, never to one.

**Why the simulation is being done.** The owner stood beside a large idling pack and wrote: "it smelled HORRIBLE … you need to do the physics simulations". The second half is right. The published estimate gives 90-second means at adult height on the kerb. Its own §8 says it cannot speak about:

- the first metre behind a tailpipe;
- child or pushchair height;
- second-by-second plume hits;
- arcades;
- the burst when the scooters pull away at green;
- smell.

The owner's *expected result* ("above the guideline") is not an input. **The simulation reports what the physics gives.** No input, case or statistic below was chosen to reach a threshold or to avoid one. Each threshold appears only as a level we ask "what would it take?" about.

Files:

- `bounds/bounds.py` → `bounds/bounds-results.txt`: conservation-of-mass and near-field bounds (numpy only, a few seconds).
- `bounds/estimate-corners.mjs` → `bounds/estimate-corners.txt`: the published model (`research/estimate/model.mjs`, unchanged) pinned at its exposure-maximising corner.
- Inputs: `research/estimate/model.mjs` INPUTS, `research/estimate/inputs-*.json`, `research/simulation/inputs-simulation.json`. Source ids are those in `research/estimate/sources.json` and `research/simulation/sources.json`. This step opened no new source. The plume and jet constants in §1.4 are standard textbook values (entrainment α ≈ 0.1; jet centreline decay constant ≈ 5). They are used as stated assumptions, and no source is cited for them.

---

## 1. Bounds from conservation of mass (before any simulation)

### 1.1 Emission inputs (replicating the estimate)

The idle CO distribution comes from the MOENV 2025 inspection table (moenv-co-2025, 9.07 M tests), with the estimate's treatment of new scooters, fuel flow and carbon sum:

- **Per scooter:** mean **16 g CO/h**, median 9, P90 37, P99 117, P99.9 ≈ 220 g/h. The estimate gives a fleet mean of 15.4 g/h.
- **Raw tailpipe CO:** median 0.47 %. The flux-weighted fleet mix is **0.81 % (8,100 ppm)**.
  - 16 % of idling scooters are at ≥ 1 % CO, 4.3 % at ≥ 3 %, 1.0 % at ≥ 5 % and 0.3 % at ≥ 7 %. These shares already allow for 35 % uninspected new scooters.
- **Exhaust flow:** 0.26 / 0.46 / 0.80 L/s at 25 °C (P5 / P50 / P95). This is consistent with inputs-simulation `exhaustFlow` (0.31–0.78 L/s).

### 1.2 A well-mixed volume: C = E / Q

CO increment (ppm) for N idling fleet-mean scooters mixed into fresh air Q (m³/s):

| N \ Q (m³/s) | 0.3 | 1 | 3 | 10 | 30 | 100 |
|---|---|---|---|---|---|---|
| 4 | 53 | 16 | 5.3 | 1.6 | 0.5 | 0.16 |
| 12 | 158 | 47 | 16 | 4.7 | 1.6 | 0.47 |
| 30 | 394 | 118 | 39 | 12 | 3.9 | 1.2 |
| 100 | 1,314 | 394 | 131 | 39 | 13 | 3.9 |

**Largest air exchange that still reaches 87 ppm (WHO 15-min, 100 mg/m³):**

| Scooters (N) | Fleet-mean emitters | Fleet-mean at its P95 | All high emitters (6.5 % CO, ~110 g/h) |
|---|---|---|---|
| 12 | 0.54 m³/s | 0.90 m³/s | 3.7 m³/s |
| 30 | 1.35 m³/s | 2.3 m³/s | 9.2 m³/s |
| 100 | 4.5 m³/s | 7.5 m³/s | 31 m³/s |

For 30 ppm (the 1-hour values) multiply Q by about 2.9. For 9 ppm (the 8-hour values) multiply by about 9.7.

Outdoor air exchange is the ventilation speed times the cross-section the exhaust mixes into:

| Air speed | Cross-section | Q |
|---|---|---|
| 0.3 m/s | 7 m × 1.5 m (the kerb-side layer next to a pack) | 3.2 m³/s |
| 1 m/s | 7 m × 1.5 m | 10.5 m³/s |
| 0.5 m/s | 20 m × 10 m (whole street) | 100 m³/s |

So even if every gram from 30 scooters passed through a 1.5 m-deep layer at 0.3 m/s, the layer would hold about 38 ppm. Both "every gram" and "through the nose's layer" are upper-bound assumptions: wind direction varies, and plumes spread above 1.5 m and sideways.

### 1.3 Dilution of raw exhaust needed to reach each level

Each cell is raw / target.

| Raw idle CO | 87 ppm | 30 ppm | 9 ppm | 1 ppm |
|---|---|---|---|---|
| New FI scooter ~0.3 % | 34 | 100 | 330 | 3,000 |
| **Fleet flux-weighted mix 0.81 %** | **93** | 270 | 900 | 8,100 |
| 1.5 % | 170 | 500 | 1,700 | 15,000 |
| 3.5 % (pre-2017 limit) | 400 | 1,170 | 3,900 | 35,000 |
| 6.5 % (high emitter) | 750 | 2,170 | 7,200 | 65,000 |
| ≥ 9 % bin | 1,090 | 3,170 | 10,600 | 95,000 |

The estimate's 90-s kerb means imply a dilution of about 28,000 (dozen-scooter median) and about 4,800 (full-box P95). Measured comparisons, for moving vehicles (wang-2015, buzzard-2009):

- about 6,000 at 3 m;
- 75–125 at 8.5 m in a wind tunnel;
- up to 1,000 within 2 s.

### 1.4 One tailpipe: how close, in how little wind, does that dilution exist?

Exit conditions are 0.47 L/s at 25 °C, 25 mm and 250 °C (diameter and temperature are assumptions; see inputs-simulation). That gives:

- exit speed 1.7 m/s;
- momentum flux 1.4 × 10⁻³ m⁴/s²;
- buoyancy flux 3.4 × 10⁻³ m⁴/s³;
- jet-to-plume length **0.12 m**. Beyond about 12 cm in still air the exhaust behaves as a weak buoyant plume, not a jet.

**Still air** (an idealisation; it never lasts). Centreline dilution of a Morton–Taylor–Turner point plume:

| Height above the pipe | Dilution | CO at the fleet mix | CO at 6.5 % raw | Rise speed |
|---|---|---|---|---|
| 0.3 m | ~4 | ~2,200 ppm | ~18,000 ppm | 0.57 m/s |
| 0.5 m | ~9 | ~950 ppm | — | — |
| 0.8 m | ~19 | ~440 ppm | — | — |
| 1.2 m | ~37 | ~220 ppm | — | 0.36 m/s |

The rise speed is about the same as the kerb turbulence floor (σ_v 0.2–0.5 m/s, epa-aermod-2026). So within about 0.3–0.5 m the plume is bent over and torn apart. In dead calm, someone leaning directly over a tailpipe would be in hundreds to thousands of ppm. That is physically real, but it is not a pedestrian's position.

**Bent-over plume in light air.** This uses the estimate's turbulence law at its low-dilution end. Values are on the plume axis, at pipe height 0.4 m. Each cell gives the time-mean dilution, then the instantaneous-core dilution in brackets.

The instantaneous core assumes a pipe-scale start and a relative spread of 0.3–0.5 × the mean growth. This is an ASSUMPTION: the meandering-filament picture, in which most of the near-source mean width is the meander of a narrow filament.

| U (m/s) | 0.25 m | 0.5 m | 1 m | 2 m | 4 m |
|---|---|---|---|---|---|
| 0.2 | 300 [16–27] | 490 [34–75] | 1,090 [100–270] | 2,700 [380–940] | 8,900 [1,200–2,600] |
| 0.5 | 460 [23–33] | 640 [40–78] | 1,260 [100–260] | 3,000 [360–950] | 8,700 [1,300–2,800] |
| 1.0 | 870 [40–52] | 1,070 [59–103] | 1,830 [130–310] | 4,000 [430–1,100] | 10,700 [1,600–3,600] |
| 2.0 | 1,700 [77–96] | 2,000 [110–180] | 3,300 [230–510] | 7,000 [700–1,800] | 18,000 [2,600–6,100] |

How far the instantaneous core keeps each level, for one scooter (U 0.2–1 m/s):

| Raw CO | 87 ppm reached within | 30 ppm within | 9 ppm within |
|---|---|---|---|
| Fleet mix 0.81 % | 0.6–0.7 m | 1.2–1.3 m | 2.3–2.4 m |
| 1.5 % | 0.9–1.0 m | 1.6–1.8 m | 3.1–3.7 m |
| 6.5 % | 2.0–2.2 m | 3.6–4.4 m | 8–9 m |

**But these distances hold at pipe height (0.3–0.5 m), in the core, and only while the core points at the nose.** At 1.1–1.5 m above the ground, an unlifted filament from a 0.4 m pipe misses the nose (bounds §D). What decides whether a 0.6–0.8 m pushchair or a 1.1 m child is hit:

- buoyant rise of 0.1–0.5 m within 1–2 m;
- the rider and scooter body;
- the kerb step;
- the 0–30° upward exit angle.

These are what the 3-D simulation must resolve.

**Conclusion of 1.4.** Second-scale CO of **tens to a few hundred ppm** is physically plausible at 0.3–0.8 m height within about 0.5–2 m of a tailpipe. That covers the pushchair zone beside or behind the kerb-lane queue, and further out for a high emitter. Whether and how often a nose is there is the simulation's job. Such a hit lasts seconds, so its contribution to a 15-min mean is its level × seconds / 900.

### 1.5 Pack upper envelope for a 90-s mean

The envelope assumes:

- wind held straight from the pack to the kerb for the whole red, with no meander;
- every scooter idling from t = 0;
- σ_v at its 0.2 m/s floor and σ_w at its 0.1 m/s floor;
- fleet-mean emitters.

This is not a simulation. It is the most exposure a Gaussian treatment can give.

| Scooters | U (m/s) | 0.5 m from nearest pipe (0.7 m / 1.5 m height) | 1 m | 2 m | 4 m |
|---|---|---|---|---|---|
| 4 | 0.3 | 5.3 / 1.7 | 5.8 / 1.9 | 4.2 / 2.2 | 1.9 / 1.5 |
| 12 | 0.3 | 12 / 4.6 | 13 / 4.9 | 9.5 / 5.2 | 4.5 / 3.6 |
| 12 | 0.8 | 6.1 / 1.9 | 6.5 / 2.1 | 6.4 / 2.5 | 4.1 / 2.6 |
| 30 | 0.3 | 14 / 5.9 | 15 / 6.1 | 11 / 6.6 | 6.6 / 5.3 |
| 30 | 0.8 | 7.6 / 2.8 | 7.8 / 3.0 | 7.4 / 3.3 | 5.1 / 3.3 |

Adjustments to the envelope:

- **Fleet-mean emission at its P95:** ×1.8.
- **Nearest kerb-side scooter a 6.5 % emitter:** +5 to +13 ppm at 0.5–2 m and 0.7 m height when U = 0.3. This happens in 1 % of reds.
- **Standing directly behind the last row of a 12-scooter kerb-lane queue**, wind along the queue at 0.3 m/s: 15 ppm (0.7 m) and 3.6 ppm (1.5 m) at 0.5 m; 7 ppm (0.7 m) at 2 m.

The published model, pinned at the same corner (`bounds/estimate-corners.txt`; CO increment, median [P5–P95]):

| Published model setting | 0.6 m | 1.5 m |
|---|---|---|
| Published dozen (as on the site) | 0.43 [0.08–1.7] | 0.29 [0.05–1.1] |
| Dozen, wind from pack, 0.3 m/s, nearest 0.5 m, all present | 1.7 [0.55–5.7] | 0.98 [0.36–2.8] |
| … plus no meander | 4.5 [0.7–18] | 3.1 [0.5–10] |
| Full box, wind from pack, 0.3 m/s, nearest 0.3 m, all present, fuel 200 g/h, no meander | 8.6 [1.4–31] | 5.6 [1.0–17] |

So the published 90-s means can be **about 10–30 times lower** than what the same physics gives in this corner. The causes are the averaging (wind direction redrawn every red, two reds in three not from the pack, meander, arrival through the red) and the receptor (adult height, 0.7–3 m). The corner's highest 90-s means are about 5–30 ppm at pushchair height.

That is still a 90-s value. One such red adds 0.5–3 ppm to a 15-min mean, and 0.1–0.8 ppm to a 1-h mean.

### 1.6 What it would take

Averaging arithmetic: a level C held for t seconds inside a T-second window adds C·t/T to the window mean.

| Reference (averaging time) | One 90-s red needs a 90-s mean of | Standing through every red (red is 45–65 % of the cycle) needs, during each red |
|---|---|---|
| WHO 15-min, 87 ppm | 870 ppm | 134–194 ppm |
| 1-h values, 30–31 ppm | 1,200 ppm | 46–67 ppm |

For brief peaks, a 10-s burst would need 7,900 ppm and a 1-s puff 79,000 ppm to make a 15-min mean of 87 ppm on its own.

- **Outdoors at a kerb.** The highest pack envelope (1.5) is 5–15 ppm at 0.7 m. Standing through all reds at that envelope gives a 15-min mean of about 3–8 ppm. That is **about 10–30 times short** of 87 ppm. Reaching 87 ppm would need the fresh-air exchange past the person to fall to:
  - **≤ 0.74 m³/s** for 30 scooters, a ventilation speed ≤ 0.07 m/s through a 7 m × 1.5 m layer;
  - **≤ 2.5 m³/s** for 100 scooters, ≤ 0.24 m/s.

  Neither is plausible for a person standing in an open street. Kerb winds are 0.3–2 m/s, the turbulence floor is about 0.2 m/s, and direction wanders. **Conclusion: a 15-min mean of 87 ppm at an open-air kerb is not physically plausible for a pedestrian, even standing through every red.** The 1-h values (30 ppm through 1 h) are short by a similar factor.
- **Arcade (騎樓) with no source inside.** At steady state its air cannot exceed the time-mean of the air entering it. An arcade can hold exhaust past the green, which raises a 15-min mean toward the kerb-edge red mean × duty. It cannot make peaks above kerb-edge peaks. It becomes a source enclosure only if scooters idle inside it or at its mouth: 5 scooters exchanged at 0.5 m³/s give 39 ppm well mixed. That is a different situation from a red light.
- **Scooter underpass or tunnel with the queue held inside** (A = 4.5 m × 3 m assumed). C = N·E / (A·u_air):
  - 50 scooters at 0.1 m/s longitudinal air: 146 ppm;
  - 100 scooters at 0.3 m/s: 97 ppm.

  It takes about 6–17 min to reach steady state over 100 m. **A queue held inside a poorly ventilated scooter underpass for 15 min could reach the WHO 15-min value.** That is physically plausible, but such holds are rare (no Taiwanese measurement; inputs-simulation `enclosedCases`).
- **Enclosed car parks** are the measured precedent. In 52 Hong Kong underground car parks the 15-min TWA averaged 39 ppm and reached 362 ppm (chan-burnett-chow-1997). Taipei's underground car parks name CO as the main pollutant (hung-2011, no values).

### 1.7 Which references apply to brief peaks

Below 15 minutes there are no public-health CO values. There are only:

- AEGL-2, 10-min 420 ppm (emergency, disabling effects);
- the NIOSH ceiling of 200 ppm (occupational, instantaneous) (epa-aegl-co, niosh-npg-co).

A 1-s or 10-s peak may be compared only in two ways:

- (a) after converting it to its contribution to the 15-min or 1-h window;
- (b) with those ceilings, labelled emergency or occupational.

### 1.8 Smell

The whole-exhaust dilution-to-threshold is D/T_raw ≈ 800–1,000 (Fiala 1967) to 5,200–6,800 (Swedish 1970) (epa-ap122-1973, abstracts). Odour units at the nose are OU = D/T_raw / D.

| CO increment at the nose | Dilution D | OU |
|---|---|---|
| Dozen 90-s median, 0.29 ppm | 28,000 | 0.03–0.24 |
| Full-box 90-s P95, 1.7 ppm | 4,800 | 0.2–1.4 |
| 5 ppm (seconds) | 1,600 | 0.5–4 |
| 20 ppm (seconds) | 400 | 2–17 |

An HC-rich scooter (about 5,400–5,800 ppm HC against 400–500) is about 10× more odorous per unit of CO (ASSUMPTION). There is one in 11–31 % of 12-scooter packs (two-strokes) plus the HC-failing tail.

**Reading.** A "horrible" smell is what seconds-long plume hits of a few to tens of ppm CO-equivalent exhaust predict, and more so with an HC-rich neighbour. The smell is real and physically expected. It does not imply CO near 87 ppm for 15 minutes, and CO itself has no smell.

### 1.9 Where the published model's assumptions could hide exposure

| Assumption | What it hides | Size (from 1.4–1.5) |
|---|---|---|
| 90-s mean only | Seconds-long plume-core hits | Plume-core concentration about 5–15× the time-mean on the axis at 0.5–1 m (§1.4); the time-mean itself is up to 10–30× the published value in the corner (§1.5) |
| Adult 1.5 m height | Pushchair and child heights nearer the pipe | 0.6/1.5 ratio 1.3–3.3 in the model; core-hit ratio unbounded by the model |
| Kerb receptor 0.7–3 m (dozen), 0.3–1.5 m (full box) | Behind the last row; beside a kerb-hugging scooter at 0.3–0.5 m | Pack envelope ×1.3–1.5 at 0.5 m vs 2 m (0.7 m height); behind the last row ×2 at 0.5 m vs 2 m; single plume core far more (§1.4) |
| Wind direction redrawn every red; 2 reds in 3 not from the pack | Persistent onshore wind | Wind from pack ×1.4 in the model; with calm, nearest 0.5 m, full pack and no meander ×10 on the median (estimate-corners) |
| AERMOD-style meander applied to a 90-s window | Coherent plume impact | ×4 on the published median (estimate §7); ×2.3–2.6 in the already-pinned corner |
| Arrival through the red, 0–20 % switched off | Full pack from onset | ×1.4 |
| Initial spread 0.3–1.0 m (wake-sized) | Narrow filaments from a stationary scooter | Controls the first 1 m entirely |
| Flat open ground | Arcade, canyon recirculation, enclosure | Unknown: needs 3-D |
| No pull-away burst | 5–15 s spike at green | Unknown: assumption-driven |

---

## 2. What the 3-D transient simulation must be able to do (minimum spec)

- **Physics.** Time-resolved 3-D flow with resolved large eddies (LES or equivalent), plus passive scalars, plus buoyancy from the exhaust heat flux. The inflow must carry turbulence matched to the estimate's ranges at 1.5 m:
  - σ_v/U 0.3–0.6, σ_w/U 0.2–0.35;
  - floors σ_v 0.2–0.5 m/s and σ_w 0.1–0.3 m/s (model.mjs INPUTS).
- **Scene frame.** x runs along the street in the direction of travel, with the stop line at x = 0 and the stop box at −4 m < x < 0. y runs across the street: kerb face at y = 0, pavement at y < 0, road at y > 0. z is height above the road; the pavement top is at z = 0.15 m (kerb height, ASSUMPTION).
  - **Breathing heights are measured above the surface the person stands on**: pushchair 0.6 / 0.7 / 0.8 m, child 1.1 m, adult 1.5 m. On the pavement add 0.15 m.
- **Scooters.**
  - Each scooter is a 1.8 m × 0.7 m × 1.1 m block with a seated rider (block or cylinder up to 1.6 m), solid.
  - Tailpipe at the rear-right (kerb side under right-hand traffic), 0.3–0.5 m high (0.4 m baseline), 25 mm, pointing rearward and 0–30° up (10° baseline).
  - Exit 0.47 L/s at 25 °C, 250 °C exhaust (100–350 °C in the near-field case).
  - Kerb-lane tailpipe column at y = 0.3 m: scooters hugging the kerb, ASSUMPTION, so the nearest-pipe distances below put the 0.5 m probe at the pavement edge.
  - Lateral pitch 1.05 m; row spacing 2.0 m in the box and 2.2 m in the queue.
- **Scalars and linearity.** CO is passive, so concentration is linear in emission. Each case carries separate unit-emission tracers for:
  - (i) the scooter nearest the headline probes;
  - (ii) the rest of the kerb-lane column;
  - (iii) box row 1;
  - (iv) box row 2;
  - (v) the overflow queue.

  Emission rates, high-emitter substitution, THC, benzene and odour are then applied **in post-processing** by Monte Carlo over the estimate's emission distributions (`drawScooter` in model.mjs, 1,000 draws per case). Heat release stays fixed at the baseline value. This keeps emission uncertainty out of the expensive runs and makes the emission side identical to the published estimate.
- **Resolution.** At most 2 cm cells at the tailpipe exit (or a validated near-exit source model). At most 5 cm within 2 m of any source and around every probe. At most 0.25 m elsewhere. Grid case G halves the near-field spacing.
- **Domain.** At least 40 m (x) × 30 m (y, wall to wall or open) × 15 m (z), or 3 × building height above the street, whichever is larger. Inflow 10 m upstream of the first scooter; outflow at least 15 m downstream of the last probe.
- **Time.**
  - 60 s spin-up with sources off, then the red phase(s).
  - Probes sampled at ≥ 10 Hz and stored as 1-s means. Raw 0.1-s series are kept for the K and B probes in S1, S3 and G.
  - Each red is 90 s, with all scooters idling from t = 0 (steady-idle, conservative). The estimate's arrival law is applied in post-processing by masking each tracer group before its arrival time (labelled approximate).
  - Background CO, benzene and THC are added afterwards from the estimate's background distributions, for totals only.
- **Realisations.** Turbulence makes one red one sample. Each case runs **at least 5 consecutive reds** (S1 and A at least 8). Each red has a fresh inflow segment, separated by 60 s of green with the pack removed (or a pull-away as in S7) so the reds are statistically independent.
- **Compute.** At most 3 cores. Raw fields go to `scratchpad/sim/run`. Kept tables and figures go to `research/simulation`. Record the wall time of every case.
- **If true LES is not affordable,** a cheaper method (RANS plus a Lagrangian stochastic model, or a meandering-plume fluctuation model) may be used. Every 1-s and 10-s statistic from it must then be labelled "modelled fluctuation, not resolved", and acceptance check A5(c) becomes mandatory.

---

## 3. Scenario matrix (in priority order: run from the top; stop where time runs out)

Likelihood statements use only the inputs:

- kerb wind lognormal P5 / P50 / P95 = 0.3 / 0.8 / 2.0 m/s. This gives P(U < 0.3) ≈ 4 %, P(U < 0.5) ≈ 21 %, P(U < 0.8) ≈ 50 % of reds.
- uniform direction: within ±45° of "from the pack" 25 %, within ±22.5° 12.5 %.
- queue: average red at the busiest IOT junction about 3 scooters; normal peak about 8–10 within 10 m; oversaturated peak about 27, up to about 100 over 4 lanes (inputs-scene-and-references findings 14 and 17; lan-chang-2015).
- emitters, per scooter: ≥ 3 % CO 4.4 %, ≥ 5 % 1.0 %, two-strokes 1–3 %.

Products of these shares assume independence, which is not verified: calm hours and peak hours may correlate.

| Pri | id | Scooters | Geometry | Wind (U at 1.5 m) | Emitters | Why it is there | How often such a red occurs |
|---|---|---|---|---|---|---|---|
| 1 | **NF1** single-scooter near field | 1 + seated rider | Flat open ground, with and without a 0.15 m kerb 0.3 m to the right | Still (thermal only), 0.3 m/s, 1.0 m/s; from behind and from the side; 30 s per sub-run. Exit temperature 100 / 250 / 350 °C and angle 0° / 20° at 0.3 m/s | Unit tracer | Dilution versus distance and height in the first 4 m; whether the plume reaches 0.6–1.5 m; checks against the still-air plume law and the Gaussian (A5). Cheap, and calibrates everything else | Building block, not a red light. Being within 1 m of one tailpipe happens at most kerb-lane queues |
| 2 | **S1** baseline dozen | 12: 8 in box (2 rows × 4 from the kerb), 4 in the kerb lane behind | 20 m street, 12 m buildings both sides (H/W 0.6), 4 m pavement, no arcade | 0.8 m/s, 45° oblique from the pack toward the kerb | Fleet draws (post-processed) | Ties to the published dozen scenario. Gives heights, distances and 1-s peaks under ordinary conditions. Reference for G, S4 and S10 | Dozen queue: normal peak at a busy arterial. U ≤ 0.8 in 50 % of reds; from-pack sector 25 %; so about 1 in 8 peak-hour reds at such junctions |
| 3 | **A** Kaohsiung anchor | 34 (16 box + 18 overflow, 2 lanes) | Mingcheng 1st / Minzu 1st: crosswalk set back so the turn-box end is 8 m from the crosswalk front; 30 m road; open-ish (iot-113-tb006) | Site distribution 1.6 m/s (0.9–2.8); 8 reds with directions drawn uniformly | Fleet draws | Acceptance check A2 against the only Taiwanese kerb measurement | The observed site: about 34 scooters per red at peak |
| 4 | **G** grid repeat | as S1 | as S1 | as S1 | as S1 | Acceptance check A3 | — |
| 5 | **S2** calm full box | 30: 16 in box (2 × 8), 14 in the kerb lane (2 columns × 7) | as S1 | 0.3 m/s mean, direction wandering ±60° over 90 s (synthetic large-eddy meander); from the pack sector on average | Fleet draws | Realistic open-street worst case for a waiting pedestrian | Full box: oversaturated peaks at the busiest scooter arterials. U < 0.3 in about 4 % of reds; from-pack sector 25 %; about 1 % of peak reds at such junctions |
| 6 | **S3** behind the last row, pushchair | 12 in the kerb lane (2 columns × 6) | as S1; person and pushchair block at 0.5–1 m behind the last row, between the columns and kerb-side | 0.5 m/s along the queue toward the person | Fleet draws | Highest near-field exposure that a pedestrian plausibly has (waiting to cross behind a queue, or standing at the kerb by the last row) | Standing there for a whole red is uncommon. Wind along the queue ±45° (25 %) and ≤ 0.5 m/s (21 %): about 5 % of the reds in which someone stands there |
| 7 | **S4** high-emitter neighbour | from S1, S2, S3 | — | — | Nearest-scooter tracer re-weighted to 6.5 % CO / 5,800 ppm HC, and to a two-stroke | Upper tail of the inspection data. Pure post-processing: **no new run** unless a 0.5 m/s S1 variant is affordable | Nearest kerb-side scooter ≥ 5 % CO: 1.0 % of reds; ≥ 3 %: 4.4 %; two-stroke: 1–3 %. At least one ≥ 3 % somewhere in a 12-pack: 41 % |
| 8 | **S8** stay-through, 15 min | 30 (as S2) | as S1 | 0.5 m/s from the pack sector, wandering ±45° | Fleet draws | The **only** case that gives a true 15-min mean for the WHO 15-min comparison: someone who stays (vendor, traffic police, crossing guard). 6 cycles of 150 s (90 s red + 60 s green with the pack leaving and re-forming) = 15 min | Pedestrians: almost never. People who stay at a kerb for work: daily at busy junctions; this exact wind about 5 % of such periods |
| 9 | **S5** arcade (騎樓) | 12 and 30 (S1 and S2 packs) | Building with an arcade 3.5 m deep and 3.8 m clear, 0.5 m kerb strip, pedestrians waiting in the arcade | 0.5 m/s toward the building; one calm 0.2 m/s variant if affordable; 3 cycles to see retention | Fleet draws | Does the arcade trap exhaust and lengthen exposure? Checks the bound in 1.6 (no peaks above kerb-edge peaks) | Arcades line much of Taiwan's older city-centre streets (share not quantified in our inputs). Wind toward the façade ±45°: 25 % |
| 10 | **S6** deep canyon, leeward pavement | 30 | 14 m street, 20 m buildings (H/W 1.4), pack in the lanes next to the leeward pavement | 2 m/s roof-level wind perpendicular to the street, giving street-level recirculation toward the leeward pavement | Fleet draws | Recirculation carries the pack's exhaust back to the pavement even when the "wind" seems to blow away; the estimate has no buildings | Dense central streets; roof wind within ±30° of perpendicular about 1/3 of the time. Not quantified for Taiwan |
| 11 | **S7** pull-away at green | 12 (S1) | as S1 | 0.8 m/s as S1 | Pull-away: CO × 3 (range 2–10, **ASSUMPTION**, unquantified for scooters; inputs-simulation `pullAway`) for 4 s; acceleration 1.5–2.5 m/s² (ASSUMPTION) | Spike after green, and carry-over into the next red. Reported with and without the burst | Every red ends this way. The magnitude is an assumption, so the result is labelled assumption-driven |
| 12 | **S9** few, typical | 4 | as S1 | 1.2 m/s; two directions (from the pack, crosswise) | Fleet draws | The most common red; ties to the published "few" scenario | The average red at a busy junction holds about 3. U ≥ 1 m/s in about 35 % of reds |
| 13 | **S10** wind away from the kerb | 12 (S1) | as S1 | 0.8 m/s from the kerb toward the pack | Fleet draws | Tests the estimate's ad hoc upwind "initial cloud" term and its two-reds-in-three assumption | Wind within ±45° of "from the kerb": 25 % of reds |
| 14 | **S11** enclosed: scooter underpass | 50 held in a queue | 100 m × 4.5 m × 3 m underpass; covered waiting-zone variant if affordable | Longitudinal 0.1 and 0.3 m/s; 15 min | Fleet draws | Question 5: the one street-type setting where the 15-min value could be reached (1.6). Validates the box formula C = N·E / (A·u) | Rare: needs a queue held inside an underpass for minutes. No Taiwanese measurement |

That is 12 scenario cases (NF1 and S1–S11, of which S4 is post-processing), plus the anchor A and the grid repeat G.

---

## 4. Probes (fixed now)

The heights h are above the local standing surface. The headline set is **K**. Every case reports every probe set that exists in its geometry.

| Set | Positions | Heights h (m) | Purpose |
|---|---|---|---|
| **K** (headline) | Horizontal distance **0.5, 1, 2, 4 m** from the nearest kerb-lane tailpipe, perpendicular to the kerb (y = −0.2, −0.7, −1.7, −3.7 m), at that tailpipe's x and at x ± 1 m | 0.3, **0.6, 0.7, 0.8** (pushchair), **1.1** (child), **1.5** (adult), 1.8 | Pedestrian exposure by distance and height |
| KL | Kerb line, y = −0.2 and −0.7 m, every 1 m for −12 ≤ x ≤ +3 | 0.7, 1.1, 1.5 | Spatial maximum; no cherry-picked spot |
| B | 0.5, 1, 2, 4 m behind the last-row tailpipes, on the axis of each column and midway between (S3; also S1 and S2) | as K | Behind-the-queue exposure |
| R | The estimate's receptor: y = 0, x from the back of the box to 1 m past the stop line, every 0.5 m | 0.6, 1.0, 1.5 | Like-for-like comparison with model.mjs (A4) |
| I | The IOT sensor area, in the estimate's `simulateIOT` "both" frame: 2–8 m ahead (every 2 m) and 2.5–5 m lateral (every 1.25 m) | 1.2, 1.5 | Anchor (A2) |
| AR | Inside the arcade, 1, 2, 3 m in from the front, at 3 x positions (S5) | 0.7, 1.1, 1.5 | Retention |
| V | Vertical masts at K 1 m and K 4 m, and at B 1 m | 0.15 to 3.0 every 0.15 | Vertical profile |
| SRC | 0.25 m and 0.5 m downstream of each traced tailpipe, on the exit axis | Pipe height | Near-exit dilution (sanity check of the source model) |
| F | All outflow faces and the plane y = 0 (kerb face, up to 3 m) | — | Mass balance (A1) and flux to the pavement |

---

## 5. Statistics to extract (fixed now; all of them, for every case and probe)

All values are CO increments (ppm) above background unless stated. Totals add the estimate's background draws (CO 0.15 / 0.35 / 0.9 ppm).

**Per probe, per red:**

1. 90-s mean.
2. Highest 10-s running mean.
3. Highest 1-s mean.
4. Seconds (1-s means) above 1, 9, 30, 87, 200 and 420 ppm.
5. The 1-s series itself, kept for figures.

**Dilution:**

6. D_pack = (flux-weighted raw CO of the pack) / C, for the 90-s mean and for the highest 1-s value.
7. D_nearest = raw CO of the nearest scooter / C from its own tracer.

**Vertical profile:**

8. C(h) / C(1.5 m) for every K and B height, and the full V mast profiles (90-s mean and highest 10-s).

**Averaging conversions (stated next to every comparison; a number is never compared with a reference of a different averaging time):**

9. One red's contribution to a 15-min mean = 90-s mean / 10. Its contribution to a 1-h mean = 90-s mean / 40.
10. A true 15-min mean (S8) and 1-h projection only from multi-cycle runs (S8, S11).

**Fair references, used only as below (inputs-simulation `references`):**

| Pollutant | Reference | Compared with |
|---|---|---|
| CO | WHO 15-min 87 ppm | Item 10, or item 9 |
| CO | WHO 1-h 31 ppm (35 mg/m³) and Taiwan 1-h 31 ppm | 1-h values |
| CO | AEGL-2 10-min 420 ppm, labelled emergency; NIOSH ceiling 200 ppm, labelled occupational | Highest 10-s and 1-s values, said in words |

**Benzene and THC.** These are post-processed from the tracers with the per-scooter THC and benzene draws. Report the same statistics 1–8 in ppb (benzene) and ppmC (THC). Benzene is compared with:

- OEHHA 1-h 8.5 ppb, after the /40 conversion. Its averaging time is flagged: the value was derived with a 6-h basis.
- the NIOSH short-term limit of 1 ppm, 15-min, labelled occupational.

THC is compared with petrol-vapour odour detection 0.47–0.58 ppm (api-1995-odour), labelled as vapour and not as exhaust.

**Odour.** OU(t) = Σ over tracer groups of C_g(t) / C_raw,g × D/T_g. This is computed with D/T_raw = 800 and with 6,800 (two separate columns, never averaged). HC-rich scooters get ×10 (ASSUMPTION; a ×1 sensitivity column is also reported).

Report the fraction of the 90 s with OU ≥ 1 (detectable), ≥ 5 and ≥ 30 (levels for "distinct" and "strong", ASSUMPTION), and the highest 1-s OU.

**Aggregation (fixed).**

- Within a case: distribution over reds × 1,000 emission draws.
- Reported as P5 / P50 / P95 of each statistic, plus the minimum and maximum over reds at the emission median.
- The **headline per case** is P50 and P95 of statistics 1–3 at **K, all four distances, heights 0.7, 1.1 and 1.5 m**.
- The highest value over all probes is reported **separately**, labelled "highest single probe". It is never the headline.

**Probability of exceeding a reference** = P(case conditions) from §3 × P(exceed | case) from the draws. It is stated with its basis, and labelled as a product of assumed-independent shares.

**Nothing is dropped.** Every case run, every probe set and every statistic above goes into the result table, whether the number is large or small. A case that fails acceptance is reported with its failure, not omitted.

---

## 6. Acceptance checks (all must be reported; numbers are believed only after the relevant checks pass)

| # | Check | Pass criterion | If it fails |
|---|---|---|---|
| A1 | **Mass balance** | Over each red after the first: tracer out through F faces + change in domain inventory = emitted, within ±3 %. No negative concentrations below −0.1 % of the local maximum. No probe value above the raw tailpipe concentration | Fix the numerics. No numbers from that case |
| A2 | **Kaohsiung anchor** (case A). Sensor model: first-order response τ = 30 s (ASSUMPTION for an electrochemical cell), then 1-min means at the I probes | (a) The median red's highest 1-min increment ≤ 1.2 ppm, because a typical peak red cannot exceed the observed 48-h maximum of 0.8–1.2 ppm (iot-113-tb006). (b) The highest 1-min increment over the 8 reds lies within 0.3–3 ppm, a factor of about 3 around the observation | (a) fails: the simulation over-predicts at 2–8 m, and every result carries the ratio as a stated bias. (b) fails low: it under-predicts; same treatment. Either way, report it, do not tune |
| A3 | **Grid sensitivity** (case G against S1) | Change in the K, B and R statistics: 90-s means at ≥ 1 m ≤ 20 %; highest 10-s ≤ 30 %; highest 1-s ≤ 50 %; 0.5 m probes ≥ 5 cells from any solid or source | 1-s and 10-s peaks are reported as "grid-limited; true peaks probably higher", as lower bounds. 90-s means outside 20 %: refine further before reporting |
| A4 | **Agreement with the published model at 2–8 m**, where it was validated | Run `estimate()` with the case's N, nearest distance, fixed wind speed and the case's direction sector (`windFrom: 'pack'` or a matching override). Simulated P50 90-s means at R and K probes 2–8 m from the nearest pipe: within ×3 of the estimate's median and inside its P5–P95 for S1, S2, S9 and S10 | Explain the cause (meander, initial spread, buildings, direction persistence). The difference is a finding, not a reason to adjust either model |
| A5 | **Analytical checks** (NF1) | (a) Still-air plume: centreline dilution 0.3–1.2 m above the pipe within ×2 of the point-plume values in §1.4. (b) Uniform wind, no buildings, 2–8 m: time-mean within ×2 of the Gaussian with the simulated σ_y and σ_z. (c) Only if LES is replaced by a cheaper method: its peak-to-mean ratios at 1–4 m within ×2 of an LES sub-run of NF1 | Fix the source model or resolution before running the pack cases |
| A6 | **Inflow turbulence** | At 1.5 m upstream of the pack: mean U within ±10 % of the target, σ_v/U and σ_w/U within the estimate's ranges, or floors met at U ≤ 0.5 | Retune the inflow generator *before* running pack cases (never afterwards against results) |
| A7 | **Statistical convergence** | Bootstrap 90 % CI of the P50 90-s mean at K 1 m and 1.1 m narrower than ±30 % | Add reds, or report the CI alongside |
| A8 | **Time and space numerics** | Courant ≤ 1 in the near field; bounded scalar scheme; spin-up sufficient (domain-mean tracer steady within 5 % over the last 20 s of each red in steady cases) | Fix the numerics; no numbers from that case |

**The order of belief.** A1, A5, A6 and A8 gate everything. A2 and A4 gate any statement at 2–8 m and any claim that the simulation "agrees with reality". A3 gates every 1-s and 10-s peak.

---

## 7. What the bounds already say (for the people who will read the results)

The simulation will report its own numbers, but these limits are fixed by conservation of mass, whatever it finds.

- **Smell.** A strong exhaust smell beside a big idling pack is what the physics predicts: seconds-long plume hits at a few to tens of odour units. It is consistent with the owner's experience. It does not require CO near any CO guideline.
- **Brief CO hits.** Hits of tens to a few hundred ppm for seconds are physically plausible at 0.3–0.8 m height within about 0.5–2 m of a tailpipe. That reaches further for a high emitter (1 % of nearest scooters) and covers the pushchair zone beside and behind a kerb-lane queue. Their contribution to a 15-min mean is level × seconds / 900.
- **90-s means.** In the realistic worst open-street corner (calm wind held from the pack, kerb-hugging queue, pushchair height) the envelope is about 5–30 ppm. That is 10–30 times the published central range, and it is a 90-s value.
- **15-min mean at an open kerb.** 87 ppm is not physically plausible for a pedestrian: about 10–30 times short even standing through every red. 1-h 30 ppm is short by a similar factor.
- **Enclosures.** Where 87 ppm over 15 min is possible are enclosures with sources inside:
  - a queue held in a poorly ventilated scooter underpass;
  - enclosed car parks (measured);
  - scooters idling inside an arcade or covered waiting zone.

  These are named as such, with their rarity.

## 8. Limits of this plan

- Emission inputs are the estimate's. Idle fuel flow is still the dominant uncertainty, ×2.5 (estimate §7).
- Exit temperature, pipe diameter and exit angle are assumptions. NF1 tests their effect.
- The pull-away burst magnitude is an assumption, so S7 is labelled assumption-driven.
- The odour D/T values come from 1967–70 car-engine panels, read in abstracts. The HC scaling is an assumption.
- The kerb-wind distribution is an assumption derived from station means. No Taiwanese pedestrian-level wind measurement exists in our inputs.
- Likelihoods multiply shares assumed independent.
- No measurement of concentration 0.3–3 m from an idling scooter exists. The near field is checked against analytical limits (A5), not against data.

## 9. Amendments

Any change after the first simulation result exists is logged here, with date, reason and the cases it applies to.

**2026-11-27, simulation build (logged before the first S1 result was read; applies to every case run with `run-scenario.sh`).**

1. *Resolution.* All pack cases use the `fast` grade (5 cm cells at kerb-lane tailpipes, 10 cm round the headline scooter, its K probes to 2 m and behind the last row, 20 cm over the pack). §2's 2.5 cm / 5 cm spec costs about 47 h per 90 s for 12 scooters on 3 cores (cfd-template README). Consequence: acceptance A3 cannot be run as written (G = fine grade). It is replaced for now by **G0**, the same case one level *coarser*; the fine G stays registered. Until G passes, every 1-s and 10-s value is labelled "grid-limited".
2. *Spin-up 30 s*, not 60 s, starting from the mean wind everywhere (calm cases: from rest); tracers start at the end of the spin-up, so the red is counted from the moment all scooters are idling (the "whole pack present at onset" corner of §1.5). A8's steadiness test reports whether 30 s was enough.
3. *One red per run*, not five. A7 (bootstrap over reds) cannot be computed from one red; it is reported as not met. More reds = more runs, restarting from the spun-up flow.
4. *Kerb 0.2 m* (castellated grid), not 0.15 m; heights are above the 0.2 m pavement.
5. *Inflow.* Uniform with height, not a log profile. **Inflow turbulence (A6) failed twice before any red was analysed, and the inflow was changed before the run that is reported:**
   - Try 1 (DFSEM, σ 0.3/0.15 m/s, L 0.8 m): σ_v/U about 0.02 and σ_w/U about 0.001 at the IN probes.
   - Try 2 (DFSEM, σ 0.36/0.22 m/s, L 2 m, 0.4 m cells all the way from the inlet): the same. The inlet face values stayed exactly at the mean (checked in the written field and on a 3-s test box with constant and with mapped inputs). In OpenFOAM v2506 with these settings DFSEM produced no fluctuation at all, so the scout's smoke tests had no inflow turbulence either.
   - Reported runs: a spatially uniform, time-varying inflow vector on every inlet face, an Ornstein-Uhlenbeck series per wind-frame component (σ_h 0.45 U and σ_w 0.27 U, floors 0.2 / 0.1 m/s; integral time scales 5 s horizontal and 1.5 s vertical, ASSUMPTION; fixed seed). This represents gusts and wind-direction wander larger than the domain; smaller eddies are generated inside the domain by the buildings, scooters, riders and people. A6 is checked at the IN probes.
   - Try 2 also showed that the 12 m canyon slows the near-ground wind: 0.60 m/s mean at the IN 1.5 m probe for 0.8 m/s inflow. The inflow speed is therefore 1.33 × the target (S1, G0, G, S10), so that the target 0.8 m/s holds 1.5 m upstream of the pack (A6 mean criterion). The canyon also turns the near-ground wind toward the street axis; the direction reached is reported, not forced.
   - Try 1 of G0 was used to test `stats.py` on a 10-s partial window (sub-ppm K values were printed); those numbers are discarded and no setting was changed because of them. Tries 1-2 are kept in `scratchpad/sim/run/*_try*`.
6. *S1 wind 0.8 m/s* as pre-registered. (The task text for the build step said "baseline dozen at 1 m/s"; the pre-registered value was kept.)
7. *Emission groups.* Tracers: headline scooter (nearest kerb-lane tailpipe) alone; rest of the kerb-lane column; box row 1; box row 2 (and the second queue column when present). Within a group, a draw's mean emission is applied. The headline scooter is exact.
8. *Species from tracers* use the emission mass rates of `model.mjs` `drawScooter` (CO, THC, benzene in mg/s), converted with the CFD exhaust mass flow (5.5e-4 kg/s): mole fraction = s × E/ṁ × M_air/M_X. Whole-exhaust dilution and odour scale the exhaust fraction by fuel flow / 120 g/h. This is equivalent to §5's "raw mole fraction" route but uses the estimate's own emission rates directly.
9. *Not yet implemented* (registered in `scenarios.json` with this status): A (Kaohsiung geometry and I probes), S3 (queue-only layout with pushchair), S7 (moving sources), S8 (pack leaving and re-forming), S11 (underpass), S2's wandering wind direction. A2 therefore cannot be tested yet.
11. *Time step:* maxCo raised from 0.8 to 0.95 (S1 at t = 5 s of its spin-up, before any tracer was released; G0 likewise). The S1 step was Courant-limited at about 0.03 s by the engine-heat updraft in the 5 cm cells; A8 still requires Courant <= 1.
12. *Probe positions* are moved 1.3 mm off the round-number planes, so no probe sits on a cell face (try 1 had probes on faces).
13. *Tailpipe patches of scooters away from the kerb-lane column* are 10 cm (was 20 cm), and every scooter body now starts above its muffler on its own grid: in try 1 the body block covered part of the 20 cm patches, so those groups emitted 10-17 % less than specified. `stats.py` still divides each tracer group by its actually emitted tracer, so any remaining shortfall does not bias concentrations.
14. *Fixed-value tailpipe tracer* also enters by diffusion where the patch velocity is low (0.02 m/s on the old 20 cm patches). A1 is reported with the advective emission only, so this diffusive inflow shows up as a negative balance error, an upper bound on any numerical loss or gain.
10. *Extra probe set IN* (for A6): 1.5 m and 6 m upstream of the pack's most upwind corner, at 0.7 / 1.5 / 3.0 m.
15. *First run that counts (S1 try 3, G0 try 3), as it went.* Both solvers were stopped by the 2-hour limit on background jobs, S1 at t = 64 s (34 s of the 90-s red) and G0 at t = 76 s (46 s). Following the job rules they were not restarted; `run-scenario.sh S1 --resume` continues from the last write (every 2 s). All S1 statistics are therefore over 34 s, not 90 s, and are labelled so. The S1 time step fell to 0.01-0.02 s (Courant-limited by a 3 m/s updraft between a muffler and the kerb face, from the 1 kW engine-heat source).
16. *A6 result for try 3:* mean speed at IN 1.5 m upstream, 1.5 m high = 1.18 m/s (target 0.8; the 1.33 inflow factor, set from try 2's flat inflow, overshot); direction -8° (the canyon turns the wind along the street; the inflow was -45°); σ_v/U 0.19-0.25 and σ_w/U 0.09-0.14. A6 fails on all three. The run is a build proof and its numbers are not admissible results under §6 until A6 passes. Next inflow: factor about 0.9 and a generator with vertical structure (or upstream roughness such as parked vehicles).


**2026-11-27, scenario-matrix run (logged before any matrix result was read; applies to every matrix case).**

17. *Inflow (A6 fix, PLAN 9.16).* New generator 'rfm': (i) large-scale gusts and wander, spatially uniform, a sum of 40 cosines per wind-frame component with a Lorentzian spectrum (exponential correlation, T_h 5 s, T_w 1.5 s; σ_h 0.45 U, σ_wL 0.10 U, floor σ_h 0.2 m/s); plus (ii) small-scale eddies with vertical structure: 150 divergence-free random Fourier modes, von Kármán spectrum (L 2 m, ASSUMPTION), wavelengths 1.6-12 m, frozen and convected with the mean wind, isotropic with σ_s 0.30 U per component (floor 0.1 m/s). Fixed seed 20261127. Because OpenFOAM refuses coded boundary conditions when run as root (and its security setting was not changed), the field is precomputed as `timeVaryingMappedFixedValue` boundary data (0.4 m point grid, every 0.2 s, linear interpolation). Inflow factor 0.9 for the canyon cases (try 3: 1.33 gave 1.18 m/s at the IN probe), 1.0 in open-street cases. The amplitudes were set once before any run; A6 is checked on each case's IN probes and reported, pass or fail; no case is rerun or rescaled because of a result.
18. *Grid for the matrix: 'coarse' grade with lean extents.* Cost measured on this machine: 1.1 s per step for 215k cells on 3 cores, and the engine-heat updraft limits the step to about 0.03 s at 10 cm (0.016 s at 5 cm), so a full red at the fast grade costs about 2-3 h and the matrix could not be run in the ~5 h budget. All matrix cases therefore use 10 cm tailpipe cells on 0.2 m muffler faces, 10 cm kerb-lane bodies, 20 cm over the pack and round the probes, 0.4 m cells only to 4 m height and 6 m beyond the pack, 0.2 m cells to 2.2 m height, 2 buffer layers between levels (S1: 154k cells). The cell sizes at sources and probes equal G0-try3's. The grid look is the S1-try3 (fast) versus G0-try3 (coarse) matched-window comparison (coarse/fast 0.33-2.45 for window means at K, 0.29-3.2 for highest 1 s): every matrix 1-s and 10-s value is labelled grid-limited, and the 0.5-1 m values carry that factor as a stated uncertainty in either direction.
19. *Case list for the matrix (in run order):* S1 (baseline dozen, canyon, 0.8 m/s -45°), A (Kaohsiung anchor: 34 scooters, open road, site-median 1.6 m/s from the pack toward the sensor area, one red; I probes; sensor τ 30 s), S2 (calm full box, 0.3 m/s, fixed direction), S5-12 (arcade, 0.5 m/s straight from the pack toward the building), NF1-calm (single scooter, still air), S1-from (new: S1 pack, open street, 0.8 m/s straight from the pack toward the kerb), S4 (post-processing: nearestHigh of S1, S2 and S5-12). Spin-up 30 s (NF1-calm 10 s), one 90-s red each. Not run: S3, S6-S11 and the fine grid G (cost; S3/S7/S8/S11 also not implemented).
20. *A6 during the S1 matrix run (read at t = 26-42 s, before the red statistics were computed).* With the rfm inflow the turbulence reaches the IN probes after about 18 s (the probe is about 9 m down the canyon from the inlet). Over 26-42 s at IN 1.5 m upstream, 1.5 m high: mean 0.48 m/s (target 0.8; fails), direction 10° (along the street), σ_v/U 0.26, σ_w/U 0.57 (absolute 0.13 and 0.28 m/s). S1 was not rerun (about 50 min, outside the budget); it is reported as a case with about 0.5 m/s near-ground wind mostly along the street, A6 failed on the mean. For S2 (not yet run) the canyon inflow factor is retuned to 1.45 (= 0.9 × 0.8 / 0.5) so that its near-ground mean approaches its 0.3 m/s target. No other input changed.
21. *Arcade grid (S5).* At the coarse grade the arcade roof and its 0.4 m columns are meshed at 20 cm, not 10 cm (365k -> 179k cells). Mesh sizes of A, S2 and S5-12: 255k, 226k, 179k cells.
22. *Budget cuts during the matrix (06:30, after S1 and before any A, S2 or S5 statistic existed).* Case A runs at dt about 0.019 s (gusty 1.6 m/s inflow in 10 cm cells) and, with other jobs loading the machine, at about 0.012 simulated s per wall s: a full red would take about 2.8 h. Therefore: A ends at t = 60 s (30 s spin-up + 30 s of red; first set to 70 s, cut to 60 s at 06:35 when its speed was measured, before any A statistic; its statistic is the highest 1-min of a τ = 30 s sensor, so about 1 min of red is the minimum; this is reported as a partial red). S2 uses 20 s spin-up and the full 90-s red; S5-12 uses 20 s spin-up and a 60-s red. NF1-calm and S1-from are dropped (S2 at 0.3 m/s is the near-calm case; S5-12 has the wind straight from the pack toward the kerb and arcade). G (grid repeat) is not rerun: the grid look is S1-try3 (fast) versus G0-try3 (coarse), matched window 30-64 s.
23. *S1-from reinstated (09:06)* because S2 and S5-12 ran faster than estimated (dt stayed at its 0.05 s cap in light wind); 20 s spin-up, full 90-s red. NF1-calm stays dropped.

**2026-11-27, signed-report step (logged after the matrix results and the three verification reports were read, and before any of the runs below produced a number; applies to the cases named).**

24. *Corrections after verification.* Three verifiers (physics, reality, comparisons) reported blockers and should-fix items; each was re-checked from the case files (`corrections/confirm_findings.py`, output `corrections/confirm_findings.txt`). Actions:
   - *Arcade S5-12 (blocker: 15.2 m domain top above a 12 m building spanning the whole domain length, 79 % blockage).* Rerun as **S5-12b**: same scene, domain top 60.8 m (>= 5H; 19 uniform 0.8 m layers to 15.2 m, then 20 layers stretched x5), 30 s spin-up and a full 90-s red, 2 MPI ranks. Inflow amplitudes, wind target and direction unchanged; no setting depends on a result. S5-12 and S4-S5-12 are kept on file but labelled "domain-blockage-affected, not admissible"; S5-12b replaces them whatever it gives.
   - *Near-field grid (should-fix: 1-s and 10-s values within 1 m filtered by the 10 cm source / 20 cm probe cells).* Single-scooter pair **NF1-fine** (2.5 cm tailpipe patch, 5 cm cells to the K 1 m probes) and **NF1-coarse** (matrix grade), 0.3 m/s from the scooter toward the kerb (PLAN NF1-u03-side), 20 s spin-up + 30 s. Their ratio is reported as the grid factor on near-field means and peaks; it is not applied as a correction to any case. **NF1-coarse-0kW** (no engine heat) tests the 1 kW engine-heat assumption.
   - *Canyon cases S1, S2 (blocker: the end-fed fixed-velocity inlet forces 0.6-1.3 m/s along the kerb while the IN probe reads 0.33-0.48).* Not rerun (a periodic or precursor-fed canyon is not implemented and was not affordable in this step). Their kerb values are re-labelled by the wind measured at the receptors, the words "calm" and "main surprise" are withdrawn, and their range is widened upward by x5 (concentration ~ 1/u along the kerb, plus an untested canyon vortex branch).
   - *Case A / A2 (blocker: one 30-s red at the favourable direction compared with a 48-h maximum).* Not rerun (a full red costs about 2.8 h). A2 is reported as untested ("not contradicted, not reproduced").
   - *Reporting fixes with no new run:* nearest-scooter share beside every K headline; true highest-probe values and the true window (/15 for 60-s, /30 for 30-s reds); stay-through 15-min and 1-h values with a fresh emission draw for every red (`stay_through.py`), for CO and benzene, against WHO/Taiwan 1-h and OEHHA 1-h as well as WHO 15-min; odour shares >= 5 and >= 30 OU carried into the results; THC-vapour wording; S1-from labelled "wind held from the pack for the whole red"; condition probabilities stated as products and as upper bounds; figures redrawn so that only converted values meet the WHO lines.
25. *As the item-24 runs went (logged after they finished).* S5-12b ran its full red (mesh 34 s + solve 3,584 s on 2 cores). NF1-fine was started serially, stopped at t = 20.9 s once S5-12b had freed cores, and resumed on 2 cores from the t = 20 s write (`cfd/run.sh` did not decompose a serial case for a parallel resume; fixed); its 30-s window (20-50 s) is complete. NF1-coarse and NF1-coarse-0kW ran serially (about 15 min each). No setting of any case was changed after any of its results was read. The near-field result changed the signed answer in one place: the fine grid shows a coherent single-tailpipe plume at 0.6-0.8 m whose 15-minute stay-through mean, 0.5 m downwind in held near-calm air, exceeds 87 ppm in 10-22 % of periods; it is reported as found, with its low-turbulence caveat (A6: σ_w 0.031 m/s).
