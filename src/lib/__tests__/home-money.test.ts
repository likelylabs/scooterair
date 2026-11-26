// node --test: the money of home screens 12 and 13 (src/lib/home-money.ts), pinned to the engine.
// Every figure is recomputed here straight from evaluate() / bestOptions() and must be equal; the
// date tests are acceptance check 24 (building or viewing on 2026-12-01 and 2027-01-01).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { econData } from '../../data/econ/index.ts';
import type { JurisdictionId } from '../../data/econ/types.ts';
import { economics } from '../../data/facts-economics.ts';
import { bestOptions, evaluate, rankingPairs, type Situation } from '../calc/index.ts';
import {
  ABOUT_SAME_NTD,
  DEFAULTS,
  HOME_KM,
  PAYBACK_HORIZON_MONTHS,
  SCRAP_KEYS,
  buyCase,
  compactHomeMoney,
  compactTimeline,
  defaultScrap,
  homeMoney,
  homeMoneyTimeline,
  monthCase,
  periodScript,
  pickPeriod,
  stripText,
  verdictOf,
  type BuyCase,
  type HomeMoney,
} from '../home-money.ts';

const NOW = '2026-11-26';
const DATES = [NOW, '2026-12-01', '2027-01-01'];
const COUNTIES = Object.keys(econData.jurisdictions) as JurisdictionId[];
const SAMPLE: JurisdictionId[] = ['new-taipei', 'taipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung', 'keelung', 'kinmen', 'hualien'];
const tables = new Map<string, HomeMoney>(DATES.map((d) => [d, homeMoney(d)]));
const m = (d: string) => tables.get(d)!;

const base = (county: JurisdictionId, scrap: 'yes' | 'no', date: string, km = 300) => ({ jurisdiction: county, scrap: scrap === 'yes' ? defaultScrap(date) : null, household: {}, monthlyKm: km, date });
const gasModels = () => econData.gasModels.filter((g) => g.calculator === true).map((g) => g.id);
const firstPair = () => rankingPairs(econData)[0];

/** The cheapest 125 cc petrol scooter by price paid, from evaluate() for every model. */
function engineGas(county: JurisdictionId, scrap: 'yes' | 'no', date: string) {
  const p = firstPair();
  return gasModels()
    .map((g) => ({ id: g, net: evaluate({ ...base(county, scrap, date), gasolineModel: g, electricModel: p.model.id, energyPlan: p.plan.id } as Situation).gasoline.purchase.net.value }))
    .sort((a, b) => a.net - b.net)[0];
}

test('the fact econ-no-2027-programme says: nothing confirmed; a draft pre-announced', () => {
  const f = economics['econ-no-2027-programme'];
  assert.equal(f.display.en, 'nothing confirmed for 2027');
  assert.match(f.display['zh-TW'], /還沒有確定/);
  assert.match(f.statement['zh-TW'], /草案/);
  assert.match(f.statement['zh-TW'], /預告/);
  assert.match(f.statement.en, /pre-announced/);
  assert.match(f.statement.en, /nothing was confirmed for 2027/);
  for (const s of [f.display['zh-TW'], f.statement['zh-TW']]) assert.doesNotMatch(s, /未公布|沒有公布/);
});

test('scrap "yes" is a scooter at least ten full years old all year', () => {
  assert.deepEqual(defaultScrap('2026-01-01'), { engine: 'four-stroke', builtOn: '2015-12', displacementCc: 125 });
  assert.equal(defaultScrap('2027-06-30').builtOn, '2016-12');
});

