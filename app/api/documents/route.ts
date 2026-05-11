import { NextResponse } from 'next/server';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { listDocuments } from '@/lib/supabase/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
    const companyId = await getCompanyId();
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        return NextResponse.json(await listDocuments(companyId));
    } catch (error) {
        console.error('[Documents API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
