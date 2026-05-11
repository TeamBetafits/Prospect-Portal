"use client";


import React, { useState, useEffect } from 'react';
import { CompanyData, ContactInfo } from '../types';
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
  const [contact, setContact] = useState<ContactInfo>(data?.contact || {} as ContactInfo);
  const [tempContact, setTempContact] = useState<ContactInfo>(data?.contact || {} as ContactInfo);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.contact) {
      setContact(data.contact);
      setTempContact(data.contact);
    }
  }, [data]);

  useEffect(() => {
    const changed = JSON.stringify(contact) !== JSON.stringify(tempContact);
    setHasChanges(changed);
  }, [tempContact, contact]);

  if (!data || !data.name) {
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
    setTempContact({ ...contact });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempContact({ ...contact });
    setIsEditing(false);
  };

  const handleSave = () => {
    setContact({ ...tempContact });
    setIsEditing(false);
    // In a real app, you'd call an API here
  };

  const updateField = (field: keyof ContactInfo, value: string) => {
    setTempContact(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col">
        <h1 className="text-neutral-900 tracking-tight mb-2">Your Company Profile</h1>
        <p className="text-neutral-500 font-medium">Review and manage your company's firmographic data and market reputation.</p>
      </div>

      {/* 1x2 Grid Layout for the remaining Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Company Info Card */}
        <section className="bg-white border border-neutral-200 rounded-md shadow-card overflow-hidden flex flex-col hover:shadow-elevated transition-all">
          <div className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-bold text-neutral-900">Company Info</h2>
          </div>
          <div className="p-8 space-y-0.5">
            <DataRow label="Company Name" value={data.name} />
            <DataRow label="Entity Type" value={data.entityType} />
            <DataRow label="Entity Legal Name" value={data.legalName} />
            <DataRow label="EIN" value={data.ein} />
            <DataRow label="SIC Code" value={data.sicCode} />
            <DataRow label="NAICS Code" value={data.naicsCode} />
            <DataRow label="HQ Address" value={data.address} />
            <DataRow label="Renewal Month" value={data.renewalMonth} />
          </div>
        </section>

        {/* 2. Contact Info Card */}
        <section className="bg-white border border-neutral-200 rounded-md shadow-card overflow-hidden flex flex-col hover:shadow-elevated transition-all">
          <div className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-neutral-900">Contact Info</h2>
            {!isEditing ? (
              <button 
                onClick={handleEdit}
                className="text-[13px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCancel}
                  className="text-[13px] font-bold text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`text-[13px] font-bold px-3 py-1 rounded-sm transition-all ${
                    hasChanges 
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' 
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          <div className="p-8 space-y-0.5">
            <DataRow 
              label="First Name" 
              value={isEditing ? tempContact.firstName : contact.firstName} 
              isEditing={isEditing}
              onChange={(val) => updateField('firstName', val)}
            />
            <DataRow 
              label="Last Name" 
              value={isEditing ? tempContact.lastName : contact.lastName} 
              isEditing={isEditing}
              onChange={(val) => updateField('lastName', val)}
            />
            <DataRow 
              label="Job Title" 
              value={isEditing ? tempContact.jobTitle : contact.jobTitle} 
              isEditing={isEditing}
              onChange={(val) => updateField('jobTitle', val)}
            />
            <DataRow 
              label="Phone Number" 
              value={isEditing ? tempContact.phone : contact.phone} 
              isEditing={isEditing}
              onChange={(val) => updateField('phone', val)}
            />
            <DataRow 
              label="Work Email" 
              value={isEditing ? tempContact.email : contact.email} 
              isEditing={isEditing}
              onChange={(val) => updateField('email', val)}
            />
          </div>
        </section>

      </div>
    </div>
  );
};

export default CompanyDetails;
