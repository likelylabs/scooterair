/**
 * timeline.ts — the film's clock (redesign brief, section 8.1 and amendment 12.2).
 *
 * Everything about WHEN lives here and nowhere else: the beats, the cues (one caption each),
 * what the signal shows at each second, and the guard that keeps the captions readable.
 * WHAT is drawn is ./scene.ts; the words are src/i18n/pages/film.ts; the numbers are the
 * estimate slots and the money module, joined in ./film-data.ts.
 *
 * Pure data and arithmetic, no imports: the page, the player in the browser, the MP4 export
 * (scripts/film-export.mjs) and plain Node all load this one file.
 *
 * The film never autoplays, and nothing in it depends on the previous frame: a time `t` in
 * seconds of film fixes the whole picture.
 */

/** A cue is one caption (and at most one quiet line under it), on screen for `dur` seconds. */
export interface Cue {
  /** key of the caption in film.ts (`cues.<id>`) */
  id: CueId;
  /** the chapter it belongs to (scrubber marks, transcript headings, stills) */
  beat: BeatId;
  /** seconds on screen. The reading floor is checked against the real captions by checkTimeline(). */
  dur: number;
  /** start, in seconds of film (filled in below from the durations) */
  t: number;
}

export type BeatId = 'smell' | 'arrive' | 'idle' | 'kerb' | 'inside' | 'mask' | 'closest' | 'health' | 'green' | 'electric' | 'money';

/**
 * The beat sheet of brief 8.1, with the mask beat of 12.2 after "what is in it".
 * Durations are the brief's, lengthened where the caption got longer (never shortened below
 * the reading floor): the health cues, and the running-cost cue, whose caption prints a range.
 */
const SHEET = [
  { id: 'smell', beat: 'smell', dur: 4.6 },
  { id: 'arrive', beat: 'arrive', dur: 4.0 },
  { id: 'waiting', beat: 'arrive', dur: 3.8 },
  { id: 'knee', beat: 'idle', dur: 4.0 },
  { id: 'keeps', beat: 'idle', dur: 4.4 },
  { id: 'howMuch', beat: 'kerb', dur: 6.4 },
  { id: 'co', beat: 'inside', dur: 2.6 },
  // the smell cue holds the strongest allowed line, with its condition, and its no-smell-not-clean note
  // in one frame (statements-smell); 1.4 s taken from 'co' and 0.6 s from 'howMuch' (both still above
  // their reading floors) keep the film's length
  { id: 'fuel', beat: 'inside', dur: 7.2 },
  { id: 'specks', beat: 'inside', dur: 3.2 },
  { id: 'mask', beat: 'mask', dur: 4.2 },
  { id: 'under', beat: 'closest', dur: 5.0 },
  { id: 'child', beat: 'closest', dur: 3.6 },
  { id: 'rider', beat: 'closest', dur: 3.2 },
  { id: 'daily', beat: 'health', dur: 6.4 },
  { id: 'years', beat: 'health', dur: 6.2 },
  { id: 'linked', beat: 'health', dur: 7.4 },
  { id: 'nearly', beat: 'green', dur: 3.0 },
  { id: 'green', beat: 'green', dur: 2.4 },
  { id: 'thins', beat: 'green', dur: 4.0 },
  { id: 'again', beat: 'electric', dur: 2.8 },
  { id: 'electric', beat: 'electric', dur: 4.0 },
  { id: 'noLayer', beat: 'electric', dur: 6.4 },
  { id: 'cost', beat: 'money', dur: 2.4 },
  { id: 'tags', beat: 'money', dur: 6.6 },
  { id: 'monthly', beat: 'money', dur: 9.6 },
  { id: 'end', beat: 'money', dur: 4.4 },
] as const;

export type CueId = (typeof SHEET)[number]['id'];

const r1 = (v: number): number => Math.round(v * 10) / 10;
let clockAt = 0;
export const CUES: readonly Cue[] = SHEET.map((c) => {
  const cue: Cue = { ...c, t: clockAt };
  clockAt = r1(clockAt + c.dur);
  return cue;
});

/** Length of the film in seconds. The slot `film.duration` (brief 3.3): never type it anywhere. */
export const DURATION: number = clockAt;

const at = (id: CueId): number => CUES.find((c) => c.id === id)!.t;

/** Start of each move of the film, in seconds. The scene reads these names, never a typed second. */
export const T = {
  /** the lamp turns red and the count shows 90 */
  red: 1.2,
  arrive: at('arrive'),
  waiting: at('waiting'),
  /** push in low behind the front row */
  tail: at('knee'),
  /** pull back; then the close shot of the child covering their nose */
  keeps: at('keeps'),
  /** the number panel */
  panel: at('howMuch'),
  /** the dive into the fume: a cloud that has no smell, then the smell, then the soot */
  inside: at('co'),
  fuel: at('fuel'),
  specks: at('specks'),
  mask: at('mask'),
  /** the ruler */
  closest: at('under'),
  child: at('child'),
  rider: at('rider'),
  /** the freeze: the calendar card, then the body card, then its pins */
  health: at('daily'),
  body: at('years'),
  pins: at('linked'),
  /** the street resumes; the last three counts run in real time */
  last: at('nearly'),
  green: at('green'),
  leave: at('thins'),
  /** the rewind card; under it the pack is swapped for its electric twin */
  rewind: at('again'),
  swap: r1(at('again') + 1.4),
  electric: at('electric'),
  /** the divider */
  compare: at('noLayer'),
  money: at('cost'),
  tags: at('tags'),
  bars: at('monthly'),
  end: at('end'),
  total: DURATION,
} as const;

