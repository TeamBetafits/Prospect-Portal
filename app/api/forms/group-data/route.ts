import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { getGroupDataFields } from '@/lib/supabase/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const companyId = await getCompanyId();
        if (!companyId) {
            return NextResponse.json({ error: 'Company not found. Ensure your account is linked to a company.' }, { status: 400 });
        }

        return NextResponse.json(await getGroupDataFields(companyId));
    } catch (error: any) {
        console.error('[Group Data API] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to load company data' }, { status: 500 });
    }
}
