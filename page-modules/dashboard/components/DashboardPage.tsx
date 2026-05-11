import ProgressSteps from "@/components/ProgressSteps";
import DocumentUpload from "@/components/DocumentUpload";
import AssignedFormsPanel from "@/page-modules/dashboard/components/AssignedFormsPanel";
import AvailableFormsPanel from "@/page-modules/dashboard/components/AvailableFormsPanel";
import DocumentsPanel from "@/page-modules/dashboard/components/DocumentsPanel";
import { DashboardPageData } from "@/page-modules/dashboard/types/dashboard";

interface Props {
  data: DashboardPageData;
}

export default function DashboardPage({ data }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-neutral-900 tracking-tight">Prospect Portal</h1>
        <p className="text-[15px] text-neutral-500 font-medium mt-1">Manage your intake workflow and document submissions with ease.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <AssignedFormsPanel forms={data.assignedForms} />
        </div>
        <div className="lg:col-span-4">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-neutral-900 tracking-tight">Your Documents</h2>
              <p className="text-[13px] text-neutral-500 mt-0.5">Recently uploaded files and artifacts.</p>
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
        <div className="mb-6">
          <h2 className="text-neutral-900 tracking-tight">Progress Steps</h2>
          <p className="text-[13px] text-neutral-500 mt-0.5">Real-time status of your onboarding pipeline.</p>
        </div>
        <ProgressSteps steps={data.progressSteps} />
      </section>

      <section className="w-full">
        <AvailableFormsPanel forms={data.availableForms} />
      </section>
    </div>
  );
}
