import { FormValues } from "@/types/form";

const AIRTABLE_TO_QUICK_START: Record<string, string> = {
  "First Name": "qYvbJrrJqLQjqQnVip6c3N",
  "Last Name": "3khn37NbHQYb7CN6NPgrx2",
  "Job Title": "2d65uNNeKNqSmZT1k2WVRq",
  "Phone Number": "jZa7ip7oU533vM2qLWCkZj",
  "Work Email": "ckkAfnKZoQag2Kqf7j71Cq",
  "Company Name": "2UCyRd53bWrtdKXAK1XMy6",
  "Street Address": "ayXo",
  "City": "fT94",
  "State / Province": "hmTa",
  "ZIP Code": "wLev",
  "Year Company Founded": "r1TkXLw3QBZBCkoRHidEPs",
  "EIN": "uTuDTocoypgCbQCkcHWUXN",
  "Preferred SIC Code": "hf2rRXr8RmGS1o5PFoFJJn",
  "Preferred NAICS Code": "xfBVQncwKZoTzx4FDeHDLR",
  "Benefit-Eligible US Employees Range": "jMkzWAv3b9K5VCyGHPsZmw",
  "Estimated Medical Enrolled EEs": "87fD37dczxpgzodHMWgvWT",
  "Estimated Benefit Eligible EEs": "onbhhvHYbup9VUBE6eAAaz",
  "Expected Headcount Growth (next 12 months)": "xcqpaj6Sfv98YJFAUiCZ4z",
  "NDA Required": "opsQwCsEVnschNufM581ph",
  "Additional Notes": "6eWgGjt7iTjtYcnZRfnCjm",
};

export function mapQuickStartGroupDataToFormValues(fields: Record<string, unknown>): FormValues {
  const values: FormValues = {};

  for (const [airtableField, value] of Object.entries(fields)) {
    const questionId = AIRTABLE_TO_QUICK_START[airtableField];
    if (questionId && value !== undefined && value !== null && value !== "") {
      values[questionId] = value as string | number;
    }
  }

  return values;
}
