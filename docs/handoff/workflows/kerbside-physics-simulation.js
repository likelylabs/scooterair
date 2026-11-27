export const meta = {
  name: 'kerbside-physics-simulation',
  description: '3-D fluid simulation of idling scooter exhaust at the kerb: worst cases, heights, second-by-second peaks, smell; adversarially verified',
  phases: [
    { title: 'Scout', detail: 'literature and inputs, simulation tooling, bounds and scenario plan', model: 'opus' },
    { title: 'Build', detail: 'working 3-D transient case, smoke-tested and mass-checked', model: 'opus' },
    { title: 'Run', detail: 'scenario matrix: pack size, wind, arcade, high emitters, heights', model: 'opus' },
    { title: 'Verify', detail: 'three independent attempts to break the result', model: 'opus' },
    { title: 'Report', detail: 'signed results, fair comparisons, what the site may now say', model: 'opus' },
  ],
}

const SP = '/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad'
const WT = SP + '/sim/wt'
const RUN = SP + '/sim/run'
const OUT = WT + '/research/simulation'

const COMMON = `
PROJECT: a bilingual public-service website for Taiwan about what pedestrians breathe beside idling petrol scooters at a red light. Its published kerbside figures are a signed ESTIMATE (推估) from a source-and-dispersion Monte Carlo: read ${WT}/research/estimate/METHOD.md, results.txt, model.mjs and the inputs-*.json files there FIRST; they hold the emission rates, the scene geometry, the validation anchor (Institute of Transportation kerb sensors, Kaohsiung, July 2024: highest 1-minute CO about 1.3 ppm total at a junction with about 34 scooters per red) and the list of fair and unfair comparisons.

WHY THIS JOB EXISTS. The site's owner stood beside a large group of idling scooters at a red light in Taiwan and says: "it smelled horrible - especially when there was a huge group of them idling at a red light". On seeing the site's chart (kerb CO about 0.3 to 1.6 ppm against the WHO 15-minute guideline of about 87 ppm, "far below") they wrote: "I can guarantee it's not below the guideline - the estimate needs to show above the guideline, it smelled HORRIBLE. you need to do the physics simulations".
The owner's instruction to do the physics properly is right: the current model gives only 90-second means at adult height on the kerb and by its own section 8 cannot say anything about the first metre behind a tailpipe, child or pushchair height, second-by-second plume hits, still air under an arcade (騎樓), the pull-away burst at green, or the smell. The owner's expected RESULT is not an instruction: carbon monoxide has no smell, and the smell is unburnt fuel and partial-combustion products that the nose detects at parts per billion. THE SIMULATION MUST REPORT WHAT THE PHYSICS GIVES. Do not tune any input, scenario or statistic to reach or to avoid any threshold. If a realistic case exceeds a guideline, say so plainly with the case and its probability; if it does not, say by how much it falls short and what it would take. A result bent to please anyone is worthless and would be found out.

WHAT THE SIMULATION SHOULD ANSWER (each with a range and a plain statement of confidence):
 1. Carbon monoxide at the kerb beside a few / a dozen / a full stop box of idling scooters: second-by-second series over a 90 s red, at pushchair (0.6-0.8 m), child (1.1 m) and adult (1.5 m) breathing heights, at 0.5, 1, 2 and 4 m from the nearest tailpipe; 90-second mean, highest 10 s and highest 1 s. Typical cases and realistic worst cases: near-calm air, wind from the pack toward the kerb, a building with an arcade behind the pavement, a street canyon, a pack containing high emitters (the inspection data's upper tail and the two-stroke / smoker share), people standing directly behind the last row.
 2. The same for exhaust hydrocarbons (fuel vapour) and benzene, and the dilution ratio from tailpipe to nose (raw idle exhaust is of the order of percent CO and thousands of ppm hydrocarbons: check the inputs).
 3. Smell: compare the modelled hydrocarbon / aldehyde mixture at the nose with published odour detection thresholds for petrol vapour and petrol-engine exhaust (odour units, i.e. dilutions-to-threshold). This is the comparison that matches what the owner experienced; treat its inputs with care and give the range honestly.
 4. Fair comparisons for every number: CO against WHO 15-minute (100 mg/m3), WHO 1-hour (35 mg/m3), Taiwan's 1-hour standard, and for brief peaks any short-term ceiling value that properly applies to seconds-to-minutes (state the averaging time of every reference and never compare a 1-second peak with a 15-minute mean without converting: a 90 s level contributes 1/10 to a 15-minute mean). Benzene and hydrocarbons against references whose averaging time fits, or clearly labelled when it does not.
 5. What would have to be true for kerb CO to reach the WHO 15-minute value (87 ppm for 15 minutes) outdoors: source strength, air exchange, enclosure. Is any Taiwanese street situation close (arcades, underpasses, covered scooter waiting zones, tunnels, covered car parks)?
 6. Agreement with reality: the simulation must reproduce the Kaohsiung kerb-sensor anchor within its uncertainty when run for that sensor's position and wind, and must agree with the existing dispersion model at 2-8 m where that model was validated. Where it differs, explain why.

WORKING RULES
 - Code, inputs, small result tables and figures that should be kept go in ${OUT} (inside the working copy ${WT}, branch "sim"). Large simulation cases, meshes and raw fields go in ${RUN} (not committed). Never touch /home/user/scooterair or any other folder under ${SP}; never push; no pull requests. Do not edit any website source file under ${WT}/src: this job produces research only.
 - The machine: Ubuntu 24.04, 4 CPUs, 15 GB RAM, about 45 GB disk; other jobs are running on it, so use at most 3 cores for solvers. Package registries (apt, pip, npm) are reachable; arbitrary web hosts may not be. If a host is blocked, do not try to get around it; use another source or say so. You may install software with apt-get / pip (python3 has numpy but not scipy yet).
 - Long runs: start them in the background writing to a log file (your shell tool's background mode), and wait for the completion notice; never leave a solver running when you finish, and report the wall time each case took.
 - Record every input with its source (reuse the ids in research/estimate/sources.json; add new sources to ${OUT}/sources.json with URL, what you actually opened, and date). Do not cite anything you did not open. Keep searches free of personal or project details.
 - Commit kept files on branch "sim" when your part is done (git add research/simulation; git commit). Commit messages end with exactly:
Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011bucwSEfrKWuFWgaA6nCor
`

