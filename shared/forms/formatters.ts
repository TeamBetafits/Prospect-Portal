import type { FieldDefinition, FieldOption } from "./types";

export const emptyDisplayValue = "-";

export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function formatArray(value: unknown): string {
  if (!Array.isArray(value)) return normalizeText(value) || emptyDisplayValue;
  const text = value.map(normalizeText).filter(Boolean).join(", ");
  return text || emptyDisplayValue;
}

export function formatBoolean(value: unknown): string {
  if (value === true || String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes") return "Yes";
  if (value === false || String(value).toLowerCase() === "false" || String(value).toLowerCase() === "no") return "No";
  return emptyDisplayValue;
}

export function formatDate(value: unknown): string {
  const text = normalizeText(value);
  if (!text) return emptyDisplayValue;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("en-US");
}

export function normalizeDateInput(value: unknown): string {
  const text = normalizeText(value);
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toISOString().split("T")[0];
}

export function formatNumber(value: unknown): string {
  if (value === null || value === undefined || value === "") return emptyDisplayValue;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return normalizeText(value) || emptyDisplayValue;
  return parsed.toLocaleString("en-US");
}

export function normalizeUrl(value: unknown): string {
  const text = normalizeText(value);
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

export function normalizeEin(value: unknown): string {
  const text = normalizeText(value);
  const digits = text.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 9 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : text;
}

export function normalizePhone(value: unknown): string {
  const text = normalizeText(value);
  const digits = text.replace(/\D/g, "");
  if (!digits) return "";
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length === 10) return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  return text;
}

export function normalizeZip(value: unknown): string {
  const text = normalizeText(value);
  const digits = text.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 5) return digits;
  if (digits.length === 9) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return text;
}

export function normalizeEmail(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

export function normalizeNumericCode(value: unknown): string {
  return normalizeText(value).replace(/\s+/g, "");
}

export function normalizeRenewalMonth(value: unknown): string {
  const text = normalizeText(value);
  if (!text) return "";
  const parsed = Number(text);
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 12) return String(parsed);
  return text;
}

export function formatEin(value: unknown): string {
  return normalizeEin(value) || emptyDisplayValue;
}

export function formatPhone(value: unknown): string {
  return normalizePhone(value) || emptyDisplayValue;
}

export function normalizeFieldValue(field: Pick<FieldDefinition, "format" | "type">, value: unknown): unknown {
  if (value === null || value === undefined) return "";
  if (field.type === "checkbox" || field.format === "boolean") return value;
  if (field.type === "multiSelect" || field.format === "array") return value;
  if (field.format === "ein") return normalizeEin(value);
  if (field.format === "phone" || field.type === "phone") return normalizePhone(value);
  if (field.format === "zip") return normalizeZip(value);
  if (field.type === "email" || field.format === "email") return normalizeEmail(value);
  if (field.format === "url" || field.type === "url") return normalizeUrl(value);
  if (field.format === "sic" || field.format === "naics") return normalizeNumericCode(value);
  if (field.format === "renewalMonth") return normalizeRenewalMonth(value);
  return normalizeText(value);
}

export function normalizeDraft<TRecord extends Record<string, unknown>>(
  fields: Array<Pick<FieldDefinition<TRecord>, "key" | "format" | "type">>,
  draft: Partial<TRecord>,
): Partial<TRecord> {
  return Object.fromEntries(
    Object.entries(draft).map(([key, value]) => {
      const field = fields.find((entry) => entry.key === key);
      return [key, field ? normalizeFieldValue(field, value) : normalizeText(value)];
    }),
  ) as Partial<TRecord>;
}

export function normalizePatch<TRecord extends Record<string, unknown>>(
  fields: Array<Pick<FieldDefinition<TRecord>, "key" | "format" | "type">>,
  patch: Partial<TRecord>,
): Partial<TRecord> {
  return normalizeDraft(fields, patch);
}

