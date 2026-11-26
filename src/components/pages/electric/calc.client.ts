// Browser side of /electric/.
//
// Light part (this file, loaded with the page): shows only the questions that matter for the
// chosen place, fills the day counts of verdict-A results from today's date (R10), wires the
// worked examples' "start from this" buttons and the print buttons.
// Heavy part (./engine.ts: engine + dataset + renderer, one chunk): imported on first use, or
// when the browser is idle, and run for every change of the answers.

import { formatDate, moneyState, todayInTaipei, type MoneySnapshot } from '../../../lib/site-state.ts';
import type { JurisdictionId } from '../../../data/econ/types.ts';
import type { Answers, Lever, Rendered, RenderCtx } from './model.ts';

interface Cfg {
  locale: 'zh-TW' | 'en';
  cites: Record<string, { short: string; url: string }>;
  flags: Record<string, string[]>;
  remote: Record<string, string>;
  cityNames: Record<string, string>;
  cityNotes: Record<string, { note: string; links: { label: string; url: string }[] }>;
  links: RenderCtx['links'];
  tableLabel: string;
  statusWords: Record<string, string>;
  yearEnd: string;
  text: {
    working: string;
    invalid: string;
    dayCount: string;
    dayCountLast: string;
    dayCountNone: string;
    levers: Record<Lever['key'], string>;
    worth: string;
    leverPlanNote: string;
    nothing: string;
    noCity: string;
    statusNote: string;
    officialLinks: string;
  };
}

const cfgEl = document.getElementById('el-calc-data');
const cfg: Cfg | null = cfgEl?.textContent ? JSON.parse(cfgEl.textContent) : null;
const form = document.querySelector<HTMLFormElement>('[data-el-calc] form');
const city = document.querySelector<HTMLSelectElement>('#el-city');
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

