// The smell-chemicals step (research/simulation/smell-chemicals, signed 2026-11-27): one fact per
// allowed statement of statements-smell.json that the site prints, plus the IARC labels and the
// yardsticks it used and did not use.
//
// Rules for editors
// - Numbers come from ./simulation-data.ts (`simData.smellChemicals`), which
//   scripts/build-simulation-data.mjs generates from results-smell.json and check-data re-generates.
// - `research` names the statement: 'simulation/smell-chemicals/statements-smell#<id>'. check-data
//   checks the id is one of the file's allowed statements.
// - chainLink null: these facts are listed in their own block on /evidence/ (#smell-chemicals), never
//   in the link-4 group that holds the WHO "no safe level of benzene" line (must-not 2). Inside that
//   block the seconds-long facts and the 30-minute / 1-hour facts are separate lists (must-not 3).
// - A statement or caveat never prints an air number beside the word 推估 (check-site check 4); the
//   numbers live in `data` and `display`, and the row's chip says 推估.
// - Never: smell and "causes cancer" in one sentence (must-not 1); a Group 1 label without the
//   meaning of the groups and exhaust's own 2B (must-not 4); "you smell acetaldehyde" (must-not 6).

import type { FactInput } from './facts.ts';
import { t, v } from './types.ts';
import { simData } from './simulation-data.ts';

const C = simData.smellChemicals;
const R = (id: string) => `simulation/smell-chemicals/statements-smell#${id}`;
const PERIOD = t('電腦算的一個紅燈，2026 年 11 月簽核（推估）', 'One simulated red light, signed November 2026 (estimate)');
const KERB = t('一般的街上，路邊離最近的機車半公尺、約 0.7 公尺高（小孩鼻子的高度）', 'An ordinary street, at the kerb half a metre from the nearest scooter, about 0.7 m up (a child’s nose height)');
const NOT_PLACE = t('不限地區（危害分類）', 'Not place-specific (hazard classification)');
const OLDER = t(
  '每一種成分占多少，來自台灣、印度、尼泊爾的舊型機車（化油器或沒有觸媒），有兩種只有汽車的資料；新型、噴射、有觸媒的機車可能不一樣。',
  'Every share comes from older scooters in Taiwan, India and Nepal (carburetted or without a catalyst), and two only from cars; modern fuel-injected scooters with a catalyst may differ.',
);
const SPECIATION: FactInput['sources'] = ['yao-2008-atmosenv', 'kumar-2020-acp', 'stockwell-2016-acp', 'tsai-2018-aaqr', 'chula-2001-2stroke-btex', 'tsai-2003-jawma', 'epa-moves-2016-toxics', 'eea-2023-roadtransport', 'daemme-2016', 'chirico-2014-acpd'];
const pc = (x: number) => Math.round(x * 100);
const stayRow = (chem: string) => C.stay.find((s) => s.chem === chem)!;
const bz = stayRow('benzene').rows[0]!;

