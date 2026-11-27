/**
 * Illustration parts — the drawing kit behind every scene on the site.
 *
 * Everything here is a pure function returning an SVG fragment (a string of
 * elements, no <svg> wrapper), so a part can be placed in any scene with
 * `<g transform="translate(x 0)" set:html={scooter({ kind: 'gas' })} />`.
 *
 * Coordinates: 1 unit = 1 cm. y = 0 is the ground line and up is negative,
 * so an adult's mouth is at about y = -150. Parts face right; wrap them in
 * `scale(-1 1)` to flip.
 *
 * Colour comes only from the `.a-*` classes in src/styles/art.css (which map
 * to the --art-* tokens), never from literal values.
 *
 * The air itself (rings, dots, ribbons, the wash where people stand and the
 * dark cores at the tailpipes) is NOT drawn here. It is drawn by ./air.ts, by
 * one rule, for every scene (redesign brief, section 5.1). This file draws
 * the things that stand in the air: scooters, people, the signal, the can,
 * the masked face and the body figure.
 *
 * Words are never drawn in SVG. A scene lays HTML over its picture
 * (SceneFrame.astro and SceneLabel.astro), 14 px or larger.
 */

/** Deterministic PRNG so builds are reproducible. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => +v.toFixed(1);

/* ------------------------------------------------------------------------ */
/* Scooters                                                                  */
/* ------------------------------------------------------------------------ */

export type ScooterKind = 'gas' | 'electric';

/**
 * Where the tailpipe opens, in scooter-local coordinates (gas only).
 * 50 cm off the ground: the registry's one height for scooter exhaust
 * (`iot-exhaust-height-assumption`, 0.5 m, a model setting), so the drawing,
 * the ruler of the heights scene and every 「約 50 公分」 label agree.
 * The muffler sweeps up behind the rear wheel to reach it.
 */
export const TAILPIPE = { x: 4, y: -50 };
/** Overall length of a scooter, for spacing a queue. */
export const SCOOTER_LENGTH = 184;
/** Nose and mouth of the seated rider, in scooter-local coordinates: riders breathe here too. */
export const RIDER_MOUTH = { x: 98, y: -141 };
/** Where the rear tyre meets the road (electric scooters keep three grey dots here: air.ts `tyres`). */
export const REAR_TYRE = { x: 36, y: 0 };

function wheel(cx: number, hub: 'spoke' | 'motor'): string {
  const inner =
    hub === 'motor'
      ? `<circle class="a-clean" cx="${cx}" cy="-24" r="13"/><circle class="a-bg" cx="${cx}" cy="-24" r="7"/><circle class="a-deep" cx="${cx}" cy="-24" r="3.5"/>`
      : `<circle class="a-bg" cx="${cx}" cy="-24" r="12"/><circle class="a-deep" cx="${cx}" cy="-24" r="4.5"/>`;
  return `<circle class="a-deep" cx="${cx}" cy="-24" r="24"/>${inner}`;
}

/**
 * A seated rider with a helmet. Scooter-local coordinates.
 * `face: true` raises the visor and shows a face: riders are people, and one
 * front-row rider in every pack frame is drawn this way.
 */
export function rider(opts: { face?: boolean } = {}): string {
  const head = opts.face
    ? [
        '<circle class="a-ink" cx="83" cy="-144" r="13.5"/>',
        // open-face helmet: the face, an eye, a mouth, and the visor pushed up
        '<path class="a-bg" d="M85.5,-151 L97.2,-149.5 C98,-144 97.6,-139 96,-134.5 L87,-134 C85,-139 84.6,-146 85.5,-151 Z"/>',
        '<circle class="a-ink" cx="92.6" cy="-145.2" r="1.5"/>',
        '<path class="a-ink-s" stroke-width="1.3" d="M90.5,-138.6 q2.6,1.8 5,0.2"/>',
        '<path class="a-ink-s" stroke-width="3" d="M84,-155.5 L100.5,-159"/>',
      ]
    : ['<circle class="a-ink" cx="83" cy="-144" r="13.5"/>', '<path class="a-bg" d="M88,-149 L97.5,-147 L97,-140.5 L89,-141 Z"/>'];
  return [
    // far leg / thigh and shin
    '<path class="a-ink-s" stroke-width="12" d="M66,-80 L102,-76 L112,-44"/>',
    '<path class="a-ink-s" stroke-width="8" d="M110,-41 L124,-41"/>',
    // torso, leaning a little into the bars
    '<path class="a-ink-s" stroke-width="24" d="M64,-86 L76,-122"/>',
    // arm to the handlebar
    '<path class="a-ink-s" stroke-width="9" d="M78,-124 L106,-104 L137,-110"/>',
    ...head,
  ].join('');
}

/**
 * A step-through scooter in side view, facing right. Generic design: do not
 * add brand cues. `gas` has a muffler and tailpipe; `electric` has a hub
 * motor, a light strip and nothing behind the rear wheel.
 */
