/**
 * air-slots.ts — the numbers of the signed estimate that the drawing rule uses.
 *
 * Nothing here is typed by hand. How many extra rings the pictures draw where
 * people stand comes from two published slots in src/data/estimate.ts (lane A,
 * which scripts/check-data.mjs holds equal to research/estimate/results.json):
 *   co.<scenario>.add.mid   the carbon monoxide a pack adds, middle value
 *   bg.co.traffic           the yearly mean at traffic stations (0.54 ppm)
 * through estimate.ts → extraRings() and ringsPerPatch().
 *
 * air.ts carries its own copy of the same rule (extraRingsPerPatch) so that it
 * stays a pure module with no imports. This file makes the two meet: if the
 * drawing rule and the data module ever disagree, the build stops here.
 *
 *   import { AIR_EXTRA } from '@/components/art/air-slots';
 *   air({ …, kerb: { x0, x1 }, extra: AIR_EXTRA, scenario: 'all' })
 */
import { AIR_BASE_PER_PATCH, est, extraRings, ringsPerPatch, scenarioKeys } from '../../data/estimate.ts';
import { AIR, extraRingsPerPatch, type AirScenario } from './air.ts';

const each = <T>(fn: (s: AirScenario) => T): Record<AirScenario, T> => Object.fromEntries(scenarioKeys.map((s) => [s, fn(s)])) as Record<AirScenario, T>;

if (AIR.ringsPerPatch !== AIR_BASE_PER_PATCH) {
  throw new Error(`air-slots.ts: air.ts draws ${AIR.ringsPerPatch} rings per patch for the street's own air but estimate.ts says ${AIR_BASE_PER_PATCH}`);
}

/** bg.co.traffic: yearly mean carbon monoxide at Taiwan's traffic stations, ppm. The unrounded value (0.54), not the 0.5 that copy prints. */
export const AIR_BACKGROUND_CO: number = est.bg.co.traffic.value;

/** Layer B: extra rings per reference patch where people stand. Today: few 1, dozen 3, full 6. Pass as `extra` to air(). */
export const AIR_EXTRA: Record<AirScenario, number> = each((s) => {
  const fromData = extraRings(s);
  const fromRule = extraRingsPerPatch(est.co[s].add.mid as number, AIR_BACKGROUND_CO);
  if (fromData !== fromRule) throw new Error(`air-slots.ts: the drawing rule gives +${fromRule} rings for "${s}" but estimate.ts gives +${fromData}`);
  return fromData;
});

/**
 * The two patches that show the range (estimate sheet, block 3, and
 * /estimate/#drawing): extra rings, and rings in all, at the low and the high
 * end of each scenario's range. Today for the dozen: 7 rings and 17 rings.
 */
export const AIR_RANGE: Record<AirScenario, { lo: { extra: number; rings: number }; hi: { extra: number; rings: number } }> = each((s) => ({
  lo: { extra: extraRings(s, 'lo'), rings: ringsPerPatch(s, 'lo') },
  hi: { extra: extraRings(s, 'hi'), rings: ringsPerPatch(s, 'hi') },
}));

/** Everything the published drawing rule (/estimate/#drawing) prints, as numbers, so no page types one. */
export const AIR_RULE = {
  patchPx: AIR.patch,
  atWidthPx: AIR.refWidth,
  streetRings: AIR.ringsPerPatch,
  streetDots: AIR.dotsPerPatch,
  extra: AIR_EXTRA,
  ribbons: AIR.ribbonsToPeople,
  washPercent: each((s) => Math.round(AIR.washOpacity[s] * 100)),
  range: AIR_RANGE,
  kerbTopCm: AIR.kerbTop,
  coreLengthCm: AIR.core.length,
} as const;
