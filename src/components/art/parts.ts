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
 * The written rules for the style are in the styleguide ("Art direction").
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

/** Where the tailpipe opens, in scooter-local coordinates (gas only). */
export const TAILPIPE = { x: 4, y: -33 };
/** Overall length of a scooter, for spacing a queue. */
export const SCOOTER_LENGTH = 184;

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
    p.push('<path class="a-metal-s" stroke-width="13" d="M12,-34 L60,-23"/>');
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
  | 'schoolchild' | 'schoolchild-step' | 'elder-woman' | 'adult-front' | 'stroller-front';

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
};

/** Height of the stroller breathing band used across the site, in cm (international review). */
export const STROLLER_BAND = { low: 55, high: 85 };

function adult(opts: { armTo?: [number, number]; lean?: number; stride?: number; headY?: number } = {}): string {
  const { armTo, stride = 15, headY = -152 } = opts;
  const s = stride;
  return [
    // legs (back, then front)
    `<path class="a-ink-s" stroke-width="11" d="M-1,-84 L${-s},-6"/>`,
    `<path class="a-ink-s" stroke-width="11" d="M1,-84 L${s + 1},-6"/>`,
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

/**
 * A pedestrian, drawn like a pedestrian-signal figure: round head, capsule
 * torso, round-capped limbs, no face. Origin at the feet, facing right.
 *
 *  adult             plain walking adult, 164 cm
 *  adult-with-child  adult holding the hand of a schoolchild (yellow cap) walking ahead
 *  child             the schoolchild alone, 108 cm
 *  stroller          a parent pushing a stroller; the baby's head is at about 70 cm
 *  elder             an older person with a cane, slightly stooped, 150 cm
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
      return (
        adult({ armTo: [30, -98], stride: 13 }) +
        [
          // push bar and frame
          '<path class="a-ink-s" stroke-width="4" d="M28,-100 L46,-52 L90,-52"/>',
          '<path class="a-ink-s" stroke-width="3.5" d="M50,-44 L46,-12 M82,-44 L88,-12"/>',
          // tub
          '<path class="a-ink" d="M42,-66 L96,-66 C96,-50 88,-40 76,-40 L56,-40 C48,-40 43,-50 42,-66 Z"/>',
          // canopy
          '<path class="a-far" d="M44,-68 C44,-88 60,-98 78,-96 L70,-68 Z"/>',
          // baby
          '<circle class="a-ink" cx="68" cy="-73" r="7.5"/>',
          // wheels
          '<circle class="a-deep" cx="46" cy="-9" r="9"/><circle class="a-bg" cx="46" cy="-9" r="3.5"/>',
          '<circle class="a-deep" cx="88" cy="-9" r="9"/><circle class="a-bg" cx="88" cy="-9" r="3.5"/>',
        ].join('')
      );
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

function child(opts: { armTo?: [number, number]; step?: boolean } = {}): string {
  const { armTo, step = false } = opts;
  return [
    '<path class="a-ink-s" stroke-width="8.5" d="M-1,-52 L-9,-5"/>',
    step ? '<path class="a-ink-s" stroke-width="8.5" d="M1,-52 L15,-24 L19,2"/>' : '<path class="a-ink-s" stroke-width="8.5" d="M1,-52 L10,-5"/>',
    // school bag
    '<rect class="a-far" x="-17" y="-84" width="13" height="27" rx="4"/>',
    '<path class="a-ink-s" stroke-width="19" d="M0,-78 L0,-58"/>',
    `<path class="a-ink-s" stroke-width="7" d="M0,-80 L${armTo ? armTo[0] : 8},${armTo ? armTo[1] : -56}"/>`,
    '<circle class="a-ink" cx="1" cy="-98" r="10.5"/>',
    // the yellow school cap
    '<path class="a-yellow" d="M-10.5,-100 A11.5 11.5 0 0 1 12.5,-100 L18,-99 L18,-96.5 L-10.5,-96.5 Z"/>',
  ].join('');
}

/** A breathing-point marker: a ring around the mouth. Scene-local coordinates. */
export function breath(x: number, y: number, r = 9): string {
  return `<circle class="a-breath" cx="${n(x)}" cy="${n(y)}" r="${r}"/>`;
}

/* ------------------------------------------------------------------------ */
/* Air — the pollution vocabulary                                             */
/* ------------------------------------------------------------------------ */

/**
 * What you can smell: fumes. Wavy horizontal ribbons, thick and many near the
 * ground, thinning with height (exponential, scale height ~45 cm).
 */
export function fumes(o: { width: number; count: number; seed?: number; x0?: number; scale?: number; top?: number; len?: [number, number] }): string {
  const { width, count, seed = 1, x0 = 0, scale = 45, top = 190, len: lenRange = [110, 410] } = o;
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const h = Math.min(top, -Math.log(1 - r() * 0.985) * scale + 3);
    const low = 1 - h / top; // 1 at the ground, 0 at the top
    const len = lenRange[0] + r() * (lenRange[1] - lenRange[0]);
    const x = x0 + r() * width - len / 2;
    const wl = Math.min(70 + r() * 80, len / 1.5);
    const amp = 2.5 + r() * 5;
    const half = Math.max(2, Math.round(len / (wl / 2)));
    let d = `M${n(x)},${n(-h)} q${n(wl / 4)},${n(-amp)} ${n(wl / 2)},0`;
    for (let k = 1; k < half; k++) d += ` t${n(wl / 2)},0`;
    const sw = 1.6 + low * low * 5.5 + r() * 1.6;
    const op = 0.14 + low * 0.26 + r() * 0.08;
    out.push(`<path d="${d}" stroke-width="${n(sw)}" opacity="${op.toFixed(2)}"/>`);
  }
  return out.join('');
}

/** The gas you can't smell (CO): hollow rings, spread higher than the fumes. */
export function coRings(o: { width: number; count: number; seed?: number; x0?: number; scale?: number; top?: number }): string {
  const { width, count, seed = 2, x0 = 0, scale = 75, top = 230 } = o;
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const h = Math.min(top, -Math.log(1 - r() * 0.97) * scale + 6);
    const x = x0 + r() * width;
    const rad = 2.6 + r() * 2.6;
    out.push(`<circle cx="${n(x)}" cy="${n(-h)}" r="${n(rad)}" opacity="${(0.45 + r() * 0.5).toFixed(2)}"/>`);
  }
  return out.join('');
}