const LIT_SCHEMA = {
  type: 'object',
  properties: {
    tailpipe: { type: 'string', description: 'idle exhaust of 100-150 cc four-stroke scooters: volume flow, temperature, exit velocity, pipe diameter and height, raw CO/HC/benzene concentrations, with sources; high-emitter and two-stroke tail' },
    nearField: { type: 'string', description: 'measured dilution or concentration within 0.3-3 m of idling vehicle tailpipes, at child vs adult height, with sources' },
    kerbMeasurements: { type: 'string', description: 'measured CO (and HC/benzene) for pedestrians or kerbside at scooter-dominated junctions in Taiwan, Vietnam, etc., including historical (1990s two-stroke era) values, with averaging times' },
    odour: { type: 'string', description: 'odour detection thresholds for petrol vapour, petrol exhaust and its key odorants, with ranges and sources; how exhaust odour is quantified (dilution-to-threshold)' },
    references: { type: 'array', items: { type: 'object', properties: { pollutant: { type: 'string' }, value: { type: 'string' }, averagingTime: { type: 'string' }, body: { type: 'string' }, source: { type: 'string' }, opened: { type: 'boolean' } }, required: ['pollutant', 'value', 'averagingTime', 'body', 'source', 'opened'] } },
    enclosedCases: { type: 'string', description: 'measured CO where scooters idle in enclosed or semi-enclosed places (arcades, underpasses, car parks, tunnels, ferry decks)' },
    file: { type: 'string', description: 'path of the JSON you wrote with all of this' },
    gaps: { type: 'array', items: { type: 'string' } },
  },
  required: ['tailpipe', 'nearField', 'kerbMeasurements', 'odour', 'references', 'enclosedCases', 'file', 'gaps'],
}

