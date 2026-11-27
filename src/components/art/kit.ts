/**
 * kit.ts — the pieces the street scenes share: placing a figure, the pale
 * shopfronts behind a street, the pedestrian signal with its LED countdown,
 * and the small sums that turn a placed scooter into a tailpipe or a tyre for
 * air.ts. Pure functions returning SVG fragments, like parts.ts.
 *
 * Street scenes use 1 unit = 1 cm, the ground at y = 0, up negative.
 */
import type { AirSource } from './air.ts';
import { LED_FIGURES, TAILPIPE, ledDigitRuns, ledDots, ledRuns, scooter, type ScooterKind } from './parts.ts';

const n = (v: number) => +v.toFixed(1);

/** Wrap a part in a <g> at (x, y), optionally scaled, flipped or classed. */
export function put(x: number, y: number, inner: string, o: { s?: number; cls?: string; flip?: boolean; attrs?: string } = {}): string {
  const t = `translate(${n(x)} ${n(y)})` + (o.s && o.s !== 1 ? ` scale(${o.s})` : '') + (o.flip ? ' scale(-1 1)' : '');
  return `<g${o.cls ? ` class="${o.cls}"` : ''} transform="${t}"${o.attrs ? ' ' + o.attrs : ''}>${inner}</g>`;
}

/* ------------------------------------------------------------------------ */
/* Scooters in a pack                                                         */
/* ------------------------------------------------------------------------ */

/** A scooter standing in a scene: x of its tail, how far back it is drawn (lift, in units up the picture), its scale and row. */
export interface Placed {
  x: number;
  lift: number;
  s: number;
  row: 1 | 2 | 3;
}
/** Rows of a pack: the same drawing, smaller and paler with distance. */
export const ROW_CLASS = { 1: '', 2: 'a-row-2', 3: 'a-row-3' } as const;

export const tailOf = (q: Placed): AirSource => ({ x: q.x + TAILPIPE.x * q.s, y: -q.lift + TAILPIPE.y * q.s, scale: q.s, row: q.row });

/** One scooter with its rider, placed. */
export function placed(q: Placed, kind: ScooterKind, o: { face?: boolean; cls?: string; attrs?: string; rider?: boolean } = {}): string {
  return put(q.x, -q.lift, scooter({ kind, rider: o.rider ?? true, face: o.face }), { s: q.s, cls: [ROW_CLASS[q.row], o.cls].filter(Boolean).join(' ') || undefined, attrs: o.attrs });
}

/* ------------------------------------------------------------------------ */
/* The street behind                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Pale shopfronts: a row of arcade bays in hairlines, quiet enough that the
 * people and the air read in front of it. No words, no signs to read.
 *   x0, x1  left and right edge      base  y of the far pavement
 *   top     y of the top of the wall  bay   width of one bay
 */
export function shopfronts(o: { x0: number; x1: number; base: number; top: number; bay?: number; shift?: number }): string {
  const { x0, x1, base, top, bay = 230, shift = 0 } = o;
  const h = base - top;
  const fascia = base - Math.min(h * 0.62, 265);
  const s: string[] = [`<rect class="a-plane" x="${x0}" y="${top}" width="${x1 - x0}" height="${h}"/>`];
  let lines = `M${x0},${n(fascia)}H${x1}M${x0},${n(fascia - 34)}H${x1}`;
  let thin = '';
  for (let x = x0 - bay + (((shift % bay) + bay) % bay), i = 0; x < x1; x += bay, i++) {
    // the column between two bays
    lines += `M${n(x)},${top}V${base}`;
    const a = x + bay * 0.14;
    const b = x + bay * 0.86;
    if (i % 3 === 0) {
      // a roller shutter, down
      lines += `M${n(a)},${n(fascia + 16)}H${n(b)}V${base}M${n(a)},${n(fascia + 16)}V${base}`;
      for (let y = fascia + 34; y < base - 6; y += 18) thin += `M${n(a)},${n(y)}H${n(b)}`;
    } else if (i % 3 === 1) {
      // a glass front: a door and a window
      const d = a + (b - a) * 0.36;
      lines += `M${n(a)},${n(fascia + 22)}H${n(d)}V${base}M${n(a)},${n(fascia + 22)}V${base}`;
      lines += `M${n(d + 12)},${n(fascia + 22)}H${n(b)}V${n(base - 62)}H${n(d + 12)}Z`;
    } else {
      // an open arcade with an awning
      lines += `M${n(a - 8)},${n(fascia + 12)}H${n(b + 8)}L${n(b)},${n(fascia + 44)}H${n(a)}Z`;
      thin += `M${n(a)},${n(fascia + 44)}V${base}M${n(b)},${n(fascia + 44)}V${base}`;
    }
    // an upstairs window
    if (fascia - top > 120) lines += `M${n(x + bay * 0.3)},${n(fascia - 34 - 96)}h${n(bay * 0.4)}v62h${n(-bay * 0.4)}Z`;
  }
  s.push(`<path class="a-line" d="${lines}"/>`, `<path class="a-line" stroke-width="1" opacity="0.7" d="${thin}"/>`);
  return s.join('');
}

