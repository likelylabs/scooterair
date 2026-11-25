// /questions/ — the eight question pages (blueprint 4.2). Seeded by the system workstream
// with what the share cards need (question, one-line answer, the caveat line that goes INSIDE
// the image, badges, home chapter); the questions workstream adds each page's body copy here.
//
// Chinese questions and answers are the blueprint's, verbatim. `badges` and `link` are data,
// not copy: the guard only reads the { 'zh-TW', en } leaves.

import { copy } from './_copy.ts';
import type { EvidenceKind } from '../ui.ts';

const item = <T extends { badges: EvidenceKind[]; link: number }>(x: T) => x;

export default copy({
  index: {
    title: { 'zh-TW': '路口的八個問題', en: 'Eight questions at the crossing' },
    answerLabel: { 'zh-TW': '一句話回答', en: 'The short answer' },
  },
  items: {
    smell: item({
      q: { 'zh-TW': '為什麼那麼臭？', en: 'Why does it smell so bad?' },
      answer: {
        'zh-TW': '聞到那股味道，代表你站在廢氣裡。到底是哪幾種成分在臭，老實說沒有人鑑定過；比較可能的是醛類，十億分之幾就聞得到。',
        en: 'The smell means you are standing in exhaust. Which compounds make it, honestly, nobody has identified; aldehydes are the likelier candidates, detectable at a few parts per billion.',
      },
      caveat: { 'zh-TW': '味道重不代表傷害大，沒味道也不代表沒事。', en: 'A strong smell does not mean more harm, and no smell does not mean none.' },
      badges: ['gap', 'international'],
      link: 4,
    }),
    'beside-me': item({
      q: { 'zh-TW': '為什麼剛好排在我旁邊？', en: 'Why does it come out right beside me?' },
      answer: {
        'zh-TW': '因為排氣管就在路面上，而標線規則只要求待轉區的後緣離行人穿越道 50 公分以上。這是下限，不是你家路口實際的距離。',
        en: 'Because the tailpipe is at road level, and the marking rules ask only that the turn box’s rear edge be 50 cm or more from the crosswalk. That is a minimum, not the distance at your crossing.',
      },
      caveat: { 'zh-TW': '50 公分是規定的下限；實際距離每個路口不同。', en: 'Fifty centimetres is the minimum the rule sets; the real distance differs at every crossing.' },
      badges: ['official-tw'],
      link: 2,
    }),
    app: item({
      q: { 'zh-TW': '空品 App 顯示「良好」，是它錯了嗎？', en: 'The air-quality app says “Good”. Is it wrong?' },
      answer: {
        'zh-TW': '它沒有錯。它報的是測站量到的空氣；你站的這個路口，沒有人量過。台北一項通勤研究裡，測站的數字跟得上 PM2.5，跟不上苯類。',
        en: 'It isn’t wrong. It reports the air measured at a station; the crossing you are standing at has not been measured. In one Taipei commuter study, station readings tracked PM2.5 and did not track the benzene family.',
      },
      caveat: { 'zh-TW': '那項研究量的是騎腳踏車和機車的通勤者，不是站在路口的行人，而且只有台北。', en: 'That study measured commuters on bicycles and scooters, not pedestrians standing at a crossing, and only in Taipei.' },
      badges: ['measured-tw'],
      link: 3,
    }),
    'how-much': item({
      q: { 'zh-TW': '我在路口到底吸進多少？', en: 'How much do I actually breathe at the crossing?' },
      answer: {
        'zh-TW': '老實說：沒有人量過。這是整件事最大的空白。下面是離現場最近的幾項量測，每一項都寫明和現場差在哪。',
        en: 'Honestly: nobody has measured it. It is the biggest hole in the whole story. Below are the nearest measurements, each with how it differs from the scene.',
      },
      caveat: { 'zh-TW': '不是量了沒事，是還沒有人去量。', en: 'Not measured and found fine. Not measured.' },
      badges: ['gap'],
      link: 3,
    }),
    'one-red-light': item({
      q: { 'zh-TW': '只是等個紅燈，有差嗎？', en: 'It’s only one red light. Does it matter?' },
      answer: {
        'zh-TW': '一個紅燈會不會傷身，沒有研究能回答，兩邊都不能說。研究看得到的是長期：長年吸車流廢氣，和心臟病、肺癌、氣喘有關。',
        en: 'Whether one red light does harm, no study can say, either way. What research can see is long-term: years of breathing traffic exhaust are associated with heart disease, lung cancer and asthma.',
      },
      caveat: { 'zh-TW': '研究看到的是「有關」，不是「造成」；看的是整體車流，不是機車。', en: 'What the studies show is association, not cause, and they concern traffic as a whole, not scooters.' },
      badges: ['gap', 'international'],
      link: 5,
    }),
    'my-child': item({
      q: { 'zh-TW': '小孩吸得比我多嗎？', en: 'Does my child breathe more of it than I do?' },
      answer: {
        'zh-TW': '嬰兒車裡的孩子：有可能。國外量到那個高度通常多 5% 到 15%，也有研究沒量到差別。上小學的孩子已經比那一層高；有根據的是他們呼吸比大人快。台灣兩種都沒有人量過。',
        en: 'A baby in a stroller: possibly. Abroad, that height usually reads 5 to 15% higher, and some studies found no difference. A primary-school child already stands above that band; what is established is that children breathe faster than adults. Neither has been measured in Taiwan.',
      },
      caveat: { 'zh-TW': '這些量測沒有一項是在台灣做的。', en: 'None of these measurements was made in Taiwan.' },
      badges: ['international', 'gap'],
      link: 6,
    }),
    rider: item({
      q: { 'zh-TW': '騎車的人自己呢？', en: 'What about the riders themselves?' },
      answer: {
        'zh-TW': '台北的研究裡，六種通勤方式中，騎燃油機車的人身上量到的 PM2.5 最高。騎車的人不是反派，是在車陣裡待最久的人。',
        en: 'In a Taipei study of six ways of commuting, people on gasoline scooters had the highest personal PM2.5. Riders are not the villains; they are the people who spend longest in the pack.',
      },
      caveat: { 'zh-TW': '這是所有來源的 PM2.5，不是只算廢氣。', en: 'That is PM2.5 from all sources, not exhaust alone.' },
      badges: ['measured-tw'],
      link: 6,
    }),
    electric: item({
      q: { 'zh-TW': '換成電動，路口真的會比較乾淨嗎？', en: 'Would going electric really make the crossing cleaner?' },
      answer: {
        'zh-TW': '電動機車沒有排氣管，在路口不排一氧化碳、油氣和苯。輪胎和煞車的粉塵還在，旁邊的汽車也還在。實際乾淨多少，台灣還沒有人量過。',
        en: 'An electric scooter has no tailpipe: no carbon monoxide, fuel vapour or benzene at the crossing. Tyre and brake dust remain, and so do the cars alongside. How much cleaner the air gets has not been measured in Taiwan.',
      },
      caveat: { 'zh-TW': '這不是零污染，是這台車在路口零廢氣。', en: 'This is not zero pollution. It is zero exhaust from this scooter at the crossing.' },
      badges: ['gap'],
      link: 7,
    }),
  },
});
