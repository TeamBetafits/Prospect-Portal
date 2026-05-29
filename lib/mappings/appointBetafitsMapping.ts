// @ts-nocheck
import { normalizeEin, normalizeEmail, normalizePhone as normalizeUsPhone, normalizeZip } from "@/shared/forms/formatters";

function normalizeText(value) {
  if (value == null) return null;
  const cleaned = String(value).trim();
  return cleaned.length ? cleaned : null;
}

function normalizeYesNoToBool(value) {
  const cleaned = normalizeText(value)?.toLowerCase();
  if (cleaned === "yes") return true;
  if (cleaned === "no") return false;
  return null;
}

function normalizeFileName(value) {
  if (!value) return null;
  if (typeof value === "string") return normalizeText(value);
  if (typeof value === "object" && "name" in value) return normalizeText(value.name);
  return null;
}

const COUNTRY_DIAL_BY_CODE = {
  US: "+1",
  CA: "+1",
  GB: "+44",
};

function normalizePhone(value, countryCode) {
  const phone = normalizeText(value);
  if (!phone) return null;

  const country = normalizeText(countryCode)?.toUpperCase() || "US";
  if (country === "US" || country === "CA") return normalizeUsPhone(phone) || phone;
  const dial = COUNTRY_DIAL_BY_CODE[country] ?? null;
  return dial ? `${dial} ${phone}` : phone;
}

function hasLocationFields(location) {
  return Boolean(location.address_street || location.city || location.state || location.zip_code);
}

function hasEntityFields(entity) {
  return Boolean(
    entity.entity_legal_name ||
    entity.dba ||
    entity.ein ||
    entity.primary_contact_name ||
    entity.primary_contact_is_bor_authorized_signer ||
    entity.alternate_bor_signer_name ||
    entity.alternate_bor_signer_title ||
    entity.alternate_bor_signer_email ||
    entity.alternate_bor_signer_phone ||
    entity.bor_effective_date ||
    entity.service_agreement_preference ||
    entity.state_of_formation
  );
}

function mapPolicy(policy) {
  return {
    carrier_name: normalizeText(policy?.carrierName),
    line_of_coverage: normalizeText(policy?.lineOfCoverage),
    policy_number: normalizeText(policy?.policyNumber),
    effective_date: normalizeText(policy?.effectiveDate),
    renewal_date: normalizeText(policy?.renewalDate),
    notes: normalizeText(policy?.notes),
    add_another_policy: normalizeYesNoToBool(policy?.addAnotherPolicy),
  };
}

