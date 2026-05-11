'use client';

import React, { useState } from 'react';
import { CompanyData } from '@/types';

interface Props {
    data: CompanyData;
}

export default function CompanyDetailsTabs({ data }: Props) {
    const [activeTab, setActiveTab] = useState<'company-info' | 'contact-info' | 'workforce' | 'glassdoor'>('company-info');

    const tabs = [
        { id: 'company-info' as const, label: 'Company Info' },
        { id: 'contact-info' as const, label: 'Contact Info' },
        { id: 'workforce' as const, label: 'Workforce Overview' },
        { id: 'glassdoor' as const, label: 'Glassdoor Overview' },
    ];

    const handleNext = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        } else {
            setActiveTab(tabs[0].id);
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-md shadow-card">
            {/* Tab Navigation */}
            <div className="border-b border-neutral-200 px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-[14px] font-semibold border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-primary-500 text-neutral-900'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 text-[13px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'company-info' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Company Name</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.name || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Entity Type</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.entityType || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Entity Legal Name</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.legalName || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">EIN</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.ein || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">SIC Code</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.sicCode || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">NAICS Code</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.naicsCode || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">HQ Address</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.address || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-[14px] text-neutral-500">Renewal Month</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.renewalMonth || '-'}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'contact-info' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">First Name</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.contact.firstName || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Last Name</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.contact.lastName || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Job Title</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.contact.jobTitle || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Phone</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.contact.phone || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-[14px] text-neutral-500">Email</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.contact.email || '-'}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'workforce' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Total Employees</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.workforce.totalEmployees || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">U.S. HQ Employees</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.workforce.usHqEmployees || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">HQ City</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.workforce.hqCity || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Other US Cities</span>
                            <span className="text-[14px] font-semibold text-neutral-900">
                                {data.workforce.otherUsCities.length > 0 ? data.workforce.otherUsCities.join(', ') : '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Other Countries</span>
                            <span className="text-[14px] font-semibold text-neutral-900">
                                {data.workforce.otherCountries.length > 0 ? data.workforce.otherCountries.join(', ') : '-'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-[14px] text-neutral-500">Open Jobs</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.workforce.openJobs || '-'}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'glassdoor' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Overall Rating</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.glassdoor.overallRating || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Benefits Rating</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.glassdoor.benefitsRating || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Health Insurance Rating</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.glassdoor.healthInsuranceRating || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Retirement Rating</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.glassdoor.retirementRating || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                            <span className="text-[14px] text-neutral-500">Overall Reviews</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.glassdoor.overallReviews || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-[14px] text-neutral-500">Benefits Reviews</span>
                            <span className="text-[14px] font-semibold text-neutral-900">{data.glassdoor.benefitsReviews || '-'}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
