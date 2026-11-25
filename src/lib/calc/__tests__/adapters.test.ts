// Adapters for WaterfallChart, Ledger and BreakEvenChart, and the best-options ranking.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestOptions, catalogue, toBreakEven, toLedgerRows, toWaterfall } from '../index.ts';
import { evaluate, situation, twoStroke2002 } from './helpers.ts';

test('toWaterfall: start − steps = electric net; compare is the gasoline net', () => {
  const e = evaluate(situation({ scrap: twoStroke2002, household: { childUnder12: true } }));
  for (const locale of ['zh-TW', 'en'] as const) {
    const w = toWaterfall(e, locale);
    assert.equal(w.start.value - w.steps.reduce((a, s) => a + s.value, 0), e.electric.purchase.net.value);
    assert.equal(w.compare.value, e.gasoline.purchase.net.value);
    assert.ok(w.steps.every((s) => s.label.length > 0));
  }
});

test('toWaterfall marks "up to" lines in the label', () => {
  const w = toWaterfall(evaluate(situation({ jurisdiction: 'taoyuan' })), 'en');
  assert.ok(w.steps.some((s) => s.label.endsWith('(up to)')));
});

test('toLedgerRows: base, minus lines, total, compare and a signed gap', () => {
  const e = evaluate(situation());
  const rows = toLedgerRows(e, 'zh-TW');
  assert.equal(rows[0].id, 'list');
  assert.equal(rows.filter((r) => r.kind === 'minus').length, e.electric.purchase.lines.length);
  assert.equal(rows.at(-3)?.kind, 'total');
  assert.equal(rows.at(-1)?.kind, 'gap');
  assert.match(rows.at(-1)!.amount, /^[−+]NT\$ /);
});

test('toBreakEven: higher purchase price first; end points match the engine totals', () => {
  const e = evaluate(situation({ jurisdiction: 'hualien', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', gasolineModel: 'sym-duke-125-drum', monthlyKm: 1500, offWindowShare: 0 }));
  const b = toBreakEven(e, 'en');
  assert.ok(b.a.upfront >= b.b.upfront);
  const H = b.months;
  const ev = b.a.tone === 'clean' ? b.a : b.b;
  assert.equal(Math.round(ev.upfront + ev.monthly * H), e.comparison.cumulative.electric[H].typical);
  assert.match(b.breakEvenText, /month \d+/);
});

test('bestOptions ranks every available model and plan and names the closest route to parity', () => {
  const b = bestOptions({ jurisdiction: 'taipei', scrap: twoStroke2002, household: { childUnder12: true }, gasolineModel: 'kymco-new-haomai-125-drum', monthlyKm: 500, date: '2026-11-25' });
  const n = catalogue().electricModels.filter((m) => m.available).reduce((a, m) => a + m.plans.length, 0);
  assert.equal(b.byNetPrice.length, n);
  for (let i = 1; i < b.byNetPrice.length; i++) assert.ok(b.byNetPrice[i].netPrice >= b.byNetPrice[i - 1].netPrice);
  for (let i = 1; i < b.byFiveYearTotal.length; i++) assert.ok(b.byFiveYearTotal[i].fiveYearTotal.typical >= b.byFiveYearTotal[i - 1].fiveYearTotal.typical);
  assert.ok(b.closestToParity);
  assert.ok(b.closestToParityLikeForLike === null || b.closestToParityLikeForLike.likeForLike !== 'different-class');
});
