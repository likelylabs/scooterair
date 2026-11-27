#!/usr/bin/env node
// The film as a vertical MP4 for sharing on LINE (redesign brief 8.2, change 24).
//
//   node scripts/film-export.mjs                 build the site into a scratch folder, render both
//                                                languages into public/film/, write the manifest
//   node scripts/film-export.mjs --lang zh       one language only (zh | en)
//   node scripts/film-export.mjs --dist <dir>    photograph an existing build (made with BASE_PATH=/) instead of building
//   node scripts/film-export.mjs --out <dir>     write somewhere else (a preview; the manifest is not touched)
//   node scripts/film-export.mjs --frames 12,48.6,104   write PNG frames at those seconds instead of a video (to look at)
//   node scripts/film-export.mjs --check         no browser, no ffmpeg: do the committed files exist, and
//                                                were they rendered from the current film?
//
// HOW IT RENDERS. The MP4 is not a second film. It is the page /90/ itself: with `?export` in
// the address the player lays its stage out to fill a 9:16 window (picture above, caption
// below, no controls) and plays nothing. This script opens that page in headless Chromium at
// 360 × 640 CSS pixels and 3 device pixels to the pixel (1080 × 1920), steps the film's one
// clock a frame at a time through window.__film.drawAt(t), photographs every frame and pipes
// them to ffmpeg. So the video shows exactly the timeline, captions and numbers the page
// shows, with the captions burnt in.
//
// THE NUMBERS IN IT. The air numbers are the estimate slots. The money figures are those of
// the day the prices were last checked (the chip in the picture says which day), not of the
// day the script runs, so the file goes out of date only when the prices are checked again.
//
// WHAT --check COMPARES. A hash of: the film's source files (scene, timeline, HUD, player,
// page), the drawing kit and the air rule it draws with, the art and token stylesheets, the
// captions and every number in them in both languages, and the export settings below. Change
// any of them, run this script, commit public/film/.
//
// Output:  public/film/scooterair-film-zh.mp4   1080 × 1920, H.264, no sound, captions burnt in
//          public/film/scooterair-film-en.mp4
//          public/film/manifest.json            hash, size, length and one entry per file
//
// Needs: Playwright with Chromium, and ffmpeg, on the machine that renders. CI runs only --check.

import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.removeAllListeners('warning');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => import(pathToFileURL(resolve(root, p)).href);
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const CHECK = args.includes('--check');
const DIST = opt('--dist');
const OUT = opt('--out') ? resolve(opt('--out')) : join(root, 'public/film');
const FRAMES = opt('--frames');
const ONLY = opt('--lang');

/** Export settings. Changing any of them asks --check for a re-render. */
const SETTINGS = { version: 1, width: 1080, height: 1920, css: [360, 640], fps: 25, crf: 23, preset: 'slow', jpeg: 93 };
const MANIFEST = join(root, 'public/film/manifest.json');
const LOCALES = [
  ['zh-TW', 'zh', ''],
  ['en', 'en', '/en'],
].filter(([, short]) => !ONLY || ONLY === short);
const fileOf = (short) => `scooterair-film-${short}.mp4`;

// ---- what the film is rendered from ---------------------------------------------------
const SOURCES = [
  'src/components/pages/film/scene.ts',
  'src/components/pages/film/timeline.ts',
  'src/components/pages/film/hud.ts',
  'src/components/pages/film/film.client.ts',
  'src/components/pages/film/film-data.ts',
  'src/components/pages/film/Film.astro',
  'src/components/art/parts.ts',
  'src/components/art/air.ts',
  'src/components/art/air-slots.ts',
  'src/styles/art.css',
  'src/styles/tokens.css',
];
const { filmData } = await load('src/components/pages/film/film-data.ts');
const { DURATION } = await load('src/components/pages/film/timeline.ts');
const { AIR_EXTRA } = await load('src/components/art/air-slots.ts');

/** The words and numbers the MP4 shows in one language: the captions, and everything drawn in the picture. */
function shown(locale) {
  const d = filmData(locale, { asChecked: true });
  return { captions: d.captions.map((c) => [c.t, c.main, c.note ?? '', c.chip?.label ?? '']), text: { ...d.text, glyphs: undefined }, asOf: d.money.checkedOn };
}
function inputsHash() {
  const h = createHash('sha256');
  for (const f of SOURCES) {
    const abs = join(root, f);
    if (!existsSync(abs)) throw new Error(`film-export: ${f} is missing`);
    h.update(f).update(readFileSync(abs));
  }
  h.update(JSON.stringify([SETTINGS, AIR_EXTRA, shown('zh-TW'), shown('en')]));
  return h.digest('hex').slice(0, 16);
}
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const hash = inputsHash();

