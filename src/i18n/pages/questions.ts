// /questions/ — the eight question pages (blueprint 4.2). Seeded by the system workstream
// with what the share cards need (question, one-line answer, the caveat line that goes INSIDE
// the image, badges, home chapter); the questions workstream adds each page's body copy here.
//
// Chinese questions and answers are the blueprint's, verbatim, except where the corrections
// listed in the questions brief override it (stroller figures, the Taipei route study's
// riders). `badges`, `link`, `facts`, `gaps`, `studies` and `next` are data, not copy: the
// guard only reads the { 'zh-TW', en } leaves.
//
// NUMBERS. No number is typed into a string here. A string that needs one carries a {token},
// and R() fills every token from the fact registry (src/data) when this module loads, so the
// guard, the share cards and the pages all read the same resolved text, and a corrected fact
// corrects every page and card. R() throws on a token it cannot fill.

import { copy } from './_copy.ts';
import type { EvidenceKind } from '../ui.ts';
import { facts, type FactId } from '../../data/facts.ts';
import { getSeries, type SeriesId } from '../../data/series.ts';
import { getSource, type SourceId } from '../../data/sources.ts';
import type { GapId } from '../../data/gaps.ts';

type Loc = 'zh-TW' | 'en';
type L = { 'zh-TW': string; en: string };
type Tok = (loc: Loc) => string;

// ---- number tokens, all read from the registry -------------------------------------------
const nf = (loc: Loc, v: number, digits = 2) => new Intl.NumberFormat(loc === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: digits }).format(+v.toFixed(6));
const datum = (id: FactId, key: string): number => {
  const d = facts[id]?.data[key];
  if (!d) throw new Error(`[questions copy] fact ${id} has no data.${key}`);
  return d.value;
};
/** A registry value, optionally scaled (m → cm) or made positive (−33 → "33% less"). */
const d = (id: FactId, key: string, o: { scale?: number; abs?: boolean; digits?: number } = {}): Tok => (loc) => {
  let v = datum(id, key) * (o.scale ?? 1);
  if (o.abs) v = Math.abs(v);
  return nf(loc, v, o.digits);
};
/** Round a head count to ten thousands: 384,130 → 「38 萬」 / "380,000". */
const wan = (id: FactId, key: string): Tok => (loc) => {
  const v = datum(id, key);
  return loc === 'en' ? nf('en', Math.round(v / 1e4) * 1e4) : `${nf('zh-TW', Math.round(v / 1e4))} 萬`;
};
/** A hazard ratio as a percentage: 1.15 → 15. */
const hrPct = (id: FactId, key: string): Tok => (loc) => nf(loc, Math.round((datum(id, key) - 1) * 100));
const zhNums = ['零', '一', '兩', '三', '四', '五', '六', '七', '八', '九', '十'];
/** A small count: Chinese numeral in zh (「六種」), a word in English ("six"). */
const enNums = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const count = (n: number): Tok => (loc) => (n >= 0 && n <= 10 ? (loc === 'en' ? enNums[n] : zhNums[n]) : nf(loc, n));
const seriesPoints = (id: SeriesId, ds: string) => {
  const s = getSeries(id).datasets.find((x) => x.key === ds);
  if (!s) throw new Error(`[questions copy] series ${id} has no dataset ${ds}`);
  return s.points.filter((p) => p.y !== null);
};
const sx = (id: SeriesId, ds: string, at: 'first' | 'last'): Tok => () => {
  const p = seriesPoints(id, ds);
  return String((at === 'first' ? p[0] : p[p.length - 1]).x);
};
const sy = (id: SeriesId, ds: string, at: 'first' | 'last', digits = 1): Tok => (loc) => {
  const p = seriesPoints(id, ds);
  return nf(loc, (at === 'first' ? p[0] : p[p.length - 1]).y as number, digits);
};
/** The first policy target after the last observed year. */
const nextTarget = (part: 'x' | 'y'): Tok => (loc) => {
  const lastObs = seriesPoints('ev-share-new-registrations', 'actual').at(-1)!.x as number;
  const t = seriesPoints('ev-share-new-registrations', 'target').find((p) => (p.x as number) > lastObs)!;
  return part === 'x' ? String(t.x) : nf(loc, t.y as number);
};
const spanYears = (id: SeriesId, ds: string): Tok => (loc) => {
  const p = seriesPoints(id, ds);
  return count((p.at(-1)!.x as number) - (p[0].x as number))(loc);
};
const year = (id: SourceId): Tok => () => String(getSource(id).year);
const nCategories = (id: SeriesId): Tok => count(getSeries(id).categories?.length ?? 0);

/** Fill {tokens} in both languages from the registry. Throws on an unknown token. */
function R(l: L, vars: Record<string, Tok>): L {
  const f = (loc: Loc) =>
    l[loc].replace(/\{(\w+)\}/g, (_m, k: string) => {
      if (!vars[k]) throw new Error(`[questions copy] no value for {${k}} in: ${l[loc]}`);
      return vars[k](loc);
    });
  return { 'zh-TW': f('zh-TW'), en: f('en') };
}

const item = <T extends { badges: EvidenceKind[]; link: number }>(x: T) => x;

/** One sentence or short paragraph, with the registry entries it rests on (for its citations). */
interface Line {
  text: L;
  facts?: FactId[];
  gaps?: GapId[];
  badge?: EvidenceKind | EvidenceKind[];
}
interface Action {
  text: L;
  badge?: EvidenceKind;
  facts?: FactId[];
  /** locale-neutral path and its link text */
  path?: string;
  linkText?: L;
}
const line = (x: Line) => x;
const act = (x: Action) => x;

// Shared token sets
const turnBox = { gap: d('marking-rules-turn-box', 'turnBoxGap', { scale: 100 }) };
const stroller = {
  usualLo: d('stroller-height-review', 'kenagy2016Low'),
  usualHi: d('stroller-height-review', 'kenagy2016High'),
  morning: d('stroller-height-review', 'kumar2017Morning', { abs: true }),
};
const quiet = { benzene: d('wu2021-quiet-route', 'benzene', { abs: true, digits: 0 }), pm25: d('wu2021-quiet-route', 'pm25', { abs: true, digits: 0 }) };

