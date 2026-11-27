/**
 * air.ts — the one rule that draws air, everywhere on the site.
 *
 * Home scenes, question pages, share cards, the poster and the film all draw
 * exhaust with this function and these constants (redesign brief, section 5.1).
 * It is pure: the same options always give the same SVG, so nothing flickers
 * between renders, and nothing in it depends on time through the red light.
 *
 * WHAT A PICTURE SHOWS: ONE READABLE PLUME, AND NOTHING ELSE
 * A picture draws only what the scooters give off. Their exhaust is one soft
 * plume per row: it leaves the tailpipes, stays low (under about 90 cm at the
 * tailpipe), spreads and thins toward the kerb, and wraps the waiting people
 * from the ground up. Every edge fades to nothing; it is drawn BEHIND the
 * people, so it never covers a face. The marks live only inside the plume:
 *
 *   ribbon  a wavy line    what you can smell: fuel vapour (benzene travels in it)
 *   ring    a hollow ring  carbon monoxide: no smell. Every ring has a clear paper
 *                          centre (its halo is a paper disc), so a ring over the plume
 *                          looks exactly like a ring on a wall and like the key's ring
 *   dot     a small dot    particles: too small to see (a paper halo keeps it visible
 *                          inside the darkest plume)
 * Marks are drawn big enough to count on a phone (ring r 4–5 px, dot r 1.7–2.3 px at
 * 360 px wide), and no two rings touch: each tailpipe's own ring is placed first and the
 * kerb's rings keep clear of it.
 *
 * The street's own air is NOT drawn on walls, windows, the crossing or the
 * sky. It is still the yardstick (AIR.ringsPerPatch = 6 rings per reference
 * patch, equal to estimate.ts AIR_BASE_PER_PATCH), and the counting patch
 * (airPatch, on /estimate/ and in screen 4's sheet) draws it, so a reader sees
 * "what the street holds" and "what the pack adds" side by side there. Every
 * picture's tag says in words that the street's own air is not drawn
 * (ui illustration.tag: 示意圖｜廢氣大多看不見，街上本來的空氣沒有畫), so an empty
 * part of a picture is not read as clean air, and the numbers beside the
 * pictures carry it (0.5 ppm, 實測). The key (AirLegend) names only what that
 * picture draws.
 *
 * TWO PARTS OF THE PLUME
 *   B  where people stand     the kerb zone, from the ground to AIR.kerbTop cm,
 *      (follows the estimate) on the people's side of the nearest tailpipe:
 *                             - the plume carried on from that tailpipe to the
 *                               people: three overlapping soft ovals that grow
 *                               from AIR.plume.sourceHeight cm to the top of the
 *                               zone. Its strength has three fixed steps,
 *                               one per scenario, and is bound by a rule: the
 *                               plume's AVERAGE tint over the kerb zone is
 *                               AIR.washOpacity (10 / 18 / 26 %), the same
 *                               amount of tint the flat wash of the first
 *                               design laid on the zone; air() works out the
 *                               opacity that gives that average for each
 *                               picture's shape (washStrength), and the
 *                               strongest point stays under AIR.washMax. It is
 *                               the same ink, gathered into a plume shape, not
 *                               more of it;
 *                             - rings: extraRingsPerPatch() per reference patch,
 *                               i.e. 6 × (carbon monoxide the pack adds, middle
 *                               value) ÷ (what the street already holds), at
 *                               least 1: +1 / +3 / +6 for few / dozen / full.
 *                               They are placed from the ground up to RING_ROOM
 *                               (82 %) of the plume's height at that point (it
 *                               is lower near the tailpipe), where the plume is
 *                               strong, and the count is worked out over that
 *                               same area (the people standing in it do not
 *                               shrink it: the rings go round them, never on a
 *                               face), so the density is the rule's. A
 *                               plume smaller than a patch therefore holds
 *                               fewer rings than the patch count (one patch of
 *                               plume-shaped zone: 1 / 2 / 4); a full patch of
 *                               plume holds exactly 1 / 3 / 6 (tested);
 *                             - ribbons that reach the people: 1 / 3 / 5.
 *                             The three scenarios nest (few ⊂ dozen ⊂ full).
 *                             Even over the zone's area: no bands by height.
 *   C  at each tailpipe       one fixed soft core behind each petrol tailpipe,
 *      (drawn for the eye)    low on the ground, thinning over about two
 *                             metres; the cores of one row overlap into that
 *                             row's plume. Each keeps a small cluster of marks
 *                             (at most 1 ring, 3 dots, 1 ribbon, fewer in a
 *                             wide shot; a crowded scene passes 0 for its far
 *                             rows). NOT scaled by the estimate.
 *
 * WHY THIS IS HONEST. The only amount a picture shows is the kerb part, and it
 * follows the signed estimate (推估): for the dozen the pack adds about half of
 * what the street already holds, so +3 rings per patch where the street's own
 * 6 would be; those 6 are not drawn, so a picture never shows more than the
 * estimate, and it never draws the pack's air on top of a lattice that could
 * be mistaken for exhaust. The plume adds no more tint than the old flat wash
 * did (same average), and every picture's tag says the street's air is left out. The cores and the plume's shape are fixed and are
 * said to be drawn for the eye (alt text, /estimate/#drawing).
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
 * MARKUP the film and kit.ts read (keep it): every ring and dot is a halo pair
 * `<use class="air-halo X" href="#id"/><path id="id" class="air-ring|air-dot X"/>`;
 * cores are `<g class="air-core" data-src transform opacity>` and clusters
 * `<g class="air-src" data-src transform>` with no <g> inside; the kerb marks
 * sit in one `<g class="air-kerb">`; the kerb plume is one element whose first
 * ` opacity="…"` is its step.
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

  /**
   * The street's own air, per reference patch. NOT drawn in pictures: it is the yardstick
   * the extra rings are measured against, and the counting patch (airPatch) draws it.
   */
  ringsPerPatch: 6,
  dotsPerPatch: 6,

  /** Layer B: the plume where people stand reaches from the ground to this height, in cm. */
  kerbTop: 150,
  /**
   * Layer B: how much the plume tints the kerb zone ON AVERAGE, three fixed steps (the same
   * 10 / 18 / 26 % the flat wash of the first design used). The plume is shaped (soft ovals,
   * darker in its middle, fading at its edges), so air() works out, for each picture, the
   * opacity that gives exactly this average over the zone (washStrength). Never opaque.
   */
  washOpacity: { few: 0.1, dozen: 0.18, full: 0.26 },
  /** the plume's strongest point may never be darker than this (it stays lighter than a core) */
  washMax: 0.62,
  /**
   * Layer B: the plume's shape (fixed, drawn for the eye). It leaves the nearest tailpipe at
   * `sourceHeight` cm and grows to the top of the zone over the people. `ovals`: where each soft
   * oval sits from the tailpipe (0) to the far side of the people (1), and its strength.
   */
  plume: { sourceHeight: 70, ovals: [[0.14, 0.75], [0.5, 0.68], [0.84, 0.72]] as readonly (readonly [number, number])[] },
  /** Layer B: ribbons that reach the people. */
  ribbonsToPeople: { few: 1, dozen: 3, full: 5 },

  /** Layer C: one core per tailpipe. Lengths in cm at scale 1. */
  core: {
    /** how far the core reaches from the tailpipe before it has thinned away */
    length: 200,
    /** how tall it is; it sits on the ground, so the plume stays below about 90 cm at the tailpipe */
    height: 84,
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
    rings: 1,
    dots: 3,
    ribbons: 1,
    fullAtPx: 150,
    /** rows of a pack fade with distance: opacity of the core in rows 1, 2, 3 */
    rowOpacity: [1, 0.74, 0.56],
  },
  /** A car at the frame's edge keeps one small core: this scale, one ring, two dots. */
  car: { scale: 0.6, rings: 1, dots: 2, ribbons: 1 },
  /** Grey dots at each electric scooter's tyres (tyre and brake dust stays). */
  tyreDots: 3,

  /** Mark sizes, in pixels at refWidth. */
  ring: { rMin: 4, rMax: 5, stroke: 2, halo: 1.2 },
  dot: { rMin: 1.7, rMax: 2.3, halo: 1 },
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
  /** share of the zone's height, from the ground, that holds the rings (default RING_ROOM; the counting patch uses 1) */
  ringRoom?: number;
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
  /**
   * Draw the street's own rings and dots over the whole frame (AIR.ringsPerPatch, AIR.dotsPerPatch
   * per patch). Only the counting patch does this; pictures leave it to the words.
   */
  streetAir?: boolean;
  /** @deprecated pictures no longer draw the street's own air; kept so old callers still compile */
  noStreetAir?: boolean;
}

