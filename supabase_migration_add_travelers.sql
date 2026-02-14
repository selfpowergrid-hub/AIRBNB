alter table public.bookings 
add column if not exists adults integer default 1,
add column if not exists children integer default 0;
