"use client";


import React, { useState, useEffect } from 'react';
import { CompanyData } from '../types';
import EmptyState from './EmptyState';

interface Props {
  data: CompanyData | null;
}

const DataRow: React.FC<{ label: string; value: string; isEditing?: boolean; onChange?: (val: string) => void }> = ({ label, value, isEditing, onChange }) => (
  <div className="flex py-3 border-b border-neutral-100 last:border-0 items-center min-h-[52px]">
    <div className="w-1/2 text-[13px] font-medium text-neutral-500">{label}</div>
    <div className="w-1/2">
      {isEditing && onChange ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-1.5 text-[14px] font-bold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
      ) : (
        <div className="text-[14px] font-bold text-neutral-900 leading-snug">{value || '-'}</div>
      )}
    </div>
  </div>
);

const CompanyDetails: React.FC<Props> = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(data);
  const [draftCompany, setDraftCompany] = useState<CompanyData | null>(data);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setCompany(data);
    setDraftCompany(data);
  }, [data]);

  useEffect(() => {
    const changed = JSON.stringify(company) !== JSON.stringify(draftCompany);
    setHasChanges(changed);
  }, [draftCompany, company]);

  if (!company || !company.name || !draftCompany) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
        <div className="flex flex-col">
          <h1 className="text-neutral-900 tracking-tight mb-2">Your Company Profile</h1>
          <p className="text-neutral-500 font-medium">Review and manage your company's firmographic data and market reputation.</p>
        </div>
        <EmptyState />
      </div>
    );
  }

  const handleEdit = () => {
    setDraftCompany(cloneCompanyData(company));
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftCompany(cloneCompanyData(company));
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draftCompany) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/company/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftCompany),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to update company details');
      }

      setCompany(cloneCompanyData(draftCompany));
      setDraftCompany(cloneCompanyData(draftCompany));
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update company details');
    } finally {
      setIsSaving(false);
    }
  };

  const updateCompanyField = (field: keyof Pick<CompanyData, 'name' | 'entityType' | 'legalName' | 'ein' | 'sicCode' | 'naicsCode' | 'address' | 'renewalMonth'>, value: string) => {
    setDraftCompany(prev => prev ? ({ ...prev, [field]: value }) : prev);
  };

  const updateContactField = (field: keyof CompanyData['contact'], value: string) => {
    setDraftCompany(prev => prev ? ({ ...prev, contact: { ...prev.contact, [field]: value } }) : prev);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col">
          <h1 className="text-neutral-900 tracking-tight mb-2">Your Company Profile</h1>
          <p className="text-neutral-500 font-medium">Review and manage your company's firmographic data and market reputation.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={handleEdit}
            className="text-[13px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors self-start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-3 self-start">
            <button 
              onClick={handleCancel}
              className="text-[13px] font-bold text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`text-[13px] font-bold px-3 py-1 rounded-sm transition-all ${
                hasChanges && !isSaving
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' 
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* 1x2 Grid Layout for the remaining Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Company Info Card */}
        <section className="bg-white border border-neutral-200 rounded-md shadow-card overflow-hidden flex flex-col hover:shadow-elevated transition-all">
          <div className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Company Info</h2>
          </div>
          <div className="p-8 space-y-0.5">
            <DataRow label="Company Name" value={draftCompany.name} isEditing={isEditing} onChange={(val) => updateCompanyField('name', val)} />
            <DataRow label="Entity Type" value={draftCompany.entityType} isEditing={isEditing} onChange={(val) => updateCompanyField('entityType', val)} />
            <DataRow label="Entity Legal Name" value={draftCompany.legalName} isEditing={isEditing} onChange={(val) => updateCompanyField('legalName', val)} />
            <DataRow label="EIN" value={draftCompany.ein} isEditing={isEditing} onChange={(val) => updateCompanyField('ein', val)} />
            <DataRow label="SIC Code" value={draftCompany.sicCode} isEditing={isEditing} onChange={(val) => updateCompanyField('sicCode', val)} />
            <DataRow label="NAICS Code" value={draftCompany.naicsCode} isEditing={isEditing} onChange={(val) => updateCompanyField('naicsCode', val)} />
            <DataRow label="HQ Address" value={draftCompany.address} isEditing={isEditing} onChange={(val) => updateCompanyField('address', val)} />
            <DataRow label="Renewal Month" value={draftCompany.renewalMonth} isEditing={isEditing} onChange={(val) => updateCompanyField('renewalMonth', val)} />
          </div>
        </section>

        {/* 2. Contact Info Card */}
        <section className="bg-white border border-neutral-200 rounded-md shadow-card overflow-hidden flex flex-col hover:shadow-elevated transition-all">
          <div className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Contact Info</h2>
          </div>
          {saveError && (
            <div className="mx-8 mt-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
              {saveError}
            </div>
          )}
          <div className="p-8 space-y-0.5">
            <DataRow 
              label="First Name" 
              value={draftCompany.contact.firstName}
              isEditing={isEditing}
              onChange={(val) => updateContactField('firstName', val)}
            />
            <DataRow 
              label="Last Name" 
              value={draftCompany.contact.lastName}
              isEditing={isEditing}
              onChange={(val) => updateContactField('lastName', val)}
            />
            <DataRow 
              label="Job Title" 
              value={draftCompany.contact.jobTitle}
              isEditing={isEditing}
              onChange={(val) => updateContactField('jobTitle', val)}
            />
            <DataRow 
              label="Phone Number" 
              value={draftCompany.contact.phone}
              isEditing={isEditing}
              onChange={(val) => updateContactField('phone', val)}
            />
            <DataRow 
              label="Work Email" 
              value={draftCompany.contact.email}
              isEditing={isEditing}
              onChange={(val) => updateContactField('email', val)}
            />
          </div>
        </section>

      </div>
    </div>
  );
};

function cloneCompanyData(data: CompanyData): CompanyData {
  return {
    ...data,
    contact: { ...data.contact },
    workforce: {
      ...data.workforce,
      otherUsCities: [...data.workforce.otherUsCities],
      otherCountries: [...data.workforce.otherCountries],
    },
    glassdoor: { ...data.glassdoor },
  };
}

export default CompanyDetails;
