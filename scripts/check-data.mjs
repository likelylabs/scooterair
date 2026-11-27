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
//  - Traditional Chinese copy with ASCII punctuation or simplified/mainland terms
//  - reader-facing place names written 臺 instead of 台 (台灣, 台北 ... per the editorial
//    blueprint); organisation names keep their own spelling, and the economics data (owned
//    elsewhere) gets warnings, not errors, until it is converted
//  - English copy with full-width punctuation
//  - invalid regex patterns in the claims policy; a blueprint copy rule (R1-R16) with no claim rule
//  - a fact or series without `chainLink` (unless its topic has a default), or a bad chain link
//  - a `research` reference 'papers/<file>#<finding>' or 'redlight/<file>#<finding>' that does not
//    exist or whose verdict is not CONFIRMED, CORRECTED or ADDED
//  - the estimate (src/data/estimate.ts): any slot that differs from research/estimate/results.json
//    (published 1 s.f. values, 1 d.p. totals, the emission-per-red arithmetic, the cross-check,
//    the inputs the recipe prints) or from the registry fact that backs a measured value
//  - answers (src/data/answers.ts): a malformed former-gap id, unknown fact, slot or source; missing chip without a
//    K sentence; one answer per former gap
//  - 'masks/VERIFIED#<id>' research references that are not in research/masks/VERIFIED.json
//  - the simulation (src/data/simulation-data.ts, simulation.ts): any difference from what
//    scripts/build-simulation-data.mjs reads out of research/simulation now; a 'simulation/statements#may-n'
//    reference to a statement that does not exist; a simulation fact or slot whose number is not
//    in its statement's own words (statements.json); a 15-minute slot at or above the WHO value

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

process.removeAllListeners('warning'); // silence the type-stripping ExperimentalWarning on older 22.x

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(resolve(root, p)).href);

let types, sourcesMod, factsMod, seriesMod, policyMod, estimateMod, answersMod;
try {
  types = await load('src/data/types.ts');
  sourcesMod = await load('src/data/sources.ts');
  factsMod = await load('src/data/facts.ts');
  seriesMod = await load('src/data/series.ts');
  policyMod = await load('src/data/claims-policy.ts');
  estimateMod = await load('src/data/estimate.ts');
  answersMod = await load('src/data/answers.ts');
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
const { factGroups, facts, topicLabels, topicDefaultChainLink } = factsMod;
const { series, pointFlags, seriesTopicDefaultChainLink } = seriesMod;
const CHAIN_LINKS = new Set(types.chainLinks);
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
const ZH_TAI_TERMS = [['臺灣', '台灣'], ['臺北', '台北'], ['臺中', '台中'], ['臺南', '台南'], ['臺東', '台東']];
const ZH_BAD_TERMS = [
  ['摩托車', '機車'], ['顆粒物', '懸浮微粒'], ['尾氣', '廢氣'], ['質量', '品質'], ['信息', '資訊'],
  ['數據庫', '資料庫'], ['人行橫道', '行人穿越道'], ['碳氫化合物類', '碳氫化合物'], ['网', '網'],
  ['车', '車'], ['污染物质', '污染物質'], ['环', '環'], ['气', '氣'], ['颗', '顆'], ['细', '細'],
  ['电', '電'], ['统计', '統計'], ['标准', '標準'], ['导致', '導致'], ['关', '關'],
];
const EN_BAD_PUNCT = /[，。（）「」；：！？、]/;

const checkedL10n = new WeakSet();
let TAI_WARN_SCOPE = false; // set while checking the economics dataset (src/data/econ), owned elsewhere
function checkL10n(where, value, { optional = false, properNoun = false, taiWarnOnly = false } = {}) {
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
    for (const [bad, good] of ZH_BAD_TERMS) if (zh.includes(bad)) err(where, `zh-TW: "${bad}" should be "${good}"`);
    // Reader-facing copy writes 台; organisation names keep their own spelling (e.g. 臺北市政府).
    if (!properNoun) {
      for (const [bad, good] of ZH_TAI_TERMS) {
        if (!zh.includes(bad)) continue;
        (taiWarnOnly || TAI_WARN_SCOPE ? warn : err)(where, `zh-TW: "${bad}" should be "${good}" in reader-facing copy`);
      }
    }
  }
  if (typeof en === 'string' && en && EN_BAD_PUNCT.test(en)) err(where, `en: full-width punctuation in "${en.slice(0, 60)}…"`);
}

/** Walk any object and check every nested L10n value. */
function walkL10n(where, obj, path = '', opts = {}) {
  if (!obj || typeof obj !== 'object') return;
  if (isL10n(obj)) return checkedL10n.has(obj) ? undefined : checkL10n(`${where}${path}`, obj, opts);
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'patterns') continue; // regex lists, not prose
    if (v && typeof v === 'object') walkL10n(where, v, `${path}.${k}`, opts);
  }
}

