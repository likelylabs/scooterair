#!/usr/bin/env python3
"""Write a scene JSON for scooters idling at a red light beside a kerb, in the
frame of research/simulation/PLAN.md section 2:

  x along the street in the direction of travel, stop line at x = 0, stop box -4 < x < 0;
  y across the street, kerb face at y = 0, pavement y < 0 (top at z = 0.2 m; PLAN says 0.15, see kh), road y > 0;
  z up from the road.  Breathing heights are above the local standing surface.

Scooter: 1.8 x 0.7 m body block to 1.1 m, seated rider block to 1.6 m, engine
block underneath (heat source), muffler on the right (-y, kerb) side, tailpipe
0.4 m high pointing rearward 10 deg up, 250 C, 0.47 L/s at 25 C (5.5e-4 kg/s).
Kerb-lane tailpipe column at y = 0.3 m; lateral pitch 1.05 m; row spacing 2.0 m
in the box and 2.2 m in the queue.

Usage: python3 make_pack.py OUT.json [options]
  --box R C        box rows x columns (default 2 4)
  --queue Q N      kerb-lane queue: Q columns of N scooters behind the box (default 1 4)
  --wind U         wind speed at 1.5 m (0 = still air: all sides open, plumes drive the flow)
  --dirDeg D       direction the air moves toward, degrees from +x toward +y.
                   -45 = oblique from the pack toward the kerb (S1); -90 = straight toward the pavement;
                   180 = along the queue toward a person behind it (S3)
  --sigma SH SW    inflow turbulence (horizontal, vertical std dev, m/s); default 0.3 0.15 (PLAN floors)
  --canyon W H     buildings both sides: building faces W m apart (pavement-side face at y=-pw), height H
  --arcade         arcade (騎樓) on the pavement side: 0.5 m kerb strip, 3.5 m deep, 3.8 m clear, columns
  --grade fast|fine  fast: 5 cm at the tailpipes, 10 cm breathing zone / kerb half of the pack, 20 cm pack;
                     fine: 2.5 cm at the tailpipes, 5 cm within 2 m of sources and probes (PLAN spec, very costly)
  --engineW W      heat to air from each engine block (default 1000 W)
  --duration S, --spinup S   (defaults 90, 60)
"""
import argparse, json, math


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--box", type=int, nargs=2, default=[2, 4])
    ap.add_argument("--queue", type=int, nargs=2, default=[1, 4])
    ap.add_argument("--wind", type=float, default=0.8)
    ap.add_argument("--dirDeg", type=float, default=-45.0)
    ap.add_argument("--sigma", type=float, nargs=2, default=None,
                    help="inflow sigma_h sigma_w (m/s); default: middle of the estimate's ranges, sigma_v/U 0.45 and "
                         "sigma_w/U 0.27, floors 0.2 / 0.1 m/s, times --sigmaBoost for decay between inlet and pack")
    ap.add_argument("--sigmaBoost", type=float, default=1.0)
    ap.add_argument("--Lturb", type=float, default=2.0, help="DFSEM eddy length scale, m (only with --turb dfsem)")
    ap.add_argument("--turb", default="rfm", choices=["rfm", "ou", "dfsem"],
                    help="ou: spatially uniform time-varying inflow (Ornstein-Uhlenbeck gust/wander series); dfsem: OpenFOAM DFSEM "
                         "(produced no fluctuation in v2506 here, kept for reference)")
    ap.add_argument("--rfm", type=float, nargs=3, default=[0.45, 0.10, 0.30],
                    help="rfm inflow (PLAN 9.17): sigma_h (large-scale horizontal wander/gusts), sigma_wL (large-scale vertical), "
                         "sigma_s (small-scale isotropic eddies, per component), each as a fraction of the target wind; "
                         "times --sigmaBoost; floors 0.2 / 0.0 / 0.1 m/s")
    ap.add_argument("--Lrfm", type=float, default=2.0, help="von Karman length scale of the rfm small-scale modes, m (ASSUMPTION)")
    ap.add_argument("--Th", type=float, default=5.0, help="integral time scale of horizontal inflow fluctuation, s (ASSUMPTION: ~4 m eddies at 0.8 m/s)")
    ap.add_argument("--Tw", type=float, default=1.5, help="integral time scale of vertical inflow fluctuation, s (ASSUMPTION)")
    ap.add_argument("--inflowFactor", type=float, default=1.0,
                    help="inflow speed / target speed; set so that the mean speed at the IN 1.5 m probe meets the target (A6), "
                         "e.g. a street canyon slows the near-ground wind")
    ap.add_argument("--canyon", type=float, nargs=2, default=None)
    ap.add_argument("--arcade", action="store_true")
    ap.add_argument("--iot", action="store_true",
                    help="Kaohsiung anchor (case A): I probes 2-8 m ahead of the stop line (every 2 m) and 2.5-5 m to the pavement side of "
                         "the kerb-lane tailpipe column (every 1.25 m), at 1.2 / 1.5 m, the frame of model.mjs simulateIOT 'both'; "
                         "0.4 m cells extended to x = 10 m")
    ap.add_argument("--grade", default="fast", choices=["coarse", "fast", "fine"])
    ap.add_argument("--engineW", type=float, default=1000.0)
    ap.add_argument("--duration", type=float, default=90.0)
    ap.add_argument("--spinup", type=float, default=60.0)
    ap.add_argument("--pw", type=float, default=4.0)
    ap.add_argument("--writeEvery", type=float, default=10.0, help="field write interval, s (snapshots for pictures and restarts)")
    ap.add_argument("--Tamb", type=float, default=303.15)
    ap.add_argument("--Texh", type=float, default=523.15, help="tailpipe exit temperature, K (inputs: 150-350 C, central 250 C, ASSUMPTION)")
    ap.add_argument("--pipeAngle", type=float, default=10.0, help="exit angle above horizontal, deg (ASSUMPTION; NF1 tests 0 and 20)")
    ap.add_argument("--ztop", type=float, default=None,
                    help="domain top, m (graded cells above 15.2 m; verification correction PLAN 9.24: top >= 5H for building cases)")
    ap.add_argument("--mdot", type=float, default=5.5e-4, help="exhaust mass flow per scooter, kg/s (0.47 L/s at 25 C)")
    a = ap.parse_args()
    if a.sigma is None:
        a.sigma = [a.sigmaBoost * max(0.2, 0.45 * a.wind), a.sigmaBoost * max(0.1, 0.27 * a.wind)]
    fine = a.grade == "fine"
    coarse = a.grade == "coarse"
    # grid: dx0 0.8 m; level 1 0.4, 2 0.2, 3 0.1, 4 0.05, 5 0.025
    dx0 = 0.8
    L_body, L_muff = 3, (5 if fine else (3 if coarse else 4))
    L_kerb = 4 if fine else 3
    pipe = 0.025 if fine else (0.1 if coarse else 0.05)
    kh = 0.2   # kerb height: PLAN assumes 0.15 m, but the kerb is a 39 m x 12 m box meshed at level 2 (20 cm),
               # so its top must lie on the 20 cm grid; refining the whole kerb surface to 5 cm would add ~10^5 cells
    pw = a.pw

    # ---- scooters
    px_box, px_q, py = 2.0, 2.2, 1.05
    tp_y0 = 0.3                          # kerb-lane tailpipe column
    cy0 = tp_y0 + 0.35 + 0.05            # centre line of the kerb-lane scooter (muffler 0.1 wide outside the body)
    R, C = a.box
    Q, N = a.queue
    scoot = []
    # fast grade: scooters off the kerb-lane column get a 20 cm body and a 0.2 m muffler face as the tailpipe patch on 10 cm cells
    far = lambda off: (dict(bodyLevel=2, mufflerLevel=3, mufflerSize=0.2, pipeSize=0.1) if (off and not fine) else
                       (dict(mufflerSize=0.2) if coarse else {}))
    head_row = min(1, R - 1)             # headline scooter: kerb-lane scooter of box row 2 (or row 1)
    for r in range(R):
        for c in range(C):
            xr = -1.8 - r * px_box
            if c == 0 and r == head_row:
                g = "s_head"
            elif c == 0:
                g = "s_kerbcol"
            else:
                g = f"s_box{r + 1}"
            scoot.append(dict(name=f"b{r}c{c}", rear=[round(xr, 3), round(cy0 + c * py, 3)], tracer=g, **far(c > 0)))
    xq0 = -1.8 - (R - 1) * px_box        # rear of the last box row
    for q in range(Q):
        for k in range(N):
            xr = xq0 - (k + 1) * px_q
            g = "s_kerbcol" if q == 0 else "s_queue"
            # kerb-lane queue scooters more than one place from the B probes are also 'far' in the fast grade
            scoot.append(dict(name=f"q{q}k{k}", rear=[round(xr, 3), round(cy0 + q * py, 3)], tracer=g,
                              **far(q > 0 or (0 < k < N - 2))))
    x_last = min(s["rear"][0] for s in scoot)
    y_far = max(s["rear"][1] for s in scoot) + 0.5
    head = next(s for s in scoot if s["tracer"] == "s_head")
    xh = head["rear"][0]

    # ---- domain (PLAN asks >= 40 x 30 x 15 m, inflow 10 m upstream, outflow 15 m past the last probe)
    x0 = math.floor((x_last - 10.0) / dx0) * dx0
    x1 = 16.0
    if a.canyon:
        Wc, H = a.canyon
        yb0, yb1 = -pw, -pw + Wc
        y0, y1 = yb0 - 8.0, yb1 + 8.0
        z1 = max(15.2, 2 * H)          # PLAN asks >= 15 m; 2H keeps the cell count down
    else:
        y0, y1 = -pw - 8.0, max(y_far + 12.0, 20.0)
        z1 = 15.2
    y0 = math.floor(y0 / dx0) * dx0
    y1 = math.ceil(y1 / dx0) * dx0
    z1 = math.ceil(z1 / dx0) * dx0

    obst = [dict(name="kerb", min=[x0, y0, 0.0], max=[x1, 0.0, kh], level=2)]
    walls = []
    if a.canyon:
        # buildings on the 0.4 m grid (level 1): at level 2 their 12 m faces alone held ~150k cells
        obst.append(dict(name="building_pav", min=[x0, y0, 0.0], max=[x1, yb0, H], level=1))
        obst.append(dict(name="building_far", min=[x0, yb1, 0.0], max=[x1, y1, H], level=1))
    if a.arcade:
        Hb = a.canyon[1] if a.canyon else 12.0
        ya, yb = -0.5, -4.0             # arcade front (after a 0.5 m kerb strip) and shopfront
        if not a.canyon:
            obst.append(dict(name="building_pav", min=[x0, y0, kh], max=[x1, yb, Hb], level=2))
        obst.append(dict(name="roof", min=[x0, yb, kh + 3.8], max=[x1, ya, Hb], level=(3 if fine else 2)))
        xc = x0 + 1.0
        while xc < x1 - 0.5:
            obst.append(dict(name=f"column{int(round((xc - x0) * 10))}", min=[xc, ya - 0.4, kh], max=[xc + 0.4, ya, kh + 3.8], level=(L_kerb if fine else 2)))
            xc += 4.0

    # ---- people (columns) on the pavement, off the probe lines
    for i, (dx, dy, h, w) in enumerate([(0.55, -0.45, 1.7, 0.4), (-0.6, -0.95, 1.2, 0.3), (1.6, -1.2, 1.7, 0.4), (-1.6, -0.5, 1.0, 0.5)]):
        xc = xh + dx
        obst.append(dict(name=f"person{i}", min=[xc - w / 2, dy - 0.15, kh], max=[xc + w / 2, dy + 0.15, kh + h], level=L_kerb))

    # ---- probes (PLAN section 4)
    probes, labels = [], []
    tpx = xh                             # tailpipe exit x of the headline scooter
    hK = (0.3, 0.6, 0.7, 0.8, 1.1, 1.5, 1.8)
    for d in (0.5, 1.0, 2.0, 4.0):
        y = tp_y0 - d
        for dxo in (-1.0, 0.0, 1.0):
            for h in hK:
                probes.append([round(tpx + dxo, 3), round(y, 3), round((kh if y < 0 else 0.0) + h, 3)])
                labels.append(f"K d={d} dx={dxo} h={h}")
    for y in (-0.2, -0.7):
        for xk in range(-12, 4):
            for h in (0.7, 1.1, 1.5):
                probes.append([float(xk), y, round(kh + h, 3)])
                labels.append(f"KL y={y} x={xk} h={h}")
    lastrow = [s for s in scoot if abs(s["rear"][0] - x_last) < 1e-6]
    for s in lastrow:
        ty = s["rear"][1] - 0.4
        for d in (0.5, 1.0, 2.0, 4.0):
            for h in hK:
                probes.append([round(x_last - d, 3), round(ty, 3), h])
                labels.append(f"B col_y={ty:.2f} d={d} h={h}")
    xr_ = x_last - 0.5
    while xr_ <= 1.0 + 1e-9:
        for h in (0.6, 1.0, 1.5):
            probes.append([round(xr_, 3), -0.05, round(kh + h, 3)])
            labels.append(f"R x={xr_:.1f} h={h}")
        xr_ += 0.5
    for (mx, my, tag) in ((tpx, tp_y0 - 1.0, "V K1"), (tpx, tp_y0 - 4.0, "V K4"), (x_last - 1.0, tp_y0, "V B1")):
        base = kh if my < 0 else 0.0
        for k in range(1, 21):
            probes.append([round(mx, 3), round(my, 3), round(base + 0.15 * k, 3)])
            labels.append(f"{tag} h={0.15 * k:.2f}")
    for s in scoot:
        if s["tracer"] == "s_head" or s["name"] in ("b0c0", lastrow[0]["name"]):
            ty = s["rear"][1] - 0.4
            for d in (0.25, 0.5):
                probes.append([round(s["rear"][0] - d, 3), round(ty, 3), round(0.4 + d * math.tan(math.radians(10)), 3)])
                labels.append(f"SRC {s['name']} d={d}")
    if a.wind > 0:
        # IN (acceptance A6): 1.5 m and 6 m upstream of the pack's most-upwind corner, for inflow speed and turbulence
        th = math.radians(a.dirDeg)
        fx, fy = math.cos(th), math.sin(th)
        corners = [(x_last, 0.2), (x_last, y_far), (0.0, 0.2), (0.0, y_far)]
        cx, cy = min(corners, key=lambda c: c[0] * fx + c[1] * fy)
        for dd in (1.5, 6.0):
            px_, py_ = cx - dd * fx, cy - dd * fy
            for h in (0.7, 1.5, 3.0):
                base = kh if py_ < 0 else 0.0
                probes.append([round(px_, 3), round(py_, 3), round(base + h, 3)])
                labels.append(f"IN up={dd} h={h}")
    if a.iot:
        for xi in (2.0, 4.0, 6.0, 8.0):
            for gap in (2.5, 3.75, 5.0):
                for h in (1.2, 1.5):
                    probes.append([xi, round(tp_y0 - gap, 3), round(kh + h, 3)])
                    labels.append(f"I x={xi} gap={gap} h={h}")
    if a.arcade:
        for xa in (tpx - 2.0, tpx, tpx + 2.0):
            for dd in (1.0, 2.0, 3.0):
                for h in (0.7, 1.1, 1.5):
                    probes.append([round(xa + 0.2, 3), round(-0.5 - dd, 3), round(kh + h, 3)])
                    labels.append(f"AR x={xa:.1f} in={dd} h={h}")

    # move every probe 1.3 mm off the round-number grid planes, so it never sits on a cell face
    probes = [[round(c + 0.0013, 4) for c in pr] for pr in probes]

    # ---- refinement
    if fine and len(scoot) == 1:
        # single-scooter near field at the fine grade (verification correction PLAN 9.24, A3/A5 near-field check):
        # 2.5 cm tailpipe patch, 5 cm cells round the tailpipe and the K probes out to 1 m (heights to 1.9 m),
        # 10 cm to the K 2 m probes, 20 cm round the scooter, 40 cm beyond
        ref = [dict(min=[xh - 8, -pw - 2, 0.0], max=[xh + 10, 6.0, 4.0], level=1),
               dict(min=[xh - 4, -pw, 0.0], max=[xh + 5, 3.0, 3.0], level=2),
               dict(min=[xh - 2.0, tp_y0 - 2.4, 0.0], max=[xh + 2.6, tp_y0 + 1.6, 2.4], level=3),
               dict(min=[xh - 1.2, tp_y0 - 1.15, 0.0], max=[xh + 1.3, tp_y0 + 0.45, 2.1], level=4)]
    elif fine:
        ref = [dict(min=[x_last - 6, y0, 0.0], max=[x1 - 4, y_far + 6, 6.0], level=1),
               dict(min=[x_last - 5, -pw, 0.0], max=[4.0, y_far + 3, 3.5], level=2),
               dict(min=[x_last - 4.5, -pw, 0.0], max=[3.5, y_far + 2.5, 2.6], level=3),
               dict(min=[x_last - 4.2, -min(pw, 4.2), 0.0], max=[3.2, y_far + 2.0, 2.2], level=4)]
    else:
        # 'lean' extents (PLAN 9.18): 0.4 m cells to 4 m height and 6 m beyond the pack, 0.2 m cells to 2.2 m height;
        # the cell sizes at the sources and probes are unchanged
        ref = [dict(min=[x0, max(y0, -pw - 2), 0.0], max=[6.0, min(y1, y_far + 6), 4.0], level=1),
               dict(min=[x_last - 2, -pw, 0.0], max=[2.4, y_far + 1.0, 2.2], level=2),
               # 10 cm round the headline scooter and its K probes out to 2 m, and behind the last row (B probes)
               dict(min=[xh - 1.4, tp_y0 - 2.5, 0.0], max=[xh + 1.6, tp_y0 + 1.0, 2.0], level=3),
               dict(min=[x_last - 4.4, -0.6, 0.0], max=[x_last + 0.4, y_far, 2.0], level=3)]
        if a.iot:
            ref[0]["max"][0] = 10.4
            ref[0]["min"][1] = min(ref[0]["min"][1], -6.0)
        if coarse:   # grid look (acceptance A3 direction): everything one level coarser near the sources and probes
            ref = [dict(r, level=min(r["level"], 2)) for r in ref]
    name = (f"{len(scoot)} scooters (box {R}x{C}, queue {Q}x{N}), wind {a.wind} m/s toward {a.dirDeg} deg"
            + (f", canyon W={a.canyon[0]} H={a.canyon[1]}" if a.canyon else "") + (", arcade" if a.arcade else "")
            + f", grade {a.grade}")
    scene = dict(
        name=name, frame="PLAN.md section 2 (pavement y<0, road y>0, stop line x=0)",
        domain=dict(min=[x0, y0, 0.0], max=[x1, y1, z1], dx0=dx0,
                    **(dict(zGrade=dict(zUniform=z1, zTop=a.ztop, nUpper=20, ratio=5.0)) if a.ztop else {})),
        ambient=dict(T=a.Tamb),
        wind=(dict(speed=round(a.wind * a.inflowFactor, 4), targetSpeed=a.wind, inflowFactor=a.inflowFactor, dirDeg=a.dirDeg, profile="uniform",
                   turbulence=(dict(type="rfm", sigma_h=a.sigmaBoost * max(0.2, a.rfm[0] * a.wind), sigma_wL=a.sigmaBoost * a.rfm[1] * a.wind,
                                    sigma_s=a.sigmaBoost * max(0.1, a.rfm[2] * a.wind), L=a.Lrfm, lam_min=1.6, lam_max=12.0, nModes=150,
                                    T_h=a.Th, T_w=a.Tw, seed=20261127) if a.turb == "rfm" else
                               dict(type="dfsem", sigma_h=a.sigma[0], sigma_w=a.sigma[1], L=a.Lturb, delta=3.0) if a.turb == "dfsem" else
                               dict(type="ou", sigma_h=a.sigma[0], sigma_w=a.sigma[1], T_h=a.Th, T_w=a.Tw, seed=20261127)))
              if a.wind > 0 else dict(speed=0.0)),
        defaults=dict(pipeHeight=0.4, pipeSize=pipe, mufflerSize=0.1, mdot=a.mdot, Texh=a.Texh, pipeAngleDeg=a.pipeAngle,
                      engineHeatW=a.engineW, pipeRefineRadius=0.15, bodyLevel=L_body, mufflerLevel=L_muff,
                      width=0.7, bodyTop=1.1, pipeSide=-1),
        scooters=scoot, obstacles=obst, walls=walls,
        refinementBoxes=ref,
        probes=probes, probeLabels=labels,
        locationInMesh=[x1 - 1.03, y1 - 1.07, (a.ztop - 3.09) if a.ztop else z1 - 1.09],
        time=dict(duration=a.duration, spinup=a.spinup, maxCo=0.95, maxDeltaT=0.05, writeInterval=a.writeEvery),
        nProcs=3, nCellsBetweenLevels=2,
    )
    json.dump(scene, open(a.out, "w"), indent=1)
    print(f"{a.out}: {name}; {len(probes)} probes; domain {scene['domain']}")


if __name__ == "__main__":
    main()
