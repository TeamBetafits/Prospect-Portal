# Shared Edit/Form Registry

Use this registry layer for future prospect portal form standardization.

- Define fields once as `FieldDefinition` records.
- Render read and edit states from the same field list with `FieldGroupRenderer`.
- Keep generated intake forms in place until they are intentionally migrated.
- Pull select options from the data dictionary when available. If options are missing, set `optionsStatus: "unresolved"` instead of inventing choices.
- Validate API payloads against registry-approved writable fields.

The first migrated Prospect view is company details.
