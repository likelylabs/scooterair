/**
 * plan-view.ts — the junction from above (G3), shared by ApproachPlan and
 * MeasurementDiagram. Replaces plan.ts.
 *
 * Traffic runs left to right: the stop box and stop line on the left, then
 * the crossing, then at least 50 cm, then the two-stage turn box, whose
 * scooters have their tails toward the crossing. The people wait on the
 * pavement at the end of the crossing, a step or two from those tails.
 *
 * 1 unit = 1 cm; y grows downward (it is a plan). Drawn here: crossing 3 m
 * wide, gap exactly 50 cm (the minimum of 道路交通標誌標線號誌設置規則 Art. 191,
 * registry fact `marking-rules-turn-box`), turn box 2.3 m deep. Lane widths
 * and the depth of the turn box are not from the rules and carry no dimension.
 */
import type { AirSource, Box } from './air.ts';

export const PLAN3 = {
  box: { x: -80, y: 0, w: 1000, h: 944 } as Box,
  /** the opposing lanes (cropped), then the centre line */
  centre: 300,
  /** the kerb: the pavement is below it */
  kerb: 664,
  stopLine: [150, 176],
  crossing: [236, 536],
  gapCm: 50,
  turnBox: { x0: 586, x1: 816, y0: 420, y1: 652 },
} as const;

const SC = { len: 184, wid: 54 };

/** A scooter from above, facing right; (x, y) is the middle of its tail. */
function scooterTop(x: number, y: number): string {
  return (
    `<g class="a-figure"><rect class="a-ink" x="${x}" y="${y - SC.wid / 2}" width="${SC.len}" height="${SC.wid}" rx="${SC.wid / 2}"/>` +
    `<path class="a-ink-s" stroke-width="9" d="M${x + 142},${y - 38}v76"/>` +
    `<circle class="a-far" cx="${x + 84}" cy="${y}" r="19"/><circle class="a-bg" cx="${x + 88}" cy="${y}" r="9"/>` +
    `<rect class="a-red" x="${x - 2}" y="${y - 9}" width="7" height="18" rx="3"/>` +
    `<circle class="a-exh" cx="${x + 3}" cy="${y + 21}" r="7"/></g>`
  );
}
/** A person from above: shoulders and head. */
function personTop(x: number, y: number, o: { cap?: boolean; small?: boolean } = {}): string {
  const k = (o.small ? 0.8 : 1) * 1.35;
  return `<g class="a-figure"><ellipse class="a-ink" cx="${x}" cy="${y}" rx="${30 * k}" ry="${15 * k}"/><circle class="${o.cap ? 'a-yellow' : 'a-deep'}" cx="${x}" cy="${y - 2}" r="${13 * k}"/>${o.cap ? `<path class="a-yellow" d="M${x - 9 * k},${y - 12 * k}h${18 * k}v${-9 * k}h${-18 * k}z"/>` : ''}</g>`;
}
/** A pushchair from above, pushed up the picture (toward the road). */
function pushchairTop(x: number, y: number): string {
  return `<g class="a-figure"><rect class="a-ink" x="${x - 26}" y="${y - 40}" width="52" height="66" rx="15"/><path class="a-far" d="M${x - 20},${y - 8}a20,20 0 0 1 40,0z"/><circle class="a-bg" cx="${x}" cy="${y + 8}" r="9"/></g>`;
}

export interface PlanParts {
  /** road, paint and pavement */
  ground: string;
  /** scooters and people */
  figures: string;
  /** the dimension line across the gap */
  dimension: string;
  /** tailpipes of the turn-box scooters (they point at the crossing) and of the stop-box rank */
  tailpipes: AirSource[];
  /** where the people stand, for air({ kerb }) and for labels */
  people: Box;
  /** keep-clear boxes for the air marks */
  avoid: Box[];
}

