# Fairness review of the smell-chemicals estimate

Reviewer: sceptic, fairness lens. Date 2026-11-27. Read: PLAN-SMELL.md, METHOD-SMELL.md, results-smell.json,
results-smell.txt, sources-yardsticks.json, smell_chemicals.py (the own-odour and averaging parts), and the
signed simulation's ANSWER.md, METHOD.md and statements.json on the benzene reference value. I also opened one
source myself: the CARB consolidated table of OEHHA values,
https://ww2.arb.ca.gov/sites/default/files/classic/toxics/healthval/contable09252025.pdf (full text, Table 1 and
its notes). Nothing was edited or committed apart from this file.

Overall: the computation keeps to its own rules in most places. Seconds-long values are never set beside 1-h
values, cancer labels are called hazard labels, and no cancer risk is computed. But the summary text in
METHOD-SMELL.md section 1 and the computation's headline report lean in four ways a website would inherit:

1. They put the rarest, weakest case (NF1-fine) next to the ordinary ones.
2. They use the lower of two odour thresholds when saying what people smell.
3. They pool case-probe pairs into a median the plan did not fix.
4. They leave out things that would cut the other way: the 2B label for the exhaust as a whole, a missed 1-hour
   value for hydrogen cyanide, and the fact that every level is an addition to the street's existing air.

None of this changes a number. It changes which sentences are fair to publish.

## A. Findings

### A1. "When you smell it, this is in it" is a model identity, not an observation (should-fix, wording)

"Smellable" means OU >= 1, where OU is the exhaust fraction of the simulated scooters times a dilution-to-threshold
for 1960s car exhaust. Every chemical is that same exhaust fraction times a share. So "when OU >= 1, benzene >= X"
is true by construction. It holds only if:

- the smell comes from these scooters' exhaust (not other traffic, cooking, drains or a petrol station);
- smell follows exhaust volume (Fiala found that odour did not follow HC or CO, and that adding air raised odour);
- a 50 % lab-panel detection threshold of car exhaust applies to scooter exhaust and to a person on a street.

Three consequences for wording:

- **It is conditional.** It may be said as "if what you smell is the exhaust of the scooters beside you, the model
  says this air also holds about ...". It may not be said as a certainty.
- **The plan's phrase "at least about this much is there" (PLAN 4c) is wrong.** Table (c) gives a P5 of
  0.4 ppb, and an HC-rich scooter (weighted x10 for odour) puts less benzene at OU = 1. The level at OU = 1 is a
  typical value, not a floor.
- **The converse must be stated.** No smell does not mean no benzene. In S1 at 0.5 m, 0.7 m (D/T 800), the
  central share of smellable seconds is 0, but benzene is still there over the red. A site that teaches "smell =
  danger" also teaches "no smell = safe". That is wrong, and it is the reassuring mirror of the alarming error.
  Carbon monoxide has no smell, and particles are too small to see.

### A2. The "4-50 ppb in every pack case" result is produced by the conditioning; it is not four confirmations (should-fix)

METHOD section 5 explains this correctly. The headline "surprise" ("almost the same in every case") could still
be read on a site as "wherever you stand, when you smell it you breathe 4-50 ppb", as if four streets had
independently agreed. They did not.

- **The floor is set by the threshold.** Requiring OU >= 1 puts a floor at the just-smellable level, so the
  agreement comes from the threshold, not from the streets.
- **The sample is conditional, and the number of draws is missing from the headline.** In several pack rows the
  statistic covers only the draws that had any smellable second:

  | case, probe, D/T | draws with a smellable second (of 1,000) |
  |---|---|
  | S1, 0.5 m / 0.7 m, 800 | 137 |
  | A, 0.5 m / 1.5 m, 800 | 85 |
  | A, 1.0 m / 1.5 m, 800 | 236 |

  These draws lean toward the higher-emitting packs.
- **Required:** say "in the seconds you can smell it (which in the canyon case is often never in a red)". Give the
  share of seconds next to the level every time.

### A3. Lower odour thresholds were chosen for the "what you actually smell" sentence; the pooled median was not planned (should-fix)

