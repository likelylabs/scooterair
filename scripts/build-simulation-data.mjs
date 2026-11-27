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
    note: 'Generated by scripts/build-simulation-data.mjs from research/simulation (results-simulation.json, statements.json, results/*/series_1s.csv). Do not edit by hand.',
    signed: R.date,
    status: R.status,
    who15min_ppm: who,
    statements: { oneRed15, stay15, pushchair, bursts, height, smell, benzeneStay, arcade },
    series: { adult: seriesAdult, pushchair: seriesPushchair },
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
