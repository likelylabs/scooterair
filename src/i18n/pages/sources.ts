// Copy for /sources/ (redesign brief 7.4; blueprint 4.8): the reference list. Every count is
// filled in at render time from src/data. See ./_copy.ts.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '資料來源', en: 'Sources' },
    description: {
      'zh-TW': '網站用到的每一個來源：完整書目、原文連結、我們讀到哪裡，以及網站用它說了什麼。',
      en: 'Every source the site uses: the full reference, a link to the original, how far we read it, and what the site says on the strength of it.',
    },
  },
  head: {
    kicker: { 'zh-TW': '資料來源', en: 'Sources' },
    title: { 'zh-TW': '每一個數字，|都從這裡來', en: 'Every number |starts here' },
    lead: {
      'zh-TW': '這裡列出網站用到的全部 {n} 個來源，包括本站推估和口罩說明用到的。每一個有固定的編號，網站上的來源標記都連到這裡。每一筆都寫著我們讀到哪裡，以及網站用它說了什麼。',
      en: 'Here are all {n} sources the site uses, including those behind our estimate and the mask facts. Each has a fixed number, and every citation marker on the site links here. Each entry says how far we read it and what the site says on the strength of it.',
    },
    evidence: { 'zh-TW': '想看每一項證據怎麼接起來，請到證據頁。', en: 'To see how each piece of evidence fits together, go to the evidence page.' },
    evidenceLink: { 'zh-TW': '證據鏈，一環一環看', en: 'The chain, link by link' },
  },
  reads: {
    title: { 'zh-TW': '我們讀到哪裡', en: 'How far we read' },
    lead: {
      'zh-TW': '有的來源我們讀了全文並逐頁核對數字，有的只讀到摘要，有的只找得到媒體轉述的官方數字。每一筆都照實標出來。',
      en: 'Some sources we read in full and checked figure by figure against the page; some only as far as the abstract; for some we found only a media report of an official figure. Each entry says which.',
    },
    count: { 'zh-TW': '{n} 個', en: '{n}' },
  },
  filter: {
    title: { 'zh-TW': '篩選', en: 'Filter' },
    link: { 'zh-TW': '證據鏈的哪一環', en: 'Link of the chain' },
    kind: { 'zh-TW': '來源類型', en: 'Kind of source' },
    all: { 'zh-TW': '全部', en: 'All' },
    none: { 'zh-TW': '不在鏈上', en: 'Outside the chain' },
    estimate: { 'zh-TW': '推估用到的', en: 'Used by our estimate' },
    showing: { 'zh-TW': '顯示 {n} 個來源，共 {total} 個', en: 'Showing {n} of {total} sources' },
    hint: {
      'zh-TW': '選了之後，下面只留下符合的來源。兩組可以一起用。',
      en: 'Choose, and only the matching sources stay below. The two groups combine.',
    },
  },
  entry: {
    open: { 'zh-TW': '開啟原文', en: 'Open the original' },
    doi: { 'zh-TW': 'DOI', en: 'DOI' },
    read: { 'zh-TW': '閱讀程度：', en: 'How we read it:' },
    // the same date the citation gives as 檢索日期 / Accessed: one name for it
    checked: { 'zh-TW': '檢索日期：{date}', en: 'Accessed: {date}' },
    descriptive: { 'zh-TW': '描述，不是原標題', en: 'A description, not the title' },
    descriptiveHelp: {
      'zh-TW': '我們的研究筆記沒有記下這篇的原標題。方括號裡是我們寫的描述；請用作者或發布單位、出版處和連結找到原文。',
      en: 'Our research notes did not record this item’s title. The words in square brackets are our description; use the author or publisher, where it was published, and the link to find the original.',
    },
    links: { 'zh-TW': '用在：', en: 'Used in:' },
    noLink: { 'zh-TW': '背景資料', en: 'background' },
    uses: { 'zh-TW': '網站用它說的事（{n}）', en: 'What the site says on its strength ({n})' },
    facts: { 'zh-TW': '事實', en: 'Facts' },
    series: { 'zh-TW': '圖表資料', en: 'Chart data' },
    answers: { 'zh-TW': '回答了哪些問題', en: 'Questions it helps answer' },
    estimate: { 'zh-TW': '本站的推估', en: 'Our estimate' },
    number: { 'zh-TW': '來源 {n}', en: 'Source {n}' },
  },
  top: { 'zh-TW': '回到篩選', en: 'Back to the filter' },
});
