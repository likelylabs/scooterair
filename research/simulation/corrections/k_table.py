#!/usr/bin/env python3
"""Plain K-probe table (dx = 0) for one or more cases, from results/<id>/stats.json. Usage: k_table.py ID [ID ...]"""
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
f = lambda x: (f"{x:.3g}" if x is not None else "-")
for c in sys.argv[1:]:
    st = json.load(open(os.path.join(HERE, "results", c, "stats.json")))
    rows = {r["label"]: r for r in st["probes"]}
    print(f"== {c} window {st['window_s']} emitters {st['emitters']}")
    print("d h | CO mean P5/P50/P95 | max10 P50/P95 | max1 P50/P95 | BZ mean P50/P95 | THC max1 P50/P95 | OU6800 max1 P50/P95 | OU800 max1 P50/P95 | OU6800 >=1/5/30 | dil mean | dil max1 | nearest share")
    for d in ("0.5", "1.0", "2.0", "4.0"):
        for h in ("0.3", "0.7", "1.1", "1.5"):
            r = rows.get(f"K d={d} dx=0.0 h={h}")
            if not r: continue
            C, B, T, O, O8 = r["CO"], r["BZ"], r["THC"], r["odour"]["OU_hc10_DT6800"], r["odour"]["OU_hc10_DT800"]
            sh = O["share_of_seconds_at_or_above"]
            print(f"{d} {h} | {f(C['mean']['P5'])}/{f(C['mean']['P50'])}/{f(C['mean']['P95'])} | {f(C['max10s']['P50'])}/{f(C['max10s']['P95'])} | "
                  f"{f(C['max1s']['P50'])}/{f(C['max1s']['P95'])} | {f(B['mean']['P50'])}/{f(B['mean']['P95'])} | {f(T['max1s']['P50'])}/{f(T['max1s']['P95'])} | "
                  f"{f(O['max1s']['P50'])}/{f(O['max1s']['P95'])} | {f(O8['max1s']['P50'])}/{f(O8['max1s']['P95'])} | "
                  f"{sh['1']['P50']:.2f}/{sh['5']['P50']:.2f}/{sh['30']['P50']:.2f} | {f(r['dilution_total']['mean'])} | {f(r['dilution_total']['max1s'])} | "
                  f"{f((r.get('dilution_nearest') or {}).get('share_of_total_mean'))}")
    hp = st["highest_single_probe"]
    print("  highest single probe:", "; ".join(f"{k}: {v['label']} P50 {f(v['value']['P50'])} P95 {f(v['value']['P95'])}" for k, v in hp.items()))
    sec = rows["K d=0.5 dx=0.0 h=0.7"]["CO"]
    print("  K0.5 h0.7 share of draws with any second >= 200 ppm:", sec["seconds_above"]["200"]["share_of_draws_any"], " >=87:", sec["seconds_above"]["87"]["share_of_draws_any"])
