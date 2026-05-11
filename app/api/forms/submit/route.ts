import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { getCurrentUserId } from '@/lib/auth/getUserId';
import { submitPortalForm } from '@/lib/supabase/portal';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const companyId = await getCompanyId();
        if (!companyId) {
            return NextResponse.json({ error: 'Company not found. Please ensure your account is linked to a company in the portal.' }, { status: 400 });
        }

        const body = await request.json();
        const { formId, formName, values, mappedPayloads } = body;
        if (!formId || !values || typeof values !== 'object') {
            return NextResponse.json({ error: 'Missing required fields: formId and values' }, { status: 400 });
        }

        const result = await submitPortalForm({
            companyId,
            userId: await getCurrentUserId(),
            formId: String(formId),
            formName: formName ? String(formName) : undefined,
            values,
            mappedPayloads: mappedPayloads && typeof mappedPayloads === "object" ? mappedPayloads : undefined,
        });

        revalidatePath('/');
        revalidatePath('/company-details');
        revalidatePath('/employee-feedback');
        revalidatePath('/benefit-plans');
        revalidatePath('/benefits-analysis');

        return NextResponse.json({
            success: true,
            message: 'Form submitted successfully',
            recordId: result.submissionId,
            normalizedTargets: result.normalizedTargets,
        });
    } catch (error: any) {
        console.error('[Form Submit] Error:', error);
        return NextResponse.json({ success: false, error: error?.message || 'Failed to save form. Please try again or contact support.' }, { status: 500 });
    }
}