The headline list in section 1 ("formaldehyde (low threshold) 38 %; styrene 20 %; acetaldehyde 98 %; m-xylene
60 %") has three problems.

- **Formaldehyde and styrene use the lower threshold, and the alternative is not shown.**
  - Formaldehyde is reported at WHO's lower end, 24 ppb. At Nagata's 500 ppb the shares are 0-15 %; at S1-from
    0.5 m, 0.7 m the share of draws is 0.0.
  - Styrene is reported at 16 ppb rather than Nagata's 35 ppb.
  - Xylenes use the m-xylene figure (41 ppb), the lowest of the three isomers (o-xylene is 380 ppb).
  - Every choice pushes toward "you are smelling the listed chemicals". The planned outputs keep both thresholds.
    The summary should give both.
- **Acetaldehyde rests on a single threshold.** Nagata gives 1.5 ppb, and sources-yardsticks.json also records the
  AEGL "level of distinct odour awareness", 560 ppb, which is 370 times higher. That is a different measure
  (awareness, not detection), but it shows that "acetaldehyde is what you smell" depends on one 1976-88 single-lab
  value. sources-yardsticks.json itself says to treat single-chemical thresholds as order of magnitude.
- **"Median over case-probe pairs" is not a statistic fixed in PLAN-SMELL.md 4(e).** It is a summary added after
  the numbers were seen. It weights the near-calm NF1 probes and the held-wind cases the same as the canyon case.
  Either report per-case ranges, or list it under "Changes after the plan".
- **What may be said (fair, and supported in both directions):** "Benzene itself is far below the level at which
  it can be smelled (it reached its own threshold in at most 0.5 % of draws). The smell is more likely to come from
  other parts of the exhaust; aldehydes such as acetaldehyde are candidates. This is order-of-magnitude."
  "The smell comes with benzene, it is not the benzene" is acceptable.

### A4. The owner's framing, "the smell of unburnt fuel", is not what the estimate supports (should-fix, wording)

- **The candidate odorants are combustion products.** The chemicals found above their own thresholds most often
  are acetaldehyde, formaldehyde and acrolein, which come from combustion. Petrol vapour has its own threshold
  (API 1995, 0.47-0.58 ppm) and was not modelled.
- **Petrol's cancer label cannot be borrowed for the exhaust.** IARC moved automotive petrol to Group 1 in 2025
  (Vol 138). That label is about the fuel and is based mainly on exposure to the fuel; it is not a label for
  exhaust. "You are smelling petrol, and petrol causes cancer" would borrow a label for something the model does
  not show is at the nose.

### A5. The exhaust mixture's own label is missing beside the component labels (should-fix, balance)

- **What is missing.** METHOD section 1 opens with "benzene, 1,3-butadiene and formaldehyde (all IARC Group 1)".
  sources-yardsticks.json records that petrol-engine exhaust as a whole is IARC Group 2B ("possibly carcinogenic").
  That label is missing from the short answer.
- **Why it matters.** Listing three Group 1 components without the mixture's own 2B label leans toward alarm.
  Quoting only "exhaust is 2B" without the components would lean toward reassurance. Both must appear together,
  with the group meanings (strength of evidence that something can cause cancer, not the risk at any level).
- **The list order is effectively a ranking.** It runs Group 1, then 2A, then 2B, then unlabelled, then HCN. That
  is ordered by hazard label, which contradicts "not ranked by harm" in the next sentence. Use alphabetical order,
  or order by share of the exhaust, and put the IARC group in a separate column.

### A6. A 1-hour value for hydrogen cyanide was missed; its omission removes a reassuring comparison (should-fix)

- **The value exists.** PLAN 5 and METHOD 6 say HCN has "none of 1 h or shorter in the researched files". The CARB
  consolidated table the researchers used lists HYDROGEN CYANIDE with an acute REL of 3.4E+02 ug/m3 (340 ug/m3,
  reviewed 4/99). Its note 2 says that all acute RELs use a 1-hour averaging period. I opened and read this myself,
  at the URL above (Table 1, the "Cyanide Compounds (inorganic)" block).
- **The stay-through HCN average was not computed.** Rough scaling from benzene suggests it is well below 340 at
  the central value even in NF1, but that is not a substitute for computing it.
- **Required:** add HCN to (d), or say "a 1-h value exists and was not compared". Until then a site must not list
  "hydrogen cyanide" among the chemicals at the nose. The name is emotive, and the site would be giving no level or
  comparison for it.

### A7. The headline results lean on the weakest and rarest case, NF1-fine (should-fix)

- **Why NF1-fine is the weakest case:**
  - one tailpipe, near-calm air held toward the person;
  - "light wind from that sector in about 1 % of reds; held for a whole red or 15 minutes: unknown, much rarer;
    exact position needed";
  - A6 fails (turbulence a third of the floor), so the result is upper-side;
  - its 30-s window is counted as a 90-s red.
- **It drives most of the exceedances.** It supplies:
  - the formaldehyde 1-h exceedance (77-140 ug/m3);
  - the largest acrolein values (15-26);
  - the toluene WHO odour guideline exceedance;
  - the only one-red exceedances (benzene, acrolein, styrene, worst case only);
  - the 260-350 ppb highest seconds.
- **The one-hour stay-through for NF1 stacks three conditions.** It assumes a near-calm wind held from one
  sector for an hour, a person standing 0.5 m directly downwind of one tailpipe for every red, and the same
  upper-side flow each time. Each of these is rarely true; together they are an envelope, not an estimate.
- **Required.** NF1 values may appear only as a labelled "rare near-calm worst position, upper-side" row, never in
  a summary sentence, a share card or the first screen.

### A8. "100-200 ppb at pushchair height 0.5 m" misstates the probe (should-fix, factual)

- **There is no 0.5 m height probe.** METHOD section 1 places it in NF1, but 0.5 m there is the distance from the
  tailpipe. The heights are 0.6 m (170-200 ppb central) and 0.7 m (110-130 ppb).
- **The sentence also hides the case's condition.** It needs the NF1 label: near-calm, single tailpipe, about 1 %
  of reds, upper-side.

### A9. The acrolein 1-hour exceedances rest on car-only data (should-fix, prominence)

- **What is above the reference.** The central acrolein stay-through levels are above the 2.5 ug/m3 REL for
  S1-from at 0.5-1 m and S5-12b at 0.5 m, 0.7 m. The margin is small (3.3-4.4 against 2.5).
- **Why that is weak.** The share is from EEA car factors, widened, with very low confidence. The low end
  (0.85-1.2) is below the reference.
- **The summary gives it equal standing with benzene.** "Acrolein, not formaldehyde, is the chemical besides
  benzene that passes" puts it beside benzene, whose share has moderate confidence and comes from idle scooter
  measurements.
- **Required.** Acrolein belongs in the detail table with "car data only, very low confidence", not in a headline.

### A10. The stay-through comparisons are fair only with all their conditions attached (carry)

- **What makes them fair.** The 1-h comparisons in (d) match averaging times. The CARB note 2 confirms that the
  OEHHA benzene acute REL now counts as a 1-hour value, although it was derived from a longer exposure (the
  signed report flags "derived on a 6-h basis"; keep that flag).
- **The conditions to carry:**
  - **Wind held from the scooters for the whole hour.** For S1-from, at most about 1 in 8 peak-hour reds have
    that wind for 90 s; for a whole hour it is unknown and far rarer.
  - **The same simulated red every time**, and nothing added in green.
  - **Child height (0.7 m) gives the largest values.** At 1.5 m in S1-from the central benzene is 31 ug/m3, still
    above 27; at 1.0 m, 1.5 m it is 26, not above.
  - **The values are the scooters' addition only.** They exclude whatever is already in the street air (see A12).
    That cuts upward for the total, so it is not a reason to soften, but the site must say "added by the scooters".
  - **Being above a REL is not harm.** RELs include safety factors. "Above California's 1-hour reference level" is
    the fair verb. "Harmful" or "dangerous" is not.

### A11. Some reference values need their own labels (carry)

- **The Taiwan formaldehyde 0.08 ppm (1 h) is an indoor standard** for public places. It may appear only as
  "Taiwan's indoor-air standard", never as an outdoor or legal limit.
- **The WHO toluene and styrene 30-minute values are odour-annoyance guidelines.** "Passes the WHO guideline" must
  always say "odour-based (to prevent annoyance), not a health limit". Otherwise it reads as harm.
- **Workplace limits and AEGLs are not used in (d).** That is correct. If ever quoted, they need the "workers, not
  public" / "emergency planning" flag.
- **WHO's "no safe level" for benzene and all unit risks are lifetime statements.** They must not appear on the
  same screen as any seconds-long or red value.

### A12. No background context (note)

- **No air outside the model is included.** Nothing in the package gives typical street (background) benzene or
  aldehyde levels, and nothing should be invented. The just-smellable benzene (central 1.7 ppb with the 6,800
  figure) may well be of the same order as ordinary urban air. Only a source that has been opened and read can
  show that.
- **Why it matters for fairness.** Without it, a reader may assume that all benzene in the air comes from the
  scooter (alarm). They may also assume that the scooter value is the whole exposure (reassurance).
- **Minimum:** "these are the amounts the idling scooters add to the air that is already there".

### A13. The 6,800 figure is the top of its study's range (note)

- **What the source says.** sources-yardsticks.json records that BIL-32 gives about 5,200-6,800, and that the
  simulation uses the top. Fiala's range is 800-1,000, and 800 is its bottom.
- **The effect.** Using 6,800 makes smell more frequent and the just-smellable benzene lower. Using 800 does the
  reverse. Both directions are kept, which is fair.
- **What a site must not do.** It must not quote the 97 % smellable share (6,800 figure) without the 76 % (800
  figure) beside it, and it must not quote 15 ppb (800 figure) without 1.7 ppb (6,800 figure).
- **"Smellable" is a lab-panel threshold.** It is where half of a lab panel detects the smell. It is not "what
  people will notice" at a noisy crossing, where noticing probably takes several times more.

### A14. The ranges are wide; a single number would mislead (carry)

- **Benzene mean over the smellable seconds:** the low / high bounds are about 0.1 and 13 times the central
  (S5-12b 0.5 m, 1.1 m: 3.5 / 50 / 640 ppb).
- **The just-smellable level:** about 0.25-4 times the central, and about 8.5 times apart between the two
  thresholds.
- **Required.** Any number shown must come with its range and the words "estimate (推估), not a measurement".

### A15. The shares come from old or uncatalysed engines (carry)

- **The engines measured.** Every share comes from carburetted or uncatalysed engines (Taiwan 2008, India, Nepal)
  or from cars.
- **The effect.** For a modern catalysed fuel-injected scooter the levels in smellable seconds may not hold. The
  smell itself may then be rarer, which this estimate cannot show.
- **Required.** This must be on any page that names a chemical, in the same view.

### A16. The tone of the computation report is acceptable (pass)

- **No numbers were tuned or dropped.** The plan was committed before the numbers, and the reproduction checks
  pass.
- **Two findings that cut against the owner's hoped-for message are reported plainly.** Benzene is not what people
  smell, and one red never reaches a reference value at the central estimate.
- **The lean is in the summary, not the computation.** It is in the choice of sentences in METHOD section 1 and in
  the headline (A3, A5, A7, A9).

## B. Statements a public website may make

Every statement carries "推估 / estimate, not a measurement" and a link to the method. Each needs the items listed
with it, shown in the same view, not only behind a link.

1. **"Benzene is not what you smell. It cannot be smelled at these levels: in our estimate it stays hundreds of
   times below its own smell threshold. The smell comes with benzene. It is not benzene."**
   Carry: the odour thresholds are old lab values and order of magnitude.

2. **"If the smell you notice is the exhaust of the idling scooters beside you, our estimate says that air also
   holds benzene, 1,3-butadiene, formaldehyde and other chemicals from the exhaust."**
   - Carry: the conditional "if"; the smell can come from other traffic or other sources; the shares come from
     older uncatalysed or carburetted engines, and modern catalysed scooters may differ.
   - Carry: in alphabetical order or a fixed non-hazard order, with each chemical's IARC group in a separate
     column; the meaning of the groups as hazard labels (strength of evidence, not risk); petrol-engine exhaust
     as a whole is Group 2B.
   - Do not name hydrogen cyanide until its 1-h comparison is done (A6).

3. **"At the moment the exhaust is just smellable, benzene is about 2 to 15 ppb (range about 0.4 to 60 ppb), as
   estimated for one ordinary scooter."**
   Carry:
   - the 8.5-fold spread comes from two 1967-70 car-exhaust odour figures;
   - this is a typical value, not a minimum;
   - there is no public reference value for seconds, so it cannot be called high or low;
   - these are amounts added to the existing air.

4. **"How often you can smell it depends on the wind."**
   - Wording to use: "With the wind blowing from a pack of idling scooters to the kerb (a minority of reds), it
     can be smellable for most of a red. In a street canyon with the wind along the street, in only some seconds,
     and in many reds not at all."
   - Carry: show both thresholds' shares (for example 76-97 % and 0-29 %); one simulated red per case; held wind;
     low to low-moderate confidence.

5. **"You can breathe benzene without smelling anything. No smell does not mean clean air. Carbon monoxide has no
   smell, and particles are too small to see."**
   Required on any page carrying statement 1 or 2.

6. **"Waiting through one red light does not, on its own, bring any of these chemicals to a 30-minute or 1-hour
   public reference level, in our central estimate."**
   - Carry: "in a rare near-calm case, standing half a metre downwind of one tailpipe, the worst case can"; the
     estimate is low confidence.
   - Do not turn this into "safe".

7. **"For someone who stays at the kerb through every red for an hour (a vendor, a police officer, a crossing
   guard), with the wind blowing from the scooters the whole time, benzene added by the scooters is estimated to
   be above California's 1-hour reference level (about 1 to 2 times at child height at the central estimate;
   range below to several times above)."**
   - Carry: the reference was derived from a longer exposure; the wind must be held for the whole hour, which is
     rare; the same simulated red every time; low confidence.
   - Carry: being above a reference level is not proof of harm; this says nothing about cancer risk.
   - This is already in the signed report. Do not add acrolein or formaldehyde to this sentence.

