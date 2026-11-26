// /about/ — 關於 / About (blueprint 4.9, Appendix B item 1). What the site is and is not, how
// the evidence was gathered and checked, the badges, the rules the site holds itself to, how to
// report an error, and the corrections log (#corrections, linked from the footer).
//
// The owner's statement is the maker's credit only (handle and link in
// src/components/pages/action/owner.ts). Do not add an organisation, funder or address the
// owner has not supplied.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '關於', en: 'About' },
    description: {
      'zh-TW': '行人呼吸是什麼、不是什麼；證據怎麼找、怎麼查；我們給自己的規則；怎麼回報錯誤；以及修改紀錄。',
      en: 'What ScooterAir is and is not, how the evidence was gathered and checked, the rules we hold ourselves to, how to report an error, and the corrections log.',
    },
  },
  hero: {
    eyebrow: { 'zh-TW': '關於', en: 'About' },
    title: { 'zh-TW': '這個網站|是什麼', en: 'What this |site is' },
    deck: {
      'zh-TW': '我們整理一件事：在台灣的紅燈旁，行人和騎士吸進什麼，哪些已經知道、哪些還沒有人量過；還有換電動機車，實際要花多少。',
      en: 'We set out one thing: what pedestrians and riders breathe at a Taiwanese red light, what is known and what nobody has measured; and what going electric really costs.',
    },
    toc: { 'zh-TW': '這一頁', en: 'On this page' },
  },
  owner: {
    title: { 'zh-TW': '誰做的', en: 'Who made this site' },
    madeBy: { 'zh-TW': '製作：', en: 'Made by ' },
    onX: { 'zh-TW': '（X）', en: ' (X)' },
  },
  what: {
    eyebrow: { 'zh-TW': '是什麼', en: 'What it is' },
    title: { 'zh-TW': '是什麼，|不是什麼', en: 'What it is, |and what it is not' },
    isTitle: { 'zh-TW': '它是', en: 'It is' },
    is: [
      { 'zh-TW': '一份把證據一環一環攤開的整理：每個數字都附出處，每個說法都標明是哪一種證據。', en: 'A layout of the evidence, link by link: every number has its source, and every claim says what kind of evidence it is.' },
      { 'zh-TW': '一份清單，列出還沒有人量過的事，和誰量得出來。', en: 'A list of what nobody has measured, and who could.' },
      { 'zh-TW': '一個試算：以你的條件，換電動機車要多少錢；算出來打不平，也照實講。', en: 'A calculator: what switching to an electric scooter costs on your terms, including when the sums do not come out in its favour.' },
    ],
    isNotTitle: { 'zh-TW': '它不是', en: 'It is not' },
    isNot: [
      { 'zh-TW': '一次新的量測。我們自己沒有在路口量過任何東西。', en: 'A new measurement. We have not measured anything at a crossing ourselves.' },
      { 'zh-TW': '醫療建議。身體不舒服，請看醫生。', en: 'Medical advice. If you feel unwell, see a doctor.' },
      { 'zh-TW': '任何車款、品牌或方案的推薦。', en: 'A recommendation of any model, brand or plan.' },
      { 'zh-TW': '在怪騎車的人。我們句子的主詞是排氣管、規定和補助，不是騎士；大部分人既騎車，也走路。', en: 'A complaint about riders. The subject of our sentences is the tailpipe, the rule or the subsidy, never the rider; most of us ride and walk.' },
    ],
    scene: {
      'zh-TW': '紅燈的畫面是示意圖，圖表才是數據。畫面裡的斜線只說「有廢氣，多濃沒人量過」，從來不畫濃度，也不會和健康數字放在同一格。',
      en: 'The red-light scene is an illustration; the charts are data. The hatching in the scene says only “exhaust present, amount not measured”. It never shows a concentration, and never shares a frame with a health figure.',
    },
  },
  method: {
    eyebrow: { 'zh-TW': '方法', en: 'Method' },
    title: { 'zh-TW': '證據怎麼找、|怎麼查', en: 'How the evidence was |gathered and checked' },
    p1: {
      'zh-TW': '這個網站的研究和查核，大部分是用 AI 研究工具做的：它到政府、期刊和媒體的網站下載原始文件，把數字和原文的位置一起記下來。打不開的文件，就照實寫打不開；只在搜尋摘要裡看到、沒有打開原文的數字，不收進來。',
      en: 'Most of the research and checking for this site was done with AI research tools. They downloaded the original documents from government, journal and media websites and recorded each figure with where it appears in the text. Documents that could not be opened are recorded as such; a figure seen only in a search summary, with the original unopened, is not used.',
    },
    p2: {
      'zh-TW': '第二輪查核重新打開同一批文件，把每一項標成確認、更正或新增。網站的資料庫只收這三種；每次建置都會自動檢查，每一筆資料都指得回這樣一項。',
      en: 'A second round reopened the same documents and marked each finding as confirmed, corrected or added. The site’s database takes only those three; every build checks automatically that each entry points back to one.',
    },
    p3: {
      'zh-TW': '每一句文案，在建置時也要通過一份「不能這樣說」的規則清單，例如研究看到的關聯，不能寫得像證明了因果。規則抓到的句子要改，或寫明為什麼沒有違反規則。',
      en: 'Every sentence of copy must also pass a list of “do not say” rules at build time, such as never presenting an association a study found as if it were proof. A sentence the rules catch is either rewritten or recorded with the reason it does not break the rule.',
    },
    counts: {
      'zh-TW': '目前收錄 {sources} 個來源、{facts} 筆有出處的事實、{gaps} 格沒有人量過的空白。',
      en: 'The database holds {sources} sources, {facts} sourced facts and {gaps} recorded blanks that nobody has measured.',
    },
    levels: { 'zh-TW': '每一筆事實都有一個查核等級：', en: 'Every fact carries a level of checking:' },
    checked: {
      'zh-TW': '證據最近一次查核：{evidence}。補助資料最近一次查核：{money}。',
      en: 'Evidence last checked: {evidence}. Subsidy data last checked: {money}.',
    },
    sources: { 'zh-TW': '所有出處', en: 'Every source' },
  },
  badges: {
    eyebrow: { 'zh-TW': '證據標記', en: 'Evidence badges' },
    title: { 'zh-TW': '每個說法旁邊的|那個標記', en: 'The badge |beside every claim' },
    lead: {
      'zh-TW': '同一頁上，量到的、官方統計、模式推估、國外的研究、我們自己的計算和推論，看標記就分得出來。推論是全站最弱的一種。',
      en: 'On any page, what was measured, an official figure, a model, a study abroad, our own arithmetic and our own inference can be told apart by the badge. Inference is the weakest kind on the site.',
    },
  },
  rules: {
    eyebrow: { 'zh-TW': '編輯規則', en: 'Editorial rules' },
    title: { 'zh-TW': '我們給自己的|規則', en: 'The rules we |hold ourselves to' },
    lead: {
      'zh-TW': '一個說法有多強，只看它的證據有多強。光看用字，就該分得出是哪一種。',
      en: 'A claim is only as strong as its evidence, and the wording alone should tell you which kind it is.',
    },
    tableCaption: { 'zh-TW': '用字跟著證據走', en: 'The wording follows the evidence' },
    colKind: { 'zh-TW': '哪一種說法', en: 'Kind of claim' },
    colWrite: { 'zh-TW': '我們寫', en: 'We write' },
    colNever: { 'zh-TW': '我們不寫', en: 'We never write' },
    verbs: [
      { kind: { 'zh-TW': '在台灣量到的', en: 'Measured in Taiwan' }, write: { 'zh-TW': '量到', en: 'measured' }, never: { 'zh-TW': '（沒有限制）', en: '(no restriction)' } },
      { kind: { 'zh-TW': '官方統計', en: 'Official figure' }, write: { 'zh-TW': '統計、清冊、規定', en: 'official figure, inventory, rule' }, never: { 'zh-TW': '量到', en: 'measured' } },
      { kind: { 'zh-TW': '模式推估', en: 'Model result' }, write: { 'zh-TW': '推估、模擬', en: 'estimated, modelled' }, never: { 'zh-TW': '量到、實測', en: 'measured' } },
      { kind: { 'zh-TW': '健康研究', en: 'Health studies' }, write: { 'zh-TW': '有關、跟著變', en: 'is associated with, moves with' }, never: { 'zh-TW': '導致、造成、引起', en: 'causes, leads to' } },
      { kind: { 'zh-TW': '我們自己的一步', en: 'Our own step' }, write: { 'zh-TW': '「我們的推論：」開頭', en: 'begins “Our inference:”' }, never: { 'zh-TW': '寫得像事實', en: 'stated as fact' } },
      { kind: { 'zh-TW': '沒有人量過', en: 'Nobody has measured it' }, write: { 'zh-TW': '沒有人量過，再寫誰量得出來', en: 'nobody has measured this, then who could' }, never: { 'zh-TW': '一句裡疊好幾個「可能」', en: 'a pile of “may” and “might”' } },
    ],
    list: [
      { 'zh-TW': '研究看到的是「有關」，不是「造成」。這兩個詞差很多，我們不會混著用。', en: 'Studies show that things are associated, not that one causes the other. The two words mean very different things, and we do not mix them up.' },
      { 'zh-TW': '健康研究量的多半是所有來源的 PM2.5，或整體車流；我們每次都寫出來，不把它說成機車的結果。', en: 'Health studies mostly measured PM2.5 from all sources, or traffic as a whole. We say so every time, and never present it as a result about scooters.' },
      { 'zh-TW': '沒有人量過的事，用和發現一樣大的字寫，兩句話之內接著寫誰量得出來。', en: 'What nobody has measured is written in the same size as a finding, and followed within two sentences by who could measure it.' },
      { 'zh-TW': '對我們不利的數字，我們先講。', en: 'We volunteer the numbers that cut against us before a critic can.' },
      { 'zh-TW': '我們不叫任何人硬換車。打不平，就說打不平。', en: 'We tell nobody to switch regardless. When the sums do not add up, we say so.' },
      { 'zh-TW': '每一個補助金額旁邊，都寫了我們查證的日期。', en: 'Every subsidy amount shows the date we checked it.' },
    ],
    against: {
      'zh-TW': '例如：論排放量，全台灣的 PM2.5，燃油機車只占 {share}。',
      en: 'For example: by emissions, gasoline scooters produce {share} of Taiwan’s PM2.5.',
    },
    promiseTitle: { 'zh-TW': '量出來是什麼，我們都公布', en: 'Whatever a measurement shows, we publish it' },
    pledge: {
      'zh-TW': '「量出來如果路口和背景沒有差別，我們會把這個結果放在首頁。」結果顯示問題很小，也一樣。',
      en: '“If the measurement finds no difference between the crossing and the background, that result goes on the home page.” The same goes for a result that shows the problem is small.',
    },
    changeMind: {
      'zh-TW': '如果有人在機車多的路口，在行人和嬰兒車的高度，分紅燈和綠燈，把一氧化碳、苯類和超細微粒量出來，結果和附近的背景值差不多，「行人吸進什麼」這一環就不成立。我們會改寫網站，並且寫明為什麼改。',
      en: 'If someone measures carbon monoxide, benzene-family compounds and ultrafine particles at a scooter-heavy crossing, at pedestrian and stroller height, by red and green phase, and finds them close to the nearby background, the link about what pedestrians breathe fails. We will rewrite the site and say why.',
    },
  },
  update: {
    eyebrow: { 'zh-TW': '補助資料', en: 'Subsidy data' },
    title: { 'zh-TW': '補助的數字|會過期', en: 'Subsidy figures |go out of date' },
    body: {
      'zh-TW': '補助的金額和名額一直在變。每個金額旁邊都有我們查證的日期；超過 {days} 天沒有重新查證的，頁面會提醒你可能已經變了。過了 {deadline}，頁面會自己換成期限之後的說法。下單前，請再看一次官方頁面。',
      en: 'Subsidy amounts and quotas keep changing. Every amount shows the date we checked it; once that is more than {days} days old, the page warns that it may have changed. After {deadline} the pages switch by themselves to what is true after the deadline. Look at the official page again before you order.',
    },
  },
  report: {
    eyebrow: { 'zh-TW': '回報錯誤', en: 'Report an error' },
    title: { 'zh-TW': '發現我們講錯了？|告訴我們', en: 'Found something we got wrong? |Tell us' },
    body: {
      'zh-TW': '告訴我們是哪一頁、哪一句，還有你手上的出處怎麼說。我們會去查；改了，就寫進下面的修改紀錄，附上日期和原因。',
      en: 'Tell us which page and which sentence, and what your source says. We will check it, and if we change anything it goes into the corrections log below, with the date and the reason.',
    },
    contact: { 'zh-TW': '請在 X 上告訴我們：', en: 'Tell us on X: ' },
  },
  corrections: {
    eyebrow: { 'zh-TW': '修改紀錄', en: 'Corrections' },
    title: { 'zh-TW': '修改紀錄', en: 'Corrections log' },
    lead: {
      'zh-TW': '網路上常被轉述、但證據撐不起來的說法，我們在動手寫之前就改了。每一條寫明：常見的說法、我們改成怎麼說、為什麼。',
      en: 'Claims that are widely repeated but that the evidence does not support were corrected before we wrote a word. Each entry says what is commonly said, what we say instead, and why.',
    },
    said: { 'zh-TW': '常見的說法', en: 'Commonly said' },
    saidSr: { 'zh-TW': '我們不這樣說：', en: 'We do not say: ' },
    instead: { 'zh-TW': '我們的說法', en: 'What we say' },
    why: { 'zh-TW': '為什麼', en: 'Why' },
    basis: { 'zh-TW': '根據', en: 'Based on' },
    ours: { 'zh-TW': '我們自己改過的', en: 'Our own correction' },
    /** What people commonly say. Struck through on the page; each is refused by the entry below it. */
    claims: {
      'iot-94': { 'zh-TW': '行人專用時相，讓行人少吸 94% 的 PM2.5。', en: 'Scramble crossings cut what pedestrians breathe by 94 per cent.' },
      'pm25-source': { 'zh-TW': '機車是 PM2.5 的主要來源。', en: 'Scooters are a main source of PM2.5.' },
      'ev-cheaper': { 'zh-TW': '電動機車一定比較省。', en: 'An electric scooter is always cheaper to run.' },
      'densest': { 'zh-TW': '台灣的機車密度世界第一。', en: 'Taiwan has the world’s highest scooter density.' },
      'netzero-2035': { 'zh-TW': '2035 年起，新機車全部要是電動的。', en: 'From 2035 every new scooter must be electric.' },
      'child-44': { 'zh-TW': '小孩比大人多吸 44% 的污染。', en: 'Children breathe 44% more pollution than adults.' },
      'ev-zero': { 'zh-TW': '電動機車零污染。', en: 'Electric scooters are zero-pollution.' },
      'idling-legal': { 'zh-TW': '等紅燈不熄火，是違規的。', en: 'Idling at a red light is illegal.' },
      'ufp-smell': { 'zh-TW': '超細微粒聞不到。', en: 'Ultrafine particles have no smell.' },
      'no-2027': { 'zh-TW': '2027 年的補助，什麼都還沒公布。', en: 'Nothing at all has been announced for 2027.' },
    },
    /** For the two entries that correct our own earlier wording (not a claim-policy rule). */
    ownInstead: {
      'ufp-smell': {
        'zh-TW': '我們只說一氧化碳沒有味道。苯要到百萬分之幾才聞得到，路邊的濃度不太可能聞得到。超細微粒聞不聞得到，我們找不到查證過的出處，所以不寫。',
        en: 'We say only that carbon monoxide has no smell. Benzene can be smelled only at parts per million, so it is unlikely to be smelled at roadside levels. We found no checked source on whether ultrafine particles can be smelled, so we do not say.',
      },
      'no-2027': {
        'zh-TW': '2027 年的補助，還沒有一項定案；環境部預告了一項草案，擬延長一筆汰舊的補助。',
        en: 'Nothing is confirmed for 2027; the environment ministry has pre-announced a draft that would extend one scrappage payment.',
      },
    },
    ownWhy: {
      'ufp-smell': {
        'zh-TW': '「聞不到」要有出處。一氧化碳有世界衛生組織的說明；超細微粒沒有。',
        en: '“Cannot be smelled” needs a source. For carbon monoxide the WHO says so; for ultrafine particles we found nothing checked.',
      },
      'no-2027': {
        'zh-TW': '「沒有公布」和「沒有定案」不一樣：已經有一份草案預告了，只是還沒定。',
        en: '“Not announced” and “not confirmed” are different: a draft has been pre-announced, but nothing is final.',
      },
    },
    dateLabel: { 'zh-TW': '日期', en: 'Date' },
  },
  toc: [
    { id: 'who', label: { 'zh-TW': '誰做的', en: 'Who made it' } },
    { id: 'what', label: { 'zh-TW': '是什麼', en: 'What it is' } },
    { id: 'method', label: { 'zh-TW': '方法', en: 'Method' } },
    { id: 'badges', label: { 'zh-TW': '證據標記', en: 'Badges' } },
    { id: 'rules', label: { 'zh-TW': '編輯規則', en: 'Rules' } },
    { id: 'report', label: { 'zh-TW': '回報錯誤', en: 'Report an error' } },
    { id: 'corrections', label: { 'zh-TW': '修改紀錄', en: 'Corrections' } },
  ],
});
