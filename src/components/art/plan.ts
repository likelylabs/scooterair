/**
 * The plan of one approach (blueprint V6), shared by ApproachPlan and
 * MeasurementDiagram.
 *
 * Geometry, read from 道路交通標誌標線號誌設置規則 as recorded in
 * research/redlight/intersection-peaks.json (`moj-rules-geometry`) and
 * policy-idling.json (`motc-stop-box-geometry`):
 *
 *   Art. 174-2  the scooter stop box sits behind the stop line, 2.5–6 m deep
 *   Art. 191    the two-stage turn box is drawn beyond the crosswalk, inside
 *               the junction; its rear edge is at least 0.5 m from the
 *               crosswalk line (adjustable)
 *
 * Traffic runs left to right, as in the side view. The camera of the side
 * view stands on the bottom pavement, so the corner where the child waits is
 * at the bottom right, beside the turn box.
 *
 * Scale: 1 unit = 2 cm (1 m = 50 units). Drawn here: stop box 4.2 m deep,
 * crosswalk 3 m, gap exactly 0.5 m (the legal minimum), turn box 2.6 m.
 * NOT from the rules, and so not dimensioned: the 1 m between stop line and
 * crosswalk, the lane widths, the depth of the turn box.
 */
import { art } from '@/i18n/art';
import type { Locale } from '@/i18n';
import { esc } from './parts';

export const PLAN = {
  W: 760,
  H: 452,
  kerb: 337, // bottom edge of the carriageway
  centre: 58, // centre line; above it, the opposing lanes (cropped)
  stopBox: [40, 250],
  stopLine: [250, 268],
  crosswalk: [318, 468],
  turnBox: [493, 623],
  turnBoxY: [205, 331],
  junction: 640, // the cross street's kerb line
};

export interface PlanOptions {
  locale: Locale;
  kind?: 'gas' | 'electric';
  /** zone names and dimensions */
  labels?: boolean;
  /** numbered instrument positions for the measurement diagram */
  instruments?: boolean;
}

/** A scooter from above, facing right; (x, y) is the middle of its tail. */
function scooterTop(x: number, y: number, gas: boolean): string {
  return (
    `<rect class="a-ink" x="${x}" y="${y - 14}" width="92" height="28" rx="14"/>` +
    `<path class="a-ink-s" stroke-width="5" d="M${x + 70},${y - 19} v38"/>` +
    `<circle class="${gas ? 'a-deep' : 'a-clean'}" cx="${x + 42}" cy="${y}" r="9.5"/>` +
    (gas ? `<circle class="a-exh" cx="${x - 3}" cy="${y + 7}" r="5"/><path class="a-ribbon-s" d="M${x - 8},${y + 7} q-3,-3 -6,0 t-6,0"/>` : '')
  );
}
/** A person from above: shoulders and head. `cap` = the yellow school cap. */
function personTop(x: number, y: number, o: { cap?: boolean; small?: boolean; along?: 'x' | 'y' } = {}): string {
  const k = o.small ? 0.8 : 1;
  const [rx, ry] = o.along === 'x' ? [7 * k, 13 * k] : [13 * k, 7 * k];
  return `<ellipse class="a-ink a-halo" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/><circle class="${o.cap ? 'a-yellow' : 'a-deep'}" cx="${x}" cy="${y}" r="${6.5 * k}"/>`;
}

