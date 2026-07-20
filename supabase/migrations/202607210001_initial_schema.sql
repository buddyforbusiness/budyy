create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  country_code text default 'GB',
  currency_code text not null default 'GBP',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  q1_purpose text[], q2_feel_money text, q3_profile text, q4_income_range text,
  q5_rent text, q6_send_home text, q7_goals text[], q8_top_goal text,
  q9_goal_timeline text, q10_goal_amount text, q11_frictions text[],
  q12_run_out text, q13_save_pattern text, q14_help text[], q15_tone text,
  q16_depth text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status text not null default 'pending' check (status in ('pending','connected','expired','revoked','error')),
  encrypted_access_token jsonb,
  encrypted_refresh_token jsonb,
  consent_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  bank_connection_id uuid not null references public.bank_connections(id) on delete cascade,
  provider_account_id text not null, name text not null, type text, currency_code text not null default 'GBP',
  current_balance numeric(14,2), available_balance numeric(14,2), synced_at timestamptz,
  unique(bank_connection_id, provider_account_id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade, provider_transaction_id text not null,
  occurred_at timestamptz not null, description text not null, merchant_name text, amount numeric(14,2) not null,
  currency_code text not null default 'GBP', category text, is_recurring boolean not null default false,
  unique(account_id, provider_transaction_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, target_amount numeric(14,2) not null check(target_amount > 0), current_amount numeric(14,2) not null default 0,
  target_date date, status text not null default 'active' check(status in ('active','paused','completed','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_onboarding enable row level security;
alter table public.bank_connections enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

create policy "profiles_owner" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "onboarding_owner" on public.user_onboarding for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "bank_connections_read_owner" on public.bank_connections for select using (auth.uid() = user_id);
create policy "accounts_read_owner" on public.accounts for select using (auth.uid() = user_id);
create policy "transactions_read_owner" on public.transactions for select using (auth.uid() = user_id);
create policy "goals_owner" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx on public.transactions(user_id, occurred_at desc);
create index if not exists accounts_user_idx on public.accounts(user_id);
create index if not exists goals_user_status_idx on public.goals(user_id, status);