export function formatFieldValue(field: Pick<FieldDefinition, "format" | "type" | "options">, value: unknown): string {
  if (field.type === "checkbox" || field.format === "boolean") return formatBoolean(value);
  if (field.type === "multiSelect" || field.format === "array") return formatArray(value);
  if (field.format === "date" || field.type === "date") return formatDate(value);
  if (field.format === "number" || field.type === "number") return formatNumber(value);
  if (field.format === "ein") return formatEin(value);
  if (field.format === "phone" || field.type === "phone") return formatPhone(value);
  if (field.options?.length) {
    if (Array.isArray(value)) {
      return value
        .map((entry) => field.options?.find((option) => option.value === entry)?.label || normalizeText(entry))
        .filter(Boolean)
        .join(", ") || emptyDisplayValue;
    }
    return field.options.find((option) => option.value === value)?.label || normalizeText(value) || emptyDisplayValue;
  }
  return normalizeText(value) || emptyDisplayValue;
}

export function parseOptions(optionsText?: string | null, optionsJson?: string | null): FieldOption[] | undefined {
  const jsonText = normalizeText(optionsJson);
  if (jsonText && !jsonText.toLowerCase().includes("to be decided")) {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (Array.isArray(parsed)) {
        const options = parsed
          .map((entry) => {
            if (typeof entry === "string") return { label: entry, value: entry };
            if (entry && typeof entry === "object") {
              const record = entry as Record<string, unknown>;
              const label = normalizeText(record.label ?? record.name ?? record.value);
              const value = normalizeText(record.value ?? record.label ?? record.name);
              if (label && value) return { label, value };
            }
            return null;
          })
          .filter((entry): entry is FieldOption => Boolean(entry));
        if (options.length) return options;
      }
    } catch {}
  }

  const text = normalizeText(optionsText);
  if (!text || text.toLowerCase().includes("to be decided")) return undefined;
  const options = text
    .split(/[,;\n]/)
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .map((entry) => ({ label: entry, value: entry }));
  return options.length ? options : undefined;
}

export function validateFieldValue(field: FieldDefinition<any>, value: unknown): string | null {
  const text = normalizeText(value);
  if (field.validation?.required && !text && value !== true) return field.validation.message || `${field.label} is required.`;
  if (!text) return null;
  if (field.format === "ein" && !/^\d{9}$/.test(text.replace(/\D/g, ""))) return "Use a 9-digit EIN, for example 12-3456789.";
  if (field.format === "zip" && !/^\d{5}(-\d{4})?$/.test(normalizeZip(text))) return "Use a 5-digit ZIP code or ZIP+4.";
  if ((field.format === "url" || field.type === "url") && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(text)) return "Enter a valid website URL.";
  if (field.format === "sic" && !/^\d{4}$/.test(normalizeNumericCode(text))) return "Use a 4-digit SIC code.";
  if (field.format === "naics" && !/^\d{2,6}$/.test(normalizeNumericCode(text))) return "Use a 2- to 6-digit NAICS code.";
  if (field.format === "renewalMonth" && !/^(?:[1-9]|1[0-2])$/.test(normalizeRenewalMonth(text))) return "Use a renewal month from 1 to 12.";
  if ((field.format === "phone" || field.type === "phone") && !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(normalizePhone(text))) return "Enter a valid 10-digit US phone number.";
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Enter a valid email address.";
  if ((field.type === "number" || field.format === "number") && !Number.isFinite(Number(text))) return "Enter a valid number.";
  if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(text)) {
    return field.validation.message || `${field.label} has an invalid format.`;
  }
  return null;
}

export function getChangedFields<TRecord extends Record<string, unknown>>(
  current: Partial<TRecord>,
  next: Partial<TRecord>,
): Partial<TRecord> {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => JSON.stringify(current[key as keyof TRecord] ?? "") !== JSON.stringify(value ?? "")),
  ) as Partial<TRecord>;
}
