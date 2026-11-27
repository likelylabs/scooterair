// Browser side of the /electric/ opening (ElectricOpening.astro).
//
// - Reads ?county=&scrap=&km=(&charge=) from the home page's 開始算 button, sets the answers and
//   writes the line 「你在首頁選的：…」 (acceptance check 23).
// - Shows the three answers for the case on show. For the default county they come from the
//   page's table for the reader's day (instant, so a page cached past a deadline is not stale);
//   for any other county, and once the engine has loaded for the default one too, they are worked
//   out by the calculator's own function (model.ts openAnswers, via engine.ts) for today, so the
//   opening and the calculator below always print the same figures.
// - Tells the detailed calculator what is chosen: `el:open` on document,
//   detail { county, scrap: 'yes'|'no', km, charge: 'yes'|'no', fromHome: boolean, initial }.
// - Keeps the address in step (replaceState), so a reload or a shared link brings the same answer.

import { answersHtml, ansScrapNotes, ansWho, caseText, escHtml, snapKm, worstFoldHtml, type Ans, type Charge, type OpenData, type OpenState, type OpenText, type Scrap } from './opening-view.ts';
import type { OpeningAnswers } from './opening-answers.ts';
import { todayInTaipei } from '../../../lib/site-state.ts';

interface Slim {
  locale: OpenData['locale'];
  built: string;
  defaults: OpenData['defaults'];
  km: number[];
  counties: OpenData['counties'];
  periods: OpenData['periods'];
  strips: Record<string, Record<Scrap, string>>[];
  worst: string[];
  answers: OpeningAnswers;
}

const root = document.querySelector<HTMLElement>('[data-op]');
const raw = document.getElementById('op-data')?.textContent;

