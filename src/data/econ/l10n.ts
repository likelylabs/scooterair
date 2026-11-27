// The one runtime helper the economics dataset and the calculator need from the rest of the site:
// building a bilingual string. It lives here, not in ../types.ts, so the calculator's browser
// chunk does not carry the site-wide label tables that ../types.ts defines alongside it.

import type { L10n } from '../types.ts';

/** Build an L10n value. Traditional Chinese first, English second (the same as ../types.ts `t`). */
export const t = (zh: string, en: string): L10n => ({ 'zh-TW': zh, en });
