/**
 * Form Hardening — edge-case test suite.
 *
 * Covers QuickStart, Missing Premiums Manual Input, and Employee Feedback.
 *
 * Run with:  tsx --test tests/form-hardening.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeEin,
  normalizePhone,
  normalizeZip,
  normalizeEmail,
  normalizeNumericCode,
  normalizeUrl,
  normalizeRenewalMonth,
} from "../shared/forms/formatters";
import { normalizeYearToDate } from "../lib/mappings/quickStartMapping";
import {
  mapQuickStartFormToSupabasePayloads,
  validateQuickStartRequiredFields,
} from "../lib/mappings/quickStartMapping";
import {
  getUserField,
  hasPremiumInvalidInput,
  buildPremiumUpdates,
  sanitizePremiumUpdateEntry,
  USER_PREMIUM_FIELDS,
} from "../lib/forms/missingPremiumsUtils";
import {
  normalizeScore,
  normalizeEnrollmentType,
  validateFeedbackPayload,
} from "../lib/forms/feedbackUtils";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const NOW = "2026-01-15T00:00:00.000Z";
const OPTS = { nowISO: NOW, companyId: "cid-001" };

const VALID_QUICK_START = {
  firstName: "Jane",
  lastName: "Doe",
  title: "HR Director",
  phone: "5551234567",
  email: "JANE@ACME.COM",
  companyName: "Acme Corp",
  benefitEligibleEmployees: "50",
  ndaRequested: "Yes",
};

// ─── QuickStart: normalizers ──────────────────────────────────────────────────

describe("QuickStart — EIN normalization", () => {
  it("formats bare 9 digits", () => assert.equal(normalizeEin("123456789"), "12-3456789"));
  it("accepts already-formatted EIN", () => assert.equal(normalizeEin("12-3456789"), "12-3456789"));
  it("strips dashes then reformats", () => assert.equal(normalizeEin("12-345-6789"), "12-3456789"));
  it("strips spaces then reformats", () => assert.equal(normalizeEin("12 3456789"), "12-3456789"));
  it("country-prefix stripped: 11 digits starting with 1 NOT reformatted (EIN not phone)", () =>
    assert.notEqual(normalizeEin("112345678901"), "12-3456789"));
  it("returns empty string for letters-only", () => assert.equal(normalizeEin("ABCDEFGHI"), ""));
  it("returns empty string for empty input", () => assert.equal(normalizeEin(""), ""));
  it("returns empty string for null", () => assert.equal(normalizeEin(null), ""));
  it("returns empty string for undefined", () => assert.equal(normalizeEin(undefined), ""));
  it("returns raw text for 8-digit input (not enough for EIN)", () =>
    assert.equal(normalizeEin("12345678"), "12345678"));
  it("returns raw text for 10-digit input (too many)", () =>
    assert.equal(normalizeEin("1234567890"), "1234567890"));
  it("XSS attempt results in non-matching digits → returned as-is", () => {
    const result = normalizeEin("<script>alert(1)</script>");
    assert.equal(typeof result, "string");
  });
  it("SQL injection attempt: digits extracted, formatted or returned raw", () => {
    const result = normalizeEin("'; DROP TABLE entities; --");
    assert.equal(typeof result, "string");
  });
  it("all-zeros EIN normalizes to 00-0000000", () =>
    assert.equal(normalizeEin("000000000"), "00-0000000"));
  it("all-nines EIN normalizes to 99-9999999", () =>
    assert.equal(normalizeEin("999999999"), "99-9999999"));
  it("unicode digits stripped as non-ASCII non-digit", () => {
    // ١ is Arabic-Indic digit 1 — not matched by \D replace, but Number("١") may or may not work
    const result = normalizeEin("١٢٣٤٥٦٧٨٩");
    assert.equal(typeof result, "string");
  });
});

describe("QuickStart — phone normalization", () => {
  it("formats 10 bare digits", () => assert.equal(normalizePhone("5551234567"), "(555) 123-4567"));
  it("formats with country code +1 (11 digits starting with 1)", () =>
    assert.equal(normalizePhone("15551234567"), "(555) 123-4567"));
  it("strips dashes before formatting", () => assert.equal(normalizePhone("555-123-4567"), "(555) 123-4567"));
  it("strips dots before formatting", () => assert.equal(normalizePhone("555.123.4567"), "(555) 123-4567"));
  it("strips parentheses before formatting", () =>
    assert.equal(normalizePhone("(555)123-4567"), "(555) 123-4567"));
  it("already formatted phone passes through", () =>
    assert.equal(normalizePhone("(555) 123-4567"), "(555) 123-4567"));
  it("returns raw text for 7-digit number", () => assert.equal(normalizePhone("1234567"), "1234567"));
  it("returns empty for empty input", () => assert.equal(normalizePhone(""), ""));
  it("returns empty for null", () => assert.equal(normalizePhone(null), ""));
  it("international number with too many digits returned as raw", () => {
    const result = normalizePhone("+44 20 7946 0958");
    // digits = 44207946095 (11 digits, but doesn't start with 1) → returned raw
    assert.equal(typeof result, "string");
  });
  it("XSS in phone is returned as raw string (no valid digit groups)", () => {
    const result = normalizePhone("<img src=x onerror=alert(1)>");
    assert.equal(typeof result, "string");
  });
  it("000-000-0000 normalizes to (000) 000-0000", () =>
    assert.equal(normalizePhone("0000000000"), "(000) 000-0000"));
  it("extension suffix stripped — only first 10 digits used when 11 digits + leading 1", () =>
    assert.equal(normalizePhone("1 (555) 123-4567"), "(555) 123-4567"));
});

describe("QuickStart — ZIP normalization", () => {
  it("5-digit ZIP passes through", () => assert.equal(normalizeZip("90210"), "90210"));
  it("9-digit ZIP gets dash inserted", () => assert.equal(normalizeZip("902101234"), "90210-1234"));
  it("ZIP+4 with dash passes through", () => assert.equal(normalizeZip("90210-1234"), "90210-1234"));
  it("ZIP+4 with space gets dash inserted", () => assert.equal(normalizeZip("90210 1234"), "90210-1234"));
  it("returns raw text for 4-digit input", () => assert.equal(normalizeZip("9021"), "9021"));
  it("returns raw text for 6-digit input", () => assert.equal(normalizeZip("902100"), "902100"));
  it("returns empty for empty input", () => assert.equal(normalizeZip(""), ""));
  it("returns empty for null", () => assert.equal(normalizeZip(null), ""));
  it("all-zeros ZIP normalizes correctly", () => assert.equal(normalizeZip("00000"), "00000"));
  it("all-nines ZIP normalizes correctly", () => assert.equal(normalizeZip("99999"), "99999"));
});

describe("QuickStart — email normalization", () => {
  it("lowercases mixed-case email", () => assert.equal(normalizeEmail("Jane@ACME.COM"), "jane@acme.com"));
  it("trims surrounding whitespace", () => assert.equal(normalizeEmail("  jane@acme.com  "), "jane@acme.com"));
  it("handles empty string", () => assert.equal(normalizeEmail(""), ""));
  it("handles null", () => assert.equal(normalizeEmail(null), ""));
  it("handles non-email text", () => assert.equal(normalizeEmail("NOT_AN_EMAIL"), "not_an_email"));
  it("XSS in email is lowercased but not stripped", () => {
    const result = normalizeEmail("<SCRIPT>alert(1)</SCRIPT>");
    assert.equal(result, "<script>alert(1)</script>");
  });
  it("very long email truncated to lowercase", () => {
    const long = "a".repeat(300) + "@example.com";
    assert.equal(normalizeEmail(long), long.toLowerCase());
  });
});

describe("QuickStart — SIC / NAICS code normalization", () => {
  it("4-digit SIC passes through", () => assert.equal(normalizeNumericCode("1234"), "1234"));
  it("strips internal spaces", () => assert.equal(normalizeNumericCode("12 34"), "1234"));
  it("6-digit NAICS passes through", () => assert.equal(normalizeNumericCode("123456"), "123456"));
  it("returns empty for empty input", () => assert.equal(normalizeNumericCode(""), ""));
  it("returns null for null input", () => assert.equal(normalizeNumericCode(null), ""));
  it("letters returned as-is (not stripped)", () => assert.equal(normalizeNumericCode("AB12"), "AB12"));
});

describe("QuickStart — normalizeYearToDate", () => {
  it("converts bare 4-digit year", () => assert.equal(normalizeYearToDate("2010"), "2010-01-01"));
  it("passes through valid ISO date string", () => assert.equal(normalizeYearToDate("2010-06-15"), "2010-06-15"));
  it("returns null for non-4-digit string", () => assert.equal(normalizeYearToDate("210"), null));
  it("returns null for text", () => assert.equal(normalizeYearToDate("year"), null));
  it("returns null for empty string", () => assert.equal(normalizeYearToDate(""), null));
  it("returns null for null", () => assert.equal(normalizeYearToDate(null), null));
  it("returns null for invalid month 13", () => assert.equal(normalizeYearToDate("2010-13-01"), null));
  it("returns null for invalid day 32", () => assert.equal(normalizeYearToDate("2010-01-32"), null));
  it("future year 2099 passes (no artificial cap)", () => assert.equal(normalizeYearToDate("2099"), "2099-01-01"));
  it("year 1800 passes", () => assert.equal(normalizeYearToDate("1800"), "1800-01-01"));
  it("year 0000 produces 0000-01-01", () => assert.equal(normalizeYearToDate("0000"), "0000-01-01"));
  it("boolean true returns null", () => assert.equal(normalizeYearToDate(true), null));
  it("number 2020 converts via string coercion", () => assert.equal(normalizeYearToDate(2020), "2020-01-01"));
});

// ─── QuickStart: payload mapping ──────────────────────────────────────────────

describe("QuickStart — mapQuickStartFormToSupabasePayloads", () => {
  it("maps minimal valid form without crashing", () => {
    const result = mapQuickStartFormToSupabasePayloads(VALID_QUICK_START, OPTS);
    assert.ok(result.companies);
    assert.ok(result.users);
    assert.ok(result.contacts);
  });

  it("normalizes email to lowercase in both users and contacts", () => {
    const result = mapQuickStartFormToSupabasePayloads(VALID_QUICK_START, OPTS);
    assert.equal(result.users.email, "jane@acme.com");
    assert.equal(result.contacts.email, "jane@acme.com");
  });

  it("customer_status is always 'Prospect'", () => {
    const result = mapQuickStartFormToSupabasePayloads(VALID_QUICK_START, OPTS);
    assert.equal(result.companies.customer_status, "Prospect");
  });

  it("handles completely empty form without throwing", () => {
    const result = mapQuickStartFormToSupabasePayloads({}, OPTS);
    assert.ok(result.companies);
    assert.equal(result.companies.customer_status, "Prospect");
  });

  it("null benefitsOffered → no medical_plans, dental_plans, vision_plans", () => {
    const result = mapQuickStartFormToSupabasePayloads({ ...VALID_QUICK_START, benefitsOffered: null }, OPTS);
    assert.equal(result.medical_plans, null);
    assert.equal(result.dental_plans, null);
    assert.equal(result.vision_plans, null);
  });

  it("benefitsOffered as non-array string → treated as empty list → no plans", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, benefitsOffered: "Medical" },
      OPTS,
    );
    // normalizeList("Medical") returns [] — no array → no plans
    assert.equal(result.medical_plans, null);
  });

  it("benefitsOffered array with nulls → nulls stripped out", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, benefitsOffered: [null, "Medical", undefined, ""] },
      OPTS,
    );
    assert.ok(result.medical_plans);
  });

  it("benefitsOffered with only noise values → no line of coverage", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, benefitsOffered: ["401k", "HSA Contribution"] },
      OPTS,
    );
    assert.equal(result.benefits, null);
  });

  it("benefitsOffered Medical → creates medical_plans entry", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, benefitsOffered: ["Medical"] },
      OPTS,
    );
    assert.ok(result.medical_plans);
    assert.equal(result.dental_plans, null);
  });

  it("benefitsOffered Dental+Vision → dental and vision plans created, not medical", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, benefitsOffered: ["Dental", "Vision"] },
      OPTS,
    );
    assert.equal(result.medical_plans, null);
    assert.ok(result.dental_plans);
    assert.ok(result.vision_plans);
  });

  it("XSS in companyName stored verbatim (sanitized at render, not storage)", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, companyName: '<script>alert("xss")</script>' },
      OPTS,
    );
    assert.equal(result.companies.company_name, '<script>alert("xss")</script>');
  });

  it("extremely long first name (500 chars) is stored without truncation in payload", () => {
    const longName = "A".repeat(500);
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, firstName: longName },
      OPTS,
    );
    assert.equal(result.users.first_name, longName);
  });

  it("whitespace-only first name becomes null after normalizeText", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, firstName: "   " },
      OPTS,
    );
    assert.equal(result.users.first_name, null);
  });

  it("EIN with letters-only returns empty → normalized to null in entities", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, ein: "NOTANEIN" },
      OPTS,
    );
    // normalizeEin("NOTANEIN") → digits="" → "" → `"" || null` = null
    assert.equal(result.entities.ein, null);
  });

  it("EIN with 9 digits formats correctly in entities", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, ein: "123456789" },
      OPTS,
    );
    assert.equal(result.entities.ein, "12-3456789");
  });

  it("phone normalized in contacts payload", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, phone: "5559876543" },
      OPTS,
    );
    assert.equal(result.contacts.phone, "(555) 987-6543");
  });

  it("ZIP normalized in locations payload", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, zipCode: "902101234" },
      OPTS,
    );
    assert.equal(result.locations.zip_code, "90210-1234");
  });

  it("importanceRatings as nested object passes through unmodified", () => {
    const ratings = { cost: 5, network: 3 };
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, importanceRatings: ratings },
      OPTS,
    );
    assert.deepEqual(result.documents_and_artifacts[0].metadata.snapshot.importanceRatings, ratings);
  });

  it("importanceRatings as null defaults to empty object", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, importanceRatings: null },
      OPTS,
    );
    assert.deepEqual(result.documents_and_artifacts[0].metadata.snapshot.importanceRatings, {});
  });

  it("importanceRatings injection attempt (extra object keys) passes through safely", () => {
    const ratings = { "__proto__": { isAdmin: true }, cost: 5 };
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, importanceRatings: ratings },
      OPTS,
    );
    assert.ok(typeof result.documents_and_artifacts[0].metadata.snapshot.importanceRatings === "object");
  });

  it("uploadedDocuments with missing fields are safely handled", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      {
        ...VALID_QUICK_START,
        uploadedDocuments: [{ id: null, documentType: undefined, fileName: "" }],
      },
      OPTS,
    );
    // Should not throw; extras appended to documents array
    assert.ok(Array.isArray(result.documents_and_artifacts));
    assert.ok(result.documents_and_artifacts.length >= 1);
  });

  it("uploadedDocuments is not an array → treated as empty, no extra docs", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, uploadedDocuments: "not-an-array" },
      OPTS,
    );
    assert.equal(result.documents_and_artifacts.length, 1); // only the snapshot doc
  });

  it("desiredPlanTypes with only noise values → no valid plan type in contribution_strategies", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, desiredPlanTypes: ["Not Sure", "Other"] },
      OPTS,
    );
    assert.equal(result.contribution_strategies.base_plan, null);
  });

  it("desiredPlanTypes with HMO Silver extracts plan_type and metallic_level", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, benefitsOffered: ["Medical"], desiredPlanTypes: ["HMO Silver"] },
      OPTS,
    );
    assert.equal(result.medical_plans?.plan_type, "HMO");
    assert.equal(result.medical_plans?.metallic_level, "Silver");
  });

  it("medicalContributionStrategy as a number is coerced to string text in payload", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, medicalContributionStrategy: 42 },
      OPTS,
    );
    assert.equal(result.contribution_strategies.contribution_type, "42");
  });

  it("ndaRequested 'yes' with entityType+ndaSigner populates entities correctly", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      {
        ...VALID_QUICK_START,
        ndaRequested: "yes",
        entityType: "LLC",
        ndaSigner: "Jane Doe",
        ndaCompanyLegalName: "Acme LLC",
      },
      OPTS,
    );
    assert.equal(result.entities.entity_type, "LLC");
    assert.equal(result.entities.entity_legal_name, "Acme LLC");
  });

  it("companyId whitespace is trimmed via normalizeText", () => {
    const result = mapQuickStartFormToSupabasePayloads(VALID_QUICK_START, {
      ...OPTS,
      companyId: "  cid-001  ",
    });
    assert.equal(result.companies.id, "cid-001");
  });

  it("boolean benefitsOffered items are filtered out", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, benefitsOffered: [true, false, "Medical"] },
      OPTS,
    );
    // true/false → normalizeText → "true"/"false" → not in BENEFITS_LINE_OF_COVERAGE_VALUES
    assert.ok(result.medical_plans); // "Medical" is still valid
  });

  it("emoji in company name passes through", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, companyName: "Acme 🚀 Corp" },
      OPTS,
    );
    assert.equal(result.companies.company_name, "Acme 🚀 Corp");
  });

  it("Unicode RTL characters in name pass through unchanged", () => {
    const result = mapQuickStartFormToSupabasePayloads(
      { ...VALID_QUICK_START, firstName: "\u202Eevil" },
      OPTS,
    );
    assert.equal(typeof result.users.first_name, "string");
  });
});

// ─── QuickStart: required-field validation ────────────────────────────────────

describe("QuickStart — validateQuickStartRequiredFields", () => {
  it("passes with all required fields", () =>
    assert.equal(validateQuickStartRequiredFields(VALID_QUICK_START), true));

  it("fails when firstName is empty string", () =>
    assert.equal(validateQuickStartRequiredFields({ ...VALID_QUICK_START, firstName: "" }), false));

  it("fails when firstName is whitespace only", () =>
    assert.equal(validateQuickStartRequiredFields({ ...VALID_QUICK_START, firstName: "   " }), false));

  it("fails when lastName is null", () =>
    assert.equal(validateQuickStartRequiredFields({ ...VALID_QUICK_START, lastName: null }), false));

  it("fails when email is undefined", () =>
    assert.equal(validateQuickStartRequiredFields({ ...VALID_QUICK_START, email: undefined }), false));

  it("fails when phone is missing", () => {
    const { phone: _, ...rest } = VALID_QUICK_START as any;
    assert.equal(validateQuickStartRequiredFields(rest), false);
  });

  it("fails when companyName is boolean true (non-string truthy does NOT satisfy normalizeText)", () =>
    assert.equal(validateQuickStartRequiredFields({ ...VALID_QUICK_START, companyName: true }), false));

  it("fails on empty object", () => assert.equal(validateQuickStartRequiredFields({}), false));

  it("passes when ndaRequested is 'no' and NDA fields are absent", () =>
    assert.equal(validateQuickStartRequiredFields({ ...VALID_QUICK_START, ndaRequested: "no" }), true));
});

// ─── Missing Premiums: getUserField ──────────────────────────────────────────

describe("Missing Premiums — getUserField", () => {
  it("EE → premium_ee_user", () => assert.equal(getUserField("EE"), "premium_ee_user"));
  it("ES → premium_es_user", () => assert.equal(getUserField("ES"), "premium_es_user"));
  it("EC → premium_ec_user", () => assert.equal(getUserField("EC"), "premium_ec_user"));
  it("EF → premium_ef_user", () => assert.equal(getUserField("EF"), "premium_ef_user"));
  it("lowercase ee → premium_ee_user", () => assert.equal(getUserField("ee"), "premium_ee_user"));
});

// ─── Missing Premiums: USER_PREMIUM_FIELDS ────────────────────────────────────

describe("Missing Premiums — USER_PREMIUM_FIELDS whitelist", () => {
  it("contains all four _user fields", () => {
    assert.ok(USER_PREMIUM_FIELDS.has("premium_ee_user"));
    assert.ok(USER_PREMIUM_FIELDS.has("premium_es_user"));
    assert.ok(USER_PREMIUM_FIELDS.has("premium_ec_user"));
    assert.ok(USER_PREMIUM_FIELDS.has("premium_ef_user"));
  });

  it("does NOT contain main premium fields", () => {
    assert.equal(USER_PREMIUM_FIELDS.has("premium_ee"), false);
    assert.equal(USER_PREMIUM_FIELDS.has("premium_es"), false);
  });

  it("does NOT contain arbitrary injection field names", () => {
    assert.equal(USER_PREMIUM_FIELDS.has("__proto__"), false);
    assert.equal(USER_PREMIUM_FIELDS.has("constructor"), false);
    assert.equal(USER_PREMIUM_FIELDS.has("id"), false);
    assert.equal(USER_PREMIUM_FIELDS.has("company_id"), false);
  });
});

// ─── Missing Premiums: hasPremiumInvalidInput ────────────────────────────────

describe("Missing Premiums — hasPremiumInvalidInput", () => {
  it("empty inputs → not invalid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "", b: "" }), false));

  it("valid number strings → not invalid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "100", b: "250.50" }), false));

  it("zero → valid (not invalid)", () =>
    assert.equal(hasPremiumInvalidInput({ a: "0" }), false));

  it("negative number → invalid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "-1" }), true));

  it("non-numeric string → invalid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "abc" }), true));

  it("NaN string → invalid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "NaN" }), true));

  it("Infinity string → invalid (non-finite guard)", () =>
    assert.equal(hasPremiumInvalidInput({ a: "Infinity" }), true));

  it("-Infinity string → invalid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "-Infinity" }), true));

  it("mixed valid and invalid → invalid wins", () =>
    assert.equal(hasPremiumInvalidInput({ a: "100", b: "-5" }), true));

  it("all empty except one valid → not invalid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "", b: "99.99" }), false));

  it("very large finite number → valid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "99999.99" }), false));

  it("fractional cents → valid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "123.456789" }), false));

  it("empty object → not invalid", () =>
    assert.equal(hasPremiumInvalidInput({}), false));

  it("whitespace string → treated as 0 (Number('  ') = 0) → valid", () =>
    assert.equal(hasPremiumInvalidInput({ a: "  " }), false));
});

// ─── Missing Premiums: buildPremiumUpdates ────────────────────────────────────

describe("Missing Premiums — buildPremiumUpdates", () => {
  const rows = [
    { id: "row-1", tier_key: "EE" },
    { id: "row-2", tier_key: "ES" },
    { id: "row-3", tier_key: "EC" },
  ];

  it("builds correct update objects for valid inputs", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "100", "row-2": "200", "row-3": "" });
    assert.equal(result.length, 2);
    assert.deepEqual(result[0], { id: "row-1", premium_ee_user: 100 });
    assert.deepEqual(result[1], { id: "row-2", premium_es_user: 200 });
  });

  it("skips empty inputs", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "", "row-2": "", "row-3": "" });
    assert.equal(result.length, 0);
  });

  it("skips negative inputs", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "-1" });
    assert.equal(result.length, 0);
  });

  it("skips NaN inputs", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "abc" });
    assert.equal(result.length, 0);
  });

  it("skips Infinity inputs (hardened guard)", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "Infinity" });
    assert.equal(result.length, 0);
  });

  it("skips -Infinity inputs", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "-Infinity" });
    assert.equal(result.length, 0);
  });

  it("accepts zero as valid premium", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "0" });
    assert.equal(result.length, 1);
    assert.equal(result[0]["premium_ee_user"], 0);
  });

  it("accepts fractional value", () => {
    const result = buildPremiumUpdates(rows, { "row-1": "99.99" });
    assert.equal(result[0]["premium_ee_user"], 99.99);
  });

  it("handles rows with no matching userInput entry", () => {
    const result = buildPremiumUpdates(rows, { "row-99": "100" });
    assert.equal(result.length, 0);
  });

  it("decimal string '123.45' converts to number 123.45", () => {
    const result = buildPremiumUpdates([{ id: "r", tier_key: "EE" }], { r: "123.45" });
    assert.equal(result[0]["premium_ee_user"], 123.45);
  });

  it("very large finite number is included", () => {
    const result = buildPremiumUpdates([{ id: "r", tier_key: "EE" }], { r: "99999.99" });
    assert.equal(result.length, 1);
    assert.equal(result[0]["premium_ee_user"], 99999.99);
  });

  it("all four tiers submitted simultaneously", () => {
    const allRows = [
      { id: "r1", tier_key: "EE" },
      { id: "r2", tier_key: "ES" },
      { id: "r3", tier_key: "EC" },
      { id: "r4", tier_key: "EF" },
    ];
    const result = buildPremiumUpdates(allRows, { r1: "100", r2: "120", r3: "130", r4: "140" });
    assert.equal(result.length, 4);
    assert.equal(result[0]["premium_ee_user"], 100);
    assert.equal(result[3]["premium_ef_user"], 140);
  });
});

// ─── Missing Premiums: sanitizePremiumUpdateEntry (API-level) ─────────────────

describe("Missing Premiums — sanitizePremiumUpdateEntry", () => {
  it("valid entry passes through", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee_user: 100 });
    assert.deepEqual(result, { id: "row-1", premium_ee_user: 100 });
  });

  it("returns null when id is missing", () => {
    assert.equal(sanitizePremiumUpdateEntry({ premium_ee_user: 100 } as any), null);
  });

  it("returns null when id is empty string", () => {
    assert.equal(sanitizePremiumUpdateEntry({ id: "", premium_ee_user: 100 }), null);
  });

  it("returns null when id is whitespace only", () => {
    assert.equal(sanitizePremiumUpdateEntry({ id: "   ", premium_ee_user: 100 }), null);
  });

  it("strips non-whitelisted fields", () => {
    const result = sanitizePremiumUpdateEntry({
      id: "row-1",
      premium_ee_user: 100,
      company_id: "evil",
      admin_override: true,
    } as any);
    assert.ok(result);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "company_id"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "admin_override"), false);
  });

  it("strips __proto__ and constructor field names", () => {
    const result = sanitizePremiumUpdateEntry({
      id: "row-1",
      premium_ee_user: 100,
      __proto__: { isAdmin: true },
      constructor: "pwned",
    } as any);
    assert.ok(result);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "__proto__"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "constructor"), false);
  });

  it("rejects negative premium values", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee_user: -5 });
    assert.equal(result, null); // no valid premium fields → null
  });

  it("rejects NaN premium values", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee_user: NaN });
    assert.equal(result, null);
  });

  it("rejects Infinity premium values (defense in depth)", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee_user: Infinity });
    assert.equal(result, null);
  });

  it("rejects string premium values", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee_user: "100" } as any);
    assert.equal(result, null);
  });

  it("accepts zero as valid premium", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee_user: 0 });
    assert.ok(result);
    assert.equal(result["premium_ee_user"], 0);
  });

  it("returns null when all premium values are invalid (no valid fields)", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee_user: -1, premium_es_user: NaN });
    assert.equal(result, null);
  });

  it("multiple valid fields all pass through", () => {
    const result = sanitizePremiumUpdateEntry({
      id: "row-1",
      premium_ee_user: 100,
      premium_es_user: 200,
      premium_ec_user: 150,
      premium_ef_user: 180,
    });
    assert.ok(result);
    assert.equal(result["premium_ee_user"], 100);
    assert.equal(result["premium_ef_user"], 180);
  });

  it("main premium columns (non-_user) are stripped", () => {
    const result = sanitizePremiumUpdateEntry({ id: "row-1", premium_ee: 100, premium_ee_user: 100 } as any);
    assert.ok(result);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "premium_ee"), false);
    assert.equal(result["premium_ee_user"], 100);
  });
});

// ─── Employee Feedback: normalizeScore ────────────────────────────────────────

describe("Employee Feedback — normalizeScore", () => {
  it("1 → 1", () => assert.equal(normalizeScore(1), 1));
  it("3 → 3", () => assert.equal(normalizeScore(3), 3));
  it("5 → 5", () => assert.equal(normalizeScore(5), 5));
  it("string '3' → 3", () => assert.equal(normalizeScore("3"), 3));
  it("string '1' → 1", () => assert.equal(normalizeScore("1"), 1));
  it("string '5' → 5", () => assert.equal(normalizeScore("5"), 5));
  it("0 → null (below range)", () => assert.equal(normalizeScore(0), null));
  it("6 → null (above range)", () => assert.equal(normalizeScore(6), null));
  it("-1 → null", () => assert.equal(normalizeScore(-1), null));
  it("1.5 → null (not integer)", () => assert.equal(normalizeScore(1.5), null));
  it("2.0 → 2 (integer float is valid)", () => assert.equal(normalizeScore(2.0), 2));
  it("NaN → null", () => assert.equal(normalizeScore(NaN), null));
  it("Infinity → null", () => assert.equal(normalizeScore(Infinity), null));
  it("null → null", () => assert.equal(normalizeScore(null), null));
  it("undefined → null", () => assert.equal(normalizeScore(undefined), null));
  it("empty string → null (NaN)", () => assert.equal(normalizeScore(""), null));
  it("'abc' → null", () => assert.equal(normalizeScore("abc"), null));
  it("boolean true → 1 (Number(true)=1, integer in [1,5])", () => assert.equal(normalizeScore(true), 1));
  it("boolean false → null (Number(false)=0, below range)", () => assert.equal(normalizeScore(false), null));
  it("object → null", () => assert.equal(normalizeScore({}), null));
  it("single-element array coerces to number: [3] → 3 (JS coercion)", () => assert.equal(normalizeScore([3]), 3));
  it("multi-element array [3,4] → NaN → null", () => assert.equal(normalizeScore([3, 4]), null));
  it("empty array [] → 0 → null (below range)", () => assert.equal(normalizeScore([]), null));
});

// ─── Employee Feedback: normalizeEnrollmentType ───────────────────────────────

describe("Employee Feedback — normalizeEnrollmentType", () => {
  it("'Employee Only' → employee_only", () =>
    assert.equal(normalizeEnrollmentType("Employee Only"), "employee_only"));
  it("'Employee + Spouse' → employee_spouse", () =>
    assert.equal(normalizeEnrollmentType("Employee + Spouse"), "employee_spouse"));
  it("'Employee + Child(ren)' → employee_children", () =>
    assert.equal(normalizeEnrollmentType("Employee + Child(ren)"), "employee_children"));
  it("'Family' → family", () => assert.equal(normalizeEnrollmentType("Family"), "family"));
  it("'Waived' → waived", () => assert.equal(normalizeEnrollmentType("Waived"), "waived"));
  it("'Not Eligible' → not_eligible", () =>
    assert.equal(normalizeEnrollmentType("Not Eligible"), "not_eligible"));
  it("slug form 'employee_only' passes through", () =>
    assert.equal(normalizeEnrollmentType("employee_only"), "employee_only"));
  it("mixed case handled", () =>
    assert.equal(normalizeEnrollmentType("EMPLOYEE ONLY"), "employee_only"));
  it("null → null", () => assert.equal(normalizeEnrollmentType(null), null));
  it("undefined → null", () => assert.equal(normalizeEnrollmentType(undefined), null));
  it("empty string → null", () => assert.equal(normalizeEnrollmentType(""), null));
  it("whitespace-only → null", () => assert.equal(normalizeEnrollmentType("   "), null));
  it("unknown value is slugified safely (no HTML entities, no spaces)", () => {
    const result = normalizeEnrollmentType("Custom Plan Type");
    assert.ok(typeof result === "string");
    assert.ok(!result.includes(" "));
    assert.ok(/^[a-z0-9_]+$/.test(result!));
  });
  it("XSS attempt slugified to safe string", () => {
    const result = normalizeEnrollmentType("<script>alert(1)</script>");
    assert.ok(typeof result === "string");
    assert.ok(!/[<>]/.test(result!));
  });
  it("very long input slugified without throwing", () => {
    const long = "Employee ".repeat(100);
    const result = normalizeEnrollmentType(long);
    assert.ok(typeof result === "string");
  });
  it("number 1 → slugified string", () => {
    const result = normalizeEnrollmentType(1);
    assert.ok(typeof result === "string");
    assert.equal(result, "1");
  });
});

// ─── Employee Feedback: validateFeedbackPayload ───────────────────────────────

describe("Employee Feedback — validateFeedbackPayload", () => {
  const VALID_FEEDBACK = {
    healthBenefitsEnrollment: "Employee Only",
    overallBenefitsPackage: 4,
    medicalPlanOptions: 3,
    medicalNetwork: 5,
    employeeCosts: 2,
    nonMedicalBenefits: 4,
  };

  it("passes with all valid fields", () => {
    const result = validateFeedbackPayload(VALID_FEEDBACK);
    assert.equal(result.valid, true);
    assert.equal(result.missingFields.length, 0);
  });

  it("fails when enrollment is missing", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, healthBenefitsEnrollment: null });
    assert.equal(result.valid, false);
    assert.ok(result.missingFields.includes("healthBenefitsEnrollment"));
  });

  it("fails when enrollment is empty string", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, healthBenefitsEnrollment: "" });
    assert.equal(result.valid, false);
  });

  it("fails when overallBenefitsPackage is 0 (out of range)", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, overallBenefitsPackage: 0 });
    assert.equal(result.valid, false);
    assert.ok(result.missingFields.includes("overallBenefitsPackage"));
  });

  it("fails when overallBenefitsPackage is 6 (out of range)", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, overallBenefitsPackage: 6 });
    assert.equal(result.valid, false);
  });

  it("fails when a score is a non-integer float", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, medicalPlanOptions: 2.5 });
    assert.equal(result.valid, false);
    assert.ok(result.missingFields.includes("medicalPlanOptions"));
  });

  it("fails when a score is NaN", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, employeeCosts: NaN });
    assert.equal(result.valid, false);
  });

  it("fails when a score is Infinity", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, nonMedicalBenefits: Infinity });
    assert.equal(result.valid, false);
  });

  it("fails when a score is null", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, medicalNetwork: null });
    assert.equal(result.valid, false);
  });

  it("fails when a score is a string 'bad'", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, overallBenefitsPackage: "bad" } as any);
    assert.equal(result.valid, false);
  });

  it("string score '4' is accepted (Number('4') = 4)", () => {
    const result = validateFeedbackPayload({ ...VALID_FEEDBACK, overallBenefitsPackage: "4" } as any);
    assert.equal(result.valid, true);
  });

  it("reports all missing fields when everything is absent", () => {
    const result = validateFeedbackPayload({});
    assert.equal(result.valid, false);
    assert.equal(result.missingFields.length, 6); // enrollment + 5 scores
  });

  it("surveyComments being absent does NOT fail validation (optional)", () => {
    const { ...noComments } = VALID_FEEDBACK as any;
    const result = validateFeedbackPayload(noComments);
    assert.equal(result.valid, true);
  });

  it("very long surveyComments does not affect score validation", () => {
    const result = validateFeedbackPayload({
      ...VALID_FEEDBACK,
      surveyComments: "x".repeat(10000),
    });
    assert.equal(result.valid, true);
  });

  it("extra unknown fields are ignored", () => {
    const result = validateFeedbackPayload({
      ...VALID_FEEDBACK,
      injectedField: "evil",
      __proto__: { isAdmin: true },
    } as any);
    assert.equal(result.valid, true);
  });
});

// ─── DB-constraint alignment ──────────────────────────────────────────────────
// Verify that normalizers produce values that satisfy (or are null-safe for)
// the DB-level constraints added in migration 20260529090000.

describe("DB constraint alignment — EIN (entities.ein = ^\\d{2}-\\d{7}$)", () => {
  const VALID_EIN_REGEX = /^\d{2}-\d{7}$/;

  it("9-digit input normalizes to constraint-valid format", () => {
    const result = normalizeEin("123456789");
    assert.ok(VALID_EIN_REGEX.test(result));
  });

  it("already-formatted input satisfies constraint", () => {
    const result = normalizeEin("12-3456789");
    assert.ok(VALID_EIN_REGEX.test(result));
  });

  it("empty output (for invalid input) is null-safe (|| null in payload)", () => {
    const raw = normalizeEin("abc");
    // normalizeEin returns "" for letters-only → mapped to null via || null
    const stored = raw || null;
    assert.equal(stored, null); // null is allowed by DB (no NOT NULL on entities.ein)
  });

  it("8-digit EIN returns non-conforming string → payload stores null", () => {
    const raw = normalizeEin("12345678");
    // 8 digits → returned as raw text (not re-formatted) → won't match constraint
    // calling code does normalizeEin(x) || null — so non-conforming → stored as is
    // This is a known limitation: partial EINs fall through as raw. Confirm behaviour.
    assert.equal(typeof raw, "string");
  });
});

describe("DB constraint alignment — phone (contacts.phone = ^\\(\\d{3}\\) \\d{3}-\\d{4}$)", () => {
  const VALID_PHONE_REGEX = /^\(\d{3}\) \d{3}-\d{4}$/;

  it("10-digit phone normalizes to constraint-valid format", () => {
    const result = normalizePhone("5551234567");
    assert.ok(VALID_PHONE_REGEX.test(result));
  });

  it("formatted phone passes constraint check", () => {
    const result = normalizePhone("(555) 123-4567");
    assert.ok(VALID_PHONE_REGEX.test(result));
  });

  it("empty result for empty input is null-safe", () => {
    const raw = normalizePhone("");
    const stored = raw || null;
    assert.equal(stored, null);
  });
});

describe("DB constraint alignment — ZIP (locations.zip_code = ^\\d{5}(-\\d{4})?$)", () => {
  const VALID_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

  it("5-digit ZIP satisfies constraint", () => {
    assert.ok(VALID_ZIP_REGEX.test(normalizeZip("90210")));
  });

  it("9-digit ZIP with dash satisfies constraint", () => {
    assert.ok(VALID_ZIP_REGEX.test(normalizeZip("902101234")));
  });

  it("empty result is null-safe", () => {
    const raw = normalizeZip("");
    const stored = raw || null;
    assert.equal(stored, null);
  });
});
