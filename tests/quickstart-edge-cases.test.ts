/**
 * Extended edge-case tests for mapQuickStartFormToSupabasePayloads and
 * validateQuickStartRequiredFields. Covers scenarios not already present in
 * quickstart-mapping.test.ts or quickstart-mapping-deep.test.ts.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapQuickStartFormToSupabasePayloads,
  validateQuickStartRequiredFields,
} from "../lib/mappings/quickStartMapping";

const NOW = "2026-06-15T10:00:00.000Z";
const OPTS = { nowISO: NOW, companyId: "cmp-test" };

const BASE = {
  firstName: "Alex",
  lastName: "Smith",
  title: "Benefits Manager",
  phone: "555-9999",
  email: "alex@example.com",
  companyName: "TestCo",
  benefitEligibleEmployees: "100",
  ndaRequested: "Yes",
};

// ─── 1. normalizeYearToDate — extended calendar boundaries ───────────────────

describe("normalizeYearToDate — extended boundary cases", () => {
  const yr = (v: any, offered = ["Dental"]) =>
    mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: offered, yearCompanyFounded: v },
      OPTS
    ).benefits?.calendar_year ?? null;

  it("historic year 1800 is expanded to 1800-01-01", () => {
    assert.equal(yr("1800"), "1800-01-01");
  });

  it("future year 2099 is expanded to 2099-01-01", () => {
    assert.equal(yr("2099"), "2099-01-01");
  });

  it("year 0000 (4 digit) is expanded to 0000-01-01", () => {
    assert.equal(yr("0000"), "0000-01-01");
  });

  it("zero as number produces null (not 4 digits)", () => {
    assert.equal(yr(0), null);
  });

  it("date 2026-12-31 is valid and passes through", () => {
    assert.equal(yr("2026-12-31"), "2026-12-31");
  });

  it("date 2026-02-28 is valid and passes through", () => {
    assert.equal(yr("2026-02-28"), "2026-02-28");
  });

  it("date 2026-01-00 is rejected (day 0)", () => {
    assert.equal(yr("2026-01-00"), null);
  });

  it("date 2026-00-15 is rejected (month 0)", () => {
    assert.equal(yr("2026-00-15"), null);
  });
});

// ─── 2. medical_plans — extended plan-shape coverage ─────────────────────────

describe("medical_plans — extended parseMedicalPlanShape scenarios", () => {
  const mp = (types: string[], offerType?: string, offerOther?: string) =>
    mapQuickStartFormToSupabasePayloads(
      {
        ...BASE,
        benefitsOffered: ["Medical"],
        desiredPlanTypes: types,
        medicalBenefitOfferType: offerType ?? null,
        medicalBenefitOfferTypeOther: offerOther ?? null,
      },
      OPTS
    ).medical_plans;

  it("PPO Bronze → plan_type PPO, metallic_level Bronze", () => {
    const p = mp(["PPO Bronze"]);
    assert.equal(p.plan_type, "PPO");
    assert.equal(p.metallic_level, "Bronze");
  });

  it("HDHP with HSA (Silver) → plan_type HDHP, metallic Silver, hsa yes", () => {
    const p = mp(["HDHP with HSA (Silver)"]);
    assert.equal(p.plan_type, "HDHP");
    assert.equal(p.metallic_level, "Silver");
    assert.equal(p.hsa_qualified, "yes");
  });

  it("HMO Bronze → plan_type HMO, metallic Bronze", () => {
    const p = mp(["HMO Bronze"]);
    assert.equal(p.plan_type, "HMO");
    assert.equal(p.metallic_level, "Bronze");
  });

  it("PPO (no metallic level) → plan_type PPO, metallic null", () => {
    const p = mp(["PPO"]);
    assert.equal(p.plan_type, "PPO");
    assert.equal(p.metallic_level, null);
  });

  it("HSA only (no plan type keyword) → plan_type null, hsa_qualified yes", () => {
    const p = mp(["HSA"]);
    assert.equal(p.plan_type, null);
    assert.equal(p.hsa_qualified, "yes");
    assert.equal(p.metallic_level, null);
  });

  it("GOLD PPO (all caps) → plan_type PPO, metallic Gold (normalized case)", () => {
    const p = mp(["GOLD PPO"]);
    assert.equal(p.plan_type, "PPO");
    assert.equal(p.metallic_level, "Gold");
  });

  it("network_type is null when medicalBenefitOfferType is not provided", () => {
    const p = mp(["PPO"]);
    assert.equal(p.network_type, null);
  });

  it("network_type equals medicalBenefitOfferType when provided", () => {
    const p = mp([], "Fully Insured");
    assert.equal(p.network_type, "Fully Insured");
  });

  it("plan_name_client defaults to 'Quick Start - Medical Plan' when medicalBenefitOfferType is not Other", () => {
    const p = mp([], "Fully Insured");
    assert.equal(p.plan_name_client, "Quick Start - Medical Plan");
  });

  it("plan_name_client uses otherText when medicalBenefitOfferType is Other", () => {
    const p = mp([], "Other", "Level Funded");
    assert.equal(p.plan_name_client, "Level Funded");
  });

  it("plan_year equals UTC year string from nowISO", () => {
    const p = mp([]);
    assert.equal(p.plan_year, "2026");
  });

  it("plan_year changes with different nowISO", () => {
    const p = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical"] },
      { nowISO: "2027-03-01T00:00:00.000Z", companyId: "c1" }
    ).medical_plans;
    assert.equal(p.plan_year, "2027");
  });
});

// ─── 3. dental and vision plan details ───────────────────────────────────────

describe("dental_plans — structure details", () => {
  const dp = () =>
    mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Dental"] },
      OPTS
    ).dental_plans;

  it("dental plan_number equals 'Quick Start - Dental Plan'", () => {
    assert.equal(dp().plan_number, "Quick Start - Dental Plan");
  });

  it("dental plan_name_client equals 'Quick Start - Dental Plan'", () => {
    assert.equal(dp().plan_name_client, "Quick Start - Dental Plan");
  });

  it("dental plan_type equals 'Dental'", () => {
    assert.equal(dp().plan_type, "Dental");
  });

  it("dental most_recent is always 'yes'", () => {
    assert.equal(dp().most_recent, "yes");
  });

  it("dental plan_year equals UTC year of nowISO", () => {
    assert.equal(dp().plan_year, "2026");
  });

  it("dental company_id propagates from options", () => {
    assert.equal(dp().company_id, "cmp-test");
  });

  it("dental plan null when Medical-only offered", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical"] },
      OPTS
    );
    assert.equal(r.dental_plans, null);
  });
});

describe("vision_plans — structure details", () => {
  const vp = () =>
    mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Vision"] },
      OPTS
    ).vision_plans;

  it("vision plan_number equals 'Quick Start - Vision Plan'", () => {
    assert.equal(vp().plan_number, "Quick Start - Vision Plan");
  });

  it("vision plan_name_client equals 'Quick Start - Vision Plan'", () => {
    assert.equal(vp().plan_name_client, "Quick Start - Vision Plan");
  });

  it("vision plan_year equals UTC year of nowISO", () => {
    assert.equal(vp().plan_year, "2026");
  });

  it("vision company_id propagates from options", () => {
    assert.equal(vp().company_id, "cmp-test");
  });

  it("vision plan null when Dental-only offered", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Dental"] },
      OPTS
    );
    assert.equal(r.vision_plans, null);
  });
});

// ─── 4. contribution_strategies — extended ───────────────────────────────────

describe("contribution_strategies — extended field coverage", () => {
  const cs = (extra: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS)
      .contribution_strategies;

  it("er_contribution set when strategy contains 'Employer' (mixed case)", () => {
    assert.equal(cs({ medicalContributionStrategy: "Employer Choice", contributionToEmployee: "80%" }).er_contribution, "80%");
  });

  it("er_contribution not set when medicalContributionStrategy is null", () => {
    assert.equal(cs({ medicalContributionStrategy: null, contributionToEmployee: "80%" }).er_contribution, null);
  });

  it("er_contribution not set when medicalContributionStrategy is empty string", () => {
    assert.equal(cs({ medicalContributionStrategy: "", contributionToEmployee: "80%" }).er_contribution, null);
  });

  it("er_contribution uses contributionToEmployee, not dep", () => {
    const s = cs({ medicalContributionStrategy: "Employer Paid", contributionToEmployee: "90%", contributionToDependents: "50%" });
    assert.equal(s.er_contribution, "90%");
  });

  it("dep_contribution is set from contributionToDependents", () => {
    assert.equal(cs({ contributionToDependents: "50%" }).dep_contribution, "50%");
  });

  it("ee_contribution is set from contributionToEmployee", () => {
    assert.equal(cs({ contributionToEmployee: "75%" }).ee_contribution, "75%");
  });

  it("contribution_type is set from medicalContributionStrategy", () => {
    assert.equal(cs({ medicalContributionStrategy: "Percentage of Premium" }).contribution_type, "Percentage of Premium");
  });

  it("base_plan uses first non-noise desiredPlanTypes entry", () => {
    assert.equal(cs({ desiredPlanTypes: ["Not Sure", "HMO Gold"] }).base_plan, "HMO Gold");
  });

  it("base_plan null when no desiredPlanTypes provided", () => {
    assert.equal(cs({}).base_plan, null);
  });

  it("company_id propagates into contribution_strategies", () => {
    assert.equal(cs({}).company_id, "cmp-test");
  });
});

// ─── 5. buildBenefitClassNotes — returns string (defensive format) ────────────

describe("buildBenefitClassNotes — string format (defensive fix)", () => {
  const notes = (extra: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS)
      .documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;

  it("is typeof string (not array) when tokens present", () => {
    const n = notes({ usesPeo: "Yes" });
    assert.equal(typeof n, "string");
  });

  it("is null when no relevant fields set", () => {
    assert.equal(notes({}), null);
  });

  it("single token produces single-line string with no newline", () => {
    const n = notes({ usesPeo: "Yes" });
    assert.ok(!n!.includes("\n"));
  });

  it("two tokens are separated by a newline", () => {
    const n = notes({ usesPeo: "Yes", companyPackageConditions: ["Additional Entities"] });
    assert.ok(n!.includes("\n"));
    assert.equal(n!.split("\n").length, 2);
  });

  it("usesPeo full enum value 'No, we have considered but decided against' is preserved in token", () => {
    const n = notes({ usesPeo: "No, we have considered but decided against" });
    assert.ok(n!.includes("uses_peo: No, we have considered but decided against"));
  });

  it("usesPeo 'No, we have never considered a PEO' is preserved", () => {
    const n = notes({ usesPeo: "No, we have never considered a PEO" });
    assert.ok(n!.includes("uses_peo: No, we have never considered a PEO"));
  });

  it("peoUsed token absent when usesPeo is null", () => {
    const n = notes({ peoUsed: "Justworks" });
    assert.ok(!n?.includes("peo_used:"));
  });

  it("peoUsed token absent when peoUsed is empty string", () => {
    const n = notes({ usesPeo: "Yes", peoUsed: "" });
    assert.ok(!n?.includes("peo_used:"));
  });

  it("peoUsed token absent when peoUsed is whitespace-only", () => {
    const n = notes({ usesPeo: "Yes", peoUsed: "   " });
    assert.ok(!n?.includes("peo_used:"));
  });

  it("peos_evaluated token absent when peosEvaluated is empty array", () => {
    const n = notes({ usesPeo: "Yes", peosEvaluated: [] });
    assert.ok(!n?.includes("peos_evaluated:"));
  });

  it("peos_evaluated token absent when peosEvaluated is missing", () => {
    const n = notes({ usesPeo: "Yes" });
    assert.ok(!n?.includes("peos_evaluated:"));
  });

  it("only usesPeo set — produces single token string", () => {
    const n = notes({ usesPeo: "Yes" });
    assert.equal(n, "uses_peo: Yes");
  });

  it("5 PEOs in peosEvaluated all appear separated by pipes", () => {
    const peos = ["TriNet", "Gusto", "Rippling", "Justworks", "ADP TotalSource"];
    const n = notes({ usesPeo: "Yes", peosEvaluated: peos });
    const line = n!.split("\n").find((l: string) => l.startsWith("peos_evaluated:"))!;
    for (const peo of peos) assert.ok(line.includes(peo));
    assert.equal(line.split("|").length, 5);
  });

  it("5+ package conditions all appear in the string", () => {
    const conditions = ["A", "B", "C", "D", "E"];
    const n = notes({ companyPackageConditions: conditions });
    for (const c of conditions) assert.ok(n!.includes(c));
  });

  it("string does not start with a newline", () => {
    const n = notes({ companyPackageConditions: ["Cond1"], usesPeo: "Yes" });
    assert.ok(!n!.startsWith("\n"));
  });

  it("string does not end with a newline", () => {
    const n = notes({ companyPackageConditions: ["Cond1"], usesPeo: "Yes" });
    assert.ok(!n!.endsWith("\n"));
  });

  it("special characters in conditions are preserved (semicolons, pipes)", () => {
    const n = notes({ companyPackageConditions: ["A & B", "C | D; E"] });
    assert.ok(n!.includes("A & B"));
    assert.ok(n!.includes("C | D; E"));
  });

  it("companyPackageConditions as non-array string (type coercion) produces no tokens from it", () => {
    const n = notes({ companyPackageConditions: "Additional Entities" });
    assert.ok(!n?.includes("Additional Entities"));
  });
});

// ─── 6. Snapshot field coverage ──────────────────────────────────────────────

describe("snapshot — individual field mapping", () => {
  const snap = (extra?: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS)
      .documents_and_artifacts[0].metadata.snapshot;

  it("snapshot.usesPeo reflects form.usesPeo verbatim", () => {
    assert.equal(snap({ usesPeo: "Yes" }).usesPeo, "Yes");
  });

  it("snapshot.usesPeo is null when not set", () => {
    assert.equal(snap().usesPeo, null);
  });

  it("snapshot.peoUsed reflects form.peoUsed", () => {
    assert.equal(snap({ peoUsed: "Justworks" }).peoUsed, "Justworks");
  });

  it("snapshot.peosEvaluated is a normalized list", () => {
    const s = snap({ peosEvaluated: ["TriNet", "", "Gusto"] });
    assert.deepEqual(s.peosEvaluated, ["TriNet", "Gusto"]);
  });

  it("snapshot.payrollProvider reflects form.payrollProvider", () => {
    assert.equal(snap({ payrollProvider: "ADP" }).payrollProvider, "ADP");
  });

  it("snapshot.payrollFrequency reflects form.payrollFrequency", () => {
    assert.equal(snap({ payrollFrequency: "Bi-Weekly" }).payrollFrequency, "Bi-Weekly");
  });

  it("snapshot.companyPackageConditions is a normalized list", () => {
    const s = snap({ companyPackageConditions: ["None of the Above", "None of the Above"] });
    assert.deepEqual(s.companyPackageConditions, ["None of the Above"]);
  });

  it("snapshot.benefitDeductionFrequency reflects form value", () => {
    assert.equal(snap({ benefitDeductionFrequency: "Monthly" }).benefitDeductionFrequency, "Monthly");
  });

  it("snapshot.estimatedBenefitEligibleEes reflects form value", () => {
    assert.equal(snap({ estimatedBenefitEligibleEes: "200-499" }).estimatedBenefitEligibleEes, "200-499");
  });

  it("snapshot.estimatedMedicalEnrolledEes reflects form value", () => {
    assert.equal(snap({ estimatedMedicalEnrolledEes: "150" }).estimatedMedicalEnrolledEes, "150");
  });
});

// ─── 7. companies payload — extra fields ─────────────────────────────────────

describe("companies payload — field coverage", () => {
  const co = (extra: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS).companies;

  it("sic_code comes from preferredSicCode", () => {
    assert.equal(co({ preferredSicCode: "6311" }).sic_code, "6311");
  });

  it("naics_code comes from preferredNaicsCode", () => {
    assert.equal(co({ preferredNaicsCode: "524113" }).naics_code, "524113");
  });

  it("payroll_platform comes from payrollProvider", () => {
    assert.equal(co({ payrollProvider: "Gusto" }).payroll_platform, "Gusto");
  });

  it("company.id is normalizeText(companyId)", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE }, { nowISO: NOW, companyId: "  abc-123  " });
    assert.equal(r.companies.id, "abc-123");
  });

  it("company.updated_at equals nowISO", () => {
    assert.equal(co({}).updated_at, NOW);
  });

  it("customer_status is always 'quick_start_submitted' regardless of other inputs", () => {
    assert.equal(co({ companyName: null }).customer_status, "quick_start_submitted");
  });
});

// ─── 8. validateQuickStartRequiredFields — extra coverage ────────────────────

describe("validateQuickStartRequiredFields — extra edge cases", () => {
  it("'0' string passes (non-empty after normalize)", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, ndaRequested: "0" }), true);
  });

  it("number 0 passes (String(0) = '0', which is non-empty)", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, benefitEligibleEmployees: 0 }), true);
  });

  it("number 1 passes (String(1) = '1')", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, benefitEligibleEmployees: 1 }), true);
  });

  it("boolean true fails (normalizeText returns null for booleans)", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, ndaRequested: true }), false);
  });

  it("boolean false fails (normalizeText returns null for booleans)", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, ndaRequested: false }), false);
  });

  it("'YES' (uppercase) passes", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, ndaRequested: "YES" }), true);
  });

  it("very long valid string passes", () => {
    const longName = "A".repeat(500);
    assert.equal(validateQuickStartRequiredFields({ ...BASE, companyName: longName }), true);
  });

  it("unicode string passes", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, companyName: "日本語株式会社" }), true);
  });

  it("missing every required field one at a time fails each time", () => {
    const required = ["firstName", "lastName", "title", "phone", "email", "companyName", "benefitEligibleEmployees", "ndaRequested"];
    for (const field of required) {
      const form = { ...BASE, [field]: null };
      assert.equal(validateQuickStartRequiredFields(form), false, `should fail when ${field} is null`);
    }
  });

  it("string with only a tab character fails (whitespace only)", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, companyName: "\t" }), false);
  });
});

// ─── 9. Type coercion and non-standard inputs ─────────────────────────────────

describe("type coercion and non-standard inputs", () => {
  it("companyName as number coerces to string", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE, companyName: 42 }, OPTS);
    assert.equal(r.companies.company_name, "42");
  });

  it("benefitsOffered as string (not array) → medical_plans null (normalizeList filters non-arrays)", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE, benefitsOffered: "Medical" }, OPTS);
    assert.equal(r.medical_plans, null);
  });

  it("benefitsOffered as string → dental_plans null", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE, benefitsOffered: "Dental" }, OPTS);
    assert.equal(r.dental_plans, null);
  });

  it("peosEvaluated as string (not array) → peos_evaluated token absent", () => {
    const n = mapQuickStartFormToSupabasePayloads(
      { ...BASE, usesPeo: "Yes", peosEvaluated: "TriNet" },
      OPTS
    ).documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;
    assert.ok(!n?.includes("peos_evaluated:"));
  });

  it("companyPackageConditions as string → no condition tokens in benefitClassNotes", () => {
    const n = mapQuickStartFormToSupabasePayloads(
      { ...BASE, companyPackageConditions: "Additional Entities" },
      OPTS
    ).documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;
    assert.ok(!n?.includes("Additional Entities"));
  });

  it("desiredPlanTypes as string → base_plan null (normalizeList returns [])", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, desiredPlanTypes: "PPO Gold" },
      OPTS
    );
    assert.equal(r.contribution_strategies.base_plan, null);
  });

  it("medicalContributionStrategy as number → contribution_type as string", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, medicalContributionStrategy: 100 },
      OPTS
    );
    assert.equal(r.contribution_strategies.contribution_type, "100");
  });

  it("importanceRatings as null → stored as {} in snapshot", () => {
    const s = mapQuickStartFormToSupabasePayloads({ ...BASE, importanceRatings: null }, OPTS)
      .documents_and_artifacts[0].metadata.snapshot;
    assert.deepEqual(s.importanceRatings, {});
  });
});

// ─── 10. Metadata and document structure ─────────────────────────────────────

describe("metadata and document row structure", () => {
  it("first doc row document_type is always 'quick_start_submission'", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS);
    assert.equal(r.documents_and_artifacts[0].document_type, "quick_start_submission");
  });

  it("first doc row metadata.source_form is 'quick_start_onboarding'", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS);
    assert.equal(r.documents_and_artifacts[0].metadata.source_form, "quick_start_onboarding");
  });

  it("first doc row file_name is null", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS);
    assert.equal(r.documents_and_artifacts[0].file_name, null);
  });

  it("first doc row status is 'Completed'", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS);
    assert.equal(r.documents_and_artifacts[0].status, "Completed");
  });

  it("first doc row metadata.snapshot.benefitClassNotes is null when no relevant fields", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS);
    assert.equal(r.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes, null);
  });

  it("uploaded doc rows have source_form = 'quick_start_onboarding'", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, uploadedDocuments: [{ id: "d1", documentType: "Census", fileName: "f.csv", status: "Completed" }] },
      OPTS
    );
    assert.equal(r.documents_and_artifacts[1].metadata.source_form, "quick_start_onboarding");
  });

  it("uploaded doc rows have intake_notes = null when benefitsNotes not set", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, uploadedDocuments: [{ id: "d1", documentType: "Census", fileName: "f.csv", status: "Completed" }] },
      OPTS
    );
    assert.equal(r.documents_and_artifacts[1].metadata.intake_notes, null);
  });

  it("uploaded doc rows have intake_notes = benefitsNotes when set", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      {
        ...BASE,
        benefitsNotes: "Please prioritize cost savings",
        uploadedDocuments: [{ id: "d1", documentType: "Census", fileName: "f.csv", status: "Completed" }],
      },
      OPTS
    );
    assert.equal(r.documents_and_artifacts[1].metadata.intake_notes, "Please prioritize cost savings");
  });
});

// ─── 11. locations payload ────────────────────────────────────────────────────

describe("locations payload field coverage", () => {
  const loc = (extra: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS).locations;

  it("address_street comes from form.address", () => {
    assert.equal(loc({ address: "123 Main St" }).address_street, "123 Main St");
  });

  it("city comes from form.city", () => {
    assert.equal(loc({ city: "San Francisco" }).city, "San Francisco");
  });

  it("state comes from form.stateProvince", () => {
    assert.equal(loc({ stateProvince: "CA" }).state, "CA");
  });

  it("zip_code comes from form.zipCode", () => {
    assert.equal(loc({ zipCode: "94105" }).zip_code, "94105");
  });

  it("primary_location is always 'yes'", () => {
    assert.equal(loc({}).primary_location, "yes");
  });

  it("company_id propagates into locations", () => {
    assert.equal(loc({}).company_id, "cmp-test");
  });
});

// ─── 12. users payload ────────────────────────────────────────────────────────

describe("users payload field coverage", () => {
  const usr = (extra?: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS).users;

  it("first_name comes from form.firstName", () => {
    assert.equal(usr().first_name, "Alex");
  });

  it("last_name comes from form.lastName", () => {
    assert.equal(usr().last_name, "Smith");
  });

  it("email comes from form.email", () => {
    assert.equal(usr().email, "alex@example.com");
  });

  it("job_title comes from form.title", () => {
    assert.equal(usr().job_title, "Benefits Manager");
  });

  it("company_id propagates into users", () => {
    assert.equal(usr().company_id, "cmp-test");
  });

  it("users.updated_at equals nowISO", () => {
    assert.equal(usr().updated_at, NOW);
  });
});

// ─── 13. normalizeList surface behavior ──────────────────────────────────────

describe("normalizeList surface behavior via benefitsOffered / peosEvaluated", () => {
  it("null benefitsOffered → no plan payloads", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE, benefitsOffered: null }, OPTS);
    assert.equal(r.medical_plans, null);
    assert.equal(r.dental_plans, null);
    assert.equal(r.vision_plans, null);
  });

  it("benefitsOffered with null items — nulls are filtered", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: [null, "Medical", null] },
      OPTS
    );
    assert.ok(r.medical_plans !== null);
  });

  it("benefitsOffered with duplicate Medical entries → medical plan still created once", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical", "Medical", "Medical"] },
      OPTS
    );
    assert.ok(r.medical_plans !== null);
  });

  it("benefitsOffered with boolean true filtered (not a valid benefit)", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: [true, "Dental"] },
      OPTS
    );
    assert.ok(r.dental_plans !== null);
  });

  it("peosEvaluated with number items — numbers coerced to string", () => {
    const n = mapQuickStartFormToSupabasePayloads(
      { ...BASE, usesPeo: "Yes", peosEvaluated: [1, 2] },
      OPTS
    ).documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;
    assert.ok(n?.includes("peos_evaluated:"));
    assert.ok(n?.includes("1"));
    assert.ok(n?.includes("2"));
  });
});

// ─── 14. Combined / integration scenarios ────────────────────────────────────

describe("combined integration scenarios", () => {
  it("full submission with all plan types and PEO data maps correctly", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      {
        ...BASE,
        benefitsOffered: ["Medical", "Dental", "Vision", "Life"],
        desiredPlanTypes: ["PPO Gold"],
        medicalBenefitOfferType: "Fully Insured",
        medicalContributionStrategy: "Employer Paid",
        contributionToEmployee: "100%",
        contributionToDependents: "50%",
        percentageAppliesOnlyBasePlan: "Yes",
        usesPeo: "No, we have never considered a PEO",
        companyPackageConditions: ["Additional Entities"],
        companyPackageConditionsDetails: "Three subsidiaries",
        yearCompanyFounded: "2015",
        preferredSicCode: "6311",
        payrollProvider: "Gusto",
      },
      OPTS
    );

    assert.equal(r.companies.customer_status, "quick_start_submitted");
    assert.equal(r.companies.sic_code, "6311");
    assert.equal(r.medical_plans.plan_type, "PPO");
    assert.equal(r.medical_plans.metallic_level, "Gold");
    assert.equal(r.dental_plans.most_recent, "yes");
    assert.ok(r.vision_plans !== null);
    assert.equal(r.contribution_strategies.er_contribution, "100%");
    assert.equal(r.contribution_strategies.buyup_strategy, "yes");
    assert.equal(r.benefits.line_of_coverage, "Medical");
    assert.equal(r.benefits.calendar_year, "2015-01-01");
    const notes = r.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes as string;
    assert.equal(typeof notes, "string");
    assert.ok(notes.includes("Additional Entities"));
    assert.ok(notes.includes("Three subsidiaries"));
    assert.ok(notes.includes("uses_peo: No, we have never considered a PEO"));
  });

  it("minimal submission with no optional fields maps without errors", () => {
    const r = mapQuickStartFormToSupabasePayloads(BASE, OPTS);
    assert.equal(r.companies.customer_status, "quick_start_submitted");
    assert.equal(r.medical_plans, null);
    assert.equal(r.dental_plans, null);
    assert.equal(r.vision_plans, null);
    assert.equal(r.benefits, null);
    assert.equal(r.documents_and_artifacts.length, 1);
    assert.equal(r.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes, null);
  });

  it("submission with all PEO fields fully populated", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      {
        ...BASE,
        usesPeo: "Yes",
        peoUsed: "Justworks",
        peosEvaluated: ["TriNet", "Rippling", "Gusto"],
        companyPackageConditions: ["Additional Entities", "Multiple Eligibility Classes"],
        companyPackageConditionsDetails: "Remote team in 12 states",
      },
      OPTS
    );
    const notes = r.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes as string;
    const lines = notes.split("\n");
    assert.ok(lines.includes("Additional Entities"));
    assert.ok(lines.includes("Multiple Eligibility Classes"));
    assert.ok(lines.includes("Remote team in 12 states"));
    assert.ok(lines.some((l: string) => l === "uses_peo: Yes"));
    assert.ok(lines.some((l: string) => l === "peo_used: Justworks"));
    assert.ok(lines.some((l: string) => l.startsWith("peos_evaluated:") && l.includes("TriNet")));
  });

  it("nowISO at year boundary (Dec 31) still produces correct plan_year", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical", "Dental", "Vision"] },
      { nowISO: "2026-12-31T23:59:59.999Z", companyId: "c1" }
    );
    assert.equal(r.medical_plans.plan_year, "2026");
    assert.equal(r.dental_plans.plan_year, "2026");
    assert.equal(r.vision_plans.plan_year, "2026");
  });

  it("nowISO on Jan 1 of new year gives next year's plan_year", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical"] },
      { nowISO: "2027-01-01T00:00:00.000Z", companyId: "c1" }
    );
    assert.equal(r.medical_plans.plan_year, "2027");
  });

  it("benefitClassNotes is never a JavaScript array (core invariant)", () => {
    const scenarios = [
      { usesPeo: "Yes", peoUsed: "X", peosEvaluated: ["A", "B"] },
      { companyPackageConditions: ["C1", "C2"] },
      { usesPeo: "No", companyPackageConditions: ["C1"], companyPackageConditionsDetails: "detail" },
    ];
    for (const extra of scenarios) {
      const n = mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS)
        .documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;
      assert.ok(!Array.isArray(n), `benefitClassNotes must not be an array (got: ${JSON.stringify(n)})`);
    }
  });
});