const TOOL_SCHEMA = {
  type: 'object',
  properties: {
    chosen: { type: 'string', description: 'solver and version actually installed and run here' },
    installCommands: { type: 'array', items: { type: 'string' } },
    smokeTest: { type: 'string', description: 'the buoyant-jet-in-light-wind test you ran: mesh size, time step, wall time, mass balance error, where the case lives' },
    recommendedSetup: { type: 'string', description: 'solver, turbulence treatment (LES or URANS and why), species transport, buoyancy, boundary conditions for near-calm wind, mesh sizes near tailpipes and people, domain, time step, expected wall time per 90 s case on 3 cores' },
    templateCase: { type: 'string', description: 'path of a working template case and a run script' },
    fallback: { type: 'string', description: 'what to do if the chosen solver proves too slow: e.g. an own-written Lagrangian puff/particle model driven by a coarse flow field' },
    risks: { type: 'array', items: { type: 'string' } },
  },
  required: ['chosen', 'installCommands', 'smokeTest', 'recommendedSetup', 'templateCase', 'fallback', 'risks'],
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    bounds: { type: 'string', description: 'conservation-of-mass bounds: CO at the nose for given pack emission and air exchange; what is needed to reach 87 ppm for 15 min, 87 ppm for 90 s, 87 ppm for 1 s; raw-exhaust dilution needed; plain conclusion about what is physically plausible outdoors' },
    currentModelLimits: { type: 'array', items: { type: 'string' } },
    scenarios: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, why: { type: 'string' }, scooters: { type: 'string' }, geometry: { type: 'string' }, wind: { type: 'string' }, emitters: { type: 'string' }, priority: { type: 'number' }, likelihood: { type: 'string', description: 'how often such a red light occurs, with basis' } }, required: ['id', 'why', 'scooters', 'geometry', 'wind', 'emitters', 'priority', 'likelihood'] } },
    probes: { type: 'string' },
    statistics: { type: 'string', description: 'exactly which statistics to extract so nothing is cherry-picked after the fact' },
    acceptance: { type: 'array', items: { type: 'string' }, description: 'checks the simulation must pass before any number is believed' },
    file: { type: 'string' },
  },
  required: ['bounds', 'currentModelLimits', 'scenarios', 'probes', 'statistics', 'acceptance', 'file'],
}

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    caseDescription: { type: 'string' },
    inputsTable: { type: 'string', description: 'every physical input with value, range and source id' },
    checks: { type: 'array', items: { type: 'object', properties: { check: { type: 'string' }, result: { type: 'string' }, pass: { type: 'boolean' } }, required: ['check', 'result', 'pass'] } },
    runScript: { type: 'string', description: 'path and exact usage of the script that runs one scenario and extracts the agreed statistics' },
    wallTimePerCase: { type: 'string' },
    deviationsFromPlan: { type: 'array', items: { type: 'string' } },
    firstResult: { type: 'string', description: 'the numbers from the first complete baseline case, stated plainly' },
    commit: { type: 'string' },
  },
  required: ['caseDescription', 'inputsTable', 'checks', 'runScript', 'wallTimePerCase', 'deviationsFromPlan', 'firstResult', 'commit'],
}

