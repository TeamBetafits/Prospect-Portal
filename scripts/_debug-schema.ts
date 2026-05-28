/**
 * Temporary schema debug script — delete after use.
 * Dumps the actual columns for every table the QuickStart mapping writes to.
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

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
    if (!seen.has(key)) { seen.add(key); result[key] = value; }
  }
  return result;
}

const env = {
  ...loadFirstOccurrenceEnv(path.resolve(process.cwd(), ".env")),
  ...loadFirstOccurrenceEnv(path.resolve(process.cwd(), ".env.local")),
};

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function getColumns(table: string): Promise<string[]> {
  const { data, error } = await sb.from(table).select("*").limit(1);
  if (error) return [`ERROR: ${error.message}`];
  if (!data || data.length === 0) {
    // Table exists but is empty — use information_schema
    return ["(empty table — no columns returned)"];
  }
  return Object.keys(data[0]);
}

async function main() {
  const tables = [
    "companies", "users", "contacts", "entities",
    "locations", "benefits", "contribution_strategies",
    "medical_plans", "dental_plans", "vision_plans",
    "documents_and_artifacts", "client_data",
  ];

  for (const table of tables) {
    const cols = await getColumns(table);
    console.log(`\n── ${table} ──`);
    if (cols[0]?.startsWith("ERROR")) {
      console.log(" ", cols[0]);
    } else {
      console.log(" ", cols.join(", "));
    }
  }
}

main().catch(console.error);

