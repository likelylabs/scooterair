// The economics dataset, assembled. The calculation engine (src/lib/calc) takes an EconDataset
// as a parameter and defaults to this one, so tests can pass fixtures and a page can pass
// the real data at build time or in the browser.
//
//   import { econData } from '@/data/econ';

import type { EconDataset } from './types.ts';
import { econMeta, jurisdictions } from './jurisdictions.ts';
import { programmes } from './programmes/index.ts';
import { groups } from './groups.ts';
import { evModels, gasModels } from './vehicles.ts';
import { electricity, fuel, planCredits, plans } from './energy.ts';
import { fees, maintenance, spendReference } from './running.ts';

export * from './types.ts';

export const econData: EconDataset = {
  meta: econMeta,
  jurisdictions,
  programmes,
  groups,
  gasModels,
  evModels,
  plans,
  planCredits,
  fuel,
  electricity,
  maintenance,
  fees,
  spendReference,
};
