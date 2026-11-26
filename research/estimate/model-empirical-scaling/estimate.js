#!/usr/bin/env node
// ScooterAir red-light kerb exposure: EMPIRICAL SCALING estimate (no dispersion model).
// Key: model-empirical-scaling.  Run:  node estimate.js   (no dependencies)
//
// Idea in one line: take the only measured Taiwanese kerb CO at pedestrian waiting zones
// (MOTC IOT, Kaohsiung, July 2024, 1-min micro-sensors at 1.2-1.5 m), express the measured
// excess over the nearby station as "ppm per queued scooter", rescale it to three queue sizes,
// correct for (i) "typical red" versus the 48-h maximum minute, (ii) 90-s mean versus the
// loaded minute, (iii) standing at the kerb beside the stop box versus the sensor spot,
// (iv) low-cost sensor gain; then get the other species from ratios to CO.
// Everything printed is an INCREMENT above the urban station level unless labelled TOTAL.
'use strict';

// ---------------------------------------------------------------------------------------
// INPUT TABLE.  dist: 'ln' = lognormal from median and 90% interval [lo,hi];
//                     'u'  = uniform [lo,hi];  'tri' = triangular (lo, mode, hi); 'fix' = constant
// v = verified (opened by me or by the sister input agent with the figure found in the source),
// s = secondary, A = assumption (labelled, with basis).
// ---------------------------------------------------------------------------------------
const IOT = 'Hung P-Y et al., MOTC Institute of Transportation, IOT-113-TB006 (Dec 2025), https://www.iot.gov.tw/uploads/column_entry_file/file/697879c4085777f955e15ddf/ (PDF read in full text)';
const INPUTS = {
  // --- Anchor sites (IOT 2024 waiting-zone CO, 1-min maximum over 48 h) -------------------
  // kerbMax: the maximum stated in the text, sec 3.3.2 pp.3-60..3-65.
  // bg: concurrent nearby station hourly range (sec 3.2.1 p.3-44; and 3.3.2 text) -> sampled uniform.
  // Vpk: peak-hour motorcycles per hour, whole junction = motorcycle "PM2.5-weighted" peak value / 0.025
  //      (0.025 = 149.35 / 5974.21, the report's own 12-h figures; my arithmetic) sec 3.1.2 pp.3-8..3-13.
  anchors: [
    { name: 'Mingcheng 1st/Minzu 1st (Kaohsiung)', kerbMax: 1.3, bg: [0.10, 0.50], Vpk: [8194, 9572], w: 0.40,
      note: 'max ~1.3 ppm 11 Jul after crosswalk setback; Aiguo station 8-11 Jul hourly 0.08-0.52; peak mc/h 204.85/0.025 am, 239.31/0.025 pm; 12-h mean 5,974/h (62% motorcycles)' , v: 'v' },
    { name: 'Qixian 1st/Minzu 2nd (Kaohsiung)', kerbMax: 0.62, bg: [0.05, 0.45], Vpk: [6138, 6338], w: 0.25,
      note: 'max 0.62 ppm ~08:00 5 Jul; Aiguo 1-5 Jul hourly 0.03-0.28 (sec 3.2.1) but text of 3.3.2 says station figure mostly 0.4-1 ppm, so bg sampled 0.05-0.45', v: 'v' },
    { name: 'Zhongzheng 2nd/Minzu 2nd (Kaohsiung)', kerbMax: 0.50, bg: [0.05, 0.45], Vpk: [5875, 6431], w: 0.20,
      note: 'max 0.5 ppm 08:00 3 Jul; same station caveat', v: 'v' },
    { name: 'HSR Rd/Chongxin Rd (Kaohsiung, quiet)', kerbMax: 0.50, bg: [0.15, 0.45], Vpk: [1620, 1640], w: 0.15,
      note: 'max 0.5 ppm 19:13 5 Jul; Zuoying hourly 0.09-0.56 (max 0.55 at 08:00 same day)', v: 'v' },
  ],
  approachShare: { dist: 'u', lo: 0.20, hi: 0.35, unit: '-', src: 'A: share of junction motorcycles on the approach whose queue sits beside the sensor/pedestrian; 4-arm junction, main road somewhat above 1/4', v: 'A' },
  redAnchor: { dist: 'tri', lo: 70, mode: 83, hi: 110, unit: 's', src: IOT + ' Table 2.2.4-2 (main-road red ~80-83 s, other approaches 95-130 s; phase assignment inferred by scene agent)', v: 's' },
  floorDelta: { dist: 'fix', val: 0.02, unit: 'ppm', src: 'A: minimum excess used when station bg ~ kerb max (sensor noise floor order 0.02-0.05 ppm)', v: 'A' },
  // --- Shape of the scaling ----------------------------------------------------------------
  b: { dist: 'u', lo: 0.6, hi: 1.0, unit: '-', src: 'A: C proportional to N^b; b<1 because scooters further back in a long queue contribute less. Anchors span N~10-60 and do not pin b', v: 'A' },
  // --- Adjustments -----------------------------------------------------------------------------
  fTyp: { dist: 'ln', med: 0.5, lo: 0.3, hi: 0.85, unit: '-', src: 'A: typical peak-hour red / 48-h maximum minute. Basis: the max is the top of ~100 peak-hour reds over two days; 1-min kerb CO variability GSD ~1.5-2 gives max/median ~2-4 (assumption; no IOT percentile data in text)', v: 'A' },
  a90: { dist: 'tri', lo: 0.55, mode: 0.77, hi: 1.0, unit: '-', src: 'A: 90-s red mean / most-loaded 1-min. Uniform arrivals and C~N(t)^b give 0.77 at b=0.85 (my arithmetic); 1.0 if queue is full from the start; 0.55 if the IOT maximum minute was a green pull-away', v: 'A' },
  prox: { dist: 'ln', med: 1.3, lo: 1.0, hi: 2.2, unit: '-', src: 'Standing at the kerb edge beside the stop box vs IOT sensor 1.0-1.5 m from the crosswalk line: exp(k*dd), k 0.02-0.4 /m (Kenagy et al. 2016 AQAH 9:589, NO2, verified by sister agent), dd 0.5-2 m (A)', v: 'A' },
  sensorGain: { dist: 'ln', med: 1.0, lo: 0.75, hi: 1.6, unit: '-', src: 'A: true/indicated for low-cost electrochemical CO near 0.5 ppm (calibrated at ITRI per IOT; error not stated). Skewed high because 1-min sampling and sensor response (t90 tens of s) clip short peaks', v: 'A' },
  // --- ROUTE B: reference-grade traffic stations scaled to the kerb at a red light -----------------
  dTS: { dist: 'u', lo: 0.20, hi: 0.40, unit: 'ppm', src: 'traffic-station minus urban-station annual mean CO: MOENV 2025 0.54 - 0.24 = 0.30 (Table 3-23, verified); Taipei City 2024 traffic 0.80 - general 0.49 = 0.31 (gap-answers-c, verified by that agent); Horiba-class analysers', v: 'v' },
  pkB: { dist: 'ln', med: 2.0, lo: 1.3, hi: 3.5, unit: '-', src: 'A: weekday peak-hour / annual-mean road increment. Basis: Ting 2023 Taipei tunnel weekday peak ~6,500 veh/h vs 40,500/day (3.8x the 24-h mean flow, verified in repo extraction), damped by better daytime mixing', v: 'A' },
  hgtB: { dist: 'ln', med: 1.25, lo: 1.0, hi: 1.6, unit: '-', src: 'A: 1.2-1.5 m breathing height vs station inlet (heights not obtained, typically several m). Basis: Goel & Kumar 2016, particle number ~40% lower at 4.7 m than near ground at a junction (repo, secondary)', v: 'A' },
  isecB: { dist: 'ln', med: 1.5, lo: 1.0, hi: 2.5, unit: '-', src: 'A: beside the stop box during a red vs a station a few m back from a mid-block kerb. Basis: exp(k*dd), k 0.02-0.4 /m (Kenagy 2016), dd 1-4 m; upper end bounded by red/green UFP 3.5x (Wang 2008 JAWMA 58:1449, abstract)', v: 'A' },
  NrefB: { dist: 'ln', med: 35, lo: 22, hi: 50, unit: 'scooters', src: 'A: traffic stations treated as a typical busy arterial (same N as the typical scenario); station traffic counts not obtained', v: 'A' },
  wA: { dist: 'fix', val: 0.5, unit: '-', src: 'A: mixture weight of route A (IOT kerb sensors) vs route B (stations). Equal: A is at the right spot but low-cost and implausibly low against B and Hanoi; B is reference-grade but needs three assumed factors', v: 'A' },
  // --- Ratios to CO (mass/mass) for the other species ----------------------------------------
  rBenz: { dist: 'ln', med: 0.0035, lo: 0.001, hi: 0.010, unit: 'g/g', src: 'benzene/CO mass. inputs-emission-rates.json 0.07/21 g/h = 0.33% (Yao et al. 2008 Atmos Environ 42:6560 benzene ~3% of THC, verified); inputs-speciation-particles.json 0.5% (0.06-1.0%); low ~0.085% = Taiwan inventory benzene 0.77% of MC HC (Tsai 2023, secondary) x HC/CO 0.11', v: 's' },
  rTHC: { dist: 'ln', med: 0.12, lo: 0.04, hi: 0.33, unit: 'g/g', src: 'THC/CO mass: 2.4/21 = 0.11 (emission-rates file, Yilan inspection + bench); 10.3/60.9 = 0.17 Hanoi lab (Nguyen 2021 abstract); Tsai 2018 cycle 0.25-0.35 (abstract); NDIR basis of inspection HC unverified', v: 's' },
  rPNscoot: { dist: 'ln', med: 2e11, lo: 1e10, hi: 6e11, unit: '#/g CO', src: 'solid PN(>23 nm)/CO for scooter exhaust: 5.2e13 #/kg fuel (Kontses 2020 Environ Res 182:109071 WMTC per-km x 46.9 km/kg) / 250 g CO/kg; inputs-speciation-particles.json (weakest ratio). hi raised from 3e11 to 6e11 to cover sub-23 nm (+25-67%, Kontses) and 2% two-strokes (~10x PN)', v: 's' },
  rPNamb: { dist: 'ln', med: 5e4, lo: 2.5e4, hi: 1e5, unit: '#/cm3 per ppm CO', src: 'Taiwan ambient all-traffic ratio: (roadside 25,000-38,000 [Abdillah 2024 AAQR, abstract only] - Taipei background 13,900 [Cheung 2013 ACP 13:8935, verified]) / (traffic-station CO 0.54 - general 0.24 = 0.30 ppm [MOENV 2025 annual report Table 3-23, verified]) = 3.7e4-8e4; widened', v: 's' },
  rPMscoot: { dist: 'ln', med: 0.001, lo: 0.0001, hi: 0.008, unit: 'g/g', src: 'PM2.5/CO mass, scooter exhaust: Nepal idle 0.089-1.14% (Jayarathne 2018 ACP 18:2259, old carburetted, oil-dominated, verified); Ting 2023 Taipei tunnel MC 0.013 g/kg / 209 g/kg = 0.006% (driving, uncertainty 10x value); speciation central 0.3/250 = 0.12%', v: 's' },
  rPMamb: { dist: 'ln', med: 6.7, lo: 3, hi: 12, unit: 'ug/m3 per ppm CO', src: 'Taiwan ambient all-traffic ratio: PM2.5 traffic stations 15.4 - all stations 13.4 = 2.0 ug/m3 over 0.30 ppm CO (MOENV 2025 annual report, verified by scene agent); includes diesel, non-exhaust, siting', v: 's' },
  // --- Background for totals ------------------------------------------------------------------
  bgCO: { dist: 'u', lo: 0.24, hi: 0.60, unit: 'ppm', src: 'MOENV 2025 annual means: general 0.24, traffic stations 0.54 (2024 0.61); peak-hour Kaohsiung station hourly 0.03-0.90 (IOT). Verified', v: 'v' },
  bgBenz: { dist: 'ln', med: 2.5, lo: 1.2, hi: 4.5, unit: 'ppb', src: 'Taipei ambient benzene 2.54 ppb (Wu et al. 2021 TRD 91:102696, repo extraction, secondary)', v: 's' },
  bgPN: { dist: 'ln', med: 13900, lo: 7000, hi: 25000, unit: '#/cm3', src: 'Taipei urban background 13,900 (Cheung et al. 2013, verified); 7,000 cyclonic period; 25,000 lower end of Taiwan roadside', v: 'v' },
  bgPM: { dist: 'ln', med: 13.4, lo: 6, hi: 30, unit: 'ug/m3', src: 'MOENV 2025 annual mean PM2.5 13.4 all stations; IOT kerb summer 4-14; winter episodes higher', v: 'v' },
};

