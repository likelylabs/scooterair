/**
 * Arriving (docs/redesign-brief.md 5.3): a chart's bars and bands grow once, and its dots pop in,
 * when the chart scrolls into view. Loaded once by every HTML chart component.
 *
 * The chart's wrapper carries `data-grow`. This script moves it through:
 *   ''      as printed: the chart at rest (also the state without JavaScript)
 *   'wait'  below the fold when the page opened: marks hidden until the chart arrives
 *   'go'    arriving: charts.css plays the growth, once
 *   'done'  at rest again; a redraw (updateHtmlChart) or a hidden variant shown later never replays it
 *
 * A chart already on screen when the page opens is left at rest: it has not "arrived", and
 * drawing it and then growing it again would only flicker. With reduced motion, or the reader's
 * 動畫 switch off, nothing is ever hidden and nothing moves.
 */
import { motionOk } from '../../ui/motion.client';

const DONE_AFTER = 1400;

function arm(): void {
  const charts = [...document.querySelectorAll<HTMLElement>('[data-grow=""]')];
  if (!charts.length) return;
  if (!('IntersectionObserver' in window) || !motionOk()) {
    charts.forEach((c) => (c.dataset.grow = 'done'));
    return;
  }
  const first = new WeakSet<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        const seenBefore = first.has(el);
        first.add(el);
        if (!seenBefore && e.isIntersecting) {
          // on screen from the start: at rest
          el.dataset.grow = 'done';
          io.unobserve(el);
        } else if (!seenBefore) {
          // hidden charts (a variant not chosen) have no box: they never wait, they are just done
          if (el.getClientRects().length === 0) {
            el.dataset.grow = 'done';
            io.unobserve(el);
          } else el.dataset.grow = 'wait';
        } else if (e.isIntersecting) {
          el.dataset.grow = motionOk() ? 'go' : 'done';
          io.unobserve(el);
          window.setTimeout(() => (el.dataset.grow = 'done'), DONE_AFTER);
        }
      }
    },
    { threshold: 0.3 },
  );
  charts.forEach((c) => io.observe(c));
  // the reader switches animation off while charts are still waiting: show them
  document.addEventListener('sa:motion', (ev) => {
    if ((ev as CustomEvent<{ on: boolean }>).detail?.on) return;
    document.querySelectorAll<HTMLElement>('[data-grow="wait"]').forEach((c) => {
      c.dataset.grow = 'done';
      io.unobserve(c);
    });
  });
}

if (!document.documentElement.dataset.chartGrow) {
  document.documentElement.dataset.chartGrow = '';
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
  else arm();
}
