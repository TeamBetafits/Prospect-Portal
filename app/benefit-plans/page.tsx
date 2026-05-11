import { BenefitPlansPage, getBenefitPlansPageData } from '@/page-modules/benefit-plans';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <BenefitPlansPage data={await getBenefitPlansPageData()} />;
}
