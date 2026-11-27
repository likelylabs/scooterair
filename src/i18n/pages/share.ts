// Share cards (brief 7.9, 8.3): the words on the generated images, their alt text, and the
// title and one-sentence description a link preview prints under the image.
//
// A card is a poster seen at thumbnail size: one picture that fills it, one short headline
// (Chinese: 10 characters or fewer; English: 6 words or fewer), the site name small, and the
// small 示意圖 plate. No numbers on a card: the page carries the numbers, their 推估 marks and
// their caveats. '|' marks where a headline may break.

import { copy } from './_copy.ts';

export default copy({
  /** The headline on each card (src/lib/share-cards.ts maps card ids to these). */
  title: {
    home: { 'zh-TW': '那個味道，|你也聞過', en: 'You know |that smell' },
    brief: { 'zh-TW': '排氣管|離小孩一兩步', en: 'A step or two |from children' },
    act: { 'zh-TW': '不換車，|也有事可以做', en: 'What you |can do today' },
    film: { 'zh-TW': '一個紅燈', en: 'One red light' },
    money: { 'zh-TW': '換電動，|要花多少？', en: 'Going electric: |what does it cost?' },
    smell: { 'zh-TW': '那個味道|是什麼？', en: 'What is |that smell?' },
    'my-child': { 'zh-TW': '我的小孩呢？', en: 'What about |my child?' },
    app: { 'zh-TW': 'App 為什麼|看不出來？', en: 'Why the air app |misses it' },
    'one-red-light': { 'zh-TW': '等一個紅燈|有差嗎？', en: 'One red light. |Does it matter?' },
    rider: { 'zh-TW': '騎車的人呢？', en: 'And the rider?' },
    'beside-me': { 'zh-TW': '站遠一點|有用嗎？', en: 'Does stepping |back help?' },
    mask: { 'zh-TW': '口罩擋得住|廢氣嗎？', en: 'Does a mask |stop exhaust?' },
    'how-much': { 'zh-TW': '一排機車，|多了多少？', en: 'How much does |one row add?' },
  },
  /**
   * What each picture shows, plainly, for the image's alt text (og:image:alt). Every one says
   * it is an illustration.
   */
  picture: {
    kerb: {
      'zh-TW': '示意圖：紅燈亮著，家長推著嬰兒車，小學生摀著口鼻，站在路邊。機車的排氣管離他們一兩步，排出的廢氣飄到他們身邊。',
      en: 'Illustration: the light is red. A parent with a pushchair and a schoolchild covering their nose wait at the kerb. A scooter’s tailpipe is a step or two away, and its exhaust drifts around them.',
    },
    smell: {
      'zh-TW': '示意圖：小學生摀著口鼻，站在路邊，旁邊機車排出的廢氣飄過來。',
      en: 'Illustration: a schoolchild at the kerb covers their nose as exhaust drifts over from the scooter beside them.',
    },
    child: {
      'zh-TW': '示意圖：家長推著嬰兒車，停在機車排氣管旁邊。寶寶的臉和廢氣差不多高。',
      en: 'Illustration: a parent stops a pushchair beside a scooter’s tailpipe. The baby’s face is at about the height of the exhaust.',
    },
    station: {
      'zh-TW': '示意圖：空氣品質測站的進氣口在高高的管子上；機車的廢氣在下面，在行人和嬰兒車的高度。',
      en: 'Illustration: an air-quality station’s inlet sits high on a pipe; the scooters’ exhaust stays down low, around the people and the pushchair.',
    },
    signal: {
      'zh-TW': '示意圖：行人號誌是紅燈，倒數 {red} 秒。大人、小孩和長輩在路邊等，旁邊是一排機車。',
      en: 'Illustration: the pedestrian signal is red, counting down from {red}. An adult, a child and an older woman wait at the kerb beside a row of scooters.',
    },
    rider: {
      'zh-TW': '示意圖：兩台機車一前一後等紅燈。前面那台的廢氣，正對著後面騎車的人。',
      en: 'Illustration: two scooters wait at the light, one behind the other. The exhaust of the one in front blows straight at the rider behind.',
    },
    distance: {
      'zh-TW': '示意圖：一個大人牽著小孩，站得離機車遠一點；一位長輩站在排氣管旁邊。',
      en: 'Illustration: an adult holding a child’s hand stands back from the scooters; an older woman stands next to a tailpipe.',
    },
    mask: {
      'zh-TW': '示意圖：一個戴醫用口罩的人。排氣管排出的氣體穿過口罩，一些微粒停在口罩上。',
      en: 'Illustration: a person in a surgical mask. The gases from a tailpipe pass through the mask; some particles stop on it.',
    },
    pack: {
      'zh-TW': '示意圖：路邊停滿三排機車，廢氣飄到旁邊等紅燈的長輩、家長、嬰兒車和小學生身邊。',
      en: 'Illustration: three rows of scooters fill the box, and their exhaust drifts around an older woman, a parent with a pushchair and a schoolchild waiting at the kerb.',
    },
    electric: {
      'zh-TW': '示意圖：同一個路口，機車都換成電動的。行人號誌是綠燈，畫面裡沒有廢氣。',
      en: 'Illustration: the same crossing with every scooter electric. The pedestrian light is green, and there is no exhaust in the picture.',
    },
    fix: {
      'zh-TW': '示意圖：一排機車等紅燈，其中一台沒保養好，排出的廢氣比旁邊的多很多。',
      en: 'Illustration: a row of scooters at the light. One of them is badly kept, and puts out far more exhaust than the others.',
    },
    film: {
      'zh-TW': '短片的畫面（示意圖）：紅燈倒數 {red} 秒，三排機車停在路邊的家長、嬰兒車和小學生旁邊；中間有播放鍵。',
      en: 'A still from the film (illustration): the red light counts down from {red}, three rows of scooters beside a parent, a pushchair and a schoolchild; a play button in the middle.',
    },
    heights: {
      'zh-TW': '示意圖：家長推著嬰兒車，旁邊是小學生和一台機車，一條虛線標出一公尺。排氣管和寶寶都在虛線下面。',
      en: 'Illustration: a parent with a pushchair, a schoolchild and a scooter side by side, with a dashed line at one metre. The tailpipe and the baby are both below it.',
    },
  },
  /** The alt text: the headline, then the picture. */
  alt: { 'zh-TW': '{title}{picture}', en: '{title} {picture}' },
  /**
   * The title and one-sentence description of a link to each page (og:title, og:description).
   * A question page uses its own question and one-sentence answer instead.
   */
  og: {
    home: {
      title: { 'zh-TW': '等紅燈的時候，我們吸進了什麼', en: 'What we breathe at the red light' },
      description: {
        'zh-TW': '旁邊機車的廢氣有多少、對身體有什麼影響、換電動要多少錢，一張圖講一件事。',
        en: 'What the scooters beside you add at a red light, what it does to the body and what going electric costs, one picture at a time.',
      },
    },
    about: {
      title: { 'zh-TW': '關於這個網站', en: 'About this site' },
      description: { 'zh-TW': '誰做的、數字旁的標記是什麼意思、推估怎麼來的，還有修改紀錄。', en: 'Who made it, what the labels beside the numbers mean, where the estimate comes from, and the corrections log.' },
    },
    act: {
      title: { 'zh-TW': '我能做什麼', en: 'What you can do' },
      description: { 'zh-TW': '走路的人、家長、騎車的人、學校和民意代表，各自做得到的一件事，還有寫好的信。', en: 'One thing each for people who walk, parents, riders, schools and officials, with letters ready to send.' },
    },
    electric: {
      title: { 'zh-TW': '換電動，要花多少？', en: 'What does going electric cost?' },
      description: { 'zh-TW': '各縣市的補助、電費、電池月租和油錢，一行一行算給你看。', en: 'Subsidies in every city and county, plus charging, battery plans and petrol, worked out line by line.' },
    },
    estimate: {
      title: { 'zh-TW': '一排機車，路邊多了多少？', en: 'How much does a row of scooters add?' },
      description: { 'zh-TW': '本站的推估、一步一步的算法，和每個數字的出處。', en: 'Our estimate, the working step by step, and where every input comes from.' },
    },
    evidence: {
      title: { 'zh-TW': '證據鏈，一環一環看', en: 'The chain, link by link' },
      description: { 'zh-TW': '機車廢氣和路口行人之間的每一環：誰量了什麼，量到多少。', en: 'Every link between scooter exhaust and the people at the crossing: who measured what, and what they found.' },
    },
    sources: {
      title: { 'zh-TW': '資料來源', en: 'Sources' },
      description: { 'zh-TW': '網站用到的每一個來源，都有原文連結，和我們拿它來說明什麼。', en: 'Every source the site uses, with a link to the original and what we use it for.' },
    },
    questions: {
      title: { 'zh-TW': '路口的七個問題', en: 'Seven questions at the crossing' },
      description: { 'zh-TW': '那個味道是什麼、小孩呢、口罩擋得住嗎：每一題一張圖，一句話回答。', en: 'What the smell is, what about a child, whether a mask helps: one picture and one sentence each.' },
    },
    film: {
      title: { 'zh-TW': '短片：一個紅燈', en: 'Film: one red light' },
      description: { 'zh-TW': '一段動畫：機車停下來，廢氣排在膝蓋的高度；換成電動，那一層就沒有了。', en: 'An animation: the scooters stop and their exhaust comes out at knee height; make them electric and that layer is gone.' },
    },
  },
  /** The small plate on every card. */
  tag: { 'zh-TW': '示意圖', en: 'Illustration' },
});
