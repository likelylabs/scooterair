#!/usr/bin/env node
// Share-card generator (brief 7.9, 8.3). One card per page that is shared, in both languages:
// a poster seen at thumbnail size, 1200 × 630, the page's one og:image.
//
//   npm run share-cards                    build the card pages, render every card into public/share/{zh,en}/
//   npm run share-cards -- smell           render only the cards whose id contains "smell"
//   npm run share-cards -- --dist <dir>    photograph an existing build made with SA_SHARE_CARDS=1 (no build)
//   npm run share-cards -- --out <dir>     write the PNGs somewhere else (a preview; the manifest is not touched)
//   npm run share-cards -- --check         no browser: verify that the committed PNGs exist and were rendered
//                                          from the current words and pictures (part of `npm run check`)
//
// HOW IT DRAWS. Each card is a page of the site, /print/card/<id>/ (src/pages/[...lang]/print/card/[id].astro),
// built only when SA_SHARE_CARDS=1. The page draws its picture with the scenes' own figures and the
// air() rule, composed for the card's shape in src/components/art/card-art.ts, so cards, pages,
// poster and film share one picture grammar; its words come from src/lib/share-cards.ts. This
// script builds those pages into a scratch folder, serves them, sets each headline as large as its
// box allows, and photographs the card at 1200 × 630 with the Playwright and Chromium already on
// the machine. CI runs only --check.
//
// One size only. The card keeps its headline and its people inside the central 630 × 630 square,
// so LINE's square crop and the 4:3 crops of some Android previews keep what matters; a separate
// square image is not needed (and a second og:image makes iMessage show a split collage).
//
// WHAT --check COMPARES. A hash of: the template version, every card's words, and the source
// files the pictures are drawn from (the art folder, the card page, the art and token
// stylesheets). Change any of them, run this script, commit public/share/.
//
// Output:  public/share/<zh|en>/<id>.png      1200 × 630  (og:image, and the picture in ShareBlock)
//          public/share/manifest.json         hash per card, read by --check
//
// The PNGs are re-encoded with sharp as 8-bit palette PNGs (see pack()): about a third of the
// bytes, no visible change, and still PNG, which every link-preview consumer takes.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.removeAllListeners('warning');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(resolve(root, p)).href);
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const DIST = opt('--dist');
const OUT_ARG = opt('--out');
const only = args.filter((a, i) => !a.startsWith('--') && !['--dist', '--out'].includes(args[i - 1]));

/** Bump when the card design changes, so --check asks for a re-render. */
const TEMPLATE = 7;
const OUT = OUT_ARG ? resolve(OUT_ARG) : join(root, 'public/share');
const MANIFEST = join(root, 'public/share/manifest.json');
const SIZE = [1200, 630];

const { shareCardIds, shareCardContent } = await load('src/lib/share-cards.ts');
const { site } = await load('src/i18n/ui.ts');

// ---- what the pictures are drawn from ------------------------------------------------
const PICTURE_SOURCES = ['src/components/art', 'src/pages/[...lang]/print/card', 'src/styles/art.css', 'src/styles/tokens.css'];
function filesUnder(p) {
  const abs = join(root, p);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isFile()) return [abs];
  return readdirSync(abs, { recursive: true })
    .map((f) => join(abs, String(f)))
    .filter((f) => statSync(f).isFile() && !f.includes('__tests__'))
    .sort();
}
const pictureHash = createHash('sha256');
for (const f of PICTURE_SOURCES.flatMap(filesUnder)) pictureHash.update(f.slice(root.length)).update(readFileSync(f));
const pictures = pictureHash.digest('hex');

const locales = [
  ['zh-TW', 'zh'],
  ['en', 'en'],
];
const jobs = [];
for (const [locale, dir] of locales) for (const id of shareCardIds) jobs.push({ locale, dir, id, content: shareCardContent(id, locale) });
const hashOf = (job) => createHash('sha256').update(JSON.stringify([TEMPLATE, job.content, site.name[job.locale], pictures])).digest('hex').slice(0, 16);
const key = (job) => `${job.dir}/${job.id}`;
/** PNGs in public/share/{zh,en} that are no card's (the square cards of template 6 and older). */
const strays = () =>
  locales.flatMap(([, d]) => (existsSync(join(OUT, d)) ? readdirSync(join(OUT, d)).filter((f) => f.endsWith('.png') && !jobs.some((j) => j.dir === d && `${j.id}.png` === f)).map((f) => `${d}/${f}`) : []));

// ---- check mode: no browser ---------------------------------------------------
if (CHECK) {
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { cards: {} };
  const bad = [];
  for (const job of jobs) {
    if (!existsSync(join(OUT, `${key(job)}.png`))) bad.push(`missing public/share/${key(job)}.png`);
    if (manifest.cards[key(job)] !== hashOf(job)) bad.push(`out of date: ${key(job)} (its words or its picture changed since it was rendered)`);
  }
  for (const f of strays()) bad.push(`not a card any more: public/share/${f} (a full render removes it)`);
  if (bad.length) {
    console.error(`\n✖ share cards: ${bad.length} problem(s). Run \`npm run share-cards\` and commit public/share/.\n`);
    for (const b of [...new Set(bad)]) console.error(`  ${b}`);
    console.error('');
    process.exit(1);
  }
  console.log(`✔ share cards: ${jobs.length} cards present and current.`);
  process.exit(0);
}

