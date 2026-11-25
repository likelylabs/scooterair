#!/usr/bin/env node
// The film's share card (V44 conventions), rendered by the site's own generator.
//
//   node src/components/pages/film/build-film-card.mjs           render public/share/{zh,en}/film.png and film-sq.png
//   node src/components/pages/film/build-film-card.mjs --check   no browser: are the committed PNGs current?
//
// WHY THIS FILE EXISTS
//   scripts/build-share-cards.mjs draws every card the list in src/lib/share-cards.ts names, and
//   that list does not name the film yet. Rather than copy the card's design, this script runs
//   the generator itself, unmodified, from a scratch directory in which src/lib/share-cards.ts is
//   replaced by a two-line list holding one card: the film's (./card.ts). Same template, same
//   fonts, same fit-to-frame pass; if the generator's design changes, so does this card the next
//   time it is rendered.
//
//   When 'film' is added to shareCardIds in src/lib/share-cards.ts (see the note in ./card.ts),
//   delete this script: `npm run share-cards` will draw the card and `--check` will guard it.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.removeAllListeners('warning');
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../..');
const CHECK = process.argv.includes('--check');
const GENERATOR = join(root, 'scripts/build-share-cards.mjs');
const MANIFEST = join(here, 'card.manifest.json');
const OUT = join(root, 'public/share');
const files = ['zh/film.png', 'zh/film-sq.png', 'en/film.png', 'en/film-sq.png'];

const { filmCardContent } = await import(pathToFileURL(join(here, 'card.ts')).href);
// current = same words on the card and the same generator that drew it
const hash = createHash('sha256')
  .update(JSON.stringify([filmCardContent('zh-TW'), filmCardContent('en'), readFileSync(GENERATOR, 'utf8')]))
  .digest('hex')
  .slice(0, 16);

if (CHECK) {
  const bad = files.filter((f) => !existsSync(join(OUT, f))).map((f) => `missing public/share/${f}`);
  const stored = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')).film : null;
  if (stored !== hash) bad.push('out of date: the words on the film card, or the generator that draws it, changed since it was rendered');
  if (bad.length) {
    console.error(`\n✖ film share card: ${bad.length} problem(s). Run \`node src/components/pages/film/build-film-card.mjs\` and commit public/share/.\n`);
    for (const b of bad) console.error(`  ${b}`);
    process.exit(1);
  }
  console.log('✔ film share card: 2 languages × 2 sizes present and current.');
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), 'film-card-'));
try {
  mkdirSync(join(tmp, 'scripts'));
  mkdirSync(join(tmp, 'src/lib'), { recursive: true });
  mkdirSync(join(tmp, 'public/share'), { recursive: true });
  copyFileSync(GENERATOR, join(tmp, 'scripts/build-share-cards.mjs'));
  for (const d of ['src/i18n', 'src/components', 'src/styles', 'src/data', 'node_modules']) symlinkSync(join(root, d), join(tmp, d), 'dir');
  writeFileSync(
    join(tmp, 'src/lib/share-cards.ts'),
    `import { filmCardContent } from ${JSON.stringify(pathToFileURL(join(here, 'card.ts')).href)};\nexport const shareCardIds = ['film'];\nexport const shareCardContent = (_id: string, locale: 'zh-TW' | 'en') => filmCardContent(locale);\n`,
  );
  const run = spawnSync(process.execPath, [join(tmp, 'scripts/build-share-cards.mjs')], { stdio: 'inherit', env: process.env });
  if (run.status !== 0) process.exit(run.status ?? 1);
  for (const f of files) {
    mkdirSync(dirname(join(OUT, f)), { recursive: true });
    copyFileSync(join(tmp, 'public/share', f), join(OUT, f));
  }
  writeFileSync(MANIFEST, JSON.stringify({ film: hash }, null, 2) + '\n');
  console.log('✔ film share card: copied into public/share/{zh,en}/film.png and film-sq.png. Commit them.');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
