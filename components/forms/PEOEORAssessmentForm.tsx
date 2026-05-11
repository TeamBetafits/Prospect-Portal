// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  mapPeoEorFormToSupabasePayloads as mapPeoEorFormToSupabasePayloadsShared,
  normalizeText,
  normalizeList,
  normalizeNumber,
} from "@/lib/mappings/peoEorMapping";

const steps = ["PEO\nInformation", "EOR\nInformation", "Document\nUploads", "Review &\nSubmit"];

const peoProviders = ["Justworks", "ADP TotalSource", "TriNet", "Insperity", "Sequoia One", "Paychex", "Rippling", "PEO Spectrum", "Other"];
const evaluatedPeos = ["Justworks", "ADP TotalSource", "TriNet", "Insperity", "Sequoia One", "Paychex", "Rippling", "Other"];
const peoConsiderations = ["Low Admin Fees", "Benefits Costs", "Customer Support", "Ease of Administration", "Technology & Automation", "Multi-State Compliance", "International Support", "Other"];
const peoDecidedAgainstReasons = ["Cost (too expensive)", "Complexity (too many layers/processes)", "Lack of clear value", "Prefer in-house management", "Other"];

const eorVendorOptions = ["Deel", "Papaya", "Remote", "Oyster", "Global", "Other"];
const currentEorOptions = ["Deel", "Papaya", "Remote", "Oyster", "G-P (Globalization Partners)", "Other – please specify in Notes column"];
const currencyOptions = ["USD", "EUR", "GBP"];
const countryOptions = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark", "France", "Germany", "Ghana", "India", "Ireland", "Italy", "Japan", "Kenya", "Mexico", "Netherlands", "Nigeria", "Poland", "Portugal", "Singapore", "South Africa", "Spain", "Sweden", "United Arab Emirates", "United Kingdom", "United States"
];

const initialRow = () => ({
  country: "",
  fullTimeEmployees: "",
  partTimeEmployees: "",
  contractors: "",
  currentEor: "",
  otherEorName: "",
  monthlyCost: "",
  currencyPaidIn: "",
  notes: "",
});

const initialForm = {
  currentlyUsePeo: "",
  currentPeoProvider: "",
  currentPeoProviderOther: "",
  openToSwitching: "",
  evaluatedPeos: [],
  evaluatedPeosOther: "",
  peoTopConsiderations: [],
  peoTopConsiderationsOther: "",
  peoDecidedAgainstReasons: [],
  peoDecidedAgainstReasonsOther: "",
  currentlyUseEor: "",
  eorVendorsUsed: [],
  eorRows: [initialRow()],
  currentEorInvoice: null,
  otherDetails: "",
};

const SELF_TEST_THRESHOLD = 0.9;

export function mapPeoEorFormToSupabasePayloads(form, options = {}) {
  return mapPeoEorFormToSupabasePayloadsShared(form, options);
}

