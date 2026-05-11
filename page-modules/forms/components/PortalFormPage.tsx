"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FormNotice from "@/page-modules/forms/components/FormNotice";
import { PORTAL_FORM_CONFIGS } from "@/page-modules/forms/constants/portalFormConfigs";
import { usePortalForm } from "@/page-modules/forms/hooks/usePortalForm";
import { PortalFormComponentProps } from "@/page-modules/forms/types/formWorkflow";

interface Props {
  configKey: keyof typeof PORTAL_FORM_CONFIGS;
}

export default function PortalFormPage({ configKey }: Props) {
  const config = PORTAL_FORM_CONFIGS[configKey];
  const portalForm = usePortalForm(config);
  const [companyId, setCompanyId] = useState<string>();

  useEffect(() => {
    let isMounted = true;
    fetch("/api/forms/group-data")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isMounted && data?.recordId) setCompanyId(data.recordId);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);
  const FormComponent = config.formComponent as React.ComponentType<PortalFormComponentProps>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-neutral-500">
        <Link href="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900">{config.breadcrumbLabel}</span>
      </div>

      <header className="mb-8">
        <h1 className="text-[32px] font-bold text-neutral-900 tracking-tight leading-tight mb-2">{config.title}</h1>
        <p className="text-[16px] text-neutral-500 font-medium">{config.subtitle}</p>
      </header>

      {portalForm.isSuccess && (
        <FormNotice title="Form Submitted Successfully!" message="Redirecting to dashboard..." tone="success" />
      )}

      {portalForm.submitError && (
        <FormNotice title="Submission Failed" message={portalForm.submitError} tone="error" onClose={portalForm.clearSubmitError} />
      )}

      <FormComponent
        onSave={portalForm.handleSave}
        onSubmit={portalForm.handleSubmit}
        isSubmitting={portalForm.isSubmitting}
        initialValues={portalForm.initialValues}
        companyId={companyId}
      />
    </div>
  );
}
