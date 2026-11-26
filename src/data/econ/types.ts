// Vocabulary for the economics dataset: subsidy programmes as rules, vehicles, energy
// plans and prices, running-cost inputs and the jurisdiction list.
//
// Everything here is data: the calculation engine in src/lib/calc reads it and never
// hard-codes a programme, model or plan. Adding or correcting one is a data edit:
//   - a programme: add a `Programme` to the right file in ./programmes/ (and its group in
//     ./groups.ts if it is either/or with others);
//   - a model or plan: add it to ./vehicles.ts or ./energy.ts;
//   - a city that becomes verified: change its status in ./jurisdictions.ts and add programmes.
// Then run `npm run check` (data validation + engine tests).
//
// Rules (enforced by scripts/check-data.mjs):
//   - every number that feeds a calculation carries `sources` and a `confidence`;
//   - only research findings marked CONFIRMED, CORRECTED or ADDED are used; UNREACHABLE and
//     REFUTED findings never feed a calculation (an unverified city is listed with its
//     official link and no amounts);
//   - 'secondary' inputs are used only where there is no verified alternative, and the
//     engine flags them in its output;
//   - "up to" amounts carry `isMaximum: true` and are never presented as expected values.

import type { Confidence, L10n } from '../types.ts';
import type { SourceId } from '../sources.ts';

export type { Confidence, L10n, SourceId };

/** 'YYYY-MM-DD'. */
export type ISODate = string;

/** Where a value came from. `research` points at finding ids, e.g. 'taipei#tpe-new-heavy'. */
export interface Provenance {
  sources: SourceId[];
  confidence: Confidence;
  research: string[];
  /** Shown to readers when the value is used. */
  note?: L10n;
}

/** One sourced number. */
export interface Num extends Provenance {
  value: number;
  /** The source says "up to": a ceiling, not an expected value. */
  isMaximum?: boolean;
  /** Our arithmetic on cited figures (the note says which). */
  derived?: boolean;
}

/** A sourced range. `typicalBasis` says how the middle value was chosen. */
export interface Band extends Provenance {
  low: number;
  typical: number;
  high: number;
  typicalBasis: L10n;
}

// ---------------------------------------------------------------------------
// Jurisdictions
// ---------------------------------------------------------------------------

export const jurisdictionIds = [
  'taipei',
  'new-taipei',
  'taoyuan',
  'taichung',
  'tainan',
  'kaohsiung',
  'keelung',
  'hsinchu-city',
  'hsinchu-county',
  'miaoli',
  'changhua',
  'nantou',
  'yunlin',
  'chiayi-city',
  'chiayi-county',
  'pingtung',
  'yilan',
  'hualien',
  'taitung',
  'penghu',
  'kinmen',
  'lienchiang',
] as const;
export type JurisdictionId = (typeof jurisdictionIds)[number];

/**
 * - verified:        the city's own 2026 programme text (or the MOEA portal table that reproduces
 *                    it) was read; amounts are in the calculator.
 * - partly-verified: base amounts verified, but some lines (low-income, remote areas, student
 *                    households...) rest on press releases only and are left out.
 * - not-verified:    nothing could be checked; no local amounts are used. Central money still applies.
 */
export const verificationStatuses = ['verified', 'partly-verified', 'not-verified'] as const;
export type VerificationStatus = (typeof verificationStatuses)[number];

export interface Jurisdiction {
  id: JurisdictionId;
  name: L10n;
  kind: 'special-municipality' | 'provincial-city' | 'county';
  status: VerificationStatus;
  /** One or two sentences: what was and was not checked. */
  statusNote: L10n;
  /** What a reader should open to check. Every entry is an official page where one is known. */
  officialLinks: { label: L10n; url: string }[];
  /** What the jurisdiction calls a remote district for its programmes, if any. */
  remoteDistricts?: L10n;
  checkedOn: ISODate;
  research: string[];
}

// ---------------------------------------------------------------------------
// Vehicle classes
// ---------------------------------------------------------------------------

/** Licence-plate class. heavy = 普通重型 (white plate), light = 普通輕型 (green plate), small = 小型輕型. */
export const plateClasses = ['heavy', 'light', 'small'] as const;
export type PlateClass = (typeof plateClasses)[number];

/**
 * MOEA subsidy class, which decides 7,000 vs 5,100:
 * heavy-1-2 and light-1 get 7,000; light-2 and small get 5,100.
 * 'light-unknown' = a green-plate model whose level (1 or 2) we could not verify: the engine
 * counts the lower amount and reports the difference as an ambiguity.
 */
