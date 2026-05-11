import assert from "node:assert/strict";
import { describe, it } from "node:test";
import formsCatalog from "../all-form-fields-extracted.json";

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";

describe("Prospect Portal form coverage", () => {
  it("has a route mapping for every extracted non-alias form", async () => {
    const { FORM_ROUTE_BY_TEMPLATE_ID } = await import("../lib/supabase/portal");
    const missing = formsCatalog.forms
      .filter((form) => form.formId !== "quick-start")
      .filter((form) => !FORM_ROUTE_BY_TEMPLATE_ID[form.formId])
      .map((form) => `${form.formId} ${form.formName}`);

    assert.deepEqual(missing, []);
  });

  it("preserves the 20 extracted form definitions and 156 fields", () => {
    const fieldCount = formsCatalog.forms.reduce((sum, form) => sum + form.fieldCount, 0);

    assert.equal(formsCatalog.totalForms, 20);
    assert.equal(formsCatalog.forms.length, 20);
    assert.equal(formsCatalog.totalFields, 156);
    assert.equal(fieldCount, 156);
  });
});
