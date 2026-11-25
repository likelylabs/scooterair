// Evaluate a programme's structured conditions against a situation. Pure functions.
//
// Unknown inputs: when a condition depends on something the buyer did not tell us (residency
// date, old-scooter registration date, age for an 18+ rule), the condition is treated as met
// and an assumption is recorded, so the result says exactly what it took for granted.
// Age-band top-ups are never assumed.

import type { Condition, EvModel, GasModel, JurisdictionId } from '../../data/econ/types.ts';
import { fullYears, normalise, onOrBefore } from './dates.ts';
import { date, t } from './text.ts';
import type { L10n } from './text.ts';
import type { Situation } from './types.ts';

export type CondResult = { ok: true; assumptions: L10n[] } | { ok: false; failed: string; why: L10n; ambiguous?: boolean };

export interface EligibilityContext {
  s: Situation;
  side: 'electric' | 'gasoline';
  ev?: EvModel;
  gas?: GasModel;
  /** Jurisdiction of the programme being tested ('central' for national programmes). */
  programmeJurisdiction: JurisdictionId | 'central';
}

const OK: CondResult = { ok: true, assumptions: [] };
const fail = (failed: string, why: L10n, ambiguous = false): CondResult => ({ ok: false, failed, why, ...(ambiguous ? { ambiguous: true } : {}) });
const assume = (a: L10n): CondResult => ({ ok: true, assumptions: [a] });

const flagLabels: Record<string, L10n> = {
  childUnder12: t('家中有12歲以下兒童', 'a child aged 12 or under in the household'),
  schoolChild: t('子女就讀國小至高中職', 'a child in elementary to senior high school'),
  deliveryRider: t('外送員', 'working as a delivery rider'),
  indigenous: t('原住民身分', 'indigenous status'),
  medicalWorker: t('醫護機構工作者', 'working at a medical or nursing institution'),
  neighbourhoodWatch: t('守望相助隊隊員', 'neighbourhood-watch membership'),
  disasterAffected: t('天然災害災損戶', 'a disaster-affected household'),
  remoteDistrict: t('居住在偏遠地區', 'living in a designated remote district'),
  previousLocalSubsidy: t('曾領過本縣市機車補助', 'having received this city\'s scooter subsidy before'),
  foreignNational: t('外籍人士', 'being a foreign national'),
};

