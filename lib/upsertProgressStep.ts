import { supabaseAdmin } from "@/lib/supabaseClient";

/**
 * Upsert an intake_progress_steps row for the given company.
 * Matches by company_id + name (case-insensitive). Updates if found, inserts otherwise.
 */
export async function upsertProgressStep(
  companyId: string,
  name: string,
  status: string,
  notes?: string,
): Promise<void> {
  const now = new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from("intake_progress_steps")
    .select("id")
    .eq("company_id", companyId)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabaseAdmin
      .from("intake_progress_steps")
      .update({
        status,
        notes: notes ?? null,
        status_last_updated: now,
        updated_at: now,
      })
      .eq("id", existing.id);
  } else {
    await supabaseAdmin.from("intake_progress_steps").insert({
      company_id: companyId,
      name,
      status,
      notes: notes ?? null,
      visibility_progress_steps: "Missing Premiums",
      status_last_updated: now,
    });
  }
}
