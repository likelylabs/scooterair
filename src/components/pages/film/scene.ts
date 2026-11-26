/**
 * scene.ts — the film as a pure function of time (redesign brief, section 8).
 *
 *   const film = createFilm({ locale, aspect, px, id, text, extra, drawn });
 *   film.layers            { back, atmos, world, air, cards, over }: five SVG bodies and one HTML body, with numbered slots
 *   film.nodes             what each numbered slot is at a time: nodes[i].fn(context(t)) → attributes (or styles)
 *   film.renderStatic(t)   the same bodies with those attributes baked in (stills, no JavaScript)
 *   film.hud(t)            what the clock, the chip and the number panel show at t
 *   film.defs()            the heavy static drawings, once per page, referenced with <use>
 *
 * NOTHING HERE KEEPS TIME. There is no CSS animation, no timer and no state that depends on
 * the previous frame: every transform and opacity is computed from `t` alone, so the scrubber
 * is exact, jumping to a second gives the same picture as playing to it, and a still at 0:48
 * is the film at 0:48.
 *
 * THE AIR IS DRAWN BY ONE RULE: ../../art/air.ts, the same function the home page uses.
 *   A  the street's own air   sparse rings and dots over the whole frame, in every street
 *                             shot: before the red, through it, and in the electric replay
 *   B  what the pack adds     the kerb zone where the people stand: extra rings by the
 *      where people stand     signed estimate (`extra`, from air-slots.ts), three ribbons
 *                             and the soft wash. It FORMS AS THE SCOOTERS ARRIVE AND THEN
 *                             HOLDS. Nothing changes with the countdown. At green it thins.
 *   C  the cores              one dark core per tailpipe, appearing with its scooter and
 *                             leaving with it. Drawn for the eye, not scaled by the estimate.
 * The only things the film adds to that grammar are motion: puffs that leave a tailpipe and
 * gather into its core, a drift of a few pixels, and marks travelling on the cards.
 *
 * The air under the camera is built at two sizes of mark (a wide shot and a close shot) and
 * cross-faded as the camera moves, so a ring is the rule's size on screen in both.
 *
 * Drawing: scooters, riders, people, car, LED digits, nose, masked face and body figure are
 * ../../art/parts.ts. Colours are the --art-* and --air-* tokens through the .a-* and .air-*
 * classes of src/styles/art.css. The film's own classes (.f-*) are in Film.astro.
 *
 * RULE FOR THIS FILE: a numbered slot writes SVG attributes (or, on the HTML layer, inline
 * styles). Never give a `.f-*` class a CSS `opacity`, `transform` or `display`: it would win.
 *
 * Coordinates: world units are centimetres, y = 0 is the ground, up is negative (as in
 * parts.ts). The stage is 1000 units wide; the camera maps world to stage.
 *
 * Loadable by plain Node (the MP4 export and the share cards import it): relative imports
 * with the .ts extension, nothing from '@/'.
 */
import * as P from '../../art/parts.ts';
import { AIR, air as airAll, airDot as airDot1, airRibbon, airRing as airRing1, airWisp, type AirScenario, type Box } from '../../art/air.ts';
import { T, signalAt, type Signal } from './timeline.ts';

/* ---- one element per mark ------------------------------------------------------------
 * air.ts draws the light halo of a ring or a dot as a second drawing of the same path
 * underneath it (a <use>, or a second <path>). The film moves, fades and reveals each mark on
 * its own (a data-n per element), and finds the kerb's extra rings and each tailpipe's cluster
 * by their markup, so it folds every pair back into ONE path: the halo becomes that path's
 * own stroke, painted under its fill (Film.astro: `.film [class~='air-ring'][stroke-width]`).
 * Same look, same rule, same counts; only the markup is flatter.
 */
const HALO_USE = /<use class="air-halo([^"]*)" href="#([^"]+)" stroke-width="([^"]+)"([^>]*)\/><path id="\2" class="(air-(?:ring|dot))\1" d="([^"]+)"\4\/>/g;
const HALO_PATH = /<path class="air-halo([^"]*)" stroke-width="([^"]+)" d="([^"]+)"([^>]*)\/><path class="(air-(?:ring|dot))\1" d="\3"\4\/>/g;
const oneMark = (html: string): string =>
  html.replace(HALO_USE, (_m, cls: string, _id, w: string, attrs: string, kind: string, d: string) => `<path class="${kind}${cls.trimEnd()}" stroke-width="${w}" d="${d}"${attrs}/>`).replace(HALO_PATH, (_m, cls: string, w: string, d: string, attrs: string, kind: string) => `<path class="${kind}${cls.trimEnd()}" stroke-width="${w}" d="${d}"${attrs}/>`);
function air(o: Parameters<typeof airAll>[0]): ReturnType<typeof airAll> {
  const a = airAll(o);
  const out = { ...a, marks: oneMark(a.marks), cores: oneMark(a.cores) };
  if (/class="air-halo/.test(out.marks + out.cores)) throw new Error('film: air.ts drew a halo the film cannot fold into its mark (its markup changed)');
  return out;
}
const airRing = (...a: Parameters<typeof airRing1>): string => oneMark(airRing1(...a));
const airDot = (...a: Parameters<typeof airDot1>): string => oneMark(airDot1(...a));

/* ---- small maths ------------------------------------------------------------------ */
const clamp = (v: number, a = 0, b = 1): number => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const seg = (t: number, a: number, b: number): number => clamp((t - a) / (b - a));
const eio = (k: number): number => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eo = (k: number): number => 1 - Math.pow(1 - k, 3);
const back = (k: number): number => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2);
const sine = (k: number): number => 0.5 - 0.5 * Math.cos(Math.PI * k);
const r1 = (v: number): number => Math.round(v * 10) / 10;
const r2 = (v: number): number => Math.round(v * 100) / 100;
const r3 = (v: number): number => Math.round(v * 1000) / 1000;
const mod = (v: number, m: number): number => ((v % m) + m) % m;

/* ---- the street, left to right (cm) ----------------------------------------------- */
const X0 = -1500; // drawn extent
const X1 = 2700;
const ROAD = { far: -78, near: 58 };
const STOP = 470; // stop line
const CW0 = 520; // crosswalk
const PL0 = 636; // the near corner, where people wait
const PL1 = 878;
const TB0 = 920; // two-stage turn box: its rear edge is about 50 cm past the pushchair's front wheel
const TB1 = 1170;
const SLAB0 = 1176; // far corner, with the signal pole
const SLAB1 = 1460;
const POLE = 1204;
const LEN = P.SCOOTER_LENGTH;
const PEOPLE = { elder: 662, child: 720, parent: 772 };
/** The schoolchild is the child drawing at this scale (120 cm), as in parts.person('schoolchild'). */
const KID = 1.11;

/**
 * THE PACK. One entry per scooter: row (1 = nearest), front (x of the front wheel's leading
 * edge at rest), ta (film time it comes to a stop). Twelve in the stop box and four in the
 * turn box: the number drawn must equal the estimate's `scn.dozen.drawn` (createFilm throws
 * otherwise), the same number the home page draws.
 */
const ROWS: Record<number, { s: number; lift: number }> = { 1: { s: 1, lift: 0 }, 2: { s: 0.92, lift: 12 }, 3: { s: 0.84, lift: 25 } };
interface Slot {
  row: 1 | 2 | 3;
  front: number;
  ta: number;
  turn?: boolean;
  face?: boolean;
}
const SCENE: { stopBox: Slot[]; turnBox: Slot[] } = {
  stopBox: [
    // column 1 (front), then back
    { row: 3, front: 440, ta: 6.0 }, { row: 2, front: 392, ta: 5.5 }, { row: 1, front: 462, ta: 4.9, face: true },
    { row: 3, front: 250, ta: 7.5 }, { row: 2, front: 190, ta: 7.0 }, { row: 1, front: 258, ta: 6.5 },
    { row: 3, front: 60, ta: 9.3 }, { row: 2, front: -14, ta: 8.8 }, { row: 1, front: 54, ta: 8.2, face: true },
    { row: 3, front: -134, ta: 10.9 }, { row: 2, front: -214, ta: 10.4 }, { row: 1, front: -150, ta: 9.9 },
  ],
  turnBox: [
    { row: 3, front: 1096, ta: 4.3, turn: true }, { row: 3, front: 1146, ta: 9.6, turn: true },
    { row: 2, front: 1126, ta: 7.6, turn: true }, { row: 1, front: 1112, ta: 3.2, turn: true, face: true },
  ],
};
interface Scooter extends Slot {
  i: number;
  s: number;
  lift: number;
  rear: number;
  /** film time it pulls away at green, and when its electric twin stops in the replay */
  tl: number;
  te: number;
  /** where its tailpipe opens, at rest */
  px: number;
  py: number;
}
const PACK: Scooter[] = [...SCENE.stopBox, ...SCENE.turnBox].map((q, i) => {
  const R = ROWS[q.row];
  const col = q.turn ? -1 : Math.floor(SCENE.stopBox.indexOf(q) / 3);
  return {
    ...q, i, s: R.s, lift: R.lift, rear: q.front - LEN * R.s,
    // green: the turn box leaves first, then the stop box front to back
    tl: T.green + (q.turn ? 0.12 + (3 - q.row) * 0.13 + (q.front > 1120 ? 0 : 0.1) : 0.42 + col * 0.42 + (q.row - 1) * 0.12),
    // the replay: the same pack arrives again, compressed
    te: T.electric + 0.4 + (q.ta - 3.2) * 0.36,
    px: q.front - LEN * R.s + P.TAILPIPE.x * R.s, py: -R.lift + P.TAILPIPE.y * R.s,
  };
});
/** The scooter whose tailpipe is nearest the people: the front of the turn box. Its rider gets a face and a breathing ring. */
const NEAREST = PACK.find((q) => q.turn && q.row === 1)!;
const FIRST_STOP = Math.min(...PACK.map((q) => q.ta));

/** How many scooters the film draws. Must equal est.scn.dozen.drawn. */
export const SCOOTERS_DRAWN = PACK.length;

/** Camera shots: p = portrait or square stage, l = landscape; [centre x, width that must fit]; h = height that must fit; fy = where the ground sits. */
interface Shot {
  p: [number, number];
  l: [number, number];
  h: number;
  fy: number;
  cy?: number;
}
const SHOTS: Record<string, Shot> = {
  // A shot either holds the whole signal or none of it: its LED is never cut by the edge of the frame.
  // the corner: the three people, the first scooter in the turn box and the whole signal
  open: { p: [860, 600], l: [840, 900], h: 420, fy: 0.86 },
  arrA: { p: [300, 660], l: [470, 1240], h: 380, fy: 0.84 },
  arrB: { p: [560, 740], l: [470, 1240], h: 380, fy: 0.84 },
  tail: { p: [248, 410], l: [290, 600], h: 240, fy: 0.8 },
  build0: { p: [704, 908], l: [640, 1300], h: 430, fy: 0.85 },
  // the child with a hand over her nose, the pushchair, and the nearest core coming in from the right
  kid: { p: [752, 300], l: [770, 470], h: 196, fy: 0.88 },
  build1: { p: [730, 850], l: [660, 1240], h: 430, fy: 0.85 },
  in: { p: [896, 60], l: [896, 60], h: 38, cy: -44, fy: 0.5 },
  close: { p: [729, 430], l: [700, 640], h: 232, fy: 0.87 },
  close2: { p: [729, 436], l: [704, 660], h: 236, fy: 0.87 },
  rider: { p: [868, 364], l: [790, 640], h: 224, fy: 0.87 },
  wide: { p: [800, 800], l: [680, 1300], h: 430, fy: 0.85 },
  wide2: { p: [960, 800], l: [880, 1340], h: 430, fy: 0.85 },
  elec: { p: [440, 900], l: [470, 1240], h: 390, fy: 0.84 },
  // the divider runs through the middle of the stop box: tailpipes on one side, none on the other
  cmp: { p: [290, 720], l: [300, 1100], h: 360, fy: 0.84 },
  calm: { p: [800, 720], l: [700, 1300], h: 430, fy: 0.85 },
  calm2: { p: [812, 690], l: [712, 1250], h: 430, fy: 0.85 },
};
/** [time, shot]: the camera IS at the shot at that time and eases between consecutive keys. */
const CAM: [number, string][] = [
  [0, 'open'], [T.arrive - 0.3, 'open'], [T.arrive + 1.5, 'arrA'], [T.waiting, 'arrA'], [T.waiting + 2.4, 'arrB'], [T.tail, 'arrB'],
  [T.tail + 1.5, 'tail'], [T.keeps, 'tail'], [T.keeps + 1.1, 'build0'], [T.keeps + 1.2, 'build0'], [T.keeps + 1.9, 'kid'], [T.panel, 'kid'],
  [T.panel + 1.3, 'build1'], [T.inside, 'build1'], [T.inside + 1.4, 'in'], [T.closest - 0.6, 'in'], [T.closest + 0.9, 'close'], [T.child, 'close'],
  [T.child + 1.6, 'close2'], [T.rider, 'close2'], [T.rider + 1.1, 'rider'], [T.last, 'rider'], [T.last + 1.4, 'wide'], [T.green + 0.5, 'wide'],
  [T.leave + 3.2, 'wide2'], [T.swap - 0.05, 'wide2'], [T.swap, 'elec'], [T.compare - 0.2, 'elec'], [T.compare + 1.1, 'cmp'], [T.money + 0.4, 'cmp'],
  [T.money + 0.5, 'calm'], [T.end, 'calm'], [T.total, 'calm2'],
];
/** Shots whose camera is close enough to switch the air to its close-shot size. */
const LOD_WIDE = 'build1';
const LOD_CLOSE = 'close';

