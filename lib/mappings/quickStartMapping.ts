const NOISE_PLAN_OPTIONS = new Set(["Not Sure", "Other"]);

function normalizeText(value: any): string | null {
  if (value == null) return null;
  const cleaned = String(value).trim();
  return cleaned.length ? cleaned : null;
}

function normalizeList(values: any): string[] {
  if (!Array.isArray(values)) return [];
  const cleaned = values
    .map((v) => normalizeText(v))
    .filter(Boolean) as string[];
  return Array.from(new Set(cleaned));
}

function normalizeChoiceWithOther(choice: any, otherText: any): string | null {
  if (choice === "Other") {
    return normalizeText(otherText) ?? "Other";
  }
  return normalizeText(choice);
}

function normalizeBooleanWord(value: any): string | null {
  const text = normalizeText(value)?.toLowerCase();
  if (text === "yes") return "yes";
  if (text === "no") return "no";
  return null;
}

function parseMedicalPlanShape(desiredPlanTypes: string[] = []) {
  const preferred = desiredPlanTypes.find((p) => !NOISE_PLAN_OPTIONS.has(p));
  if (!preferred) return null;

  const metallic = /(bronze|silver|gold)/i.exec(preferred)?.[1] ?? null;

  return {
    plan_type: /hmo/i.test(preferred)
      ? "HMO"
      : /ppo/i.test(preferred)
        ? "PPO"
        : /hdhp/i.test(preferred)
          ? "HDHP"
          : null,
    metallic_level: metallic ? `${metallic[0].toUpperCase()}${metallic.slice(1).toLowerCase()}` : null,
    hsa_qualified: /hsa/i.test(preferred) ? "yes" : null,
  };
}

function listToSentence(values: any): string | null {
  const list = normalizeList(values);
  return list.length ? list.join(", ") : null;
}

function buildSubmissionSnapshot(form: any) {
  return {
    firstName: normalizeText(form.firstName),
    lastName: normalizeText(form.lastName),
    title: normalizeText(form.title),
    phone: normalizeText(form.phone),
    email: normalizeText(form.email),
    companyName: normalizeText(form.companyName),
    address: normalizeText(form.address),
    city: normalizeText(form.city),
    stateProvince: normalizeText(form.stateProvince),
    zipCode: normalizeText(form.zipCode),
    ein: normalizeText(form.ein),
    yearCompanyFounded: normalizeText(form.yearCompanyFounded),
    preferredSicCode: normalizeText(form.preferredSicCode),
    preferredNaicsCode: normalizeText(form.preferredNaicsCode),
    benefitEligibleEmployees: normalizeText(form.benefitEligibleEmployees),
    estimatedBenefitEligibleEes: normalizeText(form.estimatedBenefitEligibleEes),
    estimatedMedicalEnrolledEes: normalizeText(form.estimatedMedicalEnrolledEes),
    expectedHeadcountGrowth: normalizeText(form.expectedHeadcountGrowth),
    ndaRequested: normalizeText(form.ndaRequested),
    ndaCompanyLegalName: normalizeText(form.ndaCompanyLegalName),
    entityType: normalizeText(form.entityType),
    stateOfFormation: normalizeText(form.stateOfFormation),
    ndaSigner: normalizeText(form.ndaSigner),
    benefitsOffered: normalizeList(form.benefitsOffered),
    benefitsOtherText: normalizeText(form.benefitsOtherText),
    medicalBenefitOfferType: normalizeText(form.medicalBenefitOfferType),
    medicalBenefitOfferTypeOther: normalizeText(form.medicalBenefitOfferTypeOther),
    medicalContributionStrategy: normalizeText(form.medicalContributionStrategy),
    contributionToEmployee: normalizeText(form.contributionToEmployee),
    contributionToDependents: normalizeText(form.contributionToDependents),
    percentageAppliesOnlyBasePlan: normalizeText(form.percentageAppliesOnlyBasePlan),
    contributionStrategyDescription: normalizeText(form.contributionStrategyDescription),
    usesPeo: normalizeText(form.usesPeo),
    peoUsed: normalizeText(form.peoUsed),
    peosEvaluated: normalizeList(form.peosEvaluated),
    payrollProvider: normalizeText(form.payrollProvider),
    payrollFrequency: normalizeText(form.payrollFrequency),
    benefitDeductionFrequency: normalizeText(form.benefitDeductionFrequency),
    companyPackageConditions: normalizeList(form.companyPackageConditions),
    companyPackageConditionsDetails: normalizeText(form.companyPackageConditionsDetails),
    idealMedicalPlanCount: normalizeText(form.idealMedicalPlanCount),
    desiredPlanTypes: normalizeList(form.desiredPlanTypes),
    importanceRatings: form.importanceRatings ?? {},
    painPoints: normalizeList(form.painPoints),
    questionnaireOpenness: normalizeText(form.questionnaireOpenness),
    employeeFeedbackPreference: normalizeText(form.employeeFeedbackPreference),
    benefitsNotes: normalizeText(form.benefitsNotes),
    uploadedDocuments: Array.isArray(form.uploadedDocuments)
      ? form.uploadedDocuments.map((doc: any) => ({
          id: normalizeText(doc.id),
          documentType: normalizeText(doc.documentType),
          fileName: normalizeText(doc.fileName),
          status: normalizeText(doc.status),
        }))
      : [],
  };
}