// Scenarios: end-of-red queue of scooters (all lanes) on the approach beside the pedestrian.
// This is the SAME definition used to normalise the anchors, so the scaling is like-for-like.
const SCENARIOS = [
  { key: 'light', label: 'Light: a handful of scooters (quiet junction)', N: { dist: 'ln', med: 5, lo: 3, hi: 9 },
    src: 'IOT quiet junction 819 mc/h 12-h mean, peak 1,620/h -> 3-10 per approach per 83 s red' },
  { key: 'typical', label: 'Typical busy arterial (peak hour)', N: { dist: 'ln', med: 35, lo: 22, hi: 50 },
    src: 'IOT busy Kaohsiung junctions 3,989-5,974 mc/h (12-h mean), 5,875-9,572 peak -> 25-60 per approach per red; gap-answers-a 30-37' },
  { key: 'heavy', label: 'Heavy: full stop box, oversaturated approach', N: { dist: 'ln', med: 70, lo: 50, hi: 103 },
    src: 'Lan & Chang 2015 IEEE T-ITS Table V: 103 queued at one red on a 4-lane approach (16 in the box); Mingcheng pm peak 9,572/h -> ~60' },
];

// ---------------------------------------------------------------------------------------
// Constants (25 C, 1 atm; molar volume 24.45 L)
const MW = { CO: 28.01, benz: 78.11, C: 13.86 /* CH1.85 per carbon */ };
const VM = 24.45;
const ppm2mg = (ppm, mw) => ppm * mw / VM;               // mg/m3
const NSIM = 200000;