/** The chapters: marks on the scrubber, headings of the transcript, and the stills. */
export interface Beat {
  id: BeatId;
  /** start, seconds */
  t: number;
  /** the moments shown as stills when the film cannot play (no JavaScript, reduced motion, print) */
  stills: number[];
}
export const BEATS: readonly Beat[] = [
  { id: 'smell', t: 0, stills: [3.9] },
  { id: 'arrive', t: T.arrive, stills: [T.waiting + 3.2] },
  { id: 'idle', t: T.tail, stills: [T.tail + 3.2, T.keeps + 3.6] },
  { id: 'kerb', t: T.panel, stills: [T.panel + 4.4] },
  { id: 'inside', t: T.inside, stills: [T.fuel + 4.2] },
  { id: 'mask', t: T.mask, stills: [T.mask + 3.4] },
  { id: 'closest', t: T.closest, stills: [T.closest + 4.2, T.rider + 2.6] },
  { id: 'health', t: T.health, stills: [T.health + 5.2, T.pins + 5.6] },
  { id: 'green', t: T.last, stills: [T.green + 1.9] },
  { id: 'electric', t: T.rewind, stills: [T.compare + 2.9] },
  { id: 'money', t: T.money, stills: [T.tags + 5, T.bars + 7] },
];

/**
 * The frame behind the Play button, and the film's share image (brief 8.2, change 21): the
 * ruler shot of beat 10, with the wisps breathed in at every nose.
 */
export const POSTER_T: number = r1(T.closest + 4.2);

/* ------------------------------------------------------------------------ */
/* The signal                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * The signal's count against film time. The red light keeps its 90 counts but the film does
 * not last 90 seconds: the first beats run in real time, and from the push-in on it is a
 * time-lapse (the clock shows ▸▸, with the word 快轉 the first time). The count holds once, at 4, while the
 * street is frozen for the health cards, and the last three counts run in real time.
 */
export const COUNT: readonly (readonly [number, number])[] = [
  [T.red, 90],
  [T.tail, 90 - (T.tail - T.red)],
  [T.keeps, 72],
  [T.panel, 62],
  [T.inside, 50],
  [T.fuel, 44],
  [T.specks, 36],
  [T.mask, 30],
  [T.closest, 24],
  [T.child, 17],
  [T.rider, 10],
  [T.health, 4],
  [T.last - 0.001, 4],
  [T.last, 3],
  [T.green, 0],
];
/** The electric replay: the whole red again, in ten seconds. */
export const COUNT_E: readonly (readonly [number, number])[] = [
  [T.electric, 90],
  [T.compare, 60],
  [T.money, 5],
];

/** Piecewise-linear lookup in [[x, y], …], clamped at both ends. */
export function pl(points: readonly (readonly [number, number])[], x: number): number {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (x <= points[i][0]) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  }
  return points[points.length - 1][1];
}

export interface Signal {
  /** which run of the red light is on screen */
  run: 'petrol' | 'electric' | null;
  lamp: 'green' | 'amber' | 'red';
  /** the number on the LED; null when no count is showing */
  led: number | null;
  /** counts per second of film: 1 = real time, more = time-lapse */
  rate: number;
  /** seconds of red elapsed, 0 to 90 (drives the clouds in the sky, nothing else) */
  s: number;
  /** seconds since the light turned green */
  g: number;
}

/** What the signal shows at film time t. Pure. */
export function signalAt(t: number): Signal {
  if (t < 0.7) return { run: 'petrol', lamp: 'green', led: null, rate: 0, s: 0, g: 0 };
  if (t < T.red) return { run: 'petrol', lamp: 'amber', led: null, rate: 0, s: 0, g: 0 };
  if (t < T.green) {
    const c = pl(COUNT, t);
    const rate = t >= T.health && t < T.last ? 0 : Math.abs(pl(COUNT, Math.min(t + 0.05, T.green)) - pl(COUNT, Math.max(t - 0.05, T.red))) / 0.1;
    return { run: 'petrol', lamp: 'red', led: Math.ceil(c - 1e-6), rate: t >= T.last ? 1 : rate, s: 90 - c, g: 0 };
  }
  if (t < T.swap) return { run: 'petrol', lamp: 'green', led: null, rate: 0, s: 90, g: t - T.green };
  if (t < T.money + 0.4) {
    const c = t < T.electric ? 90 : pl(COUNT_E, t);
    const rate = t < T.electric ? 0 : Math.abs(pl(COUNT_E, t + 0.05) - pl(COUNT_E, t - 0.05)) / 0.1;
    return { run: 'electric', lamp: 'red', led: Math.ceil(c - 1e-6), rate, s: 90 - c, g: 0 };
  }
  return { run: null, lamp: 'red', led: null, rate: 0, s: 0, g: 0 };
}