export const moeaClasses = ['heavy-1-2', 'light-1', 'light-2', 'small', 'light-unknown'] as const;
export type MoeaClass = (typeof moeaClasses)[number];

export type Engine = 'two-stroke' | 'four-stroke';

// ---------------------------------------------------------------------------
// Situation flags that programmes test (mirrors the engine's Situation input)
// ---------------------------------------------------------------------------

export const householdFlags = [
  'childUnder12', // a child aged 12 or under in the household (Taipei: born on/after 2014-01-01)
  'schoolChild', // a child enrolled in elementary, junior or senior high school (Kaohsiung)
  'deliveryRider', // works as a delivery rider (Tainan also needs 100+ completed orders)
  'indigenous', // indigenous status
  'medicalWorker', // works at a registered medical or nursing institution (Kaohsiung)
  'neighbourhoodWatch', // member of a neighbourhood watch team (Taoyuan)
  'disasterAffected', // household eligible for natural-disaster aid (Tainan)
  'remoteDistrict', // lives in a district the jurisdiction defines as remote
  'previousLocalSubsidy', // has received this jurisdiction's scooter subsidy before (some places also count past MOENV subsidies: see each programme's condition text)
  'foreignNational', // not an ROC national
] as const;
export type HouseholdFlag = (typeof householdFlags)[number];

export const incomeLevels = ['none', 'middle-low', 'low'] as const;
/** 'none' = neither low nor middle-low income certificate. */
export type IncomeLevel = (typeof incomeLevels)[number];

// ---------------------------------------------------------------------------
// Programme conditions (all listed conditions must hold)
// ---------------------------------------------------------------------------

export type Condition =
  /** The buyer scraps an old gasoline scooter. */
  | { kind: 'scrap' }
  | { kind: 'scrap-engine'; engines: Engine[] }
  /** Old scooter at least this many full years old (from its build date) on the evaluation date. */
  | { kind: 'scrap-min-age'; years: number }
  | { kind: 'scrap-built'; onOrBefore?: ISODate; onOrAfter?: ISODate }
  /** Old scooter registered in the programme's jurisdiction by a date or for a number of years. */
  | { kind: 'scrap-registered-locally'; byDate?: ISODate; minYears?: number }
  | { kind: 'scrap-max-cc'; cc: number }
  /** A second old scooter is scrapped in the same application (New Taipei double-scrap). */
  | { kind: 'scrap-second-scooter' }
  | { kind: 'ev-plate-class'; classes: PlateClass[] }
  | { kind: 'moea-class'; classes: MoeaClass[] }
  /** Model certified with Taiwan-made battery cells. */
  | { kind: 'domestic-cells' }
  /** Model uses swappable rental batteries. */
  | { kind: 'battery-swap' }
  | { kind: 'gas-max-cc'; cc: number }
  /**
   * A household flag. `ambiguous`: failing it is not a clear "no" (the rule has exceptions we cannot
   * test), so the line is excluded as ambiguous and the amount reported. `why` replaces the generic
   * failure text; `assumption` replaces the generic assumption when the flag is not given.
   */
  | { kind: 'household'; flag: HouseholdFlag; value?: boolean; ambiguous?: boolean; why?: L10n; assumption?: L10n }
  /** `ambiguous` levels are neither clearly in nor out: the engine excludes them and says why. */
  | { kind: 'income'; levels: IncomeLevel[]; ambiguous?: IncomeLevel[] }
  | { kind: 'age'; min?: number; max?: number }
  /** Household registration in the programme's jurisdiction. */
  | { kind: 'residency'; minYears?: number; registeredBy?: ISODate; why?: L10n; assumption?: L10n }
  /**
   * Some applicants must apply earlier than the purchase window ends (MOEA: foreign nationals by
   * 10 December 2026). On a later date such an applicant can no longer claim the line.
   */
  | { kind: 'applicant-deadline'; applicants: 'foreign-national'; date: ISODate; why: L10n }
  /** Lives in one of these jurisdictions (central regional options). */
  | { kind: 'region'; jurisdictions: JurisdictionId[] }
  | { kind: 'any-of'; conditions: Condition[] };

// ---------------------------------------------------------------------------
// Programmes
// ---------------------------------------------------------------------------

export type Side = 'electric' | 'gasoline' | 'both';

export const programmeKinds = [
  'purchase-subsidy', // base subsidy for buying (new or scrap-and-replace)
  'top-up', // add-on for a group (child, low income, age, delivery...)
  'scrap-bonus', // extra for scrapping an old scooter when buying
  'battery-credit', // one-off battery-plan money
  'tax-reduction', // goods-tax reductions (gasoline)
  'recycling-bonus', // MOENV payment for a recycled scooter
  'scrap-only-bonus', // money for scrapping without buying electric
] as const;
export type ProgrammeKind = (typeof programmeKinds)[number];