/** The particles you can't see (ultrafines): pin-point stipple, reaching highest. */
export function ufpDots(o: { width: number; count: number; seed?: number; x0?: number; scale?: number; top?: number }): string {
  const { width, count, seed = 3, x0 = 0, scale = 110, top = 280 } = o;
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const h = Math.min(top, -Math.log(1 - r() * 0.96) * scale + 2);
    const x = x0 + r() * width;
    const rad = 0.8 + r() * 0.7;
    d += `M${n(x - rad)},${n(-h)}a${n(rad)},${n(rad)} 0 1,0 ${n(rad * 2)},0a${n(rad)},${n(rad)} 0 1,0 ${n(-rad * 2)},0`;
  }
  return `<path d="${d}"/>`;
}

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

/* ------------------------------------------------------------------------ */
/* Air, second vocabulary (binding since the scientist's review)              */
/*                                                                            */
/* Nobody has measured what people breathe at a crossing, so nothing drawn    */
/* here may suggest an amount or a change over time. Every function below is  */
/* deterministic and takes no density, strength or time argument.             */
/* ------------------------------------------------------------------------ */

/**
 * "Exhaust present, amount not measured": a band of uniform diagonal hatching
 * from the ground up to `top` cm, closed by a dashed upper edge. One density,
 * everywhere, always. The hatch is the map-maker's "no data" texture: it marks
 * where, and refuses to say how much.
 */
export function hatchBand(o: { x0?: number; width: number; top?: number; pitch?: number }): string {
  const { x0 = 0, width, top = 100, pitch = 15 } = o;
  let d = '';
  for (let x = x0 - top; x < x0 + width; x += pitch) d += `M${n(x)},0l${top},${-top}`;
  return `<path class="a-hatch" d="${d}"/><path class="a-hatch-edge" d="M${x0},${-top}H${x0 + width}"/>`;
}

/**
 * The warm ribbon at a tailpipe mouth: three short strokes of fixed length
 * (about 50 cm), drifting rearward. Place at the pipe opening. `small` is the
 * distant car's version. There is no longer any other place warm ribbons go.
 */
export function ribbon(small = false): string {
  const g = [
    '<path d="M-2,0 q-8,-5 -16,0 t-16,0 t-16,0" stroke-width="4.2" opacity="0.95"/>',
    '<path d="M-3,-5 q-7,-5 -14,-2 t-14,-3 t-13,-4" stroke-width="3" opacity="0.75"/>',
    '<path d="M-3,4 q-8,3 -15,1 t-15,2" stroke-width="3" opacity="0.65"/>',
  ].join('');
  return `<g class="a-ribbon"${small ? ' transform="scale(0.6)"' : ''}>${g}</g>`;
}

/** Hollow rings (carbon monoxide): a fixed count, spread evenly inside the hatched band. */
export function ringsInBand(o: { x0?: number; width: number; count: number; top?: number; seed?: number }): string {
  const { x0 = 0, width, count, top = 100, seed = 21 } = o;
  const r = rng(seed);
  const cell = width / count;
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = x0 + cell * (i + 0.2 + r() * 0.6);
    const y = -(12 + r() * (top - 24));
    out += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(3.6 + r() * 1.4)}"/>`;
  }
  return out;
}

/**
 * Stipple (ultrafine particles in traffic): one uniform density over the whole
 * street, top to bottom. It does not rise from the scooters and it does not
 * change between the gasoline and the electric frame.
 */
export function stipple(o: { x0?: number; width: number; top: number; bottom?: number; seed?: number; cell?: number }): string {
  const { x0 = 0, width, top, bottom = 0, seed = 33, cell = 52 } = o;
  const r = rng(seed);
  let d = '';
  // jittered grid: even coverage without visible rows
  for (let gy = top; gy < bottom; gy += cell)
    for (let gx = x0; gx < x0 + width; gx += cell) {
      const x = gx + r() * cell;
      const y = gy + r() * cell;
      const rad = 1.1 + r() * 0.5;
      d += `M${n(x - rad)},${n(y)}a${n(rad)},${n(rad)} 0 1,0 ${n(rad * 2)},0a${n(rad)},${n(rad)} 0 1,0 ${n(-rad * 2)},0`;
    }
  return `<path d="${d}"/>`;
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
