/**
 * film.client.ts — the film's player. Enhancement only: without it the page is the stills in
 * order with their captions, and the transcript. It never starts by itself.
 *
 * ONE CLOCK. `t` (seconds of film) is the only state. Every frame: film.context(t) → each
 * numbered slot's attributes → written to the DOM if they changed. Play advances t with
 * requestAnimationFrame; the scrubber, the keys and the transcript set t. There are no CSS
 * animations or transitions on anything inside the picture, so any t can be shown exactly,
 * and jumping to a second gives the same picture as playing to it.
 *
 * The same page is the source of the MP4: with `?export` in the address the stage fills the
 * window, nothing plays, and scripts/film-export.mjs steps the clock through
 * window.__film.drawAt(t), photographing each frame.
 */
import { createFilm, SVG_LAYERS, type Film, type FilmNode } from './scene.ts';
import { hudApply, hudHTML, type HudMemo, type HudText } from './hud.ts';
import { DURATION, POSTER_T, clock } from './timeline.ts';

interface CaptionData {
  id: string;
  t: number;
  dur: number;
  main: string;
  note?: string;
  chip?: { kind: string; label: string; glyph: string };
}
interface MoneyData {
  money: HudText['money'];
  cues: { tags: { main: string; note?: string }; monthly: { main: string; note?: string } };
}
interface PageData {
  text: HudText;
  captions: CaptionData[];
  /** the money part for each coming date on which a figure changes, oldest first */
  periods: ({ from: string } & MoneyData)[];
  /** the money part as of the day the prices were checked: what the MP4 shows */
  asChecked: MoneyData;
  extra: { few: number; dozen: number; full: number };
  drawn: number;
  ui: { play: string; pause: string; position: string };
}

const html = document.documentElement;
const root = document.querySelector<HTMLElement>('[data-film]');
const EXPORT = new URLSearchParams(location.search).has('export');

