import { FormStatus } from "@/types";
import { FormValues } from "@/types/form";
import { ComponentType } from "react";

export interface PortalFormComponentProps {
  onSave: (values: FormValues) => Promise<void>;
  onSubmit: (values: FormValues, mappedPayloads?: Record<string, unknown>) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: FormValues;
  companyId?: string;
  /** Fields that should be rendered read-only for the prospect (derived from editableBy metadata). */
  readonlyFields?: Record<string, boolean>;
}

export interface PortalFormPageConfig {
  breadcrumbLabel: string;
  formComponent: ComponentType<PortalFormComponentProps>;
  formId: string;
  formName: string;
  progressStorageKey: string;
  subtitle: string;
  title: string;
  loadInitialValues?: () => Promise<FormValues>;
  submitMode?: "form" | "documentUpload";
}

export interface PortalFormState {
  initialValues: FormValues;
  readonlyFields: Record<string, boolean>;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError: string;
  clearSubmitError: () => void;
  handleSave: (values: FormValues) => Promise<void>;
  handleSubmit: (values: FormValues, mappedPayloads?: Record<string, unknown>) => Promise<void>;
}

export interface QuickStartFormConfig {
  formId: string;
  formName: string;
  progressStorageKey: string;
  title: string;
  subtitle: string;
  maxWidthClassName: string;
  checkSubmissionStatus: boolean;
  isEditMode?: boolean;
}

export interface QuickStartFormState {
  formStatus: FormStatus | null;
  initialValues: FormValues;
  readonlyFields: Record<string, boolean>;
  isCheckingStatus: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError: string;
  canRenderForm: boolean;
  hasSubmittedStatus: boolean;
  clearSubmitError: () => void;
  handleSave: (values: FormValues) => Promise<void>;
  handleSubmit: (values: FormValues, mappedPayloads?: Record<string, unknown>) => Promise<void>;
}
