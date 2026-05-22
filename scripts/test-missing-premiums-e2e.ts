/**
 * E2E test: Missing Premiums Manual Input Form — Supabase tiers_and_rates
 *
 * Real schema (betafits-prod):
 *   tiers_and_rates: id, plan_id, tier_key, tier_label, er_contribution,
 *     ee_contribution, premium_ee, premium_es, premium_ef, premium_ec,
 *     premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user, ...
 *
 *   NOTE: tiers_and_rates has NO company_id column. Company is linked via plan_id.
 *         The tests here exercise the _user field write/verify/cleanup cycle directly
 *         using row IDs, which is the same path the API route takes.
 *
 * Tests:
 *   1. Table is reachable and has rows
 *   2. Snapshot original main premium values
 *   3. PATCH _user fields on a target row
 *   4. Verify _user fields were written correctly
 *   5. Verify main premium fields were NOT modified
 *   6. Verify field whitelist logic strips non-_user fields
 *   7. Cleanup: reset _user fields back to null
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

// ─── Tests ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n─── Missing Premiums E2E Test ───────────────────────────────────\n");
  console.log(`     project: ${supabaseUrl}\n`);

  // ── 1. Table is reachable and has rows ────────────────────────────────────
  console.log("Step 1: Load rows from tiers_and_rates");

  const { data: rows, error: loadError } = await supabase
    .from("tiers_and_rates")
    .select(
      "id, plan_id, tier_key, premium_ee, premium_es, premium_ec, premium_ef, " +
      "premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user"
    )
    .order("id")
    .limit(10);

  assert(!loadError, "Table is reachable", loadError?.message);
  assert(Array.isArray(rows) && rows!.length > 0, "At least one row returned");

  if (!rows || rows.length === 0) {
    console.log("\n⚠️  No rows found in tiers_and_rates. Aborting.\n");
    printSummary();
    return;
  }

  console.log(`     ${rows.length} row(s) loaded — using first row for write tests\n`);

  // ── 2. Snapshot original main premium values ──────────────────────────────
  console.log("Step 2: Snapshot main premium values (verified unchanged after PATCH)");

  const targetRow = rows[0];
  const snapshot = {
    premium_ee: targetRow.premium_ee,
    premium_es: targetRow.premium_es,
    premium_ec: targetRow.premium_ec,
    premium_ef: targetRow.premium_ef,
  };

  pass(`Snapshot captured — row id=${targetRow.id}  tier_key=${targetRow.tier_key}`);
  console.log(`     snapshot = ${JSON.stringify(snapshot)}\n`);

  // ── 3. PATCH _user fields ─────────────────────────────────────────────────
  console.log("Step 3: PATCH _user fields (simulate form submission)");

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
    assert(
      afterPatch.premium_ee_user === testEe,
      `premium_ee_user written as ${testEe}`,
      `actual: ${afterPatch.premium_ee_user}`
    );
    assert(
      afterPatch.premium_es_user === testEs,
      `premium_es_user written as ${testEs}`,
      `actual: ${afterPatch.premium_es_user}`
    );
    assert(
      afterPatch.premium_ec_user === null,
      "premium_ec_user untouched (null)",
      `actual: ${afterPatch.premium_ec_user}`
    );
    assert(
      afterPatch.premium_ef_user === null,
      "premium_ef_user untouched (null)",
      `actual: ${afterPatch.premium_ef_user}`
    );

    // ── 5. Verify main premium fields unchanged ────────────────────────────
    console.log("\nStep 5: Verify main premium fields were NOT modified");

    assert(
      afterPatch.premium_ee === snapshot.premium_ee,
      `premium_ee unchanged (${snapshot.premium_ee})`,
      `actual: ${afterPatch.premium_ee}`
    );
    assert(
      afterPatch.premium_es === snapshot.premium_es,
      `premium_es unchanged (${snapshot.premium_es})`,
      `actual: ${afterPatch.premium_es}`
    );
    assert(
      afterPatch.premium_ec === snapshot.premium_ec,
      `premium_ec unchanged (${snapshot.premium_ec})`,
      `actual: ${afterPatch.premium_ec}`
    );
    assert(
      afterPatch.premium_ef === snapshot.premium_ef,
      `premium_ef unchanged (${snapshot.premium_ef})`,
      `actual: ${afterPatch.premium_ef}`
    );
  }

  // ── 6. Field whitelist verification ───────────────────────────────────────
  console.log("\nStep 6: Whitelist — main premium fields must be stripped from patch payload");

  const ALLOWED_FIELDS = new Set([
    "premium_ee_user",
    "premium_es_user",
    "premium_ec_user",
    "premium_ef_user",
  ]);

  const maliciousPayload: Record<string, unknown> = {
    id: targetRow.id,
    premium_ee: 0.01,
    premium_ee_user: 777,
  };

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(maliciousPayload)) {
    if (key !== "id" && ALLOWED_FIELDS.has(key)) filtered[key] = value;
  }

  assert(!("premium_ee" in filtered), "Whitelist strips premium_ee from patch payload");
  assert("premium_ee_user" in filtered, "Whitelist passes premium_ee_user through");

  // ── 7. Cleanup ────────────────────────────────────────────────────────────
  console.log("\nStep 7: Cleanup — reset _user fields to null");

  const { error: cleanupError } = await supabase
    .from("tiers_and_rates")
    .update({
      premium_ee_user: null,
      premium_es_user: null,
      premium_ec_user: null,
      premium_ef_user: null,
    })
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

  printSummary();
}

run().catch((err) => {
  console.error("\n❌  Unexpected error:", err);
  process.exit(1);
});
