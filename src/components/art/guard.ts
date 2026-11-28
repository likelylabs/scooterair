// The school crossing guard (導護) of home screen 5 (KerbScene figure="guard"). Plain TypeScript,
// loadable by Node (the art tests). Figure-local coordinates as parts.ts: feet at the origin,
// facing right (toward the road).
//
// An adult (adultLegs / adultTop) in a plain yellow-green vest, solid, with one lighter band at
// chest height; the front hand holds a short pole with a small rectangular flag. Nothing round is
// added: no paddle, no disc, no ring (the only circle is the head every figure has).

import { adultLegs, adultTop } from './parts.ts';

export function crossingGuard(): string {
  return [
    adultLegs(),
    adultTop([17, -99]),
    '<path class="kerb-vest" d="M-11.5,-128H11.5V-94H-11.5Z"/>',
    '<path class="kerb-vest__band" d="M-11.5,-119H11.5V-114H-11.5Z"/>',
    // the front arm again, over the vest
    '<path class="a-ink-s" stroke-width="8.5" d="M2,-128 L17,-99"/>',
    '<path class="a-metal-s" stroke-width="3" d="M18,-96 L22,-150"/>',
    '<path class="kerb-flag" d="M22,-150 L42,-147 L41,-133 L21,-136Z"/>',
  ].join('');
}
