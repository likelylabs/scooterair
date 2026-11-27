#!/usr/bin/env python3
"""Three plain figures from results-matrix.json and results/<id>/series_1s.csv.
Usage: python3 make_figures.py BASE_ID WORST_ID [ID ...for the bar chart]
 fig1_co_time.png      CO increment vs time over the red at K 0.5 m and 1 m (dx 0), heights 0.7/1.1/1.5 m,
                       for the median-pack-emission draw, BASE and WORST cases
 fig2_co_distance.png  90-s mean (P50, P5-P95 band) and highest 1 s (P50) vs distance, by height, BASE and WORST
 fig3_references.png   left: converted 15-min / 1-h values (one red; standing through every red, corrections/stay_<id>.json)
                       against WHO 15-min and WHO/Taiwan 1-h; right: highest 1-s values against the NIOSH ceiling only
"""
import csv, json, os, sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, "results-matrix.json")))["cases"]
FIG = os.path.join(HERE, "figures"); os.makedirs(FIG, exist_ok=True)
base, worst = sys.argv[1], sys.argv[2]
bars = sys.argv[3:] or [base, worst]
HC = {"0.7": "#1f6fb4", "1.1": "#e08a1e", "1.5": "#3a9a4a"}
plt.rcParams.update({"font.size": 11})
DESC = {"S1": "12 scooters, 20 m canyon; kerb air 0.6-1.3 m/s along the street (end-fed inlet: kerb values probably low x2-5)",
        "S1-from": "12 scooters, open street, wind ~0.95 m/s held from the pack to the kerb for the whole red",
        "S2": "30 scooters, canyon; kerb air 0.6-0.8 m/s along the street (not calm at the kerb; probably low x2-5)",
        "S5-12": "12 scooters, arcade, 15 m domain top: blockage-affected, not admissible",
        "S5-12b": "12 scooters, arcade, 0.5 m/s toward the building, 61 m domain top",
        "A": "Kaohsiung anchor, 34 scooters, 2 m/s from the pack, 30-s red"}
import textwrap
T = lambda cid: textwrap.fill(f"{cid}: {DESC.get(cid, '')}", 70)


def series(cid):
    p = os.path.join(HERE, "results", cid, "series_1s.csv")
    rows = list(csv.reader(open(p)))
    h = rows[0]; a = np.array(rows[1:], float)
    return {k: a[:, i] for i, k in enumerate(h)}


# ---- fig 1
fig, ax = plt.subplots(2, 2, figsize=(12, 7.5), sharex=True)
for c, cid in enumerate((base, worst)):
    s = series(cid)
    for r, d in enumerate(("0.5", "1.0")):
        a = ax[r, c]
        for h in ("0.7", "1.1", "1.5"):
            k = f"CO_ppm[K d={d} dx=0.0 h={h}]"
            if k in s:
                a.plot(s["t_s_from_red_onset"], s[k], color=HC[h], lw=1.4, label=f"{h} m above pavement")
        a.set_title(f"{T(cid)}\n{d} m from nearest tailpipe", fontsize=10)
        a.set_ylabel("CO above background, ppm (1-s means)")
        a.grid(alpha=0.3)
        if r == 1:
            a.set_xlabel("seconds since the light turned red")
        a.legend(fontsize=9, loc="upper left")
fig.suptitle("Simulated CO at the kerb during one red, second by second (median-emission pack). No guideline is drawn: they are 15-min and 1-h averages", fontsize=11)
fig.tight_layout(); fig.savefig(os.path.join(FIG, "fig1_co_time.png"), dpi=130); plt.close(fig)

# ---- fig 2
fig, ax = plt.subplots(1, 2, figsize=(12, 5), sharey=True)
for c, cid in enumerate((base, worst)):
    K = R[cid]["K"]; a = ax[c]
    for h in ("0.7", "1.1", "1.5"):
        ds, p5, p50, p95, m1 = [], [], [], [], []
        for d in ("0.5", "1.0", "2.0", "4.0"):
            k = f"d={d} h={h} dx=0.0"
            if k in K:
                ds.append(float(d)); p5.append(K[k]["CO_mean"]["P5"]); p50.append(K[k]["CO_mean"]["P50"]); p95.append(K[k]["CO_mean"]["P95"])
                m1.append(K[k]["CO_max1s"]["P50"])
        fl = lambda v: np.maximum(np.array(v), 1e-3)
        a.fill_between(ds, fl(p5), fl(p95), color=HC[h], alpha=0.15)
        a.plot(ds, fl(p50), "o-", color=HC[h], label=f"90-s mean, {h} m (P50; band P5-P95)")
        a.plot(ds, fl(m1), "s--", color=HC[h], alpha=0.8, label=f"highest 1 s, {h} m (P50)")
    a.set_yscale("log"); a.set_xlabel("horizontal distance from nearest tailpipe toward the pavement, m")
    a.set_title(T(cid), fontsize=10); a.grid(alpha=0.3, which="both")
ax[0].set_ylabel("CO above background, ppm")
ax[1].legend(fontsize=8, loc="lower left")
fig.suptitle("CO by distance and breathing height (grid-limited near the tailpipe). No guideline is drawn: these are red-window means and 1-s peaks", fontsize=11)
fig.tight_layout(); fig.savefig(os.path.join(FIG, "fig2_co_distance.png"), dpi=130); plt.close(fig)

