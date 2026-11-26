// Helpers shared by /questions/ and its pages (lane H, redesign brief 7.5).
//
// Everything a question page prints about the world comes through here: the order of the
// questions, the picture and chip of each, and every number, read from the signed estimate
// (src/data/estimate.ts) or the fact registry (src/data/facts*.ts). A corrected fact corrects the
// page; a missing value stops the build. Server-side only (it pulls the registry).

import type { Locale } from '@/i18n';
import { href } from '@/i18n';
import { num, readerText, typeset, type ChipKind } from '@/i18n/ui';
import { fill } from '@/i18n/pages/_copy';
import { est, time, dose, waitPerRed_s, type RedsPerDay } from '@/data/estimate';
import { facts, localizeFact, type FactId } from '@/data/facts';
import { getSource, type SourceId } from '@/data/sources';
import questions from '@/i18n/pages/questions';

export type Slug = keyof typeof questions.items;

/** The seven questions, in the order the home page tells the story (brief 3.2). */
export const slugs = ['smell', 'beside-me', 'app', 'one-red-light', 'my-child', 'rider', 'mask'] as const satisfies readonly Slug[];
{
  const missing = (Object.keys(questions.items) as Slug[]).filter((s) => !(slugs as readonly string[]).includes(s));
  if (missing.length || slugs.length !== 7) throw new Error(`[questions] the order list and the copy disagree: ${missing.join(', ')}`);
}

/** Question pages that moved; each is a redirect page of its own (brief section 2). */
export const moved = { 'how-much': '/estimate/', electric: '/electric/' } as const;

/** The chip an index card carries: the kind of answer the page gives (brief 7.5). */
export const cardChip: Record<Slug, { kind: ChipKind; fact?: FactId }> = {
  smell: { kind: 'derived' },
  'beside-me': { kind: 'measured', fact: 'iot-setback-measured' },
  app: { kind: 'measured', fact: 'taipei-roadside-co-2024' },
  'one-red-light': { kind: 'derived' },
  'my-child': { kind: 'study', fact: 'child-air-per-kg' },
  rider: { kind: 'measured', fact: 'commute-scooter-vs-subway-chuang2020' },
  mask: { kind: 'study', fact: 'mask-asworn-vandersande' },
};

export const plain = (s: string): string => s.replaceAll('|', '');
export const questionHref = (slug: Slug, locale: Locale): string => href(`/questions/${slug}/`, locale);

/** The question after this one, or the calculator after the last (the page's final button). */
export function nextQuestion(slug: Slug, locale: Locale): { label: string; href: string; primary: boolean } {
  const i = slugs.indexOf(slug);
  const next = slugs[i + 1];
  if (!next) return { label: questions.page.afterLast[locale], href: href('/electric/', locale), primary: true };
  return { label: fill(questions.page.next[locale], { q: plain(questions.items[next].q[locale]) }), href: questionHref(next, locale), primary: false };
}

// ---- numbers ------------------------------------------------------------------------------

const datum = (id: FactId, key: string): number => {
  const d = facts[id]?.data?.[key];
  if (!d || !Number.isFinite(d.value)) throw new Error(`[questions] fact ${id} has no data.${key}`);
  return d.value;
};
const sourceYear = (id: SourceId): number => {
  const y = getSource(id).year;
  if (!y) throw new Error(`[questions] source ${id} has no year`);
  return y;
};
/**
 * A figure the registry states in a fact's sentence but does not hold as a data value (the five
 * minutes and the 55 people of the Kaohsiung study). Read from the Chinese statement, so the
 * page cannot drift from the registry: if the sentence changes, the build stops here.
 */
const stated = (id: FactId, pattern: RegExp): number => {
  const m = pattern.exec(facts[id].statement['zh-TW']);
  if (!m) throw new Error(`[questions] fact ${id} no longer states ${pattern}`);
  return Number(m[1]);
};

/**
 * Every {token} the copy in src/i18n/pages/questions.ts may use, formatted for one language.
 * One table for all seven pages, so the same fact prints the same way everywhere.
 */
