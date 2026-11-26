// Programme rules: mutual exclusion, requirements, caps, expiry, quotas, unverified places.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { econData, evaluate, excludedReason, fourStroke2012, government, line, lineIds, situation, twoStroke2002 } from './helpers.ts';

test('mutual exclusion: Taipei counts one base subsidy (the largest) for a two-stroke', () => {
  const e = evaluate(situation({ scrap: twoStroke2002 }));
  const base = lineIds(e).filter((id) => ['tpe-new-light', 'tpe-replace-old-light', 'tpe-replace-2stroke-light'].includes(id));
  assert.deepEqual(base, ['tpe-replace-2stroke-light']);
  assert.equal(excludedReason(e, 'tpe-replace-old-light'), 'mutually-exclusive');
  assert.equal(excludedReason(e, 'tpe-new-light'), 'mutually-exclusive');
});

test('mutual exclusion: Tainan support projects count only once', () => {
  const e = evaluate(situation({ jurisdiction: 'tainan', household: { childUnder12: true, deliveryRider: true, age: 25 } }));
  const projects = lineIds(e).filter((id) => id.startsWith('tn-project-'));
  assert.equal(projects.length, 1);
});

test('mutual exclusion: Kinmen money or MOENV payments, not both (conservative), with the upside reported', () => {
  const e = evaluate(situation({ jurisdiction: 'kinmen', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: { engine: 'four-stroke', builtOn: '2005-08' } }));
  assert.equal(line(e, 'kinmen-swap'), 20000);
  assert.ok(!lineIds(e).some((id) => id.startsWith('moenv-')));
  assert.ok(e.messages.some((m) => m.code === 'ambiguity' && m.about?.includes('kinmen-vs-moenv') && (m.amount ?? 0) > 0));
});

test('requirement: Tainan scrap-and-replace takes the Tainan carbon reward, or is waived when it is gone', () => {
  const s = situation({ jurisdiction: 'tainan', scrap: fourStroke2012 });
  assert.equal(line(evaluate(s), 'moenv-carbon-tainan'), 1500);
  const gone = {
    ...econData,
    programmes: econData.programmes.map((p) => (p.id === 'moenv-carbon-tainan' ? { ...p, quota: { ...p.quota, status: 'exhausted' as const, asOf: '2026-11-01' } } : p)),
  };
  const e = evaluate(s, gone);
  assert.equal(line(e, 'tn-scrap-general-light'), 6500, 'city money still paid when the Tainan reward is used up');
  assert.equal(line(e, 'moenv-carbon-tsmc'), 2100);
});

test('caps: Taipei city money never exceeds the price paid; net never negative', () => {
  const data = { ...econData, evModels: econData.evModels.map((m) => (m.id === 'gogoro-ezzy' ? { ...m, listPrice: { ...m.listPrice, value: 30000 } } : m)) };
  const e = evaluate(situation({ scrap: twoStroke2002, household: { childUnder12: true, income: 'low' } }), data);
  const city = e.electric.purchase.lines.filter((l) => l.id.startsWith('tpe-')).reduce((a, l) => a + l.amount, 0);
  assert.ok(city <= 30000);
  assert.ok(e.electric.purchase.net.value >= 0);
  assert.ok(e.electric.purchase.lines.some((l) => l.cappedFrom !== undefined));
});

test('expiry: on 2026-12-31 the 2026 programmes count; on 2027-01-01 they have ended and the result says so', () => {
  const last = evaluate(situation({ scrap: fourStroke2012, date: '2026-12-31' }));
  assert.ok(lineIds(last).includes('moea-new-7000'));
  assert.ok(lineIds(last).includes('tpe-replace-old-light'));
  assert.equal(last.electric.purchase.lines.find((l) => l.id === 'moea-new-7000')?.daysLeft, 0);
  assert.ok(!last.messages.some((m) => m.code === 'programmes-ended'));

  const next = evaluate(situation({ scrap: fourStroke2012, date: '2027-01-01' }));
  assert.equal(government(next), 0);
  assert.equal(excludedReason(next, 'moea-new-7000'), 'expired');
  assert.equal(excludedReason(next, 'moenv-carbon-tsmc'), 'unconfirmed', 'listed to 2027 but only confirmed to 2026');
  const ended = next.messages.find((m) => m.code === 'programmes-ended');
  assert.ok(ended && ended.severity === 'critical');
  assert.match(ended.text.en, /no 2027 programme had been confirmed/);
  // Gasoline goods-tax cuts run to 2030 and still apply.
  assert.equal(line(next, 'gas-goods-tax-new-2000', 'gasoline'), 2000);
});

