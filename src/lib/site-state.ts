// The date-state utility: which state is the money copy in, for a given date and jurisdiction?
//
// One answer for the home money chapter, the timeline (V19), the tile map (V41) and the
// calculator page (blueprint 3.12 and 4.3), so they can never disagree.
//
//   state                when                                  what the copy may say
//   -------------------  ------------------------------------  ---------------------------------------------
//   A-no-city            to 2026-12-31, no city chosen         dates only, never a day count
//   A-city-open          … city has money, quota seen open     "places left (checked D)"
//   A-city-restricted    … only scrappage / named groups left  "only for scrappage or certain groups (checked D)"
//   A-city-unpublished   … programme running, quota not known  "running; remaining places not published"
//   A-city-exhausted     … city money used up                  "ran out on D; central money to 31 December"
//   A-city-ended         … the city's own window has closed    "closed on D; central money to 31 December"
//   A-city-unknown       … we could not verify the city        "we could not check this; ask the bureau"
//   B                    2027-01-01 to the filing deadline     "purchase deadline passed; file by 10 January"
//   C                    after that, nothing confirmed         "ended; N days on, nothing confirmed"
//   D                    a programme starting after 2026 is    "a 2027 programme has been announced (checked D)"
//                        in the registry (any date after 12-31)
//
// HOW A STATIC PAGE AVOIDS SHOWING A STALE STATE
//   1. Build time renders EVERY variant of date-dependent copy, each marked with the phase it is
//      true in: <p data-money-when="A">…</p> <p data-money-when="C">…</p>, plus one
//      data-money-when="static" variant that is true whenever it is read: absolute dates, the
//      date we checked, no day count, no claim that money is still available.
//   2. Base.astro runs three lines before first paint that work out today's date in Taiwan and
//      set <html data-money-phase="A|B|C|D">. CSS (global.css) then shows the matching variant.
//      No JavaScript → no attribute → only the "static" variant shows. There is no flash and no
//      wrong state, however old the build is.
//   3. For anything that needs a number or a city (day counts, a city's status line, the
//      timeline's "N days" counter), src/lib/site-state.client.ts re-evaluates moneyState() in
//      the browser from a small JSON snapshot printed by <MoneySnapshot />, and again when the
//      reader picks a city or returns to a tab left open overnight.
//   4. What the browser cannot know is whether a city's money ran out after the build. So every
//      status carries the date it was checked, `stale` turns on once that is more than
//      STALE_DAYS old, and the copy then says "this may have changed".
//
// Pure TypeScript with no data import: it runs in Astro frontmatter, in Node and in the browser.
// The dataset is always passed in (see ./site-state.data.ts for the build-time snapshot).

import { cmp, daysBetween } from './calc/dates.ts';
import type { EconDataset, JurisdictionId, L10n, Programme, QuotaStatus } from '../data/econ/types.ts';

export type ISODate = string;
export type MoneyPhase = 'A' | 'B' | 'C' | 'D';
export type CityMoney = 'available' | 'restricted' | 'unpublished' | 'exhausted' | 'ended' | 'unknown';
export type MoneyStateId = 'A-no-city' | `A-city-${'open' | 'restricted' | 'unpublished' | 'exhausted' | 'ended' | 'unknown'}` | 'B' | 'C' | 'D';

/** A status more than this many days old is flagged `stale`. */
export const STALE_DAYS = 21;

/** What the state needs from one purchase programme. */
export interface SnapshotLine {
  /** Open to any resident buying new (no scooter to scrap, no named group). */
  general: boolean;
  from: ISODate;
  to: ISODate;
  quota: QuotaStatus;
  asOf: ISODate;
}

export interface CitySnapshot {
  name: L10n;
  /** false = we could not verify this jurisdiction at all (tile state 查不到). */
  verified: boolean;
  checkedOn: ISODate;
  lines: SnapshotLine[];
  /** The registry's own words about the quota that decides the status on the snapshot date. */
  quotaText?: L10n;
  links: { label: L10n; url: string }[];
}

