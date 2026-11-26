// Helpers for /evidence/ and /sources/ (workstream Q2). Everything these pages say about the
// world comes through here from the registry (src/data), so a corrected fact corrects the page.
//
// Anchors (stable; other pages deep-link to them)
//   /evidence/#link-1 … #link-7     one section per link of the chain
//   /evidence/#<fact id>            every fact, e.g. /evidence/#teds13-mc-co-share
//   /evidence/#data-<series id>     every chart dataset, e.g. /evidence/#data-wu2021-station-correlation
//   /evidence/#<gap id>             every recorded gap, e.g. /evidence/#gap-pedestrian-red-light-exposure
//   /sources/#<source id>           every source (what citation markers link to)
//   /sources/#<gap id>              gaps are bibliography entries too

import type { Locale } from '@/i18n';
import { readerText, evidenceBadge, type EvidenceKind } from '@/i18n/ui';
import {
  chainLinks,
  claimRuleList,
  facts,
  factList,
  gapList,
  gaps,
  getSource,
  localizeFact,
  localizeGap,
  localizeSeries,
  readLevelLabels,
  seriesList,
  shortCitation,
  sourceIds,
  type ChainLink,
  type FactId,
  type GapId,
  type LocalizedFact,
  type LocalizedSeries,
  type SeriesId,
  type Source,
  type SourceId,
} from '@/data';

/** The number printed on a citation marker: the source's place in the bibliography, 1-based. Same on every page. */
export const citeN = (id: SourceId): number => sourceIds.indexOf(id) + 1;

/** Anchor for a chart dataset (series ids can equal fact ids, so they carry a prefix). */
export const dataAnchor = (id: SeriesId) => `data-${id}`;

/** A localized fact with reader-facing text (台, not 臺). */
export function lf(id: FactId, locale: Locale): LocalizedFact {
  const f = localizeFact(id, locale);
  return {
    ...f,
    statement: readerText(f.statement),
    caveat: f.caveat ? readerText(f.caveat) : undefined,
    place: readerText(f.place),
    period: readerText(f.period),
    display: readerText(f.display),
  };
}

/** A localized series with reader-facing text. */
export function ls(id: SeriesId, locale: Locale): LocalizedSeries {
  const s = localizeSeries(id, locale);
  const r = readerText;
  return {
    ...s,
    title: r(s.title),
    description: r(s.description),
    caveat: s.caveat ? r(s.caveat) : undefined,
    period: r(s.period),
    place: r(s.place),
    categories: s.categories.map((c) => ({ ...c, label: r(c.label), note: c.note ? r(c.note) : undefined })),
    datasets: s.datasets.map((d) => ({ ...d, label: r(d.label), note: d.note ? r(d.note) : undefined, points: d.points.map((p) => ({ ...p, note: p.note ? r(p.note) : undefined })) })),
  };
}

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
export const kindOf = (e: Parameters<typeof evidenceBadge>[0]): EvidenceKind => evidenceBadge(e).kind;

/** Cite markers for a list of sources. */
export const cites = (ids: readonly SourceId[]) => [...new Set(ids)].map((id) => ({ id, n: citeN(id) }));

/** Every source of a series (series-level and point-level). */
export function seriesSources(id: SeriesId): SourceId[] {
  const s = seriesList.find((x) => x.id === id)!;
  const out = new Set<SourceId>(s.sources);
  for (const d of s.datasets) for (const p of d.points) for (const src of p.sources ?? []) out.add(src);
  return [...out];
}

/** Gap number in the #gaps list (1-based, registry order). */
export const gapN = (id: GapId) => gapList.findIndex((g) => g.id === id) + 1;

/** Locale-aware number. */
export const num = (locale: Locale, v: number, digits = 2) => new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: digits }).format(v);

/** How a source was read, in the reader's language. */
export const readLabel = (s: Source, locale: Locale) => readerText(readLevelLabels[s.readLevel][locale]);

/** Short author-year label of a source. */
export const sourceShort = (id: SourceId, locale: Locale) => readerText(shortCitation(id, locale));

// ---------------------------------------------------------------------------------------
// Where each piece of evidence is shown in full on /evidence/
// ---------------------------------------------------------------------------------------

