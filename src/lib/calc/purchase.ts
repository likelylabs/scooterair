// Purchase ledgers: list price, dealer promotions, every applicable programme as its own line,
// and every considered-but-excluded programme with the reason.
//
// Selection: among eligible programmes, at most one per either/or group is counted, and a
// programme that `requires` another counts only if that one is taken (when it is available).
// A two-sided group (`sideA`) sets one set of programmes against the rest: members on the same
// side stack, members on opposite sides exclude each other (Kinmen money versus all MOENV
// payments together). We pick the combination worth the most to the buyer. Groups marked
// `conservative` encode our cautious reading of an ambiguous rule; we also solve without them
// and report the difference.

import type { DealerPromo, EconDataset, EvModel, GasModel, Programme } from '../../data/econ/types.ts';
import { cmp, daysBetween, earlier, todayInTaiwan } from './dates.ts';
import { checkAll, type EligibilityContext } from './eligibility.ts';
import { date, detail, join, list, ntd, reasonText, t } from './text.ts';
import type { L10n } from './text.ts';
import type { DeadlineBasis, ExcludedLine, ExclusionReason, LedgerLine, LineDeadline, LineKind, Message, PurchaseLedger, Situation, SourceId } from './types.ts';

interface Candidate {
  p: Programme;
  amount: number;
  assumptions: L10n[];
}

export interface SelectionResult {
  chosen: Candidate[];
  total: number;
}

const kindOf = (p: Programme): LineKind =>
  p.kind === 'tax-reduction' ? 'tax' : p.kind === 'recycling-bonus' ? 'recycling' : p.kind === 'scrap-only-bonus' ? 'scrap-only' : 'subsidy';

const sideMatches = (p: Programme, side: 'electric' | 'gasoline') => p.side === 'both' || p.side === side;

function programmeAmount(p: Programme, ev?: EvModel, gas?: GasModel): number | null {
  const a = p.amount;
  if (a.kind === 'fixed') return a.value;
  if (a.kind === 'model-goods-tax-scrap') return gas ? Math.min(a.max, gas.goodsTaxScrapCut.value) : null;
  if (a.kind === 'per-battery') {
    const count = ev?.battery.count;
    if (!count) return null;
    return count === 2 ? a.double : a.single;
  }
  return null;
}

/** Maximise the total over either/or groups and requirements. `ignoreGroups` lets us solve the generous reading. */
export function liveGroups(ids: string[] | undefined, data: EconDataset, jurisdiction: string, ignore: Set<string> = new Set()): string[] {
  return (ids ?? []).filter((g) => {
    const group = data.groups[g];
    return Boolean(group) && !group.advisory && !ignore.has(g) && (!group.jurisdictions || group.jurisdictions.some((j) => j === jurisdiction));
  });
}

/** Side of a two-sided group a programme is on ('a' | 'b'), or null for an ordinary group. */
export function groupSide(groupId: string, programmeId: string, data: EconDataset): 'a' | 'b' | null {
  const g = data.groups[groupId];
  if (!g?.sideA) return null;
  return g.sideA.includes(programmeId) ? 'a' : 'b';
}

/** Do two programmes that share `groupId` exclude each other? (Same side of a two-sided group: no.) */
export function conflicts(groupId: string, a: string, b: string, data: EconDataset): boolean {
  const sa = groupSide(groupId, a, data);
  return sa === null || sa !== groupSide(groupId, b, data);
}

