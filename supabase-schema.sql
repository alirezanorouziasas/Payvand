-- PAYVAND PRODUCTION SCAFFOLD — SUPABASE SQL
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text default 'member' check (role in ('owner','admin','member','guest')),
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
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

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  member_name text,
  amount numeric not null,
  method text,
  receipt_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists queue (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  member_name text,
  payout_month text,
  amount numeric,
  status text default 'upcoming' check (status in ('confirmed','upcoming','paid','skipped')),
  created_at timestamptz default now()
);

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  amount numeric not null,
  emergency_fund boolean default true,
  created_at timestamptz default now()
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  member_name text,
  title text not null,
  description text,
  requested_amount numeric,
  urgency text,
  document_url text,
  status text default 'pending' check (status in ('pending','approved','rejected','more_info')),
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  created_at timestamptz default now()
);

create table if not exists governance_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  version text not null,
  content text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table members enable row level security;
alter table payments enable row level security;
alter table queue enable row level security;
alter table donations enable row level security;
alter table cases enable row level security;
alter table audit_logs enable row level security;
alter table governance_documents enable row level security;

create or replace function is_owner_or_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('owner','admin')
  );
$$;

drop policy if exists "public read governance" on governance_documents;
create policy "public read governance" on governance_documents for select using (true);

drop policy if exists "public insert donations" on donations;
create policy "public insert donations" on donations for insert with check (true);
drop policy if exists "public read donations" on donations;
create policy "public read donations" on donations for select using (true);

drop policy if exists "members read approved members" on members;
create policy "members read approved members" on members for select using (status = 'approved' or is_owner_or_admin());
drop policy if exists "members insert own application" on members;
create policy "members insert own application" on members for insert with check (true);
drop policy if exists "admins update members" on members;
create policy "admins update members" on members for update using (is_owner_or_admin());

drop policy if exists "payments insert authenticated" on payments;
create policy "payments insert authenticated" on payments for insert with check (auth.uid() is not null or true);
drop policy if exists "payments read admins" on payments;
create policy "payments read admins" on payments for select using (is_owner_or_admin());
drop policy if exists "payments update admins" on payments;
create policy "payments update admins" on payments for update using (is_owner_or_admin());

drop policy if exists "queue read all" on queue;
create policy "queue read all" on queue for select using (true);
drop policy if exists "queue admins write" on queue;
create policy "queue admins write" on queue for all using (is_owner_or_admin());

drop policy if exists "cases insert authenticated" on cases;
create policy "cases insert authenticated" on cases for insert with check (auth.uid() is not null or true);
drop policy if exists "cases read admins" on cases;
create policy "cases read admins" on cases for select using (is_owner_or_admin());
drop policy if exists "cases update admins" on cases;
create policy "cases update admins" on cases for update using (is_owner_or_admin());

drop policy if exists "audit read admins" on audit_logs;
create policy "audit read admins" on audit_logs for select using (is_owner_or_admin());
drop policy if exists "audit insert anyone" on audit_logs;
create policy "audit insert anyone" on audit_logs for insert with check (true);

-- Storage buckets to create manually in Supabase Storage:
-- receipts
-- case-documents
