// Lane J's pictures: the kerb close-up (G4 composition) and the heights picture (G8
// composition), drawn with the site's one air rule (src/components/art/air.ts) and the shared
// figures (src/components/art/parts.ts). Used by the print pages and the share cards wherever
// lane C's own scene component is not there (see Picture.astro, which prefers lane C's
// KerbScene / HeightsScene when they exist, so the pictures stay one grammar).
//
// Pure strings, relative imports only: loadable in Node as well as in Astro frontmatter.
// Units: 1 unit = 1 cm, ground at y = 0, up is negative (as parts.ts).

import { air, type AirScenario, type Box } from '../../art/air.ts';
import { AIR_EXTRA } from '../../art/air-slots.ts';
import * as P from '../../art/parts.ts';

export interface Drawing {
  box: Box;
  /** Everything inside the <svg>, in draw order. */
  svg: string;
  /** Points (drawing units) where HTML labels go. */
  points: Record<string, { x: number; y: number }>;
}

let serial = 0;
const uid = (p: string) => `j${p}${++serial}`;

/**
 * The kerb, close (G4): a parent with a pushchair, a schoolchild covering their nose and an
 * older woman on the left; the nearest scooter's tail on the right with its rider in view;
 * rows behind. `electric`: the same kerb after the swap (no scooter fume; one car's small puff).
 */
export function kerbDrawing(o: { scenario?: AirScenario; electric?: boolean; seed?: number } = {}): Drawing {
  const scenario = o.scenario ?? 'dozen';
  const electric = o.electric ?? false;
  const box = { x: 0, y: -350, w: 450, h: 425 };
  const people = { parent: 34, child: 176, elder: 236 };
  const front = 292;
  const rows = [
    { x: 318, s: 0.84, lift: 25, row: 3 as const, cls: 'a-row-3' },
    { x: 356, s: 0.92, lift: 12, row: 2 as const, cls: 'a-row-2' },
  ];
  const nRows = scenario === 'few' ? 0 : scenario === 'dozen' ? 1 : 2;
  const shown = rows.slice(2 - nRows);
  const tailpipes = electric
    ? []
    : [...shown.map((r) => ({ x: r.x + P.TAILPIPE.x * r.s, y: -r.lift + P.TAILPIPE.y * r.s, scale: r.s, row: r.row })), { x: front + P.TAILPIPE.x, y: P.TAILPIPE.y, row: 1 as const }];
  const a = air({
    frame: box,
    seed: o.seed ?? 4,
    id: uid('k'),
    kerb: electric ? undefined : { x0: 8, x1: 286, sourceX: front + 4 },
    extra: AIR_EXTRA,
    scenario,
    tailpipes,
    cars: electric ? [{ x: 448, y: -64, dir: -1 }] : [],
  });
  const kind = electric ? 'electric' : 'gas';
  const street = [
    `<rect class="a-plane" x="0" y="-350" width="450" height="350"/>`,
    `<path class="a-line" d="M96,-350V0M300,-350V0M0,-250H450"/>`,
    `<path class="a-line" d="M120,-210H276M120,-180H276M120,-150H276M120,-120H276M120,-90H276M120,-60H276M120,-30H276" opacity="0.6"/>`,
    `<rect class="a-road" x="0" y="0" width="450" height="75"/>`,
    `<rect class="a-kerb" x="-4" y="0" width="300" height="12"/>`,
    `<path class="a-paint" d="M300,30h150v9h-150zM300,52h150v9h-150z" opacity="0.9"/>`,
  ].join('');
  const far = shown.map((r) => `<g class="${r.cls}" transform="translate(${r.x} ${-r.lift}) scale(${r.s})">${P.scooter({ kind, rider: true })}</g>`).join('');
  const fg = [
    `<g class="a-figure" transform="translate(${people.parent} 0)">${P.person('stroller')}</g>`,
    `<g class="a-figure" transform="translate(${people.child} 0)">${P.person('schoolchild-cover')}</g>`,
    `<g class="a-figure" transform="translate(${people.elder} 0)">${P.person('elder-woman')}</g>`,
    `<g class="a-figure" transform="translate(${front} 0)">${P.scooter({ kind, rider: true, face: true })}</g>`,
  ].join('');
  return {
    box,
    svg: a.defs + street + a.wash + far + a.cores + a.marks + fg,
    points: { rider: { x: front + 84, y: -184 }, tailpipe: { x: front + P.TAILPIPE.x, y: P.TAILPIPE.y } },
  };
}

/**
 * Heights (G8): a ruler in centimetres and four whole figures on one ground line — a baby in a
 * pushchair (the 55–85 cm band shaded), a schoolchild, an adult and a rider seated on a
 * scooter. The fume is drawn evenly from the
 * ground up: no bands by height (brief 5.1, K4).
 */
export function heightsDrawing(o: { seed?: number; band?: boolean } = {}): Drawing {
  const box = { x: -70, y: -215, w: 680, h: 240 };
  const X = { pushchair: 4, child: 150, adult: 214, scooter: 280 };
  const tail = { x: X.scooter + P.TAILPIPE.x, y: P.TAILPIPE.y };
  const a = air({
    frame: box,
    seed: o.seed ?? 7,
    id: uid('h'),
    kerb: { x0: -4, x1: X.scooter - 6, sourceX: tail.x, sourceY: tail.y },
    extra: AIR_EXTRA,
    scenario: 'dozen',
    tailpipes: [{ x: tail.x, y: tail.y, row: 1 }],
  });
  const band = o.band ?? true;
  const ticks: string[] = [];
  for (let cm = 0; cm <= 200; cm += 10) ticks.push(`<path class="a-rule" d="M-28,${-cm}H${cm % 50 === 0 ? -14 : -21}"/>`);
  const ground = [
    `<rect class="a-plane" x="${box.x}" y="${box.y}" width="${box.w}" height="${-box.y}"/>`,
    `<rect class="a-road" x="${box.x}" y="0" width="${box.w}" height="${box.y + box.h}"/>`,
    band ? `<rect class="a-band-fill" x="-14" y="${-P.STROLLER_BAND.high}" width="${box.x + box.w + 14}" height="${P.STROLLER_BAND.high - P.STROLLER_BAND.low}"/>` : '',
    `<path class="a-rule" d="M-28,0V-200"/>`,
    ticks.join(''),
    `<path class="a-rule a-rule--dot" d="M-14,-100H${box.x + box.w}"/>`,
  ].join('');
  const fg = [
    `<g class="a-figure" transform="translate(${X.pushchair} 0)">${P.person('pushchair')}</g>`,
    `<g class="a-figure" transform="translate(${X.child} 0)">${P.person('schoolchild')}</g>`,
    `<g class="a-figure" transform="translate(${X.adult} 0)">${P.person('adult')}</g>`,
    `<g class="a-figure" transform="translate(${X.scooter} 0)">${P.scooter({ kind: 'gas', rider: true, face: true })}</g>`,
  ].join('');
  return {
    box,
    svg: a.defs + ground + a.wash + a.cores + a.marks + fg,
    points: {
      cm0: { x: -32, y: 0 },
      cm50: { x: -32, y: -50 },
      cm100: { x: -32, y: -100 },
      cm150: { x: -32, y: -150 },
      oneMetre: { x: box.x + box.w - 8, y: -100 },
      band: { x: box.x + box.w - 8, y: -(P.STROLLER_BAND.high + P.STROLLER_BAND.low) / 2 },
      tailpipe: { x: tail.x, y: tail.y - 10 },
    },
  };
}
