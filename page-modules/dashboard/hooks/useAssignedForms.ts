"use client";

import { useState } from "react";
import { AssignedForm, FormStatus } from "@/types";
import { cleanAssignedFormName, getAssignedFormRoute } from "@/page-modules/forms/services/formRoutes";

const FORMS_PER_PAGE = 5;

export function useAssignedForms(forms: AssignedForm[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(forms.length / FORMS_PER_PAGE);
  const startIndex = (currentPage - 1) * FORMS_PER_PAGE;
  const endIndex = startIndex + FORMS_PER_PAGE;

  const currentForms = forms.slice(startIndex, endIndex).map((form) => {
    const route = getAssignedFormRoute(form);
    const isSubmitted = form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED;
    const editRoute = isSubmitted && route && route !== "#" ? `${route}?edit=true` : route;
    const isPremiumsForm =
      form.availableFormId === "missing-premiums-manual-input" ||
      form.name.toLowerCase().includes("missing premiums") ||
      form.name.toLowerCase().includes("confirm plan premiums");

    let ctaLabel: string;
    if (isPremiumsForm) {
      ctaLabel = form.status === FormStatus.NOT_STARTED
        ? "Start"
        : isSubmitted
          ? "Edit Response"
          : "Complete Task";
    } else {
      ctaLabel = form.status === FormStatus.NOT_STARTED
        ? "Start Form"
        : isSubmitted
          ? "Edit Form"
          : form.status === FormStatus.IN_PROGRESS
            ? "Update"
            : "Continue";
    }

    const description = isPremiumsForm
      ? "Confirm or provide premium amounts for your current benefit plans."
      : form.description;

    return {
      ...form,
      description,
      displayName: cleanAssignedFormName(form),
      route: editRoute,
      isLink: route !== "#" && route !== `/forms/${form.id}` && !form.description.startsWith("?id="),
      ctaLabel,
      isDisabled: form.status === FormStatus.COMPLETED,
    };
  });

  return {
    currentForms,
    currentPage,
    endIndex,
    formsPerPage: FORMS_PER_PAGE,
    hasForms: forms.length > 0,
    hasPagination: forms.length > FORMS_PER_PAGE,
    startIndex,
    totalForms: forms.length,
    totalPages,
    goToPage: setCurrentPage,
    nextPage: () => setCurrentPage((page) => Math.min(page + 1, totalPages)),
    previousPage: () => setCurrentPage((page) => Math.max(page - 1, 1)),
  };
}
