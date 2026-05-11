import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("id, company_name")
    .order("company_name");

  if (error) {
    console.error("[Companies API] Error:", error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data || []);
}
