#!/usr/bin/env python3
"""Verification correction (PLAN 9.24, comparisons lens): converted contributions and stay-through extrapolations
with emissions REDRAWN for every red, at chosen probes of one finished case.

Usage: python3 stay_through.py CASE STATS_JSON [--label "K d=0.5 dx=0.0 h=0.7" ...] [--n 1000] [--reps 20000]

For each probe:
  one_red: the red-window mean (CO ppm, benzene ppb) and its converted contribution to a 15-min mean
           (x W/900, W = the simulated red window in s) and to a 1-h mean (x W/3600);
  stay_through: someone standing at that probe through every red of 15 min / 1 h, red = 45 % or 65 % of the
           cycle, nothing added during green (no green-phase traffic, no pull-away, no carry-over: ASSUMPTION).
           Number of reds = duty x period / 90 s. Each red gets an independent pack (a fresh emission draw);
           the flow is the same single simulated red every time (one realisation, labelled).
           'same_pack_every_red' (the earlier method) is kept beside it for comparison.
Reads the per-group tracer normalisation and the emitter mode from STATS_JSON so the draws are identical to stats.py.
"""
import json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "cfd"))
from stats import bins1s, M_AIR, M_CO, M_BZ  # noqa: E402
from analyse import series  # noqa: E402


def qd(a):
    p = np.percentile(a, [5, 50, 95]); return {"P5": round(float(p[0]), 4), "P50": round(float(p[1]), 4), "P95": round(float(p[2]), 4)}


def main():
    case, sp = os.path.abspath(sys.argv[1]), sys.argv[2]
    a = sys.argv
    labels_want = [a[i + 1] for i, x in enumerate(a) if x == "--label"]
    ndraw = int(a[a.index("--n") + 1]) if "--n" in a else 1000
    reps = int(a[a.index("--reps") + 1]) if "--reps" in a else 20000
    st = json.load(open(sp))
    meta = json.load(open(os.path.join(case, "case_meta.json")))
    labels = meta["scene"]["probeLabels"]; tracers = meta["tracers"]; mdot = meta["pipes"][0]["mdot"]
    T0, T1 = st["window_s"]; W = T1 - T0
    idx = [labels.index(l) for l in labels_want]
    S = {}
    for t in tracers:
        d = series(case, "probes", t)
        S[t] = bins1s(d[:, 0], d[:, 1:][:, idx], T0, W).T * st["tracer_normalisation"][t]["factor_applied"]
    dj = subprocess.run(["node", os.path.join(HERE, "draws.mjs"), os.path.join(case, "case_meta.json"), str(ndraw),
                         str(st.get("seed", 20261127)), st["emitters"]], capture_output=True, text=True, check=True).stdout
    D = json.loads(dj)["draws"]
    kCO = np.array([[dr["g"][t]["CO"] * 1e-6 / mdot * M_AIR / M_CO * 1e6 for dr in D] for t in tracers])
    kBZ = np.array([[dr["g"][t]["BZ"] * 1e-9 / mdot * M_AIR / M_BZ * 1e9 for dr in D] for t in tracers])
    rng = np.random.default_rng(20261127)
    out = {"case": os.path.basename(os.path.dirname(case)), "emitters": st["emitters"], "red_window_s": W,
           "method": __doc__.strip().splitlines()[0], "probes": {}}
    for j, lab in enumerate(labels_want):
        Sg = np.stack([S[t][j] for t in tracers])          # (group, t)
        mCO = (Sg.mean(1)[:, None] * kCO).sum(0)           # per-draw red mean
        mBZ = (Sg.mean(1)[:, None] * kBZ).sum(0)
        r = {"CO_red_mean_ppm": qd(mCO), "CO_one_red_to_15min_ppm": qd(mCO * W / 900), "CO_one_red_to_1h_ppm": qd(mCO * W / 3600),
             "BZ_red_mean_ppb": qd(mBZ), "BZ_one_red_to_1h_ppb": qd(mBZ * W / 3600), "stay_through": {}}
        for duty in (0.45, 0.65):
            for per, name in ((900, "15min"), (3600, "1h")):
                n = max(1, int(round(duty * per / 90.0)))
                pick = rng.integers(0, ndraw, size=(reps, n))
                r["stay_through"][f"duty{duty}_{name}"] = {
                    "n_reds": n,
                    "CO_ppm_fresh_pack_each_red": qd(duty * mCO[pick].mean(1)),
                    "CO_ppm_same_pack_every_red": qd(duty * mCO),
                    "BZ_ppb_fresh_pack_each_red": qd(duty * mBZ[pick].mean(1)),
                    "BZ_ppb_same_pack_every_red": qd(duty * mBZ),
                    "share_above_reference_fresh_pack": {
                        "CO": round(float((duty * mCO[pick].mean(1) > (87.0 if name == "15min" else 31.0)).mean()), 4),
                        "CO_ref_ppm": 87.0 if name == "15min" else 31.0,
                        "BZ_over_8.5ppb": round(float((duty * mBZ[pick].mean(1) > 8.5).mean()), 4) if name == "1h" else None}}
        out["probes"][lab] = r
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
