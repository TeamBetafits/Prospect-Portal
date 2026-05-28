import ProgressSteps from "@/components/ProgressSteps";
import DocumentUpload from "@/components/DocumentUpload";
import AssignedFormsPanel from "@/page-modules/dashboard/components/AssignedFormsPanel";
import AvailableFormsPanel from "@/page-modules/dashboard/components/AvailableFormsPanel";
import DocumentsPanel from "@/page-modules/dashboard/components/DocumentsPanel";
import { DashboardPageData } from "@/page-modules/dashboard/types/dashboard";
import { AssignedForm, FormStatus, ProgressStatus, ProgressStep } from "@/types";

/**
 * Derives the effective "Current Benefits" progress step status based on the
 * state of the assigned Plan Premiums (Missing Premiums Manual Input) form.
 * This keeps the Current Benefits step synchronized with the premium confirmation
 * task without requiring a separate DB write on every form status change.
 */
function applyPlanPremiumsToProgressSteps(
  steps: ProgressStep[],
  assignedForms: AssignedForm[]
): ProgressStep[] {
  const premiumsForm = assignedForms.find(
    (f) =>
      f.availableFormId === "missing-premiums-manual-input" ||
      f.name.toLowerCase().includes("missing premiums")
  );

  if (!premiumsForm) return steps;

  let effectiveStatus: ProgressStatus;
  if (premiumsForm.status === FormStatus.COMPLETED) {
    effectiveStatus = ProgressStatus.APPROVED;
  } else if (premiumsForm.status === FormStatus.SUBMITTED) {
    effectiveStatus = ProgressStatus.IN_REVIEW;
  } else {
    // NOT_STARTED or IN_PROGRESS — prospect action is required
    effectiveStatus = ProgressStatus.ACTION_NEEDED;
  }

  return steps.map((step) =>
    step.name.toLowerCase().includes("current benefits")
      ? { ...step, status: effectiveStatus }
      : step
  );
}

interface Props {
  data: DashboardPageData;
}

export default function DashboardPage({ data }: Props) {
  const effectiveSteps = applyPlanPremiumsToProgressSteps(data.progressSteps, data.assignedForms);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="w-full">
        <div className="mb-6">
          <h1 className="text-neutral-900 tracking-tight">Dashboard</h1>
        </div>
        <ProgressSteps steps={effectiveSteps} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <AssignedFormsPanel forms={data.assignedForms} />
        </div>
        <div className="lg:col-span-4">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-neutral-900 tracking-tight">Your Documents</h2>
            </div>
            <DocumentUpload
              buttonLabel="Upload Document"
              buttonClassName="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 text-[13px] font-bold text-neutral-900 shadow-card transition-colors hover:bg-neutral-50 active:scale-[0.98]"
            />
          </div>
          <DocumentsPanel documents={data.documents} />
        </div>
      </div>

      <section className="w-full">
        <AvailableFormsPanel forms={data.availableForms} />
      </section>
    </div>
  );
}