// Research references into the checked JSON files: 'papers/<file>#<id>' or 'redlight/<file>#<id>'.
// Only CONFIRMED, CORRECTED or ADDED findings may back a registry entry.
const FINDING_VERDICTS = new Set(['CONFIRMED', 'CORRECTED', 'ADDED']);
const { readFileSync: readFs, existsSync: existsFs } = await import('node:fs');
const jsonCache = new Map();
let masksVerified;
let simStatements;
let smellStatements;
function checkResearchRefs(where, research) {
  if (typeof research !== 'string') return;
  for (const m of research.matchAll(/\bmasks\/VERIFIED#([a-z0-9-]+)/g)) {
    masksVerified ??= JSON.parse(readFs(resolve(root, 'research/masks/VERIFIED.json'), 'utf8'));
    if (!masksVerified.facts.some((f) => f.id === m[1])) err(where, `research/masks/VERIFIED.json has no fact "${m[1]}"`);
  }
  // 'simulation/smell-chemicals/statements-smell#<id>': a `may` id of the smell step's statements
  for (const m of research.matchAll(/\bsimulation\/smell-chemicals\/statements-smell#([a-z-]+)/g)) {
    smellStatements ??= JSON.parse(readFs(resolve(root, 'research/simulation/smell-chemicals/statements-smell.json'), 'utf8'));
    if (!smellStatements.may.some((x) => x.id === m[1])) err(where, `research/simulation/smell-chemicals/statements-smell.json has no allowed statement "${m[1]}"`);
  }
  // 'simulation/statements#may-<n>': statement n (from 1) of research/simulation/statements.json `may`
  for (const m of research.matchAll(/\bsimulation\/statements#may-(\d+)\b/g)) {
    simStatements ??= JSON.parse(readFs(resolve(root, 'research/simulation/statements.json'), 'utf8'));
    const n = Number(m[1]);
    if (!(n >= 1 && n <= simStatements.may.length)) err(where, `research/simulation/statements.json has no statement may-${n} (it has ${simStatements.may.length})`);
  }
  for (const m of research.matchAll(/\b(papers|redlight)\/([a-z0-9-]+)#([A-Za-z0-9._-]+)/g)) {
    const [, dir, file, id] = m;
    const key = `${dir}/${file}`;
    if (!jsonCache.has(key)) {
      const p = resolve(root, 'research', dir, `${file}.json`);
      jsonCache.set(key, existsFs(p) ? JSON.parse(readFs(p, 'utf8')) : null);
    }
    const doc = jsonCache.get(key);
    if (!doc) {
      err(where, `research file research/${key}.json does not exist`);
      continue;
    }
    const f = (doc.findings ?? []).find((x) => x.id === id);
    if (!f) err(where, `research finding "${key}#${id}" not found`);
    else if (!FINDING_VERDICTS.has(f.verdict)) err(where, `research finding "${key}#${id}" has verdict ${f.verdict}; only CONFIRMED, CORRECTED or ADDED may back a registry entry`);
  }
}

function checkChainLink(where, obj, topicDefaults) {
  const hasDefault = topicDefaults && Object.prototype.hasOwnProperty.call(topicDefaults, obj.topic);
  if (obj.chainLink === undefined) {
    if (!hasDefault) err(where, 'missing chainLink (1-7, or null for context outside the chain)');
  } else if (obj.chainLink !== null && !CHAIN_LINKS.has(obj.chainLink)) err(where, `chainLink must be 1-7 or null, got ${obj.chainLink}`);
  for (const l of obj.alsoLinks ?? []) {
    if (!CHAIN_LINKS.has(l)) err(where, `alsoLinks contains invalid link ${l}`);
    if (l === obj.chainLink) err(where, `alsoLinks repeats the primary chainLink ${l}`);
  }
}

for (const [l, lab] of Object.entries(types.chainLinkLabels)) {
  checkL10n(`chainLinkLabels.${l}.short`, lab.short);
  checkL10n(`chainLinkLabels.${l}.question`, lab.question);
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
    const taiWarnOnly = topic === 'economics';
    for (const key of ['display', 'statement', 'period', 'place']) checkL10n(`${w}.${key}`, f[key], { taiWarnOnly });
    checkL10n(`${w}.caveat`, f.caveat, { optional: true, taiWarnOnly });
    citeSources(w, f.sources);
    if (!f.research) err(w, 'missing research reference');
    checkResearchRefs(w, f.research);
    checkChainLink(w, { ...f, topic }, topicDefaultChainLink);
    if (f.requiresCaveat && !f.caveat) err(w, 'requiresCaveat is set but there is no caveat');
    if (f.confidence === 'secondary' && !f.caveat) err(w, 'secondary facts must say in a caveat what they rest on');
    if (f.evidence === 'derived') {
      const hasDerivedDatum = Object.values(f.data ?? {}).some((d) => d.derived);
      if (!f.derivedFrom?.length && !hasDerivedDatum) err(w, "evidence 'derived' needs derivedFrom or a datum marked derived");
    }
    for (const dep of f.derivedFrom ?? []) {
      if (!factIds.has(dep)) err(w, `derivedFrom references unknown fact "${dep}"`);
      if (dep === id) err(w, 'derivedFrom references itself');
      // types.ts: a derived figure is only as well checked as its weakest input.
      if (f.confidence === 'verified' && facts[dep]?.confidence === 'secondary') {
        err(w, `confidence 'verified' but input "${dep}" is 'secondary'; a derived fact with any secondary input is 'secondary'`);
      }
    }
    // Pages reuse statements on their own (study panels, share links, /about/), so a statement
    // must name its study instead of pointing back at "the same study" row above it.
    if (/^(?:在|依)?同一/.test(f.statement?.['zh-TW'] ?? '') || /^(?:In |When |Comparing [^,]* in )?the same (?:study|model|tunnel|simulation|cohort|Taipei study|modelled)/i.test(f.statement?.en ?? '')) {
      warn(w, 'statement opens with "the same study/model…" (同一…); name the study so it stands alone where it is reused');
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
  const sTai = { taiWarnOnly: s.topic === 'economics' };
  for (const key of ['title', 'description', 'period', 'place']) checkL10n(`${w}.${key}`, s[key], sTai);
  for (const key of ['caveat', 'xLabel', 'yLabel']) checkL10n(`${w}.${key}`, s[key], { optional: true, ...sTai });
  citeSources(w, s.sources);
  if (!s.research) err(w, 'missing research reference');
  checkResearchRefs(w, s.research);
  checkChainLink(w, s, seriesTopicDefaultChainLink);
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
  checkResearchRefs(w, r.research);
  if (r.blueprintRule !== undefined && !/^R([1-9]|1[0-6])$/.test(r.blueprintRule)) err(w, `blueprintRule must be R1-R16, got ${r.blueprintRule}`);
}
for (let i = 1; i <= 16; i++) {
  if (!Object.values(claimRules).some((r) => r.blueprintRule === `R${i}`)) err(`claims policy`, `blueprint copy rule R${i} has no claim rule (set blueprintRule on one)`);
}

const seriesIds = new Set(Object.keys(series));

// ---------------------------------------------------------------------------
// Economics dataset (src/data/econ): the calculator's inputs
// ---------------------------------------------------------------------------

let econ;
try {
  econ = (await load('src/data/econ/index.ts')).econData;
} catch (e) {
  err('econ', `could not load src/data/econ: ${e.message}`);
}

// Research findings that may feed a calculation: CONFIRMED, CORRECTED or ADDED. Round-two county
// findings use the verdict REFUTED to mean "refutes a first-round 'no programme found'" while
// reporting a VERIFIED official amount; those, and only those, are allow-listed here.
const USABLE_VERDICTS = new Set(['CONFIRMED', 'CORRECTED', 'ADDED']);
const REFUTATION_CORRECTIONS = new Set([
  'counties-north-central-r2#changhua-new-purchase-v3',
  'counties-north-central-r2#nantou-new-purchase-v3',
  'counties-north-central-r2#hsinchucounty-new-heavy-v3',
  'counties-north-central-r2#hsinchucounty-new-light-v3',
  'counties-north-central-r2#hsinchucounty-swap-topup-v3',
  'counties-north-central-r2#hsinchucounty-scrap-only-v3',
  'counties-north-central-r2#keelung-swap-2stroke-heavy-v3',
  'counties-north-central-r2#keelung-swap-2stroke-light-v3',
  'counties-north-central-r2#keelung-swap-4stroke-heavy-v3',
  'counties-north-central-r2#keelung-swap-4stroke-light-v3',
  'counties-north-central-r2#keelung-new-heavy-v3',
  'counties-north-central-r2#keelung-new-light-v3',
]);
const { readFileSync, existsSync } = await import('node:fs');
const researchCache = new Map();
function finding(ref) {
  const [file, id] = ref.split('#');
  if (!researchCache.has(file)) {
    const p = resolve(root, 'research/econ', `${file}.json`);
    researchCache.set(file, existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);
  }
  const doc = researchCache.get(file);
  if (!doc) return { missingFile: true };
  if (!id) return { fileOnly: true };
  return { f: doc.findings.find((x) => x.id === id) };
}

/** Validate one Provenance-like object. `feeds` = it can change a calculated number. */
function checkProvenance(where, o, { feeds = true } = {}) {
  citeSources(where, o.sources);
  if (!CONFIDENCES.has(o.confidence)) err(where, `confidence must be 'verified' or 'secondary', got "${o.confidence}"`);
  if (!Array.isArray(o.research) || o.research.length === 0) err(where, 'no research references');
  for (const ref of o.research ?? []) {
    const r = finding(ref);
    if (r.missingFile) err(where, `research file for "${ref}" does not exist`);
    else if (r.fileOnly) {
      if (feeds) err(where, `research reference "${ref}" names a file, not a finding`);
    } else if (!r.f) err(where, `research finding "${ref}" not found`);
    else if (feeds && !USABLE_VERDICTS.has(r.f.verdict) && !REFUTATION_CORRECTIONS.has(ref)) {
      err(where, `research finding "${ref}" has verdict ${r.f.verdict}; only CONFIRMED, CORRECTED or ADDED findings may feed a calculation`);
    }
  }
  if (o.note !== undefined) checkL10n(`${where}.note`, o.note);
}

const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
const nonNeg = (where, n) => {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) err(where, `amount must be a non-negative number, got ${n}`);
};

if (econ) {
  TAI_WARN_SCOPE = true;
  const jIds = new Set(Object.keys(econ.jurisdictions));
  const groupIds = new Set(Object.keys(econ.groups));
  const planIds = new Set(econ.plans.map((p) => p.id));
  const evIds = new Set(econ.evModels.map((m) => m.id));
  const seenIds = new Set();
  const uniqueId = (w, id) => {
    if (!ID_RE.test(id)) err(w, 'id must be kebab-case');
    if (seenIds.has(id)) err(w, 'duplicate id');
    seenIds.add(id);
  };
  if (!isDate(econ.meta.checkedOn) || !isDate(econ.meta.programmeYearEnd)) err('econ meta', 'dates must be YYYY-MM-DD');
  checkL10n('econ meta.nextYear', econ.meta.nextYear);

  for (const [id, j] of Object.entries(econ.jurisdictions)) {
    const w = `econ jurisdiction ${id}`;
    if (j.id !== id) err(w, 'id mismatch');
    if (!['verified', 'partly-verified', 'not-verified'].includes(j.status)) err(w, `bad status "${j.status}"`);
    checkL10n(`${w}.name`, j.name);
    checkL10n(`${w}.statusNote`, j.statusNote);
    if (!j.officialLinks?.length) err(w, 'needs at least one official link a reader can check');
    for (const l of j.officialLinks ?? []) {
      checkL10n(`${w}.link`, l.label);
      if (!/^https?:\/\/\S+$/.test(l.url)) err(w, `bad link ${l.url}`);
    }
    if (!isDate(j.checkedOn)) err(w, 'checkedOn must be YYYY-MM-DD');
    const counted = econ.programmes.filter((p) => p.jurisdiction === id && p.calculator === true);
    if (j.status === 'not-verified' && counted.length) err(w, `is not verified but has ${counted.length} programme(s) in the calculator`);
  }
  for (const [id, g] of Object.entries(econ.groups)) {
    checkL10n(`econ group ${id}.label`, g.label);
    if ((g.conservative || g.advisory) && !g.ambiguity) err(`econ group ${id}`, 'conservative or advisory groups must explain the ambiguity');
    if (g.ambiguity) checkL10n(`econ group ${id}.ambiguity`, g.ambiguity);
    if (g.sources) citeSources(`econ group ${id}`, g.sources);
    for (const jj of g.jurisdictions ?? []) if (!jIds.has(jj)) err(`econ group ${id}`, `unknown jurisdiction "${jj}"`);
  }

  for (const p of econ.programmes) {
    const w = `econ programme ${p.id}`;
    uniqueId(w, p.id);
    const feeds = p.calculator === true;
    checkProvenance(w, p, { feeds: true });
    if (p.jurisdiction !== 'central' && !jIds.has(p.jurisdiction)) err(w, `unknown jurisdiction "${p.jurisdiction}"`);
    for (const key of ['name', 'conditionText', 'status2027']) checkL10n(`${w}.${key}`, p[key]);
    // The payer is an agency's official name: it keeps the form its own documents use (臺北市政府…).
    checkL10n(`${w}.payerName`, p.payerName, { properNoun: true });
    if (p.applicationNote) checkL10n(`${w}.applicationNote`, p.applicationNote);
    if (!isDate(p.validFrom)) err(w, `validFrom must be YYYY-MM-DD: ${p.validFrom}`);
    if (!isDate(p.validTo)) err(w, `every programme needs a valid-to date (YYYY-MM-DD): ${p.validTo}`);
    if (isDate(p.validFrom) && isDate(p.validTo) && p.validFrom > p.validTo) err(w, 'validFrom after validTo');
    for (const k of ['applicationDeadline', 'confirmedThrough']) if (p[k] !== undefined && !isDate(p[k])) err(w, `${k} must be YYYY-MM-DD`);
    if (!isDate(p.quota?.asOf)) err(w, 'quota.asOf must be YYYY-MM-DD');
    checkL10n(`${w}.quota.text`, p.quota?.text);
    if (p.quota?.sources) citeSources(`${w}.quota`, p.quota.sources);
    const a = p.amount;
    if (a.kind === 'fixed') nonNeg(`${w}.amount`, a.value);
    else if (a.kind === 'per-battery') (nonNeg(`${w}.amount`, a.single), nonNeg(`${w}.amount`, a.double));
    else if (a.kind === 'model-goods-tax-scrap') nonNeg(`${w}.amount`, a.max);
    else err(w, `unknown amount kind ${a.kind}`);
    if (feeds && a.kind === 'fixed' && a.value === 0) err(w, 'a counted programme pays 0; mark it calculator: { excluded }');
    for (const g of p.exclusiveGroups ?? []) if (!groupIds.has(g)) err(w, `unknown group "${g}"`);
    for (const r of p.requires?.anyOf ?? []) if (!econ.programmes.some((x) => x.id === r)) err(w, `requires unknown programme "${r}"`);
    if (p.requires) checkL10n(`${w}.requires.text`, p.requires.text);
    if (p.calculator !== true) checkL10n(`${w}.calculator.excluded`, p.calculator.excluded);
    const walkCond = (c) => {
      if (c.kind === 'region') for (const jj of c.jurisdictions) if (!jIds.has(jj)) err(w, `condition names unknown jurisdiction "${jj}"`);
      if (c.kind === 'scrap-built') for (const d of [c.onOrBefore, c.onOrAfter]) if (d !== undefined && !isDate(d)) err(w, `bad date ${d}`);
      if (c.kind === 'any-of') c.conditions.forEach(walkCond);
    };
    p.conditions.forEach(walkCond);
  }

  const checkPromo = (w, pr) => {
    uniqueId(`${w} promo ${pr.id}`, pr.id);
    checkProvenance(`${w} promo ${pr.id}`, pr);
    nonNeg(`${w} promo ${pr.id}`, pr.amount);
    if (!isDate(pr.validFrom) || !isDate(pr.validTo)) err(`${w} promo ${pr.id}`, 'dates must be YYYY-MM-DD');
    checkL10n(`${w} promo ${pr.id}.name`, pr.name);
    checkL10n(`${w} promo ${pr.id}.conditionText`, pr.conditionText);
  };
  for (const m of econ.gasModels) {
    const w = `econ gas model ${m.id}`;
    uniqueId(w, m.id);
    const feeds = m.calculator === true;
    checkL10n(`${w}.name`, m.name);
    checkProvenance(`${w}.listPrice`, m.listPrice, { feeds });
    nonNeg(`${w}.listPrice`, m.listPrice.value);
    if (m.plateInsuranceIncluded) checkProvenance(`${w}.plateInsuranceIncluded`, m.plateInsuranceIncluded, { feeds });
    checkProvenance(`${w}.goodsTaxScrapCut`, m.goodsTaxScrapCut, { feeds });
    if (feeds && !m.fuelEconomy) err(w, 'a calculator model needs a fuel economy');
    if (m.fuelEconomy) checkProvenance(`${w}.fuelEconomy`, m.fuelEconomy, { feeds });
    m.promos.forEach((pr) => checkPromo(w, pr));
  }
  for (const m of econ.evModels) {
    const w = `econ ev model ${m.id}`;
    uniqueId(w, m.id);
    const feeds = m.calculator === true;
    checkL10n(`${w}.name`, m.name);
    checkProvenance(`${w}.listPrice`, m.listPrice, { feeds });
    nonNeg(`${w}.listPrice`, m.listPrice.value);
    for (const k of ['plateClassBasis', 'moeaClassBasis']) checkProvenance(`${w}.${k}`, m[k], { feeds });
    checkProvenance(`${w}.battery.basis`, m.battery.basis, { feeds });
    checkProvenance(`${w}.efficiency`, m.efficiency, { feeds });
    checkProvenance(`${w}.performance`, m.performance, { feeds: false });
    if (!['yes', 'unknown'].includes(m.moeaListed)) err(w, 'moeaListed must be yes or unknown');
    if (feeds && !m.battery.count) err(w, 'a calculator model needs a verified battery count');
    for (const pid of m.plans) if (!planIds.has(pid)) err(w, `unknown plan "${pid}"`);
    if (feeds && m.plans.length === 0) err(w, 'a calculator model needs at least one plan');
    if (!econ.maintenance.some((x) => x.id === m.maintenance)) err(w, `unknown maintenance profile "${m.maintenance}"`);
    m.promos.forEach((pr) => checkPromo(w, pr));
  }
  for (const p of econ.plans) {
    const w = `econ plan ${p.id}`;
    uniqueId(w, p.id);
    checkProvenance(w, p, { feeds: p.calculator === true });
    checkL10n(`${w}.name`, p.name);
    checkL10n(`${w}.terms`, p.terms);
    nonNeg(`${w}.monthlyFee`, p.monthlyFee);
    if (p.setupFee) checkProvenance(`${w}.setupFee`, p.setupFee);
    if (p.usage.kind === 'credit') checkProvenance(`${w}.allowance`, p.usage.allowance);
    if (p.usage.kind === 'tariff') checkProvenance(`${w}.rate`, p.usage.rate);
  }
  for (const c of econ.planCredits) {
    const w = `econ plan credit ${c.id}`;
    uniqueId(w, c.id);
    checkProvenance(w, c);
    for (const pid of c.plans === 'any' ? [] : c.plans) if (!planIds.has(pid)) err(w, `unknown plan "${pid}"`);
    for (const mid of c.models === 'any' ? [] : c.models) if (!evIds.has(mid)) err(w, `unknown model "${mid}"`);
    if (!isDate(c.validFrom) || !isDate(c.validTo)) err(w, 'dates must be YYYY-MM-DD');
  }
  for (const k of ['petrol95', 'petrol92', 'smoothing', 'realWorldKmPerL']) checkProvenance(`econ fuel.${k}`, econ.fuel[k]);
  checkProvenance('econ electricity', econ.electricity);
  for (const m of econ.maintenance) {
    const band = m.kind === 'per-km' ? m.perKm : m.perVisit;
    checkProvenance(`econ maintenance ${m.id}`, band);
    checkProvenance(`econ maintenance ${m.id}.ownerAverage`, m.ownerAverage);
    if (band.low > band.typical || band.typical > band.high) err(`econ maintenance ${m.id}`, 'band must satisfy low <= typical <= high');
    if (m.kind === 'visits') checkProvenance(`econ maintenance ${m.id}.intervalBasis`, m.intervalBasis);
  }
  for (const b of econ.fees.roadFeeGasoline) checkProvenance(`econ fees.roadFeeGasoline ${b.upToCc}`, b.perYear);
  for (const k of ['roadFeeElectric', 'licenceTax', 'compulsoryInsurance', 'inspection']) checkProvenance(`econ fees.${k}`, econ.fees[k]);
  checkProvenance('econ spendReference', econ.spendReference);

  // Sweep every localized field in the dataset (brand and model names may be Latin in zh-TW).
  walkL10n('econ', econ, '', { taiWarnOnly: true });
  TAI_WARN_SCOPE = false;
}

/** Reader-voice checks for blocks above the reader-voice section; run there. */
const deferredVoice = [];

// ---------------------------------------------------------------------------
// The estimate (src/data/estimate.ts) against research/estimate/results.json and the registry
// ---------------------------------------------------------------------------
// estimate.ts holds literal published values so client scripts stay small. This block re-reads
// the signed results file and fails if any slot differs from what the science team published.

{
  const E = estimateMod;
  const est = E.est;
  const R = JSON.parse(readFs(resolve(root, 'research/estimate/results.json'), 'utf8'));
  const METHOD = readFs(resolve(root, 'research/estimate/METHOD.md'), 'utf8');
  const w = (slot) => `estimate ${slot}`;
  const near = (a, b, tol = 1e-9) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  const sf = (x, n = 1) => Number(Number(x).toPrecision(n));
  const dp = (x, n = 1) => Number(Number(x).toFixed(n));
  const same = (slot, got, want) => {
    if (!near(got, want)) err(w(slot), `is ${got} but results.json gives ${want}`);
  };
  const H = 'h1.5';
  if (R.generated !== est.meta.date) err(w('meta.date'), `is ${est.meta.date} but results.json was generated ${R.generated}`);
  if (R.conventions?.published && !/1 significant figure/.test(R.conventions.published)) warn(w('meta'), 'results.json no longer says values are published to 1 significant figure; re-check the rounding');
  for (const key of E.scenarioKeys) {
    const sc = est.scn[key];
    const r = R.scenarios.find((x) => x.key === sc.resultsKey);
    if (!r) {
      err(w(`scn.${key}`), `results.json has no scenario "${sc.resultsKey}"`);
      continue;
    }
    if (r.call.n !== est.meta.runs || r.call.seed !== est.meta.seed) err(w(`scn.${key}`), `results.json call n/seed ${r.call.n}/${r.call.seed} differ from meta ${est.meta.runs}/${est.meta.seed}`);
    same(`scn.${key}.count.lo`, sc.count.lo, r.call.scooters[0]);
    same(`scn.${key}.count.hi`, sc.count.hi, r.call.scooters[1]);
    same(`scn.${key}.nearest_m.lo`, sc.nearest_m.lo, r.call.nearest[0]);
    same(`scn.${key}.nearest_m.hi`, sc.nearest_m.hi, r.call.nearest[1]);
    if (!(sc.drawn >= sc.count.lo && sc.drawn <= sc.count.hi)) err(w(`scn.${key}.drawn`), `${sc.drawn} is outside the count ${sc.count.lo}–${sc.count.hi}`);
    const pub = { co: r.publish.co_ppm, benzene: r.publish.benzene_ppb, pm25: r.publish.pm25_ugm3 };
    for (const p of ['co', 'benzene', 'pm25']) {
      const a = est[p][key].add;
      same(`${p}.${key}.add.lo`, a.lo, pub[p].low);
      same(`${p}.${key}.add.mid`, a.mid, pub[p].central);
      same(`${p}.${key}.add.hi`, a.hi, pub[p].high);
      // and the published value is the raw increment at 1.5 m rounded to 1 s.f.
      const raw = r.result[p].increment[H];
      for (const [k, rk] of [['lo', 'low'], ['mid', 'central'], ['hi', 'high']]) {
        if (!near(sf(raw[rk]), pub[p][rk])) err(w(`${p}.${key}.add.${k}`), `results.json publish block ${pub[p][rk]} is not raw ${raw[rk]} at 1 s.f.`);
      }
    }
    const tot = r.result.co.total[H];
    same(`co.${key}.total.lo`, est.co[key].total.lo, dp(tot.low));
    same(`co.${key}.total.mid`, est.co[key].total.mid, dp(tot.central));
    same(`co.${key}.total.hi`, est.co[key].total.hi, dp(tot.high));
  }
  // emission per scooter and per red
  const fm = R.fleet.fleetMeanCO_gph;
  const g = est.emit.co;
  same('emit.co.gPerHour.lo', g.gPerHour.lo, Math.round(fm.low));
  same('emit.co.gPerHour.mid', g.gPerHour.mid, Math.round(fm.central));
  same('emit.co.gPerHour.hi', g.gPerHour.hi, Math.round(fm.high));
  const reds = g.perRedSum.reds;
  if (reds !== 3600 / est.signal.redLength_s) err(w('emit.co.perRedSum.reds'), `${reds} is not 3600 ÷ ${est.signal.redLength_s}`);
  const mv = R.conventions.molarVolume_L;
  if (!near(g.perRedSum.molarVolume_L, mv)) err(w('emit.co.perRedSum.molarVolume_L'), `${g.perRedSum.molarVolume_L} but results.json uses ${mv}`);
  for (const [k, rk] of [['lo', 'low'], ['mid', 'central'], ['hi', 'high']]) {
    const grams = fm[rk] / reds;
    const litres = (grams / g.perRedSum.molarMass_g) * mv;
    const cans = litres / (g.perRedSum.canMl / 1000);
    same(`emit.co.perRed_g.${k}`, g.perRed_g[k], sf(grams));
    same(`emit.co.perRed_L.${k}`, g.perRed_L[k], sf(litres, 2));
    same(`emit.co.perRedSum.exactCans.${k}`, g.perRedSum.exactCans[k], dp(cans, 2));
    same(`emit.co.perRed_can.${k}`, g.perRed_can[k], Math.round(cans * 2) / 2);
  }
  const bz = R.fleet.fleetMeanBenzene_mgph;
  same('emit.benzene_mgPerHour.lo', est.emit.benzene_mgPerHour.lo, sf(bz.low));
  same('emit.benzene_mgPerHour.mid', est.emit.benzene_mgPerHour.mid, sf(bz.central));
  same('emit.benzene_mgPerHour.hi', est.emit.benzene_mgPerHour.hi, sf(bz.high));
  // cross-check against the IOT anchor (METHOD §6, results.json validation.both)
  const both = R.validation.both.max1minIncrement_ppm;
  same('xcheck.iot.model.lo', est.xcheck.iot.model.lo, dp(both.low));
  same('xcheck.iot.model.mid', est.xcheck.iot.model.mid, dp(both.central));
  same('xcheck.iot.model.hi', est.xcheck.iot.model.hi, dp(both.high));
  const obs = est.xcheck.iot.observed;
  if (!METHOD.includes(`${obs.lo}–${obs.hi} ppm`)) err(w('xcheck.iot.observed'), `METHOD.md does not state the observed rise as ${obs.lo}–${obs.hi} ppm`);
  const ratio = R.validation.baseline.max1minIncrement_ppm.central / both.central;
  if (Math.round(ratio) !== est.xcheck.iot.pedestrianOverSensor) err(w('xcheck.iot.pedestrianOverSensor'), `${est.xcheck.iot.pedestrianOverSensor} but results.json gives about ${ratio.toFixed(2)}`);
  // reference values recorded in results.json → inputs
  const inp = R.inputs;
  const bgSrc = inp.bgCO_ppm.source;
  const mGen = bgSrc.match(/general stations ([\d.]+)/);
  const mTraf = bgSrc.match(/traffic stations ([\d.]+)/);
  if (!mGen || !near(Number(mGen[1]), est.bg.co.general.value)) err(w('bg.co.general'), `${est.bg.co.general.value} does not match results.json inputs.bgCO_ppm.source (${bgSrc})`);
  if (!mTraf || !near(Number(mTraf[1]), est.bg.co.traffic.value)) err(w('bg.co.traffic'), `${est.bg.co.traffic.value} does not match results.json inputs.bgCO_ppm.source (${bgSrc})`);
  if (!new RegExp(`annual mean ${est.bg.pm25.value}\\b`).test(inp.bgPM25_ugm3.source)) err(w('bg.pm25'), `${est.bg.pm25.value} does not match results.json inputs.bgPM25_ugm3.source`);
  same('bg.benzene.lo', est.bg.benzene.lo, inp.bgBenzene_ppb.low);
  same('bg.benzene.hi', est.bg.benzene.hi, inp.bgBenzene_ppb.high);
  for (const [slot, key] of [['recipe.fuelFlow_gph', 'fuelFlow_gph'], ['recipe.windSpeed_ms', 'windSpeed_ms']]) {
    const v = slot.split('.').reduce((o, k) => o[k], est);
    same(`${slot}.lo`, v.lo, inp[key].low);
    same(`${slot}.mid`, v.mid, inp[key].central);
    same(`${slot}.hi`, v.hi, inp[key].high);
  }
  const binTotal = inp.moenvCObins.central.reduce((n, b) => n + b[2], 0);
  if (!(est.recipe.inspectionReadings >= binTotal && est.recipe.inspectionReadings - binTotal <= 10)) err(w('recipe.inspectionReadings'), `${est.recipe.inspectionReadings} does not match the ${binTotal} readings in results.json bins`);
  const b = est.recipe.busiest;
  if (Math.round(b.perHourAllApproaches / 4) !== b.perApproachHour) err(w('recipe.busiest.perApproachHour'), `${b.perApproachHour} is not ${b.perHourAllApproaches} ÷ 4`);
  if (Math.floor((b.perApproachHour * b.redSeconds) / 3600) !== b.perRed) err(w('recipe.busiest.perRed'), `${b.perRed} is not ${b.perApproachHour} × ${b.redSeconds} ÷ 3600`);
  // WHO conversion
  const factor = 28.01 / mv;
  if (!near(est.who.mgPerPpm, Number(factor.toFixed(3)))) err(w('who.mgPerPpm'), `${est.who.mgPerPpm} but 28.01 ÷ ${mv} = ${factor.toFixed(4)}`);
  if (!near(est.who.co15min_ppm.exact, dp(est.who.co15min_mg.value / est.who.mgPerPpm))) err(w('who.co15min_ppm.exact'), `${est.who.co15min_ppm.exact} is not ${est.who.co15min_mg.value} ÷ ${est.who.mgPerPpm}`);
  if (est.who.co15min_ppm.value !== Math.round(est.who.co15min_ppm.exact)) err(w('who.co15min_ppm'), 'printed value is not the exact value rounded');
  // every value backed by a registry fact equals the fact's datum
  const fd = (id, key) => {
    const f = facts[id];
    if (!f) {
      err(w(id), `refers to unknown fact "${id}"`);
      return NaN;
    }
    const d = f.data?.[key];
    if (!d) err(w(id), `fact ${id} has no datum "${key}"`);
    return d?.value;
  };
  const eq = (slot, got, id, key) => {
    const want = fd(id, key);
    if (!near(got, want)) err(w(slot), `is ${got} but fact ${id}.data.${key} is ${want}`);
  };
  eq('bg.co.traffic', est.bg.co.traffic.value, 'moenv-co-stations-2025', 'coTraffic');
  eq('bg.co.general', est.bg.co.general.value, 'moenv-co-stations-2025', 'coGeneral');
  eq('bg.pm25', est.bg.pm25.value, 'moenv-co-stations-2025', 'pm25General');
  eq('meas.iot.sites', est.meas.iot.sites.value, 'iot-study-design', 'intersections');
  const peaks = est.meas.iot.co.peaks;
  eq('meas.iot.co.peaks[0]', peaks[0], 'iot-waiting-area-co-2024', 'hsrPeak');
  eq('meas.iot.co.peaks[1]', peaks[1], 'iot-waiting-area-co-2024', 'qixianPeak');
  eq('meas.iot.co.peaks[2]', peaks[2], 'iot-waiting-area-co-2024', 'mingchengPeak');
  if (peaks.length !== est.meas.iot.co.peakSites) err(w('meas.iot.co.peakSites'), `${est.meas.iot.co.peakSites} but ${peaks.length} peaks`);
  eq('meas.iot.pm25.lo', est.meas.iot.pm25.lo, 'iot-waiting-area-pm25-2024', 'hsrLow');
  eq('meas.iot.pm25.hi', est.meas.iot.pm25.hi, 'iot-waiting-area-pm25-2024', 'hsrHigh');
  eq('meas.taipei.co.roadside', est.meas.taipei.co.roadside.value, 'taipei-roadside-co-2024', 'coTraffic');
  eq('who.co15min_mg', est.who.co15min_mg.value, 'who-no2-co-guideline', 'co15min');
  eq('child.airPerKg.lo', est.child.airPerKg.lo, 'child-air-per-kg', 'ratioLow');
  eq('child.airPerKg.hi', est.child.airPerKg.hi, 'child-air-per-kg', 'ratioHigh');
  for (const k of ['scooter', 'walking', 'bus', 'car']) eq(`commute.pm25.${k}`, est.commute.pm25[k], 'commute-scooter-vs-subway-chuang2020', k);
  eq('commute.pm25.metro', est.commute.pm25.metro, 'commute-scooter-vs-subway-chuang2020', 'subway');
  // ranges printed rounded outward to the nearest 5 must contain the fact's range
  const outward5 = (slot, r, id, loKey, hiKey) => {
    const lo = fd(id, loKey);
    const hi = fd(id, hiKey);
    if (r.lo !== Math.floor(lo / 5) * 5 || r.hi !== Math.ceil(hi / 5) * 5) err(w(slot), `${r.lo}–${r.hi} is not fact ${id} (${lo}–${hi}) rounded outward to 5`);
  };
  outward5('signal.pedWait', est.signal.pedWait, 'iot-pedestrian-wait', 'low', 'high');
  outward5('inspect.top10share', est.inspect.top10share, 'inspection-top-tenth-co-share', 'shareLow', 'shareHigh');
  // every slot resolves to a finite, ordered range, and prints as 約 A 到 B
  for (const slot of E.estimateRangeSlots) {
    let r;
    try {
      r = E.estRange(slot);
    } catch (e) {
      err(w(slot), e.message);
      continue;
    }
    if (!Number.isFinite(r.lo) || !Number.isFinite(r.hi) || r.lo > r.hi) err(w(slot), `bad range ${r.lo}–${r.hi}`);
    if (r.mid !== undefined && !(r.mid >= r.lo && r.mid <= r.hi)) err(w(slot), `mid ${r.mid} outside ${r.lo}–${r.hi}`);
    if (r.factId && !factIds.has(r.factId)) err(w(slot), `factId "${r.factId}" is not a fact`);
    const zh = E.formatEstimate(slot, 'zh-TW').text;
    const en = E.formatEstimate(slot, 'en').text;
    if (!/約/.test(zh) || !/到/.test(zh)) err(w(slot), `zh text "${zh}" lacks 約 or 到`);
    if (!/about/.test(en) || !/ to /.test(en)) err(w(slot), `en text "${en}" lacks "about" or "to"`);
  }
  for (const id of E.estimateSourceIds) citeSources(`estimate sources`, [id]);
  walkL10n('estimate', est);
  walkL10n('estimateText', E.estimateText);
  deferredVoice.push(['estimateText', E.estimateText]);
}

// ---------------------------------------------------------------------------
// The simulation (src/data/simulation-data.ts, simulation.ts) against research/simulation
// ---------------------------------------------------------------------------
// simulation-data.ts is generated; this block re-runs the generator and fails on any difference,
// then checks every printed range against the words of its statement and against the results file.

{
  const w = (x) => `simulation ${x}`;
  let gen, data, simMod;
  try {
    gen = await load('scripts/build-simulation-data.mjs');
    data = (await load('src/data/simulation-data.ts')).simData;
    simMod = await load('src/data/simulation.ts');
  } catch (e) {
    err(w('load'), String(e.message).split('\n')[0]);
  }
  if (gen && data && simMod) {
    let fresh;
    try {
      fresh = gen.extract();
    } catch (e) {
      err(w('extract'), e.message);
    }
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(data)) err(w('data'), 'src/data/simulation-data.ts differs from research/simulation; run node scripts/build-simulation-data.mjs');
    const S = JSON.parse(readFs(resolve(root, 'research/simulation/statements.json'), 'utf8'));
    const R = JSON.parse(readFs(resolve(root, 'research/simulation/results-simulation.json'), 'utf8'));
    const words = (i) => `${S.may[i].en} ${S.may[i].mustCarry} ${S.may[i].basis}`;
    const inWords = (slot, i, ...ns) => {
      const text = words(i).replace(/–/g, ' – ');
      for (const n of ns) if (!new RegExp(`(^|[^\\d.])${String(n).replace('.', '\\.')}([^\\d]|$)`).test(text)) err(w(slot), `${n} is not in the words of statement ${i + 1} (statements.json may[${i}])`);
    };
    const sim = simMod.sim;
    inWords('co.oneRed15', 0, sim.co.oneRed15.lo, sim.co.oneRed15.hi, sim.co.nearTailpipeAbout);
    inWords('co.stay15', 1, sim.co.stay15.lo, sim.co.stay15.hi);
    inWords('co.pushchairMiddle', 2, sim.co.pushchairMiddle.lo, sim.co.pushchairMiddle.hi, sim.co.pushchairOneIn.lo, sim.co.pushchairOneIn.hi);
    inWords('co.burst1s', 3, sim.co.burst1s.lo, sim.co.burst1s.hi, sim.co.burst1sHeld.lo, sim.co.burst1sHeld.hi, sim.co.burstUncertainTimes);
    inWords('benzene.stay1hTimes', 7, sim.benzene.stay1hTimes.lo, sim.benzene.stay1hTimes.hi);
    inWords('arcade.inside', 9, sim.arcade.inside.lo, sim.arcade.inside.hi);
    // the 15-minute values the home headline rests on stay below the WHO value
    const who = Number(/^([\d.]+) ppm/.exec(R.numbers[0].reference.value)?.[1]);
    if (sim.who15min_ppm !== who) err(w('who15min_ppm'), `${sim.who15min_ppm} but results-simulation.json names ${who}`);
    if (sim.who15min_ppm !== estimateMod.est.who.co15min_ppm.value) err(w('who15min_ppm'), `${sim.who15min_ppm} differs from estimate.ts who.co15min_ppm ${estimateMod.est.who.co15min_ppm.value}`);
    if (simMod.simBelowWho() !== (sim.co.oneRed15.hi < who && sim.co.stay15.hi < who && sim.co.nearTailpipeAbout < who)) err(w('simBelowWho'), 'does not follow the 15-minute values');
    // each slot prints as 約 A 到 B and is an estimate
    for (const slot of simMod.simSlots) {
      let r;
      try {
        r = simMod.simRange(slot);
      } catch (e) {
        err(w(slot), e.message);
        continue;
      }
      if (!(r.lo < r.hi)) err(w(slot), `bad range ${r.lo}–${r.hi}`);
      const wantAnchor = slot.startsWith('sim.smell.') ? 'smell' : 'simulation';
      if (r.kind !== 'estimate' || r.anchor !== wantAnchor) err(w(slot), `must be an estimate anchored at /estimate/#${wantAnchor}`);
      const zh = estimateMod.formatEstimate(r, 'zh-TW').text;
      const en = estimateMod.formatEstimate(r, 'en').text;
      if (!/約/.test(zh) || !/到/.test(zh)) err(w(slot), `zh text "${zh}" lacks 約 or 到`);
      if (!/about/.test(en) || !/ to /.test(en)) err(w(slot), `en text "${en}" lacks "about" or "to"`);
    }
    // the simulation facts point at their statements and carry the estimate chip
    for (const [id, f] of Object.entries(factGroups.simulation ?? {})) {
      if (!/simulation\/statements#may-\d+/.test(f.research)) err(`fact ${id}`, "a simulation fact's research must name its statement (simulation/statements#may-n)");
      if (!f.sources.includes('scooterair-simulation-2026')) err(`fact ${id}`, "must cite 'scooterair-simulation-2026'");
    }
    walkL10n('simulation meta', simMod.simMeta);
  }
}

// ---------------------------------------------------------------------------
// Answers (src/data/answers.ts): the former gaps, answered
// ---------------------------------------------------------------------------

{
  const { answers, kSentenceIds } = answersMod;
  const slots = new Set(estimateMod.estimateRangeSlots);
  const seenGap = new Map();
  for (const [id, a] of Object.entries(answers)) {
    const w = `answer ${id}`;
    if (!ID_RE.test(id) || !id.startsWith('answer-')) err(w, "id must be kebab-case and start with 'answer-'");
    if (!/^gap-[a-z0-9-]+$/.test(a.formerGap)) err(w, `formerGap "${a.formerGap}" must be the old gap id (gap-…)`);
    if (seenGap.has(a.formerGap)) err(w, `formerGap "${a.formerGap}" already answered by ${seenGap.get(a.formerGap)}`);
    seenGap.set(a.formerGap, id);
    if (!CHAIN_LINKS.has(a.chainLink)) err(w, `chainLink must be 1-7, got ${a.chainLink}`);
    for (const key of ['question', 'answer', 'basis', 'caveat']) checkL10n(`${w}.${key}`, a[key]);
    if (!a.chips.length && !a.kSentence) err(w, 'no chip and no K sentence (brief 7.2 gives a chip to every answer except where a K sentence stands in)');
    for (const c of a.chips) if (!types.readerKinds.includes(c.kind)) err(w, `unknown chip "${c.kind}"`);
    if (a.kSentence && !kSentenceIds.includes(a.kSentence)) err(w, `unknown K sentence "${a.kSentence}"`);
    for (const f of a.facts) if (!factIds.has(f)) err(w, `unknown fact "${f}"`);
    for (const s of a.slots ?? []) if (!slots.has(s)) err(w, `unknown estimate slot "${s}"`);
    if (a.sources) citeSources(w, a.sources, { required: false });
    if (!a.facts.length && !a.sources?.length) err(w, 'needs facts or sources');
    if (a.chips.some((c) => c.kind === 'estimate') && !a.anchor) err(w, 'an estimate answer needs an /estimate/ anchor');
    if (/沒人量過|最髒|違規|合法|愈|車流廢氣|車隊/.test(a.answer['zh-TW'] + a.caveat['zh-TW'])) err(w, 'zh-TW uses a banned word (brief 6.6)');
    deferredVoice.push([w, { question: a.question, answer: a.answer, basis: a.basis, caveat: a.caveat }]);
  }
  if (seenGap.size !== 13) err('answers', `brief 7.2 lists thirteen former gaps; ${seenGap.size} have an answer`);
}

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

for (const [id, n] of cited) if (n === 0) err(`source ${id}`, 'is not cited by any fact, series or claim rule (remove it or cite it)');

// Generic sweep for any localized field the targeted checks above did not reach.
for (const [id, f] of Object.entries(facts)) walkL10n(`fact ${id}`, f);
for (const [id, s] of Object.entries(series)) walkL10n(`series ${id}`, s);
for (const [id, r] of Object.entries(claimRules)) walkL10n(`claim rule ${id}`, r);

// ---------------------------------------------------------------------------
// Reader voice: no editor instructions in reader-facing text
// ---------------------------------------------------------------------------
// Pages print facts' captions, statements and caveats, series text and answers to readers.
// Instructions to editors ("never write…", "不可說成…", "只能用在證據頁…") belong in
// `editorNote` (never rendered) or in claims-policy.ts. A reader-facing caveat states the limit
// of the evidence in plain words a reader can use.

const ZH_INSTRUCTION = [
  /不可(?!能|思議|或缺|否認)/,
  /不得/,
  /只能用在/,
  /請勿/,
  /切勿/,
  /絕不/,
  /不應(?:該)?(?:寫|說|用|呈現|合併)/,
  /不能說(?!明)/,
  /不要(?:寫|說成|稱|合併|混用)/,
];
const EN_INSTRUCTION = [
  /\bnever (?:write|say|present|show|use|call|merge|apply|rank|mix|print|quote|draw)\b/i,
  /\bmust (?:not|never)\b/i,
  /\bshould (?:be|not|never)\b/i,
  /(?:^|[.;:!?]\s+|[,;]\s*(?:so|and|but)\s+)(?:do not|don't|never)\b(?!-)/i,
  /\bdo not (?:merge|rank|mix|call|treat|count|compare|average|apply|use|write|say|share|translate|read|quote|show|present)\b/i,
];
/**
 * Genuine uses: phrases that match a pattern above but are not instructions to editors.
 * Keyed by the localized field's path prefix ('*' = anywhere); each phrase is removed before
 * testing. Add an entry only after reading the sentence.
 */
const READER_VOICE_ALLOW = {
  '*': [
    '不可能', // "impossible"
    '不得過戶', // a programme's own condition: the scooter may not be transferred
    '不得遷出', // ... or moved out of the city
    '不得疊加', // a programme's own rule: the schemes cannot be combined
  ],
  // Programme conditions quote the programme's own legal wording (不得再申請, 不得有…).
  'econ.programmes': ['不得'],
};
function readerVoice(where, value, report = err) {
  if (!isL10n(value)) return;
  const allowed = Object.entries(READER_VOICE_ALLOW)
    .filter(([k]) => k === '*' || where.startsWith(k))
    .flatMap(([, list]) => list);
  const clean = (s) => allowed.reduce((acc, p) => acc.split(p).join(''), s);
  const zh = typeof value['zh-TW'] === 'string' ? clean(value['zh-TW']) : '';
  const en = typeof value.en === 'string' ? clean(value.en) : '';
  for (const re of ZH_INSTRUCTION) {
    const m = zh.match(re);
    if (m) report(where, `zh-TW: instruction to editors in reader-facing text ("${m[0]}"); state the limit for readers and move the instruction to editorNote or claims-policy.ts: "${zh.slice(0, 70)}…"`);
  }
  for (const re of EN_INSTRUCTION) {
    const m = en.match(re);
    if (m) report(where, `en: instruction to editors in reader-facing text ("${m[0].trim()}"); state the limit for readers and move the instruction to editorNote or claims-policy.ts: "${en.slice(0, 70)}…"`);
  }
}
function walkReaderVoice(where, obj, report = err) {
  if (!obj || typeof obj !== 'object') return;
  if (isL10n(obj)) return readerVoice(where, obj, report);
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'editorNote' || k === 'patterns') continue;
    if (v && typeof v === 'object') walkReaderVoice(`${where}.${k}`, v, report);
  }
}
for (const [id, f] of Object.entries(facts)) walkReaderVoice(`fact ${id}`, f);
for (const [id, s] of Object.entries(series)) walkReaderVoice(`series ${id}`, s);
for (const [l, lab] of Object.entries(types.chainLinkLabels)) walkReaderVoice(`chainLinkLabels.${l}`, lab);
walkReaderVoice('confidenceLabels', types.confidenceLabels);
walkReaderVoice('evidenceLabels', types.evidenceLabels);
if (econ) walkReaderVoice('econ', econ, warn); // owned elsewhere: warnings only
for (const [id, f] of Object.entries(facts)) {
  // Pages print a caveat beside every fact; without one they fall back to a generic line.
  if (!f.caveat) err(`fact ${id}`, 'every fact needs a reader-facing caveat: one short, true statement of its scope or limit');
  if (f.editorNote !== undefined && (typeof f.editorNote !== 'string' || !f.editorNote.trim())) err(`fact ${id}`, 'editorNote must be a non-empty string');
}

for (const [where, obj] of deferredVoice) walkReaderVoice(where, obj);

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
const seriesResolved = seriesMod.seriesList;
const summary = [
  `sources ${sourceIds.size} ${JSON.stringify(count(Object.values(sources), 'readLevel'))}`,
  `facts ${factArr.length} ${JSON.stringify(count(factArr, 'confidence'))} ${JSON.stringify(count(factArr, 'evidence'))}`,
  `facts by chain link ${JSON.stringify(count(factArr, 'chainLink'))}`,
  `series ${seriesArr.length} ${JSON.stringify(count(seriesArr, 'confidence'))} by chain link ${JSON.stringify(count(seriesResolved, 'chainLink'))}`,
  `answers ${Object.keys(answersMod.answers).length} (the former gaps, brief 7.2)`,
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
