// /90/: the film (blueprint 4.7, V45), plus the hero button on the home page that opens it.
//
// The captions are NOT here. The seven lines come from chain.summary in ../ui.ts, the one source
// they share with the home page, the question pages and the share cards; the title, the two
// questions, the last five seconds and the chart's own caption are read from ./home.ts and
// ../ui.ts. This module holds only what the film adds: its controls, its notes, the card for the
// pause, the end card, and its share card.
//
// Rules that bind these strings (blueprint Part 2, 4.7, Appendix A): the label 示意圖｜多濃沒人量過
// is in every frame; nothing here states or implies a concentration; no health figure sits beside
// the scene; {tokens} are filled from the timeline, never typed.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '90 秒', en: 'The 90 seconds' },
    description: {
      'zh-TW': '一個紅燈，照實際的秒數播一次：哪些事有人量過，哪一格是空的。沒有聲音，每一句都有字幕，可以暫停，也可以拖。',
      en: 'One red light, played second for second: what has been measured about it, and which box is empty. No sound, every line captioned; pause or scrub at any point.',
    },
  },

  // The button in the home page hero (blueprint 3.1).
  hero: {
    play: { 'zh-TW': '播放 90 秒', en: 'Play the 90 seconds' },
  },

  head: {
    kicker: { 'zh-TW': '一個紅燈，從頭播一次', en: 'One red light, start to finish' },
    title: { 'zh-TW': '90 秒', en: 'The 90 seconds' },
    deck: {
      'zh-TW': '倒數照實際的秒數走。沒有聲音，每一句都有字幕。',
      en: 'The countdown runs second for second. No sound; every line is captioned.',
    },
  },

  /** Printed inside every frame (blueprint 4.7). */
  slate: { 'zh-TW': '示意圖｜多濃沒人量過', en: 'Illustration | amount not measured' },

  player: {
    label: { 'zh-TW': '短片：一個紅燈，90 秒', en: 'Film: one red light, ninety seconds' },
    play: { 'zh-TW': '播放', en: 'Play' },
    pause: { 'zh-TW': '暫停', en: 'Pause' },
    restart: { 'zh-TW': '從頭再看', en: 'Start again' },
    /** On the poster, under the play button. */
    length: { 'zh-TW': '全片 {min} 分 {sec} 秒 · 沒有聲音', en: '{min} min {sec} s · no sound' },
    seek: { 'zh-TW': '短片進度', en: 'Position in the film' },
    /** aria-valuetext of the scrubber. */
    position: { 'zh-TW': '{time}，全片 {total}；{clock}', en: '{time} of {total}; {clock}' },
    keys: {
      'zh-TW': '鍵盤：空白鍵播放或暫停，左右鍵前後 5 秒，Home 回到開頭。',
      en: 'Keyboard: Space plays or pauses, the left and right arrows move 5 seconds, Home starts again.',
    },
    ended: { 'zh-TW': '播完了', en: 'The end' },
  },

  /** Kickers of the beats that are not one of the seven links. */
  beats: {
    ask: { 'zh-TW': '排什麼、排在哪，都有出處', en: 'What comes out, and where, are both documented' },
    askLine: { 'zh-TW': '那站在旁邊的人，吸進了多少？', en: 'So how much does the person standing beside it breathe?' },
    open: { 'zh-TW': '還是那一格', en: 'The same empty box' },
    five: { 'zh-TW': '快綠燈了', en: 'Nearly green' },
    green: { 'zh-TW': '綠燈。', en: 'Green.' },
    replay: { 'zh-TW': '同一個紅燈，再來一次', en: 'The same red light, again' },
  },

  /** The card that fills the frame while the clock is held (link 5). No scene, no figure. */
  card: {
    title: { 'zh-TW': '倒數暫停，|鏡頭拉遠', en: 'The countdown pauses. |The camera pulls back.' },
    body: {
      'zh-TW': '下面這一句，講的不是這個紅燈。研究看的是很多年，而且是整體車流，不是機車。',
      en: 'The next line is not about this red light. The research covers many years, and traffic as a whole, not scooters.',
    },
  },

  end: {
    kicker: { 'zh-TW': '可以傳給朋友的一句話', en: 'The one sentence to pass on' },
    /** Blueprint Part 1, "the sentence a reader repeats to a friend", verbatim. */
    sentence: {
      'zh-TW': '紅燈旁邊那股機車味，吸進多少沒人量過；但換成電動，那根排氣管就不見了。',
      en: 'Nobody has measured what you breathe beside the scooters at a red light. But go electric, and that tailpipe is gone.',
    },
    choose: { 'zh-TW': '接下來，兩條路', en: 'Two ways on from here' },
    evidence: { 'zh-TW': '看完整的證據', en: 'See the full evidence' },
    money: { 'zh-TW': '算算看，換車打不打得平', en: 'Work out whether switching adds up for you' },
  },

  notes: {
    title: { 'zh-TW': '先說清楚', en: 'Before you look' },
    /** {min}/{sec}: the film's running time. Follows the home page's own disclosure strip. */
    length: {
      'zh-TW': '紅燈是 90 秒。講到長期研究的那一段，倒數會暫停；加上綠燈和換成電動機車的那一次，全片是 {min} 分 {sec} 秒。',
      en: 'The red light is 90 seconds. The clock pauses for the part about long-term studies; with the green light and the electric replay, the whole piece runs {min} min {sec} s.',
    },
    cuts: {
      'zh-TW': '畫面一格一格切換，不會漸變：斜線那一層在每一格都畫得一樣，不會變濃，也不會變淡。',
      en: 'The picture changes in cuts, never in fades: the hatched layer is drawn the same in every frame, and it neither thickens nor thins.',
    },
  },

  /** What a reader sees with JavaScript off or reduced motion on: the same piece, laid out. */
  still: {
    note: {
      'zh-TW': '下面是同一部短片，一格一格攤開：畫面和字幕都一樣，只是不會自己動。',
      en: 'Below is the same film laid out frame by frame: the same pictures and captions, without the motion.',
    },
    optIn: { 'zh-TW': '改用播放的', en: 'Play it instead' },
    /** A beat that reuses a frame already shown above. */
    sameFrame: { 'zh-TW': '畫面同第 {n} 格', en: 'Same picture as frame {n}' },
    frameN: { 'zh-TW': '第 {n} 格', en: 'Frame {n}' },
  },

  transcript: {
    title: { 'zh-TW': '文字版', en: 'Read it as text' },
    intro: {
      'zh-TW': '短片裡的每一句，照出現的順序。點時間，短片就跳到那裡。',
      en: 'Every line in the film, in the order it appears. Select a time and the film jumps there.',
    },
    jump: { 'zh-TW': '跳到 {time}', en: 'Jump to {time}' },
  },

  /** Its own share card (V44 conventions: kicker, title, answer, caveat inside the image, badge). */
  share: {
    kicker: { 'zh-TW': '短片 · 約 2 分鐘 · 沒有聲音', en: 'A short film · about 2 minutes · no sound' },
    title: { 'zh-TW': '一個紅燈，|90 秒', en: 'One red light. |Ninety seconds.' },
    answer: {
      'zh-TW': '這 90 秒裡，站在機車旁邊的人吸進多少，沒有人量過。量過的和沒量過的，照秒數播一次。',
      en: 'Nobody has measured what the person beside the scooters breathes in these ninety seconds. The measured and the unmeasured, played second for second.',
    },
    caveat: {
      'zh-TW': '畫面是示意圖。斜線那一層有多濃，沒有人量過；它不會隨著倒數變濃。',
      en: 'The picture is an illustration. Nobody has measured how dense the hatched layer is, and it does not thicken as the clock runs.',
    },
  },
});
