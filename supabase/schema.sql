-- ===========================================================================
-- Callsheet - database schema
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run.
-- ===========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type creator_status as enum ('pending', 'approved', 'featured', 'rejected', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type follower_tier as enum ('nano', 'micro', 'mid', 'macro', 'mega');
exception when duplicate_object then null; end $$;

-- What the creator actually sells.
--   influencer  - sells access to their audience; priced per placement on
--                 their own channel. Reach and engagement are the product.
--   creator     - sells the footage; the brand runs it as an ad on the brand's
--                 own channels. No audience required. Craft and turnaround are
--                 the product. (Called ugc_creator until Aug 2026; the rename
--                 migration further down handles databases created before it.)
--   both        - does either, priced separately.
do $$ begin
  create type talent_type as enum ('influencer', 'creator', 'both');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- creators
--
-- Self-reported vs verified is split on purpose. Anything the creator types
-- goes in the plain column; anything confirmed later via an official API goes
-- in the matching verified_* column. Filters read verified first and fall back
-- to self-reported (see the effective_* generated columns at the bottom).
-- ---------------------------------------------------------------------------
create table if not exists public.creators (
  id                       uuid primary key default gen_random_uuid(),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- identity
  full_name                text not null check (length(trim(full_name)) between 2 and 120),
  display_name             text,
  email                    text not null,
  phone                    text,
  whatsapp                 text,
  profile_photo_path       text,
  bio                      text check (bio is null or length(bio) <= 800),

  -- placement
  city                     text,
  state                    text,
  country                  text not null default 'India',
  languages                text[] not null default '{}',

  -- categorisation
  primary_genre            text not null,
  secondary_genres         text[] not null default '{}',
  content_formats          text[] not null default '{}',

  -- handles
  instagram_handle         text,
  youtube_handle           text,
  tiktok_handle            text,
  x_handle                 text,
  linkedin_url             text,
  portfolio_url            text,

  -- self-reported reach
  instagram_followers      integer check (instagram_followers >= 0),
  youtube_subscribers      integer check (youtube_subscribers >= 0),
  tiktok_followers         integer check (tiktok_followers    >= 0),
  x_followers              integer check (x_followers         >= 0),
  avg_reel_views           integer check (avg_reel_views      >= 0),
  engagement_rate          numeric(5,2) check (engagement_rate between 0 and 100),

  -- verified reach - written by a sync job, never by the public form
  verified_instagram_followers integer check (verified_instagram_followers >= 0),
  verified_youtube_subscribers integer check (verified_youtube_subscribers >= 0),
  verified_engagement_rate     numeric(5,2) check (verified_engagement_rate between 0 and 100),
  verified_at                  timestamptz,

  -- audience make-up
  audience_female_pct      numeric(5,2) check (audience_female_pct between 0 and 100),
  audience_age_band        text,
  audience_top_cities      text[] not null default '{}',

  -- commercials (whole rupees)
  currency                 text not null default 'INR',
  rate_reel                integer check (rate_reel                >= 0),
  rate_story               integer check (rate_story               >= 0),
  rate_static_post         integer check (rate_static_post         >= 0),
  rate_youtube_integration integer check (rate_youtube_integration >= 0),
  rate_video               integer check (rate_video               >= 0),
  barter_open              boolean not null default false,

  past_brands              text[] not null default '{}',
  notable_work_urls        text[] not null default '{}',

  -- Cloudflare R2 object keys, not URLs. The public base URL is configuration
  -- (NEXT_PUBLIC_R2_PUBLIC_URL), so moving buckets or putting a custom domain
  -- in front never requires rewriting stored rows.
  showcase_media_paths     text[] not null default '{}',

  -- agency-internal, never exposed on the public form
  status                   creator_status not null default 'pending',
  internal_notes           text,
  quality_score            smallint check (quality_score between 1 and 5),
  managed_exclusively      boolean not null default false,

  -- anti-abuse
  submitted_ip             inet,
  submitted_user_agent     text,

  -- ----- derived ----------------------------------------------------------
  effective_followers integer generated always as (
    greatest(
      coalesce(verified_instagram_followers, instagram_followers, 0),
      coalesce(verified_youtube_subscribers, youtube_subscribers, 0),
      coalesce(tiktok_followers, 0),
      coalesce(x_followers, 0)
    )
  ) stored,

  effective_engagement_rate numeric(5,2) generated always as (
    coalesce(verified_engagement_rate, engagement_rate)
  ) stored,

  is_verified boolean generated always as (verified_at is not null) stored
);

-- Basic email sanity. Added separately so re-runs do not fail on the table.
do $$ begin
  alter table public.creators
    add constraint creators_email_format
    check (position('@' in email) > 1 and position('.' in split_part(email, '@', 2)) > 1);
exception when duplicate_object then null; end $$;

-- One row per email: a re-submission updates instead of duplicating.
--
-- Two constraints on purpose:
--   1. A plain UNIQUE on the column. `insert ... on conflict (email)` - which is
--      what supabase-js `upsert({ onConflict: 'email' })` emits - only matches a
--      constraint on the bare column. An expression index on lower(email) is
--      NOT matched, and the insert fails with 42P10.
--   2. The lower(email) index as a case-insensitive backstop, so a row written
--      directly against the database cannot sneak in a duplicate under a
--      different case. The app lowercases every email before it writes.
do $$ begin
  alter table public.creators add constraint creators_email_unique unique (email);
exception when duplicate_object or duplicate_table then null; end $$;

create unique index if not exists creators_email_key on public.creators (lower(email));

-- ---------------------------------------------------------------------------
-- Rename: "UGC creator" is called "creator" throughout (Aug 2026)
--
-- Renames rather than new columns, so no data moves and nothing is lost. Each
-- one is guarded, so this is a no-op on a database created after the rename and
-- on every re-run. It must sit above everything that reads the new names.
--
-- `alter type ... rename value` is allowed inside a DO block; only ADD VALUE is
-- not, which is why the 'model' label further down is a top-level statement.
-- ---------------------------------------------------------------------------
do $$ begin
  if exists (
    select 1 from pg_enum e
      join pg_type t on t.oid = e.enumtypid
     where t.typname = 'talent_type' and e.enumlabel = 'ugc_creator'
  ) then
    alter type talent_type rename value 'ugc_creator' to 'creator';
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'creators'
       and column_name = 'rate_ugc_video'
  ) then
    alter table public.creators rename column rate_ugc_video to rate_video;
  end if;

  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'creators'
       and column_name = 'ugc_turnaround_days'
  ) then
    alter table public.creators rename column ugc_turnaround_days to turnaround_days;
  end if;
