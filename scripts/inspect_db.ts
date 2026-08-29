import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: sample } = await supabase.from('posts').select('*').limit(1);
  if (sample && sample[0]) {
    console.log('Columns in posts table:', Object.keys(sample[0]));
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, date, status')
    .eq('status', 'published');

  console.log(`Total published posts found: ${posts?.length}`);
  
  if (posts) {
    console.log('Sample dates in published posts:');
    posts.forEach(p => {
      console.log(`ID: ${p.id.slice(0,8)} | Date: "${p.date}" | Title: "${p.title.slice(0, 45)}"`);
    });
  }
}

main();
