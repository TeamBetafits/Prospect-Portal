"use client";

import Link from "next/link";
import { AssignedForm, FormStatus } from "@/types";
import { useAssignedForms } from "@/page-modules/dashboard/hooks/useAssignedForms";

interface Props {
  forms: AssignedForm[];
}

function getStatusStyle(status: FormStatus) {
  switch (status) {
    case FormStatus.COMPLETED:
      return "bg-success-bg text-success-500 border-success-500/20";
    case FormStatus.IN_PROGRESS:
      return "bg-info-bg text-info-500 border-info-500/20";
    case FormStatus.SUBMITTED:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-500 border-neutral-200";
  }
}

function getStatusLabel(status: FormStatus) {
  return status === FormStatus.IN_PROGRESS ? "Incomplete" : status;
}

export default function AssignedFormsPanel({ forms }: Props) {
  const assignedForms = useAssignedForms(forms);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-neutral-900 tracking-tight">Assigned Tasks</h2>
        <p className="text-[13px] text-neutral-500 mt-0.5">Items requested by the Betafits team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignedForms.currentForms.map((form) => (
          <div key={form.id} className="bg-white border border-neutral-200 rounded-md p-5 shadow-card flex flex-col justify-between hover:border-neutral-300 transition-colors">
            <div className="mb-4">
              <div className="flex justify-between items-start mb-3 gap-3">
                <h3 className="text-[16px] font-bold text-neutral-900 leading-tight flex-1 break-words min-w-0">{form.displayName}</h3>
                <div className="flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border whitespace-nowrap ${getStatusStyle(form.status)}`}>
                    {getStatusLabel(form.status)}
                  </span>
                </div>
              </div>
              {!form.description.startsWith("http") && (
                <p className="text-[13px] text-neutral-500 leading-relaxed font-normal line-clamp-2">{form.description}</p>
              )}
            </div>

            {form.isLink ? (
              <Link href={form.route} className="block">
                <button className="btn-primary w-full h-9 text-[13px]" disabled={form.isDisabled}>{form.ctaLabel}</button>
              </Link>
            ) : (
              <button className="w-full h-9 bg-neutral-100 text-neutral-400 rounded-sm font-semibold text-[13px] cursor-not-allowed" disabled>Coming Soon</button>
            )}
          </div>
        ))}

        {!assignedForms.hasForms && (
          <div className="col-span-full bg-neutral-50 border border-dashed border-neutral-300 rounded-md p-6 text-center">
            <p className="text-neutral-500 font-medium text-body">No tasks currently assigned.</p>
          </div>
        )}
      </div>

      {assignedForms.hasPagination && (
        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
          <div className="text-label text-neutral-500">
            Showing {assignedForms.startIndex + 1} to {Math.min(assignedForms.endIndex, assignedForms.totalForms)} of {assignedForms.totalForms} forms
          </div>
          <div className="flex items-center gap-1">
            <button onClick={assignedForms.previousPage} disabled={assignedForms.currentPage === 1} className="h-10 px-2 rounded-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Previous forms page">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: assignedForms.totalPages }, (_, index) => index + 1).map((page) => (
              <button key={page} onClick={() => assignedForms.goToPage(page)} className={`h-10 px-3 rounded-sm text-label font-semibold transition-colors ${assignedForms.currentPage === page ? "bg-primary-500 text-white" : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>{page}</button>
            ))}
            <button onClick={assignedForms.nextPage} disabled={assignedForms.currentPage === assignedForms.totalPages} className="h-10 px-2 rounded-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Next forms page">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
