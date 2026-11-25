#!/usr/bin/env node
// Share-card generator (V44). Renders one image per question page, one for the hero and one
// for the seven lines, in both languages and two sizes, with the question, the answer, the
// caveat line and the evidence badge INSIDE the image — so a screenshot cannot shed the caveat.
//
//   npm run share-cards              render every card into public/share/{zh,en}/
//   npm run share-cards -- smell     render only the cards whose id matches
//   npm run share-cards -- --check   no browser: verify that the committed PNGs exist and were
//                                    rendered from the current copy (part of `npm run check`)
//
// Runs on demand and its PNGs are committed, so CI needs no browser. It uses the Playwright
// and Chromium already installed on the machine (require('playwright')). The fonts are the
// site's own, read from node_modules; colours come from src/styles/tokens.css.
//
// What is on a card comes from src/lib/share-cards.ts (question copy from
// src/i18n/pages/questions.ts, the seven lines from chain.summary in ui.ts). Change the copy,
// run this script, commit the PNGs: `--check` fails until you do.
//
// Output:  public/share/<zh|en>/<id>.png      1200 × 630  (og:image)
//          public/share/<zh|en>/<id>-sq.png   1080 × 1080 (LINE and other square previews)
//          public/share/manifest.json         content hash per card, read by --check
//
// The PNGs are re-encoded with sharp as 8-bit palette PNGs before they are written (see pack()
// below): about a third of the bytes, with no visible change. They stay PNG on purpose: every
// link-preview consumer takes PNG, not all of them take WebP or AVIF, and JPEG smears the small type.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.removeAllListeners('warning');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(resolve(root, p)).href);
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const only = args.filter((a) => !a.startsWith('--'));

/** Bump when the card design changes, so --check asks for a re-render. */
const TEMPLATE = 5;
const OUT = join(root, 'public/share');
const SIZES = { wide: [1200, 630], square: [1080, 1080] };

const { shareCardIds, shareCardContent } = await load('src/lib/share-cards.ts');
const { evidence, site } = await load('src/i18n/ui.ts');
const { evidenceIconSvg } = await load('src/components/ui/evidence.ts');
const share = (await load('src/i18n/pages/share.ts')).default;

const locales = [
  ['zh-TW', 'zh'],
  ['en', 'en'],
];
const jobs = [];
for (const [locale, dir] of locales) for (const id of shareCardIds) jobs.push({ locale, dir, id, content: shareCardContent(id, locale) });
const hashOf = (job) =>
  createHash('sha256')
    .update(JSON.stringify([TEMPLATE, job.content, job.content.badges.map((b) => evidence.kinds[b].label[job.locale]), share.caveatLabel[job.locale], share.band[job.locale], site.name[job.locale]]))
    .digest('hex')
    .slice(0, 16);
const key = (job) => `${job.dir}/${job.id}`;

// ---- check mode: no browser ---------------------------------------------------
if (CHECK) {
  const manifest = existsSync(join(OUT, 'manifest.json')) ? JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8')) : { cards: {} };
  const bad = [];
  for (const job of jobs) {
    for (const f of [`${key(job)}.png`, `${key(job)}-sq.png`]) if (!existsSync(join(OUT, f))) bad.push(`missing public/share/${f}`);
    if (manifest.cards[key(job)] !== hashOf(job)) bad.push(`out of date: ${key(job)} (the copy on the card changed since it was rendered)`);
  }
  if (bad.length) {
    console.error(`\n✖ share cards: ${bad.length} problem(s). Run \`npm run share-cards\` and commit public/share/.\n`);
    for (const b of [...new Set(bad)]) console.error(`  ${b}`);
    console.error('');
    process.exit(1);
  }
  console.log(`✔ share cards: ${jobs.length} cards × 2 sizes present and current.`);
  process.exit(0);
}

