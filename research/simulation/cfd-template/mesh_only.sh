#!/bin/bash
# Build and check the mesh of a generated case without running the solver. Usage: ./mesh_only.sh CASE
set -e; CASE=$(readlink -f "$1"); source /usr/lib/openfoam/openfoam2506/etc/bashrc || true; cd "$CASE"
t0=$(date +%s)
blockMesh > log.blockMesh 2>&1; snappyHexMesh -overwrite > log.snappyHexMesh 2>&1
topoSet > log.topoSet 2>&1; createPatch -overwrite > log.createPatch 2>&1; ! grep -q "now size 0" log.topoSet || { echo "tailpipe patch empty"; exit 2; }; checkMesh > log.checkMesh 2>&1 || true
rm -rf 0 && cp -r 0.orig 0
echo "mesh_s $(( $(date +%s)-t0 ))"; grep -E "cells:|Mesh OK|Failed" log.checkMesh | head -3
grep -c "now size [1-9]" log.topoSet | sed 's/^/tailpipe faceSet ops with faces: /'
