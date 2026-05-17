-- Payvand Supabase schema starter
create table profiles (
  id uuid primary key references auth.users(id),
  email text unique,
  full_name text,
  role text default 'member' check (role in ('owner','admin','member','guest')),
  created_at timestamptz default now()
);

create table members (
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

create table governance_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  version text not null,
  content text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  amount numeric not null,
  method text,
  receipt_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table fund_queue (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  payout_month text,
  amount numeric,
  status text default 'upcoming'
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  amount numeric not null,
  emergency_fund boolean default true,
  created_at timestamptz default now()
);

create table emergency_cases (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  title text not null,
  description text,
  requested_amount numeric,
  urgency text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references emergency_cases(id),
  file_url text,
  uploaded_at timestamptz default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table members enable row level security;
alter table governance_documents enable row level security;
alter table payments enable row level security;
alter table fund_queue enable row level security;
alter table donations enable row level security;
alter table emergency_cases enable row level security;
alter table case_documents enable row level security;
alter table audit_logs enable row level security;
