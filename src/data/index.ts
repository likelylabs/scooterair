// Public API of the cited data layer. Page builders import from '@/data' only.
//
//   import { localizeFact, localizeSeries, formatCitation, flagCopy } from '@/data';
//
//   const co = localizeFact('teds13-mc-co-share', locale);
//   co.display        // '15.59%'
//   co.statement      // one sentence, as strong as the evidence allows
//   co.caveat         // show it; if co.requiresCaveat, show it next to the number
//   co.badges         // { confidence: '已查證', evidence: '本站計算', ... }
//   co.citations      // [{ id, short, full, url }]
//
//   const chart = localizeSeries('teds13-motorcycle-share', locale);
//
// Never hard-code a number or factual claim in a page: add it here (with its source)
// and run `npm run check`.

export * from './types.ts';
export * from './sources.ts';
export * from './facts.ts';
export * from './series.ts';
export * from './claims-policy.ts';
export * from './gaps.ts';
export * from './answers.ts';
export * from './estimate.ts';
export * from './chain.ts';

import { getSource, type SourceId, type Source } from './sources.ts';
import { facts, type FactId } from './facts.ts';
import { series as seriesRecord, type SeriesId } from './series.ts';
import { gaps as gapRecord, type GapId } from './gaps.ts';
import { answers as answerRecord, type AnswerId } from './answers.ts';

/** Every source cited by the given facts, series, gaps and answers, de-duplicated, in first-cited order (for a page's reference list). */
export function sourcesFor(ids: { facts?: FactId[]; series?: SeriesId[]; gaps?: GapId[]; answers?: AnswerId[] }): Source[] {
  const seen = new Set<SourceId>();
  const add = (list: readonly SourceId[]) => list.forEach((id) => seen.add(id));
  for (const id of ids.answers ?? []) {
    const a = answerRecord[id] as { facts: FactId[]; sources?: SourceId[] };
    for (const f of a.facts) add(facts[f].sources);
    add(a.sources ?? []);
  }
  for (const id of ids.gaps ?? []) add((gapRecord[id] as { sources?: SourceId[] }).sources ?? []);
  for (const id of ids.facts ?? []) add(facts[id].sources);
  for (const id of ids.series ?? []) {
    const s = seriesRecord[id];
    add(s.sources);
    for (const d of s.datasets) for (const p of d.points) if ('sources' in p && p.sources) add(p.sources);
  }
  return [...seen].map(getSource);
}
