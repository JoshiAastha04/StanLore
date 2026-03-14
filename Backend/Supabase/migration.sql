-- ─────────────────────────────────────────────────────────────
-- Stanlore Database Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────

-- ── 1. CATALOG TABLES (public read, admin write) ──────────────

create table if not exists members (
                                       id          serial primary key,
                                       name        text not null,         -- "Jungkook"
                                       stage_name  text,                  -- "JK"
                                       birth_date  date,
                                       created_at  timestamptz default now()
    );

create table if not exists eras (
                                    id          serial primary key,
                                    name        text not null,         -- "Butter"
                                    slug        text not null unique,  -- "butter"
                                    created_at  timestamptz default now()
    );

create table if not exists albums (
                                      id          serial primary key,
                                      title       text not null,         -- "Butter"
                                      release_date date,
                                      era_id      int references eras(id) on delete set null,
    created_at  timestamptz default now()
    );

create table if not exists versions (
                                        id          serial primary key,
                                        album_id    int not null references albums(id) on delete cascade,
    name        text not null,         -- "Ver. A"
    created_at  timestamptz default now()
    );

create table if not exists photocards (
                                          id          serial primary key,
                                          member_id   int not null references members(id) on delete cascade,
    version_id  int not null references versions(id) on delete cascade,
    image_url   text,                  -- Supabase Storage URL
    is_rare     boolean default false,
    created_at  timestamptz default now()
    );

-- ── 2. USER TABLES (RLS protected) ───────────────────────────

create table if not exists profiles (
                                        id          uuid primary key references auth.users(id) on delete cascade,
    username    text unique not null,
    display_name text,
    bio         text,
    avatar_url  text,
    is_public   boolean default true,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
    );

create table if not exists collection (
                                          id          serial primary key,
                                          user_id     uuid not null references profiles(id) on delete cascade,
    card_id     int not null references photocards(id) on delete cascade,
    status      text not null check (status in ('owned', 'wishlist', 'duplicate')),
    quantity    int default 1,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now(),
    unique(user_id, card_id)           -- one row per user per card
    );

create table if not exists trade_listings (
                                              id            serial primary key,
                                              user_id       uuid not null references profiles(id) on delete cascade,
    have_card_id  int not null references photocards(id) on delete cascade,
    want_card_id  int not null references photocards(id) on delete cascade,
    note          text,
    is_active     boolean default true,
    created_at    timestamptz default now()
    );

-- ── 3. INDEXES ─────────────────────────────────────────────────

create index if not exists idx_collection_user    on collection(user_id);
create index if not exists idx_collection_card    on collection(card_id);
create index if not exists idx_collection_status  on collection(status);
create index if not exists idx_photocards_member  on photocards(member_id);
create index if not exists idx_photocards_version on photocards(version_id);
create index if not exists idx_trade_user         on trade_listings(user_id);
create index if not exists idx_profiles_username  on profiles(username);

-- ── 4. ROW LEVEL SECURITY ──────────────────────────────────────

alter table profiles       enable row level security;
alter table collection     enable row level security;
alter table trade_listings enable row level security;

-- Catalog tables are public read
alter table members    enable row level security;
alter table eras       enable row level security;
alter table albums     enable row level security;
alter table versions   enable row level security;
alter table photocards enable row level security;

-- Public can read all catalog data
create policy "catalog_public_read" on members    for select using (true);
create policy "catalog_public_read" on eras       for select using (true);
create policy "catalog_public_read" on albums     for select using (true);
create policy "catalog_public_read" on versions   for select using (true);
create policy "catalog_public_read" on photocards for select using (true);

-- Profiles: public can read public profiles, user owns their own
create policy "profiles_public_read"  on profiles for select using (is_public = true or auth.uid() = id);
create policy "profiles_own_insert"   on profiles for insert with check (auth.uid() = id);
create policy "profiles_own_update"   on profiles for update using (auth.uid() = id);
create policy "profiles_own_delete"   on profiles for delete using (auth.uid() = id);

-- Collection: users only see and manage their own
create policy "collection_own_select" on collection for select using (auth.uid() = user_id);
create policy "collection_own_insert" on collection for insert with check (auth.uid() = user_id);
create policy "collection_own_update" on collection for update using (auth.uid() = user_id);
create policy "collection_own_delete" on collection for delete using (auth.uid() = user_id);

-- Trade listings: anyone can read active listings, user manages their own
create policy "trades_public_read"  on trade_listings for select using (is_active = true);
create policy "trades_own_insert"   on trade_listings for insert with check (auth.uid() = user_id);
create policy "trades_own_update"   on trade_listings for update using (auth.uid() = user_id);
create policy "trades_own_delete"   on trade_listings for delete using (auth.uid() = user_id);

-- ── 5. AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────

create or replace function handle_new_user()
returns trigger as $$
begin
insert into public.profiles (id, username, display_name)
values (
           new.id,
           coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
           coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
       );
return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── 6. SEED DATA (BTS members) ────────────────────────────────

insert into members (name, stage_name) values
                                           ('Kim Namjoon',  'RM'),
                                           ('Kim Seokjin',  'Jin'),
                                           ('Min Yoongi',   'Suga'),
                                           ('Jung Hoseok',  'J-Hope'),
                                           ('Park Jimin',   'Jimin'),
                                           ('Kim Taehyung', 'V'),
                                           ('Jeon Jungkook','JK')
    on conflict do nothing;

-- Butter era seed
insert into eras (name, slug) values ('Butter', 'butter') on conflict do nothing;

insert into albums (title, release_date, era_id)
select 'Butter', '2021-05-21', id from eras where slug = 'butter'
    on conflict do nothing;

insert into versions (album_id, name)
select a.id, v.name
from albums a
         cross join (values ('Ver. A'), ('Ver. B'), ('Ver. C'), ('Ver. D')) as v(name)
where a.title = 'Butter'
    on conflict do nothing;

-- Proof era seed
insert into eras (name, slug) values ('Proof', 'proof') on conflict do nothing;

insert into albums (title, release_date, era_id)
select 'Proof', '2022-06-10', id from eras where slug = 'proof'
    on conflict do nothing;

insert into versions (album_id, name)
select a.id, v.name
from albums a
         cross join (values ('Collector''s Edition'), ('Standard')) as v(name)
where a.title = 'Proof'
    on conflict do nothing;
