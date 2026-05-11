import { NextResponse } from "next/server";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { mapSupabaseToFormState } from "@/lib/mappings/appointBetafitsMapping";

export const dynamic = "force-dynamic";

export async function GET() {
  const companyId = await getCompanyId();
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();

    if (companyError) throw companyError;
    if (!company) return NextResponse.json({ initialValues: {} });

    const { data: entities, error: entityError } = await supabaseAdmin
      .from("entities")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (entityError) throw entityError;

    const { data: locations, error: locationError } = await supabaseAdmin
      .from("locations")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (locationError) throw locationError;

    const entity = entities?.find((row) => row.primary_entity === true) ?? entities?.[0] ?? null;
    const location = locations?.find((row) => row.primary_location === true) ?? locations?.[0] ?? null;

    if (!entity && !location) return NextResponse.json({ initialValues: {} });

    return NextResponse.json({
      initialValues: mapSupabaseToFormState(company, entity, location),
    });
  } catch (error: any) {
    console.error("[Appoint Betafits Prefill API] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load form data" }, { status: 500 });
  }
}
