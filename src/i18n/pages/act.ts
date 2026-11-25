// /act/ — 行動 / Take action (blueprint 4.6 and Part 6), the school-gate poster (V46,
// /print/poster/), the note to a building committee and the letter for the asks of government.
// Every action is labelled by how well supported it is; numbers are filled from the registry.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '行動', en: 'Take action' },
    description: {
      'zh-TW': '走路的人、騎車的人、家長、一個里或一間學校、議員和官員，各自做得到的事。每一件都標明根據：量過的效果、我們的推論，或一個請求。',
      en: 'What a walker, a rider, a parent, a neighbourhood or school, and a councillor or official can each do. Every action says how well supported it is: a measured effect, our inference, or a request.',
    },
  },
  hero: {
    eyebrow: { 'zh-TW': '行動', en: 'Take action' },
    title: { 'zh-TW': '從你站的地方|做起', en: 'Start from |where you stand' },
    deck: {
      'zh-TW': '走路的人、騎車的人、家長、一個里、一位議員，做得到的事不一樣。每一件事旁邊都標了它有多少根據。推論和請求，我們不會寫得像量過的一樣。',
      en: 'A walker, a rider, a parent, a neighbourhood and a councillor can each do different things. Every action shows how much stands behind it. We will not dress up an inference or a request as something measured.',
    },
    jump: { 'zh-TW': '跳到', en: 'Jump to' },
  },
  labels: {
    title: { 'zh-TW': '每件事旁邊的標記', en: 'The label beside each action' },
    evidence: {
      'zh-TW': '量測或官方資料：這件事背後有出處，點數字可以看來源。',
      en: 'Measured or official data: there is a source behind it; the number takes you there.',
    },
    inference: {
      'zh-TW': '我們的推論：從有出處的事實推得，效果沒有人直接量過。',
      en: 'Our inference: reasoned from sourced facts; nobody has measured the effect directly.',
    },
    request: { 'zh-TW': '請求', en: 'A request' },
    requestHelp: {
      'zh-TW': '請求：我們請你或政府這樣做，不宣稱量過任何效果。',
      en: 'A request: something we ask you or the government to do, with no measured effect claimed.',
    },
    why: { 'zh-TW': '為什麼', en: 'Why' },
    supportedBy: { 'zh-TW': '根據：', en: 'Supported by: ' },
  },
  roles: {
    walk: {
      title: { 'zh-TW': '我走路', en: 'I walk' },
      lead: {
        'zh-TW': '走路的人能做的，多半是請求和小小的預防。最有用的一件，是讓更多人知道那一格是空的。',
        en: 'Most of what a walker can do is ask, and take small precautions. The most useful thing is to let more people know the box is empty.',
      },
      a1: { 'zh-TW': '把七件事，或一張問題圖卡，傳到一個 LINE 群組。', en: 'Send the seven lines, or one question card, to one group chat.' },
      a1Link: { 'zh-TW': '七件事在這裡', en: 'The seven lines' },
      a2: { 'zh-TW': '請你那裡的環保局，來量你家附近的路口。', en: 'Ask your city to measure the crossing near you.' },
      a2Link: { 'zh-TW': '請來量我家路口', en: 'Please measure my crossing' },
      a3: { 'zh-TW': '等紅燈的時候，離待轉區和停止線退幾步。', en: 'While you wait, stand a few steps back from the turn box and the stop line.' },
      a3Why: {
        'zh-TW': '我們的推論：排氣管離地不到一公尺，就在車陣的後面。退幾步會少吸多少，台灣沒有人量過；這是預防，不是量過的效果。',
        en: 'Our inference: tailpipes sit within a metre of the ground, at the back of the pack. How much less a few steps back means has not been measured in Taiwan; this is a precaution, not a measured benefit.',
      },
      a4: { 'zh-TW': '有得選的時候，走車少的那條路。', en: 'Where there is a choice, take the quieter street.' },
      a4Why: {
        'zh-TW': '台北一項研究裡，騎腳踏車和騎租借電動機車的通勤者，走巷弄小路的那條路線，尖峰時段的苯少了 {benzene}%，PM2.5 少了 {pm25}%。量的是騎車的通勤者，不是行人。',
        en: 'In a Taipei study of commuters on bicycles and rented electric scooters, the route along side streets and alleys cut rush-hour benzene by {benzene}% and PM2.5 by {pm25}%. Those measured were commuters riding, not pedestrians.',
      },
      a5: { 'zh-TW': '繼續走路。走路本身是好事，我們沒有要你少走。', en: 'Keep walking. Walking is good for you, and we are not asking you to do less of it.' },
      a5Why: {
        'zh-TW': '一項台灣成人的世代研究裡，規律運動在每一種 PM2.5 程度下，都和比較低的死亡風險有關（所有來源的 PM2.5）。',
        en: 'In a cohort of Taiwanese adults, regular exercise was associated with a lower risk of death at every level of PM2.5 (from all sources).',
      },
      lineTitle: { 'zh-TW': '可以直接傳的一段話', en: 'A message you can forward as it is' },
      line: {
        'zh-TW': '紅燈旁邊那股機車味，吸進多少其實沒人量過。這個網站把查得到的證據一環一環列出來，也算了換電動到底要多少錢：{url}',
        en: 'Nobody has actually measured how much of that scooter smell we breathe at a red light. This site lays out the evidence link by link, and works out what going electric really costs: {url}',
      },
      lineName: { 'zh-TW': '傳給朋友的一段話', en: 'A message for friends' },
      lineShare: { 'zh-TW': '用 LINE 傳', en: 'Send with LINE' },
      copy: { 'zh-TW': '複製這段話', en: 'Copy the message' },
      smokyTitle: { 'zh-TW': '看到排煙的機車', en: 'If you see a scooter trailing smoke' },
      smoky: {
        'zh-TW': '怎麼檢舉、要附什麼，看你所在縣市環保局的說明。',
        en: 'How to report it, and what to include, is set out by your city’s environmental protection bureau.',
      },
    },
    buy: {
      title: { 'zh-TW': '我要買車', en: 'I’m buying a scooter' },
      lead: {
        'zh-TW': '錢的事都在「換電動」那一頁算。這裡只放三件去車行之前要做的事。',
        en: 'The money is all worked out on the Going electric page. Here are the three things to do before you go to the dealer.',
      },
      a1: { 'zh-TW': '去車行之前，先用計算機算一次。', en: 'Run the calculator before you go to the dealer.' },
      a1Link: { 'zh-TW': '到「換電動」算', en: 'Work it out on Going electric' },
      a2: {
        'zh-TW': '手上有出廠滿 10 年的機車，先查它在你的縣市算不算報廢補助；每個縣市的規定不一樣。',
        en: 'If you own a scooter built 10 or more years ago, check whether it counts for a scrappage subsidy where you live: every city’s rule is different.',
      },
      a3: {
        'zh-TW': '方案要配你一個月騎的距離：騎得少的人，換電月租可能比加油貴。停車的地方能不能充電，也要先問清楚。',
        en: 'Match the plan to how far you ride each month: for people who ride little, a battery subscription can cost more than petrol. Find out whether you can charge where you park.',
      },
    },
    keep: {
      title: { 'zh-TW': '我現在不換車', en: 'I’m not switching now' },
      headline: { 'zh-TW': '我們不會|叫你硬換', en: 'We will not tell you |to switch anyway' },
      lead: {
        'zh-TW': '算過之後打不平，或現在就是換不起，都很正常。不換車，也有幾件事做了就算數。',
        en: 'If the sums do not add up, or you simply cannot switch right now, that is normal. Without switching, there are still things you can do that count.',
      },
      a1: { 'zh-TW': '準時去定檢，沒過就修。', en: 'Turn up for the exhaust inspection, and fix what fails.' },
      a1Why: {
        'zh-TW': '台灣的實驗室測試裡，比較舊、里程比較高的機車，以每公升油計，排出的一氧化碳和碳氫化合物都多得多。',
        en: 'In Taiwanese laboratory tests, older and higher-mileage scooters emitted far more carbon monoxide and hydrocarbons per litre of fuel.',
      },
      a2: { 'zh-TW': '家裡如果還有二行程機車，讓它報廢。', en: 'If your household still has a two-stroke, scrap it.' },
      a3: {
        'zh-TW': '等 {nextYear} 年的補助方案出來，再算一次；也可以寄一封信，請政府早點公布。',
        en: 'When a {nextYear} subsidy programme is published, run the sums again; and send a letter asking the government to publish one soon.',
      },
      a3Link: { 'zh-TW': '寫給議員的信', en: 'The letter to a councillor' },
      a4: {
        'zh-TW': '我們不要求你在紅燈熄火：重新發動的排放，測試結果有好有壞。',
        en: 'We do not ask you to switch off at red lights: the tests on restart emissions point both ways.',
      },
      waffle: {
        title: { 'zh-TW': '每 {total} 台接到定檢通知的機車，|有 {absent} 台沒有來', en: 'Of every {total} scooters called for inspection, |{absent} did not come' },
        subtitle: { 'zh-TW': '{year} 年，四行程機車，每 {total} 台（本站計算）', en: 'Four-stroke scooters in {year}, per {total} (our arithmetic)' },
        chart: { 'zh-TW': '定檢通知的結果', en: 'What happened to inspection notices' },
        desc: {
          'zh-TW': '每 {total} 台接到通知的四行程機車：約 {passed} 台到檢合格、{failed} 台不合格、{absent} 台沒有來。',
          en: 'Of every {total} four-stroke scooters notified: about {passed} came and passed, {failed} failed, and {absent} did not come.',
        },
        passed: { 'zh-TW': '到檢、合格', en: 'Came and passed' },
        failed: { 'zh-TW': '到檢、不合格', en: 'Came and failed' },
        absent: { 'zh-TW': '沒有來', en: 'Did not come' },
        category: { 'zh-TW': '結果', en: 'Outcome' },
        value: { 'zh-TW': '台數（每 {total} 台）', en: 'Scooters (per {total})' },
      },
      watchTitle: { 'zh-TW': '明年要注意什麼', en: 'What to watch for next year' },
      watchStatus: { 'zh-TW': '補助現在的狀態：', en: 'Where the subsidies stand:' },
      watch: {
        'zh-TW': '新方案公布的時候，看三件事：哪一天以後買車才算數；手上的機車要出廠滿幾年才能報廢；你的縣市有沒有自己加碼。',
        en: 'When a new programme is published, check three things: from which date a purchase counts; how old your scooter must be to scrap; and whether your own city adds anything.',
      },
    },
    parents: {
      title: { 'zh-TW': '我有小孩', en: 'I have children' },
      lead: {
        'zh-TW': '孩子的事，台灣大多沒有人量過。下面分清楚哪些是預防、哪些是請求。',
        en: 'For children, most of it has not been measured in Taiwan. Below, precautions and requests are kept apart.',
      },
      known: { 'zh-TW': '已經知道的', en: 'What is known' },
      stroller: {
        'zh-TW': '國外比較嬰兒車和大人高度的研究：多數發現嬰兒車高度高 {low}% 到 {high}%；一項美國路邊研究，PM2.5 高 {us}%；一項英國實驗，細微粒最多高 {uk}%；一項研究沒有一致的差異；另一項研究的早上時段，嬰兒的高度反而低 {lower}%。',
        en: 'Studies abroad comparing stroller and adult height: most found {low} to {high}% higher at stroller height; one US roadside study found PM2.5 {us}% higher; one UK experiment found fine particles up to {uk}% higher; one found no consistent difference; and one found babies {lower}% lower in the morning.',
      },
      a1: { 'zh-TW': '推嬰兒車的時候，離待轉區和停止線遠一點等。', en: 'With a stroller, wait a little further from the turn box and the stop line.' },
      a1Why: {
        'zh-TW': '我們的推論：嬰兒車的高度就在排氣管那一公尺裡。這是預防，不是量過的效果。',
        en: 'Our inference: a stroller sits inside the tailpipe’s first metre. This is a precaution, not a measured benefit.',
      },
      a2: { 'zh-TW': '上學的路，挑大路口少一點的那條。', en: 'Pick the school route with fewer big junctions.' },
      a3: { 'zh-TW': '把校門口海報和量測請求，帶去家長會。', en: 'Take the poster and the measurement request to the parents’ association.' },
      a3Link: { 'zh-TW': '校門口海報', en: 'The school-gate poster' },
      a4: {
        'zh-TW': '如果家裡下一台是電動的，查你的縣市有沒有給有小孩家庭的加碼。',
        en: 'If the family’s next scooter is electric, check whether your city adds anything for families with children.',
      },
      a4Link: { 'zh-TW': '到「換電動」查', en: 'Check on Going electric' },
    },
    neighbourhood: {
      title: { 'zh-TW': '我們這個里、|這間學校、這棟大樓', en: 'Our neighbourhood, |our school, our building' },
      lead: {
        'zh-TW': '一個人寄，是一封信；一個里、一個家長會一起寄，是一個需要回覆的請求。',
        en: 'One person sending it is a letter. A neighbourhood or a parents’ association sending it together is a request that needs an answer.',
      },
      a1: { 'zh-TW': '一起寫信，請環保局量一個指名的路口，副本給在地的議員。', en: 'Write together asking the city to measure one named crossing, copied to your local councillor.' },
      a1Link: { 'zh-TW': '信在這裡', en: 'The letter is here' },
      a2: {
        'zh-TW': '請縣市依行人交通安全設施條例，先改學校旁的路口：待轉區退得比規定的下限更遠，當作試辦，改前改後都量。空氣有沒有變好，還沒有人量過，請求裡也照實寫。',
        en: 'Ask the city to treat the school crossing first under the pedestrian facilities act, with the turn box set further back than the minimum, as a trial measured before and after. No air-quality benefit has been measured yet, and the request says so.',
      },
      a3: {
        'zh-TW': '辦一天二行程機車的報廢日，把定檢的日期貼在公布欄。',
        en: 'Organise a scrappage day for the remaining two-strokes, and post the inspection dates on the noticeboard.',
      },
      a4: { 'zh-TW': '請管委會同意，讓住戶在停車場幫機車充電。', en: 'Ask the building committee to allow scooter charging in the car park.' },
      a4Link: { 'zh-TW': '給管委會的信', en: 'The note to the committee' },
      plan: {
        title: { 'zh-TW': '規則只要求|待轉區離斑馬線 {gap} 公分', en: 'The rule asks for |{gap} cm between turn box and crosswalk' },
        subtitle: { 'zh-TW': '一個路口進來的方向，從上面看（示意圖）', en: 'One approach to a crossing, seen from above (illustration)' },
      },
      posterTitle: { 'zh-TW': '校門口海報', en: 'The school-gate poster' },
      posterBody: {
        'zh-TW': 'A4 一張，中文和英文各一版。上面是那張空白的圖，和一個連到「請來量我家路口」的 QR 碼。',
        en: 'One A4 sheet, in Chinese and in English: the empty chart, and a QR code to “Please measure my crossing”.',
      },
      posterLink: { 'zh-TW': '打開海報', en: 'Open the poster' },
      noteTitle: { 'zh-TW': '給管委會的信', en: 'A note to the building committee' },
      noteHonest: {
        'zh-TW': '先講清楚：這封信幫得到有車位的住戶。沒有車位的人，這封信幫不上。',
        en: 'To be clear: this note helps residents who have a parking space. It does nothing for people who do not.',
      },
      noteFields: { 'zh-TW': '填上大樓和你', en: 'Fill in the building and yourself' },
      noteBuilding: { 'zh-TW': '大樓或社區名稱', en: 'Building or estate' },
      noteName: { 'zh-TW': '你的名字或戶號', en: 'Your name or flat number' },
      noteSubject: { 'zh-TW': '請管委會討論開放機車在停車場充電', en: 'Request to discuss scooter charging in the car park' },
      note: {
        'zh-TW':
          '致 {building} 管理委員會：\n\n我是本大樓的住戶。想請管委會在下次會議討論，讓住戶在停車場的機車位幫電動機車充電：\n\n一、評估停車場的用電容量，以及裝設插座或充電設備的費用。\n二、訂出使用和分攤電費的規則，例如分表計費。\n三、請電機或消防專業人員確認安全。\n\n能在家充電，住戶換電動機車的時候，就多一個選擇。謝謝大家撥空討論。\n\n住戶 {name} 敬上',
        en:
          'To the management committee of {building}:\n\nI am a resident of this building. I would like to ask the committee to discuss, at its next meeting, allowing residents to charge electric scooters at their scooter spaces in the car park:\n\n1. Assess the car park’s electrical capacity and the cost of installing sockets or chargers.\n2. Agree rules for use and for sharing the electricity cost, for example with sub-metering.\n3. Ask a qualified electrician or fire-safety professional to confirm it is safe.\n\nBeing able to charge at home gives residents one more option when they change scooters. Thank you for taking the time to discuss it.\n\nWith thanks,\n{name}',
      },
      noteCopy: { 'zh-TW': '複製這封信', en: 'Copy the note' },
    },
    policy: {
      title: { 'zh-TW': '我在政府或議會', en: 'I work in government or a council' },
      lead: {
        'zh-TW': '三件現在就做得到的事。再往下，是我們對政府的六個要求，和一封可以寄給議員的信。',
        en: 'Three things that can be done now. Below them are the six asks of government, and a letter to send to a councillor.',
      },
      a1: { 'zh-TW': '公布 {nextYear} 年的補助方案，而且一次講清楚好幾年。', en: 'Publish the {nextYear} subsidy programme, for several years at a time.' },
      a2: { 'zh-TW': '委託量測，把那張空白的圖填起來。', en: 'Commission the measurement that fills the empty chart.' },
      a2Link: { 'zh-TW': '要量什麼', en: 'What to measure' },
      a3: {
        'zh-TW': '用已經有的權限：縣市可以劃設空氣品質維護區；行人交通安全設施條例要求學校和醫院周邊的行人友善區，但沒有訂空氣目標。',
        en: 'Use powers that already exist: cities may designate air-quality maintenance zones; the pedestrian facilities act requires pedestrian-friendly zones near schools and hospitals but sets no air target.',
      },
      status: { 'zh-TW': '補助現在的狀態：', en: 'Where the subsidies stand:' },
    },
  },
  asks: {
    eyebrow: { 'zh-TW': '我們對政府的要求', en: 'What we ask of government' },
    title: { 'zh-TW': '我們對政府的|六個要求', en: 'Six asks |of government' },
    lead: {
      'zh-TW': '依先後排列。每一項後面寫的機關，是本站的建議，還要再確認；其中兩項我們特別標了待確認。',
      en: 'In order. The agency after each one is our proposal and still to be confirmed; two are marked as especially uncertain.',
    },
    to: { 'zh-TW': '建議對象（本站提議）', en: 'Addressed to (our proposal)' },
    unconfirmed: { 'zh-TW': '待確認', en: 'To be confirmed' },
    position: { 'zh-TW': '本站立場，不是研究發現', en: 'Our position, not a finding' },
    items: [
      {
        ask: { 'zh-TW': '公布 {nextYear} 年的補助，而且一次講清楚好幾年。', en: 'No cliff on 1 January: publish the {nextYear} programme now, for several years at a time.' },
        to: { 'zh-TW': '經濟部（購車補助）、環境部（汰舊）、各縣市環保局', en: 'Ministry of Economic Affairs (purchase subsidy), Ministry of Environment (scrappage), city environmental protection bureaus' },
      },
      {
        ask: {
          'zh-TW': '到路口去量，把那張空白的圖填起來。在行人和嬰兒車的高度，分紅燈和綠燈，量一氧化碳、苯類和超細微粒，公開原始數據；不要只用 PM2.5 判斷街上的空氣。',
          en: 'Measure carbon monoxide, benzene-family compounds and ultrafine particles at pedestrian and stroller height, by signal phase, at scooter-heavy crossings, and publish the raw data. Stop judging street air by PM2.5 alone.',
        },
        to: { 'zh-TW': '環境部、各縣市環保局、交通部運輸研究所', en: 'Ministry of Environment, city environmental protection bureaus, the transport ministry’s Institute of Transportation' },
      },
      {
        ask: {
          'zh-TW': '找到每 {total} 台裡沒來定檢的那 {absent} 台，也讓還在登記的大約 {twoStroke} 輛二行程機車退場。',
          en: 'Follow up the {absent} in {total} who do not turn up for inspection, and retire the roughly {twoStroke} two-strokes still registered.',
        },
        to: { 'zh-TW': '環境部、各縣市環保局', en: 'Ministry of Environment, city environmental protection bureaus' },
      },
      {
        ask: {
          'zh-TW': '回到自己訂的目標：{year} 年新掛牌的機車只有 {share}% 是電動的，目標是 {targetYear} 年 {target}%。請說清楚差距怎麼補。',
          en: 'Get back to your own target: {share}% of new scooters were electric in {year}; the target is {target}% by {targetYear}. Say how the gap closes.',
        },
        to: { 'zh-TW': '行政院；淨零路徑的主責機關待確認', en: 'The Executive Yuan; the lead agency for the net-zero pathway is to be confirmed' },
      },
      {
        ask: {
          'zh-TW': '學校旁的路口先改：試辦把待轉區退得更遠，改前改後都量，量到了再說有沒有好處。',
          en: 'Trial larger set-backs for turn boxes at school crossings, and measure before and after before claiming a benefit.',
        },
        to: { 'zh-TW': '交通部（標線規則）、各縣市交通局', en: 'Ministry of Transportation (marking rules), city transport departments' },
      },
      {
        ask: {
          'zh-TW': '讓電動的每月開銷不輸加油，公寓也充得到電：補助不只補買車，也要照顧騎得少的人；公寓大廈要有清楚的充電辦法。',
          en: 'Fix running costs, not only the purchase price: support that reaches low-mileage riders, and a clear way to charge in apartment buildings.',
        },
        to: { 'zh-TW': '經濟部、內政部（公寓大廈）', en: 'Ministry of Economic Affairs, Ministry of the Interior (apartment buildings)' },
      },
    ],
  },
  letter: {
    title: { 'zh-TW': '寫給議員的信', en: 'A letter to your councillor' },
    lead: {
      'zh-TW': '前兩個要求最急。填上議員和你住的地方，複製下來，或用信箱寄出。',
      en: 'The first two asks are the most urgent. Fill in your councillor and where you live, then copy the letter or send it by email.',
    },
    fields: { 'zh-TW': '寄給誰', en: 'Who it goes to' },
    name: { 'zh-TW': '議員姓名', en: 'Councillor’s name' },
    city: { 'zh-TW': '你住的縣市', en: 'Your city or county' },
    subject: { 'zh-TW': '請關心 {nextYear} 年電動機車補助，以及路口空氣的量測', en: 'The {nextYear} electric-scooter subsidy, and measuring the air at our crossings' },
    body: {
      'zh-TW':
        '{name}議員您好：\n\n我是{city}的居民。想請您在議會關心兩件事。\n\n一、{nextYear} 年的電動機車補助。請督促市府和中央公布方案，而且一次講清楚好幾年，讓想換車的人來得及算。\n\n二、紅燈旁的空氣。行人在機車多的路口吸進多少一氧化碳、苯類和超細微粒，台灣還沒有人量過。請市府委託量測：在嬰兒車和大人的高度，分紅燈和綠燈量，並公開原始數據。\n\n謝謝您。\n\n{city}居民 敬上',
      en:
        'Dear Councillor {name},\n\nI live in {city}. I would like to ask you to raise two things in the council.\n\n1. The {nextYear} electric-scooter subsidy. Please press the city and central government to publish the programme, for several years at a time, so that people thinking of switching can work out what it costs in time.\n\n2. The air at red lights. Nobody in Taiwan has measured how much carbon monoxide, benzene-family compounds and ultrafine particles pedestrians breathe at scooter-heavy crossings. Please ask the city to commission a measurement at stroller and adult height, by red and green phase, and to publish the raw data.\n\nThank you.\n\nA resident of {city}',
    },
    copy: { 'zh-TW': '複製這封信', en: 'Copy the letter' },
  },
  composer: {
    subject: { 'zh-TW': '主旨：', en: 'Subject: ' },
    copied: { 'zh-TW': '已複製。', en: 'Copied.' },
    failed: { 'zh-TW': '這個瀏覽器不讓我們複製，請自己選取上面的文字。', en: 'This browser would not let us copy. Please select the text above yourself.' },
    mail: { 'zh-TW': '用我的信箱寄', en: 'Open in my email' },
    noStore: {
      'zh-TW': '你填的字只留在你的瀏覽器裡。我們不會收到，也不會存下來。',
      en: 'What you type stays in your browser. We do not receive it and nothing is stored.',
    },
  },
  money: {
    link: { 'zh-TW': '錢的事，在「換電動」那一頁算', en: 'The money is worked out on Going electric' },
  },
  /** /print/poster/ — V46, A4. */
  poster: {
    metaTitle: { 'zh-TW': '校門口海報', en: 'School-gate poster' },
    metaDescription: {
      'zh-TW': '可以列印的 A4 海報：校門口這個路口的空氣，沒有人量過。請和我們一起，請環保局來量。',
      en: 'A printable A4 poster: nobody has measured the air at this school crossing. Join us in asking for it to be measured.',
    },
    screenNote: { 'zh-TW': '這一頁是為了列印做的：A4 直印一頁。', en: 'This page is made for printing: one A4 page, portrait.' },
    printButton: { 'zh-TW': '列印', en: 'Print' },
    back: { 'zh-TW': '回到「行動」', en: 'Back to Take action' },
    kicker: { 'zh-TW': '給每天經過這個路口的人', en: 'For everyone who crosses here every day' },
    title: { 'zh-TW': '校門口這個路口的空氣，|沒有人量過', en: 'Nobody has measured |the air at this school crossing' },
    chartCaption: { 'zh-TW': '這張圖是空的：沒有人量過。', en: 'This chart is empty: nobody has measured it.' },
    ask: { 'zh-TW': '請和我們一起，請環保局來量。', en: 'Join us in asking the environmental bureau to measure it.' },
    qr: { 'zh-TW': '掃這裡，寄一封信給環保局', en: 'Scan here to send the bureau a letter' },
    qrAlt: { 'zh-TW': 'QR 碼，連到：{url}', en: 'QR code linking to {url}' },
    engine: {
      'zh-TW': '停著等孩子的時候，請熄火。這是請求，不是量過的效果。',
      en: 'While you wait for your child, please switch off your engine. This is a request, not a measured effect.',
    },
  },
});
