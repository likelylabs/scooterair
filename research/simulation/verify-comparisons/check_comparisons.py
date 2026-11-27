"""Independent comparison-fairness checks (verifier, comparisons lens). Reads results-simulation.json; changes nothing."""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(here, '..', 'results-simulation.json')))['cases']
Vm = 24.45  # L/mol at 25 C, 1 atm
print('Conversions at 25 C: CO 100 mg/m3 =', round(100*Vm/28.01,1), 'ppm; 35 mg/m3 =', round(35*Vm/28.01,1),
      '; OEHHA CO 23 mg/m3 =', round(23*Vm/28.01,1), 'ppm; benzene 27 ug/m3 =', round(27*Vm/78.11,2), 'ppb')
print('At 30 C (simulated ambient): CO 100 mg/m3 =', round(100*24.86/28.01,1), 'ppm')
def K(c, key): return d[c]['K'][key]
duty = (0.45, 0.65)
print('\n-- One red contribution: window/T --')
for c, key, w in [('S5-12','d=0.5 h=0.7 dx=0.0',60),('S4-S5-12','d=0.5 h=0.7 dx=0.0',60),('S1-from','d=0.5 h=0.7 dx=0.0',90),('S4-S1-from','d=0.5 h=0.7 dx=0.0',90)]:
    m = K(c,key)['CO_mean']; b = K(c,key)['BZ_mean_ppb']
    print(c, key, f'window {w}s: CO to 15-min P50 {m["P50"]*w/900:.1f} P95 {m["P95"]*w/900:.1f} ppm; benzene to 1-h P50 {b["P50"]*w/3600:.2f} P95 {b["P95"]*w/3600:.2f} ppb (OEHHA 8.5)')
print('\n-- Stay-through (every red, duty 0.45-0.65), held conditions; NOT a pedestrian case --')
for c, key in [('S1-from','d=0.5 h=0.7 dx=0.0'),('S1-from','d=1.0 h=1.1 dx=0.0'),('S4-S1-from','d=0.5 h=0.7 dx=0.0'),('S5-12','d=0.5 h=0.7 dx=0.0'),('S4-S5-12','d=0.5 h=0.7 dx=0.0')]:
    m = K(c,key)['CO_mean']; b = K(c,key)['BZ_mean_ppb']
    print(c, key, 'CO 1-h P50 %.1f-%.1f (vs WHO/TW 31, OEHHA 20)' % (m['P50']*duty[0], m['P50']*duty[1]),
          '| benzene 1-h P50 %.1f-%.1f P95 %.0f-%.0f ppb (vs OEHHA 8.5)' % (b['P50']*duty[0], b['P50']*duty[1], b['P95']*duty[0], b['P95']*duty[1]))
kl = d['S1-from']['KL']
for k,v in kl.items():
    if 'h=0.7' in k: print('S1-from kerb-line max h0.7 mean', v['CO_mean'], '-> stay-through P50', round(v['CO_mean']['P50']*duty[0],1), '-', round(v['CO_mean']['P50']*duty[1],1), 'ppm')
print('\n-- THC highest 1 s at K 0.5 m vs vapour odour threshold 0.47-0.58 ppm --')
for nC in (4.5, 5, 6): print(f'  as ppmC at C{nC}: {0.47*nC:.2f}-{0.58*nC:.2f}')
for c in ['S1','S2','S5-12','S1-from','A']:
    vals = [(k, v['THC_max1s_ppmC']['P50']) for k,v in d[c]['K'].items() if k.startswith('d=0.5') and 'dx=0.0' in k and 'THC_max1s_ppmC' in v]
    print(c, vals)
print('\n-- Odour: P50 highest-1-s OU and share>=1 at K 0.5 m dx=0 --')
for c in ['S1','S2','S5-12','S1-from']:
    for h in ('0.7','1.1','1.5'):
        v = d[c]['K'].get(f'd=0.5 h={h} dx=0.0')
        if v: print(c, h, 'OU6800', v['OU_max1s_DT6800']['P50'], 'hcx1', v.get('OU_max1s_DT6800_hcx1',{}).get('P50'), 'OU800', v['OU_max1s_DT800']['P50'], 'share>=1 (6800)', v['OU_share_ge1_DT6800']['P50'], '(800)', v['OU_share_ge1_DT800']['P50'])
print('\n-- Acetaldehyde-only cross-check of exhaust D/T (assumption-laden) --')
# raw THC 367-526 ppm hexane-equiv (inputs-simulation); aldehydes 0.5-3 % of VOC mass; acetaldehyde 20-30 % of aldehydes (ASSUMPTION)
for thc in (367, 526):
    mg = thc*86.18/Vm  # mg/m3
    for fa in (0.005, 0.03):
        for fac in (0.2, 0.3):
            ppm = mg*fa*fac*Vm/44.05
            print(f'  THC {thc} ppm hex, ald {fa:.1%}, acetald {fac:.0%}: acetaldehyde {ppm:.2f} ppm raw -> D/T {ppm/0.0015:.0f} (Nagata 1.5 ppb)')
