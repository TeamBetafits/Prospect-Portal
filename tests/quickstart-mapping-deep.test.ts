/**
 * Deep edge-case tests for the QuickStart form mapping layer.
 *
 * Covers every path in:
 *  - normalizeYearToDate
 *  - normalizeBooleanWord (via buyup_strategy / base_plan / hsa_qualified)
 *  - normalizeChoiceWithOther (medicalBenefitOfferType "Other")
 *  - normalizeLineOfCoverage (first-recognized benefit rule)
 *  - parseMedicalPlanShape (plan type / metallic level / HSA detection)
 *  - buildBenefitClassNotes (array, dedup, special chars)
 *  - contribution_strategies.base_plan (noise filtering bug)
 *  - documents_and_artifacts (File object leak, null fields, multi-doc)
 *  - Snapshot completeness
 *  - importanceRatings pass-through
 *  - Payload structure invariants
 *  - validateQuickStartRequiredFields edge cases
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapQuickStartFormToSupabasePayloads,
  validateQuickStartRequiredFields,
} from "../lib/mappings/quickStartMapping";

const NOW = "2026-06-15T10:00:00.000Z";
const OPTS = { nowISO: NOW, companyId: "company-abc" };

const BASE = {
  firstName: "Jane",
  lastName: "Doe",
  title: "HR Director",
  phone: "555-0100",
  email: "jane@acme.com",
  companyName: "Acme Corp",
  benefitEligibleEmployees: "50 - 99",
  ndaRequested: "yes",
};

// ─── 1. normalizeYearToDate ───────────────────────────────────────────────────

describe("normalizeYearToDate — calendar_year in benefits", () => {
  const yearCase = (year: any, benefitsOffered = ["Dental"]) =>
    mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered, yearCompanyFounded: year },
      OPTS
    ).benefits?.calendar_year ?? null;

  it("bare 4-digit year is expanded to YYYY-01-01", () => {
    assert.equal(yearCase("2010"), "2010-01-01");
  });

  it("year as a number (2019) is expanded to YYYY-01-01", () => {
    assert.equal(yearCase(2019), "2019-01-01");
  });

  it("full ISO date is passed through unchanged", () => {
    assert.equal(yearCase("2018-06-20"), "2018-06-20");
  });

  it("null year produces null calendar_year", () => {
    assert.equal(yearCase(null), null);
  });

  it("empty string year produces null calendar_year", () => {
    assert.equal(yearCase(""), null);
  });

  it("whitespace-only year produces null calendar_year", () => {
    assert.equal(yearCase("   "), null);
  });

  it("partial date YYYY-MM is rejected → null", () => {
    assert.equal(yearCase("2026-06"), null);
  });

  it("5-digit year is rejected → null", () => {
    assert.equal(yearCase("20260"), null);
  });

  it("gibberish string is rejected → null", () => {
    assert.equal(yearCase("founded 2010"), null);
  });

  it("invalid month 13 is rejected → null", () => {
    assert.equal(yearCase("2026-13-01"), null);
  });

  it("invalid day 45 is rejected → null", () => {
    assert.equal(yearCase("2026-01-45"), null);
  });
});

// ─── 2. base_plan noise filtering ────────────────────────────────────────────

describe("contribution_strategies.base_plan — noise filtering", () => {
  const basePlan = (desiredPlanTypes: string[]) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, desiredPlanTypes }, OPTS)
      .contribution_strategies.base_plan;

  it("stores real plan type as base_plan", () => {
    assert.equal(basePlan(["PPO Gold"]), "PPO Gold");
  });

  it("stores first real plan when multiple present", () => {
    assert.equal(basePlan(["HMO Silver", "PPO Bronze"]), "HMO Silver");
  });

  it("does NOT store 'Not Sure' as base_plan", () => {
    assert.notEqual(basePlan(["Not Sure"]), "Not Sure");
    assert.equal(basePlan(["Not Sure"]), null);
  });

  it("does NOT store 'Other' as base_plan", () => {
    assert.notEqual(basePlan(["Other"]), "Other");
    assert.equal(basePlan(["Other"]), null);
  });

  it("skips noise and picks first real plan when noise is first", () => {
    assert.equal(basePlan(["Not Sure", "HDHP with HSA (Gold)"]), "HDHP with HSA (Gold)");
  });

  it("returns null when desiredPlanTypes is empty", () => {
    assert.equal(basePlan([]), null);
  });

  it("returns null when desiredPlanTypes is missing", () => {
    const result = mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS);
    assert.equal(result.contribution_strategies.base_plan, null);
  });
});

// ─── 3. normalizeChoiceWithOther ─────────────────────────────────────────────

describe("normalizeChoiceWithOther — medical offer type", () => {
  const offerType = (type: any, otherText: any) =>
    mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical"], medicalBenefitOfferType: type, medicalBenefitOfferTypeOther: otherText },
      OPTS
    ).medical_plans;

  it("non-Other choice ignores otherText", () => {
    const p = offerType("Fully Insured", "Should be ignored");
    assert.equal(p.network_type, "Fully Insured");
    assert.equal(p.plan_name_client, "Quick Start - Medical Plan");
  });

  it("Other + valid otherText uses otherText as plan_name_client", () => {
    const p = offerType("Other", "Level Funded");
    assert.equal(p.plan_name_client, "Level Funded");
    assert.equal(p.network_type, "Other");
  });

  it("Other + blank otherText falls back to 'Other' string, default plan name", () => {
    const p = offerType("Other", "   ");
    assert.equal(p.plan_name_client, "Quick Start - Medical Plan");
    assert.equal(p.network_type, "Other");
  });

  it("Other + null otherText falls back to 'Other'", () => {
    const p = offerType("Other", null);
    assert.equal(p.plan_name_client, "Quick Start - Medical Plan");
    assert.equal(p.network_type, "Other");
  });

  it("null choice produces null network_type", () => {
    const p = offerType(null, null);
    assert.equal(p.network_type, null);
  });
});

// ─── 4. normalizeBooleanWord ──────────────────────────────────────────────────

describe("normalizeBooleanWord — buyup_strategy & hsa_qualified", () => {
  const buyup = (v: any) =>
    mapQuickStartFormToSupabasePayloads(
      { ...BASE, percentageAppliesOnlyBasePlan: v },
      OPTS
    ).contribution_strategies.buyup_strategy;

  it("lowercase 'yes' → 'yes'", () => assert.equal(buyup("yes"), "yes"));
  it("lowercase 'no' → 'no'", () => assert.equal(buyup("no"), "no"));
  it("uppercase 'YES' → 'yes'", () => assert.equal(buyup("YES"), "yes"));
  it("uppercase 'NO' → 'no'", () => assert.equal(buyup("NO"), "no"));
  it("mixed case 'Yes' → 'yes'", () => assert.equal(buyup("Yes"), "yes"));
  it("mixed case 'No' → 'no'", () => assert.equal(buyup("No"), "no"));
  it("'true' → null (not accepted)", () => assert.equal(buyup("true"), null));
  it("empty string → null", () => assert.equal(buyup(""), null));
  it("null → null", () => assert.equal(buyup(null), null));
  it("undefined → null", () => assert.equal(buyup(undefined), null));
});

// ─── 5. parseMedicalPlanShape — all plan type branches ───────────────────────

describe("parseMedicalPlanShape via desiredPlanTypes", () => {
  const shape = (types: string[]) =>
    mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical"], desiredPlanTypes: types },
      OPTS
    ).medical_plans;

  it("HDHP with HSA (Bronze) → HDHP, Bronze, hsa_qualified yes", () => {
    const p = shape(["HDHP with HSA (Bronze)"]);
    assert.equal(p.plan_type, "HDHP");
    assert.equal(p.metallic_level, "Bronze");
    assert.equal(p.hsa_qualified, "yes");
  });

  it("PPO (Silver) → PPO, Silver, hsa_qualified null", () => {
    const p = shape(["PPO (Silver)"]);
    assert.equal(p.plan_type, "PPO");
    assert.equal(p.metallic_level, "Silver");
    assert.equal(p.hsa_qualified, null);
  });

  it("HMO → HMO, no metallic, no hsa", () => {
    const p = shape(["HMO"]);
    assert.equal(p.plan_type, "HMO");
    assert.equal(p.metallic_level, null);
    assert.equal(p.hsa_qualified, null);
  });

  it("HDHP without HSA in name → HDHP, no hsa_qualified", () => {
    const p = shape(["HDHP (Bronze)"]);
    assert.equal(p.plan_type, "HDHP");
    assert.equal(p.hsa_qualified, null);
  });

  it("first non-noise plan wins when multiple selected", () => {
    const p = shape(["Not Sure", "PPO (Gold)"]);
    assert.equal(p.plan_type, "PPO");
    assert.equal(p.metallic_level, "Gold");
  });

  it("all-noise desiredPlanTypes → null plan_type, null metallic_level", () => {
    const p = shape(["Not Sure", "Other"]);
    assert.equal(p.plan_type, null);
    assert.equal(p.metallic_level, null);
  });
});

// ─── 6. normalizeLineOfCoverage — benefits table ─────────────────────────────

describe("normalizeLineOfCoverage — which benefit drives the benefits row", () => {
  const cov = (offered: string[]) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, benefitsOffered: offered }, OPTS).benefits
      ?.line_of_coverage ?? null;

  it("Medical → 'Medical'", () => assert.equal(cov(["Medical"]), "Medical"));
  it("Dental → 'Dental'", () => assert.equal(cov(["Dental"]), "Dental"));
  it("Vision → 'Vision'", () => assert.equal(cov(["Vision"]), "Vision"));
  it("Life → 'Life'", () => assert.equal(cov(["Life"]), "Life"));
  it("Disability → 'Disability'", () => assert.equal(cov(["Disability"]), "Disability"));
  it("Voluntary Benefits → 'Voluntary Benefits'", () =>
    assert.equal(cov(["Voluntary Benefits"]), "Voluntary Benefits"));
  it("401(k) alone → benefits row is null (not a recognized LOC)", () =>
    assert.equal(cov(["401(k)"]), null));
  it("401(k) + Medical → first recognized wins → 'Medical'", () =>
    assert.equal(cov(["401(k)", "Medical"]), "Medical"));
  it("empty array → benefits null", () =>
    assert.equal(
      mapQuickStartFormToSupabasePayloads({ ...BASE, benefitsOffered: [] }, OPTS).benefits,
      null
    ));
});

// ─── 7. buildBenefitClassNotes ────────────────────────────────────────────────

describe("buildBenefitClassNotes — string shape and edge cases", () => {
  const notes = (extra: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS)
      .documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;

  it("returns null when nothing relevant provided", () => {
    assert.equal(notes({}), null);
  });

  it("includes companyPackageConditions tokens", () => {
    const n = notes({ companyPackageConditions: ["Additional Entities", "Multiple Eligibility Classes"] });
    assert.equal(typeof n, "string");
    assert.ok(n!.includes("Additional Entities"));
    assert.ok(n!.includes("Multiple Eligibility Classes"));
  });

  it("companyPackageConditionsDetails is included when not blank", () => {
    const n = notes({ companyPackageConditions: ["None of the Above"], companyPackageConditionsDetails: "Some detail" });
    assert.ok(n!.includes("Some detail"));
  });

  it("blank companyPackageConditionsDetails is NOT included", () => {
    const n = notes({ companyPackageConditions: ["None of the Above"], companyPackageConditionsDetails: "   " });
    assert.ok(!n!.includes("   "));
  });

  it("duplicate package conditions are deduplicated", () => {
    const n = notes({ companyPackageConditions: ["Additional Entities", "Additional Entities"] });
    const count = (n!.match(/Additional Entities/g) || []).length;
    assert.equal(count, 1);
  });

  it("multiple peosEvaluated joined with pipe", () => {
    const n = notes({ peosEvaluated: ["TriNet", "Gusto"], usesPeo: "Yes" });
    const entry = n!.split("\n").find((t: string) => t.startsWith("peos_evaluated:"));
    assert.ok(entry?.includes("TriNet"));
    assert.ok(entry?.includes("Gusto"));
    assert.ok(entry?.includes("|"));
  });

  it("empty strings in peosEvaluated are filtered out", () => {
    const n = notes({ peosEvaluated: ["", "TriNet", ""], usesPeo: "Yes" });
    const entry = n!.split("\n").find((t: string) => t.startsWith("peos_evaluated:"));
    assert.ok(entry?.includes("TriNet"));
    assert.ok(!entry?.includes("||"));
  });

  it("peoUsed token only appears when usesPeo is set", () => {
    const withPeo = notes({ usesPeo: "Yes", peoUsed: "Justworks" });
    assert.ok(withPeo!.includes("peo_used: Justworks"));

    const withoutPeo = notes({ peoUsed: "Justworks" }); // usesPeo missing
    assert.ok(!withoutPeo?.includes("peo_used: Justworks"));
  });
});

// ─── 8. Uploaded documents edge cases ────────────────────────────────────────

describe("uploaded documents in payload", () => {
  it("File object in doc.file is NOT leaked into the mapped payload", () => {
    const fakeFile = { name: "census.csv", size: 1234, type: "text/csv" }; // simulate File
    const result = mapQuickStartFormToSupabasePayloads(
      {
        ...BASE,
        uploadedDocuments: [
          { id: "d1", documentType: "Census", fileName: "census.csv", status: "Completed", file: fakeFile },
        ],
      },
      OPTS
    );
    const docRow = result.documents_and_artifacts[1];
    assert.ok(!("file" in docRow), "file property must not appear in mapped payload");
    assert.ok(!("file" in docRow.metadata.upload), "file must not appear in upload metadata");
  });

  it("doc with null id → id in metadata is null", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE, uploadedDocuments: [{ id: null, documentType: "Census", fileName: "f.csv", status: "Completed" }] },
      OPTS
    );
    assert.equal(result.documents_and_artifacts[1].metadata.upload.id, null);
  });

  it("doc with empty documentType → document_type is null", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE, uploadedDocuments: [{ id: "d1", documentType: "", fileName: "f.csv", status: "Completed" }] },
      OPTS
    );
    assert.equal(result.documents_and_artifacts[1].document_type, null);
  });

  it("doc with special characters in fileName → preserved", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE, uploadedDocuments: [{ id: "d1", documentType: "Census", fileName: "file (2026) [draft].xlsx", status: "Completed" }] },
      OPTS
    );
    assert.equal(result.documents_and_artifacts[1].file_name, "file (2026) [draft].xlsx");
  });

  it("doc with unexpected status value is stored as-is (not overridden to Completed)", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE, uploadedDocuments: [{ id: "d1", documentType: "Census", fileName: "f.csv", status: "Under Review" }] },
      OPTS
    );
    assert.equal(result.documents_and_artifacts[1].status, "Under Review");
  });

  it("benefitsNotes are stored in each uploaded doc's metadata", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      {
        ...BASE,
        benefitsNotes: "Please review carefully",
        uploadedDocuments: [{ id: "d1", documentType: "Census", fileName: "f.csv", status: "Completed" }],
      },
      OPTS
    );
    assert.equal(result.documents_and_artifacts[1].metadata.intake_notes, "Please review carefully");
  });

  it("uploadedDocuments as non-array (undefined) → no extra rows", () => {
    const form = { ...BASE } as any;
    delete form.uploadedDocuments;
    const result = mapQuickStartFormToSupabasePayloads(form, OPTS);
    assert.equal(result.documents_and_artifacts.length, 1);
  });
});

// ─── 9. importanceRatings passthrough ────────────────────────────────────────

describe("importanceRatings in snapshot", () => {
  const ratings = (v: any) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, importanceRatings: v }, OPTS)
      .documents_and_artifacts[0].metadata.snapshot.importanceRatings;

  it("undefined importanceRatings → stored as {}", () => {
    assert.deepEqual(ratings(undefined), {});
  });

  it("null importanceRatings → stored as {}", () => {
    assert.deepEqual(ratings(null), {});
  });

  it("populated importanceRatings → passed through unchanged", () => {
    const obj = { "Total Cost": "Very Important", "Carrier Name/Market Share": "Important" };
    assert.deepEqual(ratings(obj), obj);
  });
});

// ─── 10. Payload structural invariants ───────────────────────────────────────

describe("payload structural invariants", () => {
  it("companies.customer_status is always 'Prospect'", () => {
    assert.equal(
      mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS).companies.customer_status,
      "Prospect"
    );
  });

  it("locations.primary_location is always 'yes'", () => {
    assert.equal(
      mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS).locations.primary_location,
      "yes"
    );
  });

  it("dental_plans.most_recent is always 'yes' when Dental selected", () => {
    assert.equal(
      mapQuickStartFormToSupabasePayloads({ ...BASE, benefitsOffered: ["Dental"] }, OPTS).dental_plans.most_recent,
      "yes"
    );
  });

  it("documents_and_artifacts[0].document_type is always 'quick_start_submission'", () => {
    assert.equal(
      mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS).documents_and_artifacts[0].document_type,
      "quick_start_submission"
    );
  });

  it("documents_and_artifacts[0].metadata.source_form is always 'quick_start_onboarding'", () => {
    assert.equal(
      mapQuickStartFormToSupabasePayloads({ ...BASE }, OPTS)
        .documents_and_artifacts[0].metadata.source_form,
      "quick_start_onboarding"
    );
  });

  it("plan_year matches UTC year of nowISO", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical", "Dental", "Vision"] },
      { nowISO: "2027-01-01T00:00:00.000Z", companyId: "c1" }
    );
    assert.equal(result.medical_plans.plan_year, "2027");
    assert.equal(result.dental_plans.plan_year, "2027");
    assert.equal(result.vision_plans.plan_year, "2027");
  });

  it("all payloads carry updated_at from nowISO", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE, benefitsOffered: ["Medical"] }, OPTS);
    assert.equal(r.companies.updated_at, NOW);
    assert.equal(r.users.updated_at, NOW);
    assert.equal(r.locations.updated_at, NOW);
    assert.equal(r.medical_plans.updated_at, NOW);
    assert.equal(r.documents_and_artifacts[0].updated_at, NOW);
  });
});

// ─── 11. Snapshot completeness ────────────────────────────────────────────────

describe("submission snapshot completeness", () => {
  const snap = (extra?: object) =>
    mapQuickStartFormToSupabasePayloads({ ...BASE, ...extra }, OPTS)
      .documents_and_artifacts[0].metadata.snapshot;

  it("snapshot always contains all expected top-level keys", () => {
    const s = snap();
    const required = [
      "firstName", "lastName", "title", "phone", "email", "companyName",
      "benefitsOffered", "benefitsNotes", "uploadedDocuments", "importanceRatings",
      "painPoints", "desiredPlanTypes", "peosEvaluated", "companyPackageConditions",
    ];
    for (const key of required) {
      assert.ok(key in s, `snapshot missing key: ${key}`);
    }
  });

  it("snapshot painPoints is always an array", () => {
    assert.ok(Array.isArray(snap().painPoints));
    assert.ok(Array.isArray(snap({ painPoints: null }).painPoints));
  });

  it("snapshot benefitsOffered is always an array", () => {
    assert.ok(Array.isArray(snap().benefitsOffered));
  });

  it("snapshot uploadedDocuments is always an array", () => {
    assert.ok(Array.isArray(snap().uploadedDocuments));
    assert.ok(Array.isArray(snap({ uploadedDocuments: undefined }).uploadedDocuments));
  });

  it("snapshot importanceRatings is always an object", () => {
    assert.equal(typeof snap().importanceRatings, "object");
    assert.ok(!Array.isArray(snap().importanceRatings));
  });
});

// ─── 12. validateQuickStartRequiredFields — extra coverage ───────────────────

describe("validateQuickStartRequiredFields — extra coverage", () => {
  it("passes when all fields have leading/trailing whitespace that normalizes to content", () => {
    const form = Object.fromEntries(
      Object.entries(BASE).map(([k, v]) => [k, `  ${v}  `])
    );
    assert.equal(validateQuickStartRequiredFields(form), true);
  });

  it("fails when phone is all whitespace", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, phone: "   " }), false);
  });

  it("fails when benefitEligibleEmployees is zero-length string", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, benefitEligibleEmployees: "" }), false);
  });

  it("passes with ndaRequested = 'no' (falsy-looking but valid string)", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, ndaRequested: "no" }), true);
  });

  it("boolean false normalizes to null → validation fails", () => {
    // After fix: normalizeText(false) returns null, so the required field check fails
    assert.equal(validateQuickStartRequiredFields({ ...BASE, ndaRequested: false }), false);
  });

  it("passes when extra unknown fields are present", () => {
    assert.equal(validateQuickStartRequiredFields({ ...BASE, unknownField: "value" }), true);
  });
});

// ─── 13. companyId propagation ────────────────────────────────────────────────

describe("companyId propagation", () => {
  it("null companyId propagates null to all company_id fields", () => {
    const r = mapQuickStartFormToSupabasePayloads(
      { ...BASE, benefitsOffered: ["Medical"] },
      { nowISO: NOW, companyId: undefined }
    );
    assert.equal(r.companies.id, null);
    assert.equal(r.users.company_id, null);
    assert.equal(r.locations.company_id, null);
    assert.equal(r.medical_plans.company_id, null);
    assert.equal(r.documents_and_artifacts[0].company_id, null);
  });

  it("companyId with whitespace is trimmed", () => {
    const r = mapQuickStartFormToSupabasePayloads({ ...BASE }, { nowISO: NOW, companyId: "  abc-123  " });
    assert.equal(r.companies.id, "abc-123");
    assert.equal(r.users.company_id, "abc-123");
  });
});