export function planSvg(o: PlanOptions): { viewBox: string; body: string } {
  const { locale, kind = 'gas', labels = true, instruments = false } = o;
  const P = PLAN;
  const gas = kind === 'gas';
  const s: string[] = [];
  const t = (x: number, y: number, text: string, anchor = 'middle', cls = '') => `<text class="a-text plan-t ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(text)}</text>`;

  // carriageway of street B (full width) and of the cross street (right)
  s.push(`<rect class="a-road" x="0" y="0" width="${P.W}" height="${P.kerb}"/><rect class="a-road" x="${P.junction}" y="0" width="${P.W - P.junction}" height="${P.H}"/>`);
  // pavement with the corner
  s.push(`<path class="a-kerb" d="M-2,${P.kerb} H${P.junction - 40} Q${P.junction},${P.kerb} ${P.junction},${P.kerb + 40} V${P.H + 2} H-2 Z"/>`);
  let tiles = '';
  for (let x = 38; x < P.junction - 20; x += 38) tiles += `M${x},${P.kerb + 1} V${P.H} `;
  s.push(`<path class="a-line" stroke-width="1" d="${tiles}"/>`);

  // paint: centre line, lane line, stop box, stop line, crosswalk, turn box, the cross street's crosswalk
  s.push(`<path class="plan-yellow" d="M0,${P.centre - 3} H${P.crosswalk[0] - 14} M0,${P.centre + 3} H${P.crosswalk[0] - 14}"/>`);
  s.push(`<path class="plan-lane" d="M0,198 H${P.stopBox[0] - 6}"/>`);
  const outline = (x0: number, y0: number, x1: number, y1: number) => `<rect class="plan-box" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/>`;
  s.push(outline(P.stopBox[0], P.centre + 10, P.stopBox[1] - 6, P.kerb - 6));
  s.push(`<rect class="a-paint" x="${P.stopLine[0]}" y="${P.centre + 6}" width="${P.stopLine[1] - P.stopLine[0]}" height="${P.kerb - P.centre - 8}"/>`);
  for (let y = 8; y < P.kerb - 12; y += 27) s.push(`<rect class="a-paint" x="${P.crosswalk[0]}" y="${y}" width="${P.crosswalk[1] - P.crosswalk[0]}" height="14"/>`);
  s.push(outline(P.turnBox[0], P.turnBoxY[0], P.turnBox[1], P.turnBoxY[1]));
  for (let x = P.junction + 12; x < P.W - 8; x += 27) s.push(`<rect class="a-paint" x="${x}" y="${P.kerb + 8}" width="14" height="${P.H - P.kerb - 14}"/>`);

  // direction of travel
  s.push(`<path class="a-dim" d="M8,128 h22 m-7,-6 l7,6 l-7,6"/>`);

  // the pack in the stop box: two ranks; then the riders in the turn box, tails toward the crosswalk
  const rank = (x: number, ys: number[]) => ys.map((y, i) => scooterTop(x + (i % 2) * 6, y, gas)).join('');
  s.push(rank(46, [84, 120, 156, 196, 232, 270, 306]));
  s.push(rank(148, [88, 124, 162, 200, 238, 302]));
  s.push(rank(P.turnBox[0] + 7, [222, 252, 284, 314]));

  // people on the crosswalk (crossing street B), a stroller among them
  s.push(personTop(352, 110), personTop(426, 262), personTop(392, 176));
  s.push(`<rect class="a-ink a-halo" x="380" y="190" width="24" height="30" rx="7"/><circle class="a-far" cx="392" cy="205" r="6"/>`);
  // the corner: the schoolchild in the yellow cap and an older woman, waiting to cross the other street
  s.push(personTop(586, 366, { along: 'x' }), personTop(614, 372, { cap: true, small: true, along: 'x' }));

  if (labels) {
    // zone names along the top
    s.push(t((P.stopBox[0] + P.stopBox[1]) / 2, 32, `${art.plan.stopBox[locale]} ${art.plan.stopBoxDepth[locale]}`));
    s.push(`<path class="a-dim" d="M${P.stopBox[0]},44 H${P.stopBox[1] - 6} M${P.stopBox[0]},38 v12 M${P.stopBox[1] - 6},38 v12"/>`);
    s.push(t((P.crosswalk[0] + P.crosswalk[1]) / 2, 32, art.plan.crosswalk[locale]));
    s.push(t((P.turnBox[0] + P.turnBox[1]) / 2, 32, art.plan.turnBox[locale]));
    s.push(`<path class="a-leader" d="M${(P.turnBox[0] + P.turnBox[1]) / 2},40 V${P.turnBoxY[0] - 4}"/>`);
    // the 50 cm: between the crosswalk and the turn box's rear edge
    const [a, b] = [P.crosswalk[1], P.turnBox[0]];
    s.push(`<path class="a-dim" d="M${a},${P.kerb + 18} H${b} M${a},${P.kerb - 4} v30 M${b},${P.kerb - 4} v30"/>`);
    s.push(t((a + b) / 2, P.kerb + 52, art.plan.gap[locale], 'middle', 'plan-t--strong'));
    // the corner
    s.push(t(P.junction - 14, P.H - 10, art.plan.corner[locale], 'end'));
  }

  if (instruments) {
    const pts: [number, number][] = [
      [P.junction - 26, P.kerb + 62],
      [P.turnBox[0] + 60, P.kerb + 24],
      [P.stopBox[0] + 100, P.kerb + 24],
      [28, P.kerb + 66],
    ];
    pts.forEach(([x, y], i) => {
      s.push(`<circle class="a-instrument" cx="${x}" cy="${y}" r="15"/><text class="plan-n" x="${x}" y="${y + 7}" text-anchor="middle">${i + 1}</text>`);
    });
    // the control point is away from the junction: off the edge of the plan
    s.push(`<path class="a-dim" d="M10,${P.kerb + 100} h34 m-34,0 l8,-6 m-8,6 l8,6"/>`);
  }

  return { viewBox: `0 0 ${P.W} ${P.H}`, body: s.join('') };
}
