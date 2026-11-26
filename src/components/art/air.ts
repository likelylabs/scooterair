/**
 * air.ts — the one rule that draws air, everywhere on the site.
 *
 * Home scenes, question pages, share cards, the poster and the film all draw
 * exhaust with this function and these constants (redesign brief, section 5.1).
 * It is pure: the same options always give the same SVG, so nothing flickers
 * between renders, and nothing in it depends on time through the red light.
 *
 * THREE KINDS OF MARK
 *   ribbon  a wavy line    what you can smell: fuel vapour (benzene travels in it)
 *   ring    a hollow ring  carbon monoxide: no smell
 *   dot     a small dot    particles: too small to see
 *
 * THREE LAYERS
 *   A  the street's own air   the whole frame, in every scene (electric and
 *                             green-light scenes too): AIR.ringsPerPatch rings
 *                             and AIR.dotsPerPatch dots in every reference
 *                             patch. No ribbons.
 *   B  what the pack adds     the kerb zone only (ground to AIR.kerbTop cm,
 *      where people stand     around the waiting people): extra rings per
 *                             patch from the signed estimate
 *                             (extraRingsPerPatch), 1 / 3 / 5 ribbons that
 *                             reach the people, and a soft wash in three fixed
 *                             steps. Even from the ground to the top of the
 *                             zone: no bands by height.
 *   C  the cores              one fixed dark core behind each petrol tailpipe,
 *                             low to the ground, thinning over about two
 *                             metres, with its own small cluster of marks.
 *                             NOT scaled by the estimate: it is drawn for the
 *                             eye, and it is what makes the picture bold where
 *                             that is true, beside a tailpipe.
 *
 * The reference patch is AIR.patch × AIR.patch screen pixels when the picture
 * is AIR.refWidth pixels wide. A scene tells the function how many of its own
 * units make one such pixel (`upp`, by default frame width ÷ 360), so the rule
 * holds in any viewBox: a 1 unit = 1 cm street, the film's 1000 × 750 stage or
 * a 1200 × 630 share card.
 *
 * What may change a drawing: the scenario (few / dozen / full), the swap
 * slider and the repair button. Nothing else, and never the countdown.
 *
 * This file imports nothing but the seeded random-number generator, so the
 * film's client script can use it without pulling in any data. The numbers of
 * the signed estimate are bound in ./air-slots.ts.
 */
import { rng } from './parts.ts';

/* ------------------------------------------------------------------------ */
/* Constants — reuse these; do not retype them                                */
/* ------------------------------------------------------------------------ */

export type AirScenario = 'few' | 'dozen' | 'full';
export const AIR_SCENARIOS: readonly AirScenario[] = ['few', 'dozen', 'full'];

export const AIR = {
  /** The rule is written for a picture this many screen pixels wide. */
  refWidth: 360,
  /** Side of the reference patch, in pixels at refWidth. */
  patch: 120,

  /** Layer A: the street's own air, per reference patch. */
  ringsPerPatch: 6,
  dotsPerPatch: 6,

  /** Layer B: the kerb zone runs from the ground to this height, in cm. */
  kerbTop: 180,
  /** Layer B: opacity of the wash, three fixed steps. Never opaque. */
  washOpacity: { few: 0.1, dozen: 0.18, full: 0.26 },
  /** Layer B: ribbons that reach the people. */
  ribbonsToPeople: { few: 1, dozen: 3, full: 5 },

  /** Layer C: one core per tailpipe. Lengths in cm at scale 1. */
  core: {
    /** how far the core reaches from the tailpipe before it has thinned away */
    length: 200,
    /** how tall it is; it sits on the ground */
    height: 96,
    /** how far it laps past the tailpipe mouth, under the scooter */
    lap: 30,
    /** height of a tailpipe mouth above the ground (parts.TAILPIPE.y) */
    mouth: 33,
    /**
     * marks that belong to one tailpipe, whatever the scenario. These are the
     * counts when the core is drawn at least `fullAtPx` pixels long; in a wide
     * shot, where sixteen cores share a few hundred pixels, each keeps
     * proportionally fewer (never less than one ring, two dots, one ribbon).
     */
    rings: 3,
    dots: 7,
    ribbons: 3,
    fullAtPx: 150,
    /** rows of a pack fade with distance: opacity of the core in rows 1, 2, 3 */
    rowOpacity: [1, 0.86, 0.72],
  },
  /** A car at the frame's edge keeps one small core: this scale, one ring, two dots. */
  car: { scale: 0.6, rings: 1, dots: 2, ribbons: 2 },
  /** Grey dots at each electric scooter's tyres (tyre and brake dust stays). */
  tyreDots: 3,

  /** Mark sizes, in pixels at refWidth. */
  ring: { rMin: 3.1, rMax: 4.3, stroke: 1.6, halo: 1 },
  dot: { rMin: 1.2, rMax: 1.8, halo: 0.6 },
  ribbon: { stroke: 2.6, strokeMin: 2, wave: 34, amp: 3.6 },

  /** Scenario changes cross-fade over this long (ms). Drift is a few pixels, no more. */
  fadeMs: 600,
  driftPx: 3,
} as const;

