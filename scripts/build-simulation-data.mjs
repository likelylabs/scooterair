#!/usr/bin/env node
// Builds the site's simulation data module from the signed simulation files.
//
//   node scripts/build-simulation-data.mjs           # writes the two outputs below
//   node scripts/build-simulation-data.mjs --check   # exits 1 if either output is out of date
//
// Reads (never edits):
//   research/simulation/results-simulation.json   final numbers (low / central / high per case)
//   research/simulation/statements.json           what the site may say, with the rounded ranges
//   research/simulation/results/S1-from/series_1s.csv, results/NF1-fine/series_1s.csv
//                                                  the two one-second series chart (a) draws
// Writes:
//   src/data/simulation-data.ts                   `simData`, a literal the site imports
//   research/simulation/site-extract.json          the same object as JSON (for readers of research/)
//
// No number is typed here. The published ranges are read out of the statements' own words
// (statements.json `may[i].en`, `mustCarry`, `basis`) with the patterns below, and every one of
// them is checked against results-simulation.json: if a pattern stops matching, or a statement
// range no longer sits where the results put it, the script stops and says which.
//
// scripts/check-data.mjs imports `extract()` and fails if src/data/simulation-data.ts differs.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SIM = 'research/simulation';
const OUT_TS = 'src/data/simulation-data.ts';
const OUT_JSON = `${SIM}/site-extract.json`;

const read = (p) => readFileSync(resolve(root, p), 'utf8');
const fail = (msg) => {
  throw new Error(`[simulation data] ${msg}`);
};
const num = (s) => Number(String(s).replace(/,/g, ''));
const match = (text, re, what) => {
  const m = re.exec(text);
  if (!m) fail(`${what}: pattern ${re} no longer matches "${text}"`);
  return m;
};
const r1 = (x) => Math.round(x * 10) / 10;

/** One CSV column as numbers. */
function column(csvPath, col) {
  const lines = read(csvPath).trim().split('\n');
  const head = lines[0].split(',');
  const i = head.indexOf(col);
  if (i < 0) fail(`${csvPath} has no column "${col}"`);
  return lines.slice(1).map((l) => num(l.split(',')[i]));
}

