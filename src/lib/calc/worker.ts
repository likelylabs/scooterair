// The engine in a Web Worker, so a page never runs it on the main thread. Every result is plain
// data (no functions, no classes), so it crosses postMessage unchanged.
//
//   const w = new Worker(new URL('../../lib/calc/worker.ts', import.meta.url), { type: 'module' });
//   const ask = engineClient(w);
//   const best = await ask('bestOptions', base);          // same as bestOptions(base)
//   const e = await ask('evaluate', situation);            // same as evaluate(situation)
//   const many = await ask('evaluateMany', [s1, s2, s3]);  // one round trip for several situations
//
// A CalcInputError comes back as a rejection carrying the same `issues`.

import { bestOptions, evaluate } from './index.ts';
import type { BestOptions, Evaluation, InputIssue, Situation } from './types.ts';

export type EngineRequest =
  | { id: number; fn: 'evaluate'; arg: Situation }
  | { id: number; fn: 'evaluateMany'; arg: Situation[] }
  | { id: number; fn: 'bestOptions'; arg: Omit<Situation, 'electricModel' | 'energyPlan'> };

export type EngineReply = { id: number; ok: true; result: unknown } | { id: number; ok: false; message: string; issues?: InputIssue[] };

export function answer(req: EngineRequest): EngineReply {
  try {
    const result = req.fn === 'evaluate' ? evaluate(req.arg) : req.fn === 'evaluateMany' ? req.arg.map((s) => evaluate(s)) : bestOptions(req.arg);
    return { id: req.id, ok: true, result };
  } catch (err) {
    const issues = (err as { issues?: InputIssue[] }).issues;
    return { id: req.id, ok: false, message: err instanceof Error ? err.message : String(err), ...(issues ? { issues } : {}) };
  }
}

interface Port {
  postMessage(m: unknown): void;
  addEventListener(type: 'message', f: (ev: { data: unknown }) => void): void;
}

/** A promise-based caller for a worker running this module. */
export function engineClient(worker: Port) {
  let next = 1;
  const waiting = new Map<number, { resolve: (v: unknown) => void; reject: (e: unknown) => void }>();
  worker.addEventListener('message', (ev) => {
    const r = ev.data as EngineReply;
    const w = waiting.get(r.id);
    if (!w) return;
    waiting.delete(r.id);
    if (r.ok) w.resolve(r.result);
    else w.reject(Object.assign(new Error(r.message), r.issues ? { issues: r.issues } : {}));
  });
  function ask(fn: 'evaluate', arg: Situation): Promise<Evaluation>;
  function ask(fn: 'evaluateMany', arg: Situation[]): Promise<Evaluation[]>;
  function ask(fn: 'bestOptions', arg: Omit<Situation, 'electricModel' | 'energyPlan'>): Promise<BestOptions>;
  function ask(fn: EngineRequest['fn'], arg: unknown): Promise<unknown> {
    const id = next++;
    return new Promise((resolve, reject) => {
      waiting.set(id, { resolve, reject });
      worker.postMessage({ id, fn, arg });
    });
  }
  return ask;
}

// Inside a worker: answer each request. (Importing this module elsewhere does nothing.)
const scope = globalThis as unknown as { WorkerGlobalScope?: unknown; postMessage?: (m: unknown) => void; addEventListener?: (t: 'message', f: (ev: { data: EngineRequest }) => void) => void };
if (typeof scope.WorkerGlobalScope !== 'undefined' && scope.addEventListener && scope.postMessage) {
  const post = scope.postMessage.bind(globalThis);
  scope.addEventListener('message', (ev) => post(answer(ev.data)));
}
