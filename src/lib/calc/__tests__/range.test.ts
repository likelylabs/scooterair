// Range warning (findings/electric.json #16): a home-charging scooter whose average day is longer
// than its sourced range on one charge gets a 'range' warning; swap scooters and short days do not.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { econData } from '../../../data/econ/index.ts';
import { evaluate } from '../index.ts';
import { situation } from './helpers.ts';

const base = { jurisdiction: 'new-taipei' as const, gasolineModel: 'yamaha-jog-125', date: '2026-11-26' };

test('every range figure is positive and sourced', () => {
  const withRange = econData.evModels.filter((m) => m.range);
  assert.ok(withRange.some((m) => m.id === 'zau-es1000'));
  for (const m of withRange) {
    assert.ok(m.range!.km > 0, m.id);
    assert.ok(m.range!.sources.length > 0, m.id);
    assert.ok(m.range!.text['zh-TW'] && m.range!.text.en, m.id);
  }
});

test('ES-1000 at 2,000 km a month (about 67 km a day, range 60 km) warns; at 1,500 km it does not', () => {
  const far = evaluate(situation({ ...base, electricModel: 'zau-es1000', energyPlan: 'home-charging', monthlyKm: 2000 }));
  const m = far.messages.find((x) => x.code === 'range');
  assert.ok(m, 'range message expected');
  assert.equal(m!.severity, 'warning');
  assert.match(m!.text['zh-TW'], /60公里/);
  assert.match(m!.text.en, /60 km/);
  const near = evaluate(situation({ ...base, electricModel: 'zau-es1000', energyPlan: 'home-charging', monthlyKm: 1500 }));
  assert.ok(!near.messages.some((x) => x.code === 'range'));
});

test('a swap scooter never gets the range message', () => {
  const swap = econData.evModels.find((m) => m.range && m.battery.system !== 'home' && m.calculator === true);
  if (!swap) return;
  const e = evaluate(situation({ ...base, electricModel: swap.id, energyPlan: swap.plans[0], monthlyKm: 6000 }));
  assert.ok(!e.messages.some((x) => x.code === 'range'));
});
