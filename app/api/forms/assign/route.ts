import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { assignForm } from "@/lib/supabase/portal";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const companyId = await getCompanyId();
        if (!companyId) {
            return NextResponse.json({ error: "User must be linked to a company" }, { status: 400 });
        }

        const { formId } = await request.json();
        if (!formId) return NextResponse.json({ error: "Form ID is required" }, { status: 400 });

        const assignedFormId = await assignForm(companyId, String(formId));
        return NextResponse.json({ success: true, assignedFormId });
    } catch (error: any) {
        console.error("[Assign Form API] Error:", error);
        return NextResponse.json({ error: error?.message || "Failed to assign form" }, { status: 500 });
    }
}