const RUN_SCHEMA = {
  type: 'object',
  properties: {
    casesRun: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, wallTime: { type: 'string' }, completed: { type: 'boolean' }, coMean90_adult_1m: { type: 'string' }, coMax10s_child_1m: { type: 'string' }, coMax1s_pushchair_05m: { type: 'string' }, hcAndBenzene: { type: 'string' }, dilutionAtNose: { type: 'string' }, notes: { type: 'string' } }, required: ['id', 'wallTime', 'completed', 'coMean90_adult_1m', 'coMax10s_child_1m', 'coMax1s_pushchair_05m', 'hcAndBenzene', 'dilutionAtNose', 'notes'] } },
    casesDropped: { type: 'array', items: { type: 'string' } },
    resultsFile: { type: 'string' },
    figures: { type: 'array', items: { type: 'string' } },
    anchorComparison: { type: 'string', description: 'simulation vs the Kaohsiung kerb sensor and vs the existing dispersion model at 2-8 m' },
    gridAndSeedSensitivity: { type: 'string' },
    plainFindings: { type: 'array', items: { type: 'string' } },
    commit: { type: 'string' },
  },
  required: ['casesRun', 'casesDropped', 'resultsFile', 'figures', 'anchorComparison', 'gridAndSeedSensitivity', 'plainFindings', 'commit'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    verdict: { type: 'string', enum: ['holds', 'holds-with-corrections', 'does-not-hold'] },
    findings: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['blocker', 'should-fix', 'note'] }, claim: { type: 'string' }, problem: { type: 'string' }, evidence: { type: 'string' }, effectOnNumbers: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'claim', 'problem', 'evidence', 'effectOnNumbers', 'fix'] } },
    independentNumbers: { type: 'string', description: 'numbers you computed yourself, by a different route, to compare' },
  },
  required: ['lens', 'verdict', 'findings', 'independentNumbers'],
}

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    answerToOwner: { type: 'string', description: 'three or four plain sentences: is kerb CO above the WHO guideline in any realistic case; what IS above its line; what the simulation changed about the picture' },
    headlineNumbers: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, low: { type: 'string' }, central: { type: 'string' }, high: { type: 'string' }, reference: { type: 'string' }, aboveReference: { type: 'string', enum: ['yes', 'no', 'in-worst-case-only', 'not-comparable'] }, confidence: { type: 'string' } }, required: ['what', 'low', 'central', 'high', 'reference', 'aboveReference', 'confidence'] } },
    exceedances: { type: 'array', items: { type: 'string' }, description: 'every case where a properly matched reference is exceeded, with how often such a case occurs' },
    whatItWouldTake: { type: 'string' },
    changesToPublishedEstimate: { type: 'array', items: { type: 'string' }, description: 'which existing site figures should change, to what, and why; or that they stand' },
    newClaimsTheSiteMayMake: { type: 'array', items: { type: 'object', properties: { zh: { type: 'string' }, en: { type: 'string' }, basis: { type: 'string' }, mustCarry: { type: 'string' } }, required: ['zh', 'en', 'basis', 'mustCarry'] } },
    claimsTheSiteMustNotMake: { type: 'array', items: { type: 'string' } },
    correctionsApplied: { type: 'array', items: { type: 'string' } },
    unresolved: { type: 'array', items: { type: 'string' } },
    methodFile: { type: 'string' },
    resultsFile: { type: 'string' },
    figures: { type: 'array', items: { type: 'string' } },
    commit: { type: 'string' },
  },
  required: ['answerToOwner', 'headlineNumbers', 'exceedances', 'whatItWouldTake', 'changesToPublishedEstimate', 'newClaimsTheSiteMayMake', 'claimsTheSiteMustNotMake', 'correctionsApplied', 'unresolved', 'methodFile', 'resultsFile', 'figures', 'commit'],
}

