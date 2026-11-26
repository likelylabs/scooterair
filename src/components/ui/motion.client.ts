/**
 * Motion, for scripts (brief 5.3). The reader's 動畫 switch and the system's reduced-motion
 * setting come to one answer on <html data-motion="on|off">, set before first paint by
 * Base.astro. CSS is handled once in global.css; a script that animates asks here.
 *
 *   import { motionOk, onMotionChange } from '@/components/ui/motion.client';
 *   if (motionOk()) playOnce(); else showFinalState();
 *   onMotionChange((on) => (on ? resume() : rest()));
 */
export const motionOk = (): boolean => {
  const m = document.documentElement.dataset.motion;
  if (m === 'on') return true;
  if (m === 'off') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/** Called when the reader flips the 動畫 switch (or the system setting changes while they follow it). */
export function onMotionChange(fn: (on: boolean) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<{ on: boolean }>).detail.on);
  document.addEventListener('sa:motion', h);
  return () => document.removeEventListener('sa:motion', h);
}