export function scooter(opts: { kind?: ScooterKind; rider?: boolean; tail?: boolean; face?: boolean } = {}): string {
  const { kind = 'gas', rider: withRider = false, tail = true, face = false } = opts;
  const gas = kind === 'gas';
  const p: string[] = [];

  // wheels
  p.push(wheel(36, gas ? 'spoke' : 'motor'), wheel(154, 'spoke'));

  // front fork and fender
  p.push('<path class="a-ink-s" stroke-width="7" d="M149,-92 L154,-26"/>');
  p.push('<path class="a-ink-s" stroke-width="7" d="M129,-34 A27.5 27.5 0 0 1 180,-33"/>');

  if (gas) {
    // engine / transmission case, then the muffler: the source
    p.push('<path class="a-deep-s" stroke-width="17" d="M42,-25 L88,-30"/>');
    p.push('<path class="a-metal-s" stroke-width="13" d="M17,-43 L60,-24"/>');
    p.push(`<path class="a-metal-s" stroke-width="6" d="M18,-45 L${TAILPIPE.x + 3},${TAILPIPE.y - 1}"/>`);
    p.push(`<circle class="a-exh" cx="${TAILPIPE.x + 2}" cy="${TAILPIPE.y - 2}" r="4.5"/>`);
    // tail body sweeping over the rear wheel
    p.push(
      '<path class="a-ink" d="M98,-30 L98,-68 C98,-75 94,-78 88,-78 L22,-83 C12,-84 5,-78 5,-70 C9,-58 20,-51 34,-51 L58,-51 C70,-51 76,-40 82,-30 Z"/>',
    );
    // seat
    p.push('<path class="a-deep-s" stroke-width="9" d="M24,-86 L86,-82"/>');
    // floorboard
    p.push('<path class="a-ink-s" stroke-width="12" d="M98,-36 L140,-36"/>');
    // leg shield and headstock
    p.push(
      '<path class="a-ink" stroke-linejoin="round" d="M126,-34 L137,-102 C138,-110 146,-114 153,-110 C158,-107 160,-102 160,-96 L163,-56 L150,-34 Z"/>',
    );
    // handlebar and mirror
    p.push('<path class="a-ink-s" stroke-width="6" d="M133,-112 L148,-116"/>');
    p.push('<path class="a-ink-s" stroke-width="2.5" d="M140,-114 L134,-132"/><ellipse class="a-ink" cx="132" cy="-134" rx="5.5" ry="3.8"/>');
    // head lamp slit
    p.push('<path class="a-bg" d="M155,-104 L159.5,-100 L159.5,-92 L155,-94 Z"/>');
    if (tail) p.push('<rect class="a-red" x="3.5" y="-76" width="4" height="8" rx="1.5"/>');
  } else {
    // slimmer swing arm, no engine, no muffler
    p.push('<path class="a-deep-s" stroke-width="9" d="M36,-24 L88,-30"/>');
    // angular tail with a battery bay
    p.push('<path class="a-ink" d="M98,-30 L98,-70 C98,-76 95,-79 90,-79 L26,-82 C16,-82 8,-78 6,-72 L30,-54 L64,-52 C72,-50 78,-40 82,-30 Z"/>');
    // light strip: the only colour on the body
    p.push('<path class="a-clean-s" stroke-width="3" d="M34,-66 L92,-62"/>');
    p.push('<path class="a-deep-s" stroke-width="8" d="M28,-85 L88,-82"/>');
    p.push('<path class="a-ink-s" stroke-width="12" d="M98,-36 L140,-36"/>');
    p.push(
      '<path class="a-ink" stroke-linejoin="round" d="M128,-34 L139,-104 C140,-110 146,-113 152,-110 C156,-108 158,-104 158,-98 L161,-56 L150,-34 Z"/>',
    );
    p.push('<path class="a-ink-s" stroke-width="6" d="M134,-112 L148,-115"/>');
    p.push('<path class="a-ink-s" stroke-width="2.5" d="M140,-114 L134,-131"/><circle class="a-ink" cx="132.5" cy="-133.5" r="4.6"/>');
    p.push('<circle class="a-clean" cx="155.5" cy="-99" r="3.4"/>');
    if (tail) p.push('<rect class="a-red" x="5" y="-77" width="4" height="6" rx="1.5"/>');
  }

  if (withRider) p.push(rider({ face }));
  return p.join('');
}

/* ------------------------------------------------------------------------ */
/* People — signal figures                                                    */
/* ------------------------------------------------------------------------ */

export type PersonKind =
  | 'adult' | 'adult-with-child' | 'child' | 'stroller' | 'elder'
  // added for the red-light frames
  | 'schoolchild' | 'schoolchild-step' | 'elder-woman' | 'adult-front' | 'stroller-front'
  // added for the picture-book scenes (redesign brief, section 5.2)
  | 'pushchair' | 'adult-walk' | 'schoolchild-walk' | 'schoolchild-cover';

/**
 * Mouth / nose position of each figure in its local coordinates, so scenes
 * can mark "who is breathing what". `stroller` is the baby, not the parent.
 */
export const MOUTH: Record<PersonKind | 'parent', { x: number; y: number }> = {
  adult: { x: 9, y: -151 },
  'adult-with-child': { x: 9, y: -151 },
  child: { x: 8, y: -97 },
  parent: { x: 9, y: -149 },
  stroller: { x: 73, y: -71 },
  elder: { x: 15, y: -138 },
  schoolchild: { x: 10, y: -107 },
  'schoolchild-step': { x: 10, y: -107 },
  'elder-woman': { x: 15, y: -138 },
  'adult-front': { x: 0, y: -149 },
  'stroller-front': { x: 0, y: -66 },
  pushchair: { x: 73, y: -71 },
  'adult-walk': { x: 9, y: -151 },
  'schoolchild-walk': { x: 10, y: -107 },
  'schoolchild-cover': { x: 10, y: -107 },
};

/** Height of the stroller breathing band used across the site, in cm (international review). */
export const STROLLER_BAND = { low: 55, high: 85 };

/**
 * The pieces of the two standing figures, exported so a scene or the film can
 * swap a pose without redrawing the figure (a walk cycle alternates two leg
 * poses; the child lifts a hand to cover nose and mouth when the smell arrives).
 * All in figure-local coordinates: feet at the origin, facing right.
 */

/** An adult's legs. `stride` is how far each foot is from the centre line: 15 standing, 3 mid-step. */
export function adultLegs(stride = 15): string {
  return `<path class="a-ink-s" stroke-width="11" d="M-1,-84 L${-stride},-6"/><path class="a-ink-s" stroke-width="11" d="M1,-84 L${stride + 1},-6"/>`;
}

