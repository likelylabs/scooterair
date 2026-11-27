// node --test: the air rule (redesign brief 5.1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AIR, AIR_SCENARIOS, air, airGlyph, airPatch, extraRingsPerPatch, marksIn, unitsPerPx, washStrength } from '../air.ts';
import { AIR_BACKGROUND_CO, AIR_EXTRA, AIR_RANGE, AIR_RULE } from '../air-slots.ts';
import { BODY, MASK_FACE, MOUTH, bodyFigure, drinksCan, figureBoxes, maskFace, person, pushchair, scooter } from '../parts.ts';

const frame = { x: 0, y: -350, w: 450, h: 425 };
const kerb = { x0: 8, x1: 286, sourceX: 296 };
const scene = (extra = {}) => air({ frame, id: 't', seed: 4, kerb, extra: AIR_EXTRA, scenario: 'all', tailpipes: [{ x: 296, y: -33 }], ...extra });

test('layer B follows the signed estimate: +1, +3, +6; the dozen range is 7 and 17 rings', () => {
  assert.deepEqual(AIR_EXTRA, { few: 1, dozen: 3, full: 6 });
  assert.equal(AIR_RANGE.dozen.lo.rings, 7);
  assert.equal(AIR_RANGE.dozen.hi.rings, 17);
  assert.equal(AIR_BACKGROUND_CO, 0.54);
  // the plume's AVERAGE tint over the kerb zone: the flat wash of the first design, unchanged
  assert.deepEqual(AIR_RULE.washPercent, { few: 10, dozen: 18, full: 26 });
});

test('the same numbers come straight out of research/estimate/results.json', () => {
  const results = JSON.parse(readFileSync(new URL('../../../../research/estimate/results.json', import.meta.url), 'utf8'));
  const bg = Number(/traffic stations (\d+(?:\.\d+)?) ppm/.exec(results.inputs.bgCO_ppm.source)![1]);
  const key = { few: 'few', dozen: 'dozen', full: 'fullbox' } as const;
  for (const s of AIR_SCENARIOS) {
    const p = results.scenarios.find((x: { key: string }) => x.key === key[s]).publish.co_ppm;
    assert.equal(extraRingsPerPatch(p.central, bg), AIR_EXTRA[s], s);
    assert.equal(AIR.ringsPerPatch + extraRingsPerPatch(p.low, bg), AIR_RANGE[s].lo.rings, s + ' lo');
    assert.equal(AIR.ringsPerPatch + extraRingsPerPatch(p.high, bg), AIR_RANGE[s].hi.rings, s + ' hi');
  }
});

test('extraRingsPerPatch: at least 1, and it refuses a missing slot', () => {
  assert.equal(extraRingsPerPatch(0.0001, 0.54), 1);
  assert.throws(() => extraRingsPerPatch(NaN, 0.54));
  assert.throws(() => extraRingsPerPatch(0.3, 0));
});

