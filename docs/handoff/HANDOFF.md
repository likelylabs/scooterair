# Handoff: continue this work on another machine

Written 2026-11-27 from a cloud session that was stopped mid-task. Everything that session produced and had not
published is in this branch (`claude/nifty-newton-dfbvu2`). `main` is what is live at
https://likelylabs.com/scooterair/ (last merge: pull request 6, "Update 2").

> **Update, later on 2026-11-27.** Jobs 2.1 (fume-only pictures, trial B won) and 2.2 (simulation on the site) are
> finished and are in this branch as built pages, share cards and films. The research for 2.3 is finished and signed in
> `research/simulation/smell-chemicals/` (read `ANSWER-SMELL.md` and `statements-smell.json`). Still open: putting the
> 2.3 statements on the pages, then showing the owner and asking before the merge. The patches and trial shots in this
> folder are now history.

This folder is working material. Delete `docs/handoff/` before the branch is merged to `main`.

## 1. What is in this branch that is not on `main`

| Path | What it is | State |
|---|---|---|
| `research/simulation/` | The 3-D air-flow simulation of idling scooters at a kerb (OpenFOAM large-eddy simulation), its plan, method, signed answer, final numbers, allowed and forbidden statements, verification notes, figures | Finished and signed. Not yet on any page of the site |
| `docs/handoff/patches/fumes-trial-a.patch` | Picture trial A: fumes only, one line of words under the picture | Built and committed in the cloud; applies cleanly to `main` |
| `docs/handoff/patches/fumes-trial-b.patch` | Picture trial B: fumes only, labels with leader lines on the picture | Built, checked (18 site checks pass), applies cleanly to `main` |
| `docs/handoff/patches/fumes-trial-c-unfinished.patch` | Picture trial C: fumes only, plus one close-up that names the three parts | Stopped before its author finished; applies cleanly to `main`, not checked |
| `docs/handoff/trial-shots/{a,b,c}/` | Seven screenshots per trial (home screens 1, 2, 4 at 390 px light and 703 px dark, and the smell page) | For judging the trials |
| `docs/handoff/workflows/` | The orchestration scripts of the three jobs, the screenshot script and the crawl script | Reference. They contain cloud paths (`/tmp/claude-0/...`) that must be replaced |

Apply a trial with `git apply docs/handoff/patches/fumes-trial-b.patch` on a branch cut from `main`.

Not saved anywhere: the raw simulation cases (meshes and flow fields, about 11 GB). The per-second series and all
statistics are kept in `research/simulation/results/<case>/stats.json.gz` (run `gunzip -k` before using the
scripts that read `stats.json`). Re-running a case needs OpenFOAM v2506; install steps are in
`research/simulation/cfd-template/README.md` (Ubuntu; on macOS use a Linux container).

## 2. Open work, in the order the owner raised it

### 2.1 Pictures: fumes only, no circles or dots (owner request, not finished)

The owner's words about the pictures now live: "I still do not like the blue circles and dots - it's not
immediately obvious they represent anything. But the orange fumes coming from the scooters are immediately
relatable". Earlier: "what's up with all of the blue circles and black dots".

Decision taken: the blue rings (carbon monoxide) and dark dots (particles) go from every picture, the film and the
share cards. Exhaust is drawn only as fumes leaving the scooters. What the fumes contain is said in words:
fuel vapour you can smell, carbon monoxide that has no smell, particles too small to see. Nothing in a picture may
be an abstract mark that needs a key.

Where it stopped: three trials were built on home screens 1, 2, 3, 4, 9 and `/questions/smell/`. The judging
(blind readers: a 10-year-old, a 70-year-old on a tablet in dark mode, a parent glancing for three seconds; plus a
fidelity judge) had not started. A first look by the previous session, not a verdict: trial B's screen 2 (three
labels pointing into one fume) reads well; trial A's one-line caption is the lightest; trial C's close-up band
names the parts clearly but is unfinished.

Still to do after choosing: every scene in `src/components/art/`, the mask picture, `/estimate/` counting patches,
the film (`src/components/pages/film/`, which animated ring and dot pairs), share-card art
(`src/components/art/card-art.ts`), the poster, all alt texts and any sentence that mentions rings (圈圈) or dots,
unit tests, `docs/redesign-brief.md` section 5.1; then re-render the 28 share cards and both film MP4s, run all
checks, review, and show the owner before and after pictures. The full job description is in
`docs/handoff/workflows/fumes-only-air-pictures.js`.

### 2.2 Simulation results onto the site (not started)

Read `research/simulation/ANSWER.md`, `statements.json` and `results-simulation.json` first. In short:

- For a pedestrian waiting at a red light on an open street, carbon monoxide stays below the WHO 15-minute value
  (87 ppm) in every simulated case. One red adds about 0.1 to 4 ppm to a 15-minute average. Standing through every
  red for 15 minutes with the wind held from the scooters gives about 3 to 16 ppm.
- One low-confidence exception: a pushchair about half a metre directly downwind of one idling tailpipe, in
  near-still air that keeps its direction, through every red for 15 minutes, can pass 87 ppm (about 1 in 10 to
  1 in 5 such periods).
