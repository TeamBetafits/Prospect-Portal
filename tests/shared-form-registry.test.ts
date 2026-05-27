import assert from "node:assert/strict";
import test from "node:test";
import { parseOptions, validateFieldValue, getChangedFields, formatEin, formatPhone } from "@/shared/forms/formatters";
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
  assert.equal(validateFieldValue(phoneField, "555"), "Enter a valid phone number.");
  assert.equal(validateFieldValue(einField, "12-3456789"), null);
});

test("formatters normalize EIN and phone for display", () => {
  assert.equal(formatEin("123456789"), "12-3456789");
  assert.equal(formatPhone("2125550199"), "(212) 555-0199");
});

test("getChangedFields returns only changed keys", () => {
  const changed = getChangedFields({ name: "Acme", ein: "12-3456789" }, { name: "Acme", ein: "98-7654321" });
  assert.deepEqual(changed, { ein: "98-7654321" });
});
