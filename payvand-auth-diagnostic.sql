-- PAYVAND AUTH DIAGNOSTIC / OWNER FIX
-- Run this after trying signup once.

select id, email, created_at, email_confirmed_at
from auth.users
where email = 'alirezanorouziasas@gmail.com';

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text default 'member';

insert into public.profiles (id, email, full_name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', email),
  'owner'
from auth.users
where email = 'alirezanorouziasas@gmail.com'
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    role = 'owner';

select id, email, full_name, role
from public.profiles
where email = 'alirezanorouziasas@gmail.com';
