import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/db";
import { publicAuthor } from "@/lib/public-display";
import SiteHeader from "@/components/SiteHeader";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const author = publicAuthor(post.author);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 pb-24">
        <article className="container mx-auto px-4 max-w-3xl pt-12 lg:pt-20">
          <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            All articles
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-300">
                {post.genre}
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gradient inline-block">
              {post.title}
            </h1>

            <p className="text-xl text-foreground/70 mb-8 leading-relaxed">{post.summary}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold">
                  {author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{author}</div>
                  <div className="text-sm text-zinc-500">Chakramantra</div>
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
              </div>
            </div>
          </div>

          <div
            className="prose prose-invert max-w-none prose-headings:font-heading prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-accent prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </div>
  );
}
