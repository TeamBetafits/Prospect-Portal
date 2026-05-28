"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormValues } from "@/types/form";
import { PortalFormPageConfig, PortalFormState } from "@/page-modules/forms/types/formWorkflow";
import { clearFormProgress, readSavedFormProgress, saveFormProgress } from "@/page-modules/forms/services/formProgressService";
import { submitPortalForm, uploadDocumentForm } from "@/page-modules/forms/services/formSubmissionService";
import { useFormPreFill } from "@/page-modules/forms/hooks/useFormPreFill";

export function usePortalForm(config: PortalFormPageConfig): PortalFormState {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [initialValues, setInitialValues] = useState<FormValues>({});
  const hasSetInitialValues = useRef(false);

  const preFill = useFormPreFill({ formId: config.formId });

  // Priority 1 & 2: saved draft progress or custom loadInitialValues
  useEffect(() => {
    let isMounted = true;

    async function loadInitialValues() {
      try {
        const savedValues = readSavedFormProgress(config.progressStorageKey);
        if (savedValues) {
          if (isMounted) {
            setInitialValues(savedValues);
            hasSetInitialValues.current = true;
          }
          return;
        }

        if (config.loadInitialValues) {
          const loadedValues = await config.loadInitialValues();
          if (isMounted) {
            setInitialValues(loadedValues);
            hasSetInitialValues.current = true;
          }
        }
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    }

    loadInitialValues();
    return () => {
      isMounted = false;
    };
  }, [config]);

  // Priority 3: pre-fill from company group-data (only when higher-priority
  // sources are unavailable and the hook has resolved)
  useEffect(() => {
    if (preFill.isLoading) return;
    if (hasSetInitialValues.current) return;
    if (config.loadInitialValues) return;
    if (readSavedFormProgress(config.progressStorageKey)) return;
    if (Object.keys(preFill.values).length === 0) return;

    setInitialValues(preFill.values);
    hasSetInitialValues.current = true;
  }, [preFill.isLoading, preFill.values, config]);

  const handleSave = async (values: FormValues) => {
    saveFormProgress(config.progressStorageKey, values);
  };

  const handleSubmit = async (values: FormValues, mappedPayloads?: Record<string, unknown>) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (config.submitMode === "documentUpload") {
        await uploadDocumentForm(values);
      } else {
        await submitPortalForm(config.formId, config.formName, values, mappedPayloads);
      }

      clearFormProgress(config.progressStorageKey);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/?formSubmitted=true");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "An error occurred while submitting the form. Please try again.");
      setIsSubmitting(false);
    }
  };

  return {
    clearSubmitError: () => setSubmitError(""),
    handleSave,
    handleSubmit,
    initialValues,
    isSubmitting,
    isSuccess,
    readonlyFields: preFill.readonlyFields,
    submitError,
  };
}