function buildBenefitClasses(form: any) {
  const tokens = [
    ...normalizeList(form.companyPackageConditions),
    normalizeText(form.companyPackageConditionsDetails),
    normalizeText(form.usesPeo) ? `uses_peo: ${normalizeText(form.usesPeo)}` : null,
    normalizeText(form.peoUsed) ? `peo_used: ${normalizeText(form.peoUsed)}` : null,
    normalizeList(form.peosEvaluated).length
      ? `peos_evaluated: ${normalizeList(form.peosEvaluated).join(" | ")}`
      : null,
  ].filter(Boolean) as string[];

  return tokens.length ? tokens : null;
}

export function mapQuickStartFormToSupabasePayloads(form: any, options: { nowISO?: string; companyId?: string } = {}) {
  const nowISO = options.nowISO || new Date().toISOString();
  const companyId = normalizeText(options.companyId);
  const selectedBenefits = normalizeList(form.benefitsOffered);
  const desiredPlanTypes = normalizeList(form.desiredPlanTypes);
  const medicalShape = parseMedicalPlanShape(desiredPlanTypes);
  const medicalBenefitOfferType = normalizeChoiceWithOther(
    form.medicalBenefitOfferType,
    form.medicalBenefitOfferTypeOther
  );

  const payloads: any = {
    companies: {
      id: companyId,
      company_name: normalizeText(form.companyName) ?? normalizeText(form.ndaCompanyLegalName),
      sic_code: normalizeText(form.preferredSicCode),
      naics_code: normalizeText(form.preferredNaicsCode),
      payroll_platform: normalizeText(form.payrollProvider),
      customer_status: "quick_start_submitted",
      updated_at: nowISO,
    },

    users: {
      company_id: companyId,
      first_name: normalizeText(form.firstName),
      last_name: normalizeText(form.lastName),
      email: normalizeText(form.email),
      job_title: normalizeText(form.title),
      updated_at: nowISO,
    },

    locations: {
      company_id: companyId,
      address_street: normalizeText(form.address),
      city: normalizeText(form.city),
      state: normalizeText(form.stateProvince),
      zip_code: normalizeText(form.zipCode),
      primary_location: "yes",
      updated_at: nowISO,
    },

    benefits: {
      company_id: companyId,
      line_of_coverage: listToSentence([
        ...selectedBenefits,
        normalizeText(form.benefitsOtherText),
      ]),
      benefit_classes: buildBenefitClasses(form),
      calendar_year: normalizeText(form.yearCompanyFounded),
      updated_at: nowISO,
    },

    contribution_strategies: {
      company_id: companyId,
      contribution_type: normalizeText(form.medicalContributionStrategy),
      ee_contribution: normalizeText(form.contributionToEmployee),
      dep_contribution: normalizeText(form.contributionToDependents),
      er_contribution: /employer/i.test(form.medicalContributionStrategy || "")
        ? normalizeText(form.contributionToEmployee)
        : null,
      buyup_strategy: normalizeBooleanWord(form.percentageAppliesOnlyBasePlan),
      base_plan: desiredPlanTypes[0] ?? null,
      updated_at: nowISO,
    },

    medical_plans: selectedBenefits.includes("Medical")
      ? {
          company_id: companyId,
          plan_name_client: normalizeText(form.medicalBenefitOfferTypeOther) ?? "Quick Start - Medical Plan",
          plan_type: medicalShape?.plan_type ?? medicalBenefitOfferType,
          metallic_level: medicalShape?.metallic_level ?? null,
          hsa_qualified: medicalShape?.hsa_qualified ?? null,
          network_type: normalizeText(form.medicalBenefitOfferType),
          plan_year: String(new Date(nowISO).getUTCFullYear()),
          base_plan: normalizeBooleanWord(form.percentageAppliesOnlyBasePlan),
          updated_at: nowISO,
        }
      : null,

    dental_plans: selectedBenefits.includes("Dental")
      ? {
          company_id: companyId,
          plan_name_client: "Quick Start - Dental Plan",
          plan_type: "Dental",
          plan_year: String(new Date(nowISO).getUTCFullYear()),
          most_recent: "yes",
          updated_at: nowISO,
        }
      : null,

    vision_plans: selectedBenefits.includes("Vision")
      ? {
          company_id: companyId,
          plan_name_client: "Quick Start - Vision Plan",
          plan_year: String(new Date(nowISO).getUTCFullYear()),
          updated_at: nowISO,
        }
      : null,

    documents_and_artifacts: [
      {
        company_id: companyId,
        document_type: "quick_start_submission",
        file_name: null,
        status: "Completed",
        metadata: {
          source_form: "quick_start_onboarding",
          snapshot: buildSubmissionSnapshot(form),
        },
        updated_at: nowISO,
      },
    ],
  };

  // Keep uploaded documents as 1 row per document
  if (Array.isArray(form.uploadedDocuments) && form.uploadedDocuments.length) {
    payloads.documents_and_artifacts.push(
      ...form.uploadedDocuments.map((doc: any) => ({
        company_id: companyId,
        document_type: normalizeText(doc.documentType),
        file_name: normalizeText(doc.fileName),
        status: normalizeText(doc.status) ?? "Completed",
        metadata: {
          source_form: "quick_start_onboarding",
          intake_notes: normalizeText(form.benefitsNotes),
          upload: {
            id: normalizeText(doc.id),
            documentType: normalizeText(doc.documentType),
            fileName: normalizeText(doc.fileName),
            status: normalizeText(doc.status) ?? "Completed",
          },
        },
        updated_at: nowISO,
      }))
    );
  }

  return payloads;
}

export function validateQuickStartRequiredFields(form: any) {
  const required = [
    "firstName",
    "lastName",
    "title",
    "phone",
    "email",
    "companyName",
    "benefitEligibleEmployees",
    "ndaRequested",
  ];

  return required.every((key) => Boolean(normalizeText(form[key])));
}