// Seeded PRNG (mulberry32) + normal
let seed = 20261126;
function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
function randn() { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const Z95 = 1.6449;
function draw(p) {
  switch (p.dist) {
    case 'fix': return p.val;
    case 'u': return p.lo + (p.hi - p.lo) * rnd();
    case 'tri': { const u = rnd(), c = (p.mode - p.lo) / (p.hi - p.lo);
      return u < c ? p.lo + Math.sqrt(u * (p.hi - p.lo) * (p.mode - p.lo)) : p.hi - Math.sqrt((1 - u) * (p.hi - p.lo) * (p.hi - p.mode)); }
    case 'ln': { const s = (Math.log(p.hi) - Math.log(p.lo)) / (2 * Z95); // 90% interval [lo,hi]
      return Math.exp(Math.log(p.med) + s * randn()); }
    default: throw new Error('bad dist');
  }
}
const pct = (arr, q) => { const a = Float64Array.from(arr).sort(); const i = (a.length - 1) * q; const lo = Math.floor(i);
  return a[lo] + (a[Math.min(lo + 1, a.length - 1)] - a[lo]) * (i - lo); };
const fmt = x => { const ax = Math.abs(x); if (ax === 0) return '0';
  if (ax >= 1e4 || ax < 1e-2) return x.toExponential(1); if (ax >= 100) return x.toFixed(0); if (ax >= 10) return x.toFixed(1);
  if (ax >= 1) return x.toFixed(2); return x.toFixed(3); };
const P3 = a => [pct(a, 0.05), pct(a, 0.5), pct(a, 0.95)];
const line = (lab, a, unit) => { const [l, m, h] = P3(a); return `  ${lab.padEnd(46)} ${fmt(l).padStart(9)} ${fmt(m).padStart(9)} ${fmt(h).padStart(9)}  ${unit}`; };

// ---------------------------------------------------------------------------------------
// One Monte Carlo draw of the calibrated yield k (ppm at the 48-h max minute per N^b)
function drawYield(b, s, Tred, out) {
  let lnk = 0, wsum = 0;
  INPUTS.anchors.forEach((A, i) => {
    const bg = A.bg[0] + (A.bg[1] - A.bg[0]) * rnd();
    const d = Math.max(A.kerbMax - bg, INPUTS.floorDelta.val);
    const V = A.Vpk[0] + (A.Vpk[1] - A.Vpk[0]) * rnd();
    const N = V * s * Tred / 3600;                    // scooters queued at end of red on that approach
    const k = d / Math.pow(N, b);
    if (out) { out[i].d.push(d); out[i].N.push(N); out[i].k1.push(d / N); }
    lnk += A.w * Math.log(k); wsum += A.w;
  });
  return Math.exp(lnk / wsum);
}

const anchorDiag = INPUTS.anchors.map(() => ({ d: [], N: [], k1: [] }));
const res = {};
SCENARIOS.forEach(S => { res[S.key] = { coA: [], coB: [], N: [], co: [], coWorst: [], coMg: [], bz: [], bzug: [], thc: [], thcC: [], pnS: [], pnA: [], pmS: [], pmA: [],
  coTot: [], bzTot: [], pnTot: [], pmTot: [], dil: [], gps: [] }; });
const kAll = [];
const loo = INPUTS.anchors.map(() => []);   // leave-one-out predicted kerb max (incl. bg midpoint)

for (let it = 0; it < NSIM; it++) {
  const b = draw(INPUTS.b), s = draw(INPUTS.approachShare), Tred = draw(INPUTS.redAnchor);
  const k = drawYield(b, s, Tred, it < 50000 ? anchorDiag : null);
  kAll.push(k);
  // leave-one-out: recompute yield without anchor j and predict anchor j's max
  if (it < 20000) {
    INPUTS.anchors.forEach((Aj, j) => {
      let lnk = 0, ws = 0, Nj = 0;
      INPUTS.anchors.forEach((A, i) => { const bg = (A.bg[0] + A.bg[1]) / 2; const V = (A.Vpk[0] + A.Vpk[1]) / 2; const N = V * s * Tred / 3600;
        if (i === j) { Nj = N; return; } const d = Math.max(A.kerbMax - bg, 0.02); lnk += A.w * Math.log(d / Math.pow(N, b)); ws += A.w; });
      loo[j].push(Math.exp(lnk / ws) * Math.pow(Nj, b) + (Aj.bg[0] + Aj.bg[1]) / 2);
    });
  }
  const f = draw(INPUTS.fTyp), a = draw(INPUTS.a90), P = draw(INPUTS.prox), G = draw(INPUTS.sensorGain);
  const rB = draw(INPUTS.rBenz), rH = draw(INPUTS.rTHC), rPs = draw(INPUTS.rPNscoot), rPa = draw(INPUTS.rPNamb), rMs = draw(INPUTS.rPMscoot), rMa = draw(INPUTS.rPMamb);
  const dTSd = draw(INPUTS.dTS), pkBd = draw(INPUTS.pkB), hgtBd = draw(INPUTS.hgtB), isecBd = draw(INPUTS.isecB), NrefBd = draw(INPUTS.NrefB);
  const totalPNfactor = 1; // rPs already widened for sub-23 nm
  const bCO = draw(INPUTS.bgCO), bB = draw(INPUTS.bgBenz), bP = draw(INPUTS.bgPN), bM = draw(INPUTS.bgPM);
  SCENARIOS.forEach(S => {
    const R = res[S.key];
    const N = draw(S.N);
    const coMax = k * Math.pow(N, b);                 // 48-h-max-minute equivalent at the sensor spot
    const coA = coMax * f * a * P * G;                // ROUTE A: typical red, 90-s mean, at the kerb beside the box (ppm)
    const coB = dTSd * pkBd * hgtBd * isecBd * Math.pow(N / NrefBd, b); // ROUTE B
    const useA = rnd() < INPUTS.wA.val;
    const co = useA ? coA : coB;                      // mixture
    const coW = useA ? coMax * a * P * G : coB / f;   // "worst red of two days" (route B: same tail factor 1/f)
    R.coA.push(coA); R.coB.push(coB);
    const coMg = ppm2mg(co, MW.CO);                   // mg/m3
    const bzug = coMg * rB * 1000;                    // ug/m3
    const bz = bzug * VM / MW.benz;                   // ppb
    const thcug = coMg * rH * 1000;                   // ug/m3
    const thcC = thcug / MW.C * VM / 1000;            // ppmC (CH1.85 basis)
    const pnS = coMg * 1e-3 * rPs * totalPNfactor / 1e6; // #/cm3  (g/m3 * #/g / 1e6 cm3/m3)
    const pnA = co * rPa;                             // #/cm3
    const pmS = coMg * rMs * 1000;                    // ug/m3
    const pmA = co * rMa;                             // ug/m3
    R.N.push(N); R.co.push(co); R.coWorst.push(coW); R.coMg.push(coMg); R.bz.push(bz); R.bzug.push(bzug);
    R.thc.push(thcug); R.thcC.push(thcC); R.pnS.push(pnS); R.pnA.push(pnA); R.pmS.push(pmS); R.pmA.push(pmA);
    R.coTot.push(co + bCO); R.bzTot.push(bz + bB); R.pnTot.push(pnA + bP); R.pmTot.push(pmA + bM);
    // sanity: implied dilution of one scooter's raw exhaust (1.45% CO, Yilan phase-5 mean) if the
    // nearest ~min(N,12) scooters made the whole increment
    R.dil.push(14500 * Math.min(N, 12) / co);
    // sanity: implied effective ventilation flow Q/C (m3/s) for N scooters at 21 g/h (8-48)
    const q = draw({ dist: 'ln', med: 21, lo: 8, hi: 48 }) / 3600; // g/s per scooter
    R.gps.push(N * q / (coMg / 1000));
  });
}

// ---------------------------------------------------------------------------------------
console.log('ScooterAir kerb exposure, 90-s red light: EMPIRICAL SCALING (no dispersion model)');
console.log(`Monte Carlo draws: ${NSIM}. Percentiles shown: P5  P50  P95.  25 C, 1 atm.\n`);
console.log('INPUT TABLE');
for (const [key, p] of Object.entries(INPUTS)) {
  if (key === 'anchors') { p.forEach(A => console.log(`  anchor  ${A.name}: kerb 1-min max ${A.kerbMax} ppm; station bg ${A.bg.join('-')}; peak mc/h ${A.Vpk.join('-')}; weight ${A.w} [${A.v}] ${A.note}`)); continue; }
  const r = p.dist === 'ln' ? `${p.med} (${p.lo}-${p.hi})` : p.dist === 'tri' ? `${p.mode} (${p.lo}-${p.hi})` : p.dist === 'u' ? `${p.lo}-${p.hi}` : `${p.val}`;
  console.log(`  ${key.padEnd(13)} ${p.dist.padEnd(3)} ${r} ${p.unit} [${p.v}] ${p.src}`);
}
SCENARIOS.forEach(S => console.log(`  scenario ${S.key.padEnd(8)} N(end-of-red queue on approach) ${S.N.med} (${S.N.lo}-${S.N.hi}); ${S.src}`));

console.log('\nCALIBRATION FROM IOT ANCHORS (first 50,000 draws)');
INPUTS.anchors.forEach((A, i) => { const D = anchorDiag[i];
  console.log(line(`${A.name.slice(0, 30)} excess`, D.d, 'ppm')); console.log(line('   queued scooters N on approach', D.N, 'scooters'));
  console.log(line('   ppm per queued scooter (b=1)', D.k1, 'ppm/scooter')); });
console.log(line('pooled yield k (ppm per N^b, at max minute)', kAll, 'ppm/N^b'));

console.log('\nRESULTS: INCREMENT above urban station level, person at the kerb beside the stop box, 1.2-1.5 m height, mean over a 90-s red');
SCENARIOS.forEach(S => { const R = res[S.key];
  console.log(`\n[${S.label}]`);
  console.log(line('queued scooters on the approach (input)', R.N, 'scooters'));
  console.log(line('CO route A only (IOT kerb sensors)', R.coA, 'ppm'));
  console.log(line('CO route B only (traffic stations scaled)', R.coB, 'ppm'));
  console.log(line('CO, typical red (A/B mixture)', R.co, 'ppm'));
  console.log(line('CO, typical red', R.coMg, 'mg/m3'));
  console.log(line('CO, worst red of two days (f=1)', R.coWorst, 'ppm'));
  console.log(line('benzene', R.bzug, 'ug/m3'));
  console.log(line('benzene', R.bz, 'ppb'));
  console.log(line('total hydrocarbons (low confidence)', R.thc, 'ug/m3'));
  console.log(line('total hydrocarbons (CH1.85 basis)', R.thcC, 'ppmC'));
  console.log(line('UFP number: all local traffic (ambient ratio)', R.pnA, '#/cm3'));
  console.log(line('UFP number: scooter exhaust only (emis. ratio)', R.pnS, '#/cm3'));
  console.log(line('PM2.5: all local traffic (ambient ratio)', R.pmA, 'ug/m3'));
  console.log(line('PM2.5: scooter exhaust only (emis. ratio)', R.pmS, 'ug/m3'));
  console.log('  TOTALS (increment + urban background)');
  console.log(line('CO total', R.coTot, 'ppm'));
  console.log(line('benzene total', R.bzTot, 'ppb'));
  console.log(line('UFP number total (all-traffic route)', R.pnTot, '#/cm3'));
  console.log(line('PM2.5 total (all-traffic route)', R.pmTot, 'ug/m3'));
  console.log('  SANITY');
  console.log(line('implied dilution of raw exhaust (nearest<=12)', R.dil, 'x'));
  console.log(line('implied ventilation flow Q/C', R.gps, 'm3/s'));
});

console.log('\nVALIDATION');
INPUTS.anchors.forEach((A, j) => { const [l, m, h] = P3(loo[j]);
  console.log(`  leave-one-out: ${A.name.padEnd(40)} observed max ${A.kerbMax} ppm; predicted ${fmt(m)} (${fmt(l)}-${fmt(h)}) ppm  ratio ${fmt(m / A.kerbMax)}`); });
// Hanoi cross-check
{ const hanoi = []; for (let i = 0; i < 50000; i++) { const walk = 5.1 + (8.5 - 5.1) * rnd(); const bg = 1 + rnd(); const ef = 2.0 + 2.0 * rnd(); hanoi.push((walk - bg) / ef); }
  const [l, m, h] = P3(hanoi);
  console.log(`  Hanoi 2006 walking CO (GM 5.1, mean 8.5 ppm; bg 1-2 A) / fleet CO-per-km ratio 2-4 (Vietnam 12.09 vs Taiwan MC 4.33 g/km = 2.8): Taiwan-equivalent along-road increment ${fmt(m)} (${fmt(l)}-${fmt(h)}) ppm`); }
console.log('  Box model like-for-like: its 8 scooters are those within ~10 m, i.e. the front of a typical queue; compare with typical-scenario worst red above');
console.log('  MOENV traffic-station annual-mean road increment: 0.54 - 0.24 = 0.30 ppm (station inlet several m up / back from the kerb)');
console.log('  Near-field box model (inputs-near-field-dispersion.json): 3 (1-13) ppm for 8 scooters, 21 g/h, U 0.8 m/s, H 2 m, ell 7 m');
{ const nf = []; for (let i = 0; i < 50000; i++) { const b = draw(INPUTS.b), s = draw(INPUTS.approachShare), T = draw(INPUTS.redAnchor); const k = drawYield(b, s, T, null);
  nf.push(k * Math.pow(8, b) * draw(INPUTS.fTyp) * draw(INPUTS.a90) * draw(INPUTS.prox) * draw(INPUTS.sensorGain)); }
  const [l, m, h] = P3(nf); console.log(`  route A for 8 queued scooters: ${fmt(m)} (${fmt(l)}-${fmt(h)}) ppm  -> box model / this = ${fmt(3 / m)}`); }
console.log('  Raw exhaust: 1.45% CO = 14,500 ppm (Yilan phase-5 mean). Moving-car tailpipe->3 m dilution ~6,000 (Wang 2015 AMT 8:3263): one direct plume hit = ~2.4 ppm instantaneous.');

console.log('  Other species vs measured anchors (typical scenario, increments; see methods note):');
{ const R = res.typical; const [bl, bm, bh] = P3(R.bz), [ul, um, uh] = P3(R.pnTot), [ml, mm, mh] = P3(R.pmA);
  console.log(`    benzene +${fmt(bm)} (${fmt(bl)}-${fmt(bh)}) ppb  vs Taipei scooter-lane commuters +1.7 ppb over ambient (Wu 2021, secondary); Bangkok kerb 2-3 ppb total; Hanoi roadside 12.8 ppb total`);
  console.log(`    UFP total ${fmt(um)} (${fmt(ul)}-${fmt(uh)}) /cm3  vs Taiwan roadside 25,000-38,000 (abstract); Corpus Christi junction mean 66,000; UK pull-away peaks 70,000-540,000`);
  console.log(`    PM2.5 +${fmt(mm)} (${fmt(ml)}-${fmt(mh)}) ug/m3  vs IOT kerb 4-14 total (no visible traffic signal); NTU thesis stopped 14.2 vs moving 12.5 (+1.7)`); }
console.log('\nDIMENSIONAL / UNIT CHECKS');
console.log(`  1 ppm CO = ${ppm2mg(1, MW.CO).toFixed(3)} mg/m3 (WHO uses 1.165 at 20 C); 1 ppb benzene = ${(MW.benz / VM).toFixed(3)} ug/m3`);
console.log(`  PN: 0.5 ppm CO = ${(ppm2mg(0.5, MW.CO) / 1000).toExponential(2)} g/m3 x 2e11 #/g = ${(ppm2mg(0.5, MW.CO) / 1000 * 2e11 / 1e6).toFixed(0)} #/cm3 (scooter solid PN route)`);
console.log('  Mass balance: plausible junction ventilation U*W*H = (0.3-2 m/s)*(20-60 m)*(5-20 m) = 30-2,400 m3/s; implied Q/C above should fall inside');
console.log(`  Per red, typical: ${fmt(pct(res.typical.N, 0.5))} scooters x 0.54 g CO (0.2-1.2) = ${fmt(pct(res.typical.N, 0.5) * 0.54)} g CO emitted beside the pedestrian`);
console.log('\nBUILD-UP ACROSS THE RED (SCHEMATIC, from the arrival assumption only; NOT calibrated by any time-resolved measurement)');
{ const b = 0.8; const out = []; for (let t = 0; t <= 90; t += 15) out.push(`${t}s:${(Math.pow(t / 90, b)).toFixed(2)}`);
  console.log('  C(t)/C(end of red), uniform arrivals, queue empty at onset, b=0.8: ' + out.join('  '));
  console.log('  mean over red / end-of-red = 1/(1+b) = ' + (1 / (1 + b)).toFixed(2) + '; plus a pull-away spike at green (not quantified: no scooter modal data).'); }

console.log('\nREFERENCE VALUES (for comparison only; averaging times differ)');
console.log('  CO: WHO 15-min 100 mg/m3 (87 ppm), 1-h 35 mg/m3 (31 ppm); Taiwan 1-h 31 ppm (amended 2024-09-30)');
console.log('  Benzene 1-h: TCEQ ESL 170 ug/m3 (54 ppb); OEHHA acute REL 27 ug/m3 (secondary)');
console.log('  UFP: WHO good practice "high" >20,000 /cm3 (1-h), >10,000 (24-h)');
console.log('  PM2.5: WHO 24-h 15 ug/m3; Taiwan 24-h 30 ug/m3 (a 90-s increment is not comparable to these)');
