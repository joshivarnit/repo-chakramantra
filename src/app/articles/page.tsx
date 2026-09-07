import Link from "next/link";
import { Suspense } from "react";
import { User } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ArticlesFilter from "@/components/ArticlesFilter";
import { getPublishedGenres, getPublishedPosts } from "@/lib/db";
import { CHAKRA_TOPICS } from "@/lib/constants";
import { publicAuthor } from "@/lib/public-display";

export const metadata = {
  title: "Articles | Chakramantra Insights",
  description: "Browse all published articles and deep-dive analysis from Chakramantra.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; q?: string }>;
}) {
  const params = await searchParams;
  const genre = params.genre?.trim() || undefined;
  const query = params.q?.trim() || undefined;

  const [posts] = await Promise.all([
    getPublishedPosts({ genre, query }),
    getPublishedGenres(),
  ]);

  const displayGenres = [...CHAKRA_TOPICS].sort();

  return (
    <div className="flex min-h-screen flex-col bg-[#08080c] text-slate-100 selection:bg-purple-500 selection:text-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-white/5 py-16 md:py-20 bg-gradient-to-b from-[#08080c] via-[#0b0b12] to-[#08080c]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Editorial Archive
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
              Article <span className="text-gradient">Index</span>
            </h1>
            <p className="text-gray-300 max-w-2xl text-base sm:text-lg font-light">
              Independent analysis, technical deep-dives, and research on technology, science, and global dynamics.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <Suspense fallback={null}>
              <ArticlesFilter genres={displayGenres} currentGenre={genre} currentQuery={query} />
            </Suspense>

            {posts.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/30 border border-dashed border-white/10 py-20 text-center">
                <p className="text-gray-400 mb-4 text-base">No articles match your selected topic or query.</p>
                <Link href="/articles" className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-xl transition-all no-underline">
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group relative rounded-2xl glass-card p-6 flex flex-col justify-between overflow-hidden border border-white/5 hover:border-purple-500/40 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="inline-flex items-center rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
                          {post.genre}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{post.readTime}</span>
                      </div>

                      <Link href={`/post/${post.id}`} className="no-underline">
                        <h2 className="font-heading text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug mb-3">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-gray-300 text-sm line-clamp-3 mb-6 leading-relaxed">{post.summary}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <User className="h-3.5 w-3.5 text-purple-400" />
                        <span>{publicAuthor(post.author)}</span>
                      </div>
                      <time className="text-gray-500">{post.date}</time>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-10 text-center text-xs text-gray-500">
        © 2026 Chakramantra. All rights reserved.
      </footer>
    </div>
  );
}
