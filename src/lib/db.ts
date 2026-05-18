import { createClient } from './supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface Post {
  id: string;
  title: string;
  genre: string;
  summary: string;
  content: string;
  source: string;
  author: string;
  date: string;
  readTime: string;
  sourceUrl?: string;
  status: 'draft' | 'published' | 'rejected';
}

export async function getPostsByStatus(status: Post['status']): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', status)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  // Map snake_case to camelCase
  return (data || []).map(row => ({
    ...row,
    readTime: row.read_time
  })) as Post[];
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return undefined;
  }

  return {
    ...data,
    readTime: data.read_time
  } as Post;
}

export async function updatePostStatus(id: string, status: Post['status']): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('posts')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating post status:', error);
    throw error;
  }
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('posts')
    .update({
      title: updates.title,
      summary: updates.summary,
      content: updates.content,
      genre: updates.genre
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}


export async function insertDraft(post: Omit<Post, 'id'>): Promise<void> {
  // Use the service role key to bypass RLS for background tasks like cron jobs
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('posts')
    .insert([{
      title: post.title,
      genre: post.genre,
      summary: post.summary,
      content: post.content,
      source: post.source,
      author: post.author,
      date: post.date,
      read_time: post.readTime,
      source_url: post.sourceUrl,
      status: 'draft'
    }]);

  if (error) {
    console.error('Error inserting draft:', error);
    throw error;
  }
}

export async function hasArticleBeenProcessed(url: string): Promise<boolean> {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { count, error } = await supabaseAdmin
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('source_url', url);

  if (error) {
    console.error('Error checking if article processed:', error);
    return false; // Fail open to retry, or fail closed? Usually return false to retry.
  }

  return (count !== null && count > 0);
}

export async function publishOldestDrafts(limit: number): Promise<number> {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch the oldest drafts
  const { data: drafts, error: fetchError } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('status', 'draft')
    .order('date', { ascending: true })
    .limit(limit);

  if (fetchError) {
    console.error('Error fetching oldest drafts:', fetchError);
    return 0;
  }

  if (!drafts || drafts.length === 0) {
    return 0;
  }

  const draftIds = drafts.map(d => d.id);
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Update their status to published and update the date to today
  const { error: updateError } = await supabaseAdmin
    .from('posts')
    .update({ status: 'published', date: todayDate })
    .in('id', draftIds);

  if (updateError) {
    console.error('Error publishing drafts:', updateError);
    return 0;
  }

  return draftIds.length;
}

export async function insertSubscriber(email: string): Promise<void> {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('subscribers')
    .insert([{ email }]);

  // Ignore unique constraint violations (if they subscribe twice)
  if (error && error.code !== '23505') {
    console.error('Error inserting subscriber:', error);
    throw error;
  }
}
