import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { name } = await request.json();
        if (!name || !name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const userId = (session.user as any).id;
        if (!userId) return NextResponse.json({ error: 'User ID not found' }, { status: 400 });

        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { error } = await supabaseAdmin
            .from('users')
            .update({
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Account updated successfully' });
    } catch (error: any) {
        console.error('[Account Update API] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update account' }, { status: 500 });
    }
}