export function extract() {
  const R = JSON.parse(read(`${SIM}/results-simulation.json`));
  const S = JSON.parse(read(`${SIM}/statements.json`));
  const N = R.numbers;
  const may = S.may;
  const pick = (i, keys = []) => {
    const n = N[i];
    if (!n) fail(`results-simulation.json has no number #${i}`);
    const out = { n: i, case: n.case, probe: n.probe ?? null, unit: n.unit, low: n.low, central: n.central, high: n.high, confidence: n.confidence };
    for (const k of keys) {
      if (n[k] === undefined) fail(`number #${i} has no "${k}"`);
      out[k] = n[k];
    }
    return out;
  };

  // ---- reference values, as the results file names them -------------------------------------
  const who = num(match(N[0].reference.value, /^([\d.]+) ppm/, 'WHO 15-min value (#0)')[1]);
  if (N[0].reference.averaging !== '15 min' || N[0].reference.body !== 'WHO') fail('#0 reference is no longer the WHO 15-minute value');
  const bzRef = num(match(N[7].reference.value, /^([\d.]+) ppb/, 'benzene reference (#7)')[1]);
  const bzAvg = match(N[7].reference.averaging, /^1 h \(derived on a (\d+)-h basis\)/, 'benzene reference averaging (#7)');

  // ---- statement 1: one red, as a 15-minute average -------------------------------------------
  const s1 = match(may[0].en, /about ([\d.]+)–([\d.]+) ppm of carbon monoxide to your 15-minute average/, 'statement 1');
  const s1near = match(may[0].mustCarry, /up to about ([\d.]+) directly behind a tailpipe/, 'statement 1 mustCarry');
  const oneRed15 = { may: 0, lo: num(s1[1]), hi: num(s1[2]), nearTailpipeAbout: num(s1near[1]), cases: [pick(0), pick(1), pick(28), pick(37)] };
  // the near-tailpipe "about 5" is the middle (P50) of #37, not a ceiling
  if (Math.round(N[37].central) !== oneRed15.nearTailpipeAbout) fail(`statement 1 "about ${oneRed15.nearTailpipeAbout}" is not #37's middle value ${N[37].central}`);

  // ---- statement 2: every red for 15 minutes, held wind ---------------------------------------
  const s2 = match(may[1].en, /averages about ([\d.]+)–([\d.]+) ppm/, 'statement 2');
  const stay15 = { may: 1, lo: num(s2[1]), hi: num(s2[2]), cases: [pick(3, ['red_45pct_P50', 'red_65pct_P95']), pick(33, ['red_45pct_P50', 'red_65pct_P95'])] };
  if (stay15.hi !== N[3].red_65pct_P95) fail(`statement 2 top ${stay15.hi} is not #3's P95 at 65 % red ${N[3].red_65pct_P95}`);

  // ---- statement 3: the pushchair exception ---------------------------------------------------
  const s3 = match(may[2].basis, /median ([\d.]+)–([\d.]+) ppm, above 87 in ([\d.]+)–([\d.]+) %/, 'statement 3 basis');
  const s3share = match(may[2].en, /about 1 in (\d+) to 1 in (\d+) such cases/, 'statement 3');
  const s3h = match(may[2].basis, /at K 0\.5 m, ([\d.]+) m:/, 'statement 3 height');
  const pushchair = {
    may: 2,
    medianLo: num(s3[1]),
    medianHi: num(s3[2]),
    /** "1 in 10 to 1 in 5 such 15-minute periods" */
    oneInLo: num(s3share[1]),
    oneInHi: num(s3share[2]),
    abovePctLo: num(s3[3]),
    abovePctHi: num(s3[4]),
    height_m: num(s3h[1]),
    case: pick(38, ['red_45pct_P50', 'red_65pct_P95']),
  };
  if (pushchair.medianLo !== N[38].red_45pct_P50) fail(`statement 3 median low ${pushchair.medianLo} is not #38 red_45pct_P50 ${N[38].red_45pct_P50}`);
  if (!(N[38].central >= pushchair.medianLo && N[38].central <= pushchair.medianHi)) fail('#38 central is outside the statement 3 median range');
  if (Math.round(100 / pushchair.oneInLo) !== pushchair.abovePctLo || Math.round(100 / pushchair.oneInHi) < pushchair.abovePctHi - 2) fail('statement 3 "1 in N" no longer matches its percentages');

  // ---- statement 4: one-second bursts ---------------------------------------------------------
  const s4 = match(may[3].en, /usually about ([\d.]+)–([\d.]+) ppm, and ([\d.]+)–([\d.]+) ppm/, 'statement 4');
  const s4x = match(may[3].mustCarry, /uncertain about (\d+) times/, 'statement 4 mustCarry');
  const bursts = { may: 3, usualLo: num(s4[1]), usualHi: num(s4[2]), heldLo: num(s4[3]), heldHi: num(s4[4]), uncertainTimes: num(s4x[1]), cases: [pick(15, ['emission_P5_P50_P95']), pick(40, ['emission_P5_P50_P95'])] };

  // ---- statement 5: pushchair height against an adult's nose ----------------------------------
  const s5 = match(may[4].mustCarry, /range about the same to twice/, 'statement 5 mustCarry');
  const s5h = match(may[4].en, /pushchair height \(about ([\d.]+) m\)/, 'statement 5 height');
  void s5;
  const height = { may: 4, ratioLo: 1, ratioHi: 2, height_m: num(s5h[1]), cases: [pick(11), pick(12)] };

  // ---- statement 6: the smell, share of seconds ----------------------------------------------
  match(may[5].mustCarry, /about half to nearly all seconds/, 'statement 6 mustCarry');
  const smell = { may: 5, cases: [pick(20), pick(19)] };

  // ---- statement 8: benzene for people who stay an hour ---------------------------------------
  const s8 = match(may[7].en, /about (\d+) to (\d+) times California's 1-hour reference level/, 'statement 8');
  const s8x = match(may[7].mustCarry, /benzene emission share uncertain (\d+)–(\d+) times/, 'statement 8 mustCarry');
  const bz7 = pick(7, ['red_45pct_P50', 'red_65pct_P95']);
  const bz8 = pick(8, ['red_45pct_P50', 'red_65pct_P95']);
  const benzeneStay = {
    may: 7,
    timesLo: num(s8[1]),
    timesHi: num(s8[2]),
    emissionUncertainLo: num(s8x[1]),
    emissionUncertainHi: num(s8x[2]),
    reference_ppb: bzRef,
    referenceBasis_h: num(bzAvg[1]),
    /** the bands chart (c2) draws: P50 with the wind held 45 % of reds to P95 at 65 % (one statistic) */
    rows: [
      { at: 'kerb 0.5 m, 0.7 m', lo: bz7.red_45pct_P50, hi: bz7.red_65pct_P95, n: 7 },
      { at: 'kerb 1 m, 1.1 m', lo: bz8.red_45pct_P50, hi: bz8.red_65pct_P95, n: 8 },
    ],
    cases: [bz7, bz8],
  };
  if (Math.floor(bz7.red_45pct_P50 / bzRef) !== benzeneStay.timesLo || Math.round(bz7.red_65pct_P95 / bzRef) !== benzeneStay.timesHi) fail('statement 8 "1 to 4 times" no longer matches #7');

  // ---- statement 10: inside the arcade --------------------------------------------------------
  const s10 = match(may[9].en, /about ([\d.]+)–([\d.]+) ppm on average/, 'statement 10');
  const arcade = { may: 9, lo: num(s10[1]), hi: num(s10[2]), case: pick(30) };

  // ---- chart (a): two one-second series (one emission draw each) ------------------------------
  const series = (id, csvCase, col, label) => {
    const v = column(`${SIM}/results/${csvCase}/series_1s.csv`, `CO_ppm[${col}]`);
    const mean = v.reduce((a, b) => a + b, 0) / v.length;
    return { id, case: csvCase, probe: col, label, seconds: v.length, mean: r1(mean), values: v.map(r1) };
  };
  const seriesAdult = series('adult-held-wind', 'S1-from', 'K d=0.5 dx=0.0 h=1.5', 'wind held from a dozen scooters, kerb 0.5 m, adult nose 1.5 m');
  const seriesPushchair = series('pushchair-near-calm', 'NF1-fine', 'K d=0.5 dx=0.0 h=0.7', 'one scooter, near-calm held air, 0.5 m behind the tailpipe, 0.7 m');

  return {
    note: 'Generated by scripts/build-simulation-data.mjs from research/simulation (results-simulation.json, statements.json, results/*/series_1s.csv, smell-chemicals/results-smell.json, smell-chemicals/statements-smell.json). Do not edit by hand.',
    signed: R.date,
    status: R.status,
    who15min_ppm: who,
    statements: { oneRed15, stay15, pushchair, bursts, height, smell, benzeneStay, arcade },
    series: { adult: seriesAdult, pushchair: seriesPushchair },
    smellChemicals: extractSmell(N),
  };
}

// ---- the smell-chemicals step (research/simulation/smell-chemicals, signed 2026-11-27) --------
// What the site prints from it: statements-smell.json `may` only. The words those statements use
// ("2 to 15", "0.4 to 60", "about 30", "2 to 360", "76 % (range 0-97 %)", "97 % (83-99 %)") are
// read out of the statements and checked against results-smell.json here.
function extractSmell(N) {
  const DIR = `${SIM}/smell-chemicals`;
  const R = JSON.parse(read(`${DIR}/results-smell.json`));
  const S = JSON.parse(read(`${DIR}/statements-smell.json`));
  const may = (id) => S.may.find((m) => m.id === id) ?? fail(`statements-smell.json has no statement "${id}"`);
  const PROBE = 'K d=0.5 dx=0.0 h=0.7';
  const from = R.cases['S1-from'] ?? fail('results-smell.json has no case S1-from');
  const p = from.probes[PROBE] ?? fail(`S1-from has no probe "${PROBE}"`);
  const canyon = R.cases.S1?.probes[PROBE] ?? fail(`S1 has no probe "${PROBE}"`);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;

  // just noticeable (one scooter, independent of the flow)
  const tl = R.threshold_level.chemicals.benzene;
  const wJust = match(may('how-much-just-smellable').en, /about ([\d.]+) to ([\d.]+) parts per billion \(range about ([\d.]+) to ([\d.]+) ppb/, 'how-much-just-smellable');
  const just = { c6800: tl.DT6800.ppb.central, c800: tl.DT800.ppb.central, lo: tl.DT6800.ppb.low, hi: tl.DT800.ppb.high, n: tl.DT800.ppb.n, wordsLo: num(wJust[1]), wordsHi: num(wJust[2]), wordsRangeLo: num(wJust[3]), wordsRangeHi: num(wJust[4]) };
  if (Math.round(just.c6800) !== just.wordsLo || Math.round(just.c800) !== just.wordsHi) fail(`"${just.wordsLo} to ${just.wordsHi}" is not the two centrals ${just.c6800} / ${just.c800}`);
  if (!near(just.lo, just.wordsRangeLo, 0.05) || !near(just.hi, just.wordsRangeHi, 3)) fail(`"range ${just.wordsRangeLo} to ${just.wordsRangeHi}" is not ${just.lo} to ${just.hi}`);

  // the seconds you can smell it, wind held from the scooters, 0.5 m, 0.7 m
  const lv8 = p.levels_in_smellable_seconds.DT800.benzene;
  const lv68 = p.levels_in_smellable_seconds.DT6800.benzene;
  const wSec = match(may('level-in-smellable-seconds').en, /about (\d+) ppb over the seconds you can smell it \(range about ([\d.]+) to ([\d.]+) ppb/, 'level-in-smellable-seconds');
  const seconds = {
    c6800: lv68.mean_over_smellable_seconds.ppb.central,
    c800: lv8.mean_over_smellable_seconds.ppb.central,
    lo: Math.min(lv68.mean_over_smellable_seconds.ppb.low, lv8.mean_over_smellable_seconds.ppb.low),
    hi: Math.max(lv68.mean_over_smellable_seconds.ppb.high, lv8.mean_over_smellable_seconds.ppb.high),
    n: lv8.n_draws,
    wordsAbout: num(wSec[1]),
    wordsRangeLo: num(wSec[2]),
    wordsRangeHi: num(wSec[3]),
  };
  if (!(seconds.wordsAbout >= seconds.c6800 && seconds.wordsAbout <= seconds.c800)) fail(`"about ${seconds.wordsAbout}" is not between the centrals ${seconds.c6800} and ${seconds.c800}`);
  if (Math.round(seconds.lo) !== seconds.wordsRangeLo || seconds.hi !== seconds.wordsRangeHi) fail(`"range ${seconds.wordsRangeLo} to ${seconds.wordsRangeHi}" is not ${seconds.lo} to ${seconds.hi}`);

  // share of the red that can be smelled, both thresholds (1967 = D/T 800, 1970 = D/T 6,800)
  const share = (sh) => ({ lo: sh.low, c: sh.central, hi: sh.high, emissionOnly: sh.emission_only_P5_P50_P95, drawsAny: sh.draws_with_any_smellable_second, drawsAnyLowHigh: sh.draws_with_any_smellable_second_low_high_flow });
  const share800 = share(p.smellable_share.DT800);
  const share6800 = share(p.smellable_share.DT6800);
  const wShare = match(may('how-often-wind').basis, /(\d+) % \(range (\d+)-(\d+) %\) with the 800-fold threshold and (\d+) % \((\d+)-(\d+) %\) with the 6,800-fold/, 'how-often-wind basis');
  const pc = (x) => Math.round(x * 100);
  if (pc(share800.c) !== num(wShare[1]) || pc(share800.lo) !== num(wShare[2]) || pc(share800.hi) !== num(wShare[3])) fail('how-often-wind 800-fold share no longer matches results-smell.json');
  if (pc(share6800.c) !== num(wShare[4]) || pc(share6800.lo) !== num(wShare[5]) || pc(share6800.hi) !== num(wShare[6])) fail('how-often-wind 6,800-fold share no longer matches results-smell.json');
  // the centrals are the ones the simulation's own chart (c1) already draws
  if (pc(share800.c) !== pc(N[20].central) || pc(share6800.c) !== pc(N[19].central)) fail('smell-step share centrals differ from results-simulation #20 / #19');
  const canyonShare = { a: share(canyon.smellable_share.DT800), b: share(canyon.smellable_share.DT6800) };

  // what the smell more likely is (own odour thresholds, by case)
  const oo = R.ownOdourByCase;
  const cases = Object.keys(R.cases);
  const pack = cases.filter((c) => c !== 'NF1-fine');
  const all = (rows, keys) => keys.flatMap((c) => [...rows[c].DT800, ...rows[c].DT6800]);
  const acThr = num(match(Object.keys(oo.acetaldehyde)[0], /threshold_([\d.]+)ppb/, 'acetaldehyde threshold')[1]);
  const acAware = num(match(Object.keys(oo.acetaldehyde)[1], /threshold_([\d.]+)ppb/, 'acetaldehyde awareness')[1]);
  const bzOwn = num(match(Object.keys(oo.benzene)[0], /threshold_([\d.]+)ppb/, 'benzene own threshold')[1]);
  const acetaldehyde = {
    threshold_ppb: acThr,
    shareLo: Math.min(...cases.map((c) => oo.acetaldehyde[`threshold_${acThr}ppb`][c].DT800[0])),
    shareHi: Math.max(...all(oo.acetaldehyde[`threshold_${acThr}ppb`], cases)),
    shareLoAny: Math.min(...all(oo.acetaldehyde[`threshold_${acThr}ppb`], cases)),
    aware_ppb: acAware,
    awarePackMax: Math.max(...all(oo.acetaldehyde[`threshold_${acAware}ppb`], pack)),
    awareNf1Max: Math.max(...all(oo.acetaldehyde[`threshold_${acAware}ppb`], ['NF1-fine'])),
  };
  if (acetaldehyde.awarePackMax !== 0) fail('acetaldehyde now reaches its awareness level in a pack case: not-unburnt-petrol mustCarry no longer holds');
  const wAc = match(may('not-unburnt-petrol').basis, /above its ([\d.]+) ppb detection threshold in (\d+)-(\d+) % of draws in every case/, 'not-unburnt-petrol basis');
  if (num(wAc[1]) !== acThr || num(wAc[2]) !== pc(acetaldehyde.shareLoAny) || num(wAc[3]) !== pc(acetaldehyde.shareHi)) fail('not-unburnt-petrol acetaldehyde share no longer matches results-smell.json');
  const benzeneOwn = { threshold_ppb: bzOwn, packMax: Math.max(...all(oo.benzene[`threshold_${bzOwn}ppb`], pack)), nf1Max: Math.max(...all(oo.benzene[`threshold_${bzOwn}ppb`], ['NF1-fine'])) };
  if (benzeneOwn.packMax !== 0) fail('benzene now reaches its own odour threshold in a pack case: smell-comes-with-benzene no longer holds');
  // other chemicals that sometimes pass their LOWEST odour threshold (S1-from, 0.5 m, 0.7 m; the two smell tests)
  const lowest = (chem) => {
    const k = Object.keys(oo[chem])[0];
    return { threshold_ppb: num(match(k, /threshold_([\d.]+)ppb/, `${chem} threshold`)[1]), share: [...oo[chem][k]['S1-from'].DT800, ...oo[chem][k]['S1-from'].DT6800] };
  };
  const alsoAbove = { toluene: lowest('toluene'), xylenes: lowest('xylenes'), formaldehyde: lowest('formaldehyde') };

  // the detail table: someone who stays through every red for an hour (or 30 min), wind held
  const ORDER = ['toluene', 'xylenes', 'ethylbenzene', 'benzene', 'butadiene', 'hexane', 'formaldehyde', 'acetaldehyde', 'naphthalene', 'styrene', 'acrolein', 'hcn'];
  const iarc = R.hazardLabels_IARC;
  const stay = ORDER.map((chem) => {
    const a = p.averages[chem];
    const rows = [];
    for (const avg of ['60min', '30min']) {
      if (!a?.[avg]) continue;
      const st = a[avg].stay_through_ugm3;
      const one = a[avg].one_red_contribution_ugm3;
      const refs = a[avg].references.map((r) => {
        const key = Object.keys(a[avg].aboveReference.stay_through_ugm3).find((k) => k.startsWith(r.body)) ?? fail(`${chem} ${avg}: no verdict for ${r.body}`);
        const oneKey = Object.keys(a[avg].aboveReference.one_red_contribution_ugm3).find((k) => k.startsWith(r.body));
        return { ugm3: r.ugm3, body: r.body, stay: a[avg].aboveReference.stay_through_ugm3[key], oneRed: a[avg].aboveReference.one_red_contribution_ugm3[oneKey] };
      });
      rows.push({ avg, central: st.central, low: st.low, high: st.high, oneRed: { low: one.low, central: one.central, high: one.high }, refs });
    }
    return { chem, iarc: iarc[chem] ?? null, confidence: from.chemicalConfidence?.[chem] ?? null, rows };
  });
  // one red alone reaches no reference at the central estimate (statement one-red)
  for (const s of stay) for (const r of s.rows) for (const ref of r.refs) if (r.oneRed.central >= ref.ugm3) fail(`${s.chem}: one red reaches ${ref.body} at the central estimate; statement one-red no longer holds`);
  const bzStay = stay.find((s) => s.chem === 'benzene').rows[0];
  const wBz = match(may('stay-through-benzene').basis, /([\d.]+) ug\/m3 \(([\d.]+)-([\d.]+)\) against ([\d.]+) ug\/m3/, 'stay-through-benzene basis');
  if (num(wBz[1]) !== bzStay.central || num(wBz[2]) !== bzStay.low || num(wBz[3]) !== bzStay.high || num(wBz[4]) !== bzStay.refs[0].ugm3) fail('stay-through-benzene basis no longer matches results-smell.json');
  // µg/m³ → ppb for benzene at 25 °C (results-smell conventions: 3.195 µg/m³ per ppb)
  const bzPerPpb = 78.11 / 24.45; // benzene molar mass over the molar volume at 25 °C (results-smell conventions: 3.195)
  if (!/25 ?C/.test(JSON.stringify(R.conventions.units))) fail('results-smell.json no longer states µg/m³ at 25 °C');

  return {
    signed: R.date,
    status: R.status,
    probe: { case: 'S1-from', at: PROBE, distance_m: 0.5, height_m: 0.7, condition: from.condition, how_often: from.conditionProbability, confidence: from.caseConfidence },
    just,
    seconds,
    share800,
    share6800,
    canyon: canyonShare,
    acetaldehyde,
    benzeneOwn,
    alsoAbove,
    stay,
    benzeneStayPpb: { central: r1(bzStay.central / bzPerPpb), low: r1(bzStay.low / bzPerPpb), high: r1(bzStay.high / bzPerPpb) },
    iarcExhaust: iarc['petrol-engine exhaust'],
  };
}

function render(data) {
  const json = JSON.stringify(data, null, 1);
  const ts = `// GENERATED by scripts/build-simulation-data.mjs from research/simulation/. Do not edit.\n// Run \`node scripts/build-simulation-data.mjs\` after the signed files change; check-data fails\n// while this file differs from what the script would write.\n\nexport const simData = ${json} as const;\n`;
  return { ts, json: json + '\n' };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const out = render(extract());
  if (process.argv.includes('--check')) {
    const bad = [];
    if (read(OUT_TS) !== out.ts) bad.push(OUT_TS);
    if (read(OUT_JSON) !== out.json) bad.push(OUT_JSON);
    if (bad.length) {
      console.error(`✖ simulation data out of date: ${bad.join(', ')}. Run node scripts/build-simulation-data.mjs`);
      process.exit(1);
    }
    console.log('✔ simulation data matches research/simulation');
  } else {
    writeFileSync(resolve(root, OUT_TS), out.ts);
    writeFileSync(resolve(root, OUT_JSON), out.json);
    console.log(`wrote ${OUT_TS} and ${OUT_JSON}`);
  }
}

export { render };
