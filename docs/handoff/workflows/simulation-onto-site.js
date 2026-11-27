export const meta = {
  name: 'simulation-onto-site',
  description: 'Put the 3-D simulation results on the site: plan, adversarial check of the plan, implement, prove, review, fix',
  phases: [
    { title: 'Plan', detail: 'where each simulation statement goes, exact wording in zh and en, chart specs', model: 'opus' },
    { title: 'Challenge', detail: 'three sceptics try to break the plan: fidelity, plain language, the owner\'s question', model: 'opus' },
    { title: 'Implement', detail: 'pages, charts, registry, sources, research files, method corrections', model: 'opus' },
    { title: 'Prove', detail: 'full checks, site checks, live-address build and crawl', model: 'opus' },
    { title: 'Review', detail: 'numbers against the signed results, first-time reader, regressions', model: 'opus' },
    { title: 'Fix', detail: 'fix confirmed findings, re-check, collect pictures', model: 'opus' },
  ],
}

const S = '/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad'
const WT = `${S}/simsite/wt`
const OUT = `${S}/simsite`
const M = 'opus'

const COMMON = `
PROJECT: a bilingual (Traditional Chinese first, English second) public-service website for Taiwan about what pedestrians breathe beside idling petrol scooters at a red light. Astro static site, live at https://likelylabs.com/scooterair/. Readers are of all ages. The site's goal is to make people see the exhaust chain link by link and move toward electric scooters, using only what its sources and signed estimates support.

BACKGROUND. The site publishes a signed kerbside ESTIMATE (推估) in research/estimate/ (90-second averages; a dozen scooters add about 0.05 / 0.3 / 1 ppm carbon monoxide). Home screen 5 says carbon monoxide is far below the WHO guideline, and that exhaust holds more than carbon monoxide. The owner, who has stood at these red lights, wrote: "I can guarantee it's not below the guideline - the estimate needs to show above the guideline, it smelled HORRIBLE. you need to do the physics simulations". The owner was told the simulation would be reported whichever way it came out, and would not be tuned.

THE SIMULATION IS DONE AND SIGNED. A 3-D large-eddy simulation (OpenFOAM) with adversarial verification. Its files are in this working copy, untracked for now: research/simulation/ANSWER.md (the answer in plain words), METHOD.md, PLAN.md, results-simulation.json (final numbers with low/central/high, condition, likelihood, confidence), statements.json (the statements the site MAY make, each with what it must carry, and the statements it MUST NOT make), sources.json, figures/, verify-*/ and corrections/. READ ANSWER.md, statements.json and results-simulation.json in full before anything else. In short:
- For a pedestrian waiting at a red light on an open street, carbon monoxide stays below the WHO 15-minute value (87 ppm) in every simulated case: one red adds about 0.1-4 ppm to a 15-minute average; standing through every red for 15 minutes with the wind held from the scooters gives about 3-16 ppm.
- One low-confidence exception: a pushchair about half a metre directly downwind of one idling tailpipe, in near-still air that keeps its direction, through every red for 15 minutes, can pass 87 ppm (about 1 in 10 to 1 in 5 such periods).
- Things that ARE above their own line: the smell (downwind, above what people can smell in most seconds of the red), second-long carbon monoxide bursts (usually 5-30 ppm at half a metre, 100-300 ppm with held or near-still wind), and benzene for people who stay an hour (about 1-4 times California's 1-hour reference).
- Pushchair height can get about twice the adult-nose level when the wind blows from the scooters to you.
- Only enclosed places (underground parks, underpasses, covered waiting areas with dozens of idling scooters) could generally reach the guideline; not simulated.
- Confidence is low to moderate; one simulated red per case; several assumptions.

HARD RULES
- Work ONLY in the working copy ${WT} (branch simsite, node_modules present) and your output folder under ${OUT}/. Never touch /home/user/scooterair. Never push. Never open a pull request.
- Every commit message ends with these two lines exactly, and no other model name appears anywhere:
  Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_011bucwSEfrKWuFWgaA6nCor
- Only statements listed in statements.json as allowed, each with what it "mustCarry" (the 推估 / Estimate label, its range, its condition). None of the "must not" statements, in any wording, in any picture, chart, alt text or share text. Never set a 1-second, 10-second or 90-second value beside a 15-minute or 1-hour guideline without conversion. No health-effect or safety claim from one red. Never rank carbon monoxide, benzene and particles by harm. Carbon monoxide has "no smell"; particles are "too small to see".
- Do not tune or re-interpret numbers. If a number on the site would differ from results-simulation.json, the file wins.
- The copy guard (npm run check-copy), claims policy and data checks keep their strictness: no loosened rule, no allow-list entry added just to pass. New facts go into the fact registry (src/data/) the way existing estimate facts do, with a read level that says "simulation estimate", and new sources go into the sources registry.
- Plain language for all ages: short sentences, everyday zh-TW words (Taiwan usage), one idea per line on the home page. A 10-year-old and a 70-year-old must both follow it.
- ANOTHER JOB IS RUNNING in a different working copy: it removes the blue rings and dark dots from every picture so that exhaust is drawn only as orange fumes, and it re-renders the film and share cards. To keep the two jobs mergeable: do NOT edit src/components/art/**, src/styles/art.css, src/components/pages/film/**, public/film/**, public/share/**, scripts/film-export.mjs or scripts/build-share-cards.mjs, do not add or change scene pictures, and write no sentence that mentions rings, circles, dots or a picture key. New visuals from you are CHARTS only (built like the existing charts in src/components/charts/, site styling, light and dark, readable at 320 px, with a text alternative). If a film caption or share-card line is now contradicted by the simulation, do not change it: report it.
- Home page length budget, checked by "npm run check:site <dist>" check 9: zh at most 12,300 px and en at most 14,760 px at 360 px wide; single screens at most about 850 px zh / 1,020 px en. It is 12,192 / 14,200 now, so home-page additions must be paid for by cuts on the same screen. Long material belongs on /estimate/ (in folds) and the question pages.
- The machine has 4 CPUs shared with the other job. Run at most one heavy job (build, check-site) at a time. Never kill processes you did not start.
- Refer to people whose pronouns are unknown as "they".
`

