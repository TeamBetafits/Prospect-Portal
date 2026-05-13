import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { mapQuickStartFormToSupabasePayloads } from "../lib/mappings/quickStartMapping";

describe("Supabase integration wiring", () => {
  it("uses the existing files storage bucket for portal document uploads", () => {
    const uploadRoute = fs.readFileSync(path.resolve(process.cwd(), "app/api/documents/upload/route.ts"), "utf8");
    const companyRoute = fs.readFileSync(path.resolve(process.cwd(), "app/api/supabase/submit-company/route.ts"), "utf8");

    assert.match(uploadRoute, /DOCUMENTS_BUCKET = "files"/);
    assert.match(companyRoute, /DOCUMENTS_BUCKET = 'files'/);
    assert.doesNotMatch(uploadRoute, /\.from\("documents"\)/);
    assert.doesNotMatch(companyRoute, /\.from\('documents'\)/);
  });

  it("keeps portal-facing RLS and form submissions in the integration migration", () => {
    const migration = fs.readFileSync(
      path.resolve(process.cwd(), "supabase/migrations/202605070001_portal_supabase_integration.sql"),
      "utf8"
    );

    assert.match(migration, /create table if not exists public\.form_submissions/);
    assert.match(migration, /alter table public\.documents_and_artifacts enable row level security/);
    assert.match(migration, /Portal users can read own documents/);
    assert.match(migration, /Portal users can read own medical plans/);
  });

  it("keeps Quick Start benefit class notes out of the benefits UUID field", () => {
    const payloads = mapQuickStartFormToSupabasePayloads({
      benefitsOffered: ["Medical"],
      companyPackageConditions: ["Additional Entities"],
      companyPackageConditionsDetails: "Test",
      usesPeo: "No, we have never considered a PEO",
    });

    assert.equal("benefit_classes" in payloads.benefits, false);
    assert.deepEqual(payloads.documents_and_artifacts[0].metadata.benefit_class_notes, [
      "Additional Entities",
      "Test",
      "uses_peo: No, we have never considered a PEO",
    ]);
  });

  it("maps Quick Start coverage to one valid benefits enum value", () => {
    const payloads = mapQuickStartFormToSupabasePayloads({
      benefitsOffered: ["Medical", "Dental", "Vision", "401(k)", "Other"],
      benefitsOtherText: "Commuter",
    });

    assert.equal(payloads.benefits.line_of_coverage, "Medical");
    assert.doesNotMatch(payloads.benefits.line_of_coverage, /,/);
    assert.deepEqual(payloads.documents_and_artifacts[0].metadata.snapshot.benefitsOffered, [
      "Medical",
      "Dental",
      "Vision",
      "401(k)",
      "Other",
    ]);
  });

  it("omits the benefits row when Quick Start coverage is not a valid benefits enum value", () => {
    const payloads = mapQuickStartFormToSupabasePayloads({
      benefitsOffered: ["401(k)", "Other"],
      benefitsOtherText: "Commuter",
    });

    assert.equal(payloads.benefits, null);
    assert.deepEqual(payloads.documents_and_artifacts[0].metadata.snapshot.benefitsOffered, ["401(k)", "Other"]);
  });
});
