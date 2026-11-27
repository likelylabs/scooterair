/**
 * air.ts — the one rule that draws air, everywhere on the site.
 *
 * Home scenes, question pages, share cards, the poster and the film all draw
 * exhaust with this function and these constants (redesign brief, section 5.1).
 * It is pure: the same options always give the same SVG, so nothing flickers
 * between renders, and nothing in it depends on time through the red light.
 *
 * WHAT A PICTURE SHOWS: FUMES COMING OUT OF THE SCOOTERS, AND NOTHING ELSE
 * Readers did not see what blue rings and dark dots stood for; the orange-brown fume coming out
 * of the scooters they recognised at once (owner, 2026-11-27). So a picture draws exhaust only as
 * it looks: a warm, soft, smoky fume that leaves each tailpipe, stays low (under about 90 cm at
 * the tailpipe), spreads and thins toward the kerb, and wraps the waiting people from the ground
 * up, with a few wavy orange wisps through it (the part you can smell). Every edge fades to
 * nothing; it is drawn BEHIND the people, so it never covers a face. There is no symbol in it
 * that needs a key. What the fume holds (sharp-smelling gases you notice, carbon monoxide that has no
 * smell, particles too small to see) is said in words: on the picture, as labels with thin leader
 * lines into the fume (scene.ts leader()), or in the text beside it.
 *
 * The street's own air is NOT drawn on walls, windows, the crossing or the
 * sky. Every picture's tag says so in words (ui illustration.tag:
 * 示意圖｜廢氣大多看不見，街上本來的空氣沒有畫), so an empty part of a picture is not read
 * as clean air, and the numbers beside the pictures carry it (0.5 ppm, 實測).
 *
 * TWO PARTS OF THE FUME
 *   B  where people stand     the kerb zone, from the ground to AIR.kerbTop cm, on the
 *      (follows the estimate) people's side of the nearest tailpipe: the fume carried on
 *                             from that tailpipe to the people, three overlapping soft
 *                             ovals that grow from AIR.plume.sourceHeight cm to the top of
 *                             the zone, and the wisps that reach the people (1 / 3 / 5).
 *                             How thick it is follows the signed estimate: its AVERAGE
 *                             tint over the zone is AIR.fumeTint × fumeSteps() (6 / 18 /
 *                             36 % for 1 / 3 / 6 steps), in proportion to the carbon
 *                             monoxide the pack adds (middle value). air() works out the
 *                             opacity that gives that average for each picture's shape
 *                             (washStrength); the strongest point stays under
 *                             AIR.washMax, so the full box is drawn a little lighter
 *                             than proportional, never darker. The three scenarios nest
 *                             (few ⊂ dozen ⊂ full).
 *   C  at each tailpipe       one fixed soft puff of fume behind each petrol tailpipe,
 *      (drawn for the eye)    low on the ground, billowing a little and thinning over
 *                             about two metres, with one or two wisps; the puffs of one
 *                             row overlap into that row's fume. NOT scaled by the estimate.
 *
 * WHY THIS IS HONEST. The only amount a picture shows is the kerb part, and it follows the
 * signed estimate (推估): for the dozen the pack adds about half of what the street already
 * holds, so 3 steps of 6 % where the street's own 6 steps would be; those are not drawn, so a
 * picture never shows more than the estimate. The puffs and the fume's shape are fixed and are
 * said to be drawn for the eye (alt text, /estimate/#drawing).
 *
 * A scene tells the function how many of its own units make one screen pixel at AIR.refWidth
 * (`upp`, by default frame width ÷ 360), so line widths and waves are the same on screen in any
 * viewBox: a 1 unit = 1 cm street, the film's 1000 × 750 stage or a 1200 × 630 share card.
 *
 * What may change a drawing: the scenario (few / dozen / full), the swap
 * slider and the repair button. Nothing else, and never the countdown.
 *
 * MARKUP the film and kit.ts read (keep it): puffs are `<g class="air-core" data-src transform
 * opacity>` and each tailpipe's wisps `<g class="air-src" data-src transform>`, with no <g>
 * inside either; the wisps that reach the people sit in one `<g class="air-kerb">`, each
 * `<path class="air-rib air-b air-bN" data-k>`; the kerb fume is one element whose first
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

  /**
   * The street's own air, in steps. NOT drawn: it is the yardstick the pack's steps are measured
   * against (fumeSteps). Equal to estimate.ts FUME_STEPS_BASE.
   */
  baseSteps: 6,

  /** Layer B: the fume where people stand reaches from the ground to this height, in cm. */
  kerbTop: 150,
  /**
   * Layer B: the fume's average tint over the kerb zone is this much per step (fumeSteps: 1 / 3 / 6),
   * i.e. 6 / 18 / 36 %: in proportion to the carbon monoxide the pack adds (middle value).
   */
  fumeTint: 0.06,
  /** the fume's strongest point may never be darker than this (it stays lighter than a puff at the tailpipe) */
  washMax: 0.62,
  /**
   * Layer B: the fume's shape (fixed, drawn for the eye). It leaves the nearest tailpipe at
   * `sourceHeight` cm and grows to the top of the zone over the people. `ovals`: where each soft
   * oval sits from the tailpipe (0) to the far side of the people (1), and its strength.
   */
  plume: { sourceHeight: 70, ovals: [[0.14, 0.75], [0.5, 0.68], [0.84, 0.72]] as readonly (readonly [number, number])[] },
  /** Layer B: wisps that reach the people. */
  ribbonsToPeople: { few: 1, dozen: 3, full: 5 },

  /** Layer C: one puff per tailpipe. Lengths in cm at scale 1. */
  core: {
    /** how far the puff reaches from the tailpipe before it has thinned away */
    length: 200,
    /** how tall it is; it sits on the ground, so the fume stays below about 90 cm at the tailpipe */
    height: 84,
    /** how far it laps past the tailpipe mouth, under the scooter */
    lap: 30,
    /** height of a tailpipe mouth above the ground (parts.TAILPIPE.y) */
    mouth: 33,
    /**
     * wisps at one tailpipe, whatever the scenario, when the puff is drawn at least `fullAtPx`
     * pixels long; in a wide shot each keeps at least one.
     */
    ribbons: 1,
    fullAtPx: 150,
    /** rows of a pack fade with distance: opacity of the puff in rows 1, 2, 3 */
    rowOpacity: [1, 0.74, 0.56],
  },
  /** A car at the frame's edge keeps one small puff of its own exhaust. */
  car: { scale: 0.6, ribbons: 1 },

  /** Wisp sizes, in pixels at refWidth. */
  ribbon: { stroke: 2.6, strokeMin: 2, wave: 34, amp: 3.6 },

  /** Scenario changes cross-fade over this long (ms). Drift is a few pixels, no more. */
  fadeMs: 600,
  driftPx: 3,
} as const;

