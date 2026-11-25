// Every programme the engine knows about, central first. Order matters only as a tie-break
// (earlier wins when two choices are worth the same).

import type { Programme } from '../types.ts';
import { centralProgrammes } from './central.ts';
import { taipeiProgrammes } from './taipei.ts';
import { newTaipeiProgrammes } from './new-taipei.ts';
import { taoyuanProgrammes } from './taoyuan.ts';
import { tainanProgrammes } from './tainan.ts';
import { kaohsiungProgrammes } from './kaohsiung.ts';
import { countyProgrammes } from './counties.ts';
import { taichungProgrammes } from './taichung.ts';
import { countyR2Programmes } from './counties-r2.ts';

export const programmes: Programme[] = [
  ...centralProgrammes,
  ...taipeiProgrammes,
  ...newTaipeiProgrammes,
  ...taoyuanProgrammes,
  ...taichungProgrammes,
  ...tainanProgrammes,
  ...kaohsiungProgrammes,
  ...countyProgrammes,
  ...countyR2Programmes,
];
