import { NextRequest, NextResponse } from "next/server";
import { getUserProfileByEmail } from "@/lib/supabase/portal";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { sendMagicLinkEmail } from "@/lib/email/sendMagicLink";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

        const normalizedEmail = String(email).toLowerCase().trim();
        const profile = await getUserProfileByEmail(normalizedEmail);

        if (!profile) {
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, a magic link has been sent.",
            });
        }

        const origin = request.headers.get("origin");
        const configuredUrl = process.env.PRODUCTION_URL || process.env.NEXTAUTH_URL || origin || "http://localhost:3000";
        const baseUrl = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;

        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: normalizedEmail,
            options: {
                redirectTo: `${baseUrl.replace(/\/$/, "")}/access`,
            },
        });

        if (error) throw error;

        const tokenHash = (data.properties as any)?.hashed_token;
        if (!tokenHash) throw new Error("Supabase did not return a magic-link token");
        const magicLink = `${baseUrl.replace(/\/$/, "")}/access?token=${encodeURIComponent(tokenHash)}`;

        await sendMagicLinkEmail({
            email: normalizedEmail,
            magicLink,
            userName: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || undefined,
        });

        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, a magic link has been sent.",
        });
    } catch (error: any) {
        console.error("[Send Magic Link API] Error:", error);
        return NextResponse.json({ error: error?.message || "An error occurred while sending the magic link" }, { status: 500 });
    }
}
