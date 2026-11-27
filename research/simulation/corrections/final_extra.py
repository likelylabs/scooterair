#!/usr/bin/env python3
"""Final numbers from the signed-report reruns (S5-12b, S4-S5-12b, NF1 grid check) -> corrections/final_extra.json,
merged into results-simulation.json by final_numbers.py. Same conventions as final_numbers.py."""
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import importlib.util
spec = importlib.util.spec_from_file_location("fn_mod", os.path.join(HERE, "final_numbers.py"))
src = open(os.path.join(HERE, "final_numbers.py")).read()
src = src[:src.index("N = []")]            # helpers and constants only
ns = {"__file__": os.path.join(HERE, "final_numbers.py")}
exec(src, ns)
num, stay, one_red = ns["num"], ns["stay"], ns["one_red"]
WHO15, WHO1h, NIOSH, BZ1h, OU1 = ns["WHO15"], ns["WHO1h"], ns["NIOSH"], ns["BZ1h"], ns["OU1"]
ARC = "arcade street, 12 scooters, 0.5 m/s toward the building (as run: 0.25-0.33 m/s at the kerb from the pack toward the arcade; -161 deg at the upstream probe)"
P_ARC = "wind toward the facade within +-45 deg at <= 0.5 m/s in about 5 % of reds at arcade streets (upper bound; arcade share of streets unknown)"
HIGH = ns["HIGH"]
N = []
N.append(one_red("CO added to a 15-min mean by one red, arcade street, kerb edge 0.5 m, 0.7 m", "S5-12b", "K d=0.5 dx=0.0 h=0.7",
                 "CO_one_red_to_15min_ppm", "ppm", WHO15, "no", ARC, P_ARC, "low"))
N.append(num("CO 90-s mean, arcade street, kerb edge 0.5 m, pushchair height", "S5-12b", "K d=0.5 dx=0.0 h=0.7", ["CO", "mean"], "ppm",
             {"value": "none (90-s mean)", "averaging": "90 s"}, "not-comparable", ARC, P_ARC))
N.append(num("CO 90-s mean, inside the arcade 1 m from its front, 0.7 m (most exposed arcade probe)", "S5-12b", "AR x=-1.8 in=1.0 h=0.7", ["CO", "mean"], "ppm",
             {"value": "none (90-s mean)", "averaging": "90 s"}, "not-comparable", ARC, P_ARC))
N.append(num("CO highest 1 s, arcade street, kerb edge 0.5 m, 0.7 m", "S5-12b", "K d=0.5 dx=0.0 h=0.7", ["CO", "max1s"], "ppm", NIOSH, None, ARC, P_ARC,
             conf="low (grid-limited)", peak=True))
N[-1]["note"] = "at least one second >= 200 ppm in 8 % of emission draws (fleet); about 0.4 % of reds at arcade streets at most"
N.append(num("CO highest 1 s, arcade street + high emitter 0.5 m away, 0.7 m", "S4-S5-12b", "K d=0.5 dx=0.0 h=0.7", ["CO", "max1s"], "ppm", NIOSH, None,
             ARC + "; " + HIGH, "about 1 % x 5 % = 0.05 % of reds at arcade streets at most", conf="low (grid-limited)", peak=True))
N.append(stay("CO 15-min mean, standing through every red, arcade street, kerb edge 0.5 m, 0.7 m", "S5-12b", "K d=0.5 dx=0.0 h=0.7", "15min",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO15, None, ARC + " for 15 minutes", "rarer than " + P_ARC))
N.append(stay("CO 15-min mean, same high emitter every red, arcade street, kerb edge 0.5 m, 0.3 m height", "S4-S5-12b", "K d=0.5 dx=0.0 h=0.3", "15min",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO15, None, ARC + "; " + HIGH + " returning to the same spot every red for 15 minutes; 0.3 m above the pavement",
              "not realistic (same scooter at the same spot every red, wind held 15 minutes)"))
N[-1]["note"] = "the only simulated configuration above 87 ppm over 15 minutes; at 0.7 m the same case gives 32-59 ppm"
N.append(stay("Benzene 1-h mean, standing through every red, arcade street, kerb edge 0.5 m, 0.7 m", "S5-12b", "K d=0.5 dx=0.0 h=0.7", "1h",
              "BZ_ppb_fresh_pack_each_red", "ppb", BZ1h, None, ARC + " for an hour", "rarer than " + P_ARC))
