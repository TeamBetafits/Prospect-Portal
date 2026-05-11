import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { getCompanyData } from "@/lib/supabase/portal";

export async function getCompanyDetailsPageData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const companyId = await getCompanyId();
  if (!companyId) return null;

  try {
    return getCompanyData(companyId);
  } catch (error) {
    console.error("[CompanyDetailsPage] Error:", error);
    return null;
  }
}
