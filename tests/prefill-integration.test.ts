/**
 * Pre-Fill Integration — edge-case test suite.
 *
 * Covers preFillUtils (isEmpty, mapPreFillFields, safeMerge),
 * formPreFillMappings (compile, registry entries), and the
 * companyPreFillCache helpers.
 *
 * Run with:  tsx --test tests/prefill-integration.test.ts
 */
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  isEmpty,
  mapPreFillFields,
  safeMerge,
} from "../lib/prefill/preFillUtils";
import {
  FORM_PREFILL_MAPPINGS,
} from "../lib/prefill/formPreFillMappings";
import {
  getPreFillCache,
  setPreFillCache,
  clearPreFillCache,
} from "../lib/prefill/companyPreFillCache";

// ─── Full group-data response fixture ────────────────────────────────────────

const FULL_GROUP_DATA_FIELDS: Record<string, unknown> = {
  "Company Name": "Acme Corp",
  "EIN": "12-3456789",
  "Entity Type": "C-Corp",
  "Entity Legal Name": "Acme Corporation LLC",
  "SIC Code": "7372",
  "Preferred SIC Code": "7372",
  "NAICS Code": "541511",
  "Preferred NAICS Code": "541511",
  "Website": "https://acme.example.com",
  "Street Address": "123 Main St",
  "Address": "123 Main St",
  "City": "Springfield",
  "State / Province": "IL",
  "ZIP Code": "62701",
  "First Name": "Jane",
  "Last Name": "Doe",
  "Job Title": "HR Director",
  "Phone Number": "(555) 123-4567",
  "Work Email": "jane@acme.example.com",
  "Estimated Benefit Eligible EEs": "150",
  "Estimated Medical Enrolled EEs": "120",
  "Renewal Month": "January",
  "Current PEO": "Insperity",
  "HR Software Used": "Workday",
};

// ─── isEmpty ─────────────────────────────────────────────────────────────────

describe("isEmpty", () => {
  it("treats null as empty", () => assert.equal(isEmpty(null), true));
  it("treats undefined as empty", () => assert.equal(isEmpty(undefined), true));
  it("treats empty string as empty", () => assert.equal(isEmpty(""), true));
  it("treats whitespace-only string as empty", () => assert.equal(isEmpty("   "), true));
  it("treats empty array as empty", () => assert.equal(isEmpty([]), true));
  it("does NOT treat 0 as empty (falsy but valid value)", () => assert.equal(isEmpty(0), false));
  it("does NOT treat false as empty", () => assert.equal(isEmpty(false), false));
  it("does NOT treat non-empty string as empty", () => assert.equal(isEmpty("hello"), false));
  it("does NOT treat non-empty array as empty", () => assert.equal(isEmpty(["a"]), false));
  it("does NOT treat an object as empty", () => assert.equal(isEmpty({}), false));
  it("does NOT treat a plain number as empty", () => assert.equal(isEmpty(42), false));
  it("does NOT treat negative zero as empty", () => assert.equal(isEmpty(-0), false));
  it("does NOT treat NaN as empty (caller must validate separately)", () => assert.equal(isEmpty(NaN), false));
  it("does NOT treat Infinity as empty", () => assert.equal(isEmpty(Infinity), false));
});

// ─── mapPreFillFields ─────────────────────────────────────────────────────────

