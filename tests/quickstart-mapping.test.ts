import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapQuickStartFormToSupabasePayloads,
  validateQuickStartRequiredFields,
} from "../lib/mappings/quickStartMapping";

const BASE_VALID = {
  firstName: "Jane",
  lastName: "Doe",
  title: "HR Director",
  phone: "555-1234",
  email: "jane@acme.com",
  companyName: "Acme Corp",
  benefitEligibleEmployees: "50",
  ndaRequested: "Yes",
};

const NOW = "2026-01-15T00:00:00.000Z";
const OPTS = { nowISO: NOW, companyId: "company-123" };

// ─── Validation ──────────────────────────────────────────────────────────────

describe("validateQuickStartRequiredFields", () => {
  it("passes with all required fields present", () => {
    assert.equal(validateQuickStartRequiredFields(BASE_VALID), true);
  });

  it("fails when firstName is missing", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE_VALID, firstName: "" }), false);
  });

  it("fails when email is null", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE_VALID, email: null }), false);
  });

  it("fails when companyName is whitespace only", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE_VALID, companyName: "   " }), false);
  });

  it("fails when ndaRequested is missing", () => {
    const { ndaRequested: _, ...rest } = BASE_VALID as any;
    assert.equal(validateQuickStartRequiredFields(rest), false);
  });

  it("fails on completely empty form", () => {
    assert.equal(validateQuickStartRequiredFields({}), false);
  });
});

// ─── benefit_classes / PEO ────────────────────────────────────────────────────

describe("benefit_class_notes (PEO / package conditions)", () => {
  it("is a string when PEO fields are filled", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, companyPackageConditions: ["None of the Above"], usesPeo: "Yes", peoUsed: "Justworks", peosEvaluated: ["TriNet"] },
      OPTS
    );
    const notes = result.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;
    assert.equal(typeof notes, "string", "benefitClassNotes should be a string");
    assert.ok(notes.includes("None of the Above"));
    assert.ok(notes.includes("uses_peo: Yes"));
    assert.ok(notes.includes("peo_used: Justworks"));
    assert.ok(notes.includes("peos_evaluated: TriNet"));
  });

  it("is null when no PEO or package conditions provided", () => {
    const result = mapQuickStartFormToSupabasePayloads({ ...BASE_VALID }, OPTS);
    assert.equal(result.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes, null);
  });

  it("handles multiple peosEvaluated joined with pipe", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, peosEvaluated: ["TriNet", "Rippling", "Gusto"], usesPeo: "Yes" },
      OPTS
    );
    const notes: string = result.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;
    const peoEntry = notes.split("\n").find((n: string) => n.startsWith("peos_evaluated:"));
    assert.ok(peoEntry?.includes("TriNet"));
    assert.ok(peoEntry?.includes("Rippling"));
    assert.ok(peoEntry?.includes("Gusto"));
  });
});

// ─── Benefits / Plans ─────────────────────────────────────────────────────────

describe("plan payloads based on benefitsOffered", () => {
  it("creates medical_plans when Medical is selected", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"] },
      OPTS
    );
    assert.ok(result.medical_plans !== null);
    assert.equal(result.dental_plans, null);
    assert.equal(result.vision_plans, null);
  });

  it("creates dental_plans when Dental is selected", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Dental"] },
      OPTS
    );
    assert.equal(result.medical_plans, null);
    assert.ok(result.dental_plans !== null);
    assert.equal(result.vision_plans, null);
  });

  it("creates vision_plans when Vision is selected", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Vision"] },
      OPTS
    );
    assert.equal(result.medical_plans, null);
    assert.equal(result.dental_plans, null);
    assert.ok(result.vision_plans !== null);
  });

  it("creates all three plans when Medical, Dental, Vision are selected", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical", "Dental", "Vision"] },
      OPTS
    );
    assert.ok(result.medical_plans !== null);
    assert.ok(result.dental_plans !== null);
    assert.ok(result.vision_plans !== null);
  });

  it("creates no plans when benefitsOffered is empty", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: [] },
      OPTS
    );
    assert.equal(result.medical_plans, null);
    assert.equal(result.dental_plans, null);
    assert.equal(result.vision_plans, null);
  });

  it("creates no plans when benefitsOffered is missing", () => {
    const result = mapQuickStartFormToSupabasePayloads({ ...BASE_VALID }, OPTS);
    assert.equal(result.medical_plans, null);
    assert.equal(result.dental_plans, null);
    assert.equal(result.vision_plans, null);
  });

  it("deduplicates benefitsOffered", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical", "Medical", "Dental"] },
      OPTS
    );
    assert.ok(result.medical_plans !== null);
    assert.ok(result.dental_plans !== null);
  });

  it("benefits payload is null when no recognized line of coverage selected", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Unknown Plan Type"] },
      OPTS
    );
    assert.equal(result.benefits, null);
  });
});

