# UI Design Implementation Notes

Source design reference: `Prospect Portal Design 1.zip`.

## Scope
Implemented the design layer from the design reference into the existing Next.js project without changing data-fetching, assignment, submission, or Supabase logic.

## Dashboard changes
- Matched the design reference layout for the dashboard header, assigned forms, documents, process tracking, and available forms.
- Updated `Your Documents` to use the design reference scrollable panel:
  - all documents render in the right column
  - the section uses `max-height: 500px`
  - vertical overflow scrolls inside the documents panel
  - removed the previous two-document preview/modal pattern from the dashboard presentation
- Kept the existing document open behavior through the current hook.
- Kept assigned form routing and available form assignment behavior unchanged.

## Page/component styling normalization
- Normalized matching portal components to the Betafits Design Authority tokens used by the design reference:
  - `primary-*` instead of legacy brand-only styling
  - `neutral-*` instead of generic gray styling on portal pages
  - medium rounded corners
  - card/modal shadows from the configured design tokens
- Replaced the placeholder Appoint Betafits page with the full design-reference page while keeping route behavior internal to the existing project.
- Synced FAQ styling to the design-reference neutral SaaS treatment.

## Logic preserved
No Supabase queries, assignment APIs, form submission handlers, form config mappings, auth, or company-scoped data loading were changed for this UI pass.
