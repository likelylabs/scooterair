// Fixes from the November 2026 review (findings/calc-engine.json, econ-data.json, electric.json).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { econData } from '../../../data/econ/index.ts';
import { changeDates, evaluate, validateSituation } from '../index.ts';
import type { Evaluation } from '../types.ts';
import { cityMoney, moneySnapshot, moneyState } from '../../site-state.ts';
import { situation } from './helpers.ts';

const texts = (e: Evaluation) => [
  ...e.messages.flatMap((m) => [m.text, ...(m.items ?? [])]),
  ...[...e.electric.purchase.excluded, ...e.gasoline.purchase.excluded].map((x) => x.reasonText),
  ...[...e.electric.purchase.lines, ...e.gasoline.purchase.lines].flatMap((l) => [l.label, l.conditionText, ...(l.deadline ? [l.deadline.rule] : [])]),
  ...[...e.electric.running.items, ...e.gasoline.running.items].flatMap((i) => [i.label, ...(i.note ? [i.note] : [])]),
];
const all = (e: Evaluation) => texts(e).map((x) => `${x['zh-TW']}\n${x.en}`).join('\n');
const scrap2008 = { engine: 'four-stroke' as const, builtOn: '2008-05' };

test('Yamaha November offers are for main-island dealers only: not counted in Kinmen, Penghu or Lienchiang', () => {
  for (const j of ['kinmen', 'penghu', 'lienchiang'] as const) {
    const e = evaluate(situation({ jurisdiction: j, gasolineModel: 'yamaha-jog-125', scrap: scrap2008, date: '2026-11-26' }));
    const ids = e.gasoline.purchase.lines.map((l) => l.id);
    assert.ok(!ids.some((id) => id.startsWith('yamaha-')), `${j}: ${ids}`);
    const x = e.gasoline.purchase.excluded.find((y) => y.id === 'yamaha-jog-credit-2026-11');
    assert.equal(x?.reason, 'not-eligible');
    assert.match(x!.reasonText.en, /main island/);
    // 66,000 − 2,000 new-purchase tax cut − 4,000 scrap tax cut − 300 recycling
    assert.equal(e.gasoline.purchase.net.value, 59700);
  }
  // Hualien has no local money counted, so the main-island price is Yamaha's own advertised one.
  const main = evaluate(situation({ jurisdiction: 'hualien', gasolineModel: 'yamaha-jog-125', scrap: scrap2008, date: '2026-11-26' }));
  assert.equal(main.gasoline.purchase.net.value, 46700, 'the advertised scrap price on the main island');
});

test('money that is used up is reported as used up, whatever else the buyer misses', () => {
  const e = evaluate(situation({ jurisdiction: 'kaohsiung', scrap: { engine: 'four-stroke', builtOn: '2017-02' }, date: '2026-11-26' }));
  for (const id of ['khh-youth-heavy', 'khh-scrap-heavy', 'khh-medical-heavy']) {
    const x = e.electric.purchase.excluded.find((y) => y.id === id);
    assert.equal(x?.reason, 'quota-exhausted', id);
    assert.equal(x?.failedCondition, undefined, 'not offered as a near miss');
  }
});

test('a missing age is "not counted", not "not eligible", and says which ages the line is for', () => {
  const e = evaluate(situation({ jurisdiction: 'taoyuan', scrap: scrap2008, household: {} }));
  const banded = e.electric.purchase.excluded.filter((x) => x.failedCondition === 'age');
  assert.ok(banded.length > 0);
  for (const x of banded) {
    assert.equal(x.reason, 'needs-answer');
    assert.match(x.reasonText.en, /^Not counted: you did not give your age; this one is for ages/);
    assert.match(x.reasonText['zh-TW'], /^沒有算進去：你沒有填年齡/);
  }
});

test('a clear failure wins over an unclear one: unclear money is offered only to buyers who meet everything else', () => {
  const e = evaluate(situation({ jurisdiction: 'taichung', scrap: scrap2008, household: { previousLocalSubsidy: true, age: 40 } }));
  const unclear = e.electric.purchase.excluded.filter((x) => x.reason === 'ambiguous').map((x) => x.id);
  assert.ok(!unclear.includes('tc-scrap-lowincome'), 'not on a low income');
  assert.ok(!unclear.includes('tc-child'), 'no child');
  assert.ok(!unclear.includes('tc-scrap-two-stroke'), 'not a two-stroke');
  assert.equal(e.electric.purchase.excluded.find((x) => x.id === 'tc-scrap-lowincome')?.reason, 'not-eligible');
});

