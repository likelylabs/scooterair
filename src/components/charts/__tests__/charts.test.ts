// Run: node --test 'src/components/charts/__tests__/*.test.ts'
// The chart cores are pure functions, so their rules can be checked without a browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { est, estimateRangeSlots, estRange } from '../../../data/estimate.ts';
import { bandsModel, estimateRecords, estimateTable, mveModel } from '../core/estimateCharts.ts';
import { priceVerdict, renderPriceBars } from '../core/priceBars.ts';
import { renderMonthlyBars } from '../core/monthlyBars.ts';
import { renderWorkingSum, workingBusiest, workingHoursPerYear, workingKerbFlow, workingPerRed } from '../core/workingSum.ts';
import { tip } from '../core/shared.ts';

const locales = ['zh-TW', 'en'] as const;
const clean = (html: string) => assert.doesNotMatch(html, /NaN|undefined|null|\{[a-z]+\}|Infinity/, 'no unfilled slot in the markup');
const words = (html: string) => html.replace(/<[^>]+>/g, ' ');

test('G5: three rows, measured above the estimate, axis from 0 to 2, the rule-based finding', () => {
  for (const l of locales) {
    const m = mveModel(l);
    assert.deepEqual(m.rows.map((r) => r.kind), ['measured', 'measured', 'estimate']);
    assert.equal(m.axis.max, 2);
    assert.deepEqual(m.rows[1].dots, [...est.meas.iot.co.peaks]);
    assert.deepEqual(m.rows[2].band, { lo: est.co.dozen.total.lo, hi: est.co.dozen.total.hi });
    assert.ok(m.rows[2].dots === undefined, 'an estimate is never a dot');
    assert.match(m.rows[2].value, l === 'en' ? /^about .* to / : /^約 .* 到 /);
    assert.ok(m.who.share > 0 && m.who.share < 5, 'the whole chart is a small piece of the WHO bar');
    clean(m.summary);
    assert.ok(m.table.rows.every((r) => r.every((c) => c.trim())), 'no empty table cell');
  }
});

test('an estimate never prints its middle value', () => {
  for (const l of locales) {
    const all = [mveModel(l).summary, JSON.stringify(mveModel(l).table), ...(['co', 'benzene', 'pm25'] as const).flatMap((p) => { const b = bandsModel(p, l); return [b.summary, JSON.stringify(b.table), ...b.rows.map((r) => r.value + (r.total ?? ''))]; })].join(' ');
    // mids that are not also a published end of some range or a reference value
    assert.doesNotMatch(all, /(?<![\d.])0\.06(?![\d])/);
    assert.doesNotMatch(all, /(?<![\d.])0\.7(?![\d])/);
    assert.doesNotMatch(all, /(?<![\d.])0\.9(?![\d])/);
  }
});

test('range bands: a log axis that holds every mark, no empty panel, rows named with their counts', () => {
  for (const l of locales)
    for (const p of ['co', 'benzene', 'pm25'] as const) {
      const b = bandsModel(p, l);
      assert.equal(b.rows.filter((r) => r.mark === 'band').length, 3);
      for (const r of b.rows) for (const v of r.at) assert.ok(b.x(v) >= 0 && b.x(v) <= 100, `${p} ${r.id} on the axis`);
      for (const r of b.rows.filter((r) => r.mark === 'band')) assert.match(r.label, /\d/, 'scenario label carries its count');
      assert.ok(b.axis.ticks.length >= 3);
      clean(b.summary);
    }
  assert.ok(!bandsModel('co', 'en').rows.some((r) => /ultrafine|particle number/i.test(r.label)));
});

test('the numbers table covers every published add and total slot', () => {
  const slots = estimateTable('zh-TW').flatMap((g) => g.rows.map((r) => r.slot));
  for (const s of estimateRangeSlots.filter((x) => /\.add$/.test(x))) assert.ok(slots.includes(s), s);
  assert.equal(estimateRecords().length, 9);
  for (const r of estimateRecords()) assert.equal(r.addedLo, estRange(`${r.pollutant}.${r.scenario}.add`).lo);
  assert.ok(!('addedMid' in estimateRecords()[0]));
});

