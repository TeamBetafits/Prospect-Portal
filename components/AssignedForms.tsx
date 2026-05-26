'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { AssignedForm, FormStatus } from '@/types';

interface Props {
    forms: AssignedForm[];
}

const AssignedForms: React.FC<Props> = ({ forms }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const formsPerPage = 5;
    
    // Calculate pagination
    const totalPages = Math.ceil(forms.length / formsPerPage);
    const startIndex = (currentPage - 1) * formsPerPage;
    const endIndex = startIndex + formsPerPage;
    const currentForms = forms.slice(startIndex, endIndex);

    const getStatusStyle = (status: FormStatus) => {
        switch (status) {
            case FormStatus.COMPLETED:
                return 'bg-primary-50 text-primary-700 border-primary-100';
            case FormStatus.IN_PROGRESS:
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case FormStatus.SUBMITTED:
                return 'bg-neutral-50 text-neutral-700 border-neutral-200';
            default:
                // Match Softr: Pink badge for "Not Started"
                return 'bg-pink-100 text-pink-700 border-pink-200';
        }
    };

    const getStatusLabel = (status: FormStatus) => {
        switch (status) {
            case FormStatus.IN_PROGRESS:
                return 'Incomplete';
            default:
                return status;
        }
    };

    const getFormRoute = (form: AssignedForm): string => {
        const { id: formId, name: formName, description, availableFormId } = form;
        // Map all 17 forms by template/available form ID (most reliable for in-app routes)
        const formRouteMap: Record<string, string> = {
            // Fillout forms (4)
            'eBxXtLZdK4us': '/forms/quick-start', // Quick Start uses this route
            'rZhiEaUEskus': '/forms/update-quickstart-current-benefits',
            'gn6WNJPJKTus': '/forms/update-peo-hr',
            'urHF8xDu7eus': '/forms/update-broker-role',
            
            // All other forms (13)
            'rec4V98J6aPaM3u9H': '/forms/medical-coverage-survey',
            'rec7NfuiBQ8wrEmu7': '/forms/workers-compensation',
            'recFVcfdoXkUjIcod': '/forms/add-new-group',
            'recFxyNqTLDdrxXN2': '/forms/benefits-administration',
            'recGrsR8Sdx96pckJ': '/forms/benefits-compliance',
            'recKzuznmqq29uASl': '/forms/peo-eor-assessment',
            'recOE9pVakkobVzU7': '/forms/appoint-betafits',
            'recOt6cX0t1DksDFT': '/forms/hr-tech',
            'recUnTZFK5UyfWqzm': '/forms/comprehensive-intake',
            'recdjXjySYuYUGkdP': '/forms/premiums-contribution-strategy',
            'missing-premiums-manual-input': '/forms/missing-premiums',
            'rechTHxZIxS3bBcqF': '/forms/basic-intake',
            'reclUQ6KhVzCssuVl': '/forms/quick-start-new-benefits',
            'recmB9IdRhtgckvaY': '/forms/benefits-pulse-survey',
            'recsLJiBVdED8EEbr': '/forms/document-uploader',
            'recufWIRuSFArZ9GG': '/forms/quick-start-alt',
            'recxH9Jrk10bbqU58': '/forms/broker-role',
            'recySUNj6jv47SOKr': '/forms/nda',
        };

        // Prefer linked Available Form ID (template ID) so we always use in-app route, not external URL
        if (availableFormId && formRouteMap[availableFormId]) {
            return formRouteMap[availableFormId];
        }
        // Extract Fillout template ID from description URL so we never open raw URL when we have in-app form
        if (description && (description.includes('fillout.com/t/') || description.includes('fillout.com/'))) {
            const templateIdMatch = description.match(/fillout\.com\/t\/([a-zA-Z0-9]+)/);
            if (templateIdMatch && formRouteMap[templateIdMatch[1]]) {
                return formRouteMap[templateIdMatch[1]];
            }
        }
        // Assigned form record ID usually doesn't match; keep for any direct mapping
        if (formRouteMap[formId]) {
            return formRouteMap[formId];
        }

        // Fallback: Map by form name (case-insensitive)
        const formNameLower = formName.toLowerCase();
        
        // Quick Start forms - prioritize by specific identifiers
        if (formNameLower.includes('quick start') && formNameLower.includes('multi-page')) {
            return '/forms/quick-start-current-benefits';
        }
        if (formNameLower.includes('quick start') && formNameLower.includes('current benefits')) {
            return '/forms/quick-start-current-benefits';
        }
        if (formNameLower.includes('quick start') && formNameLower.includes('new benefits')) {
            return '/forms/quick-start-new-benefits';
        }
        if (formNameLower.includes('quick start') || formNameLower.includes('quickstart')) {
            if (formNameLower.includes('update')) {
                return '/forms/update-quickstart-current-benefits';
            }
            // Default Quick Start should use the main form (eBxXtLZdK4us)
            return '/forms/quick-start'; // This routes to /forms/quick-start which uses eBxXtLZdK4us
        }
        
        // PEO/HR form
        if (formNameLower.includes('peo/hr') || (formNameLower.includes('peo') && formNameLower.includes('update'))) {
            return '/forms/update-peo-hr';
        }
        if (formNameLower.includes('peo/eor') || formNameLower.includes('peo eor')) {
            return '/forms/peo-eor-assessment';
        }
        
        // Broker Role form
        if (formNameLower.includes('broker role') && formNameLower.includes('update')) {
            return '/forms/update-broker-role';
        }
        if (formNameLower.includes('broker role') || formNameLower.includes('broker')) {
            return '/forms/broker-role';
        }
        
        // Other specific forms
        if (formNameLower.includes('medical coverage')) {
            return '/forms/medical-coverage-survey';
        }
        if (formNameLower.includes('workers compensation')) {
            return '/forms/workers-compensation';
        }
        if (formNameLower.includes('add new group')) {
            return '/forms/add-new-group';
        }
        if (formNameLower.includes('benefits administration')) {
            return '/forms/benefits-administration';
        }
        if (formNameLower.includes('benefits compliance')) {
            return '/forms/benefits-compliance';
        }
        if (formNameLower.includes('appoint betafits')) {
            return '/forms/appoint-betafits';
        }
        if (formNameLower.includes('hr tech')) {
            return '/forms/hr-tech';
        }
        if (formNameLower.includes('comprehensive intake')) {
            return '/forms/comprehensive-intake';
        }
        if (formNameLower.includes('missing premiums')) {
            return '/forms/missing-premiums';
        }
        if (formNameLower.includes('premiums') || formNameLower.includes('contribution strategy')) {
            return '/forms/premiums-contribution-strategy';
        }
        if (formNameLower.includes('basic intake')) {
            return '/forms/basic-intake';
        }
        if (formNameLower.includes('benefits pulse survey')) {
            return '/forms/benefits-pulse-survey';
        }
        if (formNameLower.includes('document uploader')) {
            return '/forms/document-uploader';
        }
        if (formNameLower === 'nda') {
            return '/forms/nda';
        }
        
        // Never use external URL as route when we have in-app forms; only use internal paths
        if (description && description.trim() && !description.startsWith('?id=')) {
            if (description.startsWith('/')) {
                return description;
            }
            // Do not return http(s) URL - we already tried to resolve via template ID above
        }
        
        // Default: try form ID route (lowercase)
        return `/forms/${formId.toLowerCase()}`;
    };

    return (
        <section>
            <div className="mb-6">
                <h2 className="text-h3 text-neutral-900 tracking-tight">Assigned Tasks</h2>
                <p className="text-label text-neutral-500 mt-1">Items requested by the Betafits team.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentForms.map((form) => {
                    const formRoute = getFormRoute(form);
                    // Check if it's a valid route (not empty and not just company ID)
                    const isLink = formRoute !== '#' && 
                                   formRoute !== `/forms/${form.id}` && 
                                   !form.description.startsWith('?id=');

                    // Clean up form name - remove any unwanted suffixes, patterns, or email addresses
                    let displayName = form.name.trim();
                    // If name is a URL (e.g. Assigned Form URL stored in Name), use friendly name from route
                    if (displayName.startsWith('http://') || displayName.startsWith('https://')) {
                        const templateMatch = displayName.match(/fillout\.com\/t\/([a-zA-Z0-9]+)/);
                        if (templateMatch && templateMatch[1] === 'eBxXtLZdK4us') displayName = 'Quick Start';
                        else if (form.availableFormId === 'eBxXtLZdK4us') displayName = 'Quick Start';
                        else displayName = 'Form';
                    }
                    // Remove leading dashes and spaces first
                    displayName = displayName.replace(/^[-\s]+/, '');
                    
                    // Remove "Assigned to:" prefix and email addresses
                    displayName = displayName.replace(/^Assigned to:\s*/i, '');
                    displayName = displayName.replace(/\bAssigned to:\s*/gi, '');
                    displayName = displayName.replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '');
                    
                    // Remove company name prefixes (e.g., "Endue - Quick Start" -> "Quick Start")
                    // Pattern: "CompanyName - FormName" or "CompanyName: FormName"
                    // If name contains " - " (with spaces), split and take the part after the dash
                    if (displayName.includes(' - ')) {
                        const parts = displayName.split(' - ');
                        if (parts.length > 1) {
                            // Take the last part (the form name)
                            displayName = parts[parts.length - 1].trim();
                        }
                    }
                    // Also handle colon pattern: "CompanyName: FormName"
                    if (displayName.includes(': ')) {
                        const parts = displayName.split(': ');
                        if (parts.length > 1) {
                            // Take the last part (the form name)
                            displayName = parts[parts.length - 1].trim();
                        }
                    }
                    
                    // Remove patterns like "(Original)", trailing dashes
                    displayName = displayName.replace(/\s*\(Original\)\s*/gi, '');
                    displayName = displayName.replace(/\s*-\s*$/, ''); // Remove trailing dashes
                    // Only remove specific unwanted patterns in parentheses, not all parentheses
                    displayName = displayName.replace(/\s*\((Original|Copy|Duplicate)\)\s*/gi, '');
                    
                    // Remove common unwanted prefixes
                    displayName = displayName.replace(/^(Form|Survey|Intake):\s*/i, '');
                    
                    // Final cleanup - remove any remaining leading dashes or spaces
                    displayName = displayName.replace(/^[-\s]+/, '').trim();
                    
                    // If name is empty after cleaning, use a fallback
                    if (!displayName || displayName.length === 0) {
                        displayName = 'Untitled Form';
                    }

                    const isEditable = (form.availableFormId === 'eBxXtLZdK4us' || formRoute.includes('/forms/quick-start')) &&
                        (form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED);
                    const editRoute = `${formRoute.split('?')[0]}?edit=true`;

                    return (
                        <div key={form.id} className="relative group bg-white border border-neutral-200 rounded-large p-6 shadow-card flex flex-col hover:border-neutral-300 transition-colors">
                            {isEditable && (
                                <Link
                                    href={editRoute}
                                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit submission"
                                >
                                    <span className="flex items-center justify-center w-8 h-8 bg-white border border-neutral-200 rounded-full shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                        <Pencil className="w-3.5 h-3.5 text-neutral-500 hover:text-blue-600" />
                                    </span>
                                </Link>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-11 h-11 bg-neutral-50 rounded-medium flex items-center justify-center text-neutral-400 border border-neutral-100">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className={`text-small font-semibold uppercase tracking-wider px-3 py-1 rounded-small border ${getStatusStyle(form.status)}`}>
                                        {getStatusLabel(form.status)}
                                    </span>
                                </div>
                                <h3 className="text-h3 text-neutral-900 leading-tight">{displayName || 'Untitled Form'}</h3>
                            </div>
                            <div className="mt-6">
                                {isEditable ? (
                                    <Link href={editRoute} className="block">
                                        <button className="w-full h-10 rounded-medium font-semibold text-label transition-all shadow-card active:scale-[0.98] bg-neutral-100 text-neutral-600 hover:bg-blue-50 hover:text-blue-700 border border-neutral-200 hover:border-blue-300 flex items-center justify-center gap-2">
                                            <Pencil className="w-4 h-4" />
                                            Edit Submission
                                        </button>
                                    </Link>
                                ) : isLink ? (
                                    formRoute.startsWith('http://') || formRoute.startsWith('https://') ? (
                                        <a href={formRoute} target="_blank" rel="noopener noreferrer" className="block">
                                            <button 
                                                className={`w-full h-10 rounded-medium font-semibold text-label transition-all shadow-card active:scale-[0.98] ${
                                                    form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                                }`}
                                                disabled={form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED}
                                            >
                                                {form.status === FormStatus.NOT_STARTED 
                                                    ? 'Start Form' 
                                                    : form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                        ? 'Already Submitted'
                                                        : form.status === FormStatus.IN_PROGRESS
                                                            ? 'Update'
                                                            : 'Continue'}
                                            </button>
                                        </a>
                                    ) : (
                                        <Link href={formRoute} className="block">
                                            <button 
                                                className={`w-full h-10 rounded-medium font-semibold text-label transition-all shadow-card active:scale-[0.98] ${
                                                    form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                                }`}
                                                disabled={form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED}
                                            >
                                                {form.status === FormStatus.NOT_STARTED 
                                                    ? 'Start Form' 
                                                    : form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                        ? 'Already Submitted'
                                                        : form.status === FormStatus.IN_PROGRESS
                                                            ? 'Update'
                                                            : 'Continue'}
                                            </button>
                                        </Link>
                                    )
                                ) : (
                                    <button
                                        className="w-full h-10 bg-neutral-100 text-neutral-400 rounded-medium font-semibold text-label cursor-not-allowed"
                                        disabled
                                    >
                                        Coming Soon
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {forms.length === 0 && (
                    <div className="col-span-full bg-neutral-50 border border-dashed border-neutral-300 rounded-large p-6 text-center">
                        <p className="text-neutral-500 font-medium text-body">No forms currently assigned.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {forms.length > formsPerPage && (
                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                    <div className="text-label text-neutral-500">
                        Showing 1 - {Math.min(endIndex, forms.length)} of {forms.length} forms
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-10 px-2 rounded-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`h-10 px-3 rounded-medium text-label font-semibold transition-colors ${
                                    currentPage === page
                                        ? 'bg-primary-500 text-white'
                                        : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-10 px-2 rounded-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AssignedForms;
