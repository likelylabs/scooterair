// Input and output types of the calculation engine. Plain data: everything here can be
// JSON-serialised into a page and handed to a browser script.

import type {
  Confidence,
  Engine,
  ISODate,
  IncomeLevel,
  JurisdictionId,
  L10n,
  Quota,
  SourceId,
  VerificationStatus,
} from '../../data/econ/types.ts';

export type { Confidence, ISODate, JurisdictionId, L10n, SourceId };

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface OldScooter {
  engine: Engine;
  /** Build (manufacture) date, 'YYYY-MM' or 'YYYY-MM-DD' (a bare month counts as its last day). */
  builtOn: string;
  /** Engine size; defaults to 125. */
  displacementCc?: number;
  /** When it was first registered in the buyer's city or county. Omit if unknown: the engine assumes local-registration rules are met and says so. */
  registeredLocallySince?: ISODate;
  /** New Taipei double-scrap: a second qualifying old scooter scrapped in the same application. */
  secondScooter?: boolean;
}

export interface Household {
  childUnder12?: boolean;
  schoolChild?: boolean;
  /** Defaults to 'none' (no low or middle-low income certificate). */
  income?: IncomeLevel;
  /** Buyer's age. Omit if unknown: general 18+ rules are assumed met, age-band top-ups are not counted. */
  age?: number;
  deliveryRider?: boolean;
  indigenous?: boolean;
  medicalWorker?: boolean;
  neighbourhoodWatch?: boolean;
  disasterAffected?: boolean;
  /** Lives in a district the city defines as remote (Taoyuan: Fuxing; Tainan: four districts). */
  remoteDistrict?: boolean;
  /** Has received this city's scooter subsidy before (excluded in New Taipei, Kaohsiung, Kinmen). */
  previousLocalSubsidy?: boolean;
  foreignNational?: boolean;
  /** Household registration in the city or county since. Omit if unknown: residency rules are assumed met and reported. */
  residentSince?: ISODate;
}

