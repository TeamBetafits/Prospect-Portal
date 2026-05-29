"use client";

import React, { useEffect, useMemo, useState } from "react";
import EmptyState from "./EmptyState";
import { CompanyData } from "../types";
import { FieldGroupRenderer } from "@/shared/forms/FieldRenderer";
import { getChangedFields, normalizeDraft, validateFieldValue } from "@/shared/forms/formatters";
import {
  ProspectCompanyDraft,
  companyDataToDraft,
  draftToCompanyData,
  prospectCompanyFields,
} from "@/page-modules/company-details/companyFieldRegistry";

interface Props {
  data: CompanyData | null;
}

const splitFields = {
  company: prospectCompanyFields.filter((field) =>
    ["name", "entityType", "legalName", "ein", "sicCode", "naicsCode", "address", "renewalMonth"].includes(field.key),
  ),
  contact: prospectCompanyFields.filter((field) =>
    ["firstName", "lastName", "jobTitle", "phone", "email"].includes(field.key),
  ),
};

const CompanyDetails: React.FC<Props> = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(data);
  const [draft, setDraft] = useState<ProspectCompanyDraft | null>(data ? companyDataToDraft(data) : null);
  const [initialDraft, setInitialDraft] = useState<ProspectCompanyDraft | null>(data ? companyDataToDraft(data) : null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCompany(data);
    const nextDraft = data ? companyDataToDraft(data) : null;
    setDraft(nextDraft);
    setInitialDraft(nextDraft);
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!draft || !initialDraft) return false;
    return Object.keys(getChangedFields(initialDraft, draft)).length > 0;
  }, [draft, initialDraft]);

  if (!company || !company.name || !draft || !initialDraft) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
        <div className="flex flex-col">
          <h1 className="text-neutral-900 tracking-tight mb-2">Company</h1>
        </div>
        <EmptyState />
      </div>
    );
  }

  const handleEdit = () => {
    const nextDraft = companyDataToDraft(company);
    setDraft(nextDraft);
    setInitialDraft(nextDraft);
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm("Discard unsaved company changes?")) return;
    setDraft(initialDraft);
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(false);
  };

  const handleChange = (key: keyof ProspectCompanyDraft & string, value: unknown) => {
    setDraft((current) => (current ? { ...current, [key]: String(value ?? "") } : current));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateDraft = () => {
    const nextErrors: Record<string, string> = {};
    prospectCompanyFields.forEach((field) => {
      const message = validateFieldValue(field, draft[field.key]);
      if (message) nextErrors[field.key] = message;
    });
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateDraft() || isSaving || !hasChanges) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const normalizedDraft = normalizeDraft(prospectCompanyFields, draft) as ProspectCompanyDraft;
      const nextCompany = draftToCompanyData(company, normalizedDraft);
      const updatePayload = {
        name: normalizedDraft.name,
        entityType: normalizedDraft.entityType,
        legalName: normalizedDraft.legalName,
        ein: normalizedDraft.ein,
        sicCode: normalizedDraft.sicCode,
        naicsCode: normalizedDraft.naicsCode,
        address: normalizedDraft.address,
        renewalMonth: normalizedDraft.renewalMonth,
        contact: {
          firstName: normalizedDraft.firstName,
          lastName: normalizedDraft.lastName,
          jobTitle: normalizedDraft.jobTitle,
          phone: normalizedDraft.phone,
          email: normalizedDraft.email,
        },
      };
      const response = await fetch("/api/company/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (result?.details && typeof result.details === "object") {
          setFieldErrors(result.details as Record<string, string>);
        }
        throw new Error(result?.error || "Failed to update company details");
      }

      setCompany(nextCompany);
      setDraft(companyDataToDraft(nextCompany));
      setInitialDraft(companyDataToDraft(nextCompany));
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update company details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col">
          <h1 className="text-neutral-900 tracking-tight mb-2">Company</h1>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="self-start text-[13px] font-bold text-primary-600 transition-colors hover:text-primary-700"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-3 self-start">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="text-[13px] font-bold text-neutral-500 transition-colors hover:text-neutral-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`rounded-md px-4 py-2 text-[13px] font-bold transition-all ${
                hasChanges && !isSaving
                  ? "bg-primary-600 text-white shadow-sm hover:bg-primary-700"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {saveError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {saveError}
        </div>
      ) : null}
      {saveSuccess ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-700">
          Company details saved.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="rounded-md border border-neutral-200 bg-white shadow-card">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-8 py-6">
            <h2 className="text-lg font-bold text-neutral-900">Company Info</h2>
          </div>
          <div className="p-8">
            <FieldGroupRenderer
              fields={splitFields.company}
              values={draft}
              mode={isEditing ? "edit" : "read"}
              errors={fieldErrors}
              disabled={isSaving}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-md border border-neutral-200 bg-white shadow-card">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-8 py-6">
            <h2 className="text-lg font-bold text-neutral-900">Contact Info</h2>
          </div>
          <div className="p-8">
            <FieldGroupRenderer
              fields={splitFields.contact}
              values={draft}
              mode={isEditing ? "edit" : "read"}
              errors={fieldErrors}
              disabled={isSaving}
              onChange={handleChange}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default CompanyDetails;