export interface AirCounts {
  /** layer A marks drawn in the whole frame */
  street: { rings: number; dots: number };
  /** layer B marks drawn in the kerb zone, for each scenario */
  /** wash: the plume's drawn opacity, worked out so its average tint over the zone is AIR.washOpacity */
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
/** Where people stand, rings are placed from the ground up to this share of the plume's height (its strong part). */
const RING_ROOM = 0.82;

/**
 * A ring as two circles wound the same way. Filled even-odd (the mark, .air-ring) it is a hollow
 * annulus; filled non-zero (its halo underneath, .air-halo) it is a whole disc in the colour of the
 * paper. So every ring looks the same everywhere: a blue ring with a clear paper centre, over the
 * plume as on a plain wall, exactly like the ring in the key.
 */
function ringPath(cx: number, cy: number, r: number, sw: number): string {
  const o = r + sw / 2;
  const i = Math.max(0.01, r - sw / 2);
  return (
    `M${f(cx - o)},${f(cy)}a${f(o)},${f(o)} 0 1,0 ${f(o * 2)},0a${f(o)},${f(o)} 0 1,0 ${f(-o * 2)},0Z` +
    `M${f(cx - i)},${f(cy)}a${f(i)},${f(i)} 0 1,0 ${f(i * 2)},0a${f(i)},${f(i)} 0 1,0 ${f(-i * 2)},0Z`
  );
}

/** The radial gradient of one soft oval of the plume: stops (offset, opacity), as air() writes them. */
const WASH_STOPS: readonly (readonly [number, number])[] = [[0, 1], [0.5, 0.9], [0.8, 0.45], [1, 0]];
function washStop(t: number): number {
  if (t >= 1) return 0;
  for (let k = 1; k < WASH_STOPS.length; k++) {
    const [o1, a1] = WASH_STOPS[k];
    const [o0, a0] = WASH_STOPS[k - 1];
    if (t <= o1) return a0 + ((a1 - a0) * (t - o0)) / (o1 - o0);
  }
  return 0;
}

/**
 * The plume's opacity for each scenario, so that its AVERAGE tint over the kerb zone is exactly
 * AIR.washOpacity (10 / 18 / 26 %), whatever the picture's shape. `ovals` are the plume's soft
 * ovals (centre, radii, own opacity); the zone is sampled on a 48 × 48 grid, overlapping ovals
 * composited as paint does (1 − Π(1 − a)). Capped so the strongest point stays under AIR.washMax.
 */
export function washStrength(zone: Box, ovals: readonly { cx: number; cy: number; rx: number; ry: number; k: number }[]): { group: Record<AirScenario, number>; mean: number; peak: number } {
  const N = 48;
  let sum = 0;
  let peak = 0;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = zone.x + ((i + 0.5) / N) * zone.w;
      const y = zone.y + ((j + 0.5) / N) * zone.h;
      let clear = 1;
      for (const e of ovals) clear *= 1 - e.k * washStop(Math.hypot((x - e.cx) / e.rx, (y - e.cy) / e.ry));
      sum += 1 - clear;
      peak = Math.max(peak, 1 - clear);
    }
  const mean = sum / (N * N);
  const group = { few: 0, dozen: 0, full: 0 } as Record<AirScenario, number>;
  for (const s of AIR_SCENARIOS) group[s] = mean > 0 ? f(Math.min(AIR.washOpacity[s] / mean, AIR.washMax / Math.max(peak, 1e-6), 1)) : 0;
  return { group, mean, peak };
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
    // 14 candidates; in a crowded region (people standing in the plume) keep trying until one is free
    // and, if there is room for it, clear of every mark already there (two rings never touch)
    const clear = (pad * 2.2) ** 2;
    for (let c = 0; c < 240 && (c < 14 || !best || bestD < clear); c++) {
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

  // Every ring and dot carries a light halo so it reads over the darkest core. The halo is a
  // second drawing of the same path underneath (<use>, class air-halo, stroked in the colour of
  // the paper); the mark itself has a fill and no stroke, so its paint is its own colour.
  let halos = 0;
  const haloed = (kind: 'air-ring' | 'air-dot', width: number | string, cls: string, d: string, attrs: string) => {
    const hid = `${id}-h${halos++}`;
    return `<use class="air-halo ${cls}" href="#${hid}" stroke-width="${width}"${attrs}/><path id="${hid}" class="${kind} ${cls}" d="${d}"${attrs}/>`;
  };
  const ringEl = (cls: string, d: string, attrs = '') => haloed('air-ring', ringHalo, cls, d, attrs);
  const dotEl = (cls: string, d: string, attrs = '') => haloed('air-dot', dotHalo, cls, d, attrs);

  /* ---- The street's own air: NOT drawn in a picture ------------------- */
  // Only the counting patch (airPatch) draws it, as AIR.ringsPerPatch rings and AIR.dotsPerPatch dots,
  // so a reader can see "what the street holds" next to "what the pack adds" in the same square.
  let streetRings = 0;
  let streetDots = 0;
  if (o.streetAir) {
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

  /* ---- Layer C: the cores at the tailpipes ------------------------------ */
  // drawn first so the kerb's extra rings (layer B) keep clear of each tailpipe's own ring; their
  // markup still goes after layer B's
  const srcMarks: string[] = [];
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
        '<stop class="air-core-stop" offset="0" stop-opacity="0.86"/><stop class="air-core-stop" offset="0.24" stop-opacity="0.78"/>' +
        '<stop class="air-core-stop air-core-stop--mid" offset="0.5" stop-opacity="0.56"/><stop class="air-core-stop air-core-stop--far" offset="0.76" stop-opacity="0.24"/>' +
        '<stop class="air-core-stop air-core-stop--far" offset="1" stop-opacity="0"/></radialGradient>',
    );
    cores.push('<g class="air-cores">');
    srcMarks.push('<g class="air-srcs">');
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
      const nDots = s.dots ?? (s.car ? AIR.car.dots : Math.max(1, Math.round(C.dots * room)));
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
          // and clear of the rings of the tailpipes drawn before this one (a pack's rows sit close)
          for (const q of allRings) d = Math.min(d, ((q.x - s.x) * (dir === 1 ? -1 : 1) - p.x) ** 2 + (q.y - s.y - p.y) ** 2);
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
        // where it lands in the picture, so the kerb's rings keep clear of it
        allRings.push({ x: s.x + p.x * (dir === 1 ? -1 : 1), y: s.y + p.y });
      }
      if (dd) g += dotEl(`air-d${(i % 3) + 1}`, dd);
      if (rd2) g += ringEl(`air-d${((i + 1) % 3) + 1}`, rd2);
      srcMarks.push(g + '</g>');
    });
    cores.push('</g>');
    srcMarks.push('</g>');
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
    // rings live inside the plume: from the ground up to RING_ROOM of the zone's height, where the plume
    // is still strong. The count is worked out over that same area, so the density is the rule's, never more.
    const room = kerb.ringRoom ?? RING_ROOM;
    const sx = kerb.sourceX ?? (from === 1 ? zone.x + zone.w + zone.w * 0.1 : zone.x - zone.w * 0.1);
    // and only on the people's side of the nearest tailpipe: the plume leaves it toward them
    const px0 = from === 1 ? zone.x : Math.max(zone.x, sx);
    const px1 = from === 1 ? Math.min(zone.x + zone.w, sx) : zone.x + zone.w;
    const inPlume: Box = { x: px0, y: ground - top * room, w: Math.max(0, px1 - px0), h: top * room };
    // the plume is lower near the tailpipe than over the people: its height at a point `u` of the way
    // from the tailpipe (0) to the far side of the people (1). Rings keep under RING_ROOM of it.
    const lowH = AIR.plume.sourceHeight * (top / AIR.kerbTop);
    const D = (from === 1 ? zone.x : zone.x + zone.w) - sx;
    const plumeH = (x: number): number => {
      const u = Math.min(1, Math.max(0, (x - sx) / D));
      return lowH + (top - lowH) * (u * u * (3 - 2 * u));
    };
    // above that line counts as outside the plume: slices of "no room" over the zone (none in the counting patch, which is all plume)
    const above: Box[] = [];
    if (kerb.ringRoom === undefined && inPlume.w > 0) {
      const N = 12;
      for (let k = 0; k < N; k++) {
        const x = inPlume.x + (k / N) * inPlume.w;
        const w = inPlume.w / N;
        const h = Math.min(plumeH(x), plumeH(x + w)) * room; // the lower edge of the slice: never above the plume
        above.push({ x, y: ground - top * 3, w, h: top * 3 - h }); // scatter keeps a ring's own radius clear of it
      }
    }
    const kerbAvoid = [...avoid, ...above];
    // the count is the plume's own area there: the people standing in it breathe that air, so their
    // outlines do not reduce it; the rings are placed around them (never on a face: `avoid`)
    const free = inPlume.w * inPlume.h * freeShare(inPlume, above, 0);
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

    // the plume where the people stand: the front row's exhaust, carried on from the nearest
    // tailpipe. Low at the tailpipe, it spreads and thins as it reaches the people and wraps them
    // from the ground up to about the top of the zone. Three overlapping soft ovals, each fading
    // to nothing at its edge, so there is no hard outline anywhere; cut off at the ground.
    defs.push(
      `<radialGradient id="${id}-wr">${WASH_STOPS.map(([o, a]) => `<stop class="air-wash-stop" offset="${o}" stop-opacity="${a}"/>`).join('')}</radialGradient>`,
      `<clipPath id="${id}-wc"><rect x="${f(Math.min(sx, sx + D) - Math.abs(D))}" y="${f(ground - top * 2)}" width="${f(Math.abs(D) * 3)}" height="${f(top * 2 + px(1))}"/></clipPath>`,
    );
    let ovals = '';
    const shape = AIR.plume.ovals.map(([u, k]) => {
      const e = u * u * (3 - 2 * u);
      const h = lowH + (top - lowH) * e;
      const o = { cx: sx + D * u, cy: ground - h * 0.3, rx: Math.abs(D) * (0.3 + 0.12 * u), ry: h * 0.72, k };
      ovals += `<ellipse cx="${f(o.cx)}" cy="${f(o.cy)}" rx="${f(o.rx)}" ry="${f(o.ry)}" fill="url(#${id}-wr)" opacity="${k}"/>`;
      return o;
    });
    // the plume is cut off at the ground (clip below), so its average is taken over the zone above it
    const w1 = washStrength(zone, shape).group;
    wash =
      `<g class="air-wash${scenario === 'all' ? ' air-wash--steps' : ''}"` +
      ` style="--air-w1:${w1.few};--air-w2:${w1.dozen};--air-w3:${w1.full}"` +
      // with 'all', CSS picks the step; the attribute is the fallback (the dozen) if no ancestor names a scenario
      ` opacity="${scenario === 'all' ? w1.dozen : w1[scenario]}" clip-path="url(#${id}-wc)">` +
      ovals +
      '</g>';

    // ribbons that reach the people, nested 1 ⊂ 3 ⊂ 5, spread evenly over the height of the zone
    const rb = rng(seed * 7919 + 37);
    const levels = [0.5, 0.2, 0.8, 0.35, 0.65];
    const nRib = AIR.ribbonsToPeople[last];
    const start = sx;
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
    const extraRings = scatter(want[last], inPlume, allRings, rk, kerbAvoid, ringPad, px(AIR.ring.rMin), px(AIR.ring.rMax));
    extraRings.forEach((m, k) => {
      marks.push(ringEl(`air-b air-b${stepOf(k, want)} air-d${(k % 3) + 1}`, ringPath(m.x, m.y, m.r, ringSw), ` data-k="${k}"`));
    });
    marks.push('</g>');

    kerbCounts = { few: { rings: 0, ribbons: 0, wash: 0 }, dozen: { rings: 0, ribbons: 0, wash: 0 }, full: { rings: 0, ribbons: 0, wash: 0 } };
    for (const s of AIR_SCENARIOS) kerbCounts[s] = { rings: Math.min(want[s], extraRings.length), ribbons: AIR.ribbonsToPeople[s], wash: w1[s] };
  }

  marks.push(...srcMarks);

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
  const d = ringPath(x, y, r, AIR.ring.stroke * upp);
  const cls = o.cls ? ' ' + o.cls : '';
  return `<path class="air-halo${cls}" stroke-width="${f(AIR.ring.halo * 2 * upp)}" d="${d}"${o.attrs ?? ''}/><path class="air-ring${cls}" d="${d}"${o.attrs ?? ''}/>`;
}
export function airDot(x: number, y: number, upp: number, o: { size?: number; cls?: string; attrs?: string } = {}): string {
  const r = (AIR.dot.rMin + (o.size ?? 0.5) * (AIR.dot.rMax - AIR.dot.rMin)) * upp;
  const d = dotPath(x, y, r);
  const cls = o.cls ? ' ' + o.cls : '';
  return `<path class="air-halo${cls}" stroke-width="${f(AIR.dot.halo * 2 * upp)}" d="${d}"${o.attrs ?? ''}/><path class="air-dot${cls}" d="${d}"${o.attrs ?? ''}/>`;
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
  const a = air({ frame, upp, seed: o.seed ?? 5, id: o.id, streetAir: true, kerb: { x0: 0, x1: size, ground: size, top: size, ringRoom: 1 }, extra: { few: e, dozen: e, full: e }, scenario: 'few' });
  // a patch has no direction and no people: keep the rings and dots, drop the ribbon and the feathered wash
  const marks = a.marks.replace(/<path class="air-rib[^>]*\/>/g, '');
  // the plume's step as a flat tint: its average over the zone in a picture (AIR.washOpacity)
  const tint = o.wash ? `<rect class="air-wash air-wash--flat" width="${size}" height="${size}" opacity="${f(o.wash)}"/>` : '';
  return { svg: tint + marks, rings: a.counts.street.rings + (a.counts.kerb?.few.rings ?? 0), dots: a.counts.street.dots };
}

/* ------------------------------------------------------------------------ */
/* Glyphs for keys and legends                                                */
/* ------------------------------------------------------------------------ */

export type AirMark = 'ribbon' | 'ring' | 'dot';
/** Entries of the key under a picture (AirLegend): the three marks, the scooters' plume, a car's plume, tyre dust. */
export type AirKeyItem = AirMark | 'plume' | 'car' | 'tyre' | 'nose';
/** The key most pictures carry: the plume, then the three marks inside it. */
export const AIR_KEY: readonly AirKeyItem[] = ['plume', 'ribbon', 'ring', 'dot'];

/**
 * The three marks as 24 × 24 glyphs, drawn with the same classes as the
 * scenes, for the key on screens 2 and 4 and for any legend. Wrap in
 * <svg viewBox="0 0 24 24" class="air-glyph">.
 */
export function airGlyph(kind: AirKeyItem): string {
  switch (kind) {
    case 'plume':
    case 'car':
      // a soft cloud, darkest at the left where it leaves the tailpipe (the CSS blurs its edge a little)
      return (
        '<g class="air-glyph-plume">' +
        `<ellipse class="air-glyph-plume__far" cx="13.5" cy="14" rx="10.5" ry="${kind === 'car' ? 5.5 : 7}"/>` +
        `<ellipse class="air-glyph-plume__near" cx="8" cy="15.5" rx="${kind === 'car' ? 4.5 : 6}" ry="${kind === 'car' ? 3.5 : 4.5}"/>` +
        '</g>'
      );
    case 'nose':
      // the red ring the heights and rider pictures put at each nose (parts.breath)
      return '<circle class="a-breath" cx="12" cy="12" r="7.5" stroke-width="2.4"/>';
    case 'tyre':
      return `<path class="air-tyre" d="${dotPath(6, 15, 2)}${dotPath(12, 13, 2)}${dotPath(18, 15.5, 2)}"/>`;
    case 'ribbon':
      return `<path class="air-rib" stroke-width="2.8" d="${wavePath(2, 12, 20, 1, 10, 3.6)}"/>`;
    case 'ring':
      return `<path class="air-ring" d="${ringPath(12, 12, 6, 2.4)}"/>`;
    case 'dot':
      return `<path class="air-dot" d="${dotPath(7, 15, 2.2)}${dotPath(13, 8.5, 2.2)}${dotPath(17.5, 15.5, 2.2)}"/>`;
  }
}
