// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { mapBorFormToSupabasePayloads, validateBorFormForMapping } from "@/lib/mappings/appointBetafitsMapping";

function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-hidden="true" fill="currentColor">
      <path d="M28 10c4 0 7 3 7 7v7h58v-7c0-4 3-7 7-7s7 3 7 7v7h7c8 0 14 6 14 14v76c0 8-6 14-14 14H14c-8 0-14-6-14-14V38c0-8 6-14 14-14h7v-7c0-4 3-7 7-7Zm86 45H14v59h100V55ZM14 42h100v-4H14v4Z" />
      <path d="M31 69h16v14H31V69Zm25 0h16v14H56V69Zm25 0h16v14H81V69ZM31 92h16v14H31V92Zm25 0h16v14H56V92Zm25 0h16v14H81V92Z" />
    </svg>
  );
}

function UploadIcon({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-hidden="true" fill="currentColor">
      <path d="M64 9 30 43h21v41h26V43h21L64 9Z" />
      <path d="M17 79c5 0 9 4 9 9v14h76V88c0-5 4-9 9-9s9 4 9 9v23c0 10-8 17-18 17H26c-10 0-18-7-18-17V88c0-5 4-9 9-9Z" />
    </svg>
  );
}

function AddressIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-hidden="true" fill="currentColor">
      <path d="M64 0C38 0 18 20 18 46c0 35 46 82 46 82s46-47 46-82C110 20 90 0 64 0Zm0 69c-13 0-23-10-23-23s10-23 23-23 23 10 23 23-10 23-23 23Z" />
    </svg>
  );
}

const STATE_OPTIONS = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

const COVERAGE_OPTIONS = ["Medical", "Dental", "Vision", "Life", "Disability", "Voluntary Benefits", "Other"];

