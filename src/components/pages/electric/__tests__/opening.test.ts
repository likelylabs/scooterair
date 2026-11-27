// The /electric/ opening (brief 7.7; acceptance checks 23–25): every county, answer and distance
// renders a finished result from the engine's figures, on each date on which the sums change.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openingData } from '../opening-data.ts';
import { buyHtml, buyHeadline, caseText, monthHtml, monthLine, shortName, snapKm, tableOn, type OpenText } from '../opening-view.ts';
import { homeMoney } from '../../../../lib/home-money.ts';
import electric from '../../../../i18n/pages/electric.ts';
import { localize } from '../../../../i18n/pages/_copy.ts';

const DATES = ['2026-11-26', '2026-12-01', '2027-01-01'];

test('every county, scrapping answer, distance and charging answer renders, with no blank or unfilled token', () => {
  for (const loc of ['zh-TW', 'en'] as const)
    for (const d of DATES) {
      const D = openingData(loc, d);
      const T = localize(electric, loc).open as unknown as OpenText;
      const t = tableOn(D, d);
      for (const { id } of D.counties)
        for (const scrap of ['yes', 'no'] as const) {
          const html = buyHtml(D, T, t, id, scrap) + D.km.map((km) => monthHtml(D, T, t, km) + monthLine(D, T, t, { county: id, scrap, km, charge: 'yes' }) + monthLine(D, T, t, { county: id, scrap, km, charge: 'no' })).join('');
          assert.doesNotMatch(html, /\{\w+\}|undefined|NaN|無資料/, `${loc} ${d} ${id} ${scrap}`);
        }
    }
});

test('the figures equal the engine’s (home-money)', () => {
  for (const d of DATES) {
    const m = homeMoney(d);
    const t = tableOn(openingData('zh-TW', d), d);
    for (const c of m.counties)
      for (const s of ['yes', 'no'] as const) {
        assert.equal(t.buy[c.id][s].d, m.buy[c.id][s].difference);
        assert.equal(t.buy[c.id][s].e, m.buy[c.id][s].electric.net);
        assert.equal(t.buy[c.id][s].g, m.buy[c.id][s].gasoline.net);
      }
    assert.equal(t.month[300].petrol, m.month[300].petrol.monthly.typical);
  }
});

test('headline rule and strip follow the date', () => {
  const T = localize(electric, 'zh-TW').open as unknown as OpenText;
  const nov = tableOn(openingData('zh-TW', '2026-11-26'), '2026-11-26');
  assert.equal(buyHeadline(T, nov.buy['new-taipei'].yes, 'yes'), T.headCheaperScrap);
  const D = openingData('zh-TW', '2027-01-01');
  assert.match(D.words[tableOn(D, '2027-01-01').buy['new-taipei'].yes.strip], /2027 年的補助還沒有確定/);
});

test('the hand-off line names what was chosen; distances snap to the four on the switch', () => {
  const D = openingData('zh-TW', '2026-11-26');
  const T = localize(electric, 'zh-TW').open as unknown as OpenText;
  assert.equal(caseText(D, T, { county: 'kaohsiung', scrap: 'no', km: 500, charge: 'no' }), '高雄市・沒有機車可報廢・每月 500 公里');
  assert.equal(snapKm(D, 520), 500);
  assert.equal(snapKm(D, 2000), 800);
  assert.equal(shortName('EZZY（綠牌）'), 'EZZY');
  assert.equal(shortName('CoolOne swap version, green plate (EE15AA)'), 'CoolOne swap version (EE15AA)');
});