phase('Plan')
const plan = await agent(`${COMMON}
YOUR JOB: write the plan for putting the simulation on the site. Do not edit the site yet. Read the simulation files named above, then the pages as built: src/i18n/pages/home.ts (screens 2, 4, 5, 9), src/pages/[...lang]/estimate.astro and src/i18n/pages/estimate.ts, src/data/estimate.ts, the question pages (src/i18n/pages/questions.ts, src/data/answers.ts: smell, one-red-light, my-child, beside-me, how-much), /evidence/, /about/ (its corrections log), research/estimate/METHOD.md sections 8 and 9, docs/redesign-brief.md (sections 4.4, 6, 12.4) and scripts/check-copy.mjs + src/data/claims-policy.ts.

Write ${OUT}/PLAN-SITE.md and return its content summarised in the fields. The plan must cover:
1. THE OWNER'S QUESTION, answered on the site honestly and first: "it smelled horrible, so is it above the guideline?" The honest answer has two halves and the reader must get both within one screen: the smell is real and is above what people can smell for most of the red; carbon monoxide has no smell, and averaged the way the guideline is, it stays below, with bursts, pushchair height and people who stay as the parts that are worse than the old average suggested. Decide the exact headline and lines for home screen 5 (and what is cut to pay for them), in zh and en.
2. Where each allowed statement goes (home screen / question page / /estimate/ section / not used) with the exact zh and en sentence, its label and its range. Candidates: home screen 5 (guideline), screen 9 (heights: pushchair), /questions/smell/ (the smell is real), /questions/my-child/ (pushchair height and the one exception, with the practical point that it needs the pushchair right behind a tailpipe in still air), /questions/one-red-light/ and /questions/how-much/ (one red adds 0.1-4 ppm to a 15-minute average), a place for people who stay (vendors, traffic police, crossing guards: benzene), and enclosed places as "not simulated, could reach the guideline".
3. A new section on /estimate/ titled in plain words (for example 「我們用電腦模擬了一次紅燈」 / "We simulated one red light on a computer"): what was simulated in three sentences, then three or four small charts, then how sure, then what was not simulated, then links to the method files. Specify each chart precisely (data source field in results-simulation.json or the per-second series, axes, labels in zh/en, what it must NOT draw, e.g. no guideline line on a seconds chart). Strong candidates: (a) carbon monoxide second by second through one red, with its 90-second average, to show bursts; (b) like with like: one red, and staying through every red, converted to 15-minute averages against 87 ppm, plus the pushchair exception; (c) what is above its own line: smell share of seconds, benzene for people who stay; (d) heights.
4. Corrections to the published estimate text (research/estimate/METHOD.md sections 8 and 9, src/data/estimate.ts sentences, the home text that says peaks or child height were not estimated), per ANSWER.md and the report's "changes to the published estimate": keep the 90-second figures; relabel the upper value as the upper end of typical reds, not the worst red; replace "not modelled" notes with the simulated ranges.
5. Registry and sources: new fact ids, read level, sources to add from research/simulation/sources.json.
6. Repository hygiene: research/simulation is 51 MB with per-case stats.json files of 2 MB each. Decide what is committed (method, answer, plan, inputs, scenarios, statements, final results, scripts, case template, the figures the site or method cites, verification notes) and what is left out with a note on how to regenerate; target under about 6 MB.
7. An /about/ corrections-log entry in the log's existing style.
8. Anything on the site that the simulation now contradicts (list with file and line), including film captions and share-card lines (to report, not to change).
9. The length budget: per home screen, the px you expect to add and remove.`,
  { label: 'plan', phase: 'Plan', model: M, schema: {
    type: 'object',
    properties: {
      planFile: { type: 'string' },
      screen5: { type: 'object', properties: { zhHeadline: { type: 'string' }, enHeadline: { type: 'string' }, zhLines: { type: 'array', items: { type: 'string' } }, enLines: { type: 'array', items: { type: 'string' } }, cuts: { type: 'string' } }, required: ['zhHeadline', 'enHeadline'] },
      placements: { type: 'array', items: { type: 'object', properties: { where: { type: 'string' }, zh: { type: 'string' }, en: { type: 'string' }, carries: { type: 'string' } }, required: ['where', 'zh', 'en'] } },
      charts: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, shows: { type: 'string' }, data: { type: 'string' }, mustNot: { type: 'string' } }, required: ['id', 'shows'] } },
      corrections: { type: 'array', items: { type: 'string' } },
      contradicted: { type: 'array', items: { type: 'string' } },
      keepInRepo: { type: 'string' },
      openQuestions: { type: 'array', items: { type: 'string' } },
    },
    required: ['planFile', 'screen5', 'placements', 'charts'],
  } })

