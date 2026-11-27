export const meta = {
  name: 'fumes-only-air-pictures',
  description: 'Redraw the air pictures with fumes only (no circles or dots): three trials, blind-reader judging, full implementation, re-render, review and fix',
  phases: [
    { title: 'Trial', detail: 'three fume-only directions on the key screens, in separate working copies', model: 'opus' },
    { title: 'Judge', detail: 'blind readers and a fidelity judge score the trials from screenshots', model: 'opus' },
    { title: 'Implement', detail: 'winning direction on every picture, film, cards, poster, copy, tests, docs', model: 'opus' },
    { title: 'Render and prove', detail: 'share cards, both films, full checks, live-address build and crawl', model: 'opus' },
    { title: 'Review', detail: 'regressions, first-time reader, facts and wording', model: 'opus' },
    { title: 'Fix', detail: 'fix confirmed findings, re-check, collect before/after pictures', model: 'opus' },
  ],
}

const S = '/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad'
const M = 'opus'

const COMMON = `
PROJECT: a bilingual (Traditional Chinese first, English second) public-service website for Taiwan about what pedestrians breathe beside idling petrol scooters at a red light. Astro static site. It is live at https://likelylabs.com/scooterair/. Readers are of all ages, from children to grandparents.

THE OWNER'S FEEDBACK (verbatim, about the pictures now live): "I still do not like the blue circles and dots - it's not immediately obvious they represent anything. But the orange fumes coming from the scooters are immediately relatable". Earlier feedback on the same marks: "what's up with all of the blue circles and black dots".

WHAT IS LIVE NOW: every air picture draws scooter exhaust as (1) one soft orange-brown plume per row of scooters with wavy orange ribbons (fuel vapour, the part you can smell), (2) blue rings with paper centres (carbon monoxide, no smell), (3) small dark dots (particles, too small to see), and a four-item key under each picture (AirLegend). Code: src/components/art/air.ts, air-slots.ts, AirLegend.astro, SceneFrame.astro, the scene components in src/components/art/, src/styles/art.css, the film in src/components/pages/film/, share-card art in src/components/art/card-art.ts, strings in src/i18n/art.ts, ui.ts and the page files. docs/redesign-brief.md section 5.1 describes the drawing as built. A picture of the live look: ${S}/rel2/show/cmp-tablet-s1-703-dark.png (right-hand side) and ${S}/rel2/show/cmp-home-s1-390-light.png.

THE DECISION ALREADY MADE: the circles and dots go, everywhere. Exhaust is drawn only as fumes coming out of the scooters (the orange-brown plume and its ribbons), because that is what a reader recognises at once. Nothing in a picture may be an abstract mark that needs a key to decode. What the fumes contain (fuel vapour you can smell; carbon monoxide that has no smell; particles too small to see) is told in plain words, not in floating symbols.

HARD RULES
- Work ONLY inside your own working copy named below. Never touch /home/user/scooterair. Never push. Never open a pull request.
- Commit on your working copy's branch. Every commit message ends with these two lines exactly:
  Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_011bucwSEfrKWuFWgaA6nCor
  Write no other model name anywhere (commits, code, docs).
- The machine has 4 CPUs and a long physics simulation (OpenFOAM) is running on it for another task. Never kill or renice processes you did not start. Run at most one heavy job (build, check-site, film render) at a time yourself.
- Facts and wording: carbon monoxide has "no smell" (沒有味道 / 聞不到); particles are "too small to see" (看不到), never "cannot be smelled". Never rank carbon monoxide, benzene and particles by harm. Never say or imply that one red light is dangerous. Every picture keeps its 示意圖 / Illustration tag, because the picture is not a measurement. The copy guard (npm run check-copy) and the claims policy must pass unchanged in strictness: do not loosen a rule or add to an allow-list to get a pass.
- Plain language for all ages: short sentences, everyday words, zh-TW (Taiwan usage, Traditional characters).
- Refer to people whose pronouns are unknown as "they".
- The home page has a length budget checked by "npm run check:site <dist>" check 9: zh at most 12,300 px and en at most 14,760 px at 360 px wide; single screens at most about 850 px zh / 1,020 px en. It is 12,192 / 14,200 now. Stay inside.
- Screenshots: node ${S}/air/shots.cjs <distDir> <outDir> [name-filter] photographs every air picture at 390 px (read its header comment for the hooks it needs; keep the hooks working or update a COPY of the script in your own folder). Build with: npx astro build --outDir <your dist dir> (default base path). Look at your own screenshots with the Read tool before you report; do not report a picture you have not looked at.
`

