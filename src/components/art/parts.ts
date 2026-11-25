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

/** A seated rider with a helmet. Scooter-local coordinates. */
export function rider(): string {
  return [
    // far leg / thigh and shin
    '<path class="a-ink-s" stroke-width="12" d="M66,-80 L102,-76 L112,-44"/>',
    '<path class="a-ink-s" stroke-width="8" d="M110,-41 L124,-41"/>',
    // torso, leaning a little into the bars
    '<path class="a-ink-s" stroke-width="24" d="M64,-86 L76,-122"/>',
    // arm to the handlebar
    '<path class="a-ink-s" stroke-width="9" d="M78,-124 L106,-104 L137,-110"/>',
    // helmet with a visor slot
    '<circle class="a-ink" cx="83" cy="-144" r="13.5"/>',
    '<path class="a-bg" d="M88,-149 L97.5,-147 L97,-140.5 L89,-141 Z"/>',
  ].join('');
}

/**
 * A step-through scooter in side view, facing right. Generic design: do not
 * add brand cues. `gas` has a muffler and tailpipe; `electric` has a hub
 * motor, a light strip and nothing behind the rear wheel.
 */
export function scooter(opts: { kind?: ScooterKind; rider?: boolean; tail?: boolean } = {}): string {
  const { kind = 'gas', rider: withRider = false, tail = true } = opts;
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

  if (withRider) p.push(rider());
  return p.join('');
}

/* ------------------------------------------------------------------------ */
/* People — signal figures                                                    */
/* ------------------------------------------------------------------------ */

export type PersonKind = 'adult' | 'adult-with-child' | 'child' | 'stroller' | 'elder';

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
};

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

function child(opts: { armTo?: [number, number] } = {}): string {
  const { armTo } = opts;
  return [
    '<path class="a-ink-s" stroke-width="8.5" d="M-1,-52 L-9,-5"/>',
    '<path class="a-ink-s" stroke-width="8.5" d="M1,-52 L10,-5"/>',
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
