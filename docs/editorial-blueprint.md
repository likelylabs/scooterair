> **Superseded on 2026-11-26 by `docs/redesign-brief.md`.** Kept for history; where the two differ, the redesign brief wins.

# Editorial blueprint: 一個紅燈，90 秒 / One red light, ninety seconds

Status: final blueprint for page builders. Written 2026-11-25. Supersedes the three proposals ("one-red-light", "follow-the-fumes", "your-street").

Evidence base: `evidence-digest.md` (checked 2026-11-25), `src/data/claims-policy.ts`, `research/redlight/*.json`, `research/econ/*.json`, `research/papers/*.json`. Every number in this document is a digest item unless it is marked **[research file]** (in a checked research file but not in the digest; needs a registry entry before it is published) or **[engine]** (must be computed by the calculator, never typed by hand).

How to read this document:

- Parts 1 to 7 are the editorial design. Part 3 is the home page, chapter by chapter, with publishable copy in both languages.
- Part 8 divides the build among workstreams. Part 9 lists the facts the registry must hold before pages are built.
- Appendix A records how every judge's must-fix item was resolved. Appendix B lists what the site owner needs to confirm.
- Headlines carry a `|` phrase mark where the line should break (see `Phrased.astro`).

---

## 0. Decisions in one screen

**Spine.** The home page is one red light at one Taiwanese crossing (from "one-red-light"). It was ranked first by three of four judges and is the only proposal whose inference stops where the evidence stops.

**What changed in the spine.**

| Change | Why |
|---|---|
| The drawn haze never thickens with the countdown. It is one constant hatched layer labelled "present, amount not measured". | Scientist, parent and campaign director all marked the ramp as the first thing a critic would screenshot. |
| The scene is six static keyframes and two camera positions, one frame per chapter. No pinned scene on phones. | Parent: a pinned scene leaves half a screen for text. Campaign director: the pinned build is too heavy for the time left and untested in LINE's browser. |
| A seven-line 懶人包 and question chips sit directly under the hero. | Parent reads for 90 seconds, not six minutes. |
| The rider is a person in the first frame and the "we are both" line is in the prologue. | Rider: in the original the rider was "the smoke" for five chapters. |
| The money chapter states dates and city status. It has no "N days left" counter. | Rider and scientist: days left is not money left; Kaohsiung's money ran out on 11 August. |
| The site ships in two waves. Wave 1 before 31 December, wave 2 in January. | Campaign director: 36 days remain; design the post-deadline state first. |

**Grafted from "follow-the-fumes".** 「鼻子是警報器，不是測量儀」 as the Link 4 headline; concede-first openers; one fixed set of verbs per kind of claim; evidence strength drawn as line style; the hatched "unmeasured" haze; the rule that no health statistic shares a frame with the scene; 「不是量了沒事，是還沒有人去量」; 「他說的是實話。只是他拿錯了尺」; the pivot line, corrected to the scooters' share; the money voice (「免得你到車行才發現」, 「先講結論：不一定」); the 誰划算 table; the 「這項研究沒有說什麼」 column.

**Grafted from "your-street".** Question pages with their own share cards (caveat inside the image); question chips in the reader's words; the 「我們沒有說」 and 「什麼會讓我們改口」 boxes; three calculator verdicts; the ledger 消失的／留下的／搬走的; 「請來量我家路口」; the school-gate poster and the 管委會 note; the tile map with 「查不到」; the rule that a gap is always followed by who could measure it; the state-driven deadline handling; the rider line 「你前面那台的排氣管就在你腳邊」.

**Where judges disagreed.**

