/**
 * film-data.ts — where the film's words meet its numbers. Build time only.
 *
 * It joins the captions (src/i18n/pages/film.ts) with the slots they name:
 *   - the estimate slots, with the science team's rounding (src/data/estimate.ts);
 *   - the money tables (src/lib/home-money.ts): the default case, the least favourable case,
 *     the running cost at the default distance;
 *   - shared words (src/i18n/ui.ts): chip names, the K sentence of the health beat.
 * and runs the timeline's guard over the result, so a caption that outgrows its time on
 * screen, or a slot that is missing, stops the build.
 *
 * NO NUMBER IS TYPED HERE OR IN film.ts. If a slot cannot be read this module throws.
 *
 * Money changes on fixed dates (a promotion ends, a programme year ends). `filmData(locale)`
 * is the film for one date; `filmPeriods(locale)` is the money part for every coming date on
 * which a figure changes, so a cached page can pick today's; `filmData(locale, { asChecked })`
 * is the film as of the day the prices were last checked, which is what the MP4 shows.
 *
 * Loadable by plain Node (scripts/film-export.mjs): relative imports with the .ts extension.
 */
import film from '../../../i18n/pages/film.ts';
import { chips, chipWhere, illustration, kSentences, money as ntd, readerDate } from '../../../i18n/ui.ts';
import { est, estimateText, formatEstimate, formatReference, time } from '../../../data/estimate.ts';
import { HOME_KM, homeMoney, homeMoneyTimeline, plateName, type BuyCase, type HomeMoney } from '../../../lib/home-money.ts';
import { formatDate } from '../../../lib/site-state.ts';
import { chipGlyphSvg } from '../../ui/kinds.ts';
import { STROLLER_BAND } from '../../art/parts.ts';
import { CUES, DURATION, DURATION_MINUTES, checkTimeline, type CueId } from './timeline.ts';
import { SCOOTERS_DRAWN } from './scene.ts';
import type { HudText } from './hud.ts';

export type Locale = 'zh-TW' | 'en';
type L10n = { 'zh-TW': string; en: string };
/** The chip ids of brief 4.1 that a caption or a transcript line can carry. */
export type FilmChip = 'measured' | 'estimate' | 'official' | 'study' | 'derived';

const fill = (s: string, vars: Record<string, string | number>): string =>
  s.replace(/\{(\w+)\}/g, (_m, k: string) => {
    if (vars[k] === undefined || vars[k] === null || vars[k] === '') throw new Error(`film: no value for {${k}} in "${s}"`);
    return String(vars[k]);
  });
const need = <T>(v: T | null | undefined, slot: string): T => {
  if (v === null || v === undefined || (typeof v === 'number' && !Number.isFinite(v))) throw new Error(`film: the slot ${slot} is missing`);
  return v;
};
const int = (n: number, locale: Locale): string => new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: 0 }).format(Math.round(n));

export interface Caption {
  id: CueId;
  /** start and length, seconds */
  t: number;
  dur: number;
  main: string;
  /** the quiet line under it */
  note?: string;
  /** a chip printed beside the quiet line (the hours a year are 本站計算) */
  chip?: { kind: FilmChip; label: string; glyph: string };
}

/** The part of the film that depends on the date. */
export interface MoneyPart {
  /** the day the figures are for, and the day the prices were last checked */
  date: string;
  checkedOn: string;
  money: HudText['money'];
  /** the captions of the two money cues */
  cues: { tags: { main: string; note?: string }; monthly: { main: string; note?: string } };
  /** every figure, for the export's manifest */
  key: string;
}

export interface FilmData {
  locale: Locale;
  /** seconds; the slot `film.duration` */
  duration: number;
  text: HudText;
  captions: Caption[];
  money: MoneyPart;
  /** slots the transcript and the sheets print */
  slots: {
    red: number;
    drawn: number;
    scenario: string;
    hours: { lo: number; hi: number };
    band: { lo: number; hi: number };
    coAdded: string;
    coStreet: string;
  };
}

/* ------------------------------------------------------------------------ */
/* Money                                                                      */
/* ------------------------------------------------------------------------ */

function tagOf(c: BuyCase, locale: Locale, worst = false): HudText['money']['tags'][number] {
  const t = film.hud.tag;
  const where = (worst ? t.worst[locale] : '') + fill(t.where[locale], {
    county: need(c.countyName as L10n, 'money.buy.countyName')[locale].replace(/市$|縣$| City$| County$/, ''),
    scrap: (c.scrap === 'yes' ? t.scrap : t.noScrap)[locale],
  });
  const tone = c.verdict === 'cheaper' ? 'less' : c.verdict === 'dearer' ? 'more' : 'same';
  const [before, after] = t[tone][locale].split('{amount}');
  return { where, before: before.trim(), amount: ntd(Math.abs(need(c.difference, 'money.buy.difference')), locale), after: (after ?? '').trim(), tone, plate: plateName(c.plate, locale), plateClass: c.plate };
}

