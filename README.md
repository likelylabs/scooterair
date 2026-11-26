# 行人呼吸 / ScooterAir

A bilingual public-service website for Taiwan about what pedestrians breathe beside a queue of
scooters at a red light: what has been measured, what the site works out from published figures
(a signed estimate, always shown as 推估 with its range and its working), and what it really costs
to switch to an electric scooter. Traditional Chinese (zh-TW) is the main language; English
lives under `/en/`.

Live at <https://likelylabs.com/scooterair/> (GitHub Pages, project path `/scooterair/`). The code
is ready for its own domain as well (the default address in the build is `https://scooterair.tw`).

Built with [Astro](https://astro.build/) and TypeScript. Every page is static HTML; the few scripts
(the cost calculator, chart tooltips, date-dependent subsidy copy) only add to what is already on
the page.

## Running it

You need Node.js 22.18 or newer (the checks import TypeScript files directly).

```sh
npm ci              # install exactly what package-lock.json lists
npm run dev         # local server with live reload, http://localhost:4321/
npm run check       # every check CI runs (below); must pass before you push
npm run build       # the site, into dist/
npm run preview     # serve dist/ as it will be deployed
```

To build for the project path exactly as it is deployed:

```sh
SITE_URL=https://likelylabs.com BASE_PATH=/scooterair npm run build
```

`SITE_URL` is the origin every absolute URL is built from (canonical links, `og:url`, `og:image`,
hreflang, the sitemap, `robots.txt`); it is always turned into `https://`. `BASE_PATH` is the path
the site lives under. Internal links go through `href()` and `asset()` in `src/i18n/index.ts`, so
they follow `BASE_PATH`; never write a bare `/path/` in a page.

### What `npm run check` checks

| Step | What fails it |
| --- | --- |
| `scripts/check-data.mjs` | the cited data layer in `src/data`: a fact without a source, a source nothing cites, a bad date, URL or DOI, a missing language, wrong punctuation for the language, and more (the script's header lists everything) |
| `scripts/check-copy.mjs` | reader-facing copy that breaks the editorial rules: the registry's claim rules (`src/data/claims-policy.ts`), the redesign brief's banned strings, banned claims and "not yet measured" wording outside the K sentences (`scripts/brief-rules.mjs`), 臺 for 台, 您, exclamation marks; reviewed exceptions live in `src/i18n/copy-allowlist.json`, each with a reason. `--only home` reports one module; `--vocab` adds the brief's vocabulary advice |
| `test:calc`, `test:lib` | the subsidy and cost engine (`src/lib/calc`); the date logic and the home-page money tables (`src/lib`); the calculator's opening (`src/components/pages/electric`); the air rule of the drawings (`src/components/art`); the charts (`src/components/charts`) |
| `build-share-cards.mjs --check` | a share image whose words or picture sources changed since it was rendered (see "Share cards") |
| `film-export.mjs --check` | an MP4 of the film whose timeline, captions, numbers or drawings changed since it was exported (see "The film") |
| `astro check` | type errors |

**The site check** runs on a built site rather than on the source, so it is not part of
`npm run check` (yet):

```sh
npx astro build --outDir /tmp/site      # or npm run build, into dist/
npm run check:site -- /tmp/site         # default: dist/
node scripts/check-site.mjs /tmp/site --static          # text and structure only, about 2 s
node scripts/check-site.mjs /tmp/site --only 11,13 --pages '^/(en/)?$' --progress
```

It implements the automated acceptance checks of `docs/redesign-brief.md` 9.3 in both languages:
banned strings and claims, "not yet measured" wording only as the K sentences on their pages,
estimated values with 約, a range, the 推估 chip and a way to `/estimate/`, air numbers that come
from `src/data/estimate.ts` or the registry, caveats in sheets, routes, redirects, dead links and
anchors, the sitemap, the home page's 15 screens and their lengths, and, in Chromium through
Playwright, type sizes, touch targets, sideways scroll and clipping at 字大, contrast in both
themes, the page without JavaScript, reduced motion, scene alt text and tags, and the
calculator's opening state. Each check prints pass or fail with the page and the text.
`--report file.json` keeps the whole result. The script's header lists the markup hooks it reads.

Three of its rules are this project's reading of the brief, stated so nobody is surprised:

- **Words per screen** (check 9) count Han characters only, and of the sentences that follow a
  switch only the longest, the way `src/components/ui/screen-limits.ts` counts them when the page
  is built. Chinese is the designed page: at most 850 px a screen and 12,300 px in all at
  360 × 740. English says the same sentence for sentence and runs about a fifth longer, so it has
  its own budget, the Chinese one × 1.2 (1,020 and 14,760 px), rather than English copy cut short.
- **Body text** (checks 11 and 14) is a `<p>` in `<main>` outside labels, captions, chips, sheets
  and source lines; a block whose class names it as one of those (`quiet`, `caption`, `note`,
  `source` or `src`, `chip`, …) is held to the label rules (14 px, 4.5:1) instead of 18 px and 7:1.
- **Targets 8 px apart** (check 12): a bar fixed to the screen (the calculator's result bar) is
  not compared with whatever it happens to cover as the page scrolls.

## How it is organised

| Where | What |
| --- | --- |
| `src/pages/[...lang]/` | one file per route; `[...lang]` gives each route a Chinese and an `/en/` version |
| `src/pages/404.astro` | the page for a missing address (see "Deployment") |
| `src/i18n/` | every reader-facing string. Shared strings in `ui.ts`; page copy in `pages/<page>.ts`. Copy is never written inline in a page (`check-copy` enforces this). Read `src/i18n/pages/_copy.ts` before writing a page. |
| `src/data/` | the evidence registry: `sources.ts` (bibliography), `facts*.ts` (each claim with its numbers, sources and confidence), `series*.ts` (chart data), `estimate.ts` (the signed kerbside estimate as typed slots, see below), `answers.ts` (the answer we have now to each former gap), `claims-policy.ts` (the wording rules) |
| `src/data/econ/` | the subsidy and cost data the calculator uses: `programmes/` (one file per payer: central government, each city and county), `vehicles.ts`, `energy.ts`, `running.ts`, `jurisdictions.ts` |
| `src/lib/calc/` | the calculation engine; pure functions with tests |
| `src/lib/site-state.ts` | which subsidy "phase" applies on a given date (see "Dates") |
| `src/components/ui/` | the shared frame: `Screen`, `ScreenRail`, `KindChip` (the five chips), `EstimateValue`, `HowSheet` (the 怎麼知道的？ sheet), `NextButton`, `Segmented`, `ScenarioSwitch`, `IllustrationTag` |
| `src/components/art/` | the drawings: `air.ts` (the one rule for drawing exhaust as an amount, brief 5.1) and one scene per picture (`HeroStreet`, `TailpipeMarks`, `KerbScene`, `BodyFigure`, `RoadOfTime`, `HeightsScene`, `RiderScene`, `MaskScene`, `SwapScene`, `TenScooters`, …) |
| `src/components/charts/` | the chart library: `core/*.ts` draws each chart as an SVG string, the same code at build time and in the browser; `MeasuredVsEstimate`, `PriceBars`, `MonthlyBars`, `WorkingSum` are the redesign's charts |
| `src/lib/home-money.ts` | every money figure on the home page, the film and `/electric/`, from the calculator engine, for today and for each coming date on which the sums change |
| `docs/redesign-brief.md` | **the build brief**: the home page's 15 screens, the rules for showing estimates and measurements, wording, pictures, the film, every other page, and the acceptance checks. Its section 12 overrides the rest; section 13 says what was built differently and why. `docs/editorial-blueprint.md` is the earlier blueprint, kept for history and superseded where they differ |
| `research/` | the research notes and per-paper checks the registry was built from; `research/estimate/` is the signed kerbside estimate (below); `research/masks/VERIFIED.json` the checked facts on masks |
| `scripts/` | the checks, the share-card renderer and the headline-font builder |
| `public/` | files served as they are: icons, manifest, share images |

The styleguide pages (`/styleguide/`, `/styleguide-art/`) show components and charts with notes
for builders. They exist only under `npm run dev`: their `getStaticPaths` returns nothing in a
production build, so they never ship.

## The kerbside estimate (推估)

What a pack of idling scooters **adds** to the air at an adult's nose beside it (carbon monoxide,
benzene, PM2.5; three pack sizes; a 90-second average) is not measured anywhere in Taiwan, so the
site works it out and says so. The estimate is signed and versioned (推估 v1・2026-11-26).

| Where | What |
| --- | --- |
| `research/estimate/METHOD.md` | the method, in words: inputs, assumptions, what may and may not be said |
| `research/estimate/model.mjs` | the model (no dependencies): a source-and-dispersion simulation run 30,000 times per scenario |
| `research/estimate/results.json` | the record of the signed run: every scenario, the exact call that reproduces it, the cross-check against the Institute of Transportation's readings, sensitivity runs |
| `research/estimate/sources.json`, `inputs-*.json` | the sources and input data |
| `src/data/estimate.ts` | the published, rounded values as typed slots (`est.co.dozen.add`, `est.bg.co.traffic`, …), the rule-based sentences and the drawing rule. Literal values on purpose, so a client script can import it without the 65 kB results file |

**How a number reaches a page.** `results.json` → `src/data/estimate.ts` (the published rounding:
one significant figure for what the pack adds, one decimal for totals) → components that take the
slot object, never a typed number: `EstimateValue` prints 約 A 到 B, the unit and the 推估 chip
and opens the sheet; `formatEstimate()` gives the same text for share cards and the film; the
illustrations' density comes from the same slots through `src/components/art/air.ts`. Headlines
that depend on an estimate are chosen by written rules (`kerbRule`, `checkRule` in
`estimate.ts`), so they change by themselves if the numbers change. `scripts/check-data.mjs`
re-reads `results.json` and fails if any slot differs; `scripts/check-site.mjs` fails if a page
prints an air number that is in neither `estimate.ts` nor the registry.

**Re-running it.**

```sh
cd research/estimate
node model.mjs            # quick look, n = 6000 per scenario (about 10 s)
node model.mjs --write    # the full run, n = 30000; rewrites results.json
cd ../.. && node scripts/check-data.mjs   # lists every slot in estimate.ts that no longer matches
```

A new run is a new version: update `estimateMeta` (version and date) and the slots in
`src/data/estimate.ts`, have the method's owner sign `METHOD.md`, add a line to the corrections
log, and keep the old numbers visible on `/estimate/`. When a real kerbside measurement arrives,
it is added beside the estimate; the estimate is not deleted.

## The film (`/90/`)

The film is one animation driven by one timeline (`src/components/pages/film/`). Every number in
it comes from the same slots as the pages; every caption length is checked against the reading
floor at build time. A vertical MP4 (1080 × 1920, captions burnt in, Chinese and English) is
exported from the same timeline by capturing frames with Playwright and encoding with `ffmpeg`,
and committed to `public/film/` with a manifest:

```sh
node scripts/film-export.mjs            # needs Playwright with Chromium, and ffmpeg
node scripts/film-export.mjs --check    # fails if the committed MP4s no longer match the timeline
```

Re-export after any change to the film's beats, captions or the numbers it shows, as for the
share cards.

## Share cards

Every page has a link-preview picture in two sizes, 1200 × 630 (`og:image`) and 1080 × 1080
(LINE), in both languages, under `public/share/`. Each card is drawn by a page of the site,
`/print/card/<id>/`, which is only built when the renderer asks for it, so the cards use the same
scenes and the same air rule as the pages. A card with an estimated number carries 推估 and its
range inside the picture. Words come from `src/lib/share-cards.ts` and `src/i18n/pages/share.ts`.

```sh
npm run share-cards                 # render every card (Playwright with Chromium), then commit public/share/
npm run share-cards -- mask         # only the cards whose id contains "mask"
npm run share-cards -- --out /tmp/cards   # a preview somewhere else; the manifest is not touched
```

`--check` (part of `npm run check`) fails when a card's words or the drawings it is made from
changed since it was rendered. The address printed on a card is the live one,
`likelylabs.com/scooterair`; set `SHARE_CARD_HOST` when rendering if the site moves. The old
addresses `/questions/how-much/` and `/questions/electric/` are redirects that keep their own
card, so an old share still shows its picture.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages:

- **on every push to `main`**, on a manual run (Actions, "Build and deploy", "Run workflow"),
  **and every day at 00:07 Taiwan time**. The daily run matters: the worked examples on
  `/electric/`, day counts and which subsidy phase applies are worked out for the day the site is
  built. GitHub pauses scheduled workflows in a repository with no commits for 60 days; if that
  happens, re-enable it under Actions.
- **pull requests** run the same checks and build, but do not deploy and get no Pages access.

What had to be set up for this to work, once:

1. Repository **Settings, Pages, Build and deployment, Source: GitHub Actions**.
2. The workflow reads the Pages settings (the address and path the site is served at) with
   `actions/configure-pages`. That needs the token's **`pages: write`** permission, which the
   workflow grants to a small `pages` job only. That job checks out nothing and runs none of the
   repository's code; the build job itself has read-only access.
3. The `github-pages` environment (created by GitHub the first time) must allow deployments from
   `main`.

The address comes from those settings: the organisation's custom domain gives
`https://likelylabs.com` and the path `/scooterair`. GitHub reports the origin as `http://`; the
build turns it into `https://` (`astro.config.mjs`).

**Missing addresses.** GitHub Pages answers every missing address under `/scooterair/` with
`/scooterair/404.html`, built from `src/pages/404.astro`. Because the same file answers for any
path in either language, it shows both languages (Chinese first; English first under `/en/`),
and every link on it is absolute.

**Search engines.** The build writes `sitemap-index.xml` and `robots.txt`. Crawlers only read
`robots.txt` at the root of a host, so while the site lives under `likelylabs.com/scooterair/`,
submit `https://likelylabs.com/scooterair/sitemap-index.xml` in Google Search Console by hand.

**Caching.** GitHub Pages sends a 10-minute cache lifetime for every file and cannot be told
otherwise, although everything under `/_astro/` has a content hash in its name and could be
cached for a year. A CDN in front of a custom domain could set that; on bare GitHub Pages it
stays as it is.

## Updating facts and sources

(The kerbside estimate has its own procedure: see "The kerbside estimate" above.)

1. Add or correct the source in `src/data/sources.ts` (ids are permanent; never rename one).
2. Add or correct the fact or series in `src/data/facts*.ts` / `series*.ts`, citing the source id.
   Numbers are never typed into copy: copy reads them from the registry.
3. If a correction changes what the site claims, add an entry to the corrections log
   (`src/components/pages/action/corrections.ts`).
4. `npm run check`, then look at the pages that use the fact (`npm run dev`).
5. If the text on a share card changed, `npm run share-cards` (needs Playwright with Chromium)
   and commit `public/share/`.

## Updating subsidies

Subsidy data is in `src/data/econ/programmes/`, one file per payer. Each programme records its
amount, conditions, the dates it runs, its quota and **the date it was checked (`asOf` /
`checkedOn`)**. Every amount on the site prints that date, and once it is more than 21 days old
(`STALE_DAYS` in `src/lib/site-state.ts`) the page says it may have changed.

When a subsidy changes (an amount, a quota running out, a new programme, a deadline moved):

1. Update the programme in its file, with the new source, and set its checked date to today.
2. If a city's quota is used up, set its quota status to `exhausted` with the date.
3. `npm run check` (the engine tests catch impossible combinations), then look at `/electric/` and
   the home page's money section for that city.
4. Push to `main`. The daily build picks up dates by itself, but not new facts.

Where a place's programme could not be read (on 26 November 2026: Hualien, Taitung, Penghu and
Lienchiang), the place is `not-verified`: the calculator counts central money only, and its
status note says so in plain words and names who to phone. Keep that note helpful (what central
money still gives, and the bureau's number or site) rather than blank. A finding that rests only on
a news report is entered with `confidence: 'secondary'` or named with its date in the status note,
never as the county's own figure.

### By hand on fixed dates

- **30 November and 15 December 2026.** Keelung's and Kinmen's local subsidies require the scooter
  to be bought, plated and scrapped by 30 November, with papers in by 15 December
  (`programmes/counties-r2.ts`, `programmes/counties.ts`). The engine closes them by date; nothing to
  edit unless either county extends.
- **1 December 2026.** The scooter makers' own purchase credits recorded in
  `src/data/econ/vehicles.ts` run to 30 November 2026. The daily build stops counting them from
  1 December, but check the makers' pages for extensions or new offers and update the file.
  The MOEA portal asks foreign nationals to apply by **10 December 2026**: check that this has
  not moved (`programmes/central.ts`).
- **1 January 2027.** The central purchase subsidies run to 31 December 2026; from 1 January the
  site switches by itself to "the purchase deadline has passed; file by the filing deadline"
  (phase B in `src/lib/site-state.ts`), and later to "ended" (phase C). What it cannot know:
  whether a 2027 programme has been announced. When one is, add it to `src/data/econ/programmes/`
  with its source; the site then shows it (phase D). Also re-check the Ministry of Environment
  scrap-and-replace programme, whose 2027 continuation is not confirmed (`programmes/central.ts`),
  and each city's programme.
- After any of these, push to `main` (or run the workflow by hand) so the static pages are rebuilt.

## When headlines change

Chinese headlines use Noto Sans TC Black cut down to the characters the headlines actually use
(`src/styles/fonts/noto-sans-tc-900-headline.woff2`, about 45 kB, instead of hundreds of kB of
slices). A headline character that is not in that file is still drawn correctly, from the full
font, but costs extra downloads, and the build warns:

```
[WARN] [scooterair:headline-font] N headline character(s) are not in the subset yet: …
```

To fix it, after changing Chinese headlines:

```sh
pip install fonttools brotli    # once; set PYTHON=… if your python3 lacks them
npm run headline-font           # build, rebuild the font from the built pages, build again
git add src/styles/fonts/       # commit the .woff2 and the .txt list of characters
```

If nobody does this, the deploy workflow does it for the live site (it installs fontTools,
rebuilds the font when `node scripts/build-display-font.mjs --check` fails, and builds again)
and shows a warning on the run. Committing the rebuilt files keeps that warning away.

## Reporting an error

On the site: **/about/#report** (Chinese) or **/en/about/#report** (English) says how. Name the page
and the sentence, and what your source says. Corrections are dated and listed in the corrections
log on the same page. Developers can also open an issue in this repository.

## Licences

- **Fonts.** The site serves three typefaces, all under the **SIL Open Font License 1.1**:
  Archivo (`@fontsource-variable/archivo`, © The Archivo Project Authors), Noto Sans TC
  (`@fontsource/noto-sans-tc`, © Adobe, with Reserved Font Name "Source"), and our subset of Noto
  Sans TC Black. The packages carry their licence in `node_modules/<package>/LICENSE`. The subset
  is a modified version that is committed to this repository, so its licence and notice are in
  `src/styles/fonts/OFL.txt`, and the font file keeps its copyright and licence records. The OFL
  allows this use, including on a website; it asks that the fonts are not sold on their own and
  that a modified version does not use a reserved name.
- **Code and content.** The owner has not yet chosen a licence for this project's own code, text,
  data compilation and illustrations. Until one is chosen, no licence is granted; do not assume one.
  (The underlying facts belong to their sources, which are cited on every page and in `/sources/`.)
