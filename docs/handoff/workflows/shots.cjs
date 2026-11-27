#!/usr/bin/env node
/*
 * shots.cjs — photograph every picture on the site that draws air marks, the way a phone shows it.
 *
 *   node shots.cjs <distDir> <outDir> [name-filter]
 *
 * <distDir> is an `npx astro build --outDir <dir>` build made with the default base path ("/").
 * The script serves it itself (plain node http, directory -> index.html) on a free port and writes
 * PNGs at 390 CSS px wide, deviceScaleFactor 2, into <outDir>. Each PNG is an element screenshot
 * of the picture plus what sits around it (number box, tag, key, switch), not the whole page.
 * An optional third argument keeps only shots whose file name contains it (e.g. "kerb").
 *
 * Before each shot the picture is scrolled into view, its one-time arrival (SceneFrame
 * data-arrive -> is-armed -> is-arrived) is waited for, and every finite CSS animation and
 * transition inside it is awaited. Infinite drift (.air--drift) keeps running; it moves marks
 * by a few px only.
 *
 * HOOKS this script relies on (keep them, or change the HOOKS table below):
 *   home       article[data-screen][data-n="N"]   (Screen.astro)  and its  .screen__stage
 *   scenario   [data-seg="scenario"] label.seg__opt > input[data-pick-input="scenario"][value=few|dozen|full]
 *              (Segmented/ScenarioSwitch), and data-pick-scenario on the <article> after a click
 *   scenes     figure.scene[data-arrive], .is-armed / .is-arrived (SceneFrame + arrive.client.ts)
 *   estimate   #drawing details[data-section-fold], #drawing .es-draw (estimate.astro)
 *   smell      /questions/smell/  article[data-screen]:has(.scene--tailpipe) .screen__stage
 *   film       html[data-film-ready], window.__film.drawAt(t), [data-stage], li[data-still-t]
 *   card       /print/card/home/ .card (only in a build made with SA_SHARE_CARDS=1); otherwise
 *              /print/poster/ .poster__pic, which draws the same <Picture kind="kerb" scenario="dozen">
 *
 * Exit code 1 if any shot failed; the others are still written. Each failure names the hook.
 */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  try {
    const { execSync } = require('node:child_process');
    const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
    ({ chromium } = require(path.join(root, 'playwright')));
  } catch (e) {
    console.error('shots: cannot load playwright (require("playwright") failed, also from `npm root -g`).');
    process.exit(2);
  }
}

const [distArg, outArg, filter] = process.argv.slice(2);
if (!distArg || !outArg) {
  console.error('usage: node shots.cjs <distDir> <outDir> [name-filter]');
  process.exit(2);
}
const DIST = path.resolve(distArg);
const OUT = path.resolve(outArg);
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error(`shots: ${DIST}/index.html not found: is this an astro build output folder?`);
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

/* ---- static server ----------------------------------------------------------------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.txt': 'text/plain', '.xml': 'application/xml', '.pdf': 'application/pdf',
};
function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const abs = path.normalize(path.join(DIST, p));
  if (!abs.startsWith(DIST)) return null;
  const tries = [abs, path.join(abs, 'index.html'), abs + '.html'];
  for (const f of tries) {
    try {
      if (fs.statSync(f).isFile()) return f;
    } catch {}
  }
  return null;
}
const server = http.createServer((req, res) => {
  const f = resolveFile(req.url || '/');
  if (!f) {
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'not found');
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

/* ---- hooks ------------------------------------------------------------------------------- */
const HOOKS = {
  screen: (n) => `article[data-screen][data-n="${n}"]`,
  stage: (n) => `article[data-screen][data-n="${n}"] .screen__stage`,
  scenarioLabel: (n, v) => `article[data-screen][data-n="${n}"] [data-seg="scenario"] label.seg__opt:has(input[data-pick-input="scenario"][value="${v}"])`,
  estimate: '#drawing .es-draw',
  smell: 'article[data-screen]:has(.scene--tailpipe) .screen__stage',
  filmStage: '[data-stage]',
  card: '.card',
  posterPic: '.poster__pic',
};
const HOME = { hero: 1, tailpipe: 2, plan: 3, kerb: 4, heights: 8, rider: 9, mask: 10, swap: 11, ten: 12, green: 15 };

/* ---- helpers ----------------------------------------------------------------------------- */
const T = 20000;
async function need(page, sel, what) {
  try {
    await page.waitForSelector(sel, { state: 'attached', timeout: T });
  } catch {
    throw new Error(`hook missing: ${what} — selector ${sel} not found on ${page.url()}`);
  }
  return page.locator(sel).first();
}

