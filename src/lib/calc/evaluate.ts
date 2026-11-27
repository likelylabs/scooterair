// The main entry point: evaluate one situation end to end, and rank the available options.

import type { EconDataset, EnergyPlan, EvModel, GasModel } from '../../data/econ/types.ts';
import { incomeLevels } from '../../data/econ/types.ts';
import { addMonths, cmp, daysBetween, evaluationDate, fullYears, isCalendarDate, normalise, todayInTaiwan } from './dates.ts';
import { breakEven as classify, cumulative, scanIntervals, series } from './compare.ts';
import { purchaseLedger, select as selectProgrammes } from './purchase.ts';
import { checkAll } from './eligibility.ts';
import { electricRunning, gasolineRunning } from './running.ts';
import { electricTotals, gasolineTotals, parityFunction, SCAN_MAX_KM, SCAN_STEP } from './parity.ts';
import { date, horizonText, join, list, lowerFirst, n, ntd, t } from './text.ts';
import type { L10n } from './text.ts';
import { CalcInputError } from './types.ts';
import type { BestOptions, Comparison, Evaluation, Household, InputIssue, LedgerLine, Message, Option, Situation, SourceId } from './types.ts';

const severityOrder = { critical: 0, warning: 1, info: 2 } as const;

/** Share of swaps outside free windows assumed for the middle estimate when the buyer does not say. */
export const DEFAULT_OFF_WINDOW_SHARE = 0.5;
/** A published quota this small, with the remaining count unchecked, is treated as possibly gone. */
export const SMALL_QUOTA = 500;
/** Past this many days after the data was checked, the result says prices and quotas may have changed. */
export const STALE_AFTER_DAYS = 45;
const MAX_HORIZON = 240;
const MAX_MONTHLY_KM = 20000;

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const issue = (field: string, code: InputIssue['code'], zh: string, en: string): InputIssue => ({ field, code, message: t(zh, en) });

function checkNumber(out: InputIssue[], field: string, v: unknown, rule: { min?: number; minExclusive?: number; max?: number; integer?: boolean }, label: [string, string]) {
  if (typeof v !== 'number' || Number.isNaN(v)) return out.push(issue(field, 'not-a-number', `請填${label[0]}（一個數字）`, `Please enter ${lowerFirst(label[1])} (a number)`));
  if (!Number.isFinite(v)) return out.push(issue(field, 'not-finite', `${label[0]}必須是有限的數字`, `${label[1]} must be a finite number`));
  if (rule.integer && !Number.isInteger(v)) return out.push(issue(field, 'not-integer', `${label[0]}必須是整數`, `${label[1]} must be a whole number`));
  if (rule.minExclusive !== undefined && v <= rule.minExclusive) return out.push(issue(field, v < 0 ? 'negative' : 'not-positive', `${label[0]}要大於 ${rule.minExclusive}`, `${label[1]} must be more than ${rule.minExclusive}`));
  if (rule.min !== undefined && v < rule.min) return out.push(issue(field, v < 0 ? 'negative' : 'out-of-range', `${label[0]}不能小於${rule.min}`, `${label[1]} must be at least ${rule.min}`));
  if (rule.max !== undefined && v > rule.max) return out.push(issue(field, 'out-of-range', `${label[0]}不能大於${n(rule.max)}`, `${label[1]} must be at most ${n(rule.max)}`));
  return 0;
}

function checkDate(out: InputIssue[], field: string, v: unknown, allowMonth = false) {
  if (v === undefined) return;
  if (!isCalendarDate(v, allowMonth)) out.push(issue(field, 'bad-date', `${field}不是有效的日期（格式為YYYY-MM-DD）`, `${field} is not a valid calendar date (YYYY-MM-DD)`));
}

/**
 * Every problem with a situation's input, or [] when it is valid. evaluate() and bestOptions()
 * throw a CalcInputError carrying this list, so a page can show each problem next to its field.
 */
export function validateSituation(input: Partial<Situation>, data: EconDataset, opts: { requireModels?: boolean } = {}): InputIssue[] {
  const out: InputIssue[] = [];
  const requireModels = opts.requireModels ?? true;
  if (!input || typeof input !== 'object') return [issue('situation', 'missing', '缺少計算條件', 'the situation is missing')];
  if (!input.jurisdiction || !data.jurisdictions[input.jurisdiction]) out.push(issue('jurisdiction', 'unknown-id', `不認得的縣市「${String(input.jurisdiction)}」`, `unknown jurisdiction "${String(input.jurisdiction)}"`));
  checkNumber(out, 'monthlyKm', input.monthlyKm, { minExclusive: 0, max: MAX_MONTHLY_KM }, ['每個月大約騎幾公里', 'The distance you ride a month']);
  if (input.horizonMonths !== undefined) checkNumber(out, 'horizonMonths', input.horizonMonths, { min: 1, max: MAX_HORIZON, integer: true }, ['計算月數', 'The number of months to work out']);
  if (input.offWindowShare !== undefined) checkNumber(out, 'offWindowShare', input.offWindowShare, { min: 0, max: 1 }, ['免費時段外換電的比例', 'The share of swaps outside the free windows']);
  if (input.date !== undefined) {
    try {
      evaluationDate(input.date);
    } catch {
      out.push(issue('date', 'bad-date', `日期「${String(input.date)}」無效（格式為YYYY-MM-DD）`, `Bad date "${String(input.date)}": not a valid calendar date (YYYY-MM-DD)`));
    }
  }
  const h = input.household;
  if (h !== undefined && h !== null && typeof h !== 'object') out.push(issue('household', 'missing', '家戶資料格式不對', 'household must be an object'));
  if (h && typeof h === 'object') {
    if (h.age !== undefined) checkNumber(out, 'household.age', h.age, { min: 0, max: 120, integer: true }, ['年齡', 'Your age']);
    if (h.income !== undefined && !incomeLevels.includes(h.income)) out.push(issue('household.income', 'unknown-id', `不認得的收入別「${String(h.income)}」`, `unknown income level "${String(h.income)}"`));
    checkDate(out, 'household.residentSince', h.residentSince);
  }
  const sc = input.scrap;
  if (sc !== undefined && sc !== null) {
    if (typeof sc !== 'object') out.push(issue('scrap', 'missing', '要報廢機車的資料格式不對', 'scrap must be an object or null'));
    else {
      if (sc.engine !== 'two-stroke' && sc.engine !== 'four-stroke') out.push(issue('scrap.engine', 'unknown-id', '要報廢的機車須是二行程或四行程', 'scrap.engine must be two-stroke or four-stroke'));
      checkDate(out, 'scrap.builtOn', sc.builtOn ?? '', true);
      // A scooter cannot be scrapped before it is built (the form offers every month of this year).
      if (isCalendarDate(sc.builtOn, true) && (input.date === undefined || isCalendarDate(input.date))) {
        const on = input.date ?? todayInTaiwan();
        const built = normalise(sc.builtOn);
        const builtMonth = sc.builtOn.length === 7 ? `${sc.builtOn}-01` : built;
        if (cmp(builtMonth, on) > 0) out.push(issue('scrap.builtOn', 'out-of-range', '要報廢的機車出廠日期不能晚於今天', 'the build date of the scooter you scrap cannot be later than today'));
      }
      if (sc.displacementCc !== undefined) checkNumber(out, 'scrap.displacementCc', sc.displacementCc, { minExclusive: 0, max: 2000 }, ['要報廢機車的排氣量', 'The engine size of the scooter you scrap']);
      checkDate(out, 'scrap.registeredLocallySince', sc.registeredLocallySince);
    }
  }
  const gas = data.gasModels.find((m) => m.id === input.gasolineModel);
  if (!gas) out.push(issue('gasolineModel', 'unknown-id', `不認得的燃油機車款「${String(input.gasolineModel)}」`, `Unknown model or plan: gasoline model "${String(input.gasolineModel)}"`));
  else if (gas.calculator !== true) out.push(issue('gasolineModel', 'unknown-id', `「${gas.id}」不在計算中：${gas.calculator.excluded['zh-TW']}`, `Model "${gas.id}" is not available in the calculator: ${gas.calculator.excluded.en}`));
  if (requireModels) {
    const ev = data.evModels.find((m) => m.id === input.electricModel);
    const plan = data.plans.find((p) => p.id === input.energyPlan);
    if (!ev) out.push(issue('electricModel', 'unknown-id', `不認得的電動車款「${String(input.electricModel)}」`, `Unknown model or plan: electric model "${String(input.electricModel)}"`));
    else if (ev.calculator !== true) out.push(issue('electricModel', 'unknown-id', `「${ev.id}」不在計算中：${ev.calculator.excluded['zh-TW']}`, `Model "${ev.id}" is not available in the calculator: ${ev.calculator.excluded.en}`));
    if (!plan) out.push(issue('energyPlan', 'unknown-id', `不認得的方案「${String(input.energyPlan)}」`, `Unknown model or plan: energy plan "${String(input.energyPlan)}"`));
    else if (plan.calculator !== true) out.push(issue('energyPlan', 'unknown-id', `方案「${plan.id}」不在計算中`, `Plan "${plan.id}" is not available in the calculator`));
    else if (ev && !ev.plans.includes(plan.id)) out.push(issue('energyPlan', 'unknown-id', `方案「${plan.id}」不適用車款「${ev.id}」`, `Plan "${plan.id}" does not fit model "${ev.id}"`));
  }
  return out;
}

