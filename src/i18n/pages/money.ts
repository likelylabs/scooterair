// Money-state copy shared by the home money chapter, the timeline (V19) and /electric/
// (blueprint 3.12 and 4.3). The state itself comes from src/lib/site-state.ts.
// Tokens: {city} {date} {n} are filled in the browser by src/lib/site-state.client.ts.

import { copy } from './_copy.ts';

export default copy({
  /** One status line per state. `static` is what a reader without JavaScript sees: true whenever it is read. */
  banner: {
    static: {
      'zh-TW': '2026 年的電動機車補助，最晚要在 2026 年 12 月 31 日前買車、領牌；線上申請多半到 2027 年 1 月 10 日。2027 年的方案，在我們 {date}查證時還沒有一項定案。',
      en: 'Every 2026 electric-scooter subsidy requires purchase and registration by 31 December 2026 at the latest; most online applications close on 10 January 2027. When we checked on {date}, nothing was confirmed for 2027.',
    },
    'A-no-city': {
      'zh-TW': '2026 年的補助最晚到 12 月 31 日。先選縣市，看你那裡還有沒有名額。',
      en: '2026 subsidies end by 31 December at the latest. Choose your city or county to see whether places are left.',
    },
    'A-city-open': {
      'zh-TW': '{city}：還有名額（{date}查）。最晚 {cityDeadline}前買車、領牌。',
      en: '{city}: places left (checked {date}). Buy and register by {cityDeadline} at the latest.',
    },
    'A-city-restricted': {
      'zh-TW': '{city}：剩下的名額只限汰舊換新或特定身分（{date}查）。最晚 {cityDeadline}前買車、領牌。',
      en: '{city}: the places left are for scrap-and-replace or certain groups only (checked {date}). Buy and register by {cityDeadline} at the latest.',
    },
    'A-city-unpublished': {
      'zh-TW': '{city}：方案還在進行，但剩多少名額沒有公布或沒有查證，可能已經沒了（{date}查）。最晚 {cityDeadline}前買車、領牌。',
      en: '{city}: the programme is running, but how many places remain was not published or could not be checked, so they may be gone (checked {date}). Buy and register by {cityDeadline} at the latest.',
    },
    'A-city-exhausted': {
      'zh-TW': '{city}的補助已在 {date}用完。中央補助到 12 月 31 日。',
      en: '{city}’s subsidy ran out on {date}. Central subsidies run to 31 December.',
    },
    'A-city-ended': {
      'zh-TW': '{city}的補助已在 {date}截止。中央補助到 12 月 31 日。',
      en: '{city}’s subsidy closed on {date}. Central subsidies run to 31 December.',
    },
    'A-city-unknown': {
      'zh-TW': '{city}：今年的補助我們查不到，請洽環保局。中央補助到 12 月 31 日。',
      en: '{city}: we could not check this year’s subsidy; please ask the environmental bureau. Central subsidies run to 31 December.',
    },
    B: {
      'zh-TW': '買車期限過了。12 月 31 日前買車的人，線上申請多半到 1 月 10 日。',
      en: 'The purchase deadline has passed. If you bought by 31 December, most online applications are open until 10 January.',
    },
    C: {
      'zh-TW': '2026 年的補助結束了。2027 年的方案，還沒有一項定案（{date}查）。',
      en: 'The 2026 subsidies have ended. Nothing is confirmed for 2027 (checked {date}).',
    },
    D: {
      'zh-TW': '2027 年方案公布了（{date}查）。',
      en: 'A 2027 programme has been announced (checked {date}).',
    },
  },
  /** Added to a city status once its check date is more than three weeks old. */
  stale: {
    'zh-TW': '這是 {date}查到的狀態，可能已經變了。下單前請再看一次官方頁面。',
    en: 'This was the status on {date} and it may have changed. Look at the official page again before you order.',
  },
  /** R10: only inside a verdict A panel, with the city status beside it. */
  dayCount: {
    'zh-TW': '{city}還有名額（{date}查）。最晚 12 月 31 日前買車、領牌，還有 {n} 天。',
    en: '{city} still has places (checked {date}). Buy and register by 31 December at the latest: {n} days left.',
  },
  lastDay: {
    'zh-TW': '{city}還有名額（{date}查）。今天是買車、領牌的最後一天。',
    en: '{city} still has places (checked {date}). Today is the last day to buy and register.',
  },
  /** The timeline strip (V19). */
  timeline: {
    label: { 'zh-TW': '補助時間軸', en: 'Subsidy timeline' },
    today: { 'zh-TW': '今天', en: 'Today' },
    purchaseDate: { 'zh-TW': '12/31', en: '31 Dec' },
    purchase: { 'zh-TW': '買車、領牌的最後期限', en: 'Last day to buy and register' },
    filingDate: { 'zh-TW': '1/10', en: '10 Jan' },
    filing: { 'zh-TW': '線上申請截止（各縣市不同）', en: 'Online applications close (varies by city)' },
    nextDate: { 'zh-TW': '2027', en: '2027' },
    next: { 'zh-TW': '還沒有一項定案', en: 'Nothing confirmed' },
    nextConfirmed: { 'zh-TW': '新方案公布了', en: 'A new programme is announced' },
    daysWithout: { 'zh-TW': '已經 {n} 天沒有定案', en: '{n} days with nothing confirmed' },
    past: { 'zh-TW': '已過', en: 'passed' },
    checked: { 'zh-TW': '{date}查', en: 'checked {date}' },
  },
  /**
   * Home screens 12 and 13, the film's money beat and /electric/ (brief 7.7): the deadline strip,
   * one sentence per state, chosen by stripKind() in src/lib/home-money.ts. Dates are filled with
   * formatDate(): {subsidy} the last day the counted subsidies accept purchases, {promo} the last
   * day of the petrol scooter's dealer offers, {year} the reader's year.
   * 'nothing-confirmed' says 還沒有確定, never 未公布: a draft has been pre-announced (fact
   * econ-no-2027-programme).
   */
  home: {
    strip: {
      'subsidy-and-promo': { 'zh-TW': '補助到 {subsidy}。燃油機車的促銷到 {promo}。', en: 'Subsidies end {subsidy}. Petrol-scooter promotions end {promo}.' },
      subsidy: { 'zh-TW': '補助到 {subsidy}。', en: 'Subsidies end {subsidy}.' },
      'nothing-confirmed': { 'zh-TW': '{year} 年的補助還沒有確定。下面先用沒有補助的價格算。', en: 'Nothing is confirmed yet for {year} subsidies. The sums below use prices with no subsidy.' },
      'next-programme': { 'zh-TW': '補助到 {subsidy}。', en: 'Subsidies end {subsidy}.' },
      'no-subsidy': { 'zh-TW': '這個條件下，沒有可以算進去的補助。下面用沒有補助的價格算。', en: 'On these terms no subsidy can be counted. The sums below use prices with no subsidy.' },
    },
    plate: {
      light: { 'zh-TW': '綠牌', en: 'green plate' },
      heavy: { 'zh-TW': '白牌', en: 'white plate' },
    },
  },
});