function moneyPart(m: HomeMoney, locale: Locale): MoneyPart {
  const km = m.defaults.km;
  if (!HOME_KM.includes(km)) throw new Error(`film: money.month has no table for ${km} km`);
  const first = need(m.buy[m.defaults.county]?.[m.defaults.scrap], 'money.buy[default]');
  const worst = need(m.worst, 'money.worst');
  const month = need(m.month[km], `money.month[${km}]`);
  const petrol = Math.round(need(month.petrol.monthly.typical, 'money.month.petrol'));
  const lo = Math.round(need(month.home.typical.lo, 'money.month.home.lo'));
  const hi = Math.round(need(month.home.typical.hi, 'money.month.home.hi'));

  // beat 23, by rule: is any case in the table cheaper, is any dearer?
  const all = [...Object.values(m.buy), ...Object.values(m.buyWhite)].flatMap((byScrap) => Object.values(byScrap));
  const cheaper = all.some((c) => c.verdict === 'cheaper');
  const dearer = all.some((c) => c.verdict === 'dearer');
  const c = film.cues;
  const rule = cheaper && dearer ? 'mixed' : cheaper ? 'cheaper' : dearer ? 'dearer' : 'same';
  const tagsCue: { main: string; note?: string } = { main: c.tags[rule][locale] };
  if (rule === 'dearer' && m.strip.kind === 'nothing-confirmed') tagsCue.note = fill(c.tags.nothingConfirmed[locale], { year: m.date.slice(0, 4) });

  const monthly = {
    main: lo === hi ? fill(c.monthly.mainOne[locale], { lo: int(lo, locale) }) : fill(c.monthly.main[locale], { lo: int(lo, locale), hi: int(hi, locale) }),
    note: fill(c.monthly.note[locale], { petrol: int(petrol, locale), km: int(km, locale) }),
  };
  const b = film.hud.bars;
  const tags = [tagOf(first, locale), tagOf(worst, locale, true)];
  const moneyText: HudText['money'] = {
    tags,
    chip: fill(film.hud.checked[locale], { kind: chips.derived.label[locale], date: formatDate(m.checkedOn, locale, m.checkedOn.slice(0, 4) !== m.date.slice(0, 4)) }),
    perMonth: fill(film.hud.perMonth[locale], { km: int(km, locale) }),
    bars: [
      { label: b.petrol[locale], value: fill(b.about[locale], { amount: ntd(petrol, locale) }), amount: petrol },
      { label: b.home[locale], value: lo === hi ? fill(b.about[locale], { amount: ntd(lo, locale) }) : fill(b.range[locale], { lo: locale === 'en' ? ntd(lo, locale) : int(lo, locale), hi: ntd(hi, locale) }), amount: hi },
    ],
  };
  return { date: m.date, checkedOn: m.checkedOn, money: moneyText, cues: { tags: tagsCue, monthly }, key: JSON.stringify([tags, moneyText.bars, moneyText.chip, tagsCue, monthly]) };
}

/* ------------------------------------------------------------------------ */
/* The film for one date                                                      */
/* ------------------------------------------------------------------------ */

function captionsOf(locale: Locale, part: MoneyPart): Caption[] {
  const c = film.cues;
  // the default of home screen 7 (four reds a day), so film and home print the same yearly figure
  const hours = need(time.hoursPerYear[4], 'time.hoursPerYear.4');
  const red = need(est.signal.redLength_s, 'signal.redLength_s');
  const derived = { kind: 'derived' as const, label: chips.derived.label[locale], glyph: chipGlyphSvg('derived') };
  const text: Record<CueId, { main: string; note?: string; chip?: Caption['chip'] }> = {
    smell: { main: c.smell.main[locale], note: fill(c.smell.note[locale], { red }) },
    arrive: { main: c.arrive.main[locale] },
    waiting: { main: c.waiting.main[locale] },
    knee: { main: c.knee.main[locale] },
    keeps: { main: c.keeps.main[locale] },
    howMuch: { main: c.howMuch.main[locale] },
    co: { main: c.co.main[locale] },
    fuel: { main: c.fuel.main[locale], note: c.fuel.note[locale] },
    specks: { main: c.specks.main[locale] },
    mask: { main: c.mask.main[locale] },
    under: { main: c.under.main[locale] },
    child: { main: c.child.main[locale] },
    rider: { main: c.rider.main[locale] },
    daily: { main: c.daily.main[locale], note: fill(c.daily.note[locale], { lo: hours.lo, hi: hours.hi }), chip: derived },
    years: { main: c.years.main[locale], note: c.years.note[locale] },
    linked: { main: c.linked.main[locale], note: kSentences.K5film[locale] },
    nearly: { main: c.nearly.main[locale] },
    green: { main: c.green.main[locale] },
    thins: { main: c.thins.main[locale] },
    again: { main: c.again.main[locale] },
    electric: { main: c.electric.main[locale] },
    noLayer: { main: c.noLayer.main[locale], note: c.noLayer.note[locale] },
    cost: { main: c.cost.main[locale] },
    tags: part.cues.tags,
    monthly: { ...part.cues.monthly, chip: derived },
    end: { main: c.end.main[locale] },
  };
  checkTimeline(text, locale);
  return CUES.map((q) => ({ id: q.id, t: q.t, dur: q.dur, ...text[q.id] }));
}

