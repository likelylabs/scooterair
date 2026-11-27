#!/bin/bash
# Mesh, decompose and run a case made by make_case.py.  Usage: ./run.sh CASE [nProcs]
# Uses at most nProcs (default 3) cores. Logs go to CASE/log.*; wall times to CASE/walltime.txt
set -e
CASE=$(readlink -f "$1"); NP=${2:-3}
source /usr/lib/openfoam/openfoam2506/etc/bashrc || true
cd "$CASE"
t0=$(date +%s)
blockMesh > log.blockMesh 2>&1
snappyHexMesh -overwrite > log.snappyHexMesh 2>&1
topoSet > log.topoSet 2>&1
createPatch -overwrite > log.createPatch 2>&1
if grep -q "now size 0" log.topoSet; then echo "a tailpipe patch got no faces (grid alignment): see log.topoSet"; exit 2; fi
checkMesh > log.checkMesh 2>&1 || true
rm -rf 0 && cp -r 0.orig 0
grep -E "cells:|Mesh OK|Failed" log.checkMesh | head -3
foamDictionary -entry numberOfSubdomains -set $NP system/decomposeParDict > /dev/null
t1=$(date +%s)
if [ "$NP" -gt 1 ]; then
  decomposePar -force > log.decomposePar 2>&1
  mpirun --allow-run-as-root --oversubscribe -np $NP buoyantPimpleFoam -parallel > log.buoyantPimpleFoam 2>&1
  reconstructPar -latestTime > log.reconstructPar 2>&1 || true
else
  buoyantPimpleFoam > log.buoyantPimpleFoam 2>&1
fi
t2=$(date +%s)
echo "mesh_s $((t1-t0)) solve_s $((t2-t1)) nProcs $NP" | tee walltime.txt
