-- Port Hill — booking upgrade
-- Run this in the Supabase SQL editor once the project is reachable again.
-- Safe to re-run: every statement is guarded.

-- Needed so an exclusion constraint can mix equality (room_id) with range overlap.
create extension if not exists btree_gist;

-- ---------------------------------------------------------------
-- 1. Add-ons (the bonfire package, and anything sold alongside a stay)
-- ---------------------------------------------------------------
create table if not exists addons (
    id          uuid primary key default gen_random_uuid(),
    name        text    not null,
    price       numeric not null check (price >= 0),
    category    text    not null default 'general',
    is_active   boolean not null default true,
    sort_order  int     not null default 0,
    created_at  timestamptz not null default now()
);

insert into addons (name, price, category, sort_order)
select v.name, v.price, 'bonfire', v.sort_order
from (values
    ('Bonfire Space', 1500, 1),
    ('Firewood',       500, 2),
    ('Charcoal',       500, 3),
    ('Grill',          500, 4)
) as v(name, price, sort_order)
where not exists (select 1 from addons a where a.name = v.name);

-- ---------------------------------------------------------------
-- 2. Booking columns the new flow writes
-- ---------------------------------------------------------------
alter table bookings
    add column if not exists nights         int,
    add column if not exists total_amount   numeric,
    add column if not exists payment_status text default 'awaiting_payment',
    add column if not exists mpesa_code     text,
    add column if not exists booking_ref    text,
    add column if not exists addon_items    jsonb default '[]'::jsonb,
    add column if not exists addons_total   numeric default 0;

-- Backfill existing rows so the constraints below can be trusted.
update bookings set payment_status = 'awaiting_payment' where payment_status is null;
update bookings set nights = greatest(1, (check_out - check_in)) where nights is null;

alter table bookings alter column payment_status set not null;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'bookings_payment_status_check') then
        alter table bookings add constraint bookings_payment_status_check
            check (payment_status in ('awaiting_payment', 'awaiting_verification', 'paid', 'refunded', 'failed'));
    end if;
end $$;

-- Guests should not be able to submit the same M-Pesa code twice.
create unique index if not exists bookings_mpesa_code_key
    on bookings (mpesa_code) where mpesa_code is not null;

create unique index if not exists bookings_booking_ref_key
    on bookings (booking_ref) where booking_ref is not null;

-- ---------------------------------------------------------------
-- 3. Make double-booking impossible at the database level
-- ---------------------------------------------------------------
-- The browser already greys out taken dates, but two guests submitting at the
-- same moment would both pass that check. This is the real guard.
--
-- NOTE: if you already have overlapping rows this will fail. Find them with:
--   select a.id, b.id from bookings a join bookings b
--     on a.room_id = b.room_id and a.id < b.id
--     and daterange(a.check_in, a.check_out, '[)') && daterange(b.check_in, b.check_out, '[)')
--     where a.status <> 'cancelled' and b.status <> 'cancelled';
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'bookings_no_overlap') then
        alter table bookings add constraint bookings_no_overlap
            exclude using gist (
                room_id with =,
                daterange(check_in, check_out, '[)') with &&
            ) where (status <> 'cancelled');
    end if;
end $$;

-- ---------------------------------------------------------------
-- 4. Room pricing that matches what the site advertises
-- ---------------------------------------------------------------
alter table rooms
    add column if not exists short_stay_rate numeric,
    add column if not exists bedrooms        int,
    add column if not exists sort_order      int default 0;

-- Efficiency studio: 1,500 overnight, 1,500 day room.
update rooms set short_stay_rate = 1500, bedrooms = 0
where lower(name) like '%studio%' and short_stay_rate is null;

-- ---------------------------------------------------------------
-- 5. Row level security
-- ---------------------------------------------------------------
-- Guests may create a booking and read the room list. They must NOT be able to
-- read other guests' bookings, or edit prices. Staff go through Supabase Auth.
alter table rooms    enable row level security;
alter table addons   enable row level security;
alter table bookings enable row level security;

drop policy if exists "public can read rooms" on rooms;
create policy "public can read rooms" on rooms
    for select using (true);

drop policy if exists "public can read addons" on addons;
create policy "public can read addons" on addons
    for select using (is_active);

drop policy if exists "public can create bookings" on bookings;
create policy "public can create bookings" on bookings
    for insert with check (true);

-- Availability needs the taken dates, but nothing identifying.
-- Expose only what the calendar requires, through a view.
create or replace view public_availability as
    select room_id, check_in, check_out
    from bookings
    where status <> 'cancelled';

drop policy if exists "staff manage bookings" on bookings;
create policy "staff manage bookings" on bookings
    for all using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

drop policy if exists "staff manage rooms" on rooms;
create policy "staff manage rooms" on rooms
    for all using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
