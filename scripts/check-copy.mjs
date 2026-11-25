#!/usr/bin/env node
// The copy guard. Run via `npm run check` (or `node scripts/check-copy.mjs`).
//
// WHAT IT DOES
//   Runs flagCopy() from src/data/claims-policy.ts over every reader-facing string on the site,
//   in both languages, and fails (exit 1) on any match that has not been reviewed. A match is a
//   prompt to check the copy against the rule, not proof of an error — which is why a reviewed
//   match can be allowed, by name, with a reason.
//
// THE CONVENTION (see also src/i18n/pages/_copy.ts)
//   - Page copy lives in per-page modules: src/i18n/pages/<page>.ts, default-exporting a tree
//     whose leaves are { 'zh-TW': '…', en: '…' }. Shared interface strings live in
//     src/i18n/ui.ts (and src/i18n/art.ts for labels drawn inside illustrations).
//   - Every string has a stable id: <module>.<dotted.path>, arrays by index.
//       src/i18n/pages/home.ts   { link3: { body: [ {…}, {…} ] } }   →  home.link3.body.1
//       src/i18n/ui.ts           export const chain = { summary: [ { text: {…} } ] }  →  ui.chain.summary.0.text
//   - Copy is not written inline in .astro pages. Any CJK text in src/pages/** fails this check
//     unless the file is listed under "inlineCopyAllowed" in the allow-list (the styleguide is).
//
// THE ALLOW-LIST: src/i18n/copy-allowlist.json
//   { "entries": [ { "id": "home.link5.honesty", "rule": "association-not-causation",
//                    "locale": "zh-TW", "reason": "States that the studies show association, NOT
//                    cause: the rule's own wording.", "reviewedBy": "…", "reviewedOn": "2026-11-25" } ] }
//   - Keyed by (string id, rule id). `locale` is optional: leave it out to allow both languages.
//   - `reason` is required and must say why this string is right despite the match.
//   - An entry that no longer matches anything fails the check ("stale entry"), so the list
//     cannot quietly outlive the copy it was reviewed against. Remove it.
//   - Add entries only after reading the rule that fired (printed with each failure).
//
// ALSO CHECKED (three mechanical voice rules from blueprint Part 2; same allow-list, rule ids below)
//   reader-tai     reader-facing Chinese writes 台灣, not 臺灣
//   voice-nin      你, never 您
//   voice-exclaim  no exclamation marks, either language
//   and: both languages present and non-empty.
//
// FLAGS
//   --list   print every string id (to find the id for an allow-list entry)
//   --json   machine-readable failures

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.removeAllListeners('warning');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(resolve(root, p)).href);
const args = new Set(process.argv.slice(2));
const ALLOW = 'src/i18n/copy-allowlist.json';

const { flagCopy } = await load('src/data/claims-policy.ts');

// ---- collect strings ---------------------------------------------------------
const isL10n = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 2 && typeof v['zh-TW'] === 'string' && typeof v.en === 'string';
// a label set as several lines: { 'zh-TW': ['…', '…'], en: ['…', '…'] }
const isL10nLines = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 2 && Array.isArray(v['zh-TW']) && Array.isArray(v.en) && [...v['zh-TW'], ...v.en].every((x) => typeof x === 'string');
const halfL10n = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('zh-TW' in v || 'en' in v) && !isL10n(v) && !isL10nLines(v) && Object.keys(v).every((k) => k === 'zh-TW' || k === 'en');

/** @type {{ id: string, file: string, text: { 'zh-TW': string, en: string } }[]} */
const strings = [];
const problems = []; // structural problems: not allow-listable

function walk(value, id, file, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (isL10n(value)) return void strings.push({ id, file, text: value });
  if (isL10nLines(value)) return void strings.push({ id, file, text: { 'zh-TW': value['zh-TW'].join(''), en: value.en.join(' ') } });
  if (halfL10n(value)) return void problems.push(`${id}: a string is missing a language (needs both 'zh-TW' and en)`);
  for (const [k, v] of Array.isArray(value) ? value.entries() : Object.entries(value)) walk(v, `${id}.${k}`, file, seen);
}

const modules = [];
for (const f of readdirSync(join(root, 'src/i18n'))) if (f.endsWith('.ts') && f !== 'index.ts') modules.push({ file: `src/i18n/${f}`, name: f.replace(/\.ts$/, ''), page: false });
const pagesDir = join(root, 'src/i18n/pages');
if (existsSync(pagesDir)) for (const f of readdirSync(pagesDir).sort()) if (f.endsWith('.ts') && !f.startsWith('_')) modules.push({ file: `src/i18n/pages/${f}`, name: f.replace(/\.ts$/, ''), page: true });

for (const m of modules) {
  let mod;
  try {
    mod = await load(m.file);
  } catch (e) {
    problems.push(`${m.file}: could not be loaded by Node (${String(e.message).split('\n')[0]}). Copy modules use relative imports with the .ts extension and import nothing from '@/…'.`);
    continue;
  }
  if (m.page) {
    if (!mod.default) problems.push(`${m.file}: a page copy module must have a default export (export default copy({ … }))`);
    walk(mod.default, m.name, m.file);
  } else for (const [k, v] of Object.entries(mod)) walk(v, `${m.name}.${k}`, m.file);
}

if (args.has('--list')) {
  for (const s of strings) console.log(s.id);
  console.log(`\n${strings.length} strings in ${modules.length} modules`);
  process.exit(0);
}

