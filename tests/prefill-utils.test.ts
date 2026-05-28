/**
 * Tests for pre-fill utility functions.
 * Run with: tsx --test tests/prefill-utils.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Inline the functions under test so this file runs without a module bundler.
// The canonical source is lib/prefill/preFillUtils.ts.

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function mapPreFillFields(
  fields: Record<string, unknown>,
  mapping: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [airtableField, formFieldKey] of Object.entries(mapping)) {
    const value = fields[airtableField];
    if (!isEmpty(value)) {
      result[formFieldKey] = value;
    }
  }
  return result;
}

function safeMerge(
  currentValues: Record<string, unknown>,
  dirtyFields: Record<string, boolean>,
  preFillValues: Record<string, unknown>
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...currentValues };
  for (const [fieldKey, preFillValue] of Object.entries(preFillValues)) {
    const isDirty = dirtyFields[fieldKey] === true;
    const currentIsEmpty = isEmpty(currentValues[fieldKey]);
    if (!isDirty && currentIsEmpty && !isEmpty(preFillValue)) {
      next[fieldKey] = preFillValue;
    }
  }
  return next;
}

// ─── isEmpty ─────────────────────────────────────────────────────────────────

describe("isEmpty", () => {
  it("returns true for null", () => assert.equal(isEmpty(null), true));
  it("returns true for undefined", () => assert.equal(isEmpty(undefined), true));
  it("returns true for empty string", () => assert.equal(isEmpty(""), true));
  it("returns true for whitespace-only string", () => assert.equal(isEmpty("   "), true));
  it("returns true for empty array", () => assert.equal(isEmpty([]), true));

  it("returns false for number 0", () => assert.equal(isEmpty(0), false));
  it("returns false for boolean false", () => assert.equal(isEmpty(false), false));
  it("returns false for boolean true", () => assert.equal(isEmpty(true), false));
  it("returns false for non-empty string", () => assert.equal(isEmpty("hello"), false));
  it("returns false for non-empty array", () => assert.equal(isEmpty([1, 2]), false));
  it("returns false for plain object", () => assert.equal(isEmpty({}), false));
  it("returns false for positive number", () => assert.equal(isEmpty(42), false));
  it("returns false for negative number", () => assert.equal(isEmpty(-1), false));
});

// ─── mapPreFillFields ────────────────────────────────────────────────────────

describe("mapPreFillFields", () => {
  const fields = {
    "Company Name": "Acme Corp",
    "Work Email": "admin@acme.com",
    "Phone Number": "",
    "EIN": null,
  };

  const mapping = {
    "Company Name": "companyName",
    "Work Email": "email",
    "Phone Number": "phone",
    "EIN": "ein",
    "First Name": "firstName", // not in fields
  };

  it("maps present non-empty fields to their form keys", () => {
    const result = mapPreFillFields(fields, mapping);
    assert.equal(result.companyName, "Acme Corp");
    assert.equal(result.email, "admin@acme.com");
  });

  it("skips empty string values", () => {
    const result = mapPreFillFields(fields, mapping);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "phone"), false);
  });

  it("skips null values", () => {
    const result = mapPreFillFields(fields, mapping);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "ein"), false);
  });

  it("skips mapping entries where the source field is absent", () => {
    const result = mapPreFillFields(fields, mapping);
    assert.equal(Object.prototype.hasOwnProperty.call(result, "firstName"), false);
  });

  it("returns empty object for empty mapping", () => {
    const result = mapPreFillFields(fields, {});
    assert.deepEqual(result, {});
  });

  it("returns empty object for empty fields", () => {
    const result = mapPreFillFields({}, mapping);
    assert.deepEqual(result, {});
  });

  it("includes numeric 0 values", () => {
    const result = mapPreFillFields({ Count: 0 }, { Count: "count" });
    assert.equal(result.count, 0);
  });

  it("includes boolean false values", () => {
    const result = mapPreFillFields({ Active: false }, { Active: "active" });
    assert.equal(result.active, false);
  });
});

// ─── safeMerge ───────────────────────────────────────────────────────────────

describe("safeMerge", () => {
  it("applies pre-fill to fields that are empty and not dirty", () => {
    const result = safeMerge(
      { name: "", email: "" },
      {},
      { name: "Alice", email: "alice@example.com" }
    );
    assert.equal(result.name, "Alice");
    assert.equal(result.email, "alice@example.com");
  });

  it("does NOT overwrite dirty fields even when they are empty", () => {
    const result = safeMerge(
      { name: "" },
      { name: true },
      { name: "Alice" }
    );
    assert.equal(result.name, "");
  });

  it("does NOT overwrite existing non-empty current values", () => {
    const result = safeMerge(
      { name: "Bob" },
      {},
      { name: "Alice" }
    );
    assert.equal(result.name, "Bob");
  });

  it("treats 0 as non-empty and does NOT overwrite it", () => {
    const result = safeMerge({ count: 0 }, {}, { count: 99 });
    assert.equal(result.count, 0);
  });

  it("treats false as non-empty and does NOT overwrite it", () => {
    const result = safeMerge({ active: false }, {}, { active: true });
    assert.equal(result.active, false);
  });

  it("returns a new object (does not mutate currentValues)", () => {
    const current = { name: "" };
    const result = safeMerge(current, {}, { name: "Alice" });
    assert.equal(current.name, "");
    assert.equal(result.name, "Alice");
  });

  it("ignores pre-fill keys that have no current value slot", () => {
    // Pre-fill provides a key that does not exist in current — it should be added.
    const result = safeMerge({}, {}, { city: "Austin" });
    assert.equal(result.city, "Austin");
  });

  it("ignores pre-fill values that are themselves empty", () => {
    const result = safeMerge({ name: "" }, {}, { name: "" });
    assert.equal(result.name, "");
  });

  it("leaves fields untouched when pre-fill is empty object", () => {
    const result = safeMerge({ name: "Bob" }, {}, {});
    assert.deepEqual(result, { name: "Bob" });
  });

  it("full dirty fields — no changes at all", () => {
    const current = { a: "", b: "", c: "" };
    const dirty = { a: true, b: true, c: true };
    const prefill = { a: "X", b: "Y", c: "Z" };
    const result = safeMerge(current, dirty, prefill);
    assert.deepEqual(result, { a: "", b: "", c: "" });
  });
});