test('G12: verdict by the 1,000 rule, both bars to one scale, the bracket says which way', () => {
  const base = { locale: 'zh-TW' as const, plate: '綠牌' };
  assert.equal(priceVerdict({ petrol: { net: 46700, list: 66000 }, electric: { net: 44580, list: 59980 } }).verdict, 'cheaper');
  assert.equal(priceVerdict({ petrol: { net: 46700, list: 66000 }, electric: { net: 62580, list: 74980 } }).verdict, 'dearer');
  assert.equal(priceVerdict({ petrol: { net: 46700, list: 46700 }, electric: { net: 47100, list: 61000 } }).verdict, 'about-same');
  const cheaper = renderPriceBars({ ...base, petrol: { net: 46700, list: 66000, offWhat: '車廠折扣和減稅' }, electric: { net: 44580, list: 59980, offWhat: '補助' } });
  clean(cheaper);
  assert.match(words(cheaper), /電動機車少付 2,120 元/);
  assert.match(cheaper, /data-verdict="cheaper"/);
  assert.equal((cheaper.match(/class="hc-off /g) ?? []).length, 2, 'both list prices get their dashed extension');
  const dearer = renderPriceBars({ ...base, locale: 'en', plate: 'white plate', petrol: { net: 46700, list: 66000 }, electric: { net: 62580, list: 74980 } });
  clean(dearer);
  assert.match(words(dearer), /Electric: NT\$15,880 more/);
  const none = renderPriceBars({ ...base, petrol: { net: 53500, list: 53500 }, electric: { net: 49812, list: 49812 } });
  assert.equal((none.match(/class="hc-off /g) ?? []).length, 0);
});

test('G13: two filled bars, a divider, two outlined bars; ranges and single figures', () => {
  for (const l of locales) {
    const html = renderMonthlyBars({ locale: l, km: 300, petrol: 194, home: { lo: 22, hi: 28 }, swapPlan: 518, swapPayg: 504 });
    clean(html);
    assert.equal((html.match(/class="hc-outline /g) ?? []).length, 2);
    assert.match(html, /class="hc-divider"/);
    assert.match(words(html), l === 'en' ? /about NT\$22 to 28/ : /約 22 到 28 元/);
    assert.ok(html.indexOf('data-series="petrol"') < html.indexOf('hc-divider') && html.indexOf('hc-divider') < html.indexOf('data-series="swap-plan"'));
  }
});

test('G15: a sum has operators, a flow has none; an estimate result is the dashed box', () => {
  for (const l of locales) {
    const sum = renderWorkingSum(workingPerRed(l));
    clean(sum);
    assert.match(sum, /÷/);
    assert.match(sum, /hc-sum__box--estimate/);
    const flow = renderWorkingSum(workingKerbFlow(l));
    assert.doesNotMatch(words(flow), /[×÷＝＋]/, 'a flow carries no operator sign');
    assert.match(flow, /hc-sum__arrow/);
    for (const w of [workingPerRed(l), workingBusiest(l), workingHoursPerYear(4, l)]) clean(renderWorkingSum(w));
    assert.doesNotMatch(renderWorkingSum(workingHoursPerYear(4, l)), /hc-sum__box--estimate/, 'our arithmetic is a solid box');
  }
  assert.match(words(renderWorkingSum(workingBusiest('zh-TW'))), /約 1,500 輛.*83 秒.*3,600 秒.*約 34 輛/s);
});

test('tooltips: full-width colon in Chinese, the percent sign against its number', () => {
  assert.equal(tip('zh-TW', '不合格率 2025', '3.78', '%'), '不合格率 2025：3.78%');
  assert.equal(tip('en', 'Failure rate 2025', '3.78', '%'), 'Failure rate 2025: 3.78%');
  assert.equal(tip('zh-TW', '騎機車通勤', '53.6', 'µg/m³'), '騎機車通勤：53.6 µg/m³');
});