/* ------------------------------------------------------------------------ */
/* The rule                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Layer B: extra rings per reference patch where the people stand.
 *   6 × (carbon monoxide the pack adds, middle value) ÷ (what the street
 *   already holds at traffic stations), rounded, at least 1.
 * With the signed values of 2026-11-26 this gives +1, +3, +6 for the three
 * scenarios, and 7 and 17 rings in all for the low and high end of the dozen.
 */
export function extraRingsPerPatch(added: number, background: number): number {
  if (!Number.isFinite(added) || !Number.isFinite(background) || added < 0 || background <= 0) {
    throw new Error(`air.ts: extraRingsPerPatch needs the estimate slots (got added=${added}, background=${background})`);
  }
  return Math.max(1, Math.round((AIR.ringsPerPatch * added) / background));
}

/** Scene units per reference pixel, for a picture `frameWidth` units wide. */
export const unitsPerPx = (frameWidth: number): number => frameWidth / AIR.refWidth;

/** How many marks an area holds at `perPatch` marks per reference patch. */
export function marksIn(perPatch: number, area: number, upp: number): number {
  const side = AIR.patch * upp;
  return Math.round((perPatch * area) / (side * side));
}

/* ------------------------------------------------------------------------ */
/* Types                                                                      */
/* ------------------------------------------------------------------------ */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Point {
  x: number;
  y: number;
}

/** A tailpipe mouth (layer C). */
export interface AirSource {
  /** the mouth, in scene units */
  x: number;
  y: number;
  /** which way the exhaust leaves: -1 toward smaller x (the default: parts face right), 1 toward larger x */
  dir?: -1 | 1;
  /** scale of the scooter it belongs to (rows of a pack are drawn smaller) */
  scale?: number;
  /** row of the pack, 1 = nearest; cores fade with distance like the scooters do */
  row?: 1 | 2 | 3;
  /** a multiplier on the core's size for the one scooter that needs repair (G11); 1 for everything else */
  boost?: number;
  /** override the cluster of marks for this source (G11 only) */
  rings?: number;
  dots?: number;
  /** ribbons at this mouth; the default follows the core's size on screen (a crowded wide shot passes 1 for its far rows) */
  ribbons?: number;
}

/** The kerb zone (layer B). Leave it out for electric and green-light scenes. */
export interface KerbZone {
  /** left and right edge of the zone, scene units */
  x0: number;
  x1: number;
  /** y of the ground under the people (default 0) */
  ground?: number;
  /** height of the zone in scene units (default AIR.kerbTop, i.e. 180 when 1 unit = 1 cm) */
  top?: number;
  /** which side the pack is on: 1 = larger x (default), -1 = smaller x. Ribbons arrive from there. */
  from?: -1 | 1;
  /** where the ribbons start: the nearest tailpipe mouth. Default: just outside the zone on the pack's side, at tailpipe height. */
  sourceX?: number;
  sourceY?: number;
}

export interface AirOptions {
  /** the picture: its viewBox in scene units */
  frame: Box;
  /** scene units per reference pixel; default frame.w ÷ AIR.refWidth */
  upp?: number;
  /** same seed, same picture */
  seed?: number;
  /** prefix for gradient ids; must be unique on the page (parts.artId('air')) */
  id: string;

  /** layer B: where the people stand */
  kerb?: KerbZone;
  /** layer B: extra rings per patch for each scenario (AIR_EXTRA from ./air-slots.ts). Required with `kerb`. */
  extra?: Record<AirScenario, number>;
  /**
   * 'few' | 'dozen' | 'full' draws that scenario only.
   * 'all' draws the fullest set once, with step classes, and CSS shows the
   * right part: the scenario named by data-air-scn="few|dozen|full" on the
   * <svg> (SceneFrame's `scenario` prop) or by the Screen's
   * data-pick-scenario, which ScenarioSwitch sets and which wins. With
   * neither, the dozen shows. Default: 'dozen'.
   */
  scenario?: AirScenario | 'all';

