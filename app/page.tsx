import { DashboardPage, getDashboardPageData } from '@/page-modules/dashboard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    return <DashboardPage data={await getDashboardPageData()} />;
}
