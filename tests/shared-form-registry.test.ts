import assert from "node:assert/strict";
import test from "node:test";
import {
  parseOptions,
  validateFieldValue,
  getChangedFields,
  formatEin,
  formatPhone,
  normalizeDraft,
  normalizeFieldValue,
  normalizePatch,
} from "@/shared/forms/formatters";
import { prospectCompanyFields } from "@/page-modules/company-details/companyFieldRegistry";

test("parseOptions reads JSON options before text options", () => {
  const options = parseOptions("Ignored", '[{"label":"Active","value":"active"}]');
  assert.deepEqual(options, [{ label: "Active", value: "active" }]);
});

test("parseOptions ignores unresolved options", () => {
  assert.equal(parseOptions("To be decided", "To be decided"), undefined);
});

test("field validation catches EIN, phone, and required values", () => {
  const nameField = prospectCompanyFields.find((field) => field.key === "name");
  const einField = prospectCompanyFields.find((field) => field.key === "ein");
  const phoneField = prospectCompanyFields.find((field) => field.key === "phone");

  assert.ok(nameField);
  assert.ok(einField);
  assert.ok(phoneField);
  assert.equal(validateFieldValue(nameField, ""), "Company Name is required.");
  assert.equal(validateFieldValue(einField, "123"), "Use a 9-digit EIN, for example 12-3456789.");
  assert.equal(validateFieldValue(phoneField, "555"), "Enter a valid 10-digit US phone number.");
  assert.equal(validateFieldValue(einField, "12-3456789"), null);
});

test("formatters normalize EIN and phone for display", () => {
  assert.equal(formatEin("123456789"), "12-3456789");
  assert.equal(formatPhone("2125550199"), "(212) 555-0199");
});

test("normalizers produce canonical saved values", () => {
  const einField = prospectCompanyFields.find((field) => field.key === "ein");
  const phoneField = prospectCompanyFields.find((field) => field.key === "phone");
  const emailField = prospectCompanyFields.find((field) => field.key === "email");
  const sicField = prospectCompanyFields.find((field) => field.key === "sicCode");
  const naicsField = prospectCompanyFields.find((field) => field.key === "naicsCode");
  const renewalField = prospectCompanyFields.find((field) => field.key === "renewalMonth");

  assert.ok(einField);
  assert.ok(phoneField);
  assert.ok(emailField);
  assert.ok(sicField);
  assert.ok(naicsField);
  assert.ok(renewalField);
  assert.equal(normalizeFieldValue(einField, "123456789"), "12-3456789");
  assert.equal(normalizeFieldValue(phoneField, "+1 (212) 555-0199"), "(212) 555-0199");
  assert.equal(normalizeFieldValue(emailField, " PERSON@EXAMPLE.COM "), "person@example.com");
  assert.equal(normalizeFieldValue(sicField, " 8322 "), "8322");
  assert.equal(normalizeFieldValue(naicsField, " 62 4190 "), "624190");
  assert.equal(normalizeFieldValue(renewalField, "09"), "9");
});

test("validation rejects non-standard identity inputs", () => {
  const phoneField = prospectCompanyFields.find((field) => field.key === "phone");
  const sicField = prospectCompanyFields.find((field) => field.key === "sicCode");
  const naicsField = prospectCompanyFields.find((field) => field.key === "naicsCode");
  const renewalField = prospectCompanyFields.find((field) => field.key === "renewalMonth");

  assert.ok(phoneField);
  assert.ok(sicField);
  assert.ok(naicsField);
  assert.ok(renewalField);
  assert.equal(validateFieldValue(phoneField, "+44 20 7946 0958"), "Enter a valid 10-digit US phone number.");
  assert.equal(validateFieldValue(sicField, "abc"), "Use a 4-digit SIC code.");
  assert.equal(validateFieldValue(naicsField, "1234567"), "Use a 2- to 6-digit NAICS code.");
  assert.equal(validateFieldValue(renewalField, "13"), "Use a renewal month from 1 to 12.");
});

test("normalizeDraft and normalizePatch use field registry formats", () => {
  const draft = normalizeDraft(prospectCompanyFields, {
    ein: "123456789",
    phone: "2125550199",
    email: "CLIENT@EXAMPLE.COM",
  });
  assert.deepEqual(draft, {
    ein: "12-3456789",
    phone: "(212) 555-0199",
    email: "client@example.com",
  });

  const patch = normalizePatch(prospectCompanyFields, { sicCode: " 8322 ", naicsCode: " 62 4190 " });
  assert.deepEqual(patch, { sicCode: "8322", naicsCode: "624190" });
});

test("getChangedFields returns only changed keys", () => {
  const changed = getChangedFields({ name: "Acme", ein: "12-3456789" }, { name: "Acme", ein: "98-7654321" });
  assert.deepEqual(changed, { ein: "98-7654321" });
});
