export enum FormStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  SUBMITTED = 'Submitted',
  COMPLETED = 'Completed',
}

export enum ProgressStatus {
  APPROVED = 'Approved',
  IN_REVIEW = 'In Review',
  FLAGGED = 'Flagged',
  MISSING = 'Missing',
  NOT_REQUESTED = 'Not Requested'
}

export enum DocumentStatus {
  NOT_REVIEWED = 'Not Reviewed',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETE = 'complete'
}

export interface AssignedForm {
  id: string;
  name: string;
  status: FormStatus;
  description: string;
  /** Linked Available Form record ID (e.g. eBxXtLZdK4us) for in-app routing */
  availableFormId?: string;
}

export interface AvailableForm {
  id: string;
  name: string;
  description: string;
}

export interface CompanyScopedQuery {
  companyId: string;
}

export interface AvailableFormRecord {
  id: string;
  airtableId: string | null;
  displayName: string;
  sortOrder: number | null;
  showInAvailableForms: boolean | null;
  assignment: string | null;
  assignmentType: string | null;
  formsUrl: string | null;
}

export interface AssignedFormRecord {
  id: string;
  companyId: string;
  availableFormId: string | null;
  status: FormStatus;
  submitted: boolean;
}

export interface PortalFormSubmission {
  id: string;
  companyId: string;
  availableFormId: string | null;
  formId: string;
  formName: string;
  status: FormStatus;
  submittedAt: string;
}

export interface DocumentArtifactRecord {
  id: string;
  companyId: string;
  documentType: string | null;
  status: string | null;
  fileName: string | null;
  fileUrl: string | null;
  metadata: Record<string, unknown> | null;
}

export interface DocumentArtifact {
  id: string;
  name: string;
  status: DocumentStatus;
  fileName: string;
  date: string;
  url?: string;
  documentType?: string;
  fileUrl?: string;
}

export interface ProgressStep {
  id: string;
  name: string;
  status: ProgressStatus;
  category: string;
  notes?: string;
  lastUpdated?: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  email: string;
}

export interface CompanyData {
  name: string;
  entityType: string;
  legalName: string;
  ein: string;
  sicCode: string;
  naicsCode: string;
  address: string;
  renewalMonth: string;
  contact: ContactInfo;
  workforce: {
    totalEmployees: string;
    usHqEmployees: string;
    hqCity: string;
    otherUsCities: string[];
    otherCountries: string[];
    openJobs: string;
    linkedInUrl: string;
  };
  glassdoor: {
    overallRating: number;
    benefitsRating: number;
    healthInsuranceRating: number;
    retirementRating: number;
    overallReviews: number;
    benefitsReviews: number;
    glassdoorUrl: string;
  };
}

export interface Solution {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string;
  features: string[];
  websiteUrl: string;
  integrationType: string;
  industry?: string;
  linkedinDescription?: string;
  packageContent?: string;
  subCategory?: string;
  bestFitFor?: string;
  pairsWellWith?: string;
}


export interface DemographicInsights {
  eligibleEmployees: number;
  averageSalary: number;
  averageAge: number;
  malePercentage: number;
  femalePercentage: number;
}

export interface FinancialKPIs {
  totalMonthlyCost: number;
  totalEmployerContribution: number;
  totalEmployeeContribution: number;
  erCostPerEligible: number;
}

export interface BudgetBreakdown {
  benefit: string;
  carrier: string;
  participation: number;
  monthlyTotal: number;
  annualTotal: number;
  erCostMonth: number;
  eeCostMonth: number;
  erCostEnrolled: number;
  erCostFte: number;
}

export interface BenefitEligibilityData {
  className: string;
  waitingPeriod: string;
  effectiveDate: string;
  requiredHours: string;
}

export interface ContributionStrategy {
  benefit: string;
  strategyType: string;
  flatAmount: string;
  eePercent: string;
  depPercent: string;
  buyUpStrategy: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  carrier: string;
  score: number;
  category: 'Medical' | 'Dental' | 'Vision';
  type: string;
  // Medical
  deductible?: string;
  deductibleFamily?: string;
  oopm?: string;
  oopmFamily?: string;
  coinsurance?: string;
  copay?: string;
  rx?: string;
  // Dental
  valueScore?: string;
  annualMax?: string;
  preventive?: string;
  basic?: string;
  major?: string;
  oonReimbursement?: string;
  // Vision
  examCopay?: string;
  materialsCopay?: string;
  frameAllowance?: string;
  materialsFrequency?: string;
  frameFrequency?: string;
  rates?: BenefitPlanRate[];
  monthlyPremium?: number;
  monthlyEmployerContribution?: number;
  monthlyEmployeeContribution?: number;
}

export interface BenefitPlanRate {
  tierKey: string;
  tierLabel: string;
  premium: number;
  employerContribution: number;
  employeeContribution: number;
}

export interface BenefitPlanRecord extends BenefitPlan {
  planYear?: number;
}

export interface FeedbackResponse {
  id: string;
  submittedAt: string;
  year?: number;
  tier: string;
  overallRating: number;
  medicalOptions: number;
  medicalNetwork: number;
  medicalCost: number;
  nonMedical: number;
  retirement: number | null;
  comments?: string;
}

export interface FeedbackStats {
  overall: number;
  responses: number;
  nonMedical: number;
  employeeCost: number;
  medicalNetwork: number;
  medicalOptions: number;
  retirement: number | null;
}

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

export type ViewType = 'home' | 'company-details' | 'benefit-plans' | 'benefits-analysis' | 'benefit-budget' | 'employee-feedback' | 'appoint-betafits' | 'faq';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyId: string;
  role?: string;
}
