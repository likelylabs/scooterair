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
// THE REDESIGN BRIEF'S RULES (docs/redesign-brief.md; the rules themselves are in scripts/brief-rules.mjs)
//   brief-banned-string   the strings of acceptance check 1 (沒人量過, 無資料, 待確認, "placeholder", …)
//   brief-k-sentence-only 沒有人量過, 還沒有人, 沒有人證明過, 算不出來, "not measured", "nobody has
//                         shown" … only inside one of the K sentences of brief 7.1 (check 2). The K
//                         sentences are the brief's, plus any lane B publishes as `kSentences` in
//                         src/i18n/ui.ts. Which page may carry which K sentence is check-site's job.
//   brief-no-…, brief-vocab-…, brief-idling-legal, brief-masks-…
//                         one rule per banned claim of brief 4.6 and check 3, and the masks
//                         must-not-say list (12.2). Rules with scope 'headline' apply to strings
//                         whose id names a headline or title.
//   A claim rule in src/data/claims-policy.ts with the same id replaces the brief rule here; every
//   other registry rule runs through flagCopy() as before, so lane A's new rules load by themselves.
//
// ALSO CHECKED (three mechanical voice rules from blueprint Part 2; same allow-list, rule ids below)
//   reader-tai     reader-facing Chinese writes 台灣, not 臺灣
//   voice-nin      你, never 您
//   voice-exclaim  no exclamation marks, either language
//   and: both languages present and non-empty.
//
// FLAGS
//   --list            print every string id (to find the id for an allow-list entry)
//   --json            machine-readable failures
//   --only home,act   report failures only for strings whose module is one of these (a lane checking
//                     its own copy while others are mid-edit). Exit status follows what is reported.
//   --vocab           also print advice from the vocabulary list of brief 6.6 (never fails)

import { readdirSync, readFileSync, existsSync, writeSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.removeAllListeners('warning');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(resolve(root, p)).href);
const argv = process.argv.slice(2);
const args = new Set(argv);
const onlyArg = argv.find((a, i) => a.startsWith('--only=') || argv[i - 1] === '--only');
const only = onlyArg ? new Set((onlyArg.startsWith('--only=') ? onlyArg.slice(7) : onlyArg).split(',').filter(Boolean)) : null;
const ALLOW = 'src/i18n/copy-allowlist.json';

const policy = await load('src/data/claims-policy.ts');
const { flagCopy } = policy;
const registryRuleIds = new Set(Object.keys(policy.claimRules ?? {}));
const brief = await load('scripts/brief-rules.mjs');
const briefRules = [...brief.bannedRules, ...brief.claimRules].filter((r) => !registryRuleIds.has(r.id));
const HEADLINE_ID = /(^|\.)(headline|headlines|title|titles|heading|h1|h2|h3)(\.|$)|headline|title/i;

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
// Copy modules outside src/i18n that export plain { 'zh-TW', en } leaves (lane D's chart words).
for (const f of ['src/components/charts/strings.ts']) if (existsSync(join(root, f))) modules.push({ file: f, name: 'charts', page: false });

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

// K sentences: the brief's, plus lane B's shared strings when published (export `kSentences` in
// src/i18n/ui.ts: { K1: { 'zh-TW', en }, … } or [{ id, text: { 'zh-TW', en } }, …])
const kSentences = brief.kSentences.map((k) => ({ ...k, text: { 'zh-TW': [...k.text['zh-TW']], en: [...k.text.en] } }));
try {
  const ui = await load('src/i18n/ui.ts');
  const pub = ui.kSentences;
  const list = Array.isArray(pub) ? pub : pub && typeof pub === 'object' ? Object.entries(pub).map(([id, text]) => ({ id, text })) : [];
  for (const p of list) {
    const k = kSentences.find((x) => x.id === p.id);
    if (!k || !isL10n(p.text)) continue;
    for (const l of ['zh-TW', 'en']) if (!k.text[l].includes(p.text[l])) k.text[l].push(p.text[l]);
  }
} catch {
  /* ui.ts failed to load: reported above as a problem */
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
    const seenRule = new Set();
    for (const r of briefRules) {
      if (r.locale !== locale || seenRule.has(r.id)) continue;
      if (r.scope === 'headline' && !HEADLINE_ID.test(s.id)) continue;
      const m = r.re.exec(text);
      if (!m) continue;
      seenRule.add(r.id);
      flags.push({ id: s.id, file: s.file, locale, rule: r.id, kind: `brief check ${r.check === 46 ? '4.6' : r.check}`, match: m[0], text, ruleText: r.rule, instead: r.instead });
    }
    const { stray } = brief.kScan(text, locale, kSentences);
    if (stray.length)
      flags.push({
        id: s.id,
        file: s.file,
        locale,
        rule: 'brief-k-sentence-only',
        kind: 'brief check 2',
        match: stray.map((x) => x.trigger).join(' / '),
        text,
        ruleText: '"Not yet measured / not yet known" wording appears only as one of the K sentences of brief 7.1 (K1–K6), word for word, on the pages listed there. Everywhere else, say the answer we have now.',
        instead: 'Use the K sentence that fits (brief 7.1), or state the estimate or measurement that fills the place.',
      });
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
const moduleOf = (id) => id.split('.')[0];
const inScope = (id) => !only || only.has(moduleOf(id));
const stale = allow.entries.filter((e, i) => !used.has(i) && inScope(e.id));
const reported = failures.filter((f) => inScope(f.id));

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
  writeSync(1, JSON.stringify({ strings: strings.length, failures: reported, stale, inline: only ? [] : inline, problems }, null, 2) + '\n');
  process.exit(reported.length || stale.length || (!only && inline.length) || problems.length ? 1 : 0);
}

const cut = (s, n = 110) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
let bad = 0;
if (problems.length) {
  bad += problems.length;
  console.error(`\n✖ check-copy: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
}
if (reported.length) {
  bad += reported.length;
  console.error(`\n✖ check-copy: ${reported.length} unreviewed match(es)${only ? ` in ${[...only].join(', ')}` : ''}. Read the rule; fix the copy, or allow it with a reason in ${ALLOW}.\n`);
  for (const f of reported) {
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
if (inline.length && !only) {
  bad += inline.length;
  console.error(`\n✖ check-copy: copy written inline in a page. Move it to src/i18n/pages/<page>.ts so the guard can read it:\n`);
  for (const f of inline) console.error(`  ${f.file}: ${f.count} line(s) with Chinese text, first at line ${f.first[0]}: ${cut(f.first[1].trim(), 70)}`);
}
if (args.has('--vocab')) {
  const advice = [];
  for (const s of strings) {
    if (!inScope(s.id)) continue;
    for (const [re, use] of brief.vocabAdvice) {
      const m = re.exec(s.text['zh-TW']);
      if (m) advice.push(`  ${s.id}  「${m[0]}」 → ${use}`);
    }
  }
  console.log(`\nℹ vocabulary (brief 6.6; advice, not a failure): ${advice.length} string(s)\n${advice.join('\n')}`);
}
if (bad) {
  if (reported.length) {
    const byRule = {};
    for (const f of reported) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
    console.error(`  by rule: ${Object.entries(byRule).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} ${n}`).join(' · ')}`);
  }
  console.error('');
  process.exit(1);
}
console.log(`✔ check-copy: ${strings.length} strings in ${modules.length} modules; ${flags.length} match(es), all reviewed (${allow.entries.length} allow-list entries).`);
