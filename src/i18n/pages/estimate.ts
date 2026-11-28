// Copy for /estimate/ — 怎麼算的 / How we worked it out (redesign brief 7.2). Replaces the old
// /unmeasured/ page. Every number is filled at render time from src/data/estimate.ts, the
// registry or the drawing rule (src/components/art/air-slots.ts): `{name}` marks each one.
// The estimate's own fixed wording (the flow, the cross-check, the limits, the confidence words)
// is lane A's, in src/data/estimate.ts → estimateText; the K sentences are lane B's (ui.ts).
// See ./_copy.ts.

import { copy } from './_copy.ts';

export default copy({
  /** Formats the page builds around numbers (kept here so check-copy reads them). */
  fmt: {
    sheetTitle: { 'zh-TW': '「{v}」|怎麼來的', en: '“{v}” |where it comes from' },
    metres: { 'zh-TW': '{lo} 到 {hi} 公尺', en: '{lo} to {hi} m' },
    ppmRange: { 'zh-TW': '約 {lo} 到 {hi} ppm', en: 'about {lo} to {hi} ppm' },
  },
  meta: {
    title: { 'zh-TW': '怎麼算的', en: 'How we worked it out' },
    description: {
      'zh-TW': '紅燈時，一排機車讓路邊多了多少廢氣？這裡有本站的推估、一步一步的算法、每個數字的出處。還有它和交通部運輸研究所（運研所）量到的數字比起來怎麼樣。',
      en: 'How much exhaust does a row of scooters, engines running, add at the kerb? Here are our estimate, the working step by step and the source of every input. Here too is how it compares with the Institute of Transportation’s readings.',
    },
  },

  hero: {
    eyebrow: { 'zh-TW': '怎麼算的', en: 'How we worked it out' },
    title: { 'zh-TW': '機車旁邊|多了多少廢氣，|我們這樣算', en: 'What the scooters add at the kerb, |and how we worked it out' },
    lead: {
      'zh-TW': '一排機車停在紅燈前，引擎沒熄火。站在旁邊的人，多吸到多少廢氣？我們用一氧化碳來算，把它當作廢氣的記號：機車定檢也量它。這一頁從答案開始，再一步一步說明怎麼算。',
      en: 'A row of scooters waits at a red light with engines running. How much more exhaust does the person beside them breathe? We work it out with carbon monoxide, as a marker for the exhaust: scooter inspections measure it too. This page starts with the answer, then shows the working step by step.',
    },
    boxTitle: { 'zh-TW': '一氧化碳：旁邊停了十來輛機車', en: 'Carbon monoxide: a dozen or so scooters beside you' },
    notMeasured: { 'zh-TW': '這是推估，不是實測。', en: 'This is an estimate, not a measurement.' },
    chartLead: {
      'zh-TW': '把算出來的，和真正量到的放在同一把尺上：',
      en: 'What we worked out, on the same scale as what was measured:',
    },
    tocLabel: { 'zh-TW': '這一頁有什麼', en: 'On this page' },
  },

  /** The sheet behind the chart and the number box at the top. */
  sheet: {
    measured: {
      'zh-TW': '交通測站 {year} 年平均約 {bg} ppm。運研所在 {sites} 個路口的行人等候區，量到最高的一分鐘是 {peaks} ppm。',
      en: 'Traffic stations averaged about {bg} ppm in {year}. In pedestrian waiting areas at {sites} junctions, the Institute of Transportation’s highest minute was {peaks} ppm.',
    },
    care: {
      'zh-TW': '圖上算的那一條是總量：機車加上去的，再加上街上原本就有的。',
      en: 'The worked-out band on the chart is the total: what the scooters add plus what the street already holds.',
    },
  },

  toc: {
    numbers: { 'zh-TW': '算出來的數字', en: 'The numbers' },
    simulation: { 'zh-TW': '電腦算的一個紅燈', en: 'One red light, simulated' },
    smell: { 'zh-TW': '聞得到的時候，空氣裡還有什麼', en: 'When you can smell it, what else is in the air' },
    recipe: { 'zh-TW': '怎麼算', en: 'How it is worked out' },
    count: { 'zh-TW': '旁邊停幾輛', en: 'How many scooters' },
    check: { 'zh-TW': '跟量到的對得起來嗎', en: 'Does it match the readings?' },
    range: { 'zh-TW': '為什麼是一個範圍', en: 'Why a range' },
    drawing: { 'zh-TW': '圖是怎麼畫的', en: 'How the pictures are drawn' },
    limits: { 'zh-TW': '這個推估不能說什麼', en: 'What it cannot tell you' },
    answers: { 'zh-TW': '13 個問題的答案', en: 'Answers to 13 questions' },
    measure: { 'zh-TW': '把推估換成實測', en: 'Turn it into a measurement' },
  },

  numbers: {
    /** Moved here from home screen 7's sheet (decision 2026-11-28); {pct} is dose.dayShare.underPct. */
    dose: {
      'zh-TW': '一天四個紅燈，讓你一整天吸到的一氧化碳多不到 {pct}%。',
      en: 'Four red lights a day raise the carbon monoxide you breathe over a whole day by under {pct}%.',
    },
    eyebrow: { 'zh-TW': '1　數字', en: '1 · The numbers' },
    title: { 'zh-TW': '算出來的數字', en: 'The numbers' },
    lead: {
      'zh-TW': '分三種情況：旁邊停了幾輛、十來輛，或是停滿。每一格都是一個範圍，因為風、車子和你站的位置，每個紅燈都不一樣。',
      en: 'There are three cases: a few scooters beside you, a dozen or so, or a full stop box. Every cell is a range, because the wind, the scooters and where you stand differ at every red light.',
    },
    ultrafineTitle: { 'zh-TW': '超細微粒呢？', en: 'What about ultrafine particles?' },
    ultrafineWhy: {
      'zh-TW': '所以表上沒有超細微粒這一列。我們不寫一個猜的數字。',
      en: 'That is why the table has no row for ultrafine particles. We do not print a guess.',
    },
    chartTitle: { 'zh-TW': '畫成圖來看', en: 'See it as a chart' },
    downloads: { 'zh-TW': '下載這張表', en: 'Download this table' },
    csv: { 'zh-TW': 'CSV 檔', en: 'CSV file' },
    json: { 'zh-TW': 'JSON 檔', en: 'JSON file' },
    downloadNote: {
      'zh-TW': '檔案裡每一格是範圍的低的一頭和高的一頭，和上面的表一樣。',
      en: 'Each cell in the files is the low and the high end of the range, as in the table above.',
    },
  },

  /** #simulation: the signed 3-D simulation (research/simulation), statements.json `may` only. */
  simulation: {
    eyebrow: { 'zh-TW': '2　電腦算的一個紅燈', en: '2 · One red light, simulated' },
    title: { 'zh-TW': '我們用電腦，|把一個紅燈算了一遍', en: 'We simulated |one red light on a computer' },
    lead: [
      { 'zh-TW': '我們用電腦，把紅燈時路邊的風和廢氣，一秒一秒算出來。', en: 'On a computer, we worked out the wind and the exhaust at the kerb, second by second through a red light.' },
      { 'zh-TW': '算進去的有：機車停在哪裡、排氣管朝哪裡、風從哪裡來。', en: 'We put in where the scooters stop, where the tailpipes point and where the wind comes from.' },
      { 'zh-TW': '我們算了幾種情況，每種算一個紅燈：', en: 'We worked through a few cases, one red light each:' },
    ],
    cases: [
      { 'zh-TW': '一般的街，風從機車吹向人行道', en: 'an ordinary street, with the wind from the scooters to the pavement' },
      { 'zh-TW': '有騎樓的街，風很小', en: 'a street with an arcade, in light wind' },
      { 'zh-TW': '一輛機車排氣管後面，幾乎沒風', en: 'right behind one tailpipe, in almost no wind' },
    ],
    gloss: { 'zh-TW': '推估：這是算的，不是量的，所以給一個範圍，也寫出它要在什麼情況下才成立。', en: 'Estimate: worked out, not read off an instrument, so we give a range and the conditions it needs.' },
    askTitle: { 'zh-TW': '一氧化碳：|等一個紅燈，會到指引值嗎？', en: 'Carbon monoxide: |does one red light reach the WHO guideline?' },
    /** Why the home page's screens leave carbon monoxide out, and the finding in one place (decision 2026-11-28). */
    askLead: {
      'zh-TW': '首頁的畫面不談一氧化碳。推估：等一個紅燈，它低於世界衛生組織的指引值；就算整整 15 分鐘每個紅燈都站在路邊、風一直從機車吹來，也還是低於。例外只有一個少見的情形：嬰兒車停在排氣管正後方約半公尺、幾乎沒風，連續 15 分鐘每個紅燈都在。完整的結果都在這裡。',
      en: 'The home page’s screens leave carbon monoxide out. Estimate: one red light keeps it below the WHO guideline, and so does standing at the kerb through every red for 15 minutes with the wind from the scooters. The one rare exception is a pushchair about half a metre behind a tailpipe, in almost no wind, through every red for 15 minutes. The full results are here.',
    },
    smell: [
      { 'zh-TW': '推估：你聞到的臭味是真的。', en: 'Estimate: the smell you notice is real.' },
      { 'zh-TW': '風從一群引擎沒熄火的機車吹向你時，紅燈大約一半到幾乎全部的時間，廢氣都濃到一般人聞得到。', en: 'When the wind blows to you from a group of scooters with their engines running, for about half to nearly all of the red, the exhaust is strong enough for most people to smell.' },
      { 'zh-TW': '「聞得到」的標準，來自 1967 和 1970 年汽車廢氣研究的摘要。', en: 'What counts as ‘can smell it’ comes from abstracts of car-exhaust studies from 1967 and 1970.' },
      { 'zh-TW': '一氧化碳沒有味道。你聞到的味道，比較可能是燒過才有的（推估，只能粗略估計）；鼻子在十億份空氣裡只有幾份時，就聞得到。', en: 'Carbon monoxide has no smell. The smell you notice more likely comes from burning (an estimate, order of magnitude only); the nose picks it up at a few parts in a billion.' },
      { 'zh-TW': '所以很臭，不代表一氧化碳超過指引值。', en: 'So a strong smell does not mean carbon monoxide is over the guideline.' },
    ],
    oneRed: [
      { 'zh-TW': '推估：在一般的街上等一個紅燈，身邊的一氧化碳會變多。', en: 'Estimate: waiting one red light on an ordinary street adds carbon monoxide around you.' },
      { 'zh-TW': '攤成 15 分鐘的平均，多{range}，比世界衛生組織的 87 ppm 低很多。', en: 'Spread over 15 minutes, it adds {range}, far below the WHO value of 87 ppm.' },
      { 'zh-TW': '排氣管正後方、幾乎沒風時，最多約 {near} ppm。', en: 'Right behind a tailpipe in almost no wind, it is up to about {near} ppm.' },
    ],
    compareTitle: { 'zh-TW': '都換成 15 分鐘的平均來比', en: 'All as 15-minute averages' },
    compareLead: { 'zh-TW': '世界衛生組織的指引值看的是 15 分鐘的平均，所以下面每一列，都先換成 15 分鐘的平均。', en: 'The WHO guideline is about a 15-minute average, so every row below is first turned into a 15-minute average.' },
    /** Why these are higher than section 1's 90-second estimate (a reader compares the two). */
    compareWhy: { 'zh-TW': '這些數字比第 1 節的 90 秒推估多：這裡離機車只有半公尺、在小孩和嬰兒車的高度，也算了風一直從機車吹來的紅燈；第 1 節只算大人鼻子的高度。', en: 'These are higher than the 90-second estimate in section 1: here it is half a metre from the scooters, at child and pushchair height, and includes reds with the wind held from the scooters; section 1 is an adult’s nose height only.' },
    stay: [
      { 'zh-TW': '推估：就算每個紅燈都站在路邊、站滿 15 分鐘，風又一直從機車吹向你，', en: 'Estimate: even if you stand at the kerb through every red for 15 minutes, with the wind always blowing from the scooters to you,' },
      { 'zh-TW': '一氧化碳的 15 分鐘平均是{range}，還是低於 87 ppm。', en: 'the 15-minute carbon monoxide average is {range}, still below 87 ppm.' },
      { 'zh-TW': '這是小孩和嬰兒車的高度；膝蓋高的地方更多。我們只算了一個紅燈，15 分鐘是照它推出來的。風一直這樣吹，很少見。', en: 'This is at child and pushchair height; knee height gets more. We simulated one red; the 15 minutes are worked out from it. A wind that keeps blowing this way is rare.' },
    ],
    pushchairTitle: { 'zh-TW': '有一個例外', en: 'There is one exception' },
    pushchair: [
      { 'zh-TW': '推估：嬰兒車停在一輛機車排氣管的正後方，約半公尺。', en: 'Estimate: a pushchair stands half a metre directly behind one scooter’s tailpipe.' },
      { 'zh-TW': '機車引擎沒熄火，幾乎沒有風，風向也不變。', en: 'The engine is running, there is almost no wind, and it does not change direction.' },
      { 'zh-TW': '每個紅燈都停在那裡，連續 15 分鐘。', en: 'It stays there through every red for 15 minutes.' },
      { 'zh-TW': '這時嬰兒車裡低低的地方（約 0.6 公尺），一氧化碳的 15 分鐘平均，可能超過 87 ppm。', en: 'Then, low in the pushchair (about 0.6 m), the 15-minute carbon monoxide average can pass 87 ppm.' },
      { 'zh-TW': '這樣的 15 分鐘，每十次約有一到兩次；中間的情形是{middle}。', en: 'That happens in about 1 or 2 of 10 such 15-minute periods; the middle case is {middle}.' },
      { 'zh-TW': '很弱的風剛好從那一邊吹來，大約一百個紅燈才有一次；要連續 15 分鐘，就更少了。', en: 'A very weak wind from that side comes in about 1 red in 100; for 15 minutes in a row it is rarer still.' },
      { 'zh-TW': '往旁邊移開半公尺，或到小孩站著的高度，就沒有了。', en: 'Move half a metre to the side, or up to a standing child’s height, and it is gone.' },
      { 'zh-TW': '這是我們最沒把握的結果：電腦裡的空氣比平常更靜，所以可能算高了。', en: 'This is our least certain result: the air in the model is stiller than usual, so it may be too high.' },
    ],
    burstsTitle: { 'zh-TW': '一陣一陣的', en: 'In bursts' },
    bursts: [
      { 'zh-TW': '推估：靠近排氣管時，一氧化碳是一陣一陣的。', en: 'Estimate: near a tailpipe, carbon monoxide comes in bursts.' },
      { 'zh-TW': '半公尺處，最多的一秒通常是{usual}。', en: 'At half a metre, the highest second is usually {usual}.' },
      { 'zh-TW': '風從機車吹來，或幾乎沒風時，可到{held}。', en: 'With the wind from the scooters, or almost no wind, it can reach {held}.' },
      { 'zh-TW': '一秒的數字不太準，可能差到三倍；在嬰兒車的高度，可能還算低了。', en: 'One-second numbers are rough and could be off about three-fold; at pushchair height they are probably too low.' },
      { 'zh-TW': '指引值看的是 15 分鐘的平均，所以一秒的量，不能拿來和它比。', en: 'The guideline is about a 15-minute average, so a one-second number cannot be set against it.' },
    ],
    heightTitle: { 'zh-TW': '嬰兒車的高度', en: 'Pushchair height' },
    height: [
      { 'zh-TW': '推估：風從機車吹來時，嬰兒車高度（約 0.7 公尺）的廢氣，和大人鼻子差不多到兩倍。', en: 'Estimate: with the wind from the scooters, exhaust at pushchair height (about 0.7 m) is between about the same as at an adult’s nose and about twice as much.' },
      { 'zh-TW': '排氣管正後方、幾乎沒風時，差得更多。不是每種風都這樣。', en: 'Right behind a tailpipe in almost no wind the difference is bigger. Not in every wind.' },
      { 'zh-TW': '這說的是那個高度的空氣，不是說小孩吸進的一氧化碳是大人的兩倍。', en: 'This is about the air at that height, not a claim that children breathe twice as much carbon monoxide.' },
    ],
    aboveTitle: { 'zh-TW': '臭味，和待一小時的人吸到的苯', en: 'The smell, and benzene for people who stay an hour' },
    stayers: [
      { 'zh-TW': '推估：在路口待上一小時的人，像攤販、交通警察、導護，如果風一直從機車吹來，', en: 'Estimate: for people who stay an hour at a junction, such as vendors, traffic officers and crossing guards, if the wind keeps blowing from the scooters,' },
      { 'zh-TW': '苯（ㄅㄣˇ）的一小時平均，可能是美國加州 1 小時參考值的{times}。', en: 'the 1-hour benzene average can be {times} California’s 1-hour reference level.' },
      { 'zh-TW': '這個參考值雖然叫 1 小時，是用 6 小時的資料訂的。機車廢氣裡有多少苯，我們不太確定，可能差到 5 到 10 倍。', en: 'That reference is called 1-hour but was set from 6-hour data. We are not sure how much benzene scooter exhaust holds; it could be off five- to ten-fold.' },
      { 'zh-TW': '這不是在說等一個紅燈的人。', en: 'This is not about someone waiting one red.' },
    ],
    sureTitle: { 'zh-TW': '可以信多少', en: 'How sure' },
    sure: [
      { 'zh-TW': '每個數字的可信程度，都是低到中。', en: 'Every number has low to moderate confidence.' },
      { 'zh-TW': '每種情況只算了一個紅燈。', en: 'Each case is one simulated red light.' },
      { 'zh-TW': '一秒的數字不太準，可能差到三倍。', en: 'One-second numbers are rough, possibly off about three-fold.' },
      { 'zh-TW': '引擎的熱、排氣的溫度和角度，都是假設的。', en: 'Engine heat, exhaust temperature and exhaust angle are assumptions.' },
      { 'zh-TW': '風整個紅燈都從機車吹來，有多常見並不知道；最多大約八個紅燈有一個。站滿 15 分鐘都這樣，就更少了。', en: 'How often the wind blows from the scooters for a whole red is not known: at most about 1 red in 8. For 15 minutes in a row, rarer still.' },
      { 'zh-TW': '嬰兒車停在排氣管正後方的那個結果，最沒把握。', en: 'The pushchair-behind-a-tailpipe result is the least certain.' },
      { 'zh-TW': '電腦算的，沒有拿量到的來比對。', en: 'The simulation was not checked against readings.' },
    ],
    notTitle: { 'zh-TW': '沒有算的', en: 'Not simulated' },
    enclosed: [
      { 'zh-TW': '推估：一般來說，只有封閉的地方，才可能讓一氧化碳的 15 分鐘平均到指引值。', en: 'Estimate: generally, only enclosed places could bring the 15-minute carbon monoxide average up to the WHO value.' },
      { 'zh-TW': '這是用空氣流量粗算的，不是一秒一秒算的。', en: 'This is a rough air-flow sum, not a second-by-second simulation.' },
      { 'zh-TW': '例如地下停車場、地下道，或不太通風、有屋頂的候車區，裡面有幾十輛機車引擎沒熄火。', en: 'For example an underground car park, an underpass, or a stuffy covered waiting area with dozens of scooters idling.' },
      { 'zh-TW': '這些地方我們沒有算，也沒有找到台灣在這些地方的量測。', en: 'We did not simulate these, and we found no Taiwanese measurement of them.' },
    ],
    notList: [
      { 'zh-TW': '綠燈起步的那一陣。', en: 'The burst when the scooters pull away at green.' },
      { 'zh-TW': '很多個紅燈連著會怎樣：15 分鐘和 1 小時的數字，是照一個紅燈推出來的。', en: 'What many reds in a row do: the 15-minute and 1-hour figures are worked out from one red.' },
      { 'zh-TW': '微粒。', en: 'Particles.' },
      { 'zh-TW': '兩邊有高樓的街：這次算得不夠準，所以不用。', en: 'A street between tall buildings: the result was not reliable enough, so we do not use it.' },
      { 'zh-TW': '這不是健康評估，也不能拿來說會讓人生什麼病。', en: 'This is not a health assessment, and it shows no health effect.' },
    ],
    moreTitle: { 'zh-TW': '還算了什麼', en: 'What else we worked out' },
    arcade: [
      { 'zh-TW': '推估：風從機車吹向騎樓時，走進騎樓 1 到 3 公尺，一氧化碳比路邊少，平均是{range}，但不是乾淨的空氣。', en: 'Estimate: with the wind from the scooters toward an arcade, 1 to 3 metres inside it there is less carbon monoxide than at the kerb, {range} on average, but the air is not clean.' },
      { 'zh-TW': '這只算了一個風很小的紅燈；很多個紅燈連著會怎樣，沒有算。', en: 'This is one light-wind red; many reds in a row were not simulated.' },
    ],
    filesTitle: { 'zh-TW': '數字的檔案', en: 'The numbers as a file' },
    files: {
      'zh-TW': '每個數字的範圍和條件，都在下面這個檔案裡。這是本站從簽核的報告取出來的完整摘錄，有些數字網頁上沒有印，因為只能和它的條件一起看。',
      en: 'Every number’s range and conditions are in the file below. It is the full extract the site takes from the signed report; some numbers in it are not printed on these pages, because they only make sense with their conditions.',
    },
    json: { 'zh-TW': '下載完整的摘錄（JSON）', en: 'Download the full extract (JSON)' },
  },

  /** #smell: the signed smell-chemicals step (research/simulation/smell-chemicals), statements-smell.json `may` only. */
  smell: {
    eyebrow: { 'zh-TW': '3　電腦算的一個紅燈・味道', en: '3 · One red light, simulated: the smell' },
    title: { 'zh-TW': '聞得到的時候，|空氣裡還有什麼', en: 'When you can smell it, |what else is in the air' },
    lead: [
      /** alwaysCarry, verbatim */
      { 'zh-TW': '推估，不是實測。數字都有範圍。這是機車另外加進空氣裡的量，不含原本街上的空氣。', en: 'Estimate, not a measurement. Every number has a range. These are amounts the scooters add to the air already there.' },
      { 'zh-TW': '每一種成分占多少，來自台灣（2008 年）、印度、尼泊爾的舊型機車（化油器或沒有觸媒），有兩種只有汽車的資料；新型、噴射、有觸媒的機車可能不一樣。', en: 'Every share comes from older scooters (Taiwan 2008, India, Nepal; carburetted or without a catalyst), and two only from cars; modern fuel-injected scooters with a catalyst may differ.' },
    ],
    files: { 'zh-TW': '方法和每一個數字（研究檔案，英文）：', en: 'The method and every number (research files):' },
    methodLink: { 'zh-TW': '方法', en: 'Method' },
    resultsLink: { 'zh-TW': '所有數字（JSON）', en: 'Every number (JSON)' },
    withTitle: { 'zh-TW': '聞到的不是苯，|但苯跟著一起來', en: 'What you smell is not benzene, |but benzene comes with it' },
    with: [
      /** smell-comes-with-benzene, verbatim */
      { 'zh-TW': '聞到的不是苯，但苯跟著一起來。只要你聞得到身旁引擎沒熄火的機車廢氣，同一口空氣裡就有苯（推估）。', en: 'What you smell is not benzene, but benzene comes with it. Whenever you can smell the exhaust of the idling scooters beside you, the same breath of air holds benzene (estimate).' },
      /** what-is-in-it, in share order (hydrogen cyanide is named in the table only: its share is of carbon monoxide) */
      { 'zh-TW': '如果你聞到的是身旁機車的廢氣，那口空氣裡也有甲苯、二甲苯、乙苯、苯、1,3-丁二烯、正己烷、甲醛、乙醛、萘、苯乙烯和丙烯醛（照在廢氣裡占的多少排，推估）。', en: 'If what you smell is the exhaust of the scooters beside you, that air also holds toluene, xylenes, ethylbenzene, benzene, 1,3-butadiene, n-hexane, formaldehyde, acetaldehyde, naphthalene, styrene and acrolein (in order of their share of the exhaust; estimate).' },
      /** no-smell-not-clean, with the standing wording 小到看不到 */
      { 'zh-TW': '聞不到，不代表空氣乾淨。沒有味道的時候也可能有苯。一氧化碳沒有味道，微粒小到看不到。', en: 'No smell does not mean clean air. Benzene can be there when nothing can be smelled. Carbon monoxide has no smell, and particles are too small to see.' },
    ],
    /** hazard-labels, verbatim, its own paragraph */
    hazard: {
      'zh-TW': '世界衛生組織的癌症研究機構（IARC）把苯、1,3-丁二烯、甲醛列為「確定會讓人致癌」的第1類。這是說「證據有多強」，不是說等一個紅燈會有多少風險。汽油引擎廢氣整體被列為第2B類（「可能致癌」）。',
      en: 'The World Health Organization’s cancer agency (IARC) puts benzene, 1,3-butadiene and formaldehyde in Group 1, ‘causes cancer in humans’. That describes how strong the evidence is, not the risk from waiting at one red light. Petrol-engine exhaust as a whole is Group 2B, ‘possibly causes cancer’.',
    },
    justTitle: { 'zh-TW': '剛好聞得到的時候', en: 'When it is just noticeable' },
    just: [
      { 'zh-TW': '推估：剛好聞得到廢氣味的時候，苯是{just}（範圍約 {lo} 到 {hi}）。ppb＝十億份空氣裡有幾份。', en: 'Estimate: at the moment the exhaust is just noticeable, benzene is {just} (range about {lo} to {hi}). ppb = parts in a billion of air.' },
      { 'zh-TW': '這是常見的量，不是最少的量。兩個數字來自 1967 和 1970 年兩個汽車廢氣的嗅覺研究；它們差 8.5 倍，是這個數字最大的不確定。', en: 'A typical value, not a minimum. The two numbers come from two smell tests of car exhaust from 1967 and 1970; they are 8.5 times apart, the largest single uncertainty in this number.' },
      { 'zh-TW': '電腦換了 10,000 種單獨一輛機車的排放量來算，和風怎麼吹無關。幾秒鐘的量，沒有官方的數值可以比，所以沒辦法說它高或低。', en: 'Worked out for 10,000 single scooters; it does not depend on the wind. No official value exists for a few seconds, so it cannot be called high or low.' },
    ],
    secondsTitle: { 'zh-TW': '風從機車吹來，|聞得到的那幾秒', en: 'Wind from the scooters: |the seconds you can smell it' },
    seconds: [
      /** level-in-smellable-seconds */
      { 'zh-TW': '推估：風從機車群吹過來的時候，在離最近一台機車半公尺、小孩和嬰兒車的高度（約 0.7 公尺），聞得到的那幾秒裡，苯平均大約 {about}，範圍{seconds}。', en: 'Estimate: with the wind blowing from the scooters, half a metre from the nearest one at child and pushchair height (about 0.7 m), benzene averages about {about} over the seconds you can smell it, range {seconds}.' },
      /** how-often-wind: both thresholds, the condition, how often */
      { 'zh-TW': '這種風，尖峰時段最多大約八個紅燈有一個。這時聞得到的時間，依中間推估約占紅燈的 {a}%（1967 年的標準）到 {b}%（1970 年的標準）。', en: 'Such a wind comes in at most about 1 in 8 peak-hour reds. Then the smell is there for about {a} % of the red by the 1967 study’s level and {b} % by the 1970 study’s (central estimates).' },
      { 'zh-TW': '上面「紅燈裡，多少時間聞得到」那張圖的範圍（{eLoA} 到 {eHiA}%、{eLoB} 到 {eHiB}%），只算了機車排多少不一樣；這裡再把廢氣怎麼散開的不確定也算進去，所以範圍更寬：{aLo} 到 {aHi}%、{bLo} 到 {bHi}%。', en: 'The ranges in the chart above, ‘How much of the red you can smell it’ ({eLoA}–{eHiA} % and {eLoB}–{eHiB} %), count only how much the scooters give off; here the uncertainty in how the exhaust spreads is counted as well, so the ranges are wider: {aLo}–{aHi} % and {bLo}–{bHi} %.' },
      { 'zh-TW': '中間推估下，電腦算的 1,000 次，每次都有聞得到的秒數；推估取低的一頭時，用 1967 年的標準，1,000 次裡有 {lowDraws} 次。每種情況只算了一個紅燈；信心低到中等偏低。', en: 'At the central estimate, all 1,000 simulated runs have smellable seconds; at the low end, by the 1967 level, {lowDraws} of 1,000 do. Each case is one simulated red; confidence low to low-moderate.' },
      { 'zh-TW': '幾秒鐘的量，沒有官方的數值可以比。', en: 'No official value exists for a few seconds.' },
    ],
    whatTitle: { 'zh-TW': '那個味道是什麼', en: 'What the smell is' },
    what: [
      /** not-unburnt-petrol */
      { 'zh-TW': '推估：那個味道比較可能來自燃燒後產生的醛（ㄑㄩㄢˊ）類，不是沒燒完的汽油；這只能粗略估計，可能差到十倍左右。', en: 'Estimate: the smell more likely comes from aldehydes formed by burning, not from unburnt petrol; this is only a rough estimate, within about ten times.' },
      { 'zh-TW': '日本的實驗量過每一種東西要多淡，人才聞得到（嗅覺門檻）。苯要百萬分之幾才聞得到；乙醛只要十億分之幾。', en: 'Experiments in Japan measured how little of each substance people can smell (the odour threshold). Benzene needs parts per million; acetaldehyde only parts per billion.' },
      { 'zh-TW': '推估：在每一種電腦算的情況裡，聞得到的那幾秒，乙醛在六成到全部的情形下，高過它最低的嗅覺門檻。在一群機車的情況裡，苯一次也沒有到它自己聞得到的量，乙醛也從來沒有濃到「一聞就很清楚」。', en: 'Estimate: in every simulated case, during the seconds you can smell it, acetaldehyde is above its lowest odour threshold in six in ten to all of the runs. In the cases with a group of scooters, benzene never reaches the level at which it can itself be smelled, and acetaldehyde never gets strong enough to be clearly noticeable.' },
      { 'zh-TW': '甲苯、二甲苯、甲醛等，有時也高過它們最低的嗅覺門檻；真正的味道是很多東西混在一起的。沒燒完的汽油蒸氣，我們沒有另外算。', en: 'Toluene, xylenes, formaldehyde and others are sometimes above their lowest odour thresholds too; a real smell is a mixture. Unburnt petrol vapour was not worked out separately.' },
      { 'zh-TW': '嗅覺門檻每個人不一樣，不同來源差到十倍、百倍。乙醛可能是你聞到的一部分，但我們分不出你聞到的是哪一種。', en: 'Odour thresholds differ from person to person and between sources by ten to a hundred times. Acetaldehyde is probably part of what you smell, but we cannot tell which chemical you smell.' },
    ],
    hourTitle: { 'zh-TW': '換成 30 分鐘或 1 小時的平均', en: 'As 30-minute or 1-hour averages' },
    hourLead: { 'zh-TW': '下面的數字都是平均：30 分鐘或 1 小時，只拿來和同樣時間長度的參考值（衛生單位訂的、用來比的數值）比。幾秒鐘的量不放在這裡。', en: 'Every number below is an average over 30 minutes or 1 hour, set only against a reference value (a value health agencies set for comparison) of the same length. No few-second value appears here.' },
    /** one-red with its mustCarry */
    oneRed: { 'zh-TW': '推估：只等一個紅燈，依我們的中間推估，這些化學物質都不會因此達到 30 分鐘或 1 小時的公共參考值。很少見的情形：幾乎沒有風、站在一根排氣管下風半公尺，最壞的情況可能到。信心低。沒到參考值，不代表「安全」。', en: 'Estimate: waiting through one red light does not, on its own, bring any of these chemicals to a 30-minute or 1-hour public reference level, in our central estimate. In a rare near-calm case, standing half a metre downwind of one tailpipe, the worst case can reach them. Confidence is low. Below a reference level does not mean ‘safe’.' },
    /** stay-through-benzene, verbatim, then its mustCarry */
    stay: [
      { 'zh-TW': '如果有人整個小時每個紅燈都待在路邊（例如攤販、警察、導護），而且風一直從機車那邊吹過來，機車加進來的苯推估會超過美國加州的 1 小時參考值。', en: 'For someone who stays at the kerb through every red for an hour (a vendor, a police officer, a crossing guard), with the wind from the scooters the whole time, the benzene the scooters add is estimated to be above California’s 1-hour reference level.' },
      { 'zh-TW': '範圍從低於參考值到好幾倍；風要整整一小時都這樣吹，很少見；每個紅燈都用同一個電腦算的紅燈；這個參考值是用比較長時間（6 小時）的資料訂的；超過參考值，不等於證明有害。', en: 'The range runs from below the reference to several times above it; the wind must hold for the whole hour, which is rare; every red is the same simulated red; the reference was derived from a longer (6-hour) exposure; being above a reference level is not proof of harm.' },
    ],
    table: {
      caption: { 'zh-TW': '每一種成分：一小時（或 30 分鐘）每個紅燈都待在路邊的推估平均，和它自己同樣時間長度的參考值比。風一直從機車吹來，離最近的機車半公尺、小孩和嬰兒車的高度（約 0.7 公尺，和上面「待一小時」圖的第一列是同一個位置）。這種風最多大約八個紅燈有一個，整整一小時更少。上面那張圖只畫中間到偏高、但還算常見的情形；這張表寫的是中間值，括號裡是從低到高的整個範圍，所以兩邊的數字不一樣。', en: 'Each chemical: the estimated average for someone who stays through every red for an hour (or 30 minutes), against its own reference of the same averaging time. Wind always from the scooters, half a metre from the nearest scooter at child and pushchair height (about 0.7 m, the same spot as the first row of the stay-an-hour chart above). Such a wind comes in at most about 1 red in 8, and for a whole hour more rarely. The chart above shows only the middle to a high-but-ordinary case; this table gives the middle value with the full low-to-high range in brackets, so the numbers differ.' },
      head: [
        { 'zh-TW': '成分（照在廢氣裡占的多少排）', en: 'Chemical (in order of share of the exhaust)' },
        { 'zh-TW': '推估平均（範圍），µg/m³', en: 'Estimated average (range), µg/m³' },
        { 'zh-TW': '參考值，比一比', en: 'Reference, and how it compares' },
        { 'zh-TW': '可信程度', en: 'Confidence' },
      ],
      notAveraged: { 'zh-TW': '沒有算平均（沒有同樣時間長度的參考值可以比）', en: 'Not averaged: there is no reference of the same length to compare with' },
      refCell: { 'zh-TW': '{ref} {v}：{verdict}', en: '{ref} {v}: {verdict}' },
      names: {
        toluene: { 'zh-TW': '甲苯', en: 'Toluene' },
        xylenes: { 'zh-TW': '二甲苯', en: 'Xylenes' },
        ethylbenzene: { 'zh-TW': '乙苯', en: 'Ethylbenzene' },
        benzene: { 'zh-TW': '苯', en: 'Benzene' },
        butadiene: { 'zh-TW': '1,3-丁二烯', en: '1,3-Butadiene' },
        hexane: { 'zh-TW': '正己烷', en: 'n-Hexane' },
        formaldehyde: { 'zh-TW': '甲醛', en: 'Formaldehyde' },
        acetaldehyde: { 'zh-TW': '乙醛', en: 'Acetaldehyde' },
        naphthalene: { 'zh-TW': '萘', en: 'Naphthalene' },
        styrene: { 'zh-TW': '苯乙烯', en: 'Styrene' },
        acrolein: { 'zh-TW': '丙烯醛', en: 'Acrolein' },
        hcn: { 'zh-TW': '氰化氫', en: 'Hydrogen cyanide' },
      },
      avg60: { 'zh-TW': '1 小時', en: '1 hour' },
      cell: { 'zh-TW': '{avg}：{c}（{lo} 到 {hi}）', en: '{avg}: {c} ({lo}–{hi})' },
      avg30: { 'zh-TW': '30 分鐘', en: '30 minutes' },
      refs: {
        california: { 'zh-TW': '美國加州 1 小時參考值', en: 'California 1-hour reference' },
        californiaBenzene: { 'zh-TW': '美國加州 1 小時參考值（用 6 小時的資料訂的）', en: 'California 1-hour reference (set from 6-hour data)' },
        taiwanIndoor: { 'zh-TW': '台灣室內空氣品質標準（公共場所）1 小時值', en: 'Taiwan indoor-air quality standard (public places), 1-hour value' },
        who30: { 'zh-TW': '世界衛生組織 30 分鐘指引值', en: 'WHO 30-minute guideline' },
        whoOdour: { 'zh-TW': '世界衛生組織 30 分鐘氣味指引（不是健康上限）', en: 'WHO 30-minute odour-annoyance guideline (not a health limit)' },
        none: { 'zh-TW': '沒有 1 小時或更短的公開參考值', en: 'No public value of 1 hour or shorter' },
      },
      verdict: {
        no: { 'zh-TW': '低於', en: 'Below' },
        yes: { 'zh-TW': '中間推估高於（範圍從低於到好幾倍）', en: 'Above at the central estimate (range from below to several times above)' },
        worst: { 'zh-TW': '低於；只有最壞的情況高於', en: 'Below; above only in the worst case' },
        farBelow: { 'zh-TW': '遠低於，最壞的情況也是', en: 'Far below, even in the worst case' },
      },
      confidence: {
        'low-moderate': { 'zh-TW': '中等偏低', en: 'Low-moderate' },
        low: { 'zh-TW': '低', en: 'Low' },
        'very low': { 'zh-TW': '很低', en: 'Very low' },
      },
      carOnly: { 'zh-TW': '只有汽車的資料，範圍是假設的', en: 'car data only, range assumed' },
      ppb: { 'zh-TW': '約 {c} ppb（{lo} 到 {hi}）', en: 'about {c} ppb ({lo} to {hi})' },
      foot: { 'zh-TW': '超過參考值，不等於證明有害。每個紅燈都是同一個電腦算的紅燈，綠燈時不算。很少見、幾乎沒風、站在一根排氣管後面的最壞位置，數字在「所有數字」檔案裡。', en: 'Being above a reference level is not proof of harm. Every red is the same simulated red; nothing is counted in green. The rare near-calm worst position, behind one tailpipe, is in the ‘Every number’ file.' },
    },
    sureTitle: { 'zh-TW': '可以信多少', en: 'How sure' },
    sure: [
      { 'zh-TW': '每種情況只算了一個紅燈。', en: 'Each case is one simulated red.' },
      { 'zh-TW': '離機車 1 公尺內的秒數，受電腦格子的大小限制（可能差 0.3 到 3 倍）。', en: 'Seconds within a metre of the scooters are limited by the model’s grid (possibly off 0.3 to 3 times).' },
      { 'zh-TW': '風是固定的。', en: 'The wind is held fixed.' },
      { 'zh-TW': '「聞得到」來自 1967 和 1970 年兩個汽車廢氣研究，相差 8.5 倍。', en: '‘Can smell it’ comes from two car-exhaust studies of 1967 and 1970, 8.5 times apart.' },
      { 'zh-TW': '每一種成分占多少，不同來源差 2 到 20 倍；苯的可信程度中等，丙烯醛和萘很低。', en: 'The shares differ 2- to 20-fold between sources; benzene’s has moderate confidence, acrolein’s and naphthalene’s very low.' },
      { 'zh-TW': '有二行程機車的車群，苯可能算少了。', en: 'In a fleet with two-stroke scooters, benzene may be underestimated.' },
    ],
    notTitle: { 'zh-TW': '沒有算的', en: 'Not estimated' },
    not: [
      { 'zh-TW': '苯并[a]芘和其他黏在煙灰上的東西（沒有可用的資料，也沒有味道）。', en: 'Benzo[a]pyrene and other soot-bound chemicals (no usable data, and no smell).' },
      { 'zh-TW': '酚（不同來源差 100 倍）、硫化氫、戴奧辛。', en: 'Phenol (sources disagree 100 times), hydrogen sulphide, dioxins.' },
      { 'zh-TW': '新型、有觸媒機車的成分比例。', en: 'The mix from modern catalysed scooters.' },
      { 'zh-TW': '街上原本空氣裡的量。', en: 'What the street air already holds.' },
      { 'zh-TW': '味道也可能來自別的車或別的地方。', en: 'The smell may come from other traffic or other sources.' },
    ],
  },

  recipe: {
    eyebrow: { 'zh-TW': '4　算法', en: '4 · The working' },
    title: { 'zh-TW': '怎麼算', en: 'How it is worked out' },
    lead: {
      'zh-TW': '沒有人能在每個人的鼻子前面放一台儀器。所以我們用電腦把紅燈算一遍。機車停在哪裡、每輛排多少、風把廢氣吹到哪裡。每次換一種風、一批機車和一個站的位置。每種情況算 {runs} 次。',
      en: 'Nobody can put an instrument in front of every nose. So we work through the red light on a computer: where the scooters stop, how much each gives off, and where the wind carries it. Each run draws a new wind, a new set of scooters and a new place to stand. There are {runs} runs for each case.',
    },
    flowTitle: { 'zh-TW': '四個步驟', en: 'Four steps' },
    inputsTitle: { 'zh-TW': '用到的數字，|每一個都有出處', en: 'The inputs, each with its source' },
    source: { 'zh-TW': '出處', en: 'Source' },
    inputs: {
      readings: {
        name: { 'zh-TW': '機車定檢的一氧化碳讀數', en: 'Carbon monoxide readings from scooter inspections' },
        value: { 'zh-TW': '{n} 筆', en: '{n} readings' },
        note: {
          'zh-TW': '環境部公布的 {year} 年全國定檢統計。出廠滿 5 年的機車才要定檢；比較新的車沒有讀數，我們假設它們排得比較少。',
          en: 'The environment ministry’s national inspection table for {year}. Only scooters five or more years old are inspected; newer ones have no reading, so we assume they give off less.',
        },
      },
      fuel: {
        name: { 'zh-TW': '機車停著、引擎沒熄火，每小時燒多少汽油', en: 'How much petrol a stopped scooter burns an hour, engine running' },
        value: { 'zh-TW': '約 {lo} 到 {hi} 公克', en: 'about {lo} to {hi} g' },
        note: {
          'zh-TW': '這是越南的實驗室量的。台灣沒有這種量測。這是最該在台灣量的一個數字：它一變，每一種廢氣都跟著變。',
          en: 'Measured in laboratories in Vietnam. Taiwan has no such measurement, and it is the figure most worth measuring here: change it and every pollutant changes with it.',
        },
      },
      wind: {
        name: { 'zh-TW': '路邊的風', en: 'Wind at the kerb' },
        note: {
          'zh-TW': '從氣象站的平均風速往下調，再對照運研所在路口量到的風。三個紅燈裡，大約有兩個，風不是從機車吹向你。',
          en: 'Scaled down from weather-station averages and checked against the wind the Institute of Transportation measured at its junctions. In about two red lights out of three, the wind does not blow from the scooters towards you.',
        },
      },
      near: {
        name: { 'zh-TW': '最近的排氣管離你多遠', en: 'How far the nearest tailpipe is' },
        note: {
          'zh-TW': '機車從停止線往後停滿停等區，你站在停等區旁邊的人行道上。停等區的大小照道路標線的規定。',
          en: 'The scooters fill the stop box back from the stop line, and you stand on the pavement beside it. The size of the box follows the road-marking rules.',
        },
      },
    },
    resultTitle: { 'zh-TW': '算出來：|平均一輛機車停著、引擎沒熄火，|每小時排的一氧化碳', en: 'Result: the carbon monoxide the average stopped scooter gives off in an hour, engine running' },
    perRedTitle: { 'zh-TW': '等一個紅燈呢？', en: 'And through one red light?' },
    perRedNote: {
      'zh-TW': '一小時有 {reds} 個 {red} 秒，所以除以 {reds}。',
      en: 'An hour holds {reds} reds of {red} seconds, so divide by {reds}.',
    },
  },

  count: {
    eyebrow: { 'zh-TW': '5　幾輛', en: '5 · How many' },
    title: { 'zh-TW': '旁邊停幾輛', en: 'How many scooters are beside you' },
    lead: {
      'zh-TW': '三種情況，都是從運研所在路口錄影數的機車算出來的。',
      en: 'All three cases come from the scooters the Institute of Transportation counted on video at its junctions.',
    },
    count: { 'zh-TW': '{lo} 到 {hi} 輛', en: '{lo} to {hi} scooters' },
    nearest: { 'zh-TW': '最近的排氣管：{lo} 到 {hi} 公尺', en: 'Nearest tailpipe: {lo} to {hi} m' },
    busiestTitle: { 'zh-TW': '最忙的路口，|一個紅燈停幾輛', en: 'The busiest junction: how many stop at one red' },
    busiestNote: {
      'zh-TW': '這是把一小時的車流平均分給每個紅燈，不是真的去數一個紅燈。實際的路口，有時多、有時少。',
      en: 'This spreads an hour of traffic evenly over the red lights; it is not a count of one red. Real junctions have more at some reds and fewer at others.',
    },
    wait: {
      'zh-TW': '行人大約要等 {lo} 到 {hi} 秒，所以本站用 {red} 秒的紅燈來算。',
      en: 'Pedestrians wait about {lo} to {hi} seconds, so this site works with a {red}-second red.',
    },
  },

  check: {
    eyebrow: { 'zh-TW': '6　對照', en: '6 · The cross-check' },
    title: { 'zh-TW': '跟量到的對得起來嗎', en: 'Does it match what was measured?' },
    lead: {
      'zh-TW': '運研所（交通部運輸研究所）在{place}的 {sites} 個路口量空氣。儀器放在行人等候區，每個路口連續量 {hours} 小時。這是台灣在路口行人身邊量到的資料。',
      en: 'Taiwan’s Institute of Transportation put instruments in the pedestrian waiting areas of {sites} junctions in {place}, for {hours} hours at each. These are Taiwan’s readings taken beside people waiting at a junction.',
    },
    coTitle: { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
    observed: { 'zh-TW': '運研所量到：最忙的路口，最高那一分鐘比測站高', en: 'Measured by the Institute: at the busiest junction, the highest minute above the station' },
    model: { 'zh-TW': '我們的算法，放在那支儀器的位置和當時的風', en: 'Our method, run at that sensor’s position and that day’s wind' },
    pmTitle: { 'zh-TW': '細懸浮微粒|（PM2.5）', en: 'Fine particles |(PM2.5)' },
    pmMeasured: {
      'zh-TW': '運研所在等候區量到的 PM2.5，是每立方公尺 {lo} 到 {hi} 微克，看不出機車讓它變多。',
      en: 'The PM2.5 the Institute measured in the waiting areas was {lo} to {hi} µg/m³, with no visible rise from the scooters.',
    },
    pmOurs: {
      'zh-TW': '這和我們算的對得起來。大多數紅燈，機車加上去的 PM2.5，都比街上原本就有的少很多。所以儀器本來就很難看出來。',
      en: 'That fits our working: at most reds, the PM2.5 the scooters put in is much less than the street already holds, so an instrument would hardly see it.',
    },
    taipeiTitle: { 'zh-TW': '台北的路邊測站', en: 'Taipei’s roadside stations' },
    taipei: {
      'zh-TW': '台北市的路邊測站，{year} 年一氧化碳平均 {v} ppm。',
      en: 'Taipei’s roadside stations averaged {v} ppm of carbon monoxide in {year}.',
    },
    taipeiOurs: { 'zh-TW': '我們算的，十來輛機車加上街上原本就有的：', en: 'Our working, a dozen or so scooters plus what the street already holds:' },
    taipeiSame: {
      'zh-TW': '兩個差不多大。站在一排機車旁邊，就像站在車很多的大馬路邊。',
      en: 'The two are about the same size. Standing beside a row of scooters is like standing beside a busy main road.',
    },
    benzeneTitle: { 'zh-TW': '苯（ㄅㄣˇ）', en: 'Benzene' },
    benzene: {
      'zh-TW': '台北通勤的人在路上吸到的苯（Wu 等，2021），和我們算的是同一個大小。這只能比大小，不能當作驗證。',
      en: 'The benzene Taipei commuters breathed on the road (Wu et al., 2021) is of the same size as our working. This compares scale only; it does not confirm the estimate.',
    },
  },

  range: {
    eyebrow: { 'zh-TW': '7　範圍', en: '7 · The range' },
    title: { 'zh-TW': '為什麼是一個範圍', en: 'Why the answer is a range' },
    lead: {
      'zh-TW': '同一個路口，每個紅燈都不一樣。下面是最會改變答案的五件事，以旁邊停了十來輛機車為例。每一件從最低調到最高，看答案差幾倍。',
      en: 'No two red lights are alike, even at one junction. These five things change the answer most, for a dozen or so scooters: how many times the answer moves when each goes from its low end to its high end.',
    },
    times: { 'zh-TW': '差 {x} 倍', en: '{x} times' },
    spread: {
      wind: { 'zh-TW': '風大還是風小', en: 'A light wind or a breeze' },
      meander: { 'zh-TW': '風向飄來飄去', en: 'The wind wandering about' },
      fuelFlow: { 'zh-TW': '每輛機車燒多少油', en: 'How much fuel each scooter burns' },
      scooters: { 'zh-TW': '旁邊停了幾輛', en: 'How many scooters are beside you' },
      nearest: { 'zh-TW': '最近的排氣管有多近', en: 'How near the nearest tailpipe is' },
    },
    spreadCaption: {
      'zh-TW': '風的影響最大，所以同一個路口，今天和明天可以差好幾倍。',
      en: 'The wind matters most, so the same junction can differ several-fold from one day to the next.',
    },
    confidenceTitle: { 'zh-TW': '每一種廢氣，|可以信多少', en: 'How far to trust each pollutant' },
    pollutants: {
      co: { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
      benzene: { 'zh-TW': '苯', en: 'Benzene' },
      pm25: { 'zh-TW': 'PM2.5', en: 'PM2.5' },
    },
  },

  drawing: {
    eyebrow: { 'zh-TW': '8　圖', en: '8 · The pictures' },
    title: { 'zh-TW': '圖是怎麼畫的', en: 'How the pictures are drawn' },
    lead: {
      'zh-TW': '網站上的街景，都照同一個規則畫。圖上哪裡多、哪裡少，跟著推估走；你可以自己數。',
      en: 'Every street picture on the site follows one rule. Where a picture shows more and where it shows less follows the estimate, and you can count it yourself.',
    },
    rules: [
      {
        'zh-TW': '圖上只畫機車排的氣：一團淡淡的煙，從排氣管出來，貼著地面飄到等紅燈的人身上。街上原本就有的空氣不畫，寫在數字裡。',
        en: 'The pictures draw only what the scooters give off: a soft fume that leaves the tailpipes, stays low and drifts onto the people waiting. The air the street already holds is not drawn; it is in the numbers.',
      },
      {
        'zh-TW': '圖上沒有要對照圖例的記號。煙裡有什麼，用字寫在圖上：刺鼻的氣體聞得到，苯聞不出來，微粒小到看不到。',
        en: 'There are no symbols to look up in a key. What the fume holds is written on the picture in words: sharp-smelling gases you notice, benzene you cannot smell, particles too small to see.',
      },
      {
        'zh-TW': '人站的地方，煙畫得多濃，照推估：{few}平均蓋住 {a}%，{dozen}蓋住 {b}%，{full}最多蓋住 {c}%。煙最深的一點也只蓋住 {max}%，後面的東西一樣看得到。煙畫在人的後面，不會蓋住臉。',
        en: 'Where people stand, how thick the fume is drawn follows the estimate: on average it covers {a}% for {few}, {b}% for {dozen} and at most {c}% for {full}. Even its darkest point covers only {max}%, so what is behind it still shows. The fume is drawn behind the people, so it never covers a face.',
      },
      {
        'zh-TW': '排氣管後面那一團深色，是畫給眼睛看的。每根排氣管都一樣，不跟著推估變。',
        en: 'The dark patch behind each tailpipe is drawn for the eye: it is the same for every tailpipe and does not follow the estimate.',
      },
      {
        'zh-TW': '推估是一個範圍，圖上畫的是中間的值。範圍有多大，請看上面「範圍」那一段。',
        en: 'The estimate is a range, and the pictures draw its middle value. For how wide the range is, see the section on the range above.',
      },
    ],
    how: {
      'zh-TW': '煙要畫多濃，是這樣算的：機車加上去的一氧化碳，除以街上原本就有的，再乘以 {steps}，四捨五入，最少 1。每多 1，人站的地方平均多蓋住 {tint}%。',
      en: 'How thick to draw the fume is worked out like this: the carbon monoxide the scooters put in, divided by what the street already holds, times {steps}, rounded, and at least 1. Each 1 adds {tint}% of cover, on average, where people stand.',
    },
    tryIt: { 'zh-TW': '換換看，圖會跟著變：', en: 'Try it, and the picture changes:' },
  },

  limits: {
    eyebrow: { 'zh-TW': '9　限制', en: '9 · The limits' },
    title: { 'zh-TW': '這個推估不能說什麼', en: 'What this estimate cannot tell you' },
    lead: {
      'zh-TW': '一個推估能說的有限。下面這些，它都回答不了：',
      en: 'An estimate can only say so much. It cannot answer any of these:',
    },
    more: {
      'zh-TW': '不算綠燈起步的那一陣。',
      en: 'Not the burst when the scooters pull away at green.',
    },
    /** Statement 5 under heightTitle (replaces K4, which the simulation has answered). */
    height: {
      'zh-TW': '推估：風從機車吹來時，嬰兒車高度和大人鼻子差不多到兩倍；排氣管正後方、幾乎沒風時更多。不是每種風都這樣。',
      en: 'Estimate: with the wind from the scooters, pushchair height gets between about the same as an adult’s nose and about twice as much; more right behind a tailpipe in still air. Not in every wind.',
    },
    heightLink: { 'zh-TW': '看「電腦算的一個紅燈」', en: 'See ‘One red light, simulated’' },
    heightTitle: { 'zh-TW': '小孩和嬰兒車的|高度呢？', en: 'What about a child’s or a pushchair’s height?' },
    health: {
      'zh-TW': '想知道廢氣和身體的關係，請看證據頁「吸廢氣的人怎麼了」那一環。',
      en: 'For what traffic exhaust has to do with health, see “What happens to people who breathe it” on the evidence page.',
    },
    healthLink: { 'zh-TW': '證據：吸車子廢氣的人怎麼了', en: 'Evidence: what happens to people who breathe traffic exhaust' },
  },

  answers: {
    eyebrow: { 'zh-TW': '10　答案', en: '10 · The answers' },
    title: { 'zh-TW': '{n} 個問題，現在的答案', en: '{n} questions, and the answers we have now' },
    lead: {
      'zh-TW': '常被問的問題。每一題寫出是量到的、算的，還是研究的結論，也寫出要小心的地方。',
      en: 'Questions people often ask. Each answer says whether it was measured, worked out or found by a study, and what to be careful about.',
    },
  },

  measure: {
    eyebrow: { 'zh-TW': '11　實測', en: '11 · Measuring it' },
    title: { 'zh-TW': '把推估換成實測', en: 'Turn the estimate into a measurement' },
    lead: {
      'zh-TW': '推估再仔細，也比不上真的去量。如果環保局或大學願意在路口量，下面是我們建議的量法。還有一封可以直接寄的信。',
      en: 'However carefully an estimate is worked out, it is no substitute for measuring. If an environmental bureau or a university will measure at a junction, here is how we suggest doing it, and a letter you can send today.',
    },
    promise: { 'zh-TW': '量出來的結果，不管高低，我們都會登出來。', en: 'Whatever the result, high or low, we will publish it.' },
    replace: {
      'zh-TW': '真正的量測出來以後，我們會把它放在推估旁邊；舊的推估也會留在這一頁。',
      en: 'When a real measurement comes in, we will put it beside the estimate, and the old estimate will stay on this page.',
    },
    planTitle: { 'zh-TW': '建議怎麼量', en: 'How we suggest measuring it' },
    letterTitle: { 'zh-TW': '寫信|請環保局來量', en: 'A letter asking your environmental bureau to measure' },
    letterLead: {
      'zh-TW': '填上空格，複製下來，貼到縣市環保局的線上信箱，或用你的電子郵件寄。機關收到署名、有地址和聯絡方式的信，才會回覆。',
      en: 'Fill in the blanks, copy the letter, and paste it into your city or county environmental bureau’s online form, or send it from your own email. An agency answers a letter that is signed and gives an address and a way to reach you.',
    },
    fields: { 'zh-TW': '寄給誰、你是誰', en: 'Who it is to, and who you are' },
    agency: { 'zh-TW': '寄給哪個環保局', en: 'Which environmental bureau' },
    agencyHint: { 'zh-TW': '例如：新北市政府環境保護局', en: 'For example: New Taipei City Environmental Protection Department' },
    place: { 'zh-TW': '想請他們量的路口', en: 'The junction you want measured' },
    placeHint: { 'zh-TW': '例如：中山路和民生路口', en: 'For example: Zhongshan Road at Minsheng Road' },
    sender: { 'zh-TW': '你的名字', en: 'Your name' },
    address: { 'zh-TW': '你的地址（寫到區就可以）', en: 'Your address (the district is enough)' },
    contact: { 'zh-TW': '聯絡方式（電話或電子郵件）', en: 'How to reach you (phone or email)' },
    letterName: { 'zh-TW': '請環保局量測路口空氣的信', en: 'The letter asking for a measurement' },
    subject: {
      'zh-TW': '請在{place}量測紅燈時行人吸到的空氣',
      en: 'Please measure the air pedestrians breathe at red lights at {place}',
    },
    body: {
      'zh-TW':
        '{agency}承辦人員好：\n\n我住在{address}。{place}這個路口，紅燈時常常停滿機車，引擎沒熄火，等過馬路的人就站在旁邊。\n\n交通部運輸研究所在 {sites} 個路口的行人等候區，量過一氧化碳和 PM2.5。「行人呼吸」網站用這些資料，加上全國的機車定檢讀數，做了推估。算法和出處，都公開在網站上。\n\n照網站的算法，旁邊停了十來輛機車時，大人鼻子高度的一氧化碳會增加。紅燈 {red} 秒的平均，會增加{coAdd}。這個數字要靠實際量測來確認。\n\n想請貴局在這個路口量測：\n1. 在行人等候區，量大人和嬰兒車兩個高度。\n2. 量一氧化碳、苯和超細微粒。紅燈和綠燈分開記錄，也記下每個紅燈停了幾輛機車。\n3. 在離路口遠一點的地方，放一個對照點。\n4. 公開原始資料。\n\n不管結果是高是低，都請讓大家知道。謝謝。\n\n{sender} 敬上\n地址：{address}\n聯絡方式：{contact}',
      en:
        'Dear {agency},\n\nI live in {address}. At the junction of {place}, the stop box often fills with scooters at a red light, engines running, while people waiting to cross stand right beside them.\n\nTaiwan’s Institute of Transportation has measured carbon monoxide and PM2.5 in the pedestrian waiting areas of {sites} junctions. The ScooterAir website has used those readings and the national scooter-inspection readings to work out what a pedestrian breathes, and publishes its method and sources.\n\nBy the website’s working, with a dozen or so scooters beside you, carbon monoxide at an adult’s nose rises by {coAdd} over a {red}-second red. That figure needs a real measurement to confirm it.\n\nI would like to ask your bureau to measure at this junction:\n1. In the pedestrian waiting area, at an adult’s height and a pushchair’s height.\n2. Carbon monoxide, benzene and ultrafine particles, recording red and green separately, with the number of scooters waiting at each red.\n3. With a comparison point a little way from the junction.\n4. And to publish the raw data.\n\nWhatever the result, high or low, please let the public know. Thank you.\n\nYours sincerely,\n{sender}\nAddress: {address}\nContact: {contact}',
    },
    composer: {
      subject: { 'zh-TW': '主旨：', en: 'Subject: ' },
      copy: { 'zh-TW': '複製這封信', en: 'Copy the letter' },
      copied: { 'zh-TW': '已複製。', en: 'Copied.' },
      failed: { 'zh-TW': '這個瀏覽器不讓我們複製，請自己選取上面的文字。', en: 'This browser would not let us copy. Please select the text above yourself.' },
      mail: { 'zh-TW': '用我的電子郵件寄', en: 'Open in my email' },
      noStore: {
        'zh-TW': '你填的字只留在你的瀏覽器裡。我們不會收到，也不會存下來。',
        en: 'What you type stays in your browser. We do not receive it and nothing is stored.',
      },
    },
    noScript: {
      'zh-TW': '這個瀏覽器沒有開 JavaScript，所以不能自動填空。信還是可以用：把 ○○ 換成你的資料就好。',
      en: 'JavaScript is off in this browser, so the blanks cannot fill themselves. The letter still works: replace each ○○ with your own details.',
    },
    toWhomTitle: { 'zh-TW': '寄給誰', en: 'Who to send it to' },
    toWhom: {
      'zh-TW': '各縣市政府的環境保護局管空氣品質的量測，大多有線上信箱。也可以寄給附近大學的環境工程系，或寄給運研所。',
      en: 'Each city and county environmental protection bureau is responsible for air-quality monitoring, and most have an online form. You can also send it to an environmental engineering department at a nearby university, or to the Institute of Transportation.',
    },
    brief: { 'zh-TW': '印一頁說明，帶去給里長或議員', en: 'Print a one-page brief for your borough chief or councillor' },
    act: { 'zh-TW': '還能做什麼', en: 'What else you can do' },
  },

  version: {
    title: { 'zh-TW': '版本和修改紀錄', en: 'Version and changes' },
    current: { 'zh-TW': '目前的版本：{stamp}', en: 'Current version: {stamp}' },
    log: [
      {
        version: { 'zh-TW': 'v1', en: 'v1' },
        text: {
          'zh-TW': '第一版。三種情況、三種廢氣，算法和出處全部公開，並和運研所的量測對照。',
          en: 'First version. Three cases and three pollutants, with the working and sources in full, checked against the Institute of Transportation’s readings.',
        },
      },
      {
        version: { 'zh-TW': 'v1 補充', en: 'v1, addition' },
        date: '2026-11-27',
        text: {
          'zh-TW': '加上「電腦算的一個紅燈」（推估）。90 秒的數字不變；範圍最高的數字，是一般紅燈裡偏高的那種，不是最糟的紅燈。',
          en: 'Added ‘One red light, simulated’ (estimate). The 90-second figures are unchanged; the top of each range is a high but ordinary red, not the worst red.',
        },
      },
    ],
  },
});
