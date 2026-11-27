# What is in the air when you can smell the fumes: plan (fixed before computing)

Written 2026-11-27, before any number below was computed. Everything listed here is reported whichever way it
comes out. Nothing is chosen, dropped or re-cut after seeing numbers; any change after this point is added at the
end under "Changes after the plan", with the reason, and the original text stays.

Question: in the seconds when a person beside idling scooters can smell the exhaust, which harmful chemicals are at
their nose, and about how much of each? ("When you can smell it, this is in it.")

No new flow run. The signed simulation's unit exhaust tracers (`research/simulation/`, signed 2026-11-27) are
multiplied by each chemical's share of the exhaust.

## 1. Inputs

- **Flow.** The raw probe series of the admissible cases, read-only from the machine's `sim/run/<case>/case`,
  binned to 1-s means and normalised per tracer group exactly as `stats.py` did (`bins1s`, the
  `tracer_normalisation.factor_applied` and `window_s` stored in `results/<case>/stats.json`).
- **Cases (admissible in `results-simulation.json`, fleet emitters):** S1, S1-from, A, S5-12b, NF1-fine.
  Not used: S5-12, S4-S5-12 (withdrawn); S2 and the S4 (forced high-emitter) variants are outside this plan.
- **Probes:** K at dx = 0 (in line with the nearest tailpipe), d = 0.5 m and 1.0 m from the nearest tailpipe,
  heights 0.7, 1.1 and 1.5 m. For NF1-fine the signed headline height 0.6 m is added (d = 0.5 m and 1.0 m).
- **Emission draws:** the same 1,000 draws as the signed statistics (`draws.mjs`, seed and emitter mode from
  `stats.json`), so CO, THC and benzene per draw are identical to the signed report.
- **Chemical shares:** `speciation.json` (built from the three researchers' files, section 3).

## 2. Smellable seconds

A second is **smellable** when its odour units (OU) are >= 1: OU = exhaust fraction x D/T_raw, with the HC-rich
scooters weighted x10, exactly the signed `OU_hc10` column. Both raw-exhaust dilution-to-threshold values are
kept apart throughout: **D/T 800** (Fiala 1967) and **D/T 6,800** (BIL-32 1970). The x1 weighting (`OU_hc1`) is
reported only as the share of smellable seconds (sensitivity).

## 3. Chemical shares (rules fixed now)

- One row per chemical in `speciation.json`: share basis, low / central / high, source ids, sampling, admissible
  flag with reason.
- **Basis:** mass share of exhaust THC (THC counted as CH1.85, as `model.mjs`), except hydrogen cyanide, which is
  measured only as a share of CO mass and is tied to the draw's CO.
- **Sampling:** for each emission draw d, one share per chemical from a triangular distribution with min = low,
  mode = central, max = high (the same form as the signed `benzeneFracTHC`). The share multiplies that draw's THC
  for every tracer group, so packs with HC-rich scooters carry proportionally more. Shares of different chemicals
  are drawn independently. Fixed RNG seed 20261128.
- **Benzene** is not resampled: it is the draw's own benzene (`BZ`, from `benzeneFracTHC` tri 1.2 / 2.7 / 5 % for
  four-strokes and 1-3 % for two-strokes), so it must reproduce the signed numbers. The researchers' benzene range
  (1.5 / 3 / 7 %) is run as a sensitivity row "benzene (researcher share)".
- **Where two researchers give a row for the same chemical:** low = the lower low, high = the higher high,
  central = the mean of the two centrals.
- **Admissible:** a chemical is admissible if at least one source measured it in petrol-engine exhaust and the
  researchers recorded the figure. Car-only or driving-cycle-only data are admissible but flagged
  (`carDataOnly` / `drivingCycleOnly`) with confidence "very low". A chemical whose sources disagree by more than
  about 100 times without resolution, or whose only data are per-km factors with no matching THC, is "not
  estimated", with the reason.

## 4. Statistics (per case x probe x D/T, over the 1,000 draws)

For each admissible chemical X, level in ppb and ug/m3 (ug/m3 = ppb x M / 24.45, 25 C, 1 atm):

(a) **Share of seconds smellable**: P5 / P50 / P95 over draws of (smellable seconds / seconds in the red window),
    for D/T 800 and 6,800 (hc10), plus the P50 for hc1.
(b) **Level in the smellable seconds**: for each draw, the mean of X over that draw's smellable seconds, and the
    highest single second of X among them; P5 / P50 / P95 over draws that have at least one smellable second (the
    number of such draws is reported).
