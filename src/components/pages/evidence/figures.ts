// Every chart dataset in the registry, turned into a chart (or, where one chart would mislead,
// a table). One function per page: seriesView(id, locale, T) → what <SeriesFigure> draws.
//
// Honest axes: emission shares run 0–100% (R7); signed changes are drawn either side of zero;
// ratios and intervals carry their "no difference" line; uneven years are spaced as they fell.
// Different units are never put on one axis: a dataset with two units becomes two charts.

import type { Locale } from '@/i18n';
import { readerText, ui } from '@/i18n/ui';
import { unitLabel, type SeriesId } from '@/data';
import type { ChartRender, Tone } from '@/components/charts/core/shared';
import { renderBar } from '@/components/charts/core/bar';
import { renderGrouped } from '@/components/charts/core/grouped';
import { renderRange } from '@/components/charts/core/range';
import { renderStacked } from '@/components/charts/core/stacked';
import { renderLine } from '@/components/charts/core/line';
import { renderWaffle } from '@/components/charts/core/waffle';
import { renderBeforeAfter } from '@/components/charts/core/beforeAfter';
import { renderIntervals, renderOdour, renderSigned, renderSpans, renderTime, sgn, type SignedRow } from './charts';
import { ls } from './ev';
import type { Localized } from '@/i18n/pages/_copy';
import type evidenceCopy from '@/i18n/pages/evidence';

type T = Localized<typeof evidenceCopy>;
type LS = ReturnType<typeof ls>;
type DS = LS['datasets'][number];
type PT = DS['points'][number];

export interface Panel {
  /** small heading above this chart when a dataset is split into several */
  label?: string;
  render: ChartRender;
  title: string;
  desc?: string;
}
export interface SeriesView {
  s: LS;
  panels: Panel[];
  /** shown instead of (or after) charts */
  table?: { head: string[]; rows: string[][]; note?: string };
  /** point flags and notes, one line each */
  notes: string[];
}

const TONES: Tone[] = ['exhaust', 'blue', 'violet', 'magenta', 'lime', 'neutral'];
const u = (s: LS | DS, locale: Locale) => readerText(unitLabel(s.unit, locale));
const cat = (s: LS, key: string | number) => s.categories.find((c) => c.key === String(key))?.label ?? String(key);
const pt = (d: DS, key: string | number) => d.points.find((p) => String(p.x) === String(key));
const has = (p: PT | undefined, f: string) => !!p?.flags?.includes(f as never);
const dec = (vals: number[]) => {
  const m = Math.max(...vals.map((v) => (String(v).split('.')[1] ?? '').length));
  return Math.min(m, 3);
};
const ds = (s: LS, key: string) => {
  const d = s.datasets.find((x) => x.key === key);
  if (!d) throw new Error(`[evidence] series ${s.id} has no dataset ${key}`);
  return d;
};
const paren = (locale: Locale, x: string) => (locale === 'en' ? ` (${x})` : `（${x}）`);
const keys = (s: LS) => (s.categories.length ? s.categories.map((c) => c.key) : [...new Set(s.datasets.flatMap((d) => d.points.map((p) => String(p.x))))]);

/** All flag labels and notes on a series' points, as reader lines. */
/** Flags the charts draw themselves (outline, asterisk, "up to", "more than", "or fewer"): not repeated as notes. */
const DRAWN = new Set(['significant', 'not-significant', 'model-check-failed', 'maximum', 'lower-bound', 'upper-bound']);
function pointNotes(s: LS, locale: Locale): string[] {
  const sep = locale === 'en' ? ': ' : '：';
  const and = locale === 'en' ? '; ' : '；';
  const out: string[] = [];
  for (const d of s.datasets) {
    for (const p of d.points) {
      const bits = [...(p.flags ?? []).filter((f) => !DRAWN.has(f)).map((f) => p.flagLabels[(p.flags ?? []).indexOf(f)]), ...(p.note ? [p.note] : [])];
      if (!bits.length) continue;
      const where = [s.datasets.length > 1 ? d.label : '', cat(s, p.x)].filter(Boolean).join(' · ');
      out.push(`${where}${sep}${bits.join(and)}`);
    }
    if (d.note) out.push(`${d.label}${sep}${d.note}`);
  }
  return out;
}