end $$;

-- The content format was labelled "UGC / Ad Creative" and is stored as text in
-- an array, so the stored values are migrated too - otherwise a saved profile
-- would carry a label the form no longer offers.
update public.creators
   set content_formats = array_replace(content_formats, 'UGC / Ad Creative', 'Ad Creative')
 where content_formats @> array['UGC / Ad Creative'];

-- ---------------------------------------------------------------------------
-- Tier derived from effective_followers, so it can never drift out of sync
-- ---------------------------------------------------------------------------
create or replace function public.creator_tier(followers integer)
returns follower_tier language sql immutable as $fn$
  select case
    when followers is null or followers < 10000 then 'nano'::follower_tier
    when followers < 100000                     then 'micro'::follower_tier
    when followers < 500000                     then 'mid'::follower_tier
    when followers < 1000000                    then 'macro'::follower_tier
    else 'mega'::follower_tier
  end
$fn$;

-- ---------------------------------------------------------------------------
-- Full-text search across what a talent manager actually types
--
-- This is a plain column kept up to date by a trigger, NOT a generated column.
-- `array_to_string()` is marked stable rather than immutable (it depends on the
-- element type's output function), and Postgres rejects any stable function in
-- a generation expression with "generation expression is not immutable".
-- A trigger sidesteps the restriction entirely.
-- ---------------------------------------------------------------------------
alter table public.creators
  add column if not exists search_tsv tsvector;

-- R2 object keys for showcase photos/video (added after the initial release).
alter table public.creators
  add column if not exists showcase_media_paths text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- talent_type (added after the initial release)
--
-- Defaulting to 'influencer' is the backfill for every pre-existing row: the
-- roster was audience-led only until this column existed, so that is what those
-- rows are. The one signal already in the data is the content_formats array -
-- anyone who ticked the ad-creative format was telling us they also shoot for
-- the brand's own channels, so they are promoted to 'both'. Both spellings are
-- matched, because this backfill predates the rename above.
-- ---------------------------------------------------------------------------
-- The backfill sits inside the branch that creates the column so it runs
-- exactly once. Re-running this file must not undo a talent manager who has
-- since corrected somebody's type by hand.
do $$ begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'creators'
       and column_name  = 'talent_type'
  ) then
    alter table public.creators
      add column talent_type talent_type not null default 'influencer';

    update public.creators
       set talent_type = 'both'
     where content_formats && array['UGC / Ad Creative', 'Ad Creative'];
  end if;