test('a picture never draws the street\'s own air: no rings, dots or ribbons outside the plume', () => {
  for (const w of [360, 450, 1000, 1200]) {
    const a = air({ frame: { x: 0, y: 0, w, h: (w * 2) / 3 }, id: 'a' });
    assert.deepEqual(a.counts.street, { rings: 0, dots: 0 });
    assert.doesNotMatch(a.marks, /air-(?:ring|dot|rib)/);
    assert.equal(a.all, '<g class="air-marks"></g>');
  }
  // with tailpipes and a kerb, every mark sits in a core's cluster or in the kerb group
  const k = scene({ scenario: 'full' });
  assert.doesNotMatch(k.marks, /air-a"/);
  const outside = k.marks.replace(/<g class="air-src"[^>]*>.*?<\/g>/g, '').replace(/<g class="air-kerb">.*?<\/g>/g, '');
  assert.doesNotMatch(outside, /air-(?:ring|dot|rib)/);
});

test('the yardstick (streetAir, the counting patch only): 6 rings and 6 dots in every reference patch, whatever the units', () => {
  for (const w of [360, 450, 1000, 1200]) {
    const upp = unitsPerPx(w);
    const a = air({ frame: { x: 0, y: 0, w, h: (w * 2) / 3 }, id: 'a', streetAir: true });
    // 3 patches across, 2 down
    assert.equal(a.counts.street.rings, 36, `rings at width ${w}`);
    assert.equal(a.counts.street.dots, 36, `dots at width ${w}`);
    assert.equal(marksIn(AIR.ringsPerPatch, w * ((w * 2) / 3), upp), 36);
    assert.equal(a.wash, '');
    assert.equal(a.cores, '');
    assert.ok(!a.marks.includes('air-rib'), 'the street\'s own air has no ribbons');
  }
});

test('the same options give the same picture; a different seed gives another', () => {
  assert.equal(scene().all, scene().all);
  assert.notEqual(scene().marks, scene({ seed: 5 }).marks);
});

test('nothing drawn is NaN, undefined or Infinity', () => {
  for (const s of [...AIR_SCENARIOS, 'all'] as const) {
    const a = scene({ scenario: s, cars: [{ x: 440, y: -40 }], tyres: [{ x: 300, y: 0 }], avoid: figureBoxes('stroller', 34) });
    assert.ok(!/NaN|undefined|Infinity/.test(a.all), s);
  }
});

test('the scenarios nest: few is a prefix of dozen, dozen of full', () => {
  const few = scene({ scenario: 'few' });
  const dozen = scene({ scenario: 'dozen' });
  const full = scene({ scenario: 'full' });
  const all = scene({ scenario: 'all' });
  const kerbMarks = (m: string) => [...m.matchAll(/<path class="air-(?:ring|rib) air-b[^>]*>/g)].map((x) => x[0]);
  const f = kerbMarks(few.marks), d = kerbMarks(dozen.marks), u = kerbMarks(full.marks);
  assert.ok(f.length < d.length && d.length < u.length);
  for (const m of f) assert.ok(d.includes(m));
  for (const m of d) assert.ok(u.includes(m));
  assert.deepEqual(kerbMarks(all.marks), u);
  assert.equal(all.marks.replace(' air-steps', ''), full.marks, 'the full set is the same marks; only the step class differs');
  assert.ok(all.marks.includes('air-steps') && all.wash.includes('air-wash--steps') && !full.marks.includes('air-steps'));
  const c = all.counts.kerb!;
  assert.ok(c.few.rings >= 1 && c.few.rings <= c.dozen.rings && c.dozen.rings <= c.full.rings);
  assert.deepEqual([c.few.ribbons, c.dozen.ribbons, c.full.ribbons], [1, 3, 5]);
  assert.ok(c.few.wash < c.dozen.wash && c.dozen.wash < c.full.wash && c.full.wash < 1);
  // the group opacity is written into the drawing for each step, and the dozen is the fallback
  assert.match(all.wash, new RegExp(`--air-w1:${c.few.wash};--air-w2:${c.dozen.wash};--air-w3:${c.full.wash}" opacity="${c.dozen.wash}"`));
});

test('the plume tints the kerb zone by AIR.washOpacity on average (10 / 18 / 26 %), never more, and stays lighter than washMax', () => {
  // sample the drawn ovals ourselves: parse them out of the SVG and composite them on a fine grid
  const a = scene({ scenario: 'all' });
  const ovals = [...a.wash.matchAll(/<ellipse cx="([-\d.]+)" cy="([-\d.]+)" rx="([-\d.]+)" ry="([-\d.]+)"[^>]*opacity="([\d.]+)"/g)].map((m) => ({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4], k: +m[5] }));
  assert.equal(ovals.length, AIR.plume.ovals.length);
  const zone = { x: kerb.x0, y: -AIR.kerbTop, w: kerb.x1 - kerb.x0, h: AIR.kerbTop };
  const w = washStrength(zone, ovals);
  for (const s of AIR_SCENARIOS) {
    const g = a.counts.kerb![s].wash;
    assert.ok(Math.abs(g * w.mean - AIR.washOpacity[s]) < 0.006, `${s}: average ${(g * w.mean).toFixed(3)} vs ${AIR.washOpacity[s]}`);
    assert.ok(g * w.peak <= AIR.washMax + 0.006, `${s}: strongest point ${(g * w.peak).toFixed(3)}`);
  }
  // and in a differently shaped picture (the hero's wide zone) the average is the same
  const wide = air({ frame: { x: 0, y: -690, w: 720, h: 860 }, id: 'w', seed: 9, kerb: { x0: 14, x1: 262, sourceX: 274 }, extra: AIR_EXTRA, scenario: 'dozen' });
  const ov2 = [...wide.wash.matchAll(/<ellipse cx="([-\d.]+)" cy="([-\d.]+)" rx="([-\d.]+)" ry="([-\d.]+)"[^>]*opacity="([\d.]+)"/g)].map((m) => ({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4], k: +m[5] }));
  const w2 = washStrength({ x: 14, y: -AIR.kerbTop, w: 248, h: AIR.kerbTop }, ov2);
  assert.ok(Math.abs(wide.counts.kerb!.dozen.wash * w2.mean - AIR.washOpacity.dozen) < 0.006);
});

test('a kerb zone one patch in size gets exactly the extra rings of the rule', () => {
  const side = AIR.patch; // 1 unit = 1 px at 360 wide
  const a = air({ frame: { x: 0, y: 0, w: 360, h: 240 }, id: 'k', kerb: { x0: 0, x1: side, ground: 240, top: side, ringRoom: 1 }, extra: AIR_EXTRA, scenario: 'all' });
  assert.deepEqual([a.counts.kerb!.few.rings, a.counts.kerb!.dozen.rings, a.counts.kerb!.full.rings], [1, 3, 6]);
  // in a picture the rings keep inside the plume (under 82 % of its height, which is lower near the
  // tailpipe than over the people) and are counted over that area only: the same density as the
  // rule, so fewer rings, never more
  const b = air({ frame: { x: 0, y: 0, w: 360, h: 240 }, id: 'k', kerb: { x0: 0, x1: side, ground: 240, top: side }, extra: AIR_EXTRA, scenario: 'all' });
  assert.deepEqual([b.counts.kerb!.few.rings, b.counts.kerb!.dozen.rings, b.counts.kerb!.full.rings], [1, 2, 4]);
  const ys = [...b.marks.matchAll(/class="air-ring[^"]*"[^>]*d="M(-?[\d.]+),(-?[\d.]+)/g)].map((m) => +m[2]);
  assert.ok(ys.length === 4 && ys.every((y) => y >= 240 - side * 0.82 - 1), 'rings sit inside the plume');
});