// ---- flags -------------------------------------------------------------------
const voice = [
  { id: 'reader-tai', locale: 'zh-TW', re: /臺/, rule: 'Reader-facing Chinese writes 台灣 / 台北, not 臺 (blueprint Part 2).', instead: '台' },
  { id: 'voice-nin', locale: 'zh-TW', re: /您/, rule: 'The site says 你, never 您 (blueprint Part 2, register).', instead: '你' },
  { id: 'voice-exclaim', locale: 'zh-TW', re: /[！!]/, rule: 'No exclamation marks (blueprint Part 2, register).' },
  { id: 'voice-exclaim', locale: 'en', re: /!/, rule: 'No exclamation marks (blueprint Part 2, register).' },
];

/** @type {{ id: string, file: string, locale: string, rule: string, kind: string, match: string, text: string, ruleText: string, instead?: string }[]} */
const flags = [];
for (const s of strings) {
  for (const locale of ['zh-TW', 'en']) {
    const text = s.text[locale];
    if (!text.trim()) {
      // an empty string in BOTH languages is a deliberate blank (e.g. a unit with no symbol)
      if (s.text['zh-TW'].trim() || s.text.en.trim()) problems.push(`${s.id}: empty ${locale} string`);
      continue;
    }
    for (const f of flagCopy(text, locale)) flags.push({ id: s.id, file: s.file, locale, rule: f.id, kind: f.kind, match: f.match, text, ruleText: f.rule, instead: f.instead });
    for (const v of voice) {
      if (v.locale !== locale) continue;
      const m = v.re.exec(text);
      if (m) flags.push({ id: s.id, file: s.file, locale, rule: v.id, kind: 'voice', match: m[0], text, ruleText: v.rule, instead: v.instead });
    }
  }
}

// ---- allow-list ----------------------------------------------------------------
let allow = { entries: [], inlineCopyAllowed: [] };
if (existsSync(join(root, ALLOW))) {
  try {
    allow = { entries: [], inlineCopyAllowed: [], ...JSON.parse(readFileSync(join(root, ALLOW), 'utf8')) };
  } catch (e) {
    problems.push(`${ALLOW}: not valid JSON (${e.message})`);
  }
}
const used = new Set();
allow.entries.forEach((e, i) => {
  if (!e.id || !e.rule) problems.push(`${ALLOW} entry ${i + 1}: needs "id" and "rule"`);
  if (!e.reason || e.reason.trim().length < 12) problems.push(`${ALLOW} entry ${i + 1} (${e.id} / ${e.rule}): needs a "reason" that says why the string is right despite the match`);
});
const failures = flags.filter((f) => {
  const i = allow.entries.findIndex((e) => e.id === f.id && e.rule === f.rule && (!e.locale || e.locale === f.locale));
  if (i < 0) return true;
  used.add(i);
  return false;
});
const stale = allow.entries.filter((_, i) => !used.has(i));

// ---- inline copy in pages -------------------------------------------------------
const inline = [];
const CJK = /[㐀-鿿]/;
(function scan(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) scan(p);
    else if (/\.(astro|md|mdx)$/.test(f.name)) {
      const rel = relative(root, p).replaceAll('\\', '/');
      if (allow.inlineCopyAllowed.includes(rel)) continue;
      const lines = readFileSync(p, 'utf8').split('\n');
      const hits = lines.map((l, i) => [i + 1, l]).filter(([, l]) => CJK.test(l) && !/^\s*(\/\/|\*|\/\*|<!--)/.test(l));
      if (hits.length) inline.push({ file: rel, count: hits.length, first: hits[0] });
    }
  }
})(join(root, 'src/pages'));

// ---- report ----------------------------------------------------------------------
if (args.has('--json')) {
  console.log(JSON.stringify({ strings: strings.length, failures, stale, inline, problems }, null, 2));
  process.exit(failures.length || stale.length || inline.length || problems.length ? 1 : 0);
}

const cut = (s, n = 110) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
let bad = 0;
if (problems.length) {
  bad += problems.length;
  console.error(`\n✖ check-copy: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
}
if (failures.length) {
  bad += failures.length;
  console.error(`\n✖ check-copy: ${failures.length} unreviewed match(es). Read the rule; fix the copy, or allow it with a reason in ${ALLOW}.\n`);
  for (const f of failures) {
    console.error(`  ${f.id}  [${f.locale}]  rule: ${f.rule} (${f.kind})`);
    console.error(`    matched  「${f.match}」 in: ${cut(f.text)}`);
    console.error(`    rule     ${cut(f.ruleText, 200)}`);
    if (f.instead) console.error(`    instead  ${cut(f.instead, 200)}`);
    console.error(`    to allow { "id": "${f.id}", "rule": "${f.rule}", "locale": "${f.locale}", "reason": "…" }\n`);
  }
}
if (stale.length) {
  bad += stale.length;
  console.error(`\n✖ check-copy: ${stale.length} stale allow-list entr${stale.length === 1 ? 'y' : 'ies'} (nothing matches any more; remove from ${ALLOW}):\n`);
  for (const e of stale) console.error(`  ${e.id} / ${e.rule}${e.locale ? ` [${e.locale}]` : ''}`);
}
if (inline.length) {
  bad += inline.length;
  console.error(`\n✖ check-copy: copy written inline in a page. Move it to src/i18n/pages/<page>.ts so the guard can read it:\n`);
  for (const f of inline) console.error(`  ${f.file}: ${f.count} line(s) with Chinese text, first at line ${f.first[0]}: ${cut(f.first[1].trim(), 70)}`);
}
if (bad) {
  console.error('');
  process.exit(1);
}
console.log(`✔ check-copy: ${strings.length} strings in ${modules.length} modules; ${flags.length} match(es), all reviewed (${allow.entries.length} allow-list entries).`);
