import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const EMPLOYEE_FEEDBACK_SOLUTION_ID = '5749e245-e574-4269-aa10-bb402e2a0991';
const EMPLOYEE_FEEDBACK_GROUP_SOLUTION_ID = '3a72c1f4-eb01-4d91-ae71-e265f3d64c14';

type RequestBody = {
    values?: Record<string, unknown>;
};

function normalizeScore(value: unknown): number | null {
    const numeric = Number(value);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 5) {
        return numeric;
    }

    return null;
}

function normalizeText(value: unknown): string | null {
    if (value == null) {
        return null;
    }

    const cleaned = String(value).trim();
    return cleaned.length > 0 ? cleaned : null;
}

function normalizeEnrollmentType(value: unknown): string | null {
    if (value == null) {
        return null;
    }

    const raw = String(value).trim();
    if (!raw) {
        return null;
    }

    const known: Record<string, string> = {
        employee_only: 'employee_only',
        employee_spouse: 'employee_spouse',
        employee_children: 'employee_children',
        family: 'family',
        waived: 'waived',
        not_eligible: 'not_eligible',
        'employee only': 'employee_only',
        'employee + spouse': 'employee_spouse',
        'employee + child(ren)': 'employee_children',
        family_: 'family',
    };

    const normalizedKey = raw
        .toLowerCase()
        .replace(/\+/g, ' + ')
        .replace(/\s+/g, ' ')
        .trim();

    if (known[normalizedKey]) {
        return known[normalizedKey];
    }

    return normalizedKey
        .replace(/\(ren\)/g, 'ren')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

async function findSupabaseCompanyIdByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const exactMatch = await supabaseAdmin
        .from('users')
        .select('company_id')
        .ilike('email', normalizedEmail)
        .limit(1)
        .maybeSingle();

    if (exactMatch.error) {
        console.error('[Employee Feedback API] Error looking up company by email:', exactMatch.error);
        throw new Error('Failed to look up company');
    }

    return exactMatch.data?.company_id ?? null;
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;

        if (!email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as RequestBody;
        const values = body.values ?? {};

        const companyId = await findSupabaseCompanyIdByEmail(email);
        if (!companyId) {
            return NextResponse.json(
                { error: 'No Supabase company mapping was found for the logged-in user.' },
                { status: 400 },
            );
        }

        const overallScore = normalizeScore(values.overallBenefitsPackage);
        const healthInsuranceScore = normalizeScore(values.medicalPlanOptions);
        const medicalNetworkScore = normalizeScore(values.medicalNetwork);
        const employeeCostScore = normalizeScore(values.employeeCosts);
        const nonMedicalScore = normalizeScore(values.nonMedicalBenefits);
        const comments = normalizeText(values.surveyComments);
        const openTextFeedback = normalizeText(values.surveyQuestion);
        const enrollmentType = normalizeEnrollmentType(values.healthBenefitsEnrollment);

        if (
            !enrollmentType ||
            overallScore == null ||
            healthInsuranceScore == null ||
            medicalNetworkScore == null ||
            employeeCostScore == null ||
            nonMedicalScore == null
        ) {
            return NextResponse.json(
                { error: 'Missing one or more required employee feedback fields.' },
                { status: 400 },
            );
        }

        const combinedComments = [comments, openTextFeedback]
            .filter((value): value is string => Boolean(value))
            .join('\n\n---\n\n');

        const surveyPayload = {
            company_id: companyId,
            solution_id: EMPLOYEE_FEEDBACK_SOLUTION_ID,
            group_solution_id: EMPLOYEE_FEEDBACK_GROUP_SOLUTION_ID,
            respondent_type: 'employee',
            survey_type: 'employee_benefits_feedback',
            overall_score: overallScore,
            health_insurance_score: healthInsuranceScore,
            employee_cost_score: employeeCostScore,
            non_medical_score: nonMedicalScore,
            comments: combinedComments || null,
            metadata: {
                medical_network_score: medicalNetworkScore,
                enrollment_type: enrollmentType,
            },
        };

        const { error: surveyError } = await supabaseAdmin
            .from('solution_surveys')
            .insert(surveyPayload);

        if (surveyError) {
            console.error('[Employee Feedback API] solution_surveys insert error:', surveyError);
            return NextResponse.json(
                { error: surveyError.message || 'Failed to save employee feedback survey.' },
                { status: 500 },
            );
        }

        // Best-effort status sync for the related assigned form, if a matching one exists.
        const matchingForms = await supabaseAdmin
            .from('intake_available_forms')
            .select('id, display_name, description')
            .or('display_name.ilike.%feedback%,display_name.ilike.%pulse%,description.ilike.%feedback%');

        if (!matchingForms.error && matchingForms.data && matchingForms.data.length > 0) {
            const availableFormIds = matchingForms.data.map((row) => row.id);
            const assignedFormsResult = await supabaseAdmin
                .from('intake_assigned_forms')
                .select('id, first_submitted, status, available_form_id')
                .eq('company_id', companyId)
                .in('available_form_id', availableFormIds)
                .order('last_updated', { ascending: false });

            if (!assignedFormsResult.error && assignedFormsResult.data && assignedFormsResult.data.length > 0) {
                const targetAssignedForm = assignedFormsResult.data.find((row) => row.status !== 'submitted')
                    ?? assignedFormsResult.data[0];
                const now = new Date().toISOString();
                const updates: Record<string, string> = {
                    status: 'submitted',
                    submitted: now,
                    last_updated: now,
                };

                if (!targetAssignedForm.first_submitted) {
                    updates.first_submitted = now;
                }

                const { error: assignedFormUpdateError } = await supabaseAdmin
                    .from('intake_assigned_forms')
                    .update(updates)
                    .eq('id', targetAssignedForm.id);

                if (assignedFormUpdateError) {
                    console.error('[Employee Feedback API] intake_assigned_forms update error:', assignedFormUpdateError);
                }
            }
        } else if (matchingForms.error) {
            console.error('[Employee Feedback API] intake_available_forms lookup error:', matchingForms.error);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('[Employee Feedback API] Unexpected error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
