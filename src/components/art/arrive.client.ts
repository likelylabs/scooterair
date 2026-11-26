/**
 * arrive.client.ts — plays a scene's one-time arrival (brief 5.3: "once, on
 * arrival, then rest, under 4 seconds").
 *
 * A scene that has something to play carries `data-arrive` (SceneFrame's
 * `arrive` prop). The resting state of every picture is its final state, so
 * with no script, with reduced motion or with the reader's 動畫 switch off,
 * nothing here is needed and nothing moves.
 *
 * When motion is welcome:
 *   1. SceneFrame's inline script puts `is-armed` on the figure before first
 *      paint: art.css holds the animated parts at their starting look.
 *   2. When a third of the picture is on screen this script swaps `is-armed`
 *      for `is-arrived` (art.css runs the animations, each written from its
 *      starting look to the resting state) and dispatches `sa:arrive` on the
 *      figure for scenes that count or step with a script.
 * It happens once per page view.
 */
import { motionOk } from '@/components/ui/motion.client';

declare global {
  interface Window {
    __saArt?: boolean;
  }
}

function arrive(el: Element): void {
  const play = el.classList.contains('is-armed') && motionOk();
  el.classList.remove('is-armed');
  if (el.classList.contains('is-arrived')) return;
  if (!play) return;
  el.classList.add('is-arrived');
  el.dispatchEvent(new CustomEvent('sa:arrive', { bubbles: true }));
}

if (!window.__saArt) {
  window.__saArt = true;
  const scenes = [...document.querySelectorAll('[data-arrive]')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          arrive(e.target);
        }
      },
      { threshold: 0.35 },
    );
    scenes.forEach((s) => io.observe(s));
  } else scenes.forEach((s) => s.classList.remove('is-armed'));
  // the gentle permanent motion (drifting air, breathing rings) pauses while its picture is off
  // screen, so a long page does not keep hundreds of animations running on a small phone
  if ('IntersectionObserver' in window) {
    const idle = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting);
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('.scene').forEach((s) => idle.observe(s));
  }
  // the reader switches animation off while a scene waits: show it at rest
  document.addEventListener('sa:motion', (e) => {
    if (!(e as CustomEvent<{ on: boolean }>).detail.on) scenes.forEach((s) => s.classList.remove('is-armed'));
  });
}