const COUNTRIES = [
  { code: "AF", flag: "🇦🇫", label: "Afghanistan", dial: "+93" },
  { code: "AL", flag: "🇦🇱", label: "Albania", dial: "+355" },
  { code: "DZ", flag: "🇩🇿", label: "Algeria", dial: "+213" },
  { code: "AD", flag: "🇦🇩", label: "Andorra", dial: "+376" },
  { code: "AO", flag: "🇦🇴", label: "Angola", dial: "+244" },
  { code: "AR", flag: "🇦🇷", label: "Argentina", dial: "+54" },
  { code: "AU", flag: "🇦🇺", label: "Australia", dial: "+61" },
  { code: "AT", flag: "🇦🇹", label: "Austria", dial: "+43" },
  { code: "BE", flag: "🇧🇪", label: "Belgium", dial: "+32" },
  { code: "BR", flag: "🇧🇷", label: "Brazil", dial: "+55" },
  { code: "CA", flag: "🇨🇦", label: "Canada", dial: "+1" },
  { code: "CL", flag: "🇨🇱", label: "Chile", dial: "+56" },
  { code: "CN", flag: "🇨🇳", label: "China", dial: "+86" },
  { code: "CO", flag: "🇨🇴", label: "Colombia", dial: "+57" },
  { code: "CR", flag: "🇨🇷", label: "Costa Rica", dial: "+506" },
  { code: "CI", flag: "🇨🇮", label: "Cote d'Ivoire", dial: "+225" },
  { code: "HR", flag: "🇭🇷", label: "Croatia", dial: "+385" },
  { code: "CU", flag: "🇨🇺", label: "Cuba", dial: "+53" },
  { code: "CW", flag: "🇨🇼", label: "Curacao", dial: "+599" },
  { code: "CY", flag: "🇨🇾", label: "Cyprus", dial: "+357" },
  { code: "CZ", flag: "🇨🇿", label: "Czech Republic", dial: "+420" },
  { code: "DK", flag: "🇩🇰", label: "Denmark", dial: "+45" },
  { code: "DJ", flag: "🇩🇯", label: "Djibouti", dial: "+253" },
  { code: "DM", flag: "🇩🇲", label: "Dominica", dial: "+1" },
  { code: "DO", flag: "🇩🇴", label: "Dominican Republic", dial: "+1" },
  { code: "EC", flag: "🇪🇨", label: "Ecuador", dial: "+593" },
  { code: "EG", flag: "🇪🇬", label: "Egypt", dial: "+20" },
  { code: "SV", flag: "🇸🇻", label: "El Salvador", dial: "+503" },
  { code: "GQ", flag: "🇬🇶", label: "Equatorial Guinea", dial: "+240" },
  { code: "ER", flag: "🇪🇷", label: "Eritrea", dial: "+291" },
  { code: "EE", flag: "🇪🇪", label: "Estonia", dial: "+372" },
  { code: "ET", flag: "🇪🇹", label: "Ethiopia", dial: "+251" },
  { code: "FI", flag: "🇫🇮", label: "Finland", dial: "+358" },
  { code: "FR", flag: "🇫🇷", label: "France", dial: "+33" },
  { code: "DE", flag: "🇩🇪", label: "Germany", dial: "+49" },
  { code: "GH", flag: "🇬🇭", label: "Ghana", dial: "+233" },
  { code: "GR", flag: "🇬🇷", label: "Greece", dial: "+30" },
  { code: "GT", flag: "🇬🇹", label: "Guatemala", dial: "+502" },
  { code: "HK", flag: "🇭🇰", label: "Hong Kong", dial: "+852" },
  { code: "IN", flag: "🇮🇳", label: "India", dial: "+91" },
  { code: "IE", flag: "🇮🇪", label: "Ireland", dial: "+353" },
  { code: "IL", flag: "🇮🇱", label: "Israel", dial: "+972" },
  { code: "IT", flag: "🇮🇹", label: "Italy", dial: "+39" },
  { code: "JP", flag: "🇯🇵", label: "Japan", dial: "+81" },
  { code: "KE", flag: "🇰🇪", label: "Kenya", dial: "+254" },
  { code: "KR", flag: "🇰🇷", label: "South Korea", dial: "+82" },
  { code: "MX", flag: "🇲🇽", label: "Mexico", dial: "+52" },
  { code: "NL", flag: "🇳🇱", label: "Netherlands", dial: "+31" },
  { code: "NZ", flag: "🇳🇿", label: "New Zealand", dial: "+64" },
  { code: "NG", flag: "🇳🇬", label: "Nigeria", dial: "+234" },
  { code: "NO", flag: "🇳🇴", label: "Norway", dial: "+47" },
  { code: "PH", flag: "🇵🇭", label: "Philippines", dial: "+63" },
  { code: "PL", flag: "🇵🇱", label: "Poland", dial: "+48" },
  { code: "PT", flag: "🇵🇹", label: "Portugal", dial: "+351" },
  { code: "SG", flag: "🇸🇬", label: "Singapore", dial: "+65" },
  { code: "ZA", flag: "🇿🇦", label: "South Africa", dial: "+27" },
  { code: "ES", flag: "🇪🇸", label: "Spain", dial: "+34" },
  { code: "SE", flag: "🇸🇪", label: "Sweden", dial: "+46" },
  { code: "CH", flag: "🇨🇭", label: "Switzerland", dial: "+41" },
  { code: "GB", flag: "🇬🇧", label: "United Kingdom", dial: "+44" },
  { code: "US", flag: "🇺🇸", label: "United States", dial: "+1" }
];

const INITIAL_FORM = {
  // Hidden record IDs — preserved so repeated saves update rather than insert
  _entityId: null,
  _locationId: null,

  companyName: "",
  dba: "",
  address: "",
  city: "",
  stateProvince: "",
  zipPostalCode: "",
  companyEin: "",
  companyLogo: null,
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  primaryContactPhoneCountry: "US",
  primaryContactTitle: "",
  primaryContactIsAuthorizedSigner: "",
  alternateSignerName: "",
  alternateSignerTitle: "",
  alternateSignerEmail: "",
  alternateSignerPhone: "",
  alternateSignerPhoneCountry: "US",
  borEffectiveDate: "",
  serviceAgreementPreference: ""
};

function emptyPolicy() {
  return {
    carrierName: "",
    lineOfCoverage: "",
    policyNumber: "",
    effectiveDate: "",
    renewalDate: "",
    notes: "",
    addAnotherPolicy: ""
  };
}

