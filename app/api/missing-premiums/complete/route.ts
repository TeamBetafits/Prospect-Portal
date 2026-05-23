import { NextResponse } from "next/server";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { upsertProgressStep } from "@/lib/upsertProgressStep";

// Step names must match what the Admin Portal and orchestration system watch for.
const MANUAL_INPUT_STEP = "Missing Premiums Manual Input";
const MISSING_PREMIUMS_STEP = "Missing Premiums";

/**
 * @deprecated Use POST /api/missing-premiums/submit (user-facing) and
 * POST /api/missing-premiums/approve (admin-facing) instead.
 *
 * This route is retained for backward compatibility but is no longer called
 * by the Prospect Portal. The approval flow now stages submissions in
 * form_submissions and only writes to tiers_and_rates after admin approval.
 */

/**
 * POST /api/missing-premiums/complete
 *
 * Called by the Prospect Portal after the user successfully submits the
 * Missing Premiums Manual Input form. Does two things:
 *
 *  1. Marks the "Missing Premiums Manual Input" progress step as Completed
 *     so the Admin Portal can display the correct status.
 *
 *  2. Sets the "Missing Premiums" step back to Pending, which acts as the
 *     rerun trigger signal for the orchestration layer.
 *
 * This route does NOT save premium values — that is handled by PATCH /api/tiers-and-rates.
 */
export async function POST() {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Mark the manual input step as completed.
    await upsertProgressStep(companyId, MANUAL_INPUT_STEP, "Completed");

    // 2. Signal Missing Premiums rerun by setting the step back to Pending.
    await upsertProgressStep(
      companyId,
      MISSING_PREMIUMS_STEP,
      "Pending",
      "User manual input submitted — rerun requested",
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[missing-premiums/complete] Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to complete step" },
      { status: 500 },
    );
  }
}
