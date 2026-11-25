// The film's player. Enhancement only: without it the page is the frames in order with their
// captions (see Film.astro). It never starts by itself; every start is a press or a key.
//
// What it does: keeps one number (seconds of film), shows the beat and the clock for it, and
// writes the same count into the signal's LED inside the scene frame, so the countdown in the
// picture and the countdown on the bar are one clock. Frames are switched with visibility:
// nothing fades, so no frame is ever on screen half-drawn.

import { BEATS, DURATION, STARTS, beatAt, clockAt, clockTime } from './timeline';

type Text = { play: string; pause: string; restart: string; ended: string; position: string; red: string; reset: string; paused: string; green: string; total: string };

const html = document.documentElement;
const root = document.querySelector<HTMLElement>('[data-film]');

/* ---- the LED inside a scene ------------------------------------------------------------- */

/** How the art draws each count, read back from the art at build time (LedTable.astro). */
type LedTable = { t: string[]; o: string[] } | { all: Record<string, string> } | null;
const two = (n: number) => String(Math.max(0, Math.min(99, Math.round(n)))).padStart(2, '0');
const drawn = (table: LedTable, text: string): string | undefined => (!table ? undefined : 'all' in table ? table.all[text] : table.t[Number(text[0])] + table.o[Number(text[1])]);

/**
 * Find the countdown in a rendered <StreetScene> and return a function that redraws it, or null
 * when the frame has none (the kerb and green frames). The path is found by its content: the one
 * whose `d` is exactly how the art draws the count this frame was built with. If none is, the
 * frame is left alone, minus its digits: a countdown that cannot follow the clock is not shown.
 */
function sceneLed(svg: SVGSVGElement, table: LedTable, shown: string): ((text: string) => void) | null {
  if (!shown) return null;
  const want = drawn(table, shown);
  const path = want ? Array.from(svg.querySelectorAll<SVGPathElement>('path[d]')).find((p) => p.getAttribute('d') === want) : undefined;
  if (!path) {
    svg.querySelectorAll<SVGElement>('.scene-world > path[class*="a-led"]').forEach((p) => (p.style.visibility = 'hidden'));
    return null;
  }
  const label = svg.getAttribute('aria-label');
  let last = shown;
  return (text) => {
    if (text === last) return;
    const d = drawn(table, text);
    if (!d) return;
    last = text;
    path.setAttribute('d', d);
    if (label) svg.setAttribute('aria-label', label.replace(shown, text));
  };
}

/* ---- the player ---------------------------------------------------------------------------- */

