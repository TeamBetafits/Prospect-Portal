/**
 * Module-level in-memory cache for the company pre-fill flat fields object.
 *
 * Keyed by company ID (the `recordId` returned by /api/forms/group-data).
 * Persists for the lifetime of the browser tab (session-level cache).
 * There is normally only one entry per browser session.
 */
const cache = new Map<string, Record<string, unknown>>();

export function getPreFillCache(companyId: string): Record<string, unknown> | undefined {
  return cache.get(companyId);
}

export function setPreFillCache(companyId: string, fields: Record<string, unknown>): void {
  cache.set(companyId, fields);
}

export function clearPreFillCache(): void {
  cache.clear();
}
