// The site owner's statement on /about/#who: who made the site, who pays for it, and any
// relationship with a scooter maker or battery network (blueprint 4.9, Appendix B item 1).
//
// It has NOT been supplied. Until it is, /about/ shows a visibly unfinished placeholder block
// and every build prints the warning below. When the owner supplies the statement:
//   1. write it into src/i18n/pages/about.ts (replace `owner`, keep both languages),
//   2. render it in src/pages/[...lang]/about.astro in place of the placeholder block,
//   3. set OWNER_STATEMENT_SUPPLIED to true.
// Never fill the placeholder with an invented organisation, funder or contact address.

export const OWNER_STATEMENT_SUPPLIED = false;

let warned = false;
/** Called by /about/ at build time; warns once per build while the placeholder is in place. */
export function warnIfPlaceholder(): void {
  if (OWNER_STATEMENT_SUPPLIED || warned) return;
  warned = true;
  console.warn(
    '\n\u001b[33m⚠ [about] PLACEHOLDER: /about/#who has no owner statement yet (who made and funds the site, any relationship with a scooter maker or battery network, contact, reuse licence). ' +
      'The page shows a visibly unfinished block until it is supplied. See src/components/pages/action/owner.ts.\u001b[0m\n',
  );
}
