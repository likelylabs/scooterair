/**
 * The reader's three settings, in the browser: text size (字大), animation and theme.
 *
 * Each lives on <html> — data-text="md|lg|xl", data-motion="on|off", data-theme="light|dark" —
 * is stored in localStorage (sa-text, sa-motion, sa-theme) and is applied before first paint by
 * the inline script in src/layouts/Base.astro. This module wires the controls:
 *
 *   [data-text-cycle]            a button: 標準 → 大 → 特大 → 標準 (the header's 字大)
 *   [data-text-set="md|lg|xl"]   buttons: choose one (the menu); aria-pressed follows
 *   [data-motion-toggle]         a switch (role="switch"): aria-checked = animation on
 *   [data-theme-toggle]          a switch or toggle button: aria-checked / aria-pressed = dark
 *   [data-settings-status]       a polite live region: hears each change in words
 *
 * and tells the page: `sa:textsize` ({ size }) and `sa:motion` ({ on }) on `document`.
 * Imported by TextSize.astro, Settings.astro and ThemeToggle.astro; it runs once.
 */
type TextSize = 'md' | 'lg' | 'xl';
const SIZES: TextSize[] = ['md', 'lg', 'xl'];
const root = document.documentElement;

const store = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the choice lasts for this page */
  }
};
const stored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const say = (text: string) => document.querySelectorAll<HTMLElement>('[data-settings-status]').forEach((el) => (el.textContent = text));
const each = <T extends HTMLElement>(sel: string, fn: (el: T) => void) => document.querySelectorAll<T>(sel).forEach(fn);

// ---- text size ---------------------------------------------------------------
const textSize = (): TextSize => (SIZES.includes(root.dataset.text as TextSize) ? (root.dataset.text as TextSize) : 'md');

function paintText() {
  const size = textSize();
  each<HTMLButtonElement>('[data-text-cycle]', (b) => {
    const names = JSON.parse(b.dataset.names ?? '{}') as Record<TextSize, string>;
    if (b.dataset.nameTemplate && names[size]) b.setAttribute('aria-label', b.dataset.nameTemplate.replace('{size}', names[size]));
  });
  each<HTMLButtonElement>('[data-text-set]', (b) => b.setAttribute('aria-pressed', String(b.dataset.textSet === size)));
}

function setText(size: TextSize, label?: string) {
  if (size === 'md') delete root.dataset.text;
  else root.dataset.text = size;
  store('sa-text', size);
  paintText();
  if (label) say(label);
  document.dispatchEvent(new CustomEvent('sa:textsize', { detail: { size } }));
}

// ---- animation ---------------------------------------------------------------
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionOn = (): boolean => (root.dataset.motion ? root.dataset.motion === 'on' : !reduce.matches);

function paintMotion() {
  each('[data-motion-toggle]', (b) => b.setAttribute('aria-checked', String(motionOn())));
}
function setMotion(on: boolean, remember: boolean) {
  root.dataset.motion = on ? 'on' : 'off';
  if (remember) store('sa-motion', on ? 'on' : 'off');
  paintMotion();
  document.dispatchEvent(new CustomEvent('sa:motion', { detail: { on } }));
}
// following the system until the reader chooses
reduce.addEventListener('change', () => {
  if (!stored('sa-motion')) setMotion(!reduce.matches, false);
});

// ---- theme -------------------------------------------------------------------
const dark = window.matchMedia('(prefers-color-scheme: dark)');
const theme = (): 'light' | 'dark' => (root.dataset.theme === 'light' || root.dataset.theme === 'dark' ? root.dataset.theme : dark.matches ? 'dark' : 'light');

function paintTheme() {
  const on = String(theme() === 'dark');
  each('[data-theme-toggle]', (b) => b.setAttribute(b.getAttribute('role') === 'switch' ? 'aria-checked' : 'aria-pressed', on));
}
function setTheme(next: 'light' | 'dark') {
  root.dataset.theme = next;
  const colour = next === 'dark' ? '#101416' : '#f3f5f3';
  each<HTMLMetaElement>('meta[name="theme-color"]', (m) => (m.content = colour));
  store('sa-theme', next);
  paintTheme();
}
dark.addEventListener('change', paintTheme);

// ---- wiring ------------------------------------------------------------------
paintText();
paintMotion();
paintTheme();

document.addEventListener('click', (e) => {
  const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-text-cycle], [data-text-set], [data-motion-toggle], [data-theme-toggle]');
  if (!el) return;
  if (el.matches('[data-text-cycle]')) {
    const next = SIZES[(SIZES.indexOf(textSize()) + 1) % SIZES.length];
    const names = JSON.parse(el.dataset.names ?? '{}') as Record<TextSize, string>;
    setText(next, el.dataset.nameTemplate?.replace('{size}', names[next] ?? ''));
  } else if (el.matches('[data-text-set]')) {
    setText(el.dataset.textSet as TextSize, el.dataset.say);
  } else if (el.matches('[data-motion-toggle]')) {
    setMotion(!motionOn(), true);
  } else {
    setTheme(theme() === 'dark' ? 'light' : 'dark');
  }
});

export {};