test('money.buy: the cheapest green-plate electric and the cheapest petrol, equal to the engine', () => {
  for (const date of DATES) {
    for (const county of SAMPLE) {
      for (const scrap of SCRAP_KEYS) {
        const c = m(date).buy[county][scrap];
        const gas = engineGas(county, scrap, date);
        assert.equal(c.gasoline.net, gas.net, `${date} ${county} ${scrap} petrol`);
        const ranked = bestOptions({ ...base(county, scrap, date), gasolineModel: c.gasoline.model } as Omit<Situation, 'electricModel' | 'energyPlan'>);
        const green = ranked.byNetPrice.filter((o) => o.plateClass === 'light')[0];
        const white = ranked.byNetPrice.filter((o) => o.plateClass === 'heavy')[0];
        assert.equal(c.electric.net, green.netPrice, `${date} ${county} ${scrap} green`);
        assert.equal(c.electric.plateClass, 'light');
        assert.equal(m(date).buyWhite[county][scrap].electric.net, white.netPrice, `${date} ${county} ${scrap} white`);
        const e = evaluate({ ...base(county, scrap, date), gasolineModel: c.gasoline.model, electricModel: c.electric.model, energyPlan: econData.evModels.find((x) => x.id === c.electric.model)!.plans[0] } as Situation);
        assert.equal(c.difference, e.comparison.purchaseGap);
        assert.equal(c.difference, c.electric.net - c.gasoline.net);
        assert.equal(c.differenceHigh, e.comparison.purchaseGapHigh);
        assert.equal(c.electric.listPrice - c.electric.lines.reduce((s, l) => s + l.amount, 0), c.electric.net, 'lines add up to the price paid');
        assert.equal(c.verdict, verdictOf(c.difference));
      }
    }
  }
});

test('every county and both answers are in the table, with names in 台', () => {
  for (const date of DATES) {
    for (const county of COUNTIES) for (const scrap of SCRAP_KEYS) {
      const c = m(date).buy[county][scrap];
      assert.ok(Number.isFinite(c.electric.net) && Number.isFinite(c.gasoline.net));
      assert.doesNotMatch(JSON.stringify([c.countyName, c.electric.lines.map((l) => [l.label, l.condition]), c.messages.map((x) => x.text)]), /臺/);
    }
  }
});

test('verdict rule: at least 1,000 cheaper / within 1,000 / dearer', () => {
  assert.equal(verdictOf(-ABOUT_SAME_NTD), 'cheaper');
  assert.equal(verdictOf(-ABOUT_SAME_NTD + 1), 'about-same');
  assert.equal(verdictOf(0), 'about-same');
  assert.equal(verdictOf(ABOUT_SAME_NTD), 'about-same');
  assert.equal(verdictOf(ABOUT_SAME_NTD + 1), 'dearer');
});

test('money.worst is the least favourable case among checked counties', () => {
  for (const date of DATES) {
    const t = m(date);
    const all: BuyCase[] = COUNTIES.flatMap((id) => [t.buy[id].yes, t.buy[id].no, t.buyWhite[id].yes, t.buyWhite[id].no]).filter((c) => c.countyStatus !== 'not-verified');
    assert.equal(t.worst.difference, Math.max(...all.map((c) => c.difference)), date);
    assert.notEqual(t.worst.countyStatus, 'not-verified');
  }
});

test('money.month: petrol, home charging, cheapest swap plan and pay-as-you-go, equal to the engine', () => {
  for (const date of DATES) {
    const t = m(date);
    const gas = t.buy[DEFAULTS.county][DEFAULTS.scrap].gasoline.model;
    for (const km of HOME_KM) {
      const x = t.month[km];
      const rows = rankingPairs(econData).map(({ model, plan }) => {
        const e = evaluate({ ...base(DEFAULTS.county, DEFAULTS.scrap, date, km), gasolineModel: gas, electricModel: model.id, energyPlan: plan.id } as Situation);
        const pick = (ids: string[]) => e.electric.running.items.filter((i) => ids.includes(i.id)).reduce((s, i) => s + i.monthly.typical, 0);
        return { plan, typical: pick(['energy', 'plan-fee', 'setup-fee']), petrol: e.gasoline.running.items.find((i) => i.id === 'energy')!.monthly.typical };
      });
      assert.equal(x.petrol.monthly.typical, rows[0].petrol, `${date} ${km} petrol`);
      const home = rows.filter((r) => r.plan.system === 'home').map((r) => r.typical);
      assert.deepEqual(x.home.typical, { lo: Math.min(...home), hi: Math.max(...home) });
      assert.equal(x.swapPlan.monthly.typical, Math.min(...rows.filter((r) => r.plan.system !== 'home' && r.plan.monthlyFee > 0).map((r) => r.typical)));
      assert.equal(x.swapPayg.monthly.typical, Math.min(...rows.filter((r) => r.plan.system !== 'home' && r.plan.monthlyFee === 0).map((r) => r.typical)));
      assert.ok(x.home.typical.lo > 0 && x.home.typical.lo <= x.home.typical.hi);
    }
    // the browser call gives the same as the table
    assert.deepEqual(monthCase(300, { date, gasolineModel: gas }), t.month[300]);
  }
});

