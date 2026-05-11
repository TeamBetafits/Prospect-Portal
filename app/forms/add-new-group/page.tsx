'use client';

import React from 'react';
import Link from 'next/link';
import SupabaseCompanyDashboard from '@/components/forms/SupabaseCompanyDashboard';

export default function AddNewGroupFormPage() {
    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-gray-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">Add New Group</span>
            </div>

            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                    Add New Group
                </h1>
                <p className="text-[16px] text-gray-500 font-medium">
                    Configure your group, assign users, and attach forms directly below.
                </p>
            </header>

            <SupabaseCompanyDashboard />
        </div>
    );
}
