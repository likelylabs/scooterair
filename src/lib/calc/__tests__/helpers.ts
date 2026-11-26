// Shared helpers for the engine tests (node --test, TypeScript run directly by Node 22).

import { econData } from '../../../data/econ/index.ts';
import type { EconDataset, Programme } from '../../../data/econ/types.ts';
import { evaluate } from '../index.ts';
import type { Evaluation, Household, OldScooter, Situation } from '../types.ts';

export { econData, evaluate };

export const TODAY = '2026-11-25';

export function situation(over: Partial<Situation> & { household?: Household; scrap?: OldScooter | null } = {}): Situation {
  return {
    jurisdiction: 'taipei',
    scrap: null,
    household: {},
    electricModel: 'gogoro-ezzy',
    energyPlan: 'gogoro-payg-single',
    gasolineModel: 'kymco-new-haomai-125-drum',
    monthlyKm: 500,
    date: TODAY,
    ...over,
  };
}

export const twoStroke2002: OldScooter = { engine: 'two-stroke', builtOn: '2002-06' };
export const fourStroke2005: OldScooter = { engine: 'four-stroke', builtOn: '2005-03' };
export const fourStroke2012: OldScooter = { engine: 'four-stroke', builtOn: '2012-05' };

/** Amount of one counted line on a side, or undefined. */
export const line = (e: Evaluation, id: string, side: 'electric' | 'gasoline' = 'electric') => e[side].purchase.lines.find((l) => l.id === id)?.amount;
export const lineIds = (e: Evaluation, side: 'electric' | 'gasoline' = 'electric') => e[side].purchase.lines.map((l) => l.id);
/** Sum of government lines (everything except dealer promotions). */
export const government = (e: Evaluation, side: 'electric' | 'gasoline' = 'electric') =>
  e[side].purchase.lines.filter((l) => l.kind !== 'dealer').reduce((a, l) => a + l.amount, 0);
export const excludedReason = (e: Evaluation, id: string, side: 'electric' | 'gasoline' = 'electric') => e[side].purchase.excluded.find((x) => x.id === id)?.reason;

/** The published amount of a programme in the dataset (to reproduce published arithmetic from data). */
export function amountOf(id: string, data: EconDataset = econData): number {
  const p = data.programmes.find((x) => x.id === id);
  if (!p) throw new Error(`no programme ${id}`);
  if (p.amount.kind !== 'fixed') throw new Error(`programme ${id} is not fixed`);
  return p.amount.value;
}
export const sum = (...ids: string[]) => ids.reduce((a, id) => a + amountOf(id), 0);

/** A shallow copy of the dataset with some programmes replaced or removed. */
export function withProgrammes(keep: (p: Programme) => boolean, extra: Partial<EconDataset> = {}): EconDataset {
  return { ...econData, programmes: econData.programmes.filter(keep), ...extra };
}
