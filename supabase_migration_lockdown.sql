-- Port Hill — close the guest data leak
-- Run this in the Supabase SQL editor.
--
-- Right now the public anon key can read the whole bookings table, including
-- every guest's name and phone number. That key ships inside every visitor's
-- browser, so it must be treated as public. The booking calendar only ever needs
-- to know WHICH DATES are taken, never who took them.

-- ---------------------------------------------------------------
-- 1. Availability view — room and dates only, nothing identifying
-- ---------------------------------------------------------------
-- security_invoker = false means the view reads the base table with its owner's
-- rights. That is what lets us close public access to bookings itself while the
-- calendar keeps working. Supabase's linter flags definer views; here it is the
-- entire point, and the view exposes three harmless columns.
drop view if exists public_availability;
create view public_availability
with (security_invoker = false) as
    select room_id, check_in, check_out
    from bookings
    where status <> 'cancelled';

grant select on public_availability to anon, authenticated;

-- ---------------------------------------------------------------
-- 2. Rebuild the bookings policies from scratch
-- ---------------------------------------------------------------
-- A permissive read policy is already present (that is the leak) and its name is
-- not known ahead of time, so drop whatever exists and state the rules plainly.
do $$
declare pol record;
begin
    for pol in
        select policyname from pg_policies
        where schemaname = 'public' and tablename = 'bookings'
    loop
        execute format('drop policy if exists %I on public.bookings', pol.policyname);
    end loop;
end $$;

alter table bookings enable row level security;

-- Guests may create a booking. That is all they may do.
create policy "guests can create bookings" on bookings
    for insert to anon, authenticated with check (true);

-- Signed-in staff see and manage everything.
create policy "staff read bookings" on bookings
    for select to authenticated using (true);

create policy "staff update bookings" on bookings
    for update to authenticated using (true) with check (true);

create policy "staff delete bookings" on bookings
    for delete to authenticated using (true);

-- ---------------------------------------------------------------
-- 3. Rooms and add-ons: readable by anyone, writable by staff only
-- ---------------------------------------------------------------
alter table rooms  enable row level security;
alter table addons enable row level security;

drop policy if exists "public can read rooms" on rooms;
create policy "public can read rooms" on rooms
    for select to anon, authenticated using (true);

drop policy if exists "staff manage rooms" on rooms;
create policy "staff manage rooms" on rooms
    for all to authenticated using (true) with check (true);

drop policy if exists "public can read addons" on addons;
create policy "public can read addons" on addons
    for select to anon, authenticated using (is_active);

drop policy if exists "staff manage addons" on addons;
create policy "staff manage addons" on addons
    for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------
-- 4. Remove the row left behind while proving the overlap lock works
-- ---------------------------------------------------------------
delete from bookings where guest_name = 'ZZ_CONSTRAINT_TEST_DELETE_ME';

-- ---------------------------------------------------------------
-- 5. Check it worked
-- ---------------------------------------------------------------
-- Expect exactly one bookings policy for anon, and it should be INSERT only.
--   select policyname, cmd, roles from pg_policies
--   where schemaname = 'public' and tablename = 'bookings' order by cmd;
