-- Prospect Portal Supabase integration support.
-- Adds runtime form submissions, company-scoped indexes, and RLS policies for portal-facing tables.

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

alter table public.users
  add column if not exists supabase_auth_user_id uuid unique,
  add column if not exists role text not null default 'prospect',
  add column if not exists status text not null default 'active',
  add column if not exists must_change_password boolean not null default false,
  add column if not exists last_login_at timestamptz;

create index if not exists users_company_id_idx on public.users(company_id);
create index if not exists users_email_lower_idx on public.users(lower(email));
create index if not exists form_submissions_company_id_idx on public.form_submissions(company_id);
create index if not exists form_submissions_form_id_idx on public.form_submissions(form_id);
create index if not exists form_submissions_available_form_id_idx on public.form_submissions(available_form_id);
create index if not exists form_submissions_submitted_by_user_id_idx on public.form_submissions(submitted_by_user_id);
create index if not exists form_submissions_answers_gin_idx on public.form_submissions using gin (answers);
create index if not exists intake_available_forms_airtable_id_idx on public.intake_available_forms(airtable_id);
create index if not exists intake_assigned_forms_company_id_idx on public.intake_assigned_forms(company_id);
create index if not exists intake_assigned_forms_company_available_idx on public.intake_assigned_forms(company_id, available_form_id);
create index if not exists intake_progress_steps_company_id_idx on public.intake_progress_steps(company_id);
create index if not exists documents_and_artifacts_company_id_idx on public.documents_and_artifacts(company_id);
create index if not exists medical_plans_company_plan_year_idx on public.medical_plans(company_id, plan_year);
create index if not exists dental_plans_company_plan_year_idx on public.dental_plans(company_id, plan_year);
create index if not exists vision_plans_company_plan_year_idx on public.vision_plans(company_id, plan_year);
create index if not exists benefit_classes_company_id_idx on public.benefit_classes(company_id);
create index if not exists contribution_strategies_company_id_idx on public.contribution_strategies(company_id);
create index if not exists tiers_and_rates_plan_id_idx on public.tiers_and_rates(plan_id);
create index if not exists census_company_id_idx on public.census(company_id);
create index if not exists solution_surveys_company_id_idx on public.solution_surveys(company_id);

alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.intake_available_forms enable row level security;
alter table public.intake_assigned_forms enable row level security;
alter table public.intake_progress_steps enable row level security;
alter table public.documents_and_artifacts enable row level security;
alter table public.form_submissions enable row level security;
alter table public.medical_plans enable row level security;
alter table public.dental_plans enable row level security;
alter table public.vision_plans enable row level security;
alter table public.benefit_classes enable row level security;
alter table public.contribution_strategies enable row level security;
alter table public.available_plans enable row level security;
alter table public.tiers_and_rates enable row level security;
alter table public.census enable row level security;
alter table public.solution_surveys enable row level security;

drop policy if exists "Portal users can read own user row" on public.users;
create policy "Portal users can read own user row"
  on public.users for select
  to authenticated
  using (supabase_auth_user_id = auth.uid());

drop policy if exists "Portal users can read own company" on public.companies;
create policy "Portal users can read own company"
  on public.companies for select
  to authenticated
  using (id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can update own company" on public.companies;
create policy "Portal users can update own company"
  on public.companies for update
  to authenticated
  using (id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1))
  with check (id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read available forms" on public.intake_available_forms;
create policy "Portal users can read available forms"
  on public.intake_available_forms for select
  to authenticated
  using (true);

drop policy if exists "Portal users can read own assigned forms" on public.intake_assigned_forms;
create policy "Portal users can read own assigned forms"
  on public.intake_assigned_forms for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own progress" on public.intake_progress_steps;
create policy "Portal users can read own progress"
  on public.intake_progress_steps for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own documents" on public.documents_and_artifacts;
create policy "Portal users can read own documents"
  on public.documents_and_artifacts for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own submissions" on public.form_submissions;
create policy "Portal users can read own submissions"
  on public.form_submissions for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can insert own submissions" on public.form_submissions;
create policy "Portal users can insert own submissions"
  on public.form_submissions for insert
  to authenticated
  with check (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own medical plans" on public.medical_plans;
create policy "Portal users can read own medical plans"
  on public.medical_plans for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own dental plans" on public.dental_plans;
create policy "Portal users can read own dental plans"
  on public.dental_plans for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own vision plans" on public.vision_plans;
create policy "Portal users can read own vision plans"
  on public.vision_plans for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own benefit classes" on public.benefit_classes;
create policy "Portal users can read own benefit classes"
  on public.benefit_classes for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own contribution strategies" on public.contribution_strategies;
create policy "Portal users can read own contribution strategies"
  on public.contribution_strategies for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own available plans" on public.available_plans;
create policy "Portal users can read own available plans"
  on public.available_plans for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own census" on public.census;
create policy "Portal users can read own census"
  on public.census for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own solution surveys" on public.solution_surveys;
create policy "Portal users can read own solution surveys"
  on public.solution_surveys for select
  to authenticated
  using (company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1));

drop policy if exists "Portal users can read own plan rates" on public.tiers_and_rates;
create policy "Portal users can read own plan rates"
  on public.tiers_and_rates for select
  to authenticated
  using (
    exists (
      select 1 from public.medical_plans p
      where p.id = tiers_and_rates.plan_id
        and p.company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1)
    )
    or exists (
      select 1 from public.dental_plans p
      where p.id = tiers_and_rates.plan_id
        and p.company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1)
    )
    or exists (
      select 1 from public.vision_plans p
      where p.id = tiers_and_rates.plan_id
        and p.company_id = (select company_id from public.users where supabase_auth_user_id = auth.uid() limit 1)
    )
  );
