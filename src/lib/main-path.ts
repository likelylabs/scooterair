// The main path's word rule (site owner, 2026-11-28; claims-policy `main-path-no-co`).
//
// On the main path (the fifteen home screens, the film, the share cards, the print brief and
// poster, the visible screens of the question pages, and their labels) the reader meets none of
// 一氧化碳 / carbon monoxide / CO, 指引值 / guideline, or ppm. Carbon monoxide stays, plainly
// labelled, on the back pages (/estimate/, /evidence/, /sources/, /about/).
//
// Used by scripts/check-copy.mjs (copy strings by id), scripts/check-site.mjs (built pages) and
// src/lib/__tests__/main-path.test.ts. Plain TypeScript, loadable by Node.

/** Copy string ids (check-copy's <module>.<path>) that are read on the main path. */
export const MAIN_PATH_PREFIXES = [
  'home.',
  'questions.',
  'share.',
  'act.brief.',
  'act.poster.',
  'art.art.fume.',
  'art.art.tailpipe.',
  'art.art.body.',
  'art.art.mask.',
  'art.art.smell.',
  'art.art.kerb.',
  'film.',
] as const;

/**
 * The one string on the main path that may name the gas: the sheet sentence of home screen 12
 * that says which inspection readings the share is worked out from, pointing to the method page.
 */
export const MAIN_PATH_ALLOWED = ['home.s12.sheet.used'] as const;

/** The words the main path does not use. CO is matched as a capitalised word only. */
export const MAIN_PATH_WORDS: RegExp[] = [/一氧化碳/, /carbon monoxide/i, /\bCO\b/, /指引值/, /guideline/i, /ppm/i];

export const onMainPath = (id: string): boolean => MAIN_PATH_PREFIXES.some((p) => id.startsWith(p));

/** The first main-path word in a text, or null. */
export function mainPathWord(text: string): string | null {
  for (const re of MAIN_PATH_WORDS) {
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
}
