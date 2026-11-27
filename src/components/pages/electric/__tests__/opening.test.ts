// The /electric/ opening (brief 7.7; acceptance checks 23–25): every county, answer and distance
// renders a finished result from the engine's figures, on each date on which the sums change.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openingData } from '../opening-data.ts';
import { buyHtml, buyHeadline, caseText, monthHtml, monthLine, shortModel, shortName, snapKm, tableOn, type OpenText } from '../opening-view.ts';
import { scrapHtml, scrapChange, buyBody, priceBarsProps, worstFold, type HomeMoneyPayload } from '../../home/money-view.ts';
import { worstFoldHtml } from '../opening-view.ts';
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

test('each bar names its scooter, maker first; the full name stays in the working', () => {
  assert.equal(shortModel('Gogoro睿能', 'EZZY（綠牌）'), 'Gogoro EZZY');
  assert.equal(shortModel('光陽Ionex', 'CoolOne 換電版，綠牌（EE15AA）'), 'Ionex CoolOne');
  assert.equal(shortModel('KYMCO Ionex', 'CoolOne swap version, green plate (EE15AA)'), 'Ionex CoolOne');
  assert.equal(shortModel('光陽', '新豪邁125 鼓煞（SZ25AE）'), '光陽新豪邁125');
  assert.equal(shortModel('山葉', 'Jog 125（2026 年式，前後鼓煞）'), '山葉 Jog 125');
  assert.equal(shortModel('KYMCO', 'New Haomai 125, drum brake (SZ25AE)'), 'KYMCO New Haomai 125');
  assert.equal(shortModel('Yamaha', 'Jog 125 (2026, drum brake)'), 'Yamaha Jog 125');
  const D = openingData('en', '2026-11-26');
  const t = tableOn(D, '2026-11-26');
  for (const { id } of D.counties)
    for (const s of ['yes', 'no'] as const) {
      const c = t.buy[id][s];
      assert.ok(D.words[c.es] && D.words[c.gs], `${id} ${s}`);
    }
  assert.equal(D.words[t.buy['new-taipei'].yes.es], 'Gogoro EZZY');
  assert.equal(D.words[t.buy['new-taipei'].no.es], 'Ionex CoolOne');
  assert.equal(D.words[t.buy['new-taipei'].no.gs], 'KYMCO New Haomai 125');
  assert.equal(D.words[t.buy['new-taipei'].yes.gs], 'Yamaha Jog 125');
});

test('New Taipei: scrapping is a drop from one price to another on both sides; both changes of model are said', () => {
  const d = '2026-11-26';
  for (const loc of ['zh-TW', 'en'] as const) {
    const D = openingData(loc, d);
    const T = localize(electric, loc).open as unknown as OpenText;
    const t = tableOn(D, d);
    const P = { D, T } as unknown as HomeMoneyPayload;
    const yesC = { county: 'new-taipei', scrap: 'yes', km: 300 } as const;
    const noC = { county: 'new-taipei', scrap: 'no', km: 300 } as const;
    const yesNote = scrapHtml(P, t, yesC).replace(/\u00a0/g, ' ');
    const noNote = scrapHtml(P, t, noC).replace(/\u00a0/g, ' ');
    const yes = yesNote + scrapChange(P, t, yesC).replace(/\u00a0/g, ' ');
    const no = noNote + scrapChange(P, t, noC).replace(/\u00a0/g, ' ');
    // with nothing to scrap 49,812 and 53,500, named as such (never read as a list price); with one, 44,580 and 46,700
    assert.match(yesNote, loc === 'en' ? /With nothing to scrap.*NT\$49,812.*NT\$53,500.*NT\$44,580.*NT\$46,700.*gap narrows/ : /沒有機車可報廢時.*49,812 元.*53,500 元.*44,580 元.*46,700 元，差距變小/);
    // the change of model goes into the sheet, not under the bars
    assert.doesNotMatch(yesNote, /Ionex CoolOne/);
    // never a second "less" figure that could be read as another electric-against-petrol gap
    assert.doesNotMatch(yes, /5,232|6,800|少 /);
    // the other answer's scooters are named, both of them (the bars name this answer's)
    assert.match(yes, /Ionex CoolOne/);
    assert.match(yes, loc === 'en' ? /KYMCO New Haomai 125/ : /光陽新豪邁125/);
    assert.match(no, /Gogoro EZZY/);
    assert.match(no, loc === 'en' ? /Yamaha Jog 125/ : /山葉 Jog 125/);
    assert.match(noNote, loc === 'en' ? /NT\$44,580.*NT\$46,700/ : /44,580 元.*46,700 元/);
    // no stray space between Han words
    if (loc === 'zh-TW') assert.doesNotMatch(yes + no, /[\u4e00-\u9fff] [\u4e00-\u9fff]/);
    // the worst case is folded away, never in the body
    assert.doesNotMatch(buyBody({ ...P, H: { bodyClass: 'x，', swapOnly: 'y' } } as unknown as HomeMoneyPayload, t, { county: 'new-taipei', scrap: 'yes', km: 300 }), /15,880/);
    assert.match(worstFold(P, t), /<details[^>]*><summary>/);
    // when no case is dearer, no fold says 「有時候電動機車比較貴」
    assert.doesNotMatch(worstFoldHtml(T.worstNone, T), /<summary>|<details/);
    // both bars carry the scooter's name
    const bars = priceBarsProps(P, t, { county: 'new-taipei', scrap: 'yes', km: 300 });
    assert.match(bars.petrol.label!, /Jog 125/);
    assert.match(bars.electric.label!, /Gogoro EZZY/);
    // the no-subsidy note names the model and says it is not confirmed
    assert.match(D.words[t.buy['new-taipei'].no.strip], loc === 'en' ? /The Ionex CoolOne’s MOEA and local subsidies are not confirmed/ : /Ionex CoolOne 的經濟部和縣市補助還沒確認/);
    // ...and says so with a scooter to scrap too, wherever that model is the one compared (Kaohsiung)
    assert.equal(D.words[t.buy.kaohsiung.yes.es], 'Ionex CoolOne');
    assert.match(D.words[t.buy.kaohsiung.yes.strip], loc === 'en' ? /The Ionex CoolOne’s MOEA and local subsidies are not confirmed/ : /Ionex CoolOne 的經濟部和縣市補助還沒確認/);
    assert.doesNotMatch(D.words[t.buy['new-taipei'].yes.strip], /CoolOne|EZZY/);
    // home screen 13 keeps "not counted" on screen and moves the dealer hint and the deadlines into its sheet
    const k = t.buy.kaohsiung.yes;
    assert.match(D.words[k.ss], loc === 'en' ? /not confirmed, so they are not counted\.$/ : /還沒確認，先不算。$/);
    assert.doesNotMatch(D.words[k.ss], loc === 'en' ? /dealer|December/ : /車行|12 月/);
    assert.match(D.words[k.sf], loc === 'en' ? /dealer.*31 December/ : /車行.*12 月 31 日/);
    if (loc === 'zh-TW') assert.doesNotMatch(D.words[k.ss] + D.words[k.sf], /[一-鿿] [一-鿿]/);
    // nothing moves when the model's subsidies are confirmed
    assert.equal(D.words[t.buy['new-taipei'].yes.ss], D.words[t.buy['new-taipei'].yes.strip]);
    assert.equal(D.words[t.buy['new-taipei'].yes.sf], '');
  }
});

