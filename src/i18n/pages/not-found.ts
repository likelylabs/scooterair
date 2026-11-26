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
    'zh-TW': '網址可能打錯了，或是這一頁已經搬家。從下面的連結找你要的內容：',
    en: 'The address may be mistyped, or the page has moved. Everything on the site can be reached from here:',
  },
  address: { 'zh-TW': '你輸入的網址：', en: 'The address you asked for:' },
  routes: {
    home: { 'zh-TW': '首頁：行人在紅燈旁吸進什麼', en: 'Home: what a pedestrian breathes beside a red light' },
    questions: { 'zh-TW': '問題：常見的疑問，一題一頁', en: 'Questions: one common question per page' },
    evidence: { 'zh-TW': '證據：每一項說法的研究', en: 'Evidence: the studies behind each claim' },
    unmeasured: { 'zh-TW': '沒人量過：還不知道的事', en: 'Not yet measured: what nobody knows yet' },
    electric: { 'zh-TW': '換電動：補助與花費試算', en: 'Going electric: subsidies and costs' },
    act: { 'zh-TW': '行動：你可以做的事', en: 'Take action: what you can do' },
    sources: { 'zh-TW': '資料來源', en: 'Sources' },
    about: { 'zh-TW': '關於這個網站・回報錯誤', en: 'About the site, and how to report an error' },
  },
  other: { 'zh-TW': 'English home page', en: '中文版首頁' },
});