if (root && raw) {
  const { S, T } = JSON.parse(raw) as { S: Slim; T: OpenText };
  // caseText() reads only the county names, the locale and the copy
  const D = { locale: S.locale, counties: S.counties, km: S.km } as unknown as OpenData;
  const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? v[k] : m));
  const on = <P extends { from: string; t: number }>(ps: P[], date: string) => ps.reduce((p, x) => (x.from <= date ? x : p), ps[0]).t;
  const select = root.querySelector<HTMLSelectElement>('[data-op-county]');
  const chosen = root.querySelector<HTMLElement>('[data-op-chosen]');
  const card = root.querySelector<HTMLElement>('[data-op-answer]');
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
    county: select?.value || S.defaults.county,
    scrap: (pick('scrap') || S.defaults.scrap) as Scrap,
    km: Number(pick('km')) || S.defaults.km,
    charge: (pick('charge') || S.defaults.charge) as Charge,
  });
  const keyOf = (s: OpenState) => `${s.scrap}-${s.km}-${s.charge}` as const;

  // ---- the answers ----------------------------------------------------------------------------
  type Engine = typeof import('./engine.ts');
  let engine: Promise<Engine> | null = null;
  const load = () => (engine ??= import('./engine.ts'));
  const idle = (f: () => void) => ((window as unknown as { requestIdleCallback?: (f: () => void, o?: object) => void }).requestIdleCallback ?? ((g: () => void) => setTimeout(g, 60)))(f, { timeout: 1500 });
  const worked = new Map<string, Ans>();
  async function work(s: OpenState): Promise<Ans> {
    const day = todayInTaipei();
    const k = `${day}|${s.county}|${keyOf(s)}`;
    const hit = worked.get(k);
    if (hit) return hit;
    const E = await load();
    const a = E.openAnswers({ county: s.county as never, scrap: s.scrap, km: s.km, charge: s.charge, builtOn: S.answers.builtOn }, E.econData, S.locale);
    worked.set(k, a);
    return a;
  }
  const fromTable = (s: OpenState): Ans | null => (s.county === S.answers.county ? S.answers.tables[on(S.answers.periods, todayInTaipei())][keyOf(s)] ?? null : null);
  function paint(s: OpenState, a: Ans, other: Ans) {
    const el = root!.querySelector<HTMLElement>(`[data-op-case="${keyOf(s)}"]`);
    if (!el) return;
    const notes = ansScrapNotes(S.locale, T, s.scrap, a, other);
    const html = `${answersHtml(S.locale, T, a, { level: 3, bars: true, working: true, notes })}<p class="op-body">${escHtml(ansWho(S.locale, T, a))}</p>${worstFoldHtml(S.worst[on(S.periods, todayInTaipei())], T)}`;
    // keep an open fold open, and do not restart the bars when nothing changed
    if (el.dataset.opFor === s.county && el.innerHTML === html) return;
    const open = [...el.querySelectorAll('details')].map((d) => d.open);
    el.innerHTML = html;
    el.dataset.opFor = s.county;
    el.querySelectorAll('details').forEach((d, i) => open[i] && d.setAttribute('open', ''));
  }
  const flipped = (s: OpenState): OpenState => ({ ...s, scrap: s.scrap === 'yes' ? 'no' : 'yes' });
  // every variant that does not show this county is out of date until it is worked out again
  function markStale(county: string) {
    root!.querySelectorAll<HTMLElement>('[data-op-case]').forEach((el) => {
      if ((el.dataset.opFor ?? S.answers.county) !== county) el.setAttribute('data-op-stale', '');
    });
  }
  let seq = 0;
  async function show(s: OpenState) {
    const mine = ++seq;
    const el = root!.querySelector<HTMLElement>(`[data-op-case="${keyOf(s)}"]`);
    const quick = fromTable(s);
    const quickOther = fromTable(flipped(s));
    if (quick && quickOther) {
      paint(s, quick, quickOther);
      el?.removeAttribute('data-op-stale');
      // the table is the calculator's own figures for this day; the engine checks it once it is free
      if (!engine) await new Promise<void>((r) => (document.readyState === 'complete' ? idle(r) : addEventListener('load', () => idle(r), { once: true })));
      if (mine !== seq) return;
    } else card?.setAttribute('aria-busy', 'true');
    try {
      const [a, other] = await Promise.all([work(s), work(flipped(s))]);
      if (mine !== seq) return;
      paint(s, a, other);
      el?.removeAttribute('data-op-stale');
    } catch {
      /* the figures shipped with the page stay */
    } finally {
      if (mine === seq) card?.removeAttribute('aria-busy');
    }
  }
  function strips(county: string) {
    const t = S.strips[on(S.periods, todayInTaipei())];
    root!.querySelectorAll<HTMLElement>('[data-op-strip] [data-when-scrap]').forEach((el) => {
      const text = t[county]?.[el.dataset.whenScrap as Scrap];
      if (text && el.textContent !== text) el.textContent = text;
    });
  }

  // ---- the answers from the address (the home page's hand-off) ----------------------------
  const q = new URLSearchParams(location.search);
  const qCounty = q.get('county');
  const qScrap = q.get('scrap');
  const qKm = Number(q.get('km'));
  const qCharge = q.get('charge');
  let fromHome = false;
  if (qCounty && S.counties.some((c) => c.id === qCounty) && select) {
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

  let lastCounty = S.answers.county;
  function update(announce: boolean) {
    const s = state();
    if (s.county !== lastCounty) {
      markStale(s.county);
      lastCounty = s.county;
    }
    strips(s.county);
    void show(s);
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
  update(false);
  if (chosen) requestAnimationFrame(() => chosen.setAttribute('aria-live', 'polite'));

  select?.addEventListener('change', () => update(true));
  root.addEventListener('sa:pick', () => update(true));
  // a tab left open across midnight on a deadline must not keep yesterday's figures
  let day = todayInTaipei();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || todayInTaipei() === day) return;
    day = todayInTaipei();
    markStale('');
    update(false);
  });
}