N.append(num("Share of seconds at or above the odour detection threshold (D/T 6800), arcade street, kerb edge 0.5 m, 0.7 m", "S5-12b", "K d=0.5 dx=0.0 h=0.7",
             ["odour", "OU_hc10_DT6800", "share_of_seconds_at_or_above", "1"], "fraction of seconds", OU1, None, ARC, P_ARC,
             conf="low (odour threshold from 1967-70 car-exhaust abstracts)", nofactor=True))
ns["FLOW"]["NF1-fine"] = (3, 2, "single scooter, near-calm held wind with sigma_w a third of the PLAN floor (upper-side); fine grid not shown converged; engine heat changes 0.5 m values up to x4")
NF = "one idling scooter, near-calm air (0.42 m/s as run) held from the scooter toward the person; 0.5 m directly downwind of the tailpipe; fine grid"
P_NF = "light wind (<= 0.3-0.4 m/s) from that sector in about 1 % of reds; held for a whole red or 15 minutes: unknown, much rarer; exact position needed"
N.append(one_red("CO added to a 15-min mean by one red (30-s window as a 90-s red), pushchair 0.5 m downwind of one tailpipe, 0.6 m", "NF1-fine", "K d=0.5 dx=0.0 h=0.6",
                 "CO_red_mean_ppm", "ppm", WHO15, None, NF, P_NF, "low"))
e = N[-1]
for k in ("low", "central", "high"):
    e[k] = float(f"{e[k] / 10:.2g}")
e["statistic"] = "window mean / 10 (as one 90-s red)"
N.append(stay("CO 15-min mean, pushchair 0.5 m downwind of one tailpipe, 0.6 m, every red for 15 min, near-calm held wind", "NF1-fine", "K d=0.5 dx=0.0 h=0.6", "15min",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO15, None, NF + "; every red for 15 minutes", P_NF))
N[-1]["note"] = "above 87 ppm in 10 % (red 45 % of cycle) to 22 % (65 %) of such 15-min periods; at 0.7 m 2-4 %; at 1.1 m or 1 m away 0 %"
N.append(stay("CO 1-h mean, pushchair 0.5 m downwind of one tailpipe, 0.6 m, every red for 1 h, near-calm held wind", "NF1-fine", "K d=0.5 dx=0.0 h=0.6", "1h",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO1h, None, NF + "; every red for an hour", P_NF))
N[-1]["note"] = "above 31 ppm in 83-99 % of such hours at 0.6 m, 24-70 % at 0.7 m"
N.append(num("CO highest 1 s, pushchair 0.5 m downwind of one tailpipe, 0.6 m, near-calm held wind", "NF1-fine", "K d=0.5 dx=0.0 h=0.6", ["CO", "max1s"], "ppm", NIOSH, None,
             NF, P_NF, conf="low"))
N[-1]["note"] = "at least one second >= 200 ppm in 34 % of emission draws"
N.append({"what": "Grid factor: coarse / fine highest 1 s at 0.5-1 m, pushchair height 0.6-0.8 m (matrix values probably low by the inverse)", "case": "NF1-fine vs NF1-coarse",
          "unit": "ratio", "low": 0.23, "central": 0.3, "high": 0.33, "reference": None, "aboveReference": "not-comparable", "condition": "single scooter, near-calm held wind",
          "conditionProbability": "n/a (numerical check)", "confidence": "low (fine grid not shown converged)",
          "note": "means at pushchair height 0.44-1.5; at 1.1-1.5 m, 0.5 m away the coarse grid reads 3-26 times high; at 2 m means agree within about 20 %"})
adm = {"NF1-fine": "kept: near-field check; A6 fails (sigma_w 0.031 m/s, a third of the floor), so upper-side", "NF1-coarse": "kept: grid comparison", "NF1-coarse-0kW": "kept: engine-heat sensitivity",
       "S5-12b": "kept: arcade rerun with 60.8 m domain top; A6 fails on direction (-161 deg upstream, kerb flow toward the arcade 0.25-0.33 m/s); A8 tracer change 5-12 % over the last 20 s",
       "S4-S5-12b": "kept: conditional (high emitter)"}
nf = None
p = os.path.join(HERE, "corrections", "nf1_grid.json")
if os.path.exists(p):
    nf = json.load(open(p))
json.dump({"numbers": N, "admissibility": adm, "nearField": nf}, open(os.path.join(HERE, "corrections", "final_extra.json"), "w"), indent=1, ensure_ascii=False)
print(len(N), "extra numbers")
