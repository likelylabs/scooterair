// ScooterAir / 行人呼吸 — kerbside exposure beside idling scooters during one 90-s red light.
// METHOD OF RECORD (signed estimate, 2026-11-26). This is an ESTIMATE (推估), not a measurement.
//
// Mechanistic source-and-dispersion Monte Carlo, derived from model-source-dispersion with the
// confirmed corrections from critic-physics and critic-inputs (see CORRECTIONS below and METHOD.md).
// Dependency-free ES module. Pure: estimate() uses its own seeded RNG and touches no global state.
//
//   node model.mjs            print the results (fast, n = 6000 per scenario)
//   node model.mjs --write    full run (n = 30000), also writes results.json next to this file
//
// Every output is an INCREMENT above urban background unless a field is named `total`.
//
// CORRECTIONS relative to model-source-dispersion (each confirmed by re-running the code):
//  C1 wind: the input wind is a SCALAR speed (derived from CWA scalar station means), so it is
//     AERMOD's effective speed u~ (EPA-454/B-26-003 eq 72): transport speed ue = max(U, sqrt2*sigma_v),
//     random-plume fraction fr = min(1, 2 sigma_v^2 / ue^2). The original added the turbulence twice.
//  C2 carbon balance denominator for diluted analyser readings: CO+CO2 = 11.5-12.5 % (Yilan 12.0-12.2 %).
//  C3 hydrocarbons: HC high emitters = two-strokes + 0.2-1 % four-strokes (MOENV 2025: 0.15 % of tests
//     fail HC); scooter-to-scooter THC scatter mean-corrected; uninspected new scooters x0.3-1 THC;
//     THC per g fuel moved toward the FID basis on which the benzene share was measured (central 0.025).
//  C4 benzene share of THC: triangular 1.2 / 2.7 / 5 % (Yao 2008 idle 2.5-3 %, Tsai 2018 cycle ~2-3 %);
//     two-strokes 1-3 % (unburnt fuel, Taiwan benzene cap 0.9 % v/v).
//  C5 particle number range widened to the source's own factor ~15 each way; still a LOWER BOUND
//     (volatile nucleation excluded) and NOT PUBLISHED as a number.
//  C6 benzene background re-sourced (Wu 2021's 2.54 ppb is a commuter median x 0.9, not ambient).
//  C7 fuel-flow P95 raised 180 -> 200 g/h (the Hanoi 180 g/h set implies ~210 g/h by its own carbon balance).