/** The situation with defaults filled in: Taiwan date, horizon, off-window share, household. */
function prepare(input: Situation, data: EconDataset): Evaluation['situation'] {
  const issues = validateSituation(input, data);
  if (issues.length) throw new CalcInputError(issues);
  return {
    ...input,
    household: (input.household ?? {}) as Household,
    date: evaluationDate(input.date ?? todayInTaiwan()),
    horizonMonths: input.horizonMonths ?? data.meta.horizonMonths,
    offWindowShare: input.offWindowShare ?? DEFAULT_OFF_WINDOW_SHARE,
  };
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

function likeForLike(ev: EvModel, gas: GasModel): Comparison['likeForLike'] {
  if (ev.plateClass !== 'heavy' || ev.comparableTo125 === 'no') {
    // short sentences; the class sentence is left out when the performance text already says it
    const saysZh = ev.performance.text['zh-TW'].includes('不是同一級');
    const saysEn = ev.performance.text.en.includes('like-for-like');
    return {
      verdict: 'different-class',
      note: t(
        `${ev.name['zh-TW']}：${ev.performance.text['zh-TW']}${saysZh ? '' : `它和 ${gas.displacementCc}cc 燃油機車不是同一級的車。`}如果電動機車比較便宜，有一部分是因為買的車比較小。`,
        `${ev.name.en}: ${ev.performance.text.en}${saysEn ? '' : ` It is not a like-for-like comparison with a ${gas.displacementCc}cc petrol scooter.`} Part of any price advantage comes from buying a smaller vehicle.`,
      ),
    };
  }
  if (ev.comparableTo125 === 'unverified') {
    return {
      verdict: 'same-class-performance-unverified',
      note: t(
        `${ev.name['zh-TW']}和${gas.displacementCc}cc燃油機車同屬普通重型（白牌），但我們沒有可查證的性能數據可以確認兩者相當。`,
        `${ev.name.en} and the ${gas.displacementCc}cc petrol scooter are both in the heavy (white-plate) class, but we have no verified performance figures to confirm they are equivalent.`,
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
  const s = prepare(input, data);
  const horizon = s.horizonMonths;
  const offWindowShare = s.offWindowShare;
  const jur = data.jurisdictions[s.jurisdiction];
  const ev = data.evModels.find((m) => m.id === s.electricModel)!;
  const gas = data.gasModels.find((m) => m.id === s.gasolineModel)!;
  const plan = data.plans.find((p) => p.id === s.energyPlan)!;

  const evP = purchaseLedger('electric', s, data);
  const gasP = purchaseLedger('gasoline', s, data);
  const evR = electricRunning(s, data, horizon, offWindowShare);
  const gasR = gasolineRunning(s, data, horizon);
  const ser = series(evP.ledger.net, gasP.ledger.net.value, evR, gasR);

  // Parity mileages (typical values), from cached numbers-only totals (parity.ts). The setup fee
  // does not depend on distance, so it is the one from this result.
  const eT = electricTotals(ev, plan, s.date, data, horizon, offWindowShare);
  const gT = gasolineTotals(gas, data, horizon);
  const upE = evR.upfront;
  const evNet = evP.ledger.net.value;
  const gasNet = gasP.ledger.net.value;
  const runningParityIntervals = scanIntervals(
    parityFunction(eT, gT, (e, g) => e + upE - g),
    SCAN_MAX_KM,
    SCAN_STEP,
  );
  const totalParityIntervals = scanIntervals(
    parityFunction(eT, gT, (e, g) => evNet + upE + e - (gasNet + g)),
    SCAN_MAX_KM,
    SCAN_STEP,
  );

  // Without the temporary pump-price smoothing (same month-0 baseline as the main series).
  const base = data.fuel.petrol95.value;
  const unsm = gasolineRunning(s, data, horizon, base + data.fuel.smoothing.typical);
  const unsmHigh = gasolineRunning(s, data, horizon, base + data.fuel.smoothing.high);
  const unsmBreakEven = classify(ser.raw.e.typical, cumulative(gasP.ledger.net.value + gasR.upfront, unsm.schedule.typical));

  const comparison: Comparison = {
    purchaseGap: evP.ledger.net.value - gasP.ledger.net.value,
    purchaseGapHigh: evP.ledger.net.high - gasP.ledger.net.value,
    likeForLike: likeForLike(ev, gas),
    cumulative: { months: ser.months, electric: ser.electric, gasoline: ser.gasoline },
    breakEven: ser.breakEven,
    breakEvenRange: { best: ser.best, worst: ser.worst },
    runningParityKm: runningParityIntervals[0] ?? null,
    totalParityKm: totalParityIntervals[0] ?? null,
    runningParityIntervals,
    totalParityIntervals,
    withoutSmoothing: {
      gasolineMonthly: unsm.monthly.typical,
      gasolineMonthlyHigh: unsmHigh.monthly.typical,
      breakEven: unsmBreakEven,
    },
  };

  const messages = buildMessages({ s, data, jur, ev, gas, plan, evP, gasP, evR, gasR, comparison, unsmMonthly: unsm.monthly.typical });
  const about = (ledger: typeof evP.ledger) => (m: Message) => m.about?.some((id) => ledger.lines.some((l) => l.id === id) || ledger.excluded.some((x) => x.id === id));
  evP.ledger.messages = messages.filter(about(evP.ledger));
  gasP.ledger.messages = messages.filter(about(gasP.ledger));

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

/** The break-even answer in a sentence fragment, for the horizon it was worked out over. */
export function breakEvenPhrase(b: Comparison['breakEven'], horizonMonths: number): L10n {
  const h = horizonText(b.horizonMonths ?? horizonMonths);
  const back = (b.crossings?.length ?? 0) > 1;
  switch (b.kind) {
    case 'breaks-even':
      return back
        ? t(`第${b.month}個月打平（之前曾短暫交錯）`, `break-even at month ${b.month} (after the lines crossed back and forth)`)
        : t(`第${b.month}個月打平`, `break-even at month ${b.month}`);
    case 'gas-catches-up':
      return back
        ? t(`燃油機車第${b.month}個月追上（之前曾短暫交錯）`, `petrol catches up at month ${b.month} (after the lines crossed back and forth)`)
        : t(`燃油機車第${b.month}個月追上`, `petrol catches up at month ${b.month}`);
    case 'ev-ahead':
      if (back) return t(`電動機車買時較便宜，${h['zh-TW']}後總花費仍較低（中間有幾個月較貴）`, `electric is cheaper to buy and still cheaper in total after ${h.en} (dearer for a few months in between)`);
      return b.runningCheaper === false
        ? t(`電動機車買時較便宜；騎起來較貴，但${h['zh-TW']}內總花費仍較低`, `electric is cheaper to buy; it costs more to run but stays cheaper in total over ${h.en}`)
        : t('電動機車一開始就較便宜', 'electric is cheaper from the start');
    case 'no-break-even': {
      const gap = ntd(b.gapAtHorizon);
      return (b.crossings?.length ?? 0) > 0
        ? t(`第${b.crossings![0]}個月曾一度打平，但${h['zh-TW']}後仍貴${gap['zh-TW']}`, `briefly even at month ${b.crossings![0]}, but ${gap.en} dearer after ${h.en}`)
        : t(`${h['zh-TW']}內不會打平`, `no break-even within ${h.en}`);
    }
  }
}

function buildMessages(c: Ctx): Message[] {
  const { s, data, jur, ev, gas, plan, evP, gasP, comparison } = c;
  const today = s.date;
  const out: Message[] = [];
  const push = (m: Message) => out.push(m);
  const ended = cmp(today, data.meta.programmeYearEnd) > 0;
  const lines = [...evP.ledger.lines, ...gasP.ledger.lines];
  const excludedAll = [...evP.ledger.excluded, ...gasP.ledger.excluded];
  const names = (ls: { label: L10n }[]) => list(uniqueText(ls.map((l) => l.label)));
  const SIDE = { electric: t('電動機車', 'Electric'), gasoline: t('燃油機車', 'Petrol') } as const;
  const sided = (side: 'electric' | 'gasoline', text: L10n) => t(`${SIDE[side]['zh-TW']}：${text['zh-TW']}`, `${SIDE[side].en}: ${lowerFirst(text.en)}`);
  const isGogoro = ev.brand.en === 'Gogoro';

  // Programmes over.
  if (ended) {
    push({
      code: 'programmes-ended',
      severity: 'critical',
      text: join(
        t(
          `2026 年的電動機車補助已在 ${date(data.meta.programmeYearEnd)['zh-TW']}結束。資料最後查證日（${date(data.meta.checkedOn)['zh-TW']}）時，尚未有 2027 年方案獲得確認，所以計算不列入任何 2027 年補助。`,
          `The 2026 electric scooter subsidies ended on ${date(data.meta.programmeYearEnd).en}. When the data was last checked (${date(data.meta.checkedOn).en}) no 2027 programme had been confirmed, so no 2027 subsidy is counted.`,
        ),
        data.meta.nextYear,
      ),
      sources: ['chinatimes-2026-11-moenv-draft', 'meid-lev-subsidy-portal'],
    });
  }

  // How old the data is on this date.
  const age = daysBetween(data.meta.checkedOn, today);
  if (age > STALE_AFTER_DAYS) {
    push({
      code: 'stale-data',
      severity: 'warning',
      text: t(
        `價格、優惠、名額與方案資料是在 ${date(data.meta.checkedOn)['zh-TW']}查證的，比這個日期早${n(age)}天，之後可能已有變動；請以官方最新公告為準。`,
        `Prices, offers, quotas and programmes were checked on ${date(data.meta.checkedOn).en}, ${n(age)} days before this date, and may have changed since; check the latest official notices.`,
      ),
    });
  }

  // Jurisdiction status.
  if (jur.status === 'not-verified') {
    push({
      code: 'jurisdiction-not-verified',
      severity: 'warning',
      text: join(
        ended
          ? t(`${jur.name['zh-TW']}的地方補助沒有查證到；2026 年方案結束後，計算不計任何補助。`, `${jur.name.en}'s local subsidy could not be verified; after the 2026 programmes ended no subsidy is counted.`)
          : t(`${jur.name['zh-TW']}的地方補助沒有查證到，計算只計中央補助。`, `${jur.name.en}'s local subsidy could not be verified, so only central money is counted.`),
        jur.statusNote,
      ),
      links: jur.officialLinks,
    });
  } else if (jur.status === 'partly-verified') {
    push({ code: 'jurisdiction-partly-verified', severity: 'info', text: jur.statusNote, links: jur.officialLinks });
  }

  // Deadlines for counted lines and plan credits: the date that decides each, and what is due then.
  if (!ended) {
    type Due = { id: string; label: L10n; date: string; daysLeft: number; basis: string; rule: L10n };
    const dues = (side: 'electric' | 'gasoline'): Due[] => {
      const ls = side === 'electric' ? evP.ledger.lines : gasP.ledger.lines;
      const fromLines = ls.filter((l) => l.deadline).map((l) => ({ id: l.id, label: l.label, ...l.deadline! }));
      const credits =
        side === 'electric'
          ? c.evR.planCredits.applied.map((x) => ({
              id: x.id,
              label: x.name,
              date: x.validTo,
              daysLeft: daysBetween(today, x.validTo),
              basis: 'plan-credit',
              rule: x.rule ?? t('優惠在這天結束。', 'The offer ends that day.'),
            }))
          : [];
      return [...fromLines, ...credits].filter((d) => d.daysLeft >= 0 && d.daysLeft <= 120);
    };
    // One message per side and date; within it, one item per rule, for the lines it applies to.
    // The date only, never a count of days: a countdown may stand only beside the reader's city
    // status in a result where electric really comes out level or ahead (the page's verdict A
    // panel fills it), and never on the gasoline side, where it would hurry a purchase along.
    for (const side of ['electric', 'gasoline'] as const) {
      for (const [, ds] of groupBy(dues(side), (d) => d.date)) {
        const d = ds[0];
        const on = date(d.date);
        const items = [...groupBy(ds, (x) => x.rule.en).values()].map((rs) => t(`${names(rs)['zh-TW']}：${rs[0].rule['zh-TW']}`, `${names(rs).en}: ${lowerFirst(rs[0].rule.en)}`));
        const head =
          side === 'electric'
            ? t(`電動機車：期限是 ${on['zh-TW']}。`, `Electric: the deadline is ${on.en}.`)
            : t(`燃油機車：下面這些優惠或減稅只到 ${on['zh-TW']}，之後燃油機車的價格可能不一樣。`, `Petrol: these offers or tax cuts end on ${on.en}; after that the petrol scooter's price may be different.`);
        push({
          code: 'deadline',
          severity: d.daysLeft <= 45 ? 'warning' : 'info',
          text: join(head, ...items),
          items,
          about: ds.map((x) => x.id),
        });
      }
    }
    for (const [deadline, ls] of groupBy(lines.filter((l) => l.applicationDeadline && cmp(l.applicationDeadline, today) >= 0), (l) => l.applicationDeadline as string)) {
      const days = daysBetween(today, deadline);
      const docs = ls.find((l) => l.documentsDeadline)?.documentsDeadline;
      const notes = uniqueText(ls.flatMap((l) => (l.applicationNote ? [l.applicationNote] : [])));
      const head = docs
        ? t(`第一階段申請期限 ${date(deadline)['zh-TW']}（逾期不受理），第二階段補件至 ${date(docs)['zh-TW']}`, `Application deadline ${date(deadline).en} (stage 1; late applications are refused), stage 2 documents by ${date(docs).en}`)
        : t(`申請期限 ${date(deadline)['zh-TW']}`, `Application deadline ${date(deadline).en}`);
      push({
        code: 'application-deadline',
        severity: days <= 45 ? 'warning' : 'info',
        text: join(t(`${head['zh-TW']}：${names(ls)['zh-TW']}。`, `${head.en}: ${names(ls).en}.`), ...notes),
        about: ls.map((l) => l.id),
      });
    }
  }

  // MOEA filing: foreign nationals must apply by 10 December; Gogoro files for its buyers only to then.
  const moea = evP.ledger.lines.filter((l) => l.id.startsWith('moea-'));
  const moeaLate = evP.ledger.excluded.filter((x) => x.failedCondition === 'applicant-deadline');
  const FOREIGN_BY = '2026-12-10';
  const afterForeign = cmp(today, FOREIGN_BY) > 0;
  if (moeaLate.length) {
    const amount = moeaLate.reduce((a, x) => Math.max(a, x.amount), 0);
    push({
      code: 'moea-filing',
      severity: 'critical',
      text: t(
        `經濟部補助入口網要求外籍人士在 2026 年 12 月 10 日前提出申請；這個日期已過，所以經濟部補助（約${ntd(amount)['zh-TW']}）不計入。`,
        `The MOEA portal required foreign nationals to apply by 10 December 2026; that date has passed, so the MOEA subsidy (about ${ntd(amount).en}) is not counted.`,
      ),
      about: moeaLate.map((x) => x.id),
      amount,
      sources: ['meid-lev-subsidy-portal'],
    });
  }
  if (moea.length && !ended) {
    const foreign = Boolean(s.household.foreignNational);
    const parts: L10n[] = [];
    if (foreign) parts.push(t('你是外籍人士：經濟部補助入口網要求在 2026 年 12 月 10 日前提出申請，否則拿不到這筆錢。', 'As a foreign national you must apply to the MOEA portal by 10 December 2026, or you will not get this money.'));
    else parts.push(t('經濟部補助的購車期限是 2026 年 12 月 31 日，通常由經銷商代為申請；入口網另要求外籍人士在 12 月 10 日前申請。', 'The MOEA purchase window runs to 31 December 2026 and the dealer usually files the claim; the portal asks foreign nationals to apply by 10 December.'));
    if (isGogoro)
      parts.push(
        afterForeign
          ? t('Gogoro表示只代辦到 2026 年 12 月 10 日，這個日期已過：購車前請先問門市由誰、怎麼申請經濟部補助。', 'Gogoro said it would file applications only until 10 December 2026, which has passed: before buying, ask the store who will file the MOEA claim and how.')
          : t('Gogoro表示只代辦到 2026 年 12 月 10 日，建議在那之前送件。', 'Gogoro says it files applications only until 10 December 2026, so file before then.'),
      );
    push({
      code: 'moea-filing',
      severity: foreign || isGogoro ? 'warning' : 'info',
      text: join(...parts),
      about: moea.map((l) => l.id),
      sources: isGogoro ? ['meid-lev-subsidy-portal', 'gogoro-2026-lastcall-promo'] : ['meid-lev-subsidy-portal'],
    });
  }

  // Expired / unconfirmed / exhausted lines that the buyer would otherwise get.
  const expiredProgrammes = excludedAll.filter((x) => x.reason === 'expired' && x.failedCondition !== 'applicant-deadline' && data.programmes.some((p) => p.id === x.id));
  if (expiredProgrammes.length && !ended) {
    push({ code: 'expired', severity: 'warning', text: t(`這些補助已過購車期限：${names(expiredProgrammes)['zh-TW']}。`, `These subsidies have closed for purchases: ${names(expiredProgrammes).en}.`), about: expiredProgrammes.map((x) => x.id) });
  }
  const unconfirmed = excludedAll.filter((x) => x.reason === 'unconfirmed');
  if (unconfirmed.length) {
    push({
      code: 'unconfirmed',
      severity: 'info',
      text: t(
        `${names(unconfirmed)['zh-TW']}在官方表上列到 2027 年底，但環境部的汰舊換新補助辦法只確定延長到 2026 年底，所以沒有算進去；如果 2027 年還受理，可以再多領。`,
        `${names(unconfirmed).en} ${unconfirmed.length === 1 ? 'is' : 'are'} listed to the end of 2027, but the MOENV scrap-and-replace rule is only confirmed to the end of 2026, so ${unconfirmed.length === 1 ? 'it is' : 'they are'} not counted; if still accepted in 2027 you could get more.`,
      ),
      about: unconfirmed.map((x) => x.id),
    });
  }
  // A scooter that becomes old enough only after 2026 for a programme that is listed beyond 2026
  // but confirmed only to the end of 2026 (MOENV options in Kaohsiung and elsewhere): name them,
  // with the day the scooter qualifies, instead of saying nothing is listed.
  if (s.scrap && isCalendarDate(s.scrap.builtOn, true)) {
    const built = normalise(s.scrap.builtOn);
    const [by, bm, bd] = built.split('-').map(Number);
    // The day the scooter reaches an age (28 February for a 29 February build in a common year).
    const turns = (years: number) => {
      const y = by + years;
      const last = new Date(Date.UTC(y, bm, 0)).getUTCDate();
      return `${y}-${String(bm).padStart(2, '0')}-${String(Math.min(bd, last)).padStart(2, '0')}`;
    };
    // Lines that fail only because the scooter is too young today, listed past the end of 2026
    // but confirmed only to it, and which this buyer would meet on the day the scooter is old enough.
    const byDay = new Map<string, { years: number; to: string; cands: { p: (typeof data.programmes)[number]; amount: number; assumptions: L10n[] }[] }>();
    for (const x of evP.ledger.excluded) {
      if (x.failedCondition !== 'scrap-min-age') continue;
      const p = data.programmes.find((q) => q.id === x.id);
      if (!p?.confirmedThrough || cmp(p.validTo, p.confirmedThrough) <= 0 || p.calculator !== true || p.quota.status === 'exhausted') continue;
      const age = p.conditions.find((c): c is Extract<typeof c, { kind: 'scrap-min-age' }> => c.kind === 'scrap-min-age');
      if (!age || fullYears(built, today) >= age.years) continue;
      const reaches = turns(age.years);
      if (cmp(reaches, p.confirmedThrough) <= 0 || cmp(reaches, p.validTo) > 0) continue;
      const then = { ...s, date: reaches };
      const r = checkAll(p.conditions, { s: then, side: 'electric', ev, programmeJurisdiction: p.jurisdiction, remoteDistricts: data.jurisdictions[s.jurisdiction]?.remoteDistricts });
      if (!r.ok) continue;
      const key = `${reaches}|${p.validTo}`;
      const slot = byDay.get(key) ?? { years: age.years, to: p.validTo, cands: [] };
      slot.cands.push({ p, amount: x.amount, assumptions: [] });
      byDay.set(key, slot);
    }
    for (const [key, slot] of byDay) {
      const reaches = key.split('|')[0];
      // Only one carbon reward and one air subsidy can be taken: the most the buyer could get.
      const best = selectProgrammes(slot.cands, data, s.jurisdiction);
      if (!best.chosen.length || best.total <= 0) continue;
      const ls = best.chosen.map((c) => ({ label: c.p.name }));
      const one = ls.length === 1;
      push({
        code: 'unconfirmed',
        severity: 'info',
        text: t(
          `你的機車在 ${date(reaches)['zh-TW']}出廠滿 ${slot.years} 年。${names(ls)['zh-TW']}（最多約${ntd(best.total)['zh-TW']}）在官方表上列到 ${date(slot.to)['zh-TW']}，但它所依據的補助辦法只確定到 2026 年底，所以現在不能算進來；等你的機車滿 ${slot.years} 年，請再到環境部的媒合平台查一次。`,
          `Your scooter turns ${slot.years} on ${date(reaches).en}. ${names(ls).en} (up to about ${ntd(best.total).en}) ${one ? 'is' : 'are'} listed on the official table to ${date(slot.to).en}, but the rule ${one ? 'it rests' : 'they rest'} on is confirmed only to the end of 2026, so ${one ? 'it cannot' : 'they cannot'} be counted now; once your scooter is ${slot.years}, check the MOENV matching platform again.`,
        ),
        about: best.chosen.map((c) => c.p.id),
        amount: best.total,
      });
    }
  }
  // Each exhausted programme with its own reason and source (Kaohsiung's city money and an MOENV
  // buyer's lots run out for different reasons on different dates).
  const exhausted = excludedAll.filter((x) => x.reason === 'quota-exhausted');
  if (exhausted.length) {
    const prog = (id: string) => data.programmes.find((p) => p.id === id);
    const groups = groupBy(exhausted, (x) => prog(x.id)?.quota.text.en ?? x.id);
    const sentences: L10n[] = [];
    const sources: SourceId[] = [];
    for (const [, xs] of groups) {
      const p = prog(xs[0].id);
      sentences.push(t(`${names(xs)['zh-TW']}：${p?.quota.text['zh-TW'] ?? ''}`, `${names(xs).en}: ${p?.quota.text.en ?? ''}`));
      sources.push(...(p?.quota.sources ?? p?.sources ?? []));
    }
    push({
      code: 'quota-exhausted',
      severity: 'warning',
      text: join(t('名額或經費已用完，未計入。', 'Quota or budget used up, not counted.'), ...sentences),
      about: exhausted.map((x) => x.id),
      sources: [...new Set(sources)],
    });
  }

  // Quota pressure on counted lines.
  const small = (l: LedgerLine) => Boolean(l.quota && l.quota.remaining === undefined && l.quota.total !== undefined && l.quota.total <= SMALL_QUOTA && (l.quota.status === 'limited' || l.quota.status === 'unknown'));
  for (const side of ['electric', 'gasoline'] as const) {
    const ledger = side === 'electric' ? evP.ledger : gasP.ledger;
    for (const l of ledger.lines) {
      const q = l.quota;
      if (!q) continue;
      if (q.status === 'nearly-exhausted' || (q.remaining !== undefined && q.remaining <= SMALL_QUOTA)) {
        push({
          code: 'quota-low',
          severity: 'warning',
          text: join(t(`${l.label['zh-TW']}名額所剩不多。`, `Few places left for ${l.label.en}.`), q.text, t('名額會隨申請減少，請先上官網確認。', 'Places fall as people apply; check the official site first.')),
          about: [l.id],
          amount: l.amount,
          sources: q.sources,
        });
      } else if (small(l)) {
        // A tiny published quota whose remaining count was never checked may already be gone. If an
        // either/or alternative was set aside for it, that is what the buyer would get instead.
        const fallback = ledger.excluded.filter((x) => x.reason === 'mutually-exclusive' && x.instead?.includes(l.id)).sort((a, b) => b.amount - a.amount)[0];
        const atRisk = Math.max(0, l.amount - (fallback?.amount ?? 0));
        const without = ledger.net.value + atRisk;
        push({
          code: 'quota-low',
          severity: 'warning',
          text: join(
            sided(side, t(`${l.label['zh-TW']}名額很少，剩餘名額沒有查證，可能已經用完。`, `${l.label.en} has very few places and the remaining number was not checked, so they may already be gone.`)),
            q.text,
            fallback
              ? t(`若已用完，你會改領${fallback.label['zh-TW']}，少${ntd(atRisk)['zh-TW']}，實付約${ntd(without)['zh-TW']}。`, `If they are gone you would get ${fallback.label.en} instead, ${ntd(atRisk).en} less, and pay about ${ntd(without).en}.`)
              : t(`若已用完，實付約${ntd(without)['zh-TW']}。`, `If they are gone you would pay about ${ntd(without).en}.`),
          ),
          about: [l.id, ...(fallback ? [fallback.id] : [])],
          amount: atRisk,
          sources: q.sources,
        });
      }
    }
  }
  const unknownQuota = lines.filter((l) => l.quota && !small(l) && (l.quota.status === 'unknown' || (l.quota.status === 'limited' && l.quota.remaining === undefined)));
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

  const secondaryStacked: L10n[] = [];
  for (const side of ['electric', 'gasoline'] as const) {
    const P = side === 'electric' ? evP : gasP;
    // Readings we were told to take but must be confirmed (advisory groups).
    for (const a of P.atRisk) {
      const g = data.groups[a.group];
      if (!g?.ambiguity) continue;
      if (g.secondaryStacking) secondaryStacked.push(g.label);
      push({ code: 'ambiguity', severity: 'warning', text: sided(side, join(g.ambiguity, t(`這筆金額約${ntd(a.amount)['zh-TW']}。`, `That amount is about ${ntd(a.amount).en}.`))), amount: a.amount, sources: g.sources, about: [a.group, ...a.ids] });
    }
    // Ambiguities resolved conservatively.
    for (const u of P.upside) {
      const g = data.groups[u.group];
      if (!g?.ambiguity) continue;
      push({ code: 'ambiguity', severity: 'info', text: sided(side, join(g.ambiguity, t(`這筆金額約${ntd(u.amount)['zh-TW']}。`, `That amount is about ${ntd(u.amount).en}.`))), amount: u.amount, sources: g.sources, about: [u.group, ...u.ids] });
    }
    // Lines left out because a rule is unclear for this buyer.
    if (P.ambiguousUpside) {
      const a = P.ambiguousUpside;
      const ls = P.ledger.excluded.filter((x) => a.ids.includes(x.id));
      const whys = uniqueText(a.why);
      push({
        code: 'ambiguity',
        severity: 'warning',
        text: sided(
          side,
          t(
            `${names(ls)['zh-TW']}未計入：${whys.map((w) => w['zh-TW']).join('；')}。若你其實符合資格，可再多領約${ntd(a.amount)['zh-TW']}。`,
            `${names(ls).en} not counted: ${whys.map((w) => w.en).join('; ')}. If you do qualify you would get about ${ntd(a.amount).en} more.`,
          ),
        ),
        amount: a.amount,
        about: a.ids,
        sources: [...new Set(ls.flatMap((x) => x.sources))],
      });
    }
    // Dealer offers whose scrapping condition is unclear.
    for (const pu of P.promoUpside) {
      const now = P.ledger.net.value;
      push({
        code: 'ambiguity',
        severity: 'warning',
        text: sided(
          side,
          t(
            `${pu.label['zh-TW']}（${ntd(pu.amount)['zh-TW']}）沒有寫明是否須汰舊，沒有機車可報廢時計算不計入；若車行不要求汰舊，實付約${ntd(now - pu.amount)['zh-TW']}，不是${ntd(now)['zh-TW']}。請先問車行。`,
            `${pu.label.en} (${ntd(pu.amount).en}) does not say whether it needs scrapping, so with nothing to scrap it is not counted; if the dealer grants it without scrapping you would pay about ${ntd(now - pu.amount).en}, not ${ntd(now).en}. Ask the dealer.`,
          ),
        ),
        amount: pu.amount,
        about: [pu.id],
        sources: pu.sources,
      });
    }
  }
  const moeaValid = evP.ledger.lines.some((l) => l.id.startsWith('moea-new'));
  if (moeaValid && ev.moeaClass === 'light-unknown') {
    push({
      code: 'ambiguity',
      severity: 'info',
      text: t(
        `無法確認${ev.name['zh-TW']}是普通輕型第1級還是第2級，經濟部補助先以5,100元計；若是第1級，補助為7,000元，可多1,900元。`,
        `We could not confirm whether ${ev.name.en} is light class (green plate, 普通輕型) level 1 or 2, so the MOEA subsidy is counted at NT$5,100; if it is level 1 it is NT$7,000, NT$1,900 more.`,
      ),
      amount: 1900,
      about: ['moea-new-5100'],
      sources: ['meid-lev-2026-subsidy-table'],
    });
  }
  const unlisted = evP.ledger.excluded.filter((x) => x.failedCondition === 'moea-listed');
  if (unlisted.length) {
    push({
      code: 'ambiguity',
      severity: 'warning',
      text: t(
        `無法確認${ev.name['zh-TW']}在經濟部認可車款清單上，所以經濟部與縣市補助都不計入：${names(unlisted)['zh-TW']}。若車行能證明是認可車款，實付價格會再低一些；請先要求書面確認。`,
        `We could not confirm that ${ev.name.en} is on the MOEA approved list, so MOEA and local subsidies are not counted: ${names(unlisted).en}. If the dealer can show it is listed, the price would be lower; ask for written confirmation first.`,
      ),
      about: unlisted.map((x) => x.id),
      sources: ['meid-approved-models-csv'],
    });
  }
  const cells = evP.ledger.excluded.find((x) => x.id === 'moea-domestic-cells' && x.reason === 'model-unknown');
  if (cells) {
    push({
      code: 'ambiguity',
      severity: 'info',
      text: t('經濟部國產電池芯加碼3,000元確實存在，但查不到任何車款被列為符合（Gogoro自己的補助計算也沒有這一項），計算不計入；除非車行書面確認，不要指望這筆錢。', 'The MOEA NT$3,000 Taiwan-made cell bonus exists, but no model could be shown to qualify (Gogoro\'s own calculator does not include it), so it is not counted; do not rely on it unless the dealer confirms in writing.'),
      amount: 3000,
      about: ['moea-domestic-cells'],
      sources: ['meid-lev-subsidy-portal'],
    });
  }

  // Assumptions.
  const assumptions = uniqueText([...evP.assumptions, ...gasP.assumptions]);
  if (plan.usage.kind === 'time-window') {
    assumptions.push(
      t(
        `${plan.name['zh-TW']}的中間值假設${Math.round(s.offWindowShare * 100)}%的換電在免費時段外（沒有資料顯示一般騎士的比例）；低值假設全部在免費時段內，高值假設全部在時段外`,
        `The middle estimate for ${plan.name.en} assumes ${Math.round(s.offWindowShare * 100)}% of swaps are outside the free windows (no data shows what is typical); the low estimate assumes all are inside, the high estimate that all are outside`,
      ),
    );
  }
  const trimEnd = (x: string) => x.replace(/[。.；;]+$/, '');
  if (assumptions.length) push({ code: 'assumption', severity: 'info', text: t(assumptions.map((a) => trimEnd(a['zh-TW'])).join('；') + '。', assumptions.map((a) => trimEnd(a.en)).join('; ') + '.') });

  // Secondary inputs used.
  const secondary: L10n[] = [];
  if (ev.listPrice.confidence === 'secondary') secondary.push(t(`${ev.name['zh-TW']}售價`, `${ev.name.en} price`));
  if (ev.plateClassBasis.confidence === 'secondary') secondary.push(t(`${ev.name['zh-TW']}的車種等級`, `${ev.name.en} plate class`));
  if (ev.moeaClassBasis.confidence === 'secondary' && moeaValid) secondary.push(t(`${ev.name['zh-TW']}的經濟部補助等級（推算）`, `${ev.name.en} MOEA class (inferred)`));
  if (ev.battery.basis.confidence === 'secondary') secondary.push(t(`${ev.name['zh-TW']}的電池數量`, `${ev.name.en} battery count`));
  if (ev.efficiency.confidence === 'secondary') secondary.push(t(`${ev.name['zh-TW']}每度或每安時可騎的公里數（推估）`, `${ev.name.en} km per unit of energy (estimated)`));
  if (gasP.ledger.listPrice.confidence === 'secondary') secondary.push(t(`${gas.name['zh-TW']}售價或牌險扣除`, `${gas.name.en} price or plate-insurance adjustment`));
  if (plan.setupFee?.confidence === 'secondary') secondary.push(t(`${plan.name['zh-TW']}設定費`, `${plan.name.en} setup fee`));
  if (plan.confidence === 'secondary') secondary.push(plan.name);
  secondary.push(t('保養費的推算', 'maintenance estimates'), t('實際油耗下限（每公升45公里）', 'real-world fuel economy (45 km/L)'), t('強制險金額（兩邊相同）', 'compulsory insurance (same on both sides)'));
  secondary.push(...secondaryStacked);
  for (const l of lines) if (l.confidence === 'secondary') secondary.push(l.label);
  push({
    code: 'secondary-input',
    severity: 'warning',
    text: t(`下面這些數字只在轉述中看到（媒體報導、部落格或本站推算），沒有更可靠的官方數字：${list(uniqueText(secondary))['zh-TW']}。`, `These inputs rest on secondary sources (media, blogs or our own arithmetic) because no verified figure was available: ${list(uniqueText(secondary)).en}.`),
  });

  // Like-for-like.
  if (comparison.likeForLike.verdict !== 'like-for-like') {
    push({ code: 'like-for-like', severity: comparison.likeForLike.verdict === 'different-class' ? 'warning' : 'info', text: comparison.likeForLike.note });
  }

  // Petrol smoothing.
  const fuelNow = c.gasR.items.find((i) => i.id === 'energy')?.monthly.typical ?? 0;
  const fuelDelta = c.unsmMonthly - c.gasR.monthly.typical;
  const be = (b: Comparison['breakEven']) => breakEvenPhrase(b, s.horizonMonths);
  const smoothingOver = data.fuel.smoothing.scheduledEnd !== undefined && cmp(today, data.fuel.smoothing.scheduledEnd) > 0;
  push({
    code: 'petrol-smoothing',
    severity: smoothingOver ? 'warning' : 'info',
    text: join(
      smoothingOver ? (data.fuel.smoothing.mechanismAfterEnd ?? data.fuel.smoothing.mechanism) : data.fuel.smoothing.mechanism,
      t(
        `以每月${n(s.monthlyKm)}公里計，這輛燃油機車每月油錢約${ntd(fuelNow)['zh-TW']}；如果這項壓低油價的措施結束（每公升多${data.fuel.smoothing.typical}元），每個月要多花約${ntd(fuelDelta)['zh-TW']}，結果會是：${be(comparison.withoutSmoothing.breakEven)['zh-TW']}（${smoothingOver ? '以查證時的油價計' : '現在'}：${be(comparison.breakEven)['zh-TW']}）。`,
        `At ${n(s.monthlyKm)} km a month this petrol scooter uses about ${ntd(fuelNow).en} of fuel. If this help with the pump price ended (NT$${data.fuel.smoothing.typical} more a litre), it would cost about ${ntd(fuelDelta).en} more a month, and the result would be: ${be(comparison.withoutSmoothing.breakEven).en} (${smoothingOver ? 'at the price we checked' : 'now'}: ${be(comparison.breakEven).en}).`,
      ),
    ),
    amount: Math.round(fuelDelta),
    sources: data.fuel.smoothing.sources,
  });

  // EV road fee from 2031 (expected, not law): the band that matches the electric model's class.
  const horizonEnd = addMonths(today, s.horizonMonths);
  const levyStart = `${data.fees.roadFeeElectric.expectedFromYear}-01-01`;
  if (cmp(horizonEnd, levyStart) > 0) {
    const from = cmp(today, levyStart) > 0 ? today : levyStart;
    const months = Math.max(0, Math.round(daysBetween(from, horizonEnd) / 30.44));
    const cc = ev.plateClass === 'heavy' ? 125 : 50;
    const rate = data.fees.roadFeeGasoline.find((b) => b.upToCc === cc)?.perYear.value ?? (cc === 125 ? 450 : 300);
    const band = cc === 125 ? t('125cc', '125cc') : t('50cc以下', '50cc-or-less');
    const extra = Math.round((rate / 12) * months);
    push({
      code: 'ev-road-fee',
      severity: 'info',
      text: join(
        data.fees.roadFeeElectric.futureNote,
        t(
          `如果以後照${band['zh-TW']}燃油機車每年${n(rate)}元收，在這裡算的${horizonText(s.horizonMonths)['zh-TW']}裡，電動機車大約要多付${ntd(extra)['zh-TW']}（沒有算進去）。`,
          `If it were charged at the ${band.en} petrol rate of NT$${n(rate)} a year, electric would pay about ${ntd(extra).en} more within the ${horizonText(s.horizonMonths).en} counted here (not included).`,
        ),
      ),
      amount: extra,
      sources: data.fees.roadFeeElectric.sources,
    });
  }

  // Dealer promotions and plan credits that have ended.
  const promoGone = excludedAll.filter((x) => x.reason === 'expired' && !data.programmes.some((p) => p.id === x.id));
  if (promoGone.length) {
    push({
      code: 'dealer-promo-expired',
      severity: 'warning',
      text: t(
        `車廠優惠已結束：${names(promoGone)['zh-TW']}。之後的優惠在資料查證時尚未公布，計算以建議售價計算，門市實際價格可能較低。`,
        `Manufacturer offers have ended: ${names(promoGone).en}. Later offers had not been published when the data was checked, so the list price is used; the shop price may be lower.`,
      ),
      about: promoGone.map((x) => x.id),
    });
  }
  const creditsGone = c.evR.planCredits.ended;
  if (creditsGone.length) {
    push({
      code: 'dealer-promo-expired',
      severity: 'warning',
      text: t(
        `資費優惠已結束，不再計入：${creditsGone.map((x) => `${x.name['zh-TW']}（共${ntd(x.total)['zh-TW']}，${date(x.validTo)['zh-TW']}截止）`).join('、')}。`,
        `Plan credits have ended and are no longer counted: ${creditsGone.map((x) => `${x.name.en} (${ntd(x.total).en} in all, ended ${date(x.validTo).en})`).join(', ')}.`,
      ),
      about: creditsGone.map((x) => x.id),
      amount: creditsGone.reduce((a, x) => a + x.total, 0),
      sources: [...new Set(creditsGone.flatMap((x) => x.sources))],
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
          `以每月${n(s.monthlyKm)}公里大約用${n(units)}安時，接近或超過${plan.name['zh-TW']}的${n(plan.usage.fairUseUnits)}安時商業使用門檻，可能被要求改用其他方案。`,
          `At ${n(s.monthlyKm)} km a month you would use about ${n(units)} Ah, close to or above the ${n(plan.usage.fairUseUnits)} Ah commercial-use threshold of ${plan.name.en}; you may be moved to another plan.`,
        ),
        sources: plan.sources,
      });
    }
  }

  // Plan lock-in.
  // The contract, as the operator states it (or that it does not): one true sentence per plan.
  if (plan.operator !== 'household') {
    // The terms often open with the same contract phrase: do not say it twice.
    const rest = (terms: string, lead: string) => {
      const cut = terms.startsWith(lead) ? terms.slice(lead.length).replace(/^[；;，,。.]\s*/, '') : terms;
      return cut.charAt(0).toUpperCase() + cut.slice(1);
    };
    const terms = t(rest(plan.terms['zh-TW'], plan.contract['zh-TW']), rest(plan.terms.en, plan.contract.en));
    push({ code: 'plan-lock-in', severity: 'info', text: join(t(`${plan.name['zh-TW']}：${plan.contract['zh-TW']}。`, `${plan.name.en}: ${lowerFirst(plan.contract.en)}.`), terms), sources: plan.sources });
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

  // Range: a home-charging scooter must cover an average day on one charge (no swap on the way).
  if (plan.system === 'home' && ev.range) {
    const perDay = s.monthlyKm / 30;
    if (perDay > ev.range.km) {
      push({
        code: 'range',
        severity: 'warning',
        text: t(
          `每月${n(s.monthlyKm)}公里，平均一天約${n(perDay)}公里，比這輛車充飽一次能騎的${n(ev.range.km)}公里還多：一天要充不只一次，或是要換一輛跑得更遠的車。${ev.range.text['zh-TW']}`,
          `${n(s.monthlyKm)} km a month is about ${n(perDay)} km a day on average, more than the ${n(ev.range.km)} km this scooter goes on one charge: you would need to charge more than once a day, or choose a scooter that goes further. ${ev.range.text.en}`,
        ),
        about: ['monthlyKm', ev.id],
        sources: ev.range.sources,
      });
    }
  }

  if (plan.system === 'home') push({ code: 'electricity-review', severity: 'info', text: data.electricity.reviewNote, sources: data.electricity.sources });

  // Most severe first, stable otherwise.
  return out.map((m, i) => ({ m, i })).sort((a, b) => severityOrder[a.m.severity] - severityOrder[b.m.severity] || a.i - b.i).map((x) => x.m);
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

/** Messages that apply to a ranking as a whole, gathered from every option. */
const RANKING_CODES = new Set<Message['code']>([
  'programmes-ended',
  'stale-data',
  'jurisdiction-not-verified',
  'jurisdiction-partly-verified',
  'quota-exhausted',
  'dealer-promo-expired',
  'deadline',
  'application-deadline',
  'moea-filing',
  'expired',
  'unconfirmed',
  'up-to-amounts',
  'quota-low',
  'quota-unknown',
  'ambiguity',
  'secondary-input',
  'payout-timing',
]);
/** Messages that describe one option's own result: taken from the first option only. */
const FIRST_ONLY_CODES = new Set<Message['code']>(['petrol-smoothing']);

/** Every electric model and plan the calculator offers, in ranking order. */
export function rankingPairs(data: EconDataset): { model: EvModel; plan: EnergyPlan }[] {
  const out: { model: EvModel; plan: EnergyPlan }[] = [];
  for (const m of data.evModels) {
    if (m.calculator !== true) continue;
    for (const pid of m.plans) {
      const p = data.plans.find((x) => x.id === pid);
      if (!p || p.calculator !== true) continue;
      out.push({ model: m, plan: p });
    }
  }
  return out;
}

/** Evaluate one model and plan for a ranking. */
function rankOne(base: Omit<Situation, 'electricModel' | 'energyPlan'>, m: EvModel, p: EnergyPlan, data: EconDataset): { option: Option; evaluation: Evaluation } {
  const e = evaluate({ ...base, electricModel: m.id, energyPlan: p.id } as Situation, data);
  const H = e.comparison.cumulative.months.length - 1;
  const total = e.comparison.cumulative.electric[H];
  const gasTotal = e.comparison.cumulative.gasoline[H];
  const option: Option = {
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
    horizonTotal: total,
    horizonGap: total.typical - gasTotal.typical,
    breakEven: e.comparison.breakEven,
    usesSecondaryInputs:
      m.listPrice.confidence === 'secondary' ||
      m.efficiency.confidence === 'secondary' ||
      m.plateClassBasis.confidence === 'secondary' ||
      p.setupFee?.confidence === 'secondary' ||
      p.confidence === 'secondary' ||
      m.battery.basis.confidence === 'secondary' ||
      e.electric.purchase.lines.some((l: LedgerLine) => l.confidence === 'secondary'),
    hasUpToAmounts: e.electric.purchase.net.high > e.electric.purchase.net.value,
    warningCodes: [...new Set(e.messages.filter((x) => x.severity !== 'info').map((x) => x.code))],
  };
  return { option, evaluation: e };
}

// ---------------------------------------------------------------------------
// When a result changes with the date
// ---------------------------------------------------------------------------

const nextDay = (d: string): string => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day + 1)).toISOString().slice(0, 10);
};

/** Every date in the dataset on which some line, offer, credit or note can start or stop applying. */
export function boundaryDates(data: EconDataset): string[] {
  const out = new Set<string>();
  const add = (d: string | undefined, after = false) => d && isCalendarDate(d) && out.add(after ? nextDay(d) : d);
  for (const p of data.programmes) {
    add(p.validFrom);
    add(p.validTo, true);
    add(p.confirmedThrough, true);
    add(p.applicationDeadline, true);
    if (p.quota.status === 'exhausted') add(p.quota.asOf);
    for (const c of p.conditions) if (c.kind === 'applicant-deadline') add(c.date, true);
  }
  for (const m of [...data.evModels, ...data.gasModels]) for (const pr of m.promos) (add(pr.validFrom), add(pr.validTo, true));
  for (const c of data.planCredits) (add(c.validFrom), add(c.validTo, true));
  add(data.fuel.smoothing.scheduledEnd, true);
  add(data.meta.programmeYearEnd, true);
  const stale = new Date(Date.parse(`${data.meta.checkedOn}T00:00:00Z`) + (STALE_AFTER_DAYS + 1) * 86_400_000).toISOString().slice(0, 10);
  add(stale);
  return [...out].sort((a, b) => cmp(a, b));
}

const resultKey = (e: Evaluation) =>
  JSON.stringify([
    e.electric.purchase.lines.map((l) => [l.id, l.amount]),
    e.gasoline.purchase.lines.map((l) => [l.id, l.amount]),
    e.electric.running.planCredits.applied.map((c) => c.id),
    e.comparison.breakEven,
    e.messages.map((m) => m.code),
  ]);

/**
 * The dates after `situation.date` (up to `until`, default the end of 2027) on which this
 * situation's result changes: a line or an offer stops counting, a credit ends, the 2026
 * programmes close, a note changes tense. A page built on one day can render a variant for each
 * and show the one that is true on the reader's day (as site-state does for the money copy), so a
 * worked example never shows money that has already gone. Each entry carries the evaluation.
 */
export function changeDates(situation: Situation, data: EconDataset, until = '2027-12-31'): { date: string; evaluation: Evaluation }[] {
  const start = evaluate(situation, data);
  let key = resultKey(start);
  const out: { date: string; evaluation: Evaluation }[] = [];
  for (const d of boundaryDates(data)) {
    if (cmp(d, start.situation.date) <= 0 || cmp(d, until) > 0) continue;
    const e = evaluate({ ...situation, date: d }, data);
    const k = resultKey(e);
    if (k !== key) out.push({ date: d, evaluation: e });
    key = k;
  }
  return out;
}

/** Rank every available electric model + plan for a situation. */
export function bestOptions(base: Omit<Situation, 'electricModel' | 'energyPlan'>, data: EconDataset): BestOptions {
  const issues = validateSituation(base as Situation, data, { requireModels: false });
  if (issues.length) throw new CalcInputError(issues);
  const done = rankingPairs(data).map(({ model, plan }) => rankOne(base, model, plan, data));
  return rankResults(base, done, data);
}

/**
 * bestOptions in slices, for a page that must stay responsive: it evaluates `batch` options, then
 * awaits `pause()` (by default a zero-delay timeout, which lets the browser handle input and
 * paint) before the next slice. Same result as bestOptions. `signal` stops it early (it then
 * rejects with the signal's reason).
 */
export async function bestOptionsInSlices(
  base: Omit<Situation, 'electricModel' | 'energyPlan'>,
  data: EconDataset,
  opts: { batch?: number; pause?: () => Promise<void>; signal?: AbortSignal } = {},
): Promise<BestOptions> {
  const issues = validateSituation(base as Situation, data, { requireModels: false });
  if (issues.length) throw new CalcInputError(issues);
  const batch = Math.max(1, opts.batch ?? 4);
  const pause = opts.pause ?? (() => new Promise<void>((r) => setTimeout(r, 0)));
  const pairs = rankingPairs(data);
  const done: { option: Option; evaluation: Evaluation }[] = [];
  for (let i = 0; i < pairs.length; i++) {
    if (opts.signal?.aborted) throw opts.signal.reason ?? new Error('aborted');
    done.push(rankOne(base, pairs[i].model, pairs[i].plan, data));
    if ((i + 1) % batch === 0 && i + 1 < pairs.length) await pause();
  }
  return rankResults(base, done, data);
}

function rankResults(base: Omit<Situation, 'electricModel' | 'energyPlan'>, done: { option: Option; evaluation: Evaluation }[], data: EconDataset): BestOptions {
  const options = done.map((d) => d.option);
  const evaluations = done.map((d) => d.evaluation);
  const first = evaluations[0] ?? null;
  const byNet = [...options].sort((a, b) => a.netPrice - b.netPrice || a.netPriceHigh - b.netPriceHigh || a.fiveYearTotal.typical - b.fiveYearTotal.typical);
  const byTotal = [...options].sort((a, b) => a.fiveYearTotal.typical - b.fiveYearTotal.typical || a.netPrice - b.netPrice);
  const closestOf = (xs: Option[]) => [...xs].sort((a, b) => a.purchaseGap - b.purchaseGap || a.netPriceHigh - b.netPriceHigh)[0] ?? null;
  const closest = closestOf(options);
  const closestSame = closestOf(options.filter((o) => o.likeForLike !== 'different-class'));
  const closestLfl = closestOf(options.filter((o) => o.likeForLike === 'like-for-like'));
  const H = first ? first.comparison.cumulative.months.length - 1 : (base.horizonMonths ?? data.meta.horizonMonths);

  // Warnings that go with the ranking: from every option the ranking puts forward (cheapest to buy,
  // cheapest over the horizon, closest to parity overall and in the white-plate class), de-duplicated
  // by text. Each option also lists its own warning codes (Option.warningCodes).
  const highlighted = [byNet[0], byTotal[0], closest, closestSame, closestLfl].filter((o): o is Option => Boolean(o));
  const evalOf = (o: Option) => evaluations[options.indexOf(o)];
  const picked = [...new Set(highlighted.map(evalOf))];
  const seen = new Set<string>();
  const messages: Message[] = [];
  for (const [i, e] of picked.entries()) {
    for (const m of e.messages) {
      if (!(RANKING_CODES.has(m.code) || (i === 0 && FIRST_ONLY_CODES.has(m.code)))) continue;
      const key = `${m.code}|${m.text.en}`;
      if (seen.has(key)) continue;
      seen.add(key);
      messages.push(m);
    }
  }
  if (!closestLfl && options.length) {
    messages.push({
      code: 'like-for-like',
      severity: 'warning',
      text: closestSame
        ? t(
            `沒有任何選項經查證是125cc燃油機車的同級替代品。同屬白牌、最接近打平的是${closestSame.modelName['zh-TW']}，但它的性能是否相當沒有查證到。`,
            `No option is verified as a like-for-like substitute for a 125cc petrol scooter. The closest white-plate option is ${closestSame.modelName.en}, but whether its performance is equivalent is not verified.`,
          )
        : t('沒有任何選項經查證是125cc燃油機車的同級替代品，也沒有同屬白牌的選項。', 'No option is verified as a like-for-like substitute for a 125cc petrol scooter, and none is in the same white-plate class.'),
      ...(closestSame ? { about: [closestSame.electricModel] } : {}),
    });
  }
  messages.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    gasolineModel: base.gasolineModel,
    gasolineNet: first?.gasoline.purchase.net.value ?? 0,
    gasolineFiveYearTotal: first ? first.comparison.cumulative.gasoline[H] : { low: 0, typical: 0, high: 0 },
    horizonMonths: H,
    byNetPrice: byNet,
    byFiveYearTotal: byTotal,
    closestToParity: closest,
    closestToParityLikeForLike: closestLfl,
    closestToParitySamePlateClass: closestSame,
    messages,
  };
}
