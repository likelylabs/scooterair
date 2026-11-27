// Strings used inside illustrations (src/components/art/**), in both languages.
// Owned by the art lane. Same conventions as ui.ts: every value is an L10n
// pair; Chinese is written first, with full-width punctuation, at
// upper-primary reading level; English follows it sentence for sentence.
//
// Copy rules that bind these strings (docs/redesign-brief.md):
//  - the pictures draw ONLY the scooters' exhaust, as fume coming out of the
//    tailpipes and drifting to the people, never as symbols; the street's own
//    air is not drawn (the tag under every picture says so). Where people
//    stand, how thick the fume is follows the site's estimate (推估); the
//    dark patches at the tailpipes are drawn for the eye (5.1). Every alt text
//    says so (scene.ts → sceneAlt). What the fume holds is said in words;
//  - one word for the site's own air numbers: 推估. A scene never prints a
//    number itself: numbers come from src/data/estimate.ts (3.3);
//  - what the fume holds is named the same way everywhere: 油氣（沒燒完的汽油）
//    / fuel vapour, 一氧化碳 / carbon monoxide, 微粒 / particles (6.6);
//  - carbon monoxide, benzene and particles are never ranked by harm;
//  - "zero" is only ever a scooter's own exhaust: tyre and brake dust and the
//    other traffic stay in the electric pictures;
//  - riders are never blamed: 引擎沒熄火, never 騎士不熄火.
//
// The tag on every scene (示意圖｜廢氣其實大多看不見) and the sentence every
// alt text ends with live in ui.ts (`illustration`), shared with the film.
//
// Strings are in `alt2` and `fume`, then one group per scene (`words` to
// `measure2`), directly below.

import type { L10n, Locale } from './index';