function getCountry(code) {
  return COUNTRIES.find((country) => country.code === code) || COUNTRIES.find((country) => country.code === "US") || COUNTRIES[0];
}

function formatPhoneForReview(phone, countryCode) {
  if (!phone) return "";
  const country = getCountry(countryCode);
  return `${country.flag} ${country.dial} ${phone}`;
}

function getNextPoliciesAfterSelection(policies, index, value) {
  let nextPolicies = policies.map((policy, policyIndex) => {
    return policyIndex === index ? { ...policy, addAnotherPolicy: value } : policy;
  });

  if (value === "Yes" && index === nextPolicies.length - 1) {
    nextPolicies = [...nextPolicies, emptyPolicy()];
  }

  if (value === "No") {
    nextPolicies = nextPolicies.slice(0, index + 1);
  }

  return nextPolicies;
}

function getPopoverPlacement(element, menuHeight) {
  if (!element || typeof window === "undefined") return "down";
  const rect = element.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  return spaceBelow < menuHeight && spaceAbove > spaceBelow ? "up" : "down";
}

function runSelfTests() {
  const onePolicy = [emptyPolicy()];
  console.assert(getNextPoliciesAfterSelection(onePolicy, 0, "Yes").length === 2, "Selecting Yes should append one policy.");
  console.assert(getNextPoliciesAfterSelection([emptyPolicy(), emptyPolicy()], 0, "No").length === 1, "Selecting No should remove later policies.");
  console.assert(formatPhoneForReview("5551234", "US").includes("+1"), "Phone review should include the selected country dial code.");
  console.assert(["up", "down"].includes(getPopoverPlacement(null, 420)), "Popover placement should always return a direction.");
}

function SectionHeader({ children }) {
  return <div className="mb-6 rounded-lg bg-blue-100 px-5 py-3 text-[20px] font-medium leading-[1.25] text-blue-700">{children}</div>;
}

function FieldLabel({ children }) {
  return <label className="mb-3 block text-[20px] font-medium leading-[1.25] text-[#17213a]">{children}</label>;
}

