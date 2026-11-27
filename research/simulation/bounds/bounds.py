#!/usr/bin/env python3
"""
Conservation-of-mass and near-field bounds for kerbside CO (and odour) beside idling scooters.
Written BEFORE any 3-D simulation result exists. Inputs come from research/estimate (model.mjs INPUTS,
inputs-*.json) and research/simulation/inputs-simulation.json; every number below says where it came from.
Nothing here is tuned toward or away from any guideline: the targets (87, 30, 9, 1 ppm) are only the
levels we ask "what would it take" about.

Run: python3 bounds.py  > bounds-results.txt     (numpy only; < 5 s)
"""
import math
import numpy as np

rng = np.random.default_rng(20261127)
P = print

# ---------------------------------------------------------------- constants
MV = 24.45                      # L/mol at 25 C, 1 atm (estimate model.mjs)
CO_MG_PPM = 28.01 / MV          # 1.146 mg/m3 per ppm
WHO15 = 100.0 / CO_MG_PPM       # 87.3 ppm, 15 min   (who-2010-iaq)
WHO1H = 35.0 / CO_MG_PPM        # 30.5 ppm, 1 h      (who-2010-iaq)
TW1H = 31.0                     # ppm, 1 h           (moenv-annual-2025, 2024 amendment as printed)
WHO8H = 10.0 / CO_MG_PPM        # 8.7 ppm, 8 h
TARGETS = [("WHO 15-min 100 mg/m3", WHO15), ("1-h values (WHO 35 mg/m3 / Taiwan 31 ppm)", 30.0),
           ("8-h values (WHO 10 mg/m3 / Taiwan 9 ppm)", 9.0), ("1 ppm (order of today's kerb maxima)", 1.0)]

# ---------------------------------------------------------------- A. per-scooter emission (replicates model.mjs drawScooter for CO)
BINS = [(0, 1, 6769973), (1, 2, 1042630), (2, 3, 650643), (3, 4, 342331), (4, 5, 121532), (5, 6, 57596),
        (6, 7, 35469), (7, 8, 21826), (8, 9, 12560), (9, 10, 12597)]          # MOENV 2025, n = 9,067,160 (V)
cnt = np.array([b[2] for b in BINS], float); cum = np.cumsum(cnt) / cnt.sum()


def draw_fleet(n, fuel=None, newshare=None, m1=None):
    """Return per-scooter (CO mg/s, raw CO %, exhaust L/s at 25 C) like model.mjs (two-strokes drawn from the
    inspection distribution as there)."""
    F = fuel if fuel is not None else 120 * np.exp(rng.normal(0, math.log(200 / 80) / 2 / 1.6449, n))
    F = F * np.exp(0.2 * rng.normal(size=n) - 0.02)
    ns = newshare if newshare is not None else rng.uniform(0.25, 0.45, n)
    m1 = m1 if m1 is not None else rng.uniform(0.3, 0.7, n)
    isnew = rng.random(n) < ns
    u = rng.random(n); i = np.searchsorted(cum, u)
    lo = np.where(i == 0, np.maximum(0, 2 * m1 - 1), i.astype(float)); hi = np.where(i == 0, np.minimum(1, 2 * m1), i + 1.0)
    co = lo + (hi - lo) * rng.random(n)
    co = np.where(isnew, rng.uniform(0.05, 0.6, n) * (0.5 + rng.random(n)), co)
    S = np.maximum(rng.uniform(11.5, 12.5, n), co + 3)
    co_mg_s = F * (0.86 / 12.011) * (co / S) * 28.01 / 3.6
    vexh = F * 0.86 / 12.011 / 0.125 * MV / 3600     # L/s: carbon species ~12.5 % of exhaust moles (inputs-simulation exhaustFlow)
    return co_mg_s, co, vexh


