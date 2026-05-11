// @ts-nocheck

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

function firstNonEmpty(...values) {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) return normalized;
  }
  return null;
}

function hasEntityFields(entity) {
  return Boolean(
    entity.entity_name ||
    entity.entity_legal_name ||
    entity.state_of_formation ||
    entity.entity_type ||
    entity.ein
  );
}

export function validateNdaFormForMapping(form) {
  const errors = {};

  if (normalizeYesNoToBool(form.ndaRequested) == null) {
    errors.ndaRequested = "Choose Yes or No.";
  }

  if (!normalizeText(form.benefitStartMonth)) {
    errors.benefitStartMonth = "Select the benefit start month.";
  }

  const ndaRequested = normalizeYesNoToBool(form.ndaRequested);
  if (ndaRequested === true && normalizeYesNoToBool(form.userIsNdaSigner) == null) {
    errors.userIsNdaSigner = "Choose Yes or No.";
  }

  const userIsNdaSigner = normalizeYesNoToBool(form.userIsNdaSigner);
  if (ndaRequested === true && userIsNdaSigner === false) {
    if (!normalizeText(form.ndaSignerName)) errors.ndaSignerName = "Enter the signer name.";
    if (!normalizeText(form.ndaSignerTitle)) errors.ndaSignerTitle = "Enter the signer title.";

    const signerEmail = normalizeText(form.ndaSignerEmail);
    if (!signerEmail) {
      errors.ndaSignerEmail = "Enter the signer email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signerEmail)) {
      errors.ndaSignerEmail = "Enter a valid email address.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Maps NDA form fields into Supabase table payloads.
 * Context source: Field Mappings-All Fields Organized.csv
 */
export function mapNdaFormToSupabasePayloads(form, options = {}) {
  const ndaRequested = normalizeYesNoToBool(form.ndaRequested);
  const userIsNdaSigner = normalizeYesNoToBool(form.userIsNdaSigner);

  const envelopes = {
    company_id: options.companyId ?? null,
    nda_requested: ndaRequested ?? false,
    user_is_nda_signer: ndaRequested === true ? userIsNdaSigner : null,
    benefit_start_month: normalizeText(form.benefitStartMonth),
    metadata: {
      source_form: "nda_react_form_preview",
      raw_payload: {
        ndaRequested: normalizeText(form.ndaRequested),
        companyLegalName: normalizeText(form.companyLegalName),
        entityStateFormation: normalizeText(form.entityStateFormation),
        entityType: normalizeText(form.entityType),
        userIsNdaSigner: normalizeText(form.userIsNdaSigner),
        ndaSignerName: normalizeText(form.ndaSignerName),
        ndaSignerTitle: normalizeText(form.ndaSignerTitle),
        ndaSignerEmail: normalizeText(form.ndaSignerEmail),
        legalNameOfEntity: normalizeText(form.legalNameOfEntity),
        entityTypeDetailed: normalizeText(form.entityTypeDetailed),
        entityStateFormationDetailed: normalizeText(form.entityStateFormationDetailed),
        employerIdentificationNumber: normalizeText(form.employerIdentificationNumber),
        benefitStartMonth: normalizeText(form.benefitStartMonth),
      },
    },
  };

  const signers = ndaRequested === true && userIsNdaSigner === false
    ? {
        company_id: options.companyId ?? null,
        envelope_id: options.envelopeId ?? null,
        signer_name: normalizeText(form.ndaSignerName),
        signer_email: normalizeText(form.ndaSignerEmail),
        signer_title: normalizeText(form.ndaSignerTitle),
      }
    : null;

  // CSV row 2:  companyLegalName  → public.entities.entity_name
  // CSV row 11: legalNameOfEntity → public.entities.entity_legal_name
  // Fallback: if companyLegalName is absent, promote legalNameOfEntity into entity_name too
  const primaryEntityName = normalizeText(form.companyLegalName);
  const legalEntityName   = normalizeText(form.legalNameOfEntity);

  const entitiesCandidate = {
    entity_name: primaryEntityName ?? legalEntityName,
    entity_legal_name: legalEntityName,
    state_of_formation: firstNonEmpty(form.entityStateFormation, form.entityStateFormationDetailed),
    entity_type: firstNonEmpty(form.entityType, form.entityTypeDetailed),
    ein: normalizeText(form.employerIdentificationNumber),
  };

  const entities = hasEntityFields(entitiesCandidate) ? entitiesCandidate : null;

  return {
    e_signature_envelopes: envelopes,
    e_signature_signers: signers,
    entities,
  };
}

export {
  normalizeText,
  normalizeYesNoToBool,
  firstNonEmpty,
};