export type Payer = 'moea' | 'moenv' | 'mof' | 'local' | 'sponsor';

export type Amount =
  | { kind: 'fixed'; value: number; isMaximum?: boolean }
  /** Goods-tax scrap reduction: the model's approved amount, never above `max`. */
  | { kind: 'model-goods-tax-scrap'; max: number }
  /** Paid per battery the model uses (Kaohsiung rental top-up). */
  | { kind: 'per-battery'; single: number; double: number };

export const quotaStatuses = ['unlimited', 'available', 'limited', 'unknown', 'nearly-exhausted', 'exhausted'] as const;
export type QuotaStatus = (typeof quotaStatuses)[number];

export interface Quota {
  status: QuotaStatus;
  /** Date the status was observed (or the date money ran out, for 'exhausted'). */
  asOf: ISODate;
  total?: number;
  remaining?: number;
  text: L10n;
  sources?: SourceId[];
}

/** Payout cap: the programme's money cannot exceed the purchase price. */
export type Cap =
  /** This jurisdiction's lines together cannot exceed the price paid. */
  | 'local-total-at-most-price'
  /** All government money together cannot exceed the price paid; this jurisdiction's lines are reduced first. */
  | 'all-government-at-most-price';

export interface Programme extends Provenance {
  id: string;
  jurisdiction: JurisdictionId | 'central';
  payer: Payer;
  payerName: L10n;
  /** Short ledger label. */
  name: L10n;
  kind: ProgrammeKind;
  side: Side;
  amount: Amount;
  conditions: Condition[];
  /** Plain-language eligibility, shown on the ledger line. */
  conditionText: L10n;
  /** Either/or groups (see ./groups.ts). At most one programme per group is counted. */
  exclusiveGroups?: string[];
  /**
   * If one of these programmes is eligible, it must be taken for this one to count
   * (Tainan: register for the Tainan carbon reward first). Waived if none is available.
   */
  requires?: { anyOf: string[]; waivedIfUnavailable: boolean; text: L10n };
  cap?: Cap;
  /** Purchase window. What exactly must be done by `validTo` is in `validToRule`. */
  validFrom: ISODate;
  validTo: ISODate;
  /**
   * What must be completed by `validTo` (buy only; buy, plate and scrap; register on the platform
   * before buying...). Shown with the deadline. Without it the engine says "purchase deadline".
   */
  validToRule?: L10n;
  /**
   * Published as running past this date, but the umbrella rule is confirmed only to here.
   * After it, the engine excludes the line as unconfirmed and says so.
   */
  confirmedThrough?: ISODate;
  /** The last day an application is accepted (for a two-stage process, the first stage). */
  applicationDeadline?: ISODate;
  /** A later second-stage deadline (documents), when the first stage closes earlier. */
  documentsDeadline?: ISODate;
  applicationNote?: L10n;
  quota: Quota;
  status2027: L10n;
  /**
   * `true` = counted when eligible. Otherwise the line is never counted; if its other
   * conditions match the buyer it is listed as excluded with this reason (an amount that
   * is not published, a definition we could not find, a figure resting on one press report).
   */
  calculator: true | { excluded: L10n; reason: 'unverified' | 'not-published' | 'secondary-only' };
}