// ---- render ----------------------------------------------------------------------
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('\n✖ share cards: Playwright is not available here. Run this script on a machine that has it; CI only runs --check.\n');
  process.exit(1);
}
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

// 1. the card pages
const tmp = mkdtempSync(join(tmpdir(), 'share-cards-'));
let dist = DIST ? resolve(DIST) : join(tmp, 'dist');
if (!DIST) {
  console.log('  … building the card pages (astro build with SA_SHARE_CARDS=1)');
  const env = { ...process.env, SA_SHARE_CARDS: '1' };
  delete env.BASE_PATH; // the scratch build is served from /
  const r = spawnSync('npx', ['astro', 'build', '--outDir', dist], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stdout.slice(-4000), r.stderr.slice(-4000));
    console.error('\n✖ share cards: the build failed.\n');
    process.exit(1);
  }
}
if (!existsSync(join(dist, 'print/card'))) {
  console.error(`\n✖ share cards: ${dist} has no print/card/ pages. Build it with SA_SHARE_CARDS=1 (and no BASE_PATH).\n`);
  process.exit(1);
}

// 2. serve it, with the CJK body font available to the page (a card is an image: it carries its own font)
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const NM = join(root, 'node_modules');
const server = createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = p.startsWith('/__nm/') ? join(NM, p.slice(6)) : join(dist, p.endsWith('/') ? p + 'index.html' : p);
  try {
    const d = readFileSync(f);
    res.writeHead(200, { 'content-type': mime[extname(f)] ?? 'application/octet-stream' });
    res.end(d);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;
const bodyFont = readFileSync(join(NM, '@fontsource-variable/noto-sans-tc/wght.css'), 'utf8')
  .replaceAll("'Noto Sans TC Variable'", "'Noto Sans CJK TC'")
  .replaceAll('url(./files/', `url(${base}/__nm/@fontsource-variable/noto-sans-tc/files/`);

// 3. photograph
const todo = jobs.filter((j) => !only.length || only.some((o) => j.id.includes(o)));
const browser = await chromium.launch();
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { cards: {} };
try {
  for (const job of todo) {
    mkdirSync(join(OUT, job.dir), { recursive: true });
    const [width, height] = SIZE;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: 'light' });
    await page.goto(`${base}${job.locale === 'en' ? '/en' : ''}/print/card/${job.id}/`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: bodyFont });
    // the site's motion setting gives every property a 0.01 ms transition; a transition keeps the
    // old size until the next frame, so the fitting loop below would never see its own change
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
    await page.evaluate(() => document.fonts.ready);
    // set the headline as large as its box allows: shrink it until every phrase fits across and
    // the last line ends inside the box (card-art.ts puts the box in the central square)
    const k = await page.evaluate(async () => {
      const card = document.querySelector('[data-card]');
      const head = document.querySelector('.card__head');
      const title = document.querySelector('.card__title');
      let k = 1;
      card.style.setProperty('--k', String(k));
      const over = () => {
        const h = head.getBoundingClientRect();
        const t = title.getBoundingClientRect();
        const phrases = [...title.querySelectorAll('.phrase')].map((s) => s.getBoundingClientRect());
        return t.bottom > h.bottom + 1 || phrases.some((s) => s.left < h.left - 1 || s.right > h.right + 1) || title.scrollWidth > title.clientWidth + 1;
      };
      while (over() && k > 0.5) card.style.setProperty('--k', String((k -= 0.02)));
      await document.fonts.ready;
      return k;
    });
    if (k <= 0.6) console.warn(`  ! ${key(job)}: the headline is long for its box, set at ${Math.round(k * 100)}%`);
    const shot = await page.screenshot({ type: 'png' });
    writeFileSync(join(OUT, job.dir, `${job.id}.png`), await pack(shot));
    await page.close();
    manifest.cards[key(job)] = hashOf(job);
    console.log(`  ✓ ${key(job)}`);
  }
} finally {
  await browser.close();
  server.close();
  rmSync(tmp, { recursive: true, force: true });
}
if (!OUT_ARG) {
  if (!only.length) for (const f of strays()) rmSync(join(OUT, f));
  manifest.template = TEMPLATE;
  manifest.cards = Object.fromEntries(Object.entries(manifest.cards).filter(([k]) => jobs.some((j) => key(j) === k)).sort());
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n✔ share cards: rendered ${todo.length} card(s) into public/share/. Commit them.`);
} else {
  console.log(`\n✔ share cards: rendered ${todo.length} card(s) into ${OUT} (preview; manifest untouched).`);
}