/** An adult from the hips up. `armTo` is where the front hand is (default: hanging at the side). */
export function adultTop(armTo?: [number, number], headY = -152): string {
  return [
    // back arm
    '<path class="a-ink-s" stroke-width="8.5" d="M-2,-128 L-11,-86"/>',
    // torso
    '<path class="a-ink-s" stroke-width="23" d="M0,-127 L0,-93"/>',
    // front arm
    `<path class="a-ink-s" stroke-width="8.5" d="M2,-128 L${armTo ? armTo[0] : 12},${armTo ? armTo[1] : -87}"/>`,
    // head
    `<circle class="a-ink" cx="1" cy="${headY}" r="11.5"/>`,
  ].join('');
}

function adult(opts: { armTo?: [number, number]; stride?: number; headY?: number } = {}): string {
  const { armTo, stride = 15, headY = -152 } = opts;
  return adultLegs(stride) + adultTop(armTo, headY);
}

/** A child's legs (108 cm child; the schoolchild is this at scale 1.11). `back` and `front` are where the feet are. */
export function childLegs(back = -9, front = 10): string {
  return `<path class="a-ink-s" stroke-width="8.5" d="M-1,-52 L${back},-5"/><path class="a-ink-s" stroke-width="8.5" d="M1,-52 L${front},-5"/>`;
}

/** A child's school bag, body, head and yellow cap: everything but the legs and the front arm. */
export function childTop(): string {
  return [
    // school bag
    '<rect class="a-far" x="-17" y="-84" width="13" height="27" rx="4"/>',
    '<path class="a-ink-s" stroke-width="19" d="M0,-78 L0,-58"/>',
    '<circle class="a-ink" cx="1" cy="-98" r="10.5"/>',
    // the yellow school cap
    '<path class="a-yellow" d="M-10.5,-100 A11.5 11.5 0 0 1 12.5,-100 L18,-99 L18,-96.5 L-10.5,-96.5 Z"/>',
  ].join('');
}

/**
 * A child's front arm.
 *   'down'   hanging at the side
 *   'cover'  elbow bent, hand over nose and mouth: "that smell"
 *   [x, y]   reaching to a point (a parent's hand)
 */
export function childArm(pose: 'down' | 'cover' | [number, number] = 'down'): string {
  if (pose === 'cover') return '<path class="a-ink-s" stroke-width="7" d="M0,-80 L13,-76 L11,-93"/>';
  const to = pose === 'down' ? [8, -56] : pose;
  return `<path class="a-ink-s" stroke-width="7" d="M0,-80 L${to[0]},${to[1]}"/>`;
}

/**
 * A pushchair in side view with a baby in it, facing right. Coordinates match
 * person('stroller'), where a parent standing at x = 0 holds the push bar:
 * the baby's head is at about 70 cm, inside the 55 to 85 cm band.
 */
export function pushchair(): string {
  return [
    // push bar and frame
    '<path class="a-ink-s" stroke-width="4" d="M28,-100 L46,-52 L90,-52"/>',
    '<path class="a-ink-s" stroke-width="3.5" d="M50,-44 L46,-12 M82,-44 L88,-12"/>',
    // canopy, behind the baby
    '<path class="a-far" d="M44,-68 C44,-88 60,-98 78,-96 L70,-68 Z"/>',
    // the baby: head, and a small arm on the rim of the tub
    '<circle class="a-ink" cx="68" cy="-73" r="7.5"/>',
    '<path class="a-ink-s" stroke-width="4.5" d="M72,-64 L81,-67"/>',
    // tub
    '<path class="a-ink" d="M42,-66 L96,-66 C96,-50 88,-40 76,-40 L56,-40 C48,-40 43,-50 42,-66 Z"/>',
    // wheels
    '<circle class="a-deep" cx="46" cy="-9" r="9"/><circle class="a-bg" cx="46" cy="-9" r="3.5"/>',
    '<circle class="a-deep" cx="88" cy="-9" r="9"/><circle class="a-bg" cx="88" cy="-9" r="3.5"/>',
  ].join('');
}

/**
 * A pedestrian, drawn like a pedestrian-signal figure: round head, capsule
 * torso, round-capped limbs, no face. Origin at the feet, facing right.
 *
 *  adult             plain walking adult, 164 cm
 *  adult-with-child  adult holding the hand of a schoolchild (yellow cap) walking ahead
 *  child             the schoolchild alone, 108 cm
 *  stroller          a parent pushing a pushchair; the baby's head is at about 70 cm
 *  pushchair         the pushchair and the baby alone (same coordinates as in `stroller`)
 *  elder             an older person with a cane, slightly stooped, 150 cm
 *  elder-woman       the same, with her hair in a bun
 *  schoolchild       a primary-school child in the yellow cap, 120 cm
 *  schoolchild-cover the same child with a hand over nose and mouth
 *  adult-walk, schoolchild-walk   mid-step (feet together), for a two-pose walk
 */
