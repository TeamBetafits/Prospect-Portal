export const DOCUMENT_TYPES = [
  "Benefit Guide",
  "SBC / Plan Summary",
  "Employee Census",
  "Invoice",
  "Renewal Document",
  "Claims Report",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES.map((type) => ({
  value: type,
  label: type,
}));
