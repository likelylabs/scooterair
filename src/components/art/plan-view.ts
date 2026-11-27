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

/**
 * A scooter from above, facing right; (x, y) is the middle of its tail. Drawn so it reads as a
 * scooter with its rider seen from overhead, not as a mark: two wheels sticking out front and
 * back, a long deck, handlebars with grips, and a rider whose arms reach the grips, with a helmet
 * and its visor toward the front.
 */
function scooterTop(x: number, y: number): string {
  const L = SC.len;
  return (
    '<g class="a-figure">' +
    // wheels, front and back, peeking out past the body
    `<rect class="a-deep" x="${x - 6}" y="${y - 7}" width="34" height="14" rx="6"/><rect class="a-deep" x="${x + L - 26}" y="${y - 7}" width="34" height="14" rx="6"/>` +
    // the body: a long deck, wider under the seat, narrow at the front
    `<path class="a-ink" d="M${x + 4},${y - 22}Q${x},${y} ${x + 4},${y + 22}L${x + 112},${y + 22}Q${x + 132},${y + 12} ${x + L - 10},${y + 10}Q${x + L},${y} ${x + L - 10},${y - 10}Q${x + 132},${y - 12} ${x + 112},${y - 22}Z"/>` +
    // handlebars with their grips
    `<path class="a-ink-s" stroke-width="8" d="M${x + 146},${y - 40}V${y + 40}"/>` +
    `<rect class="a-deep" x="${x + 140}" y="${y - 48}" width="12" height="14" rx="4"/><rect class="a-deep" x="${x + 140}" y="${y + 34}" width="12" height="14" rx="4"/>` +
    // the rider: arms to the grips, shoulders, and a helmet with its visor to the front
    `<path class="a-far-s" stroke-width="11" d="M${x + 92},${y - 22}L${x + 142},${y - 38}M${x + 92},${y + 22}L${x + 142},${y + 38}"/>` +
    `<ellipse class="a-far" cx="${x + 84}" cy="${y}" rx="20" ry="32"/>` +
    `<circle class="a-deep" cx="${x + 92}" cy="${y}" r="17"/><path class="a-far" d="M${x + 99},${y - 13}A17,17 0 0 1 ${x + 99},${y + 13}L${x + 104},${y + 9}A12,12 0 0 0 ${x + 104},${y - 9}Z"/>` +
    // tail light and tailpipe
    `<rect class="a-red" x="${x - 2}" y="${y - 9}" width="7" height="18" rx="3"/>` +
    `<rect class="a-exh" x="${x - 6}" y="${y + 16}" width="22" height="10" rx="5"/></g>`
  );
}
/** A person from above: shoulders, arms at their sides, and the head (hair, or a yellow school cap with its brim). */
function personTop(x: number, y: number, o: { cap?: boolean; small?: boolean } = {}): string {
  const k = (o.small ? 0.8 : 1) * 1.35;
  return (
    '<g class="a-figure">' +
    `<ellipse class="a-ink" cx="${x - 30 * k}" cy="${y + 2 * k}" rx="${7 * k}" ry="${10 * k}"/><ellipse class="a-ink" cx="${x + 30 * k}" cy="${y + 2 * k}" rx="${7 * k}" ry="${10 * k}"/>` +
    `<ellipse class="a-ink" cx="${x}" cy="${y}" rx="${27 * k}" ry="${14 * k}"/>` +
    `<circle class="${o.cap ? 'a-yellow' : 'a-deep'}" cx="${x}" cy="${y - 1 * k}" r="${12 * k}"/>` +
    (o.cap ? `<path class="a-yellow" d="M${x - 9 * k},${y - 10 * k}Q${x},${y - 22 * k} ${x + 9 * k},${y - 10 * k}Z"/>` : `<ellipse class="a-far" cx="${x}" cy="${y - 9 * k}" rx="${4 * k}" ry="${2.4 * k}"/>`) +
    '</g>'
  );
}
/** A pushchair from above, pushed up the picture (toward the road): four wheels, the seat, the hood, the handle. */
function pushchairTop(x: number, y: number): string {
  return (
    '<g class="a-figure">' +
    [[-28, -34], [22, -34], [-28, 14], [22, 14]].map(([dx, dy]) => `<rect class="a-deep" x="${x + dx}" y="${y + dy}" width="6" height="16" rx="3"/>`).join('') +
    `<rect class="a-ink" x="${x - 24}" y="${y - 40}" width="48" height="62" rx="14"/><path class="a-far" d="M${x - 20},${y - 6}a20,20 0 0 1 40,0z"/>` +
    `<path class="a-ink-s" stroke-width="6" d="M${x - 22},${y + 22}V${y + 34}H${x + 22}V${y + 22}"/></g>`
  );
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
  const dimension = `<path class="plan3-dim" d="M${a},${dy}H${b}M${a},${dy - 20}V${T.y0 + 30}M${b},${dy - 20}V${T.y0 - 4}M${(a + b) / 2},${dy}V${dy - 22}"/>`;

  const tailpipes: AirSource[] = [...rank, ...turn].map((s) => ({ x: s.x + 3, y: s.y + 21 }));
  const people: Box = { x: 244, y: P.kerb + 4, w: 300, h: 150 };
  return { ground: g.join(''), figures, dimension, tailpipes, people };
}
