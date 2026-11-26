/**
 * swap.client.ts — the swap slider of G10 (SwapScene + SwapControl).
 *
 * State lives on the nearest [data-pick-scope] (every <Screen> is one) as
 * data-swap-n="0…total": how many of the scooters are electric. Changing it
 *   - redraws every SwapScene in the scope (classes on [data-swap-i] parts),
 *   - moves every SwapControl in the scope and rewrites its line of text,
 *   - fills any element in the scope marked data-swap-out="n" | "rest" | "pct"
 *     (the host's chip: 機車排的廢氣：少 <b data-swap-out="pct">100</b>%),
 *   - dispatches `sa:swap` ({ n, total }) on the scope.
 * On arrival the picture plays once from 0 to the resting value, then rests.
 */
const scopeOf = (el: Element): HTMLElement => el.closest<HTMLElement>('[data-pick-scope]') ?? (el.parentElement as HTMLElement);

function paint(scope: HTMLElement, n: number): void {
  scope.querySelectorAll<HTMLElement>('.scene--swap').forEach((fig) => {
    fig.dataset.swapN = String(n);
    fig.querySelectorAll<SVGElement>('[data-swap-i]').forEach((el) => {
      const ev = Number(el.dataset.swapI) < n;
      if (el.classList.contains('swap-ev')) el.classList.toggle('is-on', ev);
      else el.classList.toggle('is-off', ev);
    });
  });
}

export function setSwap(scope: HTMLElement, n: number, announce = true): void {
  const ctl = scope.querySelector<HTMLElement>('[data-swap-control]');
  const fig = scope.querySelector<HTMLElement>('.scene--swap');
  const total = Number(ctl?.dataset.total ?? fig?.dataset.swapTotal ?? 10);
  n = Math.max(0, Math.min(total, Math.round(n)));
  scope.setAttribute('data-swap-n', String(n));
  paint(scope, n);
  scope.querySelectorAll<HTMLElement>('[data-swap-control]').forEach((c) => {
    const range = c.querySelector<HTMLInputElement>('input[type="range"]');
    if (range) {
      range.value = String(n);
      range.style.setProperty('--fill', `${(n / total) * 100}%`);
    }
    const out = c.querySelector<HTMLElement>('[data-swap-text]');
    if (out && announce) out.textContent = (out.dataset.template ?? '').replace('{n}', String(n)).replace('{rest}', String(total - n));
    // aria-disabled, never `disabled`: a button that disables itself while focused drops keyboard focus to <body>
    c.querySelector<HTMLButtonElement>('[data-step="-1"]')?.setAttribute('aria-disabled', String(n <= 0));
    c.querySelector<HTMLButtonElement>('[data-step="1"]')?.setAttribute('aria-disabled', String(n >= total));
  });
  scope.querySelectorAll<HTMLElement>('[data-swap-out]').forEach((o) => {
    o.textContent = String(o.dataset.swapOut === 'pct' ? Math.round((n / total) * 100) : o.dataset.swapOut === 'rest' ? total - n : n);
  });
  // a chip may carry its own words for "all of it" (機車排的廢氣：全部沒有了) instead of 少 100%
  scope.querySelectorAll<HTMLElement>('[data-swap-all]').forEach((o) => {
    const all = n >= total;
    o.querySelectorAll<HTMLElement>('[data-swap-when="all"]').forEach((x) => (x.hidden = !all));
    o.querySelectorAll<HTMLElement>('[data-swap-when="part"]').forEach((x) => (x.hidden = all));
  });
  scope.dispatchEvent(new CustomEvent('sa:swap', { bubbles: true, detail: { n, total } }));
}

const playing = new WeakMap<HTMLElement, number>();
const stop = (scope: HTMLElement) => {
  const t = playing.get(scope);
  if (t) clearInterval(t);
  playing.delete(scope);
};

declare global {
  interface Window {
    __saSwap?: boolean;
  }
}
if (!window.__saSwap) {
  window.__saSwap = true;
  document.addEventListener('input', (e) => {
    const range = (e.target as Element).closest?.('[data-swap-control] input[type="range"]') as HTMLInputElement | null;
    if (!range) return;
    const scope = scopeOf(range);
    stop(scope);
    setSwap(scope, Number(range.value));
  });
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-swap-control] button[data-step]');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    const scope = scopeOf(btn);
    stop(scope);
    setSwap(scope, Number(scope.getAttribute('data-swap-n') ?? btn.closest<HTMLElement>('[data-swap-control]')!.dataset.value ?? 0) + Number(btn.dataset.step));
  });
  // once, on arrival: from all petrol to the resting value, one scooter at a time
  document.addEventListener('sa:arrive', (e) => {
    const fig = e.target as HTMLElement;
    if (!fig.classList.contains('scene--swap') || fig.dataset.swapPlay !== 'true') return;
    const scope = scopeOf(fig);
    const rest = Number(fig.dataset.swapRest ?? 10);
    // a reader already on the controls (keyboard) is never overridden by the arrival play
    if (scope.querySelector('[data-swap-control]')?.contains(document.activeElement)) return;
    scope.addEventListener('focusin', (f) => {
      if (!playing.has(scope) || !(f.target as Element).closest?.('[data-swap-control]')) return;
      stop(scope);
      setSwap(scope, rest);
    });
    let n = 0;
    setSwap(scope, 0, false);
    const t = window.setInterval(() => {
      n += 1;
      setSwap(scope, n, n >= rest);
      if (n >= rest) stop(scope);
    }, 300);
    playing.set(scope, t);
    document.addEventListener('sa:motion', (m) => {
      if ((m as CustomEvent<{ on: boolean }>).detail.on || !playing.has(scope)) return;
      stop(scope);
      setSwap(scope, rest);
    }, { once: true });
  });
}