function snapshot(): MoneySnapshot | null {
  const el = document.querySelector('script[data-money-snapshot]');
  try {
    return el?.textContent ? (JSON.parse(el.textContent) as MoneySnapshot) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// day counts: only inside a verdict A result, with the city's status (R10)

function dayCounts(root: ParentNode = document) {
  const snap = snapshot();
  if (!snap || !cfg) return;
  const today = todayInTaipei();
  root.querySelectorAll<HTMLElement>('[data-el-daycount]').forEach((el) => {
    const panel = el.closest<HTMLElement>('[data-verdict]');
    const id = el.dataset.city as JurisdictionId;
    const st = moneyState(today, id, snap);
    if (!st.city || st.phase !== 'A' || panel?.dataset.verdict !== 'A') return;
    const c = { city: st.city.name[cfg.locale], date: formatDate(st.city.asOf, cfg.locale, true), deadline: formatDate(st.deadline, cfg.locale, true) };
    el.textContent = st.mayShowDayCount
      ? st.daysLeft <= 0
        ? fill(cfg.text.dayCountLast, c)
        : fill(cfg.text.dayCount, { ...c, n: st.daysLeft })
      : fill(cfg.text.dayCountNone, { ...c, status: cfg.statusWords[st.city.status] ?? '' });
  });
}

// ---------------------------------------------------------------------------------------------
// the form

const radio = (name: string) => form?.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '';
const setRadio = (name: string, value: string) => {
  const r = form?.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
  if (r) r.checked = true;
};

function syncForm() {
  if (!form || !cfg) return;
  const id = city?.value ?? '';
  const name = id ? cfg.cityNames[id] : '';
  const out = form.querySelector('[data-el-cityname]');
  if (out) out.textContent = name;
  const asked = new Set(id ? cfg.flags[id] : []);
  form.querySelectorAll<HTMLElement>('[data-flag]').forEach((el) => (el.hidden = !asked.has(el.dataset.flag!)));
  const hint = form.querySelector<HTMLElement>('[data-el-hhint]');
  if (hint && id) hint.textContent = fill(hint.dataset.template ?? '', { city: name });
  form.querySelectorAll<HTMLElement>('[data-template]').forEach((el) => {
    if (el === hint) return;
    el.textContent = fill(el.dataset.template ?? '', { district: cfg.remote[id] ?? '', city: name });
  });
  const scrap = form.querySelector<HTMLElement>('[data-el-if="scrap"]');
  if (scrap) scrap.hidden = radio('el-scrap') !== 'yes';
  // nowhere to charge: home charging is not an option, and we say why
  const canCharge = radio('el-charge') === 'yes';
  const home = form.querySelector<HTMLInputElement>('input[name="el-power"][value="home"]');
  if (home) {
    home.disabled = !canCharge;
    home.closest('label')?.toggleAttribute('data-disabled', !canCharge);
    if (!canCharge && home.checked) setRadio('el-power', 'subscription');
  }
  const ns = form.querySelector<HTMLElement>('[data-el-if="nosocket"]');
  if (ns) ns.hidden = canCharge;
  // the place's own note and links under #status
  const note = document.querySelector<HTMLElement>('[data-el-citynote]');
  if (note) {
    const n = id ? cfg.cityNotes[id] : null;
    note.hidden = !n;
    if (n) {
      note.replaceChildren();
      const p = document.createElement('p');
      p.textContent = cfg.text.statusNote + n.note;
      note.append(p);
      if (n.links.length) {
        const q = document.createElement('p');
        q.append(cfg.text.officialLinks + ' ');
        n.links.forEach((l, i) => {
          if (i) q.append(' · ');
          const a = document.createElement('a');
          a.href = l.url;
          a.rel = 'noopener';
          a.target = '_blank';
          a.textContent = l.label;
          q.append(a);
        });
        note.append(q);
      }
    }
  }
}

function answers(): Answers | null {
  if (!form || !city?.value) return null;
  const visible = (k: string) => !form.querySelector<HTMLElement>(`[data-flag="${k}"]`)?.hidden;
  const household: Answers['household'] = {};
  form.querySelectorAll<HTMLInputElement>('input[data-el-flag]').forEach((c) => {
    if (c.checked && visible(c.dataset.elFlag!)) (household as Record<string, boolean>)[c.dataset.elFlag!] = true;
  });
  if (visible('income')) {
    const inc = radio('el-income');
    if (inc && inc !== 'none') household.income = inc as 'low' | 'middle-low';
  }
  const ageEl = form.querySelector<HTMLInputElement>('#el-age');
  if (visible('age') && ageEl && ageEl.value.trim() !== '') household.age = Number(ageEl.value);
  const km = form.querySelector<HTMLInputElement>('#el-km');
  const year = form.querySelector<HTMLSelectElement>('#el-year')?.value;
  const month = form.querySelector<HTMLSelectElement>('#el-month')?.value;
  return {
    jurisdiction: city.value as JurisdictionId,
    scrap: radio('el-scrap') === 'yes' && year && month ? { engine: radio('el-engine') === 'two-stroke' ? 'two-stroke' : 'four-stroke', builtOn: `${year}-${month}` } : null,
    household,
    monthlyKm: km && km.value.trim() !== '' ? Number(km.value) : NaN,
    plate: radio('el-plate') === 'any' ? 'any' : 'heavy',
    power: (radio('el-power') || 'subscription') as Answers['power'],
    ev: form.querySelector<HTMLSelectElement>('#el-ev')?.value || null,
    gas: form.querySelector<HTMLSelectElement>('#el-gas')?.value || null,
  };
}

// ---------------------------------------------------------------------------------------------
// the engine, on demand

type Engine = typeof import('./engine.ts');
let engine: Promise<Engine> | null = null;
const load = () => (engine ??= import('./engine.ts'));

const live = document.getElementById('el-live');
const section = document.getElementById('result');
const placeholder = document.querySelector<HTMLElement>('[data-el-placeholder]');
const status = document.querySelector<HTMLElement>('[data-el-status]');

function apply(root: HTMLElement, r: Rendered) {
  const panel = root.querySelector<HTMLElement>('[data-verdict]');
  if (!panel) return;
  panel.dataset.verdict = r.verdict;
  const set = (sel: string, text: string) => {
    const el = panel.querySelector(sel);
    if (el) el.textContent = text;
  };
  set('[data-part="sentence"]', r.sentence);
  set('[data-part="value"]', r.value);
  set('[data-part="note"]', r.note);
  set('.result__title > span', r.title);
  const affix = panel.querySelectorAll('.result__value .result__affix');
  if (affix[0]) affix[0].textContent = r.prefix;
  if (affix[1]) affix[1].textContent = r.unit;
  const slot = (name: string, html: string) => {
    const el = root.querySelector(`[data-el-slot="${name}"]`);
    if (el) el.innerHTML = html;
  };
  slot('deadline', r.deadlineHtml);
  slot('next', r.nextHtml);
  slot('body', r.bodyHtml);
}

function renderLevers(levers: Lever[], cityName: string) {
  const list = document.querySelector<HTMLElement>('[data-el-levers]');
  const empty = document.querySelector<HTMLElement>('[data-el-levers-empty]');
  if (!list || !cfg) return;
  list.replaceChildren(
    ...levers.map((l) => {
      const li = document.createElement('li');
      const b = document.createElement('span');
      b.className = 'el-lever__label';
      b.textContent = cfg.text.levers[l.key];
      const v = document.createElement('span');
      v.className = 'el-lever__amt';
      const money = (n: number) => `NT$ ${new Intl.NumberFormat(cfg.locale === 'en' ? 'en-GB' : 'zh-TW').format(Math.round(n))}`;
      v.textContent = l.key === 'plan' ? fill(cfg.text.leverPlanNote, { amount: money(l.monthly ?? 0) }) : fill(cfg.text.worth, { amount: money(l.amount) });
      li.append(b, v);
      return li;
    }),
  );
  list.hidden = !levers.length;
  if (empty) {
    empty.hidden = false;
    empty.textContent = levers.length ? '' : fill(cfg.text.nothing, { city: cityName });
    empty.hidden = !!levers.length;
  }
}

let seq = 0;
let lastDate = '';
async function run() {
  if (!cfg || !live || !section) return;
  const a = answers();
  if (!a) {
    live.hidden = true;
    if (placeholder) placeholder.hidden = false;
    return;
  }
  const mine = ++seq;
  section.setAttribute('aria-busy', 'true');
  if (status) status.textContent = cfg.text.working;
  const E = await load();
  // let the busy state paint before the (synchronous) engine runs
  await new Promise((r) => setTimeout(r, 16));
  if (mine !== seq) return;
  try {
    const issues = E.answerIssues(a, E.econData);
    if (issues.length) {
      if (status) status.textContent = fill(cfg.text.invalid, { issues: issues.map((i) => i.message[cfg.locale]).join(cfg.locale === 'en' ? '; ' : '；') });
      section.removeAttribute('aria-busy');
      return;
    }
    const choice = E.choose(a, E.econData);
    const e = E.evaluate(choice.situation, E.econData);
    lastDate = e.situation.date;
    const ctx: RenderCtx = { locale: cfg.locale, data: E.econData, cite: (id) => cfg.cites[id] ?? null, id: 'el-live', tableLabel: cfg.tableLabel, links: cfg.links };
    const r = E.renderResult(e, { ...choice, plate: a.plate, power: a.power }, ctx);
    if (mine !== seq) return;
    apply(live, r);
    live.dataset.city = a.jurisdiction;
    live.hidden = false;
    if (placeholder) placeholder.hidden = true;
    if (status) status.textContent = '';
    dayCounts(live);
    section.removeAttribute('aria-busy');
    // the levers (#closer) take a few more engine runs: after the result is on screen
    setTimeout(() => {
      if (mine !== seq) return;
      try {
        renderLevers(E.levers(a, e, E.econData), cfg.cityNames[a.jurisdiction]);
      } catch {
        /* the levers are optional */
      }
    }, 30);
  } catch (err) {
    const issues = (err as { issues?: { message: Record<string, string> }[] }).issues;
    if (status) status.textContent = fill(cfg.text.invalid, { issues: issues ? issues.map((i) => i.message[cfg.locale]).join('; ') : String(err) });
    section.removeAttribute('aria-busy');
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
const schedule = (ms = 250) => {
  clearTimeout(timer);
  timer = setTimeout(run, ms);
};

if (form && cfg) {
  syncForm();
  form.addEventListener('change', (ev) => {
    const t = ev.target as HTMLElement;
    // changing what kind of scooter resets a hand-picked model
    if (t.matches('input[name="el-plate"], input[name="el-power"], input[name="el-charge"]')) {
      const evSel = form.querySelector<HTMLSelectElement>('#el-ev');
      if (evSel) evSel.value = '';
    }
    syncForm();
    schedule(50);
  });
  form.addEventListener('input', (ev) => {
    if ((ev.target as HTMLElement).matches('#el-km, #el-age')) schedule(350);
  });
  city?.addEventListener('change', () => {
    syncForm();
    schedule(50);
  });
  // warm the engine up once the page has settled
  const idle = (window as unknown as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500));
  window.addEventListener('load', () => idle(() => void load()));
  if (city?.value) schedule(0);
  // a tab left open across midnight on 31 December must not keep yesterday's answer
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && lastDate && lastDate !== todayInTaipei()) schedule(0);
  });
}