test('prior-subsidy rules that look back over a set period leave the line out as unclear, with the period', () => {
  const ticked = { previousLocalSubsidy: true, age: 40 };
  const tc = evaluate(situation({ jurisdiction: 'taichung', scrap: scrap2008, household: ticked }));
  assert.equal(tc.electric.purchase.excluded.find((x) => x.id === 'tc-scrap-phase5')?.reason, 'ambiguous');
  assert.equal(tc.electric.purchase.excluded.find((x) => x.id === 'tc-scrap-phase4')?.reason, 'not-eligible', 'a 2008 scooter is phase 5');
  assert.ok(tc.messages.some((m) => m.code === 'ambiguity' && /before 2016/.test(m.text.en) && (m.amount ?? 0) > 0));
  const il = evaluate(situation({ jurisdiction: 'yilan', scrap: scrap2008, household: ticked }));
  assert.ok(il.messages.some((m) => m.code === 'ambiguity' && /2023–2025/.test(m.text.en)));
  const yl = evaluate(situation({ jurisdiction: 'yunlin', scrap: scrap2008, household: ticked }));
  assert.ok(yl.messages.some((m) => m.code === 'ambiguity' && /past 3 years/.test(m.text.en)));
  // Kinmen: the swap route has a 5-year exception for earlier Kinmen applicants; the new-purchase route has none.
  const km = evaluate(situation({ jurisdiction: 'kinmen', scrap: { engine: 'four-stroke', builtOn: '2005-03' }, household: ticked, date: '2026-11-26' }));
  assert.equal(km.electric.purchase.excluded.find((x) => x.id === 'kinmen-swap')?.reason, 'ambiguous');
  assert.match(km.electric.purchase.excluded.find((x) => x.id === 'kinmen-swap')!.reasonText.en, /more than 5 years ago/);
  assert.equal(km.electric.purchase.excluded.find((x) => x.id === 'kinmen-new')?.reason, 'not-eligible');
  // unticked: counted, with the assumption stated
  const fresh = evaluate(situation({ jurisdiction: 'kinmen', scrap: { engine: 'four-stroke', builtOn: '2005-03' }, household: { age: 40 }, date: '2026-11-26' }));
  assert.ok(fresh.electric.purchase.lines.some((l) => l.id === 'kinmen-swap') || fresh.electric.purchase.excluded.find((x) => x.id === 'kinmen-swap')?.reason === 'mutually-exclusive');
});

test('a double scrap in New Taipei earns a second NT$300 recycling payment (secondary source)', () => {
  const e = evaluate(situation({ jurisdiction: 'new-taipei', scrap: { engine: 'four-stroke', builtOn: '2008-05', secondScooter: true }, household: { age: 40 } }));
  const l = e.electric.purchase.lines.find((x) => x.id === 'moenv-recycling-300-second');
  assert.equal(l?.amount, 300);
  assert.equal(l?.confidence, 'secondary');
  const one = evaluate(situation({ jurisdiction: 'new-taipei', scrap: scrap2008, household: { age: 40 } }));
  assert.equal(one.electric.purchase.lines.find((x) => x.id === 'moenv-recycling-300-second'), undefined);
});

test('every plan states its contract one way: its length when stated, or that the operator does not state it', () => {
  for (const p of econData.plans) {
    if (p.lockInMonths) {
      assert.match(p.contract.en, new RegExp(`^${p.lockInMonths}-month contract$`), p.id);
      assert.match(p.terms.en, new RegExp(`${p.lockInMonths}-month contract`), p.id);
    } else if (p.operator === 'household') {
      assert.match(p.contract.en, /^No contract/, p.id);
    } else {
      assert.match(p.contract.en, /not stated/, p.id);
      assert.doesNotMatch(p.terms.en, /\d+-month contract|no contract(?! length)/i, p.id);
    }
    if (p.setupFee) assert.match(p.terms.en, new RegExp(`NT\\$${p.setupFee.value.toLocaleString('en-US')} setup fee`), `${p.id}: the setup fee amount is given`);
  }
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-819-dual' }));
  const m = e.messages.find((x) => x.code === 'plan-lock-in');
  assert.match(m!.text.en, /contract length not stated by Gogoro/);
  assert.doesNotMatch(all(e), /No contract;|不綁約/);
});

test('a scooter built after the evaluation date is refused', () => {
  const issues = validateSituation(situation({ scrap: { engine: 'four-stroke', builtOn: '2026-12' }, date: '2026-11-26' }));
  assert.ok(issues.some((i) => i.field === 'scrap.builtOn' && i.code === 'out-of-range'));
  assert.deepEqual(validateSituation(situation({ scrap: { engine: 'four-stroke', builtOn: '2026-11' }, date: '2026-11-26' })), []);
  assert.throws(() => evaluate(situation({ scrap: { engine: 'four-stroke', builtOn: '2027-01-15' }, date: '2026-11-26' })), /scrap\.builtOn/);
});