// ─── Full submitted example ──────────────────────────────────────────────────

describe("Think of Us quick start example", () => {
  it("normalizes admin-facing rows and keeps a complete snapshot", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      {
        firstName: "Sarah",
        lastName: "Chen",
        title: "Director of People Operations",
        phone: "(415) 555-7823",
        email: "sarah.chen@thinkofus.org",
        companyName: "Think of Us Test",
        address: "1201 Connecticut Ave NW, Suite 200",
        city: "Washington",
        stateProvince: "District of Columbia",
        zipCode: "20036",
        ein: "81-3456789",
        yearCompanyFounded: "2018",
        preferredSicCode: "8322",
        preferredNaicsCode: "624190",
        benefitEligibleEmployees: "25 - 49",
        estimatedBenefitEligibleEes: "28",
        estimatedMedicalEnrolledEes: "25",
        expectedHeadcountGrowth: "30",
        ndaRequested: "yes",
        ndaCompanyLegalName: "Think of Us Test LLC",
        entityType: "Limited Liability Company (LLC)",
        stateOfFormation: "District of Columbia",
        ndaSigner: "yes",
        benefitsOffered: ["Vision", "Medical", "Dental"],
        medicalBenefitOfferType: "Level Funded",
        medicalContributionStrategy: "Percentage Employer Contribution",
        usesPeo: "Yes",
        peosEvaluated: ["ADP TotalSource", "Insperity"],
        payrollProvider: "Gusto",
        payrollFrequency: "Semi-monthly",
        benefitDeductionFrequency: "Semi-Monthly",
        companyPackageConditions: ["Multiple Eligibility Classes", "Additional Entities", "Additional Locations"],
        companyPackageConditionsDetails: "Additional Entities Additional Locations Multiple Eligibility Classes",
        idealMedicalPlanCount: "3",
        desiredPlanTypes: ["HDHP with HSA (Gold)", "HDHP with HSA (Bronze)", "PPO (Bronze)"],
        importanceRatings: {
          "Total Cost": "Very Important",
          "Value for Money": "Very Important",
        },
        painPoints: [
          "Lack of integration between HR and benefits systems of record",
          "Too many carrier and vendor portals to manage",
          "Open enrollment workload",
        ],
        questionnaireOpenness: "Open to it if it is only for a few employees",
        employeeFeedbackPreference: "Interested for the future or when the timing is right",
        uploadedDocuments: [{ id: "doc-1", documentType: "Invoice", fileName: "invoice.pdf", status: "Completed" }],
      },
      OPTS
    );

    assert.equal(result.companies.company_name, "Think of Us Test");
    assert.equal(result.companies.sic_code, "8322");
    assert.equal(result.companies.naics_code, "624190");
    assert.deepEqual(result.users, {
      company_id: "company-123",
      first_name: "Sarah",
      last_name: "Chen",
      email: "sarah.chen@thinkofus.org",
      job_title: "Director of People Operations",
      updated_at: NOW,
    });
    assert.equal(result.contacts.client_contacts, "Sarah Chen");
    assert.equal(result.contacts.phone, "(415) 555-7823");
    assert.equal(result.entities.entity_legal_name, "Think of Us Test LLC");
    assert.equal(result.entities.entity_type, "Limited Liability Company (LLC)");
    assert.equal(result.entities.state_of_formation, "District of Columbia");
    assert.equal(result.entities.ein, "81-3456789");
    assert.equal(result.locations.address_street, "1201 Connecticut Ave NW, Suite 200");
    assert.equal(result.locations.state, "District of Columbia");
    assert.equal(result.benefits?.calendar_year, "2018-01-01");
    assert.equal(result.contribution_strategies.contribution_type, "Percentage Employer Contribution");
    assert.equal(result.medical_plans.plan_type, "HDHP");
    assert.ok(result.dental_plans);
    assert.ok(result.vision_plans);

    const snapshot = result.documents_and_artifacts[0].metadata.snapshot;
    assert.equal(snapshot.estimatedBenefitEligibleEes, "28");
    assert.equal(snapshot.estimatedMedicalEnrolledEes, "25");
    assert.deepEqual(snapshot.painPoints, [
      "Lack of integration between HR and benefits systems of record",
      "Too many carrier and vendor portals to manage",
      "Open enrollment workload",
    ]);
    assert.equal(result.documents_and_artifacts[1].document_type, "Invoice");
    assert.equal(result.documents_and_artifacts[1].file_name, "invoice.pdf");
  });
});