export function questionNumbers(locale: Locale): Record<string, string> {
  const n = (v: number, d = 2) => num(v, locale, d);
  const fixed = (v: number, d: number) => new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  return {
    // the red light and the station
    red: n(est.signal.redLength_s),
    inletLo: n(datum('taipei-roadside-co-2024', 'inletLow')),
    inletHi: n(datum('taipei-roadside-co-2024', 'inletHigh')),
    coYear: String(est.meas.taipei.co.year),
    pmLo: n(est.meas.iot.pm25.lo),
    pmHi: n(est.meas.iot.pm25.hi),
    pmBg: n(est.bg.pm25.shown),
    peakSites: n(est.meas.iot.co.peakSites),
    // standing back
    a: fixed(datum('iot-setback-measured', 'reductionA'), 2),
    b: fixed(datum('iot-setback-measured', 'reductionB'), 2),
    // the smell: the threshold is held in ppm; the page says parts in a billion
    acetaldehyde: n(datum('odour-thresholds', 'acetaldehyde') * 1000),
    // time
    minutes: n(stated('lung2025-peaks-hrv', /(\d+)\s*分鐘的\s*PM2\.5\s*高峰/)),
    people: n(stated('lung2025-peaks-hrv', /高雄（(\d+)\s*人）/)),
    hours: n(datum('mccreanor2007-london-walk', 'exposureHours')),
    asthma: n(datum('mccreanor2007-london-walk', 'participants')),
    studies: n(datum('hei-sr23-trap-associations', 'studies')),
    heiYear: String(sourceYear('hei-sr23-2022')),
    secLo: n(waitPerRed_s.lo),
    secHi: n(waitPerRed_s.hi),
    days: n(365),
    share: n(dose.dayShare.underPct),
    // children
    childLo: n(est.child.airPerKg.lo),
    childHi: n(est.child.airPerKg.hi),
    carsonYear: String(sourceYear('carson-2026-erh')),
    // riders
    chuangYear: String(sourceYear('chuang-2020-aeax')),
    scooter: fixed(est.commute.pm25.scooter, 1),
    walking: fixed(est.commute.pm25.walking, 1),
    bus: fixed(est.commute.pm25.bus, 1),
    car: fixed(est.commute.pm25.car, 1),
    metro: fixed(est.commute.pm25.metro, 1),
    // masks
    molYear: String(sourceYear('mol-2005-carbon-mask-test')),
    molTested: n(datum('mask-carbon-mol-2005', 'tested')),
    molMinutes: n(datum('mask-carbon-mol-2005', 'standardMinutes')),
    iloshYear: String(sourceYear('ilosh-2023-earloop-n95')),
    iloshPeople: n(datum('mask-ilosh-taiwan', 'subjects')),
    headband: fixed(datum('mask-ilosh-taiwan', 'headbandN95'), 1),
    earloop: fixed(datum('mask-ilosh-taiwan', 'earloopN95'), 1),
    medical: fixed(datum('mask-ilosh-taiwan', 'medical'), 1),
    fitPassed: n(datum('mask-ilosh-taiwan', 'earloopFitPassed')),
  };
}

/**
 * Fill a copy string's {tokens} from questionNumbers(), plus any the caller adds (the lo/hi of
 * the sentence at hand). An unknown or empty token stops the build: nothing prints a blank.
 */
export function filler(locale: Locale) {
  const base = questionNumbers(locale);
  return (text: string, extra: Record<string, string | number> = {}): string => {
    const vars: Record<string, string | number> = { ...base, ...extra };
    const out = text.replace(/\{(\w+)\}/g, (_m, k: string) => {
      const v = vars[k];
      if (v === undefined || v === '' || /undefined|NaN/.test(String(v))) throw new Error(`[questions] no value for {${k}} in: ${text}`);
      return String(v);
    });
    return typeset(out, locale);
  };
}

/** Hours a year at red lights, for the stepper's three sentences (time.hoursPerYear). */
export const yearHours = (reds: RedsPerDay, locale: Locale) => ({ lo: num(time.hoursPerYear[reds].lo, locale), hi: num(time.hoursPerYear[reds].hi, locale) });

/** A registry fact's own sentences for a sheet, in reader-facing form (台, spaced digits). */
export function factText(id: FactId, locale: Locale): { statement: string; caveat: string } {
  const f = localizeFact(id, locale);
  return { statement: typeset(readerText(f.statement), locale), caveat: f.caveat ? typeset(readerText(f.caveat), locale) : '' };
}
