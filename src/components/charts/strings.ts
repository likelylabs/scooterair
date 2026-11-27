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
      sub: t('{s} 秒平均，含街上原本就有的；各地不同', '{s}-second average, including what the street already holds; this varies by place'),
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
    sumWhoFar: t('90 秒的量，放進 15 分鐘的平均裡只算十分之一；換算以後，仍比世界衛生組織的 15 分鐘指引值（{who}）低很多。這個指引值只看一氧化碳，低於它不代表廢氣就安全。', 'A 90-second level counts for one tenth of a 15-minute average; converted, it is still far below the WHO 15-minute guideline ({who}). That guideline is for carbon monoxide only. It does not mean exhaust is safe.'),
    sumWho: t('世界衛生組織的 15 分鐘指引值是{who}。', 'The WHO 15-minute guideline is {who}.'),
  },

  // ---- the simulation's charts (/estimate/#simulation; SimCompare also on home screen 5) -------
  // Numbers come from src/data/simulation.ts (generated from research/simulation); none is typed here.
  sim: {
    compare: {
      title: t('都換成 15 分鐘的平均來比', 'All as 15-minute averages'),
      axis: t('15 分鐘平均（ppm）', '15-minute average (ppm)'),
      oneRed: {
        label: t('在一般的街上，等一個紅燈', 'One red light, on an ordinary street'),
        sub: t('路邊半公尺。排氣管正後方、幾乎沒風時，最多約 {near} ppm', 'At the kerb, half a metre away. Right behind a tailpipe in almost no wind: up to about {near} ppm'),
      },
      stay: {
        label: t('每個紅燈都站在路邊，連續 15 分鐘', 'At the kerb through every red for 15 minutes'),
        sub: t('風一直從機車吹向你・很少見・小孩和嬰兒車的高度', 'Wind always from the scooters to you · rare · child and pushchair height'),
      },
      pushchair: {
        label: t('嬰兒車在一輛機車排氣管正後方半公尺', 'A pushchair half a metre behind one tailpipe'),
        sub: t('幾乎沒風、風向不變、每個紅燈都在・很少見・信心低', 'Almost no wind, always from the same side, every red · rare · low confidence'),
        middle: t('中間的情形', 'middle case'),
        over: t('這樣的 15 分鐘，每十次約有一到兩次超過 {who}', 'Of such 15-minute periods, about 1 or 2 in 10 pass {who}'),
      },
      whoLine: t('世界衛生組織：15 分鐘平均最好不超過 {who}（指引值）', 'WHO: a 15-minute average should stay under {who} (its guideline)'),
      /** The compact form on home screen 5, where every pixel of height counts (check-site check 9). */
      short: {
        oneRed: t('在一般的街上，等一個紅燈', 'One red, ordinary street'),
        oneRedSub: t('排氣管正後方、幾乎沒風：最多約 {near} ppm', 'Behind a tailpipe, almost no wind: up to about {near} ppm'),
        stay: t('每個紅燈都在，連續 15 分鐘', 'Every red for 15 minutes'),
        staySub: t('風一直吹向你・很少見', 'Wind always toward you · rare'),
        pushchair: t('嬰兒車在排氣管正後方半公尺', 'Pushchair half a metre behind a tailpipe'),
        pushchairSub: t('幾乎沒風、風向不變、每個紅燈都在・少見・信心低', 'Still, steady air, every red · rare · low confidence'),
        whoLine: t('世界衛生組織 15 分鐘指引值 {who}', 'WHO 15-min guideline: {who}'),
        caption: t('每種情況只算了一個紅燈。比上面的 90 秒推估多：這裡離機車半公尺、在嬰兒車的高度，也算了風從機車吹來的紅燈。', 'Each case: one simulated red. Higher than the 90-second estimate above: half a metre from the scooters, at pushchair height, including reds with the wind from them.'),
        over: t('這樣的 15 分鐘平均，十次約有一到兩次超過 {who}', '1 or 2 in 10 of these pass {who}'),
        whoNote: t('只看一氧化碳；廢氣不只有它，低於它不代表安全。', 'Carbon monoxide only. Exhaust holds more; below it is not ‘safe’.'),
      },
      whoNote: t('只看一氧化碳；低於它，不代表廢氣安全。', 'Carbon monoxide only; below it does not mean exhaust is safe.'),
      caption: t('推估。每種情況只算了一個紅燈，15 分鐘是照它推出來的。', 'Estimate. Each case is one simulated red light; the 15 minutes are worked out from it.'),
      captionSpread: t('前兩列從偏低的情形，到偏高但平常的情形，不是最糟的；第三列畫的是中間的情形，箭頭是偏高的情形。比 90 秒的推估多，因為這裡離機車半公尺、在嬰兒車的高度，也算了風從機車吹來的紅燈。', 'Rows 1 and 2 run from a low case to a high-but-ordinary case, not the worst; row 3 shows the middle case, and the arrow its high end. They are higher than the 90-second estimate because they are half a metre from the scooters, at pushchair height, and include reds with the wind from them.'),
      captionStill: t('第三列：電腦裡的空氣比平常更靜，所以可能算高了。', 'Third row: the air in the model is stiller than usual, so it may be too high.'),
      how: t('看這個數字怎麼算的', 'See how this figure was worked out'),
      tableHead: [t('情況', 'Case'), t('一氧化碳，15 分鐘平均', 'Carbon monoxide, 15-minute average')],
      tableWho: t('世界衛生組織 15 分鐘指引值（只看一氧化碳）', 'WHO 15-minute guideline (carbon monoxide only)'),
      tableOver: t('{middle}；這樣的 15 分鐘，每十次約有一到兩次超過 {who}', '{middle}; about 1 or 2 in 10 such 15-minute periods pass {who}'),
      sum: t(
        '推估，每種情況只算了一個紅燈。在一般的街上等一個紅燈，或每個紅燈都站在路邊、連續 15 分鐘、風一直吹向你，一氧化碳的 15 分鐘平均都低於世界衛生組織的指引值 {who}。例外是嬰兒車停在一輛機車排氣管正後方、幾乎沒風、風向不變：這樣的 15 分鐘，每十次約有一到兩次超過（信心低，很少見）。',
        'Estimate; each case is one simulated red light. One red light on an ordinary street, or every red for 15 minutes with the wind always toward you, keeps the 15-minute carbon monoxide average below the WHO guideline of {who}. The exception is a pushchair right behind one tailpipe in almost no wind that keeps its direction: about 1 or 2 in 10 such 15-minute periods pass it (low confidence, rare).',
      ),
    },
    seconds: {
      title: t('每一秒的量都不一樣', 'Every second is different'),
      sub: t('大部分的秒數不多，少數幾秒很多', 'Most seconds have little; a few seconds have a lot'),
      adult: t('大人鼻子的高度・風從機車吹來（{s} 秒）', "Adult's nose height · wind from the scooters ({s} s)"),
      pushchair: t('嬰兒車的高度・一輛機車排氣管後半公尺・幾乎沒風（{s} 秒）', 'Pushchair height · half a metre behind one tailpipe · almost no wind ({s} s)'),
      mean: t('整個紅燈的平均', 'Average over the red'),
      xAxis: t('每一秒，從多排到少', 'each second, most to least'),
      yAxis: t('一氧化碳（ppm）', 'Carbon monoxide (ppm)'),
      caption: t('推估。每個例子是一個紅燈、一種中間的排放量算一次的結果，不是範圍。一秒的數字不太準，在嬰兒車的高度可能還算低了。', 'Estimate. Each example is one simulated red light with one middle emission level, not a range. One-second values are rough, and probably too low at pushchair height.'),
      sum: t('推估，兩個例子：每一秒的量都不一樣。大部分的秒數不多，少數幾秒是整個紅燈平均的好幾倍，靠近排氣管、幾乎沒風時更明顯。這是一次的結果，不是範圍。', 'Estimate, two examples: every second differs. Most seconds hold little, and a few seconds reach several times the average over the red, more so right behind a tailpipe in almost no wind. Each is one run, not a range.'),
      tableHead: [t('例子', 'Example'), t('看到什麼', 'What it shows')],
      tableAdult: t('少數幾秒是平均的好幾倍', 'a few seconds reach several times the average'),
      tablePushchair: t('更多秒數遠高於平均；一陣一陣更明顯', 'more seconds far above the average; the bursts are stronger'),
    },
    above: {
      smellTitle: t('紅燈裡，多少時間聞得到', 'How much of the red you can smell it'),
      smellAxis: t('聞得到的時間，占紅燈的多少（%）', 'Share of the red you can smell it (%)'),
      smell1967: t('照 1967 年研究的標準', "By the 1967 study's level"),
      smell1970: t('照 1970 年研究的標準', "By the 1970 study's level"),
      smellSub: t('路邊半公尺・風整個紅燈從機車吹來（最多約八個紅燈有一個）', 'Kerb, half a metre · wind from the scooters for the whole red (at most about 1 red in 8)'),
      smellCaption: t('推估。「聞得到」的標準，來自 1967 和 1970 年汽車廢氣研究的摘要，只能說「風吹來時，很多秒聞得到」。每條是排放量從少到多的範圍；文字照的是中間的情形。', "Estimate. What counts as 'can smell it' comes from abstracts of car-exhaust studies from 1967 and 1970; it supports only 'smellable in many seconds when the wind blows from the scooters'. Each band spans low to high emissions; the words follow the middle values."),
      smellSum: t('推估：風整個紅燈從一群機車吹來時，紅燈大約一半到幾乎全部的時間，廢氣都多過一般人聞得到的量。', 'Estimate: when the wind blows from a group of scooters for the whole red, the exhaust is above what most people can smell for about half to nearly all of the red.'),
      benzeneTitle: t('在路口待一小時的人，吸到的苯（ㄅㄣˇ）', 'Benzene for people who stay an hour'),
      benzeneAxis: t('苯，一小時平均（ppb）', 'Benzene, 1-hour average (ppb)'),
      benzeneKerb: t('站一小時，路邊半公尺，嬰兒車的高度', 'An hour at the kerb, half a metre, pushchair height'),
      benzeneBack: t('站一小時，離路邊 1 公尺，小孩的高度', 'An hour, 1 metre back, child height'),
      benzeneSub: t('風一直從機車吹來', 'Wind always from the scooters'),
      benzeneRef: t('美國加州 1 小時參考值 {ref}（用 {h} 小時的資料訂的）', "California's 1-hour reference, {ref} (set from {h}-hour data)"),
      benzeneCaption: t('這不是在說等一個紅燈的人。機車廢氣裡有多少苯，我們不太確定，可能差到 {lo} 到 {hi} 倍。範圍從中間的情形，到偏高但平常的情形，不是最糟的。', 'This is not about someone waiting one red. We are not sure how much benzene scooter exhaust holds; it could be off {lo}- to {hi}-fold. Each range runs from the middle case to a high-but-ordinary case, not the worst.'),
      benzeneSum: t('推估：在路口待上一小時、風一直從機車吹來的人，苯的一小時平均是加州 1 小時參考值的 {times}。', 'Estimate: for people who stay an hour with the wind always from the scooters, the 1-hour benzene average is {times} California\'s 1-hour reference.'),
      tableHead: [t('情況', 'Case'), t('數值', 'Value')],
      tableStat: t('一種算法：從中間的情形，到偏高但平常的情形', 'One statistic: from the middle case to a high-but-ordinary case'),
    },
    /** SmellBenzene (/estimate/#smell, /questions/smell/ screen 2): seconds-long benzene only. */
    smellBenzene: {
      title: t('味道來的時候，苯也在，只是淡到聞不出苯自己', 'When the smell comes, benzene is there too, just too faint to be smelled itself'),
      axis: t('苯（ppb＝十億份空氣裡有幾份），每往右一格，就是多十倍', 'Benzene (ppb = parts in a billion of air); each step right is ten times more'),
      just: t('剛好聞得到廢氣味的時候', 'When the exhaust is just noticeable'),
      justSub: t('一輛機車・和風怎麼吹無關', 'One scooter · does not depend on the wind'),
      seconds: t('風從機車吹來，聞得到的那幾秒', 'Wind from the scooters, the seconds you can smell it'),
      secondsSub: t('離最近的機車半公尺、小孩鼻子的高度（約 0.7 公尺）・這種風最多約八個紅燈有一個', 'Half a metre from the nearest scooter, child’s nose height (about 0.7 m) · such a wind comes in at most about 1 red in 8'),
      odour: t('鼻子聞得出「苯」自己的濃度：公開數值裡最低的（不是健康標準）', 'Where benzene itself can be smelled: the lowest published value (not a health limit)'),
      caption: t(
        '推估。每條是從低到高的範圍，沒有標中間。上面一條是常見的量，不是最少的量；兩個「聞得到」的標準來自 1967 和 1970 年的汽車廢氣研究，電腦換了 {nj} 種單獨一輛機車的排放量來算。下面一條是電腦算的一個紅燈，換了 {ns} 次排放量；聞得到的時間，依中間推估約占紅燈的 {a}%（1967 年的標準）到 {b}%（1970 年的標準）。這是機車另外加進空氣裡的量；成分比例來自舊型機車。幾秒鐘的量沒有官方的數值可以比，所以沒辦法說它高或低。',
        'Estimate. Each band runs from low to high; its middle is not marked. The top band is a typical value, not a minimum; its two "can smell it" levels come from car-exhaust studies of 1967 and 1970, worked out for {nj} single scooters. The lower band is one simulated red with {ns} draws of the emissions; at the central estimate the smell is there for about {a} % (1967 level) to {b} % (1970 level) of the red. These are amounts the scooters add; the shares come from older scooters. No official value exists for a few seconds, so they cannot be called high or low.',
      ),
      summary: t(
        '推估：剛好聞得到時，苯{just}；風從機車吹來、聞得到的那幾秒，苯平均大約 {about}（範圍{seconds}）。兩者都遠低於鼻子聞得出苯自己的濃度。',
        'Estimate: when the smell is just noticeable, benzene is {just}; in the seconds you can smell it with the wind from the scooters, it averages about {about} (range {seconds}). Both are far below the level at which benzene itself can be smelled.',
      ),
      tableHead: [t('情況', 'Case'), t('苯', 'Benzene')],
      tableStat: t('剛好聞得到：兩個標準的中間值，到最低和最高；那幾秒：從低到高', 'Just noticeable: the two levels\' central values, with the lowest and highest; the seconds: low to high'),
      lowest: t('最低約\u00a0{lo}，最高約\u00a0{hi}', 'lowest about\u00a0{lo}, highest about\u00a0{hi}'),
      aboutRange: t('大約 {about}（範圍{range}）', 'about {about} (range {range})'),
    },
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
    appliesShort: t('大人鼻子的高度，90 秒平均', "adult's nose height, 90-second average"),
    logNote: t('橫的刻度，每一格是前一格的十倍。這樣很小和很大的數字，可以放在同一張圖。', 'Each step along the scale is ten times the one before, so very small and very large amounts fit on one chart.'),
    scenarioHead: t('旁邊停了幾輛', 'Scooters beside you'),
    addedHead: t('這排機車多出來', 'Added by these scooters'),
    totalLine: t('含街上原本就有的（各地不同，不是固定加 0.5）：{v}', 'Including what the street already holds (it varies by place; not a fixed 0.5 added): {v}'),
    streetLine: t('街上原本就有：{v}', 'Already in the street: {v}'),
    tableCaption: t('這排機車多出來的量（{stamp}）', 'What the scooters add ({stamp})'),
    tableMark: t('怎麼來的', 'What kind of figure'),
    sum: t('{pollutant}，{scenario}：多出{v}。', '{pollutant}, {scenario}: {v} added.'),
    sumStreet: t('街上原本就有{v}。', 'The street already holds {v}.'),
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
