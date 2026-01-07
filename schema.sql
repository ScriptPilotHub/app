create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  timezone text not null,
  currency text not null,
  stripe_account_id text,
  connect_status text default 'Not connected',
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  duration_min integer not null,
  price_cents integer not null,
  deposit_required boolean default false,
  deposit_cents integer,
  buffer_min integer default 0,
  active boolean default true
);

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  weekday integer not null,
  start_minute integer not null,
  end_minute integer not null
);

create table if not exists availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  date date not null,
  start_minute integer,
  end_minute integer,
  closed boolean default false
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  banned boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  amount_cents integer not null,
  currency text not null,
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text default 'pending',
  application_fee_cents integer,
  created_at timestamptz default now()
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  stripe_payout_id text,
  amount_cents integer not null,
  currency text not null,
  status text not null,
  arrival_date date,
  created_at timestamptz default now()
);

alter table businesses enable row level security;
alter table services enable row level security;
alter table availability_rules enable row level security;
alter table availability_exceptions enable row level security;
alter table clients enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table payouts enable row level security;

create policy "Owners can manage their businesses" on businesses
  for all using (owner_id = auth.uid());

create policy "Owners can manage services" on services
  for all using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Owners can manage availability" on availability_rules
  for all using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Owners can manage availability exceptions" on availability_exceptions
  for all using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Owners can manage clients" on clients
  for all using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Owners can manage bookings" on bookings
  for all using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Owners can manage payments" on payments
  for all using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Owners can manage payouts" on payouts
  for all using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Public can read business + services" on businesses
  for select using (true);

create policy "Public can read services" on services
  for select using (true);
