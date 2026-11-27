# Source check of the chemical shares (sceptic, sources lens)

Checked 2026-11-27 against `speciation.json`, `sources-fuel-chemicals.json` and `sources-combustion-toxics.json`. I skimmed `sources-yardsticks.json` but did not check it here, because it holds odour thresholds, reference values and hazard labels, not shares.

For this check I opened every source again myself, from the URL each file records. PDFs and supplements went into the session scratchpad, outside the repository. I worked out the per-vehicle shares again from the original spreadsheets with my own scripts.

## Verdict in one paragraph

Every share figure I could reach matches its source exactly. That covers Yao 2008 Table 1, my own recomputation of all 14 Kumar 2020 two-wheelers, the Stockwell 2016 Table S4 columns, the EEA Tables 3-86a/b/d, MOVES Tables 14/15/48, Daemme 2016 Tables 1-2, the Tsai 2003 abstract and Rungratanaubon Table 2. I found no car figure or two-stroke figure passed off as four-stroke scooter data: every car-only row is flagged. I found no abstract-only reading used to set a range limit, except driving-cycle low ends that are labelled in `measuredOn`.

Four things should be fixed before the numbers go on the site:
1. The claim that the mixed bases "lean the levels high, not low" is not supported. The direction of that bias is unknown.
2. The Stockwell rows are called "Idle", but the samples are start-up plus idle from one very rich bike.
3. The formaldehyde high-end support is a derived number, not a measurement. It also ignores that five of six Nepal bikes were below the detection limit.
4. The ranges for toluene and xylenes are a little narrower than the sources justify.

None of these changes the qualitative message. Each one should be labelled, or the range adjusted.

## What I opened

| id | URL opened | what I read |
|---|---|---|
| yao-2008 | scholars.lib.ntu.edu.tw/bitstreams/b3c5056c-.../download | full text (publisher PDF) |
| kumar-2020-acp | acp.copernicus.org/articles/20/12133/2020/acp-20-12133-2020.pdf plus supplement zip (Supplementaryfile3mixingratiossamples.xlsx, sheet "petrol vehicular") | full text and spreadsheet |
| stockwell-2016 | acp.copernicus.org/articles/16/11043/2016/acp-16-11043-2016.pdf plus supplement zip (acp-2016-154-sp.xlsx, Tables S1, S4) | full text and spreadsheet |
| eea-2023-roadtransport | eea.europa.eu .../1-a-3-b-i/@@download/file | full text (157 pp.); p. 103-107 read |
| epa-moves-2016-toxics | 19january2017snapshot.epa.gov/.../420r16016.pdf | full text; Sect. 1.2, Tables 14, 15, 48 read |
| daemme-2016 | scielo.br/j/jbchs/a/jWxnBnn8hdxq4hyvRXqPMZG/ | full text (HTML); Tables 1-2 read |
| tsai-2003-jawma | NCBI efetch, PMID 12774984 | abstract only |
| rungratanaubon-2007 | ph02.tci-thaijo.org/.../download/142669/105631 | full text; Table 2 read |
| tsai-2018 | aaqr.org returned 403 (not worked around); OpenAlex abstract read | abstract only. The benzene "2-3 % chart reading" is NOT CONFIRMED by me |

## Check, chemical by chemical (admissible rows)

