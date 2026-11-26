// Monthly and yearly running costs for each side, itemised, with low / typical / high bounds,
// plus a month-by-month schedule for the cumulative series.
//
// Bounds: "low" is the cheapest plausible case for that side and "high" the dearest. Electric:
// best efficiency and allowance vs worst. Gasoline: official test km/L vs real-world 45 km/L.
// Maintenance: the low end is the manufacturer schedule priced at the cheapest parts, never the
// flat owner-survey average, because servicing grows with distance.

import type { EconDataset, EnergyPlan, EvModel, GasModel, MaintenanceProfile } from '../../data/econ/types.ts';
import { cmp, todayInTaiwan } from './dates.ts';
import { date, horizonText, join, ntd, t } from './text.ts';
import type { Bounds, CostItem, PlanCreditStatus, RunningCosts, Situation } from './types.ts';

const b = (low: number, typical: number, high: number): Bounds => ({ low, typical, high });
const scale = (x: Bounds, k: number): Bounds => b(x.low * k, x.typical * k, x.high * k);
const add = (...xs: Bounds[]): Bounds => xs.reduce((a, x) => b(a.low + x.low, a.typical + x.typical, a.high + x.high), b(0, 0, 0));
export const round = (x: Bounds): Bounds => b(Math.round(x.low), Math.round(x.typical), Math.round(x.high));

/**
 * Monthly maintenance. Low = the manufacturer schedule at this mileage priced at the cheapest
 * parts (it grows with distance: more kilometres mean more oil changes or service visits); middle
 * = the MOTC owner average, but never below that schedule low; high = the schedule at the dearest
 * prices (never below the middle).
 */
export function maintenanceMonthly(m: MaintenanceProfile, km: number): Bounds {
  const book =
    m.kind === 'per-km'
      ? scale(b(m.perKm.low, m.perKm.typical, m.perKm.high), km)
      : scale(b(m.perVisit.low, m.perVisit.typical, m.perVisit.high), Math.max(m.minVisitsPerYear, (km * 12) / m.intervalKm) / 12);
  const owner = m.ownerAverage.value / 12;
  const typical = Math.max(owner, book.low);
  return b(book.low, typical, Math.max(book.high, typical));
}

export interface EvEnergy {
  planFee: number;
  energy: Bounds;
}

/** Electric energy cost for `km` in a month on `plan` (plan fee separate). */
export function evEnergy(model: EvModel, plan: EnergyPlan, km: number, offWindowShare: number): EvEnergy {
  const e = model.efficiency;
  // units per month: fewer units when efficiency is high
  const units = b(km / e.high, km / e.typical, km / e.low);
  const u = plan.usage;
  switch (u.kind) {
    case 'per-unit':
      return { planFee: plan.monthlyFee, energy: scale(units, u.rate) };
    case 'time-window':
      return { planFee: plan.monthlyFee, energy: b(0, units.typical * offWindowShare * u.offWindowRate, units.high * u.offWindowRate) };
    case 'credit': {
      const over = (used: number, allowance: number) => Math.max(0, used - allowance) * u.overageRate;
      return { planFee: plan.monthlyFee, energy: b(over(units.low, u.allowance.high), over(units.typical, u.allowance.typical), over(units.high, u.allowance.low)) };
    }
    case 'tariff': {
      // Energy drawn from the socket = energy in the battery × charger losses.
      const loss = u.losses ?? { low: 1, typical: 1, high: 1 };
      return { planFee: plan.monthlyFee, energy: b(units.low * u.rate.low * loss.low, units.typical * u.rate.typical * loss.typical, units.high * u.rate.high * loss.high) };
    }
  }
}

/** Gasoline fuel cost per month at a pump price. */
export function gasFuel(model: GasModel, km: number, price: number, realWorldKmPerL: number): Bounds {
  const official = model.fuelEconomy?.value;
  if (!official) throw new Error(`[calc] Gasoline model "${model.id}" has no fuel economy`);
  const best = Math.max(official, realWorldKmPerL);
  const worst = Math.min(official, realWorldKmPerL);
  const low = (km / best) * price;
  const high = (km / worst) * price;
  return b(low, (low + high) / 2, high);
}

function maintenanceSource(m: MaintenanceProfile): Pick<CostItem, 'sources' | 'confidence'> {
  const band = m.kind === 'per-km' ? m.perKm : m.perVisit;
  return { sources: [...m.ownerAverage.sources, ...band.sources].filter((x, i, a) => a.indexOf(x) === i), confidence: 'secondary' };
}