function start(el: HTMLElement) {
  const text = JSON.parse(el.dataset.text ?? '{}') as Text;
  const stage = el.querySelector<HTMLElement>('[data-film-stage]')!;
  const frames = new Map<string, HTMLElement>();
  const leds = new Map<string, ((text: string) => void)[]>();
  const tables = JSON.parse(el.querySelector('[data-film-led-table]')?.textContent || '{}') as { compact?: LedTable; wide?: LedTable };
  el.querySelectorAll<HTMLElement>('[data-frame-el]').forEach((f) => {
    const id = f.dataset.frameEl!;
    frames.set(id, f);
    const shown = f.dataset.count === undefined ? '' : two(Number(f.dataset.count));
    leds.set(
      id,
      Array.from(f.querySelectorAll<SVGSVGElement>('svg.scene__svg'), (svg) => sceneLed(svg, (svg.classList.contains('scene__svg--wide') ? tables.wide : tables.compact) ?? null, shown)).filter((fn): fn is (text: string) => void => fn !== null),
    );
  });
  const caps = Array.from(el.querySelectorAll<HTMLElement>('.beat[data-i] [data-cap]'));
  const end = el.querySelector<HTMLElement>('[data-end]');
  const led = el.querySelector<HTMLElement>('[data-film-led]');
  const clock = el.querySelector<HTMLElement>('[data-film-clock]');
  const time = el.querySelector<HTMLElement>('[data-film-time]');
  const big = el.querySelector<HTMLButtonElement>('[data-film-big]');
  const toggleBtn = el.querySelector<HTMLButtonElement>('[data-film-toggle]');
  const restartBtn = el.querySelector<HTMLButtonElement>('[data-film-restart]');
  const seek = el.querySelector<HTMLInputElement>('[data-film-seek]');
  const say = el.querySelector<HTMLElement>('[data-film-say]');
  const lines = Array.from(el.querySelectorAll<HTMLElement>('.film__lines li'));

  let t = 0;
  let playing = false;
  let begun = false;
  let last = 0;
  let raf = 0;
  let shown = '';
  let said = -2;

  const setLed = (value: number | null, phase: string) => {
    if (!led) return;
    const str = value === null ? '' : two(value);
    led.dataset.phase = phase;
    led.querySelectorAll<SVGGElement>('[data-led]').forEach((g, pos) => {
      g.querySelectorAll<SVGPathElement>('path').forEach((p) => p.toggleAttribute('data-on', str ? p.dataset.d === str[pos] : p.classList.contains('film__dash')));
    });
  };

  const render = () => {
    const ended = t >= DURATION;
    const i = beatAt(t);
    const b = BEATS[i];
    const c = clockAt(t);
    const sec = Math.floor(t);
    const key = `${ended ? 'end' : i}|${sec}|${playing ? 1 : 0}|${begun ? 1 : 0}`;
    if (key === shown) return;
    shown = key;

    frames.forEach((f, id) => f.toggleAttribute('data-on', !ended && id === b.frame));
    caps.forEach((cap, k) => {
      cap.toggleAttribute('data-on', !ended && k === i);
      const then = cap.querySelector<HTMLElement>('[data-cue]');
      if (then) then.toggleAttribute('data-shown', k === i && t - STARTS[i] >= Number(then.dataset.cue));
    });
    end?.toggleAttribute('data-on', ended);

    const label = ended ? text.ended : c.phase === 'paused' ? text.paused : c.phase === 'green' ? text.green : (b.id === 'l7' && c.count === b.count[0] ? text.reset : text.red).replace('{n}', String(c.count));
    setLed(ended ? null : c.count, ended ? 'off' : c.phase);
    if (clock) clock.textContent = label;
    if (!ended) leds.get(b.frame)?.forEach((draw) => draw(two(c.count)));
    if (time) time.textContent = clockTime(Math.min(t, DURATION));
    if (seek) {
      seek.value = String(sec);
      seek.setAttribute('aria-valuetext', text.position.replace('{time}', clockTime(sec)).replace('{total}', text.total).replace('{clock}', label));
    }
    el.toggleAttribute('data-playing', playing);
    el.toggleAttribute('data-ended', ended);
    if (toggleBtn) toggleBtn.setAttribute('aria-label', playing ? text.pause : text.play);
    if (big) big.hidden = begun;
    lines.forEach((li, k) => li.toggleAttribute('data-now', begun && (ended ? k === lines.length - 1 : k === i)));

    // one polite announcement per beat, for readers who cannot see the caption change
    const sayKey = ended ? -1 : i;
    if (say && begun && sayKey !== said) {
      said = sayKey;
      const src = ended ? end : caps[i];
      say.textContent = src ? Array.from(src.querySelectorAll('.beat__line, .beat__sentence'), (n) => n.textContent).join(' ') : '';
    }
  };

  const tick = (now: number) => {
    if (!playing) return;
    const dt = (now - last) / 1000;
    last = now;
    // a long gap means the tab was asleep: do not jump the film forward
    if (dt > 0 && dt < 1) t += dt;
    if (t >= DURATION) {
      t = DURATION;
      playing = false;
    }
    render();
    if (playing) raf = requestAnimationFrame(tick);
  };
  const play = () => {
    if (playing) return;
    if (t >= DURATION) t = 0;
    begun = true;
    playing = true;
    last = performance.now();
    render();
    raf = requestAnimationFrame(tick);
  };
  const pause = () => {
    playing = false;
    cancelAnimationFrame(raf);
    render();
  };
  const toggle = () => (playing ? pause() : play());
  const go = (to: number) => {
    t = Math.max(0, Math.min(DURATION, to));
    begun = true;
    last = performance.now();
    render();
  };
  const intoView = () => {
    const box = stage.getBoundingClientRect();
    // bring the stage up under the site header when it is not all on screen where it is
    if (box.top < 0 || box.bottom > window.innerHeight) {
      const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollBy({ top: box.top - Math.max(0, header), behavior: quiet ? 'auto' : 'smooth' });
    }
  };

  big?.addEventListener('click', () => {
    play();
    intoView();
    toggleBtn?.focus({ preventScroll: true });
  });
  toggleBtn?.addEventListener('click', toggle);
  // the picture itself plays and pauses, as on any player
  frames.forEach((f) => f.addEventListener('click', () => begun && toggle()));
  restartBtn?.addEventListener('click', () => {
    go(0);
    play();
  });
  seek?.addEventListener('input', () => go(Number(seek.value)));
  el.querySelectorAll<HTMLButtonElement>('[data-film-jump]').forEach((btn) =>
    btn.addEventListener('click', () => {
      go(Number(btn.dataset.filmJump));
      intoView();
    }),
  );
  // Keys, anywhere inside the film. The scrubber keeps its own arrow keys; buttons and links keep
  // Space and Enter.
  el.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    const onSeek = target === seek;
    const onControl = target.closest('button, a, input, summary') !== null;
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

  html.setAttribute('data-film-ready', '');
  render();
}

if (root) {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // normally already set before first paint (see 90.astro); set again in case that was undone
    html.classList.add('film-live');
    start(root);
  } else {
    // Reduced motion: the film stays laid out as stills. The reader may still ask for it to play.
    const optIn = root.querySelector<HTMLButtonElement>('[data-film-optin]');
    if (optIn) {
      optIn.hidden = false;
      optIn.addEventListener('click', () => {
        html.classList.add('film-live');
        start(root);
        root.querySelector<HTMLElement>('[data-film-big]')?.focus();
      });
    }
  }
}
