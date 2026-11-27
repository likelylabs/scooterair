// Speed without changing a single number: the pinned outputs, the parity scans' fast path against
// the exact month-by-month sums, and the work one calculator answer does.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { econData } from '../../../data/econ/index.ts';
import { bestOptions, bestOptionsInSlices, clearParityCache, evaluate, rankingPairs } from '../index.ts';
import { closedTotal, electricTotals, gasolineTotals, SCAN_MAX_KM, SCAN_STEP, TIE } from '../parity.ts';
import { electricSchedule, gasolineParts, typicalTotal } from '../running.ts';
import { answer } from '../worker.ts';
import { compute, rankingCases } from './pinned/cases.ts';
import { situation } from './helpers.ts';

const pinned = JSON.parse(readFileSync(new URL('./pinned/pinned-outputs.json', import.meta.url), 'utf8'));

test('a spread of 154 situations and 7 rankings gives exactly the pinned numbers', () => {
  clearParityCache(econData);
  const now = compute();
  assert.equal(now.evaluations.length, pinned.evaluations.length);
  now.evaluations.forEach((e, i) => assert.deepEqual(e, pinned.evaluations[i], `case ${i}: ${JSON.stringify(pinned.cases[i])}`));
  now.rankings.forEach((r, i) => assert.deepEqual(r, pinned.rankings[i], `ranking ${i}`));
});

test('the same numbers come out with the scan caches warm', () => {
  const now = compute();
  now.evaluations.forEach((e, i) => assert.deepEqual(e, pinned.evaluations[i], `case ${i}`));
});

test('the closed-form scan totals stay far inside the tie margin of the exact sums, for every option and distance', () => {
  let worst = 0;
  for (const date of ['2026-11-26', '2027-01-05']) {
    for (const { model, plan } of rankingPairs(econData)) {
      for (const horizon of [60, 37]) {
        const sched = electricSchedule(model, plan, date, econData, horizon, 0.5);
        for (let km = SCAN_STEP; km <= SCAN_MAX_KM; km += SCAN_STEP) {
          const raw = sched.at(km).raw;
          worst = Math.max(worst, Math.abs(closedTotal(raw, horizon) - typicalTotal(raw, horizon)));
        }
      }
    }
  }
  for (const gas of econData.gasModels.filter((m) => m.calculator === true)) {
    for (let km = SCAN_STEP; km <= SCAN_MAX_KM; km += SCAN_STEP) {
      const raw = gasolineParts(gas, km, econData.fuel.petrol95.value, econData).raw;
      worst = Math.max(worst, Math.abs(closedTotal(raw, 60) - typicalTotal(raw, 60)));
    }
  }
  // The fast path is trusted only where |difference| > TIE; a rounding error this small cannot flip a sign there.
  assert.ok(worst < TIE / 1000, `largest closed-form error NT$${worst}`);
});

test('the cached totals are the same objects across options that share them, and a cleared cache rebuilds them', () => {
  const gas = econData.gasModels.find((m) => m.id === 'kymco-new-haomai-125-drum')!;
  const a = gasolineTotals(gas, econData, 60);
  assert.equal(gasolineTotals(gas, econData, 60), a);
  const [{ model, plan }] = rankingPairs(econData);
  const e = electricTotals(model, plan, '2026-11-26', econData, 60, 0.5);
  assert.equal(electricTotals(model, plan, '2026-11-26', econData, 60, 0.5), e);
  assert.notEqual(electricTotals(model, plan, '2026-11-27', econData, 60, 0.5), e, 'the date is part of the key (plan credits end)');
  clearParityCache(econData);
  assert.notEqual(gasolineTotals(gas, econData, 60), a);
  assert.deepEqual([...gasolineTotals(gas, econData, 60).fast], [...a.fast]);
});

test('one answer formats no number with toLocaleString and builds no number formatter', () => {
  const orig = Number.prototype.toLocaleString;
  const OrigNF = Intl.NumberFormat;
  let calls = 0;
  let built = 0;
  Number.prototype.toLocaleString = function (this: number, ...args: Parameters<typeof orig>) {
    calls++;
    return orig.apply(this, args);
  };
  (Intl as { NumberFormat: unknown }).NumberFormat = new Proxy(OrigNF, {
    construct(target, args) {
      built++;
      return Reflect.construct(target, args);
    },
    apply(target, self, args) {
      built++;
      return Reflect.apply(target, self, args);
    },
  });
  try {
    clearParityCache(econData);
    const base = { jurisdiction: 'kaohsiung' as const, scrap: { engine: 'four-stroke' as const, builtOn: '2017-02' }, household: {}, monthlyKm: 300, gasolineModel: 'kymco-new-haomai-125-drum', date: '2026-11-26' };
    bestOptions(base);
    evaluate(situation());
  } finally {
    Number.prototype.toLocaleString = orig;
    (Intl as { NumberFormat: unknown }).NumberFormat = OrigNF;
  }
  assert.equal(calls, 0, 'toLocaleString builds a formatter on every call');
  assert.equal(built, 0, 'formatters are built once, when the engine loads');
});

test('ranking every option is quick (it froze a phone for 12 seconds before)', () => {
  const base = rankingCases()[0];
  bestOptions(base); // load and compile
  const times: number[] = [];
  for (let i = 0; i < 5; i++) {
    clearParityCache(econData);
    const t0 = performance.now();
    bestOptions(base);
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  // About 10–20 ms here with the scan cache cleared; it took about 300 ms before. Loose, for slow CI machines.
  assert.ok(times[2] < 150, `median ${times[2].toFixed(1)} ms`);
});

test('bestOptionsInSlices gives the same ranking as bestOptions and yields between slices', async () => {
  for (const base of rankingCases().slice(0, 3)) {
    let pauses = 0;
    const sliced = await bestOptionsInSlices(base, econData, { batch: 5, pause: async () => void pauses++ });
    assert.deepEqual(sliced, bestOptions(base));
    assert.ok(pauses >= Math.floor(rankingPairs(econData).length / 5) - 1);
  }
  const ctl = new AbortController();
  ctl.abort(new Error('stop'));
  await assert.rejects(bestOptionsInSlices(rankingCases()[0], econData, { signal: ctl.signal }), /stop/);
});

test('the worker module answers with plain, cloneable data and passes input issues back', () => {
  const ok = answer({ id: 1, fn: 'evaluate', arg: situation() });
  assert.equal(ok.ok, true);
  assert.deepEqual(structuredClone((ok as { result: unknown }).result), evaluate(situation()));
  const bad = answer({ id: 2, fn: 'evaluate', arg: situation({ monthlyKm: -5 }) });
  assert.equal(bad.ok, false);
  assert.equal((bad as { issues?: { field: string }[] }).issues?.[0]?.field, 'monthlyKm');
  const many = answer({ id: 3, fn: 'evaluateMany', arg: [situation(), situation({ jurisdiction: 'kinmen' })] });
  assert.equal(((many as { result: unknown[] }).result).length, 2);
});
