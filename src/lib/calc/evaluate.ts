// The main entry point: evaluate one situation end to end, and rank the available options.

import type { EconDataset, EnergyPlan, EvModel, GasModel } from '../../data/econ/types.ts';
import { addMonths, cmp, daysBetween, normalise } from './dates.ts';
import { breakEven as classify, cumulative, scanInterval, series } from './compare.ts';
import { purchaseLedger } from './purchase.ts';
import { electricRunning, gasolineRunning } from './running.ts';
import { date, join, list, n, ntd, t } from './text.ts';
import type { L10n } from './text.ts';
import type { BestOptions, Comparison, Evaluation, LedgerLine, Message, Option, Situation } from './types.ts';

const severityOrder = { critical: 0, warning: 1, info: 2 } as const;

/** Share of swaps outside free windows assumed for the middle estimate when the buyer does not say. */
export const DEFAULT_OFF_WINDOW_SHARE = 0.5;

function likeForLike(ev: EvModel, gas: GasModel): Comparison['likeForLike'] {
  if (ev.plateClass !== 'heavy' || ev.comparableTo125 === 'no') {
    return {
      verdict: 'different-class',
      note: t(
        `${ev.name['zh-TW']}：${ev.performance.text['zh-TW']}和${gas.displacementCc}cc燃油機車比價時，比的不是同級車；價差較小，部分原因是買的車比較小。`,
        `${ev.name.en}: ${ev.performance.text.en} Against a ${gas.displacementCc}cc gasoline scooter this is not a like-for-like comparison; part of any price advantage comes from buying a smaller vehicle.`,
      ),
    };
  }
  if (ev.comparableTo125 === 'unverified') {
    return {
      verdict: 'same-class-performance-unverified',
      note: t(
        `${ev.name['zh-TW']}和${gas.displacementCc}cc燃油機車同屬普通重型（白牌），但我們沒有可查證的性能數據可以確認兩者相當。`,
        `${ev.name.en} and the ${gas.displacementCc}cc gasoline scooter are both in the heavy (white-plate) class, but we have no verified performance figures to confirm they are equivalent.`,
      ),
    };
  }
  return { verdict: 'like-for-like', note: t('兩者同級。', 'The two are in the same class.') };
}

function uniqueText(items: L10n[]): L10n[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.en) ? false : (seen.add(i.en), true)));
}

function groupBy<T>(xs: T[], key: (x: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const x of xs) m.set(key(x), [...(m.get(key(x)) ?? []), x]);
  return m;
}

