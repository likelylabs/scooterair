// Run: node --test 'src/lib/__tests__/smell.test.ts'
// The smell-chemicals step on the site (research/simulation/smell-chemicals, signed 2026-11-27):
// the generated numbers equal results-smell.json, and the copy keeps statements-smell.json's
// pairing rules and must-nots in code, so a pattern allow-listed by mistake still cannot let them through.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { simData } from '../../data/simulation-data.ts';
import { facts } from '../../data/facts.ts';
import { factsForLink } from '../../data/chain.ts';
import { answers } from '../../data/answers.ts';
import { smellChemicals, smellEvidenceGroups } from '../../data/facts-smell.ts';
import { smellBenzeneModel } from '../../components/charts/core/simCharts.ts';
import { hanCount } from '../../components/ui/screen-limits.ts';
import home from '../../i18n/pages/home.ts';
import questions from '../../i18n/pages/questions.ts';
import estimate from '../../i18n/pages/estimate.ts';
import film from '../../i18n/pages/film.ts';
import about from '../../i18n/pages/about.ts';

const root = new URL('../../../', import.meta.url);
const RS = JSON.parse(readFileSync(new URL('research/simulation/smell-chemicals/results-smell.json', root), 'utf8'));
const C = simData.smellChemicals;
type L = { 'zh-TW': string; en: string };

/** Every { 'zh-TW', en } leaf under a value, with its path. */
function leaves(v: unknown, id: string, out: { id: string; text: L }[] = []): { id: string; text: L }[] {
  if (!v || typeof v !== 'object') return out;
  const o = v as Record<string, unknown>;
  if (typeof o['zh-TW'] === 'string' && typeof o.en === 'string' && Object.keys(o).length === 2) {
    out.push({ id, text: o as unknown as L });
    return out;
  }
  for (const [k, x] of Object.entries(o)) leaves(x, `${id}.${k}`, out);
  return out;
}

/** Every reader string the site prints: page copy, shared copy, chart words, facts and answers. */
async function readerStrings(): Promise<{ id: string; text: L }[]> {
  const out: { id: string; text: L }[] = [];
  const dir = new URL('src/i18n/pages/', root);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.ts') || f.startsWith('_')) continue;
    const m = await import(new URL(f, dir).href);
    leaves(m.default, f.replace(/\.ts$/, ''), out);
  }
  for (const f of ['src/i18n/ui.ts', 'src/i18n/art.ts', 'src/components/charts/strings.ts']) {
    const m = await import(new URL(f, root).href);
    for (const [k, x] of Object.entries(m)) leaves(x, `${f}:${k}`, out);
  }
  for (const [id, f] of Object.entries(facts)) for (const k of ['display', 'statement', 'caveat'] as const) if (f[k]) out.push({ id: `fact ${id}.${k}`, text: f[k] as L });
  for (const [id, a] of Object.entries(answers)) for (const k of ['question', 'answer', 'basis', 'caveat'] as const) out.push({ id: `answer ${id}.${k}`, text: (a as unknown as Record<string, L>)[k] });
  return out;
}

const sentences = (s: string, locale: 'zh-TW' | 'en') => (locale === 'en' ? s.split(/(?<=[.?!])\s+/) : s.split(/[。！？]/)).map((x) => x.replace(/\|/g, ''));

