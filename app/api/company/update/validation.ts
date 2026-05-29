import { normalizeFieldValue, validateFieldValue } from "@/shared/forms/formatters";
import { prospectCompanyFields } from "@/page-modules/company-details/companyFieldRegistry";

const TOP_LEVEL_KEYS = new Set([
  "name",
  "entityType",
  "legalName",
  "ein",
  "sicCode",
  "naicsCode",
  "address",
  "renewalMonth",
  "contact",
]);

const CONTACT_KEYS = new Set(["firstName", "lastName", "jobTitle", "phone", "email"]);

export function validatePayload(body: Record<string, unknown>) {
  const details: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};

  for (const key of Object.keys(body)) {
    if (!TOP_LEVEL_KEYS.has(key)) details[key] = "This field is not writable from the company details form.";
  }

  const contact = body.contact && typeof body.contact === "object" && !Array.isArray(body.contact)
    ? body.contact as Record<string, unknown>
    : {};

  if (body.contact !== undefined && (typeof body.contact !== "object" || Array.isArray(body.contact))) {
    details.contact = "Contact must be an object.";
  }

  for (const key of Object.keys(contact)) {
    if (!CONTACT_KEYS.has(key)) details[`contact.${key}`] = "This contact field is not writable from the company details form.";
  }

  for (const field of prospectCompanyFields) {
    const value = CONTACT_KEYS.has(field.key) ? contact[field.key] : body[field.key];
    if (value === undefined) continue;
    const message = validateFieldValue(field, value);
    if (message) details[field.key] = message;
  }

  for (const key of Array.from(TOP_LEVEL_KEYS)) {
    if (key !== "contact" && body[key] !== undefined) {
      const field = prospectCompanyFields.find((entry) => entry.key === key);
      sanitized[key] = field ? normalizeFieldValue(field, body[key]) : body[key];
    }
  }
  sanitized.contact = Object.fromEntries(
    Object.entries(contact)
      .filter(([key]) => CONTACT_KEYS.has(key))
      .map(([key, value]) => {
        const field = prospectCompanyFields.find((entry) => entry.key === key);
        return [key, field ? normalizeFieldValue(field, value) : value];
      })
  );

  return { details, sanitized };
}
