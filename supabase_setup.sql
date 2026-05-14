-- Paste this entire block into the SQL Editor in your Supabase Dashboard and click "Run"

-- 1. Create the posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  genre text not null,
  summary text not null,
  content text not null,
  source text not null,
  author text not null,
  date text not null,
  read_time text not null,
  source_url text unique,
  status text not null default 'draft'
);

-- 2. Enable Row Level Security (RLS)
alter table public.posts enable row level security;

-- 3. Create policies
-- Allow anyone to read published posts
create policy "Public can view published posts"
  on public.posts for select
  using ( status = 'published' );

-- Allow authenticated users to do everything (CRUD)
create policy "Authenticated users can manage all posts"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);