export const art = {
  /**
   * Building blocks of a scene's alt text (scene.ts → sceneAlt): what the
   * picture shows (written by the scene), then the scenario, then one of the
   * closing sentences. The closing sentence for a scene with petrol scooters
   * is ui.ts → illustration.altNote; `pack` here repeats it word for word so
   * that this file can be loaded on its own by scripts and tests.
   */
  alt2: {
    scenario: {
      few: { 'zh-TW': '畫的是旁邊停了幾輛機車（{lo} 到 {hi} 輛）的情境。', en: 'It draws a few scooters beside you ({lo} to {hi}).' } as L10n,
      dozen: { 'zh-TW': '畫的是旁邊停了十來輛機車（{lo} 到 {hi} 輛）的情境。', en: 'It draws a dozen or so scooters beside you ({lo} to {hi}).' } as L10n,
      full: { 'zh-TW': '畫的是旁邊停滿機車（{lo} 到 {hi} 輛）的情境。', en: 'It draws a full box of scooters beside you ({lo} to {hi}).' } as L10n,
    },
    pack: {
      'zh-TW': '這是示意圖：人站的地方畫了多少，照本站的推估；排氣管後面的深色只是讓你看清楚，不照比例。',
      en: 'This is an illustration: how much is drawn where the people stand follows this site’s estimate; the dark patches at the tailpipes are drawn for the eye.',
    } as L10n,
    electric: {
      'zh-TW': '這是示意圖：電動機車沒有排氣管，所以沒有畫機車排的氣。街上原本就有的空氣，圖上沒有畫。',
      en: 'This is an illustration: electric scooters have no tailpipe, so no scooter exhaust is drawn. The air the street already holds is not drawn either.',
    } as L10n,
    plain: { 'zh-TW': '這是示意圖。', en: 'This is an illustration.' } as L10n,
  },

  /**
   * Words ON a picture, each at the end of a thin leader line that points into the fume. No key:
   * the picture names what it shows where it shows it. The screen that explains what is in the
   * fume carries the three `in*` labels on one fume; every other picture carries at most `label`
   * (or `carLabel`, on a picture whose only exhaust is a car's).
   */
  fume: {
    label: { 'zh-TW': '機車排的氣', en: 'Scooter exhaust' } as L10n,
    carLabel: { 'zh-TW': '汽車排的氣', en: 'Car exhaust' } as L10n,
    inVapour: { 'zh-TW': '油氣：聞得到', en: 'Fuel vapour: you can smell it' } as L10n,
    inCo: { 'zh-TW': '一氧化碳：聞不到', en: 'Carbon monoxide: no smell' } as L10n,
    inPm: { 'zh-TW': '微粒：小到看不到', en: 'Particles: too small to see' } as L10n,
  },

  /* ---------------------------------------------------------------------- */
  /* The picture-book scenes (brief 5.2). One group per scene.                */
  /* `alt` strings are what the picture shows; scene.ts adds the scenario and */
  /* the closing sentence.                                                    */
  /* ---------------------------------------------------------------------- */

  /** Words used in more than one scene. */
  words: {
    waiting: { 'zh-TW': '他也在等', en: 'They’re waiting too' } as L10n,
    /** The street scene's label, placed under the rider it names, pointing up at them. */
    waitingUp: { 'zh-TW': '↑ 他也在等', en: '↑ They’re waiting too' } as L10n,
    tailpipe: { 'zh-TW': '排氣管', en: 'Tailpipe' } as L10n,
    cm: { 'zh-TW': '公分', en: 'cm' } as L10n,
    oneMetre: { 'zh-TW': '1 公尺', en: '1 m' } as L10n,
    pushchair: { 'zh-TW': '嬰兒車', en: 'Pushchair' } as L10n,
    schoolchild: { 'zh-TW': '小學生', en: 'Schoolchild' } as L10n,
    adult: { 'zh-TW': '大人', en: 'Adult' } as L10n,
    rider: { 'zh-TW': '騎士', en: 'Rider' } as L10n,
    petrol: { 'zh-TW': '燃油機車', en: 'Petrol scooter' } as L10n,
    electric: { 'zh-TW': '電動機車', en: 'Electric scooter' } as L10n,
  },

  /** G1 and G14: the street at a red light, and the same street with the pedestrian signal green. */
  hero: {
    altRed: {
      'zh-TW': '路口的街景：紅燈，行人號誌倒數 {count}。阿嬤、推嬰兒車的大人和戴黃帽的小學生站在路邊，小學生用手摀著口鼻。旁邊停了 {n} 輛機車，排成三排，引擎沒熄火；每一根排氣管後面都有一團深色的廢氣。廢氣飄到等紅燈的人身上，圖上寫著「機車排的氣」。前排一位騎士掀起鏡片，看得到臉，旁邊寫著「他也在等」。',
      en: 'A junction at a red light; the pedestrian signal counts down from {count}. An older woman, an adult with a pushchair and a schoolchild in a yellow cap wait at the kerb; the child covers nose and mouth with a hand. Beside them {n} scooters stand three rows deep with their engines running, and behind every tailpipe there is a dark patch of exhaust. The exhaust drifts onto the people waiting, labelled “Scooter exhaust”. One front-row rider has the visor up and a face, labelled “They’re waiting too”.',
    } as L10n,
    altGreen: {
      'zh-TW': '同一個路口，行人號誌轉綠。旁邊的 {n} 輛都是電動機車，沒有排氣管，後面沒有那一團廢氣；最後一排的一輛，上面寫著「電動機車」。遠處有一輛汽車，車尾還有它自己的一小團廢氣，圖上寫著「汽車排的氣」。戴黃帽的小學生一腳踏上斑馬線。',
      en: 'The same junction with the pedestrian signal green. All {n} scooters beside the kerb are electric: no tailpipes and no cloud behind them, and one in the back row is labelled “Electric scooter”. A car further back still has its own small cloud, labelled “Car exhaust”. The schoolchild in the yellow cap steps onto the crossing.',
    } as L10n,
    counter: { 'zh-TW': '機車 {n} 輛', en: '{n} scooters' } as L10n,
  },

  /** G4: the kerb, close. */
  kerb: {
    alt: {
      'zh-TW': '路邊的近景。推嬰兒車的大人和用手摀著口鼻的小學生，站在左邊。最近一輛機車的車尾，就在右邊一兩步的地方。騎士也在畫面裡，後面還有別排的機車。每排機車後面有一團廢氣，飄到人站的地方。停的機車越多，人站的地方廢氣越濃；排氣管後面顏色最深。圖上寫著「機車排的氣」。',
      en: 'The kerb, close. An adult with a pushchair and a schoolchild covering nose and mouth stand on the left. The tail of the nearest scooter is a step or two to their right, with its rider in view and more rows behind. Each row of scooters leaves a soft plume of exhaust that reaches the people. The more scooters wait, the thicker the exhaust where the people stand, and it is darkest just behind the tailpipes. It is labelled “Scooter exhaust”.',
    } as L10n,
  },

  /** G2: one scooter, one fume, and what is in it. */
  tailpipe: {
    alt: {
      'zh-TW': '一輛燃油機車的側面，引擎沒熄火。排氣管後面有一團廢氣，貼著地面往後飄，有幾縷往上飄到一個人的鼻子前面。圖上寫著這團廢氣裡有什麼：油氣，聞得到；一氧化碳，聞不到；微粒，小到看不到。',
      en: 'One petrol scooter from the side, engine running. A cloud of exhaust leaves the tailpipe and drifts back along the ground, and a few wisps rise to a person’s nose. Words on the picture say what is in the cloud: fuel vapour, which you can smell; carbon monoxide, which has no smell; particles, too small to see.',
    } as L10n,
    /** added to the alt text when the drinks can is drawn above the picture */
    canAlt: { 'zh-TW': '上面畫了一個飲料罐，用來比一比有多少。', en: 'A drinks can is drawn above it, to give a sense of the amount.' } as L10n,
  },

  /** G3: the junction from above. */
  plan3: {
    alt: {
      'zh-TW': '從上面看的路口。左邊是停止線，後面停著機車；中間是斑馬線；右邊是待轉區。待轉區裡的機車，從上面看得到騎士的安全帽和握著把手的手，車尾朝著斑馬線。每個車尾後面有一團深色的廢氣，伸過那一小段空隙，飄到等過馬路的人那裡。空隙上標著「{gap}」。阿嬤、推嬰兒車的大人和戴黃帽的小學生，就站在斑馬線旁邊的路邊等。角落的小圖是一輛機車的側面：排氣管在一公尺的虛線下面，標著「{height}」。',
      en: 'The junction from above. On the left is the stop line with scooters behind it. In the middle is the crossing. On the right is the turn box. Its scooters, seen from above with each rider’s helmet and hands on the handlebars, have their tails toward the crossing, each with a dark patch of exhaust reaching across the small gap to the people waiting. The gap is marked “{gap}”. An older woman, an adult with a pushchair and a schoolchild in a yellow cap wait at the kerb beside the crossing. A small inset shows a scooter from the side: its tailpipe is under a dashed one-metre line, marked “{height}”.',
    } as L10n,
    turnBox: { 'zh-TW': '待轉區', en: 'Turn box' } as L10n,
    crossing: { 'zh-TW': '斑馬線', en: 'Crossing' } as L10n,
    stopLine: { 'zh-TW': '停止線', en: 'Stop line' } as L10n,
    waiting: { 'zh-TW': '等過馬路的人', en: 'People waiting to cross' } as L10n,
    gap: { 'zh-TW': '{cm} 公分以上', en: '{cm} cm or more' } as L10n,
    height: { 'zh-TW': '排氣管約 {cm} 公分', en: 'Tailpipe: about {cm} cm' } as L10n,
  },

  /** G6: where exhaust goes in the body. */
  body: {
    alt: {
      'zh-TW': '一個大人的頭和胸口，畫成號誌小人的樣子，看得到氣管、兩片肺和心臟。臉的前面有一團廢氣，從鼻子吸進去：橘色的幾縷油氣到鼻子和喉嚨；兩片肺裡有一層深色的煙灰（微粒）；淡淡的一層廢氣再進到心臟和血液（一氧化碳）。三個號碼標出這三個地方，旁邊寫著鼻子、喉嚨，肺，血液。圖上只畫它們去的地方，沒有畫任何疾病。',
      en: 'The head and chest of an adult, drawn like a signal figure, with the windpipe, both lungs and the heart showing. A cloud of exhaust in front of the face is breathed in through the nose. Orange wisps (fuel vapour) reach the nose and throat. A dark, sooty haze (particles) settles in both lungs. A faint haze of the exhaust goes on into the heart and the blood (carbon monoxide). Three numbers mark the three places, each with its name beside it: nose and throat, lungs, blood. The picture shows only where it goes; it draws no disease.',
    } as L10n,
    pins: {
      nose: { 'zh-TW': '鼻子、喉嚨', en: 'Nose and throat' } as L10n,
      lungs: { 'zh-TW': '肺', en: 'Lungs' } as L10n,
      blood: { 'zh-TW': '血液', en: 'Blood' } as L10n,
    },
  },

  /** G7: the road of time and the year strip. */
  road: {
    alt: {
      'zh-TW': '一條往遠處走的路，路邊有三個路牌，越遠時間越長：{a}、{b}、{c}。每個路牌有一個小圖：一條心跳的線，中間淺淺凹了一下；兩片肺；一本日曆。路的下面是一條用小時量的長條：一年加起來，在路邊站多久。',
      en: 'A road running into the distance with three signposts, each for a longer time than the last: {a}, {b}, {c}. Each has a small drawing: a heartbeat trace with one shallow dip; a pair of lungs; a calendar. Under the road, a bar measured in hours: how long a year of waiting adds up to at the kerb.',
    } as L10n,
    stripAlt: {
      'zh-TW': '一天等 {n} 個紅燈：一年約 {lo} 到 {hi} 小時。',
      en: '{n} red lights a day: about {lo} to {hi} hours a year.',
    } as L10n,
    days: { 'zh-TW': '一年加起來', en: 'Added up over a year' } as L10n,
    hours: { 'zh-TW': '約 {lo} 到 {hi} 小時', en: 'About {lo} to {hi} hours' } as L10n,
    hourUnit: { 'zh-TW': '小時', en: 'hours' } as L10n,
  },

  /** G8: heights on one ruler. */
  heights: {
    alt: {
      'zh-TW': '一把從地面量到 {top} 公分的尺。同一條地面上有四個人。他們是嬰兒車裡的寶寶、戴黃帽的小學生、大人，還有坐在機車上的騎士。機車的排氣管標了出來，它和寶寶都不到一公尺高。廢氣從排氣管飄過每一個人，從地面一直到大人的頭頂上面，沒有分層；排氣管旁邊最濃。圖上寫著「機車排的氣」。',
      en: 'A ruler from the ground to {top} cm. Four people stand on one ground line: a baby in a pushchair, a schoolchild in a yellow cap, an adult, and a rider seated on a scooter. The scooter’s tailpipe is labelled, and both it and the baby are less than a metre off the ground. The exhaust drifts from the tailpipe across all of them, from the ground to above the adult’s head, with no bands by height; it is thickest beside the tailpipe. It is labelled “Scooter exhaust”.',
    } as L10n,
    /** Short names under the four figures: they must fit side by side on a 320 px phone. */
    names: {
      pushchair: { 'zh-TW': '嬰兒車', en: 'Baby' } as L10n,
      schoolchild: { 'zh-TW': '小學生', en: 'Child' } as L10n,
      adult: { 'zh-TW': '大人', en: 'Adult' } as L10n,
      rider: { 'zh-TW': '騎士', en: 'Rider' } as L10n,
    },
  },

  /** G9: the rider. */
  riderScene: {
    alt: {
      'zh-TW': '排在第二排的一位騎士，鏡片掀起來，看得到臉。旁邊寫著「他也在等」。前面那輛機車的排氣管正對著這位騎士，前輪和腳都在那一團深色的廢氣裡；騎士自己的機車後面也有一團，圖上寫著「機車排的氣」。',
      en: 'A rider in the second row, visor up, face showing, labelled “They’re waiting too”. The tailpipe of the scooter in front points straight at them. Their front wheel and feet are in its dark patch of exhaust; their own scooter leaves a patch behind it too, labelled “Scooter exhaust”.',
    } as L10n,
  },

  /** G10: the swap slider. */
  swap: {
    alt: {
      'zh-TW': '路邊停了 {total} 輛機車，分成兩排，全部是電動機車。它們沒有排氣管，後面沒有廢氣；第一輛下面寫著「電動機車」。畫面邊緣有一輛汽車，後面有它自己的一小團廢氣，圖上寫著「汽車排的氣」。用圖下面的滑桿，可以一輛一輛換回燃油機車。每換回一輛，排氣管後面就多一團深色的廢氣。',
      en: '{total} scooters at the kerb in two rows, all electric. They have no tailpipe and nothing behind them; the first is labelled “Electric scooter”. A car at the edge of the picture has its own small cloud, labelled “Car exhaust”. With the slider under the picture you can turn them back into petrol scooters one at a time. Each one brings back a dark patch of exhaust behind its tailpipe.',
    } as L10n,
    question: { 'zh-TW': '{total} 輛裡，換幾輛電動機車？', en: 'Out of {total}, how many go electric?' } as L10n,
    value: { 'zh-TW': '{n} 輛電動、{rest} 輛燃油', en: '{n} electric, {rest} petrol' } as L10n,
    fewer: { 'zh-TW': '少換一輛', en: 'One fewer' } as L10n,
    more: { 'zh-TW': '多換一輛', en: 'One more' } as L10n,
  },

  /** G11: ten scooters, one to fix. */
  ten: {
    alt: {
      'zh-TW': '{total} 輛機車排成兩排。{rest} 輛的排氣管後面只有一小團廢氣；有一輛沒有騎士的機車，後面是一大團，上面寫著「該修的那一輛」。圖上所有的廢氣裡，大約 {share}% 是這一大團。按「{fix}」，這一團會縮成和別輛一樣的一小團。',
      en: '{total} scooters in two rows. {rest} of them leave only a small puff of exhaust; one, with no rider on it and labelled “This one needs repair”, leaves a big cloud. Of all the exhaust in the picture, about {share}% is that one cloud. Press “{fix}” and the cloud shrinks to a small puff like the others.',
    } as L10n,
    fix: { 'zh-TW': '修好它', en: 'Fix it' } as L10n,
    /** the words right above the scooter that needs repair (hidden once it is fixed) */
    label: { 'zh-TW': '該修的那一輛', en: 'This one needs repair' } as L10n,
    undo: { 'zh-TW': '再看一次修之前', en: 'Show it before the repair' } as L10n,
  },

  /** G17: what a mask stops. */
  mask: {
    alt: {
      'zh-TW': '一張戴著口罩的側臉，畫成號誌小人的樣子；左邊是一輛機車的車尾，看得到後輪和排氣管；排氣管排出一團廢氣，飄到臉前面。廢氣裡的氣體（一氧化碳）穿過口罩，進到鼻子後面的通道，畫成淡淡的一層；橘色的幾縷油氣也穿過去，到鼻子。口罩前面積了一層深色的煙灰，是擋下來的微粒；廢氣也從鼻子旁邊和臉頰的縫鑽進去（兩個小箭頭）。圖下面可以換四種口罩：布口罩、醫用口罩、活性碳口罩、貼合的 N95。擋得越多，口罩上的煙灰越深；不管哪一種，一氧化碳都穿過去。',
      en: 'A face in profile wearing a mask, drawn like a signal figure. On the left is the back of a scooter, its rear wheel and tailpipe; the tailpipe gives off a cloud of exhaust that drifts up to the face. The gases in it (carbon monoxide) go on through the mask into the airway behind the nose, drawn as a faint haze. Orange wisps of fuel vapour pass through to the nose too. A dark, sooty patch builds up on the front of the mask: the particles it stops. The exhaust also slips in at the gaps beside the nose and at the cheek (two small arrows). A switch under the picture changes the mask: cloth, surgical, activated carbon, fitted N95. The more a mask stops, the darker its soot; with every one of them the carbon monoxide passes through.',
    } as L10n,
    names: {
      cloth: { 'zh-TW': '布口罩', en: 'Cloth mask' } as L10n,
      surgical: { 'zh-TW': '醫用口罩', en: 'Surgical mask' } as L10n,
      carbon: { 'zh-TW': '活性碳口罩', en: 'Activated-carbon mask' } as L10n,
      n95: { 'zh-TW': '貼合的 N95', en: 'Fitted N95' } as L10n,
    },
    /** One line per mask, shown in the picture while that mask is chosen. From research/masks/VERIFIED.json → tableRows. */
    says: {
      cloth: { 'zh-TW': '氣體穿過去；微粒也大多穿過去', en: 'Gases pass through; so do most particles' } as L10n,
      surgical: { 'zh-TW': '氣體穿過去；微粒擋住一些，其他從邊緣漏進去', en: 'Gases pass through; some particles stop, the rest leak in at the edges' } as L10n,
      carbon: { 'zh-TW': '一氧化碳穿過去；油氣只擋住一點點，而且撐不久', en: 'Carbon monoxide passes through; a little vapour is held, and not for long' } as L10n,
      n95: { 'zh-TW': '氣體照樣穿過去；戴得貼合，微粒大多擋得住', en: 'Gases still pass through; if it fits, most particles stop' } as L10n,
    },
    gapNose: { 'zh-TW': '鼻子旁邊的縫', en: 'Gap beside the nose' } as L10n,
    gapCheek: { 'zh-TW': '臉頰的縫', en: 'Gap at the cheek' } as L10n,
  },

  /** The station picture for /questions/app/: why an air-quality app does not show a red light. */
  station: {
    alt: {
      'zh-TW': '路邊的一個空氣品質測站：一個箱子，進氣口在一根高高的管子頂端，標著「{inlet}」。旁邊的路邊，小學生和推嬰兒車的大人站在一輛機車的車尾後面；那一團深色的廢氣貼著地面，遠遠低於進氣口，圖上寫著「機車排的氣」。',
      en: 'An air-quality station beside the road: a cabinet whose inlet is at the top of a tall pipe, marked “{inlet}”. At the kerb beside it, a schoolchild and an adult with a pushchair stand behind the tail of a scooter. Its dark patch of exhaust stays near the ground, far below the inlet, labelled “Scooter exhaust”.',
    } as L10n,
    inletRange: { 'zh-TW': '進氣口：{lo} 到 {hi} 公尺高', en: 'Inlet: {lo} to {hi} m up' } as L10n,
    cabinet: { 'zh-TW': '測站', en: 'Station' } as L10n,
  },

  /** MeasurementDiagram (rebuilt on the new plan): where the instruments would go. Its other words are in `measure`, below. */
  measure2: {
    alt: {
      'zh-TW': '量測建議：同一張從上面看的路口圖，標了 {n} 個放儀器的位置：{list}。',
      en: 'A proposed measurement: the same junction from above, with {n} instrument positions marked: {list}.',
    } as L10n,
  },

  /** SmellStrip (V10) */
  smell: {
    canTitle: { 'zh-TW': '聞得到', en: 'You can smell' } as L10n,
    canBody: {
      'zh-TW': '你站在廢氣裡。臭的是沒燒完的汽油，和刺鼻的醛類。',
      en: 'You are standing in exhaust. The smell is unburnt petrol and sharp aldehydes.',
    } as L10n,
    cannotTitle: { 'zh-TW': '聞不到、|看不到', en: 'Can’t smell it, |can’t see it' } as L10n,
    cannotBody: {
      'zh-TW': '一氧化碳沒有味道。微粒太小，看不到。',
      en: 'Carbon monoxide has no smell. Particles are too small to see.',
    } as L10n,
    footer: { 'zh-TW': '味道是警報，不是量表。', en: 'Smell is an alarm, not a gauge.' } as L10n,
  },

  /** MeasurementDiagram (V35) */
  measure: {
    stamp: { 'zh-TW': '本站提議', en: 'Our proposal' } as L10n,
    whereTitle: { 'zh-TW': '放在哪裡', en: 'Where' } as L10n,
    points: [
      { 'zh-TW': '轉角，行人等綠燈的地方', en: 'On the corner, where people wait for the green' },
      { 'zh-TW': '待轉區旁', en: 'Beside the turn box' },
      { 'zh-TW': '停等區旁', en: 'Beside the stop box' },
      { 'zh-TW': '離路口遠的對照點', en: 'A control point away from the junction' },
    ] as L10n[],
    heightTitle: { 'zh-TW': '量兩個高度', en: 'At two heights' } as L10n,
    heightLow: { 'zh-TW': '約 0.6 公尺：嬰兒車的高度', en: 'About 0.6 m: pushchair height' } as L10n,
    heightHigh: { 'zh-TW': '約 1.5 公尺：大人的高度', en: 'About 1.5 m: adult height' } as L10n,
    whatTitle: { 'zh-TW': '量什麼', en: 'What' } as L10n,
    what: [
      { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
      { 'zh-TW': '苯和它的同類（BTEX）', en: 'Benzene and its relatives (BTEX)' },
      { 'zh-TW': '超細微粒有幾顆', en: 'Ultrafine particle number' },
    ] as L10n[],
    clockTitle: { 'zh-TW': '怎麼記錄', en: 'How' } as L10n,
    clock: {
      'zh-TW': '一秒記一筆，對上紅燈和綠燈；同時數每個紅燈停了幾輛機車；公開原始資料。',
      en: 'Second by second, matched to red and green; count the scooters stopped at each red; publish the raw data.',
    } as L10n,
    control: { 'zh-TW': '對照點', en: 'Control' } as L10n,
  },

  scooter: {
    gas: { 'zh-TW': '燃油機車', en: 'Petrol scooter' } as L10n,
    electric: { 'zh-TW': '電動機車', en: 'Electric scooter' } as L10n,
  },
} as const;

/** Fill {token}s in an art string. */
export function fill(value: L10n, locale: Locale, vars: Record<string, string | number> = {}): string {
  let s: string = value[locale];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