export function validateBorFormForMapping(form) {
  const errors = {};

  if (!normalizeText(form.companyName)) {
    errors.companyName = "Company name is required.";
  }

  if (!normalizeText(form.address)) {
    errors.address = "Address is required.";
  }

  if (!normalizeText(form.city)) {
    errors.city = "City is required.";
  }

  if (!normalizeText(form.stateProvince)) {
    errors.stateProvince = "State / Province is required.";
  }

  if (!normalizeText(form.zipPostalCode)) {
    errors.zipPostalCode = "ZIP / Postal code is required.";
  } else if (!/^\d{5}(-\d{4})?$/.test(normalizeZip(form.zipPostalCode))) {
    errors.zipPostalCode = "Use a 5-digit ZIP code or ZIP+4.";
  }

  if (normalizeText(form.companyEin) && !/^\d{9}$/.test(normalizeText(form.companyEin).replace(/\D/g, ""))) {
    errors.companyEin = "Use a 9-digit EIN, for example 12-3456789.";
  }

  const primaryEmail = normalizeText(form.primaryContactEmail);
  if (primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryEmail)) {
    errors.primaryContactEmail = "Primary contact email is invalid.";
  }

  if (normalizeText(form.primaryContactPhone) && !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(normalizeUsPhone(form.primaryContactPhone))) {
    errors.primaryContactPhone = "Enter a valid 10-digit US phone number.";
  }

  const signerAuthorized = normalizeYesNoToBool(form.primaryContactIsAuthorizedSigner);
  if (signerAuthorized == null) {
    errors.primaryContactIsAuthorizedSigner = "Choose Yes or No.";
  }

  if (signerAuthorized === false) {
    if (!normalizeText(form.alternateSignerName)) errors.alternateSignerName = "Alternate signer name is required.";
    if (!normalizeText(form.alternateSignerTitle)) errors.alternateSignerTitle = "Alternate signer title is required.";

    const alternateEmail = normalizeText(form.alternateSignerEmail);
    if (!alternateEmail) {
      errors.alternateSignerEmail = "Alternate signer email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternateEmail)) {
      errors.alternateSignerEmail = "Alternate signer email is invalid.";
    }

    if (normalizeText(form.alternateSignerPhone) && !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(normalizeUsPhone(form.alternateSignerPhone))) {
      errors.alternateSignerPhone = "Enter a valid 10-digit US phone number.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Converts a raw phone string like "+1 5551234" back to { countryCode, phone }.
 * Falls back to { countryCode: "US", phone: rawValue } when the format is unknown.
 */
function parsePhone(rawPhone) {
  if (!rawPhone) return { countryCode: "US", phone: "" };
  const knownDials = [
    { dial: "+44", code: "GB" },
    { dial: "+1", code: "US" },
  ];
  for (const { dial, code } of knownDials) {
    if (rawPhone.startsWith(dial + " ")) {
      return { countryCode: code, phone: rawPhone.slice(dial.length + 1) };
    }
  }
  return { countryCode: "US", phone: rawPhone };
}

function normalizeBoolToYesNo(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "";
}

/**
 * Maps Supabase database records back into the shape expected by appoint_betafits.jsx form state.
 * Pass null for any record that does not exist yet — those fields will be left blank.
 *
 * @param {object|null} company  - Row from public.companies
 * @param {object|null} entity   - Row from public.entities (primary entity)
 * @param {object|null} location - Row from public.locations (primary location)
 * @returns {object} Form state object compatible with INITIAL_FORM
 */
export function mapSupabaseToFormState(company, entity, location) {
  const primaryPhone = parsePhone(entity?.primary_contact_phone ?? "");
  const altPhone = parsePhone(entity?.alternate_bor_signer_phone ?? "");

  return {
    // Hidden IDs preserved for upsert — not shown to the user
    _entityId: entity?.id ?? null,
    _locationId: location?.id ?? null,

    // Company section
    companyName: entity?.entity_legal_name ?? company?.company_name ?? "",
    dba: entity?.dba ?? "",
    companyEin: entity?.ein ?? "",
    companyLogo: null, // File objects cannot be reconstructed from a filename

    // Location section
    address: location?.address_street ?? "",
    city: location?.city ?? "",
    stateProvince: location?.state ?? "",
    zipPostalCode: location?.zip_code ?? "",

    // Primary contact
    primaryContactName: entity?.primary_contact_name ?? "",
    primaryContactEmail: entity?.primary_contact_email ?? "",
    primaryContactPhone: primaryPhone.phone,
    primaryContactPhoneCountry: primaryPhone.countryCode,
    primaryContactTitle: entity?.primary_contact_title ?? "",

    // Signer
    primaryContactIsAuthorizedSigner: normalizeBoolToYesNo(entity?.primary_contact_is_bor_authorized_signer),
    alternateSignerName: entity?.alternate_bor_signer_name ?? "",
    alternateSignerTitle: entity?.alternate_bor_signer_title ?? "",
    alternateSignerEmail: entity?.alternate_bor_signer_email ?? "",
    alternateSignerPhone: altPhone.phone,
    alternateSignerPhoneCountry: altPhone.countryCode,

    // BOR details
    borEffectiveDate: entity?.bor_effective_date ?? "",
    serviceAgreementPreference: normalizeBoolToYesNo(entity?.service_agreement_preference),
  };
}

/**
 * Maps BOR form fields from appoint_betafits.jsx into Supabase upsert payloads.
 * Includes entity.id and location.id when they exist so callers can use upsert-by-id.
 * Target tables: public.companies, public.entities, public.locations
 */
export function mapBorFormToSupabasePayloads(form, policies = [], options = {}) {
  const companyId = options.companyId ?? null;
  const signerAuthorized = normalizeYesNoToBool(form.primaryContactIsAuthorizedSigner);

  const companies = {
    id: companyId,
    company_name: normalizeText(form.companyName),
    logo: normalizeFileName(form.companyLogo),
  };

  const entityCandidate = {
    // Preserve existing ID for upsert — null means INSERT, non-null means UPDATE
    id: form._entityId ?? undefined,
    company_id: companyId,
    entity_legal_name: normalizeText(form.companyName),
    dba: normalizeText(form.dba),
    ein: normalizeEin(form.companyEin) || null,
    primary_contact_name: normalizeText(form.primaryContactName),
    primary_contact_email: normalizeEmail(form.primaryContactEmail) || null,
    primary_contact_phone: normalizePhone(form.primaryContactPhone, form.primaryContactPhoneCountry),
    primary_contact_title: normalizeText(form.primaryContactTitle),
    primary_contact_is_bor_authorized_signer: signerAuthorized,
    alternate_bor_signer_name: signerAuthorized === false ? normalizeText(form.alternateSignerName) : null,
    alternate_bor_signer_title: signerAuthorized === false ? normalizeText(form.alternateSignerTitle) : null,
    alternate_bor_signer_email: signerAuthorized === false ? normalizeEmail(form.alternateSignerEmail) || null : null,
    alternate_bor_signer_phone:
      signerAuthorized === false
        ? normalizePhone(form.alternateSignerPhone, form.alternateSignerPhoneCountry)
        : null,
    bor_effective_date: normalizeText(form.borEffectiveDate),
    service_agreement_preference: normalizeYesNoToBool(form.serviceAgreementPreference),
    state_of_formation: normalizeText(form.stateProvince),
    country: "United States",
    primary_entity: true,
  };

  const locationCandidate = {
    // Preserve existing ID for upsert
    id: form._locationId ?? undefined,
    company_id: companyId,
    address_street: normalizeText(form.address),
    city: normalizeText(form.city),
    state: normalizeText(form.stateProvince),
    zip_code: normalizeZip(form.zipPostalCode) || null,
    primary_location: true,
  };

  const mappedPolicies = Array.isArray(policies) ? policies.map(mapPolicy) : [];

  return {
    companies,
    entities: hasEntityFields(entityCandidate) ? entityCandidate : null,
    locations: hasLocationFields(locationCandidate) ? [locationCandidate] : [],
    policy_snapshot: mappedPolicies,
  };
}

export {
  normalizeText,
  normalizeYesNoToBool,
  normalizePhone,
};
