import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { getCompanyIdByEmail } from "@/lib/supabase/portal";

/**
 * Get company ID from authenticated session
 * This function can be called from Server Components and API routes
 * 
 * @returns The company ID from Supabase users.company_id, or null if not linked.
 */
export async function getCompanyId(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return null;
        }

        const user = session.user as any;
        const email = user.email;

        if (!email) {
            console.warn('[getCompanyId] No email in session');
            return null;
        }

        const companyId = await getCompanyIdByEmail(email);

        if (companyId) {
            return companyId;
        }

        console.warn(`[getCompanyId] No company ID found in Supabase for user: ${email}. User must be linked to a company.`);
        return null;
    } catch (error) {
        console.error('[getCompanyId] Error:', error);
        return null;
    }
}
