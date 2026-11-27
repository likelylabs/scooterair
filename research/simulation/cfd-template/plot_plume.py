#!/usr/bin/env python3
"""Sample mean tracer on planes through the first tailpipe and draw them.

Usage: python3 plot_plume.py CASE OUT.png [--field s0Mean] [--xco 0.01449]
Runs OpenFOAM 'postProcess' with a cuttingPlane surfaces function on the
latest time, then plots CO-equivalent ppm (s * x_CO,raw * 1e6) on a log scale.
"""
import glob, json, os, subprocess, sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm

case, out = sys.argv[1], sys.argv[2]
args = sys.argv[3:]
field = args[args.index("--field") + 1] if "--field" in args else "s0Mean"
xco = float(args[args.index("--xco") + 1]) if "--xco" in args else 0.0081
meta = json.load(open(os.path.join(case, "case_meta.json")))
e = meta["pipes"][0]["exit"]
dct = f"""FoamFile {{ version 2.0; format ascii; class dictionary; object planesDict; }}
functions
{{
    planes
    {{
        type surfaces; libs (sampling); surfaceFormat raw; fields ({field}); interpolationScheme cell;
        surfaces
        {{
            zPipe {{ type cuttingPlane; point ({e[0]} {e[1]} {e[2]}); normal (0 0 1); interpolate false; }}
            xPipe {{ type cuttingPlane; point ({e[0]-0.3} {e[1]} {e[2]}); normal (1 0 0); interpolate false; }}
            z15  {{ type cuttingPlane; point ({e[0]} {e[1]} 1.5); normal (0 0 1); interpolate false; }}
        }}
    }}
}}
"""
open(os.path.join(case, "system", "planesDict"), "w").write(dct)
subprocess.run(f"source /usr/lib/openfoam/openfoam2506/etc/bashrc; cd {case} && postProcess -dict system/planesDict -latestTime -fields '({field})' > log.planes 2>&1",
               shell=True, executable="/bin/bash", check=True)
tdir = sorted(glob.glob(os.path.join(case, "postProcessing", "planes", "*")), key=lambda p: float(os.path.basename(p)))[-1]
fig, axs = plt.subplots(1, 3, figsize=(16, 5))
norm = LogNorm(vmin=0.01, vmax=1000)
for ax, (name, ix, iy, title) in zip(axs, [("zPipe", 0, 1, f"z = {e[2]:.3f} m (tailpipe height), plan view"),
                                           ("xPipe", 1, 2, f"x = {e[0]-0.3:.2f} m (0.3 m behind tailpipe), cross-section"),
                                           ("z15", 0, 1, "z = 1.5 m (adult breathing height), plan view")]):
    f = glob.glob(os.path.join(tdir, f"{field}_{name}.raw")) or glob.glob(os.path.join(tdir, f"{name}.raw"))
    if not f:
        continue
    d = np.loadtxt(f[0], comments="#")
    c = np.clip(d[:, 3] * xco * 1e6, 1e-3, None)
    sc = ax.scatter(d[:, ix], d[:, iy], c=c, s=4, marker="s", norm=norm, cmap="magma_r", linewidths=0)
    ax.plot(e[ix], e[iy], "c+", ms=12)
    ax.set_title(title, fontsize=9); ax.set_aspect("equal"); ax.set_xlabel("xyz"[ix] + " (m)"); ax.set_ylabel("xyz"[iy] + " (m)")
fig.colorbar(sc, ax=axs, label=f"time-mean CO-equivalent ppm ({field} x {xco*100:.3g} % raw CO)", shrink=0.8)
fig.suptitle(f"{meta['scene'].get('name', case)}  -  time {os.path.basename(tdir)} s", fontsize=10)
fig.savefig(out, dpi=110)
print(out)