// ============================================================================================
// INPUT TABLE  (dist: ln = lognormal with median=central and low/high = P5/P95; u = uniform;
// tri = triangular low/mode/high; fix = fixed).  status: V verified in the source by this project,
// S secondary (abstract / extraction / search excerpt), A assumption (basis given), D derived.
// ============================================================================================
export const INPUTS = {
  // ---- emissions ----
  fuelFlow_gph: { dist: 'ln', low: 80, central: 120, high: 200, unit: 'g fuel/h per idling scooter (fleet-scale)', status: 'S/D',
    source: 'Nguyen et al. 2025 J Chin Inst Eng doi:10.1080/02533839.2025.2531199 (84-101 g/h, abstract); Nguyen et al. 2021 Int J Urban Sci doi:10.1080/12265934.2020.1871059 (180 g/h, abstract; its own carbon balance implies ~210 g/h); engine-physics 101-193 g/h' },
  fuelScatter_sd: { dist: 'fix', central: 0.20, unit: 'lognormal sigma, scooter-to-scooter', status: 'A', source: 'ASSUMPTION: 90-150 cc, 1500-1900 rpm idle spread' },
  moenvCObins: { dist: 'fix', status: 'V', unit: 'inspection tests per idle-CO bin (% CO)',
    central: [[0, 1, 6769973], [1, 2, 1042630], [2, 3, 650643], [3, 4, 342331], [4, 5, 121532], [5, 6, 57596], [6, 7, 35469], [7, 8, 21826], [8, 9, 12560], [9, 10, 12597]],
    source: 'MOENV 各縣市機車排氣定檢CO檢測值統計表 114年 (2025), national row, n = 9,067,160 tests; https://mobile.moenv.gov.tw/Motor/ReportNew/Unit_CO_Report.aspx?YearMonth=2025/12 (opened by critic-inputs and gap-answers-c). Per test incl. retests; scooters >= 5 y old only' },
  firstBinMean_pct: { dist: 'u', low: 0.3, high: 0.7, unit: '% CO, mean within the 0-1 % bin', status: 'A', source: 'ASSUMPTION (bin holds 75 % of tests; no finer split published)' },
  newShare: { dist: 'u', low: 0.25, high: 0.45, unit: 'share of idling kerb fleet < 5 y old (not inspected)', status: 'D/A', source: 'Phase 7 ~27 % of registered fleet (inputs-emission-rates.json); kerb fleet assumed newer' },
  newCO_pct: { dist: 'u', low: 0.05, high: 0.6, unit: '% CO at idle, new FI+catalyst scooter (then x0.5-1.5 per scooter)', status: 'A', source: 'ASSUMPTION: no Taiwanese reading; below 2.0 % in-use limit for 2017+ build (MOENV gazette 2023-06-30)' },
  newTHCscale: { dist: 'u', low: 0.3, high: 1.0, unit: 'THC multiplier for new scooters vs inspected fleet', status: 'A', source: 'ASSUMPTION (critic-inputs: new scooters were given clean CO but old-fleet THC)' },
  carbonSum_pct: { dist: 'u', low: 11.5, high: 12.5, unit: '% CO+CO2 in analyser sample', status: 'V', source: 'Cheng et al. 2017 Bull Coll Eng NIU 12:33-76, Yilan inspection means CO+CO2 12.0-12.2 % (via inputs-emission-rates.json)' },
  carbonFrac: { dist: 'fix', central: 0.86, unit: 'g C per g fuel', status: 'A', source: 'textbook gasoline 0.85-0.87' },
  thcPerFuel: { dist: 'ln', low: 0.008, central: 0.025, high: 0.06, unit: 'g THC per g fuel, ordinary four-stroke (FID-equivalent)', status: 'D/V/S',
    source: 'NDIR inspection route 0.006-0.027 (under-reads aromatics); Yao et al. 2008 Atmos Environ 42:6560 bench idle FID 0.040-0.043 (V); Hanoi lab 0.057 (abstract)' },
  thcScatter_sd: { dist: 'fix', central: 0.5, unit: 'lognormal sigma (mean-corrected)', status: 'A', source: 'ASSUMPTION' },
  hcHigh4sShare: { dist: 'u', low: 0.002, high: 0.01, unit: 'share of four-strokes that are HC high emitters', status: 'V/A', source: 'MOENV 2025 HC table: 12,280 HC failures in 8.29 M tests = 0.15 % (V, critic-inputs); up to 1 % allowed for uninspected/borderline (A)' },
  hcHighPerFuel: { dist: 'u', low: 0.10, high: 0.22, unit: 'g THC per g fuel, HC high emitter / two-stroke', status: 'D', source: 'carbon balance on 5,431 ppm two-stroke (Taipei Times 2018, S) and failed-HC mean 5,823 ppm (MOENV 2025, V) at 3-6 ppmC per ppm hexane' },
  benzeneFracTHC: { dist: 'tri', low: 0.012, central: 0.027, high: 0.05, unit: 'g benzene per g THC, four-stroke', status: 'V/S/A',
    source: 'Yao 2008 Table 1 idle benzene 764-918 mg/L vs THC 30-32 g/L = 2.5-3.0 % (V); Tsai et al. 2018 catalysed Taiwanese scooters ~2-3 % (chart reading, S); TEDS inventory 0.77 % (biased low: evaporative HC in denominator, S); Stockwell 2016 ACP 16:11043 one pre-service Nepali bike, BTEX-based (V, split assumed)' },
  benzeneFrac2s: { dist: 'u', low: 0.01, high: 0.03, unit: 'g benzene per g THC, two-stroke', status: 'A', source: 'ASSUMPTION: scavenged fuel; Taiwan gasoline benzene cap 0.9 % v/v (~1 % m/m)' },
  pnPerKgFuel: { dist: 'ln', low: 3.5e12, central: 5.2e13, high: 7.8e14, unit: 'solid particles > 23 nm per kg fuel', status: 'D/S',
    source: 'Kontses et al. 2020 Environ Res 182:109071 WMTC 2e11-3e12 /km (V) x 46.9 km/kg; idle factor ~15 each way (inputs-speciation-particles.json); Chien & Huang 2010 idle/30 km/h (abstract)' },
  pnTotalFactor: { dist: 'u', low: 1.3, high: 2.0, unit: 'total / solid >23 nm (10-23 nm added; volatile nucleation NOT included)', status: 'V/A', source: 'Kontses 2020: 10-23 nm adds 25-67 %' },
  pnScatter_sd: { dist: 'fix', central: 0.7, unit: 'lognormal sigma (mean-corrected)', status: 'A', source: 'ASSUMPTION' },
  pn2StrokeFactor: { dist: 'u', low: 5, high: 15, unit: 'two-stroke PN multiplier', status: 'V', source: 'Kontses 2020; Chirico et al. 2014 ACPD 14:16591 (~10x)' },
  twoStrokeShare: { dist: 'u', low: 0.01, high: 0.03, unit: 'share of idling scooters that are two-stroke', status: 'S/A', source: '~280,000 of ~14 M registered (inputs-emission-rates.json); kerb share assumed' },
  pmPerKgFuel: { dist: 'ln', low: 0.05, central: 0.25, high: 1.3, unit: 'g PM2.5 per kg fuel, ordinary scooter', status: 'A/V',
    source: 'ASSUMPTION centred between Euro 3 cycle 0.03-0.10 (Kontses 2020, derived) and Nepal serviced idle 0.71 (Jayarathne et al. 2018 ACP 18:2259, V). Ting 2023 tunnel 0.013 +- 0.143 g/kg NOT used (indistinguishable from zero)' },
  pmSmokerShare: { dist: 'u', low: 0.01, high: 0.04, unit: 'share of oil-burning smokers (incl. two-strokes)', status: 'A', source: 'ASSUMPTION' },
  pmSmokerPerKg: { dist: 'u', low: 2, high: 9, unit: 'g PM2.5 per kg fuel, smoker', status: 'V/A', source: 'Jayarathne 2018: Nepal pre-service idle 8.81 +- 1.33 g/kg (V) as top' },
  // ---- scene ----
  slotArea_m2: { dist: 'u', low: 2.2, high: 3.2, unit: 'm2 of stop box per scooter', status: 'S', source: 'Chang & Chang 2014 交通學報 14(1), reviewing 許添本 & 王義川 2001' },
  lateralPitch_m: { dist: 'u', low: 0.9, high: 1.2, unit: 'm between scooter centrelines', status: 'S/A', source: 'scooter width 0.8 m (Chang & Chang 2014) + gap (A)' },
  boxDepth_m: { dist: 'u', low: 2.5, high: 6, unit: 'm stop-box depth', status: 'V', source: '道路交通標誌標線號誌設置規則 art. 174-2' },
  boxWidth_m: { dist: 'u', low: 6, high: 10, unit: 'm stop-box width (2-3 lanes)', status: 'A', source: 'ASSUMPTION: no width in art. 174-2; lanes 3-4 m (IOT-113-TB006)' },
  queueLaneWidth_m: { dist: 'u', low: 3, high: 5, unit: 'm width of overflow queue behind the box', status: 'A', source: 'ASSUMPTION (Lan & Chang 2015: short wide queues)' },
  offFrac: { dist: 'u', low: 0, high: 0.2, unit: 'share of queued engines switched off', status: 'A', source: 'ASSUMPTION (no observation)' },
  presentAtOnset: { dist: 'u', low: 0.1, high: 0.4, unit: 'share of end-of-red queue already stopped at red onset', status: 'A', source: 'ASSUMPTION' },
  arrivalWindow_s: { dist: 'u', low: 45, high: 85, unit: 's over which the rest arrive (uniform)', status: 'A', source: 'ASSUMPTION; main-road red 80-83 s (IOT-113-TB006 Table 2.2.4-2)' },
  redLength_s: { dist: 'fix', central: 90, unit: 's', status: 'given', source: 'task definition' },
  sourceHeight_m: { dist: 'u', low: 0.3, high: 0.5, unit: 'm tailpipe height', status: 'V/S', source: 'IOT-113-TB006 sec 4.2.2 uses 0.5 m; 0.3-0.5 m scene file' },
  receptorAlong_m: { dist: 'u', low: 0, high: 1, unit: 'fraction: pedestrian position from back of box (0) to 1 m past stop line (1)', status: 'A', source: 'ASSUMPTION' },
  // ---- meteorology / turbulence ----
  windSpeed_ms: { dist: 'ln', low: 0.3, central: 0.8, high: 2.0, unit: 'm/s scalar speed at ~1.5 m, 90-s mean', status: 'A',
    source: 'ASSUMPTION: 0.2-0.6 x CWA 1991-2020 station means (Taipei 2.6, Taichung 1.5, Kaohsiung 2.1 m/s, V); IOT on-site July 2024 0.4-3.6 m/s (V)' },
  windDir_deg: { dist: 'u', low: 0, high: 360, unit: 'deg', status: 'A', source: 'ASSUMPTION: uniform (channelling tested, small effect)' },
  iv: { dist: 'u', low: 0.3, high: 0.6, unit: 'sigma_v/U', status: 'V/A', source: 'CAL3QHC default sigma_theta 25 deg -> 0.44 (EPA-454/R-92-006, V)' },
  sv0: { dist: 'u', low: 0.2, high: 0.5, unit: 'm/s floor on sigma_v', status: 'V/A', source: 'AERMOD minimum sigma_v 0.2 m/s; light-wind ~0.5 (EPA-454/B-26-003 sec 5, V)' },
  iw: { dist: 'u', low: 0.2, high: 0.35, unit: 'sigma_w/U', status: 'A', source: 'ASSUMPTION: neutral surface layer' },
  sw0: { dist: 'u', low: 0.1, high: 0.3, unit: 'm/s floor on sigma_w (traffic, engine heat)', status: 'A', source: 'ASSUMPTION (OSPM: traffic-produced turbulence in calm)' },
  sy0: { dist: 'u', low: 0.3, high: 1.0, unit: 'm initial lateral spread', status: 'A', source: 'ASSUMPTION: scooter+rider size; no wake for idling queues (CAL3QHC, V)' },
  sz0: { dist: 'u', low: 0.2, high: 0.8, unit: 'm initial vertical spread', status: 'A', source: 'ASSUMPTION (unmeasured; controls height ratio)' },
  buoyF: { dist: 'u', low: 0.7e-3, high: 2.5e-3, unit: 'm4/s3 buoyancy flux', status: 'D/A', source: 'Briggs, 0.3-0.6 L/s at 150-350 C (A)' },
  buoyMult: { dist: 'u', low: 0, high: 1, unit: 'multiplier on Briggs rise', status: 'A', source: 'ASSUMPTION' },
  // ---- background, for totals only ----
  bgCO_ppm: { dist: 'ln', low: 0.15, central: 0.35, high: 0.9, unit: 'ppm', status: 'V', source: 'MOENV 2025 annual report Table 3-23: general stations 0.24, traffic stations 0.54 ppm; IOT nearby station hourly 0.03-0.90' },
  bgBenzene_ppb: { dist: 'ln', low: 0.5, central: 1.5, high: 4.0, unit: 'ppb', status: 'S',
    source: 'Re-sourced (C6). Taiwan HAP network national annual mean ~0.5 ppbv, urban > non-urban (NCKU thesis via search excerpt, S, needsManualFetch); Bangkok kerb 2-3 ppb (V via repo); Kaohsiung 2.8-4.8 ppb (S). Wide on purpose' },
  bgPN_cm3: { dist: 'ln', low: 7000, central: 14000, high: 30000, unit: '/cm3', status: 'V/S', source: 'Cheung et al. 2013 ACP 13:8935 Taipei 13,900 (V); Abdillah 2024 roadside 25,000-38,000 (abstract)' },
  bgPM25_ugm3: { dist: 'ln', low: 6, central: 14, high: 35, unit: 'ug/m3', status: 'V', source: 'MOENV 2025 annual mean 13.4 (traffic 15.4); IOT kerb July 2024 4-14' },
};