- Above their own line: the smell (downwind, above what people can smell in most seconds of the red), second-long
  carbon monoxide bursts (usually 5 to 30 ppm at half a metre; 100 to 300 ppm with held or near-still wind), and
  benzene for people who stay an hour (about 1 to 4 times California's 1-hour reference).
- Pushchair height can get about twice the adult-nose level when the wind blows from the scooters to you.
- Enclosed places with dozens of idling scooters could reach the guideline; not simulated.
- Confidence is low to moderate: one simulated red per case, several assumptions.

The owner had written: "I can guarantee it's not below the guideline - the estimate needs to show above the
guideline, it smelled HORRIBLE. you need to do the physics simulations". They were told the result would be
reported whichever way it came out and would not be tuned, and they have been given the result above.

Planned for the site (job description in `docs/handoff/workflows/simulation-onto-site.js`): home screen 5 says the
smell is real and why that does not mean carbon monoxide is over the line, then gives bursts, pushchair height and
people who stay; a new section on `/estimate/` with charts (second-by-second bursts; like with like against the
15-minute value, including the exception; what is above its own line; heights); the question pages; corrections to
`research/estimate/METHOD.md` sections 8 and 9; registry and source entries; an `/about/` log entry. Only
statements on the allowed list, each with its 推估 / Estimate label, range and condition; none of the "must not"
statements.

### 2.3 New request: the harmful chemicals that come with the smell (not started)

The owner's words: "we should also simulate the harmful chemicals that are present when we smell the unburnt
fuel - that is what people will notice - and if we can associate that with things such as benzene or other
cancerous chemicals - it will be an effective message".

Notes for whoever picks this up:

- The simulation carries unit exhaust tracers, so any chemical follows from its share of the exhaust without new
  flow runs. Hydrocarbons and benzene are already computed. The per-second series are in the `stats.json.gz` files.
- The useful new output is a co-occurrence statement: in the seconds when the fumes are above the smell threshold,
  how much benzene (and, where idle data exist, toluene, 1,3-butadiene, formaldehyde, acetaldehyde) is at the nose,
  with ranges. This needs a speciation table for idling four-stroke scooters with a source for every share
  (the estimate already uses yao-2008 and tsai-2018 for benzene; `METHOD.md` says no idle aldehyde data for
  scooters were found, so that part needs a literature search first).
- The honest framing is "when you can smell it, these are in it", which the sources support. The site must still
  not say that one red light causes cancer, must not rank the pollutants by harm, and keeps the WHO line that no
  safe level of benzene can be named. Smell thresholds rest on 1960s to 70s car-exhaust studies; say so.

### 2.4 Smaller items carried over

- The buy-price screen says the petrol promotion runs to 30 November 2026; prices and subsidies need a re-check
  after that date.
- English `/estimate/` and `/evidence/` are long (over 15,000 px at 360 px wide).
- Lone last-line characters in body text on several pages; `check-site` does not measure them.
- English film at 0:26: the estimate box covers part of the red-light counter.
- On X, a long link title can overlap the "Illustration" plate on a share card.
- Subsidies for Hualien, Taitung, Penghu and Lienchiang are unconfirmed.
- Never tested on a physical phone or tablet.
- The repository history holds three downloaded PDFs; this matters only if the repository is made public.
- Unanswered by the owner (defaults in use): whether the repository will be public; contact, licence and funding
  statements.

## 3. Standing rules from the owner and the project

- The goal, in the owner's words: "make this a polished, complete, and easy to read website for people of all ages
  in taiwan. No data should be missing, the video should have some polish and animations, and there should be no
  placeholders". Push hard on health impacts to pedestrians, present each link of the chain, help people get as
  close to price parity as possible, and talk about operating costs.
- Traditional Chinese (Taiwan usage) first, English second. Short sentences, everyday words.
- Ask the owner before each merge to `main`: a merge publishes to the live site.
- Show the owner before and after pictures. They review on an upright tablet in dark mode (about 703 CSS px wide),
  so check that view first.
- Every figure that is not measured carries 推估 / Estimate and its range. Carbon monoxide has "no smell"; particles
  are "too small to see". Never rank carbon monoxide, benzene and particles by harm. Never say one red light is
  dangerous. Every picture keeps its 示意圖 / Illustration tag.
- Do not loosen the copy guard, the claims policy or an allow-list to get a pass.
- Home page length budget (`check:site` check 9): 12,300 px zh and 14,760 px en at 360 px wide. It is 12,192 and
  14,200 on `main`.

## 4. Commands

```
npm ci
npm run check                      # data, copy guard, 130 + 76 tests, cards and film current, astro check
npx astro build --outDir /tmp/dist && npm run check:site /tmp/dist      # 18 site checks
SITE_URL=https://likelylabs.com BASE_PATH=/scooterair npx astro build   # the live-address build
node scripts/build-share-cards.mjs          # 28 cards; --check to verify
node scripts/film-export.mjs                # both MP4s, 10 to 20 minutes each; --check to verify
```

Commit rendered cards and films only as complete sets, never while a render is running. Publishing is the
"Build and deploy" GitHub Actions workflow on `main`.

## 5. Prompt to restart on another machine

Paste this into a new session opened in a clone of the repository:

> Check out branch `claude/nifty-newton-dfbvu2` and read `docs/handoff/HANDOFF.md` in full, then
> `research/simulation/ANSWER.md` and `research/simulation/statements.json`. Continue the three open jobs in
> section 2 of the handoff, using parallel subagents where the work is independent:
>
> 1. Fume-only pictures: look at `docs/handoff/trial-shots/`, have blind readers judge trials A, B and C, apply the
>    winner's patch on a branch from `main`, then carry it through every picture, the mask page, the film and the
>    share cards, and re-render.
> 2. Put the simulation results on the site, using only the allowed statements with their labels, ranges and
>    conditions.
> 3. Work out which harmful chemicals are at the nose in the seconds when the fumes can be smelled (benzene first,
>    then others with idle data), from the saved per-second series plus a sourced speciation table, and add that to
>    the site as an estimate.
>
> Follow the standing rules in section 3. Run `npm run check` and the site checks before showing me anything. Show
> me before and after pictures at tablet width in dark mode, and ask me before merging to `main`. Delete
> `docs/handoff/` in the last commit before the merge.