phase('Challenge')
const CH = {
  type: 'object',
  properties: { objections: { type: 'array', items: { type: 'object', properties: {
    severity: { type: 'string', enum: ['must-change', 'should-change', 'consider'] }, about: { type: 'string' }, problem: { type: 'string' }, change: { type: 'string' },
  }, required: ['severity', 'about', 'problem', 'change'] } }, verdict: { type: 'string' } },
  required: ['objections', 'verdict'],
}
const planText = JSON.stringify(plan, null, 1).slice(0, 30000)
const challenges = (await parallel([
  () => agent(`${COMMON}
YOUR JOB: sceptic, FIDELITY lens. Do not edit the site. Read ${OUT}/PLAN-SITE.md and compare every planned sentence, label and chart with research/simulation/statements.json, results-simulation.json, ANSWER.md and METHOD.md. Default to objecting when unsure. Look for: a number or range that differs from the file; a condition dropped (held wind, near-still air, half a metre, pushchair height, "people who stay an hour"); a missing 推估 / Estimate label; any "must not" statement in other words; a chart that puts a seconds value beside a 15-minute line, or lets a rare case look typical, or hides that there is one simulated red per case; the exception either buried or blown up; anything that reads as tuned toward what the owner wanted to hear, or toward reassurance. Also check the planned corrections to the published estimate say exactly what the report's changes list says.
The plan as summarised by its author:
${planText}`, { label: 'challenge:fidelity', phase: 'Challenge', model: M, schema: CH }),
  () => agent(`${COMMON}
YOUR JOB: sceptic, PLAIN-LANGUAGE lens. Do not edit the site. Read ${OUT}/PLAN-SITE.md. Read every planned zh and en sentence first as a 10-year-old in Taiwan, then as a 70-year-old. Object to: sentences over about 25 Chinese characters or 18 English words; words a child does not know (平均, 推估, ppm, 下風處, 指引值 need a gloss or a simpler turn the first time); two ideas in one line; a headline that needs the body to make sense; zh that reads like translated English, or uses mainland terms; charts that need more than one sentence to explain; a home screen that now says too much. For each objection give the rewritten sentence in zh and en. Keep every condition and range the fidelity rules require: shorter must not mean less true.
The plan as summarised by its author:
${planText}`, { label: 'challenge:plain', phase: 'Challenge', model: M, schema: CH }),
  () => agent(`${COMMON}
YOUR JOB: sceptic, OWNER'S-QUESTION lens. Do not edit the site. Read ${OUT}/PLAN-SITE.md and research/simulation/ANSWER.md. The owner stood at these red lights, found the smell horrible, and did not believe "far below the guideline". A reader like them arrives at home screen 5. Judge the plan as that reader: does the screen take the experience seriously (the smell is real and above what people can smell), explain in one breath why a horrible smell and a low carbon monoxide average are both true (carbon monoxide has no smell; the nose picks up unburnt fuel at tiny amounts), and tell them what the simulation found that is worse than the old average (bursts, pushchair height, people who stay, the one exception)? Or does it still end on reassurance, or bury the new findings on a sub-page? Also judge the other direction: does anything now overclaim to please that reader? And does the site still lead toward its goal (fewer idling petrol scooters, electric instead) rather than ending on "it is fine"? Give concrete rewrites.
The plan as summarised by its author:
${planText}`, { label: 'challenge:owner', phase: 'Challenge', model: M, schema: CH }),
])).filter(Boolean)
const objections = challenges.flatMap(c => c.objections || [])
log(`Plan challenged: ${objections.filter(o => o.severity === 'must-change').length} must-change, ${objections.filter(o => o.severity === 'should-change').length} should-change, ${objections.filter(o => o.severity === 'consider').length} to consider`)

