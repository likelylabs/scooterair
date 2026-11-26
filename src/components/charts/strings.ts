// Words the charts print (lane D). Every number that goes into a {token} comes from
// src/data/estimate.ts or src/lib/home-money.ts; nothing here holds a figure.
//
// Loadable by plain Node (no runtime import), so scripts/check-copy.mjs can walk it like a
// string module: every leaf is { 'zh-TW': '…', en: '…' }.
//
// Fixed wording that belongs to the estimate itself (多出來, 街上原本就有, the two-item legend,
// the scenario names, the confidence words) is NOT here: it is `estimateText` and `est` in
// src/data/estimate.ts, and the charts read it from there.

type L10n = { 'zh-TW': string; en: string };
type Loc = 'zh-TW' | 'en';
const t = (zh: string, en: string): L10n => ({ 'zh-TW': zh, en });

/** Fill {tokens} in a chart string. */
export function fill(s: L10n, locale: Loc, vars: Record<string, string | number> = {}): string {
  let out = s[locale];
  for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

export const chartText = {
  /** The toggle under a chart (the same words as ui.dataTable; here so browser code needs no registry). */
  dataTable: t('查看資料表', 'View data table'),
  about: t('約', 'about'),
  to: t('到', 'to'),

  // ---- G5 · measured beside estimated -------------------------------------------------------
  mve: {
    title: t('一氧化碳：量到的，和算出來的', 'Carbon monoxide: measured, and worked out'),
    roadside: {
      label: t('平常的路邊', 'An ordinary roadside'),
      sub: t('交通測站，{year} 年平均', 'traffic stations, {year} average'),
    },
    waiting: {
      label: t('路口的行人等候區', 'Where pedestrians wait to cross'),
      sub: t('運研所，{n} 個路口，最高的一分鐘', 'Institute of Transportation, {n} junctions, highest minute'),
    },
    estimate: {
      few: t('紅燈時，幾輛機車旁邊', 'Beside a few scooters at a red light'),
      dozen: t('紅燈時，十來輛機車旁邊', 'Beside a dozen scooters at a red light'),
      full: t('紅燈時，停滿的機車旁邊', 'Beside a full box of scooters at a red light'),
      sub: t('{s} 秒平均，含街上原本就有的（各地不同）', '{s}-second average, including what the street already holds (varies by place)'),
    },
    how: t('看這個數字怎麼算的', 'See how this figure was worked out'),
    zoomHere: t('上面整張圖，在這一小段', 'The whole chart above fits in this small piece'),
    zoomWho: t('世界衛生組織 15 分鐘指引值', 'WHO 15-minute guideline'),
    tableWhere: t('哪裡、什麼時候', 'Where and when'),
    tableValue: t('一氧化碳（ppm）', 'Carbon monoxide (ppm)'),
    tableKind: t('怎麼來的', 'What kind of figure'),
    // the text alternative: one sentence per row, then the finding, chosen by rule
    sumRoadside: t('一氧化碳，單位是 ppm。平常的路邊（{sub}）量到 {v}。', 'Carbon monoxide, in ppm. An ordinary roadside ({sub}): {v}, measured.'),
    sumWaiting: t('路口的行人等候區（{sub}）量到 {v}。', 'Where pedestrians wait to cross ({sub}): {v}, measured.'),
    sumEstimate: t('{label}（{sub}），本站推估{v}。', '{label} ({sub}): our estimate is {v}.'),
    sumRule: {
      overlap: t('量到的和算出來的差不多；這是比大小，不是驗證。', 'The readings and the estimate roughly match; this compares size, it does not validate the estimate.'),
      higher: t('算出來的比量到的高。', 'The estimate is higher than the readings.'),
      lower: t('算出來的比量到的低。', 'The estimate is lower than the readings.'),
    },
    sumWhoFar: t('兩者都比世界衛生組織的 15 分鐘指引值（{who}）低很多。', 'Both are far below the WHO 15-minute guideline ({who}).'),
    sumWho: t('世界衛生組織的 15 分鐘指引值是{who}。', 'The WHO 15-minute guideline is {who}.'),
  },

  // ---- the estimate's range bands and table (/estimate/) --------------------------------------
  bands: {
    title: t('{pollutant}：這排機車多出來的量', '{pollutant}: what the scooters add'),
    pollutant: {
      co: t('一氧化碳', 'Carbon monoxide'),
      benzene: t('苯', 'Benzene'),
      pm25: t('細懸浮微粒（PM2.5）', 'Fine particles (PM2.5)'),
    },
    /** 苯 with its 注音, for the first use on a page (brief 6.6). */
    benzeneZhuyin: t('苯（ㄅㄣˇ）', 'Benzene'),
    compare: t('拿來比一比', 'For comparison'),
    measuredRise: {
      label: t('運研所量到的最高值，減去附近測站', 'The Institute of Transportation’s highest reading, minus the nearby station'),
      sub: t('{n} 個路口裡最忙的一個，最高的一分鐘', 'the busiest of {n} junctions, highest minute'),
    },
    streetSub: {
      co: t('交通測站，{year} 年平均', 'traffic stations, {year} average'),
      pm25: t('一般測站，{year} 年平均', 'general stations, {year} average'),
      benzene: t('都市的空氣，大概的範圍（台灣和國外的量測，出處不完整）', 'city air, a rough range (readings from Taiwan and abroad; sources incomplete)'),
    },
    who: t('世界衛生組織 15 分鐘指引值', 'WHO 15-minute guideline'),
    whoSub: t('15 分鐘的平均不要超過這個量', 'a 15-minute average should stay under this'),
    appliesShort: t('大人鼻子的高度，90 秒平均', "adult's nose height, 90-second average"),
    logNote: t('橫的刻度每一格是前一格的十倍，所以很小和很大的數字可以放在同一張圖。', 'Each step along the scale is ten times the one before, so very small and very large amounts fit on one chart.'),
    scenarioHead: t('旁邊停了幾輛', 'Scooters beside you'),
    addedHead: t('這排機車多出來', 'Added by these scooters'),
    totalLine: t('含街上原本就有的（各地不同，不是固定加 0.5）：{v}', 'Including what the street already holds (it varies by place; not a fixed 0.5 added): {v}'),
    streetLine: t('街上原本就有：{v}', 'Already in the street: {v}'),
    tableCaption: t('這排機車多出來的量（{stamp}）', 'What the scooters add ({stamp})'),
    tableMark: t('怎麼來的', 'What kind of figure'),
    sum: t('{pollutant}，{scenario}：多出{v}。', '{pollutant}, {scenario}: {v} added.'),
    sumStreet: t('街上原本就有{v}。', 'The street already holds {v}.'),
    sumWho: t('世界衛生組織 15 分鐘指引值是{v}，比上面每一個數字都高很多。', 'The WHO 15-minute guideline is {v}, far above every figure here.'),
    sumRise: t('運研所在最忙的一個路口量到：最高的一分鐘多出{v}。', 'At the busiest junction the Institute of Transportation measured {v} more in the highest minute.'),
  },

  // ---- G12 · price bars -----------------------------------------------------------------------
  price: {
    title: t('買的那天：兩種機車各付多少', 'On the day you buy: what each scooter costs'),
    petrol: t('125cc 燃油機車・實付', '125 cc petrol scooter: you pay'),
    electric: t('電動機車（{plate}）・實付', 'Electric scooter ({plate}): you pay'),
    listLess: t('定價 {list}，扣掉{what} {off}', 'List price {list}, less {off} in {what}'),
    listLessPlain: t('定價 {list}，扣掉 {off}', 'List price {list}, less {off}'),
    listOnly: t('定價 {list}，這個條件下沒有可以扣的', 'List price {list}; nothing comes off on these terms'),
    what: {
      subsidy: t('補助', 'subsidies'),
      dealer: t('車廠折扣', "maker's discounts"),
      tax: t('減稅', 'tax cuts'),
    },
    and: t('和', ' and '),
    comma: t('、', ', '),
    less: t('電動機車少付 {n}', 'Electric: {n} less'),
    more: t('電動機車多付 {n}', 'Electric: {n} more'),
    same: t('兩種差 {n}', 'A gap of {n}'),
    even: t('兩種一樣多', 'The two cost the same'),
    key: t('虛線＝定價裡扣掉的部分', 'Dashed = the part of the list price that comes off'),
    tableWhat: t('項目', 'Item'),
    tableModel: t('車款', 'Model'),
    tableList: t('定價', 'List price'),
    tableOff: t('扣掉', 'Taken off'),
    tableNet: t('實付', 'You pay'),
    sumSide: t('{label}：{name}，定價 {list}，扣掉{what} {off}，實付 {net}。', '{label}: {name}, list price {list}, less {off} in {what}, you pay {net}.'),
    sumSidePlain: t('{label}：{name}，定價 {list}，扣掉 {off}，實付 {net}。', '{label}: {name}, list price {list}, less {off}, you pay {net}.'),
    sumSideNoOff: t('{label}：{name}，定價和實付都是 {net}。', '{label}: {name}, list price and price paid are both {net}.'),
  },

  // ---- G13 · monthly bars ---------------------------------------------------------------------
  month: {
    title: t('每個月的油錢和電費（每月騎 {km} 公里）', 'Fuel and power each month ({km} km a month)'),
    petrol: t('加油（125cc）', 'Petrol (125 cc)'),
    home: t('在家充電', 'Charging at home'),
    divider: t('不能在家充電的話', 'If you cannot charge at home'),
    swapPlan: t('換電・各家最便宜的月租', 'Battery swap: cheapest monthly plan, any make'),
    swapPayg: t('換電・各家用多少付多少', 'Battery swap: pay as you go, any make'),
    tableWhat: t('怎麼補充能源', 'How you refuel'),
    tableValue: t('每個月', 'Each month'),
    tableNote: t('哪一種車、哪一個方案', 'Which scooter and plan'),
    sum: t('每月騎 {km} 公里：{rows}。', 'At {km} km a month: {rows}.'),
    sumRow: t('{label} {v}', '{label} {v}'),
    sumJoin: t('；', '; '),
  },

  // ---- G15 · the working, drawn -----------------------------------------------------------------
  working: {
    title: t('算式', 'The working'),
    op: {
      '+': t('加', 'plus'),
      '−': t('減', 'minus'),
      '×': t('乘以', 'times'),
      '÷': t('除以', 'divided by'),
      '=': t('等於', 'equals'),
      '→': t('然後', 'then'),
    },
    // presets (numbers come from src/data/estimate.ts)
    perRed: {
      rate: t('一輛機車引擎沒熄火，一小時排的一氧化碳（{lo} 到 {hi} 公克）', 'Carbon monoxide from one scooter standing with its engine on, in an hour ({lo} to {hi} g)'),
      reds: t('一小時有 {n} 個 {s} 秒的紅燈', 'An hour holds {n} reds of {s} seconds'),
      result: t('一輛機車等一個紅燈排出的（{lo} 到 {hi} 公克）', 'One scooter through one red light ({lo} to {hi} g)'),
    },
    can: {
      volume: t('{g} 公克一氧化碳在 25 度時的體積（{lo} 到 {hi} 公升）', 'The volume of {g} g of carbon monoxide at 25 °C ({lo} to {hi} litres)'),
      can: t('一個 {ml} 毫升的鋁罐', 'One {ml} mL drinks can'),
      result: t('一輛機車等一個紅燈排出的一氧化碳', 'Carbon monoxide from one scooter through one red light'),
    },
    busiest: {
      perHour: t('最忙的路口，一個方向一小時的機車（路口的車流 ÷ 4）', 'Scooters an hour in one direction at the busiest junction (the junction’s count ÷ 4)'),
      red: t('一個紅燈的長度', 'The length of one red light'),
      hour: t('一小時', 'One hour'),
      result: t('一個紅燈停下來的機車', 'Scooters stopped through one red light'),
    },
    year: {
      reds: t('一天等的紅燈', 'Red lights in a day'),
      wait: t('等一個紅燈的時間', 'The wait at one red light'),
      days: t('一年', 'One year'),
      result: t('一年在路邊等紅燈的時間', 'Time spent waiting at red lights in a year'),
    },
    money: {
      list: t('定價', 'List price'),
      net: t('實付', 'You pay'),
    },
    unit: {
      g: t('公克', 'g'),
      L: t('公升', 'litres'),
      vehicles: t('輛', 'scooters'),
      s: t('秒', 'seconds'),
      days: t('天', 'days'),
      h: t('小時', 'hours'),
    },
  },
} as const;

/** Money as the site prints it: 「10,388 元」 in Chinese, "NT$10,388" in English (brief 6.6). */
export function yuan(n: number, locale: Loc): string {
  const v = Math.round(Math.abs(n));
  const s = new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: 0 }).format(v);
  return locale === 'en' ? `${n < 0 ? '−' : ''}NT$${s}` : `${n < 0 ? '−' : ''}${s} 元`;
}

/** A range of money: 「22 到 28 元」 / "NT$22 to 28". One figure when the two ends are the same. */
export function yuanRange(lo: number, hi: number, locale: Loc): string {
  const f = (v: number) => new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: 0 }).format(Math.round(v));
  if (Math.round(lo) === Math.round(hi)) return yuan(lo, locale);
  return locale === 'en' ? `NT$${f(lo)} to ${f(hi)}` : `${f(lo)} 到 ${f(hi)} 元`;
}

/** 約 / about in front of a figure. */
export const about = (s: string, locale: Loc): string => (locale === 'en' ? `about ${s}` : `約 ${s}`);
