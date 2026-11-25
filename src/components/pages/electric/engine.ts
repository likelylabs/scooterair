// The part of /electric/ that only loads when the reader starts the calculator: the engine,
// the dataset and the renderer (one chunk, imported on demand by calc.client.ts).

export { econData } from '../../../data/econ/index.ts';
export { evaluate, CalcInputError } from '../../../lib/calc/index.ts';
export { answerIssues, choose, classify, levers, renderResult, money, type Answers, type Rendered, type RenderCtx, type Lever } from './model.ts';