// Scenarios are named by queue size, not "typical", because the models disagreed on what typical means.
// N = scooters queued on the pedestrian's approach at the END of the red; gap = kerb to nearest tailpipe column.
export const SCENARIOS = [
  { key: 'few', label: 'A few scooters (2-5)', zh: '少數幾輛（2–5 輛）', scooters: [2, 5], nearest: [2, 4],
    basis: 'IOT quiet junction 819 motorcycles/h (12-h hourly mean) -> ~3-10 per approach per red; nearest 2-4 m' },
  { key: 'dozen', label: 'A dozen or so (8-20)', zh: '十來輛（8–20 輛）', scooters: [8, 20], nearest: [0.7, 3],
    basis: 'scene file 8 (4-13) within 10 m; partly filled stop box' },
  { key: 'fullbox', label: 'Full stop box (25-45)', zh: '停等區滿（25–45 輛）', scooters: [25, 45], nearest: [0.3, 1.5],
    basis: 'IOT busiest Kaohsiung approach ~1,500 motorcycles/h -> ~34 per 83-s red; Lan & Chang 2015 Table V/VI 27 per 80 s' },
];
export const HEIGHTS = [0.6, 1.0, 1.5];

// ============================================================================================
// utilities (pure; the RNG is an object passed in)
// ============================================================================================
export function makeRng(seed) {
  let s = seed | 0;
  const rand = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const randn = () => { let u = 0; while (u === 0) u = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand()); };
  return { rand, randn };
}
const Z95 = 1.6448536;
function draw(p, R) {
  switch (p.dist) {
    case 'fix': return p.central;
    case 'u': return p.low + (p.high - p.low) * R.rand();
    case 'ln': return p.central * Math.exp((Math.log(p.high / p.low) / 2 / Z95) * R.randn());
    case 'tri': { const a = p.low, c = p.central, b = p.high, u = R.rand(), f = (c - a) / (b - a);
      return u < f ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c)); }
    default: throw new Error('dist ' + p.dist);
  }
}
function drawAll(R) { const o = {}; for (const k in INPUTS) o[k] = draw(INPUTS[k], R); return o; }
function quantile(sorted, q) { const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); }
function summarise(arr) { const a = Float64Array.from(arr).sort(); let m = 0; for (const v of a) m += v; return { low: quantile(a, 0.05), central: quantile(a, 0.5), high: quantile(a, 0.95), mean: m / a.length }; }