export default copy({
  index: {
    title: { 'zh-TW': '路口的八個問題', en: 'Eight questions at the crossing' },
    answerLabel: { 'zh-TW': '一句話回答', en: 'The short answer' },
    description: {
      'zh-TW': '站在路口的人真的會問的八個問題。每一題先給一句話回答，標明證據有多強，再說它沒有說什麼。',
      en: 'Eight questions people really ask at the crossing. Each gets a one-sentence answer, the strength of the evidence behind it, and what it does not say.',
    },
    lead: {
      'zh-TW': '這八題，是站在路口等紅燈的人真的會問的。照證據鏈的順序排：從排氣管在哪裡，到換成電動之後。每一題都先給一句話回答，標明證據是哪一種，再說它沒有說什麼。',
      en: 'These are the questions people actually ask while they wait at the light, in the order of the chain of evidence: from where the tailpipe is to what changes when it goes. Each starts with a one-sentence answer, says what kind of evidence stands behind it, and then says what it does not show.',
    },
    linkN: { 'zh-TW': '第 {n} 環', en: 'Link {n}' },
    read: { 'zh-TW': '看這一題', en: 'Read the answer' },
    otherTitle: { 'zh-TW': '另外兩題，|答案在別頁', en: 'Two more, |answered on other pages' },
    afford: {
      q: { 'zh-TW': '我換得起嗎？', en: 'Can I afford to switch?' },
      answer: {
        'zh-TW': '不一定：看你住哪裡、有沒有出廠夠久可以報廢的機車、一個月騎多少，有人打得平，有人打不平，算出來打不平我們也照實講。',
        en: 'Not necessarily: it depends on where you live, whether you have a scooter old enough to scrap and how far you ride each month, so it adds up for some people and not for others, and if it does not add up for you we will say so.',
      },
      more: { 'zh-TW': '換電動，把帳攤開', en: 'Going electric: the full bill' },
    },
    evidence: {
      q: { 'zh-TW': '到底證明了什麼？', en: 'So what has actually been shown?' },
      answer: {
        'zh-TW': '六件事有出處，一件沒有人量過；把它們接起來的那一步是我們的推論，我們把它標成最弱的一種證據。',
        en: 'Six things have sources and one has never been measured; the step that joins them is our inference, and we label it as the weakest kind of evidence.',
      },
      more: { 'zh-TW': '證據鏈，一環一環看', en: 'The chain, link by link' },
    },
    chainTitle: { 'zh-TW': '整條證據鏈，|七件事', en: 'The whole chain |in seven lines' },
    chainLead: {
      'zh-TW': '八題各自回答一環。七件事放在一起看，怎麼接起來，你自己判斷。',
      en: 'Each question answers one link. Here are all seven together; how they join is yours to judge.',
    },
  },

  /** Fixed labels on every question page. */
  page: {
    linkWithName: { 'zh-TW': '第 {n} 環：{name}', en: 'Link {n}: {name}' },
    measured: { 'zh-TW': '誰量了什麼', en: 'What was measured, and by whom' },
    note: { 'zh-TW': '附註', en: 'Note' },
    gapWho: { 'zh-TW': '誰量得出來', en: 'Who could measure it' },
    gapClose: { 'zh-TW': '要怎麼補上', en: 'What would settle it' },
    caveat: { 'zh-TW': '這一段沒有說的事', en: 'What this does not say' },
    action: { 'zh-TW': '你現在可以做的', en: 'What you can do now' },
    chain: { 'zh-TW': '這一題在證據鏈的哪裡', en: 'Where this sits in the chain' },
    chainLead: {
      'zh-TW': '這一題是七件事裡的第 {n} 件。點開看全部七件：每一件單獨讀都成立，接起來的那一步要你自己判斷。',
      en: 'This question is thing {n} of the seven. Open the list to see all seven: each holds on its own, and the step that joins them is yours to judge.',
    },
    more: { 'zh-TW': '再多看一張圖', en: 'One more picture' },
    moreMany: { 'zh-TW': '再多看幾張圖', en: 'A few more pictures' },
    studies: { 'zh-TW': '這個研究怎麼做的', en: 'How the studies were done' },
    studyWhat: { 'zh-TW': '量到什麼', en: 'What it found' },
    studyWhen: { 'zh-TW': '時間', en: 'When' },
    studyWhere: { 'zh-TW': '地點', en: 'Where' },
    studyNot: { 'zh-TW': '它沒有說的事', en: 'What it does not say' },
    studyKind: { 'zh-TW': '證據類型', en: 'Kind of evidence' },
    next: { 'zh-TW': '接著問', en: 'Ask next' },
    nextOther: { 'zh-TW': '另一半的問題', en: 'From the other half of the story' },
    nextSame: { 'zh-TW': '同一段的問題', en: 'From the same part of the story' },
    share: { 'zh-TW': '把這一題傳出去', en: 'Pass this question on' },
    shareLead: {
      'zh-TW': '圖卡裡印著問題、一句話回答，也印著「這張圖沒有說的事」。截圖傳出去，但書也跟著走。',
      en: 'The card carries the question, the short answer and what the card does not say, all inside the picture. A screenshot keeps the caveat with it.',
    },
    shareLine: { 'zh-TW': '傳到 LINE', en: 'Send on LINE' },
    shareOpen: { 'zh-TW': '打開方形圖卡', en: 'Open the square card' },
    shareWide: { 'zh-TW': '打開橫式圖卡', en: 'Open the wide card' },
    shareCopy: { 'zh-TW': '複製這一頁的連結', en: 'Copy this page’s link' },
    shareCopied: { 'zh-TW': '連結已複製', en: 'Link copied' },
    sourcesN: { 'zh-TW': '本頁的出處（{n}）', en: 'Sources on this page ({n})' },
    sourcesAll: { 'zh-TW': '所有出處', en: 'All sources' },
    allQuestions: { 'zh-TW': '八個問題全部', en: 'All eight questions' },
    fromChain: { 'zh-TW': '證據鏈上的位置', en: 'Place in the chain' },
    illustration: { 'zh-TW': '示意圖，不是量測', en: 'An illustration, not a measurement' },
  },

  items: {
    smell: item({
      q: { 'zh-TW': '為什麼|那麼臭？', en: 'Why does it |smell so bad?' },
      answer: {
        'zh-TW': '聞到那股味道，代表你站在廢氣裡。到底是哪幾種成分在臭，老實說沒有人鑑定過；比較可能的是醛類，十億分之幾就聞得到。',
        en: 'The smell means you are standing in exhaust. Which compounds make it, honestly, nobody has identified; aldehydes are the likelier candidates, detectable at a few parts per billion.',
      },
      caveat: { 'zh-TW': '味道重不代表傷害大，沒味道也不代表沒事。', en: 'A strong smell does not mean more harm, and no smell does not mean none.' },
      badges: ['gap', 'international'],
      link: 4,
    }),
    'beside-me': item({
      q: { 'zh-TW': '為什麼|剛好排在我旁邊？', en: 'Why does it come out |right beside me?' },
      answer: R(
        {
          'zh-TW': '因為排氣管就在路面上，而標線規則只要求待轉區的後緣離行人穿越道 {gap} 公分以上。這是下限，不是你家路口實際的距離。',
          en: 'Because the tailpipe is at road level, and the marking rules ask only that the turn box’s rear edge be {gap} cm or more from the crosswalk. That is a minimum, not the distance at your crossing.',
        },
        turnBox,
      ),
      caveat: R(
        { 'zh-TW': '{gap} 公分是規定的下限；實際距離每個路口不同。', en: 'The rule sets {gap} cm as a minimum; the real distance differs at every crossing.' },
        turnBox,
      ),
      badges: ['official-tw'],
      link: 2,
    }),
    app: item({
      q: { 'zh-TW': '空品 App 顯示「良好」，|是它錯了嗎？', en: 'The air-quality app says “Good”. |Is it wrong?' },
      answer: {
        'zh-TW': '它沒有錯。它報的是測站量到的空氣；你站的這個路口，沒有人量過。台北一項通勤研究裡，測站的數字跟得上 PM2.5，跟不上苯類。',
        en: 'It isn’t wrong. It reports the air measured at a station; the crossing you are standing at has not been measured. In one Taipei commuter study, station readings tracked PM2.5 and did not track the benzene family.',
      },
      caveat: {
        'zh-TW': '那項研究量的是騎腳踏車和騎電動機車的通勤者，不是站在路口的行人，而且只有台北。',
        en: 'That study measured commuters on bicycles and electric scooters, not pedestrians standing at a crossing, and only in Taipei.',
      },
      badges: ['measured-tw'],
      link: 3,
    }),
    'how-much': item({
      q: { 'zh-TW': '我在路口|到底吸進多少？', en: 'How much do I actually |breathe at the crossing?' },
      answer: {
        'zh-TW': '老實說：沒有人量過。這是整件事最大的空白。下面是離現場最近的幾項量測，每一項都寫明和現場差在哪。',
        en: 'Honestly: nobody has measured it. It is the biggest hole in the whole story. Below are the nearest measurements, each with how it differs from the scene.',
      },
      caveat: { 'zh-TW': '不是量了沒事，是還沒有人去量。', en: 'Not measured and found fine. Not measured.' },
      badges: ['gap'],
      link: 3,
    }),
    'one-red-light': item({
      q: { 'zh-TW': '只是等個紅燈，|有差嗎？', en: 'It’s only one red light. |Does it matter?' },
      answer: {
        'zh-TW': '一個紅燈會不會傷身，沒有研究能回答，兩邊都不能說。研究看得到的是長期：長年吸車流廢氣，和心臟病、肺癌、氣喘有關。',
        en: 'Whether one red light does harm, no study can say, either way. What research can see is long-term: years of breathing traffic exhaust are associated with heart disease, lung cancer and asthma.',
      },
      caveat: { 'zh-TW': '研究看到的是「有關」，不是「造成」；看的是整體車流，不是機車。', en: 'What the studies show is association, not cause, and they concern traffic as a whole, not scooters.' },
      badges: ['gap', 'international'],
      link: 5,
    }),
    'my-child': item({
      q: { 'zh-TW': '小孩吸得|比我多嗎？', en: 'Does my child breathe |more of it than I do?' },
      answer: R(
        {
          'zh-TW': '嬰兒車裡的孩子：有可能。國外多數研究量到那個高度多 {usualLo}% 到 {usualHi}%，但有一項沒有一致的差別，一項早上反而低 {morning}%。上小學的孩子已經比那一層高；有根據的是他們呼吸比大人快。台灣兩種都沒有人量過。',
          en: 'A baby in a stroller: possibly. Abroad, most studies found {usualLo} to {usualHi}% more at that height, but one found no consistent difference and one found {morning}% less in the morning. A primary-school child already stands above that band; what is established is that children breathe faster than adults. Neither has been measured in Taiwan.',
        },
        stroller,
      ),
      caveat: { 'zh-TW': '這些量測沒有一項是在台灣做的。', en: 'None of these measurements was made in Taiwan.' },
      badges: ['international', 'gap'],
      link: 6,
    }),
    rider: item({
      q: { 'zh-TW': '騎車的人|自己呢？', en: 'What about |the riders themselves?' },
      answer: R(
        {
          'zh-TW': '台北的研究裡，{modes}種通勤方式中，騎燃油機車的人身上量到的 PM2.5 平均最高。騎車的人不是反派，是在車陣裡待最久的人。',
          en: 'In a Taipei study of {modes} ways of commuting, people on gasoline scooters had the highest average personal PM2.5. Riders are not the villains; they are the people who spend longest in the pack.',
        },
        { modes: nCategories('commute-pm25-chuang2020') },
      ),
      caveat: { 'zh-TW': '這是所有來源的 PM2.5，不是只算廢氣。', en: 'That is PM2.5 from all sources, not exhaust alone.' },
      badges: ['measured-tw'],
      link: 6,
    }),
    electric: item({
      q: { 'zh-TW': '換成電動，|路口真的會比較乾淨嗎？', en: 'Would going electric really |make the crossing cleaner?' },
      answer: {
        'zh-TW': '電動機車沒有排氣管，在路口不排一氧化碳、油氣和苯。輪胎和煞車的粉塵還在，旁邊的汽車也還在。實際乾淨多少，台灣還沒有人量過。',
        en: 'An electric scooter has no tailpipe: no carbon monoxide, fuel vapour or benzene at the crossing. Tyre and brake dust remain, and so do the cars alongside. How much cleaner the air gets has not been measured in Taiwan.',
      },
      caveat: { 'zh-TW': '這不是零污染，是這台車在路口零廢氣。', en: 'This is not zero pollution. It is zero exhaust from this scooter at the crossing.' },
      badges: ['gap'],
      link: 7,
    }),
  },

  /**
   * The body of each page. `measured` is 「誰量了什麼」; `notShown` fills the caveat box under
   * the card caveat; `actions` are one or two things to do, each with the badge of the
   * evidence behind it; `studies` (data) are the facts opened in 「這個研究怎麼做的」;
   * `next` (data) is [same half, other half] — slugs, or 'afford' / 'evidence'.
   */
  pages: {
    smell: {
      answerFacts: ['odour-thresholds'] as FactId[],
      answerGaps: ['gap-odorants'] as GapId[],
      measured: [
        line({
          text: {
            'zh-TW': '台灣的機車廢氣有人拿去化驗過。在實驗室的測試裡，廢氣中的醛類以甲醛和乙醛為主。',
            en: 'Taiwanese scooter exhaust has been analysed. In laboratory tests, the main aldehydes in it were formaldehyde and acetaldehyde.',
          },
          facts: ['scooter-exhaust-carbonyls'],
          badge: 'measured-tw',
        }),
        line({
          text: {
            'zh-TW': '國外測過人在乾淨空氣裡要多濃才聞得到：乙醛和丙烯醛，十億分之幾就聞得到；苯要到百萬分之幾，高得多。',
            en: 'Tests abroad found how faint a smell people can notice in clean air: acetaldehyde and acrolein at a few parts per billion; benzene only at parts per million, far higher.',
          },
          facts: ['odour-thresholds'],
          badge: 'international',
        }),
        line({
          text: {
            'zh-TW': '一氧化碳沒有顏色，也沒有味道。它在這個故事裡是「廢氣的記號」；路口的一氧化碳有沒有高到傷身，沒有人量過。',
            en: 'Carbon monoxide has no colour and no smell. In this story it is a marker of exhaust; whether it reaches a harmful level at a crossing, nobody has measured.',
          },
          facts: ['co-odourless'],
          badge: 'international',
        }),
        line({
          text: {
            'zh-TW': '那股味道到底是哪幾種成分，沒有人鑑定過。',
            en: 'Which compounds actually make the smell, nobody has identified.',
          },
          gaps: ['gap-odorants'],
          badge: 'gap',
        }),
      ],
      figure: {
        title: { 'zh-TW': '鼻子是警報器，|不是測量儀', en: 'Your nose is an alarm, |not a gauge' },
        subtitle: { 'zh-TW': '聞得到的告訴你「有廢氣」，不告訴你「有多少」', en: 'What you can smell says exhaust is present, not how much' },
        can: {
          'zh-TW': '你站在廢氣裡。比較可能是醛類；是哪幾種，沒有人鑑定過。',
          en: 'You are standing in exhaust. Probably aldehydes; which ones, nobody has identified.',
        },
        cannot: {
          'zh-TW': '一氧化碳：沒有味道。苯：路邊那種濃度，不太可能聞得到。',
          en: 'Carbon monoxide: no smell at all. Benzene: unlikely to be smellable at roadside levels.',
        },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '醛類是根據嗅覺門檻推出來的候選，不是在機車廢氣裡聞出來的。',
            en: 'Aldehydes are candidates inferred from odour thresholds, not identified by smelling scooter exhaust.',
          },
          gaps: ['gap-odorants'],
        }),
        line({
          text: {
            'zh-TW': '聞得到不等於受害：世界衛生組織說，聞到甲醛本身不算健康危害。反過來，沒有味道的一氧化碳也不代表沒有。',
            en: 'Smelling something is not the same as being harmed: the WHO says that noticing formaldehyde is not itself a health effect. And the odourless carbon monoxide is not absent just because you cannot smell it.',
          },
          facts: ['formaldehyde-odour-not-harm', 'co-odourless'],
        }),
        line({
          text: {
            'zh-TW': '致癌分級講的是「會不會」，不是「吸多少會」。路口的苯有多濃，沒有人量過。',
            en: 'A cancer classification says whether something is a carcinogen, not how much it takes. How much benzene is at a crossing, nobody has measured.',
          },
          gaps: ['gap-pedestrian-red-light-exposure'],
        }),
      ],
      actions: [
        act({
          text: { 'zh-TW': '把這一頁傳給那個說「聞習慣就好」的人。', en: 'Send this page to the person who says you get used to the smell.' },
          path: '#share',
          linkText: { 'zh-TW': '圖卡在這裡', en: 'The card is here' },
        }),
        act({
          text: {
            'zh-TW': '味道重的時候，站得離待轉區和停止線遠幾步。這是我們的推論，不是量出來的效果。',
            en: 'When the smell is strong, stand a few steps back from the turn box and the stop line. This is our inference, not a measured benefit.',
          },
          badge: 'inference',
        }),
      ],
      more: {
        odour: {
          title: { 'zh-TW': '醛類十億分之幾就聞得到，|苯要到百萬分之幾', en: 'Aldehydes register at parts per billion, |benzene only at parts per million' },
          subtitle: { 'zh-TW': '人在乾淨空氣裡聞得到的濃度（ppm，對數軸），只看數量級', en: 'Concentration at which people notice a smell in clean air (ppm, log scale), orders of magnitude only' },
          chart: { 'zh-TW': '嗅覺門檻的數量級：醛類、苯與一氧化碳', en: 'Orders of magnitude of odour thresholds: aldehydes, benzene and carbon monoxide' },
          desc: {
            'zh-TW': '乙醛和丙烯醛的門檻在十億分之幾的範圍；苯依來源在百萬分之一到將近百萬分之一百；一氧化碳沒有味道，不在軸上。',
            en: 'Acetaldehyde and acrolein register in the parts-per-billion range; benzene, depending on the source, from about one to nearly a hundred parts per million; carbon monoxide has no smell and is off the axis.',
          },
          aldehydes: { 'zh-TW': '乙醛、丙烯醛（醛類）', en: 'Acetaldehyde, acrolein (aldehydes)' },
          benzene: { 'zh-TW': '苯（依來源不同）', en: 'Benzene (by source)' },
          co: { 'zh-TW': '沒有味道，所以不在這條軸上', en: 'No smell at all, so it is not on this axis' },
          ppb: { 'zh-TW': '十億分之幾', en: 'parts per billion' },
          ppm: { 'zh-TW': '百萬分之幾', en: 'parts per million' },
          range: { 'zh-TW': '範圍（ppm）', en: 'Range (ppm)' },
          compound: { 'zh-TW': '物質', en: 'Compound' },
          none: { 'zh-TW': '沒有味道', en: 'no smell' },
        },
        iarc: {
          title: { 'zh-TW': '致癌分級，|照實寫', en: 'Cancer classifications, |as they are' },
          subtitle: { 'zh-TW': '國際癌症研究機構（IARC）的分級', en: 'Classifications by the International Agency for Research on Cancer (IARC)' },
          caption: {
            'zh-TW': '分級講的是會不會，不是吸多少會。汽油引擎廢氣整體是 2B 級，不是 1 級，我們不會把它講成 1 級；柴油列在這裡只是對照。',
            en: 'A classification says whether, not how much. Gasoline engine exhaust as a whole is Group 2B, not Group 1, and we will not call it Group 1; diesel is listed for contrast only.',
          },
          rowHeader: { 'zh-TW': '物質', en: 'Substance' },
          column: { 'zh-TW': 'IARC 分級', en: 'IARC group' },
          rows: {
            benzene: { 'zh-TW': '苯', en: 'Benzene' },
            outdoor: { 'zh-TW': '室外空氣污染與其中的微粒', en: 'Outdoor air pollution and its particles' },
            diesel: { 'zh-TW': '柴油引擎廢氣（對照）', en: 'Diesel engine exhaust (for contrast)' },
            gasoline: { 'zh-TW': '汽油引擎廢氣（整體）', en: 'Gasoline engine exhaust (as a whole)' },
          },
          whoBenzene: {
            'zh-TW': '世界衛生組織說，苯找不到可以建議的安全濃度。',
            en: 'The WHO says no safe level of benzene can be recommended.',
          },
        },
      },
      studies: ['scooter-exhaust-carbonyls', 'odour-thresholds', 'co-odourless', 'iarc-benzene-group1', 'iarc-gasoline-exhaust-2b'] as FactId[],
      studyTitles: {
        'co-odourless': { 'zh-TW': '一氧化碳：無色、無味', en: 'Carbon monoxide: colourless, odourless' },
        'iarc-benzene-group1': { 'zh-TW': '苯：1 級致癌物', en: 'Benzene: Group 1' },
        'iarc-gasoline-exhaust-2b': { 'zh-TW': '汽油引擎廢氣：2B 級', en: 'Gasoline engine exhaust: Group 2B' },
      },
      next: ['how-much', 'electric'],
    },

    'beside-me': {
      answerFacts: ['marking-rules-turn-box', 'first-metre-sharma-kumar-2018'] as FactId[],
      answerGaps: [] as GapId[],
      measured: [
        line({
          text: R(
            {
              'zh-TW': '一篇英國學者的文獻回顧說，大多數車輛的排氣管在離地第一公尺內。推車裡嬰兒呼吸的高度，大約 {lo} 到 {hi} 公分，也在這一公尺裡。',
              en: 'A review by UK researchers says most vehicle tailpipes sit within the first metre above the road. A baby in a pram breathes at about {lo} to {hi} cm, inside the same metre.',
            },
            { lo: d('first-metre-sharma-kumar-2018', 'breathingLow', { scale: 100 }), hi: d('first-metre-sharma-kumar-2018', 'breathingHigh', { scale: 100 }) },
          ),
          facts: ['first-metre-sharma-kumar-2018'],
          badge: 'international',
        }),
        line({
          text: R(
            {
              'zh-TW': '交通部的標線規則：待轉區的後緣，離行人穿越道至少 {gap} 公分；機慢車停等區深 {a} 到 {b} 公尺，畫在停止線後面。',
              en: 'Under the transport ministry’s marking rules, the rear edge of the two-stage turn box must be at least {gap} cm from the crosswalk; the scooter stop box is {a} to {b} m deep, behind the stop line.',
            },
            { ...turnBox, a: d('marking-rules-turn-box', 'stopBoxDepthMin'), b: d('marking-rules-turn-box', 'stopBoxDepthMax') },
          ),
          facts: ['marking-rules-turn-box'],
          badge: 'official-tw',
        }),
        line({
          text: R(
            {
              'zh-TW': '引擎為什麼不熄？現行的怠速規定，管的是停車等候超過 {min} 分鐘的車；一個普通的紅燈，不在它要管的範圍裡。我們不是在說誰違規，是路口本來就這樣運作。',
              en: 'Why do the engines stay on? The anti-idling rule is written for vehicles stopped and waiting more than {min} minutes; an ordinary red light is not what it covers. We are not saying anyone is breaking a rule. This is how the crossing is designed to work.',
            },
            { min: d('idling-regulation', 'minutes') },
          ),
          facts: ['idling-regulation'],
          gaps: ['gap-idling-rule-scooters'],
          badge: 'official-tw',
        }),
        line({
          text: {
            'zh-TW': '綠燈亮的那一秒也算：香港、上海和英國的研究看到，路口的微粒高峰跟著號誌走，最高的那一下通常在車起步的時候，不是在等的時候。',
            en: 'The second it turns green counts too: studies in Hong Kong, Shanghai and the UK see particle peaks at a junction follow the signal, and the highest usually comes as vehicles pull away, not while they wait.',
          },
          facts: ['signal-cycle-peaks-international'],
          badge: 'international',
        }),
      ],
      figure: {
        title: R(
          { 'zh-TW': '標線規則只要求待轉區|離斑馬線 {gap} 公分', en: 'The marking rules ask for |{gap} cm between turn box and crosswalk' },
          turnBox,
        ),
        subtitle: { 'zh-TW': '一個路口臨近路段的俯視示意圖，依交通部的標線規則畫', en: 'Plan of one approach to a crossing, drawn to the transport ministry’s marking rules' },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '停等區的車在停止線後面，排氣管朝著後面的車陣，不是朝著行人。待轉區的車，車尾才朝著斑馬線。',
            en: 'Scooters in the stop box sit behind the stop line, with their tailpipes pointing at the queue behind them, not at pedestrians. It is the turn box whose tails face the crosswalk.',
          },
          facts: ['marking-rules-turn-box'],
        }),
        line({
          text: {
            'zh-TW': '「不到一公尺」出自一篇國際回顧對一般車輛的描述，不是拿機車量出來的。',
            en: '“Under a metre” comes from an international review describing vehicles in general, not from measuring scooters.',
          },
          facts: ['first-metre-sharma-kumar-2018'],
        }),
        line({
          text: {
            'zh-TW': '這條規定管不管機車、等紅燈算不算「停車等候」，我們沒有找到官方的解釋。',
            en: 'Whether the rule reaches scooters at all, and whether waiting at a signal counts as waiting while stopped, we found no official interpretation.',
          },
          gaps: ['gap-idling-rule-scooters'],
        }),
        line({
          text: {
            'zh-TW': '一台台灣的機車怠速時排多少、一個紅燈前面停幾台，都沒有公開的量測。',
            en: 'How much one Taiwanese scooter emits at idle, and how many queue at a red light, has not been published.',
          },
          gaps: ['gap-idle-emission-rate', 'gap-scooters-per-red-light'],
        }),
        line({
          text: {
            'zh-TW': '起步那一下的高峰，國外量的多半是汽車和柴油車；機車在台灣起步時有多少，沒有人量過。',
            en: 'The pull-away peaks measured abroad were mostly cars and diesel vehicles; how much a scooter emits as it pulls away in Taiwan, nobody has measured.',
          },
          gaps: ['gap-pull-away-spike'],
        }),
      ],
      actions: [
        act({
          text: {
            'zh-TW': '等的時候，站得離待轉區和停止線遠幾步。這是我們的推論，不是量出來的效果。',
            en: 'While you wait, stand a few steps back from the turn box and the stop line. This is our inference, not a measured benefit.',
          },
          badge: 'inference',
        }),
        act({
          text: { 'zh-TW': '家裡那台機車，查一下下一次定檢是什麼時候。', en: 'Check when your household’s scooter is next due for its exhaust inspection.' },
          badge: 'official-tw',
          facts: ['inspection-2025'],
        }),
      ],
      more: {
        kerb: {
          title: { 'zh-TW': '排氣管在|這一公尺裡', en: 'The tailpipe is |in this first metre' },
          subtitle: { 'zh-TW': '從路緣高度看的示意圖', en: 'Illustration at kerb height' },
        },
        cycle: {
          title: { 'zh-TW': '等的時候，|和起步的那一下', en: 'The wait, |and the pull-away' },
          subtitle: { 'zh-TW': '一個號誌循環：只畫「什麼時候」，不畫「多少」', en: 'One signal cycle: when things happen, never how much' },
        },
        limits: {
          title: { 'zh-TW': '定檢的怠速上限，|車愈新愈嚴', en: 'The idle-test limits |tighten with each build date' },
          subtitle: { 'zh-TW': '使用中機車定檢的合格上限，依出廠日期', en: 'Pass limits in the periodic inspection of in-use scooters, by build date' },
          caption: {
            'zh-TW': '這是排氣管口的法定上限，不是實際排放，更不是路口空氣裡的濃度。',
            en: 'These are legal limits at the tailpipe mouth: not actual emissions, and still less the concentration in the air at the crossing.',
          },
          co: { 'zh-TW': '一氧化碳（%）', en: 'Carbon monoxide (%)' },
          hc: { 'zh-TW': '碳氫化合物（ppm）', en: 'Hydrocarbons (ppm)' },
          coChart: { 'zh-TW': '定檢一氧化碳合格上限長條圖', en: 'Bar chart of carbon monoxide pass limits' },
          hcChart: { 'zh-TW': '定檢碳氫化合物合格上限長條圖', en: 'Bar chart of hydrocarbon pass limits' },
          built: { 'zh-TW': '出廠日期', en: 'Build date' },
          limit: { 'zh-TW': '上限', en: 'Limit' },
        },
        waffle: {
          title: R(
            { 'zh-TW': '每 100 台接到通知的機車，|{absent} 台沒有來定檢', en: 'Of 100 scooters called for inspection, |{absent} did not come' },
            { absent: d('inspection-2025-per-100', 'absent') },
          ),
          subtitle: { 'zh-TW': '2025 年四行程機車定檢，每一格是一台（本站依官方比例換算）', en: 'Four-stroke inspections in 2025, one cell per scooter (our arithmetic on official rates)' },
          chart: { 'zh-TW': '定檢結果方格圖', en: 'Waffle chart of inspection results' },
          passed: { 'zh-TW': '到檢合格', en: 'Came and passed' },
          failed: { 'zh-TW': '到檢不合格', en: 'Came and failed' },
          absent: { 'zh-TW': '沒有來（空格）', en: 'Did not come (empty cells)' },
          caption: { 'zh-TW': '沒來的那些排多少，沒有人知道。', en: 'Nobody knows what the ones that did not come emit.' },
          category: { 'zh-TW': '結果', en: 'Result' },
          value: { 'zh-TW': '台數', en: 'Scooters' },
        },
      },
      studies: ['marking-rules-turn-box', 'first-metre-sharma-kumar-2018', 'idling-regulation', 'signal-cycle-peaks-international', 'inspection-2025'] as FactId[],
      next: ['how-much', 'electric'],
    },

    app: {
      answerFacts: ['wu2021-station-correlation'] as FactId[],
      answerGaps: ['gap-pedestrian-red-light-exposure'] as GapId[],
      measured: [
        line({
          text: R(
            {
              'zh-TW': '空品 App 的數字來自測站。台北的交通測站和一般測站，PM2.5 年平均在 {y1} 年差 {g1} 微克，{y2} 年只差 {g2} 微克。用 PM2.5 看，路邊已經和別的地方差不多。',
              en: 'The app’s numbers come from monitoring stations. In Taipei, annual PM2.5 at the roadside stations was {g1} µg/m³ above the general stations in {y1}, and only {g2} above in {y2}. Judged by PM2.5, the roadside now looks much like anywhere else.',
            },
            {
              y1: sx('taipei-traffic-vs-general-stations', 'traffic', 'first'),
              y2: sx('taipei-traffic-vs-general-stations', 'traffic', 'last'),
              g1: d('taipei-traffic-station-gap', 'gap2017'),
              g2: d('taipei-traffic-station-gap', 'gap2024'),
            },
          ),
          facts: ['taipei-traffic-station-gap'],
          badge: 'measured-tw',
        }),
        line({
          text: R(
            {
              'zh-TW': '油氣呢？台北一項研究讓騎腳踏車和騎電動機車的通勤者帶著儀器上路，再和最近的測站比。PM2.5，兩邊對得上（相關係數 {p1} 到 {p2}）；苯類幾乎對不上（{b1} 到 {b2}）。作者自己提醒，拿測站估通勤者吸到的苯類，可能有偏差。',
              en: 'And the fumes? A Taipei study sent commuters on bicycles and electric scooters out with instruments and compared them with the nearest station. For PM2.5 the two agreed (correlation {p1} to {p2}); for the benzene family they barely matched ({b1} to {b2}). The authors warn that judging commuters’ benzene-family exposure from a station may be biased.',
            },
            {
              p1: d('wu2021-station-correlation', 'pm25RLow'),
              p2: d('wu2021-station-correlation', 'pm25RHigh'),
              b1: d('wu2021-station-correlation', 'btexRLow'),
              b2: d('wu2021-station-correlation', 'btexRHigh'),
            },
          ),
          facts: ['wu2021-station-correlation'],
          badge: 'measured-tw',
        }),
        line({
          text: {
            'zh-TW': '所以 App 說的是實話，只是它拿錯了尺：論排放量，機車排的主要不是粉塵，是油氣和一氧化碳。',
            en: 'So the app is telling the truth; it is holding the wrong ruler. By emissions, scooters put out mainly fumes and carbon monoxide, not dust.',
          },
          facts: ['teds13-mc-pm25-share', 'teds13-mc-co-share'],
          badge: 'official-tw',
        }),
      ],
      figure: {
        title: { 'zh-TW': '測站跟得上 PM2.5，|跟不上苯類', en: 'Stations track PM2.5. |They do not track the benzene family' },
        subtitle: {
          'zh-TW': '通勤者身上的讀數和最近測站的相關係數範圍（0 是毫無關係，1 是完全一致）',
          en: 'Range of correlation between commuters’ own readings and the nearest station (0 is no relation, 1 is in perfect step)',
        },
        chart: { 'zh-TW': '測站與通勤者讀數的相關係數範圍', en: 'Range of correlation between station and commuter readings' },
        desc: R(
          {
            'zh-TW': 'PM2.5 的相關係數在 {p1} 到 {p2} 之間，接近完全一致；苯類在 {b1} 到 {b2} 之間，接近毫無關係。',
            en: 'For PM2.5 the correlation ran from {p1} to {p2}, close to in step; for the benzene family from {b1} to {b2}, close to no relation.',
          },
          {
            p1: d('wu2021-station-correlation', 'pm25RLow'),
            p2: d('wu2021-station-correlation', 'pm25RHigh'),
            b1: d('wu2021-station-correlation', 'btexRLow'),
            b2: d('wu2021-station-correlation', 'btexRHigh'),
          },
        ),
        none: { 'zh-TW': '毫無關係', en: 'no relation' },
        full: { 'zh-TW': '完全一致', en: 'in perfect step' },
        pollutant: { 'zh-TW': '污染物', en: 'Pollutant' },
        low: { 'zh-TW': '最低', en: 'Lowest' },
        high: { 'zh-TW': '最高', en: 'Highest' },
        pm25: { 'zh-TW': 'PM2.5（細懸浮微粒）', en: 'PM2.5 (fine particles)' },
        btex: { 'zh-TW': '苯類（BTEX）', en: 'Benzene family (BTEX)' },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '那項研究量的是騎在路上的通勤者，不是站在路口等紅燈的行人；苯類只和一座測站比過。',
            en: 'The study measured commuters riding along the road, not pedestrians waiting at a light, and the benzene family was compared with a single station.',
          },
          facts: ['wu2021-station-correlation'],
        }),
        line({
          text: {
            'zh-TW': '「跟不上」不等於「比較高」：論文沒有列出測站的濃度，所以說不出街上的苯比測站高多少。',
            en: '“Does not track” is not the same as “is higher”: the paper prints no station concentrations, so it cannot say how much higher street benzene is.',
          },
          facts: ['wu2021-station-correlation'],
        }),
        line({
          text: {
            'zh-TW': '你站的那個路口，PM2.5、一氧化碳、苯都沒有人量過。',
            en: 'At the crossing where you stand, nobody has measured PM2.5, carbon monoxide or benzene.',
          },
          gaps: ['gap-pedestrian-red-light-exposure'],
        }),
      ],
      actions: [
        act({
          text: {
            'zh-TW': '把 App 當成整座城市的空氣，不是你這個路口的讀數。聞到廢氣味，就往後站幾步。這是我們的推論，不是量出來的效果。',
            en: 'Read the app as the air of the city, not a reading for your crossing. If you can smell exhaust, step back a few paces. This is our inference, not a measured benefit.',
          },
          badge: 'inference',
        }),
        act({
          text: { 'zh-TW': '這一格，環保局量得出來。把你家附近的路口告訴他們。', en: 'A city environmental bureau could fill this gap. Tell them which crossing.' },
          path: '/unmeasured/#ask',
          linkText: { 'zh-TW': '請來量我家路口', en: 'Ask them to measure my crossing' },
        }),
      ],
      more: {
        stations: {
          title: { 'zh-TW': '用 PM2.5 看，|路邊已經和別處差不多', en: 'By PM2.5, the roadside |now looks like anywhere else' },
          subtitle: { 'zh-TW': '台北市一般測站與交通測站的 PM2.5 年平均（µg/m³）', en: 'Annual mean PM2.5 at Taipei’s general and traffic stations (µg/m³)' },
          chart: { 'zh-TW': '台北一般測站與交通測站的 PM2.5 年平均比較圖', en: 'Chart comparing annual PM2.5 at Taipei’s general and traffic stations' },
          caption: {
            'zh-TW': '每一列兩個點：左邊是一般測站，右邊是交通測站。兩點愈靠近，路邊和一般地方愈像。這就是為什麼 PM2.5 回答不了機車的問題。',
            en: 'Two dots per row: general stations and traffic stations. The closer they are, the more the roadside reads like everywhere else. That is why PM2.5 cannot answer the scooter question.',
          },
          year: { 'zh-TW': '年', en: 'Year' },
        },
      },
      studies: ['wu2021-station-correlation', 'taipei-traffic-station-gap'] as FactId[],
      next: ['how-much', 'electric'],
    },

    'how-much': {
      answerFacts: [] as FactId[],
      answerGaps: ['gap-pedestrian-red-light-exposure'] as GapId[],
      measured: [
        line({
          text: {
            'zh-TW': '我們把找得到的研究都翻過了。在台灣，沒有人量過站在怠速機車旁的行人，吸進多少一氧化碳、多少苯、多少微粒。',
            en: 'We went through every study we could find. In Taiwan, nobody has measured how much carbon monoxide, benzene or particle pollution a pedestrian breathes beside idling scooters.',
          },
          gaps: ['gap-pedestrian-red-light-exposure'],
          badge: 'gap',
        }),
        line({
          text: {
            'zh-TW': '離現場最近的，是三項台北的研究。它們量的是騎腳踏車、騎機車、走路和搭車的通勤者，不是站在紅燈前的行人。下面三張圖各放一項，不合在一起，每一張都寫明和現場差在哪。',
            en: 'The nearest are three Taipei studies. They measured commuters cycling, riding, walking and taking transit, not pedestrians standing at a red light. The three charts below show one study each, never merged, each with how it differs from the scene.',
          },
          facts: ['scooter-lane-btex-wu2021', 'commute-scooter-vs-subway-chuang2020', 'commute-walking-wang2021'],
          badge: 'measured-tw',
        }),
      ],
      figure: {
        title: { 'zh-TW': '紅燈旁邊的行人吸進多少？|這張圖是空的', en: 'What does a pedestrian breathe beside a red light? |This chart is empty' },
        subtitle: {
          'zh-TW': '紅燈 90 秒裡，嬰兒車高度與大人高度的一氧化碳、苯、超細微粒',
          en: 'Carbon monoxide, benzene and ultrafine particles at stroller and adult height through a 90-second red light',
        },
        chart: { 'zh-TW': '空白的圖：紅燈倒數期間路口行人高度的三種污染物', en: 'Empty chart: three pollutants at pedestrian height through the red-light countdown' },
        desc: {
          'zh-TW': '三個面板分別是一氧化碳、苯和超細微粒，橫軸是紅燈倒數到 0 秒，接著是綠燈。',
          en: 'Three panels for carbon monoxide, benzene and ultrafine particles; the x axis is the red-light countdown to zero, then green.',
        },
      },
      nearest: {
        title: { 'zh-TW': '離現場最近的三項量測', en: 'The three nearest measurements' },
        wu: {
          title: { 'zh-TW': '在車流裡騎車，|苯類比騎腳踏車多', en: 'Riding in the traffic lane, |more of the benzene family than cycling' },
          subtitle: { 'zh-TW': '台北四條路線，苯類（BTEX）平均濃度（ppb），未調整', en: 'Four Taipei routes, mean benzene-family (BTEX) concentration (ppb), unadjusted' },
          chart: { 'zh-TW': '自行車騎士與機車道上電動機車騎士的苯類濃度長條圖', en: 'Bar chart of benzene-family levels for cyclists and electric-scooter riders in the traffic lane' },
          differs: {
            'zh-TW': '和現場差在哪：量的是騎在車流裡的通勤者，不是站著的行人；他們騎的是電動機車，吸到的是周圍車流的廢氣。',
            en: 'How it differs from the scene: commuters riding in traffic, not people standing still; they rode electric scooters, so what they breathed was the surrounding traffic’s exhaust.',
          },
        },
        chuang: {
          title: { 'zh-TW': '同一個早上的一小時，|走路和騎機車都偏高', en: 'Over the same morning hour, |walking and riding read high' },
          subtitle: { 'zh-TW': '台北通勤者一小時的個人 PM2.5 平均（µg/m³），所有來源', en: 'Taipei commuters’ mean personal PM2.5 over one hour (µg/m³), all sources' },
          chart: { 'zh-TW': '各種通勤方式的個人 PM2.5 長條圖', en: 'Bar chart of personal PM2.5 by commuting mode' },
          differs: {
            'zh-TW': '和現場差在哪：只量 PM2.5，所有來源都算在內；騎機車的數字是騎士自己的暴露，不是站在旁邊的人。',
            en: 'How it differs from the scene: PM2.5 only, from every source; the scooter figure is the riders’ own exposure, not a person standing beside them.',
          },
        },
        wang: {
          title: { 'zh-TW': '人行道上的讀數，|高低差很大', en: 'Pavement readings |vary widely' },
          subtitle: { 'zh-TW': '大台北，手持感測器量到的 PM2.5 中位數與範圍（µg/m³）', en: 'Taipei area, median and range of PM2.5 from a hand-held sensor (µg/m³)' },
          chart: { 'zh-TW': '沿街步行與機車停等時的 PM2.5 範圍圖', en: 'Range plot of PM2.5 walking along streets and on a stopped motorcycle' },
          differs: {
            'zh-TW': '和現場差在哪：感測器沒有校正，作者推論讀數偏高；有標明來源的最高讀數來自廟宇焚香和美食街烹飪，不是機車。',
            en: 'How it differs from the scene: the sensor was not calibrated and by the authors’ reasoning reads high; the highest readings with a named source came from temple incense and food-court cooking, not scooters.',
          },
        },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '三項研究沒有一項量的是等紅燈的行人，也沒有一項量一氧化碳或超細微粒。',
            en: 'None of the three measured pedestrians waiting at a light, and none measured carbon monoxide or ultrafine particles.',
          },
          gaps: ['gap-pedestrian-red-light-exposure'],
        }),
        line({
          text: {
            'zh-TW': '三項研究的人、儀器、季節都不同，不能合成一個範圍。',
            en: 'The three differ in people, instruments and season, so they cannot be combined into one range.',
          },
          facts: ['commute-scooter-vs-subway-chuang2020', 'idle-motorcycle-pm25-wang2021'],
        }),
        line({
          text: {
            'zh-TW': '人行道上最高的那些讀數，有標明來源的是焚香和烹飪；不能把街上的極端值算在機車頭上。',
            en: 'The highest pavement readings with a named source were incense and cooking; extreme street readings cannot be pinned on scooters.',
          },
          facts: ['walking-peaks-incense-wang2021'],
        }),
      ],
      actions: [
        act({
          text: { 'zh-TW': '這一格，環保局量得出來。把你家附近的路口告訴他們。', en: 'A city environmental bureau could fill this box. Tell them which crossing.' },
          path: '/unmeasured/#ask',
          linkText: { 'zh-TW': '請來量我家路口', en: 'Ask them to measure my crossing' },
        }),
        act({
          text: {
            'zh-TW': '有人量了，結果不管站在哪一邊，我們都會放上首頁。',
            en: 'When someone measures it, the result goes on our home page, whichever way it points.',
          },
        }),
      ],
      studies: ['scooter-lane-btex-wu2021', 'commute-scooter-vs-subway-chuang2020', 'commute-walking-wang2021', 'idle-motorcycle-pm25-wang2021'] as FactId[],
      next: ['smell', 'electric'],
    },

    'one-red-light': {
      answerFacts: ['hei-sr23-trap-associations'] as FactId[],
      answerGaps: ['gap-brief-exposure-harm'] as GapId[],
      measured: [
        line({
          text: {
            'zh-TW': '在怠速機車旁邊站幾分鐘會怎樣，沒有研究。現有最短的證據，是一小時的通勤，或兩小時的步行。',
            en: 'No study has looked at a few minutes beside idling scooters. The shortest evidence there is covers a one-hour commute or a two-hour walk.',
          },
          gaps: ['gap-brief-exposure-harm'],
          badge: 'gap',
        }),
        line({
          text: R(
            {
              'zh-TW': '最有份量的證據是長期的。{yr} 年一份整理了 {n} 項研究的報告，對「長年暴露在車流廢氣裡」和總死亡、心臟病死亡、肺癌死亡，以及兒童和成人的氣喘發病之間的關聯，有高度或中高度的信心。',
              en: 'The weightiest evidence is long-term. A {yr} review of {n} studies had high or moderate-to-high confidence in an association between years of exposure to traffic exhaust and death from all causes, from heart disease and from lung cancer, and with new asthma in children and adults.',
            },
            { yr: year('hei-sr23-2022'), n: d('hei-sr23-trap-associations', 'studies') },
          ),
          facts: ['hei-sr23-trap-associations'],
          badge: 'international',
        }),
        line({
          text: {
            'zh-TW': '研究看到的是「有關」，不是「造成」。而且量的都是整體車流，或所有來源的 PM2.5；台灣沒有一項健康研究把機車廢氣單獨分出來。',
            en: 'What the studies see is association, not cause. And every one measured traffic as a whole or PM2.5 from all sources; no Taiwanese health study has separated out scooter exhaust.',
          },
          gaps: ['gap-tw-health-isolating-scooters'],
          badge: 'gap',
        }),
      ],
      figure: {
        title: { 'zh-TW': '證據從一小時開始，|紅燈那一格是空的', en: 'The evidence starts at an hour. |The red light’s slot is empty' },
        subtitle: { 'zh-TW': '時間的尺：每一站一項研究，卡片一樣大，不管樣本多大', en: 'The ruler of time: one study per stop, every card the same size whatever the sample' },
        stops: {
          red: { 'zh-TW': '90 秒', en: '90 seconds' },
          hour: { 'zh-TW': '1 小時', en: '1 hour' },
          walk: R({ 'zh-TW': '{h} 小時', en: '{h} hours' }, { h: d('mccreanor2007-london-walk', 'hours') }),
          years: { 'zh-TW': '很多年', en: 'Many years' },
          redBody: { 'zh-TW': '沒有研究。', en: 'No study.' },
          hourBody: R(
            {
              'zh-TW': '台北 {n} 位健康成人，早上通勤一小時。走路的那一組，身上量到的 PM2.5（所有來源）愈高，血壓和心跳也高一點；搭捷運的那一組沒有這個關係。',
              en: '{n} healthy adults in Taipei, one morning hour of commuting. Among those who walked, higher personal PM2.5 from all sources went with slightly higher blood pressure and heart rate; among those on the subway it did not.',
            },
            { n: d('chuang2020-cardiovascular-association', 'participants') },
          ),
          walkBody: R(
            {
              'zh-TW': '在倫敦一條以柴油車為主的大街走{h}小時，氣喘成人的肺功能最多下降 {drop}%。',
              en: 'After {hw} hours walking a diesel-dominated London street, lung function in adults with asthma fell by up to {drop}%.',
            },
            { h: (loc) => count(datum('mccreanor2007-london-walk', 'hours'))(loc), hw: count(datum('mccreanor2007-london-walk', 'hours')), drop: d('mccreanor2007-london-walk', 'fev1Drop') },
          ),
          yearsBody: R(
            {
              'zh-TW': '追蹤台灣 {n}名成人，長期 PM2.5（所有來源）最高的一組，死亡風險比最低的一組高 {pct}%。',
              en: 'In a cohort of {n} Taiwanese adults, the group with the highest long-term PM2.5, from all sources, had a {pct}% higher risk of death than the lowest.',
            },
            { n: wan('mj-cohort-mortality-guo2021', 'adults'), pct: hrPct('mj-cohort-mortality-guo2021', 'highVsLow') },
          ),
        },
        ruler: {
          'zh-TW': '注意這把尺。上面的研究量的都是整體車流，或所有來源的 PM2.5，也就是機車排得很少的那一種污染。沒有任何一項把機車廢氣單獨分出來。研究看到的是「有關」，不是「造成」。這兩個詞差很多，我們不會混著用。',
          en: 'Mind the ruler. Every study above measured traffic as a whole or PM2.5 from all sources, the kind of pollution scooters make little of. Not one isolates scooter exhaust. And what they show is association, not cause. The two words are far apart and we will not mix them.',
        },
        rulerLabel: { 'zh-TW': '注意這把尺', en: 'Mind the ruler' },
      },
      inference: {
        'zh-TW': '我們的推論：你一年等的紅燈不只一個。這些時間算不算得進研究裡的「長期暴露」，沒有人算過。',
        en: 'Our inference: you wait at more than one red light a year. Whether that time counts toward the long-term exposure the studies describe, nobody has worked out.',
      },
      keepWalking: {
        label: { 'zh-TW': '這不是叫你不要走路', en: 'This is not a reason to stop walking' },
        text: {
          'zh-TW': '同一個台灣世代研究裡，不管空氣好壞，有運動的人風險都比較低。請繼續走路。',
          en: 'In the same Taiwanese cohort, people who exercised had lower risk at every level of pollution. Keep walking.',
        },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '那份整理報告自己說，它沒有評估因果。',
            en: 'The review says itself that it did not assess causality.',
          },
          facts: ['hei-sr23-trap-associations'],
        }),
        line({
          text: {
            'zh-TW': '台北那項研究沒有扣掉走路本身的活動量；倫敦那條街以柴油車為主。',
            en: 'The Taipei study did not adjust for the exertion of walking; the London street was dominated by diesel.',
          },
          facts: ['chuang2020-cardiovascular-association', 'mccreanor2007-london-walk'],
        }),
        line({
          text: {
            'zh-TW': '世代研究算的是所有來源的 PM2.5，不是機車，也不是路口。',
            en: 'The cohort counts PM2.5 from every source: not scooters, and not crossings.',
          },
          facts: ['mj-cohort-mortality-guo2021'],
        }),
      ],
      actions: [
        act({
          text: R(
            {
              'zh-TW': '有得選的時候，走車少的那條路。台北的通勤研究裡，安靜的路線，苯少了 {benzene}%，PM2.5 少了 {pm25}%；量的是騎車的通勤者。',
              en: 'Where there is a choice, take the quieter street. In the Taipei commuter study a quiet route cut benzene by {benzene}% and PM2.5 by {pm25}%, measured on people riding.',
            },
            quiet,
          ),
          badge: 'measured-tw',
          facts: ['wu2021-quiet-route'],
        }),
        act({
          text: { 'zh-TW': '請繼續走路。', en: 'Keep walking.' },
          badge: 'measured-tw',
          facts: ['mj-cohort-mortality-guo2021'],
        }),
      ],
      more: {
        tool: {
          summary: { 'zh-TW': '你的紅燈，一年加起來', en: 'Your red lights, added up over a year' },
          lead: {
            'zh-TW': '填兩個數字：你一天大概等幾個紅燈，每個大概幾秒。我們不替你填。',
            en: 'Enter two numbers: about how many red lights you wait at a day, and about how many seconds each. We do not fill them in for you.',
          },
          perDay: { 'zh-TW': '一天等幾個紅燈', en: 'Red lights a day' },
          seconds: { 'zh-TW': '每個紅燈幾秒', en: 'Seconds at each' },
          perDayUnit: { 'zh-TW': '個', en: 'lights' },
          secondsUnit: { 'zh-TW': '秒', en: 'seconds' },
          result: { 'zh-TW': '一年加起來，大約', en: 'Over a year, roughly' },
          hours: { 'zh-TW': '小時', en: 'hours' },
          waiting: { 'zh-TW': '填好兩個數字，這裡才會算。', en: 'Fill in both numbers and the sum appears here.' },
          fixed: { 'zh-TW': '這只是時間，不是劑量。', en: 'This is time, not dose.' },
          tag: { 'zh-TW': '你的數字，本站計算', en: 'Your numbers, our arithmetic' },
          noScript: {
            'zh-TW': '沒有 JavaScript 也可以自己算：一天的紅燈數 × 每個的秒數 × 一年的天數 ÷ 一小時的秒數。',
            en: 'Without JavaScript you can do it by hand: red lights a day × seconds each × days in a year ÷ seconds in an hour.',
          },
        },
        quiet: {
          title: R(
            { 'zh-TW': '安靜的路線，|苯少了 {benzene}%', en: 'On the quieter route, |{benzene}% less benzene' },
            quiet,
          ),
          subtitle: { 'zh-TW': '台北，尖峰時段，巷弄路線比主要幹道少多少（%），已調整背景與風速', en: 'Taipei, rush hour, how much lower the side-street route was than the main road (%), adjusted for background and wind' },
          chart: { 'zh-TW': '安靜路線比主要幹道少多少的長條圖', en: 'Bar chart of how much lower the quiet route was' },
          caption: { 'zh-TW': '騎車的通勤者，不是站著的行人。離峰時段的差別不顯著。', en: 'Commuters riding, not pedestrians standing. Off-peak differences were not significant.' },
          less: { 'zh-TW': '少了', en: 'Lower by' },
          pollutant: { 'zh-TW': '污染物', en: 'Pollutant' },
        },
      },
      studies: ['hei-sr23-trap-associations', 'chuang2020-cardiovascular-association', 'mccreanor2007-london-walk', 'mj-cohort-mortality-guo2021', 'wu2021-quiet-route'] as FactId[],
      next: ['my-child', 'electric'],
    },

    'my-child': {
      answerFacts: ['stroller-height-review', 'who-children-vulnerable'] as FactId[],
      answerGaps: ['gap-tw-child-height'] as GapId[],
      measured: [
        line({
          text: R(
            {
              'zh-TW': '嬰兒車裡孩子的口鼻，大約在離地 {lo} 到 {hi} 公分，就在排氣管那一公尺裡。',
              en: 'A child in a stroller breathes at about {lo} to {hi} cm off the ground, inside the tailpipe’s first metre.',
            },
            { lo: d('first-metre-sharma-kumar-2018', 'breathingLow', { scale: 100 }), hi: d('first-metre-sharma-kumar-2018', 'breathingHigh', { scale: 100 }) },
          ),
          facts: ['first-metre-sharma-kumar-2018'],
          badge: 'international',
        }),
        line({
          text: R(
            {
              'zh-TW': '國外比較嬰兒車和大人高度的研究，多數量到嬰兒車高度多 {usualLo}% 到 {usualHi}%。美國一項路邊研究量到 PM2.5 多 {us}%；英國一項實驗，細微粒最多多 {uk}%。但愛丁堡一項研究沒有一致的差別，英國另一項在早上，嬰兒車高度反而低 {morning}%。沒有一項是在台灣做的。',
              en: 'Studies abroad comparing stroller and adult height mostly found {usualLo} to {usualHi}% more at stroller height. One US roadside study found {us}% more PM2.5; one UK experiment found up to {uk}% more fine particles. But an Edinburgh study found no consistent difference, and another UK study found stroller height {morning}% lower in the morning. None was done in Taiwan.',
            },
            { ...stroller, us: d('stroller-height-review', 'buzzard2009'), uk: d('pram-height-sharma2020', 'fineParticlesUpTo') },
          ),
          facts: ['stroller-height-review', 'pram-height-sharma2020'],
          badge: 'international',
        }),
        line({
          text: {
            'zh-TW': '上小學的孩子已經比這一層高。對他們來說，有根據的是另一件事：小孩呼吸比大人快，吸進的空氣比較多。',
            en: 'A primary-school child already stands above that band. What is established for them is something else: children breathe faster than adults and take in more air.',
          },
          facts: ['who-children-vulnerable', 'child-breathing-per-bodyweight'],
          badge: 'international',
        }),
        line({
          text: R(
            {
              'zh-TW': '台灣最大的一份兒童調查很舊了（{period}）：全國 {n}名國中生，學校附近測站的一氧化碳和氮氧化物愈高，氣喘的比例也愈高。那是二行程機車還很多的年代，用的是測站資料，分不出機車和其他車。',
              en: 'Taiwan’s largest child survey is old ({period}): among {n} middle-school students nationwide, more asthma went with more carbon monoxide and nitrogen oxides at stations near the school. That was the two-stroke era, the exposure was station data, and scooters cannot be separated from other traffic.',
            },
            { period: (loc) => { const p = facts['guo1999-asthma-survey'].period[loc]; return loc === 'en' ? p.charAt(0).toLowerCase() + p.slice(1) : p; }, n: wan('guo1999-asthma-survey', 'children') },
          ),
          facts: ['guo1999-asthma-survey'],
          badge: 'measured-tw',
        }),
      ],
      figure: {
        title: { 'zh-TW': '嬰兒車的高度，|就在排氣管那一公尺裡', en: 'A stroller sits |inside the tailpipe’s first metre' },
        subtitle: { 'zh-TW': '從路緣高度看的示意圖；上小學的孩子比那一段高', en: 'Illustration at kerb height; a schoolchild stands above the stroller band' },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '台灣沒有任何孩童高度的實測。整理嬰兒車研究的那篇回顧自己也說，貼近地面的這一段，濃度不一定隨高度變。',
            en: 'No child-height measurement exists for Taiwan. The review that gathers the stroller studies itself says that near the ground, concentration may not change with height.',
          },
          facts: ['first-metre-sharma-kumar-2018'],
          gaps: ['gap-tw-child-height'],
        }),
        line({
          text: {
            'zh-TW': '各研究量的污染物、高度、儀器都不同，不能平均成一個數字；國外的排氣管多半是汽車和柴油車。',
            en: 'The studies differ in pollutant, height and instrument, so they cannot be averaged into one number, and the tailpipes abroad are mostly cars and diesels.',
          },
          facts: ['stroller-height-review'],
        }),
        line({
          text: {
            'zh-TW': '坐在機車前踏板或後座上學的孩子也在車陣裡；他們吸進多少，同樣沒有人量過。',
            en: 'Children who ride to school on the footboard or pillion are in the pack too, and nobody has measured what they breathe either.',
          },
          gaps: ['gap-school-commute-pillion'],
        }),
      ],
      actions: [
        act({
          text: {
            'zh-TW': '推嬰兒車等紅燈，停在離待轉區和停止線遠一點的地方。這是預防，不是量過的效果。',
            en: 'Waiting with a stroller, stop a little further from the turn box and the stop line. This is a precaution, not a measured benefit.',
          },
          badge: 'inference',
        }),
        act({
          text: { 'zh-TW': '把量測的請求帶去家長會，請環保局來量學校旁邊的路口。', en: 'Take the measurement request to the parents’ association, and ask the city to measure the crossing by the school.' },
          path: '/unmeasured/#ask',
          linkText: { 'zh-TW': '請來量我家路口', en: 'Ask them to measure my crossing' },
        }),
      ],
      more: {
        stroller: {
          title: R(
            { 'zh-TW': '嬰兒車高度：|多數多 {usualLo}% 到 {usualHi}%，也有沒差或更低的', en: 'Stroller height: |mostly {usualLo} to {usualHi}% more, some no different or lower' },
            stroller,
          ),
          subtitle: { 'zh-TW': '嬰兒車高度比大人高度多或少的百分比，一項研究一列', en: 'Percentage more or less at stroller height than at adult height, one study per row' },
          chart: { 'zh-TW': '各國嬰兒車高度研究的結果點圖', en: 'Dot chart of stroller-height studies abroad' },
          desc: R(
            {
              'zh-TW': '多數研究落在多 {usualLo}% 到 {usualHi}% 之間；一項多 {us}%，一項最多多 {uk}%；一項沒有一致的差別，一項早上低 {morning}%。台灣沒有任何一項。',
              en: 'Most studies fall between {usualLo} and {usualHi}% more; one found {us}% more and one up to {uk}% more; one found no consistent difference and one {morning}% less in the morning. None is from Taiwan.',
            },
            { ...stroller, us: d('stroller-height-review', 'buzzard2009'), uk: d('pram-height-sharma2020', 'fineParticlesUpTo') },
          ),
          band: { 'zh-TW': '多數研究', en: 'Most studies' },
          zero: { 'zh-TW': '和大人高度一樣', en: 'Same as adult height' },
          noDiff: { 'zh-TW': '沒有一致的差別', en: 'No consistent difference' },
          upTo: { 'zh-TW': '最多', en: 'up to' },
          taiwan: { 'zh-TW': '台灣：0 項研究', en: 'Taiwan: no studies' },
          study: { 'zh-TW': '研究', en: 'Study' },
          diff: { 'zh-TW': '差別（%）', en: 'Difference (%)' },
        },
      },
      studies: ['stroller-height-review', 'pram-height-sharma2020', 'who-children-vulnerable', 'guo1999-asthma-survey', 'guo2019-lung-function'] as FactId[],
      next: ['beside-me', 'electric'],
    },

    rider: {
      answerFacts: ['commute-scooter-vs-subway-chuang2020'] as FactId[],
      answerGaps: [] as GapId[],
      measured: [
        line({
          text: R(
            {
              'zh-TW': '台北一項研究，{n} 位健康的年輕人，早上通勤一小時。身上量到的 PM2.5 平均：搭捷運 {subway}，走路 {walking}，騎燃油機車 {scooter} 微克／立方公尺。這是所有來源的 PM2.5，不是只算廢氣。',
              en: 'In a Taipei study, {n} healthy young adults commuted for one morning hour. Their mean personal PM2.5 was {subway} µg/m³ on the subway, {walking} walking and {scooter} on a gasoline scooter. That is PM2.5 from all sources, not exhaust alone.',
            },
            {
              n: d('chuang2020-cardiovascular-association', 'participants'),
              subway: d('commute-scooter-vs-subway-chuang2020', 'subway'),
              walking: d('commute-scooter-vs-subway-chuang2020', 'walking'),
              scooter: d('commute-scooter-vs-subway-chuang2020', 'scooter'),
            },
          ),
          facts: ['commute-scooter-vs-subway-chuang2020'],
          badge: 'measured-tw',
        }),
        line({
          text: R(
            {
              'zh-TW': '另一項大台北的研究，只在機車停下來的時候量騎士，例如等紅燈：中位數 {v} 微克，大約是同一研究裡走路的兩倍。',
              en: 'Another Taipei-area study measured riders only while the motorcycle was stopped, at red lights for example: a median of {v} µg/m³, about twice the walking figure in the same study.',
            },
            { v: d('idle-motorcycle-pm25-wang2021', 'motorcycleIdle') },
          ),
          facts: ['idle-motorcycle-pm25-wang2021'],
          badge: 'measured-tw',
        }),
        line({
          text: R(
            {
              'zh-TW': '外送員呼出的一氧化碳比對照組高一點（不抽菸的人 {a} 對 {b} ppm）；研究沒有說他們騎的是什麼車。',
              en: 'Delivery workers breathed out slightly more carbon monoxide than a reference group ({a} against {b} ppm among non-smokers); the study does not say what they rode.',
            },
            { a: d('li2025-delivery-workers-co', 'nonSmokerWorkers'), b: d('li2025-delivery-workers-co', 'nonSmokerReference') },
          ),
          facts: ['li2025-delivery-workers-co'],
          badge: 'measured-tw',
        }),
        line({
          text: {
            'zh-TW': '騎車的人不是反派，是在車陣裡待最久的人。等紅燈的時候，你前面那台的排氣管就在你腳邊。',
            en: 'Riders are not the villains; they are the people who spend longest in the pack. At a red light, the tailpipe of the scooter ahead is at your feet.',
          },
        }),
      ],
      figure: {
        title: { 'zh-TW': '同一個早上的一小時，|騎機車的平均最高', en: 'Over the same morning hour, |riders’ average was highest' },
        subtitle: { 'zh-TW': '台北通勤者一小時的個人 PM2.5 平均（µg/m³），所有來源', en: 'Taipei commuters’ mean personal PM2.5 over one hour (µg/m³), all sources' },
        chart: { 'zh-TW': '六種通勤方式的個人 PM2.5 長條圖', en: 'Bar chart of personal PM2.5 by commuting mode' },
        caption: {
          'zh-TW': '走路和騎機車都比捷運和汽車高；但走路和騎機車之間、和公車之間的差別，統計上並不顯著。',
          en: 'Walking and riding were both above the subway and the car; but walking, riding and the bus did not differ significantly from one another.',
        },
        mode: { 'zh-TW': '通勤方式', en: 'Mode' },
        value: { 'zh-TW': '平均', en: 'Mean' },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '「最高」是平均值的排名：走路和騎機車之間的差別，統計上並不顯著。',
            en: '“Highest” ranks the averages: the difference between walking and riding was not statistically significant.',
          },
          facts: ['commute-scooter-vs-subway-chuang2020'],
        }),
        line({
          text: {
            'zh-TW': '這些數字是 PM2.5，不是廢氣專屬的指標；研究沒有量一氧化碳或苯。',
            en: 'These figures are PM2.5, which is not a marker specific to exhaust; the study did not measure carbon monoxide or benzene.',
          },
          facts: ['commute-scooter-vs-subway-chuang2020'],
        }),
        line({
          text: {
            'zh-TW': '外送員呼氣裡的一氧化碳是暴露的記號，不是健康的結果。',
            en: 'Carbon monoxide in delivery workers’ breath is a marker of exposure, not a health outcome.',
          },
          facts: ['li2025-delivery-workers-co'],
        }),
      ],
      actions: [
        act({
          text: R(
            {
              'zh-TW': '有得選的時候，騎車少的那條路。台北的研究裡，安靜的巷弄路線，尖峰時段苯少了 {benzene}%；量的就是騎車的人。',
              en: 'Where there is a choice, ride the quieter street. In the Taipei study the side-street route had {benzene}% less benzene at rush hour, measured on people riding.',
            },
            quiet,
          ),
          badge: 'measured-tw',
          facts: ['wu2021-quiet-route'],
        }),
        act({
          text: { 'zh-TW': '準時去定檢，沒過就修。你自己的排氣管，騎在你後面的人也在吸。', en: 'Turn up for your inspection and fix what fails. Your own tailpipe is what the rider behind you breathes.' },
          badge: 'official-tw',
          facts: ['inspection-2025'],
        }),
      ],
      more: {
        wang: {
          title: { 'zh-TW': '機車停下來等的時候，|讀數比走路高', en: 'Stopped on a motorcycle, |readings were above walking' },
          subtitle: { 'zh-TW': '大台北，手持感測器量到的 PM2.5 中位數與範圍（µg/m³）', en: 'Taipei area, median and range of PM2.5 from a hand-held sensor (µg/m³)' },
        },
        wu: {
          title: { 'zh-TW': '騎在車流裡，|吸的是別人的廢氣', en: 'Riding in traffic, |you breathe everyone else’s exhaust' },
          subtitle: { 'zh-TW': '台北四條路線，苯類（BTEX）平均濃度（ppb）；騎士騎的是電動機車', en: 'Four Taipei routes, mean benzene-family (BTEX) concentration (ppb); the riders were on electric scooters' },
        },
      },
      studies: ['commute-scooter-vs-subway-chuang2020', 'idle-motorcycle-pm25-wang2021', 'scooter-lane-btex-wu2021', 'li2025-delivery-workers-co', 'lai2005-toll-workers'] as FactId[],
      next: ['one-red-light', 'electric'],
    },

    electric: {
      answerFacts: ['teds13-electric-mc-pm25'] as FactId[],
      answerGaps: ['gap-electrification-street-air'] as GapId[],
      measured: [
        line({
          text: {
            'zh-TW': '電動機車沒有排氣管：在路口，它不排一氧化碳、油氣和苯。這是機器本身的事實，不需要研究。',
            en: 'An electric scooter has no tailpipe: at the crossing it emits no carbon monoxide, fuel vapour or benzene. That is a fact of the machine; it needs no study.',
          },
        }),
        line({
          text: R(
            {
              'zh-TW': '輪胎、煞車和路面的粉塵還在：官方排放清冊估計，全台電動機車一年排 {t} 公噸 PM2.5。發電的排放在別的地方，旁邊的汽車和公車也還在排。',
              en: 'Tyre, brake and road dust remain: the official inventory puts the PM2.5 from all of Taiwan’s electric scooters at {t} tonnes a year. Power generation emits elsewhere, and the cars and buses alongside are still running.',
            },
            { t: d('teds13-electric-mc-pm25', 'pm25') },
          ),
          facts: ['teds13-electric-mc-pm25'],
          badge: 'official-tw',
        }),
        line({
          text: {
            'zh-TW': '台北那項通勤研究裡，在機車道上騎電動機車的人，身上照樣量得到苯類：他們吸的是旁邊車流的廢氣。換車，拿掉的是你那根排氣管；受惠的是站在你旁邊的人，還有騎在你後面的那一台。',
            en: 'In the Taipei commuter study, people riding electric scooters in the scooter lane still carried readings of benzene-family compounds: they were breathing the traffic around them. Switching removes your tailpipe from other people’s air: the people beside you, and the rider behind you.',
          },
          facts: ['scooter-lane-btex-wu2021'],
          badge: 'measured-tw',
        }),
        line({
          text: R(
            {
              'zh-TW': '排氣管換掉，排放真的會少：二行程機車退場之後，機車排的苯 {yrs}年少了約 {b}%，油氣少了約 {h}%。這是推估的排放量。',
              en: 'Change the tailpipe and emissions really do fall: as two-stroke scooters left the road, scooter benzene emissions fell about {b}% in {yrs} years and hydrocarbons about {h}%. These are estimated emissions.',
            },
            { yrs: spanYears('tsai2023-benzene-by-class', 'motorcycles'), b: d('tsai2023-trend-2013-2021', 'benzeneDrop'), h: d('tsai2023-trend-2013-2021', 'hcDrop') },
          ),
          facts: ['tsai2023-trend-2013-2021'],
          badge: 'modelled-tw',
        }),
        line({
          text: R(
            {
              'zh-TW': '台灣這幾年是往回走的：新掛牌的機車裡，電動的比例 {y1} 年是 {s1}%，{y2} 年剩 {s2}%。政府自己訂的目標，是 {y3} 年 {s3}%。',
              en: 'Taiwan has been going backwards: {s1}% of newly registered scooters were electric in {y1}, and {s2}% in {y2}. The government’s own target is {s3}% by {y3}.',
            },
            {
              y1: sx('ev-share-new-registrations', 'actual', 'first'),
              s1: sy('ev-share-new-registrations', 'actual', 'first'),
              y2: sx('ev-share-new-registrations', 'actual', 'last'),
              s2: sy('ev-share-new-registrations', 'actual', 'last'),
              y3: nextTarget('x'),
              s3: nextTarget('y'),
            },
          ),
          facts: ['ev-share-2019', 'ev-share-2025', 'netzero-ev-sales-targets'],
          badge: 'official-tw',
        }),
      ],
      figure: {
        title: { 'zh-TW': '同一個紅燈，|換成電動', en: 'The same red light, |electric' },
        subtitle: { 'zh-TW': '切換燃油與電動兩格示意圖；下面是換了之後消失的、留下的、搬走的', en: 'Switch between the gasoline and electric illustrations; below, what goes, what stays and what moves elsewhere' },
      },
      notShown: [
        line({
          text: {
            'zh-TW': '少一根排氣管是確定的；少多少廢氣進到誰的肺裡，沒有人量過。',
            en: 'One tailpipe fewer is certain; how much less exhaust reaches anyone’s lungs has not been measured.',
          },
          gaps: ['gap-electrification-street-air'],
        }),
        line({
          text: {
            'zh-TW': '「零」只用在這台車自己的廢氣。路口不是零：汽車、公車和背景的空氣都還在。',
            en: '“Zero” applies only to this scooter’s own exhaust. The crossing is not zero: cars, buses and the background air are all still there.',
          },
          facts: ['teds13-electric-mc-pm25'],
        }),
        line({
          text: {
            'zh-TW': '電動比例的逐年數字出自媒體轉述的官方統計；目標是目標，不是預測。',
            en: 'The yearly electric shares come from media reports of official statistics; the targets are targets, not forecasts.',
          },
          facts: ['ev-share-2019', 'netzero-ev-sales-targets'],
        }),
      ],
      actions: [
        act({
          text: {
            'zh-TW': '下一台，考慮電動的。換不換得起，看你住哪裡、有沒有出廠夠久可以報廢的機車、一個月騎多少；算出來打不平，我們也照實講。',
            en: 'For your next one, consider electric. Whether you can afford it depends on where you live, whether you have a scooter old enough to scrap and how far you ride; if the sums do not come out in favour, we will say so.',
          },
          path: '/electric/#calc',
          linkText: { 'zh-TW': '用我的條件算', en: 'Work it out for me' },
        }),
        act({
          text: {
            'zh-TW': '還沒到換車的時候？準時定檢、該修就修、把二行程報廢，不換車也做得到，都算數。',
            en: 'Not changing scooters yet? Turning up for inspection, fixing what fails and scrapping a two-stroke are things you can do without switching, and they count.',
          },
          path: '/act/#keep',
          linkText: { 'zh-TW': '我現在不打算換車', en: 'I’m not switching now' },
        }),
      ],
      more: {
        share: {
          title: R(
            { 'zh-TW': '電動的比例往下走，|離目標愈來愈遠', en: 'The electric share fell, |away from the targets' },
            {},
          ),
          subtitle: { 'zh-TW': '電動機車占新掛牌機車的比例（%），和政府的淨零路徑目標', en: 'Electric share of newly registered scooters (%), with the government’s net-zero pathway targets' },
          chart: { 'zh-TW': '電動機車新掛牌比例與政策目標折線圖', en: 'Line chart of the electric share of new registrations against policy targets' },
          desc: R(
            {
              'zh-TW': '電動比例從 {y1} 年的 {s1}% 降到 {y2} 年的 {s2}%；政策目標是 {y3} 年 {s3}%，之後更高。',
              en: 'The electric share fell from {s1}% in {y1} to {s2}% in {y2}; the policy target is {s3}% in {y3}, rising after that.',
            },
            {
              y1: sx('ev-share-new-registrations', 'actual', 'first'),
              s1: sy('ev-share-new-registrations', 'actual', 'first'),
              y2: sx('ev-share-new-registrations', 'actual', 'last'),
              s2: sy('ev-share-new-registrations', 'actual', 'last'),
              y3: nextTarget('x'),
              s3: nextTarget('y'),
            },
          ),
          caption: {
            'zh-TW': '實線是媒體轉述的官方數字，沒有查證過的年份留白；空心點和虛線是政策目標，不是預測。',
            en: 'The solid line is official figures as reported in the media, with unverified years left blank; hollow points and the dashed line are policy targets, not forecasts.',
          },
          actual: { 'zh-TW': '實際比例', en: 'Actual share' },
          target: { 'zh-TW': '政策目標', en: 'Policy target' },
          year: { 'zh-TW': '年', en: 'Year' },
        },
        benzene: {
          title: { 'zh-TW': '最髒的排氣管退場，|苯就少了', en: 'When the dirtiest tailpipes left, |benzene fell' },
          subtitle: { 'zh-TW': '各車種一年排放的苯（公噸），推估的排放量', en: 'Benzene emitted per year by vehicle class (tonnes), estimated emissions' },
          chart: { 'zh-TW': '機車與汽油車苯排放量前後比較圖', en: 'Before-and-after chart of benzene from scooters and gasoline cars' },
          caption: {
            'zh-TW': '推估的排放量，不是量到的空氣。到了後來，汽油車排的苯反而比機車多。',
            en: 'Estimated emissions, not measured air. By the later year, gasoline cars emitted more benzene than scooters.',
          },
          vehicle: { 'zh-TW': '車種', en: 'Vehicle class' },
        },
      },
      studies: ['teds13-electric-mc-pm25', 'scooter-lane-btex-wu2021', 'tsai2023-trend-2013-2021', 'ev-share-2025', 'netzero-ev-sales-targets'] as FactId[],
      next: ['afford', 'how-much'],
    },
  },
});