describe("mapPreFillFields", () => {
  const mapping = {
    "Company Name": "companyName",
    "First Name": "firstName",
    "Work Email": "email",
    "Phone Number": "phone",
  };

  it("maps all present fields", () => {
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, mapping);
    assert.equal(result.companyName, "Acme Corp");
    assert.equal(result.firstName, "Jane");
    assert.equal(result.email, "jane@acme.example.com");
    assert.equal(result.phone, "(555) 123-4567");
  });

  it("excludes null values from result", () => {
    const fields = { "Company Name": null, "First Name": "Jane" };
    const result = mapPreFillFields(fields as any, mapping);
    assert.equal("companyName" in result, false);
    assert.equal(result.firstName, "Jane");
  });

  it("excludes undefined values from result", () => {
    const fields = { "Company Name": undefined, "First Name": "Jane" };
    const result = mapPreFillFields(fields as any, mapping);
    assert.equal("companyName" in result, false);
  });

  it("excludes empty string values", () => {
    const fields = { "Company Name": "", "First Name": "Jane" };
    const result = mapPreFillFields(fields, mapping);
    assert.equal("companyName" in result, false);
  });

  it("excludes whitespace-only string values", () => {
    const fields = { "Company Name": "   ", "First Name": "Jane" };
    const result = mapPreFillFields(fields, mapping);
    assert.equal("companyName" in result, false);
  });

  it("preserves 0 (valid numeric value)", () => {
    const m = { "Count": "employeeCount" };
    const result = mapPreFillFields({ "Count": 0 }, m);
    assert.equal(result.employeeCount, 0);
  });

  it("preserves false (valid boolean value)", () => {
    const m = { "Flag": "ndaRequested" };
    const result = mapPreFillFields({ "Flag": false }, m);
    assert.equal(result.ndaRequested, false);
  });

  it("returns empty object for empty source fields", () => {
    const result = mapPreFillFields({}, mapping);
    assert.deepEqual(result, {});
  });

  it("returns empty object when no source keys match mapping", () => {
    const result = mapPreFillFields({ "Unrelated Field": "value" }, mapping);
    assert.deepEqual(result, {});
  });

  it("handles sourceFields with special characters in names", () => {
    const m = { "State / Province": "state" };
    const result = mapPreFillFields({ "State / Province": "CA" }, m);
    assert.equal(result.state, "CA");
  });

  it("does not mutate the source fields object", () => {
    const fields = { "Company Name": "Acme" };
    const before = JSON.stringify(fields);
    mapPreFillFields(fields, mapping);
    assert.equal(JSON.stringify(fields), before);
  });

  it("handles very long string values without truncating", () => {
    const longName = "A".repeat(500);
    const result = mapPreFillFields({ "Company Name": longName }, mapping);
    assert.equal(result.companyName, longName);
  });

  it("handles XSS-like strings as opaque data (stored, not executed)", () => {
    const xss = '<script>alert("xss")</script>';
    const result = mapPreFillFields({ "Company Name": xss }, mapping);
    assert.equal(result.companyName, xss);
  });

  it("handles SQL-injection-like strings as opaque data", () => {
    const sqli = "'; DROP TABLE companies; --";
    const result = mapPreFillFields({ "Company Name": sqli }, mapping);
    assert.equal(result.companyName, sqli);
  });

  it("handles Unicode and emoji in string values", () => {
    const unicode = "Acme 株式会社 🎉";
    const result = mapPreFillFields({ "Company Name": unicode }, mapping);
    assert.equal(result.companyName, unicode);
  });

  it("does not include extra keys beyond the mapping", () => {
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, mapping);
    const keys = Object.keys(result);
    assert.deepEqual(keys.sort(), ["companyName", "email", "firstName", "phone"].sort());
  });
});

// ─── safeMerge ────────────────────────────────────────────────────────────────

