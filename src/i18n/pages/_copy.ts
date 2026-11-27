// The page-copy convention. READ THIS BEFORE WRITING A PAGE.
//
// Every reader-facing string of a page lives in a module in this folder, never inline in the
// .astro file:
//
//   src/i18n/pages/home.ts        → string ids  home.prologue.title, home.link1.body.0, …
//   src/i18n/pages/electric.ts    → string ids  electric.verdict.A, …
//
//   import { copy } from './_copy.ts';
//   export default copy({
//     prologue: {
//       kicker: { 'zh-TW': '那個味道，你也聞過。', en: 'You know that smell.' },
//       body: [ { 'zh-TW': '…', en: '…' }, { 'zh-TW': '…', en: '…' } ],
//     },
//   });
//
// Rules
//   - A leaf is { 'zh-TW': string, en: string }: both languages, always. Arrays and nested
//     objects are fine; the string id is the module name plus the dotted path (arrays by index).
//     Ids are stable: the allow-list is keyed by them, so renaming a key means re-reviewing it.
//   - Take Traditional Chinese from docs/redesign-brief.md verbatim where it supplies it
//     (sections 3.2, 7 and 12), and follow its vocabulary list (6.6). Reader-facing copy writes
//     台灣, uses 你 (never 您) and has no exclamation marks.
//   - Strings shared by more than one page are not retyped here: chip names, the K sentences
//     (the only allowed "not yet measured" wording), the illustration tag, sheet and menu labels
//     are in ../ui.ts; the estimate's own wording and numbers are in src/data/estimate.ts.
//   - `{name}` marks a value filled at render time with fill(); numbers come from the fact
//     registry, the estimate (src/data/estimate.ts) or the calculator engine, never typed
//     into a string.
//   - Modules are loaded by plain Node in CI: use relative imports with the .ts extension, and
//     import nothing from '@/…' or from ../index.ts. Files that start with `_` are helpers.
//   - In the page:  const t = localize(home, locale);  then  {t.prologue.kicker}.
//
// The guard: `npm run check` runs scripts/check-copy.mjs, which runs flagCopy() from
// src/data/claims-policy.ts (and three voice checks) over every string here and in ui.ts.
// A match fails the build unless src/i18n/copy-allowlist.json holds a reviewed entry for that
// (string id, rule id) pair with a reason. See the header of scripts/check-copy.mjs.

export type Locale = 'zh-TW' | 'en';
export type L10n = { 'zh-TW': string; en: string };

/** Identity helper: gives a copy module its type and marks it for the guard. */
export const copy = <T>(tree: T): T => tree;

export type Localized<T> = T extends L10n ? string : T extends readonly (infer U)[] ? Localized<U>[] : T extends object ? { [K in keyof T]: Localized<T[K]> } : T;

const isL10n = (v: unknown): v is L10n => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 2 && typeof (v as L10n)['zh-TW'] === 'string' && typeof (v as L10n).en === 'string';

/** Resolve a copy tree to one language: the same shape, with strings at the leaves. */
export function localize<T>(tree: T, locale: Locale): Localized<T> {
  if (isL10n(tree)) return tree[locale] as Localized<T>;
  if (Array.isArray(tree)) return tree.map((v) => localize(v, locale)) as Localized<T>;
  if (tree && typeof tree === 'object') return Object.fromEntries(Object.entries(tree).map(([k, v]) => [k, localize(v, locale)])) as Localized<T>;
  return tree as Localized<T>;
}

/** Fill {tokens}: fill('還有 {n} 天', { n: 36 }). */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
