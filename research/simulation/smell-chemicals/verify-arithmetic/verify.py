#!/usr/bin/env python3
"""Independent arithmetic re-derivation (sceptic step). Written WITHOUT reading smell_chemicals.py.

Inputs: raw per-group tracer probe series of the finished flow cases (read-only), the signed stats.json
(only for the tracer normalisation factors and as a comparison target), draws_<case>.json produced here by
running the unchanged draws.mjs (fleet, N 1000, seed 20261127, as stats.json), speciation.json (toluene share).

Usage: python3 -I verify.py RUN_DIR   (RUN_DIR holds the raw flow cases, RUN_DIR/<case>/case, read-only,
       as for smell_chemicals.py; the SIM_RUN environment variable may give it instead; writes verify-out.json next to this file)
"""
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SIM = os.path.abspath(os.path.join(HERE, "..", ".."))
RUN = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SIM_RUN", os.path.join(SIM, "run")))
sys.path.insert(0, os.path.join(SIM, "cfd"))
from analyse import series  # noqa: E402  (file reader only)

M_AIR, M_BZ, M_TOL, M_CH = 28.96, 78.11, 92.14, 13.85
F_REF = 120.0
VM30 = 8.314462 * 303.15 / 101.325      # L/mol at 30 C, 1 atm = 24.87
VM25 = 8.314462 * 298.15 / 101.325      # 24.47
PROBES = ["K d=0.5 dx=0.0 h=0.7", "K d=0.5 dx=0.0 h=1.5", "K d=0.5 dx=0.0 h=0.6"]
spec = json.load(open(os.path.join(SIM, "smell-chemicals", "speciation.json")))
tol = [c for c in spec["chemicals"] if c["key"] == "toluene"][0]


def bins(tt, y, T0, n):
    grid = np.arange(T0, T0 + n, 0.01) + 0.005
    return np.interp(grid, tt, y)[: n * 100].reshape(n, 100).mean(1)


def tri(rng, a, c, b, n):
    return rng.triangular(a, c, b, n)


