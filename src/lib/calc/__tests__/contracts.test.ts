// Engine contracts: input validation, Taiwan dates, chart labels that agree with the engine, and the
// behaviour the audit listed as untested (finding test-gaps).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { econData, evaluate, situation, twoStroke2002 } from './helpers.ts';
import { bestOptions, breakEvenText, CalcInputError, scanInterval, scanIntervals, taiwanDate, toBreakEven, toLedgerRows, todayInTaiwan, validateSituation } from '../index.ts';
import { breakEven } from '../compare.ts';
import { isCalendarDate } from '../dates.ts';
import type { EconDataset } from '../../../data/econ/types.ts';
import type { Evaluation, Situation } from '../types.ts';

const noNaN = (e: Evaluation) => {
  const walk = (v: unknown, path: string) => {
    if (typeof v === 'number') assert.ok(Number.isFinite(v), `${path} is ${v}`);
    else if (typeof v === 'string') assert.ok(!/NaN|Infinity|undefined/.test(v), `${path}: "${v}"`);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
  };
  walk(e, 'evaluation');
};

// ---------------------------------------------------------------- input validation (finding input-validation-nan)

test('invalid numbers give a typed validation result naming each field, never NaN in output', () => {
  const bad: [Partial<Situation>, string, string][] = [
    [{ horizonMonths: 0 }, 'horizonMonths', 'out-of-range'],
    [{ horizonMonths: -5 }, 'horizonMonths', 'negative'],
    [{ horizonMonths: 2.5 }, 'horizonMonths', 'not-integer'],
    [{ horizonMonths: Infinity }, 'horizonMonths', 'not-finite'],
    [{ monthlyKm: NaN }, 'monthlyKm', 'not-a-number'],
    [{ monthlyKm: Infinity }, 'monthlyKm', 'not-finite'],
    [{ monthlyKm: 0 }, 'monthlyKm', 'not-positive'],
    [{ monthlyKm: -100 }, 'monthlyKm', 'negative'],
    [{ energyPlan: 'gogoro-488', offWindowShare: NaN }, 'offWindowShare', 'not-a-number'],
    [{ energyPlan: 'gogoro-488', offWindowShare: 1.5 }, 'offWindowShare', 'out-of-range'],
    [{ household: { age: 17.5 } }, 'household.age', 'not-integer'],
    [{ date: '2026-13-01' }, 'date', 'bad-date'],
    [{ date: '2026-02-30' }, 'date', 'bad-date'],
    [{ scrap: { engine: 'two-stroke', builtOn: '2002-13' } }, 'scrap.builtOn', 'bad-date'],
  ];
  for (const [over, field, code] of bad) {
    const s = situation(over as Partial<Situation>);
    const issues = validateSituation(s);
    assert.ok(issues.some((i) => i.field === field && i.code === code), `${JSON.stringify(over)} -> ${JSON.stringify(issues)}`);
    assert.throws(
      () => evaluate(s),
      (err: unknown) => err instanceof CalcInputError && err.issues.some((i) => i.field === field) && /^\[calc\]/.test(err.message) && err.issues.every((i) => i.message['zh-TW'] && i.message.en),
    );
  }
  assert.deepEqual(validateSituation(situation()), []);
  assert.throws(() => bestOptions({ jurisdiction: 'taipei', scrap: null, household: {}, gasolineModel: 'kymco-new-haomai-125-drum', monthlyKm: NaN, date: '2026-11-25' }), CalcInputError);
});

test('a missing household is read as nothing declared; fractional km are fine; the output has no NaN', () => {
  const e = evaluate({ ...situation(), household: undefined as never });
  assert.deepEqual(e.situation.household, {});
  noNaN(e);
  noNaN(evaluate(situation({ monthlyKm: 512.5 })));
  noNaN(evaluate(situation({ energyPlan: 'gogoro-488', offWindowShare: 0 })));
  noNaN(evaluate(situation({ energyPlan: 'gogoro-488', offWindowShare: 1 })));
});

// ---------------------------------------------------------------- Taiwan dates

