#!/usr/bin/env node
// The site check: the automated acceptance checks of docs/redesign-brief.md section 9.3
// (with amendment 12.2: the home page has 15 screens and is at most 12,300 px tall), run on a
// BUILT site in both languages.
//
//   npm run check:site                       # checks dist/
//   npm run check:site -- path/to/dist       # checks another build
//   node scripts/check-site.mjs dist --only 1,2,7 --static --max 30 --json
//
// FLAGS
//   --only 1,4,11   run only these checks (numbers as in 9.3)
//   --static        skip the browser checks (9, 10 heights, 11–16, 23)
//   --max N         offending lines printed per check (default 12; --json always has all)
//   --json          machine-readable report on stdout
//   --report f.json also write the full report to a file (with the normal output on screen)
//   --pages REGEX   browser checks only on routes matching REGEX (e.g. '^/(en/)?electric/$')
//   --progress      print each browser page as it is checked, with its time (stderr)
//   --base /x/      the base path the build was made for (default: read from the home page's
//                   canonical link, so a BASE_PATH=/scooterair build is checked as deployed)
//   --no-phone-font do not alias the phone's system CJK font (see below)
//
// WHAT IS CHECKED (9.3 numbering)
//   text       1 banned strings · 2 "not measured" wording only as the K sentences of 7.1 ·
//              3 banned claims · 4 every [data-kind="estimate"] has 約, a range, the 推估 chip and
//              a way to /estimate/#… · 5 air numbers come from estimate.ts or the registry ·
//              6 a used fact with requiresCaveat shows its caveat in the page's sheet
//   structure  7 routes, redirects, no style guides, no dead links or anchors, sitemap ·
//              8 no EmptyChart / kind="unmeasured" / hatchBand / standIn in src/ ·
//              9 15 home screens, headline ≤ 22 and body ≤ 45 characters, screen ≤ 850 px,
//              page ≤ 12,300 px · 10 pictures cover ≥ 45% of the home page
//   browser    11 text ≥ 14 px, body ≥ 18 px (320, 360, 390) · 12 targets ≥ 48 × 48 px, 8 px
//              apart · 13 no sideways scroll or clipped text at 320 (標準, 大, 特大), no headline
//              break inside a phrase · 14 contrast (body and headlines 7:1, labels 4.5:1,
//              air marks 3:1; light and dark) · 15 JavaScript off: screens show picture,
//              text and sheet; the film shows stills and transcript · 16 prefers-reduced-motion:
//              nothing moves · 17 scenes: alt text says 示意圖 / illustration, the tag is shown ·
//              23 /electric/ opens on a worked result, and on the one the URL asks for
//   Not here: 18–22 (the film's own guard, lane F), 24 (dated builds), 25 (npm run test:calc).
//
// THE MARKUP IT READS (the hooks the shared components print; full list in the integrator's
// contract, scratchpad/redesign/contracts/K.md):
//   home screens   article[data-screen] (ui/Screen) › h2, .screen__body, .screen__pic
//   sheets         details[data-how-sheet] › [data-how-panel] (ui/HowSheet)
//   estimates      [data-kind="estimate"] (ui/EstimateValue), its href="#how-n" or data-how
//   scenes         figure.scene (art/SceneFrame) or [data-scene]; the tag [data-illustration-tag]
//   marks          .air-ring, .air-dot, .air-rib (art/air.ts)
//   facts          [data-fact="id id2"] on whatever prints a registry fact (requested of lane B)
//   calculator     [data-result] (falls back to #result) (requested of lane I)
//   film           [data-transcript] (falls back to #transcript) (requested of lane F)
//   K sentences    the brief's, plus src/i18n/ui.ts → kSentences (lane B)
// Where a hook is missing the check fails and says which hook it looked for.
//
// Every check runs and reports; a check that throws is reported as failed with its error.
// Exit status 1 if any check fails.
//
// Chinese text is measured in a phone font: Noto Sans TC (a dependency of this project) is
// aliased to "Noto Sans CJK TC", the family Android phones have and the site's body stack names.
// The site itself never loads it.

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, writeSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml';
import * as brief from './brief-rules.mjs';

process.removeAllListeners('warning');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name) => {
  const i = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return undefined;
  return argv[i].includes('=') ? argv[i].split('=').slice(1).join('=') : argv[i + 1];
};
const optValues = new Set(['only', 'max', 'base', 'pages', 'report'].map((n) => opt(n)).filter(Boolean));
const positional = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1]?.startsWith('--') && optValues.has(a)));
const DIST = resolve(positional[0] ?? join(root, 'dist'));
const ONLY = opt('only') ? new Set(opt('only').split(',').map((s) => Number(s.trim()))) : null;
const MAX = Number(opt('max') ?? 12);
const STATIC = flag('static');
const JSON_OUT = flag('json');
const run = (n) => !ONLY || ONLY.has(n);
const PAGES = opt('pages') ? new RegExp(opt('pages')) : null;
const progress = (...a) => !JSON_OUT && process.stderr.isTTY !== false && flag('progress') && process.stderr.write(`${a.join(' ')}\n`);

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`✖ check-site: no built site at ${DIST} (expected index.html). Build first: npx astro build --outDir <dir>`);
  process.exit(2);
}

