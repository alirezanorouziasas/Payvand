-- PAYVAND COMPLETE SUPABASE SQL
-- Safe to run multiple times in Supabase SQL Editor.
-- This file includes:
-- profiles, members, payments, queue, donations, cases, audit logs, governance documents,
-- owner/admin role logic, donation verification, RLS policies, and auth profile trigger.

-- =========================================================
-- 1. EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- 2. CORE TABLES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text default 'member' check (role in ('owner','admin','member','guest')),
  created_at timestamptz default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  telegram text,
  city text,
  introduced_by text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  trust_score int default 70,
  agreed_to_terms boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  member_name text,
  amount numeric not null,
  method text,
  receipt_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists public.queue (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  member_name text,
  payout_month text,
  amount numeric,
  status text default 'upcoming' check (status in ('confirmed','upcoming','paid','skipped')),
  created_at timestamptz default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  amount numeric not null,
  emergency_fund boolean default true,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  member_name text,
  title text not null,
  description text,
  requested_amount numeric,
  urgency text,
  document_url text,
  status text default 'pending' check (status in ('pending','approved','rejected','more_info')),
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  created_at timestamptz default now()
);

create table if not exists public.governance_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  version text not null,
  content text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =========================================================
-- 3. MIGRATION-SAFE COLUMN UPDATES FOR EXISTING PROJECTS
-- =========================================================

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'member';
alter table public.profiles add column if not exists created_at timestamptz default now();

alter table public.members add column if not exists profile_id uuid references public.profiles(id) on delete set null;
alter table public.members add column if not exists name text;
alter table public.members add column if not exists email text;
alter table public.members add column if not exists phone text;
alter table public.members add column if not exists telegram text;
alter table public.members add column if not exists city text;
alter table public.members add column if not exists introduced_by text;
alter table public.members add column if not exists status text default 'pending';
alter table public.members add column if not exists trust_score int default 70;
alter table public.members add column if not exists agreed_to_terms boolean default false;
alter table public.members add column if not exists created_at timestamptz default now();

alter table public.payments add column if not exists member_id uuid references public.members(id) on delete set null;
alter table public.payments add column if not exists member_name text;
alter table public.payments add column if not exists amount numeric;
alter table public.payments add column if not exists method text;
alter table public.payments add column if not exists receipt_url text;
alter table public.payments add column if not exists status text default 'pending';
alter table public.payments add column if not exists created_at timestamptz default now();

alter table public.queue add column if not exists member_id uuid references public.members(id) on delete set null;
alter table public.queue add column if not exists member_name text;
alter table public.queue add column if not exists payout_month text;
alter table public.queue add column if not exists amount numeric;
alter table public.queue add column if not exists status text default 'upcoming';
alter table public.queue add column if not exists created_at timestamptz default now();

alter table public.donations add column if not exists donor_name text;
alter table public.donations add column if not exists amount numeric;
alter table public.donations add column if not exists emergency_fund boolean default true;
alter table public.donations add column if not exists status text default 'pending';
alter table public.donations add column if not exists verified_by uuid references public.profiles(id) on delete set null;
alter table public.donations add column if not exists created_at timestamptz default now();

alter table public.cases add column if not exists member_id uuid references public.members(id) on delete set null;
alter table public.cases add column if not exists member_name text;
alter table public.cases add column if not exists title text;
alter table public.cases add column if not exists description text;
alter table public.cases add column if not exists requested_amount numeric;
alter table public.cases add column if not exists urgency text;
alter table public.cases add column if not exists document_url text;
alter table public.cases add column if not exists status text default 'pending';
alter table public.cases add column if not exists created_at timestamptz default now();

alter table public.audit_logs add column if not exists actor text;
alter table public.audit_logs add column if not exists action text;
alter table public.audit_logs add column if not exists created_at timestamptz default now();

alter table public.governance_documents add column if not exists title text;
alter table public.governance_documents add column if not exists version text;
alter table public.governance_documents add column if not exists content text;
alter table public.governance_documents add column if not exists is_active boolean default true;
alter table public.governance_documents add column if not exists created_at timestamptz default now();

-- =========================================================
-- 4. SYNC PROFILE EMAILS FROM AUTH USERS
-- =========================================================

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
and (p.email is null or p.email = '');

update public.profiles p
set full_name = coalesce(p.full_name, u.raw_user_meta_data->>'full_name', u.email)
from auth.users u
where p.id = u.id
and (p.full_name is null or p.full_name = '');

-- =========================================================
-- 5. OWNER / ADMIN FUNCTION
-- =========================================================

create or replace function public.is_owner_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role in ('owner','admin')
  );
$$;

-- =========================================================
-- 6. AUTOMATIC PROFILE CREATION FOR NEW AUTH USERS
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case
      when new.email = 'alirezanorouziasas@gmail.com' then 'owner'
      else 'member'
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case
      when excluded.email = 'alirezanorouziasas@gmail.com' then 'owner'
      else public.profiles.role
    end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- 7. MAKE REAL OWNER EMAIL OWNER, IF PROFILE EXISTS
-- =========================================================

update public.profiles
set role = 'owner'
where email = 'alirezanorouziasas@gmail.com';

-- =========================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.payments enable row level security;
alter table public.queue enable row level security;
alter table public.donations enable row level security;
alter table public.cases enable row level security;
alter table public.audit_logs enable row level security;
alter table public.governance_documents enable row level security;

-- =========================================================
-- 9. DROP OLD POLICIES
-- =========================================================

drop policy if exists "public read governance" on public.governance_documents;

