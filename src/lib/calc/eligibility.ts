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

/**
 * `ambiguous`: the rule itself is unclear for this buyer (reported as possible extra money).
 * `missing`: the buyer did not give the answer the rule needs (an age for an age band).
 */
export type CondResult = { ok: true; assumptions: L10n[] } | { ok: false; failed: string; why: L10n; ambiguous?: boolean; missing?: boolean };

export interface EligibilityContext {
  s: Situation;
  side: 'electric' | 'gasoline';
  ev?: EvModel;
  gas?: GasModel;
  /** Jurisdiction of the programme being tested ('central' for national programmes). */
  programmeJurisdiction: JurisdictionId | 'central';
  /** What the buyer's jurisdiction calls its remote districts (Taoyuan: Fuxing District). */
  remoteDistricts?: L10n;
}

const OK: CondResult = { ok: true, assumptions: [] };
const fail = (failed: string, why: L10n, ambiguous = false): CondResult => ({ ok: false, failed, why, ...(ambiguous ? { ambiguous: true } : {}) });
const assume = (a: L10n): CondResult => ({ ok: true, assumptions: [a] });

// Who a household rule is for, as a noun ("only for …" / "限…" and "not for …" / "不適用於…").
const flagLabels: Record<string, L10n> = {
  childUnder12: t('家中有12歲以下兒童的家庭', 'households with a child aged 12 or under'),
  schoolChild: t('子女就讀國小到高中職的家庭', 'households with a child in elementary to senior high school'),
  deliveryRider: t('外送員', 'delivery riders'),
  indigenous: t('原住民', 'indigenous people'),
  medicalWorker: t('醫護機構工作者', 'people who work at a medical or nursing institution'),
  neighbourhoodWatch: t('守望相助隊隊員', 'neighbourhood-watch members'),
  disasterAffected: t('天然災害災損戶', 'households hit by a natural disaster'),
  remoteDistrict: t('住在偏遠地區的人', 'people living in a designated remote district'),
  previousLocalSubsidy: t('以前領過這項規定排除的機車補助的人（本縣市的，部分縣市也包括環境部的）', 'people who have received a scooter subsidy this rule excludes (this city\'s, and in some places MOENV\'s)'),
  foreignNational: t('外籍人士', 'foreign nationals'),
};

/** What a scrap condition asks for, for a reader who has no scooter to scrap (R12: never just "an old scooter"). */
function scrapNeeded(c: Condition): L10n {
  switch (c.kind) {
    case 'scrap-engine':
      return c.engines.includes('two-stroke') && !c.engines.includes('four-stroke')
        ? t('要報廢一台二行程機車', 'requires scrapping a two-stroke scooter')
        : t('要報廢一台四行程機車', 'requires scrapping a four-stroke scooter');
    case 'scrap-min-age':
      return t(`要報廢一台出廠滿${c.years}年的燃油機車`, `requires scrapping a petrol scooter at least ${c.years} years old`);
    case 'scrap-built':
      if (c.onOrBefore && c.onOrAfter) return t(`要報廢一台 ${date(c.onOrAfter)['zh-TW']}到 ${date(c.onOrBefore)['zh-TW']}之間出廠的燃油機車`, `requires scrapping a petrol scooter built between ${date(c.onOrAfter).en} and ${date(c.onOrBefore).en}`);
      if (c.onOrBefore) return t(`要報廢一台 ${date(c.onOrBefore)['zh-TW']}以前出廠的燃油機車`, `requires scrapping a petrol scooter built on or before ${date(c.onOrBefore).en}`);
      return t(`要報廢一台 ${date(c.onOrAfter as string)['zh-TW']}以後出廠的燃油機車`, `requires scrapping a petrol scooter built on or after ${date(c.onOrAfter as string).en}`);
    case 'scrap-registered-locally':
      return t('要報廢一台在本縣市設籍的燃油機車', 'requires scrapping a petrol scooter registered here');
    case 'scrap-max-cc':
      return t(`要報廢一台${c.cc}cc以下的燃油機車`, `requires scrapping a petrol scooter of ${c.cc}cc or less`);
    default:
      return t('要報廢一台燃油機車（車齡規定見這項補助的條件）', 'requires scrapping a petrol scooter (see this line\'s conditions for the age rule)');
  }
}

