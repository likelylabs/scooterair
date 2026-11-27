// Browser side of the /electric/ opening (ElectricOpening.astro).
//
// - Reads ?county=&scrap=&km=(&charge=) from the home page's 開始算 button, sets the answers and
//   writes the line 「你在首頁選的：…」 (acceptance check 23).
// - Picks the table true on the reader's day in Taiwan, so a page cached past a deadline is not stale.
// - Redraws the variants when the county changes (the switches show and hide variants themselves).
// - Tells the detailed calculator below what is chosen: `el:open` on document,
//   detail { county, scrap: 'yes'|'no', km, charge: 'yes'|'no', fromHome: boolean }.
// - Keeps the address in step (replaceState), so a reload or a shared link brings the same answer.
// No engine here: every figure is in the page's JSON (opening-data.ts), so a change is instant.

import { buyHtml, caseText, monthHtml, monthLine, snapKm, tableOn, type Charge, type OpenData, type OpenState, type OpenTable, type OpenText, type Scrap } from './opening-view.ts';
import { todayInTaipei } from '../../../lib/site-state.ts';

const root = document.querySelector<HTMLElement>('[data-op]');
const raw = document.getElementById('op-data')?.textContent;

if (root && raw) {
  const { D, T } = JSON.parse(raw) as { D: OpenData; T: OpenText };
  const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? v[k] : m));
  const select = root.querySelector<HTMLSelectElement>('[data-op-county]');
  const chosen = root.querySelector<HTMLElement>('[data-op-chosen]');
  const pick = (name: string) => root.querySelector<HTMLInputElement>(`[data-pick-input="${name}"]:checked`)?.value ?? '';
  const setPick = (name: string, value: string) => {
    const input = root.querySelector<HTMLInputElement>(`[data-pick-input="${name}"][value="${value}"]`);
    if (!input || input.checked) return;
    input.checked = true;
    // stamp the scope here too: the switch's own script may not be listening yet
    root.setAttribute(`data-pick-${name}`, value);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const state = (): OpenState => ({
    county: select?.value || D.defaults.county,
    scrap: (pick('scrap') || D.defaults.scrap) as Scrap,
    km: Number(pick('km')) || D.defaults.km,
    charge: (pick('charge') || D.defaults.charge) as Charge,
  });

  let table: OpenTable = tableOn(D, todayInTaipei());
  let drawn = `${D.defaults.county}|${D.built}`;

  /** Redraw every variant for the county (only when the county or the day's table changed). */
  function draw(county: string) {
    root!.querySelectorAll<HTMLElement>('[data-op-buy]').forEach((el) => (el.innerHTML = buyHtml(D, T, table, county, el.dataset.opBuy as Scrap)));
    root!.querySelectorAll<HTMLElement>('[data-op-month]').forEach((el) => (el.innerHTML = monthHtml(D, T, table, Number(el.dataset.opMonth))));
    root!.querySelectorAll<HTMLElement>('[data-op-line]').forEach((el) => {
      const [scrap, km, charge] = el.dataset.opLine!.split('-');
      el.textContent = monthLine(D, T, table, { county, scrap: scrap as Scrap, km: Number(km), charge: charge as Charge });
    });
    root!.querySelectorAll<HTMLElement>('[data-op-strip] [data-when-scrap]').forEach((el) => {
      el.textContent = D.words[table.buy[county][el.dataset.whenScrap as Scrap].strip];
    });
  }

  // ---- the answers from the address (the home page's hand-off) ----------------------------
  const q = new URLSearchParams(location.search);
  const qCounty = q.get('county');
  const qScrap = q.get('scrap');
  const qKm = Number(q.get('km'));
  const qCharge = q.get('charge');
  let fromHome = false;
  if (qCounty && D.counties.some((c) => c.id === qCounty) && select) {
    select.value = qCounty;
    fromHome = true;
  }
  if (qScrap === 'yes' || qScrap === 'no') {
    setPick('scrap', qScrap);
    fromHome = true;
  }
  if (Number.isFinite(qKm) && qKm > 0) {
    setPick('km', String(snapKm(D, qKm)));
    fromHome = true;
  }
  if (qCharge === 'yes' || qCharge === 'no') setPick('charge', qCharge);
  const startKey = JSON.stringify(state());

  function update(announce: boolean) {
    const s = state();
    const key = `${s.county}|${D.periods.find((p) => D.tables[p.t] === table)?.from ?? ''}`;
    if (key !== drawn) {
      draw(s.county);
      drawn = key;
    }
    const exact = fromHome && JSON.stringify(s) === startKey;
    const text = exact ? fill(T.chosenHome, { case: caseText(D, T, s) }) : announce ? fill(T.chosenNow, { case: caseText(D, T, s, true) }) : fill(T.chosenDefault, { case: caseText(D, T, s) });
    if (chosen && chosen.textContent !== text) chosen.textContent = text;
    // the address carries the answer (the calculator keeps its own keys beside these)
    const p = new URLSearchParams(location.search);
    p.set('county', s.county);
    p.set('scrap', s.scrap);
    p.set('km', String(s.km));
    p.set('charge', s.charge);
    const url = `${location.pathname}?${p}${location.hash}`;
    if (announce && url !== `${location.pathname}${location.search}${location.hash}`) history.replaceState(history.state, '', url);
    document.dispatchEvent(new CustomEvent('el:open', { detail: { ...s, fromHome: exact, initial: !announce } }));
  }

  // the chosen line is polite-live: say the first state once without announcing it
  chosen?.removeAttribute('aria-live');
  table = tableOn(D, todayInTaipei());
  if (table !== D.tables[D.periods[0].t]) drawn = '';
  update(false);
  if (chosen) requestAnimationFrame(() => chosen.setAttribute('aria-live', 'polite'));

  select?.addEventListener('change', () => update(true));
  root.addEventListener('sa:pick', () => update(true));
  // a tab left open across midnight on a deadline must not keep yesterday's figures
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const next = tableOn(D, todayInTaipei());
    if (next !== table) {
      table = next;
      drawn = '';
      update(false);
    }
  });
}
