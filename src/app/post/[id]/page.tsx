import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/db";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar (Simplified) */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/5 supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
            <span className="font-heading font-bold text-xl tracking-tight">Chakramantra</span>
          </Link>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
            <span className="font-heading font-bold tracking-tight">Chakramantra</span>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <article className="container mx-auto px-4 max-w-3xl pt-12 lg:pt-20">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-300">
                {post.genre}
              </span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gradient inline-block">
              {post.title}
            </h1>
            
            <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
              {post.summary}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{post.author}</div>
                  <div className="text-sm text-zinc-500">{post.source}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time>{post.date}</time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
                <button className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-2">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div 
            className="prose prose-invert max-w-none prose-headings:font-heading prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-accent prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Mock Advertisement Slot */}
        <div className="container mx-auto px-4 max-w-3xl mt-16">
          <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-400">
            Advertisement Space - Sponsored by Chakramantra Network
          </div>
        </div>
      </main>
    </div>
  );
}