export const MOLAR_VOLUME_L = 24.45; // 25 C, 1 atm
export const CO_MG_PER_PPM = 28.01 / MOLAR_VOLUME_L;   // 1.146
export const BZ_UG_PER_PPB = 78.11 / MOLAR_VOLUME_L;   // 3.195
export const THC_MG_PER_PPMC = 13.85 / MOLAR_VOLUME_L; // CH1.85 basis

const BINS = INPUTS.moenvCObins.central;
const BIN_TOT = BINS.reduce((s, b) => s + b[2], 0);
const BIN_CUM = (() => { let c = 0; return BINS.map(b => (c += b[2] / BIN_TOT)); })();
function drawInspectionCO(m1, R) {
  const u = R.rand(); let i = 0; while (u > BIN_CUM[i] && i < BINS.length - 1) i++;
  if (i === 0) { const lo = Math.max(0, 2 * m1 - 1), hi = Math.min(1, 2 * m1); return lo + (hi - lo) * R.rand(); }
  return BINS[i][0] + (BINS[i][1] - BINS[i][0]) * R.rand();
}

// per-scooter emission: CO mg/s, THC mg/s, BZ ug/s, PN #/s, PM ug/s
export function drawScooter(P, R) {
  const F = P.fuelFlow_gph * Math.exp(P.fuelScatter_sd * R.randn() - P.fuelScatter_sd ** 2 / 2);
  const two = R.rand() < P.twoStrokeShare;
  const isNew = !two && R.rand() < P.newShare;
  const coPct = isNew ? P.newCO_pct * (0.5 + R.rand()) : drawInspectionCO(P.firstBinMean_pct, R);
  const S = Math.max(P.carbonSum_pct, coPct + 3);
  const coPerFuel = (P.carbonFrac / 12.011) * (coPct / S) * 28.01;
  const hcHigh = two || R.rand() < P.hcHigh4sShare;
  let thc = hcHigh ? P.hcHighPerFuel : P.thcPerFuel * Math.exp(P.thcScatter_sd * R.randn() - P.thcScatter_sd ** 2 / 2);
  if (isNew && !hcHigh) thc *= P.newTHCscale;
  const bzFrac = two ? P.benzeneFrac2s : P.benzeneFracTHC;
  const smoker = two || R.rand() < Math.max(0, P.pmSmokerShare - P.twoStrokeShare);
  const pmKg = smoker ? P.pmSmokerPerKg : P.pmPerKgFuel;
  const pnKg = P.pnPerKgFuel * P.pnTotalFactor * Math.exp(P.pnScatter_sd * R.randn() - P.pnScatter_sd ** 2 / 2) * (two ? P.pn2StrokeFactor : 1);
  return { CO: F * coPerFuel / 3.6, THC: F * thc / 3.6, BZ: F * thc * bzFrac * 1e3 / 3.6, PN: F / 1000 * pnKg / 3600, PM: F / 1000 * pmKg * 1e3 / 3.6, coPct, F };
}

// ============================================================================================
// dispersion kernel (s/m3): AERMOD-style coherent + random (meander) plume, EPA-454/B-26-003 eqs 69-73
// ============================================================================================
export function met(P) {
  const U = P.windSpeed_ms;
  const sv = Math.hypot(P.iv * U, P.sv0), sw = Math.hypot(P.iw * U, P.sw0);
  const ue = Math.max(U, Math.SQRT2 * sv);                 // C1: U is the scalar (effective) speed
  const fr = Math.min(1, 2 * sv * sv / (ue * ue));
  const th = P.windDir_deg * Math.PI / 180;
  return { U, sv, sw, ue, fr, c: Math.cos(th), s: Math.sin(th) };
}
const vert = (z, h, sz) => Math.exp(-((z - h) ** 2) / (2 * sz * sz)) + Math.exp(-((z + h) ** 2) / (2 * sz * sz));
export function chiQ(dx, dy, z, P, M) {
  let r = Math.hypot(dx, dy); if (r < 0.3) { const k = 0.3 / (r || 1e-9); dx *= k; dy *= k; r = 0.3; }
  const sAlong = dx * M.c + dy * M.s, n = -dx * M.s + dy * M.c, h0 = P.sourceHeight_m;
  const rise = x => Math.min(1.5, P.buoyMult * 1.6 * Math.cbrt(P.buoyF) * Math.pow(Math.max(x, 0), 2 / 3) / M.ue);
  let Cc;
  if (sAlong > 0) {
    const t = sAlong / M.ue, sy = Math.hypot(P.sy0, M.sv * t), sz = Math.hypot(P.sz0, M.sw * t);
    Cc = Math.exp(-n * n / (2 * sy * sy)) * vert(z, h0 + rise(sAlong), sz) / (2 * Math.PI * M.ue * sy * sz);
  } else {
    // receptor upwind of the tailpipe: only the initial cloud (within ~sy0) reaches it. Ad hoc; see METHOD.md.
    Cc = Math.exp(-(n * n + sAlong * sAlong) / (2 * P.sy0 * P.sy0)) * vert(z, h0, P.sz0) / (2 * Math.PI * M.ue * P.sy0 * P.sz0);
  }
  const szr = Math.hypot(P.sz0, M.sw * r / M.ue);
  const Cr = vert(z, h0 + rise(r), szr) / (Math.sqrt(2 * Math.PI) * szr) / (2 * Math.PI * r * M.ue);
  return (1 - M.fr) * Cc + M.fr * Cr;
}

