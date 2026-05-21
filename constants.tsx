
import {
  FormStatus,
  ProgressStatus,
  DocumentStatus,
  AssignedForm,
  AvailableForm,
  DocumentArtifact,
  ProgressStep,
  CompanyData,
  BenefitEligibilityData,
  ContributionStrategy,
  BenefitPlan,
  DemographicInsights,
  FinancialKPIs,
  BudgetBreakdown,
  FeedbackResponse,
  FeedbackStats,
  Solution
} from './types';

export const ASSIGNED_FORMS: AssignedForm[] = [
  {
    id: '1',
    name: 'Quick Start',
    status: FormStatus.IN_PROGRESS,
    description: 'Provide basic company info and primary contact details.'
  },
  {
    id: '1a',
    name: 'Medical Plan Review',
    status: FormStatus.NOT_STARTED,
    description: 'Verify current medical plan offerings and contribution strategies for the upcoming year.'
  },
  {
    id: '1b',
    name: 'Compliance Census',
    status: FormStatus.NOT_STARTED,
    description: 'Submit detailed employee census data required for mandatory compliance testing and reporting.'
  }
];

export const AVAILABLE_FORMS: AvailableForm[] = [
  {
    id: '2',
    name: 'PEO/EOR Assessment',
    description: 'Indicate whether you work with a PEO or EOR and share key details to help us understand your current setup.'
  },
  {
    id: '3',
    name: 'Broker Role',
    description: "Outline your broker's role, including their type, agreements, and any fees or subsidies they provide."
  },
  {
    id: '4',
    name: 'Benefits Administration',
    description: 'Describe how your company manages benefits, including who handles enrollments, payroll deductions, and COBRA.'
  }
];

export const DOCUMENT_ARTIFACTS: DocumentArtifact[] = [
  {
    id: '101',
    name: 'Acklen Avenue_enrollment_census_2025_11_25',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'AcklenAvenue_E1000I80LX21B_2024-11-011.pdf',
    documentType: 'Census Files',
    date: 'Oct 12, 2025',
    fileUrl: 'https://v5.airtableusercontent.com/v3/u/49/49/1767708000000/rkp0j5G-CREozzALoW3W4w/1Xca9IofcBtIxdZ8T7G94B7oj9aExn3RIRXQxJ3Cdkr_2Gtqwh7nL3B325vywMJLBqCfIwWmrH_Npwxj83DmyvDu9sc8IfiBuRTrXsz-uSmRShAHnPaXJxRD0uH9d9VwZ4xQrsEAAkpXu2QA4kSSRHL7b5y1N2NCNAQo3TihOTtzf7X01B3LBg0kqSPLjQv3J9AOmNRzTZvxAleIQ4JuLA/1p-CWxeDAeBmRo8If9AW6KJSbVEPHvctqHNyJWkT-lw'
  },
  {
    id: '102',
    name: 'Acklen Avenue Benefits Guide 11-1-2024 (2) (1) (1)',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'Acklen Avenue Medical invoice_539346022707.pdf',
    documentType: 'Benefit Guide',
    date: 'Oct 13, 2025',
    fileUrl: 'https://v5.airtableusercontent.com/v3/u/49/49/1767708000000/5BQ73vHMPgrWeAje-styBw/ekCgHlEzyLmYJHw-3XWexDpR0X65qf3F1pNXv_imWhcDvvAb5krXP5fd6x7HC8jbWCKHhh4QuAkRrlBzyjwSSwa5euh6aCHR_SOqTZepB7UekZ9pFNnUbiKc51zM-Bgw5Ce0Nf-8CeDzaJxXcySqp_nAjPlDig9XFyXVjhjn95TdAeQArMEJE-cs9VywdRcrBNV5upgMBMSk3KY7p3q1kw/o_1TEro9fNNUqyfUnP77iqnKtLPSxEU_zt4eHVgs-O4'
  },
  {
    id: '103',
    name: 'HP $3200 — Medical SBC (AA)',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'AcklenAvenue_HP32002575I8024B_2024-11-011.pdf',
    documentType: 'Medical SBC',
    date: 'Oct 14, 2025',
    fileUrl: 'https://v5.airtableusercontent.com/v3/u/49/49/1767708000000/rLn9mIr0o9s-x_nqbAJjPA/3HIKFChiJUKzz0c1PwpyCsRzH0XL673gIMUYlCc8U8k9Tfcz1FJM-022PycQRWyjOBWvArWnO557JPnJJM-BkMbzbkOd2rRzmfHOMfmzXk2GtbBppOCOxHsKl3tPgN9VZDiV_pTlBNi3cWCddSitxioCkAGiZTRtWvE7CfISNk0K9-K-J8lCvqsUlOi9rxLpu1cDRRwNQoUYdBu_tAlaug/3DPBKeHPQz5Yc9qetd-ua0i4IvlsJkArNJLu9H6SI7o'
  },
  {
    id: '104',
    name: 'Acklen Avenue ERISA Wrap Document',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'Acklen_ERISA_Wrap.pdf',
    documentType: 'ERISA Wrap Document',
    date: 'Oct 15, 2025'
  },
  {
    id: '105',
    name: 'Nashville HQ Payroll Deductions Q3',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'Payroll_Q3_2025.pdf',
    documentType: 'Payroll Deductions',
    date: 'Oct 16, 2025'
  },
  {
    id: '106',
    name: 'Dental Plan Summary 2026',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'Dental_Summary_2026.pdf',
    documentType: 'Dental Plan Summary',
    date: 'Oct 17, 2025'
  },
  {
    id: '107',
    name: 'Vision Plan Summary 2026',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'Vision_Summary_2026.pdf',
    documentType: 'Vision Plan Summary',
    date: 'Oct 18, 2025'
  },
  {
    id: '108',
    name: 'Medical Invoice - September 2025',
    status: DocumentStatus.NOT_REVIEWED,
    fileName: 'Medical_Invoice_Sept.pdf',
    documentType: 'Insurance Invoice',
    date: 'Oct 19, 2025'
  }
];