phase('Implement')
const impl = await agent(`${COMMON}
YOUR JOB: implement the simulation on the site, following the plan in ${OUT}/PLAN-SITE.md as amended by the three sceptics' objections below. For each must-change and should-change objection: apply it, unless it conflicts with statements.json / results-simulation.json (the files win) or with another objection (fidelity beats plain language beats the rest; keep the sentence as short as fidelity allows). Record what you did with each objection in ${OUT}/OBJECTIONS.md.

Objections:
${JSON.stringify(challenges, null, 1).slice(0, 45000)}

Plan summary:
${planText}

DO
1. research/simulation: commit the pruned set the plan names (target under about 6 MB; leave heavy per-case files out and say in research/simulation/README.md how to regenerate them; add a .gitignore for them if useful). Apply the corrections to research/estimate/METHOD.md and the site sentences that said peaks or child height were not estimated.
2. Fact registry and sources registry entries for every new statement; then the pages: home screen 5 and 9, question pages, the new /estimate/ section with its charts, the people-who-stay and enclosed-places statements, the /about/ log entry. zh and en.
3. Charts: built like the existing ones (src/components/charts/), data read from a small data module generated from results-simulation.json (commit the generator script and its output; no hand-typed numbers), light and dark, 320 px, text alternative, the 推估 / Estimate label on each.
4. Tests: unit tests for the data module (numbers equal the signed file) and for any new copy helper; extend scripts/check-copy.mjs or claims-policy with rules that would catch the "must not" statements (for example a seconds value beside "87 ppm" without the words for conversion), without loosening anything.
5. docs/redesign-brief.md (4.4, 12.4 and wherever the estimate is described) and README as built.
6. "npm run check" must exit 0. Build and run "npm run check:site <dist>": all checks pass, home page inside its length budget. Take screenshots (Playwright; require('playwright') works; chromium.launch() needs no options) of home screens 5 and 9, the new /estimate/ section with every chart, and the changed question pages, zh and en, at 390x844 light and 703x900 dark, into ${OUT}/shots/, and LOOK at each with the Read tool before reporting.
Commit (tree clean). Report what you did, the home heights, what you could not do, and the commit.`,
  { label: 'implement', phase: 'Implement', model: M, schema: {
    type: 'object',
    properties: { summary: { type: 'string' }, changed: { type: 'array', items: { type: 'string' } }, objectionsDeclined: { type: 'array', items: { type: 'string' } }, contradictedElsewhere: { type: 'array', items: { type: 'string' } }, checks: { type: 'string' }, heights: { type: 'string' }, repoSize: { type: 'string' }, notDone: { type: 'array', items: { type: 'string' } }, commit: { type: 'string' } },
    required: ['summary', 'commit'],
  } })