/** A plain table of every dataset × category. */
function fullTable(s: LS, locale: Locale, T: T) {
  const f = (v: number) => new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { maximumFractionDigits: 3 }).format(v);
  const cell = (p: PT | undefined) => {
    if (!p || p.y === null) return p && p.low !== undefined ? `${f(p.low)}–${f(p.high!)}` : '–';
    return p.low !== undefined && p.high !== undefined ? `${f(p.y)} (${f(p.low)}–${f(p.high)})` : f(p.y);
  };
  return {
    head: [T.chart.category, ...s.datasets.map((d) => `${d.label} (${u(d, locale)})`)],
    rows: keys(s).map((k) => [cat(s, k), ...s.datasets.map((d) => cell(pt(d, k)))]),
  };
}

function bars(s: LS, d: DS, locale: Locale, T: T, extra: { tone?: Tone; highlight?: string[]; decimals?: number; label?: (k: string, p: PT | undefined) => string } = {}): ChartRender {
  const ks = keys(s).filter((k) => pt(d, k)?.y !== null && pt(d, k) !== undefined);
  const vals = ks.map((k) => pt(d, k)!.y as number);
  return renderBar({
    locale,
    data: ks.map((k) => ({ label: extra.label ? extra.label(k, pt(d, k)) : cat(s, k), value: pt(d, k)!.y as number, highlight: extra.highlight?.includes(k) })),
    unit: u(d, locale),
    tone: extra.tone ?? 'exhaust',
    emphasis: !!extra.highlight,
    decimals: extra.decimals ?? dec(vals),
    categoryLabel: T.chart.category,
    valueLabel: d.label,
  });
}

function signedFromSeries(s: LS, locale: Locale, T: T, by: 'dataset' | 'category', opts: { hollowFlag?: string; band?: { low: number; high: number; label: string }; foot?: string; zeroLabel?: string } = {}) {
  const notes: string[][] = [];
  const row = (label: string, p: PT | undefined): SignedRow => {
    notes.push(p?.flagLabels ?? []);
    return {
      label,
      value: p?.y ?? null,
      hollow: opts.hollowFlag ? has(p, opts.hollowFlag) : false,
      suffix: has(p, 'significant') ? '*' : undefined,
      prefix: has(p, 'maximum') ? T.v29.upTo : has(p, 'lower-bound') ? T.v29.over : undefined,
      nullText: T.v29.noDiff,
    };
  };
  const groups =
    by === 'dataset'
      ? s.datasets.map((d) => ({ label: s.datasets.length > 1 ? d.label : undefined, rows: keys(s).map((k) => row(cat(s, k), pt(d, k))) }))
      : keys(s).map((k) => ({ label: cat(s, k), rows: s.datasets.map((d) => row(d.label, pt(d, k))) }));
  const anyHollow = groups.some((g) => g.rows.some((r) => r.hollow));
  const anySig = groups.some((g) => g.rows.some((r) => r.suffix));
  const legend = [
    ...(anyHollow ? [{ label: T.chart.filled, tone: 'exhaust' as Tone, shape: 'rect' as const }, { label: opts.hollowFlag === 'model-check-failed' ? T.chart.hollowModel : T.chart.hollowNs, tone: 'neutral' as Tone, shape: 'light' as const }] : []),
  ];
  const vals = groups.flatMap((g) => g.rows.map((r) => r.value)).filter((v): v is number => v !== null);
  return {
    render: renderSigned({
      locale,
      groups,
      unit: s.unit === 'percent' ? '%' : ` ${u(s, locale)}`,
      decimals: Math.min(dec(vals), 2),
      band: opts.band,
      foot: opts.foot,
      zeroLabel: opts.zeroLabel,
      legend: legend.length ? legend : undefined,
      categoryLabel: T.chart.category,
      valueLabel: T.chart.value,
      noteLabel: T.chart.note,
      notes,
    }),
    sigNote: anySig ? T.chart.significant : undefined,
  };
}