/** Evaluate a situation. `data` defaults to the published dataset (pass a fixture in tests). */
export function evaluate(input: Situation, data: EconDataset): Evaluation {
  const horizon = input.horizonMonths ?? data.meta.horizonMonths;
  const offWindowShare = Math.min(1, Math.max(0, input.offWindowShare ?? DEFAULT_OFF_WINDOW_SHARE));
  const s: Evaluation['situation'] = { ...input, date: normalise(input.date), horizonMonths: horizon, offWindowShare, monthlyKm: Math.max(0, input.monthlyKm) };
  const jur = data.jurisdictions[s.jurisdiction];
  if (!jur) throw new Error(`[calc] Unknown jurisdiction "${s.jurisdiction}"`);
  const ev = data.evModels.find((m) => m.id === s.electricModel);
  const gas = data.gasModels.find((m) => m.id === s.gasolineModel);
  const plan = data.plans.find((p) => p.id === s.energyPlan);
  if (!ev || !gas || !plan) throw new Error('[calc] Unknown model or plan');

  const evP = purchaseLedger('electric', s, data);
  const gasP = purchaseLedger('gasoline', s, data);
  const evR = electricRunning(s, data, horizon, offWindowShare);
  const gasR = gasolineRunning(s, data, horizon);
  const ser = series(evP.ledger.net, gasP.ledger.net.value, evR, gasR);

  // Parity mileages (typical values).
  const runAt = (km: number) => {
    const k = { ...s, monthlyKm: km };
    return { e: electricRunning(k, data, horizon, offWindowShare), g: gasolineRunning(k, data, horizon) };
  };
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const runningParityKm = scanInterval((km) => {
    const r = runAt(km);
    return sum(r.e.schedule.typical) + r.e.upfront - sum(r.g.schedule.typical);
  });
  const totalParity = scanInterval((km) => {
    const r = runAt(km);
    return evP.ledger.net.value + r.e.upfront + sum(r.e.schedule.typical) - (gasP.ledger.net.value + sum(r.g.schedule.typical));
  });

  // Without the temporary pump-price smoothing.
  const base = data.fuel.petrol95.value;
  const unsm = gasolineRunning(s, data, horizon, base + data.fuel.smoothing.typical);
  const unsmHigh = gasolineRunning(s, data, horizon, base + data.fuel.smoothing.high);
  const unsmBreakEven = classify(ser.raw.e.typical, cumulative(gasP.ledger.net.value, unsm.schedule.typical));

  const comparison: Comparison = {
    purchaseGap: evP.ledger.net.value - gasP.ledger.net.value,
    purchaseGapHigh: evP.ledger.net.high - gasP.ledger.net.value,
    likeForLike: likeForLike(ev, gas),
    cumulative: { months: ser.months, electric: ser.electric, gasoline: ser.gasoline },
    breakEven: ser.breakEven,
    breakEvenRange: { best: ser.best, worst: ser.worst },
    runningParityKm,
    totalParityKm: totalParity,
    withoutSmoothing: {
      gasolineMonthly: unsm.monthly.typical,
      gasolineMonthlyHigh: unsmHigh.monthly.typical,
      breakEven: unsmBreakEven,
    },
  };

  const messages = buildMessages({ s, data, jur, ev, gas, plan, evP, gasP, evR, gasR, comparison, unsmMonthly: unsm.monthly.typical });
  evP.ledger.messages = messages.filter((m) => m.about?.some((id) => evP.ledger.lines.some((l) => l.id === id) || evP.ledger.excluded.some((x) => x.id === id)));
  gasP.ledger.messages = messages.filter((m) => m.about?.some((id) => gasP.ledger.lines.some((l) => l.id === id) || gasP.ledger.excluded.some((x) => x.id === id)));

  return {
    situation: s,
    jurisdiction: { id: jur.id, name: jur.name, status: jur.status, statusNote: jur.statusNote, officialLinks: jur.officialLinks },
    electric: { purchase: evP.ledger, running: evR },
    gasoline: { purchase: gasP.ledger, running: gasR },
    comparison,
    messages,
    dataCheckedOn: data.meta.checkedOn,
  };
}

interface Ctx {
  s: Evaluation['situation'];
  data: EconDataset;
  jur: EconDataset['jurisdictions'][keyof EconDataset['jurisdictions']];
  ev: EvModel;
  gas: GasModel;
  plan: EnergyPlan;
  evP: ReturnType<typeof purchaseLedger>;
  gasP: ReturnType<typeof purchaseLedger>;
  evR: Evaluation['electric']['running'];
  gasR: Evaluation['gasoline']['running'];
  comparison: Comparison;
  unsmMonthly: number;
}