| chemical (low/central/high, % of THC) | figures checked | result |
|---|---|---|
| benzene (signed 1.2/2.7/5; researcher 1.5/3/7) | Yao Table 1 idle 918 (30 vol% aromatics fuel) and 764 (20 vol%) mg/L; THC 29.9-31.9 g/L, which gives 2.4-3.1 %. Kumar recomputed: median 4.04, range 1.47-6.91, n = 14. Stockwell Pulsar 2.096 of 59.555 g/kg NMHC = 3.52 %. Rungratanaubon four-stroke idle 11.7/30.6/32.9 ppm. | CONFIRMED. The Tsai 2018 "2-3 % of VOC" is a chart reading I could not open: NOT CONFIRMED, but it does not set a limit. |
| toluene 2/10/23 | Yao 529 and 1011 mg/L, giving 1.66-3.38 %. Kumar median 15.81 (12.52-17.81). Stockwell 8.89 %. Tsai 2003 abstract: 100 mg/km four-stroke, VOC 344/433 mg/km. | Figures CONFIRMED. The low end of 2 % sits above Yao's lowest measured value of 1.66 % (see B4). The Tsai 2003 23-29 % reading is listed in speciation.json without researcher 1's caveat that it is not used (the abstract does not match the species values to the totals). |
| ethylbenzene 1.4/3/5.6 | Kumar median 4.69 (3.22-5.59). Stockwell 2.28 %. MOVES Table 14/15: 0.01398-0.02147 of VOC (US cars). | CONFIRMED. The low end is car data and is flagged in the text. |
| xylenes 3.6/10/14.4 | Kumar median 11.04 (3.61-14.41). Stockwell (4.760 + 1.627) / 59.555 = 10.72 %. MOVES 0.05557-0.07814. | CONFIRMED, but see B4: Kumar's o-xylene is suspiciously small (median 0.32 % against m/p 10.62 %). |
| 1,3-butadiene 0.12/1.25/3.5 | Yao 353/358 mg/L, giving 1.11-1.20 %, and only 7-8 mg/L at cruise. Stockwell Pulsar 2.039 g/kg = 3.42 % of NMHC. Fleet figures 1.30 (0.51) and 1.19 (0.56) g/kg in Table 1. EEA Table 3-86a: 1.42 conventional, 0.91 Euro 1-4. Table 3-86c: 0.12 Euro 5 and 0.80 Euro 6 passenger car. | CONFIRMED. The low end comes from a Euro 5 car, which is not what EEA applies to motorcycles. That is acceptable as a widening, but it should be labelled as car data. |
| n-hexane 0.1/1.2/3.1 | Kumar median 1.61 (0.13-3.08). Stockwell 0.82 %. MOVES 0.00861-0.01593. | CONFIRMED |
| styrene 0.1/0.3/3.8 | Kumar median 3.07 (2.13-3.77). Stockwell 0.1315 g/kg = 0.22 %. MOVES 0.00097-0.00340. EEA (cars) 0.57-1.01 %. | Figures CONFIRMED. The co-elution inference is plausible: the first column is DB-1, a non-polar column on which o-xylene and styrene can coelute, and the paper confirms that column type. The authors do not say so, though. The EEA car values (0.57-1.01 %) are not mentioned, although they are above the central. |
| naphthalene 0.05/0.55/2.0 | MOVES Table 48: 2.07e-3 of VOC; Sect. 1.2 says LD gasoline rates "are applied to all gasoline vehicles, including motorcycles". EEA Table 3-86d: 0.95 (Euro 5) and 0.84 (Euro 6) for passenger cars and light commercial vehicles. | Figures CONFIRMED, and the row is correctly flagged car-only. Note: Table 3-86d covers Euro 5 and later cars, which EEA does NOT apply to motorcycles. Table 3-86b (conventional), which EEA does apply, has no naphthalene. The high end of 2.0 and the low end of 0.05 are assumed widenings, not data. |
| formaldehyde 0.1/0.85/2.1 | Yao 219/228 mg/L, giving 0.69-0.76 %. Daemme E22 HPLC 0.93 mg/km against THC 0.182 g/km = 0.51 %. Tsai 2003 abstract 0.4/0.7 mg/km. EEA 3-86b 2.08 (conventional) and 1.70 (Euro 1-4). Stockwell Aviator scooter 0.5481 (pre-service) and 0.5345 (post) g/kg; formaldehyde "bdl" for the CBZ 1, CBZ 2, Pulsar, Discover and Splendor columns. The text says "The scooter, however, was the only motorbike sampled that produced detectable formaldehyde". | Figures CONFIRMED. I reproduced the derived "about 2 % of THC" for the Aviator (14.70 g/kg FTIR C1-C4 / 0.524 Pulsar FTIR-species share = 28 g/kg, which gives 1.95 %). It is a construction, though, not a measurement: see B3. |
| acetaldehyde 0.13/0.55/1.4 | Yao 64/88 mg/L, giving 0.20-0.29 %. Stockwell Pulsar 0.8172 g/kg = 1.37 % of NMHC (1.28 % including CH4). Tsai 2003 abstract 0.6/1.2 mg/km. EEA 0.59/0.75. | CONFIRMED. The high end comes from a start-up-plus-idle sample on a bike at MCE 0.60 (see B2). |
| acrolein 0.05/0.17/0.4 | EEA 3-86b 0.16 (conventional) and 0.19 (Euro 1-4). 3-86d 0.18 (Euro 5) and 0.08 (Euro 6). MOVES Table 14 0.000628 (0.063 %) of VOC, not cited, but it supports the low end. | CONFIRMED as car-only and flagged. The value EEA actually applies to four-stroke motorcycles is the conventional 0.16 %. The 0.05 and 0.4 limits are assumed widenings. |
| hydrogen cyanide 0.06/0.10/0.17 % of CO | Table S4 HCN/CO by test: CBZ1 0.109 and 0.077 %; CBZ2 0.166 and 0.104 %; Pulsar 0.129 and 0.086 %; Discover 0.108 and 0.061 %; Aviator 0.079 % and bdl; Splendor 0.082 %. Fleet figures 0.841/0.678 g/kg in Table 1. | CONFIRMED (10 of 11 tests above detection limit; range 0.061-0.166 %, median about 0.095 %) |