// ---- --check ---------------------------------------------------------------------------
if (CHECK) {
  const bad = [];
  const m = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : null;
  if (!m) bad.push('public/film/manifest.json is missing: the film has not been exported');
  else {
    if (m.hash !== hash) bad.push('out of date: the film (its timeline, captions, numbers, drawings or styles) changed since the MP4 was rendered');
    for (const [locale, short] of [['zh-TW', 'zh'], ['en', 'en']]) {
      const e = m.files?.[locale];
      const f = join(root, 'public/film', fileOf(short));
      if (!e) bad.push(`the manifest has no entry for ${locale}`);
      else if (!existsSync(f)) bad.push(`missing public/film/${fileOf(short)}`);
      else if (statSync(f).size !== e.bytes || sha256(f) !== e.sha256) bad.push(`public/film/${fileOf(short)} is not the file the manifest describes`);
    }
    if (m.duration !== DURATION) bad.push(`the manifest says ${m.duration} s but the timeline is ${DURATION} s`);
  }
  if (bad.length) {
    console.error(`\n✖ film MP4: ${bad.length} problem(s). Run \`node scripts/film-export.mjs\` and commit public/film/.\n`);
    for (const b of bad) console.error(`  ${b}`);
    process.exit(1);
  }
  console.log(`✔ film MP4: 2 languages present and rendered from the current film (${m.width} × ${m.height}, ${m.duration} s, prices as of ${m.asOf}).`);
  process.exit(0);
}

// ---- tools -----------------------------------------------------------------------------
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('film-export: Playwright is not installed here. Install it (npm i -D playwright && npx playwright install chromium) on the machine that renders; CI only runs --check.');
  process.exit(1);
}
if (!FRAMES && spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.error('film-export: ffmpeg is not installed here.');
  process.exit(1);
}