/* ------------------------------------------------------------------------ */
/* The rule                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Layer B: how many steps of fume the pack adds where people stand.
 *   6 × (carbon monoxide the pack adds, middle value) ÷ (what the street
 *   already holds at traffic stations), rounded, at least 1.
 * With the signed values of 2026-11-26 this gives 1, 3, 6 for the three scenarios.
 */
export function fumeSteps(added: number, background: number): number {
  if (!Number.isFinite(added) || !Number.isFinite(background) || added < 0 || background <= 0) {
    throw new Error(`air.ts: fumeSteps needs the estimate slots (got added=${added}, background=${background})`);
  }
  return Math.max(1, Math.round((AIR.baseSteps * added) / background));
}

/** Scene units per reference pixel, for a picture `frameWidth` units wide. */
export const unitsPerPx = (frameWidth: number): number => frameWidth / AIR.refWidth;

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
  /** row of the pack, 1 = nearest; puffs fade with distance like the scooters do */
  row?: 1 | 2 | 3;
  /** a multiplier on the puff's size for the one scooter that needs repair (G11), or the subject of a close-up; 1 for everything else */
  boost?: number;
  /** wisps at this mouth; the default follows the puff's size on screen (a crowded wide shot passes 0 for its far rows) */
  ribbons?: number;
}