co_s, co_pct, vexh = draw_fleet(400000)
gph = co_s * 3.6
P("=" * 100)
P("A. EMISSION INPUTS (replicating research/estimate/model.mjs; inspection table MOENV 2025)")
P(f"  per-scooter idle CO: mean {gph.mean():.1f} g/h; P50 {np.median(gph):.1f}; P90 {np.percentile(gph,90):.0f}; "
  f"P99 {np.percentile(gph,99):.0f}; P99.9 {np.percentile(gph,99.9):.0f} g/h")
P(f"  exhaust flow at 25 C: P5/P50/P95 {np.percentile(vexh,5):.2f}/{np.median(vexh):.2f}/{np.percentile(vexh,95):.2f} L/s "
  "(inputs-simulation: 0.31-0.78, central 0.47)")
raw_mix = (co_s.sum() / vexh.sum()) / CO_MG_PPM * 1000   # flux-weighted raw CO, ppm
P(f"  raw CO in the tailpipe: per-scooter P50 {np.median(co_pct):.2f} %, mean {co_pct.mean():.2f} %; "
  f"flux-weighted fleet mix {raw_mix:.0f} ppm ({raw_mix/1e4:.2f} %)")
for thr in (1, 3, 5, 7):
    P(f"  share of idling scooters with raw CO >= {thr} %: {np.mean(co_pct >= thr)*100:.1f} %")
E_MEAN = gph.mean()
P(f"  -> fleet-mean emission used below E1 = {E_MEAN:.1f} g/h per scooter (estimate: 15.4, fleet-mean P5-P95 8.3-27.1)")

# ---------------------------------------------------------------- B. C = E/Q
P("\n" + "=" * 100)
P("B. WELL-MIXED VOLUME: C = E / Q  (E = total CO emission, Q = fresh air through the volume)")
P("  CO increment (ppm) for N idling scooters at the fleet mean, by air exchange Q (m3/s):")
Qs = [0.3, 1, 3, 10, 30, 100]
P("  " + "N".rjust(5) + "".join(f"{q:>9g}" for q in Qs))
for N in (4, 12, 30, 60, 100):
    E = N * E_MEAN / 3.6                     # mg/s
    P("  " + f"{N:5d}" + "".join(f"{E / q / CO_MG_PPM:9.2f}" for q in Qs))
P("  Largest Q (m3/s) that still gives the target, fleet-mean emitters / fleet-mean P95 27 g/h / pack of high emitters 6.5 % CO (~110 g/h):")
for name, t in TARGETS:
    row = []
    for N in (12, 30, 100):
        for e in (E_MEAN, 27.1, 110.0):
            row.append(N * e / 3.6 / (t * CO_MG_PPM))
    P(f"  {name:44s} N=12: {row[0]:.3g}/{row[1]:.3g}/{row[2]:.3g}   N=30: {row[3]:.3g}/{row[4]:.3g}/{row[5]:.3g}   N=100: {row[6]:.3g}/{row[7]:.3g}/{row[8]:.3g}")
P("  What outdoor air exchange is: Q = (ventilation speed) x (cross-section the exhaust is mixed over).")
for U in (0.1, 0.3, 0.5, 1.0):
    for (w, h) in ((7, 1.5), (7, 3), (20, 10)):
        P(f"    U {U:3.1f} m/s through {w:2d} m x {h:4.1f} m -> Q = {U*w*h:6.1f} m3/s", end="")
        P(f"   (30 fleet-mean scooters -> {30*E_MEAN/3.6/(U*w*h)/CO_MG_PPM:6.2f} ppm if ALL of it passed the nose)")

# ---------------------------------------------------------------- C. dilution needed
P("\n" + "=" * 100)
P("C. DILUTION OF RAW IDLE EXHAUST NEEDED TO REACH EACH LEVEL (D = raw / target; raw CO from the inspection table)")
raws = [("new FI scooter ~0.3 %", 3000), ("fleet flux-weighted mix", raw_mix), ("1.5 %", 15000), ("limit 3.5 % (pre-2017)", 35000),
        ("high emitter 6.5 %", 65000), (">= 9 % bin", 95000)]
P("  " + "raw".ljust(28) + "".join(f"{n[:22]:>24}" for n, _ in TARGETS))
for nm, r in raws:
    P("  " + nm.ljust(28) + "".join(f"{r / t:24.0f}" for _, t in TARGETS))