function layout(N, gap, P, R) {
  const py = P.lateralPitch_m, px = P.slotArea_m2 / py;
  const nCol = Math.max(1, Math.floor(P.boxWidth_m / py)), nRow = Math.max(1, Math.floor(P.boxDepth_m / px));
  const box = [];
  for (let r = 0; r < nRow; r++) for (let c = 0; c < nCol; c++) box.push([-(r + 0.5) * px, gap + c * py]);
  if (N <= box.length) {
    const pool = box.slice(0, Math.min(box.length, Math.ceil(N * 1.5)));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R.rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, N);
  }
  const pos = box.slice(); const qCol = Math.max(1, Math.floor(P.queueLaneWidth_m / py));
  for (let k = 0; pos.length < N; k++) pos.push([-P.boxDepth_m - (Math.floor(k / qCol) + 0.5) * px, gap + (k % qCol) * py]);
  return pos;
}

const SPECIES = ['CO', 'THC', 'BZ', 'PN', 'PM'];
export const SERIES_T = [0, 5, 10, 20, 30, 45, 60, 75, 90];
// One red light for one parameter draw. Returns 90-s means per height, end-of-red (t = 85 s) values, CO series at top height.
function oneRed(P, N, gap, heights, R, opts = {}) {
  const T = P.redLength_s, pos = layout(N, gap, P, R);
  const xr = opts.xr !== undefined ? opts.xr : -P.boxDepth_m + (P.boxDepth_m + 1) * P.receptorAlong_m;
  const yr = opts.yr !== undefined ? opts.yr : 0;
  const M = met(P), nH = heights.length;
  const mean = {}, end = {}; for (const k of SPECIES) { mean[k] = new Float64Array(nH); end[k] = new Float64Array(nH); }
  const series = new Float64Array(SERIES_T.length); let win = 0;
  for (let i = 0; i < pos.length; i++) {
    if (R.rand() < P.offFrac) continue;
    const e = drawScooter(P, R);
    const tArr = i < P.presentAtOnset * pos.length ? 0 : P.arrivalWindow_s * R.rand();
    const dx = xr - pos[i][0], dy = yr - pos[i][1];
    const tOn = Math.min(T, tArr + Math.hypot(dx, dy) / M.ue);
    const fMean = (T - tOn) / T, fEnd = tOn < T - 5 ? 1 : 0;
    for (let h = 0; h < nH; h++) {
      const x = chiQ(dx, dy, heights[h], P, M);
      for (const k of SPECIES) { mean[k][h] += x * e[k] * fMean; end[k][h] += x * e[k] * fEnd; }
      if (h === nH - 1) {
        SERIES_T.forEach((t, j) => { if (t >= tOn) series[j] += x * e.CO; });
        if (opts.win) { const [a, b] = opts.win; win += x * e.CO * Math.max(0, b - Math.max(a, tOn)) / (b - a); }
      }
    }
  }
  return { mean, end, series, win, M, xr };
}

const toUnits = (k, v) => k === 'CO' ? v / CO_MG_PER_PPM : k === 'BZ' ? v / BZ_UG_PER_PPB : k === 'THC' ? v / THC_MG_PER_PPMC : k === 'PN' ? v / 1e6 : v;
const KEYMAP = { CO: 'co', BZ: 'benzene', THC: 'thc', PN: 'particleNumber', PM: 'pm25' };
export const UNITS = { co: 'ppm', benzene: 'ppb', thc: 'ppmC', particleNumber: 'particles/cm3 (solid + 10-23 nm; LOWER BOUND)', pm25: 'ug/m3' };

/**
 * estimate({scooters, nearest, windSpeed, windFrom, n, seed, overrides})
 *  scooters : number (fixed) or [lo, hi] uniform — scooters queued on the approach at end of red (1-60)
 *  nearest  : number or [lo, hi] — kerb to nearest tailpipe column, m (0.3-5)
 *  windSpeed: null (sample the kerb-wind distribution) or a fixed scalar speed in m/s (0.3-3)
 *  windFrom : 'any' (uniform direction, default) | 'pack' (blowing from the box to the pedestrian, +-45 deg)
 *  n, seed  : Monte Carlo size and seed (deterministic)
 *  overrides: {inputName: fixed value} for sensitivity work
 * Returns, per pollutant, {unit, increment:{h0.6,h1.0,h1.5:{low,central,high,mean}}, endOfRed, total}, plus CO time series.
 * low/central/high = 5th/50th/95th percentile over reds (weather, queue, which scooters) AND parameter uncertainty.
 */