# ---- fig 3: only averaging-time-matched comparisons (verification correction, PLAN 9.24)
#  left: converted values (one red's contribution, and stay-through with a fresh pack each red) against WHO 15-min and 1-h
#  right: highest 1-s values against the only instantaneous CO value, the NIOSH ceiling (occupational)
ST = {}
for cid in bars:
    p = os.path.join(HERE, "corrections", f"stay_{cid}.json")
    if os.path.exists(p):
        ST[cid] = json.load(open(p))
fig, (a, b) = plt.subplots(1, 2, figsize=(15, 0.5 * max(6, 3 * len(ST)) + 3), gridspec_kw={"width_ratios": [1.25, 1]})
labels, rows = [], []
for cid, d in ST.items():
    lab = "K d=0.5 dx=0.0 h=0.7"
    r = d["probes"].get(lab)
    if not r:
        continue
    st = r["stay_through"]
    labels += [f"{cid}: one red ({d['red_window_s']:.0f} s) -> 15-min avg", f"{cid}: standing through every red, 15-min avg",
               f"{cid}: one red -> 1-h avg", f"{cid}: standing through every red, 1-h avg"]
    rows += [(r["CO_one_red_to_15min_ppm"]["P50"], r["CO_one_red_to_15min_ppm"]["P95"], "#1f6fb4"),
             (st["duty0.45_15min"]["CO_ppm_fresh_pack_each_red"]["P50"], st["duty0.65_15min"]["CO_ppm_fresh_pack_each_red"]["P95"], "#1f6fb4"),
             (r["CO_one_red_to_1h_ppm"]["P50"], r["CO_one_red_to_1h_ppm"]["P95"], "#e08a1e"),
             (st["duty0.45_1h"]["CO_ppm_fresh_pack_each_red"]["P50"], st["duty0.65_1h"]["CO_ppm_fresh_pack_each_red"]["P95"], "#e08a1e")]
y = np.arange(len(labels))[::-1]
a.barh(y, [r_[1] for r_ in rows], color=[r_[2] for r_ in rows], alpha=0.35, label="upper end (P95; red 65 % of the cycle)")
a.barh(y, [r_[0] for r_ in rows], color=[r_[2] for r_ in rows], alpha=0.95, label="central (P50; red 45 % of the cycle)")
for yy, r_ in zip(y, rows):
    a.text(r_[1] * 1.12, yy, f"{r_[0]:.2g} / {r_[1]:.2g}", va="center", fontsize=8)
a.axvline(87, color="#1f6fb4", lw=1, ls="--"); a.text(87 * 1.05, len(labels) - 0.2, "WHO 15-min\n87 ppm", fontsize=8, color="#1f6fb4", va="bottom")
a.axvline(31, color="#e08a1e", lw=1, ls="--"); a.text(31 * 0.95, len(labels) - 0.2, "WHO / Taiwan\n1-h 31 ppm", fontsize=8, color="#e08a1e", va="bottom", ha="right")
a.set_xscale("log"); a.set_xlim(0.01, 1000); a.set_ylim(-0.8, len(labels) + 1.4)
a.set_yticks(y); a.set_yticklabels(labels, fontsize=8)
a.set_xlabel("CO above background, ppm, converted to the guideline's averaging time (kerb 0.5 m, 0.7 m height)")
a.set_title("Like with like: 15-min and 1-h averages", fontsize=10); a.grid(axis="x", alpha=0.3, which="both"); a.legend(fontsize=8, loc="upper left")
labels, rows = [], []
for cid in bars:
    K = R[cid]["K"]
    for h, hn in (("0.7", "0.7 m"), ("1.5", "1.5 m")):
        k = f"d=0.5 h={h} dx=0.0"
        if k in K:
            labels.append(f"{cid}: kerb 0.5 m, {hn}, highest 1 s"); rows.append((K[k]["CO_max1s"]["P50"], K[k]["CO_max1s"]["P95"]))
y = np.arange(len(labels))[::-1]
b.barh(y, [r_[1] for r_ in rows], color="#c0392b", alpha=0.35); b.barh(y, [r_[0] for r_ in rows], color="#c0392b", alpha=0.95)
for yy, r_ in zip(y, rows):
    b.text(r_[1] * 1.12, yy, f"{r_[0]:.2g} / {r_[1]:.2g}", va="center", fontsize=8)
b.axvline(200, color="k", lw=1, ls="--"); b.text(200 * 1.05, len(labels) - 0.2, "NIOSH ceiling 200 ppm\n(instantaneous, workplace)", fontsize=8, va="bottom")
b.set_xscale("log"); b.set_xlim(0.5, 5000); b.set_ylim(-0.8, len(labels) + 1.4)
b.set_yticks(y); b.set_yticklabels(labels, fontsize=8)
b.set_xlabel("highest 1-s CO, ppm (P50 / P95); grid-limited")
b.set_title("Seconds-long hits: only an instantaneous value applies", fontsize=10); b.grid(axis="x", alpha=0.3, which="both")
fig.suptitle("Simulated kerb CO against reference values of matching averaging time (ESTIMATE; one simulated red per case)", fontsize=11)
fig.tight_layout(); fig.savefig(os.path.join(FIG, "fig3_references.png"), dpi=130); plt.close(fig)
print("wrote", FIG)
