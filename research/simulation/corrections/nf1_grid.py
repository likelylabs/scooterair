#!/usr/bin/env python3
"""Near-field grid and engine-heat check (PLAN 9.24) from results/NF1-fine, NF1-coarse, NF1-coarse-0kW stats.json.
Emission-independent: uses the exhaust dilution (mean, highest 10 s via CO P50 ratio, highest 1 s) at K and SRC probes.
Writes corrections/nf1_grid.json and prints a table. Ratios are coarse / fine (below 1: the coarse grid reads low)."""
import json, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = lambda c: {r["label"]: r for r in json.load(open(os.path.join(HERE, "results", c, "stats.json")))["probes"]}
F, C = L("NF1-fine"), L("NF1-coarse")
Z = L("NF1-coarse-0kW") if os.path.exists(os.path.join(HERE, "results", "NF1-coarse-0kW", "stats.json")) else None
out = {"ratio_coarse_over_fine": {}, "heat_1kW_over_0kW_coarse": {}, "fine_values": {}}
labs = [f"K d={d} dx={dx} h={h}" for d in ("0.5", "1.0", "2.0") for dx in ("0.0", "-1.0", "1.0") for h in ("0.3", "0.6", "0.7", "0.8", "1.1", "1.5")]
labs += [l for l in F if l.startswith("SRC")]
print("probe | coarse/fine: mean, max10, max1 (CO P50) | fine CO mean / max1 P50 | 1kW/0kW mean, max1")
for l in labs:
    if l not in F or l not in C:
        continue
    f, c = F[l]["CO"], C[l]["CO"]
    rr = lambda s: (c[s]["P50"] / f[s]["P50"]) if f[s]["P50"] > 1e-9 else None
    out["ratio_coarse_over_fine"][l] = {s: rr(s) for s in ("mean", "max10s", "max1s")}
    out["fine_values"][l] = {s: f[s] for s in ("mean", "max10s", "max1s")}
    hz = ""
    if Z and l in Z:
        z = Z[l]["CO"]
        out["heat_1kW_over_0kW_coarse"][l] = {s: (c[s]["P50"] / z[s]["P50"]) if z[s]["P50"] > 1e-9 else None for s in ("mean", "max1s")}
        hz = " | " + ", ".join(f"{v:.2f}" if v else "-" for v in out["heat_1kW_over_0kW_coarse"][l].values())
    print(f"{l} | " + ", ".join(f"{v:.2f}" if v else "-" for v in out["ratio_coarse_over_fine"][l].values())
          + f" | {f['mean']['P50']:.3g} / {f['max1s']['P50']:.3g}{hz}")
json.dump(out, open(os.path.join(HERE, "corrections", "nf1_grid.json"), "w"), indent=1)
