/**
 * alt-once.client.ts — the long closing sentence of a scene's alt text, once per page.
 *
 * Every scene's alt ends with a sentence about what is estimated and what is drawn for the eye
 * (or, for an electric scene, the street's own air). Heard on all fifteen home screens it is
 * noise, so SceneFrame prints the short form beside it (data-alt-short, still ending 「這是示意圖。」)
 * and this script keeps the long one on the FIRST scene of each kind in document order and gives
 * every later scene its short one. Without JavaScript every scene keeps the long sentence.
 * The visible tag (示意圖｜廢氣其實大多看不見) on each picture is untouched.
 */
function once(): void {
  const seen = new Set<string>();
  document.querySelectorAll<SVGElement>('svg[data-alt-note][data-alt-short]').forEach((svg) => {
    const note = svg.dataset.altNote!;
    if (!seen.has(note)) {
      seen.add(note);
      return;
    }
    svg.setAttribute('aria-label', svg.dataset.altShort!);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', once, { once: true });
else once();
