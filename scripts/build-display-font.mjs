#!/usr/bin/env node
// Builds the Chinese headline font: Noto Sans TC Black cut down to the characters the site's
// headlines use (see scripts/display-font.mjs for why, and for how a stale file stays correct).
//
//   npm run build && node scripts/build-display-font.mjs            rebuild the subset from dist/
//   node scripts/build-display-font.mjs --check                     no tools needed: say whether dist/ is covered
//
// Run it after changing Chinese headlines, then build again and commit the two files:
//   src/styles/fonts/noto-sans-tc-900-headline.woff2   the font
//   src/styles/fonts/noto-sans-tc-900-headline.txt     the characters in it (read by the build check)
//
// It reads the BUILT site, so build first. Subsetting needs fontTools with brotli on the machine
// (`pip install fonttools brotli`); set PYTHON to the interpreter that has them if it is not
// `python3`. Like the share cards, the output is committed, so CI needs neither.
//
// A build never depends on this script having been run: a headline character missing from the
// subset is drawn from the package's sliced font, and `astro build` prints what is missing.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CHARS_FILE, FONT_FILE, SKIP, SOURCE_FONT, coveredChars, root, scanDist } from './display-font.mjs';

const CHECK = process.argv.includes('--check');
const dist = join(root, 'dist');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('\n✖ headline font: dist/ not found. Run `npm run build` first; the characters are read from the built pages.\n');
  process.exit(1);
}

const pages = scanDist(dist).filter((p) => !SKIP.test(p.route.slice(1)));
const need = new Set();
for (const p of pages) for (const c of p.chars) need.add(c);
const sorted = [...need].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));

if (CHECK) {
  const have = coveredChars();
  const missing = sorted.filter((c) => !have.has(c));
  const unused = [...have].filter((c) => !need.has(c));
  if (missing.length) {
    console.error(`\n✖ headline font: ${missing.length} headline character(s) are not in the subset: ${missing.join('')}`);
    console.error('  They are still drawn (from the sliced font), at the cost of extra downloads on those pages.');
    console.error('  Run `node scripts/build-display-font.mjs`, build again and commit src/styles/fonts/.\n');
    process.exit(1);
  }
  console.log(`✔ headline font: covers all ${sorted.length} headline characters on ${pages.length} pages${unused.length ? ` (${unused.length} in the file are no longer used)` : ''}.`);
  process.exit(0);
}

const python = process.env.PYTHON ?? 'python3';
const out = join(root, FONT_FILE);
mkdirSync(dirname(out), { recursive: true });
// One Python process. The package has no single complete file (its "chinese-traditional" file
// lacks the full-width punctuation), so: find which numbered slice holds each character, cut
// each of those slices down to the characters wanted, merge the pieces into one font, write
// woff2, and print the code points the result really holds.
const py = `
import sys, os, re, json, glob, tempfile
from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont
files, dst = sys.argv[1], sys.argv[2]
want = set(int(x) for x in sys.argv[3].split(','))
slices = sorted(glob.glob(os.path.join(files, 'noto-sans-tc-[0-9]*-900-normal.woff2')), key=lambda p: int(re.search(r'-(\\d+)-900-', p).group(1)))
tmp = tempfile.mkdtemp()
parts = []
for path in slices:
    font = TTFont(path)
    take = want & set(font.getBestCmap().keys())
    if not take:
        continue
    want -= take
    opts = subset.Options()
    opts.hinting = False
    # halt / chws are what a browser uses to close up adjacent full-width punctuation (」，)
    opts.layout_features = ['halt', 'chws', 'kern', 'palt', 'locl', 'ccmp']
    opts.name_IDs = [1, 2, 3, 4, 6]
    opts.notdef_outline = True
    opts.drop_tables += ['vhea', 'vmtx', 'VORG', 'DSIG', 'STAT', 'meta']
    s = subset.Subsetter(opts)
    s.populate(unicodes=sorted(take))
    s.subset(font)
    part = os.path.join(tmp, os.path.basename(path).replace('.woff2', '.ttf'))
    font.flavor = None
    font.save(part)
    parts.append(part)
merged = Merger().merge(parts) if len(parts) > 1 else TTFont(parts[0])
# every slice has the same vertical metrics; the merge must not change them, or headlines
# would sit on a different line height from the same text drawn from a slice
ref = TTFont(slices[0])
for table, keys in (('hhea', ('ascent', 'descent', 'lineGap')), ('OS/2', ('sTypoAscender', 'sTypoDescender', 'sTypoLineGap', 'usWinAscent', 'usWinDescent', 'fsSelection', 'sxHeight', 'sCapHeight'))):
    for k in keys:
        if hasattr(ref[table], k):
            setattr(merged[table], k, getattr(ref[table], k))
merged.flavor = 'woff2'
merged.save(dst)
print(json.dumps(sorted(TTFont(dst).getBestCmap().keys())))
`;
const run = spawnSync(python, ['-c', py, join(root, dirname(SOURCE_FONT)), out, sorted.map((c) => c.codePointAt(0)).join(',')], { encoding: 'utf8' });
if (run.status !== 0) {
  console.error(`\n✖ headline font: could not run fontTools with \`${python}\`.\n  Install it once with \`pip install fonttools brotli\` (or set PYTHON to an interpreter that has both).\n`);
  if (run.stderr) console.error(run.stderr.split('\n').slice(-6).join('\n'));
  process.exit(1);
}
const held = new Set(JSON.parse(run.stdout.trim().split('\n').pop()));
const covered = sorted.filter((c) => held.has(c.codePointAt(0)));
const absent = sorted.filter((c) => !held.has(c.codePointAt(0)));
// 40 characters to a line, so a diff shows what changed
writeFileSync(
  join(root, CHARS_FILE),
  '# Generated by scripts/build-display-font.mjs: the characters in noto-sans-tc-900-headline.woff2. Do not edit.\n' +
    covered.join('').replace(/(.{40})/gu, '$1\n').trimEnd() +
    '\n' +
    (absent.length ? `#absent ${absent.join('')}\n` : ''),
);
console.log(`✔ headline font: ${covered.length} characters from ${pages.length} pages → ${FONT_FILE} (${(statSync(out).size / 1024).toFixed(1)} kB).`);
if (absent.length) console.log(`  ${absent.length} character(s) are not in Noto Sans TC Black and will come from the reader's system font: ${absent.join('')}`);
console.log('  Build again (`npm run build`) and commit src/styles/fonts/.');