export const smellChemicals = {
  'smell-comes-with-benzene': {
    data: { benzeneOwnOdour: v(C.benzeneOwn.threshold_ppb, 'ppb', { note: 'benzene\'s own odour threshold used by the smell step; no pack draw reaches it' }) },
    display: t('聞到的不是苯，但苯跟著一起來', 'What you smell is not benzene, but benzene comes with it'),
    statement: t(
      '聞到的不是苯，但苯跟著一起來。只要你聞得到身旁怠速機車的廢氣，同一口空氣裡就有苯（推估）。',
      'What you smell is not benzene, but benzene comes with it. Whenever you can smell the exhaust of the idling scooters beside you, the same breath of air holds benzene (estimate).',
    ),
    period: PERIOD,
    place: t('紅燈時，身旁有怠速的機車', 'At a red light, beside idling scooters'),
    sources: ['scooterair-smell-chemicals-2026', 'scooterair-simulation-2026', 'nagata-odour-thresholds', 'epa-ap122-1973'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '只在那個味道來自身旁機車的廢氣時成立；路上的味道也可能來自別的車或別的地方。這是電腦裡算出來的關係：味道和苯來自同一團廢氣。聞不到，不代表空氣乾淨：沒有味道的時候也可能有苯。',
      'This holds only if the smell is the exhaust of the scooters beside you; a smell in the street can come from other vehicles or other sources. It is a relation worked out in the model: the smell and the benzene come from the same exhaust. No smell does not mean clean air: benzene can be there when nothing can be smelled.',
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'statements-smell smell-comes-with-benzene. Always in the same view as smell-no-smell-not-clean. Never next to a cancer word in one sentence.',
    research: R('smell-comes-with-benzene'),
  },
  'smell-what-is-in-it': {
    data: {},
    display: t('甲苯、二甲苯、苯等十幾種廢氣成分', 'Toluene, xylenes, benzene and about ten other exhaust chemicals'),
    statement: t(
      '如果你聞到的是身旁機車的廢氣，那口空氣裡也有甲苯、二甲苯、乙苯、苯、1,3-丁二烯、正己烷、甲醛、乙醛、萘、苯乙烯和丙烯醛，另外還有氰化氫（照在廢氣裡占的多少排，推估）。',
      'If what you smell is the exhaust of the scooters beside you, that air also holds toluene, xylenes, ethylbenzene, benzene, 1,3-butadiene, n-hexane, formaldehyde, acetaldehyde, naphthalene, styrene and acrolein, and also hydrogen cyanide (in order of their share of the exhaust; estimate).',
    ),
    period: PERIOD,
    place: t('紅燈時，身旁有怠速的機車', 'At a red light, beside idling scooters'),
    sources: ['scooterair-smell-chemicals-2026', ...SPECIATION],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: OLDER,
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'statements-smell what-is-in-it, listed in share order (never by hazard). Hydrogen cyanide is a share of CO, so it is named apart.',
    research: R('what-is-in-it'),
  },
  'smell-older-engines': {
    data: {},
    display: t('成分比例來自舊型機車', 'The shares come from older engines'),
    statement: OLDER,
    period: t('量測 1999–2020 年', 'Measured 1999–2020'),
    place: t('台灣、印度、尼泊爾（另有汽車資料）', 'Taiwan, India and Nepal (plus car data)'),
    sources: ['yao-2008-atmosenv', 'kumar-2020-acp', 'stockwell-2016-acp', 'tsai-2017-aaqr', 'dominutti-2023-vietnam', 'tw-fuel-standard-2020'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '新型、噴射、有觸媒的台灣機車怠速時，每一種成分各占多少，我們找不到可以打開的量測；所以不說它們的量是多少。',
      'We found no measurement we could open of what share each chemical makes up for a modern fuel-injected, catalysed Taiwanese scooter at idle, so we say nothing about their levels.',
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'alwaysCarry plus[2]. Never "modern scooters smell less" or any level for them (must-not 12).',
    research: R('what-is-in-it'),
  },
  'smell-not-unburnt-petrol': {
    data: {
      acetaldehydeThreshold: v(C.acetaldehyde.threshold_ppb, 'ppb', { note: 'detection threshold used; above it in 61-100 % of draws in every case' }),
      acetaldehydeShareLo: v(pc(C.acetaldehyde.shareLoAny), 'percent'),
      acetaldehydeShareHi: v(pc(C.acetaldehyde.shareHi), 'percent'),
      acetaldehydeAware: v(C.acetaldehyde.aware_ppb, 'ppb', { note: 'distinct-awareness level: never reached in the pack cases' }),
      benzeneOwn: v(C.benzeneOwn.threshold_ppb, 'ppb'),
      xylenesThreshold: v(C.alsoAbove.xylenes.threshold_ppb, 'ppb'),
      formaldehydeThreshold: v(C.alsoAbove.formaldehyde.threshold_ppb, 'ppb'),
      tolueneThreshold: v(C.alsoAbove.toluene.threshold_ppb, 'ppb'),
    },
    display: t('那個味道，比較可能是燒過才有的', 'The smell more likely comes from burning'),
    statement: t(
      '那個味道比較可能來自燃燒後產生的醛類，不是沒燒完的汽油（推估，只能粗略估計，可能差到十倍左右）。',
      'The smell more likely comes from aldehydes formed by burning, not from unburnt petrol (estimate, order of magnitude only).',
    ),
    period: PERIOD,
    place: t('五種電腦算的情況（一般的街、兩邊高樓的街、有騎樓的街、一輛機車後面）', 'Five simulated cases (open street, a street between tall buildings, an arcade street, behind one scooter)'),
    sources: ['scooterair-smell-chemicals-2026', 'nagata-odour-thresholds', 'epa-naphthalene', 'tsai-2003-jawma', 'chirico-2014-acpd'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '這只能看大概是幾位數。乙醛可能是你聞到的一部分，但我們分不出你聞到的是哪一種：在一群機車的情況裡，乙醛從來沒有濃到「一聞就很清楚」。甲苯、二甲苯、甲醛等，有時也高過它們最低的嗅覺門檻；真正的味道是很多東西混在一起的。沒燒完的汽油蒸氣，我們沒有另外算。',
      'Only the order of magnitude can be estimated. Acetaldehyde is probably part of what you smell, but we cannot say you smell acetaldehyde: in the cases with a group of scooters it never gets strong enough to be clearly noticeable. Toluene, xylenes, formaldehyde and others are sometimes above their lowest odour thresholds too; a real smell is a mixture. Unburnt petrol vapour was not worked out separately.',
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'statements-smell not-unburnt-petrol. Never "you smell acetaldehyde" (must-not 6). Benzene and the 560 ppb level: "in the pack cases" only (NF1-fine reaches them in up to 0.5 % and 3.2 % of draws).',
    research: R('not-unburnt-petrol'),
  },
  'smell-no-smell-not-clean': {
    data: {
      canyonDrawsAny: v(C.canyon.a.drawsAny, 'count', { note: 'S1 0.5 m / 0.7 m, 1967 level: draws (of 1,000) with any smellable second, central flow; low-high flow 3-1,000' }),
    },
    display: t('聞不到，不代表空氣乾淨', 'No smell does not mean clean air'),
    statement: t(
      '聞不到，不代表空氣乾淨。沒有味道的時候也可能有苯。一氧化碳沒有味道，微粒小到看不到。',
      'No smell does not mean clean air. Benzene can be there when nothing can be smelled. Carbon monoxide has no smell, and particles are too small to see.',
    ),
    period: PERIOD,
    place: t('兩邊都是高樓、風順著街吹的街（電腦算的）', 'A street between tall buildings with the wind along it (simulated)'),
    sources: ['scooterair-smell-chemicals-2026', 'scooterair-simulation-2026', 'who-2010-indoor-air-guidelines'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      `電腦算的這種街上，用 1967 年研究的「聞得到」標準，1,000 次裡大約 ${C.canyon.a.drawsAny} 次有任何一秒聞得到（看風怎麼算，${C.canyon.a.drawsAnyLowHigh[0]} 到 ${C.canyon.a.drawsAnyLowHigh[1].toLocaleString('en')} 次），可是苯整個紅燈都在。這種街的數字可能算低了；這不是說這種街比較好。`,
      `In this simulated street, by the 1967 study’s ‘can smell it’ level, about ${C.canyon.a.drawsAny} of 1,000 runs have any smellable second (${C.canyon.a.drawsAnyLowHigh[0]} to ${C.canyon.a.drawsAnyLowHigh[1].toLocaleString('en')}, depending on how the wind is worked out), yet benzene is there through the whole red. The numbers for this street are probably low; this does not mean such streets are better.`,
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'statements-smell no-smell-not-clean. Never "if you can\'t smell it, the air is fine" (must-not 11). The canyon case is "not attached"; never present it as lower exposure (simulation must-not 6).',
    research: R('no-smell-not-clean'),
  },
  'iarc-group1-three': {
    data: {},
    display: t('苯、1,3-丁二烯、甲醛：第1類（說的是證據有多強，不是風險）；汽油引擎廢氣：第2B類', 'Benzene, 1,3-butadiene, formaldehyde: Group 1 (the strength of the evidence, not a risk); petrol-engine exhaust: Group 2B'),
    statement: t(
      '世界衛生組織的癌症研究機構（IARC）把苯、1,3-丁二烯、甲醛列為「確定會讓人致癌」的第1類。這是說「證據有多強」，不是說等一個紅燈會有多少風險。汽油引擎廢氣整體被列為第2B類（「可能致癌」）。',
      'The World Health Organization’s cancer agency (IARC) puts benzene, 1,3-butadiene and formaldehyde in Group 1, ‘causes cancer in humans’. That describes how strong the evidence is, not the risk from waiting at one red light. Petrol-engine exhaust as a whole is Group 2B, ‘possibly causes cancer’.',
    ),
    period: t('IARC 分類到 2026 年 11 月', 'IARC classifications as of November 2026'),
    place: NOT_PLACE,
    sources: ['iarc-qa', 'iarc-list-2019', 'iarc-agents-page', 'iarc-v128-news', 'iarc-v138-news', 'iarc-pr213-2012', 'iarc-vol120-benzene'],
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '分類說的是一種東西「會不會致癌」的證據有多強，不是排名，也不是風險；本站沒有算任何致癌風險。其他成分的分類寫在「怎麼算的」那一頁的詳細表裡，照在廢氣裡占的多少排。',
      'A group says how strong the evidence is that a substance can cause cancer; it is not a ranking and not a risk, and the site works out no cancer risk. The groups of the other chemicals are in the detail table on the ‘How we worked it out’ page, in order of their share of the exhaust.',
    ),
    requiresCaveat: true,
    chainLink: 4,
    editorNote: 'statements-smell hazard-labels, verbatim. A separate sentence from any smell sentence and never in a sentence with a number. iarc-v138-news is cited only to record that the fuel\'s own Group 1 (2025) is NOT used: petrol vapour was not modelled (must-not 5).',
    research: R('hazard-labels'),
  },
  'smell-benzene-just-smellable': {
    data: {
      central6800: v(C.just.c6800, 'ppb', { note: '1970 study (D/T 6,800), central' }),
      central800: v(C.just.c800, 'ppb', { note: '1967 study (D/T 800), central' }),
      low: v(C.just.lo, 'ppb'),
      high: v(C.just.hi, 'ppb'),
      rangeLoWords: v(C.just.wordsRangeLo, 'ppb'),
      rangeHiWords: v(C.just.wordsRangeHi, 'ppb'),
      draws: v(C.just.n, 'count'),
    },
    display: t(`剛好聞得到時，苯約 ${C.just.wordsLo} 到 ${C.just.wordsHi} ppb（最低約 ${C.just.wordsRangeLo}，最高約 ${C.just.wordsRangeHi}）`, `When it is just noticeable, benzene is about ${C.just.wordsLo} to ${C.just.wordsHi} ppb (lowest about ${C.just.wordsRangeLo}, highest about ${C.just.wordsRangeHi})`),
    statement: t(
      '剛好聞得到廢氣味的時候，空氣裡的苯大約十億分之幾到十幾（推估，兩個嗅覺研究的常見值；數字和範圍見「怎麼算的」那一頁）。',
      'At the moment the exhaust is just noticeable, benzene is a few to about fifteen parts per billion (estimate; the typical values of two smell tests; the numbers and ranges are on the ‘How we worked it out’ page).',
    ),
    period: PERIOD,
    place: t('一輛機車，和風怎麼吹無關', 'One scooter; it does not depend on the wind'),
    sources: ['scooterair-smell-chemicals-2026', 'epa-ap122-1973', ...SPECIATION.slice(0, 4)],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '推估。這是常見的量，不是最少的量。兩個數字來自 1967 和 1970 年兩個汽車廢氣的嗅覺研究，兩者差 8.5 倍。算了 10,000 輛單獨一輛的機車。幾秒鐘的量，沒有官方的數值可以比，所以沒辦法說它高或低。',
      'Estimate. A typical value, not a minimum. The two numbers come from two smell tests of car exhaust from 1967 and 1970, 8.5 times apart. Worked out for 10,000 single scooters. No official value exists for a few seconds, so it cannot be called high or low.',
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'statements-smell how-much-just-smellable. Both numbers always together. A seconds-long value: never beside a 30-min, 1-h, yearly or lifetime value (must-not 3).',
    research: R('how-much-just-smellable'),
  },
  'smell-benzene-seconds': {
    data: {
      central800: v(C.seconds.c800, 'ppb', { note: 'S1-from K d=0.5 h=0.7, 1967 level, mean over smellable seconds' }),
      central6800: v(C.seconds.c6800, 'ppb'),
      about: v(C.seconds.wordsAbout, 'ppb', { approx: true }),
      low: v(C.seconds.lo, 'ppb'),
      high: v(C.seconds.hi, 'ppb'),
      share800: v(pc(C.share800.c), 'percent', { low: pc(C.share800.lo), high: pc(C.share800.hi) }),
      share6800: v(pc(C.share6800.c), 'percent', { low: pc(C.share6800.lo), high: pc(C.share6800.hi) }),
      drawsAnyLowFlow800: v(C.share800.drawsAnyLowHigh[0], 'count'),
      draws: v(C.seconds.n, 'count'),
    },
    display: t(`風從機車吹來、聞得到的那幾秒：苯大約 ${C.seconds.wordsAbout} ppb（約 ${C.seconds.wordsRangeLo} 到 ${C.seconds.wordsRangeHi}）`, `Wind from the scooters, the seconds you can smell it: benzene about ${C.seconds.wordsAbout} ppb (about ${C.seconds.wordsRangeLo} to ${C.seconds.wordsRangeHi})`),
    statement: t(
      '風從機車群吹過來的時候，在離最近一台機車半公尺、小孩鼻子的高度（約 0.7 公尺），聞得到的那幾秒裡，苯平均大約十億分之三十（範圍見「怎麼算的」那一頁）。',
      'With the wind blowing from the scooters, half a metre from the nearest one at a child’s nose height (about 0.7 m), benzene averages about thirty parts per billion over the seconds you can smell it (its range is on the ‘How we worked it out’ page).',
    ),
    period: PERIOD,
    place: KERB,
    sources: ['scooterair-smell-chemicals-2026', 'scooterair-simulation-2026', 'epa-ap122-1973', ...SPECIATION.slice(0, 4)],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      `推估。風要整個紅燈都從一群機車吹來，尖峰時段最多大約八個紅燈有一個。這時聞得到的時間，依中間推估約占紅燈的 ${pc(C.share800.c)}%（1967 年的標準）到 ${pc(C.share6800.c)}%（1970 年的標準）；把機車排多少、廢氣怎麼散開的不確定也算進去，範圍是 ${pc(C.share800.lo)} 到 ${pc(C.share800.hi)}%、${pc(C.share6800.lo)} 到 ${pc(C.share6800.hi)}%。中間推估下，電腦算的 1,000 次都有聞得到的秒數；推估取低的一頭時，用 1967 年的標準只有 ${C.share800.drawsAnyLowHigh[0]} 次。幾秒鐘的量，沒有官方的數值可以比。`,
      `Estimate. The wind must blow from a group of scooters for the whole red, which happens in at most about 1 in 8 peak-hour reds. Then the smell is there for about ${pc(C.share800.c)} % of the red by the 1967 study’s level and ${pc(C.share6800.c)} % by the 1970 study’s (central estimates); counting the uncertainty in how much the scooters give off and how the exhaust spreads, the ranges are ${pc(C.share800.lo)}–${pc(C.share800.hi)} % and ${pc(C.share6800.lo)}–${pc(C.share6800.hi)} %. At the central estimate all 1,000 simulated runs have smellable seconds; at the low end, by the 1967 level, ${C.share800.drawsAnyLowHigh[0]} do. No official value exists for a few seconds.`,
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'statements-smell level-in-smellable-seconds with how-often-wind. Always with the share of seconds, the draws and the condition (must-not 7). Never beside a 1-hour, yearly or lifetime value (must-not 3).',
    research: R('level-in-smellable-seconds'),
  },
  'smell-one-red': {
    data: {
      benzeneOneRedCentral: v(bz.oneRed.central, 'ug/m3', { note: 'S1-from 0.5 m / 0.7 m, one red as a 1-hour average; reference 27' }),
    },
    display: t('只等一個紅燈：依中間推估，都不到 30 分鐘或 1 小時的參考值', 'One red light on its own: at the central estimate, none reaches a 30-minute or 1-hour reference level'),
    statement: t(
      '只等一個紅燈，依我們的中間推估，這些化學物質都不會因此達到 30 分鐘或 1 小時的公共參考值。',
      'Waiting through one red light does not, on its own, bring any of these chemicals to a 30-minute or 1-hour public reference level, in our central estimate.',
    ),
    period: PERIOD,
    place: t('五種電腦算的情況', 'Five simulated cases'),
    sources: ['scooterair-smell-chemicals-2026', 'arb-oehha-acute-rel-2025', 'carb-oehha-2025', 'who-2000', 'who-2010-indoor-air-guidelines', 'tw-iaq'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '很少見的情形：幾乎沒有風、站在一根排氣管下風半公尺，最壞的情況可能到。信心低。沒到參考值，不代表「安全」。',
      'In a rare near-calm case, standing half a metre downwind of one tailpipe, the worst case can reach them. Confidence is low. Below a reference level does not mean ‘safe’.',
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'statements-smell one-red with its mustCarry. Never rewritten as "safe". Never in the same block as hazard-labels.',
    research: R('one-red'),
  },
  'smell-stay-hour-table': {
    data: Object.fromEntries(
      C.stay.flatMap((s) =>
        s.rows.flatMap((r) => [
          [`${s.chem}_${r.avg}`, v(r.central, 'ug/m3', { low: r.low, high: r.high, note: `stay through every red, ${r.avg}, S1-from 0.5 m / 0.7 m` })],
          ...r.refs.map((ref, i) => [`${s.chem}_${r.avg}_ref${i}`, v(ref.ugm3, 'ug/m3', { note: `${ref.body}: ${ref.stay}` })] as const),
        ]),
      ).concat([
        ['benzenePpb', v(C.benzeneStayPpb.central, 'ppb', { low: C.benzeneStayPpb.low, high: C.benzeneStayPpb.high, derived: true, note: 'benzene 1-hour stay value in ppb at 25 °C' })],
      ]),
    ),
    display: t('待一小時：每一種成分和它自己同樣時間長度的參考值比', 'Staying an hour: each chemical against its own reference of the same averaging time'),
    statement: t(
      '如果有人整個小時每個紅燈都待在路邊（例如攤販、警察、導護），而且風一直從機車那邊吹過來，機車加進來的苯推估會超過美國加州的 1 小時參考值。其他每一種成分的推估平均，都和它自己的 1 小時或 30 分鐘參考值放在詳細表裡比。',
      'For someone who stays at the kerb through every red for an hour (a vendor, a police officer, a crossing guard), with the wind from the scooters the whole time, the benzene the scooters add is estimated to be above California’s 1-hour reference level. Every other chemical’s estimated average is set against its own 1-hour or 30-minute reference in the detail table.',
    ),
    period: PERIOD,
    place: KERB,
    sources: ['scooterair-smell-chemicals-2026', 'scooterair-simulation-2026', 'arb-oehha-acute-rel-2025', 'carb-oehha-2025', 'who-2000', 'who-2010-indoor-air-guidelines', 'tw-iaq'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t(
      '範圍從低於參考值到好幾倍。風要整整一小時都這樣吹，很少見。每個紅燈都用同一個電腦算的紅燈。苯的參考值是用比較長時間（6 小時）的資料訂的。超過參考值，不等於證明有害。丙烯醛和萘只有汽車的資料，信心很低，範圍是假設的。台灣的甲醛標準是室內空氣品質標準；世界衛生組織對甲苯和苯乙烯的 30 分鐘值，是氣味的指引，不是健康上限。',
      'The range runs from below the reference to several times above it. The wind must hold for the whole hour, which is rare. Every red is the same simulated red. Benzene’s reference was derived from a longer (6-hour) exposure. Being above a reference level is not proof of harm. Acrolein and naphthalene have car data only: very low confidence, range assumed. Taiwan’s formaldehyde value is an indoor-air standard; the WHO 30-minute values for toluene and styrene are odour-annoyance guidelines, not health limits.',
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: `statements-smell detail-table and stay-through-benzene. Detail table only; benzene ${bz.central} (${bz.low}-${bz.high}) against ${bz.refs[0].ugm3} ug/m3. Never a cancer word here. NF1-fine rows stay in the results file (owner choice).`,
    research: R('detail-table'),
  },
  'smell-yardsticks-not-used': {
    data: {},
    display: t('只拿同樣時間長度的參考值來比', 'Only references of the same averaging time are used'),
    statement: t(
      '工作場所的上限、意外外洩時用的數值、一輩子的致癌數值，和只管室外微粒、臭氧等的空氣品質標準，都不拿來和路邊幾秒鐘或一小時的量比；只拿 30 分鐘或 1 小時的參考值，和同樣時間長度的平均比。',
      'Workplace limits, values made for accidental releases, lifetime cancer values, and ambient standards that cover only particles, ozone and the like are not set against seconds-long or one-hour kerbside levels; only 30-minute or 1-hour references are compared, with averages of the same length.',
    ),
    period: t('查閱至 2026 年 11 月', 'Consulted up to November 2026'),
    place: NOT_PLACE,
    sources: ['niosh-benzene', 'niosh-formaldehyde', 'niosh-acrolein', 'niosh-butadiene', 'niosh-acetaldehyde', 'tw-pel', 'epa-aegl-2018', 'epa-aegl-about', 'atsdr-mrl', 'epa-iris-benzene', 'epa-iris-butadiene', 'epa-iris-formaldehyde', 'tw-aqs', 'who-2021-aqg'],
    confidence: 'verified',
    evidence: 'international',
    readerKind: 'official',
    caveat: t(
      '這些數值是為別的目的訂的（工作八小時、意外外洩、一輩子），拿來比路邊的量會誤導。',
      'These values were set for other purposes (an eight-hour working day, accidental releases, a lifetime); setting them against kerbside levels would mislead.',
    ),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'METHOD-SMELL comparisons convention. No number from these sources is printed.',
    research: R('detail-table'),
  },
  'smell-not-estimated': {
    data: {},
    display: t('沒有算的', 'Not estimated'),
    statement: t(
      '沒有算的：苯并[a]芘和其他黏在煙灰上的東西（沒有可用的資料，也沒有味道）、酚（來源差 100 倍）、硫化氫、戴奧辛、新型有觸媒機車的成分比例、街上原本空氣裡的量。',
      'Not estimated: benzo[a]pyrene and other soot-bound chemicals (no usable data, and no smell), phenol (sources disagree 100 times), hydrogen sulphide, dioxins, the mix from modern catalysed scooters, and what the street air already holds.',
    ),
    period: PERIOD,
    place: NOT_PLACE,
    sources: ['scooterair-smell-chemicals-2026', 'yang-2005-aaqr', 'chien-huang-2010-jesh', 'epa-iris-bap', 'eea-2023-roadtransport', 'stockwell-2016-acp'],
    confidence: 'verified',
    evidence: 'estimate',
    caveat: t('味道也可能來自別的車或別的地方。有二行程機車的車群，苯可能算少了。', 'The smell may come from other traffic or other sources. In a fleet with two-stroke scooters, benzene may be underestimated.'),
    requiresCaveat: true,
    chainLink: null,
    editorNote: 'results-smell notEstimated and ANSWER-SMELL "What is NOT known".',
    research: R('what-is-in-it'),
  },
} satisfies Record<string, FactInput>;

/** The smell facts by /evidence/ list: never a seconds fact in the same list as a 30-minute / 1-hour fact. */
export const smellEvidenceGroups = {
  what: ['smell-comes-with-benzene', 'smell-no-smell-not-clean', 'smell-what-is-in-it', 'smell-older-engines', 'smell-not-unburnt-petrol', 'smell-not-estimated'],
  seconds: ['smell-benzene-just-smellable', 'smell-benzene-seconds'],
  averages: ['smell-one-red', 'smell-stay-hour-table', 'smell-yardsticks-not-used'],
} as const;
