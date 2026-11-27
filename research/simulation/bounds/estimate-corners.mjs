// How far the published estimate's own framework moves when its averaging/geometry/wind assumptions are pinned to
// the exposure-maximising corner. Uses research/estimate/model.mjs unchanged. Run: node estimate-corners.mjs
import { estimate } from '../../estimate/model.mjs';
const H = [0.6, 1.1, 1.5];
const show = (lbl, o) => console.log(lbl.padEnd(78), H.map(h => { const s = o.co.increment['h' + h.toFixed(1)]; return `${h} m: ${s.central.toFixed(2)} [${s.low.toFixed(2)}-${s.high.toFixed(2)}]`; }).join('  '));
const n = 4000;
console.log('CO increment, 90-s mean, ppm: median [P5-P95] at 0.6 / 1.1 / 1.5 m');
show('published dozen (8-20, nearest 0.7-3, any wind)', estimate({ scooters: [8, 20], nearest: [0.7, 3], n, heights: H }));
show('dozen, wind from pack', estimate({ scooters: [8, 20], nearest: [0.7, 3], windFrom: 'pack', n, heights: H }));
show('dozen, wind from pack, 0.3 m/s', estimate({ scooters: [8, 20], nearest: [0.7, 3], windFrom: 'pack', windSpeed: 0.3, n, heights: H }));
show('dozen, wind from pack, 0.3 m/s, nearest 0.5 m', estimate({ scooters: [8, 20], nearest: 0.5, windFrom: 'pack', windSpeed: 0.3, n, heights: H }));
show('  + all present from red onset, none switched off', estimate({ scooters: [8, 20], nearest: 0.5, windFrom: 'pack', windSpeed: 0.3, n, heights: H, overrides: { presentAtOnset: 1, offFrac: 0 } }));
show('  + no meander (sv0 0.05, iv 0.2)', estimate({ scooters: [8, 20], nearest: 0.5, windFrom: 'pack', windSpeed: 0.3, n, heights: H, overrides: { presentAtOnset: 1, offFrac: 0, sv0: 0.05, iv: 0.2 } }));
show('full box (25-45), wind from pack, 0.3 m/s, nearest 0.3 m, all present', estimate({ scooters: [25, 45], nearest: 0.3, windFrom: 'pack', windSpeed: 0.3, n, heights: H, overrides: { presentAtOnset: 1, offFrac: 0 } }));
show('  + fuel flow 200 g/h', estimate({ scooters: [25, 45], nearest: 0.3, windFrom: 'pack', windSpeed: 0.3, n, heights: H, overrides: { presentAtOnset: 1, offFrac: 0, fuelFlow_gph: 200 } }));
show('  + no meander', estimate({ scooters: [25, 45], nearest: 0.3, windFrom: 'pack', windSpeed: 0.3, n, heights: H, overrides: { presentAtOnset: 1, offFrac: 0, fuelFlow_gph: 200, sv0: 0.05, iv: 0.2 } }));
