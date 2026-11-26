// Invariants over a broad sweep of situations: every jurisdiction × old scooter × model × plan ×
// date × household. Net price never negative, ledgers add up exactly, every line is sourced,
// every message and label exists in both languages and follows the copy rules.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { econData, evaluate } from './helpers.ts';
import { sources } from '../../../data/sources.ts';
import { jurisdictionIds } from '../../../data/econ/types.ts';
import type { Evaluation, OldScooter, Situation } from '../types.ts';
import type { L10n } from '../../../data/types.ts';

// The same copy rules as scripts/check-data.mjs.
const ZH_BAD = [/(?<!\d),|,(?!\d)/, /[()]/, /;/, /(?<!\d):|:(?!\d)/, /[!?]/, /\.(\s|$)/, /["']/];
const EN_BAD = /[，。（）「」；：！？、]/;
function checkText(where: string, v: L10n | undefined) {
  if (v === undefined) return;
  assert.ok(typeof v['zh-TW'] === 'string' && v['zh-TW'].trim() !== '', `${where}: empty zh-TW`);
  assert.ok(typeof v.en === 'string' && v.en.trim() !== '', `${where}: empty en`);
  for (const re of ZH_BAD) assert.ok(!re.test(v['zh-TW']), `${where}: zh-TW punctuation ${re} in "${v['zh-TW']}"`);
  // Reader-facing copy writes 台 (台灣, 台北...); only official agency names keep 臺, and those are payer fields, not checked here.
  assert.ok(!/臺(灣|北|中|南|東)/.test(v['zh-TW']), `${where}: use 台 in reader-facing copy: "${v['zh-TW']}"`);
  assert.ok(!EN_BAD.test(v.en), `${where}: full-width punctuation in "${v.en}"`);
  assert.ok(!/undefined|NaN|Infinity/.test(v.en + v['zh-TW']), `${where}: undefined/NaN in text`);
  assert.ok(!/0 days left|還有0天/.test(v.en + v['zh-TW']), `${where}: "0 days left" reads as already over`);
}

const scraps: (OldScooter | null)[] = [null, { engine: 'two-stroke', builtOn: '2001-08' }, { engine: 'four-stroke', builtOn: '2006-02' }, { engine: 'four-stroke', builtOn: '2013-11' }, { engine: 'four-stroke', builtOn: '2020-05' }];
const households = [{}, { income: 'low' as const, childUnder12: true, schoolChild: true, age: 26, deliveryRider: true, indigenous: true, remoteDistrict: true }];
const dates = ['2026-06-01', '2026-11-25', '2026-12-31', '2027-01-01'];
const models = econData.evModels.filter((m) => m.calculator === true);
const sourceIds = new Set(Object.keys(sources));

function* situations(): Generator<Situation> {
  for (const jurisdiction of jurisdictionIds)
    for (const scrap of scraps)
      for (const household of households)
        for (const date of dates) {
          const m = models[(jurisdiction.length + date.length + (scrap ? 1 : 0)) % models.length];
          const plan = m.plans[(jurisdiction.length + (household === households[0] ? 0 : 1)) % m.plans.length];
          yield { jurisdiction, scrap, household, electricModel: m.id, energyPlan: plan, gasolineModel: jurisdiction.length % 2 ? 'sym-duke-125-drum' : 'yamaha-jog-125', monthlyKm: 200 + (jurisdiction.length * 97) % 1300, date };
        }
}

function checkEvaluation(e: Evaluation, tag: string) {
  for (const side of ['electric', 'gasoline'] as const) {
    const p = e[side].purchase;
    const w = `${tag} ${side}`;
    assert.ok(p.net.value >= 0, `${w}: net price negative`);
    assert.ok(p.net.high >= p.net.value, `${w}: net range inverted`);
    assert.equal(p.listPrice.value - p.lines.reduce((a, l) => a + l.amount, 0), p.net.value, `${w}: ledger does not add up`);
    assert.equal(p.totalDeductions, p.lines.reduce((a, l) => a + l.amount, 0), `${w}: totalDeductions`);
    const ids = new Set<string>();
    for (const l of p.lines) {
      assert.ok(!ids.has(l.id), `${w}: line ${l.id} twice`);
      ids.add(l.id);
      assert.ok(Number.isInteger(l.amount) && l.amount >= 0, `${w}: line ${l.id} amount ${l.amount}`);
      assert.ok(l.sources.length > 0, `${w}: line ${l.id} has no source`);
      for (const s of l.sources) assert.ok(sourceIds.has(s), `${w}: line ${l.id} unknown source ${s}`);
      assert.ok(l.amount <= l.ruleAmount, `${w}: line ${l.id} above its rule amount`);
      assert.ok(l.daysLeft >= 0, `${w}: line ${l.id} counted after its deadline`);
      checkText(`${w} line ${l.id}`, l.label);
      checkText(`${w} line ${l.id} condition`, l.conditionText);
      checkText(`${w} line ${l.id} note`, l.note);
    }
    for (const x of p.excluded) {
      assert.ok(!ids.has(x.id), `${w}: ${x.id} both counted and excluded`);
      assert.ok(x.sources.length > 0, `${w}: excluded ${x.id} has no source`);
      checkText(`${w} excluded ${x.id}`, x.reasonText);
    }
    for (const it of e[side].running.items) checkText(`${w} item ${it.id}`, it.label);
  }
  for (const m of e.messages) checkText(`${tag} message ${m.code}`, m.text);
  if (e.situation.date > econData.meta.programmeYearEnd) {
    assert.ok(e.messages.some((m) => m.code === 'programmes-ended'), `${tag}: missing programmes-ended`);
    assert.ok(e.electric.purchase.lines.every((l) => l.kind === 'dealer' || l.validTo >= e.situation.date), `${tag}: expired line counted`);
  }
  if (e.jurisdiction.status === 'not-verified') {
    assert.ok(e.electric.purchase.lines.every((l) => l.kind === 'dealer' || econData.programmes.find((p) => p.id === l.id)?.jurisdiction === 'central'), `${tag}: local money in unverified place`);
  }
  assert.equal(e.comparison.cumulative.months.length, 61);
}

test('invariants hold across the sweep', () => {
  let n = 0;
  for (const s of situations()) {
    checkEvaluation(evaluate(s), `${s.jurisdiction}/${s.date}/${s.scrap?.builtOn ?? 'none'}/${s.electricModel}`);
    n++;
  }
  assert.ok(n > 800, `only ${n} situations`);
});

test('every model × plan combination evaluates', () => {
  for (const m of models)
    for (const plan of m.plans) {
      const e = evaluate({ jurisdiction: 'taipei', scrap: { engine: 'four-stroke', builtOn: '2012-01' }, household: {}, electricModel: m.id, energyPlan: plan, gasolineModel: 'kymco-k1-125', monthlyKm: 600, date: '2026-11-25' });
      checkEvaluation(e, `${m.id}/${plan}`);
    }
});

test('bad input fails loudly', () => {
  assert.throws(() => evaluate({ jurisdiction: 'taipei', scrap: null, household: {}, electricModel: 'nope', energyPlan: 'gogoro-488', gasolineModel: 'kymco-k1-125', monthlyKm: 500, date: '2026-11-25' }));
  assert.throws(() => evaluate({ jurisdiction: 'taipei', scrap: null, household: {}, electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-888', gasolineModel: 'kymco-k1-125', monthlyKm: 500, date: '2026-11-25' }), /does not fit/);
  assert.throws(() => evaluate({ jurisdiction: 'taipei', scrap: null, household: {}, electricModel: 'gogoro-luna', energyPlan: 'gogoro-488', gasolineModel: 'kymco-k1-125', monthlyKm: 500, date: '2026-11-25' }), /not available/);
  assert.throws(() => evaluate({ jurisdiction: 'taipei', scrap: null, household: {}, electricModel: 'gogoro-ezzy', energyPlan: 'gogoro-488', gasolineModel: 'kymco-k1-125', monthlyKm: 500, date: '26-11-2025' }), /Bad date/);
});
