'use client';

import React, { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

export interface AssignedForm {
    id: string;
    displayName: string;
    description: string;
    companyName?: string;
}

interface AddAssignedFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: AssignedForm) => void;
}

export default function AddAssignedFormModal({ isOpen, onClose, onSubmit }: AddAssignedFormModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableForms, setAvailableForms] = useState<AssignedForm[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchForms = async () => {
            setIsLoading(true);
            try {
                // Adjust columns as per your actual 'intake_available_forms' schema
                const { data, error } = await supabaseClient
                    .from('intake_available_forms')
                    .select('id, display_name, description')
                    .order('display_name');
                
                if (error) {
                    console.error('Error fetching forms:', error);
                } else if (data) {
                    setAvailableForms(data.map((f: any) => ({
                        id: f.id,
                        displayName: f.display_name,
                        description: f.description || '',
                    })));
                } else {
                    // Fallback stub data if the table is empty or we can't fetch it
                    setAvailableForms([
                        { id: '1', displayName: 'Quick Start', description: 'Share your company and benefits information' },
                        { id: '2', displayName: 'PEO/EOR Assessment', description: 'PEO/EOR Assessment details' },
                    ]);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredForms = availableForms.filter((f) => 
        (f.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (f.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[80vh]">
                
                {/* Header & Search */}
                <div className="p-6 border-b border-gray-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <h2 className="text-xl font-semibold mb-4 text-[#4A5568]">Link to Available Forms</h2>
                    
                    <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search for option..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800"
                        />
                    </div>
                </div>

                {/* Body / List */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <button 
                        className="w-full p-4 mb-4 rounded-md border border-blue-100 bg-blue-50/50 text-blue-500 font-semibold flex items-center justify-center hover:bg-blue-50 transition-colors"
                        onClick={() => onSubmit({ id: 'new', displayName: 'Create New Form', description: '' })}
                    >
                        + Create new
                    </button>
                    
                    {isLoading ? (
                        <p className="text-center text-sm text-gray-500 py-8">Loading available forms...</p>
                    ) : filteredForms.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 py-8">No forms found matching your search.</p>
                    ) : (
                        <div className="space-y-3">
                            {filteredForms.map((form) => (
                                <div 
                                    key={form.id} 
                                    className="bg-white border text-left p-4 rounded-lg cursor-pointer hover:border-blue-300 transition-colors border-gray-200"
                                    onClick={() => onSubmit(form)}
                                >
                                    <h3 className="font-semibold text-gray-800 mb-3">{form.displayName}</h3>
                                    
                                    <div className="grid grid-cols-[3fr_4fr] gap-2 text-[13px] text-gray-600 mt-2">
                                        <div className="font-medium">Display Name (from Link to Available Forms):</div>
                                        <div>{form.displayName}</div>
                                        
                                        {form.description && (
                                            <>
                                                <div className="font-medium mt-1">Description (from Link to Available Forms):</div>
                                                <div className="mt-1">{form.description}</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
