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
    return {
      ...form,
      displayName: cleanAssignedFormName(form),
      route,
      isLink: route !== "#" && route !== `/forms/${form.id}` && !form.description.startsWith("?id="),
      ctaLabel:
        form.status === FormStatus.NOT_STARTED
          ? "Start Form"
          : isSubmitted
            ? "Edit Form"
            : form.status === FormStatus.IN_PROGRESS
              ? "Update"
              : "Continue",
      isDisabled: form.status === FormStatus.COMPLETED, // Allow editing of SUBMITTED forms
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
