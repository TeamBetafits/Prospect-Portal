import { CompanyDetailsPage, getCompanyDetailsPageData } from '@/page-modules/company-details';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <CompanyDetailsPage data={await getCompanyDetailsPageData()} />;
}
