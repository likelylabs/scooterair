#!/usr/bin/env python3
"""Coarse-versus-fast look (stand-in for acceptance A3 until the fine grid G is affordable): the same
statistics from two grids over the same window, at named probes.
Usage: python3 grid_look.py FAST_STATS.json COARSE_STATS.json OUT.json [probe labels...]
Both stats files must come from stats.py with the same --t0/--dur and the same emission seed.
"""
import json, sys

fast, coarse, out = (json.load(open(sys.argv[1])), json.load(open(sys.argv[2])), sys.argv[3])
labels = sys.argv[4:] or ["K d=0.5 dx=0.0 h=0.7", "K d=0.5 dx=0.0 h=1.1", "K d=0.5 dx=0.0 h=1.5",
                          "K d=1.0 dx=0.0 h=0.7", "K d=1.0 dx=0.0 h=1.1", "K d=1.0 dx=0.0 h=1.5",
                          "K d=2.0 dx=0.0 h=0.7", "K d=2.0 dx=0.0 h=1.1", "K d=2.0 dx=0.0 h=1.5",
                          "KL y=-0.2 x=-10 h=0.7", "KL y=-0.2 x=-4 h=0.7", "SRC b1c0 d=0.25", "SRC b1c0 d=0.5"]
A = {r["label"]: r for r in fast["probes"]}
B = {r["label"]: r for r in coarse["probes"]}
rows = []
for l in labels:
    if l not in A or l not in B:
        continue
    row = {"probe": l}
    for s in ("mean", "max10s", "max1s"):
        a, b = A[l]["CO"][s]["P50"], B[l]["CO"][s]["P50"]
        row[s] = {"fast_ppm": a, "coarse_ppm": b, "coarse_over_fast": (b / a) if a > 0 else None}
    rows.append(row)
res = {"window_fast_s": fast["window_s"], "window_coarse_s": coarse["window_s"],
       "what": "P50 over emission draws of CO increment; fast = 5 cm kerb-lane tailpipes, 10 cm near the headline scooter; coarse = one level coarser",
       "A3_limits_for_reference": {"mean": 0.20, "max10s": 0.30, "max1s": 0.50}, "rows": rows}
json.dump(res, open(out, "w"), indent=1)
for r in rows:
    print(f"{r['probe']:24s} " + "  ".join(f"{s} {r[s]['fast_ppm']:.3g}->{r[s]['coarse_ppm']:.3g} (x{r[s]['coarse_over_fast']:.2f})"
                                           if r[s]['coarse_over_fast'] else f"{s} n/a" for s in ("mean", "max10s", "max1s")))
