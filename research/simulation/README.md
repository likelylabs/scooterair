# Kerbside exhaust simulation (research only)

3-D buoyant LES (OpenFOAM v2506, `buoyantPimpleFoam`, WALE) of idling petrol scooters at a red light, with
unit exhaust tracers, so CO, hydrocarbons, benzene, dilution and odour units follow afterwards from the
published estimate's own emission draws. The plan, probes, statistics and acceptance checks were fixed in
advance in `PLAN.md`; every change since is in its section 9. Install steps: `cfd-template/README.md`.

| file | role |
|---|---|
| `run-scenario.sh <id>` | runs one scenario of `scenarios.json` end to end (≤ 3 cores); `--mesh-only`, `--post-only`, `--resume`, `--emitters` |
| `scenarios.json` | scenario registry (PLAN ids), with status and deviations of each |
| `cfd/make_pack.py` | scene: stop box and kerb-lane queue, scooters with riders, tailpipes (height, angle, temperature, flow), people as columns, kerb, optional street canyon and arcade, wind, probe sets K, KL, B, R, V, SRC, AR, IN; grades coarse / fast / fine |
| `cfd/make_case.py` | scene → OpenFOAM case (castellated mesh, tailpipe patches, engine heat, time-varying gust/wander inflow (or DFSEM), tracers, probes, flux and inventory monitors) |
| `cfd/run.sh` | mesh + solve (MPI); `RESUME=1` continues from the latest written time |
| `cfd/analyse.py` | quick tracer balance and per-probe values at one fixed raw CO (tool check) |
| `draws.mjs` | 1,000 emission draws per case from `research/estimate/model.mjs` (`drawScooter`, unchanged); fleet, nearest-high-emitter, nearest-two-stroke, high-emitter-pack modes |
| `stats.py` | finished case → PLAN §5 statistics (JSON) + A1, A6, A8 checks + kept 1-s series |
| `plot_slices.py` | plume slices (0.7 m above the pavement; kerb line; cross-section through the nearest tailpipe) and 1-s series figure |
| `inflow_check.py` | acceptance A6 at the IN probes over any time window (usable while a case runs) |
| `grid_look.py` | the same statistics from two grids at named probes (coarse-versus-fast look) |
| `compare-estimate.mjs` | the published estimate at the same scooter count, distance, wind and heights (A4) |
| `extract_results.py ID STATS` | copies the agreed statistics (PLAN §5 only) of one case into `results-matrix.json` |
| `stay_through.py CASE STATS --label ...` | converted one-red contributions and stay-through 15-min / 1-h values with a fresh emission draw for every red (PLAN 9.24) |
| `final_numbers.py` | writes `results-simulation.json`, the final numbers of the signed report (low / central / high, case, confidence) |
| `corrections/` | signed-report step: re-checks of the verifiers' findings, K tables, stay-through outputs, near-field grid check |
| `a2_iot.py CASE OUT` | acceptance A2: Kaohsiung sensor reproduction at the I probes of case A (first-order sensor τ 30 s, highest 1-min) |
| `make_figures.py BASE WORST [IDs]` | the three summary figures in `figures/` (CO vs time; vs distance and height; next to reference values) |
| `results-matrix.json` | matrix results (was `results-simulation.json`): per case K headline (P5/P50/P95 over 1,000 emission draws), B / I / AR sets, highest single probe, A1/A6/A8 |
| `results-simulation.json` | final numbers only (signed report) |
| `site-extract.json` | what the website uses: the statements' ranges read out of `statements.json`, the numbers behind each chart (with their results index) and the two one-second series of chart (a), rounded to 0.1. Written by `scripts/build-simulation-data.mjs` (repository root) together with `src/data/simulation-data.ts`; check-data re-runs it |
| `METHOD.md`, `ANSWER.md` | signed method and the one-page answer for the site's owner |
| `figures/` | summary figures and each case's plume slices and 1-s K series |
| `results/<id>/` | kept statistics, pictures, series and wall time per run (`*-try3`: the earlier build-proof runs) |

Raw cases (meshes, fields, probe files, about 11 GB) were kept only on the machine that ran them and are not committed.
The per-case statistics are committed compressed as `results/<id>/stats.json.gz`: run `gunzip -k results/*/stats.json.gz`
before using `extract_results.py`, `stay_through.py` or `final_numbers.py`. Pictures identical to those in `figures/` were
removed from `results/`.

Matrix run of 2026-11-27 (PLAN §9 items 17-22): coarse grade with lean refinement extents, structured 'rfm' inflow
precomputed as mapped boundary data (OpenFOAM refuses coded boundary conditions when run as root), cases S1, A, S2,
S5-12 and the S4 re-weighting. Grid sensitivity is the S1-try3 (fast) versus G0-try3 (coarse) matched-window look.

Signed-report step (PLAN §9 item 24): verification corrections, S5-12b (arcade with a 60.8 m domain top), NF1-fine / NF1-coarse / NF1-coarse-0kW near-field checks; see `METHOD.md`.

## Smell chemicals (what is in the air when the fumes can be smelled)

`smell-chemicals/` answers the owner's question "when you can smell it, what harmful chemicals are in it, and how
much?". It uses no new flow run. The signed unit exhaust tracers are multiplied by each chemical's measured share of
the exhaust (`speciation.json`). The work was planned in advance (`PLAN-SMELL.md`), checked by three sceptics
(`verify-sources.md`, `verify-arithmetic/`, `verify-fairness.md`) and corrected (`corrections.md`).

| file | role |
|---|---|
| `ANSWER-SMELL.md` | one-page answer for the site's owner |
| `statements-smell.json` | statements the site may make (zh-TW, English, basis, what each must carry) and must not make |
| `METHOD-SMELL.md` | method, checks, limits, changes after the plan |
| `smell_chemicals.py RUN_DIR` | the computation (reads the raw cases read-only; needs the unpacked `results/*/stats.json`) |
| `results-smell.json`, `results-smell.txt` | every number, with low / central / high, case, probe, number of draws, confidence |
| `speciation.json` | chemical shares of THC (HCN: of CO) with sources, flags and what was not estimated |
| `sources-*.json` | the three researchers' opened sources; new ids are also appended to `sources.json` |