export interface Situation {
  jurisdiction: JurisdictionId;
  /** The old gasoline scooter to scrap, or null. */
  scrap: OldScooter | null;
  household: Household;
  electricModel: string;
  energyPlan: string;
  gasolineModel: string;
  monthlyKm: number;
  /** Evaluation (purchase) date, 'YYYY-MM-DD'. */
  date: ISODate;
  /** Months to project (default 60). */
  horizonMonths?: number;
  /**
   * Time-window plans (Gogoro 488/888): share of swaps made outside the free windows used for
   * the middle estimate (0–1). No source says what share is typical, so the default is the
   * neutral 0.5 and the result reports it as an assumption. The low bound is always 0 (every
   * swap in a free window) and the high bound 1.
   */
  offWindowShare?: number;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export type Severity = 'critical' | 'warning' | 'info';

export const messageCodes = [
  'programmes-ended',
  'deadline',
  'application-deadline',
  'moea-filing',
  'expired',
  'quota-exhausted',
  'quota-low',
  'quota-unknown',
  'jurisdiction-not-verified',
  'jurisdiction-partly-verified',
  'up-to-amounts',
  'ambiguity',
  'assumption',
  'secondary-input',
  'like-for-like',
  'petrol-smoothing',
  'ev-road-fee',
  'dealer-promo-expired',
  'promo-stacking',
  'plan-lock-in',
  'payout-timing',
  'electricity-review',
  'unconfirmed',
] as const;
export type MessageCode = (typeof messageCodes)[number];

export interface Message {
  code: MessageCode;
  severity: Severity;
  text: L10n;
  /** Ledger line or input ids this message is about. */
  about?: string[];
  /** For ambiguity / sensitivity messages: the NTD at stake. */
  amount?: number;
  sources?: SourceId[];
  links?: { label: L10n; url: string }[];
}

// ---------------------------------------------------------------------------
// Purchase ledger
// ---------------------------------------------------------------------------

export type LineKind = 'dealer' | 'subsidy' | 'tax' | 'recycling' | 'scrap-only';

export interface LedgerLine {
  /** Programme or promotion id. */
  id: string;
  kind: LineKind;
  label: L10n;
  payer: L10n;
  /** Amount deducted in the ledger (after any cap). */
  amount: number;
  /** What the rule says, before caps. */
  ruleAmount: number;
  /** "Up to": a ceiling. The low end of the net-price range assumes it pays 0. */
  isMaximum: boolean;
  /** Set when a payout cap reduced the line. */
  cappedFrom?: number;
  conditionText: L10n;
  /** At the shop, or paid later after a claim is approved. */
  paid: 'at-purchase' | 'after-approval';
  validTo: ISODate;
  /** Days from the evaluation date to validTo (inclusive of today = 0). */
  daysLeft: number;
  applicationDeadline?: ISODate;
  applicationNote?: L10n;
  quota?: Quota;
  status2027?: L10n;
  note?: L10n;
  sources: SourceId[];
  confidence: Confidence;
}

export const exclusionReasons = [
  'not-eligible',
  'mutually-exclusive',
  'expired',
  'not-yet-valid',
  'unconfirmed',
  'quota-exhausted',
  'unverified',
  'not-published',
  'secondary-only',
  'ambiguous',
  'requirement-not-met',
  'model-unknown',
] as const;
export type ExclusionReason = (typeof exclusionReasons)[number];

export interface ExcludedLine {
  id: string;
  label: L10n;
  payer: L10n;
  /** The amount the rule would pay (0 when not published). */
  amount: number;
  reason: ExclusionReason;
  reasonText: L10n;
  /** For 'not-eligible': the kind of condition that failed (a UI may hide 'ev-plate-class' and 'region' as noise). */
  failedCondition?: string;
  /** For 'mutually-exclusive': the line(s) counted instead. */
  instead?: string[];
  sources: SourceId[];
  confidence: Confidence;
  links?: { label: L10n; url: string }[];
}

export interface PurchaseLedger {
  side: 'electric' | 'gasoline';
  model: { id: string; name: L10n; brand: L10n };
  /** Starting price (gasoline: ex plate and insurance). */
  listPrice: { value: number; published: number; sources: SourceId[]; confidence: Confidence; note?: L10n };
  lines: LedgerLine[];
  excluded: ExcludedLine[];
  /** Sum of `lines`. */
  totalDeductions: number;
  /**
   * net.value = listPrice.value − totalDeductions (every line at its stated amount).
   * net.high  = the price if every "up to" line paid nothing (equal to value when there are none).
   */
  net: { value: number; high: number };
  /** Amount still to be refunded after purchase (lines paid after approval). */
  paidLater: number;
  messages: Message[];
}

// ---------------------------------------------------------------------------
// Running costs
// ---------------------------------------------------------------------------

export interface Bounds {
  low: number;
  typical: number;
  high: number;
}

export type CostItemId =
  | 'energy'
  | 'plan-fee'
  | 'setup-fee'
  | 'plan-credit'
  | 'maintenance'
  | 'road-fee'
  | 'licence-tax'
  | 'insurance'
  | 'inspection';

export interface CostItem {
  id: CostItemId;
  label: L10n;
  /** NTD per month while the item applies. */
  monthly: Bounds;
  /** NTD per year (monthly × 12, or the yearly fee). */
  annual: Bounds;
  /** If the item only applies for some months (credits, setup amortisation). */
  months?: number;
  /** For the setup fee: what is actually paid at month 0. */
  paidUpfront?: number;
  note?: L10n;
  sources: SourceId[];
  confidence: Confidence;
}

export interface RunningCosts {
  side: 'electric' | 'gasoline';
  items: CostItem[];
  /** Ongoing monthly total (excludes temporary credits and the setup-fee amortisation). */
  monthly: Bounds;
  annual: Bounds;
  /** Average monthly cost over the horizon including setup fee and credits. */
  averageMonthly: Bounds;
  /** Cost per km (averageMonthly / km). */
  perKm: Bounds | null;
  /** Paid at month 0 on top of the purchase price (setup fees). */
  upfront: number;
  /** Month-by-month schedule, index 0 = month 1. */
  schedule: { low: number[]; typical: number[]; high: number[] };
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export type BreakEven =
  /** Cheaper to buy and never costs more within the horizon. */
  | { kind: 'ev-ahead' }
  /** Costs more to buy; cumulative cost falls to the gasoline line at `month`. */
  | { kind: 'breaks-even'; month: number }
  /** Costs more to buy and does not catch up within the horizon. */
  | { kind: 'no-break-even'; gapAtHorizon: number }
  /** Cheaper to buy but running costs more; gasoline catches up at `month`. */
  | { kind: 'gas-catches-up'; month: number };

export interface Comparison {
  /** Electric net price − gasoline net price (negative = electric is cheaper to buy). */
  purchaseGap: number;
  /** The same with electric "up to" lines at 0. */
  purchaseGapHigh: number;
  likeForLike: {
    verdict: 'like-for-like' | 'same-class-performance-unverified' | 'different-class';
    note: L10n;
  };
  cumulative: { months: number[]; electric: Bounds[]; gasoline: Bounds[] };
  breakEven: BreakEven;
  /** Best case (electric low, gasoline high) and worst case (electric high, gasoline low). */
  breakEvenRange: { best: BreakEven; worst: BreakEven };
  /** Monthly km where the electric option's average running cost drops to petrol's, or null if not up to 5,000 km. */
  runningParityKm: { fromKm: number; toKm: number | null } | null;
  /** Monthly km range (step 10, up to 5,000) where the electric five-year total (purchase + running) is at or below gasoline's, or null if none. */
  totalParityKm: { fromKm: number; toKm: number | null } | null;
  /** Gasoline running cost and break-even if the temporary pump-price smoothing ended today. */
  withoutSmoothing: { gasolineMonthly: number; gasolineMonthlyHigh: number; breakEven: BreakEven };
}

export interface JurisdictionSummary {
  id: JurisdictionId;
  name: L10n;
  status: VerificationStatus;
  statusNote: L10n;
  officialLinks: { label: L10n; url: string }[];
}

export interface Evaluation {
  situation: Required<Pick<Situation, 'horizonMonths' | 'offWindowShare'>> & Situation;
  jurisdiction: JurisdictionSummary;
  electric: { purchase: PurchaseLedger; running: RunningCosts };
  gasoline: { purchase: PurchaseLedger; running: RunningCosts };
  comparison: Comparison;
  /** Every message, most severe first, de-duplicated. */
  messages: Message[];
  dataCheckedOn: ISODate;
}

export interface Option {
  electricModel: string;
  energyPlan: string;
  modelName: L10n;
  planName: L10n;
  plateClass: string;
  likeForLike: Comparison['likeForLike']['verdict'];
  netPrice: number;
  netPriceHigh: number;
  purchaseGap: number;
  fiveYearTotal: Bounds;
  fiveYearGap: number;
  breakEven: BreakEven;
  usesSecondaryInputs: boolean;
}

export interface BestOptions {
  gasolineModel: string;
  gasolineNet: number;
  gasolineFiveYearTotal: Bounds;
  byNetPrice: Option[];
  byFiveYearTotal: Option[];
  /** The option with the smallest purchase gap, and the same among like-for-like (white-plate) options. */
  closestToParity: Option | null;
  closestToParityLikeForLike: Option | null;
  messages: Message[];
}
