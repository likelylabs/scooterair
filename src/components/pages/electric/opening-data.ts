// The figures behind the opening of /electric/ (brief 7.7): the reader's own after-subsidy price
// and monthly running cost, for every county, scrapping answer and distance, for each coming date
// on which a sum changes. Built at build time from src/lib/home-money.ts (the calculator engine);
// printed into the page as JSON in one language, and read by ./opening-view.ts on both sides.
//
// Nothing here types a figure: every number is the engine's, and every word is from
// src/i18n/pages/electric.ts (open.*) or the dataset's own names.

import { DEFAULTS, HOME_KM, homeMoneyTimeline, stripOf, stripText, plateName, type BuyCase, type HomeKm, type HomeMoney, type ScrapKey } from '../../../lib/home-money.ts';
import { formatDate } from '../../../lib/site-state.ts';
import { readerText } from '../../../i18n/ui.ts';
import type { Locale } from '../../../i18n/pages/_copy.ts';
import type { JurisdictionId } from '../../../data/econ/types.ts';
import type { OpenCase, OpenData, OpenTable } from './opening-view.ts';

/** A cached page must still be right this many days after the build (the site rebuilds nightly). */
const LOOK_AHEAD_DAYS = 45;

const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

function table(m: HomeMoney, locale: Locale, word: (s: string) => number): OpenTable {
  const caseOf = (c: BuyCase): OpenCase => ({
    e: c.electric.net,
    el: c.electric.listPrice,
    g: c.gasoline.net,
    gl: c.gasoline.listPrice,
    d: c.difference,
    v: c.verdict,
    en: word(readerText(c.electric.name[locale])),
    gn: word(readerText(c.gasoline.name[locale])),
    p: word(plateName(c.plate, locale)),
    sub: c.electric.lines.some((l) => l.kind === 'subsidy' || l.kind === 'recycling'),
    eLines: c.electric.lines.map((l) => [word(readerText(l.label[locale])), l.amount, l.isMaximum ? 1 : 0]),
    gLines: c.gasoline.lines.map((l) => [word(readerText(l.label[locale])), l.amount, l.isMaximum ? 1 : 0]),
    strip: word(stripText(stripOf(c), locale)),
  });
  const ids = m.counties.map((c) => c.id);
  const buy = {} as OpenTable['buy'];
  const be = {} as OpenTable['be'];
  for (const id of ids) {
    buy[id] = { yes: caseOf(m.buy[id].yes), no: caseOf(m.buy[id].no) };
    be[id] = { yes: {} as Record<HomeKm, OpenTable['be'][JurisdictionId]['yes'][HomeKm]>, no: {} as Record<HomeKm, OpenTable['be'][JurisdictionId]['yes'][HomeKm]> };
    for (const s of ['yes', 'no'] as ScrapKey[])
      for (const km of HOME_KM) {
        const b = m.breakeven[id][s][km];
        be[id][s][km] = { k: b.kind, ...(b.months !== undefined ? { m: b.months } : {}), gap: b.purchaseGap, save: Math.round(b.monthlySaving), n: word(readerText(b.name[locale])) };
      }
  }
  const month = {} as OpenTable['month'];
  for (const km of HOME_KM) {
    const x = m.month[km];
    month[km] = { petrol: x.petrol.monthly.typical, homeLo: x.home.typical.lo, homeHi: x.home.typical.hi, plan: x.swapPlan.monthly.typical, payg: x.swapPayg.monthly.typical };
  }
  return {
    buy,
    be,
    month,
    worst: { county: m.worst.county, scrap: m.worst.scrap, plate: word(plateName(m.worst.plate, locale)), d: m.worst.difference },
    checked: formatDate(m.checkedOn, locale, true),
  };
}

const memo = new Map<string, OpenData>();

/**
 * Every figure the opening can show, in one language: the tables of each period from `from`
 * (default today in Taiwan) to LOOK_AHEAD_DAYS later, identical tables stored once.
 */
export function openingData(locale: Locale, from?: string): OpenData {
  const key = `${locale}|${from ?? ''}`;
  if (memo.has(key)) return memo.get(key)!;
  const periods = homeMoneyTimeline(from ? { from } : {});
  const start = periods[0].from;
  const until = addDays(start, LOOK_AHEAD_DAYS);
  const words: string[] = [];
  const word = (s: string) => {
    const i = words.indexOf(s);
    return i >= 0 ? i : words.push(s) - 1;
  };
  const tables: OpenTable[] = [];
  const seen = new Map<string, number>();
  const out: OpenData['periods'] = [];
  for (const p of periods) {
    if (p.from > until) break;
    const t = table(p.money, locale, word);
    const k = JSON.stringify(t);
    if (!seen.has(k)) {
      seen.set(k, tables.length);
      tables.push(t);
    }
    out.push({ from: p.from, t: seen.get(k)! });
  }
  const m = periods[0].money;
  const data: OpenData = {
    locale,
    built: start,
    defaults: { county: DEFAULTS.county, scrap: DEFAULTS.scrap, km: DEFAULTS.km, charge: 'no' },
    km: [...HOME_KM],
    counties: m.counties.map((c) => ({ id: c.id, name: readerText(c.name[locale]) })),
    periods: out,
    tables,
    words,
  };
  memo.set(key, data);
  return data;
}
