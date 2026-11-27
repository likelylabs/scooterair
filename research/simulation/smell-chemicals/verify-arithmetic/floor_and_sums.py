"""(a) floor: in a smellable second benzene >= (benzene per odour unit of the mixture); for one tailpipe this is
exactly the draw's just-detectable benzene. Compare the published low ends (P5 / flow-and-grid factor) with that floor.
(b) sum of single-chemical THC shares under independent triangular draws."""
import json, numpy as np
D = json.load(open('draws_NF1-fine.json')); mdot = 0.00055
g = [d['g']['s_head'] for d in D['draws']]
F10 = np.array([x['F_hc10'] for x in g]); BZ = np.array([x['BZ'] for x in g]) * 1e-9
fl = {DT: 120 / (F10 * DT) * BZ / mdot * 28.96 / 78.11 * 1e9 for DT in (800, 6800)}
for DT in (800, 6800):
    print('floor DT', DT, 'P1/P5/P50', np.percentile(fl[DT], [1, 5, 50]).round(2), 'min', fl[DT].min().round(3))
spec = json.load(open('../speciation.json'))
rng = np.random.default_rng(7); n = 200000
keys = [c for c in spec['chemicals'] if c['basis'] == 'THC' and c['key'] != 'benzene_researcher']
S = {c['key']: rng.triangular(c['low'], c['central'], c['high'], n) for c in keys}
tot = sum(S.values()); aro = sum(S[k] for k in ('benzene', 'toluene', 'ethylbenzene', 'xylenes', 'styrene', 'naphthalene'))
print('THC share sum: max-possible %.1f  P50 %.1f  P99.9 %.1f  max %.1f' % (sum(c['high'] for c in keys), np.median(tot), np.percentile(tot, 99.9), tot.max()))
print('aromatics: max-possible %.1f  P50 %.1f  P(>50%%) %.4f  max %.1f' % (sum(c['high'] for c in keys if c['key'] in ('benzene','toluene','ethylbenzene','xylenes','styrene','naphthalene')), np.median(aro), (aro > 50).mean(), aro.max()))
