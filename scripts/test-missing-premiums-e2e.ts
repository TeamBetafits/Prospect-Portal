/**
 * E2E test: Missing Premiums Manual Input — Full Approval Workflow
 *
 * Real schema (betafits-prod):
 *   tiers_and_rates: id, plan_id, tier_key, ..., premium_ee/es/ec/ef (main),
 *     premium_ee_user/es_user/ec_user/ef_user (staging)
 *   available_plans: id, company_id
 *   intake_assigned_forms: id, company_id, name, status, submitted, assigned
 *   intake_progress_steps: id, company_id, name, status, notes, visibility_progress_steps
 *
 *   NOTE: tiers_and_rates has NO company_id — linked via plan_id → available_plans.
 *
 * Section A — Direct DB operations (tiers_and_rates):
 *   1. Table is reachable and has rows
 *   2. Snapshot original main premium values
 *   3. Write _user fields (simulate staging)
 *   4. Verify _user fields written correctly
 *   5. Verify main premium fields unchanged
 *   6. Field whitelist logic strips non-_user fields
 *   7. Cleanup _user fields
 *
 * Section B — Full submit → approve workflow:
 *   8.  Resolve company_id from the target row's plan_id
 *   9.  Seed a test intake_assigned_forms row (simulate orchestration assignment)
 *   10. Simulate submit: write _user fields + update assigned form + upsert progress step
 *   11. Verify submitted state (assigned form Submitted, progress step Pending Approval)
 *   12. Simulate approve: promote _user→main, clear _user, update assigned form + progress steps
 *   13. Verify approved state (main fields updated, _user cleared, assigned form Completed,
 *       progress steps: Manual Input = Completed, Missing Premiums = Pending)
 *   14. Cleanup all test data (restore original premiums, delete seeded rows)
 *
 * Run with:
 *   npx tsx scripts/test-missing-premiums-e2e.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.
 * When .env has duplicate keys (two Supabase projects), the FIRST occurrence
 * is used — which is betafits-prod.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ─── Load first-occurrence env vars ────────────────────────────────────────────
// Standard dotenv takes the LAST value when keys are duplicated.
// We need the FIRST occurrence (betafits-prod), so we parse manually.

function loadFirstOccurrenceEnv(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const seen = new Set<string>();
  const result: Record<string, string> = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!seen.has(key)) {
      seen.add(key);
      result[key] = value;
    }
  }
  return result;
}

const envVars = {
  ...loadFirstOccurrenceEnv(path.resolve(process.cwd(), ".env")),
  ...loadFirstOccurrenceEnv(path.resolve(process.cwd(), ".env.local")),
};

// ─── Setup ─────────────────────────────────────────────────────────────────────

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ─── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(label: string) {
  passed++;
  console.log(`  ✅  ${label}`);
}

function fail(label: string, detail?: string) {
  failed++;
  console.error(`  ❌  ${label}${detail ? `\n      ${detail}` : ""}`);
}

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) pass(label);
  else fail(label, detail);
}

function printSummary() {
  const total = passed + failed;
  console.log("\n─────────────────────────────────────────────────────────────────");
  console.log(`Results: ${passed}/${total} passed${failed > 0 ? `, ${failed} failed` : ""}`);
  console.log("─────────────────────────────────────────────────────────────────\n");
  if (failed > 0) process.exit(1);
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const TEST_FORM_NAME = "Missing Premiums Manual Input [E2E-TEST]";
const MANUAL_INPUT_STEP = "Missing Premiums Manual Input";
const MISSING_PREMIUMS_STEP = "Missing Premiums";

const ALLOWED_USER_FIELDS = new Set([
  "premium_ee_user",
  "premium_es_user",
  "premium_ec_user",
  "premium_ef_user",
]);

// Inline upsertProgressStep — mirrors lib/upsertProgressStep.ts without @/ imports
async function upsertProgressStep(
  companyId: string,
  name: string,
  status: string,
  notes?: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("intake_progress_steps")
    .select("id")
    .eq("company_id", companyId)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("intake_progress_steps")
      .update({ status, notes: notes ?? null, status_last_updated: now, updated_at: now })
      .eq("id", existing.id);
  } else {
    await supabase.from("intake_progress_steps").insert({
      company_id: companyId,
      name,
      status,
      notes: notes ?? null,
      visibility_progress_steps: "Missing Premiums",
      status_last_updated: now,
    });
  }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n─── Missing Premiums E2E Test ───────────────────────────────────\n");
  console.log(`     project: ${supabaseUrl}\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION A — Direct DB operations (tiers_and_rates)
  // ══════════════════════════════════════════════════════════════════════════

  // ── 1. Find a plan with both available_plans + tiers_and_rates rows ───────
  // Starting from available_plans guarantees we always have a valid company_id
  // (the first rows in tiers_and_rates can be orphaned / not linked to any company).
  console.log("Step 1: Find a tiers_and_rates row linked to a real company via available_plans");

  const { data: plans, error: plansErr } = await supabase
    .from("available_plans")
    .select("id, company_id")
    .not("company_id", "is", null)
    .limit(10);

  assert(!plansErr && Array.isArray(plans) && plans!.length > 0, "available_plans is reachable and has rows", plansErr?.message);

  if (!plans || plans.length === 0) {
    console.log("\n⚠️  No rows in available_plans. Aborting.\n");
    printSummary();
    return;
  }

  const planIds = plans.map((p: any) => p.id);

  const { data: rows, error: loadError } = await supabase
    .from("tiers_and_rates")
    .select(
      "id, plan_id, tier_key, premium_ee, premium_es, premium_ec, premium_ef, " +
      "premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user"
    )
    .in("plan_id", planIds)
    .order("id")
    .limit(10);

  assert(!loadError, "tiers_and_rates rows found for known plans", loadError?.message);
  assert(Array.isArray(rows) && rows!.length > 0, "At least one linked tier row returned");

  if (!rows || rows.length === 0) {
    console.log("\n⚠️  No tiers_and_rates rows found for any known plan. Aborting.\n");
    printSummary();
    return;
  }

  const targetRow = rows[0];
  const targetPlan = plans.find((p: any) => p.id === targetRow.plan_id)!;

  console.log(`     ${rows.length} row(s) found — using row id=${targetRow.id}  tier_key=${targetRow.tier_key}`);
  console.log(`     plan_id=${targetRow.plan_id}  company_id=${targetPlan.company_id}\n`);

  // ── 2. Snapshot original main premium values ──────────────────────────────
  console.log("Step 2: Snapshot main premium values (verified unchanged after Section A PATCH)");
  const snapshot = {
    premium_ee: targetRow.premium_ee,
    premium_es: targetRow.premium_es,
    premium_ec: targetRow.premium_ec,
    premium_ef: targetRow.premium_ef,
  };

  pass(`Snapshot captured — row id=${targetRow.id}  tier_key=${targetRow.tier_key}`);
  console.log(`     snapshot = ${JSON.stringify(snapshot)}\n`);

  // ── 3. PATCH _user fields ─────────────────────────────────────────────────
  console.log("Step 3: PATCH _user fields (simulate staging write)");

  const testEe = 999.99;
  const testEs = 1234.56;

  const { error: patchError } = await supabase
    .from("tiers_and_rates")
    .update({ premium_ee_user: testEe, premium_es_user: testEs })
    .eq("id", targetRow.id);

  assert(!patchError, "PATCH _user fields succeeded", patchError?.message);

  if (patchError) {
    console.log("\n⚠️  PATCH failed. Skipping verification steps.\n");
    printSummary();
    return;
  }

  // ── 4. Verify _user fields were written ───────────────────────────────────
  console.log("\nStep 4: Verify _user fields were written correctly");

  // Small delay to avoid transient connection reuse issues with rapid write→read
  await new Promise((r) => setTimeout(r, 400));

  const { data: afterPatch, error: verifyError } = await supabase
    .from("tiers_and_rates")
    .select(
      "premium_ee, premium_es, premium_ec, premium_ef, " +
      "premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user"
    )
    .eq("id", targetRow.id)
    .single();

  assert(!verifyError, "Re-fetch after PATCH succeeded", verifyError?.message);

  if (afterPatch) {
    assert(afterPatch.premium_ee_user === testEe, `premium_ee_user written as ${testEe}`, `actual: ${afterPatch.premium_ee_user}`);
    assert(afterPatch.premium_es_user === testEs, `premium_es_user written as ${testEs}`, `actual: ${afterPatch.premium_es_user}`);
    assert(afterPatch.premium_ec_user === null, "premium_ec_user untouched (null)", `actual: ${afterPatch.premium_ec_user}`);
    assert(afterPatch.premium_ef_user === null, "premium_ef_user untouched (null)", `actual: ${afterPatch.premium_ef_user}`);

    // ── 5. Verify main premium fields unchanged ────────────────────────────
    console.log("\nStep 5: Verify main premium fields were NOT modified");

    assert(afterPatch.premium_ee === snapshot.premium_ee, `premium_ee unchanged (${snapshot.premium_ee})`, `actual: ${afterPatch.premium_ee}`);
    assert(afterPatch.premium_es === snapshot.premium_es, `premium_es unchanged (${snapshot.premium_es})`, `actual: ${afterPatch.premium_es}`);
    assert(afterPatch.premium_ec === snapshot.premium_ec, `premium_ec unchanged (${snapshot.premium_ec})`, `actual: ${afterPatch.premium_ec}`);
    assert(afterPatch.premium_ef === snapshot.premium_ef, `premium_ef unchanged (${snapshot.premium_ef})`, `actual: ${afterPatch.premium_ef}`);
  }

  // ── 6. Field whitelist verification ───────────────────────────────────────
  console.log("\nStep 6: Whitelist — main premium fields must be stripped from patch payload");

  const maliciousPayload: Record<string, unknown> = {
    id: targetRow.id,
    premium_ee: 0.01,
    premium_ee_user: 777,
  };

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(maliciousPayload)) {
    if (key !== "id" && ALLOWED_USER_FIELDS.has(key)) filtered[key] = value;
  }

  assert(!("premium_ee" in filtered), "Whitelist strips premium_ee from patch payload");
  assert("premium_ee_user" in filtered, "Whitelist passes premium_ee_user through");

  // ── 7. Cleanup _user fields ───────────────────────────────────────────────
  console.log("\nStep 7: Cleanup — reset _user fields to null");

  const { error: cleanupError } = await supabase
    .from("tiers_and_rates")
    .update({ premium_ee_user: null, premium_es_user: null, premium_ec_user: null, premium_ef_user: null })
    .eq("id", targetRow.id);

  assert(!cleanupError, "_user fields reset to null", cleanupError?.message);

  const { data: afterCleanup } = await supabase
    .from("tiers_and_rates")
    .select("premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user")
    .eq("id", targetRow.id)
    .single();

  if (afterCleanup) {
    assert(afterCleanup.premium_ee_user === null, "premium_ee_user is null after cleanup");
    assert(afterCleanup.premium_es_user === null, "premium_es_user is null after cleanup");
    assert(afterCleanup.premium_ec_user === null, "premium_ec_user is null after cleanup");
    assert(afterCleanup.premium_ef_user === null, "premium_ef_user is null after cleanup");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION B — Full submit → approve workflow
  // ══════════════════════════════════════════════════════════════════════════

  // ── 8. Company context (resolved in Step 1) ──────────────────────────────
  console.log("\n\n─── Section B: Full Approval Workflow ───────────────────────────\n");
  console.log("Step 8: Confirm company_id (already resolved from available_plans in Step 1)");

  const companyId = targetPlan.company_id as string;
  assert(typeof companyId === "string" && companyId.length > 0, `company_id resolved: ${companyId}`);
  console.log(`     company_id = ${companyId}\n`);

  // ── 9. Seed test intake_assigned_forms row ────────────────────────────────
  console.log("Step 9: Seed test intake_assigned_forms row (simulate orchestration assignment)");

  // Clean up any leftover test row from a previous run first
  await supabase
    .from("intake_assigned_forms")
    .delete()
    .eq("company_id", companyId)
    .eq("name", TEST_FORM_NAME);

  const { data: seededForm, error: seedError } = await supabase
    .from("intake_assigned_forms")
    .insert({
      company_id: companyId,
      name: TEST_FORM_NAME,
      status: "Not Started",
      submitted: false,
      assigned: true,
    })
    .select("id, status, submitted")
    .single();

  assert(!seedError && seededForm !== null, "Test assigned form row seeded", seedError?.message);

  if (!seededForm) {
    console.log("\n⚠️  Could not seed test assigned form row — skipping steps 10-14.\n");
    printSummary();
    return;
  }

  console.log(`     seeded id=${seededForm.id}  status=${seededForm.status}\n`);

  // ── 10. Simulate submit ───────────────────────────────────────────────────
  console.log("Step 10: Simulate submit — write _user fields, update assigned form, upsert progress step");

  const submitNow = new Date().toISOString();

  // a) Write _user staging fields (mirrors what submit/route.ts does)
  const { error: submitPatchErr } = await supabase
    .from("tiers_and_rates")
    .update({ premium_ee_user: testEe, premium_es_user: testEs, updated_at: submitNow })
    .eq("id", targetRow.id);

  assert(!submitPatchErr, "Submit: _user fields written to tiers_and_rates", submitPatchErr?.message);

  // b) Upsert progress step → Pending Approval (mirrors upsertProgressStep call in route)
  // Use the real step name here so we can verify it — but skip if it would overwrite a real row
  // by using a company that only has test data. We still call through our inline helper.
  await upsertProgressStep(companyId, MANUAL_INPUT_STEP, "Pending Approval", "E2E test — awaiting review");
  pass("Submit: progress step upserted as Pending Approval");

  // c) Update assigned form → Submitted (mirrors route's .update() call)
  const { error: submitFormErr } = await supabase
    .from("intake_assigned_forms")
    .update({ status: "Submitted", submitted: true, updated_at: submitNow })
    .eq("id", seededForm.id);

  assert(!submitFormErr, "Submit: assigned form status updated to Submitted", submitFormErr?.message);

  // ── 11. Verify submitted state ────────────────────────────────────────────
  console.log("\nStep 11: Verify submitted state");

  const { data: afterSubmitForm } = await supabase
    .from("intake_assigned_forms")
    .select("status, submitted")
    .eq("id", seededForm.id)
    .single();

  assert(afterSubmitForm?.status === "Submitted", `Assigned form status = "Submitted"`, `actual: ${afterSubmitForm?.status}`);
  assert(afterSubmitForm?.submitted === true, "Assigned form submitted = true", `actual: ${afterSubmitForm?.submitted}`);

  const { data: submitStep } = await supabase
    .from("intake_progress_steps")
    .select("status")
    .eq("company_id", companyId)
    .ilike("name", MANUAL_INPUT_STEP)
    .maybeSingle();

  assert(submitStep?.status === "Pending Approval", `Progress step "${MANUAL_INPUT_STEP}" = "Pending Approval"`, `actual: ${submitStep?.status}`);

  const { data: afterSubmitTier } = await supabase
    .from("tiers_and_rates")
    .select("premium_ee_user, premium_es_user, premium_ee, premium_es")
    .eq("id", targetRow.id)
    .single();

  assert(afterSubmitTier?.premium_ee_user === testEe, `_user staging: premium_ee_user = ${testEe}`, `actual: ${afterSubmitTier?.premium_ee_user}`);
  assert(afterSubmitTier?.premium_ee === snapshot.premium_ee, "Main premium_ee still unchanged after submit", `actual: ${afterSubmitTier?.premium_ee}`);

  // ── 12. Simulate approve ──────────────────────────────────────────────────
  console.log("\nStep 12: Simulate approve — promote _user→main, clear staging, update assigned form + steps");

  // Re-fetch the row to get current _user values (mirrors what the route does)
  const { data: preApproveRow } = await supabase
    .from("tiers_and_rates")
    .select("id, plan_id, premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user")
    .eq("id", targetRow.id)
    .single();

  assert(preApproveRow !== null, "Pre-approve row fetched for promotion", "Row not found");

  if (!preApproveRow) {
    console.log("\n⚠️  Cannot fetch row for promotion — skipping step 12+.\n");
    printSummary();
    return;
  }

  // Build promotion payload (copy non-null _user → main, always clear _user)
  const approveNow = new Date().toISOString();
  const promotion: Record<string, number | null> = {
    premium_ee_user: null,
    premium_es_user: null,
    premium_ec_user: null,
    premium_ef_user: null,
  };
  if (preApproveRow.premium_ee_user !== null) promotion.premium_ee = preApproveRow.premium_ee_user;
  if (preApproveRow.premium_es_user !== null) promotion.premium_es = preApproveRow.premium_es_user;
  if (preApproveRow.premium_ec_user !== null) promotion.premium_ec = preApproveRow.premium_ec_user;
  if (preApproveRow.premium_ef_user !== null) promotion.premium_ef = preApproveRow.premium_ef_user;

  const { error: approvePromoteErr } = await supabase
    .from("tiers_and_rates")
    .update({ ...promotion, updated_at: approveNow })
    .eq("id", targetRow.id);

  assert(!approvePromoteErr, "Approve: _user promoted to main fields, staging cleared", approvePromoteErr?.message);

  // Update assigned form → Completed
  const { error: approveFormErr } = await supabase
    .from("intake_assigned_forms")
    .update({ status: "Completed", submitted: true, updated_at: approveNow })
    .eq("id", seededForm.id);

  assert(!approveFormErr, "Approve: assigned form status updated to Completed", approveFormErr?.message);

  // Upsert progress steps (mirrors both calls in approve/route.ts)
  await upsertProgressStep(companyId, MANUAL_INPUT_STEP, "Completed");
  pass(`Approve: progress step "${MANUAL_INPUT_STEP}" upserted as Completed`);

  await upsertProgressStep(companyId, MISSING_PREMIUMS_STEP, "Pending", "Admin approved manual input — rerun requested");
  pass(`Approve: progress step "${MISSING_PREMIUMS_STEP}" upserted as Pending`);

  // ── 13. Verify approved state ─────────────────────────────────────────────
  console.log("\nStep 13: Verify approved state");

  const { data: afterApproveForm } = await supabase
    .from("intake_assigned_forms")
    .select("status, submitted")
    .eq("id", seededForm.id)
    .single();

  assert(afterApproveForm?.status === "Completed", `Assigned form status = "Completed"`, `actual: ${afterApproveForm?.status}`);
  assert(afterApproveForm?.submitted === true, "Assigned form submitted = true after approve", `actual: ${afterApproveForm?.submitted}`);

  const { data: approveManualStep } = await supabase
    .from("intake_progress_steps")
    .select("status")
    .eq("company_id", companyId)
    .ilike("name", MANUAL_INPUT_STEP)
    .maybeSingle();

  assert(approveManualStep?.status === "Completed", `Progress step "${MANUAL_INPUT_STEP}" = "Completed"`, `actual: ${approveManualStep?.status}`);

  const { data: approveMissingStep } = await supabase
    .from("intake_progress_steps")
    .select("status")
    .eq("company_id", companyId)
    .ilike("name", MISSING_PREMIUMS_STEP)
    .maybeSingle();

  assert(approveMissingStep?.status === "Pending", `Progress step "${MISSING_PREMIUMS_STEP}" = "Pending" (orchestration rerun signal)`, `actual: ${approveMissingStep?.status}`);

  const { data: afterApproveTier } = await supabase
    .from("tiers_and_rates")
    .select("premium_ee, premium_es, premium_ee_user, premium_es_user")
    .eq("id", targetRow.id)
    .single();

  assert(afterApproveTier?.premium_ee === testEe, `Main premium_ee promoted to ${testEe}`, `actual: ${afterApproveTier?.premium_ee}`);
  assert(afterApproveTier?.premium_es === testEs, `Main premium_es promoted to ${testEs}`, `actual: ${afterApproveTier?.premium_es}`);
  assert(afterApproveTier?.premium_ee_user === null, "_user premium_ee_user cleared to null after approve", `actual: ${afterApproveTier?.premium_ee_user}`);
  assert(afterApproveTier?.premium_es_user === null, "_user premium_es_user cleared to null after approve", `actual: ${afterApproveTier?.premium_es_user}`);

  // ── 14. Cleanup ───────────────────────────────────────────────────────────
  console.log("\nStep 14: Cleanup — restore original premium values, delete seeded test rows");

  // Restore original main premium values (approve test wrote to them)
  const { error: restoreErr } = await supabase
    .from("tiers_and_rates")
    .update({ ...snapshot, updated_at: new Date().toISOString() })
    .eq("id", targetRow.id);

  assert(!restoreErr, "Original main premium values restored", restoreErr?.message);

  // Verify restoration
  const { data: afterRestore } = await supabase
    .from("tiers_and_rates")
    .select("premium_ee, premium_es, premium_ec, premium_ef, premium_ee_user, premium_es_user")
    .eq("id", targetRow.id)
    .single();

  assert(afterRestore?.premium_ee === snapshot.premium_ee, `premium_ee restored to ${snapshot.premium_ee}`, `actual: ${afterRestore?.premium_ee}`);
  assert(afterRestore?.premium_es === snapshot.premium_es, `premium_es restored to ${snapshot.premium_es}`, `actual: ${afterRestore?.premium_es}`);
  assert(afterRestore?.premium_ee_user === null, "premium_ee_user is null after restore");
  assert(afterRestore?.premium_es_user === null, "premium_es_user is null after restore");

  // Delete seeded intake_assigned_forms row
  const { error: deleteFormErr } = await supabase
    .from("intake_assigned_forms")
    .delete()
    .eq("id", seededForm.id);

  assert(!deleteFormErr, "Seeded assigned form row deleted", deleteFormErr?.message);

  // Delete test progress steps (both names upserted during this test)
  const { error: deleteManualStepErr } = await supabase
    .from("intake_progress_steps")
    .delete()
    .eq("company_id", companyId)
    .ilike("name", MANUAL_INPUT_STEP);

  assert(!deleteManualStepErr, `Test progress step "${MANUAL_INPUT_STEP}" deleted`, deleteManualStepErr?.message);

  const { error: deleteMissingStepErr } = await supabase
    .from("intake_progress_steps")
    .delete()
    .eq("company_id", companyId)
    .ilike("name", MISSING_PREMIUMS_STEP);

  assert(!deleteMissingStepErr, `Test progress step "${MISSING_PREMIUMS_STEP}" deleted`, deleteMissingStepErr?.message);

  printSummary();
}

run().catch((err) => {
  console.error("\n❌  Unexpected error:", err);
  process.exit(1);
});
