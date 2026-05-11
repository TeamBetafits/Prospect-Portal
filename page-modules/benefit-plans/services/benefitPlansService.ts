import { unstable_noStore } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { getBenefitPlansData } from "@/lib/supabase/portal";

export async function getBenefitPlansPageData() {
  unstable_noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { eligibility: null, strategies: [], plans: [] };

  const companyId = await getCompanyId();
  if (!companyId) return { eligibility: null, strategies: [], plans: [] };

  try {
    return getBenefitPlansData(companyId);
  } catch (error) {
    console.error("[BenefitPlansPage] Error:", error);
    return { eligibility: null, strategies: [], plans: [] };
  }
}
