// node --test: the date-state utility on both sides of the deadline.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { econData } from '../../data/econ/index.ts';
import { cityMoney, moneyPhase, moneySnapshot, moneyState, prePaintScript, todayInTaipei, tileState } from '../site-state.ts';
import type { Programme } from '../../data/econ/types.ts';

const snap = moneySnapshot(econData, '2026-11-25');

test('snapshot carries the registry dates', () => {
  assert.equal(snap.yearEnd, '2026-12-31');
  assert.equal(snap.filingEnd, '2027-01-10');
  assert.equal(snap.next.confirmed, false);
  assert.equal(Object.keys(snap.cities).length, 22);
  assert.equal(snap.cities.taipei.name['zh-TW'], '台北市'); // reader-facing 台, not 臺
});

test('phase by date: A to 12-31, B to the filing deadline, then C', () => {
  assert.equal(moneyPhase('2026-11-25', snap), 'A');
  assert.equal(moneyPhase('2026-12-31', snap), 'A');
  assert.equal(moneyPhase('2027-01-01', snap), 'B');
  assert.equal(moneyPhase('2027-01-10', snap), 'B');
  assert.equal(moneyPhase('2027-01-11', snap), 'C');
  assert.equal(moneyPhase('2027-06-01', snap), 'C');
});

test('no city: dates only, never a day count', () => {
  const s = moneyState('2026-11-25', null, snap);
  assert.equal(s.id, 'A-no-city');
  assert.equal(s.daysLeft, 36);
  assert.equal(s.mayShowDayCount, false);
  assert.equal(s.nothingConfirmed, true);
});

test('Kaohsiung: city money exhausted is a state, from the day it ran out', () => {
  assert.equal(moneyState('2026-08-10', 'kaohsiung', snap).id, 'A-city-open');
  const s = moneyState('2026-11-25', 'kaohsiung', snap);
  assert.equal(s.id, 'A-city-exhausted');
  assert.equal(s.city?.asOf, '2026-08-11');
  assert.equal(s.mayShowDayCount, false);
});

test('a city with money: status carries its check date; the day count is allowed', () => {
  const s = moneyState('2026-11-25', 'new-taipei', snap);
  assert.equal(s.id, 'A-city-open');
  assert.equal(s.city?.asOf, '2026-11-25');
  assert.equal(s.mayShowDayCount, true);
  assert.equal(s.daysLeft, 36);
});

test('a status goes stale: after three weeks the day count is withdrawn', () => {
  const s = moneyState('2026-12-20', 'new-taipei', snap);
  assert.equal(s.id, 'A-city-open');
  assert.equal(s.city?.stale, true);
  assert.equal(s.mayShowDayCount, false);
});

test('unverified county: 查不到, never zero and never "available"', () => {
  const s = moneyState('2026-11-25', 'hualien', snap);
  assert.equal(s.id, 'A-city-unknown');
  assert.equal(tileState(s.city!.status), 'unknown');
});

test('a programme running with no published quota is not called available', () => {
  assert.equal(cityMoney('taichung', '2026-11-25', snap).status, 'unpublished');
});

test('a city whose own window closes early: ended from the next day', () => {
  assert.notEqual(cityMoney('keelung', '2026-11-30', snap).status, 'ended');
  const s = cityMoney('keelung', '2026-12-01', snap);
  assert.equal(s.status, 'ended');
  assert.equal(s.asOf, '2026-11-30');
  assert.equal(tileState(s.status), 'exhausted');
});

test('after the deadline: B for filers, then C with a count of days without a programme', () => {
  const b = moneyState('2027-01-05', 'taipei', snap);
  assert.equal(b.id, 'B');
  assert.equal(b.filingOpen, true);
  assert.equal(b.daysLeft, 0);
  const c = moneyState('2027-02-01', 'taipei', snap);
  assert.equal(c.id, 'C');
  assert.equal(c.daysSince, 32);
  assert.equal(c.filingOpen, false);
  assert.equal(c.mayShowDayCount, false);
});

test('D: a programme that starts after 2026 is entered in the registry', () => {
  const base = econData.programmes.find((p) => p.id === 'moea-new-7000') as Programme;
  const data = { ...econData, programmes: [...econData.programmes, { ...base, id: 'moea-2027', validFrom: '2027-03-01', validTo: '2027-12-31' }] };
  const next = moneySnapshot(data, '2026-12-20');
  assert.equal(next.next.confirmed, true);
  assert.equal(next.next.from, '2027-03-01');
  // before the deadline the phase is still A, but "nothing confirmed" may no longer be said
  const a = moneyState('2026-12-20', null, next);
  assert.equal(a.phase, 'A');
  assert.equal(a.nothingConfirmed, false);
  assert.equal(moneyState('2027-01-05', null, next).id, 'D');
  assert.equal(moneyState('2027-04-01', null, next).id, 'D');
});

test('the pre-paint script agrees with moneyPhase()', () => {
  const run = (iso: string) => {
    const el = { dataset: {} as Record<string, string> };
    const RealDate = Date;
    const at = new RealDate(`${iso}T04:00:00Z`).getTime(); // noon in Taipei
    const fake = { documentElement: el };
    new Function('document', 'Date', prePaintScript(snap))(fake, Object.assign(function () {}, { now: () => at, prototype: RealDate.prototype }) && class extends RealDate { static now() { return at; } });
    return el.dataset.moneyPhase;
  };
  for (const d of ['2026-11-25', '2026-12-31', '2027-01-01', '2027-01-10', '2027-01-11']) assert.equal(run(d), moneyPhase(d, snap), d);
});

test('todayInTaipei: the date turns over at 16:00 UTC', () => {
  assert.equal(todayInTaipei(new Date('2026-12-31T15:59:00Z')), '2026-12-31');
  assert.equal(todayInTaipei(new Date('2026-12-31T16:00:00Z')), '2027-01-01');
});