end $$;

-- Turnaround, in days, for a content brief. Meaningless for a pure influencer,
-- so it is nullable rather than defaulted. Renamed from ugc_turnaround_days
-- above; this statement is what creates it on a fresh database.
alter table public.creators
  add column if not exists turnaround_days smallint
  check (turnaround_days is null or turnaround_days between 1 and 60);

-- ---------------------------------------------------------------------------
-- Filter indexes
-- ---------------------------------------------------------------------------
create index if not exists creators_status_idx     on public.creators (status);
create index if not exists creators_genre_idx      on public.creators (primary_genre);
create index if not exists creators_talent_idx     on public.creators (talent_type);
create index if not exists creators_city_idx       on public.creators (city);
create index if not exists creators_followers_idx  on public.creators (effective_followers desc);
create index if not exists creators_created_idx    on public.creators (created_at desc);
create index if not exists creators_sec_genres_idx on public.creators using gin (secondary_genres);
create index if not exists creators_languages_idx  on public.creators using gin (languages);
create index if not exists creators_name_trgm_idx  on public.creators using gin (full_name gin_trgm_ops);
create index if not exists creators_search_idx     on public.creators using gin (search_tsv);

-- ---------------------------------------------------------------------------
-- Keep updated_at and search_tsv current on every write
-- ---------------------------------------------------------------------------
create or replace function public.creators_before_write()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();

  new.search_tsv = to_tsvector('simple',
    coalesce(new.full_name, '')        || ' ' ||
    coalesce(new.display_name, '')     || ' ' ||
    coalesce(new.instagram_handle, '') || ' ' ||
    coalesce(new.youtube_handle, '')   || ' ' ||
    coalesce(new.tiktok_handle, '')    || ' ' ||
    coalesce(new.x_handle, '')         || ' ' ||
    coalesce(new.primary_genre, '')    || ' ' ||
    coalesce(new.talent_type::text, '') || ' ' ||
    coalesce(new.city, '')             || ' ' ||
    coalesce(new.state, '')            || ' ' ||
    coalesce(array_to_string(new.secondary_genres, ' '), '') || ' ' ||
    coalesce(array_to_string(new.past_brands, ' '), '')
  );

  return new;
end
$fn$;

-- Replaces the older updated_at-only trigger if it is still present.
drop trigger if exists creators_touch_updated_at on public.creators;
drop trigger if exists creators_before_write on public.creators;
create trigger creators_before_write
  before insert or update on public.creators
  for each row execute function public.creators_before_write();

-- Backfill search_tsv for any rows that predate the trigger.
update public.creators set updated_at = updated_at where search_tsv is null;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The public form inserts with the anon key, so anon gets INSERT and nothing
-- else. anon must NOT be able to read the roster back - that roster is the
-- agency's whole asset. Every read happens server-side with the service key,
-- which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.creators enable row level security;

drop policy if exists "anon can submit" on public.creators;
create policy "anon can submit"
  on public.creators for insert to anon, authenticated
  with check (true);

-- No select / update / delete policy for anon => denied by default. Intentional.

