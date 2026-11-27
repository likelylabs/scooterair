// Emission draws for the CFD post-processing, taken from the published estimate's own distributions
// (research/estimate/model.mjs: INPUTS, drawScooter; unchanged). One draw = one parameter set P (system
// uncertainty, e.g. fleet idle fuel flow) plus one drawScooter() per tailpipe in the case.
//
// Usage: node draws.mjs CASE_META.json N SEED MODE > draws.json
//   MODE fleet        every scooter from the fleet distribution
//        nearestHigh  headline (nearest kerb-lane) scooter forced to 6.5 % CO and HC-high (5,800 ppm-class) (PLAN S4)
//        nearest2s    headline scooter forced to a two-stroke (HC-high, two-stroke benzene share)
//        packHigh     every scooter drawn from the inspection tail >= 3 % CO (upper-bound pack, not a likelihood case)
// Output per draw: per tracer group the MEAN over its tailpipes of CO mg/s, THC mg/s (as CH1.85), benzene ug/s,
// fuel g/h, HC-high share, fuel x (10 if HC-high else 1) (odour weighting); plus background CO ppm and benzene ppb for totals, and the headline scooter's raw CO %.
import { readFileSync } from 'node:fs';
import { INPUTS, makeRng, drawScooter } from '../estimate/model.mjs';

const [, , metaPath, nStr = '1000', seedStr = '20261127', mode = 'fleet'] = process.argv;
const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
const N = +nStr, R = makeRng(+seedStr);
const Z95 = 1.6448536;
// same as model.mjs draw() (not exported there)
function draw(p) {
  switch (p.dist) {
    case 'fix': return p.central;
    case 'u': return p.low + (p.high - p.low) * R.rand();
    case 'ln': return p.central * Math.exp((Math.log(p.high / p.low) / 2 / Z95) * R.randn());
    case 'tri': { const a = p.low, c = p.central, b = p.high, u = R.rand(), f = (c - a) / (b - a);
      return u < f ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c)); }
    default: throw new Error('dist ' + p.dist);
  }
}
const drawAll = () => { const o = {}; for (const k in INPUTS) o[k] = draw(INPUTS[k]); return o; };

// forced scooter: same carbon-balance formulas as drawScooter, with a set CO % and HC-high / two-stroke status
function forced(P, coPct, twoStroke) {
  const F = P.fuelFlow_gph * Math.exp(P.fuelScatter_sd * R.randn() - P.fuelScatter_sd ** 2 / 2);
  const S = Math.max(P.carbonSum_pct, coPct + 3);
  const coPerFuel = (P.carbonFrac / 12.011) * (coPct / S) * 28.01;
  const thc = P.hcHighPerFuel;
  const bzFrac = twoStroke ? P.benzeneFrac2s : P.benzeneFracTHC;
  return { CO: F * coPerFuel / 3.6, THC: F * thc / 3.6, BZ: F * thc * bzFrac * 1e3 / 3.6, coPct, F, hcHigh: true };
}

const groups = meta.tracers;
const out = { mode, n: N, seed: +seedStr, groups, nPerGroup: {}, draws: [] };
for (const g of groups) out.nPerGroup[g] = meta.pipes.filter(p => p.tracer === g).length;
for (let i = 0; i < N; i++) {
  const P = drawAll();
  const acc = {}; for (const g of groups) acc[g] = { CO: 0, THC: 0, BZ: 0, F: 0, hcHigh: 0, coPct: 0, F_hc10: 0 };
  for (const p of meta.pipes) {
    let e;
    const head = p.tracer === 's_head';
    if (head && mode === 'nearestHigh') e = forced(P, 6.5, false);
    else if (head && mode === 'nearest2s') e = forced(P, Math.min(9.5, 3 + 3 * R.rand()), true);
    else if (mode === 'packHigh') { do { e = drawScooter(P, R); } while (e.coPct < 3); }
    else e = drawScooter(P, R);
    const hc = e.hcHigh !== undefined ? e.hcHigh : (e.THC / e.F * 3.6 >= P.hcHighPerFuel * 0.999);
    const a = acc[p.tracer], n = out.nPerGroup[p.tracer];
    a.CO += e.CO / n; a.THC += e.THC / n; a.BZ += e.BZ / n; a.F += e.F / n; a.hcHigh += (hc ? 1 : 0) / n; a.coPct += e.coPct / n; a.F_hc10 += e.F * (hc ? 10 : 1) / n;
  }
  out.draws.push({ g: acc, bgCO: P.bgCO_ppm, bgBZ: P.bgBenzene_ppb, fleetFuel: P.fuelFlow_gph });
}
process.stdout.write(JSON.stringify(out));
