/**
 * Build-time unique ids for aria-labelledby, gradients and clip paths.
 * A plain counter (not Math.random) so two builds of the same site produce
 * the same HTML.
 */
let n = 0;
export const uid = (prefix: string): string => `${prefix}-${(++n).toString(36)}`;