// ============================================================================================
// Results
// ============================================================================================
const TITLES = {
  1: 'Banned strings (text, alt, aria-label, meta)',
  2: '"Not measured" wording only as the K sentences, on their pages, ≤ 25 per language',
  3: 'Banned claims of 4.6',
  4: 'Estimated values: 約, a range, the 推估 chip, a way to /estimate/#…',
  5: 'Air numbers come from estimate.ts or the registry',
  6: 'Facts with requiresCaveat show their caveat in the page sheet',
  7: 'Routes, redirects, no style guides, no dead links or anchors, sitemap',
  8: 'No EmptyChart, kind="unmeasured", hatchBand or standIn in src/',
  9: 'Home: 15 screens, headline ≤ 22, body ≤ 45, screen ≤ 850 px, page ≤ 12,300 px',
  10: 'Home: pictures and charts cover ≥ 45% of the height at 360 px',
  11: 'Text ≥ 14 px everywhere, body ≥ 18 px (320, 360, 390)',
  12: 'Targets ≥ 48 × 48 px and 8 px apart',
  13: 'No sideways scroll or clipped text at 320 px (標準, 大, 特大); headlines break between phrases',
  14: 'Contrast: body and headlines 7:1, labels 4.5:1, marks 3:1 (light and dark)',
  15: 'JavaScript off: screens show picture, text and sheet; film shows stills and transcript',
  16: 'prefers-reduced-motion: nothing moves until asked',
  17: 'Scenes: alt text says 示意圖 / illustration, and the tag is shown',
  23: '/electric/ opens on a worked result, and on the one its URL asks for',
};
/** @type {Map<number, { id: number, title: string, status: 'pass'|'fail'|'skipped', problems: {page: string, text: string}[], notes: string[] }>} */
const results = new Map();
const result = (n) => {
  if (!results.has(n)) results.set(n, { id: n, title: TITLES[n], status: 'pass', problems: [], notes: [] });
  return results.get(n);
};
const fail = (n, page, text) => {
  const r = result(n);
  r.status = 'fail';
  if (!r.problems.some((x) => x.page === page && x.text === text)) r.problems.push({ page, text });
};
const note = (n, text) => result(n).notes.push(text);
async function check(n, fn) {
  if (!run(n)) return;
  result(n);
  try {
    await fn();
  } catch (e) {
    fail(n, '—', `the check itself crashed: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
  }
}
const cut = (s, n = 90) => {
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};

// ============================================================================================
// Reading the build
// ============================================================================================
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", hellip: '…', ndash: '–', mdash: '—', middot: '·', times: '×', micro: 'µ', sup3: '³', copy: '©', rarr: '→', larr: '←', darr: '↓', uarr: '↑' };
const decode = (s) =>
  s == null
    ? ''
    : String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
        if (e[0] === '#') {
          const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
          return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
        }
        return ENT[e.toLowerCase()] ?? m;
      });

const BLOCK = new Set('address article aside blockquote body caption dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section summary table tbody thead tfoot tr td th ul legend option select button label output'.split(' '));
const SKIP = new Set(['script', 'style', 'template', 'head']);
const attr = (el, name) => (el.attributes && name in el.attributes ? decode(el.attributes[name]) : undefined);
const has = (el, name) => !!el.attributes && name in el.attributes;
const classes = (el) => (attr(el, 'class') ?? '').split(/\s+/).filter(Boolean);

function* elements(node) {
  for (const c of node.children ?? []) {
    if (c.type === ELEMENT_NODE) {
      yield c;
      yield* elements(c);
    }
  }
}
function textOf(node, { svgText = true } = {}) {
  let out = '';
  const walk = (n) => {
    for (const c of n.children ?? []) {
      if (c.type === TEXT_NODE) out += decode(c.value);
      else if (c.type === ELEMENT_NODE && !SKIP.has(c.name)) {
        if (!svgText && (c.name === 'svg' || c.name === 'title' || c.name === 'desc')) continue;
        if (BLOCK.has(c.name) || c.name === 'br') out += ' ';
        walk(c);
        if (BLOCK.has(c.name)) out += ' ';
      }
    }
  };
  walk(node);
  return out.replace(/\s+/g, ' ').trim();
}
const closest = (el, pred) => {
  for (let n = el; n && n.type === ELEMENT_NODE; n = n.parent) if (pred(n)) return n;
  return null;
};
// HowSheet (lane B) renders <details data-how-sheet id="how-n"> › [data-how-panel]
const isSheet = (el) => has(el, 'data-how-sheet') || has(el, 'data-how-panel') || has(el, 'data-sheet');
const isHidden = (el) => has(el, 'hidden') || attr(el, 'aria-hidden') === 'true';

/** Split a page's text into block-level segments, each with the flags of its context. */
function segmentsOf(doc) {
  const segs = [];
  let buf = '';
  let ctx = null;
  let lastParent = null;
  const flush = () => {
    const t = buf.replace(/\s+/g, ' ').trim();
    if (t && ctx) segs.push({ text: t, ...ctx });
    buf = '';
  };
  const walk = (n, flags) => {
    for (const c of n.children ?? []) {
      if (c.type === TEXT_NODE) {
        if (!ctx || ctx.el !== flags.el) {
          flush();
          ctx = { ...flags };
        }
        const t = decode(c.value);
        // two numbers from different inline elements (e.g. axis ticks in spans) are two numbers
        if (lastParent !== n && /\d$/.test(buf) && /^\d/.test(t)) buf += ' ';
        buf += t;
        lastParent = n;
      } else if (c.type === ELEMENT_NODE && !SKIP.has(c.name)) {
        if (c.name === 'title' && closest(c, (x) => x.name === 'svg')) continue; // accessible name, read as alt
        // an estimate (EstimateValue) is its own segment, so the words around it are judged apart from it
        const block = BLOCK.has(c.name) || c.name === 'br' || c.name === 'svg' || attr(c, 'data-kind') === 'estimate';
        const f = {
          el: block ? c : flags.el,
          heading: /^h[1-3]$/.test(c.name) ? Number(c.name[1]) : flags.heading,
          inSheet: flags.inSheet || isSheet(c),
          inSvg: flags.inSvg || c.name === 'svg',
          hidden: flags.hidden || isHidden(c),
          inEstimate: flags.inEstimate || attr(c, 'data-kind') === 'estimate',
          inChart: flags.inChart || has(c, 'data-chart') || has(c, 'data-chart-axis'),
        };
        if (block) flush();
        walk(c, f);
        if (block) {
          flush();
          ctx = null;
        }
      }
    }
  };
  walk(doc, { el: doc, heading: 0, inSheet: false, inSvg: false, hidden: false, inEstimate: false, inChart: false });
  flush();
  return segs;
}

function routeOf(file) {
  const rel = relative(DIST, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}
function htmlFiles(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== '_astro') htmlFiles(p, out);
    } else if (f.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** The base path the build was made for, from the home page's canonical link. */
function detectBase() {
  if (opt('base')) return `/${opt('base').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
  const html = readFileSync(join(DIST, 'index.html'), 'utf8');
  const m = /<link\b[^>]*rel=["']?canonical["']?[^>]*href=["']([^"']+)["']/i.exec(html) || /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']?canonical/i.exec(html);
  if (!m) return '/';
  try {
    return new URL(decode(m[1])).pathname.replace(/\/?$/, '/');
  } catch {
    return '/';
  }
}
const BASE = detectBase();

const pages = htmlFiles(DIST)
  .sort()
  .map((file) => {
    const html = readFileSync(file, 'utf8');
    const doc = parse(html);
    const route = routeOf(file);
    const locale = route === '/en/' || route.startsWith('/en/') ? 'en' : 'zh-TW';
    const neutral = locale === 'en' ? route.slice(3) || '/' : route;
    const els = [...elements(doc)];
    const refresh = els.find((e) => e.name === 'meta' && (attr(e, 'http-equiv') ?? '').toLowerCase() === 'refresh');
    const canonical = els.find((e) => e.name === 'link' && (attr(e, 'rel') ?? '').split(/\s+/).includes('canonical'));
    const robots = els.find((e) => e.name === 'meta' && (attr(e, 'name') ?? '').toLowerCase() === 'robots');
    const ids = new Set(els.flatMap((e) => [attr(e, 'id'), e.name === 'a' ? attr(e, 'name') : undefined].filter(Boolean)));
    const alts = [];
    for (const e of els) {
      for (const a of ['alt', 'aria-label', 'aria-description', 'title', 'placeholder']) {
        const v = attr(e, a);
        if (v && v.trim() && !(e.name === 'link' || e.name === 'meta' || e.name === 'html')) alts.push({ where: a, text: v.trim(), el: e });
      }
      if (e.name === 'title' && closest(e, (x) => x.name === 'svg')) alts.push({ where: 'svg title', text: textOf(e), el: e });
    }
    const meta = [];
    for (const e of els) {
      if (e.name === 'title' && !closest(e, (x) => x.name === 'svg')) meta.push({ where: '<title>', text: textOf(e) });
      if (e.name === 'meta') {
        const key = (attr(e, 'name') ?? attr(e, 'property') ?? '').toLowerCase();
        if (/description|^og:|^twitter:|keywords|application-name/.test(key) && attr(e, 'content')) meta.push({ where: `meta ${key}`, text: attr(e, 'content') });
      }
    }
    return {
      file,
      route,
      locale,
      neutral,
      html,
      doc,
      els,
      ids,
      segs: segmentsOf(doc),
      alts,
      meta,
      redirect: refresh ? { refresh: attr(refresh, 'content') ?? '', canonical: canonical ? attr(canonical, 'href') : undefined } : null,
      noindex: !!robots && /noindex/i.test(attr(robots, 'content') ?? ''),
    };
  });
const byRoute = new Map(pages.map((p) => [p.route, p]));
const LOC = ['zh-TW', 'en'];
const prefix = (locale) => (locale === 'en' ? '/en' : '');
const label = (p) => p.route;

// registry and estimate, loaded the way check-copy loads copy (Node strips the types)
const load = async (p) => import(pathToFileURL(resolve(root, p)).href);
let registry = null;
let seriesMod = null;
let estimateMod = null;
const loadNotes = [];
try {
  registry = await load('src/data/facts.ts');
} catch (e) {
  loadNotes.push(`src/data/facts.ts could not be loaded (${String(e.message).split('\n')[0]})`);
}
try {
  seriesMod = await load('src/data/series.ts');
} catch (e) {
  loadNotes.push(`src/data/series.ts could not be loaded (${String(e.message).split('\n')[0]})`);
}
try {
  estimateMod = await load('src/data/estimate.ts');
} catch (e) {
  loadNotes.push(`src/data/estimate.ts could not be loaded (${String(e.message).split('\n')[0]})`);
}
// K sentences: the brief's, plus lane B's (src/i18n/ui.ts → kSentences) when published
const kSentences = brief.kSentences.map((k) => ({ ...k, text: { 'zh-TW': [...k.text['zh-TW']], en: [...k.text.en] } }));
try {
  const ui = await load('src/i18n/ui.ts');
  const pub = ui.kSentences;
  const list = Array.isArray(pub) ? pub : pub && typeof pub === 'object' ? Object.entries(pub).map(([id, text]) => ({ id, text })) : [];
  for (const p of list) {
    const k = kSentences.find((x) => x.id === String(p.id).match(/^K\d/)?.[0]);
    if (!k || !p.text) continue;
    for (const l of LOC) if (typeof p.text[l] === 'string' && !k.text[l].includes(p.text[l])) k.text[l].push(p.text[l]);
  }
} catch {
  /* the brief's own K sentences still apply */
}

// ============================================================================================
// 1 · Banned strings
// ============================================================================================
await check(1, () => {
  const rules = brief.bannedRules;
  for (const p of pages) {
    const channels = [
      ...p.segs.map((s) => ({ where: s.hidden ? 'text (hidden)' : 'text', text: s.text })),
      ...p.alts.map((a) => ({ where: a.where, text: a.text })),
      ...p.meta,
    ];
    const seen = new Set();
    for (const c of channels)
      for (const r of rules) {
        const m = r.re.exec(c.text);
        if (!m) continue;
        const key = `${c.where}|${m[0]}|${c.text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        fail(1, label(p), `[${c.where}] 「${m[0]}」 in: ${cut(c.text)}`);
      }
  }
});

// ============================================================================================
// 2 · K sentences
// ============================================================================================
await check(2, () => {
  const counts = { 'zh-TW': 0, en: 0 };
  const allowed = (k, p, seg) => k.pages.includes(p.neutral) || (k.pages.includes('sheet') && seg?.inSheet);
  for (const p of pages) {
    if (p.redirect) continue;
    const units = [...p.segs.map((s) => ({ s, text: s.text, where: 'text' })), ...p.alts.map((a) => ({ s: null, text: a.text, where: a.where })), ...p.meta.map((m) => ({ s: null, text: m.text, where: m.where }))];
    for (const u of units) {
      const { stray, kHits } = brief.kScan(u.text, p.locale, kSentences);
      counts[p.locale] += stray.length + kHits.length;
      for (const x of stray) fail(2, label(p), `[${u.where}] 「${x.trigger}」 outside any K sentence: ${cut(u.text)}`);
      for (const h of kHits) {
        const k = kSentences.find((x) => x.id === h.id);
        if (!allowed(k, p, u.s)) fail(2, label(p), `[${u.where}] ${h.id} is not allowed on this page (allowed: ${k.pages.join(', ')}): ${cut(u.text)}`);
      }
    }
  }
  for (const l of LOC) {
    note(2, `${l}: ${counts[l]} occurrence(s) site-wide (budget ${brief.kBudget})`);
    if (counts[l] > brief.kBudget) fail(2, `(${l}, all pages)`, `${counts[l]} occurrences of the "not measured" wording; at most ${brief.kBudget}`);
  }
});

// ============================================================================================
// 3 · Banned claims
// ============================================================================================
await check(3, () => {
  const rules = brief.claimRules.filter((r) => r.check === 3);
  for (const p of pages) {
    const units = [...p.segs.map((s) => ({ text: s.text, heading: s.heading, where: s.heading ? `h${s.heading}` : 'text' })), ...p.alts.map((a) => ({ text: a.text, heading: 0, where: a.where })), ...p.meta.map((m) => ({ text: m.text, heading: m.where === '<title>' ? 1 : 0, where: m.where }))];
    for (const u of units)
      for (const r of rules) {
        if (r.locale !== p.locale) continue;
        if (r.scope === 'headline' && !u.heading) continue;
        const m = r.re.exec(u.text);
        if (m) fail(3, label(p), `[${u.where}] ${r.id} 「${m[0]}」 in: ${cut(u.text)}`);
      }
  }
});

// ============================================================================================
// 4 · Estimated values
// ============================================================================================
const AIR_UNIT = '(ppm|ppb|µg\\/m³|μg\\/m³|µg\\/m3|μg\\/m3|ug\\/m3|微克|mg\\/m³|mg\\/m3)';
const NUM = '\\d[\\d,]*(?:\\.\\d+)?';
const JOIN = '(?:\\s*(?:到|至|–|—|-|~|～|to|and|or|、|,|，|·|・|\\/)\\s*(?:約|about)?\\s*)';
const AIR_RE = new RegExp(`(?<![A-Za-z.\\d])(${NUM}(?:${JOIN}${NUM})*)\\s*${AIR_UNIT}`, 'g');
// words that mark a number as the site's own estimate (the chip's word, and what 4.2 rule 5 makes it say)
const ESTIMATE_WORDS = { 'zh-TW': /推估|算出來|多出來|我們算/, en: /\bEstimate\b|\bour estimate\b|worked out|\badded by (the|these|this)\b/ };

await check(4, () => {
  let total = 0;
  for (const p of pages) {
    if (p.redirect) continue;
    const zh = p.locale === 'zh-TW';
    for (const el of p.els.filter((e) => attr(e, 'data-kind') === 'estimate')) {
      total++;
      const t = textOf(el);
      const lacks = [];
      const under = zh ? /不到/.test(t) : /\bunder\b/i.test(t);
      if (!under && !(zh ? /約/.test(t) : /\babout\b/i.test(t))) lacks.push(zh ? '約' : '"about"');
      if (!under && !(zh ? /到|至/.test(t) : /\bto\b/i.test(t))) lacks.push('a range');
      if (!(zh ? /推估/.test(t) : /\bestimate\b/i.test(t))) lacks.push(zh ? 'the 推估 chip' : 'the Estimate chip');
      // a way to /estimate/#…: a link inside, or a button / #how link whose sheet links there
      const inner = [el, ...elements(el)];
      const linksThere = (n) => [n, ...elements(n)].some((x) => x.name === 'a' && /estimate\/#/.test(attr(x, 'href') ?? ''));
      let reach = inner.some((x) => x.name === 'a' && /estimate\/#/.test(attr(x, 'href') ?? ''));
      if (!reach) {
        if (inner.some((x) => /estimate\/#/.test(attr(x, 'data-how') ?? ''))) reach = true;
        const targets = inner.flatMap((x) => [attr(x, 'aria-controls'), attr(x, 'data-sheet-target'), attr(x, 'data-opens'), x.name === 'a' ? (attr(x, 'href') ?? '').match(/^#(.+)/)?.[1] : undefined, has(x, 'data-sheet') && attr(x, 'data-sheet') ? attr(x, 'data-sheet') : undefined].filter(Boolean));
        reach = targets.some((id) => {
          const t = p.els.find((x) => attr(x, 'id') === id);
          return t && linksThere(t);
        });
        if (!reach) {
          const det = closest(el, (x) => x.name === 'details' || isSheet(x) || x.name === 'article');
          if (det && det.name !== 'article' && linksThere(det)) reach = true;
        }
      }
      if (!reach) lacks.push('a link or button that reaches /estimate/#…');
      if (lacks.length) fail(4, label(p), `[data-kind=estimate] lacks ${lacks.join(', ')}: 「${cut(t, 70)}」`);
    }
    // an estimated air number printed bare, outside any [data-kind=estimate]
    for (const s of p.segs) {
      if (s.inEstimate || s.inSvg || s.inChart || !ESTIMATE_WORDS[p.locale].test(s.text)) continue;
      AIR_RE.lastIndex = 0;
      const m = AIR_RE.exec(s.text);
      if (m) fail(4, label(p), `estimated number printed bare (not in [data-kind=estimate]): 「${m[0]}」 in: ${cut(s.text, 70)}`);
    }
  }
  note(4, `${total} [data-kind="estimate"] element(s) on the site`);
  if (!total) fail(4, '(all pages)', 'no element carries data-kind="estimate"; EstimateValue (lane B) must emit it');
});

// ============================================================================================
// 5 · Air numbers
// ============================================================================================
await check(5, () => {
  const exact = new Set(); // numbers as published (estimate.ts literals, numbers in fact texts)
  const raw = []; // raw values, matched after rounding to the printed decimals
  const walk = (v, into, depth = 0, seen = new Set()) => {
    if (depth > 12 || v == null) return;
    if (typeof v === 'number' && Number.isFinite(v)) return void into(v);
    if (typeof v === 'string') {
      for (const m of v.matchAll(/\d[\d,]*(?:\.\d+)?/g)) into(Number(m[0].replace(/,/g, '')));
      return;
    }
    if (typeof v === 'function' || typeof v !== 'object' || seen.has(v)) return;
    seen.add(v);
    for (const x of Array.isArray(v) ? v : Object.values(v)) walk(x, into, depth + 1, seen);
  };
  if (estimateMod) for (const [k, v] of Object.entries(estimateMod)) if (typeof v !== 'function') walk(v, (n) => exact.add(n));
  if (registry?.facts)
    for (const f of Object.values(registry.facts)) {
      walk(f.data, (n) => raw.push(n));
      walk([f.display, f.statement, f.caveat], (n) => exact.add(n));
    }
  if (seriesMod?.series) walk(seriesMod.series, (n) => raw.push(n));
  if (!estimateMod) {
    // fall back to the published fields of results.json (adult nose, 1.5 m)
    const res = JSON.parse(readFileSync(join(root, 'research/estimate/results.json'), 'utf8'));
    for (const s of res.scenarios ?? []) for (const pol of ['co', 'benzene', 'pm25']) for (const part of ['increment', 'total']) walk(s.result?.[pol]?.[part]?.['h1.5'], (n) => raw.push(n));
    note(5, 'estimate.ts not loadable: compared with results.json (published fields)');
  }
  if (!registry) note(5, 'registry not loadable: compared with the estimate only');
  const decimals = (s) => (s.includes('.') ? s.split('.')[1].length : 0);
  const sig1 = (n) => (n === 0 ? 0 : Number(n.toPrecision(1)));
  const ok = (s) => {
    const n = Number(s.replace(/,/g, ''));
    if (exact.has(n)) return true;
    const d = decimals(s);
    return raw.some((a) => Number(a.toFixed(d)) === n || sig1(a) === n);
  };
  let seen = 0;
  for (const p of pages) {
    if (p.redirect) continue;
    for (const s of p.segs) {
      AIR_RE.lastIndex = 0;
      for (const m of s.text.matchAll(AIR_RE)) {
        const nums = m[1].match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
        for (const n of nums) {
          seen++;
          if (!ok(n)) fail(5, label(p), `${n} ${m[2]} is in neither estimate.ts nor the registry: 「${cut(s.text, 70)}」`);
        }
      }
    }
  }
  note(5, `${seen} air number(s) printed beside ppm, ppb, µg/m³ or mg/m³; ${exact.size} published and ${raw.length} raw values to compare with`);
  for (const n of loadNotes) note(5, n);
});

// ============================================================================================
// 6 · Caveats
// ============================================================================================
await check(6, () => {
  if (!registry?.facts) return void fail(6, '—', `the registry could not be loaded: ${loadNotes.join('; ')}`);
  let marked = 0;
  for (const p of pages) {
    if (p.redirect) continue;
    const used = new Set(p.els.flatMap((e) => (attr(e, 'data-fact') ?? '').split(/[\s,]+/).filter(Boolean)));
    marked += used.size;
    const sheetText = brief.kNorm(p.segs.filter((s) => s.inSheet).map((s) => s.text).join(' '));
    const pageText = brief.kNorm(p.segs.map((s) => s.text).join(' '));
    for (const id of used) {
      const f = registry.facts[id];
      if (!f) {
        fail(6, label(p), `data-fact="${id}" names no fact in the registry`);
        continue;
      }
      if (!f.requiresCaveat || !f.caveat) continue;
      const c = brief.kNorm(f.caveat[p.locale] ?? '');
      if (!c) continue;
      if (sheetText.includes(c)) continue;
      fail(6, label(p), `${id}: its caveat is ${pageText.includes(c) ? 'on the page but not in a sheet' : 'missing'} (「${cut(f.caveat[p.locale], 50)}」)`);
    }
  }
  note(6, `${marked} fact use(s) marked with data-fact across the site`);
  if (!marked) fail(6, '(all pages)', 'no element carries data-fact, so no page says which facts it prints; KindChip / HowSheet (lane B) must emit data-fact="<fact id>"');
});

// ============================================================================================
// 7 · Structure
// ============================================================================================
const ROUTES = ['/', '/90/', '/questions/', '/questions/smell/', '/questions/my-child/', '/questions/app/', '/questions/one-red-light/', '/questions/rider/', '/questions/beside-me/', '/questions/mask/', '/estimate/', '/evidence/', '/sources/', '/act/', '/about/', '/electric/', '/print/poster/', '/print/brief/'];
const REDIRECTS = { '/questions/how-much/': '/estimate/', '/questions/electric/': '/electric/', '/unmeasured/': '/estimate/', '/problem/': '/questions/' };
const ABSENT = ['/styleguide/', '/styleguide-art/'];
const HASH_MAP = { '/unmeasured/': { ask: 'measure' } };

function fileFor(pathname) {
  if (!pathname.startsWith(BASE)) return null;
  const rel = decodeURIComponent(pathname.slice(BASE.length));
  const f = join(DIST, rel);
  if (rel === '' || rel.endsWith('/')) return existsSync(join(f, 'index.html')) ? join(f, 'index.html') : null;
  if (existsSync(f) && statSync(f).isFile()) return f;
  if (existsSync(join(f, 'index.html'))) return join(f, 'index.html');
  return null;
}
function redirectTarget(p) {
  const m = /url=(.+)$/i.exec(p.redirect?.refresh ?? '');
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : p.redirect?.canonical;
}

await check(7, () => {
  for (const l of LOC) {
    for (const r of ROUTES) {
      const route = `${prefix(l)}${r}`;
      const p = byRoute.get(route);
      if (!p) fail(7, route, 'route is missing from the build');
      else if (p.redirect) fail(7, route, `should be a page, but is a redirect to ${redirectTarget(p)}`);
    }
    for (const [from, to] of Object.entries(REDIRECTS)) {
      const route = `${prefix(l)}${from}`;
      const p = byRoute.get(route);
      const want = `${BASE}${prefix(l).slice(1) ? 'en/' : ''}${to.slice(1)}`;
      if (!p) {
        fail(7, route, `redirect page is missing (should redirect to ${want})`);
        continue;
      }
      if (!p.redirect) {
        fail(7, route, `should be a redirect page to ${want}, but is a full page`);
        continue;
      }
      let canon = null;
      try {
        canon = p.redirect.canonical ? new URL(p.redirect.canonical).pathname : null;
      } catch {
        /* reported below */
      }
      if (canon !== want) fail(7, route, `redirect's canonical link is ${p.redirect.canonical ?? 'missing'}; should end in ${want}`);
      if (!p.noindex) fail(7, route, 'redirect page lacks <meta name="robots" content="noindex">');
    }
    for (const r of ABSENT) {
      const route = `${prefix(l)}${r}`;
      if (byRoute.has(route) || existsSync(join(DIST, route.slice(1)))) fail(7, route, 'the style guide is in the production build');
    }
  }
  // dead links and anchors
  const origin = 'http://site.invalid';
  const seen = new Set();
  for (const p of pages) {
    const pageUrl = new URL(`${BASE.replace(/\/$/, '')}${p.route}`, origin);
    for (const a of p.els.filter((e) => e.name === 'a' && has(e, 'href'))) {
      const href = attr(a, 'href').trim();
      if (!href || /^(mailto:|tel:|javascript:|data:|sms:)/i.test(href) || href.startsWith('#:~:')) continue;
      let u;
      try {
        u = new URL(href, pageUrl);
      } catch {
        fail(7, label(p), `unparseable link ${href}`);
        continue;
      }
      if (u.origin !== origin) {
        // absolute links to this site's own address count as internal
        continue;
      }
      const key = `${p.route}|${u.pathname}${u.hash}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!u.pathname.startsWith(BASE)) {
        fail(7, label(p), `link outside the base path ${BASE}: ${href}`);
        continue;
      }
      const f = fileFor(u.pathname);
      if (!f) {
        fail(7, label(p), `dead link: ${href}`);
        continue;
      }
      const hash = decodeURIComponent(u.hash.slice(1));
      if (!hash || hash === 'top' || !f.endsWith('.html')) continue;
      let target = pages.find((x) => x.file === f);
      let h = hash;
      if (target?.redirect) {
        const map = HASH_MAP[target.neutral] ?? {};
        h = map[h] ?? h;
        const t = redirectTarget(target);
        const tf = t ? fileFor(new URL(t, new URL(`${BASE.replace(/\/$/, '')}${target.route}`, origin)).pathname) : null;
        target = tf ? pages.find((x) => x.file === tf) : null;
      }
      if (target && !target.ids.has(h)) fail(7, label(p), `dead anchor: ${href} (no id="${h}" on ${target.route})`);
    }
  }
  note(7, `${seen.size} distinct internal link(s) checked, with their anchors`);
  // the sitemap lists only indexable pages
  const maps = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
  if (!maps.length) fail(7, '/sitemap-index.xml', 'no sitemap-N.xml in the build');
  for (const m of maps) {
    for (const [, loc] of readFileSync(join(DIST, m), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
      let path;
      try {
        path = new URL(decode(loc)).pathname;
      } catch {
        fail(7, m, `bad <loc> ${loc}`);
        continue;
      }
      const route = path.startsWith(BASE) ? `/${path.slice(BASE.length)}` : path;
      const p = byRoute.get(route);
      if (!p) fail(7, m, `sitemap lists ${route}, which is not in the build`);
      else if (p.redirect) fail(7, m, `sitemap lists the redirect page ${route}`);
      else if (p.noindex) fail(7, m, `sitemap lists the noindex page ${route}`);
      else if (/styleguide/.test(route)) fail(7, m, `sitemap lists the style guide ${route}`);
    }
  }
});

// ============================================================================================
// 8 · Removed things in src/
// ============================================================================================
await check(8, () => {
  const re = /\bEmptyChart\b|kind=["'{]?\s*["']?unmeasured["']|kind:\s*["']unmeasured["']|\bhatchBand\b|\bstandIn\b/;
  const scan = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) scan(p);
      else if (/\.(astro|ts|tsx|js|mjs|css|json|md)$/.test(f.name)) {
        const lines = readFileSync(p, 'utf8').split('\n');
        const hits = lines.map((l, i) => [i + 1, l]).filter(([, l]) => re.test(l));
        if (hits.length) fail(8, relative(root, p), `${hits.length} line(s), first at ${hits[0][0]}: 「${cut(hits[0][1].match(re)[0], 40)}」`);
      }
    }
  };
  scan(join(root, 'src'));
});

// ============================================================================================
// 9 (static part) and 17 · home screens, scenes
// ============================================================================================
const CJK = /[㐀-鿿豈-﫿]/;
const countChars = (s) => [...s.replace(/[|\s]/g, '')].length;
const homeScreens = (p) => p.els.filter((e) => e.name === 'article' && has(e, 'data-screen'));
await check(9, () => {
  for (const l of LOC) {
    const p = byRoute.get(`${prefix(l)}/`);
    if (!p) {
      fail(9, `${prefix(l)}/`, 'home page missing');
      continue;
    }
    const screens = homeScreens(p);
    if (screens.length !== 15) {
      const articles = p.els.filter((e) => e.name === 'article').length;
      const h2 = p.els.filter((e) => e.name === 'h2').length;
      fail(9, label(p), `${screens.length} article[data-screen] element(s); exactly 15 required (the page has ${articles} <article> and ${h2} <h2>)`);
    }
    if (l !== 'zh-TW') continue;
    screens.forEach((a, i) => {
      const h = [...elements(a)].find((e) => e.name === 'h2');
      const ht = h ? textOf(h) : '';
      if (!h) fail(9, label(p), `screen ${i + 1} has no <h2>`);
      else if (countChars(ht) > 22) fail(9, label(p), `screen ${i + 1} headline has ${countChars(ht)} characters (max 22): ${ht}`);
      const b = [...elements(a)].find((e) => has(e, 'data-screen-body') || classes(e).includes('screen__body'));
      if (!b) fail(9, label(p), `screen ${i + 1} has no body (.screen__body)`);
      else if (countChars(textOf(b)) > 45) fail(9, label(p), `screen ${i + 1} body has ${countChars(textOf(b))} characters (max 45): ${cut(textOf(b))}`);
    });
  }
});

await check(17, () => {
  let scenes = 0;
  for (const p of pages) {
    if (p.redirect) continue;
    const zh = p.locale === 'zh-TW';
    // a scene is lane C's <figure class="scene"> (SceneFrame), or anything marked data-scene
    for (const el of p.els.filter((e) => has(e, 'data-scene') || (e.name === 'figure' && classes(e).includes('scene')))) {
      scenes++;
      const name = `${attr(el, 'data-scene') || attr(el, 'id') || classes(el).filter((c) => c !== 'scene')[0] || el.name}`;
      const inner = [el, ...elements(el)];
      const labelled = (attr(el, 'aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => p.els.find((x) => attr(x, 'id') === id)).filter(Boolean).map((x) => textOf(x));
      const names = [
        ...inner.map((x) => attr(x, 'aria-label')),
        ...inner.filter((x) => x.name === 'img').map((x) => attr(x, 'alt')),
        ...inner.filter((x) => x.name === 'title').map((x) => textOf(x)),
        ...labelled,
      ].filter(Boolean);
      const okName = names.some((n) => (zh ? /示意圖/.test(n) : /illustration/i.test(n)));
      if (!okName) fail(17, label(p), `scene ${name}: alt text does not say ${zh ? '示意圖' : '"illustration"'}${names.length ? ` (it says 「${cut(names[0], 50)}」)` : ' (no alt text)'}`);
      // the tag: lane B's IllustrationTag ([data-illustration-tag]) on the picture, printed by the scene
      // (tag="street" | "body") or by <Screen illustration>
      const box = closest(el.parent, (x) => has(x, 'data-screen-picture') || classes(x).includes('screen__pic')) ?? el;
      const tags = [box, ...elements(box)].filter((x) => has(x, 'data-illustration-tag')).map((x) => textOf(x));
      const okTag = tags.some((t) => (zh ? /示意圖/.test(t) : /illustration/i.test(t)));
      if (!okTag) fail(17, label(p), `scene ${name}: no tag ([data-illustration-tag] 示意圖｜廢氣其實大多看不見 / 示意圖・不是醫學圖) on the picture`);
    }
  }
  note(17, `${scenes} scene(s) on the site (figure.scene or [data-scene])`);
  if (!scenes) fail(17, '(all pages)', 'no scene (figure.scene from SceneFrame, or [data-scene]) on any page');
});

// ============================================================================================
// Browser checks
// ============================================================================================
const BROWSER = [9, 10, 11, 12, 13, 14, 15, 16, 23];
const needBrowser = BROWSER.some((n) => run(n));
if (needBrowser && STATIC) for (const n of BROWSER) if (run(n) && n !== 9) result(n).status = 'skipped', note(n, '--static: not run');
if (needBrowser && !STATIC) {
  let chromium;
  try {
    chromium = createRequire(import.meta.url)('playwright').chromium;
  } catch {
    for (const n of BROWSER) if (run(n)) fail(n, '—', 'Playwright is not installed here (require("playwright") failed); these checks need it with Chromium');
  }
  if (chromium) await browserChecks(chromium);
}

async function browserChecks(chromium) {
  const NM = join(root, 'node_modules');
  const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'text/xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.txt': 'text/plain', '.csv': 'text/csv', '.pdf': 'application/pdf' };
  const server = createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    let f;
    if (p.startsWith('/__nm/')) f = join(NM, p.slice(6));
    else {
      if (p.startsWith(BASE)) p = `/${p.slice(BASE.length)}`;
      f = join(DIST, p);
      if (p.endsWith('/')) f = join(f, 'index.html');
    }
    if (!f.startsWith(DIST) && !f.startsWith(NM)) {
      res.writeHead(403);
      return res.end();
    }
    readFile(f, res);
  });
  const readFile = (f, res) => {
    try {
      const d = readFileSync(f);
      res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
      res.end(d);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  };
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const url = (route) => `${origin}${BASE.replace(/\/$/, '')}${route}`;
  const fontCssFile = join(NM, '@fontsource-variable/noto-sans-tc/wght.css');
  const phoneFont = !flag('no-phone-font') && existsSync(fontCssFile) ? readFileSync(fontCssFile, 'utf8').replaceAll("'Noto Sans TC Variable'", "'Noto Sans CJK TC'").replaceAll('url(./files/', `url(${origin}/__nm/@fontsource-variable/noto-sans-tc/files/`) : null;

  for (const n of BROWSER) if (run(n)) result(n);
  const browser = await chromium.launch();
  const viewPages = pages.filter((p) => !p.redirect && p.route.endsWith('/') && (!PAGES || PAGES.test(p.route)));
  const SIZES = { 標準: null, 大: '115%', 特大: '130%' };

  async function withPage(opts, fn) {
    const ctx = await browser.newContext({ viewport: { width: opts.width ?? 360, height: opts.height ?? 740 }, deviceScaleFactor: 1, javaScriptEnabled: opts.js !== false, colorScheme: opts.dark ? 'dark' : 'light', reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    try {
      return await fn(page);
    } finally {
      await ctx.close();
    }
  }
  async function open(page, route, { size = null, settle = 250, js = true } = {}) {
    await page.goto(url(route), { waitUntil: 'load', timeout: 45000 });
    // addStyleTag waits for a load event that never comes with JavaScript off
    if (phoneFont && js !== false) await page.addStyleTag({ content: phoneFont }).catch(() => {});
    if (size) await page.evaluate((s) => (document.documentElement.style.fontSize = s), size);
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    if (settle) await page.waitForTimeout(settle);
  }
  const each = async (n, opts, fn, list = viewPages) => {
    if (!run(n)) return;
    for (const p of list) {
      const t0 = Date.now();
      try {
        await withPage(opts, async (page) => {
          await open(page, p.route, opts);
          await fn(page, p);
        });
      } catch (e) {
        fail(n, p.route, `could not be checked: ${String(e.message).split('\n')[0]}`);
      }
      progress(`  ${n} ${p.route} ${JSON.stringify(opts)} ${Date.now() - t0} ms`);
    }
  };

  // helpers injected into every page
  const HELPERS = `
    window.__cs = {
      inClosedDetails(el) { for (let d = el.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) { if (!d.open && !(el.closest('summary') && el.closest('summary').parentElement === d)) return true; } return false; },
      sel(el) { if (!el || el.nodeType !== 1) return '?'; let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; else if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.'); const anc = el.parentElement && el.parentElement.closest('[id]'); return anc ? '#' + anc.id + ' ' + s : s; },
      visible(el) { if (!el || !el.getBoundingClientRect) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; if (r.right <= 0 || r.left >= innerWidth) return false; if (this.inClosedDetails(el)) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false; return true; },
      textNodes() { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || el.closest('script,style,noscript,template,svg title,svg desc') || this.inClosedDetails(el)) continue; const range = document.createRange(); range.selectNodeContents(n); const rects = [...range.getClientRects()].filter(r => r.width >= 1 && r.height >= 1); if (!rects.length) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue; let hiddenByClip = false; for (let a = el; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (Number(s.opacity) === 0) { hiddenByClip = true; break; } const r = a.getBoundingClientRect(); if ((s.overflow === 'hidden' || s.clip !== 'auto' || s.clipPath !== 'none') && (r.width <= 2 || r.height <= 2)) { hiddenByClip = true; break; } } if (hiddenByClip) continue; out.push({ node: n, el, rects }); } return out; },
      isBody(el) { const p = el.closest('p'); if (!p || !p.closest('main')) return false; if (p.closest('figure,figcaption,footer,header,nav,aside,table,small,label,legend,button,summary,dl,[data-how-sheet],[data-sheet],[data-illustration-tag],[role=note],svg')) return false; const cls = (x) => (x.className && typeof x.className === 'string' ? x.className : ''); for (let a = p; a && a.tagName !== 'MAIN'; a = a.parentElement) if (/quiet|caption|note|meta|label|legend|chip|badge|fine|source|cite|eyebrow|kicker|small|footnote|tag|hint|disclaim|caveat/i.test(cls(a))) return false; return true; },
      rgba(s) { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; },
      lum(c) { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); },
      over(top, under) { const a = top.a + under.a * (1 - top.a); if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }; return { r: (top.r * top.a + under.r * under.a * (1 - top.a)) / a, g: (top.g * top.a + under.g * under.a * (1 - top.a)) / a, b: (top.b * top.a + under.b * under.a * (1 - top.a)) / a, a }; },
      bg(el) { const layers = []; for (let a = el; a; a = a.parentElement) { const s = getComputedStyle(a); if (s.backgroundImage && s.backgroundImage !== 'none') return { unknown: 'background image or gradient behind it' }; const c = this.rgba(s.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } } let base = { r: 255, g: 255, b: 255, a: 1 }; for (const l of layers.reverse()) base = this.over(l, base); return base; },
      ratio(a, b) { const x = this.lum(a), y = this.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); },
    };`;
  const inject = (page) => page.evaluate(HELPERS);

  // ---- 9 (heights) and 10 (picture share) at 360 × 740, 標準 --------------------------------
  const homes = viewPages.filter((p) => p.neutral === '/');
  if (run(9) || run(10))
    for (const p of homes)
      await withPage({}, async (page) => {
        await open(page, p.route, { settle: 600 });
        const m = await page.evaluate(() => {
          const arts = [...document.querySelectorAll('article[data-screen]')];
          const H = document.documentElement.scrollHeight;
          let pics = [...document.querySelectorAll('article[data-screen] .screen__pic, [data-screen-picture]')];
          const hooked = pics.length > 0;
          if (!hooked) {
            const all = [...document.querySelectorAll('main svg, main img, main canvas, main video, main picture')].filter((e) => { const r = e.getBoundingClientRect(); return r.width * r.height > 20000; });
            pics = all.filter((e) => !all.some((o) => o !== e && o.contains(e)));
          }
          const iv = pics.map((e) => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; }).sort((a, b) => a[0] - b[0]);
          let cover = 0, end = -1;
          for (const [a, b] of iv) { if (b <= end) continue; cover += b - Math.max(a, end); end = b; }
          return { H, screens: arts.map((a, i) => ({ i: i + 1, h: Math.round(a.getBoundingClientRect().height), id: a.id })), cover: Math.round(cover), hooked };
        });
        if (run(9)) {
          if (m.H > 12300) fail(9, p.route, `page is ${m.H} px tall at 360 × 740 (max 12,300)`);
          for (const s of m.screens) if (s.h > 850) fail(9, p.route, `screen ${s.i}${s.id ? ` (#${s.id})` : ''} is ${s.h} px tall (max 850)`);
          note(9, `${p.route}: ${m.H} px tall, ${m.screens.length} screens`);
        }
        if (run(10)) {
          const share = m.cover / m.H;
          note(10, `${p.route}: pictures cover ${(share * 100).toFixed(0)}% of ${m.H} px${m.hooked ? '' : ' (no Screen pictures; counted every large svg/img in main)'}`);
          if (share < 0.45) fail(10, p.route, `pictures and charts cover ${(share * 100).toFixed(1)}% of the page height (min 45%)`);
          if (!m.hooked) fail(10, p.route, 'no screen picture (article[data-screen] .screen__pic) on the page');
        }
      });

  // ---- 11 font sizes at 320, 360, 390 ---------------------------------------------------------
  for (const width of [320, 360, 390])
    await each(11, { width }, async (page, p) => {
      await inject(page);
      const bad = await page.evaluate(() => {
        const small = [], body = [];
        for (const { el, node } of __cs.textNodes()) {
          // SVG text is sized in the drawing's units: what the reader sees is that times the drawing's scale
          let fs = parseFloat(getComputedStyle(el).fontSize);
          if (el.closest('svg') && el.getScreenCTM) { const m = el.getScreenCTM(); if (m) fs = Math.round(fs * Math.hypot(m.a, m.b) * 10) / 10; }
          if (fs < 13.95) small.push(`${fs}px 「${node.nodeValue.trim().slice(0, 24)}」 ${__cs.sel(el)}`);
          else if (fs < 17.95 && __cs.isBody(el)) body.push(`${fs}px 「${node.nodeValue.trim().slice(0, 24)}」 ${__cs.sel(el)}`);
        }
        return { small, body };
      });
      if (bad.small.length) fail(11, `${p.route} @${width}`, `${bad.small.length} visible text node(s) under 14 px, e.g. ${[...new Set(bad.small)].slice(0, 3).join(' · ')}`);
      if (bad.body.length) fail(11, `${p.route} @${width}`, `${bad.body.length} body text node(s) under 18 px, e.g. ${[...new Set(bad.body)].slice(0, 3).join(' · ')}`);
    });

  // ---- 12 touch targets at 360 ------------------------------------------------------------------
  await each(12, {}, async (page, p) => {
    await inject(page);
    const r = await page.evaluate(() => {
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=switch], [role=radio], [role=checkbox], [role=slider], [tabindex]:not([tabindex="-1"])';
      const raw = [...document.querySelectorAll(sel)];
      const targets = [];
      for (let el of raw) {
        if (el.matches('input') && !__cs.visible(el)) {
          const lab = el.closest('label') || (el.id && document.querySelector('label[for="' + el.id + '"]'));
          if (!lab) continue;
          el = lab;
        }
        if (!__cs.visible(el)) continue;
        if (targets.some((t) => t.el === el)) continue;
        targets.push({ el, r: el.getBoundingClientRect() });
      }
      const small = [], close = [];
      let inline = 0;
      for (const t of targets) {
        if (t.r.width < 47.5 || t.r.height < 47.5) {
          const blk = t.el.parentElement && t.el.parentElement.closest('p,li,td,dd,figcaption');
          const isInline = t.el.tagName === 'A' && blk && blk.textContent.trim().length > t.el.textContent.trim().length + 2;
          if (isInline) inline++;
          small.push(`${Math.round(t.r.width)}×${Math.round(t.r.height)} ${__cs.sel(t.el)}${isInline ? ' (link in a sentence)' : ''} 「${(t.el.textContent || t.el.getAttribute('aria-label') || '').trim().slice(0, 16)}」`);
        }
      }
      for (let i = 0; i < targets.length; i++)
        for (let j = i + 1; j < targets.length; j++) {
          const a = targets[i], b = targets[j];
          if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
          const dx = Math.max(0, b.r.left - a.r.right, a.r.left - b.r.right);
          const dy = Math.max(0, b.r.top - a.r.bottom, a.r.top - b.r.bottom);
          const gap = Math.max(dx, dy);
          if (gap < 7.5) close.push(`${__cs.sel(a.el)} and ${__cs.sel(b.el)} ${gap === 0 ? 'touch or overlap' : Math.round(gap) + ' px apart'}`);
        }
      return { n: targets.length, small, close, inline };
    });
    if (r.small.length) fail(12, p.route, `${r.small.length} of ${r.n} target(s) under 48 × 48 px (${r.inline} are links inside sentences), e.g. ${r.small.slice(0, 3).join(' · ')}`);
    if (r.close.length) fail(12, p.route, `${r.close.length} pair(s) of targets closer than 8 px, e.g. ${r.close.slice(0, 2).join(' · ')}`);
  });

  // ---- 13 overflow, clipping and phrase breaks at 320 -----------------------------------------
  for (const [name, size] of Object.entries(SIZES))
    await each(13, { width: 320, size }, async (page, p) => {
      await inject(page);
      const r = await page.evaluate((zh) => {
        const out = { scroll: 0, wide: [], clipped: [], phrase: [] };
        const W = document.documentElement.clientWidth;
        out.scroll = document.documentElement.scrollWidth - W;
        const inScroller = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const s = getComputedStyle(a).overflowX; if (s === 'auto' || s === 'scroll' || s === 'hidden' || s === 'clip') return a !== document.documentElement && a !== document.body; } return false; };
        for (const el of document.querySelectorAll('body *')) {
          if (!__cs.visible(el) || el.closest('svg')) continue;
          const r = el.getBoundingClientRect();
          if (r.right > W + 1 && !inScroller(el) && el.textContent.trim()) out.wide.push(`${__cs.sel(el)} reaches ${Math.round(r.right)} px`);
          const s = getComputedStyle(el);
          const hidesX = s.overflowX === 'hidden' || s.overflowX === 'clip', hidesY = s.overflowY === 'hidden' || s.overflowY === 'clip';
          if ((hidesX && el.scrollWidth > el.clientWidth + 1) || (hidesY && el.scrollHeight > el.clientHeight + 1) || (s.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) || (s.webkitLineClamp && s.webkitLineClamp !== 'none')) {
            if (el.clientWidth > 2 && el.clientHeight > 2 && el.textContent.trim() && ![...el.children].every((c) => c.tagName === 'svg' || c.tagName === 'IMG')) out.clipped.push(`${__cs.sel(el)} 「${el.textContent.trim().slice(0, 20)}」`);
          }
        }
        for (const h of document.querySelectorAll('h1, h2, h3')) {
          if (!__cs.visible(h)) continue;
          const phrases = h.querySelectorAll('.phrase');
          for (const ph of phrases) if (ph.getClientRects().length > 1) out.phrase.push(`breaks inside 「${ph.textContent.trim()}」 in 「${h.textContent.trim().slice(0, 30)}」`);
          if (zh && !phrases.length && /[\\u3400-\\u9fff]/.test(h.textContent)) {
            const lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.3;
            if (h.getBoundingClientRect().height > lh * 1.5) out.phrase.push(`wraps without phrase marks: 「${h.textContent.trim().slice(0, 30)}」`);
          }
        }
        out.wide = [...new Set(out.wide)];
        return out;
      }, p.locale === 'zh-TW');
      const where = `${p.route} @320 ${name}`;
      if (r.scroll > 1) fail(13, where, `scrolls sideways by ${r.scroll} px${r.wide.length ? `; widest: ${r.wide.slice(0, 2).join(' · ')}` : ''}`);
      else if (r.wide.length) fail(13, where, `${r.wide.length} element(s) run past the right edge, e.g. ${r.wide.slice(0, 2).join(' · ')}`);
      if (r.clipped.length) fail(13, where, `${r.clipped.length} element(s) clip their text, e.g. ${r.clipped.slice(0, 2).join(' · ')}`);
      if (r.phrase.length) fail(13, where, `${r.phrase.length} headline break(s): ${r.phrase.slice(0, 2).join(' · ')}`);
    });

  // ---- 14 contrast, light and dark ------------------------------------------------------------
  let marks = 0;
  for (const dark of [false, true])
    await each(14, { dark }, async (page, p) => {
      await inject(page);
      const r = await page.evaluate(() => {
        const out = { low: [], unknown: 0, marks: 0, lowMarks: [] };
        const done = new Set();
        for (const { el, node } of __cs.textNodes()) {
          if (done.has(el)) continue;
          done.add(el);
          if (el.closest('svg')) continue;
          const cs = getComputedStyle(el);
          const fg = __cs.rgba(cs.color);
          const bg = __cs.bg(el);
          if (!fg || bg.unknown) { out.unknown++; continue; }
          const c = __cs.over(fg, bg);
          const ratio = __cs.ratio(c, bg);
          const need = el.closest('h1,h2,h3') || __cs.isBody(el) ? 7 : 4.5;
          if (ratio < need - 0.005) out.low.push(`${ratio.toFixed(2)}:1 (needs ${need}) ${__cs.sel(el)} 「${node.nodeValue.trim().slice(0, 16)}」`);
        }
        for (const m of document.querySelectorAll('.air-ring, .air-dot, .air-rib')) {
          if (!__cs.visible(m)) continue;
          out.marks++;
          const cs = getComputedStyle(m);
          const paint = cs.stroke && cs.stroke !== 'none' ? cs.stroke : cs.fill;
          const fg = __cs.rgba(paint);
          const host = m.closest('svg') ? m.closest('svg').parentElement : m.parentElement;
          const bg = __cs.bg(host);
          if (!fg || bg.unknown) continue;
          const ratio = __cs.ratio(__cs.over({ ...fg, a: fg.a * (Number(cs.strokeOpacity || cs.fillOpacity || 1)) }, bg), bg);
          if (ratio < 2.995) out.lowMarks.push(`${ratio.toFixed(2)}:1 ${__cs.sel(m)}`);
        }
        return out;
      });
      marks += r.marks;
      const where = `${p.route} ${dark ? 'dark' : 'light'}`;
      if (r.low.length) fail(14, where, `${r.low.length} text element(s) below contrast, e.g. ${[...new Set(r.low)].slice(0, 3).join(' · ')}`);
      if (r.lowMarks.length) fail(14, where, `${r.lowMarks.length} mark(s) under 3:1, e.g. ${r.lowMarks.slice(0, 2).join(' · ')}`);
    });
  if (run(14)) {
    note(14, `${marks} visible air mark(s) (.air-ring, .air-dot, .air-rib) checked across both themes`);
    if (!marks) fail(14, '(all pages)', 'no air mark (.air-ring, .air-dot, .air-rib from air.ts) on any page, so no meaningful mark was checked for 3:1');
  }

  // ---- 15 JavaScript off ------------------------------------------------------------------------
  if (run(15)) {
    await each(
      15,
      { js: false },
      async (page, p) => {
        const r = await page.evaluate((neutral) => {
          const vis = (el) => { if (!el) return false; const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 1 && b.height > 1 && s.visibility !== 'hidden' && s.display !== 'none'; };
          const out = { problems: [] };
          if (neutral === '/') {
            const arts = [...document.querySelectorAll('article[data-screen]')];
            if (!arts.length) out.problems.push('no article[data-screen] to check');
            arts.forEach((a, i) => {
              const pic = a.querySelector('.screen__pic, [data-screen-picture]') || a.querySelector('svg, img, picture');
              if (!vis(pic)) out.problems.push(`screen ${i + 1}: no visible picture`);
              if (!vis(a.querySelector('h2'))) out.problems.push(`screen ${i + 1}: no visible headline`);
              if (!vis(a.querySelector('.screen__body, [data-screen-body]'))) out.problems.push(`screen ${i + 1}: no visible body (.screen__body)`);
              const sheet = a.querySelector('[data-how-sheet], [data-sheet]');
              const content = sheet && (sheet.matches('details') ? sheet : sheet.querySelector('details') || sheet);
              const open = content && (!content.matches('details') || content.open);
              if (!content || !vis(content) || !open || content.textContent.trim().length < 20) out.problems.push(`screen ${i + 1}: sheet content not shown (HowSheet: an open <details data-how-sheet> without JavaScript)`);
            });
          } else if (neutral === '/90/') {
            const stills = [...document.querySelectorAll('main img, main svg, main picture')].filter((e) => { const b = e.getBoundingClientRect(); return vis(e) && b.width * b.height > 20000; });
            if (!stills.length) out.problems.push('the film shows no still without JavaScript');
            const tr = document.querySelector('[data-transcript], #transcript');
            if (!tr) out.problems.push('no [data-transcript] element');
            else if (!vis(tr) || tr.textContent.trim().length < 200) out.problems.push('the transcript is not shown without JavaScript');
          }
          for (const s of document.querySelectorAll('[data-how-sheet], [data-sheet]')) {
            const d = s.matches('details') ? s : s.querySelector('details');
            if (d && !d.open && !s.closest('article[data-screen]')) out.problems.push(`sheet ${s.id ? '#' + s.id : ''} is a closed <details> without JavaScript`);
          }
          return out;
        }, p.neutral);
        for (const x of r.problems) fail(15, `${p.route} (no JS)`, x);
      },
      viewPages,
    );
  }

  // ---- 16 reduced motion --------------------------------------------------------------------
  await each(16, { reduced: true }, async (page, p) => {
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const a = await page.screenshot();
    const running = await page.evaluate(() => {
      const anims = (document.getAnimations ? document.getAnimations() : []).filter((x) => x.playState === 'running');
      const describe = (x) => { const t = x.effect && x.effect.target; const n = x.animationName || (x.constructor && x.constructor.name) || 'animation'; return `${n} on ${t ? (t.id ? '#' + t.id : t.tagName.toLowerCase() + (t.classList && t.classList.length ? '.' + t.classList[0] : '')) : '?'}`; };
      const smil = [...document.querySelectorAll('animate, animateTransform, animateMotion, set')].filter((x) => { const svg = x.ownerSVGElement; return svg && !svg.animationsPaused(); });
      const video = [...document.querySelectorAll('video')].filter((v) => !v.paused);
      return { anims: anims.map(describe), smil: smil.length, video: video.length };
    });
    await page.waitForTimeout(1200);
    const b = await page.screenshot();
    const moved = !a.equals(b);
    if (running.anims.length) fail(16, p.route, `${running.anims.length} animation(s) running with reduced motion, e.g. ${[...new Set(running.anims)].slice(0, 3).join(' · ')}`);
    if (running.smil) fail(16, p.route, `${running.smil} SVG <animate> element(s) running with reduced motion`);
    if (running.video) fail(16, p.route, `${running.video} video(s) playing with reduced motion`);
    if (moved && !running.anims.length && !running.smil) fail(16, p.route, 'the first screen changed between two screenshots 1.2 s apart (something moves by script)');
  });

  // ---- 23 the calculator's opening state --------------------------------------------------------
  if (run(23))
    for (const l of LOC) {
      const base = `${prefix(l)}/electric/`;
      if (!byRoute.has(base)) {
        fail(23, base, 'page missing');
        continue;
      }
      for (const [query, expect] of [
        ['', null],
        ['?county=kaohsiung&scrap=no&km=500#result', { chose: l === 'en' ? /What you chose/i : /你在首頁選的/, county: l === 'en' ? /Kaohsiung/ : /高雄/, km: /500/ }],
      ]) {
        try {
          await withPage({}, async (page) => {
            await open(page, `${base}${query}`, { settle: 1200 });
            const r = await page.evaluate(() => {
              const el = document.querySelector('[data-result]') || document.getElementById('result');
              const b = el && el.getBoundingClientRect();
              const text = el ? el.innerText : '';
              return { found: !!el, hooked: !!document.querySelector('[data-result]'), visible: !!b && b.width > 1 && b.height > 1, text, page: document.body.innerText };
            });
            const where = `${base}${query}`;
            if (!r.found) return fail(23, where, 'no [data-result] (or #result) element');
            if (!r.hooked) note(23, `${where}: no [data-result] hook; read #result`);
            if (!r.visible) fail(23, where, 'the result is not visible on arrival');
            if (!/\d[\d,]{2,}/.test(r.text) || !(l === 'en' ? /NT\$/.test(r.text) : /元/.test(r.text))) fail(23, where, `the result shows no worked amount (${l === 'en' ? 'NT$' : '元'}): 「${cut(r.text, 60)}」`);
            const empty = l === 'en' ? /choose a county|pick a county|select a county first/i : /先選縣市|請先選擇|選擇縣市後/;
            if (empty.test(r.page)) fail(23, where, `an empty state is shown: 「${r.page.match(empty)[0]}」`);
            if (expect) {
              if (!expect.chose.test(r.page)) fail(23, where, `the line naming what was chosen (${expect.chose.source}) is missing`);
              if (!expect.county.test(r.text) && !expect.county.test(r.page)) fail(23, where, 'the result is not for Kaohsiung');
              if (!expect.km.test(r.page)) fail(23, where, 'the page does not show 500 km');
            }
          });
        } catch (e) {
          fail(23, `${base}${query}`, `could not be checked: ${String(e.message).split('\n')[0]}`);
        }
      }
    }

  await browser.close();
  server.close();
}

