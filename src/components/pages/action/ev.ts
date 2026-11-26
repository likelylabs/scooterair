// Helpers shared by workstream P (/unmeasured/, /act/, /about/ and the print pieces).
// Everything these pages say about the world comes through here from the fact registry, so a
// corrected fact corrects the page. Copy lives in src/i18n/pages/{unmeasured,act,about}.ts.

import type { Locale } from '@/i18n';
import { readerText, evidenceBadge, type EvidenceKind } from '@/i18n/ui';
import { claimRules, facts, gaps, localizeFact, localizeGap, sourceIds, type ClaimRuleId, type FactId, type GapId, type SourceId } from '@/data';

/**
 * The number printed on a citation marker: the source's position in the bibliography
 * (src/data/sources.ts), 1-based. The same rule the question pages use, so a source keeps one
 * number across the site.
 */
export const citeN = (id: SourceId): number => sourceIds.indexOf(id) + 1;

/** Unique sources behind facts, gaps and claim rules, in first-cited order. */
export function sourcesOf(factIds: readonly FactId[] = [], gapIds: readonly GapId[] = []): { id: SourceId; n: number }[] {
  const seen = new Set<SourceId>();
  for (const f of factIds) for (const s of facts[f].sources) seen.add(s);
  for (const g of gapIds) for (const s of (gaps[g] as { sources?: SourceId[] }).sources ?? []) seen.add(s);
  return [...seen].map((id) => ({ id, n: citeN(id) }));
}

/** A localized fact with reader-facing text (台, not 臺). */
export function lf(id: FactId, locale: Locale) {
  const f = localizeFact(id, locale);
  return { ...f, statement: readerText(f.statement), caveat: f.caveat ? readerText(f.caveat) : undefined, place: readerText(f.place), period: readerText(f.period) };
}

/** A localized gap with reader-facing text. */
export function lg(id: GapId, locale: Locale) {
  const g = localizeGap(id, locale);
  return {
    ...g,
    title: readerText(g.title),
    statement: readerText(g.statement),
    whyItMatters: readerText(g.whyItMatters),
    wouldClose: readerText(g.wouldClose),
    whoCouldMeasure: g.whoCouldMeasure ? readerText(g.whoCouldMeasure) : undefined,
  };
}

/** Badge props for a fact, from its registry evidence type and confidence. */
export const factBadge = (id: FactId) => evidenceBadge(facts[id].evidence, facts[id].confidence);

/** Distinct badges for a set of facts (secondary wins if any fact of that kind is secondary). */
export function badgesFor(ids: readonly FactId[]): { kind: EvidenceKind; secondary: boolean }[] {
  const out: { kind: EvidenceKind; secondary: boolean }[] = [];
  for (const id of ids) {
    const b = factBadge(id);
    const have = out.find((x) => x.kind === b.kind);
    if (have) have.secondary ||= b.secondary;
    else out.push(b);
  }
  return out;
}

/** Caveats the registry marks as required, for the facts a sentence rests on. */
export function requiredCaveats(factIds: readonly FactId[] = [], locale: Locale): { id: FactId; text: string }[] {
  return factIds.filter((id) => facts[id].requiresCaveat && facts[id].caveat).map((id) => ({ id, text: readerText(facts[id].caveat![locale]) }));
}

/** A raw registry number. Throws on a missing key so a renamed datum fails the build. */
export function datum(id: FactId, key: string): number {
  const d = (facts[id].data as Record<string, { value: number }>)[key];
  if (!d) throw new Error(`[action] fact ${id} has no datum "${key}"`);
  return d.value;
}

/** Locale-aware number. */
export const num = (locale: Locale, v: number, digits = 1) => new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: digits }).format(v);

/**
 * A vehicle count as a reader says it: 28 萬 in Chinese, 280,000 in English. Only for counts
 * the registry gives as round, approximate numbers.
 */
export const count = (locale: Locale, v: number) => (locale === 'en' ? num(locale, v, 0) : `${num(locale, v / 10000, 1)} 萬`);

/** A claim rule from the claims policy, localized, with the facts it rests on. */
export function rule(id: ClaimRuleId, locale: Locale) {
  const r = claimRules[id] as (typeof claimRules)[ClaimRuleId] & { instead?: { 'zh-TW': string; en: string }; facts?: FactId[] };
  return {
    id,
    rule: readerText(r.rule[locale]),
    instead: r.instead ? readerText(r.instead[locale]) : undefined,
    why: readerText(r.why[locale]),
    facts: (r.facts ?? []) as FactId[],
  };
}