8. **(Detail table only, not the summary.)** The 1-h stay-through values for formaldehyde, acrolein, toluene,
   butadiene, styrene, xylenes and acetaldehyde, each above or below its reference.
   Carry for each row:
   - confidence (acrolein: car data only, very low);
   - the case label and how often its condition occurs (NF1: about 1 % of reds or fewer, upper-side);
   - "Taiwan indoor standard" or "WHO odour-annoyance guideline" where those are the reference.

## C. Statements a public website must not make

1. "When you smell scooter fumes you are breathing cancer-causing chemicals" or "the smell is benzene", or any
   wording that makes the smell itself carcinogenic, or that sets "smell" next to "causes cancer" in one sentence.
2. "One red light gives you cancer" or "raises your cancer risk", any cancer risk or "extra cases" number for a red,
   a day or a commute from these values, and the WHO "no safe level of benzene" next to any seconds-long or red
   value.
3. Any seconds-long or smellable-seconds level (statements 3 and 4, highest seconds, the "4-50 ppb", the 260-350
   ppb) placed next to a 30-min, 1-h, 8-h, annual or lifetime value, or called "x times the limit".
4. "Benzene, butadiene and formaldehyde (Group 1)" without the meaning of the group and without exhaust's own 2B,
   or a list ordered by IARC group. Equally, "exhaust is only possibly carcinogenic" without the components.
