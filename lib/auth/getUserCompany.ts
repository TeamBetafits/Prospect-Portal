import { getCompanyIdByEmail } from "@/lib/supabase/portal";

/**
 * Fetch user's company ID from Supabase by email.
 * 
 * @param email The user's email address
 * @returns The company ID (record ID) or null if not found
 */
export async function getUserCompanyFromAirtable(email: string): Promise<string | null> {
    return getCompanyIdByEmail(email);
}
