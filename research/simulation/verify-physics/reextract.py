#!/usr/bin/env python3
"""Independent verifier (fluid-dynamics lens). Reads raw OpenFOAM postProcessing files of one case with its
own parser (no import of stats.py/analyse.py) and recomputes:
  1. tailpipe mass flow from the 0/U dictionary values, rho = p/(R T) from thermophysicalProperties
  2. tracer balance per group: emitted (advective, tp patches) - out (all open/inlet patches) - change in inventory
  3. per-probe 1-s statistics with SAMPLE-AND-HOLD time weighting (stats.py uses linear interpolation onto 0.01 s)
     of the total exhaust fraction and of the nearest scooter's own tracer -> dilution mean / max10s / max1s
  4. CO P5/P50/P95 for chosen probes using draws.mjs (same draws) but own species algebra
Usage: python3 -I reextract.py CASE_DIR STATS_JSON [label-regex ...]
"""
import json, os, re, subprocess, sys, glob
import numpy as np

case, stats_path = sys.argv[1], sys.argv[2]
pats = sys.argv[3:] or [r"^K d=0\.5 dx=0\.0 h=0\.7$", r"^K d=1 dx=0\.0 h=1\.1$", r"^K d=1 dx=0\.0 h=1\.5$"]
meta = json.load(open(os.path.join(case, "case_meta.json")))
pp = os.path.join(case, "postProcessing")


def load(fo, fn):
    files = sorted(glob.glob(os.path.join(pp, fo, "*", fn)), key=lambda p: float(p.split(os.sep)[-2]))
    rows = []
    for f in files:
        for line in open(f):
            if line.startswith("#") or not line.strip():
                continue
            rows.append([float(v) for v in line.replace("(", " ").replace(")", " ").split()])
    a = np.array(rows)
    _, i = np.unique(a[:, 0], return_index=True)
    return a[i]


out = {"case": case}
# 1. mass flow from dictionaries
thermo = open(os.path.join(case, "constant", "thermophysicalProperties")).read()
W = float(re.search(r"molWeight\s+([\d.eE+-]+)", thermo).group(1))
R = 8314.47 / W
Udict = open(os.path.join(case, "0", "U")).read()
bnd = open(os.path.join(case, "constant", "polyMesh", "boundary")).read()
mf = {}
for p in meta["pipes"]:
    m = re.search(p["name"] + r"\s*\{\s*type fixedValue; value uniform \(([^)]*)\)", Udict)
    u = np.array([float(v) for v in m.group(1).split()])
    un = abs(u[0]) if p["dir"] in ("-x", "+x") else abs(u[1])
    rho = 1e5 / (R * p["T"])
    A = p["size"] ** 2
    flux = load(f"flux_{p['name']}", "surfaceFieldValue.dat")
    gi = meta["tracers"].index(p["tracer"])
    mf[p["name"]] = {"rho_exit": rho, "U_normal": un, "A_m2": A, "mdot_dict": rho * un * A,
                     "mdot_logged_mean": float(-flux[:, 1 + gi].mean()), "rho_ambient_L_per_s_25C": rho * un * A / (1e5 / (R * 298.15)) * 1e3,
                     "real_pipe_25mm_exit_velocity": rho * un * A / rho / (np.pi * 0.0125 ** 2),
                     "momentum_flux_ratio_patch_over_25mm_pipe": un / (rho * un * A / rho / (np.pi * 0.0125 ** 2))}
out["mass_flow"] = mf

# 2. tracer balance (my own route: integrate with sample-and-hold rectangles on the patch-flux time base)
T0 = meta["spinup"]
Mm = load("tracerMass", "volFieldValue.dat")
bal = {}
for gi, t in enumerate(meta["tracers"]):
    emit = None
    for p in meta["pipes"]:
        if p["tracer"] != t:
            continue
        d = load(f"flux_{p['name']}", "surfaceFieldValue.dat")
        tE = d[:, 0]
        emit = -d[:, 1 + gi] if emit is None else emit - np.interp(tE, d[:, 0], d[:, 1 + gi])
    outf = np.zeros_like(tE)
    per = {}
    for s in meta["inlets"] + meta["opens"]:
        d = load(f"flux_{s}", "surfaceFieldValue.dat")
        f = np.interp(tE, d[:, 0], d[:, 1 + gi]); outf += f
        per[s] = f
    w = tE >= T0
    dt = np.diff(tE[w])
    E = float((emit[w][1:] * dt).sum()); O = float((outf[w][1:] * dt).sum())
    dM = float(np.interp(tE[w][-1], Mm[:, 0], Mm[:, 1 + gi]) - np.interp(tE[w][0], Mm[:, 0], Mm[:, 1 + gi]))
    bal[t] = {"emitted": E, "out": O, "stored": dM, "err_pct": 100 * (E - O - dM) / E,
              "out_by_patch_pct": {s: float(100 * (per[s][w][1:] * dt).sum() / E) for s in per},
              "residence_proxy_s": float(Mm[-1, 1 + gi] / emit[-1]) if emit[-1] > 0 else None}
