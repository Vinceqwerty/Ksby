-- Sabay.ph initial schema
-- Run this in the Supabase SQL editor (or via CLI migration) after enabling PostGIS.

create extension if not exists postgis;

-- ── Profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role text check (role in ('driver', 'passenger', 'both')) default 'passenger',
  rating_avg numeric default 5.0,
  trip_count int default 0,
  created_at timestamptz default now()
);

-- ── Vehicles ──────────────────────────────────────────────
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references profiles(id) on delete cascade,
  plate_number text not null,
  make_model text,
  photo_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- ── Routes ────────────────────────────────────────────────
-- MVP simplification: `path` is a straight LineString between origin and
-- destination. Upgrade later by decoding a real Google/Mapbox Directions
-- polyline into this same geometry column — nothing else needs to change.
create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references profiles(id) on delete cascade,
  origin_label text,
  destination_label text,
  path geometry(LineString, 4326) not null,
  schedule_days text[],
  schedule_time time,
  seats_available int default 1,
  cost_share numeric,
  active boolean default true,
  created_at timestamptz default now()
);
create index if not exists routes_path_gix on routes using gist (path);

-- ── Ride requests ─────────────────────────────────────────
create table if not exists ride_requests (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references routes(id) on delete cascade,
  passenger_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed')) default 'pending',
  cost_share numeric,
  created_at timestamptz default now()
);

-- ── Trips ─────────────────────────────────────────────────
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  ride_request_id uuid references ride_requests(id) on delete cascade,
  status text check (status in ('ongoing', 'completed', 'disputed')) default 'ongoing',
  started_at timestamptz,
  completed_at timestamptz
);

-- ── Ratings ───────────────────────────────────────────────
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  rater_id uuid references profiles(id),
  ratee_id uuid references profiles(id),
  stars int check (stars between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────
alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table routes enable row level security;
alter table ride_requests enable row level security;
alter table trips enable row level security;
alter table ratings enable row level security;

create policy "profiles viewable by everyone" on profiles for select using (true);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);

create policy "vehicles viewable by everyone" on vehicles for select using (true);
create policy "drivers manage own vehicles" on vehicles for all
  using (auth.uid() = driver_id) with check (auth.uid() = driver_id);

create policy "routes viewable by everyone" on routes for select using (true);
create policy "drivers manage own routes" on routes for all
  using (auth.uid() = driver_id) with check (auth.uid() = driver_id);

create policy "participants view ride requests" on ride_requests for select using (
  auth.uid() = passenger_id
  or auth.uid() in (select driver_id from routes where routes.id = route_id)
);
create policy "passengers create ride requests" on ride_requests for insert
  with check (auth.uid() = passenger_id);
create policy "participants update ride requests" on ride_requests for update using (
  auth.uid() = passenger_id
  or auth.uid() in (select driver_id from routes where routes.id = route_id)
);

-- ── Route matching function ───────────────────────────────
-- Finds active routes that pass near both the passenger's origin and
-- destination, in the correct order (so we never match a driver going
-- the opposite direction). Distances are in meters.
create or replace function search_routes(
  origin_lng float,
  origin_lat float,
  dest_lng float,
  dest_lat float,
  buffer_meters float default 500
)
returns table (
  route_id uuid,
  driver_id uuid,
  driver_name text,
  origin_label text,
  destination_label text,
  schedule_days text[],
  schedule_time time,
  seats_available int,
  cost_share numeric,
  origin_fraction float,
  destination_fraction float
)
language sql stable
as $$
  with candidates as (
    select
      r.id as route_id,
      r.driver_id,
      p.full_name as driver_name,
      r.origin_label,
      r.destination_label,
      r.schedule_days,
      r.schedule_time,
      r.seats_available,
      r.cost_share,
      ST_LineLocatePoint(r.path, ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)) as origin_fraction,
      ST_LineLocatePoint(r.path, ST_SetSRID(ST_MakePoint(dest_lng, dest_lat), 4326)) as destination_fraction
    from routes r
    join profiles p on p.id = r.driver_id
    where r.active = true
      and r.seats_available > 0
      and ST_DWithin(
        r.path::geography,
        ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geography,
        buffer_meters
      )
      and ST_DWithin(
        r.path::geography,
        ST_SetSRID(ST_MakePoint(dest_lng, dest_lat), 4326)::geography,
        buffer_meters
      )
  )
  select * from candidates
  where destination_fraction > origin_fraction
  order by origin_fraction asc;
$$;

grant execute on function search_routes to anon, authenticated;

-- ── Create route helper (builds the straight-line geometry) ─
create or replace function create_route_straight(
  p_origin_label text,
  p_destination_label text,
  p_origin_lng float,
  p_origin_lat float,
  p_dest_lng float,
  p_dest_lat float,
  p_seats_available int,
  p_cost_share numeric,
  p_schedule_days text[],
  p_schedule_time time
)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into routes (
    driver_id, origin_label, destination_label, path,
    seats_available, cost_share, schedule_days, schedule_time
  )
  values (
    auth.uid(),
    p_origin_label,
    p_destination_label,
    ST_MakeLine(
      ST_SetSRID(ST_MakePoint(p_origin_lng, p_origin_lat), 4326),
      ST_SetSRID(ST_MakePoint(p_dest_lng, p_dest_lat), 4326)
    ),
    p_seats_available,
    p_cost_share,
    p_schedule_days,
    p_schedule_time
  )
  returning id into new_id;
  return new_id;
end;
$$;

grant execute on function create_route_straight to authenticated;
