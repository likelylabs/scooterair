// /act/ — 我能做什麼 / What I can do (redesign brief 7.6, amendment 12.2). Five cards by who
// you are, one action on top of each; the measurement card; the letters below. Also the copy of
// the two print pages (brief 7.9): the school-gate poster (/print/poster/) and the one-page
// brief (/print/brief/), and the words drawn in lane J's pictures.
//
// Every number is a {token} filled from the registry or src/data/estimate.ts: never type one.
// Distance advice is qualitative only (brief 12.3). Riders are never blamed. The mask line on
// the walkers' card is the brief's own (12.2).

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '我能做什麼', en: 'What I can do' },
    description: {
      'zh-TW': '走路的人、家長和老師、騎車的人、學校和社區、民意代表和公務員，各自做得到的一件事，還有可以直接寄出的信。',
      en: 'One thing each for people who walk, parents and teachers, riders, schools and neighbourhoods, and councillors and officials, with letters ready to send.',
    },
  },
  hero: {
    eyebrow: { 'zh-TW': '行動', en: 'What I can do' },
    title: { 'zh-TW': '從你站的地方|做起', en: 'Start from |where you stand' },
    deck: {
      'zh-TW': '找到你是哪一種人。每張卡片最上面那一件，最值得先做；不買車，也有事可以做。',
      en: 'Find the card that fits you. The first thing on each card is the one most worth doing, and there is something for everyone that costs nothing.',
    },
    jump: { 'zh-TW': '我是', en: 'I am' },
  },
  first: { 'zh-TW': '先做這一件', en: 'Do this first' },
  more: { 'zh-TW': '還可以做', en: 'You can also' },
  why: { 'zh-TW': '為什麼', en: 'Why' },
  careful: { 'zh-TW': '要小心的地方', en: 'What to be careful about' },

  walk: {
    title: { 'zh-TW': '我走路', en: 'I walk' },
    jump: { 'zh-TW': '走路的人', en: 'Someone who walks' },
    top: {
      'zh-TW': '等紅燈的時候，離機車遠一點，別站在車陣正後方。',
      en: 'At a red light, stand a little away from the scooters, and not right behind the pack.',
    },
    topWhy: {
      'zh-TW': '排氣管離地大約 {cm} 公分，廢氣就排在腳邊。離排氣管遠一點，通常比較淡；差多少，本站不印數字。',
      en: 'A tailpipe is about {cm} cm off the ground, so the exhaust comes out by your feet. Further from the tailpipe it is usually thinner; we print no figure for how much.',
    },
    mask: {
      'zh-TW': '口罩擋不住廢氣裡的氣體；能做的是別站在車陣正後方。',
      en: 'A mask does not stop the gases in exhaust; what you can do is not stand right behind the pack.',
    },
    maskLink: { 'zh-TW': '口罩擋得住廢氣嗎？', en: 'Does a mask stop exhaust?' },
    route: { 'zh-TW': '有得選的時候，走車少一點的路。', en: 'Where you have a choice, take the street with less traffic.' },
    routeWhy: {
      'zh-TW': '台北一項研究裡，走巷弄小路的那條路線，尖峰時段的苯少了 {benzene}%，PM2.5 少了 {pm25}%。',
      en: 'In a Taipei study, the route along side streets and alleys had {benzene}% less benzene and {pm25}% less PM2.5 at rush hour.',
    },
    keepWalking: { 'zh-TW': '繼續走路。我們沒有要你少走。', en: 'Keep walking. We are not asking you to walk less.' },
    keepWalkingWhy: {
      'zh-TW': '一項追蹤台灣大人的研究裡，有規律運動的人，在每一種 PM2.5 程度下（所有來源的 PM2.5），死亡風險都比較低。',
      en: 'In a study of Taiwanese adults, people who exercised regularly had a lower risk of death at every level of PM2.5 (from all sources).',
    },
    smoky: {
      'zh-TW': '看到冒黑煙的機車，可以向縣市環保局檢舉；要附什麼，看當地環保局的說明。',
      en: 'If you see a scooter trailing black smoke, you can report it to your city’s environmental protection bureau; its own page says what to include.',
    },
    share: { 'zh-TW': '把這個網站傳到 LINE 群組。', en: 'Send this site to a LINE group.' },
    lineTitle: { 'zh-TW': '可以直接傳的一段話', en: 'A message you can send as it is' },
    line: {
      'zh-TW': '{sentence}這個網站把證據攤開，也算了換一輛電動機車要多少錢：{url}',
      en: '{sentence} This site lays out the evidence and works out what an electric scooter costs: {url}',
    },
    lineShare: { 'zh-TW': '用 LINE 傳', en: 'Send with LINE' },
    copy: { 'zh-TW': '複製這段話', en: 'Copy the message' },
  },

  parents: {
    title: { 'zh-TW': '我是家長或老師', en: 'I’m a parent or a teacher' },
    jump: { 'zh-TW': '家長或老師', en: 'A parent or teacher' },
    top: {
      'zh-TW': '帶小孩等紅燈，站離機車遠一點，別在車陣正後方。',
      en: 'Waiting at a red light with a child, stand a little away from the scooters, not right behind the pack.',
    },
    topWhy: {
      'zh-TW': '排氣管和嬰兒車裡的寶寶，都不到一公尺高。照體重算，小孩吸進的空氣是大人的 {lo} 到 {hi} 倍。',
      en: 'The tailpipe and a baby in a pushchair are both less than a metre off the ground. For their body weight, children breathe {lo} to {hi} times as much air as adults.',
    },
    poster: { 'zh-TW': '把校門口海報印出來，貼在接送孩子的地方。', en: 'Print the school-gate poster and put it up where children are dropped off.' },
    posterLink: { 'zh-TW': '打開海報', en: 'Open the poster' },
    film: { 'zh-TW': '和孩子一起看短片，看廢氣排在多高的地方。', en: 'Watch the film with your children and see how low the exhaust comes out.' },
    filmLink: { 'zh-TW': '看短片', en: 'Watch the film' },
    child: { 'zh-TW': '想多知道一點：小孩在路口吸到什麼。', en: 'To find out more: what a child breathes at the junction.' },
    childLink: { 'zh-TW': '我的小孩呢？', en: 'What about my child?' },
  },

  ride: {
    title: { 'zh-TW': '我騎車', en: 'I ride a scooter' },
    jump: { 'zh-TW': '騎車的人', en: 'Someone who rides' },
    top: { 'zh-TW': '準時定檢、該修就修；下一輛先算算看電動的。', en: 'Get inspected on time and fix what fails; before your next scooter, work out what an electric one costs.' },
    topWhy: {
      'zh-TW': '定檢讀數裡，排最多的一成，占了全部一氧化碳的{share}。修好一輛，路口就少一大團。',
      en: 'In the inspection readings, the highest tenth account for {share} of all the carbon monoxide. Fix one, and a big cloud leaves the junction.',
    },
    calc: { 'zh-TW': '去車行之前，先到「換電動」算一次。', en: 'Before you go to the dealer, work it out on Go electric.' },
    calcLink: { 'zh-TW': '算算看', en: 'Work it out' },
    twoStroke: {
      'zh-TW': '家裡如果還有二行程機車，把它報廢。全台灣在 {year} 年降到{count}輛以下。',
      en: 'If your household still has a two-stroke scooter, scrap it. Taiwan was down to {count} or fewer in {year}.',
    },
    idle: {
      'zh-TW': '我們不要求你在紅燈時熄火：重新發動時的排放，測試結果有好有壞。',
      en: 'We do not ask you to switch off at red lights: tests of the emissions when an engine restarts point both ways.',
    },
    rider: {
      'zh-TW': '你也在這一團裡：排在後面的時候，前面就是別人的排氣管。這不是誰的錯。',
      en: 'You are in the cloud too: in the second row, someone else’s tailpipe is right in front of you. This is nobody’s fault.',
    },
    riderLink: { 'zh-TW': '騎車的人呢？', en: 'And the rider?' },
  },

  community: {
    title: { 'zh-TW': '我在學校或社區', en: 'I’m at a school or in a neighbourhood' },
    jump: { 'zh-TW': '學校或社區', en: 'A school or neighbourhood' },
    top: { 'zh-TW': '在校門口貼一張海報，讓等紅燈的家長和孩子看到。', en: 'Put a poster up at the school gate, where parents and children wait at the light.' },
    topLink: { 'zh-TW': '打開海報', en: 'Open the poster' },
    charge: { 'zh-TW': '請管委會讓住戶在停車場幫電動機車充電。', en: 'Ask your building committee to let residents charge electric scooters in the car park.' },
    chargeLink: { 'zh-TW': '給管委會的信', en: 'The note to the committee' },
    crossing: {
      'zh-TW': '請縣市把學校旁的路口列入行人友善區，並試辦把待轉區退得更遠，改前改後都量。',
      en: 'Ask the city to include the crossing by the school in a pedestrian-friendly zone, and to trial moving the turn box further back, measuring before and after.',
    },
    crossingWhy: {
      'zh-TW': '標線規則寫的是待轉區和斑馬線之間要留 {gap} 公分以上；在不影響行人安全的時候，路口可以調整。',
      en: 'The marking rules ask for at least {gap} cm between the turn box and the crossing; a junction may adjust this where it does not affect pedestrian safety.',
    },
    notice: {
      'zh-TW': '在公布欄貼上定檢的日期，辦一天二行程機車的報廢日。',
      en: 'Put the inspection dates on the noticeboard, and hold a scrappage day for old two-stroke scooters.',
    },
  },

  policy: {
    title: { 'zh-TW': '我是民意代表或公務員', en: 'I’m a councillor or an official' },
    jump: { 'zh-TW': '民意代表或公務員', en: 'A councillor or official' },
    top: { 'zh-TW': '公布 {nextYear} 年的補助方案，一次講清楚好幾年。', en: 'Publish the {nextYear} subsidy programme, setting out several years at a time.' },
    topWhy: {
      'zh-TW': '{nextYear} 年的補助，還沒有一項定案；環境部只預告了一份草案。想換車的人，要等得到數字才能算。',
      en: 'Nothing is confirmed for {nextYear} yet; the environment ministry has only pre-announced a draft. People thinking of switching need the figures before they can do the sums.',
    },
    asksTitle: { 'zh-TW': '我們對政府的六個要求', en: 'Six asks of government' },
    asksLead: {
      'zh-TW': '依急迫程度排列。每一項後面，是我們建議負責的機關。',
      en: 'In order of urgency. After each one is the agency we suggest should lead.',
    },
    to: { 'zh-TW': '建議找', en: 'Suggested agency' },
    position: { 'zh-TW': '這是我們的立場，不是研究發現。', en: 'This is our position, not a research finding.' },
    asks: [
      {
        ask: { 'zh-TW': '在 {deadline}之前，公布 {nextYear} 年的補助，而且一次講清楚好幾年。', en: 'Before {deadline}, publish the {nextYear} subsidies, setting out several years at a time.' },
        to: { 'zh-TW': '經濟部產業發展署（購車補助）、環境部（汰舊）、各縣市環保局', en: 'Ministry of Economic Affairs, Industrial Development Administration (purchase subsidy); Ministry of Environment (scrappage); city environmental protection bureaus' },
      },
      {
        ask: {
          'zh-TW': '到紅燈路口量行人吸到的空氣：在大人和嬰兒車的高度，分紅燈和綠燈，量一氧化碳、苯（ㄅㄣˇ）和超細微粒，公開原始資料。本站的推估可以拿來對照。',
          en: 'Measure what pedestrians breathe at red lights: at adult and pushchair height, by red and green, for carbon monoxide, benzene and ultrafine particles, and publish the raw data. Our estimate is there to compare against.',
        },
        to: { 'zh-TW': '環境部、各縣市環保局、交通部運輸研究所', en: 'Ministry of Environment, city environmental protection bureaus, the Institute of Transportation' },
      },
      {
        ask: {
          'zh-TW': '找到每 {total} 輛接到通知、卻沒來定檢的那 {absent} 輛，也讓剩下的二行程機車退場。',
          en: 'Follow up the {absent} in every {total} scooters that are called for inspection and do not come, and retire the two-strokes still left.',
        },
        to: { 'zh-TW': '環境部、各縣市環保局', en: 'Ministry of Environment, city environmental protection bureaus' },
      },
      {
        ask: {
          'zh-TW': '回到自己訂的目標：{year} 年新領牌的機車，只有 {share}% 是電動的，目標是 {target}%。請說清楚差距怎麼補。',
          en: 'Get back to your own target: in {year}, {share}% of newly registered scooters were electric, against a target of {target}%. Say how the gap will close.',
        },
        to: { 'zh-TW': '行政院、國家發展委員會（淨零路徑）', en: 'The Executive Yuan; the National Development Council (net-zero pathway)' },
      },
      {
        ask: {
          'zh-TW': '學校旁的路口先改：試辦把待轉區退得更遠，改前改後都量，量到了再說有沒有好處。',
          en: 'Start with the crossings by schools: trial moving the turn box further back, measure before and after, and claim a benefit only once it is measured.',
        },
        to: { 'zh-TW': '交通部（道路交通標誌標線號誌設置規則）、各縣市交通局', en: 'Ministry of Transportation and Communications (road marking rules); city transport departments' },
      },
      {
        ask: {
          'zh-TW': '讓電動機車每個月的開銷也划算，公寓也充得到電：補助不只補買車，也照顧騎得少的人；公寓大廈要有清楚的充電辦法。',
          en: 'Make running an electric scooter good value each month too, and make charging possible in flats: support that reaches people who ride little, and clear rules for charging in apartment buildings.',
        },
        to: { 'zh-TW': '經濟部、內政部國土管理署（公寓大廈管理條例）', en: 'Ministry of Economic Affairs; Ministry of the Interior, National Land Management Agency (apartment buildings)' },
      },
    ],
    chart: {
      title: { 'zh-TW': '新領牌的機車裡，|電動的有多少', en: 'How many new scooters |are electric' },
      subtitle: { 'zh-TW': '每年新領牌機車中電動機車的比例，和淨零路徑的目標', en: 'Electric share of newly registered scooters each year, against the net-zero pathway’s targets' },
      chart: { 'zh-TW': '電動機車占新領牌機車的比例', en: 'Electric share of new scooter registrations' },
      desc: {
        'zh-TW': '{y1} 年是 {s1}%，{y2} 年只剩 {s2}%；目標是 {targets}。',
        en: '{s1}% in {y1}, down to {s2}% in {y2}; the targets are {targets}.',
      },
      actual: { 'zh-TW': '實際的比例', en: 'Actual share' },
      target: { 'zh-TW': '目標', en: 'Target' },
      year: { 'zh-TW': '年份', en: 'Year' },
    },
  },

  measure: {
    title: { 'zh-TW': '把推估換成實測', en: 'Turn the estimate into a measurement' },
    jump: { 'zh-TW': '想請人來量', en: 'Want it measured' },
    body: {
      'zh-TW': '本站的數字是推估。請環保局或大學，在機車多的路口，在大人和嬰兒車的高度，分紅燈和綠燈量。量出來的結果，不管高低，我們都會登出來。',
      en: 'Our figures are an estimate. Ask an environmental bureau or a university to measure at a busy crossing, at adult and pushchair height, by red and green. Whatever it shows, high or low, we will publish it.',
    },
    link: { 'zh-TW': '要量什麼、寫信請人來量', en: 'What to measure, and a letter asking for it' },
  },

  letters: {
    title: { 'zh-TW': '可以直接寄的信', en: 'Letters ready to send' },
    lead: { 'zh-TW': '填上幾個空格，複製下來，貼進機關的線上信箱，或用你的電子郵件寄。', en: 'Fill in a few blanks, then copy the letter into an agency’s online form, or send it from your own email.' },
  },
  letter: {
    title: { 'zh-TW': '寫給議員的信', en: 'A letter to your councillor' },
    lead: {
      'zh-TW': '前兩個要求最急。議員的服務處多半收電子郵件，也可以印出來寄。',
      en: 'The first two asks are the most urgent. Most councillors’ offices take email; you can also print it and post it.',
    },
    fields: { 'zh-TW': '寄給誰、你是誰', en: 'Who it is to, and who you are' },
    name: { 'zh-TW': '議員姓名', en: 'Councillor’s name' },
    city: { 'zh-TW': '你住的縣市', en: 'Your city or county' },
    cityHint: { 'zh-TW': '例如：新北市', en: 'For example: New Taipei' },
    sender: { 'zh-TW': '你的名字', en: 'Your name' },
    contact: { 'zh-TW': '聯絡方式（電話或電子郵件）', en: 'How to reach you (phone or email)' },
    subject: { 'zh-TW': '請關心 {nextYear} 年電動機車補助，以及紅燈路口的空氣', en: 'The {nextYear} electric-scooter subsidy, and the air at our red lights' },
    body: {
      'zh-TW':
        '{name}議員您好：\n\n我是{city}的居民，想請您在議會關心兩件事。\n\n一、{nextYear} 年的電動機車補助。請督促{city}政府和中央在年底前公布方案，一次公布好幾年的金額和期限，讓想換車的人來得及算。\n\n二、紅燈路口的空氣。交通部運輸研究所在 {sites} 個路口的行人等候區量過一氧化碳和 PM2.5；「行人呼吸」網站用這些資料推估紅燈時機車旁邊的空氣，算法全部公開。推估還要實測來確認。請{city}政府環保局委託量測：在大人和嬰兒車的高度，分紅燈和綠燈，記錄一氧化碳、苯和超細微粒，並公開原始資料。\n\n敬請回覆，謝謝您。\n\n{city}居民 {sender} 敬上\n聯絡方式：{contact}',
      en:
        'Dear Councillor {name},\n\nI live in {city}, and I would like to ask you to raise two things in the council.\n\n1. The {nextYear} electric-scooter subsidy. Please press the {city} government and central government to publish the programme before the end of the year, setting out the amounts and deadlines for several years at a time, so that people thinking of switching can work out the cost in time.\n\n2. The air at red lights. The Institute of Transportation has measured carbon monoxide and PM2.5 in the pedestrian waiting areas of {sites} junctions. The ScooterAir site uses those readings to estimate the air beside the scooters at a red light, and publishes all of its working. An estimate needs a measurement to confirm it. Please ask the {city} environmental protection bureau to commission one: at adult and pushchair height, by red and green, recording carbon monoxide, benzene and ultrafine particles, with the raw data published.\n\nI would be grateful for a reply.\n\nYours sincerely,\n{sender}, a resident of {city}\nContact: {contact}',
    },
    copy: { 'zh-TW': '複製這封信', en: 'Copy the letter' },
  },
  note: {
    title: { 'zh-TW': '給管委會的信', en: 'A note to the building committee' },
    honest: {
      'zh-TW': '先講清楚：這封信幫得到有車位的住戶；沒有車位的人，這封信幫不上。',
      en: 'To be clear: this note helps residents who have a parking space. It does nothing for people who do not.',
    },
    fields: { 'zh-TW': '填上大樓和你的名字', en: 'Fill in your building and your name' },
    building: { 'zh-TW': '大樓或社區名稱', en: 'Building or estate' },
    name: { 'zh-TW': '你的名字或戶號', en: 'Your name or flat number' },
    subject: { 'zh-TW': '請管委會討論開放機車在停車場充電', en: 'Request to discuss scooter charging in the car park' },
    body: {
      'zh-TW':
        '{building}管理委員會 公鑒：\n\n我是本社區的住戶。想請管委會把下面的提案排進下次會議：開放住戶在停車場的機車位，幫電動機車充電。\n\n一、評估停車場的用電容量，以及裝設插座或充電設備的費用。\n二、訂出使用和分攤電費的規則，例如分表計費。\n三、請電機或消防專業人員確認安全。\n\n能在家充電，住戶換電動機車的時候，就多一個選擇。謝謝各位委員撥空討論，也請告知討論結果。\n\n住戶 {name} 敬上',
      en:
        'To the management committee of {building}:\n\nI am a resident here, and I would like to ask the committee to put the following proposal on the agenda of its next meeting: allowing residents to charge electric scooters at their scooter spaces in the car park.\n\n1. Assess the car park’s electrical capacity and the cost of installing sockets or chargers.\n2. Agree rules for use and for sharing the electricity cost, for example with sub-metering.\n3. Ask a qualified electrician or fire-safety professional to confirm it is safe.\n\nBeing able to charge at home gives residents one more option when they change scooters. Thank you for taking the time to discuss it; please let me know what is decided.\n\nWith thanks,\n{name}',
    },
    copy: { 'zh-TW': '複製這封信', en: 'Copy the note' },
  },
  composer: {
    subject: { 'zh-TW': '主旨：', en: 'Subject: ' },
    copied: { 'zh-TW': '已複製。', en: 'Copied.' },
    failed: { 'zh-TW': '這個瀏覽器不讓我們複製，請自己選取上面的文字。', en: 'This browser would not let us copy. Please select the text above yourself.' },
    mail: { 'zh-TW': '用我的電子郵件寄', en: 'Open in my email' },
    noStore: {
      'zh-TW': '你填的字只留在你的瀏覽器裡。我們不會收到，也不會存下來。',
      en: 'What you type stays in your browser. We do not receive it and nothing is stored.',
    },
  },

  /** Words drawn in lane J's pictures (Picture.astro). */
  pictures: {
    waitingToo: { 'zh-TW': '他也在等', en: 'He is waiting too' },
    kerbAlt: {
      'zh-TW': '路邊的近景：推嬰兒車的大人、用手摀住鼻子的小學生和阿嬤站在左邊，最近一輛機車的車尾在右邊，騎士也在等。',
      en: 'The kerb, close: a parent with a pushchair, a schoolchild covering her nose and an older woman on the left; the tail of the nearest scooter on the right, its rider waiting too.',
    },
    kerbElectricAlt: {
      'zh-TW': '同一個路邊，機車換成電動的：沒有排氣管，只剩街上原本就有的空氣，和一輛汽車自己的一小團廢氣。',
      en: 'The same kerb with electric scooters: no tailpipes, only the air the street already holds and one car’s own small plume.',
    },
    heightsAlt: {
      'zh-TW': '一把以公分為單位的尺，和站在同一條地面線上的四個人：嬰兒車裡的寶寶、小學生、大人，和坐在機車上的騎士。排氣管和嬰兒車都在一公尺以下，廢氣從地面到大人頭上都一樣畫。',
      en: 'A ruler in centimetres and four figures on one ground line: a baby in a pushchair, a schoolchild, an adult and a rider seated on a scooter. The tailpipe and the pushchair are both under a metre; the exhaust is drawn evenly from the ground to above the adult’s head.',
    },
    oneMetre: { 'zh-TW': '1 公尺', en: '1 metre' },
    band: { 'zh-TW': '嬰兒車 {lo}–{hi} 公分', en: 'Pushchair {lo}–{hi} cm' },
    tailpipe: { 'zh-TW': '排氣管', en: 'Tailpipe' },
    unit: { 'zh-TW': '公分', en: 'cm' },
  },

  /** /print/poster/ — the school-gate poster, A4 portrait. */
  poster: {
    metaTitle: { 'zh-TW': '校門口海報', en: 'School-gate poster' },
    metaDescription: {
      'zh-TW': '可以列印的 A4 海報：一排機車停在旁邊，路邊多一層廢氣；換一輛電動的，就少一根排氣管。',
      en: 'A printable A4 poster: a row of scooters beside you adds a layer of exhaust at the kerb, and every electric scooter is one tailpipe fewer.',
    },
    screenNote: { 'zh-TW': '這一頁是為了列印做的：A4 直印一頁。', en: 'This page is made for printing: one A4 page, portrait.' },
    printButton: { 'zh-TW': '列印', en: 'Print' },
    back: { 'zh-TW': '回到「我能做什麼」', en: 'Back to What I can do' },
    kicker: { 'zh-TW': '給每天在這個路口等紅燈的人', en: 'For everyone who waits at this crossing' },
    co: { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
    title: { 'zh-TW': '一排機車停在旁邊，|路邊多一層廢氣', en: 'A row of scooters beside you |adds a layer of exhaust at the kerb' },
    qr: { 'zh-TW': '掃 QR Code，看完整的說明', en: 'Scan the QR code for the whole story' },
    qrAlt: { 'zh-TW': 'QR Code，連到：{url}', en: 'QR code linking to {url}' },
    engine: {
      'zh-TW': '在校門口停著等孩子的時候，請把引擎熄火。',
      en: 'While you wait at the school gate for your child, please switch off your engine.',
    },
  },

  /** /print/brief/ — one A4 page for a borough chief or a councillor. */
  brief: {
    metaTitle: { 'zh-TW': '一頁說明：紅燈旁的機車廢氣', en: 'One-page brief: scooter exhaust at red lights' },
    metaDescription: {
      'zh-TW': '給里長和議員的一頁說明：紅燈時機車旁邊的空氣，量到的和算的，還有我們的請求。',
      en: 'A one-page brief for borough chiefs and councillors: the air beside the scooters at a red light, measured and worked out, and what we ask.',
    },
    screenNote: { 'zh-TW': '這一頁是為了列印做的：A4 直印一頁。', en: 'This page is made for printing: one A4 page, portrait.' },
    printButton: { 'zh-TW': '列印', en: 'Print' },
    back: { 'zh-TW': '回到「我能做什麼」', en: 'Back to What I can do' },
    kicker: { 'zh-TW': '給里長和議員的一頁說明', en: 'A one-page brief for borough chiefs and councillors' },
    title: { 'zh-TW': '紅燈時，機車旁邊的空氣：|量到的，和算的', en: 'The air beside scooters at a red light: |measured, and worked out' },
    kerbHead: { 'zh-TW': '一排機車停在旁邊，路邊多一層廢氣', en: 'A row of scooters adds a layer of exhaust at the kerb' },
    checkLead: {
      'zh-TW': '運研所在 {sites} 個路口的行人等候區放了儀器。量到的和算的，都比世界衛生組織的 15 分鐘指引值低很多。',
      en: 'The Institute of Transportation put sensors where pedestrians wait at {sites} junctions. Both the readings and our estimate are far below the WHO 15-minute guideline.',
    },
    rowStreet: { 'zh-TW': '平常的路邊', en: 'An ordinary roadside' },
    rowStreetSub: { 'zh-TW': '交通測站，2025 年平均', en: 'Traffic stations, 2025 average' },
    rowIot: { 'zh-TW': '路口等過馬路的地方', en: 'Where pedestrians wait to cross' },
    rowIotSub: { 'zh-TW': '運研所，{n} 個路口，最高的一分鐘', en: 'Institute of Transportation, {n} junctions, highest minute' },
    rowEst: { 'zh-TW': '紅燈時，十來輛機車旁邊', en: 'Beside a dozen scooters at a red light' },
    rowEstSub: { 'zh-TW': '90 秒平均，含街上原本就有的', en: '90-second average, including what the street already holds' },
    who: { 'zh-TW': '上面整張圖，只占這條長條最左邊的一小段；長條的右端是世界衛生組織 15 分鐘指引值：約 {ppm} ppm。', en: 'The whole chart above fits in the small piece at the left of this bar; its right end is the WHO 15-minute guideline: about {ppm} ppm.' },
    axis: { 'zh-TW': '一氧化碳（ppm）', en: 'Carbon monoxide (ppm)' },
    tableHead: { 'zh-TW': '這排機車多出來多少', en: 'What the scooters add' },
    tableScenario: { 'zh-TW': '旁邊停了幾輛', en: 'Scooters beside you' },
    tableStreet: { 'zh-TW': '街上原本就有', en: 'Already in the street' },
    tableConfidence: { 'zh-TW': '可信程度', en: 'Confidence' },
    co: { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
    benzene: { 'zh-TW': '苯（ㄅㄣˇ）', en: 'Benzene' },
    pm25: { 'zh-TW': 'PM2.5', en: 'PM2.5' },
    tableNote: {
      'zh-TW': '大人鼻子的高度（1.5 公尺）、90 秒的平均。苯和 PM2.5 的推估比一氧化碳更不確定。',
      en: 'At an adult’s nose (1.5 m), averaged over 90 seconds. The benzene and PM2.5 estimates are less certain than carbon monoxide.',
    },
    heightsHead: { 'zh-TW': '同一個路口，小孩離排氣管最近', en: 'Same junction: the child is closest to the tailpipe' },
    heightsBody: {
      'zh-TW': '排氣管和嬰兒車裡的寶寶，都不到一公尺高。照體重算，小孩吸進的空氣是大人的 {lo} 到 {hi} 倍。',
      en: 'The tailpipe and a baby in a pushchair are both less than a metre off the ground. For their body weight, children breathe {lo} to {hi} times as much air as adults.',
    },
    askHead: { 'zh-TW': '我們的請求', en: 'What we ask' },
    ask: {
      'zh-TW': '請委託量測：在機車多的路口，在大人和嬰兒車的高度，分紅燈和綠燈，量一氧化碳、苯和超細微粒，公開原始資料。',
      en: 'Commission a measurement: at a busy crossing, at adult and pushchair height, by red and green, for carbon monoxide, benzene and ultrafine particles, with the raw data published.',
    },
    promise: { 'zh-TW': '量出來的結果，不管高低，我們都會登出來。', en: 'Whatever the result, high or low, we will publish it.' },
    more: { 'zh-TW': '完整算法和出處：', en: 'The full working and the sources:' },
    refs: {
      'zh-TW': '出處：交通部運輸研究所的路口量測；環境部空氣品質測站（2025 年）；世界衛生組織的一氧化碳指引值；本站的推估（{stamp}），算法全部公開。',
      en: 'Sources: the Institute of Transportation’s junction readings; Ministry of Environment air-quality stations (2025); the WHO carbon monoxide guideline; this site’s estimate ({stamp}), with all of its working published.',
    },
  },
});