const testCases = [
  { name: "top considerations caps at 3", run: () => capSelection(["A", "B", "C"], "D", 3).length === 3 },
  { name: "toggling selected item removes it", run: () => capSelection(["A", "B"], "A", 3).join(",") === "B" },
  { name: "withOther merges custom label", run: () => withOther(["Other"], "Custom")[0] === "Other: Custom" },
  { name: "withOther keeps original when no other text", run: () => withOther(["Other"], "")[0] === "Other" },
  { name: "empty review values are detected", run: () => isEmptyReviewValue("") && isEmptyReviewValue([]) && !isEmptyReviewValue("Yes") },
  { name: "normalizeList dedupes and trims", run: () => normalizeList([" Deel ", "Deel", ""]).length === 1 },
  { name: "normalizeNumber rejects invalid input", run: () => normalizeNumber("abc") == null && normalizeNumber("") == null },
  { name: "map uses Other PEO provider text", run: () => {
      const mapped = mapPeoEorFormToSupabasePayloads({ ...initialForm, currentPeoProvider: "Other", currentPeoProviderOther: "Custom PEO" }, {});
      return mapped.context_engine_payload.current_peo === "Custom PEO";
    }
  },
  { name: "map includes decided-against reasons only in considered path", run: () => {
      const mapped = mapPeoEorFormToSupabasePayloads({ ...initialForm, currentlyUsePeo: "considered_decided_against", peoDecidedAgainstReasons: ["Cost (too expensive)"] }, {});
      return (mapped.client_data.loss_reasons || "").includes("Cost");
    }
  },
  { name: "map filters out empty EOR rows", run: () => {
      const mapped = mapPeoEorFormToSupabasePayloads({ ...initialForm, eorRows: [initialRow()] }, {});
      return Array.isArray(mapped.context_engine_payload.eor_rows) && mapped.context_engine_payload.eor_rows.length === 0;
    }
  },
  { name: "map preserves non-empty EOR row numbers", run: () => {
      const row = { ...initialRow(), country: "United States", fullTimeEmployees: "10", partTimeEmployees: "2" };
      const mapped = mapPeoEorFormToSupabasePayloads({ ...initialForm, eorRows: [row] }, {});
      return mapped.context_engine_payload.eor_rows[0].number_of_employees_ft_pt.full_time_employees === 10;
    }
  },
  { name: "map includes file name when invoice exists", run: () => {
      const mapped = mapPeoEorFormToSupabasePayloads({ ...initialForm, currentEorInvoice: { name: "invoice.pdf" } }, {});
      return mapped.documents_and_artifacts.file_name === "invoice.pdf";
    }
  },
];

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Icon({ name, size = 22, className = "" }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", className };
  if (name === "check") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (name === "down") return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>;
  if (name === "up") return <svg {...common}><path d="m18 15-6-6-6 6" /></svg>;
  if (name === "folder") return <svg {...common}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" fill="currentColor" stroke="none" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "right") return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
  if (name === "left") return <svg {...common}><path d="M19 12H5M11 5l-7 7 7 7" /></svg>;
  if (name === "x") return <svg {...common}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  return null;
}

function FieldLabel({ children, required = false }) {
  return <label className="block text-[18px] font-medium leading-snug text-slate-900">{children}{required && <span className="ml-1">*</span>}</label>;
}

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="mb-5 flex w-full items-center justify-between rounded-lg bg-blue-100 px-5 py-3 text-left text-[19px] font-medium text-blue-700">
        <span>{title}</span>
        <Icon name={open ? "up" : "down"} />
      </button>
      {open && children}
    </div>
  );
}

function RadioCard({ selected, label, onClick, className = "" }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex min-h-[58px] w-full items-center gap-4 rounded-lg border bg-white px-4 text-left text-[18px] leading-tight text-slate-700 shadow-sm transition", selected ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300", className)}>
      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-blue-500 ring-2 ring-blue-300" : "border-slate-300")}>{selected && <span className="h-3 w-3 rounded-full bg-blue-500" />}</span>
      <span>{label}</span>
    </button>
  );
}