export function select(candidates: Candidate[], data: EconDataset, jurisdiction: string, ignoreGroups: Set<string> = new Set()): SelectionResult {
  const groupsOf = (c: Candidate) => liveGroups(c.p.exclusiveGroups, data, jurisdiction, ignoreGroups);
  const requiredIds = new Set(candidates.flatMap((c) => c.p.requires?.anyOf ?? []));
  const free = candidates.filter((c) => groupsOf(c).length === 0 && !c.p.requires && !requiredIds.has(c.p.id));
  const choice = candidates.filter((c) => !free.includes(c));
  const eligibleIds = new Set(candidates.map((c) => c.p.id));

  let best: Candidate[] = [];
  let bestTotal = -1;
  const picked: Candidate[] = [];
  // group -> the side taken ('a' | 'b', or null for an ordinary group) and how many members hold it
  const used = new Map<string, { side: 'a' | 'b' | null; n: number }>();
  const canTake = (c: Candidate, gs: string[]) =>
    gs.every((g) => {
      const u = used.get(g);
      if (!u) return true;
      const side = groupSide(g, c.p.id, data);
      return side !== null && side === u.side;
    });

  const valid = () =>
    picked.every((c) => {
      const r = c.p.requires;
      if (!r) return true;
      const available = r.anyOf.filter((id) => eligibleIds.has(id));
      if (available.length === 0) return r.waivedIfUnavailable;
      return picked.some((x) => available.includes(x.p.id));
    });

  const walk = (i: number, total: number) => {
    if (i === choice.length) {
      if (total > bestTotal && valid()) {
        bestTotal = total;
        best = [...picked];
      }
      return;
    }
    const c = choice[i];
    const gs = groupsOf(c);
    if (canTake(c, gs)) {
      for (const g of gs) {
        const u = used.get(g) ?? { side: groupSide(g, c.p.id, data), n: 0 };
        u.n += 1;
        used.set(g, u);
      }
      picked.push(c);
      walk(i + 1, total + c.amount);
      picked.pop();
      for (const g of gs) {
        const u = used.get(g)!;
        u.n -= 1;
        if (u.n === 0) used.delete(g);
      }
    }
    walk(i + 1, total);
  };
  walk(0, 0);

  const chosen = [...free, ...best].sort((a, b) => candidates.indexOf(a) - candidates.indexOf(b));
  return { chosen, total: chosen.reduce((s, c) => s + c.amount, 0) };
}

function excluded(p: Programme, reason: ExclusionReason, more: L10n | undefined, extra: Partial<ExcludedLine> = {}, amount = 0): ExcludedLine {
  return {
    id: p.id,
    label: p.name,
    payer: p.payerName,
    amount,
    reason,
    reasonText: more ? detail(reasonText[reason], more) : reasonText[reason],
    sources: p.sources,
    confidence: p.confidence,
    ...extra,
  };
}

const PROMO_RULE: Record<NonNullable<DealerPromo['windowBasis']>, L10n> = {
  plate: t('新車須在這天以前領好牌（車廠看的是領牌日，只開發票不算）。', 'The new scooter must be plated by this date (the maker counts the plate date; an invoice alone is not enough).'),
  invoice: t('以發票日為準：須在這天以前開立發票。', 'The invoice date counts: invoice by then.'),
  order: t('須在這天以前下訂並付款。', 'Order and pay by then.'),
  unknown: t('優惠在這天結束；官方沒有寫以發票日還是領牌日為準，請先問車行。', 'The offer ends that day; it does not say whether the invoice or the plate date counts, so ask the dealer.'),
};
const PROMO_BASIS: Record<NonNullable<DealerPromo['windowBasis']>, DeadlineBasis> = { plate: 'plate', invoice: 'invoice', order: 'order', unknown: 'dealer-unknown' };

export function promoDeadline(pr: DealerPromo, s: Situation): LineDeadline {
  const basis = pr.windowBasis ?? 'unknown';
  const days = daysBetween(s.date as string, pr.validTo);
  const scrapRule = pr.scrapBy
    ? t(`要報廢的機車也須在 ${date(pr.scrapBy)['zh-TW']}以前完成報廢。`, `The scooter you are replacing must also be scrapped by ${date(pr.scrapBy).en}.`)
    : undefined;
  return { date: pr.validTo, daysLeft: days, lastDay: days === 0, basis: PROMO_BASIS[basis], rule: scrapRule ? join(PROMO_RULE[basis], scrapRule) : PROMO_RULE[basis] };
}

