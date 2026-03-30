'use client';

import React, { useState } from 'react';
import AddNewUserModal, { NewUser } from './AddNewUserModal';
import AddDocumentModal, { UploadedDocument } from './AddDocumentModal';
import AddAssignedFormModal, { AssignedForm } from './AddAssignedFormModal';
import { supabaseClient } from '@/lib/supabaseClient';

export default function SupabaseCompanyDashboard() {
    const [companyName, setCompanyName] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [existingCompanies, setExistingCompanies] = useState<{id: string, company_name: string}[]>([]);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    
    React.useEffect(() => {
        const fetchCompanies = async () => {
            const { data } = await supabaseClient.from('companies').select('id, company_name').order('company_name');
            if (data) setExistingCompanies(data);
        };
        fetchCompanies();
    }, []);
    
    // Modals
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [isFormsModalOpen, setIsFormsModalOpen] = useState(false);
    
    // State lists
    const [users, setUsers] = useState<NewUser[]>([]);
    const [assignedForms, setAssignedForms] = useState<AssignedForm[]>([]);
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Handlers
    const handleAddUser = (user: NewUser) => {
        setUsers([...users, user]);
        setIsUserModalOpen(false);
    };

    const handleAddDocument = (doc: UploadedDocument) => {
        setDocuments([...documents, doc]);
        setIsDocModalOpen(false);
    };

    const handleAddForm = (form: AssignedForm) => {
        if (!assignedForms.find(f => f.id === form.id)) {
            setAssignedForms([...assignedForms, form]);
        }
        setIsFormsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('companyName', companyName);
            if (selectedCompanyId) {
                formData.append('companyId', selectedCompanyId);
            }
            formData.append('users', JSON.stringify(users));
            formData.append('assignedForms', JSON.stringify(assignedForms));
            
            // Append files
            documents.forEach((doc, index) => {
                formData.append(`document_${index}`, doc.file);
                formData.append(`doc_type_${index}`, doc.documentType || 'General');
            });

            const response = await fetch('/api/supabase/submit-company', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit group');
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                window.location.href = '/?formSubmitted=true';
            }, 2000);
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-sm border border-gray-100 rounded-xl my-8 relative">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Company Name */}
                <div className="relative">
                    <label className="block text-sm font-medium text-[#4A5568] mb-2 flex gap-1">
                        Company Name <span className="text-gray-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                            setCompanyName(e.target.value);
                            setSelectedCompanyId(null);
                            setIsCompanyDropdownOpen(true);
                        }}
                        onFocus={() => setIsCompanyDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsCompanyDropdownOpen(false), 200)}
                        placeholder="Type to search existing or enter a new company name"
                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800"
                        required
                    />
                    {isCompanyDropdownOpen && existingCompanies.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {existingCompanies
                                .filter(c => c.company_name.toLowerCase().includes(companyName.toLowerCase()))
                                .map((company) => (
                                    <div
                                        key={company.id}
                                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700"
                                        onClick={() => {
                                            setCompanyName(company.company_name);
                                            setSelectedCompanyId(company.id);
                                            setIsCompanyDropdownOpen(false);
                                        }}
                                    >
                                        {company.company_name}
                                    </div>
                                ))}
                            {companyName && !existingCompanies.find(c => c.company_name.toLowerCase() === companyName.toLowerCase()) && (
                                <div className="px-4 py-2 text-blue-600 bg-blue-50/50 text-sm font-medium border-t border-gray-100">
                                    + Create "{companyName}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Link to Users */}
                <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-2 flex gap-1">
                        Link to Users <span className="text-gray-400">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsUserModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors bg-white font-medium shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Add
                    </button>
                    
                    {users.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {users.map((u, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                    <span className="text-sm font-medium text-gray-700">{u.firstName} {u.lastName} ({u.email})</span>
                                    <button type="button" onClick={() => setUsers(users.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Link to Assigned Forms */}
                <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-2 flex gap-1">
                        Link to Assigned Forms <span className="text-gray-400">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsFormsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors bg-white font-medium shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Add
                    </button>
                    
                    {assignedForms.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {assignedForms.map((f, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                    <span className="text-sm font-medium text-gray-700">{f.displayName}</span>
                                    <button type="button" onClick={() => setAssignedForms(assignedForms.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Group's Document */}
                <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-3">
                        Upload Group's Document
                    </label>

                    {documents.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {documents.map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded text-orange-600 border border-orange-200 bg-orange-50 uppercase">Ready</span>
                                        <span className="text-gray-700 text-sm">{d.documentType} ({d.file.name})</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsDocModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors bg-white font-medium shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Create
                    </button>
                </div>

                {/* Final Submit */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || submitSuccess}
                        className={`px-8 py-2.5 font-medium rounded-md shadow-sm transition-colors text-lg flex items-center justify-center min-w-[140px] ${
                            submitSuccess 
                                ? 'bg-green-500 text-white' 
                                : isSubmitting 
                                    ? 'bg-[#84b955]/70 text-white cursor-not-allowed' 
                                    : 'bg-[#84b955] hover:bg-[#6f9e45] text-white'
                        }`}
                    >
                        {submitSuccess ? 'Success!' : isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
            
            <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
                Never share passwords in forms. <a href="#" className="underline">Report malicious form</a>
            </div>

            <AddNewUserModal 
                isOpen={isUserModalOpen} 
                onClose={() => setIsUserModalOpen(false)} 
                onSubmit={handleAddUser} 
            />
            <AddAssignedFormModal
                isOpen={isFormsModalOpen}
                onClose={() => setIsFormsModalOpen(false)}
                onSubmit={handleAddForm}
            />
            <AddDocumentModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                onSubmit={handleAddDocument}
            />
        </div>
    );
}