const TRIALS = [
  {
    key: 'a', name: 'Fumes and one line of words',
    brief: `Remove rings and dots completely. The plume and ribbons are the only exhaust marks; make them read clearly as fumes leaving each tailpipe and drifting to the people (in light AND dark mode), without turning the picture into a smog scene. More scooters = visibly more/denser/longer fumes. Replace the four-item key with ONE short line of words under the picture, for example 「廢氣裡有：油氣（聞得到）、一氧化碳（聞不到）、微粒（看不到）」 / "In the fumes: fuel vapour (you can smell it), carbon monoxide (no smell), particles (too small to see)". No symbol swatches except, if useful, one small plume swatch.`,
  },
  {
    key: 'b', name: 'Fumes with labels on the picture',
    brief: `Remove rings and dots completely. The plume and ribbons are the only exhaust marks. Instead of a key under the picture, put the words ON the picture where it matters: short labels with thin leader lines pointing into the fumes (as the pictures already do with 「↑ 機車排的氣」). On the screen that explains what is in the fumes (home screen 2 and /questions/smell/), three labels point into the same fume: 油氣：聞得到 / 一氧化碳：聞不到 / 微粒：看不到. Other pictures carry at most one label on the fume. No key at all. Labels must stay readable at 360 px and at the largest text size, and must not cover people.`,
  },
  {
    key: 'c', name: 'Fumes, plus one close-up',
    brief: `Remove rings and dots from every street picture; fumes only, and only a one-item caption if any. Then spend the explanation in ONE place: the picture on home screen 2 and /questions/smell/ becomes a close-up of the fume itself (for example a magnifying-glass circle or a cut-away band of the fume) that names its three parts in words right inside it: the part you smell (fuel vapour), the part with no smell (carbon monoxide), the part too small to see (particles). Draw the close-up so that it does not bring back abstract floating circles and dots across a scene; three labelled bands or zones of one fume is the idea. Every other picture relies on the reader having seen that close-up, or on plain words in the text beside it.`,
  },
]

const TRIAL_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    whatChanged: { type: 'array', items: { type: 'string' } },
    amountShownHow: { type: 'string' },
    shotsDir: { type: 'string' },
    keyShots: { type: 'array', items: { type: 'string' } },
    commit: { type: 'string' },
    problemsSeen: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'shotsDir', 'keyShots', 'commit'],
}