function buildMessages(c: Ctx): Message[] {
  const { s, data, jur, ev, gas, plan, evP, gasP, comparison } = c;
  const out: Message[] = [];
  const push = (m: Message) => out.push(m);
  const ended = cmp(s.date, data.meta.programmeYearEnd) > 0;
  const lines = [...evP.ledger.lines, ...gasP.ledger.lines];
  const excludedAll = [...evP.ledger.excluded, ...gasP.ledger.excluded];
  const names = (ls: { label: L10n }[]) => list(uniqueText(ls.map((l) => l.label)));

  // Programmes over.
  if (ended) {
    push({
      code: 'programmes-ended',
      severity: 'critical',
      text: join(
        t(
          `2026年的電動機車補助已在${date(data.meta.programmeYearEnd)['zh-TW']}結束。資料最後查證日（${date(data.meta.checkedOn)['zh-TW']}）時，尚未有2027年方案獲得確認，所以試算不列入任何2027年補助。`,
          `The 2026 electric scooter subsidies ended on ${date(data.meta.programmeYearEnd).en}. When the data was last checked (${date(data.meta.checkedOn).en}) no 2027 programme had been confirmed, so no 2027 subsidy is counted.`,
        ),
        data.meta.nextYear,
      ),
    });
  }

  // Jurisdiction status.
  if (jur.status === 'not-verified') {
    push({
      code: 'jurisdiction-not-verified',
      severity: 'warning',
      text: join(t(`${jur.name['zh-TW']}的地方補助未能查證，試算只計中央補助。`, `${jur.name.en}'s local subsidy could not be verified, so only central money is counted.`), jur.statusNote),
      links: jur.officialLinks,
    });
  } else if (jur.status === 'partly-verified') {
    push({ code: 'jurisdiction-partly-verified', severity: 'info', text: jur.statusNote, links: jur.officialLinks });
  }

  // Deadlines for counted lines (purchase windows).
  if (!ended) {
    const sides: [L10n, LedgerLine[]][] = [
      [t('電動機車', 'Electric'), evP.ledger.lines],
      [t('燃油機車', 'Gasoline'), gasP.ledger.lines],
    ];
    for (const [sideLabel, sideLines] of sides) {
      for (const [validTo, ls] of groupBy(sideLines.filter((l) => l.daysLeft >= 0), (l) => l.validTo)) {
        const days = ls[0].daysLeft;
        if (days > 120) continue;
        push({
          code: 'deadline',
          severity: days <= 45 ? 'warning' : 'info',
          text: t(
            `${sideLabel['zh-TW']}：距離${date(validTo)['zh-TW']}還有${days}天，${names(ls)['zh-TW']}須在這天以前完成購車（以發票日為準）。`,
            `${sideLabel.en}: ${days} days left until ${date(validTo).en}, the purchase (invoice date) deadline for ${names(ls).en}.`,
          ),
          about: ls.map((l) => l.id),
        });
      }
    }
    for (const [deadline, ls] of groupBy(lines.filter((l) => l.applicationDeadline), (l) => l.applicationDeadline as string)) {
      push({
        code: 'application-deadline',
        severity: 'info',
        text: t(`申請期限${date(deadline)['zh-TW']}：${names(ls)['zh-TW']}。`, `Application deadline ${date(deadline).en}: ${names(ls).en}.`),
        about: ls.map((l) => l.id),
      });
    }
    const moea = lines.filter((l) => l.id.startsWith('moea-'));
    if (moea.length) {
      const late = cmp(s.date, '2026-12-10') > 0;
      push({
        code: 'moea-filing',
        severity: 'warning',
        text: late
          ? t(
              '經濟部補助入口網要求外籍人士在2026年12月10日前申請，Gogoro也只代辦到12月10日；這個日期已過，請先向經銷商確認還能否申請經濟部補助。',
              'The MOEA portal asked foreign nationals to apply by 10 December 2026 and Gogoro filed only until 10 December; that date has passed, so check with the dealer whether the MOEA subsidy can still be claimed.',
            )
          : t(
              '經濟部補助入口網要求外籍人士在2026年12月10日前申請，Gogoro也只代辦到12月10日；即使購車期限是12月31日，也建議在12月10日前送件。',
              'The MOEA portal asks foreign nationals to apply by 10 December 2026, and Gogoro files only until 10 December; even though purchases run to 31 December, file by 10 December.',
            ),
        about: moea.map((l) => l.id),
        sources: ['meid-lev-subsidy-portal', 'gogoro-2026-lastcall-promo'],
      });
    }
  }

  // Expired / unconfirmed / exhausted lines that the buyer would otherwise get.
  const expiredProgrammes = excludedAll.filter((x) => x.reason === 'expired' && data.programmes.some((p) => p.id === x.id));
  if (expiredProgrammes.length && !ended) {
    push({ code: 'expired', severity: 'warning', text: t(`這些補助已過購車期限：${names(expiredProgrammes)['zh-TW']}。`, `These subsidies have closed for purchases: ${names(expiredProgrammes).en}.`), about: expiredProgrammes.map((x) => x.id) });
  }
  const unconfirmed = excludedAll.filter((x) => x.reason === 'unconfirmed');
  if (unconfirmed.length) {
    push({
      code: 'unconfirmed',
      severity: 'info',
      text: t(
        `${names(unconfirmed)['zh-TW']}在官方表上列到2027年底，但環境部的汰舊換新補助辦法只確認延長到2026年底，所以不計入；若2027年仍受理，可再多領。`,
        `${names(unconfirmed).en} ${unconfirmed.length === 1 ? 'is' : 'are'} listed to the end of 2027, but the MOENV scrap-and-replace rule is only confirmed to the end of 2026, so ${unconfirmed.length === 1 ? 'it is' : 'they are'} not counted; if still accepted in 2027 you could get more.`,
      ),
      about: unconfirmed.map((x) => x.id),
    });
  }
  const exhausted = excludedAll.filter((x) => x.reason === 'quota-exhausted');
  if (exhausted.length) {
    const p = data.programmes.find((x) => x.id === exhausted[0].id);
    push({
      code: 'quota-exhausted',
      severity: 'warning',
      text: join(t(`名額或經費已用完，未計入：${names(exhausted)['zh-TW']}。`, `Quota or budget used up, not counted: ${names(exhausted).en}.`), p?.quota.text ?? t('', '')),
      about: exhausted.map((x) => x.id),
      sources: p?.quota.sources ?? p?.sources,
    });
  }

  // Quota pressure on counted lines.
  for (const l of lines) {
    const q = l.quota;
    if (!q) continue;
    if (q.status === 'nearly-exhausted' || (q.remaining !== undefined && q.remaining <= 500)) {
      push({
        code: 'quota-low',
        severity: 'warning',
        text: join(t(`${l.label['zh-TW']}名額所剩不多。`, `Few places left for ${l.label.en}.`), q.text, t('名額會隨申請減少，請先上官網確認。', 'Places fall as people apply; check the official site first.')),
        about: [l.id],
        sources: q.sources,
      });
    }
  }
  const unknownQuota = lines.filter((l) => l.quota && (l.quota.status === 'unknown' || (l.quota.status === 'limited' && l.quota.remaining === undefined)));
  if (unknownQuota.length) {
    push({
      code: 'quota-unknown',
      severity: 'info',
      text: t(`這些項目的剩餘名額或經費無法確認，依申請順序可能用完：${names(unknownQuota)['zh-TW']}。`, `Remaining places or funds could not be confirmed for: ${names(unknownQuota).en}. They are paid in order of application and may run out.`),
      about: unknownQuota.map((l) => l.id),
    });
  }

  // "Up to" amounts.
  const maxLines = evP.ledger.lines.filter((l) => l.isMaximum);
  if (maxLines.length) {
    push({
      code: 'up-to-amounts',
      severity: 'warning',
      text: t(
        `${names(maxLines)['zh-TW']}是公告的「最高」金額，實際可能較少；實付價格可能介於${ntd(evP.ledger.net.value)['zh-TW']}到${ntd(evP.ledger.net.high)['zh-TW']}之間。`,
        `${names(maxLines).en}: published as maximums ("up to"), so you may get less; the price you pay could be anywhere from ${ntd(evP.ledger.net.value).en} to ${ntd(evP.ledger.net.high).en}.`,
      ),
      about: maxLines.map((l) => l.id),
      amount: evP.ledger.net.high - evP.ledger.net.value,
    });
  }

  // Ambiguities resolved conservatively.
  for (const u of evP.upside) {
    const g = data.groups[u.group];
    if (!g?.ambiguity) continue;
    push({ code: 'ambiguity', severity: 'info', text: join(g.ambiguity, t(`（約${ntd(u.amount)['zh-TW']}）`, `(about ${ntd(u.amount).en})`)), amount: u.amount, sources: g.sources, about: [u.group] });
  }
  const moeaValid = evP.ledger.lines.some((l) => l.id.startsWith('moea-new'));
  if (moeaValid && ev.moeaClass === 'light-unknown') {
    push({
      code: 'ambiguity',
      severity: 'info',
      text: t(
        `無法確認${ev.name['zh-TW']}是普通輕型第1級還是第2級，經濟部補助先以5,100元計；若是第1級，補助為7,000元，可多1,900元。`,
        `We could not confirm whether ${ev.name.en} is 普通輕型 level 1 or 2, so the MOEA subsidy is counted at NT$5,100; if it is level 1 it is NT$7,000, NT$1,900 more.`,
      ),
      amount: 1900,
      about: ['moea-new-5100'],
      sources: ['meid-lev-2026-subsidy-table'],
    });
  }
  const cells = evP.ledger.excluded.find((x) => x.id === 'moea-domestic-cells' && x.reason === 'model-unknown');
  if (cells) {
    push({
      code: 'ambiguity',
      severity: 'info',
      text: t('哪些車款適用經濟部國產電池芯加碼3,000元未能查證，試算不計入；若你的車款符合，可再多3,000元。', 'Which models get the MOEA NT$3,000 Taiwan-made cell bonus could not be checked, so it is not counted; if your model qualifies you get NT$3,000 more.'),
      amount: 3000,
      about: ['moea-domestic-cells'],
      sources: ['meid-lev-subsidy-portal'],
    });
  }
  if (gasP.ledger.lines.some((l) => l.id === 'gas-goods-tax-scrap')) {
    push({
      code: 'ambiguity',
      severity: 'info',
      text: t(
        '燃油機車這邊同時扣了新購2,000元與汰舊換新的貨物稅減徵（車廠官方優惠也這樣算）；財政部網頁沒有寫兩者可以相加，若不能，燃油機車會貴2,000元，電動機車相對更划算。',
        'The gasoline side deducts both the NT$2,000 new-purchase and the scrap-and-replace goods-tax cuts (as the manufacturers\' official offers do); the MOF page does not say they add up. If they do not, the gasoline scooter costs NT$2,000 more and electric looks better.',
      ),
      amount: 2000,
      about: ['gas-goods-tax-scrap', 'gas-goods-tax-new-2000'],
      sources: ['etax-goods-tax-scooter-cut', 'kymco-goods-tax-models'],
    });
  }

  // Assumptions.
  const assumptions = uniqueText([...evP.assumptions, ...gasP.assumptions]);
  if (plan.usage.kind === 'time-window') {
    assumptions.push(
      t(
        `${plan.name['zh-TW']}的中間估計假設${Math.round(s.offWindowShare * 100)}%的換電在免費時段外（沒有資料顯示一般騎士的比例）；低估計假設全部在免費時段內，高估計假設全部在時段外`,
        `The middle estimate for ${plan.name.en} assumes ${Math.round(s.offWindowShare * 100)}% of swaps are outside the free windows (no data shows what is typical); the low estimate assumes all are inside, the high estimate that all are outside`,
      ),
    );
  }
  const trimEnd = (x: string) => x.replace(/[。.；;]+$/, '');
  if (assumptions.length) push({ code: 'assumption', severity: 'info', text: t(assumptions.map((a) => trimEnd(a['zh-TW'])).join('；') + '。', assumptions.map((a) => trimEnd(a.en)).join('; ') + '.') });

  // Secondary inputs used.
  const secondary: L10n[] = [];
  if (ev.listPrice.confidence === 'secondary') secondary.push(t(`${ev.name['zh-TW']}售價`, `${ev.name.en} price`));
  if (ev.moeaClassBasis.confidence === 'secondary' && moeaValid) secondary.push(t(`${ev.name['zh-TW']}的經濟部補助等級（推算）`, `${ev.name.en} MOEA class (inferred)`));
  if (ev.battery.basis.confidence === 'secondary') secondary.push(t(`${ev.name['zh-TW']}的電池數量`, `${ev.name.en} battery count`));
  if (gasP.ledger.listPrice.confidence === 'secondary') secondary.push(t(`${gas.name['zh-TW']}售價或牌險扣除`, `${gas.name.en} price or plate-insurance adjustment`));
  if (plan.setupFee?.confidence === 'secondary') secondary.push(t(`${plan.name['zh-TW']}設定費`, `${plan.name.en} setup fee`));
  if (plan.confidence === 'secondary') secondary.push(t(`${plan.name['zh-TW']}電價`, `${plan.name.en} tariff`));
  secondary.push(t('保養費估計', 'maintenance estimates'), t('實際油耗下限（每公升45公里）', 'real-world fuel economy (45 km/L)'), t('強制險金額（兩邊相同）', 'compulsory insurance (same on both sides)'));
  for (const l of lines) if (l.confidence === 'secondary') secondary.push(l.label);
  push({
    code: 'secondary-input',
    severity: 'warning',
    text: t(`以下數字依據次級來源（媒體報導、部落格或本站推算），沒有更可靠的官方數字可用：${list(uniqueText(secondary))['zh-TW']}。`, `These inputs rest on secondary sources (media, blogs or our own arithmetic) because no verified figure was available: ${list(uniqueText(secondary)).en}.`),
  });

  // Like-for-like.
  if (comparison.likeForLike.verdict !== 'like-for-like') {
    push({ code: 'like-for-like', severity: comparison.likeForLike.verdict === 'different-class' ? 'warning' : 'info', text: comparison.likeForLike.note });
  }

  // Petrol smoothing.
  const fuelNow = c.gasR.items.find((i) => i.id === 'energy')?.monthly.typical ?? 0;
  const fuelDelta = c.unsmMonthly - c.gasR.monthly.typical;
  const be = (b: Comparison['breakEven']): L10n =>
    b.kind === 'breaks-even'
      ? t(`第${b.month}個月打平`, `break-even at month ${b.month}`)
      : b.kind === 'ev-ahead'
        ? t('電動機車一開始就較便宜', 'electric is cheaper from the start')
        : b.kind === 'gas-catches-up'
          ? t(`燃油機車第${b.month}個月追上`, `gasoline catches up at month ${b.month}`)
          : t('五年內不會打平', 'no break-even within five years');
  push({
    code: 'petrol-smoothing',
    severity: 'info',
    text: join(
      data.fuel.smoothing.mechanism,
      t(
        `以每月${n(s.monthlyKm)}公里計，這台燃油機車每月油錢約${ntd(fuelNow)['zh-TW']}；若平穩措施取消（每公升多${data.fuel.smoothing.typical}元），每月總開銷多約${ntd(fuelDelta)['zh-TW']}。沒有平穩措施時的結果：${be(comparison.withoutSmoothing.breakEven)['zh-TW']}（目前：${be(comparison.breakEven)['zh-TW']}）。`,
        `At ${n(s.monthlyKm)} km a month this gasoline scooter uses about ${ntd(fuelNow).en} of fuel; if the smoothing ended (NT$${data.fuel.smoothing.typical} more per litre) it would cost about ${ntd(fuelDelta).en} more a month. Result without smoothing: ${be(comparison.withoutSmoothing.breakEven).en} (now: ${be(comparison.breakEven).en}).`,
      ),
    ),
    amount: Math.round(fuelDelta),
    sources: data.fuel.smoothing.sources,
  });

  // EV road fee from 2030 (expected, not law).
  const horizonEnd = addMonths(s.date, s.horizonMonths);
  const levyStart = `${data.fees.roadFeeElectric.expectedFromYear}-01-01`;
  if (cmp(horizonEnd, levyStart) > 0) {
    const from = cmp(s.date, levyStart) > 0 ? s.date : levyStart;
    const months = Math.max(0, Math.round(daysBetween(from, horizonEnd) / 30.44));
    const rate = data.fees.roadFeeGasoline.find((b) => b.upToCc === 125)?.perYear.value ?? 450;
    const extra = Math.round((rate / 12) * months);
    push({
      code: 'ev-road-fee',
      severity: 'info',
      text: join(data.fees.roadFeeElectric.futureNote, t(`若比照125cc燃油機車每年${n(rate)}元，試算期內電動機車約多付${ntd(extra)['zh-TW']}（未計入）。`, `If charged at the 125cc rate of NT$${n(rate)} a year, electric would pay about ${ntd(extra).en} more within the horizon (not counted).`)),
      amount: extra,
      sources: data.fees.roadFeeElectric.sources,
    });
  }

  // Dealer promotions that have ended.
  const promoGone = excludedAll.filter((x) => x.reason === 'expired' && !data.programmes.some((p) => p.id === x.id));
  if (promoGone.length) {
    push({
      code: 'dealer-promo-expired',
      severity: 'warning',
      text: t(
        `車廠優惠已結束：${names(promoGone)['zh-TW']}。之後的優惠在資料查證時尚未公布，試算以建議售價計算，門市實際價格可能較低。`,
        `Manufacturer offers have ended: ${names(promoGone).en}. Later offers had not been published when the data was checked, so the list price is used; the shop price may be lower.`,
      ),
      about: promoGone.map((x) => x.id),
    });
  }

  // Fair-use limits on unlimited plans.
  if (plan.usage.kind === 'time-window' && plan.usage.fairUseUnits) {
    const units = s.monthlyKm / ev.efficiency.typical;
    if (units >= plan.usage.fairUseUnits * 0.8) {
      push({
        code: 'plan-lock-in',
        severity: 'warning',
        text: t(
          `以每月${n(s.monthlyKm)}公里估計約用${n(units)}安時，接近或超過${plan.name['zh-TW']}的${n(plan.usage.fairUseUnits)}安時商業使用門檻，可能被要求改用其他方案。`,
          `At ${n(s.monthlyKm)} km a month you would use about ${n(units)} Ah, close to or above the ${n(plan.usage.fairUseUnits)} Ah commercial-use threshold of ${plan.name.en}; you may be moved to another plan.`,
        ),
        sources: plan.sources,
      });
    }
  }

  // Plan lock-in.
  if (plan.lockInMonths) {
    push({ code: 'plan-lock-in', severity: 'info', text: join(t(`${plan.name['zh-TW']}綁約${plan.lockInMonths}個月。`, `${plan.name.en} has a ${plan.lockInMonths}-month contract.`), plan.terms), sources: plan.sources });
  }

  // Cash flow: subsidies paid after approval.
  if (evP.ledger.paidLater > 0) {
    push({
      code: 'payout-timing',
      severity: 'info',
      text: t(
        `其中${ntd(evP.ledger.paidLater)['zh-TW']}是購車後提出申請、核准後才匯入帳戶的補助，購車當下可能要先付較高金額；經銷商代辦的方式各家不同。`,
        `${ntd(evP.ledger.paidLater).en} of the subsidies are claimed after purchase and paid into your account once approved, so you may need to pay more at the shop first; dealer arrangements vary.`,
      ),
      amount: evP.ledger.paidLater,
    });
  }

  if (plan.system === 'home') push({ code: 'electricity-review', severity: 'info', text: data.electricity.reviewNote, sources: data.electricity.sources });

  // Most severe first, stable otherwise.
  return out.map((m, i) => ({ m, i })).sort((a, b) => severityOrder[a.m.severity] - severityOrder[b.m.severity] || a.i - b.i).map((x) => x.m);
}

