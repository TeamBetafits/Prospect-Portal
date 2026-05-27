import type React from "react";

export type FieldInputType =
  | "text"
  | "email"
  | "phone"
  | "url"
  | "date"
  | "number"
  | "singleSelect"
  | "multiSelect"
  | "checkbox"
  | "textarea"
  | "readonly";

export type FieldFormat = "ein" | "phone" | "url" | "zip" | "date" | "number" | "boolean" | "array" | "text";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  required?: boolean;
  pattern?: string;
  message?: string;
}

export interface FieldDefinition<TRecord extends Record<string, unknown> = Record<string, unknown>> {
  key: keyof TRecord & string;
  label: string;
  type: FieldInputType;
  format?: FieldFormat;
  options?: FieldOption[];
  optionsStatus?: "resolved" | "unresolved" | "not_applicable";
  description?: string;
  readOnly?: boolean;
  validation?: FieldValidation;
  source?: {
    table: string;
    field: string;
    source: "data_dictionary" | "schema" | "observed";
  };
}

export interface FieldGroup<TRecord extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  title: string;
  description?: string;
  fields: FieldDefinition<TRecord>[];
}

export type FieldRegistry<TRecord extends Record<string, unknown> = Record<string, unknown>> = FieldGroup<TRecord>[];

export type EditPayload<TRecord extends Record<string, unknown> = Record<string, unknown>> = Partial<TRecord>;

export interface FieldRendererProps<TRecord extends Record<string, unknown> = Record<string, unknown>> {
  field: FieldDefinition<TRecord>;
  value: unknown;
  mode: "read" | "edit";
  error?: string;
  disabled?: boolean;
  onChange?: (key: keyof TRecord & string, value: unknown) => void;
}

export interface FieldRendererComponent {
  <TRecord extends Record<string, unknown> = Record<string, unknown>>(props: FieldRendererProps<TRecord>): React.ReactElement;
}
