-- ============================================================
-- ANGLELIX — CREATE ADMIN USER DIRECTLY VIA SQL
-- Use this if "Add user" in the Supabase dashboard still fails
--
-- HOW TO USE:
-- 1. Change the email below to YOUR email
-- 2. Change the password below to YOUR password (min 8 chars)
-- 3. Run this in SQL Editor
-- 4. Then run admin_setup.sql (the UUID will be printed below)
-- ============================================================

do $$
declare
  new_user_id uuid := gen_random_uuid();
  admin_email text := 'suraj@anglelix.com';   -- ← CHANGE THIS to your email
  admin_password text := 'Anglelix@2025!';    -- ← CHANGE THIS to your password
begin

  -- Insert into auth.users directly (bypasses dashboard)
  insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) values (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),                      -- email already confirmed
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    ''
  ) on conflict (email) do nothing;

  -- Create the profile record
  insert into public.profiles (auth_user_id, email)
  values (new_user_id, admin_email)
  on conflict (auth_user_id) do nothing;

  -- Grant admin access
  insert into public.admins (user_id, role)
  values (new_user_id, 'super_admin')
  on conflict (user_id) do nothing;

  raise notice '========================================';
  raise notice 'SUCCESS! Admin created.';
  raise notice 'Email:    %', admin_email;
  raise notice 'Password: %', admin_password;
  raise notice 'UUID:     %', new_user_id;
  raise notice '========================================';

end;
$$;

-- Verify it worked:
select 
  u.email,
  a.role,
  u.created_at,
  u.id as uuid
from auth.users u
join public.admins a on a.user_id = u.id
order by u.created_at desc
limit 5;
