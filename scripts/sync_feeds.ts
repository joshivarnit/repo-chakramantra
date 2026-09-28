import { createClient } from "@supabase/supabase-js";
import { DEFAULT_FEED_SOURCES } from "../src/lib/feed-sources";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("Syncing default feed sources to Supabase...");
  
  const { data: existing, error: fetchErr } = await supabase.from("feed_sources").select("*");
  if (fetchErr) {
    console.error("Error reading feed_sources:", fetchErr);
    return;
  }

  console.log(`Found ${existing?.length || 0} existing feed sources in Supabase.`);

  // Remove deprecated feeds like ESPN and DD News if present
  const toDelete = (existing || []).filter(
    (f) => f.name === "ESPN" || f.category === "Sports" || f.name === "DD News"
  );
  if (toDelete.length > 0) {
    for (const d of toDelete) {
      await supabase.from("feed_sources").delete().eq("id", d.id);
      console.log(`Removed deprecated feed: ${d.name} (${d.category})`);
    }
  }

  const existingUrls = new Set((existing || []).map((f) => f.url));

  // Insert or update feeds
  for (const feed of DEFAULT_FEED_SOURCES) {
    if (!existingUrls.has(feed.url)) {
      const { error: insErr } = await supabase.from("feed_sources").insert([{
        url: feed.url,
        name: feed.name,
        category: feed.category,
        enabled: true
      }]);
      if (insErr) console.error(`Error inserting feed ${feed.name}:`, insErr.message);
      else console.log(`✓ Added feed for [${feed.category}]: ${feed.name}`);
    } else {
      // Ensure it is enabled and category matches
      await supabase.from("feed_sources").update({
        name: feed.name,
        category: feed.category,
        enabled: true
      }).eq("url", feed.url);
      console.log(`✓ Updated feed for [${feed.category}]: ${feed.name}`);
    }
  }

  const { data: finalFeeds } = await supabase.from("feed_sources").select("category, name, url, enabled");
  console.log(`\nFinal feed sources count in Supabase: ${finalFeeds?.length}`);
  console.table(finalFeeds);
}

main();