/** Small, serialisable, printed into the page by <MoneySnapshot />. */
export interface MoneySnapshot {
  /** The day the site was built: the oldest "today" this page can honestly assume. */
  builtOn: ISODate;
  /** The day the economics research was last checked. */
  checkedOn: ISODate;
  /** Last day 2026 programmes accept purchases. */
  yearEnd: ISODate;
  /** The usual online-filing deadline (the most common applicationDeadline). */
  filingEnd: ISODate;
  /** A programme that starts after `yearEnd` is in the registry. */
  next: { confirmed: boolean; from?: ISODate };
  cities: Record<string, CitySnapshot>;
}

export interface CityState {
  id: JurisdictionId;
  name: L10n;
  status: CityMoney;
  /** Date the status was observed; for 'exhausted' / 'ended', the date the money stopped. */
  asOf: ISODate;
  /** At least one open line is close to running out. */
  nearly: boolean;
  /** `asOf` is more than STALE_DAYS before `date`: say that it may have changed. */
  stale: boolean;
  quotaText?: L10n;
}

export interface MoneyState {
  id: MoneyStateId;
  phase: MoneyPhase;
  date: ISODate;
  deadline: ISODate;
  filingDeadline: ISODate;
  /** Whole days from `date` to the purchase deadline (0 on the last day; 0 after it). */
  daysLeft: number;
  /** Whole days since the purchase deadline (0 until it has passed). */
  daysSince: number;
  /** Between the purchase deadline and the filing deadline: buyers can still file. */
  filingOpen: boolean;
  /** False once a later programme is in the registry: gate every 「還沒有一項定案」 on this. */
  nothingConfirmed: boolean;
  /**
   * R10: a day count may be shown only with the reader's city status, and only where that city
   * still has money. The calculator adds its own condition (verdict A) on top of this.
   */
  mayShowDayCount: boolean;
  checkedOn: ISODate;
  city?: CityState;
}

// ---------------------------------------------------------------------------
// Snapshot (build time)
// ---------------------------------------------------------------------------

const PURCHASE_KINDS = new Set<Programme['kind']>(['purchase-subsidy', 'top-up', 'scrap-bonus', 'battery-credit']);

/** A line any resident buying new can take: no scooter to scrap, no named group. */
function isGeneral(p: Programme): boolean {
  if (p.kind !== 'purchase-subsidy') return false;
  return p.conditions.every((c) => {
    switch (c.kind) {
      case 'residency':
      case 'ev-plate-class':
      case 'moea-class':
      case 'battery-swap':
      case 'domestic-cells':
        return true;
      case 'age':
        return c.max === undefined && (c.min ?? 0) <= 20;
      case 'household':
        return c.value === false; // exclusions such as "not previously subsidised"
      default:
        return false;
    }
  });
}