  /** layer C: petrol tailpipes, back row first */
  tailpipes?: AirSource[];
  /** a car's tailpipe at the frame's edge: one small core (kept in electric scenes) */
  cars?: AirSource[];
  /** electric scooters: where each rear tyre meets the road (parts.REAR_TYRE; three grey dots each, trailing behind the wheel) */
  tyres?: (Point & { scale?: number; dir?: -1 | 1 })[];

  /** boxes no ring or dot may sit in: faces, signs, the LED, anything that must stay clean */
  avoid?: Box[];
  /** leave layer A out (only for a detail drawn inside another scene that already has it) */
  noStreetAir?: boolean;
}

export interface AirCounts {
  /** layer A marks drawn in the whole frame */
  street: { rings: number; dots: number };
  /** layer B marks drawn in the kerb zone, for each scenario */
  kerb: Record<AirScenario, { rings: number; ribbons: number; wash: number }> | null;
  /** layer C */
  cores: number;
}

export interface AirLayers {
  /** gradients and the wash mask: goes inside the same <svg>, once */
  defs: string;
  /** layer B wash. Draw it BEHIND the figures. */
  wash: string;
  /** layer C cores. Draw them behind the people and the nearest scooter. */
  cores: string;
  /** every ring, dot and ribbon of the three layers */
  marks: string;
  /** defs + wash + cores + marks, for a picture with nothing to interleave */
  all: string;
  counts: AirCounts;
}

/* ------------------------------------------------------------------------ */
/* Drawing helpers                                                            */
/* ------------------------------------------------------------------------ */

const f = (v: number): number => +v.toFixed(2);

/** A ring as a filled annulus, so one stroke under the fill gives the light halo on both edges. */
function ringPath(cx: number, cy: number, r: number, sw: number): string {
  const o = r + sw / 2;
  const i = Math.max(0.01, r - sw / 2);
  return (
    `M${f(cx - o)},${f(cy)}a${f(o)},${f(o)} 0 1,0 ${f(o * 2)},0a${f(o)},${f(o)} 0 1,0 ${f(-o * 2)},0Z` +
    `M${f(cx - i)},${f(cy)}a${f(i)},${f(i)} 0 1,1 ${f(i * 2)},0a${f(i)},${f(i)} 0 1,1 ${f(-i * 2)},0Z`
  );
}

