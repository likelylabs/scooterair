// The site's own 3-D simulation of one red light (signed 2026-11-27): one fact per statement the
// site may make (research/simulation/statements.json `may`), plus the chart (a) series.
//
// Rules for editors
// - Every number comes from ./simulation-data.ts, which scripts/build-simulation-data.mjs generates
//   from research/simulation/ and check-data re-generates. Nothing here is typed by hand.
// - evidence 'estimate' (chip 推估); the source is 'scooterair-simulation-2026', whose read level is
//   'own-simulation-estimate' (本站自己用電腦算的推估，不是量的).
// - `research` points at the statement: 'simulation/statements#may-<n>' (n counts from 1, as the
//   site's documents number the statements). check-data checks that the statement exists.
// - Statements and caveats print no air number beside the word 推估 (check-site check 4 wants such
//   numbers inside an EstimateValue); the numbers live in `data` and `display`.
// - None of the statements.json must-not statements, in any wording.

import type { FactInput } from './facts.ts';
import { t, v } from './types.ts';
import { simData } from './simulation-data.ts';

const S = simData.statements;
const SIM_PERIOD = t('電腦算的一個紅燈，2026 年 11 月簽核', 'One simulated red light, signed November 2026');
const KERB = t('一般的街上，紅燈時人行道的路邊（不是哪一個特定的路口）', 'An open street, at the kerb during a red light (not any particular junction)');
const ONE_RED = t(
  '這是電腦算的，不是量的。每種情況只算了一個紅燈，風、引擎的熱和排氣管的角度都是假設的，所以可信程度是低到中。',
  'This was worked out on a computer, not read off an instrument. Each case is one simulated red light, and the wind, engine heat and exhaust angle are assumptions, so confidence is low to moderate.',
);
const R = (n: number) => `simulation/statements#may-${n}`;