/** The kerb zone (layer B). Leave it out for electric and green-light scenes. */
export interface KerbZone {
  /** left and right edge of the zone, scene units */
  x0: number;
  x1: number;
  /** y of the ground under the people (default 0) */
  ground?: number;
  /** height of the zone in scene units (default AIR.kerbTop) */
  top?: number;
  /** which side the pack is on: 1 = larger x (default), -1 = smaller x. Wisps arrive from there. */
  from?: -1 | 1;
  /** where the wisps start: the nearest tailpipe mouth. Default: just outside the zone on the pack's side, at tailpipe height. */
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
  /** layer B: steps of fume for each scenario (AIR_EXTRA from ./air-slots.ts). Required with `kerb`. */
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
  /** a car's tailpipe at the frame's edge: one small puff (kept in electric scenes) */
  cars?: AirSource[];
}

export interface AirCounts {
  /** layer B, for each scenario: wisps that reach the people, and the fume's drawn opacity (its average tint over the zone is AIR.fumeTint × steps) */
  kerb: Record<AirScenario, { ribbons: number; wash: number }> | null;
  /** layer C: puffs drawn */
  cores: number;
}

export interface AirLayers {
  /** gradients and clip paths: goes inside the same <svg>, once */
  defs: string;
  /** layer B fume. Draw it BEHIND the figures. */
  wash: string;
  /** layer C puffs. Draw them behind the people and the nearest scooter. */
  cores: string;
  /** every wisp of both layers */
  marks: string;
  /** defs + wash + cores + marks, for a picture with nothing to interleave */
  all: string;
  counts: AirCounts;
}

/* ------------------------------------------------------------------------ */
/* Drawing helpers                                                            */
/* ------------------------------------------------------------------------ */

const f = (v: number): number => +v.toFixed(2);

/** The radial gradient of one soft oval of the fume: stops (offset, opacity), as air() writes them. */
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
 * How the fume's soft ovals tint the kerb zone at full strength: their mean and their strongest
 * point. `ovals` are the fume's ovals (centre, radii, own opacity); the zone is sampled on a
 * 48 × 48 grid, overlapping ovals composited as paint does (1 − Π(1 − a)).
 */
export function washStrength(zone: Box, ovals: readonly { cx: number; cy: number; rx: number; ry: number; k: number }[]): { mean: number; peak: number } {
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
  return { mean: sum / (N * N), peak };
}

/**
 * The fume's opacity for each scenario so that its average tint over the kerb zone is
 * AIR.fumeTint × steps (in proportion to the carbon monoxide the pack adds). Capped so the
 * strongest point stays under AIR.washMax.
 */
