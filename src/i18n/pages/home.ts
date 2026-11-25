// Home page copy (blueprint Part 3, chapters 3.1–3.13). One key per chapter: prologue, brief,
// link1 … link7, green, connect, money, next. Shared pieces (the seven lines, the question chips,
// the rail) live in ../ui.ts; money-state sentences live in ./money.ts.
//
// Every number is a {token} filled at render time from the fact registry or the calculator
// engine (src/components/pages/home/home-data.ts). Never type a number into this file: if the
// registry corrects a fact, the page follows.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '一個紅燈，90 秒', en: 'One red light, ninety seconds' },
    description: {
      'zh-TW': '等紅燈時站在機車旁邊，吸進多少，台灣沒有人量過。這一頁把查得到的證據一環一環排出來，說清楚哪裡有出處、哪裡是空白，也算給你看換電動要多少錢。',
      en: 'Nobody in Taiwan has measured what you breathe beside the scooters at a red light. This page lays out the evidence link by link, shows where it is sourced and where it is blank, and works out what switching to electric costs.',
    },
    /** Small label before every list of registry caveats that must sit beside their numbers. */
    notes: { 'zh-TW': '出處附註', en: 'Source notes' },
    /** Before the "who could measure it" line that follows every gap. */
    who: { 'zh-TW': '誰量得出來：', en: 'Who could measure it: ' },
    askPage: { 'zh-TW': '怎麼請人來量', en: 'How to ask for it to be measured' },
  },

  // 3.1 ---------------------------------------------------------------------------------------
  prologue: {
    kicker: { 'zh-TW': '那個味道，你也聞過。', en: 'You know that smell.' },
    title: { 'zh-TW': '一個紅燈，|90 秒', en: 'One red light. |Ninety seconds.' },
    deck: {
      'zh-TW': '一整排機車在旁邊怠速，你站在路口，等同一個綠燈。這種紅燈你等過幾千次了。這一次放慢看：這 90 秒裡，哪些事有人量過，哪些沒有。',
      en: 'A row of scooters idles beside you while you stand at the corner waiting for the same green. You have waited through thousands of these. This time, slowly: what has been measured about these ninety seconds, and what has not.',
    },
    rider: {
      'zh-TW': '車陣裡的人和路口的人，常常是同一批：早上騎車上班，中午走路去買便當。',
      en: 'The people in the pack and the people on the corner are often the same people: we ride to work in the morning and walk out for a lunch box at noon.',
    },
    microcopy: { 'zh-TW': '往下滑，倒數才會走。', en: 'Scroll, and the countdown runs.' },
    disclosureLabel: { 'zh-TW': '先說清楚', en: 'Before you look' },
    disclosure: {
      'zh-TW': '畫面是示意圖。霧畫成斜線，是因為它有多濃沒有人量過；它不會隨著倒數變濃。90 秒是我們說故事用的長度，不是統計數字。每個數字都有出處。',
      en: 'The picture is an illustration. The haze is drawn as hatching because nobody has measured how dense it is, and it does not thicken as the clock runs. Ninety seconds is our storytelling length, not a statistic. Every number has a source.',
    },
    handoff: { 'zh-TW': '先給趕時間的人：30 秒版。', en: 'For anyone in a hurry: the 30-second version.' },
  },

  // 3.2 ---------------------------------------------------------------------------------------
  brief: {
    handoff: { 'zh-TW': '剩 90 秒。車陣到了。', en: 'Ninety seconds. Here comes the pack.' },
  },

  // 3.3 ---------------------------------------------------------------------------------------
  link1: {
    title: { 'zh-TW': '粉塵很少，|油氣很多', en: 'Little dust. |A lot of fumes.' },
    deck: {
      'zh-TW': '先講對機車有利的：全台灣排出來的 PM2.5，機車只占 {pm25}%。但機車排的主要不是粉塵。沒燒完的油氣，機車占約 {nmhc}%；一氧化碳，占 {co}%。',
      en: 'First, the fact in the scooter’s favour: scooters produce {pm25}% of Taiwan’s PM2.5 emissions. But dust is not mainly what a scooter emits. Of the country’s unburnt fuel vapour, scooters emit about {nmhc}%; of its carbon monoxide, {co}%.',
    },
    body: [
      {
        'zh-TW': '台北有一座隧道，平日的車流大約一半是機車（{share}%）。裡面的一氧化碳，幾乎跟著機車的數量起伏；同一座隧道裡的粉塵，主要跟著大型車走。',
        en: 'In one Taipei tunnel, about half the weekday traffic is scooters ({share}%). The carbon monoxide inside rises and falls almost in step with the number of scooters; the dust in the same tunnel follows the heavy vehicles.',
      },
      {
        'zh-TW': '還有一個好消息：依一項模式推估，{period}，機車排的苯少了 {benzene}%，油氣少了 {hc}%；研究者歸因於二行程機車退場和標準加嚴。排氣管換掉，排放真的會少。這件事後面還會用到。',
        en: 'And some good news: in one modelled estimate, scooter benzene emissions fell {benzene}% and fuel vapour {hc}% over {period}, which the authors credit to two-strokes leaving the road and tighter standards. Change the tailpipe and emissions really do fall. We will come back to this.',
      },
    ],
    figure: {
      title: { 'zh-TW': '論排放量：粉塵占得少，|油氣和一氧化碳占得多', en: 'By emissions: a sliver of the dust, |a visible slice of the fumes' },
      subtitle: { 'zh-TW': '燃油機車占全國排放量的比例（%），{period}', en: 'Gasoline scooters’ share of national emissions (%), {period}' },
      chart: { 'zh-TW': '燃油機車占全國四種污染物排放量的比例，畫在 0 到 100% 上', en: 'Gasoline scooters’ share of national emissions of four pollutants, on a 0 to 100% scale' },
      desc: {
        'zh-TW': 'PM2.5 {pm25}%、氮氧化物 {nox}%、非甲烷碳氫化合物 {nmhc}%、一氧化碳 {co}%。四項都不到一半。',
        en: 'PM2.5 {pm25}%, nitrogen oxides {nox}%, non-methane hydrocarbons {nmhc}%, carbon monoxide {co}%. None is a majority.',
      },
      scooters: { 'zh-TW': '燃油機車', en: 'Gasoline scooters' },
      category: { 'zh-TW': '污染物', en: 'Pollutant' },
    },
    caveat: {
      'zh-TW': '這是「排放量」的占比，不是你吸進去的比例；排得多，不代表每個路口都濃。交通排的苯，汽油車（{gas} 公噸）比機車（{mc} 公噸）多。{benzene}% 和 {hc}% 是推估的排放量，不是量到的空氣。',
      en: 'These are shares of emissions, not of what you breathe; a large output does not mean thick air at every crossing. Gasoline cars emit more traffic benzene ({gas} t) than scooters ({mc} t). The {benzene}% and {hc}% are estimated emissions, not measured air.',
    },
    action: { 'zh-TW': '家裡那台機車，查一下下一次定檢是什麼時候。', en: 'Check when your household’s scooter is next due for its exhaust inspection.' },
    handoff: { 'zh-TW': '排什麼知道了。下一題：排在哪裡？', en: 'That is what comes out. Next: where?' },
  },

  // 3.4 ---------------------------------------------------------------------------------------
  link2: {
    title: { 'zh-TW': '排氣管離地|不到一公尺。|標線規則|只要求留 {cm} 公分', en: 'The tailpipe is under a metre |off the ground. |The marking rules |ask for {cm} cm.' },
    deck: {
      'zh-TW': '工廠的廢氣從煙囪排到高空；機車的廢氣排在路面上，和嬰兒車裡孩子的口鼻落在同一個高度範圍。依標線規則，待轉區的後緣離行人穿越道，至少要留 {cm} 公分。這是規定的下限，不是每個路口實際的距離。',
      en: 'A factory sends its exhaust up a chimney. A scooter releases it at road level, in the same height range as the face of a child in a stroller. Under the road-marking rules, the rear edge of the two-stage turn box must be at least {cm} cm from the crosswalk. That is the minimum the rule sets, not the distance at any given crossing.',
    },
    body: [
      {
        'zh-TW': '待轉區的車，車尾朝著斑馬線。停等區的車在停止線後面，排氣管朝的是後方的車陣，不是行人。',
        en: 'Scooters in the turn box have their tails toward the crosswalk. Scooters in the stop box sit behind the stop line; their tailpipes point at the queue behind them, not at pedestrians.',
      },
      {
        'zh-TW': '引擎為什麼不熄？現行的怠速規定，管的是停車等候超過 {min} 分鐘的車；一個普通的紅燈，不在它要管的範圍裡。我們不是在說誰違規，是路口本來就這樣運作。',
        en: 'Why do the engines stay on? The anti-idling rule is written for vehicles stopped and waiting more than {min} minutes; an ordinary red light is not what it covers. We are not saying anyone is breaking a rule. This is how the crossing is designed to work.',
      },
    ],
    figure: {
      title: { 'zh-TW': '規則允許的距離：|待轉區離斑馬線至少 {cm} 公分', en: 'What the rules allow: |the turn box at least {cm} cm from the crosswalk' },
      subtitle: { 'zh-TW': '一個路口進口的俯視示意圖，依標線規則的條文畫', en: 'One approach to a crossing from above, drawn from the marking rules' },
    },
    caveat: {
      'zh-TW': '一台機車怠速一分鐘排多少、一個紅燈前面停幾台，台灣都沒有公開的量測。「不到一公尺」出自一篇國際回顧對一般車輛的描述，不是拿機車量出來的。',
      en: 'How much one scooter emits per minute of idling, and how many queue at a red light, has not been published for Taiwan. “Under a metre” comes from an international review describing vehicles in general, not from measuring scooters.',
    },
    action: {
      'zh-TW': '等的時候，站得離待轉區和停止線遠幾步。這是我們的推論，不是量出來的效果。',
      en: 'While you wait, stand a few steps back from the turn box and the stop line. This is our inference, not a measured benefit.',
    },
    handoff: {
      'zh-TW': '排什麼、排在哪，都有出處。那站在旁邊的人，吸進了多少？',
      en: 'What comes out and where are both documented. So how much does the person standing beside it breathe?',
    },
  },

  // 3.5 ---------------------------------------------------------------------------------------
  link3: {
    title: { 'zh-TW': '這一格，|沒有人量過', en: 'This box is empty. |Nobody has measured it.' },
    deck: {
      'zh-TW': '一整排機車怠速等紅燈的時候，旁邊的行人吸進多少一氧化碳、多少苯、多少超細微粒？我們把找得到的研究都翻過了：在台灣，沒有人量過。不是量了沒事，是還沒有人去量。',
      en: 'Beside a row of scooters idling at a red light, how much carbon monoxide, benzene and ultrafine dust does a pedestrian breathe? We went through every study we could find. In Taiwan, nobody has measured it. Not measured and found fine. Not measured.',
    },
    figure: {
      title: { 'zh-TW': '紅燈旁邊的行人吸進多少？|這張圖是空的', en: 'What does a pedestrian breathe beside a red light? |This chart is empty' },
      subtitle: {
        'zh-TW': '紅燈 90 秒裡，嬰兒車高度和成人高度的一氧化碳、苯、超細微粒',
        en: 'Carbon monoxide, benzene and ultrafine particles at stroller and adult height through a 90-second red light',
      },
      chart: { 'zh-TW': '空白的圖：紅燈倒數期間，路口行人高度的三種污染物', en: 'Empty chart: three pollutants at pedestrian height through the red-light countdown' },
      desc: {
        'zh-TW': '三個面板分別是一氧化碳、苯和超細微粒，橫軸是紅燈倒數 90 到 0 秒，接著是綠燈；兩個高度是嬰兒車和成人。',
        en: 'Three panels for carbon monoxide, benzene and ultrafine particles; the x axis is the red-light countdown from 90 to 0 seconds, then green; the two heights are a stroller and an adult.',
      },
    },
    body: [
      {
        'zh-TW': '那看空品 App 不就好了？App 的數字來自測站。如果有人拿 PM2.5 告訴你，路口跟別的地方差不多，他說的是實話：台北的交通測站和一般測站，{year} 年的年平均只差 {gap} 微克。只是他拿錯了尺，機車排的主要不是粉塵。',
        en: 'Why not just check the air-quality app? Its numbers come from monitoring stations. If someone uses PM2.5 to tell you the crossing is much like anywhere else, they are telling the truth: in {year} Taipei’s traffic stations and general stations differed by {gap} µg/m³ in the annual mean. They are holding the wrong ruler. Dust is not mainly what a scooter emits.',
      },
      {
        'zh-TW': '油氣呢？台北一項研究讓通勤的人帶著儀器上路，再和最近的測站比。PM2.5，兩邊對得上。苯類，幾乎對不上。',
        en: 'And the fumes? A Taipei study sent commuters out carrying instruments and compared them with the nearest station. For PM2.5 the two agreed. For the benzene family they barely matched.',
      },
    ],
    small: {
      title: { 'zh-TW': '用 PM2.5 看，|路邊測站和一般測站已經差不多', en: 'Judged by PM2.5, |roadside and general stations now look alike' },
      subtitle: { 'zh-TW': '台北市 PM2.5 年平均（{unit}），{from} 年和 {to} 年', en: 'Taipei annual mean PM2.5 ({unit}), {from} and {to}' },
      chart: { 'zh-TW': '台北市交通測站和一般測站的 PM2.5 年平均，前後兩年比較', en: 'Taipei annual mean PM2.5 at traffic and general stations, two years compared' },
      desc: {
        'zh-TW': '兩種測站的差距從 {from} 年的 {gapFrom} 縮小到 {to} 年的 {gapTo} 微克。',
        en: 'The gap between the two kinds of station shrank from {gapFrom} µg/m³ in {from} to {gapTo} in {to}.',
      },
      category: { 'zh-TW': '測站', en: 'Stations' },
    },
    caveat: {
      'zh-TW': '那項研究量的是騎腳踏車和騎租來的電動機車通勤的人，不是站在路口的行人，而且只有台北。畫面上的斜線是我們畫的，不是量出來的；風一大，這一層可能很快就散。',
      en: 'That study measured commuters on bicycles and on rented electric scooters, not pedestrians standing at a crossing, and only in Taipei. The hatching on screen is drawn, not measured; in wind this layer may clear quickly.',
    },
    action: { 'zh-TW': '這一格，環保局量得出來。把你家附近的路口告訴他們：', en: 'A city environmental bureau can fill this box. Tell them which crossing: ' },
    actionLink: { 'zh-TW': '請來量我家路口', en: 'ask them to measure mine' },
    pledge: { 'zh-TW': '「有人量了，結果不管站在哪一邊，我們都會放上首頁。」', en: '“When someone measures it, the result goes on this page, whichever way it points.”' },
    pledgeBy: { 'zh-TW': '行人呼吸的承諾', en: 'ScooterAir’s promise' },
    handoff: { 'zh-TW': '儀器還沒到。但你身上有一個偵測器，一直開著。', en: 'No instrument has been here yet. But you carry a detector that is always switched on.' },
  },

  // 3.6 ---------------------------------------------------------------------------------------
  link4: {
    title: { 'zh-TW': '鼻子是警報器，|不是測量儀', en: 'Your nose is an alarm, |not a gauge.' },
    deck: {
      'zh-TW': '聞到廢氣味，代表你人就站在廢氣裡。但它只說「有」，不說「多少」。而且廢氣裡有幾樣東西，鼻子不會通知你。',
      en: 'If you can smell exhaust, you are standing in it. But the smell says “present”, not “how much”. And some of what is in exhaust never reaches you as a smell.',
    },
    body: [
      {
        'zh-TW': '那股味道到底是哪幾種成分，老實說，沒有人鑑定過。比較可能的是醛類：空氣裡只要十億分之幾，人就聞得到；台灣的機車廢氣裡也驗得出甲醛和乙醛。',
        en: 'Which compounds make that smell? Honestly, nobody has identified them. Aldehydes are the likelier candidates: people can smell them at a few parts per billion, and formaldehyde and acetaldehyde are found in Taiwanese scooter exhaust.',
      },
      {
        'zh-TW': '有些東西，鼻子幫不上忙。一氧化碳沒有味道。苯要濃到百萬分之幾才聞得到，門檻比醛類高得多；在路邊，不太可能聞得出來。',
        en: 'Some things your nose cannot help with. Carbon monoxide has no odour. Benzene has to reach parts per million before a nose notices, far above the aldehydes’ threshold, so at the roadside you are unlikely to smell it.',
      },
      {
        'zh-TW': '國際癌症研究機構把苯列為 {g1}，對人類致癌；世界衛生組織說，找不到可以建議的安全濃度。汽油引擎廢氣「整體」是 {g2b}，可能致癌。不是 {g1}，我們不會把它講成 {g1}。',
        en: 'The International Agency for Research on Cancer classes benzene as {g1}, carcinogenic to humans; the WHO says no safe level can be recommended. Gasoline engine exhaust as a whole is {g2b}, possibly carcinogenic. It is not {g1}, and we will not call it that.',
      },
    ],
    marker: {
      label: { 'zh-TW': '一氧化碳在這裡的角色', en: 'What carbon monoxide is doing here' },
      text: {
        'zh-TW': '一氧化碳在這個故事裡是「廢氣的記號」：它跟著機車車流走，所以拿它來認廢氣。路口的一氧化碳有沒有高到傷身，沒有人量過。',
        en: 'In this story carbon monoxide is a marker of exhaust: it moves with scooter traffic, so we use it to recognise exhaust. Whether it reaches a harmful level at a crossing, nobody has measured.',
      },
    },
    smell: {
      can: { 'zh-TW': '你站在廢氣裡。可能是醛類；是哪幾種，沒有人鑑定過。', en: 'You are standing in exhaust. Probably aldehydes; which ones, nobody has identified.' },
      cannot: {
        'zh-TW': '一氧化碳：沒有味道。苯：要到百萬分之幾才聞得到，在路邊不太可能聞出來。',
        en: 'Carbon monoxide: no smell. Benzene: only noticed at parts per million, so unlikely to be smelled at the roadside.',
      },
    },
    /** Replaces the shared key's ultrafine line, which says the particles have no smell (no checked source). */
    keyUfp: {
      'zh-TW': '不只來自機車。整條街畫得一樣密，換成電動機車之後還在。',
      en: 'Not only from scooters. Drawn at one density across the whole street, and still there in the electric frame.',
    },
    figure: {
      title: { 'zh-TW': '聞得到的，和聞不到的，|是兩張不同的清單', en: 'What you can smell and what you cannot |are two different lists' },
    },
    caveat: {
      'zh-TW': '這個分級講的是「會不會」，不是「吸多少會」。路口的苯有多濃，回到上一格：沒有人量過。味道重不代表傷害大，沒味道也不代表沒事。',
      en: 'The classification says whether something is a cancer hazard, not how much it takes. How much benzene is at the crossing: see the empty box. A strong smell does not mean more harm, and no smell does not mean none.',
    },
    action: { 'zh-TW': '把這一段傳給那個說「聞習慣就好」的人。', en: 'Send this to the person who says you get used to the smell.' },
    actionLink: { 'zh-TW': '打開「為什麼那麼臭？」和它的分享圖', en: 'Open “Why does it smell so bad?” and its share card' },
    handoff: {
      'zh-TW': '裡面有什麼知道了。吸了會怎樣？這一題，得離開路口才答得了。',
      en: 'That is what is in it. What does breathing it do? To answer, we have to leave the crossing.',
    },
  },

  // 3.7 ---------------------------------------------------------------------------------------
  link5: {
    title: { 'zh-TW': '沒有人能說，|一個紅燈會讓你生病', en: 'Nobody can say |one red light makes you ill.' },
    deck: {
      'zh-TW': '也沒有人能說不會。在怠速機車旁邊站幾分鐘會怎樣，沒有研究。研究看得到的，是時間拉長之後的事；而且看的是整體車流，不是機車。',
      en: 'Nor can anyone say it does not. No study has looked at a few minutes beside idling scooters. What research can see comes with longer times, and it concerns traffic as a whole, not scooters.',
    },
    body: [
      {
        'zh-TW': '最有份量的證據是長期的。一份整理了 {n} 項研究的回顧，對「長年暴露在車流廢氣裡」和總死亡、心臟病死亡、肺癌死亡，以及兒童和成人的氣喘發病之間的關聯，有高度或中高度的信心。',
        en: 'The weightiest evidence is long-term. A review of {n} studies had high or moderate-to-high confidence in an association between years of exposure to traffic exhaust and overall mortality, deaths from heart disease and lung cancer, and new asthma in children and adults.',
      },
    ],
    ladder: {
      t0: { 'zh-TW': '90 秒', en: '90 seconds' },
      t1: { 'zh-TW': '1 小時', en: '1 hour' },
      t2: { 'zh-TW': '{h} 小時', en: '{h} hours' },
      t3: { 'zh-TW': '很多年', en: 'Many years' },
      s1: {
        'zh-TW': '台北 {n} 位健康成人，早上通勤一小時。走路的那一組，身上量到的 PM2.5（所有來源）愈高，血壓和心跳也高一點；搭捷運的那一組沒有這個關係。',
        en: '{n} healthy adults in Taipei, one morning hour of commuting. Among those who walked, higher personal PM2.5 from all sources went with slightly higher blood pressure and heart rate; among those on the subway it did not.',
      },
      s2: {
        'zh-TW': '在倫敦一條以柴油車為主的大街走 {h} 小時，氣喘成人的肺功能最多下降 {fev1}%。',
        en: 'After {h} hours walking a diesel-dominated London street, lung function in adults with asthma fell by up to {fev1}%.',
      },
      s3: {
        'zh-TW': '追蹤台灣 {n} 名成人，長期 PM2.5 最高的一組，死亡風險比最低的一組高 {pct}%。算的是所有來源的 PM2.5。',
        en: 'In a cohort of {n} Taiwanese adults, the group with the highest long-term PM2.5 had a {pct}% higher risk of death than the lowest. This counts PM2.5 from every source.',
      },
    },
    ruler: {
      label: { 'zh-TW': '注意這把尺', en: 'Mind the ruler' },
      text: {
        'zh-TW': '上面的研究量的都是整體車流，或所有來源的 PM2.5，也就是第 1 環說機車占很少的那一種污染。沒有任何一項把機車廢氣單獨分出來。研究看到的是「有關」，不是「造成」。這兩個詞差很多，我們不會混著用。',
        en: 'Every study above measured traffic as a whole or PM2.5 from all sources, the kind of pollution Link 1 said scooters make little of. Not one isolates scooter exhaust. And what they show is association, not cause. The two words are far apart and we will not mix them.',
      },
    },
    walk: {
      label: { 'zh-TW': '這不是叫你不要走路', en: 'This is not a reason to stop walking' },
      text: {
        'zh-TW': '同一個台灣世代研究裡，不管空氣好壞，有運動的人風險都比較低。請繼續走路。',
        en: 'In the same Taiwanese cohort, people who exercised had lower risk at every level of pollution. Keep walking.',
      },
    },
    tool: {
      summary: { 'zh-TW': '你的紅燈，一年加起來', en: 'Your red lights, added up over a year' },
      intro: {
        'zh-TW': '填兩個你自己的數字。我們不替你預設，也不會換算成任何健康影響。',
        en: 'Enter two numbers of your own. We set no defaults, and we do not translate the answer into any health effect.',
      },
      lights: { 'zh-TW': '一天大約等幾個紅燈？', en: 'About how many red lights do you wait at a day?' },
      lightsUnit: { 'zh-TW': '個', en: 'lights' },
      seconds: { 'zh-TW': '每個大約等幾秒？', en: 'About how many seconds at each?' },
      secondsUnit: { 'zh-TW': '秒', en: 'seconds' },
      pending: { 'zh-TW': '兩個數字都填了，這裡才會出現結果。', en: 'The result appears here once both numbers are filled in.' },
      result: { 'zh-TW': '一年大約 {h} 小時', en: 'About {h} hours a year' },
      tag: { 'zh-TW': '你的數字，本站計算', en: 'Your numbers, our arithmetic' },
      fixed: { 'zh-TW': '這只是時間，不是劑量。', en: 'This is time, not dose.' },
      noscript: {
        'zh-TW': '這個小工具要開啟 JavaScript 才會算。自己算也可以：每天的紅燈數 × 每個的秒數 × 365，再除以 3,600，就是一年的小時數。',
        en: 'This tool needs JavaScript to work it out. Or do it yourself: red lights a day × seconds at each × 365, divided by 3,600, gives hours a year.',
      },
    },
    caveat: {
      'zh-TW': 'HEI 的報告自己說，它沒有評估因果。台北那項研究沒有扣掉走路本身的活動量。倫敦那條街以柴油車為主。',
      en: 'The HEI review says itself that it did not assess causality. The Taipei study did not adjust for the exertion of walking. The London street was dominated by diesel.',
    },
    action: {
      'zh-TW': '有得選的時候，走車少的那條路。台北的通勤研究裡，尖峰時段走安靜的路線，苯少了 {benzene}%，PM2.5 少了 {pm25}%；量的是騎腳踏車和電動機車的通勤者。',
      en: 'Where there is a choice, take the quieter street. In the Taipei commuter study a quiet route at rush hour cut benzene by {benzene}% and PM2.5 by {pm25}%, measured on commuters riding bicycles and electric scooters.',
    },
    handoff: {
      'zh-TW': '回到路口，倒數繼續。同一個紅燈，每個人站的位置不一樣。',
      en: 'Back to the crossing; the countdown resumes. Same red light, but not everyone is in the same place.',
    },
  },

  // 3.8 ---------------------------------------------------------------------------------------
  link6: {
    title: { 'zh-TW': '同一個紅燈，|不一樣的位置', en: 'Same red light. |Different places in it.' },
    deck: {
      'zh-TW': '離排氣管最近的不是路人，是騎在車陣裡的人。等紅燈的時候，你前面那台的排氣管就在你腳邊。',
      en: 'The person nearest the tailpipes is not the passer-by. It is the rider inside the pack. At a red light, the tailpipe of the scooter ahead is at your feet.',
    },
    body: [
      {
        'zh-TW': '台北同一個早上的一小時，身上量到的 PM2.5：搭捷運 {subway}，走路 {walking}，騎燃油機車 {scooter}（{unit}）。這是所有來源的 PM2.5，不是只算廢氣。',
        en: 'Over the same morning hour in Taipei, personal PM2.5 averaged {subway} on the subway, {walking} walking and {scooter} on a gasoline scooter ({unit}). That is PM2.5 from all sources, not exhaust alone.',
      },
      {
        'zh-TW': '再來是嬰兒車。它的高度是 {lo} 到 {hi} 公分，就在排氣管那一公尺裡。國外多數研究發現，這個高度比大人的高度多 {a}% 到 {b}%；有一項量到多 {max}%，一項是「最多 {uk}%」；一項沒有一致的差別，還有一項早上反而低 {am}%。沒有一項在台灣。',
        en: 'Then the stroller. It sits {lo} to {hi} cm up, inside the tailpipe’s first metre. Abroad, most studies found {a} to {b}% more at that height than at adult height; one found {max}% and one “up to {uk}%”; one found no consistent difference, and one found babies {am}% lower in the morning. None was in Taiwan.',
      },
      {
        'zh-TW': '上小學的孩子已經比這一層高。對他們來說，有根據的是另一件事：小孩呼吸比大人快。坐在機車前踏板或後座上學的孩子，也在車陣裡；他們吸進多少，同樣沒有人量過。',
        en: 'A primary-school child already stands above that band. What is established for them is something else: children breathe faster than adults. Children who ride to school on the footboard or pillion are in the pack too, and nobody has measured what they breathe either.',
      },
    ],
    figure: {
      title: { 'zh-TW': '同一個早上，三種通勤：|騎機車的人吸到的最多', en: 'Same morning, three commutes: |the rider breathes the most' },
      subtitle: { 'zh-TW': '台北，早上一小時的個人 PM2.5 平均（{unit}），所有來源的 PM2.5', en: 'Taipei, personal PM2.5 over one morning hour ({unit}), PM2.5 from all sources' },
      chart: { 'zh-TW': '三種通勤方式的個人 PM2.5 長條圖', en: 'Bar chart of personal PM2.5 by three ways of commuting' },
      desc: {
        'zh-TW': '搭捷運 {subway}、走路 {walking}、騎燃油機車 {scooter}。',
        en: 'Subway {subway}, walking {walking}, gasoline scooter {scooter}.',
      },
      category: { 'zh-TW': '通勤方式', en: 'Commute' },
      value: { 'zh-TW': 'PM2.5', en: 'PM2.5' },
    },
    caveat: {
      'zh-TW': '台灣沒有任何孩童高度的實測。整理嬰兒車研究的那篇回顧自己也說，離地兩公尺內，濃度不一定隨高度變。騎士的數字是 PM2.5，不是廢氣專屬的指標。',
      en: 'No child-height measurement exists for Taiwan. The review that gathers the stroller studies itself says concentration may not change with height in the first two metres. The riders’ figure is PM2.5, which is not a marker specific to exhaust.',
    },
    action: {
      'zh-TW': '推嬰兒車等紅燈，停在離待轉區和停止線遠一點的地方。這是預防，不是量過的效果。',
      en: 'Waiting with a stroller, stop a little further from the turn box and the stop line. This is a precaution, not a measured benefit.',
    },
    handoff: { 'zh-TW': '剩 5 秒。', en: 'Five seconds.' },
  },

  // 3.9 ---------------------------------------------------------------------------------------
  green: {
    title: { 'zh-TW': '綠燈亮的|那一秒', en: 'The second |it turns green' },
    deck: {
      'zh-TW': '香港、上海和英國的研究都看到同一件事：路口的微粒高峰跟著號誌走，而最高的那一下，通常不是車在等的時候，是車起步的時候。小黃帽也是這一秒踏出去的。',
      en: 'Studies in Hong Kong, Shanghai and the UK see the same thing: particle peaks at a junction follow the signal, and the highest usually comes not while vehicles wait but as they pull away. That is also the second the child in the yellow cap steps out.',
    },
    body: [
      { 'zh-TW': '我們原本以為最糟的是怠速。證據說，不一定。', en: 'We began this project assuming idling was the worst moment. The evidence says: not necessarily.' },
    ],
    figure: {
      title: { 'zh-TW': '等的時候和起步的時候，|都算數', en: 'The wait and the pull-away |both count' },
      subtitle: { 'zh-TW': '一個號誌循環：先紅燈，再綠燈。這張圖只標時間，不標多少。', en: 'One signal cycle: red, then green. This strip marks when, not how much.' },
    },
    caveat: {
      'zh-TW': '那些研究量的多半是汽車和柴油車，不在台灣，也不是機車。機車起步那一下有多少，台灣沒有人量過。',
      en: 'Those studies mostly measured cars and diesel vehicles, none in Taiwan, none of scooters. How much a scooter emits as it pulls away has not been measured here.',
    },
    handoff: { 'zh-TW': '90 秒過了。把剛才看到的接起來。', en: 'The ninety seconds are up. Now put together what you saw.' },
  },

  // 3.10 --------------------------------------------------------------------------------------
  connect: {
    title: { 'zh-TW': '每一環都有出處。|接起來的那一步，|你自己看', en: 'Every link has a source. |The step that joins them |is yours to judge.' },
    deck: { 'zh-TW': '下面是六件有出處的事，和一格沒有人量過的空白。', en: 'Below are six sourced facts and one blank that nobody has measured.' },
    board: [
      { 'zh-TW': '論排放量，機車的粉塵很少，油氣和一氧化碳很多。', en: 'By emissions, scooters put out little dust and a lot of fumes and carbon monoxide.' },
      {
        'zh-TW': '排氣管離地不到一公尺；標線規則只要求待轉區離斑馬線 {cm} 公分。',
        en: 'The tailpipe is under a metre off the ground; the marking rules ask for {cm} cm between the turn box and the crosswalk.',
      },
      { 'zh-TW': '台北一項通勤研究裡，測站的數字跟不上通勤的人吸到的苯類。', en: 'In one Taipei commuter study, station readings did not track the benzene-family compounds commuters breathed.' },
      { 'zh-TW': '廢氣裡有確定致癌的苯，和沒有味道的一氧化碳；鼻子聞不出它們有多少。', en: 'Exhaust contains benzene, a known carcinogen, and odourless carbon monoxide; a nose cannot tell how much of either.' },
      { 'zh-TW': '長年吸車流廢氣，和死亡、心臟病、肺癌、氣喘有關。', en: 'Years of breathing traffic exhaust are associated with death, heart disease, lung cancer and asthma.' },
      { 'zh-TW': '小孩呼吸比大人快；嬰兒車的高度，就在排氣管那一公尺裡。', en: 'Children breathe faster than adults; a stroller sits inside the tailpipe’s first metre.' },
    ],
    question: { 'zh-TW': '所以，這 90 秒裡，站在旁邊的人吸進了什麼？', en: 'So what did the person standing beside it breathe in these ninety seconds?' },
    reveal: {
      'zh-TW': '我們的推論：尖峰時間的路口，站在怠速車陣旁邊的人，吸進的油氣和一氧化碳，比站遠一點的人多；測站的數字不一定看得出來；而且這件事天天重複。每一環都有出處，接起來的這一步是我們的判斷，沒有人直接量過。它對健康的影響有多大，我們不知道。',
      en: 'Our inference: at a rush-hour crossing, the person beside an idling pack breathes more fumes and carbon monoxide than someone standing further away; station readings may not show it; and it repeats every day. Each link is sourced. The step that joins them is our judgement, and nobody has measured it directly. How much it matters for health, we do not know.',
    },
    notSaying: [
      { 'zh-TW': '等一個紅燈會生病。', en: 'That one red light makes you ill.' },
      { 'zh-TW': '機車廢氣是第 1 級致癌物。', en: 'That scooter exhaust is a Group 1 carcinogen.' },
      { 'zh-TW': '機車是 PM2.5 的主要來源。', en: 'That scooters are a main source of PM2.5.' },
      { 'zh-TW': '味道愈重，傷害愈大。', en: 'That a stronger smell means more harm.' },
      { 'zh-TW': '台灣哪一項健康研究的結果是機車造成的。', en: 'That any Taiwanese health finding was caused by scooters.' },
    ],
    changeMind: {
      'zh-TW': '如果有人在機車多的路口，在行人和嬰兒車的高度，分紅燈和綠燈，把一氧化碳、苯類和超細微粒量出來，結果和附近的背景值差不多，第 3 環就不成立。我們會改寫這一頁，並且寫明為什麼改。',
      en: 'If someone measures carbon monoxide, benzene-family compounds and ultrafine particles at a scooter-heavy crossing, at pedestrian and stroller height, by red and green phase, and finds them close to the nearby background, Link 3 fails. We will rewrite this page and say why.',
    },
    handoff: {
      'zh-TW': '不必等那個數字，也能做決定。不管那一格最後量出多少，車陣換成電動，機車排的那一份就是零。',
      en: 'You do not need that number to decide. Whatever that box turns out to hold, when the pack is electric the scooters’ share of it is zero.',
    },
  },

  // 3.11 --------------------------------------------------------------------------------------
  link7: {
    title: { 'zh-TW': '同一個路口，|沒有排氣管', en: 'Same crossing. |No tailpipes.' },
    deck: {
      'zh-TW': '倒數回到 90。一樣的紅燈，一樣的車陣，只是換成電動的。電動機車沒有排氣管：在路口，它不排一氧化碳、油氣和苯。',
      en: 'The countdown goes back to 90. Same red light, same pack, electric. An electric scooter has no tailpipe: at the crossing it emits no carbon monoxide, fuel vapour or benzene.',
    },
    body: [
      {
        'zh-TW': '這不是零污染，是這台車在路口零廢氣。輪胎、煞車和路面的粉塵還在，發電的排放在別的地方，旁邊的汽車和公車也還在排。換了之後街上的空氣實際乾淨多少，台灣還沒有人量過。',
        en: 'This is not zero pollution. It is zero exhaust from this scooter at the crossing. Tyre, brake and road dust remain, power generation emits elsewhere, and the cars and buses alongside are still running. How much cleaner the street air actually gets after the switch has not been measured in Taiwan.',
      },
      {
        'zh-TW': '換車，拿掉的是你那根排氣管。受惠的是站在你旁邊的人，還有騎在你後面的那一台。你自己騎在車陣裡，還是會吸到別人的。',
        en: 'Switching removes your tailpipe from other people’s air: the people beside you, and the rider behind you. In the pack, you still breathe everyone else’s.',
      },
      {
        'zh-TW': '台灣這幾年是往回走的：新掛牌的機車裡，電動的比例 {y1} 年是 {s1}%，{y2} 年剩 {s2}%。政府自己訂的目標，是 {ty} 年 {t}%。',
        en: 'Taiwan has been going backwards: {s1}% of newly registered scooters were electric in {y1}, and {s2}% in {y2}. The government’s own target is {t}% by {ty}.',
      },
      {
        'zh-TW': '排氣管也不是只有「買車」這一條路能動。量測、路口設計、定檢、明年的補助，是政府的部分。準時定檢、該修就修、把二行程報廢，是不換車也做得到的，都算數。',
        en: 'Nor is buying a scooter the only way to act on the tailpipe. Measurement, crossing design, inspection and next year’s subsidies are the government’s part. Turning up for inspection, fixing what fails and scrapping a two-stroke are things you can do without switching, and they count.',
      },
    ],
    figure: {
      title: { 'zh-TW': '往回走的那條線：|離政府自己的目標愈來愈遠', en: 'The line going backwards: |further from the government’s own targets' },
      subtitle: { 'zh-TW': '電動機車占新掛牌機車的比例（%），{period}', en: 'Electric share of newly registered scooters (%), {period}' },
      chart: { 'zh-TW': '電動機車市售比折線圖，加上淨零路徑的目標', en: 'Line chart of the electric share of new scooters, with the net-zero pathway targets' },
      desc: {
        'zh-TW': '{y1} 年 {s1}%，{y2} 年 {s2}%；目標是 {targets}。實線是實際數字，虛線和空心點是目標，不是預測。',
        en: '{s1}% in {y1}, {s2}% in {y2}; the targets are {targets}. The solid line is what happened; the dashed line and hollow points are targets, not forecasts.',
      },
      actual: { 'zh-TW': '實際', en: 'Actual' },
      target: { 'zh-TW': '目標', en: 'Target' },
      year: { 'zh-TW': '年', en: 'Year' },
      caption: {
        'zh-TW': '每年的數字來自媒體轉述的交通部或產業統計；沒有查證到的年份留白，不連線。目標是政策目標，不是預測。',
        en: 'Annual figures come from media reports of ministry or industry statistics; years we could not verify are left blank, not joined. Targets are policy targets, not forecasts.',
      },
    },
    caveat: {
      'zh-TW': '台北那項通勤研究裡，在機車道上騎電動機車的人，身上照樣量得到苯類。少一根排氣管是確定的；少多少廢氣進到誰的肺裡，沒有人量過。',
      en: 'In the Taipei commuter study, people riding electric scooters in the scooter lane still carried readings of benzene-family compounds. One tailpipe fewer is certain; how much less exhaust reaches anyone’s lungs has not been measured.',
    },
    action: { 'zh-TW': '下一台，考慮電動的。還沒到換車的時候？', en: 'For your next one, consider electric. Not changing scooters yet? ' },
    actionLink: { 'zh-TW': '看「我現在不打算換車」', en: 'See “I’m not switching now”' },
    handoff: { 'zh-TW': '剩下的問題很實際：換一台，要多少錢？', en: 'What remains is practical: what does it cost to switch?' },
  },

  // 3.12 --------------------------------------------------------------------------------------
  money: {
    title: { 'zh-TW': '補助最晚到|{deadline}。|打不打得平，|算給你看', en: 'Subsidies end by {deadline} |at the latest. |Here is how |the sums come out.' },
    deck: {
      'zh-TW': '{year} 年的電動機車補助，最晚都要在 {deadline}前買車、領牌；有些縣市的名額更早就用完了。買不買得到跟燃油車一樣的價錢，看你住哪裡，手上有沒有出廠滿 10 年的機車可以報廢。騎起來省不省，看你一個月騎多少。我們幫你算；算出來打不平，也照實講。',
      en: 'Every {year} electric-scooter subsidy requires purchase and registration by {deadline} at the latest, and some cities’ money ran out earlier. Whether you can match the price of a gasoline scooter depends on where you live and whether you have a scooter ten or more years old to scrap. Whether it is cheaper to run depends on how far you ride each month. We will do the sums, and say so when they do not come out in favour.',
    },
    body: {
      'zh-TW': '騎得少的人，換電月租會比加油貴：{fact}。這件事我們先講，免得你到車行才發現。',
      en: 'If you ride little, a battery subscription costs more than petrol: {fact}. We would rather you heard it here than at the dealership.',
    },
    next2027: {
      'zh-TW': '{nextYear} 年的方案，還沒有一項定案。環境部預告了一項草案，要把一筆小額的汰舊空污補助延長，也還沒定案。',
      en: 'Nothing is confirmed for {nextYear}. The environment ministry has published a draft to extend one small scrappage payment, and that is not final either.',
    },
    personasLabel: { 'zh-TW': '兩個算好的例子', en: 'Two worked examples' },
    personasIntro: {
      'zh-TW': '先看打不平的，再看打得平的。兩個都是試算工具算出來的，不是我們挑出來的價錢。',
      en: 'The one that does not add up first, then the one that does. Both come from the calculator; we did not pick the prices.',
    },
    verdictFail: { 'zh-TW': '打不平：|電動的還貴 {gap}', en: 'It does not add up: |electric costs {gap} more' },
    verdictPass: { 'zh-TW': '打得平：|電動的少付 {gap}', en: 'It adds up: |electric costs {gap} less' },
    who: { 'zh-TW': '{city}，{scrap}，{model}', en: '{city}, {scrap}, {model}' },
    noScrap: { 'zh-TW': '沒有車可以報廢', en: 'nothing to scrap' },
    withScrap: { 'zh-TW': '報廢一台 {year} 年出廠的四行程機車', en: 'scrapping a four-stroke built in {year}' },
    heavy: { 'zh-TW': '要白牌：最便宜的白牌（重型）電動機車', en: 'wants a white plate: the cheapest white-plate (heavy) electric scooter' },
    light: { 'zh-TW': '最便宜的綠牌（輕型）電動機車，和 125cc 不是同一級', en: 'the cheapest green-plate (light) electric scooter, not the same class as a 125cc' },
    subtitle: {
      'zh-TW': '新台幣，以 {date} 的補助和價格計算；比的是試算工具裡最便宜的 125cc 燃油機車',
      en: 'NT$, at the subsidies and prices of {date}; compared with the cheapest 125cc gasoline scooter in the calculator',
    },
    chart: { 'zh-TW': '電動機車價格瀑布圖：建議售價、每一筆補助、實付價格，和燃油機車比', en: 'Waterfall of the electric scooter price: list price, each subsidy, what you pay, against the gasoline scooter' },
    caption: {
      'zh-TW': '每一筆補助都是試算工具依{city}的規定算的；燃油機車的價格也扣掉了它自己的優惠和稅減。',
      en: 'Each subsidy is the calculator’s reading of {city}’s rules; the gasoline price also has its own offers and tax cuts taken off.',
    },
    pastNote: {
      'zh-TW': '上面兩個例子，是用 {year} 年的補助算的。那些補助已經停止受理購車。',
      en: 'The two examples above use the {year} subsidies, which no longer accept purchases.',
    },
    cityLabel: { 'zh-TW': '你住在哪個縣市？', en: 'Which city or county do you live in?' },
    cityNone: { 'zh-TW': '還沒選', en: 'Not chosen' },
    cityHint: { 'zh-TW': '選了之後，下面會告訴你那裡的補助現在是什麼狀態。', en: 'Choose one and the line below says where its subsidy stands.' },
    calc: { 'zh-TW': '用我的條件算', en: 'Work it out for me' },
    keep: { 'zh-TW': '我現在不打算換車', en: 'I’m not switching now' },
    askPolicy: { 'zh-TW': '要求公布 {nextYear} 年方案', en: 'Ask for the {nextYear} programme to be published' },
    noSubsidy: { 'zh-TW': '看沒有補助時的價差', en: 'See the gap without subsidies' },
    caveat: {
      'zh-TW': '目前最便宜的電動機車都是綠牌或輕型，性能都不等同 125cc。名額先到先得。每個數字旁邊有我們查證的日期，下單前請再看一次官方頁面。',
      en: 'The cheapest electric scooters today are green-plate or light class, and none matches a 125cc. Quotas are first come, first served. Every figure shows the date we checked it; look at the official page again before you order.',
    },
  },

  // 3.13 --------------------------------------------------------------------------------------
  next: {
    title: { 'zh-TW': '下一個紅燈|還是 90 秒', en: 'The next red light |is still ninety seconds.' },
    deck: { 'zh-TW': '差別只在，旁邊那一排有沒有排氣管。', en: 'The only difference is whether the row beside you has tailpipes.' },
    rolesLabel: { 'zh-TW': '從你的位置開始', en: 'Start from where you stand' },
    roles: {
      walk: {
        title: { 'zh-TW': '我走路', en: 'I walk' },
        a1: { 'zh-TW': '把七件事，或一張問題圖卡，傳到一個 LINE 群組。', en: 'Send the seven things, or one question card, to one LINE group.' },
        a2: { 'zh-TW': '請環保局來量你家路口。', en: 'Ask the city to measure your crossing.' },
      },
      ride: {
        title: { 'zh-TW': '我騎車', en: 'I ride' },
        a1: { 'zh-TW': '準時定檢，該修就修。出廠久、里程高的車，每公升油排得多很多。', en: 'Turn up for inspection and fix what fails. Older and high-mileage scooters emit far more per litre.' },
        a2: { 'zh-TW': '家裡的二行程，報廢掉。', en: 'Scrap the household’s two-stroke.' },
      },
      parents: {
        title: { 'zh-TW': '我有小孩', en: 'I have children' },
        a1: { 'zh-TW': '推嬰兒車等紅燈，離待轉區和停止線遠一點。這是預防，不是量過的效果。', en: 'With a stroller, wait a little further from the turn box and the stop line. A precaution, not a measured benefit.' },
        a2: { 'zh-TW': '上學的路線，挑大路口少的那一條。', en: 'Pick the school route with fewer big junctions.' },
      },
      neighbourhood: {
        title: { 'zh-TW': '我們這個里、這間學校', en: 'Our neighbourhood, our school' },
        a1: { 'zh-TW': '一起請環保局來量一個指名的路口，副本給議員。', en: 'Ask together for one named crossing to be measured, copied to your councillor.' },
        a2: { 'zh-TW': '請學校旁的路口先試著把待轉區往後退，改前改後都量。', en: 'Ask for the school crossing to trial a set-back turn box, measured before and after.' },
      },
      policy: {
        title: { 'zh-TW': '我在政府或議會', en: 'I work in government or a council' },
        a1: { 'zh-TW': '公布 {nextYear} 年的補助方案，一次講清楚好幾年。', en: 'Publish the {nextYear} programme, for several years at a time.' },
        a2: { 'zh-TW': '出錢去量，把那張空白的圖填起來。', en: 'Commission the measurement and fill in the empty chart.' },
      },
    },
    share: { 'zh-TW': '把這七件事傳出去', en: 'Pass the seven things on' },
    shareNote: { 'zh-TW': '一張圖卡，附註印在圖裡面。', en: 'One card, with its caveat printed inside the picture.' },
    sources: { 'zh-TW': '所有出處', en: 'Every source' },
    corrections: {
      'zh-TW': '發現我們哪裡說錯了？告訴我們。我們會改，並且留下修改紀錄。',
      en: 'Found something we got wrong? Tell us. We will fix it and keep a record of the change.',
    },
    correctionsLink: { 'zh-TW': '修改紀錄', en: 'The corrections log' },
  },
});
