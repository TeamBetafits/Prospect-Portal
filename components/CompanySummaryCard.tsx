import React from 'react';
import { CompanyData } from '@/types';

interface Props {
    data: CompanyData;
}

export default function CompanySummaryCard({ data }: Props) {
    return (
        <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-[24px] font-bold text-neutral-900 tracking-tight">
                        {data.name || 'Company Name'}
                    </h2>
                    <p className="text-[15px] text-neutral-500 mt-1 font-medium">
                        {data.address || 'Address not provided'}
                    </p>
                </div>
                <div className="w-16 h-16 bg-primary-50 rounded-md flex items-center justify-center text-primary-700 font-bold text-2xl">
                    {data.name?.charAt(0) || 'C'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-1">
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Entity Type
                    </span>
                    <p className="text-[16px] font-medium text-neutral-900">
                        {data.entityType || '-'}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Employees
                    </span>
                    <p className="text-[16px] font-medium text-neutral-900">
                        {data.workforce.totalEmployees?.toLocaleString() || '-'}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider">
                        EIN
                    </span>
                    <p className="text-[16px] font-medium text-neutral-900">
                        {data.ein || '-'}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Contact Name
                    </span>
                    <p className="text-[16px] font-medium text-neutral-900">
                        {data.contact.firstName && data.contact.lastName 
                            ? `${data.contact.firstName} ${data.contact.lastName}`
                            : '-'}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Job Title
                    </span>
                    <p className="text-[16px] font-medium text-neutral-900">
                        {data.contact.jobTitle || '-'}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Phone
                    </span>
                    <p className="text-[16px] font-medium text-neutral-900">
                        {data.contact.phone || '-'}
                    </p>
                </div>
            </div>
        </div>
    );
}