phase('Prove')
const prove = await agent(`${COMMON}
YOUR JOB: prove the simulation release. Working copy ${WT}. The implementer reported: ${JSON.stringify(impl).slice(0, 6000)}
1. npm run check exits 0 (every part). 2. Fresh build, npm run check:site <dist>: all checks pass; report home heights and the height of each changed screen. 3. Live-address build: SITE_URL=https://likelylabs.com BASE_PATH=/scooterair npx astro build --outDir ${OUT}/site/scooterair, then crawl it in a browser (a crawl script exists at ${S}/rel2/tools/crawl.cjs with common.cjs; copy and adapt into ${OUT}/tools/, do not edit it in place): 0 page errors, 0 failed requests, 0 missing assets, one og:image per page. 4. Every number shown on the built pages that comes from the simulation: extract it from the built HTML (zh and en) and compare with research/simulation/results-simulation.json and statements.json; list every mismatch. 5. Every new chart at 320, 390, 703 and 1440 px, light and dark, and with JavaScript off: nothing clipped, labels readable, the text alternative present. 6. git count-objects / du: size added to the repository by research/simulation.
Fix small breakages yourself and commit; report bigger ones.`,
  { label: 'prove', phase: 'Prove', model: M, schema: {
    type: 'object',
    properties: { npmCheck: { type: 'string' }, siteChecks: { type: 'string' }, crawl: { type: 'string' }, numberMismatches: { type: 'array', items: { type: 'string' } }, chartProblems: { type: 'array', items: { type: 'string' } }, fixed: { type: 'array', items: { type: 'string' } }, open: { type: 'array', items: { type: 'string' } }, commit: { type: 'string' } },
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
YOUR JOB: FACTS review of the simulation release. READ-ONLY on ${WT}; notes under ${OUT}/review-facts/. Read git -C ${WT} diff origin/main for every reader-facing string, chart and registry entry, and the built pages. Against research/simulation/statements.json, results-simulation.json, ANSWER.md and METHOD.md, find: any number, range, condition or likelihood that differs; any statement not on the allowed list; any "must not" statement in any wording (also in alt text, chart titles, share text, meta descriptions); a seconds value near a 15-minute or 1-hour line without conversion; a missing 推估 / Estimate label; zh and en that say different things; a chart whose drawn values differ from its data; anything that reads as tuned to please the owner, or as reassurance beyond the files; places where the old "not estimated / not modelled" wording survives; whether the copy guard or claims policy got weaker (compare with origin/main). Default to reporting when unsure.`, { label: 'review:facts', phase: 'Review', model: M, schema: FIND }),
  () => agent(`You are a first-time reader in Taiwan who has stood at red lights beside idling scooters and found the smell horrible. Do not read source code or project documents. A build of a website is in ${OUT}/site/scooterair (static files; serve ${OUT}/site with any static server so the site is at /scooterair/). Use Playwright (require('playwright') works; chromium.launch() needs no options) to open, in Chinese and in English, at 390x844 light and 703x900 dark: the home page (go through all 15 screens; look hardest at screens 4, 5 and 9), /estimate/ (open every fold; find the part about a computer simulation), /questions/smell/, /questions/my-child/, /questions/one-red-light/, /questions/how-much/. Take screenshots into ${OUT}/review-reader/ and LOOK at each with the Read tool.
Read first as a 10-year-old, then as a 70-year-old, then as the sceptical adult described above. Report as findings: any sentence you had to read twice; any word you did not know; any chart you could not explain in one sentence; any place where you felt talked down to, reassured without reason, or frightened without reason; whether screen 5 answers "it smelled horrible, so is it above the guideline?" in a way you believe; whether you can tell what is measured, what is the older estimate and what is the simulation; anything that looks unfinished.`, { label: 'review:reader', phase: 'Review', model: M, schema: FIND }),
  () => agent(`${COMMON}
YOUR JOB: REGRESSION review of the simulation release. READ-ONLY on ${WT}; your scripts and screenshots under ${OUT}/review-regressions/. Build it yourself to ${OUT}/review-regressions/dist. The previous release is live at https://likelylabs.com/scooterair/ for comparison. In a real browser, zh and en, check every changed page (home, /estimate/, the question pages, /evidence/, /about/, /sources/) at 320, 360, 390, 703x900 dark, 1024x768 and 1440x900; text sizes 標準/大/特大; JavaScript off; reduced motion; print. Look for: sideways scroll, clipped or overlapping text, charts unreadable in dark mode or at 320 px, folds that do not open from a link, dead links and anchors (including links into research/simulation files: do they resolve on the live address?), the home page or a screen over its length budget, lone characters on a last line in new text, anything the previous release did that this one no longer does. Confirm that src/components/art/**, the film and the share cards were not touched (git diff --stat origin/main). Report with screenshot paths.`, { label: 'review:regressions', phase: 'Review', model: M, schema: FIND }),
])).filter(Boolean)
const findings = reviews.flatMap(r => r.findings || [])
log(`Review: ${findings.filter(f => f.severity === 'blocker').length} blocker(s), ${findings.filter(f => f.severity === 'should-fix').length} should-fix, ${findings.filter(f => f.severity === 'nit').length} nit(s)`)