// ─── Medical plan shape parsing ───────────────────────────────────────────────

describe("medical plan type detection from desiredPlanTypes", () => {
  it("detects PPO", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], desiredPlanTypes: ["PPO Gold"] },
      OPTS
    );
    assert.equal(result.medical_plans.plan_type, "PPO");
    assert.equal(result.medical_plans.metallic_level, "Gold");
  });

  it("detects HMO", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], desiredPlanTypes: ["HMO Silver"] },
      OPTS
    );
    assert.equal(result.medical_plans.plan_type, "HMO");
    assert.equal(result.medical_plans.metallic_level, "Silver");
  });

  it("detects HDHP and marks hsa_qualified when HSA mentioned", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], desiredPlanTypes: ["HDHP + HSA"] },
      OPTS
    );
    assert.equal(result.medical_plans.plan_type, "HDHP");
    assert.equal(result.medical_plans.hsa_qualified, "yes");
  });

  it("returns null plan_type when only noise options selected", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], desiredPlanTypes: ["Not Sure", "Other"] },
      OPTS
    );
    assert.equal(result.medical_plans.plan_type, null);
    assert.equal(result.medical_plans.metallic_level, null);
  });

  it("returns null plan_type when desiredPlanTypes is empty", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], desiredPlanTypes: [] },
      OPTS
    );
    assert.equal(result.medical_plans.plan_type, null);
  });

  it("uses medicalBenefitOfferTypeOther as plan_name_client when provided", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], medicalBenefitOfferType: "Other", medicalBenefitOfferTypeOther: "Level Funded" },
      OPTS
    );
    assert.equal(result.medical_plans.plan_name_client, "Level Funded");
    assert.equal(result.medical_plans.network_type, "Other");
  });

  it("falls back to default plan name when no otherText", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"] },
      OPTS
    );
    assert.equal(result.medical_plans.plan_name_client, "Quick Start - Medical Plan");
  });
});

// ─── Contribution strategy ────────────────────────────────────────────────────

describe("contribution_strategies", () => {
  it("sets er_contribution when strategy contains 'employer'", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, medicalContributionStrategy: "Employer Defined", contributionToEmployee: "80%" },
      OPTS
    );
    assert.equal(result.contribution_strategies.er_contribution, "80%");
  });

  it("does not set er_contribution when strategy does not contain 'employer'", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, medicalContributionStrategy: "Employee Choice", contributionToEmployee: "80%" },
      OPTS
    );
    assert.equal(result.contribution_strategies.er_contribution, null);
  });

  it("normalizes percentageAppliesOnlyBasePlan Yes -> 'yes'", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, percentageAppliesOnlyBasePlan: "Yes" },
      OPTS
    );
    assert.equal(result.contribution_strategies.buyup_strategy, "yes");
  });

  it("normalizes percentageAppliesOnlyBasePlan No -> 'no'", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, percentageAppliesOnlyBasePlan: "No" },
      OPTS
    );
    assert.equal(result.contribution_strategies.buyup_strategy, "no");
  });

  it("returns null buyup_strategy when percentageAppliesOnlyBasePlan is not set", () => {
    const result = mapQuickStartFormToSupabasePayloads({ ...BASE_VALID }, OPTS);
    assert.equal(result.contribution_strategies.buyup_strategy, null);
  });
});

// ─── Company name fallback ────────────────────────────────────────────────────

describe("company_name fallback", () => {
  it("uses companyName when present", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, companyName: "Acme", ndaCompanyLegalName: "Acme Legal LLC" },
      OPTS
    );
    assert.equal(result.companies.company_name, "Acme");
  });

  it("falls back to ndaCompanyLegalName when companyName is null", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, companyName: null, ndaCompanyLegalName: "Acme Legal LLC" },
      OPTS
    );
    assert.equal(result.companies.company_name, "Acme Legal LLC");
  });

  it("is null when both companyName and ndaCompanyLegalName are absent", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, companyName: null },
      OPTS
    );
    assert.equal(result.companies.company_name, null);
  });
});

// ─── Whitespace / null hygiene ────────────────────────────────────────────────

