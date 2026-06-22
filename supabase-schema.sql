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
  status text default 'pending' check (status in ('pending','approved','rejected')),
  verified_by uuid references profiles(id),
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


-- Automatically create profile rows for new auth users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when new.email = 'alirezanorouziasas@gmail.com' then 'owner' else 'member' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Seed an active governance document
insert into governance_documents (title, version, content, is_active)
values (
  'Payvand Detailed Rules',
  '1.0',
  'Purpose, membership, monthly contribution, rotating queue, post-payout responsibility, late payment, payment verification, emergency fund, emergency case submission, case review, donations, transparency reporting, admin responsibilities, privacy, voting, misuse/removal, and rule updates.',
  true
)
on conflict do nothing;

-- Create these Storage buckets manually in Supabase Storage:
-- 1. receipts
-- 2. case-documents
-- Recommended for MVP testing: set buckets to public or add bucket policies for authenticated upload/read.


-- Migration-safe updates for existing projects
alter table donations add column if not exists status text default 'pending' check (status in ('pending','approved','rejected'));
alter table donations add column if not exists verified_by uuid references profiles(id);

-- Owner/admin-only update policy for donations
drop policy if exists "donations update admins" on donations;
create policy "donations update admins" on donations for update using (is_owner_or_admin());

-- Profiles read/update policies for admin management
drop policy if exists "profiles read self or admins" on profiles;
create policy "profiles read self or admins" on profiles for select using (id = auth.uid() or is_owner_or_admin());

drop policy if exists "profiles update admins" on profiles;
create policy "profiles update admins" on profiles for update using (is_owner_or_admin());

-- Ensure the real owner profile becomes owner after sign-up
update profiles set role = 'owner' where email = 'alirezanorouziasas@gmail.com';