/* ------------------------------------------------------------------------ */
/* Lookups                                                                    */
/* ------------------------------------------------------------------------ */

/** m:ss */
export const clock = (s: number): string => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function cueAt(t: number): Cue {
  let c = CUES[0];
  for (const q of CUES) if (t >= q.t) c = q;
  return c;
}
export const cueEnd = (c: Cue): number => r1(c.t + c.dur);
export function beatAt(t: number): Beat {
  let b = BEATS[0];
  for (const q of BEATS) if (t >= q.t) b = q;
  return b;
}

/** The film's length in whole minutes, for "about N minutes". */
export const DURATION_MINUTES: number = Math.round(DURATION / 60);

/* ------------------------------------------------------------------------ */
/* The guard (brief 8.2, change 25)                                           */
/* ------------------------------------------------------------------------ */

/** Limits of brief 8.1. */
export const LIMITS = {
  /** a caption: Chinese characters, or English words */
  main: { zh: 14, en: 8 },
  /** the quiet line under it */
  note: { zh: 20, en: 10 },
  /** seconds on screen per Chinese character (caption plus quiet line), or per English word */
  perUnit: 0.3,
  /** and never less than this */
  floor: 2.2,
} as const;

/**
 * What a reader has to read: Chinese characters and digits one by one; English by the word.
 * 注音 after a character (苯（ㄅㄣˇ）) is a reading aid for that character, not more to read.
 */
export function readingUnits(text: string, locale: 'zh-TW' | 'en'): number {
  if (locale === 'en') return text.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return [...text.replace(/（[\u3100-\u312f\u02c7\u02ca\u02cb\u02d9]+）/g, '')].filter((ch) => /[\p{L}\p{N}]/u.test(ch)).length;
}

/**
 * Throws unless the timeline can be read and played: every cue within the caption limits and
 * on screen for its reading floor, times increasing, the LED falling from 90 to 0, and green
 * where green should be. Called at build time with the real captions of both languages.
 */
export function checkTimeline(captions: Record<CueId, { main: string; note?: string }>, locale: 'zh-TW' | 'en'): void {
  const L = locale === 'en' ? 'en' : 'zh';
  const bad: string[] = [];
  let prev = -1;
  for (const c of CUES) {
    const text = captions[c.id];
    if (!text || !text.main) {
      bad.push(`cue ${c.id}: no caption`);
      continue;
    }
    if (/\{\w+\}/.test(text.main + (text.note ?? ''))) bad.push(`cue ${c.id}: an unfilled {token} in "${text.main} ${text.note ?? ''}"`);
    if (!(c.t > prev)) bad.push(`cue ${c.id}: starts at ${c.t}, not after the cue before it`);
    prev = c.t;
    const main = readingUnits(text.main, locale);
    const note = text.note ? readingUnits(text.note, locale) : 0;
    if (main > LIMITS.main[L]) bad.push(`cue ${c.id}: caption is ${main} ${L === 'zh' ? 'characters' : 'words'}, limit ${LIMITS.main[L]}: "${text.main}"`);
    if (note > LIMITS.note[L]) bad.push(`cue ${c.id}: quiet line is ${note} ${L === 'zh' ? 'characters' : 'words'}, limit ${LIMITS.note[L]}: "${text.note}"`);
    const floor = Math.max(LIMITS.floor, LIMITS.perUnit * (main + note));
    if (c.dur + 1e-9 < floor) bad.push(`cue ${c.id}: on screen ${c.dur} s, needs ${floor.toFixed(1)} s to read "${text.main}${text.note ? ' / ' + text.note : ''}"`);
  }
  if (Math.abs(prev + CUES[CUES.length - 1].dur - DURATION) > 1e-6) bad.push('the cues do not add up to DURATION');
  for (const table of [COUNT, COUNT_E]) {
    for (let i = 1; i < table.length; i++) {
      if (table[i][0] <= table[i - 1][0]) bad.push(`signal: time ${table[i][0]} does not follow ${table[i - 1][0]}`);
      if (table[i][1] > table[i - 1][1]) bad.push(`signal: the count rises from ${table[i - 1][1]} to ${table[i][1]} at ${table[i][0]} s`);
    }
  }
  if (COUNT[0][1] !== 90 || COUNT[COUNT.length - 1][1] !== 0) bad.push('signal: the count must run from 90 to 0');
  if (signalAt(T.red).led !== 90) bad.push('signal: the LED must show 90 when the lamp turns red');
  if (signalAt(T.green).lamp !== 'green' || signalAt(T.green - 0.01).lamp !== 'red') bad.push('signal: the lamp must turn green at T.green');
  for (const b of BEATS) for (const s of b.stills) if (!(s >= 0 && s <= DURATION)) bad.push(`beat ${b.id}: still at ${s} s is outside the film`);
  if (bad.length) throw new Error(`film timeline (${locale}): ${bad.length} problem(s)\n  ` + bad.join('\n  '));
}