test('the generated numbers are results-smell.json’s', () => {
  const tl = RS.threshold_level.chemicals.benzene;
  assert.deepEqual([C.just.lo, C.just.c6800, C.just.c800, C.just.hi, C.just.n], [tl.DT6800.ppb.low, tl.DT6800.ppb.central, tl.DT800.ppb.central, tl.DT800.ppb.high, 10000]);
  assert.deepEqual([C.just.lo, C.just.c6800, C.just.c800, C.just.hi], [0.4, 1.7, 15, 58]);
  const p = RS.cases['S1-from'].probes['K d=0.5 dx=0.0 h=0.7'];
  assert.deepEqual([C.seconds.lo, C.seconds.c6800, C.seconds.c800, C.seconds.hi, C.seconds.n], [2.1, 27, 33, 360, 1000]);
  assert.equal(C.seconds.c800, p.levels_in_smellable_seconds.DT800.benzene.mean_over_smellable_seconds.ppb.central);
  assert.deepEqual([C.share800.lo, C.share800.c, C.share800.hi, ...C.share800.drawsAnyLowHigh], [0, 0.76, 0.97, 460, 1000]);
  assert.deepEqual([C.share6800.lo, C.share6800.c, C.share6800.hi], [0.83, 0.97, 0.99]);
  assert.deepEqual([C.canyon.a.drawsAny, ...C.canyon.a.drawsAnyLowHigh], [137, 3, 1000]);
  const bz = C.stay.find((s) => s.chem === 'benzene')!.rows[0];
  assert.deepEqual([bz.central, bz.low, bz.high, bz.refs[0].ugm3, bz.refs[0].stay], [62, 18, 200, 27, 'yes']);
  assert.equal(C.benzeneOwn.packMax, 0, 'no pack draw reaches benzene’s own odour threshold');
  assert.equal(C.acetaldehyde.awarePackMax, 0, 'acetaldehyde never reaches distinct awareness in a pack case');
});

test('the strongest line and what-is-in-it always come with "no smell does not mean clean air" in the same view', () => {
  const NO = { 'zh-TW': /聞不到[，,]?(也)?不代表(空氣)?乾淨/, en: /No smell does not mean clean air/i };
  const views: [string, L[]][] = [
    ['home screen 2', [home.s2.headline, ...home.s2.body]],
    ['/questions/smell/ screen 1', [questions.smell.s1.headline, questions.smell.s1.body]],
    ['/questions/smell/ card', [questions.items.smell.card]],
    ['/estimate/#smell', [estimate.smell.withTitle, ...estimate.smell.with]],
    ['film cue fuel', [film.cues.fuel.main, film.cues.fuel.note]],
    ['answer-odorants', [answers['answer-odorants'].answer]],
    ['/about/ correction', [about.corrections.nowText['smell-not-petrol']]],
  ];
  for (const [name, list] of views)
    for (const l of ['zh-TW', 'en'] as const) {
      const all = list.map((x) => x[l]).join(' ');
      assert.match(all, NO[l], `${name} (${l}) lacks no-smell-not-clean`);
    }
});

test('a Group 1 label for benzene, butadiene or formaldehyde always carries the meaning of the groups and exhaust’s 2B', async () => {
  const G1 = { 'zh-TW': /(苯|丁二烯|甲醛)[^。]{0,40}第\s?1\s?(類|級)/, en: /(benzene|butadiene|formaldehyde)[^.]{0,60}Group 1\b/i };
  const MEANING = { 'zh-TW': /證據/, en: /evidence/i };
  for (const s of await readerStrings())
    for (const l of ['zh-TW', 'en'] as const) {
      if (!G1[l].test(s.text[l])) continue;
      assert.match(s.text[l], MEANING[l], `${s.id} (${l}): Group 1 without what the groups mean`);
      assert.match(s.text[l], /2B/, `${s.id} (${l}): Group 1 without exhaust’s own Group 2B`);
    }
});

test('no sentence anywhere puts the smell and cancer together (statements-smell must-not 1)', async () => {
  const SMELL = { 'zh-TW': /(?<!新)聞|味道|臭(?!氧)/, en: /\b(smell|smells|smelled|odou?r|stink)/i };
  const CANCER = { 'zh-TW': /癌/, en: /cancer|carcinogen/i };
  const bad: string[] = [];
  for (const s of await readerStrings())
    for (const l of ['zh-TW', 'en'] as const)
      for (const x of sentences(s.text[l], l)) if (SMELL[l].test(x) && CANCER[l].test(x)) bad.push(`${s.id} (${l}): ${x}`);
  assert.deepEqual(bad, []);
});

