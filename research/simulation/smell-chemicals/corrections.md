# Corrections at sign-off (smell-chemicals step)

2026-11-27. Each finding from the three sceptics (`verify-sources.md`, `verify-arithmetic/`, `verify-fairness.md`)
was checked again here before it was applied. "Confirmed" means I checked it myself, against the source file, the
code or the numbers. After the corrections, the computation was re-run in full:
`python3 smell_chemicals.py <sim/run>`, about 10 s on one core. The headline numbers before and after are at the end.

## Sources lens (verify-sources.md)

| # | finding | checked | what changed |
|---|---|---|---|
| S1 | The mixed denominators "lean high" has no support | Confirmed. `speciation.json` rules.denominator and METHOD 6 said this. Yao's analyser detector is not stated, and the Tsai 2018 abstract gives a speciated sum about as large as the analyser HC, or larger. | The wording is removed everywhere. The bias is now stated as **unknown direction, up to about 1.5 times either way**. Low ends set by idle two-wheeler data are lowered to the lowest measured idle value / 1.5, where they were not already lower: toluene 2 -> 1.1, xylenes 3.6 -> 2.4, n-hexane 0.1 -> 0.09. Ethylbenzene (1.4, car data), styrene, butadiene, formaldehyde and acetaldehyde were already low enough. High ends were not raised by the factor, because the measured aromatics total (at most 50 % of speciated NMHC) already bounds them. This is stated in the method as an uncertainty the ranges do not carry. |
| S2 | Stockwell values labelled "Idle" | Confirmed (verify-sources B2 quotes Table S4 and the text "start-up and idling"; one canister, Pulsar pre-service, MCE 0.598). | Every Stockwell value in `speciation.json` now says "start-up plus idle, one canister on one very rich carburetted bike, no catalyst". Rows where it sets a limit are flagged: butadiene high, acetaldehyde high, all of HCN. |
| S3 | Formaldehyde 2 % is derived; non-detects left out; no driving-cycle flag | Confirmed (the derivation 14.70 / 0.524 = 28 g/kg -> 1.95 % rebuilds; Table S4 shows bdl for 5 bikes). | The 2 % is marked DERIVED from one scooter. The 5 non-detects are listed as evidence for the low side. The high end 2.1 is stated to rest on the EEA conventional car figure of 2.08 %. Flags added: "low end drivingCycleOnly", "high end car data or derived", "5 of 6 Nepal bikes below detection". Acetaldehyde's low end also gets a driving-cycle flag. No number changed. |
| S4 | Toluene low above Yao 1.66 %; xylenes high vs the styrene / o-xylene peak | Confirmed. 529 mg/L / 31.9 g/L = 1.66 %. The file used the same Kumar peak as styrene (to keep styrene's high end) and not as o-xylene. | Toluene low is now 1.1 (1.66 / 1.5, which also covers S1). Xylenes high is now 18 %. The styrene and xylenes high ends are marked COUPLED: both rest on one peak, so they cannot both be at their highs. They are still drawn independently. This leans high for the pair and is stated. |
| S5 | Naphthalene and acrolein widenings are assumed | Confirmed (EEA Table 3-86d covers Euro 5/6 cars only). | Both `measuredOn` texts now say "ASSUMED widenings". For acrolein, the value EEA applies to motorcycles (0.16 %) is named, with "car data only, range assumed". |
| S6 | Tsai 2018 benzene chart reading; Tsai 2003 toluene | Confirmed as not confirmable. | Both are moved to `contextOnly` in `speciation.json` (not confirmed / not used). The benzene `measuredOn` says NOT CONFIRMED. Neither sets a limit. |
| S7 | Two-stroke draws get four-stroke shares | Confirmed (model.mjs: benzeneFrac2s is labelled ASSUMPTION). | Added `twoStrokeNote` to `speciation.json` and a line to METHOD 6. |
| S8 | No source is a modern catalysed scooter at idle | Confirmed. | Kept in notEstimated. Every page that names a chemical must say so (statements-smell.json). |

## Arithmetic lens (verify-arithmetic/)

| # | finding | checked | what changed |
|---|---|---|---|
| A1 | Low ends of smellable-second levels fall below the just-smellable level | Confirmed. The old low was P5 / (flow x grid) applied AFTER the smell condition. That gave, for example, S1-from 0.5 m / 0.7 m at D/T 800 a low of 2.4 ppb, below the single-scooter just-smellable P5 of 3.4 ppb. | **Code changed.** The flow-and-grid factor now goes on the dilution BEFORE the smell test. The low end is P5 of the run with the exhaust fraction divided by F_lo; the high end is P95 with it multiplied by F_hi. Flow uncertainty now moves the share of smellable seconds, which now carries it: its low end often drops to 0. Where no draw is smellable at the low bound, the level's low end is "n.s." (not smellable). A new check confirms that in every draw at every probe, the smellable-seconds benzene mean is at or above that draw's smallest benzene per odour unit across its tracer groups (result 1.0000). Effect: benzene centrals unchanged; lows rise (S1-from 0.5 m / 0.7 m D/T 800: 2.4 -> 5.4 ppb); highs change little. |
| A2 | ug/m3 at 25 C, not 30 C | Confirmed (3.195 against 3.140 ug/m3 per ppb). | 25 C is kept so the numbers match the signed report and the reference-value conventions. It is stated that every ug/m3 figure leans high by about 1.7 %. No verdict changes. |
| A3 | Medians that cover only some draws | Confirmed (NF1-fine 1.5 m D/T 800: 341 of 1,000). | The number of draws is now in every summary line of METHOD, ANSWER and statements, and the text says "in the share of cases where it can be smelled at all". |
| A4 | The 2.2 against 1.7 ppb gap | Confirmed. | The code now writes the single-scooter raw-exhaust benzene: P50 12,200 ppb (P5 2,400, P95 63,000), against 15,200 ppb for the all-central scooter. The verifier gave 12,800 from its own draw set. METHOD 4 now says why the gap exists. |
| A5 | S1-from 0.6 m and 0.7 m identical | Confirmed in the verifier's re-derivation. S1-from has no 0.6 m probe in this step. | No "0.6-0.7 m" wording is used for S1-from. |
| A6 | Highest smellable second = highest second | Confirmed (this is by construction). | Stated in METHOD. These rows are not used as a separate headline. |

## Fairness lens (verify-fairness.md)

| # | finding | checked | what changed |
|---|---|---|---|
| F1 | "When you smell it, this is in it" is a model identity; "at least" is wrong; the converse is missing | Confirmed (P5 of the just-smellable level is 0.4 ppb; HC-rich scooters put less benzene at 1 OU). | METHOD and ANSWER now state it as conditional ("if the smell is the exhaust of the scooters beside you"). "At least" becomes "typically" (PLAN text kept; change recorded in METHOD 7). "No smell does not mean clean air; carbon monoxide has no smell; particles are too small to see" goes with every such sentence. |
| F2 | "4-50 ppb in every pack case" is produced by the conditioning | Confirmed (METHOD 5's own argument). | Removed as a "surprise". Every level is now shown with the share of seconds, the number of draws and the condition. |
| F3 | Lower odour thresholds; the pooled median was not planned | Confirmed. | The pooled "median over case-probe pairs" is dropped. (e) is reported per case for every threshold, in `results-smell.json` `ownOdourByCase` and in the txt. Both thresholds are given. Acetaldehyde now also gets the 560 ppb distinct-awareness level as its alternative (in sources-yardsticks.json): no pack draw reaches it. Listed under METHOD 7. |
| F4 | The owner's "unburnt fuel" framing | Confirmed (petrol vapour was not modelled; the candidate odorants are combustion aldehydes). | ANSWER and statements say so. The 2025 petrol Group 1 label may not be borrowed. |
| F5 | The mixture's 2B is missing; the list is ordered by hazard | Confirmed. | Lists are now in order of share of the exhaust, with the IARC group in a separate column and with exhaust's own 2B beside it. |
| F6 | HCN's 1-h value was missed | Confirmed myself: CARB consolidated table 2025-09-25, opened and read (pdftotext), row "HYDROGEN CYANIDE ... 3.4E+02 4/99", note 2 "All acute RELs use a 1-hour averaging period". | HCN 340 ug/m3 (1 h) added to `referenceValues` and to (d). Result: below it everywhere, even in the worst case. The highest is NF1-fine 0.6 m stay-through 10 / 67 / 260 ug/m3; for pack cases the central is at most 10 ug/m3. Listed under METHOD 7. |
| F7 | Leaning on NF1-fine | Confirmed. | NF1 appears only as a labelled detail row ("rare near-calm worst position, likely to read high"), never in a summary, share card or first screen. |
| F8 | "100-200 ppb at pushchair height 0.5 m" | Confirmed (no 0.5 m height probe; 0.5 m is the distance). | The sentence is removed. Where NF1 appears, it says 0.5 m from the tailpipe at 0.6 / 0.7 m height, with the NF1 label. |
| F9 | Acrolein exceedance headlined | Confirmed. | Detail table only, with "car data only, very low confidence, range assumed". |
| F10-F15 | Reference labels, no background, wide ranges, old engines | Confirmed. | Carried in ANSWER and statements-smell.json (labels for the Taiwan indoor and WHO odour values; "added by the scooters to the air already there"; range and 推估 always; no claim about modern catalysed scooters). |

## Not applied, and why

- No finding was rejected. The only choice point: for S1 I chose to widen the low ends (and state that the high ends are bounded by the aromatics total) rather than leave the ranges as they were.
- Background street air (fairness D5, optional): not added. No background source was opened in this step, and none is invented.

## Headline numbers before -> after (central unchanged unless shown)

- Benzene, mean over smellable seconds, S1-from 0.5 m / 0.7 m: D/T 800 2.4 / 33 / 390 -> 5.4 / 33 / 360 ppb; D/T 6,800 2.0 / 27 / 350 -> 2.1 / 27 / 350 ppb.
- Share of smellable seconds, same probe: D/T 800 0.36 / 0.76 / 0.91 -> 0 / 0.76 / 0.97 (now carries the flow factor; at the low flow bound 460 of 1,000 draws have any smellable second).
- Toluene, same probe, D/T 800: 6.9 / 110 / 1600 -> 15 / 110 / 1500 ppb. Xylenes: 5.8 / 81 / 1000 -> 13 / 88 / 1000 ppb.
- Just-smellable levels (c): benzene unchanged (0.4-58 ppb; central 1.7 / 15). Toluene 5.4 / 46 (was 5.6 / 48). Xylenes 4.4 / 37 (was 4.1 / 35).
- (d) 1-h averages: no above/below verdict changed. HCN was added: below 340 ug/m3 everywhere, including the worst case.
- Mass sanity: THC-based shares now sum to at most 54 % (was 51 %). Aromatics never above 50 %.
