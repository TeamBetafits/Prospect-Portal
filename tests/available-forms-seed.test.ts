import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  extractFilloutTemplateId,
  parseAvailableFormsCsv,
  toIntakeAvailableFormSeedRecords,
} from "../lib/supabase/availableFormsSeed";

const csvPath = path.resolve(process.cwd(), "../Intake - Available Forms-Grid view.csv");

describe("available forms seed", () => {
  it("parses all rows from the intake available forms CSV", () => {
    const rows = parseAvailableFormsCsv(fs.readFileSync(csvPath, "utf8"));

    assert.equal(rows.length, 17);
    assert.equal(rows[0].name, "Quick Start");
    assert.equal(rows[0].filloutTemplateId, "eBxXtLZdK4us");
    assert.equal(rows[0].portalFormId, "eBxXtLZdK4us");
    assert.equal(rows[3].showInAvailableForms, true);
  });

  it("normalizes malformed Fillout URLs and derives IDs", () => {
    const rows = parseAvailableFormsCsv(fs.readFileSync(csvPath, "utf8"));
    const nda = rows.find((row) => row.name === "NDA");

    assert.equal(nda?.formsUrl, "https://betafits.fillout.com/t/6eUGSndhtYus");
    assert.equal(nda?.filloutTemplateId, "6eUGSndhtYus");
    assert.equal(extractFilloutTemplateId(nda?.formsUrl || ""), "6eUGSndhtYus");
  });

  it("maps CSV fields to intake_available_forms seed records", () => {
    const rows = parseAvailableFormsCsv(fs.readFileSync(csvPath, "utf8"));
    const records = toIntakeAvailableFormSeedRecords(rows);
    const medicalCoverage = records.find((record) => record.airtable_id === "199DTBMrsLus");

    assert.equal(records.length, 17);
    assert.equal(records[0].display_name, "Quick Start");
    assert.equal(records[0].sort_order, 1);
    assert.equal(records[0].required_documents, "Benefit Guides,SBC's,Invoice");
    assert.equal(medicalCoverage?.display_name, "Medical Coverage Survey");
    assert.equal(records.find((record) => record.display_name === "HR Tech")?.airtable_id, "recOt6cX0t1DksDFT");
  });
});
