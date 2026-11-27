// Monthly and yearly running costs for each side, itemised, with low / typical / high bounds,
// plus a month-by-month schedule for the cumulative series.
//
// Bounds: "low" is the cheapest plausible case for that side and "high" the dearest. Electric:
// best efficiency and allowance vs worst. Gasoline: official test km/L vs real-world 45 km/L.
// Maintenance: the low end is the manufacturer schedule priced at the cheapest parts, never the
// flat owner-survey average, because servicing grows with distance.

import type { EconDataset, EnergyPlan, EvModel, GasModel, MaintenanceProfile, PlanCredit } from '../../data/econ/types.ts';
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

/** The fee riders know as 燃料費; the news calls it by its newer name, 公路養管費. */
const ROAD_FEE = t('燃料費（公路養管費）', 'Fuel-use fee (road maintenance fee)');

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

/** One schedule entry: a monthly amount, for `months` months from `startMonth` (default: all). */
export interface RawItem {
  monthly: Bounds;
  months?: number;
  startMonth?: number;
  ongoing: boolean;
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

/**
 * The sum of the typical schedule over the horizon, with exactly the same additions in the same
 * order as `schedule()` followed by a left-to-right sum, so the result is bit-for-bit the same
 * number, without building the arrays.
 */
export function typicalTotal(items: RawItem[], horizon: number): number {
  let total = 0;
  for (let m = 1; m <= horizon; m++) {
    let ty = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const start = it.startMonth ?? 1;
      if (m < start) continue;
      if (it.months !== undefined && m >= start + it.months) continue;
      ty += it.monthly.typical;
    }
    total = total + ty;
  }
  return total;
}

