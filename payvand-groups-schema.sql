-- PAYVAND GROUPS FEATURE SQL
-- Run this in Supabase SQL Editor after your main Payvand schema.
-- It adds parallel groups/circles and group join requests.

create extension if not exists "pgcrypto";

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  monthly_amount numeric default 0,
  capacity int default 0,
  payout_amount numeric default 0,
  period_months int default 0,
  start_month text,
  frequency text default 'monthly',
  status text default 'active' check (status in ('draft','active','closed')),
  created_at timestamptz default now()
);

create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  member_email text,
  member_name text,
  status text default 'pending' check (status in ('pending','approved','active','rejected','left','suspended')),
  created_at timestamptz default now()
);

alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;

drop policy if exists "groups read active or admins" on public.groups;
drop policy if exists "groups admins write" on public.groups;
drop policy if exists "group memberships insert own request" on public.group_memberships;
drop policy if exists "group memberships read own or admins" on public.group_memberships;
drop policy if exists "group memberships admins update" on public.group_memberships;

create policy "groups read active or admins"
on public.groups
for select
using (status in ('active','draft') or public.is_owner_or_admin());

create policy "groups admins write"
on public.groups
for all
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

create policy "group memberships insert own request"
on public.group_memberships
for insert
with check (true);

create policy "group memberships read own or admins"
on public.group_memberships
for select
using (
  public.is_owner_or_admin()
  or lower(member_email) = lower(coalesce((select email from public.profiles where id = auth.uid()), ''))
);

create policy "group memberships admins update"
on public.group_memberships
for update
using (public.is_owner_or_admin())
with check (public.is_owner_or_admin());

insert into public.groups (name, description, monthly_amount, capacity, payout_amount, period_months, start_month, frequency, status)
values
('Payvand Group A', 'Main rotating group for the first approved members.', 500, 10, 5000, 10, 'August 2026', 'monthly', 'active'),
('Payvand Group B', 'Parallel group for new members so they do not wait for Group A to finish.', 300, 8, 2400, 8, 'September 2026', 'monthly', 'active')
on conflict do nothing;

select id, name, monthly_amount, capacity, payout_amount, status
from public.groups;