(c) **Level when the smell is just detectable** ("if you can just smell it, at least about this much is there"):
    raw-exhaust content of X divided by the threshold dilution, i.e. X at exactly OU = 1. Computed per single
    scooter from 10,000 single-scooter draws (`draws.mjs` on the one-tailpipe NF1 case, fleet mode), P5 / P50 /
    P95, for D/T 800 and 6,800. It does not depend on the flow simulation. Reported once, not per case.
(d) **Averages for reference values of matching time.** For every chemical with a public reference value of
    30 minutes or 1 hour (list in section 5): one red's contribution to that average (red-window mean x W / T,
    W = red length: 90 s; A 30 s; NF1-fine's 30-s window taken as a 90-s red, as the signed report did), and the
    stay-through average for someone who stays through every red, with the fresh-draw-per-red method of
    `stay_through.py` (red = 45 % and 65 % of the cycle, n reds = round(duty x T / 90 s), 20,000 repetitions,
    nothing added in green).
(e) **Single chemicals above their own odour threshold**: for each X with an odour detection threshold in
    `sources-yardsticks.json`, the share of draws whose mean over smellable seconds is at or above that threshold,
    the same for the highest smellable second, and the P50 over draws of the share of smellable seconds in which X
    alone is at or above its threshold.

**Ranges (as `final_numbers.py`).** Central = P50 over draws. Low / high = P5 / F and P95 x F with the signed flow
factor F of the case (S1 1 / 5, S1-from 2 / 2, A 2 / 2, S5-12b 2 / 2, NF1-fine 3 / 2). Seconds-long values within
1 m (b) also carry the grid factor 3 / 3, combined in log-quadrature. Shares of seconds (a) and (e) carry the
emission and share spread only. (c) carries the emission, share and threshold spread only. (d) one-red: P5 / F,
P50, P95 x F; stay-through: low = P5 at 45 % / F, central = mean of the two P50s, high = P95 at 65 % x F.
Condition, condition probability and confidence wording are copied from `results-simulation.json` for the case;
confidence of a chemical number is the lower of the case's and the share's.

**Checks fixed now.**
1. Benzene through this code reproduces `results/<case>/stats.json` BZ red-mean and highest-second P5 / P50 / P95
   (expected identical) and the signed stay-through benzene 1 h (`corrections/stay_<case>.json`, expected within
   a few % as the resampling RNG order differs). The share of smellable seconds must reproduce the signed
   `odour/OU_hc10_DT*/share_of_seconds_at_or_above/1`.
2. Mass sanity: in every draw the sum of the THC-based shares is below 100 % of THC; report the largest; report
   how often the sum of the single aromatics exceeds the researchers' aromatics high (50 %).
3. One unit conversion done by hand in METHOD-SMELL.md.

## 5. What each result may be compared with

Only reference values of matching averaging time, after conversion (d). Never a 1-s or red-mean value beside a
30-min, 1-h, annual or lifetime value. Never a cancer risk for one red; IARC groups are hazard labels only, and
chemicals are not ranked by harm.

| chemical | value usable for (d) | averaging |
|---|---|---|
| benzene | OEHHA acute REL 27 ug/m3 (8.5 ppb) | 1 h |
| toluene | OEHHA acute REL 5,000 ug/m3; WHO odour guideline 1,000 ug/m3 | 1 h; 30 min |
| xylenes | OEHHA acute REL 22,000 ug/m3 | 1 h |
| 1,3-butadiene | OEHHA acute REL 660 ug/m3 | 1 h |
| styrene | OEHHA acute REL 21,000 ug/m3; WHO odour guideline 70 ug/m3 | 1 h; 30 min |
| formaldehyde | OEHHA acute REL 55 ug/m3; Taiwan indoor 0.08 ppm (98 ug/m3); WHO 100 ug/m3 | 1 h; 1 h; 30 min |
| acetaldehyde | OEHHA acute REL 470 ug/m3 | 1 h |
| acrolein | OEHHA acute REL 2.5 ug/m3 | 1 h |
| ethylbenzene, n-hexane, naphthalene, hydrogen cyanide | none of 1 h or shorter in the researched files | - |

(a), (b) and (c) have **no** reference value of matching averaging time for any chemical; they are reported as
levels only. Odour thresholds (e) are sniff-length values and are the only yardstick set beside seconds.

## Changes after the plan

Added at sign-off, 2026-11-27. The text above is unchanged. Each change, with its reason, is in
`METHOD-SMELL.md` section 7 and `corrections.md`. In short:
- (c) is "typically about this much", not "at least".
- For (a) and (b), the flow-and-grid factor is applied to the dilution before the smell test.
- The toluene, xylenes and n-hexane share ranges are corrected.
- Hydrogen cyanide has a 1-hour value (OEHHA 340 ug/m3) and is now in (d).
- Acetaldehyde's 560 ppb distinct-awareness level is added as an alternative threshold.
- The unplanned pooled median is dropped.
