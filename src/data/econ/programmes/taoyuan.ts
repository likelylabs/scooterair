// Taoyuan City 2026 (DEP notice 2026-01-06). research/econ/taoyuan.json
// Base amounts are published only as maximums ("最高") and are not split by vehicle class, so
// they are marked isMaximum: the engine shows them as ceilings and widens the net price range.

import type { Condition, Programme } from '../types.ts';
import { age, builtBy, fixed, flag, quota, residency, scrap, t, twoStroke } from './helpers.ts';

const PAYER = t('桃園市政府環境保護局', 'Taoyuan City Department of Environmental Protection');
const SRC = ['taoyuan-epb-2026-programme'] as const;
const STATUS_2027 = t('市府以問卷研擬116年方案，尚未公布。', 'The city is drafting a 2027 programme from a survey; nothing announced.');
const APPLY = t('補助期間至115年12月31日，最晚116年1月10日前申請。', 'Purchases to 31 December 2026; apply by 10 January 2027 at the latest.');
// ty-eligibility: ROC nationals registered by 2024-12-31, or residence-permit holders living in
// Taoyuan who meet the spouse-registration condition. We cannot test the second route, so for a
// foreign national the lines are excluded as ambiguous (and the amount reported), not as "no".
const roc: Condition = {
  kind: 'household',
  flag: 'foreignNational',
  value: false,
  ambiguous: true,
  why: t('外籍人士須持居留證、住在桃園市並符合配偶設籍條件才能申請，試算無法判斷，未計入；請向環保局確認', 'foreign nationals qualify only with a residence permit, living in Taoyuan and meeting the spouse-registration condition, which we cannot check, so it is not counted (ask the bureau)'),
};
const general: Condition[] = [residency(undefined, '2024-12-31'), age(18), roc];
const GENERAL = '年滿18歲、113年12月31日前設籍桃園市（或持居留證並符合配偶設籍條件）。';
const GENERAL_EN = 'Aged 18+ and registered in Taoyuan by 31 December 2024 (or a residence-permit holder meeting the spouse rule).';
const STACK_NOTE = t('桃園市公告沒有說明能否與中央補助併領；試算照其他縣市的做法同時計入中央補助，請向環保局確認。', 'The Taoyuan notice does not say whether its money stacks with central subsidies; like other cities we count both, so confirm with the bureau.');
const generalQuota = quota('unknown', '2026-11-24', t('一般性補助共6,000名；線上系統無法開啟，剩餘名額不明。', '6,000 general places; the online system could not be opened, so remaining places are unknown.'), { total: 6000 });
const projectQuota = (n: number, per = '') =>
  quota('unknown', '2026-11-24', t(`名額${n.toLocaleString('en')}名${per}；剩餘名額不明。`, `${n.toLocaleString('en')} places${per ? ' per team' : ''}; remaining places unknown.`), { total: n });

const p = (x: Partial<Programme> & Pick<Programme, 'id' | 'name' | 'amount' | 'conditions' | 'conditionText' | 'quota' | 'research'>): Programme => ({
  jurisdiction: 'taoyuan',
  payer: 'local',
  payerName: PAYER,
  kind: 'top-up',
  side: 'electric',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  applicationDeadline: '2027-01-10',
  applicationNote: APPLY,
  status2027: STATUS_2027,
  sources: [...SRC],
  confidence: 'verified',
  note: STACK_NOTE,
  calculator: true,
  ...x,
});

const topup = (id: string, name: [string, string], value: number, conds: Condition[], text: [string, string], q: Programme['quota'], research: string, groups?: string[]) =>
  p({
    id,
    name: t(name[0], name[1]),
    amount: fixed(value),
    conditions: [...general, ...conds],
    conditionText: t(`${GENERAL}${text[0]}`, `${GENERAL_EN} ${text[1]}`),
    quota: q,
    research: [`taoyuan#${research}`, 'taoyuan#ty-max-total'],
    ...(groups ? { exclusiveGroups: groups } : {}),
  });

