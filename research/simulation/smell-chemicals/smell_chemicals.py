#!/usr/bin/env python3
"""What is at the nose in the seconds when idling-scooter exhaust can be smelled (PLAN-SMELL.md, fixed in advance).

Usage: python3 smell_chemicals.py RUN_DIR [--n 1000] [--reps 20000]
  RUN_DIR holds the raw flow cases (RUN_DIR/<case>/case), read-only. Corrections after the sign-off review: corrections.md. Writes results-smell.json and
  results-smell.txt next to this file.

Reuses the signed simulation's own pieces: stats.bins1s (1-s means), cfd/analyse.series (probe files), the
per-group tracer normalisation and window stored in results/<case>/stats.json, and draws.mjs (the same 1,000
emission draws, seed and emitter mode). A chemical X with mass share f_X of THC gives, per tracer group g and
draw d, a mole fraction s_g(t) * THC_g,d / mdot * f_X,d * M_air / M_X (stats.py's rule, with THC mass in place of
CO or benzene). Benzene uses the draw's own BZ, so it is the signed benzene. Odour units as stats.py (OU_hc10).
"""
import json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SIM = os.path.dirname(HERE)
sys.path.insert(0, SIM); sys.path.insert(0, os.path.join(SIM, "cfd"))
from stats import bins1s, M_AIR, M_CO, M_BZ, F_REF  # noqa: E402
from analyse import series  # noqa: E402

CASES = ["S1", "S1-from", "A", "S5-12b", "NF1-fine"]
HEIGHTS = {c: ["0.7", "1.1", "1.5"] for c in CASES}
HEIGHTS["NF1-fine"] = ["0.6", "0.7", "1.1", "1.5"]
DISTS = ["0.5", "1.0"]
DTS = [800, 6800]
RED_S = {"S1": 90, "S1-from": 90, "A": 30, "S5-12b": 90, "NF1-fine": 90}   # NF1: 30-s window taken as a 90-s red (signed)
FLOW = {"S1": (1, 5), "S1-from": (2, 2), "A": (2, 2), "S5-12b": (2, 2), "NF1-fine": (3, 2)}   # final_numbers.py / final_extra.py
GRID = (3, 3)
SHARE_SEED = 20261128
MV = 24.45
CONF_ORDER = ["very low", "low", "low-moderate", "moderate", "high"]


def comb(a, b):
    return float(np.exp(np.sqrt(np.log(a) ** 2 + np.log(b) ** 2)))


def sig(x):
    return None if x is None or not np.isfinite(x) else float(f"{x:.2g}")


def q(a):
    a = np.asarray(a, float); a = a[np.isfinite(a)]
    if a.size == 0:
        return {"P5": None, "P50": None, "P95": None, "n": 0}
    p = np.percentile(a, [5, 50, 95])
    return {"P5": float(p[0]), "P50": float(p[1]), "P95": float(p[2]), "n": int(a.size)}


def lch(qq, flo, fhi):
    """final_numbers convention: low = P5 / F, central = P50, high = P95 x F."""
    if qq["P50"] is None:
        return {"low": None, "central": None, "high": None}
    return {"low": sig(qq["P5"] / flo), "central": sig(qq["P50"]), "high": sig(qq["P95"] * fhi)}


def tri(rng, lo, c, hi, n):
    return rng.triangular(lo, c, hi, n) if hi > lo else np.full(n, c)


def lower_conf(a, b):
    def rank(s):
        s = s.lower()
        for i in range(len(CONF_ORDER) - 1, -1, -1):
            if s.startswith(CONF_ORDER[i]):
                return i
        return 1
    return a if rank(a) <= rank(b) else b


