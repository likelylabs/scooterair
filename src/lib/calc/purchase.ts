// Purchase ledgers: list price, dealer promotions, every applicable programme as its own line,
// and every considered-but-excluded programme with the reason.
//
// Selection: among eligible programmes, at most one per either/or group is counted, and a
// programme that `requires` another counts only if that one is taken (when it is available).
// We pick the combination worth the most to the buyer. Groups marked `conservative` encode our
// cautious reading of an ambiguous rule; we also solve without them and report the difference.

import type { DealerPromo, EconDataset, EvModel, GasModel, Programme } from '../../data/econ/types.ts';
import { cmp, daysBetween } from './dates.ts';
import { checkAll, type EligibilityContext } from './eligibility.ts';
import { date, detail, join, list, ntd, reasonText, t } from './text.ts';
import type { L10n } from './text.ts';
import type { ExcludedLine, ExclusionReason, LedgerLine, LineKind, Message, PurchaseLedger, Situation } from './types.ts';

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
    return Boolean(group) && !ignore.has(g) && (!group.jurisdictions || group.jurisdictions.some((j) => j === jurisdiction));
  });
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
  const used = new Set<string>();

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
    if (gs.every((g) => !used.has(g))) {
      gs.forEach((g) => used.add(g));
      picked.push(c);
      walk(i + 1, total + c.amount);
      picked.pop();
      gs.forEach((g) => used.delete(g));
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
    daysLeft: daysBetween(s.date, pr.validTo),
    sources: pr.sources,
    confidence: pr.confidence,
    ...(pr.note ? { note: pr.note } : {}),
  };
}

export interface LedgerInternals {
  ledger: PurchaseLedger;
  /** Assumptions taken by the conditions of counted lines. */
  assumptions: L10n[];
  /** Upside if the conservative groups were not applied, per group id. */
  upside: { group: string; amount: number }[];
}

export function purchaseLedger(side: 'electric' | 'gasoline', s: Situation, data: EconDataset): LedgerInternals {
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
  const ctx = (p: Programme): EligibilityContext => ({ s, side, ev, gas, programmeJurisdiction: p.jurisdiction });
  const candidates: Candidate[] = [];
  const relevant = data.programmes.filter((p) => sideMatches(p, side) && (p.jurisdiction === 'central' || p.jurisdiction === s.jurisdiction));
  const goodsTaxScrapOk = side === 'gasoline' && relevant.some((p) => p.id === 'gas-goods-tax-scrap' && checkAll(p.conditions, ctx(p)).ok && cmp(s.date, p.validTo) <= 0);

  for (const p of relevant) {
    const r = checkAll(p.conditions, ctx(p));
    const nominal = programmeAmount(p, ev, gas) ?? 0;
    if (!r.ok) {
      exclusions.push(excluded(p, r.ambiguous ? (r.failed === 'domestic-cells' ? 'model-unknown' : 'ambiguous') : 'not-eligible', r.why, { failedCondition: r.failed }, nominal));
      continue;
    }
    if (p.calculator !== true) {
      exclusions.push(excluded(p, p.calculator.reason, p.calculator.excluded, {}, nominal));
      continue;
    }
    if (cmp(s.date, p.validFrom) < 0) {
      exclusions.push(excluded(p, 'not-yet-valid', t(`自${date(p.validFrom)['zh-TW']}起`, `from ${date(p.validFrom).en}`), {}, nominal));
      continue;
    }
    if (cmp(s.date, p.validTo) > 0) {
      exclusions.push(excluded(p, 'expired', t(`購車期限為${date(p.validTo)['zh-TW']}`, `purchases had to be made by ${date(p.validTo).en}`), {}, nominal));
      continue;
    }
    if (p.confirmedThrough && cmp(s.date, p.confirmedThrough) > 0) {
      exclusions.push(excluded(p, 'unconfirmed', p.status2027, {}, nominal));
      continue;
    }
    if (p.quota.status === 'exhausted' && cmp(s.date, p.quota.asOf) >= 0) {
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
    const sharing = sel.chosen.filter((x) => live(x.p.exclusiveGroups).some((g) => live(c.p.exclusiveGroups).includes(g)));
    if (sharing.length) {
      const sharedGroup = live(c.p.exclusiveGroups).find((g) => sharing.some((x) => live(x.p.exclusiveGroups).includes(g)));
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
  const upside: { group: string; amount: number }[] = [];
  for (const g of Object.values(data.groups).filter((x) => x.conservative)) {
    const generous = select(candidates, data, s.jurisdiction, new Set([g.id]));
    const diff = generous.total - sel.total;
    if (diff > 0) upside.push({ group: g.id, amount: diff });
  }

  // --- dealer promotions -------------------------------------------------------------------
  for (const pr of model.promos) {
    if (cmp(s.date, pr.validFrom) < 0 || cmp(s.date, pr.validTo) > 0) {
      exclusions.push({
        id: pr.id,
        label: pr.name,
        payer: t('車廠或經銷商', 'Manufacturer or dealer'),
        amount: pr.amount,
        reason: cmp(s.date, pr.validFrom) < 0 ? 'not-yet-valid' : 'expired',
        reasonText: detail(reasonText.expired, t(`優惠期間${date(pr.validFrom)['zh-TW']}至${date(pr.validTo)['zh-TW']}`, `offer ran ${date(pr.validFrom).en} to ${date(pr.validTo).en}`)),
        sources: pr.sources,
        confidence: pr.confidence,
      });
      continue;
    }
    if (pr.when === 'goods-tax-scrap' && !goodsTaxScrapOk) {
      exclusions.push({
        id: pr.id,
        label: pr.name,
        payer: t('車廠或經銷商', 'Manufacturer or dealer'),
        amount: pr.amount,
        reason: 'not-eligible',
        reasonText: detail(reasonText['not-eligible'], t('須汰舊並通過貨物稅汰舊換新核定', 'requires scrapping with an approved goods-tax scrap-and-replace claim')),
        failedCondition: 'scrap',
        sources: pr.sources,
        confidence: pr.confidence,
      });
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
      daysLeft: daysBetween(s.date, p.validTo),
      ...(p.applicationDeadline ? { applicationDeadline: p.applicationDeadline } : {}),
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
  return { ledger, assumptions, upside };
}
