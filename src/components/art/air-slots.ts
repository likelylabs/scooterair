/**
 * air-slots.ts — the numbers of the signed estimate that the drawing rule uses.
 *
 * Nothing here is typed by hand. How thick the pictures draw the fume where people stand comes
 * from two published slots in src/data/estimate.ts (lane A, which scripts/check-data.mjs holds
 * equal to research/estimate/results.json):
 *   co.<scenario>.add.mid   the carbon monoxide a pack adds, middle value
 *   bg.co.traffic           the yearly mean at traffic stations (0.54 ppm)
 * through estimate.ts → fumeSteps().
 *
 * air.ts carries its own copy of the same rule (fumeSteps) so that it stays a pure module with
 * no imports. This file makes the two meet: if the drawing rule and the data module ever
 * disagree, the build stops here.
 *
 *   import { AIR_EXTRA } from '@/components/art/air-slots';
 *   air({ …, kerb: { x0, x1 }, extra: AIR_EXTRA, scenario: 'all' })
 */
import { FUME_STEPS_BASE, est, fumeSteps as stepsFromData, scenarioKeys } from '../../data/estimate.ts';
import { AIR, fumeSteps, type AirScenario } from './air.ts';

const each = <T>(fn: (s: AirScenario) => T): Record<AirScenario, T> => Object.fromEntries(scenarioKeys.map((s) => [s, fn(s)])) as Record<AirScenario, T>;

if (AIR.baseSteps !== FUME_STEPS_BASE) {
  throw new Error(`air-slots.ts: air.ts measures the pack against ${AIR.baseSteps} steps for the street's own air but estimate.ts says ${FUME_STEPS_BASE}`);
}

/** bg.co.traffic: yearly mean carbon monoxide at Taiwan's traffic stations, ppm. The unrounded value (0.54), not the 0.5 that copy prints. */
export const AIR_BACKGROUND_CO: number = est.bg.co.traffic.value;

/** Layer B: steps of fume where people stand. Today: few 1, dozen 3, full 6. Pass as `extra` to air(). */
export const AIR_EXTRA: Record<AirScenario, number> = each((s) => {
  const fromData = stepsFromData(s);
  const fromRule = fumeSteps(est.co[s].add.mid as number, AIR_BACKGROUND_CO);
  if (fromData !== fromRule) throw new Error(`air-slots.ts: the drawing rule gives ${fromRule} steps for "${s}" but estimate.ts gives ${fromData}`);
  return fromData;
});

/** Everything the published drawing rule (/estimate/#drawing) prints, as numbers, so no page types one. */
export const AIR_RULE = {
  baseSteps: AIR.baseSteps,
  extra: AIR_EXTRA,
  /** the fume's average tint where people stand, % (the full box is capped by AIR.washMax, so "at most") */
  fumePercent: each((s) => Math.round(AIR.fumeTint * AIR_EXTRA[s] * 100)),
  tintPerStepPercent: Math.round(AIR.fumeTint * 100),
  /** the fume's darkest point may cover at most this much, % */
  maxPercent: Math.round(AIR.washMax * 100),
  ribbons: AIR.ribbonsToPeople,
  kerbTopCm: AIR.kerbTop,
  coreLengthCm: AIR.core.length,
} as const;
