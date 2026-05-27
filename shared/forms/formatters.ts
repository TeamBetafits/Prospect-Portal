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

export function formatEin(value: unknown): string {
  const text = normalizeText(value);
  const digits = text.replace(/\D/g, "");
  if (digits.length === 9) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return text || emptyDisplayValue;
}

export function formatPhone(value: unknown): string {
  const text = normalizeText(value);
  const digits = text.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return text || emptyDisplayValue;
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
  if (field.format === "ein" && !/^\d{2}-?\d{7}$/.test(text)) return "Use a 9-digit EIN, for example 12-3456789.";
  if (field.format === "zip" && !/^\d{5}(-\d{4})?$/.test(text)) return "Use a 5-digit ZIP code or ZIP+4.";
  if ((field.format === "url" || field.type === "url") && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(text)) return "Enter a valid website URL.";
  if ((field.format === "phone" || field.type === "phone") && text.replace(/\D/g, "").length < 10) return "Enter a valid phone number.";
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