/** Wait until every scene inside `loc` has finished its one-time arrival and every finite animation/transition in it is done. */
async function settle(page, loc) {
  await loc.scrollIntoViewIfNeeded();
  // a scene armed for arrival plays once a third of it is on screen
  await page.waitForFunction(
    (el) => ![...el.querySelectorAll('[data-arrive]'), ...(el.matches('[data-arrive]') ? [el] : [])].some((s) => s.classList.contains('is-armed')),
    await loc.elementHandle(),
    { timeout: 10000 },
  ).catch(() => console.warn(`  (a scene in ${page.url()} stayed armed for 10 s; shooting anyway)`));
  await page.evaluate(async (el) => {
    const finite = () =>
      el.getAnimations({ subtree: true }).filter((a) => {
        const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
        return t && Number.isFinite(t.endTime) && a.playState !== 'finished' && a.playState !== 'idle';
      });
    const deadline = Date.now() + 9000;
    for (let i = 0; i < 4 && Date.now() < deadline; i++) {
      const list = finite();
      if (!list.length) break;
      await Promise.race([Promise.all(list.map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, deadline - Date.now()))]);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    await document.fonts.ready;
  }, await loc.elementHandle());
  await page.waitForTimeout(150);
}

async function shoot(loc, file) {
  // a fixed or sticky bar elsewhere on the page (header, rail, bottom bar) would be photographed over
  // the picture where it meets the viewport's edge: hide those for the shot, then put them back
  const el = await loc.elementHandle();
  await el.evaluate((t) => {
    for (const e of document.body.querySelectorAll('*')) {
      if (e.contains(t) || t.contains(e)) continue;
      const p = getComputedStyle(e).position;
      if (p === 'fixed' || p === 'sticky') {
        e.setAttribute('data-shots-hidden', e.style.visibility || '-');
        e.style.visibility = 'hidden';
      }
    }
  });
  // put the element's top at the top of the viewport (a sticky header's scroll-margin would otherwise
  // push its bottom past the viewport, and Chromium paints nothing there); grow the viewport if it is taller
  const page = loc.page();
  const vp = page.viewportSize();
  const h = await el.evaluate((t) => t.getBoundingClientRect().height);
  if (h > vp.height - 2) await page.setViewportSize({ width: vp.width, height: Math.ceil(h) + 8 });
  await el.evaluate((t) => window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY));
  await page.waitForTimeout(100);
  await loc.screenshot({ path: path.join(OUT, file), animations: 'allow' });
  if (h > vp.height - 2) await page.setViewportSize(vp);
  await el.evaluate(() => {
    for (const e of document.querySelectorAll('[data-shots-hidden]')) {
      const v = e.getAttribute('data-shots-hidden');
      e.style.visibility = v === '-' ? '' : v;
      e.removeAttribute('data-shots-hidden');
    }
  });
  console.log(`  ✔ ${file}`);
}

/* ---- the shot list ----------------------------------------------------------------------- */
// ctx keys: zh | en | dark | nojs | film
const SHOTS = [
  { file: 'home-1.png', ctx: 'zh', url: '/', n: HOME.hero },
  { file: 'home-2.png', ctx: 'zh', url: '/', n: HOME.tailpipe },
  { file: 'home-kerb-few.png', ctx: 'zh', url: '/', n: HOME.kerb, scenario: 'few' },
  { file: 'home-kerb-dozen.png', ctx: 'zh', url: '/', n: HOME.kerb, scenario: 'dozen' },
  { file: 'home-kerb-full.png', ctx: 'zh', url: '/', n: HOME.kerb, scenario: 'full' },
  { file: 'home-heights.png', ctx: 'zh', url: '/', n: HOME.heights },
  { file: 'home-rider.png', ctx: 'zh', url: '/', n: HOME.rider },
  { file: 'home-mask.png', ctx: 'zh', url: '/', n: HOME.mask },
  { file: 'home-swap.png', ctx: 'zh', url: '/', n: HOME.swap },
  // extras: the other home pictures drawn with air()
  { file: 'home-plan.png', ctx: 'zh', url: '/', n: HOME.plan },
  { file: 'home-ten.png', ctx: 'zh', url: '/', n: HOME.ten },
  { file: 'home-green.png', ctx: 'zh', url: '/', n: HOME.green },
  { file: 'home-1-dark.png', ctx: 'dark', url: '/', n: HOME.hero },
  { file: 'home-kerb-full-dark.png', ctx: 'dark', url: '/', n: HOME.kerb, scenario: 'full' },
  { file: 'home-1-en.png', ctx: 'en', url: '/en/', n: HOME.hero },
  { file: 'home-1-nojs.png', ctx: 'nojs', url: '/', n: HOME.hero },
  { file: 'estimate-key.png', ctx: 'zh', url: '/estimate/#drawing', estimate: true },
  { file: 'q-smell.png', ctx: 'zh', url: '/questions/smell/', sel: HOOKS.smell, what: 'smell question picture' },
  { file: 'film-still-1.png', ctx: 'zh', url: '/90/', film: 1 },
  { file: 'film-still-2.png', ctx: 'zh', url: '/90/', film: 4 },
  { file: 'card.png', ctx: 'zh', card: true },
].filter((s) => !filter || s.file.includes(filter));

