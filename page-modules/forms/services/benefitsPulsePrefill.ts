import { FormValues } from "@/types/form";

const AIRTABLE_TO_BENEFITS_PULSE_FIELDS: Record<string, string> = {
  "Company Name": "company",
  "Health Benefits Enrollment": "healthBenefitsEnrollment",
  "Overall Benefits Satisfaction": "overallBenefitsPackage",
  "Medical Benefits Satisfaction": "medicalPlanOptions",
};

export async function getBenefitsPulseInitialValues(): Promise<FormValues> {
  const response = await fetch("/api/forms/group-data", { credentials: "include" });
  if (!response.ok) return {};

  const data: { fields?: Record<string, unknown> } | null = await response.json();
  if (!data?.fields) return {};

  const values: FormValues = {};
  for (const [airtableField, value] of Object.entries(data.fields)) {
    const formField = AIRTABLE_TO_BENEFITS_PULSE_FIELDS[airtableField];
    if (formField && value !== undefined && value !== null && value !== "") {
      values[formField] = value as string | number;
    }
  }

  return values;
}