// worked examples: "start the calculator from this"
document.querySelectorAll<HTMLButtonElement>('[data-el-use]').forEach((btn) =>
  btn.addEventListener('click', () => {
    if (!form || !city) return;
    const a = JSON.parse(btn.dataset.elUse ?? '{}') as Answers & { charge?: boolean };
    city.value = a.jurisdiction;
    city.dispatchEvent(new Event('change', { bubbles: true }));
    setRadio('el-scrap', a.scrap ? 'yes' : 'no');
    if (a.scrap) {
      const [y, m] = a.scrap.builtOn.split('-');
      const ys = form.querySelector<HTMLSelectElement>('#el-year');
      const ms = form.querySelector<HTMLSelectElement>('#el-month');
      if (ys) ys.value = y;
      if (ms) ms.value = m;
      setRadio('el-engine', a.scrap.engine);
    }
    form.querySelectorAll<HTMLInputElement>('input[data-el-flag]').forEach((c) => (c.checked = !!(a.household as Record<string, unknown>)[c.dataset.elFlag!]));
    setRadio('el-income', a.household.income ?? 'none');
    const km = form.querySelector<HTMLInputElement>('#el-km');
    if (km) {
      km.value = String(a.monthlyKm);
      km.dispatchEvent(new Event('input', { bubbles: true }));
    }
    setRadio('el-charge', a.charge ? 'yes' : 'no');
    setRadio('el-power', a.power);
    setRadio('el-plate', a.plate);
    const evSel = form.querySelector<HTMLSelectElement>('#el-ev');
    const gasSel = form.querySelector<HTMLSelectElement>('#el-gas');
    if (evSel) evSel.value = '';
    if (gasSel) gasSel.value = '';
    syncForm();
    schedule(0);
    document.getElementById('calc')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }),
);

// print buttons: print one part of the page
document.querySelectorAll<HTMLButtonElement>('[data-el-print]').forEach((btn) =>
  btn.addEventListener('click', () => {
    document.documentElement.dataset.elPrint = btn.dataset.elPrint;
    window.print();
  }),
);
window.addEventListener('afterprint', () => delete document.documentElement.dataset.elPrint);

dayCounts();
document.addEventListener('money:state', () => dayCounts());
