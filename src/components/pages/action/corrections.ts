// The corrections log on /about/#corrections, seeded with the corrections this project made to
// widely repeated claims before publishing (and two to its own earlier wording).
//
// Each entry names the claims-policy rule that refuses the claim; what we say instead and why
// come from that rule in src/data/claims-policy.ts, and the citations from the rule's facts, so a
// corrected rule corrects the log. `own` entries correct the site's own earlier wording and carry
// their text in src/i18n/pages/about.ts. The struck claim's wording is in about.ts `claims`.
//
// Add a new entry at the TOP when a correction is made after publication, with the date it was
// made (YYYY-MM-DD).

import type { ClaimRuleId, FactId } from '@/data';

/** The date the evidence behind these corrections was checked (the research files' date). */
export const SEED_DATE = '2026-11-25';

export type CorrectionKey = 'crossings-measured' | 'iot-94' | 'pm25-source' | 'ev-cheaper' | 'densest' | 'netzero-2035' | 'child-44' | 'ev-zero' | 'idling-legal' | 'ufp-smell' | 'no-2027';

export type Correction =
  | { key: CorrectionKey; date: string; rule: ClaimRuleId; facts?: FactId[] }
  | { key: CorrectionKey; date: string; own: true; facts: FactId[] };

export const corrections: Correction[] = [
  { key: 'crossings-measured', date: '2026-11-26', own: true, facts: ['iot-waiting-area-co-2024', 'iot-waiting-area-pm25-2024'] },
  { key: 'iot-94', date: SEED_DATE, rule: 'iot-94-percent-needs-context' },
  { key: 'pm25-source', date: SEED_DATE, rule: 'no-scooters-main-source' },
  { key: 'ev-cheaper', date: SEED_DATE, rule: 'econ-electric-not-always-cheaper-to-run' },
  { key: 'densest', date: SEED_DATE, rule: 'not-worlds-highest' },
  { key: 'netzero-2035', date: SEED_DATE, rule: 'netzero-2035-is-70' },
  { key: 'child-44', date: SEED_DATE, rule: 'no-taiwan-child-height-data' },
  { key: 'ev-zero', date: SEED_DATE, rule: 'ev-emissions-not-zero' },
  { key: 'idling-legal', date: SEED_DATE, rule: 'r1-idling-legality' },
  { key: 'ufp-smell', date: SEED_DATE, own: true, facts: ['co-odourless', 'odour-thresholds'] },
  { key: 'no-2027', date: SEED_DATE, own: true, facts: ['econ-no-2027-programme'] },
];