function finish(
  side: 'electric' | 'gasoline',
  items: CostItem[],
  raw: RawItem[],
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

/** The numbers behind an electric running-cost result (no text): shared by electricRunning and the parity scans. */
export interface ElectricParts {
  energy: EvEnergy;
  maintenance: Bounds;
  /** Schedule entries, in the order the full result adds them. */
  raw: RawItem[];
  /** Setup fee paid at month 0. */
  upfront: number;
  /** Months in which the setup fee is paid again. */
  renewals: number[];
  /** Plan credits that apply on the date, and ones that have ended. */
  credits: { applied: PlanCredit[]; ended: PlanCredit[] };
}

/** Resolve and check the model and plan of a situation (throws on a bad id, as electricRunning does). */
export function electricChoice(s: Pick<Situation, 'electricModel' | 'energyPlan'>, data: EconDataset): { model: EvModel; plan: EnergyPlan } {
  const model = data.evModels.find((m) => m.id === s.electricModel);
  const plan = data.plans.find((p) => p.id === s.energyPlan);
  if (!model) throw new Error(`[calc] Unknown electric model "${s.electricModel}"`);
  if (!plan) throw new Error(`[calc] Unknown energy plan "${s.energyPlan}"`);
  if (plan.calculator !== true) throw new Error(`[calc] Plan "${plan.id}" is not available in the calculator`);
  if (!model.plans.includes(plan.id)) throw new Error(`[calc] Plan "${plan.id}" does not fit model "${model.id}"`);
  return { model, plan };
}

function maintenanceProfile(data: EconDataset, id: string): MaintenanceProfile {
  const maint = data.maintenance.find((m) => m.id === id);
  if (!maint) throw new Error(`[calc] Unknown maintenance profile "${id}"`);
  return maint;
}

/**
 * The electric schedule for a model, plan and date: everything that does not depend on distance
 * is worked out once, and `at(km)` adds the two parts that do (energy and maintenance).
 */
export function electricSchedule(model: EvModel, plan: EnergyPlan, on: string, data: EconDataset, horizon: number, offWindowShare: number) {
  const head: RawItem[] = [];
  if (plan.monthlyFee > 0) head.push({ monthly: b(plan.monthlyFee, plan.monthlyFee, plan.monthlyFee), ongoing: true });
  const middle: RawItem[] = [];
  let upfront = 0;
  const renewals: number[] = [];
  if (plan.setupFee) {
    const months = plan.lockInMonths ?? 24;
    const fee = plan.setupFee.value;
    upfront = fee;
    if (plan.setupFeeRenews) for (let m = months + 1; m <= horizon; m += months) renewals.push(m);
    // A renewal near the end buys months beyond the comparison: count only the share inside it
    // (the payment in month 49 covers months 49–72, so half of it falls inside 60 months).
    const inside = (m: number) => Math.min(1, (horizon - m + 1) / months);
    for (const m of renewals) middle.push({ monthly: b(fee * inside(m), fee * inside(m), fee * inside(m)), months: 1, startMonth: m, ongoing: false });
  }
  const credits: ElectricParts['credits'] = { applied: [], ended: [] };
  for (const c of data.planCredits) {
    const planOk = c.plans === 'any' ? plan.operator === 'ionex' || plan.operator === 'gogoro' : c.plans.includes(plan.id);
    const modelOk = c.models === 'any' || c.models.includes(model.id);
    if (!planOk || !modelOk || cmp(on, c.validFrom) < 0) continue;
    if (cmp(on, c.validTo) > 0) {
      credits.ended.push(c);
      continue;
    }
    credits.applied.push(c);
    middle.push({ monthly: b(-c.perMonth, -c.perMonth, -c.perMonth), months: c.months, ongoing: false });
  }
  const maint = maintenanceProfile(data, model.maintenance);
  const ins = data.fees.compulsoryInsurance;
  const insurance: RawItem = { monthly: b(ins.value / 12, ins.value / 12, ins.value / 12), ongoing: true };
  return {
    upfront,
    renewals,
    credits,
    /** The parts at `km` a month; `raw` is in the order the full result adds it. */
    at(km: number): ElectricParts {
      const energy = evEnergy(model, plan, km, offWindowShare);
      const mm = maintenanceMonthly(maint, km);
      const raw: RawItem[] = [...head, { monthly: energy.energy, ongoing: true }, ...middle, { monthly: mm, ongoing: true }, insurance];
      return { energy, maintenance: mm, raw, upfront, renewals, credits };
    },
  };
}

/** The numbers of an electric running-cost result at `km` a month, on date `on`. */
export function electricParts(model: EvModel, plan: EnergyPlan, km: number, on: string, data: EconDataset, horizon: number, offWindowShare: number): ElectricParts {
  return electricSchedule(model, plan, on, data, horizon, offWindowShare).at(km);
}

export function electricRunning(s: Situation, data: EconDataset, horizon: number, offWindowShare: number): RunningCosts {
  const on = s.date ?? todayInTaiwan();
  const { model, plan } = electricChoice(s, data);
  const km = s.monthlyKm;
  const parts = electricParts(model, plan, km, on, data, horizon, offWindowShare);
  const items: CostItem[] = [];
  const energy = parts.energy;
  const planSrc = { sources: plan.sources, confidence: plan.confidence };
  const energySrc = { sources: [...plan.sources, ...model.efficiency.sources].filter((x, i, a) => a.indexOf(x) === i), confidence: plan.confidence === 'secondary' || model.efficiency.confidence === 'secondary' ? ('secondary' as const) : ('verified' as const) };

  if (plan.monthlyFee > 0) {
    items.push(item('plan-fee', t(`${plan.name['zh-TW']}月租費`, `${plan.name.en}: monthly fee`), b(plan.monthlyFee, plan.monthlyFee, plan.monthlyFee), planSrc, { note: plan.terms }));
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

  if (plan.setupFee) {
    const months = plan.lockInMonths ?? 24;
    const fee = plan.setupFee.value;
    const per = fee / months;
    const renewals = parts.renewals;
    const inside = (m: number) => Math.min(1, (horizon - m + 1) / months);
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
  const status = (c: PlanCredit): PlanCreditStatus => ({ id: c.id, name: c.name, perMonth: c.perMonth, months: c.months, total: c.perMonth * c.months, validTo: c.validTo, ...(c.windowRule ? { rule: c.windowRule } : {}), sources: c.sources });
  const credits: RunningCosts['planCredits'] = { applied: parts.credits.applied.map(status), ended: parts.credits.ended.map(status) };
  for (const c of parts.credits.applied) {
    const credit = b(-c.perMonth, -c.perMonth, -c.perMonth);
    const window = t(`須在 ${date(c.validTo)['zh-TW']}以前完成。`, `Must be completed by ${date(c.validTo).en}.`);
    items.push(item('plan-credit', c.name, credit, { sources: c.sources, confidence: c.confidence }, { months: c.months, note: join(c.windowRule ?? window, c.note ?? t('', '')) }));
  }
  const maint = maintenanceProfile(data, model.maintenance);
  items.push(item('maintenance', maint.label, parts.maintenance, maintenanceSource(maint), { note: maintenanceNote(maint) }));

  const road = data.fees.roadFeeElectric;
  items.push(item('road-fee', ROAD_FEE, b(0, 0, 0), road, { note: road.futureNote }));
  const lic = data.fees.licenceTax;
  items.push(item('licence-tax', t('使用牌照稅', 'Licence tax'), b(lic.value / 12, lic.value / 12, lic.value / 12), lic, { note: lic.note }));
  const ins = data.fees.compulsoryInsurance;
  items.push(item('insurance', t('強制險', 'Compulsory insurance'), b(ins.value / 12, ins.value / 12, ins.value / 12), ins, { note: ins.note }));
  items.push(item('inspection', t('排氣定期檢驗', 'Emission test'), b(0, 0, 0), data.fees.inspection, { note: t('電動機車不需排氣檢驗。', 'Electric scooters need no emission test.') }));

  return finish('electric', items, parts.raw, parts.upfront, km, horizon, credits);
}

/** The numbers of a gasoline running-cost result (no text): shared by gasolineRunning and the parity scans. */
export interface GasolineParts {
  fuel: Bounds;
  maintenance: Bounds;
  roadMonthly: number;
  raw: RawItem[];
}

function roadBand(model: GasModel, data: EconDataset) {
  const band = [...data.fees.roadFeeGasoline].sort((a, x) => a.upToCc - x.upToCc).find((x) => model.displacementCc <= x.upToCc);
  if (!band) throw new Error(`[calc] No road-fee band for ${model.displacementCc}cc`);
  return band;
}

export function gasolineParts(model: GasModel, km: number, price: number, data: EconDataset): GasolineParts {
  const fuel = gasFuel(model, km, price, data.fuel.realWorldKmPerL.value);
  const mm = maintenanceMonthly(maintenanceProfile(data, 'gas-125'), km);
  const roadMonthly = roadBand(model, data).perYear.value / 12;
  const ins = data.fees.compulsoryInsurance;
  const raw: RawItem[] = [
    { monthly: fuel, ongoing: true },
    { monthly: mm, ongoing: true },
    { monthly: b(roadMonthly, roadMonthly, roadMonthly), ongoing: true },
    { monthly: b(ins.value / 12, ins.value / 12, ins.value / 12), ongoing: true },
  ];
  return { fuel, maintenance: mm, roadMonthly, raw };
}

export function gasolineModel(s: Pick<Situation, 'gasolineModel'>, data: EconDataset): GasModel {
  const model = data.gasModels.find((m) => m.id === s.gasolineModel);
  if (!model) throw new Error(`[calc] Unknown gasoline model "${s.gasolineModel}"`);
  return model;
}

export function gasolineRunning(s: Situation, data: EconDataset, horizon: number, pricePerLitre?: number): RunningCosts {
  const model = gasolineModel(s, data);
  const km = s.monthlyKm;
  const price = pricePerLitre ?? data.fuel.petrol95.value;
  const parts = gasolineParts(model, km, price, data);
  const items: CostItem[] = [];
  const fuelSources = [...data.fuel.petrol95.sources, ...(model.fuelEconomy?.sources ?? []), ...data.fuel.realWorldKmPerL.sources].filter((x, i, a) => a.indexOf(x) === i);
  items.push(
    item('energy', t('油錢（95無鉛）', 'Fuel (95 unleaded)'), parts.fuel, { sources: fuelSources, confidence: 'secondary' }, {
      note: t(
        `以每公升${price}元計；低值用官方油耗每公升${model.fuelEconomy?.value}公里，高值用實際騎乘常見的每公升${data.fuel.realWorldKmPerL.value}公里，中間值取兩者平均。`,
        `At NT$${price} a litre; low uses the official ${model.fuelEconomy?.value} km/L, high a real-world ${data.fuel.realWorldKmPerL.value} km/L, middle the average of the two.`,
      ),
    }),
  );
  const maint = maintenanceProfile(data, 'gas-125');
  items.push(item('maintenance', maint.label, parts.maintenance, maintenanceSource(maint), { note: maintenanceNote(maint) }));
  const band = roadBand(model, data);
  const roadMonthly = parts.roadMonthly;
  items.push(
    item('road-fee', ROAD_FEE, b(roadMonthly, roadMonthly, roadMonthly), band.perYear, {
      annual: b(band.perYear.value, band.perYear.value, band.perYear.value),
      note: t(`就是每年繳的「汽車燃料使用費」，新聞也叫「公路養管費」：${model.displacementCc}cc一年${band.perYear.value}元。`, `The yearly fuel-use fee (汽車燃料使用費), also called the road maintenance fee: NT$${band.perYear.value} a year for ${model.displacementCc}cc.`),
    }),
  );
  const lic = data.fees.licenceTax;
  items.push(item('licence-tax', t('使用牌照稅', 'Licence tax'), b(lic.value / 12, lic.value / 12, lic.value / 12), lic, { note: lic.note }));
  const ins = data.fees.compulsoryInsurance;
  items.push(item('insurance', t('強制險', 'Compulsory insurance'), b(ins.value / 12, ins.value / 12, ins.value / 12), ins, { note: ins.note }));
  items.push(item('inspection', t('排氣定期檢驗', 'Emission test'), b(0, 0, 0), data.fees.inspection, { note: data.fees.inspection.note }));
  return finish('gasoline', items, parts.raw, 0, km, horizon);
}