const memo = new Map<string, FilmData>();

/**
 * The film in one language.
 *   date       a Taiwan calendar day (default: today in Taiwan)
 *   asChecked  the film as of the day the prices were last checked: what the MP4 shows, so the
 *              file only goes out of date when the prices are checked again
 */
export function filmData(locale: Locale, o: { date?: string; asChecked?: boolean } = {}): FilmData {
  const date = o.asChecked ? homeMoney(o.date).checkedOn : o.date;
  const m = homeMoney(date);
  const key = `${locale}|${m.date}`;
  const hit = memo.get(key);
  if (hit) return hit;

  if (est.scn.dozen.drawn !== SCOOTERS_DRAWN) throw new Error(`film: the picture draws ${SCOOTERS_DRAWN} scooters but scn.dozen.drawn is ${est.scn.dozen.drawn}`);
  const coAdded = formatEstimate('co.dozen.add', locale);
  if (coAdded.kind !== 'estimate') throw new Error('film: co.dozen.add is not an estimate');
  const coStreet = formatReference(need(est.bg.co.traffic.shown, 'bg.co.traffic'), 'ppm', locale);
  const part = moneyPart(m, locale);
  const h = film.hud;
  const text: HudText = {
    scooters: h.scooters[locale],
    fast: h.fast[locale],
    cm: h.cm[locale],
    petrol: h.petrol[locale],
    electric: h.electric[locale],
    panel: {
      added: fill(h.added[locale], { added: estimateText.addedByPack[locale] }),
      addedValue: coAdded.text,
      estimate: chips.estimate.label[locale],
      street: estimateText.alreadyThere[locale],
      streetValue: coStreet,
      measured: chips.measured.label[locale],
      addedElectric: h.addedElectric[locale],
      zero: h.zero[locale],
      // a locale-neutral path: the page turns it into an href with href()
      howHref: `/estimate/#${coAdded.anchor ?? 'numbers'}`,
      how: film.player.how[locale],
    },
    money: part.money,
    glyphs: { estimate: chipGlyphSvg('estimate'), measured: chipGlyphSvg('measured') },
  };
  const data: FilmData = {
    locale,
    duration: DURATION,
    text,
    captions: captionsOf(locale, part),
    money: part,
    slots: {
      red: est.signal.redLength_s,
      drawn: est.scn.dozen.drawn,
      scenario: est.scn.dozen.longName[locale],
      hours: { lo: time.span.lo, hi: time.span.hi },
      band: { lo: STROLLER_BAND.low, hi: STROLLER_BAND.high },
      coAdded: coAdded.text,
      coStreet,
    },
  };
  memo.set(key, data);
  return data;
}

let timeline: ReturnType<typeof homeMoneyTimeline> | null = null;
/**
 * The money part for today and for each coming date on which a figure changes, oldest first.
 * The player picks the one that is true on the reader's day (the last whose `from` has come).
 * Every one of them has passed the caption guard.
 */
export function filmPeriods(locale: Locale): { from: string; part: MoneyPart }[] {
  timeline ??= homeMoneyTimeline();
  const out: { from: string; part: MoneyPart }[] = [];
  for (const p of timeline) {
    const part = moneyPart(p.money, locale);
    captionsOf(locale, part); // the guard
    if (!out.length || out[out.length - 1].part.key !== part.key) out.push({ from: p.from, part });
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* Small things other lanes read                                              */
/* ------------------------------------------------------------------------ */

/** 看短片（約 2 分鐘） / Watch the film (about 2 minutes): the home page's button, with the length read from the timeline. */
export const filmPlayLabel = (locale: Locale): string => fill(film.hero.playLong[locale], { min: DURATION_MINUTES });
/** 全片 2 分 1 秒・沒有聲音・有字幕 */
export const filmLengthLabel = (locale: Locale): string => fill(film.player.length[locale], { min: Math.floor(DURATION / 60), sec: Math.floor(DURATION % 60) });
/** The words of the two illustration tags, for the player. */
export const filmTags = (locale: Locale): { street: string; body: string } => ({ street: illustration.tag[locale], body: illustration.body[locale] });
/** 長期・所有車輛: the qualifier of the health beat's chip. */
export const healthWhere = (locale: Locale): string => chipWhere.longTermAllTraffic[locale];
export { readerDate };
