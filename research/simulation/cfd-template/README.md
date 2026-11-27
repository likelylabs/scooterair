# Scooter kerb-air CFD template (OpenFOAM v2506, buoyantPimpleFoam LES)

Research tool only. It computes the time-resolved dilution of hot idle exhaust
from scooters at a red light, around simple blocks (scooters, riders, kerb,
people, buildings, arcade). It carries **unit tracers** (exhaust mass fraction
s = 1 at the tailpipe), so any species follows in post-processing:
`ppm = s x (raw mole fraction in the exhaust) x 1e6`, dilution = 1/s.
Nothing in the CFD is tuned to any threshold; emission rates are applied
afterwards (PLAN.md section 2).

## Install (Ubuntu 24.04 "noble", done 2026-11-27)

```
apt-get update
# Ubuntu's own package is old (openfoam 1912); the vendor repository was reachable:
curl -sS https://dl.openfoam.com/pubkey.gpg | gpg --dearmor > /etc/apt/trusted.gpg.d/openfoam.gpg
echo "deb [arch=amd64] https://dl.openfoam.com/repos/deb noble main" > /etc/apt/sources.list.d/openfoam.list
apt-get update
apt-get install -y openfoam2506 openfoam2506-tutorials
pip install --break-system-packages matplotlib==3.9.2     # plots only
source /usr/lib/openfoam/openfoam2506/etc/bashrc            # in every shell
```
(The two repository lines are what dl.openfoam.com/add-debian-repo.sh does.)

## Files

| file | what it does |
|---|---|
| `make_pack.py` | writes a scene JSON for a red-light queue in the PLAN.md frame (stop line x=0, kerb face y=0, pavement y<0): box rows x columns, kerb-lane queue, wind speed/direction/turbulence, still air, canyon, arcade, `--grade fast|fine`; probe sets K, KL, B, R, V, SRC, AR |
| `make_case.py` | scene JSON -> OpenFOAM case (blockMesh, castellated snappyHexMesh of grid-aligned boxes, tailpipe patches by topoSet/createPatch, 0/ fields, LES, tracers, probes, flux and inventory function objects) |
| `run.sh CASE [nProcs]` | mesh + run (serial if nProcs=1, else MPI); writes `walltime.txt` |
| `mesh_only.sh CASE` | mesh and checkMesh only (cell counts for planning) |
| `analyse.py CASE [--xco 0.0081]` | tracer mass balance (acceptance A1) and per-probe 90-s mean, highest 10 s, highest 1 s, instantaneous max, dilution |
| `plot_plume.py CASE OUT.png` | time-mean plume on three planes through the first tailpipe |
| `scenes/*.json` | smoke tests (one scooter, 2.5 / 5 / 10 cm) and pack scenes |

```
python3 make_pack.py scenes/S1.json --box 2 4 --queue 1 4 --wind 0.8 --dirDeg -45
python3 make_case.py scenes/S1.json ../cases/S1
./run.sh ../cases/S1 1 > ../cases/S1/log.run 2>&1      # or 3 for MPI when the machine is quiet
python3 analyse.py ../cases/S1 > ../cases/S1/analysis.json
```

## Physics choices

* **Solver:** `buoyantPimpleFoam` (compressible, perfect gas, sensible enthalpy,
  p_rgh formulation) - the exhaust is hot (250 C baseline), so buoyancy comes
  from the real density field, not a Boussinesq approximation.
* **Turbulence: LES, WALE sub-grid model**, cube-root-volume filter width,
  Spalding wall function on all solids. Seconds-scale peaks are the point of
  the job; LES resolves the large plume-meandering eddies that make them.
  URANS would give a smooth ensemble mean (1-s and 10-s peaks only via a
  separate fluctuation model) and k-epsilon type models laminarise or
  misbehave in near-calm, buoyancy-driven flow. LES cannot resolve the first
  ~10 cm of a 25 mm jet on an affordable mesh: there the source is a
  cell-sized patch carrying the correct mass, heat and buoyancy flux (see
  "source model").
