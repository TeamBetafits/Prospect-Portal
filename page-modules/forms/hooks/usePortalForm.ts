"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormValues } from "@/types/form";
import { PortalFormPageConfig, PortalFormState } from "@/page-modules/forms/types/formWorkflow";
import { clearFormProgress, readSavedFormProgress, saveFormProgress } from "@/page-modules/forms/services/formProgressService";
import { submitPortalForm, uploadDocumentForm } from "@/page-modules/forms/services/formSubmissionService";

export function usePortalForm(config: PortalFormPageConfig): PortalFormState {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [initialValues, setInitialValues] = useState<FormValues>({});

  useEffect(() => {
    let isMounted = true;

    async function loadInitialValues() {
      try {
        const savedValues = readSavedFormProgress(config.progressStorageKey);
        if (savedValues) {
          if (isMounted) setInitialValues(savedValues);
          return;
        }

        if (config.loadInitialValues) {
          const loadedValues = await config.loadInitialValues();
          if (isMounted) setInitialValues(loadedValues);
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
    submitError,
  };
}
