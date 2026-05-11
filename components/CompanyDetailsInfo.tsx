'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyData } from '@/types';

interface Props {
    data: CompanyData;
}

export default function CompanyDetailsInfo({ data }: Props) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(data);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setEditedData(data);
    }, [data]);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const response = await fetch('/api/company/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedData),
            });

            const res = await response.json().catch(() => ({}));

            if (response.ok && res.success !== false) {
                setIsEditing(false);
                setSaveSuccess(true);
                router.refresh();
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert(res.error || 'Failed to update company details');
            }
        } catch (error) {
            console.error('Error updating company details:', error);
            alert('An error occurred while updating company details');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Legal & Contact Information</h2>
                    <p className="text-[13px] text-neutral-500 mt-0.5">Manage your company's legal and contact details.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md text-[13px] font-bold hover:bg-primary-700 transition-colors"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        {saveSuccess && (
                            <span className="text-[13px] font-medium text-green-600">Saved</span>
                        )}
                        <button
                            onClick={() => {
                                if (!isSaving) {
                                    setIsEditing(false);
                                    setEditedData(data);
                                }
                            }}
                            disabled={isSaving}
                            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md text-[13px] font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md text-[13px] font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Company Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.name}
                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.name || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Entity Type
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.entityType}
                            onChange={(e) => setEditedData({ ...editedData, entityType: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.entityType || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        EIN
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.ein}
                            onChange={(e) => setEditedData({ ...editedData, ein: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.ein || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Legal Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.legalName}
                            onChange={(e) => setEditedData({ ...editedData, legalName: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.legalName || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        SIC Code
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.sicCode}
                            onChange={(e) => setEditedData({ ...editedData, sicCode: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.sicCode || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        NAICS Code
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedData.naicsCode}
                            onChange={(e) => setEditedData({ ...editedData, naicsCode: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.naicsCode || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Phone Number
                    </label>
                    {isEditing ? (
                        <input
                            type="tel"
                            value={editedData.contact.phone}
                            onChange={(e) => setEditedData({ 
                                ...editedData, 
                                contact: { ...editedData.contact, phone: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.contact.phone || '-'}</p>
                    )}
                </div>
                <div>
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Contact email
                    </label>
                    <p className="text-[16px] font-medium text-neutral-900">{data.contact.email || '-'}</p>
                </div>
                <div className="md:col-span-2">
                    <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Address
                    </label>
                    {isEditing ? (
                        <textarea
                            value={editedData.address}
                            onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md text-[15px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-[16px] font-medium text-neutral-900">{data.address || '-'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
