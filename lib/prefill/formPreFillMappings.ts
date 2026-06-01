/**
 * Centralized per-form pre-fill mapping registry.
 *
 * Each entry describes a single field mapping with its source (Airtable-style
 * flat field name), target (React form field key), and the party allowed to
 * edit it in the prospect portal.
 *
 * editableBy: "Betafits" → managed by the Betafits team; rendered read-only
 *                           for the prospect portal user.
 * editableBy: "Client"   → editable by the prospect portal user.
 *
 * Key: formId (the ID string used in PORTAL_FORM_CONFIGS / QuickStartFormConfig)
 *
 * Forms not listed here gracefully receive no pre-fill (hook returns {}).
 * Forms with a custom loadInitialValues (e.g. Appoint Betafits) are intentionally
 * excluded — their custom loader takes priority and the hook is never used.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type FieldMappingEntry = {
  /** Airtable-style flat field name (key in /api/forms/group-data → data.fields) */
  sourceField: string;
  /** React form field key used by the form component */
  targetField: string;
  /**
   * Which party may edit this field in the prospect portal.
   * "Betafits" → Betafits-managed; read-only for the prospect.
   * "Client"   → editable by the prospect portal user.
   */
  editableBy: "Betafits" | "Client";
};

export type CompiledFormMapping = {
  /** sourceField → targetField, used by mapPreFillFields */
  fieldMap: Record<string, string>;
  /** targetField → true when the field is read-only for the prospect */
  readonlyFields: Record<string, boolean>;
};

function compile(entries: FieldMappingEntry[]): CompiledFormMapping {
  const fieldMap: Record<string, string> = {};
  const readonlyFields: Record<string, boolean> = {};
  for (const { sourceField, targetField, editableBy } of entries) {
    fieldMap[sourceField] = targetField;
    if (editableBy === "Betafits") {
      readonlyFields[targetField] = true;
    }
  }
  return { fieldMap, readonlyFields };
}

// ─── Field entry arrays ───────────────────────────────────────────────────────

/**
 * Quick Start (current React multi-step form) — initial onboarding intake;
 * all fields editable by the client so they can confirm or correct pre-filled
 * values.
 */
const QUICK_START_FILLOUT_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "First Name",                     targetField: "firstName", editableBy: "Client" },
  { sourceField: "Last Name",                      targetField: "lastName", editableBy: "Client" },
  { sourceField: "Job Title",                      targetField: "title", editableBy: "Client" },
  { sourceField: "Phone Number",                   targetField: "phone", editableBy: "Client" },
  { sourceField: "Work Email",                     targetField: "email", editableBy: "Client" },
  { sourceField: "Company Name",                   targetField: "companyName", editableBy: "Client" },
  { sourceField: "Street Address",                 targetField: "address", editableBy: "Client" },
  { sourceField: "City",                           targetField: "city", editableBy: "Client" },
  { sourceField: "State / Province",               targetField: "stateProvince", editableBy: "Client" },
  { sourceField: "ZIP Code",                       targetField: "zipCode", editableBy: "Client" },
  { sourceField: "Year Company Founded",           targetField: "yearCompanyFounded", editableBy: "Client" },
  { sourceField: "EIN",                            targetField: "ein", editableBy: "Client" },
  { sourceField: "Preferred SIC Code",             targetField: "preferredSicCode", editableBy: "Client" },
  { sourceField: "Preferred NAICS Code",           targetField: "preferredNaicsCode", editableBy: "Client" },
  { sourceField: "Benefit-Eligible US Employees Range", targetField: "benefitEligibleEmployees", editableBy: "Client" },
  { sourceField: "Estimated Medical Enrolled EEs", targetField: "estimatedMedicalEnrolledEes", editableBy: "Client" },
  { sourceField: "Estimated Benefit Eligible EEs", targetField: "estimatedBenefitEligibleEes", editableBy: "Client" },
  { sourceField: "Expected Headcount Growth (next 12 months)", targetField: "expectedHeadcountGrowth", editableBy: "Client" },
  { sourceField: "NDA Required", targetField: "ndaRequested", editableBy: "Client" },
];

/**
 * Benefits Pulse Survey — company name provides survey context; read-only
 * because it is the canonical name managed by the Betafits team.
 */
const BENEFITS_PULSE_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "Company Name", targetField: "company", editableBy: "Betafits" },
];

/**
 * NDA — all pre-filled fields are legal entity details verified and managed
 * by the Betafits team; prospects may not change them.
 */
const NDA_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "Company Name",     targetField: "companyLegalName",              editableBy: "Betafits" },
  { sourceField: "Entity Legal Name", targetField: "legalNameOfEntity",            editableBy: "Betafits" },
  { sourceField: "EIN",              targetField: "employerIdentificationNumber",  editableBy: "Betafits" },
  { sourceField: "Entity Type",      targetField: "entityTypeDetailed",            editableBy: "Betafits" },
  { sourceField: "State / Province", targetField: "entityStateFormationDetailed",  editableBy: "Betafits" },
];

