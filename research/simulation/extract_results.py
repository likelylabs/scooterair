#!/usr/bin/env python3
"""Copy the agreed statistics (PLAN.md section 5; no others) of one case's stats.json into
research/simulation/results-matrix.json under the case id (renamed from results-simulation.json in the signed-report step).
Usage: python3 extract_results.py ID STATS.json [--note TEXT] [--wall TEXT]
Kept per case: K headline (all 4 distances x heights 0.6/0.7/0.8/1.1/1.5 x the 3 x positions: CO 90-s mean, highest 10 s,
highest 1 s as P5/P50/P95; benzene mean; THC highest 1 s; dilution of the total exhaust; odour highest 1 s and share of
seconds >= 1 OU at D/T 800 and 6,800), seconds above the CO levels at K, the highest single probe (labelled, never the
headline), B / I / AR probe sets where present (same statistics), acceptance checks, window, completeness and wall time."""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "results-matrix.json")


def r3(x):
    if isinstance(x, dict):
        return {k: r3(v) for k, v in x.items()}
    if isinstance(x, list):
        return [r3(v) for v in x]
    if isinstance(x, float):
        return float(f"{x:.3g}")
    return x


def main():
    cid, path = sys.argv[1], sys.argv[2]
    a = sys.argv
    note = a[a.index("--note") + 1] if "--note" in a else ""
    wall = a[a.index("--wall") + 1] if "--wall" in a else None
    S = json.load(open(path))
    keepK = {}
    sets = {"B": {}, "I": {}, "AR": {}, "KL": {}}
    for r in S["probes"]:
        lab = r["label"]
        if r.get("inside_obstacle"):
            continue
        m = re.match(r"K d=([\d.]+) dx=(-?[\d.]+) h=([\d.]+)$", lab)
        row = {"CO_mean": r["CO"]["mean"], "CO_max10s": r["CO"]["max10s"], "CO_max1s": r["CO"]["max1s"],
               "CO_mean_total": r["CO"]["mean_total"],
               "BZ_mean_ppb": r["BZ"]["mean"], "BZ_max1s_ppb": r["BZ"]["max1s"], "THC_max1s_ppmC": r["THC"]["max1s"],
               "THC_mean_ppmC": r["THC"]["mean"],
               "dilution_total_mean": r["dilution_total"]["mean"], "dilution_total_max1s": r["dilution_total"]["max1s"],
               "OU_max1s_DT800": r["odour"]["OU_hc10_DT800"]["max1s"], "OU_max1s_DT6800": r["odour"]["OU_hc10_DT6800"]["max1s"],
               "OU_max1s_DT6800_hcx1": r["odour"]["OU_hc1_DT6800"]["max1s"],
               "OU_share_ge1_DT800": r["odour"]["OU_hc10_DT800"]["share_of_seconds_at_or_above"]["1"],
               "OU_share_ge1_DT6800": r["odour"]["OU_hc10_DT6800"]["share_of_seconds_at_or_above"]["1"],
               "CO_seconds_above": r["CO"]["seconds_above"]}
        if m:
            d, dx, h = m.groups()
            if h in ("0.6", "0.7", "0.8", "1.1", "1.5"):
                keepK[f"d={d} h={h} dx={dx}"] = row
            continue
        for p in sets:
            if lab.startswith(p + " "):
                if p == "KL" and not lab.endswith(("h=0.7", "h=1.1", "h=1.5")):
                    continue
                sets[p][lab] = {k: row[k] for k in ("CO_mean", "CO_max10s", "CO_max1s", "dilution_total_mean", "OU_max1s_DT6800", "BZ_mean_ppb")}
    # KL: keep only the spatial maximum (by P50 mean) per height, labelled
    kl = {}
    for h in ("0.7", "1.1", "1.5"):
        c = {k: v for k, v in sets["KL"].items() if k.endswith("h=" + h)}
        if c:
            k = max(c, key=lambda k: c[k]["CO_mean"]["P50"])
            kl[f"max over kerb line, h={h}: {k}"] = c[k]
    sets["KL"] = kl
    acc = S.get("acceptance", {})
    a6 = acc.get("A6_inflow", {})
    a6s = {k: v for k, v in a6.get("probes", {}).items() if "up=1.5" in k}
    entry = {
        "scene": S["scene"], "emitters": S["emitters"], "nDraws": S["nDraws"], "window_s": S["window_s"],
        "complete_red": S["complete_red"], "walltime": wall or S.get("walltime"), "note": note,
        "K": keepK, **{p: v for p, v in sets.items() if v},
        "highest_single_probe": S.get("highest_single_probe"),
        "probes_inside_obstacles_no_value": S.get("probes_inside_obstacles", []),
        "acceptance": {
            "A1": {k: acc.get("A1_mass_balance", {}).get(k) for k in ("worst_abs_error_pct", "pass")},
            "A6": {"pass": a6.get("pass"), "target_U": a6.get("target_U"), "IN_1.5m_upstream": a6s},
            "A8": {k: acc.get("A8_numerics", {}).get(k) for k in ("Courant_max_in_window", "Courant_max_P99", "dt_mean_s",
                                                                  "domain_tracer_change_last20s_fraction", "pass")},
        },
        "units": S["units"],
        "conversions": "one red adds its 90-s mean / 10 to a 15-min mean and / 40 to a 1-h mean (PLAN 5 item 9)",
    }
    R = json.load(open(OUT)) if os.path.exists(OUT) else {
        "title": "Kerbside idling-scooter exhaust: OpenFOAM LES scenario results (research; agreed statistics of PLAN.md section 5 only)",
        "conventions": {"stats": "P5/P50/P95 over 1,000 emission draws (model.mjs drawScooter) for ONE simulated red per case",
                        "CO": "increment above background, ppm, unless 'total'", "heights": "above the standing surface (pavement top 0.2 m)",
                        "K": "d = horizontal distance from the nearest kerb-lane tailpipe toward the pavement; dx = along-street offset (-1, 0, +1 m)",
                        "averaging": "mean = 90-s red mean; max10s = highest 10-s running mean; max1s = highest 1-s mean"},
        "cases": {}}
    R["cases"][cid] = r3(entry)
    json.dump(R, open(OUT, "w"), indent=1, ensure_ascii=False)
    print(f"{OUT}: case {cid} written ({len(keepK)} K rows)")


if __name__ == "__main__":
    main()
