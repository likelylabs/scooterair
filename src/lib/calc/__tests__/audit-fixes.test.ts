// Regression tests for the calculator audit of 2026-11-25. Each test names the finding it covers;
// every one failed against the engine as audited and passes now.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { econData, evaluate, excludedReason, fourStroke2005, fourStroke2012, government, line, lineIds, situation, twoStroke2002 } from './helpers.ts';
import { bestOptions, catalogue, toLedgerRows } from '../index.ts';
import { economics } from '../../../data/facts-economics.ts';
import { getSeries } from '../../../data/series.ts';
import type { Evaluation, Message } from '../types.ts';

const heavy = { electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888' } as const;
const msg = (e: Evaluation | { messages: Message[] }, code: Message['code'], about?: string) => e.messages.filter((m) => m.code === code && (!about || m.about?.includes(about)));
const allText = (e: { messages: Message[] }) => e.messages.map((m) => `${m.text.en} ${m.text['zh-TW']}`).join('\n');

// ---------------------------------------------------------------- six cities

test('[taichung-2026-movein-scrap-tier] a household that moved into Taichung in 2026 gets the new-purchase amount, not a scrap tier', () => {
  const s = situation({ jurisdiction: 'taichung', ...heavy, scrap: twoStroke2002 });
  const moved = evaluate({ ...s, household: { residentSince: '2026-04-01' } });
  assert.equal(line(moved, 'tc-scrap-two-stroke'), undefined);
  assert.equal(excludedReason(moved, 'tc-scrap-two-stroke'), 'not-eligible');
  assert.equal(line(moved, 'tc-new'), 3000);
  const settled = evaluate({ ...s, household: { residentSince: '2019-01-01' } });
  assert.equal(line(settled, 'tc-scrap-two-stroke'), 16000);
  const unknown = evaluate(s);
  assert.equal(line(unknown, 'tc-scrap-two-stroke'), 16000);
  assert.match(msg(unknown, 'assumption')[0].text.en, /own the scooter you scrap/);
});

test('[quota-exhausted-*] each exhausted programme carries its own reason and source', () => {
  const k = evaluate(situation({ jurisdiction: 'kaohsiung', ...heavy, energyPlan: 'gogoro-payg-dual', scrap: fourStroke2005, household: { age: 30, childUnder12: true } }));
  const m = msg(k, 'quota-exhausted')[0];
  assert.match(m.text.en, /11 August 2026/);
  assert.doesNotMatch(m.text.en, /Nan Shan|both lots/);
  assert.ok(m.sources?.includes('kaohsiung-epb-2026-budget-status'));
  const n = evaluate(situation({ jurisdiction: 'new-taipei', ...heavy, scrap: twoStroke2002 }));
  assert.match(msg(n, 'quota-exhausted')[0].text.en, /29 October 2026/);
  // Two different reasons in one message: both texts and both sources.
  const data = { ...econData, programmes: econData.programmes.map((p) => (p.id === 'moenv-carbon-nanshan' ? { ...p, calculator: true as const } : p)) };
  const both = evaluate(situation({ jurisdiction: 'kaohsiung', ...heavy, scrap: fourStroke2012, household: { age: 25 } }), data);
  const b = msg(both, 'quota-exhausted')[0];
  assert.match(b.text.en, /11 August 2026/);
  assert.match(b.text.en, /0 places left in both lots/);
  for (const src of ['kaohsiung-epb-2026-budget-status', 'moenv-platform-buyers']) assert.ok(b.sources?.includes(src as never), src);
});

test('[taoyuan-foreign-national-counted] Taoyuan money is not counted for a foreign national; the amount is reported as unclear', () => {
  const e = evaluate(situation({ jurisdiction: 'taoyuan', ...heavy, household: { foreignNational: true } }));
  assert.ok(!lineIds(e).some((id) => id.startsWith('ty-')));
  assert.equal(excludedReason(e, 'ty-new'), 'ambiguous');
  const m = msg(e, 'ambiguity', 'ty-new')[0];
  assert.equal(m.amount, 4000);
  assert.match(m.text.en, /residence permit/);
  // An ROC national still gets it.
  assert.equal(line(evaluate(situation({ jurisdiction: 'taoyuan', ...heavy })), 'ty-new'), 4000);
});

test('[taoyuan-income-exclusion-text] the middle-low / Fuxing top-up says what it needs', () => {
  const e = evaluate(situation({ jurisdiction: 'taoyuan', ...heavy, scrap: { engine: 'four-stroke', builtOn: '2017-03' }, household: { age: 30 } }));
  const x = e.electric.purchase.excluded.find((y) => y.id === 'ty-lowincome-or-fuxing');
  assert.ok(x);
  assert.match(x.reasonText.en, /lower-middle-income households only/);
  assert.match(x.reasonText.en, /Fuxing District/);
  assert.doesNotMatch(x.reasonText.en, /low or lower-middle/);
  assert.match(x.reasonText['zh-TW'], /復興區/);
});

test('[taoyuan-lowincome-ambiguity-no-message] a low-income Taoyuan buyer is told about the NT$10,000 at stake', () => {
  const e = evaluate(situation({ jurisdiction: 'taoyuan', ...heavy, household: { income: 'low' } }));
  const m = msg(e, 'ambiguity', 'ty-lowincome-or-fuxing')[0];
  assert.ok(m);
  assert.equal(m.amount, 10000);
  assert.equal(m.severity, 'warning');
  assert.ok(e.electric.purchase.messages.includes(m), 'attached to the electric ledger');
});

test('[ntpc-conservative-group-wrong-text] early bird versus double-scrap has its own explanation', () => {
  const s = situation({ jurisdiction: 'new-taipei', ...heavy, scrap: { ...twoStroke2002, secondScooter: true }, date: '2026-10-01' });
  const e = evaluate(s);
  assert.equal(line(e, 'ntpc-earlybird-addon'), 10000);
  const m = msg(e, 'ambiguity', 'ntpc-earlybird-vs-double')[0];
  assert.equal(m.amount, 9000);
  assert.doesNotMatch(m.text.en, /low-income/);
  assert.ok(!msg(e, 'ambiguity').some((x) => /low-income amount/.test(x.text.en)));
  const low = evaluate({ ...s, household: { income: 'low' } });
  assert.ok(msg(low, 'ambiguity').some((x) => /low-income amount/.test(x.text.en)));
});

test('[tpe-lowincome-stacking-secondary-unflagged] the stacked Taipei low-income top-up carries a warning with the NT$10,000 at stake', () => {
  const e = evaluate(situation({ ...heavy, household: { income: 'low' } }));
  assert.equal(line(e, 'tpe-lowincome-topup'), 10000);
  const m = msg(e, 'ambiguity', 'tpe-lowincome-topup')[0];
  assert.equal(m.amount, 10000);
  assert.equal(m.severity, 'warning');
  assert.ok(m.sources?.includes('taiwannews-2026-04-taipei-subsidy'));
});

test('[khh-lowincome-scrap-only-missing] a low-income Kaohsiung owner scrapping a two-stroke gets 2,000 (before the money ran out), not 1,000 and not both', () => {
  const s = situation({ jurisdiction: 'kaohsiung', scrap: { engine: 'two-stroke', builtOn: '2001-01' }, date: '2026-08-10' });
  const low = evaluate({ ...s, household: { income: 'low' } });
  assert.equal(line(low, 'khh-scrap-only-two-stroke-low', 'gasoline'), 2000);
  assert.equal(line(low, 'khh-scrap-only-two-stroke', 'gasoline'), undefined);
  assert.equal(line(evaluate(s), 'khh-scrap-only-two-stroke', 'gasoline'), 1000);
  assert.equal(excludedReason(evaluate({ ...s, household: { income: 'low' }, date: '2026-11-25' }), 'khh-scrap-only-two-stroke-low', 'gasoline'), 'quota-exhausted');
});

// ---------------------------------------------------------------- central

test('[cell-bonus-headline-11000] the central-subsidy fact no longer promises the unproven cell bonus', () => {
  const f = economics['econ-central-subsidy-2026'];
  assert.equal(f.data.moeaMax.value, 8000);
  assert.doesNotMatch(f.display.en + f.display['zh-TW'], /11,000/);
  assert.doesNotMatch(f.statement.en, /plus NT\$3,000/);
  assert.match(f.statement.en, /not counted/);
});

test('[goods-tax-stack-follows-weaker-reading] the stacked goods-tax cuts are flagged as secondary, with NT$2,000 at stake', () => {
  const e = evaluate(situation({ ...heavy, scrap: fourStroke2012 }));
  assert.equal(line(e, 'gas-goods-tax-new-2000', 'gasoline'), 2000);
  assert.equal(line(e, 'gas-goods-tax-scrap', 'gasoline'), 3600);
  const m = msg(e, 'ambiguity', 'gas-goods-tax-new-2000')[0];
  assert.equal(m.amount, 2000);
  assert.equal(m.severity, 'warning');
  assert.match(m.text.en, /^Gasoline:/);
  assert.match(msg(e, 'secondary-input')[0].text.en, /both goods-tax cuts counted on the gasoline side/);
});

test('[nanshan-counted-before-asof] the Nan Shan option is not counted on any date; TSMC is', () => {
  const e = evaluate(situation({ jurisdiction: 'taichung', ...heavy, scrap: fourStroke2012, household: { age: 30 }, date: '2026-11-24' }));
  assert.equal(line(e, 'moenv-carbon-nanshan'), undefined);
  assert.equal(excludedReason(e, 'moenv-carbon-nanshan'), 'unverified');
  assert.equal(line(e, 'moenv-carbon-tsmc'), 2100);
});

test('[recycling-300-age-unverified] the NT$300 recycling payment needs a scooter at least 7 years old (the stricter published reading)', () => {
  const young = evaluate(situation({ scrap: { engine: 'four-stroke', builtOn: '2020-01' } }));
  assert.equal(line(young, 'moenv-recycling-300'), undefined);
  assert.equal(line(young, 'moenv-recycling-300', 'gasoline'), undefined);
  assert.equal(excludedReason(young, 'moenv-recycling-300'), 'not-eligible');
  assert.equal(line(evaluate(situation({ scrap: { engine: 'four-stroke', builtOn: '2018-06' } })), 'moenv-recycling-300', 'gasoline'), 300);
});

test('[caa-air-small-pool-info-only] the 351-place CAA option warns that NT$1,000 of it may be gone', () => {
  const e = evaluate(situation({ jurisdiction: 'kaohsiung', ...heavy, scrap: fourStroke2012 }));
  assert.equal(line(e, 'moenv-air-caa'), 2000);
  const m = msg(e, 'quota-low', 'moenv-air-caa')[0];
  assert.equal(m.severity, 'warning');
  assert.equal(m.amount, 1000);
  assert.match(m.text.en, /351 places/);
  assert.match(m.text.en, /nationwide/);
  assert.ok(!msg(e, 'quota-unknown').some((x) => x.about?.includes('moenv-air-caa')));
});

// ---------------------------------------------------------------- counties

test('[kinmen-*] Kinmen money is set against the MOENV payments together; MOENV payments still stack with each other', () => {
  const base = { ...heavy, energyPlan: 'gogoro-payg-dual', scrap: twoStroke2002 } as const;
  const hualien = evaluate(situation({ jurisdiction: 'hualien', ...base, date: '2026-12-01' }));
  // (1) Kinmen money expired: the same lines and net as Hualien, no Kinmen ambiguity.
  const after = evaluate(situation({ jurisdiction: 'kinmen', ...base, date: '2026-12-01' }));
  assert.deepEqual(lineIds(after), lineIds(hualien));
  assert.equal(after.electric.purchase.net.value, 63580);
  assert.ok(!msg(after, 'ambiguity', 'kinmen-vs-moenv').length);
  // (2) Kinmen money not available for another reason (age 17).
  const minor = evaluate(situation({ jurisdiction: 'kinmen', ...base, household: { age: 17 } }));
  assert.equal(minor.electric.purchase.net.value, 63580);
  for (const id of ['moenv-carbon-tsmc', 'moenv-air-national', 'moenv-recycling-300']) assert.ok(lineIds(minor).includes(id), id);
  // (3) Kinmen money available: it is counted and every MOENV payment is set aside, upside 3,400.
  const now = evaluate(situation({ jurisdiction: 'kinmen', ...base }));
  assert.equal(line(now, 'kinmen-swap'), 20000);
  assert.ok(!lineIds(now).some((id) => id.startsWith('moenv-')));
  assert.equal(msg(now, 'ambiguity', 'kinmen-vs-moenv').find((m) => m.text.en.startsWith('Electric'))?.amount, 3400);
  // Gasoline side: the conservative reading drops the NT$300 and says so.
  const gasUp = msg(now, 'ambiguity', 'kinmen-vs-moenv').find((m) => m.text.en.startsWith('Gasoline'));
  assert.equal(gasUp?.amount, 300);
  assert.ok(now.gasoline.purchase.messages.includes(gasUp!), 'attached to the gasoline ledger');
  // previousLocalSubsidy on 2026-12-15 (finding kinmen-group-blocks-moenv-stacking): MOENV stacks.
  const prev = evaluate(situation({ jurisdiction: 'kinmen', ...base, scrap: fourStroke2012, household: { previousLocalSubsidy: true } }));
  assert.equal(government(prev), 7000 + 1000 + 2100 + 1000 + 300);
});

test('[nantou-scrap-only-missing] the Nantou NT$2,500 scrap-only payment is listed, not counted (its conditions are not published)', () => {
  const e = evaluate(situation({ jurisdiction: 'nantou', ...heavy, scrap: twoStroke2002 }));
  assert.equal(excludedReason(e, 'nantou-scrap-only', 'gasoline'), 'not-published');
  assert.equal(e.gasoline.purchase.excluded.find((x) => x.id === 'nantou-scrap-only')?.amount, 2500);
  assert.equal(line(e, 'nantou-scrap-only', 'gasoline'), undefined);
});

test('[yunlin-scrap-only-2000-missing] Yunlin pays NT$2,000 for scrapping any gasoline scooter built by 2015, never stacked on the two-stroke 5,000', () => {
  const four = evaluate(situation({ jurisdiction: 'yunlin', ...heavy, scrap: fourStroke2012 }));
  assert.equal(line(four, 'yunlin-scrap-only-2015', 'gasoline'), 2000);
  const two = evaluate(situation({ jurisdiction: 'yunlin', ...heavy, scrap: twoStroke2002 }));
  assert.equal(line(two, 'yunlin-scrap-only-two-stroke', 'gasoline'), 5000);
  assert.equal(line(two, 'yunlin-scrap-only-2015', 'gasoline'), undefined);
  assert.match(msg(four, 'secondary-input')[0].text.en, /Yunlin scrap a gasoline scooter only/);
});

test('[tiny-quota-*] a programme with a handful of places a year is counted with a warning and the price without it', () => {
  const e = evaluate(situation({ jurisdiction: 'keelung', ...heavy, energyPlan: 'gogoro-payg-dual', scrap: twoStroke2002 }));
  assert.equal(line(e, 'keelung-swap-two-stroke-heavy'), 12000);
  const m = msg(e, 'quota-low', 'keelung-swap-two-stroke-heavy')[0];
  assert.equal(m.severity, 'warning');
  assert.match(m.text.en, /6 places a year/);
  assert.equal(m.amount, 8000, 'the 4,000 new-purchase amount is the fallback');
  assert.ok(!msg(e, 'quota-unknown').some((x) => x.about?.includes('keelung-swap-two-stroke-heavy')));
  const four = evaluate(situation({ jurisdiction: 'keelung', ...heavy, energyPlan: 'gogoro-819-dual', gasolineModel: 'sym-duke-125-drum', scrap: fourStroke2005 }));
  assert.ok(msg(four, 'quota-low', 'keelung-swap-four-stroke-heavy').length);
  assert.doesNotMatch(econData.jurisdictions.keelung.statusNote.en, /probably/);
});

test('[pingtung-scrap-only-conflict-not-noted] the Pingtung scrap-only line names the conflicting figure', () => {
  const e = evaluate(situation({ jurisdiction: 'pingtung', scrap: twoStroke2002 }));
  const l = e.gasoline.purchase.lines.find((x) => x.id === 'pingtung-scrap-only');
  assert.equal(l?.amount, 1500);
  assert.match(l?.note?.en ?? '', /2,300/);
});

test('[kinmen-yilan-past-moenv-exclusion-not-in-assumption] the assumption names MOENV subsidies too', () => {
  const k = evaluate(situation({ jurisdiction: 'kinmen', ...heavy, scrap: twoStroke2002 }));
  assert.match(msg(k, 'assumption')[0].text.en, /MOENV or Kinmen EPB/);
  const y = evaluate(situation({ jurisdiction: 'yilan', energyPlan: 'gogoro-488', scrap: { engine: 'four-stroke', builtOn: '2010-01' } }));
  assert.match(msg(y, 'assumption')[0].text.en, /MOENV or Yilan County scooter subsidy in 2023–2025/);
});

// ---------------------------------------------------------------- vehicles, plans, energy

test('[ionex-allowance-*] Ionex plan credits buy energy at NT$52 per kWh when swapping (all bounds)', () => {
  for (const p of econData.plans.filter((x) => x.operator === 'ionex')) {
    assert.ok(p.usage.kind === 'credit');
    if (p.usage.kind !== 'credit') continue;
    // The exact allowance: rounding it to 0.1 kWh quietly took up to NT$2.6 a month off the credit.
    const kwh = p.usage.creditNtd / 52;
    assert.deepEqual([p.usage.allowance.low, p.usage.allowance.typical, p.usage.allowance.high], [kwh, kwh, kwh], p.id);
    assert.doesNotMatch(p.usage.allowance.typicalBasis.en, /when you swap/);
  }
  const at = (energyPlan: string, monthlyKm: number) => {
    const e = evaluate(situation({ jurisdiction: 'hualien', electricModel: 'ionex-coolone', energyPlan, monthlyKm }));
    return e.electric.running.items.filter((i) => i.id === 'energy' || i.id === 'plan-fee').reduce((a, i) => a + i.monthly.typical, 0);
  };
  assert.equal(at('ionex-518-single', 500), 699);
  assert.equal(at('ionex-318-single', 300), 566); // 318 + (300 / 31.3 − 250 / 52) × 52 = 566.4
  assert.equal(at('ionex-518-single', 800), 1197);
  const air = evaluate(situation({ electricModel: 'ionex-ione-air', energyPlan: 'ionex-318-single', gasolineModel: 'sym-new-duke-125-drum', monthlyKm: 300 }));
  assert.deepEqual([air.comparison.breakEven.kind, (air.comparison.breakEven as { month?: number }).month], ['gas-catches-up', 54]);
  // The published figure must be the engine's (566 since the credit is no longer rounded to 4.8 kWh).
  assert.equal(economics['econ-swap-vs-petrol-low-mileage'].data.ionex318At300.value, at('ionex-318-single', 300));
});

test('[gogoro-819-credit-missing / missing-gogoro-819-credit] the 819 plan carries NT$320 a month off for 24 months', () => {
  const e = evaluate(situation({ jurisdiction: 'new-taipei', ...heavy, energyPlan: 'gogoro-819-dual', gasolineModel: 'sym-duke-125-drum', scrap: fourStroke2005, household: { age: 30 } }));
  const c = e.electric.running.items.find((i) => i.id === 'plan-credit');
  assert.equal(c?.monthly.typical, -320);
  assert.equal(c?.months, 24);
  assert.deepEqual(e.electric.running.planCredits.applied.map((x) => x.total), [7680]);
  const b = bestOptions({ jurisdiction: 'taipei', scrap: null, household: {}, gasolineModel: 'sym-new-duke-125-drum', monthlyKm: 500, date: '2026-11-25' });
  assert.equal(b.byFiveYearTotal.find((o) => o.energyPlan === 'gogoro-819-dual')?.fiveYearTotal.typical, 104465);
  const later = evaluate(situation({ ...heavy, energyPlan: 'gogoro-819-dual', date: '2027-01-02' }));
  assert.ok(!later.electric.running.items.some((i) => i.id === 'plan-credit'));
});

test('[deadline-message-says-invoice-but-promos-need-plate] dealer offers that count the plate date say so', () => {
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-319-single', gasolineModel: 'yamaha-jog-125', monthlyKm: 300 }));
  const m = msg(e, 'deadline', 'yamaha-jog-credit-2026-11')[0];
  assert.match(m.text.en, /must be plated by this date \(the maker counts the plate date/);
  assert.doesNotMatch(m.text.en, /invoice date\) deadline/);
  assert.match(m.text['zh-TW'], /領牌/);
  const k = evaluate(situation({ scrap: fourStroke2012 }));
  assert.match(msg(k, 'deadline', 'kymco-new-haomai-scrap-2026-11')[0].text.en, /scrapped by 30 November 2026/);
  const nov = econData.gasModels.flatMap((m) => m.promos).filter((p) => p.when === 'always');
  assert.ok(nov.every((p) => !/Any November 2026 buyer/.test(p.conditionText.en)));
});

test('[jog-5000-stated-as-scrap-only] Yamaha\'s conditional NT$5,000 is reported as possible upside, not as a requirement', () => {
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-319-single', gasolineModel: 'yamaha-jog-125', monthlyKm: 300 }));
  assert.equal(e.gasoline.purchase.net.value, 57000);
  assert.equal(excludedReason(e, 'yamaha-jog-conditional-2026-11', 'gasoline'), 'ambiguous');
  const m = msg(e, 'ambiguity', 'yamaha-jog-conditional-2026-11')[0];
  assert.equal(m.amount, 5000);
  assert.match(m.text.en, /NT\$52,000/);
  // The NT$1,000 scrap bonus is plainly scrap-only.
  assert.equal(excludedReason(e, 'yamaha-jog-scrap-2026-11', 'gasoline'), 'not-eligible');
});

test('[missing-ionex-fly-techno-and-zau-es2000] verified white-plate models are in the catalogue, with the plans they use', () => {
  const c = catalogue();
  const fly = c.electricModels.find((m) => m.id === 'ionex-ione-fly-techno');
  const es2 = c.electricModels.find((m) => m.id === 'zau-es2000');
  assert.ok(fly?.available && es2?.available);
  assert.deepEqual(fly.plans, ['ionex-518-dual', 'ionex-818-dual', 'ionex-1218-dual', 'ionex-2018-dual']);
  assert.deepEqual(es2.plans, ['home-charging']);
  for (const id of ['ionex-ione-fly-techno', 'zau-es2000']) assert.equal(econData.evModels.find((m) => m.id === id)?.comparableTo125, 'unverified', `${id}: like-for-like stays off`);
  const z = evaluate(situation({ electricModel: 'zau-es2000', energyPlan: 'home-charging' }));
  assert.equal(government(z), 0 + (line(z, 'moenv-recycling-300') ?? 0), 'no MOEA or local money for an unlisted model');
  assert.ok(econData.evModels.find((m) => m.id === 'zau-es1000')?.note?.en.includes('ES-2000'));
});

test('[closest-lfl-includes-unverified] no model is nominated as like-for-like unless verified; the result says so', () => {
  const b = bestOptions({ jurisdiction: 'taipei', scrap: null, household: {}, gasolineModel: 'sym-new-duke-125-drum', monthlyKm: 300, date: '2026-11-25' });
  assert.equal(b.closestToParityLikeForLike, null);
  assert.equal(b.closestToParitySamePlateClass?.likeForLike, 'same-class-performance-unverified');
  const m = b.messages.find((x) => x.code === 'like-for-like');
  assert.match(m?.text.en ?? '', /No option is verified as a like-for-like substitute/);
});

// ---------------------------------------------------------------- running costs and break-even

test('[break-even-ignores-recrossing / breakeven-first-crossing-only] the answer is where the lines stand at the horizon', () => {
  const be = (o: Parameters<typeof situation>[0]) => evaluate(situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-payg-single', ...o })).comparison.breakEven;
  const a = be({ jurisdiction: 'hualien', gasolineModel: 'yamaha-jog-125', monthlyKm: 1000 });
  assert.equal(a.kind, 'no-break-even');
  assert.deepEqual(a.crossings, [21, 25]);
  assert.ok((a.gapAtHorizon ?? 0) > 0);
  const b = be({ jurisdiction: 'new-taipei', gasolineModel: 'kymco-k1-125', monthlyKm: 1000 });
  assert.equal(b.kind, 'ev-ahead');
  assert.ok((b.gapAtHorizon ?? 0) < 0);
  const c = be({ scrap: { engine: 'two-stroke', builtOn: '2001-01' }, monthlyKm: 2500, date: '2027-01-01' });
  assert.equal(c.kind, 'breaks-even');
  if (c.kind === 'breaks-even') assert.equal(c.month, c.crossings?.at(-1), 'the last crossing, after which it holds');
  const d = be({ jurisdiction: 'tainan', monthlyKm: 1500 });
  assert.equal(d.kind, 'ev-ahead');
});

test('[payg-renewal-beyond-horizon] the month-49 setup fee counts only for the months inside the horizon', () => {
  const e = evaluate(situation({ jurisdiction: 'hualien', energyPlan: 'gogoro-payg-single' }));
  const sched = e.electric.running.schedule.typical;
  assert.equal(Math.round(sched[48] - sched[47]), 3000);
  assert.match(e.electric.running.items.find((i) => i.id === 'setup-fee')?.note?.en ?? '', /months 49–72/);
});

test('[annual-excludes-setup-fee] annualAverage is the full yearly cost; item rows reconcile with it', () => {
  const r = evaluate(situation({ jurisdiction: 'hualien', energyPlan: 'gogoro-payg-single', monthlyKm: 1000 })).electric.running;
  assert.ok(Math.abs(r.annualAverage.typical - r.averageMonthly.typical * 12) <= 12);
  const rows = r.items.reduce((a, i) => a + i.annual.typical, 0);
  assert.ok(Math.abs(rows - r.annualAverage.typical) <= 12, `${rows} vs ${r.annualAverage.typical}`);
  assert.ok(Math.abs(r.annual.typical - (rows - r.items.find((i) => i.id === 'setup-fee')!.annual.typical)) <= 12, 'annual stays the ongoing figure');
});

test('[home-charge-no-losses-no-summer] home charging includes losses and summer months, and the series agrees', () => {
  const e = evaluate(situation({ jurisdiction: 'yilan', electricModel: 'zau-es1000', energyPlan: 'home-charging', monthlyKm: 500 }));
  const energy = e.electric.running.items.find((i) => i.id === 'energy');
  assert.equal(energy?.monthly.typical, 36);
  assert.match(energy?.note?.en ?? '', /losses/);
  assert.equal(getSeries('econ-monthly-energy-cost-by-mileage').datasets.find((d) => d.key === 'homeCharging')?.points.find((p) => p.x === '500')?.y, 36);
});

test('[gas-maintenance-low-below-schedule / maintenance-low-below-schedule] the low bound follows the schedule with distance', () => {
  for (const km of [1000, 1500, 3000]) {
    const g = evaluate(situation({ monthlyKm: km })).gasoline.running.items.find((i) => i.id === 'maintenance')!;
    assert.ok(g.monthly.low >= Math.round(0.42 * km) - 1, `gas at ${km}: ${g.monthly.low}`);
    assert.ok(g.monthly.low <= g.monthly.typical && g.monthly.typical <= g.monthly.high);
  }
  const ev = evaluate(situation({ electricModel: 'ionex-coolone', energyPlan: 'ionex-518-single', monthlyKm: 3000 })).electric.running.items.find((i) => i.id === 'maintenance')!;
  assert.equal(ev.monthly.low, 427);
});

test('[smoothing-wording] the smoothing texts give the scheduled end and the week of the absorbed amount', () => {
  assert.match(econData.fuel.smoothing.typicalBasis.en, /16–22 November 2026/);
  assert.match(econData.fuel.smoothing.mechanism.en, /due to end on 31 March 2027 unless extended/);
  assert.doesNotMatch(economics['econ-petrol-price-smoothing'].statement.en, /no end date/);
});

test('[horizon-text-*] text follows the horizon; the EV road fee uses the band of the electric model\'s class', () => {
  const e36 = evaluate(situation({ jurisdiction: 'hualien', ...heavy, monthlyKm: 300, horizonMonths: 36 }));
  assert.equal(e36.comparison.breakEven.kind, 'no-break-even');
  assert.match(msg(e36, 'petrol-smoothing')[0].text.en, /within three years/);
  assert.doesNotMatch(allText(e36), /five years/);
  const light = evaluate(situation({ energyPlan: 'gogoro-488' }));
  const fee = msg(light, 'ev-road-fee')[0];
  assert.match(fee.text.en, /50cc-or-less gasoline rate of NT\$300/);
  assert.match(msg(evaluate(situation(heavy)), 'ev-road-fee')[0].text.en, /125cc gasoline rate of NT\$450/);
});

// ---------------------------------------------------------------- dates and deadlines

test('[moea-after-1210-foreign-national] after 10 December a foreign national gets no MOEA money; Gogoro wording only for Gogoro', () => {
  const s = situation({ jurisdiction: 'new-taipei', ...heavy, gasolineModel: 'sym-duke-125-drum', household: { foreignNational: true } });
  const late = evaluate({ ...s, date: '2026-12-11' });
  assert.equal(line(late, 'moea-new-7000'), undefined);
  assert.equal(excludedReason(late, 'moea-new-7000'), 'expired');
  assert.equal(late.electric.purchase.net.value, 74980);
  assert.equal(late.comparison.purchaseGap, 480);
  assert.equal(msg(late, 'moea-filing')[0].severity, 'critical');
  assert.equal(line(evaluate({ ...s, date: '2026-12-10' }), 'moea-new-7000'), 7000);
  // An ROC national after 10 December keeps the money (the portal date is for foreign nationals).
  assert.equal(line(evaluate({ ...s, household: {}, date: '2026-12-11' }), 'moea-new-7000'), 7000);
  const ionex = evaluate(situation({ electricModel: 'ionex-ione-air', energyPlan: 'ionex-318-single', date: '2026-12-11' }));
  assert.doesNotMatch(msg(ionex, 'moea-filing')[0].text.en, /Gogoro/);
  const b = bestOptions({ jurisdiction: 'taipei', scrap: null, household: { foreignNational: true }, gasolineModel: 'kymco-new-haomai-125-drum', monthlyKm: 500, date: '2026-12-11' });
  assert.equal(b.byNetPrice.find((o) => o.electricModel === 'ionex-ione-air' && o.energyPlan === 'ionex-318-single')?.netPrice, evaluate(situation({ electricModel: 'ionex-ione-air', energyPlan: 'ionex-318-single', household: { foreignNational: true }, date: '2026-12-11' })).electric.purchase.net.value);
  assert.ok(b.messages.some((m) => m.code === 'moea-filing'));
});

test('[ntpc-stage1-deadline-hidden] New Taipei says stage 1 closes on 31 December, with documents by 10 January', () => {
  const e = evaluate(situation({ jurisdiction: 'new-taipei', ...heavy, energyPlan: 'gogoro-819-dual', gasolineModel: 'sym-duke-125-drum', scrap: fourStroke2005, household: { age: 30 }, date: '2026-12-28' }));
  const l = e.electric.purchase.lines.find((x) => x.id === 'ntpc-replace-p4-heavy');
  assert.equal(l?.applicationDeadline, '2026-12-31');
  assert.equal(l?.documentsDeadline, '2027-01-10');
  const m = msg(e, 'application-deadline', 'ntpc-replace-p4-heavy')[0];
  assert.match(m.text.en, /31 December 2026 \(stage 1; late applications are refused\), stage 2 documents by 10 January 2027/);
  assert.equal(m.severity, 'warning');
});

test('[deadline-omits-confirmedthrough-lines] lines listed to 2027 but confirmed only to 2026 are in the 31 December warning', () => {
  const e = evaluate(situation({ jurisdiction: 'taichung', ...heavy, energyPlan: 'gogoro-payg-dual', scrap: fourStroke2005, household: { age: 30 }, date: '2026-12-10' }));
  const m = msg(e, 'deadline', 'moenv-carbon-tsmc')[0];
  assert.ok(m.about?.includes('moenv-air-central-park'));
  assert.match(m.text.en, /31 December 2026/);
  assert.match(m.text.en, /only confirmed to this date/);
  const l = e.electric.purchase.lines.find((x) => x.id === 'moenv-carbon-tsmc')!;
  assert.deepEqual([l.deadline?.date, l.deadline?.basis, l.confirmedThrough], ['2026-12-31', 'confirmed-only', '2026-12-31']);
  // Every counted line with confirmedThrough is in some deadline message within 120 days of it.
  for (const x of e.electric.purchase.lines.filter((y) => y.confirmedThrough)) assert.ok(msg(e, 'deadline', x.id).length, x.id);
});

test('[plan-credit-expiry-silent] plan credits are in the deadline warning while valid and reported when they end', () => {
  const s = situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', scrap: fourStroke2012 });
  const before = evaluate({ ...s, date: '2026-12-10' });
  assert.match(msg(before, 'deadline', 'gogoro-ezzy-151-2026')[0].text.en, /order, pay in full and be invoiced/i);
  const after = evaluate({ ...s, date: '2027-01-01' });
  const m = msg(after, 'dealer-promo-expired', 'gogoro-ezzy-151-2026')[0];
  assert.equal(m.amount, 3624);
  const air = evaluate(situation({ electricModel: 'ionex-ione-air', energyPlan: 'ionex-318-single', date: '2026-12-10' }));
  assert.match(msg(air, 'deadline', 'ionex-q4-2026-99')[0].text.en, /plated by 31 December 2026/);
  assert.equal(msg(evaluate(situation({ electricModel: 'ionex-ione-air', energyPlan: 'ionex-318-single', date: '2027-01-01' })), 'dealer-promo-expired', 'ionex-q4-2026-99')[0].amount, 1188);
});

test('[bestoptions-hides-uncertainty] the ranking returns the warnings that go with it', () => {
  const b = bestOptions({ jurisdiction: 'taoyuan', scrap: twoStroke2002, household: { age: 40 }, gasolineModel: 'kymco-new-haomai-125-drum', monthlyKm: 500, date: '2026-11-25' });
  const codes = new Set(b.messages.map((m) => m.code));
  for (const c of ['up-to-amounts', 'deadline', 'application-deadline', 'moea-filing', 'quota-unknown', 'ambiguity', 'secondary-input', 'payout-timing'] as const) assert.ok(codes.has(c), c);
  assert.ok(b.byNetPrice.every((o) => o.hasUpToAmounts === o.netPriceHigh > o.netPrice));
  assert.ok(b.byNetPrice.every((o) => Array.isArray(o.warningCodes)));
});

test('[deadline-text-understates-requirements] the deadline gives the date and what is due by then, never a count of days', () => {
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', scrap: fourStroke2012, date: '2026-12-31' }));
  const m = msg(e, 'deadline', 'tpe-replace-old-light')[0];
  assert.match(m.text.en, /the deadline is 31 December 2026/);
  assert.match(m.text['zh-TW'], /期限是 2026 年 12 月 31 日/);
  assert.ok(m.items && m.items.length >= 1, 'one item per rule, for a list');
  assert.match(m.text.en, /plate the new scooter, and scrap and recycle the old one/);
  assert.match(m.text.en, /Register on the MOENV matching platform/);
  assert.doesNotMatch(allText(e), /\b0 days left|還有0天/);
  const l = e.electric.purchase.lines.find((x) => x.id === 'tpe-replace-old-light');
  assert.equal(l?.deadline?.lastDay, true);
  assert.equal(l?.daysLeft, 0, 'daysLeft keeps its old meaning');
  // R10: a countdown only beside the reader's city status in a verdict-A panel (the page fills it).
  for (const date of ['2026-11-26', '2026-12-30', '2026-12-31']) {
    for (const j of ['kaohsiung', 'kinmen', 'taipei', 'keelung'] as const) {
      const x = evaluate(situation({ jurisdiction: j, electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', gasolineModel: 'yamaha-jog-125', scrap: fourStroke2012, date }));
      for (const d of msg(x, 'deadline')) assert.doesNotMatch(`${d.text.en} ${d.text['zh-TW']}`, /\d+ days? left|last day|還有\s*\d+\s*天|剩下?\s*\d+\s*天|最後一天|倒數/, `${j} ${date}`);
    }
  }
});

test('[stale-notes-at-later-dates] after 31 March 2027 the smoothing note is in the past tense and the data age is stated', () => {
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', scrap: fourStroke2012, date: '2027-06-01' }));
  const p = msg(e, 'petrol-smoothing')[0];
  assert.equal(p.severity, 'warning');
  assert.doesNotMatch(p.text.en, /currently runs to/);
  assert.match(p.text.en, /which has passed/);
  assert.match(msg(e, 'stale-data')[0].text.en, /25 November 2026/);
  assert.match(econData.electricity.reviewNote.en, /\(checked 25 November 2026\)/);
  assert.equal(msg(evaluate(situation()), 'stale-data').length, 0);
});

test('[localized-text-errors] generated strings are true and not garbled', () => {
  // (a) no doubled "(up to)" suffix
  const ty = evaluate(situation({ jurisdiction: 'taoyuan', scrap: twoStroke2002 }));
  for (const locale of ['zh-TW', 'en'] as const) for (const r of toLedgerRows(ty, locale)) assert.doesNotMatch(r.label, /（最高）（最高）|\(maximum\) \(up to\)|\(up to\) \(up to\)/);
  // (b) a promotion not yet open says so, in the future tense
  const early = evaluate(situation({ gasolineModel: 'sym-duke-125-drum', date: '2026-11-01' }));
  const x = early.gasoline.purchase.excluded.find((y) => y.id === 'sym-duke-credit-2026-11');
  assert.equal(x?.reason, 'not-yet-valid');
  assert.match(x?.reasonText.en ?? '', /^Not yet open: the offer runs/);
  assert.match(x?.reasonText['zh-TW'] ?? '', /^尚未開始/);
  // (c) after the purchase window, the zh text says the purchase deadline has passed (applications run to 10 January)
  const jan = evaluate(situation({ scrap: fourStroke2012, date: '2027-01-05' }));
  assert.match(jan.electric.purchase.excluded.find((y) => y.id === 'tpe-replace-old-light')?.reasonText['zh-TW'] ?? '', /^已過購車期限/);
  // (d) the horizon in the text
  const h24 = evaluate(situation({ date: '2027-01-11', horizonMonths: 24 }));
  assert.doesNotMatch(allText(h24), /five years|五年/);
  // (e) no "only central money is counted" when no money is counted
  const hl = evaluate(situation({ jurisdiction: 'hualien', date: '2027-01-11' }));
  assert.match(msg(hl, 'jurisdiction-not-verified')[0].text.en, /no subsidy is counted/);
  // (f) secondary inputs of the ZAU listed without a doubled word
  const z = msg(evaluate(situation({ jurisdiction: 'yilan', electricModel: 'zau-es1000', energyPlan: 'home-charging' })), 'secondary-input')[0].text.en;
  assert.match(z, /km per unit of energy/);
  assert.match(z, /plate class/);
  assert.doesNotMatch(z, /tariff\) tariff/);
});

test('[quota-low-overstated] half the places left is not "few places left"', () => {
  const e = evaluate(situation({ jurisdiction: 'tainan', ...heavy, energyPlan: 'gogoro-payg-dual', scrap: fourStroke2005, household: { age: 30, childUnder12: true } }));
  assert.equal(line(e, 'moenv-carbon-tainan'), 1500);
  assert.ok(!msg(e, 'quota-low', 'moenv-carbon-tainan').length);
  assert.equal(econData.programmes.find((p) => p.id === 'moenv-carbon-tainan')?.quota.status, 'limited');
});

test('[promo-not-yet-valid-says-ended] a KYMCO offer before 1 November is "not yet open", not "ended"', () => {
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', date: '2026-10-15' }));
  const x = e.gasoline.purchase.excluded.find((y) => y.id === 'kymco-new-haomai-credit-2026-11');
  assert.equal(x?.reason, 'not-yet-valid');
  assert.doesNotMatch(x?.reasonText.en ?? '', /ended|ran/);
  assert.ok(!msg(e, 'dealer-promo-expired').length);
});

test('every finding-scoped published example still reproduces (Taipei, New Taipei, Taichung)', () => {
  assert.equal(government(evaluate(situation({ ...heavy, household: { childUnder12: true } }))), 33000);
  assert.equal(line(evaluate(situation({ jurisdiction: 'taichung', ...heavy, scrap: twoStroke2002, household: { childUnder12: true } })), 'tc-scrap-two-stroke'), 16000);
});

test('[found while fixing] Kinmen: a foreign national needs a year\'s household registration', () => {
  const s = situation({ jurisdiction: 'kinmen', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: twoStroke2002 });
  assert.equal(line(evaluate({ ...s, household: { foreignNational: true, residentSince: '2026-06-01' } }), 'kinmen-swap'), undefined);
  assert.equal(line(evaluate({ ...s, household: { foreignNational: true, residentSince: '2024-06-01' } }), 'kinmen-swap'), 20000);
  assert.equal(line(evaluate({ ...s, household: { residentSince: '2026-06-01' } }), 'kinmen-swap'), 20000);
});
