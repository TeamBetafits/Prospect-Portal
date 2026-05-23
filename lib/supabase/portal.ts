import { supabaseAdmin, supabaseClient } from "@/lib/supabaseClient";
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
  const rows = await list<any>(
    supabaseAdmin
      .from("intake_assigned_forms")
      .select("*, intake_available_forms(*)")
      .eq("company_id", companyId)
      .or("assigned.is.null,assigned.eq.true")
      .order("created_at", { ascending: true })
      .limit(100)
  );

  const forms = rows.map((row) => {
    const available = row.intake_available_forms || {};
    const templateId = available.airtable_id || row.airtable_id || row.available_form_id;
    return {
      id: row.id,
      name: row.name || available.display_name || "Assigned Form",
      status: mapFormStatus(row.status, row.submitted),
      description: available.forms_url || (templateId ? FORM_ROUTE_BY_TEMPLATE_ID[templateId] : "") || "",
      availableFormId: templateId || row.available_form_id || undefined,
    };
  });

  return dedupeAssignedForms(forms);
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

  return rows.map((row) => ({
    id: row.id,
    name: row.name || "Progress Step",
    status: mapProgressStatus(row.status),
    category: row.visibility_progress_steps || "Onboarding",
    notes: row.notes || undefined,
    lastUpdated: row.status_last_updated ? asDate(row.status_last_updated) : undefined,
  }));
}

function mapProgressStatus(status: unknown): ProgressStatus {
  const value = asString(status).toLowerCase();
  if (value.includes("approved") || value.includes("complete")) return ProgressStatus.APPROVED;
  if (value.includes("review")) return ProgressStatus.IN_REVIEW;
  if (value.includes("flag")) return ProgressStatus.FLAGGED;
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
      "First Name": contact?.client_contacts,
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
      lastName: "",
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
  if (Object.keys(companyPatch).length > 1) {
    const { error } = await supabaseAdmin.from("companies").update(companyPatch).eq("id", companyId);
    if (error) throw error;
  }

  const contact = typeof body.contact === "object" && body.contact ? (body.contact as Json) : {};
  await upsertSingleton("contacts", companyId, {
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
}

async function upsertSingleton(table: string, companyId: string, patch: Json): Promise<string | null> {
  const timestampPatch = table === "other_questions" ? patch : { ...patch, updated_at: new Date().toISOString() };
  const cleaned = cleanObject(timestampPatch);
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
  if (Object.keys(companyPatch).length > 1) {
    const { error } = await supabaseAdmin.from("companies").update(companyPatch).eq("id", companyId);
    if (error) throw error;
    targets.companies = Object.keys(companyPatch);
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
    const patch = cleanObject({ ...(companyPayload as Json), id: undefined, updated_at: new Date().toISOString() });
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
  const [benefitClass, strategiesRows, medical, dental, vision] = await Promise.all([
    maybeSingle<any>(supabaseAdmin.from("benefit_classes").select("*").eq("company_id", companyId).limit(1)),
    list<any>(supabaseAdmin.from("contribution_strategies").select("*").eq("company_id", companyId).limit(100)),
    list<any>(supabaseAdmin.from("medical_plans").select("*").eq("company_id", companyId).limit(100)),
    list<any>(supabaseAdmin.from("dental_plans").select("*").eq("company_id", companyId).limit(100)),
    list<any>(supabaseAdmin.from("vision_plans").select("*").eq("company_id", companyId).limit(100)),
  ]);

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
    plans: [
      ...medical.map(mapMedicalPlan),
      ...dental.map(mapDentalPlan),
      ...vision.map(mapVisionPlan),
    ],
  };
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

export async function getBenefitsAnalysisData(companyId: string): Promise<{
  demographics: DemographicInsights | null;
  kpis: FinancialKPIs | null;
  breakdown: BudgetBreakdown[];
}> {
  const [censusRows, plans] = await Promise.all([
    list<any>(supabaseAdmin.from("census").select("*").eq("company_id", companyId).limit(1000)),
    getBenefitPlansData(companyId),
  ]);

  const employees = censusRows.filter((row) => String(row.relationship || "").toLowerCase() !== "dependent");
  const ages = employees.map((row) => asNumber(row.age)).filter(Boolean);
  const salaries = employees.map((row) => asNumber(row.compensation)).filter(Boolean);
  const maleCount = employees.filter((row) => asString(row.gender).toLowerCase().startsWith("m")).length;
  const femaleCount = employees.filter((row) => asString(row.gender).toLowerCase().startsWith("f")).length;

  const monthlyTotal = plans.plans.reduce((sum, plan) => sum + asNumber(plan.monthlyPremium), 0);
  const employerTotal = plans.plans.reduce((sum, plan) => sum + asNumber(plan.monthlyEmployerContribution), 0);
  const employeeTotal = plans.plans.reduce((sum, plan) => sum + asNumber(plan.monthlyEmployeeContribution), 0);

  if (!censusRows.length) {
    return {
      demographics: null,
      kpis: plans.plans.length
        ? {
            totalMonthlyCost: monthlyTotal,
            totalEmployerContribution: employerTotal,
            totalEmployeeContribution: employeeTotal,
            erCostPerEligible: 0,
          }
        : null,
      breakdown: plans.plans.map((plan) => buildBudgetBreakdown(plan, 0)),
    };
  }

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
      erCostPerEligible: employees.length ? monthlyTotal / employees.length : 0,
    },
    breakdown: plans.plans.map((plan) => buildBudgetBreakdown(plan, employees.length)),
  };
}

function buildBudgetBreakdown(plan: BenefitPlan, eligibleEmployees: number): BudgetBreakdown {
  const monthlyTotal = asNumber(plan.monthlyPremium);
  const erCostMonth = asNumber(plan.monthlyEmployerContribution);
  const eeCostMonth = asNumber(plan.monthlyEmployeeContribution);
  return {
    benefit: plan.category,
    carrier: plan.carrier,
    participation: eligibleEmployees ? 100 : 0,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    erCostMonth,
    eeCostMonth,
    erCostEnrolled: eligibleEmployees ? erCostMonth / eligibleEmployees : 0,
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