phase('Trial')
const trials = (await parallel(TRIALS.map(t => () => agent(`${COMMON}
YOUR JOB: build ONE trial of the fume-only picture. Trial ${t.key.toUpperCase()}: "${t.name}".
Working copy: ${S}/air2/wt-${t.key} (branch air2-${t.key}, node_modules present). Your output folder: ${S}/air2/trial-${t.key}/ (dist, shots).

DIRECTION
${t.brief}

SCOPE OF THE TRIAL (enough to judge, not the whole site): home screens 1, 2, 3, 4 and 9 (zh and en), and the picture on /questions/smell/. The film, share cards, poster and /estimate/ can stay untouched in the trial, but do not leave the build broken: npm run build must succeed and astro check must have 0 errors. Unit tests in src/components/art/__tests__ may be updated for what you changed.

ALSO SOLVE in your direction:
- Home screen 4 used the NUMBER of rings to show the estimate ("more rings = more carbon monoxide", three scenarios few/dozen/full). Without rings, the amount of fume must carry the three scenarios honestly (the number box above the picture gives the figure). Remove or rewrite any sentence that mentions rings (圈圈) or dots.
- Dark mode: the owner reads on an iPad in dark mode. The fume must look like fumes there, not like an orange floodlight.
- Colour-blind readers and greyscale print: the fume must still be visible against the street.

DELIVER: build to ${S}/air2/trial-${t.key}/dist, run the shots script into ${S}/air2/trial-${t.key}/shots, and ALSO take with Playwright (require('playwright') works; chromium.launch() needs no options; deviceScaleFactor 1 is fine) full-screen shots of home screens 1, 2 and 4 in zh at 390x844 light and at 703x900 dark into the same folder, named s1-390-light.png, s2-390-light.png, s4-390-light.png, s1-703-dark.png, s2-703-dark.png, s4-703-dark.png, plus smell-390-light.png for the /questions/smell/ picture. Look at them. Fix what looks wrong. Commit. Report the absolute paths of the seven named shots in keyShots, and be frank in problemsSeen about anything still weak.`,
  { label: `trial:${t.key}`, phase: 'Trial', model: M, schema: TRIAL_SCHEMA }).then(r => r && { ...r, key: t.key, name: t.name })))).filter(Boolean)

if (!trials.length) return { error: 'no trial finished' }
log(`${trials.length} trial(s) built: ${trials.map(t => t.key).join(', ')}`)

phase('Judge')
const shotList = trials.map(t => `Design ${t.key.toUpperCase()}:\n${(t.keyShots || []).join('\n')}\n(more in ${t.shotsDir})`).join('\n\n')
const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    perDesign: { type: 'array', items: { type: 'object', properties: {
      key: { type: 'string' }, score: { type: 'number' }, whatISee: { type: 'string' }, unclear: { type: 'array', items: { type: 'string' } }, good: { type: 'array', items: { type: 'string' } },
    }, required: ['key', 'score', 'whatISee'] } },
    best: { type: 'string' },
    graft: { type: 'array', items: { type: 'string' } },
  },
  required: ['perDesign', 'best'],
}
const READERS = [
  { id: 'child', who: 'a 10-year-old in Taiwan who walks to school and has never seen this site' },
  { id: 'elder', who: 'a 70-year-old grandparent in Taiwan with weak eyesight who reads on an iPad in dark mode and has never seen this site' },
  { id: 'parent', who: 'a busy parent in Taiwan glancing at each screen for three seconds on a phone, who has never seen this site' },
]
const judges = (await parallel([
  ...READERS.map(r => () => agent(`You are judging pictures for a public-service website in Taiwan about scooter exhaust at red lights. Read as ${r.who}. You have NOT been told what any mark in the pictures means; do not open any source code or documents, only the image files listed. Use the Read tool on every listed image.

For each design, first write down plainly what you see and what you think each thing in the picture stands for (whatISee). Then list anything you could not work out within a few seconds (unclear) and what worked (good). Score each design 0-10 for: "I understand at once that fumes come out of the scooters and reach the people, I am not left wondering what some mark means, and where the screen is meant to tell me what is in the fumes I get that too". A mark you cannot explain costs points. Then name the best design (its letter) and list ideas from the others worth grafting onto it.

The owner of the site disliked earlier versions because blue circles and dark dots floated in the picture and "it's not immediately obvious they represent anything", while "the orange fumes coming from the scooters are immediately relatable". If any design still has marks like that, say so.

${shotList}`, { label: `judge:${r.id}`, phase: 'Judge', model: M, schema: JUDGE_SCHEMA })),
  () => agent(`${COMMON}
YOUR JOB: fidelity judge for three trial designs of the fume-only picture. You may read code and docs. For each design look at every listed image (Read tool) and check: (1) no circles, dots or other abstract marks remain in the trial screens; (2) the picture does not claim more than the site's facts: the 示意圖 tag is there, the three scenarios on screen 4 differ honestly (the estimate is +0.05 / +0.3 / +1 ppm carbon monoxide; the fume must grow with it but must not suggest a wall of poison), people are not shown choking; (3) the words that say what is in the fumes follow the wording rules above; (4) dark mode and a greyscale rendering still show the fume; (5) nothing is clipped or overlapping at 390 px. Score each 0-10 for fidelity and craft (use the field score), put the problems in unclear, strengths in good, and what you see in whatISee. Name the best and list grafts.

Trials (working copies ${S}/air2/wt-a, wt-b, wt-c; branches air2-a, air2-b, air2-c):
${shotList}`, { label: 'judge:fidelity', phase: 'Judge', model: M, schema: JUDGE_SCHEMA }),
])).filter(Boolean)

