import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/db";
import { publicAuthor } from "@/lib/public-display";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);
  if (!post) return { title: 'Article Not Found | Chakramantra' };
  return {
    title: `${post.title} | Chakramantra`,
    description: post.summary,
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const author = publicAuthor(post.author);

  return (
    <div className="flex min-h-screen flex-col bg-[#08080c] text-slate-100 selection:bg-purple-500 selection:text-white">
      <SiteHeader />

      <main className="flex-1 pb-24">
        <article className="container mx-auto px-4 max-w-4xl pt-12 lg:pt-16">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-purple-300 transition-colors mb-8 no-underline px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to article archive
          </Link>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
                {post.genre}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed font-light">{post.summary}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-white/10 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300">
                  {author.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{author}</div>
                  <div className="text-[11px] text-gray-500">Chakramantra Editorial</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  <time>{post.date}</time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="wysiwyg-editor"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <footer className="border-t border-white/5 py-10 text-center text-xs text-gray-500">
        © 2026 Chakramantra. All rights reserved.
      </footer>
    </div>
  );
}
