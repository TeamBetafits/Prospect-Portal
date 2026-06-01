/**
 * Pure utility functions for the Employee Feedback survey form.
 *
 * Extracted here so both the client component and API route share identical
 * validation / normalization logic, and so the logic is unit-testable without
 * a DOM or a Supabase connection.
 */

/**
 * Normalizes a raw score value to an integer in [1, 5] or null.
 * Non-integer numbers, out-of-range values, NaN, and non-numeric strings all
 * return null.
 */
export function normalizeScore(value: unknown): number | null {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 5) {
    return numeric;
  }
  return null;
}

const KNOWN_ENROLLMENT_TYPES: Record<string, string> = {
  employee_only: "employee_only",
  employee_spouse: "employee_spouse",
  employee_children: "employee_children",
  family: "family",
  waived: "waived",
  not_eligible: "not_eligible",
  // Display-label variants from the UI
  "employee only": "employee_only",
  "employee + spouse": "employee_spouse",
  "employee + child(ren)": "employee_children",
  "employee + children": "employee_children",
  family_: "family",
};

/**
 * Normalizes a raw enrollment-type value to a known slug or a safely derived
 * slug, or null for empty/null inputs.
 */
export function normalizeEnrollmentType(value: unknown): string | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const normalizedKey = raw
    .toLowerCase()
    .replace(/\+/g, " + ")
    .replace(/\s+/g, " ")
    .trim();

  if (KNOWN_ENROLLMENT_TYPES[normalizedKey]) {
    return KNOWN_ENROLLMENT_TYPES[normalizedKey];
  }

  // Fall back to a safe slug derived from the raw input
  return normalizedKey
    .replace(/\(ren\)/g, "ren")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** All score field keys that must be present and valid for a submission. */
export const REQUIRED_SCORE_FIELDS = [
  "overallBenefitsPackage",
  "medicalPlanOptions",
  "medicalNetwork",
  "employeeCosts",
  "nonMedicalBenefits",
] as const;

export type RequiredScoreField = (typeof REQUIRED_SCORE_FIELDS)[number];

export interface FeedbackValidationResult {
  valid: boolean;
  missingFields: string[];
}

/**
 * Validates that all required score fields and the enrollment type are present
 * and normalizable.  Returns the list of missing/invalid field names.
 */
export function validateFeedbackPayload(
  values: Record<string, unknown>,
): FeedbackValidationResult {
  const missing: string[] = [];

  if (!normalizeEnrollmentType(values.healthBenefitsEnrollment)) {
    missing.push("healthBenefitsEnrollment");
  }

  for (const field of REQUIRED_SCORE_FIELDS) {
    if (normalizeScore(values[field]) == null) {
      missing.push(field);
    }
  }

  return { valid: missing.length === 0, missingFields: missing };
}