function dotPath(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)},${f(cy)}a${f(r)},${f(r)} 0 1,0 ${f(r * 2)},0a${f(r)},${f(r)} 0 1,0 ${f(-r * 2)},0Z`;
}

/** A wavy line from (x, y) running `len` in direction `dir`. */
function wavePath(x: number, y: number, len: number, dir: number, wave: number, amp: number, flip = 1): string {
  const half = Math.max(2, Math.round(len / (wave / 2)));
  const step = (len / half) * dir;
  let d = `M${f(x)},${f(y)}q${f(step / 2)},${f(-amp * flip)} ${f(step)},0`;
  for (let k = 1; k < half; k++) d += `t${f(step)},0`;
  return d;
}

/**
 * A ribbon that leaves a tailpipe and reaches the people: it starts at
 * (x0, y0), eases up or down to the height y1 by the time it gets to x1, and
 * waves a little more as it spreads.
 */
function wispPath(x0: number, y0: number, x1: number, y1: number, wave: number, amp: number, flip = 1): string {
  const n = Math.max(4, Math.round(Math.abs(x1 - x0) / (wave / 2)));
  const at = (u: number): Point => ({ x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * (u * u * (3 - 2 * u)) });
  let d = `M${f(x0)},${f(y0)}`;
  for (let i = 0; i < n; i++) {
    const a = at(i / n);
    const b = at((i + 1) / n);
    const swell = amp * (0.55 + (0.45 * (i + 0.5)) / n) * (i % 2 ? -1 : 1) * flip;
    d += `Q${f((a.x + b.x) / 2)},${f((a.y + b.y) / 2 - swell * 2)} ${f(b.x)},${f(b.y)}`;
  }
  return d;
}

const inBox = (b: Box, x: number, y: number, pad = 0): boolean => x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;

function freeShare(region: Box, avoid: readonly Box[], pad: number): number {
  if (!avoid.length) return 1;
  const N = 12;
  let free = 0;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = region.x + ((i + 0.5) / N) * region.w;
      const y = region.y + ((j + 0.5) / N) * region.h;
      if (!avoid.some((b) => inBox(b, x, y, pad))) free++;
    }
  return free / (N * N);
}

interface Mark extends Point {
  r: number;
}

/**
 * Best-candidate placement: each new mark takes, of a handful of random
 * candidates, the one farthest from every mark already there. Even coverage
 * with no visible rows, and a sequence whose every prefix is also even, which
 * is what lets the three scenarios nest (few ⊂ dozen ⊂ full).
 */
function scatter(count: number, region: Box, taken: Point[], r: () => number, avoid: readonly Box[], pad: number, rMin: number, rMax: number, others: Point[] = []): Mark[] {
  const out: Mark[] = [];
  for (let n = 0; n < count; n++) {
    let best: Point | null = null;
    let bestD = -1;
    for (let c = 0; c < 28 && (c < 14 || !best); c++) {
      const x = region.x + pad + r() * Math.max(0, region.w - pad * 2);
      const y = region.y + pad + r() * Math.max(0, region.h - pad * 2);
      if (avoid.some((b) => inBox(b, x, y, pad))) continue;
      let d = Infinity;
      for (const t of taken) d = Math.min(d, (t.x - x) ** 2 + (t.y - y) ** 2);
      // keep a little clear of the other kind of mark too, at half weight
      for (const t of others) d = Math.min(d, ((t.x - x) ** 2 + (t.y - y) ** 2) * 4);
      if (d > bestD) {
        bestD = d;
        best = { x, y };
      }
    }
    const size = rMin + r() * (rMax - rMin);
    if (!best) continue; // the region is fully covered by `avoid`: draw nothing rather than put a mark on a face
    const m = { ...best, r: size };
    out.push(m);
    taken.push(m);
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* air()                                                                      */
/* ------------------------------------------------------------------------ */

export function air(o: AirOptions): AirLayers {
  const { frame, seed = 1, id, avoid = [], kerb, tailpipes = [], cars = [], tyres = [] } = o;
  const upp = o.upp ?? unitsPerPx(frame.w);
  const scenario = o.scenario ?? 'dozen';
  const px = (v: number) => v * upp;
  const side = px(AIR.patch);
  const ringSw = px(AIR.ring.stroke);
  const ringHalo = f(px(AIR.ring.halo) * 2);
  const dotHalo = f(px(AIR.dot.halo) * 2);
  const ringPad = px(AIR.ring.rMax + AIR.ring.stroke);
  const ribSw = px(AIR.ribbon.stroke);

  const defs: string[] = [];
  const marks: string[] = [];
  const allRings: Point[] = [];
  const allDots: Point[] = [];

  const ringEl = (cls: string, d: string, attrs = '') => `<path class="air-ring ${cls}" stroke-width="${ringHalo}" d="${d}"${attrs}/>`;
  const dotEl = (cls: string, d: string, attrs = '') => `<path class="air-dot ${cls}" stroke-width="${dotHalo}" d="${d}"${attrs}/>`;

  /* ---- Layer A: the street's own air ------------------------------------ */
  let streetRings = 0;
  let streetDots = 0;
  if (!o.noStreetAir) {
    const rr = rng(seed * 7919 + 11);
    const rd = rng(seed * 7919 + 23);
    const ringGroups = ['', '', ''];
    const dotGroups = ['', '', ''];
    for (let cy = frame.y; cy < frame.y + frame.h - 0.001; cy += side)
      for (let cx = frame.x; cx < frame.x + frame.w - 0.001; cx += side) {
        const cell: Box = { x: cx, y: cy, w: Math.min(side, frame.x + frame.w - cx), h: Math.min(side, frame.y + frame.h - cy) };
        const share = ((cell.w * cell.h) / (side * side)) * freeShare(cell, avoid, ringPad);
        for (const m of scatter(Math.round(AIR.ringsPerPatch * share), cell, allRings, rr, avoid, ringPad, px(AIR.ring.rMin), px(AIR.ring.rMax))) {
          ringGroups[streetRings++ % 3] += ringPath(m.x, m.y, m.r, ringSw);
        }
        for (const m of scatter(Math.round(AIR.dotsPerPatch * share), cell, allDots, rd, avoid, px(AIR.dot.rMax + 1), px(AIR.dot.rMin), px(AIR.dot.rMax), allRings)) {
          dotGroups[streetDots++ % 3] += dotPath(m.x, m.y, m.r);
        }
      }
    marks.push('<g class="air-a">');
    dotGroups.forEach((d, i) => d && marks.push(dotEl(`air-d${i + 1}`, d)));
    ringGroups.forEach((d, i) => d && marks.push(ringEl(`air-d${i + 1}`, d)));
    marks.push('</g>');
  }

  /* ---- Layer B: what the pack adds where the people stand --------------- */
  let wash = '';
  let kerbCounts: AirCounts['kerb'] = null;
  if (kerb) {
    if (!o.extra) throw new Error('air.ts: a kerb zone needs `extra` (AIR_EXTRA from ./air-slots.ts): layer B is computed from the estimate, never typed');
    const ground = kerb.ground ?? 0;
    const top = kerb.top ?? AIR.kerbTop;
    const from = kerb.from ?? 1;
    const zone: Box = { x: kerb.x0, y: ground - top, w: kerb.x1 - kerb.x0, h: top };
    const free = zone.w * zone.h * freeShare(zone, avoid, ringPad);
    const want: Record<AirScenario, number> = { few: 0, dozen: 0, full: 0 };
    let floor = 1;
    for (const s of AIR_SCENARIOS) {
      const perPatch = o.extra[s];
      if (!Number.isFinite(perPatch) || perPatch < 1) throw new Error(`air.ts: extra.${s} must be at least 1 ring per patch (got ${perPatch})`);
      want[s] = Math.max(floor, marksIn(perPatch, free, upp));
      floor = want[s];
    }
    const shown: AirScenario[] = scenario === 'all' ? [...AIR_SCENARIOS] : [scenario];
    const last = shown[shown.length - 1];
    const stepOf = (k: number, by: Record<AirScenario, number>): number => (k < by.few ? 1 : k < by.dozen ? 2 : 3);

    // the wash: one soft-edged rectangle, the same from the ground to the top of the zone
    const w1 = AIR.washOpacity;
    defs.push(
      `<linearGradient id="${id}-wh" x1="0" x2="1" y1="0" y2="0"><stop class="air-wash-stop" offset="0" stop-opacity="0"/><stop class="air-wash-stop" offset="0.16" stop-opacity="1"/><stop class="air-wash-stop" offset="0.84" stop-opacity="1"/><stop class="air-wash-stop" offset="1" stop-opacity="0"/></linearGradient>`,
      `<linearGradient id="${id}-wv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.14" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>`,
      `<mask id="${id}-wm" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1"><rect width="1" height="1" fill="url(#${id}-wv)"/></mask>`,
    );
    const feather = zone.w * 0.19; // the soft edge lies outside the zone, so the zone itself is evenly tinted
    wash =
      `<rect class="air-wash${scenario === 'all' ? ' air-wash--steps' : ''}" x="${f(zone.x - feather)}" y="${f(zone.y - zone.h * 0.16)}" width="${f(zone.w + feather * 2)}" height="${f(zone.h * 1.16)}" fill="url(#${id}-wh)" mask="url(#${id}-wm)"` +
      ` style="--air-w1:${w1.few};--air-w2:${w1.dozen};--air-w3:${w1.full}"` +
      // with 'all', CSS picks the step; the attribute is the fallback (the dozen) if no ancestor names a scenario
      ` opacity="${scenario === 'all' ? w1.dozen : w1[scenario]}"` +
      '/>';

    // ribbons that reach the people, nested 1 ⊂ 3 ⊂ 5, spread evenly over the height of the zone
    const rb = rng(seed * 7919 + 37);
    const levels = [0.5, 0.2, 0.8, 0.35, 0.65];
    const nRib = AIR.ribbonsToPeople[last];
    const start = kerb.sourceX ?? (from === 1 ? zone.x + zone.w + zone.w * 0.1 : zone.x - zone.w * 0.1);
    const startY = kerb.sourceY ?? ground - AIR.core.mouth * (top / AIR.kerbTop);
    const farEdge = from === 1 ? zone.x : zone.x + zone.w;
    marks.push('<g class="air-kerb">');
    for (let k = 0; k < nRib; k++) {
      const y1 = ground - top * (0.1 + 0.8 * levels[k % levels.length]) + (rb() - 0.5) * top * 0.05;
      const x1 = start + (farEdge - start) * (0.8 + rb() * 0.17);
      const y0 = startY + (levels[k % levels.length] - 0.5) * -px(9);
      const d = wispPath(start, y0, x1, y1, px(AIR.ribbon.wave) * (0.9 + rb() * 0.4), px(AIR.ribbon.amp) * (0.85 + rb() * 0.4), k % 2 ? -1 : 1);
      marks.push(`<path class="air-rib air-b air-b${stepOf(k, AIR.ribbonsToPeople)}" data-k="${k}" stroke-width="${f(ribSw * (0.85 + rb() * 0.3))}" d="${d}"/>`);
    }

    // the extra rings: one sequence, so a smaller scenario is a prefix of a larger one
    const rk = rng(seed * 7919 + 41);
    const extraRings = scatter(want[last], zone, allRings, rk, avoid, ringPad, px(AIR.ring.rMin), px(AIR.ring.rMax));
    extraRings.forEach((m, k) => {
      marks.push(ringEl(`air-b air-b${stepOf(k, want)} air-d${(k % 3) + 1}`, ringPath(m.x, m.y, m.r, ringSw), ` data-k="${k}"`));
    });
    marks.push('</g>');

    kerbCounts = { few: { rings: 0, ribbons: 0, wash: 0 }, dozen: { rings: 0, ribbons: 0, wash: 0 }, full: { rings: 0, ribbons: 0, wash: 0 } };
    for (const s of AIR_SCENARIOS) kerbCounts[s] = { rings: Math.min(want[s], extraRings.length), ribbons: AIR.ribbonsToPeople[s], wash: AIR.washOpacity[s] };
  }

  /* ---- Layer C: the cores at the tailpipes ------------------------------ */
  const cores: string[] = [];
  const sources = [...cars.map((s) => ({ ...s, car: true })), ...tailpipes.map((s) => ({ ...s, car: false }))];
  if (sources.length) {
    const C = AIR.core;
    const len = C.length + C.lap;
    // one gradient serves every core: darkest at the mouth, gone by the far end
    const fx = f(1 - C.lap / len);
    const fy = f(1 - C.mouth / C.height);
    defs.push(
      `<radialGradient id="${id}-c" cx="0.56" cy="0.6" r="0.5" fx="${fx}" fy="${fy}">` +
        '<stop class="air-core-stop" offset="0" stop-opacity="0.97"/><stop class="air-core-stop" offset="0.26" stop-opacity="0.93"/>' +
        '<stop class="air-core-stop air-core-stop--mid" offset="0.5" stop-opacity="0.72"/><stop class="air-core-stop air-core-stop--far" offset="0.76" stop-opacity="0.34"/>' +
        '<stop class="air-core-stop air-core-stop--far" offset="1" stop-opacity="0"/></radialGradient>',
    );
    cores.push('<g class="air-cores">');
    marks.push('<g class="air-srcs">');
    sources.forEach((s, i) => {
      const dir = s.dir ?? -1;
      const k = (s.scale ?? 1) * (s.car ? AIR.car.scale : 1) * (s.boost ?? 1);
      const op = s.car ? 0.8 : C.rowOpacity[(s.row ?? 1) - 1];
      // local frame: the mouth at (0, 0), the exhaust leaving toward −x, y down; ground at +mouth
      const groundY = C.mouth * (s.scale ?? 1) * (s.car ? 0.9 : 1);
      const w = len * k;
      const h = C.height * k;
      const t = `translate(${f(s.x)} ${f(s.y)})${dir === 1 ? ' scale(-1 1)' : ''}`;
      const key = s.car ? `car${i}` : String(i - cars.length);
      cores.push(
        `<g class="air-core${s.car ? ' air-core--car' : ''}" data-src="${key}" transform="${t}" opacity="${op}">` +
          `<ellipse cx="${f(C.lap * k - w / 2)}" cy="${f(groundY - h / 2 + h * 0.06)}" rx="${f(w / 2)}" ry="${f(h / 2)}" fill="url(#${id}-c)"/></g>`,
      );

      // the cluster that belongs to this tailpipe: fixed, whatever the scenario
      const rs = rng(seed * 7919 + 101 + i * 13);
      const room = Math.min(1, w / upp / C.fullAtPx); // 1 in a close shot, less when the core is only a few dozen pixels long
      const nRings = s.rings ?? (s.car ? AIR.car.rings : Math.max(1, Math.round(C.rings * room)));
      const nDots = s.dots ?? (s.car ? AIR.car.dots : Math.max(2, Math.round(C.dots * room)));
      const nRibs = s.ribbons ?? (s.car ? AIR.car.ribbons : Math.max(1, Math.round(C.ribbons * room)));
      let g = `<g class="air-src${s.car ? ' air-src--car' : ''}" data-src="${key}" transform="${t}">`;
      // ribbons leave the mouth in a narrow fan
      const fan = [0, -1, 1];
      for (let j = 0; j < nRibs; j++) {
        const L = (58 - j * 10 + rs() * 12) * k;
        const y0 = fan[j] * 5 * k;
        const sw = Math.max(px(AIR.ribbon.strokeMin), ribSw * (j === 0 ? 1.15 : 0.9));
        g += `<path class="air-rib" stroke-width="${f(sw)}" opacity="${j === 0 ? 1 : 0.8}" transform="rotate(${fan[j] * -7})" d="${wavePath(-3 * k, y0, L, -1, Math.max(px(AIR.ribbon.wave) * 0.6, 17 * k), Math.max(px(AIR.ribbon.amp) * 0.7, 3.4 * k), j % 2 ? -1 : 1)}"/>`;
      }
      // dots and rings inside the core, nearer the mouth than the far end
      const local: Point[] = [];
      const span = Math.max(w * 0.7, px(AIR.ring.rMax) * 6);
      const tall = Math.max(h * 0.7, px(AIR.ring.rMax) * 3);
      const spot = (): Point => {
        let best: Point = { x: 0, y: 0 };
        let bestD = -1;
        for (let c = 0; c < 10; c++) {
          const u = rs() ** 1.35;
          const p = { x: -(0.07 + u * 0.93) * span, y: groundY - (0.08 + rs() * 0.92) * tall * (1 - u * 0.25) };
          let d = Infinity;
          for (const q of local) d = Math.min(d, (q.x - p.x) ** 2 + (q.y - p.y) ** 2);
          if (d > bestD) {
            bestD = d;
            best = p;
          }
        }
        local.push(best);
        return best;
      };
      let dd = '';
      for (let j = 0; j < nDots; j++) {
        const p = spot();
        dd += dotPath(p.x, p.y, px(AIR.dot.rMin + rs() * (AIR.dot.rMax - AIR.dot.rMin)));
      }
      let rd2 = '';
      for (let j = 0; j < nRings; j++) {
        const p = spot();
        rd2 += ringPath(p.x, p.y, px(AIR.ring.rMin + rs() * (AIR.ring.rMax - AIR.ring.rMin)), ringSw);
      }
      if (dd) g += dotEl(`air-d${(i % 3) + 1}`, dd);
      if (rd2) g += ringEl(`air-d${((i + 1) % 3) + 1}`, rd2);
      marks.push(g + '</g>');
    });
    cores.push('</g>');
    marks.push('</g>');
  }

  /* ---- Electric scooters: tyre and brake dust stays ---------------------- */
  if (tyres.length) {
    const rt = rng(seed * 7919 + 53);
    let d = '';
    for (const t of tyres) {
      const back = (t.dir ?? -1) * 25 * (t.scale ?? 1); // just clear of the tyre (radius 24 cm)
      for (let j = 0; j < AIR.tyreDots; j++) {
        d += dotPath(t.x + back + (t.dir ?? -1) * px(2.5 + j * 5.5 + rt() * 2), t.y - px(2 + rt() * 5), px(1.5 + rt() * 0.5));
      }
    }
    marks.push(`<path class="air-tyre" d="${d}"/>`);
  }

  const out = {
    defs: defs.length ? `<defs>${defs.join('')}</defs>` : '',
    wash,
    cores: cores.join(''),
    marks: `<g class="air-marks${scenario === 'all' && kerb ? ' air-steps' : ''}">${marks.join('')}</g>`,
  };
  return {
    ...out,
    all: out.defs + out.wash + out.cores + out.marks,
    counts: { street: { rings: streetRings, dots: streetDots }, kerb: kerbCounts, cores: sources.length },
  };
}

