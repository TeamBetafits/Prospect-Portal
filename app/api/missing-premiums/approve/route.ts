import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { upsertProgressStep } from "@/lib/upsertProgressStep";

const MANUAL_INPUT_STEP = "Missing Premiums Manual Input";
const MISSING_PREMIUMS_STEP = "Missing Premiums";

/**
 * POST /api/missing-premiums/approve
 *
 * Admin-only route. Called from the admin portal after reviewing pending
 * user-submitted premium values.
 *
 * Body: { companyId: string }
 *
 * What it does:
 *  1. Fetches tiers_and_rates rows for the company that have non-null _user fields.
 *  2. For each row, copies _user values → main premium fields (premium_ee, etc.).
 *  3. Clears all _user fields on those rows.
 *  4. Sets "Missing Premiums Manual Input" step → Completed.
 *  5. Sets "Missing Premiums" step → Pending (signals orchestration rerun).
 *
 * Protected by the ADMIN_API_KEY environment variable. Requests must include
 *   Authorization: Bearer <ADMIN_API_KEY>
 */
export async function POST(request: NextRequest) {
  // Admin key check
  const adminKey = process.env.ADMIN_API_KEY;
  const authHeader = request.headers.get("authorization") ?? "";
  const providedKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!adminKey || providedKey !== adminKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // Resolve the company's plan IDs
    const { data: companyPlans, error: plansError } = await supabaseAdmin
      .from("available_plans")
      .select("id")
      .eq("company_id", companyId);

    if (plansError || !companyPlans) {
      console.error("[missing-premiums/approve] Plans fetch error:", plansError);
      return NextResponse.json({ error: "Could not verify plan ownership" }, { status: 500 });
    }

    const companyPlanIds = companyPlans.map((p: { id: string }) => p.id);

    if (companyPlanIds.length === 0) {
      return NextResponse.json({ error: "No plans found for this company" }, { status: 404 });
    }

    // Fetch tiers_and_rates rows that have pending _user values
    const { data: pendingRows, error: fetchError } = await supabaseAdmin
      .from("tiers_and_rates")
      .select(
        "id, plan_id, " +
        "premium_ee, premium_es, premium_ec, premium_ef, " +
        "premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user"
      )
      .in("plan_id", companyPlanIds)
      .or(
        "premium_ee_user.not.is.null," +
        "premium_es_user.not.is.null," +
        "premium_ec_user.not.is.null," +
        "premium_ef_user.not.is.null"
      );

    if (fetchError) {
      console.error("[missing-premiums/approve] Fetch rows error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingRows || pendingRows.length === 0) {
      return NextResponse.json({ error: "No pending premium values found for this company" }, { status: 404 });
    }

    // For each row: promote _user → main premium field, then clear _user fields
    const now = new Date().toISOString();
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const row of pendingRows as any[]) {
      const promotion: Record<string, number | null> = {
        // Clear _user fields regardless
        premium_ee_user: null,
        premium_es_user: null,
        premium_ec_user: null,
        premium_ef_user: null,
      };

      // Copy _user value → main field only where _user is not null
      if (row.premium_ee_user !== null) promotion.premium_ee = row.premium_ee_user;
      if (row.premium_es_user !== null) promotion.premium_es = row.premium_es_user;
      if (row.premium_ec_user !== null) promotion.premium_ec = row.premium_ec_user;
      if (row.premium_ef_user !== null) promotion.premium_ef = row.premium_ef_user;

      const { error } = await supabaseAdmin
        .from("tiers_and_rates")
        .update({ ...promotion, updated_at: now })
        .eq("id", row.id)
        .in("plan_id", companyPlanIds);

      if (error) {
        console.error(`[missing-premiums/approve] Row ${row.id} error:`, error);
        results.push({ id: row.id, ok: false, error: error.message });
      } else {
        results.push({ id: row.id, ok: true });
      }
    }

    // Update progress steps
    await upsertProgressStep(companyId, MANUAL_INPUT_STEP, "Completed");
    await upsertProgressStep(
      companyId,
      MISSING_PREMIUMS_STEP,
      "Pending",
      "Admin approved manual input — rerun requested",
    );

    // Mark the assigned form row as Completed so the portal and orchestration
    // engine both see the form is fully resolved.
    await supabaseAdmin
      .from("intake_assigned_forms")
      .update({ status: "Completed", submitted: true, updated_at: now })
      .eq("company_id", companyId)
      .ilike("name", MANUAL_INPUT_STEP);

    const allOk = results.every((r) => r.ok);
    return NextResponse.json({ success: allOk, results }, { status: allOk ? 200 : 207 });
  } catch (err: any) {
    console.error("[missing-premiums/approve] Error:", err);
    return NextResponse.json({ error: err?.message ?? "Failed to approve" }, { status: 500 });
  }
}
