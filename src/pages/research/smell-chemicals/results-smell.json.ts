// Serves every number of the smell-chemicals step (research/simulation/smell-chemicals/results-smell.json),
// unchanged, for readers who want the full tables (including the rare near-calm case the pages do not print).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function GET() {
  const text = readFileSync(resolve(process.cwd(), 'research/simulation/smell-chemicals/results-smell.json'), 'utf8');
  return new Response(text, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
