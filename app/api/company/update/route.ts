import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { updateCompanyData } from '@/lib/supabase/portal';
import { validatePayload } from './validation';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const companyId = await getCompanyId();
        if (!companyId) return NextResponse.json({ error: 'User must be linked to a company' }, { status: 400 });

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { details, sanitized } = validatePayload(body as Record<string, unknown>);
        if (Object.keys(details).length > 0) {
            return NextResponse.json({ error: 'Invalid company details payload', details }, { status: 422 });
        }

        await updateCompanyData(companyId, sanitized);
        revalidatePath('/company-details');
        revalidatePath('/');

        return NextResponse.json({ success: true, message: 'Company details updated successfully', recordId: companyId });
    } catch (error: any) {
        console.error('[Company Update API] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update company details' }, { status: 500 });
    }
}
