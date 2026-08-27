-- ============================================================
-- ANGLELIX — FIX TRIGGER (Run this first)
-- ============================================================

-- Fix the trigger function with better error handling
-- This version won't block user creation even if profiles insert fails

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (auth_user_id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (auth_user_id) do nothing;
  return new;
exception when others then
  -- Log the error but don't block user creation
  raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
  return new;
end;
$$;

-- Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Confirm it was created
select 'Trigger fixed successfully!' as result;