const tally = {}
for (const t of trials) tally[t.key] = { sum: 0, n: 0, best: 0 }
for (const j of judges) {
  for (const d of j.perDesign || []) { const k = String(d.key || '').toLowerCase().slice(-1); if (tally[k]) { tally[k].sum += Number(d.score) || 0; tally[k].n++ } }
  const b = String(j.best || '').toLowerCase().replace(/[^abc]/g, '').slice(-1); if (tally[b]) tally[b].best++
}
const ranked = Object.entries(tally).map(([k, v]) => ({ key: k, mean: v.n ? v.sum / v.n : 0, best: v.best })).sort((x, y) => (y.mean - x.mean) || (y.best - x.best))
const winner = ranked[0].key
log(`Judging: ${ranked.map(r => `${r.key.toUpperCase()} ${r.mean.toFixed(1)} (${r.best} firsts)`).join(', ')}. Building on ${winner.toUpperCase()}.`)
const judgeNotes = JSON.stringify(judges, null, 1).slice(0, 24000)
const trialNotes = JSON.stringify(trials.map(t => ({ key: t.key, name: t.name, summary: t.summary, amountShownHow: t.amountShownHow, problemsSeen: t.problemsSeen })), null, 1)

phase('Implement')
const impl = await agent(`${COMMON}
YOUR JOB: implement the fume-only picture on the WHOLE site, starting from the winning trial.
Working copy: ${S}/air2/wt-final (branch air2-final, node_modules present). Start by bringing in the winner: git merge --no-edit air2-${winner} (it is a branch in the same repository). Output folder: ${S}/air2/final/.

Judging result (mean score, firsts): ${JSON.stringify(ranked)}. Winner: trial ${winner.toUpperCase()}.
Trial notes:
${trialNotes}
Judges' notes (use them: fix what readers found unclear in the winner, graft what they asked for from the others when it does not bring back abstract marks):
${judgeNotes}

DO ALL OF THIS
1. Every picture that drew rings or dots now draws fumes only: all scene components in src/components/art/ (HeroStreet, KerbScene, HeightsScene, RiderScene, MaskScene, SwapScene, TenScooters, TailpipeMarks, BodyFigure if it floats rings/dots, AirRange, air-slots, parts), the pictures on /estimate/ (including the two counting patches: replace them with something that needs no decoding, or remove them if the charts beside them already say it), /evidence/, /act/ art, the print poster and brief, the 404 page if it has art, the film (src/components/pages/film/: scene.ts, Film.astro, timeline.ts; it animated ring/dot halo pairs: animate the fumes instead, drifting from the tailpipes to the people, and keep or improve the film's polish) and the share-card art (src/components/art/card-art.ts). For electric scooters: no exhaust fume at all; if tyre dust or car exhaust was shown with dots, show it as a small grey puff with a word label, or leave it to the text.
2. The mask picture: what passes through a surgical mask must be shown without dots and rings too (for example fumes passing through and round the mask, with words).
3. Words: remove or rewrite every reader-facing sentence, alt text, key item, caption and film caption that mentions rings (圈圈), circles, dots (點) or the old key, in zh and en (src/i18n/**, src/data/estimate.ts, answers.ts, questions.ts, home.ts, film.ts, art.ts, ui.ts). Alt texts must describe the new pictures truthfully.
4. Code hygiene: delete what is now dead (ring/dot builders, halo CSS, key items, tokens) unless something still uses it; update src/components/art/__tests__ so the tests assert the new rules (for example: no element with class air-ring or air-dot in any scene output; fume strength grows few < dozen < full; electric scenes have no fume). Update scripts/check-site.mjs if a check referred to the old marks (keep every check at least as strict).
5. Docs: docs/redesign-brief.md section 5.1 and any other place that describes the drawing, as built; README if it mentions the marks; add a line to the /about/ corrections or changes log only if that log records design changes (look at how it is used).
6. Do NOT render the film MP4s or the share cards here (the next step does). Do keep "npm run check" passing except for the two "out of date" render checks, and "npm run check:site" passing on a fresh build.
7. Take screenshots with the shots script into ${S}/air2/final/shots and look at every one. Also check 320 px width, the largest text size, dark mode and a 703x900 tablet for the home screens.

Commit when done (tree clean). Report what you changed, what you removed, anything you were unsure about, and the commit.`,
  { label: 'implement', phase: 'Implement', model: M, schema: {
    type: 'object',
    properties: { summary: { type: 'string' }, changed: { type: 'array', items: { type: 'string' } }, removed: { type: 'array', items: { type: 'string' } }, unsure: { type: 'array', items: { type: 'string' } }, checks: { type: 'string' }, heights: { type: 'string' }, commit: { type: 'string' } },
    required: ['summary', 'commit'],
  } })