export function planView(): PlanParts {
  const P = PLAN3;
  const B = P.box;
  const T = P.turnBox;
  const g: string[] = [];
  // the carriageway and the pavement, with paving joints
  g.push(`<rect class="a-road" x="${B.x}" y="${B.y}" width="${B.w}" height="${P.kerb}"/>`);
  g.push(`<rect class="a-kerb" x="${B.x - 4}" y="${P.kerb}" width="${B.w + 8}" height="${B.h - P.kerb + 4}"/>`);
  let joints = '';
  for (let x = B.x + 60; x < B.x + B.w; x += 94) joints += `M${x},${P.kerb + 2}V${B.h}`;
  g.push(`<path class="a-line" stroke-width="1" d="${joints}M${B.x},${P.kerb + 150}H${B.x + B.w}"/>`);
  // paint: the double centre line, the stop line, the stop box, the crossing, the turn box
  g.push(`<path class="plan3-yellow" d="M${B.x},${P.centre - 7}H${P.crossing[0] - 34}M${B.x},${P.centre + 7}H${P.crossing[0] - 34}M${P.crossing[1] + 34},${P.centre - 7}H${B.x + B.w}M${P.crossing[1] + 34},${P.centre + 7}H${B.x + B.w}"/>`);
  g.push(`<rect class="a-paint" x="${P.stopLine[0]}" y="${P.centre + 14}" width="${P.stopLine[1] - P.stopLine[0]}" height="${P.kerb - P.centre - 22}"/>`);
  g.push(`<path class="plan3-box" d="M${B.x - 10},${P.centre + 22}H${P.stopLine[0] - 12}V${P.kerb - 12}H${B.x - 10}"/>`);
  for (let y = P.centre + 22; y < P.kerb - 30; y += 76) g.push(`<rect class="a-paint" x="${P.crossing[0]}" y="${y}" width="${P.crossing[1] - P.crossing[0]}" height="40"/>`);
  for (let y = 24; y < P.centre - 40; y += 76) g.push(`<rect class="a-paint" x="${P.crossing[0]}" y="${y}" width="${P.crossing[1] - P.crossing[0]}" height="40" opacity="0.7"/>`);
  g.push(`<rect class="plan3-box" x="${T.x0}" y="${T.y0}" width="${T.x1 - T.x0}" height="${T.y1 - T.y0}"/>`);

  // the stop box: one rank at the line, facing the crossing
  const rank = [352, 426, 500, 574, 628].slice(0, 4).map((y) => ({ x: P.stopLine[0] - 22 - SC.len, y }));
  // the turn box: four abreast, tails toward the crossing
  const turn = [448, 506, 564, 622].map((y) => ({ x: T.x0 + 16, y }));
  const folk = { elder: { x: 292, y: 724 }, parent: { x: 392, y: 756 }, pram: { x: 392, y: 706 }, child: { x: 486, y: 722 } };
  const figures =
    rank.map((s) => scooterTop(s.x, s.y)).join('') +
    turn.map((s) => scooterTop(s.x, s.y)).join('') +
    personTop(folk.elder.x, folk.elder.y) + pushchairTop(folk.pram.x, folk.pram.y) + personTop(folk.parent.x, folk.parent.y) + personTop(folk.child.x, folk.child.y, { cap: true, small: true });

  // the 50 cm: from the edge of the crossing to the rear edge of the turn box
  const [a, b] = [P.crossing[1], T.x0];
  const dy = T.y0 - 26;
  const dimension = `<path class="plan3-dim" d="M${a},${dy}H${b}M${a},${dy - 20}V${T.y0 + 30}M${b},${dy - 20}V${T.y0 - 4}M${(a + b) / 2},${dy}V${dy - 58}H${b + 14}"/>`;

  const tailpipes: AirSource[] = [...rank, ...turn].map((s) => ({ x: s.x + 3, y: s.y + 21 }));
  const people: Box = { x: 244, y: P.kerb + 4, w: 300, h: 150 };
  const avoid: Box[] = [
    ...Object.values(folk).map((p) => ({ x: p.x - 44, y: p.y - 44, w: 88, h: 76 })),
    ...turn.map((s) => ({ x: s.x, y: s.y - 28, w: SC.len, h: 56 })),
    ...rank.map((s) => ({ x: s.x, y: s.y - 28, w: SC.len, h: 56 })),
  ];
  return { ground: g.join(''), figures, dimension, tailpipes, people, avoid };
}
