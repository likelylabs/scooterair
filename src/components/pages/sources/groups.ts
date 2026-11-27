// /sources/: which question each source helps answer (its groups), worked out from what cites it.
//
// Groups: the seven links of the chain, then our estimate, masks, money and background.
// A source's MAIN group (where its entry is listed) is chosen in this order:
//   1. money       the calculator's data (src/data/econ) cites it
//   2. masks       a mask fact cites it
//   3. link n      the link most of its own facts and chart data belong to (ties: lowest link)
//   4. estimate    only the estimate (src/data/estimate.ts estimateSourceIds) cites it
//   5. background  nothing above: claim rules, answers or context only
// Every other group it belongs to is listed as `also`, and that group shows a small link to it.

import { chainLinks, facts, factList, getSource, sourceIds, type Source, type SourceId } from '@/data';
import { estimateSourceIds } from '@/data/estimate';
import { econData } from '@/data/econ';
import type { Locale } from '@/i18n';
import { readerText } from '@/i18n/ui';
import { sourceUses } from '@/components/pages/evidence/ev';

export type GroupId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | 'estimate' | 'masks' | 'money' | 'background';
export const groupOrder: GroupId[] = [...chainLinks.map((n) => String(n) as GroupId), 'estimate', 'masks', 'money', 'background'];
/** The anchor of a group on /sources/ (never equal to a source id: no source id starts with "topic-"). */
export const groupAnchor = (g: GroupId) => `topic-${g}`;

export interface SourceGroups {
  main: GroupId;
  also: GroupId[];
}

let cache: Map<SourceId, SourceGroups> | undefined;

export function sourceGroups(): Map<SourceId, SourceGroups> {
  if (cache) return cache;
  const uses = sourceUses();
  const econText = JSON.stringify(econData);
  const est = new Set<string>(estimateSourceIds);
  const maskFacts = new Set(factList.filter((f) => f.id.startsWith('mask')).map((f) => f.id));
  const m = new Map<SourceId, SourceGroups>();
  for (const id of sourceIds) {
    const u = uses.get(id)!;
    const all = new Set<GroupId>();
    const isEcon = econText.includes(`"${id}"`);
    const isMask = u.facts.some((f) => maskFacts.has(f));
    if (isEcon) all.add('money');
    if (isMask) all.add('masks');
    if (est.has(id)) all.add('estimate');
    for (const l of u.links) all.add(String(l) as GroupId);
    // the link most of its own facts and series sit on
    const tally = new Map<number, number>();
    for (const f of u.facts) {
      const l = facts[f].chainLink;
      if (l) tally.set(l, (tally.get(l) ?? 0) + 1);
    }
    const topLink = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? (u.links.length ? Math.min(...u.links) : undefined);
    const main: GroupId = isEcon ? 'money' : isMask ? 'masks' : topLink ? (String(topLink) as GroupId) : est.has(id) ? 'estimate' : 'background';
    all.delete(main);
    m.set(id, { main, also: groupOrder.filter((g) => all.has(g)) });
  }
  cache = m;
  return m;
}

const isCjk = (s: string) => /[㐀-鿿]/.test(s);

/** Who wrote or published it, as the reference list prints it (up to three names, then 等 / et al.). */
export function sourceWho(s: Source, locale: Locale): string {
  const names = s.authors ?? [];
  if (!names.length) return s.org ? readerText(s.org[locale]) : '';
  const cjk = names.every(isCjk);
  const more = names.length > 3 || s.etAl;
  const tail = more ? (locale === 'zh-TW' ? (cjk ? '等' : ' 等') : cjk ? ' et al.' : ', et al.') : '';
  return names.slice(0, 3).join(cjk ? '、' : ', ') + tail;
}

/** The rest of the reference after the title: where it appeared, the publisher, report number, a news item's date. */
export function sourceWhere(s: Source, locale: Locale): string[] {
  const zh = locale === 'zh-TW';
  const parts: string[] = [];
  if (s.container) {
    let c = readerText(s.container);
    if (s.volume) c += ` ${s.volume}`;
    if (s.issue) c += `(${s.issue})`;
    if (s.pages) c += `${zh ? '，' : ', '}${s.pages}`;
    parts.push(c);
  } else if (s.volume || s.pages) parts.push([s.volume, s.pages].filter(Boolean).join(zh ? '，' : ', '));
  if (s.org && s.authors?.length) parts.push(readerText(s.org[locale]));
  if (s.reportNumber) parts.push(s.reportNumber);
  return parts;
}

/** The year, or a news item's full date (the reference list's normal form; `noYear` when the document prints none). */
export function sourceWhen(s: Source, noYear: string): string {
  if (s.date && s.kind === 'news') return s.date;
  return s.year ? String(s.year) : noYear;
}

export const getSrc = getSource;
