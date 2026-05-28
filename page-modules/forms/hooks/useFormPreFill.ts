"use client";

import { useEffect, useRef, useState } from "react";
import { FormValues } from "@/types/form";
import { getPreFillCache, setPreFillCache } from "@/lib/prefill/companyPreFillCache";
import { FORM_PREFILL_MAPPINGS } from "@/lib/prefill/formPreFillMappings";
import { mapPreFillFields } from "@/lib/prefill/preFillUtils";

interface UseFormPreFillOptions {
  formId: string;
}

interface UseFormPreFillResult {
  /** Mapped pre-fill values for this form. Empty object when unavailable. */
  values: FormValues;
  /**
   * Fields that should be rendered read-only for the prospect.
   * Derived from editableBy === "Betafits" entries in FORM_PREFILL_MAPPINGS.
   * Key is the form field key; value is always true when present.
   */
  readonlyFields: Record<string, boolean>;
  /** True while the company data fetch is in progress. */
  isLoading: boolean;
  /** Non-null when the fetch failed. */
  error: Error | null;
}

type GroupDataResponse = { recordId: string; fields: Record<string, unknown> };

/**
 * Module-level shared promise so that concurrent hook instances on the same
 * page all await the same single fetch rather than issuing multiple requests.
 */
let _groupDataPromise: Promise<GroupDataResponse | null> | null = null;

function getGroupData(): Promise<GroupDataResponse | null> {
  if (_groupDataPromise) return _groupDataPromise;
  _groupDataPromise = fetch("/api/forms/group-data", { credentials: "include" })
    .then((res) => (res.ok ? (res.json() as Promise<GroupDataResponse>) : null))
    .catch(() => null);
  return _groupDataPromise;
}

/**
 * Fetches the company group-data for the current session user and maps it to
 * form field values using the centralized FORM_PREFILL_MAPPINGS registry.
 *
 * - Shares a single fetch across all concurrent hook instances via a
 *   module-level promise; additionally caches the result by company ID so
 *   subsequent page navigations within the same tab skip the network entirely.
 * - Returns an empty `values` object for forms that have no entry in the
 *   registry — no pre-fill is applied, no error is surfaced.
 * - Server-safe: uses the session-authenticated /api/forms/group-data route;
 *   no service-role credentials are exposed to the client.
 */
export function useFormPreFill({ formId }: UseFormPreFillOptions): UseFormPreFillResult {
  const [values, setValues] = useState<FormValues>({});
  const [readonlyFields, setReadonlyFields] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const compiled = FORM_PREFILL_MAPPINGS[formId];

    // No mapping registered — skip the fetch and resolve immediately.
    if (!compiled || Object.keys(compiled.fieldMap).length === 0) {
      setIsLoading(false);
      return;
    }

    // readonlyFields are known immediately from the registry (no async needed).
    setReadonlyFields(compiled.readonlyFields);

    let isMounted = true;

    async function applyPreFill() {
      try {
        // Check module-level cache before issuing a request.
        // We don't know the company ID a priori, so on cache miss we use the
        // shared promise to fetch once and then populate the cache.
        const CACHE_KEY = "__group_data__";
        let fields = getPreFillCache(CACHE_KEY);

        if (!fields) {
          const data = await getGroupData();
          if (data?.recordId && data?.fields) {
            setPreFillCache(data.recordId, data.fields);
            setPreFillCache(CACHE_KEY, data.fields);
            fields = data.fields;
          }
        }

        if (isMounted && fields) {
          setValues(mapPreFillFields(fields, compiled.fieldMap));
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    applyPreFill();

    return () => {
      isMounted = false;
    };
  }, [formId]);

  return { values, readonlyFields, isLoading, error };
}