test('the kerb rings stay on the people\'s side of the nearest tailpipe', () => {
  const a = air({ frame, id: 'q', kerb: { x0: 8, x1: 440, sourceX: 200 }, extra: AIR_EXTRA, scenario: 'full' });
  const xs = [...a.marks.matchAll(/class="air-ring[^"]*"[^>]*d="M(-?[\d.]+),(-?[\d.]+)a(-?[\d.]+)/g)].map((m) => +m[1] + +m[3]);
  assert.ok(xs.length > 0 && xs.every((x) => x <= 200), `rings at ${xs.join(', ')}`);
});

test('layer B is never typed: a kerb zone without `extra` stops the build', () => {
  assert.throws(() => air({ frame, id: 'x', kerb }));
});

test('no ring or dot is drawn inside an `avoid` box', () => {
  const box = { x: 150, y: -250, w: 120, h: 160 };
  const a = air({ frame, id: 'v', seed: 2, avoid: [box], kerb, extra: AIR_EXTRA, scenario: 'full', streetAir: true });
  const centres = [...a.marks.matchAll(/M(-?[\d.]+),(-?[\d.]+)a(-?[\d.]+),/g)].map((m) => ({ x: +m[1] + +m[3], y: +m[2] }));
  assert.ok(centres.length > 40);
  for (const p of centres) assert.ok(!(p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h), `mark at ${p.x},${p.y}`);
});

test('electric and green scenes: no wash, no core, no ribbon; tyre dots and a car core only when asked', () => {
  const e = air({ frame, id: 'e', tyres: [{ x: 300, y: 0 }] });
  assert.equal(e.wash + e.cores, '');
  assert.ok(e.marks.includes('air-tyre'));
  assert.ok(!e.marks.includes('air-rib'));
  const c = air({ frame, id: 'c', cars: [{ x: 440, y: -40 }] });
  assert.equal(c.counts.cores, 1);
  assert.ok(c.cores.includes('air-core--car'));
});

test('one core per tailpipe, whatever the scenario', () => {
  const pipes = [{ x: 296, y: -33 }, { x: 330, y: -42, scale: 0.92, row: 2 as const }, { x: 320, y: -52, scale: 0.84, row: 3 as const }];
  for (const s of AIR_SCENARIOS) {
    const a = scene({ scenario: s, tailpipes: pipes });
    assert.equal(a.counts.cores, 3);
    assert.equal((a.cores.match(/class="air-core"/g) ?? []).length, 3);
  }
  assert.equal(scene({ scenario: 'few', tailpipes: pipes }).cores, scene({ scenario: 'full', tailpipes: pipes }).cores);
});

test('the two range patches count what they draw', () => {
  const lo = airPatch({ extra: AIR_RANGE.dozen.lo.extra, id: 'p1' });
  const hi = airPatch({ extra: AIR_RANGE.dozen.hi.extra, id: 'p2' });
  assert.equal(lo.rings, 7);
  assert.equal(hi.rings, 17);
  assert.equal(lo.dots, 6);
  assert.ok(!lo.svg.includes('air-rib'));
});

test('parts: the new figures draw, to scale, without stray values', () => {
  const all = [person('pushchair'), person('schoolchild-cover'), person('schoolchild-walk'), person('adult-walk'), pushchair(), drinksCan(), bodyFigure(), scooter({ kind: 'electric', rider: true, face: true }), ...(['none', 'cloth', 'surgical', 'carbon', 'n95'] as const).map(maskFace), ...(['ribbon', 'ring', 'dot'] as const).map(airGlyph)];
  for (const s of all) assert.ok(s.length > 40 && !/NaN|undefined/.test(s));
  // the baby breathes inside the 55 to 85 cm band; the schoolchild above it; the adult above both
  assert.ok(-MOUTH.pushchair.y > 55 && -MOUTH.pushchair.y < 85);
  assert.ok(-MOUTH.schoolchild.y > 85 && -MOUTH.adult.y > -MOUTH.schoolchild.y);
  assert.ok(MASK_FACE.nose.x < MASK_FACE.gaps.cheek.x);
  assert.ok(BODY.routes.rings.startsWith('M'));
  assert.equal(figureBoxes('stroller', 100).length, 3 + 3);
});