export function checkCondition(c: Condition, ctx: EligibilityContext): CondResult {
  const { s } = ctx;
  const h = s.household;
  const old = s.scrap;
  switch (c.kind) {
    case 'scrap':
      return old ? OK : fail(c.kind, t('需要淘汰一輛舊燃油機車', 'requires scrapping an old gasoline scooter'));
    case 'scrap-engine':
      if (!old) return fail(c.kind, t('需要淘汰一輛舊燃油機車', 'requires scrapping an old gasoline scooter'));
      return c.engines.includes(old.engine)
        ? OK
        : fail(c.kind, c.engines.includes('two-stroke') ? t('舊車必須是二行程機車', 'the old scooter must be a two-stroke') : t('舊車必須是四行程機車', 'the old scooter must be a four-stroke'));
    case 'scrap-min-age': {
      if (!old) return fail(c.kind, t('需要淘汰一輛舊燃油機車', 'requires scrapping an old gasoline scooter'));
      const years = fullYears(normalise(old.builtOn), s.date);
      return years >= c.years ? OK : fail(c.kind, t(`舊車須出廠滿${c.years}年（目前${years}年）`, `the old scooter must be at least ${c.years} years old (it is ${years})`));
    }
    case 'scrap-built': {
      if (!old) return fail(c.kind, t('需要淘汰一輛舊燃油機車', 'requires scrapping an old gasoline scooter'));
      const built = normalise(old.builtOn);
      if (c.onOrBefore && !onOrBefore(built, c.onOrBefore)) {
        const d = date(c.onOrBefore);
        return fail(c.kind, t(`舊車須在${d['zh-TW']}以前出廠`, `the old scooter must be built on or before ${d.en}`));
      }
      if (c.onOrAfter && !onOrBefore(c.onOrAfter, built)) {
        const d = date(c.onOrAfter);
        return fail(c.kind, t(`舊車須在${d['zh-TW']}以後出廠`, `the old scooter must be built on or after ${d.en}`));
      }
      return OK;
    }
    case 'scrap-registered-locally': {
      if (!old) return fail(c.kind, t('需要淘汰一輛舊燃油機車', 'requires scrapping an old gasoline scooter'));
      if (!old.registeredLocallySince) {
        const rule = c.byDate
          ? t(`${date(c.byDate)['zh-TW']}前已在本縣市設籍`, `registered locally by ${date(c.byDate).en}`)
          : c.minYears
            ? t(`在本縣市設籍滿${c.minYears}年`, `registered locally for at least ${c.minYears} year${c.minYears > 1 ? 's' : ''}`)
            : t('在本縣市設籍', 'registered locally');
        return assume(t(`假設舊車${rule['zh-TW']}`, `Assumes the old scooter is ${rule.en}`));
      }
      if (c.byDate && !onOrBefore(old.registeredLocallySince, c.byDate)) {
        return fail(c.kind, t(`舊車須在${date(c.byDate)['zh-TW']}前設籍本縣市`, `the old scooter must be registered locally by ${date(c.byDate).en}`));
      }
      if (c.minYears && fullYears(old.registeredLocallySince, s.date) < c.minYears) {
        return fail(c.kind, t(`舊車須在本縣市設籍滿${c.minYears}年`, `the old scooter must have been registered locally for ${c.minYears} year(s)`));
      }
      return OK;
    }
    case 'scrap-max-cc': {
      if (!old) return fail(c.kind, t('需要淘汰一輛舊燃油機車', 'requires scrapping an old gasoline scooter'));
      return (old.displacementCc ?? 125) <= c.cc ? OK : fail(c.kind, t(`舊車須為${c.cc}cc以下`, `the old scooter must be ${c.cc}cc or less`));
    }
    case 'scrap-second-scooter':
      return old?.secondScooter ? OK : fail(c.kind, t('須同時淘汰第二輛舊機車', 'requires scrapping a second old scooter'));
    case 'ev-plate-class':
      if (!ctx.ev) return fail(c.kind, t('只適用電動機車', 'electric scooters only'));
      return c.classes.includes(ctx.ev.plateClass) ? OK : fail(c.kind, t('不適用這個車種等級', 'does not cover this vehicle class'));
    case 'moea-class':
      if (!ctx.ev) return fail(c.kind, t('只適用電動機車', 'electric scooters only'));
      return c.classes.includes(ctx.ev.moeaClass) ? OK : fail(c.kind, t('不適用這個補助等級', 'does not cover this subsidy class'));
    case 'domestic-cells':
      if (!ctx.ev) return fail(c.kind, t('只適用電動機車', 'electric scooters only'));
      if (ctx.ev.domesticCells === 'yes') return OK;
      return ctx.ev.domesticCells === 'unknown'
        ? fail(c.kind, t('無法確認這款車是否使用國產電池芯', 'could not confirm that this model uses Taiwan-made cells'), true)
        : fail(c.kind, t('這款車未使用國產電池芯', 'this model does not use Taiwan-made cells'));
    case 'battery-swap':
      if (!ctx.ev) return fail(c.kind, t('只適用電動機車', 'electric scooters only'));
      return ctx.ev.battery.system === 'home' ? fail(c.kind, t('只適用租賃換電電池車款', 'swap-battery models only')) : OK;
    case 'gas-max-cc':
      if (!ctx.gas) return fail(c.kind, t('只適用燃油機車', 'gasoline scooters only'));
      return ctx.gas.displacementCc <= c.cc ? OK : fail(c.kind, t(`須為${c.cc}cc以下`, `must be ${c.cc}cc or less`));
    case 'household': {
      const want = c.value ?? true;
      const have = Boolean(h[c.flag]);
      if (have === want) {
        if (!want && h[c.flag] === undefined && c.flag === 'previousLocalSubsidy') {
          return assume(t('假設你從未領過本縣市的機車補助', 'Assumes you have never received this city\'s scooter subsidy'));
        }
        return OK;
      }
      const label = flagLabels[c.flag] ?? t(c.flag, c.flag);
      return want ? fail(c.kind, t(`須符合：${label['zh-TW']}`, `requires ${label.en}`)) : fail(c.kind, t(`不適用於${label['zh-TW']}`, `not available when ${label.en}`));
    }
    case 'income': {
      const level = h.income ?? 'none';
      if (c.levels.includes(level)) return OK;
      if (c.ambiguous?.includes(level)) {
        return fail(c.kind, t('公告只寫「中低收入戶」，低收入戶是否適用不明確，未計入；請向承辦單位確認', 'the notice says only "middle-low income"; whether low-income households qualify is unclear, so it is not counted (ask the bureau)'), true);
      }
      return fail(
        c.kind,
        c.levels.length === 1 && c.levels[0] === 'low'
          ? t('限低收入戶（中低收入戶不適用）', 'low-income households only (middle-low does not qualify)')
          : t('限中低收入戶或低收入戶', 'low or middle-low income households only'),
      );
    }
    case 'age': {
      if (h.age === undefined) {
        if (c.max === undefined && c.min !== undefined && c.min <= 18) return assume(t(`假設申請人已滿${c.min}歲`, `Assumes the applicant is at least ${c.min}`));
        return fail(c.kind, t('未提供年齡，年齡專案不計入', 'age not given, so age-band schemes are not counted'));
      }
      if (c.min !== undefined && h.age < c.min) return fail(c.kind, t(`須年滿${c.min}歲`, `must be at least ${c.min}`));
      if (c.max !== undefined && h.age > c.max) return fail(c.kind, t(`限${c.min ?? 0}至${c.max}歲`, `ages ${c.min ?? 0}–${c.max} only`));
      return OK;
    }
    case 'residency': {
      if (ctx.programmeJurisdiction !== 'central' && ctx.programmeJurisdiction !== s.jurisdiction) return fail(c.kind, t('須設籍於該縣市', 'requires household registration there'));
      if (!c.minYears && !c.registeredBy) return OK;
      if (!h.residentSince) {
        const rule = c.registeredBy
          ? t(`${date(c.registeredBy)['zh-TW']}前已設籍`, `registered there by ${date(c.registeredBy).en}`)
          : t(`設籍滿${c.minYears}年`, `registered there for at least ${c.minYears} year${(c.minYears ?? 0) > 1 ? 's' : ''}`);
        return assume(t(`假設你已${rule['zh-TW']}`, `Assumes your household is ${rule.en}`));
      }
      if (c.registeredBy && !onOrBefore(h.residentSince, c.registeredBy)) {
        return fail(c.kind, t(`須在${date(c.registeredBy)['zh-TW']}前設籍`, `household must be registered by ${date(c.registeredBy).en}`));
      }
      if (c.minYears && fullYears(h.residentSince, s.date) < c.minYears) {
        return fail(c.kind, t(`須設籍滿${c.minYears}年`, `household must have been registered for ${c.minYears} year(s)`));
      }
      return OK;
    }
    case 'region':
      return c.jurisdictions.includes(s.jurisdiction) ? OK : fail(c.kind, t('限特定縣市居民', 'residents of specific areas only'));
    case 'any-of': {
      const results = c.conditions.map((x) => checkCondition(x, ctx));
      const good = results.find((r) => r.ok);
      if (good) return good;
      const amb = results.find((r) => !r.ok && r.ambiguous);
      return amb ?? results[0] ?? fail(c.kind, t('不符合資格', 'not eligible'));
    }
  }
}

export function checkAll(conditions: Condition[], ctx: EligibilityContext): CondResult {
  const assumptions: L10n[] = [];
  for (const c of conditions) {
    const r = checkCondition(c, ctx);
    if (!r.ok) return r;
    assumptions.push(...r.assumptions);
  }
  return { ok: true, assumptions };
}
