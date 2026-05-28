"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormStatus } from "@/types";
import { FormValues } from "@/types/form";
import { normalizeYearToDate } from "@/lib/mappings/quickStartMapping";
import { clearFormProgress, readSavedFormProgress, saveFormProgress } from "@/page-modules/forms/services/formProgressService";
import { getAssignedFormStatus, getLastSubmissionAnswers } from "@/page-modules/forms/services/formStatusService";
import { submitPortalForm, uploadQuickStartFiles } from "@/page-modules/forms/services/formSubmissionService";
import { QuickStartFormConfig, QuickStartFormState } from "@/page-modules/forms/types/formWorkflow";
import { useFormPreFill } from "@/page-modules/forms/hooks/useFormPreFill";

export function useQuickStartForm(config: QuickStartFormConfig): QuickStartFormState {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(config.checkSubmissionStatus);
  const [initialValues, setInitialValues] = useState<FormValues>({});
  const hasSetInitialValues = useRef(false);

  const preFill = useFormPreFill({ formId: config.formId });

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
      // Priority 1: last submission answers (exact form field keys, for edit mode)
      try {
        const submissionAnswers = await getLastSubmissionAnswers(config.formId);
        if (submissionAnswers && Object.keys(submissionAnswers).length > 0) {
          if (isMounted) {
            setInitialValues(submissionAnswers as FormValues);
            hasSetInitialValues.current = true;
          }
          return;
        }
      } catch (error) {
        console.error("Error loading last submission answers:", error);
      }

      // Priority 2: saved local draft progress
      try {
        const savedValues = readSavedFormProgress(config.progressStorageKey);
        if (savedValues && Object.keys(savedValues).length > 0) {
          if (isMounted) {
            setInitialValues(savedValues);
            hasSetInitialValues.current = true;
          }
          return;
        }
      } catch {
        // localStorage unavailable; fall through to pre-fill
      }

      // Priority 3: company group-data pre-fill — handled by the separate effect below
    }

    loadInitialValues();
    return () => {
      isMounted = false;
    };
  }, [config.progressStorageKey, config.formId]);

  // Priority 3: apply pre-fill once the hook resolves (only when higher-priority
  // sources did not provide values)
  useEffect(() => {
    if (preFill.isLoading) return;
    if (hasSetInitialValues.current) return;
    if (Object.keys(preFill.values).length === 0) return;

    setInitialValues(preFill.values);
    hasSetInitialValues.current = true;
  }, [preFill.isLoading, preFill.values]);

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
    readonlyFields: preFill.readonlyFields,
    submitError,
  };
}