/**
 * Standard contact-info forms (Basic Intake, Comprehensive Intake, Quick Start
 * New Benefits, Quick Start Alt).
 * Company name is Betafits-managed; contact details are editable by the client.
 */
const STANDARD_FORM_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "Company Name",  targetField: "companyName", editableBy: "Betafits" },
  { sourceField: "First Name",    targetField: "firstName",   editableBy: "Client" },
  { sourceField: "Work Email",    targetField: "email",       editableBy: "Client" },
  { sourceField: "Phone Number",  targetField: "phone",       editableBy: "Client" },
  { sourceField: "Job Title",     targetField: "title",       editableBy: "Client" },
];

/**
 * Update Quickstart — extends the standard mapping with address fields
 * (editable) and EIN (Betafits-managed, read-only).
 */
const UPDATE_QUICKSTART_ENTRIES: FieldMappingEntry[] = [
  ...STANDARD_FORM_ENTRIES,
  { sourceField: "Street Address",   targetField: "streetAddress", editableBy: "Client" },
  { sourceField: "City",             targetField: "city",          editableBy: "Client" },
  { sourceField: "State / Province", targetField: "state",         editableBy: "Client" },
  { sourceField: "ZIP Code",         targetField: "zipCode",       editableBy: "Client" },
  { sourceField: "EIN",              targetField: "ein",           editableBy: "Betafits" },
];

/**
 * Update PEO/HR — contact info editable, company name Betafits-managed;
 * currentPEO editable because the prospect may have changed their PEO.
 */
const UPDATE_PEO_HR_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "Company Name",  targetField: "companyName", editableBy: "Betafits" },
  { sourceField: "First Name",    targetField: "firstName",   editableBy: "Client" },
  { sourceField: "Last Name",     targetField: "lastName",    editableBy: "Client" },
  { sourceField: "Job Title",     targetField: "title",       editableBy: "Client" },
  { sourceField: "Phone Number",  targetField: "phone",       editableBy: "Client" },
  { sourceField: "Work Email",    targetField: "email",       editableBy: "Client" },
  { sourceField: "Current PEO",   targetField: "currentPEO",  editableBy: "Client" },
];

/**
 * Broker Role — contact info for the prospect; editable so they can
 * confirm or correct what we have on file.
 */
const BROKER_ROLE_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "First Name",    targetField: "firstName",   editableBy: "Client" },
  { sourceField: "Last Name",     targetField: "lastName",    editableBy: "Client" },
  { sourceField: "Phone Number",  targetField: "phone",       editableBy: "Client" },
  { sourceField: "Work Email",    targetField: "email",       editableBy: "Client" },
];

/**
 * HR Tech — pre-fill the current HR system field from the stored HR
 * software value; editable because it may have changed.
 */
const HR_TECH_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "HR Software Used", targetField: "currentHRSystem", editableBy: "Client" },
];

/**
 * PEO/EOR Assessment — pre-fill current PEO; editable because the
 * prospect may be in the process of switching.
 */
const PEO_EOR_ASSESSMENT_ENTRIES: FieldMappingEntry[] = [
  { sourceField: "Current PEO", targetField: "currentPEO", editableBy: "Client" },
];

// ─── Registry ────────────────────────────────────────────────────────────────

export const FORM_PREFILL_MAPPINGS: Record<string, CompiledFormMapping> = {
  // Quick Start — Fillout-based forms (canonical + alias IDs)
  eBxXtLZdK4us: compile(QUICK_START_FILLOUT_ENTRIES),
  jLwpyNvuB2us: compile(QUICK_START_FILLOUT_ENTRIES),

  // Benefits Pulse Survey
  recmB9IdRhtgckvaY: compile(BENEFITS_PULSE_ENTRIES),

  // NDA
  recySUNj6jv47SOKr: compile(NDA_ENTRIES),

  // Basic Intake
  rechTHxZIxS3bBcqF: compile(STANDARD_FORM_ENTRIES),

  // Comprehensive Intake
  recUnTZFK5UyfWqzm: compile(STANDARD_FORM_ENTRIES),

  // Quick Start (New Benefits) — standard field names
  reclUQ6KhVzCssuVl: compile(STANDARD_FORM_ENTRIES),

  // Quick Start (Alt) — standard field names
  recufWIRuSFArZ9GG: compile(STANDARD_FORM_ENTRIES),

  // Update Quickstart (w/ current benefits)
  rZhiEaUEskus: compile(UPDATE_QUICKSTART_ENTRIES),

  // Update PEO/HR
  gn6WNJPJKTus: compile(UPDATE_PEO_HR_ENTRIES),

  // Broker Role
  recxH9Jrk10bbqU58: compile(BROKER_ROLE_ENTRIES),

  // HR Tech
  recOt6cX0t1DksDFT: compile(HR_TECH_ENTRIES),

  // PEO/EOR Assessment
  recKzuznmqq29uASl: compile(PEO_EOR_ASSESSMENT_ENTRIES),
};