function maintenanceNote(m: MaintenanceProfile) {
  const band = m.kind === 'per-km' ? m.perKm : m.perVisit;
  return t(
    `中間值為交通部調查車主自報的平均每年${ntd(m.ownerAverage.value)['zh-TW']}，騎得比平均多時改用依原廠保養表推算的下限；低值是這個里程照原廠保養表、以最便宜零件價格計算的金額，高值以較貴的價格計算。${band.note?.['zh-TW'] ?? ''}`,
    `Middle value: the MOTC owner-reported average of ${ntd(m.ownerAverage.value).en} a year, raised to the schedule-based minimum if you ride more than average; the low end is the manufacturer schedule at this mileage priced at the cheapest parts, the high end at dearer prices. ${band.note?.en ?? ''}`.trim(),
  );
}

function item(id: CostItem['id'], label: CostItem['label'], monthly: Bounds, src: Pick<CostItem, 'sources' | 'confidence'>, extra: Partial<CostItem> = {}): CostItem {
  return { id, label, monthly: round(monthly), annual: round(scale(monthly, 12)), sources: src.sources, confidence: src.confidence, ...extra };
}

function schedule(items: { monthly: Bounds; months?: number; startMonth?: number }[], horizon: number) {
  const out = { low: [] as number[], typical: [] as number[], high: [] as number[] };
  for (let m = 1; m <= horizon; m++) {
    let lo = 0;
    let ty = 0;
    let hi = 0;
    for (const it of items) {
      const start = it.startMonth ?? 1;
      if (m < start) continue;
      if (it.months !== undefined && m >= start + it.months) continue;
      lo += it.monthly.low;
      ty += it.monthly.typical;
      hi += it.monthly.high;
    }
    out.low.push(lo);
    out.typical.push(ty);
    out.high.push(hi);
  }
  return out;
}

function finish(
  side: 'electric' | 'gasoline',
  items: CostItem[],
  raw: { monthly: Bounds; months?: number; startMonth?: number; ongoing: boolean }[],
  upfront: number,
  km: number,
  horizon: number,
  planCredits: RunningCosts['planCredits'] = { applied: [], ended: [] },
): RunningCosts {
  const sched = schedule(raw, horizon);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const monthly = round(add(...raw.filter((r) => r.ongoing).map((r) => r.monthly)));
  const avg = b((sum(sched.low) + upfront) / horizon, (sum(sched.typical) + upfront) / horizon, (sum(sched.high) + upfront) / horizon);
  const averageMonthly = round(avg);
  return {
    side,
    items,
    monthly,
    annual: round(scale(monthly, 12)),
    annualAverage: round(scale(avg, 12)),
    planCredits,
    averageMonthly,
    perKm: km > 0 ? b(Math.round((averageMonthly.low / km) * 100) / 100, Math.round((averageMonthly.typical / km) * 100) / 100, Math.round((averageMonthly.high / km) * 100) / 100) : null,
    upfront,
    schedule: sched,
  };
}

