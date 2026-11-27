#!/usr/bin/env python3
"""Re-check the verifiers' findings from the case files (signed-report step). Prints a plain table."""
import json, os, re, sys
import numpy as np
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "cfd"))
from analyse import series
RUN = os.path.abspath(os.path.join(HERE, "../../../run"))
cases = sys.argv[1:] or ["S1", "S2", "S1-from", "S5-12", "A"]
for c in cases:
    st = json.load(open(os.path.join(HERE, "results", c, "stats.json")))
    case = os.path.join(RUN, c, "case")
    meta = json.load(open(os.path.join(case, "case_meta.json")))
    lab = meta["scene"]["probeLabels"]
    T0, T1 = st["window_s"]
    d = series(case, "probes", "U"); t = d[:, 0]; w = (t >= T0) & (t <= T1)
    U = d[w, 1:].reshape(w.sum(), -1, 3).mean(0)
    print(f"== {c}  window {T0}-{T1}  domain top {meta['scene']['domain'].get('zGrade',{}).get('zTop', meta['scene']['domain']['max'][2])}")
    for want in ["IN up=1.5 h=1.5", "K d=0.5 dx=0.0 h=1.1", "K d=1.0 dx=0.0 h=1.1", "K d=2.0 dx=0.0 h=1.1", "K d=4.0 dx=0.0 h=1.1",
                 "KL y=-0.2 x=-10 h=1.1", "KL y=-0.2 x=-4 h=1.1", "KL y=-0.2 x=2 h=1.1"]:
        if want in lab:
            u = U[lab.index(want)]
            print(f"  {want:24s} u {u[0]:+.2f} v {u[1]:+.2f} w {u[2]:+.2f}  speed {np.hypot(u[0], u[1]):.2f}")
    rows = {r["label"]: r for r in st["probes"]}
    for dd in ("0.5", "1.0", "2.0", "4.0"):
        r = rows[f"K d={dd} dx=0.0 h=1.1"]
        print(f"  nearest-scooter share of K d={dd} h=1.1 mean: {r.get('dilution_nearest', {}).get('share_of_total_mean')}")
    for h in ("0.7", "1.1", "1.5"):
        r = rows[f"K d=0.5 dx=0.0 h={h}"]
        print(f"  K0.5 h{h}: CO mean P50 {r['CO']['mean']['P50']:.3g}  max1 P50 {r['CO']['max1s']['P50']:.3g}  peak/mean {r['CO']['max1s']['P50']/max(r['CO']['mean']['P50'],1e-9):.2f}"
              f"  THC max1 P50 {r['THC']['max1s']['P50']:.3g} ppmC  OU6800 share>=1/5/30 P50 "
              + "/".join(f"{r['odour']['OU_hc10_DT6800']['share_of_seconds_at_or_above'][L]['P50']:.2f}" for L in ("1", "5", "30"))
              + "  OU800 >=5 " + f"{r['odour']['OU_hc10_DT800']['share_of_seconds_at_or_above']['5']['P50']:.2f}")
    a1 = st["acceptance"]["A1_mass_balance"]
    print(f"  A1 worst {a1['worst_abs_error_pct']:.2f} %  max exhaust fraction at any probe {a1['probe_max_exhaust_fraction']:.4f}")
    a6 = st["acceptance"]["A6_inflow"]["probes"].get("IN up=1.5 h=1.5", {})
    print(f"  A6 IN: dir {a6.get('mean_direction_deg', float('nan')):.0f}  U {a6.get('U_along_mean', float('nan')):.2f}  sw/U {a6.get('sigma_w_over_U')}  sw {a6.get('sigma_w')}")
    print(f"  A8 tracer change last 20 s: {st['acceptance']['A8_numerics']['domain_tracer_change_last20s_fraction']}")