-- ---------------------------------------------------------------------------
-- Media
--
-- Files live in Cloudflare R2, not Supabase Storage. The browser uploads to R2
-- with a presigned URL from /api/upload and only the object key is stored here,
-- so there is no storage bucket or storage policy to create.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Models (added after the initial release)
--
-- A model is a fourth kind of talent, not a fourth genre: they are booked for
-- a day rather than for a post, so none of the reach columns above apply to
-- one. The label goes on the existing enum so a model is filtered, exported
-- and reviewed through exactly the same code path as everyone else.
--
-- This is a top-level statement on purpose. `alter type ... add value` cannot
-- run inside a function or a DO block - Postgres rejects it with "ALTER TYPE
-- ... ADD cannot be executed from a function".
-- ---------------------------------------------------------------------------
alter type talent_type add value if not exists 'model';

-- ---------------------------------------------------------------------------
-- model_profiles
--
-- One row per model, keyed on the creator it extends. A separate table rather
-- than fifteen more nullable columns on `creators`: none of these fields mean
-- anything for the other three talent types, and a measurement sitting empty
-- on every influencer row is how a schema starts rotting.
--
-- The primary key IS the foreign key, which makes this one-to-one - PostgREST
-- reads that and embeds it as an object rather than an array.
-- ---------------------------------------------------------------------------
create table if not exists public.model_profiles (
  talent_id        uuid primary key
                     references public.creators (id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- casting attributes
  height_cm        smallint check (height_cm between 120 and 220),
  bust_cm          smallint check (bust_cm  between 40 and 200),
  waist_cm         smallint check (waist_cm between 40 and 200),
  hips_cm          smallint check (hips_cm  between 40 and 200),
  dress_size       text check (dress_size is null or length(dress_size) <= 20),
  shoe_size        text check (shoe_size  is null or length(shoe_size)  <= 20),
  hair_colour      text check (hair_colour is null or length(hair_colour) <= 40),
  eye_colour       text check (eye_colour  is null or length(eye_colour)  <= 40),
  visible_tattoos  boolean not null default false,

  model_categories text[] not null default '{}',
  experience_level text check (experience_level in
                     ('new_face', 'intermediate', 'experienced', 'professional')),

  -- an existing exclusivity is the thing you must know before you pitch them
  agency_signed    boolean not null default false,
  agency_name      text check (agency_name is null or length(agency_name) <= 160),

  -- commercials, whole rupees
  rate_half_day    integer check (rate_half_day >= 0),
  rate_full_day    integer check (rate_full_day >= 0),
  travel_willing   boolean not null default false,
  buyout_terms     text check (buyout_terms is null or length(buyout_terms) <= 600)
);

create index if not exists model_profiles_height_idx   on public.model_profiles (height_cm);
create index if not exists model_profiles_day_rate_idx on public.model_profiles (rate_full_day);
create index if not exists model_profiles_cats_idx     on public.model_profiles using gin (model_categories);

create or replace function public.model_profiles_before_write()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end
$fn$;

drop trigger if exists model_profiles_before_write on public.model_profiles;
create trigger model_profiles_before_write
  before insert or update on public.model_profiles
  for each row execute function public.model_profiles_before_write();

-- Same rule as `creators`: the public form may insert, and nothing may read
-- back. Every read happens server-side with the service key, which bypasses
-- RLS entirely.
alter table public.model_profiles enable row level security;

drop policy if exists "anon can submit model profile" on public.model_profiles;
create policy "anon can submit model profile"
  on public.model_profiles for insert to anon, authenticated
  with check (true);

-- No select / update / delete policy for anon => denied by default. Intentional.

-- ---------------------------------------------------------------------------
-- Role lock (added after the initial release)
--
-- When somebody's talent_type was last set. The application refuses to move an
-- existing email to a different role until 60 days have passed, so the roster
-- cannot be churned by one person re-applying as an influencer on Tuesday and
-- a model on Thursday - which would make every filter lie.
--
-- Deliberately NOT enforced by a trigger: the agency has to stay able to
-- correct somebody's type by hand from the admin screen, and a trigger could
-- not tell that apart from a re-application. See lib/role-lock.ts.
--
-- Backfilled to created_at, so existing rows are treated as having chosen
-- their role when they first applied rather than all unlocking today.
-- ---------------------------------------------------------------------------
alter table public.creators
  add column if not exists talent_type_changed_at timestamptz;

update public.creators
   set talent_type_changed_at = created_at
 where talent_type_changed_at is null;

alter table public.creators
  alter column talent_type_changed_at set default now();
