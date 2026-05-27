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

async function managementQuery(sql) {
  const ref = new URL(BASE).hostname.split(".")[0];
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await r.text();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${text.slice(0, 500)}`);
}

console.log("Testing managementQuery with 'SELECT 1 as val'...");
await managementQuery("SELECT 1 as val");
