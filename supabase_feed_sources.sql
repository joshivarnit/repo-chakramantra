-- Run this in Supabase SQL Editor if you already ran supabase_setup.sql before feed_sources existed.

create table if not exists public.feed_sources (
  id uuid default gen_random_uuid() primary key,
  url text not null unique,
  name text not null,
  category text not null default 'General',
  enabled boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feed_sources enable row level security;

drop policy if exists "Authenticated users can manage feed sources" on public.feed_sources;
create policy "Authenticated users can manage feed sources"
  on public.feed_sources for all
  to authenticated
  using (true)
  with check (true);

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