/* ------------------------------------------------------------------------ */
/* Single marks, for diagrams                                                 */
/* ------------------------------------------------------------------------ */

/**
 * One mark at a time, drawn exactly as air() draws them (same sizes, same
 * stroke, same halo), for the diagrams that place every mark on purpose: the
 * three lanes leaving one tailpipe (G2), the routes into the body (G6), what a
 * mask stops (G17), the cloud of the one scooter that needs repair (G11).
 * A street scene never uses these: it calls air().
 *
 *   upp   drawing units per screen pixel at 360 px (unitsPerPx(frame.w))
 *   size  0 to 1 within the rule's size range (default 0.5)
 *   cls   extra classes; attrs  extra attributes (' data-k="3"')
 */
export function airRing(x: number, y: number, upp: number, o: { size?: number; cls?: string; attrs?: string } = {}): string {
  const r = (AIR.ring.rMin + (o.size ?? 0.5) * (AIR.ring.rMax - AIR.ring.rMin)) * upp;
  return `<path class="air-ring${o.cls ? ' ' + o.cls : ''}" stroke-width="${f(AIR.ring.halo * 2 * upp)}" d="${ringPath(x, y, r, AIR.ring.stroke * upp)}"${o.attrs ?? ''}/>`;
}
export function airDot(x: number, y: number, upp: number, o: { size?: number; cls?: string; attrs?: string } = {}): string {
  const r = (AIR.dot.rMin + (o.size ?? 0.5) * (AIR.dot.rMax - AIR.dot.rMin)) * upp;
  return `<path class="air-dot${o.cls ? ' ' + o.cls : ''}" stroke-width="${f(AIR.dot.halo * 2 * upp)}" d="${dotPath(x, y, r)}"${o.attrs ?? ''}/>`;
}
/** A ribbon along any path `d` (build it with airWave() or airWisp(), or pass your own). */
export function airRibbon(d: string, upp: number, o: { weight?: number; cls?: string; attrs?: string } = {}): string {
  return `<path class="air-rib${o.cls ? ' ' + o.cls : ''}" stroke-width="${f(AIR.ribbon.stroke * (o.weight ?? 1) * upp)}" d="${d}"${o.attrs ?? ''}/>`;
}
/** Path of a wavy line from (x, y), `len` long, toward `dir` (1 = larger x). Wave and height follow the rule. */
export const airWave = (x: number, y: number, len: number, dir: -1 | 1, upp: number, flip: 1 | -1 = 1): string =>
  wavePath(x, y, len, dir, AIR.ribbon.wave * upp * 0.7, AIR.ribbon.amp * upp * 0.8, flip);
