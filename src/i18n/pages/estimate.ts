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
      'zh-TW': '紅燈時，一排機車讓路邊多了多少廢氣？本站的推估、一步一步的算法、每個數字的出處，以及它和運研所量到的數字比起來怎麼樣。',
      en: 'How much exhaust does a row of scooters, engines running, add at the kerb? Our estimate, the working step by step, the source of every input, and how it compares with the Institute of Transportation’s readings.',
    },
  },

  hero: {
    eyebrow: { 'zh-TW': '怎麼算的', en: 'How we worked it out' },
    title: { 'zh-TW': '機車旁邊|多了多少廢氣，|我們這樣算', en: 'What the scooters add at the kerb, |and how we worked it out' },
    lead: {
      'zh-TW': '一排機車停在紅燈前，引擎沒熄火。站在旁邊的人，多吸到多少一氧化碳？這一頁從答案開始，再一步一步說明怎麼算。',
      en: 'A row of scooters waits at a red light with engines running. How much more carbon monoxide does the person beside them breathe? This page starts with the answer, then shows the working step by step.',
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
    recipe: { 'zh-TW': '怎麼算', en: 'How it is worked out' },
    count: { 'zh-TW': '旁邊停幾輛', en: 'How many scooters' },
    check: { 'zh-TW': '跟量到的對得起來嗎', en: 'Does it match the readings?' },
    range: { 'zh-TW': '為什麼是一個範圍', en: 'Why a range' },
    drawing: { 'zh-TW': '圖是怎麼畫的', en: 'How the pictures are drawn' },
    limits: { 'zh-TW': '這個推估不能說什麼', en: 'What it cannot tell you' },
    answers: { 'zh-TW': '十三個問題的答案', en: 'Answers to thirteen questions' },
    measure: { 'zh-TW': '把推估換成實測', en: 'Turn it into a measurement' },
  },

  numbers: {
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

  recipe: {
    eyebrow: { 'zh-TW': '2　算法', en: '2 · The working' },
    title: { 'zh-TW': '怎麼算', en: 'How it is worked out' },
    lead: {
      'zh-TW': '沒有人能在每個人的鼻子前面放一台儀器，所以我們用電腦模擬紅燈：機車停在哪裡、每輛排多少、風把廢氣吹到哪裡。每次換一種風、一批機車和一個站的位置，每種情況算 {runs} 次。',
      en: 'Nobody can put an instrument in front of every nose, so we simulate the red light on a computer: where the scooters stop, how much each gives off, and where the wind carries it. Each run draws a new wind, a new set of scooters and a new place to stand: {runs} runs for each case.',
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
          'zh-TW': '越南的實驗室量的。台灣沒有這種量測，這是最該在台灣量的一個數字：它一變，每一種廢氣都跟著變。',
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
    resultTitle: { 'zh-TW': '算出來：|一輛機車停著、引擎沒熄火，|每小時排的一氧化碳', en: 'Result: the carbon monoxide one stopped scooter gives off in an hour, engine running' },
    perRedTitle: { 'zh-TW': '等一個紅燈呢？', en: 'And through one red light?' },
    perRedNote: {
      'zh-TW': '一小時有 {reds} 個 {red} 秒，所以除以 {reds}。換成氣體來看，大約可以裝滿一個 {ml} 毫升的鋁罐。',
      en: 'An hour holds {reds} reds of {red} seconds, so divide by {reds}. As a gas, that is about enough to fill one {ml} mL drinks can.',
    },
    canTitle: { 'zh-TW': '換成鋁罐', en: 'In drinks cans' },
  },

  count: {
    eyebrow: { 'zh-TW': '3　幾輛', en: '3 · How many' },
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
    eyebrow: { 'zh-TW': '4　對照', en: '4 · The cross-check' },
    title: { 'zh-TW': '跟量到的對得起來嗎', en: 'Does it match what was measured?' },
    lead: {
      'zh-TW': '運研所（交通部運輸研究所）在{place}的 {sites} 個路口，把儀器放在行人等候區，每個路口連續量 {hours} 小時。這是台灣在路口行人身邊量到的資料。',
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
      'zh-TW': '這和我們算的對得起來：大多數紅燈，機車加上去的 PM2.5 都比街上原本就有的少很多，儀器本來就很難看出來。',
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
    eyebrow: { 'zh-TW': '5　範圍', en: '5 · The range' },
    title: { 'zh-TW': '為什麼是一個範圍', en: 'Why the answer is a range' },
    lead: {
      'zh-TW': '同一個路口，每個紅燈都不一樣。下面是最會改變答案的五件事，以旁邊停了十來輛機車為例：每一件從最低調到最高，答案差幾倍。',
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
    eyebrow: { 'zh-TW': '6　圖', en: '6 · The pictures' },
    title: { 'zh-TW': '圖是怎麼畫的', en: 'How the pictures are drawn' },
    lead: {
      'zh-TW': '網站上的街景，都照同一個規則畫。圖上哪裡多、哪裡少，跟著推估走；你可以自己數。',
      en: 'Every street picture on the site follows one rule. Where a picture shows more and where it shows less follows the estimate, and you can count it yourself.',
    },
    rules: [
      {
        'zh-TW': '每一張街景都畫街上原本就有的空氣：每 {patch} × {patch} 像素的一小格，畫 {rings} 個圈和 {dots} 個點。',
        en: 'Every street scene shows the air the street already holds: {rings} rings and {dots} dots in every {patch} × {patch} pixel patch.',
      },
      {
        'zh-TW': '人站的地方，照推估多畫幾個圈：{few}多 {a} 個，{dozen}多 {b} 個，{full}多 {c} 個。',
        en: 'Where people stand, extra rings are drawn by the estimate: {a} more for {few}, {b} for {dozen}, {c} for {full}.',
      },
      {
        'zh-TW': '排氣管後面那一團深色，是畫給眼睛看的：每根排氣管都一樣，不跟著推估變。',
        en: 'The dark patch behind each tailpipe is drawn for the eye: it is the same for every tailpipe and does not follow the estimate.',
      },
      {
        'zh-TW': '推估是一個範圍，所以範圍的兩頭都畫給你看：十來輛的時候，一小格從 {lo} 個圈到 {hi} 個圈。',
        en: 'The estimate is a range, so both ends are drawn for you: for a dozen or so scooters, a patch holds from {lo} to {hi} rings.',
      },
    ],
    how: {
      'zh-TW': '多畫幾個圈，是這樣算的：機車加上去的一氧化碳，除以街上原本就有的，再乘以 {rings}，四捨五入，最少 1 個。',
      en: 'The extra rings are worked out like this: the carbon monoxide the scooters put in, divided by what the street already holds, times {rings}, rounded, and at least 1.',
    },
    tryIt: { 'zh-TW': '換換看，圖會跟著變：', en: 'Try it, and the picture changes:' },
    keyTitle: { 'zh-TW': '圖上的記號', en: 'The marks' },
    rangeTitle: { 'zh-TW': '範圍的兩頭', en: 'The two ends of the range' },
  },

  limits: {
    eyebrow: { 'zh-TW': '7　限制', en: '7 · The limits' },
    title: { 'zh-TW': '這個推估不能說什麼', en: 'What this estimate cannot tell you' },
    lead: {
      'zh-TW': '一個推估能說的有限。下面這些，它都回答不了：',
      en: 'An estimate can only say so much. It cannot answer any of these:',
    },
    more: {
      'zh-TW': '不算綠燈起步的那一陣，也不算紅燈裡每一秒怎麼變。',
      en: 'Not the burst when the scooters pull away at green, and not how the air changes second by second.',
    },
    heightTitle: { 'zh-TW': '小孩和嬰兒車的|高度呢？', en: 'What about a child’s or a pushchair’s height?' },
    health: {
      'zh-TW': '想知道廢氣和身體的關係，請看證據頁的第 5 環。',
      en: 'For what traffic exhaust has to do with health, see link 5 on the evidence page.',
    },
    healthLink: { 'zh-TW': '證據：吸車子廢氣的人怎麼了', en: 'Evidence: what happens to people who breathe traffic exhaust' },
  },

  answers: {
    eyebrow: { 'zh-TW': '8　答案', en: '8 · The answers' },
    title: { 'zh-TW': '{n} 個問題，現在的答案', en: '{n} questions, and the answers we have now' },
    lead: {
      'zh-TW': '這些問題，本站以前只寫「還不知道」。現在每一個都有答案：有的是量到的，有的是我們算的，有的是研究的結論。每一個都標明是哪一種，也寫出要小心的地方。',
      en: 'This site used to leave these questions open. Each now has an answer: some measured, some worked out by us, some the finding of a study. Each says which, and what to be careful about.',
    },
  },

  measure: {
    eyebrow: { 'zh-TW': '9　實測', en: '9 · Measuring it' },
    title: { 'zh-TW': '把推估換成實測', en: 'Turn the estimate into a measurement' },
    lead: {
      'zh-TW': '推估算得再仔細，也比不上真的去量。如果環保局或大學願意在路口量，下面是我們建議的量法，和一封可以直接寄的信。',
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
        '{agency}承辦人員好：\n\n我住在{address}。{place}這個路口，紅燈時常常停滿機車，引擎沒熄火，等過馬路的人就站在旁邊。\n\n交通部運輸研究所在 {sites} 個路口的行人等候區，量過一氧化碳和 PM2.5。「行人呼吸」網站用這些資料和全國的機車定檢讀數做了推估，算法和出處都公開在網站上。\n\n照網站的算法，旁邊停了十來輛機車時，大人鼻子高度的一氧化碳，紅燈 {red} 秒的平均會增加{coAdd}。這個數字要靠實際量測來確認。\n\n想請貴局在這個路口量測：\n1. 在行人等候區，量大人和嬰兒車兩個高度。\n2. 量一氧化碳、苯和超細微粒，紅燈和綠燈分開記錄，也記下每個紅燈停了幾輛機車。\n3. 在離路口遠一點的地方，放一個對照點。\n4. 公開原始資料。\n\n不管結果是高是低，都請讓大家知道。謝謝。\n\n{sender} 敬上\n地址：{address}\n聯絡方式：{contact}',
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
    ],
  },
});
