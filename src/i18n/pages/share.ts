// Share cards (V44): the strings that appear inside the generated images and nowhere else.
// Question cards take their text from ./questions.ts; the seven-lines card from chain.summary.

import { copy } from './_copy.ts';

export default copy({
  home: {
    kicker: { 'zh-TW': '一個紅燈，90 秒', en: 'One red light. Ninety seconds.' },
    title: { 'zh-TW': '那個味道，|你也聞過。', en: 'You know |that smell.' },
    answer: { 'zh-TW': '吸進多少，沒人量過。', en: 'How much of it you breathe, nobody has measured.' },
    caveat: { 'zh-TW': '不是量了沒事，是還沒有人去量。', en: 'Not measured and found fine. Not measured.' },
  },
  brief: {
    title: { 'zh-TW': '機車廢氣，七件事', en: 'Scooter exhaust: seven things' },
    caveat: { 'zh-TW': '六件有出處，一件沒人量過。', en: 'Six have sources; one has never been measured.' },
  },
  caveatLabel: { 'zh-TW': '這張圖沒有說的事', en: 'What this card does not say' },
  band: { 'zh-TW': '有廢氣｜多濃沒人量過', en: 'Exhaust present | amount not measured' },
  illustration: { 'zh-TW': '斜線是示意，不是量測', en: 'Hatching is illustration, not measurement' },
  alt: { 'zh-TW': '{title}{answer}（圖內附註：{caveat}）', en: '{title} {answer} (Caveat on the card: {caveat})' },
});