* **Tracers:** `scalarTransport` function objects, one per emitter group
  (PLAN: headline scooter, rest of kerb-lane column, box row 1, box row 2,
  queue). Diffusivity = mu/Sc + mu_t/Sc_t with Sc = 1, Sc_t = 0.6
  (`tracerSct`). Passive: linear in emission, so emission Monte Carlo is post-processing.
* **Source model:** tailpipe = square patch of whole finest cells on the rear
  face of a muffler block, fixed velocity vector giving exactly the specified
  mass flow (rho from the ideal gas at the exit temperature) at 10 deg up,
  fixed T, s = 1. Mass and buoyancy flux are exact; momentum flux is lower than
  a real 25 mm pipe by the area ratio (x1.3 at 2.5 cm cells, x5 at 5 cm). The
  jet momentum length l_M = M^(3/4)/B^(1/2) is about 0.1 m, and in 0.3 m/s
  cross-flow the momentum is bent over within about 0.1 m, so beyond
  ~0.2-0.3 m the plume is set by buoyancy and ambient turbulence.
* **Engine heat:** each scooter releases `engineHeatW` (default 1000 W) as a
  volumetric enthalpy source (`constant/fvOptions`, scalarSemiImplicitSource
  on h) in the ~0.15 m3 of air round and under its engine block, standing in
  for the fan-cooled shroud air. Idle fuel 120 g/h x 43 MJ/kg is about 1.4 kW,
  nearly all becoming heat; the exhaust gas itself carries only ~0.1 kW
  sensible heat at 250 C. ASSUMPTION (energy balance, no measurement); in still
  air this heat drives the flow. A wall heat flux (externalWallHeatFluxTemperature,
  mode power) was tried first and gave wall-cell temperatures near 2900 K, so it
  is not used.
* **Diagnostics:** `fieldMinMax` of T and U every step
  (postProcessing/minmax) - check it before trusting a case.
* **Wind:** DFSEM synthetic turbulence (`turbulentDFSEMInlet`) on every side
  the mean wind enters (1 or 2 sides for oblique wind), horizontally isotropic
  Reynolds stress from sigma_h, sigma_w (defaults 0.3 / 0.15 m/s = PLAN floors),
  length scale 0.8 m. Uniform mean or log profile (`profile: log`, mapped
  boundary data written by make_case).
* **Still air ("true calm"):** no inlet at all; every side and the top are
  open (`totalPressure` on p_rgh with p0 = ambient, `pressureInletOutletVelocity`,
  `inletOutlet` for T and tracers). The plumes and engine heat drive their own
  entrainment flow. A wandering 0.3 m/s meander (PLAN S2) is not implemented
  (would need time-varying inflow on all sides).
* **PIMPLE:** 2 outer correctors, 2 pressure correctors, maxCo 0.8. With 1
  outer corrector the 12-scooter case developed spurious 9-14 m/s velocities
  beside the tailpipes after ~1.5 s and the time step collapsed to 0.002 s;
  a more dissipative momentum scheme or switching the engine heat off did not
  cure it, 2 outer correctors did (max |U| 1.7 m/s, dt ~0.04 s). The
  single-scooter smoke tests were stable with 1 outer corrector.
* **Open boundaries:** `totalPressure` on **p_rgh** (not `prghTotalPressure`,
  whose p0 is static p; a uniform p0 over a 3 m high open side drove a 2 m/s
  spurious downdraft in the first test).

## Gridding (castellated, grid-aligned boxes; dx0 = 0.8 m, level n = dx0/2^n)

* `fast`: 5 cm tailpipe cells (level 4, zone 0.45 x 0.3 x 0.3 m round each
  exit), 10 cm over the headline/K-probe zone (level 3), 20 cm over the pack
  (level 2), 40 cm round it, 80 cm far field.
* `fine` (PLAN.md resolution spec): 2.5 cm at the exits, 5 cm within ~2 m of
  sources and probes, 10/20/40 cm outward. Not affordable on 3 cores for packs
  (see the smoke-test and scaling notes in the report / cfd-template README).

Obstacles are snapped to the grid of their level; make_case refuses a box that
collapses, and run.sh refuses a case whose tailpipe patch got no faces.

## Practical notes

* With other jobs loading the machine (load average 15-20 on 4 cores during
  testing), MPI runs were pathological (14 s per step on 56 k cells): ranks
  wait for descheduled peers at every reduction. Run several **serial** cases
  side by side (one core each) when the machine is busy; use MPI only when it
  is quiet.
