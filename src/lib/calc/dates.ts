// Date arithmetic on 'YYYY-MM-DD' strings, in UTC, with no dependencies.
//
// Every date the engine handles is a calendar date in Taiwan (UTC+8, no daylight saving). A
// browser in another time zone must not turn "today" into yesterday or tomorrow, so callers that
// need today's date use `todayInTaiwan()`, and `taiwanDate()` turns an instant (a Date or an ISO
// timestamp with a time zone) into the Taiwan calendar date.

const DAY = 86_400_000;
const TAIWAN_OFFSET_MS = 8 * 3_600_000;

/** Days in a month (1–12) of a year, by the Gregorian calendar. */
export function daysInMonth(y: number, mo: number): number {
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

function parts(d: string): [number, number, number] {
  const m = typeof d === 'string' ? /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(d) : null;
  if (!m) throw new Error(`[calc] Bad date "${d}" (expected YYYY-MM-DD or YYYY-MM)`);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) throw new Error(`[calc] Bad date "${d}" (month must be 01–12)`);
  // A bare month means its last day (a scooter "built in 2003-12" is built by 2003-12-31).
  const last = daysInMonth(y, mo);
  const day = m[3] ? Number(m[3]) : last;
  if (day < 1 || day > last) throw new Error(`[calc] Bad date "${d}" (day must be 01–${last} in that month)`);
  return [y, mo, day];
}

/** True when `d` is a real calendar date written 'YYYY-MM-DD' (or 'YYYY-MM' when `allowMonth`). */
export function isCalendarDate(d: unknown, allowMonth = false): d is string {
  if (typeof d !== 'string' || (!allowMonth && !/^\d{4}-\d{2}-\d{2}$/.test(d))) return false;
  try {
    parts(d);
    return true;
  } catch {
    return false;
  }
}

/** Normalise 'YYYY-MM' to its last day; validate 'YYYY-MM-DD'. */
export function normalise(d: string): string {
  const [y, m, day] = parts(d);
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toTime(d: string): number {
  const [y, m, day] = parts(d);
  return Date.UTC(y, m - 1, day);
}

/** Whole days from a to b (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toTime(b) - toTime(a)) / DAY);
}

/** Full years from `from` to `to` (age on a date). */
export function fullYears(from: string, to: string): number {
  const [y1, m1, d1] = parts(from);
  const [y2, m2, d2] = parts(to);
  let years = y2 - y1;
  if (m2 < m1 || (m2 === m1 && d2 < d1)) years -= 1;
  return years;
}

export const cmp = (a: string, b: string): number => toTime(a) - toTime(b);
export const onOrBefore = (a: string, b: string): boolean => cmp(a, b) <= 0;
/** The earlier of two dates. */
export const earlier = (a: string, b: string): string => (cmp(a, b) <= 0 ? a : b);

/** The first day of the month `n` months after `d`'s month. */
export function addMonths(d: string, n: number): string {
  const [y, m] = parts(d);
  const dt = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

/** The calendar date in Taiwan (UTC+8) at an instant, as 'YYYY-MM-DD'. */
export function taiwanDate(at: Date | number): string {
  const ms = typeof at === 'number' ? at : at.getTime();
  if (!Number.isFinite(ms)) throw new Error('[calc] Bad instant (not a finite time)');
  return new Date(ms + TAIWAN_OFFSET_MS).toISOString().slice(0, 10);
}

/** Today's date in Taiwan, whatever time zone the caller's clock is in. */
export function todayInTaiwan(now: Date = new Date()): string {
  return taiwanDate(now);
}

/**
 * Read an evaluation date. A plain 'YYYY-MM-DD' is already a Taiwan calendar date and is kept as
 * it is (after validation). A timestamp with a time or zone ('2026-12-31T17:30:00Z',
 * '2027-01-01T01:30+08:00') is an instant and becomes the date in Taiwan at that instant.
 */
export function evaluationDate(input: string): string {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(input)) {
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(input)) throw new Error(`[calc] Bad date "${input}" (a timestamp needs a time zone, e.g. Z or +08:00)`);
    const ms = Date.parse(input);
    if (!Number.isFinite(ms)) throw new Error(`[calc] Bad date "${input}"`);
    return taiwanDate(ms);
  }
  return normalise(input);
}