phase('Scout')
const [lit, tool, plan] = await parallel([
  () => agent(`${COMMON}
YOUR PART: INPUTS AND REFERENCES. First mine what the project already has (research/estimate/inputs-*.json, gap-answers-*.json, sources.json; research/redlight/ for the smell chemistry and odour-threshold work; research/masks/). Then fill what a 3-D near-field simulation and its comparisons need and the existing files lack, using web search and by opening the sources themselves (journals' open pages, PubMed/Europe PMC abstracts, agency PDFs):
 - idle exhaust of 100-150 cc four-stroke scooters: volume flow (from displacement, idle rpm, volumetric efficiency, or measured), exit temperature and velocity, tailpipe diameter and height; raw idle CO, hydrocarbon and benzene concentrations including Taiwan's inspection limits and the measured distribution; the high-emitter tail; two-strokes.
 - measured dilution or concentrations in the first 0.3-3 m behind idling tailpipes, and at child or pushchair height against adult height.
 - measured pedestrian or kerbside CO at scooter-dominated junctions (Taiwan including the 1990s two-stroke era, Vietnam, Thailand, India, Italy), with averaging times, so the simulation can be placed against history.
 - CO where scooters or cars idle in enclosed or semi-enclosed spaces.
 - odour detection thresholds for petrol vapour, petrol-engine exhaust and its main odorants (aldehydes, aromatics, sulphur compounds), with their ranges, and how exhaust odour is expressed as dilution-to-threshold.
 - every reference value the comparisons need, each with its exact averaging time and issuing body (WHO 2021 and 2010 CO values; Taiwan's standards; short-term ceiling or acute values such as AEGL-1 / STEL / acute REL for CO, benzene, formaldehyde, acetaldehyde, petrol vapour), marking which you opened.
Write everything to ${OUT}/inputs-simulation.json with source ids, add new sources to ${OUT}/sources.json, and commit. Return the structured summary.`, { label: 'scout:inputs', phase: 'Scout', schema: LIT_SCHEMA, model: 'opus' }),
  () => agent(`${COMMON}
YOUR PART: THE SIMULATION TOOL. Get a real 3-D transient fluid solver working on this machine that can carry hot, buoyant exhaust jets and passive species through near-calm outdoor air around simple obstacles (scooters and riders as blocks, a kerb, people as columns, a building wall with an optional arcade roof).
 - Prefer OpenFOAM (apt-get update; try the Ubuntu "openfoam" package, or the openfoam.org / openfoam.com packages if their hosts are reachable). Other acceptable routes if it cannot be installed: another open CFD code installable from apt or pip, or as a last resort a carefully written own solver; say which and why.
 - Decide LES against unsteady RANS for this problem (seconds-scale peaks matter, so say what each can and cannot give), the buoyancy treatment, species transport, inflow turbulence for a 0.2-2 m/s wind, and how to represent true calm.
 - Build and RUN a smoke test: one tailpipe-sized hot jet 0.4 m above the ground in a light cross-flow, a tracer at known mass flow; confirm mass conservation of the tracer through the outflow to within a few percent, look at the plume, and time it. Then scale: estimate the mesh and wall time for a 90 s case with 12 and with 35 tailpipes on 3 cores, and propose mesh grading so that a case finishes in well under an hour.
 - Leave a clean template case and a run script under ${RUN}/template, and copy the small files worth keeping (dictionaries, scripts, a README of the install commands) to ${OUT}/cfd-template/ and commit.
Return the structured report.`, { label: 'scout:tooling', phase: 'Scout', schema: TOOL_SCHEMA, model: 'opus' }),
  () => agent(`${COMMON}
YOUR PART: BOUNDS AND THE SCENARIO PLAN, written BEFORE any simulation result exists so that nobody can choose statistics afterwards.
 1. From conservation of mass and the emission inputs in research/estimate, work out with a short script (python or node, kept in ${OUT}/bounds/): the CO at a nose for a pack emitting E g/h into air exchanged at Q m3/s; the dilution from raw idle exhaust needed for 87 ppm; how close to a tailpipe, for how long, in how little wind, that dilution exists; what it would take for a 15-minute mean of 87 ppm outdoors, under an arcade, in an underpass; the same for 30 ppm (1-hour values) and for brief peaks. State plainly what is physically plausible and what is not, and where the existing model's assumptions (90 s mean, adult height, kerb position, two reds in three with wind away from the pedestrian, AERMOD-style meander) could hide real exposure.
 2. Design the scenario matrix for a 3-D transient simulation: typical and realistic-worst cases (see "WHAT THE SIMULATION SHOULD ANSWER"), each with the reason it is there and an honest statement of how often such a red light occurs in Taiwan (use the wind statistics and queue data already in the inputs). Order by priority so that if time runs short the most informative cases are done first; at most 12 cases, plus one that reproduces the Kaohsiung sensor's position and wind, plus a grid-sensitivity repeat of the baseline.
 3. Fix the probes (positions and heights) and the exact statistics to extract (90 s mean, highest 10 s, highest 1 s, time above chosen levels, dilution ratio, vertical profile), and the acceptance checks the simulation must pass before any number is believed (mass balance, anchor agreement, grid sensitivity, agreement with the existing model at 2-8 m).
Write the plan to ${OUT}/PLAN.md, commit, and return the structured summary.`, { label: 'scout:plan', phase: 'Scout', schema: PLAN_SCHEMA, model: 'opus' }),
])