export const simulation = {
  'sim-co-one-red-15min': {
    data: {
      lo: v(S.oneRed15.lo, 'ppm', { approx: true }),
      hi: v(S.oneRed15.hi, 'ppm', { approx: true }),
      nearTailpipeAbout: v(S.oneRed15.nearTailpipeAbout, 'ppm', { approx: true, note: 'statement 1 mustCarry "up to about 5 directly behind a tailpipe in near-calm air"; it equals the middle case (P50) of results #37' }),
      who15min: v(simData.who15min_ppm, 'ppm'),
    },
    display: t(`約 ${S.oneRed15.lo} 到 ${S.oneRed15.hi} ppm（15 分鐘平均）`, `about ${S.oneRed15.lo} to ${S.oneRed15.hi} ppm (15-minute average)`),
    statement: t(
      '電腦算的一個紅燈：在一般的街上等一個紅燈，機車排出的一氧化碳，攤成 15 分鐘的平均，比世界衛生組織的 15 分鐘指引值低很多（範圍見「怎麼算的」那一頁）。',
      'One red light, simulated: on an open street, the carbon monoxide the scooters add during one red light, spread over 15 minutes, is far below the WHO 15-minute guideline (its range is on the ‘How we worked it out’ page).',
    ),
    period: SIM_PERIOD,
    place: KERB,
    sources: ['scooterair-simulation-2026', 'who-2021-aqg'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: ONE_RED,
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'Statement 1. Print with 推估, the range and "one red, 15-minute average, open street". The near-tailpipe value is printed in statement 1’s own words, "up to about 5" (最多約 5).',
    research: R(1),
  },
  'sim-co-stay-15min': {
    data: {
      lo: v(S.stay15.lo, 'ppm', { approx: true }),
      hi: v(S.stay15.hi, 'ppm', { approx: true }),
    },
    display: t(`約 ${S.stay15.lo} 到 ${S.stay15.hi} ppm（每個紅燈都在，15 分鐘）`, `about ${S.stay15.lo} to ${S.stay15.hi} ppm (every red for 15 minutes)`),
    statement: t(
      '電腦算的一個紅燈：就算每個紅燈都站在路邊、站滿 15 分鐘，風又一直從機車吹向你，一氧化碳的 15 分鐘平均，還是低於世界衛生組織的指引值。',
      'One red light, simulated: even standing at the kerb through every red for 15 minutes, with the wind always blowing from the scooters to you, the 15-minute carbon monoxide average stays below the WHO guideline.',
    ),
    period: SIM_PERIOD,
    place: KERB,
    sources: ['scooterair-simulation-2026'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '15 分鐘是照算過的一個紅燈推出來的。風一直從機車吹來的情形很少見。這是小孩和嬰兒車的高度；膝蓋高的地方更多。',
      'The 15 minutes are worked out from one simulated red. A wind that keeps blowing from the scooters is rare. This is at child and pushchair height; knee height gets more.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'Statement 2. The top of the range is not a ceiling for everyone: knee height (0.3 m) gets more (results #4). Never print "far below" for this case.',
    research: R(2),
  },
  'sim-co-pushchair-exception': {
    data: {
      middleLo: v(S.pushchair.medianLo, 'ppm', { approx: true }),
      middleHi: v(S.pushchair.medianHi, 'ppm', { approx: true }),
      oneInLo: v(S.pushchair.oneInLo, 'count', { note: '1 in 10 such 15-minute periods pass 87 ppm' }),
      oneInHi: v(S.pushchair.oneInHi, 'count', { note: '1 in 5 such 15-minute periods pass 87 ppm' }),
      height: v(S.pushchair.height_m, 'metres'),
      who15min: v(simData.who15min_ppm, 'ppm'),
    },
    display: t('嬰兒車停在排氣管正後方：這樣的 15 分鐘，每十次約有一到兩次超過指引值', 'A pushchair right behind a tailpipe: about 1 or 2 in 10 such 15-minute periods pass the guideline'),
    statement: t(
      '電腦算的一個紅燈：有一個例外。嬰兒車停在一輛引擎沒熄火的機車排氣管正後方約半公尺，幾乎沒有風、風向也不變，連續 15 分鐘每個紅燈都在，一氧化碳的 15 分鐘平均可能超過世界衛生組織的指引值；這樣的 15 分鐘，每十次約有一到兩次。往旁邊移開半公尺，就沒有了。',
      'One red light, simulated: there is one exception. A pushchair parked about half a metre directly behind the tailpipe of a scooter with its engine running, in near-still air that keeps its direction, through every red for 15 minutes, can pass the WHO 15-minute guideline for carbon monoxide: in about 1 or 2 of 10 such 15-minute periods. Half a metre to the side, and it is gone.',
    ),
    period: SIM_PERIOD,
    place: t('一輛機車排氣管正後方約半公尺，嬰兒車裡低低的高度（約 0.6 公尺）', 'About half a metre directly behind one tailpipe, low in the pushchair (about 0.6 m)'),
    sources: ['scooterair-simulation-2026', 'who-2021-aqg'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '這是我們最沒把握的結果。電腦裡的空氣比平常更靜，所以可能算高了；最細的格子也還沒有算到穩定。很弱的風剛好從那一邊吹來，大約一百個紅燈才有一次；要連續 15 分鐘，就更少了。稍微高一點、到小孩站著的高度，就少很多或沒有。',
      'This is our least certain result. The air in the model is stiller than usual, so this may be too high, and the finest grid was not shown to have settled. A very weak wind from that side comes in about 1 red in 100; for 15 minutes in a row it is rarer still. A little higher, at a standing child\'s height, it is much rarer or gone.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    alsoLinks: [6],
    editorNote: 'Statement 3. Always with 推估, 信心低, near-still held wind (rare), the exact position, "very still air in the model" and "half a metre to the side removes it". The 1-in-10 to 1-in-5 share is of such 15-minute periods at about 0.6 m, never tied to 0.7 m. Never a number above 87 for this row (no 280).',
    research: R(3),
  },
  'sim-co-bursts-1s': {
    data: {
      usualLo: v(S.bursts.usualLo, 'ppm', { approx: true }),
      usualHi: v(S.bursts.usualHi, 'ppm', { approx: true }),
      heldLo: v(S.bursts.heldLo, 'ppm', { approx: true }),
      heldHi: v(S.bursts.heldHi, 'ppm', { approx: true }),
      uncertainTimes: v(S.bursts.uncertainTimes, 'ratio'),
    },
    display: t('靠近排氣管時，一氧化碳是一陣一陣的', 'Near a tailpipe, carbon monoxide comes in bursts'),
    statement: t(
      '電腦算的一個紅燈：靠近排氣管時，一氧化碳是一陣一陣的，每一秒都不一樣。最多的一秒，比整個紅燈的平均多好幾倍。',
      'One red light, simulated: near a tailpipe, carbon monoxide comes in bursts, and every second is different. The highest second is several times the average over the red.',
    ),
    period: SIM_PERIOD,
    place: t('離排氣管約半公尺', 'About half a metre from a tailpipe'),
    sources: ['scooterair-simulation-2026'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '一秒的數字不太準，可能差到三倍；在嬰兒車的高度，可能還算低了。世界衛生組織的指引值看的是 15 分鐘的平均，一秒的量不能拿來和它比。',
      'One-second values are rough and could be off about three-fold; at pushchair height they are probably too low. The WHO guideline is about a 15-minute average, so a one-second value cannot be set against it.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'Statement 4. Never beside 87 ppm, 31 ppm or any 15-minute or 1-hour value. No NIOSH comparison.',
    research: R(4),
  },
  'sim-pushchair-height': {
    data: {
      ratioLo: v(S.height.ratioLo, 'ratio', { approx: true }),
      ratioHi: v(S.height.ratioHi, 'ratio', { approx: true }),
      height: v(S.height.height_m, 'metres'),
    },
    display: t('風從機車吹來時，嬰兒車高度和大人鼻子差不多到兩倍', 'With the wind from the scooters, pushchair height gets between about the same as an adult\'s nose and about twice as much'),
    statement: t(
      '電腦算的一個紅燈：風從機車吹來時，嬰兒車高度（約 0.7 公尺）的廢氣，和大人鼻子差不多到兩倍；排氣管正後方、幾乎沒風時更多。不是每種風都這樣。',
      'One red light, simulated: with the wind from the scooters, exhaust at pushchair height (about 0.7 m) is between about the same as at an adult\'s nose and about twice as much; more right behind a tailpipe in still air. Not in every wind.',
    ),
    period: SIM_PERIOD,
    place: KERB,
    sources: ['scooterair-simulation-2026', 'buzzard-2009-eh', 'kenagy-2016-aqah'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '不是每種風都這樣。這說的是那個高度的空氣，不是說小孩吸進的一氧化碳是大人的兩倍。',
      'Not in every wind. This is about the air at that height, not a claim that children breathe twice as much carbon monoxide.',
    ),
    requiresCaveat: true,
    chainLink: 6,
    editorNote: 'Statement 5. Always 推估, "wind from the scooters" and "not in every wind". Never "children breathe twice as much carbon monoxide".',
    research: R(5),
  },
  'sim-smell-seconds': {
    data: {
      share800Lo: v(S.smell.cases[0].low * 100, 'percent', { approx: true, note: 'results #20, odour threshold D/T 800' }),
      share800Hi: v(S.smell.cases[0].high * 100, 'percent', { approx: true }),
      share6800Lo: v(S.smell.cases[1].low * 100, 'percent', { approx: true, note: 'results #19, odour threshold D/T 6800' }),
      share6800Hi: v(S.smell.cases[1].high * 100, 'percent', { approx: true }),
    },
    display: t('風從機車吹來時，紅燈一半以上的時間聞得到', 'With the wind from the scooters, you can smell it for half the red or more'),
    statement: t(
      '電腦算的一個紅燈：你聞到的味道是真的。風從一群引擎沒熄火的機車吹向你時，紅燈大約一半到幾乎全部的秒數，廢氣都多過一般人聞得到的量。',
      'One red light, simulated: the smell is real. When the wind blows to you from a group of scooters with their engines running, the exhaust is above the level most people can smell for about half to nearly all seconds of the red.',
    ),
    period: SIM_PERIOD,
    place: t('一群機車的下風處，路邊約半公尺', 'Downwind of a group of scooters, about half a metre from the kerb'),
    sources: ['scooterair-simulation-2026', 'epa-ap122-1973'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '「聞得到」的標準，來自 1967 和 1970 年汽車廢氣研究的摘要，只能說「風吹來時，很多秒聞得到」。這是風整個紅燈都從機車吹來的情形，最多大約八個紅燈有一個。',
      'What counts as "can smell it" comes from abstracts of car-exhaust studies from 1967 and 1970; it supports only "smellable in many seconds when the wind blows from the scooters". This is the case of the wind blowing from the scooters for the whole red, at most about 1 red in 8.',
    ),
    requiresCaveat: true,
    chainLink: 4,
    editorNote: 'Statement 6. No odour-unit numbers anywhere. Never "the smell shows carbon monoxide is high".',
    research: R(6),
  },
  'smell-not-co-guideline': {
    data: {},
    display: t('很臭，不代表一氧化碳超過指引值', 'A strong smell does not mean carbon monoxide is over the guideline'),
    statement: t(
      '一氧化碳沒有味道。你聞到的味道，比較可能是燒過才有的（推估，只能粗略估計）；鼻子在十億份空氣裡只有幾份時，就聞得到。所以很臭，不代表一氧化碳超過指引值。',
      'Carbon monoxide has no smell. The smell you notice more likely comes from burning (an estimate, order of magnitude only); the nose picks it up at a few parts in a billion. So a strong smell does not mean carbon monoxide is over the guideline.',
    ),
    period: t('嗅覺門檻：日本 1976–1988 年、美國 1995 年；電腦算的一個紅燈：2026 年', 'Smell thresholds: Japan 1976–1988, US 1995; the simulated red light: 2026'),
    place: t('不限地區', 'Not place-specific'),
    sources: ['nagata-odour-thresholds', 'api-1995-gasoline-odour', 'who-2010-indoor-air-guidelines', 'scooterair-simulation-2026', 'scooterair-smell-chemicals-2026'],
    confidence: 'verified',
    evidence: 'international',
    caveat: t(
      '嗅覺門檻每個人不一樣，只能看大概是幾位數。這句話不是說廢氣沒事：臭味告訴你，你正站在廢氣裡。',
      'Smell thresholds differ from person to person; only their rough size means anything. This does not say exhaust is harmless: the smell tells you that you are standing in exhaust.',
    ),
    requiresCaveat: true,
    chainLink: 4,
    editorNote: 'Statement 7: no number, general fact. Its "unburnt fuel" half is superseded by statements-smell not-unburnt-petrol (the smell more likely comes from burning); the carbon monoxide and parts-per-billion halves stand. Do not use it to say exhaust is harmless.',
    research: R(7),
  },
  'sim-benzene-stayers-1h': {
    data: {
      timesLo: v(S.benzeneStay.timesLo, 'ratio', { approx: true }),
      timesHi: v(S.benzeneStay.timesHi, 'ratio', { approx: true }),
      reference: v(S.benzeneStay.reference_ppb, 'ppb', { note: 'California OEHHA acute REL, 1 hour, derived on a 6-hour basis' }),
      referenceBasis: v(S.benzeneStay.referenceBasis_h, 'hours'),
      kerbLo: v(S.benzeneStay.rows[0].lo, 'ppb', { approx: true, note: 'results #7 red_45pct_P50' }),
      kerbHi: v(S.benzeneStay.rows[0].hi, 'ppb', { approx: true, note: 'results #7 red_65pct_P95' }),
      backLo: v(S.benzeneStay.rows[1].lo, 'ppb', { approx: true, note: 'results #8 red_45pct_P50' }),
      backHi: v(S.benzeneStay.rows[1].hi, 'ppb', { approx: true, note: 'results #8 red_65pct_P95' }),
      emissionUncertainLo: v(S.benzeneStay.emissionUncertainLo, 'ratio'),
      emissionUncertainHi: v(S.benzeneStay.emissionUncertainHi, 'ratio'),
    },
    display: t('在路口待一小時的人：苯約是加州 1 小時參考值的 1 到 4 倍', 'People who stay an hour: benzene about 1 to 4 times California\'s 1-hour reference'),
    statement: t(
      '電腦算的一個紅燈：在路口待上一小時的人，像攤販、交通警察、導護，如果風一直從機車吹來，苯的一小時平均，可能是美國加州 1 小時參考值的 1 到 4 倍。這不是在說等一個紅燈的人。',
      'One red light, simulated: for people who stay an hour at a junction, such as vendors, traffic officers and crossing guards, with the wind blowing from the scooters, the 1-hour benzene average can be about 1 to 4 times California\'s 1-hour reference level. This is not about someone waiting one red.',
    ),
    period: SIM_PERIOD,
    place: t('路邊約半公尺到 1 公尺，站一小時', 'About half a metre to 1 metre from the kerb, for an hour'),
    sources: ['scooterair-simulation-2026', 'arb-oehha-acute-rel-2025'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '這個參考值雖然叫 1 小時，是用 6 小時的資料訂的。機車廢氣裡有多少苯，我們不太確定，可能差到 5 到 10 倍。',
      'That reference is called 1-hour but was set from 6-hour data. We are not sure how much benzene scooter exhaust holds; it could be off five- to ten-fold.',
    ),
    requiresCaveat: true,
    chainLink: 3,
    alsoLinks: [6],
    editorNote: 'Statement 8. Always 1–4 times, the 6-hour basis, the five- to ten-fold emission uncertainty, held wind, and "not about one red". No cancer or risk wording; never ranked against carbon monoxide or particles.',
    research: R(8),
  },
  'sim-enclosed-could-reach': {
    data: {
      hkMean: v(39, 'ppm', { note: 'Chan, Burnett and Chow 1997: Hong Kong car parks, mean 15-min value; basis only, never printed' }),
      hkMax: v(362, 'ppm', { note: 'same; highest 15-min value; basis only, never printed' }),
    },
    display: t('一般來說，只有封閉的地方才可能到指引值', 'Generally, only enclosed places could reach the guideline'),
    statement: t(
      '用空氣流量粗算：一般來說，只有封閉的地方，例如地下停車場、地下道，或不太通風、有屋頂的候車區，裡面有幾十輛機車引擎沒熄火，才可能讓一氧化碳的 15 分鐘平均到世界衛生組織的指引值。這些地方我們沒有算，也沒有找到台灣在這些地方的量測。',
      'A rough air-flow sum: generally, only enclosed places, such as an underground car park, an underpass or a stuffy covered waiting area with dozens of scooters idling, could bring the 15-minute carbon monoxide average up to the WHO value. We did not simulate these places, and we found no Taiwanese measurement of them.',
    ),
    period: SIM_PERIOD,
    place: t('封閉的地方（沒有算）', 'Enclosed places (not simulated)'),
    sources: ['scooterair-simulation-2026', 'chan-burnett-chow-1997', 'who-2010-indoor-air-guidelines'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t('這是用空氣流量粗算的，不是一秒一秒算的。香港停車場的量測只拿來當根據。', 'This is a rough air-flow sum, not a second-by-second simulation. The Hong Kong car-park readings are used only as its basis.'),
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'Statement 9. The Hong Kong numbers are basis only: never printed. Write "we found no Taiwanese measurement", never "Taiwan has none".',
    research: R(9),
  },
  'sim-arcade-inside': {
    data: {
      lo: v(S.arcade.lo, 'ppm', { approx: true }),
      hi: v(S.arcade.hi, 'ppm', { approx: true }),
    },
    display: t(`約 ${S.arcade.lo} 到 ${S.arcade.hi} ppm（走進騎樓 1 到 3 公尺）`, `about ${S.arcade.lo} to ${S.arcade.hi} ppm (1 to 3 m inside the arcade)`),
    statement: t(
      '電腦算的一個紅燈：風從機車吹向騎樓時，走進騎樓 1 到 3 公尺，一氧化碳比路邊少，但不是乾淨的空氣。',
      'One red light, simulated: with the wind from the scooters toward an arcade, 1 to 3 metres inside it there is less carbon monoxide than at the kerb, but the air is not clean.',
    ),
    period: SIM_PERIOD,
    place: t('有騎樓的街，風很小', 'A street with an arcade, light wind'),
    sources: ['scooterair-simulation-2026'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t('這只算了一個風很小的紅燈；很多個紅燈連著會怎樣，沒有算。', 'This is one light-wind red; many reds in a row were not simulated.'),
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'Statement 10. Never "arcades trap exhaust" or "arcades are safe or clean". /estimate/ only.',
    research: R(10),
  },
  'sim-series-examples': {
    data: {
      adultMean: v(simData.series.adult.mean, 'ppm', { note: 'S1-from, K 0.5 m, 1.5 m: one emission draw, 90 s' }),
      pushchairMean: v(simData.series.pushchair.mean, 'ppm', { note: 'NF1-fine, K 0.5 m, 0.7 m: one emission draw, 30 s' }),
      adultSeconds: v(simData.series.adult.seconds, 'seconds'),
      pushchairSeconds: v(simData.series.pushchair.seconds, 'seconds'),
    },
    display: t('同一個紅燈，每一秒都不一樣', 'One red light, second by second'),
    statement: t(
      '電腦算的一個紅燈：兩個例子，每一秒的量都不一樣，少數幾秒是整個紅燈平均的好幾倍。',
      'One red light, simulated: two examples in which every second differs, and a few seconds reach several times the average over the red.',
    ),
    period: SIM_PERIOD,
    place: t('路邊約半公尺：大人鼻子的高度，和一輛機車後面嬰兒車的高度', 'About half a metre from the kerb: an adult\'s nose, and pushchair height behind one scooter'),
    sources: ['scooterair-simulation-2026'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t('每個例子只是一種排放量算出來的一次結果，不是範圍；一秒的數字不太準。', 'Each example is one run with one emission level, not a range; one-second values are rough.'),
    requiresCaveat: true,
    chainLink: 3,
    editorNote: 'Chart (a) only. No per-second number labels, no guideline line, no build-up wording.',
    research: R(4),
  },
} satisfies Record<string, FactInput>;
