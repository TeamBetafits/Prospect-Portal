import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { getLastFormSubmissionAnswers } from '@/lib/supabase/portal';

export const dynamic = 'force-dynamic';

// Known aliases so that e.g. submitting as eBxXtLZdK4us also covers jLwpyNvuB2us
const FORM_ALIAS_GROUPS: Record<string, string[]> = {
  eBxXtLZdK4us: ['eBxXtLZdK4us', 'jLwpyNvuB2us'],
  jLwpyNvuB2us: ['eBxXtLZdK4us', 'jLwpyNvuB2us'],
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 });
    }

    const formId = request.nextUrl.searchParams.get('formId');
    if (!formId) {
      return NextResponse.json({ error: 'Missing formId parameter' }, { status: 400 });
    }

    const formIds = FORM_ALIAS_GROUPS[formId] ?? [formId];
    const answers = await getLastFormSubmissionAnswers(companyId, formIds);

    return NextResponse.json({ answers: answers ?? null });
  } catch (error: any) {
    console.error('[Last Submission API] Error:', error);
    return NextResponse.json({ answers: null });
  }
}
