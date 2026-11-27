// The helpers the scenes are built from: single wisps, per-tailpipe layering, scenario steps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AIR, air, airRibbon, airWave, airWisp } from '../air.ts';
import { TAILPIPE } from '../parts.ts';
import { indexSources, pedSignal, pickSources, placed, shopfronts, stepSources, tailOf, withoutSources, type Placed } from '../kit.ts';
import { PLAN3, planView } from '../plan-view.ts';

const frame = { x: 0, y: -300, w: 360, h: 340 };
const pack: Placed[] = [
  { x: 200, lift: 40, s: 0.8, row: 3 },
  { x: 180, lift: 20, s: 0.9, row: 2 },
  { x: 160, lift: 0, s: 1, row: 1 },
];
const a = air({ frame, id: 't', tailpipes: pack.map(tailOf) });

test('single wisps are drawn at the width of the rule', () => {
  const rib = airRibbon(airWave(0, 0, 60, 1, 1), 1);
  assert.match(rib, new RegExp(`stroke-width="${AIR.ribbon.stroke}"`));
  assert.match(rib, /class="air-rib"/);
  assert.ok(airWisp(0, 0, 100, -40, 1).startsWith('M0,0'));
});

test('a tailpipe can be told to keep no wisps of its own: its puff stays', () => {
  const bare = air({ frame, id: 't', tailpipes: [{ x: 100, y: -33, ribbons: 0 }] });
  assert.doesNotMatch(bare.marks, /air-rib/);
  assert.equal(bare.counts.cores, 1);
});

test('tailOf puts the tailpipe where the scooter drawing has it', () => {
  assert.deepEqual(tailOf(pack[2]), { x: 160 + TAILPIPE.x, y: TAILPIPE.y, scale: 1, row: 1 });
  assert.equal(tailOf(pack[0]).y, -40 + TAILPIPE.y * 0.8);
});

test('pickSources and withoutSources split air() by tailpipe, losing nothing', () => {
  const each = pack.map((_, i) => pickSources(a.cores, (k) => k === i));
  assert.ok(each.every((c) => (c.match(/class="air-core"/g) ?? []).length === 1));
  const clusters = pack.map((_, i) => pickSources(a.marks, (k) => k === i));
  assert.ok(clusters.every((c) => c.startsWith('<g class="air-src"')));
  assert.doesNotMatch(withoutSources(a.marks), /air-src"/);
  // whatever is not a tailpipe's own stays: here the wisps that reach the people
  const withKerb = air({ frame, id: 't', kerb: { x0: 0, x1: 150, sourceX: 160 }, extra: { few: 1, dozen: 3, full: 6 }, tailpipes: pack.map(tailOf) });
  assert.doesNotMatch(withoutSources(withKerb.marks), /air-src"/);
  assert.match(withoutSources(withKerb.marks), /air-kerb/);
});

test('stepSources ties far rows to the scenario switch; indexSources numbers every tailpipe', () => {
  const stepped = stepSources(a.cores, { 0: 3, 1: 2 });
  assert.match(stepped, /class="air-cores air-steps"/);
  assert.match(stepped, /class="air-core air-b air-b3" data-src="0"/);
  assert.match(stepped, /class="air-core air-b air-b2" data-src="1"/);
  assert.match(stepped, /class="air-core" data-src="2"/);
  assert.equal((indexSources(a.marks).match(/style="--i:\d"/g) ?? []).length, 3);
});

test('street pieces are deterministic and carry no words', () => {
  const shops = shopfronts({ x0: 0, x1: 700, base: 0, top: -400 });
  assert.equal(shops, shopfronts({ x0: 0, x1: 700, base: 0, top: -400 }));
  assert.doesNotMatch(shops + pedSignal({ x: 0, y: 0, scale: 2, state: 'red', count: 90 }) + placed(pack[0], 'gas'), /<text/);
  assert.match(pedSignal({ x: 0, y: 0, scale: 2, state: 'green' }), /data-state="green"/);
});

test('the plan keeps the legal minimum between the crossing and the turn box', () => {
  assert.equal(PLAN3.turnBox.x0 - PLAN3.crossing[1], PLAN3.gapCm);
  const p = planView();
  // four scooters in the turn box, tails toward the crossing: their tailpipes sit just inside its rear edge
  const inBox = p.tailpipes.filter((t) => t.x > PLAN3.turnBox.x0 && t.x < PLAN3.turnBox.x0 + 40);
  assert.equal(inBox.length, 4);
  assert.doesNotMatch(p.ground + p.figures + p.dimension, /<text/);
});
