import { NextResponse } from 'next/server';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { listAvailableForms } from '@/lib/supabase/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
    const companyId = await getCompanyId();

    try {
        return NextResponse.json(await listAvailableForms(companyId));
    } catch (error) {
        console.error('[Available Forms API] Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
