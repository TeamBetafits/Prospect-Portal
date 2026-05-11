import { redirect } from 'next/navigation';
import { AccountSettingsPage, getAccountSettingsPageData } from '@/page-modules/account-settings';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const session = await getAccountSettingsPageData();

    if (!session?.user) {
        redirect('/login');
    }

    return <AccountSettingsPage user={session.user} />;
}
