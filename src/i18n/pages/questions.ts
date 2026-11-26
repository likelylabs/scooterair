// /questions/ and its seven pages (redesign brief 7.5, section 2 and amendment 12.2).
//
// The index is a grid of seven picture cards. Each question page is the question, one picture,
// a one-sentence answer in large type, at most two body sentences, one quiet line (the caveat),
// a sheet behind 怎麼知道的？, and at most two more pictures built the same way.
//
// RULES FOR THIS FILE
//   - Chinese is written first, as people in Taiwan talk, for an upper-primary reader (brief
//     6.6). English follows it sentence for sentence and never says more than the Chinese.
//   - No number is typed here. A `{token}` is filled when the page is built, from the estimate
//     (src/data/estimate.ts) or the fact registry (src/data/facts*.ts): the table of tokens is
//     `questionNumbers()` in src/components/pages/questions/q.ts, which stops the build on a
//     token it cannot fill. Words that are not measurements (一公尺, 一小時, 三個路牌) stay words.
//   - A headline holds at most 22 Chinese characters, a body 45, a quiet line 30: <Screen>
//     stops the build otherwise. Anything longer belongs in the sheet.
//   - The only "not yet known" wording allowed is the K sentences of src/i18n/ui.ts (K4 on
//     /questions/my-child/, K5 on /questions/one-red-light/). They are not retyped here.
//   - Riders are never blamed and never ordered about. Advice about distance has no metres
//     (brief 12.3). Masks: only what research/masks/VERIFIED.json supports, and nothing on its
//     must-not-say list.
//   - The words of the estimate itself (這是算的，不是量的…, 街上原本就有, the recipe flow) are
//     read from src/data/estimate.ts, and the mask names from src/i18n/art.ts.

import { copy } from './_copy.ts';

