-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
-- Holds public user data synced from Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS) for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- LINKS TABLE
-- Stores links created by the extension (Boosted Links)
create table if not exists public.links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  original_url text,
  final_url text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  is_shortened boolean default false,
  is_qr boolean default false,
  click_count integer default 0, -- For future use if you track clicks via a redirector
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up RLS for Links
alter table public.links enable row level security;

create policy "Users can view their own links."
  on links for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own links."
  on links for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own links."
  on links for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own links."
  on links for delete
  using ( auth.uid() = user_id );

-- PAGE VIEWS TABLE (Optional: For the Tracking Script)
-- If you implement the tracking script to write to Supabase directly or via an Edge Function
create table if not exists public.page_views (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- Similar to "Property ID"
  url text not null,
  referrer text,
  user_agent text,
  session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.page_views enable row level security;

-- Only the user who owns the "site" (user_id) can view the analytics
create policy "Users can view their own page views."
  on page_views for select
  using ( auth.uid() = user_id );

-- Insert policy: strictly speaking, your tracking script needs a way to insert.
-- Usually this is done via a public anon key + RLS that allows insert but not select,
-- OR via an Edge Function. For simplicity, we allow anon insert if they know the user_id.
-- simpler approach for extension: authenticated only? No, script is public.
-- This part is tricky without a backend. For now, we provide the table.
