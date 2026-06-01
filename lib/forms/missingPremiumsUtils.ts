/**
 * Pure utility functions for the Missing Premiums Manual Input form.
 *
 * Extracted here so both the client component and API route share identical
 * validation / sanitization logic, and so the logic is unit-testable without
 * a DOM or a Supabase connection.
 */

export const USER_PREMIUM_FIELDS = new Set<string>([
  "premium_ee_user",
  "premium_es_user",
  "premium_ec_user",
  "premium_ef_user",
]);

/** Returns the _user column name for a given tier key (e.g. "EE" → "premium_ee_user"). */
export function getUserField(tierKey: string): string {
  return `premium_${tierKey.toLowerCase()}_user`;
}

/**
 * Returns true if any non-empty input value is invalid:
 *   – not a number (NaN)
 *   – non-finite (Infinity, -Infinity)
 *   – negative
 */
export function hasPremiumInvalidInput(userInputs: Record<string, string>): boolean {
  return Object.values(userInputs).some((v) => {
    if (v === "") return false;
    const n = Number(v);
    return Number.isNaN(n) || !Number.isFinite(n) || n < 0;
  });
}

/**
 * Builds the updates array to POST to /api/missing-premiums/submit.
 * Skips empty inputs and silently drops invalid values (NaN, non-finite, negative).
 */
export function buildPremiumUpdates(
  rows: Array<{ id: string; tier_key: string }>,
  userInputs: Record<string, string>,
): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  for (const row of rows) {
    const raw = userInputs[row.id];
    if (!raw) continue;
    const num = Number(raw);
    if (Number.isNaN(num) || !Number.isFinite(num) || num < 0) continue;
    out.push({ id: row.id, [getUserField(row.tier_key)]: num });
  }
  return out;
}

/**
 * Sanitizes a single raw update object received from the API request body.
 *
 * Rules:
 *   – `id` must be a non-empty string
 *   – Only fields present in USER_PREMIUM_FIELDS are allowed
 *   – Values must be finite, non-negative numbers
 *   – Returns null if the entry has no valid user-premium fields after filtering
 */
export function sanitizePremiumUpdateEntry(
  raw: Record<string, unknown>,
): Record<string, unknown> | null {
  if (typeof raw.id !== "string" || !raw.id.trim()) return null;

  const out: Record<string, unknown> = { id: raw.id };

  for (const [key, value] of Object.entries(raw)) {
    if (
      USER_PREMIUM_FIELDS.has(key) &&
      typeof value === "number" &&
      !Number.isNaN(value) &&
      Number.isFinite(value) &&
      value >= 0
    ) {
      out[key] = value;
    }
  }

  // Reject entries that carry no usable premium values
  return Object.keys(out).length > 1 ? out : null;
}