describe("safeMerge", () => {
  it("applies pre-fill to empty form", () => {
    const result = safeMerge({}, {}, { firstName: "Jane", companyName: "Acme" });
    assert.equal(result.firstName, "Jane");
    assert.equal(result.companyName, "Acme");
  });

  it("does NOT overwrite user-dirty fields", () => {
    const current = { firstName: "Bob" };
    const dirty = { firstName: true };
    const preFill = { firstName: "Jane", email: "jane@example.com" };
    const result = safeMerge(current, dirty, preFill);
    assert.equal(result.firstName, "Bob");
    assert.equal(result.email, "jane@example.com");
  });

  it("does NOT overwrite existing non-empty clean values", () => {
    const current = { companyName: "Existing Corp" };
    const dirty = {};
    const preFill = { companyName: "New Corp" };
    const result = safeMerge(current, dirty, preFill);
    assert.equal(result.companyName, "Existing Corp");
  });

  it("fills empty fields that are not dirty", () => {
    const current = { firstName: "" };
    const dirty = {};
    const preFill = { firstName: "Jane" };
    const result = safeMerge(current, dirty, preFill);
    assert.equal(result.firstName, "Jane");
  });

  it("fills null fields that are not dirty", () => {
    const current = { firstName: null };
    const dirty = {};
    const preFill = { firstName: "Jane" };
    const result = safeMerge(current as any, dirty, preFill);
    assert.equal(result.firstName, "Jane");
  });

  it("fills undefined fields that are not dirty", () => {
    const current = { firstName: undefined };
    const dirty = {};
    const preFill = { firstName: "Jane" };
    const result = safeMerge(current as any, dirty, preFill);
    assert.equal(result.firstName, "Jane");
  });

  it("does NOT fill a dirty field even when current value is empty", () => {
    const current = { firstName: "" };
    const dirty = { firstName: true };
    const preFill = { firstName: "Jane" };
    const result = safeMerge(current, dirty, preFill);
    assert.equal(result.firstName, "");
  });

  it("preserves value=0 (falsy but non-empty) without overwriting", () => {
    const current = { count: 0 };
    const dirty = {};
    const preFill = { count: 999 };
    const result = safeMerge(current as any, dirty, preFill);
    assert.equal(result.count, 0);
  });

  it("preserves value=false (falsy but non-empty) without overwriting", () => {
    const current = { ndaRequested: false };
    const dirty = {};
    const preFill = { ndaRequested: true };
    const result = safeMerge(current as any, dirty, preFill);
    assert.equal(result.ndaRequested, false);
  });

  it("does not add new dirty-only fields that aren't in preFill", () => {
    const current = { extra: "keep" };
    const dirty = {};
    const preFill = { firstName: "Jane" };
    const result = safeMerge(current, dirty, preFill);
    assert.equal(result.extra, "keep");
  });

  it("skips pre-fill values that are null/undefined/empty", () => {
    const current = {};
    const preFill = { firstName: null, lastName: undefined, email: "" } as any;
    const result = safeMerge(current, {}, preFill);
    assert.equal("firstName" in result, false);
    assert.equal("lastName" in result, false);
    assert.equal("email" in result, false);
  });

  it("handles empty preFillValues gracefully", () => {
    const current = { firstName: "existing" };
    const result = safeMerge(current, {}, {});
    assert.equal(result.firstName, "existing");
  });

  it("does not mutate the currentValues object", () => {
    const current = { firstName: "" };
    const before = JSON.stringify(current);
    safeMerge(current, {}, { firstName: "Jane" });
    assert.equal(JSON.stringify(current), before);
  });

  it("does not mutate the dirtyFields object", () => {
    const dirty = { firstName: true };
    const before = JSON.stringify(dirty);
    safeMerge({ firstName: "" }, dirty, { firstName: "Jane" });
    assert.equal(JSON.stringify(dirty), before);
  });
});

// ─── FORM_PREFILL_MAPPINGS registry ──────────────────────────────────────────

