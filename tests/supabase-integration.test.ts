import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

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
});
