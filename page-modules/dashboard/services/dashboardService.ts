import { getCompanyId } from "@/lib/auth/getCompanyId";
import { getDashboardData } from "@/lib/supabase/portal";
import { DashboardPageData } from "@/page-modules/dashboard/types/dashboard";

export async function getDashboardPageData(): Promise<DashboardPageData> {
  const companyId = await getCompanyId();
  if (!companyId) {
    return { documents: [], assignedForms: [], availableForms: [], progressSteps: [] };
  }

  return getDashboardData(companyId);
}