P(f"  Measured dilutions for comparison (inputs-simulation nearField): moving cars ~6,000 at 3 m (Wang 2015); "
  "wind tunnel 75-125 at 8.5 m behind a moving vehicle; chase study up to 1,000 in 2 s (Buzzard 2009 quoting others).")
P(f"  Estimate's 90-s kerb means imply dilution: dozen median 0.29 ppm -> {raw_mix/0.29:,.0f}; full box P95 1.7 ppm -> {raw_mix/1.7:,.0f}")

# ---------------------------------------------------------------- D. single tailpipe near field
P("\n" + "=" * 100)
P("D. ONE TAILPIPE: HOW CLOSE, IN HOW LITTLE WIND, DOES EACH DILUTION EXIST?")
V0 = 0.47e-3                 # m3/s exhaust at 25 C (inputs-simulation exhaustFlow central)
d = 0.025; Tex = 250 + 273.15; Ta = 303.15  # m, K (inputs-simulation: 18-32 mm, 150-350 C, both ASSUMPTIONS)
Vact = V0 * Tex / 298.15; u0 = Vact / (math.pi * d * d / 4)
M = u0 * Vact; Fb = 9.81 * Vact * (Tex - Ta) / Tex
lM = M ** 0.75 / Fb ** 0.5
P(f"  exit: {Vact*1e3:.2f} L/s actual, u0 {u0:.2f} m/s, momentum flux {M:.2e} m4/s2, buoyancy flux {Fb:.2e} m4/s3, jet-to-plume length {lM:.2f} m")
P("  D1. STILL AIR (no wind, no turbulence: an idealisation that never holds for long).")
P("      jet (s < l_M): centreline dilution ~ s / (5 d_eff), d_eff = d sqrt(rho_j/rho_a); beyond: Morton-Taylor-Turner point plume,")
P("      volume flux Q(z) = 0.169 F^(1/3) z^(5/3) (alpha 0.1, top-hat), centreline dilution ~ Q/V0 / 2.")
deff = d * math.sqrt(Ta / Tex)
alpha = 0.1
for z in (0.1, 0.2, 0.3, 0.5, 0.8, 1.2):
    Qz = (6 * alpha / 5) * (9 * alpha / 10) ** (1 / 3) * math.pi * Fb ** (1 / 3) * z ** (5 / 3)
    wz = (5 / (6 * alpha)) * (9 * alpha * Fb / (10 * math.pi)) ** (1 / 3) * z ** (-1 / 3)
    Djet = z / (5 * deff)
    Dpl = max(1.0, Qz / V0 / 2)
    P(f"      {z:3.1f} m above the pipe: plume centreline dilution ~{Dpl:6.1f} (rise speed {wz:4.2f} m/s); a horizontal jet would give ~{Djet:5.1f}"
      f"  -> CO at fleet mix {raw_mix/Dpl:7.0f} ppm, at 6.5 % {65000/Dpl:7.0f} ppm")
P("      Reading: directly above or in front of a pipe in dead-still air, dilution is only ~4-40 within 0.3-1.2 m: hundreds to")
P("      thousands of ppm in the plume core. But the rise speed is only 0.4-0.6 m/s, comparable to the kerb turbulence floor")
P("      (sigma_v 0.2-0.5 m/s, AERMOD), so within ~0.3-0.5 m the plume is bent over and torn by ambient motion.")

P("  D2. BENT-OVER PLUME in light air: Gaussian, transport u_e = max(U, sqrt2 sigma_v) (estimate eq.), ground reflection.")
P("      'mean'  = time-mean plume (sigma_v = max-combination as estimate, sigma_y0 0.3 m, sigma_z0 0.2 m: the estimate's low ends)")
P("      'inst.' = instantaneous plume core: pipe-scale start (0.05 m) and relative spread 0.3-0.5 x mean growth (ASSUMPTION:")
P("                Gifford meandering-plume picture; near a source most of the mean width is meander of a narrow filament)")