export function estimate(opts = {}) {
  const { scooters = [8, 20], nearest = [0.7, 3], windSpeed = null, windFrom = 'any', n = 6000, seed = 20261126, overrides = {}, heights = HEIGHTS } = opts;
  const R = makeRng(seed);
  const pick = v => Array.isArray(v) ? v[0] + (v[1] - v[0]) * R.rand() : v;
  const acc = {}; for (const k of SPECIES) acc[k] = { inc: heights.map(() => []), end: heights.map(() => []), tot: heights.map(() => []) };
  const ratio06 = [], ratio10 = [], seriesNorm = SERIES_T.map(() => []), seriesAbs = SERIES_T.map(() => []);
  for (let i = 0; i < n; i++) {
    const P = Object.assign(drawAll(R), overrides);
    if (windSpeed !== null) P.windSpeed_ms = windSpeed;
    const N = Math.max(1, Math.round(pick(scooters))), gap = pick(nearest);
    if (windFrom === 'pack') {
      // direction from the box centroid toward the pedestrian, +-45 deg
      const cx = -P.boxDepth_m / 2, cy = gap + P.boxWidth_m / 2, xr = -P.boxDepth_m + (P.boxDepth_m + 1) * P.receptorAlong_m;
      P.windDir_deg = Math.atan2(0 - cy, xr - cx) * 180 / Math.PI + (R.rand() * 90 - 45);
    }
    const o = oneRed(P, N, gap, heights, R);
    const bg = { CO: P.bgCO_ppm, BZ: P.bgBenzene_ppb, THC: NaN, PN: P.bgPN_cm3, PM: P.bgPM25_ugm3 };
    for (const k of SPECIES) heights.forEach((h, j) => {
      const v = toUnits(k, o.mean[k][j]);
      acc[k].inc[j].push(v); acc[k].end[j].push(toUnits(k, o.end[k][j])); acc[k].tot[j].push(v + bg[k]);
    });
    const top = heights.length - 1;
    if (heights.length === 3) { ratio06.push(o.mean.CO[0] / o.mean.CO[top]); ratio10.push(o.mean.CO[1] / o.mean.CO[top]); }
    const endv = o.series[SERIES_T.length - 1];
    SERIES_T.forEach((t, j) => { seriesAbs[j].push(o.series[j] / CO_MG_PER_PPM); if (endv > 0) seriesNorm[j].push(o.series[j] / endv); });
  }
  const out = { inputs: { scooters, nearest, windSpeed, windFrom, n, seed, overrides }, units: UNITS };
  for (const k of SPECIES) {
    const r = { unit: UNITS[KEYMAP[k]], increment: {}, endOfRed: {}, total: {} };
    heights.forEach((h, j) => { const hk = 'h' + h.toFixed(1); r.increment[hk] = summarise(acc[k].inc[j]); r.endOfRed[hk] = summarise(acc[k].end[j]); if (k !== 'THC') r.total[hk] = summarise(acc[k].tot[j]); });
    out[KEYMAP[k]] = r;
  }
  out.co.mgm3 = Object.fromEntries(Object.entries(out.co.increment).map(([hk, s]) => [hk, { low: s.low * CO_MG_PER_PPM, central: s.central * CO_MG_PER_PPM, high: s.high * CO_MG_PER_PPM, mean: s.mean * CO_MG_PER_PPM }]));
  out.benzene.ugm3 = Object.fromEntries(Object.entries(out.benzene.increment).map(([hk, s]) => [hk, { low: s.low * BZ_UG_PER_PPB, central: s.central * BZ_UG_PER_PPB, high: s.high * BZ_UG_PER_PPB, mean: s.mean * BZ_UG_PER_PPB }]));
  if (ratio06.length) out.heightRatio = { pushchair0p6_over_adult1p5: summarise(ratio06), child1p0_over_adult1p5: summarise(ratio10), published: false };
  out.timeSeriesCO = { t_s: SERIES_T, note: 'CO increment at top height; mean shape set by the assumed arrival law; ILLUSTRATIVE ONLY, not published as a curve',
    normalisedMedian: seriesNorm.map(a => a.length ? quantile(Float64Array.from(a).sort(), 0.5) : null), absolute: seriesAbs.map(summarise), published: false };
  return out;
}

// ============================================================================================
// validation: simulated IOT-113-TB006 waiting-zone sensor at the busiest junction (Mingcheng 1st/Minzu 1st)
// ============================================================================================
export function simulateIOT({ campaigns = 200, reds = 500, wind = INPUTS.windSpeed_ms, sensorX = [-1, 5], sensorY = [1.5, 3.5], persistDir = false, seed = 7 } = {}) {
  const R = makeRng(seed); const maxes = [];
  for (let c = 0; c < campaigns; c++) {
    const Psys = drawAll(R); const dir0 = draw(INPUTS.windDir_deg, R); let mx = 0;
    for (let k = 0; k < reds; k++) {
      const P = Object.assign({}, Psys, { windSpeed_ms: draw(wind, R), windDir_deg: persistDir ? dir0 + 60 * R.randn() : draw(INPUTS.windDir_deg, R),
        offFrac: draw(INPUTS.offFrac, R), presentAtOnset: draw(INPUTS.presentAtOnset, R), arrivalWindow_s: draw(INPUTS.arrivalWindow_s, R) });
      const N = Math.round(17 + 33 * R.rand()), gap = sensorY[0] + (sensorY[1] - sensorY[0]) * R.rand();
      const o = oneRed(P, N, gap, [1.35], R, { xr: sensorX[0] + (sensorX[1] - sensorX[0]) * R.rand(), win: [30, 90] });
      mx = Math.max(mx, o.win / CO_MG_PER_PPM);
    }
    maxes.push(mx);
  }
  const s = summarise(maxes);
  return { max1minIncrement_ppm: s, shareAtOrBelow1p2: maxes.filter(v => v <= 1.2).length / maxes.length };
}

