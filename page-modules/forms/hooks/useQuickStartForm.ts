"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormStatus } from "@/types";
import { FormValues } from "@/types/form";
import { normalizeYearToDate } from "@/lib/mappings/quickStartMapping";
import { clearFormProgress, saveFormProgress } from "@/page-modules/forms/services/formProgressService";
import { getAssignedFormStatus, getLastSubmissionAnswers, getQuickStartInitialValues } from "@/page-modules/forms/services/formStatusService";
import { mapQuickStartGroupDataToFormValues } from "@/page-modules/forms/services/quickStartPrefill";
import { submitPortalForm, uploadQuickStartFiles } from "@/page-modules/forms/services/formSubmissionService";
import { QuickStartFormConfig, QuickStartFormState } from "@/page-modules/forms/types/formWorkflow";

export function useQuickStartForm(config: QuickStartFormConfig): QuickStartFormState {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(config.checkSubmissionStatus);
  const [initialValues, setInitialValues] = useState<FormValues>({});

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!config.checkSubmissionStatus) return;

      try {
        const status = await getAssignedFormStatus(config.formId);
        if (isMounted) setFormStatus(status);
      } catch (error) {
        console.error("Error checking form status:", error);
      } finally {
        if (isMounted) setIsCheckingStatus(false);
      }
    }

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [config.checkSubmissionStatus, config.formId]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialValues() {
      // Prefer last submission answers (exact form keys) over group-data mapping
      try {
        const submissionAnswers = await getLastSubmissionAnswers(config.formId);
        if (submissionAnswers && Object.keys(submissionAnswers).length > 0) {
          if (isMounted) setInitialValues(submissionAnswers as FormValues);
          return;
        }
      } catch (error) {
        console.error("Error loading last submission answers:", error);
      }

      // Fall back to group-data prefill for first-time visitors
      try {
        const values = await getQuickStartInitialValues(config.progressStorageKey, mapQuickStartGroupDataToFormValues);
        if (isMounted) setInitialValues(values);
      } catch {}
    }

    loadInitialValues();
    return () => {
      isMounted = false;
    };
  }, [config.progressStorageKey, config.formId]);

  // Redirect to dashboard after successful submission
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500); // Wait 1.5s for toast to be visible before redirecting
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const handleSave = async (values: FormValues) => {
    saveFormProgress(config.progressStorageKey, values);
  };

  const handleSubmit = async (values: FormValues, mappedPayloads?: Record<string, unknown>) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const processedValues = await uploadQuickStartFiles(values);
      const sanitizedValues = {
        ...processedValues,
        yearCompanyFounded: normalizeYearToDate(processedValues.yearCompanyFounded) ?? "",
      };
      await submitPortalForm(config.formId, config.formName, sanitizedValues, mappedPayloads);
      clearFormProgress(config.progressStorageKey);
      setIsSuccess(true);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "An error occurred while submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSubmittedStatus = formStatus === FormStatus.SUBMITTED || formStatus === FormStatus.COMPLETED;

  return {
    canRenderForm: !isCheckingStatus,
    clearSubmitError: () => setSubmitError(""),
    formStatus,
    handleSave,
    handleSubmit,
    hasSubmittedStatus,
    initialValues,
    isCheckingStatus,
    isSubmitting,
    isSuccess,
    submitError,
  };
}
