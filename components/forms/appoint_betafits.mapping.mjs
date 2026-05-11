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

  const country = normalizeText(countryCode)?.toUpperCase();
  const dial = country ? COUNTRY_DIAL_BY_CODE[country] : null;
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
  }

  const primaryEmail = normalizeText(form.primaryContactEmail);
  if (primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryEmail)) {
    errors.primaryContactEmail = "Primary contact email is invalid.";
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
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Maps BOR form fields from appoint_betafits.jsx into Supabase payloads.
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
    company_id: companyId,
    entity_legal_name: normalizeText(form.companyName),
    dba: normalizeText(form.dba),
    ein: normalizeText(form.companyEin),
    primary_contact_name: normalizeText(form.primaryContactName),
    primary_contact_is_bor_authorized_signer: signerAuthorized,
    alternate_bor_signer_name: signerAuthorized === false ? normalizeText(form.alternateSignerName) : null,
    alternate_bor_signer_title: signerAuthorized === false ? normalizeText(form.alternateSignerTitle) : null,
    alternate_bor_signer_email: signerAuthorized === false ? normalizeText(form.alternateSignerEmail) : null,
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
    company_id: companyId,
    address_street: normalizeText(form.address),
    city: normalizeText(form.city),
    state: normalizeText(form.stateProvince),
    zip_code: normalizeText(form.zipPostalCode),
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