test('money.breakeven: the engine over ten years for the cheapest scooter that charges at home', () => {
  for (const date of DATES) {
    for (const county of ['new-taipei', 'kaohsiung', 'taipei'] as JurisdictionId[]) {
      for (const scrap of SCRAP_KEYS) for (const km of HOME_KM) {
        const b = m(date).breakeven[county][scrap][km];
        const e = evaluate({ ...base(county, scrap, date, km), gasolineModel: engineGas(county, scrap, date).id, electricModel: b.model, energyPlan: 'home-charging', horizonMonths: PAYBACK_HORIZON_MONTHS } as Situation);
        assert.deepEqual(b.engine, e.comparison.breakEven);
        assert.equal(b.purchaseGap, e.comparison.purchaseGap);
        assert.equal(b.monthlySaving, e.gasoline.running.averageMonthly.typical - e.electric.running.averageMonthly.typical);
        if (b.kind === 'pays-back') assert.ok(b.months! >= 1 && b.months! <= PAYBACK_HORIZON_MONTHS && b.purchaseGap > 0);
        if (b.kind === 'cheaper-on-day') assert.ok(b.purchaseGap <= 0);
      }
    }
  }
});

test('acceptance 24: on 2026-11-26 the strip names both deadlines', () => {
  const t = m(NOW);
  assert.equal(t.strip.kind, 'subsidy-and-promo');
  assert.deepEqual(t.deadline, { subsidy: '2026-12-31', promo: '2026-11-30' });
  assert.equal(stripText(t.strip, 'zh-TW'), '補助到 12 月 31 日。燃油機車的促銷到 11 月 30 日。');
  assert.equal(stripText(t.strip, 'en'), 'Subsidies end 31 December. Petrol-scooter promotions end 30 November.');
});

test('acceptance 24: on 2026-12-01 the petrol offers are gone, the subsidies stay', () => {
  const t = m('2026-12-01');
  assert.equal(t.phase, 'A');
  assert.equal(t.strip.kind, 'subsidy');
  assert.deepEqual(t.deadline, { subsidy: '2026-12-31', promo: null });
  assert.equal(stripText(t.strip, 'zh-TW'), '補助到 12 月 31 日。');
  assert.equal(stripText(t.strip, 'en'), 'Subsidies end 31 December.');
});

test('acceptance 24: on 2027-01-01 nothing is confirmed and the sums use no subsidy', () => {
  const t = m('2027-01-01');
  assert.equal(t.strip.kind, 'nothing-confirmed');
  assert.deepEqual(t.deadline, { subsidy: null, promo: null });
  const zh = stripText(t.strip, 'zh-TW');
  assert.equal(zh, '2027 年的補助還沒有確定。下面先用沒有補助的價格算。');
  assert.doesNotMatch(zh, /未公布|沒公布/);
  assert.equal(stripText(t.strip, 'en'), 'Nothing is confirmed yet for 2027 subsidies. The sums below use prices with no subsidy.');
  for (const id of COUNTIES) for (const s of SCRAP_KEYS) for (const c of [t.buy[id][s], t.buyWhite[id][s]]) {
    assert.equal(c.electric.lines.filter((l) => l.kind === 'subsidy').length, 0, `${id} ${s} counts no electric subsidy in 2027`);
  }
});

