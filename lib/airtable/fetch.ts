import { customFetch } from "@/lib/fetch";

/**
 * Direct Airtable REST API client to avoid AbortSignal issues with the Airtable.js library
 * in Next.js/Vercel production environments
 */

interface AirtableRecord {
    id: string;
    fields: Record<string, any>;
    createdTime?: string;
}

interface AirtableResponse {
    records: AirtableRecord[];
    offset?: string;
}

const baseId = 'appdqgKk1fmhfaJoT';

export async function fetchAirtableRecords(
    tableId: string,
    options: {
        apiKey?: string;
        maxRecords?: number;
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
        filterByFormula?: string;
        view?: string;
    } = {}
): Promise<AirtableRecord[]> {
    const rawToken = options.apiKey || process.env.AIRTABLE_API_KEY;
    const token = rawToken?.trim();

    if (!token) {
        console.warn('Missing AIRTABLE_API_KEY, fetchAirtableRecords returning empty array');
        return [];
    }

    const { maxRecords, sort, filterByFormula, view } = options;

    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);

    if (maxRecords) {
        url.searchParams.append('maxRecords', maxRecords.toString());
    }

    if (sort && sort.length > 0) {
        url.searchParams.append('sort[0][field]', sort[0].field);
        url.searchParams.append('sort[0][direction]', sort[0].direction);
    }

    if (filterByFormula) {
        url.searchParams.append('filterByFormula', filterByFormula);
    }

    if (view) {
        url.searchParams.append('view', view);
    }

    const allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
        if (offset) {
            url.searchParams.set('offset', offset);
        }

        const response = await customFetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Airtable API error: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data: AirtableResponse = await response.json();
        allRecords.push(...data.records);
        offset = data.offset;
    } while (offset);

    return allRecords;
}

/**
 * Fetch a single Airtable record by its record ID
 * This is more efficient than using filterByFormula with RECORD_ID()
 */
export async function fetchAirtableRecordById(
    tableId: string,
    recordId: string,
    options: {
        apiKey?: string;
    } = {}
): Promise<AirtableRecord | null> {
    const rawToken = options.apiKey || process.env.AIRTABLE_API_KEY;
    const token = rawToken?.trim();

    if (!token) {
        console.warn('Missing AIRTABLE_API_KEY, fetchAirtableRecordById returning null');
        return null;
    }

    if (!recordId) {
        return null;
    }

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;

    try {
        const response = await customFetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Record not found
                return null;
            }
            const errorText = await response.text();
            throw new Error(
                `Airtable API error: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data: AirtableRecord = await response.json();
        return data;
    } catch (error) {
        console.error('[fetchAirtableRecordById] Error:', error);
        return null;
    }
}
