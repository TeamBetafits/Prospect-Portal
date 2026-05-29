import assert from "node:assert/strict";
import test from "node:test";
import { validatePayload } from "../app/api/company/update/validation";

test("company update API validation normalizes canonical fields", () => {
  const { details, sanitized } = validatePayload({
    name: "Acme",
    ein: "123456789",
    sicCode: " 8322 ",
    naicsCode: " 62 4190 ",
    renewalMonth: "09",
    contact: {
      phone: "+1 212.555.0199",
      email: " PERSON@EXAMPLE.COM ",
    },
  });

  assert.deepEqual(details, {});
  assert.equal(sanitized.ein, "12-3456789");
  assert.equal(sanitized.sicCode, "8322");
  assert.equal(sanitized.naicsCode, "624190");
  assert.equal(sanitized.renewalMonth, "9");
  assert.deepEqual(sanitized.contact, {
    phone: "(212) 555-0199",
    email: "person@example.com",
  });
});

test("company update API validation rejects invalid identity fields", () => {
  const { details } = validatePayload({
    ein: "123",
    renewalMonth: "13",
    contact: {
      phone: "+44 20 7946 0958",
      email: "not-an-email",
    },
  });

  assert.equal(details.ein, "Use a 9-digit EIN, for example 12-3456789.");
  assert.equal(details.renewalMonth, "Use a renewal month from 1 to 12.");
  assert.equal(details.phone, "Enter a valid 10-digit US phone number.");
  assert.equal(details.email, "Enter a valid email address.");
});