function intervalsFromSeries(s: LS, locale: Locale, T: T, reference: { value: number; label: string }, unit: string) {
  return renderIntervals({
    locale,
    groups: s.datasets.map((d) => ({
      label: d.label,
      rows: keys(s)
        .map((k) => ({ k, p: pt(d, k) }))
        .filter(({ p }) => p && p.y !== null && p.low !== undefined)
        .map(({ k, p }) => ({ label: cat(s, k), mid: p!.y as number, low: p!.low!, high: p!.high!, strong: s.id === 'chuang2020-effects-per-iqr' ? has(p, 'significant') : undefined })),
    })),
    reference,
    unit,
    decimals: 2,
    legend:
      s.id === 'chuang2020-effects-per-iqr'
        ? [
            { label: T.chart.sigFilled, tone: 'exhaust', shape: 'dot' },
            { label: T.chart.sigHollow, tone: 'neutral', shape: 'dot' },
          ]
        : undefined,
    categoryLabel: T.chart.category,
    midLabel: T.chart.estimate,
    lowLabel: T.chart.ciLow,
    highLabel: T.chart.ciHigh,
  });
}

function timeFromSeries(s: LS, locale: Locale, T: T, tones: Record<string, Tone>, yMax?: number) {
  return renderTime({
    locale,
    series: s.datasets.map((d, i) => ({
      label: d.label,
      tone: tones[d.key] ?? TONES[i % TONES.length],
      target: d.kind === 'target',
      points: d.points.map((p) => ({ x: Number(p.x), y: p.y })),
    })),
    unit: u(s, locale),
    yMax,
    decimals: dec(s.datasets.flatMap((d) => d.points.map((p) => p.y ?? 0))),
    xLabel: T.chart.year,
  });
}

