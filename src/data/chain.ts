// The chain of evidence, link by link. A page asks for one link and gets every fact, series
// and gap that serves it, already localized, each with its evidence badge.
//
//   import { evidenceForLink } from '@/data';
//   const link3 = evidenceForLink(3, 'zh-TW');
//   link3.label                 // '街上的人吸進什麼'
//   link3.facts[0].badges       // { confidence: '已查證', evidence: '台灣實測', ... }
//   link3.gaps[0].badge         // '證據缺口'
//   evidenceForLink(3, 'en', { primaryOnly: true })   // skip facts that only list 3 in alsoLinks
//
// Ordering: primary-link items first, then by evidence strength (measured in Taiwan, official,
// modelled, international, our arithmetic, prices), verified before secondary.

import type { ChainLink, Evidence, Locale } from './types.ts';
import { chainLinkLabels, chainLinks } from './types.ts';
import { factList, localizeFact, type Fact, type LocalizedFact } from './facts.ts';
import { seriesList, localizeSeries, type Series, type LocalizedSeries } from './series.ts';
import { gapsForLink, localizeGap, type EvidenceGap, type LocalizedGap } from './gaps.ts';

const evidenceOrder: Record<Evidence, number> = {
  'measured-tw': 0,
  'official-tw': 1,
  'modelled-tw': 2,
  international: 3,
  derived: 4,
  'market-tw': 5,
};

const servesLink = (link: ChainLink, primaryOnly: boolean) => (x: { chainLink: ChainLink | null; alsoLinks?: ChainLink[] }) =>
  x.chainLink === link || (!primaryOnly && (x.alsoLinks ?? []).includes(link));

function rank<T extends { chainLink: ChainLink | null; evidence: Evidence; confidence: string }>(link: ChainLink, list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      Number(a.chainLink !== link) - Number(b.chainLink !== link) ||
      evidenceOrder[a.evidence] - evidenceOrder[b.evidence] ||
      Number(a.confidence !== 'verified') - Number(b.confidence !== 'verified'),
  );
}

/** Facts for one link (primary link first). */
export function factsForLink(link: ChainLink, opts: { primaryOnly?: boolean } = {}): Fact[] {
  return rank(link, factList.filter(servesLink(link, opts.primaryOnly ?? false)));
}

/** Series for one link (primary link first). */
export function seriesForLink(link: ChainLink, opts: { primaryOnly?: boolean } = {}): Series[] {
  return rank(link, seriesList.filter(servesLink(link, opts.primaryOnly ?? false)));
}

/** Facts and series outside the chain (chainLink null): context such as commuting habits. */
export function contextItems(): { facts: Fact[]; series: Series[] } {
  return { facts: factList.filter((f) => f.chainLink === null), series: seriesList.filter((s) => s.chainLink === null) };
}

export interface LinkEvidence {
  link: ChainLink;
  label: string;
  question: string;
  facts: LocalizedFact[];
  series: LocalizedSeries[];
  gaps: LocalizedGap[];
  counts: { facts: number; series: number; gaps: number };
}

/** Everything for one link, localized, with badges. */
export function evidenceForLink(link: ChainLink, locale: Locale, opts: { primaryOnly?: boolean } = {}): LinkEvidence {
  const facts = factsForLink(link, opts).map((f) => localizeFact(f, locale));
  const series = seriesForLink(link, opts).map((s) => localizeSeries(s, locale));
  const gaps = gapsForLink(link).map((g: EvidenceGap) => localizeGap(g, locale));
  return {
    link,
    label: chainLinkLabels[link].short[locale],
    question: chainLinkLabels[link].question[locale],
    facts,
    series,
    gaps,
    counts: { facts: facts.length, series: series.length, gaps: gaps.length },
  };
}

/** One line per link, for an overview of the whole chain. */
export function chainSummary(locale: Locale): { link: ChainLink; label: string; facts: number; series: number; gaps: number }[] {
  return chainLinks.map((link) => ({
    link,
    label: chainLinkLabels[link].short[locale],
    facts: factsForLink(link, { primaryOnly: true }).length,
    series: seriesForLink(link, { primaryOnly: true }).length,
    gaps: gapsForLink(link).length,
  }));
}