test('a scooter that turns 10 in 2027 hears about the options listed into 2027, with the day and the most it could get', () => {
  const e = evaluate(situation({ jurisdiction: 'kaohsiung', scrap: { engine: 'four-stroke', builtOn: '2017-02' }, date: '2026-11-26' }));
  const m = e.messages.find((x) => x.code === 'unconfirmed' && /turns 10 on 28 February 2027/.test(x.text.en));
  assert.ok(m, 'near-miss message');
  // one carbon reward and one air subsidy at most: TSMC 2,100 + Civil Aeronautics Administration 2,000
  assert.equal(m!.amount, 4100);
  assert.match(m!.text.en, /confirmed only to the end of 2026/);
});

test('R12: engine and data text never say "old scooter" or 舊車 on their own', () => {
  const bad = /(?<!老)舊車(?!齡)|\bold scooters?\b/i;
  for (const j of ['taipei', 'new-taipei', 'taichung', 'kaohsiung', 'kinmen', 'yilan', 'tainan', 'chiayi-county'] as const) {
    for (const scrap of [null, scrap2008, { engine: 'two-stroke' as const, builtOn: '2002-06' }]) {
      const e = evaluate(situation({ jurisdiction: j, scrap, gasolineModel: 'yamaha-jog-125', household: { age: 40 } }));
      for (const x of texts(e)) for (const s of [x['zh-TW'], x.en]) assert.doesNotMatch(s, bad, `${j}: ${s.slice(0, 120)}`);
    }
  }
});

test('Chinese dates are in the page form and years are Western; the fee riders call 燃料費 is named', () => {
  const e = evaluate(situation({ jurisdiction: 'new-taipei', scrap: scrap2008, household: { age: 40 } }));
  const zh = texts(e).map((x) => x['zh-TW']).join('\n');
  assert.doesNotMatch(zh, /\d{4}年\d/, 'unspaced date');
  assert.doesNotMatch(zh, /(?<![\d,（民國 ])(9\d|1[01]\d)\s?年(?!（)/, 'bare ROC year');
  assert.ok(e.gasoline.running.items.some((i) => i.id === 'road-fee' && i.label['zh-TW'] === '燃料費（公路養管費）'));
  assert.doesNotMatch(all(e), /requires scrapping an old|須符合：|上位辦法|middle-low income|需要淘汰一輛舊/);
});

test('changeDates gives the days a result changes, with the evaluation for each', () => {
  const s = situation({ jurisdiction: 'keelung', electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', gasolineModel: 'yamaha-jog-125', scrap: scrap2008, date: '2026-11-26' });
  const now = evaluate(s);
  assert.ok(now.electric.purchase.lines.some((l) => econData.programmes.find((p) => p.id === l.id)?.jurisdiction === 'keelung'));
  const c = changeDates(s);
  assert.equal(c[0].date, '2026-12-01', 'Keelung money and the November offers end on 30 November');
  assert.ok(!c[0].evaluation.electric.purchase.lines.some((l) => econData.programmes.find((p) => p.id === l.id)?.jurisdiction === 'keelung'));
  assert.ok(c.some((x) => x.date === '2027-01-01' && x.evaluation.messages.some((m) => m.code === 'programmes-ended')));
  for (const x of c) assert.deepEqual(x.evaluation, evaluate({ ...s, date: x.date }));
});

test('site-state: a city whose money closes on 30 November says so; an unchecked cap is not "places left"', () => {
  const snap = moneySnapshot(econData, '2026-11-26');
  for (const id of ['keelung', 'kinmen'] as const) {
    const c = cityMoney(id, '2026-11-26', snap);
    assert.equal(c.until, '2026-11-30', id);
    assert.notEqual(c.status, 'available', `${id}: remaining places were never checked`);
    const st = moneyState('2026-11-26', id, snap);
    assert.equal(st.cityDeadline, '2026-11-30');
    assert.equal(st.cityDaysLeft, 4);
    assert.equal(st.mayShowDayCount, false);
    assert.equal(cityMoney(id, '2026-12-01', snap).status, 'ended');
    assert.equal(moneyState('2026-12-01', id, snap).cityDeadline, undefined);
  }
  assert.equal(cityMoney('keelung', '2026-11-26', snap).unchecked, true);
  const tpe = cityMoney('taipei', '2026-11-26', snap);
  assert.equal(tpe.status, 'available', 'Taipei\'s remaining places were read from its live system');
  assert.equal(tpe.until, '2026-12-31');
  assert.equal(cityMoney('hsinchu-county', '2026-11-26', snap).status, 'unpublished');
});