/** Everything one chart dataset needs, in one language. */
export function seriesView(id: SeriesId, locale: Locale, T: T): SeriesView {
  const s = ls(id, locale);
  const notes = pointNotes(s, locale);
  const one = (render: ChartRender, label?: string): Panel => ({ render, title: label ? `${s.title} · ${label}` : s.title, desc: s.description, label });
  const out = (panels: Panel[], extra: Partial<SeriesView> = {}): SeriesView => ({ s, panels, notes, ...extra });

  switch (id) {
    case 'teds13-motorcycle-share': {
      // V5: one bar per pollutant on 0–100% (R7): scooters' combined share against everything else
      const order = ['pm25', 'pm10', 'nox', 'thc', 'nmhc', 'co'];
      const c = ds(s, 'combined');
      const render = renderSpans({
        locale,
        rows: order.map((k) => {
          const v = pt(c, k)!.y as number;
          return { label: cat(s, k), low: 0, high: v, valueText: `${new Intl.NumberFormat(locale === 'en' ? 'en' : 'zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v)}%`, tone: k === 'pm25' || k === 'pm10' ? 'neutral' : 'exhaust' };
        }),
        min: 0,
        max: 100,
        unit: '%',
        tickStep: 25,
        categoryLabel: T.chart.category,
        valueLabel: c.label,
      });
      render.table = fullTable(s, locale, T);
      return out([{ render, title: T.v5.chartTitle, desc: T.v5.desc }]);
    }
    case 'teds13-motorcycle-tonnes':
    case 'econ-monthly-energy-cost-by-mileage':
    case 'fleet-stock':
      return out([], { table: { ...fullTable(s, locale, T), note: T.chart.asTable } });
    case 'scooter-emission-standard-phases': {
      const d = s.datasets[0];
      return out([], { table: { head: [T.chart.date, s.datasets[0].label], rows: d.points.map((p) => [String(p.x), T.chart.phase.replace('{n}', String(p.y))]) } });
    }
    case 'teds13-road-vs-power':
    case 'pm25-standards-who-vs-taiwan':
      // one chart per category: the categories differ too much in size to share an axis
      return out(
        keys(s).map((k) =>
          one(
            renderBar({
              locale,
              data: s.datasets.filter((d) => pt(d, k)?.y !== null && pt(d, k)).map((d, i) => ({ label: d.label, value: pt(d, k)!.y as number, tone: i === 0 ? 'exhaust' : 'neutral' })),
              unit: u(s, locale),
              decimals: dec(s.datasets.map((d) => pt(d, k)?.y ?? 0)),
              categoryLabel: T.chart.category,
              valueLabel: cat(s, k),
            }),
            cat(s, k),
          ),
        ),
      );
    case 'tunnel-co-by-vehicle-class-ting2023':
    case 'idle-test-limits-by-build-date':
    case 'scooter-lane-vs-cyclist-wu2021':
      // one chart per dataset: each has its own unit
      return out(s.datasets.map((d) => one(bars(s, d, locale, T, { highlight: id === 'tunnel-co-by-vehicle-class-ting2023' ? ['motorcycle'] : undefined, label: (k, p) => `${cat(s, k)}${has(p, 'not-significant') ? paren(locale, p!.flagLabels.join(locale === 'en' ? ', ' : '、')) : ''}` }), d.label)));
    case 'ambient-pm25-apportionment-2020':
      return out(
        s.datasets.map((d) =>
          one(
            renderRange({
              locale,
              data: d.points.filter((p) => p.y !== null).map((p) => ({ label: cat(s, p.x), mid: p.y as number, min: p.low ?? (p.y as number), max: p.high ?? (p.y as number) })),
              unit: '%',
              max: 100,
              decimals: 1,
              labels: { min: T.chart.ciLow, mid: T.chart.estimate, max: T.chart.ciHigh },
              categoryLabel: T.chart.category,
            }),
            d.label,
          ),
        ),
      );
    case 'two-stroke-remaining':
      return out([one(bars(s, s.datasets[0], locale, T, { label: (k, p) => `${cat(s, k)}${p?.flagLabels.length ? paren(locale, p.flagLabels.join(locale === 'en' ? ', ' : '、')) : ''}` }))]);
    case 'inspection-failure-by-age-2025':
    case 'moenv-2017-commute-pm25':
    case 'econ-ev-brand-share-2026-07':
    case 'tsai2026-three-scooter-case':
      return out([one(bars(s, s.datasets[0], locale, T))]);
    case 'commute-pm25-chuang2020':
      return out([one(bars(s, s.datasets[0], locale, T, { highlight: ['subway', 'walking', 'scooter'], decimals: 1 }))]);
    case 'commute-pm25-wang2021': {
      const d = s.datasets[0];
      return out([
        one(
          renderRange({
            locale,
            data: d.points.map((p) => ({ label: cat(s, p.x), mid: p.y as number, min: p.low!, max: p.high!, tone: p.x === 'walking' || p.x === 'motorcycle' ? 'exhaust' : 'neutral' })),
            unit: u(s, locale),
            labels: { min: ui.chart.min[locale], mid: ui.chart.median[locale], max: ui.chart.max[locale] },
            categoryLabel: T.chart.category,
          }),
        ),
      ]);
    }
    case 'taipei-traffic-vs-general-stations': {
      const xs = keys(s);
      return out([
        one(
          renderLine({
            locale,
            x: xs,
            series: [
              { label: ds(s, 'traffic').label, tone: 'exhaust', values: xs.map((k) => pt(ds(s, 'traffic'), k)?.y ?? null) },
              { label: ds(s, 'general').label, tone: 'neutral', values: xs.map((k) => pt(ds(s, 'general'), k)?.y ?? null) },
            ],
            unit: u(s, locale),
            decimals: 1,
            xLabel: T.chart.year,
          }),
        ),
      ]);
    }
    case 'tsai2023-benzene-by-class':
    case 'tsai2023-hc-by-class':
      return out([one(timeFromSeries(s, locale, T, { motorcycles: 'exhaust', gasoline: 'blue', diesel: 'violet' }))]);
    case 'ev-share-new-registrations':
      return out([one(timeFromSeries(s, locale, T, { actual: 'clean', target: 'neutral' }, 100))]);
    case 'new-registrations-electric-vs-gasoline': {
      const e = ds(s, 'electric');
      const g = ds(s, 'gasoline');
      const render = renderStacked({
        locale,
        series: [{ label: e.label, tone: 'clean' }, { label: g.label, tone: 'neutral' }],
        rows: keys(s).map((k) => ({ label: cat(s, k), values: [pt(e, k)!.y as number, pt(g, k)!.y as number] })),
        decimals: 1,
        categoryLabel: T.chart.category,
      });
      render.table = fullTable(s, locale, T);
      return out([one(render)]);
    }
    case 'inspection-2025-per-100': {
      const passed = ds(s, 'passed');
      const failed = ds(s, 'failed');
      const absent = ds(s, 'absent');
      const total = [passed, failed, absent].reduce((a, d) => a + (d.points[0].y as number), 0);
      return out([
        one(
          renderWaffle({
            locale,
            parts: [
              { value: passed.points[0].y as number, label: passed.label, tone: 'clean' },
              { value: failed.points[0].y as number, label: failed.label, tone: 'exhaust' },
            ],
            restLabel: absent.label,
            total,
            categoryLabel: T.chart.category,
            valueLabel: T.chart.value,
          }),
        ),
      ]);
    }
    case 'inspection-2025-by-stroke':
    case 'tsai2017-phase-ratios':
    case 'econ-motc-spend-by-class':
    case 'taipei-mode-share':
    case 'iot-sidewalk-widening-by-day':
    case 'iot-scramble-by-day':
    case 'iot-scramble-co-single-source':
    case 'tsai2018-older-phase-excess':
    case 'wu2021-quiet-route':
    case 'stroller-height-studies':
      break;
    case 'tsai2018-by-mileage': {
      const lo = keys(s)[0];
      const hi = keys(s)[1];
      return out([
        one(
          renderBeforeAfter({
            locale,
            data: s.datasets.map((d) => ({ label: d.label, before: pt(d, lo)!.y as number, after: pt(d, hi)!.y as number })),
            beforeLabel: cat(s, lo),
            afterLabel: cat(s, hi),
            beforeTone: 'neutral',
            afterTone: 'exhaust',
            unit: u(s, locale),
            decimals: 1,
            categoryLabel: T.chart.category,
          }),
        ),
      ]);
    }
    case 'wu2021-station-correlation': {
      const d = s.datasets[0];
      return out([
        one(
          renderSpans({
            locale,
            rows: d.points.map((p) => ({ label: cat(s, p.x), low: p.low!, high: p.high!, tone: p.x === 'pm25' ? 'neutral' : 'exhaust' })),
            min: -0.2,
            max: 1,
            marks: [{ value: 0, label: T.v25.zero }, { value: 1, label: T.v25.one }],
            tickStep: 0.2,
            categoryLabel: T.chart.category,
            valueLabel: d.label,
          }),
        ),
      ]);
    }
    case 'iot-scramble-summary': {
      // V31: reductions drawn as positive percentages on 0–100%
      const d = s.datasets[0];
      const typ = pt(d, 'typical')!;
      const outl = pt(d, 'outlier')!;
      const I = T.notUsed.items.scramble;
      return out([
        one(
          renderSpans({
            locale,
            rows: [
              { label: I.stripTypical, low: Math.abs(typ.high!), high: Math.abs(typ.low!), tone: 'neutral' },
              { label: I.stripOutlier, value: Math.abs(outl.y as number), tone: 'exhaust', note: outl.flagLabels.join('、') },
            ],
            min: 0,
            max: 100,
            unit: '%',
            tickStep: 20,
            categoryLabel: T.chart.category,
            valueLabel: T.chart.reduction,
            noteLabel: T.chart.note,
          }),
        ),
      ]);
    }
    case 'odour-thresholds': {
      const nag = ds(s, 'nagata');
      const epa = ds(s, 'usEpa');
      return out([
        one(
          renderOdour({
            locale,
            rows: keys(s).map((k) => {
              const a = pt(nag, k);
              const b = pt(epa, k);
              const marks = [
                ...(a && a.y !== null ? [{ low: a.y, source: nag.label, tone: 'exhaust' as Tone }] : []),
                ...(b && b.y !== null ? [{ low: b.low ?? b.y, high: b.high, source: epa.label, tone: 'blue' as Tone }] : []),
              ];
              return { label: cat(s, k), marks, none: marks.length ? undefined : T.chart.noSmell };
            }),
            unit: u(s, locale),
            ppbLabel: T.chart.ppb,
            ppmLabel: T.chart.ppm,
            legend: [
              { label: nag.label, tone: 'exhaust', shape: 'dot' },
              { label: epa.label, tone: 'blue', shape: 'dot' },
            ],
            categoryLabel: T.chart.category,
            valueLabel: u(s, locale),
          }),
        ),
      ]);
    }
    case 'chuang2020-effects-per-iqr':
      return out([one(intervalsFromSeries(s, locale, T, { value: 0, label: T.chart.noChange }, '%'))]);
    case 'hei-sr23-outcomes':
      return out([one(intervalsFromSeries(s, locale, T, { value: 1, label: T.chart.ratioOne }, ''))]);
  }

  // grouped and signed charts
  switch (id) {
    case 'inspection-2025-by-stroke':
    case 'tsai2017-phase-ratios':
    case 'econ-motc-spend-by-class':
    case 'taipei-mode-share': {
      const vals = s.datasets.flatMap((d) => d.points.map((p) => p.y ?? 0));
      return out([
        one(
          renderGrouped({
            locale,
            series: s.datasets.map((d, i) => ({ label: d.label, tone: TONES[i % TONES.length] })),
            groups: keys(s).map((k) => ({ label: cat(s, k), values: s.datasets.map((d) => pt(d, k)?.y ?? 0) })),
            unit: u(s, locale),
            decimals: Math.min(dec(vals), 2),
            categoryLabel: T.chart.category,
          }),
        ),
      ]);
    }
    case 'tsai2018-older-phase-excess': {
      const r = signedFromSeries(s, locale, T, 'category', { hollowFlag: 'not-significant' });
      return out([one(r.render)], { notes: [...notes, ...(r.sigNote ? [r.sigNote] : [])] });
    }
    case 'wu2021-quiet-route':
    case 'iot-sidewalk-widening-by-day': {
      const r = signedFromSeries(s, locale, T, 'dataset', { hollowFlag: id === 'wu2021-quiet-route' ? 'not-significant' : 'model-check-failed' });
      return out([one(r.render)], { notes: [...notes, ...(r.sigNote ? [r.sigNote] : [])] });
    }
    case 'iot-scramble-by-day':
    case 'iot-scramble-co-single-source': {
      const r = signedFromSeries(s, locale, T, 'dataset', { hollowFlag: 'model-check-failed' });
      return out([one(r.render)], { notes: [...notes, ...(r.sigNote ? [r.sigNote] : [])] });
    }
    case 'stroller-height-studies':
      return out([one(signedFromSeries(s, locale, T, 'dataset').render)]);
    default:
      // anything new in the registry: a table, so it still appears
      return out([], { table: { ...fullTable(s, locale, T), note: T.chart.asTable } });
  }
}

/** V29 needs its band from the review fact; kept apart so the page can pass the registry values in. */
export function strollerView(locale: Locale, T: T, band: { low: number; high: number }): SeriesView {
  const s = ls('stroller-height-studies', locale);
  const r = signedFromSeries(s, locale, T, 'dataset', { band: { ...band, label: T.v29.band }, foot: T.v29.foot, zeroLabel: T.v29.zero });
  return { s, panels: [{ render: r.render, title: s.title, desc: s.description }], notes: pointNotes(s, locale) };
}

export { sgn };