function TextInput({ label, value, onChange, type = "text", icon = null, placeholder = "", className = "" }) {
  const paddingClass = icon ? "pl-12" : "";
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {icon ? <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">{icon}</span> : null}
        <input
          value={value}
          type={type}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-[18px] text-[#17213a] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${paddingClass}`}
        />
      </div>
    </div>
  );
}

function PhoneInput({ label, value, onChange, country, onCountryChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("down");
  const dropdownRef = useRef(null);
  const selected = getCountry(country);

  function refreshPlacement() {
    setPlacement(getPopoverPlacement(dropdownRef.current, 420));
  }

  function toggleOpen() {
    refreshPlacement();
    setOpen((current) => !current);
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", refreshPlacement);
    window.addEventListener("scroll", refreshPlacement, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", refreshPlacement);
      window.removeEventListener("scroll", refreshPlacement, true);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-12 w-full rounded-md border border-slate-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex min-w-[84px] items-center justify-center gap-2 border-r border-slate-200 px-3"
          aria-label={`${label} country selector`}
        >
          <span className="text-2xl leading-none">{selected.flag}</span>
          <span className="text-base text-slate-500">⌄</span>
        </button>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={selected.dial}
          inputMode="tel"
          className="h-full min-w-0 flex-1 px-4 text-[18px] text-[#17213a] outline-none placeholder:text-slate-400"
        />
      </div>

      {open ? (
        <div className={`absolute left-0 z-50 max-h-[420px] w-[330px] overflow-y-auto border border-slate-300 bg-white shadow-lg ${placement === "up" ? "bottom-[56px]" : "top-[86px]"}`}>
          {COUNTRIES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                onCountryChange(item.code);
                setOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2 text-left text-lg hover:bg-slate-100 ${item.code === selected.code ? "bg-blue-50" : ""}`}
            >
              <span className="mr-3 text-xl">{item.flag}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SelectInput({ label, value, onChange, options, placeholder = "", className = "" }) {
  return (
    <div className={className}>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-md border border-slate-300 bg-white px-4 pr-12 text-[18px] text-[#17213a] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">{placeholder || "Select"}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl leading-none text-slate-300">⌄</span>
      </div>
    </div>
  );
}

function DateInput({ label, value, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("down");
  const pickerRef = useRef(null);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const parsedDate = useMemo(() => {
    const parts = String(value || "").split("/");
    if (parts.length !== 3) return new Date(2026, 3, 1);
    const month = Number(parts[0]) - 1;
    const day = Number(parts[1]);
    const year = Number(parts[2]);
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? new Date(2026, 3, 1) : date;
  }, [value]);

  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());

  function refreshPlacement() {
    setPlacement(getPopoverPlacement(pickerRef.current, 460));
  }

  function openPicker() {
    refreshPlacement();
    setOpen(true);
  }

  function togglePicker() {
    refreshPlacement();
    setOpen((current) => !current);
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!pickerRef.current || pickerRef.current.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", refreshPlacement);
    window.addEventListener("scroll", refreshPlacement, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", refreshPlacement);
      window.removeEventListener("scroll", refreshPlacement, true);
    };
  }, []);

  function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}/${date.getFullYear()}`;
  }

  function shiftMonth(amount) {
    const nextDate = new Date(viewYear, viewMonth + amount, 1);
    setViewMonth(nextDate.getMonth());
    setViewYear(nextDate.getFullYear());
  }

  function shiftYear(amount) {
    setViewYear((current) => current + amount);
  }

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const firstVisibleDate = new Date(viewYear, viewMonth, 1 - firstDay.getDay());
    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date(firstVisibleDate);
      date.setDate(firstVisibleDate.getDate() + index);
      return date;
    });
  }, [viewMonth, viewYear]);

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative max-w-[210px]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={openPicker}
          placeholder="MM/DD/YYYY"
          className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 pr-10 text-[18px] text-[#17213a] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="button"
          onClick={togglePicker}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
          aria-label={`Open calendar for ${label}`}
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <div className={`absolute left-0 z-50 w-[360px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ${placement === "up" ? "bottom-[56px]" : "top-[86px]"}`}>
          <div className="mb-8 flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-5 text-2xl text-slate-500">
              <button type="button" onClick={() => shiftYear(-1)} className="hover:text-slate-900">«</button>
              <button type="button" onClick={() => shiftMonth(-1)} className="hover:text-slate-900">‹</button>
            </div>
            <div className="text-xl font-medium text-slate-700">{monthNames[viewMonth]} {viewYear}</div>
            <div className="flex items-center gap-5 text-2xl text-slate-500">
              <button type="button" onClick={() => shiftMonth(1)} className="hover:text-slate-900">›</button>
              <button type="button" onClick={() => shiftYear(1)} className="hover:text-slate-900">»</button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 text-center text-lg text-slate-500">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center text-xl">
            {calendarCells.map((date) => {
              const inCurrentMonth = date.getMonth() === viewMonth;
              const selected = formatDate(date) === value;
              const dayClass = selected ? "bg-blue-500 text-white" : inCurrentMonth ? "text-slate-700" : "text-slate-300";
              return (
                <button
                  key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                  type="button"
                  onClick={() => {
                    onChange(formatDate(date));
                    setOpen(false);
                  }}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-blue-50 ${dayClass}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[112px] w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-[18px] text-[#17213a] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}

function RadioCards({ label, value, onChange, options, columns = 2, helper = "" }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {helper ? <p className="mb-5 -mt-1 text-lg leading-snug text-slate-500">{helper}</p> : null}
      <div className={`grid grid-cols-1 gap-3 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const selected = value === optionValue;
          const buttonClass = selected ? "border-blue-500 ring-2 ring-blue-500/80" : "border-slate-300 hover:border-slate-400";
          const dotClass = selected ? "border-blue-500" : "border-slate-300";
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={`flex min-h-[52px] items-center rounded-lg border bg-white px-5 text-left text-[20px] transition ${buttonClass}`}
            >
              <span className={`mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${dotClass}`}>
                {selected ? <span className="h-4 w-4 rounded-full bg-blue-500" /> : null}
              </span>
              <span className="leading-tight text-[#17213a]">{optionLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FileUpload({ file, onChange }) {
  const fileName = file && file.name ? file.name : "";
  return (
    <div>
      <FieldLabel>Company Logo (optional upload)</FieldLabel>
      <label className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 text-center text-lg text-slate-500 transition hover:border-blue-400 hover:bg-blue-50/30">
        <span className="mb-2 text-slate-500"><UploadIcon /></span>
        <span>{fileName || <>Drag and drop a file or <span className="underline">browse</span></>}</span>
        <input type="file" className="hidden" onChange={(event) => onChange(event.target.files?.[0] || null)} accept="image/*" />
      </label>
    </div>
  );
}

function ProgressBar({ page, onBack }) {
  const steps = [
    { id: 1, label: <>Company<br />Details &...</> },
    { id: 2, label: <>Policy<br />Details</> },
    { id: 3, label: <>BOR<br />Appointmen...</> },
    { id: 4, label: <>Review &<br />Submit</> }
  ];

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-[#f8fafc]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1180px] items-center px-5">
        <button
          type="button"
          onClick={onBack}
          className="mr-8 flex h-10 w-10 items-center justify-center rounded-full text-4xl leading-none text-slate-900 transition hover:bg-slate-100"
          aria-label="Back"
        >
          ‹
        </button>
        <div className="flex flex-1 items-center justify-center gap-5 overflow-hidden">
          {steps.map((step, index) => {
            const complete = page > step.id;
            const active = page === step.id;
            const stateClass = complete ? "border-[#7fb2f5] bg-[#7fb2f5] text-white" : active ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-300 bg-white text-slate-400";
            const labelClass = active ? "text-blue-600" : complete ? "text-[#7ba9f5]" : "text-slate-400";
            const lineClass = page > step.id ? "bg-[#7ba9f5]" : "bg-slate-300";
            return (
              <React.Fragment key={step.id}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 text-lg font-bold transition ${stateClass}`}>
                    {complete ? "✓" : active ? <span className="h-3 w-3 rounded-full bg-blue-500" /> : null}
                  </div>
                  <div className={`text-lg leading-tight ${labelClass}`}>{step.label}</div>
                </div>
                {index < steps.length - 1 ? <div className={`h-[2px] w-24 shrink ${lineClass}`} /> : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PageShell({ children, page, onBack }) {
  return (
    <main className="min-h-screen bg-[#f3f4f6] font-sans text-[#17213a]">
      <ProgressBar page={page} onBack={onBack} />
      <div className="px-4 py-9">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-[812px] rounded-lg bg-white px-9 py-8 shadow-sm"
        >
          {children}
        </motion.section>
      </div>
    </main>
  );
}

function NextButton({ children = "Next →", onClick, type = "button" }) {
  return (
    <div className="flex justify-center pt-4">
      <button
        type={type}
        onClick={onClick}
        className="rounded-lg bg-blue-500 px-7 py-3 text-[20px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2"
      >
        {children}
      </button>
    </div>
  );
}

function ReviewRow({ label, value }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className="grid grid-cols-[1fr_220px] gap-6 py-4 text-lg">
      <div className="font-medium leading-snug text-slate-400">{label}</div>
      <div className={`text-right leading-snug ${empty ? "italic text-slate-400" : "text-slate-800"}`}>{empty ? "Unanswered" : value}</div>
    </div>
  );
}

function EditButton({ onClick }) {
  return <button type="button" onClick={onClick} className="text-lg font-medium text-blue-600 hover:underline">Edit</button>;
}

/**
 * BorAppointmentFormPreview
 *
 * Props:
 *   companyId {string}                         – UUID of the company this form belongs to.
 *                                                Required. The form will show an error state
 *                                                when this is missing or invalid.
 *   supabase  {SupabaseClient|null}             – Authenticated Supabase client.
 *                                                When null the form runs in offline/preview
 *                                                mode (no fetch, no save).
 */
export default function AppointBetafitsForm({ initialValues = {}, onSubmit, isSubmitting = false, companyId = undefined }: any) {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [policies, setPolicies] = useState([emptyPolicy()]);
  const [submitted, setSubmitted] = useState(false);

  // "idle" | "loading" | "ready" | "empty" | "error"
  const [prefillStatus, setPrefillStatus] = useState("ready");
  const [prefillError, setPrefillError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    runSelfTests();
  }, []);

  // ── Prefill from the portal form loader ─────────────────────────────────────
  useEffect(() => {
    if (!initialValues || !Object.keys(initialValues).length) return;
    setForm((current) => ({ ...current, ...initialValues }));
    setPrefillStatus("ready");
  }, [initialValues, retryCount]);

  const showAlternateSigner = form.primaryContactIsAuthorizedSigner === "No";

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleFinalSubmit() {
    setSubmitError(null);

    setIsSaving(true);
    try {
      const validation = validateBorFormForMapping(form);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0] || "Please fix the highlighted fields.");
      }
      const mappedPayloads = mapBorFormToSupabasePayloads(form, policies, {
        companyId: companyId ?? "00000000-0000-0000-0000-000000000000",
      });
      const values = { ...form, policies };
      console.log("[BorForm] Submit", { form: values, policies });
      console.log("[BorForm] Mapped payloads", mappedPayloads);
      await onSubmit(values, mappedPayloads);
      setSubmitted(true);
    } catch (err) {
      console.error("[BorForm] Submit failed", err);
      setSubmitError(err.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function goBack() {
    if (submitted) {
      setSubmitted(false);
      setPage(4);
      return;
    }
    setPage((current) => Math.max(1, current - 1));
  }

  function updateForm(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "primaryContactIsAuthorizedSigner" && value === "Yes") {
        next.alternateSignerName = "";
        next.alternateSignerTitle = "";
        next.alternateSignerEmail = "";
        next.alternateSignerPhone = "";
      }
      return next;
    });
  }

  function updatePolicy(index, field, value) {
    setPolicies((current) => {
      if (field === "addAnotherPolicy") {
        return getNextPoliciesAfterSelection(current, index, value);
      }
      return current.map((policy, policyIndex) => policyIndex === index ? { ...policy, [field]: value } : policy);
    });
  }

  const companyAddressSummary = useMemo(() => {
    const pieces = [form.address, form.city, form.stateProvince, form.zipPostalCode].filter(Boolean);
    return pieces.length ? pieces.join(", ") : "United States";
  }, [form.address, form.city, form.stateProvince, form.zipPostalCode]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (prefillStatus === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4">
        <div className="flex flex-col items-center gap-5 text-center">
          <svg className="h-10 w-10 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-xl font-medium text-slate-600">Loading your saved information…</p>
        </div>
      </main>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────
  if (prefillStatus === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4">
        <div className="w-full max-w-md rounded-lg bg-white px-8 py-10 shadow-sm text-center">
          <div className="mb-4 text-5xl">🚫</div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">Unable to load your data</h1>
          <p className="mb-6 text-lg text-slate-500">{prefillError}</p>
          <button
            type="button"
            onClick={() => { setPrefillStatus("loading"); setRetryCount((n) => n + 1); }}
            className="rounded-lg bg-blue-500 px-6 py-2 text-lg font-semibold text-white hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // ── Success / thank-you ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <PageShell page={page} onBack={goBack}>
        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <span className="text-4xl font-bold leading-none text-blue-500">✓</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">Thank you</h1>
        </div>
      </PageShell>
    );
  }

  if (page === 1) {
    return (
      <PageShell page={page} onBack={goBack}>
        <SectionHeader>Company Information</SectionHeader>
        <div className="space-y-6">
          <TextInput label="Company Name" value={form.companyName} onChange={(value) => updateForm("companyName", value)} />
          <TextInput label="DBA (if applicable)" value={form.dba} onChange={(value) => updateForm("dba", value)} />
          <div>
            <FieldLabel>Company Address</FieldLabel>
            <TextInput label="Address" icon={<AddressIcon />} value={form.address} onChange={(value) => updateForm("address", value)} />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <TextInput label="City" value={form.city} onChange={(value) => updateForm("city", value)} />
            <SelectInput label="State / Province" value={form.stateProvince} onChange={(value) => updateForm("stateProvince", value)} options={STATE_OPTIONS} />
            <TextInput label="ZIP / Postal code" value={form.zipPostalCode} onChange={(value) => updateForm("zipPostalCode", value)} />
          </div>
          <TextInput label="Company EIN" value={form.companyEin} onChange={(value) => updateForm("companyEin", value)} />
          <FileUpload file={form.companyLogo} onChange={(file) => updateForm("companyLogo", file)} />
          <TextInput label="Primary Contact Name" value={form.primaryContactName} onChange={(value) => updateForm("primaryContactName", value)} />
          <TextInput label="Primary Contact Email" icon="✉" type="email" value={form.primaryContactEmail} onChange={(value) => updateForm("primaryContactEmail", value)} />
          <PhoneInput
            label="Primary Contact Phone"
            value={form.primaryContactPhone}
            onChange={(value) => updateForm("primaryContactPhone", value)}
            country={form.primaryContactPhoneCountry}
            onCountryChange={(value) => updateForm("primaryContactPhoneCountry", value)}
          />
          <TextInput label="Primary Contact Title" value={form.primaryContactTitle} onChange={(value) => updateForm("primaryContactTitle", value)} />
          <SectionHeader>Confirm Company Signer</SectionHeader>
          <RadioCards
            label="Is the primary contact the authorized signer for the BOR letter?"
            value={form.primaryContactIsAuthorizedSigner}
            onChange={(value) => updateForm("primaryContactIsAuthorizedSigner", value)}
            options={["Yes", "No"]}
          />
          {showAlternateSigner ? (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-xl leading-snug text-slate-800">If the signer will be someone other than the primary contact, please enter their name, title, and email address below.</p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextInput label="Alternate Signer Name" value={form.alternateSignerName} onChange={(value) => updateForm("alternateSignerName", value)} />
                <TextInput label="Alternate Signer Title" value={form.alternateSignerTitle} onChange={(value) => updateForm("alternateSignerTitle", value)} />
                <TextInput label="Alternate Signer Email" icon="✉" type="email" value={form.alternateSignerEmail} onChange={(value) => updateForm("alternateSignerEmail", value)} />
                <PhoneInput
                  label="Alternate Signer Phone"
                  value={form.alternateSignerPhone}
                  onChange={(value) => updateForm("alternateSignerPhone", value)}
                  country={form.alternateSignerPhoneCountry}
                  onCountryChange={(value) => updateForm("alternateSignerPhoneCountry", value)}
                />
              </div>
            </motion.div>
          ) : null}
          <NextButton onClick={() => setPage(2)} />
        </div>
      </PageShell>
    );
  }

  if (page === 2) {
    return (
      <PageShell page={page} onBack={goBack}>
        <SectionHeader>Existing Insurance Policies</SectionHeader>
        <div className="space-y-9">
          {policies.map((policy, index) => (
            <div key={index} className="space-y-6">
              <h2 className="text-center text-[20px] font-bold text-[#17213a]">Policy {index + 1}</h2>
              <TextInput label="Carrier Name" value={policy.carrierName} onChange={(value) => updatePolicy(index, "carrierName", value)} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <SelectInput label="Line of Coverage" value={policy.lineOfCoverage} onChange={(value) => updatePolicy(index, "lineOfCoverage", value)} options={COVERAGE_OPTIONS} />
                <TextInput label="Policy Number" value={policy.policyNumber} onChange={(value) => updatePolicy(index, "policyNumber", value)} />
                <DateInput label="Policy Effective Date" value={policy.effectiveDate} onChange={(value) => updatePolicy(index, "effectiveDate", value)} />
                <DateInput label="Renewal Date" value={policy.renewalDate} onChange={(value) => updatePolicy(index, "renewalDate", value)} />
              </div>
              <TextArea label="Notes / Comments" value={policy.notes} onChange={(value) => updatePolicy(index, "notes", value)} />
              <RadioCards label="Add another policy?" value={policy.addAnotherPolicy} onChange={(value) => updatePolicy(index, "addAnotherPolicy", value)} options={["Yes", "No"]} />
            </div>
          ))}
          <NextButton onClick={() => setPage(3)} />
        </div>
      </PageShell>
    );
  }

  if (page === 3) {
    return (
      <PageShell page={page} onBack={goBack}>
        <SectionHeader>BOR Appointment Details</SectionHeader>
        <div className="space-y-7">
          <DateInput label="Effective Date when Betafits will be appointed as BOR" value={form.borEffectiveDate} onChange={(value) => updateForm("borEffectiveDate", value)} />
          <p className="-mt-5 text-lg leading-snug text-slate-400">Select the date when you would like Betafits to become the official Broker of Record for your policies.</p>
          <RadioCards
            label="Would you like to consider a service agreement where Betafits is paid by direct fees instead of commissions?"
            value={form.serviceAgreementPreference}
            onChange={(value) => updateForm("serviceAgreementPreference", value)}
            options={[
              { value: "Yes", label: "Yes, I'd like to explore that option" },
              { value: "No", label: "No, we'll stay with standard commission" }
            ]}
          />
          <p className="text-xl leading-snug text-slate-600">By submitting this form, Betafits will prepare your Broker of Record (BOR) documents using the information you provided and send them to your designated signer for signature.</p>
          <NextButton onClick={() => setPage(4)} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell page={page} onBack={goBack}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Please review your submission.</h1>
        <p className="mt-1 text-lg font-medium text-slate-500">Update any relevant information as needed.</p>
      </div>
      <div className="border-t border-slate-200 py-3">
        <div className="mb-3 flex justify-end"><EditButton onClick={() => setPage(1)} /></div>
        <ReviewRow label="Company Name" value={form.companyName} />
        <ReviewRow label="DBA (if applicable)" value={form.dba} />
        <ReviewRow label="Company Address" value={companyAddressSummary} />
        <ReviewRow label="Company EIN" value={form.companyEin} />
        <ReviewRow label="Company Logo (optional upload)" value={form.companyLogo && form.companyLogo.name ? form.companyLogo.name : ""} />
        <ReviewRow label="Primary Contact Name" value={form.primaryContactName} />
        <ReviewRow label="Primary Contact Email" value={form.primaryContactEmail} />
        <ReviewRow label="Primary Contact Phone" value={formatPhoneForReview(form.primaryContactPhone, form.primaryContactPhoneCountry)} />
        <ReviewRow label="Primary Contact Title" value={form.primaryContactTitle} />
        <ReviewRow label="Is the primary contact the authorized signer for the BOR letter?" value={form.primaryContactIsAuthorizedSigner} />
        {showAlternateSigner ? (
          <>
            <ReviewRow label="Alternate Signer Name" value={form.alternateSignerName} />
            <ReviewRow label="Alternate Signer Title" value={form.alternateSignerTitle} />
            <ReviewRow label="Alternate Signer Email" value={form.alternateSignerEmail} />
            <ReviewRow label="Alternate Signer Phone" value={formatPhoneForReview(form.alternateSignerPhone, form.alternateSignerPhoneCountry)} />
          </>
        ) : null}
      </div>
      <div className="border-t border-slate-200 py-3">
        <div className="mb-3 flex justify-end"><EditButton onClick={() => setPage(2)} /></div>
        {policies.map((policy, index) => (
          <div key={index} className="pb-4">
            {policies.length > 1 ? <h2 className="mb-2 text-lg font-semibold text-slate-500">Policy {index + 1}</h2> : null}
            <ReviewRow label="Carrier Name" value={policy.carrierName} />
            <ReviewRow label="Line of Coverage" value={policy.lineOfCoverage} />
            <ReviewRow label="Policy Number" value={policy.policyNumber} />
            <ReviewRow label="Policy Effective Date" value={policy.effectiveDate} />
            <ReviewRow label="Renewal Date" value={policy.renewalDate} />
            <ReviewRow label="Notes / Comments" value={policy.notes} />
            <ReviewRow label="Add another policy?" value={policy.addAnotherPolicy} />
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-3">
        <div className="mb-3 flex justify-end"><EditButton onClick={() => setPage(3)} /></div>
        <ReviewRow label="Effective Date when Betafits will be appointed as BOR" value={form.borEffectiveDate} />
        <ReviewRow label="Would you like to consider a service agreement where Betafits is paid by direct fees instead of commissions?" value={form.serviceAgreementPreference} />
      </div>
      {submitError ? (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-center text-lg text-red-600">
          {submitError}
        </p>
      ) : null}
      <NextButton type="button" onClick={handleFinalSubmit}>
        {isSaving || isSubmitting ? "Saving..." : "Submit"}
      </NextButton>
    </PageShell>
  );
}
