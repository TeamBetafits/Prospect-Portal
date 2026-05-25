export const DOCUMENT_TYPES = [
  "Benefit Guide",
  "Broker Commission Disclosure",
  "Carrier Document",
  "Claims Report",
  "Contract",
  "Dental Plan Summary",
  "Employee Census",
  "ERISA Wrap Document",
  "Invoice",
  "Insurance Invoice",
  "Medical SBC",
  "Other",
  "Payroll Deductions",
  "Plan Summary",
  "Quarterly Payroll Filing",
  "Rates Document",
  "Renewal Document",
  "Section 125 Document",
  "Voided Check",
  "Vision Plan Summary",
  "W9",
  "Workbook",
  "Workers Compensation",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES.map((type) => ({
  value: type,
  label: type,
}));