// ---- render ----------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const phrased = (s) =>
  s
    .split('|')
    .map((p) => `<span class="phrase">${esc(p.trim())}</span>`)
    .join(/\s\||\|\s/.test(s) ? ' ' : '');
const nm = (p) => pathToFileURL(join(root, 'node_modules', p)).href;
const cjkCss = readFileSync(join(root, 'node_modules/@fontsource-variable/noto-sans-tc/index.css'), 'utf8').replace(/url\(\.\/files\//g, `url(${nm('@fontsource-variable/noto-sans-tc/files/')}`);
const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');

const badge = (kind, locale) => `<span class="ev ev--${kind}">${evidenceIconSvg(kind)}<span>${esc(evidence.kinds[kind].label[locale])}</span></span>`;
const mark = '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="4.5" fill="var(--clean)"/><rect x="1" y="12" width="22" height="2" fill="var(--exhaust)" opacity=".45"/><rect x="1" y="15.5" width="22" height="3" fill="var(--exhaust)" opacity=".72"/><rect x="1" y="20" width="22" height="4" fill="var(--exhaust)"/></svg>';

function html(job, size) {
  const { content: c, locale } = job;
  const [w, h] = SIZES[size];
  const host = new URL(process.env.SITE_URL ?? 'https://scooterair.tw').host;
  const body =
    c.kind === 'brief'
      ? `<h1 class="title title--brief">${phrased(c.title)}</h1>
         <ol class="lines">${c.lines
           .map((l, i) => `<li class="line"><b>${i + 1}</b><span class="line__text">${esc(l.text)}</span><span class="line__badges">${l.badges.map((b) => badge(b, locale)).join('')}</span></li>`)
           .join('')}</ol>
         <p class="brief-foot">${esc(c.caveat)}</p>`
      : `<p class="kicker">${esc(c.kicker)}</p>
         <h1 class="title">${phrased(c.title)}</h1>
         <p class="answer">${esc(c.answer)}</p>
         <div class="caveat"><p class="caveat__label">${esc(share.caveatLabel[locale])}</p><p>${esc(c.caveat)}</p></div>
         <p class="badges">${c.badges.map((b) => badge(b, locale)).join('')}</p>`;
  return `<!doctype html><html lang="${locale === 'en' ? 'en' : 'zh-Hant-TW'}" data-theme="dark"><head><meta charset="utf-8"><style>
@font-face{font-family:'Archivo';src:url(${nm('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2')}) format('woff2-variations');font-weight:100 900;font-stretch:62% 125%;}
${cjkCss}
${tokens}
*{box-sizing:border-box;margin:0;}
html,body{width:${w}px;height:${h}px;}
body{--here:var(--bg);background:var(--bg);color:var(--ink);font-family:'Archivo','Noto Sans TC Variable',sans-serif;font-synthesis:none;-webkit-font-smoothing:antialiased;line-break:strict;overflow:hidden;}
.card{position:relative;display:flex;flex-direction:column;width:100%;height:100%;padding:${size === 'wide' ? '44px 64px 0' : '64px 64px 0'};}
.head{display:flex;align-items:center;gap:14px;flex:none;font-weight:900;font-size:26px;letter-spacing:.04em;}
.head .mark{width:34px;height:34px;}
.head .host{margin-left:auto;font-weight:500;font-size:20px;letter-spacing:0;color:var(--ink-2);}
:lang(en) .head{font-stretch:76%;font-weight:800;letter-spacing:0;font-size:28px;}
.main{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;padding-block:24px 22px;overflow:hidden;}
.fit{display:flex;flex-direction:column;gap:calc(18px * var(--k));font-size:calc(1px * var(--k));}
.phrase{display:inline-block;}
.kicker{font-size:22em;font-weight:700;color:var(--signal-red-ink);letter-spacing:.06em;}
:lang(en) .kicker{letter-spacing:.02em;}
.title{font-size:${size === 'wide' ? 66 : 84}em;font-weight:900;line-height:1.16;letter-spacing:.01em;text-wrap:balance;}
:lang(en) .title{font-weight:800;font-stretch:72%;line-height:1;letter-spacing:-.01em;font-size:${size === 'wide' ? 76 : 96}em;}
.title--brief{font-size:${size === 'wide' ? 44 : 60}em !important;}
.answer{font-size:${size === 'wide' ? 30 : 38}em;line-height:1.5;font-weight:500;max-width:34em;text-wrap:pretty;}
:lang(en) .answer{line-height:1.32;max-width:38em;}
.caveat{position:relative;align-self:flex-start;max-width:100%;margin-top:calc(14px * var(--k));padding:calc(20px * var(--k)) calc(22px * var(--k)) calc(14px * var(--k));border:3px solid var(--exhaust);font-size:${size === 'wide' ? 24 : 30}em;line-height:1.45;font-weight:500;}
.caveat__label{position:absolute;top:0;left:calc(16px * var(--k));transform:translateY(-58%);padding:0 .5em;background:var(--bg);color:var(--exhaust-ink);font-size:.72em;font-weight:700;letter-spacing:.08em;line-height:1.4;white-space:nowrap;}
:lang(en) .caveat__label{text-transform:uppercase;letter-spacing:.09em;}
.badges,.line__badges{display:flex;flex-wrap:wrap;gap:.5em;}
.badges{font-size:${size === 'wide' ? 20 : 25}em;}
.ev{display:inline-flex;align-items:center;gap:.4em;padding:.2em .6em .2em .45em;border:.11em solid var(--ink);border-radius:2px;font-weight:700;line-height:1.45;white-space:nowrap;}
.ev svg{width:1.15em;height:1.15em;flex:none;}
.ev--measured-tw,.ev--official-tw{background:var(--ink);color:var(--bg);}
.ev--derived,.ev--inference{border-style:dashed;}
.ev--market-tw{border-color:var(--line-strong);background:var(--bg-sunken);}
.ev--gap{border-color:transparent;border-radius:0;background:linear-gradient(var(--ink) 0 0) left top/.11em 100% no-repeat,linear-gradient(var(--ink) 0 0) right top/.11em 100% no-repeat,linear-gradient(var(--ink) 0 0) left top/.6em .11em no-repeat,linear-gradient(var(--ink) 0 0) left bottom/.6em .11em no-repeat,linear-gradient(var(--ink) 0 0) right top/.6em .11em no-repeat,linear-gradient(var(--ink) 0 0) right bottom/.6em .11em no-repeat;background-origin:border-box;}
.lines{list-style:none;padding:0;display:grid;gap:calc(${size === 'wide' ? 9 : 16}px * var(--k));}
.line{display:grid;grid-template-columns:1.3em minmax(0,1fr)${size === 'wide' ? ' auto' : ''};gap:.2em .5em;align-items:baseline;font-size:${size === 'wide' ? 23 : 31}em;line-height:1.38;font-weight:700;padding-top:calc(${size === 'wide' ? 8 : 14}px * var(--k));border-top:2px solid var(--line-strong);}
.line b{font-weight:800;font-stretch:68%;color:var(--ink-3);font-size:1.15em;}
.line__badges{font-size:.64em;${size === 'wide' ? 'justify-content:flex-end;' : 'grid-column:2;'}}
.line:nth-child(3){border-top-color:transparent;background:linear-gradient(to right,var(--ink) 0 1.4em,transparent 1.4em calc(100% - 1.4em),var(--ink) calc(100% - 1.4em)) top/100% 2px no-repeat;}
.line:nth-child(7){border-top-color:var(--clean);}
.brief-foot{font-size:${size === 'wide' ? 22 : 28}em;font-weight:700;color:var(--exhaust-ink);}
.band{flex:none;position:relative;height:${size === 'wide' ? 58 : 84}px;margin-inline:-64px;background:repeating-linear-gradient(-55deg,var(--art-haze) 0 3px,transparent 3px 13px);border-top:2px solid var(--art-haze);}
.band span{position:absolute;right:64px;top:50%;transform:translateY(-50%);padding:.15em .6em;background:var(--bg);border:1.5px solid var(--art-haze);color:var(--exhaust-ink);font-size:${size === 'wide' ? 17 : 22}px;font-weight:700;letter-spacing:.04em;white-space:nowrap;}
</style></head><body><div class="card" style="--k:1">
<div class="head">${mark}<span>${esc(site.name[locale])}</span><span class="host">${esc(host)}</span></div>
<div class="main"><div class="fit">${body}</div></div>
<div class="band"><span>${esc(share.band[locale])}</span></div>
</div></body></html>`;
}

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('\n✖ share cards: Playwright is not available here. Run this script on a machine that has it; CI only runs --check.\n');
  process.exit(1);
}

// The browser writes 24-bit PNGs quickly, not tightly. A card is a handful of flat colours and
// their anti-aliased edges, so it is re-encoded as an 8-bit PNG (256-colour palette, no
// dithering): still PNG, so every Open Graph consumer accepts it as before, at about a third of
// the size. Measured against the browser's own file, a few thousand edge pixels move by at
// most 16 levels in 255; nothing a reader can see. sharp is already in node_modules as a
// dependency of Astro; without it the card is written as the browser made it.
let sharp = null;
try {
  sharp = require('sharp');
} catch {
  console.warn('  ! sharp is not installed: cards are written unoptimised (about three times larger).');
}
const pack = async (png) => {
  if (!sharp) return png;
  const packed = await sharp(png).png({ palette: true, colours: 256, dither: 0, compressionLevel: 9, effort: 10 }).toBuffer();
  return packed.length < png.length ? packed : png;
};

const todo = jobs.filter((j) => !only.length || only.some((o) => j.id.includes(o)));
const tmp = mkdtempSync(join(tmpdir(), 'share-cards-'));
const browser = await chromium.launch();
const manifestPath = join(OUT, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { cards: {} };
try {
  for (const job of todo) {
    mkdirSync(join(OUT, job.dir), { recursive: true });
    for (const size of ['wide', 'square']) {
      const [width, height] = SIZES[size];
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const file = join(tmp, `${job.dir}-${job.id}-${size}.html`);
      writeFileSync(file, html(job, size));
      await page.goto(pathToFileURL(file).href);
      await page.evaluate(() => document.fonts.ready);
      // shrink the type until the card's content fits, so no line is ever clipped
      const k = await page.evaluate(async () => {
        const card = document.querySelector('.card');
        const main = document.querySelector('.main');
        // start large on the square card, where short copy would otherwise float in empty space
        let k = innerHeight > innerWidth * 0.8 ? 1.5 : 1.12;
        card.style.setProperty('--k', String(k));
        const fit = document.querySelector('.fit');
        const over = () => fit.offsetHeight > main.clientHeight - 46 || fit.scrollWidth > main.clientWidth + 1;
        while (over() && k > 0.5) card.style.setProperty('--k', String((k -= 0.02)));
        await document.fonts.ready;
        return k;
      });
      if (k <= 0.5) console.warn(`  ! ${key(job)} (${size}) is very long: type shrunk to ${Math.round(k * 100)}%`);
      const shot = await page.screenshot({ type: 'png' });
      writeFileSync(join(OUT, job.dir, `${job.id}${size === 'square' ? '-sq' : ''}.png`), await pack(shot));
      await page.close();
    }
    manifest.cards[key(job)] = hashOf(job);
    console.log(`  ✓ ${key(job)}`);
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
manifest.template = TEMPLATE;
manifest.cards = Object.fromEntries(Object.entries(manifest.cards).filter(([k]) => jobs.some((j) => key(j) === k)).sort());
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n✔ share cards: rendered ${todo.length} card(s) × 2 sizes into public/share/. Commit them.`);
