create type public.app_role as enum ('admin', 'customer');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users see own roles" on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- First account becomes admin, everyone else is a customer
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create type public.reservation_status as enum ('pending', 'confirmed', 'cancelled');
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  email text not null check (char_length(email) <= 255),
  reservation_date date not null,
  reservation_time time not null,
  guests int not null check (guests between 1 and 10),
  special_request text check (special_request is null or char_length(special_request) <= 500),
  status reservation_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index on public.reservations (reservation_date, status);
grant select, insert, update on public.reservations to authenticated;
grant all on public.reservations to service_role;
alter table public.reservations enable row level security;

create policy "Own or admin read" on public.reservations for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Insert own" on public.reservations for insert to authenticated
with check (user_id = auth.uid() and status = 'pending');
create policy "Own or admin update" on public.reservations for update to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
with check (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Restaurant rules: open 12:00-22:00 (Asia/Kolkata), last seating 20:30,
-- 30-min slots, each booking holds seats for 2 hours, 40 seats total.
create or replace function public.seats_taken(_date date, _time time, _exclude uuid default null)
returns int language sql stable security definer set search_path = public
as $$
  select coalesce(sum(guests), 0)::int from public.reservations
  where reservation_date = _date and status <> 'cancelled'
    and (_exclude is null or id <> _exclude)
    and reservation_time < _time + interval '2 hours'
    and _time < reservation_time + interval '2 hours'
$$;
grant execute on function public.seats_taken(date, time, uuid) to authenticated, anon;

create or replace function public.validate_reservation()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  total_seats constant int := 40;
  taken int;
begin
  if tg_op = 'UPDATE' then
    -- customers may only cancel; only admins change other fields/status
    if not public.has_role(auth.uid(), 'admin') then
      if new.status <> 'cancelled' or old.status = 'cancelled'
         or (new.reservation_date, new.reservation_time, new.guests, new.user_id)
            is distinct from (old.reservation_date, old.reservation_time, old.guests, old.user_id) then
        raise exception 'You can only cancel an active reservation.';
      end if;
      if (old.reservation_date + old.reservation_time) < (now() at time zone 'Asia/Kolkata') then
        raise exception 'Past reservations cannot be cancelled.';
      end if;
    end if;
    if new.status = 'cancelled' then return new; end if;
  end if;

  if (new.reservation_date + new.reservation_time) <= (now() at time zone 'Asia/Kolkata') then
    raise exception 'Please choose a future date and time.';
  end if;
  if new.reservation_date > (now() at time zone 'Asia/Kolkata')::date + 60 then
    raise exception 'Bookings open up to 60 days in advance.';
  end if;
  if new.reservation_time < time '12:00' or new.reservation_time > time '20:30'
     or extract(minute from new.reservation_time)::int not in (0, 30) then
    raise exception 'Please choose a slot between 12:00 and 20:30.';
  end if;
  taken := public.seats_taken(new.reservation_date, new.reservation_time,
           case when tg_op = 'UPDATE' then new.id else null end);
  if taken + new.guests > total_seats then
    raise exception 'Sorry, only % seats are free at that time.', greatest(total_seats - taken, 0);
  end if;
  if tg_op = 'INSERT' and exists (
    select 1 from public.reservations where user_id = new.user_id and status <> 'cancelled'
      and reservation_date = new.reservation_date
      and reservation_time < new.reservation_time + interval '2 hours'
      and new.reservation_time < reservation_time + interval '2 hours') then
    raise exception 'You already have a booking around that time.';
  end if;
  return new;
end; $$;
create trigger validate_reservation before insert or update on public.reservations
for each row execute function public.validate_reservation();