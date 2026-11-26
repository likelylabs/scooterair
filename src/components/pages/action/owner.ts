// The site owner's statement on /about/#who.
//
// The owner supplied the maker's credit: the site is made by @kchau, linked to their X profile.
// Nothing has been supplied about funding or any relationship with a scooter maker or battery
// network, so the page says nothing about either. Never add an invented organisation, funder
// or contact address here.

export const OWNER_STATEMENT_SUPPLIED = true;

export const OWNER = { handle: '@kchau', url: 'https://x.com/kchau' } as const;

/** Kept for /about/, which calls it at build time; there is no placeholder to warn about now. */
export function warnIfPlaceholder(): void {}
