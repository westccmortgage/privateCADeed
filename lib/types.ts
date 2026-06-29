export type ScenarioStrength =
  | "Strong"
  | "Moderate"
  | "Needs Restructure"
  | "Needs More Info";

export interface ExtractedScenario {
  propertyLocation: string | null;
  propertyState: "CA" | null;
  estimatedValue: number | null;
  currentDebt: number | null;
  requestedLoanAmount: number | null;
  requestedCashOut: number | null;
  purchasePrice: number | null;
  rehabBudget: number | null;
  constructionBudget: number | null;
  arv: number | null;
  propertyType: string | null;
  loanPurpose: string | null;
  lienPosition: string | null;
  occupancy: string | null;
  businessPurpose: string | null;
  closingTimeline: string | null;
  exitStrategy: string | null;
  borrowerRole: string | null;
}

export interface CalculatedScenario {
  estimatedLTV: number | null;
  estimatedCLTV: number | null;
  estimatedLTC: number | null;
  estimatedARVLTV: number | null;
  totalDebtAfterLoan: number | null;
  equityRemaining: number | null;
  possibleCapitalPath: string;
  capitalPathDescription: string;
  scenarioStrength: ScenarioStrength;
  riskNotes: string[];
}

export interface AnalyzeDealResponse {
  rawUserInput: string;
  extracted: ExtractedScenario;
  calculated: CalculatedScenario;
  missingInformation: string[];
  nextBestQuestion: string;
  restructureOptions: string[];
  complianceNote: string;
}

export interface SaveScenarioPayload {
  sourceDomain: string;
  scenarioId: string;
  rawUserInput: string;
  extractedScenario: ExtractedScenario;
  calculatedScenario: CalculatedScenario;
  userContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
}

export const COMPLIANCE_NOTE =
  "This is not a loan approval or commitment to lend. All scenarios require review by a licensed mortgage professional and/or private capital source. Terms, availability, and eligibility depend on property, borrower, collateral, documentation, occupancy, purpose, and applicable law.";