function start(root: HTMLElement): void {
  const locale = root.dataset.locale === 'en' ? 'en' : 'zh-TW';
  const data = JSON.parse(root.querySelector('[data-film-data]')!.textContent!) as PageData;
  const $ = <T extends Element = HTMLElement>(sel: string): T => root.querySelector<T>(sel)!;
  const pic = $('[data-pic]');
  const svgs = Array.from(root.querySelectorAll<SVGSVGElement>('[data-pic] > [data-layer]'));
  const over = $('[data-over]');
  const hudEl = $('[data-hud]');
  const capMain = $('[data-cap]');
  const capNote = $('[data-note]');
  const capBox = $('[data-capbox]');
  const poster = $('[data-poster]');
  const big = $<HTMLButtonElement>('[data-film-big]');
  const endCard = $('[data-end]');
  const toggleBtn = $<HTMLButtonElement>('[data-film-toggle]');
  const restartBtn = $<HTMLButtonElement>('[data-film-restart]');
  const speedBtn = $<HTMLButtonElement>('[data-film-speed]');
  const seek = $<HTMLInputElement>('[data-film-seek]');
  const timeEl = $('[data-film-time]');
  const say = root.querySelector<HTMLElement>('[data-film-say]');
  const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-line]'));

  // money: the figures true today in Taiwan (the page was built on some earlier day); the MP4 shows the day the prices were checked
  const today = new Date(Date.now() + 288e5).toISOString().slice(0, 10);
  let part: MoneyData = data.periods[0] ?? data.asChecked;
  for (const p of data.periods) if (p.from <= today) part = p;
  if (EXPORT) part = data.asChecked;
  const text: HudText = { ...data.text, money: part.money };
  const captions = data.captions.map((c) => (c.id === 'tags' ? { ...c, ...part.cues.tags, note: part.cues.tags.note } : c.id === 'monthly' ? { ...c, ...part.cues.monthly } : c));
  const cueAt = (time: number): CaptionData => {
    let c = captions[0];
    for (const q of captions) if (time >= q.t) c = q;
    return c;
  };

  let film!: Film;
  let nodes: FilmNode[] = [];
  let els: (Element | undefined)[] = [];
  let cache: Record<string, unknown>[] = [];
  let box = pic.getBoundingClientRect();
  let force = true;
  let shownT = -1;
  const hudMemo: HudMemo = {};

  /** Build the picture for the stage's shape. The camera frames each shot for it; nothing is letterboxed. */
  function build(): void {
    film = createFilm({ locale, aspect: box.width / box.height, px: box.width, id: 'live', text, extra: data.extra, drawn: data.drawn });
    for (const s of svgs) {
      s.innerHTML = film.layers[s.dataset.layer as (typeof SVG_LAYERS)[number]];
      s.setAttribute('viewBox', `0 0 ${film.VW} ${film.VH.toFixed(2)}`);
    }
    over.innerHTML = film.layers.over;
    nodes = film.nodes;
    els = new Array(nodes.length);
    pic.querySelectorAll('[data-n]').forEach((e) => (els[Number((e as HTMLElement | SVGElement).dataset.n)] = e));
    cache = nodes.map(() => ({}));
    force = true;
  }
  build();
  hudEl.innerHTML = hudHTML(text, film.hud(POSTER_T));

  let t = 0;
  let playing = false;
  let begun = EXPORT;
  let last = 0;
  let raf = 0;
  let speed = 1;
  let lastCue: CaptionData | null = null;
  const memo: Record<string, unknown> = {};
  const set = <V>(key: string, val: V, fn: (v: V) => void): void => {
    if (memo[key] !== val) {
      memo[key] = val;
      fn(val);
    }
  };

  function draw(time: number): void {
    const c = film.context(time);
    const lo = Math.min(shownT, time);
    const hi = Math.max(shownT, time);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!force && (hi < n.a || lo > n.b)) continue;
      const el = els[i];
      if (!el) continue;
      const a = n.fn(c);
      const m = cache[i];
      for (const k in a) {
        const v = a[k];
        if (m[k] === v) continue;
        m[k] = v;
        if (n.css) {
          if (v === null || v === undefined) (el as HTMLElement).style.removeProperty(k);
          else (el as HTMLElement).style.setProperty(k, String(v));
        } else if (v === null || v === undefined) el.removeAttribute(k);
        else el.setAttribute(k, String(v));
      }
    }
    shownT = time;
    force = false;
    const h = film.hud(time, c);
    hudApply(hudEl, text, h, hudMemo);
    set('tag', begun ? h.tag : 'street', (v) => (pic.dataset.tag = v));
    set('end', begun && !EXPORT ? Math.round(h.end * 20) / 20 : 0, (v) => {
      endCard.style.opacity = String(v);
      endCard.toggleAttribute('data-on', v > 0.5);
    });
  }

  function render(): void {
    const ended = t >= DURATION;
    const time = begun ? Math.min(t, DURATION) : POSTER_T;
    draw(time);

    // captions: the cue, with a short rise on entry and a fade before the next one
    const cue = cueAt(time);
    if (cue !== lastCue) {
      lastCue = cue;
      capMain.textContent = cue.main;
      capNote.textContent = cue.note ?? '';
      if (cue.note && cue.chip) capNote.insertAdjacentHTML('beforeend', ` <span class="cap__chip">${cue.chip.glyph}${cue.chip.label}</span>`);
      if (say && begun) say.textContent = cue.main + (cue.note ? ' ' + cue.note : '');
      lines.forEach((li) => li.toggleAttribute('data-now', begun && li.dataset.line === cue.id));
    }
    const u = time - cue.t;
    const out = cue.t + cue.dur - time;
    const k = Math.min(1, u / 0.26) * (out < 0.16 && time < DURATION - 0.2 ? Math.max(0, out / 0.16) : 1);
    set('capO', begun ? Math.round(k * 20) / 20 : 0, (v) => (capBox.style.opacity = String(v)));
    set('capY', Math.round((1 - Math.min(1, u / 0.3)) * 8), (v) => (capBox.style.transform = `translateY(${v}px)`));

    const at = begun ? time : 0; // the poster shows a later frame, but the film is at 0:00
    set('time', Math.floor(at), (v) => {
      timeEl.textContent = clock(v);
      seek.setAttribute('aria-valuetext', data.ui.position.replace('{time}', clock(v)).replace('{total}', clock(DURATION)));
    });
    if (document.activeElement !== seek || playing) set('seek', Math.round(at * 10) / 10, (v) => (seek.value = String(v)));
    set('pct', Math.round((at / DURATION) * 1000) / 10, (v) => seek.style.setProperty('--pct', v + '%'));
    set('playing', playing, (v) => {
      root.toggleAttribute('data-playing', v);
      toggleBtn.setAttribute('aria-label', v ? data.ui.pause : data.ui.play);
    });
    set('begun', begun, (v) => {
      root.toggleAttribute('data-begun', v);
      poster.hidden = v;
    });
    set('ended', ended, (v) => root.toggleAttribute('data-ended', v));
  }

  function tick(now: number): void {
    if (!playing) return;
    const dt = (now - last) / 1000;
    last = now;
    if (dt > 0 && dt < 0.5) t += dt * speed; // a long gap means the tab slept: do not jump
    if (t >= DURATION) {
      t = DURATION;
      playing = false;
    }
    render();
    if (playing) raf = requestAnimationFrame(tick);
  }
  function play(): void {
    if (playing) return;
    if (t >= DURATION) t = 0;
    begun = true;
    playing = true;
    last = performance.now();
    render();
    raf = requestAnimationFrame(tick);
  }
  function pause(): void {
    playing = false;
    cancelAnimationFrame(raf);
    render();
  }
  const toggle = (): void => (playing ? pause() : play());
  function go(to: number): void {
    const next = Math.max(0, Math.min(DURATION, to));
    // a jump redraws every part, so a second reached by seeking is exactly the second reached by playing
    if (Math.abs(next - t) > 0.25) force = true;
    t = next;
    begun = true;
    last = performance.now();
    render();
  }
  function intoView(): void {
    const b = $('[data-stage]').getBoundingClientRect();
    if (b.top < 0 || b.bottom > window.innerHeight) {
      const header = document.querySelector('.site-header');
      const top = header ? header.getBoundingClientRect().bottom : 0;
      window.scrollBy({ top: b.top - Math.max(0, top), behavior: 'auto' });
    }
  }

  big.addEventListener('click', () => {
    play();
    intoView();
    toggleBtn.focus({ preventScroll: true });
  });
  toggleBtn.addEventListener('click', toggle);
  pic.addEventListener('click', (e) => {
    const target = e.target as Element;
    if (target.closest('a, button')) {
      if (target.closest('a')) pause();
      return;
    }
    if (begun) toggle();
  });
  const again = (): void => {
    go(0);
    play();
  };
  restartBtn.addEventListener('click', again);
  root.querySelectorAll('[data-film-again]').forEach((b) =>
    b.addEventListener('click', () => {
      again();
      toggleBtn.focus({ preventScroll: true });
    }),
  );
  speedBtn.addEventListener('click', () => {
    speed = speed === 1 ? 0.75 : 1;
    speedBtn.setAttribute('aria-pressed', String(speed !== 1));
  });
  seek.addEventListener('input', () => go(Number(seek.value)));
  root.querySelectorAll<HTMLElement>('[data-film-jump]').forEach((btn) =>
    btn.addEventListener('click', () => {
      go(Number(btn.dataset.filmJump));
      intoView();
      toggleBtn.focus({ preventScroll: true });
    }),
  );
  root.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as Element;
    if (!target.closest('[data-stage]') && target !== root) return;
    const onSeek = target === seek;
    const onControl = target.closest('button, a, input, summary') !== null;
    // on the seek bar the arrows move 5 seconds, as the keyboard hint says (the range's own step is 0.1 s)
    if (onSeek && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      go(t + (e.key === 'ArrowRight' ? 5 : -5));
      return;
    }
    if ((e.key === ' ' || e.key === 'k') && !(onControl && e.key === ' ' && !onSeek)) {
      e.preventDefault();
      toggle();
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !onSeek) {
      e.preventDefault();
      go(t + (e.key === 'ArrowRight' ? 5 : -5));
    } else if (e.key === 'Home' && !onSeek) {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End' && !onSeek) {
      e.preventDefault();
      go(DURATION);
    }
  });
  document.addEventListener('visibilitychange', () => document.hidden && playing && pause());

  // the stage follows its box: the picture is rebuilt for the new shape (a turn of the phone, a resized window)
  let pending = 0;
  new ResizeObserver(() => {
    const b = pic.getBoundingClientRect();
    if (!b.width || !b.height || (Math.abs(b.width - box.width) < 1 && Math.abs(b.height - box.height) < 1)) return;
    box = b;
    clearTimeout(pending);
    pending = window.setTimeout(() => {
      build();
      render();
    }, 60);
  }).observe(pic);

  // for the MP4 export, the tests and the performance probe
  (window as unknown as { __film: unknown }).__film = {
    go,
    play,
    pause,
    get t() {
      return t;
    },
    get playing() {
      return playing;
    },
    duration: DURATION,
    captions,
    film: () => film,
    nodes: () => nodes.length,
    /** Show exactly time `time`, as if it had always been showing. */
    drawAt(time: number) {
      force = true;
      begun = true;
      playing = false;
      t = time;
      render();
    },
  };
  html.setAttribute('data-film-ready', '');
  render();
}