export const taoyuanProgrammes: Programme[] = [
  p({
    id: 'ty-new',
    name: t('桃園市新購電動機車', 'Taoyuan new electric scooter'),
    kind: 'purchase-subsidy',
    amount: fixed(4000, true),
    conditions: [...general],
    conditionText: t(`${GENERAL}公告只寫「最高4,000元」，未依車種分級。`, `${GENERAL_EN} The notice says only "up to NT$4,000" and does not split by class.`),
    exclusiveGroups: ['ty-base'],
    quota: generalQuota,
    research: ['taoyuan#ty-new', 'taoyuan#ty-quota', 'taoyuan#ty-eligibility'],
  }),
  p({
    id: 'ty-scrap-phase1to5',
    name: t('桃園市汰換1至5期機車換購電動', 'Taoyuan scrap a phase 1–5 scooter and buy electric'),
    kind: 'purchase-subsidy',
    amount: fixed(12000, true),
    conditions: [...general, scrap, builtBy('2016-12-31')],
    conditionText: t(`${GENERAL}汰換民國105年12月31日以前出廠的1至5期機車；公告只寫「最高12,000元」。`, `${GENERAL_EN} Scrap a phase 1–5 scooter built by 31 December 2016; the notice says only "up to NT$12,000".`),
    exclusiveGroups: ['ty-base'],
    quota: generalQuota,
    research: ['taoyuan#ty-scrap-1to5', 'taoyuan#ty-quota'],
  }),
  p({
    id: 'ty-scrap-two-stroke',
    name: t('桃園市汰換二行程機車換購電動', 'Taoyuan scrap a two-stroke and buy electric'),
    kind: 'purchase-subsidy',
    amount: fixed(15000, true),
    conditions: [...general, scrap, twoStroke],
    conditionText: t(`${GENERAL}汰換二行程機車；公告只寫「最高15,000元」。`, `${GENERAL_EN} Scrap a two-stroke scooter; the notice says only "up to NT$15,000".`),
    exclusiveGroups: ['ty-base'],
    quota: generalQuota,
    research: ['taoyuan#ty-scrap2stroke', 'taoyuan#ty-quota'],
  }),
  topup(
    'ty-lowincome-or-fuxing',
    ['桃園市中低收入戶或復興區居民加碼', 'Taoyuan middle-low income or Fuxing District top-up'],
    10000,
    [{ kind: 'any-of', conditions: [{ kind: 'income', levels: ['middle-low'], ambiguous: ['low'] }, flag('remoteDistrict')] }],
    ['中低收入戶或復興區居民。公告只寫「中低收入戶」，低收入戶是否適用請向環保局確認。', 'Middle-low income households or Fuxing District residents. The notice says only "middle-low income"; ask the bureau whether low-income households qualify.'],
    quota('unknown', '2026-11-24', t('未公布名額。', 'No quota published.')),
    'ty-topup-lowincome-fuxing',
  ),
  topup('ty-child', ['桃園市婦幼E騎GO（育有0至12歲幼童）', 'Taoyuan family scheme (child aged 0–12)'], 6000, [flag('childUnder12')], ['育有0至12歲幼童的家庭。', 'A household raising a child aged 0–12.'], projectQuota(2500), 'ty-topup-women-children'),
  topup('ty-age-36-45', ['桃園市青壯騎行（36至45歲）', 'Taoyuan age 36–45 scheme'], 4000, [age(36, 45)], ['申請人36至45歲。', 'Applicant aged 36–45.'], projectQuota(2500), 'ty-topup-age36-45', ['ty-age']),
  topup('ty-age-18-35', ['桃園市青春馭電（18至35歲）', 'Taoyuan age 18–35 scheme'], 1000, [age(18, 35)], ['申請人18至35歲。', 'Applicant aged 18–35.'], projectQuota(1000), 'ty-add-youth', ['ty-age']),
  topup('ty-indigenous', ['桃園市原住民樂購', 'Taoyuan indigenous scheme'], 1000, [flag('indigenous')], ['具原住民身分。', 'Indigenous status.'], projectQuota(1000), 'ty-add-indigenous'),
  topup('ty-delivery', ['桃園市外送騎士', 'Taoyuan delivery-rider scheme'], 3000, [flag('deliveryRider')], ['外送服務人員，檢附證明文件。', 'Delivery workers, with proof.'], projectQuota(1000), 'ty-topup-delivery'),
  topup('ty-watch', ['桃園市守望相助隊', 'Taoyuan neighbourhood-watch scheme'], 5000, [flag('neighbourhoodWatch')], ['參與巡守工作的守望相助隊隊員；每隊5個名額。', 'Neighbourhood-watch team members; 5 places per team.'], projectQuota(5, '（每隊）'), 'ty-topup-neighborhood-watch'),
];