out = {}
for case in ("S1-from", "NF1-fine"):
    cdir = os.path.join(RUN, case, "case")
    meta = json.load(open(os.path.join(cdir, "case_meta.json")))
    st = json.load(open(os.path.join(SIM, "results", case, "stats.json")))
    labels = meta["scene"]["probeLabels"]
    T0, T1 = st["window_s"]; n = int(round(T1 - T0))
    mdot = meta["pipes"][0]["mdot"]
    tracers = meta["tracers"]
    D = json.load(open(os.path.join(HERE, f"draws_{case}.json")))
    nd = len(D["draws"])
    # per-draw per-group emissions
    F10 = np.array([[d["g"][t]["F_hc10"] for d in D["draws"]] for t in tracers])        # g/h, odour weighted
    THC = np.array([[d["g"][t]["THC"] for d in D["draws"]] for t in tracers]) * 1e-6     # kg/s
    BZ = np.array([[d["g"][t]["BZ"] for d in D["draws"]] for t in tracers]) * 1e-9       # kg/s
    rng = np.random.default_rng(424242)
    ftol = tri(rng, tol["low"] / 100, tol["central"] / 100, tol["high"] / 100, nd)       # mass share of THC
    res = {}
    csv = np.genfromtxt(os.path.join(SIM, "results", case, "series_1s.csv"), delimiter=",", names=True)
    for lab in PROBES:
        j = labels.index(lab)
        S = []
        for t in tracers:
            d = series(cdir, "probes", t)
            S.append(bins(d[:, 0], d[:, 1 + j], T0, n) * st["tracer_normalisation"][t]["factor_applied"])
        S = np.array(S)                                          # (group, t)
        Stot = S.sum(0)
        # cross-check against kept exhaust fraction series where present
        key = "exhaust_fraction" + lab.replace(" ", "_").replace("=", "").replace(".", "")
        kept = None
        for nm in csv.dtype.names:
            if nm.startswith("exhaust_fraction") and lab.replace(" ", "_").replace("=", "").replace(".", "") in nm.replace(".", ""):
                kept = csv[nm]
        bz = np.einsum("gt,gd->dt", S, BZ / mdot * M_AIR / M_BZ * 1e9)                   # ppb (draw, t)
        thc_mass = np.einsum("gt,gd->dt", S, THC / mdot)                                  # mass fraction THC
        tolp = thc_mass * ftol[:, None] * M_AIR / M_TOL * 1e9
        r = {"kept_series_max_rel_diff": (float(np.max(np.abs(kept - Stot)) / Stot.max()) if kept is not None else None)}
        for DT in (800, 6800):
            OU = np.einsum("gt,gd->dt", S, F10 / F_REF) * DT
            sm = OU >= 1
            share = sm.mean(1)
            has = sm.any(1)
            bz_sm = np.array([bz[i, sm[i]].mean() if has[i] else np.nan for i in range(nd)])
            bz_sm_max = np.array([bz[i, sm[i]].max() if has[i] else np.nan for i in range(nd)])
            tol_sm = np.array([tolp[i, sm[i]].mean() if has[i] else np.nan for i in range(nd)])
            # conditioning check: ratio benzene/OU in smellable seconds
            q = lambda a: [float(x) for x in np.nanpercentile(a, [5, 50, 95])]
            r[f"DT{DT}"] = {"share_smellable_P5_50_95": q(share), "draws_with_any_smellable": float(has.mean()),
                            "bz_mean_in_smellable_ppb": q(bz_sm), "bz_max_smellable_second_ppb": q(bz_sm_max),
                            "toluene_mean_in_smellable_ppb": q(tol_sm),
                            "bz_mean_in_smellable_ppb_if_draws_without_smell_counted_as_0": q(np.nan_to_num(bz_sm))}
        bzmean = bz.mean(1)
        r["bz_red_mean_ppb"] = [float(x) for x in np.percentile(bzmean, [5, 50, 95])]
        c1h = bzmean * (T1 - T0) / 3600 if case != "NF1-fine" else bzmean * 90 / 3600
        r["bz_one_red_1h_contribution_ppb"] = [float(x) for x in np.percentile(c1h, [5, 50, 95])]
        r["bz_one_red_1h_contribution_ugm3_30C"] = [float(x * M_BZ / VM30) for x in np.percentile(c1h, [5, 50, 95])]
        r["bz_one_red_1h_contribution_ugm3_25C"] = [float(x * M_BZ / VM25) for x in np.percentile(c1h, [5, 50, 95])]
        # signed stats for comparison
        sp = [p for p in st["probes"] if p["label"] == lab][0]
        r["signed"] = {"BZ_mean": sp["BZ"]["mean"], "BZ_1h": sp["BZ"]["contribution_1h_mean"],
                       "share_DT800": sp["odour"]["OU_hc10_DT800"]["share_of_seconds_at_or_above"]["1"],
                       "share_DT6800": sp["odour"]["OU_hc10_DT6800"]["share_of_seconds_at_or_above"]["1"]}
        res[lab] = r
    # just detectable: one scooter (single-tailpipe draws only) at exactly OU = 1
    if case == "NF1-fine":
        F10a, BZa, THCa = F10[0], BZ[0], THC[0]
        jd = {}
        for DT in (800, 6800):
            s = F_REF / (F10a * DT)                       # CFD-exhaust mass fraction giving OU = 1
            b = s * BZa / mdot * M_AIR / M_BZ * 1e9
            t_ = s * THCa / mdot * ftol * M_AIR / M_TOL * 1e9
            jd[f"DT{DT}"] = {"benzene_ppb_P5_50_95": [float(x) for x in np.percentile(b, [5, 50, 95])],
                             "benzene_ppb_min_max": [float(b.min()), float(b.max())],
                             "toluene_ppb_P5_50_95": [float(x) for x in np.percentile(t_, [5, 50, 95])]}
        # raw exhaust benzene of each single scooter
        Fa = np.array([d["g"]["s_head"]["F"] for d in D["draws"]])
        raw = BZa / (mdot * Fa / F_REF) * M_AIR / M_BZ * 1e9
        jd["raw_exhaust_benzene_ppb_P5_50_95"] = [float(x) for x in np.percentile(raw, [5, 50, 95])]
        jd["hcHigh_share_of_draws"] = float(np.mean(F10a > 1.5 * Fa))
        res["just_detectable_one_scooter"] = jd
    out[case] = res

# hand conversion example (central ordinary scooter, as METHOD-SMELL claims)
thc_per_fuel, bzf = 0.025, 0.027
exh_per_fuel = 0.00055 / (F_REF / 3600 / 1000)       # kg exhaust per kg fuel in the CFD jet = 16.5
w = thc_per_fuel * bzf / exh_per_fuel
out["hand"] = {"exhaust_per_fuel": exh_per_fuel, "benzene_mass_fraction_raw": w,
               "benzene_ppb_raw": w * M_AIR / M_BZ * 1e9, "VM30_L_per_mol": VM30,
               "ppb_to_ugm3_benzene_30C": M_BZ / VM30, "ppb_to_ugm3_benzene_25C_24.45": M_BZ / 24.45}
json.dump(out, open(os.path.join(HERE, "verify-out.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
