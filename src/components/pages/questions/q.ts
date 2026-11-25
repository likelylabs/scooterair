// Helpers shared by the question pages (workstream Q1). Everything a page shows about the world
// comes through here from the fact registry, so a corrected fact corrects the page.

import type { Locale } from '@/i18n';
import { readerText, evidenceBadge, type EvidenceKind } from '@/i18n/ui';
import { facts, gaps, shortCitation, localizeFact, localizeGap, localizeSeries, sourceIds, sourcesFor, type FactId, type GapId, type SeriesId, type SourceId } from '@/data';
import questions from '@/i18n/pages/questions';

export type Slug = keyof typeof questions.items;
export const slugs = Object.keys(questions.items) as Slug[];
/** Index and page order: the order of the chain (blueprint 4.2 lists the same eight). */
export const chainOrder: Slug[] = [...slugs].sort((a, b) => questions.items[a].link - questions.items[b].link || slugs.indexOf(a) - slugs.indexOf(b));

/**
 * The number printed on a citation marker. Stable across the whole site: the source's position
 * in the bibliography (src/data/sources.ts), 1-based. /sources/ can print the same number.
 */
export const citeN = (id: SourceId): number => sourceIds.indexOf(id) + 1;

/** Unique sources behind a list of facts and gaps, in first-cited order. */
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

export function lg(id: GapId, locale: Locale) {
  const g = localizeGap(id, locale);
  return { ...g, statement: readerText(g.statement), wouldClose: readerText(g.wouldClose), whoCouldMeasure: g.whoCouldMeasure ? readerText(g.whoCouldMeasure) : undefined };
}

/** Badge props for a fact, from its registry evidence type and confidence. */
export const factBadge = (id: FactId) => evidenceBadge(facts[id].evidence, facts[id].confidence);

/** Caveats the registry marks as required, for the facts a sentence rests on (deduplicated). */
export function requiredCaveats(factIds: readonly FactId[] = [], locale: Locale): { id: FactId; text: string }[] {
  return factIds.filter((id) => facts[id].requiresCaveat && facts[id].caveat).map((id) => ({ id, text: readerText(facts[id].caveat![locale]) }));
}

/** Short author-year label of a source ("Wu等，2021"), for study accordions. */
export const sourceLabel = (id: SourceId, locale: Locale) => readerText(shortCitation(id, locale));

export const asKinds = (b?: EvidenceKind | EvidenceKind[]): EvidenceKind[] => (b ? (Array.isArray(b) ? b : [b]) : []);

/** Locale-aware number for chart labels. */
export const fmtN = (locale: Locale, v: number, digits = 2) => new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: digits }).format(v);

/** Citation markers for a registry series (series-level and point-level sources). */
export function seriesCites(id: SeriesId): { id: SourceId; n: number }[] {
  return sourcesFor({ series: [id] }).map((s) => ({ id: s.id, n: citeN(s.id) }));
}

/** A series, localized, with reader-facing text. */
export function ls(id: SeriesId, locale: Locale) {
  const s = localizeSeries(id, locale);
  return { ...s, caveat: s.caveat ? readerText(s.caveat) : undefined, title: readerText(s.title) };
}

/** One dataset's points of a localized series, keyed by x. */
export function points(s: ReturnType<typeof ls>, dataset: string) {
  const d = s.datasets.find((x) => x.key === dataset);
  if (!d) throw new Error(`[questions] series ${s.id} has no dataset ${dataset}`);
  return d;
}
export const catLabel = (s: ReturnType<typeof ls>, key: string) => readerText(s.categories.find((c) => c.key === key)?.label ?? key);
