import { AssignedForm } from "@/types";

const FORM_ROUTE_BY_TEMPLATE_ID: Record<string, string> = {
  eBxXtLZdK4us: "/forms/quick-start",
  jLwpyNvuB2us: "/forms/quick-start",
  cqBbC1vEUcus: "/forms/peo-eor-assessment",
  fYJ3MNj7VQus: "/forms/benefits-administration",
  ujTSx72pr5us: "/forms/benefits-compliance",
  tE2Bb3x71Cus: "/forms/workers-compensation",
  "6eUGSndhtYus": "/forms/nda",
  aTDkqH7zTmus: "/forms/document-uploader",
  "199DTBMrsLus": "/forms/medical-coverage-survey",
  eQ7FVU76PDus: "/forms/benefits-feedback",
  xn4WCJ9D8pus: "/forms/add-new-group",
  jgaiJJZJvjus: "/forms/premiums-contribution-strategy",
  wpjffs7r5pus: "/forms/comprehensive-intake",
  ns4TDz7ssbus: "/forms/basic-intake",
  rZhiEaUEskus: "/forms/update-quickstart-current-benefits",
  gn6WNJPJKTus: "/forms/update-peo-hr",
  urHF8xDu7eus: "/forms/update-broker-role",
  rec4V98J6aPaM3u9H: "/forms/medical-coverage-survey",
  rec7NfuiBQ8wrEmu7: "/forms/workers-compensation",
  recFVcfdoXkUjIcod: "/forms/add-new-group",
  recFxyNqTLDdrxXN2: "/forms/benefits-administration",
  recGrsR8Sdx96pckJ: "/forms/benefits-compliance",
  recKzuznmqq29uASl: "/forms/peo-eor-assessment",
  recOE9pVakkobVzU7: "/forms/appoint-betafits",
  recOt6cX0t1DksDFT: "/forms/hr-tech",
  recUnTZFK5UyfWqzm: "/forms/comprehensive-intake",
  recdjXjySYuYUGkdP: "/forms/premiums-contribution-strategy",
  "missing-premiums-manual-input": "/forms/missing-premiums",
  rechTHxZIxS3bBcqF: "/forms/basic-intake",
  reclUQ6KhVzCssuVl: "/forms/quick-start-new-benefits",
  recmB9IdRhtgckvaY: "/forms/benefits-pulse-survey",
  recsLJiBVdED8EEbr: "/forms/document-uploader",
  recufWIRuSFArZ9GG: "/forms/quick-start-alt",
  recxH9Jrk10bbqU58: "/forms/broker-role",
  recySUNj6jv47SOKr: "/forms/nda",
};

export function getAssignedFormRoute(form: AssignedForm): string {
  // Always route missing premiums to the internal React form, bypassing any DB URL
  if (
    form.availableFormId === "missing-premiums-manual-input" ||
    form.name.toLowerCase().includes("missing premiums")
  ) {
    return "/forms/missing-premiums";
  }

  if (form.availableFormId && FORM_ROUTE_BY_TEMPLATE_ID[form.availableFormId]) {
    return FORM_ROUTE_BY_TEMPLATE_ID[form.availableFormId];
  }

  const templateIdMatch = form.description?.match(/fillout\.com\/t\/([a-zA-Z0-9]+)/);
  if (templateIdMatch && FORM_ROUTE_BY_TEMPLATE_ID[templateIdMatch[1]]) {
    return FORM_ROUTE_BY_TEMPLATE_ID[templateIdMatch[1]];
  }

  if (FORM_ROUTE_BY_TEMPLATE_ID[form.id]) {
    return FORM_ROUTE_BY_TEMPLATE_ID[form.id];
  }

  const formName = form.name.toLowerCase();
  if (formName.includes("quick start") && formName.includes("multi-page")) return "/forms/quick-start-current-benefits";
  if (formName.includes("quick start") && formName.includes("current benefits")) return "/forms/quick-start-current-benefits";
  if (formName.includes("quick start") && formName.includes("new benefits")) return "/forms/quick-start-new-benefits";
  if (formName.includes("quick start") || formName.includes("quickstart")) {
    return formName.includes("update") ? "/forms/update-quickstart-current-benefits" : "/forms/quick-start";
  }
  if (formName.includes("peo/hr") || (formName.includes("peo") && formName.includes("update"))) return "/forms/update-peo-hr";
  if (formName.includes("peo/eor") || formName.includes("peo eor")) return "/forms/peo-eor-assessment";
  if (formName.includes("broker")) return formName.includes("update") ? "/forms/update-broker-role" : "/forms/broker-role";
  if (formName.includes("medical coverage")) return "/forms/medical-coverage-survey";
  if (formName.includes("workers compensation")) return "/forms/workers-compensation";
  if (formName.includes("add new group")) return "/forms/add-new-group";
  if (formName.includes("benefits administration")) return "/forms/benefits-administration";
  if (formName.includes("benefits compliance")) return "/forms/benefits-compliance";
  if (formName.includes("appoint betafits")) return "/forms/appoint-betafits";
  if (formName.includes("hr tech")) return "/forms/hr-tech";
  if (formName.includes("comprehensive intake")) return "/forms/comprehensive-intake";
  if (formName.includes("missing premiums")) return "/forms/missing-premiums";
  if (formName.includes("premiums") || formName.includes("contribution strategy")) return "/forms/premiums-contribution-strategy";
  if (formName.includes("basic intake")) return "/forms/basic-intake";
  if (formName.includes("benefits pulse survey")) return "/forms/benefits-pulse-survey";
  if (formName.includes("document uploader")) return "/forms/document-uploader";
  if (formName === "nda") return "/forms/nda";
  if (form.description?.startsWith("/")) return form.description;

  return `/forms/${form.id.toLowerCase()}`;
}

export function getAvailableFormRoute(formId: string): string {
  return FORM_ROUTE_BY_TEMPLATE_ID[formId] || `/forms/${formId.toLowerCase()}`;
}

export function cleanAssignedFormName(form: AssignedForm): string {
  let displayName = form.name.trim();

  if (displayName.startsWith("http://") || displayName.startsWith("https://")) {
    return form.availableFormId === "eBxXtLZdK4us" ? "Quick Start" : "Form";
  }

  // Prospect-facing rename: never expose "Missing Premiums" label
  if (
    form.availableFormId === "missing-premiums-manual-input" ||
    displayName.toLowerCase().includes("missing premiums")
  ) {
    return "Confirm Plan Premiums";
  }

  displayName = displayName
    .replace(/^[-\s]+/, "")
    .replace(/^Assigned to:\s*/i, "")
    .replace(/\bAssigned to:\s*/gi, "")
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "");

  if (displayName.includes(" - ")) displayName = displayName.split(" - ").pop()?.trim() || displayName;
  if (displayName.includes(": ")) displayName = displayName.split(": ").pop()?.trim() || displayName;

  displayName = displayName
    .replace(/\s*\((Original|Copy|Duplicate)\)\s*/gi, "")
    .replace(/\s*-\s*$/, "")
    .replace(/^(Form|Survey|Intake):\s*/i, "")
    .replace(/^[-\s]+/, "")
    .trim();

  return displayName || "Untitled Form";
}
