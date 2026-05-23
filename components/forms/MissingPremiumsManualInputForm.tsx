"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
// Real schema: tiers_and_rates has 4 rows per plan (one per tier_key: EE/ES/EC/EF).
// plan_name and benefit_type are merged from available_plans by the API route.

export interface TiersAndRatesRow {
  id: string;
  plan_id: string;
  tier_key: string; // "EE" | "ES" | "EC" | "EF"
  plan_name: string;
  benefit_type: string;
  premium_ee: number | null;
  premium_es: number | null;
  premium_ec: number | null;
  premium_ef: number | null;
  premium_ee_user: number | null;
  premium_es_user: number | null;
  premium_ec_user: number | null;
  premium_ef_user: number | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

/** The found premium for a tier row — reads the column matching tier_key. */
function getFoundPremium(row: TiersAndRatesRow): number | null {
  const key = `premium_${row.tier_key.toLowerCase()}` as keyof TiersAndRatesRow;
  return (row[key] as number | null) ?? null;
}

/** The _user field name for a tier row. */
function getUserField(row: TiersAndRatesRow): string {
  return `premium_${row.tier_key.toLowerCase()}_user`;
}

/** Pre-fill value from any existing _user correction. */
function getExistingUserValue(row: TiersAndRatesRow): string {
  const key = getUserField(row) as keyof TiersAndRatesRow;
  const val = row[key] as number | null;
  return val !== null && val !== undefined ? String(val) : "";
}

/** Group rows: benefit_type → [{ plan_name, rows }] */
function groupRows(rows: TiersAndRatesRow[]) {
  const out: Record<string, { plan_name: string; rows: TiersAndRatesRow[] }[]> = {};
  const planOrder: string[] = [];
  const planBenefit: Record<string, string> = {};
  const planName: Record<string, string> = {};
  const planRows: Record<string, TiersAndRatesRow[]> = {};

  for (const row of rows) {
    if (!planRows[row.plan_id]) {
      planOrder.push(row.plan_id);
      planBenefit[row.plan_id] = row.benefit_type;
      planName[row.plan_id] = row.plan_name;
      planRows[row.plan_id] = [];
    }
    planRows[row.plan_id].push(row);
  }

  for (const planId of planOrder) {
    const bt = planBenefit[planId];
    if (!out[bt]) out[bt] = [];
    out[bt].push({ plan_name: planName[planId], rows: planRows[planId] });
  }

  return out;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MissingPremiumsManualInputForm() {
  // ── Data loading ──────────────────────────────────────────────────────────
  const [rows, setRows] = useState<TiersAndRatesRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // userInputs keyed by row id (one input per tier row)
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    fetch("/api/tiers-and-rates")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to load premium data.");
        return body.data as TiersAndRatesRow[];
      })
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        const init: Record<string, string> = {};
        for (const row of data) init[row.id] = getExistingUserValue(row);
        setUserInputs(init);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[MissingPremiumsManualInputForm] Load error:", err);
        setLoadError(err?.message ?? "Could not load premium data. Please refresh and try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Form state ────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState<object | null>(null);

  const groupedRows = useMemo(() => groupRows(rows), [rows]);

  const hasUserPremium = Object.values(userInputs).some((v) => v !== "");
  const hasUploadedDocument = files.length > 0;

  const hasInvalidInput = Object.values(userInputs).some((v) => {
    if (v === "") return false;
    const n = Number(v);
    return Number.isNaN(n) || n < 0;
  });

  const canSubmit =
    !isLoading &&
    !isSubmitting &&
    !hasInvalidInput &&
    (hasUserPremium || hasUploadedDocument);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function updateInput(rowId: string, value: string) {
    setUserInputs((prev) => ({ ...prev, [rowId]: value }));
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
  }

  function buildUpdates() {
    return rows
      .map((row) => {
        const raw = userInputs[row.id];
        if (!raw || raw === "") return null;
        const num = Number(raw);
        if (Number.isNaN(num) || num < 0) return null;
        return { id: row.id, [getUserField(row)]: num };
      })
      .filter(Boolean);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const updates = buildUpdates();

    try {
      const res = await fetch("/api/missing-premiums/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates,
          notes: notes || null,
          supporting_documents: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error ?? "Failed to submit. Please try again.");
      }

      setSubmittedPayload({
        form_type: "Missing Premiums Manual Input",
        submission_id: body.submissionId,
        tiers_and_rates_updates: updates,
        supporting_documents: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        notes: notes || null,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error("[MissingPremiumsManualInputForm] Submit error:", err);
      setSubmitError(err?.message ?? "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-6 w-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-semibold">Premium information submitted for review</h1>
              <p className="mt-2 text-slate-600">
                We received the premiums you entered. A Betafits admin will review and approve
                the values before they are applied and the calculation is re-run.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-slate-950 p-4 text-sm text-white">
            <p className="mb-2 font-semibold">Payload preview</p>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5">
              {JSON.stringify(submittedPayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading / error screens ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading premium data…</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex max-w-md items-start gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-slate-900">Could not load premiums</p>
            <p className="mt-1 text-sm text-slate-600">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold">Premium Review</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            We tried to find these premiums from the documents you provided. Please add any missing
            premiums or correct any that look wrong.
          </p>
        </div>

        {/* Plans table */}
        {rows.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-500">No plans found for your company.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4">
              <p className="text-sm text-slate-500">Premiums by plan and tier</p>
            </div>

            <div className="space-y-8">
              {Object.entries(groupedRows).map(([benefitType, plans]) => (
                <section key={benefitType}>
                  <h3 className="mb-3 text-base font-semibold text-slate-950">{benefitType}</h3>

                  <div className="space-y-4">
                    {plans.map(({ plan_name, rows: tierRows }) => (
                      <div
                        key={tierRows[0].plan_id}
                        className="overflow-hidden rounded-xl border border-slate-200"
                      >
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="font-medium text-slate-950">{plan_name}</p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
                              <tr>
                                <th className="px-4 py-3 font-medium">Tier</th>
                                <th className="px-4 py-3 font-medium">Found Premium</th>
                                <th className="px-4 py-3 font-medium">Add or Correct Premium</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {tierRows.map((row) => {
                                const found = getFoundPremium(row);
                                const value = userInputs[row.id] ?? "";
                                const invalid =
                                  value !== "" &&
                                  (Number.isNaN(Number(value)) || Number(value) < 0);

                                return (
                                  <tr key={row.id}>
                                    <td className="px-4 py-3 font-medium text-slate-950">
                                      {row.tier_key}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                      {found === null ? (
                                        <span className="text-slate-400">—</span>
                                      ) : (
                                        formatCurrency(found)
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={value}
                                        onChange={(e) => updateInput(row.id, e.target.value)}
                                        placeholder="Add or correct premium"
                                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 ${
                                          invalid ? "border-red-300" : "border-slate-300"
                                        }`}
                                      />
                                      {invalid && (
                                        <p className="mt-1 text-xs text-red-600">
                                          Enter a valid amount.
                                        </p>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* Upload section */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Upload premiums document</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload a renewal, invoice, or rate sheet if it contains the premiums.
          </p>

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-950">Choose file</p>
                <p className="text-sm text-slate-500">PDF, XLSX, CSV, PNG, or JPG</p>
              </div>
            </div>
            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
          </label>

          {files.length > 0 && (
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              {files.map((f) => (
                <p key={f.name}>{f.name}</p>
              ))}
            </div>
          )}

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-950">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about the premiums or uploaded document"
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        {/* Validation / error banners */}
        {!canSubmit && !isLoading && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Add at least one premium or upload a document that includes the premiums.</p>
          </div>
        )}

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Premium Information
          </button>
        </div>
      </div>
    </form>
  );
}
