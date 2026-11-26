// /electric/ result text against the engine's own numbers (review fixes, November 2026).
// Run: node --test 'src/components/pages/electric/__tests__/*.test.ts'
//
// model.ts imports the chart cores, which use extensionless imports; a small resolver is
// registered first so Node can load them as they are.

import { register } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

register(
  'data:text/javascript,' +
    encodeURIComponent(`export async function resolve(s, c, n) { try { return await n(s, c); } catch (e) { if (s.startsWith('.')) { for (const x of ['.ts', '/index.ts']) { try { return await n(s + x, c); } catch {} } } throw e; } }`),
);

const M = await import('../model.ts');
const { evaluate } = await import('../../../../lib/calc/index.ts');
const { econData } = await import('../../../../data/econ/index.ts');

const DATE = '2026-11-26';
const ctx = (locale: 'zh-TW' | 'en') => ({
  locale,
  data: econData,
  cite: () => null,
  id: 't',
  tableLabel: 'table',
  links: { checklist: '#c', notYet: '#n', closer: '#closer', noSocket: '#s', act: '/act/', actKeep: '/act/#keep', actPolicy: '/act/#policy' },
});
const run = (a: Record<string, unknown>, locale: 'zh-TW' | 'en' = 'zh-TW') => {
  const answers = { scrap: null, household: {}, plate: 'heavy', power: 'subscription', date: DATE, ...a } as Parameters<typeof M.choose>[0];
  const c = M.choose(answers, econData);
  const e = evaluate(c.situation, econData);
  return { e, r: M.renderResult(e, { ...c, plate: answers.plate, power: answers.power }, ctx(locale)) };
};
// Chinese amounts read 「4,480 元」 with a no-break space, as money() in model.ts prints them
const nt = (v: number) => `${new Intl.NumberFormat('zh-TW').format(Math.round(Math.abs(v)))}\u00a0元`;

test('verdict C with a pay-per-use setup fee says the fee, and the ledger adds up to the headline', () => {
  const { e, r } = run({ jurisdiction: 'keelung', monthlyKm: 1000, plate: 'any', power: 'payg' });
  const v = M.classify(e);
  assert.equal(v.verdict, 'C');
  assert.ok(e.electric.running.upfront > 0);
  assert.equal(r.value, new Intl.NumberFormat('zh-TW').format(v.upfrontGap));
  assert.ok(r.sentence.includes(nt(e.electric.running.upfront)), r.sentence);
  assert.ok(r.sentence.includes(nt(v.purchaseGap)), r.sentence);
  // the ledger shows the fee and the gap at the start, equal to the headline
  assert.ok(r.bodyHtml.includes(`+${nt(e.electric.running.upfront)}`));
  assert.ok(r.bodyHtml.includes(`${v.upfrontGap > 0 ? '+' : '−'}${nt(v.upfrontGap)}`));
});

test('the monthly difference quoted is the one in the table, and month N follows from it', () => {
  const { e, r } = run({ jurisdiction: 'taipei', monthlyKm: 400 });
  const ph = M.monthlyPhases(e);
  assert.ok(ph.later !== null && ph.until > 0, 'a temporary plan credit applies in this case');
  assert.ok(r.sentence.includes(nt(ph.now)) && r.sentence.includes(nt(ph.later!)), r.sentence);
  const v = M.classify(e);
  // the upfront saving divided by the current monthly difference lands on the crossing month
  assert.equal(Math.ceil(-v.upfrontGap / ph.now), v.month);
  assert.ok(!r.sentence.includes('照這樣算'));
});

test('the monthly table: neutral row names, each side named, a total that is the sum of its rows', () => {
  const { e, r } = run({ jurisdiction: 'taipei', monthlyKm: 400 });
  const sum = e.electric.running.items.reduce((t, i) => t + i.monthly.typical, 0);
  const total = r.bodyHtml.match(/<tr class="el-total">.*?<\/tr>/)![0];
  assert.ok(total.includes(nt(sum)), total);
  assert.ok(r.bodyHtml.includes('電池錢或油錢'));
  assert.ok(r.bodyHtml.includes('燃油：油錢（95無鉛）'));
  // a plan with no stated term is never called contract-free
  assert.ok(!r.bodyHtml.includes('不綁約'));
  const plan = econData.plans.find((p) => p.id === e.situation.energyPlan)!;
  assert.ok(r.bodyHtml.includes(plan.contract['zh-TW']));
  // notes are full-width rows named for their item, not a bare "?"
  assert.ok(!r.bodyHtml.includes('<summary>?</summary>'));
  assert.match(r.bodyHtml, /class="vh">「[^」]+」的說明/);
});

test('a distance with a decimal is shown as typed', () => {
  const { r } = run({ jurisdiction: 'taoyuan', monthlyKm: 2.5 }, 'en');
  assert.ok(r.note.startsWith('2.5 km'), r.note);
});

test('a list message is shown as a list', () => {
  const { r } = run({ jurisdiction: 'taipei', monthlyKm: 400 });
  assert.match(r.bodyHtml, /<ul class="el-msg__items"><li>/);
});
