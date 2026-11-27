# What is in the air when you can smell the fumes: method and result

ESTIMATE (推估), 2026-11-27. Not a measurement. Signed after three sceptic reviews; every correction is in
`corrections.md`. Plan fixed before computing: `PLAN-SMELL.md` (committed first). Numbers: `results-smell.json`
(every number with low / central / high, case, probe, condition, how often, number of draws, confidence) and the
readable `results-smell.txt`. Code: `smell_chemicals.py`. Shares: `speciation.json`. Owner summary:
`ANSWER-SMELL.md`. Site wording: `statements-smell.json`.

## 1. Short answer

**When the smell can be detected.** If what you smell is the exhaust of the idling scooters beside you, the same
air also holds the other chemicals of that exhaust. The ones estimated here are listed in order of their share of
the exhaust, not by harm:
- toluene and the xylenes;
- benzene and ethylbenzene;
- 1,3-butadiene, n-hexane and formaldehyde;
- acetaldehyde, naphthalene, styrene and acrolein;
- hydrogen cyanide.

**Hazard labels, not risks.** IARC labels benzene, 1,3-butadiene and formaldehyde Group 1 ("causes cancer in
humans"), styrene and acrolein 2A, and ethylbenzene, acetaldehyde and naphthalene 2B. Petrol-engine exhaust as a
whole is Group 2B ("possibly causes cancer"). These labels say how strong the evidence is that a substance can
cause cancer. They do not give a risk from any one exposure, and no risk is computed here.

**This statement is conditional, and true by construction in the model.** Odour and chemicals come from the same
simulated exhaust fraction. It does not hold if the smell comes from something else. It also does not hold if
smell does not follow exhaust volume: Fiala found that odour did not track HC or CO. **No smell does not mean clean
air.** In the canyon case S1, benzene is present over the red even when no second is smellable. Carbon monoxide
has no smell, and particles are too small to see.

**At the moment the smell is just detectable** (one ordinary scooter, exactly 1 odour unit):
- Benzene is typically **1.7 ppb with the 6,800-fold threshold, or 15 ppb with the 800-fold one**. The range is
  0.4-58 ppb (P5 at 6,800 to P95 at 800). This is a typical value, not a minimum.
- Formaldehyde is 1.5 / 13 ppb and 1,3-butadiene 1.3 / 11 ppb.
- The value does not depend on the flow. The two old odour thresholds are 8.5 times apart, and that gap is the
  largest single uncertainty.

**In the seconds you can smell it, at the kerb 0.5-1 m from the nearest idling scooter of a pack:**
- Wind blowing from the pack, held for the red (S1-from; at most about 1 in 8 peak-hour reds):
  - smellable in 76 % of the red's seconds with the 800-fold threshold (range 0-97 %), and in 97 % with the
    6,800-fold one (range 83-99 %);
  - benzene over those seconds, at child height 0.7 m, 0.5 m away: 33 ppb (800-fold) and 27 ppb (6,800-fold);
    range 2.1-360 ppb.
- Over the four pack cases (S1, S1-from, A, S5-12b), the benzene centrals run from 4.3 to 50 ppb, lows 0.8-16 ppb,
  highs 41-380 ppb. That the cases nearly agree comes from the smell condition, not from the streets (section 5).
  What changes with the street and wind is how often the smell is there. In the canyon case S1, with the 800-fold
  threshold, most reds have no smellable second at 0.5 m / 0.7 m: only 137 of 1,000 draws have any.

**No seconds-long value has a reference value of matching averaging time.** Only 30-min and 1-h averages are
compared (section d):
- **One red light on its own** brings no chemical to its 30-min or 1-h value at the central estimate, in any
  case.
- **Someone who stays at the kerb through every red for an hour**, with the wind held from the scooters
  (S1-from, or the arcade S5-12b):
  - benzene is above California's 1-hour reference level (signed report; reproduced);
  - every other chemical is below its value at the central estimate, except acrolein (detail table only: car
    data only, very low confidence, range assumed);
  - hydrogen cyanide is far below its 1-hour value (340 ug/m3) even in the worst case.
- Rare cases appear only in the detail tables: NF1-fine (near-calm air, 0.5 m from one tailpipe, about 1 % of
  reds or fewer, likely to read high).

**What you actually smell is probably not benzene.**
- Benzene's own odour threshold is 2,700 ppb. The smellable-seconds benzene reaches it in no pack draw, and in at
  most 0.5 % of draws in NF1-fine.
- Among the chemicals with a known threshold, acetaldehyde is the clearest candidate. With the 1.5 ppb detection
  threshold, it is above it in 61-100 % of draws, in every case and with both exhaust thresholds. With the 560 ppb
  "distinct awareness" level, it is above it in 0 % of pack draws.
- Xylenes, formaldehyde, styrene and acrolein are above their LOWER published thresholds in a share of draws that
  depends strongly on the case and the threshold. Above their HIGHER thresholds they are much less often: in pack
  cases formaldehyde (500 ppb) in 0 % of draws, xylenes (o-xylene, 380 ppb) in at most 10 %, and styrene (35 ppb)
  in at most 21 %. Acrolein has only one threshold. The per-case table is in `results-smell.txt`, section e.
- These thresholds are order-of-magnitude values. **The smell comes with benzene; it is not benzene.** The
  candidates are combustion products (aldehydes), not unburnt petrol vapour, which was not modelled.

## 2. Inputs

| input | value | source |
|---|---|---|
| Flow | unit-tracer probe series of S1, S1-from, A, S5-12b and NF1-fine (admissible in `results-simulation.json`), read-only from the raw cases. 1-s means and tracer normalisation as in `stats.py`. | signed simulation |
| Emissions | the same 1,000 draws per case as the signed report (`draws.mjs`, seed 20261127, fleet mode): CO, THC (CH1.85), benzene, fuel flow, HC-rich flag per tracer group | `research/estimate/model.mjs` |
| Odour | OU = exhaust fraction x D/T, HC-rich scooters x 10 (signed `OU_hc10`). D/T 800 (Fiala 1967) and 6,800 (BIL-32 1970) are kept apart. | signed simulation; abstracts of car-engine studies |
| Chemical shares | `speciation.json`: mass % of THC (HCN: % of CO), triangular low / central / high | `sources-fuel-chemicals.json`, `sources-combustion-toxics.json`, re-checked in `verify-sources.md` |
| Odour thresholds, reference values, hazard labels | Nagata 2003; US EPA AEGL distinct-awareness level (acetaldehyde); WHO 2000/2010; OEHHA acute RELs (CARB table 2025-09-25, including HCN 340 ug/m3); Taiwan indoor standard; IARC | `sources-yardsticks.json`; CARB table re-opened at sign-off |

Shares used (low / central / high, % of THC mass), in order of central share. "Stockwell" means start-up plus idle,
one canister on one very rich carburetted bike (MCE 0.60), Nepal, no catalyst.

| chemical | share | measured on | confidence |
|---|---|---|---|
| toluene | 1.1 / 10 / 23 | idle: Taiwan engine (Yao, 1.66-3.4 %), India 14 bikes warm idle (Kumar), Stockwell. Low = 1.66 / 1.5 | low-moderate |
| xylenes | 2.4 / 10 / 18 | idle: Kumar, Stockwell. High coupled with styrene (one Kumar peak) | low-moderate |
| ethylbenzene | 1.4 / 3 / 5.6 | idle: Kumar, Stockwell; low end from US cars | low-moderate |
| benzene | 1.2 / 2.7 / 5 (signed; two-strokes 1-3, an assumption) | idle: Yao, Kumar, Stockwell | moderate |
| benzene, researcher range (sensitivity) | 1.5 / 3 / 7 | same | moderate |
| 1,3-butadiene | 0.12 / 1.25 / 3.5 | idle: Yao, Stockwell (sets the high end); low end from an EU car | low |
| n-hexane | 0.09 / 1.2 / 3.1 | idle: Kumar, Stockwell | low-moderate |
| formaldehyde | 0.1 / 0.85 / 2.1 | idle: Yao 0.69-0.76 %; Nepal scooter about 2 % (DERIVED); below detection for 5 Nepal bikes; low end driving cycle; high end the EEA conventional car figure | low |
| acetaldehyde | 0.13 / 0.55 / 1.4 | idle: Yao; Stockwell sets the high end; low end driving cycle | low |
| naphthalene | 0.05 / 0.55 / 2 | **cars only** (MOVES, EEA Euro 5/6); limits are assumed widenings | very low |
| styrene | 0.1 / 0.3 / 3.8 | idle: Stockwell 0.22 %; Kumar high end probably o-xylene | low |
| acrolein | 0.05 / 0.17 / 0.4 | **cars only** (EEA); limits are assumed widenings | very low |
| hydrogen cyanide | 0.06 / 0.10 / 0.17 % of CO | Stockwell fleet, 10 of 11 tests | low |

**Denominators.** The Kumar and Stockwell shares are of speciated NMHC. Yao's shares are of THC from an analyser
whose detector is not stated. The simulation's THC is a regulatory-type rate. The bias from mixing these bases has
**unknown direction**, roughly up to about 1.5 times either way. Low ends set by idle data were lowered by that
factor. High ends were not raised, because the measured aromatics total (at most 50 %) bounds them, so an upward
bias of up to 1.5 times is not carried in the ranges.

Not estimated (reasons in `speciation.json`):
- benzo[a]pyrene: particle-bound, only per-km car-derived factors and no idle THC share, no smell, no short-term
  value;
- phenol: sources disagree 100 times;
- hydrogen sulphide: no measurement was opened;
- PAH sums, nitro-PAHs and dioxins;
- sulphur compounds;
- minor ketones and aldehydes;
- any share for a modern fuel-injected, catalysed Taiwanese scooter.

## 3. Method

For each case, probe (K, in line with the nearest tailpipe, 0.5 and 1.0 m from it, heights 0.7 / 1.1 / 1.5 m,
plus 0.6 m for NF1-fine), draw d and second t:

- level of X (ppb) = sum over g of s_g(t) x THC_g,d / mdot x f_X,d x M_air / M_X x 1e9.
  - s_g is the normalised unit tracer of group g. THC_g,d is the draw's THC emission. mdot = 0.00055 kg/s.
  - f_X,d is one triangular draw per emission draw, for all groups, independent between chemicals.
  - Benzene uses the draw's own benzene (the signed benzene). HCN uses CO_g,d instead of THC.
- OU(t) = sum over g of s_g(t) x F_hc10,g,d / 120 g/h x D/T. A second is smellable when OU >= 1.
- **Ranges (changed at sign-off, corrections A1).**
  - For (a) the share of smellable seconds and (b) the levels in smellable seconds, the case's flow factor and the
    grid factor 3 / 3 are combined in log-quadrature, giving S1 3.0 / 7.0, S1-from, A and S5-12b 3.7 / 3.7, and
    NF1-fine 4.7 / 3.7.
  - That factor is applied to the dilution BEFORE the smell test: low = P5 with the exhaust fraction divided by
    F_lo, central = P50 as simulated, high = P95 with it multiplied by F_hi. Flow uncertainty therefore moves how
    often it is smellable, and the levels never drop below the just-smellable level.
  - "n.s." means that no draw is smellable at that flow bound.
- (c) The just-smellable level comes from 10,000 single scooters (`draws.mjs` on the one-tailpipe NF1 case):
  X at OU = 1 = 120 g/h / (F x D/T x w) x E_X / mdot x M_air / M_X, with w = 10 for HC-rich scooters. Emission and
  share spread only.
- (d) One red adds red-mean x W / T to a T-average (W = 90 s; A 30 s; NF1-fine's 30-s window counted as a 90-s
  red). The stay-through value uses a fresh draw for every red, red = 45 % and 65 % of the cycle, and nothing in
  green. Low = P5 at 45 % / F, high = P95 at 65 % x F.
- (e) For each threshold, the share of draws whose smellable-seconds mean is at or above it, reported per case and
  probe. There is no pooling across cases.
- ug/m3 = ppb x M / 24.45 (25 C). At 30 C kerb air every ug/m3 would be about 1.7 % lower. No verdict changes.

## 4. Checks

1. **Benzene reproduces the signed simulation.**
   - Red-mean and highest-second P5 / P50 / P95 match `results/<case>/stats.json` at all 34 case-probe pairs
     (largest relative difference 4.4e-16).
   - The stay-through 1-h value matches `corrections/stay_<case>.json` within 1.2 %. The resampling order
     differs, so the match cannot be exact.
   - The share of smellable seconds matches the signed `OU_hc10` exactly at its emission-only P5 / P50 / P95
     (largest absolute difference 0).
2. **Floor.** In every draw at every probe, the benzene mean over smellable seconds is at or above that draw's
   smallest benzene per odour unit across its tracer groups (share of draws 1.0000).
3. **Independent re-derivation.** The arithmetic sceptic recomputed S1-from and NF1-fine from the raw series
   without reading this code. Every central value matched: four exactly, benzene within 2 %, toluene within 6 %
   (its share is drawn independently).
4. **Mass sanity.**
   - The THC-based shares sum to at most 54 % of THC in any draw (median 35 %).
   - The single aromatics sum to at most 48 %, never above the measured aromatics total of 50 %.
   - The pack-mean benzene share is 1.7 / 2.7-2.9 / 4.2-4.4 %.
5. **Hand conversions.**
   - Formaldehyde 29 ppb x 30.03 / 24.45 = 35.6 ug/m3; the table gives 36.
   - One scooter at 120 g/h burning 0.025 g THC per g fuel gives 1.52e-3 THC by mass in raw exhaust. Benzene at
     2.7 % of that, as a mole fraction, is 15,200 ppb.
     - At the S1-from red-mean dilution of 570, that gives 27 ppb (signed P50 26).
     - At the threshold it gives 2.2 ppb (6,800) or 19 ppb (800). Table (c) has 1.7 and 15.
     - The gap has a known cause: the MEDIAN scooter's raw-exhaust benzene is 12,200 ppb (P5 2,400, P95 63,000),
       not 15,200. The THC spread is a mean-corrected lognormal, new scooters carry a 0.3-1 THC multiplier, and
       HC-rich scooters (3.4 %) have a threshold dilution 10 times larger.
   - One 90-s red at 33 ppb adds 0.83 ppb (2.6 ug/m3) to a 1-hour mean.
6. **The highest smellable second is the highest second.** The peak second is smellable whenever any second is,
   so these rows equal the signed max1s and are the same for both thresholds. They add no separate headline.

## 5. Why the level in smellable seconds hardly depends on the case

Smell and chemicals scale with the same dilution. Requiring OU >= 1 puts a floor of about the just-smellable level
(c) under every chemical. The mean over smellable seconds is that floor times the typical odour units in those
seconds. The near-agreement across cases (benzene centrals 4.3-50 ppb) is therefore produced by the condition, not
confirmed by four streets.

The rows also cover different numbers of draws. For example, at D/T 800 only 137 of 1,000 draws in S1 at 0.5 m /
0.7 m have any smellable second, and 85 of 1,000 in A at 0.5 m / 1.5 m. Those draws lean toward the higher-emitting
packs. Every level must be shown with the share of seconds, the number of draws and the case condition.

## 6. Limits

- **All shares come from carburetted or uncatalysed engines (Taiwan 2008, India, Nepal) or from cars.** For a
  modern catalysed scooter the shares, and so the levels per smellable second, are unknown. The smell may then be
  rarer, which this estimate cannot show. Daemme 2016 shows a catalyst removing most formaldehyde.
- **Two old odour figures for car exhaust** (abstracts, 8.5 times apart) define "smellable".
  - The x10 for HC-rich scooters is an assumption.
  - The threshold is where half of a lab panel detects the smell. Noticing it at a noisy crossing probably takes
    more.
  - 6,800 is the top of its study's range and 800 the bottom of its own.
- **Denominator bias of unknown direction, up to about 1.5 times** (section 2). Upward bias is not carried in the
  high ends.
- **Shares are drawn independently.** The styrene and xylene high ends rest on one peak and cannot both be true.
  Drawing them independently leans high for the pair.
- **Two-strokes** (1-3 % of scooters) get four-stroke shares, and the signed benzene share for them (1-3 %) is an
  assumption. The only two-stroke figure seen is 8.46 % (abstract only). Packs containing a two-stroke may be
  understated. HC-rich scooters are assumed to have ordinary speciation.
- **Every simulation caution carries over.**
  - Each case is one simulated red.
  - Seconds within 1 m are grid-limited (about x0.3-3).
  - The wind is held where stated.
  - NF1-fine has turbulence a third of the planned floor and reads high.
  - Confidence is low to moderate for the cases, and very low for acrolein and naphthalene.
- **The (d) stay-through values are extrapolations**: the same simulated red every time, nothing in green, and the
  wind held for an hour.
- **These are amounts added by the scooters to the air already there.** No background figure was read, so none is
  given.
- **Nothing here is a cancer risk.**
  - No unit risk was applied. A seconds-long or red-mean value is never set beside a 30-min, 1-h, annual or
    lifetime value.
  - Ethylbenzene, n-hexane and naphthalene have no public value of 1 hour or shorter, so no above/below statement
    is made for them.
  - Reference labels: Taiwan's 0.08 ppm formaldehyde value is an indoor standard for public places. The WHO
    toluene and styrene 30-min values are odour-annoyance guidelines, not health limits. Being above a California
    REL is not proof of harm. The benzene REL was derived on a 6-h basis.

## 7. Changes after the plan

1. `caseConfidence` for case A was prefixed with "low" so that the rule "lower of case and share confidence" could
   be applied. No number changed.
2. The stay-through output keeps unrounded values for the benzene check. No number changed.
3. (Sign-off) PLAN 4(c) said "at least about this much is there". That is wrong: the level is typical, not a
   floor. The text now says "typically".
4. (Sign-off) The range rule for (a) and (b) was changed: the flow-and-grid factor now goes on the dilution before
   the smell test (corrections A1). Benzene centrals are unchanged; lows rise to the just-smellable level or
   above, and the share of seconds now carries the flow uncertainty.
5. (Sign-off) Share ranges were corrected (corrections S1, S4): toluene low 1.1, xylenes 2.4 / 10 / 18, n-hexane
   low 0.09. Labels and flags were corrected for Stockwell, formaldehyde, naphthalene and acrolein.
6. (Sign-off) HCN's 1-h value (OEHHA 340 ug/m3; PLAN 5 had "none") was added to (d).
7. (Sign-off) Acetaldehyde's 560 ppb distinct-awareness level was added as its alternative threshold.
8. (Sign-off) The earlier summary's pooled "median over case-probe pairs" was not in the plan and is dropped. (e)
   is reported per case.
