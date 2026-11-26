/**
 * Hover layer for every chart on the page (loaded once by ChartShell).
 * Purely additive: each value it shows is already readable from a direct
 * label or the data table. Uses event delegation, so charts redrawn by
 * updateChart() keep working.
 */
let tip: HTMLDivElement | null = null;

function show(lines: string[], x: number, y: number) {
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.setAttribute('role', 'presentation');
    document.body.append(tip);
  }
  tip.replaceChildren(
    ...lines.map((line, i) => {
      const el = document.createElement(i === 0 && lines.length > 1 ? 'strong' : 'span');
      el.textContent = line; // labels are data: never innerHTML
      return el;
    }),
  );
  tip.hidden = false;
  const w = tip.offsetWidth;
  const left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2));
  tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(Math.max(8, y - tip.offsetHeight - 14))}px)`;
}

function hide() {
  if (tip) tip.hidden = true;
  document.querySelectorAll<SVGLineElement>('.c-cross[visibility="visible"]').forEach((l) => l.setAttribute('visibility', 'hidden'));
}

function onMove(e: PointerEvent) {
  const target = e.target as Element | null;
  const plot = target?.closest<HTMLElement>('.chart__plot');
  if (!plot) return hide();

  // line-type charts: snap a crosshair to the nearest x position
  if (plot.dataset.hover) {
    const svg = plot.querySelector<SVGSVGElement>('.chart__svg');
    const cross = plot.querySelector<SVGLineElement>('.c-cross');
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const data = JSON.parse(plot.dataset.hover) as { xs: number[]; rows: string[] };
    const at = ((e.clientX - box.left) / box.width) * 100;
    let best = 0;
    data.xs.forEach((x, i) => Math.abs(x - at) < Math.abs(data.xs[best] - at) && (best = i));
    if (cross) {
      cross.setAttribute('x1', `${data.xs[best]}%`);
      cross.setAttribute('x2', `${data.xs[best]}%`);
      cross.setAttribute('visibility', 'visible');
    }
    return show(data.rows[best].split('\n'), box.left + (box.width * data.xs[best]) / 100, e.clientY);
  }

  // mark-type charts: the row is the hit target
  const row = target?.closest<SVGGElement>('[data-tip]');
  if (!row) return hide();
  show([row.dataset.tip ?? ''], e.clientX, e.clientY);
}

if (!document.documentElement.dataset.chartTips) {
  document.documentElement.dataset.chartTips = '';
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', onMove, { passive: true });
  document.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', hide, { passive: true });
}
