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
    ap.add_argument("--sigma", type=float, nargs=2, default=[0.3, 0.15])
    ap.add_argument("--canyon", type=float, nargs=2, default=None)
    ap.add_argument("--arcade", action="store_true")
    ap.add_argument("--grade", default="fast", choices=["fast", "fine"])
    ap.add_argument("--engineW", type=float, default=1000.0)
    ap.add_argument("--duration", type=float, default=90.0)
    ap.add_argument("--spinup", type=float, default=60.0)
    ap.add_argument("--pw", type=float, default=4.0)
    ap.add_argument("--Tamb", type=float, default=303.15)
    a = ap.parse_args()
    fine = a.grade == "fine"
    # grid: dx0 0.8 m; level 1 0.4, 2 0.2, 3 0.1, 4 0.05, 5 0.025
    dx0 = 0.8
    L_body, L_muff = 3, (5 if fine else 4)
    L_kerb = 4 if fine else 3
    pipe = 0.025 if fine else 0.05
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
    far = lambda off: (dict(bodyLevel=2, mufflerLevel=3, mufflerSize=0.2, pipeSize=0.2) if (off and not fine) else {})
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
        z1 = max(15.0, 3 * H)
    else:
        y0, y1 = -pw - 8.0, max(y_far + 12.0, 20.0)
        z1 = 15.2
    y0 = math.floor(y0 / dx0) * dx0
    y1 = math.ceil(y1 / dx0) * dx0
    z1 = math.ceil(z1 / dx0) * dx0

    obst = [dict(name="kerb", min=[x0, y0, 0.0], max=[x1, 0.0, kh], level=2)]
    walls = []
    if a.canyon:
        obst.append(dict(name="building_pav", min=[x0, y0, kh], max=[x1, yb0, H], level=2))
        obst.append(dict(name="building_far", min=[x0, yb1, 0.0], max=[x1, y1, H], level=2))
    if a.arcade:
        Hb = a.canyon[1] if a.canyon else 12.0
        ya, yb = -0.5, -4.0             # arcade front (after a 0.5 m kerb strip) and shopfront
        if not a.canyon:
            obst.append(dict(name="building_pav", min=[x0, y0, kh], max=[x1, yb, Hb], level=2))
        obst.append(dict(name="roof", min=[x0, yb, kh + 3.8], max=[x1, ya, Hb], level=3))
        xc = x0 + 1.0
        while xc < x1 - 0.5:
            obst.append(dict(name=f"column{int(round((xc - x0) * 10))}", min=[xc, ya - 0.4, kh], max=[xc + 0.4, ya, kh + 3.8], level=L_kerb))
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
    if a.arcade:
        for xa in (tpx - 2.0, tpx, tpx + 2.0):
            for dd in (1.0, 2.0, 3.0):
                for h in (0.7, 1.1, 1.5):
                    probes.append([round(xa + 0.2, 3), round(-0.5 - dd, 3), round(kh + h, 3)])
                    labels.append(f"AR x={xa:.1f} in={dd} h={h}")

    # ---- refinement
    if fine:
        ref = [dict(min=[x_last - 6, y0, 0.0], max=[x1 - 4, y_far + 6, 6.0], level=1),
               dict(min=[x_last - 5, -pw, 0.0], max=[4.0, y_far + 3, 3.5], level=2),
               dict(min=[x_last - 4.5, -pw, 0.0], max=[3.5, y_far + 2.5, 2.6], level=3),
               dict(min=[x_last - 4.2, -min(pw, 4.2), 0.0], max=[3.2, y_far + 2.0, 2.2], level=4)]
    else:
        ref = [dict(min=[x_last - 6, max(y0, -pw - 2), 0.0], max=[6.0, y_far + 6, 5.0], level=1),
               dict(min=[x_last - 3, -pw, 0.0], max=[2.4, y_far + 1.5, 2.8], level=2),
               # 10 cm round the headline scooter and its K probes out to 2 m, and behind the last row (B probes)
               dict(min=[xh - 1.4, tp_y0 - 2.5, 0.0], max=[xh + 1.6, tp_y0 + 1.0, 2.0], level=3),
               dict(min=[x_last - 4.4, -0.6, 0.0], max=[x_last + 0.4, y_far, 2.0], level=3)]
    name = (f"{len(scoot)} scooters (box {R}x{C}, queue {Q}x{N}), wind {a.wind} m/s toward {a.dirDeg} deg"
            + (f", canyon W={a.canyon[0]} H={a.canyon[1]}" if a.canyon else "") + (", arcade" if a.arcade else "")
            + f", grade {a.grade}")
    scene = dict(
        name=name, frame="PLAN.md section 2 (pavement y<0, road y>0, stop line x=0)",
        domain=dict(min=[x0, y0, 0.0], max=[x1, y1, z1], dx0=dx0),
        ambient=dict(T=a.Tamb),
        wind=(dict(speed=a.wind, dirDeg=a.dirDeg, profile="uniform",
                   turbulence=dict(type="dfsem", sigma_h=a.sigma[0], sigma_w=a.sigma[1], L=0.8, delta=3.0))
              if a.wind > 0 else dict(speed=0.0)),
        defaults=dict(pipeHeight=0.4, pipeSize=pipe, mufflerSize=0.1, mdot=5.5e-4, Texh=523.15, pipeAngleDeg=10.0,
                      engineHeatW=a.engineW, pipeRefineRadius=0.15, bodyLevel=L_body, mufflerLevel=L_muff,
                      width=0.7, bodyTop=1.1, pipeSide=-1),
        scooters=scoot, obstacles=obst, walls=walls,
        refinementBoxes=ref,
        probes=probes, probeLabels=labels,
        locationInMesh=[x1 - 1.03, y1 - 1.07, z1 - 1.09],
        time=dict(duration=a.duration, spinup=a.spinup, maxCo=0.8, maxDeltaT=0.05, writeInterval=a.spinup + a.duration),
        nProcs=3,
    )
    json.dump(scene, open(a.out, "w"), indent=1)
    print(f"{a.out}: {name}; {len(probes)} probes; domain {scene['domain']}")


if __name__ == "__main__":
    main()
