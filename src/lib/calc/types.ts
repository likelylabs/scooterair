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
  /**
   * Has received a scooter subsidy that the programme's rules exclude: this city's before (New
   * Taipei, Kaohsiung, Taichung, Yunlin), and in some places also an MOENV electric-scooter subsidy
   * (Kinmen: ever; Yilan: 2023–2025; Taichung: since 2016). See each line's condition text.
   */
  previousLocalSubsidy?: boolean;
  foreignNational?: boolean;
  /** Household registration in the city or county since. Omit if unknown: residency rules are assumed met and reported. */
  residentSince?: ISODate;
}

export interface Situation {
  jurisdiction: JurisdictionId;
  /** The old gasoline scooter to scrap, or null. */
  scrap: OldScooter | null;
  /** The buyer's household. A missing household is read as {} (nothing declared). */
  household: Household;
  electricModel: string;
  energyPlan: string;
  gasolineModel: string;
  /** Kilometres ridden a month: a finite number above 0. */
  monthlyKm: number;
  /**
   * Evaluation (purchase) date, 'YYYY-MM-DD', read as a calendar date in Taiwan. Omit it to use
   * today in Taiwan (UTC+8) whatever the caller's time zone; a timestamp with a zone
   * ('2026-12-31T17:30:00Z') is converted to the Taiwan date at that instant.
   */
  date?: ISODate;
  /** Months to project: a whole number from 1 to 240 (default 60). */
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
  'stale-data',
  'range',
] as const;
export type MessageCode = (typeof messageCodes)[number];

export interface Message {
  code: MessageCode;
  severity: Severity;
  text: L10n;
  /**
   * When the message is a list (one deadline rule per line, for example): the items alone, so a
   * page can show them as a list. `text` always holds the whole message, items included.
   */
  items?: L10n[];
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
  /** Listed to `validTo` but only confirmed to this date (the line stops counting after it). */
  confirmedThrough?: ISODate;
  /**
   * The date that actually decides this line, and what must be done by then: the earlier of
   * validTo and confirmedThrough, with the programme's or offer's own rule (plate registration,
   * scrapping, platform registration before buying...). `lastDay` is true on that day itself.
   */
  deadline?: LineDeadline;
  applicationDeadline?: ISODate;
  /** Second-stage (documents) deadline when the first stage closes earlier. */
  documentsDeadline?: ISODate;
  applicationNote?: L10n;
  quota?: Quota;
  status2027?: L10n;
  note?: L10n;
  sources: SourceId[];
  confidence: Confidence;
}

export type DeadlineBasis =
  /** The purchase window of a programme (see `rule` for what must be done). */
  | 'purchase'
  /** A dealer offer that counts the plate-registration date. */
  | 'plate'
  /** A dealer offer that counts the invoice date. */
  | 'invoice'
  /** A dealer offer that counts the order and payment date. */
  | 'order'
  /** A dealer offer that does not say which date counts. */
  | 'dealer-unknown'
  /** Listed as running longer, but only confirmed to this date. */
  | 'confirmed-only';

export interface LineDeadline {
  date: ISODate;
  /** Whole days from the evaluation date (0 on the last valid day). */
  daysLeft: number;
  /** True on the last valid day: say "today is the last day", never "0 days left". */
  lastDay: boolean;
  basis: DeadlineBasis;
  /** What must be completed by `date`. */
  rule: L10n;
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
  /** The buyer did not give an answer the rule needs (an age for an age band): not counted, and not refused. */
  'needs-answer',
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
  /**
   * Ongoing monthly total (excludes temporary credits and the setup-fee amortisation). Not a yearly
   * cost for plans with a setup fee or a credit: show `annualAverage` (or averageMonthly × 12).
   */
  monthly: Bounds;
  /** `monthly` × 12: ongoing items only (see `annualAverage` for the full yearly cost). */
  annual: Bounds;
  /** Average yearly cost over the horizon, setup fees and plan credits included (averageMonthly × 12). */
  annualAverage: Bounds;
  /** Plan credits applied in this result, and ones that no longer apply on the evaluation date. */
  planCredits: { applied: PlanCreditStatus[]; ended: PlanCreditStatus[] };
  /** Average monthly cost over the horizon including setup fee and credits. */
  averageMonthly: Bounds;
  /** Cost per km (averageMonthly / km). */
  perKm: Bounds | null;
  /** Paid at month 0 on top of the purchase price (setup fees). */
  upfront: number;
  /** Month-by-month schedule, index 0 = month 1. */
  schedule: { low: number[]; typical: number[]; high: number[] };
}

