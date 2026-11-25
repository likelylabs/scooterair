#!/usr/bin/env node
// Validates the cited data layer in src/data. Run via `npm run check` (before `astro check`).
//
// Imports the TypeScript data files directly using Node's built-in type stripping
// (Node >= 22.18), so it checks exactly what the site will import.
//
// Fails (exit 1) on:
//  - a fact / series / claim rule citing a source id that does not exist
//  - a source that nothing cites, or that has neither url nor doi
//  - duplicate ids (facts across topic groups; series; rules)
//  - any localized field (an object with exactly 'zh-TW' and 'en') with a missing or empty language
//  - confidence other than 'verified' | 'secondary'; evidence outside the allowed set
//  - 'derived' facts without derivedFrom (or derivedFrom pointing at unknown facts)
//  - requiresCaveat without a caveat; secondary facts without a caveat
//  - unknown units, flags, related-fact ids or series point keys outside the categories
//  - malformed dates / DOIs / URLs, accessed date not ISO
//  - Traditional Chinese copy with ASCII punctuation, simplified/mainland terms or 台 instead of 臺
//  - English copy with full-width punctuation
//  - invalid regex patterns in the claims policy

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

process.removeAllListeners('warning'); // silence the type-stripping ExperimentalWarning on older 22.x

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(resolve(root, p)).href);

let types, sourcesMod, factsMod, seriesMod, policyMod;
try {
  types = await load('src/data/types.ts');
  sourcesMod = await load('src/data/sources.ts');
  factsMod = await load('src/data/facts.ts');
  seriesMod = await load('src/data/series.ts');
  policyMod = await load('src/data/claims-policy.ts');
} catch (err) {
  console.error('\n✖ check-data: could not load src/data (syntax error, duplicate id or bad import?)\n');
  console.error(err);
  process.exit(1);
}

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const { sources, sourceKinds, readLevels } = sourcesMod;
const { factGroups, facts, topicLabels } = factsMod;
const { series, pointFlags } = seriesMod;
const { claimRules } = policyMod;
const CONFIDENCES = new Set(types.confidences);
const EVIDENCE = new Set(types.evidenceTypes);
const UNITS = new Set(Object.keys(types.units));
const FLAGS = new Set(pointFlags);
const TOPICS = new Set(Object.keys(factGroups));
const sourceIds = new Set(Object.keys(sources));
const factIds = new Set(Object.keys(facts));
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const cited = new Map([...sourceIds].map((id) => [id, 0]));

// ---------------------------------------------------------------------------
// Localized-field checks
// ---------------------------------------------------------------------------

const isL10n = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 2 && 'zh-TW' in v && 'en' in v;

// ASCII punctuation in Chinese copy (allowing digits like 1,466 / 0.5 / 07:00 / p<0.0001).
const ZH_BAD_PUNCT = [
  [/(?<!\d),|,(?!\d)/, 'ASCII comma (use ，or 、)'],
  [/[()]/, 'ASCII parentheses (use （）)'],
  [/;/, 'ASCII semicolon (use ；)'],
  [/(?<!\d):|:(?!\d)/, 'ASCII colon (use ：)'],
  [/[!?]/, 'ASCII ! or ? (use ！？)'],
  [/\.(\s|$)/, 'ASCII full stop (use 。)'],
  [/["']/, 'ASCII quotes (use 「」)'],
];
// Simplified characters / mainland usage that should not appear in Taiwanese copy.
const ZH_BAD_TERMS = [
  ['台灣', '臺灣'], ['台北', '臺北'], ['台中', '臺中'], ['台南', '臺南'], ['台東', '臺東'],
  ['摩托車', '機車'], ['顆粒物', '懸浮微粒'], ['尾氣', '廢氣'], ['質量', '品質'], ['信息', '資訊'],
  ['數據庫', '資料庫'], ['人行橫道', '行人穿越道'], ['碳氫化合物類', '碳氫化合物'], ['网', '網'],
  ['车', '車'], ['污染物质', '污染物質'], ['环', '環'], ['气', '氣'], ['颗', '顆'], ['细', '細'],
  ['电', '電'], ['统计', '統計'], ['标准', '標準'], ['导致', '導致'], ['关', '關'],
];
const EN_BAD_PUNCT = /[，。（）「」；：！？、]/;

const checkedL10n = new WeakSet();
function checkL10n(where, value, { optional = false, properNoun = false } = {}) {
  if (value && typeof value === 'object') checkedL10n.add(value);
  if (value === undefined) {
    if (!optional) err(where, 'missing localized field');
    return;
  }
  if (!isL10n(value)) {
    err(where, `expected { 'zh-TW', en } but got ${JSON.stringify(value)?.slice(0, 80)}`);
    return;
  }
  const zh = value['zh-TW'];
  const en = value.en;
  if (typeof zh !== 'string' || zh.trim() === '') err(where, "empty or missing 'zh-TW'");
  if (typeof en !== 'string' || en.trim() === '') err(where, "empty or missing 'en'");
  if (typeof zh === 'string' && zh) {
    if (!/[㐀-鿿]/.test(zh) && /[a-z]{3,}/.test(zh)) warn(where, `zh-TW text looks untranslated: "${zh}"`);
    for (const [re, label] of ZH_BAD_PUNCT) if (re.test(zh)) err(where, `zh-TW: ${label} in "${zh.slice(0, 60)}…"`);
    for (const [bad, good] of ZH_BAD_TERMS) {
      if (properNoun && bad.startsWith('台')) continue; // organisation names keep their own spelling (e.g. 台北時報)
      if (zh.includes(bad)) err(where, `zh-TW: "${bad}" should be "${good}"`);
    }
  }
  if (typeof en === 'string' && en && EN_BAD_PUNCT.test(en)) err(where, `en: full-width punctuation in "${en.slice(0, 60)}…"`);
}

/** Walk any object and check every nested L10n value. */
function walkL10n(where, obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  if (isL10n(obj)) return checkedL10n.has(obj) ? undefined : checkL10n(`${where}${path}`, obj);
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'patterns') continue; // regex lists, not prose
    if (v && typeof v === 'object') walkL10n(where, v, `${path}.${k}`);
  }
}

