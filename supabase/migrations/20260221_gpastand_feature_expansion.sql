-- GPA Standard: feature expansion schema
-- Tables: syllabi_data, assignments, user_profile

create table if not exists public.syllabi_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  source_text text not null default '',
  parsed_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assignments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null default '',
  title text not null,
  due_at timestamptz not null,
  type text not null check (type in ('assignment', 'exam')),
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists assignments_user_id_idx on public.assignments(user_id);
create index if not exists assignments_due_at_idx on public.assignments(due_at);

create table if not exists public.user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cumulative_gpa numeric(3,2) not null default 0,
  semester_history jsonb not null default '[]'::jsonb,
  notification_email text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.syllabi_data enable row level security;
alter table public.assignments enable row level security;
alter table public.user_profile enable row level security;

drop policy if exists "syllabi_select_own" on public.syllabi_data;
drop policy if exists "syllabi_insert_own" on public.syllabi_data;
drop policy if exists "syllabi_update_own" on public.syllabi_data;

create policy "syllabi_select_own"
  on public.syllabi_data for select
  using (auth.uid() = user_id);

create policy "syllabi_insert_own"
  on public.syllabi_data for insert
  with check (auth.uid() = user_id);

create policy "syllabi_update_own"
  on public.syllabi_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "assignments_select_own" on public.assignments;
drop policy if exists "assignments_insert_own" on public.assignments;
drop policy if exists "assignments_update_own" on public.assignments;
drop policy if exists "assignments_delete_own" on public.assignments;

create policy "assignments_select_own"
  on public.assignments for select
  using (auth.uid() = user_id);

create policy "assignments_insert_own"
  on public.assignments for insert
  with check (auth.uid() = user_id);

create policy "assignments_update_own"
  on public.assignments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "assignments_delete_own"
  on public.assignments for delete
  using (auth.uid() = user_id);

drop policy if exists "profile_select_own" on public.user_profile;
drop policy if exists "profile_insert_own" on public.user_profile;
drop policy if exists "profile_update_own" on public.user_profile;

create policy "profile_select_own"
  on public.user_profile for select
  using (auth.uid() = user_id);

create policy "profile_insert_own"
  on public.user_profile for insert
  with check (auth.uid() = user_id);

create policy "profile_update_own"
  on public.user_profile for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