out["balance"] = bal

# 3. probe statistics, own route
labels = meta["scene"]["probeLabels"]
S = {t: load("probes", t) for t in meta["tracers"]}
st = json.load(open(stats_path))
norm = {t: st["tracer_normalisation"][t]["factor_applied"] for t in meta["tracers"]}
tt = S[meta["tracers"][0]][:, 0]
win = st["window_s"]
nb = int(round(win[1] - win[0]))


def bins_hold(t, y, t0, n):
    # value at step k held over (t_k-1, t_k]  (OpenFOAM writes end-of-step values)
    edges = t0 + np.arange(n + 1)
    tc = np.concatenate([[t0], t[(t > t0) & (t < t0 + n)], [t0 + n]])
    # piecewise constant: on (t_{k-1}, t_k] value y_k
    res = np.zeros(n)
    idx = np.searchsorted(t, tc[1:], side="left")
    vals = y[np.minimum(idx, len(y) - 1)]
    seg = np.diff(tc)
    mids = 0.5 * (tc[1:] + tc[:-1])
    b = np.floor(mids - t0).astype(int)
    np.add.at(res, b, vals * seg)
    return res


sel = [j for j, l in enumerate(labels) if any(re.search(p, l) for p in pats)]
rows = {}
draws = json.loads(subprocess.run(["node", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "draws.mjs"),
                                   os.path.join(case, "case_meta.json"), "1000", str(st["seed"]), st["emitters"]],
                                  capture_output=True, text=True, check=True).stdout)
mdot = meta["pipes"][0]["mdot"]
kCO = np.array([[dr["g"][t]["CO"] * 1e-6 / mdot * 28.96 / 28.01 * 1e6 for dr in draws["draws"]] for t in meta["tracers"]])
srow = {r["label"]: r for r in st["probes"]}
for j in sel:
    B = np.array([bins_hold(tt, S[t][:, 1 + j], win[0], nb) * norm[t] for t in meta["tracers"]])  # (g, nb)
    tot = B.sum(0)
    c = np.concatenate([[0], np.cumsum(tot)])
    m10 = ((c[10:] - c[:-10]) / 10).max()
    head = B[meta["tracers"].index("s_head")] if "s_head" in meta["tracers"] else None
    CO = kCO.T @ B  # (draw, nb)
    cc = np.concatenate([np.zeros((CO.shape[0], 1)), np.cumsum(CO, 1)], 1)
    co10 = ((cc[:, 10:] - cc[:, :-10]) / 10).max(1)
    p = lambda a: [float(v) for v in np.percentile(a, [5, 50, 95])]
    mine = {"dil_mean": 1 / tot.mean(), "dil_max10": 1 / m10, "dil_max1": 1 / tot.max(),
            "head_share_of_mean": float(head.sum() / tot.sum()) if head is not None else None,
            "CO_mean": p(CO.mean(1)), "CO_max10": p(co10), "CO_max1": p(CO.max(1))}
    r = srow[labels[j]]
    theirs = {"dil_mean": r["dilution_total"]["mean"], "dil_max10": r["dilution_total"]["max10s"], "dil_max1": r["dilution_total"]["max1s"],
              "head_share_of_mean": r.get("dilution_nearest", {}).get("share_of_total_mean"),
              "CO_mean": [r["CO"]["mean"][k] for k in ("P5", "P50", "P95")],
              "CO_max10": [r["CO"]["max10s"][k] for k in ("P5", "P50", "P95")],
              "CO_max1": [r["CO"]["max1s"][k] for k in ("P5", "P50", "P95")]}
    rows[labels[j]] = {"mine": mine, "stats_json": theirs}
out["probes"] = rows
out["n_probe_samples_in_window"] = int(((tt >= win[0]) & (tt <= win[1])).sum())
out["dt_probe_median"] = float(np.median(np.diff(tt[(tt >= win[0]) & (tt <= win[1])])))
print(json.dumps(out, indent=1, default=float))
