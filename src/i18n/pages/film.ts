// /90/: the film (redesign brief, section 8 and amendment 12.2), and the home page's button to it.
//
// The film is called 短片 / the film, never "the 90-second film": its length is read from the
// timeline (src/components/pages/film/timeline.ts → DURATION), never typed.
//
// Rules that bind these strings:
//   - one caption is at most 14 Chinese characters or 8 English words; its quiet line at most
//     20 characters or 10 words; each stays on screen 0.3 s per character and never under
//     2.2 s. checkTimeline() fails the build otherwise;
//   - {tokens} are filled in src/components/pages/film/film-data.ts from the estimate slots
//     (src/data/estimate.ts) and the money module (src/lib/home-money.ts). No digit that is a
//     finding is typed here;
//   - chip names, the illustration tag and the K sentences are in ../ui.ts; the panel's
//     「這排機車多出來」 and 「街上原本就有」 are the estimate's own words (estimateText);
//   - nothing says or implies that the amount changes through the red, that a child's height
//     has a number, or that riders breathe "the most" (brief 4.6).

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '短片：一個紅燈', en: 'The film: one red light' },
    description: {
      'zh-TW': '一個紅燈，用動畫演一次。看機車停下來，廢氣排在膝蓋的高度；誰站得最近；換成電動機車，差在哪裡。沒有聲音，每一句都有字幕，可以暫停，也可以拖。',
      en: 'One red light as an animation: the scooters pull up, the exhaust comes out at knee height, who stands closest, and what changes when they are electric. No sound, every line captioned; pause or scrub at any point.',
    },
  },

  // The button on the home page (brief 3.2, screen 1). `playLong` carries the length.
  hero: {
    play: { 'zh-TW': '看短片', en: 'Watch the film' },
    playLong: { 'zh-TW': '看短片（約 {min} 分鐘）', en: 'Watch the film (about {min} minutes)' },
  },

  player: {
    kicker: { 'zh-TW': '短片', en: 'The film' },
    title: { 'zh-TW': '一個紅燈', en: 'One red light' },
    /** On the poster, under the play button. */
    length: { 'zh-TW': '全片 {min} 分 {sec} 秒・沒有聲音・有字幕', en: '{min} min {sec} s · no sound · captioned' },
    play: { 'zh-TW': '播放', en: 'Play' },
    pause: { 'zh-TW': '暫停', en: 'Pause' },
    restart: { 'zh-TW': '從頭再看', en: 'Start again' },
    seek: { 'zh-TW': '短片進度', en: 'Position in the film' },
    /** aria-valuetext of the scrubber. */
    position: { 'zh-TW': '{time}，全片 {total}', en: '{time} of {total}' },
    speed: {
      label: { 'zh-TW': '播放速度', en: 'Playback speed' },
      normal: { 'zh-TW': '正常', en: 'Normal' },
      slow: { 'zh-TW': '慢一點', en: 'Slower' },
    },
    keys: {
      'zh-TW': '鍵盤：空白鍵播放或暫停，左右鍵快轉或倒退 5 秒，Home 鍵回到開頭。',
      en: 'Keyboard: Space plays or pauses, the arrow keys move 5 seconds, Home starts again.',
    },
    /** The note under the player: what is time-lapse, what follows the estimate, what is drawn for the eye. */
    notes: {
      'zh-TW': '片裡的紅燈是 {red} 秒。畫面右上角出現「快轉」記號的時候，倒數走得比實際快。人站的地方畫了多少廢氣，照本站的推估；排氣管旁邊的深色，是畫給眼睛看的。',
      en: 'The red light in the film lasts {red} seconds. While the time-lapse mark shows at the top right, the countdown runs faster than real time. How much exhaust is drawn where the people stand follows this site’s estimate; the dark patches at the tailpipes are drawn for the eye.',
    },
    how: { 'zh-TW': '怎麼算的', en: 'How we worked it out' },
    line: { 'zh-TW': '傳給家人（LINE）', en: 'Send to family (LINE)' },
    lineText: { 'zh-TW': '等紅燈的時候，旁邊機車的廢氣排在哪裡？約 {min} 分鐘的短片：', en: 'Where does the exhaust go at a red light? A film of about {min} minutes:' },
    download: { 'zh-TW': '下載影片', en: 'Download the video' },
    downloadNote: { 'zh-TW': '直式影片，字幕在畫面裡，{size} MB', en: 'Vertical video with captions in the picture, {size} MB' },
  },

  // Words drawn inside the picture.
  hud: {
    scooters: { 'zh-TW': '機車 {n} 輛', en: 'Scooters: {n}' },
    fast: { 'zh-TW': '快轉', en: 'time-lapse' },
    cm: { 'zh-TW': '公分', en: 'cm' },
    petrol: { 'zh-TW': '燃油機車', en: 'Petrol scooters' },
    electric: { 'zh-TW': '電動機車', en: 'Electric scooters' },
    /** The panel's first row: lane A's 這排機車多出來 with the gas named. */
    added: { 'zh-TW': '{added}的一氧化碳', en: '{added}: carbon monoxide' },
    addedElectric: { 'zh-TW': '這排電動機車多出來的一氧化碳', en: 'Carbon monoxide added by these electric scooters' },
    zero: { 'zh-TW': '0', en: '0' },
    /** The two price tags. {county}, {amount} from the money module. */
    tag: {
      scrap: { 'zh-TW': '報廢滿 10 年的機車', en: 'scrapping one 10+ years old' },
      noScrap: { 'zh-TW': '沒有機車可報廢', en: 'nothing to scrap' },
      where: { 'zh-TW': '{county}・{scrap}', en: '{county} · {scrap}' },
      /** In front of the second tag: it is the least favourable case in the table, not the reader's county. */
      worst: { 'zh-TW': '挑最便宜的車，最不划算：', en: 'Cheapest models, worst case: ' },
      less: { 'zh-TW': '少付 {amount}', en: '{amount} less' },
      more: { 'zh-TW': '多付 {amount}', en: '{amount} more' },
      same: { 'zh-TW': '差不多，只差 {amount}', en: 'about the same: {amount} apart' },
    },
    checked: { 'zh-TW': '{kind}・價格和補助 {date}查', en: '{kind} · prices and subsidies checked {date}' },
    perMonth: { 'zh-TW': '每個月・騎 {km} 公里', en: 'Each month, riding {km} km' },
    bars: {
      petrol: { 'zh-TW': '加油', en: 'Petrol' },
      home: { 'zh-TW': '在家充電', en: 'Charging at home' },
      about: { 'zh-TW': '約 {amount}', en: 'about {amount}' },
      range: { 'zh-TW': '約 {lo} 到 {hi}', en: 'about {lo} to {hi}' },
    },
  },

  /**
   * The captions, in order. `main` is the caption; `note` the quiet line under it.
   * Chinese first (brief 8.1 and 12.2, verbatim where it supplies them); English follows it.
   */
  cues: {
    smell: {
      main: { 'zh-TW': '那個味道，你也聞過。', en: 'You know that smell.' },
      note: { 'zh-TW': '一個紅燈，{red} 秒', en: 'One red light: {red} seconds' },
    },
    arrive: { main: { 'zh-TW': '機車一輛一輛停下來。', en: 'Scooters pull up, one after another.' } },
    waiting: { main: { 'zh-TW': '騎士在等，引擎沒熄火。', en: 'The riders wait. Engines stay on.' } },
    knee: { main: { 'zh-TW': '廢氣就排在膝蓋的高度。', en: 'The exhaust comes out at knee height.' } },
    keeps: { main: { 'zh-TW': '車停著，廢氣一直補上來。', en: 'They stay put. The exhaust keeps coming.' } },
    howMuch: { main: { 'zh-TW': '路邊多了多少？這是推估。', en: 'How much more at the kerb? An estimate.' } },
    co: { main: { 'zh-TW': '一氧化碳：沒有味道。', en: 'Carbon monoxide: no smell at all.' } },
    fuel: {
      main: { 'zh-TW': '臭味，是沒燒完的汽油。', en: 'The smell is unburnt fuel.' },
      note: { 'zh-TW': '油氣裡有苯（ㄅㄣˇ），會致癌', en: 'The fuel vapour holds benzene, known to give cancer' },
    },
    specks: { main: { 'zh-TW': '還有微粒，小到看不見。', en: 'And particles too small to see.' } },
    mask: { main: { 'zh-TW': '一般口罩，擋不住這些氣體。', en: 'An ordinary mask does not stop these gases.' } },
    under: { main: { 'zh-TW': '排氣管和嬰兒車，都不到一公尺高。', en: 'Tailpipe and pushchair: both under a metre high.' } },
    child: { main: { 'zh-TW': '小孩個子矮，呼吸又快。', en: 'Children are shorter and breathe faster.' } },
    rider: { main: { 'zh-TW': '騎士也在這一層裡。', en: 'The rider is in it too.' } },
    daily: {
      main: { 'zh-TW': '紅燈很短，天天都等。', en: 'One red light is short. But it’s daily.' },
      // (U+2060 after the dash keeps a range on one line) home screen 7's default (four lights a day, time.hoursPerYear[4])
      // (the quiet line has room for 20 characters, so the assumption, ui.ts estText.redHours, is printed
      // under this line in the transcript, in the same words as home screen 7's second sentence)
      note: { 'zh-TW': '一天 4 個，一年 {lo}–\u2060{hi} 小時', en: 'Four lights a day: {lo}–\u2060{hi} hours a year' },
    },
    years: {
      main: { 'zh-TW': '長年吸車子的廢氣，', en: 'Years of breathing traffic exhaust' },
      note: { 'zh-TW': '長期研究，所有車輛，不只機車', en: 'Long-term studies of all traffic, not scooters alone' },
    },
    // its quiet line is the K sentence K5film in ../ui.ts
    linked: { main: { 'zh-TW': '和氣喘、心臟病、肺癌有關。', en: 'are linked to asthma, heart disease, lung cancer.' } },
    nearly: { main: { 'zh-TW': '快綠燈了。', en: 'Nearly green.' } },
    green: { main: { 'zh-TW': '綠燈。', en: 'Green.' } },
    thins: { main: { 'zh-TW': '機車騎走了，廢氣慢慢散。', en: 'The scooters ride off. The exhaust thins.' } },
    again: { main: { 'zh-TW': '同一個紅燈，再來一次。', en: 'The same red light, once more.' } },
    electric: { main: { 'zh-TW': '這次，全部換成電動機車。', en: 'This time, every scooter is electric.' } },
    noLayer: {
      main: { 'zh-TW': '沒有排氣管，就沒有那一層。', en: 'No tailpipe. No layer of exhaust.' },
      note: { 'zh-TW': '其他車輛還是會排廢氣', en: 'Other traffic still emits' },
    },
    cost: { main: { 'zh-TW': '換一輛，要多少錢？', en: 'What does one cost?' } },
    /** Chosen by rule from the money table (brief 8.1, "rule-based captions"). */
    tags: {
      mixed: { 'zh-TW': '補助扣完，有人少付，有人多付。', en: 'After subsidies some pay less, some pay more.' },
      cheaper: { 'zh-TW': '補助扣完，電動機車比較便宜。', en: 'After subsidies the electric scooter costs less.' },
      same: { 'zh-TW': '補助扣完，兩種差不多錢。', en: 'After subsidies the two cost about the same.' },
      dearer: { 'zh-TW': '現在買，電動機車比較貴。', en: 'Bought today, the electric scooter costs more.' },
      /** quiet line of `dearer` when the reason is that no subsidy is confirmed for the year */
      nothingConfirmed: { 'zh-TW': '{year} 年的補助還沒有確定', en: 'Nothing is confirmed yet for {year} subsidies' },
    },
    monthly: {
      main: { 'zh-TW': '在家充電，一個月約 {lo} 到 {hi} 元。', en: 'Home charging: about NT${lo} to NT${hi} a month.' },
      /** when the low and high end are the same figure */
      mainOne: { 'zh-TW': '在家充電，一個月約 {lo} 元。', en: 'Charging at home: about NT${lo} a month.' },
      note: { 'zh-TW': '加油約 {petrol} 元（每月騎 {km} 公里）', en: 'Petrol: about NT${petrol} ({km} km a month)' },
    },
    end: { main: { 'zh-TW': '算算看，你換要多少。', en: 'Work out your own numbers.' } },
  },

  /** Chapters: marks on the scrubber, headings of the transcript, labels of the stills. */
  beats: {
    smell: { 'zh-TW': '紅燈亮了', en: 'The light turns red' },
    arrive: { 'zh-TW': '機車停下來', en: 'The scooters pull up' },
    idle: { 'zh-TW': '引擎沒熄火', en: 'Engines running' },
    kerb: { 'zh-TW': '路邊多了多少', en: 'How much more at the kerb' },
    inside: { 'zh-TW': '裡面有什麼', en: 'What is in it' },
    mask: { 'zh-TW': '口罩擋得住嗎', en: 'Does a mask stop it' },
    closest: { 'zh-TW': '誰離得最近', en: 'Who is closest' },
    health: { 'zh-TW': '吸進去以後', en: 'Once breathed in' },
    green: { 'zh-TW': '綠燈', en: 'Green' },
    electric: { 'zh-TW': '換成電動，再來一次', en: 'Again, on electric' },
    money: { 'zh-TW': '換一輛要多少錢', en: 'What one costs' },
  },

  end: {
    title: { 'zh-TW': '換一輛電動的，就少一根排氣管。', en: 'Every electric scooter is one tailpipe fewer.' },
    calc: { 'zh-TW': '算算我換要多少', en: 'Work out my cost' },
    again: { 'zh-TW': '再看一次', en: 'Watch again' },
    evidence: { 'zh-TW': '看完整的證據', en: 'See the full evidence' },
    measure: { 'zh-TW': '把推估換成實測', en: 'Replace the estimate with a measurement' },
  },

  still: {
    note: { 'zh-TW': '下面是同一部短片，一格一格攤開：畫面和字幕都一樣，只是不會動。', en: 'Below is the same film laid out frame by frame: the same pictures and captions, without the motion.' },
    optIn: { 'zh-TW': '改用播放的', en: 'Play it instead' },
    frameN: { 'zh-TW': '第 {n} 格', en: 'Frame {n}' },
    alt: { 'zh-TW': '短片第 {n} 格的畫面：{line}', en: 'Frame {n} of the film: {line}' },
  },

  transcript: {
    title: { 'zh-TW': '文字版', en: 'Read it as text' },
    intro: {
      'zh-TW': '短片裡的每一句，照出現的順序；每一句後面是它的根據。點時間，短片就跳到那裡。',
      en: 'Every line of the film, in order, each followed by what it rests on. Select a time and the film jumps there.',
    },
    jump: { 'zh-TW': '跳到 {time}', en: 'Jump to {time}' },
    source: { 'zh-TW': '看根據', en: 'What this rests on' },
    how: { 'zh-TW': '怎麼知道的？', en: 'How do we know?' },
    /** What the picture shows where a caption alone would not say it (the transcript must carry every number on screen). */
    drawn: {
      pack: { 'zh-TW': '畫面畫的是{scenario}的情境，共 {n} 輛。', en: 'The picture draws the “{scenario}” case: {n} scooters.' },
      street: { 'zh-TW': '{label}：{value}', en: '{label}: {value}' },
      zero: { 'zh-TW': '{label}：{value}。沒有排氣管，就沒有東西多出來。', en: '{label}: {value}. With no tailpipe there is nothing to add.' },
      ruler: { 'zh-TW': '尺上標出嬰兒車裡寶寶的高度：{lo} 到 {hi} 公分。', en: 'The ruler marks the height of a baby in a pushchair: {lo} to {hi} cm.' },
      burst: { 'zh-TW': '起步的時候，每輛機車噴出一小團。', en: 'As they pull away each scooter throws one small puff.' },
      tag: { 'zh-TW': '{where}（{plate}）：{sum}。', en: '{where} ({plate}): {sum}.' },
      bar: { 'zh-TW': '{label}：{value}。', en: '{label}: {value}.' },
    },
  },

  /** The three sheets behind 怎麼知道的？ on this page (brief 4.5). Numbers are filled from the slots and the registry. */
  sheets: {
    estimate: {
      title: { 'zh-TW': '「{range}」|怎麼來的', en: '“{range}”: |where it comes from' },
      measured: {
        'zh-TW': '交通測站量到的一氧化碳，全年平均{street}。運研所（交通部運輸研究所）在路口行人等候區量到的最高一分鐘，是 {peaks} ppm。',
        en: 'Traffic stations measure carbon monoxide at {street} as a yearly average. The highest one-minute readings the Institute of Transportation took where pedestrians wait were {peaks} ppm.',
      },
      care: {
        'zh-TW': '這是大人鼻子高度、90 秒的平均，不是哪一個路口，也不是小孩的高度。',
        en: 'This is a 90-second average at an adult’s nose. It is not any particular junction, and not a child’s height.',
      },
    },
    heights: {
      title: { 'zh-TW': '排氣管和嬰兒車|有多高', en: 'How high the tailpipe |and the pushchair are' },
      who: {
        'zh-TW': '排氣管的高度，是運研所算路口空氣時用的數字；嬰兒車的高度，來自國外對幾十款嬰兒車的整理。',
        en: 'The tailpipe height is the figure the Institute of Transportation used in its junction modelling. The pushchair height comes from a review of dozens of pushchair models abroad.',
      },
      what: {
        'zh-TW': '運研所算的時候，把排氣管設在離地 {pipe} 公分。嬰兒車裡的寶寶，呼吸的高度約 {lo} 到 {hi} 公分。小孩照體重算，吸進的空氣是大人的 {airLo} 到 {airHi} 倍。',
        en: 'The Institute of Transportation’s model puts a tailpipe {pipe} cm off the ground. A baby in a pushchair breathes at about {lo} to {hi} cm. For their body weight, children breathe {airLo} to {airHi} times as much air as adults.',
      },
      care: {
        'zh-TW': '排氣管的高度是算路口空氣時設定的數字，不是一輛一輛量的。小孩吸得比較多，講的是呼吸量，不是哪個高度的廢氣比較多。',
        en: 'The tailpipe height is a typical figure set for modelling; it varies from scooter to scooter. That children breathe more is about how much air they take in, not about how much exhaust there is at any height.',
      },
    },
    health: {
      title: { 'zh-TW': '「和氣喘、心臟病、肺癌有關」|怎麼知道的', en: '“Linked to asthma, heart disease, lung cancer”: |how we know' },
      who: {
        'zh-TW': '美國健康效應研究所（HEI）請專家小組，整理了 {n} 篇長期研究。',
        en: 'A panel convened by the Health Effects Institute in the United States reviewed {n} long-term studies.',
      },
      what: {
        'zh-TW': '長年住在車子廢氣多的地方，新得氣喘的比較多；因為心臟病、肺癌過世的也比較多。這是「有關」，研究沒有判定因果。',
        en: 'Where people live for years with more traffic exhaust, more of them develop asthma, and more die of heart disease and lung cancer. These are links; the review did not rule on whether exhaust is the reason.',
      },
      care: {
        'zh-TW': '研究看的是所有車輛的廢氣，不只機車，而且是很多年。{k5}',
        en: 'The studies looked at exhaust from all traffic, not scooters alone, over many years. {k5}',
      },
    },
  },
});
