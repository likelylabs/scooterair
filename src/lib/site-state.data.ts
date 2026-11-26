// Build-time snapshot of the published economics dataset for the date-state utility.
// Import this from Astro frontmatter and Node scripts only: it pulls in the whole dataset.
// Browser code imports ./site-state.ts and reads the JSON that <MoneySnapshot /> prints.

import { econData } from '../data/econ/index.ts';
import { moneySnapshot } from './site-state.ts';

export const snapshot = moneySnapshot(econData);
export * from './site-state.ts';
