// @ts-nocheck

const CONTEXT_ENGINE_FIELD_KEYS = {
  peo_status: "peo_status",
  current_peo_provider: "current_peo",
  open_to_switching: "would_you_be_open_to_switching_to_another_peo_or_to_a_payroll_only_solution",
  evaluated_peos: "evaluated_peos",
  peo_top_considerations: "peo_name",
  peo_decided_against_reasons: "loss_reasons",
  currently_use_eor: "do_you_currently_use_an_eor",
  eor_vendors_used: "eor_vendors_youve_used",
  eor_country: "country",
  eor_employees_ft_pt: "number_of_employees_ft_pt",
  eor_contractors: "number_of_contractors",
  eor_current: "current_eor_if_applicable",
  eor_monthly_cost: "current_monthly_cost_per_ee_ct",
  eor_currency: "currency_paid_in",
  eor_notes: "notes_or_issues_in_that_country",
  document_types: "document_types",
  file_name: "file_name",
};

function normalizeText(value) {
  if (value == null) return null;
  const cleaned = String(value).trim();
  return cleaned.length ? cleaned : null;
}

function normalizeList(values) {
  if (!Array.isArray(values)) return [];
  const cleaned = values.map((v) => normalizeText(v)).filter(Boolean);
  return [...new Set(cleaned)];
}

function normalizeNumber(value) {
  const text = normalizeText(value);
  if (!text) return null;
  const num = Number(text);
  if (!Number.isFinite(num)) return null;
  return num;
}

function mapCurrentlyUsePeoLabel(value) {
  if (value === "yes") return "Yes";
  if (value === "never_considered") return "No, we have never considered a PEO";
  if (value === "considered_decided_against") return "No, we have considered but decided against";
  return null;
}

function mapCurrentlyUseEorLabel(value) {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return null;
}

function withOther(items, otherText) {
  return (items || []).map((item) => (item === "Other" && otherText ? `Other: ${otherText}` : item));
}

function hasAnyRowValue(row) {
  return Object.values(row || {}).some((v) => normalizeText(v) != null);
}

function mapEorRows(rows = []) {
  return rows
    .filter((row) => hasAnyRowValue(row))
    .map((row) => ({
      [CONTEXT_ENGINE_FIELD_KEYS.eor_country]: normalizeText(row.country),
      [CONTEXT_ENGINE_FIELD_KEYS.eor_employees_ft_pt]: {
        full_time_employees: normalizeNumber(row.fullTimeEmployees),
        part_time_employees: normalizeNumber(row.partTimeEmployees),
      },
      [CONTEXT_ENGINE_FIELD_KEYS.eor_contractors]: normalizeNumber(row.contractors),
      [CONTEXT_ENGINE_FIELD_KEYS.eor_current]: normalizeText(row.currentEor),
      other_eor_name: normalizeText(row.otherEorName),
      [CONTEXT_ENGINE_FIELD_KEYS.eor_monthly_cost]: normalizeNumber(row.monthlyCost),
      [CONTEXT_ENGINE_FIELD_KEYS.eor_currency]: normalizeText(row.currencyPaidIn),
      [CONTEXT_ENGINE_FIELD_KEYS.eor_notes]: normalizeText(row.notes),
    }));
}

export function mapPeoEorFormToSupabasePayloads(form, options = {}) {
  const nowISO = options.nowISO || new Date().toISOString();
  const companyId = normalizeText(options.companyId);
  const assignedFormId = normalizeText(options.assignedFormId);

  const currentPeoProvider =
    form.currentPeoProvider === "Other"
      ? normalizeText(form.currentPeoProviderOther)
      : normalizeText(form.currentPeoProvider);

  const decidedAgainst = withOther(
    normalizeList(form.peoDecidedAgainstReasons),
    normalizeText(form.peoDecidedAgainstReasonsOther)
  );

  const evaluated = withOther(normalizeList(form.evaluatedPeos), normalizeText(form.evaluatedPeosOther));
  const considerations = withOther(
    normalizeList(form.peoTopConsiderations),
    normalizeText(form.peoTopConsiderationsOther)
  );

  const mappedRows = mapEorRows(form.eorRows);

  const contextEnginePayload = {
    [CONTEXT_ENGINE_FIELD_KEYS.peo_status]: normalizeText(form.currentlyUsePeo),
    [CONTEXT_ENGINE_FIELD_KEYS.current_peo_provider]: currentPeoProvider,
    [CONTEXT_ENGINE_FIELD_KEYS.open_to_switching]: normalizeText(form.openToSwitching),
    [CONTEXT_ENGINE_FIELD_KEYS.evaluated_peos]: evaluated,
    [CONTEXT_ENGINE_FIELD_KEYS.peo_top_considerations]: considerations,
    [CONTEXT_ENGINE_FIELD_KEYS.peo_decided_against_reasons]: decidedAgainst,
    [CONTEXT_ENGINE_FIELD_KEYS.currently_use_eor]: normalizeText(form.currentlyUseEor),
    [CONTEXT_ENGINE_FIELD_KEYS.eor_vendors_used]: normalizeList(form.eorVendorsUsed),
    eor_rows: mappedRows,
    [CONTEXT_ENGINE_FIELD_KEYS.document_types]: ["current_eor_invoice"],
    [CONTEXT_ENGINE_FIELD_KEYS.file_name]: normalizeText(form.currentEorInvoice?.name),
    other_details: normalizeText(form.otherDetails),
  };

  return {
    client_data: {
      company_id: companyId,
      peo_status: normalizeText(form.currentlyUsePeo),
      loss_reasons:
        normalizeText(form.currentlyUsePeo) === "considered_decided_against" && decidedAgainst.length
          ? decidedAgainst.join(" | ")
          : null,
      loss_notes: normalizeText(form.otherDetails),
      updated_at: nowISO,
    },
    documents_and_artifacts: {
      company_id: companyId,
      intake_assigned_form_id: assignedFormId,
      document_type: "current_eor_invoice",
      file_name: normalizeText(form.currentEorInvoice?.name),
      status: "submitted",
      metadata: {
        source_form: "peo_eor_react_form",
        mapped_at: nowISO,
        csv_context_engine_field_keys: CONTEXT_ENGINE_FIELD_KEYS,
        context_engine_payload: contextEnginePayload,
        labels: {
          currently_use_peo: mapCurrentlyUsePeoLabel(form.currentlyUsePeo),
          currently_use_eor: mapCurrentlyUseEorLabel(form.currentlyUseEor),
        },
      },
      updated_at: nowISO,
    },
    intake_assigned_forms_update: assignedFormId
      ? {
          id: assignedFormId,
          status: "submitted",
          submitted: nowISO,
          first_submitted: nowISO,
          last_updated: nowISO,
        }
      : null,
    context_engine_payload: contextEnginePayload,
  };
}

export {
  CONTEXT_ENGINE_FIELD_KEYS,
  normalizeText,
  normalizeList,
  normalizeNumber,
  mapEorRows,
  withOther,
};
