import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { getEmployeeFeedback } from "@/lib/supabase/portal";

export async function getEmployeeFeedbackPageData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { stats: null, responses: [] };

  const companyId = await getCompanyId();
  if (!companyId) return { stats: null, responses: [] };

  try {
    return getEmployeeFeedback(companyId);
  } catch (error) {
    console.error("[EmployeeFeedbackPage] Error fetching data:", error);
    return { stats: null, responses: [] };
  }
}