export interface PlanCreditStatus {
  id: string;
  name: L10n;
  perMonth: number;
  months: number;
  total: number;
  validTo: ISODate;
  /** What must be completed inside the window. */
  rule?: L10n;
  sources: SourceId[];
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/**
 * How the two cumulative cost lines compare, classified by where they stand at the horizon (so a
 * temporary crossing, such as a setup-fee renewal pushing electric back above gasoline, never
 * decides the answer). Every kind also carries:
 *   gapAtHorizon  electric − gasoline at the horizon (negative = electric ahead);
 *   crossings     every month in which the lines changed order (more than one = they cross back);
 *   horizonMonths the horizon the answer is about.
 */
export type BreakEven =
  /**
   * Cheaper to buy and still ahead at the horizon. `runningCheaper` says whether it also costs less
   * to run; when crossings is not empty it was temporarily dearer in between.
   */
  | ({ kind: 'ev-ahead'; runningCheaper?: boolean } & BreakEvenDetail)
  /** Costs more to buy; cumulative cost falls to the gasoline line at `month` and stays at or below it to the horizon. */
  | ({ kind: 'breaks-even'; month: number } & BreakEvenDetail)
  /** Costs more to buy and is still dearer at the horizon (it may have been cheaper for a while: see crossings). */
  | ({ kind: 'no-break-even'; gapAtHorizon: number } & BreakEvenDetail)
  /** Cheaper to buy but running costs more; gasoline catches up at `month` and stays cheaper to the horizon. */
  | ({ kind: 'gas-catches-up'; month: number } & BreakEvenDetail);

export interface BreakEvenDetail {
  gapAtHorizon?: number;
  crossings?: number[];
  horizonMonths?: number;
}

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
  /** Monthly km range (step 10, up to 5,000) where the electric five-year total (purchase + running) is at or below gasoline's, or null if none. The first such range only: see totalParityIntervals. */
  totalParityKm: { fromKm: number; toKm: number | null } | null;
  /** Every km range where running-cost parity holds (the cost curves need not be monotonic). */
  runningParityIntervals: { fromKm: number; toKm: number | null }[];
  /** Every km range where total-cost parity holds. */
  totalParityIntervals: { fromKm: number; toKm: number | null }[];
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
  situation: Required<Pick<Situation, 'horizonMonths' | 'offWindowShare' | 'date'>> & Situation;
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
  /** Total cost at the horizon (named for the default 60 months; see horizonTotal). */
  fiveYearTotal: Bounds;
  fiveYearGap: number;
  /** The same as fiveYearTotal / fiveYearGap, named for what they are: totals at the horizon. */
  horizonTotal: Bounds;
  horizonGap: number;
  breakEven: BreakEven;
  usesSecondaryInputs: boolean;
  /** Some of the money is an "up to" ceiling: the price could be as high as netPriceHigh. */
  hasUpToAmounts: boolean;
  /** Codes of this option's own warning and critical messages (evaluate() it for the text). */
  warningCodes: MessageCode[];
}

export interface BestOptions {
  gasolineModel: string;
  gasolineNet: number;
  gasolineFiveYearTotal: Bounds;
  byNetPrice: Option[];
  byFiveYearTotal: Option[];
  horizonMonths: number;
  /** The option with the smallest purchase gap. */
  closestToParity: Option | null;
  /**
   * The same among options verified as like-for-like substitutes for a 125cc (likeForLike ===
   * 'like-for-like'). Null when none is verified: the messages then say so (code 'like-for-like').
   */
  closestToParityLikeForLike: Option | null;
  /**
   * The same among options in the same heavy (white-plate) class that are not known to be smaller
   * vehicles; their performance equivalence to a 125cc is NOT verified unless likeForLike says so.
   */
  closestToParitySamePlateClass: Option | null;
  /**
   * Warnings that go with the ranking (deadlines, up-to amounts, quotas, ambiguities, MOEA filing...),
   * from the options it puts forward, de-duplicated; plus a 'like-for-like' message when no option
   * is a verified like-for-like substitute.
   */
  messages: Message[];
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

export interface InputIssue {
  /** The input field, e.g. 'monthlyKm', 'household.age', 'scrap.builtOn'. */
  field: string;
  code: 'not-a-number' | 'not-finite' | 'not-positive' | 'negative' | 'not-integer' | 'out-of-range' | 'bad-date' | 'unknown-id' | 'missing';
  message: L10n;
}

/** Thrown by evaluate() and bestOptions() for invalid input; `issues` lists every problem found. */
export class CalcInputError extends Error {
  readonly issues: InputIssue[];
  constructor(issues: InputIssue[]) {
    super(`[calc] Invalid input: ${issues.map((i) => `${i.field}: ${i.message.en}`).join('; ')}`);
    this.name = 'CalcInputError';
    this.issues = issues;
  }
}