def chiQ_axis(s, U, sv0=0.2, sw0=0.1, iv=0.3, iw=0.2, sy0=0.3, sz0=0.2, h=0.4, z=None, rel=1.0):
    sv = math.hypot(iv * U, sv0); sw = math.hypot(iw * U, sw0); ue = max(U, math.sqrt(2) * sv)
    t = s / ue
    sy = math.hypot(sy0, rel * sv * t); sz = math.hypot(sz0, rel * sw * t)
    z = h if z is None else z
    vert = math.exp(-(z - h) ** 2 / (2 * sz * sz)) + math.exp(-(z + h) ** 2 / (2 * sz * sz))
    return vert / (2 * math.pi * ue * sy * sz)


P("      dilution on the plume axis (pipe height 0.4 m) at distance s downwind:")
P("      " + "U m/s".ljust(8) + "".join(f"{'s='+str(s)+' m':>22}" for s in (0.25, 0.5, 1, 2, 4)))
for U in (0.2, 0.5, 1.0, 2.0):
    cells = []
    for s in (0.25, 0.5, 1, 2, 4):
        Dm = 1 / (V0 * chiQ_axis(s, U))
        Di_hi = 1 / (V0 * chiQ_axis(s, U, sy0=0.05, sz0=0.05, rel=0.3))
        Di_lo = 1 / (V0 * chiQ_axis(s, U, sy0=0.05, sz0=0.05, rel=0.5))
        cells.append(f"{Dm:7.0f} [{Di_hi:5.0f}-{Di_lo:5.0f}]")
    P("      " + f"{U:<8}" + "".join(f"{c:>22}" for c in cells))
P("      (first number: time-mean dilution; bracket: instantaneous-core dilution)")


def dist_for(Dtarget, U, inst=False):
    for s in np.arange(0.05, 20, 0.01):
        D = 1 / (V0 * (chiQ_axis(s, U, sy0=0.05, sz0=0.05, rel=0.4) if inst else chiQ_axis(s, U)))
        if D >= Dtarget:
            return s
    return float("nan")


P("      Farthest distance on the plume axis at which the CO increment is still >= the target (one scooter, inst. core rel 0.4):")
for nm, r in (("fleet mix", raw_mix), ("1.5 %", 15000), ("high 6.5 %", 65000)):
    out = []
    for name, t in TARGETS[:3]:
        out.append(" / ".join(f"{dist_for(r/t, U, True):.2f}" for U in (0.2, 0.5, 1.0)))
    P(f"      raw {nm:11s}: 87 ppm within {out[0]} m;  30 ppm within {out[1]} m;  9 ppm within {out[2]} m   (U = 0.2 / 0.5 / 1.0 m/s)")
P("      Off the plume axis (a nose 1.1-1.5 m up when the pipe is at 0.3-0.5 m) the vertical factor cuts this sharply:")
for z in (0.7, 1.1, 1.5):
    vals = []
    for s in (0.5, 1, 2):
        c_inst = chiQ_axis(s, 0.5, sy0=0.05, sz0=0.05, rel=0.4, z=z) * (E_MEAN / 3.6) / CO_MG_PPM
        c_mean = chiQ_axis(s, 0.5, z=z) * (E_MEAN / 3.6) / CO_MG_PPM
        vals.append(f"s={s}: mean {c_mean:5.1f}, core {c_inst:7.2f}")
    P(f"      nose {z} m, U 0.5 m/s, one fleet-mean scooter: " + ";  ".join(vals) + " ppm")
P("      (core value off-axis can be lower than the mean: a narrow filament at 0.4 m misses a 1.5 m nose unless it is lifted;")
P("       buoyant rise of 0.1-0.5 m within 1-2 m and rider/scooter body wakes decide that - a job for the 3-D simulation)")

# ---------------------------------------------------------------- E. pack, steady wind straight from the pack (upper envelope of 90-s means)
P("\n" + "=" * 100)
P("E. PACK UPPER ENVELOPE FOR A 90-s MEAN: wind held straight from the pack to the kerb for the whole red, no meander,")
P("   every scooter idling from t = 0, least-dilution plausible turbulence (sigma_v 0.2 floor, sigma_w 0.1 floor, iv 0.3, iw 0.2).")


