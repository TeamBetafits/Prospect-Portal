import fs from "node:fs";

export interface AvailableFormsCsvRow {
  name: string;
  displayName: string;
  sortOrder: number | null;
  showInAvailableForms: boolean | null;
  assignment: string;
  assignmentType: string;
  description: string;
  introText: string;
  approximateTimeToComplete: string;
  requiredDocuments: string;
  triggers: string;
  visibilityRules: string;
  stageUse: string;
  formsUrl: string;
  filloutTemplateId: string;
  portalFormId: string;
}

export interface IntakeAvailableFormSeedRecord {
  airtable_id: string | null;
  display_name: string;
  sort_order: number | null;
  show_in_available_forms: boolean | null;
  assignment: string | null;
  assignment_type: string | null;
  description: string | null;
  intro_text: string | null;
  approximate_time_to_complete: string | null;
  required_documents: string | null;
  triggers: string | null;
  visibility_rules: string | null;
  stage_use: string | null;
  forms_url: string | null;
}

const CSV_HEADERS = [
  "Name",
  "Display Name",
  "Sort Order",
  "Show in Available Forms",
  "Assignment",
  "Assignment Type",
  "Description",
  "Intro Text",
  "Approximate Time to Complete",
  "Required Documents",
  "Triggers",
  "Visibility Rules",
  "Stage Use",
  "Forms URL",
];

const IMPLEMENTED_FORM_ID_BY_NAME: Record<string, string> = {
  "HR Tech": "recOt6cX0t1DksDFT",
  "Appoint Betafits": "recOE9pVakkobVzU7",
};

export function parseAvailableFormsCsv(csv: string): AvailableFormsCsvRow[] {
  const rows = parseCsv(csv.replace(/^\uFEFF/, ""));
  if (rows.length < 2) return [];

  const header = rows[0];
  const indexes = Object.fromEntries(header.map((name, index) => [name, index]));
  const missingHeaders = CSV_HEADERS.filter((name) => indexes[name] === undefined);
  if (missingHeaders.length) {
    throw new Error(`Available forms CSV is missing required columns: ${missingHeaders.join(", ")}`);
  }

  return rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row) => {
    const value = (headerName: string) => row[indexes[headerName]]?.trim() || "";
    const formsUrl = normalizeFormsUrl(value("Forms URL"));

    const name = value("Name");
    const filloutTemplateId = extractFilloutTemplateId(formsUrl);

    return {
      name,
      displayName: value("Display Name"),
      sortOrder: parseNullableNumber(value("Sort Order")),
      showInAvailableForms: parseNullableBoolean(value("Show in Available Forms")),
      assignment: value("Assignment"),
      assignmentType: value("Assignment Type"),
      description: value("Description"),
      introText: value("Intro Text"),
      approximateTimeToComplete: value("Approximate Time to Complete"),
      requiredDocuments: value("Required Documents"),
      triggers: value("Triggers"),
      visibilityRules: value("Visibility Rules"),
      stageUse: value("Stage Use"),
      formsUrl,
      filloutTemplateId,
      portalFormId: filloutTemplateId || IMPLEMENTED_FORM_ID_BY_NAME[name] || "",
    };
  });
}

export function loadAvailableFormsSeedRecords(csvPath: string): IntakeAvailableFormSeedRecord[] {
  const csv = fs.readFileSync(csvPath, "utf8");
  return toIntakeAvailableFormSeedRecords(parseAvailableFormsCsv(csv));
}

export function toIntakeAvailableFormSeedRecords(rows: AvailableFormsCsvRow[]): IntakeAvailableFormSeedRecord[] {
  return rows.map((row) => ({
    airtable_id: row.portalFormId || null,
    display_name: row.displayName || row.name || "Untitled Form",
    sort_order: row.sortOrder,
    show_in_available_forms: row.showInAvailableForms,
    assignment: nullable(row.assignment),
    assignment_type: nullable(row.assignmentType),
    description: nullable(row.description),
    intro_text: nullable(row.introText),
    approximate_time_to_complete: nullable(row.approximateTimeToComplete),
    required_documents: nullable(row.requiredDocuments),
    triggers: nullable(row.triggers),
    visibility_rules: nullable(row.visibilityRules),
    stage_use: nullable(row.stageUse),
    forms_url: nullable(row.formsUrl),
  }));
}

export function extractFilloutTemplateId(url: string): string {
  return url.match(/fillout\.com\/t\/([a-zA-Z0-9]+)/)?.[1] || "";
}

function normalizeFormsUrl(url: string): string {
  if (url.startsWith("ttps://")) return `h${url}`;
  return url;
}

function parseNullableNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNullableBoolean(value: string): boolean | null {
  if (!value) return null;
  return ["checked", "true", "yes", "1"].includes(value.toLowerCase());
}

function nullable(value: string): string | null {
  return value || null;
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
