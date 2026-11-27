"""Independent back-of-envelope checks (reality lens). No simulation input or result is changed.
Route: engine arithmetic, carbon balance, box/Gaussian dispersion, canyon well-mixed balance."""
import math
Vm=24.45e-3  # m3/mol at 25 C
print("1. Exhaust flow from engine arithmetic (125 cc 4-stroke, 1700 rpm, VE 0.2-0.35)")
sw=0.125e-3*1700/120
for ve in (0.2,0.35): print(f"   VE {ve}: {sw*ve*1e3:.2f} L/s intake")
for F in (80,120,200):
    for afr in (12,14.7):
        m=F/3600*(1+afr)/1000; print(f"   fuel {F} g/h AFR {afr}: exhaust {m:.2e} kg/s = {m/0.0288*Vm*1e3:.2f} L/s at 25C")
mol=5.5e-4/0.0288
print("2. Raw CO for 16 g/h at 5.5e-4 kg/s:", f"{16/3600/28/mol*100:.2f} %")
co65=0.065*mol*28*3600; C=0.86*120/12
print(f"   6.5 % CO emitter = {co65:.0f} g CO/h = {co65/28/C*100:.0f} % of fuel carbon at 120 g/h (CO/(CO+CO2+HC) ~45 % if carbon sum ~14.5 %)")
bins=[(0.747,0.3),(0.186,1.8),(0.052,3.8),(0.010,5.8),(0.005,8)]
print("   inspection-bin mean CO % (bin mids assumed):", round(sum(a*b for a,b in bins),2))
mgppm=1.145
def box(Eg_h,U,W,H): return Eg_h/3600/(U*W*H)*1000/mgppm
print("3a. S1-from, 12 x 16 g/h, U 0.95, aligned wind, box W 4.5-6 m x H 2-3 m at 4 m:",
      f"{box(192,0.95,6,3):.1f}-{box(192,0.95,4.5,2):.1f} ppm (sim K 4 m 1.5 m P50 3.3)")
print("3b. Kaohsiung A, 34 x 16 g/h, aligned, U 1.6-2.0, W 9 m, H 2.5 m: centreline",
      f"{box(544,2.0,9,2.5):.1f}-{box(544,1.6,9,2.5):.1f} ppm; sensor 2.5-5 m to side x0.3-0.5 ->",
      f"{0.3*box(544,2.0,9,2.5):.1f}-{0.5*box(544,1.6,9,2.5):.1f} ppm (sim highest 30-s P50 1.33; observed 48-h max 0.8-1.2)")
print("    at site P5 wind 0.9 m/s the aligned value scales x", round(2.0/0.9,1))
q=0.47e-3*0.065
for s in (0.2,0.3):
    c=q/(math.pi*s*s*0.5)*1e6
    print(f"3c. S4-S5-12 6.5 % emitter at 0.5 m, U 0.5, sigma {s} m: centreline {c:.0f} ppm; 0.5 m off-axis {c*math.exp(-0.5*(0.5/s)**2):.0f} ppm (sim mean 121)")
print("4. Canyon well-mixed (20 m x 12 m section), pack present continuously:")
for N,U in ((12,0.47),(30,0.3)):
    print(f"   N {N} U_along {U}: {N*16/3600/(U*240)*1000/mgppm:.2f} ppm downstream section mean (sim K 4 m ~0.002-0.003)")
print("5. Pushchair/adult 90-s mean ratio, K d=0.5 dx=0 (from results-simulation.json): S1 0.59, S2 0.74, A 4.3, S1-from 1.8, S5-12 1.4;",
      "measured kerb literature 1.1-1.8 (Buzzard 2009, Kenagy 2016, Sharma & Kumar)")