drop policy if exists "profiles read self or admins" on public.profiles;
drop policy if exists "profiles update admins" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;

drop policy if exists "public insert donations" on public.donations;
drop policy if exists "public read donations" on public.donations;
drop policy if exists "donations update admins" on public.donations;

drop policy if exists "members read approved members" on public.members;
drop policy if exists "members insert own application" on public.members;
drop policy if exists "admins update members" on public.members;

drop policy if exists "payments insert authenticated" on public.payments;
drop policy if exists "payments read admins" on public.payments;
drop policy if exists "payments update admins" on public.payments;

drop policy if exists "queue read all" on public.queue;
drop policy if exists "queue admins write" on public.queue;

drop policy if exists "cases insert authenticated" on public.cases;
drop policy if exists "cases read admins" on public.cases;
drop policy if exists "cases update admins" on public.cases;

drop policy if exists "audit read admins" on public.audit_logs;
drop policy if exists "audit insert anyone" on public.audit_logs;

-- =========================================================
-- 10. CREATE RLS POLICIES
-- =========================================================

-- Governance can be read publicly.
create policy "public read governance"
on public.governance_documents
for select
using (true);

-- Profiles:
-- A user can read their own profile. Owner/admin can read all profiles.
create policy "profiles read self or admins"
on public.profiles
for select
using (id = auth.uid() or public.is_owner_or_admin());

-- Users can insert their own profile if needed.
create policy "profiles insert own"
on public.profiles
for insert
with check (id = auth.uid());

-- Owner/admin can update profiles, including promotion to admin.
create policy "profiles update admins"
on public.profiles
for update
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

-- Donations:
-- Anyone can submit donation, but it remains pending by default.
create policy "public insert donations"
on public.donations
for insert
with check (true);

-- Donations can be read publicly for transparency.
create policy "public read donations"
on public.donations
for select
using (true);

-- Only owner/admin can approve/reject donations.
create policy "donations update admins"
on public.donations
for update
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

-- Members:
-- Approved members are visible. Owner/admin can see all.
create policy "members read approved members"
on public.members
for select
using (status = 'approved' or public.is_owner_or_admin());

-- Anyone can submit member application.
create policy "members insert own application"
on public.members
for insert
with check (true);

-- Only owner/admin can approve/reject members.
create policy "admins update members"
on public.members
for update
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

-- Payments:
-- Authenticated users and public MVP flow can insert payment proof.
create policy "payments insert authenticated"
on public.payments
for insert
with check (true);

-- Owner/admin can read payment records.
create policy "payments read admins"
on public.payments
for select
using (public.is_owner_or_admin());

-- Owner/admin can approve/reject payments.
create policy "payments update admins"
on public.payments
for update
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

-- Queue:
-- Queue is public/readable for transparency.
create policy "queue read all"
on public.queue
for select
using (true);

-- Owner/admin can manage queue.
create policy "queue admins write"
on public.queue
for all
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

-- Emergency cases:
-- Anyone can submit a case.
create policy "cases insert authenticated"
on public.cases
for insert
with check (true);

-- Only owner/admin can read sensitive cases.
create policy "cases read admins"
on public.cases
for select
using (public.is_owner_or_admin());

-- Only owner/admin can update cases.
create policy "cases update admins"
on public.cases
for update
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

-- Audit logs:
-- Owner/admin can read audit logs.
create policy "audit read admins"
on public.audit_logs
for select
using (public.is_owner_or_admin());

-- App can insert audit logs.
create policy "audit insert anyone"
on public.audit_logs
for insert
with check (true);

-- =========================================================
-- 11. STORAGE SETUP NOTES
-- =========================================================
-- Create these Storage buckets manually in Supabase Storage:
-- 1. receipts
-- 2. case-documents
--
-- For MVP testing, you can make these buckets public.
-- For production, use private buckets with authenticated upload/read policies.

-- =========================================================
-- 12. SEED GOVERNANCE DOCUMENT
-- =========================================================

insert into public.governance_documents (title, version, content, is_active)
values (
  'Payvand Detailed Rules',
  '1.0',
  'Payvand is a voluntary community-support platform for transparent rotating funds, verified donations, emergency assistance, member governance, admin approval, privacy protection, and monthly transparency reporting. Donations are pending until admin verification. Emergency funds only include approved donations.',
  true
)
on conflict do nothing;

-- =========================================================
-- 13. OPTIONAL DEMO SEED DATA
-- =========================================================
-- You can delete these rows later if you do not want demo data.

insert into public.members (name, email, city, status, trust_score, agreed_to_terms)
values
('Sara', 'sara@example.com', 'Oslo', 'approved', 91, true),
('Reza', 'reza@example.com', 'Bergen', 'pending', 75, false)
on conflict do nothing;

insert into public.queue (member_name, payout_month, amount, status)
values
('Sara', 'June', 7500, 'confirmed'),
('Reza', 'July', 7500, 'upcoming')
on conflict do nothing;

insert into public.donations (donor_name, amount, emergency_fund, status)
values
('Pending Guest', 250, true, 'pending'),
('Verified Donor', 500, true, 'approved')
on conflict do nothing;

insert into public.audit_logs (actor, action)
values
('system', 'Payvand complete schema initialized')
on conflict do nothing;

-- =========================================================
-- 14. FINAL CHECK QUERIES
-- =========================================================
-- Run these manually after execution if needed:
-- select id, email, full_name, role from public.profiles;
-- select donor_name, amount, status from public.donations;
-- select name, email, status from public.members;
