// The opening's three answers for the default county (brief 7.7), on every day the sums can change
// within the look-ahead, so a page printed today is still right when it is read from a cache. Each
// figure is the calculator's own (model.ts openAnswers: choose() + evaluate() + ansOf()), so the
// opening and the calculator below it print the same figures for the same answers. Other counties
// are worked out in the browser with the same function (opening.client.ts, engine.ts).

import { econData } from '../../../data/econ/index.ts';
import { candidateDates, DEFAULTS, defaultScrap, HOME_KM } from '../../../lib/home-money.ts';
import { todayInTaipei } from '../../../lib/site-state.ts';
import type { Locale } from '../../../i18n/pages/_copy.ts';
import { openAnswers } from './model.ts';
import type { Ans } from './opening-view.ts';

/** Same horizon as the opening's other tables (opening-data.ts). */
const LOOK_AHEAD_DAYS = 45;
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export type CaseKey = `${'yes' | 'no'}-${number}-${'yes' | 'no'}`;
export const caseKey = (scrap: 'yes' | 'no', km: number, charge: 'yes' | 'no'): CaseKey => `${scrap}-${km}-${charge}`;

export interface OpeningAnswers {
  county: string;
  /** the old scooter the calculator assumes (its year and month selects): the same in every period */
  builtOn: string;
  periods: { from: string; t: number }[];
  tables: Record<CaseKey, Ans>[];
}

const memo = new Map<string, OpeningAnswers>();

export function openingAnswers(locale: Locale, from?: string): OpeningAnswers {
  const start = from ?? todayInTaipei();
  const key = `${locale}|${start}`;
  const hit = memo.get(key);
  if (hit) return hit;
  const builtOn = defaultScrap(start).builtOn;
  const county = DEFAULTS.county;
  const dates = [start, ...candidateDates(start, addDays(start, LOOK_AHEAD_DAYS))];
  const tables: Record<CaseKey, Ans>[] = [];
  const seen = new Map<string, number>();
  const periods: OpeningAnswers['periods'] = [];
  for (const date of dates) {
    const t = {} as Record<CaseKey, Ans>;
    for (const scrap of ['yes', 'no'] as const)
      for (const km of HOME_KM) for (const charge of ['no', 'yes'] as const) t[caseKey(scrap, km, charge)] = openAnswers({ county, scrap, km, charge, builtOn, date }, econData, locale);
    const k = JSON.stringify(t);
    if (!seen.has(k)) {
      seen.set(k, tables.length);
      tables.push(t);
    }
    const ti = seen.get(k)!;
    if (!periods.length || periods[periods.length - 1].t !== ti) periods.push({ from: date, t: ti });
  }
  const out = { county, builtOn, periods, tables };
  memo.set(key, out);
  return out;
}
