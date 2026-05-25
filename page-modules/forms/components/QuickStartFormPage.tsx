"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QuickStartForm from "@/components/forms/QuickStartForm";
import FormNotice, { ReturnToDashboardButton } from "@/page-modules/forms/components/FormNotice";
import { useQuickStartForm } from "@/page-modules/forms/hooks/useQuickStartForm";
import { QuickStartFormConfig } from "@/page-modules/forms/types/formWorkflow";

interface Props {
  config: QuickStartFormConfig;
}

function QuickStartFormPageInner({ config }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const quickStartForm = useQuickStartForm({ ...config, isEditMode });

  return (
    <div className={`${config.maxWidthClassName} mx-auto animate-in fade-in duration-500`}>
      <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-neutral-500">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Dashboard
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900">Quick Start</span>
      </div>

      <header className="mb-8">
        <h1 className="text-[32px] font-bold text-neutral-900 tracking-tight leading-tight mb-2">{config.title}</h1>
        <p className="text-[16px] text-neutral-500 font-medium">{config.subtitle}</p>
      </header>

      {quickStartForm.isSuccess && (
        <FormNotice
          title="Form Submitted Successfully!"
          message="Your form has been completed and submitted. Redirecting to dashboard..."
          tone="success"
        />
      )}

      {quickStartForm.submitError && (
        <FormNotice
          title="Submission Failed"
          message={quickStartForm.submitError}
          tone="error"
          onClose={quickStartForm.clearSubmitError}
        />
      )}

      {!quickStartForm.isCheckingStatus && quickStartForm.hasSubmittedStatus && !isEditMode && (
        <FormNotice
          title="Form Already Submitted"
          message="This form has already been submitted and cannot be edited."
          tone="info"
        >
          <ReturnToDashboardButton />
        </FormNotice>
      )}

      {isEditMode && quickStartForm.hasSubmittedStatus && quickStartForm.canRenderForm && (
        <FormNotice
          title="Editing Submitted Form"
          message="You are editing a previously submitted form. Your changes will replace the existing submission."
          tone="info"
        />
      )}

      {quickStartForm.canRenderForm && (
        <QuickStartForm
          onSubmit={quickStartForm.handleSubmit}
          isSubmitting={quickStartForm.isSubmitting}
          initialValues={quickStartForm.initialValues}
          storageKey={config.progressStorageKey}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}

export default function QuickStartFormPage({ config }: Props) {
  return (
    <Suspense>
      <QuickStartFormPageInner config={config} />
    </Suspense>
  );
}