/** Spans in which the street's own small motions stop: under the cards of the dive, and while the street is frozen for the health cards. */
const HOLDS: [number, number][] = [[T.inside + 1.6, T.closest - 0.4], [T.health + 0.4, T.last]];

/** Shop signs on the arcade columns. The build outlines these characters (Film.astro), so the street holds no <text>. */
export const SIGNS = ['早餐', '機車行', '藥局', '五金', '麵店', '眼鏡', '文具', '豆花', '便當', '鐘錶'];

/* ---- what the scene needs from outside ----------------------------------------------- */

/** The words and numbers drawn inside the picture, in one language. Built by ./film-data.ts from film.ts and the slots. */
export interface FilmText {
  /** 機車 {n} 輛 */
  scooters: string;
  /** 快轉 */
  fast: string;
  /** 公分 */
  cm: string;
  petrol: string;
  electric: string;
  panel: {
    /** 這排機車多出來的一氧化碳 */
    added: string;
    /** 約 0.05 到 1 ppm */
    addedValue: string;
    /** 推估 */
    estimate: string;
    /** 街上原本就有 */
    street: string;
    /** 約 0.5 ppm */
    streetValue: string;
    /** 實測 */
    measured: string;
    /** the electric replay: 這排電動機車多出來的 … 0 */
    addedElectric: string;
    zero: string;
    /** where the estimate chip goes, and what a screen reader hears for it */
    howHref: string;
    how: string;
  };
  money: {
    /** the two price tags of beat 23: the default case and the least favourable one */
    /** `before` and `after` are the words around the amount: 少付 … / … less */
    tags: { where: string; before: string; amount: string; after: string; tone: 'less' | 'more' | 'same'; plate: string; plateClass: 'light' | 'heavy' }[];
    /** 本站計算・價格和補助 11 月 26 日查 */
    chip: string;
    /** 每月騎 300 公里 */
    perMonth: string;
    bars: { label: string; value: string; amount: number }[];
  };
}

export interface FilmOptions {
  locale: 'zh-TW' | 'en';
  /** stage width ÷ height */
  aspect?: number;
  /** stage width in CSS pixels (sizes the few things that must not scale with the stage) */
  px?: number;
  /** prefix of the ids that differ between instances on one page (clips, gradients) */
  id?: string;
  /** { char: { d, adv } } in a 1000-unit em: outlines of the shop-sign characters */
  glyphs?: Record<string, { d: string; adv: number }>;
  text: FilmText;
  /** layer B: extra rings per patch (AIR_EXTRA from ../../art/air-slots.ts) */
  extra: Record<AirScenario, number>;
  /** est.scn.dozen.drawn: the film must draw exactly this many scooters */
  drawn: number;
}

type Attrs = Record<string, string | number | null | undefined>;
export interface Camera {
  s: number;
  tx: number;
  ty: number;
  cx: number;
}
export interface Context {
  t: number;
  /** world time: t less the holds */
  wt: number;
  sig: Signal;
  /** how much of layer B has formed: 0 before the pack, 1 once it has arrived; falls after green */
  form: number;
  /** seconds of the red light, for the clouds */
  story: number;
  /** the divider of the comparison, as a fraction of the stage width (1 = all petrol, 0 = all electric) */
  split: number;
  cam: Camera;
  electric: boolean;
  /** weight of the close-shot air, 0 to 1 */
  near: number;
  /** how well the signal's own LED sits inside the frame, 0 to 1 */
  ledIn: number;
}
export interface FilmNode {
  fn: (c: Context) => Attrs;
  /** the slot is constant outside [a, b] */
  a: number;
  b: number;
  /** an HTML element: the values are inline styles */
  css?: boolean;
}
export interface HudState {
  led: number | null;
  lamp: 'green' | 'amber' | 'red';
  /** opacity of the clock in the corner: it shows whenever the signal's own LED is out of frame or covered */
  clock: number;
  /** 0 = real time, 1 = ▸▸, 2 = ▸▸▸ */
  ff: 0 | 1 | 2;
  /** the word 快轉 beside the mark: the first time it appears */
  ffWord: boolean;
  hold: boolean;
  scooters: number | null;
  panel: number;
  zero: boolean;
  /** which illustration tag is on */
  tag: 'street' | 'body' | 'none';
  end: number;
}
export type LayerName = 'back' | 'atmos' | 'world' | 'air' | 'cards' | 'over';
/** The SVG layers, bottom to top: the street; its own air; the pack, its air and the people; the ruler; the cards. `over` is HTML. */
export const SVG_LAYERS = ['back', 'atmos', 'world', 'air', 'cards'] as const;

const esc = (s: string | number): string => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HIDE: Attrs = { display: 'none' };

