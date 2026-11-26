// Browser side of the date-state utility. Re-evaluates the money state from today's date in
// Taiwan and the reader's city, so a static page never shows a stale state.
//
//   <script> import '@/lib/site-state.client'; </script>      (MoneySnapshot does this for you)
//
// Markup contract (all optional; use what the page needs):
//   <script type="application/json" data-money-snapshot>      printed by <MoneySnapshot />
//   <select data-money-city>                                   the reader's city (value = JurisdictionId, '' = none)
//   <… data-money-when="A B">                                  shown by CSS from <html data-money-phase> (no script needed)
//   <… data-money-state="A-city-open A-city-restricted">       shown only in those states (hidden without JavaScript)
//   <… data-money-fill="daysLeft | daysSince | today | deadline | cityDeadline | filingDeadline | checkedOn | city | cityDate">
//        cityDeadline: the chosen city's own last purchase day while its money is open (Keelung and
//        Kinmen close on 30 November, before the central 31 December); the central deadline otherwise.
//   <… data-money-template="…{city}…{date}…{n}…">               text rebuilt from the template on every update
//   <… data-money-if="dayCount | stale | nothingConfirmed | filingOpen">  shown only while the flag is true
// After every update the script dispatches `money:state` on document with the MoneyState as detail
// (the calculator listens for it) and mirrors it on <html data-money-state="…">.

import { formatDate, moneyState, todayInTaipei, type MoneySnapshot, type MoneyState } from './site-state.ts';
import type { JurisdictionId } from '../data/econ/types.ts';

declare global {
  interface DocumentEventMap {
    'money:state': CustomEvent<MoneyState>;
  }
}

let snap: MoneySnapshot | null = null;

function read(): MoneySnapshot | null {
  if (snap) return snap;
  const el = document.querySelector('script[data-money-snapshot]');
  if (!el?.textContent) return null;
  try {
    snap = JSON.parse(el.textContent) as MoneySnapshot;
  } catch {
    snap = null;
  }
  return snap;
}

/** The current state, or null on a page without a snapshot. */
export function currentMoneyState(city?: JurisdictionId | null): MoneyState | null {
  const s = read();
  if (!s) return null;
  const chosen = city === undefined ? ((document.querySelector<HTMLSelectElement>('select[data-money-city]')?.value || null) as JurisdictionId | null) : city;
  return moneyState(todayInTaipei(), chosen, s);
}

export function applyMoneyState(): MoneyState | null {
  const state = currentMoneyState();
  if (!state) return null;
  const root = document.documentElement;
  const locale = root.lang.startsWith('en') ? 'en' : 'zh-TW';
  root.dataset.moneyPhase = state.phase;
  root.dataset.moneyState = state.id;

  const date = state.city ? state.city.asOf : state.checkedOn;
  const values: Record<string, string> = {
    daysLeft: String(state.daysLeft),
    daysSince: String(state.daysSince),
    n: String(state.phase === 'A' ? state.daysLeft : state.daysSince),
    today: formatDate(state.date, locale, true),
    deadline: formatDate(state.deadline, locale),
    cityDeadline: formatDate(state.cityDeadline ?? state.deadline, locale),
    filingDeadline: formatDate(state.filingDeadline, locale),
    checkedOn: formatDate(state.checkedOn, locale, true),
    city: state.city?.name[locale] ?? '',
    cityDate: formatDate(date, locale),
    date: formatDate(date, locale),
  };
  const flags: Record<string, boolean> = {
    dayCount: state.mayShowDayCount,
    stale: !!state.city?.stale && state.phase === 'A' && ['available', 'restricted', 'unpublished'].includes(state.city.status),
    nothingConfirmed: state.nothingConfirmed,
    filingOpen: state.filingOpen,
  };

  document.querySelectorAll<HTMLElement>('[data-money-state]:not(html)').forEach((el) => {
    el.toggleAttribute('data-money-on', (el.dataset.moneyState ?? '').split(/\s+/).includes(state.id));
  });
  document.querySelectorAll<HTMLElement>('[data-money-if]').forEach((el) => {
    el.toggleAttribute('data-money-on', !!flags[el.dataset.moneyIf ?? '']);
  });
  document.querySelectorAll<HTMLElement>('[data-money-template]').forEach((el) => {
    el.textContent = (el.dataset.moneyTemplate ?? '').replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
  });
  document.querySelectorAll<HTMLElement>('[data-money-fill]').forEach((el) => {
    const v = values[el.dataset.moneyFill ?? ''];
    if (v !== undefined) el.textContent = v;
  });
  document.dispatchEvent(new CustomEvent('money:state', { detail: state }));
  return state;
}

if (typeof document !== 'undefined' && !document.documentElement.dataset.moneyInit) {
  document.documentElement.dataset.moneyInit = '';
  applyMoneyState();
  document.addEventListener('change', (e) => (e.target as Element | null)?.matches?.('select[data-money-city]') && applyMoneyState());
  // a tab left open across midnight on 31 December must not keep yesterday's state
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && applyMoneyState());
  window.addEventListener('pageshow', () => applyMoneyState());
}