describe("FORM_PREFILL_MAPPINGS registry", () => {
  // All form IDs that must have entries
  const EXPECTED_IDS = [
    // Quick Start (React form + Fillout aliases)
    "eBxXtLZdK4us",
    "jLwpyNvuB2us",
    // Benefits Pulse Survey
    "recmB9IdRhtgckvaY",
    // NDA
    "recySUNj6jv47SOKr",
    // Basic Intake
    "rechTHxZIxS3bBcqF",
    // Comprehensive Intake
    "recUnTZFK5UyfWqzm",
    // Quick Start New Benefits
    "reclUQ6KhVzCssuVl",
    // Quick Start Alt
    "recufWIRuSFArZ9GG",
    // Update Quickstart
    "rZhiEaUEskus",
    // Update PEO/HR (new)
    "gn6WNJPJKTus",
    // Broker Role (new)
    "recxH9Jrk10bbqU58",
    // HR Tech (new)
    "recOt6cX0t1DksDFT",
    // PEO/EOR Assessment (new)
    "recKzuznmqq29uASl",
  ];

  for (const formId of EXPECTED_IDS) {
    it(`has compiled entry for ${formId}`, () => {
      const entry = FORM_PREFILL_MAPPINGS[formId];
      assert.ok(entry, `Missing mapping for formId ${formId}`);
      assert.ok(typeof entry.fieldMap === "object", "fieldMap must be an object");
      assert.ok(typeof entry.readonlyFields === "object", "readonlyFields must be an object");
    });

    it(`${formId} fieldMap has at least one entry`, () => {
      const { fieldMap } = FORM_PREFILL_MAPPINGS[formId];
      assert.ok(Object.keys(fieldMap).length > 0, `fieldMap is empty for ${formId}`);
    });
  }

  // Form IDs whose source fields ARE strictly scoped to group-data keys.
  // Quick Start (eBxXtLZdK4us / jLwpyNvuB2us) intentionally includes extra
  // Fillout/Airtable legacy source field names not in the group-data endpoint
  // (e.g. "Year Company Founded"). Those map to nothing and are harmless — they
  // are excluded from this strict check.
  const STRICT_SOURCE_FIELD_IDS = EXPECTED_IDS.filter(
    (id) => id !== "eBxXtLZdK4us" && id !== "jLwpyNvuB2us"
  );

  for (const formId of STRICT_SOURCE_FIELD_IDS) {
    it(`${formId} fieldMap sourceFields are valid group-data keys`, () => {
      const VALID_SOURCE_FIELDS = new Set(Object.keys(FULL_GROUP_DATA_FIELDS));
      const { fieldMap } = FORM_PREFILL_MAPPINGS[formId];
      for (const sourceField of Object.keys(fieldMap)) {
        assert.ok(
          VALID_SOURCE_FIELDS.has(sourceField),
          `Unknown sourceField "${sourceField}" in mapping ${formId}; not returned by /api/forms/group-data`
        );
      }
    });
  }

  it("Quick Start eBxXtLZdK4us — known group-data fields ARE mapped", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["eBxXtLZdK4us"];
    const VALID_SOURCE_FIELDS = new Set(Object.keys(FULL_GROUP_DATA_FIELDS));
    const mappedGroupDataFields = Object.keys(fieldMap).filter((f) => VALID_SOURCE_FIELDS.has(f));
    assert.ok(mappedGroupDataFields.length >= 10, `Expected >=10 matching group-data fields, got ${mappedGroupDataFields.length}`);
  });

  it("NDA — companyLegalName is read-only (Betafits-managed)", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["recySUNj6jv47SOKr"];
    assert.equal(readonlyFields.companyLegalName, true);
  });

  it("NDA — EIN target field is read-only", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["recySUNj6jv47SOKr"];
    assert.equal(readonlyFields.employerIdentificationNumber, true);
  });

  it("Quick Start — no fields are read-only (client can confirm/edit)", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["eBxXtLZdK4us"];
    assert.equal(Object.keys(readonlyFields).length, 0);
  });

  it("Update PEO/HR — companyName is read-only (Betafits-managed)", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["gn6WNJPJKTus"];
    assert.equal(readonlyFields.companyName, true);
  });

  it("Update PEO/HR — currentPEO is editable (client may have switched)", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["gn6WNJPJKTus"];
    assert.equal(readonlyFields.currentPEO, undefined);
  });

  it("Broker Role — all fields are editable by client", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["recxH9Jrk10bbqU58"];
    assert.equal(Object.keys(readonlyFields).length, 0);
  });

  it("HR Tech — currentHRSystem is editable", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["recOt6cX0t1DksDFT"];
    assert.equal(readonlyFields.currentHRSystem, undefined);
  });

  it("PEO/EOR Assessment — currentPEO is editable", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["recKzuznmqq29uASl"];
    assert.equal(readonlyFields.currentPEO, undefined);
  });

  it("Benefits Pulse Survey — company field is read-only (Betafits-managed)", () => {
    const { readonlyFields } = FORM_PREFILL_MAPPINGS["recmB9IdRhtgckvaY"];
    assert.equal(readonlyFields.company, true);
  });

  it("Appont Betafits (recOE9pVakkobVzU7) intentionally absent — uses custom loader", () => {
    assert.equal(FORM_PREFILL_MAPPINGS["recOE9pVakkobVzU7"], undefined);
  });

  it("unknown form ID returns undefined (graceful no-op)", () => {
    assert.equal(FORM_PREFILL_MAPPINGS["nonExistentFormId_xyz"], undefined);
  });
});