const CONTEXTS = {
  zh: { colorScheme: 'light', locale: 'zh-TW' },
  en: { colorScheme: 'light', locale: 'en-GB' },
  dark: { colorScheme: 'dark', locale: 'zh-TW' },
  nojs: { colorScheme: 'light', locale: 'zh-TW', javaScriptEnabled: false },
};

async function run() {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  console.log(`shots: serving ${DIST} at ${base}, writing to ${OUT}`);
  const browser = await chromium.launch();
  const failures = [];
  const ctxs = {};
  const getCtx = async (key) => {
    if (!ctxs[key]) ctxs[key] = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'no-preference', ...CONTEXTS[key] });
    return ctxs[key];
  };
  try {
    for (const s of SHOTS) {
      console.log(`- ${s.file}`);
      const ctx = await getCtx(s.ctx);
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      try {
        if (s.card) await cardShot(page, base, s);
        else if (s.film) await filmShot(page, base, s);
        else {
          await page.goto(base + s.url, { waitUntil: 'load' });
          let loc;
          if (s.n) {
            await need(page, HOOKS.screen(s.n), `home screen ${s.n} (Screen.astro data-screen data-n)`);
            if (s.scenario) {
              const lab = await need(page, HOOKS.scenarioLabel(s.n, s.scenario), `scenario switch option "${s.scenario}" on screen ${s.n}`);
              loc = await need(page, HOOKS.stage(s.n), `.screen__stage of screen ${s.n}`);
              await settle(page, loc);
              await lab.scrollIntoViewIfNeeded();
              await lab.click();
              if (s.ctx !== 'nojs') {
                await page
                  .waitForFunction(([sel, v]) => document.querySelector(sel)?.getAttribute('data-pick-scenario') === v, [HOOKS.screen(s.n), s.scenario], { timeout: 5000 })
                  .catch(() => {
                    throw new Error(`clicking "${s.scenario}" did not set data-pick-scenario on screen ${s.n}`);
                  });
              }
            } else loc = await need(page, HOOKS.stage(s.n), `.screen__stage of screen ${s.n}`);
          } else if (s.estimate) {
            await need(page, '#drawing', '/estimate/ section #drawing');
            await page.evaluate(() => document.querySelectorAll('#drawing details').forEach((d) => (d.open = true)));
            loc = await need(page, HOOKS.estimate, 'the picture and key on /estimate/#drawing');
          } else loc = await need(page, s.sel, s.what);
          await settle(page, loc);
          await shoot(loc, s.file);
        }
        if (errors.length) console.warn(`  (page errors: ${errors.slice(0, 3).join(' | ')})`);
      } catch (e) {
        failures.push(`${s.file}: ${e.message.split('\n')[0]}`);
        console.error(`  ✖ ${s.file}: ${e.message.split('\n')[0]}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    for (const c of Object.values(ctxs)) await c.close();
    await browser.close();
    server.close();
  }
  if (failures.length) {
    console.error(`\nshots: ${failures.length} shot(s) failed:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`\nshots: ${SHOTS.length} PNG(s) in ${OUT}`);
}

/** /90/: drive the live player to the time of one of its own stills (li[data-still-t], index `s.film`). */
async function filmShot(page, base, s) {
  await page.goto(base + s.url, { waitUntil: 'load' });
  await need(page, 'li[data-still-t]', 'film stills (li[data-still-t])');
  const times = await page.$$eval('li[data-still-t]', (els) => els.map((e) => Number(e.getAttribute('data-still-t'))));
  const t = times[s.film];
  if (!Number.isFinite(t)) throw new Error(`film: no still number ${s.film} (found ${times.length})`);
  try {
    await page.waitForSelector('html[data-film-ready]', { state: 'attached', timeout: T });
  } catch {
    // no live player: shoot the pre-rendered still instead
    const li = page.locator('li[data-still-t]').nth(s.film);
    await settle(page, li);
    console.log(`  (live player not ready: using the no-JS still at ${t} s)`);
    return shoot(li, s.file);
  }
  const stage = await need(page, HOOKS.filmStage, 'film stage [data-stage]');
  await stage.scrollIntoViewIfNeeded();
  await page.evaluate((time) => window.__film.drawAt(time), t);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.evaluate((time) => window.__film.drawAt(time), t);
  await page.waitForTimeout(150);
  console.log(`  (film at ${t} s)`);
  await shoot(stage, s.file);
}

/** The home share card: its own page if this build has it, else the same picture on the poster. */
async function cardShot(page, base, s) {
  if (resolveFile('/print/card/home/')) {
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(base + '/print/card/home/', { waitUntil: 'load' });
    const loc = await need(page, HOOKS.card, 'share card .card');
    await settle(page, loc);
    return shoot(loc, s.file);
  }
  console.log('  (no /print/card/home/ in this build (needs SA_SHARE_CARDS=1): drawing the same <Picture kind="kerb" scenario="dozen"> from /print/poster/)');
  await page.goto(base + '/print/poster/', { waitUntil: 'load' });
  const loc = await need(page, HOOKS.posterPic, 'poster picture .poster__pic');
  await settle(page, loc);
  await shoot(loc, s.file);
}

run().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});