export function fumeStrength(ws: { mean: number; peak: number }, extra: Record<AirScenario, number>): Record<AirScenario, number> {
  const group = { few: 0, dozen: 0, full: 0 } as Record<AirScenario, number>;
  for (const s of AIR_SCENARIOS) group[s] = ws.mean > 0 ? f(Math.min((AIR.fumeTint * extra[s]) / ws.mean, AIR.washMax / Math.max(ws.peak, 1e-6), 1)) : 0;
  return group;
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
 * A wisp that leaves a tailpipe and reaches the people: it starts at
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

/* ------------------------------------------------------------------------ */
/* air()                                                                      */
/* ------------------------------------------------------------------------ */

export function air(o: AirOptions): AirLayers {
  const { frame, seed = 1, id, kerb, tailpipes = [], cars = [] } = o;
  const upp = o.upp ?? unitsPerPx(frame.w);
  const scenario = o.scenario ?? 'dozen';
  const px = (v: number) => v * upp;
  const ribSw = px(AIR.ribbon.stroke);

  const defs: string[] = [];
  const marks: string[] = [];

  /* ---- Layer C: a puff at each tailpipe --------------------------------- */
  const srcMarks: string[] = [];
  const cores: string[] = [];
  const sources = [...cars.map((s) => ({ ...s, car: true })), ...tailpipes.map((s) => ({ ...s, car: false }))];
  if (sources.length) {
    const C = AIR.core;
    const len = C.length + C.lap;
    // one gradient serves every puff: darkest at the mouth, gone by the far end
    const fx = f(1 - C.lap / len);
    const fy = f(1 - C.mouth / C.height);
    defs.push(
      `<radialGradient id="${id}-c" cx="0.56" cy="0.6" r="0.5" fx="${fx}" fy="${fy}">` +
        '<stop class="air-core-stop" offset="0" stop-opacity="0.86"/><stop class="air-core-stop" offset="0.24" stop-opacity="0.78"/>' +
        '<stop class="air-core-stop air-core-stop--mid" offset="0.5" stop-opacity="0.56"/><stop class="air-core-stop air-core-stop--far" offset="0.76" stop-opacity="0.24"/>' +
        '<stop class="air-core-stop air-core-stop--far" offset="1" stop-opacity="0"/></radialGradient>',
      // the billows that make a puff read as smoke, not as a flat shadow: soft and round, lighter
      `<radialGradient id="${id}-b">` +
        '<stop class="air-core-stop air-core-stop--mid" offset="0" stop-opacity="0.5"/><stop class="air-core-stop air-core-stop--mid" offset="0.55" stop-opacity="0.34"/>' +
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
      // the main puff on the ground, and two soft billows rising off its back: one connected cloud
      const billows = [
        { cx: -w * 0.36, cy: groundY - h * 0.62, rx: w * 0.2, ry: h * 0.34 },
        { cx: -w * 0.58, cy: groundY - h * 0.5, rx: w * 0.22, ry: h * 0.36 },
      ]
        .map((b) => `<ellipse cx="${f(b.cx)}" cy="${f(b.cy)}" rx="${f(b.rx)}" ry="${f(b.ry)}" fill="url(#${id}-b)"/>`)
        .join('');
      cores.push(
        `<g class="air-core${s.car ? ' air-core--car' : ''}" data-src="${key}" transform="${t}" opacity="${op}">` +
          `<ellipse cx="${f(C.lap * k - w / 2)}" cy="${f(groundY - h / 2 + h * 0.06)}" rx="${f(w / 2)}" ry="${f(h / 2)}" fill="url(#${id}-c)"/>${billows}</g>`,
      );

      // the wisps that belong to this tailpipe: fixed, whatever the scenario
      const rs = rng(seed * 7919 + 101 + i * 13);
      const room = Math.min(1, w / upp / C.fullAtPx); // 1 in a close shot, less when the puff is only a few dozen pixels long
      const nRibs = s.ribbons ?? (s.car ? AIR.car.ribbons : Math.max(1, Math.round(C.ribbons * room)));
      let g = `<g class="air-src${s.car ? ' air-src--car' : ''}" data-src="${key}" transform="${t}">`;
      // wisps leave the mouth in a narrow fan
      const fan = [0, -1, 1];
      for (let j = 0; j < nRibs; j++) {
        const L = (58 - j * 10 + rs() * 12) * k;
        const y0 = fan[j % 3] * 5 * k;
        const sw = Math.max(px(AIR.ribbon.strokeMin), ribSw * (j === 0 ? 1.15 : 0.9));
        g += `<path class="air-rib" stroke-width="${f(sw)}" opacity="${j === 0 ? 1 : 0.8}" transform="rotate(${fan[j % 3] * -7})" d="${wavePath(-3 * k, y0, L, -1, Math.max(px(AIR.ribbon.wave) * 0.6, 17 * k), Math.max(px(AIR.ribbon.amp) * 0.7, 3.4 * k), j % 2 ? -1 : 1)}"/>`;
      }
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
    for (const s of AIR_SCENARIOS) {
      const n = o.extra[s];
      if (!Number.isFinite(n) || n < 1) throw new Error(`air.ts: extra.${s} must be at least 1 step (got ${n})`);
    }
    if (!(o.extra.few <= o.extra.dozen && o.extra.dozen <= o.extra.full)) throw new Error('air.ts: the steps must grow few ≤ dozen ≤ full');
    const ground = kerb.ground ?? 0;
    const top = kerb.top ?? AIR.kerbTop;
    const from = kerb.from ?? 1;
    const zone: Box = { x: kerb.x0, y: ground - top, w: kerb.x1 - kerb.x0, h: top };
    const sx = kerb.sourceX ?? (from === 1 ? zone.x + zone.w + zone.w * 0.1 : zone.x - zone.w * 0.1);
    const lowH = AIR.plume.sourceHeight * (top / AIR.kerbTop);
    const D = (from === 1 ? zone.x : zone.x + zone.w) - sx;
    const shown: AirScenario[] = scenario === 'all' ? [...AIR_SCENARIOS] : [scenario];
    const last = shown[shown.length - 1];
    const stepOf = (k: number, by: Record<AirScenario, number>): number => (k < by.few ? 1 : k < by.dozen ? 2 : 3);

    // the fume where the people stand: the front row's exhaust, carried on from the nearest
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
    // the fume is cut off at the ground (clip below), so its average is taken over the zone above it
    const w1 = fumeStrength(washStrength(zone, shape), o.extra);
    wash =
      `<g class="air-wash${scenario === 'all' ? ' air-wash--steps' : ''}"` +
      ` style="--air-w1:${w1.few};--air-w2:${w1.dozen};--air-w3:${w1.full}"` +
      // with 'all', CSS picks the step; the attribute is the fallback (the dozen) if no ancestor names a scenario
      ` opacity="${scenario === 'all' ? w1.dozen : w1[scenario]}" clip-path="url(#${id}-wc)">` +
      ovals +
      '</g>';

    // wisps that reach the people, nested 1 ⊂ 3 ⊂ 5, spread evenly over the height of the zone
    const rb = rng(seed * 7919 + 37);
    const levels = [0.5, 0.2, 0.8, 0.35, 0.65];
    const nRib = AIR.ribbonsToPeople[last];
    const startY = kerb.sourceY ?? ground - AIR.core.mouth * (top / AIR.kerbTop);
    const farEdge = from === 1 ? zone.x : zone.x + zone.w;
    marks.push('<g class="air-kerb">');
    for (let k = 0; k < nRib; k++) {
      const y1 = ground - top * (0.1 + 0.8 * levels[k % levels.length]) + (rb() - 0.5) * top * 0.05;
      const x1 = sx + (farEdge - sx) * (0.8 + rb() * 0.17);
      const y0 = startY + (levels[k % levels.length] - 0.5) * -px(9);
      const d = wispPath(sx, y0, x1, y1, px(AIR.ribbon.wave) * (0.9 + rb() * 0.4), px(AIR.ribbon.amp) * (0.85 + rb() * 0.4), k % 2 ? -1 : 1);
      marks.push(`<path class="air-rib air-b air-b${stepOf(k, AIR.ribbonsToPeople)}" data-k="${k}" stroke-width="${f(ribSw * (0.85 + rb() * 0.3))}" d="${d}"/>`);
    }
    marks.push('</g>');

    kerbCounts = { few: { ribbons: 0, wash: 0 }, dozen: { ribbons: 0, wash: 0 }, full: { ribbons: 0, wash: 0 } };
    for (const s of AIR_SCENARIOS) kerbCounts[s] = { ribbons: AIR.ribbonsToPeople[s], wash: w1[s] };
  }

  marks.push(...srcMarks);

  const out = {
    defs: defs.length ? `<defs>${defs.join('')}</defs>` : '',
    wash,
    cores: cores.join(''),
    marks: `<g class="air-marks${scenario === 'all' && kerb ? ' air-steps' : ''}">${marks.join('')}</g>`,
  };
  return {
    ...out,
    all: out.defs + out.wash + out.cores + out.marks,
    counts: { kerb: kerbCounts, cores: sources.length },
  };
}

/* ------------------------------------------------------------------------ */
/* Single wisps and puffs, for diagrams                                       */
/* ------------------------------------------------------------------------ */

/**
 * One wisp at a time, drawn exactly as air() draws them (same stroke), for the diagrams that
 * place every wisp on purpose: one tailpipe and a nose (G2), the way into the body (G6), the mask
 * (G17), the one scooter that needs repair (G11). A street scene never uses these: it calls air().
 *
 *   upp     drawing units per screen pixel at 360 px (unitsPerPx(frame.w))
 *   weight  a multiplier on the stroke (default 1)
 *   cls     extra classes; attrs  extra attributes (' data-k="3"')
 */
export function airRibbon(d: string, upp: number, o: { weight?: number; cls?: string; attrs?: string } = {}): string {
  return `<path class="air-rib${o.cls ? ' ' + o.cls : ''}" stroke-width="${f(AIR.ribbon.stroke * (o.weight ?? 1) * upp)}" d="${d}"${o.attrs ?? ''}/>`;
}
/** Path of a wavy line from (x, y), `len` long, toward `dir` (1 = larger x). Wave and height follow the rule. */
export const airWave = (x: number, y: number, len: number, dir: -1 | 1, upp: number, flip: 1 | -1 = 1): string =>
  wavePath(x, y, len, dir, AIR.ribbon.wave * upp * 0.7, AIR.ribbon.amp * upp * 0.8, flip);
/** Path of a wisp that eases from (x0, y0) to (x1, y1), waving as it goes. */
export const airWisp = (x0: number, y0: number, x1: number, y1: number, upp: number, flip: 1 | -1 = 1): string =>
  wispPath(x0, y0, x1, y1, AIR.ribbon.wave * upp, AIR.ribbon.amp * upp, flip);

/**
 * A soft patch of fume of any size, for a diagram (the fume inside the lungs, the soot a mask
 * holds): one or more overlapping soft ovals in the colour of the fume, every edge fading to
 * nothing. Put `airPuffDefs(id)` once in the same <svg>. `strength` is the opacity at the centre;
 * `tone: 'soot'` draws it in the darker colour of the puff at a tailpipe (what particles leave).
 */
export function airPuffDefs(id: string): string {
  const grad = (suffix: string, cls: string) => `<radialGradient id="${id}-${suffix}">${WASH_STOPS.map(([o, a]) => `<stop class="${cls}" offset="${o}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  return `<defs>${grad('p', 'air-puff-stop')}${grad('s', 'air-puff-stop air-puff-stop--soot')}</defs>`;
}
export function airPuff(id: string, ovals: readonly { cx: number; cy: number; rx: number; ry: number }[], o: { strength?: number | null; tone?: 'fume' | 'soot'; cls?: string; attrs?: string } = {}): string {
  const g = o.tone === 'soot' ? 's' : 'p';
  // `strength: null` leaves the opacity to the caller (the film writes it frame by frame)
  const op = o.strength === null ? '' : ` opacity="${f(o.strength ?? 0.6)}"`;
  return (
    `<g class="air-puff${o.cls ? ' ' + o.cls : ''}"${op}${o.attrs ?? ''}>` +
    ovals.map((e) => `<ellipse cx="${f(e.cx)}" cy="${f(e.cy)}" rx="${f(e.rx)}" ry="${f(e.ry)}" fill="url(#${id}-${g})"/>`).join('') +
    '</g>'
  );
}
