import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { getBenefitsAnalysisData, listDocuments } from "@/lib/supabase/portal";

export async function getBenefitsAnalysisPageData() {
  const empty = { demographics: null, kpis: null, breakdown: [], reportUrl: undefined, availableReportTypes: [] as { type: string; documents: any[] }[] };
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return empty;

  const companyId = await getCompanyId();
  if (!companyId) return empty;

  try {
    const [analysis, documents] = await Promise.all([
      getBenefitsAnalysisData(companyId),
      listDocuments(companyId),
    ]);
    const reportUrl = documents.find((doc) => doc.name.toLowerCase().includes("budget"))?.url || documents[0]?.url;

    return {
      demographics: analysis.demographics,
      kpis: analysis.kpis,
      breakdown: analysis.breakdown,
      reportUrl,
      availableReportTypes: [],
    };
  } catch (error) {
    console.error("[BenefitsAnalysisPage] Error:", error);
    return empty;
  }
}