def run_draws(meta_path, n, seed, mode):
    out = subprocess.run(["node", os.path.join(SIM, "draws.mjs"), meta_path, str(n), str(seed), mode],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def shares(spec, n):
    """per-draw mass share (fraction) for every THC- or CO-based chemical; benzene handled separately"""
    rng = np.random.default_rng(SHARE_SEED)
    sh = {}
    for c in spec["chemicals"]:
        if c["key"] == "benzene" or not c["admissible"]:
            continue
        sh[c["key"]] = tri(rng, c["low"] / 100, c["central"] / 100, c["high"] / 100, n)
    return sh


def case_context(sim_numbers, cid):
    for r in sim_numbers:
        if r.get("case") == cid and r.get("conditionProbability"):
            conf = r["confidence"]
            if not any(conf.lower().startswith(x) for x in CONF_ORDER):
                conf = f"low ({conf})"
            return {"condition": r["condition"], "conditionProbability": r["conditionProbability"], "caseConfidence": conf}
    return {}


def threshold_level(spec, run_dir, n=10000):
    """(c) X at exactly OU = 1 for single scooters (independent of the flow): level = 120/(F*DT*w) * E_X/mdot * M_air/M_X"""
    meta_path = os.path.join(run_dir, "NF1-fine", "case", "case_meta.json")
    mdot = json.load(open(meta_path))["pipes"][0]["mdot"]
    D = run_draws(meta_path, n, 20261127, "fleet")
    g = [dr["g"]["s_head"] for dr in D["draws"]]
    F = np.array([x["F"] for x in g]); w = np.array([x["F_hc10"] for x in g]) / F
    thc = np.array([x["THC"] for x in g]) * 1e-6; co = np.array([x["CO"] for x in g]) * 1e-6; bz = np.array([x["BZ"] for x in g]) * 1e-9
    sh = shares(spec, n)
    out = {"what": "level of each chemical when the exhaust is exactly at the smell threshold (1 odour unit), single idling scooter",
           "method": "raw-exhaust content / threshold dilution: 120 g/h / (F x D/T x w) x E_X / mdot x M_air / M_X; w = 10 for HC-rich scooters (signed OU_hc10)",
           "n_single_scooter_draws": n, "share_HC_rich": float((w > 1).mean()), "chemicals": {},
           "raw_exhaust_benzene_ppb_P5_P50_P95": [float(x) for x in np.percentile(bz / mdot * M_AIR / M_BZ * 1e9, [5, 50, 95])],
           "note": "a typical value at exactly 1 odour unit, not a minimum: an HC-rich scooter (odour x10) puts less benzene at 1 OU"}
    for c in spec["chemicals"]:
        if not c["admissible"]:
            continue
        k = c["key"]
        E = bz if k == "benzene" else (co if c["basis"] == "CO" else thc) * sh[k]
        out["chemicals"][k] = {}
        for DT in DTS:
            ppb = F_REF / (F * DT * w) * E / mdot * M_AIR / c["M"] * 1e9
            qp = q(ppb); qu = q(ppb * c["M"] / MV)
            out["chemicals"][k][f"DT{DT}"] = {"ppb": {**lch(qp, 1, 1), "n": qp["n"]}, "ugm3": lch(qu, 1, 1)}
    return out


def main():
    run_dir = os.path.abspath(sys.argv[1])
    a = sys.argv
    ndraw = int(a[a.index("--n") + 1]) if "--n" in a else 1000
    reps = int(a[a.index("--reps") + 1]) if "--reps" in a else 20000
    spec = json.load(open(os.path.join(HERE, "speciation.json")))
    simres = json.load(open(os.path.join(SIM, "results-simulation.json")))
    chems = [c for c in spec["chemicals"] if c["admissible"]]
    odour = spec["odourThresholds_ppb"]; refs = spec["referenceValues"]
    res = {"title": "Chemicals at the nose in the seconds when idling-scooter exhaust can be smelled (ESTIMATE / 推估)",
           "date": "2026-11-27", "plan": "PLAN-SMELL.md (fixed before computing)", "status": "ESTIMATE (推估), not a measurement",
           "conventions": {
               "central": "P50 over 1,000 emission-and-share draws of ONE simulated red",
               "low_high": "(a) and (b): the signed flow factor F of the case combined with the grid factor 3 / 3 in log-quadrature is applied to the DILUTION before the smell test (corrections.md A1): low = P5 with the exhaust fraction / F_lo, high = P95 with the exhaust fraction x F_hi, so the flow uncertainty moves the share of smellable seconds and the levels never fall below the just-smellable level. (d): P5 / F and P95 x F (as final_numbers.py). (c) and (e) carry the emission and share spread only.",
               "smellable": "a second with odour units >= 1 (OU_hc10: exhaust fraction x D/T, HC-rich scooters x 10), D/T 800 and 6,800 kept apart",
               "units": "ppb by volume; ug/m3 at 25 C, 1 atm (ppb x M / 24.45); at 30 C every ug/m3 would be about 1.7 % lower (no verdict changes)",
               "hazard": "IARC groups in speciation.json are hazard labels only, not a risk from one red light; no cancer risk is computed; chemicals are not ranked by harm",
               "comparisons": "a seconds-long or red-mean value is never set beside a 30-min, 1-h, annual or lifetime value; only the converted averages (section d) are compared, and only with references of the same averaging time"},
           "simulationCautions": ["one simulated red per case", "seconds within 1 m are grid-limited (about x0.3-3)", "held-wind condition where stated", "low to moderate confidence", "odour thresholds of raw exhaust from 1967-70 car-engine abstracts"],
           "cases": {}, "checks": {}}
    rng_stay = np.random.default_rng(20261127)
    checks_bz, checks_ou, mass, checks_floor = [], [], {}, []
    for cid in CASES:
        case = os.path.join(run_dir, cid, "case")
        st = json.load(open(os.path.join(SIM, "results", cid, "stats.json")))
        meta = json.load(open(os.path.join(case, "case_meta.json")))
        labels = meta["scene"]["probeLabels"]; tracers = meta["tracers"]; mdot = meta["pipes"][0]["mdot"]
        T0, T1 = st["window_s"]; W = T1 - T0
        want = [f"K d={d} dx=0.0 h={h}" for d in DISTS for h in HEIGHTS[cid]]
        idx = [labels.index(l) for l in want]
        S = np.stack([bins1s(*(lambda d: (d[:, 0], d[:, 1:][:, idx]))(series(case, "probes", t)), T0, W).T
                      * st["tracer_normalisation"][t]["factor_applied"] for t in tracers], 1)     # (probe, group, t)
        D = run_draws(os.path.join(case, "case_meta.json"), ndraw, st.get("seed", 20261127), st["emitters"])
        G = lambda key, sc: np.array([[dr["g"][t][key] * sc for dr in D["draws"]] for t in tracers])  # (group, draw)
        thc_mf = G("THC", 1e-6) / mdot          # THC mass fraction per unit tracer
        co_mf = G("CO", 1e-6) / mdot
        bz_ppb = G("BZ", 1e-9) / mdot * M_AIR / M_BZ * 1e9
        ou_k = {"hc10": G("F_hc10", 1.0) / F_REF, "hc1": G("F", 1.0) / F_REF}
        sh = shares(spec, ndraw)
        mass[cid] = None
        ctx = case_context(simres["numbers"], cid)
        flo, fhi = FLOW[cid]; gflo, gfhi = comb(flo, GRID[0]), comb(fhi, GRID[1])
        cres = {"red_window_s": W, "red_length_for_averages_s": RED_S[cid], "emitters": st["emitters"],
                "admissibility": simres["admissibility"].get(cid), **ctx, "flow_factor": FLOW[cid], "probes": {}}
        for j, lab in enumerate(want):
            Sp = S[j]                                   # (group, t)
            pr = {"smellable_share": {}, "levels_in_smellable_seconds": {}, "averages": {}, "own_odour_threshold": {}}
            conc = {}
            for c in chems:
                k = c["key"]
                if k == "benzene":
                    conc[k] = np.einsum("gt,gd->dt", Sp, bz_ppb)
                elif c["basis"] == "CO":
                    conc[k] = np.einsum("gt,gd->dt", Sp, co_mf) * sh[k][:, None] * M_AIR / c["M"] * 1e9
                else:
                    conc[k] = np.einsum("gt,gd->dt", Sp, thc_mf) * sh[k][:, None] * M_AIR / c["M"] * 1e9
            # checks: benzene reproduces stats.json
            srow = next(r for r in st["probes"] if r["label"] == lab)
            for s_, arr in (("mean", conc["benzene"].mean(1)), ("max1s", conc["benzene"].max(1))):
                mine = q(arr); sg = srow["BZ"][s_]
                checks_bz.append({"case": cid, "probe": lab, "stat": s_, "this_code": [mine["P5"], mine["P50"], mine["P95"]],
                                  "signed_stats_json": [sg["P5"], sg["P50"], sg["P95"]],
                                  "max_rel_diff": max(abs(mine[p] / sg[p] - 1) for p in ("P5", "P50", "P95") if sg[p] > 0)})
            for DT in DTS:
                OU = {wk: np.einsum("gt,gd->dt", Sp, ou_k[wk]) * DT for wk in ou_k}
                M = OU["hc10"] >= 1.0                    # (draw, t)
                nsm = M.sum(1); share = nsm / M.shape[1]
                sg = srow["odour"][f"OU_hc10_DT{DT}"]["share_of_seconds_at_or_above"]["1"]; mine = q(share)
                checks_ou.append({"case": cid, "probe": lab, "DT": DT, "this_code": [mine["P5"], mine["P50"], mine["P95"]],
                                  "signed": [sg["P5"], sg["P50"], sg["P95"]]})
                # corrections A1: the flow-and-grid factor is put on the DILUTION before the smell test
                # (scale 1/gflo = more dilution for the low end, gfhi = less dilution for the high end)
                scl = {"low": 1.0 / gflo, "central": 1.0, "high": gfhi}
                MS = {kk: (OU["hc10"] * v_) >= 1.0 for kk, v_ in scl.items()}
                NS = {kk: MS[kk].sum(1) for kk in scl}
                shq = {kk: q(NS[kk] / M.shape[1]) for kk in scl}
                pr["smellable_share"][f"DT{DT}"] = {"low": sig(shq["low"]["P5"]), "central": sig(shq["central"]["P50"]), "high": sig(shq["high"]["P95"]),
                                                     "emission_only_P5_P50_P95": [sig(mine["P5"]), sig(mine["P50"]), sig(mine["P95"])],
                                                     "hc1_P50": sig(np.median((OU["hc1"] >= 1).mean(1))),
                                                     "draws_with_any_smellable_second": int((nsm > 0).sum()),
                                                     "draws_with_any_smellable_second_low_high_flow": [int((NS["low"] > 0).sum()), int((NS["high"] > 0).sum())],
                                                     "unit": "fraction of seconds of the red"}
                has = nsm > 0
                # floor check: in a smellable second benzene >= the draw's smallest benzene-per-odour-unit over its tracer groups
                ratio = bz_ppb / np.maximum(ou_k["hc10"] * DT, 1e-300)        # (group, draw)
                floor_d = ratio.min(0)
                lev = {}
                own = {}
                for c in chems:
                    k = c["key"]; X = conc[k]
                    def msm_x(Mk, Nk, sc):
                        hk = Nk > 0
                        return (np.where(hk, (X * sc * Mk).sum(1) / np.maximum(Nk, 1), np.nan),
                                np.where(hk, np.where(Mk, X * sc, -np.inf).max(1), np.nan))
                    msm, xsm = msm_x(M, nsm, 1.0)
                    mlo, xlo = msm_x(MS["low"], NS["low"], scl["low"])
                    mhi, xhi = msm_x(MS["high"], NS["high"], scl["high"])
                    qm, qx = q(msm), q(xsm)
                    if k == "benzene":
                        okm = msm[has] >= floor_d[has] * (1 - 1e-9)
                        checks_floor.append({"case": cid, "probe": lab, "DT": DT, "share_of_draws_mean_at_or_above_floor": float(okm.mean()) if has.any() else None,
                                             "floor_P5_P50": [float(x) for x in np.percentile(floor_d, [5, 50])],
                                             "published_low_ppb": sig(q(mlo)["P5"])})
                    conv = c["M"] / MV
                    def L3(lo_arr, ce, hi_arr):
                        a_, b_ = q(lo_arr), q(hi_arr)
                        if ce["P50"] is None:
                            return {"low": None, "central": None, "high": None}, {"low": None, "central": None, "high": None}
                        pp = {"low": sig(a_["P5"]), "central": sig(ce["P50"]), "high": sig(b_["P95"])}
                        return pp, {kk: (sig(v_ * conv) if v_ is not None else None) for kk, v_ in pp.items()}
                    mp, mu = L3(mlo, qm, mhi); xp, xu = L3(xlo, qx, xhi)
                    lev[k] = {"mean_over_smellable_seconds": {"ppb": mp, "ugm3": mu, "emission_P5_P50_P95_ppb": [sig(qm["P5"]), sig(qm["P50"]), sig(qm["P95"])]},
                              "highest_smellable_second": {"ppb": xp, "ugm3": xu, "emission_P5_P50_P95_ppb": [sig(qx["P5"]), sig(qx["P50"]), sig(qx["P95"])]},
                              "n_draws": qm["n"]}
                    if k in odour:
                        own[k] = {}
                        for thr in odour[k]:
                            above_sec = np.where(has, ((X >= thr) & M).sum(1) / np.maximum(nsm, 1), np.nan)
                            own[k][f"threshold_{thr}ppb"] = {
                                "share_of_draws_mean_over_smellable_seconds_at_or_above": sig(float((msm[has] >= thr).mean())) if has.any() else None,
                                "share_of_draws_highest_smellable_second_at_or_above": sig(float((xsm[has] >= thr).mean())) if has.any() else None,
                                "P50_share_of_smellable_seconds_at_or_above": sig(float(np.nanmedian(above_sec))) if has.any() else None}
                pr["levels_in_smellable_seconds"][f"DT{DT}"] = lev
                pr["own_odour_threshold"][f"DT{DT}"] = own
            # (d) converted averages for chemicals with a 30-min / 1-h reference
            for c in chems:
                k = c["key"]
                if k not in refs:
                    continue
                conv = c["M"] / MV
                red_mean_ug = conc[k].mean(1) * conv
                for ref in refs[k]:
                    T = ref["averaging_s"]; key = f"{int(T / 60)}min"
                    if key in pr["averages"].get(k, {}):
                        pr["averages"][k][key]["references"].append(ref); continue
                    one = q(red_mean_ug * RED_S[cid] / T)
                    stay = {}
                    for duty in (0.45, 0.65):
                        n = max(1, int(round(duty * T / 90.0)))
                        pick = rng_stay.integers(0, ndraw, size=(reps, n))
                        stay[duty] = q(duty * red_mean_ug[pick].mean(1))
                    st_l = {"low": sig(stay[0.45]["P5"] / flo), "central": sig(0.5 * (stay[0.45]["P50"] + stay[0.65]["P50"])),
                            "high": sig(stay[0.65]["P95"] * fhi), "red_45pct_P50": sig(stay[0.45]["P50"]), "red_65pct_P95": sig(stay[0.65]["P95"]),
                            "unrounded_45P50_65P95": [stay[0.45]["P50"], stay[0.65]["P95"]]}
                    pr["averages"].setdefault(k, {})[key] = {
                        "one_red_contribution_ugm3": lch(one, flo, fhi), "stay_through_ugm3": st_l, "references": [ref]}
                for key, v in pr["averages"].get(k, {}).items():
                    for ref in v["references"]:
                        r_ = ref["ugm3"]
                        for part in ("one_red_contribution_ugm3", "stay_through_ugm3"):
                            x = v[part]
                            v.setdefault("aboveReference", {}).setdefault(part, {})[f"{ref['body']} {r_} ug/m3"] = (
                                "yes" if x["central"] and x["central"] > r_ else "in-worst-case-only" if x["high"] and x["high"] > r_ else "no")
            # benzene stay-through 1 h in ppb (check against corrections/stay_<case>.json)
            cres["probes"][lab] = pr
            # mass sanity (per draw; identical across probes)
            if mass[cid] is None:
                thc_keys = [c["key"] for c in chems if c["basis"] == "THC" and c["key"] not in ("benzene", "benzene_researcher")]
                bzfrac = (G("BZ", 1e-9).sum(0)) / np.maximum(G("THC", 1e-6).sum(0), 1e-30)
                tot = bzfrac + sum(sh[k] for k in thc_keys)
                arom = bzfrac + sh["toluene"] + sh["ethylbenzene"] + sh["xylenes"] + sh["styrene"] + sh["naphthalene"]
                mass[cid] = {"sum_of_THC_shares_max": float(tot.max()), "sum_of_THC_shares_P50": float(np.median(tot)),
                             "share_of_draws_sum_above_100pct": float((tot > 1).mean()),
                             "single_aromatics_sum_P50": float(np.median(arom)), "single_aromatics_sum_max": float(arom.max()),
                             "share_of_draws_aromatics_above_50pct": float((arom > 0.5).mean()),
                             "pack_benzene_share_of_THC_P5_P50_P95": [float(x) for x in np.percentile(bzfrac, [5, 50, 95])]}
        res["cases"][cid] = cres
        print(f"done {cid}", file=sys.stderr)
    # benzene stay-through 1 h vs signed corrections (ppb)
    st_chk = []
    for cid in CASES:
        p = os.path.join(SIM, "corrections", f"stay_{cid}.json")
        if not os.path.exists(p):
            continue
        sig_ = json.load(open(p))["probes"]
        for lab, v in sig_.items():
            if lab in res["cases"][cid]["probes"] and "benzene" in res["cases"][cid]["probes"][lab]["averages"]:
                mine = res["cases"][cid]["probes"][lab]["averages"]["benzene"]["60min"]["stay_through_ugm3"]
                s45 = v["stay_through"]["duty0.45_1h"]["BZ_ppb_fresh_pack_each_red"]; s65 = v["stay_through"]["duty0.65_1h"]["BZ_ppb_fresh_pack_each_red"]
                m2 = [x / (78.11 / MV) for x in mine["unrounded_45P50_65P95"]]
                st_chk.append({"case": cid, "probe": lab, "this_code_ppb_45P50_65P95": m2,
                               "signed_ppb_45P50_65P95": [s45["P50"], s65["P95"]],
                               "max_rel_diff": max(abs(m2[0] / s45["P50"] - 1), abs(m2[1] / s65["P95"] - 1))})
    res["threshold_level"] = threshold_level(spec, run_dir)
    res["ownOdourByCase"] = own_by_case(res)
    res["checks"] = {
        "benzene_vs_signed_stats": {"max_rel_diff": max(c["max_rel_diff"] for c in checks_bz), "rows": checks_bz},
        "benzene_stay_through_1h_vs_signed_corrections": st_chk,
        "benzene_floor_in_smellable_seconds": {"min_share_of_draws_at_or_above_floor": min(c["share_of_draws_mean_at_or_above_floor"] for c in checks_floor if c["share_of_draws_mean_at_or_above_floor"] is not None), "rows": checks_floor},
        "smellable_share_vs_signed": {"max_abs_diff": max(max(abs(a_ - b_) for a_, b_ in zip(c["this_code"], c["signed"])) for c in checks_ou), "rows": checks_ou},
        "mass_sanity": mass}
    res["speciation"] = {c["key"]: {"name": c["name"], "basis": c["basis"], "low_pct": c["low"], "central_pct": c["central"], "high_pct": c["high"],
                                    "confidence": c["confidence"], "flags": c["flags"], "sourceIds": c["sourceIds"]} for c in chems}
    res["notEstimated"] = spec["notEstimated"]
    res["hazardLabels_IARC"] = spec["hazardLabels_IARC"]
    res["confidence_rule"] = "confidence of a chemical number = the lower of the case's confidence and the share's confidence"
    for cid, cr in res["cases"].items():
        cr["chemicalConfidence"] = {c["key"]: lower_conf(cr.get("caseConfidence", "low"), c["confidence"]) for c in chems}
    json.dump(res, open(os.path.join(HERE, "results-smell.json"), "w"), indent=1, ensure_ascii=False)
    write_txt(res)
    print("wrote results-smell.json, results-smell.txt", file=sys.stderr)


def own_by_case(res):
    """(e) per case: range over that case's probes of the share of draws whose smellable-seconds mean is at or above each threshold (no pooling across cases)"""
    out = {}
    for cid, cr in res["cases"].items():
        for lab, pr in cr["probes"].items():
            for DT, own in pr["own_odour_threshold"].items():
                for k, thrs in own.items():
                    for t, v in thrs.items():
                        x = v["share_of_draws_mean_over_smellable_seconds_at_or_above"]
                        if x is None:
                            continue
                        r = out.setdefault(k, {}).setdefault(t, {}).setdefault(cid, {}).setdefault(DT, [1.0, 0.0])
                        r[0] = min(r[0], x); r[1] = max(r[1], x)
    return out


def f3(d):
    if d is None or d.get("central") is None:
        return "-"
    g_ = lambda x: "n.s." if x is None else f"{x:g}"   # n.s. = no draw smellable at that flow bound
    return f"{g_(d['low'])} / {g_(d['central'])} / {g_(d['high'])}"


def write_txt(res):
    L = [res["title"], f"{res['status']}; plan {res['plan']}; low / central / high (central = P50 over draws; see conventions)", ""]
    L += ["Cautions: " + "; ".join(res["simulationCautions"]) + ".",
          "IARC groups are hazard labels, not a risk from one red light. Chemicals are listed in a fixed order, not ranked by harm.",
          "Seconds-long levels have NO reference value of matching averaging time; only section (d) is compared with references.", ""]
    names = {k: v["name"] for k, v in res["speciation"].items()}
    tl = res["threshold_level"]
    L += ["(c) LEVEL WHEN THE SMELL IS JUST DETECTABLE (single idling scooter, exactly 1 odour unit; independent of the flow)",
          f"    {tl['n_single_scooter_draws']} single-scooter draws; HC-rich share {tl['share_HC_rich']:.3f}. ppb, low / central / high = P5 / P50 / P95"]
    L.append(f"    {'chemical':38s} {'D/T 800 (ppb)':>28s} {'D/T 6,800 (ppb)':>28s} {'ug/m3 D/T 800':>26s}")
    for k, v in tl["chemicals"].items():
        L.append(f"    {names[k]:38s} {f3(v['DT800']['ppb']):>28s} {f3(v['DT6800']['ppb']):>28s} {f3(v['DT800']['ugm3']):>26s}")
    L.append(f"    raw-exhaust benzene of a single scooter, P5 / P50 / P95: {' / '.join(f'{x:,.0f}' for x in tl['raw_exhaust_benzene_ppb_P5_P50_P95'])} ppb; {tl['note']}")
    L.append("")
    L.append("(e) OWN ODOUR THRESHOLD BY CASE: range over the case's probes of the share of draws whose smellable-seconds mean is at or above the threshold (DT800 | DT6800); no pooling across cases")
    for k, thrs in res["ownOdourByCase"].items():
        for t, cs in thrs.items():
            L.append(f"    {names[k]:24s} {t:>20s}: " + "; ".join(f"{cid} {v.get('DT800', ['-','-'])[0]}-{v.get('DT800', ['-','-'])[1]} | {v.get('DT6800', ['-','-'])[0]}-{v.get('DT6800', ['-','-'])[1]}" for cid, v in cs.items()))
    L.append("")
    for cid, cr in res["cases"].items():
        L += ["=" * 110, f"CASE {cid}: {cr.get('condition', '')}", f"  how often: {cr.get('conditionProbability', '')}",
              f"  case confidence: {cr.get('caseConfidence', '')}; admissibility: {cr.get('admissibility')}; red window {cr['red_window_s']:g} s; flow factor {cr['flow_factor']}", ""]
        for lab, pr in cr["probes"].items():
            for DT in ("DT800", "DT6800"):
                s = pr["smellable_share"][DT]
                L.append(f"  {lab}  [{DT}]  (a) share of seconds smellable {f3(s)} (hc x1: {s['hc1_P50']}); draws with any smellable second {s['draws_with_any_smellable_second']}")
                L.append(f"     {'chemical':38s} {'(b) mean in smellable s, ppb':>30s} {'(b) highest smellable s, ppb':>30s} {'mean ug/m3':>24s}  (e) own odour thr.: share of draws mean>=thr")
                for k, v in pr["levels_in_smellable_seconds"][DT].items():
                    own = pr["own_odour_threshold"][DT].get(k)
                    os_ = "; ".join(f"{t.split('_')[1]}: {x['share_of_draws_mean_over_smellable_seconds_at_or_above']}" for t, x in own.items()) if own else "no threshold"
                    L.append(f"     {names[k]:38s} {f3(v['mean_over_smellable_seconds']['ppb']):>30s} {f3(v['highest_smellable_second']['ppb']):>30s} {f3(v['mean_over_smellable_seconds']['ugm3']):>24s}  {os_}")
            if pr["averages"]:
                L.append(f"  {lab}  (d) converted averages, ug/m3: one red's contribution | stay through every red (red 45-65 % of cycle) | reference")
                for k, av in pr["averages"].items():
                    for key, v in av.items():
                        refs = "; ".join(f"{r['body']} {r['ugm3']:g}" for r in v["references"])
                        ab = v["aboveReference"]["stay_through_ugm3"]
                        L.append(f"     {names[k]:24s} {key:>6s}: one red {f3(v['one_red_contribution_ugm3']):>24s} | stay {f3(v['stay_through_ugm3']):>24s} | {refs} | stay above? {', '.join(ab.values())}")
            L.append("")
    c = res["checks"]
    L += ["CHECKS", f"  benzene vs signed stats.json (red mean, highest second; P5/P50/P95): max relative difference {c['benzene_vs_signed_stats']['max_rel_diff']:.1e}",
          f"  share of smellable seconds vs signed: max absolute difference {c['smellable_share_vs_signed']['max_abs_diff']:.1e}",
          f"  benzene mean over smellable seconds at or above the draw's own just-smellable floor: in at least {c['benzene_floor_in_smellable_seconds']['min_share_of_draws_at_or_above_floor']:.4f} of draws at every probe",
          f"  benzene stay-through 1 h vs signed corrections: max relative difference {max(x['max_rel_diff'] for x in c['benzene_stay_through_1h_vs_signed_corrections']):.3f}",
          "  mass sanity (sum of THC-based shares per draw): " + "; ".join(f"{k} max {v['sum_of_THC_shares_max']:.2f}, aromatics>50 % in {v['share_of_draws_aromatics_above_50pct']:.3f} of draws" for k, v in c["mass_sanity"].items()), ""]
    L += ["NOT ESTIMATED"] + [f"  {x['name']}: {x['why']}" for x in res["notEstimated"]]
    open(os.path.join(HERE, "results-smell.txt"), "w").write("\n".join(L) + "\n")


if __name__ == "__main__":
    main()