test('no stale line: every counted line is still valid on the table date', () => {
  for (const date of DATES) {
    const t = m(date);
    for (const id of COUNTIES) for (const s of SCRAP_KEYS) for (const c of [t.buy[id][s], t.buyWhite[id][s]]) {
      for (const l of [...c.electric.lines, ...c.gasoline.lines]) assert.ok(l.deadline >= date, `${date} ${id} ${s} ${l.id} ends ${l.deadline}`);
      if (c.deadlines.promo) assert.ok(c.deadlines.promo >= date);
    }
    for (const loc of ['zh-TW', 'en'] as const) assert.doesNotMatch(stripText(t.strip, loc), /\{|\}|undefined|null|NaN/);
  }
});

test('timeline: contiguous periods; each table is the one homeMoney() gives on its first day', () => {
  const periods = homeMoneyTimeline({ from: NOW, until: '2027-06-30' });
  assert.equal(periods[0].from, NOW);
  assert.equal(periods.at(-1)!.to, null);
  for (let i = 1; i < periods.length; i++) {
    const prev = new Date(Date.parse(`${periods[i].from}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
    assert.equal(periods[i - 1].to, prev);
    assert.equal(periods[i].money.date, periods[i].from);
  }
  const froms = periods.map((p) => p.from);
  assert.ok(froms.includes('2026-12-01') && froms.includes('2027-01-01'), froms.join(' '));
  assert.equal(pickPeriod(periods, '2026-11-30').from, NOW);
  assert.equal(pickPeriod(periods, '2026-12-01').money.strip.kind, 'subsidy');
  assert.equal(pickPeriod(periods, '2027-01-01').money.strip.kind, 'nothing-confirmed');
  assert.equal(pickPeriod(periods, '2026-01-01').from, NOW);

  // the pre-paint script picks the same period in the browser, from the clock in Taiwan
  const run = (iso: string) => {
    const ctx = { document: { documentElement: { dataset: {} as Record<string, string> } }, Date: class extends Date { static now() { return Date.parse(iso); } } };
    vm.runInNewContext(periodScript(periods), ctx);
    return Number(ctx.document.documentElement.dataset.moneyPeriod);
  };
  assert.equal(periods[run('2026-11-30T15:59:00Z')].from, NOW); // 23:59 on 30 November in Taiwan
  assert.equal(periods[run('2026-11-30T16:00:00Z')].from, '2026-12-01'); // 00:00 on 1 December in Taiwan
  assert.equal(periods[run('2026-12-31T16:30:00Z')].money.strip.kind, 'nothing-confirmed');

  const compact = compactTimeline(periods);
  assert.ok(JSON.stringify(compact).length < 60_000 * periods.length);
});

test('compact form carries the same figures', () => {
  const t = m(NOW);
  const c = compactHomeMoney(t);
  const d = c.buy[DEFAULTS.county][DEFAULTS.scrap];
  assert.equal(d.d, t.buy[DEFAULTS.county][DEFAULTS.scrap].difference);
  assert.equal(c.worst.d, t.worst.difference);
  assert.equal(c.month[300].petrol, t.month[300].petrol.monthly.typical);
  assert.equal(c.breakeven.kaohsiung.no[500].save, t.breakeven.kaohsiung.no[500].monthlySaving);
  assert.ok(c.names[d.em] && c.names[d.gm] && c.names['new-taipei']);
  assert.ok(JSON.stringify(c).length < 40_000, `compact is ${JSON.stringify(c).length} bytes`);
});

test('the browser call for one county equals the table', () => {
  const c = buyCase('kaohsiung', 'no', { date: NOW, plate: 'heavy' });
  assert.deepEqual(c, m(NOW).buyWhite.kaohsiung.no);
});
