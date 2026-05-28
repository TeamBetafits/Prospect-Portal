"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import QuickStartForm from "@/components/forms/QuickStartForm";
import FormNotice from "@/page-modules/forms/components/FormNotice";
import { useQuickStartForm } from "@/page-modules/forms/hooks/useQuickStartForm";
import { QuickStartFormConfig } from "@/page-modules/forms/types/formWorkflow";

interface Props {
  config: QuickStartFormConfig;
}

function QuickStartFormPageInner({ config }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const quickStartForm = useQuickStartForm({ ...config, isEditMode });

  const isSubmitted = quickStartForm.isSuccess || quickStartForm.hasSubmittedStatus;

  useEffect(() => {
    if (quickStartForm.isSuccess) {
      toast.success("Form submitted successfully");
    }
  }, [quickStartForm.isSuccess]);

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
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[32px] font-bold text-neutral-900 tracking-tight leading-tight">{config.title}</h1>
          {isSubmitted && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 border border-green-200 tracking-wide uppercase">
              Submitted
            </span>
          )}
        </div>
        <p className="text-[16px] text-neutral-500 font-medium">{config.subtitle}</p>
      </header>

      {quickStartForm.submitError && (
        <FormNotice
          title="Submission Failed"
          message={quickStartForm.submitError}
          tone="error"
          onClose={quickStartForm.clearSubmitError}
        />
      )}

      {quickStartForm.canRenderForm && (
        <>
          {isSubmitted && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-700">Submitted</span>
              <span className="text-sm text-green-600">— you can still edit and resubmit below.</span>
            </div>
          )}
          <QuickStartForm
            onSubmit={quickStartForm.handleSubmit}
            isSubmitting={quickStartForm.isSubmitting}
            initialValues={quickStartForm.initialValues}
            storageKey={config.progressStorageKey}
            isEditMode={isEditMode || isSubmitted}
            readonlyFields={quickStartForm.readonlyFields}
          />
        </>
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
