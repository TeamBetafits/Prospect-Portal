-- Prospect Portal Supabase runtime support.
-- Keeps full-fidelity form answers while selected fields are normalized into typed tables.

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  available_form_id uuid references public.intake_available_forms(id) on delete set null,
  form_id text not null,
  form_name text,
  status text not null default 'Submitted',
  submitted_by_user_id uuid references public.users(id) on delete set null,
  answers jsonb not null default '{}'::jsonb,
  normalized_targets jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists form_submissions_company_id_idx
  on public.form_submissions(company_id);

create index if not exists form_submissions_form_id_idx
  on public.form_submissions(form_id);

create index if not exists form_submissions_available_form_id_idx
  on public.form_submissions(available_form_id);

create index if not exists form_submissions_submitted_by_user_id_idx
  on public.form_submissions(submitted_by_user_id);

create index if not exists form_submissions_answers_gin_idx
  on public.form_submissions using gin (answers);

alter table public.users
  add column if not exists supabase_auth_user_id uuid unique,
  add column if not exists role text not null default 'prospect',
  add column if not exists status text not null default 'active',
  add column if not exists must_change_password boolean not null default false,
  add column if not exists last_login_at timestamptz;

create index if not exists users_company_id_idx
  on public.users(company_id);

create index if not exists users_email_lower_idx
  on public.users(lower(email));

create index if not exists intake_assigned_forms_company_id_idx
  on public.intake_assigned_forms(company_id);

create index if not exists intake_available_forms_airtable_id_idx
  on public.intake_available_forms(airtable_id);

create index if not exists documents_and_artifacts_company_id_idx
  on public.documents_and_artifacts(company_id);

create index if not exists solution_surveys_company_id_idx
  on public.solution_surveys(company_id);