function citeSources(where, list, { required = true } = {}) {
  if (!Array.isArray(list) || list.length === 0) {
    if (required) err(where, 'no sources');
    return;
  }
  const seen = new Set();
  for (const id of list) {
    if (seen.has(id)) err(where, `source "${id}" listed twice`);
    seen.add(id);
    if (!sourceIds.has(id)) err(where, `unknown source "${id}"`);
    else cited.set(id, cited.get(id) + 1);
  }
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

for (const [id, s] of Object.entries(sources)) {
  const w = `source ${id}`;
  if (!ID_RE.test(id)) err(w, 'id must be kebab-case');
  if (!sourceKinds.includes(s.kind)) err(w, `unknown kind "${s.kind}"`);
  if (!readLevels.includes(s.readLevel)) err(w, `unknown readLevel "${s.readLevel}"`);
  if (!s.url && !s.doi) err(w, 'needs a url or a doi');
  if (s.url && !/^https:\/\/\S+$/.test(s.url)) err(w, `url must be https and contain no spaces: ${s.url}`);
  if (s.doi && !/^10\.\d{4,9}\/\S+$/.test(s.doi)) err(w, `malformed doi "${s.doi}"`);
  if (!s.title || !s.title.trim()) err(w, 'missing title');
  if (!s.authors?.length && !s.org) err(w, 'needs authors or org');
  if (s.org) checkL10n(`${w}.org`, s.org, { properNoun: true });
  if (s.year !== undefined && !(Number.isInteger(s.year) && s.year > 1900 && s.year <= 2026)) err(w, `implausible year ${s.year}`);
  if (s.date && !ISO_DATE_RE.test(s.date)) err(w, `date must be ISO (yyyy[-mm[-dd]]): ${s.date}`);
  if (s.date && s.year && !s.date.startsWith(String(s.year))) err(w, `date ${s.date} does not match year ${s.year}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)) err(w, `accessed must be yyyy-mm-dd: ${s.accessed}`);
  if (!['zh-TW', 'en'].includes(s.language)) err(w, `language must be zh-TW or en`);
  if (s.language === 'zh-TW' && !s.titleTranslated) warn(w, 'Chinese title without an English translation');
}

// ---------------------------------------------------------------------------
// Facts
// ---------------------------------------------------------------------------

const seenFact = new Map();
for (const [topic, group] of Object.entries(factGroups)) {
  if (!topicLabels[topic]) err(`topic ${topic}`, 'missing entry in topicLabels');
  else checkL10n(`topicLabels.${topic}`, topicLabels[topic]);
  for (const [id, f] of Object.entries(group)) {
    const w = `fact ${id}`;
    if (seenFact.has(id)) err(w, `duplicate id (also in topic "${seenFact.get(id)}")`);
    seenFact.set(id, topic);
    if (!ID_RE.test(id)) err(w, 'id must be kebab-case');
    if (!CONFIDENCES.has(f.confidence)) err(w, `confidence must be 'verified' or 'secondary', got "${f.confidence}"`);
    if (!EVIDENCE.has(f.evidence)) err(w, `unknown evidence "${f.evidence}"`);
    for (const key of ['display', 'statement', 'period', 'place']) checkL10n(`${w}.${key}`, f[key]);
    checkL10n(`${w}.caveat`, f.caveat, { optional: true });
    citeSources(w, f.sources);
    if (!f.research) err(w, 'missing research reference');
    if (f.requiresCaveat && !f.caveat) err(w, 'requiresCaveat is set but there is no caveat');
    if (f.confidence === 'secondary' && !f.caveat) err(w, 'secondary facts must say in a caveat what they rest on');
    if (f.evidence === 'derived') {
      const hasDerivedDatum = Object.values(f.data ?? {}).some((d) => d.derived);
      if (!f.derivedFrom?.length && !hasDerivedDatum) err(w, "evidence 'derived' needs derivedFrom or a datum marked derived");
    }
    for (const dep of f.derivedFrom ?? []) {
      if (!factIds.has(dep)) err(w, `derivedFrom references unknown fact "${dep}"`);
      if (dep === id) err(w, 'derivedFrom references itself');
    }
    if (!f.data || typeof f.data !== 'object') err(w, 'missing data object');
    for (const [k, d] of Object.entries(f.data ?? {})) {
      const dw = `${w}.data.${k}`;
      if (typeof d.value !== 'number' || !Number.isFinite(d.value)) err(dw, 'value must be a finite number');
      if (!UNITS.has(d.unit)) err(dw, `unknown unit "${d.unit}"`);
      if (d.low !== undefined && d.high !== undefined && d.low > d.high) err(dw, `low ${d.low} > high ${d.high}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

for (const [id, s] of Object.entries(series)) {
  const w = `series ${id}`;
  if (!ID_RE.test(id)) err(w, 'id must be kebab-case');
  if (!TOPICS.has(s.topic)) err(w, `unknown topic "${s.topic}"`);
  if (!CONFIDENCES.has(s.confidence)) err(w, `confidence must be 'verified' or 'secondary', got "${s.confidence}"`);
  if (!EVIDENCE.has(s.evidence)) err(w, `unknown evidence "${s.evidence}"`);
  if (!UNITS.has(s.unit)) err(w, `unknown unit "${s.unit}"`);
  for (const key of ['title', 'description', 'period', 'place']) checkL10n(`${w}.${key}`, s[key]);
  for (const key of ['caveat', 'xLabel', 'yLabel']) checkL10n(`${w}.${key}`, s[key], { optional: true });
  citeSources(w, s.sources);
  if (!s.research) err(w, 'missing research reference');
  if (s.requiresCaveat && !s.caveat) err(w, 'requiresCaveat is set but there is no caveat');
  if (s.confidence === 'secondary' && !s.caveat) err(w, 'secondary series must say in a caveat what they rest on');
  for (const rf of s.relatedFacts ?? []) if (!factIds.has(rf)) err(w, `relatedFacts references unknown fact "${rf}"`);
  const catKeys = s.categories ? new Set(s.categories.map((c) => c.key)) : null;
  if (s.categories) {
    if (catKeys.size !== s.categories.length) err(w, 'duplicate category keys');
    s.categories.forEach((c, i) => {
      checkL10n(`${w}.categories[${i}].label`, c.label);
      checkL10n(`${w}.categories[${i}].note`, c.note, { optional: true });
    });
  }
  if (!s.datasets?.length) err(w, 'no datasets');
  const dsKeys = new Set();
  let anySecondary = false;
  for (const d of s.datasets ?? []) {
    const dw = `${w}.datasets.${d.key}`;
    if (dsKeys.has(d.key)) err(dw, 'duplicate dataset key');
    dsKeys.add(d.key);
    checkL10n(`${dw}.label`, d.label);
    checkL10n(`${dw}.note`, d.note, { optional: true });
    if (d.unit && !UNITS.has(d.unit)) err(dw, `unknown unit "${d.unit}"`);
    if (d.confidence && !CONFIDENCES.has(d.confidence)) err(dw, `bad confidence "${d.confidence}"`);
    if (d.evidence && !EVIDENCE.has(d.evidence)) err(dw, `bad evidence "${d.evidence}"`);
    if (d.confidence === 'secondary') anySecondary = true;
    const xs = new Set();
    for (const p of d.points ?? []) {
      const pw = `${dw}[x=${p.x}]`;
      if (xs.has(p.x)) err(pw, 'duplicate x in dataset');
      xs.add(p.x);
      if (catKeys && !catKeys.has(String(p.x))) err(pw, `x "${p.x}" is not one of the series categories`);
      if (p.y !== null && (typeof p.y !== 'number' || !Number.isFinite(p.y))) err(pw, 'y must be a finite number or null');
      if (p.y === null && p.low === undefined && !p.note) err(pw, 'null y needs a note (why there is no value) or a low/high range');
      if (p.low !== undefined && p.high !== undefined && p.low > p.high) err(pw, `low ${p.low} > high ${p.high}`);
      for (const fl of p.flags ?? []) if (!FLAGS.has(fl)) err(pw, `unknown flag "${fl}"`);
      if (p.confidence && !CONFIDENCES.has(p.confidence)) err(pw, `bad confidence "${p.confidence}"`);
      if (p.confidence === 'secondary') anySecondary = true;
      checkL10n(`${pw}.note`, p.note, { optional: true });
      if (p.sources) citeSources(pw, p.sources);
    }
  }
  if (anySecondary && s.confidence === 'verified' && !s.caveat) err(w, 'contains secondary points but has no caveat saying so');
}

// ---------------------------------------------------------------------------
// Claims policy
// ---------------------------------------------------------------------------

for (const [id, r] of Object.entries(claimRules)) {
  const w = `claim rule ${id}`;
  if (!ID_RE.test(id)) err(w, 'id must be kebab-case');
  if (!['do-not-claim', 'qualifier', 'correction'].includes(r.kind)) err(w, `unknown kind "${r.kind}"`);
  if (!TOPICS.has(r.topic)) err(w, `unknown topic "${r.topic}"`);
  checkL10n(`${w}.rule`, r.rule);
  checkL10n(`${w}.why`, r.why);
  checkL10n(`${w}.instead`, r.instead, { optional: true });
  if (r.sources) citeSources(w, r.sources, { required: false });
  for (const fid of r.facts ?? []) if (!factIds.has(fid)) err(w, `references unknown fact "${fid}"`);
  for (const [loc, list] of Object.entries(r.patterns ?? {})) {
    for (const src of list) {
      try {
        new RegExp(src, 'i');
      } catch (e) {
        err(w, `invalid ${loc} pattern /${src}/: ${e.message}`);
      }
    }
  }
  if (!r.research) err(w, 'missing research reference');
}

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

for (const [id, n] of cited) if (n === 0) err(`source ${id}`, 'is not cited by any fact, series or claim rule (remove it or cite it)');

// Generic sweep for any localized field the targeted checks above did not reach.
for (const [id, f] of Object.entries(facts)) walkL10n(`fact ${id}`, f);
for (const [id, s] of Object.entries(series)) walkL10n(`series ${id}`, s);
for (const [id, r] of Object.entries(claimRules)) walkL10n(`claim rule ${id}`, r);

// Dedupe messages produced by both the targeted checks and the sweep.
const uniq = (a) => [...new Set(a)];
const errs = uniq(errors);
const warns = uniq(warnings);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const count = (list, key) => list.reduce((m, x) => ((m[x[key]] = (m[x[key]] ?? 0) + 1), m), {});
const factArr = Object.values(facts);
const seriesArr = Object.values(series);
const summary = [
  `sources ${sourceIds.size}`,
  `facts ${factArr.length} ${JSON.stringify(count(factArr, 'confidence'))} ${JSON.stringify(count(factArr, 'evidence'))}`,
  `series ${seriesArr.length} ${JSON.stringify(count(seriesArr, 'confidence'))}`,
  `claim rules ${Object.keys(claimRules).length}`,
].join('\n  ');

if (warns.length) {
  console.warn(`\n⚠ check-data: ${warns.length} warning(s)`);
  for (const w of warns) console.warn(`  - ${w}`);
}
if (errs.length) {
  console.error(`\n✖ check-data: ${errs.length} problem(s) in src/data — fix these before building:\n`);
  for (const e of errs) console.error(`  ✖ ${e}`);
  console.error(`\n  ${summary}\n`);
  process.exit(1);
}
console.log(`✔ check-data: src/data is consistent\n  ${summary}`);
