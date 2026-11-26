// Small builders that keep the programme files readable. Data only.

import { t } from '../l10n.ts';
import type { Amount, Condition, ISODate, L10n, Quota, SourceId } from '../types.ts';

export { t };

export const fixed = (value: number, isMaximum = false): Amount => (isMaximum ? { kind: 'fixed', value, isMaximum: true } : { kind: 'fixed', value });

export const quota = (status: Quota['status'], asOf: ISODate, text: L10n, extra: Partial<Omit<Quota, 'status' | 'asOf' | 'text'>> = {}): Quota => ({
  status,
  asOf,
  text,
  ...extra,
});

// Common conditions
export const scrap: Condition = { kind: 'scrap' };
export const scrapAge = (years: number): Condition => ({ kind: 'scrap-min-age', years });
export const builtBy = (onOrBefore: ISODate): Condition => ({ kind: 'scrap-built', onOrBefore });
export const builtBetween = (onOrAfter: ISODate, onOrBefore: ISODate): Condition => ({ kind: 'scrap-built', onOrAfter, onOrBefore });
export const twoStroke: Condition = { kind: 'scrap-engine', engines: ['two-stroke'] };
export const heavy: Condition = { kind: 'ev-plate-class', classes: ['heavy'] };
export const light: Condition = { kind: 'ev-plate-class', classes: ['light'] };
export const lightOrSmall: Condition = { kind: 'ev-plate-class', classes: ['light', 'small'] };
export const small: Condition = { kind: 'ev-plate-class', classes: ['small'] };
export const heavyOrLight: Condition = { kind: 'ev-plate-class', classes: ['heavy', 'light'] };
export const lowIncome = (levels: ('low' | 'middle-low')[], ambiguous?: ('low' | 'middle-low')[]): Condition =>
  ambiguous ? { kind: 'income', levels, ambiguous } : { kind: 'income', levels };
export const flag = (f: Extract<Condition, { kind: 'household' }>['flag'], value = true): Condition => ({ kind: 'household', flag: f, value });
export const age = (min?: number, max?: number): Condition => ({ kind: 'age', min, max });
export const residency = (minYears?: number, registeredBy?: ISODate): Condition => ({ kind: 'residency', minYears, registeredBy });
export const notPreviouslySubsidised: Condition = { kind: 'household', flag: 'previousLocalSubsidy', value: false };
/** The same, with an assumption that names every subsidy the rule excludes (e.g. MOENV's too). */
export const notSubsidisedBefore = (assumption: L10n): Condition => ({ kind: 'household', flag: 'previousLocalSubsidy', value: false, assumption });
/**
 * A prior-subsidy rule that looks back over a set period only (Taichung: since 2016; Yilan:
 * 2023–2025; Yunlin: the past 3 years; Kinmen's swap route: a Kinmen application over 5 years
 * ago is allowed). The form's "had a subsidy before" box does not say when, so a reader who ticks
 * it is not refused: the line is left out as unclear, with `why` saying who the rule really
 * excludes and what the reader would get if theirs falls outside it.
 */
export const notSubsidisedInWindow = (assumption: L10n, why: L10n): Condition => ({ kind: 'household', flag: 'previousLocalSubsidy', value: false, assumption, why, ambiguous: true });
export const rocNational: Condition = { kind: 'household', flag: 'foreignNational', value: false };

export type Src = SourceId[];
