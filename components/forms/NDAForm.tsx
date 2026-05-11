// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { mapNdaFormToSupabasePayloads } from "@/lib/mappings/ndaMapping";

const months = [
  "January 1",
  "February 1",
  "March 1",
  "April 1",
  "May 1",
  "June 1",
  "July 1",
  "August 1",
  "September 1",
  "October 1",
  "November 1",
  "December 1",
];

const initialValues = {
  ndaRequested: "",
  companyLegalName: "",
  entityStateFormation: "",
  entityType: "",
  userIsNdaSigner: "",
  ndaSignerName: "",
  ndaSignerTitle: "",
  ndaSignerEmail: "",
  legalNameOfEntity: "",
  entityTypeDetailed: "",
  entityStateFormationDetailed: "",
  employerIdentificationNumber: "",
  benefitStartMonth: "",
};

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-[15px] font-medium text-slate-950">
      {children}
      {required ? <span className="ml-1 text-slate-500">*</span> : null}
    </label>
  );
}

function TextInput({ label, value, onChange, type = "text", required = false, error }) {
  return (
    <div className="w-full">
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full rounded-md border bg-white px-3 text-[15px] text-slate-900 outline-none transition focus:border-[#85b84a] focus:ring-2 focus:ring-[#85b84a]/20 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function RadioCards({ label, helper, value, onChange, required = false, error }) {
  const options = ["Yes", "No"];

  return (
    <div className="w-full">
      <FieldLabel required={required}>{label}</FieldLabel>
      {helper ? <p className="-mt-1 mb-5 max-w-2xl text-[15px] leading-snug text-slate-400">{helper}</p> : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`flex h-11 items-center rounded-md border px-4 text-left text-[15px] transition ${
                selected
                  ? "border-[#86b94d] bg-white ring-1 ring-[#86b94d]"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <span
                className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border ${
                  selected ? "border-[#86b94d]" : "border-slate-300"
                }`}
              >
                {selected ? <span className="h-3 w-3 rounded-full bg-[#86b94d]" /> : null}
              </span>
              <span className="text-slate-800">{option}</span>
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectInput({ label, value, onChange, required = false, error }) {
  return (
    <div className="w-full">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full appearance-none rounded-md border bg-white px-3 pr-10 text-[15px] text-slate-900 outline-none transition focus:border-[#85b84a] focus:ring-2 focus:ring-[#85b84a]/20 ${
            error ? "border-red-300" : "border-slate-300"
          }`}
        >
          <option value="">Select a month</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-300">⌄</span>
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function NDAForm({ initialValues: loadedInitialValues = {}, onSubmit, isSubmitting = false, companyId = undefined }: any) {
  const [values, setValues] = useState({ ...initialValues, ...loadedInitialValues });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (loadedInitialValues && Object.keys(loadedInitialValues).length) {
      setValues((current) => ({ ...current, ...loadedInitialValues }));
    }
  }, [loadedInitialValues]);

  const showNdaFields = values.ndaRequested === "Yes";
  const showAlternateSigner = showNdaFields && values.userIsNdaSigner === "No";

  const visibleValues = useMemo(() => {
    if (values.ndaRequested === "No") {
      return {
        ndaRequested: values.ndaRequested,
        benefitStartMonth: values.benefitStartMonth,
      };
    }

    return {
      ...values,
      ...(values.userIsNdaSigner === "Yes"
        ? {
            ndaSignerName: "",
            ndaSignerTitle: "",
            ndaSignerEmail: "",
          }
        : {}),
    };
  }, [values]);

  function updateField(field, nextValue) {
    setValues((current) => {
      const next = { ...current, [field]: nextValue };

      if (field === "ndaRequested" && nextValue === "No") {
        next.companyLegalName = "";
        next.entityStateFormation = "";
        next.entityType = "";
        next.userIsNdaSigner = "";
        next.ndaSignerName = "";
        next.ndaSignerTitle = "";
        next.ndaSignerEmail = "";
        next.legalNameOfEntity = "";
        next.entityTypeDetailed = "";
        next.entityStateFormationDetailed = "";
        next.employerIdentificationNumber = "";
      }

      if (field === "userIsNdaSigner" && nextValue === "Yes") {
        next.ndaSignerName = "";
        next.ndaSignerTitle = "";
        next.ndaSignerEmail = "";
      }

      return next;
    });

    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors = {};

    if (!values.ndaRequested) {
      nextErrors.ndaRequested = "Choose Yes or No.";
    }

    if (!values.benefitStartMonth) {
      nextErrors.benefitStartMonth = "Select the benefit start month.";
    }

    if (showNdaFields && !values.userIsNdaSigner) {
      nextErrors.userIsNdaSigner = "Choose Yes or No.";
    }

    if (showAlternateSigner) {
      if (!values.ndaSignerName.trim()) nextErrors.ndaSignerName = "Enter the signer name.";
      if (!values.ndaSignerTitle.trim()) nextErrors.ndaSignerTitle = "Enter the signer title.";
      if (!values.ndaSignerEmail.trim()) {
        nextErrors.ndaSignerEmail = "Enter the signer email.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.ndaSignerEmail)) {
        nextErrors.ndaSignerEmail = "Enter a valid email address.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const mappedPayloads = mapNdaFormToSupabasePayloads(visibleValues, {
      companyId: companyId ?? "00000000-0000-0000-0000-000000000000",
    });

    console.log("Submitted NDA intake", visibleValues);
    console.log("Mapped NDA payloads", mappedPayloads);

    try {
      await onSubmit(visibleValues, mappedPayloads);
      setSubmitted(true);
    } catch (error) {
      console.error("[NDAForm] Submit failed", error);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-start justify-center bg-[#f4f5f7] px-4 py-14 text-slate-950">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex min-h-[230px] w-full max-w-[760px] flex-col items-center justify-center rounded-lg bg-white px-8 py-12 shadow-sm"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f2f8e9]">
            <span className="text-3xl font-bold leading-none text-[#86b94d]">✓</span>
          </div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900">Thank you</h1>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-10 text-slate-950">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[760px] rounded-lg bg-white px-8 py-7 shadow-sm"
      >
        <div className="space-y-5">
          <RadioCards
            label="Non - Disclosure Agreement (NDA) (Optional)"
            helper="Would you like Betafits to sign an NDA before you upload any company and employee information. This will be sent separately via HelloSign."
            value={values.ndaRequested}
            onChange={(value) => updateField("ndaRequested", value)}
            required
            error={errors.ndaRequested}
          />

          {showNdaFields ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-5 overflow-hidden"
            >
              <TextInput
                label="What is the company's full legal name?"
                value={values.companyLegalName}
                onChange={(value) => updateField("companyLegalName", value)}
              />

              <TextInput
                label="What is the entity's state of formation?"
                value={values.entityStateFormation}
                onChange={(value) => updateField("entityStateFormation", value)}
              />

              <TextInput
                label="What is the entity type?"
                value={values.entityType}
                onChange={(value) => updateField("entityType", value)}
              />

              <RadioCards
                label="Will you be the signer for the NDA?"
                value={values.userIsNdaSigner}
                onChange={(value) => updateField("userIsNdaSigner", value)}
                required
                error={errors.userIsNdaSigner}
              />

              {showAlternateSigner ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <TextInput
                      label="Name of the NDA Signer"
                      value={values.ndaSignerName}
                      onChange={(value) => updateField("ndaSignerName", value)}
                      required
                      error={errors.ndaSignerName}
                    />
                    <TextInput
                      label="Title of the NDA Signer"
                      value={values.ndaSignerTitle}
                      onChange={(value) => updateField("ndaSignerTitle", value)}
                      required
                      error={errors.ndaSignerTitle}
                    />
                  </div>

                  <TextInput
                    label="Email of the NDA Signer"
                    type="email"
                    value={values.ndaSignerEmail}
                    onChange={(value) => updateField("ndaSignerEmail", value)}
                    required
                    error={errors.ndaSignerEmail}
                  />
                </motion.div>
              ) : null}

              <TextInput
                label="What is the Legal Name of the Entity?"
                value={values.legalNameOfEntity}
                onChange={(value) => updateField("legalNameOfEntity", value)}
              />

              <TextInput
                label="Entity Type (Corporation, LLC, etc.)"
                value={values.entityTypeDetailed}
                onChange={(value) => updateField("entityTypeDetailed", value)}
              />

              <TextInput
                label="What is the Entity State of Formation?"
                value={values.entityStateFormationDetailed}
                onChange={(value) => updateField("entityStateFormationDetailed", value)}
              />

              <TextInput
                label="Employer Identification Number"
                value={values.employerIdentificationNumber}
                onChange={(value) => updateField("employerIdentificationNumber", value)}
              />
            </motion.div>
          ) : null}

          <SelectInput
            label="Expected Benefit Start Month or Renewal of Medical Coverage"
            value={values.benefitStartMonth}
            onChange={(value) => updateField("benefitStartMonth", value)}
            required
            error={errors.benefitStartMonth}
          />

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#8abd4f] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#7eae49] focus:outline-none focus:ring-2 focus:ring-[#8abd4f]/40 focus:ring-offset-2"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </motion.form>
    </main>
  );
}
