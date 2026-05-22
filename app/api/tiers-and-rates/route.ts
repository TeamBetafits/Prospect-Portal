import { NextRequest, NextResponse } from "next/server";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { supabaseAdmin } from "@/lib/supabaseClient";

type AvailablePlanMetadata = {
  id: string;
  plan_name: string | null;
  benefit_type: string | null;
};

type TiersAndRatesRow = {
  id: string;
  plan_id: string;
  tier_key: string | null;
  premium_ee: number | null;
  premium_es: number | null;
  premium_ec: number | null;
  premium_ef: number | null;
  premium_ee_user: number | null;
  premium_es_user: number | null;
  premium_ec_user: number | null;
  premium_ef_user: number | null;
};

// ─── GET /api/tiers-and-rates ─────────────────────────────────────────────────
// Returns all tiers_and_rates rows for the authenticated company.
// tiers_and_rates has no company_id column — company is linked via plan_id →
// available_plans.company_id. We do two queries and merge plan metadata.
// Each plan has 4 rows (one per tier_key: EE / ES / EC / EF).
export async function GET() {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get plan IDs + metadata for this company from available_plans
    const { data: plans, error: plansError } = await supabaseAdmin
      .from("available_plans")
      .select("id, plan_name, benefit_type")
      .eq("company_id", companyId);

    if (plansError) {
      console.error("[GET /api/tiers-and-rates] available_plans error:", plansError);
      return NextResponse.json({ error: plansError.message }, { status: 500 });
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const availablePlans = plans as AvailablePlanMetadata[];
    const planIds = availablePlans.map((p) => p.id);
    const planMap: Record<string, { plan_name: string | null; benefit_type: string | null }> = {};
    for (const p of availablePlans) {
      planMap[p.id] = { plan_name: p.plan_name, benefit_type: p.benefit_type };
    }

    // 2. Get tiers_and_rates rows for those plan IDs
    const { data: tarRows, error: tarError } = await supabaseAdmin
      .from("tiers_and_rates")
      .select(
        "id, plan_id, tier_key, " +
          "premium_ee, premium_es, premium_ec, premium_ef, " +
          "premium_ee_user, premium_es_user, premium_ec_user, premium_ef_user"
      )
      .in("plan_id", planIds)
      .order("plan_id", { ascending: true })
      .order("tier_key", { ascending: true });

    if (tarError) {
      console.error("[GET /api/tiers-and-rates] tiers_and_rates error:", tarError);
      return NextResponse.json({ error: tarError.message }, { status: 500 });
    }

    // 3. Merge plan metadata into each row
    const rows = (tarRows ?? []) as unknown as TiersAndRatesRow[];
    const data = rows.map((row) => ({
      ...row,
      plan_name: planMap[row.plan_id]?.plan_name ?? null,
      benefit_type: planMap[row.plan_id]?.benefit_type ?? null,
    }));

    // Sort: benefit_type → plan_name → tier_key
    data.sort((a, b) => {
      const bt = (a.benefit_type ?? "").localeCompare(b.benefit_type ?? "");
      if (bt !== 0) return bt;
      const pn = (a.plan_name ?? "").localeCompare(b.plan_name ?? "");
      if (pn !== 0) return pn;
      return (a.tier_key ?? "").localeCompare(b.tier_key ?? "");
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[GET /api/tiers-and-rates] Unexpected error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/tiers-and-rates ───────────────────────────────────────────────
// Accepts an array of partial updates keyed by tiers_and_rates.id.
// Only writes to the _user premium fields. Never touches the main premium fields.
//
// Body: { updates: Array<{ id: string; premium_ee_user?: number; premium_es_user?: number;
//                          premium_ec_user?: number; premium_ef_user?: number }> }
export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: Array<Record<string, unknown>> = Array.isArray(body?.updates)
      ? body.updates
      : [];

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const USER_FIELDS = new Set([
      "premium_ee_user",
      "premium_es_user",
      "premium_ec_user",
      "premium_ef_user",
    ]);

    // Resolve the company's plan IDs once — used as a security filter on every update
    const { data: companyPlans, error: plansError } = await supabaseAdmin
      .from("available_plans")
      .select("id")
      .eq("company_id", companyId);

    if (plansError || !companyPlans) {
      console.error("[PATCH /api/tiers-and-rates] Could not resolve company plans:", plansError);
      return NextResponse.json({ error: "Could not verify plan ownership" }, { status: 500 });
    }

    const companyPlanIds = companyPlans.map((p) => p.id);

    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const update of updates) {
      const id = update.id;
      if (typeof id !== "string" || !id) {
        results.push({ id: String(id ?? ""), ok: false, error: "Missing id" });
        continue;
      }

      // Whitelist: only allow _user fields through
      const patch: Record<string, number> = {};
      for (const [key, value] of Object.entries(update)) {
        if (USER_FIELDS.has(key) && typeof value === "number" && !Number.isNaN(value)) {
          patch[key] = value;
        }
      }

      if (Object.keys(patch).length === 0) {
        results.push({ id, ok: false, error: "No valid _user fields in update" });
        continue;
      }

      // Security: only allow updates to rows whose plan belongs to this company.
      // tiers_and_rates has no company_id, so we filter via plan_id.
      const { error } = await supabaseAdmin
        .from("tiers_and_rates")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .in("plan_id", companyPlanIds);

      if (error) {
        console.error(`[PATCH /api/tiers-and-rates] Row ${id} error:`, error);
        results.push({ id, ok: false, error: error.message });
      } else {
        results.push({ id, ok: true });
      }
    }

    const allOk = results.every((r) => r.ok);
    return NextResponse.json(
      { success: allOk, results },
      { status: allOk ? 200 : 207 }
    );
  } catch (err: any) {
    console.error("[PATCH /api/tiers-and-rates] Unexpected error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}
