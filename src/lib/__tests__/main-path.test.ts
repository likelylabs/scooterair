// node --test: the main path names neither carbon monoxide nor its guideline, and no page compares
// exhaust with a drinks can (site owner, 2026-11-28; claims-policy main-path-no-co, no-drinks-can).
// The same rule runs in scripts/check-copy.mjs over every string and in scripts/check-site.mjs over
// the built pages; this test runs it on the copy modules without a build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import home from '../../i18n/pages/home.ts';
import questions from '../../i18n/pages/questions.ts';
import share from '../../i18n/pages/share.ts';
import act from '../../i18n/pages/act.ts';
import { art } from '../../i18n/art.ts';
import { claimRules } from '../../data/claims-policy.ts';
import { MAIN_PATH_ALLOWED, mainPathWord, onMainPath } from '../main-path.ts';

type Leaf = { id: string; zh: string; en: string };
function leaves(value: unknown, id: string, out: Leaf[] = []): Leaf[] {
  if (!value || typeof value !== 'object') return out;
  const v = value as Record<string, unknown>;
  if (typeof v['zh-TW'] === 'string' && typeof v.en === 'string') {
    out.push({ id, zh: v['zh-TW'] as string, en: v.en as string });
    return out;
  }
  for (const [k, x] of Array.isArray(value) ? value.entries() : Object.entries(v)) leaves(x, `${id}.${k}`, out);
  return out;
}

const all = [...leaves(home, 'home'), ...leaves(questions, 'questions'), ...leaves(share, 'share'), ...leaves(act, 'act'), ...leaves(art, 'art.art')];

test('the main path carries no 一氧化碳 / carbon monoxide / CO / 指引值 / guideline / ppm', () => {
  const onPath = all.filter((l) => onMainPath(l.id));
  assert.ok(onPath.length > 300, `expected the home, question, share, print and picture strings (found ${onPath.length})`);
  const bad = onPath.filter((l) => !(MAIN_PATH_ALLOWED as readonly string[]).includes(l.id)).flatMap((l) => [mainPathWord(l.zh), mainPathWord(l.en)].filter(Boolean).map((w) => `${l.id}: 「${w}」`));
  assert.deepEqual(bad, []);
});

test('the one allowed sentence names the gas once and points to the method page', () => {
  for (const id of MAIN_PATH_ALLOWED) {
    const l = all.find((x) => x.id === id);
    assert.ok(l, `${id} exists`);
    assert.equal((l.zh.match(/一氧化碳/g) ?? []).length, 1);
    assert.match(l.zh, /「怎麼算的」/);
    assert.equal((l.en.match(/carbon monoxide/gi) ?? []).length, 1);
    assert.match(l.en, /How we worked it out/);
  }
});

test('no drinks can anywhere in this copy', () => {
  const pats = claimRules['no-drinks-can'].patterns;
  for (const l of all) {
    for (const p of pats['zh-TW']) assert.doesNotMatch(l.zh, new RegExp(p), l.id);
    for (const p of pats.en) assert.doesNotMatch(l.en, new RegExp(p, 'i'), l.id);
  }
});

test('the guard words: CO only as a capitalised word, so "co-" and "cost" pass', () => {
  assert.equal(mainPathWord('co-operation and costs'), null);
  assert.equal(mainPathWord('CO readings'), 'CO');
  assert.equal(mainPathWord('氣體和油氣'), null);
});
