// Acceptance A4 / sanity check: the published estimate (research/estimate/model.mjs, unchanged) run for the
// CFD case's scooter count, nearest distance, fixed wind speed and direction sector, at the CFD probe heights.
// Usage: node compare-estimate.mjs STATS.json [N_SCOOTERS] [WIND] [windFrom: pack|any] > compare.json
// For each K distance d (2 and 4 m; also 0.5 and 1 m for information) the estimate is run with nearest = d
// (its receptor stands on the kerb line, d from the nearest tailpipe column) and the CFD P5/P50/P95 90-s means
// at the K probes (dx = -1, 0, +1) are set beside it.  PLAN A4: CFD P50 within x3 of the estimate median and
// inside its P5-P95 at 2-8 m.  Differences are findings, never tuned away.
import { readFileSync } from 'node:fs';
import { estimate } from '../estimate/model.mjs';

const [, , statsPath, nStr = '12', wStr = '0.8', from = 'pack'] = process.argv;
const S = JSON.parse(readFileSync(statsPath, 'utf8'));
const heights = [0.7, 1.1, 1.5];
const out = { case: S.scene, scooters: +nStr, windSpeed: +wStr, windFrom: from, rows: [] };
for (const d of [0.5, 1, 2, 4]) {
  const e = estimate({ scooters: +nStr, nearest: d, windSpeed: +wStr, windFrom: from, n: 4000, heights });
  for (const h of heights) {
    const hk = 'h' + h.toFixed(1);
    const est = e.co.increment[hk];
    const cfd = ['-1.0', '0.0', '1.0'].map(dx => {
      const r = S.probes.find(p => p.label === `K d=${d.toFixed(1)} dx=${dx} h=${h}`);
      return r ? r.CO.mean : null;
    });
    const p50 = cfd.filter(Boolean).map(c => c.P50);
    const cfdMid = p50.length ? p50.sort((a, b) => a - b)[Math.floor(p50.length / 2)] : null;
    const ratio = cfdMid / est.central;
    out.rows.push({ d_m: d, h_m: h, estimate_ppm: { P5: est.low, P50: est.central, P95: est.high },
      cfd_mean_ppm_by_dx: cfd, cfd_P50_median_over_dx: cfdMid, ratio_cfd_over_estimate: ratio,
      A4_applies: d >= 2, within_x3: ratio >= 1 / 3 && ratio <= 3, inside_P5_P95: cfdMid >= est.low && cfdMid <= est.high });
  }
}
process.stdout.write(JSON.stringify(out, null, 1));