* Writes: fields only at the end (writeInterval = spinup + duration); probes,
  fluxes and tracer inventory every time step.

## Smoke test (2026-11-27) - `smoke-results.json`, `plume_smoke_2.5cm.png`

One scooter (body, engine block, muffler; no rider), tailpipe 0.4 m high,
250 C, 5.5e-4 kg/s, 10 deg up, rearward; 0.5 m/s cross-flow toward the
pavement side with DFSEM turbulence; domain 5.6 x 3.2 x 3.2 m; 20 s; serial.
Run with 1 PIMPLE outer corrector (the generator now writes 2; `case_smoke/` is
the current generator's version of the same scene). Raw case: scratchpad/sim/run/cases/smoke*.

| grid | cells | mean dt | steps | wall (1 core, busy machine) | tracer balance error |
|---|---|---|---|---|---|
| 2.5 cm finest, 5 cm near field | 64,968 | 0.0106 s | 1,894 | 945 s solve + 11 s mesh | -0.02 % |
| 5 cm finest, 5 cm near field | 61,727 | 0.024 s | 857 | 624 s + 10 s | -0.18 % |
| 10 cm finest, 10 cm near field | 25,470 | 0.05 s | 416 | 76 s + 3 s | -0.58 % |

Balance = (emitted - out through all open faces - change in domain inventory) / emitted
over 0-20 s; the emitted flux equals the specified mdot to 0.005 %.
Grid sensitivity (time-mean over 8-20 s at 0.45-1.5 m sideways, 0.3 m behind the pipe):
the coarser grids put less exhaust low down and more higher up. At 0.4-0.7 m height
the 10 cm grid gives 0.34-0.68 x and the 5 cm grid 0.47-0.84 x the 2.5 cm means; at
1.1-1.5 m the 10 cm grid gives 1.5-2.0 x. Highest 1-s values differ by factors up to
3-6 in both directions. Part of this is sampling noise (a 12-s window is short for
turbulent statistics), part is resolution. The 2.5 cm grid is not shown to be
converged. Conclusion: statistics within ~1 m of a tailpipe are grid-dependent by
factors of 2-6 below 2.5 cm resolution; they need the 2.5 cm (or finer) near-field
set-up, longer records, and the PLAN's grid check (A3) before any number is used.

## Cost on 3 cores (measured 2026-11-27, MPI, machine load ~4, 2 outer correctors)

| case | cells | dt | wall per step | 90 s red | +20 s spin-up | +60 s spin-up (PLAN) |
|---|---|---|---|---|---|---|
| S1 dozen, `fast` (12 scooters) | 228,444 | 0.041 s | 1.27 s | ~46 min | ~57 min | ~78 min |
| S2 box, `fast` (36 scooters) | 397,168 | 0.047 s | 2.21 s | ~70 min | ~86 min | ~118 min |
| S1 dozen, `fine` (PLAN resolution) | 3,747,778 | ~0.011 s (est.) | ~21 s (est.) | ~47 h | | |

Wall per step on 3 cores is about 5.5 microseconds x cells. The 2.5 cm exit
cell (1.3 m/s exit velocity) sets dt ~0.011 s; 5 cm exits allow ~0.04 s.
With MPI on a heavily loaded machine (load 15-20) the same solver ran 10-20x
slower than this; run serial cases side by side then.

To finish a 90-s red in well under an hour: (1) compute the wind spin-up once
and restart every red from it (no per-red spin-up); (2) keep 10 cm cells only
round the K probes out to 1 m and behind the last row, 20 cm over the rest of
the pack (target ~150 k cells for 12 scooters -> ~35 min); (3) for 30+
scooters, represent scooters away from the kerb-lane column as volumetric
tracer + heat sources in 20 cm cells instead of meshed mufflers (not yet
implemented; target ~200 k cells -> ~45 min); (4) get the first metre behind
the nearest tailpipe from separate 2.5 cm near-field runs (smoke-sized domain
with the neighbours as blocks, ~65 k cells, ~25 min per 30 s serial) and add
that tracer by superposition, labelled as such.