test('calendar dates are validated, leap years included', () => {
  assert.ok(isCalendarDate('2028-02-29'));
  assert.ok(!isCalendarDate('2027-02-29'));
  assert.ok(!isCalendarDate('2026-00-10'));
  assert.ok(!isCalendarDate('2026-04-31'));
  assert.ok(isCalendarDate('2003-12', true));
});

test('evaluation is in Taiwan time whatever the caller\'s time zone', () => {
  // 31 December 2026, 16:30 UTC is already 1 January 2027 in Taiwan.
  assert.equal(todayInTaiwan(new Date('2026-12-31T16:30:00Z')), '2027-01-01');
  assert.equal(todayInTaiwan(new Date('2026-12-31T15:59:00Z')), '2026-12-31');
  assert.equal(taiwanDate(new Date('2026-12-31T23:30:00-08:00')), '2027-01-01');
  const at = (date: string) => evaluate(situation({ date }));
  assert.equal(at('2026-12-31T17:00:00Z').situation.date, '2027-01-01');
  assert.ok(at('2026-12-31T17:00:00Z').messages.some((m) => m.code === 'programmes-ended'));
  assert.equal(at('2027-01-01T01:30:00+08:00').situation.date, '2027-01-01');
  assert.equal(at('2026-12-31T23:59:00+08:00').situation.date, '2026-12-31');
  assert.throws(() => at('2026-12-31T17:00:00'), CalcInputError, 'a timestamp without a zone is ambiguous');
  // Omitted date: today in Taiwan.
  const { date: _omit, ...rest } = situation();
  void _omit;
  const before = todayInTaiwan();
  const e = evaluate(rest as Situation);
  assert.ok([before, todayInTaiwan()].includes(e.situation.date));
});

// ---------------------------------------------------------------- chart labels (finding chart-label-contradicts-engine)

