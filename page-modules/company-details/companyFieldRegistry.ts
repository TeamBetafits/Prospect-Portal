import type { CompanyData } from "@/types";
import type { FieldDefinition } from "@/shared/forms/types";

export type ProspectCompanyDraft = {
  name: string;
  entityType: string;
  legalName: string;
  ein: string;
  sicCode: string;
  naicsCode: string;
  address: string;
  renewalMonth: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  email: string;
};

export const prospectCompanyFields: FieldDefinition<ProspectCompanyDraft>[] = [
  { key: "name", label: "Company Name", type: "text", validation: { required: true }, source: { table: "companies", field: "company_name", source: "schema" } },
  { key: "entityType", label: "Entity Type", type: "text", optionsStatus: "unresolved", source: { table: "entities", field: "entity_type", source: "schema" } },
  { key: "legalName", label: "Legal Name", type: "text", source: { table: "entities", field: "entity_legal_name", source: "schema" } },
  { key: "ein", label: "EIN", type: "text", format: "ein", source: { table: "entities", field: "ein", source: "schema" } },
  { key: "sicCode", label: "SIC Code", type: "text", source: { table: "companies", field: "sic_code", source: "schema" } },
  { key: "naicsCode", label: "NAICS Code", type: "text", source: { table: "companies", field: "naics_code", source: "schema" } },
  { key: "address", label: "Address", type: "textarea", source: { table: "locations", field: "address_street", source: "schema" } },
  { key: "renewalMonth", label: "Renewal Month", type: "number", format: "number", source: { table: "policy_or_admin_configurations", field: "renewal_month", source: "schema" } },
  { key: "firstName", label: "First Name", type: "text", source: { table: "contacts", field: "first_name", source: "schema" } },
  { key: "lastName", label: "Last Name", type: "text", source: { table: "contacts", field: "last_name", source: "schema" } },
  { key: "jobTitle", label: "Job Title", type: "text", source: { table: "contacts", field: "title", source: "schema" } },
  { key: "phone", label: "Phone Number", type: "phone", format: "phone", source: { table: "contacts", field: "phone", source: "schema" } },
  { key: "email", label: "Work Email", type: "email", source: { table: "contacts", field: "email", source: "schema" } },
];

export const companyDataToDraft = (data: CompanyData): ProspectCompanyDraft => ({
  name: data.name || "",
  entityType: data.entityType || "",
  legalName: data.legalName || "",
  ein: data.ein || "",
  sicCode: data.sicCode || "",
  naicsCode: data.naicsCode || "",
  address: data.address || "",
  renewalMonth: data.renewalMonth || "",
  firstName: data.contact.firstName || "",
  lastName: data.contact.lastName || "",
  jobTitle: data.contact.jobTitle || "",
  phone: data.contact.phone || "",
  email: data.contact.email || "",
});

export const draftToCompanyData = (current: CompanyData, draft: ProspectCompanyDraft): CompanyData => ({
  ...current,
  name: draft.name,
  entityType: draft.entityType,
  legalName: draft.legalName,
  ein: draft.ein,
  sicCode: draft.sicCode,
  naicsCode: draft.naicsCode,
  address: draft.address,
  renewalMonth: draft.renewalMonth,
  contact: {
    ...current.contact,
    firstName: draft.firstName,
    lastName: draft.lastName,
    jobTitle: draft.jobTitle,
    phone: draft.phone,
    email: draft.email,
  },
});
