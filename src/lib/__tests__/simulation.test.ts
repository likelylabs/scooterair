// Run: node --test 'src/lib/__tests__/simulation.test.ts'
// The simulation's data module against the signed files in research/simulation: every number the
// site can print equals the signed statement or results-simulation.json, and the copy helpers keep
// the statements' rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { simData } from '../../data/simulation-data.ts';
import { sim, simBelowWho, simRange, simSlots, simSeries } from '../../data/simulation.ts';
import { formatEstimate } from '../../data/estimate.ts';
import { facts } from '../../data/facts.ts';
import { extract } from '../../../scripts/build-simulation-data.mjs';

const root = new URL('../../../', import.meta.url);
const R = JSON.parse(readFileSync(new URL('research/simulation/results-simulation.json', root), 'utf8'));
const S = JSON.parse(readFileSync(new URL('research/simulation/statements.json', root), 'utf8'));
const N = R.numbers;

test('the generated module is exactly what the generator reads from research/simulation', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(simData)), extract());
  const json = JSON.parse(readFileSync(new URL('research/simulation/site-extract.json', root), 'utf8'));
  assert.deepEqual(json, extract());
});

test('statement ranges equal the statements’ own words', () => {
  assert.match(S.may[0].en, new RegExp(`about ${sim.co.oneRed15.lo}–${sim.co.oneRed15.hi} ppm`));
  assert.match(S.may[0].mustCarry, new RegExp(`up to about ${sim.co.nearTailpipeAbout} directly behind`));
  assert.match(S.may[1].en, new RegExp(`about ${sim.co.stay15.lo}–${sim.co.stay15.hi} ppm`));
  assert.match(S.may[2].basis, new RegExp(`median ${sim.co.pushchairMiddle.lo}–${sim.co.pushchairMiddle.hi} ppm`));
  assert.match(S.may[2].en, new RegExp(`1 in ${sim.co.pushchairOneIn.lo} to 1 in ${sim.co.pushchairOneIn.hi}`));
  assert.match(S.may[3].en, new RegExp(`${sim.co.burst1s.lo}–${sim.co.burst1s.hi} ppm, and ${sim.co.burst1sHeld.lo}–${sim.co.burst1sHeld.hi} ppm`));
  assert.match(S.may[7].en, new RegExp(`${sim.benzene.stay1hTimes.lo} to ${sim.benzene.stay1hTimes.hi} times`));
  assert.match(S.may[9].en, new RegExp(`about ${sim.arcade.inside.lo}–${sim.arcade.inside.hi} ppm`));
});

test('numbers behind the charts equal results-simulation.json', () => {
  // statement 1's "up to about 5" behind a tailpipe equals the middle case of #37 (its high end is far above)
  assert.equal(Math.round(N[37].central), sim.co.nearTailpipeAbout);
  assert.ok(N[37].high > sim.co.nearTailpipeAbout, '#37 high end is above "about 5"; the site prints statement 1\'s own words');
  // the pushchair band is the middle cases; its low end is #38's P50 at 45 % held reds
  assert.equal(sim.co.pushchairMiddle.lo, N[38].red_45pct_P50);
  assert.ok(N[38].central >= sim.co.pushchairMiddle.lo && N[38].central <= sim.co.pushchairMiddle.hi);
  // statement 2's top is #3's P95 with the wind held in 65 % of reds
  assert.equal(sim.co.stay15.hi, N[3].red_65pct_P95);
  // chart (c2): one statistic, P50 at 45 % to P95 at 65 % of #7 and #8, and the reference of #7
  const [kerb, back] = simData.statements.benzeneStay.rows;
  assert.deepEqual([kerb.lo, kerb.hi, back.lo, back.hi], [N[7].red_45pct_P50, N[7].red_65pct_P95, N[8].red_45pct_P50, N[8].red_65pct_P95]);
  assert.equal(`${sim.benzene.reference_ppb} ppb (27 ug/m3)`, N[7].reference.value);
  // chart (c1): #20 (1967 threshold) then #19 (1970)
  const [s67, s70] = simData.statements.smell.cases;
  assert.deepEqual([s67.n, s67.low, s67.high, s70.n, s70.low, s70.high], [20, N[20].low, N[20].high, 19, N[19].low, N[19].high]);
  // chart (a): the two series, as their CSVs give them, rounded to 0.1
  assert.equal(simSeries.adult.seconds, 90);
  assert.equal(simSeries.pushchair.seconds, 30);
  assert.ok(Math.abs(simSeries.adult.mean - N[12].central) < 0.5, 'the adult series mean is close to #12 (one draw of the same case)');
  // the WHO value the results name
  assert.equal(`${sim.who15min_ppm} ppm (100 mg/m3)`, N[0].reference.value);
});

test('every slot prints as 約 A 到 B / about A to B, as an estimate anchored at #simulation (the smell step at #smell)', () => {
  for (const slot of simSlots) {
    const r = simRange(slot);
    assert.equal(r.kind, 'estimate');
    assert.equal(r.anchor, slot.startsWith('sim.smell.') ? 'smell' : 'simulation');
    assert.match(formatEstimate(r, 'zh-TW').text, /^約 [\d.]+ 到 [\d.]+/);
    assert.match(formatEstimate(r, 'en').text, /^about [\d.]+ to [\d.]+/);
  }
  assert.throws(() => simRange('sim.co.nope' as never));
});

test('the carbon monoxide finding still holds (it is printed on /estimate/#simulation): one red, every red with the wind held, and right behind a tailpipe stay below the WHO 15-minute value', () => {
  assert.equal(simBelowWho(), true);
});

test('simulation facts carry their numbers from the data module and print no air number beside 推估', () => {
  const simFacts = Object.values(facts).filter((f) => f.topic === 'simulation');
  assert.ok(simFacts.length >= 10);
  for (const f of simFacts) {
    assert.match(f.research, /simulation\/statements#may-\d+/);
    for (const l of ['zh-TW', 'en'] as const) {
      for (const text of [f.statement[l], f.caveat?.[l] ?? '']) {
        if (/推估|Estimate/.test(text)) assert.doesNotMatch(text, /\d\s*(ppm|ppb)/, `${f.id}: an air number beside 推估 must be an EstimateValue`);
      }
    }
  }
  assert.equal(facts['sim-co-one-red-15min'].data.hi.value, sim.co.oneRed15.hi);
  assert.equal(facts['sim-co-pushchair-exception'].data.middleLo.value, sim.co.pushchairMiddle.lo);
});