/** Rank every available electric model + plan for a situation. */
export function bestOptions(base: Omit<Situation, 'electricModel' | 'energyPlan'>, data: EconDataset): BestOptions {
  const options: Option[] = [];
  let first: Evaluation | null = null;
  for (const m of data.evModels) {
    if (m.calculator !== true) continue;
    for (const pid of m.plans) {
      const p = data.plans.find((x) => x.id === pid);
      if (!p || p.calculator !== true) continue;
      const e = evaluate({ ...base, electricModel: m.id, energyPlan: p.id } as Situation, data);
      first = first ?? e;
      const H = e.comparison.cumulative.months.length - 1;
      const total = e.comparison.cumulative.electric[H];
      const gasTotal = e.comparison.cumulative.gasoline[H];
      options.push({
        electricModel: m.id,
        energyPlan: p.id,
        modelName: m.name,
        planName: p.name,
        plateClass: m.plateClass,
        likeForLike: e.comparison.likeForLike.verdict,
        netPrice: e.electric.purchase.net.value,
        netPriceHigh: e.electric.purchase.net.high,
        purchaseGap: e.comparison.purchaseGap,
        fiveYearTotal: total,
        fiveYearGap: total.typical - gasTotal.typical,
        breakEven: e.comparison.breakEven,
        usesSecondaryInputs:
          m.listPrice.confidence === 'secondary' || p.setupFee?.confidence === 'secondary' || p.confidence === 'secondary' || m.battery.basis.confidence === 'secondary' || e.electric.purchase.lines.some((l: LedgerLine) => l.confidence === 'secondary'),
      });
    }
  }
  const byNet = [...options].sort((a, b) => a.netPrice - b.netPrice || a.fiveYearTotal.typical - b.fiveYearTotal.typical);
  const byTotal = [...options].sort((a, b) => a.fiveYearTotal.typical - b.fiveYearTotal.typical || a.netPrice - b.netPrice);
  const closest = [...options].sort((a, b) => a.purchaseGap - b.purchaseGap)[0] ?? null;
  const closestLfl = [...options].filter((o) => o.likeForLike !== 'different-class').sort((a, b) => a.purchaseGap - b.purchaseGap)[0] ?? null;
  const H = first ? first.comparison.cumulative.months.length - 1 : 0;
  return {
    gasolineModel: base.gasolineModel,
    gasolineNet: first?.gasoline.purchase.net.value ?? 0,
    gasolineFiveYearTotal: first ? first.comparison.cumulative.gasoline[H] : { low: 0, typical: 0, high: 0 },
    byNetPrice: byNet,
    byFiveYearTotal: byTotal,
    closestToParity: closest,
    closestToParityLikeForLike: closestLfl,
    messages: first ? first.messages.filter((m) => ['programmes-ended', 'jurisdiction-not-verified', 'jurisdiction-partly-verified', 'quota-exhausted', 'dealer-promo-expired', 'petrol-smoothing'].includes(m.code)) : [],
  };
}
