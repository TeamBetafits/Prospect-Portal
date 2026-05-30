import { NextRequest, NextResponse } from "next/server";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { upsertProgressStep } from "@/lib/upsertProgressStep";

const MANUAL_INPUT_STEP = "Missing Premiums Manual Input";

const USER_FIELDS = new Set([
  "premium_ee_user",
  "premium_es_user",
  "premium_ec_user",
  "premium_ef_user",
]);

/**
 * POST /api/missing-premiums/submit
 *
 * Called by the Prospect Portal when the user submits the Missing Premiums
 * Manual Input form. Writes the entered values to the tiers_and_rates _user
 * columns (premium_ee_user, premium_es_user, etc.), which are the staging
 * layer built into the schema.
 *
 * The main premium fields (premium_ee, premium_es, etc.) are NOT touched.
 * Those are only updated when an admin approves via POST /api/missing-premiums/approve,
 * which copies _user → main and clears the _user columns.
 */
export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { updates, notes, supporting_documents } = body;

    const hasDocuments = Array.isArray(supporting_documents) && supporting_documents.length > 0;
    const hasUpdates = Array.isArray(updates) && updates.length > 0;

    if (!hasUpdates && !hasDocuments) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    // Validate and whitelist — only _user fields are ever written
    const sanitizedUpdates = hasUpdates
      ? (updates as Record<string, unknown>[])
          .map((u) => {
            const out: Record<string, unknown> = {};
            if (typeof u.id === "string" && u.id) out.id = u.id;
            for (const [key, value] of Object.entries(u)) {
              if (USER_FIELDS.has(key) && typeof value === "number" && !Number.isNaN(value) && value >= 0) {
                out[key] = value;
              }
            }
            return out;
          })
          .filter((u) => typeof u.id === "string" && Object.keys(u).length > 1)
      : [];

    // Security fence: only allow updates to rows whose plan belongs to this company
    const { data: companyPlans, error: plansError } = await supabaseAdmin
      .from("available_plans")
      .select("id")
      .eq("company_id", companyId);

    if (plansError || !companyPlans) {
      console.error("[missing-premiums/submit] Plans fetch error:", plansError);
      return NextResponse.json({ error: "Could not verify plan ownership" }, { status: 500 });
    }

    const companyPlanIds = companyPlans.map((p: { id: string }) => p.id);

    const { data: availableFormRows, error: availableFormError } = await supabaseAdmin
      .from("intake_available_forms")
      .select("id, airtable_id, display_name")
      .or(
        "airtable_id.eq.missing-premiums-manual-input,display_name.ilike.%Missing Premiums%,display_name.ilike.%Confirm Plan Premiums%"
      )
      .limit(10);

    if (availableFormError) {
      console.error("[missing-premiums/submit] Available form lookup error:", availableFormError);
    }

    const missingPremiumsAvailableFormId =
      availableFormRows?.find((row: { id: string; airtable_id: string | null; display_name: string | null }) =>
        row.airtable_id === "missing-premiums-manual-input" ||
        String(row.display_name || "").toLowerCase().includes("missing premiums") ||
        String(row.display_name || "").toLowerCase().includes("confirm plan premiums")
      )?.id || null;

    // Write _user fields to tiers_and_rates — these are the staging columns.
    // Main premium fields (premium_ee, etc.) are not touched until admin approves.
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const update of sanitizedUpdates) {  // no-op when document-only
      const id = update.id as string;
      const patch: Record<string, number> = {};
      for (const [key, value] of Object.entries(update)) {
        if (USER_FIELDS.has(key) && typeof value === "number") patch[key] = value;
      }

      const { error } = await supabaseAdmin
        .from("tiers_and_rates")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .in("plan_id", companyPlanIds);

      if (error) {
        console.error(`[missing-premiums/submit] Row ${id} error:`, error);
        results.push({ id, ok: false, error: error.message });
      } else {
        results.push({ id, ok: true });
      }
    }

    const anyFailed = results.some((r) => !r.ok);
    if (anyFailed) {
      return NextResponse.json({ error: "Some rows could not be saved", results }, { status: 207 });
    }

    // Mark step Pending Approval — rerun is only triggered after admin approves
    const stepNotes = [
      "Awaiting admin review of manually entered premium values",
      notes ? `User notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join(" — ");

    await upsertProgressStep(companyId, MANUAL_INPUT_STEP, "Pending Approval", stepNotes);

    // Mark the assigned form row as Submitted so dashboard/admin status mirrors
    // Quick Start behavior (Submitted + timestamps). Use broad matching because
    // historical rows may use different names/IDs.
    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const assignedFormPatch = {
      status: "Submitted",
      submitted: true,
      assigned: true,
      first_submitted: today,
      last_updated: today,
      updated_at: now,
    };

    let assignedQuery = supabaseAdmin.from("intake_assigned_forms").update(assignedFormPatch).eq("company_id", companyId);

    if (missingPremiumsAvailableFormId) {
      assignedQuery = assignedQuery.eq("available_form_id", missingPremiumsAvailableFormId);
    } else {
      assignedQuery = assignedQuery.or(
        "name.ilike.%Missing Premiums%," +
          "name.ilike.%Missing Premiums Manual Input%," +
          "name.ilike.%Confirm Plan Premiums%"
      );
    }

    const { data: updatedAssignedRows, error: assignedUpdateError } = await assignedQuery.select("id");

    if (assignedUpdateError) {
      console.error("[missing-premiums/submit] Assigned form update error:", assignedUpdateError);
    }

    // If no existing assignment row matched, create one so status is not stuck at
    // Unassigned / Not Started in portal/admin views.
    if (!updatedAssignedRows || updatedAssignedRows.length === 0) {
      if (!missingPremiumsAvailableFormId) {
        console.warn("[missing-premiums/submit] Could not resolve Missing Premiums available form id; skipping fallback insert.");
      } else {
      const { error: assignedInsertError } = await supabaseAdmin
        .from("intake_assigned_forms")
        .insert({
          company_id: companyId,
          available_form_id: missingPremiumsAvailableFormId,
          name: "Confirm Plan Premiums",
          created_time: now,
          ...assignedFormPatch,
        });

      if (assignedInsertError) {
        console.error("[missing-premiums/submit] Assigned form insert error:", assignedInsertError);
      }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[missing-premiums/submit] Error:", err);
    return NextResponse.json({ error: err?.message ?? "Failed to submit" }, { status: 500 });
  }
}