/** Path of a ribbon that eases from (x0, y0) to (x1, y1), waving as it goes. */
export const airWisp = (x0: number, y0: number, x1: number, y1: number, upp: number, flip: 1 | -1 = 1): string =>
  wispPath(x0, y0, x1, y1, AIR.ribbon.wave * upp, AIR.ribbon.amp * upp, flip);

/** The three grey dots behind one electric rear tyre, as air({ tyres }) draws them, for a scooter that is swapped by itself (G10). */
export function airTyreDust(t: Point & { scale?: number; dir?: -1 | 1 }, upp: number, seed = 1, cls = ''): string {
  const rt = rng(seed * 7919 + 53);
  const dir = t.dir ?? -1;
  const back = dir * 25 * (t.scale ?? 1);
  let d = '';
  for (let j = 0; j < AIR.tyreDots; j++) d += dotPath(t.x + back + dir * upp * (2.5 + j * 5.5 + rt() * 2), t.y - upp * (2 + rt() * 5), upp * (1.5 + rt() * 0.5));
  return `<path class="air-tyre${cls ? ' ' + cls : ''}" d="${d}"/>`;
}

/* ------------------------------------------------------------------------ */
/* The two patches that show a range                                          */
/* ------------------------------------------------------------------------ */

/**
 * One reference patch drawn with the same rule: the street's own rings and
 * dots plus `extra` rings. The estimate sheet shows two of these side by
 * side, for the low and the high end of the range (AIR_RANGE in air-slots.ts).
 * Returns the inside of an <svg viewBox="0 0 size size">.
 */