export default copy({
  index: {
    title: { 'zh-TW': '路口的|七個問題', en: 'Seven questions |at the crossing' },
    description: {
      'zh-TW': '等紅燈的時候會想問的七個問題：那個味道是什麼、小孩呢、口罩擋得住嗎。每一題一張圖，一句話回答。',
      en: 'Seven questions people ask while they wait at a red light: what the smell is, what about a child, whether a mask helps. One picture and a one-sentence answer each.',
    },
    lead: { 'zh-TW': '每一題一張圖，先給一句話的回答。', en: 'One picture for each, and a one-sentence answer first.' },
    listLabel: { 'zh-TW': '七個問題', en: 'The seven questions' },
    answerLabel: { 'zh-TW': '一句話回答', en: 'The short answer' },
    more: {
      title: { 'zh-TW': '還想知道', en: 'Two more' },
      estimate: { 'zh-TW': '這些數字是怎麼算的？', en: 'How were these numbers worked out?' },
      electric: { 'zh-TW': '換一輛電動機車，要多少錢？', en: 'What does an electric scooter cost?' },
    },
  },

  page: {
    back: { 'zh-TW': '全部七個問題', en: 'All seven questions' },
    questionLabel: { 'zh-TW': '問題', en: 'Question' },
    next: { 'zh-TW': '下一題：{q}', en: 'Next: {q}' },
    afterLast: { 'zh-TW': '換一輛電動機車，要多少錢？', en: 'What does an electric scooter cost?' },
    share: {
      title: { 'zh-TW': '傳給家人看', en: 'Send it to your family' },
      lead: { 'zh-TW': '把這一題傳給家人、鄰居，或是家長群組。', en: 'Send this question to family, neighbours or a parents’ group.' },
      line: { 'zh-TW': '傳到 LINE', en: 'Send on LINE' },
      copy: { 'zh-TW': '複製連結', en: 'Copy the link' },
      copied: { 'zh-TW': '連結複製好了', en: 'Link copied' },
      picture: { 'zh-TW': '看分享的圖', en: 'See the share picture' },
    },
    /** Link text of the two pages that moved (shown only if the browser does not follow the redirect). */
    moved: {
      howMuch: { 'zh-TW': '這一題搬到「怎麼算的」', en: 'This question moved to “How we worked it out”' },
      electric: { 'zh-TW': '這一題搬到「換電動」', en: 'This question moved to “Go electric”' },
    },
  },

  /** The question (with '|' where a line may break) and the one line an index card prints. */
  items: {
    smell: {
      q: { 'zh-TW': '那個味道|是什麼？', en: 'What is |that smell?' },
      card: { 'zh-TW': '臭的是沒燒完的汽油。一氧化碳和微粒，聞不到。', en: 'The smell is unburnt petrol. Carbon monoxide and particles have no smell.' },
    },
    'beside-me': {
      q: { 'zh-TW': '站遠一點|有用嗎？', en: 'Does standing back |help?' },
      card: { 'zh-TW': '離排氣管遠一點，通常比較淡；差多少要看風，沒有準確的數字。', en: 'Further from the tailpipe it is usually thinner. How much depends on the wind; there is no exact figure.' },
    },
    app: {
      q: { 'zh-TW': '空氣品質 App |為什麼看不出來？', en: 'Why doesn’t the |air-quality app show it?' },
      card: {
        'zh-TW': '測站在高處，一小時報一次；紅燈只有 {red} 秒，廢氣排在腳邊。',
        en: 'Stations sit high up and report once an hour. A red light lasts {red} seconds, and the exhaust comes out by your feet.',
      },
    },
    'one-red-light': {
      q: { 'zh-TW': '等一個紅燈|有差嗎？', en: 'Does one red light |make a difference?' },
      card: { 'zh-TW': '一個紅燈很短，可是天天都要等。', en: 'One red light is short. But you wait at one every day.' },
    },
    'my-child': {
      q: { 'zh-TW': '我的小孩呢？', en: 'What about |my child?' },
      card: { 'zh-TW': '排氣管和嬰兒車裡的寶寶，都不到一公尺高。', en: 'The tailpipe and a baby in a pushchair are both under a metre high.' },
    },
    rider: {
      q: { 'zh-TW': '騎車的人呢？', en: 'And the rider?' },
      card: { 'zh-TW': '騎車的人，也在這一團裡。這不是誰的錯。', en: 'The rider is in the cloud too. This is nobody’s fault.' },
    },
    mask: {
      q: { 'zh-TW': '口罩擋得住|廢氣嗎？', en: 'Does a mask |stop exhaust?' },
      card: { 'zh-TW': '口罩擋的是微粒。一氧化碳和油氣是氣體，擋不住。', en: 'A mask stops particles. Carbon monoxide and fuel vapour are gases, and pass through.' },
    },
  },

  // ---------------------------------------------------------------------------------------
  // 那個味道是什麼？
  // ---------------------------------------------------------------------------------------
  smell: {
    s1: {
      chapter: { 'zh-TW': '味道', en: 'The smell' },
      headline: { 'zh-TW': '臭的是油氣和醛類。|一氧化碳和微粒，|聞不到', en: 'The smell is fuel vapour and sharp aldehydes. |Carbon monoxide and particles |have no smell' },
      body: {
        'zh-TW': '臭的是沒燒完的汽油和刺鼻的醛（ㄑㄩㄢˊ）類，最可能的主角是乙醛。味道只告訴你一件事：你正站在廢氣裡。',
        en: 'The smell is unburnt petrol and sharp aldehydes; the likeliest main contributor is acetaldehyde. It tells you one thing: you are standing in exhaust.',
      },
      quiet: {
        'zh-TW': '這是照「多淡就聞得到」排的順序，不是真的拿廢氣來聞的測試。',
        en: 'This is a ranking by how little of each you can smell, not a smell test of real exhaust.',
      },
      sheet: {
        title: { 'zh-TW': '怎麼知道|臭的是什麼？', en: 'How do we know |what the smell is?' },
        b1: {
          'zh-TW': '台灣的實驗室量過機車廢氣裡有什麼：最多的是油氣（沒燒完的汽油），醛類裡主要是甲醛和乙醛。日本的實驗量過，每一種東西要多淡，人才聞得到。',
          en: 'A Taiwanese laboratory measured what is in scooter exhaust: mostly fuel vapour (unburnt petrol), and among the aldehydes mainly formaldehyde and acetaldehyde. Experiments in Japan measured how little of each a person can smell.',
        },
        flow: [
          {
            value: { 'zh-TW': '廢氣裡有什麼', en: 'What is in the exhaust' },
            label: { 'zh-TW': '台灣的實驗室量的', en: 'measured in a Taiwanese laboratory' },
          },
          {
            value: { 'zh-TW': '每一種多淡就聞得到', en: 'How little of each can be smelled' },
            label: { 'zh-TW': '日本的實驗量的', en: 'measured in Japan' },
          },
        ],
        result: {
          value: { 'zh-TW': '乙醛最可能是主角', en: 'Acetaldehyde is the likeliest' },
          label: { 'zh-TW': '最淡就聞得到的，排最前面', en: 'what can be smelled when faintest comes first' },
        },
        b2: {
          'zh-TW': '乙醛只要大約十億分之 {acetaldehyde} 就聞得到；苯和最多的那幾種油氣，要百萬分之幾才聞得到。所以那個刺鼻的味道，比較可能是醛類，不是苯。',
          en: 'Acetaldehyde can be smelled at about {acetaldehyde} parts in a billion; benzene and the commonest fuel vapours need a few parts in a million. So the sharp smell is more likely the aldehydes than the benzene.',
        },
        b3: {
          'zh-TW': '真正的味道是很多東西混在一起的，每個人的鼻子也不一樣。',
          en: 'A real smell is a mixture of many things, and no two noses are the same.',
        },
      },
    },
    s2: {
      chapter: { 'zh-TW': '聞不到的', en: 'What has no smell' },
      headline: { 'zh-TW': '聞不到，|不代表沒有', en: 'No smell |does not mean none is there' },
      body: {
        'zh-TW': '一氧化碳沒有味道，微粒也聞不到。油氣裡還有苯（ㄅㄣˇ），是確定會致癌的東西。',
        en: 'Carbon monoxide has no smell, and neither do particles. The vapour also carries benzene, a proven carcinogen.',
      },
      quiet: { 'zh-TW': '世界衛生組織說，苯找不到安全的量。', en: 'The WHO says no safe level of benzene can be recommended.' },
      sheet: {
        b1: {
          'zh-TW': '世界衛生組織（WHO），和它底下的國際癌症研究機構（IARC）。',
          en: 'The World Health Organization (WHO) and its International Agency for Research on Cancer (IARC).',
        },
        b2: {
          'zh-TW': '一氧化碳沒有顏色，也沒有味道。苯列在「確定會讓人得癌症」的那一級，會讓人得一種血癌；世界衛生組織說，找不到可以建議的安全量。',
          en: 'Carbon monoxide has no colour and no smell. Benzene is classed as “carcinogenic to humans” and can give people a kind of leukaemia; the WHO says no safe level of exposure can be recommended.',
        },
        b3: {
          'zh-TW': '這說的是苯這種東西本身，講的是長年一直吸。只等一個紅燈會怎麼樣，不能拿它來算。',
          en: 'This describes benzene itself, breathed over many years. It cannot be used to work out what a single red light does.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------------------
  // 站遠一點有用嗎？
  // ---------------------------------------------------------------------------------------
  besideMe: {
    s1: {
      chapter: { 'zh-TW': '站遠一點', en: 'Standing back' },
      headline: { 'zh-TW': '離排氣管遠一點，|通常比較淡', en: 'Further from the tailpipe, |it is usually thinner' },
      body: {
        'zh-TW': '差多少要看風和距離，沒有準確的數字。別站在車陣正後方，是不花錢就做得到的事。',
        en: 'How much depends on wind and distance; there is no exact figure. Not standing right behind the pack costs nothing.',
      },
      quiet: {
        'zh-TW': '運研所把等候區往後退，尖峰時段的 PM2.5 每立方公尺少了 {a} 和 {b} 微克。',
        en: 'When the Institute of Transportation moved a waiting area back, rush-hour PM2.5 fell by {a} and {b} µg/m³.',
      },
      sheet: {
        b1: {
          'zh-TW': '交通部運輸研究所（運研所）。它把幾個路口的行人等候區往後移，離機車待轉區遠一點，在尖峰時段去量。',
          en: 'Taiwan’s Institute of Transportation, part of the transport ministry. It moved a pedestrian waiting area away from the scooters’ turn box and measured there at rush hour.',
        },
        b2: {
          'zh-TW': '等候區的 PM2.5，平均每立方公尺少了 {a} 和 {b} 微克。差別很小。',
          en: 'PM2.5 in the waiting area fell by {a} and {b} µg/m³ on average: a small change.',
        },
        b3: {
          'zh-TW': '這量的是 PM2.5，而機車讓 PM2.5 變多的量本來就不大。離多遠會少多少，要看風；沒有一條算得準的規則，所以這裡沒有距離的數字。',
          en: 'This is PM2.5, and scooters raise PM2.5 only a little to begin with. How much thinner the air is further away depends on the wind; no rule holds, so there is no distance figure here.',
        },
      },
    },
    s2: {
      chapter: { 'zh-TW': '多了多少', en: 'How much more' },
      box: { 'zh-TW': '一氧化碳', en: 'Carbon monoxide' },
      headline: { 'zh-TW': '一排機車停在旁邊，|路邊多一層廢氣', en: 'A row of scooters beside you |adds a layer of exhaust at the kerb' },
      quiet: {
        'zh-TW': '圈圈越密＝一氧化碳越多。到處都有的稀疏圈圈，是街上原本就有的。',
        en: 'More rings mean more carbon monoxide. The sparse rings everywhere are what the street already holds.',
      },
      sheet: {
        b1: {
          'zh-TW': '環境部的交通測站，2025 年一整年的平均。這是街上原本就有的一氧化碳。',
          en: 'The environment ministry’s traffic air-quality stations, averaged over 2025. This is the carbon monoxide the street already holds.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------------------
  // 空氣品質 App 為什麼看不出來？
  // ---------------------------------------------------------------------------------------
  app: {
    s1: {
      chapter: { 'zh-TW': '空氣 App', en: 'The air app' },
      headline: { 'zh-TW': '測站量的是高處的平均，|不是路口那 {red} 秒', en: 'A station reads an average high up, |not {red} seconds at the kerb' },
      body: {
        'zh-TW': '測站的進氣口在 {lo} 到 {hi} 公尺高，一小時報一次；紅燈 {red} 秒，排氣管不到一公尺高。路口的 PM2.5 和測站差不多，App 看不出來。',
        en: 'A station’s inlet is {lo} to {hi} m up and it reports once an hour; a red light lasts {red} seconds and a tailpipe is under a metre high. PM2.5 at the junction is about the same as at the station, so the app shows nothing.',
      },
      quiet: {
        'zh-TW': 'App 沒有錯。它報的是整個城市的空氣，不是你腳邊那一團。',
        en: 'The app is not wrong. It reports the city’s air, not the cloud at your feet.',
      },
      sheet: {
        b1: {
          'zh-TW': '台北市環保局的交通測站（{coYear} 年年報）、交通部運輸研究所（運研所）放在路口行人等候區的感測器（2024 年 7 月），和環境部的全台一般測站（2025 年平均）。',
          en: 'Taipei’s roadside air-quality stations (the city’s {coYear} annual report), the sensors Taiwan’s Institute of Transportation put in pedestrian waiting areas (July 2024), and the environment ministry’s general stations across Taiwan (2025 average).',
        },
        b2: {
          'zh-TW': '測站的進氣口離地 {lo} 到 {hi} 公尺，報的是每小時的平均。運研所在路口等候區量到的 PM2.5，大多是每立方公尺 {pmLo} 到 {pmHi} 微克；環境部的全台一般測站 2025 年的平均是 {pmBg} 微克，大小差不多（不同年份、不同季節，只能看大小）。',
          en: 'Station inlets are {lo} to {hi} m above the ground and report hourly averages. The Institute’s waiting-area PM2.5 was mostly {pmLo} to {pmHi} µg/m³; the environment ministry’s general stations across Taiwan averaged {pmBg} µg/m³ in 2025, much the same size (a different year and season, so a comparison of size only).',
        },
        b3: {
          'zh-TW': 'App 上最常看到的數字是 PM2.5。機車在紅燈時排的，主要是一氧化碳和油氣，這兩樣 App 的 PM2.5 看不出來。',
          en: 'The number apps show most is PM2.5. What scooters give off at a red light is mainly carbon monoxide and fuel vapour, and an app’s PM2.5 figure shows neither.',
        },
      },
    },
    s2: {
      chapter: { 'zh-TW': '量到的和算的', en: 'Measured and estimated' },
      headline: { 'zh-TW': '測站報的，|是街上原本就有的', en: 'What the station reports |is what the street already holds' },
      body: {
        'zh-TW': '測站告訴你街上平常有多少。紅燈時機車旁邊的那一層，要另外量、另外算。',
        en: 'A station tells you what the street usually holds. The layer beside the scooters at a red light has to be measured, or worked out, separately.',
      },
      sheet: {
        b1: {
          'zh-TW': '環境部的交通測站 2025 年的平均；還有運研所 2024 年 7 月在 {peakSites} 個路口的行人等候區，量到的最高一分鐘。',
          en: 'The environment ministry’s traffic stations, averaged over 2025; and the highest minute the Institute of Transportation recorded in pedestrian waiting areas at {peakSites} junctions in July 2024.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------------------
  // 等一個紅燈有差嗎？
  // ---------------------------------------------------------------------------------------
  oneRedLight: {
    s1: {
      chapter: { 'zh-TW': '天天等', en: 'Every day' },
      headline: { 'zh-TW': '一個紅燈很短，|可是天天都要等', en: 'One red light is short. |But you wait at one every day' },
      stepper: { 'zh-TW': '一天等幾個紅燈？', en: 'How many red lights a day?' },
      stepperOption: { 'zh-TW': '{n} 個', en: '{n}' },
      body: {
        reds2: {
          'zh-TW': '一天等兩個紅燈，一年就在路邊站了約 {lo} 到 {hi} 小時。',
          en: 'Two red lights a day add up to about {lo} to {hi} hours a year at the kerb.',
        },
        reds4: {
          'zh-TW': '一天等四個紅燈，一年就在路邊站了約 {lo} 到 {hi} 小時。',
          en: 'Four red lights a day add up to about {lo} to {hi} hours a year at the kerb.',
        },
        reds6: {
          'zh-TW': '一天等六個紅燈，一年就在路邊站了約 {lo} 到 {hi} 小時。',
          en: 'Six red lights a day add up to about {lo} to {hi} hours a year at the kerb.',
        },
        posts: { 'zh-TW': '圖上三個路牌，是研究看到身體有變化的時間。', en: 'The three signposts show how long it took before studies saw a change in the body.' },
      },
      quiet: { 'zh-TW': '這些研究量的是各種來源的髒空氣，不是只有機車。', en: 'These studies measured dirty air from all sources, not scooters alone.' },
      posts: [
        {
          when: { 'zh-TW': '{minutes} 分鐘', en: '{minutes} minutes' },
          text: { 'zh-TW': '心跳的節奏小小變了一下（高雄，{people} 人）', en: 'A small change in the heart’s rhythm (Kaohsiung, {people} people)' },
        },
        {
          when: { 'zh-TW': '{hours} 小時', en: '{hours} hours' },
          text: { 'zh-TW': '氣喘的人，肺功能小幅下降（倫敦）', en: 'In people with asthma, a small drop in lung function (London)' },
        },
        {
          when: { 'zh-TW': '很多年', en: 'Many years' },
          text: { 'zh-TW': '氣喘、心臟病、肺癌比較多（{studies} 篇研究）', en: 'More asthma, heart disease and lung cancer ({studies} studies)' },
        },
      ],
      sheet: {
        title: { 'zh-TW': '一年站多久，|是怎麼算的', en: 'How the hours a year |are worked out' },
        b1: {
          'zh-TW': '一個紅燈算 {secLo} 到 {secHi} 秒，一年算 {days} 天。一天等幾個，你自己選。',
          en: 'One red light is counted as {secLo} to {secHi} seconds, and a year as {days} days. How many a day is your choice.',
        },
        b3: {
          'zh-TW': '一天四個紅燈，讓你一整天吸到的一氧化碳多不到 {share}%。整天在路邊工作的人（交通警察、攤販、導護）就不一樣，一個紅燈接一個紅燈，加起來就像一直待在路邊。',
          en: 'Four red lights a day add less than {share}% to the carbon monoxide you breathe over a whole day. It is different for people who work at the kerb all day (traffic police, street vendors, school crossing guards): one red light after another adds up to standing at the roadside all the time.',
        },
        studiesTitle: { 'zh-TW': '三個路牌，各是什麼研究', en: 'The study behind each signpost' },
        studies: [
          {
            'zh-TW': '高雄：{people} 個人戴著感測器過日子。PM2.5 突然升高的那 {minutes} 分鐘，心跳的節奏小小變了一下；這是身體的訊號，不是生病。高雄找到的高峰，主要來自工廠、蚊香、燒稻草和燒香。',
            en: 'Kaohsiung: {people} people wore sensors through their days. In the {minutes} minutes after PM2.5 jumped, the heart’s rhythm shifted a little: a signal, not an illness. The peaks found in Kaohsiung came mainly from factories, mosquito coils, straw burning and incense.',
          },
          {
            'zh-TW': '倫敦：{asthma} 個有氣喘的大人，在柴油車很多的街上走了 {hours} 小時，肺功能小幅下降，本人沒有感覺。',
            en: 'London: {asthma} adults with asthma walked for {hours} hours along a street full of diesel traffic. Their lung function fell a little, without symptoms they could feel.',
          },
          {
            'zh-TW': '{studies} 篇長期研究：長年吸車子廢氣的人，氣喘、心臟病、肺癌比較多。這是「有關」，研究沒有判定因果。',
            en: '{studies} long-term studies: people who breathe traffic exhaust for years have more asthma, heart disease and lung cancer. This is a link the studies found, not proof of what brings it about.',
          },
        ],
      },
    },
    s2: {
      chapter: { 'zh-TW': '吸進去以後', en: 'Once breathed in' },
      headline: {
        'zh-TW': '長年吸車子的廢氣，|和氣喘、|心臟病、|肺癌有關',
        en: 'Years of breathing traffic exhaust |are linked to asthma, heart disease |and lung cancer',
      },
      body: {
        'zh-TW': '這是 {studies} 篇長期研究的結論，講的是所有車輛的廢氣，不只機車。圖上是廢氣進到身體以後去的地方。',
        en: 'That is the finding of a review of {studies} long-term studies of exhaust from all traffic, not scooters alone. The picture shows where exhaust goes once it is inside the body.',
      },
      pins: {
        nose: { 'zh-TW': '鼻子、喉嚨：聞得到的油氣和醛（ㄑㄩㄢˊ）類，會刺激鼻子和喉嚨。', en: 'Nose and throat: the vapour and aldehydes you can smell irritate them.' },
        lungs: { 'zh-TW': '肺：很小的微粒，可以進到肺的深處。', en: 'Lungs: very small particles reach deep into the lungs.' },
        blood: {
          'zh-TW': '血液：一氧化碳從肺進到血液，占掉載氧氣的位子。',
          en: 'Blood: carbon monoxide passes from the lungs into the blood and takes up room meant for oxygen.',
        },
      },
      sheet: {
        b1: {
          'zh-TW': '美國的健康效應研究所（HEI），{heiYear} 年把 {studies} 篇長期研究整理在一起。',
          en: 'The Health Effects Institute in the United States, which reviewed {studies} long-term studies in {heiYear}.',
        },
        b2: {
          'zh-TW': '新得氣喘的比較多；因為心臟病、肺癌過世的也比較多。',
          en: 'More people newly developed asthma; more died of heart disease and of lung cancer.',
        },
        b3: {
          'zh-TW': '這是「有關」，研究沒有判定因果。研究大多在歐洲和北美做，講的是所有車輛的廢氣，不只機車。',
          en: 'This is a link the studies found, not proof of what brings it about. Most were done in Europe and North America, and they cover exhaust from all traffic, not scooters alone.',
        },
        routes: {
          'zh-TW': '圖上三條路線，講的是這些東西本身的性質；路口的量，比會讓人馬上不舒服的量低很多。',
          en: 'The three routes in the picture describe what these substances do in themselves; the amounts at a junction are far below those that make people feel unwell at once.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------------------
  // 我的小孩呢？
  // ---------------------------------------------------------------------------------------
  myChild: {
    s1: {
      chapter: { 'zh-TW': '誰最近', en: 'Who is closest' },
      headline: { 'zh-TW': '同一個路口，|小孩離排氣管最近', en: 'Same junction: |the child is closest to the tailpipe' },
      body: {
        'zh-TW': '排氣管和嬰兒車裡的寶寶，都不到一公尺高。照體重算，小孩吸進的空氣是大人的 {lo} 到 {hi} 倍。',
        en: 'The tailpipe and a baby in a pushchair are both less than a metre off the ground. For their body weight, children breathe {lo} to {hi} times as much air as adults.',
      },
      sheet: {
        b1: {
          'zh-TW': '美國環保署的《暴露參數手冊》，整理了每個年紀的人，一天吸進多少空氣。',
          en: 'The US Environmental Protection Agency’s Exposure Factors Handbook, which sets out how much air people of each age breathe in a day.',
        },
      },
    },
    backSeat: {
      q: { 'zh-TW': '坐在機車後座的|小孩呢？', en: 'And a child |on the back seat?' },
      answer: {
        'zh-TW': '國外量過：在印尼萬隆和尼泊爾加德滿都，小孩上學的路上，坐機車和走路的那一段，吸到的 PM2.5 最高。坐在後座的小孩，吸到的應該和騎士差不多；這是我們的推論。',
        en: 'It has been measured abroad: in Bandung, Indonesia and Kathmandu, Nepal, the stretches of a child’s school journey spent on a scooter or on foot came with the highest PM2.5. A child on the back seat probably breathes about what the rider breathes; that is our inference.',
      },
      sheet: {
        b1: {
          'zh-TW': '一項 {year} 年發表的研究，讓印尼萬隆和尼泊爾加德滿都的小孩，自己背著感測器上學、放學。',
          en: 'A study published in {year} gave children in Bandung and Kathmandu sensors to carry to school and back.',
        },
        b2: {
          'zh-TW': '上學、放學的路上，坐機車和走路的那一段，PM2.5 最高。',
          en: 'On the way to and from school, the stretches on a scooter or on foot had the highest PM2.5.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------------------
  // 騎車的人呢？
  // ---------------------------------------------------------------------------------------
  rider: {
    s1: {
      chapter: { 'zh-TW': '騎士也在裡面', en: 'The rider too' },
      headline: { 'zh-TW': '騎車的人，|也在這一團裡', en: 'The rider |is in the cloud too' },
      body: {
        'zh-TW': '排在後面的騎士，前面就是別人的排氣管。這不是誰的錯，大家都泡在同一團廢氣裡。',
        en: 'A rider in the second row sits right behind someone else’s tailpipe. This is nobody’s fault: everyone at the junction is in the same cloud.',
      },
      quiet: {
        'zh-TW': '台北量過：騎機車和走路的人，吸到的 PM2.5 平均都比搭捷運的多。',
        en: 'Measured in Taipei: people on scooters and people on foot both breathed more PM2.5, on average, than people on the metro.',
      },
      sheet: {
        b1: {
          'zh-TW': '台北一項研究（Chuang 等，{year} 年發表），讓健康的年輕人用不同的方式通勤，早上量一小時，儀器帶在身上。',
          en: 'A Taipei study (Chuang et al., published {year}) had healthy young adults commute in different ways for one morning hour, carrying the instrument with them.',
        },
        b2: {
          'zh-TW': '一小時的 PM2.5 平均，每立方公尺：騎燃油機車 {scooter} 微克、走路 {walking}、搭公車 {bus}、坐汽車 {car}、搭捷運 {metro}。',
          en: 'Mean PM2.5 over the hour, in µg/m³: petrol scooter {scooter}, walking {walking}, bus {bus}, car {car}, metro {metro}.',
        },
        b3: {
          'zh-TW': '這是各種來源的 PM2.5，只量早上一小時。騎機車和走路都明顯比搭捷運、坐汽車多；這兩種之間差多少，統計上分不出來。量的是每個人自己吸到的；這項研究只量 PM2.5，不包括一氧化碳和苯。',
          en: 'This is PM2.5 from all sources, over one morning hour only. Scooter and walking were clearly higher than metro and car, but did not differ significantly from each other. It is what each person breathed; the study covered PM2.5 only, not carbon monoxide or benzene.',
        },
      },
    },
    s2: {
      chapter: { 'zh-TW': '五種通勤', en: 'Five ways to commute' },
      headline: { 'zh-TW': '騎機車和走路，|吸到的都比搭捷運多', en: 'On a scooter or on foot, |more PM2.5 than on the metro' },
      body: {
        'zh-TW': '這是台北一項研究，早上通勤一小時量到的 PM2.5 平均，各種來源都算。騎機車和走路的差別，統計上分不出來。',
        en: 'This is the mean PM2.5 from all sources over a one-hour morning commute in a Taipei study. Scooter and walking did not differ significantly.',
      },
      quiet: {
        'zh-TW': '量的是通勤的人自己吸到的，不是紅燈時機車旁邊的空氣。',
        en: 'It is what each commuter breathed on the way, not the air beside the scooters at a red light.',
      },
      chart: {
        title: { 'zh-TW': '通勤一小時吸到的 PM2.5', en: 'PM2.5 breathed over a one-hour commute' },
        sub: { 'zh-TW': '平均・各種來源・早上一小時', en: 'Average · all sources · one morning hour' },
        unitLine: { 'zh-TW': '單位：微克／立方公尺', en: 'In µg/m³' },
        modes: {
          scooter: { 'zh-TW': '騎燃油機車', en: 'Petrol scooter' },
          walking: { 'zh-TW': '走路', en: 'Walking' },
          bus: { 'zh-TW': '搭公車', en: 'Bus' },
          car: { 'zh-TW': '坐汽車', en: 'Car' },
          metro: { 'zh-TW': '搭捷運', en: 'Metro' },
        },
        summary: {
          'zh-TW': '台北通勤一小時吸到的 PM2.5 平均，由多到少：{rows}。騎機車和走路的差別，統計上分不出來。',
          en: 'Mean PM2.5 breathed over a one-hour commute in Taipei, highest first: {rows}. Scooter and walking did not differ significantly.',
        },
        row: { 'zh-TW': '{mode} {value} 微克／立方公尺', en: '{mode} {value} µg/m³' },
        tableMode: { 'zh-TW': '通勤方式', en: 'Way of commuting' },
        tableValue: { 'zh-TW': 'PM2.5 平均（微克／立方公尺）', en: 'Mean PM2.5 (µg/m³)' },
      },
      act: { 'zh-TW': '不換車，騎車的人可以做什麼？', en: 'Not switching? What a rider can do' },
    },
  },

  // ---------------------------------------------------------------------------------------
  // 口罩擋得住廢氣嗎？ (research/masks/VERIFIED.json)
  // ---------------------------------------------------------------------------------------
  mask: {
    s1: {
      chapter: { 'zh-TW': '口罩', en: 'Masks' },
      headline: { 'zh-TW': '醫用口罩|擋不住機車廢氣', en: 'A surgical mask |won’t stop scooter exhaust' },
      body: {
        'zh-TW': '口罩擋的是微粒，而且會從邊緣漏。一氧化碳和油氣是氣體，連貼合的 N95 都擋不住。',
        en: 'A mask stops particles, and it leaks round the edges. Carbon monoxide and fuel vapour are gases; even a fitted N95 does not stop them.',
      },
      quiet: { 'zh-TW': '口罩防感冒、流感還是有用。', en: 'A mask still helps against colds and flu.' },
      switch: { 'zh-TW': '換一種口罩看看', en: 'Try another mask' },
      sheet: {
        b1: {
          'zh-TW': '美國職業安全衛生研究所（NIOSH），就是負責認證 N95 口罩的機關。',
          en: 'The US National Institute for Occupational Safety and Health (NIOSH), the body that certifies N95 respirators.',
        },
        b2: {
          'zh-TW': '一氧化碳這類氣體和汽油的蒸氣，N95 這類口罩都擋不住，因為它只過濾微粒。醫用口罩和布口罩也一樣：裡面沒有能吸住氣體的材料。',
          en: 'N95-type respirators filter particles only: they do not stop gases such as carbon monoxide, or petrol vapour. Surgical and cloth masks are the same: nothing in them can hold a gas.',
        },
        b3: {
          'zh-TW': '這講的是口罩材料的性質，不是在台灣街頭量的；醫用口罩和布口罩的部分，是我們照同樣的道理推論的。工業用的防毒面具加上濾罐，可以處理一氧化碳，可是平常戴的口罩都不是這種。',
          en: 'This is about what the filter is, not a reading taken on a Taiwanese street; the part about surgical and cloth masks is our reasoning from the same principle. An industrial gas mask with a canister can deal with carbon monoxide, but no everyday mask is one.',
        },
      },
    },
    s2: {
      chapter: { 'zh-TW': '四種口罩', en: 'Four masks' },
      headline: { 'zh-TW': '四種口罩，|一氧化碳都擋不住', en: 'Four kinds of mask. |None stops carbon monoxide' },
      body: {
        'zh-TW': '活性碳口罩能吸住一點油氣，可是常常幾分鐘就滿了。貼合的 N95 能擋住大部分微粒，可是擋不住氣體。',
        en: 'An activated-carbon mask holds a little fuel vapour, but is often full within minutes. A fitted N95 stops most particles, but not gases.',
      },
      quiet: { 'zh-TW': '想少吸一點廢氣，能做的是離機車遠一點。', en: 'To breathe less exhaust, what you can do is stand further from the scooters.' },
      act: { 'zh-TW': '走路的人，還可以做什麼？', en: 'What else can someone on foot do?' },
      table: {
        caption: { 'zh-TW': '四種口罩，各擋住什麼', en: 'What each of four masks stops' },
        mask: { 'zh-TW': '口罩', en: 'Mask' },
        gases: { 'zh-TW': '氣體（一氧化碳、油氣）', en: 'Gases (carbon monoxide, fuel vapour)' },
        ultrafine: { 'zh-TW': '很小的微粒（超細微粒）', en: 'The smallest particles (ultrafine)' },
        pm25: { 'zh-TW': '細懸浮微粒（PM2.5）', en: 'Fine particles (PM2.5)' },
        /** The same three columns, in a word or two: the label beside each line on a phone. */
        short: {
          gases: { 'zh-TW': '氣體', en: 'Gases' },
          ultrafine: { 'zh-TW': '超細微粒', en: 'Ultrafine' },
          pm25: { 'zh-TW': 'PM2.5', en: 'PM2.5' },
        },
        /** One row per entry of research/masks/VERIFIED.json → tableRows, in the same order.
         *  The English is that file's own wording; the page stops the build if it differs. */
        rows: [
          {
            name: { 'zh-TW': '布口罩', en: 'Cloth mask' },
            gases: { 'zh-TW': '擋不住', en: 'None' },
            ultrafine: { 'zh-TW': '幾乎擋不住（大多穿過布，或從邊緣進去）', en: 'Very little (most passes through the cloth and around the edges)' },
            pm25: { 'zh-TW': '擋住一點，漏很多', en: 'A little, leaks a lot' },
          },
          {
            name: { 'zh-TW': '醫用口罩', en: 'Surgical / medical mask' },
            gases: { 'zh-TW': '擋不住', en: 'None' },
            ultrafine: { 'zh-TW': '擋住一些，邊緣會漏', en: 'Some, leaks at the edges' },
            pm25: { 'zh-TW': '擋住一些，邊緣會漏', en: 'Some, leaks at the edges' },
          },
          {
            name: { 'zh-TW': '活性碳口罩', en: 'Activated-carbon mask' },
            gases: {
              'zh-TW': '一氧化碳：擋不住。苯和其他油氣：吸住一點，撐不久（常常只有幾分鐘）',
              en: 'Carbon monoxide: none. Benzene and other vapours: a little, briefly (often minutes)',
            },
            ultrafine: {
              'zh-TW': '和它底下那層口罩一樣（醫用口罩那種：擋住一些，邊緣會漏）',
              en: 'Same as the mask it is built on (surgical-type: some, leaks at the edges)',
            },
            pm25: {
              'zh-TW': '和它底下那層口罩一樣（醫用口罩那種：擋住一些，邊緣會漏）',
              en: 'Same as the mask it is built on (surgical-type: some, leaks at the edges)',
            },
          },
          {
            name: { 'zh-TW': '貼合的 N95／FFP2 口罩', en: 'Fitted N95 / FFP2 respirator' },
            gases: { 'zh-TW': '擋不住', en: 'None' },
            ultrafine: { 'zh-TW': '戴得貼合的話，擋住大部分', en: 'Most, if it fits' },
            pm25: { 'zh-TW': '戴得貼合的話，擋住大部分', en: 'Most, if it fits' },
          },
        ],
      },
      sheet: {
        title: { 'zh-TW': '這張表|是怎麼來的', en: 'Where this table |comes from' },
        b1: {
          'zh-TW': '荷蘭、美國、英國的口罩實驗，還有台灣勞動部勞動及職業安全衛生研究所（勞安所）的兩次測試。',
          en: 'Mask experiments in the Netherlands, the United States and Britain, and two tests by the research institute of Taiwan’s labour ministry.',
        },
        tests: [
          {
            'zh-TW': '荷蘭讓真人戴著測：醫用口罩和布口罩，都有不少很小的微粒進得去。大人戴歐規的 N95（FFP2）好很多，小孩戴的效果差很多。',
            en: 'A Dutch study tested masks on real people: with surgical and cloth masks a good share of the smallest particles still got in. An FFP2 (the European N95) did far better on adults, and much less well on children.',
          },
          {
            'zh-TW': '台灣，{molYear} 年：當時勞委會的勞工安全衛生研究所測了 {molTested} 款拋棄式活性碳口罩，沒有一款撐得過國家標準要求的 {molMinutes} 分鐘。',
            en: 'Taiwan, {molYear}: the labour ministry’s institute tested {molTested} disposable activated-carbon masks, and none lasted the {molMinutes} minutes the national standard asks for.',
          },
          {
            'zh-TW': '台灣，{iloshYear} 年：勞安所找 {iloshPeople} 位大人實測。比的是分數，不是百分比：頭帶式 N95 是 {headband}，耳掛式 N95 是 {earloop}，一般醫用口罩是 {medical}。{iloshPeople} 位裡，只有 {fitPassed} 位戴耳掛式 N95 能貼合。',
            en: 'Taiwan, {iloshYear}: the labour ministry’s institute tested {iloshPeople} adults. These are scores for comparing masks, not percentages: headband N95 {headband}, ear-loop N95 {earloop}, an ordinary medical mask {medical}. Only {fitPassed} of the {iloshPeople} got a proper seal with an ear-loop N95.',
          },
        ],
        b3: {
          'zh-TW': '口罩對微粒不是沒有用：北京一項試驗裡，心臟病患者戴貼合的防塵口罩走路，血壓低了一點。這些測試用的是鹽粒、蠟燭煙或柴油廢氣，不是台灣路口的機車廢氣。',
          en: 'Against particles a mask is not without use: in a Beijing trial, heart patients who walked wearing a well-fitting dust respirator had slightly lower blood pressure. These tests used salt particles, candle smoke or diesel exhaust, not scooter exhaust at a Taiwanese junction.',
        },
      },
    },
  },
});