| Question | Decision | One-line reason |
|---|---|---|
| Hero headline: 「一個紅燈，90 秒」 (parent) or 「那個味道，你也聞過」 (campaign director)? | Both. The smell line is the kicker above the headline and the default share-card line. | The title is the idea people repeat; the smell is the recognition that makes them stop. |
| `/90/` film: drop (scientist's first option) or keep (parent, campaign director)? | Keep, rebuilt around the gap, in wave 2. | It is the one asset a parent would forward; the scientist's second option (gap and label inside the frames) removes the objection. |
| Money block near the top (campaign director) or one calculator call to action only (parent)? | A text chip 「我換得起嗎？」 under the hero; the one calculator button is in the money chapter. | Reachable for the rider without a sales pattern on health chapters. |
| Persistent 「跳到：換電動」 chip (campaign director liked it; rider: "follows me like a salesman")? | Dropped. The countdown rail opens a jump menu that includes 算錢. | Same reach, no selling. |
| Deadline counter as finale (campaign director) or no counter (rider, scientist)? | No counter before the deadline. After it, a counter of days without a 2027 programme. | A count aimed at government sells nothing and cannot be false for any reader. |
| 「先想一下，再看我們怎麼接」 (campaign director) or plain 「看我們怎麼接」 (parent)? | 「看我們怎麼接」, with the reveal still closed by default. | The parent's ear is the test of voice; the reader still meets the open question first. |
| Per-kilogram or per-kilometre CO ratio first? | Per kilometre first, both at equal size, on `/evidence/` only. | Scientist and campaign director agree per-kilogram flatters the case. |
| Gap badge wording: 「尚未證實」 or 「沒人量過」? | 「沒人量過」. | Parent: nobody says 尚未證實 at a crossing; it is also the more precise statement. |
| Seven beats at most (parent) or the full chain? | Seven links plus four short beats, each held to a strict budget. | The owner asked for every link of the chain; the 懶人包 serves the reader who stops after one screen. |

---

## 1. The idea

**一個紅燈，90 秒。** The home page is one red light at one Taiwanese crossing, and the reader never leaves it. A pack of gasoline scooters waits in the stop box and the two-stage turn box. People walk the crosswalk in front of them. On the corner a schoolchild in a yellow cap waits for the same green. Scrolling runs the LED countdown from 90 to 00, and each link of the evidence chain is something about those seconds: what leaves the tailpipe, where it comes out, what the people beside it breathe, what is in it, what breathing traffic exhaust does over time, and who stands closest. The third of those is an empty chart, because nobody has measured it, and the page is built around that empty chart instead of hiding it. At 00 the light turns green. Then the reader is shown six sourced facts and one blank, and is asked to join them; our own join is closed until asked for and wears the weakest badge on the page. The countdown then resets to 90 and the same red light replays with electric scooters. The page ends on the practical question: what switching costs, for whom it adds up, and what to do if it does not.

The site keeps two visual registers apart. The scene is always an illustration and says so in the frame. Charts and numbers are always sourced. No health statistic ever shares a frame with the scene.

**The sentence a reader repeats to a friend**

- 中文：「紅燈旁邊那股機車味，吸進多少沒人量過；但換成電動，那根排氣管就不見了。」
- English: "Nobody has measured what you breathe beside the scooters at a red light. But go electric, and that tailpipe is gone."

**The line said once, plainly, because it is the accurate benefit**

- 中文：「換車，拿掉的是你那根排氣管。受惠的是站在你旁邊的人，還有騎在你後面的那一台。」
- English: "Switching removes your tailpipe from other people's air: the people beside you, and the rider behind you."

Keep the existing site name (行人呼吸 / ScooterAir) and tagline (等紅燈的時候，我們吸進了什麼).

---

## 2. Voice

**Register.** A neighbour who has read the papers, standing at the same crossing. Short sentences. 你, never 您. 我們 is the site. One number per sentence, and who was measured. No exclamation marks, no 「你知道嗎」, no 毒氣／殺手／致命. Street vocabulary is used without explanation: 機車, 待轉區, 停等區, 斑馬線, 小黃帽, 排氣管, 怠速, 定檢, 汰舊換新, 白牌／綠牌, 換電／充電, 月租, 車行, 打得平／打不平. English is written, not translated, in British spelling; "gasoline scooter" for the vehicle and "petrol" for the fuel bill, as in existing copy.

**Sample sentences**

1. Conceding first.
   - 「先講對機車有利的：全台灣排出來的 PM2.5，機車只占 1.3%。」
   - "First, the fact in the scooter's favour: scooters produce 1.3% of Taiwan's PM2.5 emissions."
2. The gap.
   - 「不是量了沒事，是還沒有人去量。」
   - "Not measured and found fine. Not measured."
3. To riders.
   - 「車陣裡的人和路口的人，常常是同一批：早上騎車上班，中午走路去買便當。」
   - "The people in the pack and the people on the corner are often the same people: we ride to work in the morning and walk out for a lunch box at noon."
4. Money.
   - 「一個月騎三、五百公里的人，月租電池會比加油貴。這件事我們先講，免得你到車行才發現。」
   - "If you ride 300 to 500 km a month, a battery subscription costs more than petrol. We would rather you heard it here than at the dealership."

**Uncertainty: one set of verbs per kind of claim.** A reader should be able to tell the kinds apart by wording alone, without the badge.

| Kind of claim | 中文 | English | Badge | Never |
|---|---|---|---|---|
| Measured in Taiwan | 量到 | measured | 台灣實測 | |
| Official figure | 統計、清冊、規定 | official figure, inventory, rule | 台灣官方資料 | 量到 |
| Model result | 推估、模擬 | estimated, modelled | 台灣模式推估 | 量到、實測 |
| Epidemiology | 有關、跟著變 | is associated with, moves with | 台灣實測 or 國際證據 | 導致、造成、引起 / causes, leads to |
| Our own step | 我們的推論：… | Our inference: … | 我們的推論 | stated as fact |
| Our sums | 本站計算 | our arithmetic | 本站計算 | |
| Gap | 沒有人量過 | nobody has measured this | 沒人量過 | 尚待研究、可能、或許 stacked as hedges |

Four fixed moves, used the same way everywhere:

1. Associations are 「有關」. The site says once, on the home page: 「研究看到的是『有關』，不是『造成』。這兩個詞差很多，我們不會混著用。」
2. A gap is stated in the active voice, in the same type size as a finding, and is followed within two sentences by who could measure it and how the reader can ask. A gap never ends a paragraph.
3. Every inference begins 「我們的推論：」 and carries the inference badge.
4. The site volunteers the numbers that cut against it before a critic can: 1.3% of PM2.5; benzene down 73%; gasoline cars emit more benzene than scooters; the highest named sidewalk peaks were incense and food stalls; the peak may come at pull-away, not at idle.

**Riders.** Four rules.

1. A rider is a person in the first frame, and the prologue says most of us are both rider and pedestrian.
2. The grammatical subject of a sentence about pollution is 排氣管, 引擎, 規定, 補助 or 路口設計. It is never 騎士 or 機車族. 烏賊車 appears only as the name of the official reporting channel.
3. Nobody is told to feel bad about a scooter they need. The ask is 「下一台」 ("your next one").
4. "Not this year" is a full destination with real actions. The site says outright 「我們不會叫你硬換」.

**Binding copy rules.** These come from the scientist's review and the claims policy. A reviewer checks every string against them.

| # | Rule |
|---|---|
| R1 | Never write that idling at a red light is 合法, 不違規, 違規 or "legal/illegal". Write: 「現行的怠速規定管的是停車等候超過三分鐘的車；一個普通的紅燈，不在它要管的範圍裡。」 Whether the rule reaches scooters is unresolved. |
| R2 | Every PM2.5 health result says "all sources" or "traffic as a whole" in the same sentence or the one after. |
| R3 | Never rank carbon monoxide, benzene and ultrafine particles by harm. Say only that they cannot be smelled. *(As built, release 2: carbon monoxide has no smell; particles are only ever "too small to see", never "cannot be smelled". See `src/data/claims-policy.ts` r3 and the /about/ ufp-smell correction; the draft lines below that give particles no smell are superseded.)* Carbon monoxide is a marker of exhaust, not a demonstrated hazard at the kerb; the site says so once (Link 4). |
| R4 | Odour thresholds are orders of magnitude (十億分之幾, 百萬分之幾), never single values. |
| R5 | Stroller figures: "usually 5 to 15% higher"; 59% is PM2.5 in one US roadside study; 44% is "up to", fine particles, one UK experiment; two studies found no difference; none in Taiwan. A school-age child stands above the stroller band; what is established for them is faster breathing. |
| R6 | The 1995–96 schoolchildren survey is always dated and described as station data. |
| R7 | Emission shares are labelled 排放量. They are drawn on a 0–100% scale. |
| R8 | "Zero" is used only for a scooter's own exhaust. The crossing is never "zero": cars, buses and background remain. |
| R9 | No purchase button or price appears in Links 1 to 6, the green beat or the connection. |
| R10 | A day count is shown only with the reader's city status, and only when the result is a verdict A. |
| R11 | The scene never shows a concentration changing over time, and never shows a scooter-specific pull-away surge. |
| R12 | Never write 舊車 alone for scrappage. Write 出廠滿 10 年的機車, and let the calculator apply each city's own rule. |
| R13 | The three-scooter case study (14 times, 32 times) appears only on `/evidence/`, labelled 三台車的個案, in a visually separate panel. |
| R14 | The never-smoker lung cancer figures appear only on `/evidence/#not-used`. |
| R15 | Wu 2021 is always "commuters on bicycles and scooters, Taipei", never "pedestrians". Chuang 2020 and Wang 2021 are never merged into one range. |
| R16 | Reasons for the fall in electric sales are given only as 「媒體報導認為」. |

`flagCopy()` from `claims-policy.ts` runs over every string in CI. A match fails the build unless it is recorded in a reviewed allow-list keyed by string id and rule id. Several strings in this blueprint will match on purpose and must be allow-listed after review: 「不是『造成』」, every use of 怠速, the 「我們沒有說」 box, 「這不是零污染」, and the English word "ninety", which trips the pattern written for the 94% rule.

**Evidence badges.** The four levels in `ui.ts` cannot label an emissions inventory or a model honestly. Reader-facing badges follow the registry's evidence types, plus two for the site's own voice:

| Badge 中文 | English | Registry type | Line style on the chain |
|---|---|---|---|
| 台灣實測 | Measured in Taiwan | `measured-tw` | solid, filled |
| 台灣官方資料 | Official Taiwan data | `official-tw` | solid, filled |
| 台灣模式推估 | Modelled for Taiwan | `modelled-tw` | solid, outline |
| 國際證據 | International evidence | `international` | solid, outline |
| 市場公開價格 | Published prices | `market-tw` | not on the chain |
| 本站計算 | Our arithmetic | `derived` | dashed |
| 我們的推論 | Our inference | (site voice) | dashed |
| 沒人量過 | Nobody has measured this | (gap) | open break, hollow ends |

A fact whose registry confidence is `secondary` also carries the small tag 次級來源. Reader-facing copy writes 台灣; the registry labels currently write 臺灣 and should be brought into line.

---

## 3. Home page, chapter by chapter

### 3.0 Mechanics

**The crossing, stated once so everyone draws the same one.** Two streets, A and B. The scene looks side-on at street B's approach while B has a red light.

- B's pack waits in the scooter stop box (機慢車停等區), behind B's stop line. Their tailpipes point backwards, at the queue behind them, not at pedestrians.
- B's crosswalk lies in front of the stop line. People crossing street B walk it during B's red, in front of the pack.
- The two-stage turn box (待轉區) is painted beyond that crosswalk, inside the junction. Riders who came from street A wait in it, facing B's direction of travel, for the same green. Their tails face back toward B's crosswalk. This is the gap the marking rule sets at 50 cm or more.
- The child in the yellow cap stands on the corner waiting to cross street A. The child shares the pack's red and steps off the kerb at the pack's green, walking parallel to the scooters as they pull away.

This reading follows Articles 174-2 and 191 of the marking rules as summarised in `research/redlight/intersection-peaks.json` (`moj-rules-geometry`). A traffic engineer must confirm it before V1 and V6 are drawn (Appendix B, item 8).

**Six keyframes, two cameras.** `StreetScene` gains a `frame` prop. Each chapter places one static frame in its `art` slot.

| Frame | Camera | What is drawn |
|---|---|---|
| K0 `empty` | wide | B's signal red, LED 90. Stop box and turn box empty. On the corner: the child in the yellow cap, about 120 cm tall, and an older woman with a cane. An adult with a stroller approaches the crosswalk. No haze. |
| K1 `pack` | wide | The pack has arrived: stop box full, four or five scooters in the turn box. One front-row rider has the visor up and a visible face. People cross in front of the pack. The low layer appears as a hatched band from the road to about one metre, labelled in the frame 「有廢氣｜多濃沒人量過」. Short warm ribbons sit at each tailpipe mouth and nowhere else. |
| K2 `kerb` | kerb level, beside the corner | A height ruler from 0 to 180 cm. The first metre is shaded and labelled 「排氣管在這一公尺裡」. The stroller band, 55 to 85 cm, is bracketed and sourced. The child's and adults' mouth heights are small ticks labelled 示意. Mouths are marked with ticks, never with rings, because rings are the site's symbol for carbon monoxide. An `emphasis` prop switches which air layer is at full contrast: `fumes`, `co`, `ufp` or `heights`. |
| K3 `paused` | as K1 | K1 in line art, dimmed, with the chip 「倒數暫停」. Used behind data. |
| K4 `green` | wide | B's signal green. The front scooters are past the crosswalk; the child has one foot off the kerb. The hatched band is unchanged. No extra puffs and no surge. A tag at the stop line reads 「起步那一下：國外量的是汽車和柴油車。機車，沒人量過」. |
| K5 `clean` | wide | K1 with electric scooters. No ribbons, no rings, no hatched band from the pack. The stipple is unchanged. A car in the far lane keeps one small ribbon: other traffic is still there. LED back at 90. |

**How air is drawn from now on.**

- The low layer is a hatched band (`Haze kind="unmeasured"`, new), at one fixed density in every red-light chapter. It does not change with the countdown. The disclosure strip says so.
- Warm ribbons: only at tailpipe mouths, fixed length.
- Hollow rings (carbon monoxide): scattered inside the hatched band at a fixed count.
- Stipple (ultrafine particles): drawn across the whole street at one density, not rising from the scooters, labelled 「車流裡的超細微粒，不只來自機車」. The digest holds no measurement of ultrafine emissions from Taiwanese scooters. The stipple stays in K5.
- `Chapter haze` is `0.5` with `hazeKind="unmeasured"` in Links 1 to 6 and the green beat, and `0` everywhere else. Density no longer varies by chapter.

**Layout.**

- Phones (baseline, wave 1): each chapter is a normal `Chapter` with its frame at the top. Nothing is pinned except the countdown rail (V2), a 44 px strip under the header: LED count, seven pips, current link name. Tapping it opens the jump menu: the seven links, 接起來, 算錢, 行動.
- The LED count on the rail interpolates with scroll progress inside each chapter (small script). Without JavaScript, each chapter's kicker prints its count in text, for example 「紅燈 · 剩 64 秒」. The LED is not an `aria-live` region.
- Width of 960 px and above (enhancement, wave 2): two columns, with the scene pinned in the left column and frames cross-fading. Test in LINE's in-app browser before this ships to phones in any form.
- Reduced motion: no cross-fades, no drift.

**Budget per chapter on a phone.** Kicker, headline, a deck of about 100 Chinese characters at most (the money chapter runs a little longer), a body of at most three short paragraphs of about 100 characters each (Link 7 has four), one lead visual, one caveat, one action, one hand-off line. Everything else sits behind 「看這一環的全部證據」, which links to `/evidence/#link-n` and the matching question page. The full scroll is about seven minutes of reading; the 懶人包 is thirty seconds, and it is written for the reader who stops there.

**Countdown allocation.** Prologue 90. Link 1 from 90 to 78. Link 2 from 78 to 64. Link 3 from 64 to 50. Link 4 from 50 to 38. Link 5 paused at 38. Link 6 from 38 to 05. Green from 05 to 00. Link 7 resets to 90.

---

### 3.1 序：紅燈亮了 / Prologue: the light turns red

- **Place.** Before Link 1. Count 90. Frame K0. Tone `street`, haze 0. `id="top"`.
- **Kicker.** 那個味道，你也聞過。 / You know that smell.
- **標題.** 「一個紅燈，|90 秒」
- **Headline.** "One red light. |Ninety seconds."
- **導言.** 「一整排機車在旁邊怠速，你站在路口，等同一個綠燈。這種紅燈你等過幾千次了。這一次放慢看：這 90 秒裡，哪些事有人量過，哪些沒有。」
- **Deck.** "A row of scooters idles beside you while you stand at the corner waiting for the same green. You have waited through thousands of these. This time, slowly: what has been measured about these ninety seconds, and what has not."
- **第二段 (the rider line).** 「車陣裡的人和路口的人，常常是同一批：早上騎車上班，中午走路去買便當。」 / "The people in the pack and the people on the corner are often the same people: we ride to work in the morning and walk out for a lunch box at noon."
- **Microcopy.** 「往下滑，倒數才會走。」 / "Scroll, and the countdown runs."
- **Button (wave 2 only).** 「播放 90 秒」 / "Play the 90 seconds" → `/90/`.
- **Disclosure strip, always visible under the frame.** 「畫面是示意圖。霧畫成斜線，是因為它有多濃沒有人量過；它不會隨著倒數變濃。90 秒是我們說故事用的長度，不是統計數字。每個數字都有出處。」 / "The picture is an illustration. The haze is drawn as hatching because nobody has measured how dense it is, and it does not thicken as the clock runs. Ninety seconds is our storytelling length, not a statistic. Every number has a source."
- **Evidence and badge.** None claimed. The scene is the reader's own experience.
- **Hand-off.** 「先給趕時間的人：30 秒版。」 / "For anyone in a hurry: the 30-second version."

### 3.2 30 秒懶人包 / The 30-second version

- **Place.** Directly under the hero. `id="brief"`. Tone `sunken`. No frame.
- **標題.** 「30 秒懶人包：|七件事」 / "The 30-second version: |seven things"
- **The seven lines (V3).** Each is true when read alone, carries its badge, and links to its chapter. The same text is used on question pages, share cards and the film, from one source in `i18n` (`chain.summary`).

| # | 中文 | English | Badge |
|---|---|---|---|
| 1 | 論排放量，機車的粉塵很少，油氣和一氧化碳很多。 | By emissions, scooters put out little dust and a lot of fumes and carbon monoxide. | 台灣官方資料 |
| 2 | 排氣管離地不到一公尺；標線規則只要求待轉區離斑馬線 50 公分。 | The tailpipe is under a metre off the ground; the marking rules ask for 50 cm between the turn box and the crosswalk. | 國際證據 · 台灣官方資料 |
| 3 | 站在旁邊的人吸進多少，台灣沒有人量過。 | How much the person standing beside it breathes, nobody in Taiwan has measured. | 沒人量過 |
| 4 | 聞到味道，代表你站在廢氣裡；裡面的一氧化碳沒有味道，苯也聞不出來。 | If you can smell it, you are standing in exhaust; the carbon monoxide in it has no smell, and you cannot smell the benzene. | 國際證據 |
| 5 | 長年吸車流廢氣，和心臟病、肺癌、氣喘有關；一個紅燈會怎樣，沒有研究。 | Years of breathing traffic exhaust are associated with heart disease, lung cancer and asthma; what one red light does, no study says. | 國際證據 · 沒人量過 |
| 6 | 台北的研究裡，騎機車通勤的人吸到的 PM2.5 最高；小孩呼吸比大人快。 | In a Taipei study, scooter commuters breathed the most PM2.5; children breathe faster than adults. | 台灣實測 · 國際證據 |
| 7 | 電動機車沒有排氣管。 | An electric scooter has no tailpipe. | (fact of the machine; no badge) |

- **Under the list.** 「六件有出處，一件沒人量過。怎麼接起來，往下看。想直接問的，點這裡：」 / "Six have sources; one has never been measured. Scroll to see how they join. Or go straight to your question:"
- **Question chips (V4).** In this order: 「為什麼那麼臭？」 「小孩吸得比我多嗎？」 「App 說『良好』，是它錯了嗎？」 「只是等個紅燈，有差嗎？」 「騎車的人自己呢？」 「我換得起嗎？」. The last goes to `/electric/`; the others to `/questions/<slug>/`. Then a text link: 「十題全部」.
- **One action link, not a button.** 「誰來量？請環保局來量我家路口 →」 / "Who will measure it? Ask the city to measure my crossing →" (`/unmeasured/#ask`).
- **Caveat.** The badges are the caveat here. No further copy.
- **Hand-off.** 「剩 90 秒。車陣到了。」 / "Ninety seconds. Here comes the pack."

### 3.3 第 1 環：車陣到了 / Link 1: the pack arrives

- **Place.** Link 1 of 7, what leaves the tailpipe. Count 90 → 78. Frame K1. `link={1}`, `phase="red"`, haze 0.5 `unmeasured`.
- **Kicker.** 紅燈 · 剩 90 秒
- **標題.** 「粉塵很少，|油氣很多」
- **Headline.** "Little dust. |A lot of fumes."
- **導言.** 「先講對機車有利的：全台灣排出來的 PM2.5，機車只占 1.3%。但機車排的主要不是粉塵。沒燒完的油氣，機車占一成；一氧化碳，占 15.6%。」
- **Deck.** "First, the fact in the scooter's favour: scooters produce 1.3% of Taiwan's PM2.5 emissions. But dust is not mainly what a scooter emits. Of the country's unburnt fuel vapour, scooters emit a tenth; of its carbon monoxide, 15.6%."
- **內文.** 「台北有一座隧道，車流大約一半是機車。裡面的一氧化碳，幾乎跟著機車的數量起伏；同一座隧道裡的粉塵，主要來自大型車。」
  「還有一個好消息：二行程機車退場之後，機車排的苯八年少了 73%，油氣少了 46%。排氣管換掉，排放真的會少。這件事後面還會用到。」
- **Body.** "In one Taipei tunnel, about half the traffic is scooters. The carbon monoxide inside rises and falls almost in step with the number of scooters; the dust in the same tunnel comes mainly from heavy vehicles."
  "And some good news: as two-stroke scooters left the road, scooter benzene emissions fell 73% in eight years and fuel vapour 46%. Change the tailpipe and emissions really do fall. We will come back to this."
- **Evidence and badges.**
  - Digest Link 1, TEDS 13.0 shares (PM2.5 1.3%, NOx 2.2%, NMHC 10.0%, CO 15.6%): 台灣官方資料.
  - Digest Link 1, Ting 2023 tunnel (CO tracked motorcycle flow; particles dominated by heavy vehicles): 台灣實測. The per-kilometre and per-kilogram ratios are on `/evidence/` only (V20).
  - Digest Link 1, Tsai 2023 trend 2013–2021 (benzene −73%, hydrocarbons −46%) and benzene tonnages (286 t against 545 t): 台灣模式推估.
- **Visual.** V5, four stacked bars on a 0–100% scale.
- **這一段沒有說的事.** 「這是『排放量』的占比，不是你吸進去的比例；排得多，不代表每個路口都濃。交通排的苯，汽油車（545 公噸）比機車（286 公噸）多。73% 和 46% 是推估的排放量，不是量到的空氣。」
- **Caveat.** "These are shares of emissions, not of what you breathe; a large output does not mean thick air at every crossing. Gasoline cars emit more traffic benzene (545 t) than scooters (286 t). The 73% and 46% are estimated emissions, not measured air."
- **你現在可以做的.** 「家裡那台機車，查一下下一次定檢是什麼時候。」 / "Check when your household's scooter is next due for its exhaust inspection." 〔台灣官方資料〕
- **交棒.** 「排什麼知道了。下一題：排在哪裡？」 / "That is what comes out. Next: where?"

### 3.4 第 2 環：引擎沒有熄 / Link 2: the engines stay on

- **Place.** Link 2 of 7, where it comes out. Count 78 → 64. Frame K2, `emphasis="heights"`.
- **Kicker.** 紅燈 · 剩 78 秒
- **標題.** 「排氣管離地不到一公尺。|標線規則只要求留 50 公分」
- **Headline.** "The tailpipe is under a metre off the ground. |The marking rules ask for 50 cm."
- **導言.** 「工廠的廢氣從煙囪排到高空；機車的廢氣排在路面上，和嬰兒車裡孩子的口鼻落在同一個高度範圍。依標線規則，待轉區的後緣離行人穿越道，至少要留 50 公分。這是規定的下限，不是每個路口實際的距離。」
- **Deck.** "A factory sends its exhaust up a chimney. A scooter releases it at road level, in the same height range as the face of a child in a stroller. Under the road-marking rules, the rear edge of the two-stage turn box must be at least 50 cm from the crosswalk. That is the minimum the rule sets, not the distance at any given crossing."
- **內文.** 「待轉區的車，車尾朝著斑馬線。停等區的車在停止線後面，排氣管朝的是後方的車陣，不是行人。」
  「引擎為什麼不熄？現行的怠速規定，管的是停車等候超過三分鐘的車；一個普通的紅燈，不在它要管的範圍裡。我們不是在說誰違規，是路口本來就這樣運作。」
- **Body.** "Scooters in the turn box have their tails toward the crosswalk. Scooters in the stop box sit behind the stop line; their tailpipes point at the queue behind them, not at pedestrians."
  "Why do the engines stay on? The anti-idling rule is written for vehicles stopped and waiting more than three minutes; an ordinary red light is not what it covers. We are not saying anyone is breaking a rule. This is how the crossing is designed to work."
- **Evidence and badges.**
  - Digest Link 2, Sharma & Kumar 2018 (tailpipes within the first metre above the road; stroller breathing height 0.55–0.85 m): 國際證據.
  - Digest Link 2, marking rules (turn box rear edge at least 0.5 m from the crosswalk, adjustable; stop box 2.5–6 m deep): 台灣官方資料.
  - Digest Link 2, anti-idling rule (three minutes; exempts traffic waits, rain, days above 30 °C), worded per R1 and `research/redlight/policy-idling.json`: 台灣官方資料.
- **Visual.** V6, plan of one approach, with V7 (the first metre) as the frame itself.
- **這一段沒有說的事.** 「一台機車怠速一分鐘排多少、一個紅燈前面停幾台，台灣都沒有公開的量測。『不到一公尺』出自一篇國際回顧對一般車輛的描述，不是拿機車量出來的。」
- **Caveat.** "How much one scooter emits per minute of idling, and how many queue at a red light, has not been published for Taiwan. 'Under a metre' comes from an international review describing vehicles in general, not from measuring scooters."
- **你現在可以做的.** 「等的時候，站得離待轉區和停止線遠幾步。這是我們的推論，不是量出來的效果。」 / "While you wait, stand a few steps back from the turn box and the stop line. This is our inference, not a measured benefit." 〔我們的推論〕
- **交棒.** 「排什麼、排在哪，都有出處。那站在旁邊的人，吸進了多少？」 / "What comes out and where are both documented. So how much does the person standing beside it breathe?"

### 3.5 第 3 環：空白 / Link 3: the blank

- **Place.** Link 3 of 7, what people breathe. Count 64 → 50. Frame K3 behind the chart. Tone `night`. This chapter is the centre of the page.
- **Kicker.** 紅燈 · 剩 64 秒
- **標題.** 「這一格，|沒有人量過」
- **Headline.** "This box is empty. |Nobody has measured it."
- **導言.** 「一整排機車怠速等紅燈的時候，旁邊的行人吸進多少一氧化碳、多少苯、多少超細微粒？我們把找得到的研究都翻過了：在台灣，沒有人量過。不是量了沒事，是還沒有人去量。」
- **Deck.** "Beside a row of scooters idling at a red light, how much carbon monoxide, benzene and ultrafine dust does a pedestrian breathe? We went through every study we could find. In Taiwan, nobody has measured it. Not measured and found fine. Not measured."
- **Visual, immediately after the deck.** V8, the empty chart. Caption: 「這不是版面錯誤。這張圖的數據不存在。」 / "This is not a layout error. The data for this chart does not exist."
- **內文.** 「那看空品 App 不就好了？App 的數字來自測站。如果有人拿 PM2.5 告訴你，路口跟別的地方差不多，他說的是實話：台北的交通測站和一般測站，2024 年只差 0.1 微克。只是他拿錯了尺，機車排的主要不是粉塵。」
  「油氣呢？台北一項研究讓通勤的人帶著儀器上路，再和最近的測站比。PM2.5，兩邊對得上。苯類，幾乎對不上。」
- **Body.** "Why not just check the air-quality app? Its numbers come from monitoring stations. If someone uses PM2.5 to tell you the crossing is much like anywhere else, they are telling the truth: in 2024 Taipei's traffic stations and general stations differed by 0.1 µg/m³. They are holding the wrong ruler. Dust is not mainly what a scooter emits."
  "And the fumes? A Taipei study sent commuters out carrying instruments and compared them with the nearest station. For PM2.5 the two agreed. For the benzene family they barely matched."
- **Evidence and badges.**
  - Digest Link 3, the central gap: 沒人量過.
  - Digest Link 3, Taipei traffic stations against general stations (+3.6 µg/m³ in 2017, +0.1 in 2024): 台灣官方資料.
  - Digest Link 3, Wu 2021 (personal benzene-family readings against the nearest station, r from −0.01 to 0.38; PM2.5 r from 0.67 to 0.86): 台灣實測. The coefficients are on `/evidence/` (V25), not here.
- **Second visual, small.** V9, the PM2.5 gap closing from 3.6 to 0.1.
- **這一段沒有說的事.** 「那項研究量的是騎腳踏車和機車的通勤者，不是站在路口的行人，而且只有台北。畫面上的斜線是我們畫的，不是量出來的；風一大，這一層可能很快就散。」
- **Caveat.** "That study measured commuters on bicycles and scooters, not pedestrians standing at a crossing, and only in Taipei. The hatching on screen is drawn, not measured; in wind this layer may clear quickly."
- **你現在可以做的 (the gap is followed by who can fill it).** 「這一格，環保局量得出來。把你家附近的路口告訴他們：請來量我家路口 →」 / "A city environmental bureau can fill this box. Tell them which crossing: ask them to measure mine →" (`/unmeasured/#ask`)
- **The pledge, set as a pull quote.** 「有人量了，結果不管站在哪一邊，我們都會放上首頁。」 / "When someone measures it, the result goes on this page, whichever way it points."
- **交棒.** 「儀器還沒到。但你身上有一個偵測器，一直開著。」 / "No instrument has been here yet. But you carry a detector that is always switched on."

### 3.6 第 4 環：鼻子 / Link 4: the nose

- **Place.** Link 4 of 7, what those compounds do. Count 50 → 38. Frame K2, `emphasis="fumes"`, with the three-layer key under it.
- **Kicker.** 紅燈 · 剩 50 秒
- **標題.** 「鼻子是警報器，|不是測量儀」
- **Headline.** "Your nose is an alarm, |not a gauge."
- **導言.** 「聞到廢氣味，代表你人就站在廢氣裡。但它只說『有』，不說『多少』。而且廢氣裡有幾樣東西，鼻子不會通知你。」
- **Deck.** "If you can smell exhaust, you are standing in it. But the smell says 'present', not 'how much'. And some of what is in exhaust never reaches you as a smell."
- **內文.** 「那股味道到底是哪幾種成分，老實說，沒有人鑑定過。比較可能的是醛類：空氣裡只要十億分之幾，人就聞得到，台灣的機車廢氣裡也驗得出甲醛和乙醛。」
  「聞不到的有三樣。一氧化碳沒有味道。苯要濃到百萬分之幾、甚至幾十才聞得到，門檻比醛類高得多。車流裡的超細微粒也沒有味道。」
  「苯被國際癌症研究機構列為第 1 級，確定會讓人致癌；世界衛生組織說，找不到可以建議的安全濃度。汽油引擎廢氣『整體』是 2B 級，可能致癌。不是第 1 級，我們不會把它講成第 1 級。」
- **Body.** "Which compounds make that smell? Honestly, nobody has identified them. Aldehydes are the likelier candidates: people can smell them at a few parts per billion, and formaldehyde and acetaldehyde are found in Taiwanese scooter exhaust."
  "Three things you cannot smell. Carbon monoxide has no odour. Benzene has to reach parts per million before a nose notices, a threshold far above the aldehydes'. The ultrafine particles in traffic exhaust have no smell either."
  "Benzene is classed by the International Agency for Research on Cancer as Group 1, carcinogenic to humans; the WHO says no safe level can be recommended. Gasoline engine exhaust as a whole is Group 2B, possibly carcinogenic. It is not Group 1, and we will not call it that."
- **Said once, here (R3).** 「一氧化碳在這個故事裡是『廢氣的記號』：它跟著機車車流走，所以拿它來認廢氣。路口的一氧化碳有沒有高到傷身，沒有人量過。」 / "In this story carbon monoxide is a marker of exhaust: it moves with scooter traffic, so we use it to recognise exhaust. Whether it reaches a harmful level at a crossing, nobody has measured."
- **Evidence and badges.**
  - Digest Link 4, odorants unidentified: 沒人量過.
  - Digest Link 4, aldehyde and benzene odour thresholds, given as orders of magnitude per R4 and `research/redlight/smell-chemistry.json`: 國際證據. No multiple is printed, because published thresholds differ by one to two orders of magnitude.
  - Digest Link 4, formaldehyde and acetaldehyde among the dominant carbonyls in Taiwanese scooter exhaust: 台灣實測.
  - Digest Link 4, carbon monoxide and ultrafine particles odourless; IARC classifications; WHO on benzene: 國際證據.
- **Visual.** V10, the two-column strip 聞得到／聞不到. This is the only place the device is used.
- **這一段沒有說的事.** 「這個分級講的是『會不會』，不是『吸多少會』。路口的苯有多濃，回到上一格：沒有人量過。味道重不代表傷害大，沒味道也不代表沒事。」
- **Caveat.** "The classification says whether something can cause cancer, not how much it takes. How much benzene is at the crossing: see the empty box. A strong smell does not mean more harm, and no smell does not mean none."
- **你現在可以做的.** 「把這一段傳給那個說『聞習慣就好』的人。」 / "Send this to the person who says you get used to the smell." (opens the share card for this chapter)
- **交棒.** 「裡面有什麼知道了。吸了會怎樣？這一題，得離開路口才答得了。」 / "That is what is in it. What does breathing it do? To answer, we have to leave the crossing."

### 3.7 第 5 環：鏡頭拉遠 / Link 5: the camera pulls back

- **Place.** Link 5 of 7, what happens to people who breathe traffic exhaust. Count frozen at 38. Frame K3. Tone `sunken`, haze 0. No scene colour and no scene figures appear beside any number in this chapter.
- **Kicker.** 倒數暫停 · 鏡頭拉遠 / Countdown paused · pulling back
- **標題.** 「沒有人能說，|一個紅燈會讓你生病」
- **Headline.** "Nobody can say |one red light makes you ill."
- **導言.** 「也沒有人能說不會。在怠速機車旁邊站幾分鐘會怎樣，沒有研究。研究看得到的，是時間拉長之後的事；而且看的是整體車流，不是機車。」
- **Deck.** "Nor can anyone say it does not. No study has looked at a few minutes beside idling scooters. What research can see comes with longer times, and it concerns traffic as a whole, not scooters."
- **內文, leading with the strongest evidence.** 「最有份量的證據是長期的。2022 年一份整理了 353 項研究的報告，對『長年暴露在車流廢氣裡』和總死亡、心臟病死亡、肺癌死亡，以及兒童和成人的氣喘發病之間的關聯，有高度或中高度的信心。」
- **Body.** "The weightiest evidence is long-term. A 2022 review of 353 studies had high or moderate-to-high confidence in an association between years of exposure to traffic exhaust and death from all causes, from heart disease and from lung cancer, and with new asthma in children and adults."
- **Visual and its four cards (V11, the ruler of time).**
  - 「90 秒：沒有研究。」 / "90 seconds: no study." 〔沒人量過〕
  - 「1 小時：台北 120 位健康成人，早上通勤一小時。走路的那一組，身上量到的 PM2.5 愈高，血壓和心跳也高一點；搭捷運的那一組沒有這個關係。」 / "1 hour: 120 healthy adults in Taipei, one morning hour of commuting. Among those who walked, higher personal PM2.5 went with slightly higher blood pressure and heart rate; among those on the subway it did not." 〔台灣實測〕
  - 「2 小時：在倫敦一條以柴油車為主的大街走兩小時，氣喘成人的肺功能最多下降 6.1%。」 / "2 hours: after two hours walking a diesel-dominated London street, lung function in adults with asthma fell by up to 6.1%." 〔國際證據〕
  - 「很多年：追蹤台灣 38 萬名成人，長期 PM2.5 最高的一組，死亡風險比最低的一組高 15%。算的是所有來源的 PM2.5。」 / "Many years: in a cohort of 380,000 Taiwanese adults, the group with the highest long-term PM2.5 had a 15% higher risk of death than the lowest. This counts PM2.5 from every source." 〔台灣實測〕
- **The honesty statement, set as a callout directly under the ladder.** 「注意這把尺。上面的研究量的都是整體車流，或所有來源的 PM2.5，也就是第 1 環說機車占很少的那一種污染。沒有任何一項把機車廢氣單獨分出來。研究看到的是『有關』，不是『造成』。這兩個詞差很多，我們不會混著用。」 / "Mind the ruler. Every study above measured traffic as a whole or PM2.5 from all sources, the kind of pollution Link 1 said scooters make little of. Not one isolates scooter exhaust. And what they show is association, not cause. The two words are far apart and we will not mix them."
- **Callout 「這不是叫你不要走路」.** 「同一個台灣世代研究裡，不管空氣好壞，有運動的人風險都比較低。請繼續走路。」 / "This is not a reason to stop walking. In the same Taiwanese cohort, people who exercised had lower risk at every level of pollution. Keep walking." **[research file: `long-term-traffic.json`, Guo 2021]**
- **Collapsed tool (V12).** 「你的紅燈，一年加起來」: the reader types how many red lights a day and how many seconds each. No default result is printed. Fixed caption: 「這只是時間，不是劑量。」 / "This is time, not dose." 〔本站計算〕
- **Evidence and badges.** Digest Link 5: HEI 2022 (國際證據); Chuang 2020 (台灣實測; effect sizes with their 24.4 µg/m³ increment appear only on `/evidence/`); McCreanor 2007 (國際證據); Taiwan cohort of 384,130 (台灣實測, all-source PM2.5); the gap on brief exposures (沒人量過).
- **這一段沒有說的事.** 「HEI 的報告自己說，它沒有評估因果。台北那項研究沒有扣掉走路本身的活動量。倫敦那條街以柴油車為主。」
- **Caveat.** "The HEI review says itself that it did not assess causality. The Taipei study did not adjust for the exertion of walking. The London street was dominated by diesel."
- **你現在可以做的.** 「有得選的時候，走車少的那條路。台北的通勤研究裡，安靜的路線，苯少了 33%，PM2.5 少了 28%；量的是騎車的通勤者。」 / "Where there is a choice, take the quieter street. In the Taipei commuter study a quiet route cut benzene by 33% and PM2.5 by 28%, measured on people riding." 〔台灣實測〕
- **交棒.** 「回到路口，倒數繼續。同一個紅燈，每個人站的位置不一樣。」 / "Back to the crossing; the countdown resumes. Same red light, but not everyone is in the same place."

### 3.8 第 6 環：誰離得最近 / Link 6: who is closest

- **Place.** Link 6 of 7. Count 38 → 05. Frame K2, `emphasis="heights"`. The chain title for this link changes from 「誰吸得最多 / Who gets the highest dose」 to 「誰離得最近 / Who is closest to it」, because dose is exactly what is unmeasured.
- **Kicker.** 紅燈 · 剩 38 秒
- **標題.** 「同一個紅燈，|不一樣的位置」
- **Headline.** "Same red light. |Different places in it."
- **導言.** 「離排氣管最近的不是路人，是騎在車陣裡的人。等紅燈的時候，你前面那台的排氣管就在你腳邊。」
- **Deck.** "The person nearest the tailpipes is not the passer-by. It is the rider inside the pack. At a red light, the tailpipe of the scooter ahead is at your feet."
- **內文.** 「台北同一個早上的一小時，身上量到的 PM2.5：搭捷運 21.7，走路 42.7，騎燃油機車 53.6。這是所有來源的 PM2.5，不是只算廢氣。」
  「再來是嬰兒車。它的高度是 55 到 85 公分，就在排氣管那一公尺裡。國外的量測，這個高度的污染通常比大人的高度多 5% 到 15%；最高有量到多 59% 的，也有兩項研究沒量到差別。沒有一項是在台灣做的。」
  「上小學的孩子已經比這一層高。對他們來說，有根據的是另一件事：小孩呼吸比大人快。坐在機車前踏板或後座上學的孩子，也在車陣裡；他們吸進多少，同樣沒有人量過。」
- **Body.** "Over the same morning hour in Taipei, personal PM2.5 averaged 21.7 on the subway, 42.7 walking and 53.6 on a gasoline scooter (µg/m³). That is PM2.5 from all sources, not exhaust alone."
  "Then the stroller. It sits 55 to 85 cm up, inside the tailpipe's first metre. In measurements abroad, pollution at that height is usually 5 to 15% above adult height; one study found 59%, and two found no difference. None was done in Taiwan."
  "A primary-school child already stands above that band. What is established for them is something else: children breathe faster than adults. Children who ride to school on the footboard or pillion are in the pack too, and nobody has measured what they breathe either."
- **Evidence and badges.**
  - Digest Link 3 and Link 6, Chuang 2020 by mode (21.7, 42.7, 53.6 µg/m³; 120 adults, one morning hour): 台灣實測.
  - Digest Link 6, stroller-height studies and WHO on children: 國際證據, worded per R5. The 59% is PM2.5 in a US roadside study; the 44% figure is not printed on the home page.
  - Pillion children: 沒人量過 **[research file: `vulnerable-groups.json`, gap "school-commute exposure in Taiwan: nothing found"]**.
  - On the question page only: the 1995–96 schoolchildren survey (dated, station data, per R6); lung function in 24,544 young people; delivery workers' exhaled CO (the abstract does not say they rode scooters); toll workers; older adults without numbers.
- **Visual.** Lead: V7, the height ruler, as the frame. Second, small: V13, the three bars from Chuang 2020.
- **這一段沒有說的事.** 「台灣沒有任何孩童高度的實測。整理嬰兒車研究的那篇回顧自己也說，離地兩公尺內，濃度不一定隨高度變。騎士的數字是 PM2.5，不是廢氣專屬的指標。」
- **Caveat.** "No child-height measurement exists for Taiwan. The review that gathers the stroller studies itself says concentration may not change with height in the first two metres. The riders' figure is PM2.5, which is not a marker specific to exhaust."
- **你現在可以做的.** 「推嬰兒車等紅燈，停在離待轉區和停止線遠一點的地方。這是預防，不是量過的效果。」 / "Waiting with a stroller, stop a little further from the turn box and the stop line. This is a precaution, not a measured benefit." 〔我們的推論〕
- **交棒.** 「剩 5 秒。」 / "Five seconds."

### 3.9 00：綠燈亮的那一秒 / 00: the second it turns green

- **Place.** Still Link 2 evidence, placed where it happens. Count 05 → 00. Frame K4. `phase="green"`. `size="auto"` (a short beat).
- **Kicker.** 綠燈
- **標題.** 「綠燈亮的|那一秒」
- **Headline.** "The second |it turns green"
- **導言.** 「香港、上海和英國的研究都看到同一件事：路口的微粒高峰跟著號誌走，而最高的那一下，通常不是車在等的時候，是車起步的時候。小黃帽也是這一秒踏出去的。」
- **Deck.** "Studies in Hong Kong, Shanghai and the UK see the same thing: particle peaks at a junction follow the signal, and the highest usually comes not while vehicles wait but as they pull away. That is also the second the child in the yellow cap steps out."
- **內文.** 「我們原本以為最糟的是怠速。證據說，不一定。」 / "We began this project assuming idling was the worst moment. The evidence says: not necessarily."
- **Evidence and badges.** Digest Link 2, signal-cycle studies: 國際證據. For Taiwan and for scooters: 沒人量過.
- **Visual.** V14, the signal-cycle strip: two labelled segments, no curve, no y-axis.
- **這一段沒有說的事.** 「那些研究量的多半是汽車和柴油車，不在台灣，也不是機車。機車起步那一下有多少，台灣沒有人量過。」
- **Caveat.** "Those studies mostly measured cars and diesel vehicles, none in Taiwan, none of scooters. How much a scooter emits as it pulls away has not been measured here."
- **你現在可以做的.** None. This beat hands straight on.
- **交棒.** 「90 秒過了。把剛才看到的接起來。」 / "The ninety seconds are up. Now put together what you saw."

### 3.10 接起來 / Joining it up

- **Place.** The whole chain, Links 1 to 6. `id="connect"`. Tone `sunken`, haze 0, no frame.
- **標題.** 「每一環都有出處。|接起來的那一步，你自己看」
- **Headline.** "Every link has a source. |The step that joins them is yours to judge."
- **導言.** 「下面是六件有出處的事，和一格沒有人量過的空白。」 / "Below are six sourced facts and one blank that nobody has measured."
- **The board (V15).** Six lines, each with its badge and a 「看來源」 expander:
  1. 「論排放量，機車的粉塵很少，油氣和一氧化碳很多。」〔台灣官方資料〕 / "By emissions, scooters put out little dust and a lot of fumes and carbon monoxide."
  2. 「排氣管離地不到一公尺；標線規則只要求待轉區離斑馬線 50 公分。」〔國際證據 · 台灣官方資料〕 / "The tailpipe is under a metre off the ground; the marking rules ask for 50 cm between the turn box and the crosswalk."
  3. 「台北一項通勤研究裡，測站的數字跟不上通勤的人吸到的苯類。」〔台灣實測〕 / "In one Taipei commuter study, station readings did not track the benzene-family compounds commuters breathed."
  4. 「廢氣裡有確定致癌的苯，和沒有味道的一氧化碳；鼻子聞不出它們有多少。」〔國際證據〕 / "Exhaust contains benzene, a known carcinogen, and odourless carbon monoxide; a nose cannot tell how much of either."
  5. 「長年吸車流廢氣，和死亡、心臟病、肺癌、氣喘有關。」〔國際證據 · 台灣實測〕 / "Years of breathing traffic exhaust are associated with death, heart disease, lung cancer and asthma."
  6. 「小孩呼吸比大人快；嬰兒車的高度，就在排氣管那一公尺裡。」〔國際證據〕 / "Children breathe faster than adults; a stroller sits inside the tailpipe's first metre."
  - The seventh line, drawn as an open link: 「所以，這 90 秒裡，站在旁邊的人吸進了什麼？」〔沒人量過〕 / "So what did the person standing beside it breathe in these ninety seconds?"
- **Button.** 「看我們怎麼接」 / "See how we join them". Opens a `Details`. Without JavaScript the reveal is a native `<details>`, closed.
- **The reveal, badge 我們的推論.** 「我們的推論：尖峰時間的路口，站在怠速車陣旁邊的人，吸進的油氣和一氧化碳，比站遠一點的人多；測站的數字不一定看得出來；而且這件事天天重複。每一環都有出處，接起來的這一步是我們的判斷，沒有人直接量過。它對健康的影響有多大，我們不知道。」
  / "Our inference: at a rush-hour crossing, the person beside an idling pack breathes more fumes and carbon monoxide than someone standing further away; station readings may not show it; and it repeats every day. Each link is sourced. The step that joins them is our judgement, and nobody has measured it directly. How much it matters for health, we do not know."
- **Two boxes beside the reveal, always open.**
  - 「我們沒有說」: 「等一個紅燈會生病。機車廢氣是第 1 級致癌物。機車是 PM2.5 的主要來源。味道愈重，傷害愈大。台灣哪一項健康研究的結果是機車造成的。」 / "What we are not saying: that one red light makes you ill; that scooter exhaust is a Group 1 carcinogen; that scooters are a main source of PM2.5; that a stronger smell means more harm; that any Taiwanese health finding was caused by scooters."
  - 「什麼會讓我們改口」: 「如果有人在機車多的路口，在行人和嬰兒車的高度，分紅燈和綠燈，把一氧化碳、苯類和超細微粒量出來，結果和附近的背景值差不多，第 3 環就不成立。我們會改寫這一頁，並且寫明為什麼改。」 / "What would change our mind: if someone measures carbon monoxide, benzene-family compounds and ultrafine particles at a scooter-heavy crossing, at pedestrian and stroller height, by red and green phase, and finds them close to the nearby background, Link 3 fails. We will rewrite this page and say why."
- **Why this is the reader's own connection.** The six facts and the open question are on one screen before any conclusion. The conclusion is closed by default, arrives labelled as the weakest badge on the page, claims a direction of exposure and nothing about health, and sits beside the list of what it does not claim.
- **交棒 (the pivot).** 「不必等那個數字，也能做決定。不管那一格最後量出多少，車陣換成電動，機車排的那一份就是零。」 / "You do not need that number to decide. Whatever that box turns out to hold, when the pack is electric the scooters' share of it is zero."

### 3.11 第 7 環：同一個紅燈，再來一次 / Link 7: the same red light, again

- **Place.** Link 7 of 7, the link you can break. Count resets to 90. Frame K5 inside `SceneCompare`. Tone `clear`, haze 0.
- **Kicker.** 紅燈 · 倒數回到 90
- **標題.** 「同一個路口，|沒有排氣管」
- **Headline.** "Same crossing. |No tailpipes."
- **導言.** 「倒數回到 90。一樣的紅燈，一樣的車陣，只是換成電動的。電動機車沒有排氣管：在路口，它不排一氧化碳、油氣和苯。」
- **Deck.** "The countdown goes back to 90. Same red light, same pack, electric. An electric scooter has no tailpipe: at the crossing it emits no carbon monoxide, fuel vapour or benzene."
- **內文.** 「這不是零污染，是這台車在路口零廢氣。輪胎、煞車和路面的粉塵還在，發電的排放在別的地方，旁邊的汽車和公車也還在排。換了之後街上的空氣實際乾淨多少，台灣還沒有人量過。」
  「換車，拿掉的是你那根排氣管。受惠的是站在你旁邊的人，還有騎在你後面的那一台。你自己騎在車陣裡，還是會吸到別人的。」
  「台灣這幾年是往回走的：新掛牌的機車裡，電動的比例 2019 年是 18.7%，2025 年剩 6.9%。政府自己訂的目標，是 2030 年 35%。」
  「排氣管也不是只有『買車』這一條路能動。量測、路口設計、定檢、明年的補助，是政府的部分。準時定檢、該修就修、把二行程報廢，是不換車也做得到的，都算數。」
- **Body.** "This is not zero pollution. It is zero exhaust from this scooter at the crossing. Tyre, brake and road dust remain, power generation emits elsewhere, and the cars and buses alongside are still running. How much cleaner the street air actually gets after the switch has not been measured in Taiwan."
  "Switching removes your tailpipe from other people's air: the people beside you, and the rider behind you. In the pack, you still breathe everyone else's."
  "Taiwan has been going backwards: 18.7% of newly registered scooters were electric in 2019, and 6.9% in 2025. The government's own target is 35% by 2030."
  "Nor is buying a scooter the only way to act on the tailpipe. Measurement, crossing design, inspection and next year's subsidies are the government's part. Turning up for inspection, fixing what fails and scrapping a two-stroke are things you can do without switching, and they count."
- **Evidence and badges.**
  - Digest Link 7, no tailpipe; residual dust; generation elsewhere: fact of the machine, with 台灣官方資料 for residual dust (`teds13-electric-mc-pm25`).
  - Digest Link 7, electric share 18.7% (2019) and 6.9% (2025), targets 35/70/100%: 台灣官方資料 with the tag 次級來源 (media-reported series). Reasons for the fall are not given (R16).
  - Digest Link 7, cleaner street air from electrification: 沒人量過.
- **Visual.** Lead: V16, the switch 燃油機車／電動機車 with the ledger 消失的／留下的／搬走的. Second: V17, the line heading away from the targets.
- **這一段沒有說的事.** 「台北那項通勤研究裡，在機車道上騎電動機車的人，身上照樣量得到苯類。少一根排氣管是確定的；少多少廢氣進到誰的肺裡，沒有人量過。」
- **Caveat.** "In the Taipei commuter study, people riding electric scooters in the scooter lane still carried readings of benzene-family compounds. One tailpipe fewer is certain; how much less exhaust reaches anyone's lungs has not been measured."
- **你現在可以做的.** 「下一台，考慮電動的。還沒到換車的時候？看『我現在不打算換車』→」 / "For your next one, consider electric. Not changing scooters yet? See 'I'm not switching now' →" (`/act/#keep`)
- **交棒.** 「剩下的問題很實際：換一台，要多少錢？」 / "What remains is practical: what does it cost to switch?"

### 3.12 算錢 / The money

- **Place.** After the chain. `id="money"`. Tone `street`. No scene. Date-aware (states in section 4.3).
- **標題, state A (to 2026-12-31).** 「補助最晚到 12 月 31 日。|明年的，還沒有一項定案」
- **Headline, state A.** "Subsidies end by 31 December at the latest. |Nothing is confirmed for next year."
- **導言.** 「2026 年的電動機車補助，最晚都要在 12 月 31 日前買車、領牌；有些縣市的名額更早就用完了。買不買得到跟燃油車一樣的價錢，看你住哪裡，手上有沒有出廠滿 10 年的機車可以報廢。騎起來省不省，看你一個月騎多少。我們幫你算；算出來打不平，也照實講。」
- **Deck.** "Every 2026 electric-scooter subsidy requires purchase and registration by 31 December at the latest, and some cities' money ran out earlier. Whether you can match the price of a gasoline scooter depends on where you live and whether you have a scooter ten or more years old to scrap. Whether it is cheaper to run depends on how far you ride each month. We will do the sums, and say so when they do not come out in favour."
- **內文.** 「一個月騎三、五百公里的人，月租電池會比加油貴。這件事我們先講，免得你到車行才發現。」 / "If you ride 300 to 500 km a month, a battery subscription costs more than petrol. We would rather you heard it here than at the dealership."
- **Visual (V18).** A two-question selector (縣市；有沒有出廠滿 10 年的機車) above two waterfalls, 「打不平」 first and 「打得平」 second on phones. Until the reader chooses, the two fixed personas are: 高雄，沒有車可以報廢，要白牌 (the city's money ran out on 11 August); and 新北，報廢一台出廠滿 10 年的機車. Both are computed by the engine **[engine]**. If the engine does not return parity for the New Taipei persona, the builder uses the nearest persona that does and labels it exactly. After the reader chooses a city, one line of status replaces the personas' captions, for example 「高雄市：市府補助 8 月 11 日用完。中央補助到 12 月 31 日。」
- **Under it (V19).** The timeline strip: 今天 · 12/31 買車、領牌的最後期限 · 1/10 線上申請截止（各縣市不同） · 2027：還沒有一項定案.
- **Buttons.** Primary: 「用我的條件算」 / "Work it out for me" → `/electric/#calc`. Secondary, equal size: 「我現在不打算換車」 / "I'm not switching now" → `/act/#keep`.
- **Evidence and badges.** Digest Money: deadline (台灣官方資料); gasoline reference prices and the cheapest electric price (市場公開價格); every net price and gap (本站計算).
- **這一段沒有說的事.** 「目前最便宜的電動機車是綠牌，極速 68 公里，和 125cc 不是同一級。名額先到先得。每個數字旁邊有我們查證的日期，下單前請再看一次官方頁面。」
- **Caveat.** "The cheapest electric scooter today is a green-plate model limited to 68 km/h; it is not the same class as a 125cc. Quotas are first come, first served. Every figure shows the date we checked it; look at the official page again before you order."
- **State C (after 2027-01-10 with nothing confirmed).** 標題 「補助在 12 月 31 日結束了。|新的，已經 N 天沒有定案」 / "The subsidies ended on 31 December. |N days on, nothing new is confirmed." The primary button becomes 「要求公布 2027 年方案」 → `/act/#policy`; the secondary becomes 「看沒有補助時的價差」 → `/electric/`.

### 3.13 下一個紅燈 / The next red light

- **Place.** Close. `id="next"`. Frame K0 (the empty stop line again), small.
- **標題.** 「下一個紅燈|還是 90 秒」
- **Headline.** "The next red light |is still ninety seconds."
- **導言.** 「差別只在，旁邊那一排有沒有排氣管。」 / "The only difference is whether the row beside you has tailpipes."
- **Role cards.** Five: 我走路 · 我騎車 · 我有小孩 · 我們這個里、這間學校 · 我在政府或議會. Each shows its first two actions from Part 6 and links to `/act/#<role>`.
- **Then.** 「把這七件事傳出去」 (share card with the seven lines; in wave 2, the film). 「所有出處」 → `/sources/`. And one line: 「發現我們哪裡說錯了？告訴我們。我們會改，並且留下修改紀錄。」 / "Found something we got wrong? Tell us. We will fix it and keep a record of the change."

### 3.14 Home page at a glance

| # | Chapter | Chain | Count | Frame | Lead visual | Badge on the main claim |
|---|---|---|---|---|---|---|
| 0 | 一個紅燈，90 秒 | scene | 90 | K0 | V1 | none |
| 0b | 30 秒懶人包 | all | | | V3, V4 | per line |
| 1 | 粉塵很少，油氣很多 | 1 | 90→78 | K1 | V5 | 台灣官方資料 |
| 2 | 排氣管離地不到一公尺。標線規則只要求留 50 公分 | 2 | 78→64 | K2 | V6 | 國際證據 · 台灣官方資料 |
| 3 | 這一格，沒有人量過 | 3 | 64→50 | K3 | V8 | 沒人量過 |
| 4 | 鼻子是警報器，不是測量儀 | 4 | 50→38 | K2 | V10 | 國際證據 |
| 5 | 沒有人能說，一個紅燈會讓你生病 | 5 | paused 38 | K3 | V11 | 國際證據 · 台灣實測 |
| 6 | 同一個紅燈，不一樣的位置 | 6 | 38→05 | K2 | V7 | 台灣實測 · 國際證據 |
| 7 | 綠燈亮的那一秒 | 2 | 05→00 | K4 | V14 | 國際證據 |
| 8 | 每一環都有出處。接起來的那一步，你自己看 | 1–6 | 00 | | V15 | 我們的推論 |
| 9 | 同一個路口，沒有排氣管 | 7 | 90 | K5 | V16 | fact · 沒人量過 |
| 10 | 補助最晚到 12 月 31 日。明年的，還沒有一項定案 | money | | | V18 | 本站計算 |
| 11 | 下一個紅燈還是 90 秒 | close | | K0 | | |

---

## 4. The other pages

### 4.1 Routes and navigation

| Route | 中文 nav label | English | Change |
|---|---|---|---|
| `/` | (wordmark) | Home | rewritten |
| `/questions/` and `/questions/<slug>/` | 問題 | Questions | replaces `/problem/`; redirect `/problem/` here |
| `/evidence/` | 證據 | Evidence | kept |
| `/unmeasured/` | 沒人量過 | Not yet measured | new |
| `/electric/` | 換電動 | Going electric | kept |
| `/act/` | 行動 | Take action | kept |
| `/90/` | (linked from hero) | The 90 seconds | new, wave 2 |
| `/sources/` | 資料來源 (footer) | Sources | kept |
| `/about/` | 關於 (footer) | About | kept |

Primary navigation, in order: 問題 · 證據 · 沒人量過 · 換電動 · 行動. The footer carries 資料來源, 關於 and 修改紀錄. 問題 already means both "problem" and "questions", so the label stays.

### 4.2 `/questions/`: 路口的八個問題 / Eight questions at the crossing

**Purpose.** The landing surface for search and LINE. Each question has its own URL, title, description and share card, so a reader who arrives cold still gets the answer, its limit, the whole chain in seven lines, and something to do. These pages are also the deep pages behind the home chapters.

**Page anatomy (identical for all eight).**

1. The question as `h1`.
2. 「一句話回答」: at most two sentences, with the badge.
3. One lead visual in a `Figure`.
4. 「這一段沒有說的事」: the caveat, as an exhaust-tone `Callout`.
5. The seven-line strip (V3), collapsed to the current line, expandable.
6. 「你現在可以做的」: one or two actions with their badges. No calculator button except on `electric` (R9).
7. 「再多看一張圖」 and 「這個研究怎麼做的」: further figures, and an accordion per study (who, how many, where, what was measured, what it does not say).
8. Two next questions, one from the other half of the argument.
9. The share card (V44): question, answer, caveat line and badge inside the image.

**The eight pages.**

| Slug | 問題 | 一句話回答 | Answer | Badge | Visuals | Home chapter |
|---|---|---|---|---|---|---|
| `smell` | 為什麼那麼臭？ | 聞到那股味道，代表你站在廢氣裡。到底是哪幾種成分在臭，老實說沒有人鑑定過；比較可能的是醛類，十億分之幾就聞得到。 | The smell means you are standing in exhaust. Which compounds make it, honestly, nobody has identified; aldehydes are the likelier candidates, detectable at a few parts per billion. | 沒人量過 · 國際證據 | V10, V27, V28 | Link 4 |
| `beside-me` | 為什麼剛好排在我旁邊？ | 因為排氣管就在路面上，而標線規則只要求待轉區的後緣離行人穿越道 50 公分以上。這是下限，不是你家路口實際的距離。 | Because the tailpipe is at road level, and the marking rules ask only that the turn box's rear edge be 50 cm or more from the crosswalk. That is a minimum, not the distance at your crossing. | 台灣官方資料 | V6, V7, V14, V23, V24 | Link 2, green |
| `app` | 空品 App 顯示「良好」，是它錯了嗎？ | 它沒有錯。它報的是測站量到的空氣；你站的這個路口，沒有人量過。台北一項通勤研究裡，測站的數字跟得上 PM2.5，跟不上苯類。 | It isn't wrong. It reports the air measured at a station; the crossing you are standing at has not been measured. In one Taipei commuter study, station readings tracked PM2.5 and did not track the benzene family. | 台灣實測 | V25, V9 | Link 3 |
| `how-much` | 我在路口到底吸進多少？ | 老實說：沒有人量過。這是整件事最大的空白。下面是離現場最近的幾項量測，每一項都寫明和現場差在哪。 | Honestly: nobody has measured it. It is the biggest hole in the whole story. Below are the nearest measurements, each with how it differs from the scene. | 沒人量過 | V8, V26 | Link 3 |
| `one-red-light` | 只是等個紅燈，有差嗎？ | 一個紅燈會不會傷身，沒有研究能回答，兩邊都不能說。研究看得到的是長期：長年吸車流廢氣，和心臟病、肺癌、氣喘有關。 | Whether one red light does harm, no study can say, either way. What research can see is long-term: years of breathing traffic exhaust are associated with heart disease, lung cancer and asthma. | 沒人量過 · 國際證據 | V11, V12, V32 | Link 5 |
| `my-child` | 小孩吸得比我多嗎？ | 嬰兒車裡的孩子：有可能。國外量到那個高度通常多 5% 到 15%，也有研究沒量到差別。上小學的孩子已經比那一層高；有根據的是他們呼吸比大人快。台灣兩種都沒有人量過。 | A baby in a stroller: possibly. Abroad, that height usually reads 5 to 15% higher, and some studies found no difference. A primary-school child already stands above that band; what is established is that children breathe faster than adults. Neither has been measured in Taiwan. | 國際證據 · 沒人量過 | V7, V29 | Link 6 |
| `rider` | 騎車的人自己呢？ | 台北的研究裡，六種通勤方式中，騎燃油機車的人身上量到的 PM2.5 最高。騎車的人不是反派，是在車陣裡待最久的人。 | In a Taipei study of six ways of commuting, people on gasoline scooters had the highest personal PM2.5. Riders are not the villains; they are the people who spend longest in the pack. | 台灣實測 | V13, V26 | Link 6 |
| `electric` | 換成電動，路口真的會比較乾淨嗎？ | 電動機車沒有排氣管，在路口不排一氧化碳、油氣和苯。輪胎和煞車的粉塵還在，旁邊的汽車也還在。實際乾淨多少，台灣還沒有人量過。 | An electric scooter has no tailpipe: no carbon monoxide, fuel vapour or benzene at the crossing. Tyre and brake dust remain, and so do the cars alongside. How much cleaner the air gets has not been measured in Taiwan. | fact · 沒人量過 | V16, V17, V21 | Link 7 |

Notes for the builders of these pages:

- `one-red-light` carries a separate callout badged 我們的推論: 「我們的推論：你一年等的紅燈不只一個。這些時間算不算得進研究裡的『長期暴露』，沒有人算過。」 / "Our inference: you wait at more than one red light a year. Whether that time counts toward the long-term exposure the studies describe, nobody has worked out." It is never part of the one-line answer.
- `my-child` carries the 1995–96 survey, worded: 「1995 到 1996 年，全國 33 萬名國中生的調查：學校附近測站的一氧化碳和氮氧化物愈高，氣喘的比例也愈高。那是二行程機車還很多的年代，用的是測站資料，分不出機車和其他車。」 / "A 1995–96 national survey of 330,000 middle-school students found more asthma where stations near the school recorded more carbon monoxide and nitrogen oxides. That was the two-stroke era, the exposure was station data, and scooters cannot be separated from other traffic." 〔台灣實測〕
- `rider` says of delivery workers only: 「外送員呼出的一氧化碳比對照組高一點（不抽菸的人 1.57 對 1.13 ppm）；研究沒有說他們騎的是什麼車。」
- `beside-me` holds the idle-test limits (V23) and the inspection waffle (V24), always captioned 「這是排氣管口的法定上限，不是實際排放，更不是路口空氣裡的濃度。」
- The chips 「我換得起嗎？」 and 「到底證明了什麼？」 go to `/electric/` and `/evidence/`. They are not question pages.

### 4.3 `/electric/`: 換電動，把帳攤開 / Going electric: the full bill

**Purpose.** Get each reader as close to price parity as their own situation allows, tell them the truth about monthly costs, and make "not this year" a respectable answer with things to do.

**Page head.** 標題 「換電動，|把帳攤開」 / "Going electric: |the full bill". 導言 「換電動不一定比較省。我們把帳攤開，划不划算你自己看。」 / "Going electric is not automatically cheaper. Here is the full bill; you decide."

**Sections.**

1. **`#status` 你那裡還有沒有補助.** A city or county selector. Until a choice is made the page shows dates only, never a day count: 「2026 年的補助最晚到 12 月 31 日。先選縣市，看你那裡還有沒有名額。」 After a choice, one status line from the registry with its check date, then V19.
2. **`#calc` 五個問題，算給你看.** The calculator. Inputs, mapped to the engine's `Situation`:
   - 縣市 (`jurisdiction`).
   - 你現在的機車：出廠年月，二行程還是四行程；或「沒有車可以報廢」 (`scrap.builtOn`, `scrap.engine`). The label is 「出廠年月」, with a hint on where to read it on the registration.
   - 家裡的狀況：12 歲以下的孩子、低收或中低收、年齡、外送工作，只顯示所選縣市用得到的項目 (`household`).
   - 一個月大概騎多少公里 (`monthlyKm`).
   - 停車的地方能不能充電，要綠牌還是白牌 (`energyPlan`, `electricModel`). V42 helps the reader choose.
3. **`#result` 結果.** In this order: the verdict (V36), the personal waterfall (V37), city status and deadlines, the monthly bill (V39), the break-even chart (V38), and 「下載我的補助清單」, a checklist to take to the dealer.
4. **`#closer` 怎麼再靠近一點.** The levers, largest first, each with the amount for the chosen city:
   - 報廢一台出廠滿 10 年的機車。Everywhere outside Taipei this is the largest single lever. 二行程 (pre-2004) pays more in Taipei.
   - 家戶加碼：12 歲以下的孩子、低收或中低收（Taipei: +NT$8,000 with a child 12 or under, +NT$10,000 low income; every Taipei buyer +NT$8,000 battery top-up）.
   - 中央補助：NT$7,000 or NT$5,100 by class; +NT$3,000 for Taiwan-made cells only where confirmed for the model; +NT$1,000 for scrapping; one environment-ministry payment of NT$1,000 to 2,200. Count only one of the ministry's payments unless the registry confirms both.
   - 車的級別：the cheapest electric scooter (NT$59,980) is a green plate limited to 68 km/h. The page says beside the price: 「綠牌，極速 68 公里，和 125cc 不是同一級。」
   - 資費選對：用多少付多少適合低里程；月租要騎到試算顯示的公里數以上才划算。
   - 容易踩到的坑, as a checklist: 設籍年限；舊車要登記在本市；先在環境部平台登錄再買車；發票和領牌都要在 2026 年內；線上申請多半到 2027 年 1 月 10 日；名額先到先得；汰舊換新和其他優惠不一定能併用。
5. **`#monthly` 騎起來要花多少.** Opens: 「先講結論：不一定。」 / "The short answer first: not necessarily." Then V40 (cost per kilometre), V39 at three distances from the engine (200, 600 and 1,500 km a month), and these statements:
   - 加油：一台新的 125cc，每公里大約 NT$0.55 到 0.75；現在的油價被一項暫時措施壓低了每公升 NT$6 到 12。
   - 換電，用多少付多少：每公里大約 NT$1，另外有建置費。
   - 月租：一個月騎 300 到 500 公里的人，月租電池比加油貴。
   - 在家充電：每公里大約 NT$0.05 到 0.20。
   - 政府的調查裡，電動機車車主一年大約花 NT$10,500，一般燃油機車 NT$8,400。這是車主自己回報的平均，不是同條件的比較。
   - 保養和 NT$450 的燃料費，電動一年大約省幾千元。
   - Every monthly figure shows its arithmetic: 月租、超額單價、合約月數、建置費、提前解約的代價.
6. **`#no-socket` 停車的地方沒有插座.** 「先講清楚：住公寓、沒有自己的車位，今天幾乎沒辦法在家充電。我們查到不用月租、電池可以拎上樓充的車只有一款，極速 53 公里，跑不贏 125cc。寫信給管委會，幫得到有車位的人，幫不到沒有車位的人。所以我們把『公寓也能充電』列進對政府的要求。」 / "To be plain: in a flat with no parking space of your own, home charging is close to impossible today. We found one scooter with no monthly fee and a battery you can carry upstairs; it tops out at 53 km/h and is no match for a 125cc. A letter to the building committee helps people who have a space, not people who do not. So charging in apartment buildings is on our list of asks to government." **[research file: `home-charge-evs-r2.json`; the digest says the only no-fee model found is a 25 km/h micro vehicle. Use whichever the registry holds.]**
7. **`#who` 誰划算，誰打不平 (V43).** Two columns. 划算：每月里程高；有出廠滿 10 年的機車可以報廢；住在還有名額的縣市；停車的地方能充電。打不平：低里程又用月租；沒有車可以報廢；縣市補助用完了；一定要白牌。 The second column ends with a link: 「這是你？看『我現在不換』→」 (`#not-yet`).
8. **`#risks` 買之前要知道.** 一家公司占電動機車新掛牌大約 87%，有 2,700 多個換電站，2025 年虧損 8,080 萬美元；資費方案可能調整。 Brand-neutral wording; the company is named in the source line. No statement about resale values (unverified).
9. **`#not-yet` 我現在不換.** 標題 「今年不換，也有事可以做」 / "Not switching this year? There is still plenty to do." 準時定檢；該修就修；家裡那台二行程，報廢了（單純報廢有沒有獎勵，試算會列出來）；短程試試共享電動機車；訂閱「2027 年方案公布時通知我」；把要求公布 2027 年方案的信寄出去。 Each action carries its badge. Mirrors `/act/#keep`.
10. **`#cities` 各縣市補助 (V41).** The tile map of 22 jurisdictions and `Tabs` for the six special municipalities. Every amount has a check date. Counties that could not be verified show 「查不到，請洽環保局」 and never zero.
11. **FAQ accordions.** 綠牌和白牌差在哪；補助什麼時候入帳；舊車怎麼報廢；電池是誰的；合約可以提前解約嗎.

**Verdict copy (V36).** The verdict is one sentence above the number.

| Verdict | When | 中文 | English |
|---|---|---|---|
| A 打得平 | Net price at or below the gasoline reference, and monthly cost not higher | 「以你的條件，電動機車實付比新的燃油機車少 NT$X，每個月的開銷也不比加油多。」 | "On your details, an electric scooter costs NT$X less to buy than a new gasoline one, and no more to run each month." |
| A 第 N 個月打平 | Dearer to buy, cheaper to run, lines cross within 60 months | 「買的時候多 NT$X，每個月少 NT$Y。照這樣算，第 N 個月打平。」 | "NT$X more to buy, NT$Y less each month. On these sums it breaks even in month N." |
| B 買得起，但每個月多花一點 | Parity at purchase, dearer to run | 「買的時候差不多，但以你每月 K 公里、用這個資費來算，每個月大約多花 NT$X。這筆錢買到的是：你騎過的每個路口少一根排氣管，還有比較少的保養。值不值得，由你決定。」 | "About the same to buy, but at K km a month on this plan you would pay roughly NT$X more each month. What that buys: one tailpipe fewer at every crossing you ride through, and less maintenance. Whether that is worth it is your call." |
| C 以現在的條件，打不平 | Dearer to buy and not cheaper to run | 「以你的條件，買的時候還差 NT$X，每個月也不會比較省。我們不會叫你硬換。下面是讓差距變小的做法，還有車還沒換之前可以先做的事。」 | "On your details there is still a gap of NT$X at purchase, and it is no cheaper to run. We will not tell you to force it. Below are ways to narrow the gap, and things you can do before you change scooters." |

Special results:

- Scooter under ten years old: 「你的車出廠還不到 10 年，今年不算汰舊。它明年才滿 10 年；明年有什麼補助，還沒有一項定案。」 / "Your scooter is under ten years old, so it does not count for scrap-and-replace this year. It qualifies next year, and nothing is confirmed for next year."
- Break-even never reached: 「以你的里程，五年內打不平。要騎到每個月 K 公里左右才會。」 / "At your distance it does not break even within five years. It would at about K km a month."
- Day count: shown only inside a verdict A panel, with the city's quota status and check date (R10): 「{縣市}還有名額（{日期} 查）。最晚 12 月 31 日前買車、領牌，還有 N 天。」

**Behaviour before and after 2026-12-31.** Every programme in the registry carries `validTo`, `filingDeadline`, `quota` status and `checkedOn`. The page works out its state in the browser from today's date, with absolute dates as the server-rendered fallback, so a stale build can never show a wrong day count or expired money as available. City exhaustion is a state in its own right, not a footnote. **Build state C first.**

| State | When | Banner | Calculator | Home money chapter | Primary call to action |
|---|---|---|---|---|---|
| A, no city chosen | to 2026-12-31 | 「2026 年的補助最晚到 12 月 31 日。先選縣市，看你那裡還有沒有名額。」 | 2026 stack | as written in 3.12 | 「用我的條件算」 |
| A, city has money | to 2026-12-31 | 「{縣市}：還有名額（{日期} 查）。最晚 12 月 31 日前買車、領牌。」 | 2026 stack with quota chips | status line for the city | 「用我的條件算」; 「下單前再看一次官方名額」 |
| A, city money gone | to 2026-12-31 | 「{縣市}的補助已在 {日期} 用完。中央補助到 12 月 31 日。」 | central money only; city lines shown greyed, stamped 已用完 | status line for the city | 「用我的條件算」; 「我現在不換」 |
| B | 2027-01-01 to 01-10 | 「買車期限過了。12 月 31 日前買車的人，線上申請多半到 1 月 10 日。」 | becomes a filing checklist for people who already bought; new buyers see no-subsidy prices | 「你趕上了嗎？申請到 1 月 10 日。」 | 「我已經買了：申請清單」 |
| C | after 2027-01-10, nothing confirmed | 「2026 年的補助結束了。2027 年的方案，還沒有一項定案（{日期} 查）。」 | defaults to no subsidy: list price against gasoline, the full gap, monthly costs. 2026 amounts stay visible, greyed, stamped 已截止, never shown as current | headline as in 3.12 state C; V19 shows 「已經 N 天沒有定案」 | 「要求公布 2027 年方案」; 「公布時通知我」 |
| D | a 2027 programme is entered in the registry | 「2027 年方案公布了（{日期} 查）。」 with its dates | new stack; 2026 archived | new dates | 「用我的條件算」 |

Notes: the monthly-cost sections do not depend on the subsidy deadline, but carry their own check dates because the petrol price measure is temporary and an electricity tariff review is pending. One draft exists for 2027: on 2026-11-11 the environment ministry pre-announced extending its scrap-and-replace air subsidy to 2030 **[research file: `outlook-2027-r2.json`]**. It is not final, so the site says 「還沒有一項定案」, never 「什麼都沒有」.

### 4.4 `/unmeasured/`: 沒有人量過的事 / What nobody has measured

**Purpose.** Turn the gap into the campaign's most credible asset and its second ask of government.

**Sections.**

1. The empty chart (V8), full width, with the home page's deck.
2. **五個空白**, one sentence each, each followed by who could fill it:
   - 路口行人吸進什麼（環保局、環境部、大學）.
   - 一台台灣的機車怠速時排多少（環境部、車輛測試機構）.
   - 起步那一下有多少（同上）.
   - 一個紅燈前面停幾台機車（交通局、運輸研究所）.
   - 機車換成電動之後，哪一條街變乾淨了（環保局、大學）.
3. **要量什麼 (V35).** A plain-language brief, stamped 本站提議 because nobody has adopted it: 一氧化碳、苯類（BTEX）和超細微粒數量；在嬰兒車高度（約 0.6 公尺）和成人高度（約 1.5 公尺）；在轉角、待轉區旁、停等區旁，加上一個離路口遠的對照點；逐秒記錄，對上紅燈和綠燈；同時數每個時相停了幾台機車；公開原始數據。
4. **你手上的空氣盒子量不到這個.** Low-cost sensors read PM2.5, which is the wrong ruler here; the one hand-held study on Taipei sidewalks read about 30% high.
5. **什麼結果會讓我們改口**, repeated from the home page, and the pledge: 「量出來如果路口和背景沒有差別，我們會把這個結果放在首頁。」
6. **`#ask` 請來量我家路口.** A form that fills two fields (縣市, 路口名稱) into the request below and offers it as copyable text and a prefilled e-mail. Nothing is stored.

**The request text.**

> 主旨：請量測○○路與○○路口，行人呼吸高度的空氣
>
> 您好，我住在○○區。○○路與○○路口尖峰時間機車很多，行人就在待轉區和停等區旁邊等紅燈、過馬路。就我所知，台灣目前沒有公開的量測，能說明行人在這樣的路口吸進多少一氧化碳、苯類和超細微粒；從一般測站和 PM2.5 的數字也看不出來。想請貴局：
>
> 一、在這個路口行人等候的位置，於嬰兒車高度（約 0.6 公尺）和成人高度（約 1.5 公尺），量測一氧化碳、苯類（BTEX）和超細微粒數量。
> 二、依紅燈、綠燈分開記錄，同時記下每個時相停等的機車數。
> 三、設一個離路口較遠的對照點。
> 四、公開原始數據。
>
> 不管結果如何，謝謝你們讓大家知道答案。

English version for the English page: "Subject: Please measure the air at pedestrian height at the junction of ○○ Road and ○○ Road", with the same four requests.

**Calls to action.** Readers: 「請來量我家路口」. Researchers and agencies: a contact address and the brief as one printable page (V47). Journalists: the empty chart and the brief as a media kit.

### 4.5 `/evidence/`: 證據鏈，一環一環看 / The chain, link by link

**Purpose.** The page a sceptic, a journalist or an official uses to check the site. It should make attacking the site harder than agreeing with it. Data register only; no scene.

**Sections.**

1. The full chain (V15) with every citation, and the evidence map (V30).
2. **`#link-1` to `#link-7`.** Each opens with the home headline, then a table with five columns: 我們說什麼 · 數字 · 誰做的、怎麼做的 · 證據類型 · 這項研究沒有說什麼. The last column is mandatory for every row. Visuals by link: Link 1: V5, V20, V21, V22, V34. Link 2: V6, V23, V24, V14. Link 3: V8, V25, V26, V9. Link 4: V27, V28. Link 5: V11, with the Chuang 2020 effect sizes printed with their 24.4 µg/m³ increment. Link 6: V29, V13. Link 7: V17.
3. **Study cards** for the eight papers read in full (`research/papers/*.json`).
4. **`#gaps` 還沒有人量過的事.** Every gap in the digest, numbered, each with what measurement would close it. Links to `/unmeasured/`.
5. **`#not-claimed` 我們不會說的話 (V33).** Generated from `claims-policy.ts` and the digest's "must not be claimed" list, each with one line of why.
6. **`#not-used` 常被引用、但我們不這樣用的數字.**
   - 「行人專用時相讓 PM2.5 暴露少 94%」: one modelled day at one Kaohsiung intersection, flagged by the report itself as an outlier; typical simulated days were roughly 3 to 21%, and some Taipei sites showed none (V31). Publish only after the report is re-opened (Appendix B, item 6).
   - 「肺癌病人有 53% 不吸菸」: true of one Taiwanese study; the cause in never-smokers is not established, and the figure says nothing about scooters. The 32% figure for never-smokers sits here too, with "all-source PM2.5".
   - 「全世界機車密度最高」: we say 「名列前茅」.
   - 「老車髒 14 倍、32 倍」: a case study of three scooters, shown in its own hatched panel (V22).
   - 「怠速的時候排最多」: the international evidence puts particle peaks at pull-away; for scooters, not measured.
   - 「2035 年全面電動」: the target is 70% in 2035 and 100% in 2040.
7. Badge legend, how figures were checked, the corrections log, and 「發現我們講錯了？告訴我們」.

**Calls to action.** 「這一格還是空的」 → `/unmeasured/`; 「看每一筆出處」 → `/sources/`; download of every chart's data table.

### 4.6 `/act/`: 行動 / Take action

**Purpose.** One screen per role, in the priority order of Part 6. Each action is one sentence plus the badge of the evidence behind it, so that "stand further back" (our inference) never looks as solid as "scrap the two-stroke" (official data).

**Sections.** `#walk` 我走路 · `#buy` 我要買車 · `#keep` 我現在不換車 · `#parents` 我有小孩 · `#neighbourhood` 我們這個里、這間學校、這棟大樓 · `#policy` 我在政府或議會.

**Tools on the page.**

- A LINE-ready message: 「紅燈旁邊那股機車味，吸進多少其實沒人量過。這個網站把查得到的證據一環一環列出來，也算了換電動到底要多少錢：{網址}」
- 「請來量我家路口」 (from `/unmeasured/#ask`).
- A letter to a councillor asking for the 2027 programme to be published.
- The school-gate poster (V46).
- A note to the building committee (管委會) asking to allow scooter charging in the car park, with one honest line: 「這封信幫得到有車位的住戶。」
- The official channel for reporting visibly smoking vehicles.
- The calculator link, in `#buy` only.

**Key visuals.** V6 (for the set-back ask), V24 (for the inspection ask), V19.

### 4.7 `/90/`: 90 秒 (wave 2)

A 90-second piece that plays in real time, built as an SVG and CSS page (no video on the site; an exported vertical clip for LINE is optional). It exists because a parent will forward a film and will not forward a scroll. Rules: the haze is the constant hatched band; the label 「示意圖｜多濃沒人量過」 is part of every frame; the empty chart is the longest beat.

| Seconds | Frame | Caption 中文 | Caption English |
|---|---|---|---|
| 0–8 | K0 | 一個紅燈，90 秒。 | One red light. Ninety seconds. |
| 8–18 | K1 | 車陣到了。論排放量：粉塵很少，油氣很多。 | The pack arrives. By emissions: little dust, a lot of fumes. |
| 18–28 | K2 | 排氣管離地不到一公尺。 | The tailpipe is under a metre off the ground. |
| 28–44 | V8 full screen | 旁邊的人吸進多少？台灣沒有人量過。這張圖的數據不存在。 | How much does the person beside it breathe? Nobody in Taiwan has measured it. The data for this chart does not exist. |
| 44–54 | K2 | 聞到味道，代表你站在廢氣裡。一氧化碳沒有味道。 | If you can smell it, you are standing in it. Carbon monoxide has no smell. |
| 54–64 | K3 | 一個紅燈會怎樣，沒有研究。長年吸車流廢氣，和心臟病、肺癌、氣喘有關。 | What one red light does, no study says. Years of traffic exhaust are associated with heart disease, lung cancer and asthma. |
| 64–74 | K2 | 騎士在車陣裡。嬰兒車在排氣管那一公尺裡。 | The rider is in the pack. The stroller is in the tailpipe's first metre. |
| 74–82 | K4 | 綠燈。 | Green. |
| 82–90 | K5 | 同一個紅燈，沒有排氣管。 | The same red light. No tailpipes. |

End card: the repeatable sentence from Part 1, the site name, and 「看完整的證據」 → `/`.

### 4.8 `/sources/`: 資料來源

One stable number per source. Filter by chain link and by badge. Each entry lists what the site took from it, what it did not measure, the claims that rely on it, and when it was last checked. Sources reached only through media reports are tagged 次級來源. Research gaps are entries too, so that "we found nothing" can be cited. Data tables for every chart can be downloaded.

### 4.9 `/about/`: 關於

Who made the site and who paid for it, including any relationship with a scooter maker or battery network, or a plain statement that there is none (the owner must supply this; without it the site is open to the "advert" attack). How figures were checked, described truthfully, including the part automated research and checking played. The badge definitions. The rule that the scene is illustration and the charts are data. The statement of what would change our mind. Whether the campaign will commission the red-light measurement itself. The corrections log with dates. The update policy for subsidy data. A reuse licence for charts and share cards. Contact.

### 4.10 Existing strings that must change

| Where | Now | Replace with |
|---|---|---|
| `site.description` (`ui.ts`) | 「機車廢氣排在膝蓋的高度，直接進到路口行人的呼吸裡。…」 States the unmeasured link as fact; "knee height" is not sourced. | 中文：「機車的排氣管離地不到一公尺，就在斑馬線旁邊。行人在路口到底吸進什麼，台灣還沒有人量過。這裡整理已經知道的、還不知道的，以及換電動機車實際要花多少。」 English: "A scooter's tailpipe sits under a metre off the ground, beside the crosswalk. What pedestrians actually breathe at the crossing has not been measured in Taiwan. Here is what is known, what is not, and what going electric really costs." |
| `ui.scene.altRed` | Says exhaust "pools along the ground, densest at the bottom" and children "breathe inside the densest layer". | 中文：「路口側面示意圖：一排燃油機車在停止線後和待轉區裡怠速等紅燈，行人從車陣前走過斑馬線，轉角有一個戴黃帽的小學生和一位長者在等同一個綠燈。地面附近用斜線標出一層：有廢氣，多濃沒人量過。」 English: "Side view of a crossing: a row of gasoline scooters idles behind the stop line and in the turn box at a red light. People cross in front of them; on the corner a schoolchild in a yellow cap and an older woman wait for the same green. Hatching near the ground marks a layer where exhaust is present and its density has not been measured." |
| `ui.scene.altClean` | "the air the pedestrians cross through is clear" | 中文：「同一個路口：等紅燈的換成電動機車，車陣沒有排氣管，地面附近不再畫那一層斜線。遠處的汽車還在。」 English: "The same crossing: the scooters at the red light are electric, the pack has no tailpipes, and the hatched layer near the ground is no longer drawn. A car further off is still there." |
| `ui.pollutant.odorBody` | 「沒燒完的油氣。畫成貼地的暖色霧層。」 | 「廢氣裡聞得到的部分；是哪幾種成分，還沒有人鑑定過。畫成排氣管口的暖色波紋。」 / "The part of exhaust you can smell; which compounds, nobody has identified. Drawn as warm ribbons at the tailpipe." |
| `ui.pollutant.ufpBody` | "…drifts higher than the haze" | 「車流裡的超細微粒，不只來自機車。畫成針尖大小的細點。」 / "Ultrafine particles from traffic as a whole, not scooters alone. Drawn as pin-point stipple." |
| `chain.links[5]` | 誰吸得最多 / Who gets the highest dose | 誰離得最近 / Who is closest to it |
| `evidence.levels` | four levels | the eight badges in Part 2 |
| `StreetScene` header comment and behaviour | fumes "thicken as the countdown runs"; rings at mouths; children "inside the densest layer" | as specified in 3.0 |
| Styleguide sample chapter | "膝蓋的高度" | 「離地不到一公尺」 |

---

## 5. Infographic and illustration list

Every chart takes its numbers from the fact registry, sits in a `Figure` with a source line and badge, and offers its data table. "Exists" means the component is in the design system. "Extend" means an existing component needs new props. "New" means a later design pass builds it.

### Scene and navigation

1. **V1 紅燈現場 / The red light (extend `StreetScene`, `SceneCompare`, `Haze`).** Side view of street B's approach at red. Six frames K0 to K5 and two cameras, as specified in 3.0. New props: `frame`, `count`, `emphasis`. New haze kind `unmeasured`: diagonal hatching in the exhaust colour at one fixed density, with the in-frame label 「有廢氣｜多濃沒人量過」. Mouth heights are ticks. The schoolchild is drawn about 120 cm tall, above the stroller band. One front-row rider has a visible face. Stipple is street-wide. Remove the animation that thickens fumes with the countdown. The reader concludes nothing numerical from it; the frame says it is not drawn from measurements.
2. **V2 倒數軌 / Countdown rail (new; extend `ChainMarker` with `count` and `sticky`).** A 44 px strip under the header: LED count at left, seven pips, current link name. Pip style encodes evidence: filled for Taiwan data, outlined for modelled and international, an open break at Link 3, the last pip in signal green. Tapping opens the jump menu. The reader sees where they are in the red light and in the argument, and that one link is open.
3. **V3 七件事 / The seven lines (new `ChainStrip`).** The seven sentences in 3.2, each with its badge icon and a link. Two forms: the full list on the home page, and a one-line collapsed form on question pages with the current line lit. Footer of the collapsed form: 「怎麼接起來，你自己判斷。看我們怎麼接 →」.
4. **V4 問題選單 / Question chips (new, small).** Six chips styled as pedestrian push-buttons, two columns at 360 px, each an ordinary link.

### Home page

5. **V5 粉塵很少，油氣很多 / Little dust, a lot of fumes (`StackedBar` ×4).** Four horizontal bars, each 0 to 100% of national emissions: PM2.5 1.3%, NOx 2.2%, NMHC 10.0%, CO 15.6%. The motorcycle segment is in the exhaust colour on the two gas rows and cool grey on the two dust rows; exact values are printed at the bar. Title labelled 排放量. Source: TEDS 13.0, base year 2023. The reader concludes: by dust a sliver, by fumes a visible slice, and nowhere a majority.
6. **V6 路口平面圖 / Plan of one approach (new art, built from `ScrambleCrossing` parts).** Top view of street B's approach: stop box with a bracket 「2.5–6 公尺」, stop line, crosswalk, turn box beyond it with the dimension 「≥ 50 公分」 between its rear edge and the crosswalk, scooters from above with a small mark at each tail, people on the crosswalk, a yellow cap on the corner. Exhaust colour only at the tails. Caption: 「50 公分是規定的下限；實際距離每個路口不同。」 The reader concludes: the rules allow tailpipes this close to where people walk. Draw only after the geometry is confirmed.
7. **V7 第一公尺 / The first metre (frame K2, labelled).** The ruler from 0 to 180 cm; the band from 0 to 100 cm shaded 「排氣管在這一公尺裡」 (international review, vehicles in general); the stroller band 55 to 85 cm bracketed and sourced; child and adult mouth ticks marked 示意. No gradient is drawn. The reader concludes: the release zone and the stroller zone are the same zone; the schoolchild is above it.
8. **V8 空白的圖 / The empty chart (new; the site's signature graphic).** A fully styled `Figure`. X-axis 「紅燈倒數（秒）」 from 90 to 0 with a red-then-green bar beneath. Three stacked panels labelled 一氧化碳, 苯, 超細微粒, each with axis ticks and gridlines and no marks at all: no line, no dots, no placeholder shape. A small stroller icon and an adult icon sit at the y-axis to show the two heights nobody has measured. The badge 沒人量過 stands where the source line goes. The data table says 無資料. Caption: 「這不是版面錯誤。這張圖的數據不存在。」 Night tone. The reader concludes: the absence is specific and could be filled.
9. **V9 這把尺 / The wrong ruler (`BeforeAfterChart`; `LineChart` on `/evidence/`).** Taipei traffic stations minus general stations, annual PM2.5: +3.6 µg/m³ in 2017, +0.1 in 2024 (series `taipei-traffic-vs-general-stations`). The reader concludes: judged by PM2.5 the roadside now looks like everywhere else, which is why PM2.5 cannot answer this question.
10. **V10 聞得到／聞不到 (new, small two-column strip).** Left, a filled nose glyph: 「聞得到：你站在廢氣裡。可能是醛類；是哪幾種，沒有人鑑定過。」 Right, a hollow nose glyph: 「聞不到：一氧化碳、苯、車流裡的超細微粒。」 Under both: 「味道是警報，不是量表。」 The reader concludes: the smell and the list of what is in the air are different lists.
11. **V11 時間的尺 / The ruler of time (new).** A horizontal ladder with four stops of equal size: 90 秒, 1 小時, 2 小時, 很多年. The first stop is an empty dashed card. The others hold one finding each with its badge and the words 整體車流 or 所有來源的 PM2.5. Cards are the same size whatever the sample. Stacks vertically on phones. The reader concludes: evidence begins at an hour and grows with time, and the red light sits in the empty slot.
12. **V12 你的紅燈，一年加起來 (new interactive; `Range` ×2 and `ResultPanel`).** Two inputs with no preset values: red lights a day, seconds at each. Nothing is shown until both are entered. Output: hours a year, tagged 「你的數字，本站計算」, with the fixed line 「這只是時間，不是劑量。」 Collapsed by default.
13. **V13 同一個早上，三種通勤 (`BarChart`).** Chuang 2020 personal PM2.5 over one Taipei morning hour: subway 21.7, walking 42.7, gasoline scooter 53.6 µg/m³ (series `commute-pm25-chuang2020`). Subtitle: 所有來源的 PM2.5. Never merged with Wang 2021. The reader concludes: the rider is in it most.
14. **V14 一個號誌循環 / One signal cycle (new strip).** A time bar, red then green. Two annotated segments: over the red, 「怠速：你站在旁邊的時間」; over the first seconds of green, 「起步：國外量到微粒高峰（汽車和柴油車）」 with the 國際證據 badge. No curve, no y-axis. A tag: 「機車、台灣：沒人量過」. The reader concludes: the wait and the pull-away both count, and the peak may not be where they assumed.
15. **V15 六件事，一格空白 / Six facts and a blank (extend `EvidenceChain`).** Six filled links with one-line findings and badges, drawn in the line style of their evidence; a seventh open link with the question; a closed `Details` holding the inference; the two boxes 「我們沒有說」 and 「什麼會讓我們改口」 always open. On `/evidence/` every link is expanded with citations.
16. **V16 同一個紅燈，再來一次 (`SceneCompare`, with a new three-column ledger).** The switch 燃油機車／電動機車 swaps K1 and K5. Under it: 消失的：這一排機車在路口排的一氧化碳、油氣、苯。留下的：輪胎、煞車和路面的粉塵；旁邊的汽車和公車。搬走的：發電的排放。 The reader concludes: electric removes this pack's tailpipes from the crossing, not all pollution.
17. **V17 往回走的那條線 (`LineChart`).** Electric share of newly registered scooters by year, 18.7% in 2019 to 6.9% in 2025 (series `ev-share-new-registrations`), with hollow markers at 35% (2030), 70% (2035) and 100% (2040) joined by a dashed line. Caption: media-reported series; targets, not forecasts. The reader concludes: the line is heading away from the government's own targets.
18. **V18 打得平，打不平 (`WaterfallChart` ×2 with a two-question selector).** Each waterfall: list price, each subsidy as a step down, net price, then the gasoline reference bar (NT$50,500, or NT$45,600 when scrapping) and the gap. A gap that remains is drawn in the exhaust colour and labelled 還差. Default personas as in 3.12, 打不平 first. All values from the engine. The reader concludes: parity is real for some people and not for others, and they can find out which they are.
19. **V19 補助時間軸 (new, date-aware strip).** Today's marker; 12/31 「買車、領牌的最後期限」; 1/10 「線上申請截止（各縣市不同）」; then a dotted stretch 「2027：還沒有一項定案」 with the gap badge. In state C the dotted stretch carries an LED count: 「已經 N 天沒有定案」. Without JavaScript it prints the dates only.

### Evidence and question pages

20. **V20 同一座隧道 (`BarChart` ×2, equal size).** Left: CO per kilometre, motorcycles 4.33 g against cars 2.06 g (about twice). Right: CO per kilogram of fuel, 0.209 against 0.022 kg (about ten times). Caption: 一座台北隧道，行駛中的車流，不是怠速；同一座隧道的粉塵主要來自大型車。 Source Ting 2023.
21. **V21 正在變好 (`BeforeAfterChart`).** Motorcycle benzene and hydrocarbon emissions, 2013 to 2021: −73% and −46%. Labelled 推估的排放量. The reader concludes: when the worst tailpipes left the road, emissions fell.
22. **V22 老車和新車 (`BarChart` of multiples).** Against a baseline of 1: Phase III against Phase V, CO 2.56 times and hydrocarbons 1.84 times per litre; high against low mileage, CO about 3.3 times per litre. A separate hatched panel labelled 三台車的個案: 14 times CO, 32 times hydrocarbons.
23. **V23 法定的怠速上限 (two step charts).** By build date: CO 4.5%, 3.5%, 3.5%, 2.0%; hydrocarbons 9,000, 2,000, 1,600, 1,000 ppm. Caption: 排氣管口的法定上限，不是實際排放，也不是空氣裡的濃度。
24. **V24 100 台被通知定檢的機車 (`WaffleChart`).** 80 passed, 3 failed, 17 did not come (from 82.8% attendance and 3.78% failure; 本站計算). The 17 are drawn hollow. A second small waffle for pre-2004 two-strokes: 44 came. Caption: 「沒來的那些排多少，沒有人知道。」
25. **V25 測站跟得上什麼 (`RangePlot`).** Axis: correlation between personal readings and the nearest station, −0.2 to 1. PM2.5 from 0.67 to 0.86; benzene family from −0.01 to 0.38. Caption: 台北通勤者（腳踏車和機車），不是行人。 Source Wu 2021.
26. **V26 離現場最近的量測 (three small charts in one `Figure`, never merged).** (a) Wu 2021: benzene-family total 33.96 ppb riding the scooter lane against 20.07 ppb cycling the same routes. (b) Chuang 2020: as V13. (c) Wang 2021 `RangePlot`: sidewalk median 40 (10 to 275, n = 216); on a motorcycle stopped at red lights, median 75 (n = 21). Under each: 「和現場差在哪」. Under (c): the sensor likely reads about 30% high; the highest peaks with a named source were temple incense and food stalls.
27. **V27 鼻子的門檻 (new log strip).** One log axis in ppm. Bands, not dots: aldehydes around parts per billion; benzene from about 1.5 to nearly 100 ppm depending on the source; carbon monoxide off the axis, labelled 沒有味道. No street-level reference line.
28. **V28 致癌分級，照實寫 (`CompareTable`).** Benzene: Group 1. Outdoor air pollution and its particulate matter: Group 1. Diesel engine exhaust: Group 1. Gasoline engine exhaust: Group 2B. Footnote: 分級講的是會不會，不是吸多少會。
29. **V29 嬰兒車高度，各國研究怎麼說 (new dot strip).** A percent axis: a shaded band at 5 to 15% labelled 多數研究; a dot at 59% labelled 美國一項路邊研究，PM2.5; a dot at 44% labelled 英國一項實驗，細微粒，最高值; two dots at 0 labelled 沒量到差別. A tag: 「台灣：0 項研究」.
30. **V30 證據地圖 (new matrix).** Rows: the seven links. Columns: the badges. Each cell lists its studies as citation chips; empty cells stay empty; the cell for 「路口行人」 in Link 3 is outlined in the gap style.
31. **V31 94% 是怎麼來的 (new strip; publish only after the report is re-opened).** A 0 to 100% axis: a band at 3 to 21% labelled 一般的模擬日; one dot at 94 labelled 高雄一個路口、一個模擬日，報告自己標為離群值.
32. **V32 安靜的那條路 (`BeforeAfterChart`).** Main route against quiet route: benzene −33%, PM2.5 −28%. Caption: 騎車的通勤者，不是站著的行人。
33. **V33 我們不會說的話 (list graphic).** The do-not-claim statements as struck-through sentences, each followed by one line of why. Generated from the claims policy.
34. **V34 路上有多少車 (`Stat` ×4).** 1,466 萬輛機車；77 萬輛電動；約 28 萬輛二行程；2020 到 2023 年報廢 219 萬輛.

### `/unmeasured/`

35. **V35 量測建議圖 (new diagram).** The plan from V6 with instrument icons at the corner, beside the turn box, beside the stop box and at a control point; a side inset with the two heights; a signal clock along the bottom. Stamped 本站提議.

### `/electric/`

36. **V36 三種結果 (`ResultPanel` states).** A: clear tone, green signal. B: neutral tone. C: exhaust tone with a next-steps list. Each states the verdict in one sentence above the number.
37. **V37 我的價格瀑布 (`WaterfallChart`).** As V18, for the reader's own inputs, with a `Ledger` listing each line, its payer, whether it is a ceiling ("up to"), and its check date.
38. **V38 打平圖 (`BreakEvenChart`).** Two cumulative cost lines over 60 months. Two designed states: the lines cross and the month is labelled; or they do not, with 「以你的里程，五年內打不平」 and the monthly distance at which they would.
39. **V39 每個月的帳 (stacked bars from the engine).** Gasoline against electric at the reader's distance, in NT$ a month, stacked by energy, plan fee, maintenance and road fee. The survey averages (NT$8,400 and NT$10,500 a year) are reference ticks. Under it, the plan arithmetic in words.
40. **V40 每公里多少錢 (`RangePlot`).** 在家充電 0.05–0.20；加油 0.55–0.75；換電（用多少付多少）約 1.0. A note that the petrol price is held down by a temporary measure.
41. **V41 縣市補助磚塊地圖 (new tile grid of 22 jurisdictions).** Four states told apart by fill and pattern as well as colour: 有名額 · 只限汰舊或特定身分 · 已用完 · 查不到. A tap opens the amounts and check date.
42. **V42 換電還是充電 (new decision strip).** Three questions: 停車的地方能不能充電；一個月騎多少；一定要白牌嗎. Leads to an energy option for the calculator.
43. **V43 誰划算，誰打不平 (`CompareTable`).** As in 4.3, section 7.

### Distribution

44. **V44 分享圖卡 (generated; 1200×630 and square for LINE).** Per question page and for the seven lines: question, answer, caveat line, badge, hatched band, wordmark. The caveat is part of the image, so a screenshot cannot shed it. The home default card reads 「那個味道，你也聞過。吸進多少，沒人量過。」
45. **V45 90 秒 (new, wave 2).** As specified in 4.7.
46. **V46 校門口海報 (printable A4, both languages).** The empty chart, small; the headline 「校門口這個路口的空氣，沒有人量過」; a QR code to `/unmeasured/#ask`; one request: 「請和我們一起，請環保局來量。」 A second line in smaller type: 「停著等孩子的時候，請熄火。這是請求，不是量過的效果。」
47. **V47 一張紙的量測需求 (print stylesheet of `/unmeasured/`).** V35 and the brief on one page.

---

## 6. Calls to action

Every action is tagged with the badge of the evidence behind it. There is one calculator button on the home page, in the money chapter.

**Anyone who walks (我走路)**

1. Send the seven lines, or one question card, to one LINE group.
2. Ask the city to measure your crossing: 「請來量我家路口」.
3. While you wait, stand a few steps back from the turn box and the stop line. 〔我們的推論〕
4. Where there is a choice, take the quieter street. A quiet route cut benzene by 33% and PM2.5 by 28% for commuters riding in Taipei. 〔台灣實測〕
5. Keep walking. The site says so in as many words.

**A rider who is about to buy (我要買車)**

1. Run the calculator before you go to the dealer. If the verdict is A, follow the dated checklist: register on the ministry's platform, buy and register the scooter, scrap the old one, file.
2. If you own a scooter ten or more years old, or a pre-2004 two-stroke, scrapping it is the largest subsidy almost everywhere.
3. Match the plan to your distance; check whether you can charge where you park.

**A rider who is not switching now (我現在不換車)**

1. Turn up for the exhaust inspection, and fix what fails. Older and high-mileage scooters emit far more per litre. 〔台灣實測〕
2. Scrap the household's two-stroke.
3. Ask to be told when a 2027 programme is confirmed, and send the letter asking for one.
4. The site does not ask riders to switch off at red lights. The test evidence on restart emissions is mixed, and the site says so. **[research file: `idle-emissions.json`]**

**A parent (我有小孩)**

1. With a stroller, wait a little further from the turn box and the stop line. A precaution, not a measured benefit. 〔我們的推論〕
2. Pick the school route with fewer big junctions.
3. Take the poster and the measurement request to the parents' association (家長會).
4. If the family's next scooter is electric, check the child top-up for your own city in the calculator (Taipei adds NT$8,000 for a child of 12 or under; elsewhere it depends on a scooter to scrap or household status).

**A neighbourhood, school or building (里、學校、管委會)**

1. A joint request to measure one named crossing, copied to the local councillor.
2. Ask for the school crossing to be treated first under the 2024 pedestrian facilities act, with the turn box set further back than the 50 cm minimum, as a trial measured before and after. No air-quality benefit has been measured yet, and the request says so.
3. Organise a scrappage day for the remaining two-strokes; publicise inspection dates.
4. The building committee allows scooter charging in the car park.

**A policymaker (我在政府或議會)**

1. Publish the 2027 programme before the 2026 one lapses.
2. Commission the measurement.
3. Use powers that already exist: cities may designate air-quality maintenance zones; the pedestrian act requires zones near schools and hospitals but sets no air target. **[research file: `policy-idling.json`]**

**What the site asks of government (我們對政府的六個要求), in order**

| # | 要求 | Ask | Addressed to (to be confirmed, Appendix B) |
|---|---|---|---|
| 1 | 12 月 31 日前公布 2027 年的補助，而且一次講清楚好幾年。 | No cliff on 1 January: publish the 2027 programme now, for several years at a time. | 經濟部（購車補助）、環境部（汰舊）、各縣市環保局 |
| 2 | 到路口去量，把那張空白的圖填起來。 | Measure carbon monoxide, benzene-family compounds and ultrafine particles at pedestrian and stroller height, by signal phase, at scooter-heavy crossings, and publish the raw data. Stop judging street air by PM2.5 alone. | 環境部、各縣市環保局、交通部運輸研究所 |
| 3 | 找到 100 台裡沒來定檢的那 17 台。 | Follow up the 17 in 100 who do not turn up for inspection, and retire the roughly 280,000 two-strokes still registered. | 環境部、各縣市環保局 |
| 4 | 回到自己訂的目標。 | 6.9% of new scooters were electric in 2025; the target is 35% by 2030. Say how the gap closes. | 行政院（淨零路徑主責機關待確認） |
| 5 | 學校旁的路口先改，改前改後都量。 | Trial larger set-backs for turn boxes at school crossings, and measure before and after before claiming a benefit. | 交通部（標線規則）、各縣市交通局 |
| 6 | 讓電動的每月開銷不輸加油，公寓也充得到電。 | Fix running costs, not only purchase price: support that reaches low-mileage riders, and a clear way to charge in apartment buildings. Labelled as our position, not a finding. | 經濟部、內政部（公寓大廈）待確認 |

---

## 7. Risks

**1. "You drew a scare picture of something nobody measured."** The most likely and most damaging attack. It can arrive as a cropped screenshot of the scene, as a fragment of a question page read beside another ("scooters emit benzene" next to "benzene causes leukaemia"), or as the fair observation that the health evidence is about PM2.5 and traffic in general.

Defences, all structural:

- The haze is a constant hatched band with 「多濃沒人量過」 inside the frame. It never changes with the clock, and no frame shows a scooter pull-away surge. The label survives a crop.
- The scene and the data never share a frame. Link 5 has no scene colour at all.
- The gap is the site's own centrepiece (V8), a nav item and the first action link. Nobody can reveal it.
- The Link 5 headline denies the claim a critic would accuse the site of making, and adds that the opposite cannot be said either.
- The site says outright that the health studies measured traffic or all-source PM2.5, the yardstick Link 1 calls wrong for scooters.
- The inference claims a direction of exposure and nothing about health, is closed until asked for, and sits beside 「我們沒有說」 and 「什麼會讓我們改口」.
- Share cards carry the caveat inside the image. The seven lines are each true alone.
- `flagCopy()` runs in CI with a reviewed allow-list; rules R1 to R16 are checked by a person.
- The site volunteers the facts against it, and commits in advance to publishing a null result.

**2. "It blames riders, it is an advert for one company, and its numbers expire."** Most Taiwanese households ride; one firm holds about 87% of the electric market; a subscription costs more than petrol for light users; and on 1 January every 2026 figure is stale.

Defences:

- The rider has a face in the first frame, the prologue says most of us are both, and Link 6 puts the rider first among the exposed.
- The subject of every critical sentence is the tailpipe, the rule or the subsidy.
- No price or purchase button appears in the health chapters; there is no sticky sales bar and no deadline counter.
- The calculator may answer 打不平, and says 「我們不會叫你硬換」. 「我現在不換車」 is a button of equal size with a full page behind it.
- The page states that swapping can cost more than petrol, that home charging is close to impossible without a parking space, and that one supplier dominates and made a loss.
- The first ask of government is about the subsidy cliff and the sixth is about running costs, which moves the burden off the rider.
- States A to D with city exhaustion as a state; every amount has a check date; state C is built first; after the deadline the counter is aimed at government.
- Brand-neutral copy and a funding statement on `/about/`.

**3. It does not reach people, or does not ship in time.** The original conceit was a pinned, scroll-driven scene with eleven stages, read in six or seven minutes, with 36 days to the deadline. A reader who leaves after one screen would have seen only a picture, and the page's ending would have expired before it was built.

Defences:

- The first screen carries the idea; the second carries the whole chain in seven lines and six question chips.
- Each chapter has a strict budget and stands alone with its own anchor, frame and action.
- Six static keyframes, nothing pinned on phones, inline SVG only. The pinned layout is a desktop enhancement.
- Question pages and share cards are the unit people forward; the film follows in wave 2.
- Two waves. Wave 1, before 31 December: `/electric/` with the calculator and states, city status, `/unmeasured/`, `/questions/`, share cards, and the home page in static frames. Wave 2, January, launched on the lapse: the film, the desktop pinned scene, and the state C home chapter with its counter.


---

## 8. Build map

### 8.1 Workstreams

Eight workstreams, each owning its own files, so builders do not overlap. Workstream D (data) comes first; nothing in H, Q or E is published against a fact that is not in the registry.

| Code | Workstream | Owns | Depends on |
|---|---|---|---|
| D | Data | `src/data/**`: the registry entries in Part 9; the gap list; quota status and check dates per programme | research files |
| S | System | `src/i18n/ui.ts` (strings in 4.10, `chain.summary`, renamed Link 6); `EvidenceBadge` and `EvidenceLegend` (eight badges, line styles); `ChainMarker` → countdown rail (V2); `ChainStrip` (V3); `Chapter` (`hazeKind="unmeasured"`); the share-card generator (V44); the date-state utility used by the home money chapter, V19 and `/electric/`; `flagCopy()` in CI with the allow-list | D for badge types |
| A | Art | `src/components/art/**`: `StreetScene` frames K0–K5 (V1); `Haze kind="unmeasured"`; `PollutantKey` copy; the `SceneCompare` ledger (V16); the plan of the approach (V6); the first-metre labels (V7); nose glyphs (V10); the signal-cycle strip (V14); the measurement diagram (V35) | geometry confirmed (Appendix B, 8) |
| H | Home | `src/pages/[...lang]/index.astro`: chapters 3.1 to 3.13; instances of V5, V8, V9, V11, V12, V13, V15, V17, V18 | S, A, D |
| Q | Questions, evidence, sources | `/questions/**`, `/evidence/`, `/sources/`; V20 to V34 | S, D |
| E | Electric | `/electric/`: calculator interface on the existing engine (`src/lib/calc`); V36 to V43; states A to D | S (date-state), D (econ) |
| P | Action, unmeasured, about, print | `/act/`, `/unmeasured/`, `/about/`; the request and letter templates; V46, V47 | S, A (V35) |
| F | Film and desktop scene (wave 2) | `/90/` (V45); the pinned two-column layout at 960 px and above | A, H |

### 8.2 Waves

| Wave | Ships | Contents |
|---|---|---|
| 1 | as soon as possible before 2026-12-31 | D complete for Part 9. S complete. `/electric/` with states A to C built and tested (C first). `/unmeasured/`, `/act/`, `/about/`. `/questions/` and `/evidence/`. Share cards. Home page in static frames (K0 to K5) with the rail. |
| 2 | January 2027, launched on the lapse | `/90/`. The desktop pinned scene. The state C home money chapter with its counter of days without a programme. The hero button 「播放 90 秒」. |

### 8.3 Home page, chapter by chapter

| Chapter | Existing components | Charts | Art | New to build | Workstream |
|---|---|---|---|---|---|
| 3.1 Prologue | `Base`, `Phrased`, `Signal`, `Callout` (disclosure strip), `Button` | | `StreetScene frame="empty"` | V1 frames; V2 rail | H, A, S |
| 3.2 懶人包 | `Section`, `EvidenceBadge`, `Tag` | | | V3 `ChainStrip`; V4 chips | S, H |
| 3.3 Link 1 | `Chapter link={1}`, `Figure`, `Cite`, `Callout` | `StackedBar` ×4 (V5) | frame K1 | none beyond V1 | H |
| 3.4 Link 2 | `Chapter link={2}`, `Figure`, `Callout` | | frame K2 (V7); V6 | V6 plan | H, A |
| 3.5 Link 3 | `Chapter link={3} tone="night"`, `Figure`, `PullQuote`, `Callout` | `BeforeAfterChart` (V9) | frame K3 | V8 empty chart (an empty state of `Figure` and `ChartShell`) | H, S |
| 3.6 Link 4 | `Chapter link={4}`, `Callout`, `PollutantKey` | | frame K2 | V10 strip | H, A |
| 3.7 Link 5 | `Chapter link={5} tone="sunken"`, `Callout` ×2, `Details`, `Range`, `ResultPanel` | | frame K3 | V11 ladder; V12 tool | H |
| 3.8 Link 6 | `Chapter link={6}`, `Figure`, `Callout` | `BarChart` (V13) | frame K2 (V7) | none | H |
| 3.9 Green | `Chapter phase="green" size="auto"`, `Figure` | | frame K4 | V14 strip | H, A |
| 3.10 Connect | `Chapter tone="sunken"`, `EvidenceChain`, `ChainLink`, `Details`, `Callout` ×2 | | | V15: open seventh link and reveal | H, S |
| 3.11 Link 7 | `Chapter link={7} tone="clear"`, `SceneCompare`, `Figure` | `LineChart` (V17) | frames K1 and K5 | V16 ledger | H, A |
| 3.12 Money | `Chapter`, `Select`, `RadioGroup`, `Button` ×2, `Tag` (status) | `WaterfallChart` ×2 (V18) | | V19 timeline; the two-question selector wired to the engine | H, E, S |
| 3.13 Close | `Section`, `Card` ×5, `Button` | | frame K0 | none | H |

### 8.4 Other pages

| Page | Existing components | Charts | Art | New to build | Workstream |
|---|---|---|---|---|---|
| `/questions/` index | `Section`, `Card`, `EvidenceBadge` | | | none | Q |
| `/questions/<slug>/` ×8 | `Figure`, `Callout`, `Details`, `Cite`, `Card` | per 4.2: `RangePlot`, `BarChart`, `BeforeAfterChart`, `WaffleChart`, `CompareTable` | V6, V7, V10 reused | V3 collapsed form; V44 cards; V27; V29 | Q, S |
| `/evidence/` | `EvidenceChain`, `EvidenceLegend`, `CompareTable`, `Details`, `Tabs`, `Stat` | V5, V9, V13, V17, V20–V26, V28, V32, V34 | | V30 map; V31 strip; V33 list; the five-column evidence table | Q |
| `/sources/` | `Cite`, `Tag`, `Details` | | | filter control | Q |
| `/unmeasured/` | `Section`, `Callout`, `PullQuote`, `Button`, `Select` | | V35 | V8 reused; the request form; V47 print stylesheet | P, A |
| `/electric/` | `Select`, `RadioGroup`, `Range`, `ResultPanel`, `Ledger`, `Tabs`, `TabPanel`, `Details`, `CompareTable` (V43), `Tag` | `WaterfallChart` (V37), `BreakEvenChart` (V38), `RangePlot` (V40), `GroupedBarChart` or stacked bars (V39) | `Scooter` (generic, both kinds) | V36 states; V41 tile map; V42 strip; V19; the checklist download; state handling | E, S |
| `/act/` | `Tabs`, `Card`, `EvidenceBadge`, `Button` | `WaffleChart` (V24) | V6 | templates; V46 poster | P |
| `/about/` | `Section`, `EvidenceLegend`, `Details` | | | corrections log | P |
| `/90/` | `Signal` | | V1 frames | V45 player | F |

### 8.5 New components and props, in one list

`StreetScene`: `frame`, `count`, `emphasis`. `Haze` and `Chapter`: kind `unmeasured`. `ChainMarker`: `count`, jump menu. `ChainStrip` (new). `EvidenceBadge`: eight levels and line styles. `EvidenceChain`: an open final question link and a reveal slot. `Figure` and `ChartShell`: an empty-data state. `SceneCompare`: a ledger slot. `ResultPanel`: verdict states A, B, C. Tile map (new). Time ladder (new). Signal-cycle strip (new). Decision strip (new). Share-card generator (new). Date-state utility (new).

---

## 9. Evidence needs

What the copy and charts rely on. "Exists" gives the registry id found in `src/data/facts.ts`, `src/data/series.ts` or `src/data/facts-economics.ts` on 2026-11-25. "NEW" means no entry was found and one must be added from the research file named, with its caveat and evidence type. Suggested ids are in code type. None of the red-light sweep (`research/redlight/*.json`) is in the registry yet.

### 9.1 Link 1: what leaves the tailpipe

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| Motorcycle shares of national emissions | PM2.5 1.3%, NOx 2.2%, NMHC 10.0%, CO 15.6% | Link 1, TEDS 13.0 | `01-prevalence-emissions.md` | 台灣官方資料 | Exists: `teds13-mc-pm25-share`, `-nox-share`, `-nmhc-share`, `-co-share`; series `teds13-motorcycle-share` | 3.2 line 1, 3.3, V5 |
| Hydrocarbon tonnage 2021 | motorcycles 37,000 t; gasoline cars and light trucks 39,000 t; 32.6% of vehicle-km | Link 1, Tsai 2023 | `papers/tsai-2023-atmosphere.json` | 台灣模式推估 | NEW `tsai2023-hc-tonnes-2021` (the 32.6% is in `ef-vehicle-class-ranking-tsai2023`) | `/evidence/#link-1` |
| Benzene tonnage 2021 | motorcycles 286 t; gasoline vehicles 545 t | Link 1, Tsai 2023 | same | 台灣模式推估 | NEW `tsai2023-benzene-tonnes-2021` | 3.3 caveat |
| Trend 2013–2021 | benzene −73%, hydrocarbons −46% | Link 1, Tsai 2023 | same | 台灣模式推估 | NEW `tsai2023-trend-2013-2021` and a series | 3.3, V21 |
| Per-km ranking | motorcycles highest for benzene, above gasoline cars for hydrocarbons, lowest for PM2.5 and NOx | Link 1 | same | 台灣模式推估 | Exists: `ef-vehicle-class-ranking-tsai2023` | `/evidence/` |
| Taipei tunnel | CO tracked motorcycle flow (r = 0.96); about half the traffic motorcycles; 0.209 against 0.022 kg CO per kg fuel; 4.33 against 2.06 g/km; particles dominated by heavy vehicles | Link 1, Ting 2023 | `papers/ting-2023-envres.json` | 台灣實測 | Exists: `tunnel-motorcycles-co-ting2023`, but without these numbers. EXTEND | 3.3, V20 |
| Older phase | Phase III against V: CO +156%, hydrocarbons +84% per litre | Link 1, Tsai 2018 | `papers/tsai-2018-aaqr.json` | 台灣實測 | Exists: `ef-older-phase-tsai2018`; series `tsai2018-older-phase-excess` | V22, `/act/#keep` |
| Mileage | CO per litre about 3.3-fold from about 5,000 km to about 48,000 km; aromatics 38–48% of exhaust VOC mass | Link 1 | same | 台灣實測 | Partly: `ef-mileage-voc-tsai2018` (VOC and aromatics). NEW value for CO | V22 |
| Three-scooter case study | deteriorated Phase IV at 14 times the CO and 32 times the hydrocarbons of a Phase VII | Link 1, Tsai 2026 | `redlight/idle-emissions.json`, `redlight/smell-chemistry.json` | 台灣實測 (case study) | NEW `tsai2026-three-scooter-case` | V22 hatched panel only (R13) |
| Idle-test limits by build date | before 2004: 4.5% CO, 9,000 ppm HC; 2004: 3.5%, 2,000; from July 2007: 3.5%, 1,600; from 2017: 2.0%, 1,000 | Link 1 | `redlight/idle-emissions.json` | 台灣官方資料 | NEW `idle-test-limits` and a series | V23 |
| Inspection 2025 | 82.8% attendance, 3.78% failure (four-strokes); 5.1–5.6% failure at 17 years and over; pre-2004 two-strokes 44% attendance, 8.4% failure | Link 1 | same | 台灣官方資料 | NEW `inspection-2025` | V24, ask 3 |
| 100 notified scooters | 80 passed, 3 failed, 17 did not come | derived from the row above | | 本站計算 | NEW `inspection-2025-per-100` with `derivedFrom` | V24 |
| Fleet | 14.66 million registered (2024); 770,000 electric; about 280,000 two-strokes; 2.19 million scrapped 2020–2023 | Link 1 | `01-prevalence-emissions.md` | 台灣官方資料 | Exists: `fleet-registered-2024`, `fleet-electric-registered-2024`, `two-stroke-remaining`, `old-scooters-retired-2020-2023` | V34, ask 3 |
| Cold start | CO 1.1–1.5 times, hydrocarbons 1.2–2.8 times (older carburetted scooters) | Link 1 | `redlight/idle-emissions.json` | 台灣實測 | NEW `cold-start-multipliers` | `/evidence/` |
| Carbonyls in exhaust | formaldehyde and acetaldehyde among the dominant carbonyls in Taiwanese scooter exhaust | Link 4 | `redlight/smell-chemistry.json` | 台灣實測 | NEW `scooter-exhaust-carbonyls` | 3.6 |

### 9.2 Link 2: where it comes out

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| First metre | most vehicle tailpipes within the first metre above the road; in-stroller breathing height 0.55–0.85 m; the review also says the gradient may not exist in the first two metres | Link 2, Sharma & Kumar 2018 | `papers/sharma-kumar-2018-envint.json` | 國際證據 | NEW `first-metre-sharma-kumar-2018` | 3.4, 3.8, V7 |
| Marking rules | turn box rear edge at least 0.5 m from the crosswalk, adjustable; stop box 2.5–6 m deep, behind the stop line; turn box beyond the crosswalk (Arts. 174-2, 191) | Link 2 | `redlight/intersection-peaks.json` (`moj-rules-geometry`), `redlight/policy-idling.json` | 台灣官方資料 | NEW `marking-rules-turn-box` | 3.4, V6, ask 5 |
| Anti-idling rule | engine off when stopped and waiting more than 3 minutes; exempts traffic-control waits, rain, days above 30 °C; coverage of scooters unresolved | Link 2 | `redlight/policy-idling.json` (`idling-regulation-text`) | 台灣官方資料 | NEW `idling-regulation` | 3.4 (R1) |
| Kerbside ultrafine bands | modelled hotspots in narrow kerbside bands and at intersections, Zhonghe | Link 2, Chang & Hsiao 2026 | `papers/chang-hsiao-2026-jhm.json` | 台灣模式推估 | Exists: `ufp-near-road-bands-chang2026` | `/evidence/#link-2`, basis of "stand back" |
| Signal-cycle peaks | Hong Kong, Shanghai, UK: particle peaks follow the signal, highest as vehicles pull away; mostly cars and diesel | Link 2 | `redlight/intersection-peaks.json` | 國際證據 | NEW `signal-cycle-peaks-international` | 3.9, V14 |
| Gaps | no Taiwanese idle emission rate; no pull-away spike; no count of scooters per red light | Link 2 GAP | `redlight/idle-emissions.json`, `intersection-peaks.json` | 沒人量過 | NEW gap entries (see 9.8) | 3.4 caveat, `/unmeasured/` |
| One idle particle datum | one Taiwanese four-stroke: particle number at idle slightly lower than at 15 and 30 km/h | not in digest | `redlight/idle-emissions.json` (`chien-huang-2010-idle-pn`) | 台灣實測 | NEW, optional | `/evidence/#not-used` ("idling emits most") **[research file]** |

### 9.3 Link 3: what people breathe

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| Stations and street fumes | personal benzene-family readings against the nearest station r = −0.01 to 0.38; PM2.5 r = 0.67 to 0.86; authors' warning quoted | Link 3, Wu 2021 | `papers/wu-2021-trd.json` | 台灣實測 | NEW `wu2021-station-correlation` | 3.5, 3.10 line 3, V25 |
| Scooter lane | total benzene family 33.96 ppb (electric scooter in the scooter lane) against 20.07 ppb (cyclists); benzene 40% lower for cyclists; rush hour about 1.9 times non-rush | Link 3, Wu 2021 | same | 台灣實測 | Exists: `rider-exposure-wu2021`, series `rider-exposure-wu2021`. EXTEND with rush hour | V26a, 3.11 caveat |
| Quiet route | benzene −33%, PM2.5 −28% | Link 3, Wu 2021 | same | 台灣實測 | NEW `wu2021-quiet-route` | 3.7 action, V32 |
| Commute modes | personal PM2.5: subway 21.7, walking 42.7 ± 22.6, gasoline scooter 53.6 µg/m³; 120 adults, one morning hour | Link 3, Chuang 2020 | `papers/chuang-2020-aex.json` | 台灣實測 | Exists: `commute-scooter-vs-subway-chuang2020`, series `commute-pm25-chuang2020` (confirm walking is in it) | 3.8, V13, V26b |
| Sidewalk readings | median 40 µg/m³ (10–275, n = 216); on a motorcycle stopped at red lights median 75 (n = 21); sensor about 30% high; highest named peaks were incense and food stalls | Link 3, Wang 2021 | `papers/wang-2021-atmosphere.json` | 台灣實測 | Exists: `commute-walking-wang2021`, `commute-motorcycle-wang2021`, series `commute-pm25-wang2021` | V26c |
| Station gap | traffic minus general stations: +3.6 µg/m³ (2017), +0.1 (2024); ten-intersection field measurements close to stations | Link 3 | `02-exposure-science.md` | 台灣官方資料 | Exists: `taipei-traffic-station-gap`, series `taipei-traffic-vs-general-stations`, `iot-study-design` | 3.5, V9 |
| The 94% figure | one modelled day at one Kaohsiung intersection, flagged as an outlier; typical days about 3–21%; some Taipei sites none | Link 3, IOT 2025 | `02-exposure-science.md`; `redlight/intersection-peaks.json` marks it not re-opened | 台灣模式推估 | Exists: `iot-scramble-typical-range`, `iot-scramble-outlier-day`, series `iot-scramble-by-day`. Verification conflict (Appendix B, 6) | V31, `/evidence/#not-used` |

### 9.4 Link 4: what those compounds do

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| IARC classes | benzene Group 1 (leukaemia); outdoor air pollution and particulate matter Group 1; diesel exhaust Group 1; gasoline engine exhaust Group 2B | Link 4 | `03-health.md` | 國際證據 | Exists: `iarc-benzene-group1`, `iarc-outdoor-air-pollution-group1`, `iarc-diesel-exhaust-group1`, `iarc-gasoline-exhaust-2b` | 3.6, V28 |
| WHO on benzene | no safe level of exposure can be recommended | Link 4 | `redlight/smell-chemistry.json` | 國際證據 | NEW `who-benzene-no-safe-level` (or confirm inside `iarc-benzene-group1`) | 3.6 |
| Odour thresholds, as ranges | acetaldehyde and acrolein at parts per billion (about 0.0015 and 0.0036 ppm in one source); benzene about 1.5 to 97 ppm by source | Link 4 | same | 國際證據 | NEW `odour-thresholds` with ranges and the note "sources differ by one to two orders of magnitude" | 3.6, V27 |
| No smell | carbon monoxide colourless and odourless; ultrafine particles have no smell | Link 4 | same; `redlight/acute-health.json` | 國際證據 | NEW `co-odourless`, `ufp-no-odour` | 3.2 line 4, 3.6, V10 |
| Odorants | the main odorants of scooter exhaust have not been identified | Link 4 GAP | `redlight/smell-chemistry.json` | 沒人量過 | NEW gap entry | 3.6, `smell` page |

### 9.5 Link 5: what happens to people who breathe traffic exhaust

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| HEI review | 353 studies; high or moderate-to-high confidence in an association with death from all causes, heart disease and lung cancer, and with asthma onset in children and adults; did not assess causality | Link 5 | `redlight/long-term-traffic.json` | 國際證據 | Exists: `hei-sr23-trap-associations`, series `hei-sr23-outcomes` | 3.7, V11 |
| Taipei walkers | per 24.4 µg/m³ PM2.5: systolic pressure +6.5%, heart rate +3.4%, 8-OHdG +8.1%; none on the subway; 120 healthy adults, one hour; exertion not adjusted | Link 5, Chuang 2020 | `papers/chuang-2020-aex.json` | 台灣實測 | Exists: `chuang2020-cardiovascular-association` (confirm the walking values and increment are in `data`) | 3.7 (words only), `/evidence/#link-5` (numbers) |
| London walks | two hours on a diesel-dominated street: lung function down by up to 6.1% in adults with asthma; benefits of walking cancelled for over-60s for up to 26 hours | Link 5 | `redlight/acute-health.json` | 國際證據 | NEW `mccreanor2007-london-walk`, `sinharay2018-london-walk` | 3.7, V11 |
| Taiwan cohort | 384,130 adults; highest against lowest long-term PM2.5: 15% higher risk of death; all-source PM2.5 | Link 5 | `redlight/long-term-traffic.json` (`mj-cohort-pm25-mortality-exercise-guo-2021`) | 台灣實測 | NEW `mj-cohort-mortality-guo2021` | 3.7, V11 |
| Exercise | in the same cohort, exercise lowered risk in every PM2.5 group | not in digest | same | 台灣實測 | NEW, inside the entry above **[research file]** | 3.7 callout |
| Never-smokers | lung cancer incidence 32% higher per 10 µg/m³ (all-source); 53% of patients in one study never smoked; cause not established; lung cancer is the leading cancer death | Link 5 | `03-health.md`, `redlight/long-term-traffic.json` | 台灣實測 · 台灣官方資料 | Partly: `tseng2019-never-smokers`, `mohw-lung-cancer-2025`. NEW for the 32% | `/evidence/#not-used` only (R14) |

### 9.6 Link 6: who is closest

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| Children | breathe faster and closer to the ground (WHO) | Link 6 | `03-health.md` | 國際證據 | Exists: `who-children-vulnerable` | 3.2 line 6, 3.8 |
| Stroller-height studies | usually 5–15% higher; 59% (PM2.5, one US roadside study); up to 44% (fine particles, one UK experiment); two studies found no difference; none in Taiwan | Link 6 | `papers/sharma-kumar-2018-envint.json`, `redlight/intersection-peaks.json` | 國際證據 | Partly: `pram-height-sharma2020`. NEW `stroller-height-review` and a small dataset for V29 | 3.8, V29 |
| Schoolchildren survey | 331,686 middle-school students, 1995–96, stations within 2 km of schools; asthma associated with traffic-related CO and NOx | Link 6 | `redlight/vulnerable-groups.json` (Guo 1999) | 台灣實測 | NEW `guo1999-asthma-survey`. (`hwang2005-asthma-co` is a different study and stays on `/evidence/`.) | `my-child` page (R6) |
| Lung function | about 2–3% lower per 10 µg/m³ PM2.5 in 24,544 young people | Link 6 | same | 台灣實測 | Exists: `guo2019-lung-function` | `my-child` page |
| People who work in traffic | delivery workers' exhaled CO, non-smokers 1.57 against 1.13 ppm (vehicle not stated); toll workers about double the oxidative-stress marker | Link 6 | same | 台灣實測 | NEW `li2025-delivery-workers-co`, `lai2005-toll-workers` | `rider` page |
| Older adults | stroke admissions and dementia associated with traffic-influenced pollutants; no numbers printed | Link 6 | same | 台灣實測 | NEW `older-adults-associations` (statement only) | `/evidence/#link-6` |
| Gaps | no child-height measurement in Taiwan; no school-commute or pillion measurement | Link 6 | same | 沒人量過 | NEW gap entries | 3.8 |
| Child height abroad, optional | PM2.5 more than 20% higher at 1.0 m than 1.6 m on six of eight days, Mainz, low-cost sensors | not in digest | `02-exposure-science.md` | 國際證據 | Exists: `child-height-harr2022` | `my-child` page, only if the owner agrees **[research file]** |

### 9.7 Link 7 and the asks

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| No tailpipe | zero CO, hydrocarbons and benzene from the scooter at the crossing; tyre, brake and road dust remain; generation emits elsewhere | Link 7 | `01-prevalence-emissions.md` | fact · 台灣官方資料 | Exists: `teds13-electric-mc-pm25` | 3.11, V16 |
| Electric share of new scooters | 18.7% (2019), 6.9% (2025); series by year | Link 7 | `01-prevalence-emissions.md`, `econ/infrastructure-policy-r2.json` | 台灣官方資料, 次級來源 | Exists: `ev-share-2019` … `ev-share-2025`, series `ev-share-new-registrations` | 3.11, V17, ask 4 |
| Targets | 35% (2030), 70% (2035), 100% (2040) | Link 7 | same | 台灣官方資料, 次級來源 | Exists: `netzero-ev-sales-targets` | V17, ask 4 |
| Pedestrian act | promulgated 2024-05-01; cities designate pedestrian-friendly zones near schools and hospitals; no air target; commencement date unconfirmed | not in digest | `redlight/policy-idling.json` | 台灣官方資料 | NEW `pedestrian-facilities-act-2024` **[research file]** | Part 6 |
| Air-quality maintenance zones | Air Pollution Control Act art. 40 lets cities designate zones and restrict vehicles | not in digest | same | 台灣官方資料 | NEW `apca-maintenance-zones` **[research file]** | Part 6 |
| Idle-stop | restart emissions can outweigh shut-off savings in one dynamometer study; evidence mixed | not in digest | `redlight/idle-emissions.json` | 國際證據 or 台灣實測 as verified | NEW `idle-stop-mixed-evidence` **[research file]** | "we do not ask riders to switch off" |

### 9.8 The gap list

A new registry group, `gaps`, so that "nobody has measured this" is a citable entry with the searches behind it. One entry per gap in the digest: pedestrian exposure at a scooter red light (the central gap); idle emission rate of a Taiwanese scooter; pull-away spike; scooters queued per red light; odorants of scooter exhaust; harm from a few minutes beside idling scooters; any Taiwanese health study isolating scooter exhaust; child-height measurement in Taiwan; school-commute and pillion exposure; cleaner street air from electrification. Each entry holds: the statement in both languages, what would close it, who could measure it, the research file and date of the search.

### 9.9 Money

| Fact or dataset | Values | Digest item | Research file | Badge | Registry | Used in |
|---|---|---|---|---|---|---|
| Deadline | every 2026 subsidy needs purchase by 2026-12-31 at the latest; some end earlier; filing mostly to 2027-01-10 | Money | `econ/central.json`, city files | 台灣官方資料 | Exists per programme: `validTo`; confirm `filingDeadline` on each | 3.12, 4.3 states, V19 |
| 2027 | nothing confirmed; one draft (environment ministry pre-announcement of 2026-11-11 to extend its scrap-and-replace air subsidy to 2030); New Taipei and Taoyuan drafting | Money, plus r2 | `econ/outlook-2027-r2.json` | 台灣官方資料 | Exists: `econ-no-2027-programme`. UPDATE wording to "none confirmed" **[research file]** | 3.12, 4.3 |
| Gasoline reference | cheapest new 125cc about NT$50,500 with nothing to scrap, NT$45,600 scrapping | Money | `econ/gas-prices.json`, `gas-baseline-r2.json` | 市場公開價格 | Exists: `econ-gas-cheapest-125` (r2 questions the no-scrap figure; registry decides) | V18, V37 |
| Electric entry price | cheapest electric NT$59,980, green plate, 68 km/h; white-plate about NT$74,980 | Money | `econ/gogoro.json`, `gogoro-official-r2.json` | 市場公開價格 | Exists: `econ-ev-entry-prices` | 3.12 caveat, 4.3 |
| Central money | NT$7,000 or 5,100 by class; +3,000 Taiwan-made cells (unproven for some models); +1,000 scrap of a gasoline scooter 10 or more years old; one ministry payment NT$1,000–2,200 | Money | `econ/central.json` | 台灣官方資料 | Exists: `econ-central-subsidy-2026`, `econ-moenv-scrap-reward-2026`, `programmes/central.ts` | 4.3 |
| City programmes | Taipei amounts and add-ons; New Taipei, Taoyuan, Tainan, Taichung; Kaohsiung exhausted 2026-08-11; counties | Money | city files and `*-r2.json` | 台灣官方資料 | Exists: `programmes/*.ts`, `econ-taipei-max-subsidy`, `econ-taichung-subsidy-2026`, `econ-kaohsiung-budget-exhausted` | calculator, V41 |
| Scrap-age rule per programme | build date or age that qualifies, per city | not in digest | `econ/central.json`, city files | 台灣官方資料 | Confirm on every programme (the engine takes `scrap.builtOn`) **[research file]** | R12, near-miss result |
| Quota status | status and `checkedOn` per programme | Money | city files | 台灣官方資料 | Exists: `quota` with statuses; confirm dates | V41, banners, R10 |
| Petrol | NT$0.55–0.75/km for a modern 125cc; held down by a temporary NT$6–12/L measure | Money | `econ/running-costs.json`, `energy-prices-r2.json` | 市場公開價格 · 本站計算 | Exists: `econ-petrol-cost-per-km`, `econ-petrol-price-smoothing` | 4.3 monthly, V40 |
| Swapping | pay-per-use about NT$1/km plus a setup fee; subscriptions cost more than petrol at 300–500 km a month; contract length, setup fee, exit terms | Money | `econ/gogoro.json`, `gogoro-official-r2.json` | 市場公開價格 · 本站計算 | Exists: `econ-swap-vs-petrol-low-mileage`, `econ/energy.ts`, series `econ-monthly-energy-cost-by-mileage`; confirm plan terms | 3.12, V39, V40 |
| Home charging | NT$0.05–0.20/km; the no-fee model found (digest: a 25 km/h micro vehicle; r2: one 53 km/h model with a carry-upstairs battery) | Money, plus r2 | `econ/home-charge-evs-r2.json` | 市場公開價格 · 本站計算 | Exists: `econ-home-charging-cost-per-km`, `econ/vehicles.ts`. Digest and r2 differ (Appendix B, 7) | 4.3 `#no-socket`, V40 |
| Owner survey | electric owners about NT$10,500 a year, standard gasoline NT$8,400 | Money | `econ/running-costs.json` | 台灣官方資料 | Exists: `econ-motc-annual-spend`, series `econ-motc-spend-by-class` | 4.3, V39 |
| Fixed fees | NT$450 road fee; maintenance favours electric by a few thousand a year | Money | `econ/maintenance-fees.json` | 台灣官方資料 · 本站計算 | Exists: `econ-fixed-fees` | 4.3 |
| Supplier | about 87% of electric registrations; 2,700+ swap stations; lost US$80.8 million in 2025 | Money | `econ/gogoro.json`, `infrastructure.json` | 市場公開價格, 次級來源 | Exists: `econ-gogoro-network`, `econ-ev-brand-share-2026-07` | 4.3 `#risks` |
| Personas and every net price | computed for V18, V37, V39, V43 | | | 本站計算 | **[engine]**: never typed by hand | 3.12, 4.3 |

### 9.10 Chart datasets

| Visual | Dataset | Registry |
|---|---|---|
| V5 | motorcycle share of four pollutants | series `teds13-motorcycle-share` |
| V9 | traffic against general stations, 2017–2024 | series `taipei-traffic-vs-general-stations` |
| V13, V26b | PM2.5 by commute mode | series `commute-pm25-chuang2020` |
| V17 | electric share by year, with targets | series `ev-share-new-registrations`; `netzero-ev-sales-targets` |
| V20 | tunnel CO per km and per kg | NEW, from the extended tunnel fact |
| V21 | benzene and hydrocarbons 2013–2021 | NEW |
| V22 | phase and mileage multiples | series `tsai2018-older-phase-excess`; NEW for mileage and the case study |
| V23 | idle limits by build date | NEW |
| V24 | inspection per 100 | NEW (derived) |
| V25 | station correlation ranges | NEW |
| V26a, V26c | Wu 2021; Wang 2021 | series `rider-exposure-wu2021`, `commute-pm25-wang2021` |
| V27 | odour threshold ranges | NEW |
| V29 | stroller-height studies | NEW |
| V31 | scramble effect by day | series `iot-scramble-by-day` |
| V32 | quiet route | NEW |
| V39, V40 | monthly energy cost; cost per km | series `econ-monthly-energy-cost-by-mileage`; `econ/energy.ts` |
| V18, V37, V38 | waterfalls and break-even | calculator output |
| V41 | jurisdictions and quota status | `econ/jurisdictions.ts`, `programmes/*.ts` |

---

## Appendix A. How each must-fix item was resolved

### Air-quality scientist (binding)

| Must-fix | Resolution | Where |
|---|---|---|
| Decouple haze density from the countdown; retitle "the air fills" | One constant hatched band; no density prop varies by chapter; Link 3 is "the blank" | 3.0, R11, V1 |
| Drop `/90/` or build the gap and label into its frames | Kept and rebuilt: the empty chart is the longest beat; the label is in every frame | 4.7, V45 |
| Link 1 headline as a comparative; source scooter ultrafine emissions or label the stipple as traffic | 「粉塵很少，油氣很多」; stipple is street-wide, labelled as traffic, and stays in the electric frame | 3.3, 3.0 |
| Remove 「最需要在意的幾樣」; state once that CO is a marker | Removed; fact-only wording; the marker sentence is in Link 4 | R3, 3.6 |
| Draw emission shares on 0–100%; give per-km CO equal weight | `StackedBar` on 0–100%; V20 shows per-km first, same size, `/evidence/` only | V5, V20 |
| Stroller copy: "up to 44%, fine particles"; name the pollutant for 59%; remove "densest band" | R5; 59% named as PM2.5; 44% only on V29 with its label; mouths are ticks and no gradient is drawn | 3.8, V7, V29 |
| Date the schoolchildren study and say station data | R6; wording given | 4.2 |
| Green frame without a scooter surge, or marked in the frame | K4 has no surge and carries the tag in the frame; V14 has no curve | 3.0, 3.9, V14 |
| Green-plate caveat and quota status on the home money chapter | Both present; status line appears once a city is chosen | 3.12 |
| Traffic engineer to check the phase geometry | Geometry stated explicitly; confirmation required before V1 and V6 | 3.0, Appendix B |
| "The app shows the former" (AQI also carries CO) | Rewritten to what the Taipei study and the station gap support | 3.5, `app` page |
| Six-fact line 3 dropped "one Taipei commuter study" | Restored | 3.10 |
| Invented defaults on the red-lights-per-year tool | No presets; nothing shown until the reader enters numbers | V12 |
| (your-street) Q1 answer; friend sentence; Q6 join; idling wording; strip lines; purchase button under health; placeholder line; sticky bar; six-city chart | Answer rewritten; friend sentence has no causal clause; the join is a separate inference callout; R1; the seven lines are each true alone; R9; V8 has no marks; no sticky bar; six-city chart dropped | 4.2, Part 1, 3.2, V8 |
| (follow-the-fumes) breath-journey framing; PM2.5 as scooter result; "makes nobody ill"; "it is zero"; "direction: clear"; "doses"; nose strip; shape-only curve; card size by sample; odour reference line; "十幾倍" | Journey not used; no body illustration; R2 and the "mind the ruler" callout; Link 5 headline in gap form; pivot says "the scooters' share"; inference is direction-only; Link 6 is "places"; nose strip only in Link 4 with supportable cells; no curve; equal cards; ranges with no reference line; fleet-level multipliers only (R13) | 3.6–3.11, V10, V11, V27 |

### Parent

| Must-fix | Resolution | Where |
|---|---|---|
| A 30-second version on the first screen | 懶人包 directly under the hero, with chips; the play button follows in wave 2 | 3.2 |
| No coefficients, ppm ladders or biomarker names on the home page | Moved to `/evidence/` and question pages | 3.5, 3.7, V23, V25 |
| Cut the Link 2 regulation paragraph to one sentence | Done | 3.4 |
| Draw the seven-year-old above the stroller band; say what is known for a schoolchild | Done in the frame and the copy | 3.0, 3.8, `my-child` |
| Haze must not rise as if it were data | Constant hatch with the label inside it | 3.0 |
| Replace the quiz framing | 「看我們怎麼接」 | 3.10 |
| A New Taipei or "with a scooter to scrap" example | Default persona; parent action no longer Taipei-only | 3.12, Part 6 |
| Rename the gap badge | 「沒人量過」 | Part 2 |
| (your-street) remove sticky bar and per-card calculator button; fix strip line; give the home a spine; fix "up front" | Done; the spine is the red light; the gap is on the second screen and in the nav | 3.2, R9 |
| (follow-the-fumes) bring child and rider forward; no body sequence; do not dismiss street-design measures; one lead visual; nose strip once | Child and rider in K0 and K1 and the prologue; time ladder only; set-backs and measurement are legitimate asks; one lead visual per chapter | 3.1, 3.11, Part 6 |
| Pillion children | One careful line, as a gap | 3.8 |

### Rider

| Must-fix | Resolution | Where |
|---|---|---|
| Rider as a person in the first frame; "we are both" early | K1 rider with a face; the line is in the prologue; Link 6 puts the rider first | 3.0, 3.1, 3.8 |
| No LED day counter as the money headline; city status once the city is known | Dates as text; status line; day count only in a verdict A panel | 3.12, 4.3, R10 |
| Cut 「原因只有一個：錢」 | Cut; the hand-off is "what does it cost?" | 3.11 |
| A second button for people not buying; a full "not this year" section | 「我現在不打算換車」 at equal size; `#not-yet` and `/act/#keep` | 3.12, 4.3, 4.6 |
| Apartment charging truth and an ask | `#no-socket`; ask 6 | 4.3, Part 6 |
| Say 出廠滿 10 年, take the build date, answer the near-miss | R12; calculator input; special result | 4.3 |
| NT$ a month at the reader's distance with plan arithmetic | V39 and the monthly section | 4.3 |
| Do not make the purchase the only remedy; no inflated multiplier | Link 7 says what government and non-switchers can do; R13 | 3.11 |
| Worst case first; no Taipei bait; drop the resale claim; real rider actions on health cards | 打不平 first; engine personas; resale claim dropped; non-purchase actions in every chapter | 3.12, 4.3 |
| Urgency only for verdict A | R10 | 4.3 |

### Campaign director

| Must-fix | Resolution | Where |
|---|---|---|
| Remove the accumulation ramp; say so in the disclosure | Done | 3.0, 3.1 |
| Rebuild the film around the gap | Done | 4.7 |
| A finale that works on both sides of the date; design state C first | No pre-deadline counter (decision in section 0); state C counter of days without a programme; C built first | 3.12, 4.3, V19 |
| Five or six keyframes, two cameras; test sticky in LINE | Six frames, two cameras; nothing pinned on phones | 3.0 |
| Per-km ratio first | V20, on `/evidence/` | V20 |
| No default on the red-lights tool | Done | V12 |
| 50 cm headline as what the rule permits; verify geometry | Done; flagged | 3.4, Appendix B |
| Say the health evidence is traffic-mix or all-source; lead Link 5 with HEI | Done | 3.7 |
| An action in each chapter | Done (the green beat hands straight on) | 3.3–3.11 |
| (follow-the-fumes) no "only" claims; no Gogoro example; money earlier | "The one link you can act on" is not claimed as the only remedy; brand-neutral engine personas; money reachable from the second screen | 3.11, 3.12, 3.2 |
| (your-street) use it as the distribution layer; state C button; honest charging ask | Question pages and share cards; state C primary action is the ask to government; charging ask paired with the `#no-socket` truth | 4.2, 4.3 |
| Name the agency per ask; disclose funding; quota dates; say whether the campaign will commission the measurement | Proposed agencies in Part 6; the rest in Appendix B | Part 6, Appendix B |

---

## Appendix B. For the site owner to confirm

1. **Funding and independence.** `/about/` needs the real statement of who made and paid for the site, and any relationship with a scooter maker or battery network, or none.
2. **Will the campaign commission the red-light measurement itself?** The site promises to publish any result, including a null one. Saying whether the campaign will pay for a measurement makes the promise stronger.
3. **Two-wave launch.** Wave 1 before 31 December without the film and without a pinned scene; wave 2 in January. Confirm, or accept a later single launch that opens in state C.
4. **Badges.** Eight reader-facing badges, the gap badge renamed 「沒人量過」, and 台灣 (not 臺灣) in reader-facing copy.
5. **Existing copy to replace**, listed in 4.10, including the site description that states the unmeasured link as fact.
6. **The government intersection report.** The digest treats its outline as checked; `research/redlight/intersection-peaks.json` could not re-open it. V31 and any "ten intersections" statement wait until it is re-opened.
7. **Where round-two economics differs from the digest.** (a) Home charging: the digest says the only no-fee model is a 25 km/h micro vehicle; `home-charge-evs-r2.json` verified one 53 km/h model. (b) 2027: `outlook-2027-r2.json` found a draft extension of one small scrap payment; the site therefore says "nothing confirmed", not "nothing announced". (c) Taichung's 2026 plan is now verified. (d) Whether both environment-ministry payments can be claimed. (e) The no-scrap gasoline reference price. The registry should adopt the checked round-two values, and the copy follows the registry.
8. **Crossing geometry.** A traffic engineer should confirm the reading in 3.0: which pack shares the child's red, and that the turn box's rear edge faces the crosswalk that people walk during that red.
9. **Agencies named in the six asks.** The assignments in Part 6 are proposals; two are marked as unconfirmed.
10. **Items used from research files that are not in the digest**, each marked **[research file]**: exercise lowering risk at every pollution level; the pedestrian act and air-quality zone powers; the mixed idle-stop evidence behind "we do not ask riders to switch off"; the ten-year scrap rule per programme; the single idle particle datum; the Mainz child-height study. Each needs a registry entry before it is published, or it is cut.
11. **The film.** Kept, rebuilt around the gap. The alternative is to drop it, as the scientist's first option allowed.
12. **Ninety seconds.** The site says it is a storytelling length, not a statistic. No verified source gives a typical red time.
13. **The poster's second line** (「停著等孩子的時候，請熄火。這是請求，不是量過的效果。」). It can be cut if the owner prefers the poster to carry the measurement request alone.
14. **No deadline counter before 31 December.** The campaign director wanted one; the rider and scientist did not. This blueprint has none. Confirm.
