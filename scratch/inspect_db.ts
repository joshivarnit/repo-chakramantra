import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, date, created_at, status')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  console.log(`Total posts found in Supabase: ${posts.length}`);
  console.log('Sample posts:');
  posts.slice(0, 20).forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.status}] Date: "${p.date}" | Created: ${p.created_at} | Title: "${p.title.slice(0, 50)}"`);
  });
}

main();
