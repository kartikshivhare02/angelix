-- ============================================================
-- ANGLELIX — Migration 002: Admins Table
-- Run this in Supabase SQL Editor AFTER migration 001
-- ============================================================

-- Admins table — separate from profiles for security
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table admins enable row level security;

-- Admins can read their own row (service role key bypasses for API routes)
create policy "admins_select_own" on admins 
  for select using (auth.uid() = user_id);

-- Only service role can insert/update admins (no client-side privilege escalation)
-- This means admin creation MUST go through Supabase Dashboard or service role key

-- Insert the default settings row if not already present
insert into settings (id) values (1) on conflict (id) do nothing;
