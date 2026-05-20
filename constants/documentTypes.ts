export const DOCUMENT_TYPES = [
  "Benefit Guide",
  "Employee Census",
  "Medical SBC",
  "Dental Plan Summary",
  "Vision Plan Summary",
  "Plan Summary",
  "Invoice",
  "Medical Invoice",
  "Dental Invoice",
  "Vision Invoice",
  "Dental & Vision Invoice",
  "M/D/V Invoice",
  "Payroll Deductions",
  "Renewal Document",
  "Claims Report",
  "Broker Commission Disclosure",
  "ERISA Wrap Document",
  "Section 125 Document",
  "W9",
  "Quarterly Payroll Filing",
  "Voided Check",
  "Workbook",
  "Workers Compensation",
  "Carrier Document",
  "Rates Document",
  "Contract",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES.map((type) => ({
  value: type,
  label: type,
}));