phase('Render and prove')
const prove = await agent(`${COMMON}
YOUR JOB: render and prove the fume-only release.
Working copy: ${S}/air2/wt-final (branch air2-final). Output folder: ${S}/air2/final/.
The implementer reported: ${JSON.stringify(impl).slice(0, 6000)}

1. Re-render all share cards: node scripts/build-share-cards.mjs (then --check). Look at a contact sheet of all cards at about 320 px wide: no rings or dots, fumes readable at preview size, headline readable.
2. Re-render the film in both languages: node scripts/film-export.mjs (read the script's usage first; it takes roughly 10 to 20 minutes per language, longer while the simulation is running; run it in the background with a generous timeout and wait for it; never commit while a render is running; commit the two MP4s only as a complete set). Then --check. Extract about 8 frames across each film (ffmpeg is used by the export script, so it is available) and look at them: fumes animate from the scooters toward the people, no rings or dots, captions do not mention rings or dots, nothing covers faces or the counter.
3. npm run check must exit 0 (all parts). Build fresh and run npm run check:site <dist>: all checks pass.
4. Live-address build: SITE_URL=https://likelylabs.com BASE_PATH=/scooterair npx astro build --outDir ${S}/air2/final/site/scooterair. Crawl it in a browser (a crawl script exists at ${S}/rel2/tools/crawl.cjs with its common.cjs; copy and adapt it into ${S}/air2/final/tools/ rather than editing it in place): 0 page errors, 0 failed requests, 0 missing assets, exactly one og:image per page.
5. Search the built HTML of every page (zh and en) for leftovers: class names air-ring / air-dot, the words 圈圈, "rings", "circles", "dots" used about the picture. Report every hit and fix those that are real leftovers.
Fix anything you find that is broken and small; report anything bigger. Commit (tree clean, no render running).`,
  { label: 'render-and-prove', phase: 'Render and prove', model: M, schema: {
    type: 'object',
    properties: { cards: { type: 'string' }, film: { type: 'string' }, npmCheck: { type: 'string' }, siteChecks: { type: 'string' }, crawl: { type: 'string' }, leftovers: { type: 'array', items: { type: 'string' } }, fixed: { type: 'array', items: { type: 'string' } }, open: { type: 'array', items: { type: 'string' } }, distDir: { type: 'string' }, commit: { type: 'string' } },
    required: ['npmCheck', 'siteChecks', 'commit'],
  } })