export function airPatch(o: { extra: number; size?: number; seed?: number; id: string; wash?: number }): { svg: string; rings: number; dots: number } {
  const size = o.size ?? AIR.patch;
  const upp = size / AIR.patch;
  const e = Math.max(1, Math.round(o.extra));
  const frame = { x: 0, y: 0, w: size, h: size };
  const a = air({ frame, upp, seed: o.seed ?? 5, id: o.id, kerb: { x0: 0, x1: size, ground: size, top: size }, extra: { few: e, dozen: e, full: e }, scenario: 'few' });
  // a patch has no direction and no people: keep the rings and dots, drop the ribbon and the feathered wash
  const marks = a.marks.replace(/<path class="air-rib[^>]*\/>/g, '');
  const tint = o.wash ? `<rect class="air-wash air-wash--flat" width="${size}" height="${size}" opacity="${o.wash}"/>` : '';
  return { svg: tint + marks, rings: a.counts.street.rings + (a.counts.kerb?.few.rings ?? 0), dots: a.counts.street.dots };
}

/* ------------------------------------------------------------------------ */
/* Glyphs for keys and legends                                                */
/* ------------------------------------------------------------------------ */

export type AirMark = 'ribbon' | 'ring' | 'dot';

/**
 * The three marks as 24 × 24 glyphs, drawn with the same classes as the
 * scenes, for the key on screens 2 and 4 and for any legend. Wrap in
 * <svg viewBox="0 0 24 24" class="air-glyph">.
 */
export function airGlyph(kind: AirMark): string {
  switch (kind) {
    case 'ribbon':
      return `<path class="air-rib" stroke-width="2.8" d="${wavePath(2, 12, 20, 1, 10, 3.6)}"/>`;
    case 'ring':
      return `<path class="air-ring" stroke-width="0" d="${ringPath(12, 12, 6, 2.4)}"/>`;
    case 'dot':
      return `<path class="air-dot" stroke-width="0" d="${dotPath(7, 15, 2.2)}${dotPath(13, 8.5, 2.2)}${dotPath(17.5, 15.5, 2.2)}"/>`;
  }
}
