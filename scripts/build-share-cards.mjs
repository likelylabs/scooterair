#!/usr/bin/env node
// Share-card generator (brief 7.9, 8.3). One picture and one line per card, in both languages
// and two sizes; a card with an estimated number carries 推估 and its range INSIDE the image,
// so a screenshot cannot shed it.
//
//   npm run share-cards                    build the card pages, render every card into public/share/{zh,en}/
//   npm run share-cards -- smell           render only the cards whose id contains "smell"
//   npm run share-cards -- --dist <dir>    photograph an existing build made with SA_SHARE_CARDS=1 (no build)
//   npm run share-cards -- --out <dir>     write the PNGs somewhere else (a preview; the manifest is not touched)
//   npm run share-cards -- --check         no browser: verify that the committed PNGs exist and were rendered
//                                          from the current words and pictures (part of `npm run check`)
//
// HOW IT DRAWS. Each card is a page of the site, /print/card/<id>/ (src/pages/[...lang]/print/card/[id].astro),
// built only when SA_SHARE_CARDS=1. The page draws its picture with the site's own scenes and
// air() rule, so cards, pages, poster and film share one picture grammar, and its words come
// from src/lib/share-cards.ts. This script builds those pages into a scratch folder, serves
// them, and photographs each at 1200 × 630 and 1080 × 1080 with the Playwright and Chromium
// already on the machine. CI runs only --check.
//
// WHAT --check COMPARES. A hash of: the template version, every card's words, and the source
// files the pictures are drawn from (the art folder, lane J's picture modules, the card page,
// the art and token stylesheets). Change any of them, run this script, commit public/share/.
//
// Output:  public/share/<zh|en>/<id>.png      1200 × 630  (og:image)
//          public/share/<zh|en>/<id>-sq.png   1080 × 1080 (LINE and other square previews)
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
const TEMPLATE = 6;
const OUT = OUT_ARG ? resolve(OUT_ARG) : join(root, 'public/share');
const MANIFEST = join(root, 'public/share/manifest.json');
const SIZES = { wide: [1200, 630], square: [1080, 1080] };

const { shareCardIds, shareCardContent } = await load('src/lib/share-cards.ts');
const { site } = await load('src/i18n/ui.ts');

// ---- what the pictures are drawn from ------------------------------------------------
const PICTURE_SOURCES = ['src/components/art', 'src/components/pages/action/art.ts', 'src/components/pages/action/Picture.astro', 'src/pages/[...lang]/print/card', 'src/styles/art.css', 'src/styles/tokens.css'];
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

// ---- check mode: no browser ---------------------------------------------------
if (CHECK) {
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { cards: {} };
  const bad = [];
  for (const job of jobs) {
    for (const f of [`${key(job)}.png`, `${key(job)}-sq.png`]) if (!existsSync(join(OUT, f))) bad.push(`missing public/share/${f}`);
    if (manifest.cards[key(job)] !== hashOf(job)) bad.push(`out of date: ${key(job)} (its words or its picture changed since it was rendered)`);
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
    for (const size of ['wide', 'square']) {
      const [width, height] = SIZES[size];
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: 'light' });
      await page.goto(`${base}${job.locale === 'en' ? '/en' : ''}/print/card/${job.id}/`, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: bodyFont });
      await page.evaluate(() => document.fonts.ready);
      // shrink the words until they fit, so no line is ever clipped
      const k = await page.evaluate(async () => {
        const card = document.querySelector('.card');
        const text = document.querySelector('.card__text');
        // the square card is seen smaller (LINE): start larger and shrink to fit
        let k = innerHeight > innerWidth * 0.8 ? 1.45 : 1;
        card.style.setProperty('--k', String(k));
        const over = () => text.scrollHeight > text.clientHeight + 1 || text.scrollWidth > text.clientWidth + 1;
        while (over() && k > 0.55) card.style.setProperty('--k', String((k -= 0.03)));
        await document.fonts.ready;
        return k;
      });
      if (k <= 0.55) console.warn(`  ! ${key(job)} (${size}) is very long: words shrunk to ${Math.round(k * 100)}%`);
      const shot = await page.screenshot({ type: 'png' });
      writeFileSync(join(OUT, job.dir, `${job.id}${size === 'square' ? '-sq' : ''}.png`), await pack(shot));
      await page.close();
    }
    manifest.cards[key(job)] = hashOf(job);
    console.log(`  ✓ ${key(job)}`);
  }
} finally {
  await browser.close();
  server.close();
  rmSync(tmp, { recursive: true, force: true });
}
if (!OUT_ARG) {
  manifest.template = TEMPLATE;
  manifest.cards = Object.fromEntries(Object.entries(manifest.cards).filter(([k]) => jobs.some((j) => key(j) === k)).sort());
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n✔ share cards: rendered ${todo.length} card(s) × 2 sizes into public/share/. Commit them.`);
} else {
  console.log(`\n✔ share cards: rendered ${todo.length} card(s) × 2 sizes into ${OUT} (preview; manifest untouched).`);
}
