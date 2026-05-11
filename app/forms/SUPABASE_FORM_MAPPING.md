# Supabase form route mapping audit

All friendly form routes are mapped to Airtable/Fillout template IDs. Standard forms submit through `POST /api/forms/submit`, which calls `submitPortalForm()` and writes `form_submissions`, updates `intake_assigned_forms`, and stores `normalized_targets`. Newer mapping payloads from Quick Start, NDA, and Appoint Betafits are also applied to Supabase domain tables. Document Uploader uses `/api/documents/upload`. Employee Feedback uses `/api/supabase/employee-feedback` and writes `solution_surveys`. Add New Group uses `/api/supabase/submit-company`.
