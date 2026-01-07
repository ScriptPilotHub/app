create extension if not exists "uuid-ossp";

create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users not null,
  business_name text not null,
  slug text unique not null,
  timezone text not null default 'UTC',
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  name text not null,
  duration_minutes integer not null,
  price_cents integer not null,
  requires_deposit boolean not null default false,
  deposit_cents integer,
  active boolean not null default true
);

create table if not exists availability (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null
);

create type booking_status as enum ('pending','confirmed','completed','cancelled','no_show');

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  service_id uuid references services(id) not null,
  customer_name text not null,
  customer_email text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'pending',
  stripe_session_id text,
  paid_cents integer,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  business_id uuid references businesses(id) primary key,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'active'
);

alter table businesses enable row level security;
alter table services enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;
alter table subscriptions enable row level security;

create policy "Owners manage business" on businesses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Public read business" on businesses
  for select using (true);

create policy "Owners manage services" on services
  for all using (auth.uid() = (select owner_id from businesses where id = business_id))
  with check (auth.uid() = (select owner_id from businesses where id = business_id));

create policy "Public read services" on services
  for select using (active = true);

create policy "Owners manage availability" on availability
  for all using (auth.uid() = (select owner_id from businesses where id = business_id))
  with check (auth.uid() = (select owner_id from businesses where id = business_id));

create policy "Public read availability" on availability
  for select using (true);

create policy "Owners manage bookings" on bookings
  for all using (auth.uid() = (select owner_id from businesses where id = business_id))
  with check (auth.uid() = (select owner_id from businesses where id = business_id));

create policy "Public insert bookings" on bookings
  for insert with check (business_id is not null);

create policy "Owners manage subscriptions" on subscriptions
  for all using (auth.uid() = (select owner_id from businesses where id = business_id))
  with check (auth.uid() = (select owner_id from businesses where id = business_id));
