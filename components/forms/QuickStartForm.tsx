'use client';

import React, { useMemo, useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, Upload, X, Pencil, Folder, Mic } from "lucide-react";
import { DOCUMENT_TYPES } from "@/constants/documentTypes";
import { mapQuickStartFormToSupabasePayloads, normalizeYearToDate } from "@/lib/mappings/quickStartMapping";

const STEPS = ["Company Info", "Benefits", "Upload Documents", "Review"];
const STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
const ENTITY_TYPES = ["Corporation","Sole Proprietorship","Partnership","Limited Liability Company (LLC)","S-Corporation","Nonprofit","Other"];
const EMPLOYEE_OPTIONS = ["1 - 9","10 - 24","25 - 49","50 - 99","100 - 249","250 - 499","500 - 999","1000 - 4999","5000+"];
const BENEFITS_OFFERED = ["Medical","Dental","Vision","401(k)","Life","Disability","Other"];
const MEDICAL_OFFER_TYPES = ["Fully Insured","Level Funded","Self-Funded","ICHRA/QSEHRA","Taxable Stipend","Fully Insured (PEO)","Other"];
const CONTRIBUTION_TYPES = ["Flat Dollar Employer Contribution","Percentage Employer Contribution","Flat Dollar Employee Contribution","Custom Amount for Each Plan/Tier","Other"];
const PEO_USE = ["Yes","No, we have never considered a PEO","No, we have considered but decided against"];
const PEOS = ["Justworks","ADP TotalSource","TriNet","Insperity","Sequoia One","Paychex","Other"];
const PAYROLL_PROVIDERS = ["Rippling","ADP","Gusto","Paychex","Paycor","Paylocity","Other"];
const PAY_FREQ = ["Weekly","Biweekly","Semi-monthly","Monthly"];
const DEDUCTION_FREQ = ["Weekly","Biweekly","Semi-Monthly","Monthly"];
const PACKAGE_CONDITIONS = ["Additional Entities","Additional Locations","Multiple Eligibility Classes","Multiple Contribution Classes","None of the Above"];
const IDEAL_PLAN_COUNT = ["1","2","3","4","5+"];
const PLAN_TYPES = ["HDHP with HSA (Bronze)","HDHP with HSA (Silver)","HDHP with HSA (Gold)","PPO (Bronze)","PPO (Silver)","PPO (Gold)","HMO","Not Sure","Other"];
const IMPORTANCE_COLS = ["Not Important","Somewhat Important","Important","Very Important"];
const IMPORTANCE_ROWS = ["Total Cost","Value for Money","Carrier Name/Market Share","Size of Network","Healthcare Navigation","Mental Health Resources","Telemedicine Access","Modern Technology and Support"];
const PAIN_POINTS = ["Lack of integration between HR and benefits systems of record","Too many carrier and vendor portals to manage","Open enrollment workload","Overall benefits strategy","Need better benchmarking against competitors","Healthcare benefits costs","Benefits compliance (ACA, COBRA, ERISA, HIPAA)","Poor perception of benefits by employees","Need better admin training","Benefits don’t feel aligned with company culture","Communication of benefits to employees","401(k) is siloed from other benefits","Want better experience for employees","Lack of expert guidance from broker/consultant","Other"];
const QUESTIONNAIRE = ["We have done this before and would do it again","Open to it if it will save us money","Open to it if it is only for a few employees","Against it. Too invasive or too much of a hassle.","Not Sure"];
const FEEDBACK = ["If it is an easy process let’s do that now","Interested for the future or when the timing is right","I prefer not to directly engage employees about this","I would need to think about it"];

const defaultInitialValues = {
  firstName:"", lastName:"", title:"", phone:"", email:"", companyName:"", address:"", city:"", stateProvince:"", zipCode:"", ein:"", yearCompanyFounded:"", preferredSicCode:"", preferredNaicsCode:"", benefitEligibleEmployees:"", estimatedBenefitEligibleEes:"", estimatedMedicalEnrolledEes:"", expectedHeadcountGrowth:"", ndaRequested:"", ndaCompanyLegalName:"", entityType:"", stateOfFormation:"", ndaSigner:"",
  benefitsOffered:[], benefitsOtherText:"", medicalBenefitOfferType:"", medicalBenefitOfferTypeOther:"", medicalContributionStrategy:"", contributionToEmployee:"", contributionToDependents:"", percentageAppliesOnlyBasePlan:"", contributionStrategyDescription:"", usesPeo:"", peoUsed:"", peosEvaluated:[], payrollProvider:"", payrollFrequency:"", benefitDeductionFrequency:"", companyPackageConditions:[], companyPackageConditionsDetails:"",
  idealMedicalPlanCount:"", desiredPlanTypes:[], importanceRatings:{}, painPoints:[], questionnaireOpenness:"", employeeFeedbackPreference:"",
  uploadedDocuments:[], benefitsNotes:""
};