export const PROGRESS_STEPS: ProgressStep[] = [
  { id: '1', name: 'Quick Start', category: 'Form', status: ProgressStatus.APPROVED, notes: 'Awaiting final signature', lastUpdated: '10/13/2025' },
  { id: '3', name: 'Benefit Guide', category: 'Document Extraction', status: ProgressStatus.APPROVED, notes: 'Extraction complete', lastUpdated: '10/12/2025' },
  { id: '4', name: 'SBCs / Plan Summaries', category: 'Document Extraction', status: ProgressStatus.IN_REVIEW, notes: 'Missing Dental SBC', lastUpdated: '10/13/2025' },
  { id: '5', name: 'Appoint Betafits', category: 'Legal', status: ProgressStatus.IN_REVIEW, notes: 'Pending authorization', lastUpdated: '10/14/2025' }
];

export const COMPANY_DETAILS: CompanyData = {
  name: 'Acklen Avenue',
  entityType: 'Limited Liability Company (LLC)',
  legalName: 'Acklen Avenue LLC',
  ein: '27-5227791',
  sicCode: '3434',
  naicsCode: '541511',
  address: '1033 Demonbreun Street, Suite 300, Nashville, Tennessee, 37203',
  renewalMonth: 'November',
  contact: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    jobTitle: 'Project Coordinator',
    phone: '(407) 334-8920',
    email: 'sarah.johnson@acklen.com'
  },
  workforce: {
    totalEmployees: '501-1000',
    usHqEmployees: '501-1000',
    hqCity: 'Nashville',
    otherUsCities: ['Savannah', 'Austin', 'Boston'],
    otherCountries: [],
    openJobs: '12',
    linkedInUrl: 'https://www.linkedin.com/company/acklen-avenue'
  },
  glassdoor: {
    overallRating: 3.6,
    benefitsRating: 2.8,
    healthInsuranceRating: 2.0,
    retirementRating: 2.0,
    overallReviews: 37,
    benefitsReviews: 15,
    glassdoorUrl: 'https://www.glassdoor.com/Reviews/Acklen-Avenue-Reviews-E123456.htm'
  }
};

export const DEMOGRAPHIC_INSIGHTS: DemographicInsights = {
  eligibleEmployees: 946,
  averageSalary: 155679,
  averageAge: 35.4,
  malePercentage: 40.8,
  femalePercentage: 59.2
};