// fleet emission summary
export function fleetEmissions({ n = 3000, seed = 11 } = {}) {
  const R = makeRng(seed); const co = [], thc = [], bz = [], ratioBzCO = [];
  for (let i = 0; i < n; i++) { const P = drawAll(R); let a = 0, b = 0, c = 0; for (let j = 0; j < 50; j++) { const e = drawScooter(P, R); a += e.CO; b += e.THC; c += e.BZ; } co.push(a / 50 * 3.6); thc.push(b / 50 * 3.6); bz.push(c / 50 * 3.6); ratioBzCO.push(c / 1000 / a); }
  return { fleetMeanCO_gph: summarise(co), fleetMeanTHC_gph: summarise(thc), fleetMeanBenzene_mgph: summarise(bz), benzeneOverCO_massRatio: summarise(ratioBzCO) };
}

// one-at-a-time sensitivity: median CO increment at 1.5 m (dozen scenario) with an input pinned at its P5 and P95
export function sensitivity({ n = 3000 } = {}) {
  const base = SCENARIOS[1]; const med = o => o.co.increment['h1.5'].central;
  const run = (extra) => med(estimate(Object.assign({ scooters: base.scooters, nearest: base.nearest, n, heights: [1.5] }, extra)));
  const rows = [{ input: 'baseline', lowCase: run({}), highCase: null }];
  const pinned = ['fuelFlow_gph', 'sz0', 'sw0', 'sy0', 'iv', 'sv0', 'newShare', 'thcPerFuel', 'carbonSum_pct', 'firstBinMean_pct'];
  for (const k of pinned) { const p = INPUTS[k]; rows.push({ input: k, lowValue: p.low, highValue: p.high, lowCase: run({ overrides: { [k]: p.low } }), highCase: run({ overrides: { [k]: p.high } }) }); }
  rows.push({ input: 'windSpeed_ms', lowValue: 0.3, highValue: 2.0, lowCase: run({ windSpeed: 0.3 }), highCase: run({ windSpeed: 2.0 }) });
  rows.push({ input: 'scooters', lowValue: 8, highValue: 20, lowCase: run({ scooters: 8 }), highCase: run({ scooters: 20 }) });
  rows.push({ input: 'nearest_m', lowValue: 0.7, highValue: 3, lowCase: run({ nearest: 0.7 }), highCase: run({ nearest: 3 }) });
  rows.push({ input: 'windFrom pack (vs any)', lowCase: null, highCase: run({ windFrom: 'pack' }) });
  rows.push({ input: 'no meander (sv0 0.05, iv 0.2)', lowCase: run({ overrides: { sv0: 0.05, iv: 0.2 } }), highCase: null });
  rows.push({ input: 'no buoyant rise', lowCase: null, highCase: run({ overrides: { buoyMult: 0 } }) });
  return rows;
}

// ============================================================================================
// published, rounded statements (what the chart may show). Rounding: 1 significant figure, ranges only.
// ============================================================================================
export function round1(x) { if (!(x > 0)) return 0; return Number(x.toPrecision(1)); }
export function publishable(res) {
  const s = res.co.increment['h1.5'], b = res.benzene.increment['h1.5'], pm = res.pm25.increment['h1.5'];
  return {
    co_ppm: { low: round1(s.low), central: round1(s.central), high: round1(s.high) },
    benzene_ppb: { low: round1(b.low), central: round1(b.central), high: round1(b.high) },
    pm25_ugm3: { low: round1(pm.low), central: round1(pm.central), high: round1(pm.high) },
    particleNumber: 'not estimated (no idle emission measurement; volatile nucleation excluded) / 未推估',
    height: 'not estimated as a number; same or higher at 0.6-1.0 m (borrowed evidence) / 未推估',
    label: 'Estimate, not a measurement / 推估值，非實測',
  };
}

