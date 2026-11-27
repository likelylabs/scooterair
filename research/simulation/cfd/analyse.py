#!/usr/bin/env python3
"""Tracer mass balance and probe statistics for a case made by make_case.py.

Usage: python3 analyse.py CASE [--xco 0.0081] [--t0 START_OF_STATISTICS_WINDOW]
(default window: the last 90 s, or the whole record if shorter)

Tracer s = exhaust mass fraction (1 at the tailpipe).  Mole fraction of
exhaust in air ~= s (exhaust molar mass ~28.7 vs air 28.96, <1% error), so a
species with raw mole fraction x_raw in the exhaust has  ppm = s * x_raw * 1e6.
Default x_raw for CO = 0.81 % (flux-weighted fleet mix, research/simulation/PLAN.md
section 1; the inspection median is 0.47 %, a phase-5 mean 1.449 %). The CFD carries
only s; real emissions are applied in post-processing (PLAN section 2).
Dilution ratio tailpipe->probe = 1/s.
"""
import json, os, sys, glob
import numpy as np
trapz = getattr(np, "trapezoid", None) or getattr(np, "trapz")


def load_dat(path):
    rows = []
    for line in open(path):
        if line.startswith("#") or not line.strip():
            continue
        rows.append([float(x) for x in line.replace("(", " ").replace(")", " ").split()])
    return np.array(rows)


def series(case, fo, fname):
    files = sorted(glob.glob(os.path.join(case, "postProcessing", fo, "*", fname)),
                   key=lambda p: float(p.split(os.sep)[-2]))
    data = np.vstack([load_dat(f) for f in files])
    _, idx = np.unique(data[:, 0], return_index=True)  # drop restart overlaps
    return data[idx]


def main():
    case = sys.argv[1]
    args = sys.argv[2:]
    xco = float(args[args.index("--xco") + 1]) if "--xco" in args else 0.0081
    binw = float(args[args.index("--bin") + 1]) if "--bin" in args else 1.0
    meta = json.load(open(os.path.join(case, "case_meta.json")))
    out = {"case": case}
    for k, t in enumerate(meta["tracers"]):
        M = series(case, "tracerMass", "volFieldValue.dat")
        tM, mass = M[:, 0], M[:, 1 + k]
        emit = None
        for p in meta["pipes"]:
            if p["tracer"] != t:
                continue
            d = series(case, f"flux_{p['name']}", "surfaceFieldValue.dat")
            e = -d[:, 1 + k]
            emit = e if emit is None else emit + np.interp(d[:, 0], d[:, 0], e)
            tE = d[:, 0]
        outf = np.zeros_like(tE)
        for s in meta.get("inlets", [meta["inlet"]] if meta["inlet"] else []) + meta["opens"]:
            d = series(case, f"flux_{s}", "surfaceFieldValue.dat")
            outf += np.interp(tE, d[:, 0], d[:, 1 + k])
        Ein = trapz(emit, tE)
        Eout = trapz(outf, tE)
        Mend = np.interp(tE[-1], tM, mass) - np.interp(tE[0], tM, mass)
        spec = sum(p["mdot"] for p in meta["pipes"] if p["tracer"] == t)
        tail = tE > tE[-1] - 0.33 * (tE[-1] - tE[0])
        out[t] = dict(
            t0=float(tE[0]), t1=float(tE[-1]),
            emitted_kg=float(Ein), out_kg=float(Eout), stored_kg=float(Mend),
            balance_error_pct=float(100 * (Ein - Eout - Mend) / Ein),
            mean_emission_vs_specified_pct=float(100 * (np.mean(emit) / spec - 1)),
            last_third_outflow_over_emission=float(np.mean(outf[tail]) / np.mean(emit[tail])),
            last_third_storage_rate_over_emission=float(np.polyfit(tM[tM > tE[-1] - 0.33 * (tE[-1] - tE[0])],
                                                                   mass[tM > tE[-1] - 0.33 * (tE[-1] - tE[0])], 1)[0] / np.mean(emit[tail])))
    # probes
    pdir = sorted(glob.glob(os.path.join(case, "postProcessing", "probes", "*")))
    if pdir:
        for t in meta["tracers"]:
            d = series(case, "probes", t)
            tt, S = d[:, 0], d[:, 1:]
            T0 = float(args[args.index("--t0") + 1]) if "--t0" in args else tt[-1] - min(90.0, tt[-1] - tt[0])
            m = tt >= T0
            tt, S = tt[m], S[m]
            # time-weighted bins
            edges = np.arange(T0, tt[-1] + 1e-9, binw)
            grid = np.arange(T0, tt[-1], 0.01)
            Sg = np.array([np.interp(grid, tt, S[:, j]) for j in range(S.shape[1])]).T
            def runmax(w):
                n = int(round(w / 0.01))
                if n >= len(grid):
                    return Sg.mean(0)
                c = np.cumsum(np.vstack([np.zeros(Sg.shape[1]), Sg]), 0)
                return ((c[n:] - c[:-n]) / n).max(0)
            res = []
            for j, p in enumerate(meta["probes"]):
                mean = Sg[:, j].mean()
                res.append(dict(probe=p, mean_s=float(mean), dilution_mean=float(1 / mean) if mean > 0 else None,
                                CO_ppm_mean=float(mean * xco * 1e6), CO_ppm_max10s=float(runmax(10)[j] * xco * 1e6),
                                CO_ppm_max1s=float(runmax(1)[j] * xco * 1e6), CO_ppm_inst_max=float(Sg[:, j].max() * xco * 1e6)))
            out[f"probes_{t}"] = dict(window=[float(T0), float(tt[-1])], xco_raw=xco, rows=res)
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
