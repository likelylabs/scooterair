// node crawl.cjs <site root containing scooterair/> — crawl the live-address build from /scooterair/ and /scooterair/en/
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.argv[2];
const BASE = '/scooterair/';
const LIVE = 'https://likelylabs.com';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.vtt': 'text/vtt' };
const fileFor = (p) => {
  let f = path.join(root, decodeURIComponent(p));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  return fs.existsSync(f) && fs.statSync(f).isFile() ? f : null;
};
const srv = http.createServer((q, r) => {
  const p = q.url.split(/[?#]/)[0];
  const f = fileFor(p);
  if (!f) { r.writeHead(404, { 'content-type': 'text/html' }); return r.end(fs.existsSync(path.join(root, 'scooterair/404.html')) ? fs.readFileSync(path.join(root, 'scooterair/404.html')) : ''); }
  r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
}).listen(0);
(async () => {
  const port = srv.address().port; const ORIGIN = `http://localhost:${port}`;
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const queue = [BASE, BASE + 'en/']; const seen = new Set(queue);
  const res = { pages: [], pageErrors: [], failed: [], outside: [], og: [], assetMissing: [] };
  const assets = new Set();
  while (queue.length) {
    const p = queue.shift();
    const page = await ctx.newPage();
    page.on('pageerror', (e) => res.pageErrors.push(`${p}: ${e.message}`));
    page.on('requestfailed', (q) => { const u = q.url(); if (u.startsWith(ORIGIN)) res.failed.push(`${p}: ${u} ${q.failure()?.errorText}`); else res.failed.push(`${p}: EXTERNAL ${u} ${q.failure()?.errorText}`); });
    page.on('response', (r) => { if (r.status() >= 400) res.failed.push(`${p}: ${r.status()} ${r.url()}`); });
    const resp = await page.goto(ORIGIN + p, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const info = await page.evaluate(() => ({
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      og: [...document.querySelectorAll('meta[property="og:image"]')].map((m) => m.content),
      srcs: [...document.querySelectorAll('[src],link[href]')].map((e) => e.getAttribute('src') || e.getAttribute('href')),
    }));
    res.pages.push({ p, status: resp.status(), og: info.og.length });
    res.og.push({ p, og: info.og });
    for (const raw of [...info.links, ...info.srcs]) {
      if (!raw || /^(mailto:|tel:|javascript:|data:|#)/.test(raw)) continue;
      let u;
      try { u = new URL(raw, ORIGIN + p); } catch { continue; }
      let internal = false;
      if (u.origin === ORIGIN) internal = true;
      if (u.origin === LIVE || u.origin === 'https://www.likelylabs.com') internal = true;
      if (!internal) continue;
      if (!u.pathname.startsWith(BASE)) { res.outside.push(`${p}: ${raw}`); continue; }
      const ext = path.extname(u.pathname);
      if (!ext || ext === '.html') { if (!seen.has(u.pathname)) { seen.add(u.pathname); queue.push(u.pathname); } }
      else assets.add(u.pathname);
    }
    await page.close();
  }
  for (const a of assets) if (!fileFor(a)) res.assetMissing.push(a);
  const ogBad = [];
  for (const { p, og } of res.og) {
    if (og.length !== 1) ogBad.push(`${p}: ${og.length} og:image`);
    for (const u of og) { const url = new URL(u); if (url.origin !== LIVE || !url.pathname.startsWith(BASE) || !fileFor(url.pathname)) ogBad.push(`${p}: og:image does not resolve: ${u}`); }
  }
  console.log(JSON.stringify({ pages: res.pages.length, zh: res.pages.filter((x) => !x.p.startsWith(BASE + 'en/')).length, en: res.pages.filter((x) => x.p.startsWith(BASE + 'en/')).length, non200: res.pages.filter((x) => x.status !== 200), pageErrors: res.pageErrors, failed: res.failed, outside: res.outside, assetsChecked: assets.size, assetMissing: res.assetMissing, ogBad, ogCounts: res.pages.map((x) => `${x.p} ${x.og}`) }, null, 1));
  await b.close(); srv.close();
})();