phase('Fix')
const fix = await agent(`${COMMON}
YOUR JOB: final fixer for the simulation release. Working copy ${WT}; output ${OUT}/ and ${OUT}/show/.
Three reviewers reported the findings below. Confirm each yourself before acting; decline what you cannot reproduce, with the reason. Fix every confirmed blocker and should-fix and the cheap nits. On any conflict, research/simulation/statements.json and results-simulation.json win.
${JSON.stringify(reviews, null, 1).slice(0, 60000)}
The prover reported: ${JSON.stringify(prove).slice(0, 5000)}

Then: npm run check exits 0; fresh build + npm run check:site: all pass; live-address build (SITE_URL=https://likelylabs.com BASE_PATH=/scooterair npx astro build --outDir ${OUT}/site/scooterair) and crawl: 0 errors. Make pictures for the owner in ${OUT}/show/: home screen 5 before (live site) and after, side by side with BEFORE / AFTER titles, zh at 390 light (cmp-s5-zh-390.png) and en at 703x900 dark (cmp-s5-en-703-dark.png); home screen 9 after (after-s9-zh-390.png); each new chart on /estimate/ in zh and en at 390 light (after-chart-<id>-<lang>.png); the changed part of /questions/smell/ and /questions/my-child/ (after-smell-zh.png, after-my-child-zh.png). Look at each. Commit (tree clean).
Report honestly: fixed, declined and why, check results, home heights, picture paths, the exact final zh and en text of home screen 5, the final commit, whether it is ready to publish, what is still open, and the list of film captions or share-card lines the simulation contradicts (not changed by you).`,
  { label: 'fix', phase: 'Fix', model: M, schema: {
    type: 'object',
    properties: { fixed: { type: 'array', items: { type: 'string' } }, declined: { type: 'array', items: { type: 'object', properties: { finding: { type: 'string' }, why: { type: 'string' } }, required: ['finding', 'why'] } }, npmCheck: { type: 'string' }, siteChecks: { type: 'string' }, liveAddressBuild: { type: 'string' }, heights: { type: 'string' }, screen5Final: { type: 'string' }, shots: { type: 'array', items: { type: 'string' } }, contradictedFilmOrCards: { type: 'array', items: { type: 'string' } }, commit: { type: 'string' }, ready: { type: 'boolean' }, stillOpen: { type: 'array', items: { type: 'string' } } },
    required: ['fixed', 'npmCheck', 'siteChecks', 'commit', 'ready'],
  } })

return { plan: { screen5: plan.screen5, charts: plan.charts, contradicted: plan.contradicted }, challengeVerdicts: challenges.map(c => c.verdict), impl, prove, reviewVerdicts: reviews.map(r => r.verdict), fix }
