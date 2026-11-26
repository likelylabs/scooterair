/**
 * Browser-side chart updates, for calculators.
 *
 *   import { updateChart } from '@/components/charts/core/client';
 *   import { renderWaterfall } from '@/components/charts/core/waterfall';
 *
 *   updateChart(document.querySelector('#price-chart')!, renderWaterfall({ … }));
 *
 * `el` is the <div class="chart"> a chart component rendered. Its title,
 * description and table label are kept; everything else is redrawn with the
 * same code that drew it at build time. Import only the render functions you
 * need: each is a few hundred bytes.
 */
import { chartHtml, type ChartRender } from './shared';

export function updateChart(el: Element, render: ChartRender): void {
  const root = el as HTMLElement;
  const open = root.querySelector<HTMLDetailsElement>('.chart__data')?.open ?? false;
  root.innerHTML = chartHtml(render, {
    id: root.dataset.id ?? root.id ?? 'chart',
    title: root.dataset.title ?? '',
    desc: root.dataset.desc || undefined,
    tableLabel: root.dataset.tableLabel ?? '',
  });
  const details = root.querySelector<HTMLDetailsElement>('.chart__data');
  if (details) details.open = open;
}