export const FINANCIAL_KPIS: FinancialKPIs = {
  totalMonthlyCost: 9533,
  totalEmployerContribution: 82289,
  totalEmployeeContribution: 32104,
  erCostPerEligible: 9143
};

export const BUDGET_BREAKDOWN: BudgetBreakdown[] = [
  { benefit: 'Medical', carrier: 'UHC', participation: 450, monthlyTotal: 7200, annualTotal: 86400, erCostMonth: 5400, eeCostMonth: 1800, erCostEnrolled: 12.00, erCostFte: 14.50 },
  { benefit: 'Dental', carrier: 'Aetna', participation: 380, monthlyTotal: 1800, annualTotal: 21600, erCostMonth: 1200, eeCostMonth: 600, erCostEnrolled: 3.15, erCostFte: 4.20 },
  { benefit: 'Vision', carrier: 'Aetna', participation: 310, monthlyTotal: 533, annualTotal: 6396, erCostMonth: 333, eeCostMonth: 200, erCostEnrolled: 1.07, erCostFte: 1.50 }
];

export const ELIGIBILITY_DATA: BenefitEligibilityData = {
  className: 'All Full-Time Employees',
  waitingPeriod: 'First of month following 30 days',
  effectiveDate: '01/01/2026',
  requiredHours: '30 Hours per week'
};

export const CONTRIBUTION_STRATEGIES: ContributionStrategy[] = [
  { benefit: 'Medical', strategyType: 'Employer Percentage', flatAmount: '$0', eePercent: '100%', depPercent: '50%', buyUpStrategy: 'Available' },
  { benefit: 'Dental', strategyType: 'Flat Contribution', flatAmount: '$45', eePercent: '100%', depPercent: '25%', buyUpStrategy: 'None' },
  { benefit: 'Vision', strategyType: 'Employer Percentage', flatAmount: '$0', eePercent: '100%', depPercent: '0%', buyUpStrategy: 'None' }
];

export const BENEFIT_PLANS: BenefitPlan[] = [
  {
    id: 'p1',
    category: 'Medical',
    name: 'UHC Choice Plus HSA $3300',
    carrier: 'UHC',
    score: 88,
    type: 'HDHP',
    deductible: '$3,300',
    deductibleFamily: '$6,600',
    oopm: '$7,500',
    oopmFamily: '$13,000',
    coinsurance: '20%',
    copay: '$25',
    rx: '20% / 40% / 60%'
  },
  {
    id: 'p2',
    category: 'Medical',
    name: 'UHC Choice Plus PPO $3000',
    carrier: 'UHC',
    score: 92,
    type: 'PPO',
    deductible: '$3,000',
    deductibleFamily: '$6,000',
    oopm: '$6,500',
    oopmFamily: '$12,000',
    coinsurance: '20%',
    copay: '$25',
    rx: '$10 / $35 / $70 / $250'
  },
  {
    id: 'd1',
    category: 'Dental',
    name: 'MetLife Dental PPO',
    carrier: 'MetLife',
    score: 0,
    valueScore: '0 Star',
    type: 'PPO',
    annualMax: '$1,500',
    preventive: '100%',
    basic: '80%',
    major: '50%',
    oonReimbursement: '–'
  },
  {
    id: 'd2',
    category: 'Dental',
    name: 'Aetna Dental PPO 2',
    carrier: 'Aetna',
    score: 0,
    valueScore: '0 Star',
    type: 'PPO',
    annualMax: '$1,000',
    preventive: '100%',
    basic: '90%',
    major: '60%',
    oonReimbursement: 'MAC'
  },
  {
    id: 'v1',
    category: 'Vision',
    name: 'Aetna Vision Preferred',
    carrier: 'Aetna',
    score: 0,
    valueScore: '0 Star',
    type: 'Vision',
    examCopay: '$20',
    materialsCopay: '$20',
    frameAllowance: '$100 + 20%',
    materialsFrequency: 'Every 12 months',
    frameFrequency: '–'
  },
  {
    id: 'v2',
    category: 'Vision',
    name: 'VSP Vision Care',
    carrier: 'VSP',
    score: 0,
    valueScore: '0 Star',
    type: 'Vision',
    examCopay: '$10',
    materialsCopay: '$10',
    frameAllowance: '$150 + 20%',
    materialsFrequency: 'Every 12 months',
    frameFrequency: 'Every 12 months'
  }
];