if (!tool || !plan) return { error: 'scout phase incomplete', lit, tool, plan }
const SCOUT = `INPUTS AND REFERENCES (scout):\n${JSON.stringify(lit, null, 1)}\n\nSIMULATION TOOL (scout):\n${JSON.stringify(tool, null, 1)}\n\nBOUNDS AND PLAN (scout):\n${JSON.stringify(plan, null, 1)}`

phase('Build')
const build = await agent(`${COMMON}
YOUR PART: BUILD THE SIMULATION and prove it works on the baseline case. Use the tool the scout installed and its template; follow ${OUT}/PLAN.md.
 - Geometry: a road approach with a scooter stop box, kerb and pavement, waiting pedestrians as simple columns, scooters with riders as simple blocks, each petrol scooter with a tailpipe outlet at its real height and direction; an option for a building wall with an arcade roof over the pavement; parameters for pack size and layout. Tailpipe boundary: idle exhaust volume flow, temperature, velocity and species mass fractions (CO, total hydrocarbons, benzene as a fixed share, a unit tracer for dilution) from the inputs; per-scooter emission rates drawn from the inspection distribution with a fixed seed, with an option for a high-emitter pack.
 - Flow: light wind profiles for 0.2 / 0.5 / 1 / 2 m/s and directions; inflow turbulence appropriate to a street; buoyancy on.
 - Output: probe series at 1 s or finer for every species at the planned positions and heights; a script that turns one finished case into the agreed statistics (JSON) and a small picture of the plume (a slice at 0.7 m and a vertical slice through the kerb), so a person can look at it.
 - Checks before you report: tracer mass balance; the baseline dozen case at 1 m/s; a sanity comparison of its 2-8 m values with the existing dispersion model; a coarse-versus-fine look at one probe. Record what failed and what you changed.
 - One script must run any scenario from the plan by id: ${OUT}/run-scenario.sh <id> (cases under ${RUN}/<id>), using at most 3 cores.
Commit the kept files. Return the structured report.

${SCOUT}`, { label: 'build:case', phase: 'Build', schema: BUILD_SCHEMA, model: 'opus' })

if (!build) return { error: 'build returned nothing', lit, tool, plan }

phase('Run')
const run = await agent(`${COMMON}
YOUR PART: RUN THE SCENARIO MATRIX in the order of priority in ${OUT}/PLAN.md with ${build.runScript}, one case at a time (3 cores), each in the background while you wait for it. Budget about five hours of wall time in total: if cases take longer than planned, coarsen within what the grid-sensitivity check allows, or drop the lowest-priority cases and SAY which. Always include: the baseline dozen, the full stop box, near-calm air, wind from the pack to the kerb, the arcade case, the high-emitter pack, the Kaohsiung-sensor reproduction, and the grid-sensitivity repeat.
After each case, extract the agreed statistics (no others) into ${OUT}/results-simulation.json and keep the two slice pictures in ${OUT}/figures/. When all are done:
 - compare with the Kaohsiung kerb sensor and with the existing dispersion model at 2-8 m, and say honestly whether the simulation passes the acceptance checks;
 - make three plain figures (PNG, labelled in English, numbers readable): CO against time at the three heights for the baseline and the worst realistic case; CO against distance and height; and one bar picture placing 90 s means and highest-second peaks beside the reference values with their averaging times;
 - write the plain findings, including anything that surprised you, and anything that is higher OR lower than the published estimate.
Do not interpret beyond the numbers and do not soften or strengthen them. Commit. Return the structured report.

BUILD REPORT:
${JSON.stringify(build, null, 1)}

${SCOUT}`, { label: 'run:matrix', phase: 'Run', schema: RUN_SCHEMA, model: 'opus' })

if (!run) return { error: 'run returned nothing', lit, tool, plan, build }
const EVID = `BUILD REPORT:\n${JSON.stringify(build, null, 1)}\n\nRUN REPORT:\n${JSON.stringify(run, null, 1)}\n\n${SCOUT}`

