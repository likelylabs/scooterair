// The Chinese headline font, as one small file. Shared by:
//   scripts/build-display-font.mjs   builds the subset (run on demand, output committed)
//   astro.config.mjs                 checks every built page against it (every build)
//
// WHY
//   Chinese headlines are set in Noto Sans TC Black (see src/styles/fonts.css). The package
//   ships it as ~100 unicode-range slices: a first visit to the home page pulled ten of them
//   (364 kB) plus a 45 kB stylesheet that only lists the slices. The whole site's headlines
//   use a few hundred different characters, so one file holding exactly those is a quarter
//   of the size, is the same file on every page, and needs no slice list.
//
// HOW IT STAYS CORRECT
//   The subset is the first family in the headline stack; the sliced font is the second.
//   A browser falls back glyph by glyph, so a headline character that is not in the subset
//   (new copy, subset not rebuilt yet) is still drawn in Noto Sans TC Black from its slice.
//   After every build the integration in astro.config.mjs reads each Chinese page's headline
//   text: where the subset covers all of it, the link to the slice list is removed from that
//   page (nothing would be fetched from it); where it does not, the link stays and the build
//   prints the missing characters and the command to rebuild. Stale is never wrong, only heavier.
//
// WHAT COUNTS AS HEADLINE TEXT
//   Text inside any element the built CSS gives the headline family: h1, h2, .display, .h1,
//   .h2 (global.css) and every class a component rule sets `font-family: var(--font-heading)`
//   on (found by reading the built stylesheets, so a new component is picked up by itself).
//   Text a script writes into a headline at run time cannot be seen here: put
//   `data-headline-dynamic` on such a page's element and the page keeps the slice list.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** The subset and the list of characters it holds (both generated, both committed). */
export const FONT_FILE = 'src/styles/fonts/noto-sans-tc-900-headline.woff2';
export const CHARS_FILE = 'src/styles/fonts/noto-sans-tc-900-headline.txt';
/** Any file of the Black weight in the package: the builder reads the numbered slices beside it. */
export const SOURCE_FONT = 'node_modules/@fontsource/noto-sans-tc/files/noto-sans-tc-chinese-traditional-900-normal.woff2';
/** Pages whose headlines are not readers' copy: they keep the sliced font and are not counted. */
export const SKIP = /(^|\/)(styleguide(-[a-z]+)?|problem)\//;

/** Code points Archivo claims first in every stack (src/styles/fonts.css): never needed from the CJK face. */
const inLatinFace = (c) =>
  (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xb6) || (c >= 0xb8 && c <= 0xff) || c === 0x131 || c === 0x152 || c === 0x153 || c === 0x2c6 || c === 0x2da || c === 0x2dc || c === 0x20ac || c === 0x2212;
/** The unicode-range of the subset's @font-face (Base.astro): keep the two in step. */
export const UNICODE_RANGE = 'U+00B7, U+2000-2BFF, U+2E80-FFEF';
const inRange = (c) => c === 0xb7 || (c >= 0x2000 && c <= 0x2bff) || (c >= 0x2e80 && c <= 0xffef);
/** True for a character the headline face is asked for. */
export const wanted = (ch) => {
  const c = ch.codePointAt(0);
  return inRange(c) && !inLatinFace(c) && !/\s/.test(ch);
};

const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENTITIES[e] ?? m)));

/** Class names that built CSS gives the headline family, from one stylesheet's text. */
export function headlineClasses(css) {
  const out = new Set();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/font-family:\s*var\(--font-(heading|zh-display|cjk-display)\b/.test(m[2])) continue;
    for (const sel of m[1].split(',')) {
      // the last compound selector names the element that gets the family
      const last = sel.trim().split(/[\s>+~]+/).pop() ?? '';
      // (an Astro scoping class, astro-xxxxxxxx, marks every element of a component: never the headline)
      for (const c of last.matchAll(/\.([\w-]+)/g)) if (!/^astro-[a-z0-9]+$/.test(c[1])) out.add(c[1]);
    }
  }
  return out;
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** The text inside headline elements of one HTML document. */
export function headlineText(html, classes) {
  const stack = []; // open elements; `is` marks one that the CSS gives the headline family
  let depth = 0;
  let text = '';
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|[^<]+|</g;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const [tok, close, rawName, attrs] = m;
    if (rawName === undefined) {
      if (!tok.startsWith('<!--') && depth > 0) text += decode(tok);
      continue;
    }
    const name = rawName.toLowerCase();
    if (close) {
      // close back to the matching open tag, so an element left open (<p>, <li>) cannot skew the count
      const at = stack.findLastIndex((e) => e.name === name);
      if (at >= 0) for (const e of stack.splice(at)) if (e.is) depth--;
      continue;
    }
    if (name === 'script' || name === 'style') {
      // raw text: jump straight to the end tag (the code inside is not markup and must not be read as tags)
      const end = html.toLowerCase().indexOf(`</${name}`, re.lastIndex);
      if (end < 0) break;
      re.lastIndex = end;
      stack.push({ name, is: false });
      continue;
    }
    if (VOID.has(name) || /\/\s*$/.test(attrs)) continue;
    const cls = /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(attrs);
    const names = cls ? (cls[1] ?? cls[2]).split(/\s+/) : [];
    const is = name === 'h1' || name === 'h2' || names.some((c) => classes.has(c));
    stack.push({ name, is });
    if (is) depth++;
  }
  return text;
}

/**
 * Every built Chinese page with the headline characters it needs.
 * @returns {{ file: string, route: string, chars: Set<string>, dynamic: boolean }[]}
 */
export function scanDist(dist) {
  const files = walk(dist);
  const classes = new Set(['display', 'h1', 'h2']);
  for (const f of files) if (f.endsWith('.css')) for (const c of headlineClasses(readFileSync(f, 'utf8'))) classes.add(c);
  const pages = [];
  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    const route = file.slice(dist.length).replace(/\\/g, '/').replace(/^\/?/, '/').replace(/index\.html$/, '');
    if (route.startsWith('/en/')) continue;
    const html = readFileSync(file, 'utf8');
    if (!/<html[^>]*lang="zh/.test(html)) continue;
    const local = new Set(classes);
    for (const s of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) for (const c of headlineClasses(s[1])) local.add(c);
    const chars = new Set([...headlineText(html, local)].filter(wanted));
    pages.push({ file, route, chars, dynamic: /\sdata-headline-dynamic[\s=>]/.test(html) });
  }
  return pages;
}

/**
 * The characters the committed subset accounts for (empty if it has not been built): the ones
 * it holds, plus the ones the builder found Noto Sans TC Black does not have at all (listed on
 * the file's `#absent` line), which no font file here could supply.
 */
export function coveredChars() {
  const p = join(root, CHARS_FILE);
  if (!existsSync(p)) return new Set();
  const lines = readFileSync(p, 'utf8').split('\n');
  const held = lines.filter((l) => !l.startsWith('#')).join('');
  const absent = lines.filter((l) => l.startsWith('#absent ')).map((l) => l.slice(8)).join('');
  return new Set([...(held + absent).replace(/\s/g, '')]);
}
