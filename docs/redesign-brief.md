# 行人呼吸 / ScooterAir — the build brief

Written 2026-11-26 by the design lead. This is the one document implementers follow. It replaces `docs/editorial-blueprint.md` and the three proposals. Where this brief and a proposal disagree, this brief wins.

Repository: `/home/user/scooterair` (Astro + TypeScript). Live site: `https://likelylabs.com/scooterair/`, English at `/en/`.

**Read these two files before anything else.** They are the source of truth for every air number on the site:

- `/home/user/scooterair/research/estimate/METHOD.md` (signed 2026-11-26)
- `/home/user/scooterair/research/estimate/results.json`

**The estimate is finished.** Earlier instructions said its numbers were not ready. They are, and they are modest. That fact shapes this brief more than any proposal did:

| What the science team publishes | What it does not publish |
|---|---|
| Carbon monoxide, benzene and PM2.5 that a pack of idling scooters **adds** to the air the street already holds | Any ultrafine-particle number |
| For an adult nose at 1.5 m, as a 90-second average | Any number for child or pushchair height |
| For three pack sizes: 2–5, 8–20 and 25–45 scooters beside you | Any curve of how the level changes during the red |
| As a range, to one significant figure | Any multiple of background as a headline; any "step back N metres" claim |

Beside a dozen scooters the pack adds about 0.05 to 1 ppm of carbon monoxide. The street already holds about 0.5 ppm. Everything is far below the WHO 15-minute guideline (about 87 ppm). So the page cannot rest on a frightening number. It rests on what is true and visible: the smell, how close and how low the tailpipes are, who stands there, that it happens every day, and that an electric scooter has no tailpipe.

Reference pictures (open them; do not copy their numbers):