export function person(kind: PersonKind): string {
  switch (kind) {
    case 'adult':
      return adult();
    case 'child':
      return child();
    case 'adult-with-child':
      return adult({ armTo: [21, -84] }) + `<g transform="translate(36 0)">${child({ armTo: [-15, -84] })}</g>`;
    case 'stroller':
      return adult({ armTo: [30, -98], stride: 13 }) + pushchair();
    case 'pushchair':
      return pushchair();
    case 'adult-walk':
      return adult({ stride: 3 });
    case 'schoolchild-walk':
      return `<g transform="scale(1.11)">${childLegs(-2, 3)}${childTop()}${childArm()}</g>`;
    case 'schoolchild-cover':
      return `<g transform="scale(1.11)">${child({ cover: true })}</g>`;
    case 'schoolchild':
      // a primary-school child, about 120 cm: taller than the stroller band
      return `<g transform="scale(1.11)">${child()}</g>`;
    case 'schoolchild-step':
      // the same child, one foot off the kerb
      return `<g transform="scale(1.11)">${child({ step: true })}</g>`;
    case 'elder-woman':
      return '<circle class="a-ink" cx="2.5" cy="-146" r="5.6"/>' + person('elder');
    case 'adult-front':
      // walking toward the viewer: someone crossing the street the camera looks along
      return [
        '<path class="a-ink-s" stroke-width="11" d="M-6.5,-84 L-8,-6"/>',
        '<path class="a-ink-s" stroke-width="11" d="M6.5,-84 L8,-6"/>',
        '<path class="a-ink-s" stroke-width="8.5" d="M-14,-127 L-18,-88"/>',
        '<path class="a-ink-s" stroke-width="8.5" d="M14,-127 L18,-88"/>',
        '<path class="a-ink-s" stroke-width="27" d="M0,-126 L0,-94"/>',
        '<circle class="a-ink" cx="0" cy="-152" r="11.5"/>',
      ].join('');
    case 'stroller-front':
      // a parent pushing a stroller toward the viewer; the baby's face is at about 65 cm
      return [
        person('adult-front'),
        // push bar, frame legs and wheels
        '<path class="a-ink-s a-halo" stroke-width="4" d="M-19,-90 L-24,-62 M19,-90 L24,-62"/>',
        '<path class="a-ink-s" stroke-width="3.5" d="M-22,-42 L-27,-12 M22,-42 L27,-12"/>',
        '<rect class="a-deep" x="-31" y="-17" width="8" height="17" rx="3.5"/><rect class="a-deep" x="23" y="-17" width="8" height="17" rx="3.5"/>',
        // canopy behind, tub in front, the baby between them
        '<path class="a-far a-halo" d="M-27,-62 C-27,-96 27,-96 27,-62 Z"/>',
        '<circle class="a-ink" cx="0" cy="-70" r="7.5"/>',
        '<path class="a-ink a-halo" d="M-27,-63 L27,-63 L23,-44 C22,-39 18,-37 13,-37 L-13,-37 C-18,-37 -22,-39 -23,-44 Z"/>',
      ].join('');
    case 'elder':
      return [
        '<path class="a-ink-s" stroke-width="3.5" d="M22,-82 L27,-2"/>',
        '<path class="a-ink-s" stroke-width="10.5" d="M0,-80 L-9,-6"/>',
        '<path class="a-ink-s" stroke-width="10.5" d="M2,-80 L10,-6"/>',
        '<path class="a-ink-s" stroke-width="25" d="M1,-88 L8,-118"/>',
        '<path class="a-ink-s" stroke-width="8.5" d="M10,-120 L12,-98 L22,-83"/>',
        '<circle class="a-ink" cx="13" cy="-139" r="11.5"/>',
      ].join('');
  }
}

function child(opts: { armTo?: [number, number]; step?: boolean; cover?: boolean } = {}): string {
  const { armTo, step = false, cover = false } = opts;
  const legs = step
    ? '<path class="a-ink-s" stroke-width="8.5" d="M-1,-52 L-9,-5"/><path class="a-ink-s" stroke-width="8.5" d="M1,-52 L15,-24 L19,2"/>'
    : childLegs();
  // order matters: bag, body, arm, then head and cap on top (as before)
  const [bag, body, head, cap] = [
    '<rect class="a-far" x="-17" y="-84" width="13" height="27" rx="4"/>',
    '<path class="a-ink-s" stroke-width="19" d="M0,-78 L0,-58"/>',
    '<circle class="a-ink" cx="1" cy="-98" r="10.5"/>',
    '<path class="a-yellow" d="M-10.5,-100 A11.5 11.5 0 0 1 12.5,-100 L18,-99 L18,-96.5 L-10.5,-96.5 Z"/>',
  ];
  return legs + bag + body + childArm(cover ? 'cover' : (armTo ?? 'down')) + head + cap;
}

/**
 * Boxes around a figure, in figure-local coordinates, for air.ts `avoid`: no
 * ring or dot is drawn inside them, so marks neither hide behind a body nor
 * sit on a face. `head` alone keeps faces and the yellow cap clean.
 */
type LocalBox = { x: number; y: number; w: number; h: number };
const FIGURE_BOXES: Record<string, { head: LocalBox[]; body: LocalBox[] }> = {
  adult: { head: [{ x: -13, y: -166, w: 28, h: 28 }], body: [{ x: -14, y: -140, w: 30, h: 58 }, { x: -18, y: -84, w: 38, h: 82 }] },
  child: { head: [{ x: -12, y: -112, w: 32, h: 26 }], body: [{ x: -19, y: -86, w: 32, h: 84 }] },
  elder: { head: [{ x: -4, y: -154, w: 30, h: 30 }], body: [{ x: -13, y: -124, w: 43, h: 122 }] },
  pushchair: { head: [{ x: 58, y: -84, w: 22, h: 20 }], body: [{ x: 40, y: -98, w: 58, h: 60 }, { x: 36, y: -20, w: 62, h: 20 }] },
  scooter: { head: [{ x: 68, y: -162, w: 34, h: 34 }], body: [{ x: 0, y: -92, w: 180, h: 92 }, { x: 54, y: -130, w: 86, h: 40 }] },
};
const FIGURE_OF: Record<PersonKind, { parts: string[]; scale?: number }> = {
  adult: { parts: ['adult'] },
  'adult-walk': { parts: ['adult'] },
  'adult-front': { parts: ['adult'] },
  'adult-with-child': { parts: ['adult'] },
  child: { parts: ['child'] },
  schoolchild: { parts: ['child'], scale: 1.11 },
  'schoolchild-step': { parts: ['child'], scale: 1.11 },
  'schoolchild-walk': { parts: ['child'], scale: 1.11 },
  'schoolchild-cover': { parts: ['child'], scale: 1.11 },
  stroller: { parts: ['adult', 'pushchair'] },
  'stroller-front': { parts: ['adult'] },
  pushchair: { parts: ['pushchair'] },
  elder: { parts: ['elder'] },
  'elder-woman': { parts: ['elder'] },
};

