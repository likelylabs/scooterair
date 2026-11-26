// Strings used inside illustrations (src/components/art/**), in both languages.
// Owned by the art lane. Same conventions as ui.ts: every value is an L10n
// pair; Chinese is written first, with full-width punctuation, at
// upper-primary reading level; English follows it sentence for sentence.
//
// Copy rules that bind these strings (docs/redesign-brief.md):
//  - the pictures DO show an amount now: sparse rings and dots are the
//    street's own air; where people stand there are more, by the site's
//    estimate (推估); the dark patches at the tailpipes are drawn for the eye
//    (5.1). Every alt text says so (scene.ts → sceneAlt);
//  - one word for the site's own air numbers: 推估. A scene never prints a
//    number itself: numbers come from src/data/estimate.ts (3.3);
//  - the three marks are named the same way everywhere: 油氣（沒燒完的汽油）
//    / fuel vapour, 一氧化碳 / carbon monoxide, 微粒 / particles (6.6);
//  - carbon monoxide, benzene and particles are never ranked by harm;
//  - "zero" is only ever a scooter's own exhaust: tyre and brake dust and the
//    other traffic stay in the electric pictures;
//  - riders are never blamed: 引擎沒熄火, never 騎士不熄火.
//
// The tag on every scene (示意圖｜廢氣其實大多看不見) and the sentence every
// alt text ends with live in ui.ts (`illustration`), shared with the film.
//
// The groups from `illustration` down to `cycle` serve the old scenes
// (StreetScene, PollutantKey, SceneCompare, SignalCycle, SmellStrip). They go
// when those components are deleted (brief 5.4, phase 3). New strings are in
// `alt2`, `marks` and `range`, then one group per scene (`words` to
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
      'zh-TW': '這是示意圖：人站的地方畫了多少，照本站的推估；排氣管旁邊的深色，是畫給眼睛看的。',
      en: 'This is an illustration: how much is drawn where the people stand follows this site’s estimate; the dark patches at the tailpipes are drawn for the eye.',
    } as L10n,
    electric: {
      'zh-TW': '這是示意圖：電動機車沒有排氣管，畫面上只有街上原本就有的稀疏圈圈和小點。',
      en: 'This is an illustration: electric scooters have no tailpipe, so the picture shows only the sparse rings and dots of the air the street already holds.',
    } as L10n,
    plain: { 'zh-TW': '這是示意圖。', en: 'This is an illustration.' } as L10n,
  },

  /** The three kinds of mark, named once (screen 2's key, any legend). */
  marks: {
    ribbon: { 'zh-TW': '聞得到：油氣（沒燒完的汽油）', en: 'You can smell it: fuel vapour (unburnt petrol)' } as L10n,
    ring: { 'zh-TW': '聞不到：一氧化碳', en: 'No smell: carbon monoxide' } as L10n,
    dot: { 'zh-TW': '看不到：微粒', en: 'Too small to see: particles' } as L10n,
  },

  /** AirRange: the two patches that show the two ends of an estimate. */
  range: {
    lo: { 'zh-TW': '範圍低的一頭', en: 'Low end of the range' } as L10n,
    hi: { 'zh-TW': '範圍高的一頭', en: 'High end of the range' } as L10n,
    rings: { 'zh-TW': '一格 {n} 個圈', en: '{n} rings in a patch' } as L10n,
    alt: {
      'zh-TW': '示意圖：同一個推估的兩頭。{which}，一格畫 {n} 個圈；圈圈越密，一氧化碳越多。',
      en: 'Illustration: the two ends of one estimate. {which}: {n} rings in a patch. More rings mean more carbon monoxide.',
    } as L10n,
  },

  /* ---------------------------------------------------------------------- */
  /* The picture-book scenes (brief 5.2). One group per scene.                */
  /* `alt` strings are what the picture shows; scene.ts adds the scenario and */
  /* the closing sentence.                                                    */
  /* ---------------------------------------------------------------------- */

  /** Words used in more than one scene. */
  words: {
    waiting: { 'zh-TW': '他也在等', en: 'He is waiting too' } as L10n,
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
      'zh-TW': '路口的街景：紅燈，行人號誌倒數 {count}。阿嬤、推嬰兒車的大人和戴黃帽的小學生站在路邊，小學生用手摀著口鼻。旁邊停了 {n} 輛機車，排成三排，引擎沒熄火；每一根排氣管後面都有一團深色的廢氣。前排一位騎士掀起鏡片，看得到臉，旁邊寫著「他也在等」。',
      en: 'A junction at a red light; the pedestrian signal counts down from {count}. An older woman, an adult with a pushchair and a schoolchild in a yellow cap wait at the kerb; the child covers nose and mouth with a hand. Beside them {n} scooters stand three rows deep with their engines running, and behind every tailpipe there is a dark patch of exhaust. One front-row rider has the visor up and a face, labelled “He is waiting too”.',
    } as L10n,
    altGreen: {
      'zh-TW': '同一個路口，行人號誌轉綠。旁邊的 {n} 輛都是電動機車，沒有排氣管，後面沒有那一團廢氣，輪胎旁有幾顆灰色小點。畫面邊緣有一輛汽車，後面還有它自己的一小團。戴黃帽的小學生一腳踏上斑馬線。',
      en: 'The same junction with the pedestrian signal green. All {n} scooters beside the kerb are electric: no tailpipes, no cloud behind them, a few grey dots at the tyres. A car at the edge of the picture still has its own small cloud. The schoolchild in the yellow cap steps onto the crossing.',
    } as L10n,
    counter: { 'zh-TW': '機車 {n} 輛', en: '{n} scooters' } as L10n,
  },

  /** G4: the kerb, close. */
  kerb: {
    alt: {
      'zh-TW': '路邊的近景：推嬰兒車的大人和用手摀著口鼻的小學生站在左邊；最近一輛機車的車尾就在右邊一兩步的地方，騎士也在畫面裡，後面還有別排的機車。整張圖都有稀疏的圈圈和小點；人站的地方多一些；排氣管後面顏色最深。',
      en: 'The kerb, close. An adult with a pushchair and a schoolchild covering nose and mouth stand on the left; the tail of the nearest scooter is a step or two to their right, with its rider in view and more rows behind. Sparse rings and dots cover the whole picture; there are more where the people stand; the patches behind the tailpipes are darkest.',
    } as L10n,
  },

  /** G2: one scooter, three kinds of mark. */
  tailpipe: {
    alt: {
      'zh-TW': '一輛燃油機車的側面，引擎沒熄火。排氣管排出三種東西，各走各的路：波浪線是聞得到的油氣，往上飄到一個鼻子前面；空心圈是聞不到的一氧化碳；小黑點是看不到的微粒。旁邊畫了一個鋁罐。',
      en: 'One petrol scooter from the side, engine running. Three kinds of mark leave the tailpipe, each in its own lane: wavy ribbons are the fuel vapour you can smell, drifting up to a nose; hollow rings are carbon monoxide, which has no smell; small dark dots are particles too small to see. A drinks can is drawn beside them.',
    } as L10n,
    keyLegend: { 'zh-TW': '點一種，只看它', en: 'Tap one to see it alone' } as L10n,
  },

  /** G3: the junction from above. */
  plan3: {
    alt: {
      'zh-TW': '從上面看的路口。左邊是停止線，後面停著機車；中間是斑馬線；右邊是待轉區，裡面的機車車尾朝著斑馬線，每個車尾後面有一團深色的廢氣，伸過那一小段空隙。空隙上標著「{gap}」。阿嬤、推嬰兒車的大人和戴黃帽的小學生，就站在斑馬線旁邊的路邊等。角落的小圖是一輛機車的側面：排氣管在一公尺的虛線下面，標著「{height}」。',
      en: 'The junction from above. On the left is the stop line with scooters behind it; in the middle, the crossing; on the right, the turn box, whose scooters have their tails toward the crossing, each with a dark patch of exhaust reaching across the small gap. The gap is marked “{gap}”. An older woman, an adult with a pushchair and a schoolchild in a yellow cap wait at the kerb beside the crossing. A small inset shows a scooter from the side: its tailpipe is under a dashed one-metre line, marked “{height}”.',
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
      'zh-TW': '一個大人的頭和胸口，畫成號誌小人的樣子，看得到氣管、兩片肺和心臟。三種記號從鼻子進去：波浪線（油氣）停在鼻子和喉嚨；小黑點（微粒）進到肺裡；空心圈（一氧化碳）穿過肺，進到血液。圖上只畫它們去的地方，沒有畫任何疾病。',
      en: 'The head and chest of an adult, drawn like a signal figure, with the windpipe, both lungs and the heart showing. Three kinds of mark go in through the nose: wavy ribbons (fuel vapour) stop at the nose and throat; small dots (particles) reach the lungs; hollow rings (carbon monoxide) pass through the lungs into the blood. The picture shows only where they go; it draws no disease.',
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
      'zh-TW': '一條往遠處走的路，路邊有三個路牌，越遠時間越長：{a}、{b}、{c}。每個路牌有一個小圖：一條心跳的線，中間淺淺凹了一下；兩片肺；一本日曆。路的下面是一年的小點，一天一顆，流進一條用小時量的長條。',
      en: 'A road running into the distance with three signposts, each for a longer time than the last: {a}, {b}, {c}. Each has a small drawing: a heartbeat trace with one shallow dip; a pair of lungs; a calendar. Under the road, a year of small dots, one for each day, flows into a bar measured in hours.',
    } as L10n,
    stripAlt: {
      'zh-TW': '一天等 {n} 個紅燈：一年約 {lo} 到 {hi} 小時。',
      en: '{n} red lights a day: about {lo} to {hi} hours a year.',
    } as L10n,
    days: { 'zh-TW': '一年 {days} 天，一天一顆', en: '{days} days a year, one dot a day' } as L10n,
    hours: { 'zh-TW': '約 {lo} 到 {hi} 小時', en: 'About {lo} to {hi} hours' } as L10n,
    hourUnit: { 'zh-TW': '小時', en: 'hours' } as L10n,
  },

  /** G8: heights on one ruler. */
  heights: {
    alt: {
      'zh-TW': '一把從地面量到 {top} 公分的尺。同一條地面上有四個人：嬰兒車裡的寶寶、戴黃帽的小學生、大人，還有坐在機車上的騎士。嬰兒車的高度（{lo} 到 {hi} 公分）塗了一條顏色；機車的排氣管做了記號，它和寶寶都不到一公尺高。每個人的鼻子前面有一個呼吸的圈，小孩的動得比較快。廢氣從地面到大人頭頂以上畫得一樣多，沒有分層。',
      en: 'A ruler from the ground to {top} cm. Four people stand on one ground line: a baby in a pushchair, a schoolchild in a yellow cap, an adult, and a rider seated on a scooter. The pushchair height ({lo} to {hi} cm) is shaded; the scooter’s tailpipe is marked, and both it and the baby are less than a metre off the ground. A breathing ring sits at each nose; the child’s moves faster. The exhaust is drawn evenly from the ground to above the adult’s head, with no bands by height.',
    } as L10n,
    band: { 'zh-TW': '嬰兒車 {lo} 到 {hi} 公分', en: 'Pushchair: {lo} to {hi} cm' } as L10n,
  },

  /** G9: the rider. */
  riderScene: {
    alt: {
      'zh-TW': '排在第二排的一位騎士，鏡片掀起來，看得到臉，旁邊寫著「他也在等」。前面那輛機車的排氣管正對著他，他的前輪和腳都在那一團深色的廢氣裡；他自己的機車後面也有一團。他的鼻子前面有一個呼吸的圈。',
      en: 'A rider in the second row, visor up, face showing, labelled “He is waiting too”. The tailpipe of the scooter in front points straight at him, and his front wheel and feet are in its dark patch of exhaust; his own scooter leaves a patch behind it too. A breathing ring sits at his nose.',
    } as L10n,
  },

  /** G10: the swap slider. */
  swap: {
    alt: {
      'zh-TW': '路邊停了 {total} 輛機車，分成兩排，全部是電動機車：有輪子裡的馬達和一條綠色的燈條，後面沒有廢氣，輪胎旁有幾顆灰色小點。畫面邊緣有一輛汽車，後面有它自己的一小團。用圖下面的滑桿，可以一輛一輛換回燃油機車；每換回一輛，排氣管後面就多一團深色的廢氣。',
      en: '{total} scooters at the kerb in two rows, all electric: each has a motor in the wheel and a green light strip, nothing behind it, and a few grey dots at the tyres. A car at the edge of the picture has its own small cloud. With the slider under the picture you can turn them back into petrol scooters one at a time; each one brings back a dark patch of exhaust behind its tailpipe.',
    } as L10n,
    question: { 'zh-TW': '{total} 輛裡，換幾輛電動機車？', en: 'Out of {total}, how many go electric?' } as L10n,
    value: { 'zh-TW': '{n} 輛電動、{rest} 輛燃油', en: '{n} electric, {rest} petrol' } as L10n,
    fewer: { 'zh-TW': '少換一輛', en: 'One fewer' } as L10n,
    more: { 'zh-TW': '多換一輛', en: 'One more' } as L10n,
  },

  /** G11: ten scooters, one to fix. */
  ten: {
    alt: {
      'zh-TW': '{total} 輛機車排成兩排。{rest} 輛的排氣管後面只有一小縷廢氣；有一輛沒有騎士的機車，後面是一大團。圖上一共畫了 {rings} 個圈，有 {big} 個在這一團裡。按「{fix}」，這一團會縮成和別輛一樣的一小縷。',
      en: '{total} scooters in two rows. {rest} of them leave only a wisp of exhaust; one, with no rider on it, leaves a big cloud. The picture draws {rings} rings in all, and {big} of them are in that cloud. Press “{fix}” and the cloud shrinks to a wisp like the others.',
    } as L10n,
    fix: { 'zh-TW': '修好它', en: 'Fix it' } as L10n,
    undo: { 'zh-TW': '再看一次修之前', en: 'Show it before the repair' } as L10n,
  },

  /** G17: what a mask stops. */
  mask: {
    alt: {
      'zh-TW': '一張戴著口罩的側臉，畫成號誌小人的樣子；左邊一根排氣管排出三種記號。空心圈（一氧化碳）直接穿過口罩；波浪線（油氣和苯）也穿過去；小黑點（微粒）有些停在口罩上，有些從鼻子旁邊和臉頰的縫漏進去。圖下面可以換四種口罩：布口罩、醫用口罩、活性碳口罩、貼合的 N95。不管哪一種，空心圈都穿過去。',
      en: 'A face in profile wearing a mask, drawn like a signal figure; a tailpipe on the left gives off three kinds of mark. Hollow rings (carbon monoxide) pass straight through the mask; wavy ribbons (fuel vapour and benzene) pass through too; of the small dots (particles), some stop on the mask and some slip in at the gaps beside the nose and at the cheek. A switch under the picture changes the mask: cloth, surgical, activated carbon, fitted N95. With every one of them the rings pass through.',
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
      surgical: { 'zh-TW': '氣體穿過去；微粒擋下一些，其他從邊緣漏進去', en: 'Gases pass through; some particles stop, the rest leak in at the edges' } as L10n,
      carbon: { 'zh-TW': '一氧化碳穿過去；油氣只擋下一點點，而且不久', en: 'Carbon monoxide passes through; a little vapour is held, and not for long' } as L10n,
      n95: { 'zh-TW': '氣體照樣穿過去；戴得貼合，微粒大多擋得住', en: 'Gases still pass through; if it fits, most particles stop' } as L10n,
    },
    gapNose: { 'zh-TW': '鼻子旁邊的縫', en: 'Gap beside the nose' } as L10n,
    gapCheek: { 'zh-TW': '臉頰的縫', en: 'Gap at the cheek' } as L10n,
  },

  /** The station picture for /questions/app/: why an air-quality app does not show a red light. */
  station: {
    alt: {
      'zh-TW': '路邊的一個空氣品質測站：一個箱子，進氣口在一根高高的管子頂端，標著「{inlet}」。旁邊的路邊，小學生和推嬰兒車的大人站在一輛機車的車尾後面；那一團深色的廢氣貼著地面，遠遠低於進氣口。',
      en: 'An air-quality station beside the road: a cabinet whose inlet is at the top of a tall pipe, marked “{inlet}”. At the kerb beside it, a schoolchild and an adult with a pushchair stand behind the tail of a scooter; its dark patch of exhaust stays near the ground, far below the inlet.',
    } as L10n,
    inlet: { 'zh-TW': '進氣口', en: 'Inlet' } as L10n,
    cabinet: { 'zh-TW': '測站', en: 'Station' } as L10n,
  },

  /** MeasurementDiagram (rebuilt on the new plan): where the instruments would go. Its other words are in `measure`, below. */
  measure2: {
    alt: {
      'zh-TW': '量測建議：同一張從上面看的路口圖，標了 {n} 個放儀器的位置：{list}。',
      en: 'A proposed measurement: the same junction from above, with {n} instrument positions marked: {list}.',
    } as L10n,
  },

  /** Printed inside every frame: the scene is a drawing, not a measurement. (Old scenes; the new tag is ui.ts → illustration.tag.) */
  illustration: { 'zh-TW': '示意圖・不是量測', en: 'Illustration, not a measurement' } as L10n,
  unitCm: { 'zh-TW': '公分', en: 'cm' } as L10n,

  /** The hatched band. Two parts, shown either side of a bar (or on two lines when narrow). */
  band: {
    present: { 'zh-TW': '有廢氣', en: 'exhaust present' } as L10n,
    unknown: { 'zh-TW': '多濃沒人量過', en: 'amount not measured' } as L10n,
  },

  /** StreetScene: accessible descriptions, one per frame. */
  alt: {
    empty: {
      'zh-TW': '路口側面示意圖。號誌是紅燈，倒數 {count}。停等區和待轉區都還空著。轉角站著一個戴黃帽的小學生和一位拄拐杖的年長女性；一個大人推著嬰兒車走向斑馬線。',
      en: 'Side view of a crossing, illustrative. The signal is red, countdown {count}. The stop box and the turn box are empty. On the corner stand a schoolchild in a yellow cap and an older woman with a cane; an adult pushes a stroller toward the crosswalk.',
    } as L10n,
    pack: {
      'zh-TW': '同一個路口，紅燈，倒數 {count}。機車停滿了停等區，待轉區也有幾台，車尾朝著斑馬線；前排一位騎士把鏡片掀起來，看得到臉。行人從車陣前面走過斑馬線。路面到大約一公尺高畫了一層斜線，標示「有廢氣，多濃沒人量過」；暖色波紋只畫在每一根排氣管口。',
      en: 'The same crossing at red, countdown {count}. Scooters fill the stop box and a few wait in the turn box with their tails toward the crosswalk; one front-row rider has the visor up and a visible face. People cross in front of the pack. A hatched band from the road to about one metre is labelled “exhaust present, amount not measured”; warm ribbons are drawn only at each tailpipe mouth.',
    } as L10n,
    kerb: {
      'zh-TW': '從路緣高度看的示意圖。一把 0 到 180 公分的尺；第一公尺畫上斜線，標示「排氣管在這一公尺裡」；嬰兒車的高度 55 到 85 公分用括號標出。小學生和大人的口鼻高度是尺上的小刻度，標明是示意。小學生比嬰兒車那一段高。',
      en: 'Kerb-level view, illustrative. A ruler from 0 to 180 cm; the first metre is hatched and labelled “tailpipes are in this first metre”; the stroller band from 55 to 85 cm is bracketed. The schoolchild’s and the adults’ mouth heights are small ticks on the ruler, marked as illustrative. The schoolchild stands above the stroller band.',
    } as L10n,
    paused: {
      'zh-TW': '同一個紅燈的畫面，淡化處理，倒數暫停在 {count}。',
      en: 'The same red light, dimmed, with the countdown paused at {count}.',
    } as L10n,
    green: {
      'zh-TW': '同一個路口，號誌轉綠。前排的機車已經過了斑馬線；戴黃帽的小學生一隻腳踏下路緣。斜線那一層和紅燈時畫得一樣。停止線旁的標籤寫著：起步那一下，國外量的是汽車和柴油車；機車，沒人量過。',
      en: 'The same crossing as the signal turns green. The front scooters are past the crosswalk; the schoolchild in the yellow cap has one foot off the kerb. The hatched band is drawn exactly as at red. A tag at the stop line reads: pull-away has been measured abroad for cars and diesel vehicles; for scooters, nobody has measured it.',
    } as L10n,
    clean: {
      'zh-TW': '同一個路口、同一個紅燈，倒數 {count}，車陣換成電動機車。機車後面沒有波紋、沒有圓圈，也沒有斜線那一層。細點和之前一樣。遠處車道有一台汽車，排氣管口還有一小段波紋：其他車流還在。',
      en: 'The same crossing and the same red light, countdown {count}, with electric scooters. Behind the scooters there are no ribbons, no rings and no hatched band. The stipple is unchanged. A car in the far lane still has one small ribbon at its tailpipe: other traffic is still there.',
    } as L10n,
  },

  scene: {
    paused: { 'zh-TW': '倒數暫停', en: 'Countdown paused' } as L10n,
    /** K4 tag at the stop line. Lines are separate so they can stack. */
    pullAway: {
      'zh-TW': ['起步那一下：', '國外量的是汽車和柴油車。', '機車，沒人量過'],
      en: ['Pulling away: measured abroad', 'for cars and diesel vehicles.', 'For scooters, nobody has.'],
    } as L10n<string[]>,
    otherTraffic: { 'zh-TW': '其他車流還在', en: 'Other traffic remains' } as L10n,
    noTailpipes: { 'zh-TW': '這一排沒有排氣管', en: 'This row has no tailpipes' } as L10n,
    /** K2 labels */
    firstMetre: { 'zh-TW': ['排氣管在', '這一公尺裡'], en: ['Tailpipes are in', 'this first metre'] } as L10n<string[]>,
    strollerBand: { 'zh-TW': ['嬰兒車高度', '55–85 公分'], en: ['Stroller height', '55–85 cm'] } as L10n<string[]>,
    strollerSource: { 'zh-TW': '國際回顧', en: 'intl. review' } as L10n,
    adultMouth: { 'zh-TW': '大人口鼻', en: 'Adult mouth' } as L10n,
    childMouth: { 'zh-TW': '小學生口鼻', en: 'Child mouth' } as L10n,
    illustrative: { 'zh-TW': '示意', en: 'illus.' } as L10n,
    gap50: { 'zh-TW': '≥ 50 公分', en: '≥ 50 cm' } as L10n,
    /** emphasis captions */
    emFumes: { 'zh-TW': '聞得到的：在排氣管口', en: 'What you smell: at the tailpipe mouth' } as L10n,
    emCo: { 'zh-TW': '一氧化碳：沒有味道', en: 'Carbon monoxide: no smell' } as L10n,
    emUfp: { 'zh-TW': '車流裡的超細微粒，不只來自機車', en: 'Ultrafine particles in traffic, not only from scooters' } as L10n,
  },

  /** SceneCompare (V16) */
  compare: {
    legend: { 'zh-TW': '同一個路口，同一個紅燈', en: 'Same crossing, same red light' } as L10n,
    gas: { 'zh-TW': '燃油機車', en: 'Gasoline scooters' } as L10n,
    electric: { 'zh-TW': '電動機車', en: 'Electric scooters' } as L10n,
    ledgerTitle: { 'zh-TW': '換成電動之後', en: 'After the switch' } as L10n,
    gone: {
      title: { 'zh-TW': '消失的', en: 'Gone' } as L10n,
      body: {
        'zh-TW': '這一排機車在路口排的一氧化碳、油氣、苯。',
        en: 'The carbon monoxide, fuel vapour and benzene this row of scooters emits at the crossing.',
      } as L10n,
    },
    stays: {
      title: { 'zh-TW': '留下的', en: 'Still here' } as L10n,
      body: {
        'zh-TW': '輪胎、煞車和路面的粉塵；旁邊的汽車和公車。',
        en: 'Tyre, brake and road dust; the cars and buses alongside.',
      } as L10n,
    },
    moved: {
      title: { 'zh-TW': '搬走的', en: 'Moved elsewhere' } as L10n,
      body: { 'zh-TW': '發電的排放。', en: 'The emissions from generating the electricity.' } as L10n,
    },
  },

  /** PollutantKey: how the site draws air. */
  key: {
    note: {
      'zh-TW': '這四種畫法在每一格都一樣，不隨倒數改變，也不代表濃度。',
      en: 'These four marks are drawn the same in every frame. They do not change with the countdown and they do not show a concentration.',
    } as L10n,
    hatch: {
      title: { 'zh-TW': '斜線：有廢氣，多濃沒人量過', en: 'Hatching: exhaust present, amount not measured' } as L10n,
      body: {
        'zh-TW': '路面到大約一公尺，排氣管都在這裡。畫成斜線，是因為台灣沒有人量過這一層有多濃。',
        en: 'From the road to about one metre, where the tailpipes are. It is hatched because nobody in Taiwan has measured how dense this layer is.',
      } as L10n,
    },
    fumes: {
      title: { 'zh-TW': '波紋：排氣管口', en: 'Ribbons: the tailpipe mouth' } as L10n,
      body: {
        'zh-TW': '你聞到的那股味道從這裡出來。只畫在排氣管口，長度固定。',
        en: 'Where the smell you notice comes out. Drawn only at tailpipe mouths, always the same length.',
      } as L10n,
    },
    co: {
      title: { 'zh-TW': '空心圓：一氧化碳', en: 'Hollow rings: carbon monoxide' } as L10n,
      body: {
        'zh-TW': '沒有味道。它跟著機車車流走，所以用它來認廢氣。',
        en: 'It has no smell. It moves with scooter traffic, so we use it to recognise exhaust.',
      } as L10n,
    },
    ufp: {
      title: { 'zh-TW': '細點：車流裡的超細微粒', en: 'Fine dots: ultrafine particles in traffic' } as L10n,
      body: {
        'zh-TW': '不只來自機車。整條街畫得一樣密，換成電動機車之後還在。',
        en: 'Not only from scooters. Drawn at one density across the whole street, and still there in the electric frame.',
      } as L10n,
    },
  },

  /** ApproachPlan (V6) */
  plan: {
    alt: {
      'zh-TW': '一個路口臨近路段的俯視示意圖，車行方向由左到右。機車停滿停止線後方的機慢車停等區；停止線前面是行人穿越道，有人正在走；穿越道再往前是待轉區，裡面的機車車尾朝著穿越道，後緣和穿越道之間標著「50 公分以上」。轉角站著一個戴黃帽的小學生，等著過另一條街。每一台機車只在車尾畫了一個廢氣色的記號。',
      en: 'Plan of one approach to a junction, illustrative, traffic running left to right. Scooters fill the stop box behind the stop line; ahead of the line is the crosswalk, with people on it; beyond the crosswalk is the two-stage turn box, whose scooters have their tails toward the crosswalk, with “50 cm or more” marked between its rear edge and the crosswalk. On the corner a schoolchild in a yellow cap waits to cross the other street. Each scooter carries one exhaust-coloured mark, at its tail.',
    } as L10n,
    stopBox: { 'zh-TW': '停等區', en: 'Stop box' } as L10n,
    stopBoxDepth: { 'zh-TW': '2.5–6 公尺', en: '2.5–6 m' } as L10n,
    stopLine: { 'zh-TW': '停止線', en: 'Stop line' } as L10n,
    crosswalk: { 'zh-TW': '斑馬線', en: 'Crosswalk' } as L10n,
    turnBox: { 'zh-TW': '待轉區', en: 'Turn box' } as L10n,
    gap: { 'zh-TW': '≥ 50 公分', en: '≥ 50 cm' } as L10n,
    corner: { 'zh-TW': '小黃帽在這裡等', en: 'The yellow cap waits here' } as L10n,
    travel: { 'zh-TW': '車行方向', en: 'Direction of travel' } as L10n,
    caption: {
      'zh-TW': '50 公分是規定的下限；實際距離每個路口不同。',
      en: 'Fifty centimetres is the minimum the rule sets; the real distance differs at every crossing.',
    } as L10n,
    tails: { 'zh-TW': '排氣管口', en: 'Tailpipe mouth' } as L10n,
  },

  /** SmellStrip (V10) */
  smell: {
    canTitle: { 'zh-TW': '聞得到', en: 'You can smell' } as L10n,
    canBody: {
      'zh-TW': '你站在廢氣裡。可能是醛類；是哪幾種，沒有人鑑定過。',
      en: 'You are standing in exhaust. Probably aldehydes; which ones, nobody has identified.',
    } as L10n,
    cannotTitle: { 'zh-TW': '聞不到', en: 'You cannot smell' } as L10n,
    cannotBody: {
      'zh-TW': '一氧化碳：沒有味道。苯：路邊那種濃度，不太可能聞得到。',
      en: 'Carbon monoxide: no smell. Benzene: unlikely to be smelled at roadside levels.',
    } as L10n,
    footer: { 'zh-TW': '味道是警報，不是量表。', en: 'Smell is an alarm, not a gauge.' } as L10n,
  },

  /** SignalCycle (V14) */
  cycle: {
    alt: {
      'zh-TW': '一個號誌循環的時間條：先是紅燈，再是綠燈。沒有曲線，也沒有數值。',
      en: 'A time bar for one signal cycle: red, then green. There is no curve and no value axis.',
    } as L10n,
    red: { 'zh-TW': '紅燈', en: 'Red' } as L10n,
    green: { 'zh-TW': '綠燈', en: 'Green' } as L10n,
    idle: { 'zh-TW': '怠速：你站在旁邊的時間', en: 'Idling: the time you stand beside it' } as L10n,
    pullAway: {
      'zh-TW': '起步：國外量到微粒高峰（汽車和柴油車）',
      en: 'Pull-away: where particle peaks were measured abroad (cars and diesel vehicles)',
    } as L10n,
    badge: { 'zh-TW': '國際證據', en: 'International evidence' } as L10n,
    gap: { 'zh-TW': '機車、台灣：沒人量過', en: 'Scooters, Taiwan: nobody has measured this' } as L10n,
    time: { 'zh-TW': '時間', en: 'Time' } as L10n,
  },

  /** MeasurementDiagram (V35) */
  measure: {
    stamp: { 'zh-TW': '本站提議', en: 'Our proposal' } as L10n,
    alt: {
      'zh-TW': '量測建議的示意圖。同一張路口平面圖上標了四個放儀器的位置：轉角、待轉區旁、停等區旁，以及一個離路口遠的對照點。',
      en: 'Diagram of a proposed measurement, illustrative. The same plan of the approach with four instrument positions: on the corner, beside the turn box, beside the stop box, and at a control point away from the junction.',
    } as L10n,
    whereTitle: { 'zh-TW': '放在哪裡', en: 'Where' } as L10n,
    points: [
      { 'zh-TW': '轉角，行人等綠燈的地方', en: 'On the corner, where people wait for the green' },
      { 'zh-TW': '待轉區旁', en: 'Beside the turn box' },
      { 'zh-TW': '停等區旁', en: 'Beside the stop box' },
      { 'zh-TW': '離路口遠的對照點', en: 'A control point away from the junction' },
    ] as L10n[],
    heightTitle: { 'zh-TW': '量兩個高度', en: 'At two heights' } as L10n,
    heightLow: { 'zh-TW': '約 0.6 公尺：嬰兒車的高度', en: 'About 0.6 m: stroller height' } as L10n,
    heightHigh: { 'zh-TW': '約 1.5 公尺：大人的高度', en: 'About 1.5 m: adult height' } as L10n,
    whatTitle: { 'zh-TW': '量什麼', en: 'What' } as L10n,
    what: [
      { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
      { 'zh-TW': '苯類（BTEX）', en: 'Benzene-family compounds (BTEX)' },
      { 'zh-TW': '超細微粒數量', en: 'Ultrafine particle number' },
    ] as L10n[],
    clockTitle: { 'zh-TW': '怎麼記錄', en: 'How' } as L10n,
    clock: {
      'zh-TW': '逐秒記錄，對上紅燈和綠燈；同時數每個時相停了幾台機車；公開原始數據。',
      en: 'Second by second, matched to red and green; count the scooters waiting in each phase; publish the raw data.',
    } as L10n,
    control: { 'zh-TW': '對照點', en: 'Control' } as L10n,
  },

  scooter: {
    gas: { 'zh-TW': '燃油機車', en: 'Gasoline scooter' } as L10n,
    electric: { 'zh-TW': '電動機車', en: 'Electric scooter' } as L10n,
  },
} as const;

/** Fill {token}s in an art string. */
export function fill(value: L10n, locale: Locale, vars: Record<string, string | number> = {}): string {
  let s: string = value[locale];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
