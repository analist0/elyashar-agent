create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  phone text,
  plan text not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  phone text,
  email text,
  address text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,
  plan text not null default 'trial',
  status text not null default 'trialing',
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  current_period_start timestamptz,
  current_period_end timestamptz,
  payment_provider text,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  description text,
  price_from numeric,
  price_to numeric,
  duration_minutes int not null default 30,
  is_bookable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists business_faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create table if not exists business_policies (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists telephony_providers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  provider text not null,
  label text,
  config jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists phone_numbers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  provider_id uuid references telephony_providers(id) on delete set null,
  phone_number text not null,
  inbound_address text,
  sip_address text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table businesses enable row level security;
alter table subscriptions enable row level security;
alter table business_services enable row level security;
alter table business_faqs enable row level security;
alter table business_policies enable row level security;
alter table telephony_providers enable row level security;
alter table phone_numbers enable row level security;

create policy "profiles_owner_read" on profiles for select using (auth.uid() = id);
create policy "profiles_owner_update" on profiles for update using (auth.uid() = id);
create policy "businesses_owner_all" on businesses for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "subscriptions_owner_read" on subscriptions for select using (auth.uid() = user_id);
