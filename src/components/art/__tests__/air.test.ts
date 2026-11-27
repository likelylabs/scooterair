// node --test: the air rule (redesign brief 5.1). Exhaust is drawn only as fume coming out of the
// scooters: no ring, dot, halo or key anywhere, and the amount where people stand follows the estimate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { AIR, AIR_SCENARIOS, air, airPuff, airPuffDefs, fumeSteps, fumeStrength, washStrength } from '../air.ts';
import { AIR_BACKGROUND_CO, AIR_EXTRA, AIR_RULE } from '../air-slots.ts';
import { cardArt, CARD_ART_KINDS } from '../card-art.ts';
import { heightsDrawing, kerbDrawing } from '../../pages/action/art.ts';
import { planView } from '../plan-view.ts';
import { BODY, MASK_FACE, MOUTH, bodyFigure, drinksCan, maskFace, person, pushchair, scooter } from '../parts.ts';

const frame = { x: 0, y: -350, w: 450, h: 425 };
const kerb = { x0: 8, x1: 286, sourceX: 296 };
const scene = (extra = {}) => air({ frame, id: 't', seed: 4, kerb, extra: AIR_EXTRA, scenario: 'all', tailpipes: [{ x: 296, y: -33 }], ...extra });
/** Anything that reads as a symbol instead of fume: the old marks, their halos, a key's glyphs, a breathing ring. */
const SYMBOL = /air-ring|air-dot|air-halo|air-tyre|air-glyph|air-legend|air-key|a-breath|<circle[^>]*class="[^"]*(?:air-|breath)/;
const ovalsOf = (svg: string) =>
  [...svg.matchAll(/<ellipse cx="([-\d.]+)" cy="([-\d.]+)" rx="([-\d.]+)" ry="([-\d.]+)"[^>]*opacity="([\d.]+)"/g)].map((m) => ({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4], k: +m[5] }));

test('the fume follows the signed estimate: 1, 3 and 6 steps; 6 / 18 / 36 % on average', () => {
  assert.deepEqual(AIR_EXTRA, { few: 1, dozen: 3, full: 6 });
  assert.equal(AIR_BACKGROUND_CO, 0.54);
  assert.deepEqual(AIR_RULE.fumePercent, { few: 6, dozen: 18, full: 36 });
  assert.equal(AIR_RULE.maxPercent, 62);
});

