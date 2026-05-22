/**
 * Uses the live DB's get_table_columns RPC to check column types,
 * and queries pg_trigger via the service role to find any DB triggers.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envText = readFileSync(resolve(process.cwd(), ".env"), "utf8");
const envMap = {};
for (const line of envText.split("\n")) {
  const m = /^([^#=\s][^=]*)=(.*)$/.exec(line.trim());
  if (m) {
    const [, key, value] = m;
    if (!(key in envMap)) envMap[key] = value.replace(/^["']|["']$/g, "");
  }
}

const URL_BASE = envMap["NEXT_PUBLIC_SUPABASE_URL"];
const KEY      = envMap["SUPABASE_SERVICE_ROLE_KEY"];
const HDR = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function rpc(fn, args = {}) {
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: HDR, body: JSON.stringify(args),
  });
  if (!r.ok) { console.warn(`RPC ${fn} failed:`, await r.text()); return null; }
  return r.json();
}

async function get(table, params = "") {
  const r = await fetch(`${URL_BASE}/rest/v1/${table}${params ? "?" + params : ""}`, { headers: HDR });
  if (!r.ok) { console.warn(`GET ${table} failed:`, await r.text()); return null; }
  return r.json();
}

const TABLES = [
  "contribution_strategies",
  "benefits",
  "medical_plans",
  "documents_and_artifacts",
  "other_questions",
  "companies",
  "benefit_classes",
];

console.log("=== Column types via get_table_columns RPC ===");
for (const table of TABLES) {
  const cols = await rpc("get_table_columns", { p_table_name: table });
  if (!cols) { console.log(`\n${table}: could not fetch`); continue; }
  console.log(`\n${table}:`);
  for (const col of (Array.isArray(cols) ? cols : [cols])) {
    // print interesting cols — array types or known columns
    const typeStr = col.data_type || col.type || JSON.stringify(col);
    const isArray = typeStr === "ARRAY" || typeStr?.includes("[]") || col.udt_name?.startsWith("_");
    if (isArray) {
      console.log(`  [ARRAY] ${col.column_name}: ${typeStr} (udt: ${col.udt_name})`);
    }
  }
}

// Print ALL columns for contribution_strategies and benefits
for (const table of ["contribution_strategies", "benefits", "documents_and_artifacts"]) {
  const cols = await rpc("get_table_columns", { p_table_name: table });
  if (!cols) continue;
  console.log(`\n=== ALL columns: ${table} ===`);
  for (const col of (Array.isArray(cols) ? cols : [])) {
    console.log(`  ${col.column_name}: ${col.data_type} (udt: ${col.udt_name})`);
  }
}

// Try to query pg_trigger via RPC that exposes SQL
console.log("\n=== Attempting trigger query via pg_catalog ===");
// Some Supabase projects expose a raw SQL RPC
const triggerRows = await rpc("exec_sql", {
  query: "SELECT tgname, relname FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid WHERE NOT tgisinternal ORDER BY relname, tgname"
});
if (triggerRows) {
  console.log("Triggers:", JSON.stringify(triggerRows, null, 2));
} else {
  console.log("exec_sql not available, trying alternative...");
  // Try pg_catalog via REST (not available on all Supabase projects)
  // Check if there's a custom schema with trigger info
  const r2 = await get("pg_catalog.pg_trigger", "select=tgname,tgtype,tgenabled&limit=20");
  if (r2) {
    console.log("pg_trigger:", JSON.stringify(r2, null, 2));
  }
}