function OtherRadioInput({ value, onChange, onSelect, selected }) {
  return (
    <div onClick={onSelect} className={cn("flex min-h-[58px] w-full cursor-text items-center rounded-lg border bg-white px-4 shadow-sm transition", selected ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200 hover:border-slate-300")}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type your answer" className="min-w-0 flex-1 bg-transparent text-[18px] text-slate-700 outline-none placeholder:text-slate-400" />
      <span className="ml-3 flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white"><Icon name="check" size={18} /></span>
    </div>
  );
}

function CheckboxRow({ checked, label, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 py-2 text-[18px] text-slate-700">
      <span className={cn("flex h-5 w-5 items-center justify-center rounded border", checked ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 bg-white")}>{checked && <Icon name="check" size={15} />}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span>{label}</span>
    </label>
  );
}

function TextInput({ value, onChange, placeholder = "Type your answer" }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-12 w-full rounded-md border border-slate-200 px-4 text-[18px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />;
}

function Progress({ current, submitted }) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100/95 px-8 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-[980px] items-center justify-between gap-6">
        {steps.map((step, index) => {
          const complete = submitted || index < current;
          const active = !submitted && index === current;
          return (
            <React.Fragment key={step}>
              <div className="flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold", complete ? "border-blue-400 bg-blue-400 text-white" : active ? "border-blue-500 bg-white text-blue-500" : "border-slate-300 bg-white text-slate-300")}>
                  {complete ? <Icon name="check" /> : active ? <span className="h-3 w-3 rounded-full bg-blue-500" /> : null}
                </div>
                <div className={cn("whitespace-pre-line text-[18px] leading-tight", complete || active ? "text-blue-500" : "text-slate-400")}>{step}</div>
              </div>
              {index < steps.length - 1 && <div className={cn("h-px min-w-[90px] flex-1", complete ? "bg-blue-400" : "bg-slate-400")} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function useFloatingDropdown(open, triggerRef, minWidth = 0) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const availableBelow = window.innerHeight - rect.bottom - 8;
      const preferredHeight = Math.min(260, Math.max(160, availableBelow));
      setStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, minWidth),
        maxHeight: preferredHeight,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, triggerRef, minWidth]);

  return style;
}

function useCloseOnOutsideClick(open, onClose, refs) {
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      const target = event.target;
      const clickedInside = refs.some((ref) => ref.current && ref.current.contains(target));
      if (!clickedInside) onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, refs]);
}

function MultiSelect({ value, onChange, options, placeholder = "" }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const dropdownStyle = useFloatingDropdown(open, triggerRef);
  const remaining = options.filter((option) => !value.includes(option));

  useCloseOnOutsideClick(open, () => setOpen(false), [triggerRef, menuRef]);

  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={() => setOpen(!open)} className={cn("flex min-h-12 w-full items-center rounded-md border bg-white px-3 text-left text-[17px] outline-none", open ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200")}>
        <div className="flex flex-1 flex-wrap gap-2">
          {value.length === 0 && <span className="text-slate-400">{placeholder}</span>}
          {value.map((chip) => <span key={chip} className="inline-flex items-center gap-2 rounded-sm bg-blue-500 px-2 py-1 text-sm font-medium text-white">{chip}<span onClick={(e) => { e.stopPropagation(); onChange(value.filter((v) => v !== chip)); }}><Icon name="x" size={14} /></span></span>)}
        </div>
        {value.length > 0 && <span onClick={(e) => { e.stopPropagation(); onChange([]); }} className="mr-3 text-slate-300 hover:text-slate-500"><Icon name="x" size={18} /></span>}
        <span className="border-l border-slate-100 pl-3 text-slate-300"><Icon name="down" /></span>
      </button>
      {open && <div ref={menuRef} style={dropdownStyle} className="overflow-auto rounded-sm border border-slate-200 bg-white text-[18px] text-slate-600 shadow-lg">{remaining.map((option, idx) => <button key={option} type="button" onClick={() => onChange([...value, option])} className={cn("block w-full px-4 py-2 text-left hover:bg-slate-100", idx === 0 && "bg-slate-200")}>{option}</button>)}</div>}
    </div>
  );
}

function SelectCell({ value, onChange, options, width = 200 }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const dropdownStyle = useFloatingDropdown(open, triggerRef, width);

  useCloseOnOutsideClick(open, () => setOpen(false), [triggerRef, menuRef]);

  return (
    <div className="relative" style={{ width }}>
      <button ref={triggerRef} type="button" onClick={() => setOpen(!open)} className={cn("flex h-12 w-full items-center justify-between border border-transparent bg-white px-3 text-left text-[17px] outline-none", open ? "border-blue-500 ring-1 ring-blue-500" : "")}>
        <span className={value ? "text-slate-700" : "text-slate-400"}>{value || "Select..."}</span>
        <span className="flex items-center gap-2 text-slate-300">{value && <span onClick={(e) => { e.stopPropagation(); onChange(""); }}><Icon name="x" size={18} /></span>}<Icon name="down" size={20} /></span>
      </button>
      {open && <div ref={menuRef} style={dropdownStyle} className="overflow-auto rounded-sm border border-slate-200 bg-white text-[17px] text-slate-600 shadow-lg">{options.map((option, idx) => <button key={option} type="button" onClick={() => { onChange(option); setOpen(false); }} className={cn("block w-full px-4 py-2 text-left hover:bg-slate-100", idx === 0 && "bg-slate-200")}>{option}</button>)}</div>}
    </div>
  );
}

function NumberCell({ value, onChange, width = 200 }) {
  return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-12 border border-transparent bg-white px-4 text-[17px] text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" style={{ width }} />;
}

function TextCell({ value, onChange, width = 220 }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} className="h-12 border border-transparent bg-white px-4 text-[17px] text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" style={{ width }} />;
}

function EorTable({ rows, setRows }) {
  const hasAnyValue = rows.some((row) => Object.values(row).some(Boolean));
  const updateRow = (index, key, value) => setRows(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  const columns = [
    { label: "Country", width: 200 },
    { label: "Number of Full-Time Employees", width: 200 },
    { label: "Number of Part-Time Employees", width: 200 },
    { label: "Number of Contractors", width: 200 },
    { label: "Current EOR (if applicable)", width: 200 },
    { label: "EOR name (if you chose ‘Other’)", width: 220 },
    { label: "Monthly Cost per Employee/Contractor (enter number only)", width: 220 },
    { label: "Currency Paid In", width: 200 },
    { label: "Notes or Issues in that Country", width: 240 },
  ];
  return (
    <div>
      <div className="overflow-x-auto border-t border-slate-200 pb-3">
        <div className="min-w-[1880px]">
          <div className="flex">{columns.map((column) => <div key={column.label} className="min-h-32 border-r border-slate-200 bg-slate-100 px-5 py-4 text-[18px] leading-snug text-slate-700" style={{ width: column.width }}>{column.label}</div>)}</div>
          {rows.map((row, index) => <div key={index} className="flex border-b border-slate-200">
            <SelectCell value={row.country} onChange={(value) => updateRow(index, "country", value)} options={countryOptions} width={200} />
            <NumberCell value={row.fullTimeEmployees} onChange={(value) => updateRow(index, "fullTimeEmployees", value)} />
            <NumberCell value={row.partTimeEmployees} onChange={(value) => updateRow(index, "partTimeEmployees", value)} />
            <NumberCell value={row.contractors} onChange={(value) => updateRow(index, "contractors", value)} />
            <SelectCell value={row.currentEor} onChange={(value) => updateRow(index, "currentEor", value)} options={currentEorOptions} width={200} />
            <TextCell value={row.otherEorName} onChange={(value) => updateRow(index, "otherEorName", value)} width={220} />
            <NumberCell value={row.monthlyCost} onChange={(value) => updateRow(index, "monthlyCost", value)} width={220} />
            <SelectCell value={row.currencyPaidIn} onChange={(value) => updateRow(index, "currencyPaidIn", value)} options={currencyOptions} width={200} />
            <TextCell value={row.notes} onChange={(value) => updateRow(index, "notes", value)} width={240} />
          </div>)}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-5">
        <button type="button" onClick={() => setRows([...rows, initialRow()])} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-5 py-3 text-[18px] font-medium text-slate-600 shadow-sm"><Icon name="plus" size={24} /> Add</button>
        {hasAnyValue && <button type="button" onClick={() => setRows([initialRow()])} className="text-[17px] text-slate-500 underline underline-offset-2">Clear</button>}
      </div>
    </div>
  );
}

function FormShell({ children }) {
  return <main className="mx-auto my-16 w-full max-w-[820px] rounded-lg bg-white p-9 shadow-sm">{children}</main>;
}

function PeoPage({ form, setForm, next }) {
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleArray = (key, item, max) => set({ [key]: capSelection(form[key], item, max) });
  return (
    <FormShell>
      <Section title="PEO Information">
        <div className="space-y-6">
          <FieldLabel>Do you currently use a PEO?</FieldLabel>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <RadioCard selected={form.currentlyUsePeo === "yes"} label="Yes" onClick={() => set({ currentlyUsePeo: "yes" })} />
            <RadioCard selected={form.currentlyUsePeo === "never_considered"} label={<>No, we have never considered a<br />PEO</>} onClick={() => set({ currentlyUsePeo: "never_considered" })} />
            <RadioCard selected={form.currentlyUsePeo === "considered_decided_against"} label={<>No, we have considered but<br />decided against</>} onClick={() => set({ currentlyUsePeo: "considered_decided_against" })} />
          </div>
          {form.currentlyUsePeo === "yes" && <>
            <FieldLabel>Which PEO do you use?</FieldLabel>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{peoProviders.map((provider) => provider === "Other" && form.currentPeoProvider === "Other" ? <OtherRadioInput key={provider} selected value={form.currentPeoProviderOther} onSelect={() => set({ currentPeoProvider: "Other" })} onChange={(value) => set({ currentPeoProviderOther: value })} /> : <RadioCard key={provider} selected={form.currentPeoProvider === provider} label={provider} onClick={() => set({ currentPeoProvider: provider })} />)}</div>
            <FieldLabel>Would you be open to switching to another PEO or to a payroll-only solution?</FieldLabel>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{["Yes", "No", "Not sure"].map((option) => <RadioCard key={option} selected={form.openToSwitching === option} label={option} onClick={() => set({ openToSwitching: option })} />)}</div>
            <FieldLabel>Which PEOs have you evaluated?</FieldLabel>
            <div className="grid grid-cols-1 gap-x-16 md:grid-cols-2">{evaluatedPeos.map((option) => <CheckboxRow key={option} checked={form.evaluatedPeos.includes(option)} label={option} onChange={() => toggleArray("evaluatedPeos", option)} />)}</div>
            {form.evaluatedPeos.includes("Other") && <TextInput value={form.evaluatedPeosOther} onChange={(value) => set({ evaluatedPeosOther: value })} />}
            <div><FieldLabel required>What are your top considerations when exploring a PEO?</FieldLabel><div className="mt-1 text-[17px] text-slate-400">Select up to 3 reasons</div></div>
            <div>{peoConsiderations.map((option) => <CheckboxRow key={option} checked={form.peoTopConsiderations.includes(option)} label={option} onChange={() => toggleArray("peoTopConsiderations", option, 3)} />)}</div>
            {form.peoTopConsiderations.includes("Other") && <TextInput value={form.peoTopConsiderationsOther} onChange={(value) => set({ peoTopConsiderationsOther: value })} />}
          </>}
          {form.currentlyUsePeo === "considered_decided_against" && <>
            <FieldLabel>What were the main reasons you decided not to use a PEO?</FieldLabel>
            <div>{peoDecidedAgainstReasons.map((option) => <CheckboxRow key={option} checked={form.peoDecidedAgainstReasons.includes(option)} label={option} onChange={() => toggleArray("peoDecidedAgainstReasons", option)} />)}</div>
            {form.peoDecidedAgainstReasons.includes("Other") && <TextInput value={form.peoDecidedAgainstReasonsOther} onChange={(value) => set({ peoDecidedAgainstReasonsOther: value })} />}
          </>}
          <div className="flex justify-center pt-2"><NextButton onClick={next} /></div>
        </div>
      </Section>
    </FormShell>
  );
}

function EorPage({ form, setForm, next }) {
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  return (
    <FormShell>
      <Section title="EOR Information">
        <div className="space-y-6">
          <FieldLabel>Do you currently use an EOR?</FieldLabel>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><RadioCard selected={form.currentlyUseEor === "yes"} label="Yes" onClick={() => set({ currentlyUseEor: "yes" })} /><RadioCard selected={form.currentlyUseEor === "no"} label="No" onClick={() => set({ currentlyUseEor: "no" })} /></div>
          {form.currentlyUseEor === "yes" && <><div><FieldLabel>EOR Vendors You’ve Used</FieldLabel><div className="mt-3"><MultiSelect value={form.eorVendorsUsed} onChange={(value) => set({ eorVendorsUsed: value })} options={eorVendorOptions} /></div></div><div><FieldLabel>EOR Countries & Workforce Details</FieldLabel><div className="mt-3"><EorTable rows={form.eorRows} setRows={(value) => set({ eorRows: value })} /></div></div></>}
          <div className="flex justify-center pt-2"><NextButton onClick={next} /></div>
        </div>
      </Section>
    </FormShell>
  );
}

function UploadPage({ form, setForm, next }) {
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  return (
    <FormShell>
      <Section title="Document Uploads">
        <div className="space-y-8">
          <div><FieldLabel>Upload current EOR Invoice</FieldLabel><label className="mt-4 flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500"><Icon name="folder" size={25} className="mb-2" /><span className="text-[18px]">{form.currentEorInvoice?.name || <>Drag & drop a file or <span className="underline">browse</span></>}</span><input type="file" className="sr-only" onChange={(e) => set({ currentEorInvoice: e.target.files?.[0] || null })} /></label></div>
          <div><FieldLabel>Other details you’d like us to know</FieldLabel><textarea value={form.otherDetails} onChange={(e) => set({ otherDetails: e.target.value })} className="mt-4 h-28 w-full rounded-md border border-slate-200 p-4 text-[18px] text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
          <div className="flex justify-center"><NextButton onClick={next} /></div>
        </div>
      </Section>
    </FormShell>
  );
}

function ReviewPage({ form, goTo, submit, submitting, submitError }) {
  const eorRowsText = form.eorRows.filter((row) => Object.values(row).some(Boolean)).map((row) => ["Country", "Number of Full-Time Employees", "Number of Part-Time Employees", "Number of Contractors", "Current EOR (if applicable)", "EOR name (if you chose ‘Other’)", "Monthly Cost per Employee/Contractor (enter number only)", "Currency Paid In", "Notes or Issues in that Country", row.country, row.fullTimeEmployees, row.partTimeEmployees, row.contractors, row.currentEor, row.otherEorName, row.monthlyCost, row.currencyPaidIn, row.notes].join(", ")).join("\n");
  return (
    <main className="mx-auto my-16 w-full max-w-[820px] rounded-lg bg-white px-10 py-9 shadow-sm">
      <h1 className="text-[26px] font-bold text-slate-800">Please review your submission.</h1>
      <p className="text-[18px] text-slate-500">Update any relevant information as needed.</p>
      <ReviewSection onEdit={() => goTo(0)}>
        <ReviewRow label="Do you currently use a PEO?" value={reviewValue(peoValueLabel(form.currentlyUsePeo))} />
        {form.currentlyUsePeo === "yes" && <><ReviewRow label="Which PEO do you use?" value={reviewValue(form.currentPeoProvider === "Other" ? form.currentPeoProviderOther : form.currentPeoProvider)} /><ReviewRow label="Would you be open to switching to another PEO or to a payroll-only solution?" value={reviewValue(form.openToSwitching)} /><ReviewRow label="Which PEOs have you evaluated?" value={reviewValue(withOther(form.evaluatedPeos, form.evaluatedPeosOther))} /><ReviewRow label="What are your top considerations when exploring a PEO?" value={reviewValue(withOther(form.peoTopConsiderations, form.peoTopConsiderationsOther))} /></>}
        {form.currentlyUsePeo === "considered_decided_against" && <ReviewRow label="What were the main reasons you decided not to use a PEO?" value={reviewValue(withOther(form.peoDecidedAgainstReasons, form.peoDecidedAgainstReasonsOther))} />}
      </ReviewSection>
      <ReviewSection onEdit={() => goTo(1)}><ReviewRow label="Do you currently use an EOR?" value={reviewValue(form.currentlyUseEor === "yes" ? "Yes" : form.currentlyUseEor === "no" ? "No" : "")} /><ReviewRow label="EOR Vendors You’ve Used" value={reviewValue(form.eorVendorsUsed)} /><ReviewRow label="EOR Countries & Workforce Details" value={reviewValue(eorRowsText)} /></ReviewSection>
      <ReviewSection onEdit={() => goTo(2)}><ReviewRow label="Upload current EOR Invoice" value={reviewValue(form.currentEorInvoice?.name)} /><ReviewRow label="Other details you’d like us to know" value={reviewValue(form.otherDetails)} /></ReviewSection>
      {submitError ? <p className="pt-5 text-right text-sm text-red-600">{submitError}</p> : null}
      <div className="flex justify-end pt-8"><button type="button" onClick={submit} disabled={submitting} className="rounded-md bg-blue-500 px-7 py-3 text-[20px] font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70">{submitting ? "Submitting..." : "Submit"}</button></div>
      <p className="pt-3 text-right text-sm text-slate-400">Never share passwords in Fillout forms.<span className="underline">Report malicious form</span></p>
    </main>
  );
}

function ReviewSection({ children, onEdit }) {
  return <section className="mt-8 border-t border-slate-200 pt-5"><button type="button" onClick={onEdit} className="mb-7 block w-full text-right text-[18px] text-blue-600">Edit</button><div className="space-y-7">{children}</div></section>;
}

function ReviewRow({ label, value }) {
  return <div className="grid grid-cols-[40%_1fr] gap-8 text-[17px] leading-snug"><div className="font-medium text-slate-400">{label}</div><div className="whitespace-pre-wrap text-slate-700">{value}</div></div>;
}

function NextButton({ onClick }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-6 py-3 text-[20px] font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600">Next <Icon name="right" /></button>;
}

function peoValueLabel(value) {
  if (value === "yes") return "Yes";
  if (value === "never_considered") return "No, we have never considered a PEO";
  if (value === "considered_decided_against") return "No, we have considered but decided against";
  return "";
}

function capSelection(current, item, max) {
  const exists = current.includes(item);
  if (exists) return current.filter((x) => x !== item);
  if (max && current.length >= max) return current;
  return [...current, item];
}

function withOther(items, otherText) {
  return items.map((item) => (item === "Other" && otherText ? `Other: ${otherText}` : item));
}

function isEmptyReviewValue(value) {
  return Array.isArray(value) ? value.length === 0 : !value;
}

function reviewValue(value) {
  if (isEmptyReviewValue(value)) return <span className="italic text-slate-400">Unanswered</span>;
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function ThankYou() {
  return <main className="mx-auto mt-16 flex w-full max-w-[740px] items-center justify-center rounded-lg bg-white py-16 shadow-sm"><div className="text-center"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500"><Icon name="check" size={32} /></div><h1 className="text-[32px] font-bold text-slate-800">Thank you</h1></div></main>;
}

function runSelfTests() {
  const results = testCases.map((test) => {
    try {
      return { name: test.name, passed: Boolean(test.run()) };
    } catch {
      return { name: test.name, passed: false };
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const passRate = total === 0 ? 1 : passed / total;

  return {
    results,
    passed,
    total,
    passRate,
    threshold: SELF_TEST_THRESHOLD,
    meetsThreshold: passRate >= SELF_TEST_THRESHOLD,
  };
}

export default function PEOEORAssessmentForm({ initialValues = {}, onSubmit, isSubmitting = false, companyId = null, assignedFormId = null }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ ...initialForm, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const selfTestReport = runSelfTests();
  const testsPass = selfTestReport.meetsThreshold;
  const next = () => setCurrentStep((step) => Math.min(step + 1, 3));
  const back = () => { if (!submitted) setCurrentStep((step) => Math.max(step - 1, 0)); };

  useEffect(() => {
    if (!testsPass) {
      console.warn(
        `Self-tests below threshold: ${Math.round(selfTestReport.passRate * 100)}% < ${Math.round(SELF_TEST_THRESHOLD * 100)}%`
      );
    }
  }, [testsPass, selfTestReport.passRate]);

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const mappedPayloads = mapPeoEorFormToSupabasePayloads(form, { companyId, assignedFormId });
      console.log("Submitted PEO/EOR intake", form);
      console.log("Mapped PEO/EOR payloads", mappedPayloads);
      await onSubmit(form, mappedPayloads);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} data-self-tests={testsPass ? "passed" : "failed"} data-self-tests-threshold={`${Math.round(SELF_TEST_THRESHOLD * 100)}%`} data-self-tests-pass-rate={`${Math.round(selfTestReport.passRate * 100)}%`}>
      <Progress current={currentStep} submitted={submitted} />
      {!submitted && <button type="button" onClick={back} className="fixed left-8 top-8 z-30 text-slate-900" aria-label="Back"><Icon name="left" size={30} /></button>}
      {submitted ? <ThankYou /> : currentStep === 0 ? <PeoPage form={form} setForm={setForm} next={next} /> : currentStep === 1 ? <EorPage form={form} setForm={setForm} next={next} /> : currentStep === 2 ? <UploadPage form={form} setForm={setForm} next={next} /> : <ReviewPage form={form} goTo={setCurrentStep} submit={handleSubmit} submitting={submitting || isSubmitting} submitError={submitError} />}
    </div>
  );
}