const DEFAULT_RULE = t('這天以前要買好車。', 'Buy by this date.');

/** The date that decides a programme line, and what must be done by then. */
export function programmeDeadline(p: Programme, s: Situation): LineDeadline {
  const confirmedOnly = Boolean(p.confirmedThrough && cmp(p.confirmedThrough, p.validTo) < 0);
  const on = confirmedOnly ? earlier(p.validTo, p.confirmedThrough as string) : p.validTo;
  const days = daysBetween(s.date as string, on);
  const rule = confirmedOnly
    ? join(
        t(`官方表列到 ${date(p.validTo)['zh-TW']}，但它所依據的補助辦法只確定到這一天；要確定拿得到，請在這天以前辦好。`, `Listed to ${date(p.validTo).en}, but the rule it rests on is only confirmed to this date: to be sure of it, complete it by then.`),
        p.validToRule ?? t('', ''),
      )
    : (p.validToRule ?? DEFAULT_RULE);
  return { date: on, daysLeft: days, lastDay: days === 0, basis: confirmedOnly ? 'confirmed-only' : 'purchase', rule };
}

function promoLine(pr: DealerPromo, s: Situation): LedgerLine {
  return {
    id: pr.id,
    kind: 'dealer',
    label: pr.name,
    payer: t('車廠或經銷商', 'Manufacturer or dealer'),
    amount: pr.amount,
    ruleAmount: pr.amount,
    isMaximum: false,
    conditionText: pr.conditionText,
    paid: pr.paid,
    validTo: pr.validTo,
    daysLeft: daysBetween(s.date as string, pr.validTo),
    deadline: promoDeadline(pr, s),
    sources: pr.sources,
    confidence: pr.confidence,
    ...(pr.note ? { note: pr.note } : {}),
  };
}

export interface LedgerInternals {
  ledger: PurchaseLedger;
  /** Assumptions taken by the conditions of counted lines. */
  assumptions: L10n[];
  /** Upside if the conservative groups were not applied, per group id, with the member lines involved. */
  upside: { group: string; amount: number; ids: string[] }[];
  /**
   * Lines excluded because a rule is unclear for this buyer (reason 'ambiguous'): what the buyer
   * would get on top if they do qualify, worked out with the either/or groups applied.
   */
  ambiguousUpside: { amount: number; ids: string[]; why: L10n[] } | null;
  /** Dealer offers counted only with scrapping although the offer does not say so: possible upside. */
  promoUpside: { id: string; amount: number; label: L10n; note: L10n; sources: SourceId[] }[];
  /** Advisory groups with more than one counted member: the amount at risk if only one can be claimed. */
  atRisk: { group: string; amount: number; ids: string[] }[];
}

