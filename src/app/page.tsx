import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPostsByStatus } from "@/lib/db";
import { publicAuthor } from "@/lib/public-display";
import ChakraWheel from "@/components/ChakraWheel";
import NewsletterForm from "@/components/NewsletterForm";
import SiteHeader from "@/components/SiteHeader";
import ScrollWheelAnimation from "@/components/ScrollWheelAnimation";
import PublicApiScrollStream from "@/components/PublicApiScrollStream";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function Home() {
  const posts = await getPostsByStatus('published');

  return (
    <div className="flex min-h-screen flex-col bg-[#08080c] text-slate-100">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero 3D Scroll Wheel Section */}
        <ScrollWheelAnimation postIds={posts.map(p => p.id)} />

        {/* Latest Articles Section — Igloo Inc Minimalist Grid */}
        <section id="latest" className="py-24 relative border-t border-white/5 bg-[#08080c]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Editorial Feed
                </div>
                <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Latest Insights
                </h2>
                <p className="text-gray-400 text-sm md:text-base mt-2">
                  Deep dives on artificial intelligence, cosmology, geopolitics & technology.
                </p>
              </div>
              <Link 
                href="/articles" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all no-underline w-fit"
              >
                View all articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((post) => (
                <div 
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
                      <h3 className="font-heading text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-200 line-clamp-2 leading-snug mb-3">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 mt-auto font-medium">
                    <span className="text-gray-300">{publicAuthor(post.author)}</span>
                    <time className="text-gray-500">{post.date}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Public API Telemetry Scroll Stream */}
        <PublicApiScrollStream />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050508] py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 items-center">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl font-bold">
                  ☯
                </div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-white">Chakramantra</span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-6">
                Independent editorial platform exploring technological frontiers, science, and strategic dynamics.
              </p>
            </div>
            <div className="flex justify-center md:justify-end w-full">
              <NewsletterForm />
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© 2026 Chakramantra. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:text-gray-300 transition-colors">About</Link>
              <Link href="/chess" className="hover:text-purple-400 transition-colors">ChakraChess</Link>
              <Link href="/articles" className="hover:text-gray-300 transition-colors">Articles</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