/**
 * Keep-clear boxes for a figure placed at (x, y) in a scene, for air.ts `avoid`.
 * `kind` is a PersonKind or 'scooter' (a scooter with its rider). `what`:
 * 'head' (faces only), 'all' (the whole silhouette; the default).
 */
export function figureBoxes(kind: PersonKind | 'scooter', x: number, y = 0, scale = 1, what: 'head' | 'all' = 'all'): LocalBox[] {
  const def = kind === 'scooter' ? { parts: ['scooter'], scale: 1 } : FIGURE_OF[kind];
  const k = scale * (def.scale ?? 1);
  const out: LocalBox[] = [];
  for (const part of def.parts) {
    const b = FIGURE_BOXES[part];
    for (const box of what === 'head' ? b.head : [...b.head, ...b.body]) out.push({ x: x + box.x * k, y: y + box.y * k, w: box.w * k, h: box.h * k });
  }
  return out;
}

/** A breathing-point marker: a ring around the mouth. Scene-local coordinates. */
export function breath(x: number, y: number, r = 9): string {
  return `<circle class="a-breath" cx="${n(x)}" cy="${n(y)}" r="${r}"/>`;
}

/* ------------------------------------------------------------------------ */
/* Old air vocabulary — retired                                               */
/*                                                                            */
/* puffs() is the last of the old air vocabulary. New scenes draw air with   */
/* ./air.ts and nothing else.                                                 */
/* ------------------------------------------------------------------------ */




/** Puffs leaving a tailpipe. Place at the pipe opening; they drift rearward (−x). */
export function puffs(seed = 1): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < 4; i++) {
    const delay = (i * 0.9 + r() * 0.4).toFixed(2);
    out.push(`<circle class="a-puff" cx="-6" cy="-2" r="${n(7 + r() * 3)}" style="animation-delay:-${delay}s"/>`);
  }
  // a resting curl so the still image (and reduced motion) still reads as exhaust
  out.push('<path class="a-curl" d="M-4,-1 c-14,-2 -14,-16 -28,-13 s-12,-14 -30,-9"/>');
  return out.join('');
}

/* ------------------------------------------------------------------------ */
/* LED dot matrix — signals and countdowns                                    */
/* ------------------------------------------------------------------------ */

const DIGITS: Record<string, string[]> = {
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
};

/** The two pedestrian-signal figures, 12 × 16 LEDs. */
export const LED_FIGURES = {
  stand: [
    '....####....',
    '...######...',
    '...######...',
    '....####....',
    '...######...',
    '..########..',
    '.##.####.##.',
    '.##.####.##.',
    '.##.####.##.',
    '.##.####.##.',
    '....####....',
    '....####....',
    '....#..#....',
    '...##..##...',
    '...##..##...',
    '..###..###..',
  ],
  walk: [
    '.....####...',
    '....######..',
    '....######..',
    '.....####...',
    '....####....',
    '...######...',
    '..###.####..',
    '.##..###.##.',
    '.#...###..#.',
    '....####....',
    '....#####...',
    '...##..##...',
    '..##....##..',
    '.##.....##..',
    '##.......##.',
    '#.........#.',
  ],
} as const;

/** One path of LED dots for a bitmap. `pitch` = dot spacing, `r` = dot radius. */
export function ledPath(rows: readonly string[], pitch = 2, r = 0.78, ox = 0, oy = 0): string {
  let d = '';
  rows.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c !== '#') return;
      const cx = ox + x * pitch + pitch / 2;
      const cy = oy + y * pitch + pitch / 2;
      d += `M${n(cx - r)},${n(cy)}a${r},${r} 0 1,0 ${n(r * 2)},0a${r},${r} 0 1,0 ${n(-r * 2)},0`;
    });
  });
  return d;
}

/** A single LED digit as a path `d`. 5 × 7 dots. */
export function ledDigit(ch: string, pitch = 2, r = 0.78, ox = 0, oy = 0): string {
  return ledPath(DIGITS[ch] ?? DIGITS['0'], pitch, r, ox, oy);
}

/**
 * The same LED dots as ledPath(), at about a twentieth of the markup: each horizontal run of
 * lit dots is one short line, and the element's dash pattern (a 0.01 dash every `pitch`, round
 * caps; a true zero-length dash is not drawn by every engine) turns
 * the line into a row of circles. Draw it with ledDots(), which sets the matching attributes.
 * ledPath() is kept for scripts that read dot centres back out of the path.
 */
