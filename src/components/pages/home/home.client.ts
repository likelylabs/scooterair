// Browser side of the home page's two money screens (13 買的那天, 14 每個月) and of every link
// that hands the reader to the calculator.
//
// - Remembers the county, the scrapping answer and the distance (localStorage `sa-home`), so a
//   reader who comes back finds their own figure, already filled in.
// - Picks the table true on the reader's day in Taiwan, so a page cached past a deadline never
//   shows a stale price or strip (the site rebuilds nightly; the page carries each coming period).
// - Redraws the headline, the figure, the bars, the body, the strip and the sheet's working from
//   the same functions the build used (./money-view.ts). No engine here: every figure is in the
//   page's JSON, so a change is instant.
// - Carries the choice into every link to the calculator: /electric/?county=…&scrap=…&km=…
//
// Without scripting the page shows the default case (新北市, a scooter to scrap, 300 km) and the
// three controls are not shown.

import { tableOn, type OpenTable } from '../electric/opening-view.ts';
import { todayInTaipei } from '../../../lib/site-state.ts';
import { updateHtmlChart } from '../../charts/core/html.ts';
import { monthlyBarsTitle, renderMonthlyBars } from '../../charts/core/monthlyBars.ts';
import { renderPriceBars } from '../../charts/core/priceBars.ts';
import * as V from './money-view.ts';

const KEY = 'sa-home';
const raw = document.getElementById('hm-data')?.textContent;

if (raw) {
  const P = JSON.parse(raw) as V.HomeMoneyPayload;
  const { D } = P;
  const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];

  const select = $<HTMLSelectElement>('[data-hm-county]');
  const radio = (screen: string, name: string, value?: string) => $<HTMLInputElement>(`#${screen} [data-pick-input="${name}"]${value === undefined ? ':checked' : `[value="${value}"]`}`);

  const stored = (): V.HomeChoice => {
    try {
      return V.cleanChoice(D, JSON.parse(localStorage.getItem(KEY) ?? 'null'));
    } catch {
      return V.cleanChoice(D, null);
    }
  };
  const read = (): V.HomeChoice =>
    V.cleanChoice(D, {
      county: select?.value,
      scrap: radio('s-13', 'scrap')?.value,
      km: radio('s-14', 'km')?.value,
    });
  const remember = (c: V.HomeChoice) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      /* private mode: the choice still holds for this visit */
    }
  };

  /** Put a choice into the controls without announcing it as the reader's own change. */
  function apply(c: V.HomeChoice) {
    if (select) select.value = c.county;
    for (const [screen, name, value] of [
      ['s-13', 'scrap', c.scrap],
      ['s-14', 'km', String(c.km)],
    ] as const) {
      const input = radio(screen, name, value);
      if (!input || input.checked) continue;
      input.checked = true;
      // stamp the scope too: the switch's own script may not be listening yet
      input.closest('[data-pick-scope]')?.setAttribute(`data-pick-${name}`, value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  let table: OpenTable = tableOn(D, todayInTaipei());
  const setText = (sel: string, text: string) => $$(sel).forEach((el) => el.textContent !== text && (el.textContent = text));
  const setHtml = (sel: string, html: string) => $$(sel).forEach((el) => el.innerHTML !== html && (el.innerHTML = html));

  function draw(c: V.HomeChoice) {
    // 13 · the day you buy
    setHtml('#s-13-h', V.phrasedHtml(V.headlineMarks(V.buyHead(P, table, c), D.locale)));
    setHtml('[data-hm-fig]', V.figureHtml(P, table, c));
    const price = $('#hm-price');
    if (price) updateHtmlChart(price, renderPriceBars(V.priceBarsProps(P, table, c)));
    setText('[data-hm-body13]', V.buyBody(P, table));
    setText('[data-hm-strip]', V.stripOf(P, table, c));
    setHtml('[data-hm-lines]', V.buyLinesHtml(P, table, c));
    // 14 · each month
    setHtml('#s-14-h', V.phrasedHtml(V.headlineMarks(V.monthHead(P, table, c.km), D.locale)));
    const month = $('#hm-month');
    if (month) {
      updateHtmlChart(month, renderMonthlyBars(V.monthlyBarsProps(P, table, c.km)));
      month.setAttribute('aria-label', monthlyBarsTitle(D.locale, c.km));
    }
    setText('[data-hm-body14]', V.monthBody(P, table, c.km));
    setText('[data-hm-under]', V.monthUnder(P, table, c));
    // every way into the calculator carries the choice
    const to = V.calcHref(P.calc, c);
    $$<HTMLAnchorElement>('main a[href], dialog a[href]').forEach((a) => {
      const path = (a.getAttribute('href') ?? '').split(/[?#]/)[0];
      if (path === P.calc) a.setAttribute('href', to);
    });
  }

  // first paint: the reader's remembered choice, on the reader's day
  const first = stored();
  apply(first);
  draw(first);

  const changed = () => {
    const c = read();
    remember(c);
    draw(c);
  };
  select?.addEventListener('change', changed);
  document.addEventListener('sa:pick', (e) => {
    const name = (e as CustomEvent<{ name: string }>).detail?.name;
    if (name === 'scrap' || name === 'km') changed();
  });
  // a sheet opened later moves its panel: fill it again so its working is never the default's
  document.addEventListener('click', (e) => {
    if ((e.target as Element).closest?.('[data-sheet-open], a[href^="#how-"]')) requestAnimationFrame(() => draw(read()));
  });
  // a tab left open across midnight on a deadline must not keep yesterday's figures
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const next = tableOn(D, todayInTaipei());
    if (next !== table) {
      table = next;
      draw(read());
    }
  });
}
