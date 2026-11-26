# 行人呼吸 / ScooterAir

A bilingual public-service website for Taiwan about what pedestrians breathe beside a queue of
scooters at a red light: what has been measured, what nobody has measured yet, and what it really
costs to switch to an electric scooter. Traditional Chinese (zh-TW) is the main language; English
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
| `scripts/check-copy.mjs` | reader-facing copy that breaks the editorial rules (causal wording, 臺 for 台, 您, exclamation marks); reviewed exceptions live in `src/i18n/copy-allowlist.json`, each with a reason |
| `test:calc`, `test:lib` | the subsidy and cost engine (`src/lib/calc`) and the date logic (`src/lib`) |
| `build-share-cards.mjs --check` | a share image whose text no longer matches the copy |
| `astro check` | type errors |

## How it is organised

| Where | What |
| --- | --- |
| `src/pages/[...lang]/` | one file per route; `[...lang]` gives each route a Chinese and an `/en/` version |
| `src/pages/404.astro` | the page for a missing address (see "Deployment") |
| `src/i18n/` | every reader-facing string. Shared strings in `ui.ts`; page copy in `pages/<page>.ts`. Copy is never written inline in a page (`check-copy` enforces this). Read `src/i18n/pages/_copy.ts` before writing a page. |
| `src/data/` | the evidence registry: `sources.ts` (bibliography), `facts*.ts` (each claim with its numbers, sources and confidence), `series*.ts` (chart data), `gaps.ts` (what has not been measured), `claims-policy.ts` (the wording rules) |
| `src/data/econ/` | the subsidy and cost data the calculator uses: `programmes/` (one file per payer: central government, each city and county), `vehicles.ts`, `energy.ts`, `running.ts`, `jurisdictions.ts` |
| `src/lib/calc/` | the calculation engine; pure functions with tests |
| `src/lib/site-state.ts` | which subsidy "phase" applies on a given date (see "Dates") |
| `src/components/charts/` | the chart library: `core/*.ts` draws each chart as an SVG string, the same code at build time and in the browser |
| `docs/editorial-blueprint.md` | the editorial rules (voice, wording, what may and may not be claimed) |
| `research/` | the research notes and per-paper checks the registry was built from |
| `scripts/` | the checks, the share-card renderer and the headline-font builder |
| `public/` | files served as they are: icons, manifest, share images |

The styleguide pages (`/styleguide/`, `/styleguide-art/`, not indexed) show every component and
chart with notes for builders.

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

### By hand on fixed dates

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
