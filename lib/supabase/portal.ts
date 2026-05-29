import { supabaseAdmin, supabaseClient } from "@/lib/supabaseClient";
import { normalizePatch, validateFieldValue } from "@/shared/forms/formatters";
import type { FieldDefinition } from "@/shared/forms/types";
import {
  AssignedForm,
  AvailableForm,
  BenefitEligibilityData,
  BenefitPlan,
  BudgetBreakdown,
  CompanyData,
  ContributionStrategy,
  DemographicInsights,
  DocumentArtifact,
  DocumentStatus,
  FeedbackResponse,
  FeedbackStats,
  FinancialKPIs,
  FormStatus,
  ProgressStatus,
  ProgressStep,
} from "@/types";

type Json = Record<string, unknown>;

const companyStandardFields: Array<Pick<FieldDefinition, "key" | "label" | "type" | "format">> = [
  { key: "website", label: "Website", type: "url", format: "url" },
  { key: "sic_code", label: "SIC Code", type: "text", format: "sic" },
  { key: "naics_code", label: "NAICS Code", type: "text", format: "naics" },
];

const entityStandardFields: Array<Pick<FieldDefinition, "key" | "label" | "type" | "format">> = [
  { key: "ein", label: "EIN", type: "text", format: "ein" },
  { key: "primary_contact_email", label: "Primary Contact Email", type: "email", format: "email" },
  { key: "primary_contact_phone", label: "Primary Contact Phone", type: "phone", format: "phone" },
  { key: "alternate_bor_signer_email", label: "Alternate Signer Email", type: "email", format: "email" },
  { key: "alternate_bor_signer_phone", label: "Alternate Signer Phone", type: "phone", format: "phone" },
];

const contactStandardFields: Array<Pick<FieldDefinition, "key" | "label" | "type" | "format">> = [
  { key: "email", label: "Email", type: "email", format: "email" },
  { key: "phone", label: "Phone", type: "phone", format: "phone" },
];

const locationStandardFields: Array<Pick<FieldDefinition, "key" | "label" | "type" | "format">> = [
  { key: "zip_code", label: "ZIP Code", type: "text", format: "zip" },
];

const policyStandardFields: Array<Pick<FieldDefinition, "key" | "label" | "type" | "format">> = [
  { key: "renewal_month", label: "Renewal Month", type: "number", format: "renewalMonth" },
];

function getStandardFields(table: string): Array<Pick<FieldDefinition, "key" | "label" | "type" | "format">> {
  if (table === "companies") return companyStandardFields;
  if (table === "entities") return entityStandardFields;
  if (table === "contacts") return contactStandardFields;
  if (table === "locations") return locationStandardFields;
  if (table === "policy_or_admin_configurations") return policyStandardFields;
  return [];
}

function normalizeTablePatch(table: string, patch: Json): Json {
  const fields = getStandardFields(table);
  if (!fields.length) return patch;

  const normalized = normalizePatch(fields as FieldDefinition[], patch) as Json;
  for (const field of fields) {
    if (normalized[field.key] === undefined || normalized[field.key] === null || normalized[field.key] === "") continue;
    const message = validateFieldValue(field as FieldDefinition, normalized[field.key]);
    if (message) throw new Error(`${table}.${field.key}: ${message}`);
  }
  return normalized;
}

export interface PortalUserProfile {
  id: string;
  companyId: string | null;
  email: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  role?: string;
  mustChangePassword?: boolean;
}

const FORM_ROUTE_BY_TEMPLATE_ID: Record<string, string> = {
  eBxXtLZdK4us: "/forms/quick-start",
  jLwpyNvuB2us: "/forms/quick-start",
  cqBbC1vEUcus: "/forms/peo-eor-assessment",
  fYJ3MNj7VQus: "/forms/benefits-administration",
  ujTSx72pr5us: "/forms/benefits-compliance",
  tE2Bb3x71Cus: "/forms/workers-compensation",
  "6eUGSndhtYus": "/forms/nda",
  aTDkqH7zTmus: "/forms/document-uploader",
  "199DTBMrsLus": "/forms/medical-coverage-survey",
  eQ7FVU76PDus: "/forms/benefits-feedback",
  xn4WCJ9D8pus: "/forms/add-new-group",
  jgaiJJZJvjus: "/forms/premiums-contribution-strategy",
  wpjffs7r5pus: "/forms/comprehensive-intake",
  ns4TDz7ssbus: "/forms/basic-intake",
  rZhiEaUEskus: "/forms/update-quickstart-current-benefits",
  gn6WNJPJKTus: "/forms/update-peo-hr",
  urHF8xDu7eus: "/forms/update-broker-role",
  rec4V98J6aPaM3u9H: "/forms/medical-coverage-survey",
  rec7NfuiBQ8wrEmu7: "/forms/workers-compensation",
  recFVcfdoXkUjIcod: "/forms/add-new-group",
  recFxyNqTLDdrxXN2: "/forms/benefits-administration",
  recGrsR8Sdx96pckJ: "/forms/benefits-compliance",
  recKzuznmqq29uASl: "/forms/peo-eor-assessment",
  recOE9pVakkobVzU7: "/forms/appoint-betafits",
  recOt6cX0t1DksDFT: "/forms/hr-tech",
  recUnTZFK5UyfWqzm: "/forms/comprehensive-intake",
  recdjXjySYuYUGkdP: "/forms/premiums-contribution-strategy",
  "missing-premiums-manual-input": "/forms/missing-premiums",
  rechTHxZIxS3bBcqF: "/forms/basic-intake",
  reclUQ6KhVzCssuVl: "/forms/quick-start-new-benefits",
  recmB9IdRhtgckvaY: "/forms/benefits-pulse-survey",
  recsLJiBVdED8EEbr: "/forms/document-uploader",
  recufWIRuSFArZ9GG: "/forms/quick-start-alt",
  recxH9Jrk10bbqU58: "/forms/broker-role",
  recySUNj6jv47SOKr: "/forms/nda",
};

const PORTAL_HIDDEN_AVAILABLE_FORM_IDS = new Set([
  "jLwpyNvuB2us",
  "reclUQ6KhVzCssuVl",
  "recufWIRuSFArZ9GG",
]);

const CANONICAL_QUICK_START_TEMPLATE_ID = "eBxXtLZdK4us";

const DEFAULT_PROGRESS_STEPS: ProgressStep[] = [
  { id: "quick-start", name: "Quick Start", status: ProgressStatus.MISSING, category: "Intake" },
  { id: "current-benefits", name: "Current Benefits", status: ProgressStatus.MISSING, category: "Benefits" },
  { id: "benefit-documents", name: "Benefit Documents", status: ProgressStatus.MISSING, category: "Documents" },
  { id: "vendor-feedback", name: "Vendor Feedback", status: ProgressStatus.MISSING, category: "Feedback" },
  { id: "employee-feedback", name: "Employee Feedback", status: ProgressStatus.MISSING, category: "Feedback" },
];

const QUICK_START_IDS: Record<string, string> = {
  firstName: "qYvbJrrJqLQjqQnVip6c3N",
  lastName: "3khn37NbHQYb7CN6NPgrx2",
  title: "2d65uNNeKNqSmZT1k2WVRq",
  phone: "jZa7ip7oU533vM2qLWCkZj",
  email: "ckkAfnKZoQag2Kqf7j71Cq",
  companyName: "2UCyRd53bWrtdKXAK1XMy6",
  address: "ayXo",
  city: "fT94",
  state: "hmTa",
  zipCode: "wLev",
  yearFounded: "r1TkXLw3QBZBCkoRHidEPs",
  ein: "uTuDTocoypgCbQCkcHWUXN",
  sicCode: "hf2rRXr8RmGS1o5PFoFJJn",
  naicsCode: "xfBVQncwKZoTzx4FDeHDLR",
  employeeCount: "onbhhvHYbup9VUBE6eAAaz",
  benefitEligibleEmployees: "jMkzWAv3b9K5VCyGHPsZmw",
  medicalEnrolledEmployees: "87fD37dczxpgzodHMWgvWT",
  headcountGrowth: "xcqpaj6Sfv98YJFAUiCZ4z",
  hasNda: "opsQwCsEVnschNufM581ph",
};

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(asString).filter(Boolean).join(", ");
  return String(value);
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asDate(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
}

function normalizeYearToDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{4}$/.test(text)) return `${text}-01-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text;
  return null;
}

function pick(values: Json, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = values[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function cleanObject<T extends Json>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as Partial<T>;
}

async function maybeSingle<T>(query: any): Promise<T | null> {
  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("[Supabase maybeSingle Error]", error);
    throw error;
  }
  return data as T | null;
}

async function list<T>(query: any): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    console.error("[Supabase list Error]", error);
    throw error;
  }
  return (data || []) as T[];
}

export async function signInWithSupabase(email: string, password: string): Promise<PortalUserProfile | null> {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error || !data.user?.email) return null;
  return getUserProfileByEmail(data.user.email);
}

export async function verifySupabaseOtpToken(tokenHash: string): Promise<PortalUserProfile | null> {
  const { data, error } = await supabaseClient.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (error || !data.user?.email) return null;
  return getUserProfileByEmail(data.user.email);
}

export async function getUserProfileByEmail(email: string): Promise<PortalUserProfile | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const row = await maybeSingle<any>(
    supabaseAdmin.from("users").select("*").ilike("email", normalizedEmail).limit(1)
  );

  if (!row) return null;
  if (String(row.status || "active").toLowerCase() !== "active") return null;

  return {
    id: row.id,
    companyId: row.company_id || null,
    email: row.email,
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    jobTitle: row.job_title || undefined,
    role: row.role || "prospect",
    mustChangePassword: Boolean(row.must_change_password),
  };
}

export async function getCompanyIdByEmail(email: string): Promise<string | null> {
  const profile = await getUserProfileByEmail(email);
  return profile?.companyId || null;
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const profile = await getUserProfileByEmail(email);
  return profile?.id || null;
}

export async function sendSupabaseMagicLink(email: string, redirectTo?: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (error) throw error;
}

export async function setSupabaseUserPassword(email: string, password: string): Promise<void> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  const authUser = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!authUser) throw new Error("Supabase Auth user not found");

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
    password,
  });
  if (updateError) throw updateError;

  await supabaseAdmin
    .from("users")
    .update({ must_change_password: false, updated_at: new Date().toISOString() })
    .ilike("email", email);
}

export async function getDashboardData(companyId: string): Promise<{
  documents: DocumentArtifact[];
  assignedForms: AssignedForm[];
  availableForms: AvailableForm[];
  progressSteps: ProgressStep[];
}> {
  console.log(`[getDashboardData] Starting fetch for company: ${companyId}`);
  
  const results = await Promise.allSettled([
    listDocuments(companyId),
    listAssignedForms(companyId),
    listAvailableForms(companyId),
    listProgressSteps(companyId),
  ]);

  const [documents, assignedForms, availableForms, progressSteps] = results.map((result, index) => {
    const labels = ["documents", "assignedForms", "availableForms", "progressSteps"];
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error(`[getDashboardData] Failed to fetch ${labels[index]}:`, result.reason);
      return [];
    }
  });

  return { 
    documents: documents as DocumentArtifact[], 
    assignedForms: assignedForms as AssignedForm[], 
    availableForms: availableForms as AvailableForm[], 
    progressSteps: progressSteps as ProgressStep[] 
  };
}

export async function listDocuments(companyId: string): Promise<DocumentArtifact[]> {
  const rows = await list<any>(
    supabaseAdmin
      .from("documents_and_artifacts")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(100)
  );

  return rows.map((row) => ({
    id: row.id,
    name: asString(row.metadata?.title) || row.file_name || row.document_type || "Untitled Document",
    status: mapDocumentStatus(row.status),
    fileName: row.file_name || row.document_type || "document",
    date: row.created_at || row.updated_at || new Date().toISOString(),
    url: row.file_url || undefined,
    documentType: row.document_type || undefined,
    fileUrl: row.file_url || undefined,
  }));
}

function mapDocumentStatus(status: unknown): DocumentStatus {
  const value = asString(status).toLowerCase();
  if (value.includes("approved")) return DocumentStatus.APPROVED;
  if (value.includes("review")) return DocumentStatus.UNDER_REVIEW;
  if (value.includes("reject")) return DocumentStatus.REJECTED;
  return DocumentStatus.NOT_REVIEWED;
}

export async function listAssignedForms(companyId: string): Promise<AssignedForm[]> {
  const [rows, submissionRows] = await Promise.all([
    list<any>(
      supabaseAdmin
        .from("intake_assigned_forms")
        .select("*, intake_available_forms(*)")
        .eq("company_id", companyId)
        .or("assigned.is.null,assigned.eq.true")
        .order("created_at", { ascending: true })
        .limit(100)
    ),
    // Cross-reference form_submissions so status is accurate even when the
    // intake_assigned_forms.submitted flag was never written (e.g. formId mismatch)
    list<any>(
      supabaseAdmin
        .from("form_submissions")
        .select("form_id, form_name")
        .eq("company_id", companyId)
    ),
  ]);

  // Build a set of group keys (e.g. "quick-start") that have at least one submission
  const submittedGroupKeys = new Set<string>();
  for (const sub of submissionRows) {
    const key = computeFormGroupKey(String(sub.form_id || ""), String(sub.form_name || ""));
    if (key) submittedGroupKeys.add(key);
  }

  const forms = rows.map((row) => {
    const available = row.intake_available_forms || {};
    const templateId = available.airtable_id || row.airtable_id || row.available_form_id;
    const rowName = row.name || available.display_name || "Assigned Form";
    let status = mapFormStatus(row.status, row.submitted);

    // Upgrade NOT_STARTED → SUBMITTED if form_submissions has a record for this form group
    if (status === FormStatus.NOT_STARTED) {
      const groupKey = computeFormGroupKey(templateId || row.id, rowName);
      if (groupKey && submittedGroupKeys.has(groupKey)) {
        status = FormStatus.SUBMITTED;
      }
    }

    const routeFromId = templateId ? (FORM_ROUTE_BY_TEMPLATE_ID[templateId] ?? "") : "";
    const formsUrl = available.forms_url ?? "";
    // Prefer the portal route path over a raw Fillout embed URL (?id=...) so
    // that isLink resolves correctly in the dashboard.
    const description = formsUrl && !formsUrl.startsWith("?id=") ? formsUrl : (routeFromId || formsUrl);

    return {
      id: row.id,
      name: rowName,
      status,
      description,
      availableFormId: templateId || row.available_form_id || undefined,
    };
  });

  return dedupeAssignedForms(forms);
}

/**
 * Returns a stable group key for a form so that submissions and assigned forms
 * for the same logical form can be matched even when their IDs differ.
 */
function computeFormGroupKey(formId: string, formName: string): string {
  const name = formName.trim().toLowerCase();
  const route = FORM_ROUTE_BY_TEMPLATE_ID[formId] || "";

  if (
    formId === CANONICAL_QUICK_START_TEMPLATE_ID ||
    PORTAL_HIDDEN_AVAILABLE_FORM_IDS.has(formId) ||
    name.includes("quick start") ||
    name.includes("quickstart") ||
    route.includes("quick-start")
  ) {
    return "quick-start";
  }

  // For all other forms use the formId itself as the key
  return formId;
}

function dedupeAssignedForms(forms: AssignedForm[]): AssignedForm[] {
  const groups = new Map<string, AssignedForm>();

  for (const form of forms) {
    const key = getAssignedFormDedupeKey(form);
    const existing = groups.get(key);

    if (!existing || shouldPreferAssignedForm(form, existing)) {
      groups.set(key, form);
    }
  }

  return Array.from(groups.values());
}

function getAssignedFormDedupeKey(form: AssignedForm): string {
  const name = form.name.trim().toLowerCase();
  const id = form.availableFormId || form.id;

  if (
    id === CANONICAL_QUICK_START_TEMPLATE_ID ||
    PORTAL_HIDDEN_AVAILABLE_FORM_IDS.has(id) ||
    name.includes("quick start") ||
    name.includes("quickstart")
  ) {
    return "quick-start";
  }

  return id;
}

function shouldPreferAssignedForm(candidate: AssignedForm, current: AssignedForm): boolean {
  const candidateScore = getAssignedFormPreferenceScore(candidate);
  const currentScore = getAssignedFormPreferenceScore(current);
  return candidateScore > currentScore;
}

function getAssignedFormPreferenceScore(form: AssignedForm): number {
  let score = 0;

  if (form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED) score += 100;
  if (form.availableFormId === CANONICAL_QUICK_START_TEMPLATE_ID) score += 20;
  if (!PORTAL_HIDDEN_AVAILABLE_FORM_IDS.has(form.availableFormId || "")) score += 10;

  return score;
}

export async function listAvailableForms(companyId?: string | null): Promise<AvailableForm[]> {
  const assigned = companyId
    ? await list<any>(
        supabaseAdmin.from("intake_assigned_forms").select("available_form_id").eq("company_id", companyId)
      )
    : [];
  const assignedIds = new Set(assigned.map((row) => row.available_form_id).filter(Boolean));

  const rows = await list<any>(
    supabaseAdmin
      .from("intake_available_forms")
      .select("*")
      .or("show_in_available_forms.is.true,show_in_available_forms.is.null")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .limit(100)
  );

  return rows
    .filter((row) => !assignedIds.has(row.id))
    .filter((row) => !isRestrictedForm(row))
    .filter((row) => !isPortalHiddenAvailableForm(row))
    .map((row) => ({
      id: row.airtable_id || row.id,
      name: row.display_name || "Available Form",
      description: row.description || row.intro_text || "",
    }));
}

export function isPortalHiddenAvailableForm(row: any): boolean {
  const identifiers = [
    row.id,
    row.airtable_id,
    extractFilloutTemplateId(asString(row.forms_url)),
  ].filter(Boolean);

  if (identifiers.some((id) => PORTAL_HIDDEN_AVAILABLE_FORM_IDS.has(String(id)))) {
    return true;
  }

  return asString(row.name || row.display_name).trim().toLowerCase() === "quick start (new benefits)";
}

function extractFilloutTemplateId(url: string): string {
  return url.match(/fillout\.com\/t\/([a-zA-Z0-9]+)/)?.[1] || "";
}

function isRestrictedForm(row: any): boolean {
  const assignment = asString(row.assignment).toLowerCase();
  const assignmentType = asString(row.assignment_type).toLowerCase();
  const visibilityRules = asString(row.visibility_rules).toLowerCase();

  return (
    assignment.includes("admin form") ||
    assignment.includes("internal") ||
    assignment.includes("system") ||
    assignmentType.includes("sub-form") ||
    assignmentType.includes("cannot be assigned") ||
    visibilityRules.includes("admin only") ||
    visibilityRules.includes("internal only") ||
    visibilityRules.includes("private") ||
    visibilityRules.includes("restricted")
  );
}

function mapFormStatus(status: unknown, submitted?: boolean): FormStatus {
  if (submitted) return FormStatus.SUBMITTED;
  const value = asString(status).toLowerCase();
  if (value.includes("complete")) return FormStatus.COMPLETED;
  if (value.includes("submit")) return FormStatus.SUBMITTED;
  if (value.includes("progress") || value.includes("incomplete")) return FormStatus.IN_PROGRESS;
  return FormStatus.NOT_STARTED;
}

export async function assignForm(companyId: string, formId: string): Promise<string> {
  const available = await findAvailableForm(formId);
  if (!available) throw new Error("Form not found");

  const existing = await maybeSingle<any>(
    supabaseAdmin
      .from("intake_assigned_forms")
      .select("id")
      .eq("company_id", companyId)
      .eq("available_form_id", available.id)
      .limit(1)
  );
  if (existing?.id) return existing.id;

  const { data, error } = await supabaseAdmin
    .from("intake_assigned_forms")
    .insert({
      company_id: companyId,
      available_form_id: available.id,
      name: available.display_name,
      status: FormStatus.NOT_STARTED,
      assigned: true,
      submitted: false,
      created_time: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function findAvailableForm(formId: string): Promise<any | null> {
  const byAirtableId = await maybeSingle<any>(
    supabaseAdmin.from("intake_available_forms").select("*").eq("airtable_id", formId).limit(1)
  );
  if (byAirtableId) return byAirtableId;
  if (!isUuid(formId)) return null;

  const byId = await maybeSingle<any>(
    supabaseAdmin.from("intake_available_forms").select("*").eq("id", formId).limit(1)
  );
  return byId;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function listProgressSteps(companyId: string): Promise<ProgressStep[]> {
  const rows = await list<any>(
    supabaseAdmin
      .from("intake_progress_steps")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true })
      .limit(100)
  );

  const rowSteps = rows.map((row) => ({
    id: row.id,
    name: row.name || "Progress Step",
    status: mapProgressStatus(row.status),
    category: row.visibility_progress_steps || "Onboarding",
    notes: row.notes || undefined,
    lastUpdated: row.status_last_updated ? asDate(row.status_last_updated) : undefined,
  }));

  return mergeProgressSteps(rowSteps);
}

function mergeProgressSteps(rowSteps: ProgressStep[]): ProgressStep[] {
  const stepsByName = new Map(rowSteps.map((step) => [step.name.trim().toLowerCase(), step]));

  return DEFAULT_PROGRESS_STEPS.map((defaultStep) => {
    const existing = stepsByName.get(defaultStep.name.trim().toLowerCase());
    return existing || defaultStep;
  }).concat(
    rowSteps.filter((step) => !DEFAULT_PROGRESS_STEPS.some((defaultStep) => defaultStep.name.trim().toLowerCase() === step.name.trim().toLowerCase()))
  );
}

function mapProgressStatus(status: unknown): ProgressStatus {
  const value = asString(status).toLowerCase();
  if (value.includes("approved") || value.includes("complete")) return ProgressStatus.APPROVED;
  if (value.includes("review")) return ProgressStatus.IN_REVIEW;
  if (value.includes("flag")) return ProgressStatus.FLAGGED;
  if (value.includes("action needed")) return ProgressStatus.ACTION_NEEDED;
  if (value.includes("not requested")) return ProgressStatus.NOT_REQUESTED;
  return ProgressStatus.MISSING;
}

export async function getGroupDataFields(companyId: string): Promise<{ recordId: string; fields: Json }> {
  const [company, entity, location, contact, other, policy] = await Promise.all([
    maybeSingle<any>(supabaseAdmin.from("companies").select("*").eq("id", companyId).limit(1)),
    maybeSingle<any>(supabaseAdmin.from("entities").select("*").eq("company_id", companyId).order("primary_entity", { ascending: false }).limit(1)),
    maybeSingle<any>(supabaseAdmin.from("locations").select("*").eq("company_id", companyId).order("primary_location", { ascending: false }).limit(1)),
    maybeSingle<any>(supabaseAdmin.from("contacts").select("*").eq("company_id", companyId).limit(1)),
    maybeSingle<any>(supabaseAdmin.from("other_questions").select("*").eq("company_id", companyId).limit(1)),
    maybeSingle<any>(supabaseAdmin.from("policy_or_admin_configurations").select("*").eq("company_id", companyId).limit(1)),
  ]);

  return {
    recordId: companyId,
    fields: cleanObject({
      "Company Name": company?.company_name,
      "EIN": entity?.ein,
      "Entity Type": entity?.entity_type,
      "Entity Legal Name": entity?.entity_legal_name,
      "SIC Code": company?.sic_code || other?.sic_code,
      "Preferred SIC Code": company?.sic_code || other?.sic_code,
      "NAICS Code": company?.naics_code || other?.naics_code,
      "Preferred NAICS Code": company?.naics_code || other?.naics_code,
      "Website": company?.website,
      "Street Address": location?.address_street,
      "Address": location?.address_street,
      "City": location?.city,
      "State / Province": location?.state,
      "ZIP Code": location?.zip_code,
      "First Name": contact?.first_name || contact?.client_contacts,
      "Last Name": contact?.last_name,
      "Job Title": contact?.title,
      "Phone Number": contact?.phone,
      "Work Email": contact?.email,
      "Estimated Benefit Eligible EEs": other?.est_med_enrolled,
      "Estimated Medical Enrolled EEs": other?.est_med_enrolled,
      "Renewal Month": policy?.renewal_month,
      "Current PEO": other?.peo_status,
      "HR Software Used": other?.ben_admin_platforms,
    }),
  };
}

export async function getCompanyData(companyId: string): Promise<CompanyData | null> {
  const { fields } = await getGroupDataFields(companyId);
  if (!fields["Company Name"]) return null;

  return {
    name: asString(fields["Company Name"]),
    entityType: asString(fields["Entity Type"]),
    legalName: asString(fields["Entity Legal Name"]),
    ein: asString(fields["EIN"]),
    sicCode: asString(fields["SIC Code"]),
    naicsCode: asString(fields["NAICS Code"]),
    address: asString(fields["Street Address"]),
    renewalMonth: asString(fields["Renewal Month"]),
    contact: {
      firstName: asString(fields["First Name"]),
      lastName: asString(fields["Last Name"]),
      jobTitle: asString(fields["Job Title"]),
      phone: asString(fields["Phone Number"]),
      email: asString(fields["Work Email"]),
    },
    workforce: {
      totalEmployees: asString(fields["Estimated Benefit Eligible EEs"]),
      usHqEmployees: "",
      hqCity: asString(fields["City"]),
      otherUsCities: [],
      otherCountries: [],
      openJobs: "",
      linkedInUrl: "",
    },
    glassdoor: {
      overallRating: 0,
      benefitsRating: 0,
      healthInsuranceRating: 0,
      retirementRating: 0,
      overallReviews: 0,
      benefitsReviews: 0,
      glassdoorUrl: "",
    },
  };
}

export async function updateCompanyData(companyId: string, body: Json): Promise<void> {
  const companyPatch = cleanObject({
    company_name: pick(body, "name", "companyName"),
    website: pick(body, "website"),
    sic_code: pick(body, "sicCode"),
    naics_code: pick(body, "naicsCode"),
    updated_at: new Date().toISOString(),
  });
  const normalizedCompanyPatch = normalizeTablePatch("companies", companyPatch);
  if (Object.keys(normalizedCompanyPatch).length > 1) {
    const { error } = await supabaseAdmin.from("companies").update(normalizedCompanyPatch).eq("id", companyId);
    if (error) throw error;
  }

  const contact = typeof body.contact === "object" && body.contact ? (body.contact as Json) : {};
  await upsertSingleton("contacts", companyId, {
    first_name: pick(contact, "firstName"),
    last_name: pick(contact, "lastName"),
    title: pick(contact, "jobTitle"),
    phone: pick(contact, "phone"),
    email: pick(contact, "email"),
    client_contacts: [pick(contact, "firstName"), pick(contact, "lastName")].filter(Boolean).join(" "),
  });

  await upsertSingleton("entities", companyId, {
    primary_entity: true,
    entity_type: pick(body, "entityType"),
    entity_legal_name: pick(body, "legalName"),
    ein: pick(body, "ein"),
  });

  await upsertSingleton("locations", companyId, {
    primary_location: true,
    address_street: pick(body, "address"),
  });

  await upsertSingleton("policy_or_admin_configurations", companyId, {
    renewal_month: pick(body, "renewalMonth"),
  });
}

async function upsertSingleton(table: string, companyId: string, patch: Json): Promise<string | null> {
  const timestampPatch = table === "other_questions" ? patch : { ...patch, updated_at: new Date().toISOString() };
  const cleaned = normalizeTablePatch(table, cleanObject(timestampPatch));
  if (Object.keys(cleaned).length <= 1) return null;

  const existing = await maybeSingle<any>(
    supabaseAdmin.from(table).select("id").eq("company_id", companyId).limit(1)
  );

  if (existing?.id) {
    const { error } = await supabaseAdmin.from(table).update(cleaned).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabaseAdmin
    .from(table)
    .insert({ ...cleaned, company_id: companyId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function getLastFormSubmissionAnswers(
  companyId: string,
  formIds: string[]
): Promise<Record<string, unknown> | null> {
  const row = await maybeSingle<any>(
    supabaseAdmin
      .from("form_submissions")
      .select("answers")
      .eq("company_id", companyId)
      .in("form_id", formIds)
      .order("created_at", { ascending: false })
      .limit(1)
  );
  return (row?.answers as Record<string, unknown>) || null;
}

export async function submitPortalForm(input: {
  companyId: string;
  userId: string | null;
  formId: string;
  formName?: string;
  values: Json;
  mappedPayloads?: Json;
}): Promise<{ submissionId: string; normalizedTargets: Json }> {
  const available = await findAvailableForm(input.formId);
  const normalizedTargets = await normalizeFormValues(input.companyId, input.formId, input.values, input.mappedPayloads);
  const updatedUserId = await updateSubmittingUserFromForm(input.companyId, input.userId, input.values);
  if (updatedUserId) normalizedTargets.users = updatedUserId;

  const { data, error } = await supabaseAdmin
    .from("form_submissions")
    .insert({
      company_id: input.companyId,
      available_form_id: available?.id || null,
      form_id: input.formId,
      form_name: input.formName || available?.display_name || input.formId,
      status: FormStatus.SUBMITTED,
      submitted_by_user_id: input.userId,
      answers: input.values,
      normalized_targets: normalizedTargets,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (available?.id) {
    await supabaseAdmin
      .from("intake_assigned_forms")
      .update({
        status: FormStatus.SUBMITTED,
        submitted: true,
        first_submitted: new Date().toISOString().split("T")[0],
        last_updated: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", input.companyId)
      .eq("available_form_id", available.id);
  }

  await touchProgressStep(input.companyId, input.formName || available?.display_name || "Form Submitted");
  return { submissionId: data.id, normalizedTargets };
}

async function normalizeFormValues(companyId: string, formId: string, values: Json, mappedPayloads?: Json): Promise<Json> {
  const targets: Json = {};

  const companyPatch = cleanObject({
    company_name: pick(values, "companyName", "company", QUICK_START_IDS.companyName),
    sic_code: pick(values, "preferredSicCode", "sicCode", QUICK_START_IDS.sicCode),
    naics_code: pick(values, "preferredNaicsCode", "naicsCode", QUICK_START_IDS.naicsCode),
    updated_at: new Date().toISOString(),
  });
  const normalizedCompanyPatch = normalizeTablePatch("companies", companyPatch);
  if (Object.keys(normalizedCompanyPatch).length > 1) {
    const { error } = await supabaseAdmin.from("companies").update(normalizedCompanyPatch).eq("id", companyId);
    if (error) throw error;
    targets.companies = Object.keys(normalizedCompanyPatch);
  }

  const contactId = await upsertContactFromForm(companyId, values);
  if (contactId) targets.contacts = contactId;

  const entityId = await upsertSingleton("entities", companyId, {
    primary_entity: true,
    ein: pick(values, "ein", QUICK_START_IDS.ein),
    entity_legal_name: pick(values, "ndaCompanyLegalName", "legalName", "companyName", QUICK_START_IDS.companyName),
    entity_type: pick(values, "entityType"),
    state_of_formation: pick(values, "stateOfFormation"),
  });
  if (entityId) targets.entities = entityId;

  const locationId = await upsertSingleton("locations", companyId, {
    primary_location: true,
    address_street: pick(values, "address", QUICK_START_IDS.address),
    city: pick(values, "city", QUICK_START_IDS.city),
    state: pick(values, "stateProvince", "state", QUICK_START_IDS.state),
    zip_code: pick(values, "zipCode", QUICK_START_IDS.zipCode),
  });
  if (locationId) targets.locations = locationId;

  const otherId = await upsertSingleton("other_questions", companyId, {
    est_med_enrolled: pick(values, "estimatedMedicalEnrolledEes", "estimatedMedicalEnrolledEEs", QUICK_START_IDS.medicalEnrolledEmployees),
    sic_code: pick(values, "preferredSicCode", "sicCode", QUICK_START_IDS.sicCode),
    naics_code: pick(values, "preferredNaicsCode", "naicsCode", QUICK_START_IDS.naicsCode),
    company_founded_date: normalizeYearToDate(pick(values, "yearFounded", "yearCompanyFounded", QUICK_START_IDS.yearFounded)),
    peo_status: pick(values, "usesPeo", "currentPEO"),
    ben_admin_platforms: pick(values, "payrollProvider", "currentHRSystem"),
    cobra_admin: pick(values, "cobraAdmin"),
  });
  if (otherId) targets.other_questions = otherId;

  const policyId = await upsertSingleton("policy_or_admin_configurations", companyId, {
    carrier_admin: pick(values, "currentAdmin"),
    admin_benadmin: pick(values, "adminServices"),
    policy_number: pick(values, "policyNumber"),
    admin_cobra: pick(values, "cobraAdmin"),
  });
  if (policyId) targets.policy_or_admin_configurations = policyId;

  if (formId === "recmB9IdRhtgckvaY") {
    targets.solution_surveys = await insertBenefitsPulseSurvey(companyId, values);
  }

  if (mappedPayloads && typeof mappedPayloads === "object") {
    targets.mapped_payloads = await applyMappedPayloads(companyId, mappedPayloads);
  }

  return targets;
}

async function applyMappedPayloads(companyId: string, mappedPayloads: Json): Promise<Json> {
  const targets: Json = {};
  const companyPayload = mappedPayloads.companies;
  if (companyPayload && typeof companyPayload === "object") {
    const patch = normalizeTablePatch("companies", cleanObject({ ...(companyPayload as Json), id: undefined, updated_at: new Date().toISOString() }));
    if (Object.keys(patch).length) {
      const { error } = await supabaseAdmin.from("companies").update(patch).eq("id", companyId);
      if (error) throw error;
      targets.companies = Object.keys(patch);
    }
  }
  const singletonTables = ["contacts", "entities", "locations", "benefits", "contribution_strategies", "medical_plans", "dental_plans", "vision_plans"];
  for (const table of singletonTables) {
    const payload = mappedPayloads[table];
    if (!payload) continue;
    const rows = Array.isArray(payload) ? payload : [payload];
    const ids: string[] = [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const id = await upsertSingleton(table, companyId, { ...(row as Json), company_id: companyId });
      if (id) ids.push(id);
    }
    if (ids.length) targets[table] = ids.length === 1 ? ids[0] : ids;
  }
  const documents = mappedPayloads.documents_and_artifacts;
  if (documents) {
    const documentRows = Array.isArray(documents) ? documents : [documents];
    const inserted: string[] = [];
    for (const document of documentRows) {
      if (!document || typeof document !== "object") continue;
      const cleaned = cleanObject({ ...(document as Json), company_id: companyId, updated_at: new Date().toISOString() });
      const { data, error } = await supabaseAdmin.from("documents_and_artifacts").insert(cleaned).select("id").single();
      if (error) throw error;
      inserted.push(data.id);
    }
    if (inserted.length) targets.documents_and_artifacts = inserted;
  }
  const ndaEnvelope = mappedPayloads.e_signature_envelopes;
  if (ndaEnvelope && typeof ndaEnvelope === "object") {
    const { data, error } = await supabaseAdmin.schema("operations").from("e_signature_envelopes").insert(cleanObject({ ...(ndaEnvelope as Json), company_id: companyId })).select("id").single();
    if (error) throw error;
    targets.e_signature_envelopes = data.id;
    const signer = mappedPayloads.e_signature_signers;
    if (signer && typeof signer === "object") {
      const { data: signerData, error: signerError } = await supabaseAdmin.schema("operations").from("e_signature_signers").insert(cleanObject({ ...(signer as Json), company_id: companyId, envelope_id: data.id })).select("id").single();
      if (signerError) throw signerError;
      targets.e_signature_signers = signerData.id;
    }
  }
  return targets;
}

async function upsertContactFromForm(companyId: string, values: Json): Promise<string | null> {
  const firstName = asString(pick(values, "firstName", QUICK_START_IDS.firstName));
  const lastName = asString(pick(values, "lastName", QUICK_START_IDS.lastName));
  return upsertSingleton("contacts", companyId, {
    title: pick(values, "title", QUICK_START_IDS.title),
    phone: pick(values, "phone", "phoneNumber", QUICK_START_IDS.phone),
    email: pick(values, "email", QUICK_START_IDS.email),
    client_contacts: [firstName, lastName].filter(Boolean).join(" "),
    primary_contact: firstName || lastName ? "Yes" : undefined,
  });
}

async function updateSubmittingUserFromForm(companyId: string, userId: string | null, values: Json): Promise<string | null> {
  if (!userId) return null;

  const patch = cleanObject({
    first_name: pick(values, "firstName", QUICK_START_IDS.firstName),
    last_name: pick(values, "lastName", QUICK_START_IDS.lastName),
    email: pick(values, "email", QUICK_START_IDS.email),
    job_title: pick(values, "title", QUICK_START_IDS.title),
  });

  if (!Object.keys(patch).length) return null;

  const { error } = await supabaseAdmin
    .from("users")
    .update(patch)
    .eq("id", userId)
    .eq("company_id", companyId);
  if (error) throw error;

  return userId;
}

async function insertBenefitsPulseSurvey(companyId: string, values: Json): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("solution_surveys")
    .insert({
      company_id: companyId,
      respondent_type: "employee",
      survey_type: "employee_benefits_feedback",
      overall_score: score(pick(values, "overallBenefitsPackage", "overallSatisfaction")),
      medical_plans_score: score(pick(values, "medicalPlanOptions", "medicalSatisfaction")),
      non_medical_score: score(pick(values, "dentalSatisfaction", "visionSatisfaction")),
      employee_cost_score: score(pick(values, "employeeCostScore")),
      comments: asString(pick(values, "surveyComments")),
      metadata: cleanObject({
        healthBenefitsEnrollment: pick(values, "healthBenefitsEnrollment"),
        dentalSatisfaction: pick(values, "dentalSatisfaction"),
        visionSatisfaction: pick(values, "visionSatisfaction"),
      }),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

function score(value: unknown): number | null {
  const numeric = asNumber(value);
  if (!numeric) return null;
  return Math.max(1, Math.min(10, Math.round(numeric)));
}

async function touchProgressStep(companyId: string, formName: string): Promise<void> {
  const existing = await maybeSingle<any>(
    supabaseAdmin
      .from("intake_progress_steps")
      .select("id")
      .eq("company_id", companyId)
      .ilike("name", formName)
      .limit(1)
  );

  if (existing?.id) {
    await supabaseAdmin
      .from("intake_progress_steps")
      .update({
        status: ProgressStatus.IN_REVIEW,
        status_last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return;
  }

  await supabaseAdmin.from("intake_progress_steps").insert({
    company_id: companyId,
    name: formName,
    status: ProgressStatus.IN_REVIEW,
    visibility_progress_steps: "Forms",
    status_last_updated: new Date().toISOString(),
  });
}

export async function getBenefitPlansData(companyId: string): Promise<{
  eligibility: BenefitEligibilityData | null;
  strategies: ContributionStrategy[];
  plans: BenefitPlan[];
}> {
  const [benefitClass, strategiesRows, medical, dental, vision, availablePlans] = await Promise.all([
    maybeSingle<any>(supabaseAdmin.from("benefit_classes").select("*").eq("company_id", companyId).limit(1)),
    list<any>(supabaseAdmin.from("contribution_strategies").select("*").eq("company_id", companyId).limit(100)),
    list<any>(supabaseAdmin.from("medical_plans").select("*").eq("company_id", companyId).limit(100)),
    list<any>(supabaseAdmin.from("dental_plans").select("*").eq("company_id", companyId).limit(100)),
    list<any>(supabaseAdmin.from("vision_plans").select("*").eq("company_id", companyId).limit(100)),
    list<any>(supabaseAdmin.from("available_plans").select("*").eq("company_id", companyId).limit(100)),
  ]);
  const typedPlans = [
    ...medical.map(mapMedicalPlan),
    ...dental.map(mapDentalPlan),
    ...vision.map(mapVisionPlan),
  ];
  const fallbackPlans = typedPlans.length ? [] : await mapAvailablePlans(availablePlans);

  return {
    eligibility: benefitClass
      ? {
          className: benefitClass.class || "All Full-Time Employees",
          waitingPeriod: asString(benefitClass.waiting_period),
          effectiveDate: asString(benefitClass.entry_date__mdv),
          requiredHours: benefitClass.minimum_hours ? `${benefitClass.minimum_hours} Hours per week` : "",
        }
      : null,
    strategies: strategiesRows.map((row) => ({
      benefit: asString(row.base_plan || row.contribution_type || "Benefits"),
      strategyType: asString(row.contribution_type),
      flatAmount: asString(row.er_contribution),
      eePercent: asString(row.ee_contribution),
      depPercent: asString(row.dep_contribution),
      buyUpStrategy: asString(row.buyup_strategy),
    })),
    plans: [...typedPlans, ...fallbackPlans],
  };
}

async function mapAvailablePlans(availablePlans: any[]): Promise<BenefitPlan[]> {
  if (!availablePlans.length) return [];

  const planIds = availablePlans.map((row) => row.id).filter(Boolean);
  const rateRows = planIds.length
    ? await list<any>(
        supabaseAdmin
          .from("tiers_and_rates")
          .select("*")
          .in("plan_id", planIds)
          .limit(1000)
      )
    : [];

  const ratesByPlanId = groupRowsByKey(rateRows, "plan_id");

  return availablePlans
    .map((row) => mapAvailablePlan(row, ratesByPlanId.get(row.id) || []))
    .filter((plan): plan is BenefitPlan => Boolean(plan));
}

function mapAvailablePlan(row: any, rateRows: any[]): BenefitPlan | null {
  const category = normalizeBenefitCategory(row.benefit_type || row.type || row.category);
  if (!category) return null;

  const rates = mapTiersAndRates(rateRows);

  return {
    id: row.id,
    name: row.plan_name || row.name || `${category} Plan`,
    carrier: row.carrier || row.carrier_name || "",
    score: asNumber(row.score || row.plan_score),
    category,
    type: row.plan_type || row.network_type || row.type || category,
    deductible: row.deductible || row.deductible_individual || undefined,
    deductibleFamily: row.deductible_family || undefined,
    oopm: row.out_of_pocket_max || row.oopm || row.oopm_individual || undefined,
    oopmFamily: row.oopm_family || row.out_of_pocket_max_family || undefined,
    coinsurance: row.coinsurance || undefined,
    copay: row.office_visit || row.copay || undefined,
    rx: row.rx_combined || row.rx || undefined,
    valueScore: row.value_score?.toString(),
    annualMax: row.annual_max || undefined,
    preventive: row.preventive?.toString(),
    basic: row.basic?.toString(),
    major: row.major?.toString(),
    oonReimbursement: row.oon || row.oon_reimbursement || undefined,
    examCopay: row.exam_copay || undefined,
    materialsCopay: row.materials_copay || undefined,
    frameAllowance: row.frame_allowance || undefined,
    materialsFrequency: row.materials_frequency || row.lens_frequency || undefined,
    frameFrequency: row.frame_frequency || undefined,
    rates,
    monthlyPremium: rates?.reduce((sum, item) => sum + item.premium, 0) || 0,
    monthlyEmployerContribution: rates?.reduce((sum, item) => sum + item.employerContribution, 0) || 0,
    monthlyEmployeeContribution: rates?.reduce((sum, item) => sum + item.employeeContribution, 0) || 0,
  };
}

function normalizeBenefitCategory(value: unknown): BenefitPlan["category"] | null {
  const text = asString(value).toLowerCase();
  if (text.includes("medical") || text.includes("health")) return "Medical";
  if (text.includes("dental")) return "Dental";
  if (text.includes("vision")) return "Vision";
  return null;
}

function groupRowsByKey(rows: any[], key: string): Map<string, any[]> {
  const grouped = new Map<string, any[]>();
  for (const row of rows) {
    const value = row[key];
    if (!value) continue;
    grouped.set(value, [...(grouped.get(value) || []), row]);
  }
  return grouped;
}

function mapTiersAndRates(rows: any[]): BenefitPlan["rates"] {
  return rows.map(mapTierAndRate).filter((item) => item.premium || item.employerContribution || item.employeeContribution);
}

function mapTierAndRate(row: any) {
  const tierKey = normalizeTierKey(row.tier_key || row.tier_label);
  const premium = pickTierAmount(row, tierKey, "premium");
  const userPremium = pickTierAmount(row, tierKey, "premium", true);
  const employerContribution = asNumber(row.er_contribution || pickTierAmount(row, tierKey, "contribution"));
  const premiumAmount = userPremium || premium;

  return {
    tierKey,
    tierLabel: tierLabelForKey(tierKey),
    premium: premiumAmount,
    employerContribution,
    employeeContribution: Math.max(0, premiumAmount - employerContribution),
  };
}

function normalizeTierKey(value: unknown): string {
  const text = asString(value).toLowerCase();
  if (text.includes("spouse") || text === "es") return "es";
  if (text.includes("child") || text === "ec") return "ec";
  if (text.includes("family") || text === "ef") return "ef";
  return "ee";
}

function tierLabelForKey(tierKey: string): string {
  if (tierKey === "es") return "Employee + Spouse";
  if (tierKey === "ec") return "Employee + Child";
  if (tierKey === "ef") return "Family";
  return "Employee";
}

function pickTierAmount(row: any, tierKey: string, prefix: "premium" | "contribution", user = false): number {
  const suffix = user ? "_user" : "";
  const keys = [
    `${prefix}_${tierKey}${suffix}`,
    `${prefix}_${tierKey.toUpperCase()}${suffix}`,
    prefix,
  ];
  for (const key of keys) {
    const value = asNumber(row[key]);
    if (value) return value;
  }
  return 0;
}

function mapMedicalPlan(row: any): BenefitPlan {
  const rates = mapPlanRates(row);
  return {
    id: row.id,
    name: row.plan_name_client || row.plan_name_carrier || "Medical Plan",
    carrier: row.plan_name_carrier || "",
    score: 0,
    category: "Medical",
    type: row.plan_type || row.network_type || "",
    deductible: row.deductible || undefined,
    oopm: row.out_of_pocket_max || undefined,
    coinsurance: row.coinsurance || undefined,
    copay: row.office_visit || undefined,
    rx: row.rx_combined || undefined,
    rates,
    monthlyPremium: totalRateField(row, "premium"),
    monthlyEmployerContribution: totalRateField(row, "contribution"),
    monthlyEmployeeContribution: totalRateField(row, "employee"),
  };
}

function mapDentalPlan(row: any): BenefitPlan {
  const rates = mapPlanRates(row);
  return {
    id: row.id,
    name: row.plan_name_client || row.plan_name_carrier || "Dental Plan",
    carrier: row.plan_name_carrier || "",
    score: 0,
    category: "Dental",
    type: row.plan_type || "",
    annualMax: row.annual_max || undefined,
    preventive: row.preventive?.toString(),
    basic: row.basic?.toString(),
    major: row.major?.toString(),
    oonReimbursement: row.oon || undefined,
    rates,
    monthlyPremium: totalRateField(row, "premium"),
    monthlyEmployerContribution: totalRateField(row, "contribution"),
    monthlyEmployeeContribution: totalRateField(row, "employee"),
  };
}

function mapVisionPlan(row: any): BenefitPlan {
  const rates = mapPlanRates(row);
  return {
    id: row.id,
    name: row.plan_name_client || row.plan_name_carrier || "Vision Plan",
    carrier: row.plan_name_carrier || "",
    score: 0,
    category: "Vision",
    type: "Vision",
    examCopay: row.exam_copay || undefined,
    materialsCopay: row.materials_copay || undefined,
    frameAllowance: row.frame_allowance || undefined,
    materialsFrequency: row.lens_frequency || undefined,
    frameFrequency: row.frame_frequency || undefined,
    rates,
    monthlyPremium: totalRateField(row, "premium"),
    monthlyEmployerContribution: totalRateField(row, "contribution"),
    monthlyEmployeeContribution: totalRateField(row, "employee"),
  };
}

function mapPlanRates(row: any): BenefitPlan["rates"] {
  return [
    rate("ee", "Employee", row.premium_ee, row.ee_contribution),
    rate("es", "Employee + Spouse", row.premium_es, row.es_contribution),
    rate("ec", "Employee + Child", row.premium_ec, row.ec_contribution),
    rate("ef", "Family", row.premium_ef, row.ef_contribution),
  ].filter((item) => item.premium || item.employerContribution || item.employeeContribution);
}

function rate(tierKey: string, tierLabel: string, premium: unknown, employerContribution: unknown) {
  const premiumAmount = asNumber(premium);
  const employerAmount = asNumber(employerContribution);
  return {
    tierKey,
    tierLabel,
    premium: premiumAmount,
    employerContribution: employerAmount,
    employeeContribution: Math.max(0, premiumAmount - employerAmount),
  };
}

function totalRateField(row: any, field: "premium" | "contribution" | "employee"): number {
  const tiers = mapPlanRates(row) || [];
  if (field === "premium") return tiers.reduce((sum, item) => sum + item.premium, 0);
  if (field === "contribution") return tiers.reduce((sum, item) => sum + item.employerContribution, 0);
  return tiers.reduce((sum, item) => sum + item.employeeContribution, 0);
}

interface PlanEnrollment {
  ee: number;
  es: number;
  ec: number;
  ef: number;
  total: number;
}

function normalizePlanNameForMatching(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s+-\s+20[0-9]{2}.*$/, "") // Strip year suffixes like " - 2026"
    .replace(/[^a-z0-9]+/g, "")          // Strip non-alphanumeric characters
    .replace(/plus/g, "");               // Strip "plus"
}

function getTierKeyFromCoverageType(coverageType: string): 'ee' | 'es' | 'ec' | 'ef' {
  const normalized = String(coverageType || "").trim().toUpperCase();
  if (['EE', 'EMPLOYEE', 'EMPLOYEE ONLY'].includes(normalized)) return 'ee';
  if (['ES', 'EMPLOYEE + SPOUSE', 'EMPLOYEE SPOUSE'].includes(normalized)) return 'es';
  if (['EC', 'EMPLOYEE + CHILD', 'EMPLOYEE + CHILDREN', 'EMPLOYEE + CHILD(REN)', 'EMPLOYEE CHILD', 'EMPLOYEE CHILDREN'].includes(normalized)) return 'ec';
  if (['EF', 'FAMILY', 'EMPLOYEE + FAMILY'].includes(normalized)) return 'ef';
  
  if (normalized.includes('SPOUSE') || normalized === 'ES') return 'es';
  if (normalized.includes('CHILD') || normalized === 'EC') return 'ec';
  if (normalized.includes('FAMILY') || normalized === 'EF') return 'ef';
  return 'ee';
}

function getPlanEnrollment(plan: BenefitPlan, censusRows: any[]): PlanEnrollment {
  const planNormalized = normalizePlanNameForMatching(plan.name);
  const enrollment: PlanEnrollment = { ee: 0, es: 0, ec: 0, ef: 0, total: 0 };
  
  for (const row of censusRows) {
    const isEmployee = String(row.relationship || "").toLowerCase() !== "dependent";
    if (!isEmployee) continue;
    
    let censusPlanName = "";
    let coverageType = "";
    
    if (plan.category === "Medical") {
      censusPlanName = row.medical_plan_name;
      coverageType = row.medical_coverage_type;
    } else if (plan.category === "Dental") {
      censusPlanName = row.dental_plan_name;
      coverageType = row.dental_coverage_type;
    } else if (plan.category === "Vision") {
      censusPlanName = row.vision_plan_name;
      coverageType = row.vision_coverage_type;
    }
    
    if (censusPlanName && normalizePlanNameForMatching(censusPlanName) === planNormalized) {
      const tierKey = getTierKeyFromCoverageType(coverageType);
      enrollment[tierKey]++;
      enrollment.total++;
    }
  }
  
  return enrollment;
}

export async function checkPublishedBudgetExists(companyId: string): Promise<boolean> {
  try {
    const { count, error } = await supabaseAdmin
      .from('benefit_budget_versions')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    
    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("does not exist") || error.message?.includes("not found")) {
        return false;
      }
      console.error('[checkPublishedBudgetExists] Error:', error);
      return false;
    }
    return (count ?? 0) > 0;
  } catch (err) {
    console.error('[checkPublishedBudgetExists] Catch error:', err);
    return false;
  }
}

export async function getBenefitsAnalysisData(companyId: string): Promise<{
  demographics: DemographicInsights | null;
  kpis: FinancialKPIs | null;
  breakdown: BudgetBreakdown[];
}> {
  // 1. Check for published budget versions
  try {
    const { data: versions, error: versionError } = await supabaseAdmin
      .from('benefit_budget_versions')
      .select('*')
      .eq('company_id', companyId)
      .order('published_at', { ascending: false })
      .limit(1);

    if (!versionError && versions && versions.length > 0) {
      const published = versions[0];
      const totals = published.totals || {};
      const categories = published.categories || [];

      // Query census rows live just for demographics, if census exists
      const censusRows = await list<any>(supabaseAdmin.from("census").select("*").eq("company_id", companyId).limit(1000));
      const employees = censusRows.filter((row) => String(row.relationship || "").toLowerCase() !== "dependent");
      const ages = employees.map((row) => asNumber(row.age)).filter(Boolean);
      const salaries = employees.map((row) => asNumber(row.compensation)).filter(Boolean);
      const maleCount = employees.filter((row) => asString(row.gender).toLowerCase().startsWith("m")).length;
      const femaleCount = employees.filter((row) => asString(row.gender).toLowerCase().startsWith("f")).length;

      const breakdown: BudgetBreakdown[] = [];
      for (const category of categories) {
        const plans = category.plans || [];
        for (const plan of plans) {
          const planSummary = plan.summary || {};
          breakdown.push({
            benefit: category.benefitType || "Medical",
            carrier: plan.carrier || "",
            participation: planSummary.enrolledCount || 0,
            monthlyTotal: planSummary.monthlyPremiumTotal || 0,
            annualTotal: planSummary.annualPremiumTotal || 0,
            erCostMonth: planSummary.monthlyErTotal || 0,
            eeCostMonth: planSummary.monthlyEeTotal || 0,
            erCostEnrolled: planSummary.erCostPerEnrolled || 0,
            erCostFte: totals.eligibleCount ? (planSummary.monthlyErTotal / totals.eligibleCount) : 0,
          });
        }
      }

      return {
        demographics: censusRows.length ? {
          eligibleEmployees: employees.length,
          averageSalary: average(salaries),
          averageAge: average(ages),
          malePercentage: employees.length ? (maleCount / employees.length) * 100 : 0,
          femalePercentage: employees.length ? (femaleCount / employees.length) * 100 : 0,
        } : {
          eligibleEmployees: totals.eligibleCount || 0,
          averageSalary: 0,
          averageAge: 0,
          malePercentage: 0,
          femalePercentage: 0,
        },
        kpis: {
          totalMonthlyCost: totals.monthlyPremium || totals.totalMonthlyBudget || 0,
          totalEmployerContribution: totals.monthlyEmployerPremium || (totals.totalEmployerAnnualCost / 12) || 0,
          totalEmployeeContribution: totals.monthlyEmployeePremium || (totals.totalEmployeeAnnualCost / 12) || 0,
          erCostPerEligible: totals.erCostPerEligible || 0,
        },
        breakdown,
      };
    }
  } catch (err) {
    console.error('[getBenefitsAnalysisData] Error checking published versions:', err);
  }

  // Fallback to legacy/dynamic building if no published versions found
  const [censusRows, plans] = await Promise.all([
    list<any>(supabaseAdmin.from("census").select("*").eq("company_id", companyId).limit(1000)),
    getBenefitPlansData(companyId),
  ]);

  const employees = censusRows.filter((row) => String(row.relationship || "").toLowerCase() !== "dependent");
  const ages = employees.map((row) => asNumber(row.age)).filter(Boolean);
  const salaries = employees.map((row) => asNumber(row.compensation)).filter(Boolean);
  const maleCount = employees.filter((row) => asString(row.gender).toLowerCase().startsWith("m")).length;
  const femaleCount = employees.filter((row) => asString(row.gender).toLowerCase().startsWith("f")).length;

  if (!censusRows.length) {
    return {
      demographics: null,
      kpis: plans.plans.length
        ? {
            totalMonthlyCost: 0,
            totalEmployerContribution: 0,
            totalEmployeeContribution: 0,
            erCostPerEligible: 0,
          }
        : null,
      breakdown: plans.plans.map((plan) => buildBudgetBreakdown(plan, { ee: 0, es: 0, ec: 0, ef: 0, total: 0 }, 0)),
    };
  }

  // 1. Calculate enrollments for each plan
  const planEnrollments = plans.plans.map(plan => ({
    plan,
    enrollment: getPlanEnrollment(plan, censusRows)
  }));
  
  // 2. Calculate enrollment-weighted costs for each plan
  let monthlyTotal = 0;
  let employerTotal = 0;
  let employeeTotal = 0;
  
  const breakdown = planEnrollments.map(({ plan, enrollment }) => {
    const b = buildBudgetBreakdown(plan, enrollment, employees.length);
    monthlyTotal += b.monthlyTotal;
    employerTotal += b.erCostMonth;
    employeeTotal += b.eeCostMonth;
    return b;
  });

  return {
    demographics: {
      eligibleEmployees: employees.length,
      averageSalary: average(salaries),
      averageAge: average(ages),
      malePercentage: employees.length ? (maleCount / employees.length) * 100 : 0,
      femalePercentage: employees.length ? (femaleCount / employees.length) * 100 : 0,
    },
    kpis: {
      totalMonthlyCost: monthlyTotal,
      totalEmployerContribution: employerTotal || plans.strategies.reduce((sum, s) => sum + asNumber(s.flatAmount), 0),
      totalEmployeeContribution: employeeTotal,
      erCostPerEligible: employees.length ? employerTotal / employees.length : 0,
    },
    breakdown,
  };
}

function buildBudgetBreakdown(plan: BenefitPlan, enrollment: PlanEnrollment, eligibleEmployees: number): BudgetBreakdown {
  const eeRate = plan.rates?.find(r => r.tierKey === 'ee') || { premium: 0, employerContribution: 0, employeeContribution: 0 };
  const esRate = plan.rates?.find(r => r.tierKey === 'es') || { premium: 0, employerContribution: 0, employeeContribution: 0 };
  const ecRate = plan.rates?.find(r => r.tierKey === 'ec') || { premium: 0, employerContribution: 0, employeeContribution: 0 };
  const efRate = plan.rates?.find(r => r.tierKey === 'ef') || { premium: 0, employerContribution: 0, employeeContribution: 0 };
  
  const monthlyTotal = 
    (eeRate.premium * enrollment.ee) +
    (esRate.premium * enrollment.es) +
    (ecRate.premium * enrollment.ec) +
    (efRate.premium * enrollment.ef);
    
  const erCostMonth = 
    (eeRate.employerContribution * enrollment.ee) +
    (esRate.employerContribution * enrollment.es) +
    (ecRate.employerContribution * enrollment.ec) +
    (efRate.employerContribution * enrollment.ef);
    
  const eeCostMonth = 
    (eeRate.employeeContribution * enrollment.ee) +
    (esRate.employeeContribution * enrollment.es) +
    (ecRate.employeeContribution * enrollment.ec) +
    (efRate.employeeContribution * enrollment.ef);
    
  return {
    benefit: plan.category,
    carrier: plan.carrier,
    participation: enrollment.total,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    erCostMonth,
    eeCostMonth,
    erCostEnrolled: enrollment.total ? erCostMonth / enrollment.total : 0,
    erCostFte: eligibleEmployees ? erCostMonth / eligibleEmployees : 0,
  };
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export async function getEmployeeFeedback(companyId: string): Promise<{
  stats: FeedbackStats | null;
  responses: FeedbackResponse[];
}> {
  const rows = await list<any>(
    supabaseAdmin
      .from("solution_surveys")
      .select("*")
      .eq("company_id", companyId)
      .eq("survey_type", "employee_benefits_feedback")
      .order("submitted_at", { ascending: false })
      .limit(1000)
  );

  const responses: FeedbackResponse[] = rows.map((row) => ({
    id: row.id,
    submittedAt: asDate(row.submitted_at),
    tier: asString(row.metadata?.healthBenefitsEnrollment) || "Individual Only",
    overallRating: asNumber(row.overall_score),
    medicalOptions: asNumber(row.medical_plans_score || row.health_insurance_score),
    medicalNetwork: asNumber(row.medical_network_score || row.provider_network_score),
    medicalCost: asNumber(row.employee_cost_score),
    nonMedical: asNumber(row.non_medical_score),
    retirement: row.retirement_score == null ? null : asNumber(row.retirement_score),
    comments: row.comments || undefined,
  }));

  return {
    responses,
    stats: responses.length
      ? {
          overall: average(responses.map((r) => r.overallRating)),
          responses: responses.length,
          nonMedical: average(responses.map((r) => r.nonMedical)),
          employeeCost: average(responses.map((r) => r.medicalCost)),
          medicalNetwork: average(responses.map((r) => r.medicalNetwork)),
          medicalOptions: average(responses.map((r) => r.medicalOptions)),
          retirement: null,
        }
      : null,
  };
}

export { FORM_ROUTE_BY_TEMPLATE_ID };