export function ledRuns(rows: readonly string[], pitch = 2, ox = 0, oy = 0): string {
  let d = '';
  rows.forEach((row, y) => {
    const cy = n(oy + y * pitch + pitch / 2);
    for (const m of row.matchAll(/#+/g)) {
      // a hair past the last dot, so the dash that starts on it is inside the line
      d += `M${n(ox + (m.index ?? 0) * pitch + pitch / 2)},${cy}h${+((m[0].length - 1) * pitch + 0.02).toFixed(2)}`;
    }
  });
  return d;
}

/** ledRuns() for a digit. */
export const ledDigitRuns = (ch: string, pitch = 2, ox = 0, oy = 0): string => ledRuns(DIGITS[ch] ?? DIGITS['0'], pitch, ox, oy);

/**
 * A complete <path> of LED dots from ledRuns() data. `cls` is a colour class that sets
 * `stroke` (art.css: `a-led-red`, `a-led-green` beside `a-dots`), or any class of your own.
 */
export function ledDots(d: string, o: { pitch?: number; r?: number; cls?: string; attrs?: string } = {}): string {
  const { pitch = 2, r = 0.78, cls = 'a-led-red', attrs = '' } = o;
  return `<path class="a-dots ${cls}" stroke-width="${n(r * 2)}" stroke-dasharray="0.01 ${+(pitch - 0.01).toFixed(3)}" d="${d}"${attrs ? ' ' + attrs : ''}/>`;
}

/* ------------------------------------------------------------------------ */
/* Old air vocabulary, second set — retired                                   */
/*                                                                            */
/* These drew the street before the site had an estimate: one hatched band    */
/* that said where the exhaust was and declined to say how much. The site now */
/* publishes a signed estimate (research/estimate/METHOD.md), so the picture  */
/* DOES show an amount: one soft plume per row of scooters, with rings where */
/* people stand by the estimate, darkest at the tailpipes. That rule lives in */
/* ./air.ts. What still holds: nothing drawn changes with time through the    */
/* red, and every function is deterministic.                                  */
/*                                                                            */
/* The old hatched band and its rings and stipple were removed in phase 3.    */
/* ------------------------------------------------------------------------ */


/**
 * The warm ribbon at a tailpipe mouth: three short strokes of fixed length
 * (about 50 cm), drifting rearward. Place at the pipe opening. `small` is the
 * distant car's version. Used by the standalone Scooter drawing and the old
 * scenes; a scene that calls air.ts gets its tailpipe ribbons from there.
 */
export function ribbon(small = false): string {
  const g = [
    '<path d="M-2,0 q-8,-5 -16,0 t-16,0 t-16,0" stroke-width="4.2" opacity="0.95"/>',
    '<path d="M-3,-5 q-7,-5 -14,-2 t-14,-3 t-13,-4" stroke-width="3" opacity="0.75"/>',
    '<path d="M-3,4 q-8,3 -15,1 t-15,2" stroke-width="3" opacity="0.65"/>',
  ].join('');
  return `<g class="a-ribbon"${small ? ' transform="scale(0.6)"' : ''}>${g}</g>`;
}



/* ------------------------------------------------------------------------ */
/* Other traffic                                                              */
/* ------------------------------------------------------------------------ */

/**
 * A generic car in side view, heading LEFT (so its tailpipe is at the right).
 * Length 420 cm. Used small and pale in the far lane: other traffic is still
 * there when the pack turns electric.
 */
export const CAR_TAILPIPE = { x: 418, y: -30 };
export function car(): string {
  return [
    '<path class="a-ink" d="M6,-34 C2,-60 10,-76 40,-82 L112,-92 C140,-128 170,-146 214,-146 L286,-146 C318,-146 342,-128 364,-96 L398,-90 C414,-86 420,-72 418,-34 Z"/>',
    '<path class="a-bg" d="M136,-96 C156,-122 176,-134 210,-134 L232,-134 L232,-96 Z M244,-134 L284,-134 C308,-134 326,-120 342,-96 L244,-96 Z"/>',
    '<circle class="a-deep" cx="92" cy="-32" r="32"/><circle class="a-bg" cx="92" cy="-32" r="15"/>',
    '<circle class="a-deep" cx="330" cy="-32" r="32"/><circle class="a-bg" cx="330" cy="-32" r="15"/>',
  ].join('');
}

/* ------------------------------------------------------------------------ */
/* Glyphs                                                                     */
/* ------------------------------------------------------------------------ */

/**
 * A nose in profile on a 48 × 48 grid, facing left. `filled` = can smell it
 * (with three ribbons arriving); hollow and dashed = cannot.
 */
export function nose(filled: boolean): string {
  // narrow bridge at the top, bulb and nostril wing at the bottom, tip to the left
  const shape = 'M27,5 C26,16 15,25 13,33 C12,38 15,41 20,41 C24,41 26,39 28,39.5 C32,40.5 37,39 37,34 C37,30 34,28 33,24 C32,17 33,10 33,5 Z';
  return filled
    ? `<path class="a-ink" d="${shape}"/><ellipse class="a-bg" cx="21.5" cy="37.6" rx="3.4" ry="1.5"/><g class="a-ribbon"><path d="M0,31 q2.5,-3 5,0 t5,0" stroke-width="2.6"/><path d="M-1,38 q2.5,-3 5,0 t5,0" stroke-width="2.6" opacity="0.8"/><path d="M2,24 q2.5,-3 5,0 t4,0" stroke-width="2.2" opacity="0.7"/></g>`
    : `<path class="a-ink-s" stroke-width="2.4" stroke-dasharray="4 3.2" d="${shape}"/>`;
}

/* ------------------------------------------------------------------------ */
/* The drinks can (screen 2: one scooter, one red light, about one can)       */
/* ------------------------------------------------------------------------ */

/** Size of the can drawing: 1 unit = 1 mm. Scale by 0.1 to stand it in a 1 unit = 1 cm scene. */
export const CAN = { w: 66, h: 122, volume_mL: 330 };

/**
 * A 330 mL aluminium drinks can, generic: no brand, no words, one plain band.
 * Origin at its bottom-left corner, y up is negative, 66 × 122 units (mm).
 */
export function drinksCan(): string {
  return [
    // body: the foot and the shoulder taper in, as on a real can
    '<path class="a-can" d="M4,-10 C4,-4 9,0 15,0 H51 C57,0 62,-4 62,-10 V-100 C62,-105 60,-108 57,-111 L53,-118 H13 L9,-111 C6,-108 4,-105 4,-100 Z"/>',
    // one plain band and a blank roundel where a label would be
    '<path class="a-can-band" d="M4,-84 H62 V-30 H4 Z"/>',
    '<circle class="a-can-mark" cx="33" cy="-57" r="15"/>',
    // a highlight down the side: it is metal
    '<path class="a-can-shine" d="M12,-104 V-8"/>',
    // the rim, the lid, the opening and the pull tab
    '<ellipse class="a-can-lid" cx="33" cy="-118" rx="20" ry="4.6"/>',
    '<ellipse class="a-deep" cx="26" cy="-118.4" rx="6" ry="1.9"/>',
    '<path class="a-can-tab" d="M29,-120.2 C29,-122 44,-123 45,-120.6 C45,-118.6 30,-117.6 29,-120.2 Z"/>',
  ].join('');
}

/* ------------------------------------------------------------------------ */
/* The face with a mask (G17: what a mask stops and what it does not)         */
/* ------------------------------------------------------------------------ */

export type MaskKind = 'none' | 'cloth' | 'surgical' | 'carbon' | 'n95';
/** The four masks of the switch on the mask screen (brief 12.2), in its order. Values of lane B's <Segmented name="mask">. */
export const MASK_CHOICES = ['cloth', 'surgical', 'carbon', 'n95'] as const;
export type MaskChoice = (typeof MASK_CHOICES)[number];

/**
 * Where things are on maskFace(), in its own units (the drawing is 130 wide
 * and 150 tall, about 2 mm to the unit; the face looks LEFT, toward the
 * tailpipe the marks come from).
 *   nose    where breath goes in
 *   front   the outside of the mask: marks arriving from the left meet it on this line
 *   gaps    where an ordinary mask stands off the face (beside the nose, at the
 *           cheek, under the chin): particles slip in here. A fitted N95 has none.
 *   inside  a point between mask and face, where anything that got through ends up
 */
export const MASK_FACE = {
  box: { x: 0, y: -150, w: 130, h: 150 },
  nose: { x: 21, y: -87 },
  front: { x: 12, y0: -99, y1: -60 },
  gaps: { nose: { x: 27, y: -104 }, cheek: { x: 67, y: -82 }, chin: { x: 44, y: -52 } },
  inside: { x: 24, y: -82 },
} as const;

/**
 * A head and shoulders in profile, in the signal-figure style, wearing a
 * mask. Origin at the bottom-left of the bust; see MASK_FACE for the points a
 * scene needs.
 *   cloth     a plain fabric mask with a centre seam, loose at the edges
 *   surgical  the pleated medical mask most people wear, ear loops, loose at the edges
 *   carbon    the same shape with a grey activated-carbon layer
 *   n95       a fitted cup with a nose clip and two head straps: sealed at the edges
 */
export function maskFace(kind: MaskKind = 'surgical'): string {
  return maskHead() + maskOn(kind);
}

/** The head and shoulders of maskFace() alone, with no mask. */
export function maskHead(): string {
  return [
    // shoulders, neck and head in one silhouette, then an eye and an ear
    '<path class="a-ink" d="M33,-117 C37,-135 51,-146 70,-146 C94,-146 112,-128 112,-103 C112,-85 105,-71 95,-63 L93,-43 C106,-31 122,-25 128,0 L6,0 C8,-15 24,-27 54,-39 L56,-56 C50,-54 40,-54 34,-58 C29,-62 27,-67 27,-72 L25,-78 L27,-84 L19,-88 L29,-102 C30,-107 31,-112 33,-117 Z"/>',
    '<circle class="a-bg" cx="42" cy="-106" r="2.6"/>',
    '<path class="a-bg-s" stroke-width="2.4" d="M80,-103 C74,-103 72,-96 75,-91 C76,-88 79,-86 81,-87"/>',
  ].join('');
}

/**
 * One mask alone, to lay over maskHead(): a scene that switches between masks
 * draws the head once and the four masks on top of it (G17).
 */
export function maskOn(kind: MaskKind): string {
  const p: string[] = [];
  if (kind === 'none') return '';
  if (kind === 'n95') {
    // two straps right round the head, then the cup, sealed to the face, with a metal nose clip
    p.push('<path class="a-mask-s" stroke-width="2.6" d="M58,-96 L111,-113 M58,-70 L103,-66"/>');
    p.push('<path class="a-mask a-mask--n95" d="M33,-104 C20,-101 8,-93 8,-82 C8,-70 18,-58 37,-53 C50,-56 59,-63 61,-72 L61,-94 C53,-99 43,-103 33,-104 Z"/>');
    p.push('<path class="a-mask-line" d="M12,-86 C24,-90 42,-90 60,-86 M13,-74 C26,-72 44,-72 60,-76"/>');
    p.push('<path class="a-metal-s" stroke-width="3.4" d="M22,-101 L39,-104"/>');
    return p.join('');
  }
  // ear loops
  p.push('<path class="a-mask-s" stroke-width="1.9" d="M65,-93 C71,-99 79,-101 83,-96 M65,-72 C73,-73 80,-79 82,-87"/>');
  if (kind === 'cloth') {
    p.push('<path class="a-mask a-mask--cloth" d="M36,-101 L21,-105 L11,-90 C9,-80 13,-66 22,-58 L40,-51 C52,-55 61,-62 66,-70 L67,-94 C56,-99 46,-101 36,-101 Z"/>');
    p.push('<path class="a-mask-line" d="M27,-103 C19,-90 21,-70 32,-54"/>');
    return p.join('');
  }
  // surgical and carbon: the pleated rectangle, standing off the face beside the nose and at the cheek
  p.push(
    `<path class="a-mask${kind === 'carbon' ? ' a-mask--carbon' : ''}" d="M36,-101 L21,-105 L12,-90 C10,-80 14,-67 22,-59 L40,-52 C52,-56 61,-62 66,-70 L67,-94 C56,-99 46,-101 36,-101 Z"/>`,
  );
  p.push('<path class="a-mask-line" d="M16,-88 L66,-88 M14,-79 L66,-81 M17,-69 L65,-74"/>');
  return p.join('');
}

/* ------------------------------------------------------------------------ */
/* The body figure (G6: where exhaust goes once it is breathed in)            */
/* ------------------------------------------------------------------------ */

/**
 * Where things are on bodyFigure(), in its own units (240 wide, 300 tall; the
 * centre line is x = 0 and the bottom edge of the chest is y = 0).
 *   pins    where the three numbered pins go (HTML, laid over the drawing)
 *   routes  paths a mark travels along, from the air outside to where it stops:
 *             ribbon  what you smell: stops at the nose and throat      (pin 1)
 *             dots    particles: down the windpipe, deep into a lung    (pin 2)
 *             rings   carbon monoxide: through a lung into the blood    (pin 3)
 * It is a diagram, not anatomy: say so with the tag 示意圖・不是醫學圖.
 */
/** The three numbered pins of the body figure. */
export type BodyPin = 'nose' | 'lungs' | 'blood';
export const BODY = {
  box: { x: -120, y: -300, w: 240, h: 300 },
  nose: { x: 60, y: -236 },
  throat: { x: 2, y: -200 },
  lungs: [
    { x: -47, y: -74 },
    { x: 50, y: -92 },
  ],
  heart: { x: 17, y: -48 },
  pins: { nose: { x: 34, y: -206 }, lungs: { x: -94, y: -74 }, blood: { x: 50, y: -12 } },
  routes: {
    ribbon: 'M118,-240 C96,-238 76,-237 58,-236 C34,-234 12,-228 4,-208',
    dotsLeft: 'M118,-236 C96,-236 76,-236 58,-236 C30,-234 6,-228 2,-204 L0,-132 C-12,-120 -30,-112 -44,-92 C-52,-80 -56,-64 -56,-50',
    dotsRight: 'M118,-244 C96,-240 76,-237 58,-236 C30,-234 6,-228 2,-204 L0,-132 C12,-120 30,-114 46,-104 C56,-96 62,-84 62,-70',
    rings: 'M118,-232 C96,-234 76,-236 58,-236 C30,-234 6,-228 2,-204 L0,-132 C10,-122 24,-112 34,-96 C40,-84 32,-66 22,-58 C16,-52 16,-40 17,-26 L17,-2',
  },
} as const;

/**
 * A neutral adult, head and chest, in the signal-figure style: the head in
 * profile looking right, the chest from the front. The airway, the lungs and
 * the heart are cut out. No cap, no hair, no clothes: nobody in particular.
 * Nothing in it fills up or changes colour; the scene moves marks along
 * BODY.routes and that is all.
 */
export function bodyFigure(): string {
  return [
    // head with a small nose, neck, shoulders and chest
    '<circle class="a-ink" cx="0" cy="-244" r="48"/>',
    '<path class="a-ink" d="M42,-256 C49,-253 58,-245 61,-240 C63,-237 61,-233 57,-233 L43,-229 Z"/>',
    '<path class="a-ink" d="M-114,0 V-98 C-114,-138 -88,-158 -48,-164 L-21,-169 V-204 H21 V-169 L48,-164 C88,-158 114,-138 114,-98 V0 Z"/>',
    // lungs: two cut-outs, the right-hand one notched for the heart
    '<path class="a-bg" d="M-13,-128 C-38,-138 -68,-114 -78,-78 C-85,-50 -82,-24 -66,-19 C-44,-14 -19,-24 -13,-42 Z"/>',
    '<path class="a-bg" d="M13,-128 C38,-138 68,-114 78,-78 C85,-50 82,-24 66,-19 C54,-16 44,-20 40,-30 C46,-48 38,-66 22,-72 C16,-74 13,-78 13,-84 Z"/>',
    // the airway: nostril, throat, windpipe, and a branch into each lung
    '<path class="a-bg-s" stroke-width="9" d="M50,-238 C30,-236 6,-229 2,-204 L0,-136"/>',
    '<path class="a-bg-s" stroke-width="7.5" d="M0,-138 L-22,-116 M0,-138 L22,-116"/>',
    // inside the lungs the branches go on, drawn in the figure's own ink
    '<path class="a-ink-s" stroke-width="3" d="M-24,-114 C-40,-104 -50,-90 -54,-70 M-38,-104 L-58,-98 M-48,-88 L-30,-70 M24,-114 C38,-108 50,-100 58,-86 M40,-106 L56,-112 M52,-96 L62,-70"/>',
    // the heart, and the vessel that carries blood on from it
    '<path class="a-heart-s" stroke-width="6" d="M17,-28 L17,0"/>',
    '<path class="a-heart" d="M17,-27 C-5,-42 -7,-66 8,-69 C13,-70 16,-66 17,-63 C18,-66 22,-71 29,-69 C42,-65 38,-42 17,-27 Z"/>',
  ].join('');
}

/** Rough text width in em, for laying out in-frame labels (CJK = 1, Latin ≈ 0.55). */
export function em(text: string): number {
  let w = 0;
  for (const ch of text) w += ch.codePointAt(0)! >= 0x2e80 ? 1 : ch === ' ' ? 0.28 : /[A-Z0-9]/.test(ch) ? 0.64 : /[.,:;'|il]/.test(ch) ? 0.3 : 0.55;
  return w;
}

/** Escape text for SVG. */
export const esc = (s: string | number) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Build-time unique id for gradients and clip paths inside art (a counter, so builds are reproducible). */
let artSerial = 0;
export const artId = (prefix: string): string => `${prefix}-${(++artSerial).toString(36)}`;
