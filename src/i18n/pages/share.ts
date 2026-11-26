// Share cards (brief 7.9, 8.3): the words inside the generated images, and nowhere else.
// One picture and one line per card. A card with an estimated number carries 推估 and its range
// inside the image (the number itself is filled from src/data/estimate.ts). Tokens in {braces}
// are filled by src/lib/share-cards.ts; never type a number here.

import { copy } from './_copy.ts';

export default copy({
  /** The default card (home page, /about/): the opening screen and the kerb estimate. */
  home: {
    kicker: { 'zh-TW': '一個紅燈', en: 'One red light' },
    title: { 'zh-TW': '那個味道，|你也聞過', en: 'You know |that smell' },
    line: { 'zh-TW': '這排機車多出來的一氧化碳', en: 'Carbon monoxide added by these scooters' },
  },
  /** The site's general card (/evidence/, /sources/, /questions/): the sentence to repeat. */
  brief: {
    kicker: { 'zh-TW': '等紅燈的時候', en: 'At the red light' },
    title: { 'zh-TW': '排氣管離小孩|只有一兩步', en: 'The tailpipes are |a step or two from a child' },
  },
  /** /act/ */
  act: {
    kicker: { 'zh-TW': '我能做什麼', en: 'What I can do' },
    title: { 'zh-TW': '不換車，|也有事可以做', en: 'Not switching yet? |There is still a lot to do' },
    line: {
      'zh-TW': '準時定檢、該修就修。口罩擋不住廢氣裡的氣體，別站在車陣正後方。',
      en: 'Get inspected on time and fix what fails. A mask does not stop the gases in exhaust, so do not stand right behind the pack.',
    },
  },
  /** /90/ (brief 8.3) */
  film: {
    kicker: { 'zh-TW': '短片', en: 'Film' },
    title: { 'zh-TW': '一個紅燈', en: 'One red light' },
    line: {
      'zh-TW': '紅燈那 90 秒，一整排機車的廢氣就排在膝蓋的高度；換成電動的，那一層就沒有了。',
      en: 'For ninety seconds of red, a whole row of scooters puts its exhaust out at knee height. Make them electric and that layer is gone.',
    },
    caveat: {
      'zh-TW': '畫面是示意圖；多了多少，依本站推估，不是實測。',
      en: 'The picture is an illustration. How much is added follows this site’s estimate, not a measurement.',
    },
  },
  /** /electric/ and the old /questions/electric/ address: the money card. */
  money: {
    kicker: { 'zh-TW': '換電動', en: 'Go electric' },
    title: { 'zh-TW': '電動機車|要多少錢？', en: 'What does an electric |scooter cost?' },
    cheaper: { 'zh-TW': '補助扣完，{county}報廢出廠滿 10 年的機車、換電動，比買新的燃油機車少付 {amount}。', en: 'After subsidies, in {county} scrapping a scooter built 10 or more years ago, an electric one costs {amount} less than a new petrol one.' },
    same: { 'zh-TW': '補助扣完，{county}報廢出廠滿 10 年的機車、換電動，和買新的燃油機車差不多錢。', en: 'After subsidies, in {county} scrapping a scooter built 10 or more years ago, an electric one costs about the same as a new petrol one.' },
    dearer: { 'zh-TW': '補助扣完，{county}報廢出廠滿 10 年的機車、換電動，還是比燃油機車多付 {amount}。', en: 'After subsidies, in {county} scrapping a scooter built 10 or more years ago, an electric one still costs {amount} more than a petrol one.' },
    worst: { 'zh-TW': '條件不同，也有人多付 {amount}。', en: 'On other terms, some pay {amount} more.' },
    caveat: { 'zh-TW': '價格和補助是 {date}查的。用網站上的計算機，算你自己的。', en: 'Prices and subsidies checked {date}. Work out your own on the site.' },
  },
  questionKicker: { 'zh-TW': '問題', en: 'Questions' },
  /** The question pages (brief 7.5). Titles are the questions; the line is the one-sentence answer. */
  questions: {
    smell: {
      title: { 'zh-TW': '那個味道|是什麼？', en: 'What is |that smell?' },
      line: { 'zh-TW': '臭的是沒燒完的汽油和刺鼻的醛類。一氧化碳和微粒沒有味道。', en: 'The smell is unburnt petrol and sharp aldehydes. Carbon monoxide and particles have no smell.' },
    },
    'my-child': {
      title: { 'zh-TW': '我的小孩呢？', en: 'What about |my child?' },
      line: {
        'zh-TW': '排氣管和嬰兒車裡的寶寶，都不到一公尺高。照體重算，小孩吸進的空氣是大人的 {lo} 到 {hi} 倍。',
        en: 'The tailpipe and a baby in a pushchair are both less than a metre off the ground. For their body weight, children breathe {lo} to {hi} times as much air as adults.',
      },
    },
    app: {
      title: { 'zh-TW': '空氣品質 App|為什麼|看不出來？', en: 'Why doesn’t |the air app show it?' },
      line: {
        'zh-TW': '測站的進氣口比人高，一小時才報一次；紅燈只有 {red} 秒，廢氣排在一公尺以下。',
        en: 'Station inlets sit above head height and report once an hour; a red light lasts {red} seconds, and the exhaust comes out below a metre.',
      },
    },
    'one-red-light': {
      title: { 'zh-TW': '等一個紅燈|有差嗎？', en: 'Does one red light |make a difference?' },
      line: {
        'zh-TW': '一個紅燈很短，可是天天都要等：一天等四個紅燈，一年就在路邊站了 {lo} 到 {hi} 小時。',
        en: 'One red light is short, but you wait at one every day: four a day add up to {lo} to {hi} hours a year at the kerb.',
      },
    },
    rider: {
      title: { 'zh-TW': '騎車的人呢？', en: 'And the rider?' },
      line: { 'zh-TW': '騎車的人，也在這一團裡。這不是誰的錯，大家都在同一團廢氣裡。', en: 'The rider is in the cloud too. This is nobody’s fault: everyone at the junction is in the same cloud.' },
    },
    'beside-me': {
      title: { 'zh-TW': '站遠一點|有用嗎？', en: 'Does standing back |help?' },
      line: { 'zh-TW': '離排氣管遠一點，通常比較淡；差多少要看風，沒有準確的數字。', en: 'Further from the tailpipe it is usually thinner. How much depends on the wind; there is no exact figure.' },
    },
    mask: {
      title: { 'zh-TW': '口罩擋得住|廢氣嗎？', en: 'Does a mask |stop exhaust?' },
      line: {
        'zh-TW': '醫用口罩擋不住機車廢氣：一氧化碳和苯是氣體，一般口罩擋不住氣體。',
        en: 'A surgical mask won’t stop scooter exhaust: carbon monoxide and benzene are gases, and ordinary masks do not stop gases.',
      },
    },
    'how-much': {
      title: { 'zh-TW': '旁邊停|一排機車，|路邊多多少？', en: 'How much does a row |of scooters add?' },
      line: { 'zh-TW': '這排機車多出來的一氧化碳', en: 'Carbon monoxide added by these scooters' },
    },
  },
  /** Shared words on the cards. */
  alt: { 'zh-TW': '{title}{line}（圖上小字：{caveat}）{note}', en: '{title} {line} (Note on the card: {caveat}) {note}' },
});
