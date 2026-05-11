import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { setSupabaseUserPassword } from "@/lib/supabase/portal";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { password } = await request.json();
        if (!password || password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
        }

        await setSupabaseUserPassword(session.user.email, password);
        return NextResponse.json({ success: true, message: "Password set successfully" });
    } catch (error: any) {
        console.error("[Set Password API] Error:", error);
        return NextResponse.json({ error: error?.message || "An error occurred" }, { status: 500 });
    }
}
