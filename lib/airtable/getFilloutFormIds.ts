/**
 * Fetch all Fillout form IDs from the Available Forms Airtable table.
 *
 * Reads the Available Forms table and extracts Fillout template IDs from
 * URL fields (Fillout URL, Form URL, URL, Link, Assigned Form URL, or Description).
 * Used by scripts/analyze-fillout-forms.ts and scripts/fetch-fillout-form-structure.ts.
 */

import { fetchAirtableRecords } from './fetch';

const AVAILABLE_FORMS_TABLE_ID = 'tblZVnNaE4y8e56fa';

const FILLOUT_URL_FIELDS = [
  'Fillout URL',
  'Form URL',
  'Forms URL',
  'URL',
  'Link',
  'Assigned Form URL',
] as const;

const FILLOUT_TEMPLATE_ID_REGEX = /fillout\.com\/t\/([a-zA-Z0-9]+)/;

export interface AvailableFormWithFilloutId {
  airtableId: string;
  name: string;
  filloutTemplateId: string | null;
  filloutUrl?: string;
}

/**
 * Extract Fillout template ID from a URL or description string.
 */
export function extractFilloutTemplateId(urlOrDescription: string): string | null {
  const match = String(urlOrDescription || '').match(FILLOUT_TEMPLATE_ID_REGEX);
  return match ? match[1] : null;
}

/**
 * Fetch all Available Forms from Airtable and return their Fillout template IDs
 * (and Airtable record IDs / names). Template IDs are derived from URL fields or
 * from Description if it contains fillout.com/t/XXX.
 */
export async function getFilloutFormIdsFromAirtable(options?: {
  apiKey?: string;
  maxRecords?: number;
}): Promise<AvailableFormWithFilloutId[]> {
  const records = await fetchAirtableRecords(AVAILABLE_FORMS_TABLE_ID, {
    apiKey: options?.apiKey || process.env.AIRTABLE_API_KEY,
    maxRecords: options?.maxRecords ?? 100,
  });

  if (!records?.length) {
    return [];
  }

  return records.map((record) => {
    const name = String(record.fields['Name'] || 'Unknown Form');
    let filloutUrl = '';
    for (const field of FILLOUT_URL_FIELDS) {
      const val = record.fields[field];
      if (val && typeof val === 'string' && val.includes('fillout.com')) {
        filloutUrl = val;
        break;
      }
    }
    if (!filloutUrl) {
      const desc = record.fields['Description'] || record.fields['Intro Text'] || '';
      if (String(desc).includes('fillout.com')) {
        filloutUrl = String(desc);
      }
    }
    const filloutTemplateId = filloutUrl ? extractFilloutTemplateId(filloutUrl) : null;
    // If no URL field had it, use Airtable record ID as form id (many forms use recXXX as the form id in app routes)
    const templateId = filloutTemplateId || record.id;
    return {
      airtableId: record.id,
      name,
      filloutTemplateId: filloutTemplateId || null,
      filloutUrl: filloutUrl || undefined,
    };
  });
}

/**
 * Return only the list of Fillout template IDs that were found from URL/description.
 * Skips forms that only have an Airtable ID (no fillout.com URL). Use these IDs
 * with the Fillout API (GET /v1/api/forms/{formId}).
 */
export async function getFilloutTemplateIdsOnly(options?: {
  apiKey?: string;
  maxRecords?: number;
}): Promise<string[]> {
  const forms = await getFilloutFormIdsFromAirtable(options);
  const ids = forms
    .map((f) => f.filloutTemplateId)
    .filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids));
}

/** Full Available Form record as stored in Airtable (id + all fields). */
export interface AvailableFormRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
}

/**
 * Fetch all Available Forms from Airtable with full record data (all field names and values).
 * Use this when you don't have a Fillout API key and want "exact fields" from Airtable only.
 */
export async function getAvailableFormsWithAllFields(options?: {
  apiKey?: string;
  maxRecords?: number;
}): Promise<AvailableFormRecord[]> {
  const records = await fetchAirtableRecords(AVAILABLE_FORMS_TABLE_ID, {
    apiKey: options?.apiKey || process.env.AIRTABLE_API_KEY,
    maxRecords: options?.maxRecords ?? 100,
  });

  if (!records?.length) {
    return [];
  }

  return records.map((record) => ({
    id: record.id,
    fields: { ...record.fields },
    createdTime: record.createdTime,
  }));
}
