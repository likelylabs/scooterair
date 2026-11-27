/**
 * card-art.ts — the pictures of the share cards (src/pages/[...lang]/print/card/[id].astro,
 * rendered by scripts/build-share-cards.mjs).
 *
 * A share card is a poster seen at thumbnail size: one picture that fills the whole 1200 × 630
 * card, one short headline, the site name small. These are compositions only: every figure,
 * scooter, signal and shopfront is the scenes' own drawing (parts.ts, kit.ts) and the air is
 * the one rule of air.ts, so a card, a page, the poster and the film share one picture grammar.
 * What is new here is the framing: each picture is laid out at the card's shape, with its
 * subject (the people at the kerb, the plume, the nearest tailpipe) inside the central square
 * (x 285 to 915 px), because LINE and some Android previews crop the card to a square or 4:3,
 * and with the top of that square left quiet for the headline.
 *
 * Units: 1 unit = 1 cm, the ground at y = 0, up negative (as parts.ts). Each composition picks
 * its own frame (how close the camera is); `px` turns a frame point into card pixels.
 *
 * Pure strings, relative imports only.
 */
import { air, airDot, airRibbon, airRing, airWisp, type AirScenario, type AirSource, type Box } from './air.ts';
import { AIR_EXTRA } from './air-slots.ts';
import { pedSignal, placed, put, shopfronts, tailOf, tyreOf, riderNoseOf, type Placed } from './kit.ts';
import { MASK_FACE, MOUTH, TAILPIPE, artId, breath, figureBoxes, maskHead, maskOn, person, type PersonKind } from './parts.ts';

/** The card, in pixels. */
export const CARD = { w: 1200, h: 630, edge: 60 } as const;
/** The central square, in pixels: what a square crop keeps. */
export const SQUARE = { x0: (CARD.w - CARD.h) / 2, x1: (CARD.w + CARD.h) / 2 } as const;

/** The pictures. One per card id; a few ids share one (see src/lib/share-cards.ts). */
export type CardArtKind = 'kerb' | 'smell' | 'child' | 'station' | 'signal' | 'rider' | 'distance' | 'mask' | 'pack' | 'electric' | 'fix' | 'film' | 'heights';
export const CARD_ART_KINDS: readonly CardArtKind[] = ['kerb', 'smell', 'child', 'station', 'signal', 'rider', 'distance', 'mask', 'pack', 'electric', 'fix', 'film', 'heights'];

/** Where the words go, in card pixels. All of it lies inside the central square and 60 px from every edge. */
export interface CardLayout {
  /** the headline's box: it is set as large as fits in it */
  head: { x: number; y: number; w: number; h: number; align: 'start' | 'center' | 'end' };
  /** the 示意圖 plate: its top-left corner (or top-right with `end`). It sits at the bottom right
   *  of the central square: X lays the link's title over a card's bottom-left corner */
  tag: { x: number; y: number; end?: boolean };
}

export interface CardArt {
  kind: CardArtKind;
  /** the frame, in drawing units; its shape is the card's */
  box: Box;
  /** everything inside the <svg>, in draw order */
  svg: string;
  layout: CardLayout;
  /** a round play button over the picture (the film card), its centre in card pixels */
  play?: { x: number; y: number; r: number };
}

const n = (v: number) => +v.toFixed(1);
/** A frame of the card's shape: `k` card pixels to one unit, the ground `ground` px from the top. */
function frame(k: number, ground: number, x0 = 0): Box {
  return { x: x0, y: -ground / k, w: CARD.w / k, h: CARD.h / k };
}
/** Card pixels → units, along x, for a frame. */
const ux = (b: Box, px: number) => b.x + (px / CARD.w) * b.w;

/** The marks are drawn a little larger than on a phone page: a card is seen at about 320 px wide. */
const cardUpp = (b: Box) => b.w / 330;

