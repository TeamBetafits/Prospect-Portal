// @ts-nocheck

import { mapSupabaseToFormState, mapBorFormToSupabasePayloads } from "@/lib/mappings/appointBetafitsMapping";

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetches the company, its primary entity, and its primary location from Supabase.
 * Returns them as a plain object so the caller can decide what to do next.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} companyId  UUID of the company to look up
 * @returns {Promise<{ company: object|null, entity: object|null, location: object|null }>}
 * @throws {Error} when the company record cannot be found or a Supabase query fails
 */
export async function fetchCompanyPrefillData(supabase, companyId) {
  if (!companyId) {
    throw new Error("fetchCompanyPrefillData: companyId is required.");
  }

  // 1. Fetch company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  if (companyError) {
    throw new Error(`Failed to fetch company: ${companyError.message}`);
  }

  if (!company) {
    throw new Error(`Company not found for id: ${companyId}`);
  }

  // 2. Fetch primary entity (primary_entity = true, or fall back to the first one)
  const { data: entities, error: entityError } = await supabase
    .from("entities")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (entityError) {
    throw new Error(`Failed to fetch entities: ${entityError.message}`);
  }

  const entity =
    entities?.find((e) => e.primary_entity === true) ?? entities?.[0] ?? null;

  // 3. Fetch primary location (primary_location = true, or fall back to the first one)
  const { data: locations, error: locationError } = await supabase
    .from("locations")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (locationError) {
    throw new Error(`Failed to fetch locations: ${locationError.message}`);
  }

  const location =
    locations?.find((l) => l.primary_location === true) ?? locations?.[0] ?? null;

  return { company, entity, location };
}

/**
 * Loads and maps saved company data into the form's state shape.
 * Returns null when the company has no saved data yet (blank form is fine).
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} companyId
 * @returns {Promise<object|null>} Prefilled form state, or null if nothing found
 */
export async function loadPrefillFormState(supabase, companyId) {
  const { company, entity, location } = await fetchCompanyPrefillData(
    supabase,
    companyId
  );

  // If the company has no entity and no location yet, return null — blank form.
  if (!entity && !location) return null;

  return mapSupabaseToFormState(company, entity, location);
}

export async function getAppointBetafitsInitialValues() {
  const response = await fetch("/api/forms/appoint-betafits-prefill", { credentials: "include" });
  if (!response.ok) return {};
  const data = await response.json();
  return data?.initialValues || {};
}

// ─── Upsert ───────────────────────────────────────────────────────────────────

/**
 * Persists the BOR form to Supabase without creating duplicate records.
 *
 * Logic:
 *  - companies  → always upsert by id (update the existing row)
 *  - entities   → if payload.entities.id exists → update; otherwise → insert
 *  - locations  → if payload.locations[i].id exists → update; otherwise → insert
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {object} form      The current form state from appoint_betafits.jsx
 * @param {Array}  policies  The current policies array
 * @param {string} companyId The company UUID to attach all records to
 * @returns {Promise<{ company: object, entity: object|null, locations: object[] }>}
 */
export async function upsertBorFormData(supabase, form, policies, companyId) {
  if (!companyId) {
    throw new Error("upsertBorFormData: companyId is required.");
  }

  const payloads = mapBorFormToSupabasePayloads(form, policies, { companyId });

  // ── 1. Upsert company ────────────────────────────────────────────────────────
  const { data: savedCompany, error: companyError } = await supabase
    .from("companies")
    .upsert(payloads.companies, { onConflict: "id" })
    .select()
    .single();

  if (companyError) {
    throw new Error(`Failed to save company: ${companyError.message}`);
  }

  // ── 2. Upsert entity ─────────────────────────────────────────────────────────
  let savedEntity = null;
  if (payloads.entities) {
    const entityPayload = { ...payloads.entities, company_id: companyId };

    let entityResult;
    if (entityPayload.id) {
      // Existing record → update in-place
      const { id, ...fields } = entityPayload;
      entityResult = await supabase
        .from("entities")
        .update(fields)
        .eq("id", id)
        .eq("company_id", companyId) // safety guard
        .select()
        .single();
    } else {
      // New record → insert
      const { id: _discard, ...fields } = entityPayload; // strip undefined id
      entityResult = await supabase
        .from("entities")
        .insert(fields)
        .select()
        .single();
    }

    if (entityResult.error) {
      throw new Error(`Failed to save entity: ${entityResult.error.message}`);
    }
    savedEntity = entityResult.data;
  }

  // ── 3. Upsert locations ───────────────────────────────────────────────────────
  const savedLocations = [];
  for (const loc of payloads.locations) {
    const locPayload = { ...loc, company_id: companyId };
    let locResult;

    if (locPayload.id) {
      const { id, ...fields } = locPayload;
      locResult = await supabase
        .from("locations")
        .update(fields)
        .eq("id", id)
        .eq("company_id", companyId) // safety guard
        .select()
        .single();
    } else {
      const { id: _discard, ...fields } = locPayload;
      locResult = await supabase
        .from("locations")
        .insert(fields)
        .select()
        .single();
    }

    if (locResult.error) {
      throw new Error(`Failed to save location: ${locResult.error.message}`);
    }
    savedLocations.push(locResult.data);
  }

  return {
    company: savedCompany,
    entity: savedEntity,
    locations: savedLocations,
  };
}
