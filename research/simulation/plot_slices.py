#!/usr/bin/env python3
"""Pictures of one finished case, for a person to look at:
  plume_slices.png : time-mean (over the red) and last-instant total exhaust, shown as CO-equivalent ppm for a
                     fleet-mean scooter (16 g CO/h per scooter, PLAN 1.1; i.e. tracer x 8,300 ppm), on
                     (a) a horizontal slice 0.7 m above the pavement (z = kerb + 0.7 m; over the road this is 0.9 m)
                     (b) a vertical slice along the kerb line, 0.2 m inside the kerb (y = -0.2 m; the K 0.5 m line)
                     (c) a vertical cross-section through the headline tailpipe (x = its exit)
  series_K.png     : 1-s CO series (median-pack-emission draw) at K 0.5/1/2/4 m, heights 0.7/1.1/1.5 m
Usage: python3 plot_slices.py CASE OUTDIR
"""
import glob, json, os, subprocess, sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm
import matplotlib.tri as mtri

case, outdir = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
meta = json.load(open(os.path.join(case, "case_meta.json")))
sc = meta["scene"]
tr = meta["tracers"]
head = next(p for p in meta["pipes"] if p["tracer"] == "s_head")
e = head["exit"]
kh = 0.2
# fleet-mean scooter: 16 g CO/h -> ppm per unit tracer = E/mdot * M_air/M_CO * 1e6
K_CO = 16.0 / 3600 * 1e-3 / head["mdot"] * 28.96 / 28.01 * 1e6
fields = [f"{t}Mean" for t in tr] + tr
dct = f"""FoamFile {{ version 2.0; format ascii; class dictionary; object slicesDict; }}
functions
{{
    slices
    {{
        type surfaces; libs (sampling); surfaceFormat raw; fields ({' '.join(fields)}); interpolationScheme cell;
        surfaces
        {{
            zBreath {{ type cuttingPlane; point (0 0 {kh + 0.7}); normal (0 0 1); interpolate false; }}
            yKerb   {{ type cuttingPlane; point (0 -0.2 0); normal (0 1 0); interpolate false; }}
            xHead   {{ type cuttingPlane; point ({e[0] - 0.01} 0 0); normal (1 0 0); interpolate false; }}
        }}
    }}
}}
"""
open(os.path.join(case, "system", "slicesDict"), "w").write(dct)
times = [d for d in os.listdir(case) if d.replace(".", "").isdigit() and float(d) > 0]
if not times:
    sys.exit("no reconstructed time directory")
subprocess.run(f"source /usr/lib/openfoam/openfoam2506/etc/bashrc; cd {case} && postProcess -dict system/slicesDict -latestTime -fields '({' '.join(fields)})' > log.slices 2>&1",
               shell=True, executable="/bin/bash", check=True)
tdir = sorted(glob.glob(os.path.join(case, "postProcessing", "slices", "*")), key=lambda p: float(os.path.basename(p)))[-1]


def load(surf, kind):
    tot = None
    for t in tr:
        f = os.path.join(tdir, f"{t}{'Mean' if kind == 'mean' else ''}_{surf}.raw")
        if not os.path.exists(f):
            return None
        d = np.loadtxt(f, comments="#")
        tot = d[:, 3].copy() if tot is None else tot + d[:, 3]
    return d[:, :3], tot


views = [("zBreath", 0, 1, "plan, 0.7 m above pavement", ((e[0] - 12, e[0] + 8), (-4.5, 9))),
         ("yKerb", 0, 2, "kerb line y = -0.2 m (side view)", ((e[0] - 12, e[0] + 8), (0, 4))),
         ("xHead", 1, 2, f"cross-section at headline tailpipe x = {e[0]:.2f} m", ((-4.5, 6), (0, 4)))]
fig, axs = plt.subplots(2, 3, figsize=(17, 8.5), constrained_layout=True)
norm = LogNorm(vmin=0.1, vmax=1000)
im = None
for row, kind in enumerate(("mean", "inst")):
    for col, (surf, ix, iy, title, lim) in enumerate(views):
        ax = axs[row, col]
        L = load(surf, kind)
        if L is None:
            ax.set_visible(False); continue
        xyz, s = L
        m = (xyz[:, ix] >= lim[0][0]) & (xyz[:, ix] <= lim[0][1]) & (xyz[:, iy] >= lim[1][0]) & (xyz[:, iy] <= lim[1][1])
        c = np.log10(np.clip(s[m] * K_CO, 1e-3, None))
        tri = mtri.Triangulation(xyz[m, ix], xyz[m, iy])
        # drop long triangles that bridge solid blocks (scooters, people, buildings)
        P = np.column_stack([xyz[m, ix], xyz[m, iy]])[tri.triangles]
        edge = np.max(np.linalg.norm(P - np.roll(P, 1, axis=1), axis=2), axis=1)
        tri.set_mask(edge > 0.6)
        im = ax.tripcolor(tri, c, vmin=-1, vmax=3, cmap="magma_r", shading="gouraud")
        for p in meta["pipes"]:
            ax.plot(p["exit"][ix], p["exit"][iy], "c+", ms=6, mew=1)
        if surf == "zBreath":
            ax.axhline(0, color="0.4", lw=0.6)
        ax.set_xlim(*lim[0]); ax.set_ylim(*lim[1]); ax.set_aspect("equal")
        ax.set_title(f"{'time-mean over the red' if kind == 'mean' else 'instant at end of red'}: {title}", fontsize=9)
        ax.set_xlabel("xyz"[ix] + " (m)"); ax.set_ylabel("xyz"[iy] + " (m)")
cb = fig.colorbar(im, ax=axs, shrink=0.7, label="CO-equivalent ppm, every scooter a fleet-mean emitter (16 g CO/h)")
cb.set_ticks([-1, 0, 1, 2, 3]); cb.set_ticklabels(["0.1", "1", "10", "100", "1000"])
fig.suptitle(f"{sc['name']}  (t = {os.path.basename(tdir)} s; + = tailpipes; pavement y < 0)", fontsize=10)
fig.savefig(os.path.join(outdir, "plume_slices.png"), dpi=100)

# series
f = os.path.join(outdir, "series_1s.csv")
if os.path.exists(f):
    hdr = open(f).readline().strip().split(",")
    d = np.loadtxt(f, delimiter=",", skiprows=1)
    fig, axs = plt.subplots(1, 3, figsize=(16, 4.2), sharey=True, constrained_layout=True)
    for ax, h in zip(axs, ("0.7", "1.1", "1.5")):
        for dist in ("0.5", "1.0", "2.0", "4.0"):
            name = f"CO_ppm[K d={dist} dx=0.0 h={h}]"
            if name in hdr:
                ax.semilogy(d[:, 0], np.clip(d[:, hdr.index(name)], 1e-3, None), label=f"{dist} m from nearest tailpipe")
        ax.set_title(f"K probes, {h} m above the pavement", fontsize=9); ax.set_xlabel("s from red onset (1-s means)")
        ax.grid(alpha=0.3)
    axs[0].set_ylabel("CO increment, ppm (median-pack-emission draw)"); axs[0].legend(fontsize=8)
    fig.savefig(os.path.join(outdir, "series_K.png"), dpi=100)
print("pictures in", outdir)