test('expiry: Kinmen and Keelung close for purchases after 30 November 2026', () => {
  const s = situation({ jurisdiction: 'kinmen', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: { engine: 'four-stroke', builtOn: '2005-08' } });
  assert.equal(line(evaluate({ ...s, date: '2026-11-30' }), 'kinmen-swap'), 20000);
  assert.equal(excludedReason(evaluate({ ...s, date: '2026-12-01' }), 'kinmen-swap'), 'expired');
  const k = evaluate(situation({ jurisdiction: 'keelung', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', date: '2026-12-01' }));
  assert.equal(excludedReason(k, 'keelung-new-heavy'), 'expired');
});

test('quota: Kaohsiung money counts before 2026-08-11 and is exhausted from that date', () => {
  const s = situation({ jurisdiction: 'kaohsiung', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888' });
  assert.equal(line(evaluate({ ...s, date: '2026-08-10' }), 'khh-new-heavy'), 4000);
  const after = evaluate(s);
  assert.equal(excludedReason(after, 'khh-new-heavy'), 'quota-exhausted');
  assert.ok(after.messages.some((m) => m.code === 'quota-exhausted'));
  // Nan Shan: the research has only a 0-places reading on 2026-11-25 and no programme dates, so it is never counted.
  assert.equal(excludedReason(evaluate(situation({ scrap: fourStroke2012 })), 'moenv-carbon-nanshan'), 'unverified');
});

test('quota: Taipei old-scooter heavy places nearly gone is warned, not excluded', () => {
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: fourStroke2012 }));
  assert.equal(line(e, 'tpe-replace-old-heavy'), 19000);
  assert.ok(e.messages.some((m) => m.code === 'quota-low' && m.about?.includes('tpe-replace-old-heavy')));
});

test('unverified jurisdiction: no local money, a warning with official links, central money still applies', () => {
  for (const j of ['taitung', 'penghu', 'lienchiang', 'hualien'] as const) {
    const e = evaluate(situation({ jurisdiction: j, scrap: fourStroke2012 }));
    assert.ok(e.electric.purchase.lines.every((l) => l.kind === 'dealer' || data(l.id)?.jurisdiction === 'central'));
    assert.ok(lineIds(e).includes('moea-new-7000'));
    const w = e.messages.find((m) => m.code === 'jurisdiction-not-verified');
    assert.ok(w && (w.links?.length ?? 0) > 0);
    assert.equal(e.jurisdiction.status, 'not-verified');
  }
  function data(id: string) {
    return econData.programmes.find((p) => p.id === id);
  }
});

test('regional MOENV options follow the buyer\'s area', () => {
  const tc = evaluate(situation({ jurisdiction: 'taichung', scrap: fourStroke2012 }));
  assert.equal(line(tc, 'moenv-air-central-park'), 2200);
  const tp = evaluate(situation({ scrap: fourStroke2012 }));
  assert.equal(line(tp, 'moenv-air-national'), 1000);
  assert.equal(excludedReason(tp, 'moenv-air-central-park'), 'not-eligible');
});

test('ambiguous income: Taoyuan "middle-low" top-up is not counted for a low-income household', () => {
  const e = evaluate(situation({ jurisdiction: 'taoyuan', household: { income: 'low' } }));
  assert.equal(excludedReason(e, 'ty-lowincome-or-fuxing'), 'ambiguous');
  const m = evaluate(situation({ jurisdiction: 'taoyuan', household: { income: 'middle-low' } }));
  assert.equal(line(m, 'ty-lowincome-or-fuxing'), 10000);
});

test('"up to" amounts stay ceilings: Taoyuan widens the net-price range and says so', () => {
  const e = evaluate(situation({ jurisdiction: 'taoyuan' }));
  const l = e.electric.purchase.lines.find((x) => x.id === 'ty-new');
  assert.ok(l?.isMaximum);
  assert.equal(e.electric.purchase.net.high - e.electric.purchase.net.value, 4000);
  assert.ok(e.messages.some((m) => m.code === 'up-to-amounts'));
});

test('unknown subclass: a green-plate model of unknown level gets 5,100 and the 1,900 difference is reported', () => {
  const e = evaluate(situation({ electricModel: 'ionex-ione-air', energyPlan: 'ionex-318-single' }));
  assert.equal(line(e, 'moea-new-5100'), 5100);
  assert.ok(e.messages.some((m) => m.code === 'ambiguity' && m.amount === 1900));
});

test('unlisted model: the ZAU ES-1000 gets no MOEA or local money and the result says why', () => {
  const e = evaluate(situation({ jurisdiction: 'yilan', electricModel: 'zau-es1000', energyPlan: 'home-charging' }));
  assert.equal(government(e), 0);
  assert.equal(excludedReason(e, 'moea-new-5100'), 'model-unknown');
  assert.ok(e.messages.some((m) => m.code === 'ambiguity' && m.about?.includes('moea-new-5100')));
  assert.equal(e.comparison.likeForLike.verdict, 'different-class');
});

test('domestic-cell bonus is never counted without proof', () => {
  for (const m of econData.evModels.filter((x) => x.calculator === true)) {
    const e = evaluate(situation({ electricModel: m.id, energyPlan: m.plans[0] }));
    assert.equal(line(e, 'moea-domestic-cells'), undefined);
  }
});

test('previous city subsidy excludes New Taipei money', () => {
  const e = evaluate(situation({ jurisdiction: 'new-taipei', household: { previousLocalSubsidy: true } }));
  assert.equal(excludedReason(e, 'ntpc-new-light'), 'not-eligible');
});
