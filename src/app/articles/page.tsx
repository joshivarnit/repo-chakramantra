import Link from "next/link";
import { Suspense } from "react";
import { User } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ArticlesFilter from "@/components/ArticlesFilter";
import ChakraWheel from "@/components/ChakraWheel";
import { getPublishedGenres, getPublishedPosts } from "@/lib/db";
import { publicAuthor } from "@/lib/public-display";

export const metadata = {
  title: "Articles | Chakramantra",
  description: "Browse all published articles from Chakramantra.",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; q?: string }>;
}) {
  const params = await searchParams;
  const genre = params.genre?.trim() || undefined;
  const query = params.q?.trim() || undefined;

  const [posts, genres] = await Promise.all([
    getPublishedPosts({ genre, query }),
    getPublishedGenres(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-white/5 py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-gradient mb-4">
              Articles
            </h1>
            <p className="text-foreground/60 max-w-2xl text-lg">
              Original analysis and deep dives from the Chakramantra editorial team.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <Suspense fallback={null}>
              <ArticlesFilter genres={genres} currentGenre={genre} currentQuery={query} />
            </Suspense>

            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                <p className="text-foreground/50 mb-2">No articles match your filters.</p>
                <Link href="/articles" className="text-sm text-primary hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group relative rounded-2xl glass-card p-6 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {post.genre}
                        </span>
                        <span className="text-xs text-foreground/50">{post.readTime}</span>
                      </div>
                      <ChakraWheel size={56} topics={genres} />
                    </div>

                    <div className="relative z-10 flex-1">
                      <Link href={`/post/${post.id}`}>
                        <h2 className="font-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-foreground/70 text-sm line-clamp-3 mb-4">{post.summary}</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-xs text-foreground/50">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{publicAuthor(post.author)}</span>
                      </div>
                      <time>{post.date}</time>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-foreground/50">
        © 2026 Chakramantra. All rights reserved.
      </footer>
    </div>
  );
}
