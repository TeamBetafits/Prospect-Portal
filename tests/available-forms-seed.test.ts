import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractFilloutTemplateId,
  parseAvailableFormsCsv,
  toIntakeAvailableFormSeedRecords,
} from "../lib/supabase/availableFormsSeed";

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
].join(",");

const TEST_CSV = [
  CSV_HEADERS,
  'Quick Start,Quick Start,1,checked,Required,Sequential,desc,intro,10,"Benefit Guides,SBC\'s,Invoice",trigger,rule,Intake,https://betafits.fillout.com/t/eBxXtLZdK4us',
  "PEO Assessment,PEO Assessment,2,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/cqBbC1vEUcus",
  "Benefits Administration,Benefits Administration,3,,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/fYJ3MNj7VQus",
  "Benefits Compliance,Benefits Compliance,4,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/ujTSx72pr5us",
  "Workers Compensation,Workers Compensation,5,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/tE2Bb3x71Cus",
  "NDA,NDA,6,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,ttps://betafits.fillout.com/t/6eUGSndhtYus",
  "Document Uploader,Document Uploader,7,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Documents,https://betafits.fillout.com/t/aTDkqH7zTmus",
  "Medical Coverage Survey,Medical Coverage Survey,8,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Benefits,https://betafits.fillout.com/t/199DTBMrsLus",
  "Benefits Feedback,Benefits Feedback,9,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Feedback,https://betafits.fillout.com/t/eQ7FVU76PDus",
  "Add New Group,Add New Group,10,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Benefits,https://betafits.fillout.com/t/xn4WCJ9D8pus",
  "Premiums Contribution Strategy,Premiums Contribution Strategy,11,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Benefits,https://betafits.fillout.com/t/jgaiJJZJvjus",
  "Comprehensive Intake,Comprehensive Intake,12,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/wpjffs7r5pus",
  "Basic Intake,Basic Intake,13,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/ns4TDz7ssbus",
  "Update Quickstart Current Benefits,Update Quickstart Current Benefits,14,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Benefits,https://betafits.fillout.com/t/rZhiEaUEskus",
  "Update PEO HR,Update PEO HR,15,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/gn6WNJPJKTus",
  "Update Broker Role,Update Broker Role,16,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,https://betafits.fillout.com/t/urHF8xDu7eus",
  "HR Tech,HR Tech,17,checked,Optional,Any,desc,intro,5,Docs,trigger,rule,Intake,",
].join("\n");

describe("available forms seed", () => {
  it("parses all rows from the intake available forms CSV", () => {
    const rows = parseAvailableFormsCsv(TEST_CSV);

    assert.equal(rows.length, 17);
    assert.equal(rows[0].name, "Quick Start");
    assert.equal(rows[0].filloutTemplateId, "eBxXtLZdK4us");
    assert.equal(rows[0].portalFormId, "eBxXtLZdK4us");
    assert.equal(rows[3].showInAvailableForms, true);
  });

  it("normalizes malformed Fillout URLs and derives IDs", () => {
    const rows = parseAvailableFormsCsv(TEST_CSV);
    const nda = rows.find((row) => row.name === "NDA");

    assert.equal(nda?.formsUrl, "https://betafits.fillout.com/t/6eUGSndhtYus");
    assert.equal(nda?.filloutTemplateId, "6eUGSndhtYus");
    assert.equal(extractFilloutTemplateId(nda?.formsUrl || ""), "6eUGSndhtYus");
  });

  it("maps CSV fields to intake_available_forms seed records", () => {
    const rows = parseAvailableFormsCsv(TEST_CSV);
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