export function checkCondition(c: Condition, ctx: EligibilityContext): CondResult {
  const { s } = ctx;
  const h = s.household;
  const old = s.scrap;
  switch (c.kind) {
    case 'scrap':
      return old ? OK : fail(c.kind, scrapNeeded(c));
    case 'scrap-engine':
      if (!old) return fail(c.kind, scrapNeeded(c));
      return c.engines.includes(old.engine)
        ? OK
        : fail(c.kind, c.engines.includes('two-stroke') ? t('要報廢的機車必須是二行程機車', 'the scooter you scrap must be a two-stroke') : t('要報廢的機車必須是四行程機車', 'the scooter you scrap must be a four-stroke'));
    case 'scrap-min-age': {
      if (!old) return fail(c.kind, scrapNeeded(c));
      const years = fullYears(normalise(old.builtOn), s.date as string);
      return years >= c.years ? OK : fail(c.kind, t(`要報廢的機車須出廠滿${c.years}年（目前${years}年）`, `the scooter you scrap must be at least ${c.years} years old (it is ${years})`));
    }
    case 'scrap-built': {
      if (!old) return fail(c.kind, scrapNeeded(c));
      const built = normalise(old.builtOn);
      if (c.onOrBefore && !onOrBefore(built, c.onOrBefore)) {
        const d = date(c.onOrBefore);
        return fail(c.kind, t(`要報廢的機車須在 ${d['zh-TW']}以前出廠`, `the scooter you scrap must be built on or before ${d.en}`));
      }
      if (c.onOrAfter && !onOrBefore(c.onOrAfter, built)) {
        const d = date(c.onOrAfter);
        return fail(c.kind, t(`要報廢的機車須在 ${d['zh-TW']}以後出廠`, `the scooter you scrap must be built on or after ${d.en}`));
      }
      return OK;
    }
    case 'scrap-registered-locally': {
      if (!old) return fail(c.kind, scrapNeeded(c));
      if (!old.registeredLocallySince) {
        const rule = c.byDate
          ? t(`${date(c.byDate)['zh-TW']}前已在本縣市設籍`, `registered locally by ${date(c.byDate).en}`)
          : c.minYears
            ? t(`在本縣市設籍滿${c.minYears}年`, `registered locally for at least ${c.minYears} year${c.minYears > 1 ? 's' : ''}`)
            : t('在本縣市設籍', 'registered locally');
        return assume(t(`假設要報廢的機車${rule['zh-TW']}`, `Assumes the scooter you scrap is ${rule.en}`));
      }
      if (c.byDate && !onOrBefore(old.registeredLocallySince, c.byDate)) {
        return fail(c.kind, t(`要報廢的機車須在 ${date(c.byDate)['zh-TW']}前設籍本縣市`, `the scooter you scrap must be registered locally by ${date(c.byDate).en}`));
      }
      if (c.minYears && fullYears(old.registeredLocallySince, s.date as string) < c.minYears) {
        return fail(c.kind, t(`要報廢的機車須在本縣市設籍滿${c.minYears}年`, `the scooter you scrap must have been registered locally for ${c.minYears} year(s)`));
      }
      return OK;
    }
    case 'scrap-max-cc': {
      if (!old) return fail(c.kind, scrapNeeded(c));
      return (old.displacementCc ?? 125) <= c.cc ? OK : fail(c.kind, t(`要報廢的機車須為${c.cc}cc以下`, `the scooter you scrap must be ${c.cc}cc or less`));
    }
    case 'scrap-second-scooter':
      return old?.secondScooter ? OK : fail(c.kind, t('要同時報廢第二台符合規定的機車', 'requires scrapping a second qualifying scooter'));
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
      if (!ctx.gas) return fail(c.kind, t('只適用燃油機車', 'petrol scooters only'));
      return ctx.gas.displacementCc <= c.cc ? OK : fail(c.kind, t(`須為${c.cc}cc以下`, `must be ${c.cc}cc or less`));
    case 'household': {
      const want = c.value ?? true;
      const have = Boolean(h[c.flag]);
      if (have === want) {
        if (!want && h[c.flag] === undefined && (c.flag === 'previousLocalSubsidy' || c.assumption)) {
          return assume(c.assumption ?? t('假設你從未領過本縣市的機車補助', 'Assumes you have never received this city\'s scooter subsidy'));
        }
        return OK;
      }
      if (c.why) return fail(c.kind, c.why, Boolean(c.ambiguous));
      const label =
        c.flag === 'remoteDistrict' && ctx.remoteDistricts
          ? t(`住在${ctx.remoteDistricts['zh-TW']}的人`, `people living in ${ctx.remoteDistricts.en}`)
          : (flagLabels[c.flag] ?? t(c.flag, c.flag));
      return want
        ? fail(c.kind, t(`限${label['zh-TW']}`, `only for ${label.en}`), Boolean(c.ambiguous))
        : fail(c.kind, t(`不適用於${label['zh-TW']}`, `not for ${label.en}`), Boolean(c.ambiguous));
    }
    case 'income': {
      const level = h.income ?? 'none';
      if (c.levels.includes(level)) return OK;
      if (c.ambiguous?.includes(level)) {
        return fail(c.kind, t('公告只寫「中低收入戶」，低收入戶是否適用不明確，未計入；請向承辦單位確認', 'the notice names only lower-middle-income households (中低收入戶); whether low-income households qualify is unclear, so it is not counted (ask the bureau)'), true);
      }
      const only = (lv: string) => c.levels.length === 1 && c.levels[0] === lv;
      return fail(
        c.kind,
        only('low')
          ? t('限低收入戶（中低收入戶不適用）', 'low-income households only (lower-middle-income households do not qualify)')
          : only('middle-low')
            ? c.ambiguous?.includes('low')
              ? t('限中低收入戶（低收入戶是否適用請向承辦單位確認）', 'lower-middle-income households only (ask the bureau whether low-income households qualify)')
              : t('限中低收入戶', 'lower-middle-income households only')
            : t('限中低收入戶或低收入戶', 'low or lower-middle-income households only'),
      );
    }
    case 'age': {
      if (h.age === undefined) {
        if (c.max === undefined && c.min !== undefined && c.min <= 18) return assume(t(`假設申請人已滿${c.min}歲`, `Assumes the applicant is at least ${c.min}`));
        const band =
          c.min !== undefined && c.max !== undefined
            ? t(`這一項限 ${c.min} 到 ${c.max} 歲`, `this one is for ages ${c.min} to ${c.max}`)
            : c.max !== undefined
              ? t(`這一項限 ${c.max} 歲以下`, `this one is for ages ${c.max} and under`)
              : t(`這一項限 ${c.min} 歲以上`, `this one is for ages ${c.min} and over`);
        return { ok: false, failed: c.kind, why: t(`你沒有填年齡；${band['zh-TW']}`, `you did not give your age; ${band.en}`), missing: true };
      }
      if (c.min !== undefined && h.age < c.min) return fail(c.kind, t(`須年滿${c.min}歲`, `must be at least ${c.min}`));
      if (c.max !== undefined && h.age > c.max) return fail(c.kind, t(`限${c.min ?? 0}至${c.max}歲`, `ages ${c.min ?? 0}–${c.max} only`));
      return OK;
    }
    case 'residency': {
      if (ctx.programmeJurisdiction !== 'central' && ctx.programmeJurisdiction !== s.jurisdiction) return fail(c.kind, t('須設籍於該縣市', 'requires household registration there'));
      if (!c.minYears && !c.registeredBy) return OK;
      if (!h.residentSince) {
        if (c.assumption) return assume(c.assumption);
        const rule = c.registeredBy
          ? t(`${date(c.registeredBy)['zh-TW']}前已設籍`, `registered there by ${date(c.registeredBy).en}`)
          : t(`設籍滿${c.minYears}年`, `registered there for at least ${c.minYears} year${(c.minYears ?? 0) > 1 ? 's' : ''}`);
        return assume(t(`假設你已${rule['zh-TW']}`, `Assumes your household is ${rule.en}`));
      }
      if (c.registeredBy && !onOrBefore(h.residentSince, c.registeredBy)) {
        return fail(c.kind, c.why ?? t(`須在 ${date(c.registeredBy)['zh-TW']}前設籍`, `household must be registered by ${date(c.registeredBy).en}`));
      }
      if (c.minYears && fullYears(h.residentSince, s.date as string) < c.minYears) {
        return fail(c.kind, t(`須設籍滿${c.minYears}年`, `household must have been registered for ${c.minYears} year(s)`));
      }
      return OK;
    }
    case 'applicant-deadline': {
      if (c.applicants === 'foreign-national' && h.foreignNational && !onOrBefore(s.date as string, c.date)) return fail(c.kind, c.why);
      return OK;
    }
    case 'region':
      return c.jurisdictions.includes(s.jurisdiction) ? OK : fail(c.kind, t('限特定縣市居民', 'residents of specific areas only'));
    case 'any-of': {
      const results = c.conditions.map((x) => checkCondition(x, ctx));
      const good = results.find((r) => r.ok);
      if (good) return good;
      const amb = results.find((r) => !r.ok && r.ambiguous);
      if (amb) return amb;
      const whys = results.flatMap((r) => (r.ok ? [] : [r.why]));
      if (!whys.length) return fail(c.kind, t('不符合資格', 'not eligible'));
      const first = results.find((r) => !r.ok) as Extract<CondResult, { ok: false }>;
      return fail(first.failed, t(whys.map((w) => w['zh-TW']).join('，或'), whys.map((w) => w.en).join(', or ')));
    }
  }
}

/**
 * All conditions together. A clear failure wins over an unclear one wherever it comes in the
 * list: a line is "unclear for you" (and offered as possible extra money) only when every other
 * condition is met. Otherwise a Taichung low-income line whose prior-subsidy rule happened to be
 * checked first was offered to a buyer who is not on a low income.
 */
export function checkAll(conditions: Condition[], ctx: EligibilityContext): CondResult {
  const assumptions: L10n[] = [];
  let unclear: CondResult | null = null;
  for (const c of conditions) {
    const r = checkCondition(c, ctx);
    if (r.ok) {
      assumptions.push(...r.assumptions);
      continue;
    }
    if (!r.ambiguous && !r.missing) return r;
    unclear ??= r;
  }
  return unclear ?? { ok: true, assumptions };
}
