/**
 * Uses the live PostgREST OpenAPI spec to show column types for key tables.
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

const SUPABASE_URL = envMap["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = envMap["SUPABASE_SERVICE_ROLE_KEY"];

const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
});

const spec = await res.json();

const TABLES = [
  "contribution_strategies",
  "benefits",
  "medical_plans",
  "documents_and_artifacts",
  "other_questions",
  "companies",
  "contribution_strategy_classes",
];

for (const table of TABLES) {
  const path = spec.paths?.[`/${table}`];
  if (!path) { console.log(`\n${table}: NOT FOUND in spec`); continue; }

  const postSchema = path.post?.requestBody?.content?.["application/json"]?.schema;
  if (!postSchema) { console.log(`\n${table}: no POST schema`); continue; }

  // Dereference if $ref
  let schema = postSchema;
  if (schema.$ref) {
    const refName = schema.$ref.replace("#/definitions/", "");
    schema = spec.definitions?.[refName] || schema;
  }

  console.log(`\n=== ${table} ===`);
  const props = schema.properties || {};
  for (const [col, def] of Object.entries(props)) {
    const typeStr = def.type || def.format || (def.items ? `array of ${JSON.stringify(def.items)}` : "unknown");
    const fmtStr = def.format ? ` (format: ${def.format})` : "";
    const descStr = def.description ? ` — ${def.description}` : "";
    console.log(`  ${col}: ${typeStr}${fmtStr}${descStr}`);
  }
}

// Also print all table names
console.log("\n=== All tables in spec ===");
console.log(Object.keys(spec.paths || {}).filter(p => p !== "/").join(", "));
