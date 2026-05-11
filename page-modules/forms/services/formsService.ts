import { AvailableForm } from "@/types";

export async function assignAvailableForm(form: AvailableForm) {
  const response = await fetch("/api/forms/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formId: form.id }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to assign form. Please try again.");
  }

  return data;
}
