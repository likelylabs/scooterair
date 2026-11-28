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
      'zh-TW': '誰做的這個網站？每個數字旁邊的標記是什麼意思？推估怎麼來的？這裡還有我們給自己的規則、怎麼回報錯誤，以及修改紀錄。',
      en: 'Who made the site? What does the label beside every number mean? Where does the estimate come from? Here too are the rules we hold ourselves to, how to report an error, and the corrections log.',
    },
  },
  hero: {
    eyebrow: { 'zh-TW': '關於', en: 'About' },
    title: { 'zh-TW': '這個網站|是什麼', en: 'What this |site is' },
    deck: {
      'zh-TW': '我們整理兩件事。一是等紅燈的時候，旁邊機車的廢氣有多少、對身體有什麼影響。二是換一輛電動機車，實際要花多少錢。',
      en: 'We set out two things. One is how much exhaust the scooters beside you add at a red light, and what it does to the body. The other is what an electric scooter really costs.',
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
      'zh-TW': '我們用公開的資料來算。定檢讀數告訴我們，一輛機車停著、引擎沒熄火時排多少。運研所的錄影告訴我們，一個紅燈停幾輛。測站和現場量測告訴我們路邊的風。算出來的是一個範圍，標成「推估」。',
      en: 'We work from published data. Inspection readings tell us how much a scooter gives off standing still with its engine running. The Institute of Transportation’s video counts tell us how many stop at one red light. Weather stations and on-site readings tell us the wind at the kerb. The result is a range, labelled “estimate”.',
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
      { 'zh-TW': '說清楚是什麼的量、在哪裡：機車「多出來」的和街上原本就有的分開寫；推估指的是大人鼻子的高度、90 秒的平均。', en: 'We say what the amount is and where it applies. What the scooters add is kept apart from what the street already holds. The estimate is for an adult’s nose, averaged over 90 seconds.' },
      { 'zh-TW': '不拿「幾倍」當標題，不說等一個紅燈就會生病，也不印比證據更大的數字。', en: 'No “so many times more” headlines, no claim that one red light makes you ill, and no figure bigger than the evidence.' },
      { 'zh-TW': '健康研究講的多半是所有車輛的廢氣，不只機車；我們每次都寫出來。', en: 'Health studies are mostly about exhaust from all traffic, not scooters alone, and we say so every time.' },
      { 'zh-TW': '對我們不利的數字，我們先講。電動機車在有些條件下比較貴；這和比較便宜的情況，寫在同一個地方。', en: 'We put the numbers that cut against us first: where an electric scooter costs more, it is said in the same place as where it costs less.' },
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
      'zh-TW': '這個網站的研究和查核，大部分是用 AI 研究工具做的。它到政府、期刊和媒體的網站下載原始文件。它把數字和原文的位置一起記下來。打不開的文件，就照實寫打不開。',
      en: 'Most of the research and checking for this site was done with AI research tools. They downloaded the original documents from government, journal and media websites and recorded each figure with where it appears in the text. Documents that could not be opened are recorded as such.',
    },
    p2: {
      'zh-TW': '每次更新網站，電腦都會自動檢查：推估的數字，和算法的檔案對得起來。網站上的每一句話，也要通過一份「不能這樣說」的規則清單。',
      en: 'Every time the site is built, it checks automatically that the estimate’s figures match the files of its working. Every sentence of copy must also pass a list of “do not say” rules.',
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
      'zh-TW': '最新的在最上面。每一條寫三件事：以前的說法、哪裡不對、現在怎麼說。',
      en: 'Newest first. Each entry says three things: what was said, what was wrong, and what we say now.',
    },
    said: { 'zh-TW': '以前的說法', en: 'What was said' },
    saidSr: { 'zh-TW': '我們不再這樣說：', en: 'We no longer say: ' },
    wrong: { 'zh-TW': '哪裡不對', en: 'What was wrong' },
    now: { 'zh-TW': '現在怎麼說', en: 'What we say now' },
    basis: { 'zh-TW': '看出處', en: 'See the sources' },
    ours: { 'zh-TW': '本站自己改過的', en: 'Our own correction' },
    common: { 'zh-TW': '常見的說法', en: 'A common claim' },
    /** What was said. Struck through on the page. */
    claims: {
      'co-main-path': {
        'zh-TW': '本站的主要頁面，把一氧化碳和世界衛生組織的指引值放在最前面：首頁寫「臭是真的。一氧化碳沒味道；等一個紅燈，仍低於指引值」。',
        en: 'The site’s main pages put carbon monoxide and the WHO guideline up front: the home page said “The smell is real. Carbon monoxide has no smell. Waiting one red light, it stays below the WHO guideline”.',
      },
      'smell-not-petrol': {
        'zh-TW': '本站以前寫，那個味道來自汽油沒燒完的部分。同一段也寫了苯的致癌分類，卻沒寫分類的意思。',
        en: 'This site used to say the smell came from petrol that had not burnt. The same passage gave benzene’s cancer label without saying what the label means.',
      },
      'sim-guideline': {
        'zh-TW': '本站以前寫：一氧化碳比指引值低很多，是好消息。一秒一秒的高點和嬰兒車的高度，我們沒有給數字。',
        en: 'This site used to say carbon monoxide was far below the guideline, which was good news, and gave no figure for second-by-second highs or for pushchair height.',
      },
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
    /**
     * What was wrong, in plain words. The facts behind each entry are listed under it (from
     * src/components/pages/action/corrections.ts and the claims-policy rule it names).
     * {tokens} are filled from the registry on the page.
     */
    wrongText: {
      'co-main-path': {
        'zh-TW': '數字沒有錯，但放錯了地方。等一個紅燈，一氧化碳低於指引值（推估）；例外只有嬰兒車連續 15 分鐘停在排氣管正後方、幾乎沒風的少見情形。把它放在最前面，讓人以為「低於指引值」就是整個答案，也讓人搞不清楚它和那個味道的關係。用來比排出量的那個比法，也讓人看不懂。',
        en: 'The figures were right, but in the wrong place. Waiting one red light keeps carbon monoxide below the guideline (estimate); the only exception is the rare case of a pushchair right behind a tailpipe, in almost no wind, for 15 minutes. Putting it first made “below the guideline” look like the whole answer, and blurred how it relates to the smell. The comparison used for the amount given off was hard to follow too.',
      },
      'smell-not-petrol': {
        'zh-TW': '我們用電腦把味道和每一種成分一起算過（推估）。在一群機車的情況裡，苯從來沒有濃到它自己聞得出來；那個味道比較可能來自燃燒產生的醛類，只能粗略估計，可能差到十倍左右。沒燒完的汽油蒸氣，我們沒有另外算。這兩件事寫在同一段，讀起來就把兩件不同的事混在一起了。',
        en: 'We worked out the smell and each chemical together (an estimate). In the cases with a group of scooters, benzene never gets strong enough to be smelled itself; the smell more likely comes from aldehydes formed by burning, though only the order of magnitude can be estimated. Unburnt petrol vapour was not worked out separately. Putting the two in one passage ran two different things together.',
      },
      'sim-guideline': {
        'zh-TW': '對等一個紅燈的人，用 15 分鐘平均來看，這句話還是對的，但說得太廣。我們用電腦把一個紅燈算了一遍。靠近排氣管時，一氧化碳是一陣一陣的。風從機車吹來時，嬰兒車高度可能比較多（不是每種風都這樣）。在路口待上一小時、風一直從機車吹來的人，苯可能是加州 1 小時參考值的 1 到 4 倍（推估；這個參考值是用 6 小時的資料訂的，機車廢氣裡有多少苯可能差到 5 到 10 倍；這不是在說等一個紅燈的人）。舊範圍最高的數字，也不是最糟的紅燈。',
        en: 'For someone waiting one red, averaged over 15 minutes, it still holds, but it said too much. We simulated one red light on a computer. Near a tailpipe, carbon monoxide comes in bursts. With the wind from the scooters, pushchair height can get more (not in every wind). For people who stay an hour at a junction with the wind always from the scooters, benzene can be about 1 to 4 times California’s 1-hour reference level (estimate; that reference was set from 6-hour data, scooter exhaust’s benzene share could be off five- to ten-fold, and this is not about someone waiting one red). The top of the old range is not the worst red either.',
      },
      'crossings-measured': {
        'zh-TW': '交通部運輸研究所其實量過路口行人等候區的一氧化碳和 PM2.5。我們漏看了。',
        en: 'The Institute of Transportation had in fact measured carbon monoxide and PM2.5 in the pedestrian waiting areas of junctions. We missed it.',
      },
      'iot-94': {
        'zh-TW': '這個數字只出現在高雄一個路口、電腦推算的一天。報告自己說，這一天不正常。而且這是電腦推算的，不是在路口量的。',
        en: 'That figure comes from one day worked out by computer at one Kaohsiung junction, and the report itself calls that day an outlier. And it is a computer result, not a reading at a real junction.',
      },
      'pm25-source': {
        'zh-TW': '照環境部的排放清冊，機車排的 PM2.5 只占全國的 {pm25}。',
        en: 'By the environment ministry’s inventory, scooters give off only {pm25} of the country’s PM2.5.',
      },
      'ev-cheaper': {
        'zh-TW': '能在家插電的車，電費比油錢便宜很多。但這種車，我們只找到一家廠商的兩款。大多數車要付換電月租；騎得少的人，月租比油錢貴。',
        en: 'A scooter you can plug in at home costs far less in electricity than petrol, but we found only two such models, from one maker. Most need a battery-swap plan, and for people who ride little the plan costs more than petrol.',
      },
      densest: {
        'zh-TW': '這個說法只靠一份非官方、沒寫年份的排名，台灣只比第二名多一點點。',
        en: 'It rests on one unofficial ranking with no year on it, and Taiwan is only just ahead of second place.',
      },
      'netzero-2035': {
        'zh-TW': '淨零路徑訂的是目標，沒有禁止賣燃油機車。',
        en: 'The net-zero pathway sets targets for sales. Nothing in it stops the sale of petrol scooters.',
      },
      'child-44': {
        'zh-TW': '這個數字，是英國一個實驗裡最高的一個。它量的是嬰兒車高度的空氣，不是小孩比大人多吸多少。',
        en: 'That figure is the highest one in a single UK experiment. It is about the air at stroller height, not how much more a child breathes than an adult.',
      },
      'ev-zero': {
        'zh-TW': '電動機車沒有排氣管，但輪胎、煞車和路上的灰塵還是有微粒。把發電也算進來，有一項研究發現硫氧化物比較多。',
        en: 'An electric scooter has no tailpipe, but tyres, brakes and road dust still give off particles. Counting the power stations too, one study found more sulphur oxides.',
      },
      'idling-legal': {
        'zh-TW': '現在的規定，管的是停下來等超過三分鐘的車。因為交通管制而停下來的，不算。它管不管機車，官方也沒有說明。',
        en: 'The current rule covers vehicles stopped for more than three minutes, and stops for traffic control do not count. There is no official word on whether it covers scooters.',
      },
      'ufp-smell': {
        'zh-TW': '「聞不到」要有出處。超細微粒聞不聞得到，我們找不到查證過的資料。',
        en: '“Cannot be smelled” needs a source. We found no checked source on whether ultrafine particles can be smelled.',
      },
      'no-2027': {
        'zh-TW': '環境部已經預告了一份草案，要延長一筆汰舊換新的補助，只是還沒定案。',
        en: 'The environment ministry has already pre-announced a draft that would extend one scrappage payment; it is just not final.',
      },
    },
    /** What we say now, in plain words. */
    nowText: {
      /** {times} is the EstimateValue of sim.benzene.stay1hTimes; {h} {lo} {hi} its basis and doubt. */
      'co-main-path': {
        'zh-TW': '主要頁面不再談一氧化碳。首頁講聞得到的味道、跟著味道一起來的苯和其他成分、聞得到時苯有多少，還有在路口待上一小時的人：風一直從機車吹來時，苯可能是美國加州 1 小時參考值的{times}（推估；這個參考值是用 {h} 小時的資料訂的；機車廢氣裡有多少苯，可能差到 {lo} 到 {hi} 倍；風要整整一小時都這樣吹，很少見；超過參考值，不等於證明有害；這不是在說等一個紅燈的人）。一氧化碳的推估和電腦算的結果，完整留在「怎麼算的」那一頁，量用公克表示。',
        en: 'The main pages no longer discuss carbon monoxide. The home page covers the smell, the benzene and other chemicals that come with it, how much benzene there is when you can smell it, and people who stay at the junction for an hour: with the wind always from the scooters, their benzene can be {times} California’s 1-hour reference level (estimate; that reference was set from {h}-hour data; how much benzene scooter exhaust holds could be off {lo}- to {hi}-fold; the wind must hold for the whole hour, which is rare; being above a reference level is not proof of harm; this is not about someone waiting one red). The carbon monoxide estimate and the simulation’s results stay in full on the ‘How we worked it out’ page, with amounts in grams.',
      },
      'smell-not-petrol': {
        'zh-TW': '聞到的不是苯，但苯跟著一起來（推估）：只要那個味道來自身旁機車的廢氣，同一口空氣裡就有苯。聞不到，不代表空氣乾淨。苯、1,3-丁二烯、甲醛的致癌分類另外寫，寫出分類的意思，也寫出汽油引擎廢氣整體是第2B類。',
        en: 'What you smell is not benzene, but benzene comes with it (estimate): whenever the smell is the exhaust of the scooters beside you, benzene is in the same breath of air. No smell does not mean clean air. The cancer labels of benzene, 1,3-butadiene and formaldehyde are given separately, with what the groups mean and with petrol-engine exhaust’s own Group 2B.',
      },
      'sim-guideline': {
        'zh-TW': '推估：在一般的街上等一個紅燈，一氧化碳的 15 分鐘平均多{range}，比世界衛生組織的指引值低很多；排氣管正後方、幾乎沒風時，最多約 {near} ppm。例外是嬰兒車停在排氣管正後方約半公尺，幾乎沒風、風向不變，連續 15 分鐘每個紅燈都在：這時 15 分鐘的平均，可能超過世界衛生組織 15 分鐘的指引值（這樣的 15 分鐘，約十次有一到兩次；這種風很少見，信心低）；往旁邊移開半公尺，就沒有了。其他的數字，都在「怎麼算的」那一頁。',
        en: 'Estimate: waiting one red light on an ordinary street adds {range} to your 15-minute carbon monoxide average, far below the WHO guideline; right behind a tailpipe in almost no wind, up to about {near} ppm. The exception is a pushchair half a metre directly behind a tailpipe, in almost no wind that keeps its direction, through every red for 15 minutes: then the 15-minute average can pass the WHO 15-minute guideline (in about 1 or 2 of 10 such periods; such a wind is rare, and confidence is low); half a metre to the side, and it is gone. The other figures are on the ‘How we worked it out’ page.',
      },
      'crossings-measured': {
        'zh-TW': '網站把運研所的量測，和本站自己的推估放在一起。紅燈時站在機車旁邊吸到多少，是本站算的，標著「推估」。',
        en: 'The site shows the Institute’s readings beside our own estimate. How much you breathe beside the scooters at a red light is worked out by us, and labelled Estimate.',
      },
      'iot-94': {
        'zh-TW': '在運研所的電腦推算裡，這個路口其他幾天，PM2.5 少的比例小很多。台北和新北的路口少得更少，有幾天反而變多。',
        en: 'In the Institute’s computer model, the other days at that junction showed much smaller falls. The Taipei and New Taipei junctions fell even less, and on some days PM2.5 rose.',
      },
      'pm25-source': {
        'zh-TW': '機車的問題是一氧化碳、油氣和苯，不是 PM2.5。',
        en: 'The problem with scooters is carbon monoxide, fuel vapour and benzene, not PM2.5.',
      },
      'ev-cheaper': {
        'zh-TW': '划不划算，要看你一個月騎多少、在哪裡充電。「換電動」那一頁可以幫你算。',
        en: 'Whether it pays depends on how far you ride each month and where you charge. The “Go electric” page works it out for you.',
      },
      densest: {
        'zh-TW': '台灣{per100}機車，名列前茅。',
        en: 'Taiwan has {per100} motorcycles: among the highest.',
      },
      'netzero-2035': {
        'zh-TW': '目標是 {y1} 年新機車裡電動占 {t1}，{y2} 年占 {t2}。這是目標，不是預測。',
        en: 'The targets are an electric share of new scooters of {t1} in {y1} and {t2} in {y2}. They are targets, not forecasts.',
      },
      'child-44': {
        'zh-TW': '小孩離地面比較近，有些污染物在低的地方比較濃；小孩呼吸也比大人快。我們不寫國外量到的「多幾成」。本站的電腦推估是：風從機車吹來時，嬰兒車高度和大人鼻子差不多到兩倍；不是每種風都這樣。',
        en: 'Children are closer to the ground, where some pollutants are thicker, and they breathe faster than adults. We do not quote a “per cent more” from studies abroad. Our own computer estimate: with the wind from the scooters, pushchair height gets between about the same as an adult’s nose and about twice as much. Not in every wind.',
      },
      'ev-zero': {
        'zh-TW': '換一輛電動機車，路口就少一根排氣管；但它也不是完全沒有污染。',
        en: 'Each electric scooter means one tailpipe fewer at the crossing; but it still gives off some pollution.',
      },
      'idling-legal': {
        'zh-TW': '等一個普通的紅燈，不在這條規定要管的範圍裡，我們也不這樣寫。',
        en: 'An ordinary red light is not what this rule is written for, and we do not say it is.',
      },
      'ufp-smell': {
        'zh-TW': '我們只說一氧化碳沒有味道；路邊那麼少的苯，也不太聞得出來。微粒，我們只說它太小、看不到。',
        en: 'We say only that carbon monoxide has no smell, and that the little benzene at the roadside is unlikely to be noticed by smell. Of particles we say only that they are too small to see.',
      },
      'no-2027': {
        'zh-TW': '2027 年的補助還沒有確定。',
        en: 'Nothing is settled yet for 2027.',
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