export function electricRunning(s: Situation, data: EconDataset, horizon: number, offWindowShare: number): RunningCosts {
  const on = s.date ?? todayInTaiwan();
  const model = data.evModels.find((m) => m.id === s.electricModel);
  const plan = data.plans.find((p) => p.id === s.energyPlan);
  if (!model) throw new Error(`[calc] Unknown electric model "${s.electricModel}"`);
  if (!plan) throw new Error(`[calc] Unknown energy plan "${s.energyPlan}"`);
  if (plan.calculator !== true) throw new Error(`[calc] Plan "${plan.id}" is not available in the calculator`);
  if (!model.plans.includes(plan.id)) throw new Error(`[calc] Plan "${plan.id}" does not fit model "${model.id}"`);
  const km = s.monthlyKm;
  const items: CostItem[] = [];
  const raw: { monthly: Bounds; months?: number; startMonth?: number; ongoing: boolean }[] = [];
  const energy = evEnergy(model, plan, km, offWindowShare);
  const planSrc = { sources: plan.sources, confidence: plan.confidence };
  const energySrc = { sources: [...plan.sources, ...model.efficiency.sources].filter((x, i, a) => a.indexOf(x) === i), confidence: plan.confidence === 'secondary' || model.efficiency.confidence === 'secondary' ? ('secondary' as const) : ('verified' as const) };

  if (plan.monthlyFee > 0) {
    items.push(item('plan-fee', t(`${plan.name['zh-TW']}月租費`, `${plan.name.en}: monthly fee`), b(plan.monthlyFee, plan.monthlyFee, plan.monthlyFee), planSrc, { note: plan.terms }));
    raw.push({ monthly: b(plan.monthlyFee, plan.monthlyFee, plan.monthlyFee), ongoing: true });
  }
  const energyLabel =
    plan.usage.kind === 'credit'
      ? t('超出額度的電池使用費', 'Battery use beyond the included allowance')
      : plan.usage.kind === 'time-window'
        ? t('免費時段外的換電費', 'Swaps outside the free windows')
        : plan.usage.kind === 'tariff'
          ? t('充電電費', 'Electricity for charging')
          : t('電池使用費（按用量）', 'Battery use (pay per use)');
  const energyNote =
    plan.usage.kind === 'time-window'
      ? t(`低值假設全部在免費時段換電，高值假設全部在時段外，中間值假設${Math.round(offWindowShare * 100)}%在時段外。`, `Low assumes every swap is in a free window, high assumes none are, middle assumes ${Math.round(offWindowShare * 100)}% are outside.`)
      : plan.usage.kind === 'tariff'
        ? join(plan.usage.rate.typicalBasis, plan.usage.losses?.basis ?? t('', ''), plan.terms)
        : plan.usage.kind === 'credit'
          ? plan.usage.allowance.typicalBasis
          : plan.monthlyFee === 0
            ? plan.terms
            : undefined;
  items.push(item('energy', energyLabel, energy.energy, energySrc, energyNote ? { note: energyNote } : {}));
  raw.push({ monthly: energy.energy, ongoing: true });

  let upfront = 0;
  if (plan.setupFee) {
    const months = plan.lockInMonths ?? 24;
    const fee = plan.setupFee.value;
    const per = fee / months;
    upfront = fee;
    const renewals: number[] = [];
    if (plan.setupFeeRenews) for (let m = months + 1; m <= horizon; m += months) renewals.push(m);
    // A renewal near the end buys months beyond the comparison: count only the share inside it
    // (the payment in month 49 covers months 49–72, so half of it falls inside 60 months).
    const inside = (m: number) => Math.min(1, (horizon - m + 1) / months);
    for (const m of renewals) raw.push({ monthly: b(fee * inside(m), fee * inside(m), fee * inside(m)), months: 1, startMonth: m, ongoing: false });
    const partial = renewals.filter((m) => inside(m) < 1);
    const partialNote = partial.length
      ? t(
          `第${partial[0]}個月付的設定費涵蓋第${partial[0]}至${partial[0] + months - 1}個月，超出${horizonText(horizon)['zh-TW']}的試算期，所以只計入期內的${ntd(fee * inside(partial[0]))['zh-TW']}。`,
          ` The fee paid in month ${partial[0]} covers months ${partial[0]}–${partial[0] + months - 1}, beyond the ${horizonText(horizon).en} comparison, so only the ${ntd(fee * inside(partial[0])).en} for months inside it is counted.`,
        )
      : t('', '');
    items.push(
      item('setup-fee', t('設定費（攤提於綁約期）', 'Setup fee (spread over the contract)'), b(per, per, per), { sources: plan.setupFee.sources, confidence: plan.setupFee.confidence }, {
        months,
        paidUpfront: fee,
        note: renewals.length
          ? join(
              t(
                `開通時付${ntd(fee)['zh-TW']}，每${months}個月續約時再付一次（試算期內第${renewals.join('、')}個月）；這裡平均攤在綁約期顯示，累計花費則算在實際付款的月份。`,
                `${ntd(fee).en} at activation and again at each ${months}-month renewal (month${renewals.length > 1 ? 's' : ''} ${renewals.join(', ')} within the horizon); shown here spread over the contract, and counted in the month it is paid in the cumulative cost.`,
              ),
              partialNote,
            )
          : t(`開通時一次付清${ntd(fee)['zh-TW']}；這裡把它平均攤在${months}個月綁約期顯示，累計花費則算在購車當月。`, `Paid once at activation (${ntd(fee).en}); shown here spread over the ${months}-month contract, and counted at purchase in the cumulative cost.`),
      }),
    );
  }
  const credits: RunningCosts['planCredits'] = { applied: [], ended: [] };
  for (const c of data.planCredits) {
    const planOk = c.plans === 'any' ? plan.operator === 'ionex' || plan.operator === 'gogoro' : c.plans.includes(plan.id);
    const modelOk = c.models === 'any' || c.models.includes(model.id);
    if (!planOk || !modelOk || cmp(on, c.validFrom) < 0) continue;
    const status: PlanCreditStatus = { id: c.id, name: c.name, perMonth: c.perMonth, months: c.months, total: c.perMonth * c.months, validTo: c.validTo, ...(c.windowRule ? { rule: c.windowRule } : {}), sources: c.sources };
    if (cmp(on, c.validTo) > 0) {
      credits.ended.push(status);
      continue;
    }
    credits.applied.push(status);
    const credit = b(-c.perMonth, -c.perMonth, -c.perMonth);
    const window = t(`須在${date(c.validTo)['zh-TW']}以前完成。`, `Must be completed by ${date(c.validTo).en}.`);
    items.push(item('plan-credit', c.name, credit, { sources: c.sources, confidence: c.confidence }, { months: c.months, note: join(c.windowRule ?? window, c.note ?? t('', '')) }));
    raw.push({ monthly: credit, months: c.months, ongoing: false });
  }
  const maint = data.maintenance.find((m) => m.id === model.maintenance);
  if (!maint) throw new Error(`[calc] Unknown maintenance profile "${model.maintenance}"`);
  const mm = maintenanceMonthly(maint, km);
  items.push(item('maintenance', maint.label, mm, maintenanceSource(maint), { note: maintenanceNote(maint) }));
  raw.push({ monthly: mm, ongoing: true });

  const road = data.fees.roadFeeElectric;
  items.push(item('road-fee', t('公路養管費', 'Road maintenance fee'), b(0, 0, 0), road, { note: road.futureNote }));
  const lic = data.fees.licenceTax;
  items.push(item('licence-tax', t('使用牌照稅', 'Licence tax'), b(lic.value / 12, lic.value / 12, lic.value / 12), lic, { note: lic.note }));
  const ins = data.fees.compulsoryInsurance;
  items.push(item('insurance', t('強制險', 'Compulsory insurance'), b(ins.value / 12, ins.value / 12, ins.value / 12), ins, { note: ins.note }));
  raw.push({ monthly: b(ins.value / 12, ins.value / 12, ins.value / 12), ongoing: true });
  items.push(item('inspection', t('排氣定期檢驗', 'Emission test'), b(0, 0, 0), data.fees.inspection, { note: t('電動機車不需排氣檢驗。', 'Electric scooters need no emission test.') }));

  return finish('electric', items, raw, upfront, km, horizon, credits);
}