export const FEEDBACK_STATS: FeedbackStats = {
  overall: 3.8,
  responses: 4,
  nonMedical: 4.0,
  employeeCost: 3.5,
  medicalNetwork: 4.3,
  medicalOptions: 3.8,
  retirement: null
};

export const FEEDBACK_RESPONSES: FeedbackResponse[] = [
  {
    id: 'fr1',
    submittedAt: '7/23/2024, 7:51 PM',
    year: 2024,
    tier: 'Family',
    overallRating: 5,
    medicalOptions: 5,
    medicalNetwork: 5,
    medicalCost: 5,
    nonMedical: 5,
    retirement: 5,
    comments: 'Extremely satisfied with the level of coverage and the seamless onboarding process.'
  },
  {
    id: 'fr2',
    submittedAt: '7/23/2024, 8:06 PM',
    year: 2024,
    tier: 'Employee Only',
    overallRating: 3,
    medicalOptions: 3,
    medicalNetwork: 3,
    medicalCost: 4,
    nonMedical: 3,
    retirement: 3,
    comments: 'Health benefits seem fairly standard, but I wish there were more HMO options available.'
  },
  {
    id: 'fr3',
    submittedAt: '8/1/2024, 11:35 PM',
    year: 2024,
    tier: 'Family',
    overallRating: 4,
    medicalOptions: 4,
    medicalNetwork: 4,
    medicalCost: 4,
    nonMedical: 4,
    retirement: 4
  },
  {
    id: 'fr13',
    submittedAt: '5/15/2023, 10:00 AM',
    year: 2023,
    tier: 'Employee + Spouse',
    overallRating: 4,
    medicalOptions: 3,
    medicalNetwork: 4,
    medicalCost: 3,
    nonMedical: 4,
    retirement: 4,
    comments: 'Solid benefits package for 2023.'
  },
  {
    id: 'fr14',
    submittedAt: '2/10/2025, 11:00 AM',
    year: 2025,
    tier: 'Family',
    overallRating: 5,
    medicalOptions: 5,
    medicalNetwork: 4,
    medicalCost: 5,
    nonMedical: 5,
    retirement: 5,
    comments: 'The 2025 updates are fantastic.'
  },
  {
    id: 'fr4',
    submittedAt: '8/2/2024, 9:50 PM',
    year: 2024,
    tier: 'Employee + Child(ren)',
    overallRating: 4,
    medicalOptions: 4,
    medicalNetwork: 4,
    medicalCost: 3,
    nonMedical: 4,
    retirement: 4,
    comments: 'I would say the out of pocket max is really high for the employee + children.'
  }
];

export const CATALOG_CATEGORIES = [
  'All Solutions',
  '401(k)',
  'Analytics',
  'Ancillary',
  'Apps/Navigation',
  'COBRA/HRA/FSA',
  'HCM/Payroll',
  'HSA',
  'Lifestyle',
  'National Carriers',
  'PBM',
  'PEO',
  'QSEHRA/ICHRA',
  'Self-Funded'
];

