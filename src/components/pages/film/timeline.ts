/**
 * The film's sequence (blueprint 4.7, V45), as data. One module for the page that renders the
 * beats and the script that plays them. Pure: no strings, no DOM, loadable by plain Node.
 *
 * THE CLOCK IS REAL. While the light is red and the clock is running, one count is one second.
 * It holds once, at 38, exactly where the home page pauses its countdown (link 5: the long-term
 * studies are not about this red light), and the frame says so. So the red light on screen lasts
 * its ninety counts, and the film is longer than ninety seconds by the pause, the green beat and
 * the electric replay.
 *
 * Each line of the chain appears at the count the home page gives its chapter
 * (chain.countdown in ui.ts): link 1 inside 90→78, link 2 at 78, link 3 at 64, link 4 at 50,
 * link 5 at the pause, link 6 at 38, the last five seconds, green at 00, link 7 on the reset.
 * `checkTimeline()` (called at build time) fails the build if that stops being true, or if any
 * beat outlasts the empty chart.
 *
 * Rules this sequence keeps (blueprint Part 2 R11, 4.7, Appendix A):
 *  - frames are cut, never dissolved: the hatched band is never on screen at any density but its one;
 *  - no frame differs from another in how much air pollution it shows; the green frame is the
 *    home page's K4, with no surge;
 *  - the long-term health line (link 5) plays on a card with no scene in it;
 *  - the empty chart is the longest beat, and it comes back before the green.
 */

export type FrameId = 'empty' | 'pack' | 'heights' | 'paused' | 'chart' | 'fumes' | 'card' | 'green' | 'clean';
export type Phase = 'red' | 'paused' | 'green';
export type BeatId = 'title' | 'l1' | 'l2' | 'ask' | 'l3' | 'l4' | 'l5' | 'l6a' | 'l6b' | 'open' | 'five' | 'green' | 'l7';

export interface Beat {
  id: BeatId;
  /** Seconds of film this beat lasts. */
  dur: number;
  frame: FrameId;
  /** The count on the signal at the start and the end of the beat. Equal = held. */
  count: [number, number];
  phase: Phase;
  /** The chain link (1–7) whose line from chain.summary is this beat's caption. */
  link?: number;
  /** Seconds into the beat at which its second caption line appears. */
  cue?: number;
}

export const BEATS: Beat[] = [
  { id: 'title', dur: 4, frame: 'empty', count: [90, 86], phase: 'red' },
  { id: 'l1', dur: 8, frame: 'pack', count: [86, 78], phase: 'red', link: 1 },
  { id: 'l2', dur: 11, frame: 'heights', count: [78, 67], phase: 'red', link: 2 },
  { id: 'ask', dur: 3, frame: 'paused', count: [67, 64], phase: 'red' },
  { id: 'l3', dur: 14, frame: 'chart', count: [64, 50], phase: 'red', link: 3, cue: 5 },
  { id: 'l4', dur: 12, frame: 'fumes', count: [50, 38], phase: 'red', link: 4 },
  { id: 'l5', dur: 9, frame: 'card', count: [38, 38], phase: 'paused', link: 5 },
  { id: 'l6a', dur: 11, frame: 'pack', count: [38, 27], phase: 'red', link: 6 },
  { id: 'l6b', dur: 11, frame: 'heights', count: [27, 16], phase: 'red', link: 6 },
  { id: 'open', dur: 11, frame: 'chart', count: [16, 5], phase: 'red' },
  { id: 'five', dur: 5, frame: 'pack', count: [5, 0], phase: 'red' },
  { id: 'green', dur: 6, frame: 'green', count: [0, 0], phase: 'green' },
  { id: 'l7', dur: 8, frame: 'clean', count: [90, 82], phase: 'red', link: 7 },
];

/** Start time of each beat, and the running time of the film. */
export const STARTS: number[] = BEATS.reduce<number[]>((acc, _b, i) => (acc.push(i ? acc[i - 1] + BEATS[i - 1].dur : 0), acc), []);
export const DURATION: number = STARTS[STARTS.length - 1] + BEATS[BEATS.length - 1].dur;

/** The frames in the order they first appear: the film with JavaScript off is these, in this order. */
export const FRAME_ORDER: FrameId[] = BEATS.reduce<FrameId[]>((acc, b) => (acc.includes(b.frame) ? acc : [...acc, b.frame]), []);

/** Index of the beat on screen at film time `t` (the last beat holds at the end). */
export function beatAt(t: number): number {
  let i = 0;
  for (let k = 0; k < BEATS.length; k++) if (t >= STARTS[k]) i = k;
  return i;
}

/** What the signal shows at film time `t`. */
export function clockAt(t: number): { count: number; phase: Phase; beat: number } {
  const i = beatAt(Math.max(0, Math.min(t, DURATION)));
  const b = BEATS[i];
  const [from, to] = b.count;
  const count = from === to ? from : Math.max(to, from - Math.floor(Math.min(t, DURATION) - STARTS[i] + 1e-6));
  return { count, phase: b.phase, beat: i };
}

/** m:ss for a number of seconds. */
export const clockTime = (s: number): string => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * Build-time guard. `allocation` is chain.countdown from ui.ts. Throws when the film no longer
 * shows each link at the count the home page assigns it, when the clock is not real, or when a
 * beat outlasts the empty chart.
 */
export function checkTimeline(allocation: { links: [number, number][]; green: [number, number] }): void {
  const fail = (m: string) => {
    throw new Error(`film timeline: ${m}`);
  };
  for (const b of BEATS) {
    const run = b.count[0] - b.count[1];
    if (b.phase === 'red' && run !== b.dur) fail(`beat "${b.id}" runs ${run} counts in ${b.dur} s; a red second must be one count.`);
    if (b.phase !== 'red' && run !== 0) fail(`beat "${b.id}" is ${b.phase} and must hold its count.`);
  }
  const first = (link: number) => BEATS.find((b) => b.link === link)!;
  allocation.links.forEach(([from, to], i) => {
    const b = first(i + 1);
    if (i === 0) {
      // the title takes the first seconds of link 1's span
      if (b.count[0] > from || b.count[1] !== to) fail(`link 1 must fall inside ${from}→${to}.`);
    } else if (i === 6) {
      if (b.count[0] !== from) fail(`link 7 must reset the clock to ${from}.`);
    } else if (b.count[0] !== from) fail(`link ${i + 1} must appear at ${from}, as on the home page.`);
  });
  if (first(5).phase !== 'paused') fail('link 5 must hold the clock, as on the home page.');
  const five = BEATS.find((b) => b.id === 'five')!;
  if (five.count[0] !== allocation.green[0] || five.count[1] !== allocation.green[1]) fail(`the last beat of red must run ${allocation.green[0]}→${allocation.green[1]}.`);
  const chart = BEATS.find((b) => b.id === 'l3')!;
  const longest = Math.max(...BEATS.filter((b) => b !== chart).map((b) => b.dur));
  if (chart.frame !== 'chart' || chart.dur <= longest) fail(`the empty chart (${chart.dur} s) must be the longest beat; another runs ${longest} s.`);
  if (BEATS.some((b) => b.frame === 'card' && b.link !== 5) || first(5).frame !== 'card') fail('the health line plays on the card, and only there.');
}
