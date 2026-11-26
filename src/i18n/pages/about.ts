// /about/ — 關於 / About (redesign brief 7.8). Short: who made the site; how the five chips
// work; one paragraph on the estimate (K1, then 本站沒有自己去量；我們推估，並把算法攤開); the
// editorial rules, rewritten around that sentence (brief 4.2 and 4.6); how evidence was
// gathered and checked; how subsidy figures date; how to report an error; the corrections log.
//
// The owner's statement is the maker's credit only (handle and link in
// src/components/pages/action/owner.ts), in the owner's own words. Contact (beyond the X
// account), licence and funding statements appear only if the owner supplies them: until then
// those sections are left out, not shown empty.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '關於', en: 'About' },
    description: {
      'zh-TW': '誰做的、每個數字旁邊的標記是什麼意思、推估怎麼來的、我們給自己的規則、怎麼回報錯誤，以及修改紀錄。',
      en: 'Who made the site, what the label beside every number means, where the estimate comes from, the rules we hold ourselves to, how to report an error, and the corrections log.',
    },
  },
  hero: {
    eyebrow: { 'zh-TW': '關於', en: 'About' },
    title: { 'zh-TW': '這個網站|是什麼', en: 'What this |site is' },
    deck: {
      'zh-TW': '我們整理兩件事：等紅燈的時候，旁邊機車的廢氣有多少、對身體有什麼影響；還有換一輛電動機車，實際要花多少錢。',
      en: 'We set out two things: how much exhaust the scooters beside you add at a red light and what it does to the body; and what an electric scooter really costs.',
    },
    toc: { 'zh-TW': '這一頁', en: 'On this page' },
  },
  owner: {
    title: { 'zh-TW': '誰做的', en: 'Who made this site' },
    madeBy: { 'zh-TW': '製作：', en: 'Made by ' },
    onX: { 'zh-TW': '（X）', en: ' (X)' },
  },
  chips: {
    eyebrow: { 'zh-TW': '數字旁邊的標記', en: 'The label beside each number' },
    title: { 'zh-TW': '每個數字，|都標了它從哪裡來', en: 'Every number says |where it comes from' },
    lead: {
      'zh-TW': '網站上每個數字旁邊，都有下面五種標記的一種。字不一樣，形狀也不一樣，不靠顏色也分得出來。',
      en: 'Every number on the site carries one of these five labels. They differ in word and in shape, so you can tell them apart without colour.',
    },
    market: {
      'zh-TW': '錢的頁面還有一種：業者自己公布的價格和資費。',
      en: 'Money pages have one more: prices and plan fees that the sellers publish themselves.',
    },
  },
  estimate: {
    eyebrow: { 'zh-TW': '推估', en: 'The estimate' },
    title: { 'zh-TW': '本站沒有自己去量；|我們推估，並把算法攤開', en: 'We did not measure it ourselves. |We estimate, and show all the working' },
    p1: {
      'zh-TW': '我們用公開的資料來算：定檢讀數告訴我們一輛機車怠速時排多少，運研所的錄影告訴我們一個紅燈停幾輛，測站和現場量測告訴我們路邊的風。算出來的是一個範圍，標成「推估」。',
      en: 'We work from published data: inspection readings tell us how much an idling scooter gives off, the Institute of Transportation’s video counts tell us how many stop at one red light, and weather stations and on-site readings tell us the wind at the kerb. The result is a range, labelled “estimate”.',
    },
    link: { 'zh-TW': '看完整的算法', en: 'See the full working' },
  },
  rules: {
    eyebrow: { 'zh-TW': '編輯規則', en: 'Editorial rules' },
    title: { 'zh-TW': '我們給自己的|規則', en: 'The rules we |hold ourselves to' },
    lead: {
      'zh-TW': '一個說法有多強，只看它的證據有多強。光看用字，就該分得出是量的、算的，還是研究說的。',
      en: 'A claim is only as strong as its evidence. The wording alone should tell you whether a figure was measured, worked out, or comes from a study.',
    },
    tableCaption: { 'zh-TW': '用字跟著證據走', en: 'The wording follows the evidence' },
    colKind: { 'zh-TW': '哪一種數字', en: 'Kind of figure' },
    colWrite: { 'zh-TW': '我們寫', en: 'We write' },
    colNever: { 'zh-TW': '我們不寫', en: 'We never write' },
    verbs: [
      { kind: { 'zh-TW': '實測', en: 'Measured' }, write: { 'zh-TW': '量到、量過', en: 'measured' }, never: { 'zh-TW': '寫得比儀器量到的更多', en: 'more than the instrument recorded' } },
      { kind: { 'zh-TW': '推估', en: 'Estimate' }, write: { 'zh-TW': '算的、推估，一定給範圍', en: 'worked out, estimate, always as a range' }, never: { 'zh-TW': '量到、實測', en: 'measured' } },
      { kind: { 'zh-TW': '官方', en: 'Official' }, write: { 'zh-TW': '規定、統計、指引值', en: 'rule, statistic, guideline value' }, never: { 'zh-TW': '量到', en: 'measured' } },
      { kind: { 'zh-TW': '健康研究', en: 'Health studies' }, write: { 'zh-TW': '有關、比較多', en: 'is linked to, more often' }, never: { 'zh-TW': '導致、造成、引起', en: 'causes, leads to' } },
      { kind: { 'zh-TW': '本站計算', en: 'Our arithmetic' }, write: { 'zh-TW': '寫出用了哪些數字、怎麼算', en: 'which figures, and the sum' }, never: { 'zh-TW': '寫得像官方數字', en: 'presented as an official figure' } },
    ],
    list: [
      { 'zh-TW': '研究看到的是「有關」，不是「造成」。這兩個詞差很多，我們不會混著用。', en: 'Studies show that things are associated, not that one causes the other. The two words mean very different things, and we do not mix them up.' },
      { 'zh-TW': '推估一定給範圍，旁邊一定有「推估」標記，按下去看得到算法。', en: 'An estimate always comes as a range with its “estimate” label beside it, and one tap shows the working.' },
      { 'zh-TW': '說清楚是什麼的量、在哪裡：機車「多出來」的和街上原本就有的分開寫；推估算的是大人鼻子的高度、90 秒的平均。', en: 'We say what the amount is and where it applies: what the scooters add is kept apart from what the street already holds, and the estimate is for an adult’s nose, averaged over 90 seconds.' },
      { 'zh-TW': '不拿「幾倍」當標題，不說等一個紅燈就會生病，也不印比證據更大的數字。', en: 'No “so many times more” headlines, no claim that one red light makes you ill, and no figure bigger than the evidence.' },
      { 'zh-TW': '健康研究講的多半是所有車輛的廢氣，不只機車；我們每次都寫出來。', en: 'Health studies are mostly about exhaust from all traffic, not scooters alone, and we say so every time.' },
      { 'zh-TW': '對我們不利的數字，我們先講：電動機車在有些條件下比較貴，就和比較便宜的情況寫在同一個地方。', en: 'We put the numbers that cut against us first: where an electric scooter costs more, it is said in the same place as where it costs less.' },
      { 'zh-TW': '我們不叫任何人硬換車，也不怪騎車的人：大家都在同一團廢氣裡。', en: 'We tell nobody to switch regardless, and we do not blame riders: everyone is in the same cloud.' },
      { 'zh-TW': '每一個補助金額旁邊，都寫了我們查證的日期。', en: 'Every subsidy amount shows the date we checked it.' },
    ],
    promiseTitle: { 'zh-TW': '量出來是什麼，我們都登出來', en: 'Whatever a measurement shows, we publish it' },
    pledge: {
      'zh-TW': '量出來的結果，不管高低，我們都會登出來。真的有人量了，量到的數字放在推估旁邊；舊的推估留在「怎麼算的」那一頁，不會悄悄拿掉。',
      en: 'Whatever the result, high or low, we will publish it. When someone does measure, the measurement goes beside the estimate, and the old estimate stays on the “How we worked it out” page; it is never quietly removed.',
    },
  },
  method: {
    eyebrow: { 'zh-TW': '方法', en: 'Method' },
    title: { 'zh-TW': '證據怎麼找、|怎麼查', en: 'How the evidence was |gathered and checked' },
    p1: {
      'zh-TW': '這個網站的研究和查核，大部分是用 AI 研究工具做的：它到政府、期刊和媒體的網站下載原始文件，把數字和原文的位置一起記下來。打不開的文件，就照實寫打不開。',
      en: 'Most of the research and checking for this site was done with AI research tools. They downloaded the original documents from government, journal and media websites and recorded each figure with where it appears in the text. Documents that could not be opened are recorded as such.',
    },
    p2: {
      'zh-TW': '每次建置網站，都會自動檢查推估的數字和算法的檔案一致；每一句文案，也要通過一份「不能這樣說」的規則清單。',
      en: 'Every time the site is built, it checks automatically that the estimate’s figures match the files of its working, and every sentence of copy must pass a list of “do not say” rules.',
    },
    levels: { 'zh-TW': '每一筆資料，都有一個查核等級：', en: 'Every fact carries a level of checking:' },
    checked: {
      'zh-TW': '補助資料最近一次查核：{money}。',
      en: 'Subsidy data last checked: {money}.',
    },
    sources: { 'zh-TW': '所有出處', en: 'Every source' },
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
      'zh-TW': '最新的在最上面。每一條寫明：原來的說法、我們改成怎麼說、為什麼。',
      en: 'Newest first. Each entry says what was said, what we say instead, and why.',
    },
    said: { 'zh-TW': '原來的說法', en: 'What was said' },
    saidSr: { 'zh-TW': '我們不再這樣說：', en: 'We no longer say: ' },
    instead: { 'zh-TW': '我們的說法', en: 'What we say' },
    why: { 'zh-TW': '為什麼', en: 'Why' },
    basis: { 'zh-TW': '根據', en: 'Based on' },
    ours: { 'zh-TW': '本站自己改過的', en: 'Our own correction' },
    common: { 'zh-TW': '常見的說法', en: 'A common claim' },
    /** What was said. Struck through on the page; each is refused by the entry below it. */
    claims: {
      'crossings-measured': {
        'zh-TW': '本站以前寫：行人在台灣路口吸到的一氧化碳和 PM2.5，還沒有任何量測。',
        en: 'This site used to say that there were no readings at all of the carbon monoxide and PM2.5 that pedestrians breathe at Taiwanese crossings.',
      },
      'iot-94': { 'zh-TW': '行人專用時相，讓行人少吸 94% 的 PM2.5。', en: 'Scramble crossings cut what pedestrians breathe by 94 per cent.' },
      'pm25-source': { 'zh-TW': '機車是 PM2.5 的主要來源。', en: 'Scooters are a main source of PM2.5.' },
      'ev-cheaper': { 'zh-TW': '電動機車一定比較省。', en: 'An electric scooter is always cheaper to run.' },
      densest: { 'zh-TW': '台灣的機車密度世界第一。', en: 'Taiwan has the world’s highest scooter density.' },
      'netzero-2035': { 'zh-TW': '2035 年起，新機車全部要是電動的。', en: 'From 2035 every new scooter must be electric.' },
      'child-44': { 'zh-TW': '小孩比大人多吸 44% 的污染。', en: 'Children breathe 44% more pollution than adults.' },
      'ev-zero': { 'zh-TW': '電動機車零污染。', en: 'Electric scooters are zero-pollution.' },
      'idling-legal': { 'zh-TW': '等紅燈不熄火，是違規的。', en: 'Idling at a red light is illegal.' },
      'ufp-smell': { 'zh-TW': '超細微粒聞不到。', en: 'Ultrafine particles have no smell.' },
      'no-2027': { 'zh-TW': '2027 年的補助，什麼都還沒公布。', en: 'Nothing at all has been announced for 2027.' },
    },
    /** For the entries that correct our own earlier wording (not a claim-policy rule). */
    ownInstead: {
      'crossings-measured': {
        'zh-TW': '交通部運輸研究所在路口的行人等候區量過一氧化碳和 PM2.5。網站現在把這些量測，和本站自己的推估放在一起。',
        en: 'The Institute of Transportation has measured carbon monoxide and PM2.5 in the pedestrian waiting areas of junctions. The site now shows those readings beside its own estimate.',
      },
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
      'crossings-measured': {
        'zh-TW': '運研所的報告裡有等候區的量測結果，舊的說法不對。另外，「紅燈時站在機車旁邊吸到多少」，現在改成本站的推估，標明是算的。',
        en: 'The Institute’s report gives the waiting-area readings, so the old wording was wrong. “How much you breathe beside the scooters at a red light” is now this site’s estimate, labelled as worked out.',
      },
      'ufp-smell': {
        'zh-TW': '「聞不到」要有出處。一氧化碳有世界衛生組織的說明；超細微粒沒有。',
        en: '“Cannot be smelled” needs a source. For carbon monoxide the WHO says so; for ultrafine particles we found nothing checked.',
      },
      'no-2027': {
        'zh-TW': '「沒有公布」和「沒有定案」不一樣：已經有一份草案預告了，只是還沒定。',
        en: '“Not announced” and “not confirmed” are different: a draft has been pre-announced, but nothing is final.',
      },
    },
  },
  toc: [
    { id: 'who', label: { 'zh-TW': '誰做的', en: 'Who made it' } },
    { id: 'chips', label: { 'zh-TW': '數字的標記', en: 'Labels' } },
    { id: 'estimate', label: { 'zh-TW': '推估', en: 'The estimate' } },
    { id: 'rules', label: { 'zh-TW': '編輯規則', en: 'Rules' } },
    { id: 'method', label: { 'zh-TW': '方法', en: 'Method' } },
    { id: 'report', label: { 'zh-TW': '回報錯誤', en: 'Report an error' } },
    { id: 'corrections', label: { 'zh-TW': '修改紀錄', en: 'Corrections' } },
  ],
});
