import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const companyId = await getCompanyId();
        if (!companyId) return NextResponse.json({ error: "User must be linked to a company" }, { status: 400 });

        const body = await request.json().catch(() => ({}));
        const { description, questions } = body;

        const { data, error } = await supabaseAdmin
            .from("solution_surveys")
            .insert({
                company_id: companyId,
                respondent_type: "admin",
                survey_type: "employee_benefits_feedback",
                comments: typeof description === "string" ? description : null,
                metadata: { questions: Array.isArray(questions) ? questions : [] },
            })
            .select("id")
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Survey created successfully", surveyId: data.id });
    } catch (error: any) {
        console.error("[Create Survey API] Error:", error);
        return NextResponse.json({ error: error?.message || "An error occurred while creating the survey" }, { status: 500 });
    }
}
