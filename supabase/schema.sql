-- Payvand MVP Supabase schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- User profiles connected to Supabase Auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  role text default 'member' check (role in ('admin', 'finance_manager', 'member', 'donor')),
  trust_score integer default 80,
  status text default 'active' check (status in ('active', 'pending', 'suspended')),
  created_at timestamptz default now()
);

-- Rotating fund members
create table if not exists public.members (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  monthly_amount numeric default 500,
  trust_score integer default 80,
  status text default 'active' check (status in ('active', 'pending', 'suspended')),
  created_at timestamptz default now()
);

-- Monthly member payments
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references public.members(id) on delete cascade,
  amount numeric not null,
  payment_month text not null,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'rejected')),
  receipt_url text,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Queue for monthly payout
create table if not exists public.queue (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references public.members(id) on delete cascade,
  receive_month text not null,
  amount numeric not null,
  queue_position integer not null,
  status text default 'scheduled' check (status in ('scheduled', 'paid', 'skipped')),
  created_at timestamptz default now()
);

-- Open donations from non-members or members
create table if not exists public.donations (
  id uuid primary key default uuid_generate_v4(),
  donor_name text default 'Anonymous',
  donor_email text,
  amount numeric not null,
  note text,
  payment_status text default 'pending' check (payment_status in ('pending', 'received', 'rejected')),
  created_at timestamptz default now()
);

-- Emergency fund ledger
create table if not exists public.emergency_fund (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('donation_in', 'reserve_in', 'support_out')),
  amount numeric not null,
  description text,
  related_donation_id uuid references public.donations(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Emergency support case submissions
create table if not exists public.emergency_cases (
  id uuid primary key default uuid_generate_v4(),
  requester_name text not null,
  contact_info text not null,
  requested_amount numeric not null,
  urgency text default 'medium' check (urgency in ('low', 'medium', 'high')),
  reason text not null,
  description text,
  status text default 'under_review' check (status in ('under_review', 'approved', 'rejected', 'paid')),
  created_at timestamptz default now()
);

-- Monthly transparency reports
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  report_month text not null,
  total_income numeric default 0,
  total_payout numeric default 0,
  emergency_balance numeric default 0,
  pending_payments integer default 0,
  paid_members integer default 0,
  published boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.payments enable row level security;
alter table public.queue enable row level security;
alter table public.donations enable row level security;
alter table public.emergency_fund enable row level security;
alter table public.emergency_cases enable row level security;
alter table public.reports enable row level security;

-- Simple MVP policies
-- Public can insert donations
drop policy if exists "Anyone can create donations" on public.donations;
create policy "Anyone can create donations"
on public.donations for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can read published reports" on public.reports;
create policy "Anyone can read published reports"
on public.reports for select
to anon, authenticated
using (published = true);

-- Authenticated users can read core public fund data
drop policy if exists "Authenticated users can read members" on public.members;
create policy "Authenticated users can read members"
on public.members for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read queue" on public.queue;
create policy "Authenticated users can read queue"
on public.queue for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read payments" on public.payments;
create policy "Authenticated users can read payments"
on public.payments for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read emergency fund" on public.emergency_fund;
create policy "Authenticated users can read emergency fund"
on public.emergency_fund for select
to authenticated
using (true);

drop policy if exists "Anyone can submit emergency cases" on public.emergency_cases;
create policy "Anyone can submit emergency cases"
on public.emergency_cases for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated users can read emergency cases" on public.emergency_cases;
create policy "Authenticated users can read emergency cases"
on public.emergency_cases for select
to authenticated
using (true);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

-- Demo seed data
insert into public.members (full_name, monthly_amount, trust_score, status)
values 
('Ali', 500, 94, 'active'),
('Sara', 500, 91, 'active'),
('Reza', 500, 82, 'pending'),
('Mina', 500, 88, 'active')
on conflict do nothing;

insert into public.queue (member_id, receive_month, amount, queue_position, status)
select id, 'June', 7500, 1, 'scheduled' from public.members where full_name = 'Sara'
on conflict do nothing;

insert into public.queue (member_id, receive_month, amount, queue_position, status)
select id, 'July', 7500, 2, 'scheduled' from public.members where full_name = 'Reza'
on conflict do nothing;

insert into public.queue (member_id, receive_month, amount, queue_position, status)
select id, 'August', 7500, 3, 'scheduled' from public.members where full_name = 'Mina'
on conflict do nothing;

insert into public.donations (donor_name, amount, payment_status)
values
('Anonymous', 250, 'received'),
('Nora', 500, 'received'),
('Anonymous', 100, 'received')
on conflict do nothing;

insert into public.emergency_fund (type, amount, description)
values
('donation_in', 250, 'External donation'),
('donation_in', 500, 'External donation'),
('donation_in', 100, 'External donation'),
('reserve_in', 1200, 'Monthly reserve')
on conflict do nothing;

insert into public.reports (report_month, total_income, total_payout, emergency_balance, pending_payments, paid_members, published)
values ('June', 7500, 7500, 2050, 2, 13, true)
on conflict do nothing;


insert into public.emergency_cases (requester_name, contact_info, requested_amount, urgency, reason, description, status)
values ('Anonymous', 'Private', 1500, 'medium', 'Temporary financial difficulty', 'Demo emergency support case', 'under_review')
on conflict do nothing;
