#!/bin/bash
# Run one scenario from research/simulation/scenarios.json by id, end to end:
#   scene (cfd/make_pack.py) -> OpenFOAM case (cfd/make_case.py) -> mesh + buoyantPimpleFoam LES (cfd/run.sh)
#   -> mass balance (cfd/analyse.py) -> agreed statistics (stats.py) -> pictures (plot_slices.py)
#   -> small results copied to research/simulation/results/<id>/
#
# Usage: run-scenario.sh <id> [--np N] [--mesh-only] [--post-only] [--resume] [--emitters fleet|nearestHigh|nearest2s|packHigh]
#   --np N        MPI ranks (default 3, never more than 3 on this machine)
#   --mesh-only   build and check the mesh, report cells, stop
#   --post-only   skip meshing and solving; redo statistics and pictures from a finished case
#   --resume      continue an interrupted solver run from its latest written time, then post-process
# Cases live in $SIM_RUN/<id>/case (default: scratchpad/sim/run, three levels above this folder's parent).
# Every run writes walltime.txt in the case. Nothing here reads or tunes toward any guideline value.
set -euo pipefail
ID=${1:?usage: run-scenario.sh <id> [--np N] [--mesh-only] [--post-only]}; shift
HERE=$(dirname "$(readlink -f "$0")")
RUN=${SIM_RUN:-$(readlink -f "$HERE/../../../run")}
NP=3; MODE=all; EMIT=fleet
while [ $# -gt 0 ]; do
  case "$1" in
    --np) NP=$2; shift 2;;
    --mesh-only) MODE=mesh; shift;;
    --post-only) MODE=post; shift;;
    --resume) MODE=resume; shift;;
    --emitters) EMIT=$2; shift 2;;
    *) echo "unknown option $1"; exit 1;;
  esac
done
[ "$NP" -le 3 ] || { echo "at most 3 cores on this machine"; exit 1; }
OUT=$RUN/$ID; CASE=$OUT/case
mkdir -p "$OUT"
ARGS=$(python3 - "$HERE/scenarios.json" "$ID" <<'EOF'
import json, sys, shlex
reg = json.load(open(sys.argv[1])); sid = sys.argv[2]
s = reg["scenarios"].get(sid)
if s is None:
    sys.exit(f"no scenario '{sid}'; known: {' '.join(reg['scenarios'])}")
if s.get("pack") is None:
    if "of" in s:
        print("POST " + s["of"] + " " + " ".join(s["post"])); sys.exit(0)
    sys.exit(f"scenario {sid}: {s['status']}")
print(" ".join(shlex.quote(a) for a in reg["common"] + s["pack"]))
EOF
)
if [[ "$ARGS" == POST* ]]; then      # pure post-processing scenario (S4): statistics of another case with other emitters
  read -r _ BASE REST <<< "$ARGS"
  python3 "$HERE/stats.py" "$RUN/$BASE/case" $REST --out "$OUT/stats.json"
  mkdir -p "$HERE/results/$ID"; cp "$OUT/stats.json" "$HERE/results/$ID/"
  exit 0
fi
if [ "$MODE" = resume ]; then
  RESUME=1 "$HERE/cfd/run.sh" "$CASE" "$NP"
elif [ "$MODE" != post ]; then
  eval python3 "$HERE/cfd/make_pack.py" "$OUT/scene.json" $ARGS
  python3 "$HERE/cfd/make_case.py" "$OUT/scene.json" "$CASE"
  if [ "$MODE" = mesh ]; then "$HERE/cfd/mesh_only.sh" "$CASE"; exit 0; fi
  "$HERE/cfd/run.sh" "$CASE" "$NP"
fi
python3 "$HERE/cfd/analyse.py" "$CASE" > "$OUT/analysis.json"
python3 "$HERE/stats.py" "$CASE" --emitters "$EMIT" --out "$OUT/stats.json"
python3 "$HERE/plot_slices.py" "$CASE" "$OUT" || echo "plot failed (statistics are still valid)"
mkdir -p "$HERE/results/$ID"
cp "$OUT/stats.json" "$OUT/scene.json" "$CASE/walltime.txt" "$HERE/results/$ID/" 2>/dev/null || true
cp "$OUT"/*.png "$OUT"/series_*.csv "$HERE/results/$ID/" 2>/dev/null || true
echo "done: $OUT  (kept copy: $HERE/results/$ID)"