describe("whitespace and null normalization", () => {
  it("treats whitespace-only strings as null", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, companyName: "   " },
      OPTS
    );
    assert.equal(result.companies.company_name, null);
  });

  it("trims leading and trailing whitespace", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, companyName: "  Acme  " },
      OPTS
    );
    assert.equal(result.companies.company_name, "Acme");
  });

  it("normalizeChoiceWithOther returns 'Other' when choice is Other but otherText is blank", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], medicalBenefitOfferType: "Other", medicalBenefitOfferTypeOther: "   " },
      OPTS
    );
    // plan_type should fall back to "Other" string (via medicalBenefitOfferType)
    assert.equal(result.medical_plans.network_type, "Other");
  });
});

// ─── Uploaded documents ───────────────────────────────────────────────────────

describe("uploaded documents", () => {
  it("adds one extra document row per uploaded file", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      {
        ...BASE_VALID,
        uploadedDocuments: [
          { id: "doc-1", documentType: "Census", fileName: "census.xlsx", status: "Completed" },
          { id: "doc-2", documentType: "Benefit Guide", fileName: "guide.pdf", status: "Completed" },
        ],
      },
      OPTS
    );
    // 1 snapshot row + 2 upload rows
    assert.equal(result.documents_and_artifacts.length, 3);
    assert.equal(result.documents_and_artifacts[1].document_type, "Census");
    assert.equal(result.documents_and_artifacts[2].document_type, "Benefit Guide");
  });

  it("does not add extra rows when uploadedDocuments is empty", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, uploadedDocuments: [] },
      OPTS
    );
    assert.equal(result.documents_and_artifacts.length, 1);
  });

  it("does not add extra rows when uploadedDocuments is missing", () => {
    const result = mapQuickStartFormToSupabasePayloads({ ...BASE_VALID }, OPTS);
    assert.equal(result.documents_and_artifacts.length, 1);
  });

  it("document row status defaults to Completed when status is null", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, uploadedDocuments: [{ id: "doc-1", documentType: "Census", fileName: "f.csv", status: null }] },
      OPTS
    );
    assert.equal(result.documents_and_artifacts[1].status, "Completed");
  });
});

// ─── companies payload integrity ──────────────────────────────────────────────

describe("year / date normalization", () => {
  it("converts bare year to YYYY-01-01 for calendar_year", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical"], yearCompanyFounded: "2010" },
      OPTS
    );
    assert.ok(result.benefits !== null);
    assert.equal(result.benefits.calendar_year, "2010-01-01");
  });

  it("calendar_year in benefits payload is a valid date string", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Dental"], yearCompanyFounded: "2015" },
      OPTS
    );
    // Dental triggers a valid line of coverage so benefits should be non-null
    assert.ok(result.benefits !== null);
    assert.equal(result.benefits.calendar_year, "2015-01-01");
  });

  it("calendar_year passes through a full date string unchanged", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Dental"], yearCompanyFounded: "2018-03-15" },
      OPTS
    );
    assert.ok(result.benefits !== null);
    assert.equal(result.benefits.calendar_year, "2018-03-15");
  });

  it("calendar_year is null when yearCompanyFounded is missing", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Dental"] },
      OPTS
    );
    assert.ok(result.benefits !== null);
    assert.equal(result.benefits.calendar_year, null);
  });
});

describe("companies payload", () => {
  it("always sets customer_status to Prospect", () => {
    const result = mapQuickStartFormToSupabasePayloads({ ...BASE_VALID }, OPTS);
    assert.equal(result.companies.customer_status, "Prospect");
  });

  it("carries companyId through to all sub-payloads", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE_VALID, benefitsOffered: ["Medical", "Dental", "Vision"] },
      OPTS
    );
    assert.equal(result.companies.id, "company-123");
    assert.equal(result.users.company_id, "company-123");
    assert.equal(result.locations.company_id, "company-123");
    assert.equal(result.medical_plans.company_id, "company-123");
    assert.equal(result.dental_plans.company_id, "company-123");
    assert.equal(result.vision_plans.company_id, "company-123");
    assert.equal(result.documents_and_artifacts[0].company_id, "company-123");
  });

  it("uses a fresh nowISO when none is provided", () => {
    const before = Date.now();
    const result = mapQuickStartFormToSupabasePayloads({ ...BASE_VALID }, { companyId: "c1" });
    const after = Date.now();
    const ts = new Date(result.companies.updated_at).getTime();
    assert.ok(ts >= before && ts <= after, "updated_at should be current time");
  });
});