test('[test-gaps 1] the chart labels always agree with the engine, including ev-ahead and lines that cross back', () => {
  const cases = [
    situation({ scrap: twoStroke2002, household: { childUnder12: true, age: 38 }, electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-319-single', monthlyKm: 300 }),
    situation({ scrap: { engine: 'two-stroke', builtOn: '2001-01' }, monthlyKm: 2500, date: '2027-01-01' }),
    situation({ jurisdiction: 'hualien', gasolineModel: 'yamaha-jog-125', monthlyKm: 1000 }),
    situation({ jurisdiction: 'tainan', monthlyKm: 1500 }),
    situation({ jurisdiction: 'hualien', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', gasolineModel: 'sym-duke-125-drum', monthlyKm: 1500, offWindowShare: 0 }),
  ];
  for (const s of cases) {
    const e = evaluate(s);
    for (const locale of ['zh-TW', 'en'] as const) {
      const b = toBreakEven(e, locale);
      const text = breakEvenText(e.comparison.breakEven, locale);
      assert.equal(b.breakEvenText, text);
      assert.deepEqual(b.chartLabels, { breakEvenLabel: text, noBreakEvenLabel: text, aheadLabel: text });
      if (e.comparison.breakEven.kind === 'ev-ahead' || e.comparison.breakEven.kind === 'no-break-even') {
        assert.equal(b.labels.never, text, 'the label the chart shows when the lines do not cross is the engine answer');
        assert.equal(b.crossMonth, null);
      } else assert.equal(b.crossMonth, (e.comparison.breakEven as { month: number }).month);
      assert.equal(b.series.electric.length, 61);
    }
  }
  // Case 1 is cheaper to buy but dearer to run: not "Cheaper to buy and to run".
  const one = toBreakEven(evaluate(cases[0]), 'en');
  assert.doesNotMatch(one.breakEvenText, /Cheaper to buy and to run/);
  assert.match(one.breakEvenText, /costs more to run/);
  // A plain ev-ahead case puts electric first so the component's own "ahead" test can pass.
  const plain = toBreakEven(evaluate(situation({ jurisdiction: 'tainan', monthlyKm: 1500 })), 'en');
  if (plain.breakEven.kind === 'ev-ahead' && plain.breakEven.runningCheaper) assert.equal(plain.a.tone, 'clean');
});

test('[test-gaps 2] multi-crossing series: classification by the horizon, every crossing listed', () => {
  // Dearer to buy, briefly even, dearer again.
  assert.deepEqual(breakEven([10, 8, 6, 9, 12], [5, 7, 9, 10, 11]), { kind: 'no-break-even', gapAtHorizon: 1, crossings: [2, 4], horizonMonths: 4 });
  // Dearer to buy, even, dearer, even again and holding: the month is the last crossing.
  const b = breakEven([10, 8, 12, 9, 9], [5, 9, 11, 11, 12]);
  assert.equal(b.kind, 'breaks-even');
  if (b.kind === 'breaks-even') assert.equal(b.month, 3);
  // Cheaper to buy, dearer for a while, cheaper at the horizon.
  const c = breakEven([1, 5, 9, 9], [2, 4, 8, 10]);
  assert.equal(c.kind, 'ev-ahead');
  assert.deepEqual(c.crossings, [1, 3]);
  assert.match(breakEvenText(c, 'en', 3), /dearer for a few months in between/);
});

test('[test-gaps 3] horizons other than 60 months give matching series and text', () => {
  for (const [h, words] of [[36, 'three years'], [120, 'ten years'], [30, '30 months']] as const) {
    const e = evaluate(situation({ jurisdiction: 'hualien', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', monthlyKm: 300, horizonMonths: h }));
    assert.equal(e.comparison.cumulative.months.length, h + 1);
    assert.equal(e.electric.running.schedule.typical.length, h);
    assert.equal(e.comparison.breakEven.horizonMonths, h);
    const text = breakEvenText(e.comparison.breakEven, 'en');
    if (e.comparison.breakEven.kind === 'no-break-even' && !e.comparison.breakEven.crossings?.length) assert.equal(text, `No break-even within ${words}`);
    assert.ok(!e.messages.some((m) => /five years/.test(m.text.en)), `${h}: no "five years"`);
    const b = bestOptions({ jurisdiction: 'hualien', scrap: null, household: {}, gasolineModel: 'kymco-new-haomai-125-drum', monthlyKm: 300, date: '2026-11-25', horizonMonths: h });
    assert.equal(b.horizonMonths, h);
    assert.deepEqual(b.byNetPrice[0].horizonTotal, b.byNetPrice[0].fiveYearTotal);
  }
});

test('[test-gaps 4] running ranges stay ordered at high mileage', () => {
  for (const km of [1500, 3000, 5000]) {
    for (const [electricModel, energyPlan] of [['gogoro-ezzy', 'gogoro-payg-single'], ['gogoro-ezzy-500', 'gogoro-888'], ['ionex-coolone', 'ionex-518-single'], ['zau-es2000', 'home-charging']]) {
      const e = evaluate(situation({ jurisdiction: 'hualien', electricModel, energyPlan, monthlyKm: km }));
      for (const side of ['electric', 'gasoline'] as const) {
        const r = e[side].running;
        for (const x of [r.monthly, r.averageMonthly, r.annualAverage, ...r.items.map((i) => i.monthly)]) assert.ok(x.low <= x.typical && x.typical <= x.high, `${side} ${electricModel} ${km}: ${JSON.stringify(x)}`);
      }
    }
  }
});

test('[test-gaps 6] evaluate() never changes the dataset, and programme order does not change the money', () => {
  const snapshot = JSON.stringify(econData);
  const deepFreeze = <T>(o: T): T => {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      for (const v of Object.values(o)) deepFreeze(v);
    }
    return o;
  };
  const frozen = deepFreeze(JSON.parse(snapshot) as EconDataset);
  const sits = [
    situation({ scrap: twoStroke2002, household: { childUnder12: true, income: 'low' }, electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-payg-dual' }),
    situation({ jurisdiction: 'kinmen', scrap: twoStroke2002 }),
    situation({ jurisdiction: 'taichung', scrap: { engine: 'four-stroke', builtOn: '2005-03' }, electricModel: 'ionex-coolone', energyPlan: 'ionex-318-single', household: { income: 'low' } }),
    situation({ jurisdiction: 'tainan', scrap: { engine: 'four-stroke', builtOn: '2012-05' }, household: { deliveryRider: true } }),
  ];
  const reversed = { ...econData, programmes: [...econData.programmes].reverse() };
  for (const s of sits) {
    const a = evaluate(s);
    const b = evaluate(s, frozen);
    assert.deepEqual(b.electric.purchase.net, a.electric.purchase.net);
    const r = evaluate(s, reversed);
    for (const side of ['electric', 'gasoline'] as const) assert.equal(r[side].purchase.net.value, a[side].purchase.net.value, `${s.jurisdiction} ${side}`);
  }
  assert.equal(JSON.stringify(econData), snapshot);
});

test('[test-gaps 7] each bestOptions entry equals evaluate() for the same model and plan', () => {
  const base = { jurisdiction: 'taipei' as const, scrap: twoStroke2002, household: { childUnder12: true }, gasolineModel: 'kymco-new-haomai-125-drum', monthlyKm: 500, date: '2026-11-25' };
  const b = bestOptions(base);
  for (const o of b.byNetPrice) {
    const e = evaluate({ ...base, electricModel: o.electricModel, energyPlan: o.energyPlan });
    assert.equal(o.netPrice, e.electric.purchase.net.value);
    assert.equal(o.purchaseGap, e.comparison.purchaseGap);
    assert.deepEqual(o.fiveYearTotal, e.comparison.cumulative.electric[60]);
    assert.deepEqual(o.breakEven, e.comparison.breakEven);
  }
});

test('[test-gaps 8] a cap note reaches the ledger rows', () => {
  const data = { ...econData, evModels: econData.evModels.map((m) => (m.id === 'gogoro-ezzy' ? { ...m, listPrice: { ...m.listPrice, value: 30000 } } : m)) };
  const e = evaluate(situation({ scrap: twoStroke2002, household: { childUnder12: true, income: 'low' } }), data);
  const capped = e.electric.purchase.lines.find((l) => l.cappedFrom !== undefined);
  assert.ok(capped);
  const row = toLedgerRows(e, 'en').find((r) => r.id === capped.id);
  assert.match(row?.note ?? '', /payouts cannot exceed the purchase price/);
  assert.match(toLedgerRows(e, 'zh-TW').find((r) => r.id === capped.id)?.note ?? '', /補助不超過購車金額/);
});

test('[test-gaps 9] parity scans report every interval when the cost curve is not monotonic', () => {
  const f = (km: number) => (km >= 100 && km <= 200) || km >= 400 ? -1 : 1;
  assert.deepEqual(scanIntervals(f, 500), [{ fromKm: 100, toKm: 200 }, { fromKm: 400, toKm: null }]);
  assert.deepEqual(scanInterval(f, 500), { fromKm: 100, toKm: 200 }, 'the first interval, as documented');
  const e = evaluate(situation({ jurisdiction: 'hualien', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888' }));
  assert.deepEqual(e.comparison.runningParityKm, e.comparison.runningParityIntervals[0] ?? null);
  assert.deepEqual(e.comparison.totalParityKm, e.comparison.totalParityIntervals[0] ?? null);
});

test('[test-gaps 10] group-scoped messages attach to the right ledger; the EV road fee is worked out from the electric class', () => {
  const k = evaluate(situation({ jurisdiction: 'kinmen', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: twoStroke2002 }));
  const ev = k.messages.find((m) => m.code === 'ambiguity' && m.about?.includes('kinmen-vs-moenv') && m.text.en.startsWith('Electric'));
  const gas = k.messages.find((m) => m.code === 'ambiguity' && m.about?.includes('kinmen-vs-moenv') && m.text.en.startsWith('Gasoline'));
  assert.ok(ev && k.electric.purchase.messages.includes(ev));
  assert.ok(gas && k.gasoline.purchase.messages.includes(gas));
  // Road fee from 2031: (rate / 12) x months from 2031-01-01 to the horizon end (2031-11-01 for a 2026-11-25 start: 10 months).
  const fee = (electricModel: string, energyPlan: string) => evaluate(situation({ electricModel, energyPlan })).messages.find((m) => m.code === 'ev-road-fee')?.amount;
  assert.equal(fee('gogoro-ezzy-500', 'gogoro-888'), Math.round((450 / 12) * 10));
  assert.equal(fee('gogoro-ezzy', 'gogoro-488'), Math.round((300 / 12) * 10));
});
