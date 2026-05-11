import "dotenv/config";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadAvailableFormsSeedRecords } from "../lib/supabase/availableFormsSeed";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const csvPath = path.resolve(process.cwd(), "../Intake - Available Forms-Grid view.csv");

async function main() {
  const records = loadAvailableFormsSeedRecords(csvPath);
  let inserted = 0;
  let updated = 0;

  for (const record of records) {
    const existing = record.airtable_id
      ? await findBy("airtable_id", record.airtable_id)
      : await findBy("display_name", record.display_name);

    if (existing?.id) {
      const { error } = await supabase
        .from("intake_available_forms")
        .update({ ...record, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
      updated += 1;
    } else {
      const { error } = await supabase
        .from("intake_available_forms")
        .insert({ ...record, created_at: new Date().toISOString() });
      if (error) throw error;
      inserted += 1;
    }
  }

  const reconciled = await reconcileLegacyAvailableForms();
  console.log(
    `Seeded intake_available_forms from ${csvPath}: ${inserted} inserted, ${updated} updated, ${reconciled} legacy assignments reconciled.`
  );
}

async function findBy(column: "airtable_id" | "display_name", value: string) {
  const { data, error } = await supabase
    .from("intake_available_forms")
    .select("id")
    .eq(column, value)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function reconcileLegacyAvailableForms() {
  const legacyMappings = [
    { legacyName: "Quickstart", targetAirtableId: "eBxXtLZdK4us" },
    { legacyName: "PEO/EOR Assessment", targetAirtableId: "cqBbC1vEUcus" },
  ];
  let reconciled = 0;

  for (const mapping of legacyMappings) {
    const { data: target, error: targetError } = await supabase
      .from("intake_available_forms")
      .select("id")
      .eq("airtable_id", mapping.targetAirtableId)
      .limit(1)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target?.id) continue;

    const { data: legacyRows, error: legacyError } = await supabase
      .from("intake_available_forms")
      .select("id")
      .is("airtable_id", null)
      .ilike("display_name", `${mapping.legacyName}%`);
    if (legacyError) throw legacyError;

    for (const legacy of legacyRows || []) {
      const { count: existingAssignments, error: countError } = await supabase
        .from("intake_assigned_forms")
        .select("id", { count: "exact", head: true })
        .eq("available_form_id", legacy.id);
      if (countError) throw countError;

      const { error: updateError } = await supabase
        .from("intake_assigned_forms")
        .update({ available_form_id: target.id, updated_at: new Date().toISOString() })
        .eq("available_form_id", legacy.id);
      if (updateError) throw updateError;
      reconciled += existingAssignments || 0;

      const { error: hideError } = await supabase
        .from("intake_available_forms")
        .update({ show_in_available_forms: false, updated_at: new Date().toISOString() })
        .eq("id", legacy.id);
      if (hideError) throw hideError;
    }
  }

  return reconciled;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