/** The street behind: pale shopfronts, the road, the kerb the people stand on. */
function street(b: Box, kerbTo: number, o: { bay?: number; shift?: number; kerbFrom?: number } = {}): string {
  const x0 = b.x - 10;
  const x1 = b.x + b.w + 10;
  return [
    shopfronts({ x0, x1, base: 0, top: b.y - 4, bay: o.bay ?? 220, shift: o.shift ?? 60 }),
    `<rect class="a-road" x="${n(x0)}" y="0" width="${n(x1 - x0)}" height="${n(b.y + b.h + 4)}"/>`,
    `<path class="a-kerb" d="M${n(o.kerbFrom ?? x0)},-1H${n(kerbTo)}V13H${n(o.kerbFrom ?? x0)}Z"/>`,
  ].join('');
}

const fig = (x: number, kind: PersonKind) => put(x, 0, person(kind), { cls: 'a-figure' });

/** The headline above the picture, across the central square. */
const TOP: CardLayout['head'] = { x: SQUARE.x0 + 10, y: CARD.edge, w: SQUARE.x1 - SQUARE.x0 - 20, h: 215, align: 'center' };
/** The plate's height in card pixels (38 px type: about 10 px in a 320 px preview). */
export const TAG_H = 58;
const TAG_LOW: CardLayout['tag'] = { x: SQUARE.x1 - 10, y: CARD.h - CARD.edge - TAG_H, end: true };

/* ------------------------------------------------------------------------ */
/* The kerb at a red light                                                    */
/* ------------------------------------------------------------------------ */

interface KerbOptions {
  k: number;
  ground: number;
  x0?: number;
  /** people, by their x in units */
  people: [PersonKind, number][];
  /** the front scooter's tail x; rows behind are placed from it */
  front: number;
  /** extra scooters, back rows first */
  rows?: Placed[];
  kind?: 'gas' | 'electric';
  scenario?: AirScenario;
  /** the people's zone of the plume, units */
  zone?: [number, number];
  signal?: { x: number; top: number; scale: number; state: 'red' | 'green'; count?: number };
  breaths?: { x: number; y: number }[];
  seed: number;
  boost?: number;
  cars?: AirSource[];
}

function kerbStreet(o: KerbOptions): { box: Box; svg: string } {
  const b = frame(o.k, o.ground, o.x0);
  const kind = o.kind ?? 'gas';
  const front: Placed = { x: o.front, lift: 0, s: 1, row: 1 };
  const rows = o.rows ?? [];
  const all = [...rows, front];
  const gas = kind === 'gas';
  const zone = o.zone ?? [Math.min(...o.people.map((p) => p[1])) - 16, o.front - 8];
  const a = air({
    frame: b,
    upp: cardUpp(b),
    seed: o.seed,
    id: artId('card'),
    scenario: o.scenario ?? 'dozen',
    extra: AIR_EXTRA,
    kerb: gas ? { x0: zone[0], x1: zone[1], sourceX: o.front + TAILPIPE.x } : undefined,
    tailpipes: gas ? all.map((q) => ({ ...tailOf(q), ...(q === front && o.boost ? { boost: o.boost } : {}) })) : [],
    tyres: gas ? [] : all.map(tyreOf),
    cars: o.cars ?? [],
    avoid: [...o.people.flatMap(([p, x]) => figureBoxes(p, x)), ...all.flatMap((q) => figureBoxes('scooter', q.x, -q.lift, q.s, 'head'))],
  });
  const sig = o.signal ? pedSignal({ x: o.signal.x, y: o.signal.top, scale: o.signal.scale, state: o.signal.state, count: o.signal.count, poleTo: 0 }) : '';
  const back = rows.map((q) => placed(q, kind)).join('');
  const fg = o.people.map(([p, x]) => fig(x, p)).join('') + placed(front, kind, { face: true, cls: 'a-figure' });
  const breaths = (o.breaths ?? []).map((p) => breath(p.x, p.y, 10)).join('');
  return { box: b, svg: a.defs + street(b, o.front - 14) + sig + a.wash + back + a.cores + a.marks + fg + breaths };
}