// ---- the site to photograph ------------------------------------------------------------
let dist = DIST ? resolve(DIST) : null;
let scratch = null;
if (!dist) {
  scratch = mkdtempSync(join(tmpdir(), 'film-export-'));
  dist = join(scratch, 'dist');
  console.log('film-export: building the site …');
  const run = spawnSync('npx', ['astro', 'build', '--outDir', dist], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, BASE_PATH: '/' } });
  if (run.status !== 0) {
    console.error('film-export: the build failed.');
    process.exit(1);
  }
}
if (!existsSync(join(dist, '90/index.html'))) {
  console.error(`film-export: no /90/ page in ${dist}`);
  process.exit(1);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.json': 'application/json', '.xml': 'text/xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const server = createServer((req, res) => {
  const p = decodeURIComponent((req.url ?? '/').split('?')[0]);
  // /__nm/ serves the Noto Sans TC the project already depends on, for the alias below
  const file = p.startsWith('/__nm/') ? join(root, 'node_modules', p.slice(6)) : join(dist, p.endsWith('/') ? p + 'index.html' : p);
  if (!file.startsWith(root) && !file.startsWith(dist)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'access-control-allow-origin': '*' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

/**
 * The site's body text uses the reader's own system font for Chinese (PingFang TC on a phone,
 * Noto Sans CJK TC on Android). A render machine may have neither, so the same Noto Sans TC the
 * headlines use is offered under both names: every machine then draws the same video.
 */
function fontAlias() {
  const cssFile = join(root, 'node_modules/@fontsource-variable/noto-sans-tc/wght.css');
  if (!existsSync(cssFile)) return '';
  const css = readFileSync(cssFile, 'utf8').replaceAll('url(./files/', `url(${base}/__nm/@fontsource-variable/noto-sans-tc/files/`);
  return ['Noto Sans CJK TC', 'PingFang TC'].map((name) => css.replaceAll("'Noto Sans TC Variable'", `'${name}'`)).join('\n');
}

const browser = await chromium.launch();
const [cssW, cssH] = SETTINGS.css;
const written = {};
try {
  mkdirSync(OUT, { recursive: true });
  for (const [locale, short, prefix] of LOCALES) {
    const ctx = await browser.newContext({ viewport: { width: cssW, height: cssH }, deviceScaleFactor: SETTINGS.width / cssW, colorScheme: 'light', reducedMotion: 'no-preference', locale: locale === 'en' ? 'en-GB' : 'zh-TW' });
    const page = await ctx.newPage();
    const problems = [];
    page.on('pageerror', (e) => problems.push(e.message));
    await page.goto(`${base}${prefix}/90/?export=1`, { waitUntil: 'load' });
    await page.addStyleTag({ content: fontAlias() });
    await page.waitForSelector('html[data-film-ready]', { timeout: 30000 });
    const total = await page.evaluate(() => window.__film.duration);
    if (Math.abs(total - DURATION) > 1e-6) throw new Error(`the page's film is ${total} s but the timeline is ${DURATION} s: is --dist an old build?`);
    // the page must show what the hash describes
    const want = shown(locale).captions.map((c) => `${c[1]}|${c[2]}`).join('\n');
    const got = await page.evaluate(() => window.__film.captions.map((c) => `${c.main}|${c.note ?? ''}`).join('\n'));
    if (want !== got) throw new Error(`the page's captions (${locale}) are not the current ones: is --dist an old build?`);
    // warm every glyph the film will ask for, so no frame is photographed before its font has arrived
    for (let t = 0; t <= total; t += 0.5) await page.evaluate((time) => window.__film.drawAt(time), t);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);

    const drawAt = async (t) => {
      await page.evaluate((time) => window.__film.drawAt(time), t);
    };

    if (FRAMES) {
      for (const t of FRAMES.split(',').map(Number)) {
        await drawAt(t);
        const f = join(OUT, `frame-${short}-${t.toFixed(1).padStart(5, '0')}.png`);
        await page.screenshot({ path: f });
        console.log(f);
      }
      await ctx.close();
      continue;
    }

    const file = join(OUT, fileOf(short));
    const n = Math.round(total * SETTINGS.fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(SETTINGS.fps), '-i', '-', '-vf', `scale=${SETTINGS.width}:${SETTINGS.height}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', SETTINGS.preset, '-crf', String(SETTINGS.crf), '-tune', 'animation', '-movflags', '+faststart', '-an', '-metadata', `title=${locale === 'en' ? 'One red light — ScooterAir' : '一個紅燈｜行人呼吸'}`, file], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited with ${code}`)))));
    const t0 = Date.now();
    for (let i = 0; i <= n; i++) {
      await drawAt(Math.min(total, i / SETTINGS.fps));
      const shot = await page.screenshot({ type: 'jpeg', quality: SETTINGS.jpeg });
      if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 250 === 0) console.log(`film-export: ${short} frame ${i} / ${n} (${Math.round((Date.now() - t0) / 1000)} s)`);
    }
    ff.stdin.end();
    await done;
    if (problems.length) throw new Error(`the page reported errors while rendering: ${problems.join('; ')}`);
    await ctx.close();

    // what ffmpeg wrote
    const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,nb_frames,avg_frame_rate:format=duration', '-of', 'json', file], { encoding: 'utf8' });
    const info = probe.status === 0 ? JSON.parse(probe.stdout) : null;
    const s = info?.streams?.[0];
    if (!s || s.width !== SETTINGS.width || s.height !== SETTINGS.height) throw new Error(`${file} is not ${SETTINGS.width} × ${SETTINGS.height}`);
    if (Math.abs(Number(info.format.duration) - total) > 0.2) throw new Error(`${file} lasts ${info.format.duration} s, the film ${total} s`);
    written[locale] = { file: fileOf(short), bytes: statSync(file).size, sha256: sha256(file), frames: Number(s.nb_frames) };
    console.log(`✔ ${file}: ${(written[locale].bytes / 1e6).toFixed(1)} MB, ${s.nb_frames} frames`);
  }
} finally {
  await browser.close();
  server.close();
  if (scratch) rmSync(scratch, { recursive: true, force: true });
}

if (!FRAMES && !opt('--out')) {
  const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  // a one-language run keeps the other language's entry only if it was rendered from the same film
  const files = { ...(prev.hash === hash ? prev.files : {}), ...written };
  const manifest = { version: SETTINGS.version, hash, width: SETTINGS.width, height: SETTINGS.height, fps: SETTINGS.fps, duration: DURATION, asOf: shown('zh-TW').asOf, files };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  const stray = readdirSync(OUT).filter((f) => f.endsWith('.mp4') && !Object.values(files).some((e) => e.file === f));
  if (stray.length) console.warn(`film-export: public/film/ also holds ${stray.join(', ')}, which the manifest does not name`);
  console.log(`✔ film MP4: manifest written (${Object.keys(files).length} of 2 languages). Commit public/film/.`);
}