/* ------------------------------------------------------------------------ */
/* The pedestrian signal                                                      */
/* ------------------------------------------------------------------------ */

/** Size of the signal head before scaling (the same drawing as Signal.astro). */
export const SIGNAL_HEAD = { w: 30, h: 58 };

/**
 * A pedestrian signal head with its LED countdown, top-left corner at (x, y),
 * `scale` units to one LED unit (the head is 30 × 58 before scaling).
 * `count` is the two-digit number above the figure; leave it out for none.
 * `poleTo`: y to which a pole runs down from the head (the ground).
 */
export function pedSignal(o: { x: number; y: number; scale: number; state: 'red' | 'green'; count?: number; poleTo?: number }): string {
  const { x, y, scale, state, count } = o;
  const led = state === 'red' ? 'a-led-red' : 'a-led-green';
  const dots = (d: string) => ledDots(d, { pitch: 2, r: 0.8, cls: led });
  const hasCount = count !== undefined;
  const H = hasCount ? SIGNAL_HEAD.h : 36;
  const text = hasCount ? String(Math.max(0, Math.min(99, Math.round(count)))).padStart(2, '0') : '';
  const body =
    `<rect class="a-housing" width="${SIGNAL_HEAD.w}" height="${H}" rx="2.5"/>` +
    (hasCount ? dots(ledDigitRuns(text[0], 2, 4, 3) + ledDigitRuns(text[1], 2, 16, 3)) + '<rect class="a-lamp-off" x="2" y="20.5" width="26" height="1"/>' : '') +
    `<g transform="translate(0 ${hasCount ? 22 : 0})">${dots(ledRuns(state === 'red' ? LED_FIGURES.stand : LED_FIGURES.walk, 2, 3, 2))}</g>`;
  const cx = x + (SIGNAL_HEAD.w * scale) / 2;
  const pole = o.poleTo !== undefined ? `<path class="a-metal-s" stroke-width="${n(scale * 2.6)}" d="M${n(cx)},${n(y + H * scale)}V${n(o.poleTo)}"/>` : '';
  return pole + `<g class="a-signal" data-state="${state}" transform="translate(${n(x)} ${n(y)}) scale(${scale})">${body}</g>`;
}

/* ------------------------------------------------------------------------ */
/* Air, step by step                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Mark the cores and clusters of some tailpipes so they follow the scenario
 * switch like the rows of scooters they belong to: `steps` maps a tailpipe's
 * index (its place in air({ tailpipes })) to 2 (shown from the dozen) or 3
 * (shown only when the box is full). Give it air().cores or air().marks.
 */
export function stepSources(html: string, steps: Record<number, 2 | 3>): string {
  return html
    .replace('class="air-cores"', 'class="air-cores air-steps"')
    .replace(/<g class="(air-(?:core|src))" data-src="(\d+)"/g, (m, cls: string, i: string) => (steps[+i] ? `<g class="${cls} air-b air-b${steps[+i]}" data-src="${i}"` : m));
}

/** Give every tailpipe's core and cluster its index as a CSS variable (--i), so they can arrive one after another. */
export function indexSources(html: string): string {
  return html.replace(/<g class="(air-(?:core|src)[^"]*)" data-src="(\d+)"/g, (_m, cls: string, i: string) => `<g class="${cls}" data-src="${i}" style="--i:${i}"`);
}

const SOURCE = /<g class="air-(?:core|src)[^"]*" data-src="(\d+)"[^>]*>.*?<\/g>/g;

/**
 * The cores (from air().cores) or clusters (from air().marks) of some
 * tailpipes only, so a scene can draw each row's exhaust behind that row's
 * scooters. `keep` gets the tailpipe's index in air({ tailpipes }).
 */
export function pickSources(html: string, keep: (i: number) => boolean): string {
  let out = '';
  for (const m of html.matchAll(SOURCE)) if (keep(+m[1])) out += m[0];
  return out;
}
/** air().marks without any tailpipe's cluster: the street's own air and the kerb zone. */
export const withoutSources = (marks: string): string => marks.replace(SOURCE, '');
