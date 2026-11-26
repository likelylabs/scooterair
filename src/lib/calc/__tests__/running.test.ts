// Running costs, cumulative series, break-even and the parity mileages.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, situation } from './helpers.ts';
import { econData } from '../../../data/econ/index.ts';
import { getSeries } from '../../../data/series.ts';
import { evEnergy, gasFuel } from '../running.ts';

const heavy = (monthlyKm: number, offWindowShare = 0) =>
  situation({ jurisdiction: 'hualien', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', gasolineModel: 'sym-duke-125-drum', monthlyKm, offWindowShare });

test('break-even present: heavy rider at 1,500 km a month with every swap in a free window', () => {
  const e = evaluate(heavy(1500));
  assert.ok(e.comparison.purchaseGap > 0);
  assert.equal(e.comparison.breakEven.kind, 'breaks-even');
  if (e.comparison.breakEven.kind !== 'breaks-even') return;
  const m = e.comparison.breakEven.month;
  const c = e.comparison.cumulative;
  assert.ok(c.electric[m].typical <= c.gasoline[m].typical);
  assert.ok(c.electric[m - 1].typical > c.gasoline[m - 1].typical);
});

test('break-even absent: the same scooter at 300 km a month never catches up', () => {
  const e = evaluate(heavy(300));
  assert.equal(e.comparison.breakEven.kind, 'no-break-even');
  if (e.comparison.breakEven.kind === 'no-break-even') assert.ok(e.comparison.breakEven.gapAtHorizon > 0);
  assert.equal(e.comparison.breakEvenRange.worst.kind, 'no-break-even');
});

test('swap timing matters: half the swaps outside free windows removes the break-even at 1,500 km', () => {
  assert.equal(evaluate(heavy(1500, 0.5)).comparison.breakEven.kind, 'no-break-even');
  assert.ok(evaluate(heavy(1500)).messages.some((m) => m.code === 'plan-lock-in' && m.severity === 'warning'), 'warns near the fair-use threshold');
});

test('cumulative series: 61 points, starting at the purchase (plus setup fee) and adding each month', () => {
  const e = evaluate(situation({ energyPlan: 'gogoro-payg-single' }));
  const c = e.comparison.cumulative;
  assert.equal(c.months.length, 61);
  assert.equal(c.electric[0].typical, e.electric.purchase.net.value + 6000);
  assert.equal(c.gasoline[0].typical, e.gasoline.purchase.net.value);
  for (let m = 1; m <= 60; m++) assert.ok(c.electric[m].typical >= c.electric[m - 1].typical);
  // Pay-per-use setup fee is paid again at each 24-month renewal; the month-49 renewal covers months
  // 49-72, so only the 12 months inside the 60-month horizon (half the fee) are counted.
  const sched = e.electric.running.schedule.typical;
  assert.ok(sched[24] - sched[23] > 5999 && sched[24] - sched[23] < 6100);
  assert.ok(sched[48] - sched[47] > 2999 && sched[48] - sched[47] < 3100);
});

test('bounds are ordered: low <= typical <= high for every running total and cumulative point', () => {
  for (const s of [situation(), heavy(800, 0.5), situation({ jurisdiction: 'yilan', electricModel: 'zau-es1000', energyPlan: 'home-charging' })]) {
    const e = evaluate(s);
    for (const side of ['electric', 'gasoline'] as const) {
      const r = e[side].running.monthly;
      assert.ok(r.low <= r.typical && r.typical <= r.high, `${side} monthly`);
    }
    for (const p of e.comparison.cumulative.electric) assert.ok(p.low <= p.typical && p.typical <= p.high);
  }
});

test('itemised running costs: energy, plan fee, setup fee shown amortised and as paid, maintenance, road fee, inspection', () => {
  const e = evaluate(situation({ energyPlan: 'gogoro-payg-single' }));
  const ids = e.electric.running.items.map((i) => i.id);
  for (const id of ['energy', 'setup-fee', 'maintenance', 'road-fee', 'insurance', 'inspection']) assert.ok(ids.includes(id as never), id);
  const setup = e.electric.running.items.find((i) => i.id === 'setup-fee');
  assert.equal(setup?.paidUpfront, 6000);
  assert.equal(setup?.monthly.typical, 250);
  const gas = e.gasoline.running.items;
  assert.equal(gas.find((i) => i.id === 'road-fee')?.annual.typical, 450);
  assert.equal(e.electric.running.items.find((i) => i.id === 'road-fee')?.annual.typical, 0);
});

test('plan credits apply only to the right model and window: EZZY NT$151 for 24 months', () => {
  const e = evaluate(situation({ energyPlan: 'gogoro-319-single' }));
  const credit = e.electric.running.items.find((i) => i.id === 'plan-credit');
  assert.equal(credit?.monthly.typical, -151);
  assert.equal(credit?.months, 24);
  const later = evaluate(situation({ energyPlan: 'gogoro-319-single', date: '2027-01-05' }));
  assert.ok(!later.electric.running.items.some((i) => i.id === 'plan-credit'));
});

test('home charging is far cheaper per km than petrol; low-mileage swap subscriptions cost more than fuel', () => {
  const home = evaluate(situation({ jurisdiction: 'yilan', electricModel: 'zau-es1000', energyPlan: 'home-charging', monthlyKm: 500 }));
  const homeEnergy = home.electric.running.items.find((i) => i.id === 'energy')!.monthly.typical;
  const fuel = home.gasoline.running.items.find((i) => i.id === 'energy')!.monthly.typical;
  assert.ok(homeEnergy * 5 < fuel);
  const swap = evaluate(situation({ energyPlan: 'gogoro-488', monthlyKm: 300 }));
  const swapEnergy = swap.electric.running.items.filter((i) => i.id === 'energy' || i.id === 'plan-fee').reduce((a, i) => a + i.monthly.low, 0);
  assert.ok(swapEnergy > swap.gasoline.running.items.find((i) => i.id === 'energy')!.monthly.high);
});

test('petrol smoothing sensitivity: without it, gasoline costs more each month', () => {
  const e = evaluate(situation({ monthlyKm: 800 }));
  assert.ok(e.comparison.withoutSmoothing.gasolineMonthly > e.gasoline.running.monthly.typical);
  assert.ok(e.comparison.withoutSmoothing.gasolineMonthlyHigh > e.comparison.withoutSmoothing.gasolineMonthly);
  assert.ok(e.messages.some((m) => m.code === 'petrol-smoothing' && (m.amount ?? 0) > 0));
});

test('parity mileage: running-cost parity exists for the heavy 888 plan and is consistent with the scan', () => {
  const e = evaluate(heavy(500));
  const p = e.comparison.runningParityKm;
  assert.ok(p, 'expected a parity mileage');
  if (!p) return;
  const at = evaluate(heavy(p.fromKm));
  const below = evaluate(heavy(p.fromKm - 10));
  const avg = (x: typeof at) => x.electric.running.averageMonthly.typical - x.gasoline.running.averageMonthly.typical;
  assert.ok(avg(at) <= 1 && avg(below) > -1);
});

test('the narrative series still matches the engine (a data edit that changes it must update series.ts)', () => {
  const s = getSeries('econ-monthly-energy-cost-by-mileage');
  const M = (id: string) => econData.evModels.find((m) => m.id === id)!;
  const P = (id: string) => econData.plans.find((p) => p.id === id)!;
  const gas = econData.gasModels.find((m) => m.id === 'kymco-new-haomai-125-drum')!;
  const want: Record<string, (km: number) => number> = {
    petrolOfficial: (km) => gasFuel(gas, km, econData.fuel.petrol95.value, econData.fuel.realWorldKmPerL.value).low,
    petrolRealWorld: (km) => gasFuel(gas, km, econData.fuel.petrol95.value, econData.fuel.realWorldKmPerL.value).high,
    gogoro488Free: (km) => evEnergy(M('gogoro-ezzy'), P('gogoro-488'), km, 0).planFee,
    gogoro488Half: (km) => { const x = evEnergy(M('gogoro-ezzy'), P('gogoro-488'), km, 0.5); return x.planFee + x.energy.typical; },
    gogoro319: (km) => { const x = evEnergy(M('gogoro-ezzy'), P('gogoro-319-single'), km, 0.5); return x.planFee + x.energy.typical; },
    gogoroPayg: (km) => evEnergy(M('gogoro-ezzy'), P('gogoro-payg-single'), km, 0.5).energy.typical,
    ionex318: (km) => { const x = evEnergy(M('ionex-coolone'), P('ionex-318-single'), km, 0.5); return x.planFee + x.energy.typical; },
    ionex518: (km) => { const x = evEnergy(M('ionex-coolone'), P('ionex-518-single'), km, 0.5); return x.planFee + x.energy.typical; },
    homeCharging: (km) => evEnergy(M('zau-es1000'), P('home-charging'), km, 0.5).energy.typical,
  };
  for (const d of s.datasets) {
    const f = want[d.key];
    assert.ok(f, `no engine check for dataset ${d.key}`);
    for (const p of d.points) assert.equal(p.y, Math.round(f(Number(p.x))), `${d.key} at ${p.x} km`);
  }
});