test('the smell is never said to be unburnt petrol, and the film carries no cancer word', async () => {
  for (const l of ['zh-TW', 'en'] as const) {
    const f = `${film.cues.fuel.main[l]} ${film.cues.fuel.note[l]}`;
    assert.doesNotMatch(f, /癌|cancer|carcinogen|沒燒完|unburn/i);
  }
  const PETROL = { 'zh-TW': /(臭的是|味道是|聞到的是)[^。]{0,6}(油氣|沒燒完的汽油)/, en: /(smell is|you smell) (unburn|fuel vapou?r|petrol)/i };
  for (const s of await readerStrings()) for (const l of ['zh-TW', 'en'] as const) assert.doesNotMatch(s.text[l], PETROL[l], s.id);
});

test('the chart: two seconds-long rows, one line (benzene’s lowest published odour threshold), nothing else', () => {
  for (const l of ['zh-TW', 'en'] as const) {
    const m = smellBenzeneModel(l);
    assert.equal(m.rows.length, 2);
    assert.deepEqual([m.rows[0].lo, m.rows[0].hi, m.rows[1].lo, m.rows[1].hi], [C.just.lo, C.just.hi, C.seconds.lo, C.seconds.hi]);
    assert.equal(m.odour.value, (facts['odour-thresholds'].data as Record<string, { value: number }>).benzeneEpaLow.value * 1000);
    assert.ok(m.rows.every((r) => r.hi < m.odour.value), 'both bands stay below the odour line');
    assert.ok(m.axis.labelled.every((t) => m.axis.ticks.includes(t)));
    const words = JSON.stringify(m);
    assert.doesNotMatch(words, /15 ?min|30 ?min|1 ?h\b|1 小時|30 分鐘|一年|annual|year|癌|cancer|risk|風險|ppm/i);
  }
});

test('/evidence/: no list holds a seconds-long fact beside a 30-minute, 1-hour or lifetime one; link 4 holds no seconds fact', () => {
  const seconds = new Set<string>(smellEvidenceGroups.seconds);
  for (const id of smellEvidenceGroups.what) assert.ok(!seconds.has(id));
  for (const id of smellEvidenceGroups.averages) assert.ok(!seconds.has(id));
  const link4 = factsForLink(4).map((f) => f.id as string);
  for (const id of seconds) assert.ok(!link4.includes(id), `${id} is in the link-4 group with the WHO "no safe level" line`);
  assert.ok(link4.includes('who-benzene-no-safe-level'));
  for (const id of Object.keys(smellChemicals)) if (id !== 'iarc-group1-three') assert.equal(facts[id as keyof typeof facts].chainLink, null, id);
  // every smell fact is listed in one of the three /evidence/ lists or in the IARC table of link 4
  const listed = new Set<string>([...smellEvidenceGroups.what, ...smellEvidenceGroups.seconds, ...smellEvidenceGroups.averages, 'iarc-group1-three']);
  for (const id of Object.keys(smellChemicals)) assert.ok(listed.has(id), `${id} is on no /evidence/ list`);
});

test('home screens 2 and 5 stay inside their words-per-screen limits', () => {
  assert.ok(hanCount(home.s2.headline['zh-TW']) <= 22);
  assert.ok(home.s2.body.reduce((n, l) => n + hanCount(l['zh-TW']), 0) <= 45);
  assert.ok(hanCount(home.s2.quiet['zh-TW']) <= 30);
  assert.ok(hanCount(home.s5.quiet['zh-TW']) <= 30);
});

test('the one-page brief never prints the WHO "no safe level of benzene" beside its per-red values (must-not 2)', () => {
  const brief = readFileSync(new URL('src/pages/[...lang]/print/brief.astro', root), 'utf8');
  assert.doesNotMatch(brief, /benzeneWho|who-benzene-no-safe-level|no safe level|找不到安全/);
});
