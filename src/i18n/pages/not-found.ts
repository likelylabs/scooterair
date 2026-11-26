// Copy for the 404 page (src/pages/404.astro). GitHub Pages serves that one file for every
// address it cannot find, in either language, so the page prints both: Chinese first, English
// below (a script puts English first under /en/).
import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '找不到這一頁', en: 'Page not found' },
    description: { 'zh-TW': '這個網址沒有頁面。', en: 'There is no page at this address.' },
  },
  eyebrow: { 'zh-TW': '404', en: '404' },
  title: { 'zh-TW': '找不到這一頁', en: 'We cannot find this page' },
  body: {
    'zh-TW': '網址可能打錯了，或是這一頁已經搬家。從下面的連結，找你要的內容：',
    en: 'The address may be mistyped, or the page has moved. Everything on the site can be reached from the links below:',
  },
  address: { 'zh-TW': '你輸入的網址：', en: 'The address you asked for:' },
  routes: {
    home: { 'zh-TW': '首頁：等紅燈的時候，我們吸進了什麼', en: 'Home: what we breathe at the red light' },
    film: { 'zh-TW': '短片：一個紅燈', en: 'Film: one red light' },
    electric: { 'zh-TW': '換電動：算算看換一輛要多少錢', en: 'Go electric: work out what a switch costs' },
    questions: { 'zh-TW': '問題：常見的疑問，一題一頁', en: 'Questions: one common question per page' },
    estimate: { 'zh-TW': '怎麼算的：本站的推估和算法', en: 'How we worked it out: our estimate and its working' },
    act: { 'zh-TW': '我能做什麼', en: 'What I can do' },
    evidence: { 'zh-TW': '證據：每一項說法的研究', en: 'Evidence: the studies behind each claim' },
    about: { 'zh-TW': '關於這個網站・回報錯誤', en: 'About the site, and how to report an error' },
  },
  other: { 'zh-TW': 'English home page', en: '中文版首頁' },
});
