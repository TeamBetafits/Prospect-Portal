"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvailableForm } from "@/types";
import { assignAvailableForm } from "@/page-modules/forms/services/formsService";

export function useAvailableForms(forms: AvailableForm[]) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<AvailableForm | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignForm = async (form: AvailableForm) => {
    setSelectedForm(form);
    setIsAssigning(true);
    setError(null);

    try {
      await assignAvailableForm(form);
      router.refresh();
      window.location.href = "/";
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "An error occurred while assigning the form.");
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    error,
    isAssigning,
    isModalOpen,
    selectedForm,
    visibleForms: forms.slice(0, 5),
    assignForm,
    clearError: () => {
      setError(null);
      setSelectedForm(null);
    },
    closeModal: () => setIsModalOpen(false),
    openModal: () => setIsModalOpen(true),
  };
}
