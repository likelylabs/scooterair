#!/usr/bin/env python3
"""Write research/simulation/results-simulation.json: the FINAL numbers of the signed report only.
Each number: what, case, probe, statistic, low / central / high, unit, reference (value + averaging), above
reference?, condition and its probability, confidence, and the factors used to widen the range.

Convention: central = P50 over 1,000 emission draws of the one simulated red. low = P5 / flow_lo / grid_lo,
high = P95 x flow_hi x grid_hi, where the flow and grid factors are the verified uncertainty of that case
(METHOD.md section 5). Nothing here is tuned to any threshold.
Inputs: results/<id>/stats.json, corrections/stay_<id>.json, results/NF1-*/stats.json (if present)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda *p: json.load(open(os.path.join(HERE, *p)))
ex = lambda *p: os.path.exists(os.path.join(HERE, *p))

FLOW = {  # (divide P5 by, multiply P95 by, why)
    "S1": (1, 5, "end-fed canyon inlet forces 0.6-1.3 m/s along the kerb: probably low x2-5"),
    "S2": (1, 5, "end-fed canyon inlet forces 0.6-0.8 m/s along the kerb: probably low x2-5"),
    "S1-from": (2, 2, "wind held from the pack for the whole red: trusted to about x2 for that condition"),
    "S4-S1-from": (2, 2, "as S1-from"),
    "A": (2, 2, "one 30-s red, wind 2.0 m/s from the pack; A2 untested"),
    "S5-12b": (2, 2, "one red, coarse grid, see METHOD 4.4"),
    "S4-S5-12b": (2, 2, "as S5-12b"),
}
GRID_PEAK = (3, 3, "1-s and 10-s values within 1 m: grid-limited, about x0.3-3 (METHOD 5.3)")


def comb(a, b):
    """independent multiplicative uncertainties combined in log-quadrature (not worst-on-worst)"""
    import math
    return math.exp(math.sqrt(math.log(a) ** 2 + math.log(b) ** 2))


def rows(cid):
    return {r["label"]: r for r in J("results", cid, "stats.json")["probes"]}


def num(what, cid, label, path, unit, ref=None, above=None, cond="", prob="", conf="low", peak=False, scale=1.0, nofactor=False):
    r = rows(cid)[label]
    v = r
    for k in path:
        v = v[k]
    fl = FLOW.get(cid, (1, 1, "")) if not nofactor else (1, 1, "")
    g = GRID_PEAK if peak else (1, 1, "")
    sig = lambda x: float(f"{x:.2g}")
    flo, fhi = comb(fl[0], g[0]), comb(fl[1], g[1])
    return {"what": what, "case": cid, "probe": label, "statistic": "/".join(path), "unit": unit,
            "low": sig(v["P5"] * scale / flo), "central": sig(v["P50"] * scale), "high": sig(v["P95"] * scale * fhi),
            "emission_P5_P50_P95": [sig(v["P5"] * scale), sig(v["P50"] * scale), sig(v["P95"] * scale)],
            "range_factors": [x for x in (fl[2], g[2]) if x], "reference": ref, "aboveReference": above,
            "condition": cond, "conditionProbability": prob, "confidence": conf}


def stay(what, cid, label, key, sub, unit, ref, above, cond, prob, conf="low"):
    s = J("corrections", f"stay_{cid}.json")["probes"][label]
    lo = s["stay_through"][f"duty0.45_{key}"][sub]; hi = s["stay_through"][f"duty0.65_{key}"][sub]
    fl = FLOW.get(cid, (1, 1, ""))
    sig = lambda x: float(f"{x:.2g}")
    return {"what": what, "case": cid, "probe": label, "statistic": f"stay-through {key}, fresh pack every red", "unit": unit,
            "low": sig(lo["P5"] / fl[0]), "central": sig(0.5 * (lo["P50"] + hi["P50"])), "high": sig(hi["P95"] * fl[1]),
            "red_45pct_P50": sig(lo["P50"]), "red_65pct_P95": sig(hi["P95"]),
            "range_factors": [fl[2], "red 45-65 % of the cycle; nothing added in green; same simulated red every time; extrapolation (S8 not run)"],
            "reference": ref, "aboveReference": above, "condition": cond, "conditionProbability": prob, "confidence": conf}


def one_red(what, cid, label, key, unit, ref, above, cond, prob, conf="low-moderate"):
    s = J("corrections", f"stay_{cid}.json")["probes"][label][key]
    fl = FLOW.get(cid, (1, 1, ""))
    sig = lambda x: float(f"{x:.2g}")
    return {"what": what, "case": cid, "probe": label, "statistic": key, "unit": unit,
            "low": sig(s["P5"] / fl[0]), "central": sig(s["P50"]), "high": sig(s["P95"] * fl[1]), "range_factors": [fl[2]],
            "reference": ref, "aboveReference": above, "condition": cond, "conditionProbability": prob, "confidence": conf}


WHO15 = {"value": "87 ppm (100 mg/m3)", "averaging": "15 min", "body": "WHO"}
WHO1h = {"value": "31 ppm (35 mg/m3; Taiwan 1-h standard 31 ppm per 2024 amendment, older files 35)", "averaging": "1 h", "body": "WHO / Taiwan"}
OEH1h = {"value": "20 ppm (23 mg/m3)", "averaging": "1 h", "body": "California OEHHA acute REL"}
NIOSH = {"value": "200 ppm", "averaging": "instantaneous ceiling (workplace)", "body": "NIOSH"}
BZ1h = {"value": "8.5 ppb (27 ug/m3)", "averaging": "1 h (derived on a 6-h basis)", "body": "California OEHHA acute REL"}
VAP = {"value": "0.47-0.58 ppm petrol vapour = about 2.1-3.5 ppmC", "averaging": "a sniff (seconds)", "body": "API 1995 (vapour, not exhaust)"}
OU1 = {"value": "1 odour unit (detection by half a panel)", "averaging": "a sniff (seconds)", "body": "odour-panel convention"}
HELD = "wind blowing from the scooters to the kerb and held for the whole 90-s red"
P_HELD = "at most about 1 in 8 peak-hour reds (wind sector x speed shares; the share that also holds direction for 90 s is unknown)"
HIGH = "nearest kerb-lane scooter a 6.5 % CO, HC-rich emitter"
P_HIGH = "nearest scooter >= 5 % CO in about 1.0 % of reds; with held wind at most about 0.1 % of peak-hour reds"
CANYON = "20 m street canyon, 12 m buildings; kerb air 0.6-1.3 m/s along the street (end-fed inlet artefact)"

N = []
# --- one red, CO, converted
N.append(one_red("CO added to a 15-min mean by one red, ordinary canyon street, kerb 0.5 m, 0.7 m height", "S1", "K d=0.5 dx=0.0 h=0.7",
                 "CO_one_red_to_15min_ppm", "ppm", WHO15, "no", CANYON, "not attached (wind as run differs from the target)", "low"))
N.append(one_red("CO added to a 15-min mean by one red, wind held from a dozen scooters, kerb 0.5 m, 0.7 m height", "S1-from", "K d=0.5 dx=0.0 h=0.7",
                 "CO_one_red_to_15min_ppm", "ppm", WHO15, "no", HELD, P_HELD))
N.append(one_red("CO added to a 15-min mean by one red, held wind and a high emitter 0.5 m away, 0.7 m height", "S4-S1-from", "K d=0.5 dx=0.0 h=0.7",
                 "CO_one_red_to_15min_ppm", "ppm", WHO15, "no", HELD + "; " + HIGH, P_HIGH))
# --- stay-through
N.append(stay("CO 15-min mean, standing through every red, held wind, kerb 0.5 m, 0.7 m", "S1-from", "K d=0.5 dx=0.0 h=0.7", "15min",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO15, "no", HELD + " for 15 minutes", "rarer than " + P_HELD))
N.append(stay("CO 15-min mean, standing through every red, held wind, kerb 0.5 m, 0.3 m (highest probe)", "S1-from", "K d=0.5 dx=0.0 h=0.3", "15min",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO15, "no", HELD + " for 15 minutes", "rarer than " + P_HELD))
N.append(stay("CO 1-h mean, standing through every red, held wind, kerb 0.5 m, 0.3 m", "S1-from", "K d=0.5 dx=0.0 h=0.3", "1h",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO1h, "no", HELD + " for an hour", "rarer than " + P_HELD))
N[-1]["note"] = "against OEHHA 1-h 20 ppm: approached at P50, reached at the upper end"
N.append(stay("CO 15-min mean, same high emitter every red, held wind, kerb 0.5 m, 0.7 m", "S4-S1-from", "K d=0.5 dx=0.0 h=0.7", "15min",
              "CO_ppm_fresh_pack_each_red", "ppm", WHO15, "in-worst-case-only", HELD + "; " + HIGH + " returning every red", "not realistic (same scooter at the same spot every red)"))
N[-1]["note"] = "below 87 at 0.7 m (30-55 ppm); above 87 only at 0.3 m height (73-137 ppm)"
N.append(stay("Benzene 1-h mean, standing through every red, held wind, kerb 0.5 m, 0.7 m", "S1-from", "K d=0.5 dx=0.0 h=0.7", "1h",
              "BZ_ppb_fresh_pack_each_red", "ppb", BZ1h, "yes", HELD + " for an hour; a person who stays (vendor, police)", "rarer than " + P_HELD))
N.append(stay("Benzene 1-h mean, standing through every red, held wind, kerb 1 m, 1.1 m", "S1-from", "K d=1.0 dx=0.0 h=1.1", "1h",
              "BZ_ppb_fresh_pack_each_red", "ppb", BZ1h, "yes", HELD + " for an hour", "rarer than " + P_HELD))
N.append(one_red("Benzene added to a 1-h mean by one red, held wind, kerb 0.5 m, 0.7 m", "S1-from", "K d=0.5 dx=0.0 h=0.7",
                 "BZ_one_red_to_1h_ppb", "ppb", BZ1h, "no", HELD, P_HELD))
# --- red means at the kerb
for cid, lab, w, c, p in (("S1", "K d=0.5 dx=0.0 h=1.1", "CO 90-s mean, canyon, kerb 0.5 m, child height (kerb-lane pack plume)", CANYON, "not attached"),
                          ("S1-from", "K d=0.5 dx=0.0 h=0.7", "CO 90-s mean, held wind, kerb 0.5 m, pushchair height", HELD, P_HELD),
                          ("S1-from", "K d=0.5 dx=0.0 h=1.5", "CO 90-s mean, held wind, kerb 0.5 m, adult height", HELD, P_HELD),
                          ("S1-from", "K d=4.0 dx=0.0 h=1.5", "CO 90-s mean, held wind, kerb 4 m, adult height", HELD, P_HELD)):
    N.append(num(w, cid, lab, ["CO", "mean"], "ppm", {"value": "none: a 90-s mean has no guideline; the published estimate's dozen median is 0.3 ppm (P95 1) at 1.5 m", "averaging": "90 s"},
                 "not-comparable", c, p))
# --- peaks
for cid, lab, w, c, p in (("S1", "K d=0.5 dx=0.0 h=1.1", "CO highest 1 s, canyon, kerb 0.5 m, child height", CANYON, "not attached"),
                          ("S1-from", "K d=0.5 dx=0.0 h=0.7", "CO highest 1 s, held wind, kerb 0.5 m, pushchair height", HELD, P_HELD),
                          ("S4-S1-from", "K d=0.5 dx=0.0 h=0.7", "CO highest 1 s, held wind + high emitter, kerb 0.5 m, pushchair height", HELD + "; " + HIGH, P_HIGH)):
    N.append(num(w, cid, lab, ["CO", "max1s"], "ppm", NIOSH, ("in-worst-case-only" if "S4" in cid else "no"), c, p, conf="low (grid-limited)", peak=True))
N[-1]["note"] = "at least one second >= 200 ppm in 53 % of emission draws of this red (S4-S1-from); S1-from fleet 1.1 %"
# --- THC, odour
N.append(num("THC highest 1 s, held wind, kerb 0.5 m, 0.7 m", "S1-from", "K d=0.5 dx=0.0 h=0.7", ["THC", "max1s"], "ppmC", VAP, "yes", HELD, P_HELD, conf="low (grid-limited)", peak=True))
N.append(num("THC highest 1 s, canyon 30 scooters, kerb 0.5 m, 0.7 m", "S2", "K d=0.5 dx=0.0 h=0.7", ["THC", "max1s"], "ppmC", VAP, "in-worst-case-only", CANYON, "not attached", conf="low", peak=True))
for cid, lab, c, p in (("S1-from", "K d=0.5 dx=0.0 h=0.7", HELD, P_HELD), ("S1", "K d=0.5 dx=0.0 h=1.1", CANYON, "not attached")):
    for DT in ("6800", "800"):
        N.append(num(f"Share of seconds of the red at or above the odour detection threshold (D/T {DT}), kerb 0.5 m", cid, lab,
                     ["odour", f"OU_hc10_DT{DT}", "share_of_seconds_at_or_above", "1"], "fraction of seconds", OU1,
                     None, c, p, conf="low (odour threshold from 1967-70 car-exhaust abstracts)", nofactor=True))
    N.append(num("Odour units, highest 1 s (D/T 6,800), kerb 0.5 m", cid, lab, ["odour", "OU_hc10_DT6800", "max1s"], "odour units", OU1, "yes", c, p,
                 conf="low (grid-limited; threshold from abstracts)", peak=True))
# dilution
for cid, lab, c, p in (("S1-from", "K d=0.5 dx=0.0 h=0.7", HELD, P_HELD), ("S1", "K d=0.5 dx=0.0 h=1.1", CANYON, "not attached")):
    r = rows(cid)[lab]["dilution_total"]
    N.append({"what": "Dilution of raw tailpipe exhaust at the nose (red mean / highest 1 s), kerb 0.5 m", "case": cid, "probe": lab,
              "statistic": "dilution_total (emission-independent)", "unit": "times", "low": float(f"{r['max1s']:.2g}"),
              "central": float(f"{r['mean']:.2g}"), "high": float(f"{r['mean'] * (5 if cid == 'S1' else 2):.2g}"),
              "note": "low = highest-1-s dilution; central = red-mean dilution; high = red mean x flow factor", "reference": None,
              "aboveReference": "not-comparable", "condition": c, "conditionProbability": p, "confidence": "low-moderate"})
# Kaohsiung anchor
a2 = J("results", "A", "a2_iot.json") if ex("results", "A", "a2_iot.json") else None
N.append({"what": "Kaohsiung sensor positions: highest 30-s CO increment in one favourable red (no sensor lag)", "case": "A", "unit": "ppm",
          "low": 0.67, "central": 1.33, "high": 2.55, "reference": {"value": "observed highest 1-min in 48 h: about 0.8-1.2 ppm above background", "averaging": "1 min, 48-h maximum"},
          "aboveReference": "not-comparable", "condition": "one 30-s red, wind 2.0 m/s from the pack toward the sensor area", "conditionProbability": "not attached",
          "confidence": "A2 untested: not contradicted, not reproduced", "source_file": "results/A/a2_iot.json" if a2 else None})

out = {"title": "Kerbside idling-scooter exhaust, 3-D LES: final numbers of the signed report (ESTIMATE / 推估)",
       "date": "2026-11-27", "status": "ESTIMATE (推估), not a measurement",
       "conventions": {"central": "P50 over 1,000 emission draws of ONE simulated red",
                       "low_high": "P5 / F and P95 x F, F = flow factor and grid factor combined in log-quadrature, exp(sqrt(ln(f1)^2 + ln(f2)^2)) (factors listed per number); odour-share numbers carry the emission spread only",
                       "aboveReference": "set from the numbers: 'yes' if central exceeds the reference, 'in-worst-case-only' if only high does, 'no' otherwise; only for references of matching averaging time ('not-comparable' otherwise)",
                       "CO": "increment above the street's background, ppm", "heights": "above the pavement surface",
                       "conversions": "one red of W s adds mean x W/900 to a 15-min mean and mean x W/3600 to a 1-h mean",
},
       "numbers": N,
       "admissibility": {"S1": "kept, relabelled (kerb-lane pack plume; probably low x2-5)", "S2": "kept, relabelled ('calm' withdrawn; probably low x2-5)",
                         "S1-from": "kept: conditional on held wind", "A": "kept: 30-s red, A2 untested",
                         "S5-12": "domain-blockage-affected, not admissible (replaced by S5-12b)", "S4-S5-12": "not admissible",
                         "S4-S1-from": "kept: conditional", "S4-S1, S4-S2": "kept, as their base cases"},
       "detail": "results-matrix.json (every case and probe set), results/<id>/stats.json, corrections/"}
extra = os.path.join(HERE, "corrections", "final_extra.json")   # S5-12b and NF1 numbers, written by final_extra.py
if os.path.exists(extra):
    E = json.load(open(extra))
    out["numbers"] += E.get("numbers", []); out["admissibility"].update(E.get("admissibility", {})); out["nearField"] = E.get("nearField")
REFNUM = {"87 ppm": 87, "31 ppm": 31, "20 ppm": 20, "200 ppm": 200, "8.5 ppb": 8.5, "0.47-0.58 ppm petrol": 2.1, "1 odour unit": 1}
for n in out["numbers"]:
    ref = (n.get("reference") or {}).get("value", "")
    rv = next((v for k, v in REFNUM.items() if ref.startswith(k)), None)
    if rv is None or n.get("aboveReference") == "not-comparable":
        continue
    if "share of seconds" in n["what"].lower():
        n["aboveReference"] = "yes" if n["central"] > 0.5 else ("in-worst-case-only" if n["high"] > 0.05 else "no")
        n["note"] = "a share of seconds above the detection threshold; 'yes' means in most seconds of the red"
        continue
    n["aboveReference"] = "yes" if n["central"] > rv else ("in-worst-case-only" if n["high"] > rv else "no")

json.dump(out, open(os.path.join(HERE, "results-simulation.json"), "w"), indent=1, ensure_ascii=False)
print(len(out["numbers"]), "numbers written")