function mode(values: string[]): string | undefined {
  const count = new Map<string, number>();
  for (const v of values) count.set(v, (count.get(v) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || cmp(b[0], a[0]))[0]?.[0];
}

const zh = (v: L10n): L10n => ({ 'zh-TW': v['zh-TW'].replaceAll('臺', '台'), en: v.en });

/** Reduce the economics dataset to what the page needs to re-evaluate its state in the browser. */
export function moneySnapshot(data: EconDataset, builtOn: ISODate = todayInTaipei()): MoneySnapshot {
  const yearEnd = data.meta.programmeYearEnd;
  const electric = data.programmes.filter((p) => p.side !== 'gasoline' && PURCHASE_KINDS.has(p.kind) && p.calculator === true);
  const later = electric.filter((p) => cmp(p.validFrom, yearEnd) > 0).sort((a, b) => cmp(a.validFrom, b.validFrom));
  const filingEnd = mode(electric.filter((p) => cmp(p.validTo, yearEnd) <= 0 && p.applicationDeadline).map((p) => p.applicationDeadline!)) ?? yearEnd;

  const cities: MoneySnapshot['cities'] = {};
  for (const j of Object.values(data.jurisdictions)) {
    const own = electric.filter((p) => p.jurisdiction === j.id && cmp(p.validFrom, yearEnd) <= 0);
    const seen = new Set<string>();
    const lines: SnapshotLine[] = [];
    for (const p of own) {
      const line: SnapshotLine = { general: isGeneral(p), from: p.validFrom, to: p.validTo, quota: p.quota.status, asOf: p.quota.asOf };
      const key = JSON.stringify(line);
      if (!seen.has(key)) seen.add(key), lines.push(line);
    }
    const deciding = own.find((p) => p.quota.status === 'exhausted') ?? own.find((p) => isGeneral(p)) ?? own[0];
    cities[j.id] = {
      name: zh(j.name),
      verified: j.status !== 'not-verified' && lines.length > 0,
      checkedOn: j.checkedOn,
      lines,
      quotaText: deciding ? zh(deciding.quota.text) : undefined,
      links: j.officialLinks.map((l) => ({ label: zh(l.label), url: l.url })),
    };
  }
  return { builtOn, checkedOn: data.meta.checkedOn, yearEnd, filingEnd, next: { confirmed: later.length > 0, from: later[0]?.validFrom }, cities };
}

/** The snapshot without the tile map's texts and links: what <MoneySnapshot /> prints (about 4 kB). */
export function slimSnapshot(snap: MoneySnapshot): MoneySnapshot {
  return { ...snap, cities: Object.fromEntries(Object.entries(snap.cities).map(([id, c]) => [id, { name: c.name, verified: c.verified, checkedOn: c.checkedOn, lines: c.lines, links: [] }])) };
}

// ---------------------------------------------------------------------------
// State (build time and browser)
// ---------------------------------------------------------------------------

/** Today's date in Taiwan (UTC+8, no daylight saving), as 'YYYY-MM-DD'. */
export function todayInTaipei(now?: Date): ISODate {
  return new Date((now ? now.getTime() : Date.now()) + 8 * 3_600_000).toISOString().slice(0, 10);
}

const KNOWN_OPEN: QuotaStatus[] = ['unlimited', 'available', 'limited', 'nearly-exhausted'];
const latest = (dates: ISODate[]): ISODate => dates.reduce((a, b) => (cmp(a, b) >= 0 ? a : b));
const earliest = (dates: ISODate[]): ISODate => dates.reduce((a, b) => (cmp(a, b) <= 0 ? a : b));

/** A city's own money on a date (central money is separate and runs to the year end). */
export function cityMoney(id: JurisdictionId, date: ISODate, snap: MoneySnapshot): CityState {
  const c = snap.cities[id];
  const base = { id, name: c.name, nearly: false, quotaText: c.quotaText };
  const stale = (asOf: ISODate) => daysBetween(asOf, date) > STALE_DAYS;
  if (!c.verified) return { ...base, status: 'unknown', asOf: c.checkedOn, stale: stale(c.checkedOn), quotaText: undefined };

  const started = c.lines.filter((l) => cmp(l.from, date) <= 0);
  const inWindow = started.filter((l) => cmp(date, l.to) <= 0);
  if (inWindow.length === 0) {
    const closed = latest(c.lines.map((l) => l.to));
    return { ...base, status: 'ended', asOf: closed, stale: false, quotaText: undefined };
  }
  // the engine's rule (purchase.ts): an exhausted line stops counting from its asOf date
  const open = inWindow.filter((l) => !(l.quota === 'exhausted' && cmp(date, l.asOf) >= 0));
  if (open.length === 0) {
    const ranOut = latest(inWindow.map((l) => l.asOf));
    return { ...base, status: 'exhausted', asOf: ranOut, stale: false };
  }
  const general = open.filter((l) => l.general);
  const pool = general.length ? general : open;
  // a line marked exhausted that is still in `open` had not run out yet on `date`
  const known = pool.filter((l) => KNOWN_OPEN.includes(l.quota) || l.quota === 'exhausted');
  const deciding = known.length ? known : pool;
  // the oldest observation among the lines we rely on: the claim is only as fresh as that
  const asOf = earliest(deciding.map((l) => l.asOf));
  const status: CityMoney = known.length === 0 ? 'unpublished' : general.length ? 'available' : 'restricted';
  return { ...base, status, asOf, nearly: deciding.some((l) => l.quota === 'nearly-exhausted'), stale: stale(asOf), quotaText: status === 'available' && general.length ? c.quotaText : undefined };
}

/** Phase from the date alone: what Base's pre-paint script computes. Keep the two in step. */
export function moneyPhase(date: ISODate, snap: Pick<MoneySnapshot, 'yearEnd' | 'filingEnd' | 'next'>): MoneyPhase {
  if (cmp(date, snap.yearEnd) <= 0) return 'A';
  if (snap.next.confirmed) return 'D';
  return cmp(date, snap.filingEnd) <= 0 ? 'B' : 'C';
}

/** The state of the money copy for a date and (optionally) the reader's jurisdiction. */
export function moneyState(date: ISODate, city: JurisdictionId | null | undefined, snap: MoneySnapshot): MoneyState {
  const phase = moneyPhase(date, snap);
  const cityState = city && snap.cities[city] ? cityMoney(city, date, snap) : undefined;
  const cityId = { available: 'open', restricted: 'restricted', unpublished: 'unpublished', exhausted: 'exhausted', ended: 'ended', unknown: 'unknown' } as const;
  const id: MoneyStateId = phase !== 'A' ? phase : cityState ? `A-city-${cityId[cityState.status]}` : 'A-no-city';
  const before = cmp(date, snap.yearEnd) <= 0;
  return {
    id,
    phase,
    date,
    deadline: snap.yearEnd,
    filingDeadline: snap.filingEnd,
    daysLeft: before ? daysBetween(date, snap.yearEnd) : 0,
    daysSince: before ? 0 : daysBetween(snap.yearEnd, date),
    filingOpen: !before && cmp(date, snap.filingEnd) <= 0,
    nothingConfirmed: !snap.next.confirmed,
    mayShowDayCount: phase === 'A' && !!cityState && (cityState.status === 'available' || cityState.status === 'restricted') && !cityState.stale,
    checkedOn: snap.checkedOn,
    city: cityState,
  };
}

/** The four tile-map states (V41) plus 'unpublished', from a city's money status. */
export type TileState = 'available' | 'restricted' | 'unpublished' | 'exhausted' | 'unknown';
export const tileState = (status: CityMoney): TileState => (status === 'ended' ? 'exhausted' : status);

/** The pre-paint script Base inlines: sets <html data-money-phase>. Mirrors moneyPhase(). */
export function prePaintScript(snap: Pick<MoneySnapshot, 'yearEnd' | 'filingEnd' | 'next'>): string {
  const q = (s: string) => JSON.stringify(s);
  return `(function(){try{var t=new Date(Date.now()+288e5).toISOString().slice(0,10);document.documentElement.dataset.moneyPhase=t<=${q(snap.yearEnd)}?'A':${snap.next.confirmed ? "'D'" : `t<=${q(snap.filingEnd)}?'B':'C'`}}catch(e){}})()`;
}

/** 'YYYY-MM-DD' → "12 月 31 日" / "31 December" (with the year when `withYear`). */
export function formatDate(d: ISODate, locale: 'zh-TW' | 'en', withYear = false): string {
  const [y, m, day] = d.split('-').map(Number);
  if (locale === 'zh-TW') return `${withYear ? `${y} 年 ` : ''}${m} 月 ${day} 日`;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${day} ${months[m - 1]}${withYear ? ` ${y}` : ''}`;
}
