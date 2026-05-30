import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { getBenefitPlansData } from '@/lib/supabase/portal';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = await getCompanyId();
    if (!companyId) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    return NextResponse.json(await getBenefitPlansData(companyId), { status: 200 });
  } catch (error) {
    console.error('[Benefit Plans API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch benefit plans' }, { status: 500 });
  }
}
