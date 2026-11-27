// Run: node --test 'src/components/charts/__tests__/sim.test.ts'
// The simulation's chart models keep the statements' rules (research/simulation/statements.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simAboveModel, simCompareModel, simSecondsModel, niceTop, ticksTo } from '../core/simCharts.ts';
import { sim } from '../../../data/simulation.ts';

const locales = ['zh-TW', 'en'] as const;
const all = (o: unknown) => JSON.stringify(o);

test('(b) like with like: three 15-minute rows, the WHO line inside the axis, no number above 87 for the pushchair', () => {
  for (const l of locales) {
    const m = simCompareModel(l);
    assert.deepEqual(m.rows.map((r) => r.id), ['one-red', 'stay', 'pushchair']);
    assert.ok(m.axis.max > m.who.value, 'the axis runs past the WHO value so the arrow crosses it');
    for (const r of m.rows) assert.ok(r.band.hi < m.who.value, `${r.id}: every drawn band stays below 87; the pushchair's high end is an arrow`);
    // no second-long value, no 1-hour value, no NIOSH, no 280 or 140
    assert.doesNotMatch(all(m), /\b(280|140|31|200|300|100 到)\b|NIOSH/);
    assert.ok(m.rows[2].lowConfidence && /信心低|low confidence/.test(m.rows[2].sub), 'low confidence said in words');
    assert.match(m.rows[2].value, /中間的情形|middle case/);
    assert.match(m.rows[2].over ?? '', /15/);
    assert.match(m.caption[0], /推估|Estimate/);
    assert.match(m.summary, /推估|Estimate/);
    assert.match(m.short.caption, /一個紅燈|one simulated red/);
    assert.match(m.rows[0].sub, /最多約|up to about/, 'the near-tailpipe value is printed in statement 1\'s own words (mustCarry: "up to about 5")');
    assert.doesNotMatch(m.short.caption, /偏高的|high end/, 'the compact caption claims no coverage of the high end');
    assert.equal(m.table.rows.length, 4);
  }
});

test('(a) bursts: sorted from most to least, one shared axis, no guideline and no single-second numbers in words', () => {
  for (const l of locales) {
    const m = simSecondsModel(l);
    for (const p of m.panels) for (let i = 1; i < p.sorted.length; i++) assert.ok(p.sorted[i - 1] >= p.sorted[i]);
    assert.ok(m.axis.max >= Math.max(...m.panels.flatMap((p) => p.sorted)));
    assert.doesNotMatch(all({ s: m.summary, c: m.caption, t: m.table }), /\d\s*ppm|87|31|指引|guideline/i);
  }
});

test('(c) two charts never merged: smell shares in %, benzene against the 1-hour reference with its 6-hour basis', () => {
  for (const l of locales) {
    const m = simAboveModel(l);
    assert.equal(m.smell.axis.max, 100);
    assert.ok(m.smell.rows.every((r) => r.lo >= 0 && r.hi <= 100 && r.lo < r.hi));
    assert.equal(m.benzene.ref.value, sim.benzene.reference_ppb);
    assert.match(m.benzene.ref.label, /6/);
    assert.match(m.benzene.caption, /一個紅燈|one red/);
    assert.match(m.benzene.summary, /1 到 4 倍|1 to 4 times/);
    assert.doesNotMatch(all(m), /一氧化碳|carbon monoxide|癌|cancer|odou?r unit|氣味單位/i);
  }
});

test('axis helpers', () => {
  assert.equal(niceTop(97.4), 100);
  assert.equal(niceTop(104.5), 120);
  assert.deepEqual(ticksTo(100, 5), [0, 20, 40, 60, 80, 100]);
});
