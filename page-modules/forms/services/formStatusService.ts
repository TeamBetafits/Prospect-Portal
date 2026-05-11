import { FormStatus } from "@/types";

export async function getAssignedFormStatus(formId: string): Promise<FormStatus | null> {
  const response = await fetch("/api/forms/assigned");
  if (!response.ok) return null;

  const forms = await response.json();
  const thisForm = forms.find((form: any) => form.id === formId || form.description?.includes(formId));

  return thisForm?.status || null;
}

export async function getQuickStartInitialValues(storageKey: string, mapper: (fields: Record<string, unknown>) => Record<string, unknown>) {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Object.keys(parsed).length > 0) return parsed;
    } catch (error) {
      console.error("Error loading saved progress:", error);
    }
  }

  const response = await fetch("/api/forms/group-data", { credentials: "include" });
  if (!response.ok) return {};

  const data: { fields?: Record<string, unknown> } | null = await response.json();
  return data?.fields ? mapper(data.fields) : {};
}
