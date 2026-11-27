// Copy for /evidence/ (blueprint 4.5): the chain, link by link. Every number on the page comes
// from the registry and is filled into {tokens} at render time; nothing numeric is typed here.
// Headlines are the home page's (blueprint 3.3–3.11), verbatim. See ./_copy.ts.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '證據鏈，一環一環看', en: 'The chain, link by link' },
    description: {
      'zh-TW': '機車廢氣和路口行人之間的每一環。誰量了什麼、量到多少、證據是哪一種、沒有說什麼。還有本站自己推估的部分。',
      en: 'Every link between scooter exhaust and the people at the crossing. Who measured what, what they found, what kind of evidence it is, what each item does not show, and which parts are this site’s own estimate.',
    },
  },

  head: {
    kicker: { 'zh-TW': '證據', en: 'Evidence' },
    title: { 'zh-TW': '證據鏈，|一環一環看', en: 'The chain, |link by link' },
    lead: {
      'zh-TW': '想查證的人看這一頁。網站上每個有出處的數字都在這裡。誰做的、怎麼做的、是哪一種證據，還有它沒有說什麼。',
      en: 'This page is for anyone who wants to check our work. Every sourced figure on the site is here: who produced it, how, what kind of evidence it is, and what it does not show.',
    },
    estimate: { 'zh-TW': '本站的推估怎麼算的', en: 'How our estimate was worked out' },
    tocLabel: { 'zh-TW': '這一頁有什麼', en: 'On this page' },
  },

  toc: {
    chain: { 'zh-TW': '七環一覽', en: 'The seven links' },
    map: { 'zh-TW': '證據地圖', en: 'Evidence map' },
    studies: { 'zh-TW': '讀過全文的研究', en: 'Studies read in full' },
    answers: { 'zh-TW': '以前的問題，現在的答案', en: 'Former questions, answered' },
    notClaimed: { 'zh-TW': '我們不會說的話', en: 'What we will not say' },
    changeMind: { 'zh-TW': '什麼會讓我們改口', en: 'What would change our mind' },
    notUsed: { 'zh-TW': '我們不這樣用的數字', en: 'Figures we do not use that way' },
    smell: { 'zh-TW': '聞得到的時候，空氣裡還有什麼', en: 'When you can smell it, what else is in the air' },
    method: { 'zh-TW': '怎麼查證的', en: 'How we checked' },
    linkN: { 'zh-TW': '第 {n} 環', en: 'Link {n}' },
  },

  howTo: {
    title: { 'zh-TW': '怎麼讀這一頁', en: 'How to read this page' },
    body: {
      'zh-TW': '每一環先講一句話，再放一個重要的數字和一張圖。想看更多，按「看這一環的細節」。裡面有常見問題的答案、證據表和出處。證據表每一列都寫著：我們說什麼、數字、誰做的、哪一種證據，還有它沒有說什麼。每一列都有自己的連結，可以分享。數字旁邊的小標籤，說它是哪一種：',
      en: 'Each link starts with one sentence, then one key number and one chart. For more, press “See the detail for this link”. Inside are answers to common questions, the table of evidence and the sources. Each row of the table says what we say, the number, who did it, what kind of evidence it is, and what it does not show. Every row has its own link you can share. The small label beside a number says what kind it is:',
    },
  },

  columns: {
    say: { 'zh-TW': '我們說什麼', en: 'What we say' },
    number: { 'zh-TW': '數字', en: 'The number' },
    who: { 'zh-TW': '誰做的、怎麼做的', en: 'Who did it, and how' },
    kind: { 'zh-TW': '證據類型', en: 'Kind of evidence' },
    notShow: { 'zh-TW': '這一項沒有說什麼', en: 'What this does not show' },
  },

  row: {
    permalink: { 'zh-TW': '這一列的連結', en: 'Link to this row' },
    readAs: { 'zh-TW': '閱讀程度：', en: 'How we read it:' },
    when: { 'zh-TW': '時間：', en: 'When:' },
    where: { 'zh-TW': '地點：', en: 'Where:' },
    mustRead: { 'zh-TW': '要一起看', en: 'Read with this' },
    // shown only when the registry records no limitation for a fact: what is true of every
    // fact of that evidence type, and nothing more
    noCaveat: {
      'measured-tw': { 'zh-TW': '本站的資料沒有為這一項另外寫下限制；請看原始研究的說明。', en: 'Our data records no further limitation for this item; see the original study.' },
      'official-tw': { 'zh-TW': '這是官方的統計、標準或規定，不是在路口量到的空氣。', en: 'This is an official statistic, standard or rule, not a measurement of the air at a crossing.' },
      'modelled-tw': { 'zh-TW': '這是模式算出來的，不是量測。', en: 'This comes from a model, not a measurement.' },
      estimate: { 'zh-TW': '這是本站的推估：算的，不是量的，所以給一個範圍。', en: 'This is this site’s estimate: worked out from sourced figures, so it comes as a range.' },
      international: { 'zh-TW': '這是台灣以外的證據，或國際機構的說法；不是在台灣的路口量的。', en: 'This is evidence from outside Taiwan, or an international body’s statement; it does not come from a Taiwanese crossing.' },
      derived: { 'zh-TW': '這是本站用引用的數字算出來的，不是新的量測。', en: 'This is our arithmetic on cited figures, not a new measurement.' },
      'market-tw': { 'zh-TW': '這是業者或公會公布的價格、條件或數字，會變動；不是官方統計，下單前請再看一次。', en: 'These are prices, terms or figures published by companies or trade associations, and they change; they are not official statistics, so check again before you buy.' },
    },
    more: { 'zh-TW': '再看第 {n} 環其餘 {count} 項證據', en: 'Show the rest of link {n} ({count})' },
    moreData: { 'zh-TW': '第 {n} 環的其他 {count} 組圖表資料', en: 'More chart data for link {n} ({count})' },
    alsoTitle: { 'zh-TW': '也用在這一環的證據', en: 'Also used in this link' },
    alsoLead: { 'zh-TW': '這幾項的完整一列放在別的地方。', en: 'The full row for each of these is elsewhere on the page.' },
    alsoIn: { 'zh-TW': '完整的一列在第 {n} 環', en: 'Full row in link {n}' },
    alsoNotUsed: { 'zh-TW': '完整的一列在「我們不這樣用的數字」', en: 'Full row under “figures we do not use that way”' },
    alsoCase: { 'zh-TW': '完整的一列在下面「三台車的個案」框裡', en: 'Full row in the “three-scooter case study” panel below' },
    rows: { 'zh-TW': '{count} 項', en: '{count}' },
    // R14: the never-smoker figures appear only in #not-used, so pointers to them carry no number
    neverSmokerPointer: { 'zh-TW': '不吸菸者肺癌的數字', en: 'The never-smoker lung cancer figures' },
  },

  chain: {
    title: { 'zh-TW': '七環一覽', en: 'The seven links at a glance' },
    lead: {
      'zh-TW': '網站說的事，像七個環扣成的一條鏈。點一環，就跳過去。',
      en: 'What the site says is like a chain of seven links. Tap one to jump to it.',
    },
    see: { 'zh-TW': '看第 {n} 環的證據', en: 'See the evidence for link {n}' },
  },

  map: {
    title: { 'zh-TW': '證據地圖', en: 'The evidence map' },
    lead: {
      'zh-TW': '每一列是一環，每一欄是一種證據。格子裡是那一環用到的來源。最後一欄是本站自己的推估，點了會到算法。第 3 環的推估用虛線框起來：機車旁邊多出來的那一部分，是算的。',
      en: 'Each row is a link; each column is a kind of evidence. A cell lists the sources that link uses. The last column is this site’s own estimates, each linking to its working. Link 3’s estimate is outlined in dashes: what the scooters add right beside you is worked out.',
    },
    open: { 'zh-TW': '打開證據地圖', en: 'Open the evidence map' },
    short: { 'zh-TW': '每一環用了哪幾種證據、哪些來源，一張表看完。', en: 'Which kinds of evidence and which sources each link uses, in one table.' },
    estimateColumn: { 'zh-TW': '本站推估', en: 'Our estimate' },
    estimateKerb: { 'zh-TW': '機車旁邊多出來的廢氣', en: 'What the scooters add beside you' },
    linkColumn: { 'zh-TW': '環', en: 'Link' },
    sourcesN: { 'zh-TW': '{n} 個來源', en: '{n} sources' },
    none: { 'zh-TW': '無', en: 'None' },
    caption: {
      'zh-TW': '同一個來源可能出現在好幾格。數字是來源的編號，點了會到資料來源頁的那一筆。',
      en: 'A source can appear in several cells. The numbers are the sources’ numbers; each one goes to its entry on the sources page.',
    },
  },

  // The headline of each link is the home page's (blueprint 3.3–3.11), verbatim.
  links: [
    { title: { 'zh-TW': '微粒很少，|油氣很多', en: 'Few particles. |A lot of fumes.' } },
    // On this page each headline stands alone (no deck), so it names what the 50 cm is between (claims policy: no typical stop-box distance)
    { title: { 'zh-TW': '排氣管離地不到一公尺。|待轉區只要求離斑馬線 {cm} 公分', en: 'The tailpipe is under a metre off the ground. |The turn box need only be {cm} cm from the crosswalk.' } },
    // Link 3 is whole (brief 7.3): the institute measured the waiting areas; beside the scooters, the site's estimate
    { title: { 'zh-TW': '等候區量過了，|機車旁邊是推估', en: 'The waiting areas were measured. |Beside the scooters, we estimate.' } },
    { title: { 'zh-TW': '聞不到，|不代表空氣乾淨', en: 'No smell |does not mean clean air.' } },
    { title: { 'zh-TW': '長年吸車子的廢氣，|和氣喘、心臟病、肺癌有關', en: 'Years of traffic exhaust are linked to |asthma, heart disease and lung cancer.' } },
    {
      title: { 'zh-TW': '同一個紅燈，|不一樣的位置', en: 'Same red light. |Different places in it.' },
      question: { 'zh-TW': '誰離排氣管最近？誰最容易受影響？', en: 'Who is closest to the tailpipes, and who is most susceptible?' },
    },
    { title: { 'zh-TW': '同一個路口，|沒有排氣管', en: 'Same crossing. |No tailpipes.' } },
  ],

  // Before each link's fold: its one key number (the value, chip and period come from the registry)
  key: {
    labels: [
      { 'zh-TW': '燃油機車排的一氧化碳，占全台灣排放量', en: 'Petrol scooters’ share of Taiwan’s carbon monoxide emissions' },
      { 'zh-TW': '規定：待轉區和斑馬線之間要留', en: 'The rule: the gap between the turn box and the crosswalk' },
      { 'zh-TW': '機車旁邊：本站的推估', en: 'Beside the scooters: our estimate' },
      { 'zh-TW': '一氧化碳是什麼樣子', en: 'What carbon monoxide is like' },
      { 'zh-TW': '國際回顧整理的研究', en: 'Studies in the international review' },
      { 'zh-TW': '台北早上通勤一小時，身上量到的 PM2.5 平均', en: 'PM2.5 measured on people during a Taipei morning commute (average)' },
      { 'zh-TW': '新掛牌的機車裡，電動的比例', en: 'Electric share of newly registered scooters' },
    ],
    source: { 'zh-TW': '看這個數字的出處', en: 'Where this number comes from' },
  },
  // Links from an answer card to its link of the chain name the topic, not a number
  answerLink: {
    label: { 'zh-TW': '更多證據：{topic}', en: 'More evidence: {topic}' },
    topics: [
      { 'zh-TW': '排氣管排出什麼', en: 'what leaves the tailpipe' },
      { 'zh-TW': '廢氣排在哪裡', en: 'where the exhaust comes out' },
      { 'zh-TW': '旁邊的人吸進什麼', en: 'what people beside it breathe' },
      { 'zh-TW': '這些成分對身體做什麼', en: 'what those compounds do' },
      { 'zh-TW': '吸廢氣的人怎麼了', en: 'what happens to people who breathe it' },
      { 'zh-TW': '誰離得最近', en: 'who is closest' },
      { 'zh-TW': '換電動機車', en: 'going electric' },
    ],
  },
  more: {
    open: { 'zh-TW': '看這一環的細節', en: 'See the detail for this link' },
    count: { 'zh-TW': '問答、證據表、出處，{count} 項', en: 'answers, evidence, sources ({count})' },
  },

  link: {
    question: { 'zh-TW': '這一環問的是：', en: 'This link asks:' },
    visuals: { 'zh-TW': '圖表', en: 'Charts' },
    // rows are ordered by evidence type (src/data/chain.ts), not by strength
    table: { 'zh-TW': '證據表：依證據種類排列，台灣的量測在最前面', en: 'The evidence, by kind: measurements in Taiwan first' },
    table5: { 'zh-TW': '證據表：國際回顧在最前面，其餘依證據種類排列', en: 'The evidence: the international review first, the rest by kind' },
    answers: { 'zh-TW': '這一環的問題，現在的答案', en: 'Questions in this link, answered' },
    next: { 'zh-TW': '下一環', en: 'Next link' },
    top: { 'zh-TW': '回到七環一覽', en: 'Back to the seven links' },
  },

  // Link 5: the review first, and the ruler stated once, plainly (R2).
  link5: {
    leadTitle: { 'zh-TW': '最有份量的證據先放', en: 'The weightiest evidence first' },
    lead: {
      'zh-TW': '這一環最有份量的，是一份整理了 {studies} 篇研究的國際回顧。它看的是長年吸車子廢氣的人，不是等一個紅燈的人。',
      en: 'The weightiest evidence in this link is an international review of {studies} studies. It looked at people breathing traffic exhaust for years, not at people waiting through one red light.',
    },
    rulerLabel: { 'zh-TW': '注意這把尺', en: 'Mind the ruler' },
    ruler: {
      'zh-TW': '這一環的台灣健康研究，看到的是「有關」，不是「造成」；我們也不會寫成「造成」。說到「造成」的，是國際機構的整理。HEI 認為，交通污染會讓小孩的氣喘惡化。美國胸腔學會認為，長年的空氣污染是小孩氣喘的病因之一。美國心臟學會認為，證據符合 PM2.5 引發心血管疾病的因果解釋。它們講的是一般的交通或空氣污染，時間從幾小時到好幾年。講的不是機車，也不是一個紅燈。這一環沒有任何一項健康研究，把機車廢氣單獨分出來。它們量的是整體車流的污染，或所有來源的 PM2.5。而 PM2.5 微粒，正是第 1 環說機車排得很少的那一種。',
      en: 'The Taiwanese health studies in this link show association, not cause, and we do not write them up as cause. Where cause is stated, it is by international bodies. HEI found sufficient evidence that traffic pollution makes children’s asthma worse. The American Thoracic Society concluded that long-term air pollution is a cause of childhood asthma. The American Heart Association found the evidence consistent with PM2.5 causing cardiovascular disease. They mean traffic or air pollution in general, over hours to years: not scooters, and not one red light. Not one health study in this link isolates scooter exhaust. They measured traffic pollution as a whole, or PM2.5 from all sources. PM2.5 particles are the pollutant Link 1 found scooters emit little of.',
    },
  },

  // Featured charts, blueprint Part 5. Titles say what the chart shows; numbers are filled in.
  v5: {
    title: { 'zh-TW': '論排放量：|微粒很少，油氣很多', en: 'By emissions: |few particles, a lot of fumes' },
    subtitle: { 'zh-TW': '燃油機車占全台灣排放量的比例，每一條都是 0 到 100%', en: 'Petrol scooters’ share of Taiwan’s emissions; each bar runs from 0 to 100%' },
    caption: {
      'zh-TW': '這是「排放量」的占比，不是你吸進去的比例；排得多，不代表每個路口都濃。',
      en: 'These are shares of emissions, not of what you breathe; a large output does not mean thick air at every crossing.',
    },
    chartTitle: { 'zh-TW': '燃油機車排放量占比的長條圖，每一條從 0 到 100%', en: 'Bar chart of petrol scooters’ emission shares, each from 0 to 100%' },
    desc: {
      'zh-TW': '每一種污染物一條，從 0 到 100%。PM2.5 和 PM10 的機車段很細。一氧化碳和碳氫化合物（大多是油氣）的機車段比較寬。沒有一條過半。',
      en: 'One bar per pollutant, from 0 to 100%. The scooter segment is a sliver for PM2.5 and PM10. It is wider for carbon monoxide and hydrocarbons (mostly fuel vapour). It is nowhere a majority.',
    },
  },
  v34: {
    title: { 'zh-TW': '路上有多少車', en: 'How many scooters' },
    registered: { 'zh-TW': '登記的機車', en: 'Registered motorcycles' },
    electric: { 'zh-TW': '電動機車', en: 'Electric motorcycles' },
    twoStroke: { 'zh-TW': '還在登記的二行程機車', en: 'Two-strokes still registered' },
    retired: { 'zh-TW': '已淘汰的老舊機車', en: 'Older scooters retired' },
    unitBig: { 'zh-TW': '萬輛', en: 'million' },
    about: { 'zh-TW': '約', en: 'about' },
    orFewer: { 'zh-TW': '萬輛以下', en: 'or fewer' },
  },
  v20: {
    title: { 'zh-TW': '台北一座隧道裡，|機車的一氧化碳', en: 'In one Taipei tunnel: |scooters’ carbon monoxide' },
    subtitle: { 'zh-TW': '用統計方法推估的排放係數，兩種算法並排', en: 'Regression estimates of emission factors, two ways of counting side by side' },
    perKm: { 'zh-TW': '每公里（克）', en: 'Per kilometre (grams)' },
    perKg: { 'zh-TW': '每公斤燃料（公斤）', en: 'Per kilogram of fuel (kilograms)' },
    caption: {
      'zh-TW': '每公里的比較放在前面，因為它比較不會誇大。這是一座台北隧道，量的是行駛中的車流，不是停著等紅燈的車。同一座隧道的微粒，主要來自大型車。',
      en: 'The per-kilometre comparison comes first because it flatters the case less. One Taipei tunnel, moving traffic, not vehicles stopped at a light. The particles in the same tunnel came mainly from heavy vehicles.',
    },
  },
  v21: {
    title: { 'zh-TW': '二行程退場、標準加嚴之後：|機車的苯 {benzene}，油氣這類碳氫 {hc}', en: 'As two-strokes left the road and standards tightened: |scooter benzene {benzene}, fuel vapour and similar gases {hc}' },
    subtitle: { 'zh-TW': '推估的排放量（公噸／年），依車種，時間軸照實際年份畫', en: 'Estimated emissions (tonnes a year) by vehicle class, on a true time axis' },
    caption: {
      'zh-TW': '這是推估的排放量，不是量到的空氣。只有四個年度。交通排的苯，汽油車比機車多。',
      en: 'These are estimated emissions, not readings of the air, for four years only. Petrol cars emit more traffic benzene than scooters.',
    },
  },
  v22: {
    title: { 'zh-TW': '老車和新車', en: 'Older and newer scooters' },
    low: { 'zh-TW': '低里程', en: 'Low mileage' },
    high: { 'zh-TW': '高里程', en: 'High mileage' },
    caption: {
      'zh-TW': '這是實驗室裡的少數車，不是路上所有機車的平均。外框的長條，代表研究自己說：差別可能只是巧合（統計上不顯著）。',
      en: 'A small number of machines in a laboratory, not an average of the fleet on the road. An outlined bar means the study itself found the difference could be chance (not statistically significant).',
    },
  },
  casePanel: {
    label: { 'zh-TW': '三台車的個案', en: 'Three-scooter case study' },
    chartSub: { 'zh-TW': '第四期是第七期的幾倍（最多）', en: 'Phase 4 as a multiple of Phase 7 (up to)' },
    title: { 'zh-TW': '三台車的個案，|不是路上機車的平均', en: 'A case study of three scooters, |not a fleet average' },
    lead: {
      'zh-TW': '這個數字常被拿來說「老車髒很多倍」。它只來自三台車。所以我們把它放在這個框裡，不和其他證據混在一起，也不放在首頁。',
      en: 'This figure is often used to say older scooters are many times dirtier. It comes from three scooters, so we keep it in this panel, apart from the other evidence and off the home page.',
    },
  },
  v23: {
    title: { 'zh-TW': '定檢的排氣上限，|依出廠時間', en: 'Inspection limits |by build date' },
    subtitle: { 'zh-TW': '排氣管口的法定上限：一氧化碳（%）和沒燒完的油氣（碳氫化合物，ppm）', en: 'Legal limits at the tailpipe: carbon monoxide (%) and unburnt fuel vapour (hydrocarbons, ppm)' },
    caption: {
      'zh-TW': '這是排氣管口的法定上限，不是實際排放，也不是空氣裡有多少。',
      en: 'These are legal limits at the tailpipe, not actual emissions and not how much is in the air.',
    },
  },
  v24: {
    title: { 'zh-TW': '{total} 台被通知定檢的四行程機車', en: '{total} four-stroke scooters notified for inspection' },
    subtitle: { 'zh-TW': '每一格是一輛；空心的是沒有來的', en: 'One cell is one scooter; hollow cells did not come' },
    caption: { 'zh-TW': '沒有來的那些，排多少不在統計裡。', en: 'What the ones that did not come emit is not in the figures.' },
  },
  v25: {
    title: { 'zh-TW': '測站跟得上 PM2.5，|跟不上苯這一類', en: 'Stations track PM2.5, |not the benzene family' },
    subtitle: { 'zh-TW': '通勤的人身上的讀數，跟最近的測站跟得多緊。0 是完全跟不上，1 是完全跟得上。', en: 'Range of correlation between commuters’ readings and the nearest station (−1 to 1)' },
    zero: { 'zh-TW': '0：完全跟不上', en: '0: no relation' },
    one: { 'zh-TW': '1：完全跟得上', en: '1: perfect' },
    caption: { 'zh-TW': '量的是台北騎腳踏車和電動機車的通勤者，不是行人。', en: 'Commuters on bicycles and rented electric scooters in Taipei, not pedestrians.' },
  },
  v26: {
    title: { 'zh-TW': '離現場最近的三項量測', en: 'The three measurements closest to the scene' },
    subtitle: { 'zh-TW': '三項研究，三種方法，分開畫，不合併', en: 'Three studies, three methods, drawn apart and never merged' },
    a: { 'zh-TW': '（甲）PM2.5 與苯和它的同類（BTEX）：在車道上騎電動機車，和騎腳踏車走同一條路線', en: '(a) PM2.5 and the benzene family (BTEX): riding an electric scooter in the traffic lane, against cycling the same routes' },
    b: { 'zh-TW': '（乙）早上通勤的一小時，個人身上的 PM2.5', en: '(b) Personal PM2.5 over a morning commuting hour' },
    c: { 'zh-TW': '（丙）低價感測器：人行道上和停等紅燈的機車上', en: '(c) A low-cost sensor: on the sidewalk and on a scooter stopped at red lights' },
    diffLabel: { 'zh-TW': '和現場差在哪：', en: 'How this differs from the scene: ' },
    aDiff: { 'zh-TW': '量的是在車道上騎租來電動機車的研究助理，還有騎腳踏車的人。不是站在路口的行人。', en: 'Research assistants riding rented electric scooters in the traffic lane, and cyclists; not pedestrians standing at a crossing.' },
    bDiff: { 'zh-TW': '所有來源的 PM2.5，一小時的通勤，不是一個紅燈。', en: 'PM2.5 from all sources over an hour’s commute, not one red light.' },
    cDiff: { 'zh-TW': '感測器沒有校正，讀數可能偏高；人行道上查得出來源的最高讀數，來自廟宇的香和小吃攤。', en: 'The sensor was not calibrated and may read high; the highest sidewalk readings with a named source came from temple incense and food stalls.' },
    aTitle: { 'zh-TW': '苯和它的同類（BTEX）總和長條圖', en: 'Bar chart of total benzene family (BTEX)' },
    bTitle: { 'zh-TW': '各種通勤方式的 PM2.5 長條圖', en: 'Bar chart of PM2.5 by commuting mode' },
    cTitle: { 'zh-TW': 'PM2.5 中位數與範圍圖', en: 'Range plot of PM2.5 median and range' },
  },
  v9: {
    title: { 'zh-TW': '用 PM2.5 看，|路邊和別的地方差不多了', en: 'Judged by PM2.5, |the roadside now looks like everywhere else' },
    subtitle: { 'zh-TW': '台北交通測站和一般測站的 PM2.5 年平均（µg/m³）', en: 'Annual mean PM2.5 at Taipei’s traffic and general stations (µg/m³)' },
    caption: {
      'zh-TW': '這是測站，不是路口；PM2.5 也不是機車排得多的那一種污染。所以這把尺回答不了紅燈旁邊的問題。',
      en: 'These are stations, not crossings, and PM2.5 is not what scooters mainly emit. That is why this ruler cannot answer the red-light question.',
    },
  },
  v28: {
    title: { 'zh-TW': '致癌分類，|照實寫', en: 'Cancer classifications, |as they are' },
    subtitle: { 'zh-TW': '國際癌症研究機構的分類', en: 'International Agency for Research on Cancer classifications' },
    item: { 'zh-TW': '項目', en: 'Agent' },
    group: { 'zh-TW': '分類', en: 'Group' },
    benzene: { 'zh-TW': '苯', en: 'Benzene' },
    butadiene: { 'zh-TW': '1,3-丁二烯', en: '1,3-Butadiene' },
    formaldehyde: { 'zh-TW': '甲醛', en: 'Formaldehyde' },
    group1: { 'zh-TW': '第1類', en: 'Group 1' },
    outdoor: { 'zh-TW': '室外空氣污染與其中的懸浮微粒', en: 'Outdoor air pollution and its particulate matter' },
    diesel: { 'zh-TW': '柴油引擎廢氣', en: 'Diesel engine exhaust' },
    gasoline: { 'zh-TW': '汽油引擎廢氣', en: 'Petrol engine exhaust' },
    foot: { 'zh-TW': '分類講的是「會致癌」的證據有多強，不是吸多少才會，也不是一個紅燈的風險。', en: 'A classification says how strong the evidence is that something is carcinogenic, not how much it takes, and not the risk from one red light.' },
  },
  v13: {
    title: { 'zh-TW': '早上通勤，|三種方式', en: 'Morning commutes, |three ways to travel' },
    subtitle: { 'zh-TW': '台北通勤一小時，個人身上的 PM2.5 平均（µg/m³），所有來源', en: 'Personal PM2.5 over one Taipei morning commuting hour, mean (µg/m³), all sources' },
    caption: { 'zh-TW': '量的是不同的人、在三年裡不同的早上，不是同一個早上。PM2.5 是所有來源的，不是只算廢氣。騎機車和走路的人之間，差別可能只是巧合（統計上不顯著）。另一項台北研究的數字另外畫，不合併。', en: 'Different people on different mornings over three years, not one morning. PM2.5 from all sources, not exhaust alone. The difference between scooter riders and walkers could be chance (not statistically significant). Another Taipei study’s figures are drawn separately and never merged with these.' },
  },
  v29: {
    title: { 'zh-TW': '嬰兒車高度，|各國研究怎麼說', en: 'Stroller height: |what each study found' },
    subtitle: { 'zh-TW': '嬰兒車高度比大人呼吸高度多或少的百分比，一項研究一列', en: 'Per cent above or below adult breathing height, one study per row' },
    band: { 'zh-TW': '多數研究', en: 'Most studies' },
    zero: { 'zh-TW': '0 代表和大人的高度一樣', en: '0 means the same as adult height' },
    upTo: { 'zh-TW': '最多', en: 'up to' },
    over: { 'zh-TW': '超過', en: 'over' },
    noDiff: { 'zh-TW': '沒有一致的差別', en: 'no consistent difference' },
    foot: { 'zh-TW': '台灣：沒有任何一項', en: 'Taiwan: none' },
    caption: {
      'zh-TW': '各研究的污染物、高度和儀器都不一樣，不能合成一個數字。上小學的孩子，站得比嬰兒車高。對他們來說，確定的是呼吸比大人快。',
      en: 'The studies differ in pollutant, height and instrument, so they cannot be combined into one number. A school-age child stands above the stroller band; what is established for them is faster breathing.',
    },
  },
  v17: {
    title: { 'zh-TW': '往回走的那條線', en: 'The line heading the wrong way' },
    subtitle: { 'zh-TW': '新掛牌機車裡電動的比例（%），和淨零路徑的目標', en: 'Electric share of newly registered scooters (%), and the net-zero pathway targets' },
    caption: { 'zh-TW': '實際比例出自媒體轉述的官方統計；空心點是目標，不是預測。', en: 'Actual shares are official figures as reported in the media; hollow points are targets, not forecasts.' },
  },
  v32: {
    title: { 'zh-TW': '安靜的那條路', en: 'The quieter route' },
    subtitle: { 'zh-TW': '走巷弄小路，比走大馬路少多少（%，已扣掉街上本來就有的污染和風速的影響）', en: 'How much lower on the side-street route than the main road (%, adjusted for background and wind)' },
    caption: { 'zh-TW': '量的是騎車的通勤者，不是站著的行人。外框的長條：研究自己說，差別可能只是巧合（統計上不顯著）。', en: 'Commuters riding, not pedestrians standing. Outlined bars: the study itself found the difference could be chance (not statistically significant).' },
  },

  // Generic chart vocabulary
  chart: {
    category: { 'zh-TW': '項目', en: 'Item' },
    value: { 'zh-TW': '數值', en: 'Value' },
    note: { 'zh-TW': '註記', en: 'Notes' },
    estimate: { 'zh-TW': '研究推估的值', en: 'Study estimate' },
    ciLow: { 'zh-TW': '範圍最低', en: 'Range, low end' },
    ciHigh: { 'zh-TW': '範圍最高', en: 'Range, high end' },
    noChange: { 'zh-TW': '沒有差別', en: 'No difference' },
    ratioOne: { 'zh-TW': '1 = 沒有差別', en: '1 = no difference' },
    year: { 'zh-TW': '年', en: 'Year' },
    date: { 'zh-TW': '開始日期', en: 'Start date' },
    phase: { 'zh-TW': '第 {n} 期', en: 'Phase {n}' },
    download: { 'zh-TW': '下載這張圖的資料（CSV）', en: 'Download this chart’s data (CSV)' },
    more: { 'zh-TW': '這張圖沒有說什麼、資料和出處', en: 'What this chart does not show; data and sources' },
    sources: { 'zh-TW': '出處：', en: 'Sources:' },
    hollowNs: { 'zh-TW': '外框：差別不明顯，可能是碰巧', en: 'Outline: the difference may be down to chance' },
    hollowModel: { 'zh-TW': '外框：未通過模式效能檢核', en: 'Outline: failed the model-performance check' },
    filled: { 'zh-TW': '實心：研究報告的數值', en: 'Filled: the value as reported' },
    significant: { 'zh-TW': '＊ 研究算過：這個差別不是碰巧', en: '* the study checked: this difference is not down to chance' },
    sigFilled: { 'zh-TW': '實心：不太像是巧合（統計顯著）', en: 'Filled: beyond chance (statistically significant)' },
    sigHollow: { 'zh-TW': '空心：可能只是巧合（統計上不顯著）', en: 'Hollow: could be chance (not statistically significant)' },
    // '|' breaks the band label into two lines (the ppm band is narrow on a phone)
    ppb: { 'zh-TW': '十億分之幾|就聞得到', en: 'smelled at|parts per billion' },
    ppm: { 'zh-TW': '要到|百萬分之幾', en: 'needs parts|per million' },
    noSmell: { 'zh-TW': '沒有味道', en: 'no smell' },
    asTable: { 'zh-TW': '這組資料用表格呈現，因為數值相差太大，畫成同一張圖會誤導。', en: 'This dataset is shown as a table because its values differ too widely to draw honestly on one chart.' },
    reduction: { 'zh-TW': '降低的百分比', en: 'Reduction (%)' },
  },

  // V31 and the rest of #not-used (blueprint 4.5, section 6)
  notUsed: {
    title: { 'zh-TW': '常被引用、|但我們不這樣用的數字', en: 'Figures often quoted |that we do not use that way' },
    short: { 'zh-TW': '新聞裡常見的六個數字，原本的條件是什麼。', en: 'Six figures often seen in the news, and the conditions they came with.' },
    lead: {
      'zh-TW': '這幾個數字在新聞和網路上很常見。有的是真的，但只在很窄的條件下成立；有的根本不是那個意思。我們把它們拆開來放在這裡，附上原本的條件。',
      en: 'These figures turn up often in the news and online. Some are true, but only under narrow conditions; some do not mean what they are taken to mean. We take them apart here, with their conditions attached.',
    },
    quoted: { 'zh-TW': '常見的說法', en: 'As it is usually quoted' },
    actually: { 'zh-TW': '實際上', en: 'What it actually is' },
    weSay: { 'zh-TW': '我們怎麼說', en: 'What we say instead' },
    rowsTitle: { 'zh-TW': '證據', en: 'The evidence' },
    items: {
      scramble: {
        quote: { 'zh-TW': '「行人專用時相讓吸到的 PM2.5 少 {outlier}」', en: '“A pedestrian scramble cuts the PM2.5 people breathe by {outlier}”' },
        actually: {
          'zh-TW': '這是高雄一個路口、電腦推算的一天，報告自己標為特別高的值。同一個路口，報告文字給的範圍是降低{typical}，不算這一天。台北和新北的路口降得比較少。有一個推算日 PM2.5 反而上升，那一天沒有通過模式檢查。',
          en: 'It is a value worked out by computer for one day at one Kaohsiung junction, flagged by the report itself as an outlier. For that same junction the report’s text gives a fall of {typical}, leaving that day out. At the Taipei and New Taipei junctions the falls were smaller. On one computed day PM2.5 rose, and that day failed the model check.',
        },
        weSay: {
          'zh-TW': '運研所用電腦模式，推算高雄一個路口全天實施行人專用時相。報告文字寫，行人等候區 PM2.5 降低{typical}。這是電腦推算，不是在路口前後量的，也只是一個路口。',
          en: 'The Institute of Transportation modelled an all-day scramble phase at one Kaohsiung junction. The report’s text says PM2.5 at the pedestrian waiting area fell by {typical}. That is a computer result for one junction, not a before-and-after measurement.',
        },
        stripTitle: { 'zh-TW': '{outlier} 是怎麼來的', en: 'Where {outlier} comes from' },
        stripSub: { 'zh-TW': '高雄一個路口，模式裡行人等候區 PM2.5 降低的百分比，0 到 100%', en: 'One Kaohsiung junction: modelled fall in PM2.5 at the pedestrian waiting area, 0 to 100%' },
        stripTypical: { 'zh-TW': '報告第 4-28 頁給的範圍（不含離群的那一天）', en: 'The range the report gives on p.4-28 (outlier day left out)' },
        stripOutlier: { 'zh-TW': '高雄一個路口、電腦推算的一天，報告自己標為特別高', en: 'One Kaohsiung junction, one computed day, flagged by the report as an outlier' },
        stripCaption: { 'zh-TW': '這是電腦推算，不是量測，也不是只看機車的結果。', en: 'A simulation, not a measurement, and not a result about scooters in particular.' },
      },
      neverSmokers: {
        quote: { 'zh-TW': '「肺癌病人有 {share} 不吸菸，所以是空污害的」', en: '“{share} of lung cancer patients never smoked, so it must be air pollution”' },
        actually: {
          'zh-TW': '比例出自一項台灣研究，是真的。但不吸菸者得肺癌的原因，還沒有確定；這個數字也和機車無關。另一項研究看到的「有關」，算的是所有來源的 PM2.5。',
          en: 'The share is from one Taiwanese study, and it is true. But the cause of lung cancer in never-smokers is not established, and the figure says nothing about scooters. The association another study found is with PM2.5 from all sources.',
        },
        weSay: { 'zh-TW': '我們不在首頁和問題頁用這幾個數字。它們只放在這裡，附上全部的條件。', en: 'We do not use these figures on the home page or the question pages. They appear only here, with all their conditions.' },
      },
      density: {
        quote: { 'zh-TW': '「台灣機車密度全世界最高」', en: '“Taiwan has the most scooters per person in the world”' },
        actually: {
          'zh-TW': '有一份非官方的區域排名，把台灣排第一。但它只比第二名多一點點，資料來源和年份也不清楚。',
          en: 'One unofficial regional ranking puts Taiwan first, but only just ahead of second place, with unclear data and no stated year.',
        },
        weSay: { 'zh-TW': '「名列前茅」。', en: '“Among the highest.”' },
      },
      caseStudy: {
        quote: { 'zh-TW': '「老車比新車髒十幾、三十幾倍」', en: '“Older scooters are tens of times dirtier than new ones”' },
        actually: {
          'zh-TW': '這兩個倍數來自只有三台車的個案研究，不是路上所有機車的平均。',
          en: 'Those multiples come from a case study of only three scooters, not an average of the fleet.',
        },
        weSay: {
          'zh-TW': '我們用測了幾十輛車的研究：舊期別和高里程的機車，每公升燃料排得比較多。三台車的個案，只放在第 1 環它自己的框裡。',
          en: 'We use studies that tested dozens of scooters: older-phase and high-mileage scooters emit more per litre of fuel. The three-scooter case study appears only in its own panel in link 1.',
        },
        go: { 'zh-TW': '看三台車的個案', en: 'See the three-scooter case study' },
      },
      idling: {
        quote: { 'zh-TW': '「機車在等紅燈的時候排最多」', en: '“Scooters emit the most while they wait at the light”' },
        actually: {
          'zh-TW': '國外的路口研究看到的微粒高峰，多半在車子起步的時候；量的也多半是汽車和柴油車。台灣唯一一筆機車的怠速微粒資料，怠速時反而略低於行駛時。機車起步那一陣有多大，台灣沒有公開的數字。',
          en: 'Junction studies abroad mostly find particle peaks as vehicles pull away, and they mostly measured cars and diesels. Taiwan’s only idle particle datum for a scooter was slightly lower at idle than when moving. Taiwan has no published figure for the burst as a scooter pulls away.',
        },
        weSay: { 'zh-TW': '等的時候和起步的那一陣都算。本站的推估只算等紅燈的 90 秒，起步那一陣不印倍數。', en: 'The wait and the pull-away both count. This site’s estimate covers only the 90 seconds of red, and prints no multiplier for the pull-away.' },
      },
      target2035: {
        quote: { 'zh-TW': '「2035 年機車全面電動」', en: '“All new scooters electric by 2035”' },
        actually: {
          'zh-TW': '淨零路徑的目標，是 {y1} 年電動占新車的 {t1}，{y2} 年 {t2}。這是市售比的目標，不是禁售燃油機車。',
          en: 'The net-zero pathway targets an electric share of new sales of {t1} in {y1} and {t2} in {y2}. These are sales targets, not a ban on petrol scooters.',
        },
        weSay: { 'zh-TW': '我們照目標的原樣寫，並且說它是目標，不是預測。', en: 'We give the targets as they are, and call them targets, not forecasts.' },
      },
    },
  },

  // What we will not say (brief 4.6 and 12.2), each with what we say instead; then what would
  // change our mind.
  notClaimed: {
    title: { 'zh-TW': '我們不會說的話', en: 'What we will not say' },
    short: { 'zh-TW': '每一句說得太過頭的話，和我們改說的話。', en: 'Each claim that goes too far, and what we say instead.' },
    lead: {
      'zh-TW': '下面這些話，網站上不會出現。每一句後面寫著我們說的是什麼。每次更新網站，電腦都會拿網站上的每一段文字，自動比對這些規則。',
      en: 'None of these sentences appears on the site. Each is followed by what we say instead. Every piece of copy on the site is checked against these rules automatically when the site is built.',
    },
    // Brief 4.6, right-hand column: what never appears, and what we say instead.
    items: [
      {
        no: { 'zh-TW': '等一個紅燈就會生病。', en: 'That one red light makes you ill.' },
        instead: { 'zh-TW': '長年吸車子的廢氣，和氣喘、心臟病、肺癌有關；講的是好幾年，不是一個紅燈。', en: 'Years of breathing traffic exhaust are linked to asthma, heart disease and lung cancer: years, not one red light.' },
      },
      {
        no: { 'zh-TW': '機車廢氣是第1類致癌物。', en: 'That scooter exhaust is a Group 1 carcinogen.' },
        instead: { 'zh-TW': '汽油引擎廢氣整體是第2B類（「可能致癌」）；廢氣裡的苯是第1類（「確定會讓人致癌」）。分類說的是證據有多強，不是風險。', en: 'Petrol-engine exhaust as a whole is Group 2B, ‘possibly causes cancer’; the benzene in it is Group 1, ‘causes cancer in humans’. The groups describe the strength of the evidence, not a risk.' },
      },
      {
        no: { 'zh-TW': '機車是 PM2.5 的主要來源。', en: 'That scooters are a main source of PM2.5.' },
        instead: { 'zh-TW': '論排放量，機車排的 PM2.5 很少，油氣和一氧化碳很多。', en: 'By emissions, scooters put out little PM2.5 and a lot of fuel vapour and carbon monoxide.' },
      },
      {
        no: { 'zh-TW': '味道越重，傷害越大。', en: 'That a stronger smell means more harm.' },
        instead: { 'zh-TW': '聞到味道，代表你站在廢氣裡；一氧化碳沒有味道。', en: 'A smell tells you that you are standing in exhaust; carbon monoxide has no smell.' },
      },
      {
        no: { 'zh-TW': '用「街上原本的幾倍」當標題或大數字。', en: 'A multiple of what the street already holds, as a headline or a big figure.' },
        instead: { 'zh-TW': '把「街上原本就有的」和「這排機車多出來的」分成兩行，各自標明。', en: '“Already in the street” and “added by these scooters” on two lines, each labelled.' },
      },
      {
        no: { 'zh-TW': '拿比較長時間的空氣品質標準，或空氣品質指標的顏色，來比 90 秒。', en: 'Standards for longer averaging times, or air-quality-index colours, set against 90 seconds.' },
        instead: { 'zh-TW': '只拿平均時間一樣的來比：90 秒的量要先換算成 15 分鐘的平均；「低很多」只用在等一個紅燈。', en: 'Only like with like: a 90-second level is first converted to a 15-minute average; “far below” is used only for one red light.' },
      },
      {
        no: { 'zh-TW': '拿吸菸、得到癌症的可能或毒性，來比等一個紅燈。', en: 'Comparing one red light with smoking, a chance of cancer or poisoning.' },
        instead: { 'zh-TW': '一個紅燈的量很小，可是天天都要等；整天在路邊工作的人，加起來就像一直待在路邊。', en: 'One red light is a small amount, but it comes every day; for people who work at the kerb all day, it adds up to always being at the roadside.' },
      },
      {
        no: { 'zh-TW': '紅燈等得越久，廢氣就一路往上加。', en: 'That exhaust keeps building up the longer the red lasts.' },
        instead: { 'zh-TW': '本站的推估是 90 秒的平均；電腦算的一個紅燈，另外寫出一秒一秒的一陣一陣，但不畫成越來越多的曲線。綠燈起步那一陣也不印倍數。', en: 'Our estimate is a 90-second average; the simulated red light adds the second-by-second bursts but draws no rising curve. No multiplier for the pull-away.' },
      },
      {
        no: { 'zh-TW': '離機車遠幾步，就少吸一個固定的比例。', en: 'That stepping back a few paces cuts what you breathe by a fixed share.' },
        instead: { 'zh-TW': '離機車遠一點，通常比較淡；差多少要看風，所以不印數字。', en: 'Further from the scooters is usually thinner; how much depends on the wind, so we print no figure.' },
      },
      {
        no: { 'zh-TW': '國外量到的小孩高度倍數，或說每種風都一樣。', en: 'A child-height multiple measured abroad, or one said to hold in every wind.' },
        instead: { 'zh-TW': '推估：風從機車吹來時，嬰兒車高度和大人鼻子差不多到兩倍；不是每種風都這樣。照體重算，小孩吸進的空氣是大人的 1.5 到 2 倍。', en: 'Estimate: with the wind from the scooters, pushchair height gets between about the same as an adult’s nose and about twice as much; not in every wind. For their weight, children breathe 1.5 to 2 times the air an adult does.' },
      },
      {
        no: { 'zh-TW': '這排機車排出多少顆超細微粒。', en: 'A count of the ultrafine particles the pack gives off.' },
        instead: { 'zh-TW': '超細微粒不在推估裡，原因寫在「怎麼算的」那一頁。', en: 'Ultrafine particles are not in the estimate; the reason is on the “How we worked it out” page.' },
      },
      {
        no: { 'zh-TW': '所有廢氣都和一氧化碳一起變多。', en: 'That every pollutant rises when carbon monoxide does.' },
        instead: { 'zh-TW': '一氧化碳多的地方，剛排出來的油氣和苯也多；PM2.5 幾乎不變。', en: 'Where there is more carbon monoxide there is more fresh fuel vapour and benzene; PM2.5 barely changes.' },
      },
      {
        no: { 'zh-TW': '騎車的人吸到的比誰都多。', en: 'That riders breathe more than anyone.' },
        instead: { 'zh-TW': '台北量過：騎機車和走路的人，PM2.5 平均都比搭捷運的多；騎車和走路的差別不明顯。', en: 'Measured in Taipei: people on scooters and on foot both breathed more PM2.5 than metro riders, on average. The gap between the two could be chance.' },
      },
      {
        no: { 'zh-TW': '台灣的路口沒有任何一氧化碳或 PM2.5 的量測。', en: 'That Taiwanese crossings have no carbon monoxide or PM2.5 readings at all.' },
        instead: { 'zh-TW': '運研所在 10 個路口的行人等候區量過；本站把它們放在推估旁邊。', en: 'The Institute of Transportation measured the waiting areas at 10 junctions; we show its readings beside our estimate.' },
      },
      {
        no: { 'zh-TW': '口罩沒有用，或活性碳口罩擋得了廢氣。', en: 'That masks are useless, or that an activated-carbon mask stops exhaust.' },
        instead: { 'zh-TW': '一般口罩擋不住廢氣裡的氣體；口罩防感冒、流感還是有用。', en: 'Ordinary masks do not stop the gases in exhaust; a mask still helps against colds and flu.' },
      },
    ],
    noLabel: { 'zh-TW': '我們不說', en: 'We do not say' },
    insteadLabel: { 'zh-TW': '我們說', en: 'We say' },
    changeMindTitle: { 'zh-TW': '什麼會讓我們改口', en: 'What would change our mind' },
    changeMindLead: {
      'zh-TW': '下面任何一項有了新的量測，我們就會照著改。舊的版本會留在修改紀錄裡：',
      en: 'A new measurement of any of these would change what we say, and the old version would stay in the corrections log:',
    },
    changeMind: [
      { 'zh-TW': '紅燈時，在路口站在機車旁邊，實際量到的一氧化碳、苯和超細微粒。', en: 'Carbon monoxide, benzene and ultrafine particles measured beside the scooters at a junction during a red light.' },
      { 'zh-TW': '台灣的機車停著、引擎沒熄火時，每小時實際燒多少汽油、排多少苯。', en: 'How much petrol Taiwanese scooters actually burn standing with engines running, and how much benzene they give off.' },
      { 'zh-TW': '小孩和嬰兒車高度的量測。', en: 'Measurements at a child’s and a pushchair’s height.' },
      { 'zh-TW': '把機車廢氣單獨分出來的健康研究。', en: 'A health study that separates scooter exhaust from other traffic.' },
    ],
  },

  // The former gap list, now answers (brief 7.3): each answer sits under its link; all of them
  // together are on /estimate/#answers. The anchor #gaps stays for old links.
  answers: {
    title: { 'zh-TW': '常被問的問題', en: 'Questions people often ask' },
    short: { 'zh-TW': '{n} 個常見問題，一題一題列出來。', en: '{n} common questions, listed one by one.' },
    lead: {
      'zh-TW': '常被問的 {n} 個問題，答案放在它所屬的那一環；要一次看全部，請到「怎麼算的」那一頁。',
      en: '{n} questions people often ask, each answered under its link; to see them all together, go to the “How we worked it out” page.',
    },
    all: { 'zh-TW': '一次看全部 {n} 個答案', en: 'See all {n} answers together' },
  },

  // Link 3 is whole: the institute's readings, then the site's estimate beside the scooters (brief 7.3)
  link3: {
    estLead: {
      'zh-TW': '運研所量的是行人等候區一整天的空氣。紅燈時站在一排機車旁邊，多吸到多少，是本站算的：',
      en: 'The Institute of Transportation measured the air in the waiting areas over whole days. How much more a person standing beside a row of scooters breathes at a red light is worked out by this site:',
    },
    estMore: { 'zh-TW': '看完整的算法', en: 'See the full working' },
    masksTitle: { 'zh-TW': '口罩擋得住嗎', en: 'Does a mask stop it?' },
    masks: {
      'zh-TW': '一般口罩擋不住一氧化碳和油氣這些氣體，微粒也會從口罩邊緣漏進去。口罩防感冒、流感還是有用。',
      en: 'Ordinary masks do not stop gases such as carbon monoxide and fuel vapour, and particles leak in round the edges. A mask still helps against colds and flu.',
    },
    masksLink: { 'zh-TW': '口罩擋得住廢氣嗎', en: 'Does a mask stop exhaust?' },
  },

  studies: {
    title: { 'zh-TW': '讀過全文的研究', en: 'The studies we read in full' },
    lead: {
      'zh-TW': '這幾篇論文，我們讀了全文，並且逐頁核對了網站用到的每一個數字。其他來源讀到哪裡，資料來源頁上每一筆都有寫。',
      en: 'For these papers we read the full text and checked every figure the site uses against the page. How far we got into every other source is stated on its entry on the sources page.',
    },
    open: { 'zh-TW': '看這 {n} 篇研究', en: 'See these {n} studies' },
    short: { 'zh-TW': '我們讀完全文、一頁一頁核對過的 {n} 篇。', en: 'The {n} we read in full and checked page by page.' },
    uses: { 'zh-TW': '網站用到的 {n} 項', en: 'Used on the site ({n})' },
    entry: { 'zh-TW': '資料來源頁的這一筆', en: 'Its entry on the sources page' },
  },

  method: {
    title: { 'zh-TW': '怎麼查證的', en: 'How we checked' },
    short: { 'zh-TW': '數字從哪裡來、怎麼核對、發現錯誤怎麼改。', en: 'Where the numbers come from, how we checked them, and how we fix mistakes.' },
    badges: { 'zh-TW': '證據的細分類', en: 'The finer kinds of evidence' },
    body: [
      {
        'zh-TW': '網站上每一個數字，都來自本站的同一份資料。每一筆都記著出處、原文在哪一頁或哪一段、證據的種類。還有一定要一起說的限制。頁面上的數字，是從這份資料直接帶進來的；資料改了，頁面就跟著改。本站自己的推估，也一樣從同一份結果帶進來。',
        en: 'Every number on the site comes from one set of our data. Each entry records its source, where in the source it appears, what kind of evidence it is, and the limitation that must go with it. Pages take their numbers straight from that data, so a correction there corrects every page. Our own estimate reaches every page the same way, from one set of results.',
      },
      {
        'zh-TW': '這個網站的研究和查核，大部分是用 AI 研究工具做的。第二輪再重新打開同一批文件，一筆一筆核對。查不到原文、只在轉述中看到的，標「只在轉述中看到」。標示為未查證的，一律不收進來。',
        en: 'Most of the research and checking for this site was done with AI research tools, followed by a second round that reopened the same documents and checked each entry. Anything we could reach only through a report of it is tagged “secondary”. Anything marked unverified is left out.',
      },
      {
        'zh-TW': '每次更新網站，電腦都會拿每一段文字，自動比對一份「我們不會說的話」的規則。規則抓到的句子要改寫，或寫明為什麼沒有違反規則。',
        en: 'Every piece of copy is checked automatically at build time against the rules of what we will not say. A sentence a rule catches is either rewritten or kept with a recorded reason why it does not break the rule.',
      },
    ],
    readLevels: { 'zh-TW': '來源讀到哪裡', en: 'How far we read each source' },
    readCount: { 'zh-TW': '{n} 個', en: '{n}' },
    wrong: { 'zh-TW': '發現我們講錯了？告訴我們。我們會改，並且留下修改紀錄。', en: 'Found something we got wrong? Tell us. We will fix it and keep a record of the change.' },
    corrections: { 'zh-TW': '修改紀錄', en: 'Corrections log' },
    contact: { 'zh-TW': '關於這個網站、怎麼聯絡我們', en: 'About the site, and how to reach us' },
  },

  cta: {
    title: { 'zh-TW': '接下來', en: 'From here' },
    estimate: { 'zh-TW': '怎麼算的', en: 'How we worked it out' },
    estimateBody: { 'zh-TW': '機車旁邊多了多少廢氣：推估、算法、出處，和量到的對照。', en: 'What the scooters add beside you: the estimate, the working, the sources, and the check against readings.' },
    sources: { 'zh-TW': '看每一筆出處', en: 'See every source' },
    sourcesBody: { 'zh-TW': '每一個來源的完整書目、連結，以及我們讀到哪裡。', en: 'Every source’s full reference, its link, and how far we read it.' },
    questions: { 'zh-TW': '路口的問題', en: 'Questions at the crossing' },
    questionsBody: { 'zh-TW': '用讀者自己的話問的問題，一題一頁。', en: 'Questions in readers’ own words, one page each.' },
  },

  /** #smell-chemicals: the smell-chemicals step's facts, in three lists that never mix seconds-long and 30-minute / 1-hour values. */
  smellChem: {
    title: { 'zh-TW': '聞得到的時候，空氣裡還有什麼（推估）', en: 'When you can smell it, what else is in the air (estimate)' },
    lead: { 'zh-TW': '本站用電腦算的推估，不是實測；數字都有範圍，是機車另外加進空氣裡的量。', en: 'Our own computer estimate, not a measurement; every number has a range and is what the scooters add to the air.' },
    what: { 'zh-TW': '跟著味道來的，和那個味道是什麼', en: 'What comes with the smell, and what the smell is' },
    seconds: { 'zh-TW': '幾秒鐘的量（不和平均值放在一起）', en: 'Seconds-long levels (never beside an average)' },
    averages: { 'zh-TW': '30 分鐘或 1 小時的平均', en: '30-minute or 1-hour averages' },
    estimate: { 'zh-TW': '數字、範圍和詳細表', en: 'The numbers, ranges and detail table' },
    method: { 'zh-TW': '方法（研究檔案，英文）', en: 'The method (research file)' },
  },
  context: {
    title: { 'zh-TW': '鏈外的背景資料', en: 'Background outside the chain' },
    lead: { 'zh-TW': '這幾項不屬於任何一環，是誰騎車、騎去哪裡這類背景。', en: 'These belong to no link of the chain; they are background, such as who rides and where to.' },
  },
});
