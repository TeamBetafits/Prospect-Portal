import BenefitsAnalysis from "@/components/BenefitsAnalysis";
import { BudgetBreakdown, DemographicInsights, FinancialKPIs } from "@/types";

interface ReportType {
  type: string;
  documents: any[];
}

interface Props {
  data: {
    demographics: DemographicInsights | null;
    kpis: FinancialKPIs | null;
    breakdown: BudgetBreakdown[];
    reportUrl?: string;
    availableReportTypes: ReportType[];
  };
}

export default function BenefitsAnalysisPage({ data }: Props) {
  return (
    <BenefitsAnalysis
      demographics={data.demographics}
      kpis={data.kpis}
      breakdown={data.breakdown}
      reportUrl={data.reportUrl}
      availableReportTypes={data.availableReportTypes}
    />
  );
}
