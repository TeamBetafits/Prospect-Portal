"use client";

import { AvailableForm } from "@/types";
import { useAvailableForms } from "@/page-modules/dashboard/hooks/useAvailableForms";

interface Props {
  forms: AvailableForm[];
}

function FormCard({
  form,
  isAssigning,
  onAssign,
}: {
  form: AvailableForm;
  isAssigning: boolean;
  onAssign: (form: AvailableForm) => void;
}) {
  return (
    <div className="group bg-white border border-neutral-200 rounded-md p-5 hover:border-neutral-300 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10 shadow-card">
      <div className="flex-shrink-0 md:w-1/4">
        <h3 className="text-[15px] font-bold text-neutral-900 group-hover:text-primary-600 transition-colors tracking-tight">{form.name}</h3>
      </div>
      <div className="flex-1">
        <p className="text-[13px] text-neutral-500 font-normal leading-relaxed">{form.description}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <button onClick={() => onAssign(form)} disabled={isAssigning} className="btn-secondary h-9 px-5 text-[11px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
          {isAssigning ? "Assigning..." : "Assign"}
        </button>
      </div>
    </div>
  );
}

export default function AvailableFormsPanel({ forms }: Props) {
  const availableForms = useAvailableForms(forms);

  return (
    <>
      <section>
        <div className="mb-6">
          <h2 className="text-neutral-900 tracking-tight">Additional Requests</h2>
          <p className="text-[13px] text-neutral-500 mt-0.5">Optional items that may be useful for your current review.</p>
        </div>

        {availableForms.error && (
          <div className="mb-4 p-4 bg-error-bg border border-error-500/20 rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Assignment Failed</h3>
              <p className="text-sm text-neutral-700">{availableForms.error}</p>
            </div>
            <button onClick={availableForms.clearError} className="flex-shrink-0 text-neutral-400 hover:text-neutral-600" aria-label="Dismiss assignment error">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {forms.length === 0 ? (
          <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-md p-12 text-center">
            <p className="text-neutral-500 font-medium">No available forms at this time.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {availableForms.visibleForms.map((form) => (
              <FormCard key={form.id} form={form} onAssign={availableForms.assignForm} isAssigning={availableForms.isAssigning && availableForms.selectedForm?.id === form.id} />
            ))}
          </div>
        )}

        {forms.length > 5 && (
          <div className="mt-8 flex justify-center">
            <button onClick={availableForms.openModal} className="btn-secondary px-8 h-10 text-[11px] uppercase tracking-widest">View more</button>
          </div>
        )}
      </section>

      {availableForms.isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/10 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-md shadow-modal w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
              <div>
                <h2 className="text-neutral-900 tracking-tight">Additional Requests</h2>
              </div>
              <button onClick={availableForms.closeModal} className="p-2 hover:bg-neutral-100 rounded-md text-neutral-400 transition-colors" aria-label="Close available forms">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex flex-col gap-3 bg-neutral-50/30">
              {forms.map((form) => (
                <FormCard key={form.id} form={form} onAssign={availableForms.assignForm} isAssigning={availableForms.isAssigning && availableForms.selectedForm?.id === form.id} />
              ))}
            </div>
            <div className="p-6 border-t border-neutral-100 flex justify-end">
            </div>
          </div>
        </div>
      )}
    </>
  );
}
