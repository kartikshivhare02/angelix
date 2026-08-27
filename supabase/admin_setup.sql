-- ============================================================
-- ANGLELIX — ADMIN USER SETUP
-- Run this AFTER running SETUP_COMPLETE.sql
-- and AFTER creating your user in Supabase Auth dashboard
-- ============================================================

-- Paste your admin user's UUID below (from Auth → Users → copy UID column)
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

insert into admins (user_id, role) 
values (
  'ff9a4066-13c0-4bd4-8bf7-3027de167b94',
  'super_admin'
)
on conflict (user_id) do nothing;

-- Run this SELECT to confirm it worked:
select 
  a.id as admin_id,
  a.role,
  u.email,
  a.created_at
from admins a
join auth.users u on a.user_id = u.id;
