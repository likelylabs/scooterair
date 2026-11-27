/**
 * G15 — the working, drawn (docs/redesign-brief.md 4.5, 5.2).
 *
 * Boxes joined by operators where the arithmetic really computes
 * (約 15 公克 ÷ 40 ＝ 約 0.4 公克), or boxes joined by arrows and NO operator signs where it does
 * not (the kerb estimate is a simulation run 30,000 times, so it is drawn as a flow).
 * The result sits in a dashed ochre box when it is an estimate, in a solid ink box otherwise.
 *
 * On a phone the boxes stack, with the operator in a left-hand column as in written sums; in a
 * wide container they run left to right.
 *
 * Pure, so a calculator can redraw it. The presets at the bottom build the sums this site
 * prints from src/data/estimate.ts: a page never types their numbers.
 *
 *   import { renderWorkingSum, workingPerRed } from '@/components/charts/core/workingSum';
 *   const html = renderWorkingSum(workingPerRed(locale));
 */
import { est, estimateText, formatEstNumber, formatEstimate, hoursPerYear, type RedsPerDay } from '../../../data/estimate.ts';
import type { ReaderKind } from '../../../data/types.ts';
import { about, chartText, fill, yuan } from '../strings.ts';
import { chipHtml, esc, type Loc } from './html.ts';

export type WorkingOp = '+' | '−' | '×' | '÷';

export interface WorkingStep {
  /** the figure, with its unit: 「約 15 公克」「40」 */
  value: string;
  /** what the figure is, in a few words */
  label?: string;
  /** the operator in front of this step (not on the first step; ignored in a flow) */
  op?: WorkingOp;
  /** the chip this input carries (官方, 研究 …) */
  chip?: ReaderKind;
}

export interface WorkingSumProps {
  locale: Loc;
  /** 'sum' = operators (the arithmetic computes) · 'flow' = arrows only (it does not) */
  mode?: 'sum' | 'flow';
  steps: WorkingStep[];
  result: {
    value: string;
    label?: string;
    /** 'estimate' draws the dashed ochre box and the 推估 chip; any other kind a solid box with its chip */
    kind?: ReaderKind;
  };
  /** the chart's accessible name (default 算式 / The working) */
  title?: string;
}

const ARROW = '<svg class="hc-sum__arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 4v15M6 13l6 6 6-6"/></svg>';

export function renderWorkingSum(p: WorkingSumProps): string {
  const { locale, mode = 'sum' } = p;
  const T = chartText.working;
  const opCell = (glyph: string, said: string) => `<span class="hc-sum__op"><span aria-hidden="true">${glyph}</span><span class="vh">${esc(said)}</span></span>`;
  const sign = (op: WorkingOp) => (op === '+' ? '＋' : op === '−' ? '－' : op === '×' ? '×' : '÷');
  const box = (value: string, label: string | undefined, chip: ReaderKind | undefined, cls = '') =>
    `<div class="hc-sum__box${cls}"><strong class="hc-sum__v">${esc(value)}</strong>${chip ? chipHtml(chip, locale) : ''}${label ? `<span class="hc-sum__l">${esc(label)}</span>` : ''}</div>`;
  const items = p.steps.map((s, i) => {
    const lead = i === 0 ? '<span class="hc-sum__op hc-sum__op--none" aria-hidden="true"></span>' : mode === 'flow' ? opCell(ARROW, T.op['→'][locale]) : opCell(sign(s.op ?? '+'), T.op[s.op ?? '+'][locale]);
    return `<li class="hc-sum__step">${lead}${box(s.value, s.label, s.chip)}</li>`;
  });
  const kind = p.result.kind;
  const resLead = mode === 'flow' ? opCell(ARROW, T.op['→'][locale]) : opCell('＝', T.op['='][locale]);
  items.push(`<li class="hc-sum__step hc-sum__step--result">${resLead}${box(p.result.value, p.result.label, kind, ` hc-sum__box--result${kind === 'estimate' ? ' hc-sum__box--estimate' : ''}`)}</li>`);
  return `<ol class="hc-sum hc-sum--${mode}" role="list">${items.join('')}</ol>`;
}

export const workingSumTitle = (locale: Loc): string => chartText.working.title[locale];

// ---------------------------------------------------------------------------------------------
// Presets: the sums this site prints, with every figure read from src/data/estimate.ts
// ---------------------------------------------------------------------------------------------

const n = (v: number, locale: Loc, rounding: Parameters<typeof formatEstNumber>[1] = 'as-given') => formatEstNumber(v, rounding, locale);
const withUnit = (v: string, unit: string, _locale: Loc) => (unit ? `${v} ${unit}` : v);

/**
 * One scooter through one red light, in grams (brief 4.5, 12.1):
 * 約 15 公克 ÷ 40 ＝ 約 0.4 公克, because an hour holds forty 90-second reds.
 */
export function workingPerRed(locale: Loc): WorkingSumProps {
  const T = chartText.working;
  const rate = est.emit.co.gPerHour;
  const red = est.emit.co.perRed_g;
  const g = T.unit.g[locale];
  return {
    locale,
    mode: 'sum',
    steps: [
      { value: about(withUnit(n(rate.mid, locale, 'integer'), g, locale), locale), label: fill(T.perRed.rate, locale, { lo: n(rate.lo, locale), hi: n(rate.hi, locale) }), chip: rate.kind },
      { op: '÷', value: n(est.emit.co.perRedSum.reds, locale), label: fill(T.perRed.reds, locale, { n: est.emit.co.perRedSum.reds, s: est.signal.redLength_s }) },
    ],
    result: { value: about(withUnit(n(red.mid, locale), g, locale), locale), label: fill(T.perRed.result, locale, { lo: n(red.lo, locale), hi: n(red.hi, locale) }), kind: 'estimate' },
  };
}