phase('Review')
const FIND = {
  type: 'object',
  properties: { findings: { type: 'array', items: { type: 'object', properties: {
    severity: { type: 'string', enum: ['blocker', 'should-fix', 'nit'] }, where: { type: 'string' }, what: { type: 'string' }, evidence: { type: 'string' }, suggestion: { type: 'string' },
  }, required: ['severity', 'where', 'what'] } }, verdict: { type: 'string' } },
  required: ['findings', 'verdict'],
}
const reviews = (await parallel([
  () => agent(`${COMMON}
YOUR JOB: regression review of the fume-only release. READ-ONLY on the working copy ${S}/air2/wt-final (do not edit or commit there); write your own scripts and screenshots under ${S}/air2/review-regressions/. Build it yourself to ${S}/air2/review-regressions/dist (npx astro build --outDir ...). The previous release is live at https://likelylabs.com/scooterair/ for comparison.
Check in a real browser (Playwright), zh and en: every page with a picture at 320, 360, 390, 703x900 (tablet upright, dark) , 1024x768 and 1440x900; light and dark; text sizes 標準/大/特大; JavaScript off; reduced motion; print. Look for: any ring or dot left anywhere (pictures, film player, share cards in public/share, poster), fumes that vanish in dark mode or greyscale, fumes covering faces, labels or number boxes, labels clipped or overlapping, sideways scroll, the scenario switch on home screen 4 not changing the fume, the film player broken, home page over its length budget, anything the previous release did that this one no longer does. Look at your screenshots. Report findings with a screenshot path as evidence.`, { label: 'review:regressions', phase: 'Review', model: M, schema: FIND }),
  () => agent(`You are a first-time reader in Taiwan. You have not been told what anything in the pictures means. Do not read source code or project documents. A build of a website is at ${S}/air2/final/site/scooterair (static files; serve the parent folder ${S}/air2/final/site with any static server so that the site is at /scooterair/, or use the build the previous step reported: ${prove.distDir || ''}). Use Playwright (require('playwright') works, chromium.launch() needs no options) to open the home page in Chinese and English at 390x844 (light) and 703x900 (dark), go through all 15 screens, and also open /questions/smell/, /questions/mask/, /estimate/ and /90/ (the short film: step through it). Take screenshots into ${S}/air2/review-reader/ and LOOK at each with the Read tool.
Read first as a 10-year-old, then as a 70-year-old with weak eyesight. For each picture write what you think it shows. Report as findings: any mark, shape or colour whose meaning you could not work out in a few seconds; any place where the words beside a picture talk about something the picture does not show (or the reverse); any sentence that is hard for a child; anything that looks unfinished. The site's owner disliked earlier versions because blue circles and dark dots floated in the pictures and meant nothing at a glance, while the orange fumes from the scooters were immediately clear. Say plainly whether that complaint is now answered.`, { label: 'review:blind-reader', phase: 'Review', model: M, schema: FIND }),
  () => agent(`${COMMON}
YOUR JOB: facts-and-wording review of the fume-only release. READ-ONLY on ${S}/air2/wt-final; notes under ${S}/air2/review-facts/. Run: git -C ${S}/air2/wt-final diff origin/main --stat and read the diff of every reader-facing string (src/i18n/**, src/data/**, alt texts, film captions, share-card lines, docs/redesign-brief.md 5.1).
Check: (1) no sentence still mentions rings, circles, dots or the old four-item key; (2) nothing now says or implies particles "cannot be smelled", nothing ranks the pollutants by harm, nothing implies one red light is dangerous; (3) every picture still carries the 示意圖 / Illustration tag and the tag text is true of the new drawing; (4) the three scenarios on home screen 4 and on /estimate/ still match the signed estimate in research/estimate/results.txt and src/data/estimate.ts, and the picture does not exaggerate them; (5) alt texts describe the new pictures truthfully in both languages; (6) zh and en say the same thing; (7) the copy guard and claims policy were not loosened (compare scripts/check-copy.mjs, src/data/claims-policy.ts and src/i18n/copy-allowlist.json with origin/main); (8) unit tests still test something real.`, { label: 'review:facts', phase: 'Review', model: M, schema: FIND }),
])).filter(Boolean)