// ─── End-to-end: mapPreFillFields using real registry mappings ─────────────────

describe("mapPreFillFields with real registry mappings", () => {
  it("Quick Start — maps firstName, lastName, email, phone, companyName", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["eBxXtLZdK4us"];
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, fieldMap);
    assert.equal(result.firstName, "Jane");
    assert.equal(result.lastName, "Doe");
    assert.equal(result.email, "jane@acme.example.com");
    assert.equal(result.phone, "(555) 123-4567");
    assert.equal(result.companyName, "Acme Corp");
  });

  it("Quick Start — maps EIN, address, city, state, zip", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["eBxXtLZdK4us"];
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, fieldMap);
    assert.equal(result.ein, "12-3456789");
    assert.equal(result.address, "123 Main St");
    assert.equal(result.city, "Springfield");
    assert.equal(result.stateProvince, "IL");
    assert.equal(result.zipCode, "62701");
  });

  it("Update PEO/HR — maps companyName, contact info, and currentPEO", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["gn6WNJPJKTus"];
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, fieldMap);
    assert.equal(result.companyName, "Acme Corp");
    assert.equal(result.firstName, "Jane");
    assert.equal(result.lastName, "Doe");
    assert.equal(result.title, "HR Director");
    assert.equal(result.phone, "(555) 123-4567");
    assert.equal(result.email, "jane@acme.example.com");
    assert.equal(result.currentPEO, "Insperity");
  });

  it("Broker Role — maps only contact fields (no company)", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["recxH9Jrk10bbqU58"];
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, fieldMap);
    assert.equal(result.firstName, "Jane");
    assert.equal(result.lastName, "Doe");
    assert.equal(result.phone, "(555) 123-4567");
    assert.equal(result.email, "jane@acme.example.com");
    assert.equal("companyName" in result, false);
  });

  it("HR Tech — maps HR Software Used → currentHRSystem", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["recOt6cX0t1DksDFT"];
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, fieldMap);
    assert.equal(result.currentHRSystem, "Workday");
  });

  it("PEO/EOR Assessment — maps Current PEO → currentPEO", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["recKzuznmqq29uASl"];
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, fieldMap);
    assert.equal(result.currentPEO, "Insperity");
  });

  it("HR Tech — returns empty object when HR Software Used is missing", () => {
    const fieldsWithoutHR = { ...FULL_GROUP_DATA_FIELDS };
    delete (fieldsWithoutHR as any)["HR Software Used"];
    const { fieldMap } = FORM_PREFILL_MAPPINGS["recOt6cX0t1DksDFT"];
    const result = mapPreFillFields(fieldsWithoutHR, fieldMap);
    assert.deepEqual(result, {});
  });

  it("PEO/EOR Assessment — returns empty object when Current PEO is missing", () => {
    const fieldsWithoutPEO = { ...FULL_GROUP_DATA_FIELDS };
    delete (fieldsWithoutPEO as any)["Current PEO"];
    const { fieldMap } = FORM_PREFILL_MAPPINGS["recKzuznmqq29uASl"];
    const result = mapPreFillFields(fieldsWithoutPEO, fieldMap);
    assert.deepEqual(result, {});
  });

  it("partial data — only available fields are mapped (no crash on missing)", () => {
    const partialFields = { "Company Name": "Acme", "Work Email": "jane@acme.com" };
    const { fieldMap } = FORM_PREFILL_MAPPINGS["gn6WNJPJKTus"];
    const result = mapPreFillFields(partialFields, fieldMap);
    assert.equal(result.companyName, "Acme");
    assert.equal(result.email, "jane@acme.com");
    assert.equal("firstName" in result, false);
  });

  it("NDA — maps all 5 legal entity fields", () => {
    const { fieldMap } = FORM_PREFILL_MAPPINGS["recySUNj6jv47SOKr"];
    const result = mapPreFillFields(FULL_GROUP_DATA_FIELDS, fieldMap);
    assert.equal(result.companyLegalName, "Acme Corp");
    assert.equal(result.legalNameOfEntity, "Acme Corporation LLC");
    assert.equal(result.employerIdentificationNumber, "12-3456789");
    assert.equal(result.entityTypeDetailed, "C-Corp");
    assert.equal(result.entityStateFormationDetailed, "IL");
  });
});

