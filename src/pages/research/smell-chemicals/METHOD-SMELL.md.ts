// Serves the signed method of the smell-chemicals step as published (alwaysCarry plus[3] of
// research/simulation/smell-chemicals/statements-smell.json: "a link to METHOD-SMELL.md").
// Read at build time from the research folder, so the served file is always the signed one.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function GET() {
  const text = readFileSync(resolve(process.cwd(), 'research/simulation/smell-chemicals/METHOD-SMELL.md'), 'utf8');
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
