import { createClient } from "./supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export interface FeedSource {
  id: string;
  url: string;
  name: string;
  category: string;
  enabled: boolean;
  createdAt?: string;
}

export const DEFAULT_FEED_SOURCES: Omit<FeedSource, "id" | "createdAt">[] = [
  { url: "https://export.arxiv.org/rss/cs.AI", name: "ArXiv AI", category: "AI", enabled: true },
  { url: "https://www.eurekalert.org/rss/technology_engineering", name: "Automation News", category: "Automation", enabled: true },
  { url: "https://hnrss.org/frontpage", name: "Hacker News", category: "Tech", enabled: true },
  { url: "https://export.arxiv.org/rss/q-bio.NC", name: "ArXiv Neuroscience", category: "Neuroscience", enabled: true },
  { url: "https://www.computerworld.com/index.rss", name: "Computerworld", category: "IT", enabled: true },
  { url: "https://www.polygon.com/rss/index.xml", name: "Polygon", category: "Gaming", enabled: true },
  { url: "https://krebsonsecurity.com/feed/", name: "Krebs on Security", category: "Cybersec", enabled: true },
  { url: "https://export.arxiv.org/rss/cs.NI", name: "ArXiv Networking", category: "Networking", enabled: true },
  { url: "https://techcrunch.com/feed/", name: "TechCrunch", category: "Startups", enabled: true },
  { url: "https://export.arxiv.org/rss/astro-ph", name: "ArXiv Astrophysics", category: "Space", enabled: true },
  { url: "https://export.arxiv.org/rss/cs.RO", name: "ArXiv Robotics", category: "Robotics", enabled: true },
  { url: "https://export.arxiv.org/rss/quant-ph", name: "ArXiv Quantum", category: "Quantum", enabled: true },
  { url: "https://www.nature.com/nbt.rss", name: "Nature BioTech", category: "BioTech", enabled: true },
  { url: "https://www.smashingmagazine.com/feed/", name: "Smashing Magazine", category: "Design", enabled: true },
  { url: "https://export.arxiv.org/rss/cs.DB", name: "ArXiv Databases", category: "Data", enabled: true },
  { url: "https://plato.stanford.edu/rss/sep.xml", name: "Stanford Ethics", category: "Ethics", enabled: true },
  { url: "https://www.eff.org/rss/updates.xml", name: "EFF", category: "Privacy", enabled: true },
  { url: "https://www.nature.com/nature.rss", name: "Nature", category: "Science", enabled: true },
  { url: "https://www.wired.com/feed/rss", name: "Wired", category: "Future", enabled: true },
  { url: "https://cointelegraph.com/rss", name: "CoinTelegraph", category: "Web3", enabled: true },
  { url: "https://aws.amazon.com/about-aws/whats-new/recent/feed/", name: "AWS Cloud", category: "Cloud", enabled: true },
  { url: "https://saastr.com/feed/", name: "SaaStr", category: "SaaS", enabled: true },
  { url: "https://www.androidpolice.com/feed/", name: "Android Police", category: "Mobile", enabled: true },
  { url: "https://news.google.com/rss/search?q=Hardware&hl=en-US&gl=US&ceid=US:en", name: "Hardware News", category: "Hardware", enabled: true }
];

function mapRow(row: Record<string, unknown>): FeedSource {
  return {
    id: row.id as string,
    url: row.url as string,
    name: row.name as string,
    category: row.category as string,
    enabled: row.enabled as boolean,
    createdAt: row.created_at as string | undefined,
  };
}

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getAllFeedSources(): Promise<FeedSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feed_sources")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching feed sources:", error);
    return [];
  }

  return (data || []).map(mapRow);
}

export async function getActiveFeedSources(): Promise<FeedSource[]> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("feed_sources")
    .select("*")
    .eq("enabled", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching active feed sources:", error);
    return DEFAULT_FEED_SOURCES.map((s, i) => ({
      ...s,
      id: `default-${i}`,
    }));
  }

  if (!data || data.length === 0) {
    return DEFAULT_FEED_SOURCES.map((s, i) => ({
      ...s,
      id: `default-${i}`,
    }));
  }

  return data.map(mapRow);
}

export async function addFeedSource(input: {
  url: string;
  name: string;
  category: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("feed_sources").insert([
    {
      url: input.url.trim(),
      name: input.name.trim(),
      category: input.category.trim() || "General",
      enabled: true,
    },
  ]);

  if (error) {
    if (error.code === "23505") return { error: "This feed URL is already registered." };
    return { error: error.message };
  }

  return {};
}

export async function deleteFeedSource(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("feed_sources").delete().eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function setFeedSourceEnabled(
  id: string,
  enabled: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("feed_sources").update({ enabled }).eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function seedDefaultFeedSourcesIfEmpty(): Promise<void> {
  const supabase = adminClient();
  const { count, error: countError } = await supabase
    .from("feed_sources")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error checking feed_sources count:", countError);
    return;
  }

  if (count !== null && count > 0) return;

  const { error } = await supabase.from("feed_sources").insert(
    DEFAULT_FEED_SOURCES.map((s) => ({
      url: s.url,
      name: s.name,
      category: s.category,
      enabled: s.enabled,
    }))
  );

  if (error) console.error("Error seeding default feed sources:", error);
}