test('no picture draws a ring, a dot, a halo or a key: only fume (puffs, the kerb fume, wisps)', () => {
  for (const s of [...AIR_SCENARIOS, 'all'] as const) {
    const a = scene({ scenario: s, cars: [{ x: 440, y: -40 }] });
    assert.doesNotMatch(a.all, SYMBOL, s);
    assert.ok(a.all.includes('air-rib'), `${s}: it keeps the wisps`);
    assert.ok(a.all.includes('air-core'), `${s}: it keeps the puffs at the tailpipes`);
    assert.ok(a.wash.includes('<ellipse'), `${s}: it keeps the fume where people stand`);
  }
  // nothing in the module can draw one any more
  const src = readFileSync(new URL('../air.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /export function air(?:Ring|Dot|Glyph|Patch|TyreDust)\b/);
});

test('every share card, the print pictures and the plan draw fume only', () => {
  for (const kind of CARD_ART_KINDS) assert.doesNotMatch(cardArt(kind, { inlet: { lo: 2.5, hi: 3.5 }, red: 90 }).svg, SYMBOL, kind);
  for (const s of AIR_SCENARIOS) assert.doesNotMatch(kerbDrawing({ scenario: s }).svg, SYMBOL, s);
  assert.doesNotMatch(kerbDrawing({ electric: true }).svg, SYMBOL);
  assert.doesNotMatch(heightsDrawing().svg, SYMBOL);
  const p = planView();
  assert.doesNotMatch(p.figures + p.ground, SYMBOL);
});

test('no scene component or the film builds a ring, a dot or a key', () => {
  const dir = new URL('../', import.meta.url);
  const files = readdirSync(dir).filter((f) => /\.(astro|ts)$/.test(f)).map((f) => [f, readFileSync(new URL(f, dir), 'utf8')] as const);
  const film = new URL('../../pages/film/', import.meta.url);
  for (const f of ['scene.ts', 'Film.astro']) files.push([`film/${f}`, readFileSync(new URL(f, film), 'utf8')]);
  for (const [name, src] of files) {
    assert.doesNotMatch(src, /\bair(?:Ring|Dot|Glyph|Patch|TyreDust)\(|AirLegend|AirKey|AirRange|AIR_KEY|\bbreath\(|class="air-(?:ring|dot|halo|tyre)/, name);
  }
});

test('more scooters, thicker fume: few < dozen < full, in proportion to the carbon monoxide the pack adds, capped at washMax', () => {
  const a = scene();
  const w = a.counts.kerb!;
  assert.ok(w.few.wash < w.dozen.wash && w.dozen.wash < w.full.wash && w.full.wash <= 1, 'more scooters, thicker fume');
  // few and dozen are exactly proportional to 1 and 3; the full box never shows more than 6 would
  assert.ok(Math.abs(w.dozen.wash / w.few.wash - AIR_EXTRA.dozen / AIR_EXTRA.few) < 0.1);
  assert.ok(w.full.wash / w.few.wash <= AIR_EXTRA.full / AIR_EXTRA.few + 0.1);
  // the average tint over the zone is AIR.fumeTint × steps (or less, where the cap bites), the strongest point never over washMax
  const ws = washStrength({ x: kerb.x0, y: -AIR.kerbTop, w: kerb.x1 - kerb.x0, h: AIR.kerbTop }, ovalsOf(a.wash));
  for (const s of AIR_SCENARIOS) {
    const mean = w[s].wash * ws.mean;
    assert.ok(mean <= AIR.fumeTint * AIR_EXTRA[s] + 0.006, `${s}: average ${mean.toFixed(3)}`);
    assert.ok(w[s].wash * ws.peak <= AIR.washMax + 0.006, `${s}: strongest point`);
  }
  assert.ok(Math.abs(w.dozen.wash * ws.mean - AIR.fumeTint * AIR_EXTRA.dozen) < 0.006, 'the dozen is exact');
  const g = fumeStrength({ mean: 0.5, peak: 0.9 }, AIR_EXTRA);
  for (const s of AIR_SCENARIOS) assert.ok(g[s] * 0.9 <= AIR.washMax + 0.01); // opacities are written to 2 decimals
  // the group opacity is written into the drawing for each step, and the dozen is the fallback
  assert.match(a.wash, new RegExp(`--air-w1:${w.few.wash};--air-w2:${w.dozen.wash};--air-w3:${w.full.wash}" opacity="${w.dozen.wash}"`));
});

test('the same numbers come straight out of research/estimate/results.json', () => {
  const results = JSON.parse(readFileSync(new URL('../../../../research/estimate/results.json', import.meta.url), 'utf8'));
  const bg = Number(/traffic stations (\d+(?:\.\d+)?) ppm/.exec(results.inputs.bgCO_ppm.source)![1]);
  const key = { few: 'few', dozen: 'dozen', full: 'fullbox' } as const;
  for (const s of AIR_SCENARIOS) {
    const p = results.scenarios.find((x: { key: string }) => x.key === key[s]).publish.co_ppm;
    assert.equal(fumeSteps(p.central, bg), AIR_EXTRA[s], s);
  }
});

test('fumeSteps: at least 1, and it refuses a missing slot', () => {
  assert.equal(fumeSteps(0.0001, 0.54), 1);
  assert.throws(() => fumeSteps(NaN, 0.54));
  assert.throws(() => fumeSteps(0.3, 0));
});

test('a picture never draws the street’s own air: with no tailpipe and no kerb it draws nothing', () => {
  for (const w of [360, 450, 1000, 1200]) {
    const a = air({ frame: { x: 0, y: 0, w, h: (w * 2) / 3 }, id: 'a' });
    assert.equal(a.all, '<g class="air-marks"></g>');
  }
  // with tailpipes and a kerb, every wisp sits in a tailpipe's group or in the kerb group
  const k = scene({ scenario: 'full' });
  const outside = k.marks.replace(/<g class="air-src"[^>]*>.*?<\/g>/g, '').replace(/<g class="air-kerb">.*?<\/g>/g, '');
  assert.doesNotMatch(outside, /air-rib/);
});

test('electric scenes: no fume from a scooter at all; a car keeps its own small puff', () => {
  const e = air({ frame, id: 'e' });
  assert.equal(e.wash + e.cores, '');
  assert.doesNotMatch(e.marks, /air-rib|air-core/);
  const c = air({ frame, id: 'c', cars: [{ x: 440, y: -40 }] });
  assert.equal(c.counts.cores, 1);
  assert.ok(c.cores.includes('air-core--car'));
  assert.doesNotMatch(c.cores, /air-core"/, 'only the car’s puff');
  // the electric print picture and the electric card: no scooter tailpipe puff
  assert.doesNotMatch(kerbDrawing({ electric: true }).svg, /class="air-core"|air-wash/);
  assert.doesNotMatch(cardArt('electric', { inlet: { lo: 2.5, hi: 3.5 }, red: 90 }).svg, /class="air-core"|air-wash/);
});

test('the same options give the same picture; a different seed gives another', () => {
  assert.equal(scene().all, scene().all);
  assert.notEqual(scene().marks, scene({ seed: 5 }).marks);
});

test('nothing drawn is NaN, undefined or Infinity', () => {
  for (const s of [...AIR_SCENARIOS, 'all'] as const) {
    const a = scene({ scenario: s, cars: [{ x: 440, y: -40 }] });
    assert.ok(!/NaN|undefined|Infinity/.test(a.all), s);
  }
  const p = airPuffDefs('p') + airPuff('p', [{ cx: 1, cy: 2, rx: 3, ry: 4 }], { tone: 'soot' }) + airPuff('p', [{ cx: 1, cy: 2, rx: 3, ry: 4 }], { strength: null });
  assert.ok(!/NaN|undefined|Infinity/.test(p));
  assert.doesNotMatch(airPuff('p', [{ cx: 1, cy: 2, rx: 3, ry: 4 }], { strength: null }), /opacity=/, 'strength null leaves the opacity to the caller');
});

test('the scenarios nest: few is a prefix of dozen, dozen of full', () => {
  const few = scene({ scenario: 'few' });
  const dozen = scene({ scenario: 'dozen' });
  const full = scene({ scenario: 'full' });
  const all = scene({ scenario: 'all' });
  const kerbWisps = (m: string) => [...m.matchAll(/<path class="air-rib air-b[^>]*>/g)].map((x) => x[0]);
  const f = kerbWisps(few.marks), d = kerbWisps(dozen.marks), u = kerbWisps(full.marks);
  assert.deepEqual([f.length, d.length, u.length], [1, 3, 5]);
  for (const m of f) assert.ok(d.includes(m));
  for (const m of d) assert.ok(u.includes(m));
  assert.deepEqual(kerbWisps(all.marks), u);
  assert.equal(all.marks.replace(' air-steps', ''), full.marks, 'the full set is the same wisps; only the step class differs');
  assert.ok(all.marks.includes('air-steps') && all.wash.includes('air-wash--steps') && !full.marks.includes('air-steps'));
  assert.deepEqual(AIR_SCENARIOS.map((s) => all.counts.kerb![s].ribbons), [1, 3, 5]);
});

test('layer B is never typed: a kerb zone without `extra` stops the build, and so do steps that shrink', () => {
  assert.throws(() => air({ frame, id: 'x', kerb }));
  assert.throws(() => air({ frame, id: 'x', kerb, extra: { few: 3, dozen: 1, full: 6 } }));
});

test('one puff per tailpipe, whatever the scenario', () => {
  const pipes = [{ x: 296, y: -33 }, { x: 330, y: -42, scale: 0.92, row: 2 as const }, { x: 320, y: -52, scale: 0.84, row: 3 as const }];
  for (const s of AIR_SCENARIOS) {
    const a = scene({ scenario: s, tailpipes: pipes });
    assert.equal(a.counts.cores, 3);
    assert.equal((a.cores.match(/class="air-core"/g) ?? []).length, 3);
  }
  assert.equal(scene({ scenario: 'few', tailpipes: pipes }).cores, scene({ scenario: 'full', tailpipes: pipes }).cores);
});

test('parts: the figures draw, to scale, without stray values', () => {
  const all = [person('pushchair'), person('schoolchild-cover'), person('schoolchild-walk'), person('adult-walk'), pushchair(), drinksCan(), bodyFigure(), scooter({ kind: 'electric', rider: true, face: true }), ...(['none', 'cloth', 'surgical', 'carbon', 'n95'] as const).map(maskFace)];
  for (const s of all) assert.ok(s.length > 40 && !/NaN|undefined/.test(s));
  // the baby breathes inside the 55 to 85 cm band; the schoolchild above it; the adult above both
  assert.ok(-MOUTH.pushchair.y > 55 && -MOUTH.pushchair.y < 85);
  assert.ok(-MOUTH.schoolchild.y > 85 && -MOUTH.adult.y > -MOUTH.schoolchild.y);
  assert.ok(MASK_FACE.nose.x < MASK_FACE.gaps.cheek.x);
  assert.ok(BODY.pins.lungs.x < 0 && BODY.pins.nose.y < BODY.pins.blood.y);
});
