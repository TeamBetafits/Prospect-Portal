"use client";

import React from "react";
import { formatFieldValue, normalizeDateInput, normalizeFieldValue } from "./formatters";
import type { FieldRendererProps } from "./types";

const inputClassName =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-[14px] text-neutral-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100 disabled:text-neutral-400";

export function FieldRenderer<TRecord extends Record<string, unknown> = Record<string, unknown>>({
  field,
  value,
  mode,
  error,
  disabled,
  onChange,
}: FieldRendererProps<TRecord>) {
  const fieldId = `field-${field.key}`;
  const readValue = formatFieldValue(field, value);

  if (mode === "read" || field.readOnly || field.type === "readonly") {
    return (
      <div className="space-y-1">
        <dt className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">{field.label}</dt>
        <dd className={readValue === "-" ? "text-[14px] italic text-neutral-400" : "text-[14px] font-semibold text-neutral-900"}>
          {readValue}
        </dd>
      </div>
    );
  }

  const handleChange = (nextValue: unknown) => onChange?.(field.key, nextValue);
  const handleBlur = () => onChange?.(field.key, normalizeFieldValue(field, value));

  return (
    <label htmlFor={fieldId} className="block space-y-2 text-[13px] font-semibold text-neutral-700">
      <span>
        {field.label}
        {field.validation?.required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {field.type === "textarea" ? (
        <textarea
          id={fieldId}
          value={String(value ?? "")}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          rows={3}
          className={`${inputClassName} h-auto py-2`}
        />
      ) : field.type === "singleSelect" ? (
        <select
          id={fieldId}
          value={String(value ?? "")}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClassName}
        >
          <option value="">Select...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <input
          id={fieldId}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => handleChange(event.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-100"
        />
      ) : (
        <input
          id={fieldId}
          type={field.type === "phone" || field.type === "url" ? "text" : field.type}
          value={field.type === "date" ? normalizeDateInput(value) : String(value ?? "")}
          onChange={(event) => handleChange(event.target.value)}
          disabled={disabled}
          className={inputClassName}
        />
      )}
      {field.optionsStatus === "unresolved" && field.type.includes("Select") ? (
        <span className="block text-xs font-normal text-amber-600">Options not yet defined in the data dictionary.</span>
      ) : null}
      {error ? <span className="block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

export function FieldGroupRenderer<TRecord extends Record<string, unknown> = Record<string, unknown>>({
  fields,
  values,
  mode,
  errors = {},
  disabled,
  onChange,
}: {
  fields: FieldRendererProps<TRecord>["field"][];
  values: Partial<TRecord>;
  mode: "read" | "edit";
  errors?: Record<string, string>;
  disabled?: boolean;
  onChange?: (key: keyof TRecord & string, value: unknown) => void;
}) {
  return (
    <dl className={mode === "read" ? "grid grid-cols-1 gap-6 md:grid-cols-2" : "grid grid-cols-1 gap-5 md:grid-cols-2"}>
      {fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={values[field.key as keyof TRecord]}
          mode={mode}
          error={errors[field.key]}
          disabled={disabled}
          onChange={onChange}
        />
      ))}
    </dl>
  );
}
