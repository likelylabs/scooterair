/**
 * hud.ts — what sits over the picture as HTML: the count of scooters and the corner clock.
 *
 * One template for the live player and for the pre-rendered stills: `hudHTML(text, state)`
 * returns the markup for a state from film.hud(t); the player then keeps the same elements up
 * to date with `hudApply(el, text, state, memo)`.
 *
 * There is no number panel (removed 2026-11-28: it showed carbon monoxide, which is off the
 * main path). Every word arrives in `text` (./film-data.ts); nothing is typed here.
 */
import { ledDigitRuns } from '../../art/parts.ts';
import type { FilmText, HudState } from './scene.ts';

export type HudText = FilmText;

const two = (n: number): string => String(Math.max(0, Math.min(99, Math.round(n)))).padStart(2, '0');
const ledD = (n: number): string => {
  const s = two(n);
  return ledDigitRuns(s[0], 2, 2, 2) + ledDigitRuns(s[1], 2, 14, 2);
};
const esc = (s: string | number): string => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ffState = (st: HudState): string => (st.hold ? 'hold' : st.ff ? (st.ffWord ? 'ff word' : 'ff') : '');
const count = (text: FilmText, n: number): string => text.scooters.replace('{n}', String(n));

export function hudHTML(text: HudText, st: HudState): string {
  const vis = (v: number): string => `style="opacity:${v};visibility:${v > 0 ? 'visible' : 'hidden'}"`;
  return (
    '<div class="hud__left">' +
    `<p class="hud__count" data-hud-scooters ${vis(st.scooters === null ? 0 : 1)}><svg class="hud__sc" viewBox="-4 -118 196 122" aria-hidden="true" focusable="false"><use href="#f-sc-gas-bare"/></svg><span data-hud-n>${esc(count(text, st.scooters ?? 0))}</span></p>` +
    '</div>' +
    `<div class="hud__clock" data-hud-clock data-lamp="${st.lamp}" ${vis(st.clock)}>` +
    `<svg viewBox="0 0 26 18" aria-hidden="true" focusable="false"><path class="hud__led" data-hud-led d="${ledD(st.led === null ? 0 : st.led)}"/></svg>` +
    `<span class="hud__ff" data-hud-ff data-on="${ffState(st)}"><i class="hud__ff-a">${st.ff > 1 ? '▸▸▸' : '▸▸'}</i><i class="hud__ff-w">${esc(text.fast)}</i><i class="hud__ff-b">❚❚</i></span>` +
    '</div>'
  );
}

/** Elements and last values the player keeps between frames. */
export type HudMemo = Record<string, unknown> & { q?: Record<string, HTMLElement | SVGElement | null> };

/** Bring an existing HUD to state `st`, touching only what changed. */
export function hudApply(el: HTMLElement, text: HudText, st: HudState, m: HudMemo): void {
  if (!m.q) {
    m.q = {
      scooters: el.querySelector<HTMLElement>('[data-hud-scooters]'),
      n: el.querySelector<HTMLElement>('[data-hud-n]'),
      clock: el.querySelector<HTMLElement>('[data-hud-clock]'),
      led: el.querySelector<SVGElement>('[data-hud-led]'),
      ff: el.querySelector<HTMLElement>('[data-hud-ff]'),
      ffa: el.querySelector<HTMLElement>('.hud__ff-a'),
    };
  }
  const q = m.q as Record<string, HTMLElement>;
  const set = <V>(key: string, val: V, fn: (v: V) => void): void => {
    if (m[key] !== val) {
      m[key] = val;
      fn(val);
    }
  };
  const fade = (node: HTMLElement) => (v: number) => {
    node.style.opacity = String(v);
    node.style.visibility = v === 0 ? 'hidden' : 'visible';
  };
  set('sc', st.scooters === null ? 0 : 1, fade(q.scooters));
  if (st.scooters !== null) set('n', st.scooters, (v) => (q.n.textContent = count(text, v)));
  set('clock', Math.round(st.clock * 10) / 10, fade(q.clock));
  set('lamp', st.lamp, (v) => (q.clock.dataset.lamp = v));
  if (st.led !== null) set('led', st.led, (v) => q.led.setAttribute('d', ledD(v)));
  set('ff', ffState(st), (v) => (q.ff.dataset.on = v));
  set('ffn', st.ff > 1 ? '▸▸▸' : '▸▸', (v) => (q.ffa.textContent = v));
}