if (root) {
  if (EXPORT) {
    html.classList.add('film-live', 'film-export');
    start(root);
  } else if (!matchMedia('(prefers-reduced-motion: reduce)').matches || html.dataset.motion === 'on') {
    if (html.dataset.motion === 'off') {
      // the reader switched animation off in the menu: the film stays laid out as stills, and can still be asked for
      html.classList.remove('film-live');
      offer(root);
    } else {
      html.classList.add('film-live');
      start(root);
    }
  } else offer(root);
}

/** Reduced motion: the film stays laid out as stills. The reader may still ask for it to play. */
function offer(root: HTMLElement): void {
  // the transcript's time buttons go to the still nearest that second (the player is not running)
  root.querySelectorAll<HTMLElement>('[data-film-jump]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (html.classList.contains('film-live')) return;
      const at = Number(btn.dataset.filmJump);
      let best: HTMLElement | null = null;
      root.querySelectorAll<HTMLElement>('[data-still-t]').forEach((li) => {
        if (Number(li.dataset.stillT) <= at + 0.01) best = li;
      });
      const target = (best ?? root.querySelector<HTMLElement>('[data-still-t]')) as HTMLElement | null;
      if (!target) return;
      target.scrollIntoView({ block: 'start' });
      target.focus({ preventScroll: true });
    }),
  );
  const optIn = root.querySelector<HTMLButtonElement>('[data-film-optin]');
  if (!optIn) return;
  optIn.hidden = false;
  optIn.addEventListener('click', () => {
    html.classList.add('film-live');
    start(root);
    root.querySelector<HTMLElement>('[data-film-big]')?.focus();
  });
}
