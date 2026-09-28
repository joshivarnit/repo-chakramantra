import { createClient } from "@supabase/supabase-js";
import { CHAKRA_TOPICS } from "../src/lib/constants";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("=== COMPREHENSIVE CATEGORY VERIFICATION ===");
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, genre, status, date")
    .eq("status", "published");

  if (error) {
    console.error("Supabase query error:", error);
    process.exit(1);
  }

  const counts: Record<string, number> = {};
  const samples: Record<string, string> = {};

  for (const t of CHAKRA_TOPICS) {
    counts[t] = 0;
    samples[t] = "NONE";
  }

  for (const p of posts || []) {
    if (counts[p.genre] !== undefined) {
      counts[p.genre]++;
      if (samples[p.genre] === "NONE") {
        samples[p.genre] = p.title;
      }
    }
  }

  const results = CHAKRA_TOPICS.map((topic) => ({
    Category: topic,
    ArticlesCount: counts[topic],
    SampleArticle: samples[topic].slice(0, 50) + "..."
  }));

  console.table(results);

  const missing = CHAKRA_TOPICS.filter((t) => counts[t] === 0);
  if (missing.length === 0) {
    console.log("✅ ALL 24 CATEGORIES HAVE PUBLISHED ARTICLES! SUPABASE INTEGRITY VERIFIED.");
  } else {
    console.error("❌ FAILED: The following categories still have 0 articles:", missing);
    process.exit(1);
  }
}

main();
