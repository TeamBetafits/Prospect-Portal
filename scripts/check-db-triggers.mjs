/**
 * Diagnostic script: checks the live Supabase DB for triggers and array-typed columns
 * on the tables touched by the QuickStart form submission.
 *
 * Run with: node scripts/check-db-triggers.mjs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Manual .env parse (first-occurrence wins — matches dotenv behaviour)
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

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_KEY in .env");
  process.exit(1);
}

async function rpc(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    // Fall back to direct PostgREST query
    return null;
  }
  return res.json();
}

// Use the PostgREST /rpc or direct REST; some projects expose pg_meta
async function query(sql) {
  // Try Supabase pg-meta API
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  if (res.ok) return res.json();
  return null;
}

async function restQuery(table, select = "*", filter = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}${filter ? "&" + filter : ""}`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text };
  }
  return res.json();
}

// Use the Supabase Management API to query information_schema
async function managementQuery(sql) {
  // Extract project ref from URL: https://<ref>.supabase.co
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  if (res.ok) return res.json();
  const text = await res.text();
  return { error: text };
}

const TABLES_OF_INTEREST = [
  "documents_and_artifacts",
  "form_submissions",
  "contribution_strategies",
  "benefits",
  "medical_plans",
  "dental_plans",
  "vision_plans",
  "benefit_classes",
  "other_questions",
  "companies",
];

async function main() {
  console.log("=== Supabase DB Diagnostic ===");
  console.log("URL:", SUPABASE_URL);

  // 1. Check for triggers via pg_catalog (via RPC if available)
  console.log("\n--- Checking for triggers via information_schema ---");
  const triggerSql = `
    SELECT trigger_name, event_object_table, event_manipulation, action_timing, action_statement
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name;
  `;

  const triggers = await managementQuery(triggerSql);
  if (triggers && !triggers.error) {
    if (Array.isArray(triggers) && triggers.length === 0) {
      console.log("No triggers found in public schema.");
    } else {
      console.log("Triggers found:");
      console.log(JSON.stringify(triggers, null, 2));
    }
  } else {
    console.log("Could not query triggers via management API:", triggers?.error?.slice(0, 200));
  }

  // 2. Check array-typed columns on tables of interest
  console.log("\n--- Array-typed columns on relevant tables ---");
  const arraySql = `
    SELECT table_name, column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN (${TABLES_OF_INTEREST.map((t) => `'${t}'`).join(", ")})
      AND (data_type = 'ARRAY' OR udt_name LIKE '_%')
    ORDER BY table_name, column_name;
  `;
  const arrayCols = await managementQuery(arraySql);
  if (arrayCols && !arrayCols.error) {
    console.log("Array columns:", JSON.stringify(arrayCols, null, 2));
  } else {
    console.log("Could not query array columns:", arrayCols?.error?.slice(0, 200));
  }

  // 3. Check ALL columns of contribution_strategies
  console.log("\n--- contribution_strategies columns ---");
  const csSql = `
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contribution_strategies'
    ORDER BY ordinal_position;
  `;
  const csRows = await managementQuery(csSql);
  if (csRows && !csRows.error) {
    console.log(JSON.stringify(csRows, null, 2));
  } else {
    console.log("Error:", csRows?.error?.slice(0, 300));
  }

  // 4. Check ALL columns of benefits
  console.log("\n--- benefits columns ---");
  const bSql = `
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'benefits'
    ORDER BY ordinal_position;
  `;
  const bRows = await managementQuery(bSql);
  if (bRows && !bRows.error) {
    console.log(JSON.stringify(bRows, null, 2));
  } else {
    console.log("Error:", bRows?.error?.slice(0, 300));
  }

  // 5. Try PostgREST OpenAPI to get types
  console.log("\n--- PostgREST schema hint ---");
  const specRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (specRes.ok) {
    const spec = await specRes.json();
    const paths = Object.keys(spec.paths || {});
    console.log("Tables exposed:", paths.slice(0, 20).join(", "));

    // Get contribution_strategies schema
    const csPath = spec.paths?.["/contribution_strategies"];
    if (csPath) {
      const postBody = csPath.post?.requestBody?.content?.["application/json"]?.schema;
      if (postBody) {
        console.log("\ncontribution_strategies POST schema:");
        console.log(JSON.stringify(postBody, null, 2));
      }
    }

    // Get benefits schema
    const bPath = spec.paths?.["/benefits"];
    if (bPath) {
      const postBody = bPath.post?.requestBody?.content?.["application/json"]?.schema;
      if (postBody) {
        console.log("\nbenefits POST schema:");
        console.log(JSON.stringify(postBody, null, 2));
      }
    }
  }
}

main().catch(console.error);