Other figures I re-checked: the Stockwell fleet phenol of 4.84/3.02 g/kg and the sulphur values (OCS 0.01015, DMS 0.004939 g/kg; SO2 "bdl") match. The "not estimated" decisions for phenol and sulphur rest on correct figures.

## Problems found

### B1. Denominator: the claim "leans high, not low" is unsupported (should-fix)
`speciation.json` rules.denominator says that using the Kumar and Stockwell shares of speciated NMHC, and Yao's analyser THC, "leans the levels high, not low". The sources do not establish that direction:
- Yao measured THC with a "MEGA 300 Tail Gas Analyzer, Mastek Technologies" (Sect. 2). The detector principle is not stated, and neither is the conversion to g/L. If it is a garage-type NDIR analyser, as the name suggests (this is my inference and I have not verified it), it under-reads aromatics and alkenes. In that case Yao's shares are too HIGH relative to an FID THC.
- The Tsai 2018 abstract (OpenAlex) gives HC 29.4 ± 13.1 g/L for Phase V bikes, but the sum of the 67 speciated VOC is 25.2 to 47.1 g/L. So the speciated sum is of the same size as the analyser HC, or larger. Speciated-sum shares are therefore not obviously higher than shares of THC.
- The simulation's THC (model.mjs, CH1.85) is a regulatory-type emission rate, which means its basis differs again.