const fmt = (v: any) => {
  if (v == null) return "Unanswered";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "Unanswered";
  if (typeof v === "object") {
    const e = Object.entries(v);
    return e.length ? e.map(([k,val]) => `${k}: ${val}`).join(", ") : "Unanswered";
  }
  return String(v).trim() || "Unanswered";
};
const toggle = (arr: any[], value: any) => arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

function ProgressHeader({ step }: { step: number }) {
  return <div className="mx-auto flex max-w-[760px] items-center justify-center gap-2 md:gap-4">{STEPS.map((label, i) => {
    const idx = i + 1, active = idx === step, done = idx < step;
    return <div key={label} className="flex items-center gap-2 md:gap-3"><div className="flex items-center gap-2"><div className={["grid h-7 w-7 place-items-center rounded-full border-2", active || done ? "border-blue-500" : "border-zinc-400"].join(" ")}><div className={["h-3 w-3 rounded-full", active || done ? "bg-blue-500" : "bg-transparent"].join(" ")} /></div><span className={["hidden text-sm md:inline", active || done ? "text-blue-600" : "text-zinc-400"].join(" ")}>{label}</span></div>{i < STEPS.length - 1 ? <div className="h-px w-10 bg-zinc-300 md:w-14" /> : null}</div>;
  })}</div>;
}
function Card({ children, max = "max-w-[700px]" }: any) { return <div className={`mx-auto w-full ${max} rounded-xl bg-white px-5 py-6 shadow-sm ring-1 ring-black/5 md:px-7`}>{children}</div>; }
function Accordion({ title, open = true, children }: any) { return <section className="mb-4"><div className="flex w-full items-center justify-between rounded-md bg-[#DFEAFF] px-4 py-3 font-medium text-blue-900"><span>{title}</span><ChevronDown className={["h-5 w-5", open ? "rotate-180" : ""].join(" ")} /></div>{open ? <div className="pt-4">{children}</div> : null}</section>; }
function Field({ label, error, children, help }: any) { return <label className="block"><span className="mb-2 block text-sm font-medium text-zinc-800">{label}</span>{help ? <p className="mb-2 text-sm text-zinc-400">{help}</p> : null}{children}{error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}</label>; }
function Input(props: any) { return <input {...props} className="h-11 w-full rounded-md border border-zinc-300 px-3 text-[15px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />; }
function Area(props: any) { return <textarea rows={4} {...props} className="w-full rounded-md border border-zinc-300 px-3 py-3 text-[15px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />; }
function Select({ options, ...props }: any) { return <select {...props} className="h-11 w-full rounded-md border border-zinc-300 px-3 text-[15px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"><option value="" />{options.map((o: string) => <option key={o} value={o}>{o}</option>)}</select>; }
function RadioCards({ label, options, value, onChange, columns = 2 }: any) { return <div><div className="mb-2 text-sm font-medium text-zinc-800">{label}</div><div className={columns === 2 ? "grid gap-3 md:grid-cols-2" : "space-y-3"}>{options.map((o: string) => <label key={o} className={["flex cursor-pointer items-center gap-3 rounded-md border border-zinc-300 px-4 py-3 text-[15px]", value === o ? "border-blue-500 ring-2 ring-blue-100" : ""].join(" ")}><input type="radio" checked={value === o} onChange={() => onChange(o)} /><span>{o}</span></label>)}</div></div>; }
function CheckboxGrid({ label, options, values, onToggle }: any) { return <div><div className="mb-2 text-sm font-medium text-zinc-800">{label}</div><div className="grid gap-3 md:grid-cols-2">{options.map((o: string) => <label key={o} className="flex cursor-pointer items-center gap-3 text-[15px]"><input type="checkbox" checked={values.includes(o)} onChange={() => onToggle(o)} /><span>{o}</span></label>)}</div></div>; }

function IntroPage({ onStart }: any) {
  return <Card max="max-w-[640px]"><div className="mx-auto mb-8 flex items-center justify-center gap-4"><div className="grid h-20 w-20 place-items-center rounded-full bg-[#97C24D] text-4xl font-semibold text-white">B</div><div className="text-left text-[52px] font-light tracking-[0.3em] text-zinc-500 max-md:text-3xl max-md:tracking-[0.15em]">Betafits</div></div><h1 className="mb-5 text-center text-4xl font-semibold text-slate-700">Quick Start</h1><div className="space-y-5 text-left text-lg text-slate-700"><p className="font-semibold">Welcome to Betafits!</p><p>This form helps us collect key details so we can prepare your benefits analysis and request accurate quotes.</p><div><p className="font-semibold">Documents to prepare (if available):</p><ul className="mt-3 list-disc pl-6"><li>Benefit Guide</li><li>SBC/Plan Summaries</li><li>Insurance Invoices</li><li>Broker Fee Disclosure</li><li>Employee Census</li></ul></div><p className="italic text-slate-600">(It&apos;s okay if you don&apos;t have everything now. We auto-save your progress, so you can come back and finish later)</p><ul className="list-disc pl-6"><li><span className="font-semibold">Time to complete:</span> 8–17 minutes</li><li><span className="font-semibold">Minimum questions:</span> 23</li><li><span className="font-semibold">Maximum questions:</span> 49</li></ul><p>If you&apos;d like, you can request an NDA in this form.</p></div><div className="mt-8 text-center"><button onClick={onStart} className="rounded-md bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600 transition-colors">Start</button></div></Card>;
}

function CompanyPage({ v, setV, next }: any) {
  const [errors, setErrors] = useState<any>({});
  const u = (k: string, val: any) => setV((p: any) => ({ ...p, [k]: val }));
  const submit = () => {
    const e: any = {};
    ["firstName","lastName","title","phone","email","companyName","benefitEligibleEmployees","ndaRequested"].forEach((k) => { if (!v[k]) e[k] = "Required"; });
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Invalid email";
    if (v.ndaRequested === "yes") { if (!v.entityType) e.entityType = "Required"; if (!v.ndaSigner) e.ndaSigner = "Required"; }
    setErrors(e); if (!Object.keys(e).length) next();
  };
  return <Card max="max-w-[640px]"><Accordion title="Contact Information"><div className="grid gap-4 md:grid-cols-2"><Field label="First Name" error={errors.firstName}><Input value={v.firstName} onChange={(e: any) => u("firstName", e.target.value)} /></Field><Field label="Last Name" error={errors.lastName}><Input value={v.lastName} onChange={(e: any) => u("lastName", e.target.value)} /></Field><Field label="Title" error={errors.title}><Input value={v.title} onChange={(e: any) => u("title", e.target.value)} /></Field><Field label="Phone" error={errors.phone}><Input value={v.phone} onChange={(e: any) => u("phone", e.target.value)} /></Field></div><div className="mt-4"><Field label="Email" error={errors.email}><Input value={v.email} onChange={(e: any) => u("email", e.target.value)} /></Field></div></Accordion><Accordion title="Company Information"><div className="space-y-4"><Field label="Company Name" error={errors.companyName}><Input value={v.companyName} onChange={(e: any) => u("companyName", e.target.value)} /></Field><Field label="Address"><Input value={v.address} onChange={(e: any) => u("address", e.target.value)} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="City"><Input value={v.city} onChange={(e: any) => u("city", e.target.value)} /></Field><Field label="State / Province"><Select options={STATES} value={v.stateProvince} onChange={(e: any) => u("stateProvince", e.target.value)} /></Field></div><Field label="ZIP Code"><Input value={v.zipCode} onChange={(e: any) => u("zipCode", e.target.value)} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Employer Identification Number (EIN)"><Input value={v.ein} onChange={(e: any) => u("ein", e.target.value)} /></Field><Field label="Year company founded"><Input value={v.yearCompanyFounded} onChange={(e: any) => u("yearCompanyFounded", e.target.value)} /></Field></div><div className="grid gap-4 md:grid-cols-2"><Field label="Preferred SIC Code"><Input value={v.preferredSicCode} onChange={(e: any) => u("preferredSicCode", e.target.value)} /></Field><Field label="Preferred NAICS Code"><Input value={v.preferredNaicsCode} onChange={(e: any) => u("preferredNaicsCode", e.target.value)} /></Field></div><RadioCards label="How many benefit-eligible US employees does the company have?" options={EMPLOYEE_OPTIONS} value={v.benefitEligibleEmployees} onChange={(x: string) => u("benefitEligibleEmployees", x)} /><div className="grid gap-4 md:grid-cols-2"><Field label="Estimated Benefit Eligible EEs"><Input value={v.estimatedBenefitEligibleEes} onChange={(e: any) => u("estimatedBenefitEligibleEes", e.target.value)} /></Field><Field label="Estimated Medical Enrolled EEs"><Input value={v.estimatedMedicalEnrolledEes} onChange={(e: any) => u("estimatedMedicalEnrolledEes", e.target.value)} /></Field></div><Field label="Expected Headcount Growth (next 12 months)"><Input value={v.expectedHeadcountGrowth} onChange={(e: any) => u("expectedHeadcountGrowth", e.target.value)} /></Field></div></Accordion><Accordion title="Non-Disclosure Agreement (NDA) (Optional)"><div className="space-y-4"><RadioCards label="Would you like Betafits to sign an NDA regarding your company and employee information?" options={["yes","no"]} value={v.ndaRequested} onChange={(x: string) => { u("ndaRequested", x); if (x === "no") setV((p: any) => ({ ...p, ndaCompanyLegalName:"", entityType:"", stateOfFormation:"", ndaSigner:"" })); }} /><p className="-mt-2 text-sm text-zinc-400">This will be sent separately via DropboxSign.</p>{v.ndaRequested === "yes" ? <><Field label="What is the full legal name of the company?"><Input value={v.ndaCompanyLegalName} onChange={(e: any) => u("ndaCompanyLegalName", e.target.value)} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Entity type" error={errors.entityType}><Select options={ENTITY_TYPES} value={v.entityType} onChange={(e: any) => u("entityType", e.target.value)} /></Field><Field label="State of formation"><Select options={STATES} value={v.stateOfFormation} onChange={(e: any) => u("stateOfFormation", e.target.value)} /></Field></div><RadioCards label="Will you be the signer for the NDA?" options={["yes","no"]} value={v.ndaSigner} onChange={(x: string) => u("ndaSigner", x)} /></> : null}</div></Accordion><div className="mt-6 text-center"><button onClick={submit} className="rounded-md bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600 transition-colors">Next →</button></div></Card>;
}

function BenefitsOverviewPage({ v, setV, next }: any) {
  const [errors, setErrors] = useState<any>({});
  const u = (k: string, val: any) => setV((p: any) => ({ ...p, [k]: val }));
  const toggleField = (k: string, val: any) => setV((p: any) => ({ ...p, [k]: toggle(p[k], val) }));
  const showMedical = v.benefitsOffered.includes("Medical");
  const showInputs = ["Flat Dollar Employer Contribution","Percentage Employer Contribution"].includes(v.medicalContributionStrategy);
  const showText = ["Flat Dollar Employee Contribution","Custom Amount for Each Plan/Tier","Other"].includes(v.medicalContributionStrategy);
  const showPeoUsed = v.usesPeo === "Yes";
  const showPeosEval = v.usesPeo === "Yes" || v.usesPeo === "No, we have considered but decided against";
  const showPackageDetails = v.companyPackageConditions.some((x: string) => x !== "None of the Above");
  const submit = () => {
    const e: any = {};
    if (!v.benefitsOffered.length) e.benefitsOffered = "Select at least one";
    if (v.medicalBenefitOfferType === "Other" && !v.medicalBenefitOfferTypeOther.trim()) e.medicalBenefitOfferTypeOther = "Please specify";
    if (v.medicalContributionStrategy === "Flat Dollar Employer Contribution" || v.medicalContributionStrategy === "Percentage Employer Contribution") {
      if (!v.contributionToEmployee.trim()) e.contributionToEmployee = "Required";
      if (!v.contributionToDependents.trim()) e.contributionToDependents = "Required";
    }
    if (v.medicalContributionStrategy === "Percentage Employer Contribution" && !v.percentageAppliesOnlyBasePlan) e.percentageAppliesOnlyBasePlan = "Required";
    if (showText && !v.contributionStrategyDescription.trim()) e.contributionStrategyDescription = "Required";
    if (v.usesPeo === "Yes" && !v.peoUsed) e.peoUsed = "Required";
    if (showPackageDetails && !v.companyPackageConditionsDetails.trim()) e.companyPackageConditionsDetails = "Required";
    setErrors(e); if (!Object.keys(e).length) next();
  };
  return <Card max="max-w-[680px]"><Accordion title="Benefits Overview"><div className="space-y-6"><CheckboxGrid label="Which of the following benefits do you offer at this time?" options={BENEFITS_OFFERED} values={v.benefitsOffered} onToggle={(x: string) => toggleField("benefitsOffered", x)} />{v.benefitsOffered.includes("Other") ? <Field label="Please specify"><Input value={v.benefitsOtherText} onChange={(e: any) => u("benefitsOtherText", e.target.value)} /></Field> : null}{showMedical ? <><RadioCards label="How do you currently offer medical benefits?" options={MEDICAL_OFFER_TYPES} value={v.medicalBenefitOfferType} onChange={(x: string) => { u("medicalBenefitOfferType", x); if (x !== "Other") u("medicalBenefitOfferTypeOther", ""); }} />{v.medicalBenefitOfferType === "Other" ? <Field label="Please specify" error={errors.medicalBenefitOfferTypeOther}><Input value={v.medicalBenefitOfferTypeOther} onChange={(e: any) => u("medicalBenefitOfferTypeOther", e.target.value)} /></Field> : null}<RadioCards label="What is the medical contribution strategy?" options={CONTRIBUTION_TYPES} value={v.medicalContributionStrategy} onChange={(x: string) => { u("medicalContributionStrategy", x); if (!["Flat Dollar Employer Contribution","Percentage Employer Contribution"].includes(x)) setV((p: any) => ({ ...p, contributionToEmployee:"", contributionToDependents:"" })); if (x !== "Percentage Employer Contribution") u("percentageAppliesOnlyBasePlan", ""); if (!["Flat Dollar Employee Contribution","Custom Amount for Each Plan/Tier","Other"].includes(x)) u("contributionStrategyDescription", ""); }} columns={1} />{showInputs ? <div className="grid gap-4 md:grid-cols-2"><Field label="Contribution to Employee (% or $)" error={errors.contributionToEmployee}><Input value={v.contributionToEmployee} placeholder="For Ex. $45, 30%, etc." onChange={(e: any) => u("contributionToEmployee", e.target.value)} /></Field><Field label="Contribution to Dependents (% or $)" error={errors.contributionToDependents}><Input value={v.contributionToDependents} placeholder="For Ex. $45, 30%, etc." onChange={(e: any) => u("contributionToDependents", e.target.value)} /></Field></div> : null}{v.medicalContributionStrategy === "Percentage Employer Contribution" ? <RadioCards label="Does the percentage apply only the base plan? Employees pay the full cost to buy up to other plans." options={["yes","no"]} value={v.percentageAppliesOnlyBasePlan} onChange={(x: string) => u("percentageAppliesOnlyBasePlan", x)} /> : null}{showText ? <Field label="Please describe your contribution strategy?" error={errors.contributionStrategyDescription}><Area value={v.contributionStrategyDescription} onChange={(e: any) => u("contributionStrategyDescription", e.target.value)} /></Field> : null}</> : null}<RadioCards label="Do you currently use a PEO?" options={PEO_USE} value={v.usesPeo} onChange={(x: string) => { u("usesPeo", x); if (x !== "Yes") u("peoUsed", ""); if (x === "No, we have never considered a PEO") setV((p: any) => ({ ...p, peosEvaluated:[] })); }} columns={1} />{showPeoUsed ? <RadioCards label="Which PEO do you use?" options={PEOS} value={v.peoUsed} onChange={(x: string) => u("peoUsed", x)} /> : null}{showPeosEval ? <CheckboxGrid label="What PEOs have you evaluated?" options={PEOS} values={v.peosEvaluated} onToggle={(x: string) => toggleField("peosEvaluated", x)} /> : null}<RadioCards label="Who is your payroll provider?" options={PAYROLL_PROVIDERS} value={v.payrollProvider} onChange={(x: string) => u("payrollProvider", x)} /><RadioCards label="What is your Payroll Frequency?" options={PAY_FREQ} value={v.payrollFrequency} onChange={(x: string) => u("payrollFrequency", x)} /><RadioCards label="What is your Benefit Deduction Frequency?" options={DEDUCTION_FREQ} value={v.benefitDeductionFrequency} onChange={(x: string) => u("benefitDeductionFrequency", x)} /><CheckboxGrid label="Do any of the following apply to your company or benefits package?" options={PACKAGE_CONDITIONS} values={v.companyPackageConditions} onToggle={(x: string) => {
    if (x === "None of the Above") return u("companyPackageConditions", v.companyPackageConditions.includes(x) ? [] : [x]);
    const withoutNone = v.companyPackageConditions.filter((y: string) => y !== "None of the Above");
    setV((p: any) => ({ ...p, companyPackageConditions: toggle(withoutNone, x) }));
  }} />{showPackageDetails ? <Field label="Please provide additional details for each selected option" error={errors.companyPackageConditionsDetails}><Area value={v.companyPackageConditionsDetails} onChange={(e: any) => u("companyPackageConditionsDetails", e.target.value)} /></Field> : null}</div></Accordion><div className="mt-6 text-center"><button onClick={submit} className="rounded-md bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600 transition-colors">Next →</button></div></Card>;
}

function ImportanceMatrix({ value, onChange }: any) {
  return <div><div className="mb-4 text-sm font-medium text-zinc-800">In choosing a carrier and plans, how important are the following?</div><div className="mb-2 grid grid-cols-[1.4fr_repeat(4,1fr)] gap-2 px-3 text-center text-sm text-zinc-700"><div />{IMPORTANCE_COLS.map((c) => <div key={c}>{c}</div>)}</div><div className="space-y-2">{IMPORTANCE_ROWS.map((row) => <div key={row} className="grid grid-cols-[1.4fr_repeat(4,1fr)] items-center gap-2 rounded-md bg-zinc-100 px-3 py-3"><div className="text-[15px] text-zinc-800">{row}</div>{IMPORTANCE_COLS.map((c) => <div key={c} className="flex justify-center"><input type="radio" checked={value[row] === c} onChange={() => onChange({ ...value, [row]: c })} /></div>)}</div>)}</div><button type="button" className="mt-3 text-sm text-zinc-500 underline" onClick={() => onChange({})}>Clear</button></div>;
}

function BenefitPreferencesPage({ v, setV, next }: any) {
  const u = (k: string, val: any) => setV((p: any) => ({ ...p, [k]: val }));
  return <Card max="max-w-[700px]"><Accordion title="Benefit Preferences"><div className="space-y-6"><RadioCards label="In your opinion, what is the ideal number of medical plan options you would like to offer?" options={IDEAL_PLAN_COUNT} value={v.idealMedicalPlanCount} onChange={(x: string) => u("idealMedicalPlanCount", x)} /><CheckboxGrid label="Which of the following plan types do you think you would like to offer?" options={PLAN_TYPES} values={v.desiredPlanTypes} onToggle={(x: string) => u("desiredPlanTypes", toggle(v.desiredPlanTypes, x))} /><ImportanceMatrix value={v.importanceRatings} onChange={(x: any) => u("importanceRatings", x)} /><CheckboxGrid label="Which of the following are notable benefits pain points for your company?" options={PAIN_POINTS} values={v.painPoints} onToggle={(x: string) => u("painPoints", toggle(v.painPoints, x))} /><RadioCards label="Which best describes your openness toward employees submitting individual health questionnaires as a part of the quoting process?" options={QUESTIONNAIRE} value={v.questionnaireOpenness} onChange={(x: string) => u("questionnaireOpenness", x)} columns={1} /><RadioCards label="Would you like to gather employee feedback for benchmarking and improving your benefits program?" options={FEEDBACK} value={v.employeeFeedbackPreference} onChange={(x: string) => u("employeeFeedbackPreference", x)} columns={1} /></div></Accordion><div className="mt-6 text-center"><button onClick={next} className="rounded-md bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600 transition-colors">Next →</button></div></Card>;
}

function UploadModal({ initial, onClose, onSave }: any) {
  const [documentType, setDocumentType] = useState(initial?.documentType || "");
  const [fileName, setFileName] = useState(initial?.fileName || "");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4"><div className="w-full max-w-[650px] rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden"><div className="flex h-14 items-center justify-end border-b bg-white px-4"><button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100"><X size={24} /></button></div><div className="p-7"><Field label="Document Type"><Select options={DOCUMENT_TYPES} value={documentType} onChange={(e: any) => setDocumentType(e.target.value)} /></Field><p className="mt-4 text-[15px] text-zinc-700">To make sure everything is processed correctly, please upload <span className="font-semibold">one document at a time</span>. You can submit additional documents right after.</p><input ref={inputRef} type="file" className="hidden" onChange={(e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  }} /><div onClick={() => inputRef.current?.click()} className="mt-4 cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50/40">{fileName ? <div className="rounded-md bg-green-600 px-4 py-3 text-left text-white"><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-medium">{fileName}</span><span className="text-xs font-semibold">Selected</span></div></div> : <div className="space-y-2 text-zinc-500"><Folder className="mx-auto h-8 w-8" /><p className="text-2xl max-md:text-base">Click to browse</p></div>}</div><button disabled={!documentType || !fileName} onClick={() => onSave({ id: initial?.id || crypto.randomUUID(), documentType, fileName, file, status: "Pending" })} className="mt-6 rounded-md bg-blue-500 px-6 py-3 font-semibold text-white disabled:opacity-50 hover:bg-blue-600 transition-colors w-full">Save Document</button></div></div></div>;
}

function UploadDocumentsPage({ v, setV, next }: any) {
  const [editing, setEditing] = useState<any>(null);
  const saveUpload = (item: any) => { setV((p: any) => ({ ...p, uploadedDocuments: p.uploadedDocuments.some((d: any) => d.id === item.id) ? p.uploadedDocuments.map((d: any) => d.id === item.id ? item : d) : [...p.uploadedDocuments, item] })); setEditing(null); };
  return <><Card max="max-w-[700px]"><Accordion title="Document Uploader"><div className="space-y-5"><div className="rounded-md border border-blue-400 bg-blue-50 px-5 py-4 text-[15px] text-blue-600"><p>We recommend uploading your available benefits documents below to help us review your plan details.</p><p className="mt-4 font-semibold">Recommended Documents:</p><ul className="mt-4 list-disc space-y-3 pl-7"><li>Benefit Guide – helps us understand your available benefits, eligibility rules, and employee costs.</li><li>SBCs / Plan Summaries – allow us to benchmark your plan offerings for medical, dental, and vision coverage.</li><li>Insurance Invoices – let us analyze your current carrier rates and billing structure.</li><li>Broker Fee Disclosure – helps us identify above-market commissions and potential conflicts of interest.</li><li>Employee Census – enables us to audit your invoices and verify employee eligibility and costs.</li></ul></div><p className="text-[15px]">To upload a document, click the + Upload button below.</p>{v.uploadedDocuments.map((doc: any) => <div key={doc.id} className="flex items-center gap-3 rounded-md border border-zinc-300 px-4 py-3 text-[15px]"><span className="rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">{doc.status}</span><span className="flex-1">{doc.documentType}</span><button onClick={() => setEditing(doc)} className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900"><span>Edit</span><Pencil className="h-4 w-4" /></button><button onClick={() => setV((p: any) => ({ ...p, uploadedDocuments: p.uploadedDocuments.filter((d: any) => d.id !== doc.id) }))} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button></div>)}<button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-5 py-3 text-[15px] shadow-sm hover:bg-zinc-50 transition-colors"><Upload className="h-4 w-4" /> Upload</button></div></Accordion><Accordion title="Other Instructions"><div className="space-y-5"><div><p className="text-lg font-medium">Benefits I.Y.O.W. (In Your Own Words)</p><p className="text-zinc-400">Here you can record a message to discuss any additional information, pain points, priorities etc.</p><button className="mt-3 inline-flex items-center gap-2 rounded-md border border-zinc-300 px-5 py-3 text-[15px] shadow-sm hover:bg-zinc-50 transition-colors"><Mic className="h-5 w-5" /> Record</button></div><Field label="Is there anything else you would like us to know about your benefits package?"><Area value={v.benefitsNotes} onChange={(e: any) => setV((p: any) => ({ ...p, benefitsNotes: e.target.value }))} /></Field></div></Accordion><div className="mt-6 text-center"><button onClick={next} className="rounded-md bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600 transition-colors">Next →</button></div></Card>{editing !== null ? <UploadModal initial={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={saveUpload} /> : null}</>;
}

function ReviewSection({ fields, values, onEdit }: any) {
  return <section className="border-t border-zinc-200 pt-5"><div className="mb-4 flex justify-end"><button onClick={onEdit} className="text-blue-600 hover:underline">Edit</button></div><div className="space-y-5">{fields.map((f: any) => <div key={f.label} className="grid grid-cols-[1.2fr_1fr] gap-6 text-[15px] max-md:grid-cols-1 max-md:gap-1"><div className="text-zinc-500">{f.label}</div><div className={fmt(values[f.key]) === "Unanswered" ? "italic text-zinc-300" : "text-zinc-700"}>{fmt(values[f.key])}</div></div>)}</div></section>;
}

function ReviewPage({ v, edit, submit, isSubmitting }: any) {
  const company = ["firstName","lastName","title","phone","email","companyName","address","city","stateProvince","zipCode","ein","yearCompanyFounded","preferredSicCode","preferredNaicsCode","benefitEligibleEmployees","estimatedBenefitEligibleEes","estimatedMedicalEnrolledEes","expectedHeadcountGrowth","ndaRequested","ndaCompanyLegalName","entityType","stateOfFormation","ndaSigner"].map((k) => ({ key:k, label:k === "benefitEligibleEmployees" ? "How many benefit-eligible US employees does the company have?" : k.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase()) }));
  const benefits = ["benefitsOffered","medicalBenefitOfferType","medicalContributionStrategy","contributionStrategyDescription","usesPeo","peosEvaluated","payrollProvider","payrollFrequency","benefitDeductionFrequency","companyPackageConditions","companyPackageConditionsDetails"].map((k) => ({ key:k, label:k.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase()) }));
  const prefs = [
    { key:"idealMedicalPlanCount", label:"In your opinion, what is the ideal number of medical plan options you would like to offer?" },
    { key:"desiredPlanTypes", label:"Which of the following plan types do you think you would like to offer?" },
    { key:"importanceRatings", label:"In choosing a carrier and plans, how important are the following?" },
    { key:"painPoints", label:"Which of the following are notable benefits pain points for your company?" },
    { key:"questionnaireOpenness", label:"Which best describes your openness toward employees submitting individual health questionnaires as a part of the quoting process?" },
    { key:"employeeFeedbackPreference", label:"Would you like to gather employee feedback for benchmarking and improving your benefits program?" }
  ];
  const upload = [
    { key:"uploadedTypes", label:"To upload a document, click the + Upload button below." },
    { key:"voice", label:"Benefits I.Y.O.W. (In Your Own Words)" },
    { key:"benefitsNotes", label:"Is there anything else you would like us to know about your benefits package?" }
  ];
  const rv = { ...v, uploadedTypes: v.uploadedDocuments.map((d: any) => d.documentType), voice: "Unanswered" };
  return <Card max="max-w-[700px]"><div className="mb-6"><h1 className="text-4xl font-semibold text-slate-700 max-md:text-3xl">Please review your submission.</h1><p className="text-zinc-500">Update any relevant information as needed.</p></div><ReviewSection fields={company} values={rv} onEdit={() => edit(2)} /><ReviewSection fields={benefits} values={rv} onEdit={() => edit(3)} /><ReviewSection fields={prefs} values={rv} onEdit={() => edit(4)} /><ReviewSection fields={upload} values={rv} onEdit={() => edit(5)} /><div className="mt-8 flex justify-end"><button disabled={isSubmitting} onClick={submit} className="rounded-md bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit"}</button></div></Card>;
}

export default function QuickStartForm({
  initialValues,
  onSubmit,
  companyId = "00000000-0000-0000-0000-000000000000",
  isSubmitting: externalSubmitting = false,
}: {
  initialValues?: any;
  onSubmit?: (values: any, mappedPayloads: any) => Promise<void>;
  companyId?: string;
  isSubmitting?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [values, setValues] = useState<any>({ ...defaultInitialValues, ...initialValues });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitDisabled = isSubmitting || externalSubmitting;

  // Sync initialValues if they come in late (e.g. from an API call)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setValues((prev: any) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const mappedPayloads = useMemo(
    () =>
      mapQuickStartFormToSupabasePayloads(values, {
        companyId,
      }),
    [values, companyId]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First, handle document uploads for any files that have a 'file' property
      const uploadedDocs = await Promise.all(
        values.uploadedDocuments.map(async (doc: any) => {
          if (doc.file) {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('name', doc.fileName);
            formData.append('documentTitle', doc.fileName.replace(/\.[^/.]+$/, '') || doc.fileName);
            formData.append('documentType', doc.documentType);
            
            try {
              const uploadResponse = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
              });
              
              if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                return { ...doc, status: "Completed", fileUrl: uploadData.fileUrl || uploadData.fileId, file: undefined };
              }
            } catch (err) {
              console.error('Failed to upload document', doc.fileName, err);
            }
          }
          return doc;
        })
      );
      
      const finalValues = {
        ...values,
        yearCompanyFounded: normalizeYearToDate(values.yearCompanyFounded) ?? "",
        uploadedDocuments: uploadedDocs,
      };
      const finalPayloads = mapQuickStartFormToSupabasePayloads(finalValues, { companyId });

      console.log("quick_start_supabase_payloads", finalPayloads);

      if (onSubmit) {
        await onSubmit(finalValues, finalPayloads);
      }
    } catch (err) {
      console.error("Submission error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressStep = page <= 2 ? 1 : page <= 4 ? 2 : page === 5 ? 3 : 4;
  return <div className="animate-in fade-in duration-500 min-h-[80vh] text-[#1F2937]"><div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur -mx-4 px-4 md:-mx-8 md:px-8 mb-6 rounded-t-xl"><div className="mx-auto flex h-[60px] max-w-[1440px] items-center">{page > 1 && page < 7 ? <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} className="mr-4 rounded-full p-2 text-zinc-700 transition hover:bg-zinc-200"><ChevronLeft size={24} /></button> : <div className="mr-4 h-10 w-10" />}<div className="flex-1"><ProgressHeader step={progressStep} /></div></div></div><main className="pb-12">{page === 1 ? <IntroPage onStart={() => setPage(2)} /> : null}{page === 2 ? <CompanyPage v={values} setV={setValues} next={() => setPage(3)} /> : null}{page === 3 ? <BenefitsOverviewPage v={values} setV={setValues} next={() => setPage(4)} /> : null}{page === 4 ? <BenefitPreferencesPage v={values} setV={setValues} next={() => setPage(5)} /> : null}{page === 5 ? <UploadDocumentsPage v={values} setV={setValues} next={() => setPage(6)} /> : null}{page === 6 ? <ReviewPage v={values} edit={setPage} submit={handleSubmit} isSubmitting={isSubmitDisabled} /> : null}</main></div>;
}
