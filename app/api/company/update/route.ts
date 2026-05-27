import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { updateCompanyData } from '@/lib/supabase/portal';
import { validateFieldValue } from '@/shared/forms/formatters';
import { prospectCompanyFields } from '@/page-modules/company-details/companyFieldRegistry';

export const dynamic = 'force-dynamic';

const TOP_LEVEL_KEYS = new Set([
    'name',
    'entityType',
    'legalName',
    'ein',
    'sicCode',
    'naicsCode',
    'address',
    'renewalMonth',
    'contact',
]);

const CONTACT_KEYS = new Set(['firstName', 'lastName', 'jobTitle', 'phone', 'email']);

function validatePayload(body: Record<string, unknown>) {
    const details: Record<string, string> = {};
    const sanitized: Record<string, unknown> = {};

    for (const key of Object.keys(body)) {
        if (!TOP_LEVEL_KEYS.has(key)) details[key] = 'This field is not writable from the company details form.';
    }

    const contact = body.contact && typeof body.contact === 'object' && !Array.isArray(body.contact)
        ? body.contact as Record<string, unknown>
        : {};

    if (body.contact !== undefined && (typeof body.contact !== 'object' || Array.isArray(body.contact))) {
        details.contact = 'Contact must be an object.';
    }

    for (const key of Object.keys(contact)) {
        if (!CONTACT_KEYS.has(key)) details[`contact.${key}`] = 'This contact field is not writable from the company details form.';
    }

    for (const field of prospectCompanyFields) {
        const value = CONTACT_KEYS.has(field.key) ? contact[field.key] : body[field.key];
        if (value === undefined) continue;
        const message = validateFieldValue(field, value);
        if (message) details[field.key] = message;
    }

    for (const key of Array.from(TOP_LEVEL_KEYS)) {
        if (key !== 'contact' && body[key] !== undefined) sanitized[key] = body[key];
    }
    sanitized.contact = Object.fromEntries(Object.entries(contact).filter(([key]) => CONTACT_KEYS.has(key)));

    return { details, sanitized };
}

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
