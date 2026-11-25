// Date arithmetic on 'YYYY-MM-DD' strings, in UTC, with no dependencies.

const DAY = 86_400_000;

function parts(d: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(d);
  if (!m) throw new Error(`[calc] Bad date "${d}" (expected YYYY-MM-DD or YYYY-MM)`);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  // A bare month means its last day (a scooter "built in 2003-12" is built by 2003-12-31).
  const day = m[3] ? Number(m[3]) : new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return [y, mo, day];
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

/** The first day of the month `n` months after `d`'s month. */
export function addMonths(d: string, n: number): string {
  const [y, m] = parts(d);
  const dt = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-01`;
}
