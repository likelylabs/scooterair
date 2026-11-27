#!/usr/bin/env python3
"""Acceptance A2 (PLAN 6): Kaohsiung IOT kerb-sensor reproduction from case A.
Sensor model: first-order response, tau = 30 s (ASSUMPTION, PLAN A2), applied to the 1-s CO increment at each I probe
(2-8 m ahead of the stop line, 2.5-5 m to the pavement side of the kerb-lane tailpipe column, 1.2 / 1.5 m), then the
highest 1-min running mean over the red; per emission draw the highest over all I probes ('highest sensor position')
and the value at each probe. Same 1,000 emission draws as stats.py (draws.mjs, seed 20261127).
Observed: highest 1-min about 1.3 ppm total over 48 h, station 0.1-0.5 ppm -> 0.8-1.2 ppm increment (iot-113-tb006).
Pass (b) for the single red run: highest 1-min increment within 0.3-3 ppm. (a) needs the median red over 8 directions: not testable.
Usage: python3 a2_iot.py CASE OUT.json
"""
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "cfd"))
from analyse import series  # noqa
from stats import bins1s, M_AIR, M_CO  # noqa

case, out = os.path.abspath(sys.argv[1]), sys.argv[2]
meta = json.load(open(os.path.join(case, "case_meta.json")))
lab = meta["scene"]["probeLabels"]; tr = meta["tracers"]; T0 = meta["spinup"]; mdot = meta["pipes"][0]["mdot"]
I = [j for j, l in enumerate(lab) if l.startswith("I ")]
S = np.stack([bins1s(*(lambda d: (d[:, 0], d[:, 1:]))(series(case, "probes", t)), T0, 90.0).T[I] for t in tr], 1)  # (probe, group, t)
D = json.loads(subprocess.run(["node", os.path.join(HERE, "draws.mjs"), os.path.join(case, "case_meta.json"), "1000", "20261127", "fleet"],
                              capture_output=True, text=True, check=True).stdout)
k = np.array([[dr["g"][t]["CO"] * 1e-6 / mdot * M_AIR / M_CO * 1e6 for dr in D["draws"]] for t in tr])  # (group, draw)
X = np.einsum("pgt,gd->pdt", S, k)                         # 1-s CO increment, ppm
tau, nT = 30.0, X.shape[-1]
Y = np.zeros_like(X); a = np.exp(-1.0 / tau)
for i in range(1, nT):
    Y[..., i] = a * Y[..., i - 1] + (1 - a) * X[..., i]
c = np.cumsum(np.concatenate([np.zeros(Y.shape[:-1] + (1,)), Y], -1), -1)
w = min(60, nT)
m1 = ((c[..., w:] - c[..., :-w]) / w).max(-1)              # (probe, draw) highest 1-min of the sensor signal
raw1 = ((np.cumsum(np.concatenate([np.zeros(X.shape[:-1] + (1,)), X], -1), -1)[..., w:] -
         np.cumsum(np.concatenate([np.zeros(X.shape[:-1] + (1,)), X], -1), -1)[..., :-w]) / w).max(-1)
q = lambda v: {"P5": float(np.percentile(v, 5)), "P50": float(np.percentile(v, 50)), "P95": float(np.percentile(v, 95))}
best = m1.max(0)
res = {"case": case, "window_s": [T0, T0 + nT], "sensor": "first-order tau 30 s, highest 1-min running mean",
       "averaging_window_s": int(w),
       "highest_over_I_probes_ppm": q(best),
       "highest_over_I_probes_no_sensor_lag_ppm": q(raw1.max(0)),
       "note": "if the red record is shorter than 60 s the window is the whole record; the lagged value then under-reads a 1-min mean of a longer red and the no-lag value is the better estimate of its plateau", "mean_over_I_probes_ppm": q(m1.mean(0)),
       "per_probe_P50_ppm": {lab[j]: float(np.percentile(m1[i], 50)) for i, j in enumerate(I)},
       "per_probe_P50_no_sensor_lag_ppm": {lab[j]: float(np.percentile(raw1[i], 50)) for i, j in enumerate(I)},
       "observed_increment_ppm": [0.8, 1.2],
       "A2b_pass_P50_highest_probe_in_0.3_3": bool(0.3 <= np.percentile(best, 50) <= 3.0),
       "A2b_share_of_draws_in_0.3_3_highest_probe": float(((best >= 0.3) & (best <= 3)).mean()),
       "A2a": "not testable: one red, one direction (from the pack toward the sensor area)"}
json.dump(res, open(out, "w"), indent=1); print(json.dumps({k_: res[k_] for k_ in ("highest_over_I_probes_ppm", "mean_over_I_probes_ppm", "A2b_pass_P50_highest_probe_in_0.3_3")}))
