// /unmeasured/ — 沒有人量過的事 / What nobody has measured (blueprint 4.4), and the one-page
// brief for researchers and agencies (V47, /print/brief/).
// Facts and gaps are rendered from the registry; these strings are the page's own voice.
// {tokens} are filled at render time.

import { copy } from './_copy.ts';

export default copy({
  meta: {
    title: { 'zh-TW': '沒有人量過的事', en: 'What nobody has measured' },
    description: {
      'zh-TW': '紅燈旁的行人吸進多少一氧化碳、苯和超細微粒，台灣沒有人量過。這一頁列出每一格空白、要怎麼量、誰量得出來，還有一封你可以寄給環保局的信。',
      en: 'Nobody in Taiwan has measured how much carbon monoxide, benzene and ultrafine dust a pedestrian breathes beside the scooters at a red light. Here is every blank, how to measure it, who could, and a letter you can send.',
    },
  },
  hero: {
    eyebrow: { 'zh-TW': '沒人量過', en: 'Not yet measured' },
    title: { 'zh-TW': '沒有人|量過的事', en: 'What nobody |has measured' },
    deck: {
      'zh-TW': '一整排機車怠速等紅燈的時候，旁邊的行人吸進多少一氧化碳、多少苯、多少超細微粒？我們把找得到的研究都翻過了：在台灣，沒有人量過。不是量了沒事，是還沒有人去量。',
      en: 'Beside a row of scooters idling at a red light, how much carbon monoxide, benzene and ultrafine dust does a pedestrian breathe? We went through every study we could find. In Taiwan, nobody has measured it. Not measured and found fine. Not measured.',
    },
    figure: {
      title: { 'zh-TW': '紅燈旁的行人吸進什麼：|這張圖是空的', en: 'What a pedestrian breathes at the red light: |this chart is empty' },
      subtitle: {
        'zh-TW': '一氧化碳、苯、超細微粒，在嬰兒車和大人的高度，隨著紅燈倒數',
        en: 'Carbon monoxide, benzene and ultrafine particles, at stroller and adult height, across one red light',
      },
      chart: { 'zh-TW': '紅燈旁行人高度的空氣：沒有資料', en: 'Air at pedestrian height beside the red light: no data' },
      desc: {
        'zh-TW': '如果有人量過，這張圖會畫出紅燈 90 秒裡，嬰兒車高度和大人高度的一氧化碳、苯和超細微粒怎麼變化。',
        en: 'Had anyone measured it, this chart would show how carbon monoxide, benzene and ultrafine particles change at stroller and adult height over a ninety-second red light.',
      },
      ask: { 'zh-TW': '請來量我家路口', en: 'Ask them to measure my crossing' },
    },
    handoff: {
      'zh-TW': '下面把空白一格一格攤開：哪幾格是空的、要怎麼量、誰量得出來，最後是一封你可以直接寄出去的信。',
      en: 'Below, the blanks one by one: which boxes are empty, how to fill them, who could, and at the end a letter you can send as it is.',
    },
  },
  five: {
    eyebrow: { 'zh-TW': '五個空白', en: 'Five blanks' },
    title: { 'zh-TW': '五個空白，|每一個都填得起來', en: 'Five blanks. |Each one can be filled.' },
    lead: {
      'zh-TW': '這五格接在紅燈那 90 秒上。每一格後面，都寫了誰量得出來。',
      en: 'These five sit on the ninety seconds of the red light. Each is followed by who could measure it.',
    },
    first: { 'zh-TW': '最關鍵的一格', en: 'The one that matters most' },
    who: { 'zh-TW': '誰量得出來', en: 'Who could measure it' },
    whoProposal: { 'zh-TW': '誰量得出來（本站提議）', en: 'Who could measure it (our proposal)' },
    close: { 'zh-TW': '要怎麼量', en: 'What would close it' },
    why: { 'zh-TW': '為什麼要量', en: 'Why it matters' },
    searched: { 'zh-TW': '{date}查過', en: 'searched {date}' },
    moreTitle: { 'zh-TW': '還有 {n} 格空白', en: '{n} more blanks' },
    moreLead: {
      'zh-TW': '不在紅燈那 90 秒上，但一樣沒有人量過。點開看要怎麼量、誰量得出來。',
      en: 'Not on the ninety seconds of the red light, but just as unmeasured. Open each for how to measure it and who could.',
    },
    evidenceLink: { 'zh-TW': '每一格最接近的證據，在證據頁', en: 'The nearest evidence for each blank is on the evidence page' },
  },
  /** Who could measure it, for gaps whose registry entry does not say. Proposals, labelled as such. */
  whoFallback: {
    'gap-pull-away-spike': { 'zh-TW': '環境部、車輛測試機構。', en: 'The environment ministry and vehicle-testing laboratories.' },
    'gap-electrification-street-air': { 'zh-TW': '各縣市環保局、大學。', en: 'City environmental protection bureaus and universities.' },
    'gap-brief-exposure-harm': { 'zh-TW': '大學的公共衛生團隊。', en: 'University public-health groups.' },
    'gap-tw-health-isolating-scooters': { 'zh-TW': '大學的公共衛生和流行病學團隊。', en: 'University public-health and epidemiology groups.' },
    'gap-tw-child-height': { 'zh-TW': '各縣市環保局、大學。', en: 'City environmental protection bureaus and universities.' },
    'gap-school-commute-pillion': { 'zh-TW': '大學的公共衛生團隊，和學校、家長會一起。', en: 'University public-health groups, working with schools and parents’ associations.' },
    'gap-roadside-co-vs-who': { 'zh-TW': '各縣市環保局、環境部。', en: 'City environmental protection bureaus and the environment ministry.' },
    'gap-high-emitter-share': { 'zh-TW': '環境部、各縣市環保局。', en: 'The environment ministry and city environmental protection bureaus.' },
    'gap-idling-rule-scooters': { 'zh-TW': '環境部。這一格要的是一份正式解釋，不是量測。', en: 'The environment ministry. This one needs a formal interpretation, not a measurement.' },
  },
  plan: {
    eyebrow: { 'zh-TW': '要量什麼', en: 'What to measure' },
    title: { 'zh-TW': '把這張圖|填起來要量什麼', en: 'What it takes |to fill the chart' },
    lead: {
      'zh-TW': '一氧化碳、苯類（BTEX）和超細微粒數量；在嬰兒車高度（約 0.6 公尺）和成人高度（約 1.5 公尺）；在轉角、待轉區旁、停等區旁，加上一個離路口遠的對照點；逐秒記錄，對上紅燈和綠燈；同時數每個時相停了幾台機車；公開原始數據。',
      en: 'Carbon monoxide, benzene-family compounds (BTEX) and ultrafine particle number; at stroller height (about 0.6 m) and adult height (about 1.5 m); on the corner, beside the turn box and beside the stop box, plus a control point away from the junction; second by second, matched to red and green; with a count of the scooters waiting in each phase; and the raw data published.',
    },
    figTitle: { 'zh-TW': '四個位置、兩個高度、|三樣東西', en: 'Four positions, two heights, |three things' },
    howLong: {
      'zh-TW': '量多久：平日和週末都要，尖峰和離峰都要，每個路口連續量好幾天，紅燈和綠燈的差別才看得出來。',
      en: 'For how long: weekdays and weekends, rush hour and off-peak, several days in a row at each crossing, so that red and green can be told apart.',
    },
    stamp: {
      'zh-TW': '這是本站的提議，還沒有任何機關採用。',
      en: 'This is our proposal. No agency has adopted it.',
    },
    nearest: {
      'zh-TW': '目前最接近的一次：',
      en: 'The nearest anyone has come:',
    },
    print: { 'zh-TW': '印出一張紙的版本', en: 'Print the one-page version' },
    printNote: { 'zh-TW': '給研究人員、機關和記者，A4 一頁。', en: 'For researchers, agencies and journalists: one A4 page.' },
  },
  sensors: {
    eyebrow: { 'zh-TW': '自己量？', en: 'Measure it yourself?' },
    title: { 'zh-TW': '你手上的空氣盒子|量不到這個', en: 'The air sensor in your hand |cannot measure this' },
    lead: {
      'zh-TW': '如果你手上的感測器只量 PM2.5，它量不到這一格要的東西。這不是感測器的錯，是尺拿錯了。',
      en: 'If the sensor in your hand reads only PM2.5, it cannot measure what this box needs. That is not the sensor’s fault. It is the wrong ruler.',
    },
    fumes: {
      'zh-TW': '論排放量，燃油機車的粉塵很少，一氧化碳和油氣多得多。',
      en: 'By emissions, gasoline scooters put out little dust and far more carbon monoxide and fuel vapour.',
    },
    stations: {
      'zh-TW': '台北一項研究讓騎腳踏車和騎電動機車的通勤者帶著儀器上路，再和附近的測站比：PM2.5，兩邊對得上；苯類，幾乎對不上。',
      en: 'A Taipei study sent commuters on bicycles and on electric scooters out with instruments and compared them with nearby stations. For PM2.5 the two agreed. For the benzene family they barely matched.',
    },
    handheld: { 'zh-TW': '手持的低價感測器：', en: 'A hand-held low-cost sensor:' },
    close: {
      'zh-TW': '要填這一格，需要量一氧化碳、苯類和超細微粒的研究級儀器，還要逐秒對上紅燈和綠燈。所以我們請機關和大學來量。',
      en: 'Filling this box takes research-grade instruments for carbon monoxide, benzene-family compounds and ultrafine particles, matched second by second to red and green. That is why we are asking agencies and universities to do it.',
    },
  },
  promise: {
    eyebrow: { 'zh-TW': '我們的承諾', en: 'Our promise' },
    title: { 'zh-TW': '量出來是什麼，|我們都公布', en: 'Whatever it shows, |we publish it' },
    changeMind: {
      'zh-TW': '如果有人在機車多的路口，在行人和嬰兒車的高度，分紅燈和綠燈，把一氧化碳、苯類和超細微粒量出來，結果和附近的背景值差不多，「行人吸進什麼」這一環就不成立。我們會改寫這一頁，並且寫明為什麼改。',
      en: 'If someone measures carbon monoxide, benzene-family compounds and ultrafine particles at a scooter-heavy crossing, at pedestrian and stroller height, by red and green phase, and finds them close to the nearby background, the link about what pedestrians breathe fails. We will rewrite this page and say why.',
    },
    pledge: {
      'zh-TW': '「量出來如果路口和背景沒有差別，我們會把這個結果放在首頁。」',
      en: '“If the measurement finds no difference between the crossing and the background, that result goes on the home page.”',
    },
    pledgeBy: { 'zh-TW': '行人呼吸', en: 'ScooterAir' },
    small: {
      'zh-TW': '結果顯示問題很小，也一樣放上首頁。我們要的是答案，不是哪一種答案。',
      en: 'A result that shows the problem is small goes on the home page too. What we want is the answer, not a particular one.',
    },
  },
  ask: {
    eyebrow: { 'zh-TW': '你可以做的', en: 'What you can do' },
    title: { 'zh-TW': '請來量|我家路口', en: 'Please measure |my crossing' },
    lead: {
      'zh-TW': '填兩格，下面這封信就寫好了。複製下來，或用你自己的信箱寄出去。',
      en: 'Fill in two boxes and the letter below is written. Copy it, or send it from your own email.',
    },
    noScript: {
      'zh-TW': '這個瀏覽器沒有執行 JavaScript：信裡的○○請自己填，再複製或寄出。',
      en: 'JavaScript is not running in this browser: fill in the ○○ blanks yourself, then copy or send the letter.',
    },
    fields: { 'zh-TW': '你的路口', en: 'Your crossing' },
    city: { 'zh-TW': '縣市、區', en: 'City and district' },
    cityHint: { 'zh-TW': '例如：新北市板橋區', en: 'For example: Banqiao District, New Taipei' },
    place: { 'zh-TW': '路口', en: 'Junction' },
    placeHint: { 'zh-TW': '例如：文化路與民權路口', en: 'For example: Wenhua Road and Minquan Road' },
    subjectLabel: { 'zh-TW': '主旨：', en: 'Subject: ' },
    subject: {
      'zh-TW': '請量測{place}，行人呼吸高度的空氣',
      en: 'Please measure the air at pedestrian height at the junction of {place}',
    },
    body: {
      'zh-TW':
        '您好，我住在{city}。{place}尖峰時間機車很多，行人就在待轉區和停等區旁邊等紅燈、過馬路。就我所知，台灣目前沒有公開的量測，能說明行人在這樣的路口吸進多少一氧化碳、苯類和超細微粒；從一般測站和 PM2.5 的數字也看不出來。想請貴局：\n\n一、在這個路口行人等候的位置，於嬰兒車高度（約 0.6 公尺）和成人高度（約 1.5 公尺），量測一氧化碳、苯類（BTEX）和超細微粒數量。\n二、依紅燈、綠燈分開記錄，同時記下每個時相停等的機車數。\n三、設一個離路口較遠的對照點。\n四、公開原始數據。\n\n不管結果如何，謝謝你們讓大家知道答案。',
      en:
        'Dear colleagues,\n\nI live in {city}. At the junction of {place} there are a great many scooters at rush hour, and people wait at the red light and cross right beside the turn box and the stop box. As far as I know, no published measurement in Taiwan shows how much carbon monoxide, benzene-family compounds and ultrafine particles pedestrians breathe at crossings like this, and the numbers from ordinary monitoring stations and from PM2.5 cannot show it either. I would like to ask your bureau to:\n\n1. Measure carbon monoxide, benzene-family compounds (BTEX) and ultrafine particle number where pedestrians wait at this junction, at stroller height (about 0.6 m) and adult height (about 1.5 m).\n2. Record red and green phases separately, with the number of scooters waiting in each phase.\n3. Set up a control point further from the junction.\n4. Publish the raw data.\n\nWhatever the result, thank you for letting everyone know the answer.',
    },
    title2: { 'zh-TW': '寫給環保局的信', en: 'The letter to the environmental bureau' },
    copy: { 'zh-TW': '複製這封信', en: 'Copy the letter' },
    copied: { 'zh-TW': '已複製。貼到信件或 LINE 裡就可以。', en: 'Copied. Paste it into an email or a message.' },
    failed: { 'zh-TW': '這個瀏覽器不讓我們複製，請自己選取上面的文字。', en: 'This browser would not let us copy. Please select the text above yourself.' },
    mail: { 'zh-TW': '用我的信箱寄', en: 'Open in my email' },
    noStore: {
      'zh-TW': '你填的字只留在你的瀏覽器裡。我們不會收到，也不會存下來。',
      en: 'What you type stays in your browser. We do not receive it and nothing is stored.',
    },
    toWhom: { 'zh-TW': '寄給誰', en: 'Who to send it to' },
    toWhomBody: {
      'zh-TW': '你所在縣市的環保局。也可以副本給環境部、你的議員，或附近大學的公共衛生、環境工程團隊。一起署名的人愈多，愈像一個需要回覆的請求。',
      en: 'Your city’s environmental protection bureau. You can copy in the environment ministry, your councillor, or a public-health or environmental-engineering group at a nearby university. The more people sign it, the more it reads as a request that needs an answer.',
    },
    notFund: {
      'zh-TW': '我們請的是量測，不是錢：這一頁不向你募款，也沒有說要出錢替你量。',
      en: 'We are asking for a measurement, not for money. This page asks you for nothing, and it does not offer to pay for a measurement either.',
    },
  },
  kit: {
    eyebrow: { 'zh-TW': '給研究人員、機關和記者', en: 'For researchers, agencies and journalists' },
    title: { 'zh-TW': '空白的圖和量測提議，|一頁帶走', en: 'The empty chart and the proposal, |on one page' },
    lead: {
      'zh-TW': '一張 A4：空白的圖、要量什麼、在哪裡量、量多久，和我們的承諾。可以印出來帶去開會。',
      en: 'One A4 page: the empty chart, what to measure, where and for how long, and our promise. Print it and take it to the meeting.',
    },
    print: { 'zh-TW': '打開可列印的一頁', en: 'Open the printable page' },
    reuse: {
      'zh-TW': '圖表的轉載授權，站方還在確認，見「關於」。',
      en: 'The reuse licence for the charts is still being confirmed by the site’s owner; see About.',
    },
    about: { 'zh-TW': '關於這個網站', en: 'About this site' },
  },
  /** /print/brief/ — V47, one A4 page. */
  brief: {
    metaTitle: { 'zh-TW': '一張紙的量測需求', en: 'The measurement brief on one page' },
    metaDescription: {
      'zh-TW': '紅燈旁的行人吸進什麼，台灣沒有人量過。這一頁是給研究人員和機關的量測提議，A4 一頁，可以列印。',
      en: 'Nobody in Taiwan has measured what pedestrians breathe at a red light. A one-page measurement proposal for researchers and agencies, ready to print.',
    },
    screenNote: {
      'zh-TW': '這一頁是為了列印做的：A4 直印一頁。',
      en: 'This page is made for printing: one A4 page, portrait.',
    },
    printButton: { 'zh-TW': '列印', en: 'Print' },
    back: { 'zh-TW': '回到「沒有人量過的事」', en: 'Back to “What nobody has measured”' },
    kicker: { 'zh-TW': '量測需求 · 本站提議', en: 'Measurement brief · our proposal' },
    title: { 'zh-TW': '紅燈旁的行人吸進什麼，|台灣沒有人量過', en: 'What pedestrians breathe at a red light |has never been measured in Taiwan' },
    gapLabel: { 'zh-TW': '空白', en: 'The gap' },
    proposalLabel: { 'zh-TW': '我們提議這樣量', en: 'How we propose to measure it' },
    whoLabel: { 'zh-TW': '誰量得出來', en: 'Who could do it' },
    promiseLabel: { 'zh-TW': '我們的承諾', en: 'Our promise' },
    more: { 'zh-TW': '每一筆出處、所有空白，和寫給環保局的信：', en: 'Every source, every blank, and the letter to the bureau:' },
    checked: { 'zh-TW': '證據查核日期：{date}', en: 'Evidence checked: {date}' },
  },
});
