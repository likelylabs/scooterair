// Copy for /evidence/ (blueprint 4.5): the chain, link by link. Every number on the page comes
// from the registry and is filled into {tokens} at render time; nothing numeric is typed here.
// Headlines are the home page's (blueprint 3.3–3.11), verbatim. See ./_copy.ts.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '證據鏈，一環一環看', en: 'The chain, link by link' },
    description: {
      'zh-TW': '機車廢氣和路口行人之間的每一環：誰量了什麼、量到多少、證據是哪一種、這項研究沒有說什麼，以及還沒有人量過的地方。',
      en: 'Every link between scooter exhaust and the people at the crossing: who measured what, what they found, what kind of evidence it is, what each study does not show, and what nobody has measured yet.',
    },
  },

  head: {
    kicker: { 'zh-TW': '證據', en: 'Evidence' },
    title: { 'zh-TW': '證據鏈，|一環一環看', en: 'The chain, |link by link' },
    lead: {
      'zh-TW': '這一頁給想查證的人。網站上每一句話背後的研究都在這裡：誰做的、怎麼做的、證據是哪一種，還有這項研究沒有說什麼。比較強的證據放前面。沒有人量過的地方，也照樣列出來。',
      en: 'This page is for anyone who wants to check our work. Behind every sentence on the site is a study listed here: who did it, how, what kind of evidence it is, and what it does not show. The strongest evidence comes first. Where nobody has measured something, that is listed too.',
    },
    counts: {
      'zh-TW': '目前收錄 {facts} 項有出處的事實、{series} 組圖表資料、{gaps} 個沒人量過的空白，來自 {sources} 個來源。',
      en: 'It currently holds {facts} sourced facts, {series} chart datasets and {gaps} recorded gaps, drawn from {sources} sources.',
    },
    tocLabel: { 'zh-TW': '這一頁有什麼', en: 'On this page' },
  },

  toc: {
    chain: { 'zh-TW': '七環一覽', en: 'The seven links' },
    map: { 'zh-TW': '證據地圖', en: 'Evidence map' },
    studies: { 'zh-TW': '讀過全文的研究', en: 'Studies read in full' },
    gaps: { 'zh-TW': '還沒有人量過的事', en: 'What nobody has measured' },
    notClaimed: { 'zh-TW': '我們不會說的話', en: 'What we will not say' },
    notUsed: { 'zh-TW': '我們不這樣用的數字', en: 'Figures we do not use that way' },
    method: { 'zh-TW': '怎麼查證的', en: 'How we checked' },
    linkN: { 'zh-TW': '第 {n} 環', en: 'Link {n}' },
  },

  howTo: {
    title: { 'zh-TW': '怎麼讀這一頁', en: 'How to read this page' },
    body: {
      'zh-TW': '每一環先放圖，再放一張證據表。表上每一列有五欄：我們說什麼、數字、誰做的和怎麼做的、證據類型，以及這項研究沒有說什麼。每一列都有自己的連結，可以直接分享。',
      en: 'Each link opens with its charts, then a table of evidence. Every row has five columns: what we say, the number, who did it and how, the kind of evidence, and what the study does not show. Every row has its own link you can share.',
    },
  },

  columns: {
    say: { 'zh-TW': '我們說什麼', en: 'What we say' },
    number: { 'zh-TW': '數字', en: 'The number' },
    who: { 'zh-TW': '誰做的、怎麼做的', en: 'Who did it, and how' },
    kind: { 'zh-TW': '證據類型', en: 'Kind of evidence' },
    notShow: { 'zh-TW': '這項研究沒有說什麼', en: 'What this does not show' },
  },

  row: {
    permalink: { 'zh-TW': '這一列的連結', en: 'Link to this row' },
    readAs: { 'zh-TW': '我們讀到：', en: 'How we read it:' },
    when: { 'zh-TW': '時間：', en: 'When:' },
    where: { 'zh-TW': '地點：', en: 'Where:' },
    mustRead: { 'zh-TW': '要和數字一起看', en: 'Read with the number' },
    // shown only when the registry records no limitation for a fact: what is true of every
    // fact of that evidence type, and nothing more
    noCaveat: {
      'measured-tw': { 'zh-TW': '登錄表沒有為這一項另外寫下限制；請看原始研究的說明。', en: 'The registry records no further limitation for this item; see the original study.' },
      'official-tw': { 'zh-TW': '這是官方的統計、標準或規定，不是在路口量到的空氣。', en: 'This is an official statistic, standard or rule, not a measurement of the air at a crossing.' },
      'modelled-tw': { 'zh-TW': '這是模式推估，不是量測。', en: 'This is a model estimate, not a measurement.' },
      international: { 'zh-TW': '這是台灣以外的證據，或國際機構的說法；不是在台灣的路口量的。', en: 'This is evidence from outside Taiwan, or an international body’s statement; it was not measured at a Taiwanese crossing.' },
      derived: { 'zh-TW': '這是本站用引用的數字算出來的，不是新的量測。', en: 'This is our arithmetic on cited figures, not a new measurement.' },
      'market-tw': { 'zh-TW': '這是業者公布的價格或條件，會變動；下單前請再看一次。', en: 'These are published prices or terms, and they change; check again before you buy.' },
    },
    more: { 'zh-TW': '再看第 {n} 環其餘 {count} 項證據', en: 'Show the rest of link {n} ({count})' },
    moreData: { 'zh-TW': '第 {n} 環的其他 {count} 組圖表資料', en: 'More chart data for link {n} ({count})' },
    alsoTitle: { 'zh-TW': '也用在這一環的證據', en: 'Also used in this link' },
    alsoLead: { 'zh-TW': '這幾項的完整一列放在別的地方。', en: 'The full row for each of these is elsewhere on the page.' },
    alsoIn: { 'zh-TW': '完整的一列在第 {n} 環', en: 'Full row in link {n}' },
    alsoNotUsed: { 'zh-TW': '完整的一列在「我們不這樣用的數字」', en: 'Full row under “figures we do not use that way”' },
    alsoCase: { 'zh-TW': '完整的一列在下面「三台車的個案」框裡', en: 'Full row in the “three-scooter case study” panel below' },
    rows: { 'zh-TW': '{count} 項', en: '{count}' },
    withheld: {
      'zh-TW': '這一列暫時撤下。登錄表寫的是「2027 年未公布」，但環境部已經預告一項草案；正確的說法是「2027 年還沒有一項定案」。資料更正之後會放回來。',
      en: 'This row is withdrawn for now. The registry says nothing has been announced for 2027, but the environment ministry has pre-announced a draft; the accurate wording is that nothing is confirmed for 2027. It will return once the entry is corrected.',
    },
    withheldLabel: { 'zh-TW': '撤下更正中', en: 'Withdrawn for correction' },
  },

  chain: {
    title: { 'zh-TW': '七環一覽', en: 'The seven links at a glance' },
    lead: {
      'zh-TW': '網站的論證是一條七環的鏈。下面每一環寫的是首頁懶人包的那一句，標記是那一環主要證據的類型。第 3 環是斷開的：沒有人量過。',
      en: 'The site’s argument is a chain of seven links. Each line below is the sentence from the home page’s 30-second version, with the kind of evidence behind it. Link 3 is broken: nobody has measured it.',
    },
    counts: { 'zh-TW': '{facts} 項事實 · {series} 組圖表資料 · {gaps} 個空白', en: 'Facts: {facts} · Chart datasets: {series} · Gaps: {gaps}' },
    see: { 'zh-TW': '看第 {n} 環的證據', en: 'See the evidence for link {n}' },
  },

  map: {
    title: { 'zh-TW': '證據地圖', en: 'The evidence map' },
    lead: {
      'zh-TW': '每一列是一環，每一欄是一種證據。格子裡是那一環用到的來源；空的格子就是空的。第 3 環「路口行人」那一格用虛線框起來：那是整條鏈上沒有人量過的地方。',
      en: 'Each row is a link; each column is a kind of evidence. A cell lists the sources that link uses; an empty cell stays empty. The “pedestrians at the crossing” cell of link 3 is outlined in dashes: it is the place on the chain nobody has measured.',
    },
    gapColumn: { 'zh-TW': '沒人量過', en: 'Not measured' },
    linkColumn: { 'zh-TW': '環', en: 'Link' },
    pedestrians: { 'zh-TW': '路口行人', en: 'Pedestrians at the crossing' },
    sourcesN: { 'zh-TW': '{n} 個來源', en: '{n} sources' },
    none: { 'zh-TW': '無', en: 'None' },
    caption: {
      'zh-TW': '同一個來源可能出現在好幾格。數字是來源的編號，點了會到資料來源頁的那一筆。',
      en: 'A source can appear in several cells. The numbers are the sources’ numbers; each one goes to its entry on the sources page.',
    },
  },

  // The headline of each link is the home page's (blueprint 3.3–3.11), verbatim.
  links: [
    { title: { 'zh-TW': '粉塵很少，|油氣很多', en: 'Little dust. |A lot of fumes.' } },
    { title: { 'zh-TW': '排氣管離地不到一公尺。|標線規則只要求留 {cm} 公分', en: 'The tailpipe is under a metre off the ground. |The marking rules ask for {cm} cm.' } },
    { title: { 'zh-TW': '這一格，|沒有人量過', en: 'This box is empty. |Nobody has measured it.' } },
    { title: { 'zh-TW': '鼻子是警報器，|不是測量儀', en: 'Your nose is an alarm, |not a gauge.' } },
    { title: { 'zh-TW': '沒有人能說，|一個紅燈會讓你生病', en: 'Nobody can say |one red light makes you ill.' } },
    {
      title: { 'zh-TW': '同一個紅燈，|不一樣的位置', en: 'Same red light. |Different places in it.' },
      // the registry still phrases link 6 as a question of dose; dose is what nobody has measured (blueprint 3.8)
      question: { 'zh-TW': '誰離排氣管最近？誰最容易受影響？', en: 'Who is closest to the tailpipes, and who is most susceptible?' },
    },
    { title: { 'zh-TW': '同一個路口，|沒有排氣管', en: 'Same crossing. |No tailpipes.' } },
  ],

  link: {
    question: { 'zh-TW': '這一環問的是：', en: 'This link asks:' },
    counts: { 'zh-TW': '這一環：{facts} 項事實、{series} 組圖表資料、{gaps} 個沒人量過的空白。', en: 'In this link — facts: {facts}; chart datasets: {series}; recorded gaps: {gaps}.' },
    visuals: { 'zh-TW': '圖表', en: 'Charts' },
    table: { 'zh-TW': '證據表，比較強的放前面', en: 'The evidence, strongest first' },
    gaps: { 'zh-TW': '這一環沒有人量過的事', en: 'What nobody has measured in this link' },
    next: { 'zh-TW': '下一環', en: 'Next link' },
    top: { 'zh-TW': '回到七環一覽', en: 'Back to the seven links' },
  },

  // Link 5: the review first, and the ruler stated once, plainly (R2).
  link5: {
    leadTitle: { 'zh-TW': '最有份量的證據先放', en: 'The weightiest evidence first' },
    lead: {
      'zh-TW': '這一環最有份量的，是一份整理了 {studies} 項研究的國際回顧。它看的是長年暴露在車流廢氣裡的人，不是等一個紅燈的人。',
      en: 'The weightiest evidence in this link is an international review of {studies} studies. It looked at people exposed to traffic exhaust for years, not at people waiting through one red light.',
    },
    rulerLabel: { 'zh-TW': '注意這把尺', en: 'Mind the ruler' },
    ruler: {
      'zh-TW': '這一環的健康研究，量的都是整體車流，或所有來源的 PM2.5，也就是第 1 環說機車占很少的那一種污染。沒有任何一項把機車廢氣單獨分出來。研究看到的是「有關」，不是「造成」。這兩個詞差很多，我們不會混著用。',
      en: 'Every health study in this link measured traffic as a whole, or PM2.5 from all sources: the kind of pollution Link 1 said scooters make little of. Not one isolates scooter exhaust. And what they show is association, not cause. The two words are far apart, and we will not mix them.',
    },
  },

  // Featured charts, blueprint Part 5. Titles say what the chart shows; numbers are filled in.
  v5: {
    title: { 'zh-TW': '論排放量：|粉塵很少，油氣很多', en: 'By emissions: |little dust, a lot of fumes' },
    subtitle: { 'zh-TW': '燃油機車占全台灣排放量的比例，每一條都是 0 到 100%', en: 'Gasoline scooters’ share of Taiwan’s emissions; each bar runs from 0 to 100%' },
    caption: {
      'zh-TW': '這是「排放量」的占比，不是你吸進去的比例；排得多，不代表每個路口都濃。',
      en: 'These are shares of emissions, not of what you breathe; a large output does not mean thick air at every crossing.',
    },
    chartTitle: { 'zh-TW': '燃油機車排放量占比的長條圖，每一條從 0 到 100%', en: 'Bar chart of gasoline scooters’ emission shares, each from 0 to 100%' },
    desc: {
      'zh-TW': '每一種污染物一條，從 0 到 100%。PM2.5 和 PM10 的機車段很細，一氧化碳和碳氫化合物的機車段比較寬，沒有一條過半。',
      en: 'One bar per pollutant, from 0 to 100%. The scooter segment is a sliver for PM2.5 and PM10, wider for carbon monoxide and hydrocarbons, and nowhere a majority.',
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
    subtitle: { 'zh-TW': '迴歸估計的排放係數，兩種算法並排', en: 'Regression estimates of emission factors, two ways of counting side by side' },
    perKm: { 'zh-TW': '每公里（克）', en: 'Per kilometre (grams)' },
    perKg: { 'zh-TW': '每公斤燃料（公斤）', en: 'Per kilogram of fuel (kilograms)' },
    caption: {
      'zh-TW': '每公里的比較放在前面，因為它比較不會誇大。一座台北隧道，量的是行駛中的車流，不是停著等紅燈的車；同一座隧道的粉塵主要來自大型車。',
      en: 'The per-kilometre comparison comes first because it flatters the case less. One Taipei tunnel, moving traffic, not vehicles stopped at a light; the dust in the same tunnel came mainly from heavy vehicles.',
    },
  },
  v21: {
    title: { 'zh-TW': '二行程退場之後：|機車的苯 {benzene}，碳氫化合物 {hc}', en: 'As two-strokes left the road: |scooter benzene {benzene}, hydrocarbons {hc}' },
    subtitle: { 'zh-TW': '推估的排放量（公噸／年），依車種，時間軸照實際年份畫', en: 'Estimated emissions (tonnes a year) by vehicle class, on a true time axis' },
    caption: {
      'zh-TW': '這是推估的排放量，不是量到的空氣。只有四個年度。交通排的苯，汽油車比機車多。',
      en: 'These are estimated emissions, not measured air, for four years only. Gasoline cars emit more traffic benzene than scooters.',
    },
  },
  v22: {
    title: { 'zh-TW': '老車和新車', en: 'Older and newer scooters' },
    low: { 'zh-TW': '低里程', en: 'Low mileage' },
    high: { 'zh-TW': '高里程', en: 'High mileage' },
    caption: {
      'zh-TW': '這是實驗室裡的少數車，不是路上車隊的平均。外框的長條，代表研究自己說差別在統計上不顯著。',
      en: 'A small number of machines in a laboratory, not an average of the fleet on the road. An outlined bar means the study itself found the difference not statistically significant.',
    },
  },
  casePanel: {
    label: { 'zh-TW': '三台車的個案', en: 'Three-scooter case study' },
    chartSub: { 'zh-TW': '劣化的那一台排的，是新的那一台的幾倍（倍）', en: 'The deteriorated machine’s emissions as a multiple of the newer one’s (times)' },
    title: { 'zh-TW': '三台車的個案，|不是車隊的平均', en: 'A case study of three scooters, |not a fleet average' },
    lead: {
      'zh-TW': '這個數字常被拿來說「老車髒很多倍」。它只來自三台車，所以我們把它放在這個框裡，不和其他證據混在一起，也不放在首頁。',
      en: 'This figure is often used to say older scooters are many times dirtier. It comes from three scooters, so we keep it in this panel, apart from the other evidence and off the home page.',
    },
  },
  v23: {
    title: { 'zh-TW': '定檢的排氣上限，|依出廠時間', en: 'Inspection limits |by build date' },
    subtitle: { 'zh-TW': '排氣管口的法定上限：一氧化碳（%）與碳氫化合物（ppm）', en: 'Legal limits at the tailpipe: carbon monoxide (%) and hydrocarbons (ppm)' },
    caption: {
      'zh-TW': '這是排氣管口的法定上限，不是實際排放，也不是空氣裡的濃度。',
      en: 'These are legal limits at the tailpipe, not actual emissions and not concentrations in the air.',
    },
  },
  v24: {
    title: { 'zh-TW': '{total} 台被通知定檢的四行程機車', en: '{total} four-stroke scooters notified for inspection' },
    subtitle: { 'zh-TW': '每一格是一台；空心的是沒有來的', en: 'One cell is one scooter; hollow cells did not come' },
    caption: { 'zh-TW': '沒來的那些排多少，沒有人知道。', en: 'How much the ones that did not come emit, nobody knows.' },
  },
  v25: {
    title: { 'zh-TW': '測站跟得上 PM2.5，|跟不上苯類', en: 'Stations track PM2.5, |not the benzene family' },
    subtitle: { 'zh-TW': '通勤者身上的讀數和最近測站的相關係數範圍（−1 到 1）', en: 'Range of correlation between commuters’ readings and the nearest station (−1 to 1)' },
    zero: { 'zh-TW': '0：完全跟不上', en: '0: no relation' },
    one: { 'zh-TW': '1：完全跟得上', en: '1: perfect' },
    caption: { 'zh-TW': '量的是台北騎腳踏車和電動機車的通勤者，不是行人。', en: 'Commuters on bicycles and rented electric scooters in Taipei, not pedestrians.' },
  },
  v26: {
    title: { 'zh-TW': '離現場最近的三項量測', en: 'The three measurements closest to the scene' },
    subtitle: { 'zh-TW': '三項研究，三種方法，分開畫，不合併', en: 'Three studies, three methods, drawn apart and never merged' },
    a: { 'zh-TW': '（甲）苯系物：在車道上騎電動機車，和騎腳踏車走同一條路線', en: '(a) Benzene family: riding an electric scooter in the traffic lane, against cycling the same routes' },
    b: { 'zh-TW': '（乙）同一個早上的一小時，個人身上的 PM2.5', en: '(b) Personal PM2.5 over the same morning hour' },
    c: { 'zh-TW': '（丙）低價感測器：人行道上和停等紅燈的機車上', en: '(c) A low-cost sensor: on the sidewalk and on a scooter stopped at red lights' },
    diffLabel: { 'zh-TW': '和現場差在哪：', en: 'How this differs from the scene: ' },
    aDiff: { 'zh-TW': '量的是在車道上騎租來電動機車的研究助理，和騎腳踏車的人，不是站在路口的行人。', en: 'Research assistants riding rented electric scooters in the traffic lane, and cyclists; not pedestrians standing at a crossing.' },
    bDiff: { 'zh-TW': '所有來源的 PM2.5，一小時的通勤，不是一個紅燈。', en: 'PM2.5 from all sources over an hour’s commute, not one red light.' },
    cDiff: { 'zh-TW': '感測器沒有校正，讀數可能偏高；人行道上有指名來源的最高讀數，來自廟宇的香和小吃攤。', en: 'The sensor was not calibrated and may read high; the highest sidewalk readings with a named source came from temple incense and food stalls.' },
    aTitle: { 'zh-TW': '苯系物總和長條圖', en: 'Bar chart of total benzene family' },
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
    title: { 'zh-TW': '致癌分級，|照實寫', en: 'Cancer classifications, |as they are' },
    subtitle: { 'zh-TW': '國際癌症研究機構的分級', en: 'International Agency for Research on Cancer classifications' },
    item: { 'zh-TW': '項目', en: 'Agent' },
    group: { 'zh-TW': '分級', en: 'Group' },
    benzene: { 'zh-TW': '苯', en: 'Benzene' },
    outdoor: { 'zh-TW': '室外空氣污染與其中的懸浮微粒', en: 'Outdoor air pollution and its particulate matter' },
    diesel: { 'zh-TW': '柴油引擎廢氣', en: 'Diesel engine exhaust' },
    gasoline: { 'zh-TW': '汽油引擎廢氣', en: 'Gasoline engine exhaust' },
    foot: { 'zh-TW': '分級講的是會不會，不是吸多少會。', en: 'A classification says whether something is carcinogenic, not how much it takes.' },
  },
  v13: {
    title: { 'zh-TW': '同一個早上，|三種通勤', en: 'The same morning, |three ways to commute' },
    subtitle: { 'zh-TW': '台北通勤一小時，個人身上的 PM2.5 平均（µg/m³），所有來源', en: 'Personal PM2.5 over one Taipei morning commuting hour, mean (µg/m³), all sources' },
    caption: { 'zh-TW': '這是所有來源的 PM2.5，不是只算廢氣。另一項台北研究的數字另外畫，不合併。', en: 'PM2.5 from all sources, not exhaust alone. Another Taipei study’s figures are drawn separately and never merged with these.' },
  },
  v29: {
    title: { 'zh-TW': '嬰兒車高度，|各國研究怎麼說', en: 'Pram height: |what each study found' },
    subtitle: { 'zh-TW': '嬰兒車高度比大人呼吸高度多或少的百分比，一項研究一列', en: 'Per cent above or below adult breathing height, one study per row' },
    band: { 'zh-TW': '多數研究', en: 'Most studies' },
    zero: { 'zh-TW': '0 代表和大人的高度一樣', en: '0 means the same as adult height' },
    upTo: { 'zh-TW': '最多', en: 'up to' },
    over: { 'zh-TW': '超過', en: 'over' },
    noDiff: { 'zh-TW': '沒有一致的差別', en: 'no consistent difference' },
    foot: { 'zh-TW': '台灣：沒有任何一項', en: 'Taiwan: none' },
    caption: {
      'zh-TW': '各研究的污染物、高度和儀器都不一樣，不能合成一個數字。學齡兒童站得比嬰兒車高；對他們確定的，是呼吸比大人快。',
      en: 'The studies differ in pollutant, height and instrument, so they cannot be combined into one number. A school-age child stands above the pram band; what is established for them is faster breathing.',
    },
  },
  v17: {
    title: { 'zh-TW': '往回走的那條線', en: 'The line heading the wrong way' },
    subtitle: { 'zh-TW': '新掛牌機車裡電動的比例（%），和淨零路徑的目標', en: 'Electric share of newly registered scooters (%), and the net-zero pathway targets' },
    caption: { 'zh-TW': '實際比例出自媒體轉述的官方統計；空心點是目標，不是預測。', en: 'Actual shares are official figures as reported in the media; hollow points are targets, not forecasts.' },
  },
  v32: {
    title: { 'zh-TW': '安靜的那條路', en: 'The quieter route' },
    subtitle: { 'zh-TW': '走巷弄小路，比走大馬路少多少（%，已校正背景和風）', en: 'How much lower on the side-street route than the main road (%, adjusted for background and wind)' },
    caption: { 'zh-TW': '量的是騎車的通勤者，不是站著的行人。外框的長條，研究自己說不顯著。', en: 'Commuters riding, not pedestrians standing. Outlined bars: the study itself found the difference not significant.' },
  },

  // Generic chart vocabulary
  chart: {
    category: { 'zh-TW': '項目', en: 'Item' },
    value: { 'zh-TW': '數值', en: 'Value' },
    note: { 'zh-TW': '註記', en: 'Notes' },
    estimate: { 'zh-TW': '估計值', en: 'Estimate' },
    ciLow: { 'zh-TW': '信賴區間下限', en: 'Lower confidence limit' },
    ciHigh: { 'zh-TW': '信賴區間上限', en: 'Upper confidence limit' },
    noChange: { 'zh-TW': '沒有差別', en: 'No difference' },
    ratioOne: { 'zh-TW': '1 = 沒有差別', en: '1 = no difference' },
    year: { 'zh-TW': '年', en: 'Year' },
    date: { 'zh-TW': '開始日期', en: 'Start date' },
    phase: { 'zh-TW': '第 {n} 期', en: 'Phase {n}' },
    download: { 'zh-TW': '下載這張圖的資料（CSV）', en: 'Download this chart’s data (CSV)' },
    hollowNs: { 'zh-TW': '外框：統計上不顯著', en: 'Outline: not statistically significant' },
    hollowModel: { 'zh-TW': '外框：未通過模式效能檢核', en: 'Outline: failed the model-performance check' },
    filled: { 'zh-TW': '實心：研究報告的數值', en: 'Filled: the value as reported' },
    significant: { 'zh-TW': '＊ 統計顯著', en: '* statistically significant' },
    sigFilled: { 'zh-TW': '實心：統計顯著', en: 'Filled: statistically significant' },
    sigHollow: { 'zh-TW': '空心：統計上不顯著', en: 'Hollow: not statistically significant' },
    ppb: { 'zh-TW': '十億分之幾就聞得到', en: 'smelled at parts per billion' },
    ppm: { 'zh-TW': '要到百萬分之幾', en: 'needs parts per million' },
    noSmell: { 'zh-TW': '沒有味道', en: 'no smell' },
    asTable: { 'zh-TW': '這組資料用表格呈現，因為數值相差太大，畫成同一張圖會誤導。', en: 'This dataset is shown as a table because its values differ too widely to draw honestly on one chart.' },
    reduction: { 'zh-TW': '降低的百分比', en: 'Reduction (%)' },
  },

  // V31 and the rest of #not-used (blueprint 4.5, section 6)
  notUsed: {
    title: { 'zh-TW': '常被引用、|但我們不這樣用的數字', en: 'Figures often quoted |that we do not use that way' },
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
        quote: { 'zh-TW': '「行人專用時相讓 PM2.5 暴露少 {outlier}」', en: '“A pedestrian scramble cuts PM2.5 exposure by {outlier}”' },
        actually: {
          'zh-TW': '這是高雄一個路口、一個模擬日的模式值，報告自己標為離群值。一般的模擬日，降幅是{typical}；台北有些路口的模擬日沒有降。',
          en: 'It is a modelled value for one simulated day at one Kaohsiung intersection, flagged by the report itself as an outlier. On typical simulated days the reduction was {typical}; on some simulated days at the Taipei sites there was none.',
        },
        weSay: {
          'zh-TW': '在運研所的模式裡，行人專用時相在一般的模擬日讓行人等候區的 PM2.5 少了{typical}。這是模擬，不是在路口前後量的。',
          en: 'In the Institute of Transportation’s model, a scramble phase lowered PM2.5 at the pedestrian waiting area by {typical} on typical simulated days. That is a simulation, not a before-and-after measurement.',
        },
        recheck: {
          'zh-TW': '這份報告，我們第一輪研究讀過；第二輪查核時沒能再打開它，所以這些數字還要再對一次原文。',
          en: 'Our first research pass read this report; the second checking pass could not reopen it, so these figures still need one more check against the original.',
        },
        stripTitle: { 'zh-TW': '{outlier} 是怎麼來的', en: 'Where {outlier} comes from' },
        stripSub: { 'zh-TW': '模式裡行人等候區 PM2.5 降低的百分比，0 到 100%', en: 'Modelled reduction in PM2.5 at the pedestrian waiting area, 0 to 100%' },
        stripTypical: { 'zh-TW': '一般的模擬日', en: 'Typical simulated days' },
        stripOutlier: { 'zh-TW': '高雄一個路口、一個模擬日，報告自己標為離群值', en: 'One Kaohsiung intersection, one simulated day, flagged by the report as an outlier' },
        stripCaption: { 'zh-TW': '這是模擬，不是量測；也不是機車專屬的結果。', en: 'A simulation, not a measurement, and not a result about scooters in particular.' },
      },
      neverSmokers: {
        quote: { 'zh-TW': '「肺癌病人有 {share} 不吸菸，所以是空污害的」', en: '“{share} of lung cancer patients never smoked, so it must be air pollution”' },
        actually: {
          'zh-TW': '比例出自一項台灣研究，是真的。但不吸菸者的肺癌原因還沒有確定，這個數字也和機車無關。另一項研究看到的關聯，算的是所有來源的 PM2.5。',
          en: 'The share is from one Taiwanese study, and it is true. But the cause of lung cancer in never-smokers is not established, and the figure says nothing about scooters. The association another study found is with PM2.5 from all sources.',
        },
        weSay: { 'zh-TW': '我們不在首頁和問題頁用這幾個數字。它們只放在這裡，附上全部的條件。', en: 'We do not use these figures on the home page or the question pages. They appear only here, with all their conditions.' },
      },
      density: {
        quote: { 'zh-TW': '「台灣機車密度全世界最高」', en: '“Taiwan has the most scooters per person in the world”' },
        actually: {
          'zh-TW': '有一份非官方的區域排名把台灣排第一，但只比第二名多一點點，資料來源和年份也不清楚。',
          en: 'One unofficial regional ranking puts Taiwan first, but only just ahead of second place, with unclear data and no stated year.',
        },
        weSay: { 'zh-TW': '我們說「名列前茅」。', en: 'We say “among the highest”.' },
      },
      caseStudy: {
        quote: { 'zh-TW': '「老車比新車髒十幾、三十幾倍」', en: '“Older scooters are tens of times dirtier than new ones”' },
        actually: {
          'zh-TW': '這兩個倍數來自只有三台車的個案研究，不是車隊的平均。',
          en: 'Those multiples come from a case study of only three scooters, not an average of the fleet.',
        },
        weSay: {
          'zh-TW': '我們用車隊層級的研究：舊期別和高里程的機車，每公升燃料排得比較多。三台車的個案只放在第 1 環它自己的框裡。',
          en: 'We use fleet-level studies: older-phase and high-mileage scooters emit more per litre of fuel. The three-scooter case study appears only in its own panel in link 1.',
        },
        go: { 'zh-TW': '看三台車的個案', en: 'See the three-scooter case study' },
      },
      idling: {
        quote: { 'zh-TW': '「機車在等紅燈的時候排最多」', en: '“Scooters emit the most while they wait at the light”' },
        actually: {
          'zh-TW': '國外的路口研究看到的微粒高峰，多半在車子起步的時候，而且量的多半是汽車和柴油車。台灣唯一一筆機車的怠速微粒數據，怠速時反而略低於行駛時。機車起步那一下有多少，台灣沒有人量過。',
          en: 'Junction studies abroad mostly find particle peaks as vehicles pull away, and they mostly measured cars and diesels. Taiwan’s only idle particle datum for a scooter was slightly lower at idle than when moving. How much a scooter emits as it pulls away has not been measured in Taiwan.',
        },
        weSay: { 'zh-TW': '我們說：等的時候和起步的那一下都算；最高的那一下在哪裡，機車還沒有人量過。', en: 'We say: the wait and the pull-away both count; where a scooter’s peak falls, nobody has measured.' },
      },
      target2035: {
        quote: { 'zh-TW': '「2035 年機車全面電動」', en: '“All new scooters electric by 2035”' },
        actually: {
          'zh-TW': '淨零路徑的目標，是 {y1} 年電動占新車的 {t1}，{y2} 年 {t2}。這是市售比的目標，不是禁售燃油機車。',
          en: 'The net-zero pathway targets an electric share of new sales of {t1} in {y1} and {t2} in {y2}. These are sales targets, not a ban on gasoline scooters.',
        },
        weSay: { 'zh-TW': '我們照目標的原樣寫，並且說它是目標，不是預測。', en: 'We give the targets as they are, and call them targets, not forecasts.' },
      },
    },
  },

  // V33: the five lines the home page also refuses (blueprint 3.10), struck through, each with
  // the claims policy's own reason; then the whole policy, grouped by topic.
  notClaimed: {
    title: { 'zh-TW': '我們不會說的話', en: 'What we will not say' },
    lead: {
      'zh-TW': '下面這些話，網站上不會出現。每一句後面寫著為什麼。再往下是我們寫作時用的完整清單，一條一條都從同一份規則產生。',
      en: 'None of these sentences appears on the site. Each is followed by why. Below them is the full list we write against, every line generated from the same set of rules.',
    },
    five: [
      { 'zh-TW': '等一個紅燈會生病。', en: 'That one red light makes you ill.' },
      { 'zh-TW': '機車廢氣是第 1 級致癌物。', en: 'That scooter exhaust is a Group 1 carcinogen.' },
      { 'zh-TW': '機車是 PM2.5 的主要來源。', en: 'That scooters are a main source of PM2.5.' },
      { 'zh-TW': '味道愈重，傷害愈大。', en: 'That a stronger smell means more harm.' },
      { 'zh-TW': '台灣哪一項健康研究的結果是機車造成的。', en: 'That any Taiwanese health finding was caused by scooters.' },
    ],
    fullTitle: { 'zh-TW': '完整的清單', en: 'The full list' },
    fullLead: {
      'zh-TW': '依主題分組。「不可宣稱」是不會出現的說法；「必須附帶說明」是可以說、但一定要連條件一起說；「更正」是常見的錯誤數字和正確的版本。',
      en: 'Grouped by topic. “Do not claim” lines never appear; “needs a qualifier” lines may be said only with their conditions; “corrections” are widely repeated figures and the right version.',
    },
    groupCount: { 'zh-TW': '{n} 條', en: '{n} rules' },
    why: { 'zh-TW': '為什麼：', en: 'Why: ' },
    instead: { 'zh-TW': '我們說的是：', en: 'What we say instead: ' },
    qualifiersTitle: { 'zh-TW': '可以說，但一定要附帶說明', en: 'May be said, only with a qualifier' },
    correctionsTitle: { 'zh-TW': '常見的錯誤數字和更正', en: 'Widely repeated errors, corrected' },
  },

  gaps: {
    title: { 'zh-TW': '還沒有人量過的事', en: 'What nobody has measured yet' },
    lead: {
      'zh-TW': '「沒人量過」在這個網站上是一條證據，不是一個藉口。每一格都寫著我們找了什麼、什麼樣的量測可以把它填起來、誰量得出來。',
      en: 'On this site “nobody has measured this” is a piece of evidence, not an excuse. Each entry says what we searched for, what measurement would fill it, and who could do it.',
    },
    why: { 'zh-TW': '為什麼重要：', en: 'Why it matters: ' },
    close: { 'zh-TW': '怎麼填起來：', en: 'What would close it: ' },
    who: { 'zh-TW': '誰量得出來：', en: 'Who could measure it: ' },
    closest: { 'zh-TW': '目前最接近的證據：', en: 'The closest evidence we hold: ' },
    searched: { 'zh-TW': '查找日期：{date}', en: 'Searched: {date}' },
    gapN: { 'zh-TW': '空白 {n}', en: 'Gap {n}' },
    ask: { 'zh-TW': '這一格還是空的。請來量我家路口', en: 'This box is still empty. Ask them to measure my crossing' },
  },

  studies: {
    title: { 'zh-TW': '讀過全文的研究', en: 'The studies we read in full' },
    lead: {
      'zh-TW': '這幾篇論文，我們讀了全文，並且逐頁核對了網站用到的每一個數字。其他來源讀到哪裡，資料來源頁上每一筆都有寫。',
      en: 'For these papers we read the full text and checked every figure the site uses against the page. How far we got into every other source is stated on its entry on the sources page.',
    },
    uses: { 'zh-TW': '網站用到的 {n} 項', en: 'Used on the site ({n})' },
    entry: { 'zh-TW': '資料來源頁的這一筆', en: 'Its entry on the sources page' },
  },

  method: {
    title: { 'zh-TW': '怎麼查證的', en: 'How we checked' },
    badges: { 'zh-TW': '證據標記', en: 'The evidence badges' },
    body: [
      {
        'zh-TW': '網站上每一個數字，都來自同一份登錄表。每一筆記著它的出處、原文在哪一頁或哪一段、證據的種類，以及一定要一起說的限制。頁面上的數字是從登錄表直接帶進來的；登錄表改了，頁面就跟著改。',
        en: 'Every number on the site comes from one registry. Each entry records its source, where in the source it appears, what kind of evidence it is, and the limitation that must go with it. Pages take their numbers straight from the registry, so a correction there corrects every page.',
      },
      {
        'zh-TW': '研究和查核有一部分是用自動化的研究工具做的，再由第二輪逐筆核對。查不到原文、只見於轉述的，標「次級來源」。標示為未查證的，一律不收進來。',
        en: 'Part of the research and checking was done with automated research tools, followed by a second pass that checked each entry. Anything we could reach only through a report of it is tagged “secondary”. Anything marked unverified is left out.',
      },
      {
        'zh-TW': '每一篇寫作都會自動比對一份「我們不會說的話」的規則；碰到規則的句子，要有人看過、寫下理由，才能發布。',
        en: 'Every piece of copy is checked automatically against the rules of what we will not say; a sentence that matches one is published only after a person has reviewed it and recorded why it is right.',
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
    empty: { 'zh-TW': '這一格還是空的', en: 'This box is still empty' },
    emptyBody: { 'zh-TW': '沒人量過的事，誰量得出來，怎麼請他們來量。', en: 'What nobody has measured, who could, and how to ask them.' },
    sources: { 'zh-TW': '看每一筆出處', en: 'See every source' },
    sourcesBody: { 'zh-TW': '每一個來源的完整書目、連結，以及我們讀到哪裡。', en: 'Every source’s full reference, its link, and how far we read it.' },
    questions: { 'zh-TW': '路口的問題', en: 'Questions at the crossing' },
    questionsBody: { 'zh-TW': '用讀者自己的話問的問題，一題一頁。', en: 'Questions in readers’ own words, one page each.' },
  },

  rail: {
    map: { 'zh-TW': '證據地圖', en: 'Evidence map' },
    gaps: { 'zh-TW': '還沒有人量過的事', en: 'What nobody has measured' },
    notUsed: { 'zh-TW': '我們不這樣用的數字', en: 'Figures we do not use that way' },
    sources: { 'zh-TW': '資料來源', en: 'Sources' },
  },

  context: {
    title: { 'zh-TW': '鏈外的背景資料', en: 'Background outside the chain' },
    lead: { 'zh-TW': '這幾項不屬於任何一環，是誰騎車、騎去哪裡這類背景。', en: 'These belong to no link of the chain; they are background, such as who rides and where to.' },
  },
});
