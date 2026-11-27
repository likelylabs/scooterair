process.env.DIST ||= '/tmp/claude-0/-home-user-scooterair/3096f22d-9964-5310-9b6f-44efda6d48e8/scratchpad/rel2/dist';
const http = require('http'), fs = require('fs'), path = require('path');
const DIST = process.env.DIST, NM = '/home/user/scooterair/node_modules';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.xml': 'text/xml', '.mp4':'video/mp4', '.json':'application/json', '.webmanifest':'application/manifest+json', '.vtt':'text/vtt' };
const serve = () => new Promise((resolve) => {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let f = p.startsWith('/__nm/') ? path.join(NM, p.slice(6)) : path.join(DIST, p.endsWith('/') ? p + 'index.html' : p);
    if (!p.startsWith('/__nm/') && !path.extname(f) && fs.existsSync(f + '/index.html')) f = f + '/index.html';
    fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
  }).listen(0, () => resolve({ server, base: `http://localhost:${server.address().port}` }));
});
const sysCss = (base) => fs.readFileSync(NM + '/@fontsource-variable/noto-sans-tc/wght.css', 'utf8').replaceAll("'Noto Sans TC Variable'", "'Noto Sans CJK TC'").replaceAll('url(./files/', `url(${base}/__nm/@fontsource-variable/noto-sans-tc/files/`);
const font = async (page, base) => { await page.addStyleTag({ content: sysCss(base) }); await page.evaluate(() => document.fonts.ready); };
function pages() { const out = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!['_astro','film','share'].includes(f)) walk(p); } else if (f === 'index.html') out.push('/' + path.relative(DIST, d).replace(/\\/g,'/') + (d === DIST ? '' : '/')); } })(DIST); return out.map(p => p.replace('//','/')).sort(); }
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const it = items[i++]; await fn(it); } })); }
module.exports = { serve, font, pages, pool, DIST, R: __dirname };