5. "You are smelling unburnt petrol, and petrol causes cancer (IARC 2025)". The model does not show petrol vapour
   at the nose. The 2025 Group 1 label is for the fuel.
6. "You smell acetaldehyde / formaldehyde / acrolein" as a finding. At most "probably part of what you smell", with
   the order-of-magnitude caution. Never quote only the lower threshold's percentage.
7. "Wherever you stand, when you can smell it you breathe 4-50 ppb benzene" as if confirmed across streets. Never
   quote any smellable-seconds level without the share of seconds and the condition beside it.
8. Any NF1-fine (near-calm single tailpipe) number in a headline, share card, summary sentence or first screen. Any
   "pushchair height 0.5 m".
9. "Acrolein is above the safe level" or any acrolein headline. "Formaldehyde exceeds Taiwan's standard" (that is
   an indoor standard). "Exceeds the WHO guideline" for toluene or styrene without "odour-annoyance".
10. "Harmful", "dangerous", "toxic dose" or "poison" for any of these levels. Hydrogen cyanide must not be named
    before its 1-h comparison (340 ug/m3 OEHHA acute REL) is done.
11. "If you can't smell it, the air is fine", or any wording that makes smell a safety test.
12. Any statement about modern catalysed scooters' chemical levels. The shares are from older engines.
13. Any number without its low-high range and "estimate (推估)".

## D. Changes requested in the package (no number changes)

1. METHOD-SMELL.md section 1: fix "pushchair height 0.5 m" (A8); add exhaust Group 2B and reorder the list (A5);
   give both thresholds in the own-odour list, and per-case ranges instead of, or flagged beside, the pooled median
   (A3); move NF1 and acrolein out of the short answer, or label them in the same line (A7, A9); add "no smell does
   not mean no benzene" (A1).
2. PLAN-SMELL.md section 5 and METHOD-SMELL.md section 6: HCN does have a 1-h value (OEHHA 340 ug/m3, CARB table
   2025). Add it to (d) and record the change under "Changes after the plan" (A6).
3. Replace "at least about this much is there" in the description of (c) with "typically about this much" (A1).
4. List the pooled "median over case-probe pairs" under "Changes after the plan" as a summary added after the
   numbers were seen (A3).
5. Optional: a background-air figure for benzene and aldehydes in Taiwanese streets, from a source that has been
   opened and read, so that the site can say "added to" with scale (A12).
