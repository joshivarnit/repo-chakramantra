-- ==============================================================================
-- Chakramantra & ChakraChess: Comprehensive Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT,
    source_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning-fast article filtering & feeds
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_genre ON public.posts(genre);
CREATE INDEX IF NOT EXISTS idx_posts_source_url ON public.posts(source_url);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
CREATE POLICY "Public can view published posts"
    ON public.posts
    FOR SELECT
    USING (status = 'published');

-- Allow service role full access to manage posts (cron jobs, editor)
DROP POLICY IF EXISTS "Service role full access on posts" ON public.posts;
CREATE POLICY "Service role full access on posts"
    ON public.posts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 2. SUBSCRIBERS TABLE (Fixes PGRST205 error on /api/subscribe)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & public users to subscribe
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe"
    ON public.subscribers
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (true);

-- Allow service role to read and manage subscribers
DROP POLICY IF EXISTS "Service role full access on subscribers" ON public.subscribers;
CREATE POLICY "Service role full access on subscribers"
    ON public.subscribers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 3. FEED SOURCES TABLE (For Automated Editorial Ingestion)
CREATE TABLE IF NOT EXISTS public.feed_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feed_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read feed sources" ON public.feed_sources;
CREATE POLICY "Public can read feed sources"
    ON public.feed_sources
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Service role can manage feed sources" ON public.feed_sources;
CREATE POLICY "Service role can manage feed sources"
    ON public.feed_sources
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 4. CHESS GAMES ARCHIVE TABLE (Cloud Sync for ChakraChess)
CREATE TABLE IF NOT EXISTS public.chess_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pgn TEXT NOT NULL,
    fen TEXT,
    white TEXT DEFAULT 'Player',
    black TEXT DEFAULT 'Stockfish 16',
    result TEXT DEFAULT '*',
    moves_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chess_games_created ON public.chess_games(created_at DESC);

ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for games archive
DROP POLICY IF EXISTS "Public can view and save games" ON public.chess_games;
CREATE POLICY "Public can view and save games"
    ON public.chess_games
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);
