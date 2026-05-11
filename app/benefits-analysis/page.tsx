import { BenefitsAnalysisPage, getBenefitsAnalysisPageData } from '@/page-modules/benefits-analysis';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <BenefitsAnalysisPage data={await getBenefitsAnalysisPageData()} />;
}
