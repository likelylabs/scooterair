// Published worked examples: each test reproduces a figure stated in the research files from the
// dataset's own amounts, then checks what the engine counts and explains any difference.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { econData, evaluate, fourStroke2005, fourStroke2012, government, line, situation, sum, twoStroke2002 } from './helpers.ts';

const TAIPEI_CENTRAL_PUBLISHED = () => sum('moea-new-7000', 'moea-scrap-1000', 'moenv-carbon-moea', 'moenv-air-national', 'moenv-recycling-300');

test('Taipei: published NT$33,000 new-purchase maximum (heavy, child) is reproduced exactly', () => {
  assert.equal(sum('tpe-new-heavy', 'tpe-battery-topup', 'tpe-kangaroo', 'moea-new-7000'), 33000);
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', household: { childUnder12: true } }));
  assert.equal(government(e), 33000);
  assert.equal(e.electric.purchase.net.value, 74980 - 33000);
});

test('Taipei: derived NT$25,000 (heavy, no child) and NT$21,000 (light, no child)', () => {
  const heavy = evaluate(situation({ electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888' }));
  assert.equal(government(heavy), 25000);
  const light = evaluate(situation({ electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488' }));
  assert.equal(government(light), 21000);
});

test('Taipei: published NT$49,300 (two-stroke, heavy, child) and the engine total', () => {
  assert.equal(TAIPEI_CENTRAL_PUBLISHED(), 11300);
  assert.equal(sum('tpe-replace-2stroke-heavy', 'tpe-battery-topup', 'tpe-kangaroo') + TAIPEI_CENTRAL_PUBLISHED(), 49300);
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: twoStroke2002, household: { childUnder12: true } }));
  // The engine takes the best carbon buyer still open (TSMC 2,100, not MOEA's 2,000): 100 more.
  assert.equal(line(e, 'moenv-carbon-tsmc'), 2100);
  assert.equal(government(e), 49400);
  // Carbon and air are both counted but flagged "confirm first".
  assert.ok(e.messages.some((m) => m.code === 'ambiguity' && m.about?.includes('moenv-air-national') && m.amount === 1000));
});

test('Taipei: derived NT$38,300 (10+ year four-stroke, heavy, no child)', () => {
  assert.equal(sum('tpe-replace-old-heavy', 'tpe-battery-topup') + TAIPEI_CENTRAL_PUBLISHED(), 38300);
  const e = evaluate(situation({ electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: fourStroke2012 }));
  assert.equal(government(e), 38400);
});

test('Gogoro: NT$19,680 EZZY example = 59,980 − 40,300 (Taipei two-stroke, light, child, central)', () => {
  const published = sum('tpe-replace-2stroke-light', 'tpe-battery-topup', 'tpe-kangaroo') + TAIPEI_CENTRAL_PUBLISHED();
  assert.equal(published, 40300);
  const ezzy = econData.evModels.find((m) => m.id === 'gogoro-ezzy');
  assert.equal(ezzy?.listPrice.value, 59980);
  assert.equal(59980 - published, 19680);
  const e = evaluate(situation({ scrap: twoStroke2002, household: { childUnder12: true }, energyPlan: 'gogoro-319-single' }));
  assert.equal(e.electric.purchase.net.value, 19580); // TSMC carbon 2,100 instead of 2,000
});

test('Tainan: published NT$30,200 and NT$36,200 reproduce exactly (carbon via Tainan, air via STSP)', () => {
  const s = situation({ jurisdiction: 'tainan', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: fourStroke2012, household: { age: 27 } });
  const e = evaluate(s);
  assert.equal(line(e, 'moenv-carbon-tainan'), 1500, 'Tainan requires choosing the Tainan carbon reward');
  assert.equal(line(e, 'moenv-air-southern-park'), 2200);
  assert.equal(government(e), 30200);
  const low = evaluate({ ...s, household: { age: 27, income: 'low' } });
  assert.equal(government(low), 36200);
});

test('Taichung: city maxima 19,000 (general) and 33,000 (low income, scrap) from the amount table', () => {
  assert.equal(sum('tc-scrap-two-stroke', 'tc-child'), 19000);
  assert.equal(sum('tc-scrap-lowincome', 'tc-child'), 33000);
  const e = evaluate(situation({ jurisdiction: 'taichung', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: twoStroke2002, household: { childUnder12: true } }));
  assert.equal((line(e, 'tc-scrap-two-stroke') ?? 0) + (line(e, 'tc-child') ?? 0), 19000);
  assert.equal(line(e, 'tc-new'), undefined, 'scrap-and-replace replaces the new-purchase amount');
});

test('Taichung: the plan\'s cap example (NT$35,000 scooter, NT$37,100 total) leaves the city 27,900', () => {
  const data = {
    ...econData,
    programmes: econData.programmes.filter((p) => ['tc-scrap-lowincome', 'moea-new-5100', 'moenv-carbon-moea'].includes(p.id)),
    evModels: econData.evModels.map((m) => (m.id === 'ionex-ione-air' ? { ...m, listPrice: { ...m.listPrice, value: 35000 } } : m)),
  };
  const e = evaluate(situation({ jurisdiction: 'taichung', electricModel: 'ionex-ione-air', energyPlan: 'ionex-318-single', scrap: fourStroke2012, household: { income: 'low' } }), data);
  assert.equal(government(e), 35000);
  assert.equal(line(e, 'tc-scrap-lowincome'), 27900);
  assert.equal(e.electric.purchase.lines.find((l) => l.id === 'tc-scrap-lowincome')?.cappedFrom, 30000);
  assert.equal(e.electric.purchase.net.value, 0);
});

test('Kaohsiung: city-only NT$34,200 paper maximum before the money ran out', () => {
  const e = evaluate(situation({ jurisdiction: 'kaohsiung', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: fourStroke2012, household: { age: 25 }, date: '2026-07-01' }));
  const city = e.electric.purchase.lines.filter((l) => l.id.startsWith('khh-')).reduce((a, l) => a + l.amount, 0);
  assert.equal(city, 34200);
});

test('New Taipei: TVBS NT$39,600 best case is arithmetic on dataset amounts; the engine counts less', () => {
  assert.equal(sum('ntpc-replace-p13-heavy', 'ntpc-earlybird-addon', 'ntpc-double-scrap-addon') + sum('moea-new-7000', 'moenv-recycling-300', 'moenv-air-national', 'moenv-carbon-moea', 'moenv-recycling-300'), 39600);
  const e = evaluate(situation({ jurisdiction: 'new-taipei', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: { ...twoStroke2002, secondScooter: true }, date: '2026-10-01' }));
  // Conservative: early bird and double-scrap are not stacked (only TVBS adds them).
  assert.equal(line(e, 'ntpc-earlybird-addon'), 10000);
  assert.equal(line(e, 'ntpc-double-scrap-addon'), undefined);
  assert.ok(e.messages.some((m) => m.code === 'ambiguity' && m.amount === 9000));
});

test('Yilan: NT$19,000 press headline (low income, heavy, new) reproduces exactly; 27,300 = 16,000 + 11,300', () => {
  const e = evaluate(situation({ jurisdiction: 'yilan', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', household: { income: 'low' } }));
  assert.equal(government(e), 19000);
  assert.equal(amountOf('yilan-swap-heavy-priority') + 11300, 27300);
});

test('Chiayi City: press NT$24,300 from dataset amounts', () => {
  assert.equal(sum('chiayi-city-swap', 'moea-new-7000', 'moea-scrap-1000', 'moenv-carbon-moea', 'moenv-air-moea-south', 'moenv-recycling-300'), 24300);
  const e = evaluate(situation({ jurisdiction: 'chiayi-city', electricModel: 'gogoro-ezzy-500', energyPlan: 'gogoro-888', scrap: fourStroke2012 }));
  assert.equal(government(e), 24600); // TSMC 2,100 and STSP 2,200 are the best options still open
});

test('Gasoline promotions reproduce the manufacturers\' printed prices', () => {
  const at = (gasolineModel: string, scrap = fourStroke2005) => evaluate(situation({ jurisdiction: 'hualien', gasolineModel, scrap })).gasoline.purchase.net.value;
  assert.equal(at('kymco-new-haomai-125-drum'), 48200);
  assert.equal(at('kymco-new-haomai-125-drum', null as never), 53500);
  assert.equal(at('kymco-k1-125'), 60500);
  assert.equal(at('sym-duke-125-drum'), 48700);
  assert.equal(at('sym-duke-125-drum', null as never), 59000);
  assert.equal(at('sym-new-duke-125-drum'), 57200);
  assert.equal(at('sym-new-duke-125-drum', null as never), 61500);
  assert.equal(at('yamaha-jog-125'), 46700);
  assert.equal(at('yamaha-jog-125', null as never), 57000);
  // GP 125 (not in the calculator: no citable fuel economy) from its offer page arithmetic.
  const gp = econData.gasModels.find((m) => m.id === 'kymco-gp125-drum');
  assert.ok(gp);
  assert.equal(gp.listPrice.value - gp.promos.reduce((a, p) => a + p.amount, 0) - gp.goodsTaxScrapCut.value - 2000 - 300, 45600);
});

function amountOf(id: string) {
  return sum(id);
}