/**
 * Facts whose full row lives in #not-used rather than in their link (R14: the never-smoker
 * lung-cancer figures appear only there; the 94% day, the regional ranking and the single idle
 * particle datum are the figures the section takes apart). Their link shows a pointer instead.
 */
export const notUsedFacts: FactId[] = [
  'iot-scramble-outlier-day',
  'tseng2019-never-smokers',
  'huang2021-never-smoker-lung-cancer',
  'mohw-lung-cancer-2025',
  'fleet-regional-ranking',
  'idle-pn-chien-huang-2010',
];
/** Series drawn in #not-used (V31 and the full by-day results behind it). */
export const notUsedSeries: SeriesId[] = ['iot-scramble-summary', 'iot-scramble-by-day'];

/** R13: the three-scooter case study is shown only in its own hatched panel. */
export const casePanelFacts: FactId[] = ['tsai2026-three-scooter-case'];
export const casePanelSeries: SeriesId[] = ['tsai2026-three-scooter-case'];

/**
 * R14: the never-smoker lung cancer figures appear only in #not-used. Pointers to them elsewhere
 * (link 5's "also used" list, /sources/) carry a number-free label and no statement.
 */
export const neverSmokerFacts: FactId[] = ['tseng2019-never-smokers', 'huang2021-never-smoker-lung-cancer'];

/** Where a fact's full row is: '#not-used', or link n. */
export function homeOf(id: FactId): 'not-used' | ChainLink | null {
  if (notUsedFacts.includes(id)) return 'not-used';
  return facts[id].chainLink;
}

// ---------------------------------------------------------------------------------------
// Chain-wide counts
// ---------------------------------------------------------------------------------------

/** Everything the registry holds (the same counts /about/ prints), with the on-chain share of the facts. */
export function totals() {
  const linked = factList.filter((f) => f.chainLink !== null);
  return {
    facts: factList.length,
    chained: linked.length,
    context: factList.length - linked.length,
    series: seriesList.length,
    gaps: gapList.length,
    sources: sourceIds.length,
    rules: claimRuleList.filter((r) => r.kind === 'do-not-claim').length,
  };
}

// ---------------------------------------------------------------------------------------
// Which links, facts, series, gaps and rules rely on each source (for /sources/)
// ---------------------------------------------------------------------------------------

export interface SourceUse {
  facts: FactId[];
  series: SeriesId[];
  gaps: GapId[];
  rules: string[];
  links: ChainLink[];
}

let usesCache: Map<SourceId, SourceUse> | null = null;
export function sourceUses(): Map<SourceId, SourceUse> {
  if (usesCache) return usesCache;
  const m = new Map<SourceId, SourceUse>(sourceIds.map((id) => [id, { facts: [], series: [], gaps: [], rules: [], links: [] }]));
  const addLink = (u: SourceUse, l: ChainLink | null | undefined) => {
    if (l && !u.links.includes(l)) u.links.push(l);
  };
  for (const f of factList) {
    for (const src of f.sources) {
      const u = m.get(src)!;
      if (!u.facts.includes(f.id)) u.facts.push(f.id);
      addLink(u, f.chainLink);
      for (const l of f.alsoLinks ?? []) addLink(u, l);
    }
  }
  for (const s of seriesList) {
    for (const src of seriesSources(s.id)) {
      const u = m.get(src)!;
      if (!u.series.includes(s.id)) u.series.push(s.id);
      addLink(u, s.chainLink);
      for (const l of s.alsoLinks ?? []) addLink(u, l);
    }
  }
  for (const g of gapList) {
    for (const src of (gaps[g.id] as { sources?: SourceId[] }).sources ?? []) {
      const u = m.get(src)!;
      u.gaps.push(g.id);
      addLink(u, g.chainLink);
    }
  }
  for (const r of claimRuleList) {
    for (const src of r.sources ?? []) {
      const u = m.get(src);
      if (u && !u.rules.includes(r.id)) u.rules.push(r.id);
    }
  }
  for (const u of m.values()) u.links.sort((a, b) => a - b);
  usesCache = m;
  return m;
}

export { chainLinks, getSource, sourceIds };
