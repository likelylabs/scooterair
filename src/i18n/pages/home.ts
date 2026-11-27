// Home page copy: one red light in fifteen screens (docs/redesign-brief.md section 3, with
// amendment 12.2: the masks screen is the tenth). One key per screen, s1 … s15, in the order
// they are read. Each screen has: chapter (the short name the rail shows), headline ('|' marks
// where a line may break), body (at most two sentences), an optional quiet line, the text of
// its sheet (怎麼知道的？) and `next`, the question the next screen answers.
//
// Shared words are not retyped here: chip names, the K sentences (the only allowed "not yet
// measured / not shown" wording), the illustration tag and the sheet's buttons are in ../ui.ts;
// the estimate's own sentences (the gloss, the rule-chosen sentences of screens 4 and 5, the
// cross-check paragraph) are in src/data/estimate.ts; the money headlines and the rule-chosen
// money sentences are `open.*` in ./electric.ts, so the home page and /electric/ say the same.
//
// Every number is a {token} filled at build time from the estimate, the registry or the
// calculator. The few figures that are written out are names, not values: 「15 分鐘指引值」,
// 「125cc」, 「N95」, 「PM2.5」, and the day-words of screen 7, which the page checks
// against time.hoursPerYear at build time and refuses to print if the arithmetic moves.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    /** <title> on the home page is the site's name and tagline (Base, `home`); this is the fallback. */
    title: { 'zh-TW': '一個紅燈', en: 'One red light' },
    description: {
      'zh-TW': '等紅燈時，旁邊機車的廢氣有多少、對身體有什麼影響、換電動機車要多少錢。一張圖講一件事，看懂路口的空氣污染。',
      en: 'How much exhaust the scooters beside you add at a red light, what it does to the body, and what an electric scooter costs. One picture at a time: the air pollution at Taiwan’s junctions.',
    },
    /** Read by screen readers before the fifteen screens. */
    story: { 'zh-TW': '一個紅燈的故事，共 {total} 張圖', en: 'The story of one red light, in {total} pictures' },
  },

  /** Words several screens share. */
  common: {
    film: { 'zh-TW': '看短片（約 {length}）', en: 'Watch the film (about {length})' },
    filmShort: { 'zh-TW': '看短片', en: 'Watch the film' },
    minutes: { 'zh-TW': '{n} 分鐘', en: '{n} minutes' },
    minute: { 'zh-TW': '1 分鐘', en: '1 minute' },
    halfMinutes: { 'zh-TW': '{n} 分半', en: '{n}½ minutes' },
    checked: { 'zh-TW': '價格和補助 {date} 查', en: 'Prices and subsidies checked {date}' },
    ugm3: { 'zh-TW': '微克／立方公尺', en: 'µg/m³' },
  },

  // 1 ─────────────────────────────────────────────────────────────────────────────────────────
  s1: {
    chapter: { 'zh-TW': '紅燈亮了', en: 'Red light' },
    headline: { 'zh-TW': '那個味道，|你也聞過', en: 'You know that smell' },
    body: {
      'zh-TW': '紅燈 {s} 秒，一整排機車停在旁邊，引擎沒熄火。騎車的、走路的，都在同一個路口呼吸。',
      en: 'For {s} seconds at a red light, a whole row of scooters waits beside you, engines running. Riders and walkers breathe at the same junction.',
    },
    chipSeconds: { 'zh-TW': '紅燈 {s} 秒', en: '{s}-second red' },
    chipDrawn: { 'zh-TW': '畫 {n} 輛', en: '{n} drawn' },
    sheet: {
      title: { 'zh-TW': '{s} 秒、{n} 輛，|是怎麼來的', en: '{s} seconds and {n} scooters: |where they come from' },
      who: { 'zh-TW': '交通部運輸研究所（運研所）在路口做的調查。', en: 'A junction survey by Taiwan’s Institute of Transportation, part of the transport ministry.' },
      what: {
        'zh-TW': '{s} 秒是常見的紅燈長度；運研所量的路口，行人大約要等 {lo} 到 {hi} 秒。',
        en: '{s} seconds is a common length for a red light. At the junctions the Institute timed, pedestrians wait about {lo} to {hi} seconds.',
      },
      care: {
        'zh-TW': '圖上畫 {n} 輛，是「{name}」（{clo} 到 {chi} 輛）的情境。每個路口、每個時段都不一樣。',
        en: 'The picture draws {n} scooters: the “{name}” case ({clo} to {chi} scooters). Every junction and every hour is different.',
      },
      count: { 'zh-TW': '幾輛是怎麼定的', en: 'How the counts were chosen' },
    },
    next: { 'zh-TW': '這些機車排出什麼？', en: 'What comes out of them?' },
  },

  // 2 ─────────────────────────────────────────────────────────────────────────────────────────
  s2: {
    chapter: { 'zh-TW': '排出什麼', en: 'What comes out' },
    headline: { 'zh-TW': '臭的是油氣和醛類。|一氧化碳和微粒，|聞不到', en: 'The smell is fuel vapour and sharp aldehydes. |Carbon monoxide and particles |have no smell' },
    body: {
      'zh-TW': '味道只告訴你一件事：你正站在廢氣裡。油氣裡有苯（ㄅㄣˇ），是確定會致癌的東西。',
      en: 'The smell tells you one thing: you are standing in exhaust. The vapour carries benzene, a proven cause of cancer.',
    },
    /** Printed only while the registry fact who-benzene-no-safe-level is verified. */
    quiet: { 'zh-TW': '世界衛生組織說，苯找不到安全的量。', en: 'The WHO says no safe level of benzene can be recommended.' },
    /** Beside the drawn can; the range and the 推估 chip follow it. */
    canLabel: { 'zh-TW': '一輛機車等一個紅燈，排出的一氧化碳', en: 'Carbon monoxide from one scooter through one red light' },
    sheet: {
      title: { 'zh-TW': '一個鋁罐的一氧化碳，|怎麼來的', en: 'A drinks can of carbon monoxide: |where it comes from' },
      measured: {
        'zh-TW': '環境部的機車定檢，一年大約 {readings} 萬筆一氧化碳讀數。苯是國際癌症研究機構認定會致癌的東西。',
        en: 'Taiwan’s scooter inspections: about {readings} million carbon monoxide readings a year. The International Agency for Research on Cancer classes benzene as carcinogenic to humans.',
      },
      can: {
        'zh-TW': '常溫下這些一氧化碳{litres}，一個鋁罐是 {ml} 毫升，所以是{cans}。',
        en: 'At room temperature that carbon monoxide takes up {litres}. A drinks can holds {ml} mL, so it is {cans}.',
      },
      care: {
        'zh-TW': '這是全台灣機車的平均：新車排得少，騎了很多年的車排得多。苯會致癌，講的是長年吸進去，不是等一個紅燈。',
        en: 'This is an average over Taiwan’s scooters: new ones give off less, ones ridden for many years more. When we say benzene gives people cancer, we mean years of breathing it, not one red light.',
      },
    },
    next: { 'zh-TW': '排出來以後，去哪裡？', en: 'Where does it go?' },
  },

  // 3 ─────────────────────────────────────────────────────────────────────────────────────────
  s3: {
    chapter: { 'zh-TW': '排在哪裡', en: 'Where it goes' },
    headline: { 'zh-TW': '待轉區的機車，|排氣管就對著斑馬線', en: 'In the turn box, the tailpipes sit |right in front of the crossing' },
    body: {
      'zh-TW': '排氣管比膝蓋低（運研所算的時候設在離地 {h} 公分），廢氣就排在腳邊。待轉區和斑馬線之間，規定只要留 {gap} 公分以上。',
      en: 'A tailpipe sits below knee height (the Institute of Transportation’s model puts it {h} cm up), so the exhaust comes out by your feet. The rules ask for at least {gap} cm between the turn box and the crossing.',
    },
    sheet: {
      title: { 'zh-TW': '這兩個 {gap} 公分，|是誰說的', en: 'Those two figures of {gap} cm: |who says so' },
      who: {
        'zh-TW': '交通部的標線規則；排氣管的高度，是運研所算路口空氣的時候設定的。',
        en: 'The transport ministry’s road-marking rules. The tailpipe height is what the Institute of Transportation set when it modelled junction air.',
      },
      what: {
        'zh-TW': '待轉區的後緣，離斑馬線至少 {gap} 公分。運研所把汽機車的排氣管，設在離地 {h} 公分。',
        en: 'The rear edge of the turn box must be at least {gap} cm from the crossing. The Institute set car and scooter tailpipes {h} cm above the ground.',
      },
      care: {
        'zh-TW': '{gap} 公分是最少要留的，每個路口不一樣；排氣管的高度每款車也不同。怠速規定是停車等候超過 {min} 分鐘才要熄火，一般的紅燈比這短。',
        en: 'The {gap} cm is a minimum, and junctions differ; tailpipe height differs by model too. The idling rule asks for engines off only after more than {min} minutes of waiting, and an ordinary red light is shorter than that.',
      },
    },
    next: { 'zh-TW': '站在旁邊的人，吸進多少？', en: 'How much does the person beside them breathe?' },
  },

  // 4 ─────────────────────────────────────────────────────────────────────────────────────────
  s4: {
    chapter: { 'zh-TW': '吸進多少', en: 'How much' },
    headline: { 'zh-TW': '一排機車停在旁邊，|路邊多一層廢氣', en: 'A row of scooters beside you |adds a layer of exhaust at the kerb' },
    // body: est.meta.gloss + kerbSentence(scenario) from src/data/estimate.ts
    quiet: {
      'zh-TW': '圈圈越密＝一氧化碳越多。到處都有的稀疏圈圈，是街上原本就有的。',
      en: 'More rings mean more carbon monoxide. The sparse rings everywhere are what the street already holds.',
    },
    box: { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
    sheet: {
      title: { 'zh-TW': '這個範圍，|是怎麼來的', en: 'Where this range |comes from' },
      measured: {
        'zh-TW': '運研所在 {sites} 個路口的行人等候區放了儀器。其中 {n} 個路口，一氧化碳最高的一分鐘是 {lo} 到 {hi} ppm。',
        en: 'The Institute of Transportation put sensors where pedestrians wait at {sites} junctions. At {n} of them the highest minute of carbon monoxide read {lo} to {hi} ppm.',
      },
      care: {
        'zh-TW': '風一變，答案可以差到四倍。下面兩格，是同一個情境畫成範圍的兩頭。',
        en: 'A change in the wind can move the answer about four-fold. The two patches below draw the two ends of the range for the same case.',
      },
    },
    next: { 'zh-TW': '有人實際量過嗎？', en: 'Has anyone actually measured it?' },
  },

  // 5 ─────────────────────────────────────────────────────────────────────────────────────────
  s5: {
    chapter: { 'zh-TW': '量到的，和算的', en: 'Measured, estimated' },
    // headline: checkHeadline() from src/data/estimate.ts (the written rule of brief 3.2)
    bodySensors: {
      'zh-TW': '運研所在 {sites} 個路口的行人等候區放了儀器。',
      en: 'Taiwan’s Institute of Transportation put sensors where pedestrians wait at {sites} junctions.',
    },
    /** Printed only while the highest value on the chart is under a quarter of the WHO value. */
    bodyFarBelow: {
      'zh-TW': '量到的和算的，都比世界衛生組織的 15 分鐘指引值低很多。',
      en: 'Both the readings and our estimate are far below the WHO 15-minute guideline.',
    },
    // quiet: estimateText.coTracksVapour
    sheet: {
      who: {
        'zh-TW': '路口的行人等候區，是交通部運輸研究所（運研所）量的；平常的路邊，是環境部的交通測站。',
        en: 'The pedestrian waiting areas were measured by the Institute of Transportation; the ordinary roadside is the environment ministry’s traffic stations.',
      },
      table: { 'zh-TW': '圖上的數字', en: 'The numbers on the chart' },
    },
    next: { 'zh-TW': '吸進去以後，去了哪裡？', en: 'Once breathed in, where does it go?' },
  },

  // 6 ─────────────────────────────────────────────────────────────────────────────────────────
  s6: {
    chapter: { 'zh-TW': '吸進去以後', en: 'Once breathed in' },
    headline: { 'zh-TW': '長年吸車子的廢氣，|和氣喘、|心臟病、|肺癌有關', en: 'Years of breathing traffic exhaust |are linked to asthma, heart disease |and lung cancer' },
    body: {
      'zh-TW': '這是 {n} 篇長期研究的結論，講的是所有車輛的廢氣，不只機車。圖上是廢氣進到身體以後去的地方。',
      en: 'That is the finding of a review of {n} long-term studies of exhaust from all traffic, not scooters alone. The picture shows where exhaust goes once it is inside the body.',
    },
    // quiet: kSentences.K5
    /** Shown with scripting until a pin is tapped. */
    hint: { 'zh-TW': '點圖上的數字，看廢氣去了哪裡。', en: 'Tap a number to see where the exhaust goes.' },
    /** Each prints only while its registry fact (route-…) is verified. */
    pins: {
      nose: { 'zh-TW': '鼻子、喉嚨：聞得到的刺鼻味道，會刺激鼻子和喉嚨。', en: 'Nose and throat: the sharp smell you notice irritates them.' },
      lungs: { 'zh-TW': '肺：很小的微粒，可以進到肺的深處。', en: 'Lungs: very small particles reach deep into the lungs.' },
      blood: { 'zh-TW': '血液：一氧化碳從肺進到血液，占掉載氧氣的位子。', en: 'Blood: carbon monoxide passes from the lungs into the blood and takes up room meant for oxygen.' },
    },
    sheet: {
      who: {
        'zh-TW': '美國健康效應研究所整理了 {n} 篇長期研究，看的是長年住在車多的地方、吸車子廢氣的人。',
        en: 'The Health Effects Institute, in the United States, reviewed {n} long-term studies of people who lived for years with traffic exhaust.',
      },
      what: {
        'zh-TW': '新得氣喘的比較多；因為心臟病（心臟血管塞住的那種）、肺癌過世的也比較多。',
        en: 'More people newly developed asthma; more died of ischaemic heart disease and of lung cancer.',
      },
      care: {
        'zh-TW': '這是「有關」，研究沒有判定因果。講的是所有車輛，不只機車，而且大多在歐美做的。',
        en: 'This is a link; the review did not decide whether exhaust is the reason. It covers all traffic, not scooters alone, and most of the studies were done in Europe and North America.',
      },
      /** Printed with the pins that ship: what the three routes do and do not say. */
      routes: {
        'zh-TW': '圖上三條路，是這些東西進到身體以後去的地方。一氧化碳要很多，才會明顯占掉載氧氣的位子；路口量到的和本站算的，都比世界衛生組織的 15 分鐘指引值低很多。',
        en: 'The three routes show where these things go in the body. It takes a lot of carbon monoxide to take up much of the room meant for oxygen; what was measured at junctions and what this site works out are both far below the WHO 15-minute guideline.',
      },
    },
    next: { 'zh-TW': '一個紅燈那麼短，也算嗎？', en: 'One red light is so short. Does it count?' },
  },

  // 7 ─────────────────────────────────────────────────────────────────────────────────────────
  s7: {
    chapter: { 'zh-TW': '天天等', en: 'Every day' },
    headline: { 'zh-TW': '一個紅燈很短，|可是天天都要等', en: 'One red light is short. |But you wait at one every day' },
    /**
     * By the stepper. The day-words are checked against time.hoursPerYear at build time
     * (12–18, 24–36 and 36–55 hours); if the arithmetic changes the build stops here.
     */
    body: {
      2: { 'zh-TW': '一天等兩個紅燈，一年就在路邊站了半天到快一天。', en: 'Two red lights a day add up to half a day to nearly a day a year at the kerb.' },
      4: { 'zh-TW': '一天等四個紅燈，一年就在路邊站了一天到一天半。', en: 'Four red lights a day add up to a day to a day and a half a year at the kerb.' },
      6: { 'zh-TW': '一天等六個紅燈，一年就在路邊站了一天半到兩天多。', en: 'Six red lights a day add up to a day and a half to more than two days a year at the kerb.' },
    },
    quiet: { 'zh-TW': '這些研究量的是各種來源的髒空氣，不只機車。', en: 'These studies measured dirty air from all sources, not scooters alone.' },
    stepper: { 'zh-TW': '一天等幾個紅燈？', en: 'How many red lights a day?' },
    stepperOption: { 'zh-TW': '一天 {n}\u00a0個', en: '{n} a day' },
    posts: {
      minutes: {
        when: { 'zh-TW': '{min} 分鐘', en: '{min} minutes' },
        text: { 'zh-TW': '心跳的節奏小小變了一下（高雄，{people} 人）', en: 'The heart’s rhythm shifted a little (Kaohsiung, {people} people)' },
      },
      hours: {
        when: { 'zh-TW': '{h} 小時', en: '{h} hours' },
        text: { 'zh-TW': '氣喘的人，肺功能小幅下降（倫敦）', en: 'In people with asthma, lung function dipped slightly (London)' },
      },
      years: {
        when: { 'zh-TW': '很多年', en: 'Many years' },
        text: { 'zh-TW': '氣喘、心臟病、肺癌比較多（{n} 篇研究）', en: 'More asthma, heart disease and lung cancer ({n} studies)' },
      },
    },
    sheet: {
      heads: [
        { 'zh-TW': '三個研究', en: 'Three studies' },
        { 'zh-TW': '加起來是多少', en: 'What it adds up to' },
        { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
      ],
      minutes: {
        'zh-TW': '{min} 分鐘：高雄 {people} 人戴著感測器。高雄找到的髒空氣高峰，主要來自工廠、蚊香、燒稻草和燒香；心跳的節奏小小變了一下，這是身體的訊號，不是生病。',
        en: '{min} minutes: {people} people in Kaohsiung wore sensors. The peaks of dirty air found in Kaohsiung came mainly from factories, mosquito coils, burning straw and incense; the heart’s rhythm shifted a little: a signal, not an illness.',
      },
      hours: {
        'zh-TW': '{h} 小時：倫敦 {people} 位有氣喘的大人，沿著柴油車很多的街走。',
        en: '{h} hours: {people} adults with asthma in London walked along a street full of diesel traffic.',
      },
      years: {
        'zh-TW': '很多年：{n} 篇長期研究，講的是所有車輛的廢氣。',
        en: 'Many years: {n} long-term studies, of exhaust from all traffic.',
      },
      dose: {
        'zh-TW': '一天四個紅燈，讓你一整天吸到的一氧化碳多不到 {pct}%。',
        en: 'Four red lights a day raise the carbon monoxide you breathe over a whole day by under {pct}%.',
      },
      workers: {
        'zh-TW': '整天在路邊工作的人（交通警察、攤販、導護）就不一樣：一個紅燈接一個紅燈，加起來就像一直待在路邊。',
        en: 'It is different for people who work at the kerb all day (traffic police, street vendors, crossing guards): one red light after another adds up to standing in it all the time.',
      },
    },
    next: { 'zh-TW': '同一個路口，誰離得最近？', en: 'At the same junction, who is closest?' },
  },

  // 8 ─────────────────────────────────────────────────────────────────────────────────────────
  s8: {
    chapter: { 'zh-TW': '誰最近', en: 'Who is closest' },
    headline: { 'zh-TW': '同一個路口，|小孩離排氣管最近', en: 'Same junction: |the child is closest to the tailpipe' },
    body: {
      'zh-TW': '排氣管和嬰兒車裡的寶寶，都不到一公尺高。照體重算，小孩吸進的空氣是大人的 {lo} 到 {hi} 倍。',
      en: 'The tailpipe and a baby in a pushchair are both less than a metre off the ground. For their body weight, children breathe {lo} to {hi} times as much air as adults.',
    },
    // quiet: kSentences.K4
    sheet: {
      who: {
        'zh-TW': '美國環保署的手冊，整理了各個年齡每天吸進多少空氣。',
        en: 'A handbook from the US Environmental Protection Agency that sets out how much air people of each age breathe in a day.',
      },
      what: {
        'zh-TW': '照體重算，小孩每天吸進的空氣，是大人的 {lo} 到 {hi} 倍；年紀越小，倍數越大。',
        en: 'For their body weight, children breathe {lo} to {hi} times as much air a day as adults; the younger the child, the bigger the difference.',
      },
      care: {
        'zh-TW': '這是一整天的平均，用美國的資料算的，不是在路口量的。它說的是小孩照體重吸得比較多，不是小孩那個高度的空氣比較髒。',
        en: 'These are whole-day averages from US data, not readings taken at a junction. They say children take in more air for their weight, not that the air at a child’s height is dirtier.',
      },
    },
    next: { 'zh-TW': '那騎車的人呢？', en: 'And the rider?' },
  },

  // 9 ─────────────────────────────────────────────────────────────────────────────────────────
  s9: {
    chapter: { 'zh-TW': '騎士也在裡面', en: 'The rider too' },
    headline: { 'zh-TW': '騎車的人，|也在這一團裡', en: 'The rider is in the cloud too' },
    body: {
      'zh-TW': '排在後面的騎士，前面就是別人的排氣管。這不是誰的錯，大家都泡在同一團廢氣裡。',
      en: 'A rider in the second row sits right behind someone else’s tailpipe. This is nobody’s fault: everyone at the junction is in the same cloud.',
    },
    quiet: {
      'zh-TW': '台北量過：騎機車和走路的人，吸到的細懸浮微粒（PM2.5）平均都比搭捷運的多。',
      en: 'Measured in Taipei: people on scooters and people on foot both breathed more fine particles (PM2.5), on average, than people on the metro.',
    },
    sheet: {
      who: {
        'zh-TW': '台北的研究人員，請一群健康的年輕人在早上通勤的一個小時裡，身上帶著儀器。',
        en: 'Researchers in Taipei asked a group of healthy young adults to carry a monitor through one hour of the morning commute.',
      },
      what: { 'zh-TW': '每個人身邊的 PM2.5，平均是：', en: 'Mean PM2.5 beside each person:' },
      modes: {
        scooter: { 'zh-TW': '騎燃油機車', en: 'On a petrol scooter' },
        walking: { 'zh-TW': '走路', en: 'On foot' },
        bus: { 'zh-TW': '搭公車', en: 'By bus' },
        car: { 'zh-TW': '坐汽車', en: 'By car' },
        metro: { 'zh-TW': '搭捷運', en: 'On the metro' },
      },
      care: {
        'zh-TW': '量的是各種來源的 PM2.5，只有早上的一個小時。騎機車和走路的差別，統計上分不出來。量的是騎士自己吸到的，不是站在機車旁邊的行人。',
        en: 'It is PM2.5 from all sources, over one morning hour only. The difference between riding a scooter and walking was not statistically significant. It is what riders themselves breathed, not a pedestrian standing beside the scooters.',
      },
    },
    next: { 'zh-TW': '戴口罩，擋得住嗎？', en: 'Would a mask stop it?' },
  },

  // 10 ────────────────────────────────────────────────────────────────────────────────────────
  // Brief 12.2, from research/masks/VERIFIED.json. Obey its must-not-say list: never "masks are
  // useless", never a filter-material percentage, never that activated carbon blocks exhaust or
  // carbon monoxide, no advice to put an N95 on a child.
  s10: {
    chapter: { 'zh-TW': '口罩擋得住嗎', en: 'Do masks help?' },
    headline: { 'zh-TW': '醫用口罩|擋不住機車廢氣', en: 'A surgical mask |won’t stop scooter exhaust' },
    body: {
      'zh-TW': '廢氣裡的一氧化碳和苯是氣體，一般口罩擋不住氣體。細小的微粒，也會從口罩邊緣漏進去。',
      en: 'The carbon monoxide and benzene in exhaust are gases, and ordinary masks do not stop gases. Fine particles also leak in round the edges.',
    },
    quiet: { 'zh-TW': '口罩防感冒、流感還是有用。', en: 'A mask still helps against colds and flu.' },
    switch: { 'zh-TW': '換一種口罩看看', en: 'Try another mask' },
    /** The switch's short labels: the distinguishing word, then the noun underneath. */
    masks: {
      cloth: { label: { 'zh-TW': '布', en: 'Cloth' }, sub: { 'zh-TW': '口罩', en: 'mask' } },
      surgical: { label: { 'zh-TW': '醫用', en: 'Surgical' }, sub: { 'zh-TW': '口罩', en: 'mask' } },
      carbon: { label: { 'zh-TW': '活性碳', en: 'Carbon' }, sub: { 'zh-TW': '口罩', en: 'mask' } },
      n95: { label: { 'zh-TW': '貼合的', en: 'Fitted' }, sub: { 'zh-TW': 'N95', en: 'N95' } },
    },
    sheet: {
      heads: [
        { 'zh-TW': '誰說的', en: 'Who says so' },
        { 'zh-TW': '四種口罩，擋得住什麼', en: 'Four masks: what each one stops' },
        { 'zh-TW': '要小心的地方', en: 'What to be careful about' },
      ],
      who: {
        'zh-TW': '美國職業安全衛生研究所說明：一氧化碳這類氣體和油氣（沒燒完的汽油），連 N95 都擋不住，它只過濾微粒。照同樣的道理，醫用口罩和布口罩也沒有吸附氣體的材料；這一句是我們的推論。',
        en: 'The US occupational-safety institute, NIOSH, states that N95-type respirators filter particles only: they do not stop gases such as carbon monoxide, or petrol vapour. By the same reasoning, surgical and cloth masks have no gas-absorbing layer either; that part is our inference.',
      },
      cols: {
        mask: { 'zh-TW': '口罩', en: 'Mask' },
        gases: { 'zh-TW': '氣體', en: 'Gases' },
        ultrafine: { 'zh-TW': '很小的微粒（超細微粒）', en: 'The smallest particles (ultrafine)' },
        pm25: { 'zh-TW': 'PM2.5', en: 'PM2.5' },
      },
      /** The four rows of VERIFIED.json → tableRows, in the same order, cell for cell. */
      rows: {
        cloth: {
          mask: { 'zh-TW': '布口罩', en: 'Cloth mask' },
          gases: { 'zh-TW': '擋不住', en: 'None' },
          ultrafine: { 'zh-TW': '幾乎擋不住（大多穿過布，或從邊緣進去）', en: 'Very little (most passes through the cloth and round the edges)' },
          pm25: { 'zh-TW': '擋住一點，漏很多', en: 'A little; it leaks a lot' },
        },
        surgical: {
          mask: { 'zh-TW': '醫用口罩', en: 'Surgical mask' },
          gases: { 'zh-TW': '擋不住', en: 'None' },
          ultrafine: { 'zh-TW': '擋住一些，邊緣會漏', en: 'Some; it leaks at the edges' },
          pm25: { 'zh-TW': '擋住一些，邊緣會漏', en: 'Some; it leaks at the edges' },
        },
        carbon: {
          mask: { 'zh-TW': '活性碳口罩', en: 'Activated-carbon mask' },
          gases: { 'zh-TW': '一氧化碳：擋不住。苯和其他油氣：吸住一點，撐不久（常常只有幾分鐘）', en: 'Carbon monoxide: none. Benzene and other vapours: a little, briefly, often only minutes' },
          ultrafine: { 'zh-TW': '和它底下那層口罩一樣（醫用口罩那種：擋住一些，邊緣會漏）', en: 'The same as the mask it is built on (surgical type: some; it leaks at the edges)' },
          pm25: { 'zh-TW': '和它底下那層口罩一樣（醫用口罩那種：擋住一些，邊緣會漏）', en: 'The same as the mask it is built on (surgical type: some; it leaks at the edges)' },
        },
        n95: {
          mask: { 'zh-TW': '貼合的 N95', en: 'Fitted N95' },
          gases: { 'zh-TW': '擋不住', en: 'None' },
          ultrafine: { 'zh-TW': '戴得貼合的話，擋住大部分', en: 'Most, if it fits' },
          pm25: { 'zh-TW': '戴得貼合的話，擋住大部分', en: 'Most, if it fits' },
        },
      },
      taiwan: { 'zh-TW': '台灣做過的兩個測試', en: 'Two tests done in Taiwan' },
      /** Always with its year (must-not-say: never as if it described today's products). */
      mol: {
        'zh-TW': '2005 年，勞委會的勞工安全衛生研究所測了 {tested} 款拋棄式活性碳口罩：國家標準要求擋得住有機溶劑的蒸氣 {min} 分鐘，{result}。',
        en: 'In 2005 the labour ministry’s occupational-safety institute tested {tested} disposable activated-carbon masks against the national standard of {min} minutes’ protection from organic solvent vapour: {result}.',
      },
      molNone: { 'zh-TW': '沒有一款做到', en: 'none met it' },
      molSome: { 'zh-TW': '有 {passed} 款做到', en: '{passed} met it' },
      /** A comparison between masks, never a percentage. */
      ilosh: {
        'zh-TW': '勞動部勞動及職業安全衛生研究所（勞安所）找 {people} 位大人實測，給每種口罩一個防護分數：頭帶式 N95 是 {n95}，一般醫用口罩是 {medical}。這是拿來互相比較的分數，不是百分比。',
        en: 'The labour ministry’s institute tested {people} adults and gave each mask a protection score: {n95} for a headband N95, {medical} for an ordinary medical mask. The scores compare masks with each other; they are not percentages.',
      },
      care: {
        'zh-TW': '口罩防感冒、流感還是有用，戴得貼合的 N95 也能少吸一些微粒。只是日常戴的口罩，都擋不住廢氣裡的氣體。',
        en: 'Masks still help against colds and flu, and an N95 that fits cuts the particles you breathe. But no everyday mask stops the gases in exhaust.',
      },
      more: { 'zh-TW': '口罩的完整說明', en: 'More about masks' },
    },
    next: { 'zh-TW': '那這一團，可以變小嗎？', en: 'So can the cloud be made smaller?' },
  },

  // 11 ────────────────────────────────────────────────────────────────────────────────────────
  s11: {
    chapter: { 'zh-TW': '換掉', en: 'Swap' },
    headline: { 'zh-TW': '換一輛電動的，|就少一根排氣管', en: 'Every electric scooter |is one tailpipe fewer' },
    body: {
      'zh-TW': '電動機車沒有排氣管。輪胎和煞車的粉塵還在，旁邊的汽車也還在。',
      en: 'An electric scooter has no tailpipe. Tyre and brake dust stay, and so do the cars beside it.',
    },
    /** The chip under the slider: the number is rewritten by the slider (n × 10); then the label 本站計算 and the assumption. */
    assume: { 'zh-TW': '假設每輛機車排得一樣多', en: 'assuming every scooter emits the same' },
    chipBefore: { 'zh-TW': '機車排的廢氣：少 ', en: 'Scooter exhaust: ' },
    chipAfter: { 'zh-TW': '%', en: '% less' },
    /** The chip when every scooter is electric (the slider's resting value). */
    chipAll: { 'zh-TW': '機車排的廢氣：全部沒有了', en: 'Scooter exhaust: none left' },
    sheet: {
      used: {
        'zh-TW': '圖上的 {total} 輛機車，先當成每一輛排的廢氣一樣多。',
        en: 'The {total} scooters in the picture, each taken to give off the same amount of exhaust.',
      },
      how: {
        'zh-TW': '每換一輛電動機車，這一排機車排的廢氣就少十分之一。全部換完，機車排的廢氣就沒有了。',
        en: 'Each scooter that goes electric takes a tenth off what this row gives off. Swap them all and the scooters’ exhaust is gone.',
      },
      care: {
        'zh-TW': '其實每輛排得不一樣多，下一張圖會講。輪胎和煞車的粉塵、旁邊汽車的廢氣都還在；發電也有排放，只是不在路口。',
        en: 'In fact scooters do not all emit the same, as the next picture shows. Tyre and brake dust and the cars’ exhaust remain; generating the electricity has emissions too, but not at the junction.',
      },
      /** Printed only while liou-wu-2021-electric-scooter-benefit is verified. */
      national: {
        'zh-TW': '全台灣來看：一項台灣的模式研究估計，燃油機車都換成電動機車，每年可以少掉大約 {usd} 億美元（約新台幣 {ntd} 億元）的健康損失。',
        en: 'For Taiwan as a whole: a Taiwanese modelling study estimated that switching every petrol scooter to electric would avoid about US${usd} billion (about NT${ntd} billion) a year of harm to health.',
      },
    },
    next: { 'zh-TW': '還沒要換車呢？', en: 'Not switching yet?' },
  },

  // 12 ────────────────────────────────────────────────────────────────────────────────────────
  s12: {
    /** Beside the chip: what the percentage is. */
    shareLabel: { 'zh-TW': '占一氧化碳{share}', en: '{share} of the carbon monoxide' },
    chapter: { 'zh-TW': '還沒要換車', en: 'Not switching yet' },
    headline: { 'zh-TW': '還沒要換車？|有一件事也很有用', en: 'Not switching yet? |One thing still helps a lot' },
    /** 「三分之一到快一半」 is checked against inspect.top10share at build time. */
    body: {
      'zh-TW': '定檢讀數裡，排最多的一成，占了全部一氧化碳的三分之一到快一半。準時定檢、該修就修，路口就少一大團。',
      en: 'In Taiwan’s inspection readings, the highest tenth account for a third to nearly half of all the carbon monoxide. Get inspected on time and fix what fails, and a big cloud leaves the junction.',
    },
    sheet: {
      used: {
        'zh-TW': '環境部的機車定檢紀錄：一年大約 {readings} 萬筆一氧化碳讀數。',
        en: 'The environment ministry’s scooter inspection records: about {readings} million idle carbon monoxide readings a year.',
      },
      how: {
        'zh-TW': '把讀數從高排到低，最高的一成加起來，占全部一氧化碳的{share}。',
        en: 'Rank the readings from highest to lowest: the top tenth together hold {share} of all the carbon monoxide.',
      },
      care: {
        'zh-TW': '圖上那一輛沒有畫騎士：這說的是車該修了，不是在說誰。',
        en: 'The scooter in the picture has no rider on it: this is about a machine that needs repair, not about a person.',
      },
      ride: { 'zh-TW': '我騎車，可以做什麼', en: 'I ride: what I can do' },
    },
    next: { 'zh-TW': '換一輛，要多少錢？', en: 'What does one cost?' },
  },

  // 13 ────────────────────────────────────────────────────────────────────────────────────────
  // Headline, big figure, body and deadline strip come from the calculator's figures by the
  // written rules; their words are open.* in ./electric.ts.
  s13: {
    chapter: { 'zh-TW': '買的那天', en: 'The day you buy' },
    county: { 'zh-TW': '縣市', en: 'Place' },
    /** In front of the big figure: 電動機車 少付 2,120 元 / The electric scooter costs NT$2,120 less. */
    figWho: { 'zh-TW': '電動機車', en: 'The electric scooter costs' },
    scrap: { 'zh-TW': '有沒有滿 10 年的機車可以報廢？', en: 'A scooter ten or more years old to scrap?' },
    scrapYes: { 'zh-TW': '可報廢', en: 'One to scrap' },
    scrapYesSub: { 'zh-TW': '有滿 10 年的機車', en: '10 or more years old' },
    scrapNo: { 'zh-TW': '沒有', en: 'Nothing' },
    scrapNoSub: { 'zh-TW': '可報廢的機車', en: 'to scrap' },
    /** Without scripting the page shows the default case only. */
    fixed: { 'zh-TW': '{county}・{scrap}', en: '{county}, {scrap}' },
    bodyClass: {
      'zh-TW': '最便宜的綠牌車，比 125cc 小一級，',
      en: 'The cheapest green-plate scooter, a class below a 125 cc.',
    },
    /** Added by rule when that scooter can only swap batteries. */
    swapOnly: {
      'zh-TW': '只能換電池、付月費。',
      en: 'It only swaps batteries, so it needs a battery plan.',
    },
    /** The least favourable case in the table, named as such (the screen's word budget is 45 characters). */
    worst: { 'zh-TW': '最不划算：{county}、{scrap}、最便宜的{plate}，多付 {n}。', en: 'Worst case: {county}, {scrap}, the cheapest {plate} model: {n} more.' },
    worstScrapYes: { 'zh-TW': '可報廢', en: 'one to scrap' },
    worstScrapNo: { 'zh-TW': '沒車報廢', en: 'nothing to scrap' },
    sheet: {
      title: { 'zh-TW': '這個價錢，|是怎麼算的', en: 'How this price |was worked out' },
      used: {
        'zh-TW': '車廠公布的定價，加上中央和這個縣市的補助、車廠折扣和減稅。兩邊都挑扣完以後最便宜的一輛。',
        en: 'The makers’ list prices, with central and local subsidies, makers’ discounts and tax cuts. On each side we take the scooter that is cheapest once everything is taken off.',
      },
      electric: { 'zh-TW': '電動機車（{plate}）', en: 'Electric scooter ({plate})' },
      petrol: { 'zh-TW': '125cc 燃油機車', en: '125 cc petrol scooter' },
      list: { 'zh-TW': '定價', en: 'List price' },
      paid: { 'zh-TW': '實付', en: 'Price paid' },
      none: { 'zh-TW': '沒有可以扣的補助或優惠', en: 'No subsidy or offer to take off' },
      upTo: { 'zh-TW': '（最多）', en: ' (up to)' },
      care: {
        'zh-TW': '每一筆補助都有條件，名額用完就沒有；大多要先付錢，核准以後才拿到。環境部的減碳獎勵和空污補助能不能一起領，買之前先跟車行確認。牌照和保險另外算。',
        en: 'Every subsidy has conditions and runs out when its quota is used; most are paid back after approval, so you pay first. Check with the dealer before you buy whether the environment ministry’s carbon reward and its air-quality subsidy can both be claimed. Plates and insurance are extra.',
      },
    },
    next: { 'zh-TW': '每個月呢？', en: 'And each month?' },
  },

  // 14 ────────────────────────────────────────────────────────────────────────────────────────
  s14: {
    chapter: { 'zh-TW': '每個月', en: 'Each month' },
    km: { 'zh-TW': '每個月騎多遠？', en: 'How far do you ride a month?' },
    /** Assembled from the slots: {home} is 「約 22 到 28 元」, {petrol} 「194 元」. The screen's name and its body say it is per month. */
    headline: { 'zh-TW': '在家充電|{home}，|加油約 {petrol}', en: 'Charging at home: |{home} a month. |Petrol: about {petrol}' },
    kmUnit: { 'zh-TW': '公里', en: 'km' },
    bodyKm: { 'zh-TW': '這是每月騎 {km} 公里的算法。', en: 'This is for {km} km a month.' },
    /** Chosen by rule: the cheapest way to swap against the petrol bill. */
    swapDearer: {
      'zh-TW': '只能換電池的人，最便宜也要每月 {n}，比油錢貴。',
      en: 'If you can only swap batteries, the cheapest way is {n} a month, more than petrol.',
    },
    swapCheaper: {
      'zh-TW': '只能換電池的人，最便宜每月 {n}，比油錢便宜。',
      en: 'If you can only swap batteries, the cheapest way is {n} a month, less than petrol.',
    },
    sheet: {
      title: { 'zh-TW': '每個月的錢，|是怎麼算的', en: 'How the monthly cost |was worked out' },
      used: {
        'zh-TW': '油價、電價、每公里用掉多少油和電，還有各家換電方案的月租。每一個都有出處。',
        en: 'The petrol price, the electricity price, the fuel and power used per kilometre, and each battery-swap plan’s monthly fee. Each has a source.',
      },
      how: {
        'zh-TW': '每個月騎的公里數，乘上每公里的油錢或電費；換電再加上月租。',
        en: 'The kilometres you ride in a month times the petrol or power cost per kilometre; battery swapping adds the plan’s fee.',
      },
    },
    mine: { 'zh-TW': '算我自己的', en: 'Work out mine' },
    next: { 'zh-TW': '然後呢？', en: 'And then?' },
  },

  // 15 ────────────────────────────────────────────────────────────────────────────────────────
  s15: {
    chapter: { 'zh-TW': '下一個紅燈', en: 'The next red light' },
    headline: { 'zh-TW': '下一個紅燈，|可以少掉這一團', en: 'The next red light |could come without this cloud' },
    body: {
      'zh-TW': '差別只在旁邊那一排有沒有排氣管。選你的縣市，半分鐘算出換一輛要多少錢。',
      en: 'The only difference is whether the row beside you has tailpipes. Pick your county and in half a minute you will know what a switch costs.',
    },
    start: { 'zh-TW': '開始算', en: 'Work it out' },
    /** '|' marks where a button's words may break. */
    line: { 'zh-TW': '傳給家人|（LINE）', en: 'Send to family |(LINE)' },
    act: { 'zh-TW': '還沒要換車，|可以做什麼', en: 'Not switching? |What you can do' },
    more: { 'zh-TW': '看完以後', en: 'After the story' },
    sheet: {
      title: { 'zh-TW': '這張圖，|是怎麼畫的', en: 'How this picture |was drawn' },
      used: {
        'zh-TW': '同一個路口、同樣的 {n} 輛機車，全部換成電動機車。',
        en: 'The same junction and the same {n} scooters, every one of them electric.',
      },
      how: {
        'zh-TW': '機車排的廢氣沒有了，所以路邊多出來的那一層、排氣管旁邊的深色都不畫。街上原本就有的稀疏圈圈、汽車的廢氣、輪胎的粉塵還在。',
        en: 'With no scooter exhaust, the added layer at the kerb and the dark patches at the tailpipes are not drawn. The street’s own sparse rings, the car’s exhaust and the dust at the tyres remain.',
      },
      care: {
        'zh-TW': '這是示意圖，不是預測：要每一輛都換，才是圖上的樣子。發電也有排放，只是不在路口。',
        en: 'This is an illustration, not a forecast: it looks like this only when every scooter has switched. Generating the electricity has emissions too, but not at the junction.',
      },
    },
  },
});