export const CATALOG_SOLUTIONS: Solution[] = [
  {
    id: 's1',
    name: 'Rain',
    category: 'Other / Miscellaneous',
    color: 'amber',
    description: 'Rain is an earned wage access provider that helps companies increase retention by giving employees control over their financial lives.',
    industry: 'Financial Services',
    linkedinDescription: 'Rain is a financial wellness platform that provides earned wage access (EWA) to employees. Our mission is to kill predatory lending by giving people control over their income. We partner with employers to offer a benefit that increases retention, productivity, and employee satisfaction without any cost to the company.',
    packageContent: 'The Rain platform integrates with your existing payroll and timekeeping systems to allow employees to withdraw a portion of their earned but unpaid wages before payday. This helps them avoid high-interest payday loans and overdraft fees, leading to a more financially stable and focused workforce.',
    features: ['Earned Wage Access', 'Financial Wellness Tools', 'Direct Payroll Integration', 'No-cost to Employer', 'Instant Transfers'],
    websiteUrl: 'https://rain.us',
    integrationType: 'Native API',
    subCategory: 'Earned Wage Access',
    bestFitFor: 'Companies with high-turnover workforces or those looking to enhance financial wellness benefits.',
    pairsWellWith: 'Gusto, Rippling, and Betterment at Work.'
  },
  {
    id: 's2',
    name: 'Springbuk',
    category: 'Technology & Platforms',
    color: 'gray',
    description: 'Springbuk is a health intelligence platform that empowers employers to sharpen their benefits strategy with data-driven insights.',
    industry: 'Health Technology',
    linkedinDescription: 'Springbuk is a health intelligence platform that empowers employers and consultants to sharpen their benefits strategy, improve health outcomes, and contain costs. Our platform provides actionable insights by unifying health and financial data, allowing for predictive modeling and population health management.',
    packageContent: 'Springbuk unifies your disparate health data—claims, pharmacy, biometric, and more—into a single, intuitive dashboard. This allows you to identify cost drivers, measure the ROI of your benefit programs, and proactively address health risks within your workforce.',
    features: ['Predictive Analytics', 'Population Health Management', 'Financial Forecasting', 'Automated Reporting', 'Data Unification'],
    websiteUrl: 'https://springbuk.com',
    integrationType: 'Cloud Connector',
    subCategory: 'Analytics Platform',
    bestFitFor: 'Self-funded employers and benefits consultants looking for deep data insights.',
    pairsWellWith: 'Centivo, MultiPlan, and major national carriers.'
  },
  {
    id: 's3',
    name: 'Centivo',
    category: 'Benefits & Navigation',
    color: 'purple',
    description: 'Centivo is a new kind of health plan for self-funded employers that focuses on high-quality, local primary care.',
    industry: 'Healthcare Services',
    linkedinDescription: 'Centivo is a healthcare company on a mission to make high-quality healthcare affordable for every American. We offer a new kind of health plan for self-funded employers that focuses on high-quality, local primary care. Our model reduces costs for both employers and employees while improving health outcomes.',
    packageContent: 'Centivo partners with leading local health systems to create high-value networks centered around primary care. By removing the middleman and focusing on direct relationships with providers, we are able to offer lower premiums and deductibles without sacrificing quality of care.',
    features: ['Care Navigation', 'Primary Care Centric', 'Lower Deductibles', 'Direct Provider Contracting', 'Member Advocacy'],
    websiteUrl: 'https://centivo.com',
    integrationType: 'Carrier Sync',
    subCategory: 'Health Plan',
    bestFitFor: 'Self-funded employers looking for an alternative to traditional national carriers.',
    pairsWellWith: 'Springbuk and MultiPlan.'
  },
  {
    id: 's4',
    name: 'Betterment at Work',
    category: 'Financial & Retirement',
    color: 'pink',
    description: 'Betterment provides a full-service 401(k) and financial wellness platform designed for the modern workforce.',
    industry: 'Financial Technology',
    linkedinDescription: 'Betterment at Work is a financial wellness platform that helps employees save for retirement and manage their money. We offer a full-service 401(k) with automated administration, low fees, and personalized financial advice for every employee.',
    packageContent: 'Betterment at Work combines a modern 401(k) with a suite of financial wellness tools, including student loan management, emergency savings accounts, and 1-on-1 financial coaching. Our platform is designed to be easy for HR to manage and engaging for employees to use.',
    features: ['Robo-Advisory', 'Low Fee 401(k)', 'Financial Coaching', 'Student Loan Management', 'Emergency Savings'],
    websiteUrl: 'https://betterment.com',
    integrationType: 'Payroll Link',
    subCategory: 'Retirement / 401(k)',
    bestFitFor: 'Modern companies looking for a tech-forward retirement and financial wellness solution.',
    pairsWellWith: 'Rippling, Gusto, and Rain.'
  },
  {
    id: 's5',
    name: 'Ubiquity',
    category: 'Financial & Retirement',
    color: 'pink',
    description: 'Ubiquity Retirement + Savings specializes in offering affordable, simple retirement plans for small and mid-sized businesses.',
    industry: 'Retirement Services',
    linkedinDescription: 'Ubiquity Retirement + Savings is a leading provider of retirement plans for small and mid-sized businesses. We offer flat-fee pricing and automated administration to make it easy and affordable for any company to offer a 401(k).',
    packageContent: 'Ubiquity provides a range of retirement solutions, including 401(k), 403(b), and Solo 401(k) plans. Our focus on transparent pricing and exceptional customer support makes us a top choice for growing companies.',
    features: ['Transparent Pricing', 'Custom Plan Design', 'Compliance Support', 'Automated Administration', 'Dedicated Support'],
    websiteUrl: 'https://myubiquity.com',
    integrationType: 'Direct File Transfer',
    subCategory: 'Retirement / 401(k)',
    bestFitFor: 'Small to mid-sized businesses seeking a simple, flat-fee retirement solution.',
    pairsWellWith: 'Any major payroll provider.'
  },
  {
    id: 's6',
    name: 'Rippling',
    category: 'HR/Payroll/PEO',
    color: 'green',
    description: 'Rippling is the first way for businesses to manage all of their HR, IT, and Finance in one unified platform.',
    industry: 'Business Software',
    linkedinDescription: 'Rippling is the first way for businesses to manage all of their HR, IT, and Finance—globally—in one unified platform. By connecting every business system to a single source of truth for employee data, Rippling automates the manual work of running a business.',
    packageContent: 'Rippling allows you to manage payroll, benefits, computers, and apps all in one place. When you hire someone, you can click a button to set up their payroll, health insurance, work computer, and third-party apps like Slack and Zoom in seconds.',
    features: ['Global Payroll', 'Device Management', 'Automated Onboarding', 'Benefits Administration', 'App Management'],
    websiteUrl: 'https://rippling.com',
    integrationType: 'Full Platform',
    subCategory: 'HRIS / Payroll',
    bestFitFor: 'Companies looking to consolidate their HR, IT, and Finance tech stack.',
    pairsWellWith: 'Betterment at Work, Rain, and Lively.'
  },
  {
    id: 's7',
    name: 'Lively',
    category: 'Financial & Retirement',
    color: 'pink',
    description: 'Lively is a modern HSA & FSA provider that prioritizes a great user experience for both employers and employees.',
    industry: 'Financial Services',
    linkedinDescription: 'Lively is a modern HSA and FSA provider that helps individuals and families prepare for the future. We offer a user-friendly platform with no hidden fees and a focus on helping members save and invest for their healthcare needs.',
    packageContent: 'Lively provides a seamless experience for both employers and employees, with automated contributions, easy claims processing, and a powerful mobile app. Our HSAs are interest-bearing and offer a range of investment options to help members grow their savings.',
    features: ['Interest-Bearing HSAs', 'Easy FSA Claims', 'Mobile App Access', 'No Hidden Fees', 'Investment Options'],
    websiteUrl: 'https://livelyme.com',
    integrationType: 'API Integration',
    subCategory: 'HSA / FSA',
    bestFitFor: 'Employers looking for a modern, low-fee HSA/FSA solution.',
    pairsWellWith: 'Rocket Health and Rippling.'
  },
  {
    id: 's8',
    name: 'MultiPlan',
    category: 'Technology & Platforms',
    color: 'gray',
    description: 'MultiPlan delivers healthcare cost management solutions that leverage analytics and provider networks.',
    industry: 'Healthcare Technology',
    linkedinDescription: 'MultiPlan is a leading provider of healthcare cost management solutions. We leverage data analytics and an extensive provider network to help healthcare payers and employers reduce costs and improve the efficiency of their health plans.',
    packageContent: 'MultiPlan offers a range of solutions, including network access, medical reimbursement analysis, and payment integrity services. Our data-driven approach helps you identify savings opportunities and ensure that you are paying the right price for healthcare services.',
    features: ['Network Access', 'Claim Pricing', 'Payment Integrity', 'Data Analytics', 'Cost Management'],
    websiteUrl: 'https://multiplan.com',
    integrationType: 'Data Exchange',
    subCategory: 'Cost Management',
    bestFitFor: 'Self-funded employers looking to optimize their healthcare spend.',
    pairsWellWith: 'Springbuk and Centivo.'
  },
  {
    id: 's9',
    name: 'Guideline',
    category: 'Financial & Retirement',
    color: 'pink',
    description: 'Guideline makes it easy and affordable for small businesses to offer a 401(k) with automated administration.',
    industry: 'Financial Services',
    linkedinDescription: 'Guideline is a modern retirement platform that helps small businesses offer a 401(k) to their employees. We offer automated administration, low fees, and a range of investment options to help employees save for the future.',
    packageContent: 'Guideline simplifies the process of offering a 401(k) by automating the heavy lifting of plan administration and compliance. Our platform integrates with major payroll providers and offers a simple, intuitive experience for both employers and employees.',
    features: ['Auto-Enrollment', '0% Investment Fees', 'Integrated Payroll', 'Automated Compliance', 'Simple Employee Onboarding'],
    websiteUrl: 'https://guideline.com',
    integrationType: 'Sync+ Integration',
    subCategory: 'Retirement / 401(k)',
    bestFitFor: 'Small businesses looking for an easy-to-manage, low-cost 401(k) solution.',
    pairsWellWith: 'Gusto and Rippling.'
  },
  {
    id: 's10',
    name: 'Gusto',
    category: 'HR/Payroll/PEO',
    color: 'green',
    description: 'Gusto is an all-in-one platform that helps businesses onboard, pay, insure, and support their teams.',
    industry: 'Business Software',
    linkedinDescription: 'Gusto is a modern HR platform that helps small businesses manage their teams. We offer automated payroll, health insurance administration, and a range of HR tools to help you support your employees.',
    packageContent: 'Gusto provides a single platform for all your HR needs, from hiring and onboarding to payroll and benefits. Our intuitive interface and automated workflows make it easy to manage your team and stay compliant.',
    features: ['Automated Payroll', 'Health Insurance Admin', 'Hiring & Onboarding', 'Time Tracking', 'Employee Benefits'],
    websiteUrl: 'https://gusto.com',
    integrationType: 'Partner API',
    subCategory: 'HRIS / Payroll',
    bestFitFor: 'Small businesses looking for an all-in-one HR and payroll solution.',
    pairsWellWith: 'Betterment at Work, Guideline, and Rain.'
  },
  {
    id: 's11',
    name: 'Justworks',
    category: 'HR/Payroll/PEO',
    color: 'green',
    description: 'Justworks provides small businesses with access to corporate-level benefits, seamless payroll, and HR support.',
    industry: 'Professional Employer Organization (PEO)',
    linkedinDescription: 'Justworks is a PEO that helps small businesses grow by providing access to corporate-level benefits, seamless payroll, and HR support. We handle the complexities of employment so you can focus on running your business.',
    packageContent: 'Justworks provides a comprehensive PEO solution that includes payroll, benefits, compliance, and HR support. By joining our co-employment model, you can access better rates on health insurance and other benefits for your team.',
    features: ['PEO Services', 'Compliance Monitoring', 'Group Insurance', 'Payroll & Tax Filing', 'HR Support'],
    websiteUrl: 'https://justworks.com',
    integrationType: 'Full Service',
    subCategory: 'PEO',
    bestFitFor: 'Small businesses looking for a comprehensive PEO solution to manage their HR and benefits.',
    pairsWellWith: 'Any specialty benefit provider.'
  },
  {
    id: 's12',
    name: 'Beam Dental',
    category: 'Insurance (Health / Ancillary / Property)',
    color: 'blue',
    description: 'Beam is a digital-first dental insurer that uses technology to reward healthy habits and simplify benefits.',
    industry: 'Insurance Technology',
    linkedinDescription: 'Beam is a digital-first dental insurer that uses technology to reward healthy habits and simplify benefits. We offer a unique "Smart Toothbrush" that helps members track their oral health and earn rewards for good habits.',
    packageContent: 'Beam provides a modern dental benefit experience with a focus on prevention and technology. Our plans are easy to manage and offer a range of features, including a mobile app for provider search and digital claims processing.',
    features: ['Smart Toothbrush', 'Adjustable Premiums', 'Digital Claims', 'Provider Search App', 'Prevention Rewards'],
    websiteUrl: 'https://beam.dental',
    integrationType: 'Real-time Sync',
    subCategory: 'Dental Insurance',
    bestFitFor: 'Tech-forward companies looking for a modern, engaging dental benefit.',
    pairsWellWith: 'Rocket Health and Visionary Plus.'
  }
];
