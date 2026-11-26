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
    announce: string;
    barEmpty: string;
    barFix: string;
  };
  /** the worked examples whose working is built in the browser when opened (keeps the page light) */
  examples: { key: string; answers: Answers; before: boolean; after: string; full: boolean }[];
  /** the build day: a complete example built that day is already right for a reader on that day */
  built: string;
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
    // the city's own last day when it is earlier (Keelung and Kinmen: 30 November)
    const last = st.cityDeadline && st.cityDeadline < st.deadline ? st.cityDeadline : st.deadline;
    const left = last === st.deadline ? st.daysLeft : (st.cityDaysLeft ?? st.daysLeft);
    const c = { city: st.city.name[cfg.locale], date: formatDate(st.city.asOf, cfg.locale, true), deadline: formatDate(last, cfg.locale, true) };
    el.textContent = st.mayShowDayCount
      ? left <= 0
        ? fill(cfg.text.dayCountLast, c)
        : fill(cfg.text.dayCount, { ...c, n: left })
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

const cityQ = document.querySelector<HTMLSelectElement>('#el-city-q');

function syncForm() {
  if (!form || !cfg) return;
  const id = city?.value ?? '';
  const name = id ? cfg.cityNames[id] : '';
  if (cityQ && cityQ.value !== id) cityQ.value = id;
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
  // a scooter cannot be built after this month
  const ys = form.querySelector<HTMLSelectElement>('#el-year');
  const msel = form.querySelector<HTMLSelectElement>('#el-month');
  const now = todayInTaipei().slice(0, 7);
  if (ys && msel) {
    msel.querySelectorAll('option').forEach((o) => (o.disabled = `${ys.value}-${o.value}` > now));
    if (msel.selectedOptions[0]?.disabled) msel.value = now.slice(5, 7);
  }
  // nowhere to charge where you park: swapping, or a battery carried indoors (both stay open)
  const canCharge = radio('el-charge') === 'yes';
  const ns = form.querySelector<HTMLElement>('[data-el-if="nosocket"]');
  if (ns) ns.hidden = canCharge;
  // the chosen model and plan in full, under each select (the closed control cuts long names)
  form.querySelectorAll<HTMLElement>('[data-el-chosen]').forEach((el) => {
    const sel = form.querySelector<HTMLSelectElement>(`#${el.dataset.elChosen}`);
    el.textContent = sel && sel.value ? fill(el.dataset.template ?? '', { text: sel.selectedOptions[0]?.textContent ?? '' }) : '';
  });
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
      const money = (n: number) => {
        const v = new Intl.NumberFormat(cfg.locale === 'en' ? 'en-GB' : 'zh-TW').format(Math.round(n));
        return cfg.locale === 'en' ? `NT$${v}` : `${v}\u00a0元`;
      };
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

// ---------------------------------------------------------------------------------------------
// what the reader sees while answering: the bar, the announcement, errors beside their field

const bar = document.querySelector<HTMLElement>('[data-el-bar]');
const barText = document.querySelector<HTMLElement>('[data-el-bar-text]');
const barSee = document.querySelector<HTMLElement>('[data-el-bar-see]');

function setBar(text: string, see: boolean) {
  if (!barText || !bar) return;
  const changed = barText.textContent !== text;
  barText.textContent = text;
  if (barSee) barSee.hidden = !see;
  if (changed && see) {
    bar.removeAttribute('data-flash');
    void bar.offsetWidth;
    bar.setAttribute('data-flash', '');
  }
}

function showErrors(issues: { field: string; message: Record<string, string> }[]) {
  if (!form || !cfg) return;
  form.querySelectorAll<HTMLElement>('[data-el-error]').forEach((p) => {
    const mine = issues.filter((i) => i.field === p.dataset.elError);
    const input = p.parentElement?.querySelector<HTMLInputElement>('input[type="number"]');
    p.hidden = !mine.length;
    p.textContent = mine.length ? (p.dataset.error ?? mine[0].message[cfg.locale]) : '';
    if (input) {
      input.toggleAttribute('aria-invalid', !!mine.length);
      if (mine.length) input.setAttribute('aria-invalid', 'true');
      const ids = new Set((input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
      if (mine.length) ids.add(p.id);
      else ids.delete(p.id);
      input.setAttribute('aria-describedby', [...ids].join(' '));
    }
  });
  const age = form.querySelector<HTMLInputElement>('#el-age');
  if (age) age.toggleAttribute('aria-invalid', issues.some((i) => i.field.startsWith('household')));
  const over = form.querySelector<HTMLElement>('[data-el-over]');
  const km = form.querySelector<HTMLInputElement>('#el-km');
  if (over && km) over.hidden = !(Number(km.value) > Number(over.dataset.elOver));
  // below the slider's start the figure is still worked out, and the page says so (as above the end)
  const under = form.querySelector<HTMLElement>('[data-el-under]');
  if (under && km) under.hidden = !(km.value.trim() !== '' && Number(km.value) > 0 && Number(km.value) < Number(under.dataset.elUnder));
}

function clearLevers(text: string) {
  const list = document.querySelector<HTMLElement>('[data-el-levers]');
  const empty = document.querySelector<HTMLElement>('[data-el-levers-empty]');
  if (list) {
    list.replaceChildren();
    list.hidden = true;
  }
  if (empty) {
    empty.textContent = text;
    empty.hidden = false;
  }
}

// ---------------------------------------------------------------------------------------------
// the answers in the address, so a link, a reload or Back brings the same result

const KEYS = ['el-scrap', 'el-engine', 'el-charge', 'el-power', 'el-plate', 'el-income'];
function saveUrl() {
  if (!form || !city) return;
  const q = new URLSearchParams();
  if (city.value) q.set('county', city.value);
  KEYS.forEach((k) => {
    const v = radio(k);
    const def = form.querySelector<HTMLInputElement>(`input[name="${k}"][checked]`)?.value;
    if (v && v !== def) q.set(k.slice(3), v);
  });
  if (radio('el-scrap') === 'yes') q.set('built', `${form.querySelector<HTMLSelectElement>('#el-year')?.value}-${form.querySelector<HTMLSelectElement>('#el-month')?.value}`);
  const km = form.querySelector<HTMLInputElement>('#el-km')?.value;
  if (km && km !== form.querySelector<HTMLInputElement>('#el-km')?.defaultValue) q.set('km', km);
  const age = form.querySelector<HTMLInputElement>('#el-age')?.value;
  if (age) q.set('age', age);
  const flags = [...form.querySelectorAll<HTMLInputElement>('input[data-el-flag]:checked')].map((c) => c.dataset.elFlag);
  if (flags.length) q.set('flags', flags.join(','));
  ['el-ev', 'el-gas'].forEach((k) => {
    const v = form.querySelector<HTMLSelectElement>(`#${k}`)?.value;
    if (v) q.set(k.slice(3), v);
  });
  const qs = q.toString();
  const url = `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`;
  if (url !== `${location.pathname}${location.search}${location.hash}`) history.replaceState(history.state, '', url);
}

function restoreUrl() {
  if (!form || !city) return;
  const q = new URLSearchParams(location.search);
  // ?county= from the home page and from this page; ?city= from links made before the redesign
  const id = q.get('county') ?? q.get('city');
  if (id && cfg?.cityNames[id]) {
    city.value = id;
    city.dispatchEvent(new Event('change', { bubbles: true }));
  }
  KEYS.forEach((k) => q.get(k.slice(3)) && setRadio(k, q.get(k.slice(3))!));
  // a reader who can charge where they park, with no plan chosen yet, is costed on home charging
  if (q.get('charge') === 'yes' && !q.get('power')) setRadio('el-power', 'home');
  const built = q.get('built')?.split('-');
  if (built?.length === 2) {
    const ys = form.querySelector<HTMLSelectElement>('#el-year');
    const ms = form.querySelector<HTMLSelectElement>('#el-month');
    if (ys) ys.value = built[0];
    if (ms) ms.value = built[1];
  }
  const set = (sel: string, v: string | null) => {
    const el = form.querySelector<HTMLInputElement | HTMLSelectElement>(sel);
    if (el && v !== null) el.value = v;
  };
  set('#el-km', q.get('km'));
  set('#el-age', q.get('age'));
  set('#el-ev', q.get('ev'));
  set('#el-gas', q.get('gas'));
  const flags = new Set((q.get('flags') ?? '').split(','));
  form.querySelectorAll<HTMLInputElement>('input[data-el-flag]').forEach((c) => (c.checked = flags.has(c.dataset.elFlag!)));
  form.querySelector('#el-km')?.dispatchEvent(new Event('input', { bubbles: true }));
}

// ---------------------------------------------------------------------------------------------
// one run of the calculator

const idle = (f: () => void) => ((window as unknown as { requestIdleCallback?: (f: () => void, o?: object) => void }).requestIdleCallback ?? ((g: () => void) => setTimeout(g, 60)))(f, { timeout: 800 });
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

let seq = 0;
let lastDate = '';
async function run(): Promise<void> {
  if (!cfg || !live || !section) return;
  const a = answers();
  saveUrl();
  if (!a) {
    seq++;
    live.hidden = true;
    if (placeholder) placeholder.hidden = false;
    if (status) status.textContent = '';
    showErrors([]);
    setBar(cfg.text.barEmpty, false);
    clearLevers(cfg.text.noCity);
    return;
  }
  const mine = ++seq;
  section.setAttribute('aria-busy', 'true');
  if (status) status.textContent = cfg.text.working;
  const E = await load();
  // let the busy state paint before the engine runs
  await nextFrame();
  if (mine !== seq) return;
  const fail = (issues: { field: string; message: Record<string, string> }[]) => {
    // the old result no longer matches the answers: take it away and say what to fix, at the field
    live.hidden = true;
    if (placeholder) placeholder.hidden = false;
    showErrors(issues);
    const words = issues.map((i) => form?.querySelector<HTMLElement>(`[data-el-error="${i.field}"]`)?.dataset.error ?? i.message[cfg.locale]);
    if (status) status.textContent = fill(cfg.text.invalid, { issues: words.join(cfg.locale === 'en' ? '; ' : '；') });
    setBar(cfg.text.barFix, false);
    clearLevers(cfg.text.noCity);
    section.removeAttribute('aria-busy');
  };
  try {
    const issues = E.answerIssues(a, E.econData);
    if (issues.length) return fail(issues);
    showErrors([]);
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
    dayCounts(live);
    section.removeAttribute('aria-busy');
    // one line that a screen reader always hears, and the same answer in the bar
    const head = `${r.title} ${r.prefix && r.prefix !== 'NT$' ? r.prefix : r.prefix === 'NT$' ? 'NT$' : ''}${r.value}${r.unit ? ` ${r.unit}` : ''}`.replace(/[ \t\n]+/g, ' ').trim();
    if (status) status.textContent = r.spoken || fill(cfg.text.announce, { title: r.title, value: head.slice(r.title.length).trim() });
    setBar(r.short || head, true);
    // the levers (#closer) take a few more engine runs: when the browser is free
    idle(() => {
      if (mine !== seq) return;
      try {
        renderLevers(E.levers(a, e, E.econData), cfg.cityNames[a.jurisdiction]);
      } catch {
        /* the levers are optional */
      }
    });
  } catch (err) {
    const issues = (err as { issues?: { field: string; message: Record<string, string> }[] }).issues;
    if (mine !== seq) return;
    fail(issues ?? [{ field: '', message: { 'zh-TW': String(err), en: String(err) } }]);
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
let pending: Promise<void> = Promise.resolve();
const schedule = (ms = 250) => {
  clearTimeout(timer);
  pending = new Promise<void>((resolve) => {
    timer = setTimeout(() => void run().finally(resolve), ms);
  });
  return pending;
};

if (form && cfg) {
  syncForm();
  // question 1 and the #status select are one answer
  cityQ?.addEventListener('change', () => {
    if (!city) return;
    city.value = cityQ.value;
    city.dispatchEvent(new Event('change', { bubbles: true }));
  });
  form.addEventListener('change', (ev) => {
    const t = ev.target as HTMLElement;
    if (t === cityQ) return;
    // changing what kind of scooter resets a hand-picked model
    if (t.matches('input[name="el-plate"], input[name="el-power"], input[name="el-charge"]')) {
      const evSel = form.querySelector<HTMLSelectElement>('#el-ev');
      if (evSel) evSel.value = '';
    }
    syncForm();
    schedule(50);
  });
  form.addEventListener('input', (ev) => {
    if ((ev.target as HTMLElement).matches('#el-km, #el-age')) schedule(300);
  });
  city?.addEventListener('change', () => {
    syncForm();
    schedule(50);
  });
  // the engine starts loading once the page has settled
  window.addEventListener('load', () => idle(() => void load()));
  restoreUrl();
  if (city?.value) schedule(0);
  // the opening above (ElectricOpening): a change there is the same answer here. The first state
  // came from the address, which restoreUrl() has already read, so only the reader's changes count.
  document.addEventListener('el:open', (ev) => {
    const o = (ev as CustomEvent<{ county: string; scrap: 'yes' | 'no'; km: number; charge: 'yes' | 'no'; initial?: boolean }>).detail;
    if (!o || o.initial || !city) return;
    if (city.value !== o.county && cfg.cityNames[o.county]) {
      city.value = o.county;
      syncForm();
    }
    setRadio('el-scrap', o.scrap);
    setRadio('el-charge', o.charge);
    if (o.charge === 'yes') setRadio('el-power', 'home');
    else if (radio('el-power') === 'home') setRadio('el-power', 'subscription');
    const km = form.querySelector<HTMLInputElement>('#el-km');
    if (km && Number(km.value) !== o.km) {
      km.value = String(o.km);
      km.dispatchEvent(new Event('input', { bubbles: true }));
    }
    syncForm();
    schedule(150);
  });
  // a tab left open across midnight on 31 December must not keep yesterday's answer
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && lastDate && lastDate !== todayInTaipei()) schedule(0);
  });
}

// each result already has one announcement (the status line): the panels themselves stay quiet
document.querySelectorAll('.el-result .result__head[aria-live]').forEach((h) => h.removeAttribute('aria-live'));

// row notes in the monthly tables: one button per row opens its note as a full-width row
document.addEventListener('click', (ev) => {
  const b = (ev.target as Element | null)?.closest<HTMLButtonElement>('[data-el-note]');
  if (!b) return;
  const row = document.getElementById(b.getAttribute('aria-controls') ?? '');
  const open = b.getAttribute('aria-expanded') !== 'true';
  b.setAttribute('aria-expanded', String(open));
  row?.toggleAttribute('data-open', open);
});

// worked examples: "start the calculator from this"
document.querySelectorAll<HTMLButtonElement>('[data-el-use]').forEach((btn) =>
  btn.addEventListener('click', async () => {
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
    // wait for the result, then go to it in one jump (a smooth scroll would race the page growing)
    await schedule(0);
    const h = document.getElementById('result-title');
    if (h) {
      h.tabIndex = -1;
      h.focus({ preventScroll: true });
      // 'instant' overrides the page's smooth scrolling, which would race the result growing
      document.getElementById('result')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    }
  }),
);

// worked examples after the first: their working is built here when the reader opens one, for the
// reader's own date (the page ships only each example's verdict, which keeps it light)
async function buildExample(panel: HTMLElement) {
  if (!cfg || panel.dataset.elBuilt !== undefined) return;
  const x = cfg.examples.find((k) => panel.id === `example-${k.key}`);
  if (!x) return;
  panel.dataset.elBuilt = '';
  const today = todayInTaipei();
  if (x.full && today === cfg.built) return;
  const E = await load();
  const at = (slot: 'a' | 'c', date: string) => {
    const root = document.getElementById(`ex-${x.key}-${slot}`);
    if (!root) return;
    try {
      const a = { ...x.answers, date };
      const c = E.choose(a, E.econData);
      const e = E.evaluate(c.situation, E.econData);
      const ctx: RenderCtx = { locale: cfg.locale, data: E.econData, cite: (id) => cfg.cites[id] ?? null, id: root.id, tableLabel: cfg.tableLabel, links: cfg.links };
      apply(root, E.renderResult(e, { ...c, plate: a.plate, power: a.power }, ctx));
      root.querySelector('.result__head[aria-live]')?.removeAttribute('aria-live');
      dayCounts(root);
    } catch {
      /* the verdict shipped with the page stays */
    }
  };
  if (x.before) at('a', today);
  at('c', today > x.after ? today : x.after);
  panel.querySelector('[data-el-more]')?.setAttribute('hidden', '');
}
cfg?.examples.forEach(({ key }) => {
  const panel = document.getElementById(`example-${key}`);
  if (!panel) return;
  const go = () => !panel.hidden && panel.offsetParent !== null && void buildExample(panel);
  new MutationObserver(go).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  // a panel shown without the tabs (wide print, or tabs not set up) is built when it scrolls near
  new IntersectionObserver((es, io) => es.some((x) => x.isIntersecting) && (io.disconnect(), void buildExample(panel)), { rootMargin: '400px' }).observe(panel);
});

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
