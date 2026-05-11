import { QuickStartFormConfig } from "@/page-modules/forms/types/formWorkflow";

export const QUICK_START_FORM_CONFIG: QuickStartFormConfig = {
  formId: "eBxXtLZdK4us",
  formName: "Quick Start (Current Benefits) Multi-Page",
  progressStorageKey: "form_eBxXtLZdK4us_progress",
  title: "Quick Start",
  subtitle: "Complete your organization profile to unlock better benefits recommendations.",
  maxWidthClassName: "max-w-3xl",
  checkSubmissionStatus: true,
};

export const QUICK_START_ALIAS_FORM_CONFIG: QuickStartFormConfig = {
  ...QUICK_START_FORM_CONFIG,
  title: "Quick Start (Current Benefits)",
  maxWidthClassName: "max-w-4xl py-12 px-4 sm:px-6 lg:px-8",
  checkSubmissionStatus: false,
};