const findings = reviews.flatMap(r => r.findings || [])
log(`Review: ${findings.filter(f => f.severity === 'blocker').length} blocker(s), ${findings.filter(f => f.severity === 'should-fix').length} should-fix, ${findings.filter(f => f.severity === 'nit').length} nit(s)`)

phase('Fix')
const fix = await agent(`${COMMON}
YOUR JOB: final fixer for the fume-only release.
Working copy: ${S}/air2/wt-final (branch air2-final). Output folder: ${S}/air2/final/ and ${S}/air2/show/.

Three reviewers reported these findings. Confirm each yourself before acting (reproduce it; a finding you cannot reproduce is declined with the reason). Fix every confirmed blocker and should-fix, and the nits that are cheap. Do not bring back rings, dots or any abstract mark that needs a key.
${JSON.stringify(reviews, null, 1).slice(0, 60000)}

Then:
1. If you changed anything that feeds the share cards or the film, re-render them (cards: node scripts/build-share-cards.mjs; film: node scripts/film-export.mjs, 10 to 20+ minutes per language; commit only complete sets, never during a render).
2. npm run check exits 0. Fresh build + npm run check:site <dist>: all pass. Live-address build (SITE_URL=https://likelylabs.com BASE_PATH=/scooterair npx astro build --outDir ${S}/air2/final/site/scooterair) and crawl: 0 errors, one og:image per page.
3. Make before/after pictures for the owner in ${S}/air2/show/ ("before" = the live site https://likelylabs.com/scooterair/, "after" = this build), side by side in one PNG each with BEFORE / AFTER titles: home screen 1 at 703x900 dark (cmp-s1-703-dark.png) and 390 light (cmp-s1-390-light.png), home screen 2 (cmp-s2-390-light.png), home screen 4 with the "full" scenario (cmp-s4-390-light.png), the mask picture (cmp-mask-390-light.png), a row of 4 share cards (cmp-cards.png), and 4 film frames after only (after-film-frames.png). Look at each.
4. Commit (tree clean, no render running). Report honestly: what was fixed, what was declined and why, the final check results, home page heights, the picture paths, the final commit, whether it is ready to publish, and what is still open.`,
  { label: 'fix', phase: 'Fix', model: M, schema: {
    type: 'object',
    properties: { fixed: { type: 'array', items: { type: 'string' } }, declined: { type: 'array', items: { type: 'object', properties: { finding: { type: 'string' }, why: { type: 'string' } }, required: ['finding', 'why'] } }, rerendered: { type: 'string' }, npmCheck: { type: 'string' }, siteChecks: { type: 'string' }, liveAddressBuild: { type: 'string' }, heights: { type: 'string' }, shots: { type: 'array', items: { type: 'string' } }, commit: { type: 'string' }, ready: { type: 'boolean' }, stillOpen: { type: 'array', items: { type: 'string' } } },
    required: ['fixed', 'npmCheck', 'siteChecks', 'commit', 'ready'],
  } })

return { ranked, winner, trials: trials.map(t => ({ key: t.key, name: t.name, summary: t.summary, commit: t.commit })), impl, prove, reviewVerdicts: reviews.map(r => r.verdict), fix }
