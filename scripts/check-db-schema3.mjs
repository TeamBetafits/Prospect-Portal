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

const BASE = envMap["NEXT_PUBLIC_SUPABASE_URL"];
const KEY  = envMap["SUPABASE_SERVICE_ROLE_KEY"];
const HDR  = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function rpc(fn, args) {
  const r = await fetch(`${BASE}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: HDR, body: JSON.stringify(args),
  });
  const text = await r.text();
  if (!r.ok) { console.warn(`RPC ${fn} failed (${r.status}):`, text.slice(0, 300)); return null; }
  try { return JSON.parse(text); } catch { return text; }
}

const TABLES = ["contribution_strategies", "benefits", "documents_and_artifacts", "medical_plans", "dental_plans"];

console.log("=== get_table_columns (p_schema, p_table) ===");
for (const t of TABLES) {
  const cols = await rpc("get_table_columns", { p_schema: "public", p_table: t });
  if (!cols) continue;
  console.log(`\n${t}:`);
  const arr = Array.isArray(cols) ? cols : [];
  for (const c of arr) {
    console.log(`  ${c.column_name || JSON.stringify(c)}: ${c.data_type} (udt: ${c.udt_name})`);
  }
}

console.log("\n=== Contribution strategies – full columns ===");
const cs = await rpc("get_table_columns", { p_schema: "public", p_table: "contribution_strategies" });
if (cs && Array.isArray(cs)) console.log(JSON.stringify(cs, null, 2));