export function purchaseLedger(side: 'electric' | 'gasoline', input: Situation, data: EconDataset): LedgerInternals {
  const s: Situation = input.date ? input : { ...input, date: todayInTaiwan() };
  const ev = side === 'electric' ? data.evModels.find((m) => m.id === s.electricModel) : undefined;
  const gas = side === 'gasoline' ? data.gasModels.find((m) => m.id === s.gasolineModel) : undefined;
  const model = ev ?? gas;
  if (!model) throw new Error(`[calc] Unknown ${side} model "${side === 'electric' ? s.electricModel : s.gasolineModel}"`);
  if (model.calculator !== true) throw new Error(`[calc] Model "${model.id}" is not available in the calculator: ${model.calculator.excluded.en}`);

  const messages: Message[] = [];
  const lines: LedgerLine[] = [];
  const exclusions: ExcludedLine[] = [];
  const assumptions: L10n[] = [];

  // --- starting price ---------------------------------------------------------------------
  const published = model.listPrice.value;
  const plateIns = gas?.plateInsuranceIncluded?.value ?? 0;
  const listPrice = {
    value: published - plateIns,
    published,
    sources: [...model.listPrice.sources, ...(gas?.plateInsuranceIncluded?.sources ?? [])].filter((x, i, a) => a.indexOf(x) === i),
    confidence: model.listPrice.confidence === 'secondary' || gas?.plateInsuranceIncluded?.confidence === 'secondary' ? ('secondary' as const) : model.listPrice.confidence,
    ...(gas?.plateInsuranceIncluded?.note ? { note: gas.plateInsuranceIncluded.note } : model.listPrice.note ? { note: model.listPrice.note } : {}),
  };

  // --- programmes: who is eligible ----------------------------------------------------------
  const remoteDistricts = data.jurisdictions[s.jurisdiction]?.remoteDistricts;
  const ctx = (p: Programme): EligibilityContext => ({ s, side, ev, gas, programmeJurisdiction: p.jurisdiction, remoteDistricts });
  const candidates: Candidate[] = [];
  const unclear: { p: Programme; why: L10n }[] = [];
  const relevant = data.programmes.filter((p) => sideMatches(p, side) && (p.jurisdiction === 'central' || p.jurisdiction === s.jurisdiction));
  const goodsTaxScrapOk = side === 'gasoline' && relevant.some((p) => p.id === 'gas-goods-tax-scrap' && checkAll(p.conditions, ctx(p)).ok && cmp(s.date as string, p.validTo) <= 0);

  for (const p of relevant) {
    const r = checkAll(p.conditions, ctx(p));
    const nominal = programmeAmount(p, ev, gas) ?? 0;
    // Money that is used up is used up for everyone: say so, rather than the first condition this
    // buyer misses (which would suggest that ticking a box or waiting would bring it back).
    const inWindow = cmp(s.date as string, p.validFrom) >= 0 && cmp(s.date as string, p.validTo) <= 0 && !(p.confirmedThrough && cmp(s.date as string, p.confirmedThrough) > 0);
    if (!r.ok && r.failed !== 'applicant-deadline' && p.calculator === true && inWindow && p.quota.status === 'exhausted' && cmp(s.date as string, p.quota.asOf) >= 0) {
      exclusions.push(excluded(p, 'quota-exhausted', p.quota.text, {}, nominal));
      continue;
    }
    if (!r.ok) {
      if (r.failed === 'applicant-deadline') {
        // e.g. MOEA: foreign nationals had to apply by 10 December 2026.
        exclusions.push({ ...excluded(p, 'expired', undefined, { failedCondition: r.failed }, nominal), reasonText: detail(t('已過申請期限', 'Application deadline passed'), r.why) });
        continue;
      }
      exclusions.push(excluded(p, r.missing ? 'needs-answer' : r.ambiguous ? (r.failed === 'domestic-cells' ? 'model-unknown' : 'ambiguous') : 'not-eligible', r.why, { failedCondition: r.failed }, nominal));
      if (r.ambiguous && r.failed !== 'domestic-cells') unclear.push({ p, why: r.why });
      continue;
    }
    if (p.calculator !== true) {
      exclusions.push(excluded(p, p.calculator.reason, p.calculator.excluded, {}, nominal));
      continue;
    }
    if (ev && ev.moeaListed !== 'yes' && (p.payer === 'moea' || p.payer === 'local')) {
      exclusions.push(
        excluded(p, 'model-unknown', t('無法確認這款車在經濟部認可車款清單上，經濟部與多數縣市補助都要求是認可車款', 'we could not confirm this model is on the MOEA approved list, which the MOEA and most local subsidies require'), { failedCondition: 'moea-listed' }, nominal),
      );
      continue;
    }
    if (cmp(s.date as string, p.validFrom) < 0) {
      exclusions.push(excluded(p, 'not-yet-valid', t(`自 ${date(p.validFrom)['zh-TW']}起`, `from ${date(p.validFrom).en}`), {}, nominal));
      continue;
    }
    if (cmp(s.date as string, p.validTo) > 0) {
      exclusions.push(excluded(p, 'expired', t(`購車期限為 ${date(p.validTo)['zh-TW']}`, `purchases had to be made by ${date(p.validTo).en}`), {}, nominal));
      continue;
    }
    if (p.confirmedThrough && cmp(s.date as string, p.confirmedThrough) > 0) {
      exclusions.push(excluded(p, 'unconfirmed', p.status2027, {}, nominal));
      continue;
    }
    if (p.quota.status === 'exhausted' && cmp(s.date as string, p.quota.asOf) >= 0) {
      exclusions.push(excluded(p, 'quota-exhausted', p.quota.text, {}, nominal));
      continue;
    }
    const amount = programmeAmount(p, ev, gas);
    if (amount === null) {
      exclusions.push(excluded(p, 'model-unknown', t('這款車的電池數量未能查證', 'the battery count of this model is not verified'), {}, 0));
      continue;
    }
    candidates.push({ p, amount, assumptions: r.assumptions });
  }

  // --- selection ------------------------------------------------------------------------------
  const sel = select(candidates, data, s.jurisdiction);
  const chosenIds = new Set(sel.chosen.map((c) => c.p.id));
  for (const c of candidates) {
    if (chosenIds.has(c.p.id)) continue;
    const live = (ids: string[] | undefined) => liveGroups(ids, data, s.jurisdiction);
    const sharing = sel.chosen.filter((x) => live(x.p.exclusiveGroups).some((g) => live(c.p.exclusiveGroups).includes(g) && conflicts(g, x.p.id, c.p.id, data)));
    if (sharing.length) {
      const sharedGroup = live(c.p.exclusiveGroups).find((g) => sharing.some((x) => live(x.p.exclusiveGroups).includes(g) && conflicts(g, x.p.id, c.p.id, data)));
      const group = sharedGroup ? data.groups[sharedGroup] : undefined;
      exclusions.push(
        excluded(c.p, 'mutually-exclusive', join(list(sharing.map((x) => x.p.name)), group ? t(`（${group.label['zh-TW']}）`, `(${group.label.en})`) : t('', '')), { instead: sharing.map((x) => x.p.id) }, c.amount),
      );
    } else if (c.p.requires) {
      exclusions.push(excluded(c.p, 'requirement-not-met', c.p.requires.text, {}, c.amount));
    } else {
      exclusions.push(excluded(c.p, 'mutually-exclusive', undefined, {}, c.amount));
    }
  }

  // Upside under the generous reading of each conservative group that bound.
  const upside: { group: string; amount: number; ids: string[] }[] = [];
  for (const g of Object.values(data.groups).filter((x) => x.conservative)) {
    const generous = select(candidates, data, s.jurisdiction, new Set([g.id]));
    const diff = generous.total - sel.total;
    if (diff > 0) upside.push({ group: g.id, amount: diff, ids: candidates.filter((c) => (c.p.exclusiveGroups ?? []).includes(g.id)).map((c) => c.p.id) });
  }

  // Ambiguous rules: what the buyer would get on top if the unclear lines did apply. Only lines
  // that would otherwise count (in the calculator, inside their window, quota not gone).
  const unclearCands: Candidate[] = unclear
    .filter(({ p }) => p.calculator === true && cmp(s.date as string, p.validFrom) >= 0 && cmp(s.date as string, p.validTo) <= 0 && !(p.confirmedThrough && cmp(s.date as string, p.confirmedThrough) > 0) && !(p.quota.status === 'exhausted' && cmp(s.date as string, p.quota.asOf) >= 0) && !(ev && ev.moeaListed !== 'yes' && (p.payer === 'moea' || p.payer === 'local')))
    .flatMap(({ p }) => {
      const amount = programmeAmount(p, ev, gas);
      return amount === null ? [] : [{ p, amount, assumptions: [] }];
    });
  let ambiguousUpside: LedgerInternals['ambiguousUpside'] = null;
  if (unclearCands.length) {
    const generous = select([...candidates, ...unclearCands], data, s.jurisdiction);
    const diff = generous.total - sel.total;
    const gained = generous.chosen.filter((c) => unclearCands.includes(c));
    if (diff > 0 && gained.length) {
      const seen = new Set<string>();
      const why = gained.map((c) => unclear.find((u) => u.p.id === c.p.id)!.why).filter((w) => (seen.has(w.en) ? false : (seen.add(w.en), true)));
      ambiguousUpside = { amount: diff, ids: gained.map((c) => c.p.id), why };
    }
  }

  // Advisory groups: all members counted, the smaller ones reported as at risk.
  const atRisk: { group: string; amount: number; ids: string[] }[] = [];
  for (const g of Object.values(data.groups).filter((x) => x.advisory)) {
    const members = sel.chosen.filter((c) => (c.p.exclusiveGroups ?? []).includes(g.id));
    if (members.length > 1) {
      const risky = g.atRiskIds ? members.filter((m) => g.atRiskIds!.includes(m.p.id)) : [...members].sort((a, b) => b.amount - a.amount).slice(1);
      const amount = risky.reduce((a, c) => a + c.amount, 0);
      if (amount > 0 && risky.length < members.length) atRisk.push({ group: g.id, amount, ids: members.map((m) => m.p.id) });
    }
  }

  // --- dealer promotions -------------------------------------------------------------------
  const promoUpside: LedgerInternals['promoUpside'] = [];
  for (const pr of model.promos) {
    const before = cmp(s.date as string, pr.validFrom) < 0;
    if (before || cmp(s.date as string, pr.validTo) > 0) {
      const from = date(pr.validFrom);
      const to = date(pr.validTo);
      exclusions.push({
        id: pr.id,
        label: pr.name,
        payer: t('車廠或經銷商', 'Manufacturer or dealer'),
        amount: pr.amount,
        reason: before ? 'not-yet-valid' : 'expired',
        reasonText: before
          ? detail(reasonText['not-yet-valid'], t(`優惠期間為 ${from['zh-TW']}至 ${to['zh-TW']}`, `the offer runs ${from.en} to ${to.en}`))
          : detail(t('優惠已結束', 'Offer has ended'), t(`優惠期間為 ${from['zh-TW']}至 ${to['zh-TW']}`, `the offer ran ${from.en} to ${to.en}`)),
        sources: pr.sources,
        confidence: pr.confidence,
      });
      continue;
    }
    if (pr.notIn?.jurisdictions.includes(s.jurisdiction)) {
      exclusions.push({
        id: pr.id,
        label: pr.name,
        payer: t('車廠或經銷商', 'Manufacturer or dealer'),
        amount: pr.amount,
        reason: 'not-eligible',
        reasonText: detail(reasonText['not-eligible'], pr.notIn.why),
        failedCondition: 'region',
        sources: pr.sources,
        confidence: pr.confidence,
      });
      continue;
    }
    if (pr.when === 'goods-tax-scrap' && !goodsTaxScrapOk) {
      const unclear = Boolean(pr.ambiguousScrap) && !s.scrap;
      exclusions.push({
        id: pr.id,
        label: pr.name,
        payer: t('車廠或經銷商', 'Manufacturer or dealer'),
        amount: pr.amount,
        reason: unclear ? 'ambiguous' : 'not-eligible',
        reasonText: unclear
          ? detail(reasonText.ambiguous, pr.conditionText)
          : detail(reasonText['not-eligible'], t('須汰舊並通過貨物稅汰舊換新核定', 'requires scrapping with an approved goods-tax scrap-and-replace claim')),
        failedCondition: 'scrap',
        sources: pr.sources,
        confidence: pr.confidence,
      });
      if (unclear) promoUpside.push({ id: pr.id, amount: pr.amount, label: pr.name, note: pr.conditionText, sources: pr.sources });
      continue;
    }
    lines.push(promoLine(pr, s));
  }

  // --- programme lines ---------------------------------------------------------------------
  for (const c of sel.chosen) {
    const p = c.p;
    assumptions.push(...c.assumptions);
    lines.push({
      id: p.id,
      kind: kindOf(p),
      label: p.name,
      payer: p.payerName,
      amount: c.amount,
      ruleAmount: c.amount,
      isMaximum: p.amount.kind === 'fixed' && Boolean(p.amount.isMaximum),
      conditionText: p.conditionText,
      paid: 'after-approval',
      validTo: p.validTo,
      daysLeft: daysBetween(s.date as string, p.validTo),
      ...(p.confirmedThrough ? { confirmedThrough: p.confirmedThrough } : {}),
      deadline: programmeDeadline(p, s),
      ...(p.applicationDeadline ? { applicationDeadline: p.applicationDeadline } : {}),
      ...(p.documentsDeadline ? { documentsDeadline: p.documentsDeadline } : {}),
      ...(p.applicationNote ? { applicationNote: p.applicationNote } : {}),
      quota: p.quota,
      status2027: p.status2027,
      ...(p.note ? { note: p.note } : {}),
      sources: p.sources,
      confidence: p.confidence,
    });
  }

  // Goods-tax cuts are applied on the invoice, not refunded later.
  for (const l of lines) if (l.kind === 'tax') l.paid = 'at-purchase';

  // --- caps: payouts never exceed the price paid ---------------------------------------------
  const invoice = listPrice.value - lines.filter((l) => l.kind === 'dealer' && l.paid === 'at-purchase').reduce((a, l) => a + l.amount, 0);
  const progById = new Map(data.programmes.map((p) => [p.id, p]));
  const govLines = () => lines.filter((l) => l.kind !== 'dealer');
  const reduce = (target: LedgerLine[], excess: number) => {
    for (const l of [...target].reverse()) {
      if (excess <= 0) break;
      const cut = Math.min(l.amount, excess);
      if (cut > 0) {
        l.cappedFrom = l.cappedFrom ?? l.amount;
        l.amount -= cut;
        excess -= cut;
      }
    }
  };
  const localJur = s.jurisdiction;
  const localLines = govLines().filter((l) => progById.get(l.id)?.jurisdiction === localJur);
  const caps = new Set(localLines.map((l) => progById.get(l.id)?.cap).filter(Boolean));
  if (caps.has('local-total-at-most-price')) {
    const sum = localLines.reduce((a, l) => a + l.amount, 0);
    if (sum > invoice) reduce(localLines, sum - invoice);
  }
  if (caps.has('all-government-at-most-price')) {
    const sum = govLines().reduce((a, l) => a + l.amount, 0);
    if (sum > invoice) {
      const others = govLines().filter((l) => !localLines.includes(l));
      reduce([...others, ...localLines], sum - invoice);
    }
  }
  // Global guard: the net price is never negative.
  const totalNow = lines.reduce((a, l) => a + l.amount, 0);
  if (totalNow > listPrice.value) reduce(lines, totalNow - listPrice.value);
  for (const l of lines) {
    if (l.cappedFrom !== undefined) {
      l.note = join(
        l.note ?? t('', ''),
        t(`（受「補助不超過購車金額」上限限制，由${ntd(l.cappedFrom)['zh-TW']}降為${ntd(l.amount)['zh-TW']}。）`, `(Reduced from ${ntd(l.cappedFrom).en} to ${ntd(l.amount).en} by the rule that payouts cannot exceed the purchase price.)`),
      );
    }
  }

  const totalDeductions = lines.reduce((a, l) => a + l.amount, 0);
  const maxLines = lines.filter((l) => l.isMaximum).reduce((a, l) => a + l.amount, 0);
  const net = { value: listPrice.value - totalDeductions, high: listPrice.value - totalDeductions + maxLines };

  const ledger: PurchaseLedger = {
    side,
    model: { id: model.id, name: model.name, brand: model.brand },
    listPrice,
    lines,
    excluded: exclusions,
    totalDeductions,
    net,
    paidLater: lines.filter((l) => l.paid === 'after-approval').reduce((a, l) => a + l.amount, 0),
    messages,
  };
  return { ledger, assumptions, upside, atRisk, promoUpside, ambiguousUpside };
}
