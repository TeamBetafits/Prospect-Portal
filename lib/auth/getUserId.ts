import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { getUserIdByEmail } from "@/lib/supabase/portal";

/**
 * Get user's Supabase profile ID by email.
 * 
 * @param email The user's email address
 * @returns The user's Airtable record ID or null if not found
 */
export async function getUserIdFromSupabase(email: string): Promise<string | null> {
    return getUserIdByEmail(email);
}

/**
 * Get current user's Supabase profile ID from session.
 * 
 * @returns The user's Airtable record ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return null;
        }

        const user = session.user as any;
        const email = user.email;

        if (!email) {
            return null;
        }

        return await getUserIdFromSupabase(email);
    } catch (error) {
        console.error("[getCurrentUserId] Error:", error);
        return null;
    }
}
