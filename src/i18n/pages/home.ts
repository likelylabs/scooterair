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
      'zh-TW': '等紅燈時，旁邊機車的廢氣有多少？對身體有什麼影響？換電動機車要多少錢？一張圖講一件事，看懂路口的空氣污染。',
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
    /** statements-smell smell-comes-with-benzene: the strongest allowed line. Its 推估 and its condition are body line 1; no-smell-not-clean is body line 2 (same view). */
    headline: { 'zh-TW': '聞到的不是苯，|但苯跟著一起來', en: 'What you smell is not benzene, |but benzene comes with it' },
    /** One idea per line (printed as separate lines, so one more line can follow without a rewrite). */
    body: [
      /** what-is-in-it, short form: the "if", 推估, the first names in the signed statement's own order, benzene glossed once in plain words. The line links to /questions/smell/ (the full answer, with what the IARC groups mean). */
      { 'zh-TW': '推估：如果你聞到的是身旁機車的廢氣，裡面也有苯（ㄅㄣˇ，廢氣的一種）、甲醛等十幾種成分。', en: 'Estimate: if what you smell is the exhaust of the scooters beside you, that air also holds benzene (a gas in exhaust), formaldehyde and about ten other exhaust chemicals.' },
      /** no-smell-not-clean (its carbon monoxide and particle halves are the picture's labels). */
      { 'zh-TW': '聞不到，不代表空氣乾淨。', en: 'No smell does not mean clean air.' },
    ],
    /** alwaysCarry plus[2]: the shares come from older engines. */
    quiet: { 'zh-TW': '這些成分各占多少，是量舊型機車得來的；新型機車可能不一樣。', en: 'The shares come from tests of older scooters; newer ones may differ.' },
    /** Beside the drawn can; the range and the 推估 chip follow it. */
    canLabel: { 'zh-TW': '一輛機車等一個紅燈，排出的一氧化碳', en: 'Carbon monoxide from one scooter through one red light' },
    sheet: {
      title: { 'zh-TW': '一個鋁罐的一氧化碳，|和那個味道', en: 'A drinks can of carbon monoxide, |and that smell' },
      measured: {
        'zh-TW': '環境部的機車定檢，一年大約 {readings} 萬筆一氧化碳讀數。廢氣裡有哪些成分、各占多少，用的是台灣、印度、尼泊爾量的舊型機車（化油器或沒有觸媒）；新型機車可能不一樣。',
        en: 'Taiwan’s scooter inspections: about {readings} million carbon monoxide readings a year. Which chemicals the exhaust holds, and how much of each, comes from older scooters measured in Taiwan, India and Nepal (carburetted or without a catalyst); newer scooters may differ.',
      },
      /** statements-smell not-unburnt-petrol and the basis of smell-comes-with-benzene. No cancer word here (must-not 1). */
      smell: {
        'zh-TW': '推估：聞到的不是苯。苯要百萬分之幾才聞得到，路邊的苯遠遠不到那麼濃。那個刺鼻的味道，有一部分比較可能來自燃燒時產生的醛（ㄑㄩㄢˊ）類，不是沒燒完的汽油；這只能粗略估計，可能差到十倍左右。味道和苯是從同一團廢氣出來的，所以只要那個味道來自身旁的機車，苯就在同一口空氣裡。',
        en: 'Estimate: what you smell is not benzene. Benzene can only be smelled at parts per million, and at the kerb it is nowhere near that. Part of the sharp smell more likely comes from aldehydes formed by burning, not from unburnt petrol; this is only a rough estimate, within about ten times. The smell and the benzene come out of the same exhaust, so whenever the smell comes from the scooters beside you, benzene is in the same breath of air.',
      },
      /** statements-smell hazard-labels, verbatim: its own paragraph, in a different block from every smell sentence, no number. */
      hazard: {
        'zh-TW': '世界衛生組織的癌症研究機構（IARC）把苯、1,3-丁二烯、甲醛列為「確定會讓人致癌」的第1類。這是說「證據有多強」，不是說等一個紅燈會有多少風險。汽油引擎廢氣整體被列為第2B類（「可能致癌」）。',
        en: 'The World Health Organization’s cancer agency (IARC) puts benzene, 1,3-butadiene and formaldehyde in Group 1, ‘causes cancer in humans’. That describes how strong the evidence is, not the risk from waiting at one red light. Petrol-engine exhaust as a whole is Group 2B, ‘possibly causes cancer’.',
      },
      smellLink: { 'zh-TW': '完整的說明：那個味道是什麼？', en: 'The full answer: what is that smell?' },
      method: { 'zh-TW': '味道推估的方法（研究檔案，英文）', en: 'How the smell was estimated (research file)' },
      can: {
        'zh-TW': '常溫下這些一氧化碳{litres}，一個鋁罐是 {ml} 毫升，所以是{cans}。',
        en: 'At room temperature that carbon monoxide takes up {litres}. A drinks can holds {ml} mL, so it is {cans}.',
      },
      care: {
        'zh-TW': '這是全台灣機車的平均：新車排得少，騎了很多年的車排得多。',
        en: 'This is an average over Taiwan’s scooters: new ones give off less, ones ridden for many years more.',
      },
    },
    next: { 'zh-TW': '排出來以後，去哪裡？', en: 'Where does it go?' },
  },

  // 3 ─────────────────────────────────────────────────────────────────────────────────────────
  s3: {
    chapter: { 'zh-TW': '排在哪裡', en: 'Where it goes' },
    headline: { 'zh-TW': '待轉區的機車，|排氣管就對著斑馬線', en: 'In the turn box, the tailpipes sit |right in front of the crossing' },
    body: {
      'zh-TW': '排氣管比膝蓋低（官方算的時候設在離地 {h} 公分），廢氣就排在腳邊。待轉區和斑馬線之間，規定只要留 {gap} 公分以上。',
      en: 'A tailpipe sits below knee height (the Institute of Transportation’s model puts it {h} cm up), so the exhaust comes out by your feet. The rules ask for at least {gap} cm between the turn box and the crossing.',
    },
    sheet: {
      title: { 'zh-TW': '這兩個 {gap} 公分，|是誰說的', en: 'Those two figures of {gap} cm: |who says so' },
      who: {
        'zh-TW': '交通部的標線規則；排氣管的高度，是交通部運輸研究所（運研所）算路口空氣的時候設定的。',
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
      'zh-TW': '機車越多，路邊的廢氣越濃。街上原本就有的空氣，圖上沒有畫。',
      en: 'More scooters, thicker exhaust at the kerb. The air the street already holds is not drawn.',
    },
    box: { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
    sheet: {
      title: { 'zh-TW': '這個範圍，|是怎麼來的', en: 'Where this range |comes from' },
      measured: {
        'zh-TW': '運研所在 {sites} 個路口的行人等候區放了儀器。其中 {n} 個路口，一氧化碳最高的一分鐘是 {lo} 到 {hi} ppm。',
        en: 'The Institute of Transportation put sensors where pedestrians wait at {sites} junctions. At {n} of them the highest minute of carbon monoxide read {lo} to {hi} ppm.',
      },
      care: {
        'zh-TW': '風一變，答案可以差到四倍。',
        en: 'A change in the wind can move the answer about four-fold.',
      },
    },
    next: { 'zh-TW': '那麼臭，超過指引值了嗎？', en: 'It smells awful. Is it over the WHO guideline?' },
  },

  // 5 ─────────────────────────────────────────────────────────────────────────────────────────
  s5: {
    chapter: { 'zh-TW': '超過指引值嗎', en: 'Over the WHO guideline?' },
    // headline: checkHeadlinePhrased() from src/data/estimate.ts, chosen by simBelowWho()
    // (src/data/simulation.ts): the smell is real, carbon monoxide has no smell, ONE red light
    // leaves the 15-minute average below the guideline. The picture is SimCompare (15-minute
    // averages only). The body says, one idea per line, what the headline does not cover:
    // Both lines sit under the screen's 推估 chip (「推估・電腦算的一個紅燈」, chips row); their full
    // forms (range, 1967/1970 thresholds, half a metre, rarity) are in the sheet and the chart.
    /** Statement 6, short form. */
    smell: { 'zh-TW': '風從機車吹來，大半時間聞得到。', en: 'With the wind from the scooters, you can smell it for most of the red.' },
    /** Statement 3, short form, with its key condition (every red for 15 minutes); links to /questions/my-child/#pushchair. */
    exception: { 'zh-TW': '例外：嬰兒車在排氣管正後方、幾乎沒風，15 分鐘每個紅燈都在，可能超過指引值。', en: 'The exception: a pushchair right behind a tailpipe, in almost no wind, through every red for 15 minutes, can pass the guideline.' },
    /** statements-smell no-smell-not-clean, its benzene half (one line at 360 px; the screen is at its height cap), under the 「仍低於指引值」 headline, so a glance
     *  does not leave with "below the limit, so fine". not-unburnt-petrol, in full with its order-of-magnitude hedge,
     *  is sheet.whatSmell on this screen and the answer on /questions/smell/#what. */
    quiet: { 'zh-TW': '推估：聞不到，也可能有苯。', en: 'Estimate: benzene can be there with no smell.' },
    sheet: {
      /** not-unburnt-petrol in full, with its mustCarry. No smell-chemical number here: this sheet carries 15-minute values (must-not 3). */
      whatSmell: {
        'zh-TW': '推估：那個味道比較可能來自燃燒時產生的醛（ㄑㄩㄢˊ）類，不是沒燒完的汽油；這只能粗略估計，可能差到十倍左右。在一群機車的情況裡，苯從來沒有濃到聞得出來。',
        en: 'Estimate: the smell more likely comes from aldehydes formed by burning, not from unburnt petrol; this is only a rough estimate, within about ten times. In the cases with a group of scooters, benzene never gets strong enough to be smelled.',
      },
      whatSmellLink: { 'zh-TW': '完整的說明：那個味道是什麼？', en: 'The full answer: what is that smell?' },
      /** Statement 6 in full (the screen's smell line is its short form). */
      smell: {
        'zh-TW': '推估：風整個紅燈從一群機車吹來時，紅燈大約一半到幾乎全部的時間，廢氣都多過一般人聞得到的量。「聞得到」的標準，來自 1967 和 1970 年汽車廢氣研究的摘要，只能說「風吹來時，很多秒聞得到」。',
        en: 'Estimate: when the wind blows from a group of scooters for the whole red, the exhaust is above what most people can smell for about half to nearly all of the red. What counts as ‘can smell it’ comes from abstracts of car-exhaust studies from 1967 and 1970; it supports only ‘smellable in many seconds when the wind blows from the scooters’.',
      },
      /** Why screen 5's numbers are higher than screen 4's (a reader compares the two). */
      higher: {
        'zh-TW': '這裡的數字比上面 90 秒的推估多：電腦算的是離機車半公尺、小孩和嬰兒車的高度，也算了風一直從機車吹來的紅燈；上面的推估只算大人鼻子的高度。',
        en: 'These numbers are higher than the 90-second estimate above: the simulation is half a metre from the scooters, at child and pushchair height, and includes reds with the wind held from the scooters; the estimate above is an adult’s nose height only.',
      },
      title: { 'zh-TW': '臭，和一氧化碳的|15 分鐘平均', en: 'The smell, and the 15-minute |carbon monoxide average' },
      who: {
        'zh-TW': '路口的行人等候區，是交通部運輸研究所（運研所）量的；平常的路邊，是環境部的交通測站。',
        en: 'The pedestrian waiting areas were measured by the Institute of Transportation; the ordinary roadside is the environment ministry’s traffic stations.',
      },
      sim: {
        'zh-TW': '我們用電腦，把紅燈時路邊的風和廢氣，一秒一秒算出來。每種情況算一個紅燈，再換成 15 分鐘的平均，才拿來和指引值比。',
        en: 'On a computer, we worked out the wind and the exhaust at the kerb, second by second through a red light. Each case is one red light, turned into a 15-minute average before it is set against the guideline.',
      },
      pushchair: {
        'zh-TW': '嬰兒車那一列：嬰兒車停在一輛機車排氣管正後方約半公尺，幾乎沒有風、風向也不變，連續 15 分鐘每個紅燈都在。這種風很少見。往旁邊移開半公尺，或到小孩站著的高度，就沒有了。',
        en: 'The pushchair row: a pushchair half a metre directly behind one scooter’s tailpipe, in almost no wind that keeps its direction, through every red for 15 minutes. Such a wind is rare. Half a metre to the side, or up to a standing child’s height, and it is gone.',
      },
      bursts: {
        'zh-TW': '靠近排氣管時，一氧化碳是一陣一陣的。一秒的量不能拿來和 15 分鐘的指引值比；一秒一秒的樣子，請看「電腦算的一個紅燈」。',
        en: 'Near a tailpipe, carbon monoxide comes in bursts. A one-second level cannot be set against a 15-minute guideline; for the second-by-second picture, see ‘One red light, simulated’.',
      },
      care: {
        'zh-TW': '推估，信心低到中：每種情況只算了一個紅燈。嬰兒車那一列最沒把握：電腦裡的空氣比平常更靜，所以可能算高了。',
        en: 'Estimate, low to moderate confidence: each case is one simulated red light. The pushchair row is the least certain: the air in the model is stiller than usual, so it may be too high.',
      },
      table: { 'zh-TW': '圖上的數字', en: 'The numbers on the chart' },
    },
    next: { 'zh-TW': '天天吸進去的，會跑到哪裡？', en: 'Day after day, where does it all go?' },
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
      nose: { 'zh-TW': '鼻子、喉嚨：刺鼻的氣體會到這裡，吸得夠多會刺激鼻子和喉嚨。', en: 'Nose and throat: the sharp-smelling gases reach here; enough of them irritates the nose and throat.' },
      lungs: { 'zh-TW': '肺：很小的微粒，可以進到肺的深處。', en: 'Lungs: very small particles reach deep into the lungs.' },
      blood: { 'zh-TW': '血液：一氧化碳從肺進到血液，占掉載氧氣的位子。', en: 'Blood: carbon monoxide passes from the lungs into the blood and takes up room meant for oxygen.' },
    },
    sheet: {
      who: {
        'zh-TW': '美國健康效應研究所整理了 {n} 篇長期研究。研究的是長年住在車多的地方、吸車子廢氣的人。',
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
        'zh-TW': '圖上三個號碼，是這些東西進到身體以後去的地方。一氧化碳要很多，才會明顯占掉載氧氣的位子。',
        en: 'The three numbers in the picture show where these things go in the body. It takes a lot of carbon monoxide to take up much of the room meant for oxygen.',
      },
      /** Statement 1 with its range ({range} is the EstimateValue of sim.co.oneRed15). */
      routesCo: {
        'zh-TW': '推估：在一般的街上等一個紅燈，一氧化碳的 15 分鐘平均多{range}，比世界衛生組織的指引值低很多；排氣管正後方、幾乎沒風時，最多約 {near} ppm。只有一個少見的例外：嬰兒車停在排氣管正後方，寫在「怎麼算的」那一頁。',
        en: 'Estimate: waiting one red light on an ordinary street adds {range} to your 15-minute carbon monoxide average, far below the WHO guideline; right behind a tailpipe in almost no wind, up to about {near} ppm. There is one rare exception, a pushchair right behind a tailpipe: see the ‘How we worked it out’ page.',
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
     * The hours themselves are printed on the picture (RoadOfTime); the second sentence is the
     * assumption, ui.ts redHoursSentence, the same words as the film's transcript.
     */
    body: {
      2: { 'zh-TW': '一天等兩個紅燈，一年就在路邊站了半天到快一天。', en: 'Two red lights a day: half a day to nearly a whole day at the kerb each year.' },
      4: { 'zh-TW': '一天等四個紅燈，一年就在路邊站了一整天到一天半。', en: 'Four red lights a day: one to one and a half whole days at the kerb each year.' },
      6: { 'zh-TW': '一天等六個紅燈，一年就在路邊站了一天半到兩天多。', en: 'Six red lights a day: one and a half to more than two whole days at the kerb each year.' },
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
        'zh-TW': '整天在路邊工作的人就不一樣，像交通警察、攤販、導護。一個紅燈接一個紅燈，加起來就像一直待在路邊。',
        en: 'It is different for people who work at the kerb all day, such as traffic police, street vendors and crossing guards. One red light after another adds up to standing in it all the time.',
      },
      /** Statement 8, one idea per line; {times} is the EstimateValue of sim.benzene.stay1hTimes. */
      stayers: [
        { 'zh-TW': '推估：在路口待上一小時的人，如果風一直從機車吹來，', en: 'Estimate: for people who stay an hour at a junction, with the wind always from the scooters,' },
        { 'zh-TW': '苯（ㄅㄣˇ）的一小時平均，可能是美國加州 1 小時參考值的{times}。', en: 'the 1-hour benzene average can be {times} California’s 1-hour reference level.' },
        { 'zh-TW': '這個參考值雖然叫 1 小時，是用 6 小時的資料訂的。機車廢氣裡有多少苯，我們不太確定，可能差到 5 到 10 倍。這不是在說等一個紅燈的人。', en: 'That reference is called 1-hour but was set from 6-hour data. We are not sure how much benzene scooter exhaust holds; it could be off five- to ten-fold. This is not about someone waiting one red.' },
      ],
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
    /** Statement 5 (replaces K4, whose 「多多少，還算不出來」 the simulation has answered). */
    quiet: { 'zh-TW': '推估：風從機車吹來，嬰兒車高度的廢氣是大人一到兩倍；換風向就不一定。', en: 'Estimate: with the wind from the scooters, pushchair height gets between about the same as an adult’s nose and about twice as much. Not in every wind.' },
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
        'zh-TW': '這是一整天的平均，用美國的資料算的，不是在路口量的。那個高度的空氣呢？本站的電腦推估：風從機車吹來時，嬰兒車高度和大人鼻子差不多到兩倍；排氣管正後方、幾乎沒風時更多。不是每種風都這樣。',
        en: 'These are whole-day averages from US data, not junction readings. And the air at that height? Our computer estimate: with the wind from the scooters, pushchair height gets between about the same as an adult’s nose and about twice as much; more right behind a tailpipe in still air. Not in every wind.',
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
        'zh-TW': '台北的研究人員找了一群健康的年輕人。他們在早上通勤的一個小時裡，身上帶著儀器。',
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
        en: 'It is PM2.5 from all sources, over one morning hour only. The gap between riding a scooter and walking could be chance (not statistically significant). It is what riders themselves breathed, not a pedestrian standing beside the scooters.',
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
    headline: { 'zh-TW': '口罩|擋不住廢氣裡的氣體', en: 'A mask |won’t stop the gases in exhaust' },
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
        'zh-TW': '美國職業安全衛生研究所說明了兩件事。一氧化碳這類氣體和油氣（沒燒完的汽油），連 N95 都擋不住。這種口罩只過濾微粒。照同樣的道理，醫用口罩和布口罩也沒有吸附氣體的材料；這一句是我們的推論。',
        en: 'The US occupational-safety institute, NIOSH, states that N95-type respirators filter particles only. They do not stop gases such as carbon monoxide, or petrol vapour. By the same reasoning, surgical and cloth masks have no gas-absorbing layer either; that part is our inference.',
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
        'zh-TW': '2005 年，勞委會的勞工安全衛生研究所測了 {tested} 款拋棄式活性碳口罩。國家標準要求，要擋得住有機溶劑的蒸氣 {min} 分鐘：{result}。',
        en: 'In 2005 the labour ministry’s occupational-safety institute tested {tested} disposable activated-carbon masks against the national standard of {min} minutes’ protection from organic solvent vapour: {result}.',
      },
      molNone: { 'zh-TW': '沒有一款做到', en: 'none met it' },
      molSome: { 'zh-TW': '有 {passed} 款做到', en: '{passed} met it' },
      /** A comparison between masks, never a percentage. */
      ilosh: {
        'zh-TW': '勞動部勞動及職業安全衛生研究所（勞安所）找 {people} 位大人實測。他們給每種口罩一個防護分數：頭帶式 N95 是 {n95}，一般醫用口罩是 {medical}。這是拿來互相比較的分數，不是百分比。',
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
        'zh-TW': '全台灣來看，有一項台灣的研究用電腦模式推估。燃油機車都換成電動機車，每年的健康損失可以少掉大約 {usd} 億美元（約 {ntd} 億元）。',
        en: 'For Taiwan as a whole, a Taiwanese modelling study estimated the gain. Switching every petrol scooter to electric would avoid about US${usd} billion (about NT${ntd} billion) a year of harm to health.',
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
    /** 「三成到快一半」 is checked against inspect.top10share at build time. */
    body: {
      'zh-TW': '定檢讀數裡，排最多的一成，占了全部一氧化碳的三成到快一半。準時定檢、該修就修，路口就少一大團。',
      en: 'In Taiwan’s inspection readings, the highest tenth account for 30% to nearly half of all the carbon monoxide. Get inspected on time and fix what fails, and a big cloud leaves the junction.',
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
        'zh-TW': '機車排的廢氣沒有了，所以機車那一團氣都不畫了。汽車的廢氣還在，圖上有畫。輪胎和煞車的粉塵也還在，只是看不到，所以沒有畫。街上原本就有的空氣，圖上本來就沒畫。',
        en: 'With no scooter exhaust, the scooters’ fume is gone from the picture. The car’s exhaust remains, and it is drawn. Dust from tyres and brakes remains too, but it is too fine to see, so it is not drawn. The air the street already holds is never drawn.',
      },
      care: {
        'zh-TW': '這是示意圖，不是預測：要每一輛都換，才是圖上的樣子。發電也有排放，只是不在路口。',
        en: 'This is an illustration, not a forecast: it looks like this only when every scooter has switched. Generating the electricity has emissions too, but not at the junction.',
      },
    },
  },
});
