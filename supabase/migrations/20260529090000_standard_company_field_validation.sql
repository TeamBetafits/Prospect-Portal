-- Standardize compatible existing identity values before enforcing new writes.
update public.entities
set ein = substring(regexp_replace(ein, '\D', '', 'g') from 1 for 2) || '-' || substring(regexp_replace(ein, '\D', '', 'g') from 3 for 7)
where ein is not null
  and btrim(ein) <> ''
  and regexp_replace(ein, '\D', '', 'g') ~ '^\d{9}$';

update public.contacts
set phone = '(' || substring(national_digits from 1 for 3) || ') ' || substring(national_digits from 4 for 3) || '-' || substring(national_digits from 7 for 4)
from (
  select
    id,
    case
      when regexp_replace(phone, '\D', '', 'g') ~ '^1\d{10}$' then substring(regexp_replace(phone, '\D', '', 'g') from 2)
      else regexp_replace(phone, '\D', '', 'g')
    end as national_digits
  from public.contacts
  where phone is not null and btrim(phone) <> ''
) normalized
where public.contacts.id = normalized.id
  and normalized.national_digits ~ '^\d{10}$';

update public.locations
set zip_code = case
  when regexp_replace(zip_code, '\D', '', 'g') ~ '^\d{5}$' then regexp_replace(zip_code, '\D', '', 'g')
  when regexp_replace(zip_code, '\D', '', 'g') ~ '^\d{9}$' then substring(regexp_replace(zip_code, '\D', '', 'g') from 1 for 5) || '-' || substring(regexp_replace(zip_code, '\D', '', 'g') from 6 for 4)
  else zip_code
end
where zip_code is not null and btrim(zip_code) <> '';

alter table public.entities
  add constraint entities_ein_canonical_format
  check (ein is null or btrim(ein) = '' or ein ~ '^\d{2}-\d{7}$')
  not valid;

alter table public.contacts
  add constraint contacts_phone_canonical_format
  check (phone is null or btrim(phone) = '' or phone ~ '^\(\d{3}\) \d{3}-\d{4}$')
  not valid;

alter table public.locations
  add constraint locations_zip_code_canonical_format
  check (zip_code is null or btrim(zip_code) = '' or zip_code ~ '^\d{5}(-\d{4})?$')
  not valid;