| What | Path |
|---|---|
| Base design, seven screens | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/redesign/proposal-picture-first/mock/contact-sheet.png` |
| Body picture, zoom-out strip, recipe sheet | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/redesign/proposal-one-walk/contact-sheet.png` |
| "How we know" sheet layout | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/redesign/proposal-one-number/07-sheet.png` |
| Money screen with one personal figure | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/redesign/proposal-one-number/06-money.png` |
| Film prototype (working) | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/redesign/film/index.html` |
| Film port instructions | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/redesign/film/INTEGRATION.md` |
| Inventory of every "nobody measured" string | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/redesign/inventory/inventory.json` |
| Reviewers' findings on the current pages | `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/findings/*.json` |

---

## 1. Direction

1. The home page becomes a picture book of one red light: 14 phone screens, each one picture, one headline, at most two sentences. Today it is about 45 screens and 85% text.
2. The exhaust is drawn as an amount: ordinary street air everywhere, more beside the pack, darkest at the tailpipes. How much more where the people stand follows the signed estimate.
3. "Nobody has measured this" stops being the message. Each estimated number carries a small 推估 chip, a range and a tap-through. Measured values from Taiwan's transport research institute sit beside it.
4. Health is said plainly and inside the evidence: long-term studies link traffic exhaust to asthma, heart disease and lung cancer; one red light has not been shown to make anyone ill; it happens every day.
5. The page ends in money: the reader's own after-subsidy price, the monthly running cost, then a calculator that opens on a finished result.

**The sentence a reader should be able to repeat:**

> 等紅燈的時候，旁邊機車的排氣管，離小孩只有一兩步、不到一公尺高；換一輛電動的，就少一根排氣管。
>
> At a red light, the tailpipes of the scooters beside you are a step or two from a child and less than a metre off the ground. Every electric scooter is one tailpipe fewer.

**The test for every screen:** cover the words. If a ten-year-old looking only at the picture cannot say what the screen is about, redraw the picture. Do not lengthen the caption.

**Which proposal this is.** The base is "picture first" (chosen by two of three judges). Grafted in: from "one walk", the background air in every drawing, the row labels that name place and time, the zoom-out strip, the calm body picture, the rider screen, the swap slider and the "not switching yet" screen; from "one number", the sheet layout, the next-question button, the personal money figure and headline rules fixed in advance. Not taken: named characters (阿嬤 and 小安). The drawn people stay generic (阿嬤, 小學生, 嬰兒車, 騎士), so nothing on an evidence site is invented.

---

## 2. Site map

All routes exist in both languages (`/…` and `/en/…`).

| Route | Decision | What it becomes |
|---|---|---|
| `/` | Rebuilt | 14 screens (section 3). |
| `/90/` | Stays, rebuilt | The animated film (section 8). Menu name 短片 / Film. The URL stays because it has been shared. |
| `/questions/` | Shrinks | A grid of seven picture cards. No prose index. |
| `/questions/smell/`, `/my-child/`, `/app/`, `/one-red-light/`, `/rider/`, `/beside-me/` | Stay, shrink | One picture, a one-sentence answer, a sheet, at most two more pictures. URLs and share cards keep working. |
| `/questions/mask/` | **New** | 口罩擋得住廢氣嗎？ Built from `research/masks/VERIFIED.json`. |
| `/questions/how-much/` | **Redirect → `/estimate/`** | The estimate answers it. |
| `/questions/electric/` | **Redirect → `/electric/`** | One cost story, not two. |
| `/unmeasured/` | **Redirect → `/estimate/`** | Hash `#ask` must land on `/estimate/#measure`. |
| `/estimate/` | **New** | 怎麼算的 / How we worked it out (section 7). |
| `/evidence/` | Stays, shrinks | The adults' page. Anchors `#link-1` … `#link-7` are kept. |
| `/sources/` | Stays, leaves the main menu | Reference list only. |
| `/act/` | Stays, shrinks | Five cards by who you are. |
| `/about/` | Stays, shorter | Who made it, the labels, corrections. |
| `/electric/` | Stays | Opens on a worked result, never empty. |
| `/print/poster/`, `/print/brief/` | Redrawn | Section 7. |
| `/problem/` | Stays as the existing redirect to `/questions/`. | |
| `/styleguide/`, `/styleguide-art/` | **Out of the production build** | `getStaticPaths` returns nothing when `import.meta.env.PROD`. They stay for `astro dev`. |

**Redirects.** The host is static, so a redirect is a page built with `src/layouts/Redirect.astro` (meta refresh, canonical link, visible link). Change that layout once: add a three-line inline script that appends `location.hash` to the target, with an optional map (`#ask` → `#measure`). `/estimate/` also carries an empty `id="ask"` anchor at the measure section as a safety net. Redirect pages are `noindex` and left out of the sitemap (extend the filter in `astro.config.mjs`).

**Main menu, five items:** 短片 · 問題 · 怎麼算的 · 換電動 · 行動 (Film · Questions · How we worked it out · Go electric · What I can do). The wordmark is the home link. Footer: 證據 · 資料來源 · 關於 · 修改紀錄. The menu item 沒人量過 is deleted.

---

## 3. The home page

### 3.1 The frame every screen shares

Design size 360×740 CSS px. Each screen is an `<article>` with its own `<h2>`.

| Part | Spec |
|---|---|
| Header, 48 px | 行人呼吸 · 字大 · EN · menu. |
| Rail, 32 px, sticky | A signal lamp dot, the chapter name, `n / 14` and a thin progress bar. Red for screens 1–11, green for 12–14. **No seconds.** It marks the place in the story; it is not a timer. Example: `● 紅燈｜排出什麼　2 / 14`. |
| Picture | 320–360 px tall (at least 45% of the viewport). One SVG per scene; no hidden second copy for another width. Words in a picture are HTML laid over the SVG, never SVG `<text>`, and never under 14 px. |
| Headline | 27 px, weight 900, at most two lines, at most 22 Chinese characters. Break only between phrases (use `ui/Phrased.astro` and `text-wrap: balance`). |
| Body | 18 px, at most two sentences, at most 45 Chinese characters in total. |
| Quiet line | Optional, one, 15 px, at most 30 characters. Caveats live here, never in a box. |
| Foot, row 1 | The label chip(s) for the screen's number, and the button **怎麼知道的？ / How do we know?** (48 px tall). It opens the sheet (section 4.5). |
| Foot, row 2 | A full-width **next button** (48 px) whose text is the question the next screen answers. It scrolls to the next screen. This is how the reader is led along the chain, and how an older reader avoids fine scrolling. |

Scrolling is ordinary scrolling. No pinning, no scroll-jacking, no snap. A screen may be up to 850 px tall at standard text size. On screens 900 px wide or more, each screen is a two-column row (picture left, at most 560 px; text right) inside a 1,040 px column.

Pictures animate once when they arrive (under 4 seconds), then rest. Section 5.3 lists what moves.

### 3.2 The screens

For each screen: the chain link it serves (numbering as in `src/data/types.ts` → `chainLinkLabels`), the picture (G-numbers are specified in section 5), final copy, the number with its label, and its slots. Slot names are defined in section 3.3. `Q` is the quiet line.

---

**Screen 1 · 紅燈亮了** — opening

- **Picture G1.** The street at a red light. Sixteen scooters, three rows deep, twelve in the stop box and four in the turn box. An older woman, a parent with a pushchair and a child in a yellow school cap wait at the kerb, drawn in front of the haze so each is recognisable. One front-row rider has a face and the label 他也在等. The signal shows `90`. A chip counts `機車 16 輛` as they stop.
- **Headline.** 那個味道，你也聞過 / You know that smell
- **Body.** 紅燈 90 秒，一整排機車停在旁邊，引擎沒熄火。騎車的、走路的，都在同一個路口呼吸。 / Ninety seconds at a red light. A whole row of scooters beside you, engines running. Riders and walkers breathe at the same junction.
- **Number.** 90 秒 — 官方 (`signal.pedWait`). 16 輛 — 推估 (`scn.dozen.drawn`, inside the range `scn.dozen.count`).
- **In the sheet:** 90 秒是常見的紅燈長度；運研所量的路口，行人大約要等 85 到 115 秒。圖上畫 16 輛，是「十來輛」（8 到 20 輛）的情境。
- **Buttons.** ▶ 看短片（約 2 分鐘） / Watch the film (about 2 minutes). The length is read from the film timeline, never typed. Next: 這些機車排出什麼？↓ / What comes out of them? ↓

**Screen 2 · 排出什麼** — link 1 (and 4)

- **Picture G2.** One scooter, large, side view. Three kinds of mark leave the tailpipe, each named once in the picture: 〰 聞得到：油氣（沒燒完的汽油） · ○ 聞不到：一氧化碳 · ∙ 看不到：微粒. A drawn drinks can sits beside the number chip.
- **Headline.** 臭的是油氣和醛類。一氧化碳聞不到，微粒看不到 / The smell is fuel vapour and sharp aldehydes. Carbon monoxide has no smell. Particles are too small to see (the site never says particles cannot be smelled: /about/ corrections, ufp-smell)
- **Body.** 味道只告訴你一件事：你正站在廢氣裡。油氣裡有苯（ㄅㄣˇ），是確定會致癌的東西。 / The smell tells you one thing: you are standing in exhaust. The vapour carries benzene, a proven cause of cancer.
- **Q.** 世界衛生組織說，苯找不到安全的量。 / The WHO says no safe level of benzene can be recommended. (Ships only while the registry fact `who-benzene-no-safe-level` is marked verified against the WHO text. Otherwise the line is left out.)
- **Number chip in the picture.** 一輛機車等一個紅燈，排出的一氧化碳大約裝滿一個鋁罐（半罐到快兩罐） 推估 / Through one red light, one scooter gives off enough carbon monoxide to fill about one drinks can (half a can to nearly two). Estimate. Slots `emit.co.perRed_can`, `emit.co.perRed_g`.
- **Next.** 排出來以後，去哪裡？↓ / Where does it go? ↓

**Screen 3 · 排在哪裡** — link 2

- **Picture G3.** The junction from above: stop line, turn box, zebra crossing, kerb. Scooters in the turn box with their tails toward the people waiting. A dimension line across the gap: `50 公分以上`. A small side-view inset: a tailpipe under a dashed one-metre line.
- **Headline.** 待轉區的排氣管，就在斑馬線前面 / In the turn box, the tailpipes sit right in front of the crossing
- **Body.** 排氣管離地大約 50 公分，廢氣就排在腳邊。待轉區和斑馬線之間，規定只要留 50 公分以上。 / A tailpipe is about 50 cm off the ground, so the exhaust comes out by your feet. The rules ask for at least 50 cm between the turn box and the crossing.
- **Number.** 50 公分以上 — 官方 (`marking-rules-turn-box`). 排氣管約 50 公分 — 官方 (`iot-exhaust-height-assumption`).
- **In the sheet, one plain line on idling:** 怠速規定是停車等候超過三分鐘才要熄火，一般的紅燈比這短。 Never 違規, never 合法.
- **Next.** 站在旁邊的人，吸進多少？↓ / How much does the person beside them breathe? ↓

**Screen 4 · 吸進多少** — link 3. The centre of the page.

- **Picture G4.** The kerb, close. Pushchair, child and adult at the left; the nearest scooter's tail at the right with its rider in view; rows behind. The fume from the tailpipes reaches the people; where they stand it is as thick as the estimate says (5.1). The tailpipes have dark puffs. The street's own air is not drawn. One label: 機車排的氣.
- **Number box above the picture (HTML):**

  | | | |
  |---|---|---|
  | 一氧化碳 Carbon monoxide | | |
  | 街上原本就有 Already in the street | 約 0.5 ppm | 實測 |
  | 這排機車多出來 Added by these scooters | 約 0.05 到 1 ppm | 推估 |

  Under it, 14 px: `ppm＝一百萬份空氣裡有幾份` / ppm = parts in a million parts of air. Slots `bg.co.traffic`, `co.<scenario>.add`.
- **Switch under the picture.** 旁邊停了幾輛？ **幾輛** 2–5 ｜ **十來輛** 8–20 ｜ **停滿** 25–45 / How many beside you? A few · A dozen or so · Full box. Default 十來輛. It redraws the picture and the 推估 row together.
- **Headline.** 一排機車停在旁邊，路邊多一層廢氣 / A row of scooters beside you adds a layer of exhaust at the kerb
- **Body.** 這是算的，不是量的，所以給一個範圍。多出來的量，和街上原本就有的差不多。 / This is worked out, not measured, so we give a range. What the scooters add is about as much as the street already holds.
  The second sentence is chosen by rule from `co.<scenario>.add.mid ÷ bg.co.traffic`: under 0.3 → 比街上原本就有的少 / is less than the street already holds; 0.3 to 3 → 和街上原本就有的差不多; over 3 → 比街上原本就有的多 / is more than the street already holds. With the signed values: 幾輛 → 少; 十來輛 and 停滿 → 差不多.
- **Q.** 機車越多，路邊的廢氣越濃。街上原本就有的空氣，圖上沒有畫。 / More scooters, thicker exhaust at the kerb. The air the street already holds is not drawn.
- **Next.** 實際量到的，算多嗎？↓ / And the real readings: is that a lot? ↓

**Screen 5 · 量到的，和算的** — link 3

- **Chart G5.** One axis in ppm, linear from 0 to 2. Three rows, each named for where and when it applies:

  | Mark | Row label | Second line | Value | Label |
  |---|---|---|---|---|
  | ● solid dot | 平常的路邊 | 交通測站，2025 年平均 | 0.5 | 實測 |
  | ● three dots | 路口等過馬路的地方 | 運研所，3 個路口，最高的一分鐘 | 0.5 · 0.6 · 1.3 | 實測 |
  | ▨ hatched band | 紅燈時，十來輛機車旁邊 | 90 秒平均，含街上原本就有的 | 約 0.3 到 1.6 | 推估 |

  English row labels: An ordinary roadside (traffic stations, 2025 average) · Where pedestrians wait to cross (Institute of Transportation, 3 junctions, highest minute) · Beside a dozen scooters at a red light (90-second average, including what the street already holds).
  Under the chart, the **zoom-out strip**: a long bar with a small block at its left end labelled 上面整張圖，在這一小段 / The whole chart above fits in this small piece, and a tick at the far right: 世界衛生組織 15 分鐘指引值：約 87 ppm 官方 / WHO 15-minute guideline: about 87 ppm.
  The chart is fixed to the dozen scenario. It has no pollutant tabs and no scenario switch. The full table is on `/estimate/`.
- **Headline, chosen by rule** (amended 2026-11-27: the owner asked "far below the guideline? isn't that a good thing", and the old headline answered a question only the authors care about). It answers screen 4's 實際量到的，算多嗎？ and is chosen by `farBelowWho()` (the highest value drawn on the chart under a quarter of `who.co15min_ppm`). The WHO value is always called 指引值 / guideline, never 上限 / limit. The headline states two facts side by side and ranks nothing (no 更, 真正, 反而, "what matters more"):
  - far below → 一氧化碳比指引值低很多，是好消息，但廢氣不只有它 / Carbon monoxide is far below the WHO guideline. Good news, but exhaust holds more than that **(this is the case today)**
  - otherwise → 路口的一氧化碳，量過也算過 / Carbon monoxide at the crossing: measured and worked out
- **Body, one idea per line** (`checkSentence()`, then `estimateText.belowIsNotSafe`, then `estimateText.coMarksBenzene`; all scanned by check-copy):
  - The relation, chosen by rule (compare the estimate's total range `co.dozen.total.lo`–`.hi` with the lowest and highest measured peak `meas.iot.co.peaks`): overlap → 量到的和算的差不多。/ Readings roughly match our estimate. **(today)** · estimate entirely higher → 我們算的比量到的高。/ Our estimate is above the readings. · entirely lower → 我們算的比量到的低。/ Our estimate is below the readings.
  - Only while `farBelowWho()`: 低於指引值，不代表廢氣就安全。/ Below the guideline does not mean safe. (The one-page brief, the chart summaries and the roadside answer card use the long form, `estimateText.whoCoOnly`: 這個指引值只看一氧化碳，低於它不代表廢氣就安全。/ That guideline is for carbon monoxide only. It does not mean exhaust is safe.)
  - The link from the chart to benzene, in body type: 一氧化碳多的地方，苯也多。/ Benzene goes up with carbon monoxide. (The short form of the rule below: do not widen it to "all pollutants"; PM2.5 barely changes.)
  - The chart's WHO bar carries one more label: 只看一氧化碳 / Carbon monoxide only, beside its 官方 chip.
- **Q.** Only while `who-benzene-no-safe-level` is verified: 世界衛生組織說，苯找不到安全的量。/ The WHO names no safe level of benzene. (Release 2 review: 「越少越好 / Less is better」 was dropped; the registry fact does not say it.) (A callback to screen 2's quiet line, in the registry's strength; no amount at the kerb, no risk of one red light.)
- **Next.** 天天吸進去的，會跑到哪裡？↓ / Day after day, where does it all go? ↓

**Screen 6 · 吸進去以後** — links 4 and 5

- **Picture G6.** A neutral adult figure, head and chest, in the signal-figure style. Airway, lungs and heart are cut out. The fume of screen 2 goes in once and stays where it stops: orange wisps at the nose and throat ①, a sooty haze in the lungs ②, a faint haze on into the blood ③. Each number has its short name printed beside it (鼻子、喉嚨 / 肺 / 血液), so the picture reads without a tap. Tag: 示意圖・不是醫學圖. **Not a child. No street behind it. No disease names on the body.** Nothing changes after it has arrived.
- **Headline.** 長年吸車子的廢氣，和氣喘、心臟病、肺癌有關 / Years of breathing traffic exhaust are linked to asthma, heart disease and lung cancer
- **Body.** 這是 353 篇長期研究的結論，講的是所有車輛的廢氣，不只機車。圖上是廢氣進到身體以後去的地方。 / That is the finding of a review of 353 long-term studies of exhaust from all traffic, not scooters alone. The picture shows where exhaust goes once it is inside the body.
- **Q.** 等一個紅燈就會生病嗎？沒有人證明過。 / Does one red light make you ill? Nobody has shown that.
- **Pins (tap; one sentence each; a list under the picture without JavaScript).**
  ① 鼻子、喉嚨：聞得到的油氣，會刺激鼻子和喉嚨。 / Nose and throat: the vapour you can smell irritates them.
  ② 肺：很小的微粒，可以進到肺的深處。 / Lungs: very small particles reach deep into the lungs.
  ③ 血液：一氧化碳從肺進到血液，占掉載氧氣的位子。 / Blood: carbon monoxide passes from the lungs into the blood and takes up room meant for oxygen.
  **Each pin ships only when a verified registry fact from a primary source backs it** (new facts `route-irritant-vapour`, `route-particles-deep-lung`, `route-co-blood`). A pin without its fact is left out; the picture still works with two or one.
- **Label.** 研究（長期・所有車輛） / Studies (long-term, all traffic). Fact `hei-sr23-trap-associations`.
- **In the sheet, the exact finding:** 新得氣喘的比較多；因為心臟病、肺癌過世的也比較多。這是「有關」，研究沒有判定因果。 The headline says 有關 and names the diseases; the sheet carries the precise wording (onset of asthma; death from ischaemic heart disease and lung cancer) and the fact's caveat.
- **Next.** 一個紅燈那麼短，也算嗎？↓ / One red light is so short. Does it count? ↓

**Screen 7 · 天天等** — link 5

- **Picture G7.** A road with three signposts, each a small drawing, a few words and a label:

  | Signpost | Words | Label |
  |---|---|---|
  | 5 分鐘 | 心跳的節奏小小變了一下（高雄，55 人） | 研究・台灣 |
  | 1 到 2 小時 | 氣喘的人，肺功能小幅下降（倫敦） | 研究・國外 |
  | 很多年 | 氣喘、心臟病、肺癌比較多（353 篇研究） | 研究・國際 |

  Under it a year strip: one small dot per day flowing into a bar measured in hours. A stepper, already filled in: 一天等幾個紅燈？ 2 · **4** · 6.
- **Headline.** 一個紅燈很短，可是天天都要等 / One red light is short. But you wait at one every day
- **Body, by stepper** (`time.hoursPerYear`):
  - 2 → 一天等兩個紅燈，一年就在路邊站了半天到快一天。 / Two red lights a day add up to half a day to nearly a day a year at the kerb. (12–18 hours)
  - 4 → 一天等四個紅燈，一年就在路邊站了一整天到一天半。 / Four red lights a day: one to one and a half whole days at the kerb each year. (24–36 hours)
  - 6 → 一天等六個紅燈，一年就在路邊站了一天半到兩天多。 / Six a day add up to a day and a half to more than two days. (36–55 hours)
- **Q.** 這些研究量的是各種來源的髒空氣，不是只有機車。 / These studies measured dirty air from all sources, not scooters alone.
- **Number.** 約 24 到 36 小時 — 本站計算 (60 to 90 seconds a red × reds a day × 365).
- **In the sheet:** each study's place, people and limit (the Kaohsiung peaks came mostly from factories, mosquito coils, burning and incense; the change is a small, temporary signal, not an illness). Then the dose arithmetic from METHOD §9: 一天四個紅燈，讓你一整天吸到的一氧化碳多不到 1%。整天在路邊工作的人（交通警察、攤販、導護）就不一樣，一個紅燈接一個紅燈，加起來就像一直待在路邊。
- **The five-minute study is never a headline or a big number.**
- **Next.** 同一個路口，誰離得最近？↓ / At the same junction, who is closest? ↓

**Screen 8 · 誰最近** — link 6

- **Picture G8.** A ruler in centimetres. Four figures to scale on one ground line: a baby in a pushchair (band 55–85 cm shaded), a schoolchild, an adult, and a rider seated on a scooter, **drawn whole**. The tailpipe is labelled. The fume from it is drawn evenly from the ground to above the adult's head, with one label 機車排的氣. No bands by height.
- **Headline.** 同一個路口，小孩離排氣管最近 / Same junction: the child is closest to the tailpipe
- **Body.** 排氣管和嬰兒車裡的寶寶，都不到一公尺高。照體重算，小孩吸進的空氣是大人的 1.5 到 2 倍。 / The tailpipe and a baby in a pushchair are both less than a metre off the ground. For their body weight, children breathe 1.5 to 2 times as much air as adults.
- **Q.** 矮的地方，廢氣一樣多或更多；多多少，還算不出來。 / Lower down, the exhaust is the same or more. How much more cannot yet be worked out.
- **Number.** 1.5 到 2 倍 — 研究・國際 (`child.airPerKg`). It is a breathing-rate fact, not an estimate. **Do not print 1.7–2.2 anywhere.**
- **Next.** 那騎車的人呢？↓ / And the rider? ↓

**Screen 9 · 騎士也在裡面** — link 6

- **Picture G9.** A second-row rider, visor up, face drawn, with the tailpipe of the scooter in front pointing at him. Label 他也在等. No chart in this picture.
- **Headline.** 騎車的人，也在這一團裡 / The rider is in the cloud too
- **Body.** 排在後面的騎士，前面就是別人的排氣管。這不是誰的錯，大家都泡在同一團廢氣裡。 / A rider in the second row sits right behind someone else's tailpipe. This is nobody's fault: everyone at the junction is in the same cloud.
- **Q.** 台北量過：騎機車和走路的人，吸到的 PM2.5 平均都比搭捷運的多。 / Measured in Taipei: people on scooters and people on foot both breathed more PM2.5, on average, than people on the metro. 實測 (`commute-scooter-vs-subway-chuang2020`).
- **In the sheet:** the five figures, "各種來源", one morning hour, and that scooter and walking did not differ significantly. **Never write that riders breathe "the most".**
- **Next.** 這一團，可以變小嗎？↓ / Can the cloud be made smaller? ↓

**Screen 10 · 換掉** — link 7

- **Picture G10.** The kerb with ten scooters in view. A slider: 10 輛裡，換幾輛電動機車？ / Out of 10, how many go electric? It has ten stops and plus and minus buttons. On arrival it plays once from 0 to 10 and **rests on all-electric**. Each swapped scooter loses its tailpipe and its fume; its wheels stay plain (no coloured hub ring). The first one is named in words, 電動機車, with a thin line. A petrol scooter's wisps are hidden while the scooter behind it is electric, so no electric scooter seems to give off fume. One car with its own small puff stays.
- **Chip under the slider.** 機車排的廢氣：少 {n × 10}% 本站計算｜假設每輛排得一樣多 / Scooter exhaust: {n × 10}% less. Our arithmetic, assuming every scooter emits the same.
- **Headline.** 換一輛電動的，就少一根排氣管 / Every electric scooter is one tailpipe fewer
- **Body.** 電動機車沒有排氣管。輪胎和煞車的粉塵還在，旁邊的汽車也還在。 / An electric scooter has no tailpipe. Tyre and brake dust stay, and so do the cars beside it.
- **In the sheet, not on the picture:** the national model (`liou-wu-2021`), labelled 研究・台灣模式, with its caveat.
- **Next.** 還沒要換車呢？↓ / Not switching yet? ↓

**Screen 11 · 還沒要換車** — link 7

- **Picture G11.** Ten small scooters in a row. Nine have a small puff of fume. One has a cloud whose area is about a third of all the fume drawn. No rider on that one. A button 修好它 / Fix it shrinks the cloud.
- **Headline.** 還沒要換車？有一件事也很有用 / Not switching yet? One thing still helps a lot
- **Body.** 定檢讀數裡，排最多的一成，占了全部一氧化碳的三分之一左右。準時定檢、該修就修，路口就少一大團。 / In Taiwan's inspection readings, the highest tenth account for about a third of all the carbon monoxide. Get inspected on time and fix what fails, and a big cloud leaves the junction.
- **Number.** 約 30% 到 45% — 本站計算 on 官方 data (`inspect.top10share`).
- **Next.** 換一輛，要多少錢？↓ / What does one cost? ↓ (The rail turns green from here.)

**Screen 12 · 買的那天** — money

- **Controls first, already filled in and remembered:** 縣市 (a select; default 新北市) and 有滿 10 年的舊車可以報廢 (a switch; default on).
- **Big figure.** 少付 **10,388** 元 in green, or 多付 **N** 元 in ochre. Chip: 本站計算｜價格和補助 {date} 查. Slots `money.buy[county][scrap]`.
- **Picture G12.** Two bars to one scale: 125cc 燃油機車・實付, and 電動機車（綠牌）・實付 with the subsidy drawn as a dashed extension out to the list price. One bracket carries the difference.
- **Headline, chosen by rule from the difference:**
  - electric at least 1,000 元 cheaper → 報廢舊車換電動，比買新的燃油機車便宜 / Scrap the old one for an electric and you pay less than for a new petrol scooter (without a scrapped scooter: 補助扣完，電動機車比較便宜 / After subsidies the electric scooter costs less)
  - within 1,000 元 → 補助扣完，兩種差不多錢 / After subsidies the two cost about the same
  - electric dearer → 這個條件下，電動機車還比較貴 / On these terms the electric scooter still costs more
- **Body (default case).** 這是最便宜的綠牌電動機車，和 125cc 不同級。沒有舊車、要買白牌，在高雄是多付 14,480 元。 / This is the cheapest green-plate electric scooter, a lighter class than a 125 cc. With nothing to scrap and a white-plate model, the Kaohsiung sum comes out NT$14,480 more.
  The second sentence always states the least favourable case in the table (`money.worst`), whatever the reader chose.
- **Deadline strip (date-driven, section 7.7).** 補助到 12 月 31 日。燃油機車的促銷到 11 月 30 日。 / Subsidies end 31 December. Petrol-scooter promotions end 30 November.
- **In the sheet:** each subsidy line with its condition; the "先確認" advice where the carbon reward and the air subsidy are stacked; the date checked.
- **Next.** 每個月呢？↓ / And each month? ↓

**Screen 13 · 每個月** — money

- **Picture G13.** A distance switch: 每月騎 150 · **300** · 500 · 800 公里. Then two thick bars: 加油（125cc） and 在家充電. Under a divider labelled 不能在家充電的話 / If you cannot charge at home, two thinner outlined bars: 換電・最便宜的月租 and 換電・用多少付多少. The picture's largest marks are petrol against home charging. Slots `money.month[km]`.
- **Headline, assembled from the slots.** 每個月：在家充電約 25 元，加油約 189 元 / Each month: about NT$25 charging at home, about NT$189 on petrol
- **Body.** 這是每月騎 300 公里的算法。只能換電池的人，月租 518 元起，比油錢貴，這一點照實講。 / This is for 300 km a month. If you can only swap batteries, plans start at NT$518, which is more than petrol. We say so plainly.
- **Line under the bars, chosen by rule** (`money.breakeven`):
  - electric already cheaper on the day → 買的時候就比較便宜，之後在家充電每個月再省約 {N} 元。 / Cheaper on the day you buy, then about NT${N} less each month if you charge at home.
  - electric dearer → 多付的 {N} 元，在家充電大約 {M} 個月回本。 / The extra NT${N} is paid back in about {M} months of home charging.
  - never paid back within ten years → 照這樣騎，十年內回不了本。 / At this distance it is not paid back within ten years.
- **Next (primary).** 算我自己的 → / Work out mine →

**Screen 14 · 下一個紅燈** — close

- **Picture G14.** The street of screen 1 with the pedestrian signal green. Electric scooters, no pack cloud; the street's own sparse air and one car's plume remain. The child steps onto the crossing.
- **Headline.** 下一個紅燈，可以少掉這一團 / The next red light could come without this cloud
- **Body.** 差別只在，旁邊那一排有沒有排氣管。選你的縣市，半分鐘算出換一輛要多少錢。 / The only difference is whether the row beside you has tailpipes. Pick your county and in half a minute you will know what a switch costs.
- **Controls.** **開始算 / Work it out** (primary) → `/electric/?county=…&scrap=…&km=…#result`, carrying what the reader chose on screens 12 and 13. Then four buttons, 2 × 2, each at least 150 × 56 px: ▶ 看短片 · 傳給家人（LINE） · 還不換車，可以做什麼 → `/act/` · 把推估換成實測 → `/estimate/#measure`.
- The last button is the only place on the home page where the measurement request appears.

### 3.3 Every slot, in one table

All values are read from code, never typed into copy. Air slots come from `src/data/estimate.ts`, which imports `research/estimate/results.json`. A check fails the build if they differ. Measured values come from the registry (`src/data/facts*.ts`). Money slots are computed at build time by the calculator engine. "Now" is today's value, for layout only.

| Slot | What it is | Unit | Now | Used on |
|---|---|---|---|---|
| `est.meta.version`, `est.meta.date` | Version and date of the estimate | — | v1, 2026-11-26 | Every estimate sheet, `/estimate/`, share cards |
| `scn.<few\|dozen\|full>.count.{lo,hi}` | Scooters beside you | 輛 | 2–5 · 8–20 · 25–45 | Screens 1, 4; film; `/estimate/` |
| `scn.<…>.drawn` | Scooters the picture draws | 輛 | 4 · 16 · 35 | G1, G4, film (dozen only) |
| `scn.<…>.nearest_m.{lo,hi}` | Distance to the nearest tailpipe | m | 2–4 · 0.7–3 · 0.3–1.5 | `/estimate/` |
| `co.<…>.add.{lo,mid,hi}` | Carbon monoxide the pack adds | ppm | 0.007 / 0.06 / 0.3 · 0.05 / 0.3 / 1 · 0.1 / 0.5 / 2 | Screen 4, film, `/estimate/`, cards |
| `co.dozen.total.{lo,mid,hi}` | Added plus what the street holds | ppm | 0.3 / 0.7 / 1.6 | Screen 5, `/estimate/` |
| `co.few.total`, `co.full.total` | Same, other scenarios. **The estimate owner must confirm these may be shown** (METHOD prints only the dozen). | ppm | 0.2 / 0.4 / 1.0 · 0.4 / 1.0 / 2.2 | `/estimate/` only |
| `benzene.<…>.add.{lo,mid,hi}` | Benzene the pack adds | ppb | 0.01 / 0.1 / 0.8 · 0.09 / 0.6 / 3 · 0.2 / 1 / 5 | `/estimate/`, `/evidence/` |
| `pm25.<…>.add.{lo,mid,hi}` | PM2.5 the pack adds | µg/m³ | 0.02 / 0.2 / 2 · 0.09 / 0.9 / 7 · 0.2 / 2 / 10 | `/estimate/`, screen 5 sheet |
| `bg.co.traffic`, `bg.co.general` | Yearly mean at traffic and general stations, 2025 | ppm | 0.54 (shown as 0.5), 0.24 | Screens 4, 5; film; `/estimate/` |
| `bg.pm25`, `bg.benzene.{lo,hi}` | What the street holds | µg/m³, ppb | 13; 0.5–4 | `/estimate/` |
| `confidence.<co\|benzene\|pm25>` | How far to trust each | word | 中 · 低 · 低 | Estimate sheets, `/estimate/` |
| `emit.co.gPerHour.{lo,mid,hi}` | One idling scooter's carbon monoxide | g/h | 8 / 15 / 27 | `/estimate/`, screen 2 sheet |
| `emit.co.perRed_g.{lo,mid,hi}` | Same, through one 90-second red (÷ 40) | g | 0.2 / 0.4 / 0.7 | Screen 2 sheet |
| `emit.co.perRed_can.{lo,mid,hi}` | Same as gas volume at 25 °C, in 330 mL cans | 罐 | 0.5 / 1 / 2 (0.18 / 0.34 / 0.59 L) | Screen 2 chip |
| `xcheck.iot.observed.{lo,hi}` | Rise seen at the one junction with a clear rise | ppm | 0.8–1.2 | Screen 5 sheet, `/estimate/#check` |
| `xcheck.iot.model.{lo,mid,hi}` | The model run at that sensor's position and wind | ppm | 0.4 / 0.8 / 1.8 | Same |
| `who.co15min_mg`, `who.co15min_ppm` | WHO 15-minute guideline | mg/m³, ppm | 100, about 87 | Screen 5, `/estimate/` |
| `meas.iot.sites` | Junctions the institute instrumented | 個 | 10 | Screen 5 |
| `meas.iot.co.peaks[]` | Highest waiting-area readings | ppm | 0.5, 0.62, 1.3 | Screen 5 |
| `meas.iot.pm25.{lo,hi}` | Waiting-area PM2.5 | µg/m³ | 4–14 | Screen 5 sheet, `/estimate/` |
| `meas.taipei.co.roadside` | Taipei roadside stations, 2024 mean | ppm | 0.80 | `/questions/app/`, `/estimate/` |
| `signal.pedWait.{lo,hi}` | How long pedestrians wait | 秒 | 85–115 | Screen 1 sheet |
| `time.hoursPerYear[2\|4\|6].{lo,hi}` | Hours a year at red lights | 小時 | 12–18 · 24–36 · 36–55 | Screen 7, film, `/questions/one-red-light/` |
| `dose.dayShare` | What four reds add to a day's carbon monoxide | % | under 1 | Screen 7 sheet |
| `child.airPerKg.{lo,hi}` | Child's air per kilogram against an adult's | 倍 | 1.5–2 | Screen 8, film, `/questions/my-child/` |
| `commute.pm25.*` | Scooter, walking, bus, car, metro | µg/m³ | 53.6 / 42.7 / 34.7 / 26.2 / 21.7 | Screen 9 sheet, `/questions/rider/` |
| `inspect.top10share.{lo,hi}` | Share of carbon monoxide in the highest tenth of readings | % | 30–45 | Screen 11 |
| `money.buy[county][scrap]` | Paid price of each, the difference, the subsidy lines, plate class, date | 元 | 新北・報廢: 36,312 against 46,700, 少付 10,388 | Screen 12, film, `/electric/` |
| `money.worst` | The least favourable case in that table | 元 | 高雄・沒有舊車・白牌: 多付 14,480 | Screen 12, film |
| `money.month[km]` | Home charging, petrol, cheapest swap plan, pay-as-you-go swap | 元/月 | at 300 km: 22–28 / 189 / 518 / 675 | Screen 13, film |
| `money.breakeven` | Months to pay back the difference, or "already cheaper" | 月 | 新北・報廢: already cheaper | Screen 13 |
| `money.deadline.subsidy`, `money.deadline.promo` | Dates that change the sums | date | 2026-12-31, 2026-11-30 | Screens 12, 13; film; `/electric/` |
| `film.duration` | Film length from the timeline | 秒 | about 115 | Screen 1, `/90/`, cards |

**If a slot is missing the build fails.** Nothing ever renders a dash, a blank box, 無資料, 待定 or a magenta marker. Three values are this brief's arithmetic on published figures and need the estimate owner's sign-off in `research/estimate/` before they ship: `co.few.total`, `co.full.total` and `emit.co.perRed_can`. Until then `/estimate/` shows totals for the dozen only, and the screen 2 chip prints grams instead of the can: 一輛機車等一個紅燈，約排出 0.2 到 0.7 公克一氧化碳 推估 (the published 8 to 27 g an hour, divided by the forty 90-second reds in an hour).

---

## 4. Rules for showing estimates and measurements

Written so that a component author and a copy editor can both apply them.

### 4.1 Five labels, five shapes

Every number a reader sees carries exactly one of these chips. They differ by word and shape as well as colour.

| Chip | Shape | Colour token | Meaning in plain words | English | Maps from registry `evidence` |
|---|---|---|---|---|---|
| **實測** | solid dot | ink | 有人拿儀器量到的。後面寫哪裡：台灣、國外。 | Measured | `measured-tw`; foreign instrument readings |
| **推估** | hatched dot, dashed outline | exhaust ochre | 我們算出來的。一定附範圍和算法。 | Estimate | new kind `estimate` |
| **官方** | solid square | ink | 法規、標準，或政府的統計。 | Official | `official-tw`; WHO guideline values |
| **研究** | open book glyph | ink | 發表過的研究：長期追蹤、實驗、模式。後面寫哪裡、多久。 | Study | `international`, `modelled-tw` |
| **本站計算** | plus sign | ink | 我們拿有出處的數字做的加減乘除。 | Our arithmetic | `derived`; all money |

`/evidence/` and `/sources/` may show the finer registry type beside the chip. Money pages also keep 業者公布 for prices. The old 沒人量過 badge (`gap` kind) is deleted.

One word for the site's own air numbers: **推估**. Not 估計, 估算, 試算 or 模擬. In a sentence the verb is 算 (這是算的，不是量的). Long-term studies of people are **研究**, never 實測.

### 4.2 An estimated number

1. **Always a range, starting with 約:** 約 0.05 到 1 ppm. English: about 0.05 to 1 ppm. No "±", no midpoint in text. The midpoint is used for one thing only: how densely the picture is drawn.
2. **The 推估 chip sits on the same line as the number.** Not in a footnote, not only in a legend.
3. **Rounding is the science team's:** one significant figure for what the pack adds; one decimal place for totals. Never add a digit. A value under 0.01 is printed as 不到 0.01 / under 0.01.
4. **The number and its chip are one button, at least 48 px tall,** that opens the sheet (4.5).
5. **Say what it is the amount of.** What the pack adds is always worded 多出來 / added. It is never printed next to a measured total without that word. A chart plots the total (added plus background) on the same axis as measurements.
6. **Say where it applies:** an adult's nose, 1.5 m, a 90-second average, beside the pack. Never "at the child's nose".
7. **A headline may depend on an estimate only through a written rule** (screens 4, 5, 12, 13), so the words change if the numbers change.
8. **First use on a page carries the gloss once:** 這是算的，不是量的，所以給一個範圍。
9. **Confidence is stated in the sheet, by pollutant:** carbon monoxide 中 (the right size; the middle value could be off about three-fold), benzene 低 (five- to ten-fold), PM2.5 低. Benzene is never given more prominence than carbon monoxide.
10. **Version on every sheet:** 推估 v1・2026-11-26. When a real measurement replaces an estimate, the measurement is added beside it and the old estimate stays visible on `/estimate/`.

### 4.3 A measured number

1. It names who, where and when in its own label: 運研所・2024 年 7 月・3 個路口・最高的一分鐘.
2. It carries the fact's caveat in its sheet whenever the registry marks `requiresCaveat`. A build check enforces this.
3. The institute's waiting-area readings are never called a red-light figure or a scooter-only figure. Its carbon monoxide peaks are from three sites, not ten.

### 4.4 Measured beside estimated

- Same axis, same unit, separate rows. Measured rows above, estimated rows below. Each row label names place and averaging time.
- Solid dots or solid bars for measurements. A hatched band with a dashed edge for an estimate. An estimate is never a dot and never a line. Nothing joins a measured mark to an estimated band. They are never averaged, subtracted or turned into a ratio.
- A two-item legend stays under every such chart: ● 量到的　▨ 算出來的 / ● measured　▨ worked out.
- One sentence states the relation, chosen by the written rule (screen 5).
- A guideline is drawn only where its averaging time is comparable: the WHO 15-minute carbon monoxide value, as the zoom-out strip. The sheet says a 90-second level counts for one tenth of a 15-minute average. *As built 2026-11-27 (§13, "The 3-D simulation on the site"): the zoom-out strip is gone. A 90-second band set beside 87 ppm without conversion is must-not 3 of `research/simulation/statements.json`. The WHO 15-minute value is drawn only on the simulation's chart of 15-minute averages (SimCompare), home screen 5 and `/estimate/#simulation`.*
- No row is ever empty and no cell says 無資料. A pollutant with no publishable estimate gets a sentence, not an empty chart (section 7.2).

### 4.5 The sheet behind 怎麼知道的？

One pattern for the whole site: a bottom sheet with three short blocks and at most two buttons. It holds about 120 Chinese characters before the buttons. It has an address (`#how-4`). Without JavaScript the same content is an open `<details>` under the screen. It traps focus and returns it.

| Sheet for | Block 1 | Block 2 | Block 3 | Buttons |
|---|---|---|---|---|
| 推估 | **量到的** what was measured and by whom | **我們算的** the working, drawn as boxes with arrows, the result in a dashed box | **要小心的地方** two sentences at most, then confidence and version | 完整算法 → `/estimate/#id` · 把推估換成實測 → `/estimate/#measure` |
| 實測, 官方, 研究 | **誰量的** (or 誰說的) | **量到什麼** | **要小心的地方** | 看完整的證據 → `/evidence/#link-n` |
| 本站計算 | **用了哪些數字** | **怎麼算** the sum drawn as boxes | **要小心的地方** | 看完整的證據 or 用我的條件算 |

**The drawn working.** Where the arithmetic computes, draw it with operators (example: `15 公克／小時 ÷ 40 ＝ 約 0.4 公克`, because an hour holds forty 90-second reds). Where it does not (the kerb estimate is a simulation run 30,000 times), draw a **flow with arrows and no operator signs**: 每輛每小時排約 15 公克（8 到 27）→ 旁邊停 8 到 20 輛 → 風和距離把它吹淡 → 大人鼻子的高度，多出約 0.05 到 1 ppm.

**The cross-check, worded truthfully** (screen 5 sheet and `/estimate/#check`): 運研所量的路口裡，只有最忙的一個看得出機車讓一氧化碳變多：最高的一分鐘，多出約 0.8 到 1.2 ppm。把我們的算法放到那支儀器的位置和當時的風，算出來差不多。照行人站的位置算，大約是它的兩倍，所以我們的數字比較可能偏高，不是偏低。另外三個路口看不出差別。

### 4.6 Fair and unfair comparisons

| Use | Never use |
|---|---|
| The same gas on an ordinary roadside, same unit | A multiple of background as a headline or big figure (N 倍) |
| The WHO 15-minute carbon monoxide value, as "far below" | 8-hour, 24-hour or yearly limits against 90 seconds; AQI colours |
| "About as much as the street already holds", in body text, by the rule on screen 4 | Cigarettes; cancer risk from 90 seconds; poisoning |
| One scooter's carbon monoxide through one red as a drinks can | Any multiplier for the pull-away at green |
| Hours a year at red lights, as arithmetic | "Step back N metres and breathe X less" |
| Child against adult, air per kilogram, said in the sentence | Any number for child height (1.7–2.2 倍, "+10%") |
| | Any ultrafine-particle number for the pack; the WHO particle-number mark |
| | "The longer the red, the more builds up" or any curve through the red |
| | "When carbon monoxide rises everything rises" (only fresh fuel vapour and benzene) |
| | Riders breathe "the most" |
| | That carbon monoxide or PM2.5 "has never been measured" at Taiwanese crossings |

The copy check (`scripts/check-copy.mjs` with `src/data/claims-policy.ts`) gets one rule per row of the right-hand column.

---

## 5. Components and illustration

### 5.1 The street scene's new "amount" behaviour

One function draws air everywhere: `src/components/art/air.ts`. Home scenes, question pages, share cards, the poster and the film all use its rule and its constants. It replaces the hatched "unmeasured" band.

**As built (fume only, 2026-11-27; this replaces the earlier rings-and-dots design).** The owner did not read blue rings and dark dots as anything, even with a key under every picture, but recognised the orange-brown fume coming out of the scooters at once. So **exhaust is drawn only as fume coming out of the scooters**, and nothing in a picture is an abstract mark that needs a key to decode. There is no key (`AirKey`, `AirLegend` and `AirRange` are gone). What the fume holds is said in plain words: on the picture, as short labels with a thin leader line into the fume (`scene.ts leader()`), or in the text beside it.

**The fume.** A warm, soft, smoky grey-brown with wavy orange wisps through it (the wisps are the part you can smell). Every edge fades to nothing, it is drawn behind the people so it never covers a face, and in dark mode it is a muted warm brown haze, never a pale glow that could read as headlights.

**Two parts.**

| Part | Where | Rule |
|---|---|---|
| **B. What the pack adds where people stand** | The kerb zone: from the ground to 150 cm, on the people's side of the nearest tailpipe | The fume carried on from the nearest tailpipe to the people: three overlapping soft ovals, low at the tailpipe, wrapping the people from the ground up. Its **average tint over the zone is 6 % per step**, and the steps are `6 × co.<scenario>.add.mid ÷ bg.co.traffic`, rounded, at least 1: **1, 3, 6** steps (6 / 18 / 36 %) for 幾輛, 十來輛, 停滿, in proportion to the carbon monoxide the pack adds. The code computes it (`fumeSteps`, `AIR_EXTRA`); nobody types it. Its darkest point never passes 62 % (`AIR.washMax`), so the full box is drawn a little lighter than proportional, never darker. Wisps reaching the people: 1, 3, 5. No bands by height. |
| **C. A puff at each tailpipe** | Behind each drawn petrol scooter | One fixed soft puff per tailpipe, low on the ground, billowing a little and thinning over about two metres, with one or two short wisps. Not scaled by the estimate; drawn for the eye. This is what makes the picture bold where it is true: beside a tailpipe. |

The street's own air is **not drawn**. The tag under every street picture says so: **示意圖｜廢氣大多看不見，街上本來的空氣沒有畫** / *Illustration: real exhaust is mostly invisible, and the street's own air is not drawn*, and the number boxes carry it (0.5 ppm, 實測).

**Words on the pictures.** Screen 2 and `/questions/smell/`: one scooter, one fume, a few wisps rising to a person's nose, and three labels into that fume: **油氣：聞得到** (at the wisps), **一氧化碳：聞不到** (into the thinner fume near the head), **微粒：小到看不到** (into the fume low behind the pipe; no darker patch, so nothing visible sits beside "too small to see"). Labels never break inside a phrase (SceneLabel glues each short piece) and the ones on the bottom edge grow upward with 字大. Never ranked. Every other street picture carries at most one label, **機車排的氣**, or **汽車排的氣** where the only exhaust is a car's (the green street, the swap picture).

**What changes the drawing.** Only the scenario switch (screens 1, 4), the swap slider and the repair button. **Nothing changes with time through the red.** Wisps drift a few pixels; that is all.

**Electric scooters** have no fume at all. A car at the frame's edge keeps one small puff of its own exhaust, labelled. Tyre and brake dust is left to the words.

**Diagrams draw the same fume** (`airPuff`, `airRibbon`): the body (G6) shows the cloud breathed in, its wisps to the nose and throat (1), a sooty haze in both lungs (2: particles), a faint haze on into the heart and blood (3: carbon monoxide), each part lit by its numbered pin. The mask (G17) shows the cloud coming out of the tailpipe of a scooter whose back and rear wheel are in the picture (a bare pipe read as a cigarette), reaching the mask, the gases going on through it as a faint haze in the airway, the wisps to the nose, a sooty patch on the mask's front (darker on a mask that stops more), and on a loose mask the fume curling in at the gaps beside the nose and the cheek (two small arrows). The ten scooters (G11) draw the one that needs repair as one cloud whose area is about a third of all the fume in the picture (`est.inspect.top10share`, middle of the range), drawn darker than the small puffs and named right above it, 該修的那一輛 / This one needs repair. The heights scene (G8) draws the fume from the ground to above the adult's head, with no shaded band. The green street names one electric scooter in words and turns the car so its puff lies clear of the scooters; the electric share card has no exhaust at all. The film animates the same fume: puffs leave each tailpipe, drift from the nearest one to the people, and a wisp is breathed in at each nose in the ruler shot.

**The range** is not drawn: a picture draws the middle value, and the range section of `/estimate/` shows how wide it is.

**Every alt text** says it is an illustration, names the scenario, and says that the amount where the people stand follows the site's estimate while the dark patches at the tailpipes are drawn for the eye.

**The rule is published** on `/estimate/#drawing` in five sentences (numbers from `AIR_RULE`), so a reporter can check it. The site check (`check:site`, check 14) fails if any page carries a ring, dot, halo, key or breathing ring.

### 5.2 The graphics

| # | Graphic | Used on | Spec |
|---|---|---|---|
| G1 | Street, red | Screen 1, share card, poster | A 4:5 crop. Pale shopfronts. Sixteen scooters three rows deep, fading with distance; one front-row rider with a face. Three pedestrians at the kerb in front of the fume. Signal with LED 90. A zebra crossing in front. Scooters roll in and settle, the counter runs to 16, the puffs appear with them, then everything rests. One label, 機車排的氣, with a thin line into the fume. Must look unpleasant at the tailpipes. |
| G2 | One scooter, one fume | Screen 2, `/questions/smell/` | Full-width side view. One soft fume leaves the tailpipe, with wisps rising to a person's nose; Three labels with leader lines into the fume: 油氣：聞得到 / 一氧化碳：聞不到 / 微粒：小到看不到. No key. A drawn drinks can by the chip. |
| G3 | From above | Screen 3, `/questions/beside-me/` | Rebuild of `ApproachPlan.astro`: stop line, turn box, zebra, kerb in road-paint colours; scooters from above with wheels, handlebars and a rider (arms to the grips, helmet with visor); a dimension line with a large HTML number; a side inset with the one-metre line. The puffs slide across the gap once; one label, 機車排的氣. |
| G4 | Kerb close-up with the switch | Screen 4, share card, poster, brief | The page's central picture. People left, tail right, the fume of 5.1. Switching changes how thick the fume is where the people stand, the number of rows behind, and the 推估 row. Fade 0.6 s. One label, 機車排的氣. |
| G5 | Measured beside estimated, with the zoom-out strip | Screen 5, `/estimate/`, brief | Section 3.2, screen 5. Direct labels, no legend lookup, a data-table view in the sheet. Bars grow once. |
| G6 | The body | Screen 6, `/questions/one-red-light/`, film | Base it on the one-walk drawing (large, dark, high contrast) with an adult, not a child, and no cap. Three numbered pins. The fume goes in once: wisps to the nose and throat, soot in the lungs, a faint haze into the blood. |
| G7 | Road of time and the year strip | Screen 7, `/questions/one-red-light/` | Replaces `TimeLadder.astro`. Three signposts, each with a drawing (a heartbeat trace with one shallow dip; lungs; a calendar). Under them one bar in hours, 一年加起來 / Added up over a year (no dot per day: the owner rejected dots, 2026-11-27); it refills when the stepper changes. Never an empty rung. |
| G8 | Heights | Screen 8, `/questions/my-child/`, film | Ruler in centimetres with HTML numbers. Four whole figures on one ground line. Even fume from the rider's tailpipe, no height bands, one label 機車排的氣. |
| G9 | The rider | Screen 9, `/questions/rider/` | Second-row rider, visor up, the tailpipe ahead pointing at them. No chart. One label 機車排的氣. |
| G10 | Swap slider | Screen 10, share card | Ten scooters, ten stops, plus and minus buttons. Plays 0 → 10 once and rests on electric. Replaces `SceneCompare.astro`. |
| G11 | Ten scooters, one to fix | Screen 11 | The 修好它 button shrinks one cloud, once, 0.8 s. No rider on the dirty one. The cloud's area is about a third of all the fume drawn. |
| G12 | Price bars | Screen 12, `/electric/` | Two bars to one scale, the subsidy as a dashed extension, one bracket. Green when electric is cheaper, ochre when dearer. |
| G13 | Monthly bars | Screen 13, `/electric/` | Two thick bars, a divider, two thin outlined bars, direct labels in 元. |
| G14 | Street, green | Screen 14 | G1 after the switch. |
| G15 | The working, drawn | Sheets, `/estimate/` | Boxes with operators or arrows (4.5), the result in a dashed ochre box. |
| G16 | Share cards, poster, brief | — | Section 7.9. |

### 5.3 What moves

- **Once, on arrival, then rest (under 4 s):** scooters arriving and the counter (1); wisps leaving the tailpipe (2); the puffs crossing the gap (3); bars growing (5, 12, 13); the fume going in (6); the slider's first run (10).
- **On a tap:** the scenario switch (4), pins (6), the stepper (7), the slider (10), 修好它 (11), county and scrapping (12), distance (13).
- **Gently, all the time:** a drift of a few pixels in the wisps. A 動畫 開／關 switch in the menu stops it.
- **Never:** text, axes, numbers once drawn, the page itself.
- With `prefers-reduced-motion` every picture shows its final state and every control still works.

### 5.4 Work list

**New components**

| Component | Path | Spec |
|---|---|---|
| `Screen` | `src/components/ui/Screen.astro` | The frame of 3.1: slots for picture, headline, body, quiet line, chips, sheet and next button. Enforces the character limits at build time (a headline over 22 Chinese characters or a body over 45 throws). Replaces `Chapter.astro`. |
| `ScreenRail` | `src/components/ui/ScreenRail.astro` | Lamp, chapter name, `n / 14`, progress bar. Updates with an `IntersectionObserver`. No seconds. Replaces `CountdownRail.astro`. |
| `KindChip` | `src/components/ui/KindChip.astro` | The five chips of 4.1. Replaces `EvidenceBadge.astro` and its gap variant. |
| `EstimateValue` | `src/components/ui/EstimateValue.astro` | Prints 約 A 到 B, the unit and the 推估 chip as one button that opens a sheet. Takes a slot id, never a typed number. Applies the "不到 0.01" rule. |
| `HowSheet` | `src/components/ui/HowSheet.astro` | The sheet of 4.5, with the `<details>` fallback and its own address. |
| `NextButton` | `src/components/ui/NextButton.astro` | The full-width question button. |
| `ScenarioSwitch` | `src/components/ui/ScenarioSwitch.astro` | Three whole-width segments, 48 px tall, each with its count range underneath. Emits one event that the picture and the number listen to. |
| `TextSize` | `src/components/shell/TextSize.astro` | The 字大 button (section 6.4), with a pre-paint script in `Base.astro`. |
| `air.ts` | `src/components/art/` | Section 5.1. A pure function from scenario, zone, tailpipe positions and seed to SVG: fume only. |
| Scenes | `src/components/art/HeroStreet.astro`, `TailpipeMarks.astro`, `KerbScene.astro`, `BodyFigure.astro`, `HeightsScene.astro`, `RiderScene.astro`, `SwapScene.astro`, `TenScooters.astro` | G1, G2, G4, G6, G8, G9, G10, G11. One SVG each, built from `parts.ts`. |
| `MeasuredVsEstimate` | `src/components/charts/MeasuredVsEstimate.astro` | G5 with the zoom-out strip. Takes rows with a kind; draws by the rules of 4.4. |
| `RoadOfTime` | `src/components/charts/RoadOfTime.astro` | G7. |
| `PriceBars`, `MonthlyBars` | `src/components/charts/` | G12, G13. |
| `WorkingSum` | `src/components/charts/WorkingSum.astro` | G15: boxes with operators, or boxes with arrows. |
| `AnswerCard` | `src/components/pages/evidence/AnswerCard.astro` | One former gap as "the answer we have now": the answer, its chip, its basis in one line, its caveat. Replaces `GapCard.astro`. |
| `estimate.ts` | `src/data/estimate.ts` | Typed slots read from `research/estimate/results.json`, with the published rounding. |
| `home-money.ts` | `src/lib/home-money.ts` | Build-time tables for screens 12 and 13 and the film: every county × scrapping, the worst case, monthly costs at four distances, break-even, for today and for each date on which the sums change. |

**Changed components**

| Component | Change |
|---|---|
| `src/components/art/parts.ts` | Add the walking pose and the "hand over nose" pose the film carries locally; rewrite the comment that says nothing drawn may suggest an amount. Remove `hatchBand`. |
| `src/components/art/StreetScene.astro` | Retired from the home page and the film. Delete once nothing imports it. |
| `src/components/art/ApproachPlan.astro` | Becomes G3. |
| `src/components/art/MeasurementDiagram.astro` | Kept for `/estimate/#measure`; position markers at least 14 px. |
| `src/components/art/SmellStrip.astro` | Kept for `/questions/smell/`; labels at least 14 px. |
| `src/components/ui/ChainStrip.astro`, `ChainLink.astro`, `ChainMarker.astro`, `EvidenceChain.astro`, `pips.ts` | Used on `/evidence/` only. Link 3 is drawn as a whole link with a dashed outline (推估) and a solid dot beside it (實測), not as a break. |
| `src/components/pages/evidence/EvidenceMap.astro` | The 沒人量過 column goes. A 推估 column takes its place. |
| `src/components/ui/Figure.astro`, `ChartShell.astro` | Remove the `empty` mode. |
| `src/components/ui/Range.astro` | Always has a value; no hollow thumb. |
| `src/components/shell/Header.astro`, `Footer.astro` | New menu; 字大; the "sample data" footer sentence is deleted. |
| `src/layouts/Redirect.astro` | Carries the hash (section 2). |
| `src/styles/tokens.css` | Section 6. |
| `src/components/pages/electric/Calculator.astro`, `calc.client.ts` | Open on a worked result; read `?county=&scrap=&km=`. |
| `src/pages/[...lang]/styleguide*.astro` | Not built in production. |

**Removed**

| Removed | Why |
|---|---|
| `EmptyChart.astro`, `charts/core/empty.ts`, the `.chart--empty` styles | There is no empty chart any more. |
| `Haze.astro` (with `kind="unmeasured"`), `PollutantKey.astro` | Replaced by `air.ts` and the key on screens 2 and 4. |
| `SignalCycle.astro`, the K3 "paused" frame, every 倒數暫停 string | No time course is published. |
| `SceneCompare.astro` | Replaced by the swap slider. |
| `CountdownRail.astro`, `Chapter.astro`, `TimeLadder.astro`, `EvidenceBadge.astro` (gap variant), `QuestionChips.astro`, `PullQuote.astro` (home use) | Replaced or unused. |
| `pages/home/PinnedScene.astro`, `Ev.astro`, `EvShareChart.astro`, `Notes.astro`, `RedLightYear.astro`, `home-data.ts`; `pages/questions/RedLightYear.astro` | The home page is rebuilt. The EV-share chart moves to `/act/`. The year counter is now the stepper inside `RoadOfTime`, always filled in. |
| `pages/evidence/GapCard.astro`, `src/data/gaps.ts` | Become `AnswerCard.astro` and `src/data/answers.ts`. |
| `pages/film/LedTable.astro` | The new film draws its own LED. |
| `src/i18n/pages/unmeasured.ts` | Its page is a redirect. |

A file is deleted only after every lane has removed its imports (section 9, phase 3).

---

## 6. Reading rules for all ages

### 6.1 Type

| Role | Size on a phone | Notes |
|---|---|---|
| Body | 18 px (`1.125rem`), line height 1.6 | Ink `--ink` on the page colour, at least 7:1. Not grey. |
| Headline | 27 px, weight 900, line height 1.28 | Two lines at most. |
| Big figure | 40 to 56 px, tabular figures | Unit at 18 px beside it. Clamped so it never leaves the screen. |
| Quiet line, chips, labels, words in pictures, chart labels | 15 px | `--ink-2` (7.3:1). |
| Buttons | 17 px, weight 700 | |
| **Floor** | **14 px** | For anything a reader can see, on every page. `--fs-xs` becomes `0.875rem`. Nothing is exempt. |

All sizes are in `rem`. English uses the same sizes.

### 6.2 Contrast and colour

Body and headlines at 7:1 or better. Labels at 4.5:1 or better. Marks that carry meaning at 3:1 or better against what is behind them, in both themes. `--ink-3` is not used for sentences. The white 綠燈 label on green (4.32:1 today) uses the darker green. Measured and estimated differ by shape and pattern, never by colour alone.

### 6.3 Touch

Every control at least 48 × 48 px (`--tap: 3rem`), 8 px apart. Switches are whole-width segmented buttons. Nothing depends on hover, a long press or a precise drag: the slider has plus and minus buttons.

### 6.4 Larger text

The 字大 button in the header cycles 標準 → 大 → 特大 (root size 100%, 115%, 130%) and remembers the choice. A script in the `<head>` applies it before first paint. At 大 and 特大 a screen may grow taller than the viewport and the picture may shrink to 280 px. Nothing is clipped. The reader's own phone or browser text size also works, and so does zoom to 200%.

### 6.5 Words per screen

One headline (22 Chinese characters at most), one body (two sentences, 45 characters at most, each sentence 30 at most with at most two commas), at most one quiet line (30). Anything longer is a sheet or another page. Sheets hold about 120 characters. English follows the Chinese sentence for sentence at about the same length.

### 6.6 Chinese vocabulary

Write for an upper-primary reader, as people in Taiwan talk.

| Use | Do not use |
|---|---|
| 機車、燃油機車、電動機車 | 摩托車、載具、機車族 |
| 輛 | 台、部 |
| 廢氣、車子的廢氣 | 車流廢氣、交通相關空氣污染 |
| 油氣（沒燒完的汽油） | 碳氫化合物、揮發性有機物 (sheets may add them once) |
| 一氧化碳 (written out) | CO alone in a sentence |
| 微粒；細懸浮微粒（PM2.5） on first use | 粉塵 for exhaust particles |
| 粉塵 only for tyre, brake and road dust | |
| 苯（ㄅㄣˇ）、醛（ㄑㄩㄢˊ） with 注音 on first use per page | |
| 吸到、吸進 | 暴露 |
| 多少、多濃 | 濃度 (outside sheets) |
| 有關、比較多 | 關聯、造成、導致、害 |
| 算的、量的；推估、實測 | 沒人量過、無資料、估計、試算、模擬 |
| 越…越… | 愈…愈… |
| 小孩、大人、阿嬤、寶寶 | 兒童、孩童、成人、族群 |
| 騎士、騎車的人 | 你們 |
| 機車沒有熄火、引擎沒熄火 | 騎士不熄火、違規、合法 (about idling) |
| 排最多的一成 | 最髒的一成 |
| 一排機車、機車 | 車隊 |
| 路口、斑馬線、待轉區、行人等候區 | 交叉口、行人穿越道、進口 |
| 定檢、報廢、補助、減稅、綠牌、白牌、換電、在家充電 | 稅減 |
| 運研所（交通部運輸研究所 on first use） | IOT |
| 資料、出處 | 登錄表、次級來源、數據 mixed with 資料 |
| 10,388 元 (Chinese); NT$10,388 (English) | mixing 元 and NT$ in one language |

Other rules: a hard word is explained in the sentence where it first appears, so no tap is needed to understand a screen. Units a child knows go in sentences (輛, 公分, 公尺, 公克, 分鐘, 小時, 倍, 元); ppm, ppb and µg/m³ sit beside the big number and in sheets, with ppm explained once on screen 4. Full-width punctuation in Chinese. No space inside 28 萬輛. No sentence orders a rider to do anything before screen 11.

English: scooter, exhaust, junction, crossing, kerb, pushchair, petrol, turn box, estimate, measured, official, study. One English name per Chinese word (油氣 is always "fuel vapour").

### 6.7 The four readers

These are manual acceptance tests (section 9.3).

- **A ten-year-old** looks at the pictures, presses 幾輛 and 停滿, finds their height on the ruler, taps the three pins, drags the slider until the tailpipes are gone, and can say: the scooters make a cloud, it is at my height, it goes into my lungs, electric ones do not make it.
- **A parent on a phone** reads 14 headlines at a bus stop in under three minutes, sees their own county's price, and sends the page on LINE.
- **A seventy-five-year-old with reading glasses** taps 字大 once, reads one headline per screen, moves on with the next button, never needs a sheet, and can watch the film with captions instead.
- **A rider who expects to be accused** meets 騎車的、走路的，都在同一個路口呼吸 on the first screen, a rider drawn with a face, a screen of their own that says 這不是誰的錯, something useful to do without buying anything, and the unfavourable price case stated on the same screen as the favourable one.

---

## 7. What each other page becomes

One template serves every page below: the same header, `KindChip`, `EstimateValue`, `HowSheet`, type scale and tap sizes as the home page. Every page obeys the vocabulary list and the 14 px floor.

### 7.1 The few sentences of the old framing that stay

"No data missing" does not mean pretending. These statements are true, each stands beside the answer that fills its place, and they are the **only** places where "not yet measured / not yet known" wording may appear. The acceptance check uses this list as its allow-list.

| Id | Sentence (zh / en) | Where it may appear |
|---|---|---|
| K1 | 紅燈時站在機車旁邊的人吸到多少，還沒有人直接量過；最接近的，是運研所在行人等候區的量測。 / Nobody has yet measured directly what a person beside the scooters breathes at a red light. The closest is the Institute of Transportation's readings in pedestrian waiting areas. | `/estimate/` (top and `#measure`), `/about/`, the measurement letter on `/act/`, the brief |
| K2 | 苯和超細微粒，台灣還沒有人在紅燈路邊量過。 / Benzene and ultrafine particles have not yet been measured at a Taiwanese red light. | `/estimate/`, `/evidence/#link-3` |
| K3 | 這排機車又加了多少超細微粒，現有的資料還算不出來。 / How many ultrafine particles the pack adds cannot be worked out from the data that exist. | `/estimate/` |
| K4 | 矮的地方，廢氣一樣多或更多；多多少，還算不出來。 | Home screen 8, `/questions/my-child/`, `/estimate/` |
| K5 | 等一個紅燈就會生病嗎？沒有人證明過。 (film: 等一個紅燈就生病？沒有人證明過) | Home screen 6, the film's health beat, `/questions/one-red-light/`, `/evidence/#link-5`, sheets |
| K6 | 綠燈起步那一陣有多大，還沒有人量過，所以本站不印倍數。 / Nobody has measured how big the burst at green is, so this site prints no multiplier. | `/estimate/#answers`, the film transcript |

The exact strings 沒人量過 and 多濃沒人量過 appear nowhere. The English "not measured", "never been measured" and "nobody has measured" appear only inside the K sentences.

### 7.2 `/estimate/` — 怎麼算的 / How we worked it out (new; replaces `/unmeasured/`)

It opens with the answer, not the method: the `MeasuredVsEstimate` chart for carbon monoxide and the sentence 這是推估，不是實測 with K1. Then, in order:

1. **`#numbers` 算出來的數字.** One table: three scenarios × carbon monoxide, benzene, PM2.5, each as 約 A 到 B with its unit, what the street already holds beside it, and the confidence word. PM2.5 carries the sentence 機車讓 PM2.5 多出來的量，比街上原本就有的少很多. Ultrafine particles are a sentence, not a row of empty cells: K2 and K3. Download as CSV and JSON.
2. **`#recipe` 怎麼算.** The drawn flow (G15): 每輛排多少 → 旁邊幾輛 → 風和距離把它吹淡 → 路邊多出多少. Each input with its own range and chip, from `results.json → inputs`: the 9.07 million inspection readings (官方), idle fuel use (研究・國外, the input most in need of a Taiwanese measurement), wind at the kerb (assumed from weather-station and on-site readings).
3. **`#count` 幾輛.** How the three scenarios were chosen from the institute's video counts, with the drawn sum for the busiest road, using the figures recorded in `results.json` (一個方向每小時約 1,500 輛 × 83 秒的紅燈 ÷ 3,600 秒 ≈ 34 輛). Use one sum only; the older "÷ 4 ÷ 40 = 37" version is not printed.
4. **`#check` 跟量到的對得起來嗎.** The cross-check paragraph of 4.5, the institute's PM2.5 (4 到 14 微克, the pack adds about 1), Taipei's roadside stations (0.80 ppm in 2024), and benzene against Taipei commuters as a check of scale only.
5. **`#range` 為什麼是一個範圍.** Wind (changes the answer about four-fold), fuel use, which scooters are there, where you stand. Confidence by pollutant.
6. **`#drawing` 圖是怎麼畫的.** The four sentences of 5.1 with the two patches.
7. **`#limits` 這個推估不能說什麼.** Plain bullets from METHOD §8: an adult's nose only; a 90-second average, not second-by-second peaks; scooters only, not the cars in the same queue; no particular junction; not a health assessment. K3, K4, K6.
8. **`#answers` 十三個問題，現在的答案.** The former gap list as a table of `AnswerCard`s, one line each with its chip:

   | Former gap | Chip | The answer now (write the copy from these facts) |
   |---|---|---|
   | What a pedestrian breathes at a red light | 推估 + 實測 | The estimate, beside the institute's readings. |
   | How much an idling scooter gives off | 推估 | About 15 g of carbon monoxide an hour (8 to 27), from the 2025 inspection readings. A Hanoi laboratory measured about 61 g/h on five common models; that is a different fleet and method and is shown only as a comparison. **Do not print "about 1 gram a minute".** |
   | How many scooters stop at one red | 推估 | About 34 per red on the busiest road measured; 3 to 10 on a quiet one. The site's three scenarios. Pedestrians wait about 85 to 115 seconds. |
   | What switching to electric does to street air | 研究・台灣模式 | Liou and Wu 2021: about US$1 billion (about NT$30 billion) a year of health harm avoided if every petrol scooter were electric. A national model, not a kerb measurement. Needs a registry fact opened from the paper. |
   | Air at a child's height in Taiwan | 研究 | Children breathe 1.5 to 2 times the air per kilogram. K4. No height number. |
   | Roadside carbon monoxide against WHO values | 實測 | Taipei's three roadside stations averaged 0.80 ppm in 2024 and met Taiwan's hourly and 8-hour limits every year from 2014 to 2024. |
   | A child on the back seat on the way to school | 實測・國外 | In Ho Chi Minh City and Bandung the ride on a scooter was the highest-exposure part of a child's trip. Assume a child on the back seat breathes what the rider breathes; this is inferred. |
   | The burst when the pack pulls away | — | A short, sharp burst of a few seconds. K6. Drop the old "idling emits about as much as cruising" comparison; it rested on the Hanoi figure. |
   | Can a minute or two do harm | 研究 | The five-minute Kaohsiung finding with its limits, the one- to two-hour experiments, 12 to 55 hours a year. K5. |
   | What the smell is | 推估 | Unburnt petrol vapour and sharp aldehydes; acetaldehyde is the likeliest strongest contributor (noticeable at about 1.5 parts per billion). A ranking from thresholds, not a smell test. |
   | How much the dirtiest scooters give off | 本站計算 | The highest tenth of 2025 inspection readings carry about 30% to 45% of the carbon monoxide. Readings, not scooters; only those that came for inspection. |
   | Taiwanese health studies of scooters alone | — | Folded into one caveat used everywhere: 所有車輛，不只機車. The 2022 roadside study goes under `/evidence/#link-5` with its caveat. |
   | The idling rule and scooters | 官方 | The rule asks engines off after more than three minutes of waiting; a normal red light is shorter; the law's 汽車 includes motorcycles. Never 違規, never 合法. |

9. **`#measure` 把推估換成實測** (also `id="ask"`). One call to action among others. The measurement plan diagram, the letter composer, and one sentence of promise: 量出來的結果，不管高低，我們都會登出來。 The letter cites the estimate and the institute's study, and has a salutation, the sender's name, address and contact fields (an agency may ignore a letter without them).

Every sheet's 完整算法 button lands on a section of this page. The page ends with 推估 v1・2026-11-26 and a change log.

### 7.3 `/evidence/` — 證據

The adults' page keeps its seven links and its anchors. At the top, the connect board from the old home page, rewritten: seven lines, each with its chip. Link 3's line reads 街上的人吸進什麼：運研所量過等候區（實測）；機車旁邊，本站推估. The evidence map loses the 沒人量過 column and gains 推估; link 3 is drawn whole. Under each link: its facts grouped by chip, then its `AnswerCard`s. The "Withdrawn for correction" row is restored with the corrected fact (2027: nothing confirmed; a draft has been pre-announced). The words 登錄表 and "registry" are replaced by 本站的資料 / "our data". Gap counts are deleted. The lists 我們沒有說 and 什麼會讓我們改口 stay here, updated from section 4.6. Home-page material that was cut (the national emissions chart, the tunnel study, the idling-rule reading, the pollutant classifications, the commute and pushchair charts) lives under its link. Fix the reviewers' factual findings while there: the commute readings were different people over three years, not "the same morning"; national NMHC is not all "unburnt fuel vapour"; "aldehydes at a few parts per billion" belongs to acetaldehyde, not formaldehyde.

### 7.4 `/sources/` — 資料來源

A reference list only, reached from the footer and from `/evidence/`. The section 沒人量過的空白 and the withdrawn rows are removed. The estimate's own sources (`research/estimate/sources.json`) and the mask sources are added.

### 7.5 `/questions/` and its pages

The index is a grid of seven picture cards, each with its picture, its question and a one-line answer. Each question page is one `Screen` (picture, one-sentence answer, sheet) plus at most two more pictures and a share block: at most three viewport heights.

| Page | Picture | The answer (write final copy from this) | Fixes from the review |
|---|---|---|---|
| `smell` 那個味道是什麼 | G2 | 臭的是沒燒完的汽油和刺鼻的醛類，最可能的主角是乙醛。一氧化碳沒有味道。微粒太小，看不到。 推估 | English must not say more than the Chinese ("probably aldehydes" overreached). |
| `my-child` 我的小孩呢 | G8 | Screen 8's copy. Add the back-seat answer (inferred). | No 1.7–2.2. Labels at least 14 px; the scooter is not cropped. |
| `app` 空氣品質 App 為什麼看不出來 | A station inlet 2.5 to 3.5 m up beside a kerb scene | 測站的進氣口在 2.5 到 3.5 公尺高，一小時報一次；紅燈是 90 秒，在一公尺以下。PM2.5 在路口和測站差不多，所以 App 看不出來。 實測 | — |
| `one-red-light` 等一個紅燈有差嗎 | G7, G6 | Screen 7's copy, the dose arithmetic and the kerb workers. K5. | Delete "the evidence starts at an hour". Rewrite the figure caption that printed raw research notes. The year counter is always filled in. |
| `rider` 騎車的人呢 | G9, then the five commute bars | Screen 9's copy. Bars labelled 平均・各種來源・早上一小時; a line that scooter and walking did not differ significantly. | Never "the most". |
| `beside-me` 站遠一點有用嗎 | G3 | 離排氣管遠一點，通常比較淡；差多少，本站不印數字。運研所把等候區往後退，量到 PM2.5 少了 0.46 和 0.94 微克。 實測 | No distance control. No "step back N metres". The idle-limit chart names its pollutants or is removed. |
| `mask` 口罩擋得住廢氣嗎 (new) | A face with a mask: fume reaching it, the gases going on through as a haze, soot on the mask's front, fume curling in at the gaps | 口罩擋的是微粒，而且會從邊緣漏；一氧化碳和油氣是氣體，連 N95 都擋不住。 研究 | Use only the facts and the `mustNotSay` list in `research/masks/VERIFIED.json`. Do not print the old "70–80%" figure. |

`how-much` and `electric` are redirect pages. Their share cards are kept as files so old shares still show a picture.

### 7.6 `/act/` — 我能做什麼

Five cards by who you are, one action each on top, letters below: 我走路 · 我是家長或老師 · 我騎車 · 我在學校或社區 · 我是民意代表或公務員. The rider's card: 準時定檢、該修就修；下一輛先算算看電動的. The measurement request is one card (把推估換成實測), linking to `/estimate/#measure`. The councillor letter and the brief cite the estimate and the institute's study, and no longer say nobody has measured. 國家發展委員會 is named as the lead agency for the net-zero pathway; every 待確認 tag goes. The EV-share chart moves here from the home page, with the 2025 target (20%) shown. Fix `28 萬 輛`. Rewrite the translated action lines (傳到 LINE 群組, not 傳到一個 LINE 群組).

### 7.7 `/electric/` — the hand-off

The calculator **opens on a finished result**: for a reader arriving from the home page, their county, scrapping answer and distance (`?county=&scrap=&km=`), with the line 你在首頁選的：新北・有舊車可報廢・每月 300 公里 / What you chose on the home page; for anyone else, the default case (新北市, an old scooter to scrap, the cheapest green-plate model, 300 km a month). The first screen has the form of home screen 12: figure first, bars, working below. Three large questions refine it: 有沒有舊車可以報廢？ · 停車的地方能充電嗎？ · 一個月騎多遠？ There is no "choose a county first" state, no blank number box, no hollow slider thumb and no empty levers panel.

"No data missing" on this page:

- Subsidy status is a short chip from one legend (還有名額 · 有條件 · 已用完 · 已截止 · 官網沒有公布名額), not a paragraph. A chip that says a government site publishes no quota is a status, not a gap; it stays.
- Re-check the jurisdictions whose site "could not be reached". If one still cannot be reached, its chip reads {date} 查不到官網 and the sum uses central subsidies only.
- The finance sentence and the resale sentence ("we could not find a reliable figure") are deleted unless a checked fact replaces them.
- 稅減 → 減稅. 燃油車 → 燃油機車. Chinese amounts in 元.

**Dates.** The site already rebuilds every night (`.github/workflows/deploy.yml`). `home-money.ts` also emits the tables for each coming date on which the sums change, and the existing pre-paint script (`src/lib/site-state.ts`) picks today's, so a cached page is never stale. The deadline strip on home screen 12, the film's money beat and `/electric/` share one set of states:

| Period | Strip |
|---|---|
| to 30 November 2026 | 補助到 12 月 31 日。燃油機車的促銷到 11 月 30 日。 |
| 1–31 December 2026 | 補助到 12 月 31 日。 |
| from 1 January 2027, nothing announced | 2027 年的補助還沒公布。下面先用沒有補助的價格算。 / The 2027 subsidies have not been announced. The sums below use prices with no subsidy. |
| from the day a 2027 programme is in the data | 補助到 {date}。 |

Headlines on screens 12 and 13 follow their rules, so they change by themselves.

### 7.8 `/about/` — 關於

Short: who made the site; how the five chips work; one paragraph on the estimate with K1, the sentence 本站沒有自己去量；我們推估，並把算法攤開, and a link to `/estimate/`; the editorial rules rewritten around 我們推估，並把算法攤開 (taken from sections 4.2 and 4.6); the corrections log. Add one correction entry dated today: the site used to say that nobody had measured carbon monoxide or PM2.5 at Taiwanese crossings; the Institute of Transportation had; the site now shows those readings beside its own estimate. Gap counts go. The claim that figures seen only in a search summary are never used is made true or removed. **Contact, licence and funding statements appear only if the owner has supplied them.** A section with nothing to say is left out, and the note on other pages that points to a licence on this page is deleted with it.

### 7.9 Print pages and share cards

- **Poster `/print/poster/`.** G4 at the dozen scenario, the headline of screen 4, 這排機車多出來的一氧化碳：約 0.05 到 1 ppm 推估, the repeatable sentence, a QR code. No "nobody has measured this crossing".
- **Brief `/print/brief/`.** One A4 for a borough chief or councillor: G4, G5, the numbers table from `/estimate/#numbers`, G8 with screen 8's sentence, K1, and the ask. Height labels do not wrap mid-number; no empty fifth of the page.
- **Share cards.** Re-render all of `public/share/**` and both manifests with `scripts/build-share-cards.mjs`: one picture and one line per card; a card with an estimated number carries 推估 and its range inside the image; no hatched band. Add a card for `mask`; keep `how-much` and `electric`. The film card uses the film's frame at the ruler shot (beat 10) and the text in section 8.3. Every card's alt text follows 5.1.
- **QR codes, canonical links, `og:url`, the sitemap** are built from `SITE_URL` and `BASE_PATH`, which the deploy workflow takes from the Pages settings. Check after deploy that they read `https://likelylabs.com/scooterair/…`.

### 7.10 Shared text

- Site description and the home page's title and description contain 空氣污染 and 廢氣: 等紅燈時，旁邊機車的廢氣有多少、對身體有什麼影響、換電動機車要多少錢。
- The footer sentence about 示意數據 / sample data is deleted.
- The 404 page links to the home page, the film and the calculator.

---

## 8. The film (`/90/`)

Keep the prototype. It is a real animation: one continuous scene driven by one clock, with braking scooters, a dive into the exhaust, a freeze for health, green, then the same light replayed electric behind a divider. Port it as `INTEGRATION.md` describes, with the changes below. The final film runs about 1 minute 55 seconds. It is called 短片 / the film, never "90 秒短片"; every label that states its length reads `film.duration`.

### 8.1 Final beat sheet

"LED" is what the signal shows. ▸▸ marks time-lapse. Every caption is at most 14 Chinese characters or 8 English words. Each cue stays on screen at least 0.3 seconds per Chinese character of caption plus quiet line, and never under 2.2 seconds. The timeline owner may lengthen a hold but not shorten below that floor.

| # | Time (s) | LED | What moves | Caption zh / en | Quiet line zh / en | Slots |
|---|---|---|---|---|---|---|
| 1 | 0.0–4.6 | green, amber, red at 1.2: 90 | The corner. Three people already waiting; the first scooters roll in. The child lifts a hand to cover nose and mouth. Framed so the people are at least 90 px tall on a phone. | 那個味道，你也聞過。 / You know that smell. | 一個紅燈，90 秒 / One red light. Ninety seconds | — |
| 2 | 4.6–8.6 | 90→86 | Scooters ride in and brake: the nose dips, the suspension settles. A chip counts 機車 1 輛 … | 機車一輛一輛停下來。 / Scooters pull up, one after another. | — | `scn.dozen.drawn` |
| 3 | 8.6–12.4 | 86→82 | The box fills to 16. Petrol scooters shake at idle and puff. One rider's face shows. | 騎士在等，引擎沒熄火。 / The riders wait. Engines stay on. | — | same |
| 4 | 12.4–16.4 | 82→74 ▸▸ with the word 快轉 | Push in low behind the front row. Puffs leave each tailpipe at knee height and gather into the dark cores. | 廢氣就排在膝蓋的高度。 / The exhaust comes out at knee height. | — | — |
| 5 | 16.4–20.8 | 74→62 | Pull back. The layer has formed as the pack arrived and now **holds**. Close shot of the child covering her nose, held 2.5 s. | 車停著，廢氣一直補上來。 / They stay put. The exhaust keeps coming. | — | — |
| 6 | 20.8–27.8 | 62→50 | The number panel slides in and stays still. Line 1, 20 px or more: 這排機車多出來的一氧化碳　約 0.05 到 1 ppm　推估. Line 2: 街上原本就有　約 0.5 ppm　實測. | 路邊多了多少？這是推估。 / How much more at the kerb? An estimate. | — | `co.dozen.add`, `bg.co.traffic` |
| 7 | 27.8–31.8 | 50→44 | A card: one scooter from the side and a small head (home screen 2). One fume leaves the tailpipe and spreads back along the ground to the person; the face does not react. | 一氧化碳：沒有味道。 / Carbon monoxide: no smell at all. | — | — |
| 8 | 31.8–37.0 | 44→36 | The same scooter: wisps of fuel rise out of its tailpipe to the person's nose. | 臭味，是沒燒完的汽油。 / The smell is unburnt fuel. | 油氣裡有苯，會致癌 / The vapour carries benzene, which causes cancer | — |
| 9 | 37.0–40.2 | 36→30 | Nothing new is drawn: the caption says it. | 還有微粒，小到看不見。 / And particles too small to see. | — | — |
| 10 | 40.2–45.2 | 30→18 | Out to a close shot. A ruler slides in. A dashed line at tailpipe height; the pushchair band 55–85 cm shaded. A wisp of the fume is breathed in at every nose. **No bands in the haze.** | 排氣管和嬰兒車，都不到一公尺高。 / Tailpipe and pushchair: both under a metre high. | — | — |
| 11 | 45.2–48.8 | 18→10 | The wisps are breathed in again and again; the child's faster. | 小孩個子矮，呼吸又快。 / Children are shorter and breathe faster. | — | — |
| 12 | 48.8–52.0 | 10→4 | A wisp is breathed in at the front-row rider's nose; the camera nudges toward them. | 騎士也在這一層裡。 / The rider is in it too. | — | — |
| 13 | 52.0–58.4 | 4 ❚❚ | Freeze. Full-frame card A: a red pedestrian signal beside a tear-off day calendar whose pages flip away faster and faster (no dots). | 一個紅燈很短，可是天天等。 / One red light is short. But it is every day. | 一年約 12 到 55 小時 (chip 本站計算) / About 12 to 55 hours a year | `time.hoursPerYear` |
| 14 | 58.4–64.4 | 4 ❚❚ | Card A leaves. Card B, full frame: the body figure G6. The three marks travel their routes. **Nothing joins the calendar to the body.** | 長年吸車子的廢氣， / Years of breathing traffic exhaust | 長期研究，所有車輛，不只機車 / Long-term studies of all traffic, not scooters alone | — |
| 15 | 64.4–71.6 | 4 ❚❚ | Same card. The three pins light in turn. No organ fills or changes colour. | 和氣喘、心臟病、肺癌有關。 / are linked to asthma, heart disease, lung cancer. | 等一個紅燈就生病？沒有人證明過 / One red light making you ill? Nobody has shown that | — |
| 16 | 71.6–74.6 | 3→0, real time | Card off; the street resumes where it froze. | 快綠燈了。 / Nearly green. | — | — |
| 17 | 74.6–76.8 | green | Lamp swap, green bloom. The turn box goes first, then the rows; each scooter lifts its nose and throws one puff. The panel hides. | 綠燈。 / Green. | — | — |
| 18 | 76.8–80.8 | green | The camera pans with the pack. The cores leave with the scooters; the kerb's extra marks thin to the street's own air. The people cross. No number. | 機車騎走了，廢氣慢慢散。 / The scooters ride off. The exhaust thins. | — | — |
| 19 | 80.8–83.6 | card, 00→90 | The rewind card. | 同一個紅燈，再來一次。 / The same red light, once more. | — | — |
| 20 | 83.6–87.6 | 90→60 ▸▸▸ | Sixteen electric scooters glide in. No shake, no puffs. The street's own sparse air is still there. The panel reads 多出來的：0. A car passes with its own ribbon. | 這次，全部換成電動機車。 / This time, every scooter is electric. | — | — |
| 21 | 87.6–94.0 | 60→5 | The divider slides to the middle: 燃油機車 on one side with its layer, 電動機車 on the other. It holds 2.4 s, then slides out. | 沒有排氣管，就沒有那一層。 / No tailpipe. No layer of exhaust. | 其他車輛還是會排廢氣 / Other traffic still emits | — |
| 22 | 94.0–96.4 | — | Money card: a petrol and an electric scooter side by side. | 換一輛，要多少錢？ / What does one cost? | — | — |
| 23 | 96.4–103.0 | — | Two price tags drop in with real figures: 新北・報廢舊車　少付 10,388 元 (green); 高雄・沒有舊車　多付 14,480 元 (ochre). Chip 本站計算・{date}. | 補助扣完，有人少付，有人多付。 / After subsidies some pay less, some pay more. | — | `money.buy` (default), `money.worst` |
| 24 | 103.0–110.8 | — | Two bars: 加油 189 元, 在家充電 約 25 元. | 在家充電，一個月約 25 元。 / Charging at home: about NT$25 a month. | 加油約 189 元（每月騎 300 公里） / Petrol: about NT$189 (300 km a month) | `money.month[300]` |
| 25 | 110.8–115.2 | — | The electric corner, calm. The end card fades up. | 算算看，你換要多少。 / Work out your own numbers. | — | — |

**End card.** 算算我換要多少 → (primary, `/electric/`) · 再看一次 · 傳給家人（LINE） · 看完整的證據 · 把推估換成實測 (quiet link).

**Rule-based captions.** Beat 23: if no case in the table is cheaper, the caption is 現在買，電動機車比較貴。 with the quiet line 2027 年的補助還沒公布 when that is the reason. Beat 24's numbers come from the slot. If a beat's slot is missing the build fails.

### 8.2 Changes required of the prototype

Numbers and claims:

1. Replace every stand-in digit with the signed estimate. Remove the purple 原型・數字待換 tag and the "film prototype" header.
2. One number, not three: carbon monoxide only, one static range at 20 px or more, with the 推估 chip. No benzene row, no ultrafine row. The panel scales with the stage on a laptop.
3. The number does not rise. Delete `BUILDUP` as a driver of the counter and the caption 紅燈越久，積得越多. The layer forms as scooters arrive and then holds. At green the panel hides; it does not count down.
4. Rename the panel from 這群機車造成的 to 這排機車多出來的, and add the 街上原本就有 row.
5. Draw the street's own air (layer A of 5.1) in every scene, including before the red and in the electric replay. The layer never becomes an opaque band, never rises as a wall over heads and never tints the whole frame.
6. Make the haze dark and dense at the tailpipes and the first metres of kerb, thinning away from them (layer C), instead of a pale band across the whole width.
7. Remove the 50 / 100 / 150 cm banding and `ESTIMATE.profile`. Keep the ruler and the breathing at the noses (as built: wisps breathed in, no rings). No height-ratio chip.
8. "The tailpipe is level with the pushchair" becomes "both under a metre high" (beat 10).
9. Health beat: two separate full-frame cards (calendar, then body), about 19 seconds in all. No ribbon from the calendar into the lungs. Organs do not fill. Add the K5 quiet line. Label 12 to 55 hours 本站計算, not 推估.
10. Add the breathing and a caption for the rider (beat 12).
11. Money: replace the block stacks and the bouncing question mark with the two real price tags (beat 23) and add the running-cost beat (beat 24). No 示意圖 label on money.
12. The persistent tag 示意圖｜廢氣其實大多看不見 stays on screen in every street shot, not only at one moment.
13. The note under the player is rewritten to match what the film now does: the countdown is time-lapsed where 快轉 shows; how much is drawn where the people stand follows the site's estimate; the dark patches at the tailpipes are drawn for the eye.
14. The production build throws while any `standIn` flag is true (`BUILDUP`, `ESTIMATE`, `MONEY`), or better, the flags and stand-in objects are deleted.

Reading and wording:

15. Caption floor of 0.3 s per character including the quiet line; quiet lines at 15 px or more.
16. A speed control: 正常 · 慢一點 (0.75×).
17. Wording: 引擎沒熄火; 小孩個子矮; 機車騎走了; tags 燃油機車 and 電動機車; 車子的廢氣. No 車隊, no 車流廢氣.
18. Open on the smell and on people, not on an empty street (beat 1). Hold the close shot of the child covering her nose (beat 5).
19. One LED clock on screen at a time; the in-scene one is not cropped by the frame edge. The ▸▸ mark carries the word 快轉 the first time it appears.
20. Controls 48 px. End card gains 再看一次 and 傳給家人（LINE）.
21. The poster and the share image use the ruler shot (beat 10), not the veiled wide shot.

Delivery:

22. Keep what works: no autoplay, poster with Play, exact scrubbing, keyboard control, transcript with seek buttons, a polite live region, stills without JavaScript and for reduced motion, the fit at 320×568 and on a laptop, dark theme.
23. Each transcript line carries its chip and a link to its evidence (the mapping table in `INTEGRATION.md` §4, updated for the new cues).
24. Export a vertical MP4 (1080×1920, captions burnt in, Chinese and English) from the same timeline: capture frames with Playwright, encode with `ffmpeg`, commit to `public/film/` with a manifest and a `--check` mode like the share cards. The LINE button shares the page link; a second button 下載影片 offers the file.
25. A build-time guard replaces `checkTimeline`: cue lengths, the reading floor, increasing times, a non-increasing LED from 90 to 0, the drawn pack equal to `scn.dozen.drawn`, and no `NaN` in any still.

### 8.3 Share card text

Title 一個紅燈 / One red light. Answer: 紅燈那 90 秒，一整排機車的廢氣就排在膝蓋的高度；換成電動的，那一層就沒有了。 / For ninety seconds of red, a whole row of scooters puts its exhaust out at knee height. Make them electric and that layer is gone. Caveat: 畫面是示意圖；多了多少，依本站推估，不是實測。 / The picture is an illustration. How much is added follows this site's estimate, not a measurement.

---

## 9. Build order, file ownership, acceptance

### 9.1 Lanes: who owns which files

No two lanes edit the same file. A lane that needs a change in another lane's file writes the request in its hand-over note and the owner makes it. `docs/redesign-brief.md` (a copy of this brief, committed by the integrator in phase 0) is the shared reference.

| Lane | Owns (only this lane edits these) |
|---|---|
| **A · Data** | `src/data/**` except `src/data/econ/**` and `src/data/facts-economics.ts`; `scripts/check-data.mjs`. Reads `research/**`. |
| **B · System** | `src/styles/tokens.css`, `global.css`, `fonts.css`; `src/layouts/**`; `src/components/shell/**`; `src/components/ui/**`; `src/components/uid.ts`; `src/i18n/ui.ts`, `src/i18n/index.ts`, `src/i18n/pages/_copy.ts` |
| **C · Art** | `src/components/art/**`; `src/styles/art.css`; `src/i18n/art.ts` |
| **D · Charts** | `src/components/charts/**`; `src/styles/charts.css` |
| **E · Home** | `src/pages/[...lang]/index.astro`; `src/components/pages/home/**`; `src/i18n/pages/home.ts` |
| **F · Film** | `src/pages/[...lang]/90.astro`; `src/components/pages/film/**`; `src/i18n/pages/film.ts`; `scripts/film-*.mjs`; `public/film/**` |
| **G · Estimate and evidence** | `src/pages/[...lang]/estimate.astro` (new), `unmeasured.astro`, `evidence.astro`, `sources.astro`; `src/components/pages/estimate/**` (new), `src/components/pages/evidence/**`; `src/i18n/pages/estimate.ts` (new), `evidence.ts`, `sources.ts`, `unmeasured.ts` (delete) |
| **H · Questions** | `src/pages/[...lang]/questions/**`; `src/components/pages/questions/**`; `src/i18n/pages/questions.ts` |
| **I · Money** | `src/pages/[...lang]/electric.astro`; `src/components/pages/electric/**`; `src/lib/calc/**`; `src/lib/site-state*.ts`; `src/lib/home-money.ts` (new); `src/data/econ/**`; `src/data/facts-economics.ts`; `src/i18n/pages/electric.ts`, `money.ts` |
| **J · Outreach** | `src/pages/[...lang]/act.astro`, `about.astro`, `problem.astro`, `print/**`; `src/pages/404.astro`; `src/components/pages/action/**`; `src/i18n/pages/act.ts`, `about.ts`, `share.ts`, `not-found.ts`; `src/lib/share-cards.ts`; `scripts/build-share-cards.mjs`; `public/share/**` |
| **K · Integrator** | `astro.config.mjs`; `package.json`; `scripts/check-copy.mjs`, `scripts/check-site.mjs` (new), `scripts/build-display-font.mjs`, `scripts/display-font.mjs`; `src/i18n/copy-allowlist.json`; `src/styles/fonts/**`; `src/pages/[...lang]/styleguide*.astro`; `src/components/styleguide/**`; `docs/**`; `README.md`; `.github/**` |

### 9.2 Order

**Phase 0 — contracts (A, B, C, I, K; before anyone else starts).**

- A: `src/data/estimate.ts` with every slot of 3.3 and its equality check against `results.json`; the new evidence kind `estimate`; `readerKind()` mapping to the five chips; `src/data/answers.ts` replacing `gaps.ts` (keep `gaps.ts` exporting until phase 3); new registry facts (traffic-station and Taipei roadside carbon monoxide; pedestrian wait; child air per kilogram; the three route facts; Liou and Wu 2021; the inspection share; the nine mask facts); retire the claims rule `no-tw-pedestrian-red-light-study` and add one rule per banned claim in 4.6; drop `whoCouldMeasure` from `check-data`; fill the blank chart points (2018 fleet total; 2015–2018 and 2020 electric share) from the transport ministry's registration statistics, or start those series at the first year with a figure, and delete the notes that say a point is blank.
- B: tokens (type, floor, tap), `Screen`, `ScreenRail`, `KindChip`, `EstimateValue`, `HowSheet`, `NextButton`, `ScenarioSwitch`, `TextSize`, the new menu, the hash-carrying `Redirect`, shared strings in `ui.ts` (chips, scenario names, the tag, the K sentences).
- C: `air.ts` with its constants exported, and `parts.ts` additions.
- I: `home-money.ts` with its types; the corrected 2027 fact (`econ-no-2027-programme`: nothing confirmed, a draft pre-announced).
- K: commit this brief as `docs/redesign-brief.md`; mark `docs/editorial-blueprint.md` superseded; take the style guides out of production; add `scripts/check-site.mjs` with the checks of 9.3 (failing is expected until phase 3).

**Phase 1 — in parallel (all lanes).** C draws the scenes; D builds the charts; E builds the home page on B, C, D; F ports the film; G builds `/estimate/` and reworks `/evidence/` and `/sources/`; H the question pages; I the calculator's opening state; J `/act/`, `/about/`, print pages and share-card text. Each lane removes its own use of the components listed for removal.

**Phase 2 — integrate (K, with each lane fixing its own files).** `npm run check` and `npm run build`; run `scripts/check-site.mjs`; phone screenshots of every page at 320, 360 and 390 px in both languages, both themes, 標準 and 特大 (use `emulateSystemFont` from `/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/lib.cjs` so Chinese renders in a phone font).

**Phase 3 — clean up and render (K, then J and F).** Delete the removed components and `gaps.ts` once nothing imports them; refresh `copy-allowlist.json` (the stale reasons at the lines the inventory lists); re-render all share cards and the film card; export the MP4; run `npm run headline-font` and commit `src/styles/fonts/` because every headline changed; the four reader walk-throughs.

### 9.3 Acceptance checks

**Automated (`scripts/check-site.mjs`, run on `dist/` in both languages).**

Text:

1. The strings 沒人量過, 多濃沒人量過, 無資料, 待確認, 待補, 示意數據, 示意文字, 樣稿, 原型, 數字待換, 倒數暫停, "sample data", "placeholder", "prototype", "to be confirmed", "no data", "lorem", "TODO" appear in no page's text, alt text, aria-label or meta.
2. 沒有人量過, 還沒有人, 沒有人證明過, 算不出來, "not measured", "never been measured", "nobody has measured", "nobody has shown" appear only as the K sentences of 7.1, only on the pages listed there, and at most 25 times across the whole site per language (today: 1,016 across both).
3. No banned claim of 4.6 (the copy check's new rules): no 倍 beside a background value in a headline; no 越久越多 or 積得越多; no 1.7 or 2.2 倍; no 吸得最多; no 違規 or 合法 near 怠速; no 車流廢氣, 車隊, 最髒, 愈, 稅減.
4. Every element with `data-kind="estimate"` contains 約, a range (到 / "to"), the 推估 chip, and a link or button that reaches `/estimate/#…`. No estimated value appears as a bare number.
5. No air number in `dist/` is absent from `estimate.ts` or the registry (compare the numbers printed beside ppm, ppb and µg/m³ with the slot table).
6. Every fact marked `requiresCaveat` that a page uses appears with its caveat in that page's sheet.

Structure:

7. The routes of section 2 exist in both languages. `/unmeasured/`, `/questions/how-much/` and `/questions/electric/` are redirect pages with a canonical link to their target. `/styleguide/` and `/styleguide-art/` are not in `dist/`. No internal link or `#anchor` is dead.
8. No `EmptyChart`, `kind="unmeasured"`, `hatchBand` or `standIn` remains in `src/`.
9. The home page has exactly 14 `Screen` articles; each headline is at most 22 Chinese characters and each body at most 45; at 360×740, 標準, each screen is at most 850 px tall and the whole page at most 11,500 px (today about 31,000).
10. Pictures and charts cover at least 45% of the home page's height at 360 px.

Reading and touch (Playwright, computed styles):

11. No visible text node on any page computes under 14 px at 320, 360 and 390 px. Body text computes at 18 px or more.
12. Every link, button and form control is at least 48 × 48 px, with 8 px between neighbours.
13. No horizontal scroll and no clipped text at 320 px, at 標準, 大 and 特大, in both languages. No headline breaks inside a word (checked against the phrase list in `Phrased`).
14. Contrast: body 7:1, labels 4.5:1, meaningful marks 3:1, in both themes.
15. With JavaScript off, every screen shows its picture, text and sheet content; the film page shows its stills and transcript.
16. With `prefers-reduced-motion`, nothing moves until asked.
17. Every scene's alt text contains 示意圖 / "illustration". Every scene shows the tag of 5.1.

Film:

18. The stage, caption and controls fit at 320×568, 360×640, 390×844, 768×1024 and 1280×720 with no sideways scroll.
19. Every cue meets the reading floor; quiet lines compute at 15 px or more; controls at 48 px.
20. The picture draws exactly `scn.dozen.drawn` scooters; the same number appears on home screen 1.
21. Seeking to a second by jumping forward, jumping back or playing through gives the same picture.
22. The MP4 exists for both languages and its manifest check passes.

Money and dates:

23. `/electric/` with no parameters shows a worked result; with `?county=kaohsiung&scrap=no&km=500` it shows that result and the line naming what was chosen.
24. Building with the date set to 2026-12-01 and to 2027-01-01 produces no stale sentence, no blank and the strip of 7.7.
25. Calculator tests (`npm run test:calc`, `test:lib`) pass; figures on home screens 12 and 13 equal the engine's.

After deploy: canonical links, `og:url`, `og:image`, the sitemap and QR codes start with `https://likelylabs.com/scooterair/`.

**By hand: the four readers (section 6.7).** One person per reader, on a real phone if possible, Chinese first, then English:

- Ten-year-old test: with all text covered, can the tester say what each of the 14 screens is about from the picture?
- Parent test: all 14 headlines read in under three minutes; own county's price reached in two taps from screen 12.
- Seventy-five-year-old test: at 特大 on a 320 px phone, every screen readable at arm's length; the whole page crossed using only next buttons.
- Rider test: read every sentence as a rider. Nothing accuses; screen 9 and screen 11 are reached before any price.
- Reporter test: pick five numbers at random on any page; each reaches its source or its working in two taps.

---

## 10. How each "must fix" from the judges is resolved

| Judges' point | Resolution |
|---|---|
| Rebase everything on the signed estimate; remove box-model figures, 0.35 g a minute, 3 / 9 / 27 | Section 3.3; all air numbers come from `results.json`. |
| Never print what the pack adds beside a measured total | 4.2 rule 5; screen 4 shows "already there" and "added" as two labelled rows; screen 5 plots totals. |
| No ultrafine estimate, no WHO particle-number comparison; dots do not scale | 4.6; 5.1; `/estimate/` uses K2 and K3. |
| Estimate is for an adult's nose; no child-height number; drop 1.7–2.2 | Screen 8; 4.2 rule 6; K4. |
| No build-up animation; green burst with no number | 5.1 "nothing changes with time"; film changes 3 and beat 18; K6. |
| Riders never "the most"; rider visible; a rider screen; 這不是誰的錯 | Screens 1, 8, 9; film beat 12. |
| "Carbon monoxide up means everything up" is wrong | Screen 5's quiet line is limited to fresh fuel vapour and benzene. |
| Recipe sheet must compute or be a plain flow | 4.5. |
| State the cross-check truthfully; three sites, not ten | 4.5 paragraph; screen 5 row label. |
| Confidence by pollutant; benzene less prominent | 4.2 rule 9; benzene numbers only on `/estimate/` and `/evidence/`. |
| No "no wind" or distance control; `beside-me` qualitative | 7.5. |
| Route lines need checked facts | Screen 6 pins ship only with facts. |
| Kaohsiung study out of the headline path; add dose arithmetic | Screen 7. |
| Long-term signpost wording; cohort studies not 實測 | The 研究 chip (4.1); screen 6 and 7 wording. |
| Background in every drawing, a key, low and high ends visible, a persistent tag | 5.1 (superseded 2026-11-27: fume only, no key; the tag stays). |
| One WHO value (100 mg/m³, about 87 ppm), checked | Slot `who.co15min_*`; section 11. |
| Can comparison recomputed from the fleet mean, as a range | Screen 2 chip; slot `emit.co.perRed_can`. |
| Swap percentage labelled as arithmetic assuming equal scooters | Screen 10 chip. |
| Story label wherever named characters appear | No named characters. |
| Health picture must not label disease on a child's chest under a countdown | Screen 6: adult, routes not diseases, no street, K5 on the same screen; the rail has no seconds. |
| Hero cloud must not hide people; mark contrast | G1; 5.1 (as built: wisps and leader lines at 3:1, check 14). |
| Screen 6 of the base: one pollutant, zoom-out strip, a worded button | Screen 5; the foot button is always 怎麼知道的？ in words. |
| Headline line breaks; mock-ups at 特大 | `Phrased`; check 13. Phase 2 screenshots at 特大 replace the missing mock-ups. |
| One set of scooter counts | `scn.*` everywhere; 16 drawn on the page and in the film. |
| Wording list (越, 車子的廢氣, 輛, 排最多的一成, "一天到一天半") | 6.6; screen 7's body follows its arithmetic. |
| The countdown rail confuses | No seconds on the rail. |
| No empty slot, no magenta box; a fallback for each screen | 3.3; the build fails on a missing slot; rule-based sentences cover every outcome. |
| Cut to 11 or 12 screens | Two diagram screens are folded away (the count into screen 1, the plan into screen 3) and the four-tab ruler is reduced to a three-row strip. The page lands on 14 because all three judges also required a rider screen and a not-switching screen, and the owner asked for both price and running cost. The length guard is check 9. |
| Money screens must lead with the route to parity; the picture must not say "electric costs more" | Screens 12 and 13: a personal figure first, home charging against petrol as the largest marks, break-even line, the unfavourable case on the same screen. |
| Dates: 30 November, 31 December | 7.7; check 24. |
| Nothing unfinished ships; style guides out; About without blanks; body contrast | Checks 1, 7, 11, 14; 7.8. |
| Film: all points | 8.2, items 1 to 25. |
| One picture grammar and one sentence across page, film, cards, poster | `air.ts`; section 1; 7.9. |

---

## 11. Things that need a person

None of these blocks the build; each has a stated fallback.

| Item | Who | Fallback until done |
|---|---|---|
| Sign off the derived values `co.few.total`, `co.full.total` and `emit.co.perRed_can` | Estimate owner | `/estimate/` shows totals for the dozen only; screen 2's chip prints grams instead of the can (section 3.3). |
| Check `who-benzene-no-safe-level` and the WHO 15-minute carbon monoxide value against the WHO texts | Lane A | Screen 2's quiet line is omitted; the zoom-out strip needs the value, so this check comes first. |
| Three route facts for screen 6 from primary sources | Lane A | A pin without its fact is left out. |
| Liou and Wu 2021 opened and entered as a fact | Lane A | Screen 10's sheet omits the national figure. |
| Contact, licence, and funding or independence statement | Owner | Those sections of `/about/` are left out. |
| Whether the campaign will pay for a measurement | Owner | `/estimate/#measure` does not mention funding. |
| Watch the film at full speed on a real mid-range phone | Anyone | The frame-rate figures so far come from a throttled headless browser. |

---

## 12. Integrator amendments (2026-11-26) — these override anything above that conflicts

**12.1 Sign-offs.** The three derived values in section 11 are approved.
- `co.few.total` and `co.full.total` are printed by the signed model itself (`research/estimate/results.json`: 0.2 / 0.4 / 1.0 and 0.4 / 1.0 / 2.2 ppm at one significant figure, from 0.19 / 0.45 / 1.0 and 0.40 / 0.95 / 2.2). They may be shown on `/estimate/`.
- `emit.co.perRed_can` is approved as arithmetic on the signed fleet-mean idle rate: 15 g/h (8–27) ÷ 40 reds an hour = 0.4 g (0.2–0.7 g) of carbon monoxide per 90-second red; at 25 °C and one atmosphere that is 0.34 L (0.18–0.59 L), i.e. about one 330 mL can (half a can to nearly two). Screen 2 uses the can. Its chip is 推估, and its sheet shows this arithmetic.

**12.2 Masks: one more home screen, one film beat, one question page.** The owner asked: "a lot of people in Taiwan wear surgical masks or other basic masks — we need to warn about the ineffectiveness of those". Verified research is in `research/masks/VERIFIED.json` (nine facts, the warning text in both languages, the four-row table, the must-not-say list). Lane A enters the nine facts and their sources in the registry.
- **The home page has 15 screens, not 14.** A new screen goes between "騎士也在裡面" and "換掉": **Screen 10 · 口罩擋得住嗎** (the later screens move down one; the rail counts `n / 15`; the red part of the rail runs to screen 12 and green from 13). Wherever this brief says 14 screens, read 15; acceptance check 9 becomes exactly 15 `Screen` articles and at most 12,300 px at 360 × 740.
  - **Picture G17.** A face in profile, in the signal-figure style, wearing an ordinary surgical mask. A cloud of fume arrives from a tailpipe at the left: the gases (carbon monoxide) go on through the mask, drawn as a faint haze in the airway; the orange wisps (fuel vapour, benzene) pass through to the nose; a sooty patch builds up on the mask's front (the particles it stops), and on a loose mask the fume curls in round the edges at the nose and cheek (two small arrows). A four-way switch under the picture changes the mask: 布口罩 · **醫用口罩** · 活性碳口罩 · 貼合的 N95. The gases pass through all four. With the activated-carbon mask a few wisps stop at the mask and the rest pass. With the fitted N95 the soot is darkest and nothing leaks at the edges. Default 醫用口罩.
  - **Headline.** 醫用口罩擋不住機車廢氣 / A surgical mask won't stop scooter exhaust
  - **Body.** 廢氣裡的一氧化碳和苯是氣體，一般口罩擋不住氣體。細小的微粒，也會從口罩邊緣漏進去。 / The carbon monoxide and benzene in exhaust are gases, and ordinary masks do not stop gases. Fine particles also leak in round the edges.
  - **Q.** 口罩防感冒、流感還是有用。 / A mask still helps against colds and flu.
  - **Chips.** 官方 (NIOSH statement, `mask-niosh-no-gas`) and 研究 (`mask-asworn-vandersande`). The sheet carries the four-row table from VERIFIED.json, each cell backed by its fact, and the two Taiwanese tests (`mask-carbon-mol-2005` with its date, `mask-ilosh-taiwan` as a comparison between masks, not percentages).
  - **Next.** 那這一團，可以變小嗎？↓ / So can the cloud be made smaller? ↓
  - Obey the must-not-say list in VERIFIED.json: never "masks are useless"; never a filter-material percentage as protection as worn; never that activated-carbon masks block exhaust or carbon monoxide; no advice to put N95s on children.
- **Film.** Add one beat of about four seconds after the "what is in it" beats and before the heights beat: the same profile face with a surgical mask, the fume flowing to it and on through it, soot gathering on its front. Caption 一般口罩，擋不住這些氣體。 / An ordinary mask does not stop these gases.
- **`/questions/mask/`** as in section 2, built from the same facts and G17.
- **`/act/`:** the pedestrians' card includes one line: 口罩擋不住廢氣裡的氣體；能做的是別站在車陣正後方。 / A mask does not stop the gases in exhaust; what you can do is not stand right behind the pack.

**12.3 Distance.** Advice about standing back is qualitative only ("離機車遠一點", "別站在車陣正後方"). No metres, no "halves your exposure": the signed method rules out a distance rule.

**12.4 The health case, stated once so every lane tells it the same way.** The signed estimate says one red light beside a dozen scooters adds about as much carbon monoxide as the street already holds, far below short-term limits. The site does not claim one red light is dangerous. The case it makes is: (1) the smell is real and it is unburnt fuel carrying benzene; (2) it is at child height, a step or two away; (3) it repeats every day, and people who work at the kerb stand in it for hours; (4) years of breathing traffic exhaust are linked to asthma, heart disease and lung cancer; (5) scooters are a large share of the country's fuel-vapour and carbon-monoxide emissions (about 10% and 15.6%); (6) a tenth of scooters account for about a third of the carbon monoxide; (7) an ordinary mask does not stop the gases; (8) an electric scooter is one tailpipe fewer. Push these as hard as the facts allow and no harder. *As built 2026-11-27 (§13): the signed 3-D simulation adds that (1) the smell is above what people can smell for most of the red when the wind blows from the scooters, (2) carbon monoxide comes in second-long bursts near a tailpipe, (3) for people who stay an hour with the wind from the scooters benzene is about 1 to 4 times California's 1-hour reference, and (4) one case passes the WHO 15-minute value: a pushchair half a metre behind one tailpipe in near-still held air, every red for 15 minutes (low confidence, rare). "Far below" stays only for one red light, after conversion to a 15-minute average.*

**12.5 Notes left for lane owners by earlier fixers** (things in your files that must change because the registry, the calculator or shared components were corrected today) are in the `forOtherOwners` lists of `registry-evidence-results.json`, `calc-electric-results.json` and `shared-build-results.json` under the session scratchpad folder `fixes/`. The review's raw findings for the old pages are under `findings/` in the same scratchpad. Read the ones for your lane; most concern copy that this redesign replaces, but any factual correction in them still applies.

**12.6 Working in a shared tree.** Several lanes edit at once. Edit only your lane's files, with targeted edits. Never commit, push, or run `npm run build` (it writes `dist/`). To check a build, build into your own scratch folder; if another lane's half-finished edit breaks the build, build from a scratch copy of the last commit plus your own files, and say so in your hand-over note.

**12.7 Decisions on the scenes (2026-11-26).**
- The opening street scene (G1, G14) draws sixteen scooters in three rows beside the kerb and does not paint the stop box and the turn box: that geometry does not fit a side view at a size where the people stay recognisable. The true layout is shown from above on G3. Accepted.
- The diagram scenes G2, G6, G11 and G17 leave out the street's own sparse air (layer A), because every mark in them is placed to explain something. Layer A stays in every street scene. Accepted.
- G7 (the road of time) lives in `src/components/art/` with the other scenes.

---

## 13. As built (integrator, 2026-11-26) — what differs from this brief, and why

This section records the first release as it was built. Where it differs from the sections above, the site follows this section.

**Money figures.** The calculator engine was corrected on 2026-11-26, so the "Now" column of 3.3 is out of date. On 26 November: 新北・有滿 10 年的機車可報廢 少付 2,120 元 (EZZY 44,580 against Jog 125 46,700); the least favourable case is 高雄・有舊車・白牌 多付 15,880 元, so screen 12's second sentence is built from `money.worst` and never assumes 「沒有舊車」; at 300 km a month petrol is about 194 元, home charging 22–28, the cheapest swap plan 518, pay-as-you-go 504. From 1 December (the petrol offers end) the default case is 少付 11,520 元; from 1 January 2027 少付 6,588 元 with no electric subsidy. Break-even names its own home-charging scooter, because the cheapest green-plate scooter can only swap batteries.

**Wording forced by the registry.** 「有舊車可報廢」 became 「有滿 10 年的機車可報廢」 (claim rule `r12-scrap-age-wording`). The 2027 strip reads 「2027 年的補助還沒有確定。下面先用沒有補助的價格算。」, not 「還沒公布」: a draft was pre-announced on 11 November (fact `econ-no-2027-programme`). The English gloss of 4.2 rule 8 reads "This is worked out, not read off an instrument, so we give a range": "not measured" is reserved for the K sentences (7.1), and the owner asked for less of it.

**The screens.** Fifteen screens as 12.2 says. Screen 7's signposts read the study's own numbers (5 minutes, 55 people) from the registry. The opening street (G1, G14) draws three rows beside the kerb and leaves the stop box and turn box to G3 (12.7). G2, G6, G11 and G17 leave out the street's own air (12.7).

**`/electric/`.** It opens on the worked result (7.7). The subsidy status of every place is one chip from one legend: 還有名額 · 有條件 · 剩多少名額沒公布 · 已用完 · 已截止 · 今年補助查不到，請打電話問 (the last with its date; the sums then use central money only). Round 3 renamed two chips: 官網沒有公布名額 contradicted tiles that list the plan's places, and 查不到官網 contradicted tiles that link the bureau's site. The registry's long status note for each place sits under a closed 「我們查到的」. The long reference blocks below the calculator (closing the gap, worked examples, the checklist, running costs, charging, who it suits, risks, not switching yet, our asks, questions, sources) are folded: their titles show, a tap opens them, and a link to any of them opens it. The places whose official site could not be reached were not re-checked in this pass (no network access to those sites from the build machine); their chips say so with the date.

**Removed in phase 3.** `StreetScene`, `SceneCompare`, `Haze`, `PollutantKey`, `SignalCycle`, `EmptyChart` and `charts/core/empty.ts`, `CountdownRail`, `Chapter`, `ChainMarker`, `ChainStrip`, `ChainLink` (ui), `EvidenceChain`, `pips.ts`, `TimeLadder`, `QuestionChips`, `PullQuote`, `NotClaimedList`, `StanceBox`; the old air functions in `parts.ts` (`hatchBand`, `ringsInBand`, `stipple`, `fumes`, `coRings`, `ufpDots`); the old strings of those components in `ui.ts` and `art.ts`; `src/data/gaps.ts` (each answer in `answers.ts` keeps its former gap id as a record). The style guides were rewritten on the new components (dev only).

**The acceptance checks, as implemented** (`scripts/check-site.mjs`). Check 9 counts Han characters only and, of switch variants, only the longest, as `ui/screen-limits.ts` does. English has its own height budget, the Chinese one × 1.2 (1,020 px a screen, 14,760 px in all), because English runs about a fifth longer at the same size and 6.5 forbids cutting it below the Chinese. Check 3 does not read struck-through text (the corrections log and "what we will not say" quote a claim in order to refuse it). Check 6 compares caveats after 臺 → 台 (official names such as 平臺 stay in the registry). Checks 11 and 14 treat a source line (class `src`) as a label. Check 12 does not compare a bar fixed to the screen with what it covers.

**Share cards.** The address printed on every card is the live one, likelylabs.com/scooterair. The redirect pages `/questions/how-much/` and `/questions/electric/` keep their own card in their head, so an old share still shows a picture; `/electric/` uses the money card.

**The film.** Lane F handed over before this release closed (handover F-phase1b), so the film (`/90/`) is in it: 2 minutes 1 second, 26 cues, the mask beat of 12.2, the price tags and running costs from `home-money.ts`, and the vertical MP4 in both languages (`public/film/`, checked by `node scripts/film-export.mjs --check`, now part of `npm run check`). Its share card still uses the heights picture (the ruler shot drawn by the site's own scene) rather than a frame photographed from the film. Since round 2 the drawn tailpipe sits at 50 cm, the registry's model setting (`iot-exhaust-height-assumption`), in every scene, the share cards and the film, and the MP4s were rendered again from that drawing.

**Round 2 (2026-11-26).**
- *Subsidies.* Changhua and Keelung are now `verified`: their own 2026 plans were re-opened and read on 26 November (sources `changhua-epb-2026-plan`, `keelung-epb-2026-plan`), which added the age-18 and registration rules, Keelung's 30 November / 15 December dates and Changhua's five-year rule for scrapping a two-stroke only. Nantou's amounts now cite the bureau's own news item of 8 April 2026. Taoyuan's notice was re-checked (no change). Still `partly-verified`: Taoyuan, Hsinchu City, Hsinchu County, Miaoli, Nantou, Chiayi City, Chiayi County, Pingtung. Still `not-verified`: Hualien, Taitung, Penghu, Lienchiang (no 2026 source; their bureau sites gave HTTP 503 from the build machine). Every status note and quota line now says what a reader can do (central money is still counted; the bureau's phone number where one was found on an official page), never "unknown". Findings that rest on news reports (Chiayi County's deadline, Chiayi City's top-ups) are named with their date. The wrong Hsinchu County link (it pointed at the Hsinchu City bureau) was removed; the county's subsidy line from the MOEA table is given instead.
- *Sources.* The estimate's two incomplete citations are identified and re-opened: 張勝雄、張耕碩 (2014), 交通學報 14(1) (`chang-chang-2014-jts`, a review, so secondary: 2.2 m² net area per stopped scooter, about 3.2 m² wanted) and 洪子晽's 2017 NCKU thesis (`hong-2017-ncku-thesis`, abstract). Both are listed with the estimate's sources.
- *Evidence side (lane P1).* `/evidence/` shows each link as claim, one key number and one chart, with the rest behind one 48 px fold (13,912 px in Chinese at 360 px); about 190 registry statements and caveats were rewritten in plain words; the corrections log on `/about/` is a dated list; answer cards and `/sources/` name a topic instead of 「第 N 環」.
- *Pictures (lane P2).* Money and electric share cards are one picture, one headline, one worst-case line; square cards leave room under the picture for its 示意圖 tag. (Release 2 replaced these: no square cards, no number on a card; see the end of this section.) The long closing alt sentence is read once per page. `/electric/`'s opening shows the swap plans of the scooter on show.
- *Wording.* The idling rule: the registry now says the same thing everywhere (on the text, 汽車 includes motorcycles under the Air Pollution Control Act; no official statement says how the idling rule applies to scooters or whether a red light counts). Data tables never print a lone dash or an empty cell: a missing year says 「這年沒有目標」/「還沒到這一年」, a sparse notes column folds into the row label, and the monthly-cost table says 「不用付」.

**Left for a person.** The deploy workflow passes the live address. Since round 3 a build without `SITE_URL` prints the live address too (`https://likelylabs.com/scooterair/`: origin likelylabs.com and a public prefix `/scooterair` in front of each path, `src/lib/abs-url.ts`), so no build can send a LINE message or canonical link to `scooterair.tw`; the share cards print the live address whatever the build. The letter composers on `/estimate/#measure` and `/act/` show 〇〇 where the reader has not typed yet; they are fill-in fields, not missing data. No test on a real phone was made in this pass.

**Round 3 (2026-11-26, fixer).**
- *One rule for "which electric scooter".* The calculator's own suggestion is now the scooter that is cheapest to buy and fits the answers (ties by five-year total), the same rule as the /electric/ opening, home screens 12–13 and the break-even, so the same county and scrap answer give the same scooter and the same figure everywhere (it used to pick the lowest five-year total: Kaohsiung with a scooter to scrap read 少付 1,288 at the top and 還差 880 below). The least favourable case says what it covers: the cheapest model each time. The opening's monthly line says it counts fuel and battery fees only. Home screen 13's swap rows name their scooter and plan.
- *Registry.* The Institute of Transportation CO statement now says 10 junctions in all, six in July 2024, three with waiting-area peaks, and names the junctions of the waiting-area / median-strip comparison. The 34 scooters per red is labelled our arithmetic in the answer itself. Nantou's NT$2,500 scrap-only payment is counted for a petrol scooter built by 30 June 2007 (the bureau's own definition in its 8 April 2026 news item and the MOEA table) and its subsidy line is 049-2238573. Chiayi County: no separate low-income amount is published (not "none"). Amounts not published print 「金額沒有公布，請問環保局」, never 0 元.
- *Sources.* The 59 entries that showed a description in brackets now carry the original headline, read from each page on 26 November 2026 (and eight more publication years). Sources the calculator's data cites say "used in: the electric-scooter calculator and local subsidies". Chang & Chang (2014) shows readers that it is a review and names the 2001 paper its figures come from.
- *Words.* English says petrol throughout. Hard words (PM2.5, 超細微粒, 元素碳, 苯, ppm, 微克) are explained in one line under the title of each question page and /act/. The HEI health chart, the emission bars and several /evidence/ captions are in plain words; 次級來源 reads 只在轉述中看到.
- *Layout.* A closing mark (，。？) never starts a line on its own in headings, buttons, links, fold titles and list items (a build step glues it to the character before). /estimate/ folds its method sections. Tap targets on /electric/ are 48 px. The square share cards keep at least 46% of their height for the drawing.

**Round 4 (2026-11-27, wording and structure; three lanes and the integrator).** No number, unit, date, name, source id, data key, hedge or claim strength was changed.
- *`/sources/` (lane S).* Grouped by question, not by kind: the seven links of the chain, 本站的推估, 口罩擋得住什麼, 錢和補助, 背景和不能說的話, each a closed fold with its count and a one-line summary. Each source is listed once, under its main group; the rule that picks the group is in `src/components/pages/sources/groups.ts` (calculator data → money; a mask fact → masks; otherwise the link most of its facts sit on; estimate only → estimate; otherwise background), with "also used for" links to its other groups. Every source has one plain "what we use it for" sentence (`src/i18n/pages/sources.ts`, both languages, checked by check-copy; it names a topic, never a figure). A text filter (JavaScript only) replaces the old radio filter. `/sources/#<id>` opens the right group with and without JavaScript. The read-level labels are plain words (they also show on `/evidence/`). Eleven publication years that printed n.d. were read from the documents themselves on 26 November 2026; twelve keep n.d. because the document prints no year (or only the review year), and `artc-phase-6-7-explainer` could not be opened.
- *`/electric/` (lane M).* The default view is: the opening (three questions, three answers, price bars), then the five questions, then the result (the same three answers, the scooters compared, one break-even chart), then folded working. The three answers — 買的那天差多少 · 每個月差多少 · 幾年打平 — are printed by one function from one engine path in both the opening and the result, so they agree character for character; every other figure is labelled as a part of one of them. The monthly answer is the five-year average of all running costs. When a battery plan has a setup fee, the monthly answer now says that the fee is spread over that average too, so the reader does not add the day-one fee twice (the engine is unchanged). The home page's fuel-only monthly bars (screen 13) are a part of the 每個月差多少 answer, not a competing figure. Source chips read 「publisher, year：short title」 from a new registry field, `shortTitle` (68 sources the calculator cites; our short name for the document, no figure the title does not carry). The like-for-like note (`src/lib/calc/evaluate.ts`) is in short sentences and drops its class sentence when the scooter's performance text already says it.
- *Registry and `/evidence/`, `/about/`, `/estimate/` (lane W).* About 520 strings rewritten in both languages: flagged strings 523 → 21, Chinese word-list breaks 263 → 5 (each one a sentence that quotes or refuses a word), Chinese sentences over 30 characters 349 → 17 (31–32 characters, mostly a study's name in brackets), English flags and over-long sentences 0. Statistical terms carry a plain gloss in the same string (顯著, 勝算比, 信賴區間, 四分位距, 中位數, R²). 模擬 → 電腦推算 (chart day labels 電腦推算第 N 天); 粉塵 only for tyre, brake and road dust.
- *The yearly red-light hours, one figure everywhere.* Home screen 7, the film, the one-red-light share card and `/questions/one-red-light/` all quote four red lights a day as the default: 24 to 36 hours a year (time.hoursPerYear[4]). Home screen 7 adds the assumption as its second sentence, 「每個紅燈算 60 到 90 秒。」 / "Each light counted as 60 to 90 seconds." (`ui.ts` estText.redHours, printed by `redHoursSentence`); its picture already prints 約 24 到 36 小時. The film's quiet line reads 「一天 4 個，一年 24–36 小時」 (it used to give the whole 2–6 lights span, 12–55 hours); the caption limit is 20 characters, so the same assumption sentence is printed under that line in the film's transcript. The question page keeps its stepper sentences; its 45-character body limit leaves no room for the assumption, which its sheet's working shows.
- *Folded sections open from a link without JavaScript.* `Section` with `fold` now puts its id on an empty anchor inside the `<details>` (Chromium opens a closed `<details>` by itself only when the link's target is inside it) and keeps the fold's title in view. This fixes every folded section on `/estimate/` (#recipe, #count, #range, #drawing, #limits, #answers) as well as `/electric/`.
- *Words never break inside themselves.* `src/lib/glue.mjs` wraps each two-to-four-character word (as the browser's word segmenter finds it), with a closing mark or 注音 after it, in `.nobr`: in `Phrased`, in the home page's browser-drawn headlines, and in the build step over headings, buttons, links styled as buttons, labels, legends and fold titles. List items, captions and plain links keep only the closing-mark rule: gluing words there widened flex and grid columns and pushed `/estimate/`, `/act/` and `/evidence/` sideways at 320 px 特大 (check 13 caught it). A button or list link laid out with flex holds its words in one inner span (the `/estimate/` buttons and contents list). Measured at 320 px, 特大 and 標準, on every Chinese page: 44 breaks inside a word in headlines, buttons and labels before; two after, both in long option labels on `/electric/` (能 / 有插座 are two separate texts; 「各 / 縣市」 in the scrap-history checkbox).
- *The film.* The hold on the two monthly bars now pushes in slowly (6% by the end card) around a point beside the home-charging bar; the drawn scooters and the HTML bars move together. Both MP4s were rendered again.
- *Language switch.* On a page of screens the switch carries the screen being read (the one crossing a line a third of the way down) to the other language, as a #fragment.
- *Plain words on the pages no lane owned* (home, questions, /act/, film and share text, print pages, 404, picture descriptions, chart labels): lane W's counter run over every remaining i18n module flagged 58 strings; 55 were rewritten (split, not shortened). Left: the title of the US EPA's *Exposure Factors Handbook* (《暴露參數手冊》), kept as its name. The chart label 「90 秒平均，含街上原本就有的（各地不同）」 no longer nests brackets.
- *Renders.* Headline font subset rebuilt (回三組 added); share cards and both film MP4s rendered again.
- *Page heights at 360 × 740, 標準, folds closed, JavaScript on, phone font*, measured on 27 November 2026: the round's starting commit (a847272) → this round. One figure means no change. Home stays within check 9 (12,300 px Chinese, 14,760 English).

| Page | 中文 | English |
|---|---|---|
| `/` | 12,283 | 14,026 → 14,055 |
| `/90/` | 5,718 → 5,742 | 6,834 → 6,858 |
| `/about/` | 11,290 → 11,438 | 13,659 → 13,688 |
| `/act/` | 11,822 → 11,915 | 14,766 → 14,851 |
| `/electric/` | 23,006 → 10,739 | 26,274 → 12,098 |
| `/estimate/` | 12,894 → 12,947 | 14,917 → 15,028 |
| `/evidence/` | 13,961 → 13,985 | 15,273 |
| `/sources/` | 100,413 → 3,938 | 111,126 → 4,305 |
| `/questions/` | 4,873 | 5,191 |
| `/questions/app/` | 2,970 | 3,442 |
| `/questions/beside-me/` | 3,140 | 3,494 |
| `/questions/mask/` | 3,565 | 3,845 |
| `/questions/my-child/` | 2,354 | 2,635 |
| `/questions/one-red-light/` | 3,363 | 3,743 |
| `/questions/rider/` | 2,928 | 3,209 → 3,238 |
| `/questions/smell/` | 2,881 | 3,192 |
| `/print/brief/` | 2,934 | 3,527 |
| `/print/poster/` | 1,443 | 1,641 |
| `404.html` (one page for both languages) | 2,717 | — |

**Round 5 (2026-11-27, fixer).** Three reviews of round 4. No number, unit, date, name, source id or data key was changed; three wording slips of round 4 that changed a meaning were put back.
- *Meaning restored.* The HEI sentence lists the deaths, then says separately that the same pollution is linked to asthma starting and to children's chest infections. 「不顯著」 is 「可能只是巧合（統計上不顯著）」 / "could be chance" everywhere (round 4 had 「差別小到可能只是巧合」 in five facts, which claims the gap is small). Khon Kaen: 「不是猛加速或急煞車」 again. Tsai 2018 no longer opens with "VOCs rose with mileage". Third-party estimates name who made them (研究推估, 世界衛生組織引用的推估, the chart label 研究推估的值); bare 推估 stays the site's own. The cheapest electric scooters are 「和125cc燃油機車，性能不是同一級」. Hill 2023: 促成腫瘤（讓腫瘤開始長出來） on both pages. The WHO formaldehyde note keeps "more than the air itself causes" (over-report). The /estimate/ cross-check introduces the 3 junctions with peaks before naming the busiest of them.
- *Word glue, corrected.* Every glued run is held in one `span.gl`, so a flex or grid box sees one item (round 4's loose nobr spans opened gaps inside words and scrambled the 404 links). A lone character never sits on a line by itself in glued text. Glue now also covers table headers and the film's captions, transcript and stills (a number keeps its unit: 「24–36 小時」), and both MP4s were rendered again.
- *Checks corrected (reasons).* check-site 13 also fails on a `.nobr` sitting directly in a flex or grid box, and repeats its overflow test at 特大 with every fold opened by a tap (round 4's bugs were invisible to it; both additions fail on the round 4 build). The film's reading-time counter (`timeline.ts readingUnits`) no longer counts 注音 after a character: it is a reading aid for that character, not more to read (needed for 「油氣裡有苯（ㄅㄣˇ），會致癌」, brief 6.6). The share-card fitting loop also shrinks the words until they start below the picture and its 示意圖 tag (en/app-sq).
- *Layout and behaviour.* Year and month stack on a narrow phone; segmented radio options flow onto a second row rather than cut a label; tab labels wrap at 大/特大; the 換車款或方案 fold has a chevron; citation numbers and the 「?」 notes have 48 × 48 px hit areas; folds open for printing on every page (the shell does it); the language switch carries the calculator's answers (?query); a link to a body pin picks it; smooth scrolling starts only after load, so a deep link lands at once; /sources/ prints no 未載年份 (the 檢索日期 line stays); the /act/ chart table leaves out a year with nothing to show.
- *Words.* Home: 油氣（沒燒完的汽油）, screen 5 says 3 of the 10 junctions report a peak, 三成到快一半 (30–45%), 交通部運輸研究所 spelled out in the sheets and on /estimate/; a units line (ppm, ppb, µg/m³) under the /estimate/ table; /electric/ data and copy: 試算 → 計算, 估計 by context, 未能查證 → 沒有查證到, 台 → 輛; the rider chart summary split. "Fuel vapour" in English.
- *Smell wording, resolved after this round (merge of air-final, why, money).* In favour of the /about/ corrections log: nowhere does the site say particles cannot be smelled. It says they are too small to see (看不到：微粒, as the air key does); carbon monoxide 沒有味道 stays. Home screen 2, /questions/smell/, its card, the share card, the smell strip, the answer card and claims-policy r3's wording changed; no guard pattern changed.
- *Merge of air-final, why and money, heights (after this round).* Together the three jobs ran the zh home page to 12,313 px. Trimmed by spacing only: the home text grid's gap 0.625 → 0.5 rem, screen 5's one-idea-per-line body with no extra gap, the scrap note at line height 1.4; the English screen 2 quiet line reads 「The WHO names no safe level of benzene.」 Now `/` 12,189 · `/en/` 14,222 at 360 × 740. Screen 13: where the compared electric's subsidies are unconfirmed (CoolOne: Kaohsiung, Keelung, Hualien and others with one to scrap, every county with nothing to scrap), the screen says only that they are not counted, and the dealer hint and the deadline dates move into its sheet (`stripParts`, money.home.unconfirmedShort / askDealer). Largest screen 13 over all 22 counties and both answers: 835 px zh, 1,016 px en.
- *Heights at 360 × 740, 標準, folds closed, phone font* (27 November 2026, after this round): `/` 12,283 / 14,084 · `/90/` 5,742 / 6,858 · `/about/` 11,438 / 13,688 · `/act/` 11,915 / 14,851 · `/electric/` 10,739 / 12,098 · `/estimate/` 13,119 / 15,192 · `/evidence/` 13,985 / 15,273 · `/sources/` 3,938 / 4,305 · `/questions/` 4,873 / 5,191 · app 2,970 / 3,442 · beside-me 3,140 / 3,494 · mask 3,565 / 3,845 · my-child 2,354 / 2,635 · one-red-light 3,363 / 3,743 · rider 2,928 / 3,238 · smell 2,881 / 3,184 · `/print/brief/` 2,934 / 3,527 · `/print/poster/` 1,443 / 1,641 · `404.html` 2,717.

**Release 2 (2026-11-27: merge of air-final, why and money; tablet layout; poster share cards; render).** No number, unit, date, source id or claim strength was changed.
- *Air drawing rule.* A picture draws only the scooters' exhaust: one soft plume per row from the tailpipes, rings (carbon monoxide) with paper centres and a little larger, ribbons (fuel vapour) and dots (particles) inside it. The street's own air is no longer drawn; the tag says so. Every picture has a key under it (`AirLegend`), by sense on the first picture, the kerb, `/estimate/`, the poster and the film: 聞得到：油氣 · 聞不到：一氧化碳 · 看不到：微粒. Particles are never "cannot be smelled".
- *Screen 5.* Headline 「一氧化碳比指引值低很多，是好消息，但廢氣不只有它」 / "Carbon monoxide is far below the WHO guideline. Good news, but exhaust holds more than that", broken after the first clause; the body is one idea per line (three lines, so the build's screen lint warns "3 sentences"; kept on purpose); the WHO benzene quiet line; the chart note 只看一氧化碳 / "Carbon monoxide only".
- *Money screen (13).* Each bar names its scooter; one note under the bars gives the cheapest price on each side before and after scrapping and names the other answer's scooters when the model changes. Where the compared electric's subsidies are unconfirmed (CoolOne), the screen says only that they are not counted; the dealer hint and the deadline dates are in its sheet.
- *Layout rule.* From 43em (688 px) wide, at any height, a screen has two columns: the picture left, the words right, in the same 1,040 px column (tablets upright, phones on their side, desktops). The picture column is the smallest of 55% of the row, 35rem and the width at which the whole drawing and its key fit the window height (never under 14rem); the words column is never under min(17rem, 45%). Pictures shrink whole, never cropped. Below 688 px the picture stays above the words; phones upright are unchanged. `/estimate/`'s kerb drawing follows the same rule. DOM and keyboard order are unchanged.
- *Share cards (template 7).* One picture filling the 1200 × 630 card, one short headline in the headline face (at most 10 Chinese characters or 6 English words, two lines at most), the site name with a red lamp dot (removed in the review fixes below), and a 示意圖 / Illustration plate. No number on any card, so no 推估 mark; the page carries numbers and caveats. People and headline sit in the central square, so LINE's square crop keeps them. Square cards are gone; `ShareBlock` shows the wide card. Every page has exactly one og:image, now also the print poster and brief and the `/problem/` and `/unmeasured/` redirects.
- *The film.* In the MP4 the English key has four rows, so its strip is taller (6.5rem, Chinese 4.25rem) and never runs into the caption. Share cards and both MP4s were rendered again.
- *Heights at 360 × 740, 標準, folds closed* (27 November 2026, before the review fixes below): `/` 12,189 / 14,222 · `/90/` 5,838 / 6,997 · `/about/` 11,467 / 13,746 · `/act/` 11,937 / 14,851 · `/electric/` 11,174 / 12,608 · `/estimate/` 13,183 / 15,258 · `/evidence/` 13,985 / 15,273 · `/sources/` 3,938 / 4,305 · `/questions/` 4,999 / 5,317 · app 3,082 / 3,626 · beside-me 3,299 / 3,768 · mask 3,677 / 4,030 · my-child 2,466 / 2,819 · one-red-light 3,448 / 3,858 · rider 3,062 / 3,444 · smell 2,977 / 3,380 · `/print/brief/` 3,190 / 3,837 · `/print/poster/` 1,551 / 1,751 · `404.html` 2,717.

**Release 2 review fixes (2026-11-27).** Three reviews (regressions, a first-time reader, facts) of the release; no number, unit, date, source id or claim strength was changed.
- *Screen 13 states the least favourable case again* (rule of section 5, `money.worst`): the fold 「有時候電動機車比較貴」 / "Sometimes electric costs more" is on the screen under the strip, not in the sheet. When no case in the table is dearer, the line 「我們算的每個縣市，電動機車都不比較貴。」 shows instead, with no fold, so the summary is never false. To keep the screen in its budget, the "which scooter is cheapest with the other answer" sentence moved into the sheet.
- *The scrap note names its first price.* 「沒有機車可報廢時，最便宜的電動機車 49,812 元，燃油機車 53,500 元。報廢滿 10 年的機車，降到 44,580 元和 46,700 元，差距變小。」 / "With nothing to scrap, the cheapest electric is NT$49,812 and petrol NT$53,500. Scrap one 10+ years old and they drop to …": the second price is no longer read as the list price beside the bars' 「定價」. Same figures.
- *Screen 5's quiet line* is the registry's statement only (see Q above). Its Chinese headline may also break after 一氧化碳 and at every comma, so a narrow column never leaves 「很多，」 alone on a line.
- *Two columns at tablet width:* screen 4's number box sits above the drawing whenever the screen is in two columns (it lay over the drawing and hid the people at 703 px). The answer picture of a question page never narrows below 26rem (`--pic-min`), so at 1024 × 768 its key keeps one line per item and the headline keeps its phrase breaks.
- *Share cards:* no site name (it was a speck in every preview); the 示意圖 / Illustration plate is 38 px type with a border, at the bottom right of the central square (X lays the link title over the bottom-left). Each headline phrase stays on one line and the headline is set as large as its box allows; the signal and the station stand further left so one-red-light and app headlines set near home's size. English headlines were re-phrased to shorter lines: "One red light. |Does it matter?", "Going electric: |what does it cost?", "Does stepping |back help?", and brief "A step or two |from children" (no closer than the Chinese 一兩步). The act card's cloud is smaller and paler. The /questions/smell/ link preview text now gives the page's own answer (油氣和醛類 / fuel vapour and aldehydes).
- *Smaller things:* the English smell strip title is "Can't smell it, |can't see it" ("nothing to see" read as "nothing there"); the English header shows the menu icon without its word from 62em to 70em (it was cut to "Mer" at 1,024 px); the share block's two buttons share one row at 360 px and its lead keeps 家長群組 together.
- *Heights after the review fixes* (360 × 740, 標準, folds closed): `/` 12,192 / 14,200; screen 13 at most 838 px (Chinese, limit 850) and 1,016 px (English, limit 1,020) over all 22 counties and both answers.

**The 3-D simulation on the site (2026-11-27).** The owner asked whether the air at a red light is over the guideline, because it smells horrible. A signed 3-D large-eddy simulation (`research/simulation/`, OpenFOAM, adversarial verification) answered it; the site prints only the statements `research/simulation/statements.json` allows, each with what it must carry, and none of its must-not statements. Numbers reach pages only through `scripts/build-simulation-data.mjs` → `src/data/simulation-data.ts` (generated; check-data re-runs it) → `src/data/simulation.ts` (slots) → `EstimateValue`, the charts and the registry facts (`src/data/facts-simulation.ts`, read level 本站自己用電腦算的推估).
- *Screen 5* ("超過指引值嗎"). Screen 4's next button asks the owner's question: 「那麼臭，超過指引值了嗎？」. The headline is chosen by `simBelowWho()`: 「臭是真的。一氧化碳沒味道；等一個紅燈，仍低於指引值」 / "The smell is real. Carbon monoxide has no smell. After one red light, it is still below the WHO guideline". It names one red light and never says "far below". Body, one idea per line: the smell (推估, statement 6) and the exception (推估, statement 3, linked to `/questions/my-child/#pushchair`). The picture is SimCompare compact: three rows of 15-minute averages (one red 0.1–4; every red for 15 minutes with the wind held 3–16; the pushchair's middle case 35–56 with an arrow past 87 and "of such 15-minute periods, about 1 or 2 in 10 pass 87"), the WHO 15-minute line with 「只看一氧化碳；低於它，不代表廢氣安全。」, and the caption 推估 · one simulated red per case. MeasuredVsEstimate and its zoom-out strip left home (must-not 3); the quiet line is empty (no placeholder).
- *Screen 2* body is one line per sentence. *Screen 6* sheet: the carbon monoxide sentence is one red light after conversion, labelled 推估. *Screen 7* sheet: statement 8 (people who stay an hour, benzene). *Screen 8* quiet line: statement 5 (pushchair height, wind from the scooters, not in every wind) replaces K4, whose 「多多少，還算不出來」 is answered; K4 stays defined in `ui.ts` and `brief-rules.mjs`.
- *`/estimate/#simulation`* (section 2; later sections renumbered 3–10): the owner's question answered, SimCompare (b), SimSeconds (a: one-second series sorted from most to least, no guideline, no number on a second; sorted because brief-no-buildup draws no curve through the red), heights, SimAbove (c: share of the red you can smell it; benzene for people who stay against California's 1-hour reference), and folds 可以信多少 / 沒有算的 (enclosed places) / 還算了什麼 (arcade) / 方法和檔案 (JSON download). The hero's MeasuredVsEstimate has no zoom strip; EstimateBands no WHO row; under the table: 「範圍最高的數字，是一般紅燈裡偏高的那種，不是最糟的紅燈。」
- *Question pages.* `/questions/smell/#smell-co` 「聞起來那麼臭，一氧化碳超過指引值了嗎？」, `/questions/my-child/#pushchair` (statement 3, one idea per line), `/questions/one-red-light/` sheet (statements 2, 8, 9). `/about/#corrections`: new entry 2026-11-27 (sim-guideline), and child-44's "now" text. The one-page brief uses the new headline, no zoom strip, and statement 1 with the exception.
- *Guards.* Eleven `sim-*` claim rules (qualifiers for the exception, heights and benzene; do-not-claim rules for the must-not statements) and the brief rule `brief-no-seconds-beside-guideline` (check 3 on the built pages: a 1-, 10- or 90-second value in the same sentence as 87 or 31 ppm). Every hit has a reviewed allow-list entry naming what it carries. Nothing was loosened.
- *Not changed (other jobs' files):* the film, share cards and art. `src/i18n/pages/film.ts` 239–240 (heights sheet: "not about how much exhaust there is at any height") is contradicted by statement 5 and should change at the combine step.
- *Heights at 360 × 740* (check-site 9, 標準, phone font): `/` 12,153 / 14,203 (before: 12,192 / 14,200); screen 5 736 / 905 px (before 775 / 950); screen 8 610 / 704.

