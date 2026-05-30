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

-- 4. Create the subscribers table
create table public.subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable RLS for subscribers
alter table public.subscribers enable row level security;

-- 6. Create policies for subscribers
-- Allow anyone to insert an email
create policy "Anyone can subscribe"
  on public.subscribers for insert
  with check (true);

-- Allow authenticated users to read subscribers
create policy "Authenticated users can view subscribers"
  on public.subscribers for select
  to authenticated
  using (true);

-- 7. Editor allowlist (who may use /editor — add rows to invite collaborators)
create table public.editor_allowlist (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.editor_allowlist enable row level security;

-- No public access; the app checks this table with the service role key
create policy "No direct client access to editor allowlist"
  on public.editor_allowlist for all
  using (false)
  with check (false);

-- 8. RSS feed sources for the daily cron pipeline
create table public.feed_sources (
  id uuid default gen_random_uuid() primary key,
  url text not null unique,
  name text not null,
  category text not null default 'General',
  enabled boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feed_sources enable row level security;

create policy "Authenticated users can manage feed sources"
  on public.feed_sources for all
  to authenticated
  using (true)
  with check (true);

-- Seed default feeds (safe to re-run: ON CONFLICT DO NOTHING)
insert into public.feed_sources (url, name, category, enabled) values
  ('https://hnrss.org/frontpage', 'Hacker News', 'Technology', true),
  ('https://www.nature.com/nature.rss', 'Nature', 'Science', true),
  ('https://export.arxiv.org/rss/astro-ph', 'ArXiv Astrophysics', 'Science', true),
  ('https://export.arxiv.org/rss/cs', 'ArXiv Computer Science', 'Technology', true),
  ('https://news.google.com/rss/search?q=DD+News+India&hl=en-IN&gl=IN&ceid=IN:en', 'DD News', 'Geopolitics', true),
  ('http://feeds.bbci.co.uk/news/world/rss.xml', 'BBC World', 'Geopolitics', true),
  ('https://news.google.com/rss/search?q=Nvidia+OR+TSMC+OR+ASML+hardware&hl=en-US&gl=US&ceid=US:en', 'Global Hardware', 'Technology', true),
  ('https://www.espn.com/espn/rss/news', 'ESPN', 'Sports', true)
on conflict (url) do nothing;
