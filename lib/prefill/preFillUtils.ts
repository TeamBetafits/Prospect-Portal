import { FormValues } from "@/types/form";

/**
 * Returns true for "empty" values that pre-fill should be allowed to fill.
 *
 * Treated as empty (pre-fill may fill): null, undefined, empty string, empty array
 * Treated as non-empty (pre-fill must NOT replace): 0, false, non-empty string,
 *   non-empty array, any object
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Maps a flat Airtable-style fields object to React form field values
 * using the provided field mapping dictionary.
 *
 * @param fields   Flat object with Airtable-style field names as keys
 * @param mapping  Record<airtableFieldName, formFieldKey>
 * @returns FormValues keyed by form field names; unmapped or empty fields are excluded
 */
export function mapPreFillFields(
  fields: Record<string, unknown>,
  mapping: Record<string, string>
): FormValues {
  const result: FormValues = {};
  for (const [airtableField, formFieldKey] of Object.entries(mapping)) {
    const value = fields[airtableField];
    if (!isEmpty(value)) {
      result[formFieldKey] = value;
    }
  }
  return result;
}

/**
 * Safely merges pre-fill values into the current form state without
 * overwriting user edits or existing non-empty values.
 *
 * Priority order:
 *   1. Dirty (user-edited) field value — never overwritten
 *   2. Existing non-empty current value — not overwritten
 *   3. Pre-fill value — applied only when field is clean and empty
 *   4. Field remains blank if none of the above apply
 *
 * @param currentValues  Current form state
 * @param dirtyFields    Map of field keys that have been edited by the user
 * @param preFillValues  Values to merge in from pre-fill
 * @returns New merged values object
 */
export function safeMerge(
  currentValues: FormValues,
  dirtyFields: Record<string, boolean>,
  preFillValues: FormValues
): FormValues {
  const next: FormValues = { ...currentValues };
  for (const [fieldKey, preFillValue] of Object.entries(preFillValues)) {
    const isDirty = dirtyFields[fieldKey] === true;
    const currentIsEmpty = isEmpty(currentValues[fieldKey]);
    if (!isDirty && currentIsEmpty && !isEmpty(preFillValue)) {
      next[fieldKey] = preFillValue;
    }
  }
  return next;
}
