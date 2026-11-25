// Home page copy. Seeded by the system workstream with the prologue (blueprint 3.1, verbatim)
// so the placeholder shell reads from a copy module; the home workstream adds chapters 3.2–3.13
// here, one key per chapter (brief, link1 … link7, green, connect, money, next).

import { copy } from './_copy.ts';

export default copy({
  prologue: {
    kicker: { 'zh-TW': '那個味道，你也聞過。', en: 'You know that smell.' },
    title: { 'zh-TW': '一個紅燈，|90 秒', en: 'One red light. |Ninety seconds.' },
    deck: {
      'zh-TW': '一整排機車在旁邊怠速，你站在路口，等同一個綠燈。這種紅燈你等過幾千次了。這一次放慢看：這 90 秒裡，哪些事有人量過，哪些沒有。',
      en: 'A row of scooters idles beside you while you stand at the corner waiting for the same green. You have waited through thousands of these. This time, slowly: what has been measured about these ninety seconds, and what has not.',
    },
    rider: {
      'zh-TW': '車陣裡的人和路口的人，常常是同一批：早上騎車上班，中午走路去買便當。',
      en: 'The people in the pack and the people on the corner are often the same people: we ride to work in the morning and walk out for a lunch box at noon.',
    },
    microcopy: { 'zh-TW': '往下滑，倒數才會走。', en: 'Scroll, and the countdown runs.' },
    disclosure: {
      'zh-TW': '畫面是示意圖。霧畫成斜線，是因為它有多濃沒有人量過；它不會隨著倒數變濃。90 秒是我們說故事用的長度，不是統計數字。每個數字都有出處。',
      en: 'The picture is an illustration. The haze is drawn as hatching because nobody has measured how dense it is, and it does not thicken as the clock runs. Ninety seconds is our storytelling length, not a statistic. Every number has a source.',
    },
    handoff: { 'zh-TW': '先給趕時間的人：30 秒版。', en: 'For anyone in a hurry: the 30-second version.' },
  },
});