def layout(N, gap=0.6, lane=False):
    """kerb at y = 0 (pavement y < 0). Kerb-lane column of tailpipes at y = gap, stop box 2 rows deep x up to 8 across,
    overflow behind the box in 2 columns along the kerb lane (x < 0)."""
    pos = []
    if lane:   # kerb-lane queue only: 2 columns along the kerb lane, rows 2.0 m apart, front row at x = 0
        return [(-(k // 2) * 2.0, gap + (k % 2) * 1.05) for k in range(N)]
    for r in range(2):
        for c in range(8):
            pos.append((2.0 - r * 2.0, gap + c * 1.05))
    k = 0
    while len(pos) < N:
        pos.append((-2.0 - (k // 2) * 2.0, gap + (k % 2) * 1.05)); k += 1
    return pos[:N]


def pack_C(N, U, xr, yr, z, e_mg_s, sy0=0.3, sz0=0.2, h=0.4, wind_dir=(0, -1), lane=False):
    c = 0.0
    for (x, y) in layout(N, lane=lane):
        dx, dy = xr - x, yr - y
        s = dx * wind_dir[0] + dy * wind_dir[1]; n = -dx * wind_dir[1] + dy * wind_dir[0]
        if s <= 0.05:
            continue
        sv = math.hypot(0.3 * U, 0.2); sw = math.hypot(0.2 * U, 0.1); ue = max(U, math.sqrt(2) * sv); t = s / ue
        sy = math.hypot(sy0, sv * t); sz = math.hypot(sz0, sw * t)
        vert = math.exp(-(z - h) ** 2 / (2 * sz * sz)) + math.exp(-(z + h) ** 2 / (2 * sz * sz))
        c += e_mg_s * math.exp(-n * n / (2 * sy * sy)) * vert / (2 * math.pi * ue * sy * sz)
    return c / CO_MG_PPM


P("   receptor on the kerb beside the box (x = 1 m), distance from the nearest tailpipe column 0.5/1/2/4 m; ppm, fleet-mean emitters")
P("   " + "N  U".ljust(10) + "".join(f"{'d='+str(dd)+' z='+str(z):>14}" for dd in (0.5, 1, 2, 4) for z in (0.7, 1.5)))
env = {}
for N in (4, 12, 30):
    for U in (0.3, 0.5, 0.8, 1.5):
        row = []
        for dd in (0.5, 1, 2, 4):
            for z in (0.7, 1.5):
                v = pack_C(N, U, 1.0, 0.6 - dd, z, E_MEAN / 3.6)
                row.append(v); env[(N, U, dd, z)] = v
        P("   " + f"{N:<3d}{U:<7}" + "".join(f"{v:14.2f}" for v in row))
P("   Same with the fleet-mean P95 (27 g/h) multiply by 1.8; with the nearest kerb-lane scooter a 6.5 % high emitter, add:")
for U in (0.3, 0.8):
    extra = [pack_C(1, U, 1.0, 0.6 - dd, 0.7, (110 - E_MEAN) / 3.6) for dd in (0.5, 1, 2)]
    P(f"     U {U}: +{extra[0]:.1f} / +{extra[1]:.1f} / +{extra[2]:.1f} ppm at 0.5 / 1 / 2 m, 0.7 m height (90-s mean, axis-aligned)")
P("   Person directly BEHIND the last row of a 12-scooter kerb-lane queue (2 columns x 6 rows, last tailpipes at x = -10 m;")
P("   wind along the queue toward them; tailpipe of the last row 0.5/1/2 m in front of the nose):")
for U in (0.3, 0.5, 0.8):
    vals = [pack_C(12, U, -10.0 - dd, 0.6, z, E_MEAN / 3.6, wind_dir=(-1, 0), lane=True) for dd in (0.5, 1, 2) for z in (0.7, 1.5)]
    P(f"     U {U}: 0.5 m: {vals[0]:.1f} (0.7 m) {vals[1]:.2f} (1.5 m); 1 m: {vals[2]:.1f} / {vals[3]:.2f}; 2 m: {vals[4]:.1f} / {vals[5]:.2f} ppm")

# ---------------------------------------------------------------- F. what it would take
P("\n" + "=" * 100)
P("F. WHAT IT WOULD TAKE TO REACH THE AVERAGING-TIME VALUES")
P("  Averaging arithmetic (background excluded): a level C held for t s inside a T-s window adds C t / T to the window mean.")
for name, t, T in (("WHO 15-min", WHO15, 900), ("1-h (30 ppm)", 30.0, 3600)):
    P(f"  {name}: one 90-s red needs a 90-s mean of {t*T/90:,.0f} ppm; a 10-s burst needs {t*T/10:,.0f} ppm; a 1-s puff {t*T:,.0f} ppm.")
    for duty in (0.45, 0.55, 0.65):
        P(f"     staying through every red for the whole window (red fraction {duty:.2f} of the cycle, exhaust cleared at green): "
          f"{t/duty:,.0f} ppm mean during each red")
P(f"  Highest-exposure kerb-side case in E (N=30, U=0.3, 0.5 m, 0.7 m): {env[(30,0.3,0.5,0.7)]:.1f} ppm 90-s mean -> one red adds "
  f"{env[(30,0.3,0.5,0.7)]/10:.2f} ppm to a 15-min mean; standing through all reds at duty 0.55 gives {env[(30,0.3,0.5,0.7)]*0.55:.1f} ppm 15-min mean.")
need = WHO15 / 0.55
P(f"  To reach 87 ppm 15-min outdoors by standing through the reds you need ~{need:.0f} ppm through every red: "
  f"x{need/env[(30,0.3,0.5,0.7)]:.0f} above that envelope.")
P("  Equivalently the fresh-air exchange past the person would have to fall to Q <= E/C:")
for N in (30, 100):
    q = N * E_MEAN / 3.6 / (need * CO_MG_PPM)
    P(f"     N = {N}: Q <= {q:.2f} m3/s; over a 7 m x 1.5 m kerb-side cross-section that is a ventilation speed <= {q/10.5:.3f} m/s"
      f" (kerb wind 0.3-2 m/s, turbulence floor 0.2 m/s)")
P("  ARCADE (騎樓) with no source inside: at steady state the arcade air cannot exceed the time-mean of the air entering it.")
P("     It can hold exhaust past the green (residence time V/Q_exchange) and so raise a 15-min mean toward the kerb-edge red-phase")
P("     mean x duty, but it cannot create peaks above the kerb-edge peaks. Only scooters idling INSIDE or AT THE MOUTH of the arcade")
P("     (riding on to the pavement, parking with engine running) put a source in the enclosure.")
for N, q in ((5, 0.5), (5, 2.0), (12, 1.0)):
    P(f"     {N} fleet-mean scooters idling inside an arcade segment exchanged at {q} m3/s: {N*E_MEAN/3.6/q/CO_MG_PPM:.1f} ppm well-mixed")
P("  SCOOTER UNDERPASS / TUNNEL (機車地下道), queue held inside, longitudinal air speed u_a, cross-section A = 4.5 m x 3 m (ASSUMPTION):")
for N in (20, 50, 100):
    for ua in (0.1, 0.3, 1.0):
        C = N * E_MEAN / 3.6 / (13.5 * ua) / CO_MG_PPM
        P(f"     N {N:3d}, u_a {ua:3.1f} m/s: {C:6.1f} ppm downstream end (time to steady state ~ L/u_a = {100/ua/60:.0f} min for 100 m)")
P("  ENCLOSED CAR PARK benchmark (measured, cars): Hong Kong 52 underground car parks, 15-min TWA mean 39 ppm, max 362 ppm;")
P("     1-min maxima 9-667 ppm (chan-burnett-chow-1997, V). Enclosures are where 87 ppm/15 min is documented.")

# ---------------------------------------------------------------- G. brief peaks
P("\n" + "=" * 100)
P("G. BRIEF PEAKS - which references properly apply")
P("  No CO health guideline has an averaging time shorter than 15 min except emergency/occupational ceilings:")
P("  AEGL-2 10-min 420 ppm (disabling-effects emergency level), NIOSH ceiling 200 ppm (occupational, instantaneous).")
P("  A 1-s or 10-s peak is compared ONLY (a) after converting to the 15-min/1-h window it contributes to, or (b) with these ceilings,")
P("  clearly labelled as emergency/occupational. Peaks of tens to hundreds of ppm are physically possible in a plume core (D above);")
P("  whether a nose sits there, and for how many seconds, is the question for the simulation.")

# ---------------------------------------------------------------- H. odour
P("\n" + "=" * 100)
P("H. ODOUR (perception, averaging time ~1 s)")
P("  Whole petrol-engine exhaust dilution-to-threshold D/T_raw = 800-1,000 (Fiala 1967) to 5,200-6,800 (Swedish 1970) (epa-ap122-1973, abstracts).")
P("  Odour units at the nose OU = D/T_raw / D  with D the dilution of exhaust at the nose; for the pack, D = raw-mix CO / CO increment.")
for lbl, c in (("estimate dozen 90-s median", 0.29), ("estimate full box 90-s P95", 1.7), ("1 ppm", 1.0), ("5 ppm (brief hit)", 5.0), ("20 ppm (core hit)", 20.0)):
    D = raw_mix / c
    P(f"  {lbl:28s} CO {c:5.2f} ppm -> D {D:9,.0f} -> {800/D:6.2f} to {6800/D:6.2f} OU")
P("  HC-rich exhaust (failing tail ~5,800 ppm HC, two-strokes ~5,400 ppm, vs ~400-500 ppm ordinary; MOENV 2025 / Taipei Times):")
P("  if odorants scale with HC, such a scooter's D/T_raw is ~10-14x higher (ASSUMPTION), i.e. ~10,000-90,000.")
P("  Reading: at the estimate's 90-s means the pack is at or below the detection threshold on average; seconds-long plume")
P("  hits of 1-20 ppm CO carry 0.1-50 OU (detectable to strong), and an HC-rich neighbour adds 10x. A horrible smell needs")
P("  only seconds-scale hits; it does not imply CO near 87 ppm over 15 min. CO itself is odourless.")

# ---------------------------------------------------------------- I. how often
P("\n" + "=" * 100)
P("I. HOW OFTEN (from the inputs; for the scenario likelihood column)")
sig = math.log(2.0 / 0.3) / 2 / 1.6449
for u in (0.3, 0.5, 0.8, 1.0):
    p = 0.5 * (1 + math.erf(math.log(u / 0.8) / sig / math.sqrt(2)))
    P(f"  kerb wind < {u} m/s (estimate lognormal 0.3/0.8/2.0): {p*100:.0f} % of reds")
P("  wind from the pack toward the pedestrian within +-45 deg (uniform direction): 25 % of reds; within +-22.5 deg: 12.5 %")
p_new = 0.35
for thr, share in ((3, 0.067), (5, 0.015), (7, 0.005)):
    ps = share * (1 - p_new)
    P(f"  idling scooter with raw CO >= {thr} %: {ps*100:.2f} % each; at least one in 12: {(1-(1-ps)**12)*100:.0f} %; in 30: {(1-(1-ps)**30)*100:.0f} %; "
      f"nearest kerb-side scooter: {ps*100:.1f} %")
for s2 in (0.01, 0.03):
    P(f"  two-stroke share {s2:.0%}: at least one in 12: {(1-(1-s2)**12)*100:.0f} %; in 30: {(1-(1-s2)**30)*100:.0f} %")
P("  queue: average red at the busiest IOT junction ~3 per approach; normal peak ~8-10 within 10 m; oversaturated peak ~27, up to ~100 over")
P("  4 lanes (inputs-scene-and-references findings 14, 17; Lan & Chang). No per-red count for a typical junction exists.")
