#!/usr/bin/env python3
"""Turn one finished CFD case into the statistics fixed in PLAN.md section 5, plus the acceptance checks
that can be computed from a single case (A1 mass balance, A6 inflow, A8 numerics) and the A4 comparison
inputs. Output: one JSON file.

Usage: python3 stats.py CASE [--emitters fleet|nearestHigh|nearest2s|packHigh] [--n 1000] [--seed 20261127]
                        [--t0 T] [--dur 90] [--out stats.json]

How species follow from the unit tracers (nothing in the CFD depends on an emission rate):
  each tailpipe emits exhaust mass flow mdot with tracer s = 1, so s at a probe is the local mass fraction of
  that group's CFD exhaust. A scooter emitting species X at E_X (kg/s) gives a mass fraction s * E_X / mdot,
  and a mole fraction s * E_X / mdot * M_air / M_X.  CO: M 28.01; benzene: 78.11; THC as CH1.85 (13.85 g per
  mol C) -> ppmC.  E_X per scooter is drawn by draws.mjs from the published estimate (model.mjs drawScooter),
  so the CFD exhaust flow (0.47 L/s) only sets jet buoyancy, not the emission.
  Group tracers carry several tailpipes; within a group the draw's MEAN emission is applied (the headline
  scooter is its own group, so the nearest tailpipe is exact).
  Whole-exhaust dilution and odour: real exhaust volume scales with fuel flow, so exhaust fraction =
  s * F / 120 g/h (120 g/h is the fuel flow behind 0.47 L/s, inputs-simulation tailpipe.exhaustFlow).
  Odour units OU = exhaust fraction * D/T_raw, D/T_raw = 800 (Fiala 1967) and 6,800 (BIL-32 1970), kept apart;
  HC-high scooters x10 (ASSUMPTION, PLAN 1.8) with an x1 sensitivity column.
Statistics are from 1-s means (time-weighted, from the solver-step probe series), over one red window.
"""
import glob, json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "cfd"))
from analyse import series  # noqa: E402

M_AIR, M_CO, M_BZ, M_CH = 28.96, 28.01, 78.11, 13.85
F_REF = 120.0
CO_LEVELS = [1, 9, 30, 87, 200, 420]
OU_LEVELS = [1, 5, 30]
REFS = {
    "CO_WHO_15min_ppm": 87.0, "CO_WHO_1h_ppm": 31.0, "CO_Taiwan_1h_ppm": 31.0,
    "CO_AEGL2_10min_ppm": 420.0, "CO_NIOSH_ceiling_ppm": 200.0,
    "BZ_OEHHA_1h_ppb": 8.5, "BZ_NIOSH_ST_15min_ppb": 1000.0,
    "petrol_vapour_odour_detection_ppm": [0.47, 0.58],
}


def arg(name, default, cast=str):
    a = sys.argv
    return cast(a[a.index(name) + 1]) if name in a else default


def q(a, axis=-1):
    p = np.percentile(a, [5, 50, 95], axis=axis)
    return p


def qd(a):
    p = np.percentile(a, [5, 50, 95])
    return {"P5": float(p[0]), "P50": float(p[1]), "P95": float(p[2])}


def bins1s(tt, S, T0, dur):
    """time-weighted 1-s means. S: (time, n). Returns (nbins, n)."""
    t1 = min(T0 + dur, tt[-1])
    grid = np.arange(T0, t1, 0.01) + 0.005
    G = np.empty((len(grid), S.shape[1]))
    for j in range(S.shape[1]):
        G[:, j] = np.interp(grid, tt, S[:, j])
    nb = int(np.floor((t1 - T0) + 1e-6))
    G = G[: nb * 100].reshape(nb, 100, -1).mean(1)
    return G


def run_stats(X):
    """X: (probe, draw, t) 1-s means -> dict of arrays (probe, draw)."""
    mean = X.mean(-1)
    c = np.cumsum(np.concatenate([np.zeros(X.shape[:-1] + (1,)), X], -1), -1)
    w = min(10, X.shape[-1])
    max10 = ((c[..., w:] - c[..., :-w]) / w).max(-1)
    max1 = X.max(-1)
    return mean, max10, max1


