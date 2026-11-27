/**
 * Words per screen (brief 3.1 and 6.5), as counters the <Screen> component and the check scripts
 * share. Plain TypeScript, loadable by Node.
 *
 * A limit counts Han characters only: digits, Latin letters, units and punctuation are free, so
 * 「每個月：在家充電約 25 元，加油約 189 元」 counts 13. English copy follows the Chinese
 * sentence for sentence and is not counted.
 */
export const SCREEN_LIMITS = { headline: 22, body: 45, quiet: 30, sentence: 30, sentences: 2, commas: 2 } as const;

const HAN = /[㐀-䶿一-鿿豈-﫿]/g;

/** Number of Han characters in a string. HTML tags and the `|` phrase marks are ignored. */
export const hanCount = (s: string): number => (stripTags(s).match(HAN) ?? []).length;

/** Text of an HTML fragment: tags dropped, entities left alone (they hold no Han characters). */
export const stripTags = (html: string): string => html.replace(/<[^>]*>/g, '').replace(/\|/g, '');

/**
 * A screen's text may hold variants of which only one shows at a time: the sentence that follows
 * a switch, marked `<span data-when-scenario="few">…</span>` (see Segmented.astro). The reader
 * never sees them together, so they are not counted together: this returns the LONGEST text a
 * reader can see — for each switch, the variant with the most Han characters.
 */
export function longestVariant(html: string): string {
  const variant = /<([a-z][\w-]*)\b[^>]*?\sdata-when-([a-z0-9-]+)="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/g;
  const byName = new Map<string, Map<string, string>>();
  const mark = (name: string) => `\u0000${name}\u0000`;
  // every variant leaves a marker where it stood, and its text is filed under each value it serves
  let out = html.replace(variant, (_m, _tag: string, name: string, values: string, inner: string) => {
    const group = byName.get(name) ?? byName.set(name, new Map()).get(name)!;
    for (const v of values.split(/\s+/).filter(Boolean)) group.set(v, (group.get(v) ?? '') + inner);
    return mark(name);
  });
  // the first marker of each switch becomes its longest variant; the others go
  for (const [name, group] of byName) {
    const longest = [...group.values()].sort((a, b) => hanCount(b) - hanCount(a))[0] ?? '';
    out = out.replace(mark(name), () => longest).split(mark(name)).join('');
  }
  return out;
}

export interface ScreenCopy {
  headline: string;
  body?: string;
  quiet?: string;
}
export interface CopyProblem {
  part: 'headline' | 'body' | 'quiet';
  /** 'error' breaks the build (the brief's hard limits); 'warn' is the finer advice of 6.5. */
  level: 'error' | 'warn';
  message: string;
}

/**
 * Everything wrong with one screen's Chinese copy.
 *   errors: headline over 22, body over 45, quiet line over 30 Han characters
 *           (of switch variants, only the longest is counted: see longestVariant)
 *   warnings: more than two sentences in the body, a sentence over 30, more than two commas in a sentence
 */
export function screenCopyProblems(input: ScreenCopy): CopyProblem[] {
  const out: CopyProblem[] = [];
  const copy: ScreenCopy = { headline: input.headline, body: input.body && longestVariant(input.body), quiet: input.quiet && longestVariant(input.quiet) };
  const over = (part: CopyProblem['part'], text: string | undefined, max: number) => {
    if (!text) return;
    const n = hanCount(text);
    if (n > max) out.push({ part, level: 'error', message: `${part} has ${n} Chinese characters; the limit is ${max}: 「${stripTags(text).trim()}」` });
  };
  over('headline', copy.headline, SCREEN_LIMITS.headline);
  over('body', copy.body, SCREEN_LIMITS.body);
  over('quiet', copy.quiet, SCREEN_LIMITS.quiet);
  if (copy.body && hanCount(copy.body) > 0) {
    const sentences = stripTags(copy.body)
      .split(/[。？！]/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (sentences.length > SCREEN_LIMITS.sentences) out.push({ part: 'body', level: 'warn', message: `body has ${sentences.length} sentences; two at most` });
    for (const x of sentences) {
      if (hanCount(x) > SCREEN_LIMITS.sentence) out.push({ part: 'body', level: 'warn', message: `a sentence has ${hanCount(x)} Chinese characters; 30 at most: 「${x}」` });
      const commas = (x.match(/，/g) ?? []).length;
      if (commas > SCREEN_LIMITS.commas) out.push({ part: 'body', level: 'warn', message: `a sentence has ${commas} commas; two at most: 「${x}」` });
    }
  }
  return out;
}