export function createFilm(opt: FilmOptions) {
  if (PACK.length !== opt.drawn) throw new Error(`film: the picture draws ${PACK.length} scooters but the estimate's scn.dozen.drawn is ${opt.drawn}. Change SCENE in scene.ts.`);
  const TX = opt.text;
  const VW = 1000;
  const ASPECT = opt.aspect || 1.5;
  const VH = VW / ASPECT;
  const PX = opt.px || 360;
  const ID = opt.id || 'fx';
  const nodes: FilmNode[] = [];
  /** A numbered slot: `fn(c)` returns its attributes at context c. Constant outside [a, b]. */
  const dyn = (fn: (c: Context) => Attrs, a = -1, b = 1e9): string => {
    nodes.push({ fn, a, b });
    return ` data-n="${nodes.length - 1}"`;
  };
  /** The same for an HTML element: the values are inline styles. */
  const dynS = (fn: (c: Context) => Attrs, a = -1, b = 1e9): string => {
    nodes.push({ fn, a, b, css: true });
    return ` data-n="${nodes.length - 1}"`;
  };
  /** A group that a still drops whole when it is not on screen. */
  let grpN = 0;
  const grp = (attrs: string, inner: string): string => {
    const k = grpN++;
    return `<g data-grp="${k}"${attrs}>${inner}</g><!--${k}-->`;
  };

  /* ================================================================================
   * Camera
   * ================================================================================ */
  const shots: Record<string, { cx: number; cy: number; fy: number; ls: number }> = {};
  {
    const k = clamp((ASPECT - 1.05) / 0.6);
    for (const n in SHOTS) {
      const q = SHOTS[n];
      const w = lerp(q.p[1], q.l[1], k);
      shots[n] = { cx: lerp(q.p[0], q.l[0], k), cy: q.cy || 0, fy: q.fy, ls: Math.log(Math.min(VW / w, VH / q.h)) };
    }
  }
  function camera(t: number): Camera & { ls: number } {
    let i = 0;
    while (i < CAM.length - 2 && t >= CAM[i + 1][0]) i++;
    const a = shots[CAM[i][1]];
    const b = shots[CAM[i + 1][1]];
    let k = seg(t, CAM[i][0], CAM[i + 1][0]);
    k = CAM[i][1] === 'calm' ? sine(k) : eio(k);
    const ls = lerp(a.ls, b.ls, k);
    const s = Math.exp(ls);
    const cx = lerp(a.cx, b.cx, k);
    const cy = lerp(a.cy, b.cy, k);
    const fy = lerp(a.fy, b.fy, k);
    return { s, ls, cx, tx: VW / 2 - cx * s, ty: VH * fy - cy * s };
  }
  const camAttr = (c: Context): Attrs => ({ transform: `translate(${r2(c.cam.tx)} ${r2(c.cam.ty)}) scale(${r3(c.cam.s)})` });
  const CAMG = (): string => `<g${dyn(camAttr)}>`;
  /** A design box (w × h) centred in the stage and scaled to fit: for the cards. */
  const fit = (w: number, h: number, pad = 1) => (): Attrs => {
    const s = Math.min(VW / w, VH / h) * pad;
    return { transform: `translate(${r2((VW - w * s) / 2)} ${r2((VH - h * s) / 2)}) scale(${r3(s)})` };
  };
  const FULL = '<rect x="-4000" y="-4000" width="9000" height="9000"';
  /**
   * How big a mark is. The rule sizes marks for a picture 360 px wide and lets them grow with
   * the picture; the home page's pictures stop growing at about 600 px, so the film's marks do
   * too. On a laptop's wide stage that means more marks of the same size, not giant ones.
   */
  const MARK = Math.min(1, 600 / PX);
  /** Drawing units per reference pixel, for marks drawn under the camera at a shot. */
  const uppAt = (shot: string): number => ((VW / AIR.refWidth) * MARK) / Math.exp(shots[shot].ls);
  /** The same for marks drawn on a card (a 400 × 300 design box). */
  const CARD_UPP = 400 / AIR.refWidth;

  /* the signal: where its own LED is, so the corner clock can stand in when it is out of frame */
  const HX = POLE - 196;
  const SY = -372;
  const BX = HX - 58;
  /** Spans in which a card covers the street. */
  const COVERED: [number, number][] = [[T.inside + 1.0, T.closest + 0.5], [T.health + 0.3, T.last + 0.4], [T.rewind + 0.3, T.electric - 0.2], [T.money, T.end + 0.6]];
  const covered = (t: number): boolean => COVERED.some(([a, b]) => t >= a && t < b);

  /* ================================================================================
   * Context: everything a frame needs, computed once per frame
   * ================================================================================ */
  function context(t: number): Context {
    const sig = signalAt(t);
    let arr = 0;
    for (const q of PACK) arr += seg(t, q.ta, q.ta + 2.2);
    arr /= PACK.length;
    // layer B forms as the scooters arrive, then holds; it thins once they have gone; behind the divider it is remembered
    let form: number;
    if (t < T.green) form = arr;
    else if (t < T.swap) form = 1 - eo(seg(t, T.green + 0.8, T.green + 5.4));
    else form = t >= T.compare - 0.3 && t < T.compare + 5.2 ? 1 : 0;
    const story = sig.run === 'petrol' ? sig.s + sig.g : sig.run === 'electric' ? sig.s : 0;
    const split = t < T.swap ? 1 : 0.5 * (eio(seg(t, T.compare + 0.2, T.compare + 1.4)) - eio(seg(t, T.compare + 3.9, T.compare + 5.0)));
    let wt = t;
    for (const [a, b] of HOLDS) wt -= clamp(t - a, 0, b - a);
    const cam = camera(t);
    const wide = shots[LOD_WIDE].ls;
    const close = shots[LOD_CLOSE].ls;
    const u = clamp((cam.ls - wide) / (close - wide || 1));
    const near = clamp((u - 0.4) / 0.25);
    // the LED box of the signal, in stage units
    const m = Math.min(cam.tx + BX * cam.s, VW - (cam.tx + (BX + 52) * cam.s), cam.ty + SY * cam.s, VH - (cam.ty + (SY + 52) * cam.s));
    const ledIn = covered(t) ? 0 : clamp((m - 18) / 12);
    return { t, wt, sig, form, story, split, cam, electric: t >= T.swap, near: r2(near * near * (3 - 2 * near)), ledIn: r2(ledIn) };
  }

  /* ================================================================================
   * BACK: the street itself. Static under the camera.
   * ================================================================================ */
  function buildings(): string {
    const o: string[] = [];
    const B = ROAD.far;
    const bay = 232;
    const G = opt.glyphs;
    const floors = [3, 4, 3, 2, 4, 3, 3, 4, 2, 3, 4, 3, 3, 2, 4, 3, 4, 3, 2];
    o.push('<g class="f-arch">');
    for (let x = X0 + 26, i = 0; x < X1; x += bay, i++) {
      const n = floors[i % floors.length];
      const top = B - 330 - n * 168;
      // upper storeys: a wall, floor lines, two windows a floor, a balcony or an air conditioner
      o.push(`<rect class="f-wall" x="${x}" y="${top}" width="${bay}" height="${-330 - top + B}"/>`);
      o.push(`<path class="a-line" d="M${x},${top} H${x + bay} M${x},${top} V${B - 330} M${x + bay},${top} V${B - 330}"/>`);
      o.push(`<rect class="a-plane" x="${x - 4}" y="${top - 14}" width="${bay + 8}" height="14"/>`);
      for (let f = 0; f < n; f++) {
        const y = B - 330 - (f + 1) * 168;
        const kind = (i * 3 + f * 5) % 4;
        if (kind === 0) {
          o.push(`<rect class="f-win" x="${x + 34}" y="${y + 40}" width="${bay - 68}" height="84"/><path class="a-line" d="M${x + bay / 2},${y + 40} v84 M${x + 22},${y + 132} H${x + bay - 22} M${x + 22},${y + 132} v26 M${x + bay - 22},${y + 132} v26 M${x + 22},${y + 158} H${x + bay - 22}"/>`);
        } else {
          o.push(`<rect class="f-win" x="${x + 30}" y="${y + 44}" width="62" height="78"/><rect class="f-win" x="${x + bay - 98}" y="${y + 44}" width="62" height="78"/>`);
          o.push(`<path class="a-line" d="M${x + 61},${y + 44} v78 M${x + bay - 67},${y + 44} v78"/>`);
          if (kind === 1) o.push(`<rect class="a-plane" x="${x + 104}" y="${y + 96}" width="34" height="24"/><rect class="a-line" x="${x + 104}" y="${y + 96}" width="34" height="24"/>`);
        }
      }
      if (i % 3 === 1) o.push(`<rect class="a-plane" x="${x + 60}" y="${top - 74}" width="58" height="46"/><path class="a-line" d="M${x + 60},${top - 74} h58 v46 h-58 Z M${x + 66},${top - 28} v14 M${x + 112},${top - 28} v14"/>`);
      // ground floor: the arcade
      if (i % 2 === 0) {
        let d = '';
        for (let y = B - 250; y < B; y += 22) d += `M${x + 44},${y} H${x + bay - 28} `;
        o.push(`<path class="a-line" stroke-width="1" d="${d}"/><rect class="a-line" x="${x + 44}" y="${B - 262}" width="${bay - 72}" height="262"/>`);
      } else {
        o.push(`<rect class="a-line" x="${x + 48}" y="${B - 200}" width="62" height="200"/><rect class="a-line" x="${x + 126}" y="${B - 200}" width="${bay - 158}" height="120"/>`);
      }
      o.push(`<rect class="a-plane" x="${x}" y="${B - 300}" width="28" height="300"/><path class="a-line" d="M${x},${B - 300} V${B} M${x + 28},${B - 300} V${B}"/>`);
      const chars = [...SIGNS[i % SIGNS.length]];
      const sh = chars.length * 34 + 16;
      o.push(`<rect class="a-plane" x="${x - 8}" y="${B - 290}" width="44" height="${sh}"/><rect class="a-line" x="${x - 8}" y="${B - 290}" width="44" height="${sh}"/>`);
      // the sign's characters are outlines; where the build gave none (a script-side film) the sign is a blank plate
      if (G) chars.forEach((ch, k) => G[ch] && o.push(`<path class="f-sign" transform="translate(${r1(x + 14 - (G[ch].adv * 0.026) / 2)} ${B - 290 + 38 + k * 34}) scale(0.026 -0.026)" d="${G[ch].d}"/>`));
    }
    // the arcade beam runs the whole street
    o.push(`<rect class="a-plane" x="${X0}" y="${B - 330}" width="${X1 - X0}" height="30"/><path class="a-line" d="M${X0},${B - 330} H${X1} M${X0},${B - 300} H${X1}"/>`);
    o.push('</g>');
    return o.join('');
  }

  function road(): string {
    const o: string[] = [];
    const { far: F, near: N } = ROAD;
    o.push(`<rect class="a-road" x="${X0}" y="${F}" width="${X1 - X0}" height="${N - F + 4}"/>`);
    // centre line (double yellow), up to the junction and beyond it
    o.push(`<path class="f-yellow" d="M${X0},-44 H${STOP - 30} M${X0},-39 H${STOP - 30} M${SLAB1 + 160},-44 H${X1} M${SLAB1 + 160},-39 H${X1}"/>`);
    const box = (x0: number, x1: number) =>
      `<path class="a-paint" d="M${x0},${F + 46} H${x1} v${N - F - 50} H${x0} Z M${x0 + 6},${F + 51} v${N - F - 60} H${x1 - 6} v${-(N - F - 60)} Z" fill-rule="evenodd"/>`;
    o.push(box(-390, STOP - 6));
    o.push(`<rect class="a-paint" x="${STOP}" y="${F + 44}" width="14" height="${N - F - 40}"/>`);
    [[F + 5, 5], [F + 17, 6], [F + 31, 7], [-28, 8], [-10, 9], [10, 11], [32, 14]].forEach(([y, h]) => o.push(`<rect class="a-paint" x="${CW0}" y="${y}" width="${PL0 - CW0 + 20}" height="${h}"/>`));
    o.push(box(TB0, TB1));
    // far corner: pavement and kerb, with the first bars of the other street's crosswalk beyond it
    o.push(`<rect class="a-kerb" x="${SLAB0}" y="${F}" width="${SLAB1 - SLAB0}" height="${N - F + 6}"/>`);
    let joints = '';
    for (let x = SLAB0 + 34; x < SLAB1; x += 34) joints += `M${x},${F} V${N + 4} `;
    o.push(`<path class="a-line" stroke-width="1" d="${joints}M${SLAB0},8 H${SLAB1}"/>`);
    for (let x = SLAB1 + 10; x < SLAB1 + 150; x += 22) o.push(`<rect class="a-paint" x="${x}" y="${F + 6}" width="12" height="${N - F - 8}"/>`);
    // near pavement along the bottom of the frame, rising to the corner where people wait
    o.push(`<rect class="a-kerb" x="${X0}" y="${N}" width="${X1 - X0}" height="1400"/>`);
    let pj = '';
    for (let x = X0 + 20; x < X1; x += 62) pj += `M${x},${N} v1400 `;
    for (let y = N + 44; y < N + 1400; y += 52) pj += `M${X0},${y} H${X1} `;
    o.push(`<path class="a-line" stroke-width="1" d="${pj}"/>`);
    o.push(`<path class="a-kerb" d="M${PL0 - 26},${N + 1} L${PL0 - 4},4 Q${PL0},-4 ${PL0 + 10},-4 H${PL1 - 22} Q${PL1 - 8},-4 ${PL1 - 2},6 L${PL1 + 22},${N + 1} Z"/>`);
    o.push(`<path class="f-kerbline" d="M${PL0 - 4},4 Q${PL0},-4 ${PL0 + 10},-4 H${PL1 - 22} Q${PL1 - 8},-4 ${PL1 - 2},6"/>`);
    return o.join('');
  }

  /* ---- signal ------------------------------------------------------------------- */
  const ledD = (n: number): string => {
    const s = String(clamp(Math.round(n), 0, 99)).padStart(2, '0');
    return P.ledDigitRuns(s[0], 4.2, BX + 3.2, SY + 11.3) + P.ledDigitRuns(s[1], 4.2, BX + 28.4, SY + 11.3);
  };
  function signal(): string {
    const o: string[] = [];
    o.push(`<path class="a-ink-s" stroke-width="8" d="M${POLE},0 V${SY + 26} H${HX + 130}"/>`);
    // the bloom: red when it turns red, green at green
    o.push(`<circle cx="${HX + 26}" cy="${SY + 26}" r="120" fill="url(#f-glow-r)"${dyn((c) => {
      const t = c.t;
      const on = c.sig.lamp === 'red';
      const pop = t < T.swap ? seg(t, T.red, T.red + 1.4) : seg(t, T.swap, T.swap + 0.1);
      const k = on ? 1 + 1.6 * (1 - eo(pop)) : 0;
      return { opacity: on ? r2(Math.min(1, 0.75 + 0.5 * (1 - pop))) : 0, transform: `translate(${HX + 26} ${SY + 26}) scale(${r2(k)}) translate(${-(HX + 26)} ${-(SY + 26)})` };
    })}/>`);
    o.push(`<circle cx="${HX + 110}" cy="${SY + 26}" r="120" fill="url(#f-glow-g)"${dyn((c) => {
      const t = c.t;
      const on = c.sig.lamp === 'green';
      const pop = t < T.red ? 1 : seg(t, T.green, T.green + 1.6);
      const k = on ? 1 + 2.4 * (1 - eo(pop)) : 0;
      return { opacity: on ? r2(Math.min(1, 0.75 + 0.6 * (1 - pop))) : 0, transform: `translate(${HX + 110} ${SY + 26}) scale(${r2(k)}) translate(${-(HX + 110)} ${-(SY + 26)})` };
    })}/>`);
    o.push(`<rect class="a-housing" x="${HX}" y="${SY}" width="136" height="52" rx="6"/>`);
    [26, 68, 110].forEach((dx) => o.push(`<circle class="a-lamp-off" cx="${HX + dx}" cy="${SY + 26}" r="17"/>`));
    const lamp = (dx: number, cls: string, name: string) => `<circle class="${cls}" cx="${HX + dx}" cy="${SY + 26}" r="17"${dyn((c) => ({ opacity: c.sig.lamp === name ? 1 : 0 }))}/>`;
    o.push(lamp(26, 'a-led-red', 'red'), lamp(68, 'f-led-amber', 'amber'), lamp(110, 'a-led-green', 'green'));
    o.push(`<rect class="a-housing" x="${BX}" y="${SY}" width="52" height="52" rx="6"/>`);
    // the count: lit only while the whole box is in the frame (the corner clock shows it otherwise: one clock at a time)
    o.push(`<path class="a-dots a-led-red" stroke-width="3.3" stroke-dasharray="0.01 4.19"${dyn((c) => ({ d: ledD(c.sig.led === null ? 0 : c.sig.led), opacity: c.sig.led === null ? 0 : c.ledIn }))}/>`);
    // pedestrian head for the people on the corner: they go when the pack goes
    const fig = (rows: readonly string[], cls: string, on: boolean) =>
      `<path class="a-dots ${cls}" stroke-width="1.6" stroke-dasharray="0.01 1.99" d="${P.ledRuns(rows, 2, 3, 2)}"${dyn((c) => ({ opacity: (c.sig.lamp === 'green') === on ? 1 : 0 }))}/>`;
    o.push(`<g transform="translate(${POLE + 8} -262) scale(1.45)"><rect class="a-housing" width="30" height="36" rx="2.5"/>${fig(P.LED_FIGURES.stand, 'a-led-red', false)}${fig(P.LED_FIGURES.walk, 'a-led-green', true)}</g>`);
    return o.join('');
  }

  /* ---- other traffic: a car in the far lane, heading away, with its own small core ----- */
  const CAR_PASS: [number, number][] = [[T.waiting - 0.2, T.waiting + 4.4], [T.panel + 1.4, T.panel + 5.8], [T.electric + 1.3, T.electric + 3.6], [T.compare + 1.5, T.compare + 3.9], [T.end + 0.4, T.total + 0.2]];
  function car(): string {
    const cs = 0.6;
    const pipe = { x: P.CAR_TAILPIPE.x * cs, y: P.CAR_TAILPIPE.y * cs };
    const a = air({ frame: { x: 0, y: -200, w: 600, h: 200 }, upp: uppAt(LOD_WIDE), id: `${ID}-car`, seed: 3, noStreetAir: true, cars: [{ ...pipe, dir: 1, scale: 1.2 }] });
    return (
      a.defs +
      `<g${dyn((c) => {
        for (const [a0, b0] of CAR_PASS) {
          if (c.t >= a0 && c.t <= b0) return { transform: `translate(${r1(lerp(2150, -700, (c.t - a0) / (b0 - a0)))} -64)`, display: null };
        }
        return HIDE;
      })}>${a.cores}<g class="a-row-3" transform="scale(${cs})">${P.car()}</g>${a.marks}</g>`
    );
  }

  function clouds(): string {
    const one = (x: number, y: number, s: number) => `<path class="f-cloud" transform="translate(${x} ${y}) scale(${s})" d="M0,0 h260 a34 34 0 0 0 -30,-52 a58 58 0 0 0 -106,-22 a40 40 0 0 0 -70,26 a30 30 0 0 0 -54,48 Z"/>`;
    return `<g${dyn((c) => ({ transform: `translate(${r1(c.story * 2.6 - 140)} 0)` }))}>${one(-260, -1080, 1.5)}${one(520, -1180, 1.1)}${one(1180, -1040, 1.7)}${one(1900, -1160, 1.2)}</g>`;
  }

  function backLayer(): string {
    return CAMG() + `<rect class="f-sky" x="${X0}" y="-3200" width="${X1 - X0}" height="${3200 + ROAD.far}"/>` + clouds() + '<use href="#f-street"/>' + car() + signal() + '</g>';
  }

  /* ================================================================================
   * WORLD: the pack, its air, the people
   * ================================================================================ */
  /** Braking to a stop at time `ta`: constant deceleration over the last `tb` seconds. */
  const approach = (u: number, tb: number, a: number): number => (u <= tb ? 0.5 * a * u * u : 0.5 * a * tb * tb + a * tb * (u - tb));
  /** How far a petrol scooter has gone since it pulled away. */
  function away(q: Scooter, t: number): number {
    const u = t - q.tl;
    if (u <= 0) return 0;
    const a = 250;
    const vm = 860;
    const tv = vm / a;
    return u < tv ? 0.5 * a * u * u : 0.5 * a * tv * tv + vm * (u - tv);
  }
  const REMEMBER: [number, number] = [T.compare - 0.3, T.compare + 5.2]; // the petrol pack, behind the divider
  function scooterAttr(q: Scooter, t: number, kind: 'gas' | 'electric', wt: number): Attrs {
    const gas = kind === 'gas';
    const ta = gas ? q.ta : q.te;
    let x = q.rear;
    let y = -q.lift;
    let rot = 0;
    let pivot = 154;
    let s = q.s;
    let op: number | null = null;
    if (gas && t >= T.swap) {
      if (t < REMEMBER[0] || t > REMEMBER[1]) return HIDE;
    } else if (!gas && t < T.swap) return HIDE;
    else if (gas && t >= q.tl) {
      // green: pull away, front of the pack first; the nose lifts
      const dx = away(q, t);
      if (dx > 2700) return HIDE;
      const u = t - q.tl;
      x += dx;
      rot = -2.4 * Math.sin(Math.PI * clamp(u / 1.1)) * (1 - 0.5 * clamp(u / 1.1));
      pivot = 36;
    } else if (t >= ta) {
      // stopped: a small settle on the suspension, then (petrol only) the idle shake
      const u = t - ta;
      if (u < 0.55) rot = -1.1 * Math.sin((Math.PI * u) / 0.55) * (1 - u / 0.55);
      if (gas && t < T.swap) {
        x += 0.3 * Math.sin(wt * 71 + q.i * 1.7);
        y += 0.34 * Math.sin(wt * 83 + q.i * 2.3);
      }
    } else if (q.turn) {
      // riders from the cross street: they come across from the far side and swing into the box
      const k = seg(t, ta - (gas ? 1.5 : 1.0), ta);
      if (k <= 0) return HIDE;
      const e = eo(k);
      x -= 96 * (1 - e);
      y -= 58 * (1 - e);
      s *= 0.8 + 0.2 * e;
      op = r2(seg(k, 0, 0.25));
    } else {
      // ride in and brake: the nose dips while braking
      const u = ta - t;
      const tb = gas ? 2.4 : 1.7;
      const dx = approach(u, tb, gas ? 250 : 420);
      if (dx > 2300) return HIDE;
      x -= dx;
      rot = u <= tb ? 1.5 * Math.sin(Math.PI * (1 - u / tb)) : 0;
    }
    const tr = `translate(${r1(x)} ${r2(y)})${rot ? ` rotate(${r2(rot)} ${r1(pivot * s)} 0)` : ''} scale(${r3(s)})`;
    return { transform: tr, opacity: op, display: null };
  }
  function scooterRow(kind: 'gas' | 'electric', row: number): string {
    const o: string[] = [`<g class="${row === 1 ? '' : `a-row-${row}`}">`];
    for (const q of PACK.filter((p) => p.row === row)) {
      const a = kind === 'gas' ? Math.min(q.ta - 10, 0) : T.swap - 0.1;
      const b = kind === 'gas' ? REMEMBER[1] + 0.2 : T.total;
      o.push(`<use href="#f-sc-${kind}${q.face ? '-face' : ''}"${dyn((c) => scooterAttr(q, c.t, kind, c.wt), a, b)}/>`);
    }
    o.push('</g>');
    return o.join('');
  }

  /* ---- the air under the camera: layers B and C, by air.ts, at two sizes of mark -------- */
  const AIR_T: [number, number] = [FIRST_STOP - 0.2, REMEMBER[1] + 0.3];
  /** How much of a tailpipe's core is there: it gathers after the scooter stops and leaves with it. */
  function coreK(q: Scooter, c: Context): number {
    const t = c.t;
    if (t >= T.swap) return t >= REMEMBER[0] && t <= REMEMBER[1] ? 1 : 0;
    const k = eo(seg(t, q.ta + 0.1, q.ta + 2.6)) * (1 - seg(t, q.tl + 0.3, q.tl + 2.8));
    return k * (0.95 + 0.05 * Math.sin(c.wt * 2.3 + q.i * 1.9));
  }
  /** After green the core is dragged a little way along behind its scooter. */
  const drag = (q: Scooter, t: number): number => (t >= q.tl && t < T.swap ? 150 * eo(seg(t, q.tl, q.tl + 2.8)) : 0);
  const order = [...PACK].sort((a, b) => b.row - a.row); // back row first, as air.ts asks
  const avoid: Box[] = [
    ...P.figureBoxes('elder-woman', PEOPLE.elder),
    ...P.figureBoxes('schoolchild-cover', PEOPLE.child),
    ...P.figureBoxes('stroller', PEOPLE.parent),
  ];
  interface PackAir {
    defs: string;
    wash: string;
    cores: Record<number, string>;
    clusters: Record<number, string>;
    kerb: string;
  }
  function packAir(tag: string, shot: string, sparse: boolean): PackAir {
    const upp = uppAt(shot);
    const a = air({
      frame: { x: X0, y: -400, w: X1 - X0, h: 460 },
      upp,
      seed: 12,
      id: `${ID}-${tag}`,
      noStreetAir: true,
      scenario: 'dozen',
      extra: opt.extra,
      kerb: { x0: PL0 - 12, x1: TB0 - 4, sourceX: NEAREST.px, sourceY: NEAREST.py },
      // in the wide shot the far rows keep one ring, a few dots and one ribbon each, as on the home page: sixteen full clusters would bury the pack
      tailpipes: order.map((q) => ({ x: q.px, y: q.py, scale: q.s, row: q.row, ...(sparse && q.row !== 1 ? { rings: 1, dots: 3, ribbons: 1 } : {}) })),
      avoid,
    });
    const out: PackAir = { defs: a.defs, wash: '', cores: { 1: '', 2: '', 3: '' }, clusters: { 1: '', 2: '', 3: '' }, kerb: '' };
    // the wash: its fixed step of opacity, times how much of the layer has formed
    out.wash = a.wash.replace(/ opacity="[^"]*"/, dyn((c) => ({ opacity: r3(AIR.washOpacity.dozen * c.form), display: c.form > 0 ? null : 'none' }), ...AIR_T));
    // each core and its cluster of marks belong to one scooter: they come and go with it
    for (const m of a.cores.matchAll(/<g class="air-core" data-src="(\d+)" transform="[^"]*" opacity="([^"]*)">(.*?)<\/g>/g)) {
      const q = order[+m[1]];
      const rowOp = +m[2];
      out.cores[q.row] += grp(
        ` class="air-core"${dyn((c) => {
          const k = coreK(q, c);
          return k <= 0 ? HIDE : { transform: `translate(${r1(q.px + drag(q, c.t))} ${r1(q.py)})`, opacity: r2(rowOp * k), display: null };
        }, ...AIR_T)}`,
        m[3],
      );
    }
    for (const m of a.marks.matchAll(/<g class="air-src" data-src="(\d+)" transform="[^"]*">(.*?)<\/g>/g)) {
      const q = order[+m[1]];
      out.clusters[q.row] += grp(
        ` class="air-src"${dyn((c) => {
          const k = coreK(q, c);
          if (k <= 0) return HIDE;
          // the drift: a few pixels, no more
          const d = AIR.driftPx * upp * 0.5;
          return { transform: `translate(${r1(q.px + drag(q, c.t) + d * Math.sin(c.wt * 0.7 + q.i * 2.1))} ${r1(q.py + d * 0.6 * Math.sin(c.wt * 0.9 + q.i))})`, opacity: r2(Math.min(1, k * 1.2)), display: null };
        }, ...AIR_T)}`,
        m[2],
      );
    }
    // the kerb's extra rings and its ribbons arrive one after another as the layer forms
    const kerb = /<g class="air-kerb">(.*?)<\/g>/.exec(a.marks)?.[1] ?? '';
    const ribs = [...kerb.matchAll(/<path class="air-rib air-b[^"]*" data-k="(\d+)"[^>]*\/>/g)];
    const rings = [...kerb.matchAll(/<path class="air-ring air-b[^"]*"[^>]*data-k="(\d+)"\/>/g)];
    const reveal = (k: number, n: number, wave: number) => (c: Context): Attrs => {
      const th = (k + 0.6) / (n + 0.4);
      const on = seg(c.form, th - 0.1, th);
      const d = AIR.driftPx * upp * 0.5;
      return on <= 0 ? HIDE : { opacity: r2(on), transform: `translate(${r1(d * Math.sin(c.wt * 0.6 + k * 1.7 + wave))} ${r1(d * 0.7 * Math.sin(c.wt * 0.8 + k * 2.3))})`, display: null };
    };
    for (const m of ribs) out.kerb += m[0].replace(/ data-k="\d+"/, dyn(reveal(+m[1], ribs.length, 1), ...AIR_T));
    for (const m of rings) out.kerb += m[0].replace(/ data-k="\d+"/, dyn(reveal(+m[1], rings.length, 0), ...AIR_T));
    return out;
  }
  /** One of the two sizes of mark: the wide-shot set shows when the camera is wide, the close-shot set when it is close. */
  const lod = (near: boolean, inner: string): string =>
    inner
      ? grp(dyn((c) => {
          const k = near ? c.near : 1 - c.near;
          return k <= 0 ? HIDE : { opacity: k < 1 ? k : null, display: null };
        }, ...AIR_T), inner)
      : '';

  /* ---- puffs: they leave each tailpipe at knee height and gather into its core ---------- */
  function puffs(): string {
    const o: string[] = [];
    const LIFE = 2.1;
    for (const q of PACK) {
      for (let k = 0; k < 3; k++) {
        const off = (k / 3 + ((q.i * 0.377) % 1)) * LIFE;
        const jy = ((q.i * 7 + k * 3) % 5) - 2;
        o.push(
          `<circle class="f-puff" r="10"${dyn((c) => {
            const t = c.t;
            const live = t < T.swap ? t >= q.ta - 0.2 && t < q.tl : t >= REMEMBER[0] && t <= REMEMBER[1];
            if (!live) return HIDE;
            const age = mod(c.wt + off, LIFE);
            if (t < T.swap && c.wt - age < q.ta - 0.25) return HIDE; // this puff would have left before the scooter arrived
            const p = age / LIFE;
            const x = q.px - 6 - 78 * q.s * eo(p);
            const y = q.py - 2 - (14 + jy * 3) * p * q.s + 8 * p * p;
            const op = (p < 0.1 ? p / 0.1 : 1 - (p - 0.1) / 0.9) * 0.55;
            return { transform: `translate(${r1(x)} ${r1(y)}) scale(${r2((0.45 + 1.9 * p) * q.s)})`, opacity: r2(op), display: null };
          }, ...AIR_T)}/>`,
        );
      }
      // pulling away: one short puff. Its direction is documented; how big it is has not been measured, so nothing here says.
      o.push(
        `<circle class="f-puff" r="10"${dyn((c) => {
          const u = c.t - q.tl;
          if (u < 0 || u > 2.2 || c.t >= T.swap) return HIDE;
          const p = u / 2.2;
          return { transform: `translate(${r1(q.px + 30 * eo(p))} ${r1(q.py - 4 - 26 * eo(p))}) scale(${r2((0.8 + 3 * eo(p)) * q.s)})`, opacity: r2(0.6 * (1 - p) * (1 - p)), display: null };
        }, T.green, T.green + 8)}/>`,
      );
    }
    return o.join('');
  }

  /* ---- people -------------------------------------------------------------------- */
  interface Plan {
    home: number;
    out0: number;
    speed: number;
  }
  /** Where a walker is at t, and how far it has walked (for the step). The three wait from the first frame and cross at green. */
  function walk(t: number, plan: Plan): { x: number; d: number; moving: boolean } {
    if (t >= T.swap || t < plan.out0) return { x: plan.home, d: 0, moving: false };
    const d = (t - plan.out0) * plan.speed * eo(seg(t, plan.out0, plan.out0 + 0.8));
    return { x: plan.home + d, d, moving: true };
  }
  const PLAN: Record<'child' | 'parent' | 'elder', Plan> = {
    child: { home: PEOPLE.child, out0: T.green + 1.5, speed: 92 },
    parent: { home: PEOPLE.parent, out0: T.green + 1.9, speed: 88 },
    elder: { home: PEOPLE.elder, out0: T.green + 2.4, speed: 50 },
  };
  /** The child's hand goes to her nose when the first exhaust reaches the corner, and stays there until the pack has gone. */
  const covering = (t: number): boolean => t >= FIRST_STOP + 0.5 && t < T.green + 0.5;
  function people(): string {
    const o: string[] = [];
    const step = (who: keyof typeof PLAN, len: number) => (c: Context): Attrs => {
      const w = walk(c.t, PLAN[who]);
      const bob = w.moving ? -1.6 * Math.abs(Math.sin((Math.PI * w.d) / len)) : 0;
      return { transform: `translate(${r1(w.x)} ${r2(bob)})` };
    };
    const pose = (who: keyof typeof PLAN, len: number, which: boolean) => (c: Context): Attrs => {
      const w = walk(c.t, PLAN[who]);
      const a = w.moving ? Math.floor(w.d / len) % 2 === 0 : true;
      return { display: a === which ? null : 'none' };
    };
    const walkT: [number, number] = [T.green, T.swap + 0.2];
    // the older woman, who has been waiting since before the film starts
    o.push(`<g class="f-halo"${dyn(step('elder', 34), ...walkT)}>${P.person('elder-woman')}</g>`);
    // the schoolchild: waits, covers nose and mouth when the smell arrives, walks on at green
    o.push(`<g class="f-halo"${dyn(step('child', 33), ...walkT)}><g transform="scale(${KID})">`);
    o.push(`<g${dyn(pose('child', 33, true), ...walkT)}>${P.childLegs(-9, 10)}</g><g${dyn(pose('child', 33, false), ...walkT)}>${P.childLegs(-2, 3)}</g>${P.childTop()}`);
    o.push(`<g${dyn((c) => ({ display: covering(c.t) ? 'none' : null }), 0, T.green + 1)}>${P.childArm('down')}</g>`);
    o.push(`<g${dyn((c) => {
      if (!covering(c.t)) return HIDE;
      // the hand comes up in a quarter of a second
      const k = eo(seg(c.t, FIRST_STOP + 0.5, FIRST_STOP + 0.75));
      return { display: null, transform: `rotate(${r1(-34 * (1 - k))} 0 -80)` };
    }, 0, T.green + 1)}>${P.childArm('cover')}</g>`);
    o.push('</g></g>');
    // the parent with the pushchair
    o.push(`<g class="f-halo"${dyn(step('parent', 46), ...walkT)}>`);
    o.push(`<g${dyn(pose('parent', 46, true), ...walkT)}>${P.adultLegs(13)}</g><g${dyn(pose('parent', 46, false), ...walkT)}>${P.adultLegs(3)}</g>${P.adultTop([30, -98])}${P.pushchair()}`);
    o.push('</g>');
    return o.join('');
  }

  function worldLayer(): string {
    const wide = packAir('w', LOD_WIDE, true);
    const near = packAir('c', LOD_CLOSE, false);
    // electric scooters: tyre and brake dust stays (three grey dots behind each rear tyre)
    const tyres = (shot: string) =>
      air({ frame: { x: X0, y: -400, w: X1 - X0, h: 460 }, upp: uppAt(shot), seed: 5, id: `${ID}-t${shot}`, noStreetAir: true, tyres: PACK.map((q) => ({ x: q.rear + P.REAR_TYRE.x * q.s, y: -q.lift, scale: q.s })) }).marks;
    const o: string[] = [];
    o.push(
      '<defs>' +
        `<clipPath id="${ID}-l"><rect x="0" y="-10" height="4000"${dyn((c) => ({ width: r1(VW * c.split) }), T.swap - 0.2, T.money + 1)}/></clipPath>` +
        `<clipPath id="${ID}-r"><rect y="-10" height="4000" width="3000"${dyn((c) => ({ x: r1(c.electric ? VW * c.split : 0) }), T.swap - 0.2, T.money + 1)}/></clipPath>` +
        '</defs>' +
        wide.defs +
        near.defs,
    );
    const both = (pick: (a: PackAir) => string) => lod(false, pick(wide)) + lod(true, pick(near));
    // petrol side, back to front: the wash behind everything; each far row with its cores low in front of it;
    // the front row's cores behind its scooters, so the nearest silhouettes stay whole; marks over all
    o.push(`<g clip-path="url(#${ID}-l)">${CAMG()}`);
    o.push(both((a) => a.wash));
    o.push(scooterRow('gas', 3), both((a) => a.cores[3]), scooterRow('gas', 2), both((a) => a.cores[2]), both((a) => a.cores[1]), scooterRow('gas', 1));
    o.push(puffs());
    o.push(both((a) => a.clusters[3] + a.clusters[2] + a.clusters[1] + a.kerb));
    o.push('</g></g>');
    // electric side
    o.push(`<g clip-path="url(#${ID}-r)">${CAMG()}${scooterRow('electric', 3)}${scooterRow('electric', 2)}${scooterRow('electric', 1)}`);
    const dust = (isNear: boolean, shot: string) =>
      grp(dyn((c) => {
        const k = (isNear ? c.near : 1 - c.near) * seg(c.t, T.electric + 1.6, T.electric + 3.4);
        return k <= 0 ? HIDE : { opacity: r2(k), display: null };
      }, T.swap - 0.2, T.total), tyres(shot));
    o.push(dust(false, LOD_WIDE), dust(true, LOD_CLOSE));
    o.push('</g></g>');
    o.push(CAMG(), people(), '</g>');
    return o.join('');
  }

  /* ================================================================================
   * ATMOS: the street's own air (layer A). AIR: what the ruler shot adds over everything
   * ================================================================================ */
  /**
   * Layer A, the street's own air: sparse rings and dots at the rule's one density, over the
   * whole street, in every shot. It lies behind the scooters and the people, and keeps clear of
   * the signal. Like the pack's air it is drawn at two sizes of mark and cross-faded.
   */
  function streetAir(): string {
    const keep: Box[] = [...avoid, { x: BX - 8, y: SY - 8, w: 58 + 136 + 16, h: 68 }, { x: POLE + 2, y: -268, w: 56, h: 64 }];
    const one = (tag: string, shot: string, frame: Box, near: boolean): string => {
      const upp = uppAt(shot);
      const a = air({ frame, upp, id: `${ID}-s${tag}`, seed: 21, avoid: keep });
      // three drift groups of each kind, each a few pixels, each at its own pace
      let k = 0;
      const marks = a.marks.replace(/<path class="air-(dot|ring) air-d(\d)"/g, (_m, kind: string, d: string) => {
        const g = +d + (kind === 'dot' ? 0 : 3);
        const ph = k++;
        return `<path class="air-${kind}"${dyn((c) => {
          const amp = AIR.driftPx * upp * 0.5;
          return { transform: `translate(${r1(amp * Math.sin(c.wt * (0.5 + g * 0.06) + ph * 1.3))} ${r1(amp * 0.8 * Math.sin(c.wt * (0.62 + g * 0.05) + ph * 2.1))})` };
        })}`;
      });
      return grp(dyn((c) => {
        const w = near ? c.near : 1 - c.near;
        return w <= 0 ? HIDE : { opacity: w < 1 ? w : null, display: null };
      }), marks);
    };
    return CAMG() + one('w', LOD_WIDE, { x: -800, y: -1000, w: 2600, h: 1170 }, false) + one('c', LOD_CLOSE, { x: -100, y: -600, w: 1400, h: 700 }, true) + '</g>';
  }

  /** The ruler shot: the pushchair band, the tailpipe's height, the ruler, and a breathing ring at every nose. No bands in the air. */
  const RULER_X = PL0 - 10;
  const CT: [number, number] = [T.closest, T.health + 0.1];
  // the ruler leaves as the camera nudges toward the rider (it would be cut by the frame's edge)
  const rulerOn = (c: Context): number => seg(c.t, T.closest + 0.9, T.closest + 1.7) * (1 - seg(c.t, T.rider - 0.1, T.rider + 0.5));
  function closest(): string {
    const o: string[] = [];
    o.push(CAMG());
    // the pushchair band, 55 to 85 cm
    const B = P.STROLLER_BAND;
    o.push(`<rect class="f-stroller-band" x="${RULER_X}" y="${-B.high}" width="${TB0 + 30 - RULER_X}" height="${B.high - B.low}"${dyn((c) => ({ opacity: r2(rulerOn(c)) }), ...CT)}/>`);
    o.push(`<path class="f-stroller-edge" d="M${RULER_X},${-B.high} H${TB0 + 30} M${RULER_X},${-B.low} H${TB0 + 30}"${dyn((c) => ({ opacity: r2(rulerOn(c)) }), ...CT)}/>`);
    // the tailpipe's height, carried across to the ruler
    o.push(`<path class="f-level" d="M${RULER_X},${r1(NEAREST.py)} H${r1(NEAREST.px)}"${dyn((c) => ({ opacity: r2(rulerOn(c)), 'stroke-dashoffset': r1(-c.t * 14) }), ...CT)}/>`);
    // ruler 0 to 180 cm
    let ticks = `M${RULER_X},0 V-180`;
    for (let h = 0; h <= 180; h += 10) ticks += ` M${RULER_X},${-h} h${h % 50 === 0 ? -12 : -6}`;
    o.push(`<g${dyn((c) => ({ opacity: r2(rulerOn(c)), transform: `translate(${r1(-30 * (1 - eo(seg(c.t, T.closest + 0.9, T.closest + 1.7))))} 0)` }), ...CT)}><path class="f-ruler" d="${ticks}"/></g>`);
    // breathing: a ring at each nose; a child's is quicker than an adult's. The rider's comes last (beat 12).
    const m = P.MOUTH;
    const noses = [
      { x: PEOPLE.parent + m.pushchair.x, y: m.pushchair.y, period: 1.9, big: true, at: T.closest + 1.6 },
      { x: PEOPLE.child + m.schoolchild.x, y: m.schoolchild.y, period: 2.6, big: true, at: T.closest + 1.85 },
      { x: PEOPLE.elder + m['elder-woman'].x, y: m['elder-woman'].y, period: 4.2, big: false, at: T.closest + 2.1 },
      { x: PEOPLE.parent + m.parent.x, y: m.parent.y, period: 4.2, big: false, at: T.closest + 2.35 },
      { x: NEAREST.rear + P.RIDER_MOUTH.x, y: P.RIDER_MOUTH.y, period: 4.2, big: true, at: T.rider + 0.5 },
    ];
    for (const n of noses) {
      o.push(
        `<circle class="${n.big ? 'f-breath' : 'f-breath f-breath--quiet'}" r="${n.big ? 11 : 9}"${dyn((c) => {
          const show = seg(c.t, n.at, n.at + 0.5) * (1 - seg(c.t, T.health - 0.4, T.health));
          // off screen it rests in one fixed state, so its value does not depend on how the clock got here
          if (show <= 0) return { transform: `translate(${r1(n.x)} ${n.y}) scale(0)`, opacity: 0 };
          const k = 0.5 - 0.5 * Math.cos((6.2832 * c.t) / n.period);
          const pop = back(seg(c.t, n.at, n.at + 0.5));
          return { transform: `translate(${r1(n.x)} ${n.y}) scale(${r2((0.82 + 0.42 * k) * pop)})`, opacity: r2(show * (0.75 + 0.25 * k)) };
        }, ...CT)}/>`,
      );
    }
    o.push('</g>');
    return o.join('');
  }

  /* ================================================================================
   * CARDS: drawn in stage coordinates, over the street
   * ================================================================================ */
  function wavy(x: number, y: number, len: number, wl: number, amp: number): string {
    const half = Math.max(2, Math.round(len / (wl / 2)));
    let d = `M${r1(x)},${r1(y)} q${r1(wl / 4)},${r1(-amp)} ${r1(wl / 2)},0`;
    for (let k = 1; k < half; k++) d += ` t${r1(wl / 2)},0`;
    return d;
  }

  /** Inside the layer: what is in it (beats 7 to 9), and what an ordinary mask does about it (the mask beat). */
  function insideCard(): string {
    const A = T.inside + 1.0; // card in
    const M = T.mask; // the mask takes over
    const Z = T.closest; // card out
    const U = CARD_UPP * 2.5; // we are close: marks are drawn two and a half times the rule's size
    const o: string[] = [];
    o.push(`${FULL} class="f-wash"/>`);
    let inner = '';
    // drifting bands of the air we are inside
    for (let k = 0; k < 5; k++) {
      inner += `<path class="f-inwave" d="${wavy(-260, 26 + k * 62, 900, 190 + k * 22, 16)}" stroke-width="${30 - k * 3}"${dyn((c) => ({ transform: `translate(${r1(mod(c.t * (16 + k * 5), 190 + k * 22) - 100)} 0)` }), A - 0.2, Z + 0.9)}/>`;
    }

    /* --- beats 7 to 9: the nose ---------------------------------------------------- */
    let first = '';
    const noseX = 268;
    const noseY = 86;
    // A. carbon monoxide: rings drift into a nose that notices nothing
    const rc = P.rng(5);
    const co: { x: number; y: number; size: number; v: number; d: number }[] = [];
    for (let k = 0; k < 13; k++) co.push({ x: -40 + rc() * 250, y: 44 + rc() * 212, size: rc(), v: 15 + rc() * 12, d: k * 0.13 });
    const coT = T.inside + 1.5;
    co.forEach((q, k) => {
      first += `<g${dyn((c) => {
        const u = c.t - coT - q.d;
        const x = q.x + q.v * Math.max(0, u);
        const y = q.y + 5 * Math.sin(c.t * 1.2 + k);
        const into = seg(x, noseX - 6, noseX + 30); // at the nose it goes in, unnoticed
        const dim = c.t > T.fuel ? 0.5 : 1;
        return { transform: `translate(${r1(x)} ${r1(y)}) scale(${r2(back(seg(u, 0, 0.45)) * (1 - 0.5 * into))})`, opacity: r2((u < 0 ? 0 : 1) * (1 - into) * dim) };
      }, A - 0.2, M + 0.6)}>${airRing(0, 0, U * (0.8 + q.size * 0.5), { size: 0.5 })}</g>`;
    });
    // B. the smell: unburnt fuel. A drop of petrol, ribbons from it, and the nose that smells them
    const B0 = T.fuel;
    first += `<g${dyn((c) => ({ opacity: r2(seg(c.t, B0, B0 + 0.4)), transform: `translate(46 150) scale(${r2(back(seg(c.t, B0, B0 + 0.6)))})` }), B0 - 0.1, M + 0.6)}><path class="f-drop" d="M0,-34 C14,-12 22,-2 22,10 A22 22 0 0 1 -22,10 C-22,-2 -14,-12 0,-34 Z"/><path class="f-drop-hi" d="M-11,8 a11 11 0 0 0 8,12"/></g>`;
    const ribs = ['M70,138 C110,118 140,160 178,140 S240,150 286,170', 'M70,152 C116,170 150,132 190,158 S250,168 288,176', 'M70,166 C112,190 160,168 196,182 S250,186 286,182'];
    ribs.forEach((d, k) => {
      first += `<path class="air-rib" pathLength="1" stroke-dasharray="1" d="${d}" stroke-width="${8 - k}"${dyn((c) => ({ 'stroke-dashoffset': r3(1 - eio(seg(c.t, B0 + 0.3 + k * 0.18, B0 + 1.5 + k * 0.18))), opacity: c.t < B0 + 0.3 ? 0 : r2(0.95 - k * 0.14), transform: `translate(0 ${r1(2.4 * Math.sin(c.t * 3 + k * 1.4))})` }), B0 - 0.1, M + 0.6)}/>`;
    });
    // the nose: dashed while only carbon monoxide arrives, filled when the ribbons reach it
    const smell = (c: Context) => seg(c.t, B0 + 1.3, B0 + 1.7);
    first += `<g transform="translate(${noseX} ${noseY}) scale(2.7)">`;
    first += `<g${dyn((c) => ({ opacity: r2(1 - smell(c)) }), B0, B0 + 2)}>${P.nose(false)}</g>`;
    first += `<g${dyn((c) => ({ opacity: r2(smell(c)), transform: `translate(24 24) scale(${r2(1 + 0.12 * Math.sin(Math.PI * seg(c.t, B0 + 1.3, B0 + 2.1)))}) translate(-24 -24)` }), B0, B0 + 2.2)}>${P.nose(true)}</g>`;
    first += '</g>';
    // C. particles too small to see: they only show under the glass
    const C0 = T.specks;
    const lx = (c: Context) => lerp(70, 226, eio(seg(c.t, C0 + 0.2, M - 0.2)));
    const ly = (c: Context) => 150 + 46 * Math.sin(seg(c.t, C0 + 0.2, M - 0.2) * 5.2);
    first += `<clipPath id="${ID}-lens"><circle r="46"${dyn((c) => ({ cx: r1(lx(c)), cy: r1(ly(c)) }), C0 - 0.1, M + 0.6)}/></clipPath>`;
    first += `<g${dyn((c) => ({ opacity: r2(seg(c.t, C0, C0 + 0.4)), transform: `translate(${r1(lx(c))} ${r1(ly(c))}) scale(${r2(back(seg(c.t, C0, C0 + 0.5)))})` }), C0 - 0.1, M + 0.6)}><path class="f-lens-h" d="M33,33 L66,66"/><circle class="f-lens-g" r="46"/></g>`;
    first += `<g clip-path="url(#${ID}-lens)"${dyn((c) => ({ opacity: r2(seg(c.t, C0 + 0.3, C0 + 0.7)) }), C0 - 0.1, C0 + 0.8)}><use class="f-dots" href="#f-dots"/></g>`;
    first += `<circle class="f-lens-r" r="46"${dyn((c) => ({ opacity: r2(seg(c.t, C0, C0 + 0.4)), transform: `translate(${r1(lx(c))} ${r1(ly(c))}) scale(${r2(back(seg(c.t, C0, C0 + 0.5)))})` }), C0 - 0.1, M + 0.6)}/>`;
    inner += grp(dyn((c) => ({ opacity: r2(1 - seg(c.t, M - 0.1, M + 0.35)), display: c.t < M + 0.4 ? null : 'none' }), M - 0.2, M + 0.5), first);

    /* --- the mask beat: the same air meets an ordinary surgical mask -------------------- */
    let mask = '';
    const K = 1.72;
    const FX = 172;
    const FY = 296;
    const F = (p: { x: number; y: number }) => ({ x: FX + p.x * K, y: FY + p.y * K });
    const front = FX + P.MASK_FACE.front.x * K;
    const AIRWAY = 'M24,-86 C40,-91 58,-85 62,-66 C64,-52 66,-38 67,-5';
    mask += `<g transform="translate(${FX} ${FY}) scale(${K})">${P.maskHead()}<path class="a-bg-s" stroke-width="7" d="${AIRWAY}"/>${P.maskOn('surgical')}</g>`;
    // rings come in from the left and go straight through the mask, in at the nose and down the airway
    const way = [{ x: 37, y: -88.5 }, { x: 53, y: -84 }, { x: 62.5, y: -68 }, { x: 64.5, y: -48 }, { x: 66, y: -26 }, { x: 67, y: -8 }].map(F);
    const lane = (y0: number) => [{ x: -24, y: y0 }, { x: 96, y: y0 + (150 - y0) * 0.35 }, { x: front - 4, y: F(P.MASK_FACE.inside).y }, F(P.MASK_FACE.inside), ...way];
    const along = (pts: { x: number; y: number }[], u: number) => {
      // constant speed along a polyline
      let total = 0;
      const lens = pts.slice(1).map((p, i) => {
        const l = Math.hypot(p.x - pts[i].x, p.y - pts[i].y);
        total += l;
        return l;
      });
      let d = clamp(u) * total;
      for (let i = 0; i < lens.length; i++) {
        if (d <= lens[i]) return { x: lerp(pts[i].x, pts[i + 1].x, d / lens[i]), y: lerp(pts[i].y, pts[i + 1].y, d / lens[i]) };
        d -= lens[i];
      }
      return pts[pts.length - 1];
    };
    const lanes = [lane(92), lane(196)];
    for (let k = 0; k < 10; k++) {
      const pts = lanes[k % 2];
      const off = k / 10;
      mask += `<g${dyn((c) => {
        const u = mod((c.t - M) * 0.26 + off, 1);
        const p = along(pts, u);
        // the stream is already flowing when the card arrives; a ring fades in at the edge and out at the end of the airway
        return { transform: `translate(${r1(p.x)} ${r1(p.y)})`, opacity: r2(seg(u, 0, 0.06) * (1 - seg(u, 0.93, 1))) };
      }, M - 0.4, Z + 0.9)}>${airRing(0, 0, U * 0.85, { size: 0.5 })}</g>`;
    }
    // ribbons (fuel vapour, benzene) pass through too
    const inP = F(P.MASK_FACE.inside);
    [[-20, 132, -3], [-20, 168, 4]].forEach(([x0, y0, dy], k) => {
      mask += airRibbon(airWisp(x0, y0, inP.x - 2, inP.y + dy, U * 0.8, k ? -1 : 1), U * 0.8, {
        attrs: ` pathLength="1" stroke-dasharray="1"${dyn((c) => ({ 'stroke-dashoffset': r3(1 - eio(seg(c.t, M + 0.5 + k * 0.3, M + 1.9 + k * 0.3))), opacity: c.t < M + 0.5 ? 0 : 0.95, transform: `translate(0 ${r1(1.8 * Math.sin(c.t * 2.6 + k * 1.4))})` }), M - 0.1, Z + 0.9)}`,
      });
    });
    const airwayRib = `M${F({ x: 24, y: -86 }).x},${F({ x: 24, y: -86 }).y} C${F({ x: 40, y: -91 }).x},${F({ x: 40, y: -91 }).y} ${F({ x: 56, y: -86 }).x},${F({ x: 56, y: -86 }).y} ${F({ x: 61, y: -70 }).x},${F({ x: 61, y: -70 }).y}`;
    mask += airRibbon(airwayRib, U * 0.8, { attrs: ` pathLength="1" stroke-dasharray="1"${dyn((c) => ({ 'stroke-dashoffset': r3(1 - eio(seg(c.t, M + 1.9, M + 2.7))), opacity: c.t < M + 1.9 ? 0 : 0.95 }), M - 0.1, M + 2.8)}` });
    // some particles do stop on the mask: it is a particle filter, loose at the edges
    [[-4, 110], [-12, 150], [-6, 186], [-16, 128], [-10, 170]].forEach(([x0, y0], k) => {
      const stop = { x: front - 5 - (k % 2) * 6, y: F({ x: 0, y: -95 + k * 8 }).y };
      mask += `<g${dyn((c) => {
        const u = eo(seg(c.t, M + 0.3 + k * 0.32, M + 1.7 + k * 0.32));
        return { transform: `translate(${r1(lerp(x0, stop.x, u))} ${r1(lerp(y0, stop.y, u))})`, opacity: r2(seg(c.t, M + 0.3 + k * 0.32, M + 0.6 + k * 0.32)) };
      }, M - 0.1, M + 3.6)}>${airDot(0, 0, U, { size: 0.8 })}</g>`;
    });
    inner += grp(dyn((c) => ({ opacity: r2(seg(c.t, M + 0.05, M + 0.5)), display: c.t > M ? null : 'none' }), M - 0.1, M + 0.6), mask);

    o.push(`<g${dyn(fit(400, 300, 1.0))}>${inner}</g>`);
    return grp(dyn((c) => ({ opacity: r2(seg(c.t, A, A + 0.7) * (1 - seg(c.t, Z - 0.1, Z + 0.6))), display: c.t > A - 0.1 && c.t < Z + 0.7 ? null : 'none' }), A - 0.2, Z + 0.8), o.join(''));
  }

  /** Health, card A: one red light is short, but it is every day. A month fills, one dot a day; more months fan out behind it. */
  function calendarCard(): string {
    const A = T.health;
    const Z = T.body;
    let inner = '';
    const sheet = (k: number) =>
      `<g${dyn((c) => {
        const e = eo(seg(c.t, A + 3.0 + k * 0.3, A + 3.8 + k * 0.3));
        return { opacity: r2(e), transform: `translate(${r1(k * 13 * e)} ${r1(-k * 12 * e)})` };
      }, A, A + 5)}><rect class="f-sheet" width="184" height="170" rx="7"/></g>`;
    inner += sheet(3) + sheet(2) + sheet(1);
    inner += '<rect class="f-sheet" width="184" height="170" rx="7"/><rect class="f-sheet-top" width="184" height="24" rx="7"/>';
    for (let d = 0; d < 30; d++) {
      const col = d % 7;
      const row = Math.floor(d / 7);
      const x = 20 + col * 24;
      const y = 46 + row * 25.5;
      const at = A + 0.6 + 2.2 * Math.pow(d / 29, 0.62);
      inner += `<circle class="f-day" cx="${x}" cy="${y}" r="8.2"/>`;
      inner += `<circle class="a-led-red" cx="${x}" cy="${y}" r="7"${dyn((c) => ({ transform: `translate(${x} ${y}) scale(${r2(back(seg(c.t, at, at + 0.28)))}) translate(${-x} ${-y})`, opacity: c.t < at ? 0 : 1 }), A, A + 3.4)}/>`;
    }
    const body = `${FULL} class="f-freeze"/><g${dyn(fit(400, 300, 0.98))}><g transform="translate(74 40) scale(1.3)">${inner}</g></g>`;
    return grp(dyn((c) => ({ opacity: r2(seg(c.t, A + 0.1, A + 0.7) * (1 - seg(c.t, Z - 0.2, Z + 0.3))), display: c.t > A && c.t < Z + 0.35 ? null : 'none' }), A - 0.1, Z + 0.4), body);
  }

  /**
   * Health, card B: the body figure of the home page (G6). The three marks travel in once and
   * stop where they stop; then the three pins light in turn. Nothing joins it to the calendar,
   * no organ fills or changes colour. The mark positions are those of BodyFigure.astro.
   */
  const BODY_AT = { x: 172, y: 286, k: 0.882 }; // the figure's own units into the 400 × 300 card
  const PIN_AT = (i: number): number => T.pins + 0.7 + i * 1.9;
  function bodyCard(): string {
    const A = T.body;
    const Z = T.last;
    const U = 1.26; // the rule's mark size at this scale
    const r = P.rng(61);
    const split = { x: 0, y: -134 };
    const outside = { x: 230, y: -246 };
    const start = A + 0.7;
    const step = 0.28;
    /** A mark that travels in: it starts part of the way back along its route. Its pin's turn dims the other two kinds a little. */
    const go = (i: number, x: number, y: number, kind: 0 | 1 | 2) => {
      const from = x > 80 ? outside : y > -130 ? split : P.BODY.nose;
      const at = start + i * step;
      return dyn((c) => {
        const k = eo(seg(c.t, at, at + 0.75));
        let lit = 1;
        for (let p = 0; p < 3; p++) if (p !== kind) lit -= 0.6 * seg(c.t, PIN_AT(p), PIN_AT(p) + 0.3) * (1 - seg(c.t, PIN_AT(p) + 1.5, PIN_AT(p) + 1.8));
        return { transform: `translate(${r1((from.x - x) * 0.6 * (1 - k))} ${r1((from.y - y) * 0.6 * (1 - k))})`, opacity: r2(seg(c.t, at, at + 0.25) * lit) };
      }, A, Z + 0.5);
    };
    // 1 · ribbons: in at the nose, and no further than the throat
    const ribAttr = (i: number) =>
      ` pathLength="1" stroke-dasharray="1"${dyn((c) => {
        let lit = 1;
        for (let p = 1; p < 3; p++) lit -= 0.6 * seg(c.t, PIN_AT(p), PIN_AT(p) + 0.3) * (1 - seg(c.t, PIN_AT(p) + 1.5, PIN_AT(p) + 1.8));
        return { 'stroke-dashoffset': r3(1 - eio(seg(c.t, start + i * step, start + i * step + 1.1))), opacity: c.t < start + i * step ? 0 : r2(lit) };
      }, A, Z + 0.5)}`;
    const ribbons =
      [-262, -246, -230].map((y0, i) => airRibbon(airWisp(206, y0, 66, -238 + i * 2, U), U, { weight: i === 1 ? 1.15 : 0.95, attrs: ribAttr(i) })).join('') +
      airRibbon('M57,-237 C50,-241 44,-232 37,-235 C29,-238 24,-229 17,-230 C10,-231 8,-221 5,-213', U, { weight: 1.15, attrs: ribAttr(5) });
    // 2 · dots: down the windpipe, deep into both lungs
    const dotAt: [number, number, number][] = [
      [196, -214, 0], [170, -276, 0], [150, -216, 1], [128, -270, 1], [108, -220, 2], [88, -262, 2], [2, -200, 5], [0, -178, 6], [1, -156, 6],
      [-26, -110, 8], [-48, -100, 9], [-62, -80, 10], [-70, -56, 10], [-44, -62, 10], [-58, -38, 11], [-36, -36, 12], [-22, -52, 11], [-24, -84, 9], [-46, -80, 10], [-66, -30, 12], [-30, -66, 11],
      [28, -112, 8], [48, -106, 9], [64, -88, 10], [72, -62, 10], [56, -70, 11], [66, -42, 11], [52, -30, 12], [60, -26, 12], [70, -30, 12], [50, -50, 11], [34, -96, 9],
    ];
    const dots = dotAt.map(([x, y, i]) => airDot(x, y, U, { size: 0.8 + r() * 0.2, attrs: go(i, x, y, 1) })).join('');
    // 3 · rings: through a lung, into the blood, and on with it
    const ringAt: [number, number, number][] = [[200, -238, 0], [174, -256, 0], [146, -234, 1], [120, -252, 1], [96, -236, 2], [1, -188, 6], [0, -146, 7], [-34, -96, 9], [26, -100, 9], [46, -84, 10], [17, -50, 13], [17, -13, 15]];
    const rings = ringAt.map(([x, y, i]) => airRing(x, y, U, { size: 0.8, attrs: go(i, x, y, 2) })).join('');
    const body =
      `${FULL} class="f-freeze f-freeze--solid"/><g${dyn(fit(400, 300, 0.98))}><g transform="translate(${BODY_AT.x} ${BODY_AT.y}) scale(${BODY_AT.k})">` +
      `<g class="f-halo">${P.bodyFigure()}</g>${dots}${rings}${ribbons}</g></g>`;
    return grp(dyn((c) => ({ opacity: r2(seg(c.t, A + 0.05, A + 0.6) * (1 - seg(c.t, Z - 0.1, Z + 0.4))), display: c.t > A && c.t < Z + 0.45 ? null : 'none' }), A - 0.1, Z + 0.5), body);
  }

  function rewindCard(): string {
    const A = T.rewind;
    const Z = T.electric;
    const k = (c: Context) => eio(seg(c.t, A + 0.6, Z - 0.6));
    const sw = (c: Context) => eio(seg(c.t, A + 0.9, Z - 0.7));
    const inner =
      `<g${dyn((c) => ({ transform: `rotate(${r1(-360 * k(c))} 200 118)` }), A, Z)}><path class="f-rew" d="M200,48 A70 70 0 1 1 139,84"/><path class="f-rew-h" d="M124,62 L146,92 L112,96 Z"/></g>` +
      '<rect class="a-housing" x="160" y="84" width="80" height="68" rx="7"/>' +
      `<path class="a-dots a-led-red" stroke-width="5.2" stroke-dasharray="0.01 6.59"${dyn((c) => {
        const s = String(Math.round(90 * k(c))).padStart(2, '0');
        return { d: P.ledDigitRuns(s[0], 6.6, 165, 95) + P.ledDigitRuns(s[1], 6.6, 202, 95) };
      }, A, Z)}/>` +
      // petrol out, electric in
      `<g${dyn((c) => ({ transform: `translate(${r1(142 - 150 * sw(c))} 268) scale(0.62)`, opacity: r2(1 - sw(c)) }), A, Z)}><use href="#f-sc-gas"/></g>` +
      `<g${dyn((c) => ({ transform: `translate(${r1(292 - 150 * sw(c))} 268) scale(0.62)`, opacity: r2(sw(c)) }), A, Z)}><use href="#f-sc-electric-face"/></g>` +
      '<path class="f-ground" d="M40,269 H360"/>';
    return grp(
      ` class="tone-inverse"${dyn((c) => ({ opacity: r2(seg(c.t, A + 0.15, A + 0.75) * (1 - seg(c.t, Z - 0.45, Z + 0.25))), display: c.t > A && c.t < Z + 0.3 ? null : 'none' }), A - 0.1, Z + 0.4)}`,
      `${FULL} class="f-night"/><g${dyn(fit(400, 300, 0.96))}>${inner}</g>`,
    );
  }

  /**
   * The money beats. The drawing here is only the paper and the two scooters; the price tags and
   * the bars are HTML on the `over` layer (moneyOver), with the figures of the money module.
   * The scooters stand side by side for the question, step down to make room for the tags, then
   * move to the left of the two bars they belong to.
   */
  const MONEY_BOX = { w: 400, h: 300, pad: 0.98 };
  /** Three poses of each scooter on the card: [x, y, scale] in card units. */
  const POSES = {
    gas: [[26, 232, 0.92], [96, 288, 0.34], [18, 132, 0.34]],
    electric: [[206, 232, 0.92], [240, 288, 0.34], [18, 236, 0.34]],
  } as const;
  function moneyCard(): string {
    const A = T.money;
    const Z = T.end;
    const pose = (kind: 'gas' | 'electric') => (c: Context): Attrs => {
      const P0 = POSES[kind];
      const k1 = eio(seg(c.t, T.tags - 0.1, T.tags + 0.7));
      const k2 = eio(seg(c.t, T.bars - 0.1, T.bars + 0.8));
      const v = [0, 1, 2].map((j) => lerp(lerp(P0[0][j], P0[1][j], k1), P0[2][j], k2));
      // on arrival they roll in from the sides
      const inK = eo(seg(c.t, A - 0.2, A + 0.6));
      const dx = (kind === 'gas' ? -1 : 1) * 90 * (1 - inK);
      // while the price tags are up the paper is theirs alone
      const away = seg(c.t, T.tags + 0.1, T.tags + 0.5) * (1 - seg(c.t, T.bars - 0.1, T.bars + 0.4));
      return { transform: `translate(${r1(v[0] + dx)} ${r1(v[1])}) scale(${r3(v[2])})`, opacity: r2(inK * (1 - away)) };
    };
    const inner =
      `<path class="f-ground" d="M14,233 H386"${dyn((c) => ({ opacity: r2(seg(c.t, A, A + 0.4) * (1 - seg(c.t, T.tags - 0.1, T.tags + 0.4))) }), A - 0.1, T.tags + 0.5)}/>` +
      `<use href="#f-sc-gas-bare"${dyn(pose('gas'), A - 0.3, T.bars + 1)}/><use href="#f-sc-electric-bare"${dyn(pose('electric'), A - 0.3, T.bars + 1)}/>`;
    return grp(
      dyn((c) => ({ opacity: r2(seg(c.t, A - 0.3, A + 0.3) * (1 - seg(c.t, Z, Z + 0.8))), display: c.t > A - 0.35 && c.t < Z + 0.9 ? null : 'none' }), A - 0.4, Z + 1),
      `${FULL} class="f-paper"/><g${dyn(fit(MONEY_BOX.w, MONEY_BOX.h, MONEY_BOX.pad))}>${inner}</g>`,
    );
  }

  function compareMarks(): string {
    const A = T.compare;
    const Z = T.compare + 5.2;
    const vis = (c: Context) => (c.t > A && c.t < Z && c.split > 0.002 ? null : 'none');
    return (
      `<g${dyn((c) => ({ display: vis(c), transform: `translate(${r1(VW * c.split)} 0)` }), A - 0.2, Z + 0.1)}><path class="f-divider" d="M0,-10 V4000"/></g>` +
      `<g${dyn((c) => ({ display: vis(c), transform: `translate(${r1(VW * c.split)} ${r1(VH * 0.5)}) scale(${r2((VW / PX) * 1.15)})` }), A - 0.2, Z + 0.1)}><circle class="f-knob" r="13"/><path class="f-knob-a" d="M-3,-5 L-8,0 L-3,5 M3,-5 L8,0 L3,5"/></g>`
    );
  }

  /** The moment the lamp changes: a short, light wash of its colour over the picture. */
  function flashes(): string {
    const f = (cls: string, at: number, peak: number) => `${FULL} class="${cls}"${dyn((c) => {
      const u = c.t - at;
      return { opacity: u < 0 || u > 1.5 ? 0 : r2(peak * (u < 0.12 ? u / 0.12 : Math.pow(1 - (u - 0.12) / 1.38, 2))) };
    }, at - 0.1, at + 1.6)}/>`;
    return f('f-flash-r', T.red, 0.14) + f('f-flash-g', T.green, 0.2);
  }

  /* ================================================================================
   * OVER: the words inside the picture, as HTML (never SVG text)
   * ================================================================================ */
  const pct = (v: number): string => `${r2(v * 100)}%`;
  /** A point of the world, as left/top percentages of the picture at context c. */
  const worldAt = (c: Context, x: number, y: number): { left: string; top: string } => ({ left: pct((c.cam.tx + x * c.cam.s) / VW), top: pct((c.cam.ty + y * c.cam.s) / VH) });
  function overLayer(): string {
    const o: string[] = [];
    // ruler numbers
    const rulerLabel = (h: number, text: string, cls = '') =>
      `<span class="fo-ruler${cls}"${dynS((c) => {
        const k = rulerOn(c);
        return k <= 0 ? { visibility: 'hidden', opacity: 0 } : { ...worldAt(c, RULER_X - 16 - 30 * (1 - eo(seg(c.t, T.closest + 0.9, T.closest + 1.7))), -h), opacity: r2(k), visibility: 'visible' };
      }, ...CT)}>${esc(text)}</span>`;
    o.push(rulerLabel(50, '50'), rulerLabel(100, '100'), rulerLabel(150, '150'), rulerLabel(183, TX.cm, ' fo-ruler--unit'));
    // the two sides of the divider
    const tag = (cls: string, text: string, side: -1 | 1) =>
      `<span class="fo-side ${cls}"${dynS((c) => {
        const on = seg(c.t, T.compare + 1.1, T.compare + 1.5) * (1 - seg(c.t, T.compare + 3.7, T.compare + 4.0));
        return on <= 0 ? { visibility: 'hidden', opacity: 0 } : { left: pct(c.split), opacity: r2(on), visibility: 'visible', transform: `translate(${side < 0 ? 'calc(-100% - 0.9em)' : '0.9em'}, 0)` };
      }, T.compare, T.compare + 4.2)}>${esc(text)}</span>`;
    o.push(tag('fo-side--petrol', TX.petrol, -1), tag('fo-side--electric', TX.electric, 1));

    // everything below sits in the card box: the same 4:3 box the cards are drawn in
    const box: string[] = [];
    const at = (x: number, y: number) => `left:${pct(x / 400)};top:${pct(y / 300)}`;
    const show = (a: number, b: number, rise = 0) => (c: Context): Attrs => {
      const k = seg(c.t, a, a + 0.35) * (1 - seg(c.t, b - 0.3, b));
      return k <= 0 ? { visibility: 'hidden', opacity: 0 } : { opacity: r2(k), visibility: 'visible', transform: rise ? `translateY(${r1(rise * (1 - eo(seg(c.t, a, a + 0.45))))}px)` : null };
    };
    // the three pins of the body figure light in turn
    (['nose', 'lungs', 'blood'] as const).forEach((pin, i) => {
      const p = P.BODY.pins[pin];
      box.push(
        `<span class="fo-pin" style="${at(BODY_AT.x + p.x * BODY_AT.k, BODY_AT.y + p.y * BODY_AT.k)}"><b${dynS((c) => {
          const k = seg(c.t, PIN_AT(i), PIN_AT(i) + 0.3) * (1 - seg(c.t, T.last - 0.1, T.last + 0.3));
          return k <= 0 ? { visibility: 'hidden', opacity: 0 } : { opacity: r2(k), visibility: 'visible', transform: `scale(${r2(back(seg(c.t, PIN_AT(i), PIN_AT(i) + 0.4)) * (1 + 0.12 * Math.sin(Math.PI * seg(c.t, PIN_AT(i) + 0.4, PIN_AT(i) + 1.2))))})` };
        }, T.pins, T.last + 0.4)}>${i + 1}</b></span>`,
      );
    });
    // money, beat 22: the two scooters are named
    const M0 = T.money;
    box.push(`<span class="fo-name" style="${at(111, 246)}"${dynS(show(M0 + 0.4, T.tags + 0.1), M0, T.tags + 0.2)}>${esc(TX.petrol)}</span>`);
    box.push(`<span class="fo-name fo-name--e" style="${at(291, 246)}"${dynS(show(M0 + 0.6, T.tags + 0.1), M0, T.tags + 0.2)}>${esc(TX.electric)}</span>`);
    // beat 23: the two price tags drop in, one after the other, and swing to rest; then the chip that says whose sum it is
    const stack: string[] = [];
    TX.money.tags.forEach((g, i) => {
      const t0 = T.tags + 0.6 + i * 1.5;
      stack.push(
        `<div class="fo-tag fo-tag--${g.tone}"${dynS((c) => {
          const k = seg(c.t, t0, t0 + 0.3) * (1 - seg(c.t, T.bars - 0.3, T.bars));
          if (k <= 0) return { visibility: 'hidden', opacity: 0 };
          const u = seg(c.t, t0, t0 + 0.9);
          const swing = (i ? 1 : -1) * 7 * (1 - u) * Math.cos(u * 9);
          const lift = c.t > T.bars - 0.3 ? -14 * seg(c.t, T.bars - 0.3, T.bars) : -26 * (1 - back(seg(c.t, t0, t0 + 0.5)));
          return { opacity: r2(k), visibility: 'visible', transform: `translateY(${r1(lift)}px) rotate(${r2(swing)}deg)` };
        }, T.tags, T.bars + 0.1)}><span class="fo-tag__where">${esc(g.where)}</span>` +
          `<span class="fo-tag__sum">${g.before ? `<span>${esc(g.before)}</span> ` : ''}<b>${esc(g.amount)}</b>${g.after ? ` <span>${esc(g.after)}</span>` : ''}<i class="fo-plate fo-plate--${g.plateClass}">${esc(g.plate)}</i></span></div>`,
      );
    });
    stack.push(`<p class="fo-chip"${dynS(show(T.tags + 2.6, T.bars), T.tags, T.bars + 0.1)}>${chipPlus()}<span>${esc(TX.money.chip)}</span></p>`);
    box.push(`<div class="fo-stack">${stack.join('')}</div>`);
    // beat 24: two bars to one scale, labelled directly: the name above each bar, the figure under it
    const B0 = T.bars;
    const max = Math.max(...TX.money.bars.map((b) => b.amount));
    box.push(`<p class="fo-permonth" style="${at(200, 22)}"${dynS(show(B0 + 0.3, T.end + 0.3), B0, T.end + 0.4)}>${esc(TX.money.perMonth)}</p>`);
    TX.money.bars.forEach((b, i) => {
      const y = 66 + i * 104;
      const t0 = B0 + 0.8 + i * 1.3;
      const w = Math.max(0.03, b.amount / max);
      box.push(
        `<div class="fo-bar fo-bar--${i ? 'e' : 'p'}" style="${at(92, y)}"${dynS(show(t0 - 0.2, T.end + 0.3), B0, T.end + 0.4)}>` +
          `<span class="fo-bar__label">${esc(b.label)}</span>` +
          `<span class="fo-bar__track"><i style="inline-size:${pct(w)}"${dynS((c) => ({ transform: `scaleX(${r3(eo(seg(c.t, t0, t0 + 1.1)))})` }), B0, t0 + 1.2)}></i></span>` +
          `<span class="fo-bar__value"${dynS((c) => ({ opacity: r2(seg(c.t, t0 + 0.7, t0 + 1.1)) }), B0, t0 + 1.2)}>${esc(b.value)}</span>` +
          '</div>',
      );
    });
    o.push(`<div class="fo-box">${box.join('')}</div>`);
    return o.join('');
  }
  /** The plus sign of the 本站計算 chip, as on every other page (ui/kinds.ts draws the same glyph). */
  const chipPlus = (): string => '<svg class="fo-chip__g" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

  /**
   * Static drawings every instance on a page shares (the player and each still): put this once
   * in a zero-size <svg> at the top of the page. Everything else refers to it with <use>.
   */
  function defs(): string {
    const rd = P.rng(77);
    let dots = '';
    for (let k = 0; k < 170; k++) {
      const rad = 1.3 + rd() * 2;
      const x = 6 + rd() * 300;
      const y = 34 + rd() * 236;
      dots += `M${r1(x - rad)},${r1(y)}a${r1(rad)},${r1(rad)} 0 1,0 ${r1(rad * 2)},0a${r1(rad)},${r1(rad)} 0 1,0 ${r1(-rad * 2)},0`;
    }
    const sc = (kind: 'gas' | 'electric', rider: boolean, face = false) => `<g id="f-sc-${kind}${rider ? (face ? '-face' : '') : '-bare'}">${P.scooter({ kind, rider, face })}</g>`;
    return (
      '<radialGradient id="f-glow-r"><stop class="f-stop-r" offset="0" stop-opacity="0.5"/><stop class="f-stop-r" offset="0.35" stop-opacity="0.14"/><stop class="f-stop-r" offset="1" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="f-glow-g"><stop class="f-stop-g" offset="0" stop-opacity="0.55"/><stop class="f-stop-g" offset="0.35" stop-opacity="0.16"/><stop class="f-stop-g" offset="1" stop-opacity="0"/></radialGradient>' +
      `<g id="f-street">${buildings()}${road()}</g>` +
      sc('gas', true) + sc('gas', true, true) + sc('electric', true) + sc('electric', true, true) + sc('gas', false) + sc('electric', false) +
      `<path id="f-dots" d="${dots}"/>`
    );
  }

  /** Each part with the span of film time in which it can be on screen (for the stills). */
  const parts: { layer: LayerName; a: number; b: number; s: string }[] = [
    { layer: 'back', a: 0, b: 1e9, s: backLayer() },
    { layer: 'atmos', a: 0, b: 1e9, s: streetAir() },
    { layer: 'world', a: 0, b: 1e9, s: worldLayer() },
    { layer: 'air', a: T.closest, b: T.health + 0.1, s: closest() },
    { layer: 'cards', a: 0, b: 1e9, s: flashes() },
    { layer: 'cards', a: T.compare, b: T.compare + 5.3, s: compareMarks() },
    { layer: 'cards', a: T.inside + 0.8, b: T.closest + 0.8, s: insideCard() },
    { layer: 'cards', a: T.health - 0.1, b: T.body + 0.4, s: calendarCard() },
    { layer: 'cards', a: T.body - 0.1, b: T.last + 0.5, s: bodyCard() },
    { layer: 'cards', a: T.rewind - 0.1, b: T.electric + 0.4, s: rewindCard() },
    { layer: 'cards', a: T.money - 0.4, b: T.end + 1, s: moneyCard() },
    { layer: 'over', a: 0, b: 1e9, s: overLayer() },
  ];
  const layers: Record<LayerName, string> = { back: '', atmos: '', world: '', air: '', cards: '', over: '' };
  for (const p of parts) layers[p.layer] += p.s;

  /* ================================================================================
   * Evaluation
   * ================================================================================ */
  function attrsToString(a: Attrs): string {
    let s = '';
    for (const k in a) if (a[k] !== null && a[k] !== undefined) s += ` ${k}="${a[k]}"`;
    return s;
  }
  function stylesToString(a: Attrs): string {
    let s = '';
    for (const k in a) if (a[k] !== null && a[k] !== undefined) s += `${k}:${a[k]};`;
    return s ? ` style="${s}"` : '';
  }
  /**
   * Keep only the marks of the street's own air that fall inside the frame: a still shows a
   * few dozen of the hundreds the whole street holds. Each mark is one closed sub-path (a dot)
   * or two (a ring: its outer and inner edge), starting with its own M.
   */
  function cullMarks(html: string, c: Context): string {
    const pad = 30;
    const x0 = -c.cam.tx / c.cam.s - pad;
    const x1 = (VW - c.cam.tx) / c.cam.s + pad;
    const y0 = -c.cam.ty / c.cam.s - pad;
    const y1 = (VH - c.cam.ty) / c.cam.s + pad;
    return html.replace(/(<path class="air-(dot|ring)"[^>]*? d=")([^"]*)"/g, (_m, head: string, kind: string, d: string) => {
      const subs = d.split('M').filter(Boolean);
      const per = kind === 'ring' ? 2 : 1;
      let out = '';
      for (let i = 0; i < subs.length; i += per) {
        const [x, y] = subs[i].split(/[a,]/, 2).map(Number);
        if (x >= x0 && x <= x1 && y >= y0 && y <= y1) for (let j = 0; j < per; j++) out += 'M' + subs[i + j];
      }
      return `${head}${out}"`;
    });
  }

  /** The layers at film time t, as finished markup: only what is on screen at t. */
  function renderStatic(t: number): Record<LayerName, string> {
    const c = context(t);
    const out: Record<LayerName, string> = { back: '', atmos: '', world: '', air: '', cards: '', over: '' };
    for (const p of parts) {
      if (t < p.a || t > p.b) continue;
      out[p.layer] += p.s
        .replace(/ data-n="(\d+)"/g, (_m, i: string) => (nodes[+i].css ? stylesToString(nodes[+i].fn(c)) : attrsToString(nodes[+i].fn(c))))
        // groups that are not drawn at t are dropped whole
        .replace(/<g data-grp="(\d+)"[^>]*? display="none"[^>]*>[\s\S]*?<\/g><!--\1-->/g, '')
        .replace(/<!--\d+-->/g, '')
        // and so are leaves
        .replace(/<(?:use|circle|path|rect|ellipse)\b[^>]*? (?:display="none"|opacity="0")[^>]*?\/>/g, '')
        // an HTML element carries two style attributes after its slot is filled (its place, then its state): merge them
        .replace(/ style="([^"]*)"( data-[a-z-]+="[^"]*")* style="([^"]*)"/g, (_m, s1: string, _d: string, s2: string) => ` style="${s1}${s1.endsWith(';') ? '' : ';'}${s2}"`);
    }
    out.atmos = cullMarks(out.atmos, c);
    // a card that covers the whole picture: the street under it is not drawn into a still
    if (covered(t) && !(t >= T.health && t < T.body + 0.4)) out.back = out.atmos = out.world = out.air = '';
    return out;
  }

  /** What the HUD shows at t. Pure. */
  function hud(t: number, c: Context = context(t)): HudState {
    const sig = c.sig;
    let stopped = 0;
    for (const q of PACK) if (t >= (t >= T.swap ? q.te : q.ta)) stopped++;
    const petrol = t < T.swap;
    const panel = petrol
      ? seg(t, T.panel + 0.5, T.panel + 1.1) * (1 - seg(t, T.inside + 0.3, T.inside + 0.8)) + seg(t, T.last + 0.4, T.last + 0.9) * (1 - seg(t, T.green + 0.1, T.green + 0.5))
      : seg(t, T.electric + 1.2, T.electric + 1.8) * (1 - seg(t, T.money - 0.5, T.money - 0.1));
    const onCard = t >= T.rewind + 0.2 && t < T.electric - 0.3;
    const rate = sig.rate > 1.15;
    return {
      led: onCard ? null : sig.led,
      lamp: sig.lamp,
      clock: sig.led !== null && !onCard ? r2(1 - c.ledIn) : 0,
      ff: rate ? (sig.rate > 5 ? 2 : 1) : 0,
      ffWord: rate && t < T.keeps,
      hold: t >= T.health && t < T.last,
      scooters: t >= T.arrive + 0.2 && t < T.tail + 1.0 ? stopped : null,
      panel: clamp(panel),
      zero: !petrol,
      tag: t >= T.body + 0.2 && t < T.last + 0.2 ? 'body' : (t >= T.health + 0.3 && t < T.body + 0.2) || (t >= T.rewind + 0.3 && t < T.electric - 0.1) || (t >= T.money && t < T.end + 0.5) ? 'none' : 'street',
      end: seg(t, T.end + 0.6, T.end + 1.4),
    };
  }

  return {
    VW,
    VH,
    aspect: ASPECT,
    /** Call once per page, at build time. The player never needs it. */
    defs,
    layers,
    nodes,
    context,
    renderStatic,
    hud,
    scooterCount: PACK.length,
  };
}

export type Film = ReturnType<typeof createFilm>;