/** The home card: the opening picture, close. A parent with a pushchair and a schoolchild covering her nose, the nearest tail a step away, the pack behind, the red signal at 90. */
function kerbArt(red: number): CardArt {
  const k = 1.62;
  const b0 = frame(k, 548);
  const front = ux(b0, 640);
  const { box, svg } = kerbStreet({
    k,
    ground: 548,
    seed: 4,
    people: [
      ['stroller', ux(b0, 330)],
      ['schoolchild-cover', ux(b0, 560)],
    ],
    front,
    rows: [
      { x: front + 150, lift: 64, s: 0.78, row: 3 },
      { x: front + 300, lift: 64, s: 0.78, row: 3 },
      { x: front + 70, lift: 32, s: 0.89, row: 2 },
      { x: front + 230, lift: 32, s: 0.89, row: 2 },
      { x: front + 200, lift: 0, s: 1, row: 1 },
    ],
    signal: { x: ux(b0, 120), top: -300, scale: 2.2, state: 'red', count: red },
  });
  return { kind: 'kerb', box, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** smell: close on the schoolchild covering her nose, the ribbons arriving from the tailpipe. */
function smellArt(): CardArt {
  const k = 2.1;
  const b0 = frame(k, 600);
  const child = ux(b0, 480);
  const front = child + 62;
  const { box, svg } = kerbStreet({
    k,
    ground: 600,
    seed: 31,
    people: [['schoolchild-cover', child]],
    front,
    rows: [
      { x: front + 120, lift: 30, s: 0.9, row: 2 },
      { x: front + 230, lift: 0, s: 1, row: 1 },
    ],
    zone: [child - 70, front - 6],
  });
  return { kind: 'smell', box, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** my-child: the pushchair at the tailpipe, the baby's face in the plume, its breathing ring in red. */
function childArt(): CardArt {
  const k = 1.9;
  const b0 = frame(k, 575);
  const parent = ux(b0, 380);
  const front = parent + 128;
  const { box, svg } = kerbStreet({
    k,
    ground: 575,
    seed: 12,
    people: [['stroller', parent]],
    front,
    rows: [
      { x: front + 160, lift: 34, s: 0.89, row: 2 },
      { x: front + 30, lift: 34, s: 0.89, row: 2 },
    ],
    zone: [parent - 10, front - 6],
    breaths: [{ x: parent + MOUTH.stroller.x, y: MOUTH.stroller.y }],
  });
  return { kind: 'child', box, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** how-much: the whole box full, three rows deep, beside the people. */
function packArt(): CardArt {
  const k = 1.5;
  const b0 = frame(k, 552);
  const front = ux(b0, 610);
  const rows: Placed[] = [];
  for (const [lift, s, row, xs] of [
    [70, 0.76, 3, [40, 150, 260, 370]],
    [35, 0.88, 2, [-20, 100, 220, 340]],
    [0, 1, 1, [190, 380]],
  ] as const)
    for (const dx of xs) rows.push({ x: front + dx, lift, s, row });
  const { box, svg } = kerbStreet({
    k,
    ground: 552,
    seed: 18,
    scenario: 'full',
    people: [
      ['elder-woman', ux(b0, 300)],
      ['stroller', ux(b0, 380)],
      ['schoolchild-cover', ux(b0, 560)],
    ],
    front,
    rows,
  });
  return { kind: 'pack', box, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** money / electric: the same kerb with every scooter electric: no plume, grey dust at the tyres, one car's small core at the edge, the signal green. */
function electricArt(): CardArt {
  const k = 1.62;
  const b0 = frame(k, 548);
  const front = ux(b0, 640);
  const { box, svg } = kerbStreet({
    k,
    ground: 548,
    seed: 6,
    kind: 'electric',
    people: [
      ['stroller', ux(b0, 330)],
      ['schoolchild', ux(b0, 560)],
    ],
    front,
    rows: [
      { x: front + 150, lift: 64, s: 0.78, row: 3 },
      { x: front + 70, lift: 32, s: 0.89, row: 2 },
      { x: front + 230, lift: 32, s: 0.89, row: 2 },
      { x: front + 200, lift: 0, s: 1, row: 1 },
    ],
    cars: [{ x: ux(b0, 1200) - 4, y: -36, dir: -1 }],
    signal: { x: ux(b0, 120), top: -300, scale: 2.2, state: 'green' },
  });
  return { kind: 'electric', box, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/**
 * act: a row of scooters at the light, one of them badly kept (G11, 該修就修): its cloud billows
 * back over the kerb in three lobes, as on home screen 11, while the others leave a wisp.
 */
function fixArt(): CardArt {
  const k = 1.5;
  const b = frame(k, 552);
  const parent = ux(b, 250);
  const child = ux(b, 430);
  const row: Placed[] = [470, 700, 930, 1160].map((px) => ({ x: ux(b, px), lift: 0, s: 1, row: 1 as const }));
  const back: Placed[] = [600, 830, 1060].map((px) => ({ x: ux(b, px), lift: 36, s: 0.88, row: 2 as const }));
  const big = tailOf(row[1]);
  const wisp = { rings: 1, dots: 2, ribbons: 1, scale: 0.62 };
  const a = air({
    frame: b,
    upp: cardUpp(b),
    seed: 23,
    id: artId('card'),
    noStreetAir: true,
    tailpipes: [
      ...back.map((q) => ({ ...tailOf(q), ...wisp, scale: 0.55 })),
      ...row.filter((_, i) => i !== 1).map((q) => ({ ...tailOf(q), ...wisp })),
      { ...big, boost: 1.7, rings: 3, dots: 5, ribbons: 2 },
      { x: big.x - 130, y: big.y - 50, boost: 1.3, rings: 2, dots: 3, ribbons: 0 },
    ],
    avoid: [...figureBoxes('stroller', parent), ...figureBoxes('schoolchild', child), ...row.flatMap((q) => figureBoxes('scooter', q.x, 0, 1, 'head'))],
  });
  const svg =
    a.defs +
    street(b, row[0].x - 14) +
    back.map((q) => placed(q, 'gas')).join('') +
    a.cores +
    fig(parent, 'stroller') +
    fig(child, 'schoolchild') +
    row.map((q, i) => placed(q, 'gas', { face: i === 0, cls: 'a-figure' })).join('') +
    a.marks;
  return { kind: 'fix', box: b, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** beside-me: a parent and child standing back from the kerb edge, at the thin end of the plume. */
function distanceArt(): CardArt {
  const k = 1.62;
  const b0 = frame(k, 548);
  const front = ux(b0, 700);
  const { box, svg } = kerbStreet({
    k,
    ground: 548,
    seed: 9,
    people: [
      ['adult-with-child', ux(b0, 340)],
      ['elder-woman', ux(b0, 610)],
    ],
    front,
    rows: [
      { x: front + 80, lift: 32, s: 0.89, row: 2 },
      { x: front + 200, lift: 0, s: 1, row: 1 },
    ],
    zone: [ux(b0, 330), front - 6],
  });
  return { kind: 'distance', box, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** one-red-light: the red signal, large, counting down 90, and the people waiting under it. */
function signalArt(red: number): CardArt {
  const k = 1.5;
  const b0 = frame(k, 552);
  const front = ux(b0, 720);
  const { box, svg } = kerbStreet({
    k,
    ground: 552,
    seed: 15,
    people: [
      ['adult', ux(b0, 470)],
      ['schoolchild', ux(b0, 560)],
      ['elder-woman', ux(b0, 640)],
    ],
    front,
    rows: [
      { x: front + 100, lift: 36, s: 0.88, row: 2 },
      { x: front + 190, lift: 0, s: 1, row: 1 },
    ],
    zone: [ux(b0, 450), front - 6],
    signal: { x: ux(b0, 150), top: -312, scale: 3.4, state: 'red', count: red },
  });
  return { kind: 'signal', box, svg, layout: { head: { x: 330, y: CARD.edge, w: SQUARE.x1 - 330 - 10, h: 250, align: 'start' }, tag: TAG_LOW } };
}

/** film: the opening street at red, the pack three rows deep, and a play button. */
function filmArt(red: number): CardArt {
  const k = 1.38;
  const b0 = frame(k, 556);
  const front = ux(b0, 640);
  const rows: Placed[] = [];
  for (const [lift, s, row, xs] of [
    [74, 0.74, 3, [10, 130, 250, 370, 490]],
    [38, 0.87, 2, [60, 190, 320, 450]],
    [0, 1, 1, [200, 400]],
  ] as const)
    for (const dx of xs) rows.push({ x: front + dx, lift, s, row });
  const { box, svg } = kerbStreet({
    k,
    ground: 556,
    seed: 2,
    people: [
      ['elder-woman', ux(b0, 340)],
      ['stroller', ux(b0, 400)],
      ['schoolchild-cover', ux(b0, 590)],
    ],
    front,
    rows,
    signal: { x: ux(b0, 110), top: -330, scale: 2.3, state: 'red', count: red },
  });
  return { kind: 'film', box, svg, layout: { head: { ...TOP, h: 150 }, tag: TAG_LOW }, play: { x: CARD.w / 2, y: 292, r: 58 } };
}

/* ------------------------------------------------------------------------ */
/* Pictures of their own                                                      */
/* ------------------------------------------------------------------------ */

/** rider: the rider behind sits in the core of the scooter in front; a red breathing ring at his nose. */
function riderArt(): CardArt {
  const k = 2.05;
  const b = frame(k, 560);
  const behind: Placed = { x: ux(b, 330), lift: 0, s: 1, row: 1 };
  const ahead: Placed = { x: behind.x + 196, lift: 0, s: 1, row: 1 };
  const far: Placed = { x: ahead.x + 40, lift: 34, s: 0.89, row: 2 };
  const nose = riderNoseOf(behind);
  const a = air({
    frame: b,
    upp: cardUpp(b),
    seed: 21,
    id: artId('card'),
    scenario: 'dozen',
    extra: AIR_EXTRA,
    kerb: { x0: behind.x + 40, x1: ahead.x - 8, sourceX: ahead.x + TAILPIPE.x },
    tailpipes: [tailOf(far), tailOf(ahead), tailOf(behind)],
    avoid: [...figureBoxes('scooter', behind.x, 0, 1, 'head'), ...figureBoxes('scooter', ahead.x, 0, 1, 'head')],
  });
  const svg =
    a.defs +
    shopfronts({ x0: b.x - 10, x1: b.x + b.w + 10, base: -40, top: b.y - 4, bay: 230, shift: 20 }) +
    `<rect class="a-road" x="${n(b.x - 10)}" y="-40" width="${n(b.w + 20)}" height="${n(b.y + b.h + 44)}"/>` +
    a.wash +
    placed(far, 'gas') +
    a.cores +
    a.marks +
    placed(behind, 'gas', { face: true, cls: 'a-figure' }) +
    placed(ahead, 'gas', { cls: 'a-figure' }) +
    breath(nose.x + 4, nose.y - 3, 11);
  return { kind: 'rider', box: b, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** app: the station's inlet high on its pipe, the plume low at the people; the headline beside the inlet. */
function stationArt(inlet: { lo: number; hi: number }): CardArt {
  const k = 1.28;
  const b = frame(k, 552);
  const ST = { x: ux(b, 170), w: 70, h: 130 };
  const pipeX = ST.x + ST.w / 2;
  const inletY = -((inlet.lo + inlet.hi) / 2) * 100;
  const parent = ux(b, 470);
  const child = ux(b, 650);
  const front: Placed = { x: ux(b, 730), lift: 0, s: 1, row: 1 };
  const rows: Placed[] = [
    { x: front.x + 120, lift: 36, s: 0.88, row: 2 },
    { x: front.x + 210, lift: 0, s: 1, row: 1 },
  ];
  const a = air({
    frame: b,
    upp: cardUpp(b),
    seed: 27,
    id: artId('card'),
    scenario: 'dozen',
    extra: AIR_EXTRA,
    kerb: { x0: parent - 10, x1: front.x - 8, sourceX: front.x + TAILPIPE.x },
    tailpipes: [...rows, front].map(tailOf),
    avoid: [...figureBoxes('stroller', parent), ...figureBoxes('schoolchild-cover', child), { x: ST.x - 40, y: -ST.h - 10, w: ST.w + 80, h: ST.h + 10 }],
  });
  const station = [
    `<rect class="hs-band" x="${n(pipeX - 30)}" y="${-inlet.hi * 100}" width="60" height="${n((inlet.hi - inlet.lo) * 100)}"/>`,
    `<path class="hs-band-edge" d="M${n(pipeX - 30)},${-inlet.hi * 100}h60M${n(pipeX - 30)},${-inlet.lo * 100}h60"/>`,
    `<path class="a-metal-s" stroke-width="7" d="M${n(pipeX)},${-ST.h}V${n(inletY + 10)}"/>`,
    `<path class="a-ink" d="M${n(pipeX - 22)},${n(inletY + 12)}h44l-8,-20h-28Z"/><path class="a-ink-s" stroke-width="5" d="M${n(pipeX - 26)},${n(inletY - 12)}h52"/>`,
    `<rect class="st-cabinet" x="${n(ST.x)}" y="${-ST.h}" width="${ST.w}" height="${ST.h}" rx="5"/>`,
    `<path class="a-line" stroke-width="2" d="M${n(ST.x + 10)},${-ST.h + 22}h${ST.w - 20}M${n(ST.x + 10)},${-ST.h + 38}h${ST.w - 20}M${n(ST.x + 10)},${-ST.h + 54}h${ST.w - 20}"/>`,
    `<circle class="a-led-green" cx="${n(ST.x + ST.w - 12)}" cy="${-ST.h + 72}" r="4"/>`,
  ].join('');
  const svg =
    a.defs +
    street(b, front.x - 14) +
    a.wash +
    rows.slice(0, 1).map((q) => placed(q, 'gas')).join('') +
    a.cores +
    a.marks +
    station +
    fig(parent, 'stroller') +
    fig(child, 'schoolchild-cover') +
    placed(rows[1], 'gas', { cls: 'a-figure' }) +
    placed(front, 'gas', { face: true, cls: 'a-figure' });
  return { kind: 'station', box: b, svg, layout: { head: { x: 320, y: CARD.edge, w: SQUARE.x1 - 320 - 10, h: 250, align: 'start' }, tag: TAG_LOW } };
}

/** brief: the heights. A dashed line at one metre; the tailpipe (ringed in red) and the baby both under it, the schoolchild and the adult beside them. */
function heightsArt(): CardArt {
  const k = 1.75;
  const b = frame(k, 556);
  const X = { adult: ux(b, 250), pushchair: ux(b, 300), child: ux(b, 520), scooter: ux(b, 600) };
  const tail = { x: X.scooter + TAILPIPE.x, y: TAILPIPE.y };
  const a = air({
    frame: b,
    upp: cardUpp(b),
    seed: 7,
    id: artId('card'),
    scenario: 'dozen',
    extra: AIR_EXTRA,
    kerb: { x0: X.pushchair + 20, x1: X.scooter - 6, sourceX: tail.x, sourceY: tail.y },
    tailpipes: [{ x: tail.x, y: tail.y, row: 1 }],
    avoid: [...figureBoxes('stroller', X.adult), ...figureBoxes('schoolchild', X.child), ...figureBoxes('scooter', X.scooter)],
  });
  const left = b.x - 10;
  const right = b.x + b.w + 10;
  const ground = [
    `<rect class="a-plane" x="${n(left)}" y="${n(b.y - 4)}" width="${n(right - left)}" height="${n(-b.y + 4)}"/>`,
    `<rect class="a-road" x="${n(left)}" y="0" width="${n(right - left)}" height="${n(b.y + b.h + 4)}"/>`,
    `<path class="a-rule a-rule--dot" stroke-width="3" d="M${n(left)},-100H${n(right)}"/>`,
  ].join('');
  const fg = [
    fig(X.adult, 'stroller'),
    fig(X.child, 'schoolchild'),
    placed({ x: X.scooter, lift: 0, s: 1, row: 1 }, 'gas', { face: true, cls: 'a-figure' }),
    `<circle cx="${n(tail.x)}" cy="${n(tail.y)}" r="10" fill="none" stroke="var(--signal-red, #c62828)" stroke-width="3.6"/>`,
    breath(X.adult + MOUTH.stroller.x, MOUTH.stroller.y, 10),
  ].join('');
  return { kind: 'heights', box: b, svg: a.defs + ground + a.wash + a.cores + a.marks + fg, layout: { head: { ...TOP, h: 205 }, tag: TAG_LOW } };
}

/** mask: a face in profile with a surgical mask; rings and ribbons from a tailpipe at the left run straight through it, some dots stop on it. */
function maskArt(): CardArt {
  const k = 2.2;
  const b = frame(k, 700);
  const K = 1.3; // maskFace units → frame units
  const TX = ux(b, 590);
  const F = (p: { x: number; y: number }) => ({ x: TX + p.x * K, y: p.y * K });
  const noseIn = F(MASK_FACE.inside);
  const front = TX + MASK_FACE.front.x * K - 3;
  const PIPE = { x: ux(b, 230), y: -76 };
  const upp = cardUpp(b);
  const a = air({ frame: b, upp, id: artId('card'), noStreetAir: true, tailpipes: [{ ...PIPE, dir: 1, scale: 0.7, rings: 0, dots: 0, ribbons: 0 }] });
  const lane = (u: number, y1: number, x1: number) => {
    const e = u * u * (3 - 2 * u);
    return { x: PIPE.x + 14 + u * (x1 - PIPE.x - 14), y: PIPE.y - 6 + (y1 - PIPE.y + 6) * e };
  };
  let marks = '';
  for (const [l, y1] of [-114, -102].entries())
    for (let i = 0; i < 6; i++) {
      const p = lane((i + 0.8 + l * 0.35) / 6.4, y1, noseIn.x + 2);
      marks += airRing(p.x, p.y, upp, { size: 0.8 });
    }
  for (const [i, y] of [-122, -114].entries()) marks += airRibbon(airWisp(PIPE.x + 6, PIPE.y - 4 - i * 3, noseIn.x - 3, y, upp), upp, { weight: 1.1 });
  for (const [x, y] of [[0.2, -84], [0.34, -98], [0.46, -80], [0.58, -106], [0.7, -88], [0.8, -100], [0.3, -72], [0.64, -74]] as const) marks += airDot(PIPE.x + x * (front - PIPE.x), y, upp);
  for (const y of [-104, -94, -114]) marks += airDot(front - 3, y, upp);
  const svg = [
    `<rect class="a-plane" x="${n(b.x - 10)}" y="${n(b.y - 4)}" width="${n(b.w + 20)}" height="${n(b.h + 8)}"/>`,
    a.defs,
    a.cores,
    `<path class="a-metal-s" stroke-width="15" d="M${n(b.x - 10)},${PIPE.y + 9} L${n(PIPE.x - 5)},${PIPE.y + 1}"/><circle class="a-exh" cx="${n(PIPE.x - 1)}" cy="${PIPE.y}" r="5.5"/>`,
    `<g class="a-figure" transform="translate(${n(TX)} 0) scale(${K})">${maskHead()}${maskOn('surgical')}</g>`,
    marks,
  ].join('');
  return { kind: 'mask', box: b, svg, layout: { head: TOP, tag: TAG_LOW } };
}

/** Every picture, by kind. `inlet`: the station's inlet range in metres (the registry's taipei-roadside-co-2024); `red`: the number on the signal (est.signal.redLength_s). */
export function cardArt(kind: CardArtKind, o: { inlet: { lo: number; hi: number }; red: number }): CardArt {
  switch (kind) {
    case 'kerb':
      return kerbArt(o.red);
    case 'smell':
      return smellArt();
    case 'child':
      return childArt();
    case 'station':
      return stationArt(o.inlet);
    case 'signal':
      return signalArt(o.red);
    case 'rider':
      return riderArt();
    case 'distance':
      return distanceArt();
    case 'mask':
      return maskArt();
    case 'pack':
      return packArt();
    case 'electric':
      return electricArt();
    case 'fix':
      return fixArt();
    case 'film':
      return filmArt(o.red);
    case 'heights':
      return heightsArt();
  }
}

/** Card pixels of a frame point (for checks and labels). */
export function px(b: Box, p: { x: number; y: number }): { x: number; y: number } {
  return { x: ((p.x - b.x) / b.w) * CARD.w, y: ((p.y - b.y) / b.h) * CARD.h };
}