/** An either/or group. `conservative` groups encode our cautious reading of an ambiguous rule. */
export interface ExclusiveGroup {
  id: string;
  label: L10n;
  /** True when the group is our conservative reading, not the published rule. */
  conservative?: boolean;
  /** Only applies to buyers in these jurisdictions (default: everywhere). */
  jurisdictions?: JurisdictionId[];
  /**
   * Advisory: not an either/or rule. Members are all counted, but when more than one is counted
   * the engine reports the smaller one as at risk with `ambiguity` (a reading we were told to
   * take, flagged "confirm before relying on it").
   */
  advisory?: boolean;
  /**
   * Two-sided group: programmes listed here form one side and every other member the other. A
   * member conflicts only with members of the other side, so members on the same side stack (Kinmen
   * money versus all MOENV payments together). Without it, at most one member counts.
   */
  sideA?: string[];
  /**
   * Advisory groups: the members whose amount is at risk when counted with another member (default:
   * every member but the largest).
   */
  atRiskIds?: string[];
  /** Advisory groups: the stacking rests on secondary sources, so the engine lists it as a secondary input. */
  secondaryStacking?: boolean;
  /** Shown with the result when a conservative group changed the outcome. */
  ambiguity?: L10n;
  sources?: SourceId[];
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

export interface DealerPromo extends Provenance {
  id: string;
  name: L10n;
  amount: number;
  /** 'always' = any buyer; 'goods-tax-scrap' = only with an approved goods-tax scrap-and-replace. */
  when: 'always' | 'goods-tax-scrap';
  paid: 'at-purchase' | 'after-approval';
  validFrom: ISODate;
  validTo: ISODate;
  /**
   * What the date window applies to: 'plate' = the scooter must be plated (registered) by
   * `validTo`, which can be days after the invoice; 'invoice' = the invoice date; 'order' = order
   * and payment; 'unknown' = the offer does not say (ask the dealer).
   */
  windowBasis?: 'plate' | 'invoice' | 'order' | 'unknown';
  /** The old scooter must also be scrapped by this date. */
  scrapBy?: ISODate;
  /**
   * The offer does not say whether it needs scrapping; the engine counts it only with scrapping and
   * reports the amount as possible upside for a buyer with nothing to scrap.
   */
  ambiguousScrap?: boolean;
  /**
   * Places where the offer is not available (Yamaha's November offers: physical dealers on Taiwan's
   * main island only, so not Kinmen, Penghu or Lienchiang), with the reason shown to the reader.
   */
  notIn?: { jurisdictions: JurisdictionId[]; why: L10n };
  conditionText: L10n;
}

export interface GasModel {
  id: string;
  brand: L10n;
  name: L10n;
  displacementCc: number;
  /** As published. */
  listPrice: Num;
  /** Published list prices that appear to include plate and insurance: removed to compare like with like. */
  plateInsuranceIncluded?: Num;
  /** Model-specific goods-tax scrap-and-replace amount (capped at 4,000 by law). */
  goodsTaxScrapCut: Num;
  promos: DealerPromo[];
  /** Official test figure (km/L). An upper bound for real riding. */
  fuelEconomy: Num | null;
  calculator: true | { excluded: L10n };
  /** Shown on the model picker. */
  note?: L10n;
}

export interface EvModel {
  id: string;
  brand: L10n;
  name: L10n;
  plateClass: PlateClass;
  plateClassBasis: Provenance & { text: L10n };
  moeaClass: MoeaClass;
  moeaClassBasis: Provenance & { text: L10n };
  listPrice: Num;
  promos: DealerPromo[];
  /**
   * On the MOEA approved-model list? Most subsidies (MOEA and nearly every city) require it.
   * 'unknown': the engine counts none of the MOEA or local lines and says why.
   */
  moeaListed: 'yes' | 'unknown';
  domesticCells: 'yes' | 'no' | 'unknown';
  battery: { system: 'gogoro' | 'ionex' | 'home'; count: 1 | 2 | null; basis: Provenance & { text: L10n } };
  /** km per unit of the plan's energy unit (km/Ah for Gogoro, km/kWh otherwise). */
  efficiency: Band & { unit: 'km-per-Ah' | 'km-per-kWh' };
  plans: string[];
  maintenance: string;
  /**
   * Can it stand in for a 125cc gasoline scooter? 'no' for green-plate models; 'unverified'
   * when we have no verified performance figures. Only 'yes' counts as like-for-like.
   */
  comparableTo125: 'yes' | 'no' | 'unverified';
  performance: Provenance & { text: L10n };
  /**
   * How far it goes on one full charge, as the maker states it (km), with the conditions of that
   * figure in `text`. Only where the research has a sourced figure. The engine warns when a
   * home-charging scooter's average day (monthlyKm ÷ 30) is longer than this.
   */
  range?: Provenance & { km: number; text: L10n };
  calculator: true | { excluded: L10n };
  note?: L10n;
}

// ---------------------------------------------------------------------------
// Energy
// ---------------------------------------------------------------------------

export type PlanUsage =
  /** Fee includes an NTD credit spent at `allowance` kWh; anything beyond is charged at `overageRate`. */
  | { kind: 'credit'; creditNtd: number; allowance: Band; overageRate: number }
  /** Pay per unit, no monthly fee. */
  | { kind: 'per-unit'; rate: number }
  /** Free inside daily time windows, `offWindowRate` per unit outside them. `fairUseUnits`: monthly use above which the operator may treat it as commercial. */
  | { kind: 'time-window'; offWindowRate: number; windows: L10n; fairUseUnits?: number }
  /** Household electricity at a marginal tariff (NTD/kWh). */
  | { kind: 'tariff'; rate: Band; losses?: { low: number; typical: number; high: number; basis: L10n } };

export interface EnergyPlan extends Provenance {
  id: string;
  operator: 'gogoro' | 'ionex' | 'household';
  system: 'gogoro' | 'ionex' | 'home';
  name: L10n;
  batteries: 1 | 2 | 'any';
  unit: 'Ah' | 'kWh';
  monthlyFee: number;
  usage: PlanUsage;
  setupFee?: Num;
  /** The setup fee is charged again when the contract is renewed after `lockInMonths`. */
  setupFeeRenews?: boolean;
  /** Contract length in months, when the operator states one (also the setup-fee period). */
  lockInMonths?: number;
  /**
   * The contract in one short phrase that is true of this plan: its length when the operator states
   * one, or that the operator does not state it (never "no contract" unless there is none).
   * Agrees with `lockInMonths` (the engine tests hold the two together).
   */
  contract: L10n;
  terms: L10n;
  calculator: true | { excluded: L10n };
}

/** Monthly plan credit offered with a model or plan, for a number of months. */
export interface PlanCredit extends Provenance {
  id: string;
  name: L10n;
  perMonth: number;
  months: number;
  plans: string[] | 'any';
  models: string[] | 'any';
  /** Purchase / plate-registration window. */
  validFrom: ISODate;
  validTo: ISODate;
  /** What must be completed inside the window (order and invoice, plate registration...). */
  windowRule?: L10n;
}

export interface FuelPrices {
  /** Pump price used for the calculation (95 unleaded), and the week it applies to. */
  petrol95: Num & { week: L10n };
  petrol92: Num & { week: L10n };
  /**
   * NTD per litre held off the pump price by the temporary smoothing programme. `scheduledEnd` is
   * when its goods-tax part is due to end unless extended; after it the engine says so in the past
   * tense (`mechanismAfterEnd`) and raises the message to a warning.
   */
  smoothing: Band & { mechanism: L10n; scheduledEnd?: ISODate; mechanismAfterEnd?: L10n };
  /** Real-world fuel economy at the poor end (km/L), applied to every model as the high-cost bound. */
  realWorldKmPerL: Num;
}

export interface TariffTier {
  upToKwh: number | null;
  rate: number;
}

export interface ElectricityPrices extends Provenance {
  summer: TariffTier[];
  nonSummer: TariffTier[];
  reviewNote: L10n;
}

// ---------------------------------------------------------------------------
// Running costs
// ---------------------------------------------------------------------------

/**
 * Maintenance. The middle estimate is the MOTC owner-reported yearly average (`ownerAverage`,
 * verified), raised to the schedule-based minimum when the buyer rides more than average;
 * the low and high bounds come from the manufacturer schedules priced with dealer parts lists
 * (`perKm` or `perVisit`, secondary).
 */
export type MaintenanceProfile =
  | { id: string; label: L10n; kind: 'per-km'; perKm: Band; ownerAverage: Num }
  | { id: string; label: L10n; kind: 'visits'; intervalKm: number; minVisitsPerYear: number; perVisit: Band; intervalBasis: Provenance & { text: L10n }; ownerAverage: Num };

export interface FixedFees {
  roadFeeGasoline: { upToCc: number; perYear: Num }[];
  roadFeeElectric: Num & { futureNote: L10n; expectedFromYear: number };
  licenceTax: Num;
  compulsoryInsurance: Num;
  inspection: { gasolineFromAgeYears: number; fee: null; note: L10n } & Provenance;
}

export interface SpendReference extends Provenance {
  label: L10n;
  electric: number;
  gasolineHeavy: number;
  gasolineLight: number;
  all: number;
  breakdown: { energy: number; maintenance: number; parking: number; class: 'electric' | 'gasoline-heavy' | 'gasoline-light' }[];
}

export interface EconMeta {
  /** When the research was checked. */
  checkedOn: ISODate;
  /** The last day 2026 programmes accept purchases. */
  programmeYearEnd: ISODate;
  /** What we know about 2027 as of `checkedOn`. */
  nextYear: L10n;
  horizonMonths: number;
}

export interface EconDataset {
  meta: EconMeta;
  jurisdictions: Record<JurisdictionId, Jurisdiction>;
  programmes: Programme[];
  groups: Record<string, ExclusiveGroup>;
  gasModels: GasModel[];
  evModels: EvModel[];
  plans: EnergyPlan[];
  planCredits: PlanCredit[];
  fuel: FuelPrices;
  electricity: ElectricityPrices;
  maintenance: MaintenanceProfile[];
  fees: FixedFees;
  spendReference: SpendReference;
}