// ============================================================================================
// Report
// ============================================================================================
const order = [...results.values()].sort((a, b) => a.id - b.id);
if (opt('report')) writeFileSync(resolve(opt('report')), `${JSON.stringify({ dist: DIST, base: BASE, pages: pages.length, checks: order }, null, 2)}\n`);
if (JSON_OUT) {
  writeSync(1, `${JSON.stringify({ dist: DIST, base: BASE, pages: pages.length, checks: order }, null, 2)}\n`);
} else {
  console.log(`check-site: ${pages.length} built page(s) in ${DIST} (base ${BASE})\n`);
  for (const r of order) {
    const mark = r.status === 'pass' ? '✔' : r.status === 'skipped' ? '–' : '✖';
    console.log(`${mark} ${String(r.id).padStart(2)}  ${r.title}${r.status === 'fail' ? `: ${r.problems.length} problem(s)` : r.status === 'skipped' ? ': skipped' : ''}`);
    for (const n of r.notes) console.log(`        · ${n}`);
    for (const x of r.problems.slice(0, MAX)) console.log(`        ${x.page}  ${x.text}`);
    if (r.problems.length > MAX) {
      const by = {};
      for (const x of r.problems) by[x.page] = (by[x.page] ?? 0) + 1;
      console.log(`        … ${r.problems.length - MAX} more (--max ${r.problems.length} or --json for all); by page: ${Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${v}`).join(', ')}`);
    }
  }
  const failed = order.filter((r) => r.status === 'fail').map((r) => r.id);
  console.log(`\n${failed.length ? `✖ ${failed.length} of ${order.length} check(s) fail: ${failed.join(', ')}` : `✔ all ${order.length} check(s) pass`}`);
}
process.exitCode = order.some((r) => r.status === 'fail') ? 1 : 0;
