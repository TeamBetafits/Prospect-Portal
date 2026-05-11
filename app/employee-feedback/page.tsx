import { EmployeeFeedbackPage, getEmployeeFeedbackPageData } from '@/page-modules/employee-feedback';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <EmployeeFeedbackPage data={await getEmployeeFeedbackPageData()} />;
}