def main():
    case = os.path.abspath(sys.argv[1])
    mode = arg("--emitters", "fleet")
    ndraw = arg("--n", 1000, int)
    seed = arg("--seed", 20261127, int)
    out_path = arg("--out", os.path.join(os.path.dirname(case), "stats.json"))
    meta = json.load(open(os.path.join(case, "case_meta.json")))
    scene = meta["scene"]
    labels = scene["probeLabels"]
    probes = meta["probes"]
    tracers = meta["tracers"]
    spin = meta["spinup"]
    T0 = arg("--t0", spin, float)
    dur = arg("--dur", 90.0, float)
    mdot = meta["pipes"][0]["mdot"]
    res = {"case": case, "scene": scene["name"], "emitters": mode, "nDraws": ndraw, "seed": seed,
           "window_s": [T0, T0 + dur], "units": {"CO": "ppm (increment above background unless 'total')",
                                                  "BZ": "ppb", "THC": "ppmC", "OU": "odour units (dilutions to threshold)",
                                                  "dilution": "tailpipe exhaust / local exhaust fraction"},
           "method": __doc__.strip().splitlines()[0]}

    # ---------------- probe series (1-s means)
    S = {}
    for t in tracers:
        d = series(case, "probes", t)
        S[t] = bins1s(d[:, 0], d[:, 1:], T0, dur).T          # (probe, t)
    nT = S[tracers[0]].shape[1]
    res["window_s"] = [T0, T0 + nT]
    res["complete_red"] = bool(nT >= dur - 1)
    # probes inside an obstacle (e.g. an arcade column) get OpenFOAM's -1e300 marker: flag them, zero them, keep them out of A1
    inside = np.zeros(len(probes), bool)
    for t in tracers:
        inside |= series(case, "probes", t)[:, 1:].min(0) < -1e10
    for t in tracers:
        S[t][inside] = 0.0
    raw_min = min(float(series(case, "probes", t)[:, 1:][:, ~inside].min()) for t in tracers)
    raw_max = max(float(series(case, "probes", t)[:, 1:][:, ~inside].max()) for t in tracers)
    res["probes_inside_obstacles"] = [labels[j] for j in np.where(inside)[0]]
    acc = {}
    # A1 mass balance over the red window
    Mm = series(case, "tracerMass", "volFieldValue.dat")
    a1 = {}
    for gi, t in enumerate(tracers):
        emit, tE = None, None
        for p in meta["pipes"]:
            if p["tracer"] != t:
                continue
            d = series(case, f"flux_{p['name']}", "surfaceFieldValue.dat")
            e = -d[:, 1 + gi]
            emit = e if emit is None else emit + np.interp(tE, d[:, 0], e)
            tE = d[:, 0] if tE is None else tE
        outf = np.zeros_like(tE)
        for sname in meta.get("inlets", []) + meta["opens"]:
            d = series(case, f"flux_{sname}", "surfaceFieldValue.dat")
            outf += np.interp(tE, d[:, 0], d[:, 1 + gi])
        w = (tE >= T0) & (tE <= T0 + nT)
        trap = getattr(np, "trapezoid", None) or np.trapz
        Ein, Eout = trap(emit[w], tE[w]), trap(outf[w], tE[w])
        dM = np.interp(tE[w][-1], Mm[:, 0], Mm[:, 1 + gi]) - np.interp(tE[w][0], Mm[:, 0], Mm[:, 1 + gi])
        spec = sum(p["mdot"] for p in meta["pipes"] if p["tracer"] == t)
        a1[t] = {"emitted_kg": float(Ein), "out_kg": float(Eout), "stored_kg": float(dM),
                 "balance_error_pct": float(100 * (Ein - Eout - dM) / Ein),
                 "emission_vs_specified_pct": float(100 * (Ein / (spec * (tE[w][-1] - tE[w][0])) - 1))}
    worst = max(abs(v["balance_error_pct"]) for v in a1.values())
    acc["A1_mass_balance"] = {"per_tracer": a1, "worst_abs_error_pct": worst,
                              "probe_min_exhaust_fraction": raw_min, "probe_max_exhaust_fraction": raw_max,
                              "pass": bool(worst <= 3.0 and raw_min >= -1e-3 * raw_max and raw_max <= 1.0 + 1e-6),
                              "note": "red counted from tracer start (first red); PLAN asks 'each red after the first' - with one red per run this is the first red"}
    # normalise each group's tracer to its specified exhaust emission: s * (specified kg) / (tracer actually put in
    # = out + stored, which includes any diffusive inflow at the patch). Exact for a passive linear tracer.
    res["tracer_normalisation"] = {}
    for t in tracers:
        v = a1[t]
        actual = v["out_kg"] + v["stored_kg"]
        spec_kg = v["emitted_kg"] / (1 + v["emission_vs_specified_pct"] / 100)
        f = spec_kg / actual if actual > 0 else 1.0
        S[t] = S[t] * f
        res["tracer_normalisation"][t] = {"factor_applied": float(f), "advective_emission_vs_specified_pct": v["emission_vs_specified_pct"],
                                          "diffusive_or_numerical_inflow_pct_of_advective": float(100 * (actual / v["emitted_kg"] - 1))}
    Stot = sum(S[t] for t in tracers)

    # ---------------- emission draws
    dj = subprocess.run(["node", os.path.join(HERE, "draws.mjs"), os.path.join(case, "case_meta.json"), str(ndraw), str(seed), mode],
                        capture_output=True, text=True, check=True).stdout
    D = json.loads(dj)
    k = {sp: np.zeros((len(tracers), ndraw)) for sp in ("CO", "THC", "BZ", "EXH", "OU1", "OU10")}
    for i, dr in enumerate(D["draws"]):
        for gi, t in enumerate(tracers):
            g = dr["g"][t]
            k["CO"][gi, i] = g["CO"] * 1e-6 / mdot * M_AIR / M_CO * 1e6      # mg/s -> kg/s; ppm per unit s
            k["THC"][gi, i] = g["THC"] * 1e-6 / mdot * M_AIR / M_CH * 1e6     # ppmC
            k["BZ"][gi, i] = g["BZ"] * 1e-9 / mdot * M_AIR / M_BZ * 1e9       # ug/s -> ppb
            k["EXH"][gi, i] = g["F"] / F_REF
            k["OU1"][gi, i] = g["F"] / F_REF
            k["OU10"][gi, i] = g["F_hc10"] / F_REF
    bgCO = np.array([dr["bgCO"] for dr in D["draws"]])
    bgBZ = np.array([dr["bgBZ"] for dr in D["draws"]])
    Sarr = np.stack([S[t] for t in tracers], 1)                     # (probe, group, t)
    ih = tracers.index("s_head") if "s_head" in tracers else None

    def species(sp):
        return np.einsum("pgt,gd->pdt", Sarr, k[sp])

    rows = [dict(label=labels[j], xyz=probes[j], **({"inside_obstacle": True} if inside[j] else {})) for j in range(len(probes))]
    # emission-independent tracer statistics
    m, m10, m1 = run_stats(Stot[:, None, :])
    for j, r in enumerate(rows):
        r["dilution_total"] = {"mean": float(1 / m[j, 0]) if m[j, 0] > 0 else None,
                               "max10s": float(1 / m10[j, 0]) if m10[j, 0] > 0 else None,
                               "max1s": float(1 / m1[j, 0]) if m1[j, 0] > 0 else None}
    if ih is not None:
        m, m10, m1 = run_stats(S["s_head"][:, None, :])
        for j, r in enumerate(rows):
            r["dilution_nearest"] = {"mean": float(1 / m[j, 0]) if m[j, 0] > 0 else None,
                                     "max1s": float(1 / m1[j, 0]) if m1[j, 0] > 0 else None,
                                     "share_of_total_mean": (float(S["s_head"][j].mean() / Stot[j].mean()) if Stot[j].mean() > 1e-12 else None)}
    # CO
    X = species("CO")
    mean, max10, max1 = run_stats(X)
    tot = mean + bgCO[None, :]
    above = {L: (X > L).sum(-1) for L in CO_LEVELS}
    for j, r in enumerate(rows):
        r["CO"] = {"mean": qd(mean[j]), "max10s": qd(max10[j]), "max1s": qd(max1[j]), "mean_total": qd(tot[j]),
                   "seconds_above": {str(L): {"P50": float(np.percentile(above[L][j], 50)), "P95": float(np.percentile(above[L][j], 95)),
                                              "share_of_draws_any": float((above[L][j] > 0).mean())} for L in CO_LEVELS},
                   "contribution_15min_mean": qd(mean[j] / 10), "contribution_1h_mean": qd(mean[j] / 40),
                   "P_draw": {"max1s>=200": float((max1[j] >= 200).mean()), "max10s>=420": float((max10[j] >= 420).mean()),
                              "mean/10>=87": float((mean[j] / 10 >= 87).mean()), "mean>=87": float((mean[j] >= 87).mean()),
                              "max1s>=87": float((max1[j] >= 87).mean()), "max1s>=30": float((max1[j] >= 30).mean()),
                              "max1s>=9": float((max1[j] >= 9).mean())}}
    # median-emission draw for the kept 1-s series: the draw with the median pack CO emission
    packE = (k["CO"] * np.array([D["nPerGroup"][t] for t in tracers])[:, None]).sum(0)
    dmed = int(np.argsort(packE)[len(packE) // 2])
    COmed = X[:, dmed, :]
    del X
    # THC, benzene
    for sp in ("THC", "BZ"):
        X = species(sp)
        mean, max10, max1 = run_stats(X)
        for j, r in enumerate(rows):
            r[sp] = {"mean": qd(mean[j]), "max10s": qd(max10[j]), "max1s": qd(max1[j])}
            if sp == "BZ":
                r[sp]["mean_total"] = qd(mean[j] + bgBZ)
                r[sp]["contribution_1h_mean"] = qd(mean[j] / 40)
                r[sp]["contribution_15min_mean"] = qd(mean[j] / 10)
        del X
    # odour
    for col, kk in (("OU_hc10", "OU10"), ("OU_hc1", "OU1")):
        X = species(kk)  # exhaust fraction, weighted
        for DT in (800, 6800):
            Y = X * DT
            mean, max10, max1 = run_stats(Y)
            frac = {L: (Y >= L).mean(-1) for L in OU_LEVELS}
            for j, r in enumerate(rows):
                r.setdefault("odour", {})[f"{col}_DT{DT}"] = {
                    "mean": qd(mean[j]), "max1s": qd(max1[j]),
                    "share_of_seconds_at_or_above": {str(L): qd(frac[L][j]) for L in OU_LEVELS}}
        del X, Y
    res["probes"] = rows

    # ---------------- headline: K probes, all distances, heights 0.7/1.1/1.5 (PLAN 5)
    head = {}
    for j, r in enumerate(rows):
        mm = re.match(r"K d=([\d.]+) dx=(-?[\d.]+) h=([\d.]+)", r["label"])
        if not mm:
            continue
        d, dx, h = mm.groups()
        if h not in ("0.7", "1.1", "1.5", "0.6", "0.8"):
            continue
        e = head.setdefault(f"d={d} h={h}", {"dx": {}})
        e["dx"][dx] = {s: r["CO"][s] for s in ("mean", "max10s", "max1s")}
        e["dx"][dx]["dilution_total_mean"] = r["dilution_total"]["mean"]
        e["dx"][dx]["BZ_mean"] = r["BZ"]["mean"]; e["dx"][dx]["THC_max1s"] = r["THC"]["max1s"]
        e["dx"][dx]["OU_max1s_DT800"] = r["odour"]["OU_hc10_DT800"]["max1s"]
        e["dx"][dx]["OU_max1s_DT6800"] = r["odour"]["OU_hc10_DT6800"]["max1s"]
        e["dx"][dx]["OU_share_ge1_DT800"] = r["odour"]["OU_hc10_DT800"]["share_of_seconds_at_or_above"]["1"]
        e["dx"][dx]["OU_share_ge1_DT6800"] = r["odour"]["OU_hc10_DT6800"]["share_of_seconds_at_or_above"]["1"]
    res["headline_K"] = head
    # highest single probe (never the headline)
    co_rows = [r for r in rows if not r["label"].startswith(("SRC", "IN"))]
    for s in ("mean", "max10s", "max1s"):
        rr = max(co_rows, key=lambda r: r["CO"][s]["P95"])
        res.setdefault("highest_single_probe", {})[f"CO_{s}_P95"] = {"label": rr["label"], "xyz": rr["xyz"], "value": rr["CO"][s]}
    rr = max(co_rows, key=lambda r: r["odour"]["OU_hc10_DT6800"]["max1s"]["P95"])
    res["highest_single_probe"]["OU_max1s_DT6800_P95"] = {"label": rr["label"], "value": rr["odour"]["OU_hc10_DT6800"]["max1s"]}

    # ---------------- 1-s series kept (K at dx=0, B on the kerb-lane column, SRC)
    keep = [j for j, r in enumerate(rows) if re.match(r"K d=[\d.]+ dx=0.0 h=(0.7|1.1|1.5)$", r["label"]) or
            re.match(r"B col_y=0.30 d=[\d.]+ h=(0.7|1.1|1.5)$", r["label"]) or r["label"].startswith("SRC")]
    tcol = np.arange(nT) + 0.5
    hdr = "t_s_from_red_onset," + ",".join(f"CO_ppm[{rows[j]['label']}]" for j in keep) + "," + ",".join(f"exhaust_fraction[{rows[j]['label']}]" for j in keep)
    np.savetxt(os.path.join(os.path.dirname(out_path), "series_1s.csv"),
               np.column_stack([tcol] + [COmed[j] for j in keep] + [Stot[j] for j in keep]), delimiter=",", header=hdr, comments="", fmt="%.6g")
    res["series_file"] = "series_1s.csv (CO for the median-pack-emission draw; exhaust fraction is emission-independent)"

    # ---------------- acceptance checks computable from this case (A1 is above)
    # A6 inflow
    a6 = {}
    try:
        d = series(case, "probes", "U")
        tt = d[:, 0]; w = (tt >= T0) & (tt <= T0 + nT)
        Ux = d[w, 1:].reshape(w.sum(), -1, 3)
        wind = scene.get("wind", {})
        for j, r in enumerate(rows):
            if not r["label"].startswith("IN"):
                continue
            u = Ux[:, j, :]
            mv = u[:, :2].mean(0); fvec = mv / max(np.hypot(*mv), 1e-9)   # local mean wind direction
            along = u[:, :2] @ fvec; cross = u[:, :2] @ np.array([-fvec[1], fvec[0]])
            U = along.mean()
            a6[r["label"]] = {"U_along_mean": float(U), "mean_direction_deg": float(np.degrees(np.arctan2(fvec[1], fvec[0]))), "speed_mean": float(np.hypot(u[:, 0], u[:, 1]).mean()),
                              "sigma_v": float(cross.std()), "sigma_u": float(along.std()), "sigma_w": float(u[:, 2].std()),
                              "sigma_v_over_U": float(cross.std() / U) if U > 0 else None,
                              "sigma_w_over_U": float(u[:, 2].std() / U) if U > 0 else None}
        tgt = wind.get("targetSpeed", wind.get("speed", 0.0))
        a15 = {k_: v for k_, v in a6.items() if "up=1.5 h=1.5" in k_}
        ok = None
        if a15 and tgt > 0:
            v = list(a15.values())[0]
            okU = abs(v["U_along_mean"] / tgt - 1) <= 0.10
            if tgt <= 0.5:
                okT = v["sigma_v"] >= 0.2 and v["sigma_w"] >= 0.1
            else:
                okT = (0.3 <= (v["sigma_v_over_U"] or 0) <= 0.6) and (0.2 <= (v["sigma_w_over_U"] or 0) <= 0.35)
            ok = bool(okU and okT)
        acc["A6_inflow"] = {"probes": a6, "target_U": tgt, "pass": ok,
                            "inflow": {k_: wind.get(k_) for k_ in ("speed", "targetSpeed", "inflowFactor", "dirDeg", "turbulence")},
                            "note": "resolved LES velocity only (sub-grid part not included); along/across the local mean direction; at 1.5 m upstream of the pack's most upwind corner"}
    except Exception as ex:  # noqa
        acc["A6_inflow"] = {"error": str(ex)}
    # A8 numerics: Courant from the solver log over the window; domain tracer steadiness over last 20 s
    co_mean, co_max, dts = [], [], []
    log = os.path.join(case, "log.buoyantPimpleFoam")
    t_cur = None
    if os.path.exists(log):
        for line in open(log):
            if line.startswith("Time = "):
                t_cur = float(line.split()[2])
            elif line.startswith("Courant Number") and t_cur is not None and T0 <= t_cur <= T0 + nT:
                p_ = line.split(); co_mean.append(float(p_[3])); co_max.append(float(p_[5]))
            elif line.startswith("deltaT") and t_cur is not None and T0 <= t_cur <= T0 + nT:
                dts.append(float(line.split()[2]))
    steady = {}
    for gi, t in enumerate(tracers):
        w = (Mm[:, 0] >= T0 + nT - 20) & (Mm[:, 0] <= T0 + nT)
        mm_ = Mm[w, 1 + gi]
        steady[t] = float((mm_[-1] - mm_[0]) / mm_.mean()) if len(mm_) > 1 and mm_.mean() > 0 else None
    acc["A8_numerics"] = {"Courant_max_in_window": max(co_max) if co_max else None,
                          "Courant_max_P99": float(np.percentile(co_max, 99)) if co_max else None,
                          "Courant_mean_mean": float(np.mean(co_mean)) if co_mean else None,
                          "dt_mean_s": float(np.mean(dts)) if dts else None, "steps_in_window": len(dts),
                          "domain_tracer_change_last20s_fraction": steady,
                          "scalar_scheme": "limitedLinear01 (bounded)",
                          "pass": bool(co_max and max(co_max) <= 1.0 and all(v is not None and abs(v) <= 0.05 for v in steady.values())),
                          "note": "maxCo 0.95 is the solver target; the domain-wide Courant max includes far-field cells"}
    wt = os.path.join(case, "walltime.txt")
    if os.path.exists(wt):
        res["walltime"] = open(wt).read().strip()
    res["references"] = REFS
    res["acceptance"] = acc
    json.dump(res, open(out_path, "w"), indent=1)
    print(f"wrote {out_path}")


if __name__ == "__main__":
    main()