// ─── companyPreFillCache ───────────────────────────────────────────────────────

describe("companyPreFillCache", () => {
  beforeEach(() => {
    clearPreFillCache();
  });

  it("returns undefined for a key that was never set", () => {
    assert.equal(getPreFillCache("nonexistent-key-xyz"), undefined);
  });

  it("stores and retrieves fields by key", () => {
    setPreFillCache("company-abc", { "Company Name": "Acme" });
    const result = getPreFillCache("company-abc");
    assert.deepEqual(result, { "Company Name": "Acme" });
  });

  it("overwrites an existing cache entry", () => {
    setPreFillCache("cid-1", { "Company Name": "Old" });
    setPreFillCache("cid-1", { "Company Name": "New" });
    assert.deepEqual(getPreFillCache("cid-1"), { "Company Name": "New" });
  });

  it("clears all keys on clearPreFillCache()", () => {
    setPreFillCache("cid-2", { "Company Name": "Test" });
    clearPreFillCache();
    assert.equal(getPreFillCache("cid-2"), undefined);
  });

  it("cache miss after clearing does not throw", () => {
    clearPreFillCache();
    assert.equal(getPreFillCache("never-set-key"), undefined);
  });

  it("different keys are independent", () => {
    setPreFillCache("cid-A", { "Company Name": "Alpha" });
    setPreFillCache("cid-B", { "Company Name": "Beta" });
    assert.equal(getPreFillCache("cid-A")?.["Company Name"], "Alpha");
    assert.equal(getPreFillCache("cid-B")?.["Company Name"], "Beta");
    clearPreFillCache();
    assert.equal(getPreFillCache("cid-A"), undefined);
    assert.equal(getPreFillCache("cid-B"), undefined);
  });

  it("stores large field objects without truncation", () => {
    const bigFields: Record<string, string> = {};
    for (let i = 0; i < 50; i++) bigFields[`Field${i}`] = "value".repeat(100);
    setPreFillCache("big-cid", bigFields);
    const cached = getPreFillCache("big-cid");
    assert.ok(cached);
    assert.equal(Object.keys(cached as object).length, 50);
  });
});

// ─── Hardened edge cases ──────────────────────────────────────────────────────