Fix: state that the bias from mixing bases has an unknown direction and is roughly up to about 1.5x either way (researcher 2's own estimate). Either widen the low ends of the Kumar-based rows (toluene, ethylbenzene, xylenes, hexane) by that factor, or keep the ranges and remove the "leans high" sentence from METHOD-SMELL.md and anything on the site.

### B2. Stockwell rows are described as "Idle" (should-fix)
Stockwell sampled "start-up and idling" (Sect. 2.1.1, Table S4 title), not a warm idle. The speciation figures (benzene 3.5 %, butadiene 3.4 %, acetaldehyde 1.37 %, styrene, hexane) come from ONE canister, on the Bajaj Pulsar before servicing, at MCE 0.598. That is very rich, and ethylene plus acetylene are 38 % of its NMHC. `speciation.json` lists these values as "Idle: ... Stockwell 2016". Only the formaldehyde row says "start-up plus idle".

Fix: label every Stockwell value as "start-up plus idle, one very rich carburetted bike, Nepal 2015, no catalyst". This matters most where Stockwell sets a range limit: butadiene high 3.5, acetaldehyde high 1.4, HCN (all of it).

Kumar, by contrast, is a genuine warm idle: "engine was left running for about 5 min until it warmed up to normal working temperature (70-90 °C) ... at idle speed". Yao ran the engine "at a cold-start mode" with idle at 1718 ± 105 rpm; the paper does not say how long after start the idle sample was taken. Worth a note.

### B3. Formaldehyde high end: a derived figure, and contrary evidence left out (should-fix)
The "about 2 % of THC" for the Nepal scooter is not a measured share. It is built by scaling the scooter's five FTIR hydrocarbons by the C1-C4 fraction of a different bike, the Pulsar, at MCE 0.60. The scooter's MCE was 0.82-0.87. The ethylene-rich C1-C4 fraction depends strongly on how rich the engine runs, so the factor carries over badly.

Also left out: formaldehyde was below the FTIR detection limit for all five motorcycles ("HCHO was below the detection limit for the gasoline-powered motorcycles we measured"). Those bikes emitted about 60-100 g/kg of hydrocarbons, so their formaldehyde share of THC was below some limit, probably a low one (the detection limit is not given in what I read).

The high end of 2.1 % is still supported, by the EEA conventional petrol car figure of 2.08 %, which is car data. Fix: show the 2 % as "derived, one scooter", list the five non-detects as evidence for the low side, and add "high end car data or derived" to the formaldehyde flags. The low end (0.1) is driving-cycle data from the Tsai 2003 abstract (pooled two- and four-stroke, and the abstract gives formaldehyde for new versus in-use bikes, not by stroke). It should also be flagged `drivingCycleOnly` in `flags`, not only in the prose.

### B4. Ranges somewhat narrower than the sources (should-fix, small)
- Toluene low 2 % sits above Yao's measured 1.66 % (Taiwan, the closest match to the question). Use 1.6 % or lower.
- Xylenes: if Kumar's "styrene" peak (median 1.94 ppm against o-xylene 0.22 ppm) is really o-xylene, the Kumar xylene sum is understated by about 3 points. Its range would then run up to about 17-18 %, not 14.4 %. The two corrections should go together: if styrene's high end of 3.8 is kept "as given", xylenes is fine, but the files then rest on two inconsistent readings of the same peak. Suggest xylenes high about 18 % (or a note that the two are coupled).
- Styrene central of 0.3 % ignores the EEA car values of 0.57-1.01 % (Table 3-86b/d), which are above it. This is a note, not a requirement.

### B5. Car-only rows keep car limits but get assumed widenings (note)
Naphthalene (2.0) and acrolein (0.05, 0.4) have high and low ends that are assumptions (multiplied by 2-3), not data. They are flagged `carDataOnly` and rated "very low", which is correct. Any site text about acrolein exceeding its 1-h value (the computation's headline 7) must carry "car data only; range assumed".

### B6. No source is a modern scooter (note, already stated)
I confirm the files' own statement. The Yao engine is new, carburetted and has no catalyst. Kumar does not state catalyst fitment. The Stockwell bikes had no catalysts: "catalytic converters ... were not required for four-stroke bikes until 2015" (in India). The Bangkok bikes are from 1999-2000. Daemme 2016 is the only catalysed motorcycle, it ran on E22 over a driving cycle, and its FTIR shows the catalyst removing most formaldehyde (pre-catalyst 7.58, tailpipe 0.35 mg/km at steady state). So the share for a catalysed Taiwanese scooter at idle is not measured for any chemical.

### B7. Two-stroke draws get four-stroke shares (note, mainly the signed model)
`speciation.json` applies the four-stroke shares to every draw's THC, including two-stroke draws (twoStrokeShare 1-3 %). The signed two-stroke benzene of 1-3 % is labelled "ASSUMPTION" in model.mjs. The only two-stroke share seen (Chulalongkorn 2001, abstract only) gives benzene/THC 8.46 % and toluene 16.5 %. Because two-strokes are few, the effect on medians is small, but packs that contain a two-stroke could be understated. This is not a share-sourcing error in this step. Flag it.

## Not confirmed by me
- Tsai 2018 benzene "about 2-3 % of VOC" (chart reading): aaqr.org returned 403, and the abstract gives no number.
- The Tsai 2003 JAWMA idle-stage values: tandfonline full text not attempted (recorded as 403 by both researchers).
- Chulalongkorn 2001 two-stroke BTEX/THC: the abstract was not reopened (context only; not used for any range).
- Whether the "MEGA 300 Tail Gas Analyzer" is an NDIR instrument: not verified.

## Things looked for and not found
- No car figure presented as four-stroke scooter data: every EEA and MOVES use is labelled car, and EEA's own statement that motorcycle speciation uses conventional petrol car fractions is quoted correctly (p. 103).
- No two-stroke figure inside the four-stroke ranges: Chirico 2014 and Chulalongkorn 2001 are used as context only.
- No share of identified VOC silently presented as a share of THC: the basis is disclosed in rules.denominator. Only the stated direction of its bias is wrong (B1).
- No abstract-only figure sets a range limit except the driving-cycle low ends for formaldehyde and acetaldehyde (Tsai 2003). Those are labelled driving-cycle in the prose, but not in `flags`.
