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
      card: { 'zh-TW': '推估：聞到機車廢氣時，苯也跟著一起來；聞不到，不代表空氣乾淨。', en: 'Estimate: when you smell scooter exhaust, benzene comes with it; no smell does not mean clean air.' },
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
    /** Screen 1 (#answer): statements-smell smell-comes-with-benzene, what-is-in-it, no-smell-not-clean (same view), and hazard-labels as its own paragraph. */
    s1: {
      chapter: { 'zh-TW': '跟著味道來的', en: 'What comes with the smell' },
      headline: { 'zh-TW': '聞到的不是苯，|但苯跟著一起來', en: 'What you smell is not benzene, |but benzene comes with it' },
      body: {
        'zh-TW': '推估：只要聞得到身旁沒熄火的機車廢氣，同一口空氣裡就有苯（ㄅㄣˇ）和十幾種廢氣成分。聞不到，不代表空氣乾淨。',
        en: 'Estimate: whenever you can smell the exhaust of the idling scooters beside you, the same breath of air holds benzene and about ten other exhaust chemicals. No smell does not mean clean air.',
      },
      /** what-is-in-it, in its signed order (benzene, 1,3-butadiene, formaldehyde, then the largest shares, toluene and xylenes), each name given once with a plain gloss; the full share-ordered list is in the sheet and on /estimate/. */
      names: {
        'zh-TW': '苯是汽油裡就有的一種成分，廢氣裡也有。1,3-丁二烯和甲醛（ㄑㄩㄢˊ），是廢氣裡另外兩種氣體。廢氣裡占最多的，是甲苯和二甲苯。',
        en: 'Benzene is a substance found in petrol, and in exhaust too. 1,3-Butadiene and formaldehyde are two other gases in exhaust. The largest shares of the exhaust are toluene and xylenes.',
      },
      /** hazard-labels, verbatim: a separate paragraph, no smell word, no number. */
      hazard: {
        'zh-TW': '世界衛生組織的癌症研究機構（IARC）把苯、1,3-丁二烯、甲醛列為「確定會讓人致癌」的第1類。這是說「證據有多強」，不是說等一個紅燈會有多少風險。汽油引擎廢氣整體被列為第2B類（「可能致癌」）。',
        en: 'The World Health Organization’s cancer agency (IARC) puts benzene, 1,3-butadiene and formaldehyde in Group 1, ‘causes cancer in humans’. That describes how strong the evidence is, not the risk from waiting at one red light. Petrol-engine exhaust as a whole is Group 2B, ‘possibly causes cancer’.',
      },
      quiet: {
        'zh-TW': '這些成分各占多少，是量舊型機車得來的；新型機車可能不一樣。',
        en: 'The shares come from tests of older scooters; newer ones may differ.',
      },
      sheet: {
        title: { 'zh-TW': '怎麼知道|苯跟著一起來？', en: 'How do we know |benzene comes with it?' },
        b1: {
          'zh-TW': '我們用電腦，一秒一秒算了紅燈時的風和廢氣。廢氣裡每一種成分占多少，用的是台灣、印度、尼泊爾在機車引擎沒熄火、停著不動時量的資料。',
          en: 'On a computer we worked out the wind and the exhaust second by second through a red light. The share of each chemical in the exhaust comes from measurements of idling scooters in Taiwan, India and Nepal.',
        },
        flow: [
          {
            value: { 'zh-TW': '每一種成分占多少', en: 'How much of each chemical' },
            label: { 'zh-TW': '量的：舊型機車停著、引擎沒熄火', en: 'measured: older scooters idling' },
          },
          {
            value: { 'zh-TW': '廢氣怎麼飄到你身邊', en: 'How the exhaust reaches you' },
            label: { 'zh-TW': '電腦算的一個紅燈', en: 'one red light, simulated' },
          },
        ],
        result: {
          value: { 'zh-TW': '聞得到的時候，苯也在', en: 'When you can smell it, benzene is there' },
          label: { 'zh-TW': '味道和苯來自同一團廢氣', en: 'the smell and the benzene come from the same exhaust' },
        },
        b2: {
          'zh-TW': '在電腦裡，味道和每一種成分都來自同一團廢氣，一起變濃、一起變淡。所以只要那個味道來自身旁的機車，苯就在同一口空氣裡。照廢氣裡占的多少排，依序是甲苯、二甲苯、乙苯、苯、1,3-丁二烯、正己烷、甲醛、乙醛、萘、苯乙烯和丙烯醛。',
          en: 'In the model, the smell and every chemical come from the same exhaust and thicken and thin together. So whenever the smell comes from the scooters beside you, benzene is in the same breath of air. In order of their share of the exhaust: toluene, xylenes, ethylbenzene, benzene, 1,3-butadiene, n-hexane, formaldehyde, acetaldehyde, naphthalene, styrene and acrolein.',
        },
        b3: {
          'zh-TW': '這句話要成立，味道得是身旁機車的廢氣；路上的味道也可能來自別的車或別的地方。新型、有觸媒的機車，成分可能不一樣。每個數字都是推估，都有範圍。',
          en: 'This holds only if the smell is the exhaust of the scooters beside you; a smell in the street can come from other vehicles or other sources. Newer scooters with a catalyst may hold a different mix. Every number is an estimate with a range.',
        },
        estimateLink: { 'zh-TW': '數字和範圍', en: 'The numbers and ranges' },
        method: { 'zh-TW': '方法（研究檔案，英文）', en: 'The method (research file)' },
      },
    },
    /** Screen 2 (#what): statements-smell not-unburnt-petrol. Picture: the SmellBenzene chart. */
    s2: {
      chapter: { 'zh-TW': '是什麼味道', en: 'What the smell is' },
      headline: { 'zh-TW': '那個味道，比較可能|是燒過才有的', en: 'The smell more likely |comes from burning' },
      body: {
        'zh-TW': '推估：那個刺鼻的味道，有一部分比較可能來自燃燒產生的醛（ㄑㄩㄢˊ）類，不是沒燒完的汽油。苯要很濃才聞得到。',
        en: 'Estimate: part of the sharp smell more likely comes from aldehydes formed by burning, not from unburnt petrol. Benzene can only be smelled when it is very strong.',
      },
      quiet: {
        'zh-TW': '這只能粗略估計，可能差到十倍左右；我們分不出你聞到的是哪一種。',
        en: 'This is only a rough estimate, within about ten times; we cannot tell which chemical you smell.',
      },
      sheet: {
        title: { 'zh-TW': '怎麼知道|味道不是苯？', en: 'How do we know |the smell is not benzene?' },
        b1: {
          'zh-TW': '日本的實驗量過，每一種東西要多淡，人才聞得到（嗅覺門檻）；美國環保署也整理過這些數字。',
          en: 'Experiments in Japan measured how little of each substance people can smell (the odour threshold); the US EPA has compiled these figures too.',
        },
        b2: {
          'zh-TW': '苯要百萬分之幾才聞得到；乙醛只要大約十億分之 {acetaldehyde}。推估：在每一種電腦算的情況裡，聞得到的那幾秒，乙醛在六成到全部的情形下，高過這個量。在一群機車的情況裡，苯一次也沒有到它自己聞得到的量，乙醛也從來沒有濃到「一聞就很清楚」。甲苯、二甲苯、甲醛等，有時也高過它們最低的嗅覺門檻。',
          en: 'Benzene can only be smelled at parts per million; acetaldehyde at only about {acetaldehyde} parts per billion. Estimate: in every simulated case, during the seconds you can smell it, acetaldehyde is above that level in six in ten to all of the runs. In the cases with a group of scooters, benzene never reaches the level at which it can itself be smelled, and acetaldehyde never gets strong enough to be clearly noticeable. Toluene, xylenes, formaldehyde and others are sometimes above their lowest odour thresholds too.',
        },
        b3: {
          'zh-TW': '嗅覺門檻每個人不一樣，不同來源差到十倍、百倍，所以只能粗略估計。沒燒完的汽油蒸氣，我們沒有另外算。真正的味道是很多東西混在一起的。',
          en: 'Odour thresholds differ from person to person and between sources by ten to a hundred times, so only a rough estimate is possible. Unburnt petrol vapour was not worked out separately. A real smell is a mixture of many things.',
        },
      },
    },
    /** Screen 3 (#more): statements-smell no-smell-not-clean, with how-often-wind; one-red is in its own block, away from the hazard labels. */
    s3: {
      chapter: { 'zh-TW': '聞不到的時候', en: 'When you cannot smell it' },
      headline: { 'zh-TW': '聞不到，|不代表空氣乾淨', en: 'No smell |does not mean clean air' },
      body: {
        'zh-TW': '推估：沒有味道的時候，也可能有苯。一氧化碳沒有味道，微粒小到看不到。',
        en: 'Estimate: benzene can be there when nothing can be smelled. Carbon monoxide has no smell, and particles are too small to see.',
      },
      quiet: {
        'zh-TW': '推估：聞不聞得到要看風。兩邊高樓、風順著街吹時，很多紅燈聞不到。',
        en: 'Estimate: it depends on the wind. Between tall buildings, with the wind along the street, many reds have no smell.',
      },
      sheet: {
        b1: {
          'zh-TW': '推估：電腦算的這種街（20 公尺寬、兩邊 12 公尺高的樓，風順著街吹），離最近的機車半公尺、小孩鼻子的高度（約 0.7 公尺）：用 1967 年研究的「聞得到」標準，中間的推估是 1,000 次裡只有 {canyon} 次有任何一秒聞得到（看風怎麼算，{canyonLo} 到 {canyonHi} 次）；用 1970 年研究的標準，大多數都有。不管哪一種，苯整個紅燈都在。這種街的數字可能算低了；這不是說這種街比較好。每種情況只算了一個紅燈，信心低。',
          en: 'Estimate: in this simulated street (20 m wide, 12 m buildings, wind along the street), half a metre from the nearest scooter at a child’s nose height (about 0.7 m): by the 1967 study’s ‘can smell it’ level, the central estimate is that only {canyon} of 1,000 runs have any smellable second ({canyonLo} to {canyonHi}, depending on how the wind is worked out); by the 1970 study’s level, most do. Either way, benzene is there through the whole red. The numbers for this street are probably low; this does not mean such streets are better. Each case is one simulated red; confidence is low.',
        },
        b2: {
          'zh-TW': '一氧化碳沒有顏色，也沒有味道（世界衛生組織）。',
          en: 'Carbon monoxide has no colour and no smell (WHO).',
        },
        /** one-red with its mustCarry; never next to the hazard labels (they are on screen 1). */
        b3: {
          'zh-TW': '推估：只等一個紅燈，依我們的中間推估，這些化學物質都不會因此達到 30 分鐘或 1 小時的公共參考值（衛生單位訂的、用來比的數值）。很少見的情形：幾乎沒有風、站在一根排氣管下風半公尺，最壞的情況可能到。信心低。沒到參考值，不代表「安全」。',
          en: 'Estimate: waiting through one red light does not, on its own, bring any of these chemicals to a 30-minute or 1-hour public reference level (a value health agencies set for comparison), in our central estimate. In a rare near-calm case, standing half a metre downwind of one tailpipe, the worst case can reach them. Confidence is low. Below a reference level does not mean ‘safe’.',
        },
      },
    },
    /** The card #how-much: seconds-long benzene only (how-much-just-smellable, level-in-smellable-seconds, how-often-wind). Nothing here is a 30-minute, 1-hour or yearly value. */
    howMuch: {
      q: { 'zh-TW': '聞得到的時候，|有多少苯？', en: 'When you can smell it, |how much benzene is there?' },
      gloss: { 'zh-TW': 'ppb＝十億份空氣裡有幾份。', en: 'ppb = parts in a billion of air.' },
      lines: [
        { 'zh-TW': '推估：剛好聞得到廢氣味的時候，苯是{just}（最低約 {lo}，最高約 {hi}）。', en: 'Estimate: at the moment the exhaust is just noticeable, benzene is {just} (lowest about {lo}, highest about {hi}).' },
        { 'zh-TW': '這是常見的量，不是最少的量。兩個數字來自 1967 和 1970 年兩個汽車廢氣的嗅覺研究。', en: 'This is a typical value, not a minimum. The two numbers come from two smell tests of car exhaust from 1967 and 1970.' },
        { 'zh-TW': '推估：風從一群機車吹向人行道時，在離最近一台機車半公尺、小孩鼻子的高度（約 0.7 公尺），聞得到的那幾秒裡，苯平均大約 {about}，範圍{seconds}。', en: 'Estimate: with the wind blowing from a group of scooters toward the pavement, half a metre from the nearest one at a child’s nose height (about 0.7 m), benzene averages about {about} over the seconds you can smell it, range {seconds}.' },
        { 'zh-TW': '這種風，尖峰時段最多大約八個紅燈有一個。這時聞得到的時間，依中間推估約占紅燈的 {a}%（1967 年的標準）到 {b}%（1970 年的標準）；電腦算的 1,000 次裡，大多數都有聞得到的秒數。', en: 'Such a wind comes in at most about 1 in 8 peak-hour reds. Then the smell is there for about {a} % of the red by the 1967 study’s level and {b} % by the 1970 study’s (central estimates); most of the 1,000 simulated runs have smellable seconds.' },
        { 'zh-TW': '幾秒鐘的量，沒有官方的數值可以比，所以沒辦法說它高或低。', en: 'No official value exists for a few seconds, so it cannot be called high or low.' },
        { 'zh-TW': '這些是機車另外加進空氣裡的量，不含街上原本的空氣。成分比例來自舊型機車。', en: 'These are amounts the scooters add to the air already there. The shares come from older scooters.' },
      ],
      numbersLink: { 'zh-TW': '完整的數字和範圍', en: 'All the numbers and ranges' },
      hourLink: { 'zh-TW': '換成 30 分鐘或 1 小時的平均', en: 'As 30-minute or 1-hour averages' },
      sheet: {
        b1: {
          'zh-TW': '每種情況算一個紅燈；換了 1,000 次機車排多少、每種成分占多少。風整個紅燈都從機車吹來。剛好聞得到的那個數字，電腦換了 10,000 種單獨一輛機車的排放量來算，和風無關。',
          en: 'One simulated red per case, with 1,000 draws of what the scooters give off and of each chemical’s share. The wind blows from the scooters for the whole red. The just-noticeable figure was worked out for 10,000 single scooters and does not depend on the wind.',
        },
        b2: {
          'zh-TW': '聞得到的時間，把機車排多少、廢氣怎麼散開的不確定都算進去，範圍是 {aLo} 到 {aHi}%（1967 年的標準）、{bLo} 到 {bHi}%（1970 年的標準）。推估取低的一頭時，用 1967 年的標準，1,000 次裡有 {lowDraws} 次有聞得到的秒數。成分比例來自台灣、印度、尼泊爾的舊型機車（化油器或沒有觸媒）；新型機車可能不一樣。',
          en: 'Counting the uncertainty in how much the scooters give off and how the exhaust spreads, the share of the red ranges from {aLo} to {aHi} % (1967 level) and {bLo} to {bHi} % (1970 level). At the low end, by the 1967 level, {lowDraws} of 1,000 runs have smellable seconds. The shares come from older scooters in Taiwan, India and Nepal (carburetted or without a catalyst); newer scooters may differ.',
        },
        b3: {
          'zh-TW': '信心低到中等偏低：「聞得到」的標準來自兩個舊研究，相差 8.5 倍；成分比例在不同來源之間差 2 到 20 倍。',
          en: 'Confidence low to low-moderate: the smell levels come from two old studies 8.5 times apart; the shares differ 2- to 20-fold between sources.',
        },
      },
    },
  },

  // the simulation's answer to the owner's question; one <p> per line, so one more line can follow
  smellSim: {
    q: { 'zh-TW': '聞起來那麼臭，|一氧化碳超過指引值了嗎？', en: 'It smells horrible. |Is the carbon monoxide over the WHO guideline?' },
    lines: [
      { 'zh-TW': '推估：你聞到的臭味是真的。', en: 'Estimate: the smell you notice is real.' },
      { 'zh-TW': '風從一群引擎沒熄火的機車吹向你時，紅燈大約一半到幾乎全部的時間，廢氣都濃到一般人聞得到。', en: 'When the wind blows to you from a group of scooters with their engines running, for about half to nearly all of the red, the exhaust is strong enough for most people to smell.' },
      { 'zh-TW': '一氧化碳沒有味道。你聞到的味道，比較可能是燒過才有的（推估，只能粗略估計）；鼻子在十億份空氣裡只有幾份時，就聞得到。', en: 'Carbon monoxide has no smell. The smell you notice more likely comes from burning (an estimate, order of magnitude only); the nose picks it up at a few parts in a billion.' },
      { 'zh-TW': '所以很臭，不代表一氧化碳超過指引值。', en: 'So a strong smell does not mean carbon monoxide is over the guideline.' },
      { 'zh-TW': '在一般的街上等一個紅燈，一氧化碳攤成 15 分鐘的平均，多{range}，比指引值低很多。', en: 'Waiting one red light on an ordinary street, carbon monoxide spread over 15 minutes adds {range}, far below the guideline.' },
      { 'zh-TW': '但靠近排氣管時，一氧化碳是一陣一陣的。', en: 'But near a tailpipe, carbon monoxide comes in bursts.' },
      { 'zh-TW': '例外：嬰兒車停在排氣管正後方半公尺、幾乎沒風，連續 15 分鐘每個紅燈都在，15 分鐘平均可能超過指引值。這樣的 15 分鐘，約十次有一到兩次；這種風很少見，信心低。', en: 'The exception: a pushchair half a metre behind a tailpipe, in almost no wind, through every red for 15 minutes, can pass the guideline as a 15-minute average. That happens in about 1 or 2 of 10 such periods; such a wind is rare, and confidence is low.' },
    ],
    pushchairLink: { 'zh-TW': '嬰兒車的例外', en: 'The pushchair exception' },
    moreLink: { 'zh-TW': '電腦算的一個紅燈', en: 'One red light, simulated' },
    sheet: {
      b1: {
        'zh-TW': '這不是量的。「聞得到」的標準，來自 1967 和 1970 年汽車廢氣研究的摘要。',
        en: 'This is not a reading. What counts as ‘can smell it’ comes from abstracts of car-exhaust studies from 1967 and 1970.',
      },
      b2: {
        'zh-TW': '電腦算的一個紅燈，風整個紅燈都從機車吹來。',
        en: 'One simulated red light, with the wind blowing from the scooters for the whole red.',
      },
      b3: {
        'zh-TW': '這些標準只能說「風吹來時，很多秒聞得到」。風整個紅燈都從機車吹來的情形，最多大約八個紅燈有一個。',
        en: 'These levels support only ‘smellable in many seconds when the wind blows from the scooters’. A wind from the scooters for a whole red comes in at most about 1 red in 8.',
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
          'zh-TW': '交通部運輸研究所（運研所）。它把幾個路口的行人等候區往後移，離機車待轉區遠一點。然後在尖峰時段去量。',
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
        'zh-TW': '機車越多，路邊的廢氣越濃。街上原本就有的空氣，圖上沒有畫。',
        en: 'More scooters, thicker exhaust at the kerb. The air the street already holds is not drawn.',
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
          'zh-TW': '一是台北市環保局的交通測站（{coYear} 年年報）。二是交通部運輸研究所（運研所）放在路口行人等候區的感測器（2024 年 7 月）。三是環境部的全台一般測站（2025 年平均）。',
          en: 'First, Taipei’s roadside air-quality stations (the city’s {coYear} annual report). Second, the sensors Taiwan’s Institute of Transportation put in pedestrian waiting areas (July 2024). Third, the environment ministry’s general stations across Taiwan (2025 average).',
        },
        b2: {
          'zh-TW': '測站的進氣口離地 {lo} 到 {hi} 公尺，報的是每小時的平均。運研所在路口等候區量到的 PM2.5，大多是每立方公尺 {pmLo} 到 {pmHi} 微克。環境部的全台一般測站，2025 年的平均是 {pmBg} 微克，大小差不多。不過年份和季節都不同，只能看大小。',
          en: 'Station inlets are {lo} to {hi} m above the ground and report hourly averages. The Institute’s waiting-area PM2.5 was mostly {pmLo} to {pmHi} µg/m³. The environment ministry’s general stations across Taiwan averaged {pmBg} µg/m³ in 2025, much the same size. The year and season differ, so this compares size only.',
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
          'zh-TW': '一天四個紅燈，讓你一整天吸到的一氧化碳多不到 {share}%。整天在路邊工作的人就不一樣，像交通警察、攤販、導護。一個紅燈接一個紅燈，加起來就像一直待在路邊。',
          en: 'Four red lights a day add less than {share}% to the carbon monoxide you breathe over a whole day. It is different for people who work at the kerb all day, such as traffic police, street vendors and school crossing guards. One red light after another adds up to standing at the roadside all the time.',
        },
        /** After b3 (people who work at the kerb): statements 2, 8 and 9 of the simulation, one idea per line; {range} / {times} are EstimateValues. */
        stayers: [
          { 'zh-TW': '推估：電腦算的一個紅燈，每個紅燈都站在路邊、站滿 15 分鐘，風又一直從機車吹來，', en: 'Estimate: in the simulated red light, standing at the kerb through every red for 15 minutes with the wind always from the scooters,' },
          { 'zh-TW': '一氧化碳的 15 分鐘平均是{range}，還是低於指引值；這種風很少見。', en: 'the 15-minute carbon monoxide average is {range}, still below the guideline; such a wind is rare.' },
          { 'zh-TW': '待上一小時、風一直從機車吹來的人，苯（ㄅㄣˇ）的一小時平均，可能是美國加州 1 小時參考值的{times}。', en: 'For people who stay an hour with the wind always from the scooters, the 1-hour benzene average can be {times} California’s 1-hour reference level.' },
          { 'zh-TW': '這個參考值是用 6 小時的資料訂的；機車廢氣裡有多少苯，可能差到 5 到 10 倍。這不是在說等一個紅燈的人。', en: 'That reference was set from 6-hour data, and how much benzene scooter exhaust holds could be off five- to ten-fold. This is not about someone waiting one red.' },
          { 'zh-TW': '一般來說，只有封閉的地方，像地下停車場、地下道，或不太通風、有屋頂的候車區，裡面有幾十輛機車引擎沒熄火，才可能到指引值；這些地方我們沒有算，也沒有找到台灣在這些地方的量測。', en: 'Generally, only enclosed places, such as an underground car park, an underpass or a stuffy covered waiting area with dozens of scooters idling, could reach the guideline; we did not simulate them, and we found no Taiwanese measurement of them.' },
        ],
        studiesTitle: { 'zh-TW': '三個路牌，各是什麼研究', en: 'The study behind each signpost' },
        studies: [
          {
            'zh-TW': '高雄：{people} 個人戴著感測器過日子。PM2.5 突然升高的那 {minutes} 分鐘，心跳的節奏小小變了一下；這是身體的訊號，不是生病。高雄找到的高峰，主要來自工廠、蚊香、燒稻草和燒香。',
            en: 'Kaohsiung: {people} people wore sensors through their days. In the {minutes} minutes after PM2.5 jumped, the heart’s rhythm shifted a little: a signal, not an illness. The peaks found in Kaohsiung came mainly from factories, mosquito coils, straw burning and incense.',
          },
          {
            'zh-TW': '倫敦：{asthma} 個有氣喘的大人，在柴油車很多的街上走了 {hours} 小時。他們的肺功能小幅下降，本人沒有感覺。',
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
        nose: { 'zh-TW': '鼻子、喉嚨：刺鼻的氣體會到這裡，吸得夠多會刺激鼻子和喉嚨。', en: 'Nose and throat: the sharp-smelling gases reach here; enough of them irritates the nose and throat.' },
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
          'zh-TW': '圖上三條路，說的是這些東西進到身體以後去哪裡。',
          en: 'The three routes show where these substances go once breathed in.',
        },
        /** A separate sentence from the routes: like-with-like averaging only, with its label. */
        routesCo: {
          'zh-TW': '推估：在一般的街上等一個紅燈，一氧化碳的 15 分鐘平均多{range}，比世界衛生組織的指引值低很多；排氣管正後方、幾乎沒風時，最多約 {near} ppm。只有一個少見的例外：嬰兒車停在排氣管正後方，寫在「怎麼算的」那一頁。',
          en: 'Estimate: waiting one red light on an ordinary street adds {range} to your 15-minute carbon monoxide average, far below the WHO guideline; right behind a tailpipe in almost no wind, up to about {near} ppm. There is one rare exception, a pushchair right behind a tailpipe: see the ‘How we worked it out’ page.',
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
      /** Statement 5 (replaces K4, which the simulation has answered). */
      quiet: { 'zh-TW': '推估：風從機車吹來，嬰兒車高度的廢氣是大人一到兩倍；換風向就不一定。', en: 'Estimate: with the wind from the scooters, pushchair height gets between about the same as an adult’s nose and about twice as much. Not in every wind.' },
      sheet: {
        b1: {
          'zh-TW': '美國環保署的《暴露參數手冊》，整理了每個年紀的人，一天吸進多少空氣。',
          en: 'The US Environmental Protection Agency’s Exposure Factors Handbook, which sets out how much air people of each age breathe in a day.',
        },
      },
    },
    /** Statement 3 of the simulation, one idea per line ({middle} is an EstimateValue). */
    pushchair: {
      q: { 'zh-TW': '嬰兒車就停在|排氣管正後方呢？', en: 'And a pushchair |right behind a tailpipe?' },
      lines: [
        { 'zh-TW': '有一個例外。', en: 'There is one exception.' },
        { 'zh-TW': '嬰兒車停在一輛機車排氣管的正後方，約半公尺。', en: 'A pushchair stands half a metre directly behind one scooter’s tailpipe.' },
        { 'zh-TW': '機車引擎沒熄火，幾乎沒有風，風向也不變。', en: 'The engine is running, there is almost no wind, and it does not change direction.' },
        { 'zh-TW': '每個紅燈都停在那裡，連續 15 分鐘。', en: 'It stays there through every red for 15 minutes.' },
        { 'zh-TW': '這時嬰兒車裡低低的地方（約 0.6 公尺），一氧化碳的 15 分鐘平均，可能超過世界衛生組織的指引值。', en: 'Then, low in the pushchair (about 0.6 m), the 15-minute carbon monoxide average can pass the WHO guideline.' },
        { 'zh-TW': '這樣的 15 分鐘，每十次約有一到兩次。', en: 'That happens in about 1 or 2 of 10 such 15-minute periods.' },
        { 'zh-TW': '很弱的風剛好從那一邊吹來，大約一百個紅燈才有一次；要連續 15 分鐘，就更少了。', en: 'A very weak wind from that side comes in about 1 red in 100; for 15 minutes in a row it is rarer still.' },
        { 'zh-TW': '往旁邊移開半公尺，或到小孩站著的高度，就沒有了。', en: 'Move half a metre to the side, or up to a standing child’s height, and it is gone.' },
        { 'zh-TW': '這是我們最沒把握的結果。', en: 'This is our least certain result.' },
      ],
      gloss: { 'zh-TW': '推估：這是電腦算的，不是量的。', en: 'Estimate: worked out on a computer, not read off an instrument.' },
      moreLink: { 'zh-TW': '電腦算的一個紅燈', en: 'One red light, simulated' },
      sheet: {
        b1: {
          'zh-TW': '這不是量的，是電腦算的一個紅燈，再推成 15 分鐘。',
          en: 'This is not a reading: it comes from one simulated red light, worked out to 15 minutes.',
        },
        b2: {
          'zh-TW': '中間的情形是{middle}；偏高的情形會超過指引值。',
          en: 'The middle case is {middle}; the high cases pass the guideline.',
        },
        b3: {
          'zh-TW': '電腦裡的空氣比平常更靜，所以可能算高了。引擎的熱，會讓半公尺處的數字差到四倍。',
          en: 'The air in the model is stiller than usual, so this may be too high. Engine heat can change the values at half a metre up to four-fold.',
        },
      },
    },
    backSeat: {
      q: { 'zh-TW': '坐在機車後座的|小孩呢？', en: 'And a child |on the back seat?' },
      answer: {
        'zh-TW': '國外量過，在印尼萬隆和尼泊爾加德滿都。小孩上學的路上，坐機車和走路的那一段，吸到的 PM2.5 最高。坐在後座的小孩，吸到的應該和騎士差不多；這是我們的推論。',
        en: 'It has been measured abroad: in Bandung, Indonesia and Kathmandu, Nepal, the stretches of a child’s school journey spent on a scooter or on foot came with the highest PM2.5. A child on the back seat probably breathes about what the rider breathes; that is our inference.',
      },
      sheet: {
        b1: {
          'zh-TW': '一項 {year} 年發表的研究，找了印尼萬隆和尼泊爾加德滿都的小孩。他們自己背著感測器上學、放學。',
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
          'zh-TW': '台北一項研究（Chuang 等，{year} 年發表），讓健康的年輕人用不同的方式通勤。他們早上量一小時，儀器帶在身上。',
          en: 'A Taipei study (Chuang et al., published {year}) had healthy young adults commute in different ways for one morning hour, carrying the instrument with them.',
        },
        b2: {
          'zh-TW': '一小時的 PM2.5 平均，每立方公尺：騎燃油機車 {scooter} 微克、走路 {walking}、搭公車 {bus}、坐汽車 {car}、搭捷運 {metro}。',
          en: 'Mean PM2.5 over the hour, in µg/m³: petrol scooter {scooter}, walking {walking}, bus {bus}, car {car}, metro {metro}.',
        },
        b3: {
          'zh-TW': '這是各種來源的 PM2.5，只量早上一小時。騎機車和走路都明顯比搭捷運、坐汽車多；這兩種之間差多少，統計上分不出來。量的是每個人自己吸到的；這項研究只量 PM2.5，不包括一氧化碳和苯。',
          en: 'This is PM2.5 from all sources, over one morning hour only. Scooter and walking were clearly higher than metro and car. The gap between scooter and walking could be chance (not statistically significant). It is what each person breathed; the study covered PM2.5 only, not carbon monoxide or benzene.',
        },
      },
    },
    s2: {
      chapter: { 'zh-TW': '五種通勤', en: 'Five ways to commute' },
      headline: { 'zh-TW': '騎機車和走路，|吸到的都比搭捷運多', en: 'On a scooter or on foot, |more PM2.5 than on the metro' },
      body: {
        'zh-TW': '這是台北一項研究，早上通勤一小時量到的 PM2.5 平均，各種來源都算。騎機車和走路的差別，統計上分不出來。',
        en: 'This is the mean PM2.5 from all sources over a one-hour morning commute in a Taipei study. The gap between scooter and walking could be chance (not statistically significant).',
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
          'zh-TW': '台北通勤一小時，平均吸到多少 PM2.5？單位是微克／立方公尺。由多到少：{rows}。騎機車和走路的差別，統計上分不出來。',
          en: 'Mean PM2.5 breathed over a one-hour commute in Taipei, highest first: {rows}. The gap between scooter and walking could be chance (not statistically significant).',
        },
        row: { 'zh-TW': '{mode} {value}', en: '{mode} {value} µg/m³' },
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
      headline: { 'zh-TW': '口罩|擋不住廢氣裡的氣體', en: 'A mask |won’t stop the gases in exhaust' },
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
          'zh-TW': '這講的是口罩材料的性質，不是在台灣街頭量的。醫用口罩和布口罩的部分，是我們照同樣的道理推論的。工業用的防毒面具加上濾罐，可以處理一氧化碳。可是平常戴的口罩，都不是這種。',
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
          'zh-TW': '荷蘭、美國、英國的口罩實驗。還有台灣勞動部勞動及職業安全衛生研究所（勞安所）的兩次測試。',
          en: 'Mask experiments in the Netherlands, the United States and Britain, and two tests by the research institute of Taiwan’s labour ministry.',
        },
        tests: [
          {
            'zh-TW': '荷蘭讓真人戴著測：醫用口罩和布口罩，都有不少很小的微粒進得去。大人戴歐規的 N95（FFP2）好很多，小孩戴的效果差很多。',
            en: 'A Dutch study tested masks on real people: with surgical and cloth masks a good share of the smallest particles still got in. An FFP2 (the European N95) did far better on adults, and much less well on children.',
          },
          {
            'zh-TW': '台灣，{molYear} 年：當時勞委會的勞工安全衛生研究所，測了 {molTested} 款拋棄式活性碳口罩。國家標準要求撐 {molMinutes} 分鐘，沒有一款撐得過。',
            en: 'Taiwan, {molYear}: the labour ministry’s institute tested {molTested} disposable activated-carbon masks, and none lasted the {molMinutes} minutes the national standard asks for.',
          },
          {
            'zh-TW': '台灣，{iloshYear} 年：勞安所找 {iloshPeople} 位大人實測。比的是分數，不是百分比：頭帶式 N95 是 {headband}，耳掛式 N95 是 {earloop}，一般醫用口罩是 {medical}。{iloshPeople} 位裡，只有 {fitPassed} 位戴耳掛式 N95 能貼合。',
            en: 'Taiwan, {iloshYear}: the labour ministry’s institute tested {iloshPeople} adults. These are scores for comparing masks, not percentages: headband N95 {headband}, ear-loop N95 {earloop}, an ordinary medical mask {medical}. Only {fitPassed} of the {iloshPeople} got a proper seal with an ear-loop N95.',
          },
        ],
        b3: {
          'zh-TW': '口罩對微粒不是沒有用。北京一項試驗裡，心臟病患者戴貼合的防塵口罩走路，血壓低了一點。這些測試用的是鹽粒、蠟燭煙或柴油廢氣，不是台灣路口的機車廢氣。',
          en: 'Against particles a mask is not without use: in a Beijing trial, heart patients who walked wearing a well-fitting dust respirator had slightly lower blood pressure. These tests used salt particles, candle smoke or diesel exhaust, not scooter exhaust at a Taiwanese junction.',
        },
      },
    },
  },
});