export function gasolineRunning(s: Situation, data: EconDataset, horizon: number, pricePerLitre?: number): RunningCosts {
  const model = data.gasModels.find((m) => m.id === s.gasolineModel);
  if (!model) throw new Error(`[calc] Unknown gasoline model "${s.gasolineModel}"`);
  const km = s.monthlyKm;
  const price = pricePerLitre ?? data.fuel.petrol95.value;
  const items: CostItem[] = [];
  const raw: { monthly: Bounds; months?: number; ongoing: boolean }[] = [];
  const fuel = gasFuel(model, km, price, data.fuel.realWorldKmPerL.value);
  const fuelSources = [...data.fuel.petrol95.sources, ...(model.fuelEconomy?.sources ?? []), ...data.fuel.realWorldKmPerL.sources].filter((x, i, a) => a.indexOf(x) === i);
  items.push(
    item('energy', t('油錢（95無鉛）', 'Fuel (95 unleaded)'), fuel, { sources: fuelSources, confidence: 'secondary' }, {
      note: t(
        `以每公升${price}元計；低值用官方油耗每公升${model.fuelEconomy?.value}公里，高值用實際騎乘常見的每公升${data.fuel.realWorldKmPerL.value}公里，中間值取兩者平均。`,
        `At NT$${price} a litre; low uses the official ${model.fuelEconomy?.value} km/L, high a real-world ${data.fuel.realWorldKmPerL.value} km/L, middle the average of the two.`,
      ),
    }),
  );
  raw.push({ monthly: fuel, ongoing: true });
  const maint = data.maintenance.find((m) => m.id === 'gas-125');
  if (!maint) throw new Error('[calc] Missing maintenance profile "gas-125"');
  const mm = maintenanceMonthly(maint, km);
  items.push(item('maintenance', maint.label, mm, maintenanceSource(maint), { note: maintenanceNote(maint) }));
  raw.push({ monthly: mm, ongoing: true });
  const band = [...data.fees.roadFeeGasoline].sort((a, x) => a.upToCc - x.upToCc).find((x) => model.displacementCc <= x.upToCc);
  if (!band) throw new Error(`[calc] No road-fee band for ${model.displacementCc}cc`);
  const roadMonthly = band.perYear.value / 12;
  items.push(item('road-fee', t('公路養管費', 'Road maintenance fee'), b(roadMonthly, roadMonthly, roadMonthly), band.perYear, { annual: b(band.perYear.value, band.perYear.value, band.perYear.value) }));
  raw.push({ monthly: b(roadMonthly, roadMonthly, roadMonthly), ongoing: true });
  const lic = data.fees.licenceTax;
  items.push(item('licence-tax', t('使用牌照稅', 'Licence tax'), b(lic.value / 12, lic.value / 12, lic.value / 12), lic, { note: lic.note }));
  const ins = data.fees.compulsoryInsurance;
  items.push(item('insurance', t('強制險', 'Compulsory insurance'), b(ins.value / 12, ins.value / 12, ins.value / 12), ins, { note: ins.note }));
  raw.push({ monthly: b(ins.value / 12, ins.value / 12, ins.value / 12), ongoing: true });
  items.push(item('inspection', t('排氣定期檢驗', 'Emission test'), b(0, 0, 0), data.fees.inspection, { note: data.fees.inspection.note }));
  return finish('gasoline', items, raw, 0, km, horizon);
}
