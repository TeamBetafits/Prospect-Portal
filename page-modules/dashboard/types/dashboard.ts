import { AssignedForm, AvailableForm, DocumentArtifact, ProgressStep } from "@/types";

export interface DashboardPageData {
  assignedForms: AssignedForm[];
  availableForms: AvailableForm[];
  documents: DocumentArtifact[];
  progressSteps: ProgressStep[];
}