describe("hardened edge cases — mapPreFillFields", () => {
  it("handles source fields object with prototype-polluted keys", () => {
    const fields = Object.create(null) as Record<string, unknown>;
    fields["Company Name"] = "Acme";
    const mapping = { "Company Name": "companyName" };
    const result = mapPreFillFields(fields, mapping);
    assert.equal(result.companyName, "Acme");
  });

  it("handles mapping object with prototype-polluted keys", () => {
    const mapping = Object.create(null) as Record<string, string>;
    mapping["Company Name"] = "companyName";
    const result = mapPreFillFields({ "Company Name": "Acme" }, mapping);
    assert.equal(result.companyName, "Acme");
  });

  it("numeric 0 from group-data is NOT treated as empty", () => {
    const fields = { "Estimated Benefit Eligible EEs": 0 };
    const mapping = { "Estimated Benefit Eligible EEs": "estimatedBenefitEligibleEes" };
    const result = mapPreFillFields(fields, mapping);
    assert.equal(result.estimatedBenefitEligibleEes, 0);
  });

  it("array value from group-data is mapped if non-empty", () => {
    const fields = { "HR Software Used": ["Workday", "ADP"] };
    const mapping = { "HR Software Used": "currentHRSystem" };
    const result = mapPreFillFields(fields, mapping);
    assert.deepEqual(result.currentHRSystem, ["Workday", "ADP"]);
  });

  it("empty array from group-data is treated as empty and skipped", () => {
    const fields = { "HR Software Used": [] };
    const mapping = { "HR Software Used": "currentHRSystem" };
    const result = mapPreFillFields(fields, mapping);
    assert.equal("currentHRSystem" in result, false);
  });

  it("deeply nested objects in values are passed through unchanged", () => {
    const nested = { tier1: { amount: 500 } };
    const fields = { "Renewal Month": nested };
    const mapping = { "Renewal Month": "renewalMonth" };
    const result = mapPreFillFields(fields as any, mapping);
    assert.deepEqual(result.renewalMonth, nested);
  });
});

describe("hardened edge cases — safeMerge", () => {
  it("handles very large number of fields without performance issues", () => {
    const current: Record<string, string> = {};
    const dirty: Record<string, boolean> = {};
    const preFill: Record<string, string> = {};
    for (let i = 0; i < 1000; i++) {
      current[`field${i}`] = i % 2 === 0 ? "" : `existing${i}`;
      preFill[`field${i}`] = `prefill${i}`;
      if (i % 3 === 0) dirty[`field${i}`] = true;
    }
    const result = safeMerge(current, dirty, preFill);
    // Dirty fields should not be overwritten
    assert.equal(result.field0, ""); // dirty even-index, value=""
    // Non-dirty empty fields should be filled
    assert.equal(result.field2, "prefill2"); // not dirty, was empty
    // Non-empty clean fields should be preserved
    assert.equal(result.field1, "existing1"); // not dirty, was non-empty → keep
  });

  it("empty currentValues + empty dirtyFields → full preFill applied", () => {
    const preFill = mapPreFillFields(FULL_GROUP_DATA_FIELDS, FORM_PREFILL_MAPPINGS["gn6WNJPJKTus"].fieldMap);
    const result = safeMerge({}, {}, preFill);
    assert.equal(result.companyName, "Acme Corp");
    assert.equal(result.firstName, "Jane");
    assert.equal(result.currentPEO, "Insperity");
  });

  it("all dirty → preFill ignored entirely", () => {
    const preFill = { firstName: "Jane", companyName: "Acme" };
    const dirty = { firstName: true, companyName: true };
    const result = safeMerge({}, dirty, preFill);
    assert.equal("firstName" in result, false);
    assert.equal("companyName" in result, false);
  });

  it("preFill with XSS content is stored without modification", () => {
    const xss = '<img src=x onerror=alert(1)>';
    const result = safeMerge({}, {}, { companyName: xss });
    assert.equal(result.companyName, xss);
  });

  it("preFill with very long string does not get truncated by safeMerge", () => {
    const long = "X".repeat(10_000);
    const result = safeMerge({}, {}, { companyName: long });
    assert.equal(result.companyName, long);
  });
});
