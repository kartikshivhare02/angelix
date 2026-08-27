-- ============================================================
-- ANGLELIX — DIAGNOSE & FIX USER CREATION ERROR
-- Run in Supabase SQL Editor → New Query
-- ============================================================

-- STEP 1: Check if trigger exists
select 
  trigger_name, 
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers 
where trigger_name = 'on_auth_user_created';

-- STEP 2: Check if profiles table exists
select column_name, data_type 
from information_schema.columns 
where table_name = 'profiles' and table_schema = 'public'
order by ordinal_position;