// ============================================================================================
// CLI
// ============================================================================================
const isMain = typeof process !== 'undefined' && process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href;
if (isMain) {
  const write = process.argv.includes('--write');
  const n = write ? 30000 : 6000;
  const f = (x) => { if (x === null || x === undefined) return '-'; const a = Math.abs(x); return a === 0 ? '0' : a >= 1e4 ? x.toExponential(1) : a >= 100 ? x.toFixed(0) : a >= 10 ? x.toFixed(1) : x.toPrecision(2); };
  const t0 = Date.now();
  const log = s => process.stdout.write(s + '\n');
  log('ScooterAir — ESTIMATE (推估) of kerbside increments beside idling scooters, 90-s red. Method of record.');
  log(`n = ${n} per scenario, seed 20261126. low/central/high = P5/P50/P95. Increments above urban background.\n`);
  const fleet = fleetEmissions();
  log(`Fleet-mean idle CO ${f(fleet.fleetMeanCO_gph.central)} g/h (P5-P95 of fleet mean ${f(fleet.fleetMeanCO_gph.low)}-${f(fleet.fleetMeanCO_gph.high)}); THC ${f(fleet.fleetMeanTHC_gph.central)} g/h; benzene ${f(fleet.fleetMeanBenzene_mgph.central)} mg/h; benzene/CO ${f(100 * fleet.benzeneOverCO_massRatio.central)} % by mass\n`);
  const scen = [];
  for (const sc of SCENARIOS) {
    const r = estimate({ scooters: sc.scooters, nearest: sc.nearest, n });
    const rp = estimate({ scooters: sc.scooters, nearest: sc.nearest, n: Math.round(n / 2), windFrom: 'pack', seed: 99 });
    scen.push({ key: sc.key, label: sc.label, zh: sc.zh, basis: sc.basis, call: r.inputs, result: r, windFromPack: { call: rp.inputs, co: rp.co, benzene: rp.benzene }, publish: publishable(r) });
    log(`=== ${sc.label}  (nearest tailpipe ${sc.nearest[0]}-${sc.nearest[1]} m) ===`);
    for (const [k, lab] of [['co', 'CO ppm'], ['benzene', 'benzene ppb'], ['thc', 'THC ppmC'], ['pm25', 'PM2.5 ug/m3'], ['particleNumber', 'PN /cm3 (LOWER BOUND, unpublished)']]) {
      const x = r[k].increment['h1.5'], e = r[k].endOfRed['h1.5'], t = r[k].total['h1.5'];
      log(`  ${lab.padEnd(36)} ${f(x.low)} / ${f(x.central)} / ${f(x.high)}  mean ${f(x.mean)}   end-of-red P50 ${f(e.central)}   ${t ? `total ${f(t.low)} / ${f(t.central)} / ${f(t.high)}` : ''}`);
    }
    log(`  CO at 0.6 m: ${f(r.co.increment['h0.6'].low)} / ${f(r.co.increment['h0.6'].central)} / ${f(r.co.increment['h0.6'].high)} ppm; ratio 0.6/1.5 m P50 ${f(r.heightRatio.pushchair0p6_over_adult1p5.central)} (P5-P95 ${f(r.heightRatio.pushchair0p6_over_adult1p5.low)}-${f(r.heightRatio.pushchair0p6_over_adult1p5.high)}) [NOT PUBLISHED]`);
    log(`  CO when wind blows from the pack: ${f(rp.co.increment['h1.5'].low)} / ${f(rp.co.increment['h1.5'].central)} / ${f(rp.co.increment['h1.5'].high)} ppm`);
    log(`  CO build-up C(t)/C(90 s) median: ${SERIES_T.map((t, j) => `${t}s ${f(r.timeSeriesCO.normalisedMedian[j])}`).join(', ')} [ILLUSTRATIVE]`);
    log(`  PUBLISH (1 s.f.): CO ${JSON.stringify(scen.at(-1).publish.co_ppm)} ppm; benzene ${JSON.stringify(scen.at(-1).publish.benzene_ppb)} ppb; PM2.5 ${JSON.stringify(scen.at(-1).publish.pm25_ugm3)} ug/m3\n`);
  }
  log('=== VALIDATION: simulated IOT waiting-zone CO sensor, busiest junction (48-h max of 1-min increment) ===');
  const vc = write ? 200 : 40;
  const V = {
    baseline: simulateIOT({ campaigns: vc }),
    siteWind: simulateIOT({ campaigns: vc, wind: { dist: 'ln', low: 0.9, central: 1.6, high: 2.8 } }),
    acrossCrosswalk: simulateIOT({ campaigns: vc, sensorX: [2, 8], sensorY: [2.5, 5] }),
    both: simulateIOT({ campaigns: vc, wind: { dist: 'ln', low: 0.9, central: 1.6, high: 2.8 }, sensorX: [2, 8], sensorY: [2.5, 5] }),
    persistentDirection: simulateIOT({ campaigns: vc, persistDir: true }),
    bothPersistent: simulateIOT({ campaigns: vc, wind: { dist: 'ln', low: 0.9, central: 1.6, high: 2.8 }, sensorX: [2, 8], sensorY: [2.5, 5], persistDir: true }),
  };
  for (const [k, v] of Object.entries(V)) log(`  ${k.padEnd(22)} ${f(v.max1minIncrement_ppm.low)} / ${f(v.max1minIncrement_ppm.central)} / ${f(v.max1minIncrement_ppm.high)} ppm; campaigns <= 1.2 ppm: ${(100 * v.shareAtOrBelow1p2).toFixed(0)}%`);
  log('  observed (IOT-113-TB006 sec 3.3.2): Mingcheng max ~1.3 ppm total minus 0.1-0.5 station -> ~0.8-1.2 ppm increment; other 3 sites no resolvable increment\n');
  log('=== SENSITIVITY (dozen scenario, median CO increment at 1.5 m, ppm, one input pinned at P5 / P95) ===');
  const sens = sensitivity({ n: write ? 4000 : 1500 });
  for (const r of sens) log(`  ${r.input.padEnd(32)} ${f(r.lowCase)}  ${f(r.highCase)}`);
  log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(0)} s.`);
  if (write) {
    const fs = await import('node:fs'); const path = await import('node:path'); const url = await import('node:url');
    const dir = path.dirname(url.fileURLToPath(import.meta.url));
    const results = {
      title: 'ScooterAir kerbside exposure at a 90-s red light — ESTIMATE (推估), not a measurement',
      generated: '2026-11-26', model: 'model.mjs (method of record: corrected source-dispersion Monte Carlo)',
      reproduce: 'node model.mjs --write  (estimate(call) with the recorded call reproduces each scenario exactly in Node/V8)',
      conventions: { low: 'P5', central: 'P50', high: 'P95', mean: 'arithmetic mean', heights_m: HEIGHTS, increment: 'above urban background', molarVolume_L: MOLAR_VOLUME_L,
        published: 'only CO, benzene and PM2.5 increments at 1.5 m, rounded to 1 significant figure, as ranges; particle number, height ratios and time series are recorded but NOT published' },
      inputs: INPUTS, fleet, scenarios: scen, validation: V, sensitivity: sens,
      crossModel: {
        note: 'medians of CO increment, 90-s mean, ~1.5 m, ppm, as published by each model before/after critique corrections',
        sourceDispersionOriginal: { few: 0.033, dozen: 0.18, fullbox: 0.36 },
        massBalanceBoxHeadline: { light: 0.25, typical: 0.82, heavy: 1.8, status: 'upper bound only; IOT replica with corrected queue over-predicts 3-20x' },
        massBalanceBoxCriticAdjusted: { light: 0.1, typical: '0.3-0.4', heavy: '0.6-0.8' },
        empiricalRouteA: { typical35queued: 0.20, heavy70queued: 0.35, status: 'IOT low-cost sensors; only 1 of 4 sites resolves an increment' },
        empiricalRouteB: { typical35queued: 1.1, status: 'assumption-driven; not used' },
      },
    };
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(results, (k, v) => (typeof v === 'number' && !Number.isInteger(v)) ? Number(v.toPrecision(6)) : v, 1));
    log('wrote results.json');
  }
}
