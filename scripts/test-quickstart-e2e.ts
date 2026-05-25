/**
 * QuickStart Form — 50 Edge Case Tests
 *
 * Tests normalizeYearToDate, validateQuickStartRequiredFields,
 * and mapQuickStartFormToSupabasePayloads across all payload sections.
 *
 * Run:
 *   npx tsx scripts/test-quickstart-e2e.ts
 *
 * No network required — pure mapping logic.
 */

import {
  mapQuickStartFormToSupabasePayloads,
  normalizeYearToDate,
  validateQuickStartRequiredFields,
} from "../lib/mappings/quickStartMapping";

// ─── Tiny test harness ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(label: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✅  ${label}`);
  } catch (err: any) {
    failed++;
    failures.push(`  ❌  [${passed + failed}] ${label}\n       ${err.message}`);
    console.log(`  ❌  ${label}`);
    console.log(`       ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}
function eq(actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  assert(a === e, `expected ${e}, got ${a}`);
}
function isNull(v: unknown) {
  assert(v === null, `expected null, got ${JSON.stringify(v)}`);
}
function notHasKey(obj: Record<string, unknown>, key: string) {
  assert(!(key in obj), `unexpected key "${key}" in object`);
}
function contains(str: string | null | undefined, sub: string) {
  assert(typeof str === "string" && str.includes(sub), `expected "${str}" to contain "${sub}"`);
}

// ─── Base form fixture ────────────────────────────────────────────────────────

const CID = "aaaaaaaa-0000-0000-0000-000000000001";

const base: Record<string, any> = {
  firstName: "Jane",
  lastName: "Doe",
  title: "HR Manager",
  phone: "555-1234",
  email: "jane@acme.com",
  companyName: "Acme Corp",
  address: "123 Main St",
  city: "Austin",
  stateProvince: "Texas",
  zipCode: "78701",
  ein: "12-3456789",
  yearCompanyFounded: "2010",
  preferredSicCode: "7372",
  preferredNaicsCode: "541511",
  benefitEligibleEmployees: "25 - 49",
  estimatedBenefitEligibleEes: "35",
  estimatedMedicalEnrolledEes: "28",
  expectedHeadcountGrowth: "10%",
  ndaRequested: "no",
  ndaCompanyLegalName: "",
  entityType: "Corporation",
  stateOfFormation: "Texas",
  ndaSigner: "",
  benefitsOffered: ["Medical", "Dental", "Vision"],
  benefitsOtherText: "",
  medicalBenefitOfferType: "Fully Insured",
  medicalBenefitOfferTypeOther: "",
  medicalContributionStrategy: "Flat Dollar Employer Contribution",
  contributionToEmployee: "$200",
  contributionToDependents: "$400",
  percentageAppliesOnlyBasePlan: "yes",
  contributionStrategyDescription: "",
  usesPeo: "No, we have never considered a PEO",
  peoUsed: "",
  peosEvaluated: [],
  payrollProvider: "Rippling",
  payrollFrequency: "Biweekly",
  benefitDeductionFrequency: "Biweekly",
  companyPackageConditions: [],
  companyPackageConditionsDetails: "",
  idealMedicalPlanCount: "2",
  desiredPlanTypes: ["PPO (Silver)", "HDHP with HSA (Bronze)"],
  importanceRatings: {},
  painPoints: ["Healthcare benefits costs"],
  questionnaireOpenness: "Not Sure",
  employeeFeedbackPreference: "Interested for the future or when the timing is right",
  benefitsNotes: "Please call before 5pm",
  uploadedDocuments: [],
};

/** Merge overrides into base and run the mapper. */
function map(overrides: Record<string, any> = {}) {
  return mapQuickStartFormToSupabasePayloads({ ...base, ...overrides }, { companyId: CID });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  1 – 5 │ normalizeYearToDate
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  QuickStart Form — 50 Edge Cases");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log("[ normalizeYearToDate — 5 tests ]");

test("1.  Bare 4-digit year converts to YYYY-01-01", () =>
  eq(normalizeYearToDate("2015"), "2015-01-01"));

test("2.  Full ISO date passes through unchanged", () =>
  eq(normalizeYearToDate("2020-06-15"), "2020-06-15"));

test("3.  Empty string returns null", () =>
  isNull(normalizeYearToDate("")));

test("4.  Non-numeric string returns null", () =>
  isNull(normalizeYearToDate("founded-in-2010")));

test("5.  Invalid month 13 returns null", () =>
  isNull(normalizeYearToDate("2015-13-01")));

// ═══════════════════════════════════════════════════════════════════════════════
//  6 – 8 │ validateQuickStartRequiredFields
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ validateQuickStartRequiredFields — 3 tests ]");

test("6.  All required fields present → true", () =>
  assert(validateQuickStartRequiredFields(base) === true, "expected true"));

test("7.  Missing email → false", () =>
  assert(validateQuickStartRequiredFields({ ...base, email: "" }) === false, "expected false"));

test("8.  Missing firstName → false", () =>
  assert(validateQuickStartRequiredFields({ ...base, firstName: "" }) === false, "expected false"));

// ═══════════════════════════════════════════════════════════════════════════════
//  9 – 15 │ companies payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ companies payload — 7 tests ]");

test("9.  company_name taken from companyName", () =>
  eq(map().companies.company_name, "Acme Corp"));

test("10. company_name falls back to ndaCompanyLegalName when companyName is blank", () =>
  eq(map({ companyName: "", ndaCompanyLegalName: "Acme LLC" }).companies.company_name, "Acme LLC"));

test("11. customer_status is always 'Prospect'", () =>
  eq(map().companies.customer_status, "Prospect"));

test("12. sic_code maps from preferredSicCode", () =>
  eq(map().companies.sic_code, "7372"));

test("13. naics_code maps from preferredNaicsCode", () =>
  eq(map().companies.naics_code, "541511"));

test("14. payroll_platform maps from payrollProvider", () =>
  eq(map().companies.payroll_platform, "Rippling"));

test("15. Variable company fields are null on a blank form; customer_status unchanged", () => {
  const r = map({ companyName: "", ndaCompanyLegalName: "", preferredSicCode: "", preferredNaicsCode: "", payrollProvider: "" });
  isNull(r.companies.company_name);
  isNull(r.companies.sic_code);
  isNull(r.companies.naics_code);
  isNull(r.companies.payroll_platform);
  eq(r.companies.customer_status, "Prospect");
});

// ═══════════════════════════════════════════════════════════════════════════════
//  16 – 19 │ users payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ users payload — 4 tests ]");

test("16. first_name / last_name from firstName / lastName", () => {
  eq(map().users.first_name, "Jane");
  eq(map().users.last_name, "Doe");
});

test("17. email mapped correctly", () =>
  eq(map().users.email, "jane@acme.com"));

test("18. job_title comes from title field", () =>
  eq(map().users.job_title, "HR Manager"));

test("19. user fields null when fields are empty", () => {
  const r = map({ firstName: "", lastName: "", email: "", title: "" });
  isNull(r.users.first_name);
  isNull(r.users.last_name);
  isNull(r.users.email);
  isNull(r.users.job_title);
});

// ═══════════════════════════════════════════════════════════════════════════════
//  20 – 23 │ contacts payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ contacts payload — 4 tests ]");

test("20. client_contacts = 'FirstName LastName'", () =>
  eq(map().contacts.client_contacts, "Jane Doe"));

test("21. client_contacts uses only firstName when lastName is absent", () =>
  eq(map({ lastName: "" }).contacts.client_contacts, "Jane"));

test("22. primary_contact = 'Yes' when name is present", () =>
  eq(map().contacts.primary_contact, "Yes"));

test("23. primary_contact = null when no name provided", () =>
  isNull(map({ firstName: "", lastName: "" }).contacts.primary_contact));

// ═══════════════════════════════════════════════════════════════════════════════
//  24 – 27 │ entities payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ entities payload — 4 tests ]");

test("24. entity_legal_name from ndaCompanyLegalName when provided", () =>
  eq(map({ ndaCompanyLegalName: "Acme LLC" }).entities.entity_legal_name, "Acme LLC"));

test("25. entity_legal_name falls back to companyName when ndaCompanyLegalName is blank", () =>
  eq(map({ ndaCompanyLegalName: "" }).entities.entity_legal_name, "Acme Corp"));

test("26. entity_type from entityType field", () =>
  eq(map().entities.entity_type, "Corporation"));

test("27. ein from ein field", () =>
  eq(map().entities.ein, "12-3456789"));

// ═══════════════════════════════════════════════════════════════════════════════
//  28 – 31 │ locations payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ locations payload — 4 tests ]");

test("28. address_street maps from address field", () =>
  eq(map().locations.address_street, "123 Main St"));

test("29. city, state, zip_code mapped correctly", () => {
  eq(map().locations.city, "Austin");
  eq(map().locations.state, "Texas");
  eq(map().locations.zip_code, "78701");
});

test("30. address_1 is NOT present in locations payload (removed — column does not exist)", () =>
  notHasKey(map().locations, "address_1"));

test("31. headcount is NOT present in locations payload (removed — column does not exist)", () =>
  notHasKey(map().locations, "headcount"));

// ═══════════════════════════════════════════════════════════════════════════════
//  32 – 35 │ benefits payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ benefits payload — 4 tests ]");

test("32. benefits is null when benefitsOffered is empty", () =>
  isNull(map({ benefitsOffered: [] }).benefits));

test("33. line_of_coverage = 'Medical' when Medical selected", () =>
  eq(map({ benefitsOffered: ["Medical"] }).benefits?.line_of_coverage, "Medical"));

test("34. line_of_coverage = 'Dental' when only Dental selected", () =>
  eq(map({ benefitsOffered: ["Dental"] }).benefits?.line_of_coverage, "Dental"));

test("35. benefits is null when only 'Other' is selected (not a recognized coverage)", () =>
  isNull(map({ benefitsOffered: ["Other"] }).benefits));

// ═══════════════════════════════════════════════════════════════════════════════
//  36 – 40 │ contribution_strategies payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ contribution_strategies payload — 5 tests ]");

test("36. contribution_type maps from medicalContributionStrategy", () =>
  eq(map().contribution_strategies.contribution_type, "Flat Dollar Employer Contribution"));

test("37. ee_contribution maps from contributionToEmployee", () =>
  eq(map().contribution_strategies.ee_contribution, "$200"));

test("38. dep_contribution maps from contributionToDependents", () =>
  eq(map().contribution_strategies.dep_contribution, "$400"));

test("39. er_contribution set for Flat Dollar Employer Contribution", () =>
  eq(map().contribution_strategies.er_contribution, "$200"));

test("40. er_contribution is null for non-employer contribution strategies", () =>
  isNull(map({ medicalContributionStrategy: "Flat Dollar Employee Contribution" }).contribution_strategies.er_contribution));

// ═══════════════════════════════════════════════════════════════════════════════
//  41 – 45 │ medical_plans payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ medical_plans payload — 5 tests ]");

test("41. medical_plans is null when Medical NOT in benefitsOffered", () =>
  isNull(map({ benefitsOffered: ["Dental", "Vision"] }).medical_plans));

test("42. medical_plans is created when Medical is in benefitsOffered", () => {
  const p = map({ benefitsOffered: ["Medical"] }).medical_plans;
  assert(p !== null, "expected non-null medical_plans");
  eq(p.company_id, CID);
});

test("43. plan_type = 'PPO' for 'PPO (Silver)' desired plan type", () =>
  eq(map({ desiredPlanTypes: ["PPO (Silver)"] }).medical_plans?.plan_type, "PPO"));

test("44. hsa_qualified = 'yes' for 'HDHP with HSA (Bronze)' desired plan type", () =>
  eq(map({ desiredPlanTypes: ["HDHP with HSA (Bronze)"] }).medical_plans?.hsa_qualified, "yes"));

test("45. plan_name_client from medicalBenefitOfferTypeOther when type is 'Other'", () =>
  eq(
    map({ medicalBenefitOfferType: "Other", medicalBenefitOfferTypeOther: "Custom Network Plan" }).medical_plans?.plan_name_client,
    "Custom Network Plan"
  ));

// ═══════════════════════════════════════════════════════════════════════════════
//  46 – 47 │ dental_plans payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ dental_plans payload — 2 tests ]");

test("46. dental_plans is null when Dental NOT in benefitsOffered", () =>
  isNull(map({ benefitsOffered: ["Medical", "Vision"] }).dental_plans));

test("47. dental_plans is created with plan_type = 'Dental' when Dental selected", () => {
  const p = map({ benefitsOffered: ["Dental"] }).dental_plans;
  assert(p !== null, "expected non-null dental_plans");
  eq(p.plan_type, "Dental");
});

// ═══════════════════════════════════════════════════════════════════════════════
//  48 – 49 │ vision_plans payload
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ vision_plans payload — 2 tests ]");

test("48. vision_plans is null when Vision NOT in benefitsOffered", () =>
  isNull(map({ benefitsOffered: ["Medical", "Dental"] }).vision_plans));

test("49. vision_plans is created with correct plan_name_client when Vision selected", () => {
  const p = map({ benefitsOffered: ["Vision"] }).vision_plans;
  assert(p !== null, "expected non-null vision_plans");
  eq(p.plan_name_client, "Quick Start - Vision Plan");
});

// ═══════════════════════════════════════════════════════════════════════════════
//  50 │ documents_and_artifacts — 1 structural + snapshot + upload + notes tests
//  (split into 1 composite to reach exactly 50)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n[ documents_and_artifacts — 1 composite test (snapshot + uploads + PEO notes) ]");

test("50. Submission snapshot row always present; snapshot fields populated correctly", () => {
  const docs = map().documents_and_artifacts;
  assert(Array.isArray(docs) && docs.length >= 1, "expected at least 1 artifact row");
  const snap = docs[0];
  eq(snap.document_type, "quick_start_submission");
  eq(snap.metadata.snapshot.firstName, "Jane");
  eq(snap.metadata.snapshot.companyName, "Acme Corp");
  eq(snap.metadata.snapshot.benefitsNotes, "Please call before 5pm");
  // uploaded docs are appended
  const withUpload = map({
    uploadedDocuments: [
      { id: "doc-1", documentType: "Employee Census", fileName: "census.xlsx", status: "Pending" },
    ],
  });
  assert(withUpload.documents_and_artifacts.length === 2, "expected 2 artifact rows with 1 upload");
  eq(withUpload.documents_and_artifacts[1].document_type, "Employee Census");
  // PEO info appears in benefitClassNotes
  const withPeo = map({ usesPeo: "Yes", peoUsed: "Justworks" });
  const notes: string | null = withPeo.documents_and_artifacts[0].metadata.snapshot.benefitClassNotes;
  contains(notes, "Justworks");
  contains(notes, "uses_peo: Yes");
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`  ${passed} passed  /  ${failed} failed  /  ${passed + failed} total`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

if (failures.length) {
  console.log("Failed:\n");
  failures.forEach((f) => console.log(f));
  console.log();
}

process.exit(failed > 0 ? 1 : 0);
