#!/usr/bin/env python3
"""Acceptance A6 during or after a run: mean wind and resolved turbulence at the IN probes
(1.5 m and 6 m upstream of the pack's most upwind corner) over a time window.
Usage: python3 inflow_check.py CASE T0 T1
"""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "cfd"))
from analyse import series  # noqa: E402

case, T0, T1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
meta = json.load(open(os.path.join(case, "case_meta.json")))
sc = meta["scene"]; lab = sc["probeLabels"]; wind = sc["wind"]
d = series(case, "probes", "U")
w = (d[:, 0] >= T0) & (d[:, 0] <= T1)
U = d[w, 1:].reshape(w.sum(), -1, 3)
print(f"window {T0}-{T1} s, {w.sum()} samples; target U {wind.get('targetSpeed', wind['speed'])} m/s, inflow {wind['speed']} m/s, turbulence {wind['turbulence']}")
print("probe                 U_along  sig_v  sig_w  sig_v/U sig_w/U")
for j, l in enumerate(lab):
    if not l.startswith("IN"):
        continue
    u = U[:, j, :]
    mv = u[:, :2].mean(0); f = mv / np.hypot(*mv); n = np.array([-f[1], f[0]])
    a = u[:, :2] @ f; c = u[:, :2] @ n
    print(f"{l:20s} dir {np.degrees(np.arctan2(f[1], f[0])):6.1f}  {a.mean():6.3f}  {c.std():5.3f}  {u[:, 2].std():5.3f}  {c.std() / a.mean():6.2f}  {u[:, 2].std() / a.mean():6.2f}")
print("A6 targets: U within +-10 %; sigma_v/U 0.3-0.6, sigma_w/U 0.2-0.35 (or floors 0.2 / 0.1 m/s when U <= 0.5)")