/**
 * The same amount as a drinks can (signed off in brief 12.1): the gas volume at 25 °C divided by
 * one 330 mL can, to the nearest half can: 大約一罐（半罐到快兩罐）.
 */
export function workingPerRedCan(locale: Loc): WorkingSumProps {
  const T = chartText.working;
  const L = est.emit.co.perRed_L;
  const sum = est.emit.co.perRedSum;
  const litres = T.unit.L[locale];
  const cans = est.emit.co.canWords[locale];
  return {
    locale,
    mode: 'sum',
    steps: [
      { value: about(withUnit(n(L.mid, locale), litres, locale), locale), label: fill(T.can.volume, locale, { g: n(est.emit.co.perRed_g.mid, locale), lo: n(L.lo, locale), hi: n(L.hi, locale) }), chip: L.kind },
      { op: '÷', value: withUnit(n(sum.canMl / 1000, locale), litres, locale), label: fill(T.can.can, locale, { ml: sum.canMl }) },
    ],
    result: { value: cans.charAt(0).toUpperCase() + cans.slice(1), label: T.can.result[locale], kind: 'estimate' },
  };
}

/**
 * How the kerb estimate is made, as a flow with arrows and no operator signs (brief 4.5): the
 * four boxes are `estimateText.flow`, the last one the result.
 */
export function workingKerbFlow(locale: Loc, scenario: 'few' | 'dozen' | 'full' = 'dozen'): WorkingSumProps {
  const boxes = estimateText.flow.map((b) => b[locale]);
  // the count and the result belong to the scenario the reader picked (brief 4.2, 4.5)
  const c = est.scn[scenario].count;
  boxes[1] = locale === 'en' ? `${c.lo} to ${c.hi} scooters beside you` : `旁邊停 ${c.lo} 到 ${c.hi} 輛`;
  boxes[boxes.length - 1] = fill(estimateText.flowResult, locale, { range: formatEstimate(`co.${scenario}.add`, locale).text });
  return {
    locale,
    mode: 'flow',
    steps: boxes.slice(0, -1).map((value) => ({ value })),
    result: { value: boxes[boxes.length - 1], kind: 'estimate' },
  };
}

/**
 * How many scooters stop through one red on the busiest road (brief 7.2 #count; one sum only):
 * 約 1,500 輛 × 83 秒 ÷ 3,600 秒 ＝ 約 34 輛.
 */
export function workingBusiest(locale: Loc): WorkingSumProps {
  const T = chartText.working;
  const b = est.recipe.busiest;
  const veh = T.unit.vehicles[locale];
  const sec = T.unit.s[locale];
  return {
    locale,
    mode: 'sum',
    steps: [
      { value: about(withUnit(n(b.perApproachHourShown, locale), veh, locale), locale), label: T.busiest.perHour[locale], chip: 'derived' },
      { op: '×', value: withUnit(n(b.redSeconds, locale), sec, locale), label: T.busiest.red[locale] },
      { op: '÷', value: withUnit(n(3600, locale), sec, locale), label: T.busiest.hour[locale] },
    ],
    result: { value: about(withUnit(n(b.perRed, locale), veh, locale), locale), label: T.busiest.result[locale], kind: 'estimate' },
  };
}

/**
 * Hours a year at red lights (brief 3.2 screen 7): reds a day × 60 to 90 seconds × 365 days.
 * Our arithmetic (本站計算), so the result box is solid.
 */
export function workingHoursPerYear(reds: RedsPerDay, locale: Loc): WorkingSumProps {
  const T = chartText.working;
  const h = hoursPerYear(reds);
  const wait = locale === 'en' ? `60 to 90 ${T.unit.s.en}` : `60 到 90 ${T.unit.s['zh-TW']}`;
  return {
    locale,
    mode: 'sum',
    steps: [
      { value: locale === 'en' ? String(reds) : `${reds} 個`, label: T.year.reds[locale] },
      { op: '×', value: wait, label: T.year.wait[locale] },
      { op: '×', value: withUnit('365', T.unit.days[locale], locale), label: T.year.days[locale] },
    ],
    result: { value: formatEstimate(h, locale).text, label: T.year.result[locale], kind: 'derived' },
  };
}

/** A price as a sum: list price − each line that comes off ＝ what you pay (本站計算). */
export function workingFromMoneySide(
  side: { listPrice: number; net: number; lines: { label: { 'zh-TW': string; en: string }; amount: number }[] },
  locale: Loc,
): WorkingSumProps {
  const T = chartText.working;
  return {
    locale,
    mode: 'sum',
    steps: [{ value: yuan(side.listPrice, locale), label: T.money.list[locale] }, ...side.lines.filter((l) => l.amount > 0).map((l) => ({ op: '−' as const, value: yuan(l.amount, locale), label: l.label[locale].replaceAll('臺', '台') }))],
    result: { value: yuan(side.net, locale), label: T.money.net[locale], kind: 'derived' },
  };
}