phase('Verify')
const LENSES = [
  { key: 'physics', prompt: `LENS: fluid dynamics and numerics. Try to BREAK the simulation: boundary conditions (is the tailpipe mass flow what the inputs say; is "calm" really calm or an artefact; are outflows reflecting), mesh resolution at the jets and at the probes, time step, turbulence treatment, numerical diffusion smearing peaks or false stagnation inflating them, buoyancy, averaging. Re-derive tailpipe mass flows from the dictionaries; recompute the tracer balance from the raw output; re-extract at least three statistics from the raw probe files with your own script and compare with results-simulation.json. Say which numbers can be trusted to what factor.` },
  { key: 'reality', prompt: `LENS: agreement with the measured world. Compare every headline number with real measurements: the Kaohsiung kerb sensors, Taiwan's traffic stations, the near-tailpipe and kerbside literature in the inputs file (open the sources again where you can), historical two-stroke-era values, enclosed-space measurements. Is anything in the simulation higher than any pedestrian measurement ever reported for an outdoor junction, or implausibly lower? Check the emission inputs against the inspection data and the idle exhaust flow against engine arithmetic. Check that each scenario's stated likelihood is honest. Compute your own back-of-envelope value for three cases by a different route and compare.` },
  { key: 'comparisons', prompt: `LENS: fairness of every comparison and of the smell result, in BOTH directions. For each reference value used: is the averaging time right, is the conversion (ppm to mg/m3 at 25 C, 90 s into 15 minutes) right, is the issuing body's wording respected, did you open the source? Is any exceedance claimed that depends on comparing a seconds-long peak with a minutes-long limit? Equally: is any reassurance claimed that hides a real exceedance (odour thresholds, short-term irritant thresholds for aldehydes, benzene references)? Is the odour calculation defensible (which odorants, which thresholds, what range)? Did anyone choose statistics after seeing results, against ${OUT}/PLAN.md? The owner hopes for "above the guideline" and the site's existing text says "far below": check the report serves neither wish.` },
]
const verify = (await parallel(LENSES.map(l => () => agent(`${COMMON}
YOU ARE AN INDEPENDENT VERIFIER. Change no simulation inputs or results; you may write your own scripts and notes under ${OUT}/verify-${l.key}/ and run your own small calculations. ${l.prompt}
Default to finding fault: a claim you cannot confirm from the files and raw output is "does not hold" for that claim.

${EVID}
Set lens to "${l.key}".`, { label: `verify:${l.key}`, phase: 'Verify', schema: VERIFY_SCHEMA, model: 'opus' })))).filter(Boolean)

phase('Report')
const report = await agent(`${COMMON}
YOUR PART: THE SIGNED REPORT. Three independent verifiers tried to break the simulation. Confirm each finding yourself; apply every confirmed correction (re-run a case through ${build.runScript} if a blocker requires it and time allows, otherwise widen the stated range or withdraw the number and say so). Then write:
 - ${OUT}/METHOD.md: what was simulated and how, inputs with sources, checks passed and failed, corrections made after verification, what it cannot say; in the same plain style as research/estimate/METHOD.md.
 - ${OUT}/results-simulation.json: final numbers only, each with low / central / high, the case it comes from, and confidence.
 - ${OUT}/ANSWER.md: one page for the site's owner, in plain words. Start with the direct answer to "is kerb carbon monoxide above the WHO guideline?" for typical and worst realistic cases, as the physics gives it. Then what IS above its line (smell thresholds, any properly matched short-term value), then what the simulation adds that the old estimate lacked (child and pushchair height, seconds-long hits, behind the tailpipes, arcade, pull-away), then what it would take to reach the guideline and whether any real place comes close. No hedging filler and no spin in either direction.
 - a list of statements the website may now make, each in zh-TW (natural, short, plain) and English, with its basis and the caveat it must carry (always marked 推估 / Estimate, with a range), and a list of statements it must not make.
 - whether any figure of the published estimate (research/estimate) should change.
Commit. Return the structured report.

VERIFIERS:
${JSON.stringify(verify, null, 1)}

${EVID}`, { label: 'report', phase: 'Report', schema: REPORT_SCHEMA, model: 'opus' })

return { plan: { bounds: plan.bounds, scenarios: plan.scenarios }, tool: { chosen: tool.chosen }, build: { checks: build.checks, firstResult: build.firstResult }, run, verify, report }
